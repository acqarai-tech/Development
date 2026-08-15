"""
stage4_lookup_area_data.py — Stage 4, standalone
==================================================

CHANGE LOG (this version):
- avg_price_per_sqft (and bedroom_breakdown's avg_price_per_sqft) now
  computed here, once, in Python — not left for the LLM to convert in
  Stage 5. A calculated number the model does itself is exactly the kind
  of "fabricated ingredient" Stage 5's prompt already warns against, even
  when the underlying math is simple. SQM_TO_SQFT already existed in this
  file for get_recent_transactions(); reused here instead of duplicated
  (Section 5.4 habit #6).
- get_all_areas() — reads the "districts" table (397 real rows, confirmed
  via direct count(*) — the Supabase dashboard's row estimate for this
  table is stale and should not be trusted). This is the canonical area
  list per the architecture review's Section 5.5 guidance: chat's area
  coverage should resolve against one source of truth, not be inferred
  from what happens to exist in avm.
- get_district_properties() — reads "district_properties" (20,803 real
  rows, also confirmed via count(*) — nearly 30x the dashboard's stale
  694 estimate). Because some areas plausibly link to a large number of
  properties, this is capped with `limit` and returns the real total
  count alongside the (possibly partial) list, so Stage 5 can say
  "showing 50 of 214" honestly instead of silently truncating.
- get_price_trend() — new area_price_trend RPC (same pattern as the
  existing search_avm RPC: STABLE SQL function, grouped server-side so
  a 1.65M-row table is never aggregated client-side). Returns one row
  per sale_year with both price/sqm and price/sqft already computed.
"""

from clients import supabase, logger, normalize_area

SQM_TO_SQFT = 10.7639


def _bedroom_label_variants(bedrooms: int) -> list:
    """
    Real DLD data encodes the same bedroom count under several different
    text labels — confirmed live. Returns every known variant so a query
    doesn't silently miss real transactions recorded under a different
    label than expected.
    """
    if bedrooms == 0:
        return ["Studio", "0.0", "0"]
    return [f"{bedrooms} B/R", f"{bedrooms}.0", str(bedrooms)]


def _call_search_avm(area_pattern, room_types=None, row_limit=500, project_pattern=None,
                      area_exact=None, require_project=False):
    """
    Thin wrapper around the search_avm RPC function. Isolated in its own
    function so both lookup_area_data() and get_recent_transactions() can
    share it (Section 5.4 habit #6: no copy-pasted logic).

    area_exact: the same normalized area text already used to build
    area_pattern, passed separately so search_avm can try an exact
    (case-insensitive) match FIRST via a covering index before falling
    back to the slow ILIKE scan. Confirmed live: for areas where this
    hits (Business Bay, Burj Khalifa, JVC, etc. — anything in
    AREA_NAME_OVERRIDES or matching avm's real name outright), this is
    ~12x faster (1.3s vs ~17s) and was the actual fix for a real,
    repeatedly-timing-out production bug. When it doesn't hit (a genuine
    partial/novel area name), search_avm falls back to ILIKE exactly as
    before — this is purely additive, never a correctness risk.

    require_project: when True, only rows with a real project_name_en
    are returned. Used by get_recent_transactions()'s complete-data-
    preferring fetch — see that function's docstring.
    """
    return (
        supabase.rpc("search_avm", {
            "area_pattern": area_pattern,
            "room_types": room_types,
            "row_limit": row_limit,
            "project_pattern": project_pattern,
            "area_exact": area_exact,
            "require_project": require_project,
        })
        .execute()
    )


def _format_room_type(rooms_en):
    """
    Confirmed live: rooms_en is sometimes stored as a bare digit ('3',
    '4', '5') with no label, and displaying that raw in a Type column
    reads as meaningless to an investor. Normalizes to a clear label
    ('3 B/R', 'Studio'). Already-labeled values ('3 B/R') pass through
    unchanged — this only rewrites the bare-digit case.
    """
    if rooms_en is None:
        return None
    text = str(rooms_en).strip()
    if text in ("0", "0.0", "studio"):
        return "Studio"
    try:
        n = int(float(text))
        return f"{n} B/R"
    except (ValueError, TypeError):
        return text


def lookup_area_data(area, bedrooms=None):
    """
    Always looks up area-wide data. If `bedrooms` is given, ALSO looks up
    a bedroom-specific breakdown and includes it in the result — but only
    if real matching rows exist. If no bedroom-specific rows exist, the
    returned dict simply omits those fields, so build_answer()'s prompt
    (which is told to "look at what's actually in the data") correctly
    sees that no breakdown is available for this specific answer, rather
    than being told a blanket lie that it never exists at all.
    """
    normalized = normalize_area(area)
    if not normalized:
        logger.info("Stage 4 decided: no area text given, skipping lookup")
        return None

    try:
        result = _call_search_avm(f"%{normalized}%", room_types=None, row_limit=500, area_exact=normalized)
    except Exception as e:
        logger.error("Stage 4: search_avm lookup failed for %r: %s", normalized, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("Stage 4 decided: no rows found for %r", normalized)
        return None

    prices = [r["price_per_sqm"] for r in rows if r.get("price_per_sqm") is not None]
    worths = [r["actual_worth"] for r in rows if r.get("actual_worth") is not None]
    if not prices and not worths:
        logger.info("Stage 4 decided: rows found but no usable numeric data for %r", normalized)
        return None

    avg_price_per_sqm = round(sum(float(p) for p in prices) / len(prices)) if prices else None

    data = {
        "area": rows[0]["area_name_en"],
        "transaction_sample_size": len(rows),
        "avg_price_per_sqm": avg_price_per_sqm,
        "avg_price_per_sqft": round(avg_price_per_sqm / SQM_TO_SQFT) if avg_price_per_sqm else None,
        "avg_actual_worth": round(sum(float(w) for w in worths) / len(worths)) if worths else None,
        "most_recent_transaction_date": rows[0]["instance_date"],
    }

    # --- Bedroom-specific lookup (only if requested) ---
    if bedrooms is not None:
        variants = _bedroom_label_variants(bedrooms)
        try:
            bed_result = _call_search_avm(f"%{normalized}%", room_types=variants, row_limit=500,
                                           area_exact=normalized)
            bed_rows = bed_result.data or []
        except Exception as e:
            logger.error("Stage 4: bedroom-specific lookup failed for %r/%r: %s",
                         normalized, bedrooms, e)
            bed_rows = []

        if bed_rows:
            bed_prices = [r["price_per_sqm"] for r in bed_rows if r.get("price_per_sqm") is not None]
            bed_worths = [r["actual_worth"] for r in bed_rows if r.get("actual_worth") is not None]
            bed_sizes = [r["procedure_area"] for r in bed_rows if r.get("procedure_area") is not None]

            if bed_prices or bed_worths:
                bed_avg_ppsqm = round(sum(float(p) for p in bed_prices) / len(bed_prices)) if bed_prices else None
                data["bedroom_breakdown"] = {
                    "bedrooms": bedrooms,
                    "transaction_sample_size": len(bed_rows),
                    "avg_price_per_sqm": bed_avg_ppsqm,
                    "avg_price_per_sqft": round(bed_avg_ppsqm / SQM_TO_SQFT) if bed_avg_ppsqm else None,
                    "avg_actual_worth": round(sum(float(w) for w in bed_worths) / len(bed_worths)) if bed_worths else None,
                    "avg_size_sqm": round(sum(float(s) for s in bed_sizes) / len(bed_sizes), 1) if bed_sizes else None,
                }
                logger.info(
                    "Stage 4 decided: bedroom breakdown found for %r bedrooms=%s "
                    "sample_size=%d avg_actual_worth=%s",
                    normalized, bedrooms, len(bed_rows), data["bedroom_breakdown"]["avg_actual_worth"],
                )
            else:
                logger.info(
                    "Stage 4 decided: bedroom rows found but no usable numbers for %r bedrooms=%s",
                    normalized, bedrooms,
                )
        else:
            logger.info(
                "Stage 4 decided: no bedroom-specific rows for %r bedrooms=%s — "
                "returning area-wide data only",
                normalized, bedrooms,
            )

    # Habit #2: make this stage's decision visible while building.
    logger.info(
        "Stage 4 decided: area=%r sample_size=%d avg_price_per_sqm=%s avg_price_per_sqft=%s "
        "avg_actual_worth=%s has_bedroom_breakdown=%s",
        data["area"], data["transaction_sample_size"],
        data["avg_price_per_sqm"], data["avg_price_per_sqft"], data["avg_actual_worth"],
        "bedroom_breakdown" in data,
    )
    return data


def _rows_to_transactions(rows):
    """
    Converts raw search_avm rows into the transaction dict shape used
    throughout Stage 5. Pulled out of get_recent_transactions() so both
    the complete-data attempt and the mixed fallback (see below) can
    share it without duplicating the field mapping (Section 5.4 habit #6).
    """
    transactions = []
    for r in rows:
        size_sqm = r.get("procedure_area")
        price_per_sqm = r.get("price_per_sqm")
        transactions.append({
            "date": r.get("instance_date"),
            "type": _format_room_type(r.get("rooms_en")),
            "project": r.get("project_name_en") or None,
            "size_sqft": round(float(size_sqm) * SQM_TO_SQFT) if size_sqm is not None else None,
            "price_aed": round(float(r["actual_worth"])) if r.get("actual_worth") is not None else None,
            "psm_aed": round(float(price_per_sqm)) if price_per_sqm is not None else None,
            "psf_aed": round(float(price_per_sqm) / SQM_TO_SQFT) if price_per_sqm is not None else None,
        })
    return transactions


def get_recent_transactions(area, limit=10, project=None):
    """
    Fetches individual real transactions (not aggregated) — for questions
    like "show me the last 10 sales in JVC". Uses the same reliable
    search_avm RPC as lookup_area_data(), for the same reason: a plain
    .select() query is not reliably fast for every area.

    CHANGE LOG (this version):
    - BUG FIX, confirmed live: the transaction table's PSM column showed
      the SAME number for every row, despite real per-row price_per_sqm
      varying wildly (confirmed via direct query: 14,872 to 39,615
      AED/sqm across 10 real Dubai Islands sales). Root cause: an earlier
      prompt update added a "PSM (AED)" column to Stage 5's table format
      instructions, but this function never actually returned a psm_aed
      field — the model was asked to fill in a column with no real data
      behind it, so it invented a number and reused it. Fixed by adding
      psm_aed here, computed from the real price_per_sqm on each row.
    - "type" now goes through _format_room_type() — fixes a second live
      bug where rooms_en displayed as a bare digit ("3") with no label.
    - "project" (project_name_en) now included, and an optional `project`
      argument filters the search itself when the investor asked about a
      specific project. project_name_en is genuinely NULL for ~22% of
      avm rows (confirmed via direct count) — this is a real data gap,
      not a bug, so a missing project name is returned as None and
      displayed honestly (e.g. "—"), never guessed.
    - Now tries a complete-data-only fetch FIRST (require_project=True on
      the RPC) — real rows that happen to have a project recorded, still
      ordered by recency within that subset. Confirmed live this stays
      genuinely close to "recent" even for a sparse area (DAMAC Hills 2:
      only 3.3% of rows have a project, but the top 10 complete-only rows
      were still just 1-2 days older than the true most-recent sale).
      Only falls back to the original mixed fetch (real dashes for
      missing projects, honest low-coverage note in Stage 5) if the
      complete-only attempt can't fill the full requested count — never
      silently reaches arbitrarily far back in time to force a full list.
    """
    normalized = normalize_area(area)
    if not normalized:
        logger.info("get_recent_transactions: no area text given, skipping")
        return None

    project_pattern = f"%{project.strip()}%" if project and project.strip() else None

    # --- Attempt 1: complete-data-only (every row will have a project) ---
    try:
        complete_result = _call_search_avm(f"%{normalized}%", room_types=None, row_limit=limit,
                                            project_pattern=project_pattern, area_exact=normalized,
                                            require_project=True)
        complete_rows = complete_result.data or []
    except Exception as e:
        logger.warning("get_recent_transactions: complete-data fetch failed for %r: %s", normalized, e)
        complete_rows = []

    if len(complete_rows) >= limit:
        logger.info(
            "get_recent_transactions decided: area=%r project=%r used complete-data-only "
            "path, %d/%d rows with a project",
            normalized, project, len(complete_rows), limit,
        )
        return _rows_to_transactions(complete_rows)

    # --- Attempt 2: not enough complete rows exist — fall back to the ---
    # --- original mixed fetch (real, honest, dashes where missing) ---
    try:
        result = _call_search_avm(f"%{normalized}%", room_types=None, row_limit=limit,
                                   project_pattern=project_pattern, area_exact=normalized)
    except Exception as e:
        logger.error("get_recent_transactions: search_avm lookup failed for %r: %s", normalized, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_recent_transactions: no rows found for %r (project=%r)", normalized, project)
        return None

    logger.info(
        "get_recent_transactions decided: area=%r project=%r used mixed fallback (only %d/%d "
        "complete rows existed) -> returned %d real transactions",
        normalized, project, len(complete_rows), limit, len(rows),
    )
    return _rows_to_transactions(rows)


# ---------------------------------------------------------------------------
# NEW: get_all_areas() — backed by the "districts" table (397 real rows)
# ---------------------------------------------------------------------------
def get_all_areas():
    """
    districts is small (397 rows, confirmed via direct count — do not trust
    the Supabase dashboard's row estimate for this table) — a plain select
    is fine, no RPC needed. This is the canonical "what areas do we cover"
    answer, independent of what happens to have transactions in avm.
    """
    try:
        result = (
            supabase.table("districts")
            .select("district_code, district_name")
            .order("district_name")
            .execute()
        )
    except Exception as e:
        logger.error("get_all_areas: districts lookup failed: %s", e)
        return None

    rows = result.data or []
    logger.info("get_all_areas decided: returned %d areas", len(rows))
    return rows or None


# ---------------------------------------------------------------------------
# NEW: get_district_properties() — backed by "district_properties"
# (20,803 real rows — confirmed via direct count, not the dashboard's
# stale 694 estimate. Capped and honestly labeled, not silently truncated.)
# ---------------------------------------------------------------------------
def get_district_properties(area, limit=50):
    """
    Returns (properties, total_count) where `properties` is capped at
    `limit` real rows and `total_count` is the REAL total match count (via
    Supabase's count="exact"), so Stage 5 can say "showing 50 of 214"
    truthfully instead of pretending a capped list is the whole answer.
    Returns (None, 0) if no area given or nothing matches.
    """
    if not area or not area.strip():
        logger.info("get_district_properties: no area text given, skipping")
        return None, 0

    cleaned = area.strip()
    try:
        result = (
            supabase.table("district_properties")
            .select("property_name", count="exact")
            .ilike("district_name", f"%{cleaned}%")
            .limit(limit)
            .execute()
        )
    except Exception as e:
        logger.error("get_district_properties: lookup failed for %r: %s", cleaned, e)
        return None, 0

    rows = result.data or []
    total = result.count if result.count is not None else len(rows)
    if not rows:
        logger.info("get_district_properties: no properties found for %r", cleaned)
        return None, 0

    properties = [r["property_name"] for r in rows if r.get("property_name")]
    logger.info(
        "get_district_properties decided: area=%r returned %d of %d total properties",
        cleaned, len(properties), total,
    )
    return properties, total


# ---------------------------------------------------------------------------
# NEW: get_price_trend() — backed by the new area_price_trend RPC
# (see migration_area_price_trend.sql — same STABLE-SQL, server-side-
# aggregation pattern as the existing search_avm RPC, so a 1.65M-row
# table is never pulled client-side just to group it by year.)
# ---------------------------------------------------------------------------
def get_price_trend(area, bedrooms=None):
    """
    Returns a list of {year, avg_price_per_sqm, avg_price_per_sqft,
    transaction_count}, one entry per sale_year with real data, oldest
    first — this is both the numbers for Stage 5's summary bullet AND
    the exact shape the frontend needs to draw the year-over-year chart
    (returned separately as ChatResponse.chart_data in ai_chat.py).
    Returns None if no area given or nothing matches.
    """
    normalized = normalize_area(area)
    if not normalized:
        logger.info("get_price_trend: no area text given, skipping")
        return None

    room_types = _bedroom_label_variants(bedrooms) if bedrooms is not None else None

    try:
        result = (
            supabase.rpc("area_price_trend", {
                "area_pattern": f"%{normalized}%",
                "room_types": room_types,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_price_trend: area_price_trend lookup failed for %r: %s", normalized, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_price_trend: no trend rows found for %r", normalized)
        return None

    trend = []
    for r in rows:
        ppsqm = r.get("avg_ppsqm")
        ppsqm = float(ppsqm) if ppsqm is not None else None
        trend.append({
            "year": r.get("sale_year"),
            "avg_price_per_sqm": round(ppsqm) if ppsqm is not None else None,
            "avg_price_per_sqft": round(ppsqm / SQM_TO_SQFT) if ppsqm is not None else None,
            "transaction_count": r.get("tx_count"),
        })

    logger.info(
        "get_price_trend decided: area=%r returned %d years of data (%s -> %s)",
        normalized, len(trend), trend[0]["year"] if trend else None,
        trend[-1]["year"] if trend else None,
    )
    return trend

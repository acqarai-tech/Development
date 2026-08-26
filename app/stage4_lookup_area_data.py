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

from datetime import date, timedelta
import statistics

from clients import supabase, logger, normalize_area, display_area_name

SQM_TO_SQFT = 10.7639


def _exclude_outliers(values, min_sample=10, iqr_multiplier=1.5):
    """
    Closes T14 (architecture review issue #9), confirmed live: the
    headline "Real DLD Closed Sales" averages (avg_price_per_sqm,
    avg_actual_worth) previously had no protection at all — a single
    AED 1 typo or a AED 999,000,000 mis-keyed transaction would
    silently pull the average with it, and that average is what gets
    shown to an investor as fact.

    Standard 1.5x IQR fence (Tukey's method) — not a made-up threshold,
    the same convention used for real estate/financial outlier
    detection generally. Applied independently per metric (price_per_sqm
    and actual_worth are filtered separately, since a transaction can be
    a genuine outlier on one and perfectly normal on the other — e.g. a
    real, correctly-recorded large villa has a high actual_worth but an
    ordinary price_per_sqm).

    Never applied to a genuinely small sample — with fewer than
    min_sample real values, a normal range and a real outlier can't be
    told apart honestly. Same "too thin a sample" honesty guard already
    used server-side in service_charges_by_project (Section 5.4: decide
    the "nothing found"/"too thin to say" case as deliberately as the
    "found it" case). Below that threshold, every value passes through
    unfiltered and n_excluded is 0 — this function only ever REMOVES
    values, never invents or adjusts one.

    Returns (kept_values, n_excluded).
    """
    if len(values) < min_sample:
        return values, 0

    q1, _, q3 = statistics.quantiles(sorted(values), n=4)
    iqr = q3 - q1
    if iqr == 0:
        # Every value identical or near-identical (e.g. a project with
        # one fixed price point) -- nothing meaningfully "outside range"
        # to exclude.
        return values, 0

    lower_fence = q1 - iqr_multiplier * iqr
    upper_fence = q3 + iqr_multiplier * iqr
    kept = [v for v in values if lower_fence <= v <= upper_fence]
    return kept, len(values) - len(kept)


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
                      area_exact=None, require_project=False, require_rooms=False):
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

    require_project / require_rooms: when True, only rows with a real
    project_name_en / rooms_en (respectively) are returned. Used by
    get_recent_transactions()'s complete-data-preferring fetch — see
    that function's docstring.
    """
    return (
        supabase.rpc("search_avm", {
            "area_pattern": area_pattern,
            "room_types": room_types,
            "row_limit": row_limit,
            "project_pattern": project_pattern,
            "area_exact": area_exact,
            "require_project": require_project,
            "require_rooms": require_rooms,
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


def _compute_recent_liquidity(rows, window_days=90, max_sample=15):
    """
    Real liquidity / market-pace signal, computed from rows the caller
    ALREADY fetched (search_avm and search_avm_by_project both
    `ORDER BY instance_date DESC`) — no extra network call needed.

    Closes the seller-framing gap in the doc's own §3.4 table: "what
    should I list at, and how fast will it move?" avm only has
    instance_date (when a sale actually CLOSED), never a listing date —
    so a true "days on market" figure CANNOT be computed from this data.
    That's a real data gap, not a wiring gap, and this function does not
    pretend otherwise: it returns how many of this area/project's real
    sales happened in the most recent window_days (relative to the most
    recent transaction on record, not today's date, so a dataset that
    hasn't been refreshed recently doesn't silently look inactive) —
    a genuine liquidity/pace signal, never dressed up as a per-unit
    time-to-sell estimate. USER_TYPE_FRAMING["seller"] is explicit about
    this distinction; keep it that way if this function is ever
    referenced from a prompt.

    CHANGE LOG (this version):
    - Confirmed-live product ask: a bare "16 transactions in the last 90
      days" bullet reads as an unverifiable claim to an investor — they
      want to see the real sales behind it, not just be told a count.
      Now also returns "sample_transactions": the real rows inside the
      same window, most-recent-first, capped at max_sample so a
      high-volume area/project doesn't render a huge table. Reuses
      _rows_to_transactions (defined later in this module — fine, since
      this function is only ever called at request time, well after
      module load) for the exact same field mapping already proven in
      get_recent_transactions() — same psm-per-row fix, same
      _format_room_type() label normalization — so nothing about how a
      transaction is displayed diverges between this path and the
      existing "show me recent sales" path (Section 5.4 habit #6).
    """
    parsed = []
    for r in rows:
        raw = r.get("instance_date")
        if not raw:
            continue
        if isinstance(raw, date):
            d = raw
        else:
            try:
                d = date.fromisoformat(str(raw)[:10])
            except ValueError:
                continue
        parsed.append((d, r))

    if not parsed:
        return None

    dates = [d for d, _ in parsed]
    most_recent = max(dates)
    cutoff = most_recent - timedelta(days=window_days)

    # rows arrives already ORDER BY instance_date DESC (both search_avm
    # and search_avm_by_project sort server-side), and parsed preserves
    # that same order, so window_rows below is already most-recent-first
    # with no extra sort needed.
    window_rows = [r for d, r in parsed if d >= cutoff]
    count_in_window = len(window_rows)

    # Honesty check: search_avm/search_avm_by_project cap at 500 rows.
    # If EVERY fetched row (all the way back to the 500th, the oldest
    # one available) still falls inside the window, a very high-volume
    # area could have more real sales in this window than we ever
    # fetched — the true count could be higher than what's reported
    # here. If the window boundary was reached before hitting the row
    # cap, the count is exact and complete regardless of total
    # historical volume, since everything older than the boundary was
    # correctly excluded, not just unfetched.
    is_lower_bound = count_in_window == len(rows) == len(dates)

    # Confirmed-live product ask: a sample row with no project name
    # recorded (shown as "—") reads as broken to an investor, even
    # though every other field on it is real. Rather than taking the
    # top max_sample most-recent rows regardless of completeness, prefer
    # rows that have a real project_name_en, drawn from the FULL window
    # pool (which can be far larger than max_sample) — only falls back
    # to an incomplete row if fewer than max_sample complete ones exist
    # in the whole window. Order is still most-recent-first within each
    # group, since window_rows already arrives sorted that way.
    complete_window_rows = [r for r in window_rows if r.get("project_name_en")]
    if len(complete_window_rows) >= max_sample:
        sample_source = complete_window_rows[:max_sample]
    else:
        incomplete_window_rows = [r for r in window_rows if not r.get("project_name_en")]
        sample_source = complete_window_rows + incomplete_window_rows[:max_sample - len(complete_window_rows)]
    sample_transactions = _rows_to_transactions(sample_source)

    return {
        "transactions_last_90_days": count_in_window,
        "as_of": most_recent.isoformat(),
        "is_lower_bound": is_lower_bound,
        "sample_transactions": sample_transactions,
    }


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

    clean_prices, n_price_outliers = _exclude_outliers([float(p) for p in prices])
    clean_worths, n_worth_outliers = _exclude_outliers([float(w) for w in worths])
    avg_price_per_sqm = round(sum(clean_prices) / len(clean_prices)) if clean_prices else None

    data = {
        "area": display_area_name(area),
        "transaction_sample_size": len(rows),
        "avg_price_per_sqm": avg_price_per_sqm,
        "avg_price_per_sqft": round(avg_price_per_sqm / SQM_TO_SQFT) if avg_price_per_sqm else None,
        "avg_actual_worth": round(sum(clean_worths) / len(clean_worths)) if clean_worths else None,
        "most_recent_transaction_date": rows[0]["instance_date"],
    }
    if n_price_outliers or n_worth_outliers:
        data["n_outliers_excluded"] = max(n_price_outliers, n_worth_outliers)
        logger.info(
            "Stage 4 decided: excluded %d price outlier(s) and %d worth outlier(s) for %r "
            "before averaging (T14, IQR fence)",
            n_price_outliers, n_worth_outliers, normalized,
        )
    liquidity = _compute_recent_liquidity(rows)
    if liquidity:
        data["recent_liquidity"] = liquidity

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
                clean_bed_prices, n_bed_price_outliers = _exclude_outliers([float(p) for p in bed_prices])
                clean_bed_worths, n_bed_worth_outliers = _exclude_outliers([float(w) for w in bed_worths])
                bed_avg_ppsqm = round(sum(clean_bed_prices) / len(clean_bed_prices)) if clean_bed_prices else None
                bed_avg_size_sqm = round(sum(float(s) for s in bed_sizes) / len(bed_sizes), 1) if bed_sizes else None
                data["bedroom_breakdown"] = {
                    "bedrooms": bedrooms,
                    "transaction_sample_size": len(bed_rows),
                    "avg_price_per_sqm": bed_avg_ppsqm,
                    "avg_price_per_sqft": round(bed_avg_ppsqm / SQM_TO_SQFT) if bed_avg_ppsqm else None,
                    "avg_actual_worth": round(sum(clean_bed_worths) / len(clean_bed_worths)) if clean_bed_worths else None,
                    "avg_size_sqm": bed_avg_size_sqm,
                    "avg_size_sqft": round(bed_avg_size_sqm * SQM_TO_SQFT) if bed_avg_size_sqm else None,
                }
                if n_bed_price_outliers or n_bed_worth_outliers:
                    data["bedroom_breakdown"]["n_outliers_excluded"] = max(n_bed_price_outliers, n_bed_worth_outliers)
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


def _call_search_avm_by_project(project_pattern, project_exact=None, room_types=None, row_limit=500):
    """
    Thin wrapper around the search_avm_by_project RPC — mirrors
    _call_search_avm's structure exactly, but keyed on project_name_en
    instead of area_name_en. Fixes a confirmed live gap: every other
    lookup in this file required an area to be given at all — a project
    named alone ("tell me about Binghatti Aquarise", no area mentioned)
    returned nothing, not because the data didn't exist, but because
    nothing ever tried searching by project alone. Backed by its own
    trigram + lower()-covering indexes on project_name_en (same pattern
    as area_name_en's — added because none existed at all before this).
    """
    return (
        supabase.rpc("search_avm_by_project", {
            "project_pattern": project_pattern,
            "project_exact": project_exact,
            "room_types": room_types,
            "row_limit": row_limit,
        })
        .execute()
    )


def lookup_project_data(project, bedrooms=None):
    """
    Aggregate lookup keyed on project alone — no area required. Mirrors
    lookup_area_data()'s shape/logic exactly, just via
    _call_search_avm_by_project instead of _call_search_avm, so a plain
    "tell me about Binghatti Aquarise" (no explicit "show me
    transactions" ask) still gets a real, grounded answer instead of the
    honest no-data fallback it got before this fix.
    """
    if not project or not project.strip():
        logger.info("lookup_project_data: no project text given, skipping")
        return None
    cleaned = project.strip()

    try:
        result = _call_search_avm_by_project(f"%{cleaned}%", project_exact=cleaned, row_limit=500)
    except Exception as e:
        logger.error("lookup_project_data: search_avm_by_project failed for %r: %s", cleaned, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("lookup_project_data: no rows found for %r", cleaned)
        return None

    prices = [r["price_per_sqm"] for r in rows if r.get("price_per_sqm") is not None]
    worths = [r["actual_worth"] for r in rows if r.get("actual_worth") is not None]
    if not prices and not worths:
        logger.info("lookup_project_data: rows found but no usable numeric data for %r", cleaned)
        return None

    clean_prices, n_price_outliers = _exclude_outliers([float(p) for p in prices])
    clean_worths, n_worth_outliers = _exclude_outliers([float(w) for w in worths])
    avg_price_per_sqm = round(sum(clean_prices) / len(clean_prices)) if clean_prices else None

    data = {
        "project": rows[0]["project_name_en"],
        "area": rows[0]["area_name_en"],  # bonus context — which area this project is in
        "transaction_sample_size": len(rows),
        "avg_price_per_sqm": avg_price_per_sqm,
        "avg_price_per_sqft": round(avg_price_per_sqm / SQM_TO_SQFT) if avg_price_per_sqm else None,
        "avg_actual_worth": round(sum(clean_worths) / len(clean_worths)) if clean_worths else None,
        "most_recent_transaction_date": rows[0]["instance_date"],
    }
    if n_price_outliers or n_worth_outliers:
        data["n_outliers_excluded"] = max(n_price_outliers, n_worth_outliers)
        logger.info(
            "lookup_project_data decided: excluded %d price outlier(s) and %d worth outlier(s) "
            "for %r before averaging (T14, IQR fence)",
            n_price_outliers, n_worth_outliers, cleaned,
        )
    liquidity = _compute_recent_liquidity(rows)
    if liquidity:
        data["recent_liquidity"] = liquidity

    if bedrooms is not None:
        variants = _bedroom_label_variants(bedrooms)
        try:
            bed_result = _call_search_avm_by_project(f"%{cleaned}%", project_exact=cleaned,
                                                       room_types=variants, row_limit=500)
            bed_rows = bed_result.data or []
        except Exception as e:
            logger.error("lookup_project_data: bedroom-specific lookup failed for %r/%r: %s",
                         cleaned, bedrooms, e)
            bed_rows = []

        if bed_rows:
            bed_prices = [r["price_per_sqm"] for r in bed_rows if r.get("price_per_sqm") is not None]
            bed_worths = [r["actual_worth"] for r in bed_rows if r.get("actual_worth") is not None]
            bed_sizes = [r["procedure_area"] for r in bed_rows if r.get("procedure_area") is not None]
            if bed_prices or bed_worths:
                clean_bed_prices, n_bed_price_outliers = _exclude_outliers([float(p) for p in bed_prices])
                clean_bed_worths, n_bed_worth_outliers = _exclude_outliers([float(w) for w in bed_worths])
                bed_avg_ppsqm = round(sum(clean_bed_prices) / len(clean_bed_prices)) if clean_bed_prices else None
                bed_avg_size_sqm = round(sum(float(s) for s in bed_sizes) / len(bed_sizes), 1) if bed_sizes else None
                data["bedroom_breakdown"] = {
                    "bedrooms": bedrooms,
                    "transaction_sample_size": len(bed_rows),
                    "avg_price_per_sqm": bed_avg_ppsqm,
                    "avg_price_per_sqft": round(bed_avg_ppsqm / SQM_TO_SQFT) if bed_avg_ppsqm else None,
                    "avg_actual_worth": round(sum(clean_bed_worths) / len(clean_bed_worths)) if clean_bed_worths else None,
                    "avg_size_sqm": bed_avg_size_sqm,
                    "avg_size_sqft": round(bed_avg_size_sqm * SQM_TO_SQFT) if bed_avg_size_sqm else None,
                }
                if n_bed_price_outliers or n_bed_worth_outliers:
                    data["bedroom_breakdown"]["n_outliers_excluded"] = max(n_bed_price_outliers, n_bed_worth_outliers)

    logger.info(
        "lookup_project_data decided: project=%r area=%r sample_size=%d avg_price_per_sqm=%s",
        data["project"], data["area"], data["transaction_sample_size"], data["avg_price_per_sqm"],
    )
    return data


def get_area_projects(area, limit=50):
    """
    Real, transaction-backed project list for an area — ranked by
    transaction volume. NOT the same as get_district_properties()
    below, and this distinction is the actual fix for a confirmed live
    bug: district_properties (a curated building/property directory) and
    avm's real project_name_en data are almost completely different
    lists for the same area. Checked JVC directly: district_properties
    returns "Al Yousuf Towers," "Al Maali Complex" — none of which
    appear anywhere in avm's real top JVC projects ("Auresta Tower" with
    1,021 real sales, "Serenz by Danube" with 823). An investor asking
    "what projects are in JVC" wants THIS list. Product decision
    (confirmed live 2026-08-19): projects with zero real transactions
    are excluded entirely, not shown as a "0" row.
    """
    normalized = normalize_area(area)
    if not normalized:
        logger.info("get_area_projects: no area text given, skipping")
        return None

    try:
        result = (
            supabase.rpc("list_area_projects", {
                "area_pattern": f"%{normalized}%",
                "area_exact": normalized,
                "row_limit": limit,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_area_projects: list_area_projects failed for %r: %s", normalized, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_area_projects: no projects found for %r", normalized)
        return None

    projects = []
    for r in rows:
        avg_ppsqm = r.get("avg_ppsqm")
        transaction_count = r.get("transaction_count") or 0
        if transaction_count == 0:
            continue
        projects.append({
            "project": r.get("project_name_en"),
            "transaction_count": transaction_count,
            "avg_price_per_sqm": round(float(avg_ppsqm)) if avg_ppsqm is not None else None,
            "avg_price_per_sqft": round(float(avg_ppsqm) / SQM_TO_SQFT) if avg_ppsqm is not None else None,
        })

    if not projects:
        logger.info("get_area_projects: all matches had zero transactions for %r, treating as no data", normalized)
        return None

    logger.info("get_area_projects decided: area=%r returned %d real projects", normalized, len(projects))
    return projects


# ---------------------------------------------------------------------------
# NEW: get_area_developers() — backed by the new list_area_developers RPC.
# Closes a confirmed-live gap: "tell the developers in JVC" had no
# matching question_type at all before this session — it was silently
# misclassified as area_report, dropping "developers" entirely and
# returning an unrelated price snapshot. Distinct from
# get_developer_projects() (which needs a specific NAMED developer) and
# get_area_projects() (about the projects, not who built them).
# ---------------------------------------------------------------------------
def get_area_developers(area, limit=20):
    """
    Real developers with real dld_projects entries in the given area,
    ranked by real avm transaction activity. developer_id is resolved
    the same way as get_developer_projects() (direct id, falling back to
    developer_number for legacy-sourced rows) so a follow-up
    get_developer_info() call ties to the exact same legal entities.
    Returns None if the area has no dld_projects entries at all —
    confirmed live this is a genuine data gap for some areas (JVC has
    zero dld_projects rows under any spelling), not just a naming
    mismatch, so the honest answer is "no developer data for this area
    yet," never a fabricated list.
    """
    normalized = normalize_area(area)
    if not normalized:
        logger.info("get_area_developers: no area text given, skipping")
        return None

    try:
        result = (
            supabase.rpc("list_area_developers", {
                "area_pattern": f"%{normalized}%",
                "area_exact": normalized,
                "row_limit": limit,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_area_developers: list_area_developers failed for %r: %s", normalized, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_area_developers: no developers found for %r", normalized)
        return None

    developers = []
    for r in rows:
        avg_ppsqm = r.get("avg_ppsqm")
        transaction_count = r.get("transaction_count") or 0
        # Product decision: zero-transaction rows are excluded from this
        # ranked list entirely, never shown as a "0" row. (Different from
        # the RPC layer, which still returns the real zero-transaction
        # rows honestly — filtering happens here, not by faking the SQL.)
        if transaction_count == 0:
            continue
        developers.append({
            "developer": r.get("developer_name"),
            "developer_id": r.get("developer_id"),
            "project_count": r.get("project_count") or 0,
            "transaction_count": transaction_count,
            "avg_price_per_sqm": round(float(avg_ppsqm)) if avg_ppsqm is not None else None,
            "avg_price_per_sqft": round(float(avg_ppsqm) / SQM_TO_SQFT) if avg_ppsqm is not None else None,
        })

    if not developers:
        logger.info("get_area_developers: all matches had zero transactions for %r, treating as no data", normalized)
        return None

    logger.info("get_area_developers decided: area=%r returned %d real developers", normalized, len(developers))
    return developers


def get_developer_projects(developer, limit=50):
    """
    Real developer -> projects -> transactions lookup (Beta v2). Confirmed
    live: dld_projects has 3,240 real projects, with a developer_name and
    project_name column but no direct link to avm's transaction data —
    joined here by project name (the RPC's ILIKE fallback covers
    non-exact matches). Product decision (confirmed live 2026-08-19):
    projects with zero real avm transactions are excluded entirely, not
    shown as a "0" row — filtered in Python below, not faked in SQL.
    """
    if not developer or not developer.strip():
        logger.info("get_developer_projects: no developer text given, skipping")
        return None
    cleaned = developer.strip()

    try:
        result = (
            supabase.rpc("list_developer_projects", {
                "developer_pattern": f"%{cleaned}%",
                "developer_exact": cleaned,
                "row_limit": limit,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_developer_projects: list_developer_projects failed for %r: %s", cleaned, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_developer_projects: no projects found for %r", cleaned)
        return None

    projects = []
    for r in rows:
        avg_ppsqm = r.get("avg_ppsqm")
        transaction_count = r.get("transaction_count") or 0
        if transaction_count == 0:
            continue
        projects.append({
            "project": r.get("project_name"),
            "area": r.get("area_en"),
            "status": r.get("project_status"),
            "transaction_count": transaction_count,
            "avg_price_per_sqm": round(float(avg_ppsqm)) if avg_ppsqm is not None else None,
            "avg_price_per_sqft": round(float(avg_ppsqm) / SQM_TO_SQFT) if avg_ppsqm is not None else None,
            "developer_id": r.get("developer_id"),
        })

    if not projects:
        logger.info("get_developer_projects: all matches had zero transactions for %r, treating as no data", cleaned)
        return None

    logger.info("get_developer_projects decided: developer=%r returned %d real projects", cleaned, len(projects))
    return projects


# ---------------------------------------------------------------------------
# NEW: get_developer_info() — backed by the new developers_by_id RPC.
# Closes Part Two, issue #10 (P2) of the DLD reference pack: `developers`
# (2,317 rows, Dataset 21) had never been queried anywhere in the app.
#
# Takes developer_ids (plural), not a developer name: confirmed live, a
# brand like "Damac" corresponds to dozens of separately-registered DLD
# legal entities, each with its own license. Rather than guess which one
# an investor means with a second, independent name search, the caller
# passes the EXACT developer_id(s) already resolved by
# get_developer_projects() — same entity the projects came from,
# guaranteed, not a coincidentally-similar one.
# ---------------------------------------------------------------------------
def get_developer_info(developer_ids):
    """
    developer_ids: a list of ints (developer_id values), typically the
    distinct set already present in get_developer_projects()' results.
    Returns a list of dicts, one per matched legal entity — deliberately
    NOT a single dict, since a brand name can legitimately span several
    real entities and picking just one would misrepresent the others.
    Returns None if developer_ids is empty/None or nothing matches.
    """
    ids = [i for i in (developer_ids or []) if i is not None]
    if not ids:
        logger.info("get_developer_info: no developer_ids given, skipping")
        return None

    try:
        result = supabase.rpc("developers_by_id", {"ids": ids}).execute()
    except Exception as e:
        logger.error("get_developer_info: developers_by_id lookup failed for %r: %s", ids, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_developer_info: no developers table match for ids=%r", ids)
        return None

    today = date.today()
    entities = []
    for r in rows:
        expiry = r.get("license_expiry_date")
        is_expired = None
        if expiry:
            try:
                is_expired = date.fromisoformat(expiry) < today
            except (TypeError, ValueError):
                is_expired = None
        entities.append({
            "developer_id": r.get("developer_id"),
            "developer_name": r.get("developer_name_en"),
            "legal_status": r.get("legal_status_en"),
            "license_type": r.get("license_type_en"),
            "license_number": r.get("license_number"),
            "license_expiry_date": expiry,
            "is_license_expired": is_expired,
            "registration_date": r.get("registration_date"),
        })

    logger.info("get_developer_info decided: ids=%r returned %d matched legal entities", ids, len(entities))
    return entities


def lookup_comparison_data(area, area2, bedrooms=None):
    """
    Genuine two-area comparison (Beta v2, T2). Calls lookup_area_data()
    for BOTH areas independently — each side gets exactly the same real,
    honest treatment as a normal single-area lookup (including its own
    bedroom breakdown if requested). Returns None only if NEITHER side
    has data; if only one side resolves, returns that side alone with a
    clear marker so Stage 5 can say so honestly instead of pretending
    both sides were compared.

    BUG FIX (confirmed live, screenshot): when one side had no data,
    the raw None used to go straight into the comparison list — by the
    time _format_comparison_table tried to label that column, the name
    the investor actually asked about ("Sobha Hartland") was already
    lost, so it fell back to a generic "Option 2". That name is known
    right here, before lookup_area_data's result collapses it to None —
    so a missing side is now a small marker dict ({"area": area_name,
    "no_data": True}) instead of a bare None, keeping the real name
    visible while still being unambiguous that there's no data behind
    it (fmt()'s existing None-checks in the formatter already handle a
    dict with no metric keys correctly — no formatter change needed
    beyond reading the name).
    """
    if not area or not area2:
        logger.info("lookup_comparison_data: need two areas, got area=%r area2=%r", area, area2)
        return None

    data1 = lookup_area_data(area, bedrooms=bedrooms)
    data2 = lookup_area_data(area2, bedrooms=bedrooms)

    if data1 is None and data2 is None:
        logger.info("lookup_comparison_data: no data for either %r or %r", area, area2)
        return None

    logger.info(
        "lookup_comparison_data decided: area=%r found=%s area2=%r found=%s",
        area, data1 is not None, area2, data2 is not None,
    )
    entry1 = data1 if data1 is not None else {"area": area, "no_data": True}
    entry2 = data2 if data2 is not None else {"area": area2, "no_data": True}
    return {"comparison": [entry1, entry2]}


def lookup_project_comparison_data(project, project2, bedrooms=None):
    """
    Closes the developer §3.4 gap: "absorption and pricing vs. named
    competitors" had no way to compare two SPECIFIC named projects —
    "comparison" only ever supported area-vs-area. Exact same pattern as
    lookup_comparison_data() above, just keyed on lookup_project_data()
    instead — no new RPC needed, each side gets the same real, honest
    single-project lookup treatment (including its own bedroom breakdown
    and now recent_liquidity, same as any other project lookup). Returns
    None only if NEITHER project resolves; one resolving alone is
    returned honestly rather than a fabricated two-sided comparison.

    Same name-preservation fix as lookup_comparison_data above (see its
    docstring) — a missing side keeps its requested project name via a
    {"project": ..., "no_data": True} marker instead of losing it to a
    bare None.
    """
    if not project or not project2:
        logger.info("lookup_project_comparison_data: need two projects, got project=%r project2=%r",
                     project, project2)
        return None

    data1 = lookup_project_data(project, bedrooms=bedrooms)
    data2 = lookup_project_data(project2, bedrooms=bedrooms)

    if data1 is None and data2 is None:
        logger.info("lookup_project_comparison_data: no data for either %r or %r", project, project2)
        return None

    logger.info(
        "lookup_project_comparison_data decided: project=%r found=%s project2=%r found=%s",
        project, data1 is not None, project2, data2 is not None,
    )
    entry1 = data1 if data1 is not None else {"project": project, "no_data": True}
    entry2 = data2 if data2 is not None else {"project": project2, "no_data": True}
    return {"comparison": [entry1, entry2]}


def get_top_areas(metric="volume", year=None, limit=10):
    """
    "Top N areas by X" ranking — e.g. "top 10 selling areas in 2026",
    "most expensive areas to buy in", "cheapest areas for a first
    investment". Confirmed real: verified against actual 2026 avm data
    before building this (Madinat Al Mataar: 14,505 real transactions,
    the genuine #1 by volume; Mohammed Bin Rashid City: 187,699 AED/sqm
    real average, the genuine #1 by price).

    metric: "volume" (most transactions — the default, and the most
    common real meaning of "top selling areas"), "price_high" (most
    expensive), or "price_low" (cheapest). price_high/price_low apply a
    minimum transaction-count floor server-side (min_transactions=10) so
    a single outlier sale in a near-empty area can't claim the #1 spot —
    a "top expensive area" with one lucky sale isn't a real signal.

    year: defaults to the current real calendar year if not given —
    never guessed or hardcoded, always computed from the actual current
    date so this doesn't go stale.
    """
    year = year or date.today().year
    limit = limit or 10

    rpc_name = {
        "volume": "top_areas_by_volume",
        "price_high": "top_areas_by_price",
        "price_low": "top_areas_by_price_asc",
    }.get(metric, "top_areas_by_volume")

    params = {"target_year": year, "row_limit": limit}
    if rpc_name != "top_areas_by_volume":
        params["min_transactions"] = 10

    try:
        result = supabase.rpc(rpc_name, params).execute()
    except Exception as e:
        logger.error("get_top_areas: %s failed for year=%r metric=%r: %s", rpc_name, year, metric, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_top_areas: no rows for year=%r metric=%r", year, metric)
        return None

    ranked = []
    for r in rows:
        avg_ppsqm = r.get("avg_ppsqm")
        ranked.append({
            "area": r.get("area_name_en"),
            "transaction_count": r.get("tx_count"),
            "avg_price_per_sqm": round(float(avg_ppsqm)) if avg_ppsqm is not None else None,
            "avg_price_per_sqft": round(float(avg_ppsqm) / SQM_TO_SQFT) if avg_ppsqm is not None else None,
        })

    logger.info(
        "get_top_areas decided: metric=%r year=%r returned %d real areas, #1=%r",
        metric, year, len(ranked), ranked[0]["area"] if ranked else None,
    )
    return {"metric": metric, "year": year, "ranked_areas": ranked}


def _get_top_ranked(rpc_prefix, key_name, metric, year, limit):
    """
    Shared implementation behind get_top_projects() and
    get_top_developers() — same shape as get_top_areas(), just generic
    over which RPC family and which key the raw rows come back under, so
    the actual ranking logic (year default, RPC selection, min_transactions
    guard, row shaping) isn't duplicated three times (Section 5.4 habit
    #6). key_name is the raw column name each RPC returns
    (e.g. "project_name_en" or "developer_name") — kept as a parameter
    since projects and developers don't share a column name.
    """
    year = year or date.today().year
    limit = limit or 10

    rpc_name = {
        "volume": f"{rpc_prefix}_by_volume",
        "price_high": f"{rpc_prefix}_by_price",
    }.get(metric, f"{rpc_prefix}_by_volume")

    params = {"target_year": year, "row_limit": limit}
    if rpc_name != f"{rpc_prefix}_by_volume":
        params["min_transactions"] = 10

    try:
        result = supabase.rpc(rpc_name, params).execute()
    except Exception as e:
        logger.error("_get_top_ranked: %s failed for year=%r metric=%r: %s", rpc_name, year, metric, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("_get_top_ranked: no rows for %s year=%r metric=%r", rpc_name, year, metric)
        return None

    ranked = []
    for r in rows:
        avg_ppsqm = r.get("avg_ppsqm")
        ranked.append({
            "name": r.get(key_name),
            "transaction_count": r.get("tx_count"),
            "avg_price_per_sqm": round(float(avg_ppsqm)) if avg_ppsqm is not None else None,
            "avg_price_per_sqft": round(float(avg_ppsqm) / SQM_TO_SQFT) if avg_ppsqm is not None else None,
        })

    logger.info(
        "_get_top_ranked decided: %s metric=%r year=%r returned %d rows, #1=%r",
        rpc_prefix, metric, year, len(ranked), ranked[0]["name"] if ranked else None,
    )
    return {"metric": metric, "year": year, "ranked": ranked}


def get_top_projects(metric="volume", year=None, limit=10):
    """
    "Top N projects by X" — e.g. "top selling projects in 2026", "most
    expensive projects". Direct against avm's real transacted project
    names — no join needed, unlike developer ranking below. price_low
    isn't offered here (only volume/price_high) since "cheapest project"
    isn't a real investor question shape the way "cheapest area" is —
    project price variation is about unit mix, not the project itself
    being priced low; kept out to avoid a misleading ranking.
    """
    result = _get_top_ranked("top_projects", "project_name_en", metric, year, limit)
    if not result:
        return None
    return {"metric": result["metric"], "year": result["year"], "ranked_projects": result["ranked"]}


def get_top_developers(metric="volume", year=None, limit=10):
    """
    "Top N developers by X" — e.g. "top developers in 2026", "which
    developer sold the most". Real join between dld_projects (developer
    -> project) and avm (project -> real transactions), same join
    already proven correct in get_developer_projects().
    """
    result = _get_top_ranked("top_developers", "developer_name", metric, year, limit)
    if not result:
        return None
    return {"metric": result["metric"], "year": result["year"], "ranked_developers": result["ranked"]}


def get_market_overview(year=None):
    """
    Citywide, no-entity-named market snapshot — for general pricing
    questions like "what's the average price in Dubai right now" that
    don't name any area/project/developer at all. Confirmed real: 2026
    so far has 226,361 real transactions city-wide, averaging 22,210
    AED/sqm.
    """
    year = year or date.today().year
    try:
        result = supabase.rpc("market_overview", {"target_year": year}).execute()
    except Exception as e:
        logger.error("get_market_overview: failed for year=%r: %s", year, e)
        return None

    rows = result.data or []
    if not rows or not rows[0].get("tx_count"):
        logger.info("get_market_overview: no rows for year=%r", year)
        return None

    row = rows[0]
    avg_ppsqm = row.get("avg_ppsqm")
    data = {
        "year": year,
        "transaction_count": row.get("tx_count"),
        "avg_price_per_sqm": round(float(avg_ppsqm)) if avg_ppsqm is not None else None,
        "avg_price_per_sqft": round(float(avg_ppsqm) / SQM_TO_SQFT) if avg_ppsqm is not None else None,
        "avg_actual_worth": round(float(row["avg_worth"])) if row.get("avg_worth") is not None else None,
    }

    # A no-area "guide me" question deserves more than three citywide
    # averages — reuse get_top_areas() (already proven correct and
    # already deterministic-table-formatted elsewhere) so the investor
    # also sees WHERE the real activity actually is, not just what the
    # average unit costs. Best-effort: if the ranking RPC has a problem,
    # the three core averages above are still real and still returned —
    # this never blocks or fails the whole overview.
    top = get_top_areas(metric="volume", year=year, limit=8)
    if top:
        data["top_areas"] = top["ranked_areas"]

    logger.info("get_market_overview decided: year=%r tx_count=%s avg_ppsqm=%s top_areas=%d",
                year, data["transaction_count"], data["avg_price_per_sqm"], len(data.get("top_areas") or []))
    return data


def get_budget_area_recommendations(budget, limit=6):
    """
    "I have AED 600,000. Which areas should I consider?" -- closes a
    confirmed-live bug: this question had no dedicated route at all, so
    it fell through to get_market_overview()'s citywide-average path.
    That was honest (never fabricated a number) but useless -- it told
    the investor what the AVERAGE Dubai property costs (~3.4M / 22,210
    AED/sqm), never which real, DLD-transacted areas their actual
    budget could reach.

    Real GROUP-BY-area aggregation against avm (min/median/avg worth,
    avg price_per_sqm, and what fraction of that area's real
    transactions actually happened at or under the stated budget),
    computed in Postgres via budget_area_recommendations RPC -- same
    "let the database do the aggregation" pattern as get_top_areas(),
    not 1.79M rows pulled into Python.

    HAVING min(actual_worth) <= budget is enforced in the RPC itself,
    so an area only appears here if at least one real transaction on
    record actually happened at or below the investor's budget -- never
    an area whose cheapest real sale still exceeds it (zero-transaction-
    rule discipline, same as everywhere else in this file). Ranked by
    how much of that area's real activity is actually within budget,
    not by price alone -- an area averaging 1.5M with a real 450k sale
    on record is a genuinely different answer than one averaging 2.5M
    with a 2.1M floor, even though both technically have "some" sales.

    DATA-QUALITY FIX baked into the RPC itself (found while verifying
    this against real data, see the RPC's own migration comment for the
    full story): raw avm includes Land and Building sales alongside
    individual Unit/Villa sales, and a small number of non-arm's-length
    transfers recorded at nominal value (as low as AED 1) -- both would
    silently corrupt a budget ranking (a land parcel prices completely
    differently per sqm than a home, and a single AED-1 gift transfer
    could make an unaffordable area falsely qualify). The RPC restricts
    to property_type_en IN ('Unit','Villa') with a real actual_worth
    floor; this Python function just consumes its already-clean output.
    """
    if not budget or budget <= 0:
        logger.info("get_budget_area_recommendations: no usable budget given, skipping")
        return None

    try:
        result = supabase.rpc("budget_area_recommendations", {
            "target_budget": budget,
            "row_limit": limit,
        }).execute()
    except Exception as e:
        logger.error("get_budget_area_recommendations: RPC failed for budget=%r: %s", budget, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info(
            "get_budget_area_recommendations: no areas have a real transaction at or "
            "under budget=%r -- returning None so Stage 5 gives the honest "
            "budget-specific fallback, not a misleading match",
            budget,
        )
        return None

    areas = []
    for r in rows:
        avg_ppsqm = r.get("avg_ppsqm")
        under_pct = r.get("under_budget_pct")
        areas.append({
            "area": r["area_name_en"],
            "transaction_count": r["tx_count"],
            "avg_price_aed": round(float(r["avg_worth"])) if r.get("avg_worth") is not None else None,
            "median_price_aed": round(float(r["median_worth"])) if r.get("median_worth") is not None else None,
            "min_price_aed": round(float(r["min_worth"])) if r.get("min_worth") is not None else None,
            "avg_price_per_sqm": round(float(avg_ppsqm)) if avg_ppsqm is not None else None,
            "avg_price_per_sqft": round(float(avg_ppsqm) / SQM_TO_SQFT) if avg_ppsqm is not None else None,
            "transactions_under_budget": r.get("under_budget_count"),
            "pct_transactions_under_budget": float(under_pct) if under_pct is not None else None,
        })

    logger.info(
        "get_budget_area_recommendations decided: budget=%r returned %d areas, top=%r "
        "(%s%% of its real transactions at or under budget)",
        budget, len(areas), areas[0]["area"], areas[0]["pct_transactions_under_budget"],
    )
    return {"budget": budget, "areas": areas}


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


def _get_recent_transactions_by_project_only(project: str, limit: int):
    """
    Project-only transaction fetch — no area required. Uses
    search_avm_by_project (its own exact-match-first / ILIKE-fallback
    RPC, backed by dedicated indexes on project_name_en, same pattern as
    the area-based one). Kept as a single fetch rather than the
    area-based function's two-attempt "prefer complete rows" strategy —
    a single project's own transactions are inherently a much narrower,
    already-specific set, so that extra complexity isn't needed here.
    """
    try:
        result = _call_search_avm_by_project(f"%{project}%", project_exact=project, row_limit=limit)
    except Exception as e:
        logger.error("get_recent_transactions: search_avm_by_project failed for %r: %s", project, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_recent_transactions: no rows found for project=%r (no area given)", project)
        return None

    logger.info(
        "get_recent_transactions decided: project=%r (no area given) returned %d real transactions",
        project, len(rows),
    )
    return _rows_to_transactions(rows)


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
    - Now tries a complete-data-only fetch FIRST (require_project=True,
      require_rooms=True on the RPC) — real rows that happen to have
      BOTH a project and a room type recorded, still ordered by
      recency within that subset. Confirmed live this stays genuinely
      close to "recent" even for a sparse area (DAMAC Hills 2: only
      3.3% of rows have a project, but the top 10 complete-only rows
      were still just 1-2 days older than the true most-recent sale).
      Only falls back to the original mixed fetch (real dashes for
      missing fields, honest low-coverage note in Stage 5) if the
      complete-only attempt can't fill the full requested count — never
      silently reaches arbitrarily far back in time to force a full list.
    """
    normalized = normalize_area(area)
    if not normalized:
        # Confirmed live gap, now fixed: previously this returned None
        # immediately whenever area was missing, even when a project WAS
        # given — "recent transactions for Binghatti Aquarise" (no area
        # named) got nothing, purely because nothing tried searching by
        # project alone. If there's a project to search by, use the
        # dedicated project-only path instead of giving up here.
        if project and project.strip():
            return _get_recent_transactions_by_project_only(project.strip(), limit)
        logger.info("get_recent_transactions: no area text given, skipping")
        return None

    project_pattern = f"%{project.strip()}%" if project and project.strip() else None

    # --- Attempt 1: complete-data-only (every row will have both a project AND a room type) ---
    try:
        complete_result = _call_search_avm(f"%{normalized}%", room_types=None, row_limit=limit,
                                            project_pattern=project_pattern, area_exact=normalized,
                                            require_project=True, require_rooms=True)
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

    CHANGE LOG: confirmed live, this RPC could take 16+ seconds for a
    large area (Business Bay) via the plain ILIKE path — the planner
    kept preferring a full-table scan over the area-specific index, the
    same class of bug already fixed for search_avm. Fixed by passing
    area_exact through (the RPC itself was rebuilt to try an exact match
    first, same pattern as search_avm) — confirmed live this drops
    Business Bay's trend query from 16.4s to ~1.2s.
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
                "area_exact": normalized,
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


# ---------------------------------------------------------------------------
# NEW: get_rental_yield() — backed by the new rental_yield_by_area RPC
# (see migration_rental_yield_by_area.sql — same exact-match-first,
# ILIKE-fallback pattern as get_price_trend()/search_avm.)
#
# Closes Part Two, issue #15 (P1) of the DLD reference pack: rentals now
# has 320,664 real rows (loaded 2026-08-18), but until this function
# nothing in the pipeline queried it — every "roi"-classified question
# fell through to the default area/project lookup and got real SALE
# price data with no rental data behind it at all.
# ---------------------------------------------------------------------------
def get_rental_yield(area, bedrooms=None):
    """
    Returns {avg_annual_rent, avg_rent_per_sqm, contract_count,
    most_recent_contract_start} for the given area, or None if no area
    given or no matching rent contracts exist. This is the RENTAL side
    only — no yield percentage here, since that also needs a SALE price
    (from avm, a different table). The caller (ai_chat.py's routing)
    combines this with lookup_area_data()'s avg_price_per_sqm to compute
    gross_yield_pct — kept out of this function so it stays a single-
    responsibility Stage 4 lookup, same as every other function in this
    file.

    `bedrooms` is accepted for interface symmetry with lookup_area_data()
    and get_price_trend() but not yet used to filter — rentals'
    ejari_property_sub_type_en carries a bedroom-like label but its real
    value set hasn't been confirmed live against _bedroom_label_variants()
    yet. Left as a documented no-op rather than guessed at (Section 5.4:
    never fabricate a filter that hasn't been confirmed against real data).
    """
    normalized = normalize_area(area)
    if not normalized:
        logger.info("get_rental_yield: no area text given, skipping")
        return None

    try:
        result = (
            supabase.rpc("rental_yield_by_area", {
                "area_pattern": f"%{normalized}%",
                "area_exact": normalized,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_rental_yield: rental_yield_by_area lookup failed for %r: %s", normalized, e)
        return None

    rows = result.data or []
    if not rows or rows[0].get("contract_count") in (None, 0):
        logger.info("get_rental_yield: no rent contracts found for %r", normalized)
        return None

    row = rows[0]
    avg_annual_rent = row.get("avg_annual_rent")
    avg_rent_per_sqm = row.get("avg_rent_per_sqm")

    data = {
        "avg_annual_rent": round(float(avg_annual_rent)) if avg_annual_rent is not None else None,
        "avg_rent_per_sqm": round(float(avg_rent_per_sqm)) if avg_rent_per_sqm is not None else None,
        "contract_count": row.get("contract_count"),
        "most_recent_contract_start": row.get("most_recent_contract_start"),
    }

    logger.info(
        "get_rental_yield decided: area=%r contract_count=%d avg_annual_rent=%s avg_rent_per_sqm=%s",
        normalized, data["contract_count"], data["avg_annual_rent"], data["avg_rent_per_sqm"],
    )
    return data


# ---------------------------------------------------------------------------
# NEW: get_unit_inventory() — backed by the new unit_inventory_by_project
# RPC. Closes the "unit-count / inventory questions" P2 gap: unclear
# whether the app could answer real unit-count questions (Sobha SkyParks
# example). registered_real_estate_units (1,787,223 rows, Dataset 01)
# gives the REAL registered unit count per project, broken down by room
# type — distinct from and more complete than counting avm transactions
# (which only shows units that have sold, not a project's true total
# inventory).
# ---------------------------------------------------------------------------
def get_unit_inventory(project):
    """
    Returns a list of {rooms, property_sub_type, unit_count} dicts for a
    real project, e.g. [{"rooms": "Studio", "property_sub_type": "Flat",
    "unit_count": 446}, ...]. Freehold units only — see the RPC's own
    docstring for why that's the right investor-facing default. Returns
    None if no project text given or no matching units exist.
    """
    if not project or not project.strip():
        logger.info("get_unit_inventory: no project text given, skipping")
        return None
    cleaned = project.strip()

    try:
        result = (
            supabase.rpc("unit_inventory_by_project", {
                "project_pattern": f"%{cleaned}%",
                "project_exact": cleaned,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_unit_inventory: unit_inventory_by_project failed for %r: %s", cleaned, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_unit_inventory: no registered units found for %r", cleaned)
        return None

    inventory = [{
        "rooms": r.get("rooms_en"),
        "property_sub_type": r.get("property_sub_type_en"),
        "unit_count": r.get("unit_count") or 0,
    } for r in rows]

    logger.info(
        "get_unit_inventory decided: project=%r returned %d rows, total units=%d",
        cleaned, len(inventory), sum(i["unit_count"] for i in inventory),
    )
    return inventory


# ---------------------------------------------------------------------------
# NEW: get_sale_index() — direct table query, no custom RPC needed since
# residential_sale_index is only 159 rows. Closes the "no market-index
# feature" P2 gap: this is DLD's own published Residential Sale Price
# Index (Dataset 12) — a completely different, authoritative thing from
# get_price_trend() above, which just averages this app's own avm
# transactions by year. This is DLD's real published methodology.
#
# CONFIRMED LIVE, IMPORTANT: the most recent row in this table is
# 2024-05-01 — the DLD source itself hasn't been updated more recently
# than that (checked directly, not an artifact of this app's load). This
# function always returns the true max available date so Stage 5 can
# honestly label it "as of <date>" rather than implying it's current.
# ---------------------------------------------------------------------------
def get_sale_index(property_type="all", months=24):
    """
    Returns {"property_type": ..., "as_of": "YYYY-MM-DD" (latest month in
    the data), "series": [{"month": ..., "index": ..., "price_index":
    ...}, ...]} in chronological (oldest-first) order, same convention as
    get_price_trend(). property_type must be "all", "flat", or "villa" —
    anything else is treated as "all" rather than guessed at or silently
    dropped. Returns None only if the table itself is unreachable/empty
    (confirmed live it always has 159 real rows today).
    """
    valid_types = {"all", "flat", "villa"}
    ptype = property_type if property_type in valid_types else "all"
    index_col = f"{ptype}_monthly_index"
    price_col = f"{ptype}_monthly_price_index"

    try:
        result = (
            supabase.table("residential_sale_index")
            .select(f"first_date_of_month, {index_col}, {price_col}")
            .order("first_date_of_month", desc=True)
            .limit(months)
            .execute()
        )
    except Exception as e:
        logger.error("get_sale_index: residential_sale_index query failed for property_type=%r: %s", ptype, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_sale_index: no rows returned for property_type=%r", ptype)
        return None

    # rows arrived most-recent-first (for the LIMIT to grab the right
    # window); reverse to chronological order for display, matching
    # get_price_trend()'s convention.
    rows = list(reversed(rows))
    series = []
    for r in rows:
        idx = r.get(index_col)
        price_idx = r.get(price_col)
        series.append({
            "month": r.get("first_date_of_month"),
            "index": round(float(idx), 3) if idx is not None else None,
            "price_index": round(float(price_idx)) if price_idx is not None else None,
        })

    data = {
        "property_type": ptype,
        "as_of": series[-1]["month"] if series else None,
        "series": series,
    }

    logger.info(
        "get_sale_index decided: property_type=%r returned %d months, as_of=%s",
        ptype, len(series), data["as_of"],
    )
    return data


# ---------------------------------------------------------------------------
# NEW: get_valuation_stats() — backed by the new property_valuations_by_area
# RPC. Closes "valuation claim thinly backed" (P2): the product's own
# user-submitted `valuations` table has 3 rows; property_valuations
# (90,422 rows, Dataset 03) gives real DLD valuation procedure records.
# ---------------------------------------------------------------------------
def get_valuation_stats(area, property_type="Unit"):
    """
    Returns {avg_actual_worth, avg_property_total_value, valuation_count,
    most_recent_valuation} for the given area, or None if no area given
    or no matching valuation records exist. property_type defaults to
    "Unit" — see the RPC's own docstring for why mixing Unit/Land/Building
    would be meaningless (confirmed live: ~500x difference in Business Bay
    alone).
    """
    normalized = normalize_area(area)
    if not normalized:
        logger.info("get_valuation_stats: no area text given, skipping")
        return None

    try:
        result = (
            supabase.rpc("property_valuations_by_area", {
                "area_pattern": f"%{normalized}%",
                "area_exact": normalized,
                "property_type": property_type,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_valuation_stats: property_valuations_by_area failed for %r: %s", normalized, e)
        return None

    rows = result.data or []
    if not rows or rows[0].get("valuation_count") in (None, 0):
        logger.info("get_valuation_stats: no valuation records found for %r", normalized)
        return None

    row = rows[0]
    avg_worth = row.get("avg_actual_worth")
    avg_total = row.get("avg_property_total_value")

    data = {
        "avg_actual_worth": round(float(avg_worth)) if avg_worth is not None else None,
        "avg_property_total_value": round(float(avg_total)) if avg_total is not None else None,
        "valuation_count": row.get("valuation_count"),
        "most_recent_valuation": row.get("most_recent_valuation"),
    }

    logger.info(
        "get_valuation_stats decided: area=%r valuation_count=%d avg_actual_worth=%s",
        normalized, data["valuation_count"], data["avg_actual_worth"],
    )
    return data


def get_service_charges(project, usage="Residential", year=None):
    """
    Closes the highest-value finding from the coverage audit: DLD
    Dataset 25 (owners_association_charges, 89,125 rows) was fully
    loaded and completely unused. A prior session answered "why are my
    service charges high" with a general-knowledge legal chunk purely
    because no real data path existed -- it existed the whole time.

    CRITICAL: this table's real grain is NOT "one row = one project's
    service charge." service_cost is a PER-CATEGORY, PER-PROPERTY-GROUP
    line item (Maintenance, Insurance, Reserved Fund, etc. -- averages
    ~8 categories per property group). Confirmed live before building
    this: naively averaging or summing raw service_cost rows for a
    project produces nonsense (a blind sum across "International City
    Emarati"'s 1,872 rows -- actually 233 different property groups --
    gives 2,223, meaningless). The real per-property-group total is
    SUM(service_cost) WITHIN one property_group_id; the project-level
    "typical" figure is the MEDIAN of those totals ACROSS property
    groups -- all done server-side in service_charges_by_project, never
    re-derived here from raw rows.

    Also confirmed live: even done correctly, per-group totals include
    real outliers (citywide max 8,869 AED/sqft against a genuine range
    of roughly 3-70+) -- the RPC excludes anything outside a 0-150
    ceiling and reports exactly how many groups were excluded, so
    Stage 5 can be honest about it rather than silently dropping data.

    Returns None if no matching project, no data for the requested
    usage/year, or fewer than 3 clean property groups remain after
    outlier exclusion (too thin a sample to call "typical" honestly).
    """
    if not project or not project.strip():
        logger.info("get_service_charges: no project text given, skipping")
        return None
    cleaned = project.strip()

    try:
        result = (
            supabase.rpc("service_charges_by_project", {
                "project_pattern": f"%{cleaned}%",
                "project_exact": cleaned,
                "usage_filter": usage,
                "target_year": year,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_service_charges: service_charges_by_project failed for %r: %s", cleaned, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info(
            "get_service_charges: no usable service-charge data for %r (usage=%r, year=%r) -- "
            "either no matching project, no data for that usage/year, or too few clean "
            "property groups after outlier exclusion",
            cleaned, usage, year,
        )
        return None

    row = rows[0]
    median = row.get("median_charge_per_sqft")

    data = {
        "matched_project": row.get("matched_project_name"),
        "master_community": row.get("master_community_name"),
        "budget_year": row.get("resolved_year"),
        "usage": usage,
        "n_property_groups": row.get("n_property_groups"),
        "median_charge_per_sqft": round(float(median), 1) if median is not None else None,
        "min_charge_per_sqft": row.get("min_charge_per_sqft"),
        "max_charge_per_sqft": row.get("max_charge_per_sqft"),
        "n_excluded_outliers": row.get("n_excluded_outliers"),
    }

    logger.info(
        "get_service_charges decided: project=%r -> matched=%r year=%s n_groups=%d "
        "median=%s AED/sqft (excluded=%d outliers)",
        cleaned, data["matched_project"], data["budget_year"], data["n_property_groups"],
        data["median_charge_per_sqft"], data["n_excluded_outliers"],
    )
    return data


# ---------------------------------------------------------------------------
# NEW: get_legal_knowledge() — backed by the new search_legal_knowledge
# RPC (full-text search, not embeddings — see the migration file's
# docstring for why: no embeddings API credentials available to generate
# or test real vectors in this session; pgvector is available as an
# extension for a future upgrade once that changes).
#
# Closes Part Two §2.2 / Part Three §3.7: "legal/general questions get
# the wrong fallback" — the doc's own example, "Am I eligible for a
# Golden Visa if I buy property?", was correctly classified as
# legal_or_general but returned the generic no-data template instead of
# real guidance.
#
# CONTENT NOTE: the knowledge base is currently a small SEED set (3
# chunks: Golden Visa, DLD transfer fee, freehold ownership areas),
# researched and cross-verified against 2026 sources — NOT the DLD User
# Guide PDFs the doc references (not available in this session). Every
# chunk carries a source_note making this explicit, and Stage 5 must
# always surface that note, never presenting this as DLD's own official
# guide content.
# ---------------------------------------------------------------------------

# Minimum ts_rank to treat a chunk as genuinely relevant, not just a
# coincidental shared word (e.g. "property" appears in all seed chunks).
# Confirmed live: real matches scored 0.047-0.066, coincidental-overlap
# noise scored 0.017-0.018, in the small seed set. A rough heuristic —
# revisit as the corpus grows and the relative signal gets stronger.
LEGAL_KNOWLEDGE_MIN_RANK = 0.02


def get_legal_knowledge(question, limit=3):
    """
    Returns a list of {title, content, category, source_url, source_note}
    dicts for the investor's raw question text, or None if nothing
    relevant is found (below LEGAL_KNOWLEDGE_MIN_RANK) or the table is
    unreachable. Takes the raw question, not an area/project — this is
    document retrieval, not a database entity lookup.
    """
    if not question or not question.strip():
        logger.info("get_legal_knowledge: no question text given, skipping")
        return None

    try:
        result = (
            supabase.rpc("search_legal_knowledge", {
                "query_text": question.strip(),
                "result_limit": limit,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_legal_knowledge: search_legal_knowledge failed for %r: %s", question, e)
        return None

    rows = result.data or []
    relevant = [r for r in rows if (r.get("rank") or 0) >= LEGAL_KNOWLEDGE_MIN_RANK]
    if not relevant:
        logger.info("get_legal_knowledge: no chunks above relevance threshold for %r", question)
        return None

    chunks = [{
        "title": r.get("title"),
        "content": r.get("content"),
        "category": r.get("category"),
        "source_url": r.get("source_url"),
        "source_note": r.get("source_note"),
    } for r in relevant]

    logger.info(
        "get_legal_knowledge decided: question=%r returned %d relevant chunks (top rank=%.4f)",
        question, len(chunks), relevant[0].get("rank") or 0,
    )
    return chunks


# ---------------------------------------------------------------------------
# NEW: get_broker_info() — backed by the new search_brokers RPC. Closes
# Part Three §3.1's Broker entity (Dataset 18, real_estate_brokers) —
# marked "optional, not blocking" in the doc, but confirmed live to
# already have 8,724 real rows sitting completely unused before this.
#
# Name-based lookup only: real_estate_brokers has no area_id/area_name
# column at all, so "brokers in Business Bay" is genuinely out of scope
# for this table — not built here, not faked. real_estate_offices (the
# obvious join target via real_estate_number) has no office/company name
# column either, so no agency name is invented — only the broker's own
# real data is returned.
# ---------------------------------------------------------------------------
def get_broker_info(broker_name):
    """
    Returns a list of {broker_name, phone, license_start_date,
    license_end_date, is_license_expired, real_estate_number} dicts —
    a list, not a single dict, since confirmed live the same broker name
    can genuinely belong to more than one registered person (or the same
    person registered under multiple real_estate_number entries) —
    picking just one would misrepresent the others, same reasoning as
    get_developer_info(). Returns None if no broker text given or no
    matching record exists.
    """
    if not broker_name or not broker_name.strip():
        logger.info("get_broker_info: no broker name given, skipping")
        return None
    cleaned = broker_name.strip()

    try:
        result = (
            supabase.rpc("search_brokers", {
                "name_pattern": f"%{cleaned}%",
                "name_exact": cleaned,
            })
            .execute()
        )
    except Exception as e:
        logger.error("get_broker_info: search_brokers failed for %r: %s", cleaned, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_broker_info: no matching broker found for %r", cleaned)
        return None

    today = date.today()
    brokers = []
    for r in rows:
        end_date = r.get("license_end_date")
        is_expired = None
        if end_date:
            try:
                is_expired = date.fromisoformat(end_date) < today
            except (TypeError, ValueError):
                is_expired = None
        brokers.append({
            "broker_name": r.get("broker_name_en"),
            "phone": r.get("phone"),
            "license_start_date": r.get("license_start_date"),
            "license_end_date": end_date,
            "is_license_expired": is_expired,
            "real_estate_number": r.get("real_estate_number"),
        })

    logger.info("get_broker_info decided: broker_name=%r returned %d matches", cleaned, len(brokers))
    return brokers


def get_broker_list(limit=10):
    """
    A real, verifiable list of currently-licensed brokers from
    real_estate_brokers (DLD Dataset 18, 8,724 rows) — for "top/best/list
    brokers" questions that name no specific broker.

    CONFIRMED LIVE BUG this closes: "tell the top 10 brokers" was getting
    misclassified by Stage 2 as either broker_lookup (broker=None, which
    correctly returns no data) or legal_or_general (which, finding no
    matching legal_knowledge_chunks, fell through to Stage 5's
    ungrounded general-knowledge LLM path and fabricated a plausible-
    sounding list of "well-known brokerage firms" that don't come from
    this table at all — worse than the honest "I can't help" it replaced,
    because it LOOKED like a real answer). Since real_estate_brokers has
    8,724 real rows, the right fix isn't an apology OR an LLM guess —
    it's actually querying the table.

    IMPORTANT, stated honestly in the caller's answer, not hidden here:
    this table has NO deal-volume or performance column. There is no
    real metric to rank brokers "best" or "most active" by. The only
    defensible real ordering is license tenure (license_start_date) among
    brokers whose license hasn't expired — so this returns the
    longest-continuously-licensed currently-active brokers, not a
    performance ranking. The caller must label it that way, never as
    "top" without qualification.
    """
    today_iso = date.today().isoformat()
    try:
        result = (
            supabase.table("real_estate_brokers")
            .select("broker_name_en, phone, license_start_date, license_end_date, real_estate_number")
            .gte("license_end_date", today_iso)
            .order("license_start_date")
            .limit(limit)
            .execute()
        )
    except Exception as e:
        logger.error("get_broker_list: query failed: %s", e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_broker_list: no currently-active licensed brokers found")
        return None

    brokers = [{
        "broker_name": r.get("broker_name_en"),
        "phone": r.get("phone"),
        "license_start_date": r.get("license_start_date"),
        "license_end_date": r.get("license_end_date"),
        "real_estate_number": r.get("real_estate_number"),
    } for r in rows]

    logger.info("get_broker_list decided: returned %d currently-licensed brokers, ordered by tenure", len(brokers))
    return brokers


# ---------------------------------------------------------------------------
# NEW: compute_market_signal() — closes doc §3.3.1's derived market_signal
# field. Pure computation over real numbers get_price_trend() already
# returns — no new RPC, no new Supabase call. Gate 1 ("numbers come from
# data, never the model") extends to derived signals too: this is
# arithmetic on real price_trend entries, never an LLM guess.
#
# Doc's own caution, carried through here explicitly: only two of the
# four quadrants ("price falling + volume falling" and "price
# stable/rising + volume falling") "come directly from the source" —
# the other two "follow the same logic and are included for
# completeness, but should be checked against real Acqar data before
# being surfaced ... as a labeled signal." Both are standard market-
# analysis logic (not Dubai-specific), so both are computed, but the two
# doc-sourced quadrants are marked confidence="verified" and the two
# doc-inferred quadrants are marked confidence="inferred" — Stage 5 is
# expected to phrase the inferred ones slightly less assertively.
# ---------------------------------------------------------------------------
def compute_market_signal(price_trend):
    """
    Takes the price_trend list already returned by get_price_trend() and
    compares the two most recent years with real data for both price and
    transaction-count direction. Returns
    {signal, label, confidence, price_change_pct, volume_change_pct,
    years_compared} or None if there isn't enough real data (fewer than
    two usable years) to compute a real trend at all.
    """
    if not price_trend:
        return None

    usable = [
        p for p in price_trend
        if p.get("avg_price_per_sqm") is not None and p.get("transaction_count") is not None
    ]
    if len(usable) < 2:
        logger.info("compute_market_signal: fewer than 2 usable years, skipping")
        return None

    prev, latest = usable[-2], usable[-1]
    price_prev, price_latest = prev["avg_price_per_sqm"], latest["avg_price_per_sqm"]
    vol_prev, vol_latest = prev["transaction_count"], latest["transaction_count"]

    price_change_pct = round(((price_latest - price_prev) / price_prev) * 100, 1) if price_prev else None
    vol_change_pct = round(((vol_latest - vol_prev) / vol_prev) * 100, 1) if vol_prev else None

    if price_change_pct is None or vol_change_pct is None:
        return None

    price_falling = price_change_pct < 0
    volume_falling = vol_change_pct < 0

    if price_falling and volume_falling:
        signal, label, confidence = (
            "soft", "Weak demand, likely rising supply — genuinely soft", "verified",
        )
    elif price_falling and not volume_falling:
        signal, label, confidence = (
            "cooling", "Cooling / correcting — activity picking up, but at lower prices", "inferred",
        )
    elif not price_falling and volume_falling:
        signal, label, confidence = (
            "tight_strong", "Tight & strong — few sellers, real demand; looks quiet but isn't", "verified",
        )
    else:
        signal, label, confidence = (
            "broad_strength", "Broad-based strength — demand outrunning supply", "inferred",
        )

    result = {
        "signal": signal,
        "label": label,
        "confidence": confidence,
        "price_change_pct": price_change_pct,
        "volume_change_pct": vol_change_pct,
        "years_compared": f"{prev.get('year')} -> {latest.get('year')}",
    }
    logger.info(
        "compute_market_signal decided: signal=%s (%s) price_change=%s%% volume_change=%s%% years=%s",
        signal, confidence, price_change_pct, vol_change_pct, result["years_compared"],
    )
    return result

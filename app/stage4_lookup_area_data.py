
from clients import supabase, logger, normalize_area


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


def _call_search_avm(area_pattern, room_types=None, row_limit=500):
    """
    Thin wrapper around the search_avm RPC function. Isolated in its own
    function so both lookup_area_data() and get_recent_transactions() can
    share it (Section 5.4 habit #6: no copy-pasted logic).
    """
    return (
        supabase.rpc("search_avm", {
            "area_pattern": area_pattern,
            "room_types": room_types,
            "row_limit": row_limit,
        })
        .execute()
    )


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
        result = _call_search_avm(f"%{normalized}%", room_types=None, row_limit=500)
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

    data = {
        "area": rows[0]["area_name_en"],
        "transaction_sample_size": len(rows),
        "avg_price_per_sqm": round(sum(float(p) for p in prices) / len(prices)) if prices else None,
        "avg_actual_worth": round(sum(float(w) for w in worths) / len(worths)) if worths else None,
        "most_recent_transaction_date": rows[0]["instance_date"],
    }

    # --- Bedroom-specific lookup (only if requested) ---
    if bedrooms is not None:
        variants = _bedroom_label_variants(bedrooms)
        try:
            bed_result = _call_search_avm(f"%{normalized}%", room_types=variants, row_limit=500)
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
                data["bedroom_breakdown"] = {
                    "bedrooms": bedrooms,
                    "transaction_sample_size": len(bed_rows),
                    "avg_price_per_sqm": round(sum(float(p) for p in bed_prices) / len(bed_prices)) if bed_prices else None,
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
        "Stage 4 decided: area=%r sample_size=%d avg_price_per_sqm=%s avg_actual_worth=%s "
        "has_bedroom_breakdown=%s",
        data["area"], data["transaction_sample_size"],
        data["avg_price_per_sqm"], data["avg_actual_worth"],
        "bedroom_breakdown" in data,
    )
    return data


SQM_TO_SQFT = 10.7639


def get_recent_transactions(area, limit=10):
    """
    Fetches individual real transactions (not aggregated) — for questions
    like "show me the last 10 sales in JVC". Uses the same reliable
    search_avm RPC as lookup_area_data(), for the same reason: a plain
    .select() query is not reliably fast for every area.
    """
    normalized = normalize_area(area)
    if not normalized:
        logger.info("get_recent_transactions: no area text given, skipping")
        return None

    try:
        result = _call_search_avm(f"%{normalized}%", room_types=None, row_limit=limit)
    except Exception as e:
        logger.error("get_recent_transactions: search_avm lookup failed for %r: %s", normalized, e)
        return None

    rows = result.data or []
    if not rows:
        logger.info("get_recent_transactions: no rows found for %r", normalized)
        return None

    transactions = []
    for r in rows:
        size_sqm = r.get("procedure_area")
        price_per_sqm = r.get("price_per_sqm")
        transactions.append({
            "date": r.get("instance_date"),
            "type": r.get("rooms_en"),
            "size_sqft": round(float(size_sqm) * SQM_TO_SQFT) if size_sqm is not None else None,
            "price_aed": round(float(r["actual_worth"])) if r.get("actual_worth") is not None else None,
            "psf_aed": round(float(price_per_sqm) / SQM_TO_SQFT) if price_per_sqm is not None else None,
        })

    logger.info(
        "get_recent_transactions decided: area=%r returned %d real transactions",
        normalized, len(transactions),
    )
    return transactions

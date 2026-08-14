"""
stage4_lookup_area_data.py — Stage 4, standalone
==================================================
Built and verified on its own, after Stage 2 (already proven correct) and
before Stage 5 (doesn't exist yet). This file only depends on clients.py —
it doesn't call extract_entities() or build_answer() itself. The caller is
responsible for passing in an area string, however it was obtained.

Queries the real `avm` table (1.65M+ transaction rows, confirmed live).
The area column is `area_name_en` (e.g. "Jumeirah Village Circle (JVC)")
— NOT `area`. This table is per-transaction, not one summary row per
area, so this pulls the most recent transactions for the area and
aggregates them in Python rather than expecting a single row back.
"""
from clients import supabase, logger, normalize_area


def lookup_area_data(area):
    normalized = normalize_area(area)
    if not normalized:
        logger.info("Stage 4 decided: no area text given, skipping lookup")
        return None

    try:
        result = (
            supabase.table("avm")
            .select("area_name_en, price_per_sqm, actual_worth, instance_date")
            .ilike("area_name_en", f"%{normalized}%")
            .order("instance_date", desc=True)
            .limit(500)
            .execute()
        )
    except Exception as e:
        logger.error("Stage 4: Supabase lookup failed for %r: %s", normalized, e)
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
        "avg_price_per_sqm": round(sum(prices) / len(prices)) if prices else None,
        "avg_actual_worth": round(sum(worths) / len(worths)) if worths else None,
        "most_recent_transaction_date": rows[0]["instance_date"],
    }

    # Habit #2: make this stage's decision visible while building.
    logger.info(
        "Stage 4 decided: area=%r sample_size=%d avg_price_per_sqm=%s avg_actual_worth=%s",
        data["area"], data["transaction_sample_size"],
        data["avg_price_per_sqm"], data["avg_actual_worth"],
    )
    return data

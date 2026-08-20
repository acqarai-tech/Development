-- migration_budget_area_recommendations.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-20, in two passes (see
-- LIVE FIX below). This file reflects the CURRENT live state.
--
-- Closes a confirmed-live bug: "I have AED 600,000. Which areas should
-- I consider?" had no dedicated route in the pipeline at all, so it
-- fell through to market_overview()'s citywide-average path — honest
-- (never fabricated a number) but useless: it told the investor what
-- the AVERAGE Dubai property costs (~3.4M / 22,210 AED/sqm), never
-- which real, DLD-transacted areas their actual budget could reach.
--
-- Same "let the database do the GROUP BY" pattern already proven in
-- top_areas_by_price / top_areas_by_volume (avm -> area -> aggregate,
-- not 1.79M rows pulled into Python). Adds median/min/% under budget on
-- top of what those two RPCs return, since average price alone can't
-- tell a 600k investor whether an area is remotely reachable (an area
-- averaging 1.5M with a real 450k sale on record is very different from
-- one averaging 2.5M with a 2.1M floor, even though both have "some"
-- transactions).
--
-- HAVING min(actual_worth) <= target_budget is the core guarantee: an
-- area only appears if at least one REAL transaction on record actually
-- happened at or under the investor's stated budget — same
-- zero-transaction-rule discipline used everywhere else in this
-- pipeline, just expressed as a HAVING clause instead of a Python-side
-- "if not rows: return None" check, because it has to run before GROUP
-- BY collapses the rows Python would otherwise need to inspect.
--
-- min_transactions >= 10 (same default as top_areas_by_price) guards
-- against a single lucky low sale making a near-empty area look like a
-- real option.
--
-- LIVE FIX (found immediately while verifying, same day): the first
-- version queried `avm` with no property_type filter at all. Result for
-- budget=600000: "Mena Jabal Ali" ranked #1 with avg_ppsqm=52.5 AED/sqm
-- and min_worth=3,420 AED — not a real residential price in any Dubai
-- area (genuine residential runs roughly 5,000-25,000+ AED/sqm). Root
-- cause: avm.property_type_en includes 'Land' (126,684 rows) and
-- 'Building' (30,916 rows) mixed in with 'Unit' (1,206,962) and 'Villa'
-- (194,317) — land-parcel and whole-building sales price completely
-- differently per sqm than an individual residential unit, and neither
-- belongs in an answer to "which residential areas can I afford."
--
-- SECOND anomaly, same verification pass: even after restricting to
-- Unit/Villa, "Al Warsan First" showed min_worth = 1.0 AED — a
-- residential unit does not genuinely sell for one dirham; this is a
-- non-arm's-length transfer (gift, inheritance, corporate restructure)
-- recorded at nominal value, not a market transaction. A single row
-- like this could make an otherwise-unaffordable area falsely qualify
-- via the min(actual_worth) <= budget gate. Fixed with an actual_worth
-- >= 50000 floor — conservative enough to exclude symbolic transfers
-- without excluding any genuine cheap Dubai studio/room sale.
--
-- Re-verified against budget=600000 and budget=1500000 after both
-- fixes: min_worth values across all returned areas are realistic
-- (50,000+ AED), avg_ppsqm in the 1,900-15,500 AED/sqm range, and every
-- returned area (Al Warsan First, International City, Warsan Fourth,
-- Dubai Industrial City, Jabal Ali, Al Qusais Industrial Fourth/Fifth,
-- Discovery Gardens, Madinat Hind 4) is a genuinely known budget-
-- residential area in Dubai — passes a real domain-knowledge sanity
-- check, not just a "query ran without error" check.
--
-- WIDER FINDING, reported separately, NOT fixed here: search_avm (the
-- RPC backing lookup_area_data, get_recent_transactions, and every
-- other area-price lookup already live in the pipeline) has NO
-- property_type_en filter either — meaning ordinary "average price in
-- X" answers may already be silently blending Land/Building sales into
-- what reads as a residential-unit average. Out of scope for this fix
-- (touches the whole pipeline, needs its own verification pass) —
-- flagged as a queued item, same severity class as the rentals
-- 21x-skew bug already found and fixed once before. SET search_path
-- fixed here for hygiene; the existing top_areas_by_* functions predate
-- this and are still flagged by Supabase's advisor — not touched in
-- this migration, tracked separately.

CREATE OR REPLACE FUNCTION public.budget_area_recommendations(
  target_budget numeric,
  row_limit integer DEFAULT 6,
  min_transactions integer DEFAULT 10,
  target_year integer DEFAULT NULL
)
RETURNS TABLE(
  area_name_en text,
  tx_count bigint,
  avg_worth numeric,
  median_worth numeric,
  min_worth numeric,
  avg_ppsqm numeric,
  under_budget_count bigint,
  under_budget_pct numeric
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    area_name_en,
    count(*) AS tx_count,
    avg(actual_worth) AS avg_worth,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY actual_worth) AS median_worth,
    min(actual_worth) AS min_worth,
    avg(price_per_sqm) AS avg_ppsqm,
    count(*) FILTER (WHERE actual_worth <= target_budget) AS under_budget_count,
    round(100.0 * count(*) FILTER (WHERE actual_worth <= target_budget) / count(*), 1) AS under_budget_pct
  FROM avm
  WHERE area_name_en IS NOT NULL
    AND actual_worth IS NOT NULL
    AND price_per_sqm IS NOT NULL
    AND property_type_en IN ('Unit', 'Villa')
    AND coalesce(actual_worth_capped_flag, false) = false
    AND actual_worth >= 50000
    AND (target_year IS NULL OR sale_year = target_year)
  GROUP BY area_name_en
  HAVING count(*) >= min_transactions
     AND min(actual_worth) <= target_budget
  ORDER BY under_budget_pct DESC, under_budget_count DESC, tx_count DESC
  LIMIT row_limit;
$$;

NOTIFY pgrst, 'reload schema';

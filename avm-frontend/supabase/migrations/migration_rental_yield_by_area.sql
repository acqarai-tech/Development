-- migration_rental_yield_by_area.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19 (in two passes —
-- see "LIVE FIX" note below). This file reflects the CURRENT live state.
--
-- Closes Part Two, issue #15 (P1) of the DLD Open Data reference pack:
-- "rentals table: 0 rows. No ROI or yield answer is possible today."
-- The rentals table itself was loaded on 2026-08-18 (320,664 rows) but
-- nothing in the app queries it yet. This RPC is the rentals-side
-- equivalent of area_price_trend / search_avm — same exact-match-first,
-- ILIKE-fallback, VOLATILE-with-planner-hints pattern already proven
-- for the 1.65M-row avm table, applied here to the 320K-row rentals
-- table for the same reason (avoid the planner defaulting to a full
-- table scan on a large table).
--
-- Returns aggregate rent figures only (avg_annual_rent, avg_rent_per_sqm,
-- contract_count) — NOT a yield percentage. Gross yield needs a SALE
-- price too, which lives in avm, a different table; combining the two
-- happens in Python (ai_chat.py's routing), not in SQL, so this
-- function's only job is "what does renting cost in this area" — one
-- stage, one responsibility, same as every other Stage 4 function.
--
-- LIVE FIX (applied immediately after the first version, same day):
-- confirmed live that ~16% of rentals rows (45,264 of ~280K usable rows)
-- are bulk/master Ejari filings where annual_amount is the TOTAL across
-- many properties under one contract (no_of_prop up to 407+ seen in
-- Business Bay alone), not one unit's rent. Unfiltered, these averaged
-- ~21x a genuine single-unit contract (1.92M AED vs 89K AED) and badly
-- skewed every area's "average rent" upward (Business Bay: 437,628 AED
-- unfiltered vs 106,096 AED filtered — the filtered number matches
-- published market figures, the unfiltered one doesn't). Added
-- `AND r.no_of_prop = 1` to both branches below, and added no_of_prop to
-- the covering index. Caught by spot-checking Business Bay's numbers
-- against general market knowledge before considering this done — same
-- "confirmed live" discipline this codebase already applies everywhere
-- else, applied here before shipping, not after.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rentals_area_lower_covering
ON rentals (lower(area_name_en))
INCLUDE (annual_amount, actual_area, contract_start_date, ejari_property_type_en, no_of_prop);

VACUUM ANALYZE rentals;

DROP FUNCTION IF EXISTS public.rental_yield_by_area(text, text, int);
DROP FUNCTION IF EXISTS public.rental_yield_by_area(text, text);

-- No row_limit parameter — unlike search_avm (which returns individual
-- rows and needs a cap on what's shipped to Python), this is a bare
-- aggregate with no GROUP BY, so it always returns exactly one row no
-- matter how many rentals rows feed it. A LIMIT here would apply AFTER
-- aggregation, not before, so it couldn't cap the input sample anyway —
-- same reasoning as area_price_trend, which has no row_limit either.
CREATE OR REPLACE FUNCTION public.rental_yield_by_area(
  area_pattern text,
  area_exact text DEFAULT NULL
)
RETURNS TABLE(
  avg_annual_rent numeric,
  avg_rent_per_sqm numeric,
  contract_count bigint,
  most_recent_contract_start date
)
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  -- Same planner hints as search_avm / area_price_trend — confirmed live
  -- necessary on this project's Postgres instance to make the exact-match
  -- covering index actually get chosen over a full scan.
  SET LOCAL enable_bitmapscan = off;
  SET LOCAL max_parallel_workers_per_gather = 0;

  IF area_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT
        avg(r.annual_amount) AS avg_annual_rent,
        avg(r.annual_amount / NULLIF(r.actual_area, 0)) AS avg_rent_per_sqm,
        count(*) AS contract_count,
        max(r.contract_start_date) AS most_recent_contract_start
      FROM rentals r
      WHERE lower(r.area_name_en) = lower(area_exact)
        AND r.annual_amount IS NOT NULL
        AND r.actual_area IS NOT NULL
        AND r.actual_area > 0
        AND r.no_of_prop = 1
      -- HAVING, not just WHERE: a bare aggregate with no GROUP BY always
      -- returns exactly one row, even over zero matching input rows (the
      -- row would just be all NULLs). Without this, FOUND would be TRUE
      -- even when the exact match genuinely had no data, silently
      -- skipping the ILIKE fallback below and returning nulls instead of
      -- a real answer from the broader match.
      HAVING count(*) > 0;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT
      avg(r.annual_amount) AS avg_annual_rent,
      avg(r.annual_amount / NULLIF(r.actual_area, 0)) AS avg_rent_per_sqm,
      count(*) AS contract_count,
      max(r.contract_start_date) AS most_recent_contract_start
    FROM rentals r
    WHERE r.area_name_en ILIKE area_pattern
      AND r.annual_amount IS NOT NULL
      AND r.actual_area IS NOT NULL
      AND r.actual_area > 0
      AND r.no_of_prop = 1
    HAVING count(*) > 0;
END;
$$;

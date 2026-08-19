-- migration_citywide_transactions.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19, in two passes
-- (see LIVE FIX below). This file reflects the CURRENT live state.
--
-- Closes a confirmed-live gap found via user testing: "tell the 10
-- recent sales in Dubai" / "tell the top 10 sales in Dubai" got the
-- honest no-data fallback even though real data obviously exists —
-- get_recent_transactions() requires a specific community area, and
-- "Dubai" is the whole emirate, not a community.
--
-- Deliberately NOT built as area_pattern ILIKE '%dubai%' against the
-- existing search_avm: verified live that only catches areas whose name
-- literally contains "Dubai" (Dubai Investment Park, Madinat Dubai
-- Almelaheyah) while silently missing Business Bay, JVC, Downtown,
-- Marina — none of which contain that substring. That would produce an
-- answer that LOOKS like real city-wide data while actually being a
-- biased, incomplete slice. This function has no area filter at all —
-- genuinely city-wide, ordered across every real transaction.
--
-- order_by supports both real senses of "top sales": 'recent' (default)
-- and 'value' (highest real actual_worth).
--
-- LIVE FIX (found immediately while verifying, same day): the initial
-- 'value' ordering, unfiltered, returned billion-AED "sales" that were
-- actually raw land parcels and whole-building acquisitions
-- (property_type_en = 'Land'/'Building'), not individual property
-- sales — confirmed live, e.g. a 3.87B AED "Mugatrah" land parcel
-- topped the list, nothing like what an investor means by "top sales."
-- Filtered to property_type_en IN ('Unit', 'Villa', 'Residential') —
-- the three categories confirmed to be genuine individual property
-- sales (1.2M + 194K + 91K real rows, sane average worths of 1.7M-3.6M
-- AED). Excludes Land/Building/Commercial and a handful of confirmed
-- garbage rows (property_type_en = ' Swimming Pool' / 'TRUE').
--
-- Index added for the 'value' path: no index existed on actual_worth,
-- confirmed via EXPLAIN ANALYZE at 1.48s unfiltered / 139.6ms filtered
-- before the index, 16.6ms unfiltered / (still ~140ms filtered, since
-- the property_type_en filter isn't in the index) after. The 'recent'
-- path was already fast (12.5ms) thanks to the existing
-- idx_avm_instance_date index — no new index needed there.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avm_actual_worth_desc
ON avm (actual_worth DESC) WHERE actual_worth IS NOT NULL;

CREATE OR REPLACE FUNCTION public.citywide_transactions(
  row_limit int DEFAULT 10,
  order_by text DEFAULT 'recent'
)
RETURNS TABLE(
  area_name_en text,
  price_per_sqm numeric,
  actual_worth numeric,
  instance_date date,
  rooms_en text,
  procedure_area numeric,
  project_name_en text
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF order_by = 'value' THEN
    RETURN QUERY
      SELECT a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      FROM avm a
      WHERE a.actual_worth IS NOT NULL
        AND a.property_type_en IN ('Unit', 'Villa', 'Residential')
      ORDER BY a.actual_worth DESC
      LIMIT row_limit;
  ELSE
    RETURN QUERY
      SELECT a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      FROM avm a
      WHERE a.instance_date IS NOT NULL
        AND a.property_type_en IN ('Unit', 'Villa', 'Residential')
      ORDER BY a.instance_date DESC
      LIMIT row_limit;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';

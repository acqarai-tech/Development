-- migration_property_valuations_by_area.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19.
--
-- Closes Part Two P2 issue: "Valuation claim thinly backed -- valuations
-- table: 2 rows in the AI backend project." property_valuations
-- (90,422 rows, Dataset 03) gives real DLD valuation procedure records,
-- versus the product's own user-submitted `valuations` table (3 rows).
--
-- Filters to property_type_en = 'Unit' by default: confirmed live,
-- 'Unit'/'Land'/'Building' averages differ by ~500x (2.1M vs 173M vs
-- 1.1B for Business Bay alone) -- blending them would be meaningless.
-- 'Unit' is what an investor means by "what's my apartment worth."
--
-- No index or planner hints added -- table is 90,422 rows, verified
-- with EXPLAIN ANALYZE at 36ms with a plain sequential scan. Not worth
-- the added complexity at this size.

CREATE OR REPLACE FUNCTION public.property_valuations_by_area(
  area_pattern text,
  area_exact text DEFAULT NULL,
  property_type text DEFAULT 'Unit'
)
RETURNS TABLE(
  avg_actual_worth numeric,
  avg_property_total_value numeric,
  valuation_count bigint,
  most_recent_valuation date
)
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  IF area_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT avg(v.actual_worth), avg(v.property_total_value), count(*),
             max(v.instance_date)::date
      FROM property_valuations v
      WHERE lower(v.area_name_en) = lower(area_exact)
        AND v.property_type_en = property_type
      HAVING count(*) > 0;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT avg(v.actual_worth), avg(v.property_total_value), count(*),
           max(v.instance_date)::date
    FROM property_valuations v
    WHERE v.area_name_en ILIKE area_pattern
      AND v.property_type_en = property_type
    HAVING count(*) > 0;
END;
$$;

NOTIFY pgrst, 'reload schema';

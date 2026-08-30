-- migration_land_zoning_by_area.sql
-- ===================================
-- ALREADY APPLIED LIVE to hzgkmvhvivqczxkdcfek — for repo records only.
--
-- New functionality: land_registry (207,097 real rows) had zero
-- references anywhere in the app before this. Area-scoped zoning/land-use
-- inventory by land_type_en. Confirmed live: land_registry.area_id
-- matches avm.area_id for 204,075 of 207,097 rows (99%) and
-- area_name_en spelling matches avm's own convention exactly (both say
-- "Dubai Marina", not a mismatched variant) — so this reuses
-- resolve_area_names(), the same synonym-handling every other area RPC
-- already uses (verified live: the Dubai Marina / Marsa Dubai synonym
-- case resolves correctly here too).
--
-- NO PRICE DATA. This is parcel-level zoning/land-use inventory only —
-- never a valuation source. The app-layer formatter (see
-- _format_land_zoning in stage5_build_answer.py) is built to never
-- state or imply a price from this data.
--
-- 16,063 of 207,097 rows citywide have land_type_en = NULL — a real,
-- legitimate gap in DLD's own source data, not missing rows. Grouped
-- under "Unspecified" here rather than silently dropped, so an area's
-- total parcel count is never understated.
--
-- Verified live: real area (Dubai Marina, 10 real land types returned),
-- case-insensitivity, the Marsa Dubai synonym, and a genuinely
-- nonexistent area (empty result, no error).
CREATE OR REPLACE FUNCTION public.land_zoning_by_area(
  area_pattern text,
  area_exact text DEFAULT NULL
)
RETURNS TABLE(
  land_type_en text,
  parcel_count bigint,
  avg_area_sqm numeric,
  total_area_sqm numeric
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF area_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT coalesce(lr.land_type_en, 'Unspecified'),
             count(*),
             round(avg(lr.actual_area), 1),
             round(sum(lr.actual_area), 1)
      FROM land_registry lr
      WHERE lower(lr.area_name_en) = any(resolve_area_names(area_exact))
      GROUP BY coalesce(lr.land_type_en, 'Unspecified')
      ORDER BY count(*) DESC;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT coalesce(lr.land_type_en, 'Unspecified'),
           count(*),
           round(avg(lr.actual_area), 1),
           round(sum(lr.actual_area), 1)
    FROM land_registry lr
    WHERE lr.area_name_en ILIKE area_pattern
    GROUP BY coalesce(lr.land_type_en, 'Unspecified')
    ORDER BY count(*) DESC;
END;
$$;

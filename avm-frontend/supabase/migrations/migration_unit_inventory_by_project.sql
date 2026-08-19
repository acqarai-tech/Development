-- migration_unit_inventory_by_project.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19.
--
-- Closes Part Two P2 issue: "Unit-count / inventory questions (Sobha
-- SkyParks example) -- unclear whether New_Properties fully covers
-- unit-level detail." registered_real_estate_units (1,787,223 rows,
-- Dataset 01) gives the REAL registered unit count per project, broken
-- down by room type -- distinct from and more complete than counting
-- avm transactions, which only ever shows units that have sold, not a
-- project's true total inventory.
--
-- No planner hints (SET LOCAL enable_bitmapscan off, etc.) added --
-- confirmed live earlier this session that copying those blindly from a
-- different function caused a real ~30x slowdown on rental_yield_by_area.
-- Built plain, verified with EXPLAIN ANALYZE: 729ms cold cache (one-time,
-- right after the index was created), 3.8ms steady state after. No hints
-- needed here.
--
-- Filters to is_free_hold = true by default: this project is investor-
-- facing, and freehold status is the single most important legal filter
-- for a foreign investor (non-freehold typically can't be bought by
-- non-UAE-nationals in most areas).

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_registered_units_project_lower_covering
ON registered_real_estate_units (lower(project_name_en))
INCLUDE (rooms_en, property_sub_type_en, is_free_hold);

VACUUM ANALYZE registered_real_estate_units;

CREATE OR REPLACE FUNCTION public.unit_inventory_by_project(
  project_pattern text,
  project_exact text DEFAULT NULL
)
RETURNS TABLE(
  rooms_en text,
  property_sub_type_en text,
  unit_count bigint
)
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  IF project_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT r.rooms_en, r.property_sub_type_en, count(*) AS unit_count
      FROM registered_real_estate_units r
      WHERE lower(r.project_name_en) = lower(project_exact)
        AND r.is_free_hold = true
      GROUP BY r.rooms_en, r.property_sub_type_en
      HAVING count(*) > 0
      ORDER BY unit_count DESC;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT r.rooms_en, r.property_sub_type_en, count(*) AS unit_count
    FROM registered_real_estate_units r
    WHERE r.project_name_en ILIKE project_pattern
      AND r.is_free_hold = true
    GROUP BY r.rooms_en, r.property_sub_type_en
    HAVING count(*) > 0
    ORDER BY unit_count DESC;
END;
$$;

NOTIFY pgrst, 'reload schema';

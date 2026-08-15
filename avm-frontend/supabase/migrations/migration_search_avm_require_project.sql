-- migration_search_avm_require_project.sql
-- =============================================
-- ALREADY APPLIED LIVE to hzgkmvhvivqczxkdcfek — for repo records only.
--
-- Adds require_project (default false) to search_avm: when true, only
-- rows with a real project_name_en are returned, still ordered by
-- recency within that subset.
--
-- Used by get_recent_transactions()'s new two-attempt strategy: try
-- complete-data-only first; only fall back to the original mixed
-- fetch (real dashes for missing projects) if there genuinely aren't
-- enough complete rows to fill the request. Confirmed live this stays
-- close to "recent" even for a sparse area — DAMAC Hills 2 (only 3.3%
-- of 6,026 transactions have a project) still returned complete rows
-- just 1-2 days older than the true most recent sale.

CREATE OR REPLACE FUNCTION public.search_avm(
  area_pattern text,
  room_types text[] DEFAULT NULL,
  row_limit integer DEFAULT 500,
  project_pattern text DEFAULT NULL,
  area_exact text DEFAULT NULL,
  require_project boolean DEFAULT false
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
  IF area_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      FROM avm a
      WHERE lower(a.area_name_en) = lower(area_exact)
        AND (room_types IS NULL OR a.rooms_en = ANY(room_types))
        AND (project_pattern IS NULL OR a.project_name_en ILIKE project_pattern)
        AND (NOT require_project OR a.project_name_en IS NOT NULL)
      ORDER BY a.instance_date DESC
      LIMIT row_limit;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    WITH matches AS MATERIALIZED (
      SELECT a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      FROM avm a
      WHERE a.area_name_en ILIKE area_pattern
        AND (room_types IS NULL OR a.rooms_en = ANY(room_types))
        AND (project_pattern IS NULL OR a.project_name_en ILIKE project_pattern)
        AND (NOT require_project OR a.project_name_en IS NOT NULL)
    )
    SELECT * FROM matches ORDER BY instance_date DESC LIMIT row_limit;
END;
$$;

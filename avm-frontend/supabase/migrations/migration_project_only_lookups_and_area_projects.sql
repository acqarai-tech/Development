-- migration_project_only_lookups_and_area_projects.sql
-- =========================================================
-- ALREADY APPLIED LIVE to hzgkmvhvivqczxkdcfek (Building AI Property
-- Product) — this file is for your repo/version-control records, not
-- something that still needs to be run.
--
-- Fixes two confirmed live bugs together:
--
-- 1) "What projects are in JVC" was routed to district_properties (a
--    curated building/property directory) — confirmed almost zero
--    overlap with avm's real, transaction-backed projects for the same
--    area. district_properties returns "Al Yousuf Towers," "Al Maali
--    Complex"; avm's real top JVC projects are "Auresta Tower" (1,021
--    real sales), "Serenz by Danube" (823 sales), etc. Fixed by adding
--    list_area_projects, a dedicated aggregate RPC reading avm directly.
--
-- 2) Every existing lookup function required an area to search at all —
--    "tell me about Binghatti Aquarise" (project named, no area) got
--    nothing, purely because nothing ever tried searching by project
--    alone. Fixed by adding search_avm_by_project — same exact-match-
--    first / ILIKE-fallback pattern as the existing area-based
--    search_avm, but keyed on project_name_en. Backed by NEW indexes,
--    since none existed for project_name_en before this (confirmed via
--    pg_indexes — it only ever appeared as an INCLUDE column on area-
--    keyed indexes, never as the primary/leading column).
--
-- Performance confirmed live: exact-match project lookups now use a
-- true index-only scan (same technique already proven for area_name_en
-- — see migration_search_avm_exact_match_fastpath.sql), avoiding the
-- same random-heap-I/O timeout risk a naive 1.65M-row ILIKE scan on an
-- unindexed column would otherwise hit.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avm_project_name_en_trgm
ON avm USING gin (project_name_en gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avm_project_lower_covering
ON avm (lower(project_name_en))
INCLUDE (price_per_sqm, actual_worth, instance_date, rooms_en, area_name_en, procedure_area);

VACUUM ANALYZE avm;

-- Project-only search — mirrors search_avm's exact-match-first / ILIKE-
-- fallback pattern, but keyed on project_name_en instead of area_name_en.
CREATE OR REPLACE FUNCTION public.search_avm_by_project(
  project_pattern text,
  project_exact text DEFAULT NULL,
  room_types text[] DEFAULT NULL,
  row_limit integer DEFAULT 500
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
  IF project_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      FROM avm a
      WHERE lower(a.project_name_en) = lower(project_exact)
        AND (room_types IS NULL OR a.rooms_en = ANY(room_types))
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
      WHERE a.project_name_en ILIKE project_pattern
        AND (room_types IS NULL OR a.rooms_en = ANY(room_types))
    )
    SELECT * FROM matches ORDER BY instance_date DESC LIMIT row_limit;
END;
$$;

-- Real, transaction-backed project list for an area — grouped and
-- ranked by transaction volume.
CREATE OR REPLACE FUNCTION public.list_area_projects(
  area_pattern text,
  area_exact text DEFAULT NULL,
  row_limit integer DEFAULT 50
)
RETURNS TABLE(project_name_en text, transaction_count bigint, avg_ppsqm numeric)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF area_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT a.project_name_en, count(*) AS transaction_count, avg(a.price_per_sqm) AS avg_ppsqm
      FROM avm a
      WHERE lower(a.area_name_en) = lower(area_exact)
        AND a.project_name_en IS NOT NULL
      GROUP BY a.project_name_en
      ORDER BY transaction_count DESC
      LIMIT row_limit;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT a.project_name_en, count(*) AS transaction_count, avg(a.price_per_sqm) AS avg_ppsqm
    FROM avm a
    WHERE a.area_name_en ILIKE area_pattern
      AND a.project_name_en IS NOT NULL
    GROUP BY a.project_name_en
    ORDER BY transaction_count DESC
    LIMIT row_limit;
END;
$$;

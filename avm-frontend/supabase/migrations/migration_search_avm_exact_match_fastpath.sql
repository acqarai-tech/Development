-- migration_search_avm_exact_match_fastpath.sql
-- =================================================
-- ALREADY APPLIED LIVE to hzgkmvhvivqczxkdcfek (Building AI Property
-- Product) — this file is for your repo/version-control records, not
-- something that still needs to be run.
--
-- Fixes a confirmed, repeatedly-occurring production bug: any high-
-- volume area (Business Bay: 105,053 rows, Burj Khalifa/Downtown:
-- 62,758 rows) could time out on search_avm, since ILIKE substring
-- matching can only use the trigram index to find WHICH rows match —
-- actually reading their price/date/etc. still requires visiting tens
-- of thousands of randomly-scattered heap pages. Confirmed via
-- EXPLAIN ANALYZE: ~53,000 disk page reads, 15-17 seconds, for one
-- query.
--
-- Fix: two covering indexes (store the needed columns IN the index, so
-- Postgres never has to touch the table at all for a match), plus an
-- exact-match-first strategy in search_avm — investors' area text is
-- often already an exact (or near-exact, once normalize_area resolves
-- overrides like Downtown -> Burj Khalifa) match for avm's real area
-- name, and an exact match can use a true index-only scan. ILIKE
-- substring matching remains the fallback for anything that doesn't
-- hit exactly (unchanged behavior).
--
-- Confirmed live improvement: ~17s -> ~1.3s for Business Bay (once
-- VACUUM ANALYZE updated the visibility map) — roughly 12-13x.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avm_area_covering
ON avm (area_name_en)
INCLUDE (price_per_sqm, actual_worth, instance_date, rooms_en, project_name_en, procedure_area);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avm_area_lower_covering
ON avm (lower(area_name_en))
INCLUDE (price_per_sqm, actual_worth, instance_date, rooms_en, project_name_en, procedure_area);

VACUUM ANALYZE avm;

DROP FUNCTION IF EXISTS public.search_avm(text, text[], integer, text);

CREATE OR REPLACE FUNCTION public.search_avm(
  area_pattern text,
  room_types text[] DEFAULT NULL,
  row_limit integer DEFAULT 500,
  project_pattern text DEFAULT NULL,
  area_exact text DEFAULT NULL
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
  -- Fast path: exact (case-insensitive) match via idx_avm_area_lower_covering.
  IF area_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      FROM avm a
      WHERE lower(a.area_name_en) = lower(area_exact)
        AND (room_types IS NULL OR a.rooms_en = ANY(room_types))
        AND (project_pattern IS NULL OR a.project_name_en ILIKE project_pattern)
      ORDER BY a.instance_date DESC
      LIMIT row_limit;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  -- Fallback: substring ILIKE match, same as the original implementation.
  RETURN QUERY
    WITH matches AS MATERIALIZED (
      SELECT a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      FROM avm a
      WHERE a.area_name_en ILIKE area_pattern
        AND (room_types IS NULL OR a.rooms_en = ANY(room_types))
        AND (project_pattern IS NULL OR a.project_name_en ILIKE project_pattern)
    )
    SELECT * FROM matches ORDER BY instance_date DESC LIMIT row_limit;
END;
$$;

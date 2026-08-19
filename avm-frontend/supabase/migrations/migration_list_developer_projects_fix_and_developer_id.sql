-- migration_list_developer_projects_fix_and_developer_id.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19, in three passes
-- (see history below). This file reflects the CURRENT live state —
-- supersedes migration_developer_lookup.sql's original version.
--
-- Closes Part Two, issue #10 (P2) of the DLD reference pack, and fixes
-- a bug found while doing so.
--
-- HISTORY:
--
-- Pass 1 (this session's original goal): add developer_id to the
-- output, so a follow-up lookup into `developers` (license/legal
-- status) can be tied to the EXACT legal entity behind the projects
-- shown — confirmed live that a brand name like "Damac" ILIKE-matches
-- dozens of separately-registered legal entities in `developers`, each
-- with its own license.
--
-- Pass 2 (bug found while testing pass 1): dp.area_en does not exist on
-- the current dld_projects schema. Real column is area_name_en. This
-- function had been throwing a SQL error on EVERY call since the
-- 2026-08-18 dld_projects reload (255 rows -> 3,240 rows) renamed the
-- column. Every developer_lookup question since then silently hit the
-- honest no-data fallback via the try/except in get_developer_projects()
-- -- no crash, but no real answer either, for a full day, undetected.
-- Aliased back to `area_en` in the output so the Python side (which
-- reads r.get("area_en")) needed no change.
--
-- Pass 3 (confirmed live gap in pass 1's join): 201 of 3,240
-- dld_projects rows (all data_source = 'legacy_pre_2026_06', including
-- the DAMAC ISLANDS projects used to test this) have developer_id = NULL
-- but a real, numeric developer_number. All 201 resolve correctly via
-- developers.developer_number instead. COALESCE prefers the direct id
-- join (3,037 rows) and only falls back to the number join for the
-- remainder.

DROP FUNCTION IF EXISTS public.list_developer_projects(text, text, integer);

CREATE OR REPLACE FUNCTION public.list_developer_projects(
  developer_pattern text,
  developer_exact text DEFAULT NULL,
  row_limit integer DEFAULT 50
)
RETURNS TABLE(
  project_name text,
  area_en text,
  project_status text,
  transaction_count bigint,
  avg_ppsqm numeric,
  developer_id bigint
)
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  SET LOCAL enable_bitmapscan = off;

  IF developer_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT dp.project_name, dp.area_name_en, dp.project_status,
             count(a.price_per_sqm) AS transaction_count,
             avg(a.price_per_sqm) AS avg_ppsqm,
             COALESCE(dp.developer_id, d.developer_id) AS developer_id
      FROM dld_projects dp
      LEFT JOIN avm a ON lower(a.project_name_en) = lower(dp.project_name)
      LEFT JOIN developers d ON dp.developer_id IS NULL
        AND dp.developer_number IS NOT NULL
        AND dp.developer_number ~ '^[0-9]+$'
        AND d.developer_number = dp.developer_number::integer
      WHERE lower(dp.developer_name) = lower(developer_exact)
      GROUP BY dp.project_name, dp.area_name_en, dp.project_status,
               COALESCE(dp.developer_id, d.developer_id)
      ORDER BY transaction_count DESC
      LIMIT row_limit;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT dp.project_name, dp.area_name_en, dp.project_status,
           count(a.price_per_sqm) AS transaction_count,
           avg(a.price_per_sqm) AS avg_ppsqm,
           COALESCE(dp.developer_id, d.developer_id) AS developer_id
    FROM dld_projects dp
    LEFT JOIN avm a ON lower(a.project_name_en) = lower(dp.project_name)
    LEFT JOIN developers d ON dp.developer_id IS NULL
      AND dp.developer_number IS NOT NULL
      AND dp.developer_number ~ '^[0-9]+$'
      AND d.developer_number = dp.developer_number::integer
    WHERE dp.developer_name ILIKE developer_pattern
    GROUP BY dp.project_name, dp.area_name_en, dp.project_status,
             COALESCE(dp.developer_id, d.developer_id)
    ORDER BY transaction_count DESC
    LIMIT row_limit;
END;
$$;

NOTIFY pgrst, 'reload schema';

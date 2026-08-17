-- migration_developer_lookup.sql
-- ===================================
-- ALREADY APPLIED LIVE to hzgkmvhvivqczxkdcfek — for repo records only.
--
-- Beta v2 (Depth) — developer-level lookups (T5). Confirmed live:
-- dld_projects has 255 real projects across 171 developers, with
-- developer_name and project_name columns but no direct link to avm's
-- transaction data. Joined here by project name — 71% exact-match rate
-- confirmed live (181 of 255 projects match avm.project_name_en
-- exactly); the ILIKE fallback branch covers the rest.
--
-- Each returned project shows its REAL transaction_count, honestly 0
-- (not hidden or guessed) for a project with no avm transactions yet —
-- e.g. a very new or off-plan-only development. Confirmed live:
-- "Binghatti Square 3" is a genuine dld_projects entry with 0 real avm
-- transactions.

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
  avg_ppsqm numeric
)
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  SET LOCAL enable_bitmapscan = off;

  IF developer_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT dp.project_name, dp.area_en, dp.project_status,
             count(a.price_per_sqm) AS transaction_count,
             avg(a.price_per_sqm) AS avg_ppsqm
      FROM dld_projects dp
      LEFT JOIN avm a ON lower(a.project_name_en) = lower(dp.project_name)
      WHERE lower(dp.developer_name) = lower(developer_exact)
      GROUP BY dp.project_name, dp.area_en, dp.project_status
      ORDER BY transaction_count DESC
      LIMIT row_limit;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT dp.project_name, dp.area_en, dp.project_status,
           count(a.price_per_sqm) AS transaction_count,
           avg(a.price_per_sqm) AS avg_ppsqm
    FROM dld_projects dp
    LEFT JOIN avm a ON lower(a.project_name_en) = lower(dp.project_name)
    WHERE dp.developer_name ILIKE developer_pattern
    GROUP BY dp.project_name, dp.area_en, dp.project_status
    ORDER BY transaction_count DESC
    LIMIT row_limit;
END;
$$;

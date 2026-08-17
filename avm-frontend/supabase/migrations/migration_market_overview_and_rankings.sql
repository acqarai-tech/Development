-- migration_market_overview_and_rankings.sql
-- ==================================================
-- ALREADY APPLIED LIVE to hzgkmvhvivqczxkdcfek — for repo records only.
--
-- Generalizes the "top N ranking" pattern beyond areas (the previous
-- migration) to cover the full request: "not just about areas — if user
-- asks about pricing, show that; if about areas, show that; if about
-- developers, show that." Confirmed real against live 2026 data before
-- building:
-- - market_overview: 226,361 real citywide transactions, averaging
--   22,210 AED/sqm (no area/project/developer needed at all).
-- - top_projects_by_volume: Maybach Six genuinely #1 (1,918 real sales).
-- - top_developers_by_volume: DAMAC Prime Development genuinely #1
--   (5,957 real sales, via a real join against dld_projects — same join
--   already proven in list_developer_projects).

CREATE OR REPLACE FUNCTION public.market_overview(target_year integer)
RETURNS TABLE(tx_count bigint, avg_ppsqm numeric, avg_worth numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT count(*) AS tx_count, avg(price_per_sqm) AS avg_ppsqm, avg(actual_worth) AS avg_worth
  FROM avm
  WHERE sale_year = target_year AND price_per_sqm IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.top_projects_by_volume(
  target_year integer,
  row_limit integer DEFAULT 10
)
RETURNS TABLE(project_name_en text, tx_count bigint, avg_ppsqm numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT project_name_en, count(*) AS tx_count, avg(price_per_sqm) AS avg_ppsqm
  FROM avm
  WHERE sale_year = target_year AND project_name_en IS NOT NULL
  GROUP BY project_name_en
  ORDER BY tx_count DESC
  LIMIT row_limit;
$$;

CREATE OR REPLACE FUNCTION public.top_projects_by_price(
  target_year integer,
  row_limit integer DEFAULT 10,
  min_transactions integer DEFAULT 10
)
RETURNS TABLE(project_name_en text, tx_count bigint, avg_ppsqm numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT project_name_en, count(*) AS tx_count, avg(price_per_sqm) AS avg_ppsqm
  FROM avm
  WHERE sale_year = target_year AND project_name_en IS NOT NULL AND price_per_sqm IS NOT NULL
  GROUP BY project_name_en
  HAVING count(*) >= min_transactions
  ORDER BY avg_ppsqm DESC
  LIMIT row_limit;
$$;

CREATE OR REPLACE FUNCTION public.top_developers_by_volume(
  target_year integer,
  row_limit integer DEFAULT 10
)
RETURNS TABLE(developer_name text, tx_count bigint, avg_ppsqm numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT dp.developer_name, count(a.price_per_sqm) AS tx_count, avg(a.price_per_sqm) AS avg_ppsqm
  FROM dld_projects dp
  JOIN avm a ON lower(a.project_name_en) = lower(dp.project_name)
  WHERE a.sale_year = target_year
  GROUP BY dp.developer_name
  ORDER BY tx_count DESC
  LIMIT row_limit;
$$;

CREATE OR REPLACE FUNCTION public.top_developers_by_price(
  target_year integer,
  row_limit integer DEFAULT 10,
  min_transactions integer DEFAULT 10
)
RETURNS TABLE(developer_name text, tx_count bigint, avg_ppsqm numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT dp.developer_name, count(a.price_per_sqm) AS tx_count, avg(a.price_per_sqm) AS avg_ppsqm
  FROM dld_projects dp
  JOIN avm a ON lower(a.project_name_en) = lower(dp.project_name)
  WHERE a.sale_year = target_year
  GROUP BY dp.developer_name
  HAVING count(a.price_per_sqm) >= min_transactions
  ORDER BY avg_ppsqm DESC
  LIMIT row_limit;
$$;

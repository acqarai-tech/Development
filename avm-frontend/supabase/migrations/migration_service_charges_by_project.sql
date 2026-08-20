-- migration_service_charges_by_project.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek, in three passes (see LIVE FIXES
-- below). This file reflects the CURRENT live, correct state.
--
-- Closes the highest-value finding from the coverage audit against the
-- architecture review and DLD reference pack: owners_association_charges
-- (DLD Dataset 25, 89,125 rows) was fully loaded and completely unused
-- by the chat pipeline. A prior session answered "why are my service
-- charges high" with a general-knowledge legal chunk purely because no
-- real data path existed for it -- the real data existed the whole time.
--
-- THIS TABLE'S REAL GRAIN, confirmed live before building anything (NOT
-- what a naive read of the column names suggests): service_cost is NOT
-- a project-level total AED/sqft rate. It's a PER-CATEGORY,
-- PER-PROPERTY-GROUP line item (Maintenance, Insurance, Reserved Fund,
-- Utilities, Management Services, Master Community, Income, etc --
-- averages ~8 categories per property group). Confirmed live: naively
-- summing every row for "International City Emarati" Residential 2023
-- (1,872 rows) gives a nonsense total of 2,223 -- because that blindly
-- sums across 233 DIFFERENT property groups at once. The correct total
-- is SUM(service_cost) WITHIN one property_group_id; a project-level
-- "typical" figure is the MEDIAN of those per-group totals ACROSS
-- property groups. Done correctly, International City Emarati comes
-- out to a median ~10 AED/sqft -- which matches its real-world
-- reputation as one of Dubai's cheapest areas. Re-verified against
-- Tenora (Dubai Marina): median 13.5 AED/sqft, 18 of 20 groups clean.
--
-- OUTLIER CEILING, also confirmed live before shipping: even done
-- correctly, per-group totals citywide (Residential, 2023) range from
-- 0 to 8,869 with a median of just 13 -- the tail is real data-quality
-- noise, not real luxury buildings (no legitimate Dubai building
-- charges anywhere near AED 8,869/sqft). A generous 150 AED/sqft
-- ceiling (double the top of the realistic 3-70+ range already
-- researched for the legal-knowledge chunks) excludes 139 of 1,357
-- groups citywide (10.2%) -- confirmed these are genuine outliers, not
-- a normal premium tail, by checking the distribution directly before
-- picking this number. The function reports exactly how many groups
-- were excluded per project, rather than silently dropping them.
--
-- MEDIAN, not AVERAGE, is the headline figure -- same discipline as
-- budget_area_recommendations, for the same reason: citywide AVERAGE
-- for the same 2023/Residential slice is 149.6 (badly skewed by the
-- outlier tail) against a MEDIAN of 13 -- the average alone would be
-- actively misleading here, not just imprecise.
--
-- project_pattern uses ILIKE fuzzy matching since this table's project
-- names are ALL CAPS DLD source formatting ("INTERNATIONAL CITY
-- EMARATI"), not necessarily identical spelling/casing to avm's
-- project_name_en -- same fuzzy-then-exact pattern as search_avm.
--
-- LIVE FIXES (same session, found immediately on first real query,
-- fixed and re-verified before moving on):
-- 1. STABLE functions cannot SET LOCAL a planner hint (needs VOLATILE)
--    -- the hint wasn't actually needed for this function's query shape
--    anyway, so it was removed rather than changing the function's
--    volatility.
-- 2. percentile_cont() returns double precision; the declared return
--    column is numeric -- added an explicit cast.

CREATE OR REPLACE FUNCTION public.service_charges_by_project(
  project_pattern text,
  project_exact text DEFAULT NULL::text,
  usage_filter text DEFAULT 'Residential',
  target_year integer DEFAULT NULL,
  min_groups integer DEFAULT 3
)
RETURNS TABLE(
  matched_project_name text,
  master_community_name text,
  resolved_year integer,
  n_property_groups integer,
  median_charge_per_sqft numeric,
  min_charge_per_sqft numeric,
  max_charge_per_sqft numeric,
  n_excluded_outliers integer
)
LANGUAGE plpgsql
STABLE
AS $function$
declare
  v_project text;
  v_year int;
begin
  -- Resolve the project name: exact match first (fast path), else
  -- fuzzy. Picks the most-recorded matching project name if the
  -- pattern is ambiguous, same "most real activity wins" principle
  -- used elsewhere in this pipeline.
  if project_exact is not null then
    select o.project_name into v_project
    from owners_association_charges o
    where upper(o.project_name) = upper(project_exact)
    limit 1;
  end if;

  if v_project is null then
    select o.project_name into v_project
    from owners_association_charges o
    where o.project_name ilike project_pattern
      and o.project_name is not null and o.project_name <> 'UNSPECIFIED PROJECT'
    group by o.project_name
    order by count(*) desc
    limit 1;
  end if;

  if v_project is null then
    return;
  end if;

  -- Resolve year: the requested one, or the most recent year that
  -- project actually has data for -- never guessed.
  if target_year is not null then
    v_year := target_year;
  else
    select max(o.budget_year) into v_year
    from owners_association_charges o
    where o.project_name = v_project and o.usage_name_en = usage_filter;
  end if;

  if v_year is null then
    return;
  end if;

  return query
    with per_group as (
      select o.property_group_id, sum(o.service_cost) as total
      from owners_association_charges o
      where o.project_name = v_project
        and o.usage_name_en = usage_filter
        and o.budget_year = v_year
      group by o.property_group_id
    ),
    clean as (
      select total from per_group where total between 0 and 150
    )
    select
      v_project,
      (select o.master_community_name_en from owners_association_charges o
        where o.project_name = v_project limit 1),
      v_year,
      (select count(*)::int from clean),
      (select percentile_cont(0.5) within group (order by total)::numeric from clean),
      (select min(total) from clean),
      (select max(total) from clean),
      (select count(*)::int from per_group) - (select count(*)::int from clean)
    where (select count(*) from clean) >= min_groups;
end;
$function$;

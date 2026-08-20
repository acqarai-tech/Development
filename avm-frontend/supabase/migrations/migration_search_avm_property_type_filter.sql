-- migration_search_avm_property_type_filter.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek. Closes item #5 from the
-- ongoing "what's left" repo audit: search_avm and search_avm_by_project
-- (backing lookup_area_data, lookup_project_data, and
-- get_recent_transactions -- most of the ordinary price-lookup traffic
-- in the whole product) had no property_type_en filter at all.
--
-- First discovered as a side effect while building
-- budget_area_recommendations (see migration_budget_area_recommendations.sql):
-- raw avm mixes Land (126,684 rows) and Building (30,916 rows) sales in
-- with genuine residential Unit/Villa/Residential sales, plus a small
-- number of non-arm's-length transfers recorded at nominal value (as
-- low as AED 1). Confirmed at the time that search_avm had the SAME gap
-- but wasn't fixed then -- flagged as a separate, wider finding, fixed
-- here.
--
-- CONFIRMED LIVE, before/after: "Mena Jabal Ali" (the exact area that
-- exposed this bug originally, via budget_area_recommendations)
-- returned a nonsensical 52.5 AED/sqm average before this fix -- it now
-- returns ZERO rows from search_avm, meaning it never had any genuine
-- residential transaction on record; it was pure industrial/land data
-- masquerading as a residential price. For a real residential area
-- (JVC), the effect is present but modest (16,616 -> 16,261 AED/sqm
-- avg, 1.29M -> 1.11M avg worth) -- confirming the fix targets genuine
-- contamination without distorting areas that were already mostly
-- clean.
--
-- 'Residential' is included alongside 'Unit'/'Villa' here -- NOT in the
-- original budget_area_recommendations fix. Checked live: 'Residential'
-- rows carry real rooms_en values (1-5 bedrooms, tens of thousands of
-- rows), indistinguishable in kind from 'Unit' rows. Excluding it would
-- have under-counted genuine residential supply. Worth revisiting
-- budget_area_recommendations for the same refinement -- not done in
-- this migration.
--
-- (actual_worth IS NULL OR actual_worth >= 50000) -- deliberately not a
-- bare floor: a bare "actual_worth >= 50000" would silently drop any
-- row with a real price_per_sqm but a null actual_worth. Only excludes
-- rows that HAVE a nominal/junk actual_worth (confirmed live: 1,536
-- real rows sit below this floor among Unit/Villa/Residential).
-- Included here specifically because get_recent_transactions() shows
-- individual transactions directly to users -- a literal "AED 1" sale
-- in a "recent transactions" list would be an obvious, embarrassing
-- tell that budget_area_recommendations (aggregate-only) didn't have to
-- worry about the same way.
--
-- PERFORMANCE (verified via EXPLAIN ANALYZE before shipping, per this
-- project's own "don't copy SQL hints blindly, verify inner plans
-- directly" lesson): the exact-match path (area_exact/project_exact,
-- uses idx_avm_instance_date, already fetches the full row for its
-- area filter) is unaffected -- ~58ms warm, unchanged. The ILIKE
-- fallback path WOULD have silently dropped from an index-only scan to
-- a full sequential scan without action -- confirmed live before
-- fixing (JVC ILIKE fallback: index-only scan, 58ms -> seq scan,
-- 4.5s). Fixed by extending idx_avm_area_covering,
-- idx_avm_area_lower_covering, and idx_avm_project_lower_covering to
-- also cover property_type_en and actual_worth_capped_flag, via
-- CREATE INDEX CONCURRENTLY / DROP INDEX CONCURRENTLY (zero downtime,
-- run as separate execute_sql statements outside a transaction block,
-- same convention as every other index change in this project).
-- Re-verified after: index-only scan restored, Heap Fetches: 0,
-- performance parity with the pre-filter baseline.
--
-- Run the index changes below ONE STATEMENT AT A TIME via a tool that
-- does not wrap them in a transaction (e.g. Supabase's execute_sql, not
-- apply_migration) -- CREATE/DROP INDEX CONCURRENTLY cannot run inside
-- one. The function replacements at the bottom are safe to run as a
-- normal tracked migration.

-- --- Index changes (run individually, NOT in a transaction) ---
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avm_area_covering_v2
  ON public.avm USING btree (area_name_en)
  INCLUDE (price_per_sqm, actual_worth, instance_date, rooms_en, project_name_en, procedure_area, property_type_en, actual_worth_capped_flag);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avm_area_lower_covering_v2
  ON public.avm USING btree (lower(area_name_en))
  INCLUDE (price_per_sqm, actual_worth, instance_date, rooms_en, project_name_en, procedure_area, sale_year, property_type_en, actual_worth_capped_flag);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avm_project_lower_covering_v2
  ON public.avm USING btree (lower(project_name_en))
  INCLUDE (price_per_sqm, actual_worth, instance_date, rooms_en, area_name_en, procedure_area, property_type_en, actual_worth_capped_flag);

DROP INDEX CONCURRENTLY IF EXISTS idx_avm_area_covering;
DROP INDEX CONCURRENTLY IF EXISTS idx_avm_area_lower_covering;
DROP INDEX CONCURRENTLY IF EXISTS idx_avm_project_lower_covering;

ALTER INDEX idx_avm_area_covering_v2 RENAME TO idx_avm_area_covering;
ALTER INDEX idx_avm_area_lower_covering_v2 RENAME TO idx_avm_area_lower_covering;
ALTER INDEX idx_avm_project_lower_covering_v2 RENAME TO idx_avm_project_lower_covering;

-- --- Function changes (safe as a normal tracked migration) ---
CREATE OR REPLACE FUNCTION public.search_avm(
  area_pattern text,
  room_types text[] DEFAULT NULL::text[],
  row_limit integer DEFAULT 500,
  project_pattern text DEFAULT NULL::text,
  area_exact text DEFAULT NULL::text,
  require_project boolean DEFAULT false,
  require_rooms boolean DEFAULT false
)
RETURNS TABLE(area_name_en text, price_per_sqm numeric, actual_worth numeric, instance_date date, rooms_en text, procedure_area numeric, project_name_en text)
LANGUAGE plpgsql
AS $function$
begin
  set local enable_bitmapscan = off;
  set local max_parallel_workers_per_gather = 0;

  if area_exact is not null then
    return query
      select a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      from avm a
      where lower(a.area_name_en) = lower(area_exact)
        and (room_types is null or a.rooms_en = any(room_types))
        and (project_pattern is null or a.project_name_en ilike project_pattern)
        and (not require_project or a.project_name_en is not null)
        and (not require_rooms or a.rooms_en is not null)
        and a.property_type_en in ('Unit', 'Villa', 'Residential')
        and coalesce(a.actual_worth_capped_flag, false) = false
        and (a.actual_worth is null or a.actual_worth >= 50000)
      order by a.instance_date desc
      limit row_limit;

    if found then
      return;
    end if;
  end if;

  return query
    with matches as materialized (
      select a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      from avm a
      where a.area_name_en ilike area_pattern
        and (room_types is null or a.rooms_en = any(room_types))
        and (project_pattern is null or a.project_name_en ilike project_pattern)
        and (not require_project or a.project_name_en is not null)
        and (not require_rooms or a.rooms_en is not null)
        and a.property_type_en in ('Unit', 'Villa', 'Residential')
        and coalesce(a.actual_worth_capped_flag, false) = false
        and (a.actual_worth is null or a.actual_worth >= 50000)
    )
    select * from matches order by instance_date desc limit row_limit;
end;
$function$;

CREATE OR REPLACE FUNCTION public.search_avm_by_project(
  project_pattern text,
  project_exact text DEFAULT NULL::text,
  room_types text[] DEFAULT NULL::text[],
  row_limit integer DEFAULT 500
)
RETURNS TABLE(area_name_en text, price_per_sqm numeric, actual_worth numeric, instance_date date, rooms_en text, procedure_area numeric, project_name_en text)
LANGUAGE plpgsql
STABLE
AS $function$
begin
  if project_exact is not null then
    return query
      select a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      from avm a
      where lower(a.project_name_en) = lower(project_exact)
        and (room_types is null or a.rooms_en = any(room_types))
        and a.property_type_en in ('Unit', 'Villa', 'Residential')
        and coalesce(a.actual_worth_capped_flag, false) = false
        and (a.actual_worth is null or a.actual_worth >= 50000)
      order by a.instance_date desc
      limit row_limit;

    if found then
      return;
    end if;
  end if;

  return query
    with matches as materialized (
      select a.area_name_en, a.price_per_sqm, a.actual_worth, a.instance_date,
             a.rooms_en, a.procedure_area, a.project_name_en
      from avm a
      where a.project_name_en ilike project_pattern
        and (room_types is null or a.rooms_en = any(room_types))
        and a.property_type_en in ('Unit', 'Villa', 'Residential')
        and coalesce(a.actual_worth_capped_flag, false) = false
        and (a.actual_worth is null or a.actual_worth >= 50000)
    )
    select * from matches order by instance_date desc limit row_limit;
end;
$function$;

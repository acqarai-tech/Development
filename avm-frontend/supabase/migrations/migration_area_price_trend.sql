-- migration_search_avm_add_project.sql
-- =======================================
-- Extends the existing search_avm RPC:
-- 1. Adds project_name_en to the returned columns — needed so
--    get_recent_transactions() can show which project each real sale
--    belongs to (previously not selected at all, so it could never be
--    displayed no matter what the app code did with it).
-- 2. Adds an optional project_pattern parameter (default NULL, so every
--    existing call site that doesn't pass it keeps working unchanged)
--    so a project-specific question can filter transactions down to a
--    single project rather than the whole area.
--
-- Backward compatible: existing callers passing only
-- (area_pattern, room_types, row_limit) are unaffected since
-- project_pattern defaults to NULL (no filtering).

create or replace function public.search_avm(
  area_pattern text,
  room_types text[] default null,
  row_limit integer default 500,
  project_pattern text default null
)
returns table(
  area_name_en text,
  price_per_sqm numeric,
  actual_worth numeric,
  instance_date date,
  rooms_en text,
  procedure_area numeric,
  project_name_en text
)
language sql
stable
as $$
  with matches as materialized (
    select avm.area_name_en, avm.price_per_sqm, avm.actual_worth,
           avm.instance_date, avm.rooms_en, avm.procedure_area,
           avm.project_name_en
    from avm
    where avm.area_name_en ilike area_pattern
      and (room_types is null or avm.rooms_en = any(room_types))
      and (project_pattern is null or avm.project_name_en ilike project_pattern)
  )
  select * from matches order by instance_date desc limit row_limit;
$$;

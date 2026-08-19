-- migration_developers_by_id.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19.
--
-- Closes Part Two, issue #10 (P2) of the DLD reference pack: `developers`
-- (2,317 rows, Dataset 21) had never been queried anywhere in the app.
--
-- Simple exact-id lookup, no fuzzy text matching needed or wanted here --
-- the caller (get_developer_info in stage4) already has the exact
-- developer_id(s) from list_developer_projects' results (see
-- migration_list_developer_projects_fix_and_developer_id.sql), so
-- there's no ambiguity to resolve at this layer. Small table (2,317
-- rows); no special planner hints needed -- confirmed live those hints
-- caused a real regression on rental_yield_by_area when copied
-- somewhere they weren't actually needed, so not repeating that here
-- without cause.

CREATE OR REPLACE FUNCTION public.developers_by_id(ids bigint[])
RETURNS TABLE(
  developer_id bigint,
  developer_name_en text,
  legal_status_en text,
  license_type_en text,
  license_number text,
  license_expiry_date date,
  registration_date date
)
LANGUAGE sql
STABLE
AS $$
  SELECT d.developer_id, d.developer_name_en, d.legal_status_en,
         d.license_type_en, d.license_number, d.license_expiry_date,
         d.registration_date
  FROM developers d
  WHERE d.developer_id = ANY(ids);
$$;

NOTIFY pgrst, 'reload schema';

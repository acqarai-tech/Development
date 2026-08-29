-- migration_escrow_agent_by_project.sql
-- ===================================
-- ALREADY APPLIED LIVE to hzgkmvhvivqczxkdcfek — for repo records only.
--
-- New functionality: resolves the real escrow bank/agent safeguarding
-- buyer payments for a named project, joining dld_projects.escrow_agent_id
-- to escrow_agents.escrow_agent_number. Confirmed live: 2,879 of 3,240
-- dld_projects rows carry a real escrow_agent_id.
--
-- Shipped as v3 after two live-verified rejections of earlier approaches:
--
-- v1 (join on dld_projects.project_name) — REJECTED. Confirmed live:
-- dld_projects.project_name is Arabic-only for 93% of rows with an
-- escrow_agent_id on file (2,683 of 2,879) — an English project_pattern
-- from Stage 2 would almost never match it.
--
-- v2 (pivot through project_number, plain text match) — REJECTED.
-- Confirmed live: avm.project_number carries mixed formats for the SAME
-- project ("Emirates Living - Springs 10" has 65 rows as "1047" and 714
-- rows as "1047.00"), while dld_projects.project_number is always the
-- clean integer form (3,240/3,240, zero decimals). A plain LIMIT 1 with
-- no ORDER BY could silently pick the "1047.00" variant, which then
-- failed a plain text-equals against dld_projects' "1047" — zero rows,
-- not an error, so this would have quietly returned "no escrow data" for
-- real matches roughly 82% of the time (1,011,028 of the ~1.65M avm rows
-- with a project_number carry the decimal-suffixed form).
--
-- v3 (this version) — resolves the project the same way
-- search_avm_by_project does (exact lower() match on avm.project_name_en
-- first, ILIKE pattern fallback), then normalizes both sides through
-- ::numeric before joining on project_number, guarded by a digit-pattern
-- check so a non-numeric project_number never throws a cast error.
--
-- Verified live against a real project (Emirates Living - Springs 10 ->
-- MASHREQ BANK PSC), a case-insensitivity check, and a genuinely
-- nonexistent project (empty result set, no error). Coverage is honest,
-- not complete: confirmed live that 2,138 of 3,875 distinct avm project
-- names (55%) resolve a real escrow agent this way — the other 45%
-- return zero rows, which the caller (get_escrow_agent() in
-- stage4_lookup_area_data.py) treats as "no escrow data available,"
-- never a fabricated agent.

DROP FUNCTION IF EXISTS public.escrow_agent_by_project(text, text);

CREATE FUNCTION public.escrow_agent_by_project(
  project_pattern text,
  project_exact text DEFAULT NULL
)
RETURNS TABLE(
  project_name_en text,
  escrow_agent_name_en text,
  escrow_agent_phone text
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  matched_project_number numeric;
  matched_project_name text;
BEGIN
  IF project_exact IS NOT NULL THEN
    SELECT a.project_number::numeric, a.project_name_en
      INTO matched_project_number, matched_project_name
    FROM avm a
    WHERE lower(a.project_name_en) = lower(project_exact)
      AND a.project_number ~ '^[0-9]+(\.[0-9]+)?$'
    LIMIT 1;
  END IF;

  IF matched_project_number IS NULL THEN
    SELECT a.project_number::numeric, a.project_name_en
      INTO matched_project_number, matched_project_name
    FROM avm a
    WHERE a.project_name_en ILIKE project_pattern
      AND a.project_number ~ '^[0-9]+(\.[0-9]+)?$'
    LIMIT 1;
  END IF;

  IF matched_project_number IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT matched_project_name, ea.escrow_agent_name_en, ea.phone
    FROM dld_projects dp
    JOIN escrow_agents ea ON ea.escrow_agent_number = dp.escrow_agent_id
    WHERE dp.project_number ~ '^[0-9]+(\.[0-9]+)?$'
      AND dp.project_number::numeric = matched_project_number
    LIMIT 1;
END;
$$;

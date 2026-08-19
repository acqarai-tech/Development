-- migration_list_area_developers.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19, in two passes
-- (see LIVE FIX below). This file reflects the CURRENT live state.
--
-- Closes a confirmed-live gap found via user testing: "tell the
-- developers in JVC" had no matching question_type at all — it was
-- silently misclassified as "area_report", dropping the word
-- "developers" entirely and returning an unrelated price snapshot with
-- a conclusion that never acknowledged developers were asked about.
--
-- Distinct from list_developer_projects (needs one specific NAMED
-- developer) and list_area_projects (about the projects, not who built
-- them). Groups dld_projects by developer for a given area, joined with
-- real avm transaction data. Same developer_id-resolution logic (direct
-- id, falling back to developer_number for legacy-sourced rows) as
-- migration_list_developer_projects_fix_and_developer_id.sql, so a
-- follow-up developers_by_id() call ties license info to the exact same
-- legal entities shown here.
--
-- Confirmed live: JVC has ZERO dld_projects rows under any spelling —
-- a genuine data gap (not a naming mismatch, checked both "jvc" and
-- "jumeirah village" patterns). This function correctly returns empty
-- for JVC; the honest "no developer data yet" fallback is handled in
-- Python (get_area_developers), not faked here.
--
-- LIVE FIX (found via user testing, same day): GROUP BY originally
-- included both dp.developer_name AND developer_id.
-- dld_projects.developer_name is free text and genuinely inconsistent
-- for the SAME real developer_id across different project rows —
-- confirmed live: Emaar in Marsa Dubai (developer_id 137044480)
-- appeared under THREE different spellings ("اعمار العقارية (ش . م. ع)",
-- "EMAAR DEVELOPMENT P.J.S.C.", "إعمار للتطوير (مساهمة عامة)"),
-- fragmenting one real developer's activity into three separate ranked
-- rows (2+920, 1+1, 13+0 transactions) instead of the correct single
-- row (16 projects, 921 transactions). Fixed by grouping by the
-- resolved developer_id ALONE — the only reliable key — with
-- MIN(dp.developer_name) kept only as a last-resort display fallback
-- for when developer_info (stage4/ai_chat.py) has no resolved name.

CREATE OR REPLACE FUNCTION public.list_area_developers(
  area_pattern text,
  area_exact text DEFAULT NULL,
  row_limit integer DEFAULT 20
)
RETURNS TABLE(
  developer_name text,
  developer_id bigint,
  project_count bigint,
  transaction_count bigint,
  avg_ppsqm numeric
)
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  SET LOCAL enable_bitmapscan = off;

  IF area_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT MIN(dp.developer_name) AS developer_name,
             COALESCE(dp.developer_id, d.developer_id) AS developer_id,
             count(DISTINCT dp.project_name) AS project_count,
             count(a.price_per_sqm) AS transaction_count,
             avg(a.price_per_sqm) AS avg_ppsqm
      FROM dld_projects dp
      LEFT JOIN avm a ON lower(a.project_name_en) = lower(dp.project_name)
      LEFT JOIN developers d ON dp.developer_id IS NULL
        AND dp.developer_number IS NOT NULL
        AND dp.developer_number ~ '^[0-9]+$'
        AND d.developer_number = dp.developer_number::integer
      WHERE lower(dp.area_name_en) = lower(area_exact)
        AND dp.developer_name IS NOT NULL
      GROUP BY COALESCE(dp.developer_id, d.developer_id)
      ORDER BY transaction_count DESC
      LIMIT row_limit;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT MIN(dp.developer_name) AS developer_name,
           COALESCE(dp.developer_id, d.developer_id) AS developer_id,
           count(DISTINCT dp.project_name) AS project_count,
           count(a.price_per_sqm) AS transaction_count,
           avg(a.price_per_sqm) AS avg_ppsqm
    FROM dld_projects dp
    LEFT JOIN avm a ON lower(a.project_name_en) = lower(dp.project_name)
    LEFT JOIN developers d ON dp.developer_id IS NULL
      AND dp.developer_number IS NOT NULL
      AND dp.developer_number ~ '^[0-9]+$'
      AND d.developer_number = dp.developer_number::integer
    WHERE dp.area_name_en ILIKE area_pattern
      AND dp.developer_name IS NOT NULL
    GROUP BY COALESCE(dp.developer_id, d.developer_id)
    ORDER BY transaction_count DESC
    LIMIT row_limit;
END;
$$;

NOTIFY pgrst, 'reload schema';

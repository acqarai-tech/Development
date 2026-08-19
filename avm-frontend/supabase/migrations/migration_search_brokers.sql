-- migration_search_brokers.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek on 2026-08-19.
--
-- Closes Part Three §3.1's Broker entity (Dataset 18 — Real Estate
-- Brokers), previously marked "optional, not blocking" in the doc but
-- confirmed live to already have 8,724 real rows sitting completely
-- unused -- zero references anywhere in the codebase before this.
--
-- Name-based lookup only: real_estate_brokers has no area_id/area_name
-- column at all, so an area-based "brokers in Business Bay" question is
-- genuinely out of scope for this table -- not built here, not faked.
-- real_estate_offices (joined via real_estate_number) has no office/
-- company name column either, so this returns the broker's own real
-- data only, not a fabricated agency name.
--
-- Small table (8,724 rows, similar order of magnitude to developers'
-- 2,317) -- no covering index or planner hints added without cause,
-- same discipline established earlier this session after the
-- rental_yield_by_area regression from copying hints that weren't
-- actually needed.

CREATE OR REPLACE FUNCTION public.search_brokers(
  name_pattern text,
  name_exact text DEFAULT NULL,
  row_limit int DEFAULT 10
)
RETURNS TABLE(
  broker_name_en text,
  phone text,
  license_start_date date,
  license_end_date date,
  real_estate_number int
)
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  IF name_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT b.broker_name_en, b.phone, b.license_start_date, b.license_end_date,
             b.real_estate_number
      FROM real_estate_brokers b
      WHERE lower(b.broker_name_en) = lower(name_exact)
      LIMIT row_limit;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT b.broker_name_en, b.phone, b.license_start_date, b.license_end_date,
           b.real_estate_number
    FROM real_estate_brokers b
    WHERE b.broker_name_en ILIKE name_pattern
    LIMIT row_limit;
END;
$$;

NOTIFY pgrst, 'reload schema';

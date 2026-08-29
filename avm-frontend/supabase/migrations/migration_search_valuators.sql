-- migration_search_valuators.sql
-- ===================================
-- ALREADY APPLIED LIVE to hzgkmvhvivqczxkdcfek — for repo records only.
--
-- New functionality: licensed_valuators (151 real rows) had zero
-- references anywhere in the app before this. Search by name, exact-
-- then-ILIKE fallback, same convention as search_brokers. Confirmed
-- live: 149 of 151 valuator names are unique; 2 real names genuinely
-- belong to two distinct licensed records (e.g. "ABDULLATIF MOHAMMAD
-- IBRAHIM ABDULLA AL BANNA" appears under two different valuation
-- companies) — same collision shape as real_estate_brokers, so the
-- caller (get_valuator_info() in stage4_lookup_area_data.py) always
-- returns every match as a list, never picks one arbitrarily. Ordered
-- by soonest-expiring-first so an ambiguous name match is at least
-- deterministic and surfaces the most urgent license status first.
--
-- Verified live: exact match (Zaher Ibrahim -> real license dates),
-- case-insensitivity, the real 2-row collision case, and a genuinely
-- nonexistent name (empty result, no error).
CREATE OR REPLACE FUNCTION public.search_valuators(
  name_pattern text,
  name_exact text DEFAULT NULL,
  row_limit integer DEFAULT 10
)
RETURNS TABLE(
  valuator_name_en text,
  valuation_company_name_en text,
  license_start_date date,
  license_end_date date,
  valuator_nationality_en text
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF name_exact IS NOT NULL THEN
    RETURN QUERY
      SELECT v.valuator_name_en, v.valuation_company_name_en,
             v.license_start_date, v.license_end_date, v.valuator_nationality_en
      FROM licensed_valuators v
      WHERE lower(v.valuator_name_en) = lower(name_exact)
      ORDER BY v.license_end_date DESC NULLS LAST
      LIMIT row_limit;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
    SELECT v.valuator_name_en, v.valuation_company_name_en,
           v.license_start_date, v.license_end_date, v.valuator_nationality_en
    FROM licensed_valuators v
    WHERE v.valuator_name_en ILIKE name_pattern
    ORDER BY v.license_end_date DESC NULLS LAST
    LIMIT row_limit;
END;
$$;

-- migration_area_price_trend.sql
-- ================================
-- New RPC backing stage4_lookup_area_data.get_price_trend().
--
-- Same reasoning as the existing search_avm RPC (confirmed live: a plain
-- client-side query against avm's 1.65M rows is unreliable — timed out
-- for some areas). This groups by sale_year SERVER-SIDE so the client
-- (Stage 4) only ever gets back a handful of yearly rows, never the raw
-- transaction set.
--
-- room_types is optional (NULL = area-wide trend, not bedroom-specific),
-- matching search_avm's existing room_types parameter shape so Stage 4
-- can reuse the same _bedroom_label_variants() helper for both.

create or replace function public.area_price_trend(
  area_pattern text,
  room_types text[] default null
)
returns table(sale_year int, avg_ppsqm numeric, tx_count bigint)
language sql
stable
as $$
  select
    avm.sale_year,
    avg(avm.price_per_sqm) as avg_ppsqm,
    count(*) as tx_count
  from avm
  where avm.area_name_en ilike area_pattern
    and avm.price_per_sqm is not null
    and avm.sale_year is not null
    and (room_types is null or avm.rooms_en = any(room_types))
  group by avm.sale_year
  order by avm.sale_year asc;
$$;

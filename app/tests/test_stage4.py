"""
Stage 4 tests — lookup_area_data(), get_recent_transactions(), and every
newer addition (get_all_areas(), get_district_properties(), get_price_trend(),
_format_room_type(), avg_price_per_sqft, project filtering/display) all in one
file. Previously split across test_stage4.py and test_stage4_new_features.py —
merged here per request, since both test the same module.

NOTE: this file was rewritten after switching from a plain .select() query
to the search_avm RPC function — confirmed live that the plain query was
UNRELIABLE (worked fine for JVC, timed out at 27+ seconds for "Dubai
Islands" with the identical query shape). The RPC wraps the query in a
MATERIALIZED CTE on the database side, which is not something the plain
Supabase Python query builder can express — hence calling it via .rpc()
instead of .table().select()...
"""
import os
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("SUPABASE_URL_CHAT", "https://example.supabase.co")
os.environ.setdefault(
    "SUPABASE_SERVICE_ROLE_KEY_CHAT",
    "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9."
    "eyJyb2xlIjogInNlcnZpY2Vfcm9sZSIsICJpc3MiOiAic3VwYWJhc2UtZGVtbyJ9."
    "fakesignature",
)

import stage4_lookup_area_data as stage4
import clients


def _mock_rpc_result(rows):
    """Mocks supabase.rpc(name, params).execute() -> object with .data"""
    mock_execute = MagicMock()
    mock_execute.data = rows
    mock_rpc_builder = MagicMock()
    mock_rpc_builder.execute.return_value = mock_execute
    return mock_rpc_builder


def test_normal_case_aggregates_correctly():
    fake_rows = [
        {"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
         "actual_worth": 1600000, "instance_date": "2026-07-13"},
        {"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 17000,
         "actual_worth": 1700000, "instance_date": "2026-07-01"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_area_data("jvc")
    assert result["area"] == "JVC"
    assert result["transaction_sample_size"] == 2
    assert result["avg_price_per_sqm"] == 16500
    assert result["avg_actual_worth"] == 1650000


def test_normal_case_calls_rpc_with_correct_params():
    fake_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                  "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.lookup_area_data("jvc")
    mock_rpc.assert_called_once_with(
        "search_avm", {"area_pattern": "%jumeirah village circle (jvc)%", "room_types": None, "row_limit": 500,
                        "project_pattern": None, "area_exact": "jumeirah village circle (jvc)",
                        "require_project": False, "require_rooms": False}
    )


def test_no_matching_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.lookup_area_data("nonexistent area xyz")
    assert result is None


def test_none_area_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.lookup_area_data(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_rows_with_no_usable_numbers_returns_none():
    fake_rows = [{"area_name_en": "Some Area", "price_per_sqm": None,
                  "actual_worth": None, "instance_date": "2026-01-01"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_area_data("some area")
    assert result is None


def test_supabase_exception_returns_none_not_crash():
    """The real timeout bug found live — must degrade gracefully."""
    with patch.object(clients.supabase, "rpc", side_effect=Exception("statement timeout")):
        result = stage4.lookup_area_data("jvc")
    assert result is None


def test_downtown_resolves_to_burj_khalifa():
    """The real naming mismatch found live. The SEARCH still correctly
    targets Burj Khalifa's real avm data (that part was never wrong) —
    but the DISPLAYED name must be what the investor actually asked
    about, not the internal DB name the search redirected to (confirmed
    live: "Downtown Dubai" was coming back labeled "Burj Khalifa")."""
    fake_rows = [{"area_name_en": "Burj Khalifa", "price_per_sqm": 29840,
                  "actual_worth": 4496260, "instance_date": "2026-08-03"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.lookup_area_data("Downtown Dubai")
    assert result["area"] == "Downtown Dubai"
    call_args = mock_rpc.call_args[0][1]
    assert "burj khalifa" in call_args["area_pattern"].lower()


def test_downtown_short_form_also_displays_correctly():
    fake_rows = [{"area_name_en": "Burj Khalifa", "price_per_sqm": 29840,
                  "actual_worth": 4496260, "instance_date": "2026-08-03"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_area_data("Downtown")
    assert result["area"] == "Downtown Dubai"


def test_dubai_marina_displays_correctly_not_marsa_dubai():
    fake_rows = [{"area_name_en": "Marsa Dubai", "price_per_sqm": 16800,
                  "actual_worth": 1650000, "instance_date": "2026-08-03"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_area_data("Dubai Marina")
    assert result["area"] == "Dubai Marina"


def test_bedroom_label_variants_cover_all_known_real_formats():
    """Real DLD data encodes '1 bedroom' as THREE different labels,
    confirmed live: '1 B/R', '1.0', '1'. All three must be covered."""
    assert stage4._bedroom_label_variants(1) == ["1 B/R", "1.0", "1"]
    assert stage4._bedroom_label_variants(2) == ["2 B/R", "2.0", "2"]
    assert stage4._bedroom_label_variants(0) == ["Studio", "0.0", "0"]


def test_bedroom_breakdown_included_when_real_rows_exist():
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    bedroom_rows = [
        {"price_per_sqm": 15389, "actual_worth": 1098562, "procedure_area": 72.9},
        {"price_per_sqm": 16000, "actual_worth": 1100000, "procedure_area": 73.0},
    ]
    call_count = {"n": 0}

    def fake_rpc(name, params):
        call_count["n"] += 1
        return _mock_rpc_result(area_wide_rows if call_count["n"] == 1 else bedroom_rows)

    with patch.object(clients.supabase, "rpc", side_effect=fake_rpc):
        result = stage4.lookup_area_data("jvc", bedrooms=1)

    assert "bedroom_breakdown" in result
    assert result["bedroom_breakdown"]["bedrooms"] == 1
    assert result["bedroom_breakdown"]["transaction_sample_size"] == 2


def test_bedroom_lookup_passes_correct_room_types():
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    captured_calls = []

    def fake_rpc(name, params):
        captured_calls.append(params)
        return _mock_rpc_result(area_wide_rows if len(captured_calls) == 1 else [])

    with patch.object(clients.supabase, "rpc", side_effect=fake_rpc):
        stage4.lookup_area_data("jvc", bedrooms=1)

    assert captured_calls[1]["room_types"] == ["1 B/R", "1.0", "1"]


def test_no_bedroom_rows_falls_back_to_area_wide_only_no_lie():
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    call_count = {"n": 0}

    def fake_rpc(name, params):
        call_count["n"] += 1
        return _mock_rpc_result(area_wide_rows if call_count["n"] == 1 else [])

    with patch.object(clients.supabase, "rpc", side_effect=fake_rpc):
        result = stage4.lookup_area_data("jvc", bedrooms=7)

    assert "bedroom_breakdown" not in result
    assert result["avg_price_per_sqm"] == 16000


def test_bedrooms_none_never_triggers_second_rpc_call():
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(area_wide_rows)) as mock_rpc:
        result = stage4.lookup_area_data("jvc")
    assert mock_rpc.call_count == 1
    assert "bedroom_breakdown" not in result


def test_bedroom_lookup_exception_degrades_to_area_wide_only():
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    call_count = {"n": 0}

    def fake_rpc(name, params):
        call_count["n"] += 1
        if call_count["n"] == 1:
            return _mock_rpc_result(area_wide_rows)
        raise Exception("bedroom query failed")

    with patch.object(clients.supabase, "rpc", side_effect=fake_rpc):
        result = stage4.lookup_area_data("jvc", bedrooms=1)

    assert "bedroom_breakdown" not in result
    assert result["avg_price_per_sqm"] == 16000


# ---------------------------------------------------------------------------
# get_recent_transactions() — real individual sales, not aggregates
# ---------------------------------------------------------------------------
def test_get_recent_transactions_converts_units_correctly():
    fake_rows = [
        {"instance_date": "2026-07-13", "rooms_en": "Studio",
         "procedure_area": "37.96", "actual_worth": "744017.0", "price_per_sqm": "19600.03"},
        {"instance_date": "2026-07-13", "rooms_en": "1 B/R",
         "procedure_area": "51.25", "actual_worth": "1281000.0", "price_per_sqm": "24995.12"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_recent_transactions("jvc", limit=10)

    assert len(result) == 2
    assert result[0]["date"] == "2026-07-13"
    assert result[0]["type"] == "Studio"
    assert result[0]["size_sqft"] == round(37.96 * 10.7639)
    assert result[0]["price_aed"] == 744017
    assert result[0]["psf_aed"] == round(19600.03 / 10.7639)


def test_get_recent_transactions_calls_rpc_with_limit():
    """With only 1 fake row and limit=10, the complete-only attempt can't
    satisfy the request (1 < 10), so this correctly falls through to the
    mixed-fallback attempt — the RPC is called TWICE (complete-only,
    then fallback). Checking the LAST call's params, which is the one
    that actually determines the returned data."""
    fake_rows = [{"instance_date": "2026-07-13", "rooms_en": "Studio",
                  "procedure_area": "37.96", "actual_worth": "744017.0", "price_per_sqm": "19600.03"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_recent_transactions("jvc", limit=10)
    assert mock_rpc.call_count == 2
    last_call_args = mock_rpc.call_args[0][1]
    assert last_call_args == {"area_pattern": "%jumeirah village circle (jvc)%", "room_types": None,
                               "row_limit": 10, "project_pattern": None,
                               "area_exact": "jumeirah village circle (jvc)", "require_project": False,
                               "require_rooms": False}
    first_call_args = mock_rpc.call_args_list[0][0][1]
    assert first_call_args["require_project"] is True
    assert first_call_args["require_rooms"] is True


def test_get_recent_transactions_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_recent_transactions("nonexistent area xyz")
    assert result is None


def test_get_recent_transactions_none_area_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_recent_transactions(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_recent_transactions_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("statement timeout")):
        result = stage4.get_recent_transactions("jvc")
    assert result is None


def test_get_recent_transactions_handles_missing_fields_gracefully():
    fake_rows = [{"instance_date": "2026-07-13", "rooms_en": "Studio",
                  "procedure_area": None, "actual_worth": "744017.0", "price_per_sqm": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_recent_transactions("jvc")
    assert result[0]["size_sqft"] is None
    assert result[0]["psf_aed"] is None
    assert result[0]["price_aed"] == 744017


# ===========================================================================
# Everything below was previously test_stage4_new_features.py, merged in here
# ===========================================================================


def _mock_table_select_order(rows):
    """Mocks supabase.table(x).select(y).order(z).execute() -> .data"""
    mock_execute = MagicMock()
    mock_execute.data = rows
    mock_table = MagicMock()
    mock_table.select.return_value.order.return_value.execute.return_value = mock_execute
    return mock_table


def _mock_table_select_ilike_limit(rows, count):
    """Mocks supabase.table(x).select(y, count=z).ilike(...).limit(...).execute()"""
    mock_execute = MagicMock()
    mock_execute.data = rows
    mock_execute.count = count
    mock_table = MagicMock()
    (mock_table.select.return_value.ilike.return_value
     .limit.return_value.execute.return_value) = mock_execute
    return mock_table


# ---------------------------------------------------------------------------
# avg_price_per_sqft — added to existing lookup_area_data()
# ---------------------------------------------------------------------------
def test_avg_price_per_sqft_computed_alongside_sqm():
    fake_rows = [
        {"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
         "actual_worth": 1600000, "instance_date": "2026-07-13"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_area_data("jvc")
    assert result["avg_price_per_sqm"] == 16000
    assert result["avg_price_per_sqft"] == round(16000 / stage4.SQM_TO_SQFT)


def test_bedroom_breakdown_also_includes_sqft():
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    bedroom_rows = [{"price_per_sqm": 15000, "actual_worth": 1098562, "procedure_area": 72.9}]
    call_count = {"n": 0}

    def fake_rpc(name, params):
        call_count["n"] += 1
        return _mock_rpc_result(area_wide_rows if call_count["n"] == 1 else bedroom_rows)

    with patch.object(clients.supabase, "rpc", side_effect=fake_rpc):
        result = stage4.lookup_area_data("jvc", bedrooms=1)

    assert result["bedroom_breakdown"]["avg_price_per_sqft"] == round(15000 / stage4.SQM_TO_SQFT)


def test_bedroom_breakdown_size_also_includes_sqft():
    """Confirmed live: only avg_size_sqm was shown, no sqft equivalent —
    same fix as avg_price_per_sqft, applied to size instead of price."""
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    bedroom_rows = [{"price_per_sqm": 15000, "actual_worth": 1098562, "procedure_area": 72.9}]
    call_count = {"n": 0}

    def fake_rpc(name, params):
        call_count["n"] += 1
        return _mock_rpc_result(area_wide_rows if call_count["n"] == 1 else bedroom_rows)

    with patch.object(clients.supabase, "rpc", side_effect=fake_rpc):
        result = stage4.lookup_area_data("jvc", bedrooms=1)

    breakdown = result["bedroom_breakdown"]
    assert breakdown["avg_size_sqm"] == 72.9
    assert breakdown["avg_size_sqft"] == round(72.9 * stage4.SQM_TO_SQFT)


# ---------------------------------------------------------------------------
# get_all_areas() — backed by "districts" (397 real rows)
# ---------------------------------------------------------------------------
def test_get_all_areas_returns_real_rows():
    fake_rows = [
        {"district_code": "D001", "district_name": "4 Al Yilayis St"},
        {"district_code": "D002", "district_name": "Abu Hail, Deira"},
    ]
    with patch.object(clients.supabase, "table", return_value=_mock_table_select_order(fake_rows)):
        result = stage4.get_all_areas()
    assert len(result) == 2
    assert result[0]["district_name"] == "4 Al Yilayis St"


def test_get_all_areas_empty_returns_none():
    with patch.object(clients.supabase, "table", return_value=_mock_table_select_order([])):
        result = stage4.get_all_areas()
    assert result is None


def test_get_all_areas_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "table", side_effect=Exception("connection error")):
        result = stage4.get_all_areas()
    assert result is None


# ---------------------------------------------------------------------------
# get_district_properties() — backed by "district_properties"
# (20,803 real rows — must return the REAL total, not just len(returned))
# ---------------------------------------------------------------------------
def test_get_district_properties_returns_capped_list_and_real_total():
    fake_rows = [{"property_name": f"Property {i}"} for i in range(50)]
    with patch.object(clients.supabase, "table",
                       return_value=_mock_table_select_ilike_limit(fake_rows, count=214)):
        properties, total = stage4.get_district_properties("Dubai Hills Estate", limit=50)
    assert len(properties) == 50
    assert total == 214  # NOT 50 — the real total, even though the list is capped


def test_get_district_properties_none_area_returns_none_zero():
    with patch.object(clients.supabase, "table") as mock_table:
        properties, total = stage4.get_district_properties(None)
    assert properties is None
    assert total == 0
    mock_table.assert_not_called()


def test_get_district_properties_no_matches_returns_none_zero():
    with patch.object(clients.supabase, "table",
                       return_value=_mock_table_select_ilike_limit([], count=0)):
        properties, total = stage4.get_district_properties("nonexistent area xyz")
    assert properties is None
    assert total == 0


def test_get_district_properties_exception_returns_none_zero_not_crash():
    with patch.object(clients.supabase, "table", side_effect=Exception("statement timeout")):
        properties, total = stage4.get_district_properties("JVC")
    assert properties is None
    assert total == 0


# ---------------------------------------------------------------------------
# get_price_trend() — backed by new area_price_trend RPC
# ---------------------------------------------------------------------------
def test_get_price_trend_returns_years_with_sqm_and_sqft():
    fake_rows = [
        {"sale_year": 2021, "avg_ppsqm": 14200, "tx_count": 320},
        {"sale_year": 2026, "avg_ppsqm": 16750, "tx_count": 410},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_price_trend("jvc")
    assert len(result) == 2
    assert result[0]["year"] == 2021
    assert result[0]["avg_price_per_sqm"] == 14200
    assert result[0]["avg_price_per_sqft"] == round(14200 / stage4.SQM_TO_SQFT)
    assert result[1]["transaction_count"] == 410


def test_get_price_trend_calls_rpc_with_correct_params():
    fake_rows = [{"sale_year": 2026, "avg_ppsqm": 16750, "tx_count": 410}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_price_trend("jvc")
    mock_rpc.assert_called_once_with(
        "area_price_trend", {"area_pattern": "%jumeirah village circle (jvc)%", "room_types": None,
                              "area_exact": "jumeirah village circle (jvc)"}
    )


def test_get_price_trend_passes_bedroom_room_types():
    fake_rows = [{"sale_year": 2026, "avg_ppsqm": 16750, "tx_count": 100}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_price_trend("jvc", bedrooms=1)
    call_args = mock_rpc.call_args[0][1]
    assert call_args["room_types"] == ["1 B/R", "1.0", "1"]


def test_get_price_trend_none_area_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_price_trend(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_price_trend_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_price_trend("nonexistent area xyz")
    assert result is None


def test_get_price_trend_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("statement timeout")):
        result = stage4.get_price_trend("jvc")
    assert result is None


# ---------------------------------------------------------------------------
# get_rental_yield() — backed by new rental_yield_by_area RPC. Closes Part
# Two, issue #15 (P1) of the DLD reference pack: rentals has 320,664 real
# rows (loaded 2026-08-18) but nothing queried it before this function.
# ---------------------------------------------------------------------------
def test_get_rental_yield_returns_rent_figures():
    fake_rows = [{
        "avg_annual_rent": 85432.10,
        "avg_rent_per_sqm": 1120.55,
        "contract_count": 640,
        "most_recent_contract_start": "2026-07-15",
    }]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_rental_yield("jvc")
    assert result["avg_annual_rent"] == 85432
    assert result["avg_rent_per_sqm"] == 1121
    assert result["contract_count"] == 640
    assert result["most_recent_contract_start"] == "2026-07-15"


def test_get_rental_yield_calls_rpc_with_correct_params():
    fake_rows = [{"avg_annual_rent": 85432, "avg_rent_per_sqm": 1120, "contract_count": 640,
                  "most_recent_contract_start": "2026-07-15"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_rental_yield("jvc")
    mock_rpc.assert_called_once_with(
        "rental_yield_by_area", {"area_pattern": "%jumeirah village circle (jvc)%",
                                  "area_exact": "jumeirah village circle (jvc)"}
    )


def test_get_rental_yield_none_area_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_rental_yield(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_rental_yield_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_rental_yield("nonexistent area xyz")
    assert result is None


def test_get_rental_yield_zero_contract_count_returns_none():
    """A row can come back with contract_count=0 (or None) rather than an
    empty list in some RPC edge cases — must be treated as no data, not
    as a real zero-rent answer."""
    fake_rows = [{"avg_annual_rent": None, "avg_rent_per_sqm": None, "contract_count": 0,
                  "most_recent_contract_start": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_rental_yield("area with no rentals")
    assert result is None


def test_get_rental_yield_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("statement timeout")):
        result = stage4.get_rental_yield("jvc")
    assert result is None


# ---------------------------------------------------------------------------
# _format_room_type() — fixes the confirmed live bug where rooms_en
# displayed as a bare digit ("3") with no label
# ---------------------------------------------------------------------------
def test_format_room_type_bare_digit_gets_br_label():
    assert stage4._format_room_type("3") == "3 B/R"
    assert stage4._format_room_type("5") == "5 B/R"


def test_format_room_type_studio_variants():
    assert stage4._format_room_type("0") == "Studio"
    assert stage4._format_room_type("0.0") == "Studio"


def test_format_room_type_already_labeled_passes_through():
    assert stage4._format_room_type("3 B/R") == "3 B/R"


def test_format_room_type_none_stays_none():
    assert stage4._format_room_type(None) is None


# ---------------------------------------------------------------------------
# get_recent_transactions() — psm_aed fix, project field, project filter
# ---------------------------------------------------------------------------
def test_recent_transactions_psm_aed_reflects_real_per_row_value():
    """The actual confirmed live bug: PSM showed the SAME number (24,969)
    for every row despite real per-row price_per_sqm varying wildly.
    Root cause was psm_aed never being computed at all — Stage 5 was
    asked to fill in a column with no real data behind it. This proves
    each row now gets its OWN real value, not a shared/invented one."""
    fake_rows = [
        {"instance_date": "2026-02-26", "rooms_en": "3", "procedure_area": "176.0",
         "actual_worth": "4190000.0", "price_per_sqm": "23806.15", "project_name_en": None},
        {"instance_date": "2026-02-26", "rooms_en": "1", "procedure_area": "73.67",
         "actual_worth": "1700000.0", "price_per_sqm": "23075.20", "project_name_en": None},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_recent_transactions("dubai islands", limit=2)
    assert result[0]["psm_aed"] == round(23806.15)
    assert result[1]["psm_aed"] == round(23075.20)
    assert result[0]["psm_aed"] != result[1]["psm_aed"]  # the actual regression check


def test_recent_transactions_type_uses_room_label():
    fake_rows = [{"instance_date": "2026-02-26", "rooms_en": "3", "procedure_area": "176.0",
                  "actual_worth": "4190000.0", "price_per_sqm": "23806.15", "project_name_en": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_recent_transactions("dubai islands")
    assert result[0]["type"] == "3 B/R"


def test_recent_transactions_includes_project_when_present():
    fake_rows = [{"instance_date": "2026-07-13", "rooms_en": "1 B/R", "procedure_area": "51.25",
                  "actual_worth": "1281000.0", "price_per_sqm": "24995.12",
                  "project_name_en": "Bloom Towers"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_recent_transactions("jvc")
    assert result[0]["project"] == "Bloom Towers"


def test_recent_transactions_null_project_stays_none_not_guessed():
    """Confirmed live: project_name_en is genuinely NULL for ~22% of avm
    rows. Must stay None, never filled in with a guess."""
    fake_rows = [{"instance_date": "2026-02-26", "rooms_en": "3", "procedure_area": "176.0",
                  "actual_worth": "4190000.0", "price_per_sqm": "23806.15", "project_name_en": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_recent_transactions("dubai islands")
    assert result[0]["project"] is None


def test_recent_transactions_passes_project_filter_to_rpc():
    """Only 1 fake row for a limit=10 request — falls through to the
    fallback attempt (same reasoning as test_get_recent_transactions_
    calls_rpc_with_limit above). project_pattern must be identical and
    correct on BOTH attempts."""
    fake_rows = [{"instance_date": "2026-07-13", "rooms_en": "1 B/R", "procedure_area": "51.25",
                  "actual_worth": "1281000.0", "price_per_sqm": "24995.12",
                  "project_name_en": "Bloom Towers"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_recent_transactions("jvc", limit=10, project="Bloom Towers")
    assert mock_rpc.call_count == 2
    for call in mock_rpc.call_args_list:
        assert call[0][1]["project_pattern"] == "%Bloom Towers%"
    assert mock_rpc.call_args_list[0][0][1]["require_project"] is True
    assert mock_rpc.call_args_list[0][0][1]["require_rooms"] is True
    assert mock_rpc.call_args_list[1][0][1]["require_project"] is False


def test_recent_transactions_no_project_means_no_project_filter():
    fake_rows = [{"instance_date": "2026-07-13", "rooms_en": "1 B/R", "procedure_area": "51.25",
                  "actual_worth": "1281000.0", "price_per_sqm": "24995.12", "project_name_en": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_recent_transactions("jvc")
    call_args = mock_rpc.call_args[0][1]
    assert call_args["project_pattern"] is None


def test_recent_transactions_uses_complete_only_path_when_enough_exist():
    """The actual new feature: when there are enough real rows WITH a
    project to satisfy the request, use only those — a single RPC call,
    every returned row genuinely complete, no fallback needed."""
    complete_rows = [
        {"instance_date": "2026-02-26", "rooms_en": "5", "procedure_area": "233.7",
         "actual_worth": "3650000.0", "price_per_sqm": "15615.0", "project_name_en": "Viridis Tower B"},
        {"instance_date": "2026-02-25", "rooms_en": "3", "procedure_area": "168.2",
         "actual_worth": "1350000.0", "price_per_sqm": "8812.0", "project_name_en": "Viridis Tower D"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(complete_rows)) as mock_rpc:
        result = stage4.get_recent_transactions("damac hills 2", limit=2)
    assert mock_rpc.call_count == 1  # never needed the fallback attempt
    only_call_args = mock_rpc.call_args[0][1]
    assert only_call_args["require_project"] is True
    assert only_call_args["require_rooms"] is True
    assert all(t["project"] is not None for t in result)
    assert result[0]["project"] == "Viridis Tower B"


def test_recent_transactions_falls_back_when_not_enough_complete_rows_exist():
    """Confirmed live scenario: DAMAC Hills 2 has only 201 real
    complete-data rows out of 6,026 total for the whole area — but a
    request for a specific bedroom count or project could plausibly
    have even fewer. When the complete-only attempt can't fill the
    request, must fall back to the real mixed data (with honest dashes),
    never silently reach further back in time to force a full list of
    complete-looking rows."""
    too_few_complete_rows = [
        {"instance_date": "2026-02-26", "rooms_en": "5", "procedure_area": "233.7",
         "actual_worth": "3650000.0", "price_per_sqm": "15615.0", "project_name_en": "Viridis Tower B"},
    ]
    mixed_rows = [
        {"instance_date": "2026-02-27", "rooms_en": "5", "procedure_area": "233.7",
         "actual_worth": "3650000.0", "price_per_sqm": "15615.0", "project_name_en": None},
        {"instance_date": "2026-02-26", "rooms_en": "3", "procedure_area": "168.2",
         "actual_worth": "1350000.0", "price_per_sqm": "8812.0", "project_name_en": "Viridis Tower B"},
    ]
    call_count = {"n": 0}

    def fake_rpc(name, params):
        call_count["n"] += 1
        return _mock_rpc_result(too_few_complete_rows if call_count["n"] == 1 else mixed_rows)

    with patch.object(clients.supabase, "rpc", side_effect=fake_rpc):
        result = stage4.get_recent_transactions("damac hills 2", limit=2)

    assert call_count["n"] == 2
    assert len(result) == 2
    assert result[0]["project"] is None  # the real, mixed data — not padded with a guess


# ===========================================================================
# Issue 1: real, transaction-backed project list (get_area_projects) —
# distinct from get_district_properties, confirmed almost non-overlapping
# for the same area (JVC: district_properties returns "Al Yousuf Towers",
# avm's real top projects are "Auresta Tower" [1,021 sales], etc.)
# ===========================================================================
def test_get_area_projects_returns_real_ranked_projects():
    fake_rows = [
        {"project_name_en": "Auresta Tower", "transaction_count": 1021, "avg_ppsqm": 15500.73},
        {"project_name_en": "Serenz by Danube", "transaction_count": 823, "avg_ppsqm": 23751.88},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_area_projects("jvc")
    mock_rpc.assert_called_once_with(
        "list_area_projects", {"area_pattern": "%jumeirah village circle (jvc)%",
                                "area_exact": "jumeirah village circle (jvc)", "row_limit": 50}
    )
    assert result[0]["project"] == "Auresta Tower"
    assert result[0]["transaction_count"] == 1021
    assert result[0]["avg_price_per_sqm"] == 15501
    assert result[0]["avg_price_per_sqft"] == round(15500.73 / stage4.SQM_TO_SQFT)


def test_get_area_projects_excludes_zero_transaction_projects():
    """Product decision, confirmed live 2026-08-19: a real project with
    zero real avm transactions must be excluded entirely."""
    fake_rows = [
        {"project_name_en": "Auresta Tower", "transaction_count": 1021, "avg_ppsqm": 15500.73},
        {"project_name_en": "Some New Launch", "transaction_count": 0, "avg_ppsqm": None},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_area_projects("jvc")
    assert len(result) == 1
    assert result[0]["project"] == "Auresta Tower"


def test_get_area_projects_all_zero_returns_none():
    fake_rows = [{"project_name_en": "Some New Launch", "transaction_count": 0, "avg_ppsqm": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_area_projects("jvc")
    assert result is None


def test_get_area_projects_none_area_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_area_projects(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_area_projects_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_area_projects("nonexistent area xyz")
    assert result is None


def test_get_area_projects_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_area_projects("jvc")
    assert result is None


# ---------------------------------------------------------------------------
# get_area_developers() — backed by new list_area_developers RPC. Closes a
# confirmed-live gap: "tell the developers in JVC" had no matching
# question_type at all before this fix -- silently misclassified as
# area_report, dropping "developers" entirely.
# ---------------------------------------------------------------------------
def test_get_area_developers_returns_real_ranked_developers():
    fake_rows = [
        {"developer_name": "EMAAR DEVELOPMENT P.J.S.C.", "developer_id": 137044480,
         "project_count": 1, "transaction_count": 454, "avg_ppsqm": 37367.24},
        {"developer_name": "SOBHA L.L.C", "developer_id": 10097270,
         "project_count": 1, "transaction_count": 250, "avg_ppsqm": 46517.50},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_area_developers("Business Bay")
    mock_rpc.assert_called_once_with(
        "list_area_developers",
        {"area_pattern": "%business bay%", "area_exact": "business bay", "row_limit": 20},
    )
    assert result[0]["developer"] == "EMAAR DEVELOPMENT P.J.S.C."
    assert result[0]["developer_id"] == 137044480
    assert result[0]["transaction_count"] == 454
    assert result[0]["avg_price_per_sqm"] == 37367


def test_get_area_developers_excludes_zero_transaction_developers():
    """Product decision, confirmed live 2026-08-19: a real developer with
    a real dld_projects entry but zero avm transactions must be excluded
    from the list entirely, never shown as a "0" row."""
    fake_rows = [{"developer_name": "LAMAR DEVELOPMENT L.L.C", "developer_id": 374837250,
                  "project_count": 1, "transaction_count": 0, "avg_ppsqm": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_area_developers("Business Bay")
    assert result is None


def test_get_area_developers_filters_zero_but_keeps_real_activity():
    """A mix of zero and real-activity developers: only the real one
    should survive the filter."""
    fake_rows = [
        {"developer_name": "EMAAR DEVELOPMENT P.J.S.C.", "developer_id": 137044480,
         "project_count": 1, "transaction_count": 454, "avg_ppsqm": 37367.24},
        {"developer_name": "LAMAR DEVELOPMENT L.L.C", "developer_id": 374837250,
         "project_count": 1, "transaction_count": 0, "avg_ppsqm": None},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_area_developers("Business Bay")
    assert len(result) == 1
    assert result[0]["developer"] == "EMAAR DEVELOPMENT P.J.S.C."


def test_get_area_developers_none_area_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_area_developers(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_area_developers_no_rows_returns_none():
    """Confirmed live: JVC has zero dld_projects rows under any spelling
    -- a genuine data gap, not a naming mismatch. Must return None, not
    a fabricated list or a crash."""
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_area_developers("jvc")
    assert result is None


def test_get_area_developers_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_area_developers("Business Bay")
    assert result is None


# ===========================================================================
# Issue 2: project-only lookups (no area required) — lookup_project_data
# and get_recent_transactions' new project-only path
# ===========================================================================
def test_lookup_project_data_returns_real_stats_without_area():
    fake_rows = [
        {"project_name_en": "Binghatti Aquarise", "area_name_en": "Business Bay",
         "price_per_sqm": 48222, "actual_worth": 8716000, "instance_date": "2026-08-03"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.lookup_project_data("Binghatti Aquarise")
    mock_rpc.assert_called_once_with(
        "search_avm_by_project",
        {"project_pattern": "%Binghatti Aquarise%", "project_exact": "Binghatti Aquarise",
         "room_types": None, "row_limit": 500},
    )
    assert result["project"] == "Binghatti Aquarise"
    assert result["area"] == "Business Bay"  # bonus context, not required to ask
    assert result["avg_price_per_sqm"] == 48222


def test_lookup_project_data_none_project_returns_none():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.lookup_project_data(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_lookup_project_data_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.lookup_project_data("Nonexistent Project XYZ")
    assert result is None


def test_get_recent_transactions_works_with_project_only_no_area():
    """The actual fix for the confirmed live bug: 'recent transactions
    for Binghatti Aquarise' with NO area named must still return real
    data, via search_avm_by_project instead of giving up immediately."""
    fake_rows = [
        {"project_name_en": "Binghatti Aquarise", "area_name_en": "Business Bay",
         "rooms_en": "2 B/R", "procedure_area": "101.3", "actual_worth": "2984999.0",
         "price_per_sqm": "29487.3", "instance_date": "2026-08-03"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_recent_transactions(area=None, limit=10, project="Binghatti Aquarise")
    mock_rpc.assert_called_once_with(
        "search_avm_by_project",
        {"project_pattern": "%Binghatti Aquarise%", "project_exact": "Binghatti Aquarise",
         "room_types": None, "row_limit": 10},
    )
    assert result[0]["project"] == "Binghatti Aquarise"
    assert result[0]["psm_aed"] == 29487


def test_get_recent_transactions_neither_area_nor_project_returns_none():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_recent_transactions(area=None, limit=10, project=None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_recent_transactions_project_only_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_recent_transactions(area=None, project="Nonexistent Project XYZ")
    assert result is None


# ===========================================================================
# Beta v2 — developer lookup (T5) and two-area comparison (T2)
# ===========================================================================
def test_get_developer_projects_returns_real_ranked_projects():
    fake_rows = [
        {"project_name": "Maybach Six", "area_en": "Nad Al Shiba First", "project_status": "ACTIVE",
         "transaction_count": 2794, "avg_ppsqm": 41312.02, "developer_id": 801164586},
        {"project_name": "Binghatti Skyflame 1", "area_en": "Wadi Al Safa 3", "project_status": "ACTIVE",
         "transaction_count": 1017, "avg_ppsqm": 15432.20, "developer_id": 801164586},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_developer_projects("Binghatti")
    mock_rpc.assert_called_once_with(
        "list_developer_projects",
        {"developer_pattern": "%Binghatti%", "developer_exact": "Binghatti", "row_limit": 50},
    )
    assert result[0]["project"] == "Maybach Six"
    assert result[0]["transaction_count"] == 2794
    assert result[0]["avg_price_per_sqm"] == 41312
    assert result[0]["developer_id"] == 801164586


def test_get_developer_projects_excludes_zero_transaction_projects():
    """Product decision, confirmed live 2026-08-19: a real project
    (Binghatti Square 3) with zero real avm transactions must be
    excluded from the list entirely, never shown as a "0" row."""
    fake_rows = [{"project_name": "Binghatti Square 3", "area_en": "Wadi Al Safa 3",
                  "project_status": "ACTIVE", "transaction_count": 0, "avg_ppsqm": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_developer_projects("Binghatti")
    assert result is None


def test_get_developer_projects_filters_zero_but_keeps_real_activity():
    fake_rows = [
        {"project_name": "Maybach Six", "area_en": "Nad Al Shiba First", "project_status": "ACTIVE",
         "transaction_count": 2794, "avg_ppsqm": 41312.02, "developer_id": 801164586},
        {"project_name": "Binghatti Square 3", "area_en": "Wadi Al Safa 3", "project_status": "ACTIVE",
         "transaction_count": 0, "avg_ppsqm": None, "developer_id": 801164586},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_developer_projects("Binghatti")
    assert len(result) == 1
    assert result[0]["project"] == "Maybach Six"


def test_get_developer_projects_none_developer_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_developer_projects(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_developer_projects_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_developer_projects("Nonexistent Developer XYZ")
    assert result is None


def test_get_developer_projects_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_developer_projects("Binghatti")
    assert result is None


# ---------------------------------------------------------------------------
# get_developer_info() — backed by new developers_by_id RPC. Closes Part
# Two, issue #10 (P2) of the DLD reference pack: developers (2,317 rows)
# had never been queried anywhere in the app.
# ---------------------------------------------------------------------------
def test_get_developer_info_returns_matched_entity_with_computed_expiry():
    fake_rows = [{
        "developer_id": 801164586, "developer_name_en": "DAMAC PRIME DEVELOPMENT L.L.C",
        "legal_status_en": "Limited Responsibility", "license_type_en": "PROFESSIONAL",
        "license_number": "784109", "license_expiry_date": "2020-01-01",  # confirmed-past date -> expired
        "registration_date": "2015-01-01",
    }]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_developer_info([801164586])
    assert result[0]["developer_name"] == "DAMAC PRIME DEVELOPMENT L.L.C"
    assert result[0]["license_number"] == "784109"
    assert result[0]["is_license_expired"] is True


def test_get_developer_info_current_license_not_marked_expired():
    fake_rows = [{
        "developer_id": 1, "developer_name_en": "Some Developer", "legal_status_en": "Limited Responsibility",
        "license_type_en": "PROFESSIONAL", "license_number": "1", "license_expiry_date": "2099-01-01",
        "registration_date": "2015-01-01",
    }]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_developer_info([1])
    assert result[0]["is_license_expired"] is False


def test_get_developer_info_calls_rpc_with_correct_ids():
    fake_rows = [{"developer_id": 1, "developer_name_en": "X", "legal_status_en": None,
                  "license_type_en": None, "license_number": None, "license_expiry_date": None,
                  "registration_date": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_developer_info([1, 2, 3])
    mock_rpc.assert_called_once_with("developers_by_id", {"ids": [1, 2, 3]})


def test_get_developer_info_none_ids_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_developer_info(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_developer_info_empty_list_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_developer_info([])
    assert result is None
    mock_rpc.assert_not_called()


def test_get_developer_info_filters_out_none_ids():
    """Some dld_projects rows genuinely have no resolvable developer_id
    (confirmed live: 2 of 3,240 rows have neither developer_id nor
    developer_number) — None must be filtered, never passed to the RPC."""
    fake_rows = [{"developer_id": 1, "developer_name_en": "X", "legal_status_en": None,
                  "license_type_en": None, "license_number": None, "license_expiry_date": None,
                  "registration_date": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_developer_info([1, None, None])
    mock_rpc.assert_called_once_with("developers_by_id", {"ids": [1]})


def test_get_developer_info_no_match_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_developer_info([999999])
    assert result is None


def test_get_developer_info_missing_expiry_date_not_marked_expired_or_current():
    """No expiry date on file is a different situation from a confirmed
    expired/current one — must not silently default to False (implying
    'confirmed current') or True."""
    fake_rows = [{"developer_id": 1, "developer_name_en": "X", "legal_status_en": None,
                  "license_type_en": None, "license_number": None, "license_expiry_date": None,
                  "registration_date": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_developer_info([1])
    assert result[0]["is_license_expired"] is None


def test_get_developer_info_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_developer_info([1])
    assert result is None


def test_get_developer_info_multiple_entities_all_returned():
    """Confirmed live: a brand can span multiple real, separately
    licensed legal entities — all matches must come back, not just one."""
    fake_rows = [
        {"developer_id": 1, "developer_name_en": "DAMAC PRIME DEVELOPMENT L.L.C",
         "legal_status_en": "Limited Responsibility", "license_type_en": "PROFESSIONAL",
         "license_number": "784109", "license_expiry_date": "2026-06-05", "registration_date": "2025-08-11"},
        {"developer_id": 2, "developer_name_en": "DAMAC CROWN PROPERTIES COMPANY LIMITED",
         "legal_status_en": "Limited Responsibility", "license_type_en": "BUSINESS",
         "license_number": "301", "license_expiry_date": "2025-12-30", "registration_date": "2011-10-20"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_developer_info([1, 2])
    assert len(result) == 2
    assert {e["developer_name"] for e in result} == {
        "DAMAC PRIME DEVELOPMENT L.L.C", "DAMAC CROWN PROPERTIES COMPANY LIMITED"
    }


def test_lookup_comparison_data_calls_both_areas_independently():
    """T2: 'Dubai Hills Estate or Dubai Marina, long-term?' — both
    areas must be looked up as real, independent, honest lookups."""
    call_log = []

    def fake_lookup(area, bedrooms=None):
        call_log.append(area)
        if area == "Dubai Hills Estate":
            return {"area": "Dubai Hills Estate", "avg_price_per_sqm": 18000}
        if area == "Dubai Marina":
            return {"area": "Dubai Marina", "avg_price_per_sqm": 22000}
        return None

    with patch.object(stage4, "lookup_area_data", side_effect=fake_lookup):
        result = stage4.lookup_comparison_data("Dubai Hills Estate", "Dubai Marina")

    assert call_log == ["Dubai Hills Estate", "Dubai Marina"]
    assert result["comparison"][0]["avg_price_per_sqm"] == 18000
    assert result["comparison"][1]["avg_price_per_sqm"] == 22000


def test_lookup_comparison_data_missing_area_returns_none():
    with patch.object(stage4, "lookup_area_data") as mock_lookup:
        result = stage4.lookup_comparison_data("JVC", None)
    assert result is None
    mock_lookup.assert_not_called()


def test_lookup_comparison_data_both_sides_missing_returns_none():
    with patch.object(stage4, "lookup_area_data", return_value=None):
        result = stage4.lookup_comparison_data("Nonexistent 1", "Nonexistent 2")
    assert result is None


def test_lookup_comparison_data_one_side_missing_still_returns_the_other():
    """Honest partial comparison — real data for the side that has it,
    not a total failure just because one side came up empty.

    BUG FIX, confirmed live (screenshot): the missing side used to be a
    bare None, which lost the actual requested name ("Nonexistent Area
    XYZ") by the time the table tried to label that column — it fell
    back to a generic "Option 2" instead. Now it's a marker dict that
    keeps the real name."""
    def fake_lookup(area, bedrooms=None):
        return {"area": "JVC", "avg_price_per_sqm": 16000} if area == "JVC" else None

    with patch.object(stage4, "lookup_area_data", side_effect=fake_lookup):
        result = stage4.lookup_comparison_data("JVC", "Nonexistent Area XYZ")

    assert result["comparison"][0]["area"] == "JVC"
    assert result["comparison"][1] == {"area": "Nonexistent Area XYZ", "no_data": True}


# ===========================================================================
# "Top N areas by X" ranking — e.g. "top 10 selling areas in 2026".
# Confirmed real against live avm data before building: Madinat Al Mataar
# is the genuine #1 area by transaction volume in 2026 (14,505 real
# sales), Mohammed Bin Rashid City the genuine #1 by average price.
# ===========================================================================
def test_get_top_areas_volume_returns_real_ranked_list():
    fake_rows = [
        {"area_name_en": "Madinat Al Mataar", "tx_count": 14505, "avg_ppsqm": 5200.50},
        {"area_name_en": "Jumeirah Village Circle (JVC)", "tx_count": 11306, "avg_ppsqm": 16797.0},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_top_areas(metric="volume", year=2026, limit=10)
    mock_rpc.assert_called_once_with(
        "top_areas_by_volume", {"target_year": 2026, "row_limit": 10}
    )
    assert result["metric"] == "volume"
    assert result["year"] == 2026
    assert result["ranked_areas"][0]["area"] == "Madinat Al Mataar"
    assert result["ranked_areas"][0]["transaction_count"] == 14505


def test_get_top_areas_price_high_applies_min_transactions_floor():
    """A single lucky sale in a near-empty area must not claim the #1
    'most expensive area' spot — the RPC call must include the real
    min_transactions guard."""
    fake_rows = [{"area_name_en": "Mohammed Bin Rashid City", "tx_count": 1601, "avg_ppsqm": 187698.77}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_top_areas(metric="price_high", year=2026, limit=5)
    mock_rpc.assert_called_once_with(
        "top_areas_by_price", {"target_year": 2026, "row_limit": 5, "min_transactions": 10}
    )


def test_get_top_areas_price_low_uses_ascending_rpc():
    fake_rows = [{"area_name_en": "Al Warqaa", "tx_count": 14, "avg_ppsqm": 1441.61}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_top_areas(metric="price_low", year=2026, limit=5)
    mock_rpc.assert_called_once_with(
        "top_areas_by_price_asc", {"target_year": 2026, "row_limit": 5, "min_transactions": 10}
    )


def test_get_top_areas_defaults_to_current_year_when_not_specified():
    """Confirmed live: 'top 10 selling areas' with no year mentioned must
    use the REAL current year, computed from the actual date — never
    hardcoded, never guessed by the model."""
    from datetime import date
    fake_rows = [{"area_name_en": "Madinat Al Mataar", "tx_count": 100, "avg_ppsqm": 5000}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_top_areas(metric="volume", year=None, limit=10)
    call_args = mock_rpc.call_args[0][1]
    assert call_args["target_year"] == date.today().year


def test_get_top_areas_defaults_limit_to_10():
    fake_rows = [{"area_name_en": "Madinat Al Mataar", "tx_count": 100, "avg_ppsqm": 5000}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_top_areas(metric="volume", year=2026, limit=None)
    call_args = mock_rpc.call_args[0][1]
    assert call_args["row_limit"] == 10


def test_get_top_areas_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_top_areas(metric="volume", year=1999, limit=10)
    assert result is None


def test_get_top_areas_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_top_areas(metric="volume", year=2026, limit=10)
    assert result is None


def test_get_top_areas_unknown_metric_falls_back_to_volume():
    fake_rows = [{"area_name_en": "Madinat Al Mataar", "tx_count": 100, "avg_ppsqm": 5000}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_top_areas(metric="not_a_real_metric", year=2026, limit=10)
    assert mock_rpc.call_args[0][0] == "top_areas_by_volume"


# ===========================================================================
# Generalized system: top projects, top developers, citywide market
# overview — "not just about areas, anything: pricing, projects,
# developers" per request. Confirmed real against live data before
# building: DAMAC Prime Development is the genuine #1 developer by
# volume in 2026 (5,957 real transactions); Maybach Six the genuine #1
# project by volume (1,918 real transactions).
# ===========================================================================
def test_get_top_projects_returns_real_ranked_list():
    fake_rows = [{"project_name_en": "Maybach Six", "tx_count": 1918, "avg_ppsqm": 41904.63}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_top_projects(metric="volume", year=2026, limit=10)
    mock_rpc.assert_called_once_with(
        "top_projects_by_volume", {"target_year": 2026, "row_limit": 10}
    )
    assert result["ranked_projects"][0]["name"] == "Maybach Six"
    assert result["ranked_projects"][0]["transaction_count"] == 1918


def test_get_top_projects_price_applies_min_transactions_floor():
    fake_rows = [{"project_name_en": "Some Project", "tx_count": 50, "avg_ppsqm": 60000}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_top_projects(metric="price_high", year=2026, limit=5)
    mock_rpc.assert_called_once_with(
        "top_projects_by_price", {"target_year": 2026, "row_limit": 5, "min_transactions": 10}
    )


def test_get_top_projects_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_top_projects(metric="volume", year=1999, limit=10)
    assert result is None


def test_get_top_developers_returns_real_ranked_list():
    fake_rows = [{"developer_name": "DAMAC PRIME DEVELOPMENT L.L.C", "tx_count": 5957, "avg_ppsqm": 19633.32}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_top_developers(metric="volume", year=2026, limit=10)
    mock_rpc.assert_called_once_with(
        "top_developers_by_volume", {"target_year": 2026, "row_limit": 10}
    )
    assert result["ranked_developers"][0]["name"] == "DAMAC PRIME DEVELOPMENT L.L.C"
    assert result["ranked_developers"][0]["transaction_count"] == 5957


def test_get_top_developers_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_top_developers(metric="volume", year=1999, limit=10)
    assert result is None


def test_get_top_developers_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_top_developers(metric="volume", year=2026, limit=10)
    assert result is None


def test_get_market_overview_returns_real_citywide_snapshot():
    """Confirmed real: 226,361 real transactions city-wide in 2026,
    averaging 22,210 AED/sqm — no area/project/developer named at all."""
    fake_rows = [{"tx_count": 226361, "avg_ppsqm": 22209.64, "avg_worth": 1850000.0}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_market_overview(year=2026)
    mock_rpc.assert_called_once_with("market_overview", {"target_year": 2026})
    assert result["transaction_count"] == 226361
    assert result["avg_price_per_sqm"] == 22210


def test_get_market_overview_defaults_to_current_year():
    from datetime import date
    fake_rows = [{"tx_count": 100, "avg_ppsqm": 20000, "avg_worth": 1500000}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_market_overview(year=None)
    assert mock_rpc.call_args[0][1]["target_year"] == date.today().year


def test_get_market_overview_no_data_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([{"tx_count": 0, "avg_ppsqm": None, "avg_worth": None}])):
        result = stage4.get_market_overview(year=1999)
    assert result is None


def test_get_market_overview_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_market_overview(year=2026)
    assert result is None


# ---------------------------------------------------------------------------
# get_unit_inventory() — backed by new unit_inventory_by_project RPC.
# Closes "unit-count / inventory questions" (P2, Sobha SkyParks example).
# ---------------------------------------------------------------------------
def test_get_unit_inventory_returns_real_breakdown():
    fake_rows = [
        {"rooms_en": "Studio", "property_sub_type_en": "Flat", "unit_count": 446},
        {"rooms_en": "1 B/R", "property_sub_type_en": "Flat", "unit_count": 148},
        {"rooms_en": "2 B/R", "property_sub_type_en": "Flat", "unit_count": 28},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_unit_inventory("Auresta Tower")
    mock_rpc.assert_called_once_with(
        "unit_inventory_by_project",
        {"project_pattern": "%Auresta Tower%", "project_exact": "Auresta Tower"},
    )
    assert result[0]["rooms"] == "Studio"
    assert result[0]["unit_count"] == 446
    assert sum(r["unit_count"] for r in result) == 622


def test_get_unit_inventory_none_project_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_unit_inventory(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_unit_inventory_empty_project_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_unit_inventory("   ")
    assert result is None
    mock_rpc.assert_not_called()


def test_get_unit_inventory_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_unit_inventory("Nonexistent Project XYZ")
    assert result is None


def test_get_unit_inventory_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_unit_inventory("Auresta Tower")
    assert result is None


# ---------------------------------------------------------------------------
# get_sale_index() — direct table query (residential_sale_index is only
# 159 rows, no custom RPC needed). Closes "no market-index feature" (P2).
# ---------------------------------------------------------------------------
def _mock_table_result(rows):
    mock_result = MagicMock()
    mock_result.data = rows
    return mock_result


def test_get_sale_index_returns_chronological_series():
    # Rows arrive most-recent-first from the query (order desc + limit);
    # get_sale_index() must reverse them to chronological order.
    fake_rows = [
        {"first_date_of_month": "2024-05-01", "all_monthly_index": "1.656", "all_monthly_price_index": "1514243.000"},
        {"first_date_of_month": "2024-04-01", "all_monthly_index": "1.645", "all_monthly_price_index": "1510837.000"},
    ]
    mock_table = MagicMock()
    mock_table.select.return_value.order.return_value.limit.return_value.execute.return_value = _mock_table_result(fake_rows)
    with patch.object(clients.supabase, "table", return_value=mock_table) as mock_table_call:
        result = stage4.get_sale_index(property_type="all", months=24)
    mock_table_call.assert_called_once_with("residential_sale_index")
    assert result["property_type"] == "all"
    assert result["as_of"] == "2024-05-01"  # most recent, confirmed live DLD's own source stops here
    assert result["series"][0]["month"] == "2024-04-01"  # chronological: oldest first
    assert result["series"][1]["month"] == "2024-05-01"
    assert result["series"][1]["index"] == 1.656


def test_get_sale_index_invalid_property_type_defaults_to_all():
    fake_rows = [{"first_date_of_month": "2024-05-01", "all_monthly_index": "1.656", "all_monthly_price_index": "1514243.000"}]
    mock_table = MagicMock()
    mock_table.select.return_value.order.return_value.limit.return_value.execute.return_value = _mock_table_result(fake_rows)
    with patch.object(clients.supabase, "table", return_value=mock_table) as mock_table_call:
        result = stage4.get_sale_index(property_type="not_a_real_type")
    assert result["property_type"] == "all"
    # Confirms it queried the "all" columns, not a garbage column name
    mock_table.select.assert_called_once_with("first_date_of_month, all_monthly_index, all_monthly_price_index")


def test_get_sale_index_villa_type_queries_villa_columns():
    fake_rows = [{"first_date_of_month": "2024-05-01", "villa_monthly_index": "1.705", "villa_monthly_price_index": "2200000.000"}]
    mock_table = MagicMock()
    mock_table.select.return_value.order.return_value.limit.return_value.execute.return_value = _mock_table_result(fake_rows)
    with patch.object(clients.supabase, "table", return_value=mock_table):
        result = stage4.get_sale_index(property_type="villa")
    assert result["property_type"] == "villa"
    mock_table.select.assert_called_once_with("first_date_of_month, villa_monthly_index, villa_monthly_price_index")


def test_get_sale_index_no_rows_returns_none():
    mock_table = MagicMock()
    mock_table.select.return_value.order.return_value.limit.return_value.execute.return_value = _mock_table_result([])
    with patch.object(clients.supabase, "table", return_value=mock_table):
        result = stage4.get_sale_index()
    assert result is None


def test_get_sale_index_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "table", side_effect=Exception("connection error")):
        result = stage4.get_sale_index()
    assert result is None


# ---------------------------------------------------------------------------
# get_valuation_stats() — backed by new property_valuations_by_area RPC.
# Closes "valuation claim thinly backed" (P2).
# ---------------------------------------------------------------------------
def test_get_valuation_stats_returns_real_data():
    fake_rows = [{"avg_actual_worth": 2144586.9, "avg_property_total_value": 2139076.5,
                  "valuation_count": 3411, "most_recent_valuation": "2026-08-11"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_valuation_stats("Business Bay")
    mock_rpc.assert_called_once_with(
        "property_valuations_by_area",
        {"area_pattern": "%business bay%", "area_exact": "business bay", "property_type": "Unit"},
    )
    assert result["avg_actual_worth"] == 2144587
    assert result["valuation_count"] == 3411
    assert result["most_recent_valuation"] == "2026-08-11"


def test_get_valuation_stats_none_area_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_valuation_stats(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_valuation_stats_no_rows_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_valuation_stats("Nonexistent Area XYZ")
    assert result is None


def test_get_valuation_stats_zero_count_returns_none():
    fake_rows = [{"avg_actual_worth": None, "avg_property_total_value": None,
                  "valuation_count": 0, "most_recent_valuation": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_valuation_stats("Area With No Valuations")
    assert result is None


def test_get_valuation_stats_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_valuation_stats("Business Bay")
    assert result is None


# ---------------------------------------------------------------------------
# get_legal_knowledge() — backed by new search_legal_knowledge RPC (full-
# text search, not embeddings -- see the migration file's docstring for
# why). Closes "legal/general questions get the wrong fallback" (doc
# §2.2 / §3.7).
# ---------------------------------------------------------------------------
def test_get_legal_knowledge_returns_relevant_chunks_above_threshold():
    fake_rows = [
        {"title": "Golden Visa eligibility through property investment",
         "content": "...", "category": "golden_visa", "source_url": "https://example.com",
         "source_note": "General guidance only...", "rank": 0.0664295},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_legal_knowledge("Am I eligible for a Golden Visa if I buy property?")
    mock_rpc.assert_called_once_with(
        "search_legal_knowledge",
        {"query_text": "Am I eligible for a Golden Visa if I buy property?", "result_limit": 3},
    )
    assert result[0]["title"] == "Golden Visa eligibility through property investment"
    assert result[0]["source_note"] == "General guidance only..."


def test_get_legal_knowledge_filters_out_low_relevance_noise():
    """Confirmed live: coincidental shared-word matches (e.g. every
    chunk containing 'property') score far lower than a genuine match.
    Chunks below LEGAL_KNOWLEDGE_MIN_RANK must be filtered out."""
    fake_rows = [
        {"title": "DLD property transfer fee", "content": "...", "category": "fees",
         "source_url": None, "source_note": "...", "rank": 0.059104},
        {"title": "Freehold property ownership for foreign nationals in Dubai", "content": "...",
         "category": "ownership", "source_url": None, "source_note": "...", "rank": 0.0177954},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_legal_knowledge("How much does DLD charge to transfer a property?")
    assert len(result) == 1
    assert result[0]["title"] == "DLD property transfer fee"


def test_get_legal_knowledge_none_question_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_legal_knowledge(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_legal_knowledge_empty_question_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_legal_knowledge("   ")
    assert result is None
    mock_rpc.assert_not_called()


def test_get_legal_knowledge_no_matches_returns_none():
    """Confirmed live: an unrelated question ('What is the capital of
    France?') returns zero rows entirely -- correct behavior, must map
    to the honest fallback, never a guessed answer."""
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_legal_knowledge("What is the capital of France?")
    assert result is None


def test_get_legal_knowledge_all_below_threshold_returns_none():
    fake_rows = [{"title": "X", "content": "...", "category": "x", "source_url": None,
                  "source_note": "...", "rank": 0.005}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_legal_knowledge("some barely related question")
    assert result is None


def test_get_legal_knowledge_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_legal_knowledge("Am I eligible for a Golden Visa?")
    assert result is None


# ---------------------------------------------------------------------------
# get_broker_info() — backed by new search_brokers RPC. Closes Part
# Three §3.1's Broker entity: real_estate_brokers (8,724 rows) had zero
# references anywhere in the app before this.
# ---------------------------------------------------------------------------
def test_get_broker_info_returns_real_data_with_computed_expiry():
    fake_rows = [{"broker_name_en": "SAMUEL STEPHEN VEAL", "phone": None,
                  "license_start_date": "2024-07-22", "license_end_date": "2020-01-30",
                  "real_estate_number": 546}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_broker_info("Samuel Stephen Veal")
    mock_rpc.assert_called_once_with(
        "search_brokers",
        {"name_pattern": "%Samuel Stephen Veal%", "name_exact": "Samuel Stephen Veal"},
    )
    assert result[0]["broker_name"] == "SAMUEL STEPHEN VEAL"
    assert result[0]["real_estate_number"] == 546
    assert result[0]["is_license_expired"] is True  # confirmed-past date


def test_get_broker_info_current_license_not_marked_expired():
    fake_rows = [{"broker_name_en": "X", "phone": "12345",
                  "license_start_date": "2024-01-01", "license_end_date": "2099-01-01",
                  "real_estate_number": 1}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_broker_info("X")
    assert result[0]["is_license_expired"] is False


def test_get_broker_info_multiple_matches_all_returned():
    """Confirmed live: the same broker name can genuinely belong to more
    than one registered person -- all matches must come back."""
    fake_rows = [
        {"broker_name_en": "EBRAHIM MOHAMMAD HASSAN ALHATTAWI", "phone": None,
         "license_start_date": "2020-01-01", "license_end_date": "2027-01-01", "real_estate_number": 100},
        {"broker_name_en": "EBRAHIM MOHAMMAD HASSAN ALHATTAWI", "phone": None,
         "license_start_date": "2021-01-01", "license_end_date": "2027-01-01", "real_estate_number": 200},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_broker_info("Ebrahim Mohammad Hassan Alhattawi")
    assert len(result) == 2
    assert {r["real_estate_number"] for r in result} == {100, 200}


def test_get_broker_info_none_name_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_broker_info(None)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_broker_info_empty_name_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_broker_info("   ")
    assert result is None
    mock_rpc.assert_not_called()


def test_get_broker_info_no_match_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_broker_info("Nonexistent Broker XYZ")
    assert result is None


def test_get_broker_info_missing_expiry_not_marked_expired_or_current():
    fake_rows = [{"broker_name_en": "X", "phone": None,
                  "license_start_date": None, "license_end_date": None, "real_estate_number": 1}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_broker_info("X")
    assert result[0]["is_license_expired"] is None


def test_get_broker_info_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_broker_info("Samuel Stephen Veal")
    assert result is None


# ---------------------------------------------------------------------------
# compute_market_signal() — closes doc §3.3.1's market_signal derived
# field. Pure computation over get_price_trend()'s own real numbers, no
# new RPC or Supabase call.
# ---------------------------------------------------------------------------
def test_market_signal_soft_quadrant_verified():
    """Price falling + volume falling -- one of the two doc-verified quadrants."""
    trend = [
        {"year": 2024, "avg_price_per_sqm": 20000, "avg_price_per_sqft": 1858, "transaction_count": 500},
        {"year": 2025, "avg_price_per_sqm": 18000, "avg_price_per_sqft": 1672, "transaction_count": 400},
    ]
    result = stage4.compute_market_signal(trend)
    assert result["signal"] == "soft"
    assert result["confidence"] == "verified"
    assert result["price_change_pct"] == -10.0
    assert result["volume_change_pct"] == -20.0
    assert result["years_compared"] == "2024 -> 2025"


def test_market_signal_tight_strong_quadrant_verified():
    """Price stable/rising + volume falling -- the other doc-verified quadrant."""
    trend = [
        {"year": 2024, "avg_price_per_sqm": 18000, "avg_price_per_sqft": 1672, "transaction_count": 500},
        {"year": 2025, "avg_price_per_sqm": 19000, "avg_price_per_sqft": 1765, "transaction_count": 400},
    ]
    result = stage4.compute_market_signal(trend)
    assert result["signal"] == "tight_strong"
    assert result["confidence"] == "verified"


def test_market_signal_cooling_quadrant_inferred():
    """Price falling + volume rising -- doc explicitly flags this as
    logically-inferred, not directly source-verified."""
    trend = [
        {"year": 2024, "avg_price_per_sqm": 20000, "avg_price_per_sqft": 1858, "transaction_count": 400},
        {"year": 2025, "avg_price_per_sqm": 18000, "avg_price_per_sqft": 1672, "transaction_count": 500},
    ]
    result = stage4.compute_market_signal(trend)
    assert result["signal"] == "cooling"
    assert result["confidence"] == "inferred"


def test_market_signal_broad_strength_quadrant_inferred():
    """Price rising + volume rising -- also doc-flagged as inferred."""
    trend = [
        {"year": 2024, "avg_price_per_sqm": 18000, "avg_price_per_sqft": 1672, "transaction_count": 400},
        {"year": 2025, "avg_price_per_sqm": 19000, "avg_price_per_sqft": 1765, "transaction_count": 500},
    ]
    result = stage4.compute_market_signal(trend)
    assert result["signal"] == "broad_strength"
    assert result["confidence"] == "inferred"


def test_market_signal_fewer_than_two_usable_years_returns_none():
    assert stage4.compute_market_signal([
        {"year": 2025, "avg_price_per_sqm": 18000, "avg_price_per_sqft": 1672, "transaction_count": 400},
    ]) is None
    assert stage4.compute_market_signal([]) is None
    assert stage4.compute_market_signal(None) is None


def test_market_signal_skips_years_with_missing_data():
    """A year with a None price or count (thin data) must be excluded
    from the comparison, not treated as a real 0."""
    trend = [
        {"year": 2023, "avg_price_per_sqm": None, "avg_price_per_sqft": None, "transaction_count": None},
        {"year": 2024, "avg_price_per_sqm": 18000, "avg_price_per_sqft": 1672, "transaction_count": 500},
        {"year": 2025, "avg_price_per_sqm": 19000, "avg_price_per_sqft": 1765, "transaction_count": 400},
    ]
    result = stage4.compute_market_signal(trend)
    assert result["years_compared"] == "2024 -> 2025"


def test_market_signal_zero_prior_price_returns_none_not_crash():
    """A prior price of 0 would divide-by-zero on percent change -- must
    be handled safely, never crash."""
    trend = [
        {"year": 2024, "avg_price_per_sqm": 0, "avg_price_per_sqft": 0, "transaction_count": 500},
        {"year": 2025, "avg_price_per_sqm": 18000, "avg_price_per_sqft": 1672, "transaction_count": 400},
    ]
    result = stage4.compute_market_signal(trend)
    assert result is None


# ===========================================================================
# get_budget_area_recommendations() — closes the confirmed-live bug: "I
# have AED 600,000. Which areas should I consider?" had no dedicated
# route and fell through to market_overview's citywide average. Backed
# by budget_area_recommendations RPC — real GROUP-BY-area aggregation,
# same "let Postgres do it" pattern as get_top_areas(). Verified live
# against real 2026 data before building: for budget=600000, areas like
# Al Warsan First, International City, and Discovery Gardens genuinely
# have real Unit/Villa sales on record at or under that budget; the RPC
# itself filters out Land/Building sales and non-arm's-length nominal
# transfers (as low as AED 1) that would otherwise corrupt the ranking.
# ===========================================================================
def test_get_budget_area_recommendations_returns_real_ranked_areas():
    fake_rows = [
        {"area_name_en": "Al Warsan First", "tx_count": 54997, "avg_worth": 442482.83,
         "median_worth": 355000, "min_worth": 51000.0, "avg_ppsqm": 6826.54,
         "under_budget_count": 47365, "under_budget_pct": 86.1},
        {"area_name_en": "International City Ph 1", "tx_count": 1689, "avg_worth": 672215.07,
         "median_worth": 533211, "min_worth": 125000.0, "avg_ppsqm": 9384.63,
         "under_budget_count": 1047, "under_budget_pct": 62.0},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_budget_area_recommendations(600000, limit=6)
    mock_rpc.assert_called_once_with(
        "budget_area_recommendations", {"target_budget": 600000, "row_limit": 6}
    )
    assert result["budget"] == 600000
    assert result["areas"][0]["area"] == "Al Warsan First"
    assert result["areas"][0]["median_price_aed"] == 355000
    assert result["areas"][0]["min_price_aed"] == 51000
    assert result["areas"][0]["pct_transactions_under_budget"] == 86.1
    # avg_ppsqm 6826.54 / 10.7639 -> avg_price_per_sqft, never model-computed
    assert result["areas"][0]["avg_price_per_sqft"] == round(6826.54 / stage4.SQM_TO_SQFT)


def test_get_budget_area_recommendations_no_budget_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        result = stage4.get_budget_area_recommendations(None, limit=6)
    assert result is None
    mock_rpc.assert_not_called()


def test_get_budget_area_recommendations_zero_or_negative_budget_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        assert stage4.get_budget_area_recommendations(0, limit=6) is None
        assert stage4.get_budget_area_recommendations(-500, limit=6) is None
    mock_rpc.assert_not_called()


def test_get_budget_area_recommendations_no_qualifying_areas_returns_none():
    """Zero-transaction-rule: if no area has a real sale at or under the
    budget, the RPC's own HAVING clause returns zero rows — this must
    surface as None, not an empty/misleading area list."""
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_budget_area_recommendations(50000, limit=6)
    assert result is None


def test_get_budget_area_recommendations_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_budget_area_recommendations(600000, limit=6)
    assert result is None


def test_get_budget_area_recommendations_defaults_limit_to_6():
    fake_rows = [{"area_name_en": "Al Warsan First", "tx_count": 100, "avg_worth": 400000,
                  "median_worth": 350000, "min_worth": 100000, "avg_ppsqm": 6000,
                  "under_budget_count": 80, "under_budget_pct": 80.0}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_budget_area_recommendations(600000)
    call_args = mock_rpc.call_args[0][1]
    assert call_args["row_limit"] == 6


# ===========================================================================
# _compute_recent_liquidity() — closes the seller "how fast will it
# move" gap (doc §3.4) honestly: avm only has instance_date (when a sale
# CLOSED), never a listing date, so a true days-on-market figure cannot
# be computed. This is the honest alternative — real transaction count
# in the last 90 days, computed from rows the caller already fetched
# (search_avm/search_avm_by_project both ORDER BY instance_date DESC),
# no extra network call.
# ===========================================================================
from datetime import date, timedelta  # noqa: E402


def test_compute_recent_liquidity_counts_within_window():
    today = date(2026, 8, 20)
    rows = [
        {"instance_date": today.isoformat()},
        {"instance_date": (today - timedelta(days=10)).isoformat()},
        {"instance_date": (today - timedelta(days=89)).isoformat()},
        {"instance_date": (today - timedelta(days=91)).isoformat()},   # outside window
        {"instance_date": (today - timedelta(days=400)).isoformat()},  # outside window
    ]
    result = stage4._compute_recent_liquidity(rows)
    assert result["transactions_last_90_days"] == 3
    assert result["as_of"] == today.isoformat()
    assert result["is_lower_bound"] is False


def test_compute_recent_liquidity_flags_lower_bound_when_all_rows_in_window():
    """Honesty check: if EVERY fetched row (all the way to the 500-row
    cap) still falls inside the 90-day window, a high-volume area could
    have more real sales in that window than were ever fetched — the
    true count could be higher than reported. Must be flagged, not
    silently presented as exact."""
    today = date(2026, 8, 20)
    rows = [{"instance_date": (today - timedelta(days=d)).isoformat()} for d in range(5)]
    result = stage4._compute_recent_liquidity(rows)
    assert result["transactions_last_90_days"] == 5
    assert result["is_lower_bound"] is True


def test_compute_recent_liquidity_not_lower_bound_when_window_closes_before_cap():
    """If even one row falls OUTSIDE the window, the count is exact and
    complete — the window boundary was reached before the row cap, so
    nothing beyond it could have been missed."""
    today = date(2026, 8, 20)
    rows = [{"instance_date": today.isoformat()}, {"instance_date": (today - timedelta(days=200)).isoformat()}]
    result = stage4._compute_recent_liquidity(rows)
    assert result["transactions_last_90_days"] == 1
    assert result["is_lower_bound"] is False


def test_compute_recent_liquidity_no_dates_returns_none():
    assert stage4._compute_recent_liquidity([{"instance_date": None}]) is None
    assert stage4._compute_recent_liquidity([]) is None


def test_compute_recent_liquidity_includes_sample_transactions_most_recent_first():
    """
    Confirmed-live product ask: a bare "N transactions in the last 90
    days" count isn't enough — investors want to see the real sales
    behind it. sample_transactions must be the actual in-window rows,
    most-recent-first (rows already arrive pre-sorted DESC from the RPC).
    """
    today = date(2026, 8, 20)
    rows = [
        {"instance_date": today.isoformat(), "price_per_sqm": 28000, "actual_worth": 2300000,
         "procedure_area": 82.8, "rooms_en": "1", "project_name_en": "Tiger Sky Tower"},
        {"instance_date": (today - timedelta(days=5)).isoformat(), "price_per_sqm": 27500,
         "actual_worth": 2280000, "procedure_area": 81.9, "rooms_en": "1", "project_name_en": "Tiger Sky Tower"},
        {"instance_date": (today - timedelta(days=200)).isoformat(), "price_per_sqm": 26000,
         "actual_worth": 2200000, "procedure_area": 80.0, "rooms_en": "1", "project_name_en": "Tiger Sky Tower"},
    ]
    result = stage4._compute_recent_liquidity(rows)
    assert result["transactions_last_90_days"] == 2
    sample = result["sample_transactions"]
    assert len(sample) == 2
    assert sample[0]["date"] == today.isoformat()
    assert sample[1]["date"] == (today - timedelta(days=5)).isoformat()
    # Same real per-row fields _rows_to_transactions already proves for
    # get_recent_transactions() — psm/psf computed per row, not a
    # fabricated uniform value.
    assert sample[0]["psm_aed"] == 28000
    assert sample[1]["psm_aed"] == 27500


def test_compute_recent_liquidity_caps_sample_at_max_sample():
    today = date(2026, 8, 20)
    rows = [{"instance_date": (today - timedelta(days=d)).isoformat(), "price_per_sqm": 20000,
             "actual_worth": 2000000} for d in range(20)]
    result = stage4._compute_recent_liquidity(rows, max_sample=15)
    assert result["transactions_last_90_days"] == 20
    assert len(result["sample_transactions"]) == 15


def test_compute_recent_liquidity_sample_omits_missing_fields_honestly():
    """No project_name_en on a row -> None, never guessed (same rule as
    get_recent_transactions/_rows_to_transactions)."""
    today = date(2026, 8, 20)
    rows = [{"instance_date": today.isoformat(), "price_per_sqm": 28000, "actual_worth": 2300000}]
    result = stage4._compute_recent_liquidity(rows)
    assert result["sample_transactions"][0]["project"] is None


# ===========================================================================
# Confirmed-live product ask: a sample row with no project name recorded
# reads as broken to an investor. _compute_recent_liquidity now prefers
# complete rows when building sample_transactions, drawn from the FULL
# window pool (which can be far larger than max_sample) — not just the
# top max_sample most-recent rows regardless of completeness.
# ===========================================================================
def test_compute_recent_liquidity_prefers_complete_rows_over_incomplete():
    today = date(2026, 8, 20)
    # 5 incomplete (no project) rows, most recent; 12 complete rows, older
    # but still within the window. With max_sample=10, the sample should
    # be built entirely from the 12 complete rows, none of the 5
    # incomplete ones, even though the incomplete ones are more recent.
    incomplete_rows = [
        {"instance_date": (today - timedelta(days=d)).isoformat(), "price_per_sqm": 20000,
         "actual_worth": 2000000, "project_name_en": None}
        for d in range(5)
    ]
    complete_rows = [
        {"instance_date": (today - timedelta(days=5 + d)).isoformat(), "price_per_sqm": 20000,
         "actual_worth": 2000000, "project_name_en": "Real Project"}
        for d in range(12)
    ]
    rows = incomplete_rows + complete_rows
    result = stage4._compute_recent_liquidity(rows, max_sample=10)
    sample = result["sample_transactions"]
    assert len(sample) == 10
    assert all(t["project"] == "Real Project" for t in sample)


def test_compute_recent_liquidity_pads_with_incomplete_only_when_not_enough_complete():
    today = date(2026, 8, 20)
    # Only 3 complete rows exist in the whole window — not enough to
    # fill max_sample=10 on their own, so incomplete ones fill the rest
    # (Stage 5's renderer is the final backstop that actually hides
    # them from display; Stage 4 still surfaces what real data exists).
    complete_rows = [
        {"instance_date": (today - timedelta(days=d)).isoformat(), "price_per_sqm": 20000,
         "actual_worth": 2000000, "project_name_en": "Real Project"}
        for d in range(3)
    ]
    incomplete_rows = [
        {"instance_date": (today - timedelta(days=3 + d)).isoformat(), "price_per_sqm": 20000,
         "actual_worth": 2000000, "project_name_en": None}
        for d in range(20)
    ]
    rows = complete_rows + incomplete_rows
    result = stage4._compute_recent_liquidity(rows, max_sample=10)
    sample = result["sample_transactions"]
    assert len(sample) == 10
    assert sum(1 for t in sample if t["project"] == "Real Project") == 3
    assert sum(1 for t in sample if t["project"] is None) == 7


def test_lookup_area_data_includes_recent_liquidity():
    today = date(2026, 8, 20)
    fake_rows = [
        {"area_name_en": "JVC", "price_per_sqm": 16000, "actual_worth": 1100000,
         "instance_date": today.isoformat()},
        {"area_name_en": "JVC", "price_per_sqm": 15500, "actual_worth": 1050000,
         "instance_date": (today - timedelta(days=500)).isoformat()},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_area_data("JVC")
    assert result["recent_liquidity"]["transactions_last_90_days"] == 1
    assert result["recent_liquidity"]["is_lower_bound"] is False


def test_lookup_project_data_includes_recent_liquidity():
    today = date(2026, 8, 20)
    fake_rows = [
        {"project_name_en": "Binghatti Aquarise", "area_name_en": "JVC", "price_per_sqm": 16000,
         "actual_worth": 1100000, "instance_date": today.isoformat()},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_project_data("Binghatti Aquarise")
    assert result["recent_liquidity"]["transactions_last_90_days"] == 1


# ===========================================================================
# T14 (architecture review issue #9) — outlier exclusion on the headline
# "Real DLD Closed Sales" averages. Confirmed live: previously
# lookup_area_data()/lookup_project_data() averaged every matching row
# with no filtering at all — a single AED 1 typo or a AED 999,000,000
# mis-keyed transaction would silently pull avg_price_per_sqm /
# avg_actual_worth with it. Standard 1.5x IQR fence, applied
# independently to price_per_sqm and actual_worth, never applied below
# min_sample (10) since a real outlier can't be told apart from normal
# variation honestly in a tiny sample.
# ===========================================================================
def test_exclude_outliers_removes_extreme_low_and_high_values():
    # 12 genuinely clustered values (16000-16500) plus one AED-1-style
    # typo (10) and one wildly mis-keyed high value (999000000).
    values = [16000.0, 16050.0, 16100.0, 16150.0, 16200.0, 16250.0, 16300.0,
              16350.0, 16400.0, 16450.0, 16500.0, 10.0, 999000000.0]
    kept, n_excluded = stage4._exclude_outliers(values)
    assert n_excluded == 2
    assert 10.0 not in kept
    assert 999000000.0 not in kept
    assert len(kept) == 11


def test_exclude_outliers_below_min_sample_excludes_nothing():
    """Too thin a sample to call anything a statistical outlier honestly
    — same 'too thin to say' guard already used server-side in
    service_charges_by_project."""
    values = [16000.0, 16100.0, 999000000.0]  # only 3 values, min_sample=10
    kept, n_excluded = stage4._exclude_outliers(values)
    assert n_excluded == 0
    assert kept == values


def test_exclude_outliers_identical_values_excludes_nothing():
    """IQR == 0 (e.g. every unit in a small project sold at the exact
    same fixed price point) — nothing meaningfully 'outside range'."""
    values = [16000.0] * 12
    kept, n_excluded = stage4._exclude_outliers(values)
    assert n_excluded == 0
    assert len(kept) == 12


def test_exclude_outliers_normal_variation_not_removed():
    """Genuine, real price variation (not a data error) must NOT be
    excluded just because it's the highest or lowest value present."""
    values = [14000.0, 14500.0, 15000.0, 15500.0, 16000.0, 16500.0,
              17000.0, 17500.0, 18000.0, 18500.0, 19000.0, 19500.0]
    kept, n_excluded = stage4._exclude_outliers(values)
    assert n_excluded == 0
    assert len(kept) == 12


def test_lookup_area_data_excludes_price_outlier_from_headline_average():
    """Integration-level T14 check: a single mis-keyed row must not
    drag avg_price_per_sqm away from the real cluster."""
    today = date(2026, 8, 20)
    normal_rows = [
        {"area_name_en": "JVC", "price_per_sqm": 16000 + i * 20, "actual_worth": 1100000,
         "instance_date": today.isoformat()}
        for i in range(12)
    ]
    outlier_row = {"area_name_en": "JVC", "price_per_sqm": 1, "actual_worth": 1100000,
                   "instance_date": today.isoformat()}
    fake_rows = normal_rows + [outlier_row]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_area_data("JVC")
    # Without exclusion, the AED-1 row would drag the average far below
    # 16000 — with exclusion, it stays right in the real cluster.
    assert result["avg_price_per_sqm"] > 15000
    assert result["n_outliers_excluded"] == 1


def test_lookup_area_data_no_outliers_field_when_nothing_excluded():
    """An ordinary, clean result must not grow a stray n_outliers_excluded
    key — same 'only appears when real' rule as every other optional
    field in this file."""
    today = date(2026, 8, 20)
    fake_rows = [
        {"area_name_en": "JVC", "price_per_sqm": 16000, "actual_worth": 1100000,
         "instance_date": today.isoformat()},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_area_data("JVC")
    assert "n_outliers_excluded" not in result


def test_lookup_project_data_excludes_worth_outlier_from_headline_average():
    today = date(2026, 8, 20)
    normal_rows = [
        {"project_name_en": "Binghatti Aquarise", "area_name_en": "JVC", "price_per_sqm": 16000,
         "actual_worth": 1100000 + i * 5000, "instance_date": today.isoformat()}
        for i in range(12)
    ]
    outlier_row = {"project_name_en": "Binghatti Aquarise", "area_name_en": "JVC",
                   "price_per_sqm": 16000, "actual_worth": 999000000,
                   "instance_date": today.isoformat()}
    fake_rows = normal_rows + [outlier_row]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.lookup_project_data("Binghatti Aquarise")
    assert result["avg_actual_worth"] < 2000000
    assert result["n_outliers_excluded"] == 1


def test_bedroom_breakdown_also_gets_outlier_protection():
    """The bedroom-specific breakdown shares the same fix, not just the
    area-wide headline number."""
    today = date(2026, 8, 20)
    area_rows = [
        {"area_name_en": "JVC", "price_per_sqm": 16000, "actual_worth": 1100000,
         "instance_date": today.isoformat()},
    ]
    bed_rows = [
        {"area_name_en": "JVC", "price_per_sqm": 16000 + i * 20, "actual_worth": 1100000,
         "instance_date": today.isoformat(), "rooms_en": "1 B/R", "procedure_area": "75.0"}
        for i in range(12)
    ] + [
        {"area_name_en": "JVC", "price_per_sqm": 1, "actual_worth": 1100000,
         "instance_date": today.isoformat(), "rooms_en": "1 B/R", "procedure_area": "75.0"}
    ]
    with patch.object(clients.supabase, "rpc", side_effect=[
        _mock_rpc_result(area_rows), _mock_rpc_result(bed_rows),
    ]):
        result = stage4.lookup_area_data("JVC", bedrooms=1)
    assert result["bedroom_breakdown"]["avg_price_per_sqm"] > 15000
    assert result["bedroom_breakdown"]["n_outliers_excluded"] == 1


# ===========================================================================
# lookup_project_comparison_data() — closes the developer "vs. named
# competitors" gap (doc §3.4). Exact same pattern as the existing
# lookup_comparison_data(), just keyed on lookup_project_data().
# ===========================================================================
def test_lookup_project_comparison_data_both_found():
    fake_rows_1 = [{"project_name_en": "Binghatti Aquarise", "area_name_en": "Business Bay",
                     "price_per_sqm": 18000, "actual_worth": 1500000, "instance_date": "2026-08-01"}]
    fake_rows_2 = [{"project_name_en": "Sobha Hartland", "area_name_en": "MBR City",
                     "price_per_sqm": 22000, "actual_worth": 2100000, "instance_date": "2026-08-05"}]
    with patch.object(clients.supabase, "rpc",
                       side_effect=[_mock_rpc_result(fake_rows_1), _mock_rpc_result(fake_rows_2)]):
        result = stage4.lookup_project_comparison_data("Binghatti Aquarise", "Sobha Hartland")
    assert result["comparison"][0]["project"] == "Binghatti Aquarise"
    assert result["comparison"][1]["project"] == "Sobha Hartland"


def test_lookup_project_comparison_data_one_missing_preserves_real_name():
    """Reproduces the exact confirmed-live screenshot: 'Binghatti
    Aquarise' has data, 'Sobha Hartland' doesn't. The missing side must
    keep its REAL requested name via the no_data marker, not degrade to
    a bare None (which previously lost the name and fell back to a
    generic 'Option 2' in the rendered table)."""
    fake_rows_found = [{"project_name_en": "Binghatti Aquarise", "area_name_en": "Business Bay",
                         "price_per_sqm": 18000, "actual_worth": 1500000, "instance_date": "2026-08-03"}]
    with patch.object(clients.supabase, "rpc",
                       side_effect=[_mock_rpc_result(fake_rows_found), _mock_rpc_result([])]):
        result = stage4.lookup_project_comparison_data("Binghatti Aquarise", "Sobha Hartland")

    assert result["comparison"][0]["project"] == "Binghatti Aquarise"
    assert result["comparison"][1] == {"project": "Sobha Hartland", "no_data": True}


def test_lookup_project_comparison_data_missing_project_returns_none():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        assert stage4.lookup_project_comparison_data(None, "Sobha Hartland") is None
        assert stage4.lookup_project_comparison_data("Binghatti Aquarise", None) is None
    mock_rpc.assert_not_called()


def test_lookup_project_comparison_data_both_missing_returns_none():
    fake_rows_empty = []
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows_empty)):
        result = stage4.lookup_project_comparison_data("Nonexistent One", "Nonexistent Two")
    assert result is None


# ===========================================================================
# get_service_charges() — closes the highest-value finding from the
# coverage audit: owners_association_charges (DLD Dataset 25, 89,125
# rows) was fully loaded and completely unused. Verified live before
# building: service_cost is a PER-CATEGORY, PER-PROPERTY-GROUP line
# item, not a project-level total — the RPC does the real per-group
# sum -> median-across-groups aggregation server-side (confirmed live:
# International City Emarati -> median 10 AED/sqft, matching its real
# reputation as one of Dubai's cheapest areas; naively averaging raw
# rows for the same project gives a nonsense 2,223).
# ===========================================================================
def test_get_service_charges_returns_real_median():
    fake_rows = [{
        "matched_project_name": "TENORA", "master_community_name": "Dubai Marina",
        "resolved_year": 2023, "n_property_groups": 18,
        "median_charge_per_sqft": 13.5, "min_charge_per_sqft": 5, "max_charge_per_sqft": 19,
        "n_excluded_outliers": 2,
    }]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_service_charges("Tenora")
    mock_rpc.assert_called_once_with(
        "service_charges_by_project",
        {"project_pattern": "%Tenora%", "project_exact": "Tenora",
         "usage_filter": "Residential", "target_year": None},
    )
    assert result["matched_project"] == "TENORA"
    assert result["median_charge_per_sqft"] == 13.5
    assert result["n_property_groups"] == 18
    assert result["n_excluded_outliers"] == 2


def test_get_service_charges_no_project_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        assert stage4.get_service_charges(None) is None
        assert stage4.get_service_charges("") is None
        assert stage4.get_service_charges("   ") is None
    mock_rpc.assert_not_called()


def test_get_service_charges_no_match_returns_none():
    """Zero-transaction-rule equivalent: RPC returns no rows when the
    project isn't found, usage/year has no data, or fewer than 3 clean
    property groups remain after outlier exclusion — all three collapse
    to an honest None here, never a fabricated figure."""
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_service_charges("Nonexistent Building XYZ")
    assert result is None


def test_get_service_charges_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_service_charges("Tenora")
    assert result is None


def test_get_service_charges_respects_usage_and_year_params():
    fake_rows = [{
        "matched_project_name": "TENORA", "master_community_name": "Dubai Marina",
        "resolved_year": 2022, "n_property_groups": 5,
        "median_charge_per_sqft": 8.0, "min_charge_per_sqft": 6, "max_charge_per_sqft": 11,
        "n_excluded_outliers": 0,
    }]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_service_charges("Tenora", usage="Retail", year=2022)
    call_args = mock_rpc.call_args[0][1]
    assert call_args["usage_filter"] == "Retail"
    assert call_args["target_year"] == 2022


# ===========================================================================
# NEW FUNCTIONALITY — get_escrow_agent (escrow-agent-by-project enrichment).
# Mirrors the get_broker_info test pattern exactly: mocked rpc, no-input
# guards, no-match, and exception-safety cases. Does not modify or remove
# any existing test above this point.
# ===========================================================================
def test_get_escrow_agent_returns_real_data():
    fake_rows = [{
        "project_name_en": "Emirates Living - Springs 10",
        "escrow_agent_name_en": "MASHREQ BANK PSC",
        "escrow_agent_phone": None,
    }]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_escrow_agent("Emirates Living - Springs 10")
    mock_rpc.assert_called_once_with(
        "escrow_agent_by_project",
        {"project_pattern": "%Emirates Living - Springs 10%",
         "project_exact": "Emirates Living - Springs 10"},
    )
    assert result["project"] == "Emirates Living - Springs 10"
    assert result["escrow_agent_name"] == "MASHREQ BANK PSC"
    assert result["escrow_agent_phone"] is None


def test_get_escrow_agent_with_phone():
    fake_rows = [{
        "project_name_en": "Some Project",
        "escrow_agent_name_en": "UNITED BANK LIMITED (MANAGEMENT OFFICE)",
        "escrow_agent_phone": "97146085350",
    }]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_escrow_agent("Some Project")
    assert result["escrow_agent_phone"] == "97146085350"


def test_get_escrow_agent_none_project_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        assert stage4.get_escrow_agent(None) is None
        assert stage4.get_escrow_agent("") is None
        assert stage4.get_escrow_agent("   ") is None
    mock_rpc.assert_not_called()


def test_get_escrow_agent_no_match_returns_none():
    """Project not found, or found but no escrow_agent_id on file
    (confirmed live: ~45% of avm project names don't resolve one) —
    both collapse to an honest None, never a fabricated agent."""
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_escrow_agent("Nonexistent Project XYZ")
    assert result is None


def test_get_escrow_agent_row_with_null_name_returns_none():
    """Defensive: if the RPC ever returns a row shape with no usable
    agent name, treat it the same as no match rather than surfacing a
    half-empty dict."""
    with patch.object(clients.supabase, "rpc",
                       return_value=_mock_rpc_result([{"project_name_en": "X",
                                                        "escrow_agent_name_en": None,
                                                        "escrow_agent_phone": None}])):
        result = stage4.get_escrow_agent("X")
    assert result is None


def test_get_escrow_agent_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_escrow_agent("Emirates Living - Springs 10")
    assert result is None


# ===========================================================================
# NEW FUNCTIONALITY — get_valuator_info (licensed valuator lookup). Mirrors
# the get_broker_info test block above exactly, since the two functions
# share identical logic and the same real-world name-collision shape.
# Does not modify any existing test above this point.
# ===========================================================================
def test_get_valuator_info_returns_real_data_with_computed_expiry():
    fake_rows = [{"valuator_name_en": "ZAHER IBRAHIM",
                  "valuation_company_name_en": "3 D APPRAISAL INTERNATIONAL REAL ESTATE VALUATION SERVICES L.L.C",
                  "license_start_date": "2016-08-10", "license_end_date": "2020-01-30",
                  "valuator_nationality_en": "Canada"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_valuator_info("Zaher Ibrahim")
    mock_rpc.assert_called_once_with(
        "search_valuators",
        {"name_pattern": "%Zaher Ibrahim%", "name_exact": "Zaher Ibrahim"},
    )
    assert result[0]["valuator_name"] == "ZAHER IBRAHIM"
    assert result[0]["nationality"] == "Canada"
    assert result[0]["is_license_expired"] is True  # confirmed-past date


def test_get_valuator_info_current_license_not_marked_expired():
    fake_rows = [{"valuator_name_en": "X", "valuation_company_name_en": "Y",
                  "license_start_date": "2024-01-01", "license_end_date": "2099-01-01",
                  "valuator_nationality_en": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_valuator_info("X")
    assert result[0]["is_license_expired"] is False


def test_get_valuator_info_multiple_matches_all_returned():
    """Confirmed live: 2 of 151 real valuator names genuinely belong to
    two distinct licensed records -- all matches must come back."""
    fake_rows = [
        {"valuator_name_en": "ABDULLATIF MOHAMMAD IBRAHIM ABDULLA AL BANNA",
         "valuation_company_name_en": "ABDULLATIF AL BANNA REAL ESTATE VALUATION L.L.C",
         "license_start_date": "2017-05-17", "license_end_date": "2026-12-18",
         "valuator_nationality_en": "United Arab Emirates"},
        {"valuator_name_en": "ABDULLATIF MOHAMMAD IBRAHIM ABDULLA AL BANNA",
         "valuation_company_name_en": "AL ZAJEL REAL ESTATE L.L.C",
         "license_start_date": "2010-03-24", "license_end_date": "2026-11-19",
         "valuator_nationality_en": "United Arab Emirates"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_valuator_info("Abdullatif Mohammad Ibrahim Abdulla Al Banna")
    assert len(result) == 2
    assert {r["valuation_company"] for r in result} == {
        "ABDULLATIF AL BANNA REAL ESTATE VALUATION L.L.C", "AL ZAJEL REAL ESTATE L.L.C",
    }


def test_get_valuator_info_none_name_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        assert stage4.get_valuator_info(None) is None
        assert stage4.get_valuator_info("") is None
        assert stage4.get_valuator_info("   ") is None
    mock_rpc.assert_not_called()


def test_get_valuator_info_no_match_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_valuator_info("Nonexistent Valuator XYZ")
    assert result is None


def test_get_valuator_info_missing_expiry_not_marked_expired_or_current():
    fake_rows = [{"valuator_name_en": "X", "valuation_company_name_en": "Y",
                  "license_start_date": None, "license_end_date": None,
                  "valuator_nationality_en": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_valuator_info("X")
    assert result[0]["is_license_expired"] is None


def test_get_valuator_info_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_valuator_info("Zaher Ibrahim")
    assert result is None


# ===========================================================================
# NEW FUNCTIONALITY — get_land_zoning (land_registry area-scoped lookup).
# Mirrors get_valuation_stats' test pattern. Does not modify any existing
# test above this point.
# ===========================================================================
def test_get_land_zoning_returns_real_data():
    fake_rows = [
        {"land_type_en": "Commercial", "parcel_count": 214, "avg_area_sqm": "24491.3", "total_area_sqm": "5241148.8"},
        {"land_type_en": "Utility", "parcel_count": 29, "avg_area_sqm": "298.5", "total_area_sqm": "8656.3"},
    ]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.get_land_zoning("Dubai Marina")
    mock_rpc.assert_called_once_with(
        "land_zoning_by_area",
        {"area_pattern": "%marsa dubai%", "area_exact": "marsa dubai"},
    )
    assert result["zoning"][0]["land_type"] == "Commercial"
    assert result["zoning"][0]["parcel_count"] == 214
    assert result["zoning"][0]["avg_area_sqm"] == 24491.3
    assert result["zoning"][1]["land_type"] == "Utility"


def test_get_land_zoning_none_area_never_calls_rpc():
    with patch.object(clients.supabase, "rpc") as mock_rpc:
        assert stage4.get_land_zoning(None) is None
        assert stage4.get_land_zoning("") is None
    mock_rpc.assert_not_called()


def test_get_land_zoning_no_match_returns_none():
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result([])):
        result = stage4.get_land_zoning("Nonexistent Area XYZ")
    assert result is None


def test_get_land_zoning_exception_returns_none_not_crash():
    with patch.object(clients.supabase, "rpc", side_effect=Exception("connection error")):
        result = stage4.get_land_zoning("Dubai Marina")
    assert result is None


def test_get_land_zoning_unspecified_type_included_not_dropped():
    """Confirmed live: 16,063 of 207,097 land_registry rows citywide have
    a real NULL land_type -- the RPC groups these as 'Unspecified', and
    this must survive into the returned dict, not get silently filtered."""
    fake_rows = [{"land_type_en": "Unspecified", "parcel_count": 2, "avg_area_sqm": "4741.6", "total_area_sqm": "9483.2"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_land_zoning("Dubai Marina")
    assert result["zoning"][0]["land_type"] == "Unspecified"


def test_get_land_zoning_null_area_values_handled():
    fake_rows = [{"land_type_en": "Commercial", "parcel_count": 5, "avg_area_sqm": None, "total_area_sqm": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_land_zoning("Some Area")
    assert result["zoning"][0]["avg_area_sqm"] is None
    assert result["zoning"][0]["total_area_sqm"] is None

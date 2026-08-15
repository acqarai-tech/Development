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
    assert result["area"] == "Jumeirah Village Circle (JVC)"
    assert result["transaction_sample_size"] == 2
    assert result["avg_price_per_sqm"] == 16500
    assert result["avg_actual_worth"] == 1650000


def test_normal_case_calls_rpc_with_correct_params():
    fake_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                  "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.lookup_area_data("jvc")
    mock_rpc.assert_called_once_with(
        "search_avm", {"area_pattern": "%jvc%", "room_types": None, "row_limit": 500, "project_pattern": None}
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
    """The real naming mismatch found live."""
    fake_rows = [{"area_name_en": "Burj Khalifa", "price_per_sqm": 29840,
                  "actual_worth": 4496260, "instance_date": "2026-08-03"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        result = stage4.lookup_area_data("Downtown Dubai")
    assert result["area"] == "Burj Khalifa"
    call_args = mock_rpc.call_args[0][1]
    assert "burj khalifa" in call_args["area_pattern"].lower()


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
    fake_rows = [{"instance_date": "2026-07-13", "rooms_en": "Studio",
                  "procedure_area": "37.96", "actual_worth": "744017.0", "price_per_sqm": "19600.03"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_recent_transactions("jvc", limit=10)
    mock_rpc.assert_called_once_with(
        "search_avm", {"area_pattern": "%jvc%", "room_types": None, "row_limit": 10, "project_pattern": None}
    )


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


def _mock_rpc_result(rows):
    mock_execute = MagicMock()
    mock_execute.data = rows
    mock_rpc_builder = MagicMock()
    mock_rpc_builder.execute.return_value = mock_execute
    return mock_rpc_builder


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
        "area_price_trend", {"area_pattern": "%jvc%", "room_types": None}
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
    fake_rows = [{"instance_date": "2026-07-13", "rooms_en": "1 B/R", "procedure_area": "51.25",
                  "actual_worth": "1281000.0", "price_per_sqm": "24995.12",
                  "project_name_en": "Bloom Towers"}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_recent_transactions("jvc", limit=10, project="Bloom Towers")
    mock_rpc.assert_called_once_with(
        "search_avm", {"area_pattern": "%jvc%", "room_types": None, "row_limit": 10,
                        "project_pattern": "%Bloom Towers%"}
    )


def test_recent_transactions_no_project_means_no_project_filter():
    fake_rows = [{"instance_date": "2026-07-13", "rooms_en": "1 B/R", "procedure_area": "51.25",
                  "actual_worth": "1281000.0", "price_per_sqm": "24995.12", "project_name_en": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)) as mock_rpc:
        stage4.get_recent_transactions("jvc")
    call_args = mock_rpc.call_args[0][1]
    assert call_args["project_pattern"] is None

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
        "search_avm", {"area_pattern": "%jvc%", "room_types": None, "row_limit": 500,
                        "project_pattern": None, "area_exact": "jvc", "require_project": False,
                        "require_rooms": False}
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
    assert last_call_args == {"area_pattern": "%jvc%", "room_types": None, "row_limit": 10,
                               "project_pattern": None, "area_exact": "jvc", "require_project": False,
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
        "list_area_projects", {"area_pattern": "%jvc%", "area_exact": "jvc", "row_limit": 50}
    )
    assert result[0]["project"] == "Auresta Tower"
    assert result[0]["transaction_count"] == 1021
    assert result[0]["avg_price_per_sqm"] == 15501
    assert result[0]["avg_price_per_sqft"] == round(15500.73 / stage4.SQM_TO_SQFT)


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
         "transaction_count": 2794, "avg_ppsqm": 41312.02},
        {"project_name": "Binghatti Skyflame 1", "area_en": "Wadi Al Safa 3", "project_status": "ACTIVE",
         "transaction_count": 1017, "avg_ppsqm": 15432.20},
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


def test_get_developer_projects_honestly_shows_zero_transactions():
    """Confirmed live: a real project (Binghatti Square 3) with zero
    real avm transactions must show 0, never be hidden or guessed."""
    fake_rows = [{"project_name": "Binghatti Square 3", "area_en": "Wadi Al Safa 3",
                  "project_status": "ACTIVE", "transaction_count": 0, "avg_ppsqm": None}]
    with patch.object(clients.supabase, "rpc", return_value=_mock_rpc_result(fake_rows)):
        result = stage4.get_developer_projects("Binghatti")
    assert result[0]["transaction_count"] == 0
    assert result[0]["avg_price_per_sqm"] is None


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
    not a total failure just because one side came up empty."""
    def fake_lookup(area, bedrooms=None):
        return {"area": "JVC", "avg_price_per_sqm": 16000} if area == "JVC" else None

    with patch.object(stage4, "lookup_area_data", side_effect=fake_lookup):
        result = stage4.lookup_comparison_data("JVC", "Nonexistent Area XYZ")

    assert result["comparison"][0]["area"] == "JVC"
    assert result["comparison"][1] is None


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

"""
Stage 4 tests — new functions only: get_all_areas(), get_district_properties(),
get_price_trend(), plus the avg_price_per_sqft addition to lookup_area_data().
Follows the same mocking pattern as the existing test_stage4.py.
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

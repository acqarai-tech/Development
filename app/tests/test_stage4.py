"""
Stage 4 tests — tests ONLY lookup_area_data() and get_recent_transactions(),
with a fake Supabase RPC client (search_avm).

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
        "search_avm", {"area_pattern": "%jvc%", "room_types": None, "row_limit": 500}
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
        "search_avm", {"area_pattern": "%jvc%", "room_types": None, "row_limit": 10}
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

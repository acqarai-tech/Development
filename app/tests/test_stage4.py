"""
Stage 4 tests — Stage 2 already passed on its own. Stage 5 doesn't exist
yet. This file tests ONLY lookup_area_data(), with a fake Supabase client.
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


def _mock_supabase_result(rows):
    mock_execute = MagicMock()
    mock_execute.data = rows
    mock_query = MagicMock()
    mock_query.select.return_value = mock_query
    mock_query.ilike.return_value = mock_query
    mock_query.in_.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.execute.return_value = mock_execute
    return mock_query


def test_normal_case_aggregates_correctly():
    fake_rows = [
        {"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
         "actual_worth": 1600000, "instance_date": "2026-07-13"},
        {"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 17000,
         "actual_worth": 1700000, "instance_date": "2026-07-01"},
    ]
    with patch.object(clients.supabase, "table", return_value=_mock_supabase_result(fake_rows)):
        result = stage4.lookup_area_data("jvc")
    assert result["area"] == "Jumeirah Village Circle (JVC)"
    assert result["transaction_sample_size"] == 2
    assert result["avg_price_per_sqm"] == 16500
    assert result["avg_actual_worth"] == 1650000


def test_no_matching_rows_returns_none():
    with patch.object(clients.supabase, "table", return_value=_mock_supabase_result([])):
        result = stage4.lookup_area_data("nonexistent area xyz")
    assert result is None


def test_none_area_never_queries_database():
    with patch.object(clients.supabase, "table") as mock_table:
        result = stage4.lookup_area_data(None)
    assert result is None
    mock_table.assert_not_called()


def test_rows_with_no_usable_numbers_returns_none():
    fake_rows = [{"area_name_en": "Some Area", "price_per_sqm": None,
                  "actual_worth": None, "instance_date": "2026-01-01"}]
    with patch.object(clients.supabase, "table", return_value=_mock_supabase_result(fake_rows)):
        result = stage4.lookup_area_data("some area")
    assert result is None


def test_supabase_exception_returns_none_not_crash():
    """The real timeout bug found live — must degrade gracefully."""
    with patch.object(clients.supabase, "table", side_effect=Exception("statement timeout")):
        result = stage4.lookup_area_data("jvc")
    assert result is None


def test_downtown_resolves_to_burj_khalifa():
    """The real naming mismatch found live."""
    fake_rows = [{"area_name_en": "Burj Khalifa", "price_per_sqm": 29840,
                  "actual_worth": 4496260, "instance_date": "2026-08-03"}]
    captured = {}

    def fake_table(name):
        q = _mock_supabase_result(fake_rows)
        original_ilike = q.ilike
        def capturing_ilike(col, val):
            captured["val"] = val
            return original_ilike(col, val)
        q.ilike = capturing_ilike
        return q

    with patch.object(clients.supabase, "table", side_effect=fake_table):
        result = stage4.lookup_area_data("Downtown Dubai")
    assert result["area"] == "Burj Khalifa"
    assert "burj khalifa" in captured["val"].lower()


# ---------------------------------------------------------------------------
# NEW: bedroom-specific lookup (the real fix — data does exist, confirmed live)
# ---------------------------------------------------------------------------
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

    def fake_table(name):
        call_count["n"] += 1
        return _mock_supabase_result(area_wide_rows if call_count["n"] == 1 else bedroom_rows)

    with patch.object(clients.supabase, "table", side_effect=fake_table):
        result = stage4.lookup_area_data("jvc", bedrooms=1)

    assert "bedroom_breakdown" in result
    assert result["bedroom_breakdown"]["bedrooms"] == 1
    assert result["bedroom_breakdown"]["transaction_sample_size"] == 2
    assert result["bedroom_breakdown"]["avg_size_sqm"] == 73.0  # (72.9+73.0)/2 rounded to 1dp -> 72.95 -> 73.0 via round()


def test_no_bedroom_rows_falls_back_to_area_wide_only_no_lie():
    """If a bedroom count genuinely has no real transactions, the result
    must NOT include a fabricated bedroom_breakdown — area-wide data still
    returns normally, just without that key."""
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    call_count = {"n": 0}

    def fake_table(name):
        call_count["n"] += 1
        return _mock_supabase_result(area_wide_rows if call_count["n"] == 1 else [])

    with patch.object(clients.supabase, "table", side_effect=fake_table):
        result = stage4.lookup_area_data("jvc", bedrooms=7)  # unrealistic count, no real rows

    assert "bedroom_breakdown" not in result
    assert result["avg_price_per_sqm"] == 16000  # area-wide data still present


def test_bedrooms_none_never_triggers_second_query():
    """When bedrooms isn't asked for, only ONE query should run — no
    wasted lookup, no bedroom_breakdown key at all."""
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    with patch.object(clients.supabase, "table", return_value=_mock_supabase_result(area_wide_rows)) as mock_table:
        result = stage4.lookup_area_data("jvc")
    assert mock_table.call_count == 1
    assert "bedroom_breakdown" not in result


def test_bedroom_lookup_exception_degrades_to_area_wide_only():
    """If the bedroom-specific query itself fails, don't crash the whole
    lookup — degrade to area-wide data, same honesty rule as everywhere
    else in this pipeline."""
    area_wide_rows = [{"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
                        "actual_worth": 1600000, "instance_date": "2026-07-13"}]
    call_count = {"n": 0}

    def fake_table(name):
        call_count["n"] += 1
        if call_count["n"] == 1:
            return _mock_supabase_result(area_wide_rows)
        raise Exception("bedroom query failed")

    with patch.object(clients.supabase, "table", side_effect=fake_table):
        result = stage4.lookup_area_data("jvc", bedrooms=1)

    assert "bedroom_breakdown" not in result
    assert result["avg_price_per_sqm"] == 16000

"""
Stage 4 standalone tests — lookup_area_data()
===============================================
Tests ONLY the Supabase lookup function, called directly with plain
strings — no extract_entities() involved, no build_answer() involved.
These prove Stage 4 is correct on its own before it's wired to anything.

The real Supabase client is mocked so these run offline. What's tested:
does lookup_area_data() query the right column, aggregate correctly, and
handle "nothing found" the way Section 5.4 habit #4 requires?
"""
from unittest.mock import patch, MagicMock

import chat


def _mock_supabase_result(rows):
    """Builds a fake Supabase query chain returning the given rows."""
    mock_execute_result = MagicMock()
    mock_execute_result.data = rows

    mock_query = MagicMock()
    mock_query.select.return_value = mock_query
    mock_query.ilike.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.execute.return_value = mock_execute_result

    return mock_query


# ---------------------------------------------------------------------------
# Normal case: area has real transaction rows
# ---------------------------------------------------------------------------
def test_lookup_area_data_normal_case_aggregates_correctly():
    fake_rows = [
        {"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 16000,
         "actual_worth": 1600000, "instance_date": "2026-07-13"},
        {"area_name_en": "Jumeirah Village Circle (JVC)", "price_per_sqm": 17000,
         "actual_worth": 1700000, "instance_date": "2026-07-01"},
    ]
    with patch.object(chat.supabase, "table", return_value=_mock_supabase_result(fake_rows)):
        result = chat.lookup_area_data("jvc")

    assert result is not None
    assert result["area"] == "Jumeirah Village Circle (JVC)"
    assert result["transaction_sample_size"] == 2
    assert result["avg_price_per_sqm"] == 16500  # (16000 + 17000) / 2
    assert result["avg_actual_worth"] == 1650000
    assert result["most_recent_transaction_date"] == "2026-07-13"


# ---------------------------------------------------------------------------
# "Nothing found" case: area has zero matching rows
# ---------------------------------------------------------------------------
def test_lookup_area_data_no_matching_rows_returns_none():
    with patch.object(chat.supabase, "table", return_value=_mock_supabase_result([])):
        result = chat.lookup_area_data("nonexistent area xyz")

    assert result is None


# ---------------------------------------------------------------------------
# No area text at all — should never even query the database
# ---------------------------------------------------------------------------
def test_lookup_area_data_none_area_never_queries_database():
    with patch.object(chat.supabase, "table") as mock_table:
        result = chat.lookup_area_data(None)

    assert result is None
    mock_table.assert_not_called()


# ---------------------------------------------------------------------------
# Rows exist but both numeric fields are null — must not fake an average
# ---------------------------------------------------------------------------
def test_lookup_area_data_rows_with_no_usable_numbers_returns_none():
    fake_rows = [
        {"area_name_en": "Some Area", "price_per_sqm": None,
         "actual_worth": None, "instance_date": "2026-01-01"},
    ]
    with patch.object(chat.supabase, "table", return_value=_mock_supabase_result(fake_rows)):
        result = chat.lookup_area_data("some area")

    assert result is None, (
        "Rows with no usable price/worth data must not produce a fake "
        "average from an empty list."
    )


# ---------------------------------------------------------------------------
# Supabase itself errors (the exact timeout bug found live) — must not crash
# ---------------------------------------------------------------------------
def test_lookup_area_data_supabase_exception_returns_none_not_crash():
    with patch.object(chat.supabase, "table", side_effect=Exception("statement timeout")):
        result = chat.lookup_area_data("jvc")

    assert result is None, (
        "A Supabase-side failure (like the real statement-timeout bug found "
        "live) must degrade to an honest 'no data' result, never crash the "
        "pipeline."
    )


# ---------------------------------------------------------------------------
# Genuine naming mismatch (Downtown -> Burj Khalifa) resolves correctly
# ---------------------------------------------------------------------------
def test_lookup_area_data_downtown_resolves_to_burj_khalifa():
    fake_rows = [
        {"area_name_en": "Burj Khalifa", "price_per_sqm": 29840,
         "actual_worth": 4496260, "instance_date": "2026-08-03"},
    ]
    captured_ilike_args = {}

    def fake_table(name):
        mock_query = _mock_supabase_result(fake_rows)
        original_ilike = mock_query.ilike
        def capturing_ilike(col, val):
            captured_ilike_args["col"] = col
            captured_ilike_args["val"] = val
            return original_ilike(col, val)
        mock_query.ilike = capturing_ilike
        return mock_query

    with patch.object(chat.supabase, "table", side_effect=fake_table):
        result = chat.lookup_area_data("Downtown Dubai")

    assert result is not None
    assert result["area"] == "Burj Khalifa"
    assert "burj khalifa" in captured_ilike_args["val"].lower(), (
        "Downtown Dubai must be rewritten to search 'burj khalifa', per the "
        "real DLD naming mismatch confirmed live."
    )

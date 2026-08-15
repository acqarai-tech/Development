"""
Wiring test — Stage 2, 4, and 5 are each already proven correct alone.
This file checks ONLY the connection between them: does chat.chat() call
them in the right order, with the right data passed between them?

Includes the original Beta v0 gate tests (T1, T4, T8, T15, plus the
bedrooms-flow-through and empty-message tests) AND the routing tests for
this version's additions: list_areas, area_properties, and the
wants_trend -> chart_data path. Previously these lived in two files
(test_wiring.py and test_wiring_new_features.py) — merged here into one,
per request, since both test the same wiring layer.
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

import pytest
import ai_chat as chat


# ===========================================================================
# Original Beta v0 gate tests (T1, T4, T8, T15) — unchanged
# ===========================================================================
def test_t1_known_area_is_grounded():
    fake_data = {"area": "jvc", "avg_price_sqft": 1050}
    with patch.object(chat, "lookup_area_data", return_value=fake_data), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=("JVC shows strength.", True)):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying in 2026?"))
    assert resp.grounded is True
    assert resp.area == "jvc"


def test_t4_no_data_never_invents_numbers():
    with patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": None, "bedrooms": 1, "budget": None
         }):
        resp = chat.chat(chat.ChatRequest(message="Price of Tiger Sky Tower for a 1BR?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_t8_guardrail_catches_hallucinated_ungrounded_answer():
    with patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=("Yields here run AED 1,200 per sq ft.", False)):
        resp = chat.chat(chat.ChatRequest(message="Some ungrounded question"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_t15_leaked_error_is_caught():
    with patch.object(chat, "lookup_area_data", return_value={"area": "jvc"}), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=("Traceback (most recent call last): KeyError", True)):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))
    assert resp.grounded is False
    assert "Traceback" not in resp.answer


def test_empty_message_rejected():
    from fastapi import HTTPException
    with pytest.raises(HTTPException):
        chat.chat(chat.ChatRequest(message="   "))


def test_wiring_calls_stages_in_correct_order_with_correct_data_flow():
    """The actual 'connection' test: extract_entities' area output must be
    what gets passed into lookup_area_data, and lookup_area_data's output
    must be what gets passed into build_answer."""
    call_order = []

    def fake_extract(question):
        call_order.append("extract_entities")
        return {"question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None}

    def fake_lookup(area, bedrooms=None):
        call_order.append("lookup_area_data")
        assert area == "JVC", "lookup_area_data must receive extract_entities' area output"
        return {"area": "Jumeirah Village Circle (JVC)", "avg_price_per_sqm": 16327}

    def fake_build(question, entities, data):
        call_order.append("build_answer")
        assert data == {"area": "Jumeirah Village Circle (JVC)", "avg_price_per_sqm": 16327}, (
            "build_answer must receive lookup_area_data's exact output"
        )
        return "JVC shows strength.", True

    with patch.object(chat, "extract_entities", side_effect=fake_extract), \
         patch.object(chat, "lookup_area_data", side_effect=fake_lookup), \
         patch.object(chat, "build_answer", side_effect=fake_build):
        chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))

    assert call_order == ["extract_entities", "lookup_area_data", "build_answer"], (
        "Stages must be called in exactly this order — this is the actual "
        "wiring connection between three independently-proven stages."
    )


def test_bedrooms_flows_from_extract_entities_into_lookup_area_data():
    """The real connection this fix depends on: Stage 2's 'bedrooms' output
    must actually reach Stage 4's lookup_area_data() call, not get dropped
    silently at the wiring layer."""
    captured = {}

    def fake_extract(question):
        return {"question_type": "project_price", "area": "JVC", "bedrooms": 1, "budget": None}

    def fake_lookup(area, bedrooms=None):
        captured["area"] = area
        captured["bedrooms"] = bedrooms
        return {"area": "Jumeirah Village Circle (JVC)", "avg_price_per_sqm": 16327,
                "bedroom_breakdown": {"bedrooms": 1, "avg_actual_worth": 1098562}}

    def fake_build(question, entities, data):
        return "1BR in JVC averages 1,098,562 AED.", True

    with patch.object(chat, "extract_entities", side_effect=fake_extract), \
         patch.object(chat, "lookup_area_data", side_effect=fake_lookup), \
         patch.object(chat, "build_answer", side_effect=fake_build):
        resp = chat.chat(chat.ChatRequest(message="What's the price of a 1BR in JVC?"))

    assert captured["bedrooms"] == 1, (
        "bedrooms=1 from Stage 2's output must reach lookup_area_data() — "
        "this is the actual wiring fix, not just Stage 4's internal logic."
    )
    assert resp.grounded is True


# ===========================================================================
# New routing tests — list_areas, area_properties, wants_trend -> chart_data
# (previously test_wiring_new_features.py, merged in here)
# ===========================================================================
def test_list_areas_routes_to_get_all_areas_not_lookup_area_data():
    fake_areas = [{"district_code": "D001", "district_name": "4 Al Yilayis St"}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "list_areas", "area": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_all_areas", return_value=fake_areas) as mock_get_all, \
         patch.object(chat, "lookup_area_data") as mock_lookup, \
         patch.object(chat, "build_answer", return_value=("We cover 1 area.", True)):
        resp = chat.chat(chat.ChatRequest(message="What areas do you cover?"))
    mock_get_all.assert_called_once()
    mock_lookup.assert_not_called()
    assert resp.grounded is True
    assert resp.area is None  # no single area for a list_areas answer


def test_list_areas_empty_falls_back_honestly():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "list_areas", "area": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_all_areas", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="What areas do you cover?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_area_properties_routes_to_get_district_properties():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_properties", "area": "Dubai Hills Estate",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_district_properties",
                       return_value=(["Property A", "Property B"], 2)) as mock_props, \
         patch.object(chat, "lookup_area_data") as mock_lookup, \
         patch.object(chat, "build_answer", return_value=("2 properties found.", True)):
        resp = chat.chat(chat.ChatRequest(message="What's in Dubai Hills Estate?"))
    mock_props.assert_called_once_with("Dubai Hills Estate")
    mock_lookup.assert_not_called()
    assert resp.grounded is True


def test_wants_trend_merges_price_trend_into_data_and_chart_data():
    fake_area_data = {"area": "jvc", "avg_price_per_sqm": 16000, "avg_price_per_sqft": 1487}
    fake_trend = [
        {"year": 2021, "avg_price_per_sqm": 14200, "avg_price_per_sqft": 1319, "transaction_count": 320},
        {"year": 2026, "avg_price_per_sqm": 16750, "avg_price_per_sqft": 1556, "transaction_count": 410},
    ]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": True,
         }), \
         patch.object(chat, "lookup_area_data", return_value=dict(fake_area_data)), \
         patch.object(chat, "get_price_trend", return_value=fake_trend) as mock_trend, \
         patch.object(chat, "build_answer", return_value=("Prices rose.", True)):
        resp = chat.chat(chat.ChatRequest(message="How has JVC trended?"))
    mock_trend.assert_called_once_with("JVC", bedrooms=None)
    assert resp.chart_data == fake_trend


def test_no_trend_requested_chart_data_is_none():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc", "avg_price_per_sqm": 16000}), \
         patch.object(chat, "get_price_trend") as mock_trend, \
         patch.object(chat, "build_answer", return_value=("JVC looks fine.", True)):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))
    mock_trend.assert_not_called()
    assert resp.chart_data is None


def test_trend_lookup_failure_does_not_break_normal_answer():
    """If get_price_trend() returns None (no data), the rest of the answer
    must still go through normally — a missing trend isn't a hard failure."""
    fake_area_data = {"area": "jvc", "avg_price_per_sqm": 16000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": True,
         }), \
         patch.object(chat, "lookup_area_data", return_value=dict(fake_area_data)), \
         patch.object(chat, "get_price_trend", return_value=None), \
         patch.object(chat, "build_answer", return_value=("JVC looks fine.", True)):
        resp = chat.chat(chat.ChatRequest(message="How has JVC trended?"))
    assert resp.grounded is True
    assert resp.chart_data is None


def test_transaction_list_succeeds_even_when_aggregate_lookup_fails():
    """Confirmed live: 'show me the last 10 sales for downtown' returned
    the honest no-data fallback because lookup_area_data() (a much
    heavier 500-row aggregate query) timed out on a high-volume area —
    even though get_recent_transactions() (a cheap, capped fetch) would
    have succeeded fine on its own. A transaction-list question doesn't
    need the aggregate at all; this proves it no longer depends on it."""
    fake_transactions = [
        {"date": "2026-08-03", "type": "2 B/R", "project": "Imperial Avenue",
         "size_sqft": 1376, "psm_aed": 23474, "psf_aed": 2181, "price_aed": 3000000},
    ]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "Downtown Dubai", "bedrooms": None,
             "wants_transaction_list": True, "transaction_count": 10, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "get_recent_transactions", return_value=fake_transactions), \
         patch.object(chat, "build_answer", return_value=("Here are the sales.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="Show me the last 10 sales for downtown"))
    assert resp.grounded is True
    # build_answer must have actually received the transactions, not None
    data_passed = mock_build.call_args[0][2]
    assert data_passed is not None
    assert data_passed["recent_transactions"] == fake_transactions


def test_transaction_list_still_none_when_both_lookups_fail():
    """The honest fallback must still fire when there's genuinely no
    data at all — this fix must not turn real 'no data' cases into a
    fabricated or empty-but-grounded answer."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "Nonexistent Area", "bedrooms": None,
             "wants_transaction_list": True, "transaction_count": 10, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "get_recent_transactions", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="Show me the last 10 sales for nowhere"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK

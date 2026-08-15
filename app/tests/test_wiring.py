"""
Wiring tests — new question_type routing (list_areas, area_properties) and
the wants_trend -> chart_data path. Same pattern as the existing
test_wiring.py: patch the Stage 2/4/5 functions as seen from ai_chat's own
namespace (imported here as `chat`, matching the fix applied to the
existing test_wiring.py / test_pipeline.py import line).
"""
import os
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("SUPABASE_URL_CHAT", "https://example.supabase.co")
os.environ.setdefault(
    "SUPABASE_SERVICE_ROLE_KEY_CHAT",
    "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9."
    "eyJyb2xlIjogInNlcnZpY2Vfcm9sZSIsICJpc3MiOiAic3VwYWJlLWRlbW8ifQ."
    "fakesignature",
)

import ai_chat as chat


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

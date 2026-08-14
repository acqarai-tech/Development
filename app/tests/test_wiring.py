"""
Wiring test — Stage 2, 4, and 5 are each already proven correct alone.
This file checks ONLY the connection between them: does chat.chat() call
them in the right order, with the right data passed between them?
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
import chat


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

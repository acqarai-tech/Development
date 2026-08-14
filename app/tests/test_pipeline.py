"""
Beta v0 must pass T1, T4, T8, T15 (Section 6) before it's considered done.
Run with:  pytest -v

Per Section 9.1, each test should pass 9/10 times on repeated runs, not
just once — for CI, consider running with `pytest --count=10` (pytest-repeat)
once these are stable, especially for anything hitting the real model.

These tests mock Groq and Supabase so they run offline/free. They test the
PIPELINE's logic (guardrails, fallback behavior), not the LLM's judgement —
the LLM's actual answer quality still needs the manual "~30 fresh questions"
spot-check from Section 9.1, which can't be automated.
"""
import json
from unittest.mock import patch, MagicMock

import pytest

import chat


# ---------------------------------------------------------------------------
# T1 — known single area returns a grounded, real-data answer
# ---------------------------------------------------------------------------
def test_t1_known_area_is_grounded():
    fake_row = {"area": "jvc", "avg_price_sqft": 1050, "rental_yield": 7.2}

    with patch.object(chat, "lookup_area_data", return_value=fake_row), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None
         }), \
         patch.object(chat.groq_client.chat.completions, "create") as mock_create:
        mock_create.return_value.choices = [
            MagicMock(message=MagicMock(content="JVC's rental yield is 7.2% with avg price AED 1,050/sqft."))
        ]
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying in 2026?"))

    assert resp.grounded is True
    assert resp.area == "jvc"
    assert "1,050" in resp.answer or "7.2" in resp.answer


# ---------------------------------------------------------------------------
# T4 — named project/area with genuinely no data -> honest fallback, zero invention
# ---------------------------------------------------------------------------
def test_t4_no_data_never_invents_numbers():
    with patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": None, "bedrooms": 1, "budget": None
         }):
        resp = chat.chat(chat.ChatRequest(message="Price of Tiger Sky Tower for a 1BR?"))

    assert resp.grounded is False
    assert "don't have verified data" in resp.answer
    # zero invented figures
    assert not any(ch.isdigit() for ch in resp.answer)


# ---------------------------------------------------------------------------
# T8 — zero data anywhere: never styled with a "here's the data" framing,
# even if the model tries to hallucinate — the guardrail must catch it.
# ---------------------------------------------------------------------------
def test_t8_guardrail_catches_hallucinated_numbers_on_ungrounded_answer():
    with patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=("Yields here run AED 1,200 per sq ft.", False)):
        resp = chat.chat(chat.ChatRequest(message="Some question with no matching data"))

    # guardrail should have intercepted the fabricated-looking ungrounded
    # answer and replaced it with the honest fallback
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


# ---------------------------------------------------------------------------
# T15 — console/response cleanliness: no leaked internal errors
# ---------------------------------------------------------------------------
def test_t15_leaked_error_is_caught_by_guardrail():
    with patch.object(chat, "lookup_area_data", return_value={"area": "jvc"}), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=("Traceback (most recent call last): KeyError", True)):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))

    assert resp.grounded is False
    assert "Traceback" not in resp.answer


# ---------------------------------------------------------------------------
# Empty message handling (basic input validation, not in Section 8 but cheap)
# ---------------------------------------------------------------------------
def test_empty_message_rejected():
    from fastapi import HTTPException
    with pytest.raises(HTTPException):
        chat.chat(chat.ChatRequest(message="   "))

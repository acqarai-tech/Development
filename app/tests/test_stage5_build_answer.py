"""
Stage 5 standalone tests — build_answer()
===========================================
Tests ONLY the answer-building function, called directly with hand-built
fake data — no extract_entities() involved, no lookup_area_data() involved.
Proves Stage 5 is correct on its own.

Groq's real API is mocked. What's tested: does build_answer() correctly
short-circuit to the honest fallback when data is None, and does it call
Groq with the right prompt/data when data exists?
"""
from unittest.mock import patch, MagicMock

import chat


def _mock_groq_text_response(text: str):
    mock = MagicMock()
    mock.choices = [MagicMock(message=MagicMock(content=text))]
    return mock


# ---------------------------------------------------------------------------
# "Nothing found" case: data is None -> must short-circuit, never call Groq
# ---------------------------------------------------------------------------
def test_build_answer_no_data_returns_honest_fallback_without_calling_groq():
    with patch.object(chat.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = chat.build_answer(
            "Price of Tiger Sky Tower for a 1BR?",
            entities={"question_type": "project_price", "area": None, "bedrooms": 1, "budget": None},
            data=None,
        )

    assert grounded is False
    assert answer == chat.NO_DATA_FALLBACK
    mock_create.assert_not_called(), (
        "When data is None, build_answer() must never call the model at "
        "all — there is nothing real for it to answer with."
    )


# ---------------------------------------------------------------------------
# Normal case: real data -> Groq is called, grounded=True
# ---------------------------------------------------------------------------
def test_build_answer_with_data_calls_groq_and_returns_grounded():
    fake_data = {
        "area": "Jumeirah Village Circle (JVC)",
        "transaction_sample_size": 500,
        "avg_price_per_sqm": 16327,
        "avg_actual_worth": 1684639,
        "most_recent_transaction_date": "2026-07-13",
    }
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text_response(
                           "JVC shows strength: 16,327 AED/sqm average.")) as mock_create:
        answer, grounded = chat.build_answer(
            "Is JVC worth buying in 2026?",
            entities={"question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None},
            data=fake_data,
        )

    assert grounded is True
    assert "16,327" in answer
    mock_create.assert_called_once()
    # Confirm the real data actually made it into the prompt sent to Groq
    sent_prompt = mock_create.call_args.kwargs["messages"][0]["content"]
    assert "16327" in sent_prompt
    assert "1684639" in sent_prompt


# ---------------------------------------------------------------------------
# Primary model fails -> falls back to FALLBACK_MODEL, still grounded
# ---------------------------------------------------------------------------
def test_build_answer_falls_back_when_primary_model_errors():
    fake_data = {
        "area": "Business Bay", "transaction_sample_size": 500,
        "avg_price_per_sqm": 25784, "avg_actual_worth": 3393809,
        "most_recent_transaction_date": "2026-08-03",
    }
    with patch.object(chat.groq_client.chat.completions, "create") as mock_create:
        mock_create.side_effect = [
            Exception("primary model timeout"),
            _mock_groq_text_response("Business Bay shows strength."),
        ]
        answer, grounded = chat.build_answer(
            "How is Business Bay performing?",
            entities={"question_type": "area_report", "area": "Business Bay", "bedrooms": None, "budget": None},
            data=fake_data,
        )

    assert grounded is True
    assert answer == "Business Bay shows strength."
    assert mock_create.call_count == 2


# ---------------------------------------------------------------------------
# Regression guard: the real bedroom-size fabrication bug (T17). This test
# doesn't call the real model (that's non-deterministic) — it checks that
# the PROMPT itself explicitly forbids the exact behavior that was observed
# live, so a future prompt edit can't silently drop this instruction again.
# ---------------------------------------------------------------------------
def test_build_answer_prompt_explicitly_forbids_unit_size_guessing():
    assert "must NOT assume" in chat.ANSWER_WITH_DATA_PROMPT
    assert "bedroom" in chat.ANSWER_WITH_DATA_PROMPT.lower()
    assert "avg_price_per_sqm" in chat.ANSWER_WITH_DATA_PROMPT


# ---------------------------------------------------------------------------
# Regression guard: the real Downtown/Burj Khalifa confusion bug. Same
# approach — check the prompt still contains the instruction, so it can't
# silently regress if the prompt is edited again later.
# ---------------------------------------------------------------------------
def test_build_answer_prompt_explicitly_forbids_naming_mismatch_confusion():
    normalized = " ".join(chat.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "burj khalifa" in normalized
    assert "do not call it out as a mismatch" in normalized

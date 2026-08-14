"""
Stage 5 tests — Stage 2 and Stage 4 already passed on their own. This file
tests ONLY build_answer(), with hand-built fake data, no dependency on
extract_entities() or lookup_area_data().
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

import stage5_build_answer as stage5


def _mock_groq_text(text):
    mock = MagicMock()
    mock.choices = [MagicMock(message=MagicMock(content=text))]
    return mock


def test_no_data_returns_fallback_without_calling_groq():
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "Price of Tiger Sky Tower for a 1BR?",
            entities={"question_type": "project_price", "area": None},
            data=None,
        )
    assert grounded is False
    assert answer == stage5.NO_DATA_FALLBACK
    mock_create.assert_not_called()


def test_with_data_calls_groq_and_returns_grounded():
    fake_data = {
        "area": "Jumeirah Village Circle (JVC)", "transaction_sample_size": 500,
        "avg_price_per_sqm": 16327, "avg_actual_worth": 1684639,
        "most_recent_transaction_date": "2026-07-13",
    }
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text("JVC shows strength: 16,327 AED/sqm.")) as mock_create:
        answer, grounded = stage5.build_answer(
            "Is JVC worth buying?",
            entities={"question_type": "area_report", "area": "JVC"},
            data=fake_data,
        )
    assert grounded is True
    assert "16,327" in answer
    sent_prompt = mock_create.call_args.kwargs["messages"][0]["content"]
    assert "16327" in sent_prompt


def test_falls_back_when_primary_model_errors():
    fake_data = {"area": "Business Bay", "transaction_sample_size": 500,
                 "avg_price_per_sqm": 25784, "avg_actual_worth": 3393809,
                 "most_recent_transaction_date": "2026-08-03"}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        mock_create.side_effect = [Exception("timeout"), _mock_groq_text("Business Bay is strong.")]
        answer, grounded = stage5.build_answer(
            "How is Business Bay performing?",
            entities={"question_type": "area_report", "area": "Business Bay"},
            data=fake_data,
        )
    assert grounded is True
    assert mock_create.call_count == 2


def test_prompt_forbids_unit_size_guessing():
    """Regression guard for the real bedroom-size fabrication bug."""
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "do not assume a typical size and multiply it" in normalized
    assert "area-wide average" in normalized


def test_prompt_forbids_naming_mismatch_confusion():
    """Regression guard for the real Downtown/Burj Khalifa confusion bug."""
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "burj khalifa" in normalized
    assert "do not flag it as a mismatch" in normalized


def test_prompt_does_not_falsely_claim_no_bedroom_data_exists():
    """Regression guard for a SEPARATE, more serious bug: an earlier
    version of this prompt flatly lied that Acqar's database has no
    bedroom/size breakdown at all. Confirmed live via direct Supabase
    inspection that it DOES (rooms_en, procedure_area columns, real per-
    transaction data). The prompt must not make that blanket false claim
    again — it should defer to what's actually in the data each time."""
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "no breakdown by bedroom count, unit size, or unit type" not in normalized, (
        "This is the exact false claim that was found and corrected — "
        "the prompt must not reintroduce it."
    )
    assert "look at the data itself to see what it actually contains" in normalized

"""
Stage 2 tests — run BEFORE Stage 4 or Stage 5 are written.
Per habit #1: get these passing before writing the next stage.
"""
import json
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

import stage2_extract_entities as stage2


def _mock_groq_response(payload):
    mock = MagicMock()
    mock.choices = [MagicMock(message=MagicMock(content=json.dumps(payload)))]
    return mock


def test_normal_case_known_area():
    fake_output = {"question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Is JVC worth buying in 2026?")
    assert result["area"] == "JVC"
    assert result["question_type"] == "area_report"


def test_no_area_mentioned():
    fake_output = {"question_type": "legal_or_general", "area": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What are the legal steps to buy off-plan?")
    assert result["area"] is None


def test_project_without_area_does_not_guess_area():
    """The exact bug from Section 4, issue #1 — a project name given, no
    area — must NOT have an area guessed or carried over from anywhere."""
    fake_output = {"question_type": "project_price", "area": None,
                    "project": "Tiger Sky Tower", "bedrooms": 1}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Price of Tiger Sky Tower for a 1BR?")
    assert result["area"] is None
    assert result["project"] == "Tiger Sky Tower"


def test_missing_keys_default_safely():
    incomplete_output = {"area": "Business Bay"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(incomplete_output)):
        result = stage2.extract_entities("Tell me about Business Bay")
    assert result["area"] == "Business Bay"
    assert result["question_type"] == "legal_or_general"
    assert result["project"] is None
    assert result["developer"] is None


def test_falls_back_when_primary_model_errors():
    fake_output = {"question_type": "area_report", "area": "Palm Jumeirah"}
    with patch.object(stage2.groq_client.chat.completions, "create") as mock_create:
        mock_create.side_effect = [Exception("timeout"), _mock_groq_response(fake_output)]
        result = stage2.extract_entities("How's Palm Jumeirah?")
    assert result["area"] == "Palm Jumeirah"
    assert mock_create.call_count == 2


def test_is_followup_always_false():
    """Section 5.2: is_followup belongs to Stage 3, which doesn't exist
    yet — Stage 2 must never report anything but False."""
    fake_output = {"question_type": "area_report", "area": "JVC", "is_followup": True}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What about JVC?")
    assert result["is_followup"] is False


# ---------------------------------------------------------------------------
# NEW: wants_transaction_list detection
# ---------------------------------------------------------------------------
def test_wants_transaction_list_true_for_explicit_request():
    fake_output = {"question_type": "area_report", "area": "JVC",
                    "wants_transaction_list": True, "transaction_count": 10}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Show me the last 10 sales in JVC")
    assert result["wants_transaction_list"] is True
    assert result["transaction_count"] == 10


def test_wants_transaction_list_false_for_general_question():
    fake_output = {"question_type": "area_report", "area": "JVC",
                    "wants_transaction_list": False, "transaction_count": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Is JVC worth buying in 2026?")
    assert result["wants_transaction_list"] is False
    assert result["transaction_count"] is None


def test_wants_transaction_list_defaults_false_when_missing():
    fake_output = {"question_type": "area_report", "area": "JVC"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Tell me about JVC")
    assert result["wants_transaction_list"] is False
    assert result["transaction_count"] is None


# ---------------------------------------------------------------------------
# NEW: regression guard for the real DAMAC Island -> DAMAC Lagoons bug
# ---------------------------------------------------------------------------
def test_prompt_explicitly_forbids_similar_area_substitution():
    """
    Confirmed live: asking about "damac island" returned entities.area =
    "DAMAC Lagoons" — a DIFFERENT real area silently substituted by the AI.
    This is a prompt-content regression guard, not a live-AI-behavior test
    (that can't be made fully deterministic) — it checks the instruction
    forbidding this exact failure mode is still present in the prompt.
    """
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert "own words" in normalized
    assert "damac island" in normalized
    assert "damac lagoons" in normalized
    assert "never substitute" in normalized


def test_area_is_preserved_verbatim_not_substituted():
    """If the AI correctly follows the anti-substitution rule, it should
    return the investor's own wording, not a different real area name."""
    fake_output = {"question_type": "area_report", "area": "damac island",
                    "developer": "DAMAC", "wants_transaction_list": True}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("tell me the transactions of damac island")

    assert result["area"] == "damac island"
    assert result["area"] != "DAMAC Lagoons", (
        "This is the exact real bug — a similar-sounding but wrong real "
        "area must never be silently substituted."
    )

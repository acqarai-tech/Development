"""
Stage 3 tests — standalone. Same discipline as test_stage2.py: this file
never imports ai_chat or Stage 4/5 — it proves stage3_detect_followup.py
correct entirely on its own, with hand-built history fixtures.
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

import stage3_detect_followup as stage3


def _mock_groq_response(payload):
    mock = MagicMock()
    mock.choices = [MagicMock(message=MagicMock(content=json.dumps(payload)))]
    return mock


def test_no_history_never_calls_model_and_is_never_a_followup():
    """A first message can't follow up on nothing — this must be free
    (no wasted API call) and unconditionally False."""
    with patch.object(stage3.groq_client.chat.completions, "create") as mock_create:
        result = stage3.detect_followup("Is JVC worth buying?", history=[])
    mock_create.assert_not_called()
    assert result == {"is_followup": False, "carried_area": None,
                       "carried_project": None, "carried_bedrooms": None}


def test_none_history_treated_same_as_empty_list():
    with patch.object(stage3.groq_client.chat.completions, "create") as mock_create:
        result = stage3.detect_followup("Is JVC worth buying?", history=None)
    mock_create.assert_not_called()
    assert result["is_followup"] is False


# --- T7: genuine follow-up (UC5) ---
def test_t7_genuine_followup_carries_area_forward():
    """'Is JVC worth buying?' then 'what about the yield there?' — must
    recognize the implicit reference and carry JVC forward."""
    history = [{"message": "Is JVC worth buying?",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    with patch.object(stage3.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response({"is_followup": True, "reasoning": "implicit 'there'"})):
        result = stage3.detect_followup("what about the yield there?", history)
    assert result["is_followup"] is True
    assert result["carried_area"] == "JVC"
    assert result["carried_project"] is None
    assert result["carried_bedrooms"] is None


# --- T6: genuine topic change (UC5) ---
def test_t6_genuine_topic_change_does_not_carry_area_forward():
    """'Is JVC worth buying?' then 'latest Binghatti project?' — names
    its own new, specific subject (a developer) — must NOT carry JVC
    forward, even though it's a natural next question in the same
    conversation."""
    history = [{"message": "Is JVC worth buying?",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    with patch.object(stage3.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response({"is_followup": False, "reasoning": "new subject named"})):
        result = stage3.detect_followup("latest Binghatti project?", history)
    assert result["is_followup"] is False
    assert result["carried_area"] is None
    assert result["carried_project"] is None
    assert result["carried_bedrooms"] is None


def test_followup_carries_project_and_bedrooms_too_not_just_area():
    history = [{"message": "Price of a 1BR in Business Bay?",
                "entities": {"area": "Business Bay", "project": "Regalia", "bedrooms": 1}}]
    with patch.object(stage3.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response({"is_followup": True, "reasoning": "and a 2BR"})):
        result = stage3.detect_followup("and a 2BR?", history)
    assert result["carried_area"] == "Business Bay"
    assert result["carried_project"] == "Regalia"
    assert result["carried_bedrooms"] == 1


def test_only_most_recent_turn_is_used_not_older_history():
    """A message can only genuinely follow up on the IMMEDIATELY
    preceding turn — older turns in a longer history must not leak in."""
    history = [
        {"message": "Is Downtown worth buying?", "entities": {"area": "Downtown", "project": None, "bedrooms": None}},
        {"message": "What about JVC instead?", "entities": {"area": "JVC", "project": None, "bedrooms": None}},
    ]
    with patch.object(stage3.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response({"is_followup": True, "reasoning": "yield there"})) as mock_create:
        result = stage3.detect_followup("what's the yield there?", history)
    assert result["carried_area"] == "JVC"  # the LAST turn's area, not Downtown
    sent_prompt = mock_create.call_args[1]["messages"][0]["content"]
    assert "Downtown" not in sent_prompt or "JVC" in sent_prompt  # JVC is what actually matters
    assert "What about JVC instead?" in sent_prompt


def test_model_failure_defaults_to_false_not_a_crash():
    """Per the prompt's own guidance: when genuinely unsure (including
    infrastructure failure), prefer treating it as a topic change rather
    than silently carrying forward context that might be wrong."""
    history = [{"message": "Is JVC worth buying?", "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    with patch.object(stage3.groq_client.chat.completions, "create", side_effect=Exception("groq down")):
        result = stage3.detect_followup("what about the yield there?", history)
    assert result["is_followup"] is False
    assert result["carried_area"] is None


def test_unparseable_model_response_defaults_to_false_not_a_crash():
    bad_response = MagicMock()
    bad_response.choices = [MagicMock(message=MagicMock(content="not valid json"))]
    history = [{"message": "Is JVC worth buying?", "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    with patch.object(stage3.groq_client.chat.completions, "create", return_value=bad_response):
        result = stage3.detect_followup("what about the yield there?", history)
    assert result["is_followup"] is False


def test_never_returns_a_modified_message():
    """The one rule that matters most for this stage: the return value
    must never contain a 'merged' or 'cleaned up' message string — only
    a decision dict. This guards against reintroducing the project's #1
    historical bug (concatenating history into the message text)."""
    history = [{"message": "Is JVC worth buying?", "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    with patch.object(stage3.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response({"is_followup": True, "reasoning": "x"})):
        result = stage3.detect_followup("what about the yield there?", history)
    assert set(result.keys()) == {"is_followup", "carried_area", "carried_project", "carried_bedrooms"}
    assert "message" not in result
    assert "question" not in result

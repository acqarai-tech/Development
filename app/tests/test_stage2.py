"""
Stage 2 tests — new fields only (list_areas, area_properties, wants_trend).
Follows the same mocking pattern as the existing test_stage2.py.
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


def test_list_areas_needs_no_entities():
    fake_output = {"question_type": "list_areas", "area": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What areas do you have data on?")
    assert result["question_type"] == "list_areas"
    assert result["area"] is None


def test_area_properties_extracts_area_like_area_report():
    fake_output = {"question_type": "area_properties", "area": "Dubai Hills Estate"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What properties are in Dubai Hills Estate?")
    assert result["question_type"] == "area_properties"
    assert result["area"] == "Dubai Hills Estate"


def test_area_properties_never_guesses_area_when_absent():
    """Same rule as area_report — an area_properties question with no
    area named must not have one guessed."""
    fake_output = {"question_type": "area_properties", "area": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What properties do you have?")
    assert result["area"] is None


def test_wants_trend_true_for_explicit_trend_question():
    fake_output = {"question_type": "area_report", "area": "JVC", "wants_trend": True}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("How has JVC trended over the past few years?")
    assert result["wants_trend"] is True
    assert result["question_type"] == "area_report"


def test_wants_trend_false_for_plain_snapshot_question():
    fake_output = {"question_type": "area_report", "area": "JVC", "wants_trend": False}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Is JVC worth buying right now?")
    assert result["wants_trend"] is False


def test_wants_trend_defaults_false_when_missing():
    fake_output = {"question_type": "area_report", "area": "JVC"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Tell me about JVC")
    assert result["wants_trend"] is False

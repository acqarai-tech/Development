"""
Stage 2 standalone tests — extract_entities()
==============================================
Per Section 5.4, habit #7: "Build and verify one stage at a time." This
file tests ONLY extract_entities() — nothing about Supabase, nothing about
Groq's answer-writing call, nothing about the /chat route. If these tests
pass, Stage 2 is proven correct on its own, before Stage 4 or Stage 5 ever
get involved.

extract_entities() calls the real Groq API — these tests mock that call so
they run offline and don't cost real API usage. What's being tested here
is: given a specific Groq response, does extract_entities() parse and
default it correctly? (Whether Groq itself extracts well is a separate,
non-automatable question — see Section 9.1's manual spot-check.)
"""
import json
from unittest.mock import patch, MagicMock

import chat


def _mock_groq_response(payload: dict):
    """Builds a fake Groq completion object shaped like the real SDK response."""
    mock = MagicMock()
    mock.choices = [MagicMock(message=MagicMock(content=json.dumps(payload)))]
    return mock


# ---------------------------------------------------------------------------
# Normal case: a clear, well-formed question
# ---------------------------------------------------------------------------
def test_extract_entities_normal_case_known_area():
    fake_groq_output = {
        "question_type": "area_report",
        "area": "JVC",
        "bedrooms": None,
        "budget": None,
    }
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_groq_output)):
        result = chat.extract_entities("Is JVC worth buying in 2026?")

    assert result["question_type"] == "area_report"
    assert result["area"] == "JVC"
    assert result["bedrooms"] is None
    assert result["budget"] is None


# ---------------------------------------------------------------------------
# "Nothing found" case: no area at all in the question
# ---------------------------------------------------------------------------
def test_extract_entities_no_area_mentioned():
    fake_groq_output = {
        "question_type": "legal_or_general",
        "area": None,
        "bedrooms": None,
        "budget": None,
    }
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_groq_output)):
        result = chat.extract_entities("What are the legal steps to buy off-plan?")

    assert result["area"] is None
    assert result["question_type"] == "legal_or_general"


# ---------------------------------------------------------------------------
# Edge case that broke the OLD system (Section 4, issue #1): a project name
# is mentioned but no area — must NOT reuse or guess an old/unrelated area.
# ---------------------------------------------------------------------------
def test_extract_entities_project_without_area_does_not_guess_area():
    fake_groq_output = {
        "question_type": "project_price",
        "area": None,
        "bedrooms": 1,
        "budget": None,
    }
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_groq_output)):
        result = chat.extract_entities("Price of Tiger Sky Tower for a 1BR?")

    assert result["area"] is None, (
        "A project-only question must not have an area guessed or carried "
        "over — this is the exact class of bug from Section 4, issue #1."
    )
    assert result["bedrooms"] == 1


# ---------------------------------------------------------------------------
# Missing keys in Groq's response — defaults must fill in safely, not crash
# ---------------------------------------------------------------------------
def test_extract_entities_fills_missing_keys_with_defaults():
    # Simulates Groq returning a partial/malformed JSON object
    incomplete_output = {"area": "Business Bay"}
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(incomplete_output)):
        result = chat.extract_entities("Tell me about Business Bay")

    assert result["area"] == "Business Bay"
    assert result["question_type"] == "legal_or_general"  # safe default
    assert result["bedrooms"] is None
    assert result["budget"] is None


# ---------------------------------------------------------------------------
# Primary model fails -> falls back to FALLBACK_MODEL, doesn't crash
# ---------------------------------------------------------------------------
def test_extract_entities_falls_back_when_primary_model_errors():
    fake_groq_output = {
        "question_type": "area_report",
        "area": "Palm Jumeirah",
        "bedrooms": None,
        "budget": None,
    }
    with patch.object(chat.groq_client.chat.completions, "create") as mock_create:
        mock_create.side_effect = [
            Exception("primary model timeout"),
            _mock_groq_response(fake_groq_output),
        ]
        result = chat.extract_entities("How's Palm Jumeirah?")

    assert result["area"] == "Palm Jumeirah"
    assert mock_create.call_count == 2


# ---------------------------------------------------------------------------
# Section 5.2 target shape: project and developer fields extract correctly
# ---------------------------------------------------------------------------
def test_extract_entities_extracts_project_and_developer():
    fake_groq_output = {
        "question_type": "project_price",
        "area": None,
        "project": "Tiger Sky Tower",
        "developer": None,
        "bedrooms": 1,
        "budget": None,
    }
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_groq_output)):
        result = chat.extract_entities("Price of Tiger Sky Tower for a 1BR?")

    assert result["project"] == "Tiger Sky Tower"
    assert result["developer"] is None


def test_extract_entities_extracts_developer():
    fake_groq_output = {
        "question_type": "developer_lookup",
        "area": None,
        "project": None,
        "developer": "Binghatti",
        "bedrooms": None,
        "budget": None,
    }
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_groq_output)):
        result = chat.extract_entities("Latest Binghatti project?")

    assert result["developer"] == "Binghatti"
    assert result["project"] is None


# ---------------------------------------------------------------------------
# Missing project/developer keys in Groq's response default to None safely
# ---------------------------------------------------------------------------
def test_extract_entities_project_and_developer_default_to_none():
    fake_groq_output = {"question_type": "area_report", "area": "JVC"}
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_groq_output)):
        result = chat.extract_entities("Is JVC worth buying?")

    assert result["project"] is None
    assert result["developer"] is None


# ---------------------------------------------------------------------------
# Section 5.2: is_followup must NEVER be guessed by Stage 2 — it's always
# False here, regardless of what Groq returns, because Stage 3 (which
# actually decides this) doesn't exist yet in Beta v0.
# ---------------------------------------------------------------------------
def test_extract_entities_is_followup_always_false_even_if_model_says_otherwise():
    # Simulate a model that incorrectly tries to guess is_followup=True —
    # extract_entities() must override this, since that decision belongs
    # to Stage 3, not Stage 2.
    fake_groq_output = {
        "question_type": "area_report",
        "area": "JVC",
        "is_followup": True,  # the model should never be asked for this,
                               # but simulate it happening anyway
    }
    with patch.object(chat.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_groq_output)):
        result = chat.extract_entities("What about JVC?")

    assert result["is_followup"] is False, (
        "is_followup must always be False from Stage 2 alone — Section 5.2 "
        "is explicit that this is set in Stage 3, never guessed here. "
        "Stage 3 doesn't exist yet in Beta v0."
    )

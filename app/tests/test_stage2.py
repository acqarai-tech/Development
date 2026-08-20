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


# ===========================================================================
# Issue 1 fix: "area_projects" as its own question_type, distinct from
# "area_properties" — confirmed live these must route to different real
# data (avm's transacted projects vs. district_properties' directory)
# ===========================================================================
def test_area_projects_is_a_distinct_question_type_from_area_properties():
    fake_output = {"question_type": "area_projects", "area": "JVC"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("what projects are in JVC?")
    assert result["question_type"] == "area_projects"


def test_area_properties_still_works_for_buildings_directory_question():
    fake_output = {"question_type": "area_properties", "area": "Dubai Hills Estate"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("what buildings are in Dubai Hills Estate?")
    assert result["question_type"] == "area_properties"


def test_prompt_distinguishes_projects_from_properties():
    """Confirmed live bug: the OLD prompt literally said area_properties
    covers 'properties, buildings, OR PROJECTS' — this asserts that
    conflation is gone and area_projects is its own documented type."""
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert "area_projects" in normalized
    assert "buildings, or projects" not in normalized


# ===========================================================================
# Issue 2 fix: a project can be named with no area — must not be
# treated as invalid or forced to guess an area
# ===========================================================================
def test_project_alone_no_area_is_valid():
    fake_output = {"question_type": "project_price", "area": None, "project": "Binghatti Aquarise"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("tell me about Binghatti Aquarise")
    assert result["project"] == "Binghatti Aquarise"
    assert result["area"] is None


# ===========================================================================
# Issue 3 fix: never drop a trailing number from an area name
# (confirmed live: "Trade Center 1" was extracted as "Trade Center",
# silently merging it with a different real area, "Trade Center 2")
# ===========================================================================
def test_trailing_number_preserved_in_area_name():
    fake_output = {"question_type": "area_report", "area": "Trade Center 1"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("what's the price in trade center 1?")
    assert result["area"] == "Trade Center 1"
    assert result["area"] != "Trade Center"  # the confirmed live bug


def test_prompt_explicitly_forbids_dropping_trailing_numbers():
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert "never drop a trailing number" in normalized
    assert "trade center 1" in normalized  # the actual confirmed example is in the prompt


# ===========================================================================
# Beta v2 — genuine two-area comparison (T2) and developer lookup (T5)
# ===========================================================================
def test_area2_extracted_for_genuine_two_area_comparison():
    """T2: 'Dubai Hills Estate or Dubai Marina, long-term?' — BOTH areas
    must be captured, not just the first with the second silently
    dropped (the confirmed original limitation)."""
    fake_output = {"question_type": "comparison", "area": "Dubai Hills Estate", "area2": "Dubai Marina"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Dubai Hills Estate or Dubai Marina, long-term?")
    assert result["question_type"] == "comparison"
    assert result["area"] == "Dubai Hills Estate"
    assert result["area2"] == "Dubai Marina"


def test_area2_defaults_to_none_when_missing():
    fake_output = {"question_type": "area_report", "area": "JVC"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Is JVC worth buying?")
    assert result["area2"] is None


def test_area2_preserves_trailing_numbers_same_as_area():
    """The digit-preservation rule must apply equally to area2 — no
    reason a second area's real name should get mangled differently
    from the first."""
    fake_output = {"question_type": "comparison", "area": "Trade Center 1", "area2": "Trade Center 2"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Trade Center 1 or Trade Center 2, which is better?")
    assert result["area"] == "Trade Center 1"
    assert result["area2"] == "Trade Center 2"


def test_developer_lookup_extracts_developer_with_no_area_required():
    """T5: 'Latest Binghatti project?' — developer alone is a complete,
    valid extraction; an area must not be required or guessed."""
    fake_output = {"question_type": "developer_lookup", "developer": "Binghatti", "area": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Latest Binghatti project?")
    assert result["question_type"] == "developer_lookup"
    assert result["developer"] == "Binghatti"
    assert result["area"] is None


def test_prompt_covers_area2_and_developer_lookup_rules():
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert '"area2"' in normalized
    assert "developer_lookup" in normalized
    assert "dubai hills estate or dubai marina" in normalized


# ===========================================================================
# Confirmed live bug: "Dubai Hills Estate or Dubai Marina, long-term?"
# was extracted with area2 left null AND wants_trend incorrectly true —
# producing a single-area answer with a trend table instead of a real
# two-area comparison. Both fixed at the prompt level.
# ===========================================================================
def test_long_term_wording_does_not_trigger_wants_trend():
    """'long-term' describes investment horizon, not historical price
    movement — must never be confused with a real trend request."""
    fake_output = {"question_type": "comparison", "area": "Dubai Hills Estate",
                    "area2": "Dubai Marina", "wants_trend": False}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Dubai Hills Estate or Dubai Marina, long-term?")
    assert result["wants_trend"] is False


def test_comparison_with_or_extracts_both_areas_even_with_long_term():
    """The exact confirmed live failure: area2 was left null for this
    literal phrasing despite it being the prompt's own worked example."""
    fake_output = {"question_type": "comparison", "area": "Dubai Hills Estate",
                    "area2": "Dubai Marina", "wants_trend": False}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Dubai Hills Estate or Dubai Marina, long-term?")
    assert result["area"] == "Dubai Hills Estate"
    assert result["area2"] == "Dubai Marina"
    assert result["question_type"] == "comparison"


def test_prompt_explicitly_distinguishes_long_term_from_trend():
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert "investment horizon language, not a trend request" in normalized
    assert "confirmed live failure mode" in normalized


# ===========================================================================
# budget_recommendation — closes the confirmed-live bug: "I have AED
# 600,000. Which areas should I consider?" had no question_type of its
# own, so it fell through to market_overview and returned the citywide
# average price instead of areas the budget could actually reach.
# ===========================================================================
def test_budget_recommendation_extracts_budget_with_no_area():
    fake_output = {"question_type": "budget_recommendation", "budget": 600000, "area": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("I have AED 600,000. Which areas should I consider?")
    assert result["question_type"] == "budget_recommendation"
    assert result["budget"] == 600000
    assert result["area"] is None


def test_budget_recommendation_parses_shorthand_and_word_forms():
    """'800k' and 'AED 1.2 million' style phrasings must both resolve to
    a plain number — the model's job per the prompt's own rule, this
    test just confirms the plumbing carries whatever it returns through
    untouched, no double-parsing or truncation in Python."""
    for question, budget in [
        ("What areas can I afford with AED 800,000?", 800000),
        ("Which Dubai areas have properties under AED 1M?", 1000000),
        ("Where can I invest AED 500k?", 500000),
    ]:
        fake_output = {"question_type": "budget_recommendation", "budget": budget, "area": None}
        with patch.object(stage2.groq_client.chat.completions, "create",
                           return_value=_mock_groq_response(fake_output)):
            result = stage2.extract_entities(question)
        assert result["budget"] == budget
        assert result["area"] is None


def test_budget_recommendation_missing_budget_key_still_defaults_safely():
    """If the model somehow omits 'budget' entirely, entities.setdefault
    must still leave it as None rather than crashing — same defensive
    pattern already relied on for every other optional field."""
    fake_output = {"question_type": "budget_recommendation", "area": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Where can I invest?")
    assert result["budget"] is None


def test_named_area_plus_budget_is_not_budget_recommendation_per_prompt():
    """Disambiguation rule, confirmed correct at the prompt-design level
    (behavior itself depends on the live model, verified separately):
    naming a specific area alongside a budget ('is JVC affordable for
    600k?') must stay area_report/roi for that area, never get swept
    into budget_recommendation, which is only for a budget with NO area
    named. This test locks the prompt's own documented rule in place so
    a future edit can't silently drop it."""
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert "this type is only for a budget with no area named" in normalized


def test_budget_recommendation_in_question_type_schema():
    """Locks the enum itself — a future prompt edit that accidentally
    drops the new type from the schema line would otherwise fail
    silently (the model just never outputs it)."""
    assert '"budget_recommendation"' in stage2.ENTITY_EXTRACTION_PROMPT


def test_prompt_covers_informal_and_past_tense_buying_intent():
    """Locks the confirmed-live fix in place: 'I wanted to buy 1 BR in
    JVC' was previously missed (user_type came back null -> investor)
    because only the exact 'I'm buying' phrasing was matched. A future
    prompt edit that silently narrows this back down would otherwise
    fail silently (the model just stops catching it again)."""
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert "i wanted to buy" in normalized
    assert "confirmed live failure mode" in normalized
    assert "the same intent-based test now applies to every signal below too" in normalized


def test_prompt_covers_intent_based_matching_for_every_user_type():
    """Extends the buyer fix to all five signals, per explicit request:
    a prompt that only matches one literal phrasing per type will keep
    missing real investors who say the same thing differently, the same
    way buyer did. Locks the broadened wording in place so a future
    edit can't silently narrow any one of the five back down."""
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())

    # The shared intent-based framing must exist, not just be a one-off
    # fix on the buyer line.
    assert "for every type below, the test is intent" in normalized
    assert "the same intent-based test now applies to every signal below too" in normalized

    # Each type's broadened phrasing coverage, spot-checked.
    assert '"i sold,"' in normalized                       # seller, past tense
    assert '"i wanted to buy,"' in normalized               # buyer, confirmed live fix
    assert '"i rent,"' in normalized                        # tenant, informal
    assert '"i\'m an agent,"' in normalized                 # broker, informal
    assert '"we\'re building,"' in normalized               # developer, informal

    # The tenant/investor carve-out (yield & ROI stay investor) must
    # survive the rewrite word-for-word in meaning, not just be dropped.
    assert "that's investor territory even if it mentions rent" in normalized


# ===========================================================================
# Gap-closing additions: project2 (developer comparison), asking_price
# (buyer), rent_amount (tenant) — see doc §3.4 coverage audit.
# ===========================================================================
def test_project2_extracted_for_project_vs_project_comparison():
    fake_output = {
        "question_type": "comparison", "project": "Binghatti Aquarise",
        "project2": "Sobha Hartland", "area": None, "area2": None,
    }
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("How's Binghatti Aquarise doing against Sobha Hartland?")
    assert result["project"] == "Binghatti Aquarise"
    assert result["project2"] == "Sobha Hartland"


def test_project2_defaults_to_none_when_missing():
    fake_output = {"question_type": "area_report", "area": "JVC"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What's the price in JVC?")
    assert result["project2"] is None


def test_asking_price_extracted_for_buyer_question():
    fake_output = {"question_type": "area_report", "area": "JVC", "asking_price": 1400000,
                    "user_type": "buyer"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Is 1.4M fair for a 1BR in JVC?")
    assert result["asking_price"] == 1400000


def test_asking_price_defaults_to_none_when_missing():
    fake_output = {"question_type": "area_report", "area": "JVC"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What's the average price in JVC?")
    assert result["asking_price"] is None


def test_rent_amount_extracted_for_tenant_question():
    fake_output = {"question_type": "area_report", "area": "JVC", "rent_amount": 65000,
                    "user_type": "tenant"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("Is 65k a fair rent for my JVC apartment?")
    assert result["rent_amount"] == 65000


def test_rent_amount_defaults_to_none_when_missing():
    fake_output = {"question_type": "roi", "area": "JVC"}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What's the rental yield in JVC?")
    assert result["rent_amount"] is None


def test_prompt_covers_project_vs_project_comparison():
    """Locks the developer-comparison rule in place — a future edit
    that silently drops project2 coverage would otherwise fail
    silently (the model just stops extracting it)."""
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert '"project2"' in normalized
    assert "project-vs-project comparison" in normalized


def test_prompt_covers_asking_price_and_rent_amount_rules():
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert '"asking_price"' in normalized
    assert '"rent_amount"' in normalized
    # The explicit "don't set this for a general question" carve-outs
    # must survive — these are what prevent asking_price/rent_amount
    # from being fabricated on ordinary average-price questions.
    assert "there's no specific unit being evaluated" in normalized
    assert "no rent_amount" in normalized


# ===========================================================================
# service_charges — closes the highest-value coverage-audit finding.
# ===========================================================================
def test_service_charges_extracted_with_named_project():
    fake_output = {"question_type": "service_charges", "project": "Tenora", "area": None}
    with patch.object(stage2.groq_client.chat.completions, "create",
                       return_value=_mock_groq_response(fake_output)):
        result = stage2.extract_entities("What are the service charges in Tenora?")
    assert result["question_type"] == "service_charges"
    assert result["project"] == "Tenora"


def test_prompt_requires_named_project_for_service_charges():
    """Locks the disambiguation rule in place: a service-charge question
    with NO project named should stay legal_or_general, not this type —
    charges are set per building, never at a bare area level."""
    normalized = " ".join(stage2.ENTITY_EXTRACTION_PROMPT.lower().split())
    assert '"service_charges"' in normalized
    assert "service charges are set per building" in normalized
    assert "should stay \"legal_or_general\"" in normalized

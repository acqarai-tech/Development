"""
test_stage_guided.py — unit tests for stage_guided.py, isolated from the
wiring layer (see test_wiring.py's guided-mode section for the
integration-level tests: offer -> continue -> finalize through chat()).
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("SUPABASE_URL_CHAT", "https://example.supabase.co")
os.environ.setdefault(
    "SUPABASE_SERVICE_ROLE_KEY_CHAT",
    "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9."
    "eyJyb2xlIjogInNlcnZpY2Vfcm9sZSIsICJpc3MiOiAic3VwYWJhc2UtZGVtbyJ9."
    "fakesignature",
)

import stage_guided as guided


# ---------------------------------------------------------------------------
# is_vague_first_turn
# ---------------------------------------------------------------------------
def test_vague_first_turn_true_when_no_anchor_and_no_history():
    entities = {"question_type": "legal_or_general", "area": None, "project": None,
                "developer": None, "broker": None, "valuator": None, "budget": None}
    assert guided.is_vague_first_turn(entities, has_history=False) is True


def test_not_vague_when_history_present():
    entities = {"question_type": "legal_or_general", "area": None, "project": None,
                "developer": None, "broker": None, "valuator": None, "budget": None}
    assert guided.is_vague_first_turn(entities, has_history=True) is False


def test_not_vague_when_area_present():
    entities = {"question_type": "area_report", "area": "JVC", "project": None,
                "developer": None, "broker": None, "valuator": None, "budget": None}
    assert guided.is_vague_first_turn(entities, has_history=False) is False


def test_not_vague_when_budget_present():
    entities = {"question_type": "budget_recommendation", "area": None, "project": None,
                "developer": None, "broker": None, "valuator": None, "budget": 1200000}
    assert guided.is_vague_first_turn(entities, has_history=False) is False


def test_not_vague_for_self_sufficient_question_types():
    # list_areas/top_*_ranking/market_overview already give a real, useful
    # answer with zero entities today — guided mode must not interrupt them.
    for qt in ("list_areas", "top_areas_ranking", "top_projects_ranking",
               "top_developers_ranking", "market_overview"):
        entities = {"question_type": qt, "area": None, "project": None,
                    "developer": None, "broker": None, "valuator": None, "budget": None}
        assert guided.is_vague_first_turn(entities, has_history=False) is False, qt


# ---------------------------------------------------------------------------
# should_offer_after_grounded_answer — companion to is_vague_first_turn,
# for when Stage 2's non-deterministic classification picked a
# self-sufficient type (real grounded answer) instead of dead-ending on
# the exact same anchorless first message.
# ---------------------------------------------------------------------------
def test_should_offer_after_grounded_answer_true_for_anchorless_market_overview():
    entities = {"question_type": "market_overview", "area": None, "project": None,
                "developer": None, "broker": None, "valuator": None, "budget": None}
    assert guided.should_offer_after_grounded_answer(entities, has_history=False) is True


def test_should_offer_after_grounded_answer_false_when_history_present():
    entities = {"question_type": "market_overview", "area": None, "project": None,
                "developer": None, "broker": None, "valuator": None, "budget": None}
    assert guided.should_offer_after_grounded_answer(entities, has_history=True) is False


def test_should_offer_after_grounded_answer_false_for_non_self_sufficient_type():
    entities = {"question_type": "area_report", "area": None, "project": None,
                "developer": None, "broker": None, "valuator": None, "budget": None}
    assert guided.should_offer_after_grounded_answer(entities, has_history=False) is False


def test_should_offer_after_grounded_answer_false_when_area_was_named():
    entities = {"question_type": "top_areas_ranking", "area": "JVC", "project": None,
                "developer": None, "broker": None, "valuator": None, "budget": None}
    assert guided.should_offer_after_grounded_answer(entities, has_history=False) is False


# ---------------------------------------------------------------------------
# continue_guided_flow — escape hatch
# ---------------------------------------------------------------------------
def test_escape_hatch_aborts_when_real_area_named_mid_wizard():
    prior = {"active": True, "step": "budget", "collected": {"goal": "yield"}}
    current_entities = {"area": "Dubai Marina", "project": None, "developer": None,
                         "broker": None, "valuator": None}
    result = guided.continue_guided_flow("actually tell me about Dubai Marina", prior, current_entities)
    assert result["action"] == "abort"


def test_escape_hatch_aborts_when_real_project_named_mid_wizard():
    prior = {"active": True, "step": "area", "collected": {"goal": "yield", "budget": 1000000}}
    current_entities = {"area": None, "project": "Binghatti Aquarise", "developer": None,
                         "broker": None, "valuator": None}
    result = guided.continue_guided_flow("what about Binghatti Aquarise", prior, current_entities)
    assert result["action"] == "abort"


def test_area_step_answered_with_a_real_area_name_is_a_slot_answer_not_an_interruption():
    """CONFIRMED BUG, fixed: the area step's own expected answer (a real
    area name) must never trip the escape hatch meant for a genuinely
    different question — a bare area name is not a full question."""
    prior = {"active": True, "step": "area", "collected": {"goal": "yield", "budget": 1200000}}
    current_entities = {"area": "JVC", "project": None, "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("JVC", prior, current_entities)
    assert result["action"] == "continue"
    assert result["guided_state"]["collected"]["area"] == "JVC"
    assert result["guided_state"]["step"] == "bedrooms"


def test_area_step_answered_with_a_full_question_still_aborts():
    """The same area value, but phrased as a real question, must still
    be treated as a genuine topic change, not a slot answer."""
    prior = {"active": True, "step": "area", "collected": {"goal": "yield", "budget": 1200000}}
    current_entities = {"area": "JVC", "project": None, "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("what's the price trend in JVC?", prior, current_entities)
    assert result["action"] == "abort"


def test_budget_step_also_harvests_area_when_volunteered_early_and_skips_area_step():
    prior = {"active": True, "step": "budget", "collected": {"goal": "yield"}}
    current_entities = {"budget": 1200000, "area": "JVC", "project": None,
                         "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("1.2 million, somewhere in JVC", prior, current_entities)
    assert result["action"] == "continue"
    assert result["guided_state"]["collected"]["budget"] == 1200000
    assert result["guided_state"]["collected"]["area"] == "JVC"
    # area is already known -> the area step is skipped entirely
    assert result["guided_state"]["step"] == "bedrooms"


def test_area_step_can_revise_an_earlier_budget_answer():
    prior = {"active": True, "step": "area", "collected": {"goal": "yield", "budget": 1000000}}
    current_entities = {"budget": 2000000, "area": None, "project": None,
                         "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("actually make it 2 million", prior, current_entities)
    assert result["guided_state"]["collected"]["budget"] == 2000000
    # area still unanswered by this message -> recorded None, not skipped
    assert result["guided_state"]["collected"]["area"] is None
    assert result["guided_state"]["step"] == "bedrooms"


def test_cancel_word_ends_wizard():
    prior = {"active": True, "step": "goal", "collected": {}}
    current_entities = {"area": None, "project": None, "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("cancel", prior, current_entities)
    assert result["action"] == "cancelled"


# ---------------------------------------------------------------------------
# continue_guided_flow — step progression
# ---------------------------------------------------------------------------
def test_goal_step_classifies_yield():
    prior = {"active": True, "step": "goal", "collected": {}}
    current_entities = {}
    result = guided.continue_guided_flow("mainly rental income", prior, current_entities)
    assert result["action"] == "continue"
    assert result["guided_state"]["step"] == "budget"
    assert result["guided_state"]["collected"]["goal"] == "yield"


def test_goal_step_classifies_appreciation():
    prior = {"active": True, "step": "goal", "collected": {}}
    result = guided.continue_guided_flow("long-term capital growth", prior, {})
    assert result["guided_state"]["collected"]["goal"] == "appreciation"


def test_goal_step_skip_word_is_unsure():
    prior = {"active": True, "step": "goal", "collected": {}}
    result = guided.continue_guided_flow("not sure", prior, {})
    assert result["guided_state"]["collected"]["goal"] == "unsure"


def test_budget_step_reads_from_current_entities_no_new_extraction_call():
    """Budget/area/bedrooms steps must read Stage 2's ALREADY-COMPUTED
    entities for this message, never call extract_entities again — this
    is what keeps guided mode from adding a new Groq call per turn."""
    prior = {"active": True, "step": "budget", "collected": {"goal": "yield"}}
    current_entities = {"budget": 1200000, "area": None, "project": None,
                         "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("around 1.2 million AED", prior, current_entities)
    assert result["action"] == "continue"
    assert result["guided_state"]["step"] == "area"
    assert result["guided_state"]["collected"]["budget"] == 1200000


def test_budget_step_skip_leaves_budget_none():
    prior = {"active": True, "step": "budget", "collected": {"goal": "yield"}}
    current_entities = {"budget": None, "area": None, "project": None,
                         "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("skip", prior, current_entities)
    assert result["guided_state"]["collected"]["budget"] is None


def test_area_step_recommend_for_me_leaves_area_none():
    prior = {"active": True, "step": "area", "collected": {"goal": "yield", "budget": 1200000}}
    current_entities = {"area": None, "project": None, "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("recommend one for me", prior, current_entities)
    assert result["guided_state"]["collected"]["area"] is None
    assert result["guided_state"]["step"] == "bedrooms"


def test_bedrooms_step_finalizes_wizard():
    prior = {"active": True, "step": "bedrooms",
             "collected": {"goal": "yield", "budget": 1200000, "area": "JVC"}}
    current_entities = {"bedrooms": 2, "area": None, "project": None,
                         "developer": None, "broker": None, "valuator": None}
    result = guided.continue_guided_flow("2 bedroom", prior, current_entities)
    assert result["action"] == "finalize"
    assert result["entities"]["bedrooms"] == 2


# ---------------------------------------------------------------------------
# _finalize / question_type selection — the hand-off contract with the
# real Stage 4/5 pipeline
# ---------------------------------------------------------------------------
def test_finalize_with_area_and_yield_goal_routes_to_roi():
    result = guided._finalize({"goal": "yield", "budget": 1200000, "area": "JVC", "bedrooms": None})
    assert result["entities"]["question_type"] == "roi"
    assert result["entities"]["area"] == "JVC"
    assert result["entities"]["wants_trend"] is True


def test_finalize_with_area_and_appreciation_goal_routes_to_area_report():
    result = guided._finalize({"goal": "appreciation", "budget": None, "area": "Dubai Marina", "bedrooms": None})
    assert result["entities"]["question_type"] == "area_report"


def test_finalize_with_budget_no_area_routes_to_budget_recommendation():
    result = guided._finalize({"goal": "unsure", "budget": 800000, "area": None, "bedrooms": None})
    assert result["entities"]["question_type"] == "budget_recommendation"
    assert result["entities"]["budget"] == 800000
    assert result["entities"]["area"] is None


def test_finalize_with_nothing_routes_to_top_areas_ranking_never_dead_ends():
    result = guided._finalize({"goal": "unsure", "budget": None, "area": None, "bedrooms": None})
    assert result["entities"]["question_type"] == "top_areas_ranking"


def test_finalize_entities_shape_matches_stage2_schema_keys():
    """Every key Stage 2 normally produces must be present so
    _build_lookup_data()/build_answer() never hit a missing key."""
    result = guided._finalize({"goal": "yield", "budget": 1000000, "area": "JVC", "bedrooms": 1})
    required_keys = {
        "question_type", "area", "area2", "project", "project2", "developer",
        "broker", "valuator", "bedrooms", "budget", "asking_price", "rent_amount",
        "wants_transaction_list", "transaction_count", "wants_trend",
        "ranking_metric", "ranking_year", "ranking_limit", "index_property_type",
        "user_type", "is_followup",
    }
    assert required_keys.issubset(result["entities"].keys())


def test_finalize_intro_recap_mentions_stated_budget_and_area():
    result = guided._finalize({"goal": "yield", "budget": 1200000, "area": "JVC", "bedrooms": 2})
    assert "1,200,000" in result["intro"]
    assert "JVC" in result["intro"]


def test_finalize_question_never_none_and_mentions_goal():
    result = guided._finalize({"goal": "appreciation", "budget": None, "area": None, "bedrooms": None})
    assert result["question"]
    assert "growth" in result["question"].lower()

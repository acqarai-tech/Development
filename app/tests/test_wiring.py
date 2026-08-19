"""
Wiring test — Stage 2, 3, 4, and 5 are each already proven correct
alone. This file checks ONLY the connection between them: does
chat.chat() call them in the right order, with the right data passed
between them?

THIS FILE IS BETA v1's COMPLETE WIRING TEST SUITE — Beta v0's gate tests
(T1, T4, T8, T15) and Beta v1's new multi-turn gate tests (T6, T7) live
together here, because Beta v1 is the extended version of Beta v0, not a
separate parallel version. Everything from Beta v0 is included and
unchanged; Beta v1 adds multi-turn (Stage 3) on top of it. Also includes
the routing tests for list_areas, area_properties, and the
wants_trend -> chart_data path, added along the way. Previously some of
this lived in a separate test_wiring_new_features.py — merged here into
one file per request, since it's all the same wiring layer.
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
import ai_chat as chat
import stage3_detect_followup


# ===========================================================================
# Beta v0's gate tests (T1, T4, T8, T15) — the foundation Beta v1 is built
# on. Unchanged from Beta v0; must keep passing exactly as before.
# ===========================================================================
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


# ===========================================================================
# New routing tests — list_areas, area_properties, wants_trend -> chart_data
# (previously test_wiring_new_features.py, merged in here)
# ===========================================================================
def test_list_areas_routes_to_get_all_areas_not_lookup_area_data():
    fake_areas = [{"district_code": "D001", "district_name": "4 Al Yilayis St"}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "list_areas", "area": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_all_areas", return_value=fake_areas) as mock_get_all, \
         patch.object(chat, "lookup_area_data") as mock_lookup, \
         patch.object(chat, "build_answer", return_value=("We cover 1 area.", True)):
        resp = chat.chat(chat.ChatRequest(message="What areas do you cover?"))
    mock_get_all.assert_called_once()
    mock_lookup.assert_not_called()
    assert resp.grounded is True
    assert resp.area is None  # no single area for a list_areas answer


def test_list_areas_empty_falls_back_honestly():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "list_areas", "area": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_all_areas", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="What areas do you cover?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_area_properties_routes_to_get_district_properties():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_properties", "area": "Dubai Hills Estate",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_district_properties",
                       return_value=(["Property A", "Property B"], 2)) as mock_props, \
         patch.object(chat, "lookup_area_data") as mock_lookup, \
         patch.object(chat, "build_answer", return_value=("2 properties found.", True)):
        resp = chat.chat(chat.ChatRequest(message="What's in Dubai Hills Estate?"))
    mock_props.assert_called_once_with("Dubai Hills Estate")
    mock_lookup.assert_not_called()
    assert resp.grounded is True


def test_wants_trend_merges_price_trend_into_data_and_chart_data():
    fake_area_data = {"area": "jvc", "avg_price_per_sqm": 16000, "avg_price_per_sqft": 1487}
    fake_trend = [
        {"year": 2021, "avg_price_per_sqm": 14200, "avg_price_per_sqft": 1319, "transaction_count": 320},
        {"year": 2026, "avg_price_per_sqm": 16750, "avg_price_per_sqft": 1556, "transaction_count": 410},
    ]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": True,
         }), \
         patch.object(chat, "lookup_area_data", return_value=dict(fake_area_data)), \
         patch.object(chat, "get_price_trend", return_value=fake_trend) as mock_trend, \
         patch.object(chat, "build_answer", return_value=("Prices rose.", True)):
        resp = chat.chat(chat.ChatRequest(message="How has JVC trended?"))
    mock_trend.assert_called_once_with("JVC", bedrooms=None)
    assert resp.chart_data == fake_trend


def test_no_trend_requested_chart_data_is_none():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc", "avg_price_per_sqm": 16000}), \
         patch.object(chat, "get_price_trend") as mock_trend, \
         patch.object(chat, "build_answer", return_value=("JVC looks fine.", True)):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))
    mock_trend.assert_not_called()
    assert resp.chart_data is None


def test_trend_lookup_failure_does_not_break_normal_answer():
    """If get_price_trend() returns None (no data), the rest of the answer
    must still go through normally — a missing trend isn't a hard failure."""
    fake_area_data = {"area": "jvc", "avg_price_per_sqm": 16000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": True,
         }), \
         patch.object(chat, "lookup_area_data", return_value=dict(fake_area_data)), \
         patch.object(chat, "get_price_trend", return_value=None), \
         patch.object(chat, "build_answer", return_value=("JVC looks fine.", True)):
        resp = chat.chat(chat.ChatRequest(message="How has JVC trended?"))
    assert resp.grounded is True
    assert resp.chart_data is None


def test_transaction_list_succeeds_even_when_aggregate_lookup_fails():
    """Confirmed live: 'show me the last 10 sales for downtown' returned
    the honest no-data fallback because lookup_area_data() (a much
    heavier 500-row aggregate query) timed out on a high-volume area —
    even though get_recent_transactions() (a cheap, capped fetch) would
    have succeeded fine on its own. A transaction-list question doesn't
    need the aggregate at all; this proves it no longer depends on it."""
    fake_transactions = [
        {"date": "2026-08-03", "type": "2 B/R", "project": "Imperial Avenue",
         "size_sqft": 1376, "psm_aed": 23474, "psf_aed": 2181, "price_aed": 3000000},
    ]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "Downtown Dubai", "bedrooms": None,
             "wants_transaction_list": True, "transaction_count": 10, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "get_recent_transactions", return_value=fake_transactions), \
         patch.object(chat, "build_answer", return_value=("Here are the sales.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="Show me the last 10 sales for downtown"))
    assert resp.grounded is True
    # build_answer must have actually received the transactions, not None
    data_passed = mock_build.call_args[0][2]
    assert data_passed is not None
    assert data_passed["recent_transactions"] == fake_transactions


def test_transaction_list_still_none_when_both_lookups_fail():
    """The honest fallback must still fire when there's genuinely no
    data at all — this fix must not turn real 'no data' cases into a
    fabricated or empty-but-grounded answer."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "Nonexistent Area", "bedrooms": None,
             "wants_transaction_list": True, "transaction_count": 10, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "get_recent_transactions", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="Show me the last 10 sales for nowhere"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


# ===========================================================================
# Beta v1 — multi-turn (Stage 3, T6/T7, UC5). Everything above this line is
# unaffected: with no history, detect_followup() short-circuits to
# is_followup=False without calling Groq, so every Beta v0 test still
# behaves exactly as before.
# ===========================================================================
def test_t6_multiturn_genuine_topic_change():
    """UC5 / T6: ask about JVC, then 'latest Binghatti project?' — must
    re-resolve fresh for the new question and must NOT repeat the JVC
    answer. Uses the REAL detect_followup() (only Groq is mocked) so this
    proves the actual merge logic in chat(), not just a stubbed decision."""
    history = [{"message": "Is JVC worth buying?",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]

    with patch.object(chat, "extract_entities", return_value={
             "question_type": "developer_lookup", "area": None, "project": "Binghatti",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(stage3_detect_followup, "groq_client") as mock_groq, \
         patch.object(chat, "lookup_area_data", return_value=None) as mock_lookup, \
         patch.object(chat, "build_answer",
                       return_value=("Here's Binghatti's latest project.", True)) as mock_build:
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock(message=MagicMock(
            content='{"is_followup": false, "reasoning": "new subject named"}'))]
        mock_groq.chat.completions.create.return_value = mock_completion

        resp = chat.chat(chat.ChatRequest(message="latest Binghatti project?", history=history))

    # area must NOT have been silently carried forward from JVC
    entities_passed = mock_build.call_args[0][1]
    assert entities_passed["area"] is None
    assert entities_passed["is_followup"] is False
    assert entities_passed["project"] == "Binghatti"
    assert resp.answer == "Here's Binghatti's latest project."
    assert "JVC" not in resp.answer


def test_t7_multiturn_genuine_followup():
    """UC5 / T7: ask about JVC, then 'what about the yield there?' —
    must correctly carry JVC forward. This is the case that must keep
    working, not just the topic-change case above."""
    history = [{"message": "Is JVC worth buying?",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]

    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(stage3_detect_followup, "groq_client") as mock_groq, \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc", "avg_price_per_sqm": 16327}) as mock_lookup, \
         patch.object(chat, "build_answer", return_value=("JVC's yield looks solid.", True)) as mock_build:
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock(message=MagicMock(
            content='{"is_followup": true, "reasoning": "implicit there"}'))]
        mock_groq.chat.completions.create.return_value = mock_completion

        resp = chat.chat(chat.ChatRequest(message="what about the yield there?", history=history))

    # area MUST have been carried forward from the previous turn
    mock_lookup.assert_called_once_with("JVC", bedrooms=None)
    entities_passed = mock_build.call_args[0][1]
    assert entities_passed["area"] == "JVC"
    assert entities_passed["is_followup"] is True
    assert resp.grounded is True


def test_followup_never_overwrites_area_stage2_actually_found():
    """Even if Stage 3 says is_followup=True, Stage 2's own extraction
    always wins if it found something — Stage 3 only fills gaps."""
    history = [{"message": "Is JVC worth buying?",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "Dubai Marina", "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(stage3_detect_followup, "groq_client") as mock_groq, \
         patch.object(chat, "lookup_area_data", return_value={"area": "dubai marina"}), \
         patch.object(chat, "build_answer", return_value=("Dubai Marina looks fine.", True)) as mock_build:
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock(message=MagicMock(
            content='{"is_followup": true, "reasoning": "x"}'))]
        mock_groq.chat.completions.create.return_value = mock_completion

        chat.chat(chat.ChatRequest(message="what about Dubai Marina instead?", history=history))

    entities_passed = mock_build.call_args[0][1]
    assert entities_passed["area"] == "Dubai Marina"  # Stage 2's own finding, not carried JVC


def test_no_history_beta_v0_behavior_completely_unaffected():
    """Explicit regression guard: omitting history entirely must behave
    identically to Beta v0 — no Groq call for follow-up detection at
    all, is_followup always False."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(stage3_detect_followup.groq_client.chat.completions, "create") as mock_create, \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc"}), \
         patch.object(chat, "build_answer", return_value=("JVC looks fine.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))  # no history field at all

    mock_create.assert_not_called()
    entities_passed = mock_build.call_args[0][1]
    assert entities_passed["is_followup"] is False


def test_raw_message_never_modified_by_followup_merge():
    """The rule that prevented this project's #1 historical bug: the
    exact question string passed to build_answer must be byte-identical
    to what the investor typed, even on a genuine follow-up turn."""
    history = [{"message": "Is JVC worth buying?",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    raw_message = "  what about the yield there?  "
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(stage3_detect_followup, "groq_client") as mock_groq, \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc"}), \
         patch.object(chat, "build_answer", return_value=("ok", True)) as mock_build:
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock(message=MagicMock(
            content='{"is_followup": true, "reasoning": "x"}'))]
        mock_groq.chat.completions.create.return_value = mock_completion

        chat.chat(chat.ChatRequest(message=raw_message, history=history))

    question_passed = mock_build.call_args[0][0]
    assert question_passed == raw_message.strip()  # only Stage 1's own .strip(), nothing merged in


# ===========================================================================
# Three confirmed live bugs, fixed together: (1) "projects" routed to the
# wrong table, (2) project-only questions (no area) got nothing, (3) area
# names with a trailing number got silently mangled.
# ===========================================================================
def test_area_projects_routes_to_get_area_projects_not_district_properties():
    """Issue 1: 'what projects are in JVC' must use get_area_projects()
    (avm's real transacted data), never get_district_properties() (the
    unrelated building directory)."""
    fake_projects = [{"project": "Auresta Tower", "transaction_count": 1021,
                       "avg_price_per_sqm": 15501, "avg_price_per_sqft": 1440}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_projects", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_area_projects", return_value=fake_projects) as mock_projects, \
         patch.object(chat, "get_district_properties") as mock_properties, \
         patch.object(chat, "build_answer", return_value=("Real projects found.", True)):
        resp = chat.chat(chat.ChatRequest(message="What projects are in JVC?"))
    mock_projects.assert_called_once_with("JVC")
    mock_properties.assert_not_called()
    assert resp.grounded is True


def test_area_properties_still_routes_to_district_properties():
    """The original area_properties path (buildings directory) must
    still work unchanged — this fix only adds a new route, doesn't
    break the existing one."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_properties", "area": "Dubai Hills Estate", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_district_properties", return_value=(["Bloom Towers"], 1)) as mock_properties, \
         patch.object(chat, "get_area_projects") as mock_projects, \
         patch.object(chat, "build_answer", return_value=("A building found.", True)):
        chat.chat(chat.ChatRequest(message="What buildings are in Dubai Hills Estate?"))
    mock_properties.assert_called_once_with("Dubai Hills Estate")
    mock_projects.assert_not_called()


def test_project_only_no_area_uses_lookup_project_data():
    """Issue 2: 'tell me about Binghatti Aquarise' (no area named) must
    resolve via lookup_project_data(), not silently fail because
    lookup_area_data() was called with area=None."""
    fake_project_data = {"project": "Binghatti Aquarise", "area": "Business Bay", "avg_price_per_sqm": 29487}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": None, "project": "Binghatti Aquarise",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_project_data", return_value=fake_project_data) as mock_project_lookup, \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "build_answer", return_value=("Binghatti Aquarise looks solid.", True)):
        resp = chat.chat(chat.ChatRequest(message="Tell me about Binghatti Aquarise"))
    mock_project_lookup.assert_called_once_with("Binghatti Aquarise", bedrooms=None)
    mock_area_lookup.assert_not_called()
    assert resp.grounded is True


def test_neither_area_nor_project_never_calls_either_lookup():
    """A question with genuinely nothing to look up (e.g. a vague legal
    question) must not call either lookup function — this stays an
    honest no-data case, same as Beta v0."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "lookup_project_data") as mock_project_lookup:
        resp = chat.chat(chat.ChatRequest(message="What are the legal steps to buy off-plan?"))
    mock_area_lookup.assert_not_called()
    mock_project_lookup.assert_not_called()
    assert resp.grounded is False


def test_transaction_list_wins_over_misclassified_area_properties():
    """Confirmed live bug: 'tell the recent transactions of DAMAC Hills
    2' was classified as question_type='area_properties', showing a
    linked-buildings list instead of actual sales. The prompt was
    strengthened, but this is the code-level guarantee — even if Stage 2
    still misclassifies, an explicit wants_transaction_list=True must
    always win and route to real transactions, never a properties list."""
    fake_transactions = [
        {"date": "2026-02-27", "type": "5 B/R", "project": "Viridis Tower B", "size_sqft": 2516,
         "psm_aed": 15615, "psf_aed": 1451, "price_aed": 3650000},
    ]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_properties",  # the confirmed live misclassification
             "area": "DAMAC Hills 2", "bedrooms": None, "project": None,
             "wants_transaction_list": True, "transaction_count": None, "wants_trend": False,
         }), \
         patch.object(chat, "get_district_properties") as mock_properties, \
         patch.object(chat, "lookup_area_data", return_value={"area": "damac hills 2"}), \
         patch.object(chat, "get_recent_transactions", return_value=fake_transactions) as mock_transactions, \
         patch.object(chat, "build_answer", return_value=("Here are the recent sales.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="tell the recent transactions of damac hills 2"))

    mock_properties.assert_not_called()  # must NEVER show the properties list for this question
    mock_transactions.assert_called_once()
    data_passed = mock_build.call_args[0][2]
    assert "recent_transactions" in data_passed
    assert resp.grounded is True


def test_transaction_list_wins_over_misclassified_area_projects():
    """Same fix, area_projects variant."""
    fake_transactions = [
        {"date": "2026-08-03", "type": "2 B/R", "project": "Auresta Tower", "size_sqft": 1090,
         "psm_aed": 29487, "psf_aed": 2739, "price_aed": 2984999},
    ]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_projects", "area": "JVC", "bedrooms": None, "project": None,
             "wants_transaction_list": True, "transaction_count": None, "wants_trend": False,
         }), \
         patch.object(chat, "get_area_projects") as mock_projects, \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc"}), \
         patch.object(chat, "get_recent_transactions", return_value=fake_transactions), \
         patch.object(chat, "build_answer", return_value=("Here are the recent sales.", True)):
        chat.chat(chat.ChatRequest(message="recent transactions in JVC"))

    mock_projects.assert_not_called()


def test_area_properties_without_transaction_intent_still_works_normally():
    """The override must be narrowly scoped — an ordinary area_properties
    question (no transaction intent at all) must still work exactly as
    before, unaffected by this fix."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_properties", "area": "JVC", "bedrooms": None, "project": None,
             "wants_transaction_list": False, "transaction_count": None, "wants_trend": False,
         }), \
         patch.object(chat, "get_district_properties", return_value=(["Bloom Towers"], 1)) as mock_properties, \
         patch.object(chat, "build_answer", return_value=("A building found.", True)):
        resp = chat.chat(chat.ChatRequest(message="What's linked to JVC?"))
    mock_properties.assert_called_once()
    assert resp.grounded is True


def test_followup_list_areas_misclassification_corrected_to_area_projects():
    """Confirmed live bug: 'tell the projects' as a follow-up to a JVC
    conversation returned the full 397-area list instead of JVC's real
    projects. Stage 2, given only the raw current message (no area),
    classified this as question_type='list_areas' since that's the only
    type defined to work with no area — then Stage 3 correctly carried
    JVC forward, but question_type was never reconsidered. This proves
    the fix: get_all_areas() must NOT be called, get_area_projects()
    must be, using the carried-forward area."""
    history = [{"message": "Recent transactions in JVC",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    fake_projects = [{"project": "Auresta Tower", "transaction_count": 1021,
                       "avg_price_per_sqm": 15501, "avg_price_per_sqft": 1440}]

    with patch.object(chat, "extract_entities", return_value={
             "question_type": "list_areas",  # the confirmed live misclassification
             "area": None, "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(stage3_detect_followup, "groq_client") as mock_groq, \
         patch.object(chat, "get_all_areas") as mock_all_areas, \
         patch.object(chat, "get_area_projects", return_value=fake_projects) as mock_projects, \
         patch.object(chat, "build_answer", return_value=("Real JVC projects found.", True)):
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock(message=MagicMock(
            content='{"is_followup": true, "reasoning": "implicit reference to JVC"}'))]
        mock_groq.chat.completions.create.return_value = mock_completion

        resp = chat.chat(chat.ChatRequest(message="tell the projects", history=history))

    mock_all_areas.assert_not_called()  # must NEVER show the full 397-area list for this
    mock_projects.assert_called_once_with("JVC")
    assert resp.grounded is True


def test_followup_list_areas_misclassification_corrected_to_area_properties():
    """Same fix, area_properties variant (investor says 'properties' or
    'buildings' instead of 'projects')."""
    history = [{"message": "Is JVC worth buying?",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "list_areas", "area": None, "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(stage3_detect_followup, "groq_client") as mock_groq, \
         patch.object(chat, "get_all_areas") as mock_all_areas, \
         patch.object(chat, "get_district_properties", return_value=(["Bloom Towers"], 1)) as mock_props, \
         patch.object(chat, "build_answer", return_value=("Buildings found.", True)):
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock(message=MagicMock(
            content='{"is_followup": true, "reasoning": "x"}'))]
        mock_groq.chat.completions.create.return_value = mock_completion

        chat.chat(chat.ChatRequest(message="tell the buildings there", history=history))

    mock_all_areas.assert_not_called()
    mock_props.assert_called_once_with("JVC")


def test_followup_list_areas_misclassification_defaults_to_area_report():
    """When the raw message gives no project/property keyword to
    reclassify by, correcting to 'area_report' (a real, grounded answer
    about the carried-forward area) is a safer default than either
    silently showing the wrong list or crashing."""
    history = [{"message": "Is JVC worth buying?",
                "entities": {"area": "JVC", "project": None, "bedrooms": None}}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "list_areas", "area": None, "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(stage3_detect_followup, "groq_client") as mock_groq, \
         patch.object(chat, "get_all_areas") as mock_all_areas, \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc"}) as mock_lookup, \
         patch.object(chat, "build_answer", return_value=("JVC looks fine.", True)):
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock(message=MagicMock(
            content='{"is_followup": true, "reasoning": "x"}'))]
        mock_groq.chat.completions.create.return_value = mock_completion

        chat.chat(chat.ChatRequest(message="tell me more", history=history))

    mock_all_areas.assert_not_called()
    mock_lookup.assert_called_once_with("JVC", bedrooms=None)


def test_list_areas_still_works_normally_with_no_history():
    """The correction only applies when an area gets newly carried
    forward by THIS merge — a genuine 'what areas do you cover' question
    with no history at all must still work exactly as before."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "list_areas", "area": None, "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_all_areas", return_value=[{"district_code": "D001", "district_name": "Test"}]) as mock_all_areas, \
         patch.object(chat, "build_answer", return_value=("397 areas.", True)):
        resp = chat.chat(chat.ChatRequest(message="What areas do you cover?"))
    mock_all_areas.assert_called_once()
    assert resp.grounded is True


# ===========================================================================
# Beta v2 — Depth: project/developer lookups, genuine two-area comparison
# ===========================================================================
def test_t2_two_area_comparison_shows_both_sides():
    """
    T2 — "Dubai Hills Estate or Dubai Marina, long-term?"
    Expected: real numbers shown for BOTH areas, explicit comparison, no
    "X is in Y, not Z" confusion.
    """
    fake_data1 = {"area": "Dubai Hills Estate", "avg_price_per_sqm": 18000}
    fake_data2 = {"area": "Dubai Marina", "avg_price_per_sqm": 22000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "comparison", "area": "Dubai Hills Estate", "area2": "Dubai Marina",
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_comparison_data", return_value={"comparison": [fake_data1, fake_data2]}) as mock_compare, \
         patch.object(chat, "lookup_area_data") as mock_single_area, \
         patch.object(chat, "build_answer", return_value=("Dubai Marina looks stronger long-term.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="Dubai Hills Estate or Dubai Marina, long-term?"))

    mock_compare.assert_called_once_with("Dubai Hills Estate", "Dubai Marina", bedrooms=None)
    mock_single_area.assert_not_called()  # must NOT fall back to a single-area lookup
    data_passed = mock_build.call_args[0][2]
    assert data_passed["comparison"][0]["area"] == "Dubai Hills Estate"
    assert data_passed["comparison"][1]["area"] == "Dubai Marina"
    assert resp.grounded is True


def test_t3_named_project_with_data_uses_project_numbers():
    """
    T3 — a project that actually exists in the DB.
    Expected: project-specific numbers, NOT area-wide numbers presented
    as if they were project-specific.
    """
    fake_project_data = {"project": "Tiger Sky Tower", "area": "Business Bay", "avg_price_per_sqm": 19500}
    fake_area_data = {"area": "Business Bay", "avg_price_per_sqm": 24000}  # area-wide — must NOT be used
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": "Business Bay", "project": "Tiger Sky Tower",
             "bedrooms": 1, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_project_data", return_value=fake_project_data) as mock_project_lookup, \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data) as mock_area_lookup, \
         patch.object(chat, "build_answer", return_value=("Tiger Sky Tower 1BR pricing found.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="Price of Tiger Sky Tower, one bedroom?"))

    mock_project_lookup.assert_called_once_with("Tiger Sky Tower", bedrooms=1)
    mock_area_lookup.assert_not_called()  # the actual T3 fix: project must win, never area-wide
    data_passed = mock_build.call_args[0][2]
    assert data_passed["avg_price_per_sqm"] == 19500  # project-specific, not the area's 24000
    assert resp.grounded is True


def test_t3_named_project_no_data_gives_honest_fallback():
    """T4 companion to T3 — a project genuinely not in the DB must get
    the honest fallback, never area-wide data silently substituted."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": None, "project": "Tiger Sky Tower",
             "bedrooms": 1, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_project_data", return_value=None), \
         patch.object(chat, "lookup_area_data") as mock_area_lookup:
        resp = chat.chat(chat.ChatRequest(message="Price of Tiger Sky Tower for a 1BR?"))
    mock_area_lookup.assert_not_called()
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_t5_developer_lookup_uses_real_track_record():
    """
    T5 — "Latest Binghatti project?"
    Expected: uses real developer/project data if available; honest
    disclosure if not. Must never silently substitute an unrelated
    area's report.
    """
    fake_projects = [{"project": "Maybach Six", "area": "Nad Al Shiba First", "status": "ACTIVE",
                       "transaction_count": 2794, "avg_price_per_sqm": 41312}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "developer_lookup", "developer": "Binghatti", "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_developer_projects", return_value=fake_projects) as mock_dev, \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "build_answer", return_value=("Real Binghatti projects found.", True)):
        resp = chat.chat(chat.ChatRequest(message="Latest Binghatti project?"))

    mock_dev.assert_called_once_with("Binghatti")
    mock_area_lookup.assert_not_called()  # never substitute an unrelated area's report
    assert resp.grounded is True


def test_t5_developer_lookup_no_data_gives_honest_fallback():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "developer_lookup", "developer": "Nonexistent Developer XYZ", "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_developer_projects", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="Latest Nonexistent Developer XYZ project?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


# ===========================================================================
# developer_info merge — closes doc issue #10 (P2): developers table
# (2,317 rows) had never been queried anywhere in the app. Ties license
# info to the EXACT developer_id(s) already resolved by
# get_developer_projects(), never a second independent name search.
# ===========================================================================
def test_developer_lookup_merges_developer_info_by_id():
    fake_projects = [
        {"project": "Damac Islands 2 - Bahamas 2", "area": "Al Yelayiss 1", "status": "ACTIVE",
         "transaction_count": 1325, "avg_price_per_sqm": 19474, "developer_id": 801164586},
        {"project": "Damac Islands 2 - Bahamas 1", "area": "Al Yelayiss 1", "status": "ACTIVE",
         "transaction_count": 1235, "avg_price_per_sqm": 19378, "developer_id": 801164586},
    ]
    fake_info = [{"developer_name": "DAMAC PRIME DEVELOPMENT L.L.C", "legal_status": "Limited Responsibility",
                  "license_type": "PROFESSIONAL", "license_number": "784109",
                  "license_expiry_date": "2026-06-05", "is_license_expired": True,
                  "registration_date": "2025-08-11"}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "developer_lookup", "developer": "Damac", "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_developer_projects", return_value=fake_projects), \
         patch.object(chat, "get_developer_info", return_value=fake_info) as mock_info, \
         patch.object(chat, "build_answer", return_value=("Damac projects.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="What has Damac built recently?"))

    # Only ONE distinct id across both projects -- must be de-duplicated,
    # not passed as [801164586, 801164586].
    mock_info.assert_called_once_with([801164586])
    passed_data = mock_build.call_args[0][2]
    assert passed_data["developer_info"] == fake_info


def test_developer_lookup_no_developer_id_skips_info_gracefully():
    """Some projects genuinely have no resolvable developer_id at all
    (confirmed live: 2 of 3,240 dld_projects rows). Must not crash, must
    not include an empty/junk developer_info key."""
    fake_projects = [{"project": "Some Project", "area": "Some Area", "status": "ACTIVE",
                      "transaction_count": 5, "avg_price_per_sqm": 10000, "developer_id": None}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "developer_lookup", "developer": "Obscure Dev", "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_developer_projects", return_value=fake_projects), \
         patch.object(chat, "get_developer_info", return_value=None) as mock_info, \
         patch.object(chat, "build_answer", return_value=("Some Project.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="Tell me about Obscure Dev"))

    mock_info.assert_called_once_with([])
    passed_data = mock_build.call_args[0][2]
    assert "developer_info" not in passed_data
    assert resp.grounded is True


def test_comparison_with_only_one_real_area_falls_back_to_single_area_path():
    """If Stage 2 couldn't resolve a genuine second area (area2 is
    None), this isn't a real two-area question — must fall back to the
    ordinary single-area lookup rather than failing outright."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "comparison", "area": "JVC", "area2": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_comparison_data") as mock_compare, \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc"}) as mock_area_lookup, \
         patch.object(chat, "build_answer", return_value=("JVC looks fine.", True)):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))
    mock_compare.assert_not_called()
    mock_area_lookup.assert_called_once()
    assert resp.grounded is True


def test_comparison_degraded_to_single_area_never_shows_trend_table():
    """Confirmed live bug: 'Dubai Hills Estate or Dubai Marina,
    long-term?' had area2 left null AND wants_trend incorrectly true,
    producing a confusing single-area answer with a trend table
    appended. This proves the code-level safety net: a comparison that
    degrades to one area must never also trigger get_price_trend."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "comparison", "area": "Dubai Hills Estate", "area2": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": True,
         }), \
         patch.object(chat, "lookup_comparison_data") as mock_compare, \
         patch.object(chat, "lookup_area_data", return_value={"area": "Dubai Hills Estate", "avg_price_per_sqm": 29146}), \
         patch.object(chat, "get_price_trend") as mock_trend, \
         patch.object(chat, "build_answer", return_value=("Dubai Hills Estate looks stable.", True)):
        chat.chat(chat.ChatRequest(message="Dubai Hills Estate or Dubai Marina, long-term?"))
    mock_compare.assert_not_called()
    mock_trend.assert_not_called()  # the actual fix — wants_trend forced False for this fallback


def test_top_10_selling_areas_2026_routes_correctly():
    """The exact requested example: 'top 10 selling areas in 2026' must
    return a real ranked list, not an area-report or a list_areas
    directory."""
    fake_ranking = {"metric": "volume", "year": 2026, "ranked_areas": [
        {"area": "Madinat Al Mataar", "transaction_count": 14505,
         "avg_price_per_sqm": 5201, "avg_price_per_sqft": 483},
    ]}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "top_areas_ranking", "area": None, "project": None,
             "developer": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_metric": "volume", "ranking_year": 2026,
             "ranking_limit": 10,
         }), \
         patch.object(chat, "get_top_areas", return_value=fake_ranking) as mock_top, \
         patch.object(chat, "get_all_areas") as mock_all_areas, \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "build_answer", return_value=("Top 10 areas found.", True)):
        resp = chat.chat(chat.ChatRequest(message="top 10 selling areas in 2026"))

    mock_top.assert_called_once_with(metric="volume", year=2026, limit=10)
    mock_all_areas.assert_not_called()   # not a plain directory listing
    mock_area_lookup.assert_not_called()  # not a single-area report
    assert resp.grounded is True


def test_top_areas_ranking_defaults_metric_and_limit_when_not_extracted():
    """'top areas' with no explicit metric/limit named must still work,
    using sensible defaults (volume, 10) rather than failing."""
    fake_ranking = {"metric": "volume", "year": 2026, "ranked_areas": [
        {"area": "Madinat Al Mataar", "transaction_count": 14505,
         "avg_price_per_sqm": 5201, "avg_price_per_sqft": 483},
    ]}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "top_areas_ranking", "area": None, "project": None,
             "developer": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_metric": None, "ranking_year": None,
             "ranking_limit": None,
         }), \
         patch.object(chat, "get_top_areas", return_value=fake_ranking) as mock_top, \
         patch.object(chat, "build_answer", return_value=("Top areas found.", True)):
        chat.chat(chat.ChatRequest(message="top areas right now"))
    mock_top.assert_called_once_with(metric="volume", year=None, limit=10)


def test_top_areas_ranking_no_data_gives_honest_fallback():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "top_areas_ranking", "area": None, "project": None,
             "developer": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_metric": "volume", "ranking_year": 1999,
             "ranking_limit": 10,
         }), \
         patch.object(chat, "get_top_areas", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="top 10 selling areas in 1999"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_top_projects_ranking_routes_correctly():
    fake_ranking = {"metric": "volume", "year": 2026, "ranked_projects": [
        {"name": "Maybach Six", "transaction_count": 1918, "avg_price_per_sqm": 41905, "avg_price_per_sqft": 3894},
    ]}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "top_projects_ranking", "area": None, "project": None,
             "developer": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_metric": "volume", "ranking_year": 2026,
             "ranking_limit": 10,
         }), \
         patch.object(chat, "get_top_projects", return_value=fake_ranking) as mock_top, \
         patch.object(chat, "get_top_areas") as mock_top_areas, \
         patch.object(chat, "build_answer", return_value=("Top projects found.", True)):
        resp = chat.chat(chat.ChatRequest(message="top selling projects in 2026"))
    mock_top.assert_called_once_with(metric="volume", year=2026, limit=10)
    mock_top_areas.assert_not_called()
    assert resp.grounded is True


def test_top_developers_ranking_routes_correctly():
    """The literal example from the request: developer-related questions
    must be understood and routed, not just area questions."""
    fake_ranking = {"metric": "volume", "year": 2026, "ranked_developers": [
        {"name": "DAMAC PRIME DEVELOPMENT L.L.C", "transaction_count": 5957, "avg_price_per_sqm": 19633},
    ]}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "top_developers_ranking", "area": None, "project": None,
             "developer": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_metric": "volume", "ranking_year": 2026,
             "ranking_limit": 10,
         }), \
         patch.object(chat, "get_top_developers", return_value=fake_ranking) as mock_top, \
         patch.object(chat, "get_developer_projects") as mock_single_dev, \
         patch.object(chat, "build_answer", return_value=("Top developers found.", True)):
        resp = chat.chat(chat.ChatRequest(message="top developers in 2026"))
    mock_top.assert_called_once_with(metric="volume", year=2026, limit=10)
    mock_single_dev.assert_not_called()  # must not fall into the single-developer lookup path
    assert resp.grounded is True


def test_market_overview_routes_correctly_with_no_named_entity():
    """The literal example from the request: 'any pricing question'
    must be understood, even with no area/project/developer named at
    all — a genuinely different case from area_report."""
    fake_overview = {"year": 2026, "transaction_count": 226361, "avg_price_per_sqm": 22210,
                      "avg_price_per_sqft": 2064, "avg_actual_worth": 1850000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "market_overview", "area": None, "project": None,
             "developer": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_metric": None, "ranking_year": 2026,
             "ranking_limit": None,
         }), \
         patch.object(chat, "get_market_overview", return_value=fake_overview) as mock_overview, \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "build_answer", return_value=("Dubai market looks healthy.", True)):
        resp = chat.chat(chat.ChatRequest(message="what's the average price per sqm in Dubai right now"))
    mock_overview.assert_called_once_with(year=2026)
    mock_area_lookup.assert_not_called()  # not treated as a single-area question
    assert resp.grounded is True


def test_market_overview_no_data_gives_honest_fallback():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "market_overview", "area": None, "project": None,
             "developer": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_metric": None, "ranking_year": 1999,
             "ranking_limit": None,
         }), \
         patch.object(chat, "get_market_overview", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="how was the Dubai market in 1999"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


# ===========================================================================
# roi routing — closes Part Two, issue #15 (P1) of the DLD reference pack.
# Previously "roi" had no branch in _build_lookup_data() at all — it fell
# through to the default area/project path, which returns real SALE data
# only. These tests guard the fix: roi now pulls sale data AND rental data
# and combines them into gross_yield_pct, computed in Python, never by the
# model.
# ===========================================================================
def test_roi_combines_sale_and_rental_data_into_gross_yield():
    fake_sale_data = {"area": "jvc", "avg_price_per_sqm": 16000, "transaction_sample_size": 500}
    fake_rental_data = {"avg_annual_rent": 85000, "avg_rent_per_sqm": 1088, "contract_count": 640,
                        "most_recent_contract_start": "2026-07-15"}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "roi", "area": "JVC", "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_sale_data) as mock_area_lookup, \
         patch.object(chat, "get_rental_yield", return_value=fake_rental_data) as mock_rental, \
         patch.object(chat, "build_answer", return_value=("JVC yields well.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="What's the rental yield in JVC?"))

    mock_area_lookup.assert_called_once_with("JVC", bedrooms=None)
    mock_rental.assert_called_once_with("JVC", bedrooms=None)
    passed_data = mock_build.call_args[0][2]
    assert passed_data["rental_yield"]["avg_annual_rent"] == 85000
    # 1088 / 16000 * 100 = 6.8 — computed here, never left for the model
    assert passed_data["rental_yield"]["gross_yield_pct"] == 6.8
    assert resp.grounded is True


def test_roi_with_project_uses_project_lookup_not_area():
    fake_sale_data = {"area": "jvc", "avg_price_per_sqm": 15501}
    fake_rental_data = {"avg_annual_rent": 80000, "avg_rent_per_sqm": 1050, "contract_count": 12,
                        "most_recent_contract_start": "2026-06-01"}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "roi", "area": None, "project": "Auresta Tower", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_project_data", return_value=fake_sale_data) as mock_project_lookup, \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "get_rental_yield", return_value=fake_rental_data), \
         patch.object(chat, "build_answer", return_value=("Auresta Tower yields well.", True)):
        chat.chat(chat.ChatRequest(message="What's the ROI on Auresta Tower?"))

    mock_project_lookup.assert_called_once_with("Auresta Tower", bedrooms=None)
    mock_area_lookup.assert_not_called()


def test_roi_no_rental_data_still_returns_sale_data_not_bare_fallback():
    """Confirmed gap this closes: sale data can exist for an area with no
    rent contracts yet. Must return the real sale data (so Stage 5 can
    honestly explain rental data isn't available) rather than discarding
    it and hitting the generic no-data fallback."""
    fake_sale_data = {"area": "some new area", "avg_price_per_sqm": 12000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "roi", "area": "Some New Area", "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_sale_data), \
         patch.object(chat, "get_rental_yield", return_value=None), \
         patch.object(chat, "build_answer", return_value=("Sale data only.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="What's the rental yield in Some New Area?"))

    passed_data = mock_build.call_args[0][2]
    assert "rental_yield" not in passed_data
    assert passed_data["avg_price_per_sqm"] == 12000
    assert resp.grounded is True


def test_roi_no_area_or_project_never_calls_lookups():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "roi", "area": None, "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "lookup_project_data") as mock_project_lookup, \
         patch.object(chat, "get_rental_yield") as mock_rental:
        resp = chat.chat(chat.ChatRequest(message="What's a good ROI?"))

    mock_area_lookup.assert_not_called()
    mock_project_lookup.assert_not_called()
    mock_rental.assert_not_called()
    assert resp.grounded is False


def test_roi_no_sale_data_never_calls_rental_lookup():
    """If the area/project itself doesn't resolve at all, don't bother
    calling get_rental_yield() — same short-circuit discipline as every
    other branch in this file."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "roi", "area": "Nonexistent Area", "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "get_rental_yield") as mock_rental, \
         patch.object(chat, "build_answer", return_value=(chat.NO_DATA_FALLBACK, False)):
        resp = chat.chat(chat.ChatRequest(message="What's the yield in Nonexistent Area?"))

    mock_rental.assert_not_called()
    assert resp.grounded is False


# ===========================================================================
# Performance: Stage 2 (extract_entities) and Stage 3 (detect_followup) run
# concurrently, not sequentially. They're fully independent — Stage 3 never
# reads Stage 2's output, Stage 2 never reads history — but used to run
# back-to-back, costing one full extra Groq round-trip on every message that
# has conversation history.
#
# No real Groq credentials are available in this test environment, so real
# network latency can't be measured here. Instead these tests mock both
# functions with an artificial time.sleep() standing in for a real Groq
# round-trip, and assert on WALL-CLOCK TIME — proving the two calls
# genuinely overlap (concurrent: ~max(t1,t2)) rather than merely proving
# both got called (which the existing wiring tests above already cover).
# ===========================================================================
import time


def _slow_entities(question):
    time.sleep(0.2)
    return {
        "question_type": "area_report", "area": "JVC", "project": None,
        "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
    }


def _slow_followup(question, history):
    time.sleep(0.2)
    return {"is_followup": False, "carried_area": None, "carried_project": None,
            "carried_bedrooms": None}


def test_stage2_and_stage3_run_concurrently_not_sequentially():
    with patch.object(chat, "extract_entities", side_effect=_slow_entities), \
         patch.object(chat, "detect_followup", side_effect=_slow_followup), \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc", "avg_price_per_sqm": 16000}), \
         patch.object(chat, "build_answer", return_value=("JVC report.", True)):
        start = time.perf_counter()
        chat.chat(chat.ChatRequest(message="Is JVC worth buying?", history=[
            {"message": "hi", "entities": {}}
        ]))
        elapsed = time.perf_counter() - start

    # Sequential would be >= 0.4s (0.2 + 0.2). Concurrent should be close to
    # 0.2s (max of the two) plus thread-pool overhead. 0.35s leaves generous
    # margin for CI slowness while still failing if this regresses back to
    # sequential execution.
    assert elapsed < 0.35, (
        f"Stage 2 + Stage 3 took {elapsed:.3f}s — expected ~0.2s if running "
        f"concurrently. This likely means they've regressed back to sequential."
    )


def test_concurrent_stages_still_produce_correct_merged_result():
    """Speed shouldn't come at the cost of correctness — both stages must
    still be called with the right arguments and their results still
    correctly merged, exactly as before parallelizing."""
    with patch.object(chat, "extract_entities", side_effect=_slow_entities) as mock_entities, \
         patch.object(chat, "detect_followup", side_effect=_slow_followup) as mock_followup, \
         patch.object(chat, "lookup_area_data", return_value={"area": "jvc", "avg_price_per_sqm": 16000}), \
         patch.object(chat, "build_answer", return_value=("JVC report.", True)):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying?", history=[
            {"message": "hi", "entities": {}}
        ]))

    mock_entities.assert_called_once_with("Is JVC worth buying?")
    mock_followup.assert_called_once_with("Is JVC worth buying?", [{"message": "hi", "entities": {}}])
    assert resp.grounded is True
    assert resp.area == "jvc"

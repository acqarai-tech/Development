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
    assert resp.area == "jumeirah village circle (jvc)"


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


def test_wants_trend_also_computes_market_signal():
    """Doc §3.3.1: market_signal is derived from the same price_trend
    data, in the same routing pass -- no separate lookup."""
    fake_area_data = {"area": "jvc", "avg_price_per_sqm": 16000, "avg_price_per_sqft": 1487}
    fake_trend = [
        {"year": 2024, "avg_price_per_sqm": 14200, "avg_price_per_sqft": 1319, "transaction_count": 320},
        {"year": 2025, "avg_price_per_sqm": 16750, "avg_price_per_sqft": 1556, "transaction_count": 410},
    ]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": True,
         }), \
         patch.object(chat, "lookup_area_data", return_value=dict(fake_area_data)), \
         patch.object(chat, "get_price_trend", return_value=fake_trend), \
         patch.object(chat, "build_answer", return_value=("Prices rose.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="How has JVC trended?"))
    passed_data = mock_build.call_args[0][2]
    assert "market_signal" in passed_data
    assert passed_data["market_signal"]["signal"] == "broad_strength"  # price up, volume up


def test_market_signal_absent_when_not_enough_trend_data():
    fake_area_data = {"area": "jvc", "avg_price_per_sqm": 16000, "avg_price_per_sqft": 1487}
    fake_trend = [{"year": 2025, "avg_price_per_sqm": 16750, "avg_price_per_sqft": 1556, "transaction_count": 410}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": True,
         }), \
         patch.object(chat, "lookup_area_data", return_value=dict(fake_area_data)), \
         patch.object(chat, "get_price_trend", return_value=fake_trend), \
         patch.object(chat, "build_answer", return_value=("Prices rose.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="How has JVC trended?"))
    passed_data = mock_build.call_args[0][2]
    assert "market_signal" not in passed_data


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


# ===========================================================================
# area_developers — closes a confirmed-live gap: "tell the developers in
# JVC" had no matching question_type at all before this fix, and was
# silently misclassified as area_report, dropping "developers" entirely
# and returning an unrelated price snapshot.
# ===========================================================================
def test_area_developers_routes_to_get_area_developers():
    fake_developers = [{"developer": "EMAAR DEVELOPMENT P.J.S.C.", "developer_id": 137044480,
                        "project_count": 1, "transaction_count": 454, "avg_price_per_sqm": 37367}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_developers", "area": "Business Bay", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_area_developers", return_value=fake_developers) as mock_dev, \
         patch.object(chat, "get_developer_info", return_value=None), \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "build_answer", return_value=("Real developers found.", True)):
        resp = chat.chat(chat.ChatRequest(message="Tell the developers in Business Bay"))
    mock_dev.assert_called_once_with("Business Bay")
    mock_area_lookup.assert_not_called()  # never silently fall back to a price report
    assert resp.grounded is True


def test_area_developers_no_data_gives_honest_fallback():
    """Confirmed live: JVC has zero dld_projects rows under any
    spelling — a genuine data gap. Must be an honest fallback, never a
    misclassified price report (the original bug this whole fix closes)."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_developers", "area": "JVC", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_area_developers", return_value=None), \
         patch.object(chat, "lookup_area_data") as mock_area_lookup:
        resp = chat.chat(chat.ChatRequest(message="Tell the developers in JVC"))
    mock_area_lookup.assert_not_called()
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_area_developers_merges_developer_info_by_id():
    fake_developers = [
        {"developer": "DAMAC PRIME DEVELOPMENT L.L.C", "developer_id": 801164586,
         "project_count": 3, "transaction_count": 1325, "avg_price_per_sqm": 19474},
    ]
    fake_info = [{"developer_name": "DAMAC PRIME DEVELOPMENT L.L.C", "legal_status": "Limited Responsibility",
                  "license_type": "PROFESSIONAL", "license_number": "784109",
                  "license_expiry_date": "2026-06-05", "is_license_expired": True,
                  "registration_date": "2025-08-11"}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_developers", "area": "Business Bay", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_area_developers", return_value=fake_developers), \
         patch.object(chat, "get_developer_info", return_value=fake_info) as mock_info, \
         patch.object(chat, "build_answer", return_value=("Developers found.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="Who's building in Business Bay?"))
    mock_info.assert_called_once_with([801164586])
    passed_data = mock_build.call_args[0][2]
    assert passed_data["developer_info"] == fake_info


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
         patch.object(chat, "get_escrow_agent", return_value=None), \
         patch.object(chat, "build_answer", return_value=("Binghatti Aquarise looks solid.", True)):
        resp = chat.chat(chat.ChatRequest(message="Tell me about Binghatti Aquarise"))
    mock_project_lookup.assert_called_once_with("Binghatti Aquarise", bedrooms=None)
    mock_area_lookup.assert_not_called()
    assert resp.grounded is True


def test_neither_area_nor_project_never_calls_either_lookup():
    """A question with genuinely nothing to look up (e.g. a vague legal
    question) must not call either lookup function — that part is
    unchanged from Beta v0. What changed (UC6 fix): this no longer stays
    an honest no-data case — legal_or_general questions now get a real
    general-knowledge answer instead, via get_legal_knowledge() /
    _answer_legal_general_knowledge(), neither of which touches
    lookup_area_data or lookup_project_data at all."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "lookup_project_data") as mock_project_lookup, \
         patch.object(chat, "get_legal_knowledge", return_value=None), \
         patch.object(chat, "build_answer", return_value=("General legal guidance.", False)):
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
         patch.object(chat, "get_escrow_agent", return_value=None), \
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
         patch.object(chat, "get_escrow_agent", return_value=None), \
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
    assert resp.area == "jumeirah village circle (jvc)"


# ===========================================================================
# unit_count — closes "unit-count / inventory questions" (P2)
# ===========================================================================
def test_unit_count_routes_to_get_unit_inventory():
    fake_inventory = [{"rooms": "Studio", "property_sub_type": "Flat", "unit_count": 446}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "unit_count", "project": "Auresta Tower", "area": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_unit_inventory", return_value=fake_inventory) as mock_inv, \
         patch.object(chat, "build_answer", return_value=("Real inventory.", True)):
        resp = chat.chat(chat.ChatRequest(message="How many units does Auresta Tower have?"))
    mock_inv.assert_called_once_with("Auresta Tower")
    assert resp.grounded is True


def test_unit_count_no_data_gives_honest_fallback():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "unit_count", "project": "Nonexistent Project XYZ", "area": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_unit_inventory", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="How many units in Nonexistent Project XYZ?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


# ===========================================================================
# market_index — closes "no market-index feature" (P2)
# ===========================================================================
def test_market_index_routes_to_get_sale_index_with_property_type():
    fake_index = {"property_type": "villa", "as_of": "2024-05-01",
                  "series": [{"month": "2024-05-01", "index": 1.705, "price_index": 2200000}]}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "market_index", "index_property_type": "villa", "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_sale_index", return_value=fake_index) as mock_index, \
         patch.object(chat, "build_answer", return_value=("Villa index.", True)):
        resp = chat.chat(chat.ChatRequest(message="Show me the villa price index"))
    mock_index.assert_called_once_with(property_type="villa")
    assert resp.grounded is True


def test_market_index_defaults_to_all_when_not_specified():
    fake_index = {"property_type": "all", "as_of": "2024-05-01", "series": []}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "market_index", "index_property_type": None, "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_sale_index", return_value=fake_index) as mock_index, \
         patch.object(chat, "build_answer", return_value=("Index.", True)):
        chat.chat(chat.ChatRequest(message="How has the Dubai market performed historically?"))
    mock_index.assert_called_once_with(property_type="all")


# ===========================================================================
# valuation — closes "valuation claim thinly backed" (P2)
# ===========================================================================
def test_valuation_merges_sale_and_valuation_data():
    fake_sale_data = {"area": "business bay", "avg_price_per_sqm": 27059}
    fake_valuation = {"avg_actual_worth": 2144587, "avg_property_total_value": 2139077,
                      "valuation_count": 3411, "most_recent_valuation": "2026-08-11"}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "valuation", "area": "Business Bay", "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_sale_data) as mock_area_lookup, \
         patch.object(chat, "get_valuation_stats", return_value=fake_valuation) as mock_val, \
         patch.object(chat, "build_answer", return_value=("Business Bay is worth real money.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="What's the valuation in Business Bay?"))
    mock_area_lookup.assert_called_once_with("Business Bay", bedrooms=None)
    mock_val.assert_called_once_with("Business Bay")
    passed_data = mock_build.call_args[0][2]
    assert passed_data["valuation"] == fake_valuation
    assert resp.grounded is True


def test_valuation_no_records_still_returns_sale_data_not_bare_fallback():
    """Same honesty pattern as roi: sale data can exist for an area with
    no valuation records yet -- must return the real sale data, not
    discard it and hit the generic no-data fallback."""
    fake_sale_data = {"area": "some new area", "avg_price_per_sqm": 12000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "valuation", "area": "Some New Area", "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_sale_data), \
         patch.object(chat, "get_valuation_stats", return_value=None), \
         patch.object(chat, "build_answer", return_value=("Sale data only.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="What's the valuation in Some New Area?"))
    passed_data = mock_build.call_args[0][2]
    assert "valuation" not in passed_data
    assert passed_data["avg_price_per_sqm"] == 12000
    assert resp.grounded is True


def test_valuation_no_area_never_calls_valuation_lookup():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "valuation", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data") as mock_area_lookup, \
         patch.object(chat, "get_valuation_stats") as mock_val:
        resp = chat.chat(chat.ChatRequest(message="What's it worth?"))
    mock_area_lookup.assert_not_called()
    mock_val.assert_not_called()
    assert resp.grounded is False


# ===========================================================================
# legal_or_general — closes doc §2.2/§3.7: this question_type existed in
# Stage 2's schema from the start but had ZERO routing branch, so every
# legal/visa/process question fell through to the generic no-data
# fallback (the doc's own confirmed-live finding).
# ===========================================================================
def test_legal_or_general_routes_to_get_legal_knowledge_with_raw_question():
    fake_chunks = [{"title": "Golden Visa eligibility through property investment",
                    "content": "...", "category": "golden_visa", "source_url": "https://example.com",
                    "source_note": "General guidance only..."}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_legal_knowledge", return_value=fake_chunks) as mock_legal, \
         patch.object(chat, "build_answer", return_value=("Golden Visa guidance.", True)):
        resp = chat.chat(chat.ChatRequest(message="Am I eligible for a Golden Visa if I buy property?"))
    mock_legal.assert_called_once_with("Am I eligible for a Golden Visa if I buy property?")
    assert resp.grounded is True


def test_legal_or_general_no_match_routes_to_general_knowledge_not_hardcoded_fallback():
    """UC6 fix: no matched chunk no longer means the hardcoded
    NO_DATA_FALLBACK string — build_answer() now routes this to a real
    general-knowledge answer (grounded=False, guardrail-protected),
    since data=None + question_type="legal_or_general" is exactly the
    case build_answer() intercepts before its generic no-data check."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_legal_knowledge", return_value=None), \
         patch.object(chat, "build_answer", return_value=("General guidance, no specific figures.", False)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="What are typical Dubai inheritance rules for expats?"))
    # data=None reaches build_answer — the real interception (tested
    # directly in test_stage5.py) happens inside build_answer itself,
    # this wiring test only confirms the None-data case reaches it at all.
    mock_build.assert_called_once()
    assert mock_build.call_args[0][2] is None
    assert resp.grounded is False
    assert resp.answer == "General guidance, no specific figures."


def test_legal_or_general_data_shape_reaches_build_answer_unmodified():
    fake_chunks = [{"title": "DLD property transfer fee", "content": "...", "category": "fees",
                    "source_url": None, "source_note": "General guidance only..."}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_legal_knowledge", return_value=fake_chunks), \
         patch.object(chat, "build_answer", return_value=("Fee guidance.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="How much does DLD charge to transfer a property?"))
    passed_data = mock_build.call_args[0][2]
    assert passed_data == {"legal_chunks": fake_chunks}


# ===========================================================================
# user_type resolution — closes doc §3.4 / UC10. Explicit request field
# wins over Stage 2's inference; Stage 2's inference used when no
# explicit field is set; default "investor" when neither is set.
# ===========================================================================
def test_explicit_request_user_type_overrides_stage2_inference():
    fake_data = {"area": "jvc", "avg_price_per_sqm": 16304}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "user_type": "investor",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_data), \
         patch.object(chat, "build_answer", return_value=("Broker numbers.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="What's the price in JVC?", user_type="broker"))
    passed_entities = mock_build.call_args[0][1]
    assert passed_entities["user_type"] == "broker"


def test_stage2_inferred_user_type_used_when_no_explicit_request_field():
    fake_data = {"area": "jvc", "avg_price_per_sqm": 16304}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "user_type": "seller",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_data), \
         patch.object(chat, "build_answer", return_value=("Seller framing.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="What should I list my JVC property at?"))
    passed_entities = mock_build.call_args[0][1]
    assert passed_entities["user_type"] == "seller"


def test_user_type_defaults_to_investor_when_neither_set():
    fake_data = {"area": "jvc", "avg_price_per_sqm": 16304}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "user_type": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_data), \
         patch.object(chat, "build_answer", return_value=("Investor framing.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))
    passed_entities = mock_build.call_args[0][1]
    assert passed_entities["user_type"] == "investor"


def test_user_type_defaults_to_investor_when_stage2_omits_field_entirely():
    """Older-shaped Stage 2 responses (or a mocked test dict) that don't
    even include a "user_type" key must not crash -- .get() safely
    defaults, same as any other optional entity field."""
    fake_data = {"area": "jvc", "avg_price_per_sqm": 16304}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_data), \
         patch.object(chat, "build_answer", return_value=("Investor framing.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))
    passed_entities = mock_build.call_args[0][1]
    assert passed_entities["user_type"] == "investor"
    assert resp.grounded is True


# ===========================================================================
# broker_lookup — closes Part Three §3.1's Broker entity
# ===========================================================================
def test_broker_lookup_routes_to_get_broker_info():
    fake_brokers = [{"broker_name": "SAMUEL STEPHEN VEAL", "phone": None,
                     "license_start_date": "2024-07-22", "license_end_date": "2026-01-30",
                     "is_license_expired": True, "real_estate_number": 546}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "broker_lookup", "broker": "Samuel Stephen Veal", "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_broker_info", return_value=fake_brokers) as mock_broker, \
         patch.object(chat, "build_answer", return_value=("Real broker data.", True)):
        resp = chat.chat(chat.ChatRequest(message="Is broker Samuel Stephen Veal still licensed?"))
    mock_broker.assert_called_once_with("Samuel Stephen Veal")
    assert resp.grounded is True


def test_broker_lookup_no_match_gives_honest_fallback():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "broker_lookup", "broker": "Nonexistent Broker XYZ", "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_broker_info", return_value=None):
        resp = chat.chat(chat.ChatRequest(message="Who is broker Nonexistent Broker XYZ?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


# ===========================================================================
# Fallback logging — closes doc §3.5: "every fallback... logged
# automatically." Must log the genuine no-data case, never a legitimate
# ungrounded answer (e.g. legal_or_general general knowledge), and must
# never crash the response even if the Supabase write itself fails.
# ===========================================================================
def test_genuine_no_data_fallback_gets_logged():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "Some Made Up Area", "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "supabase") as mock_supabase:
        resp = chat.chat(chat.ChatRequest(message="What's the price in Some Made Up Area?"))
    assert resp.answer == chat.NO_DATA_FALLBACK
    mock_supabase.table.assert_called_once_with("chat_fallback_logs")
    inserted = mock_supabase.table.return_value.insert.call_args[0][0]
    assert inserted["question"] == "What's the price in Some Made Up Area?"
    assert "area_report" in inserted["reason"]


def test_legal_or_general_general_knowledge_answer_not_logged_as_fallback():
    """Grounded=False but a REAL, successful answer -- must not be
    logged as if it were a failure."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_legal_knowledge", return_value=None), \
         patch.object(chat, "build_answer", return_value=("Real general guidance, no numbers.", False)), \
         patch.object(chat, "supabase") as mock_supabase:
        resp = chat.chat(chat.ChatRequest(message="What legal protections do off-plan buyers have?"))
    assert resp.answer != chat.NO_DATA_FALLBACK
    mock_supabase.table.assert_not_called()


def test_fallback_logging_failure_never_breaks_the_response():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "Some Made Up Area", "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "supabase") as mock_supabase:
        mock_supabase.table.side_effect = Exception("connection error")
        resp = chat.chat(chat.ChatRequest(message="What's the price in Some Made Up Area?"))
    assert resp.answer == chat.NO_DATA_FALLBACK
    assert resp.grounded is False


# ===========================================================================
# budget_recommendation routing — closes the confirmed-live bug: "I have
# AED 600,000. Which areas should I consider?" had no branch in
# _build_lookup_data() at all, so it fell through to market_overview and
# answered with the citywide average price instead of real areas the
# budget could actually reach.
# ===========================================================================
def test_budget_recommendation_routes_to_dedicated_function_not_market_overview():
    fake_result = {"budget": 600000, "areas": [
        {"area": "Al Warsan First", "transaction_count": 54997, "avg_price_aed": 442483,
         "median_price_aed": 355000, "min_price_aed": 51000, "avg_price_per_sqm": 6827,
         "avg_price_per_sqft": 634, "transactions_under_budget": 47365,
         "pct_transactions_under_budget": 86.1},
    ]}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "budget_recommendation", "budget": 600000, "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_limit": None,
         }), \
         patch.object(chat, "get_budget_area_recommendations", return_value=fake_result) as mock_budget, \
         patch.object(chat, "get_market_overview") as mock_market, \
         patch.object(chat, "build_answer", return_value=("Areas within budget.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="I have AED 600,000. Which areas should I consider?"))

    mock_budget.assert_called_once_with(600000, limit=6)
    mock_market.assert_not_called()
    passed_data = mock_build.call_args[0][2]
    assert passed_data["budget"] == 600000
    assert passed_data["areas"][0]["area"] == "Al Warsan First"
    assert resp.grounded is True


def test_budget_recommendation_respects_explicit_ranking_limit():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "budget_recommendation", "budget": 500000, "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_limit": 3,
         }), \
         patch.object(chat, "get_budget_area_recommendations", return_value=None) as mock_budget, \
         patch.object(chat, "build_answer", return_value=("no areas", False)):
        chat.chat(chat.ChatRequest(message="Where can I invest AED 500k, show me 3 options?"))

    mock_budget.assert_called_once_with(500000, limit=3)


def test_budget_recommendation_no_qualifying_areas_passes_none_to_stage5():
    """Zero-transaction-rule: when get_budget_area_recommendations()
    finds nothing, None must reach Stage 5 as-is (which is what
    triggers its budget-specific honest fallback) — never an empty
    dict or a silently-swapped market_overview result."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "budget_recommendation", "budget": 10000, "area": None,
             "project": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False, "ranking_limit": None,
         }), \
         patch.object(chat, "get_budget_area_recommendations", return_value=None), \
         patch.object(chat, "build_answer", return_value=("no areas fit", False)) as mock_build:
        chat.chat(chat.ChatRequest(message="Which areas can I afford with AED 10,000?"))

    passed_data = mock_build.call_args[0][2]
    assert passed_data is None


def test_named_area_with_budget_stays_area_report_not_budget_recommendation():
    """Disambiguation, confirmed at the wiring level: even if budget is
    present in entities, question_type == 'area_report' (what the model
    should output when an area is also named, per the Stage 2 prompt's
    own rule) must route through the ordinary area lookup, never
    get_budget_area_recommendations."""
    fake_area_data = {"area": "JVC", "avg_price_per_sqm": 16000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "budget": 600000,
             "project": None, "bedrooms": None, "wants_transaction_list": False,
             "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data) as mock_area_lookup, \
         patch.object(chat, "get_budget_area_recommendations") as mock_budget, \
         patch.object(chat, "build_answer", return_value=("JVC report.", True)):
        chat.chat(chat.ChatRequest(message="Is JVC affordable for 600k?"))

    mock_area_lookup.assert_called_once_with("JVC", bedrooms=None)
    mock_budget.assert_not_called()


# ===========================================================================
# Gap-closing wiring tests: buyer price_comparison, tenant rent_comparison,
# developer project-vs-project comparison routing. See doc §3.4 coverage
# audit. Each pct_diff is computed here in Python from two real numbers —
# never by the model — same discipline as gross_yield_pct in the roi branch.
# ===========================================================================
def test_buyer_asking_price_computes_real_price_comparison():
    fake_area_data = {"area": "JVC", "avg_price_per_sqm": 16000, "avg_actual_worth": 1100000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "project": None,
             "asking_price": 1400000, "user_type": "buyer", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data), \
         patch.object(chat, "build_answer", return_value=("Above typical.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="Is 1.4M fair for a 1BR in JVC?"))

    passed_data = mock_build.call_args[0][2]
    assert passed_data["price_comparison"]["asking_price"] == 1400000
    assert passed_data["price_comparison"]["typical_price"] == 1100000
    assert passed_data["price_comparison"]["pct_diff"] == round((1400000 - 1100000) / 1100000 * 100, 1)


def test_buyer_price_comparison_prefers_bedroom_specific_typical_price():
    """Like-for-like: if a bedroom breakdown exists, compare against
    THAT typical price, not the area-wide blended average."""
    fake_area_data = {
        "area": "JVC", "avg_actual_worth": 1100000,
        "bedroom_breakdown": {"bedrooms": 1, "avg_actual_worth": 950000},
    }
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "project": None,
             "asking_price": 1000000, "user_type": "buyer", "bedrooms": 1,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data), \
         patch.object(chat, "build_answer", return_value=("Roughly in line.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="Is 1M fair for a 1BR in JVC?"))

    passed_data = mock_build.call_args[0][2]
    assert passed_data["price_comparison"]["typical_price"] == 950000  # bedroom-specific, not 1100000


def test_no_asking_price_never_adds_price_comparison():
    """A buyer question with no stated price must not get a fabricated
    comparison — price_comparison should simply be absent."""
    fake_area_data = {"area": "JVC", "avg_actual_worth": 1100000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "project": None,
             "asking_price": None, "user_type": "buyer", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data), \
         patch.object(chat, "build_answer", return_value=("JVC report.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="What's the average price in JVC?"))

    passed_data = mock_build.call_args[0][2]
    assert "price_comparison" not in passed_data


def test_tenant_rent_amount_computes_real_rent_comparison():
    fake_area_data = {"area": "JVC", "avg_price_per_sqm": 16000}
    fake_rental = {"avg_annual_rent": 58000, "avg_rent_per_sqm": 1200, "contract_count": 210}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "project": None,
             "rent_amount": 65000, "user_type": "tenant", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data), \
         patch.object(chat, "get_rental_yield", return_value=fake_rental) as mock_rental, \
         patch.object(chat, "build_answer", return_value=("Above typical rent.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="Is 65k a fair rent for my JVC apartment?"))

    mock_rental.assert_called_once_with("JVC", bedrooms=None)
    passed_data = mock_build.call_args[0][2]
    assert passed_data["rent_comparison"]["rent_amount"] == 65000
    assert passed_data["rent_comparison"]["typical_rent"] == 58000
    assert passed_data["rent_comparison"]["pct_diff"] == round((65000 - 58000) / 58000 * 100, 1)


def test_no_rent_amount_never_calls_get_rental_yield():
    """The most important guard here: a tenant question with NO stated
    rent must not trigger an extra get_rental_yield() fetch at all —
    same no-unwanted-cost discipline that caused gap #1 to be reverted.
    This one only fires when the user actually gave a real signal."""
    fake_area_data = {"area": "JVC", "avg_price_per_sqm": 16000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "project": None,
             "rent_amount": None, "user_type": "tenant", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data), \
         patch.object(chat, "get_rental_yield") as mock_rental, \
         patch.object(chat, "build_answer", return_value=("JVC report.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="What's the vibe like in JVC?"))

    mock_rental.assert_not_called()
    passed_data = mock_build.call_args[0][2]
    assert "rent_comparison" not in passed_data


def test_non_buyer_with_asking_price_does_not_compute_price_comparison():
    """user_type gates this, not just the presence of asking_price — an
    investor question that happens to mention a price shouldn't get
    buyer-shaped output."""
    fake_area_data = {"area": "JVC", "avg_actual_worth": 1100000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "project": None,
             "asking_price": 1400000, "user_type": "investor", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data), \
         patch.object(chat, "build_answer", return_value=("JVC report.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="Thinking about JVC, saw a unit at 1.4M"))

    passed_data = mock_build.call_args[0][2]
    assert "price_comparison" not in passed_data


def test_developer_project_comparison_routes_to_project_comparison_not_default_lookup():
    fake_comparison = {"comparison": [
        {"project": "Binghatti Aquarise", "area": "Business Bay", "avg_price_per_sqm": 18000},
        {"project": "Sobha Hartland", "area": "MBR City", "avg_price_per_sqm": 22000},
    ]}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "comparison", "project": "Binghatti Aquarise",
             "project2": "Sobha Hartland", "area": None, "area2": None,
             "user_type": "developer", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_project_comparison_data", return_value=fake_comparison) as mock_proj_cmp, \
         patch.object(chat, "lookup_project_data") as mock_single_lookup, \
         patch.object(chat, "build_answer", return_value=("Sobha commands a premium.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="How's Binghatti Aquarise doing against Sobha Hartland?"))

    mock_proj_cmp.assert_called_once_with("Binghatti Aquarise", "Sobha Hartland", bedrooms=None)
    mock_single_lookup.assert_not_called()  # must not also/instead hit the single-project default path
    passed_data = mock_build.call_args[0][2]
    assert passed_data["comparison"][0]["project"] == "Binghatti Aquarise"


def test_area_comparison_unaffected_by_project_comparison_routing():
    """Regression guard: adding project-vs-project routing must not
    change ordinary area-vs-area comparison behavior at all."""
    fake_comparison = {"comparison": [{"area": "JVC"}, {"area": "Dubai Marina"}]}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "comparison", "project": None, "project2": None,
             "area": "JVC", "area2": "Dubai Marina", "user_type": "investor", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_comparison_data", return_value=fake_comparison) as mock_area_cmp, \
         patch.object(chat, "lookup_project_comparison_data") as mock_proj_cmp, \
         patch.object(chat, "build_answer", return_value=("JVC edges out.", True)):
        chat.chat(chat.ChatRequest(message="JVC vs Dubai Marina?"))

    mock_area_cmp.assert_called_once_with("JVC", "Dubai Marina", bedrooms=None)
    mock_proj_cmp.assert_not_called()


# ===========================================================================
# service_charges routing — closes the highest-value coverage-audit
# finding: owners_association_charges (89,125 real rows) was fully
# loaded and completely unused before this.
# ===========================================================================
def test_service_charges_routes_to_dedicated_function():
    fake_result = {
        "matched_project": "TENORA", "master_community": "Dubai Marina",
        "budget_year": 2023, "usage": "Residential", "n_property_groups": 18,
        "median_charge_per_sqft": 13.5, "min_charge_per_sqft": 5,
        "max_charge_per_sqft": 19, "n_excluded_outliers": 2,
    }
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "service_charges", "project": "Tenora", "area": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_service_charges", return_value=fake_result) as mock_sc, \
         patch.object(chat, "build_answer", return_value=("Tenora's charge is real.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="What are the service charges in Tenora?"))

    mock_sc.assert_called_once_with("Tenora", usage="Residential")
    passed_data = mock_build.call_args[0][2]
    assert passed_data["median_charge_per_sqft"] == 13.5
    assert resp.grounded is True


def test_service_charges_no_project_never_calls_get_service_charges():
    """Guard against the disambiguation gap: if Stage 2 somehow returns
    service_charges with no project (shouldn't happen per its own
    prompt rule, but defended here anyway), this must not call the
    lookup with an empty/None project."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "service_charges", "project": None, "area": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_service_charges") as mock_sc, \
         patch.object(chat, "build_answer", return_value=("no data", False)) as mock_build:
        chat.chat(chat.ChatRequest(message="What are typical service charges?"))

    mock_sc.assert_not_called()
    passed_data = mock_build.call_args[0][2]
    assert passed_data is None


def test_service_charges_no_data_passes_none_to_stage5():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "service_charges", "project": "Nonexistent Tower", "area": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_service_charges", return_value=None), \
         patch.object(chat, "build_answer", return_value=("no data", False)) as mock_build:
        chat.chat(chat.ChatRequest(message="Service charges for Nonexistent Tower?"))

    passed_data = mock_build.call_args[0][2]
    assert passed_data is None


# ===========================================================================
# NEW FUNCTIONALITY — escrow agent enrichment, end-to-end through chat.chat().
# Covers both call sites (default project_price path and the roi branch),
# the found/not-found/no-project cases, and — critically — that an
# area-only question NEVER triggers this new lookup at all. Does not
# modify any assertion in any pre-existing test in this file; the three
# pre-existing tests that now also mock get_escrow_agent (see above) had
# their explicit mock added solely because they exercise the same code
# path this appends to, so they stay deterministic — their own original
# assertions are untouched.
# ===========================================================================
def test_default_project_lookup_attaches_escrow_agent_when_found():
    fake_project_data = {"project": "Emirates Living - Springs 10", "area": "Emirates Living",
                          "avg_price_per_sqm": 15000}
    fake_escrow = {"project": "Emirates Living - Springs 10",
                   "escrow_agent_name": "MASHREQ BANK PSC", "escrow_agent_phone": None}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": None, "project": "Emirates Living - Springs 10",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_project_data", return_value=fake_project_data), \
         patch.object(chat, "get_escrow_agent", return_value=fake_escrow) as mock_escrow, \
         patch.object(chat, "build_answer", return_value=("Springs 10 pricing found.", True)) as mock_build:
        resp = chat.chat(chat.ChatRequest(message="Tell me about Emirates Living - Springs 10"))

    mock_escrow.assert_called_once_with("Emirates Living - Springs 10")
    passed_data = mock_build.call_args[0][2]
    assert passed_data["escrow_agent"]["escrow_agent_name"] == "MASHREQ BANK PSC"
    # Original behavior fully intact — the real sale numbers are untouched.
    assert passed_data["avg_price_per_sqm"] == 15000
    assert resp.grounded is True


def test_default_project_lookup_omits_escrow_agent_when_not_found():
    """Confirmed live: ~45% of projects have no escrow_agent_id on file.
    Must fall back to exactly the pre-existing behavior — no
    "escrow_agent" key at all, nothing else in `data` disturbed."""
    fake_project_data = {"project": "Some Project", "area": "Some Area", "avg_price_per_sqm": 10000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": None, "project": "Some Project",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_project_data", return_value=fake_project_data), \
         patch.object(chat, "get_escrow_agent", return_value=None), \
         patch.object(chat, "build_answer", return_value=("Some Project pricing found.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="Tell me about Some Project"))

    passed_data = mock_build.call_args[0][2]
    assert "escrow_agent" not in passed_data
    assert passed_data["avg_price_per_sqm"] == 10000


def test_default_area_only_lookup_never_calls_escrow_agent():
    """The new lookup is project-scoped only — an area-only question
    (no project named) must never trigger it at all."""
    fake_area_data = {"area": "jvc", "avg_price_per_sqm": 16000}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_area_data), \
         patch.object(chat, "get_escrow_agent") as mock_escrow, \
         patch.object(chat, "build_answer", return_value=("JVC pricing found.", True)):
        chat.chat(chat.ChatRequest(message="What's the price in JVC?"))

    mock_escrow.assert_not_called()


def test_default_no_project_or_area_never_calls_escrow_agent():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": None, "project": None,
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_escrow_agent") as mock_escrow, \
         patch.object(chat, "build_answer", return_value=(chat.NO_DATA_FALLBACK, False)):
        resp = chat.chat(chat.ChatRequest(message="What's a good deal?"))

    mock_escrow.assert_not_called()
    assert resp.grounded is False


def test_roi_with_project_attaches_escrow_agent():
    fake_sale_data = {"area": "business bay", "avg_price_per_sqm": 15501}
    fake_rental_data = {"avg_annual_rent": 80000, "avg_rent_per_sqm": 1050, "contract_count": 12,
                        "most_recent_contract_start": "2026-06-01"}
    fake_escrow = {"project": "Auresta Tower",
                   "escrow_agent_name": "EMIRATES NBD BANK  (P.J.S.C)", "escrow_agent_phone": None}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "roi", "area": None, "project": "Auresta Tower", "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_project_data", return_value=fake_sale_data), \
         patch.object(chat, "get_rental_yield", return_value=fake_rental_data), \
         patch.object(chat, "get_escrow_agent", return_value=fake_escrow) as mock_escrow, \
         patch.object(chat, "build_answer", return_value=("Auresta Tower yields well.", True)) as mock_build:
        chat.chat(chat.ChatRequest(message="What's the ROI on Auresta Tower?"))

    mock_escrow.assert_called_once_with("Auresta Tower")
    passed_data = mock_build.call_args[0][2]
    # Both enrichments present together — one doesn't crowd out the other.
    assert passed_data["escrow_agent"]["escrow_agent_name"] == "EMIRATES NBD BANK  (P.J.S.C)"
    assert passed_data["rental_yield"]["avg_annual_rent"] == 80000


def test_roi_area_only_never_calls_escrow_agent():
    """roi with an area (no project) must never call the new lookup —
    escrow is a per-project fact, not an area-level one."""
    fake_sale_data = {"area": "jvc", "avg_price_per_sqm": 16000}
    fake_rental_data = {"avg_annual_rent": 85000, "avg_rent_per_sqm": 1088, "contract_count": 640,
                        "most_recent_contract_start": "2026-07-15"}
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "roi", "area": "JVC", "project": None, "bedrooms": None,
             "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "lookup_area_data", return_value=fake_sale_data), \
         patch.object(chat, "get_rental_yield", return_value=fake_rental_data), \
         patch.object(chat, "get_escrow_agent") as mock_escrow, \
         patch.object(chat, "build_answer", return_value=("JVC yields well.", True)):
        chat.chat(chat.ChatRequest(message="What's the rental yield in JVC?"))

    mock_escrow.assert_not_called()


def test_other_question_types_never_call_escrow_agent():
    """Sanity check that the new lookup is scoped to exactly the two
    branches it was added to — a question_type with its own dedicated
    early-return branch (developer_lookup here) must never reach it."""
    fake_projects = [{"project": "Binghatti Aquarise", "developer_id": 1, "area": "Business Bay",
                       "transaction_count": 10, "avg_ppsqm": 20000}]
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "developer_lookup", "area": None, "project": None, "developer": "Binghatti",
             "bedrooms": None, "wants_transaction_list": False, "wants_trend": False,
         }), \
         patch.object(chat, "get_developer_projects", return_value=fake_projects), \
         patch.object(chat, "get_developer_info", return_value=None), \
         patch.object(chat, "get_escrow_agent") as mock_escrow, \
         patch.object(chat, "build_answer", return_value=("Binghatti overview.", True)):
        chat.chat(chat.ChatRequest(message="Latest Binghatti project?"))

    mock_escrow.assert_not_called()

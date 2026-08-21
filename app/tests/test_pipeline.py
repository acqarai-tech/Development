"""
Beta v0's foundation must pass T1, T4, T8, T15 (Section 6) — this file
proves that. Beta v1 (multi-turn, T6/T7) is built on top of this, in
ai_chat.py + stage3_detect_followup.py; see tests/test_wiring.py and
tests/test_stage3.py for those.
Run with:  pytest -v

Per Section 9.1, each test should pass 9/10 times on repeated runs, not
just once — for CI, consider running with `pytest --count=10` (pytest-repeat)
once these are stable, especially for anything hitting the real model.

These tests mock Groq and Supabase so they run offline/free. They test the
PIPELINE's logic (guardrails, fallback behavior), not the LLM's judgement —
the LLM's actual answer quality still needs the manual "~30 fresh questions"
spot-check from Section 9.1, which can't be automated.
"""
import json
from unittest.mock import patch, MagicMock

import pytest

import ai_chat as chat


# ---------------------------------------------------------------------------
# T1 — known single area returns a grounded, real-data answer
# ---------------------------------------------------------------------------
def test_t1_known_area_is_grounded():
    fake_row = {"area": "jvc", "avg_price_sqft": 1050, "rental_yield": 7.2}

    with patch.object(chat, "lookup_area_data", return_value=fake_row), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=(
             "JVC's rental yield is 7.2% with avg price AED 1,050/sqft.", True
         )):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying in 2026?"))

    assert resp.grounded is True
    assert resp.area == "jumeirah village circle (jvc)"
    assert "1,050" in resp.answer or "7.2" in resp.answer


# ---------------------------------------------------------------------------
# T4 — named project/area with genuinely no data -> honest fallback, zero invention
# ---------------------------------------------------------------------------
def test_t4_no_data_never_invents_numbers():
    with patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": None, "bedrooms": 1, "budget": None
         }):
        resp = chat.chat(chat.ChatRequest(message="Price of Tiger Sky Tower for a 1BR?"))

    assert resp.grounded is False
    assert "don't have verified data" in resp.answer
    # zero invented figures
    assert not any(ch.isdigit() for ch in resp.answer)


# ---------------------------------------------------------------------------
# T8 — zero data anywhere: never styled with a "here's the data" framing,
# even if the model tries to hallucinate — the guardrail must catch it.
# ---------------------------------------------------------------------------
def test_t8_guardrail_catches_hallucinated_numbers_on_ungrounded_answer():
    with patch.object(chat, "lookup_area_data", return_value=None), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=("Yields here run AED 1,200 per sq ft.", False)):
        resp = chat.chat(chat.ChatRequest(message="Some question with no matching data"))

    # guardrail should have intercepted the fabricated-looking ungrounded
    # answer and replaced it with the honest fallback
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


# ---------------------------------------------------------------------------
# UC6 hardening — confirmed live, same day, that the original guardrail
# pattern only caught AED amounts/percentages/"per sq ft", missing law
# citations and deadlines entirely. "Under Article 3 of Law No. 7, you
# must register within 30 days" slipped through completely undetected
# before this fix -- no AED figure, no %, nothing matched.
# ---------------------------------------------------------------------------
def test_guardrail_catches_fabricated_law_article_citation():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=(
             "Under Article 3 of Law No. 7, foreigners may own freehold property.", False)):
        resp = chat.chat(chat.ChatRequest(message="What law allows foreign property ownership?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_guardrail_catches_fabricated_deadline():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=(
             "You must register the tenancy contract within 30 days.", False)):
        resp = chat.chat(chat.ChatRequest(message="How does Ejari registration work?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_guardrail_catches_fabricated_calendar_date():
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=(
             "This regulation must be complied with by March 2027.", False)):
        resp = chat.chat(chat.ChatRequest(message="When does this rule take effect?"))
    assert resp.grounded is False
    assert resp.answer == chat.NO_DATA_FALLBACK


def test_guardrail_allows_well_hedged_general_knowledge_through():
    """The point of this fix isn't to block every ungrounded answer --
    only ones with fabricated specifics. A properly hedged answer with
    no invented numbers, laws, or dates must pass through untouched."""
    with patch.object(chat, "extract_entities", return_value={
             "question_type": "legal_or_general", "area": None, "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=(
             "Off-plan buyer protections generally center on escrow accounts, which protect "
             "buyers if a project stalls. This is general knowledge, not verified DLD data. "
             "Confirm specifics with a licensed lawyer before relying on this.", False)):
        resp = chat.chat(chat.ChatRequest(message="What protections do off-plan buyers have?"))
    assert resp.grounded is False
    assert resp.answer != chat.NO_DATA_FALLBACK
    assert "escrow" in resp.answer


# ---------------------------------------------------------------------------
# T15 — console/response cleanliness: no leaked internal errors
# ---------------------------------------------------------------------------
def test_t15_leaked_error_is_caught_by_guardrail():
    with patch.object(chat, "lookup_area_data", return_value={"area": "jvc"}), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "area_report", "area": "JVC", "bedrooms": None, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=("Traceback (most recent call last): KeyError", True)):
        resp = chat.chat(chat.ChatRequest(message="Is JVC worth buying?"))

    assert resp.grounded is False
    assert "Traceback" not in resp.answer


# ---------------------------------------------------------------------------
# Empty message handling (basic input validation, not in Section 8 but cheap)
# ---------------------------------------------------------------------------
def test_empty_message_rejected():
    from fastapi import HTTPException
    with pytest.raises(HTTPException):
        chat.chat(chat.ChatRequest(message="   "))


# ===========================================================================
# The rest of Section 8's 16 tests. Beta v0 only NEEDS T1, T4, T8, T15 green
# (above) — but every test in Section 8 gets written now, not invented later.
# The ones below are skipped with a reason pointing at the Beta phase that
# will make them buildable. When you build that phase, delete the
# @pytest.mark.skip line and make the test actually pass — don't write a
# new test from scratch, this one is already thought through.
# ===========================================================================

@pytest.mark.skip(reason="IMPLEMENTED — see test_t2_two_area_comparison_shows_both_sides in "
                         "tests/test_wiring.py, and stage4/stage5's own comparison tests. Kept per "
                         "Section 5.4's own guidance (point at where it now lives, don't rewrite it).")
def test_t2_two_area_comparison_shows_both_sides():
    """
    T2 — "Dubai Hills Estate or Dubai Marina, long-term?"
    Expected: real numbers shown for BOTH areas, explicit comparison, no
    "X is in Y, not Z" confusion. Section 5.1 Stage 4 says this must be a
    first-class case, not bolted on later.
    """
    raise NotImplementedError


@pytest.mark.skip(reason="IMPLEMENTED — see test_t3_named_project_with_data_uses_project_numbers in "
                         "tests/test_wiring.py, and stage4's lookup_project_data tests.")
def test_t3_named_project_with_data_uses_project_numbers():
    """
    T3 — a project that actually exists in the DB.
    Expected: project-specific numbers, NOT area-wide numbers presented as
    if they were project-specific (that mislabeling was one of Section 4's
    real bugs).
    """
    raise NotImplementedError


@pytest.mark.skip(reason="IMPLEMENTED — see test_t5_developer_lookup_uses_real_track_record in "
                         "tests/test_wiring.py, and stage4/stage5's own developer-lookup tests.")
def test_t5_developer_lookup_uses_real_track_record():
    """
    T5 — "Latest Binghatti project?"
    Expected: uses real developer/project data if available; honest
    disclosure if not. Must never silently substitute an unrelated area's
    report (the exact failure this test is named after).
    """
    raise NotImplementedError


@pytest.mark.skip(reason="IMPLEMENTED — see test_t6_multiturn_genuine_topic_change in "
                         "tests/test_wiring.py, and Stage 3's own tests in tests/test_stage3.py. "
                         "This stub is kept per Section 5.4's own guidance (don't rewrite the "
                         "already-thought-through test, just point at where it now lives) rather "
                         "than deleted, so this file's original structure stays intact.")
def test_t6_multiturn_genuine_topic_change_reresolves_fresh():
    """
    T6 — ask about JVC, then ask "latest Binghatti project?" in the same
    session. Expected: re-resolves fresh for the new question, does NOT
    repeat the JVC answer.
    """
    raise NotImplementedError


@pytest.mark.skip(reason="IMPLEMENTED — see test_t7_multiturn_genuine_followup in "
                         "tests/test_wiring.py, and Stage 3's own tests in tests/test_stage3.py.")
def test_t7_multiturn_genuine_followup_carries_area_forward():
    """
    T7 — ask about JVC, then "what about the yield there?" in the same
    session. Expected: correctly carries JVC forward. This is the
    complement to T6 — both must work, not just one.
    """
    raise NotImplementedError


@pytest.mark.skip(reason="Needs Beta v3 (anonymous-visitor decision) — not yet made by Ubaid, see Section 6/11")
def test_t9_anonymous_visitor_flow_matches_business_decision():
    """
    T9 — ask any question while logged out.
    Expected: matches whatever business decision UC7 lands on
    (rate-limited real answer vs. hard gate) — deliberately, not
    accidentally, the way it works today.
    """
    raise NotImplementedError


@pytest.mark.skip(reason="Needs Beta v3 (advisor popup + reliable grounded-based trigger) — not built yet")
def test_t10_advisor_popup_fires_only_on_grounded_answers():
    """
    T10 — a genuinely well-grounded answer vs. an ungrounded one.
    Expected: popup fires on the grounded case, does not fire on the
    ungrounded case. Note: chat.py's `grounded` flag already exists and is
    the field this future test will assert on — the flag was built in
    Beta v0 specifically so this test is easy to write later.
    """
    raise NotImplementedError


@pytest.mark.skip(reason="Needs Beta v3 (advisor popup UI + leads table wiring in this new pipeline)")
def test_t11_advisor_yes_flow_creates_lead_row():
    """
    T11 — click "Yes" on the advisor popup, logged in with a saved profile.
    Expected: a row is correctly created in the `leads` table and the user
    sees confirmation. Already confirmed working in the OLD pipeline today
    — this test exists so the new pipeline doesn't regress it.
    """
    raise NotImplementedError


@pytest.mark.skip(reason="Needs Beta v3 (advisor popup 'no' next-step flow) — not built yet")
def test_t12_advisor_no_flow_offers_real_next_step():
    """
    T12 — click "No" on the advisor popup.
    Expected: a real next step appears (subscription offer, saved report,
    something) — not a dead end, which is what happens today.
    """
    raise NotImplementedError


@pytest.mark.skip(reason="Needs a legal_or_general answer branch — chat.py currently just says 'no data' for these")
def test_t13_legal_question_never_invents_law_or_deadline():
    """
    T13 — a Golden Visa eligibility or off-plan legal-protection question.
    Expected: no invented law/article numbers, no invented deadlines or
    AED thresholds — general, hedged, accurate guidance instead.
    NOTE: chat.py's current NO_DATA_FALLBACK technically can't fail this
    (it invents nothing), but it also doesn't actually help the user —
    the richer "general knowledge, clearly labeled" branch from Section
    5.1 Stage 5 needs to exist before this test means anything real.
    """
    raise NotImplementedError


@pytest.mark.skip(
    reason="IMPLEMENTED — see test_exclude_outliers_* and "
           "test_lookup_area_data_excludes_price_outlier_from_headline_average / "
           "test_lookup_project_data_excludes_worth_outlier_from_headline_average in "
           "tests/test_stage4.py, plus test_prompt_documents_n_outliers_excluded_honestly "
           "in tests/test_stage5.py. Kept per Section 5.4's own guidance (point at where "
           "it now lives, don't rewrite it)."
)
def test_t14_outlier_transaction_does_not_skew_headline_number():
    """
    T14 — any area/project with a known bad row in the underlying data.
    Expected: extreme outliers don't render as headline "real" figures.
    chat.py currently averages ALL matching rows with no filtering — a
    single AED 1 typo or AED 999,000,000 outlier would currently distort
    avg_price_per_sqm / avg_actual_worth silently.
    """
    raise NotImplementedError


@pytest.mark.skip(reason="Needs Beta v4 / a security pass — RLS gaps on 10 tables confirmed live, not yet fixed")
def test_t16_sensitive_tables_not_readable_with_anon_key():
    """
    T16 — query sensitive tables using only the public anon key.
    Expected: tables with RLS gaps (including private_messages) are no
    longer publicly readable/writable.
    CONFIRMED LIVE (via direct Supabase inspection): 10 tables currently
    have RLS disabled, including avm_project_overrides, private_messages,
    New_Properties, discount_codes, developer_track_record,
    developer_track_records, price_history_manual, area_shock_impacts,
    area_votes, blogs. This is a real, present security hole — see the
    remediation SQL already shared, which still needs real RLS POLICIES
    written (not just ENABLE ROW LEVEL SECURITY) before it's safe to run.
    """
    raise NotImplementedError


# ===========================================================================
# Bonus: T17 — a NEW test case, added per Section 8's own instruction that
# "this list should keep growing" whenever a real conversation surfaces a
# gap the checklist didn't cover. Found live: asking for a bedroom-specific
# price causes the model to invent a sqm-size assumption and multiply it by
# a real area-wide average — a fabricated number wearing real data's
# clothes, which slipped past the existing guardrail because the guardrail
# only checks ungrounded responses for data-shaped numbers.
# ===========================================================================

@pytest.mark.xfail(reason="Known live bug — build_answer() invents unit-size assumptions for bedroom-specific questions. Fix the prompt, then remove this xfail.", strict=True)
def test_t17_no_unmodeled_breakdown_gets_invented():
    """
    T17 — a question asks for a breakdown the data doesn't actually support
    (e.g. price by bedroom count, when avm only has area-wide averages).
    Expected: the answer states the area-wide average and says plainly that
    a bedroom-specific number isn't available — it must NOT estimate a
    sqm size and multiply it by the area average to produce a specific
    invented price.
    This test currently documents the gap (xfail) until the build_answer()
    prompt is tightened to forbid unmodeled-assumption arithmetic.
    """
    fake_area_data = {
        "area": "Jumeirah Village Circle (JVC)",
        "transaction_sample_size": 500,
        "avg_price_per_sqm": 16327,
        "avg_actual_worth": 1684639,
        "most_recent_transaction_date": "2026-07-13",
    }
    # This mirrors the real answer text observed live — captured here as a
    # regression fixture so future prompt changes can be checked against it.
    observed_bad_answer = (
        "Using the average price per square meter: 16327 AED/sqm "
        "For a 70 square meter apartment (a rough midpoint of our estimate): "
        "16327 AED/sqm * 70 sqm = 1,142,890 AED"
    )

    with patch.object(chat, "lookup_area_data", return_value=fake_area_data), \
         patch.object(chat, "extract_entities", return_value={
             "question_type": "project_price", "area": "JVC", "bedrooms": 1, "budget": None
         }), \
         patch.object(chat, "build_answer", return_value=(observed_bad_answer, True)):
        resp = chat.chat(chat.ChatRequest(message="What is the price of 1 br in JVC"))

    # An invented sqm assumption multiplied into a specific price is exactly
    # the pattern this test guards against.
    assert "square meter apartment" not in resp.answer.lower(), (
        "build_answer() is estimating an un-modeled unit size and "
        "presenting the result as a real figure — tighten the prompt in "
        "build_answer() to refuse bedroom/unit-size breakdowns the data "
        "doesn't actually contain."
    )

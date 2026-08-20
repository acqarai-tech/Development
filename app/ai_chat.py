"""
chat.py — Acqar /chat Beta v1 pipeline (router only)
=====================================================
THIS IS BETA v1 — the extended version of Beta v0, with all of Beta v0
included and unchanged underneath it, not a separate parallel version.
Every Beta v0 gate test (T1, T4, T8, T15) still passes exactly as
before; Beta v1 adds multi-turn conversation on top (T6, T7) without
touching how any of those four behave.

This file does NOT define Stage 2, 3, 4, or 5 itself — they were already
built and verified independently (see stage2_extract_entities.py,
stage3_detect_followup.py, stage4_lookup_area_data.py,
stage5_build_answer.py, each with its own passing test file). This
file's only job is Stage 1 (receive), wiring Stage 3's follow-up
decision into Stage 2's output, routing to the right Stage 4 lookup
based on question_type, Stage 6 (guardrails), and tying everything
together behind one endpoint.

NOTE ON FILENAME: this file is imported elsewhere in the live app as
`ai_chat` (see app.py: `from ai_chat import router as ai_chat_router`).
The test suite imports it as `import chat` — keep a `chat.py` that does
`from ai_chat import *` alongside this file (or rename the test imports)
so `pytest` collects cleanly from a fresh checkout. See repo review notes.

Mount into your EXISTING FastAPI app:

    from ai_chat import router as ai_chat_router
    app.include_router(ai_chat_router)

Copy clients.py, stage2_extract_entities.py, stage3_detect_followup.py,
stage4_lookup_area_data.py, and stage5_build_answer.py alongside this
file — chat.py imports from all five.

CHANGE LOG (this version — Beta v1, adds multi-turn on top of Beta v0):
- ChatRequest gained `history` — a list of prior turns
  ({"message": str, "entities": dict}), sent by the client with each
  request (this API is stateless; no server-side session store). Empty
  or omitted history behaves EXACTLY like Beta v0 — Stage 3 short-
  circuits to is_followup=False with nothing to follow up on, so every
  existing Beta v0 test (T1, T4, T8, T15) is unaffected.
- Stage 2 still runs on ONLY the current raw message, exactly as before
  — it stays honestly ignorant of history, per Stage 3's own design
  rationale (see stage3_detect_followup.py's docstring).
- Stage 3 runs AFTER Stage 2, decides is_followup for real (previously
  always hardcoded False, per Stage 2's old comment: "Stage 3 sets this
  for real, and Stage 3 doesn't exist yet in Beta v0" — it exists now).
- Merge rule: Stage 3's carried_area/carried_project/carried_bedrooms
  only fill entities Stage 2 left as None — they NEVER overwrite
  something Stage 2 actually found in the current message. This is what
  makes T6 (topic change) and T7 (genuine follow-up) both work: a new
  message that names its own subject always wins on its own merits;
  only a message with nothing of its own gets the previous context.
- CRITICAL: neither Stage 3 nor this merge step ever rewrites `question`
  itself — the exact raw string Stage 2 ran on is the exact same string
  passed to Stage 5 and returned in debug output, untouched, all the way
  through. This is the rule that prevented this project's #1 historical
  bug (see stage3_detect_followup.py's docstring for the full story).
"""
import re
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from clients import logger, normalize_area, supabase
from stage2_extract_entities import extract_entities
from stage3_detect_followup import detect_followup
from entity_registry import get, compare, rank, lookup, market_signal, recent_transactions, price_trend
from stage5_build_answer import build_answer, NO_DATA_FALLBACK

router = APIRouter()


# CONFIRMED LIVE BUG: "tell the top 10 brokers" (and any "best/top brokers"
# phrasing with no specific name) was silently swallowed by the generic
# NO_DATA_FALLBACK ("I'm sorry, but I can't help with that."), identical to
# what a real bug looks like to an investor.
#
# Root cause, verified against the actual code path:
#   1. Stage 2 has no ranking question_type for brokers at all (only
#      top_areas_ranking / top_projects_ranking / top_developers_ranking
#      exist) — "brokers" in the question makes it classify as
#      question_type="broker_lookup", but with broker=None, since no
#      specific name was given.
#   2. get_broker_info(None) in stage4 correctly returns None by design
#      (see its own docstring: "Returns None if no broker text given").
#   3. This is NOT purely a routing bug — real_estate_brokers (DLD Dataset
#      18) is a license registry (name, phone, license dates). It has no
#      transaction-volume or performance column at all, so there is
#      currently no real number to rank brokers BY, even with perfect
#      classification. Building a "top brokers" ranking would mean
#      guessing at a metric that doesn't exist in the data — exactly what
#      Gate 1 (§3.6) forbids.
#
# The honest fix is not to fabricate a ranking, but to recognize this
# specific, answerable-as-a-known-gap case and say so specifically,
# instead of falling through to the fully generic fallback. This is a
# deterministic string, not an LLM-synthesized one — there is nothing for
# Stage 5 to reason about here, so it's short-circuited before Stage 5
# ever runs, the same way NO_DATA_FALLBACK itself is a fixed constant.
BROKER_RANKING_UNAVAILABLE_MESSAGE = (
    "I don't have a way to rank brokers yet — Acqar's broker data comes from DLD's "
    "license registry, which has names, license status, and contact details, but no "
    "deal volume or performance figures to rank by. I can look up a specific broker "
    "by name if you have one in mind."
)


class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = None
    # Doc §3.4 (user-type framing): optional today because no frontend
    # persona selector exists yet — when one does, this field lets it
    # override Stage 2's inference outright. Until then, Stage 2 infers
    # from the question's own wording when there's a real signal, and
    # falls back to "investor" (today's only behavior) otherwise.
    user_type: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    grounded: bool
    area: Optional[str] = None
    chart_data: Optional[list] = None
    debug: Optional[dict] = None


def receive_question(raw_message: str) -> str:
    """Stage 1. Section 5.4 habit #3: never modify the user's original message."""
    return raw_message.strip()


class GuardrailFailure(Exception):
    pass


def run_guardrails(answer: str, grounded: bool) -> None:
    """Stage 6. Corresponds to Beta v0's gate tests (T1, T4, T8, T15) — Beta v0 is the
    foundation Beta v1 is built on, not a separate version; these must keep passing.

    CONFIRMED LIVE BUG, found and fixed same day: the original pattern
    below only caught AED amounts, percentages, and "per sq ft" — built
    for property-data hallucination, not legal-content hallucination.
    The legal_or_general general-knowledge path (UC6) specifically
    forbids THREE things: a law/article number, a specific deadline, and
    a monetary threshold — but this guardrail only ever enforced the
    third one. Verified live before this fix: "Under Article 3 of Law
    No. 7, you must register within 30 days" slipped through completely
    undetected (no AED figure, no %, no "per sq ft" — nothing matched).
    Added law/article/decree citation and deadline/date patterns so all
    three forbidden categories are actually enforced by code, not just
    asked for in the prompt.
    """
    if not grounded:
        looks_like_data = re.search(
            r"(AED\s?[\d,]+"
            r"|\d+(\.\d+)?\s?%"
            r"|per\s?sq\s?ft"
            # Law/article/decree citations — "Law No. 7", "Article 3",
            # "Decree No. 15", "Resolution 12" — the legal-citation
            # equivalent of a fabricated price.
            r"|\b(law|decree|article|resolution|regulation)\s*(no\.?)?\s*\d+\b"
            # Specific deadlines/timeframes — "within 30 days", "60-day",
            # "in 6 months" — never allowed in an ungrounded answer, even
            # a timeframe that sounds plausible.
            r"|\bwithin\s+\d+\s*(day|days|month|months|year|years)\b"
            r"|\b\d+[\s-](day|days|month|months|year|years)\b"
            # Specific calendar dates — "by March 2027", "March 15, 2027".
            r"|\b(january|february|march|april|may|june|july|august|"
            r"september|october|november|december)\s+(?:\d{1,2}\s*,?\s*)?\d{4}\b"
            r")",
            answer, re.I,
        )
        if looks_like_data:
            raise GuardrailFailure("Ungrounded answer contains data-shaped numbers, a law/article citation, or a specific deadline")

    if any(token in answer for token in ("Traceback", "Exception", "NoneType", "KeyError")):
        raise GuardrailFailure("Answer leaked an internal error string")

    if not answer or not answer.strip():
        raise GuardrailFailure("Empty answer")


def _apply_followup_context(entities: dict, followup_result: dict, raw_message: str) -> dict:
    """
    Merges Stage 3's carried-forward context into Stage 2's entities —
    ONLY filling gaps Stage 2 genuinely left as None, never overwriting
    something Stage 2 found in the current message. This is the entire
    mechanism behind T6/T7 both working correctly:
    - T7 ("what about the yield there?"): Stage 2 finds area=None (no
      area named), so carried_area="JVC" fills the gap -> area becomes
      JVC, carried forward correctly.
    - T6 ("latest Binghatti project?"): Stage 2 finds project="Binghatti"
      itself from the current message — nothing here touches that, and
      Stage 3 independently recognized this as a topic change anyway
      (is_followup=False), so carried_area is None regardless and area
      correctly stays None rather than incorrectly reusing JVC.

    bedrooms uses an explicit `is None` check, not a truthiness check —
    bedrooms=0 (a Studio) is a real, valid value Stage 2 can find, and a
    truthiness check would wrongly treat it as "missing" and overwrite
    it with carried_bedrooms.

    CHANGE LOG (this version):
    - BUG FIX, confirmed live: "tell the projects" as a follow-up to a
      JVC conversation returned the full 397-area list instead of JVC's
      real projects. Root cause: Stage 2 classified question_type BEFORE
      this merge ever runs — with no area in the raw current message
      alone, "list_areas" was the only question_type that's DEFINED to
      make sense with area=null, so that's what it picked. This merge
      then correctly filled in area="JVC" afterward, but question_type
      was already locked in as "list_areas" and never got reconsidered
      in light of the newly-filled area — the routing checks
      question_type=="list_areas" unconditionally, ignoring that area is
      no longer actually null. Fixed by re-checking question_type here:
      if it's "list_areas" but an area DID get filled in by this merge,
      that classification is now stale by definition (list_areas only
      ever means "no specific area") — reclassify using simple keyword
      matching against the investor's own raw current message.
    """
    entities = dict(entities)  # never mutate the caller's dict in place
    entities["is_followup"] = followup_result["is_followup"]
    area_was_missing = entities.get("area") is None
    if area_was_missing:
        entities["area"] = followup_result["carried_area"]
    if entities.get("project") is None:
        entities["project"] = followup_result["carried_project"]
    if entities.get("bedrooms") is None:
        entities["bedrooms"] = followup_result["carried_bedrooms"]

    if (area_was_missing and entities["area"] is not None
            and entities.get("question_type") == "list_areas"):
        raw = (raw_message or "").lower()
        if "project" in raw or "development" in raw:
            corrected = "area_projects"
        elif "propert" in raw or "building" in raw:
            corrected = "area_properties"
        else:
            corrected = "area_report"
        logger.warning(
            "Routing correction: question_type was 'list_areas' but an area (%r) was "
            "carried forward by this follow-up — that combination is never valid "
            "(list_areas only means 'no area given'). Reclassified to %r based on the "
            "investor's own wording.",
            entities["area"], corrected,
        )
        entities["question_type"] = corrected

    return entities


def _log_fallback(question: str, entities: dict, reason: str):
    """
    Doc §3.5: "Every fallback, and every real user question, is logged
    automatically — no manual effort at the moment it happens." Writes
    to chat_fallback_logs (Supabase, RLS-locked to service-role only).

    Deliberately fail-safe: a logging failure must NEVER affect the
    actual response a user gets — wrapped in try/except, any error here
    is logged to the normal logger and swallowed, never raised. Logging
    is a nice-to-have for weekly review, not something worth degrading
    the live product over.
    """
    try:
        supabase.table("chat_fallback_logs").insert({
            "question": question,
            "entities": entities,
            "reason": reason,
        }).execute()
    except Exception as e:
        logger.warning("_log_fallback: failed to write fallback log (%s) — continuing anyway", e)


def _build_lookup_data(entities: dict, question: str = None):
    """
    PHASE A REFACTOR (doc §3.2): dispatches through the generic
    get()/compare()/rank()/lookup() engine in entity_registry.py instead
    of one hardcoded branch per question_type. Every resolver this used
    to call directly is unchanged — only how it's reached changed. See
    entity_registry.py for the (entity_type, metric) -> resolver map.

    Every precedence rule and bug-fix guarantee below is preserved
    VERBATIM from the pre-refactor version — this refactor changes
    dispatch mechanics only, never behavior. QUESTION_TYPE_TO_OPERATION
    is the whole point: a future new question_type that's really just an
    existing (entity, metric) pair is ONE line there, not a new branch.
    """
    question_type = entities.get("question_type")
    area = entities.get("area")
    project = entities.get("project")
    wants_transaction_list = entities.get("wants_transaction_list")
    bedrooms = entities.get("bedrooms")

    # UNCHANGED: an explicit request to SEE transactions always wins over
    # a possibly-misclassified question_type, never the reverse.
    if wants_transaction_list and question_type in ("list_areas", "area_properties", "area_projects"):
        logger.warning(
            "Routing override: wants_transaction_list=True but question_type=%r — "
            "treating as a transaction-list request, not %r",
            question_type, question_type,
        )
        question_type = "area_report"

    if question_type == "list_areas":
        return get("area", None, "list")

    if question_type == "area_properties":
        return get("area", area, "properties")

    if question_type == "area_projects":
        return get("area", area, "projects")

    if question_type == "area_developers":
        return get("area", area, "developers")

    if question_type == "developer_lookup":
        # Closes Part Three §3.1's Broker/Developer entities. lookup() ==
        # get(entity, value, "profile") — the developer's "profile"
        # resolver already ties license info to the exact developer_id(s)
        # behind the resolved projects, not a second independent search.
        return lookup("developer", entities.get("developer"))

    if question_type == "broker_lookup":
        return lookup("broker", entities.get("broker"))

    if question_type in ("top_areas_ranking", "top_projects_ranking", "top_developers_ranking"):
        entity_type = {
            "top_areas_ranking": "area",
            "top_projects_ranking": "project",
            "top_developers_ranking": "developer",
        }[question_type]
        return rank(
            entity_type,
            metric=entities.get("ranking_metric") or "volume",
            year=entities.get("ranking_year"),
            limit=entities.get("ranking_limit") or 10,
        )

    if question_type == "market_overview":
        return get("market", None, "overview", year=entities.get("ranking_year"))

    if question_type == "roi":
        # UNCHANGED precedence: a named project is more specific than an
        # area, so roi resolves against the project when one is present.
        # get(..., "roi") is the composite resolver in entity_registry.py
        # that pulls sale + rent and computes gross yield from two real
        # numbers — never a number the model itself calculates.
        if project:
            return get("project", project, "roi", bedrooms=bedrooms)
        elif area:
            return get("area", area, "roi", bedrooms=bedrooms)
        return None

    if question_type == "unit_count":
        # UNCHANGED: requires a specific named project — an area-only
        # unit_count question is honestly out of scope, not guessed at.
        return get("project", project, "unit_inventory") if project else None

    if question_type == "market_index":
        return get("market", None, "index", index_property_type=entities.get("index_property_type") or "all")

    if question_type == "valuation":
        return get("area", area, "valuation", bedrooms=bedrooms) if area else None

    if question_type == "legal_or_general":
        return lookup("document", question)

    if question_type == "comparison":
        area2 = entities.get("area2")
        if area and area2:
            return compare("area", [area, area2], bedrooms=bedrooms)
        # UNCHANGED: a "comparison" that degrades to one area never also
        # shows a trend table — it wasn't a trend request.
        entities["wants_trend"] = False

    # Default path — UNCHANGED precedence (confirmed live bug, Beta v2
    # T3): a named project always wins over a co-extracted area.
    if project:
        data = get("project", project, "profile", bedrooms=bedrooms)
    elif area:
        data = get("area", area, "profile", bedrooms=bedrooms)
    else:
        data = None

    if entities.get("wants_transaction_list"):
        count = entities.get("transaction_count") or 10
        transactions = recent_transactions(area, limit=count, project=project)
        if transactions:
            # UNCHANGED: a lightweight, capped transaction fetch must not
            # be thrown away by an unrelated heavier lookup's failure.
            if data is None:
                data = {"area": normalize_area(area) or area or project}
            data["recent_transactions"] = transactions

    if (entities.get("wants_trend") and data is not None and area
            and isinstance(data, dict) and "comparison" not in data):
        trend = price_trend(area, bedrooms=bedrooms)
        if trend:
            data["price_trend"] = trend
            # Doc §3.3.1: market_signal is derived from the SAME trend
            # data, not a separate lookup — pure computation, no new call.
            signal = market_signal(trend)
            if signal:
                data["market_signal"] = signal

    return data


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    question = receive_question(req.message)
    if not question:
        raise HTTPException(status_code=400, detail="Empty message")

    # Stage 2 and Stage 3 are fully independent: Stage 3 never reads
    # Stage 2's output (it only reads `question` and `req.history`), and
    # Stage 2 never reads history. They used to run sequentially here —
    # two full Groq round-trips back-to-back — even though nothing
    # required that ordering. Running them concurrently costs roughly
    # max(t1, t2) instead of t1 + t2 on every message that has history
    # (Stage 3 short-circuits with no Groq call at all when history is
    # empty, so the very first message in a conversation was already
    # only ever paying for Stage 2 — this only speeds up messages 2+).
    with ThreadPoolExecutor(max_workers=2) as pool:
        entities_future = pool.submit(extract_entities, question)
        followup_future = pool.submit(detect_followup, question, req.history or [])
        entities = entities_future.result()
        followup_result = followup_future.result()

    entities = _apply_followup_context(entities, followup_result, question)   # merge: fills gaps only

    # Doc §3.4 (UC10): explicit request-level user_type (a future
    # frontend persona selector) always wins over Stage 2's inference
    # from the question's own wording; if neither is set, "investor" —
    # exactly today's only behavior, so nothing existing moves.
    entities["user_type"] = req.user_type or entities.get("user_type") or "investor"

    data = _build_lookup_data(entities, question)    # Stage 4 routing, new in this version

    # Known data gap, not a bug: see BROKER_RANKING_UNAVAILABLE_MESSAGE above.
    # Checked BEFORE build_answer so this never depends on Stage 5 correctly
    # inferring intent from a null broker — it's a fixed, honest string.
    if (data is None and entities.get("question_type") == "broker_lookup"
            and not entities.get("broker")):
        _log_fallback(
            question, entities,
            reason="broker ranking requested — real_estate_brokers has no performance "
                   "metric to rank by (known data gap, not a routing failure)",
        )
        logger.info("Wired pipeline decided: known gap — broker ranking requested with no name given")
        return ChatResponse(
            answer=BROKER_RANKING_UNAVAILABLE_MESSAGE,
            grounded=False,
            area=None,
            chart_data=None,
            debug={"entities": entities, "had_data": False, "known_gap": "broker_ranking_metric_missing"},
        )

    answer, grounded = build_answer(question, entities, data)  # Stage 5, already proven alone

    try:
        run_guardrails(answer, grounded)
    except GuardrailFailure as e:
        logger.error("Guardrail failed (%s) — falling back to honest no-data response", e)
        answer, grounded = NO_DATA_FALLBACK, False

    # Doc §3.5: log the genuine no-data fallback, not every grounded=False
    # response — a legal_or_general general-knowledge answer is also
    # grounded=False but is a real, successful answer, not a failure.
    # answer == NO_DATA_FALLBACK is the precise signal for "found nothing."
    if answer == NO_DATA_FALLBACK:
        _log_fallback(question, entities, reason=f"question_type={entities.get('question_type')!r} area={entities.get('area')!r} project={entities.get('project')!r} — no data found")

    chart_data = data.get("price_trend") if isinstance(data, dict) else None

    # Habit #2: log the wired-together decision, not just each stage alone.
    logger.info(
        "Wired pipeline decided: question_type=%s area=%r is_followup=%s grounded=%s "
        "had_data=%s has_chart=%s",
        entities.get("question_type"), entities.get("area"), entities.get("is_followup"),
        grounded, data is not None, chart_data is not None,
    )

    return ChatResponse(
        answer=answer,
        grounded=grounded,
        area=normalize_area(entities.get("area")) if entities.get("question_type") != "list_areas" else None,
        chart_data=chart_data,
        debug={"entities": entities, "had_data": data is not None},
    )

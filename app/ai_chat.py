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
import time
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from clients import logger, normalize_area, supabase
from stage2_extract_entities import extract_entities
from stage3_detect_followup import detect_followup
from stage4_lookup_area_data import (
    lookup_area_data,
    lookup_project_data,
    lookup_comparison_data,
    get_recent_transactions,
    get_all_areas,
    get_district_properties,
    get_area_projects,
    get_developer_projects,
    get_price_trend,
    get_top_areas,
    get_top_projects,
    get_top_developers,
    get_market_overview,
    get_rental_yield,
    get_developer_info,
    get_area_developers,
    get_unit_inventory,
    get_sale_index,
    get_valuation_stats,
    get_legal_knowledge,
    get_broker_info,
    get_broker_list,
    compute_market_signal,
)
from stage5_build_answer import build_answer, NO_DATA_FALLBACK

router = APIRouter()


# CONFIRMED LIVE BUG (v1 fix, superseded by this version): "tell the top
# 10 brokers" was first seen falling through to the generic
# NO_DATA_FALLBACK ("I'm sorry, but I can't help with that."). The v1 fix
# below caught that by checking question_type=="broker_lookup" with no
# broker name. That fix was INSUFFICIENT — confirmed live a second time:
# the exact same question ("tell the top 10 brokers") got classified by
# Stage 2 as "legal_or_general" instead on a later run (Stage 2's
# classification is an LLM call, not deterministic — same instability the
# architecture review already flagged as issue #14). "legal_or_general"
# with no matching legal_knowledge_chunks falls through to Stage 5's
# ungrounded general-knowledge LLM path (see LEGAL_GENERAL_KNOWLEDGE_PROMPT
# in stage5_build_answer.py) — which fabricated a plausible-sounding list
# of "well-known Dubai brokerage firms," labeled "general knowledge, not
# verified DLD data," but NOT drawn from real_estate_brokers at all. That
# is WORSE than the honest apology it replaced: it looks like a real
# answer and isn't grounded in the 8,724 real rows sitting right there.
#
# Root cause is genuinely two things, and this fix addresses both:
#   1. Detection must not depend on Stage 2 picking any one specific
#      question_type — it's checked directly against the raw question
#      text below, so it fires the same way regardless of whether Stage 2
#      says broker_lookup, legal_or_general, or anything else.
#   2. real_estate_brokers has no deal-volume/performance column, so
#      there is still no real "top by activity" metric (Gate 1 still
#      applies — no fabricated ranking). But it DOES have real brokers
#      with real license data, so get_broker_list() (stage4) returns
#      genuine rows instead of nothing — ordered by license tenure, the
#      only defensible real ordering, labeled as exactly that.
_BROKER_QUESTION_RE = re.compile(r"\bbroker(s)?\b", re.I)


def _to_markdown_table(headers: list, rows: list) -> str:
    """Generic helper: emits the EXACT pipe-table grammar ChatPage.jsx's
    parseAnswerBlocks() looks for — a `| cell | cell |` header line
    immediately followed by a `|---|---|` divider, then more `| cell |`
    rows. No frontend change needed: that parser already exists and
    already renders this as a real <table>. The only reason answers
    weren't showing as tables is that nothing on the backend was emitting
    this exact shape.

    Reusable for ANY list-of-records answer, not just brokers — recent
    transactions, area projects, area developers, rankings, unit
    inventory all have the same shape (N records, same fields each) and
    can go through this same helper.

    Cell values are sanitized against stray "|" characters, which would
    corrupt the parser's row-splitting — real column data (names, phone
    numbers, dates) won't naturally contain one, but this is a real,
    verified table on real data, so it shouldn't ever be one bad
    character away from silently mis-rendering.
    """
    def _clean(cell) -> str:
        return str(cell).replace("|", "/").replace("\n", " ").strip() if cell not in (None, "") else "—"

    lines = [f"| {' | '.join(headers)} |"]
    lines.append(f"| {' | '.join(['---'] * len(headers))} |")
    for row in rows:
        lines.append(f"| {' | '.join(_clean(c) for c in row)} |")
    return "\n".join(lines)


def _format_broker_list_answer(brokers: list) -> str:
    """Deterministic formatting, not an LLM call — every fact here is a
    real column from real_estate_brokers, so there's nothing for Stage 5
    to reason about or risk fabricating. Mirrors the honesty labeling
    get_broker_list()'s docstring requires: tenure, not performance.

    CHANGE: now emits a real markdown table via _to_markdown_table()
    instead of a numbered list. The numbered "1. **Name** — ..." format
    matched neither the frontend's table grammar nor its bullet grammar
    (`- ` only) — it fell through to a plain text block. Confirmed live:
    the badge said "GROUNDED — REAL DATA" and the data WAS real, but it
    rendered as a paragraph instead of the table the person asked for.
    """
    table = _to_markdown_table(
        headers=["#", "Broker Name", "Licensed Since", "Phone"],
        rows=[
            [i, b.get("broker_name") or "Unnamed on file", b.get("license_start_date") or "—", b.get("phone") or "—"]
            for i, b in enumerate(brokers, 1)
        ],
    )
    lines = [
        "**Licensed Real Estate Brokers — DLD Registry**",
        "",
        "DLD's broker registry doesn't track deal volume or performance, so there's no "
        "real \"best\" or \"most active\" ranking to pull from. These are currently "
        "licensed brokers, ordered by how long they've been continuously licensed:",
        "",
        table,
        "",
    ]
    lines.append("")
    lines.append("_Ask about a specific broker by name for their full license details._")
    return "\n".join(lines)


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
    Routes to the right Stage 4 call(s) based on Stage 2's question_type,
    and layers a price trend on top when wants_trend is set. Isolated
    from chat() itself so this routing logic has one obvious home and
    chat() stays a thin wire-up, matching the rest of this file's style.

    `question` (the investor's raw text) is needed only for
    "legal_or_general" — document retrieval works against the actual
    question text, not an extracted area/project entity. Every other
    branch below ignores it, same as before this parameter existed.

    CHANGE LOG (this version):
    - BUG FIX, confirmed live: "area_properties" was the only routing
      for "what's in this area" questions, reading district_properties
      (a generic building directory) even when the investor specifically
      asked about PROJECTS. Added a separate "area_projects" route to
      get_area_projects() — real, transaction-backed data from avm,
      confirmed almost completely non-overlapping with
      district_properties for the same area (see stage4's docstring for
      the JVC comparison).
    - BUG FIX, confirmed live: the default path always called
      lookup_area_data(area, ...) even when area was None — a project
      named alone ("tell me about Binghatti Aquarise") got nothing, even
      though get_recent_transactions() already had a working project
      filter for the transaction-list case. Now falls back to
      lookup_project_data() when there's a project but no area, so a
      plain (non-transaction-list) project question also resolves.
    """
    question_type = entities.get("question_type")
    area = entities.get("area")
    project = entities.get("project")
    wants_transaction_list = entities.get("wants_transaction_list")

    # BUG FIX, confirmed live: "tell the recent transactions of DAMAC
    # Hills 2" was classified as question_type="area_properties" by
    # Stage 2, showing a list of linked buildings instead of actual
    # sales. Prompt was strengthened to stop this, but per this
    # project's established practice of not fully trusting prompt
    # compliance alone (same reasoning as the sample-size-caveat and
    # transaction-count-line strips in stage5), this is the code-level
    # guarantee: an explicit request to SEE transactions always wins
    # over a possibly-misclassified question_type, never the reverse.
    if wants_transaction_list and question_type in ("list_areas", "area_properties", "area_projects"):
        logger.warning(
            "Routing override: wants_transaction_list=True but question_type=%r — "
            "treating as a transaction-list request, not %r",
            question_type, question_type,
        )
        question_type = "area_report"

    if question_type == "list_areas":
        areas = get_all_areas()
        return {"all_areas": areas} if areas else None

    if question_type == "area_properties":
        properties, total = get_district_properties(area)
        if not properties:
            return None
        return {"area": area, "properties": properties, "total_property_count": total}

    if question_type == "area_projects":
        projects = get_area_projects(area)
        if not projects:
            return None
        return {"area": normalize_area(area) or area, "area_projects": projects}

    if question_type == "area_developers":
        developers = get_area_developers(area)
        if not developers:
            return None
        data = {"area": normalize_area(area) or area, "area_developers": developers}

        # Same enrichment pattern as developer_lookup: tie license info to
        # the exact developer_id(s) already resolved, not a second guess.
        developer_ids = sorted({d["developer_id"] for d in developers if d.get("developer_id") is not None})
        info = get_developer_info(developer_ids)
        if info:
            data["developer_info"] = info
        return data

    if question_type == "developer_lookup":
        developer = entities.get("developer")
        projects = get_developer_projects(developer)
        if not projects:
            return None
        data = {"developer": developer, "developer_projects": projects}

        # Closes doc issue #10 (P2). Ties license/legal-status info to the
        # EXACT legal entity behind these specific projects (developer_id,
        # not a second independent name search) — see get_developer_info's
        # docstring for why that distinction matters.
        developer_ids = sorted({p["developer_id"] for p in projects if p.get("developer_id") is not None})
        info = get_developer_info(developer_ids)
        if info:
            data["developer_info"] = info
        return data

    if question_type == "broker_lookup":
        # Closes Part Three §3.1's Broker entity — real_estate_brokers
        # had 8,724 real rows but zero references anywhere in the code
        # before this. Name-based only; see get_broker_info's docstring
        # for why an area-scoped version isn't built (the table has no
        # area column at all).
        broker_name = entities.get("broker")
        brokers = get_broker_info(broker_name)
        if not brokers:
            return None
        return {"broker_name": broker_name, "brokers": brokers}

    if question_type == "top_areas_ranking":
        result = get_top_areas(
            metric=entities.get("ranking_metric") or "volume",
            year=entities.get("ranking_year"),
            limit=entities.get("ranking_limit") or 10,
        )
        return result if result else None

    if question_type == "top_projects_ranking":
        result = get_top_projects(
            metric=entities.get("ranking_metric") or "volume",
            year=entities.get("ranking_year"),
            limit=entities.get("ranking_limit") or 10,
        )
        return result if result else None

    if question_type == "top_developers_ranking":
        result = get_top_developers(
            metric=entities.get("ranking_metric") or "volume",
            year=entities.get("ranking_year"),
            limit=entities.get("ranking_limit") or 10,
        )
        return result if result else None

    if question_type == "market_overview":
        result = get_market_overview(year=entities.get("ranking_year"))
        return result if result else None

    if question_type == "roi":
        # Closes Part Two, issue #15 (P1) of the DLD reference pack.
        # BUG FIX (this version): "roi" was a valid question_type in
        # Stage 2's schema but had NO branch here at all — it fell
        # through to the default area/project lookup below, which
        # returns real SALE price data with no rental data behind it.
        # That never fabricated a yield (Gate 1 held), but it also never
        # actually answered a yield question — the investor got a price
        # report when they asked for a return. Now pulls BOTH sides —
        # sale price (existing lookup_area_data/lookup_project_data) and
        # rent (new get_rental_yield(), backed by the rentals table,
        # 320,664 real rows loaded 2026-08-18) — and computes gross yield
        # in Python from two real numbers, same discipline as
        # avg_price_per_sqft in stage4: never a number the model itself
        # calculates.
        if project:
            data = lookup_project_data(project, bedrooms=entities.get("bedrooms"))
        elif area:
            data = lookup_area_data(area, bedrooms=entities.get("bedrooms"))
        else:
            data = None

        if data is not None:
            rental = get_rental_yield(area or data.get("area"), bedrooms=entities.get("bedrooms"))
            if rental is not None:
                sale_ppsqm = data.get("avg_price_per_sqm")
                rent_ppsqm = rental.get("avg_rent_per_sqm")
                if sale_ppsqm and rent_ppsqm:
                    rental["gross_yield_pct"] = round((rent_ppsqm / sale_ppsqm) * 100, 2)
                data["rental_yield"] = rental
            else:
                logger.info(
                    "roi routing: sale data found for %r but no rent contracts exist — "
                    "returning sale data alone so Stage 5 can honestly say rental data "
                    "isn't available yet, rather than a bare no-data fallback",
                    area or project,
                )
        return data

    if question_type == "unit_count":
        # Closes "unit-count / inventory questions" (P2). Requires a
        # specific named project — registered_real_estate_units doesn't
        # carry the kind of loose area-level matching the other tables
        # do, so an area-only "unit_count" question (no project named)
        # is honestly out of scope rather than guessed at.
        inventory = get_unit_inventory(project)
        if not inventory:
            return None
        return {"project": project, "unit_inventory": inventory}

    if question_type == "market_index":
        # Closes "no market-index feature" (P2). Not area/project-scoped
        # — DLD's own published index is a single national time series.
        index_data = get_sale_index(property_type=entities.get("index_property_type") or "all")
        if not index_data:
            return None
        return index_data

    if question_type == "valuation":
        # Closes "valuation claim thinly backed" (P2). Combines the
        # existing sale-price lookup with real DLD valuation records —
        # same additive pattern as roi combining sale + rental data.
        data = lookup_area_data(area, bedrooms=entities.get("bedrooms")) if area else None
        if data is not None:
            valuation = get_valuation_stats(area)
            if valuation is not None:
                data["valuation"] = valuation
            else:
                logger.info(
                    "valuation routing: sale data found for %r but no valuation records exist — "
                    "returning sale data alone so Stage 5 can honestly say valuation data "
                    "isn't available yet, rather than a bare no-data fallback",
                    area,
                )
        return data

    if question_type == "legal_or_general":
        # Closes Part Two §2.2 / Part Three §3.7: this question_type
        # existed in Stage 2's schema from the start but had ZERO
        # routing branch here — every legal/visa/process question fell
        # through to the default area/project path (usually area=None,
        # project=None) and hit the generic no-data fallback, exactly
        # the doc's own confirmed-live finding ("Am I eligible for a
        # Golden Visa if I buy property?" → wrong, generic template).
        chunks = get_legal_knowledge(question)
        if not chunks:
            return None
        return {"legal_chunks": chunks}

    if question_type == "comparison":
        area2 = entities.get("area2")
        if area and area2:
            comparison_data = lookup_comparison_data(area, area2, bedrooms=entities.get("bedrooms"))
            if comparison_data:
                return comparison_data
            return None
        # Only one real area was actually extracted (not a genuine
        # two-area question, or Stage 2 couldn't resolve the second one)
        # — fall through to the ordinary single-area path below rather
        # than failing outright; Stage 5's prompt handles a lone area
        # under "comparison" honestly (no confusing two-sided framing).
        #
        # BUG FIX, confirmed live: "Dubai Hills Estate or Dubai Marina,
        # long-term?" had area2 left null AND wants_trend incorrectly
        # true (Stage 2 confused "long-term" with a historical-trend
        # request) — producing a confusing single-area answer with a
        # trend table appended, instead of either a real comparison or a
        # plain single-area analysis. The prompt was strengthened to fix
        # the root classification, but per this project's practice of
        # not trusting prompt compliance alone, this is the code-level
        # guarantee: a "comparison" question that degrades to one area
        # never also shows a trend table — it wasn't a trend request.
        entities["wants_trend"] = False

    # Default path — ordinary area/project/bedroom lookup.
    #
    # BUG FIX, confirmed live (Beta v2, T3): when BOTH an area and a
    # project are present, this used to prefer the area-wide lookup —
    # meaning "Price of Tiger Sky Tower, one bedroom?" (if an area also
    # got extracted alongside the project) could show AREA-WIDE numbers
    # presented as if they were specific to that project. A named
    # project is always more specific than an area, so it must always
    # win here — area-wide is the fallback for when no project was named
    # at all, not the default when both happen to be present.
    if project:
        data = lookup_project_data(project, bedrooms=entities.get("bedrooms"))
    elif area:
        data = lookup_area_data(area, bedrooms=entities.get("bedrooms"))
    else:
        data = None

    if entities.get("wants_transaction_list"):
        count = entities.get("transaction_count") or 10
        transactions = get_recent_transactions(area, limit=count, project=project)
        if transactions:
            # Confirmed live: lookup_area_data() (a much heavier 500-row
            # aggregate) could time out on a high-volume area even when
            # this lightweight, capped transaction fetch succeeds fine on
            # its own. A "show me recent sales" question doesn't need the
            # aggregate at all — don't let an unrelated, heavier query's
            # failure throw away a real, working answer.
            if data is None:
                data = {"area": normalize_area(area) or area or project}
            data["recent_transactions"] = transactions

    if (entities.get("wants_trend") and data is not None and area
            and isinstance(data, dict) and "comparison" not in data):
        trend = get_price_trend(area, bedrooms=entities.get("bedrooms"))
        if trend:
            data["price_trend"] = trend
            # Doc §3.3.1: market_signal is derived from the SAME trend
            # data, not a separate lookup — pure computation, no new call.
            signal = compute_market_signal(trend)
            if signal:
                data["market_signal"] = signal

    return data


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    # PHASE 0 (speed plan): timing instrumentation. Every stage's wall-clock
    # cost is logged as one line at the end of the request — this exists so
    # every future speed change (fast models, caching, parallel composite
    # calls) is judged against a real measured number, not a guess. Timers
    # wrap exactly the work each stage does; they do not change any
    # existing behavior, ordering, or return value.
    t_start = time.perf_counter()
    timings = {}

    question = receive_question(req.message)
    if not question:
        raise HTTPException(status_code=400, detail="Empty message")

    t0 = time.perf_counter()
    with ThreadPoolExecutor(max_workers=2) as pool:
        entities_future = pool.submit(extract_entities, question)
        followup_future = pool.submit(detect_followup, question, req.history or [])
        entities = entities_future.result()
        followup_result = followup_future.result()
    timings["stage2_and_3_parallel"] = round(time.perf_counter() - t0, 3)

    entities = _apply_followup_context(entities, followup_result, question)   # merge: fills gaps only

    # Doc §3.4 (UC10): explicit request-level user_type (a future
    # frontend persona selector) always wins over Stage 2's inference
    # from the question's own wording; if neither is set, "investor" —
    # exactly today's only behavior, so nothing existing moves.
    entities["user_type"] = req.user_type or entities.get("user_type") or "investor"

    # v3 fix: CHECKED BEFORE _build_lookup_data() runs, not after. v2's
    # check (data is None) was proven insufficient live: "tell the top 10
    # brokers in dubai" — the "top 10" phrasing pushed Stage 2 to pick
    # top_developers_ranking (or a similar existing ranking type) instead
    # of broker_lookup, since there's no top_brokers_ranking in its
    # schema. That branch returned REAL, non-None data — for developers,
    # not brokers. Stage 5 correctly said "No broker data available" in
    # its own text, but grounded=True still got set, because that flag is
    # driven by "was data non-None," not "does the answer actually answer
    # the question." A broker question must never reach Stage 5 carrying
    # some OTHER entity's data — checked first, unconditionally, so no
    # question_type Stage 2 picks can route around it.
    if not entities.get("broker") and _BROKER_QUESTION_RE.search(question):
        t0 = time.perf_counter()
        broker_list = get_broker_list(limit=entities.get("ranking_limit") or 10)
        timings["stage4_broker_shortcircuit"] = round(time.perf_counter() - t0, 3)
        if broker_list:
            answer = _format_broker_list_answer(broker_list)
            try:
                run_guardrails(answer, True)  # still leak-checked, same as every other answer
            except GuardrailFailure as e:
                logger.error("Guardrail failed on broker list answer (%s) — falling back", e)
                answer, grounded_flag = NO_DATA_FALLBACK, False
            else:
                grounded_flag = True
            timings["total"] = round(time.perf_counter() - t_start, 3)
            logger.info("Wired pipeline decided: broker question, no name given -> real broker list (%d rows) | timings=%s", len(broker_list), timings)
            return ChatResponse(
                answer=answer,
                grounded=grounded_flag,
                area=None,
                chart_data=None,
                debug={"entities": entities, "had_data": True, "resolved_via": "get_broker_list", "timings": timings},
            )
        # Genuinely no currently-licensed brokers found (shouldn't happen
        # with 8,724 rows, but honest either way) — falls through to the
        # normal pipeline below, which will hit NO_DATA_FALLBACK on its own.
        _log_fallback(
            question, entities,
            reason="broker question, no name given, and get_broker_list() returned nothing",
        )

    t0 = time.perf_counter()
    data = _build_lookup_data(entities, question)    # Stage 4 routing, new in this version
    timings["stage4_lookup"] = round(time.perf_counter() - t0, 3)

    t0 = time.perf_counter()
    answer, grounded = build_answer(question, entities, data)  # Stage 5, already proven alone
    timings["stage5_answer"] = round(time.perf_counter() - t0, 3)

    t0 = time.perf_counter()
    try:
        run_guardrails(answer, grounded)
    except GuardrailFailure as e:
        logger.error("Guardrail failed (%s) — falling back to honest no-data response", e)
        answer, grounded = NO_DATA_FALLBACK, False
    timings["guardrails"] = round(time.perf_counter() - t0, 3)

    # Doc §3.5: log the genuine no-data fallback, not every grounded=False
    # response — a legal_or_general general-knowledge answer is also
    # grounded=False but is a real, successful answer, not a failure.
    # answer == NO_DATA_FALLBACK is the precise signal for "found nothing."
    if answer == NO_DATA_FALLBACK:
        _log_fallback(question, entities, reason=f"question_type={entities.get('question_type')!r} area={entities.get('area')!r} project={entities.get('project')!r} — no data found")

    chart_data = data.get("price_trend") if isinstance(data, dict) else None
    timings["total"] = round(time.perf_counter() - t_start, 3)

    # Habit #2: log the wired-together decision, not just each stage alone.
    logger.info(
        "Wired pipeline decided: question_type=%s area=%r is_followup=%s grounded=%s "
        "had_data=%s has_chart=%s | timings=%s",
        entities.get("question_type"), entities.get("area"), entities.get("is_followup"),
        grounded, data is not None, chart_data is not None, timings,
    )

    return ChatResponse(
        answer=answer,
        grounded=grounded,
        area=normalize_area(entities.get("area")) if entities.get("question_type") != "list_areas" else None,
        chart_data=chart_data,
        debug={"entities": entities, "had_data": data is not None, "timings": timings},
    )

"""
stage_guided.py — Guided Onboarding Wizard, Beta v1
====================================================
NEW FUNCTIONALITY. Answers the gap: an investor with no domain knowledge
who doesn't know what to ask (no area, no budget, no project — nothing
Stage 2 can anchor a real lookup to) previously hit a dead-end honest
fallback ("I don't have verified data for that area yet...") with no path
forward. This module adds a short, deterministic, free-text-driven
question sequence (goal -> budget -> area -> bedrooms) that ends by
handing off to the EXACT SAME Stage 4/5 pipeline every other question
uses — this file never invents an answer or a number itself. It only
decides what to ask next and, once enough is collected, builds a
synthetic Stage-2-shaped entities dict + a reconstructed natural-language
question for the real pipeline to answer normally.

Design constraints, deliberate:
- STATELESS, same as the rest of Beta v1. No server-side session store.
  Wizard progress is stashed inside the `entities` dict that ai_chat.py
  already round-trips through the client's `history` array on every
  turn (see ChatResponse.debug["entities"], and ChatPage.jsx's
  `setHistory` which stores exactly that dict back). This means ZERO
  frontend changes are required — the existing history mechanism
  carries the extra "_guided" key for free, the same way it already
  carries "area"/"project"/"bedrooms".
- Zero new Groq calls. Stage 2's extract_entities() already runs on
  every raw message at the top of chat() regardless of guided mode —
  this module reads budget/area/bedrooms out of that ALREADY-COMPUTED
  dict rather than re-extracting, so guided mode adds no new
  Groq/latency cost per turn beyond what already exists.
- Escape hatch, step-aware: project/developer/broker/valuator are never
  something this wizard asks for, so their presence always means a
  genuinely different question. "area" is different — it's also a real
  slot this wizard asks for directly, so its mere presence is judged by
  whether the message reads as a full question (see
  _looks_like_a_full_question) rather than treated as an automatic
  interruption; otherwise correctly ANSWERING the area step would trip
  its own escape hatch. An investor who asks something genuinely
  concrete is never trapped answering a step they've moved past.
- Finalization NEVER answers directly. It only returns a synthetic
  entities dict (question_type in the same enum Stage 2 already uses)
  and a reconstructed question string. The caller (ai_chat.py) passes
  these through _build_lookup_data() / build_answer() / run_guardrails()
  / run_data_consistency_check() completely unchanged — a guided
  answer is grounded, guardrailed, and consistency-checked exactly like
  every other answer, because it IS every other answer's code path.
"""

import re

GUIDED_STEPS = ("goal", "budget", "area", "bedrooms")
_SLOT_FOR_STEP = {"budget": "budget", "area": "area", "bedrooms": "bedrooms"}  # "goal" has no Stage 2 slot

STEP_PROMPTS = {
    "goal": (
        "Happy to help you get oriented — a few quick questions first, then I'll point "
        "you to real, DLD-transaction-backed options (never a guess).\n\n"
        "**1) What's the main goal?** Rental income (yield), long-term price growth "
        "(appreciation), or not sure yet?"
    ),
    "budget": (
        "**2) What budget are you working with, roughly?** (e.g. \"around 1.2 million "
        "AED\" — or say \"skip\" if you'd rather not say)"
    ),
    "area": (
        "**3) Do you already have an area in mind**, or should I recommend one based on "
        "your budget? (name an area, or say \"recommend one\")"
    ),
    "bedrooms": (
        "**4) Last one — any preference on unit size?** Studio, 1BR, 2BR, 3BR+, villa, "
        "or say \"any\" if it doesn't matter."
    ),
}

GUIDED_OFFER_SUFFIX = (
    "\n\n---\n"
    "New to Dubai property investing and not sure where to start? I can walk you "
    "through a few quick questions — goal, budget, area, unit size — and point you to "
    "real, data-backed options. Just reply here to get started."
)

CANCEL_WORDS = {
    "cancel", "stop", "never mind", "nevermind", "no thanks", "nothanks",
    "quit", "exit", "no",
}
SKIP_WORDS = {
    "skip", "na", "n/a", "none", "not sure", "dont know", "don't know",
    "doesnt matter", "doesn't matter", "any", "no preference",
    "recommend one", "recommend for me", "you choose", "you decide",
    "up to you", "not applicable",
}

# Only these Stage-2 question_types are self-sufficient with zero anchor
# entities — anything else with no area/project/developer/broker/valuator/
# budget is genuinely stuck, and that's the guided-mode trigger signal.
SELF_SUFFICIENT_TYPES = {
    "list_areas", "top_areas_ranking", "top_projects_ranking",
    "top_developers_ranking", "market_overview",
}
_ANCHOR_KEYS = ("area", "area2", "project", "project2", "developer", "broker", "valuator", "budget")

_YIELD_WORDS = (
    "yield", "rental income", "rent", "cash flow", "cashflow",
    "passive income", "income",
)
_APPRECIATION_WORDS = (
    "appreciation", "growth", "capital gain", "capital growth", "resale",
    "flip", "long-term value", "long term value", "value increase",
    "price growth",
)


def is_vague_first_turn(entities: dict, has_history: bool) -> bool:
    """
    True only when: this is genuinely the first message in the
    conversation (no history — never interrupts an ongoing exchange),
    AND Stage 2 found NOTHING to anchor a real lookup to (no area,
    project, developer, broker, valuator, or budget), AND the
    question_type isn't one of the handful that are already fully
    answerable with zero entities (list_areas, top_*_ranking,
    market_overview — those already give a real, useful answer today,
    so guided mode must never interrupt them).
    """
    if has_history or not isinstance(entities, dict):
        return False
    if entities.get("question_type") in SELF_SUFFICIENT_TYPES:
        return False
    return all(not entities.get(k) for k in _ANCHOR_KEYS)


def start_guided_state() -> dict:
    return {"active": True, "step": "goal", "collected": {}}


_QUESTION_INDICATOR_RE = re.compile(
    r"\?|\b(what|how|why|when|which|who|tell me|show me|compare|price of|"
    r"trend|yield of|roi of|worth buying|is it|are they|explain)\b",
    re.I,
)


def _looks_like_a_full_question(text: str) -> bool:
    """
    Distinguishes a genuine topic-change interruption ("actually, what
    about Dubai Marina's price trend?") from an ordinary short slot
    answer ("JVC", "2 bedroom", "Dubai Marina") that happens to also
    contain a real, Stage-2-extractable area name. This is what makes
    the "area" step actually usable — without it, correctly answering
    the area question with a real area name would trip the same
    escape hatch meant for a genuinely different question. See
    continue_guided_flow's docstring for how this is used.
    """
    if _QUESTION_INDICATOR_RE.search(text):
        return True
    return len(text.split()) > 6


def _next_step_after(step: str, collected: dict) -> str:
    """
    Skips any later step whose slot has already been filled — e.g. an
    investor who volunteers an area during the budget step ("1.2M,
    somewhere in JVC") shouldn't be asked the area question again.
    "goal" is never skipped this way; it has no Stage 2 slot to harvest
    ahead of time, so it's only ever answered by the goal step itself.
    """
    idx = GUIDED_STEPS.index(step)
    for candidate in GUIDED_STEPS[idx + 1:]:
        slot_key = _SLOT_FOR_STEP.get(candidate)
        if slot_key is None or slot_key not in collected:
            return candidate
    return "done"


def _classify_goal(lower_text: str) -> str:
    if any(w in lower_text for w in _YIELD_WORDS):
        return "yield"
    if any(w in lower_text for w in _APPRECIATION_WORDS):
        return "appreciation"
    return "unsure"


def _format_bedrooms_phrase(bedrooms):
    if bedrooms is None:
        return None
    if bedrooms == 0:
        return "a studio"
    return f"{bedrooms} bedroom(s)"


def _summary_line(goal: str, budget, area, bedrooms) -> str:
    goal_label = {
        "yield": "rental yield",
        "appreciation": "capital growth",
        "unsure": "not sure yet — yield or growth",
    }[goal]
    bits = [f"goal: {goal_label}"]
    bits.append(f"budget: AED {budget:,.0f}" if budget else "budget: not specified")
    bits.append(f"area: {area}" if area else "area: none yet, recommending based on the above")
    bd_phrase = _format_bedrooms_phrase(bedrooms)
    bits.append(f"unit size: {bd_phrase}" if bd_phrase else "unit size: no preference")
    return "**Here's what I've got — " + ", ".join(bits) + ".** Based on real DLD data:"


def _finalize(collected: dict) -> dict:
    goal = collected.get("goal") or "unsure"
    budget = collected.get("budget")
    area = collected.get("area")
    bedrooms = collected.get("bedrooms")

    if area:
        question_type = "roi" if goal == "yield" else "area_report"
    elif budget:
        question_type = "budget_recommendation"
    else:
        question_type = "top_areas_ranking"

    entities = {
        "question_type": question_type,
        "area": area, "area2": None, "project": None, "project2": None,
        "developer": None, "broker": None, "valuator": None,
        "bedrooms": bedrooms, "budget": budget,
        "asking_price": None, "rent_amount": None,
        "wants_transaction_list": False, "transaction_count": None,
        "wants_trend": bool(area),
        "ranking_metric": "volume", "ranking_year": None, "ranking_limit": 6,
        "index_property_type": None,
        "user_type": "investor",
        "is_followup": False,
    }

    goal_phrase = {
        "yield": "mainly looking for rental income / yield",
        "appreciation": "mainly looking for long-term price growth",
        "unsure": "not sure yet whether I want rental yield or long-term growth",
    }[goal]
    budget_phrase = f" I have a budget of roughly AED {budget:,.0f}." if budget else ""
    area_phrase = (
        f" I already have {area} in mind." if area
        else " I don't have a specific area in mind yet — please recommend one."
    )
    bd_phrase = _format_bedrooms_phrase(bedrooms)
    bedroom_phrase = f" Looking for something around {bd_phrase}." if bd_phrase else ""

    question = (
        f"I'm a new investor, {goal_phrase}.{budget_phrase}{area_phrase}{bedroom_phrase} "
        "What would you recommend, based on real data?"
    )

    return {
        "action": "finalize",
        "entities": entities,
        "question": question,
        "intro": _summary_line(goal, budget, area, bedrooms),
    }


def continue_guided_flow(message: str, prior_guided: dict, current_entities: dict) -> dict:
    """
    Advances the wizard by one turn.

    Returns one of:
      {"action": "abort"}
          The current message independently named a real anchor entity —
          treat this turn as an ordinary fresh question, guided context
          silently dropped.
      {"action": "cancelled"}
          The investor explicitly opted out.
      {"action": "continue", "prompt_text": str, "guided_state": dict}
          Mid-wizard; show prompt_text as the answer (grounded=False,
          nothing to guardrail-check — it's a fixed, known-safe string),
          carry guided_state forward via entities["_guided"].
      {"action": "finalize", "entities": dict, "question": str, "intro": str}
          Wizard complete — caller runs `entities`/`question` through the
          normal Stage 4/5 pipeline exactly as any other question, then
          may prefix the final grounded/ungrounded answer with `intro`.
    """
    text = (message or "").strip()
    lower = text.lower()

    # project/developer/broker/valuator are never something this wizard
    # asks for — their presence is unambiguous evidence of a genuinely
    # different, unrelated question, regardless of which step is active.
    if any(current_entities.get(k) for k in ("project", "developer", "broker", "valuator")):
        return {"action": "abort"}

    # "area" is different: it's ALSO a real slot this wizard explicitly
    # asks for (the "area" step) — CONFIRMED LIVE BUG, caught during
    # design review before ship: treating any area presence as an
    # unconditional interruption meant correctly ANSWERING the area
    # question with a real area name ("JVC") tripped this same escape
    # hatch and silently discarded the entire wizard. An area name alone
    # is never an interruption; only a message that actually reads as a
    # different, fully-formed question is.
    if current_entities.get("area") and _looks_like_a_full_question(text):
        return {"action": "abort"}

    if lower in CANCEL_WORDS:
        return {"action": "cancelled"}

    step = prior_guided.get("step")
    collected = dict(prior_guided.get("collected") or {})

    if step not in GUIDED_STEPS:
        # Corrupted/unknown state (shouldn't happen — defensive only).
        return {"action": "abort"}

    # Harvest ANY informative slot values Stage 2 found in THIS message,
    # regardless of which step is currently active — not just the
    # current step's own slot. This supports both answering more than
    # one slot in a single message ("1.2M, somewhere in JVC" during the
    # budget step fills area too) and revising an already-collected slot
    # later ("actually make it 2 million" during the area step corrects
    # budget, not area). A value is only ever overwritten by a NEW real
    # value — never cleared back to None by its absence, so an earlier
    # answer is never silently lost.
    if current_entities.get("budget") is not None:
        collected["budget"] = current_entities["budget"]
    if current_entities.get("area"):
        collected["area"] = current_entities["area"]
    if current_entities.get("bedrooms") is not None:
        collected["bedrooms"] = current_entities["bedrooms"]

    if step == "goal":
        # No Stage 2 slot for "goal" to harvest — always classified fresh
        # from this message. _classify_goal already degrades to "unsure"
        # for skip words or anything unparseable, so no separate
        # SKIP_WORDS branch is needed here.
        collected["goal"] = _classify_goal(lower)
    else:
        # budget/area/bedrooms: if the harvest above didn't find a real
        # value for THIS step's own slot (explicit skip, or genuinely
        # unparseable), record it as explicitly None rather than leaving
        # it unset — never re-prompted for silently.
        slot_key = _SLOT_FOR_STEP.get(step)
        if slot_key and slot_key not in collected:
            collected[slot_key] = None

    next_step = _next_step_after(step, collected)
    if next_step == "done":
        return _finalize(collected)

    return {
        "action": "continue",
        "prompt_text": STEP_PROMPTS[next_step],
        "guided_state": {"active": True, "step": next_step, "collected": collected},
    }

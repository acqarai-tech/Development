"""
stage3_detect_followup.py — Stage 3, standalone (Beta v1)
=============================================================
Built and verified on its own, same discipline as Stage 2: this file
takes plain arguments (the CURRENT raw message, and a history list) and
returns a plain decision dict. It never calls extract_entities() or
lookup_area_data() itself — Stage 2 already ran, independently, on the
raw current message alone before this stage is even called (see
ai_chat.py's wiring). This stage's ONLY job is deciding whether THIS
message continues the previous subject or starts a new one, and if it
continues it, what to carry forward.

THE ONE RULE THAT MATTERS MOST HERE (per Section 5.4's Stage 3 rule):
This function NEVER modifies, merges, or rewrites the user's original
message. It only reads `current_message` — it does not return a
"cleaned up" or "merged with history" version of it, and nothing
downstream should ever be given anything other than the investor's own,
exact, untouched words. A prior draft that violated this (concatenating
history into the message text before extraction) was the #1 confirmed
bug in this project's history — extraction results became unpredictable
because Stage 2 was no longer looking at what the investor actually
typed. Carried-forward context is returned as SEPARATE fields
(carried_area, carried_project, carried_bedrooms) — never spliced into
message text.

WHY THIS IS A SEPARATE STAGE FROM STAGE 2, NOT FOLDED IN:
Stage 2 must stay honestly ignorant of conversation history — if asked
"what about the yield there?" with no history, "there" resolves to
nothing, and Stage 2 correctly returns area=None (never guesses). Folding
follow-up detection into Stage 2 would make Stage 2 harder to test in
isolation and would blur which stage is responsible for which decision.
Keeping them separate means each is independently provable: Stage 2 is
proven correct on a single message with zero history awareness; Stage 3
is proven correct on the history-vs-current-message relationship alone,
using Stage 2-shaped fixtures, never calling the real extractor.
"""
import json

from clients import groq_client, logger, PRIMARY_MODEL, FALLBACK_MODEL


FOLLOWUP_DETECTION_PROMPT = """You are deciding whether an investor's new message continues the SAME
subject as their previous message in this conversation, or starts a
NEW, different subject — for a Dubai real estate chat.

Return ONLY a JSON object, no other text, no markdown fences:

{{
  "is_followup": true or false,
  "reasoning": "one short phrase, for logs only, not shown to the investor"
}}

THE PREVIOUS MESSAGE in this conversation was:
"{previous_message}"
(resolved to: area={previous_area}, project={previous_project}, bedrooms={previous_bedrooms})

THE INVESTOR'S NEW MESSAGE is:
"{current_message}"

Rules:
- "is_followup" is true ONLY when the new message clearly depends on the
  previous one to make sense on its own — it uses a pronoun or implicit
  reference ("there", "that area", "it", "for that one", "what about the
  yield") instead of naming a subject, AND it's asking about the SAME
  underlying area/project/developer as before.
- "is_followup" is false whenever the new message names its OWN,
  different, specific subject — even if it's still about real estate,
  even if it's a natural thing to ask right after the previous question.
  A new area name, a new project name, or a new developer name makes it
  a topic change, not a follow-up, even without any explicit "actually,
  let's talk about X instead" signal.
- "is_followup" is false if there was no previous message (empty/no
  history) — there is nothing to follow up on.
- Examples:
  - Previous: "Is JVC worth buying?" (area=JVC). New: "what about the
    yield there?" -> true (implicit reference, "there" = JVC, same
    subject, no new subject named).
  - Previous: "Is JVC worth buying?" (area=JVC). New: "latest Binghatti
    project?" -> false (names its own new, different, specific subject
    — a developer, not JVC — even though it's a natural next question
    for the same investor to ask).
  - Previous: "Price of a 1BR in Business Bay?" (area=Business Bay).
    New: "and a 2BR?" -> true (implicit reference to the same area,
    only the bedroom count changed).
  - Previous: "Price of a 1BR in Business Bay?" (area=Business Bay).
    New: "how about Dubai Marina?" -> false (names a different,
    specific area).
- When genuinely ambiguous, prefer false (a topic change) — treating an
  unrelated question as a follow-up and silently reusing the wrong
  area/project is a worse failure than asking the investor to be
  specific again.
"""


def detect_followup(current_message: str, history: list) -> dict:
    """
    history: a list of prior turns, each shaped like
      {"message": str, "entities": dict}
    ordered oldest-first. Only the MOST RECENT turn is used — a message
    can only genuinely follow up on the immediately preceding one; if the
    investor wanted to return to something from three messages ago, they
    would need to name it again, which Stage 2 would then extract fresh
    and correctly (this deliberately does not attempt multi-turn-back
    reference resolution — that's more than the "genuine follow-up"
    scope Beta v1 was built for).

    Returns:
      {"is_followup": bool, "carried_area": str|None,
       "carried_project": str|None, "carried_bedrooms": int|None}
    carried_* are always None when is_followup is False — the caller
    should never use them in that case, but returning None explicitly
    (rather than omitting the keys) keeps the shape consistent for
    every caller.
    """
    empty_result = {"is_followup": False, "carried_area": None,
                     "carried_project": None, "carried_bedrooms": None}

    if not history:
        logger.info("Stage 3 decided: no history -> is_followup=False (nothing to follow up on)")
        return empty_result

    last_turn = history[-1]
    previous_message = last_turn.get("message", "")
    previous_entities = last_turn.get("entities") or {}
    previous_area = previous_entities.get("area")
    previous_project = previous_entities.get("project")
    previous_bedrooms = previous_entities.get("bedrooms")

    prompt = FOLLOWUP_DETECTION_PROMPT.format(
        previous_message=previous_message,
        previous_area=previous_area,
        previous_project=previous_project,
        previous_bedrooms=previous_bedrooms,
        current_message=current_message,
    )

    # PHASE 1 SPEED FIX: same reasoning as Stage 2 — a yes/no follow-up
    # decision doesn't need PRIMARY_MODEL as the first attempt.
    # FALLBACK_MODEL is already wired in and already proven against this
    # exact prompt shape. Reliability contract unchanged: still two
    # attempts, just flipped which one goes first.
    try:
        completion = groq_client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": current_message},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content
    except Exception as e:
        logger.warning("Stage 3: fast model failed (%s), trying primary", e)
        try:
            completion = groq_client.chat.completions.create(
                model=PRIMARY_MODEL,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": current_message},
                ],
                temperature=0,
                response_format={"type": "json_object"},
            )
            raw = completion.choices[0].message.content
        except Exception as e2:
            # Per the prompt's own guidance: when genuinely unsure, treat
            # as a topic change (False) rather than silently reusing the
            # wrong area — this applies to infrastructure failure too.
            logger.error("Stage 3: both models failed (%s) -> defaulting to is_followup=False", e2)
            return empty_result

    try:
        parsed = json.loads(raw)
        is_followup = bool(parsed.get("is_followup", False))
    except (json.JSONDecodeError, AttributeError):
        logger.error("Stage 3: could not parse model response -> defaulting to is_followup=False")
        return empty_result

    result = {
        "is_followup": is_followup,
        "carried_area": previous_area if is_followup else None,
        "carried_project": previous_project if is_followup else None,
        "carried_bedrooms": previous_bedrooms if is_followup else None,
    }

    # Habit #2: make this stage's decision visible while building.
    logger.info(
        "Stage 3 decided: is_followup=%s carried_area=%r carried_project=%r "
        "carried_bedrooms=%r (previous_message=%r current_message=%r)",
        result["is_followup"], result["carried_area"], result["carried_project"],
        result["carried_bedrooms"], previous_message, current_message,
    )
    return result

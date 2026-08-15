"""
stage2_extract_entities.py — Stage 2, standalone
==================================================
Per Section 5.4 habit #1: this is built and verified completely on its own
before Stage 4 or Stage 5 exist. It only depends on clients.py (the Groq
client) — nothing about Supabase, nothing about answer-writing.

CHANGE LOG (this version):
- Added "list_areas" — investor asks for the list of areas Acqar covers
  (e.g. "what areas do you have data on"). Needs no entities at all.
- Added "area_properties" — investor asks what properties/projects are
  linked to a given area (e.g. "what's in Dubai Hills Estate"). Needs
  "area" extracted, same rules as area_report (never guessed, never
  substituted for a similar-sounding area).
- Added "wants_trend" (bool) — separate from question_type, since a trend
  request usually rides on top of an ordinary area_report ("how has JVC
  moved over the last few years") rather than being its own type. Only
  Stage 4/5 act on it; Stage 2 just flags it.

Per Section 5.2, the target output shape is now:
{
  "question_type": "area_report" | "comparison" | "project_price" |
                    "developer_lookup" | "roi" | "legal_or_general" |
                    "list_areas" | "area_properties",
  "area": string or null,
  "project": string or null,
  "developer": string or null,
  "bedrooms": number or null,
  "budget": number or null,
  "wants_transaction_list": false,
  "transaction_count": number or null,
  "wants_trend": false,
  "is_followup": false   # ALWAYS false here — Stage 2 stays honestly
                          # ignorant of conversation history by design;
                          # the wiring layer (ai_chat.py) overwrites this
                          # with Stage 3's real decision after this stage
                          # runs. See stage3_detect_followup.py (Beta v1).
}
"""
import json

from clients import groq_client, logger, PRIMARY_MODEL, FALLBACK_MODEL


ENTITY_EXTRACTION_PROMPT = """You extract structured information from a real-estate investor's
question about the Dubai property market. You do not answer the question — you only extract.

Return ONLY a JSON object, no other text, no markdown fences, matching exactly this shape:

{
  "question_type": "area_report" | "comparison" | "project_price" | "developer_lookup" | "roi" | "legal_or_general" | "list_areas" | "area_properties",
  "area": string or null,
  "project": string or null,
  "developer": string or null,
  "bedrooms": number or null,
  "budget": number or null,
  "wants_transaction_list": true or false,
  "transaction_count": number or null,
  "wants_trend": true or false
}

Rules:
- "area" should be the plain community/area name as the user said it (e.g. "JVC", "Dubai Marina").
  Do not guess an area that was not mentioned or implied. If none was mentioned, use null.
- CRITICAL: extract the area name using the investor's OWN WORDS, as literally as possible.
  Never substitute a different, more well-known, or more "official-sounding" development with
  a similar name — even if you are not sure the investor's exact wording is a recognized area.
  For example, if the investor says "DAMAC Island", extract "DAMAC Island" exactly — do NOT
  substitute "DAMAC Lagoons," "DAMAC Hills," or any other DAMAC development, even though they
  are real, well-known, and might seem like a more likely match. A downstream system, not you,
  is responsible for matching this text to the real database record. Silently substituting a
  different real area is worse than saying nothing — it produces a confident, real-looking
  answer about the WRONG place, which has happened before and must not happen again.
- "project" should be a specific building/tower/development name if one was mentioned
  (e.g. "Tiger Sky Tower"). Null if none was named.
- "developer" should be a developer/company name if one was mentioned (e.g. "Binghatti").
  Null if none was named.
- "wants_transaction_list" is true ONLY if the investor is explicitly asking to SEE a list of
  individual sales/transactions/deals (e.g. "show me the last 10 sales", "recent transactions
  in JVC", "list recent deals"). False for questions asking about averages, trends, or general
  worth-buying questions — those want analysis, not a raw list.
- "transaction_count" is the number the investor asked for (e.g. "last 10 sales" -> 10). Null
  if wants_transaction_list is false, or if no specific number was given.
- "wants_trend" is true ONLY if the investor is explicitly asking how prices/values have
  CHANGED OVER TIME (e.g. "how has JVC trended", "price history for Dubai Marina", "show me
  the trend from past years", "has this area gone up or down"). False for a plain snapshot
  question ("is JVC worth buying now") even about the same area. This can be true alongside
  any question_type that has an area — it does not need its own question_type.
- "list_areas" is the question_type when the investor asks what areas/communities Acqar has
  data on at all, with no specific area named (e.g. "what areas do you cover", "list the
  areas you have data for"). "area" stays null for this type.
- "area_properties" is the question_type when the investor asks what properties, buildings,
  or projects are linked to a SPECIFIC named area (e.g. "what properties are in Dubai Hills
  Estate", "show me projects in JVC"). "area" must be extracted the same way as area_report.
- This pipeline only handles single-area questions so far (two-area comparison,
  project-level, and developer-level lookups are Beta v2 scope, not yet built).
  If two areas are being compared, still set question_type to "comparison"
  and put the FIRST area mentioned in "area".
- Never invent values. If something wasn't in the question, it's null.
"""


def extract_entities(question: str) -> dict:
    try:
        completion = groq_client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[
                {"role": "system", "content": ENTITY_EXTRACTION_PROMPT},
                {"role": "user", "content": question},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content
    except Exception as e:
        logger.warning("Stage 2: primary model failed (%s), trying fallback", e)
        completion = groq_client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[
                {"role": "system", "content": ENTITY_EXTRACTION_PROMPT},
                {"role": "user", "content": question},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content

    entities = json.loads(raw)
    entities.setdefault("question_type", "legal_or_general")
    entities.setdefault("area", None)
    entities.setdefault("project", None)
    entities.setdefault("developer", None)
    entities.setdefault("bedrooms", None)
    entities.setdefault("budget", None)
    entities.setdefault("wants_transaction_list", False)
    entities.setdefault("transaction_count", None)
    entities.setdefault("wants_trend", False)
    # Per Section 5.2: is_followup is Stage 3's decision, never guessed
    # here — Stage 2 deliberately stays ignorant of conversation history
    # (see stage3_detect_followup.py's docstring for why); the wiring
    # layer overwrites this after Stage 3 runs (Beta v1 onward).
    entities["is_followup"] = False

    # Habit #2: make this stage's decision visible while building.
    logger.info(
        "Stage 2 decided: question_type=%s area=%r project=%r developer=%r "
        "bedrooms=%r budget=%r wants_transaction_list=%s transaction_count=%r "
        "wants_trend=%s",
        entities["question_type"], entities["area"], entities["project"],
        entities["developer"], entities["bedrooms"], entities["budget"],
        entities["wants_transaction_list"], entities["transaction_count"],
        entities["wants_trend"],
    )
    return entities

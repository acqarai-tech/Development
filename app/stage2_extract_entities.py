"""
stage2_extract_entities.py — Stage 2, standalone
==================================================
Per Section 5.4 habit #1: this is built and verified completely on its own
before Stage 4 or Stage 5 exist. It only depends on clients.py (the Groq
client) — nothing about Supabase, nothing about answer-writing.

CHANGE LOG (this version):
- BUG FIX, confirmed live: "area_properties" previously said "what
  properties, buildings, OR PROJECTS are linked to an area" — meaning a
  genuine "what projects are in JVC" question got routed to the
  district_properties directory table instead of avm's real,
  transaction-backed project list. Confirmed live: for JVC these are
  almost completely different lists (district_properties returns "Al
  Yousuf Towers," "Al Maali Complex"; avm's real transacted projects are
  "Auresta Tower" [1,021 sales], "Serenz by Danube" [823 sales], etc.).
  Added a SEPARATE "area_projects" question_type specifically for real
  project questions, with "area_properties" now explicitly scoped to
  buildings/properties only.
- BUG FIX, confirmed live: extraction was silently dropping trailing
  numbers from area names ("Trade Center 2" -> "Trade Center"), which
  broke lookups even though the exact right override existed downstream
  (clients.py's AREA_NAME_OVERRIDES) — because it never received the
  digit it needed to match on. Many real Dubai areas differ ONLY by a
  trailing number (Trade Center 1/2, Al Aweer 1/2, Umm Nahad 2/3, Wadi Al
  Safa 3/4/5 — all confirmed real, distinct entries in the districts
  table) — added an explicit rule to never drop them.
- Added "list_areas" — investor asks for the list of areas Acqar covers
  (e.g. "what areas do you have data on"). Needs no entities at all.
- Added "area_properties" — investor asks what properties/buildings are
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
                    "list_areas" | "area_properties" | "area_projects",
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
  "question_type": "area_report" | "comparison" | "project_price" | "developer_lookup" | "roi" | "legal_or_general" | "list_areas" | "area_properties" | "area_projects",
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
- CRITICAL, separate rule — NEVER drop a trailing number that's part of an area name. Many
  real Dubai areas differ ONLY by a trailing number, e.g. "Trade Center 1" vs "Trade Center 2",
  "Al Aweer 1" vs "Al Aweer 2", "Umm Nahad 2" vs "Umm Nahad 3", "Wadi Al Safa 3" vs "Wadi Al
  Safa 4" vs "Wadi Al Safa 5" — these are genuinely different, distinct areas in the real data,
  not stylistic variants of the same one. If the investor says "trade center 1", extract
  "trade center 1" — the exact digit included — never round it down to just "Trade Center".
  Dropping the number silently merges two different real areas into one confused query, which
  has happened before and must not happen again.
- "project" should be a specific building/tower/development name if one was mentioned
  (e.g. "Tiger Sky Tower", "Binghatti Aquarise"). Null if none was named. A project can be
  named WITHOUT an area also being named (e.g. "tell me about Binghatti Aquarise") — that's
  valid; leave "area" as null in that case rather than guessing which area it's in.
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
- "area_properties" is the question_type when the investor asks what PROPERTIES or BUILDINGS
  (a general directory) are linked to a SPECIFIC named area (e.g. "what properties are in
  Dubai Hills Estate", "what buildings are in JVC"). "area" must be extracted the same way as
  area_report.
- "area_projects" is a SEPARATE question_type — use it when the investor specifically asks
  about PROJECTS or DEVELOPMENTS in an area (e.g. "what projects are in JVC", "list projects
  in Business Bay", "what's being developed in Dubai Hills"). This is different from
  area_properties: "projects" means active/transacted developments (what a developer actually
  built and sold units in), not a general property/building directory. When the investor's
  word is specifically "project(s)" or "development(s)", use area_projects, not
  area_properties — these two question_types intentionally pull from different real data and
  must not be confused.
- CRITICAL, separate rule — confirmed live: "tell the recent transactions of DAMAC Hills 2"
  was WRONGLY classified as question_type="area_properties", showing a list of linked
  buildings instead of actual sales. "wants_transaction_list" and "question_type" are two
  INDEPENDENT fields — never let one leak into the other. Any phrasing using "transaction(s)",
  "sale(s)", "deal(s)", or "sold" — e.g. "recent transactions of X", "show me sales in X",
  "what sold recently in X" — is ALWAYS wants_transaction_list=true, and question_type stays
  whatever it would otherwise be (normally "area_report") — it must NEVER become
  "area_properties" or "area_projects" just because an area name follows the word
  "transactions". Those two question_types are only for direct questions about what
  buildings/projects EXIST in an area (no mention of sales/transactions/deals at all).
- This pipeline only handles single-area comparison questions so far (genuine two-area
  side-by-side comparison and developer-level lookups are Beta v2 scope, not yet built).
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

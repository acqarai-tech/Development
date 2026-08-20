"""
stage2_extract_entities.py — Stage 2, standalone
==================================================
Per Section 5.4 habit #1: this is built and verified completely on its own
before Stage 4 or Stage 5 exist. It only depends on clients.py (the Groq
client) — nothing about Supabase, nothing about answer-writing.

CHANGE LOG (this version — Beta v2, adds project/developer/comparison depth):
- Added "area2" — genuine two-area comparison support. Previously
  "comparison" only kept the FIRST area mentioned and silently dropped
  the second, meaning a two-area question could never actually get
  two-area data. Now both areas are extracted, so Stage 4 can look up
  real numbers for BOTH sides instead of one.
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
  "area2": string or null,   # only for genuine two-area "comparison" questions
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
  "question_type": "area_report" | "comparison" | "project_price" | "developer_lookup" | "roi" | "legal_or_general" | "list_areas" | "area_properties" | "area_projects" | "area_developers" | "top_areas_ranking" | "top_projects_ranking" | "top_developers_ranking" | "market_overview" | "unit_count" | "market_index" | "valuation" | "broker_lookup" | "budget_recommendation",
  "area": string or null,
  "area2": string or null,
  "project": string or null,
  "developer": string or null,
  "broker": string or null,
  "bedrooms": number or null,
  "budget": number or null,
  "wants_transaction_list": true or false,
  "transaction_count": number or null,
  "wants_trend": true or false,
  "ranking_metric": "volume" | "price_high" | "price_low" | null,
  "ranking_year": number or null,
  "ranking_limit": number or null,
  "index_property_type": "all" | "flat" | "villa" | null,
  "user_type": "investor" | "buyer" | "seller" | "tenant" | "broker" | "developer" | null
}

Rules:
- "user_type" (doc §3.4, UC10: framing changes, real data never does) — infer this ONLY when
  the question itself gives a real signal about who's asking, never guessed from question_type
  alone (e.g. a price question could come from anyone). For EVERY type below, the test is INTENT,
  not exact wording — any tense, any phrasing, any informal way of stating the same real-world
  fact counts, not just the one literal example phrase given for each. This intent-based rule was
  added after a confirmed live miss on "buyer" (see below) and is applied to all five signals for
  the same reason — a prompt that only matches one exact phrasing per type will keep missing real
  investors who say the same thing differently, the same way buyer did.

  Signals:
  - "seller" — states personal selling intent, or ownership in a pricing/listing context, for a
    specific unit, in ANY phrasing/tense: "I'm selling," "I want to sell," "I'm going to sell,"
    "I sold," "I have a property to sell," or "my apartment/villa/unit" combined with a
    listing-price or how-fast-it'll-sell question.
  - "buyer" — states personal buying intent for a specific unit, in ANY phrasing/tense: "I'm
    buying," "I'm looking to buy," "I wanted to buy," "I want to buy," "planning to buy,"
    "thinking of buying." Also: asks if an asking price is fair. CONFIRMED LIVE FAILURE MODE: "I
    wanted to buy 1 BR in JVC" was missed entirely (user_type came back null -> investor) because
    only the exact "I'm buying" phrasing was matched originally — the same buying intent stated
    informally or in past tense wasn't recognized. Fixed by testing intent instead of exact
    wording; the same intent-based test now applies to every signal below too.
  - "tenant" — states personal renting/leasing status, or asks if a rent is fair/reasonable, in ANY
    phrasing: "I rent," "I'm renting," "my landlord," "my lease," "should I renew at this rent,"
    "is this rent too high/fair." NOT about yield or ROI — that's investor territory even if it
    mentions rent (e.g. "what's the rental yield in JVC" stays investor, not tenant, regardless of
    phrasing).
  - "broker" — explicitly identifies as acting on someone else's behalf, in ANY phrasing: "as a
    broker," "as an agent," "I'm an agent," "for a client," "my client wants," "on behalf of a
    client," "I'm listing this for someone." Also: asks for comparables without asking for
    analysis or a verdict.
  - "developer" — states personal developer/builder identity, or asks about competing projects from
    a builder's perspective, in ANY phrasing: "I'm a developer," "we're building," "our project,"
    "my development," "how are other projects doing compared to mine/ours."

  If NONE of these signals are present, use null — the wiring layer defaults null to "investor"
  (today's only behavior), so there's no cost to leaving it null when genuinely unclear. Never
  infer a user_type from tone alone or from which question_type was picked.
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
- CRITICAL, separate rule — confirmed live: "long-term" (as in "which is better long-term?")
  is INVESTMENT HORIZON language, not a trend request — it means "which one is the better
  choice for someone holding for years," not "show me historical price movement." Do NOT set
  wants_trend=true just because the word "long-term," "long term," or "for the future" appears
  — only the explicit historical-change phrasing above (trended, price history, over the past
  X years, gone up or down) means wants_trend=true. Confusing these two produces a completely
  wrong answer shape (a trend table instead of the comparison/analysis the investor actually
  asked for), which has happened before and must not happen again.
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
- "area_developers" is a SEPARATE question_type from BOTH "area_projects" and
  "developer_lookup" — use it when the investor asks WHICH DEVELOPERS are active in a given
  area, with NO specific developer named (e.g. "tell me the developers in JVC", "who's building
  in Business Bay", "which developers operate in Dubai Marina"). CONFIRMED LIVE FAILURE MODE:
  "tell the developers in JVC" was WRONGLY classified as "area_report", silently dropping the
  word "developers" entirely and returning an unrelated price snapshot with a conclusion that
  never even acknowledged developers were asked about. The test for this type is simple: does
  the investor's word "developer(s)" appear, with an area but NO specific developer name? If
  so, it's "area_developers", never "area_report" and never "area_projects" (which is about
  the projects themselves, not who built them) and never "developer_lookup" (which requires one
  specific named developer, e.g. "what has Emaar built" — extract into "developer", not this
  type). Extract "area" the same way as area_report — never guessed, never substituted.
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
- "comparison" is the question_type when the investor is explicitly weighing TWO named areas
  against each other (e.g. "Dubai Hills Estate or Dubai Marina, long-term?", "JVC vs Business
  Bay for rental yield"). Extract BOTH areas — the first-mentioned one goes in "area", the
  second in "area2", using each exactly as the investor wrote it (same literal-extraction and
  trailing-number rules as "area" above apply to "area2" too). Never leave "area2" null for a
  genuine two-area question just because it's the second one mentioned — a comparison isn't
  real without both real areas captured. CONFIRMED LIVE FAILURE MODE: "Dubai Hills Estate or
  Dubai Marina, long-term?" was extracted with area2 left null — do not repeat this. Whenever
  two area names are joined by "or", "vs", "versus", or "compared to", BOTH must be captured;
  the word "long-term" at the end is describing the investment horizon of the comparison, not
  changing it into a single-area question. If only ONE area is actually named (a single-area
  question, even if phrased with "compared to last year" or similar non-area comparison),
  "area2" stays null and question_type should usually be "area_report", not "comparison".
- "developer_lookup" is the question_type when the investor asks about a developer directly
  (e.g. "latest Binghatti project?", "what has Emaar built?", "Damac's track record"). Extract
  the developer name into "developer", exactly as written, same literal-extraction rules as
  area names. Do not also require an area — a developer can have projects across many areas.
- "broker_lookup" is the question_type when the investor asks about a specific NAMED broker
  directly (e.g. "who is broker John Smith?", "is broker Jane Doe still licensed?"). Requires a
  real person's name — extract it into "broker", exactly as written, same literal-extraction
  rules as area/developer names. Real broker records have no area or project tied to them, so
  never also require or infer an area for this question_type. If the investor asks a GENERAL
  question about brokers without naming one (e.g. "how do I find a good broker?"), that is
  "legal_or_general", not "broker_lookup" — this type is only for a specific named individual.
- "roi" is the question_type when the investor asks about rental return specifically — words
  like "ROI", "rental yield", "yield", "cap rate", "return on investment", "rental income", or
  "rent vs buy" (e.g. "what's the rental yield in JVC?", "is Business Bay good for ROI?", "how
  much rental income could I get in Dubai Marina?"). A question about price alone ("what's the
  price in JVC?") is "area_report", NOT "roi" — only classify as "roi" when the investor is
  specifically asking about rental return, not just sale price. Extract "area" or "project" the
  same way as any other question_type, using whichever the investor actually named.
- "unit_count" is the question_type when the investor asks how many units (or the unit mix —
  studios, 1-bed, 2-bed, etc.) a specific NAMED project has (e.g. "how many units does Sobha
  SkyParks have?", "what's the unit mix in Auresta Tower?", "how many 2-bedroom units in Serenz
  by Danube?"). This requires a specific project name — extract it into "project" the same way
  as "project_price". If no project is named, this is NOT "unit_count" — a general area question
  about unit types belongs to "area_report" instead.
- "market_index" is the question_type when the investor asks about DLD's own published price
  index or overall historical market trend — NOT a specific area or project (e.g. "how has the
  Dubai market performed historically?", "what's the DLD price index doing?", "show me the
  villa price index"). Distinct from "roi" and "area_report", which are about a specific area's
  own numbers, and distinct from "top_areas_ranking" (a ranked list of areas). Extract
  "index_property_type" as "villa" if the investor specifically asked about villas, "flat" if
  they specifically asked about apartments/flats, otherwise "all".
- "valuation" is the question_type when the investor specifically asks what a property is
  WORTH or its valuation, in an area — words like "worth", "valuation", "valued at", "how much
  is it worth" (e.g. "what's my property in JVC worth?", "what's the valuation in Business Bay?").
  A plain price question ("what's the price in JVC?") stays "area_report" — only classify as
  "valuation" when the investor specifically asks about worth/valuation as a concept, not just
  price. Extract "area" the same way as any other question_type.
- "top_areas_ranking" / "top_projects_ranking" / "top_developers_ranking" are the question_type
  when the investor asks for a RANKED LIST — by some real measure — of areas, projects, or
  developers respectively. This is a genuinely different question from a single-entity lookup
  (area_report, project_price, developer_lookup — about ONE named thing) or a plain directory
  (list_areas, area_properties — no ranking) — use one of these three whenever the investor
  wants things ORDERED by a real metric, not just named or listed alphabetically. Pick the type
  by WHAT is being ranked, not by wording alone:
  - "top 10 selling areas", "most expensive areas", "cheapest areas" -> top_areas_ranking
  - "top selling projects", "best-selling developments", "most expensive projects" ->
    top_projects_ranking
  - "top developers", "which developer sold the most", "biggest developers by volume" ->
    top_developers_ranking
  For all three:
  - "ranking_metric": "volume" for "most selling/active/transacted/biggest by sales" questions
    (the default if the investor's language is ambiguous about which metric — e.g. plain "top
    areas" or "top developers" with no further qualifier means volume, the most common real
    meaning of "top"). "price_high" for "most expensive/highest priced" questions. "price_low"
    for "cheapest/most affordable/entry-level" questions (not meaningful for
    top_developers_ranking — developers aren't priced, only their projects are; if a developer
    question uses price language, treat it as top_projects_ranking instead).
  - "ranking_year": the year the investor specified (e.g. "in 2026" -> 2026). If no year is
    mentioned, use null — do not guess or default to any specific year yourself, the current
    year will be filled in downstream.
  - "ranking_limit": the number the investor asked for (e.g. "top 10" -> 10, "top 5" -> 5). If
    no number is given (e.g. just "top areas"), use null — 10 will be used as a sensible
    default downstream, not guessed here.
  - No "area"/"project"/"developer" is needed or expected for these question_types — leave
    them null; the ranking itself IS the answer, not a lookup of one named thing.
- "market_overview" is the question_type for a general pricing/market question with NO specific
  area, project, or developer named at all, AND no specific budget figure to filter by — e.g.
  "what's the average price per sqm in Dubai right now", "how's the Dubai property market doing
  in 2026", "what's the average transaction value across the market". This is different from
  area_report (always about one named area) — use market_overview only when the investor is
  asking about the city/market as a whole with nothing to filter or recommend against. If the
  investor states a concrete budget and asks which areas fit it, that's "budget_recommendation"
  below, never market_overview.
  - "ranking_year": the year specified, or null if not mentioned (defaults downstream to the
    current year, same as the ranking types above).
- "budget_recommendation" is the question_type when the investor states a specific budget (an AED
  figure, or the word "budget") and asks which area(s) they could consider, what they can afford,
  or where they could invest — WITHOUT naming any specific area at all. Examples: "I have AED
  600,000. Which areas should I consider?", "What areas can I afford with AED 800,000?", "Which
  Dubai areas have properties under AED 1M?", "Where can I invest AED 500k?". CONFIRMED LIVE
  FAILURE MODE: "I have AED 600,000. Which areas should I consider?" was previously misclassified
  as "market_overview", returning the CITYWIDE AVERAGE price (~3.4M) — honest, but useless, since
  it never told the investor which real areas their actual budget could reach. The test for this
  type is simple: does the investor state a concrete budget figure AND ask a "which/what/where"
  question about area(s), with no specific area named? If so, it's "budget_recommendation" — never
  "market_overview" (that's for a general market question with NO budget constraint at all) and
  never "area_report"/"roi" (those require a specific named area — if the investor names an area
  AND a budget together, e.g. "is JVC affordable for 600k?", that stays "area_report"/"roi" for
  that named area, this type is only for a budget with no area named).
  - "budget": the AED figure stated, as a plain number (e.g. "600k" -> 600000, "AED 1.2 million"
    -> 1200000, "800,000" -> 800000). Always required for this question_type — never null.
  - No "area" is needed or expected — leave it null; the recommendation across areas IS the
    answer, not a lookup of one named area.
- Never invent values. If something wasn't in the question, it's null.
"""


def extract_entities(question: str) -> dict:
    # PHASE 1 SPEED FIX: entity extraction is a much simpler task than
    # Stage 5's persona-framed answer writing — it doesn't need PRIMARY_MODEL
    # as the first attempt. FALLBACK_MODEL was already wired in, already
    # proven to produce valid output against this exact prompt (it's the
    # existing on-failure fallback), just never tried first. Reliability
    # contract is UNCHANGED: still two attempts, still two different
    # models — only which one goes first flipped, for speed on the common
    # (non-error) path.
    #
    # SEPARATE FIX, found while making this change: json.loads(raw) used
    # to sit OUTSIDE this try/except entirely — a response that failed to
    # parse as valid JSON (from either model) would crash the request
    # instead of falling back, same as an API-level error would. Moved
    # inside so a parse failure on the fast model is treated the same as
    # any other failure and retried on PRIMARY_MODEL, not left to crash.
    try:
        completion = groq_client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[
                {"role": "system", "content": ENTITY_EXTRACTION_PROMPT},
                {"role": "user", "content": question},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        entities = json.loads(completion.choices[0].message.content)
    except Exception as e:
        logger.warning("Stage 2: fast model failed (%s), trying primary", e)
        completion = groq_client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[
                {"role": "system", "content": ENTITY_EXTRACTION_PROMPT},
                {"role": "user", "content": question},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        entities = json.loads(completion.choices[0].message.content)

    entities.setdefault("question_type", "legal_or_general")
    entities.setdefault("area", None)
    entities.setdefault("area2", None)
    entities.setdefault("project", None)
    entities.setdefault("developer", None)
    entities.setdefault("bedrooms", None)
    entities.setdefault("budget", None)
    entities.setdefault("wants_transaction_list", False)
    entities.setdefault("transaction_count", None)
    entities.setdefault("wants_trend", False)
    entities.setdefault("ranking_metric", None)
    entities.setdefault("ranking_year", None)
    entities.setdefault("ranking_limit", None)
    # Per Section 5.2: is_followup is Stage 3's decision, never guessed
    # here — Stage 2 deliberately stays ignorant of conversation history
    # (see stage3_detect_followup.py's docstring for why); the wiring
    # layer overwrites this after Stage 3 runs (Beta v1 onward).
    entities["is_followup"] = False

    # Habit #2: make this stage's decision visible while building.
    logger.info(
        "Stage 2 decided: question_type=%s area=%r area2=%r project=%r developer=%r "
        "bedrooms=%r budget=%r wants_transaction_list=%s transaction_count=%r "
        "wants_trend=%s",
        entities["question_type"], entities["area"], entities["area2"], entities["project"],
        entities["developer"], entities["bedrooms"], entities["budget"],
        entities["wants_transaction_list"], entities["transaction_count"],
        entities["wants_trend"],
    )
    return entities

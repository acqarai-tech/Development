"""
stage2_extract_entities.py — Stage 2, standalone
==================================================
Per Section 5.4 habit #1: this is built and verified completely on its own
before Stage 4 or Stage 5 exist. It only depends on clients.py (the Groq
client) — nothing about Supabase, nothing about answer-writing.

Per Section 5.2, the target output shape is:
{
  "question_type": "area_report" | "comparison" | "project_price" |
                    "developer_lookup" | "roi" | "legal_or_general",
  "area": string or null,
  "project": string or null,
  "developer": string or null,
  "bedrooms": number or null,
  "budget": number or null,
  "wants_transaction_list": false,
  "transaction_count": number or null,
  "is_followup": false   # ALWAYS false here — Stage 3 sets this for real,
                          # and Stage 3 doesn't exist yet in Beta v0.
}
"""
import json

from clients import groq_client, logger, PRIMARY_MODEL, FALLBACK_MODEL


ENTITY_EXTRACTION_PROMPT = """You extract structured information from a real-estate investor's
question about the Dubai property market. You do not answer the question — you only extract.

Return ONLY a JSON object, no other text, no markdown fences, matching exactly this shape:

{
  "question_type": "area_report" | "comparison" | "project_price" | "developer_lookup" | "roi" | "legal_or_general",
  "area": string or null,
  "project": string or null,
  "developer": string or null,
  "bedrooms": number or null,
  "budget": number or null,
  "wants_transaction_list": true or false,
  "transaction_count": number or null
}

Rules:
- "area" should be the plain community/area name as the user said it (e.g. "JVC", "Dubai Marina").
  Do not guess an area that was not mentioned or implied. If none was mentioned, use null.
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
- Beta v0 only handles single-area questions. If two areas are being compared, still set
  question_type to "comparison" and put the FIRST area mentioned in "area".
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
    # Per Section 5.2: is_followup is Stage 3's decision, never guessed
    # here — hardcoded False until Stage 3 actually exists (Beta v1).
    entities["is_followup"] = False

    # Habit #2: make this stage's decision visible while building.
    logger.info(
        "Stage 2 decided: question_type=%s area=%r project=%r developer=%r "
        "bedrooms=%r budget=%r wants_transaction_list=%s transaction_count=%r",
        entities["question_type"], entities["area"], entities["project"],
        entities["developer"], entities["bedrooms"], entities["budget"],
        entities["wants_transaction_list"], entities["transaction_count"],
    )
    return entities

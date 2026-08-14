

import os
import re
import json
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("acqar-chat")

# ---------------------------------------------------------------------------
# Stage 0 — credentials & clients
# ---------------------------------------------------------------------------
# These read from the SAME environment your existing backend already runs
# in (Railway env vars) — no separate deployment, no separate .env needed.
# Just make sure these four are added to your existing Railway service's
# environment variables (Section 11 flags checking this is already worth
# doing): GROQ_API_KEY, SUPABASE_URL_CHAT, SUPABASE_SERVICE_ROLE_KEY_CHAT,
# BACKEND_URL.
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL_CHAT", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY_CHAT", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama3-70b-8192"
BACKEND = os.getenv("BACKEND_URL", "https://development-production-2ad3.up.railway.app")

# Beta v0 deliberately only trusts the areas it actually has depth on
# (Section 6). Placeholder — replace with the real ~150-area list, or load
# it from a Supabase reference table (Section 5.5 notes this gap).
KNOWN_AREAS = {
    "jvc": "jvc",
    "jumeirah village circle": "jvc",
    # Confirmed live: DLD/avm files Downtown Dubai transactions under
    # "Burj Khalifa", not "Downtown Dubai" (issue #1/#6 in the architecture
    # review — this is exactly that class of mismatch).
    "downtown": "burj khalifa",
    "downtown dubai": "burj khalifa",
    "burj khalifa": "burj khalifa",
    "dubai marina": "dubai marina",
    "marina": "dubai marina",
    "dubai hills estate": "dubai hills estate",
    "dubai hills": "dubai hills",
    "business bay": "business bay",
    "palm jumeirah": "palm jumeirah",
    "arjan": "arjan",
}


# ---------------------------------------------------------------------------
# Request / response shapes
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    grounded: bool
    area: Optional[str] = None
    debug: Optional[dict] = None


# ---------------------------------------------------------------------------
# Stage 1 — receive the question
# ---------------------------------------------------------------------------
def receive_question(raw_message: str) -> str:
    """Section 5.4 habit #3: never modify the user's original message."""
    return raw_message.strip()


# ---------------------------------------------------------------------------
# Stage 2 — extract intent & entities (Section 5.2)
# ---------------------------------------------------------------------------
ENTITY_EXTRACTION_PROMPT = """You extract structured information from a real-estate investor's
question about the Dubai property market. You do not answer the question — you only extract.

Return ONLY a JSON object, no other text, no markdown fences, matching exactly this shape:

{
  "question_type": "area_report" | "comparison" | "project_price" | "developer_lookup" | "roi" | "legal_or_general",
  "area": string or null,
  "bedrooms": number or null,
  "budget": number or null
}

Rules:
- "area" should be the plain community/area name as the user said it (e.g. "JVC", "Dubai Marina").
  Do not guess an area that was not mentioned or implied. If none was mentioned, use null.
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
        logger.warning("Primary model failed on extraction (%s), trying fallback", e)
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
    entities.setdefault("bedrooms", None)
    entities.setdefault("budget", None)
    return entities


def _normalize_area(area: Optional[str]) -> Optional[str]:
    if not area:
        return None
    candidate = area.strip().lower()
    for alias, canonical in KNOWN_AREAS.items():
        if candidate == alias or candidate in alias or alias in candidate:
            return canonical
    return None


# ---------------------------------------------------------------------------
# Stage 3 — look up real data (Section 5.1 Stage 4)
# ---------------------------------------------------------------------------
def lookup_area_data(area: Optional[str]) -> Optional[dict]:
    """
    Queries the real `avm` table (1.65M+ transaction rows, confirmed live).
    The area column is `area_name_en` (e.g. "Jumeirah Village Circle (JVC)")
    — NOT `area`. This table is per-transaction, not one summary row per
    area, so this pulls the most recent transactions for the area and
    aggregates them in Python rather than expecting a single row back.
    """
    normalized = _normalize_area(area)
    if not normalized:
        return None

    try:
        result = (
            supabase.table("avm")
            .select("area_name_en, price_per_sqm, actual_worth, instance_date")
            .ilike("area_name_en", f"%{normalized}%")
            .order("instance_date", desc=True)
            .limit(500)
            .execute()
        )
    except Exception as e:
        logger.error("Supabase lookup failed: %s", e)
        return None

    rows = result.data or []
    if not rows:
        return None

    prices = [r["price_per_sqm"] for r in rows if r.get("price_per_sqm") is not None]
    worths = [r["actual_worth"] for r in rows if r.get("actual_worth") is not None]
    if not prices and not worths:
        return None

    return {
        "area": rows[0]["area_name_en"],
        "transaction_sample_size": len(rows),
        "avg_price_per_sqm": round(sum(prices) / len(prices)) if prices else None,
        "avg_actual_worth": round(sum(worths) / len(worths)) if worths else None,
        "most_recent_transaction_date": rows[0]["instance_date"],
    }


# ---------------------------------------------------------------------------
# Stage 4 — build the answer, honestly (Section 5.1 Stage 5)
# ---------------------------------------------------------------------------
ANSWER_WITH_DATA_PROMPT = """ANSWER_WITH_DATA_PROMPT = """You are Acqar's real-estate investment assistant. You have real transaction
data below — use it to actually answer the investor's question with a
clear, direct take (e.g. whether the numbers suggest strength, caution, or
mixed signals), not just a description of what fields exist.

Hard rule: every number you state (price, value, transaction count, date)
must come from the data below. Never invent a number that isn't there. But
within that rule, you should analyze, compare, and give a real opinion
grounded in these numbers — that's the whole point of this data existing.

This data is area-wide only — it has NO breakdown by bedroom count, unit
size, or unit type. If the question asks about a specific size, bedroom
count, or unit type (e.g. "1BR," "studio," "70 sqm"), you must NOT assume
a typical size and multiply it by avg_price_per_sqm to produce a specific
price. That number would be invented, even though one of its ingredients
is real. Instead, state the area-wide average plainly and say directly
that a size/bedroom-specific number isn't available in this data.

If the data is thin (small sample size) or dated, say so as a caveat, not
as a reason to refuse to answer.

Data (from Acqar's own database, ground truth):
{data}
"""
"""

NO_DATA_FALLBACK = (
    "I don't have verified data for that area yet in Acqar's database. "
    "I don't want to guess at real numbers, so I won't invent a yield, price, "
    "or trend here. Once that data is added this will improve — in the meantime "
    "I'm happy to help with general, non-numeric guidance if that's useful."
)


def build_answer(question: str, entities: dict, data: Optional[dict]) -> tuple[str, bool]:
    if data is None:
        return NO_DATA_FALLBACK, False

    try:
        completion = groq_client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": ANSWER_WITH_DATA_PROMPT.format(data=json.dumps(data, default=str)),
                },
                {"role": "user", "content": question},
            ],
            temperature=0.2,
        )
        answer = completion.choices[0].message.content
    except Exception as e:
        logger.warning("Primary model failed on answer (%s), trying fallback", e)
        completion = groq_client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": ANSWER_WITH_DATA_PROMPT.format(data=json.dumps(data, default=str)),
                },
                {"role": "user", "content": question},
            ],
            temperature=0.2,
        )
        answer = completion.choices[0].message.content

    return answer, True


# ---------------------------------------------------------------------------
# Stage 5 — guardrails: the tests every response must pass (Section 8)
# ---------------------------------------------------------------------------
class GuardrailFailure(Exception):
    pass


def run_guardrails(answer: str, grounded: bool) -> None:
    """Corresponds to Beta v0 tests T1, T4, T8, T15 — see tests/test_pipeline.py."""
    if not grounded:
        looks_like_data = re.search(r"(AED\s?[\d,]+|\d+(\.\d+)?\s?%|per\s?sq\s?ft)", answer, re.I)
        if looks_like_data:
            raise GuardrailFailure("Ungrounded answer contains data-shaped numbers")

    if any(token in answer for token in ("Traceback", "Exception", "NoneType", "KeyError")):
        raise GuardrailFailure("Answer leaked an internal error string")

    if not answer or not answer.strip():
        raise GuardrailFailure("Empty answer")


# ---------------------------------------------------------------------------
# Route — wires stages 1-5 together
# ---------------------------------------------------------------------------
@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    question = receive_question(req.message)
    if not question:
        raise HTTPException(status_code=400, detail="Empty message")

    entities = extract_entities(question)
    data = lookup_area_data(entities.get("area"))
    answer, grounded = build_answer(question, entities, data)

    try:
        run_guardrails(answer, grounded)
    except GuardrailFailure as e:
        logger.error("Guardrail failed (%s) — falling back to honest no-data response", e)
        answer, grounded = NO_DATA_FALLBACK, False

    return ChatResponse(
        answer=answer,
        grounded=grounded,
        area=_normalize_area(entities.get("area")),
        debug={"entities": entities, "had_data": data is not None},
    )

"""
Acqar /chat — Beta v0 (Foundation)
==================================

What this file is, and isn't:

- This is the FIRST phase from the architecture review (Section 6, Beta v0):
  single question in, single answer out, no multi-turn, only known-area
  lookups, and an honest "I don't have data on that yet" whenever the
  database has nothing — never an invented number.
- It is a NEW file, not an edit to ai_chat.py, per Section 5's instruction
  not to patch the old pipeline in place.
- It does NOT yet include: multi-turn / follow-up detection (Beta v1),
  project/developer lookups (Beta v2), the advisor popup (Beta v3), or
  outlier filtering (Beta v4). Building those into this file too early is
  exactly the mistake Section 5.4 warns against ("build one stage at a
  time").

The pipeline (Section 5.1), each stage its own function so it can be
unit-tested on its own (see tests/test_pipeline.py):

  1. receive_question       -> take the raw message, untouched
  2. extract_entities        -> ask the model what the user is asking about
  3. lookup_area_data        -> query Supabase (the `avm` table) for that area
  4. build_answer            -> honest answer: real data, or a plain "no data"
  5. run_guardrails           -> the tests every response must pass before
                                 it's allowed to reach the user
  6. /chat endpoint          -> wires 1-5 together and returns a response the
                                 frontend can render, including a trustworthy
                                 `grounded` boolean

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

import os
import re
import json
import logging
from typing import Optional

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from supabase import create_client, Client

load_dotenv()  # reads a local .env file if present; no-op in most hosts (Railway/Vercel inject env vars directly)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("acqar-chat")

# ---------------------------------------------------------------------------
# Stage 0 — credentials & clients (exactly as given, nothing invented)
# ---------------------------------------------------------------------------
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL_CHAT", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY_CHAT", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama3-70b-8192"
BACKEND = os.getenv("BACKEND_URL", "https://development-production-2ad3.up.railway.app")

# Beta v0 deliberately only trusts the areas it actually has depth on
# (Section 6: "the existing ~150-area list, where the real DLD data is
# deepest"). This is a short placeholder — replace with the real list, or
# better, load it from a Supabase reference table once one exists
# (Section 5.5 / Beta v6 notes this gap).
KNOWN_AREAS = [
    "jvc", "jumeirah village circle",
    "downtown", "downtown dubai",
    "dubai marina",
    "dubai hills estate", "dubai hills",
    "business bay",
    "palm jumeirah",
    "arjan",
]


# ---------------------------------------------------------------------------
# Request / response shapes
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    grounded: bool          # the trustworthy flag Section 5.1 Stage 7 asks for
    area: Optional[str] = None
    debug: Optional[dict] = None  # stage-by-stage trace (Section 5.4, habit #8)


# ---------------------------------------------------------------------------
# Stage 1 — receive the question
# ---------------------------------------------------------------------------
def receive_question(raw_message: str) -> str:
    """
    Section 5.4, habit #3: NEVER modify the user's original message.
    This function exists purely so every later stage reads from one place,
    and so it's obvious nothing upstream mutates it. Only a light strip()
    for whitespace — nothing else.
    """
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
  question_type to "comparison" and put the FIRST area mentioned in "area" — the comparison
  itself isn't answered yet, this is just extraction.
- Never invent values. If something wasn't in the question, it's null.
"""


def extract_entities(question: str) -> dict:
    """
    Stage 2. Runs fresh on the raw current message every time — there is no
    conversation history in Beta v0, so there is nothing to accidentally
    merge in (that merge bug is exactly what Section 4, issue #1 covers).
    """
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

    # Defensive defaults — Section 5.4 habit #4: decide the "nothing found"
    # case as deliberately as the "found it" case, right here, not later.
    entities.setdefault("question_type", "legal_or_general")
    entities.setdefault("area", None)
    entities.setdefault("bedrooms", None)
    entities.setdefault("budget", None)
    return entities


def _normalize_area(area: Optional[str]) -> Optional[str]:
    """Match a free-text area name against the known-area list. Returns the
    canonical lowercase name if matched, or None if not — never a guess."""
    if not area:
        return None
    candidate = area.strip().lower()
    for known in KNOWN_AREAS:
        if candidate == known or candidate in known or known in candidate:
            return known
    return None


# ---------------------------------------------------------------------------
# Stage 3 — look up real data (Section 5.1 Stage 4)
# ---------------------------------------------------------------------------
def lookup_area_data(area: Optional[str]) -> Optional[dict]:
    """
    Queries the Supabase `avm` table for one area. Returns the row as a
    dict, or None if there's genuinely nothing — that None is meaningful
    and must NOT be papered over downstream (Section 5.4 habit #4).

    NOTE: adjust the table/column names below to match your real `avm`
    schema — this assumes an `area` text column plus whatever numeric
    columns you're storing (price/yield/trend/volume). Nothing here should
    be trusted blindly; check it against `select * from avm limit 1` first.
    """
    normalized = _normalize_area(area)
    if not normalized:
        return None

    try:
        result = (
            supabase.table("avm")
            .select("*")
            .ilike("area", f"%{normalized}%")
            .limit(1)
            .execute()
        )
    except Exception as e:
        logger.error("Supabase lookup failed: %s", e)
        return None

    rows = result.data or []
    return rows[0] if rows else None


# ---------------------------------------------------------------------------
# Stage 4 — build the answer, honestly (Section 5.1 Stage 5)
# ---------------------------------------------------------------------------
ANSWER_WITH_DATA_PROMPT = """You are Acqar's real-estate investment assistant. Answer the
investor's question using ONLY the data provided below. Do not add numbers, prices, yields,
or trends that are not present in this data. If the data doesn't fully answer part of the
question, say so plainly rather than filling the gap.

Data (from Acqar's own database, ground truth):
{data}
"""

NO_DATA_FALLBACK = (
    "I don't have verified data for that area yet in Acqar's database. "
    "I don't want to guess at real numbers, so I won't invent a yield, price, "
    "or trend here. Once that data is added this will improve — in the meantime "
    "I'm happy to help with general, non-numeric guidance if that's useful."
)


def build_answer(question: str, entities: dict, data: Optional[dict]) -> tuple[str, bool]:
    """
    Stage 5. Returns (answer_text, grounded).

    grounded=True only when we are answering from real Supabase data.
    Beta v0 has no "general knowledge, clearly labeled" branch beyond the
    plain fallback message above — that richer branch (Section 5.1 Stage 5)
    is worth adding once Beta v0's core loop is proven, not before.
    """
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
    """Raised when a response fails a guardrail. Caught in the endpoint and
    turned into the honest fallback rather than ever reaching the user."""


def run_guardrails(answer: str, grounded: bool) -> None:
    """
    These correspond to the Beta v0 tests in Section 8: T1 (real numbers for
    a known area), T4 (no invented numbers when there's no data), T8 (an
    ungrounded answer must never be styled as data), T15 (no leaking
    internal errors into the answer).

    This is intentionally simple pattern-matching, not a replacement for the
    real T1-T16 checklist — see tests/test_pipeline.py for that.
    """
    # T4 / T8 — if we told the frontend this is ungrounded, the text itself
    # must not look like a confident data answer (AED figures, %, sqft).
    if not grounded:
        looks_like_data = re.search(r"(AED\s?[\d,]+|\d+(\.\d+)?\s?%|per\s?sq\s?ft)", answer, re.I)
        if looks_like_data:
            raise GuardrailFailure("Ungrounded answer contains data-shaped numbers")

    # T15 — never let a raw exception/traceback leak into the user-facing text.
    if any(token in answer for token in ("Traceback", "Exception", "NoneType", "KeyError")):
        raise GuardrailFailure("Answer leaked an internal error string")

    if not answer or not answer.strip():
        raise GuardrailFailure("Empty answer")


# ---------------------------------------------------------------------------
# Endpoint — wires stages 1-5 together
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
        # Section 5.4 habit #8: log the real decision, don't hide it.
        logger.error("Guardrail failed (%s) — falling back to honest no-data response", e)
        answer, grounded = NO_DATA_FALLBACK, False

    return ChatResponse(
        answer=answer,
        grounded=grounded,
        area=_normalize_area(entities.get("area")),
        debug={"entities": entities, "had_data": data is not None},
    )


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="Acqar /chat — Beta v0")

app.add_middleware(
    CORSMiddleware,
    # Beta v0 runs on a separate URL/branch per Section 6 — tighten this to
    # your actual frontend origin once that's decided, don't ship "*" to prod.
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "backend": BACKEND, "primary_model": PRIMARY_MODEL}

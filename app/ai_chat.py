"""
chat.py — Acqar /chat Beta v0(+) pipeline (router only)
=====================================================
This file does NOT define Stage 2, 4, or 5 itself — they were already
built and verified independently (see stage2_extract_entities.py,
stage4_lookup_area_data.py, stage5_build_answer.py, each with its own
passing test file). This file's only job is Stage 1 (receive), routing
to the right Stage 4 lookup based on Stage 2's question_type, Stage 6
(guardrails), and wiring everything together behind one endpoint.

NOTE ON FILENAME: this file is imported elsewhere in the live app as
`ai_chat` (see app.py: `from ai_chat import router as ai_chat_router`).
The test suite imports it as `import chat` — keep a `chat.py` that does
`from ai_chat import *` alongside this file (or rename the test imports)
so `pytest` collects cleanly from a fresh checkout. See repo review notes.

Mount into your EXISTING FastAPI app:

    from ai_chat import router as ai_chat_router
    app.include_router(ai_chat_router)

Copy clients.py, stage2_extract_entities.py, stage4_lookup_area_data.py,
and stage5_build_answer.py alongside this file — chat.py imports from all
four.

CHANGE LOG (this version):
- New question_type routing: "list_areas" -> get_all_areas(),
  "area_properties" -> get_district_properties().
- wants_trend (from Stage 2) now triggers get_price_trend() ON TOP OF
  the normal area_report lookup, merged into the same data dict Stage 5
  sees, under the "price_trend" key.
- ChatResponse gained chart_data — the same price_trend series, exposed
  separately so the frontend can draw a real chart. Text alone can't
  carry a chart; the answer text still gets one summary bullet on trend
  direction (per Stage 5's prompt), the numbers for the actual chart
  come from this field.
"""
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from clients import logger
from stage2_extract_entities import extract_entities
from stage4_lookup_area_data import (
    lookup_area_data,
    get_recent_transactions,
    get_all_areas,
    get_district_properties,
    get_price_trend,
)
from stage5_build_answer import build_answer, NO_DATA_FALLBACK

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


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
    """Stage 6. Corresponds to Beta v0 tests T1, T4, T8, T15."""
    if not grounded:
        looks_like_data = re.search(r"(AED\s?[\d,]+|\d+(\.\d+)?\s?%|per\s?sq\s?ft)", answer, re.I)
        if looks_like_data:
            raise GuardrailFailure("Ungrounded answer contains data-shaped numbers")

    if any(token in answer for token in ("Traceback", "Exception", "NoneType", "KeyError")):
        raise GuardrailFailure("Answer leaked an internal error string")

    if not answer or not answer.strip():
        raise GuardrailFailure("Empty answer")


def _build_lookup_data(entities: dict):
    """
    Routes to the right Stage 4 call(s) based on Stage 2's question_type,
    and layers a price trend on top when wants_trend is set. Isolated
    from chat() itself so this routing logic has one obvious home and
    chat() stays a thin wire-up, matching the rest of this file's style.
    """
    question_type = entities.get("question_type")
    area = entities.get("area")

    if question_type == "list_areas":
        areas = get_all_areas()
        return {"all_areas": areas} if areas else None

    if question_type == "area_properties":
        properties, total = get_district_properties(area)
        if not properties:
            return None
        return {"area": area, "properties": properties, "total_property_count": total}

    # Default path — ordinary area/project/bedroom lookup.
    data = lookup_area_data(area, bedrooms=entities.get("bedrooms"))

    if entities.get("wants_transaction_list") and data is not None:
        count = entities.get("transaction_count") or 10
        transactions = get_recent_transactions(area, limit=count)
        if transactions:
            data["recent_transactions"] = transactions

    if entities.get("wants_trend") and data is not None:
        trend = get_price_trend(area, bedrooms=entities.get("bedrooms"))
        if trend:
            data["price_trend"] = trend

    return data


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    question = receive_question(req.message)
    if not question:
        raise HTTPException(status_code=400, detail="Empty message")

    entities = extract_entities(question)          # Stage 2, already proven alone
    data = _build_lookup_data(entities)             # Stage 4 routing, new in this version

    answer, grounded = build_answer(question, entities, data)  # Stage 5, already proven alone

    try:
        run_guardrails(answer, grounded)
    except GuardrailFailure as e:
        logger.error("Guardrail failed (%s) — falling back to honest no-data response", e)
        answer, grounded = NO_DATA_FALLBACK, False

    from clients import normalize_area

    chart_data = data.get("price_trend") if isinstance(data, dict) else None

    # Habit #2: log the wired-together decision, not just each stage alone.
    logger.info(
        "Wired pipeline decided: question_type=%s area=%r grounded=%s had_data=%s has_chart=%s",
        entities.get("question_type"), entities.get("area"), grounded,
        data is not None, chart_data is not None,
    )

    return ChatResponse(
        answer=answer,
        grounded=grounded,
        area=normalize_area(entities.get("area")) if entities.get("question_type") != "list_areas" else None,
        chart_data=chart_data,
        debug={"entities": entities, "had_data": data is not None},
    )

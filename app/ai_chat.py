"""
chat.py — Acqar /chat Beta v0 pipeline (router only)
=====================================================
This file does NOT define Stage 2, 4, or 5 itself — they were already
built and verified independently (see stage2_extract_entities.py,
stage4_lookup_area_data.py, stage5_build_answer.py, each with its own
passing test file). This file's only job is Stage 1 (receive), Stage 6
(guardrails), and wiring the three proven stages together behind one
endpoint.

Mount into your EXISTING FastAPI app:

    from chat import router as chat_router
    app.include_router(chat_router, prefix="/v2")

Copy clients.py, stage2_extract_entities.py, stage4_lookup_area_data.py,
and stage5_build_answer.py alongside this file — chat.py imports from all
four.
"""
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from clients import logger
from stage2_extract_entities import extract_entities
from stage4_lookup_area_data import lookup_area_data, get_recent_transactions
from stage5_build_answer import build_answer, NO_DATA_FALLBACK

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    grounded: bool
    area: Optional[str] = None
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


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    question = receive_question(req.message)
    if not question:
        raise HTTPException(status_code=400, detail="Empty message")

    entities = extract_entities(question)          # Stage 2, already proven alone
    data = lookup_area_data(entities.get("area"), bedrooms=entities.get("bedrooms"))  # Stage 4, already proven alone

    if entities.get("wants_transaction_list") and data is not None:
        count = entities.get("transaction_count") or 10
        transactions = get_recent_transactions(entities.get("area"), limit=count)
        if transactions:
            data["recent_transactions"] = transactions

    answer, grounded = build_answer(question, entities, data)  # Stage 5, already proven alone

    try:
        run_guardrails(answer, grounded)
    except GuardrailFailure as e:
        logger.error("Guardrail failed (%s) — falling back to honest no-data response", e)
        answer, grounded = NO_DATA_FALLBACK, False

    from clients import normalize_area

    # Habit #2: log the wired-together decision, not just each stage alone.
    logger.info(
        "Wired pipeline decided: area=%r grounded=%s had_data=%s",
        entities.get("area"), grounded, data is not None,
    )

    return ChatResponse(
        answer=answer,
        grounded=grounded,
        area=normalize_area(entities.get("area")),
        debug={"entities": entities, "had_data": data is not None},
    )

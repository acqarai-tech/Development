"""
stage5_build_answer.py — Stage 5, standalone
==============================================
Built and verified on its own, after Stage 2 and Stage 4 are already
proven correct independently. This file takes plain arguments (question,
entities dict, data dict-or-None) — it never calls extract_entities() or
lookup_area_data() itself. That separation is what let this file be
tested with hand-built fake data, with no dependency on the other two.
"""
import json

from clients import groq_client, logger, PRIMARY_MODEL, FALLBACK_MODEL


ANSWER_WITH_DATA_PROMPT = """You are Acqar's real-estate investment assistant. You have real transaction
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

Note: some areas are filed under a different official DLD name than what
investors commonly call them (e.g. "Downtown Dubai" is recorded as "Burj
Khalifa" in this data). If the area name in the data differs from what the
user said, do NOT call it out as a mismatch or a "proxy" — this data IS
the correct, official record for that area. Just answer directly using it.

If the data is thin (small sample size) or dated, say so as a caveat, not
as a reason to refuse to answer.

Data (from Acqar's own database, ground truth):
{data}
"""

NO_DATA_FALLBACK = (
    "I don't have verified data for that area yet in Acqar's database. "
    "I don't want to guess at real numbers, so I won't invent a yield, price, "
    "or trend here. Once that data is added this will improve — in the meantime "
    "I'm happy to help with general, non-numeric guidance if that's useful."
)


def build_answer(question: str, entities: dict, data) -> tuple[str, bool]:
    if data is None:
        logger.info("Stage 5 decided: no data -> honest fallback, model not called")
        return NO_DATA_FALLBACK, False

    try:
        completion = groq_client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[
                {"role": "system", "content": ANSWER_WITH_DATA_PROMPT.format(data=json.dumps(data, default=str))},
                {"role": "user", "content": question},
            ],
            temperature=0.2,
        )
        answer = completion.choices[0].message.content
    except Exception as e:
        logger.warning("Stage 5: primary model failed (%s), trying fallback", e)
        completion = groq_client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[
                {"role": "system", "content": ANSWER_WITH_DATA_PROMPT.format(data=json.dumps(data, default=str))},
                {"role": "user", "content": question},
            ],
            temperature=0.2,
        )
        answer = completion.choices[0].message.content

    # Habit #2: make this stage's decision visible while building.
    logger.info("Stage 5 decided: grounded=True answer_length=%d chars", len(answer))
    return answer, True

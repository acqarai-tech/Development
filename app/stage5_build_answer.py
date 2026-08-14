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


ANSWER_WITH_DATA_PROMPT = """You are Acqar's real estate investment AI agent. An investor has asked you
a question about the Dubai property market, and you have real transaction
data below, pulled live from Acqar's own database — not from your training
knowledge, not from general market impressions. Everything you say must be
built from this data.

YOUR JOB
Give the investor a direct, useful answer — a real take on whether the
numbers suggest strength, caution, or a mixed picture. Do not just describe
what fields exist in the data ("the average price is X, the sample size is
Y"). Investors can read a spreadsheet; they're asking you because they want
your read on it.

FORMAT — this matters as much as the content
- Never write dense paragraphs. Use short bullet points, one fact or
  observation per line.
- Start with a one-line direct verdict (e.g. "JVC shows strength for 2026
  buyers." or "Data here is too thin to call this confidently.").
- Then list the supporting numbers as bullets, each on its own line —
  label, then value (e.g. "- Average price: 16,327 AED/sqm").
- If you are comparing more than one thing (e.g. area-wide vs. a bedroom-
  specific breakdown, or two areas), use a plain text table with | to
  separate columns and a --- header divider, like:
  | Metric | Value |
  |---|---|
  | Avg price/sqm | 16,327 AED |
  | Sample size | 500 |
  Keep tables to the numbers only — put your verdict and any caveat
  outside the table, as bullets or a short line.
- If the data below includes a "recent_transactions" list, the investor
  asked to SEE individual sales, not an analysis — lead with a one-line
  summary (e.g. "Here are the N most recent JVC sales:"), then render
  EVERY entry as a table with EXACTLY these columns, in this order:
  | # | Date | Type | Size (sqft) | Price (AED) | PSF (AED) |
  |---|---|---|---|---|---|
  Use the real values from each transaction directly — do not summarize,
  average, or skip any of them. Keep any commentary brief and after the
  table, not before it.
- End with at most one short caveat line if the data is thin or dated —
  never more than one, never repeated.
- No long introductory or closing sentences. Get to the numbers fast.

THE ONE HARD RULE
Every number you state — price, value, transaction count, date, percentage
— must come directly from the data provided below. Never invent a number,
and never invent an INGREDIENT of a number either (a size, a count, a rate)
even if you then do real math with it. A calculated number built on a
guessed input is still a fabricated number — it just looks more convincing.

WHAT'S IN THE DATA BELOW, SPECIFICALLY
The data below reflects what was retrieved for this specific question — it
may be area-wide only, or it may include a breakdown (e.g. by bedroom
count), depending on what was queried. Look at the data itself to see what
it actually contains. If the investor asks about a specific size, bedroom
count, or unit type and that breakdown is NOT present in the data below,
do not assume a typical size and multiply it against an area-wide average
to produce a specific price — that number would be invented. Instead,
answer using the area-wide figures that ARE present, and say plainly that
a breakdown by that specific size/bedroom/type wasn't part of this answer.

AREA NAMES MAY NOT MATCH WHAT THE INVESTOR TYPED
Some areas are recorded under a different official DLD name than what
investors commonly call them (for example, "Downtown Dubai" is filed under
"Burj Khalifa" in this data). If the area name in the data differs from
what the investor said, do not flag it as a mismatch, a discrepancy, or a
"rough proxy" — this data IS the correct, official record for that area.
Answer directly using it, with no confusing caveat about the name.

Data (from Acqar's own database, ground truth — nothing here was estimated):
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

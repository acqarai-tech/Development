"""
stage5_build_answer.py — Stage 5, standalone
==============================================
Built and verified on its own, after Stage 2 and Stage 4 are already
proven correct independently. This file takes plain arguments (question,
entities dict, data dict-or-None) — it never calls extract_entities() or
lookup_area_data() itself. That separation is what let this file be
tested with hand-built fake data, with no dependency on the other two.

CHANGE LOG (this version):
- BUG FIX, confirmed live: "list_areas" answers were being truncated by
  the LLM partway through the 397-row table (cut off around D379/397),
  despite the prompt explicitly saying "render every area, never a
  sample." Asking a model to verbatim-echo a long list reliably is not
  something prompt wording alone fixes — models truncate, paraphrase, or
  silently stop on long enough output regardless of instruction.
  FIX: "list_areas" and "area_properties" answers are now built directly
  in Python (_format_list_areas / _format_district_properties below) and
  NEVER sent through the LLM at all. This guarantees every row is
  present — it's just string formatting, there's nothing for a model to
  get right or wrong — and it's also faster and cheaper, since these two
  question types never needed the model's judgment in the first place.
- Every price bullet/table still requires BOTH AED/sqm and AED/sqft
  (unchanged from previous version) for the question types that DO go
  through the LLM (area_report, project_price, comparison, etc.).
"""
import json
import re

from clients import groq_client, logger, PRIMARY_MODEL, FALLBACK_MODEL


ANSWER_WITH_DATA_PROMPT = """You are Acqar's real estate investment AI agent. An investor has asked you
a question about the Dubai property market, and you have real data below,
pulled live from Acqar's own database — not from your training knowledge,
not from general market impressions. Everything you say must be built
from this data.

YOUR JOB
Give the investor a direct, useful answer. For an investment/analysis
question, that means a real take on whether the numbers suggest strength,
caution, or a mixed picture — not just a description of what fields exist
("the average price is X, the sample size is Y").

FORMAT — this matters as much as the content, and applies to every answer
- Always start with exactly one summary line — a direct verdict (e.g.
  "JVC shows strength for 2026 buyers."). Never skip this line, and
  never write more than one.
- Never write dense paragraphs after that. Use short bullet points, one
  fact or observation per line.
- Any list of 2+ items, or a comparison between things, is a markdown
  table with | separating columns and a --- header divider — never a
  bulleted list of similar-shaped items and never a paragraph. Keep
  tables to the raw values only; put your verdict and any caveat outside
  the table, as bullets or the summary line. Keep table headers SHORT
  (e.g. "PSM" not "Price per Square Meter (AED)") — a wide table with
  long headers overflows the chat width on the frontend.
- HARD RULE — every price you state, anywhere, in a bullet or a table
  column, must show BOTH AED/sqm and AED/sqft together. Use the
  avg_price_per_sqft value already present in the data — never calculate
  it yourself. Example bullet: "- Average price: 16,327 AED/sqm (1,517
  AED/sqft)". In a table, use two separate columns: "PSM (AED)" and
  "PSF (AED)", both filled from the data provided, never computed by you.
- ALWAYS end with a short Conclusion — one to two sentences synthesizing
  what the numbers mean for the investor, distinct from the opening
  summary line (which is the verdict; the conclusion is the reasoning
  behind it, or the practical takeaway). This is required, not optional
  — never end on a bare table or bullet list with nothing after it.
  Every claim in the conclusion must still trace back to a real number
  already stated above — no new facts, just synthesis of what's already
  there.

DATA-SHAPE-SPECIFIC FORMATTING

- Recent transactions are handled separately (see build_answer below) —
  never sent through this prompt at all.

- If the data below includes "price_trend": a list of one entry per year
  (avg_price_per_sqm, avg_price_per_sqft, transaction_count). Do NOT
  render this as a big table of every year — a chart is shown separately
  alongside your answer for that. Instead, give ONE summary bullet on the
  overall direction and magnitude, computed only from the first and last
  year actually present in the data (e.g. "- Prices rose 18% from 2021 to
  2026 (14,200 -> 16,750 AED/sqm)"). If the trend data is thin (2 years
  or fewer, or any year has a very small transaction_count), say so
  plainly in that same bullet rather than overstating the trend.

- Otherwise (ordinary area/project/bedroom analysis): list the supporting
  numbers as bullets, one per line, each with the sqm+sqft pairing above.
  If comparing area-wide vs. a bedroom-specific breakdown, use a table.

- Do NOT add a caveat, disclaimer, or closing line about sample size or
  transaction count — never write anything like "Data is based on a
  sample size of 500 transactions" or similar. The data provided is
  already the real, complete dataset backing this answer; stating its
  size as a hedge adds no value to the investor and reads as an apology
  for data that isn't actually thin. If the transaction count is worth
  mentioning at all, state it as a plain bullet fact alongside the other
  numbers (e.g. "- Transactions analyzed: 500"), never as a disclaimer.
- The only caveat ever worth adding is if the most recent transaction
  date is genuinely old (e.g. over a year stale) — even then, at most
  one short line, stated as a fact, not an apology.
- No long introductory or closing sentences beyond the one summary line.
  Get to the numbers fast.

THE ONE HARD RULE
Every number you state — price, value, transaction count, date, percentage
— must come directly from the data provided below. Never invent a number,
and never invent an INGREDIENT of a number either (a size, a count, a rate)
even if you then do real math with it. A calculated number built on a
guessed input is still a fabricated number — it just looks more convincing.
The ONLY exception is the price_trend % change bullet above, which IS
real math, but only on two real numbers that are both present in the data.

WHAT'S IN THE DATA BELOW, SPECIFICALLY
The data below reflects what was retrieved for this specific question — it
may be area-wide only, or it may include a breakdown (e.g. by bedroom
count), a list, or a trend, depending on what was queried. Look at the
data itself to see what it actually contains. If the investor asks about
a specific size, bedroom count, or unit type and that breakdown is NOT
present in the data below, do not assume a typical size and multiply it
against an area-wide average to produce a specific price — that number
would be invented. Instead, answer using the figures that ARE present,
and say plainly that a breakdown by that specific size/bedroom/type
wasn't part of this answer.

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


def _format_list_areas(data: dict) -> str:
    """
    Deterministic, Python-built table — NEVER sent through the LLM. This
    is the fix for the confirmed live bug where the model truncated a
    397-row table around row 379. There's no judgment involved in listing
    areas, so there's no reason to risk a model's unreliable long-output
    behavior for it — every row is guaranteed present because Python
    wrote the string, not because a prompt asked nicely.
    """
    areas = data["all_areas"]
    lines = [f"We currently cover {len(areas)} areas across Dubai:", ""]
    lines.append("| District Code | District Name |")
    lines.append("|---|---|")
    for a in areas:
        lines.append(f"| {a.get('district_code', '')} | {a.get('district_name', '')} |")
    lines.append("")
    lines.append("Ask about any of these by name for pricing, recent sales, or trend data.")
    return "\n".join(lines)


def _format_district_properties(data: dict) -> str:
    """
    Same reasoning as _format_list_areas — deterministic, never truncated,
    never sent through the LLM. Honestly states the real total vs. the
    capped list actually shown (district_properties has 20,803 real rows;
    a single area can plausibly link to more than the display cap).
    """
    area = data.get("area", "this area")
    properties = data["properties"]
    total = data.get("total_property_count", len(properties))

    if total > len(properties):
        summary = f"{area} has {total} linked properties — showing the first {len(properties)}:"
    else:
        summary = f"{area} has {total} linked properties:"

    lines = [summary, "", "| # | Property Name |", "|---|---|"]
    for i, name in enumerate(properties, start=1):
        lines.append(f"| {i} | {name} |")
    lines.append("")
    lines.append("Ask about any of these by name for pricing and recent sales.")
    return "\n".join(lines)


def _strip_sample_size_caveat(answer: str) -> str:
    """
    Deterministic post-processing, not just a prompt instruction — same
    reasoning as the list_areas truncation fix: a prompt telling the
    model not to do something is not a guarantee. Removes any line that
    mentions "sample size" as a caveat, even if the model includes it
    despite being told not to. Collapses any blank-line gap the removal
    leaves behind.
    """
    lines = [ln for ln in answer.split("\n") if "sample size" not in ln.lower()]
    cleaned = "\n".join(lines)
    return re.sub(r"\n{3,}", "\n\n", cleaned).strip()


def _format_recent_transactions(data: dict) -> str:
    """
    Deterministic, Python-built table — NEVER sent through the LLM.
    Confirmed live: the model invented a uniform, wrong PSM value for
    every row in this table (real values ranged 14,872-39,615 AED/sqm
    for one real 10-row sample; the model showed 24,969 for all ten).
    Same fix as list_areas/area_properties — there's no judgment in
    listing real transactions, so there's no reason to risk the model
    getting the numbers wrong when Python can just print them correctly.

    CHANGE LOG (this version):
    - Confirmed live: some areas have almost no project_name_en recorded
      at all in the raw DLD feed (DAMAC Hills 2: 3.3% of 6,026
      transactions, vs. JVC at 97.8%) — a real data gap, not a bug
      (checked master_project_en too; 0% populated for that area, not a
      usable fallback). Showing "—" for every row with no explanation
      reads as broken. The fix is NOT to invent project names — that
      would reintroduce the exact fabrication bug already fixed twice in
      this file — it's to add one honest note explaining the gap when
      project coverage in this specific result is very low, so the
      investor understands why, instead of guessing an app bug.
    - Restructured into three parts, matching the requested template:
      Summary -> Table -> Conclusion. The conclusion is real computed
      statistics over the exact rows already shown (dominant unit type,
      price spread, the single priciest deal, blended average PSF) —
      never a new invented claim, just arithmetic on numbers already in
      the table, so there's nothing here for a model to get wrong either
      (this whole function still never touches the LLM).
    - Table headers shortened (e.g. "PSM (AED)" -> "PSM") — confirmed
      live the previous 8-column table with full headers overflowed the
      chat width on the frontend. Shortening helps but doesn't fully
      solve it — the frontend's .acqar-table has no CSS constraining its
      width at all (a separate, real bug on that side, flagged
      separately) — this is the content-side half of that fix.
    """
    area = data.get("area", "this area")
    transactions = data["recent_transactions"]

    # --- Summary ---
    lines = [f"Here are the {len(transactions)} most recent {area} sales:", ""]

    # --- Table ---
    lines.append("| # | Date | Type | Project | Sqft | PSM | PSF | Total (AED) |")
    lines.append("|---|---|---|---|---|---|---|---|")
    with_project = 0
    for i, t in enumerate(transactions, start=1):
        project = t.get("project") or "—"
        if t.get("project"):
            with_project += 1
        date = t.get("date") or "—"
        room_type = t.get("type") or "—"
        size = f"{t['size_sqft']:,}" if t.get("size_sqft") is not None else "—"
        psm = f"{t['psm_aed']:,}" if t.get("psm_aed") is not None else "—"
        psf = f"{t['psf_aed']:,}" if t.get("psf_aed") is not None else "—"
        price = f"{t['price_aed']:,}" if t.get("price_aed") is not None else "—"
        lines.append(f"| {i} | {date} | {room_type} | {project} | {size} | {psm} | {psf} | {price} |")

    if transactions and (with_project / len(transactions)) < 0.2:
        lines.append("")
        lines.append(
            f"_Project names aren't recorded for most {area} sales in DLD's "
            f"data ({with_project}/{len(transactions)} of these have one) — "
            f"shown as \u2014 where missing, never guessed._"
        )

    # --- Conclusion: real computed stats over these exact rows, no new claims ---
    conclusion = _summarize_transactions(area, transactions)
    if conclusion:
        lines.append("")
        lines.append(conclusion)

    return "\n".join(lines)


def _summarize_transactions(area: str, transactions: list) -> str:
    """
    Computes a short, real, data-grounded closing paragraph from the
    transactions already shown — dominant unit type, PSF range, the
    single priciest deal, blended average PSF. Every number here is
    arithmetic on values already present in the table above; nothing is
    inferred or estimated. Returns "" if there isn't enough real data to
    say anything honest (e.g. all types or all PSF values missing).
    """
    types = [t["type"] for t in transactions if t.get("type")]
    psf_values = [t["psf_aed"] for t in transactions if t.get("psf_aed") is not None]
    dates = sorted({t["date"] for t in transactions if t.get("date")})

    if not psf_values:
        return ""

    parts = []

    if types:
        dominant = max(set(types), key=types.count)
        dominant_count = types.count(dominant)
        if dominant_count > 1:
            parts.append(f"{dominant} units dominate this set ({dominant_count}/{len(transactions)})")

    low, high = min(psf_values), max(psf_values)
    if low != high:
        parts.append(f"PSF ranges {low:,}-{high:,} AED, reflecting floor/view/unit-size differences")
    else:
        parts.append(f"all priced at {low:,} AED/sqft")

    priciest = max(
        (t for t in transactions if t.get("price_aed") is not None),
        key=lambda t: t["price_aed"],
        default=None,
    )
    if priciest and priciest.get("project"):
        parts.append(
            f"the priciest deal was {priciest['project']} at {priciest['price_aed']:,} AED"
        )

    avg_psf = round(sum(psf_values) / len(psf_values))
    parts.append(f"blended average sits around {avg_psf:,} AED/sqft")

    date_span = f" across {dates[0]} to {dates[-1]}" if len(dates) > 1 else ""
    summary_text = "; ".join(parts)
    return f"A few quick observations{date_span}: {summary_text}."


def build_answer(question: str, entities: dict, data) -> tuple[str, bool]:
    if data is None:
        logger.info("Stage 5 decided: no data -> honest fallback, model not called")
        return NO_DATA_FALLBACK, False

    # --- Deterministic paths: bypass the LLM entirely, guaranteed complete ---
    if isinstance(data, dict) and "all_areas" in data:
        logger.info("Stage 5 decided: list_areas -> deterministic format, model not called")
        return _format_list_areas(data), True

    if isinstance(data, dict) and "properties" in data:
        logger.info("Stage 5 decided: area_properties -> deterministic format, model not called")
        return _format_district_properties(data), True

    if isinstance(data, dict) and "recent_transactions" in data:
        logger.info("Stage 5 decided: recent_transactions -> deterministic format, model not called")
        return _format_recent_transactions(data), True

    # --- Everything else still goes through the model, as before ---
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

    answer = _strip_sample_size_caveat(answer)

    # Habit #2: make this stage's decision visible while building.
    logger.info("Stage 5 decided: grounded=True answer_length=%d chars", len(answer))
    return answer, True

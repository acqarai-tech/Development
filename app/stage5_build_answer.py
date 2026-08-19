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

FORMAT — this matters as much as the content, and applies to every answer.
Every answer follows this exact structure: Heading -> Key Metrics -> (table,
if the data shape calls for one) -> Conclusion. Never skip a part, never
reorder them, never add anything outside this structure.

1. HEADING — the very first line, wrapped in **bold**, one direct verdict
   sentence (e.g. "**JVC shows strength for 2026 buyers.**"). Never skip
   it, never write more than one, never leave it unbolded.
2. KEY METRICS — a bold subheading line "**Key Metrics**" on its own,
   then short bullet points, one fact per line. Bold ONLY the actual
   number/value within each bullet, not the whole line (e.g. "- Average
   price: **16,327 AED/sqm** (**1,517 AED/sqft**)") — bolding everything
   defeats the purpose of bolding anything. Keep every bullet to 1-2
   short lines, max — if a fact needs more than that, split it into two
   bullets rather than writing one long one.
3. TABLE — any list of 2+ items, or a comparison between things, is a
   markdown table with | separating columns and a --- header divider —
   never a bulleted list of similar-shaped items and never a paragraph.
   Keep tables to the raw values only; the verdict and reasoning live in
   the Heading/Key Metrics/Conclusion, never inside the table itself.
   Keep table headers SHORT (e.g. "PSM" not "Price per Square Meter
   (AED)") — a wide table with long headers overflows the chat width on
   the frontend.
   - HARD RULE — every price you state, anywhere, in a bullet or a table
     column, must show BOTH AED/sqm and AED/sqft together. Use the
     avg_price_per_sqft value already present in the data — never
     calculate it yourself. In a table, use two separate columns: "PSM
     (AED)" and "PSF (AED)", both filled from the data provided, never
     computed by you.
4. CONCLUSION — always the last part, prefixed exactly "**Conclusion:**"
   (bold label, then plain text after it on the same line), one to two
   sentences synthesizing what the numbers mean for the investor —
   distinct from the Heading (which is the verdict; the Conclusion is
   the reasoning behind it, or the practical takeaway). Required, never
   optional — never end on a bare table or bullet list with nothing
   after it. Every claim here must still trace back to a real number
   already stated above — no new facts, just synthesis of what's there.

DATA-SHAPE-SPECIFIC FORMATTING

- Recent transactions are handled separately (see build_answer below) —
  never sent through this prompt at all.

- If the data below includes "price_trend": a list of one entry per year
  (avg_price_per_sqm, avg_price_per_sqft, transaction_count). Do NOT
  render ANY table for this yourself, and do not list out individual
  years — a complete year-by-year table is added automatically after
  your answer, and a chart is shown separately alongside it. Put ONE
  bullet under Key Metrics on the overall direction and magnitude,
  computed only from the first and last year actually present in the
  data (e.g. "- Prices rose **18%** from 2021 to 2026 (**14,200 ->
  16,750 AED/sqm**)"). If the trend data is thin (2 years or fewer, or
  any year has a very small transaction_count), say so plainly in that
  same bullet rather than overstating the trend.

- If the data below includes "rental_yield": a dict with avg_annual_rent,
  avg_rent_per_sqm, contract_count, most_recent_contract_start, and (only
  if both a sale price and a rent figure were actually available)
  gross_yield_pct — already computed for you; NEVER calculate a yield
  percentage yourself even if you can see both numbers needed for it.
  Add ONE Key Metrics bullet for average annual rent (e.g. "- Average
  annual rent: **AED 85,400**"), and if gross_yield_pct is present, one
  more bullet stating it plainly as the gross rental yield (e.g. "-
  Gross rental yield: **6.8%**"). If "rental_yield" is ABSENT from the
  data entirely for a question_type "roi" question, that means sale data
  exists but no rent contracts do for this area yet — say so as one
  plain sentence in the Conclusion (e.g. "Rental contract data isn't
  available for this area yet, so a yield can't be calculated — sale
  prices above are real DLD data.") rather than guessing a yield or
  silently dropping the rental angle the investor actually asked about.

- Otherwise (ordinary area/project/bedroom analysis): list the supporting
  numbers as Key Metrics bullets, each with the sqm+sqft pairing above.
  If comparing area-wide vs. a bedroom-specific breakdown, use a table.
- If the data includes avg_size_sqm, state it paired with avg_size_sqft
  the same way prices are paired — e.g. "- Average size: **73.8 sqm
  (795 sqft)**". Use avg_size_sqft directly from the data; never
  calculate it.

- Do NOT add a caveat, disclaimer, or closing line about sample size or
  transaction count — never write anything like "Data is based on a
  sample size of 500 transactions" or similar. The data provided is
  already the real, complete dataset backing this answer; stating its
  size as a hedge adds no value to the investor and reads as an apology
  for data that isn't actually thin.
- NEVER include a transaction-count bullet either (e.g. "Transactions
  analyzed: 500", "Sample: 500 transactions") — this is meta-commentary
  about the data, not something the investor asked for. Leave it out
  entirely; do not even state it as a plain fact.
- The only caveat ever worth adding is if the most recent transaction
  date is genuinely old (e.g. over a year stale) — fold it into the
  Conclusion as a plain fact, not a separate apologetic line.
- No long introductory or closing sentences anywhere outside the
  Heading/Key Metrics/Conclusion structure. Get to the numbers fast.

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
Answer directly using it, with no confusing caveat about the name. This
applies to two-area comparisons too — never add a confusing note like
"X is actually in Y, not Z" about either side's official name; just
compare the two real areas directly.

TWO-AREA COMPARISONS (Beta v2, T2)
If the data below has a "comparison" key: a list of exactly two entries,
one per area (either can be null if that area's data wasn't found).
- Give ONE direct comparative verdict as the Heading — which area
  looks stronger and for what, not a neutral "both have merits" dodge
  unless the real numbers are genuinely close enough that there isn't a
  clear answer (and if so, say that plainly instead of picking one).
- Then real numbers for BOTH areas under Key Metrics, clearly labeled by
  name — a side-by-side markdown table is appended automatically after
  your answer, so you don't need to build your own table here; just
  reference the real numbers in your verdict and reasoning.
- If ONE entry is null (no data for that area), say so plainly and
  compare only on what's actually available — never invent numbers for
  the missing side, and never silently drop the comparison framing
  without explaining why only one side has real data.
- If BOTH entries are null this whole prompt isn't reached (handled
  before the model is even called) — you'll never see two nulls here.

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

    Heading bolded to match the shared format spec applied everywhere
    else in this file (Heading -> table -> hint), so a plain list
    answer looks visually consistent with every other answer type.
    """
    areas = data["all_areas"]
    lines = [f"**We currently cover {len(areas)} areas across Dubai:**", ""]
    lines.append("| District Code | District Name |")
    lines.append("|---|---|")
    for a in areas:
        lines.append(f"| {a.get('district_code', '')} | {a.get('district_name', '')} |")
    lines.append("")
    lines.append("_Ask about any of these by name for pricing, recent sales, or trend data._")
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
        summary = f"**{area} has {total} linked properties — showing the first {len(properties)}:**"
    else:
        summary = f"**{area} has {total} linked properties:**"

    lines = [summary, "", "| # | Property Name |", "|---|---|"]
    for i, name in enumerate(properties, start=1):
        lines.append(f"| {i} | {name} |")
    lines.append("")
    lines.append("_Ask about any of these by name for pricing and recent sales._")
    return "\n".join(lines)


def _strip_sample_size_caveat(answer: str) -> str:
    """
    Deterministic post-processing, not just a prompt instruction — same
    reasoning as the list_areas truncation fix: a prompt telling the
    model not to do something is not a guarantee. Removes any line that
    mentions "sample size" or a transaction-count meta-line (e.g.
    "Transactions analyzed: 500"), even if the model includes it despite
    being told not to. Collapses any blank-line gap the removal leaves
    behind.

    CHANGE LOG: confirmed live, a "- Transactions analyzed: 500" bullet
    was still appearing — the previous prompt actually SUGGESTED this
    exact line as an acceptable alternative to a "sample size" caveat.
    The prompt no longer suggests it; this strip is now the backstop.
    """
    banned_phrases = ("sample size", "transactions analyzed", "transaction count")
    lines = [ln for ln in answer.split("\n") if not any(p in ln.lower() for p in banned_phrases)]
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

    # --- Heading ---
    lines = [f"**Here are the {len(transactions)} most recent {area} sales:**", ""]

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
    parts.append(f"blended average sits around **{avg_psf:,} AED/sqft**")

    date_span = f" across {dates[0]} to {dates[-1]}" if len(dates) > 1 else ""
    summary_text = "; ".join(parts)
    return f"**Conclusion:** A few quick observations{date_span}: {summary_text}."


def _format_area_projects(data: dict) -> str:
    """
    Deterministic, Python-built table — NEVER sent through the LLM, same
    reasoning as the other list formatters. This is the actual fix for
    the confirmed live bug where "what projects are in JVC" was routed
    to the district_properties directory (completely different, mostly
    non-overlapping data) instead of avm's real, transaction-backed
    projects. Ranked by transaction volume — the most actively traded
    projects first, which is what "what projects are in this area"
    usually really means to an investor.
    """
    area = data.get("area", "this area")
    projects = data["area_projects"]
    lines = [f"**Here are the real, transacted projects in {area}, ranked by activity:**", "",
             "| # | Project | Transactions | PSM (AED) | PSF (AED) |",
             "|---|---|---|---|---|"]
    for i, p in enumerate(projects, start=1):
        name = p.get("project") or "—"
        count = p.get("transaction_count")
        count_str = f"{count:,}" if count is not None else "—"
        psm = f"{p['avg_price_per_sqm']:,}" if p.get("avg_price_per_sqm") is not None else "—"
        psf = f"{p['avg_price_per_sqft']:,}" if p.get("avg_price_per_sqft") is not None else "—"
        lines.append(f"| {i} | {name} | {count_str} | {psm} | {psf} |")
    lines.append("")
    lines.append("_Ask about any of these by name for recent sales or pricing detail._")
    return "\n".join(lines)


def _format_developer_info(entities: list) -> str:
    """
    Deterministic, same reasoning as the projects table below it — real
    license/legal-status data from the developers table (Dataset 21),
    never sent through the LLM. is_license_expired is computed in
    Python (stage4), never asserted by the model. Multiple entities are
    shown as separate lines, never collapsed into one, since a brand
    name can legitimately span several distinct legal registrations.
    """
    lines = ["**Registered legal entity(ies) behind these projects:**", ""]
    for e in entities:
        name = e.get("developer_name") or "—"
        status = e.get("legal_status") or "—"
        lic_type = e.get("license_type") or "—"
        lic_num = e.get("license_number") or "—"
        expiry = e.get("license_expiry_date") or "—"
        expired = e.get("is_license_expired")
        expiry_note = " **(EXPIRED)**" if expired else ""
        lines.append(
            f"- **{name}** — {status}, {lic_type} license #{lic_num}, "
            f"expires {expiry}{expiry_note}"
        )
    lines.append("")
    return "\n".join(lines)


def _format_developer_projects(data: dict) -> str:
    """
    Deterministic, Python-built table — NEVER sent through the LLM, same
    reasoning as _format_area_projects. Real join between dld_projects
    (255 real projects, 171 developers) and avm's actual transaction
    data, confirmed live. transaction_count is shown honestly as 0 for a
    real project with no avm transactions yet (e.g. brand new or
    off-plan-only) — never hidden, never guessed.
    """
    developer = data.get("developer", "this developer")
    projects = data["developer_projects"]
    lines = []
    if data.get("developer_info"):
        lines.append(_format_developer_info(data["developer_info"]))
    lines += [f"**Here are {developer}'s real projects, ranked by transaction activity:**", "",
             "| # | Project | Area | Status | Transactions | PSM (AED) |",
             "|---|---|---|---|---|---|"]
    for i, p in enumerate(projects, start=1):
        name = p.get("project") or "—"
        area = p.get("area") or "—"
        status = p.get("status") or "—"
        count = p.get("transaction_count", 0)
        psm = f"{p['avg_price_per_sqm']:,}" if p.get("avg_price_per_sqm") is not None else "—"
        lines.append(f"| {i} | {name} | {area} | {status} | {count:,} | {psm} |")
    lines.append("")
    lines.append("_Ask about any of these projects by name for pricing or recent sales._")
    return "\n".join(lines)


def _format_price_trend_table(price_trend: list) -> str:
    """
    Deterministic, Python-built — appended after the model's answer
    whenever price_trend data is present, guaranteeing every real year
    is shown (not just first/last, which is all the model is asked to
    reference in its own summary bullet). Same reasoning as every other
    _format_* function in this file: a model asked to faithfully
    reproduce tabular data has proven unreliable twice already in this
    project (a truncated 397-row list, a fabricated uniform price
    column) — Python printing real numbers directly has no such risk.
    """
    lines = ["", "**Year-by-Year**", "", "| Year | PSM (AED) | PSF (AED) | Transactions |",
              "|---|---|---|---|"]
    for entry in price_trend:
        year = entry.get("year", "—")
        psm = f"{entry['avg_price_per_sqm']:,}" if entry.get("avg_price_per_sqm") is not None else "—"
        psf = f"{entry['avg_price_per_sqft']:,}" if entry.get("avg_price_per_sqft") is not None else "—"
        count = entry.get("transaction_count")
        count_str = f"{count:,}" if count is not None else "—"
        lines.append(f"| {year} | {psm} | {psf} | {count_str} |")
    return "\n".join(lines)


def _format_comparison_table(comparison: list) -> str:
    """
    Deterministic, Python-built — appended after the model's comparative
    verdict, guaranteeing both areas' real numbers are shown correctly
    side by side, regardless of what the model chose to reference in its
    own reasoning. Same defense-in-depth reasoning as
    _format_price_trend_table. Handles one side being None (no data
    found for that area) honestly, without inventing placeholder values.
    """
    entry1, entry2 = comparison[0], comparison[1]
    name1 = (entry1 or {}).get("area", "Area 1")
    name2 = (entry2 or {}).get("area", "Area 2")
    lines = ["", "**Side-by-Side Comparison**", "", f"| Metric | {name1} | {name2} |", "|---|---|---|"]

    def fmt(entry, key, suffix=""):
        if entry is None or entry.get(key) is None:
            return "—"
        val = entry[key]
        return f"{val:,}{suffix}" if isinstance(val, (int, float)) else f"{val}{suffix}"

    lines.append(f"| Avg price | {fmt(entry1, 'avg_price_per_sqm', ' AED/sqm')} | {fmt(entry2, 'avg_price_per_sqm', ' AED/sqm')} |")
    lines.append(f"| Avg price | {fmt(entry1, 'avg_price_per_sqft', ' AED/sqft')} | {fmt(entry2, 'avg_price_per_sqft', ' AED/sqft')} |")
    lines.append(f"| Avg value | {fmt(entry1, 'avg_actual_worth', ' AED')} | {fmt(entry2, 'avg_actual_worth', ' AED')} |")

    if entry1 is None:
        lines.append(f"\n_No data found for {name1} — comparison shown for {name2} only._")
    if entry2 is None:
        lines.append(f"\n_No data found for {name2} — comparison shown for {name1} only._")

    return "\n".join(lines)


def _format_top_areas(data: dict) -> str:
    """
    Deterministic, Python-built table — NEVER sent through the LLM, same
    reasoning as every other ranking/list formatter in this file. A
    ranking is pure real arithmetic (count/average, sorted) — there's no
    judgment call for a model to make, and every row is guaranteed
    correct because Python computed and printed it directly.
    """
    metric = data.get("metric", "volume")
    year = data.get("year")
    ranked = data["ranked_areas"]

    metric_label = _METRIC_LABELS.get(metric, "top")

    lines = [f"**Top {len(ranked)} {metric_label} areas in {year}:**", "",
             "| # | Area | Transactions | PSM (AED) | PSF (AED) |",
             "|---|---|---|---|---|"]
    for i, a in enumerate(ranked, start=1):
        name = a.get("area") or "—"
        count = a.get("transaction_count")
        count_str = f"{count:,}" if count is not None else "—"
        psm = f"{a['avg_price_per_sqm']:,}" if a.get("avg_price_per_sqm") is not None else "—"
        psf = f"{a['avg_price_per_sqft']:,}" if a.get("avg_price_per_sqft") is not None else "—"
        lines.append(f"| {i} | {name} | {count_str} | {psm} | {psf} |")
    lines.append("")
    lines.append("_Ask about any of these areas by name for pricing, recent sales, or trend data._")
    return "\n".join(lines)


_METRIC_LABELS = {
    "volume": "most active (by transaction count)",
    "price_high": "most expensive (by average price)",
    "price_low": "most affordable (by average price)",
}


def _format_top_projects(data: dict) -> str:
    """Same reasoning as _format_top_areas — a real, deterministic ranking."""
    metric = data.get("metric", "volume")
    year = data.get("year")
    ranked = data["ranked_projects"]
    label = _METRIC_LABELS.get(metric, "top")

    lines = [f"**Top {len(ranked)} {label} projects in {year}:**", "",
             "| # | Project | Transactions | PSM (AED) | PSF (AED) |",
             "|---|---|---|---|---|"]
    for i, p in enumerate(ranked, start=1):
        name = p.get("name") or "—"
        count = p.get("transaction_count")
        count_str = f"{count:,}" if count is not None else "—"
        psm = f"{p['avg_price_per_sqm']:,}" if p.get("avg_price_per_sqm") is not None else "—"
        psf = f"{p['avg_price_per_sqft']:,}" if p.get("avg_price_per_sqft") is not None else "—"
        lines.append(f"| {i} | {name} | {count_str} | {psm} | {psf} |")
    lines.append("")
    lines.append("_Ask about any of these projects by name for pricing or recent sales._")
    return "\n".join(lines)


def _format_top_developers(data: dict) -> str:
    """Same reasoning as _format_top_areas — a real, deterministic ranking."""
    metric = data.get("metric", "volume")
    year = data.get("year")
    ranked = data["ranked_developers"]
    label = _METRIC_LABELS.get(metric, "top")

    lines = [f"**Top {len(ranked)} {label} developers in {year}:**", "",
             "| # | Developer | Transactions | PSM (AED) |",
             "|---|---|---|---|"]
    for i, d in enumerate(ranked, start=1):
        name = d.get("name") or "—"
        count = d.get("transaction_count")
        count_str = f"{count:,}" if count is not None else "—"
        psm = f"{d['avg_price_per_sqm']:,}" if d.get("avg_price_per_sqm") is not None else "—"
        lines.append(f"| {i} | {name} | {count_str} | {psm} |")
    lines.append("")
    lines.append("_Ask about any of these developers by name for their real project list._")
    return "\n".join(lines)


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

    if isinstance(data, dict) and "area_projects" in data:
        logger.info("Stage 5 decided: area_projects -> deterministic format, model not called")
        return _format_area_projects(data), True

    if isinstance(data, dict) and "developer_projects" in data:
        logger.info("Stage 5 decided: developer_projects -> deterministic format, model not called")
        return _format_developer_projects(data), True

    if isinstance(data, dict) and "ranked_areas" in data:
        logger.info("Stage 5 decided: top_areas_ranking -> deterministic format, model not called")
        return _format_top_areas(data), True

    if isinstance(data, dict) and "ranked_projects" in data:
        logger.info("Stage 5 decided: top_projects_ranking -> deterministic format, model not called")
        return _format_top_projects(data), True

    if isinstance(data, dict) and "ranked_developers" in data:
        logger.info("Stage 5 decided: top_developers_ranking -> deterministic format, model not called")
        return _format_top_developers(data), True

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

    # Confirmed live: a chart alone (chart_data, rendered by the
    # frontend) isn't enough on its own — the investor explicitly wants
    # to see the real numbers as a table too, not just a picture of
    # them. Appended deterministically, after the model's own summary,
    # so every real year is guaranteed present.
    if isinstance(data, dict) and data.get("price_trend"):
        answer = answer + "\n" + _format_price_trend_table(data["price_trend"])

    if isinstance(data, dict) and "comparison" in data:
        answer = answer + "\n" + _format_comparison_table(data["comparison"])

    # Habit #2: make this stage's decision visible while building.
    logger.info("Stage 5 decided: grounded=True answer_length=%d chars", len(answer))
    return answer, True

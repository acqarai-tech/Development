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


# ---------------------------------------------------------------------------
# Doc §3.4 (UC10): "user type should route tone and framing, never gate
# whether real data is shown." Same data, same Heading -> Key Metrics ->
# Conclusion structure for everyone below — only which metric leads and
# how the verdict is framed changes. Not a second pipeline, not a
# per-type data model, exactly as the doc specifies. "investor" is the
# default (used whenever entities.get("user_type") is missing/None/
# unrecognized) since that's the only behavior that existed before this
# field did — nothing about existing default behavior moves.
# ---------------------------------------------------------------------------
USER_TYPE_FRAMING = {
    "investor": (
        "An INVESTOR is asking. Lead with yield, price trend, transaction volume, and any "
        "distress signals — if \"market_signal\" is present in the data (see its own rule "
        "below), that IS the real distress/strength signal; never invent one if it's absent. "
        "Frame the Heading and Conclusion around whether this looks like a good investment."
    ),
    "buyer": (
        "A BUYER is asking. Lead with price versus real comparable transactions. Frame the "
        "Heading and Conclusion around whether the price in question looks fair against real "
        "recent sales — not around investment returns. If \"price_comparison\" is present in "
        "the data (see its own rule below), its pct_diff is the real, already-computed answer "
        "to \"is this fair\" — use it directly, never recompute or estimate your own percentage "
        "even if you can see both numbers."
    ),
    "seller": (
        "A SELLER is asking. Lead with pricing and how fast comparable properties have "
        "actually moved. If \"recent_liquidity\" is present in the data (see its own rule "
        "below), use its real transactions_last_90_days figure as the liquidity signal. Frame "
        "the Heading and Conclusion around what a realistic listing price looks like and how "
        "active the market has actually been — not around investment returns, and never state "
        "or imply a specific days-on-market estimate for their unit, since that data doesn't "
        "exist (liquidity/pace only, never a per-unit time-to-sell prediction)."
    ),
    "tenant": (
        "A TENANT is asking. Lead with rent versus real comparable Ejari rent contracts, if "
        "rental data is present. Frame the Heading and Conclusion around whether the rent in "
        "question looks reasonable — not around ROI or yield, which is an investor's framing, "
        "not a tenant's. If \"rent_comparison\" is present in the data (see its own rule "
        "below), its pct_diff is the real, already-computed answer to \"is this fair\" — use it "
        "directly, never recompute or estimate your own percentage."
    ),
    "broker": (
        "A BROKER is asking. This is a working professional pulling a quick reference, not "
        "someone to convince — keep the Heading a plain factual statement, not a sales verdict "
        "(e.g. \"JVC: 16,304 AED/sqm avg, 1,021 transactions\" rather than \"JVC shows strong "
        "potential\"). Keep the Conclusion terse and factual, one sentence, no persuasive "
        "language. Still include Key Metrics and Conclusion — same structure, just no pitch."
    ),
    "developer": (
        "A DEVELOPER is asking. Lead with how competing projects/areas are performing —  "
        "absorption (transaction volume) and pricing versus named competitors, where the data "
        "supports it. Frame the Heading and Conclusion around competitive positioning, not "
        "personal investment returns."
    ),
}


ANSWER_WITH_DATA_PROMPT = """You are Acqar's real estate investment AI agent. An investor has asked you
a question about the Dubai property market, and you have real data below,
pulled live from Acqar's own database — not from your training knowledge,
not from general market impressions. Everything you say must be built
from this data.

WHO'S ASKING
{user_framing}
This changes framing ONLY — which metric leads, and how the Heading/
Conclusion are worded. It never changes which real numbers you're allowed
to state, never adds a number that isn't in the data below, and never
skips the structure below regardless of who's asking.

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

PLAIN ENGLISH — applies to every answer, every question type, every user
type framing above. This answer is read by an everyday property
investor, not an analyst, so:
- Use simple, everyday words. Where a DLD/industry term needs it, add a
  short plain-English gloss the FIRST time it appears in a bullet — e.g.
  "- Average sale price: **28,027 AED/sqm** (**2,604 AED/sqft**) — what a
  typical unit here actually sold for" or "- Recent activity: **16 real
  transactions** in the last 90 days — how many sales have actually
  closed recently." The gloss is a few plain words tacked onto a bullet
  that already exists; it never becomes its own new bullet, never adds a
  number that isn't already stated, and never turns one bullet into two.
- Keep every sentence short — one idea per sentence. In the Conclusion,
  prefer two short plain sentences over one long comma-heavy one (e.g.
  "This unit is priced high for the area. Recent sales show real buyer
  interest, so weigh the cost against what you expect to earn back."
  rather than one long chained sentence saying the same thing).
- This never loosens any rule above or below — the structure
  (Heading -> Key Metrics -> table -> Conclusion), the sqm+sqft pairing,
  the "no sample-size caveat" rule, and the one-hard-rule about never
  inventing a number all still apply exactly as written; plain English
  changes HOW something real is said, never WHAT is said or adds
  anything that isn't already real data stated elsewhere in this answer.

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

- If the data below includes "market_signal": a dict with signal, label,
  confidence, price_change_pct, volume_change_pct, years_compared —
  computed in Python from the same real price_trend numbers (doc §3.3.1),
  NEVER guessed. Use "label" as the basis for your Conclusion line
  instead of generic phrasing like "suggests a stable market" — e.g.
  "**Conclusion:** {{label}}, based on a {{price_change_pct}}% price move
  and {{volume_change_pct}}% change in transaction volume from
  {{years_compared}}." If confidence is "inferred" (not "verified"), soften
  slightly — "this reads as..." rather than a flat assertion — since the
  doc itself flags these two quadrants as logically consistent but not
  yet checked against real Acqar data the way the other two are. Never
  invent a market_signal yourself if this key is absent — that means
  there wasn't enough real trend data to compute one, so skip this
  entirely and rely on price_trend's own bullet instead.

- If the data below includes "recent_liquidity": a dict with
  transactions_last_90_days, as_of, and is_lower_bound — computed from
  real transaction dates, closest available proxy for "how fast is this
  market moving" (avm has no listing-date data, so a true days-on-market
  figure cannot be computed — this is a market-pace signal, never a
  per-unit time-to-sell estimate). Mention it plainly, e.g. "- 342 real
  transactions in the last 90 days" — add "or more" if is_lower_bound is
  true (the real figure may be higher; the fetch cap was reached before
  the 90-day window closed). NEVER state or imply how long a specific
  unit will take to sell — this data cannot support that claim. Do NOT
  list the individual transactions behind this count yourself — if
  "sample_transactions" is present alongside this, a real table of those
  exact transactions is added automatically after your answer (same
  pattern as price_trend's year-by-year table below); your job is only
  the one summary bullet.

- If the data below includes "price_comparison": a dict with
  asking_price, typical_price, pct_diff — pct_diff is ALREADY COMPUTED
  in Python from these two real numbers (never recalculate it yourself
  even though you can see both figures). State it plainly, e.g. "The
  stated price of AED 1,400,000 is **7% above** the typical AED
  1,308,000 for comparable units" (pct_diff positive = above typical,
  negative = below). This is the real basis for a buyer's "is this
  fair" verdict — use it directly as the Conclusion's basis.

- If the data below includes "rent_comparison": a dict with rent_amount,
  typical_rent, pct_diff — same rule as price_comparison above, just for
  a tenant's rent question: pct_diff is already computed, never
  recalculate it. State it plainly and use it as the Conclusion's basis
  for whether the rent is reasonable.

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

- If the data below includes "valuation": a dict with avg_actual_worth,
  avg_property_total_value, valuation_count, most_recent_valuation —
  real DLD valuation procedure records (Dataset 03), NOT this app's own
  thin user-submitted valuations table. Add a Key Metrics bullet for the
  average valuation (e.g. "- Average DLD valuation: **AED 2,144,587**
  (3,411 records)"), and mention most_recent_valuation as evidence this
  is current, not stale, data. If "valuation" is ABSENT from the data
  entirely for a question_type "valuation" question, that means sale
  data exists but no valuation records do for this area yet — say so as
  one plain sentence in the Conclusion, same honesty rule as rental_yield
  above, rather than silently dropping the valuation angle asked about.

- If the data below is a dict with "median_charge_per_sqft" (a
  "service_charges" question): real DLD owners-association-charge
  records (Dataset 25), for the specific matched_project named — NOT an
  area-wide figure, never generalize it to other buildings even in the
  same community. median_charge_per_sqft is ALREADY COMPUTED as the
  median across n_property_groups real property groups in that project
  for budget_year — never recalculate or re-derive it from anything
  else. State it plainly, e.g. "- Typical service charge: **AED 13.5 /
  sqft** (2023, based on 18 property groups)". Mention min/max only if
  they differ meaningfully from the median, to show the real range
  within the building. If n_excluded_outliers > 0, mention briefly that
  a small number of clearly erroneous records were excluded (e.g. "a
  few outlier records were excluded as data errors") — do not name the
  excluded values or imply anything sinister, this is routine data
  cleaning, not a red flag about the building itself. This is
  Residential-usage data by default; if the investor asked about a
  commercial/retail/office unit, say the figure shown is for
  residential units in the same building and may not apply.

- If the data below includes "legal_chunks": a list of retrieved
  reference chunks (title, content, category, source_url, source_note),
  for a "legal_or_general" question. This is DOCUMENT retrieval, not
  database numbers — different rules apply:
  * Answer ONLY using information actually present in the chunks below.
    NEVER add a fact, threshold, fee amount, or rule from your own
    general knowledge, even if you're confident it's correct — if it's
    not in the chunks, it doesn't go in the answer.
  * Every chunk's source_note MUST be reflected in the answer, in your
    own words — e.g. if a note says this is general guidance cross-
    verified against industry sources and not DLD's own official text,
    say exactly that, plainly, don't soften or drop it.
  * FORMAT — this exact structure, same renderer constraints as
    everywhere else in this prompt (no # headings, they render as
    literal text; **bold** and "- " bullets both work):

    **[A short, specific title naming the actual topic]**

    One or two sentences of direct framing.

    **What You Should Know**
    - Each bullet a real point FROM THE CHUNK content — numbers ARE
      allowed here (e.g. "AED 2,000,000 minimum property value"), since
      this content is real and cited, unlike the general-knowledge path.
    - Use "What You Should Know" here, NEVER "Key Metrics" — that
      heading is reserved for verified DLD transaction data elsewhere in
      this prompt, and this is cited reference content, not the same
      category of fact as an avg_price_per_sqm figure, even though both
      can include real numbers.

    _[the source_note, in your own words]_

    **Next Step**
    Plain-language recommendation to confirm with a licensed
    professional or the relevant authority before acting on this.

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
If the data below has a "comparison" key: a list of exactly two entries —
either two areas (each with an "area" key) or two projects (each with a
"project" key, plus "area" as bonus context for which area it's in) —
one per side. If one side has no data, it still carries its REAL name
plus "no_data": true (e.g. {{"project": "Sobha Hartland", "no_data":
true}}) — the name is real, it just has no metrics behind it.
- Give ONE direct comparative verdict as the Heading — which side looks
  stronger and for what, not a neutral "both have merits" dodge unless
  the real numbers are genuinely close enough that there isn't a clear
  answer (and if so, say that plainly instead of picking one). Refer to
  each side by its actual name — the project name if this is a project
  comparison, the area name if it's an area comparison — never the
  generic word "side" or "option" when a real name is available, and
  NEVER use a placeholder name for a "no_data": true side either — its
  real name is right there in the data, use it.
- Then real numbers for BOTH sides under Key Metrics, clearly labeled by
  name — a side-by-side markdown table (including a recent-activity/
  liquidity row) is appended automatically after your answer, so you
  don't need to build your own table here; just reference the real
  numbers in your verdict and reasoning.
- If one entry has "no_data": true, say so plainly BY ITS REAL NAME
  (e.g. "Sobha Hartland has no matching transaction data yet") and
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

# budget_recommendation, no qualifying areas — closes the same class of
# bug UC6 already closed for legal_or_general (see below): the generic
# NO_DATA_FALLBACK above talks about "that area," which makes no sense
# for a budget question where no area was ever named. Only reached when
# get_budget_area_recommendations() found genuinely zero areas with a
# real transaction at or under the stated budget — an honest "I don't
# have evidence for this, not a guess" answer, never a fabricated area.
BUDGET_NO_AREAS_FALLBACK = (
    "I don't have any areas in Acqar's database where a real DLD transaction has actually "
    "closed at or under that budget. That doesn't necessarily mean nothing exists at this "
    "price point — it means I don't have verified transaction data to back a recommendation, "
    "and I don't want to guess. Try a higher budget, or ask about a specific area you have in "
    "mind and I can check what's actually traded there."
)

# service_charges, no usable data — same reasoning as BUDGET_NO_AREAS_FALLBACK
# above: the generic NO_DATA_FALLBACK talks about "that area," which is
# wrong here on two counts — service charges are set per building, not
# area, and this question always names a specific project. Reached when
# get_service_charges() found no matching project, no records for the
# requested usage/year, or too thin a sample after outlier exclusion
# (fewer than 3 clean property groups) to call a figure "typical" honestly.
SERVICE_CHARGES_NO_DATA_FALLBACK = (
    "I don't have enough real DLD service-charge records for that specific building to give "
    "an honest typical figure — either it's not in the dataset yet, or there aren't enough "
    "property groups on record to be confident it's representative. I don't want to guess at "
    "a per-sqft number. If you know the building's community, I can check what's on record "
    "for similar buildings nearby, or you can confirm the exact project name and I'll look "
    "again."
)


# ---------------------------------------------------------------------------
# UC6 (architecture review, confirmed live via user testing): "Asks
# something outside DLD data entirely. Legal, visa, or financing
# questions — must answer helpfully from general knowledge, but never
# invent a law/article number, a specific deadline, or a monetary
# threshold." T13 test case: a Golden Visa or off-plan legal-protection
# question must get real, hedged guidance — not the generic
# NO_DATA_FALLBACK above, which doesn't even make sense for a legal
# question (it talks about "that area") and was the exact confirmed-live
# bug this closes.
#
# Previously (before this fix): legal_or_general only ever answered when
# get_legal_knowledge() found a real matching chunk in the small seed
# knowledge base — anything outside those 3 topics fell through to
# NO_DATA_FALLBACK, which technically avoided fabrication but also
# refused to help at all, failing UC6's "must answer helpfully" half of
# the requirement, not just its "never invent specifics" half.
#
# This function is the fix: when no chunk matches, answer from the
# model's general knowledge instead of refusing — but marked
# grounded=False DELIBERATELY, so run_guardrails()'s existing check for
# data-shaped numbers (AED amounts, percentages, "per sq ft") in
# ungrounded answers is the real enforcement mechanism for "never invent
# a monetary threshold" — not just a prompt instruction the model could
# ignore. If the model states a specific figure anyway despite the
# prompt, the guardrail catches it and the response safely falls back to
# NO_DATA_FALLBACK instead of shipping an unverified number.
# ---------------------------------------------------------------------------
LEGAL_GENERAL_KNOWLEDGE_PROMPT = """You are answering a legal, visa, or financing question about Dubai real
estate for a property investor, using your own general knowledge — no database chunk matched this specific
question, so there is no verified source backing any number you might otherwise state.

Answer genuinely helpfully. Explain how things generally work, what the investor should be thinking about,
and what to check next. Do not just refuse or hedge everything into uselessness — vague-but-useless is not
the goal here, genuinely informative-but-appropriately-hedged is.

However, these rules are absolute, not judgment calls:
- NEVER state a specific law or article number (e.g. "under Law No. 7, Article 3") — refer to it in general
  terms instead (e.g. "under Dubai's freehold ownership rules").
- NEVER state a specific deadline, number of days, or date (e.g. "within 30 days", "by March 2027") — describe
  the general requirement without inventing a specific timeframe.
- NEVER state a specific monetary amount, percentage, or AED threshold, EVEN ONE YOU BELIEVE IS CORRECT — this
  is not being verified against any source right now. Say a fee or threshold exists and that it should be
  confirmed, without naming a figure.

FORMAT — this exact structure, every time. The renderer only understands **bold**, _italic_, "- " bullet
lines, and markdown tables — it does NOT understand # or ## headings, which would show as literal "#"
characters on screen, so never use them. Use this template:

**[A short, specific title naming the actual topic — not "Legal Guidance"]**

One or two sentences of direct, plain-language framing — what this question is really about.

**What You Should Know**
- Each bullet one genuinely informative point, in plain language, hedged where the exact figure/date/citation
  isn't verified (e.g. "A percentage-based government fee applies" rather than a number).
- 3-5 bullets. Substantive, not filler — a bullet that says nothing specific is worse than no bullet.

_This is general knowledge, not verified DLD data or official guidance._

**Next Step**
One or two sentences recommending confirmation with a licensed lawyer, the relevant government authority
(DLD, ICP, GDRFA — whichever actually fits this question), or a qualified advisor before acting on this."""


def _answer_legal_general_knowledge(question: str) -> tuple[str, bool]:
    try:
        completion = groq_client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[
                {"role": "system", "content": LEGAL_GENERAL_KNOWLEDGE_PROMPT},
                {"role": "user", "content": question},
            ],
            temperature=0.2,
        )
        answer = completion.choices[0].message.content
    except Exception as e:
        logger.warning("_answer_legal_general_knowledge: primary model failed (%s), trying fallback", e)
        completion = groq_client.chat.completions.create(
            model=FALLBACK_MODEL,
            messages=[
                {"role": "system", "content": LEGAL_GENERAL_KNOWLEDGE_PROMPT},
                {"role": "user", "content": question},
            ],
            temperature=0.2,
        )
        answer = completion.choices[0].message.content

    logger.info("Stage 5 decided: legal_or_general with no matched chunks -> general-knowledge answer (ungrounded, guardrail-protected)")
    return answer, False


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


def _format_transactions_table(transactions: list) -> tuple[str, int]:
    """
    Shared table-only renderer for a list of transaction dicts (the
    shape _rows_to_transactions in stage4 produces: date, type, project,
    size_sqft, price_aed, psm_aed, psf_aed). Pulled out of
    _format_recent_transactions so a second caller with a different
    heading/framing (_format_liquidity_sample, below — the "N
    transactions in the last 90 days" bullet's real backing rows) can
    reuse the exact same real-number rendering without duplicating it
    (Section 5.4 habit #6). Output of _format_recent_transactions is
    unchanged by this refactor. Returns (table_markdown, with_project_count)
    so callers can still build their own "project names missing" note.
    """
    lines = ["| # | Date | Type | Project | Sqft | PSM | PSF | Total (AED) |",
             "|---|---|---|---|---|---|---|---|"]
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
    return "\n".join(lines), with_project


def _format_liquidity_sample(recent_liquidity: dict, label: str) -> str:
    """
    Deterministic, Python-built — NEVER sent through the LLM. Appended
    after the model's own Heading/Key Metrics/Conclusion whenever
    recent_liquidity.sample_transactions is present, so the "N real
    transactions in the last 90 days" bullet the model states isn't left
    as a bare, unverifiable number — the investor can see the actual
    sales it's built from. Same never-let-the-model-touch-per-row-numbers
    reasoning as every other _format_* table in this file (two confirmed
    live bugs already came from asking a model to reproduce per-row
    data faithfully — a truncated list, a fabricated uniform PSM column).
    Reuses _format_transactions_table, so this renders identically to
    the existing "show me recent sales" feature — one consistent table
    format across the whole app, not a second competing one.
    """
    sample = recent_liquidity.get("sample_transactions") or []
    if not sample:
        return ""
    total = recent_liquidity.get("transactions_last_90_days", len(sample))
    table, with_project = _format_transactions_table(sample)

    lines = ["", f"**Recent Sales — last 90 days ({label})**"]
    if len(sample) < total:
        lines.append(f"_Showing the {len(sample)} most recent of {total} real transactions in this window._")
    lines.append("")
    lines.append(table)

    if sample and (with_project / len(sample)) < 0.2:
        lines.append("")
        lines.append(
            f"_Project names aren't recorded for most of these sales in DLD's data "
            f"({with_project}/{len(sample)} of these have one) — shown as \u2014 where missing, never guessed._"
        )
    return "\n".join(lines)


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
    table, with_project = _format_transactions_table(transactions)
    lines.append(table)

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
    # Defense in depth — same reasoning as _format_area_developers.
    projects = [p for p in data["area_projects"] if p.get("transaction_count", 0) > 0]
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
    if projects:
        top = projects[0]
        lines.append(
            f"**Conclusion:** {top.get('project') or 'The top project'} leads {area} by "
            f"transaction activity, with {top.get('transaction_count'):,} real transactions "
            f"among the {len(projects)} projects shown here."
        )
    lines.append("")
    lines.append("_Ask about any of these by name for recent sales or pricing detail._")
    return "\n".join(lines)


def _format_area_developers(data: dict) -> str:
    """
    Deterministic, Python-built table — closes a confirmed-live gap
    where "developers in JVC"-style questions had no matching
    question_type at all and got silently misclassified into an
    unrelated price report. Ranked by real transaction activity, same
    reasoning as _format_area_projects. Reuses _format_developer_info()
    for the license block, same formatting as developer_lookup answers.

    NAME RESOLUTION, confirmed live 2026-08-19: dld_projects.developer_name
    is corrupted for many Business Bay rows — populated with "الخليج
    التجاري (ش.ذ.م.م)", which is the AREA's own Arabic name, not a
    developer name, for 14+ genuinely different developers (confirmed:
    their developer_id values resolve to real, distinct, correct English
    names in the developers table — DEYAAR DEVELOPMENT, TIGER PROPERTIES,
    DAR GLOBAL PROPERTIES, etc.). Rather than display the raw (sometimes
    garbage) dld_projects field, this prefers the resolved
    developer_name_en already fetched in developer_info, falling back to
    the raw name only when no match exists there.
    """
    area = data.get("area", "this area")
    # Defense in depth: filter here too, not just in stage4's
    # get_area_developers(), so a zero-transaction row can never reach
    # the table regardless of caller — matches the explicit product
    # decision that zero/empty rows are never shown, in any scenario.
    developers = [d for d in data["area_developers"] if d.get("transaction_count", 0) > 0]
    id_to_resolved_name = {
        e["developer_id"]: e["developer_name"]
        for e in (data.get("developer_info") or [])
        if e.get("developer_id") is not None and e.get("developer_name")
    }
    lines = []
    if data.get("developer_info"):
        lines.append(_format_developer_info(data["developer_info"]))
    lines += [f"**Developers active in {area}, ranked by transaction activity:**", "",
             "| # | Developer | Projects | Transactions | PSM (AED) |",
             "|---|---|---|---|---|"]
    for i, d in enumerate(developers, start=1):
        name = id_to_resolved_name.get(d.get("developer_id")) or d.get("developer") or "—"
        projects = d.get("project_count", 0)
        count = d.get("transaction_count", 0)
        psm = f"{d['avg_price_per_sqm']:,}" if d.get("avg_price_per_sqm") is not None else "—"
        lines.append(f"| {i} | {name} | {projects} | {count:,} | {psm} |")
    lines.append("")
    if developers:
        top = developers[0]
        top_name = id_to_resolved_name.get(top.get("developer_id")) or top.get("developer") or "The top developer"
        lines.append(
            f"**Conclusion:** {top_name} leads {area} by transaction activity, with "
            f"{top.get('transaction_count'):,} real transactions — {len(developers)} developers "
            f"with real activity shown here in total."
        )
    lines.append("")
    lines.append("_Ask about any of these developers by name for their full project track record._")
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


def _format_broker_info(data: dict) -> str:
    """
    Deterministic, Python-built — NEVER sent through the LLM, same
    reasoning as _format_developer_info. Real license data from
    real_estate_brokers (Dataset 18), which had zero references anywhere
    in the app before this. is_license_expired computed in Python
    (stage4), never asserted by the model. Multiple matches for the same
    name are all shown, never collapsed to one — confirmed live the same
    broker name can genuinely belong to more than one registered person.
    """
    broker_name = data.get("broker_name", "this broker")
    brokers = data["brokers"]
    plural = "es" if len(brokers) != 1 else ""
    lines = [f"**Real DLD broker record{plural} matching \"{broker_name}\":**", ""]
    for b in brokers:
        name = b.get("broker_name") or "—"
        phone = b.get("phone") or "not on file"
        start = b.get("license_start_date") or "—"
        end = b.get("license_end_date") or "—"
        expired = b.get("is_license_expired")
        expiry_note = " **(EXPIRED)**" if expired else ""
        re_number = b.get("real_estate_number")
        re_note = f", registered under real estate number {re_number}" if re_number else ""
        lines.append(
            f"- **{name}** — phone: {phone}, licensed {start} to {end}{expiry_note}{re_note}"
        )
    lines.append("")
    if len(brokers) > 1:
        lines.append(
            "**Conclusion:** More than one registered broker matches this name — confirm the "
            "specific one by their real estate number before relying on this for contact or "
            "verification purposes."
        )
    else:
        top = brokers[0]
        if top.get("is_license_expired"):
            lines.append(
                f"**Conclusion:** {top.get('broker_name')}'s license expired on "
                f"{top.get('license_end_date')} — confirm current status with DLD before relying "
                f"on this broker's registration."
            )
        else:
            lines.append(
                f"**Conclusion:** {top.get('broker_name')}'s license is on file through "
                f"{top.get('license_end_date')}, per real DLD records."
            )
    return "\n".join(lines)


def _format_developer_projects(data: dict) -> str:
    """
    Deterministic, Python-built table — NEVER sent through the LLM, same
    reasoning as _format_area_projects. Real join between dld_projects
    and avm's actual transaction data, confirmed live. Product decision
    (confirmed live 2026-08-19): projects with zero real transactions are
    excluded entirely (filtered in stage4's get_developer_projects()),
    never shown as a "0" row.
    """
    developer = data.get("developer", "this developer")
    # Defense in depth — same reasoning as _format_area_developers.
    projects = [p for p in data["developer_projects"] if p.get("transaction_count", 0) > 0]
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
    if projects:
        top = projects[0]
        lines.append(
            f"**Conclusion:** {top.get('project') or 'The top project'} is {developer}'s most "
            f"active project, with {top.get('transaction_count'):,} real transactions among the "
            f"{len(projects)} projects shown here."
        )
    lines.append("")
    lines.append("_Ask about any of these projects by name for pricing or recent sales._")
    return "\n".join(lines)


def _format_unit_inventory(data: dict) -> str:
    """
    Deterministic, Python-built table — NEVER sent through the LLM.
    Closes "unit-count / inventory questions" (P2). Real registered-unit
    counts from registered_real_estate_units (Dataset 01) — the TRUE
    inventory of a project, not just the units that have transacted.
    """
    project = data.get("project", "this project")
    inventory = data["unit_inventory"]
    total = sum(i.get("unit_count", 0) for i in inventory)
    lines = [f"**Real registered unit inventory for {project}** (freehold units, {total:,} total):", "",
             "| Room Type | Property Type | Units |",
             "|---|---|---|"]
    for i in inventory:
        rooms = i.get("rooms") or "—"
        sub_type = i.get("property_sub_type") or "—"
        count = i.get("unit_count", 0)
        lines.append(f"| {rooms} | {sub_type} | {count:,} |")
    lines.append("")
    if inventory:
        top = max(inventory, key=lambda i: i.get("unit_count", 0))
        top_pct = round(100 * top.get("unit_count", 0) / total) if total else 0
        lines.append(
            f"**Conclusion:** {project} has {total:,} total registered freehold units, "
            f"predominantly {top.get('rooms') or 'one type'} ({top.get('property_sub_type') or ''}) "
            f"at {top.get('unit_count', 0):,} units ({top_pct}% of the total)."
        )
    lines.append("")
    lines.append("_Source: DLD's registered freehold real estate units — the actual DLD registry, not just transacted sales._")
    return "\n".join(lines)


def _format_market_index(data: dict) -> str:
    """
    Deterministic, Python-built table — NEVER sent through the LLM.
    Closes "no market-index feature" (P2). This is DLD's own published
    Residential Sale Price Index (Dataset 12), a completely different,
    authoritative thing from the price_trend table below (which is just
    this app's own avm transactions averaged by year).

    CONFIRMED LIVE, IMPORTANT: DLD's own source data for this index
    stops at 2024-05 — not this app's fault, not stale loading, the
    published index itself hasn't been updated more recently as of this
    writing. The "as of" date is always shown prominently so this is
    never mistaken for a current, live figure.
    """
    ptype_label = {"all": "All Property Types", "flat": "Flats/Apartments", "villa": "Villas"}.get(
        data.get("property_type", "all"), "All Property Types"
    )
    as_of = data.get("as_of") or "unknown"
    lines = [f"**DLD Residential Sale Price Index — {ptype_label}**", "",
             f"_Data as of {as_of} — this is DLD's own published index; it is not updated in real time and may not reflect the current month._",
             "",
             "| Month | Index | Price Index (AED) |",
             "|---|---|---|"]
    for month in data.get("series", []):
        m = month.get("month") or "—"
        idx = month.get("index")
        price_idx = month.get("price_index")
        idx_str = f"{idx:.3f}" if idx is not None else "—"
        price_str = f"{price_idx:,}" if price_idx is not None else "—"
        lines.append(f"| {m} | {idx_str} | {price_str} |")
    lines.append("")
    series = data.get("series", [])
    usable = [m for m in series if m.get("index") is not None]
    if len(usable) >= 2:
        first, last = usable[0], usable[-1]
        pct_change = round(((last["index"] - first["index"]) / first["index"]) * 100, 1) if first["index"] else None
        direction = "risen" if pct_change is not None and pct_change > 0 else "fallen" if pct_change is not None and pct_change < 0 else "held steady"
        change_str = f" ({pct_change:+.1f}%)" if pct_change is not None else ""
        lines.append(
            f"**Conclusion:** The {ptype_label.lower()} index has {direction}{change_str} "
            f"from {first.get('month')} to {last.get('month')}, the period shown above."
        )
        lines.append("")
    lines.append("_Source: DLD's own published Residential Sale Price Index, not derived from this app's own transaction data._")
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
    verdict, guaranteeing both sides' real numbers are shown correctly
    side by side, regardless of what the model chose to reference in its
    own reasoning. Same defense-in-depth reasoning as
    _format_price_trend_table. Handles one side having no data honestly,
    without inventing placeholder values.

    BUG FIX #1 (found while building project-vs-project comparisons):
    this used to label columns with entry.get("area") only.
    lookup_project_data() returns BOTH "project" (the project name) and
    "area" (the containing area, kept as bonus context) — for a project
    comparison, labeling by "area" alone would show two competing
    projects' comparison table headed by their containing AREA names
    instead of the actual project names being compared, which is
    exactly backwards for what the investor asked. Now prefers
    "project" when present, falling back to "area" for an ordinary
    area-vs-area comparison (which has no "project" key at all) — one
    function correctly serving both shapes.

    BUG FIX #2 (confirmed live, screenshot): a side with no data used
    to arrive here as a bare None — by the time this function tried to
    label that column, the actual name asked about ("Sobha Hartland")
    was already lost, so it fell back to the generic "Option 2".
    lookup_comparison_data()/lookup_project_comparison_data() now
    preserve the requested name via a {"area"/"project": name,
    "no_data": True} marker instead of a bare None (see their own
    docstrings) — so the no-data check below looks for that marker,
    not just `is None`, while still supporting a literal None
    defensively in case anything else ever constructs this shape.
    """
    entry1, entry2 = comparison[0], comparison[1]
    name1 = (entry1 or {}).get("project") or (entry1 or {}).get("area", "Option 1")
    name2 = (entry2 or {}).get("project") or (entry2 or {}).get("area", "Option 2")
    lines = ["", "**Side-by-Side Comparison**", "", f"| Metric | {name1} | {name2} |", "|---|---|---|"]

    def is_missing(entry):
        return entry is None or entry.get("no_data")

    def fmt(entry, key, suffix=""):
        if entry is None or entry.get(key) is None:
            return "—"
        val = entry[key]
        return f"{val:,}{suffix}" if isinstance(val, (int, float)) else f"{val}{suffix}"

    def fmt_liquidity(entry):
        liquidity = (entry or {}).get("recent_liquidity")
        if not liquidity or liquidity.get("transactions_last_90_days") is None:
            return "—"
        count = liquidity["transactions_last_90_days"]
        suffix = "+" if liquidity.get("is_lower_bound") else ""
        return f"{count:,}{suffix} (last 90 days)"

    lines.append(f"| Avg price | {fmt(entry1, 'avg_price_per_sqm', ' AED/sqm')} | {fmt(entry2, 'avg_price_per_sqm', ' AED/sqm')} |")
    lines.append(f"| Avg price | {fmt(entry1, 'avg_price_per_sqft', ' AED/sqft')} | {fmt(entry2, 'avg_price_per_sqft', ' AED/sqft')} |")
    lines.append(f"| Avg value | {fmt(entry1, 'avg_actual_worth', ' AED')} | {fmt(entry2, 'avg_actual_worth', ' AED')} |")
    lines.append(f"| Recent activity | {fmt_liquidity(entry1)} | {fmt_liquidity(entry2)} |")

    if is_missing(entry1):
        lines.append(f"\n_No data found for {name1} — comparison shown for {name2} only._")
    if is_missing(entry2):
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


def _format_budget_recommendations(data: dict) -> str:
    """
    Deterministic, Python-built — same reasoning as every other ranking
    formatter in this file (_format_top_areas etc.): this is real
    GROUP-BY-area arithmetic with no judgment call for a model to make,
    so it's never sent through the LLM.

    Closes the confirmed-live bug: "I have AED 600,000. Which areas
    should I consider?" used to fall through to market_overview's
    citywide-average answer (accurate, but useless — it told the
    investor what the AVERAGE Dubai property costs, not which real
    areas their actual budget could reach). Every area shown here has
    at least one real DLD transaction on record at or under the stated
    budget (enforced in the budget_area_recommendations RPC itself, per
    the zero-transaction-rule discipline used throughout this file),
    and areas are ranked by how much of their real activity sits within
    budget, not by price alone.

    "Typical transaction price" uses the MEDIAN, not the average —
    deliberately: a thin sample with one unusually large sale can pull
    the average far above what a typical buyer in that area actually
    pays (confirmed live, e.g. a 14-transaction area with an average of
    2.17M but a median of 196k). The median is what most real buyers
    there actually paid; the average alone would misrepresent it.

    TABLE FORMAT (this version): originally a numbered list with
    sub-bullets per area. Switched to a markdown table on request, to
    match every other ranking formatter in this file (_format_top_areas,
    _format_top_projects, _format_top_developers all already use this
    exact table shape) — one consistent rendering for "a ranked list of
    real areas/projects/developers" everywhere in the product, not a
    one-off format just for this question type.
    """
    budget = data["budget"]
    areas = data["areas"]
    budget_str = f"{budget:,.0f}"

    lines = [
        f"With an AED {budget_str} budget, these areas have real transaction activity "
        "within or around your budget:",
        "",
        "| # | Area | Typical Price | Lowest Recorded | AED/sqft | At/Under Budget |",
        "|---|---|---|---|---|---|",
    ]
    for i, a in enumerate(areas, start=1):
        name = a.get("area") or "—"
        median = f"AED {a['median_price_aed']:,}" if a.get("median_price_aed") is not None else "—"
        min_price = f"AED {a['min_price_aed']:,}" if a.get("min_price_aed") is not None else "—"
        psf = f"{a['avg_price_per_sqft']:,}" if a.get("avg_price_per_sqft") is not None else "—"
        count = a.get("transaction_count")
        under = a.get("transactions_under_budget")
        pct = a.get("pct_transactions_under_budget")
        if under is not None and pct is not None and count is not None:
            under_str = f"{under:,}/{count:,} ({pct:g}%)"
        else:
            under_str = "—"

        lines.append(f"| {i} | {name} | {median} | {min_price} | {psf} | {under_str} |")

    lines.append("")
    lines.append(
        "_Based on real DLD transaction data, not a recommendation that every property in "
        "these areas is available for this budget — ask about a specific area for a closer "
        "look._"
    )
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
    # UC6, checked first, before the generic no-data path below: a
    # legal/visa/financing question must always get a real, helpful
    # answer — from real cited chunks when get_legal_knowledge() found a
    # match (grounded=True, handled by the "legal_chunks" branch further
    # down), or from careful general knowledge when it didn't
    # (grounded=False, guardrail-protected against invented specifics).
    # NEVER the generic "no data for that area" fallback below, which
    # doesn't even make sense for a legal question and was the exact
    # confirmed-live bug (doc §2.2) this closes.
    if entities.get("question_type") == "legal_or_general" and not (
        isinstance(data, dict) and data.get("legal_chunks")
    ):
        return _answer_legal_general_knowledge(question)

    # Same UC6-style reasoning as legal_or_general just above: a
    # budget_recommendation question with zero qualifying areas must
    # get a fallback message that actually makes sense for it, never
    # the generic NO_DATA_FALLBACK's "that area" phrasing when no area
    # was ever named.
    if entities.get("question_type") == "budget_recommendation" and data is None:
        logger.info("Stage 5 decided: budget_recommendation, no qualifying areas -> "
                    "budget-specific honest fallback, model not called")
        return BUDGET_NO_AREAS_FALLBACK, False

    # Same UC6-style reasoning again: service_charges questions always
    # name a specific building, never an area — the generic fallback's
    # "that area" phrasing would be doubly wrong here.
    if entities.get("question_type") == "service_charges" and data is None:
        logger.info("Stage 5 decided: service_charges, no usable data -> "
                    "service-charge-specific honest fallback, model not called")
        return SERVICE_CHARGES_NO_DATA_FALLBACK, False

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

    if isinstance(data, dict) and "area_developers" in data:
        logger.info("Stage 5 decided: area_developers -> deterministic format, model not called")
        return _format_area_developers(data), True

    if isinstance(data, dict) and "developer_projects" in data:
        logger.info("Stage 5 decided: developer_projects -> deterministic format, model not called")
        return _format_developer_projects(data), True

    if isinstance(data, dict) and "brokers" in data:
        logger.info("Stage 5 decided: broker_lookup -> deterministic format, model not called")
        return _format_broker_info(data), True

    if isinstance(data, dict) and "unit_inventory" in data:
        logger.info("Stage 5 decided: unit_inventory -> deterministic format, model not called")
        return _format_unit_inventory(data), True

    if isinstance(data, dict) and "series" in data and "property_type" in data:
        logger.info("Stage 5 decided: market_index -> deterministic format, model not called")
        return _format_market_index(data), True

    if isinstance(data, dict) and "ranked_areas" in data:
        logger.info("Stage 5 decided: top_areas_ranking -> deterministic format, model not called")
        return _format_top_areas(data), True

    if isinstance(data, dict) and "ranked_projects" in data:
        logger.info("Stage 5 decided: top_projects_ranking -> deterministic format, model not called")
        return _format_top_projects(data), True

    if isinstance(data, dict) and "ranked_developers" in data:
        logger.info("Stage 5 decided: top_developers_ranking -> deterministic format, model not called")
        return _format_top_developers(data), True

    if isinstance(data, dict) and "areas" in data and "budget" in data:
        logger.info("Stage 5 decided: budget_recommendation -> deterministic format, model not called")
        return _format_budget_recommendations(data), True

    if isinstance(data, dict) and "recent_transactions" in data:
        logger.info("Stage 5 decided: recent_transactions -> deterministic format, model not called")
        return _format_recent_transactions(data), True

    # --- Everything else still goes through the model, as before ---
    user_type = entities.get("user_type") if isinstance(entities, dict) else None
    user_framing = USER_TYPE_FRAMING.get(user_type) or USER_TYPE_FRAMING["investor"]
    try:
        completion = groq_client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[
                {"role": "system", "content": ANSWER_WITH_DATA_PROMPT.format(
                    data=json.dumps(data, default=str), user_framing=user_framing)},
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
                {"role": "system", "content": ANSWER_WITH_DATA_PROMPT.format(
                    data=json.dumps(data, default=str), user_framing=user_framing)},
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

    # Confirmed-live product ask: the model's own "N transactions in the
    # last 90 days" bullet (recent_liquidity) shouldn't be left as a bare
    # count — appended deterministically here, same pattern as
    # price_trend/comparison above, so this applies to EVERY question
    # type/user-type framing that carries recent_liquidity (area_report,
    # project_price, roi, etc.), not just one scenario.
    if isinstance(data, dict) and data.get("recent_liquidity", {}).get("sample_transactions"):
        label = data.get("project") or data.get("area") or "this area"
        answer = answer + "\n" + _format_liquidity_sample(data["recent_liquidity"], label)

    # Habit #2: make this stage's decision visible while building.
    logger.info("Stage 5 decided: grounded=True answer_length=%d chars", len(answer))
    return answer, True

"""
clients.py — shared setup, used by more than one stage
=========================================================
Credentials and the area-name resolver live here, ONCE, because Stage 2's
tests don't need them but Stage 4 and Stage 5 do. Per Section 5.4 habit #6
("no copy-pasted logic — if two stages need similar logic, write it once
and call it from both places"), this is that one place.

Nothing here is a "stage" itself — it's plumbing every stage can depend on.
"""
import os
import logging

from groq import Groq
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("acqar-chat")

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SUPABASE_URL = os.getenv("SUPABASE_URL_CHAT", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY_CHAT", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Confirmed live: Groq decommissioned llama3-70b-8192 entirely, and
# separately deprecated llama-3.3-70b-versatile (announced June 17,
# 2026), recommending openai/gpt-oss-120b or qwen/qwen3.6-27b as
# replacements. Updated to Groq's currently-recommended models — check
# https://console.groq.com/docs/deprecations if this errors again, since
# Groq's lineup changes on their own schedule, not this project's.
PRIMARY_MODEL = "openai/gpt-oss-120b"
FALLBACK_MODEL = "openai/gpt-oss-20b"
BACKEND = os.getenv("BACKEND_URL", "https://development-production-2ad3.up.railway.app")

# Confirmed live via direct Supabase inspection: Downtown Dubai's real
# transactions are filed under "Burj Khalifa" in the DLD data. This map is
# ONLY for genuine naming mismatches — never a coverage whitelist (see the
# whitelist bug this project already found and removed).
#
# Trade Center entries added after a confirmed live bug: districts /
# district_properties (the canonical area list) use "Trade center 1" /
# "Trade center 2", but the avm transaction feed uses "Trade Center First"
# / "Trade Center Second" for the SAME two areas. Fixed HERE, not by
# renaming rows in districts/district_properties (those are the canonical,
# investor-recognizable names per the architecture review's Section 5.5 —
# they should stay as-is) and not by renaming avm (1.65M raw DLD rows;
# renaming there is invasive and would be silently undone by any future
# re-import of the feed). Covers common spelling variants an investor or
# the extraction model might produce.
#
# NOTE on "JVC": deliberately NOT added here, even though it would also
# benefit from search_avm's exact-match fast path (see stage4.py). Adding
# it changes the ILIKE pattern text for EVERY jvc query too, not just the
# fast-path candidate — this is consistent with how downtown/trade center
# already behave, but it ripples through a large number of existing
# tests that use "jvc" as a stand-in well-known area. Left as a safe,
# cheap fallback (exact match misses in ~2ms, then ILIKE runs as before)
# rather than bundled into this unrelated change.
AREA_NAME_OVERRIDES = {
    "downtown": "burj khalifa",
    "downtown dubai": "burj khalifa",
    "trade center 1": "trade center first",
    "trade centre 1": "trade center first",
    "trade center 2": "trade center second",
    "trade centre 2": "trade center second",
    # Confirmed live 2026-08-19: avm has both "Dubai Marina" (5,028 rows)
    # and "Marsa Dubai" (113,156 rows) for what is the same real area —
    # "Marsa Dubai" is the canonical DLD name (also the only spelling in
    # areas_reference, the official DLD area lookup). Without this,
    # "Dubai Marina" searches only ever saw the smaller 5,028-row bucket
    # and rentals saw ZERO rows, since rentals has no "Dubai Marina"
    # spelling at all — every rental-yield question for one of Dubai's
    # most commonly asked-about areas silently had no data behind it.
    # Tradeoff, same one already accepted by the Downtown/Trade Center
    # entries above: this redirects the search term entirely, so the
    # smaller "Dubai Marina"-labeled rows in avm are no longer matched
    # either. That's a real gap this alone doesn't close — the complete
    # fix is the areas_reference-based canonical join (doc issue #1/#6,
    # P0), which can match multiple known aliases at once instead of
    # picking one. This entry is the same-day stopgap, not that fix.
    "dubai marina": "marsa dubai",
    # Confirmed live 2026-08-21: "jvc" (and "JVC" — normalize_area always
    # lowercases first) is one of the single most commonly typed area
    # names in this whole app — it's the flagship example question in
    # both the architecture review and this app's own docs — but avm's
    # real stored value is the full "Jumeirah Village Circle (JVC)", so
    # "jvc" alone NEVER hit search_avm's exact-match fast path and fell
    # through to the ILIKE fallback every single time. Traced live via
    # EXPLAIN ANALYZE: that ILIKE fallback takes ~10.6 SECONDS and scans
    # 28,000+ rows for this exact query shape (area ILIKE + ORDER BY
    # instance_date DESC + LIMIT — the planner walks the date index
    # backward rather than using the trigram index, discarding thousands
    # of non-matching rows along the way) — comfortably enough to trip a
    # request timeout under real load. Confirmed live in
    # chat_fallback_logs: two separate real questions ("tell about JVC",
    # "i wanted to buy 3 br in jvc") both silently fell back to "no data
    # found" minutes apart because of exactly this. With this override,
    # "jvc" resolves straight to the exact-match fast path instead —
    # confirmed live via EXPLAIN ANALYZE: ~3ms using the existing
    # idx_avm_area_lower_covering index, the same ~12x-faster path
    # described in _call_search_avm's docstring.
    "jvc": "jumeirah village circle (jvc)",
}


def normalize_area(area):
    """
    No whitelist — any area text gets passed straight through to the real
    database. Only a confirmed DLD naming mismatch gets rewritten. Returns
    None only when there's genuinely no area text at all.
    """
    if not area:
        return None
    candidate = area.strip().lower()
    resolved = AREA_NAME_OVERRIDES.get(candidate, candidate)
    logger.info("normalize_area: input=%r -> resolved=%r", area, resolved)
    return resolved

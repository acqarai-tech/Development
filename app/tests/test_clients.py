"""
Tests for normalize_area() and AREA_NAME_OVERRIDES directly — previously
this was only tested indirectly through Stage 4 (test_downtown_resolves_to_
burj_khalifa). Pulling it into its own file since it's shared plumbing
(clients.py, used by every avm-facing Stage 4 function), not a Stage 4
concern specifically.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("SUPABASE_URL_CHAT", "https://example.supabase.co")
os.environ.setdefault(
    "SUPABASE_SERVICE_ROLE_KEY_CHAT",
    "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9."
    "eyJyb2xlIjogInNlcnZpY2Vfcm9sZSIsICJpc3MiOiAic3VwYWJlLWRlbW8ifQ."
    "fakesignature",
)

import clients


def test_downtown_still_resolves_to_burj_khalifa():
    assert clients.normalize_area("Downtown Dubai") == "burj khalifa"
    assert clients.normalize_area("downtown") == "burj khalifa"


def test_trade_center_1_resolves_to_avm_spelling():
    """Confirmed live: districts/district_properties use 'Trade center 1',
    avm uses 'Trade Center First' for the same real area."""
    assert clients.normalize_area("Trade center 1") == "trade center first"
    assert clients.normalize_area("Trade Center 1") == "trade center first"
    assert clients.normalize_area("Trade Centre 1") == "trade center first"


def test_trade_center_2_resolves_to_avm_spelling():
    assert clients.normalize_area("Trade center 2") == "trade center second"
    assert clients.normalize_area("Trade Center 2") == "trade center second"
    assert clients.normalize_area("Trade Centre 2") == "trade center second"


def test_trade_center_1_and_2_resolve_differently():
    """The actual bug that was found: '2' must not collapse into '1' or
    into a shared generic 'trade center' bucket — they're different real
    areas (D364 vs D365) and must resolve to different avm names."""
    resolved_1 = clients.normalize_area("Trade center 1")
    resolved_2 = clients.normalize_area("Trade center 2")
    assert resolved_1 != resolved_2


def test_dwtc_is_a_separate_area_not_touched_by_the_override():
    """'Dubai World Trade Center (DWTC)' is a real, separate third area —
    confirmed live — and must NOT be caught by the trade center override
    keys, which are exact-match, not substring-match."""
    assert clients.normalize_area("Dubai World Trade Center (DWTC)") == "dubai world trade center (dwtc)"


def test_dubai_marina_resolves_to_marsa_dubai():
    """Confirmed live 2026-08-19: avm splits the same real area across
    'Dubai Marina' (5,028 rows) and 'Marsa Dubai' (113,156 rows, also the
    only spelling in areas_reference — the canonical DLD name). rentals
    has ZERO rows under 'Dubai Marina' at all. Without this override,
    every rental-yield question for Dubai Marina returned real sale data
    but no rental data, for an area that has plenty of both."""
    assert clients.normalize_area("Dubai Marina") == "marsa dubai"
    assert clients.normalize_area("dubai marina") == "marsa dubai"
    assert clients.normalize_area("DUBAI MARINA") == "marsa dubai"


def test_marsa_dubai_itself_still_passes_through_unchanged():
    """The canonical spelling shouldn't get double-mapped or altered."""
    assert clients.normalize_area("Marsa Dubai") == "marsa dubai"


def test_ordinary_area_passes_through_unchanged():
    """No whitelist — anything not in AREA_NAME_OVERRIDES goes straight
    through, lowercased, unchanged."""
    assert clients.normalize_area("JVC") == "jvc"
    assert clients.normalize_area("Some Brand New Area Nobody Mapped Yet") == \
        "some brand new area nobody mapped yet"


def test_none_and_empty_return_none():
    assert clients.normalize_area(None) is None
    assert clients.normalize_area("") is None

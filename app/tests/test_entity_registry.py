"""
NEW FILE — entity_registry.py has no pre-existing test coverage at all
(it's Phase A of an in-progress router refactor, not yet imported/called
by ai_chat.py live). This file does NOT attempt to backfill coverage for
the whole engine — that's separate, larger work. It covers exactly the
new escrow-agent enrichment added to _project_profile() and
_make_roi_resolver("project"), mirroring the equivalent tests already
added to tests/test_wiring.py for the same behavior wired through
ai_chat.py directly.
"""
import os
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("SUPABASE_URL_CHAT", "https://example.supabase.co")
os.environ.setdefault(
    "SUPABASE_SERVICE_ROLE_KEY_CHAT",
    "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9."
    "eyJyb2xlIjogInNlcnZpY2Vfcm9sZSIsICJpc3MiOiAic3VwYWJhc2UtZGVtbyJ9."
    "fakesignature",
)

import entity_registry as reg


def test_get_project_profile_attaches_escrow_agent_when_found():
    fake_project_data = {"project": "Emirates Living - Springs 10", "avg_price_per_sqm": 15000}
    fake_escrow = {"project": "Emirates Living - Springs 10",
                   "escrow_agent_name": "MASHREQ BANK PSC", "escrow_agent_phone": None}
    with patch.object(reg, "lookup_project_data", return_value=fake_project_data), \
         patch.object(reg, "get_escrow_agent", return_value=fake_escrow) as mock_escrow:
        result = reg.get("project", "Emirates Living - Springs 10", "profile")

    mock_escrow.assert_called_once_with("Emirates Living - Springs 10")
    assert result["escrow_agent"]["escrow_agent_name"] == "MASHREQ BANK PSC"
    assert result["avg_price_per_sqm"] == 15000  # original behavior untouched


def test_get_project_profile_omits_escrow_agent_when_not_found():
    fake_project_data = {"project": "Some Project", "avg_price_per_sqm": 10000}
    with patch.object(reg, "lookup_project_data", return_value=fake_project_data), \
         patch.object(reg, "get_escrow_agent", return_value=None):
        result = reg.get("project", "Some Project", "profile")

    assert "escrow_agent" not in result
    assert result["avg_price_per_sqm"] == 10000


def test_get_project_profile_no_data_never_calls_escrow_agent():
    with patch.object(reg, "lookup_project_data", return_value=None), \
         patch.object(reg, "get_escrow_agent") as mock_escrow:
        result = reg.get("project", "Nonexistent Project XYZ", "profile")

    assert result is None
    mock_escrow.assert_not_called()


def test_get_project_roi_attaches_escrow_agent():
    fake_sale_data = {"area": "business bay", "avg_price_per_sqm": 15501}
    fake_rental_data = {"avg_annual_rent": 80000, "avg_rent_per_sqm": 1050}
    fake_escrow = {"project": "Auresta Tower",
                   "escrow_agent_name": "EMIRATES NBD BANK  (P.J.S.C)", "escrow_agent_phone": None}
    with patch.object(reg, "lookup_project_data", return_value=fake_sale_data), \
         patch.object(reg, "get_rental_yield", return_value=fake_rental_data), \
         patch.object(reg, "get_escrow_agent", return_value=fake_escrow) as mock_escrow:
        result = reg.get("project", "Auresta Tower", "roi")

    mock_escrow.assert_called_once_with("Auresta Tower")
    assert result["escrow_agent"]["escrow_agent_name"] == "EMIRATES NBD BANK  (P.J.S.C)"
    assert result["rental_yield"]["avg_annual_rent"] == 80000  # both enrichments coexist


def test_get_area_roi_never_calls_escrow_agent():
    """escrow is project-scoped only — get('area', ..., 'roi') must never
    call it, same as the equivalent ai_chat.py wiring test."""
    fake_sale_data = {"area": "jvc", "avg_price_per_sqm": 16000}
    fake_rental_data = {"avg_annual_rent": 85000, "avg_rent_per_sqm": 1088}
    with patch.object(reg, "lookup_area_data", return_value=fake_sale_data), \
         patch.object(reg, "get_rental_yield", return_value=fake_rental_data), \
         patch.object(reg, "get_escrow_agent") as mock_escrow:
        result = reg.get("area", "JVC", "roi")

    mock_escrow.assert_not_called()
    assert result["rental_yield"]["avg_annual_rent"] == 85000


# ===========================================================================
# NEW FUNCTIONALITY — valuator profile lookup via entity_registry.
# ===========================================================================
def test_get_valuator_profile_returns_real_data():
    fake_valuators = [{"valuator_name": "ZAHER IBRAHIM",
                       "valuation_company": "3 D APPRAISAL INTERNATIONAL REAL ESTATE VALUATION SERVICES L.L.C",
                       "license_start_date": "2016-08-10", "license_end_date": "2027-08-08",
                       "is_license_expired": False, "nationality": "Canada"}]
    with patch.object(reg, "get_valuator_info", return_value=fake_valuators) as mock_valuator:
        result = reg.get("valuator", "Zaher Ibrahim", "profile")

    mock_valuator.assert_called_once_with("Zaher Ibrahim")
    assert result["valuator_name"] == "Zaher Ibrahim"
    assert result["valuators"][0]["valuator_name"] == "ZAHER IBRAHIM"


def test_get_valuator_profile_no_match_returns_none():
    with patch.object(reg, "get_valuator_info", return_value=None):
        result = reg.get("valuator", "Nonexistent Valuator XYZ", "profile")
    assert result is None


def test_get_valuator_profile_unregistered_metric_returns_none():
    """valuator only has "profile" registered — asking for e.g. "roi" on
    a valuator must fail safely, not crash."""
    result = reg.get("valuator", "Zaher Ibrahim", "roi")
    assert result is None


# ===========================================================================
# NEW FUNCTIONALITY — land zoning lookup via entity_registry.
# ===========================================================================
def test_get_area_zoning_returns_real_data():
    fake_zoning = {"area": "dubai marina", "zoning": [
        {"land_type": "Commercial", "parcel_count": 214, "avg_area_sqm": 24491.3, "total_area_sqm": 5241148.8},
    ]}
    with patch.object(reg, "get_land_zoning", return_value=fake_zoning) as mock_zoning:
        result = reg.get("area", "Dubai Marina", "zoning")

    mock_zoning.assert_called_once_with("Dubai Marina")
    assert result["zoning"][0]["land_type"] == "Commercial"


def test_get_area_zoning_no_match_returns_none():
    with patch.object(reg, "get_land_zoning", return_value=None):
        result = reg.get("area", "Nonexistent Area XYZ", "zoning")
    assert result is None


def test_get_project_zoning_unregistered_metric_returns_none():
    """zoning is registered under "area" only -- asking for it on a
    project must fail safely, not crash."""
    result = reg.get("project", "Some Project", "zoning")
    assert result is None

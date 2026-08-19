"""
Stage 5 tests — Stage 2 and Stage 4 already passed on their own. This file
tests ONLY build_answer(), with hand-built fake data, no dependency on
extract_entities() or lookup_area_data().

Previously split across test_stage5.py and test_stage5_new_features.py —
merged here per request, since both test the same module. The
new-features half covers several confirmed-live bugs and their fixes:
a 397-row list_areas table the model truncated at row 379 (fixed by
rendering list_areas/area_properties/recent_transactions deterministically
in Python, never through the LLM), a fabricated uniform PSM value across
real transactions with genuinely different prices, an unwanted "sample
size" caveat, and the Summary -> Table -> Conclusion restructure.
"""
import os
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("SUPABASE_URL_CHAT", "https://example.supabase.co")
os.environ.setdefault(
    "SUPABASE_SERVICE_ROLE_KEY_CHAT",
    "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9."
    "eyJyb2xlIjogInNlcnZpY2Vfcm9sZSIsICJpc3MiOiAic3VwYWJhc2UtZGVtbyJ9."
    "fakesignature",
)

import stage5_build_answer as stage5


def _mock_groq_text(text):
    mock = MagicMock()
    mock.choices = [MagicMock(message=MagicMock(content=text))]
    return mock


def test_no_data_returns_fallback_without_calling_groq():
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "Price of Tiger Sky Tower for a 1BR?",
            entities={"question_type": "project_price", "area": None},
            data=None,
        )
    assert grounded is False
    assert answer == stage5.NO_DATA_FALLBACK
    mock_create.assert_not_called()


def test_with_data_calls_groq_and_returns_grounded():
    fake_data = {
        "area": "Jumeirah Village Circle (JVC)", "transaction_sample_size": 500,
        "avg_price_per_sqm": 16327, "avg_actual_worth": 1684639,
        "most_recent_transaction_date": "2026-07-13",
    }
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text("JVC shows strength: 16,327 AED/sqm.")) as mock_create:
        answer, grounded = stage5.build_answer(
            "Is JVC worth buying?",
            entities={"question_type": "area_report", "area": "JVC"},
            data=fake_data,
        )
    assert grounded is True
    assert "16,327" in answer
    sent_prompt = mock_create.call_args.kwargs["messages"][0]["content"]
    assert "16327" in sent_prompt


def test_falls_back_when_primary_model_errors():
    fake_data = {"area": "Business Bay", "transaction_sample_size": 500,
                 "avg_price_per_sqm": 25784, "avg_actual_worth": 3393809,
                 "most_recent_transaction_date": "2026-08-03"}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        mock_create.side_effect = [Exception("timeout"), _mock_groq_text("Business Bay is strong.")]
        answer, grounded = stage5.build_answer(
            "How is Business Bay performing?",
            entities={"question_type": "area_report", "area": "Business Bay"},
            data=fake_data,
        )
    assert grounded is True
    assert mock_create.call_count == 2


def test_prompt_forbids_unit_size_guessing():
    """Regression guard for the real bedroom-size fabrication bug."""
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "do not assume a typical size and multiply it" in normalized
    assert "area-wide average" in normalized


def test_prompt_forbids_naming_mismatch_confusion():
    """Regression guard for the real Downtown/Burj Khalifa confusion bug."""
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "burj khalifa" in normalized
    assert "do not flag it as a mismatch" in normalized


def test_sample_size_caveat_stripped_even_if_model_includes_it():
    """Confirmed live: the model added 'Data is based on a sample size of
    500 transactions.' as a closing caveat despite not being asked to
    provide analysis-quality commentary. Prompt now explicitly forbids
    this, but per the same reasoning as the list_areas truncation fix,
    a prompt instruction alone isn't a guarantee — this asserts the
    deterministic strip actually removes it even if the model ignores
    the instruction."""
    fake_data = {"area": "JVC", "avg_price_per_sqm": 16327, "avg_price_per_sqft": 1517,
                 "transaction_sample_size": 500}
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text(
                           "JVC shows strength.\n- Average price: 16,327 AED/sqm (1,517 AED/sqft)\n"
                           "Data is based on a sample size of 500 transactions."
                       )):
        answer, grounded = stage5.build_answer(
            "Is JVC worth buying?",
            entities={"question_type": "area_report", "area": "JVC"},
            data=fake_data,
        )
    assert "sample size" not in answer.lower()
    assert "16,327" in answer  # the real content must survive the strip


def test_transaction_count_line_stripped_even_if_model_includes_it():
    """Confirmed live: '- Transactions analyzed for 1-bedroom units: 500'
    was still appearing — the previous prompt actually suggested this
    exact line as an acceptable alternative to a sample-size caveat.
    The prompt no longer suggests it, but per the same defense-in-depth
    reasoning as the sample-size fix, the deterministic strip is the
    real guarantee, not just the prompt wording."""
    fake_data = {"area": "jvc", "bedroom_breakdown": {
        "bedrooms": 1, "avg_price_per_sqm": 15339, "avg_price_per_sqft": 1425,
        "avg_actual_worth": 1114207, "avg_size_sqm": 73.8, "avg_size_sqft": 795,
    }}
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text(
                           "JVC shows strength for 1-bedroom buyers.\n"
                           "- Average price for 1-bedroom units: 15,339 AED/sqm (1,425 AED/sqft)\n"
                           "- Average size of 1-bedroom units: 73.8 sqm (795 sqft)\n"
                           "- Transactions analyzed for 1-bedroom units: 500\n"
                           "Conclusion: 1-bedroom units in JVC are priced competitively."
                       )):
        answer, grounded = stage5.build_answer(
            "What is the price of 1 br in JVC?",
            entities={"question_type": "project_price", "area": "JVC", "bedrooms": 1},
            data=fake_data,
        )
    assert "transactions analyzed" not in answer.lower()
    assert "15,339" in answer  # the real content must survive the strip


def test_prompt_forbids_transaction_count_bullet():
    """The old prompt actually SUGGESTED '- Transactions analyzed: 500'
    as an acceptable line — this asserts that suggestion is gone and
    replaced with an explicit ban."""
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "never include a transaction-count bullet" in normalized
    assert "transactions analyzed: 500\"), never as a disclaimer" not in normalized


def test_prompt_requires_size_sqm_sqft_pairing():
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "avg_size_sqft" in normalized


def test_prompt_forbids_sample_size_caveat():
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "sample size" in normalized
    assert "do not add a caveat" in normalized


def test_prompt_does_not_falsely_claim_no_bedroom_data_exists():
    """Regression guard for a SEPARATE, more serious bug: an earlier
    version of this prompt flatly lied that Acqar's database has no
    bedroom/size breakdown at all. Confirmed live via direct Supabase
    inspection that it DOES (rooms_en, procedure_area columns, real per-
    transaction data). The prompt must not make that blanket false claim
    again — it should defer to what's actually in the data each time."""
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "no breakdown by bedroom count, unit size, or unit type" not in normalized, (
        "This is the exact false claim that was found and corrected — "
        "the prompt must not reintroduce it."
    )
    assert "look at the data itself to see what it actually contains" in normalized


# ===========================================================================
# Everything below was previously test_stage5_new_features.py, merged in here
# ===========================================================================


def test_list_areas_never_calls_the_model():
    fake_data = {"all_areas": [{"district_code": "D001", "district_name": "4 Al Yilayis St"}]}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "What areas do you cover?",
            entities={"question_type": "list_areas", "area": None},
            data=fake_data,
        )
    mock_create.assert_not_called()
    assert grounded is True


def test_list_areas_at_real_scale_renders_all_397_no_truncation():
    """The actual regression guard: build a fake table the same size as
    the real districts table (397 rows, D001-D397) and assert every
    single one is present in the output — this is the exact scale where
    the LLM-based version silently cut off around D379 live."""
    fake_areas = [
        {"district_code": f"D{i:03d}", "district_name": f"Area {i}"}
        for i in range(1, 398)
    ]
    fake_data = {"all_areas": fake_areas}
    answer, grounded = stage5.build_answer(
        "What areas do you cover?",
        entities={"question_type": "list_areas", "area": None},
        data=fake_data,
    )
    assert grounded is True
    assert "397 areas" in answer
    # The exact row that was missing live — must be present now.
    assert "D379" in answer
    assert "Area 379" in answer
    # And the true last row, which never even rendered live before the fix.
    assert "D397" in answer
    assert "Area 397" in answer
    # Every single row, not just the boundary cases.
    for i in range(1, 398):
        assert f"D{i:03d}" in answer, f"D{i:03d} missing from output — truncation regression"


def test_area_properties_never_calls_the_model():
    fake_data = {"area": "Dubai Hills Estate", "properties": ["Property A"], "total_property_count": 1}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "What's in Dubai Hills Estate?",
            entities={"question_type": "area_properties", "area": "Dubai Hills Estate"},
            data=fake_data,
        )
    mock_create.assert_not_called()
    assert grounded is True


def test_area_properties_honestly_labels_capped_vs_total():
    fake_data = {
        "area": "Dubai Hills Estate",
        "properties": [f"Property {i}" for i in range(50)],
        "total_property_count": 214,
    }
    answer, grounded = stage5.build_answer(
        "What's in Dubai Hills Estate?",
        entities={"question_type": "area_properties", "area": "Dubai Hills Estate"},
        data=fake_data,
    )
    assert "214" in answer
    assert "50" in answer
    assert len(answer.split("\n")) >= 50  # every returned property actually rendered


def test_area_properties_all_shown_when_under_cap():
    """When the real total equals what was returned (no capping needed),
    the summary must not falsely imply a partial list."""
    fake_data = {
        "area": "Small Community",
        "properties": ["Property A", "Property B"],
        "total_property_count": 2,
    }
    answer, grounded = stage5.build_answer(
        "What's in Small Community?",
        entities={"question_type": "area_properties", "area": "Small Community"},
        data=fake_data,
    )
    assert "showing the first" not in answer.lower()


# ---------------------------------------------------------------------------
# recent_transactions — the confirmed live uniform-PSM fabrication bug
# ---------------------------------------------------------------------------
def test_recent_transactions_never_calls_the_model():
    fake_data = {"area": "Dubai Islands", "recent_transactions": [
        {"date": "2026-02-26", "type": "3 B/R", "project": None, "size_sqft": 1894,
         "psm_aed": 23806, "psf_aed": 2212, "price_aed": 4190000},
    ]}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "Recent transactions in Dubai Islands",
            entities={"question_type": "area_report", "area": "Dubai Islands"},
            data=fake_data,
        )
    mock_create.assert_not_called()
    assert grounded is True


def test_recent_transactions_each_row_keeps_its_own_real_psm():
    """The actual regression guard for the confirmed live bug: real PSM
    values varied 14,872-39,615 AED/sqm across 10 real rows, but the
    LLM-rendered table showed 24,969 for every single one. This proves
    the deterministic renderer preserves each row's distinct real value."""
    fake_data = {"area": "Dubai Islands", "recent_transactions": [
        {"date": "2026-02-26", "type": "4 B/R", "project": None, "size_sqft": 6458,
         "psm_aed": 16501, "psf_aed": 1533, "price_aed": 9900000},
        {"date": "2026-02-26", "type": "6 B/R", "project": None, "size_sqft": 13674,
         "psm_aed": 33846, "psf_aed": 3145, "price_aed": 42999999},
        {"date": "2026-02-26", "type": "5 B/R", "project": None, "size_sqft": 8423,
         "psm_aed": 39616, "psf_aed": 3682, "price_aed": 31000000},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in Dubai Islands",
        entities={"question_type": "area_report", "area": "Dubai Islands"},
        data=fake_data,
    )
    assert "16,501" in answer
    assert "33,846" in answer
    assert "39,616" in answer
    # The exact failure mode: must NOT collapse to one shared value.
    psm_values = {"16,501", "33,846", "39,616"}
    for v in psm_values:
        assert v in answer


def test_recent_transactions_shows_dash_for_missing_project():
    fake_data = {"area": "Dubai Islands", "recent_transactions": [
        {"date": "2026-02-26", "type": "3 B/R", "project": None, "size_sqft": 1894,
         "psm_aed": 23806, "psf_aed": 2212, "price_aed": 4190000},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in Dubai Islands",
        entities={"question_type": "area_report", "area": "Dubai Islands"},
        data=fake_data,
    )
    assert "—" in answer  # honest placeholder, not a guessed project name


def test_recent_transactions_shows_real_project_when_present():
    fake_data = {"area": "JVC", "recent_transactions": [
        {"date": "2026-07-13", "type": "1 B/R", "project": "Bloom Towers", "size_sqft": 552,
         "psm_aed": 24995, "psf_aed": 2322, "price_aed": 1281000},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in JVC",
        entities={"question_type": "area_report", "area": "JVC"},
        data=fake_data,
    )
    assert "Bloom Towers" in answer


def test_recent_transactions_adds_note_when_project_coverage_very_low():
    """Confirmed live: DAMAC Hills 2 has project_name_en populated for
    only 3.3% of 6,026 real transactions (checked master_project_en too —
    0% populated, not a usable fallback). Showing 10 dashes with no
    explanation reads as broken. Must NOT invent project names to fill
    them — that would reintroduce the exact fabrication bug already
    fixed for PSM — instead, one honest note explaining the real gap."""
    fake_data = {"area": "DAMAC Hills 2 (Akoya by DAMAC)", "recent_transactions": [
        {"date": "2026-02-27", "type": "5 B/R", "project": None, "size_sqft": 2516,
         "psm_aed": 15615, "psf_aed": 1451, "price_aed": 3650000},
        {"date": "2026-02-27", "type": "3 B/R", "project": None, "size_sqft": 1649,
         "psm_aed": 8812, "psf_aed": 819, "price_aed": 1350000},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in DAMAC Hills 2",
        entities={"question_type": "area_report", "area": "DAMAC Hills 2 (Akoya by DAMAC)"},
        data=fake_data,
    )
    assert "aren't recorded" in answer
    assert "0/2" in answer
    # Still never fabricated — dashes remain, not invented names.
    assert answer.count("—") >= 2


def test_recent_transactions_no_note_when_project_coverage_normal():
    """The note must be a rare, honest exception — not noise on every
    ordinary transaction list where projects are mostly present."""
    fake_data = {"area": "JVC", "recent_transactions": [
        {"date": "2026-07-13", "type": "1 B/R", "project": "Bloom Towers", "size_sqft": 552,
         "psm_aed": 24995, "psf_aed": 2322, "price_aed": 1281000},
        {"date": "2026-07-12", "type": "2 B/R", "project": "Belgravia", "size_sqft": 900,
         "psm_aed": 22000, "psf_aed": 2044, "price_aed": 1839600},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in JVC",
        entities={"question_type": "area_report", "area": "JVC"},
        data=fake_data,
    )
    assert "aren't recorded" not in answer


def test_recent_transactions_ends_with_real_computed_conclusion():
    """New three-part structure: Summary -> Table -> Conclusion. The
    conclusion must be real arithmetic on the shown rows (dominant type,
    PSF range, priciest deal, blended average), never a new claim."""
    fake_data = {"area": "Business Bay", "recent_transactions": [
        {"date": "2026-08-03", "type": "1 B/R", "project": "Regalia", "size_sqft": 733,
         "psm_aed": 17629, "psf_aed": 1638, "price_aed": 1200000},
        {"date": "2026-08-03", "type": "1 B/R", "project": "Zada Tower", "size_sqft": 469,
         "psm_aed": 21240, "psf_aed": 1973, "price_aed": 925000},
        {"date": "2026-08-03", "type": "4 B/R", "project": "Vela Viento", "size_sqft": 5276,
         "psm_aed": 73882, "psf_aed": 6864, "price_aed": 36211000},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in Business Bay",
        entities={"question_type": "area_report", "area": "Business Bay"},
        data=fake_data,
    )
    assert "A few quick observations" in answer
    # dominant type (1 B/R appears twice)
    assert "1 B/R units dominate this set (2/3)" in answer
    # real PSF range from the shown rows
    assert "1,638-6,864 AED" in answer
    # the actual priciest real deal
    assert "Vela Viento at 36,211,000 AED" in answer
    # real blended average: (1638+1973+6864)/3 = 3491.67 -> 3492
    assert "3,492 AED/sqft" in answer
    # conclusion comes AFTER the table, not before it
    assert answer.index("A few quick observations") > answer.index("| # |")


def test_recent_transactions_conclusion_handles_single_row():
    """A one-row result shouldn't crash or claim a false 'range'."""
    fake_data = {"area": "JVC", "recent_transactions": [
        {"date": "2026-07-13", "type": "1 B/R", "project": "Bloom Towers", "size_sqft": 552,
         "psm_aed": 24995, "psf_aed": 2322, "price_aed": 1281000},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in JVC",
        entities={"question_type": "area_report", "area": "JVC"},
        data=fake_data,
    )
    assert "all priced at 2,322 AED/sqft" in answer
    assert "range" not in answer.lower()


def test_recent_transactions_conclusion_skipped_when_no_psf_data():
    """No real computed conclusion is possible with nothing to compute
    from — must not fabricate one, and must not crash."""
    fake_data = {"area": "Somewhere", "recent_transactions": [
        {"date": "2026-07-13", "type": None, "project": None, "size_sqft": None,
         "psm_aed": None, "psf_aed": None, "price_aed": None},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in Somewhere",
        entities={"question_type": "area_report", "area": "Somewhere"},
        data=fake_data,
    )
    assert "A few quick observations" not in answer


def test_list_areas_ends_with_usage_hint():
    fake_data = {"all_areas": [{"district_code": "D001", "district_name": "4 Al Yilayis St"}]}
    answer, grounded = stage5.build_answer(
        "What areas do you cover?",
        entities={"question_type": "list_areas", "area": None},
        data=fake_data,
    )
    assert answer.strip().endswith("trend data._")


def test_area_properties_ends_with_usage_hint():
    fake_data = {"area": "JVC", "properties": ["Bloom Towers"], "total_property_count": 1}
    answer, grounded = stage5.build_answer(
        "What's in JVC?",
        entities={"question_type": "area_properties", "area": "JVC"},
        data=fake_data,
    )
    assert answer.strip().endswith("recent sales._")


def test_area_projects_never_calls_the_model():
    fake_data = {"area": "jumeirah village circle (jvc)", "area_projects": [
        {"project": "Auresta Tower", "transaction_count": 1021, "avg_price_per_sqm": 15501, "avg_price_per_sqft": 1440},
    ]}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "What projects are in JVC?",
            entities={"question_type": "area_projects", "area": "JVC"},
            data=fake_data,
        )
    mock_create.assert_not_called()
    assert grounded is True


def test_area_projects_shows_real_ranked_data_not_district_properties():
    """The actual fix for the confirmed live bug: this must show avm's
    real transacted projects (Auresta Tower, Serenz by Danube — real
    JVC data), never district_properties' directory names."""
    fake_data = {"area": "JVC", "area_projects": [
        {"project": "Auresta Tower", "transaction_count": 1021, "avg_price_per_sqm": 15501, "avg_price_per_sqft": 1440},
        {"project": "Serenz by Danube", "transaction_count": 823, "avg_price_per_sqm": 23752, "avg_price_per_sqft": 2207},
    ]}
    answer, grounded = stage5.build_answer(
        "What projects are in JVC?",
        entities={"question_type": "area_projects", "area": "JVC"},
        data=fake_data,
    )
    assert "Auresta Tower" in answer
    assert "1,021" in answer
    assert "Serenz by Danube" in answer
    assert "Al Yousuf Towers" not in answer  # a real district_properties entry — must not leak in


# ===========================================================================
# price_trend table — confirmed live: the year_price_trend RPC was never
# actually applied to the live database (only handed over as a file, not
# run), so every trend request silently returned no data. Once fixed,
# the table only showed 2 of 5 real years, since the model was told to
# summarize rather than list every year (expecting a frontend chart that
# didn't exist either). Both are fixed: chart now exists on the
# frontend, and this deterministic table guarantees every real year
# shows up regardless of what the model does in its own text.
# ===========================================================================
def test_price_trend_table_appended_with_all_real_years():
    trend = [
        {"year": 2021, "avg_price_per_sqm": 16375, "avg_price_per_sqft": 1521, "transaction_count": 1},
        {"year": 2023, "avg_price_per_sqm": 17104, "avg_price_per_sqft": 1589, "transaction_count": 15},
        {"year": 2026, "avg_price_per_sqm": 16797, "avg_price_per_sqft": 1560, "transaction_count": 11306},
    ]
    fake_data = {"area": "JVC", "avg_price_per_sqm": 16478, "price_trend": trend}
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text(
                           "JVC shows an upward trend.\n- Prices rose 2.6% from 2021 to 2026.")):
        answer, grounded = stage5.build_answer(
            "How has it trended?",
            entities={"question_type": "area_report", "area": "JVC", "wants_trend": True},
            data=fake_data,
        )
    # every real year present, not just first/last
    assert "2021" in answer
    assert "2023" in answer  # the middle year — the actual regression check
    assert "2026" in answer
    assert "17,104" in answer  # 2023's real value, not summarized away
    assert "11,306" in answer  # real transaction count preserved


def test_price_trend_table_appears_after_model_answer():
    trend = [{"year": 2021, "avg_price_per_sqm": 16375, "avg_price_per_sqft": 1521, "transaction_count": 1}]
    fake_data = {"area": "JVC", "price_trend": trend}
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text("JVC shows a trend.\n- Some bullet.")):
        answer, grounded = stage5.build_answer(
            "How has it trended?",
            entities={"question_type": "area_report", "area": "JVC", "wants_trend": True},
            data=fake_data,
        )
    assert answer.index("JVC shows a trend") < answer.index("Year-by-Year")


def test_no_trend_table_appended_when_price_trend_absent():
    """An ordinary area_report answer with no trend data must not
    grow a stray empty table."""
    fake_data = {"area": "JVC", "avg_price_per_sqm": 16478}
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text("JVC looks solid.")):
        answer, grounded = stage5.build_answer(
            "Is JVC worth buying?",
            entities={"question_type": "area_report", "area": "JVC"},
            data=fake_data,
        )
    assert "Year-by-year" not in answer


def test_prompt_forbids_model_from_rendering_its_own_trend_table():
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "do not render any table for this yourself" in normalized


# ===========================================================================
# Beta v2 — developer lookup (T5) and two-area comparison (T2)
# ===========================================================================
def test_developer_projects_never_calls_the_model():
    fake_data = {"developer": "Binghatti", "developer_projects": [
        {"project": "Maybach Six", "area": "Nad Al Shiba First", "status": "ACTIVE",
         "transaction_count": 2794, "avg_price_per_sqm": 41312},
    ]}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "Latest Binghatti project?",
            entities={"question_type": "developer_lookup", "developer": "Binghatti"},
            data=fake_data,
        )
    mock_create.assert_not_called()
    assert grounded is True


def test_developer_projects_shows_real_data_including_honest_zero():
    """T5: 'Latest Binghatti project?' — must show real developer/project
    data, including a project with genuinely zero transactions (not
    hidden, not guessed)."""
    fake_data = {"developer": "Binghatti", "developer_projects": [
        {"project": "Maybach Six", "area": "Nad Al Shiba First", "status": "ACTIVE",
         "transaction_count": 2794, "avg_price_per_sqm": 41312},
        {"project": "Binghatti Square 3", "area": "Wadi Al Safa 3", "status": "ACTIVE",
         "transaction_count": 0, "avg_price_per_sqm": None},
    ]}
    answer, grounded = stage5.build_answer(
        "Latest Binghatti project?",
        entities={"question_type": "developer_lookup", "developer": "Binghatti"},
        data=fake_data,
    )
    assert "Maybach Six" in answer
    assert "2,794" in answer
    assert "Binghatti Square 3" in answer
    assert "| 2 | Binghatti Square 3 | Wadi Al Safa 3 | ACTIVE | 0 | — |" in answer


def test_developer_info_absent_when_not_in_data():
    """Backward compatibility: developer_lookup answers without a
    developer_info key (e.g. no developer_id resolved) must format
    exactly as before — no empty section, no crash."""
    fake_data = {"developer": "Binghatti", "developer_projects": [
        {"project": "Maybach Six", "area": "Nad Al Shiba First", "status": "ACTIVE",
         "transaction_count": 2794, "avg_price_per_sqm": 41312},
    ]}
    answer, grounded = stage5.build_answer(
        "Latest Binghatti project?",
        entities={"question_type": "developer_lookup", "developer": "Binghatti"},
        data=fake_data,
    )
    assert "Registered legal entity" not in answer
    assert "Maybach Six" in answer


def test_developer_info_shows_real_license_data():
    """Closes doc issue #10 (P2): developers table (Dataset 21) data,
    once present, must actually show up in the answer."""
    fake_data = {"developer": "Damac", "developer_projects": [
        {"project": "Damac Islands 2 - Bahamas 2", "area": "Al Yelayiss 1", "status": "ACTIVE",
         "transaction_count": 1325, "avg_price_per_sqm": 19474},
    ], "developer_info": [
        {"developer_name": "DAMAC PRIME DEVELOPMENT L.L.C", "legal_status": "Limited Responsibility",
         "license_type": "PROFESSIONAL", "license_number": "784109",
         "license_expiry_date": "2026-06-05", "is_license_expired": True,
         "registration_date": "2025-08-11"},
    ]}
    answer, grounded = stage5.build_answer(
        "What has Damac built recently?",
        entities={"question_type": "developer_lookup", "developer": "Damac"},
        data=fake_data,
    )
    assert "DAMAC PRIME DEVELOPMENT L.L.C" in answer
    assert "784109" in answer
    assert "2026-06-05" in answer
    assert "EXPIRED" in answer  # confirmed live: this exact entity's license really has lapsed


def test_developer_info_no_expired_marker_when_license_current():
    fake_data = {"developer": "Emaar", "developer_projects": [
        {"project": "Some Project", "area": "Downtown", "status": "ACTIVE",
         "transaction_count": 500, "avg_price_per_sqm": 25000},
    ], "developer_info": [
        {"developer_name": "EMAAR PROPERTIES PJSC", "legal_status": "Public Shareholding",
         "license_type": "PROFESSIONAL", "license_number": "12345",
         "license_expiry_date": "2028-01-01", "is_license_expired": False,
         "registration_date": "2005-01-01"},
    ]}
    answer, grounded = stage5.build_answer(
        "Tell me about Emaar",
        entities={"question_type": "developer_lookup", "developer": "Emaar"},
        data=fake_data,
    )
    assert "EMAAR PROPERTIES PJSC" in answer
    assert "EXPIRED" not in answer


def test_developer_info_shows_multiple_entities_separately():
    """Confirmed live: a brand can span several real, separately
    licensed legal entities. All must be shown, never collapsed into
    one or silently reduced to the first."""
    fake_data = {"developer": "Damac", "developer_projects": [
        {"project": "Some Project", "area": "Some Area", "status": "ACTIVE",
         "transaction_count": 10, "avg_price_per_sqm": 15000},
    ], "developer_info": [
        {"developer_name": "DAMAC PRIME DEVELOPMENT L.L.C", "legal_status": "Limited Responsibility",
         "license_type": "PROFESSIONAL", "license_number": "784109",
         "license_expiry_date": "2026-06-05", "is_license_expired": True,
         "registration_date": "2025-08-11"},
        {"developer_name": "DAMAC CROWN PROPERTIES COMPANY LIMITED", "legal_status": "Limited Responsibility",
         "license_type": "BUSINESS", "license_number": "301",
         "license_expiry_date": "2025-12-30", "is_license_expired": True,
         "registration_date": "2011-10-20"},
    ]}
    answer, grounded = stage5.build_answer(
        "What has Damac built recently?",
        entities={"question_type": "developer_lookup", "developer": "Damac"},
        data=fake_data,
    )
    assert "DAMAC PRIME DEVELOPMENT L.L.C" in answer
    assert "DAMAC CROWN PROPERTIES COMPANY LIMITED" in answer


def test_comparison_table_shows_both_real_areas_side_by_side():
    """T2: 'Dubai Hills Estate or Dubai Marina, long-term?' — real
    numbers for BOTH areas, no confusing name-mismatch note."""
    fake_data = {"comparison": [
        {"area": "Dubai Hills Estate", "avg_price_per_sqm": 18000, "avg_price_per_sqft": 1672,
         "avg_actual_worth": 2100000},
        {"area": "Dubai Marina", "avg_price_per_sqm": 22000, "avg_price_per_sqft": 2044,
         "avg_actual_worth": 1950000},
    ]}
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text(
                           "Dubai Marina shows the stronger long-term pricing power.\n"
                           "- Dubai Hills Estate: 18,000 AED/sqm\n- Dubai Marina: 22,000 AED/sqm")):
        answer, grounded = stage5.build_answer(
            "Dubai Hills Estate or Dubai Marina, long-term?",
            entities={"question_type": "comparison", "area": "Dubai Hills Estate", "area2": "Dubai Marina"},
            data=fake_data,
        )
    assert "Dubai Hills Estate" in answer
    assert "Dubai Marina" in answer
    assert "18,000" in answer
    assert "22,000" in answer
    assert "Side-by-Side Comparison" in answer


def test_comparison_table_handles_one_missing_side_honestly():
    fake_data = {"comparison": [
        {"area": "JVC", "avg_price_per_sqm": 16000, "avg_price_per_sqft": 1487, "avg_actual_worth": 1100000},
        None,
    ]}
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text(
                           "Only JVC has data available for this comparison.\n- JVC: 16,000 AED/sqm")):
        answer, grounded = stage5.build_answer(
            "JVC or Nonexistent Area, long-term?",
            entities={"question_type": "comparison", "area": "JVC", "area2": "Nonexistent Area"},
            data=fake_data,
        )
    assert "No data found for Area 2" in answer
    assert "16,000" in answer


def test_prompt_covers_two_area_comparison_format():
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "two-area comparisons" in normalized
    assert "x is actually in y, not z" in normalized


# ===========================================================================
# Best-format redesign: every answer follows Heading -> Key Metrics ->
# (table) -> Conclusion, with bold used for the heading/key numbers and
# a bold "Conclusion:" label, never left unstyled.
# ===========================================================================
def test_prompt_requires_bold_heading_key_metrics_conclusion_structure():
    normalized = " ".join(stage5.ANSWER_WITH_DATA_PROMPT.lower().split())
    assert "heading -> key metrics -> (table" in normalized
    assert '"**key metrics**"' in normalized
    assert '"**conclusion:**"' in normalized


def test_deterministic_list_areas_heading_is_bold():
    fake_data = {"all_areas": [{"district_code": "D001", "district_name": "Test"}]}
    answer, grounded = stage5.build_answer(
        "What areas do you cover?",
        entities={"question_type": "list_areas", "area": None},
        data=fake_data,
    )
    assert answer.startswith("**We currently cover")


def test_deterministic_recent_transactions_heading_and_conclusion_are_bold():
    fake_data = {"area": "JVC", "recent_transactions": [
        {"date": "2026-07-13", "type": "1 B/R", "project": "Bloom Towers", "size_sqft": 552,
         "psm_aed": 24995, "psf_aed": 2322, "price_aed": 1281000},
        {"date": "2026-07-12", "type": "2 B/R", "project": "Belgravia", "size_sqft": 900,
         "psm_aed": 22000, "psf_aed": 2044, "price_aed": 1839600},
    ]}
    answer, grounded = stage5.build_answer(
        "Recent transactions in JVC",
        entities={"question_type": "area_report", "area": "JVC"},
        data=fake_data,
    )
    assert answer.startswith("**Here are the 2 most recent JVC sales:**")
    assert "**Conclusion:**" in answer


def test_deterministic_area_projects_heading_is_bold():
    fake_data = {"area": "JVC", "area_projects": [
        {"project": "Auresta Tower", "transaction_count": 1021, "avg_price_per_sqm": 15501, "avg_price_per_sqft": 1440},
    ]}
    answer, grounded = stage5.build_answer(
        "What projects are in JVC?",
        entities={"question_type": "area_projects", "area": "JVC"},
        data=fake_data,
    )
    assert answer.startswith("**Here are the real, transacted projects")


def test_deterministic_developer_projects_heading_is_bold():
    fake_data = {"developer": "Binghatti", "developer_projects": [
        {"project": "Maybach Six", "area": "Nad Al Shiba First", "status": "ACTIVE",
         "transaction_count": 2794, "avg_price_per_sqm": 41312},
    ]}
    answer, grounded = stage5.build_answer(
        "Latest Binghatti project?",
        entities={"question_type": "developer_lookup", "developer": "Binghatti"},
        data=fake_data,
    )
    assert answer.startswith("**Here are Binghatti's real projects")


def test_deterministic_hints_use_italic_not_bold():
    """Usage hints are a lighter-weight emphasis than headings — italic,
    not bold, to visually distinguish 'here's the answer' from 'by the
    way, you can also...'"""
    fake_data = {"all_areas": [{"district_code": "D001", "district_name": "Test"}]}
    answer, grounded = stage5.build_answer(
        "What areas do you cover?",
        entities={"question_type": "list_areas", "area": None},
        data=fake_data,
    )
    assert answer.strip().endswith("trend data._")
    assert not answer.strip().endswith("trend data.**")


# ===========================================================================
# "Top N areas by X" ranking (e.g. "top 10 selling areas in 2026")
# ===========================================================================
def test_top_areas_never_calls_the_model():
    fake_data = {"metric": "volume", "year": 2026, "ranked_areas": [
        {"area": "Madinat Al Mataar", "transaction_count": 14505, "avg_price_per_sqm": 5201, "avg_price_per_sqft": 483},
    ]}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "Top 10 selling areas in 2026?",
            entities={"question_type": "top_areas_ranking"},
            data=fake_data,
        )
    mock_create.assert_not_called()
    assert grounded is True


def test_top_areas_shows_real_ranked_data_with_year_and_metric():
    fake_data = {"metric": "volume", "year": 2026, "ranked_areas": [
        {"area": "Madinat Al Mataar", "transaction_count": 14505, "avg_price_per_sqm": 5201, "avg_price_per_sqft": 483},
        {"area": "Jumeirah Village Circle (JVC)", "transaction_count": 11306, "avg_price_per_sqm": 16797, "avg_price_per_sqft": 1560},
    ]}
    answer, grounded = stage5.build_answer(
        "Top 10 selling areas in 2026?",
        entities={"question_type": "top_areas_ranking"},
        data=fake_data,
    )
    assert "Madinat Al Mataar" in answer
    assert "14,505" in answer
    assert "Jumeirah Village Circle (JVC)" in answer
    assert "2026" in answer
    assert answer.startswith("**Top 2 most active")


def test_top_areas_price_high_label_differs_from_volume():
    fake_data = {"metric": "price_high", "year": 2026, "ranked_areas": [
        {"area": "Mohammed Bin Rashid City", "transaction_count": 1601, "avg_price_per_sqm": 187699, "avg_price_per_sqft": 17439},
    ]}
    answer, grounded = stage5.build_answer(
        "Most expensive areas in 2026?",
        entities={"question_type": "top_areas_ranking"},
        data=fake_data,
    )
    assert "most expensive" in answer.lower()
    assert "most active" not in answer.lower()


def test_top_projects_never_calls_the_model():
    fake_data = {"metric": "volume", "year": 2026, "ranked_projects": [
        {"name": "Maybach Six", "transaction_count": 1918, "avg_price_per_sqm": 41905, "avg_price_per_sqft": 3894},
    ]}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "Top selling projects in 2026?",
            entities={"question_type": "top_projects_ranking"},
            data=fake_data,
        )
    mock_create.assert_not_called()
    assert "Maybach Six" in answer
    assert grounded is True


def test_top_developers_never_calls_the_model():
    fake_data = {"metric": "volume", "year": 2026, "ranked_developers": [
        {"name": "DAMAC PRIME DEVELOPMENT L.L.C", "transaction_count": 5957, "avg_price_per_sqm": 19633},
    ]}
    with patch.object(stage5.groq_client.chat.completions, "create") as mock_create:
        answer, grounded = stage5.build_answer(
            "Top developers in 2026?",
            entities={"question_type": "top_developers_ranking"},
            data=fake_data,
        )
    mock_create.assert_not_called()
    assert "DAMAC PRIME DEVELOPMENT L.L.C" in answer
    assert "5,957" in answer
    assert grounded is True


def test_market_overview_goes_through_the_model_for_real_analysis():
    """Unlike the pure rankings, a market overview needs real judgment
    (how's the market doing) — it should NOT bypass the model, unlike
    list_areas/top_areas/etc."""
    fake_data = {"year": 2026, "transaction_count": 226361, "avg_price_per_sqm": 22210,
                 "avg_price_per_sqft": 2064, "avg_actual_worth": 1850000}
    with patch.object(stage5.groq_client.chat.completions, "create",
                       return_value=_mock_groq_text(
                           "**The Dubai market shows strong activity in 2026.**\n\n"
                           "**Key Metrics**\n- Transactions: **226,361**\n\n"
                           "**Conclusion:** A healthy, liquid market overall.")) as mock_create:
        answer, grounded = stage5.build_answer(
            "How's the Dubai property market doing in 2026?",
            entities={"question_type": "market_overview"},
            data=fake_data,
        )
    mock_create.assert_called_once()
    assert grounded is True

"""
Stage 5 tests — the confirmed live truncation bug and its fix.

Live bug: a list_areas question returned a table cut off at D379 out of
397 real areas, despite the LLM being explicitly instructed to render
every row. Root cause: asking a model to verbatim-echo a long list is
unreliable regardless of prompt wording. Fix: list_areas and
area_properties are now built in plain Python (deterministic string
formatting), never sent through the LLM at all. These tests prove that
fix at real scale — 397 rows, matching the actual live count — not just
a small hand-built sample that wouldn't have caught the original bug.
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

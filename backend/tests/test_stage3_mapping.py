"""Unit tests for deterministic Stage 3 item–control mapping."""

from __future__ import annotations

from app.compliance_pipeline.stage3_mapping import build_item_control_mappings, validate_stage3


def test_build_mappings_primary_and_weights():
    stage1 = {
        "cscf_version": "testv",
        "controls": [
            {"id": "1.1", "name": "C1"},
            {"id": "1.2", "name": "C2"},
        ],
    }
    stage2 = {
        "canonical_evidence_items": [
            {
                "item_code": "A1",
                "domain_id": "A",
                "sort_order": 1,
                "name": "Broad",
                "control_count": 2,
                "controls_served": ["1.1", "1.2"],
                "reuse_tier": "HIGH",
                "sufficiency_definition": "Must show X.",
            },
            {
                "item_code": "A2",
                "domain_id": "A",
                "sort_order": 2,
                "name": "Narrow",
                "control_count": 1,
                "controls_served": ["1.1"],
                "reuse_tier": "LOW",
                "sufficiency_definition": "Must show Y.",
            },
        ]
    }
    out = build_item_control_mappings(stage1, stage2, "testv")
    rows = out["item_control_mappings"]
    assert len(rows) == 3
    by_pair = {(r["evidence_item_code"], r["control_id"]): r for r in rows}
    assert by_pair[("A1", "1.1")]["is_primary"] is True
    assert by_pair[("A2", "1.1")]["is_primary"] is False
    assert by_pair[("A1", "1.2")]["is_primary"] is True
    assert 0.10 <= float(by_pair[("A1", "1.1")]["weight"]) <= 1.0
    v = validate_stage3(out, stage1, stage2)
    assert v["errors"] == []


def test_validate_detects_two_primaries_for_same_control():
    stage1 = {"controls": [{"id": "1.1", "name": "C"}], "cscf_version": "x"}
    stage2 = {
        "canonical_evidence_items": [
            {
                "item_code": "A1",
                "domain_id": "A",
                "sort_order": 1,
                "name": "One",
                "control_count": 1,
                "controls_served": ["1.1"],
                "reuse_tier": "LOW",
            },
            {
                "item_code": "A2",
                "domain_id": "A",
                "sort_order": 2,
                "name": "Two",
                "control_count": 1,
                "controls_served": ["1.1"],
                "reuse_tier": "LOW",
            },
        ]
    }
    out = build_item_control_mappings(stage1, stage2, "x")
    for r in out["item_control_mappings"]:
        r["is_primary"] = True
    v = validate_stage3(out, stage1, stage2)
    assert any("primary" in e.lower() for e in v["errors"])

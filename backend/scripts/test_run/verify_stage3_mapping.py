#!/usr/bin/env python3
"""Smoke test for Stage 3 Python mapping (no API, no Vertex). Run from repo root:

  PYTHONPATH=backend python backend/scripts/test_run/verify_stage3_mapping.py
"""

from __future__ import annotations

import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

from app.compliance_pipeline.stage3_mapping import build_item_control_mappings, validate_stage3  # noqa: E402


def main() -> None:
    stage1 = {
        "cscf_version": "demo",
        "controls": [
            {"id": "1.1", "name": "Alpha"},
            {"id": "1.2", "name": "Beta"},
        ],
    }
    stage2 = {
        "canonical_evidence_items": [
            {
                "item_code": "A1",
                "domain_id": "A",
                "sort_order": 1,
                "name": "Shared evidence",
                "control_count": 2,
                "controls_served": ["1.1", "1.2"],
                "reuse_tier": "MEDIUM",
                "sufficiency_definition": "Demonstrate coverage.",
            },
        ]
    }
    out = build_item_control_mappings(stage1, stage2, "demo")
    v = validate_stage3(out, stage1, stage2)
    assert not v["errors"], v["errors"]
    assert len(out["item_control_mappings"]) == 2
    print("verify_stage3_mapping: OK (%d rows)" % len(out["item_control_mappings"]))


if __name__ == "__main__":
    main()

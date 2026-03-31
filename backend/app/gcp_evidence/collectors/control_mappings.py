"""
SWIFT CSCF (item_code, control_id) pairs for GCP collectors.
Uses the same canonical matrix as AWS (evidence_mapping.EVIDENCE_REGISTRY) so control coverage stays aligned.
"""
from __future__ import annotations

from app.aws_evidence.collectors.evidence_mapping import EVIDENCE_REGISTRY


def swift_control_pairs(*item_ids: str) -> list[tuple[str, str]]:
    """All (item_code, control_id) tuples for the given evidence items (e.g. "A1", "C2")."""
    want = {i.strip().upper() for i in item_ids if i and str(i).strip()}
    out: list[tuple[str, str]] = []
    for spec in EVIDENCE_REGISTRY:
        iid = (spec.get("item_id") or "").strip().upper()
        if iid not in want:
            continue
        for cid in spec.get("control_ids") or []:
            out.append((iid, str(cid)))
    return out

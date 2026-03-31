"""G — Physical / datacenter scope (API placeholder; real evidence is contractual / attestations)."""
from __future__ import annotations

from datetime import datetime

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "compliance_attestation_scope"
EVIDENCE_TYPE = "AWS compliance attestation"
SOURCE_SYSTEM = "gcp-compliance-scope"
CONTROL_MAPPINGS = swift_control_pairs("G")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    now = datetime.utcnow()
    payload = {
        "collector": COLLECTOR_NAME,
        "project_id": project_id,
        "collected_at": now.isoformat(),
        "note": (
            "No project API exposes physical controls. For GCP, use Google Cloud compliance reports "
            "(e.g. SOC, ISO) from the Google Cloud Compliance Resource Center and your DPA; attach PDFs or "
            "Artifact exports as manual evidence for control 3.1."
        ),
        "manual_evidence_expected": True,
    }
    return [(payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM) for item_code, control_id in CONTROL_MAPPINGS]

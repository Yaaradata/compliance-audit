"""B8 — Recovery Services vaults and backup-related resources."""
from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array, query_resources_sample
from app.azure_evidence.collectors.control_mappings import swift_control_pairs

COLLECTOR_NAME = "azure_backup"
EVIDENCE_TYPE = "Backup posture"
SOURCE_SYSTEM = COLLECTOR_NAME
CONTROL_MAPPINGS = swift_control_pairs("B8")

_KQL = """
Resources
| where type in~ (
    'microsoft.recoveryservices/vaults',
    'microsoft.dataprotection/backupvaults',
    'microsoft.compute/virtualmachines'
)
| project id, name, type, resourceGroup, properties
| take 400
"""


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    rows, err = query_object_array(credential, subscription_id, _KQL, max_rows=1500)
    fallback_note = None
    if not rows and not err:
        sample_rows, sample_err = query_resources_sample(credential, subscription_id, max_rows=120)
        if sample_rows:
            rows = sample_rows
            fallback_note = "Collector-specific query returned 0 rows; attached subscription-wide resource sample for diagnostics."
        elif sample_err:
            fallback_note = f"Collector query returned 0 rows and fallback sample failed: {sample_err}"
    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "resource_graph_error": err,
        "row_count": len(rows),
        "resources": rows,
        "fallback_note": fallback_note,
    }
    if err and not rows:
        payload["error"] = err
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results

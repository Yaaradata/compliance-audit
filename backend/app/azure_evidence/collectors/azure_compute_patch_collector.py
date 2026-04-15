"""B1, D2, D3 — VM security profile, extensions (AMA, Defender), maintenance."""
from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array, query_resources_sample
from app.azure_evidence.collectors.control_mappings import swift_control_pairs
from app.azure_evidence.collectors.inventory_llm_shape import vm_inventory_rows_for_llm

COLLECTOR_NAME = "azure_compute_patch"
EVIDENCE_TYPE = "OS hardening + patch posture"
SOURCE_SYSTEM = COLLECTOR_NAME
# A2: duplicate VM snapshot for SWIFT component inventory autofill (GCP parity: instances[] in payload).
CONTROL_MAPPINGS = swift_control_pairs("B1", "D2", "D3", "A2")


def _evidence_type_for_item(item_code: str) -> str:
    if item_code.upper() == "A2":
        return "Asset inventory + VM discovery (Azure autofill)"
    return EVIDENCE_TYPE

_KQL = """
Resources
| where type in~ (
    'microsoft.compute/virtualmachines',
    'microsoft.compute/virtualmachines/extensions',
    'microsoft.maintenance/configurationassignments'
)
| project id, name, type, resourceGroup, properties
| take 600
"""


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    rows, err = query_object_array(credential, subscription_id, _KQL, max_rows=2500)
    fallback_note = None
    if not rows and not err:
        sample_rows, sample_err = query_resources_sample(credential, subscription_id, max_rows=120)
        if sample_rows:
            rows = sample_rows
            fallback_note = "Collector-specific query returned 0 rows; attached subscription-wide resource sample for diagnostics."
        elif sample_err:
            fallback_note = f"Collector query returned 0 rows and fallback sample failed: {sample_err}"
    instances = vm_inventory_rows_for_llm(rows)
    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "resource_graph_error": err,
        "row_count": len(rows),
        "resources": rows,
        "instances": instances,
        "instance_count": len(instances),
        "fallback_note": fallback_note,
    }
    if err and not rows:
        payload["error"] = err
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, _evidence_type_for_item(item_code), SOURCE_SYSTEM))
    return results

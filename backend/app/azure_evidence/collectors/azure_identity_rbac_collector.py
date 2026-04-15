"""B4, C2, C3, C4, F1 — Role assignments and identity-related resources (Entra CA requires Graph separately)."""
from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array, query_resources_sample
from app.azure_evidence.collectors.control_mappings import swift_control_pairs

COLLECTOR_NAME = "azure_identity_rbac"
EVIDENCE_TYPE = "Authentication and access inventory"
SOURCE_SYSTEM = COLLECTOR_NAME
CONTROL_MAPPINGS = swift_control_pairs("B4", "C2", "C3", "C4", "F1")

# RBAC types are indexed under AuthorizationResources, not Resources (see Azure Resource Graph table reference).
_KQL = """
AuthorizationResources
| where type in~ (
    'microsoft.authorization/roleassignments',
    'microsoft.authorization/roledefinitions'
)
| project id, name, type, properties
| take 800
"""


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    rows, err = query_object_array(credential, subscription_id, _KQL, max_rows=3000)
    fallback_note = None
    if not rows and not err:
        sample_rows, sample_err = query_resources_sample(credential, subscription_id, max_rows=120)
        if sample_rows:
            rows = sample_rows
            fallback_note = "RBAC query returned 0 rows; attached subscription-wide resource sample for diagnostics."
        elif sample_err:
            fallback_note = f"RBAC query returned 0 rows and fallback sample failed: {sample_err}"
    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "resource_graph_error": err,
        "row_count": len(rows),
        "resources": rows,
        "fallback_note": fallback_note,
        "note": (
            "MFA and Conditional Access policies require Microsoft Graph (Entra ID) APIs; "
            "this run captures Azure RBAC role assignments at subscription scope."
        ),
    }
    if err and not rows:
        payload["error"] = err
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results

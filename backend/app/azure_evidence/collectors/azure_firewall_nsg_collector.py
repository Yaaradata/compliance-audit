"""A4, A6 — NSG, Azure Firewall, private endpoints."""
from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array
from app.azure_evidence.collectors.control_mappings import swift_control_pairs

COLLECTOR_NAME = "azure_firewall_nsg"
EVIDENCE_TYPE = "Firewall rule configuration"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = swift_control_pairs("A4", "A6")

_KQL = """
Resources
| where type in~ (
    'microsoft.network/networksecuritygroups',
    'microsoft.network/azurefirewalls',
    'microsoft.network/firewallpolicies',
    'microsoft.network/privateendpoints'
)
| project id, name, type, resourceGroup, properties
| take 600
"""


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    rows, err = query_object_array(credential, subscription_id, _KQL, max_rows=2000)
    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "resource_graph_error": err,
        "row_count": len(rows),
        "resources": rows,
    }
    if err and not rows:
        payload["error"] = err
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results

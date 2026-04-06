from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_e5_software_integrity_controls"
EVIDENCE_TYPE = "Software integrity posture"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("E5", "6.3"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure resources related to software integrity controls, specifically focusing on
    resources that might host or manage software, such as virtual machines, container instances,
    and app services. This collector aims to provide visibility into the posture of these
    resources concerning software integrity.
    """
    results = []
    now = datetime.utcnow()
    collected_at_iso = now.isoformat()

    # KQL query to find resources that are common hosts for software.
    # This includes VMs, Container Instances, App Services, and AKS clusters.
    # We are looking for resources that are running or have a provisioning state that indicates they are active.
    kql = """
    Resources
    | where type =~ 'microsoft.compute/virtualmachines' or
            type =~ 'microsoft.containerinstance/containergroups' or
            type =~ 'microsoft.web/sites' or
            type =~ 'microsoft.containerservice/managedclusters'
    | where properties.provisioningState =~ 'Succeeded' or properties.provisioningState =~ 'Running'
    | project id, name, type, location, properties, sku, tags
    """

    rows, err = query_object_array(
        credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": collected_at_iso,
        "row_count": 0,
        "resources": [],
        "resource_graph_error": None,
    }

    if err:
        payload["error"] = f"Azure Resource Graph query failed: {err}"
        payload["resource_graph_error"] = str(err)
    else:
        payload["row_count"] = len(rows)
        # Truncate the list of resources if it exceeds the maximum allowed
        payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_a1_network_architecture_diagram"
EVIDENCE_TYPE = "Infrastructure topology + Resource Graph snapshot"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("A1", "1.1"),
    ("A1", "1.4"),
    ("A1", "1.5"),
    ("A1", "2.1"),
]


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure network resources for A1 controls, focusing on network architecture.
    Covers virtual networks, subnets, network security groups, public IP addresses,
    and load balancers to provide a snapshot of the network topology.
    """
    results = []
    now = datetime.utcnow()
    max_resources = 600

    # KQL query to gather core networking components
    kql = """
    union
        (
            resources
            | where type =~ 'microsoft.network/virtualnetworks'
            | project id, name, location, tags, properties
        ),
        (
            resources
            | where type =~ 'microsoft.network/virtualnetworks/subnets'
            | project id, name, location, tags, properties, parent_id = split(id, '/subnets/')[0]
        ),
        (
            resources
            | where type =~ 'microsoft.network/networksecuritygroups'
            | project id, name, location, tags, properties
        ),
        (
            resources
            | where type =~ 'microsoft.network/publicipaddresses'
            | project id, name, location, tags, properties
        ),
        (
            resources
            | where type =~ 'microsoft.network/loadbalancers'
            | project id, name, location, tags, properties
        )
    | project id, name, type, location, tags, properties, parent_id
    """

    rows, err = query_object_array(credential, subscription_id, kql, max_rows=max_resources)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": [],
        "resource_graph_error": err,
    }

    if err:
        # If there's an error querying Resource Graph, add it to the payload
        payload["error"] = f"Resource Graph query failed: {err}"
    elif rows:
        # Truncate the list of resources if it exceeds the maximum allowed
        payload["resources"] = rows[:max_resources]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
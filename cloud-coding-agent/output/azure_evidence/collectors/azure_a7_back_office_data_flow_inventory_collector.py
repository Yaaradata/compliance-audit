from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_a7_back_office_data_flow_inventory"
EVIDENCE_TYPE = "Inter-zone connectivity config"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("A7", "2.4"),
]
MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure resources related to back office data flow inventory,
    focusing on inter-zone connectivity configurations.
    """
    results = []
    now = datetime.utcnow()
    payload_base = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": 0,
        "resources": [],
        "resource_graph_error": None,
    }

    # KQL query to find network security groups and their rules,
    # which are fundamental to inter-zone connectivity.
    # This query looks for NSGs and their associated rules.
    # We can infer connectivity by examining inbound/outbound rules.
    kql = """
    Resources
    | where type =~ 'microsoft.network/networksecuritygroups'
    | project
        id,
        name,
        location,
        resourceGroup,
        subscriptionId,
        properties.securityRules
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.network/virtualnetworks/subnets'
        | project
            subnetId = id,
            subnetName = name,
            vnetName = split(id, '/')[2],
            networkSecurityGroupId = tostring(properties.networkSecurityGroup.id)
    ) on $left.id == $right.networkSecurityGroupId
    | project
        nsgId = id,
        nsgName = name,
        location,
        resourceGroup,
        subscriptionId,
        subnetName,
        vnetName,
        securityRules = properties_securityRules
    | where isnotempty(subnetName) // Only include NSGs associated with subnets
    """

    rows, err = query_object_array(
        credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )

    payload = payload_base.copy()
    if err:
        payload["resource_graph_error"] = str(err)
    else:
        payload["row_count"] = len(rows)
        # Truncate resources if necessary
        payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
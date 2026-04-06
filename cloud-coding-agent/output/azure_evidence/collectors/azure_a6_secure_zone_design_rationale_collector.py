from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_a6_secure_zone_design_rationale"
EVIDENCE_TYPE = "Zone isolation architecture"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("A6", "1.1"),
    ("A6", "1.4"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects information about Azure network security groups and their associated
    rules to assess zone isolation architecture.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to find Network Security Groups and their associated rules.
    # This query aims to identify network segmentation controls.
    kql = """
    Resources
    | where type =~ 'microsoft.network/networksecuritygroups'
    | project
        id,
        name,
        location,
        resourceGroup,
        properties = bag_unpack(properties),
        subscriptionId = subscriptionId
    | mv-expand rules = properties.securityRules
    | project
        id,
        name,
        location,
        resourceGroup,
        subscriptionId,
        ruleName = rules.name,
        rulePriority = rules.priority,
        ruleDirection = rules.direction,
        ruleAccess = rules.access,
        ruleProtocol = rules.protocol,
        ruleSourcePortRange = rules.sourcePortRange,
        ruleSourceAddressPrefix = rules.sourceAddressPrefix,
        ruleSourceAddressPrefixes = rules.sourceAddressPrefixes,
        ruleDestinationPortRange = rules.destinationPortRange,
        ruleDestinationAddressPrefix = rules.destinationAddressPrefix,
        ruleDestinationAddressPrefixes = rules.destinationAddressPrefixes,
        ruleDescription = rules.description
    """

    rows, err = query_object_array(
        credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )

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
        # and return the payload for all control mappings.
        payload["error"] = f"Resource Graph query failed: {err}"
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
        return results

    # Truncate the list of resources if it exceeds the maximum allowed.
    payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]

    # Append the collected data for each control mapping.
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
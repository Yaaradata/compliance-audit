from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_e6_intrusion_detection_ids"
EVIDENCE_TYPE = "IDS posture + threat detection"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("E6", "6.5A"),
]


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects information about Azure Security Center (now Microsoft Defender for Cloud)
    Intrusion Detection System (IDS) posture and threat detection capabilities.
    This includes enabled security features and relevant alerts.
    """
    results = []
    now = datetime.utcnow()
    max_resources = 600

    # KQL to find Microsoft Defender for Cloud configurations related to IDS and threat detection
    # This query looks for security solutions and specific recommendations that indicate IDS capabilities.
    # It's a starting point and might need refinement based on specific Defender for Cloud features.
    kql = """
    securityresources
    | where type =~ 'microsoft.security/pricings'
    | where properties.pricingTier =~ 'standard' or properties.pricingTier =~ 'advanced'
    | project
        id,
        name,
        type,
        location,
        subscriptionId,
        resourceGroup,
        properties
    | union (
        securityresources
        | where type =~ 'microsoft.security/assessments'
        | where properties.status.severity =~ 'High' or properties.status.severity =~ 'Medium'
        | project
            id,
            name,
            type,
            location,
            subscriptionId,
            resourceGroup,
            properties
    )
    | project
        resourceId = id,
        resourceName = name,
        resourceType = type,
        resourceLocation = location,
        subscriptionId,
        resourceGroup,
        properties
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
    else:
        # Truncate resources if necessary
        payload["resources"] = rows[:max_resources]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
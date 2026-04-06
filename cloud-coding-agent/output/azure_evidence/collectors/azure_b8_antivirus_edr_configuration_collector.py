from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_b8_antivirus_edr_configuration"
EVIDENCE_TYPE = "EDR coverage + AV posture"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [("B8", "7.1")]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects EDR coverage and Antivirus posture for Azure resources.
    This collector focuses on identifying resources that have EDR solutions
    (like Microsoft Defender for Endpoint) enabled and checking their Antivirus status.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to find resources with Microsoft Defender for Endpoint enabled and AV status
    # This query looks for resources that are onboarded to Defender for Cloud and have
    # security solutions related to EDR and Antivirus configured.
    kql = """
    Resources
    | where type =~ 'microsoft.compute/virtualmachines' or type =~ 'microsoft.security/assessments'
    | where kind == 'linux' or kind == 'windows'
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.security/pricings'
        | where properties.offerta == 'defenderForServers' or properties.offerta == 'defenderForMachines'
        | project vmResourceId = tostring(properties.resourceId), defenderEnabled = properties.enabled
    ) on $left.id == vmResourceId
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.security/assessments'
        | where id contains 'AntivirusState'
        | project vmResourceId = tostring(properties.resourceDetails.id), antivirusStatus = properties.status.severity
    ) on $left.id == vmResourceId
    | project
        id,
        name,
        type,
        kind,
        defenderEnabled,
        antivirusStatus,
        location,
        resourceGroup,
        subscriptionId,
        tenantId
    | where isnotempty(defenderEnabled) or isnotempty(antivirusStatus)
    | project
        id,
        name,
        type,
        kind,
        defenderEnabled,
        antivirusStatus,
        location,
        resourceGroup,
        subscriptionId,
        tenantId
    """

    rows, err = query_object_array(credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": [],
        "resource_graph_error": err,
    }

    if err:
        for item_code, control_id in CONTROL_MAPPINGS:
            payload["error"] = f"Resource Graph query failed: {err}"
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    else:
        for row in rows:
            payload["resources"].append(row)

        for item_code, control_id in CONTROL_MAPPINGS:
            # Create a copy of the payload for each control mapping to ensure independence
            current_payload = payload.copy()
            current_payload["resources"] = payload["resources"][:MAX_RESOURCES_IN_PAYLOAD]
            results.append((current_payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_d2_patch_management_evidence"
EVIDENCE_TYPE = "Patch compliance evidence"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("D2", "2.2"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects patch compliance evidence for Azure resources.
    This collector queries Azure Resource Graph to identify resources that are
    managed by Azure Update Management or Azure Automation Update Management,
    and checks their patch compliance status.
    """
    results = []
    now = datetime.utcnow()

    kql_query = """
    Resources
    | where type =~ 'microsoft.compute/virtualmachines' or type =~ 'microsoft.automation/automationaccounts/runbooks'
    | where isnull(properties.osProfile.computerName) or isempty(properties.osProfile.computerName) // Filter out non-VM resources if needed, or adjust query for Automation accounts
    | project
        id,
        name,
        type,
        location,
        resourceGroup,
        subscriptionId,
        properties.osProfile.computerName,
        properties.provisioningState,
        properties.vmId,
        properties.hardwareProfile.vmSize,
        properties.storageProfile.osDisk.osType,
        properties.networkProfile.networkInterfaces[0].id
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.compute/virtualmachines/extensions'
        | where properties.type == 'Microsoft.GuestConfiguration/complianceStatus' or properties.type == 'Microsoft.GuestConfiguration/configurationAssignments'
        | project vmId = tostring(split(id, '/')[8]), complianceStatus = properties.complianceStatus, complianceState = properties.complianceState, configurationStatus = properties.configurationStatus
    ) on $left.vmId == $right.vmId
    | project
        id,
        name,
        type,
        location,
        resourceGroup,
        subscriptionId,
        computerName = properties_osProfile_computerName,
        provisioningState = properties_provisioningState,
        vmId,
        vmSize = properties_hardwareProfile_vmSize,
        osType = properties_storageProfile_osDisk_osType,
        networkInterfaceId = properties_networkProfile_networkInterfaces_0_id,
        complianceStatus,
        complianceState,
        configurationStatus
    | where isnotempty(computerName) // Ensure it's a VM
    | project
        id,
        name,
        type,
        location,
        resourceGroup,
        subscriptionId,
        computerName,
        vmSize,
        osType,
        complianceStatus,
        complianceState,
        configurationStatus,
        resourceGraphError = 'None' // Placeholder for potential future errors
    """

    rows, err = query_object_array(credential, subscription_id, kql_query, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": [],
        "resource_graph_error": str(err) if err else None,
    }

    if err:
        # If there's an error querying Resource Graph, add it to the payload
        payload["error"] = f"Azure Resource Graph query failed: {err}"
    elif rows:
        for row in rows:
            resource_payload = {
                "id": row.get("id"),
                "name": row.get("name"),
                "type": row.get("type"),
                "location": row.get("location"),
                "resourceGroup": row.get("resourceGroup"),
                "subscriptionId": row.get("subscriptionId"),
                "computerName": row.get("computerName"),
                "vmSize": row.get("vmSize"),
                "osType": row.get("osType"),
                "complianceStatus": row.get("complianceStatus"),
                "complianceState": row.get("complianceState"),
                "configurationStatus": row.get("configurationStatus"),
            }
            payload["resources"].append(resource_payload)
        # Truncate resources if they exceed the limit
        payload["resources"] = payload["resources"][:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
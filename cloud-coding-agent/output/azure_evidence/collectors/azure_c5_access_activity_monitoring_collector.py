from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_c5_access_activity_monitoring"
EVIDENCE_TYPE = "Access audit trail"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("C5", "5.1"),
]

MAX_RESOURCES_IN_PAYLOAD = 600

def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure access activity monitoring logs for C5 control 5.1.
    This collector queries Azure Resource Graph for audit logs related to resource access.
    """
    results = []
    now = datetime.utcnow()
    
    # KQL query to find audit logs related to resource access.
    # This is a general query and might need refinement based on specific access activities to monitor.
    # It looks for operations on resources that are typically considered "access" events.
    kql_query = """
    Resources
    | where type =~ 'microsoft.insights/auditlogs'
    | where properties.operationName startswith "Microsoft.Storage/storageAccounts/blobServices/containers/read" or
            properties.operationName startswith "Microsoft.Storage/storageAccounts/blobServices/containers/write" or
            properties.operationName startswith "Microsoft.Storage/storageAccounts/blobServices/containers/delete" or
            properties.operationName startswith "Microsoft.Compute/virtualMachines/read" or
            properties.operationName startswith "Microsoft.Compute/virtualMachines/write" or
            properties.operationName startswith "Microsoft.Network/publicIPAddresses/read" or
            properties.operationName startswith "Microsoft.Sql/servers/databases/read" or
            properties.operationName startswith "Microsoft.KeyVault/vaults/secrets/read" or
            properties.operationName startswith "Microsoft.KeyVault/vaults/keys/read"
    | project
        operationName = properties.operationName,
        resourceId = id,
        callerIpAddress = properties.callerIpAddress,
        identity = properties.identity,
        timestamp = properties.timestamp,
        result = properties.result
    | order by timestamp desc
    """

    rows, err = query_object_array(credential, subscription_id, kql_query, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": rows[:MAX_RESOURCES_IN_PAYLOAD] if rows else [],
        "resource_graph_error": str(err) if err else None,
    }

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
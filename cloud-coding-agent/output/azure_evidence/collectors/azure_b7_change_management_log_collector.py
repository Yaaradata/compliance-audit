from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_b7_change_management_log"
EVIDENCE_TYPE = "Change audit trail configuration"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [("B7", "6.4")]
MAX_RESOURCES_IN_PAYLOAD = 600

def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure activity log configurations to assess change management audit trails.
    This collector focuses on identifying if audit logging is enabled for key resource types
    and operations that represent significant changes within the subscription.
    """
    results = []
    now = datetime.utcnow()
    
    # KQL query to find resources with diagnostic settings configured, focusing on activity logs
    # This query looks for resources that have diagnostic settings enabled, and specifically
    # checks if the 'Microsoft.Insights/diagnosticSettings' resource type is being logged.
    # It aims to identify resources where audit trails are being captured.
    kql = """
    Resources
    | where type =~ 'microsoft.insights/diagnosticSettings'
    | extend resourceId = tostring(properties.logs[0].category) // Attempt to get a relevant log category, though this might need refinement
    | project name, id, type, properties, resourceGroup, location, subscriptionId, tenantId, resourceId
    | where isnotempty(resourceId) // Ensure we have some log information
    """

    rows, err = query_object_array(credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": len(rows) if rows else 0,
        "resources": [],
        "resource_graph_error": str(err) if err else None,
    }

    if err:
        payload["error"] = f"Azure Resource Graph query failed: {err}"
    else:
        # Process rows to create a more digestible payload
        for row in rows:
            resource_info = {
                "name": row.get("name"),
                "id": row.get("id"),
                "type": row.get("type"),
                "resourceGroup": row.get("resourceGroup"),
                "location": row.get("location"),
                "subscriptionId": row.get("subscriptionId"),
                "tenantId": row.get("tenantId"),
                "log_category": row.get("resourceId"), # Using the extracted category as log_category
                "properties": row.get("properties") # Include full properties for detailed inspection
            }
            payload["resources"].append(resource_info)
        
        # Truncate if necessary
        payload["resources"] = payload["resources"][:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
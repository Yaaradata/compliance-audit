from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_f1_vendor_third_party_inventory"
EVIDENCE_TYPE = "Third-party access inventory"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [("F1", "2.8")]

MAX_RESOURCES_IN_PAYLOAD = 600

def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects information about third-party access inventory in Azure.
    This collector aims to identify resources that might be accessed by third-party vendors,
    such as those with public endpoints or specific configurations that imply external access.
    """
    results = []
    now = datetime.utcnow()
    
    # KQL query to find resources that might be exposed to third parties.
    # This is a simplified example and might need refinement based on specific security requirements.
    # It looks for resources with public IP configurations or specific service types that are commonly integrated with third parties.
    kql = """
    Resources
    | where type =~ 'microsoft.network/publicipaddresses' or type =~ 'microsoft.web/sites' or type =~ 'microsoft.storage/storageaccounts'
    | project name, type, location, id, properties
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
        # If there's an error querying Resource Graph, record it in the payload.
        payload["error"] = f"Resource Graph query failed: {err}"
    elif rows:
        # Truncate the list of resources if it exceeds the maximum allowed.
        payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
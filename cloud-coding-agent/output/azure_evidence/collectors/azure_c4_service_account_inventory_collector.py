from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_c4_service_account_inventory"
EVIDENCE_TYPE = "Service account inventory + credential age"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("C4", "5.1"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects information about Azure service accounts and their credential age.
    This collector aims to cover controls related to service account inventory and credential management.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to find service principals (which often act as service accounts)
    # and their credential expiration dates if available.
    # This query focuses on Key Vault secrets and Managed Identities, common places for credentials.
    kql = """
    Resources
    | where type =~ 'microsoft.managedidentity/userassignedidentities' or type =~ 'microsoft.keyvault/vaults/secrets'
    | project
        name,
        type,
        id,
        properties,
        subscriptionId,
        resourceGroup,
        location,
        tags
    | extend
        credential_expiration = case(
            type =~ 'microsoft.keyvault/vaults/secrets', properties.attributes.expires,
            type =~ 'microsoft.managedidentity/userassignedidentities', properties.createdTime, // Managed identities don't have explicit expiration, using creation time as a proxy for age
            '')
    | where isnotempty(credential_expiration)
    | project
        name,
        type,
        id,
        resourceGroup,
        location,
        subscriptionId,
        credential_expiration,
        tags
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
        # If there's an error querying Resource Graph, add it to the payload
        payload["error"] = f"Azure Resource Graph query failed: {err}"
    elif rows:
        # Process and truncate the list of resources
        processed_resources = []
        for row in rows:
            processed_row = {
                "name": row.get("name"),
                "type": row.get("type"),
                "id": row.get("id"),
                "resource_group": row.get("resourceGroup"),
                "location": row.get("location"),
                "subscription_id": row.get("subscriptionId"),
                "credential_expiration": row.get("credential_expiration"),
                "tags": row.get("tags"),
            }
            processed_resources.append(processed_row)
        payload["resources"] = processed_resources[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
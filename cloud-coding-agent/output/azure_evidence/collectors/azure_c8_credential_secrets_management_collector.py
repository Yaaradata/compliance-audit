from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_c8_credential_secrets_management"
EVIDENCE_TYPE = "Secrets posture + KV config"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("C8", "5.4"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects information about Azure Key Vault secrets and their configurations
    to assess secrets posture and compliance.
    """
    results = []
    now = datetime.utcnow()

    # KQL query to find Key Vaults and their secrets
    # This query retrieves Key Vaults, their properties, and a count of secrets within them.
    # It also checks for specific configurations like soft delete and purge protection.
    kql_keyvaults = """
    Resources
    | where type =~ 'microsoft.keyvault/vaults'
    | project
        id,
        name,
        location,
        resourceGroup,
        subscriptionId,
        properties = bag_unpack(properties),
        sku = properties.sku.name,
        softDeleteEnabled = properties.enableSoftDelete,
        purgeProtectionEnabled = properties.enablePurgeProtection,
        accessPolicies = properties.accessPolicies
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.keyvault/vaults/secrets'
        | summarize secretCount = count() by vaultId = tostring(split(id, '/secrets')[0])
    ) on $left.id == $right.vaultId
    | project
        id,
        name,
        location,
        resourceGroup,
        subscriptionId,
        sku,
        softDeleteEnabled,
        purgeProtectionEnabled,
        secretCount = iff(isnull(secretCount), 0, secretCount),
        accessPolicies
    """

    rows, err = query_object_array(
        credential, subscription_id, kql_keyvaults, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )

    payload_secrets_posture = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "key_vaults": [],
        "row_count": len(rows) if rows else 0,
        "resource_graph_error": str(err) if err else None,
    }

    if err:
        payload_secrets_posture["error"] = f"Resource Graph query failed: {err}"
    elif rows:
        for row in rows:
            # Truncate access policies if they are too large
            if row.get("accessPolicies") and len(row["accessPolicies"]) > MAX_RESOURCES_IN_PAYLOAD:
                row["accessPolicies"] = row["accessPolicies"][:MAX_RESOURCES_IN_PAYLOAD]
                payload_secrets_posture["access_policies_truncated"] = True

            payload_secrets_posture["key_vaults"].append(row)

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append(
            (
                payload_secrets_posture,
                item_code,
                control_id,
                EVIDENCE_TYPE,
                SOURCE_SYSTEM,
            )
        )

    return results
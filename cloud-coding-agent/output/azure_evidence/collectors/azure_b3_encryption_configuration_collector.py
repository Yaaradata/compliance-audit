from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_b3_encryption_configuration"
EVIDENCE_TYPE = "Encryption posture snapshot"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("B3", "2.5A"),
    ("B3", "2.6"),
]
MAX_RESOURCES_IN_PAYLOAD = 600

def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects encryption configuration for Azure resources, focusing on storage accounts,
    key vaults, and databases to assess encryption posture.
    """
    results = []
    now = datetime.utcnow()
    
    # KQL to query for storage accounts with encryption settings
    storage_kql = """
    resources
    | where type =~ 'microsoft.storage/storageaccounts'
    | project
        id,
        name,
        location,
        kind,
        properties.encryption.services.blob.enabled,
        properties.encryption.services.file.enabled,
        properties.encryption.services.queue.enabled,
        properties.encryption.services.table.enabled,
        properties.encryption.keySource,
        properties.encryption.requireInfrastructureEncryption
    """

    # KQL to query for Key Vaults with encryption settings
    keyvault_kql = """
    resources
    | where type =~ 'microsoft.keyvault/vaults'
    | project
        id,
        name,
        location,
        properties.enableSoftDelete,
        properties.enablePurgeProtection,
        properties.sku.name,
        properties.accessPolicies,
        properties.networkAcls.bypass,
        properties.networkAcls.defaultAction,
        properties.privateEndpointConnections
    """

    # KQL to query for SQL Databases with encryption settings
    sql_db_kql = """
    resources
    | where type =~ 'microsoft.sql/servers/databases'
    | project
        id,
        name,
        location,
        properties.sku.name,
        properties.enablePublicNetworkAccess,
        properties.storageEncryptionEnabled,
        properties.zoneRedundant
    """

    # KQL to query for Cosmos DB accounts with encryption settings
    cosmos_db_kql = """
    resources
    | where type =~ 'microsoft.documentdb/databaseaccounts'
    | project
        id,
        name,
        location,
        kind,
        properties.enableAutomaticFailover,
        properties.consistencyPolicy.defaultConsistencyLevel,
        properties.capabilities,
        properties.networkAclBypass,
        properties.publicNetworkAccess,
        properties.keyVaultKeyUri,
        properties.disableKeyBasedMetadataWriteAccess
    """

    all_resources = []
    errors = []

    # Collect Storage Account Encryption
    storage_rows, storage_err = query_object_array(credential, subscription_id, storage_kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)
    if storage_err:
        errors.append(f"Storage Account query error: {storage_err}")
    else:
        all_resources.extend(storage_rows)

    # Collect Key Vault Encryption
    keyvault_rows, keyvault_err = query_object_array(credential, subscription_id, keyvault_kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)
    if keyvault_err:
        errors.append(f"Key Vault query error: {keyvault_err}")
    else:
        all_resources.extend(keyvault_rows)

    # Collect SQL Database Encryption
    sql_db_rows, sql_db_err = query_object_array(credential, subscription_id, sql_db_kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)
    if sql_db_err:
        errors.append(f"SQL Database query error: {sql_db_err}")
    else:
        all_resources.extend(sql_db_rows)

    # Collect Cosmos DB Encryption
    cosmos_db_rows, cosmos_db_err = query_object_array(credential, subscription_id, cosmos_db_kql, max_rows=MAX_RESOURCES_IN_PAYLOAD)
    if cosmos_db_err:
        errors.append(f"Cosmos DB query error: {cosmos_db_err}")
    else:
        all_resources.extend(cosmos_db_rows)

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "resources": all_resources[:MAX_RESOURCES_IN_PAYLOAD],
        "row_count": len(all_resources),
        "resource_graph_errors": errors,
    }

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
"""A2 — SWIFT-relevant compute, data, app, and common platform resources (inventory + tags)."""
from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array, query_resources_sample
from app.azure_evidence.collectors.control_mappings import swift_control_pairs
from app.azure_evidence.collectors.inventory_llm_shape import vm_inventory_rows_for_llm

COLLECTOR_NAME = "azure_component_inventory"
EVIDENCE_TYPE = "Asset inventory + tag compliance"
SOURCE_SYSTEM = COLLECTOR_NAME
CONTROL_MAPPINGS = swift_control_pairs("A2")

_KQL = """
Resources
| where type in~ (
    'microsoft.compute/virtualmachines',
    'microsoft.compute/virtualmachinescalesets',
    'microsoft.compute/disks',
    'microsoft.sql/servers',
    'microsoft.sql/servers/databases',
    'microsoft.sql/managedinstances',
    'microsoft.dbforpostgresql/flexibleservers',
    'microsoft.dbformysql/flexibleservers',
    'microsoft.documentdb/databaseaccounts',
    'microsoft.cache/redis',
    'microsoft.storage/storageaccounts',
    'microsoft.keyvault/vaults',
    'microsoft.network/applicationgateways',
    'microsoft.network/loadbalancers',
    'microsoft.network/virtualnetworks',
    'microsoft.containerservice/managedclusters',
    'microsoft.app/containerapps',
    'microsoft.web/sites',
    'microsoft.web/serverfarms',
    'microsoft.servicefabric/clusters',
    'microsoft.apimanagement/service',
    'microsoft.logic/workflows',
    'microsoft.datafactory/datafactories',
    'microsoft.machinelearningservices/workspaces',
    'microsoft.desktopvirtualization/hostpools',
    'microsoft.operationalinsights/workspaces',
    'microsoft.insights/components'
)
| project id, name, type, resourceGroup, location, tags, properties
| take 500
"""


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    rows, err = query_object_array(credential, subscription_id, _KQL, max_rows=1500)
    fallback_note = None
    if not rows and not err:
        sample_rows, sample_err = query_resources_sample(credential, subscription_id, max_rows=120)
        if sample_rows:
            rows = sample_rows
            fallback_note = "Collector-specific query returned 0 rows; attached subscription-wide resource sample for diagnostics."
        elif sample_err:
            fallback_note = f"Collector query returned 0 rows and fallback sample failed: {sample_err}"
    instances = vm_inventory_rows_for_llm(rows)
    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "resource_graph_error": err,
        "row_count": len(rows),
        "resources": rows,
        "instances": instances,
        "instance_count": len(instances),
        "fallback_note": fallback_note,
    }
    if err and not rows:
        payload["error"] = err
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results

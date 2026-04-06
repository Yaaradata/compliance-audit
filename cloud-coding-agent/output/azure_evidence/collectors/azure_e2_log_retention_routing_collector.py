from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_e2_log_retention_routing"
EVIDENCE_TYPE = "Log routing + retention configuration"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("E2", "6.4"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure log analytics workspace routing and retention configuration.
    Covers E2 (Log routing + retention configuration) and control 6.4.
    """
    results = []
    now = datetime.utcnow()

    # KQL to find Log Analytics Workspaces and their diagnostic settings
    # This query aims to capture the routing of logs to other destinations
    # and implicitly the retention settings configured within the workspace itself.
    kql = """
    Resources
    | where type =~ 'microsoft.operationalinsights/workspaces'
    | project id, name, location, sku, workspaceId = tostring(properties.customerId)
    | join kind=leftouter (
        Resources
        | where type =~ 'microsoft.insights/diagnosticsettings'
        | project workspaceId = split(id, '/')[8],
          logAnalyticsDestination = case(
              isnotempty(properties.workspaceId), properties.workspaceId,
              isnotempty(properties.storageAccountId), properties.storageAccountId,
              isnotempty(properties.eventHubNamespaceId), properties.eventHubNamespaceId,
              'None'
          ),
          retentionInDays = properties.retentionPolicy.retentionDays,
          enabled = properties.retentionPolicy.enabled,
          logs = properties.logs,
          metrics = properties.metrics,
          azureMonitorMetrics = properties.azureMonitorMetrics
    ) on workspaceId
    | project
        workspaceId = id,
        workspaceName = name,
        workspaceLocation = location,
        workspaceSku = sku,
        logAnalyticsDestination,
        retentionInDays,
        retentionEnabled = enabled,
        logsConfig = logs,
        metricsConfig = metrics,
        azureMonitorMetricsConfig = azureMonitorMetrics
    """

    rows, err = query_object_array(
        credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )

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
            error_payload = payload.copy()
            error_payload["error"] = f"Azure Resource Graph query failed: {err}"
            results.append((error_payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    else:
        for row in rows:
            payload["resources"].append(row)

        # Truncate if necessary
        payload["resources"] = payload["resources"][:MAX_RESOURCES_IN_PAYLOAD]

        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
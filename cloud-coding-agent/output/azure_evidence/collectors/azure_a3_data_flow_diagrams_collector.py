from datetime import datetime
from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_a3_data_flow_diagrams"
EVIDENCE_TYPE = "Network flow data + log routing"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("A3", "2.1"),
    ("A3", "2.4"),
]

MAX_RESOURCES_IN_PAYLOAD = 600

def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure network flow logs and log routing configurations.
    Covers A3 controls related to network flow data and log routing.
    """
    results = []
    now = datetime.utcnow()

    # KQL to find Network Watcher flow logs and Log Analytics workspaces for routing
    kql_flow_logs = """
    resources
    | where type =~ 'microsoft.network/networkwatchers/flowlogs'
    | project id, name, location, properties
    """

    kql_log_analytics = """
    resources
    | where type =~ 'microsoft.operationalinsights/workspaces'
    | project id, name, location, properties
    """

    payload_flow_logs = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": 0,
        "resources": [],
        "resource_graph_error": None,
    }
    rows_flow_logs, err_flow_logs = query_object_array(
        credential, subscription_id, kql_flow_logs, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )
    if err_flow_logs:
        payload_flow_logs["error"] = str(err_flow_logs)
        payload_flow_logs["resource_graph_error"] = str(err_flow_logs)
    else:
        payload_flow_logs["row_count"] = len(rows_flow_logs)
        payload_flow_logs["resources"] = rows_flow_logs[:MAX_RESOURCES_IN_PAYLOAD]

    payload_log_analytics = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "row_count": 0,
        "resources": [],
        "resource_graph_error": None,
    }
    rows_log_analytics, err_log_analytics = query_object_array(
        credential, subscription_id, kql_log_analytics, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )
    if err_log_analytics:
        payload_log_analytics["error"] = str(err_log_analytics)
        payload_log_analytics["resource_graph_error"] = str(err_log_analytics)
    else:
        payload_log_analytics["row_count"] = len(rows_log_analytics)
        payload_log_analytics["resources"] = rows_log_analytics[:MAX_RESOURCES_IN_PAYLOAD]

    # Combine flow logs and log analytics into a single payload for simplicity,
    # or create separate payloads if distinct collection is needed.
    # For this example, we'll create a combined payload.
    combined_payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": now.isoformat(),
        "network_flow_logs": payload_flow_logs["resources"],
        "network_flow_logs_count": payload_flow_logs["row_count"],
        "log_analytics_workspaces": payload_log_analytics["resources"],
        "log_analytics_workspaces_count": payload_log_analytics["row_count"],
        "resource_graph_error": payload_flow_logs["resource_graph_error"] or payload_log_analytics["resource_graph_error"],
    }

    if payload_flow_logs.get("error") or payload_log_analytics.get("error"):
        combined_payload["error"] = (
            payload_flow_logs.get("error", "") + " " + payload_log_analytics.get("error", "")
        ).strip()

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((combined_payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
from __future__ import annotations

from datetime import datetime

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_e3_monitoring_alert_rules"
EVIDENCE_TYPE = "Alert rule coverage"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("E3", "6.4"),
    ("E3", "7.1"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure alert rules for E3 controls 6.4 and 7.1.
    This collector queries Azure Resource Graph to find all alert rules
    within a given subscription.
    """
    results = []
    now = datetime.utcnow()
    collected_at = now.isoformat()

    kql = """
    AlertRules
    | where isnotnull(properties.condition)
    | project
        name,
        id,
        type,
        location,
        properties = properties,
        tags = tags
    """

    rows, err = query_object_array(
        credential, subscription_id, kql, max_rows=MAX_RESOURCES_IN_PAYLOAD
    )

    payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": collected_at,
        "row_count": len(rows) if rows else 0,
        "resources": [],
        "resource_graph_error": err,
    }

    if err:
        # If there's an error querying Resource Graph, we still append the payload
        # with the error message, but no resources will be collected.
        pass
    elif rows:
        # Truncate the list of resources if it exceeds the maximum allowed.
        payload["resources"] = rows[:MAX_RESOURCES_IN_PAYLOAD]

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))

    return results
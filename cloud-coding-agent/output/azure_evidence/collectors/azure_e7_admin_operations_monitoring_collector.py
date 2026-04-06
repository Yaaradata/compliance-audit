'''
Azure E7 Admin Operations Monitoring collector.
Covers audit trails and alerting configurations for administrative operations.
'''
from __future__ import annotations

from datetime import datetime
from typing import Any

from app.azure_evidence.platform.resource_graph import query_object_array

COLLECTOR_NAME = "azure_e7_admin_operations_monitoring"
EVIDENCE_TYPE = "Admin audit trail + alerting"
SOURCE_SYSTEM = "azure-resource-graph"
CONTROL_MAPPINGS = [
    ("E7", "6.4"),
]

MAX_RESOURCES_IN_PAYLOAD = 600


def collect(subscription_id: str, credential: Any) -> list[tuple[dict, str, str, str, str]]:
    """
    Collects Azure administrative operations monitoring data.

    This collector queries Azure Resource Graph for audit logs and alert rules
    related to administrative operations within the specified subscription.
    """
    results = []
    now = datetime.utcnow()
    collected_at_iso = now.isoformat()

    # KQL for Azure Activity Logs (audit trails)
    # This query retrieves recent administrative operations.
    activity_log_kql = """
    Resources
    | where type =~ 'microsoft.insights/eventtypes/versions/providers/microsoft.aadiam/operations'
    | project
        name,
        id,
        kind,
        location,
        properties,
        resourceGroup,
        subscriptionId,
        tenantId,
        type,
        tags,
        systemData
    | order by properties.eventTimestamp desc
    | limit 1000
    """

    # KQL for Azure Monitor Alert Rules
    # This query retrieves alert rules that might be relevant to administrative operations.
    # A more specific query might be needed depending on exact definitions of "administrative operations".
    alert_rules_kql = """
    Resources
    | where type =~ 'microsoft.insights/alertrules'
    | project
        name,
        id,
        kind,
        location,
        properties,
        resourceGroup,
        subscriptionId,
        tenantId,
        type,
        tags,
        systemData
    | order by properties.lastUpdatedTime desc
    | limit 1000
    """

    # Collect Activity Logs
    activity_log_payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": collected_at_iso,
        "activity_logs": [],
        "row_count": 0,
        "resource_graph_error": None,
    }
    try:
        rows, err = query_object_array(
            credential, subscription_id, activity_log_kql, max_rows=MAX_RESOURCES_IN_PAYLOAD
        )
        if err:
            activity_log_payload["resource_graph_error"] = str(err)
        else:
            activity_log_payload["activity_logs"] = rows
            activity_log_payload["row_count"] = len(rows)
    except Exception as e:
        activity_log_payload["resource_graph_error"] = f"Error querying activity logs: {str(e)}"

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append(
            (
                activity_log_payload,
                item_code,
                control_id,
                EVIDENCE_TYPE,
                SOURCE_SYSTEM,
            )
        )

    # Collect Alert Rules
    alert_rules_payload = {
        "collector": COLLECTOR_NAME,
        "subscription_id": subscription_id,
        "collected_at": collected_at_iso,
        "alert_rules": [],
        "row_count": 0,
        "resource_graph_error": None,
    }
    try:
        rows, err = query_object_array(
            credential, subscription_id, alert_rules_kql, max_rows=MAX_RESOURCES_IN_PAYLOAD
        )
        if err:
            alert_rules_payload["resource_graph_error"] = str(err)
        else:
            alert_rules_payload["alert_rules"] = rows
            alert_rules_payload["row_count"] = len(rows)
    except Exception as e:
        alert_rules_payload["resource_graph_error"] = f"Error querying alert rules: {str(e)}"

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append(
            (
                alert_rules_payload,
                item_code,
                control_id,
                EVIDENCE_TYPE,
                SOURCE_SYSTEM,
            )
        )

    return results
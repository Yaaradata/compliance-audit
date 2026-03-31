"""E3 — Cloud Monitoring alert policies (definitions, not time series)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.monitoring_v3 import AlertPolicyServiceClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "monitoring_alerts"
EVIDENCE_TYPE = "Alert configuration"
SOURCE_SYSTEM = "gcp-monitoring"
CONTROL_MAPPINGS = swift_control_pairs("E3")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    parent = f"projects/{project_id}"
    try:
        client = AlertPolicyServiceClient()
        policies: list[dict] = []
        for p in client.list_alert_policies(name=parent):
            policies.append(
                {
                    "display_name": p.display_name or None,
                    "enabled": p.enabled.value if p.enabled else None,
                    "combiner": str(p.combiner) if p.combiner else None,
                    "notification_channels_count": len(p.notification_channels) if p.notification_channels else 0,
                    "conditions_count": len(p.conditions) if p.conditions else 0,
                }
            )
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "alert_policies": policies[:150]}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except gcp_exceptions.PermissionDenied as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": f"Permission denied: {e.message}"}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": str(e)}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results

"""B7, E7 — Sample Admin Activity audit log entries (Cloud Audit log bucket, capped)."""
from __future__ import annotations

from datetime import datetime, timedelta

from google.api_core import exceptions as gcp_exceptions
from google.cloud.logging_v2 import Client as LoggingClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "audit_activity_sample"
SOURCE_SYSTEM = "gcp-logging"
CONTROL_MAPPINGS = swift_control_pairs("B7", "E7")


def _evidence_type(item_code: str) -> str:
    if item_code == "E7":
        return "Admin audit trail"
    return "Change audit trail"


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    try:
        lg = LoggingClient(project=project_id)
        # Recent admin activity (reduced scope to avoid heavy scans)
        ts_floor = (now - timedelta(days=1)).strftime("%Y-%m-%dT00:00:00Z")
        filt = (
            f'logName="projects/{project_id}/logs/cloudaudit.googleapis.com%2Factivity" '
            f'AND timestamp>="{ts_floor}"'
        )
        rows: list[dict] = []
        for e in lg.list_entries(filter_=filt, page_size=50, max_results=80):
            rows.append(
                {
                    "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                    "severity": e.severity,
                    "log_name": e.log_name,
                    "insert_id": e.insert_id,
                }
            )
            if len(rows) >= 80:
                break
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "sample_window": "last 24h from midnight UTC",
            "admin_activity_sample_count": len(rows),
            "entries": rows,
            "note": "Full change history requires log Analytics / BQ export; this is a capped API sample for evidence.",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except gcp_exceptions.PermissionDenied as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": f"Permission denied: {e.message}",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except Exception as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": str(e),
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    return results

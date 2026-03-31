"""B8 — Disk snapshots, snapshot schedules (resource policies), Cloud SQL backup flags."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.auth import default
from google.cloud.compute_v1 import ResourcePoliciesClient, SnapshotsClient
from googleapiclient.discovery import build

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "backup_snapshot"
EVIDENCE_TYPE = "Backup posture"
SOURCE_SYSTEM = "gcp-backup"
CONTROL_MAPPINGS = swift_control_pairs("B8")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    creds, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    try:
        snapshots = [
            {
                "name": s.name,
                "status": s.status or None,
                "disk_size_gb": int(s.disk_size_gb) if s.disk_size_gb else None,
                "storage_locations": list(s.storage_locations or [])[:4],
            }
            for s in SnapshotsClient().list(project=project_id)
        ][:400]
        sched_policies: list[dict] = []
        for _, scoped in ResourcePoliciesClient().aggregated_list(project=project_id):
            if scoped and scoped.resource_policies:
                for rp in scoped.resource_policies:
                    if "snapshot" in (rp.name or "").lower() or rp.snapshot_schedule_policy:
                        sched_policies.append(
                            {
                                "name": rp.name,
                                "region": rp.region.split("/")[-1] if rp.region else None,
                                "has_snapshot_schedule": bool(rp.snapshot_schedule_policy),
                            }
                        )
        sql_backup: list[dict] = []
        sql = build("sqladmin", "v1", credentials=creds, cache_discovery=False)
        req = sql.instances().list(project=project_id)
        while req is not None:
            resp = req.execute()
            for it in resp.get("items") or []:
                bc = (it.get("settings") or {}).get("backupConfiguration") or {}
                sql_backup.append(
                    {
                        "instance": it.get("name"),
                        "backup_enabled": bool(bc.get("enabled")),
                        "start_time": bc.get("startTime"),
                        "transaction_log_backup_enabled": bool(bc.get("transactionLogRetentionSettings")),
                    }
                )
            req = sql.instances().list_next(previous_request=req, previous_response=resp)
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "snapshots": snapshots,
            "snapshot_schedule_policies": sched_policies[:100],
            "cloud_sql_backup": sql_backup[:50],
        }
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

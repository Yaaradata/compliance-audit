"""A2, E5 — Compute instances, forwarding rules, Cloud Run, Cloud SQL inventory (workbook Phase 1)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.auth import default
from google.cloud.compute_v1 import ForwardingRulesClient, InstancesClient
from googleapiclient.discovery import build

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "swift_component_inventory"
SOURCE_SYSTEM = "gcp-inventory"
CONTROL_MAPPINGS = swift_control_pairs("A2", "E5")


def _evidence_type(item_code: str) -> str:
    if item_code == "E5":
        return "Database security"
    return "Asset inventory"


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    creds, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    try:
        instances: list[dict] = []
        for zone, scoped in InstancesClient().aggregated_list(project=project_id):
            if not scoped or not scoped.instances:
                continue
            z = zone.split("/")[-1] if "/" in zone else zone
            for inst in scoped.instances:
                labels = dict(inst.labels) if inst.labels else {}
                instances.append(
                    {
                        "name": inst.name,
                        "zone": z,
                        "status": inst.status,
                        "machine_type": inst.machine_type.split("/")[-1] if inst.machine_type else None,
                        "labels": labels,
                    }
                )
        forwarding_rules: list[dict] = []
        for _, scoped in ForwardingRulesClient().aggregated_list(project=project_id):
            if scoped and scoped.forwarding_rules:
                for fr in scoped.forwarding_rules:
                    forwarding_rules.append(
                        {
                            "name": fr.name,
                            "region": fr.region.split("/")[-1] if fr.region else None,
                            "load_balancing_scheme": fr.load_balancing_scheme or None,
                            "ip_address": fr.ip_address or None,
                        }
                    )
        sql_instances: list[dict] = []
        sql = build("sqladmin", "v1", credentials=creds, cache_discovery=False)
        req = sql.instances().list(project=project_id)
        while req is not None:
            resp = req.execute()
            for it in resp.get("items") or []:
                settings = it.get("settings") or {}
                sql_instances.append(
                    {
                        "name": it.get("name"),
                        "databaseVersion": it.get("databaseVersion"),
                        "region": it.get("region"),
                        "state": it.get("state"),
                        "backendType": it.get("backendType"),
                        "ipAddresses": [{"type": x.get("type"), "ipAddress": x.get("ipAddress")} for x in (it.get("ipAddresses") or [])][:8],
                        "deletionProtectionEnabled": bool(settings.get("deletionProtectionEnabled")),
                        "backupEnabled": bool((settings.get("backupConfiguration") or {}).get("enabled")),
                    }
                )
            req = sql.instances().list_next(previous_request=req, previous_response=resp)
        run_services: list[dict] = []
        try:
            from google.cloud.run_v2 import ServicesClient

            parent = f"projects/{project_id}/locations/-"
            for svc in ServicesClient().list_services(parent=parent):
                run_services.append(
                    {
                        "name": svc.name.split("/")[-1] if svc.name else None,
                        "location": svc.name.split("/")[3] if svc.name and "/" in svc.name else None,
                        "ingress": str(svc.ingress) if svc.ingress else None,
                        "last_modifier": svc.last_modifier or None,
                    }
                )
        except Exception as run_exc:
            run_services = [{"error": f"Cloud Run list skipped: {run_exc}"}]
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "instances": instances[:500],
            "instance_count": len(instances),
            "forwarding_rules": forwarding_rules[:300],
            "cloud_sql_instances": sql_instances[:100],
            "cloud_run_services": run_services[:200],
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except gcp_exceptions.PermissionDenied as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": f"Permission denied: {e.message}"}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": str(e)}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    return results

"""E2 — Log sinks, log buckets (retention), subnet flow log flags."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.compute_v1 import SubnetworksClient
from google.cloud.logging_v2.services.config_service_v2 import ConfigServiceV2Client

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "logging_posture"
EVIDENCE_TYPE = "Logging configuration"
SOURCE_SYSTEM = "gcp-logging"
CONTROL_MAPPINGS = swift_control_pairs("E2")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    parent = f"projects/{project_id}"
    try:
        cfg = ConfigServiceV2Client()
        sinks = []
        for s in cfg.list_sinks(parent=parent):
            sinks.append({"name": s.name.split("/")[-1] if s.name else None, "destination": s.destination or None, "filter": (s.filter_ or "")[:1200]})
        buckets = []
        for b in cfg.list_buckets(parent=parent):
            buckets.append(
                {
                    "name": b.name.split("/")[-1] if b.name else None,
                    "retention_days": int(b.retention_days) if b.retention_days else None,
                    "locked": bool(getattr(b, "locked", False)),
                }
            )
        flow_subnets = []
        for _, scoped in SubnetworksClient().aggregated_list(project=project_id):
            if scoped and scoped.subnetworks:
                for s in scoped.subnetworks:
                    lc = s.log_config
                    flow_subnets.append(
                        {
                            "name": s.name,
                            "region": s.region.split("/")[-1] if s.region else None,
                            "flow_logs_enabled": bool(lc and getattr(lc, "enable", False)),
                        }
                    )
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "log_sinks": sinks[:80],
            "log_buckets": buckets[:40],
            "subnetwork_flow_log_flags": flow_subnets[:300],
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

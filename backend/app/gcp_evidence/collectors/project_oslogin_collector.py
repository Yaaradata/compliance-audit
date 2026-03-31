"""B4 — Project OS Login / OS Login 2-step metadata (compute project common metadata)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.compute_v1 import ProjectsClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "project_oslogin"
EVIDENCE_TYPE = "Authentication config"
SOURCE_SYSTEM = "gcp-compute"
CONTROL_MAPPINGS = swift_control_pairs("B4")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    try:
        proj = ProjectsClient().get(project=project_id)
        meta = proj.common_instance_metadata
        items: dict[str, str] = {}
        if meta and meta.items:
            for it in meta.items:
                if it.key:
                    items[it.key] = (it.value or "")[:4000]
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "common_instance_metadata_keys_sample": list(items.keys())[:80],
            "enable_oslogin": items.get("enable-oslogin"),
            "enable_oslogin_2fa": items.get("enable-oslogin-2fa"),
            "note": "Workspace MFA / Cloud Identity 2SV is org-level (Admin SDK); project metadata captures OS Login 2FA posture for VMs.",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except gcp_exceptions.PermissionDenied as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": f"Permission denied: {e.message}",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": str(e),
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results

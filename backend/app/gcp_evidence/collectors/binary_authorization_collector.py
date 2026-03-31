"""E4 — Binary Authorization policy (software integrity / deploy-time controls)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.binaryauthorization_v1 import BinauthzManagementServiceV1Client

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "binary_authorization"
EVIDENCE_TYPE = "Software inventory"
SOURCE_SYSTEM = "gcp-binaryauthorization"
CONTROL_MAPPINGS = swift_control_pairs("E4")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    name = f"projects/{project_id}/policy"
    try:
        client = BinauthzManagementServiceV1Client()
        pol = client.get_policy(name=name)
        raw = pol.to_dict() if hasattr(pol, "to_dict") else {}
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "policy_found": True,
            "policy_summary": {k: raw[k] for k in list(raw.keys())[:25]} if isinstance(raw, dict) else str(raw)[:4000],
            "note": "Container deploy-time integrity; expand policy_summary for full admission rules.",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except gcp_exceptions.NotFound:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "note": "No Binary Authorization policy resource (API not used or feature not configured).",
            "policy_found": False,
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

"""C2, C3 — Project IAM policy bindings (privileged & general access evidence)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.resourcemanager_v3 import ProjectsClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "project_iam_policy"
SOURCE_SYSTEM = "gcp-iam"
CONTROL_MAPPINGS = swift_control_pairs("C2", "C3")


def _evidence_type(item_code: str) -> str:
    return "Privileged account list" if item_code == "C2" else "User access matrix"


def _bindings_summary(policy) -> list[dict]:
    out: list[dict] = []
    for b in policy.bindings or []:
        members = list(b.members or [])
        out.append(
            {
                "role": b.role,
                "member_count": len(members),
                "members_sample": members[:40],
                "truncated": len(members) > 40,
            }
        )
    return out


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    resource = f"projects/{project_id}"
    try:
        client = ProjectsClient()
        policy = client.get_iam_policy(request={"resource": resource})
        etag_s = None
        if policy.etag:
            etag_s = policy.etag.hex() if isinstance(policy.etag, (bytes, bytearray)) else str(policy.etag)
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "etag": etag_s,
            "bindings": _bindings_summary(policy),
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

"""C4 — Custom IAM roles at project scope."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.auth import default
from googleapiclient.discovery import build

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "rbac_roles"
EVIDENCE_TYPE = "RBAC structure"
SOURCE_SYSTEM = "gcp-iam"
CONTROL_MAPPINGS = swift_control_pairs("C4")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    creds, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    try:
        iam = build("iam", "v1", credentials=creds, cache_discovery=False)
        parent = f"projects/{project_id}"
        custom_roles: list[dict] = []
        req = iam.roles().list(parent=parent)
        while req is not None:
            resp = req.execute()
            for r in resp.get("roles") or []:
                custom_roles.append(
                    {
                        "name": r.get("name"),
                        "title": r.get("title"),
                        "deleted": r.get("deleted"),
                        "permission_count": len(r.get("includedPermissions") or []),
                        "permissions_sample": [p.get("name") for p in (r.get("includedPermissions") or [])[:30]],
                    }
                )
            req = iam.roles().list_next(previous_request=req, previous_response=resp)
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "project_custom_roles": custom_roles[:200],
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

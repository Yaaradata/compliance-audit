"""Pre-flight checks: credentials, IAM read, optional enabled APIs list."""
from __future__ import annotations

from google.api_core import exceptions as gcp_exceptions
from google.auth import default
from google.cloud.resourcemanager_v3 import ProjectsClient
from googleapiclient.discovery import build

from app.gcp_evidence.platform.gcp_errors import classify_google_exception


def precheck_gcp_collection(project_id: str, max_enabled_services: int = 80) -> dict:
    """
    Non-fatal checks before a full collect. Never raises; returns a structured dict.
    """
    project_id = (project_id or "").strip()
    out: dict = {"project_id": project_id, "ok": True, "checks": [], "errors": []}
    if not project_id:
        out["ok"] = False
        out["errors"].append("project_id is empty")
        return out

    # 1) IAM policy read (same as /gcp/credentials/test)
    try:
        client = ProjectsClient()
        client.get_iam_policy(request={"resource": f"projects/{project_id}"})
        out["checks"].append({"id": "resourcemanager.projects.getIamPolicy", "status": "PASS"})
    except Exception as e:
        code, msg = classify_google_exception(e)
        out["ok"] = False
        out["checks"].append({"id": "resourcemanager.projects.getIamPolicy", "status": "FAIL", "code": code, "message": msg})
        out["errors"].append(f"IAM policy read: {code}: {msg}")

    # 2) Optional: list enabled services (requires serviceusage.services.list)
    try:
        creds, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
        su = build("serviceusage", "v1", credentials=creds, cache_discovery=False)
        req = su.services().list(parent=f"projects/{project_id}", pageSize=100)
        enabled: list[str] = []
        while req is not None:
            resp = req.execute()
            for s in resp.get("services") or []:
                if s.get("state") == "ENABLED":
                    name = (s.get("name") or "").split("/")[-1]
                    if name:
                        enabled.append(name)
                if len(enabled) >= max_enabled_services:
                    req = None
                    break
            if req is not None:
                req = su.services().list_next(previous_request=req, previous_response=resp)
        out["checks"].append(
            {
                "id": "serviceusage.services.list",
                "status": "PASS",
                "sample_enabled_count": len(enabled),
                "sample": sorted(enabled)[:40],
            }
        )
    except gcp_exceptions.PermissionDenied as e:
        out["checks"].append(
            {
                "id": "serviceusage.services.list",
                "status": "SKIP",
                "message": f"Permission denied (grant serviceusage.services.list or serviceusage.consumer): {e.message}",
            }
        )
    except Exception as e:
        code, msg = classify_google_exception(e)
        out["checks"].append({"id": "serviceusage.services.list", "status": "SKIP", "code": code, "message": msg})

    return out

"""D3 — OS Config patch deployments and recent patch jobs (summary)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.osconfig_v1 import OsConfigServiceClient
from google.cloud.osconfig_v1.types import ListPatchDeploymentsRequest, ListPatchJobsRequest

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "patch_deployments"
EVIDENCE_TYPE = "Patch deployment history"
SOURCE_SYSTEM = "gcp-osconfig"
CONTROL_MAPPINGS = swift_control_pairs("D3")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    parent = f"projects/{project_id}"
    try:
        client = OsConfigServiceClient()
        deployments: list[dict] = []
        for pd in client.list_patch_deployments(
            request=ListPatchDeploymentsRequest(parent=parent, page_size=50)
        ):
            deployments.append(
                {
                    "name": (pd.name or "").split("/")[-1],
                    "description": (pd.description or "")[:500],
                    "duration": str(pd.duration) if pd.duration else None,
                    "instance_filter": str(pd.instance_filter)[:500] if pd.instance_filter else None,
                }
            )
            if len(deployments) >= 100:
                break
        jobs: list[dict] = []
        try:
            for job in client.list_patch_jobs(
                request=ListPatchJobsRequest(parent=parent, page_size=30)
            ):
                jobs.append(
                    {
                        "name": (job.name or "").split("/")[-1],
                        "state": str(job.state) if job.state else None,
                        "create_time": job.create_time.isoformat() if job.create_time else None,
                    }
                )
                if len(jobs) >= 40:
                    break
        except Exception:
            pass
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "patch_deployments": deployments,
            "patch_jobs_recent_sample": jobs,
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

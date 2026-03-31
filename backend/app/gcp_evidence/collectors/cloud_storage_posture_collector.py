"""F1 — Cloud Storage bucket inventory (public access / uniform IAM hints)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud import storage

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "cloud_storage_posture"
EVIDENCE_TYPE = "External access inventory"
SOURCE_SYSTEM = "gcp-storage"
CONTROL_MAPPINGS = swift_control_pairs("F1")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    try:
        client = storage.Client(project=project_id)
        buckets: list[dict] = []
        for b in client.list_buckets(max_results=150):
            ubla = None
            try:
                if b.iam_configuration and b.iam_configuration.uniform_bucket_level_access_enabled is not None:
                    ubla = bool(b.iam_configuration.uniform_bucket_level_access_enabled)
            except Exception:
                pass
            is_public = False
            try:
                policy = b.get_iam_policy(requested_policy_version=3)
                for _role, members in policy.items():
                    for member in members:
                        if member in ("allUsers", "allAuthenticatedUsers"):
                            is_public = True
            except Exception:
                pass
            buckets.append(
                {
                    "name": b.name,
                    "location": b.location,
                    "storage_class": b.storage_class,
                    "uniform_bucket_level_access": ubla,
                    "likely_public_iam": is_public,
                }
            )
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "bucket_count": len(buckets),
            "buckets": buckets,
            "note": "Vendor / third-party exposure signals: public buckets, weak IAM; combine with service account key inventory.",
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

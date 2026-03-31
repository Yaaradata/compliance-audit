"""C8 — Secret Manager inventory (names, replication, no secret values)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud import secretmanager

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "secret_manager_inventory"
EVIDENCE_TYPE = "Credential storage"
SOURCE_SYSTEM = "gcp-secretmanager"
CONTROL_MAPPINGS = swift_control_pairs("C8")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    parent = f"projects/{project_id}"
    try:
        client = secretmanager.SecretManagerServiceClient()
        secrets: list[dict] = []
        for s in client.list_secrets(request={"parent": parent}):
            repl = s.replication
            secrets.append(
                {
                    "name": s.name.split("/")[-1] if s.name else None,
                    "create_time": s.create_time.isoformat() if s.create_time else None,
                    "replication": str(repl)[:500] if repl else None,
                }
            )
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "secrets": secrets[:200]}
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

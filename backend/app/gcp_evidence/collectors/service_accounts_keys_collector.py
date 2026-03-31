"""C3, C7 — Service accounts and user-managed keys (metadata only)."""
from __future__ import annotations

from datetime import datetime

from google.auth import default
from googleapiclient.discovery import build

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "service_accounts_keys"
SOURCE_SYSTEM = "gcp-iam"
CONTROL_MAPPINGS = swift_control_pairs("C3", "C7")


def _evidence_type(item_code: str) -> str:
    return "Credential inventory" if item_code == "C7" else "User access matrix"


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    creds, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    try:
        iam = build("iam", "v1", credentials=creds, cache_discovery=False)
        accounts_out: list[dict] = []
        req = iam.projects().serviceAccounts().list(name=f"projects/{project_id}")
        while req is not None:
            resp = req.execute()
            for acc_obj in resp.get("accounts") or []:
                name = acc_obj.get("name") or ""
                keys_sample: list[dict] = []
                try:
                    kreq = iam.projects().serviceAccounts().keys().list(name=name, keyTypes="USER_MANAGED")
                    kresp = kreq.execute()
                    for k in kresp.get("keys") or []:
                        keys_sample.append(
                            {
                                "name": (k.get("name") or "").split("/")[-1],
                                "validAfterTime": k.get("validAfterTime"),
                                "validBeforeTime": k.get("validBeforeTime"),
                                "keyAlgorithm": k.get("keyAlgorithm"),
                            }
                        )
                except Exception:
                    keys_sample = []
                accounts_out.append(
                    {
                        "email": acc_obj.get("email"),
                        "disabled": acc_obj.get("disabled"),
                        "user_managed_keys": keys_sample[:20],
                        "user_managed_key_count": len(keys_sample),
                    }
                )
            req = iam.projects().serviceAccounts().list_next(previous_request=req, previous_response=resp)
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "service_accounts": accounts_out[:200],
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": str(e)}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    return results

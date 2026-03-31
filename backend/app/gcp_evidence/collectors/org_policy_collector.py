"""B5, B6 — Project org policy constraints (Org Policy API v2)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud import orgpolicy_v2

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "org_policy_project"
SOURCE_SYSTEM = "gcp-orgpolicy"
CONTROL_MAPPINGS = swift_control_pairs("B5", "B6")


def _evidence_type(item_code: str) -> str:
    if item_code == "B6":
        return "Baseline compliance"
    return "Password policy"


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    parent = f"projects/{project_id}"
    try:
        client = orgpolicy_v2.OrgPolicyClient()
        policies_out: list[dict] = []
        req = orgpolicy_v2.ListPoliciesRequest(parent=parent, page_size=100)
        pager = client.list_policies(request=req)
        for pol in pager:
            policies_out.append(
                {
                    "name": pol.name or None,
                    "spec": (str(pol.spec)[:2000] if pol.spec else None),
                }
            )
            if len(policies_out) >= 200:
                break
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "policy_count": len(policies_out),
            "policies": policies_out,
            "note": "Cloud Identity password rules are not exposed as project org policies; constraints here support deny SA keys, allowed domains, etc.",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except gcp_exceptions.PermissionDenied as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": f"Permission denied: {e.message}",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except Exception as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": str(e),
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    return results

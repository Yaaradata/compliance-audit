"""E6 — Cloud IDS endpoints (packet inspection / IDS coverage signal)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.compute_v1 import RegionsClient
from google.cloud.ids_v1 import IDSClient
from google.cloud.ids_v1.types import ListEndpointsRequest

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "cloud_ids"
EVIDENCE_TYPE = "IDS/IPS config"
SOURCE_SYSTEM = "gcp-ids"
CONTROL_MAPPINGS = swift_control_pairs("E6")

_MAX_REGIONS = 40
_MAX_ENDPOINTS = 80


def _endpoint_row(ep) -> dict:
    return {
        "name": (ep.name or "").split("/")[-1] or None,
        "network": ep.network or None,
        "state": str(ep.state) if getattr(ep, "state", None) is not None else None,
        "severity": str(ep.severity) if getattr(ep, "severity", None) is not None else None,
    }


def _collect_via_regions(project_id: str) -> list[dict]:
    ids_client = IDSClient()
    reg_client = RegionsClient()
    out: list[dict] = []
    n = 0
    for reg in reg_client.list(project=project_id):
        if not reg.name:
            continue
        parent = f"projects/{project_id}/locations/{reg.name}"
        try:
            req = ListEndpointsRequest(parent=parent, page_size=50)
            for ep in ids_client.list_endpoints(request=req):
                out.append(_endpoint_row(ep))
                if len(out) >= _MAX_ENDPOINTS:
                    return out
        except gcp_exceptions.NotFound:
            continue
        n += 1
        if n >= _MAX_REGIONS:
            break
    return out


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    endpoints: list[dict] = []
    method = "wildcard"
    try:
        client = IDSClient()
        req = ListEndpointsRequest(parent=f"projects/{project_id}/locations/-", page_size=100)
        try:
            for ep in client.list_endpoints(request=req):
                endpoints.append(_endpoint_row(ep))
                if len(endpoints) >= _MAX_ENDPOINTS:
                    break
        except gcp_exceptions.InvalidArgument:
            method = "per_region"
            endpoints = _collect_via_regions(project_id)

        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "list_method": method,
            "endpoint_count": len(endpoints),
            "endpoints": endpoints,
            "note": "Cloud IDS is zonal/regionally deployed; absence of endpoints may mean IDS is unused in this project.",
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

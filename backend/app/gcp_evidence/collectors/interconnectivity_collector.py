"""A7 — Peering routes, interconnect attachments, Private Service Connect."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.compute_v1 import InterconnectAttachmentsClient, NetworksClient, ServiceAttachmentsClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "interconnectivity"
EVIDENCE_TYPE = "Inter-zone connectivity"
SOURCE_SYSTEM = "gcp-network"
CONTROL_MAPPINGS = swift_control_pairs("A7")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    try:
        peering_routes: list[dict] = []
        nclient = NetworksClient()
        for n in nclient.list(project=project_id):
            try:
                for route in nclient.list_peering_routes(project=project_id, network=n.name or ""):
                    peering_routes.append(
                        {
                            "network": n.name,
                            "dest_range": route.dest_range or None,
                            "type": route.type_ or None,
                            "priority": int(route.priority) if route.priority is not None else None,
                            "imported": route.imported if route.imported is not None else None,
                        }
                    )
            except Exception:
                continue
        ic_attachments: list[dict] = []
        for _, scoped in InterconnectAttachmentsClient().aggregated_list(project=project_id):
            if scoped and scoped.interconnect_attachments:
                for a in scoped.interconnect_attachments:
                    ic_attachments.append(
                        {
                            "name": a.name,
                            "region": a.region.split("/")[-1] if a.region else None,
                            "type": str(a.type_) if getattr(a, "type_", None) is not None else None,
                            "state": str(a.state) if a.state else None,
                        }
                    )
        psc: list[dict] = []
        for _, scoped in ServiceAttachmentsClient().aggregated_list(project=project_id):
            if scoped and scoped.service_attachments:
                for sa in scoped.service_attachments:
                    psc.append(
                        {
                            "name": sa.name,
                            "region": sa.region.split("/")[-1] if sa.region else None,
                            "connection_preference": str(sa.connection_preference) if sa.connection_preference else None,
                        }
                    )
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "peering_route_samples": peering_routes[:500],
            "interconnect_attachments": ic_attachments[:200],
            "private_service_connect_attachments": psc[:200],
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

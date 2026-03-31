"""A3, A6 — Subnet flow logging, Private Google Access, network peering summary (workbook)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.compute_v1 import NetworksClient, SubnetworksClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "network_flow_segmentation"
SOURCE_SYSTEM = "gcp-network"
CONTROL_MAPPINGS = swift_control_pairs("A3", "A6")


def _evidence_type(item_code: str) -> str:
    return "Zone architecture" if item_code == "A6" else "Network flow data"


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    try:
        peering_summary: list[dict] = []
        for n in NetworksClient().list(project=project_id):
            peerings = []
            for p in n.peerings or []:
                peerings.append(
                    {
                        "name": p.name,
                        "network": p.network or None,
                        "state": str(p.state) if p.state else None,
                        "export_custom_routes": p.export_custom_routes,
                        "import_custom_routes": p.import_custom_routes,
                    }
                )
            peering_summary.append({"network": n.name, "peerings": peerings[:50]})
        subnets: list[dict] = []
        for _, scoped in SubnetworksClient().aggregated_list(project=project_id):
            if scoped and scoped.subnetworks:
                for s in scoped.subnetworks:
                    lc = s.log_config
                    subnets.append(
                        {
                            "name": s.name,
                            "region": s.region.split("/")[-1] if s.region else None,
                            "private_ip_google_access": s.private_ip_google_access,
                            "flow_logs": {
                                "enabled": bool(lc and getattr(lc, "enable", False)),
                                "aggregation_interval": int(lc.aggregation_interval) if lc and lc.aggregation_interval else None,
                            },
                        }
                    )
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "vpc_peerings_by_network": peering_summary,
            "subnetworks_segmentation": subnets[:400],
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

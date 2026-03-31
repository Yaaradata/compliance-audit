"""A1 — VPC topology: networks, subnets, routes, routers, VPN tunnels (SWIFT workbook Phase 1)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.compute_v1 import NetworksClient, RoutersClient, RoutesClient, SubnetworksClient, VpnTunnelsClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "network_topology"
EVIDENCE_TYPE = "Infrastructure topology"
SOURCE_SYSTEM = "gcp-network"
CONTROL_MAPPINGS = swift_control_pairs("A1")


def _dict_subnet(s) -> dict:
    return {
        "name": s.name,
        "region": s.region.split("/")[-1] if s.region else None,
        "ip_cidr_range": s.ip_cidr_range or None,
        "private_ip_google_access": s.private_ip_google_access,
        "purpose": s.purpose or None,
        "log_config_enabled": bool(s.log_config and getattr(s.log_config, "enable", False)),
    }


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    try:
        networks = [{"name": n.name, "routing_mode": str(n.routing_config.routing_mode) if n.routing_config else None} for n in NetworksClient().list(project=project_id)]
        subnets: list[dict] = []
        for _, scoped in SubnetworksClient().aggregated_list(project=project_id):
            if scoped and scoped.subnetworks:
                for s in scoped.subnetworks:
                    subnets.append(_dict_subnet(s))
        routes = [{"name": r.name, "dest_range": r.dest_range or None, "priority": r.priority} for r in RoutesClient().list(project=project_id)][:500]
        routers: list[dict] = []
        for _, scoped in RoutersClient().aggregated_list(project=project_id):
            if scoped and scoped.routers:
                for r in scoped.routers:
                    routers.append(
                        {
                            "name": r.name,
                            "region": r.region.split("/")[-1] if r.region else None,
                            "bgp_asn": r.bgp.asn if r.bgp and r.bgp.asn else None,
                            "nats": [n.name for n in (r.nats or [])][:20],
                        }
                    )
        vpn_tunnels: list[dict] = []
        for _, scoped in VpnTunnelsClient().aggregated_list(project=project_id):
            if scoped and scoped.vpn_tunnels:
                for t in scoped.vpn_tunnels:
                    vpn_tunnels.append(
                        {
                            "name": t.name,
                            "region": t.region.split("/")[-1] if t.region else None,
                            "status": t.status or None,
                            "ike_version": int(t.ike_version) if t.ike_version else None,
                        }
                    )
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "network_count": len(networks),
            "networks": networks[:100],
            "subnetworks": subnets[:400],
            "subnetwork_count": len(subnets),
            "routes": routes,
            "route_count": len(routes),
            "routers": routers[:200],
            "vpn_tunnels": vpn_tunnels[:200],
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

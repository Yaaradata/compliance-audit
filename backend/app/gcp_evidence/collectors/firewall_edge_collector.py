"""A4 — VPC firewalls, hierarchical firewall policies, Cloud Armor (security policies)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.compute_v1 import FirewallsClient, NetworkFirewallPoliciesClient, SecurityPoliciesClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "firewall_and_edge"
EVIDENCE_TYPE = "Firewall configuration"
SOURCE_SYSTEM = "gcp-firewall"
CONTROL_MAPPINGS = swift_control_pairs("A4")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    try:
        vpc_fw = [
            {
                "name": fw.name,
                "direction": int(fw.direction) if fw.direction is not None else None,
                "priority": fw.priority,
                "disabled": fw.disabled,
                "source_ranges": list(fw.source_ranges or [])[:20],
                "destination_ranges": list(fw.destination_ranges or [])[:20],
                "allowed_summary": [{"protocol": a.I_p_protocol, "ports": list(a.ports or [])[:8]} for a in (fw.allowed or [])[:8]],
            }
            for fw in FirewallsClient().list(project=project_id)
        ]
        hierarchical: list[dict] = []
        try:
            for pol in NetworkFirewallPoliciesClient().list(project=project_id):
                hierarchical.append({"name": pol.name, "rule_count": len(pol.rules or [])})
        except Exception as e:
            hierarchical = [{"note": str(e)}]
        armor: list[dict] = []
        try:
            for sp in SecurityPoliciesClient().list(project=project_id):
                armor.append(
                    {
                        "name": sp.name,
                        "adaptive_protection_config_enabled": bool(
                            sp.adaptive_protection_config and sp.adaptive_protection_config.layer_7_ddos_defense_config
                        ),
                        "rule_count": len(sp.rules or []) if sp.rules else 0,
                    }
                )
        except Exception as e:
            armor = [{"note": str(e)}]
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "vpc_firewall_rules": vpc_fw[:300],
            "hierarchical_firewall_policies": hierarchical[:50],
            "cloud_armor_security_policies": armor[:50],
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

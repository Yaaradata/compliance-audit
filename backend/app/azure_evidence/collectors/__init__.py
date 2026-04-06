"""Azure collectors — Resource Graph + Defender assessments table."""
from . import azure_backup_collector
from . import azure_component_inventory_collector
from . import azure_compute_patch_collector
from . import azure_container_integrity_collector
from . import azure_defender_assessments_collector
from . import azure_encryption_collector
from . import azure_firewall_nsg_collector
from . import azure_identity_rbac_collector
from . import azure_logging_monitoring_collector
from . import azure_network_topology_collector

COLLECTORS = [
    ("azure_network_topology", azure_network_topology_collector),
    ("azure_component_inventory", azure_component_inventory_collector),
    ("azure_firewall_nsg", azure_firewall_nsg_collector),
    ("azure_encryption", azure_encryption_collector),
    ("azure_identity_rbac", azure_identity_rbac_collector),
    ("azure_logging_monitoring", azure_logging_monitoring_collector),
    ("azure_defender_assessments", azure_defender_assessments_collector),
    ("azure_compute_patch", azure_compute_patch_collector),
    ("azure_backup", azure_backup_collector),
    ("azure_container_integrity", azure_container_integrity_collector),
]


def expected_total_evidence_rows() -> int:
    total = 0
    for _name, mod in COLLECTORS:
        cm = getattr(mod, "CONTROL_MAPPINGS", None)
        if cm is not None:
            total += len(cm)
    return total

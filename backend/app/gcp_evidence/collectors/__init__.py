"""GCP collectors ordered by SWIFT workbook phases (network → access → monitoring)."""
from . import network_topology_collector
from . import swift_component_inventory_collector
from . import network_flow_segmentation_collector
from . import firewall_edge_collector
from . import interconnectivity_collector
from . import cloud_ids_collector
from . import kms_encryption_collector
from . import backup_snapshot_collector
from . import logging_posture_collector
from . import audit_activity_sample_collector
from . import project_iam_policy_collector
from . import project_oslogin_collector
from . import org_policy_collector
from . import rbac_roles_collector
from . import service_accounts_keys_collector
from . import recommender_iam_collector
from . import secret_manager_collector
from . import cloud_storage_posture_collector
from . import binary_authorization_collector
from . import osconfig_posture_collector
from . import patch_deployments_collector
from . import cloud_asset_inventory_collector
from . import monitoring_alerts_collector
from . import scc_findings_collector
from . import compliance_attestation_scope_collector

COLLECTORS = [
    ("network_topology", network_topology_collector),
    ("swift_component_inventory", swift_component_inventory_collector),
    ("network_flow_segmentation", network_flow_segmentation_collector),
    ("firewall_and_edge", firewall_edge_collector),
    ("interconnectivity", interconnectivity_collector),
    ("cloud_ids", cloud_ids_collector),
    ("kms_encryption", kms_encryption_collector),
    ("backup_snapshot", backup_snapshot_collector),
    ("logging_posture", logging_posture_collector),
    ("audit_activity_sample", audit_activity_sample_collector),
    ("project_iam_policy", project_iam_policy_collector),
    ("project_oslogin", project_oslogin_collector),
    ("org_policy_project", org_policy_collector),
    ("rbac_roles", rbac_roles_collector),
    ("service_accounts_keys", service_accounts_keys_collector),
    ("recommender_iam", recommender_iam_collector),
    ("secret_manager_inventory", secret_manager_collector),
    ("cloud_storage_posture", cloud_storage_posture_collector),
    ("binary_authorization", binary_authorization_collector),
    ("osconfig_posture", osconfig_posture_collector),
    ("patch_deployments", patch_deployments_collector),
    ("cloud_asset_inventory", cloud_asset_inventory_collector),
    ("monitoring_alerts", monitoring_alerts_collector),
    ("scc_findings", scc_findings_collector),
    ("compliance_attestation_scope", compliance_attestation_scope_collector),
]


def expected_total_evidence_rows() -> int:
    total = 0
    for _name, mod in COLLECTORS:
        cm = getattr(mod, "CONTROL_MAPPINGS", None)
        if cm is not None:
            total += len(cm)
    return total

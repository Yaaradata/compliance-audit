"""GCP API surface per collector — IAM-oriented method names aligned with collector code.

Each string matches the style of Cloud IAM permission references (e.g. ``logging.logEntries.list``)
or the API method ID used in Google Cloud docs, so teams can map collectors to roles and
``gcloud services enable`` decisions.
"""

from __future__ import annotations

# Collector key MUST match each module's COLLECTOR_NAME.
COLLECTOR_GCP_APIS: dict[str, list[str]] = {
    "network_topology": [
        "compute.networks.list",
        "compute.subnetworks.aggregatedList",
        "compute.routes.list",
        "compute.routers.aggregatedList",
        "compute.vpnTunnels.aggregatedList",
    ],
    "swift_component_inventory": [
        "compute.instances.aggregatedList",
        "compute.forwardingRules.aggregatedList",
        "sqladmin.instances.list",
        "run.services.list",
    ],
    "network_flow_segmentation": [
        "compute.networks.list",
        "compute.subnetworks.aggregatedList",
    ],
    "firewall_and_edge": [
        "compute.firewalls.list",
        "compute.networkFirewallPolicies.list",
        "compute.securityPolicies.list",
    ],
    "interconnectivity": [
        "compute.networks.list",
        "compute.networks.listPeeringRoutes",
        "compute.interconnectAttachments.aggregatedList",
        "compute.serviceAttachments.aggregatedList",
    ],
    "cloud_ids": [
        "ids.endpoints.list",
        "compute.regions.list",
    ],
    "kms_encryption": [
        "cloudkms.keyRings.list",
        "cloudkms.cryptoKeys.list",
        "compute.sslPolicies.list",
        "certificatemanager.certificates.list",
    ],
    "backup_snapshot": [
        "compute.snapshots.list",
        "compute.resourcePolicies.aggregatedList",
        "sqladmin.instances.list",
    ],
    "logging_posture": [
        "logging.sinks.list",
        "logging.buckets.list",
        "compute.subnetworks.aggregatedList",
    ],
    "audit_activity_sample": [
        "logging.logEntries.list",
    ],
    "project_oslogin": [
        "compute.projects.get",
    ],
    "org_policy_project": [
        "orgpolicy.policies.list",
    ],
    "recommender_iam": [
        "recommender.insights.list",
    ],
    "cloud_storage_posture": [
        "storage.buckets.list",
        "storage.buckets.getIamPolicy",
    ],
    "binary_authorization": [
        "binaryauthorization.policy.get",
    ],
    "patch_deployments": [
        "osconfig.patchDeployments.list",
        "osconfig.patchJobs.list",
    ],
    "project_iam_policy": [
        "resourcemanager.projects.getIamPolicy",
    ],
    "rbac_roles": [
        "iam.roles.list",
    ],
    "service_accounts_keys": [
        "iam.serviceAccounts.list",
        "iam.serviceAccounts.keys.list",
    ],
    "secret_manager_inventory": [
        "secretmanager.secrets.list",
    ],
    "osconfig_posture": [
        "compute.zones.list",
        "osconfig.vulnerabilityReports.list",
    ],
    "cloud_asset_inventory": [
        "cloudasset.assets.searchAllResources",
    ],
    "monitoring_alerts": [
        "monitoring.alertPolicies.list",
    ],
    "scc_findings": [
        "securitycenter.findings.list",
    ],
    "compliance_attestation_scope": [],
}


def get_apis_for_run(collector_name: str) -> list[dict]:
    """Shape compatible with AWS run detail: list of { collector, apis }."""
    if collector_name and collector_name != "all":
        apis = COLLECTOR_GCP_APIS.get(collector_name, [])
        return [{"collector": collector_name, "apis": apis}] if apis else []
    out: list[dict] = []
    for name, apis in COLLECTOR_GCP_APIS.items():
        out.append({"collector": name, "apis": apis})
    return out


def apis_by_evidence_item() -> dict[str, list[str]]:
    """Union of GCP API methods used per SWIFT evidence item code (A1, B3, …)."""
    from app.gcp_evidence.collectors import COLLECTORS

    item_to_apis: dict[str, set[str]] = {}
    for _mod_name, mod in COLLECTORS:
        cname = getattr(mod, "COLLECTOR_NAME", None)
        mappings = getattr(mod, "CONTROL_MAPPINGS", None) or []
        if not cname:
            continue
        apis = set(COLLECTOR_GCP_APIS.get(cname, []))
        for item_code, _control_id in mappings:
            item_to_apis.setdefault(item_code, set()).update(apis)
    return {k: sorted(v) for k, v in sorted(item_to_apis.items())}


def apis_by_swift_control() -> dict[str, list[str]]:
    """Union of GCP API methods per CSCF control id (from collector CONTROL_MAPPINGS pairs)."""
    from app.gcp_evidence.collectors import COLLECTORS

    control_to_apis: dict[str, set[str]] = {}
    for _mod_name, mod in COLLECTORS:
        cname = getattr(mod, "COLLECTOR_NAME", None)
        mappings = getattr(mod, "CONTROL_MAPPINGS", None) or []
        if not cname:
            continue
        apis = set(COLLECTOR_GCP_APIS.get(cname, []))
        for _item_code, control_id in mappings:
            control_to_apis.setdefault(str(control_id), set()).update(apis)
    return {k: sorted(v) for k, v in sorted(control_to_apis.items(), key=lambda x: x[0])}


def validate_catalog_matches_collectors() -> tuple[bool, list[str]]:
    """
    Every registered collector module must have a COLLECTOR_NAME key in COLLECTOR_GCP_APIS
    (value may be empty only for manual-scope collectors).
    """
    from app.gcp_evidence.collectors import COLLECTORS

    errors: list[str] = []
    for mod_name, mod in COLLECTORS:
        cname = getattr(mod, "COLLECTOR_NAME", None)
        if not cname:
            errors.append(f"module {mod_name} missing COLLECTOR_NAME")
            continue
        if cname not in COLLECTOR_GCP_APIS:
            errors.append(f"COLLECTOR_GCP_APIS missing key: {cname} (module {mod_name})")
    for key in COLLECTOR_GCP_APIS:
        if key == "compliance_attestation_scope":
            continue
        if not COLLECTOR_GCP_APIS[key]:
            errors.append(f"COLLECTOR_GCP_APIS[{key}] is empty but collector is not manual-scope")
    return (len(errors) == 0, errors)


def api_matrix_for_docs() -> dict:
    """Single payload for UI or audits: collectors, evidence items, and CSCF controls."""
    from app.gcp_evidence.collectors import COLLECTORS

    by_collector = [
        {
            "collector": getattr(mod, "COLLECTOR_NAME", ""),
            "evidence_items": sorted({p[0] for p in (getattr(mod, "CONTROL_MAPPINGS", None) or [])}),
            "swift_controls": sorted({str(p[1]) for p in (getattr(mod, "CONTROL_MAPPINGS", None) or [])}),
            "gcp_api_methods": COLLECTOR_GCP_APIS.get(getattr(mod, "COLLECTOR_NAME", ""), []),
        }
        for _n, mod in COLLECTORS
    ]
    ok, err = validate_catalog_matches_collectors()
    return {
        "catalog_valid": ok,
        "catalog_errors": err,
        "by_collector": by_collector,
        "by_evidence_item": apis_by_evidence_item(),
        "by_swift_control": apis_by_swift_control(),
    }

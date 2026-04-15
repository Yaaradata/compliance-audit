"""Azure API surface per collector (Resource Graph + ARM + Microsoft Graph)."""

from __future__ import annotations

COLLECTOR_AZURE_APIS: dict[str, list[str]] = {
    "azure_network_topology": [
        "Microsoft.ResourceGraph/resources",
    ],
    "azure_component_inventory": [
        "Microsoft.ResourceGraph/resources",
    ],
    "azure_firewall_nsg": [
        "Microsoft.ResourceGraph/resources",
    ],
    "azure_encryption": [
        "Microsoft.ResourceGraph/resources",
    ],
    "azure_identity_rbac": [
        "Microsoft.ResourceGraph/resources",
        "Microsoft Graph: /reports/credentialUserRegistrationDetails",
        "Microsoft Graph: /auditLogs/directoryAudits",
    ],
    "azure_logging_monitoring": [
        "Microsoft.ResourceGraph/resources",
    ],
    "azure_defender_assessments": [
        "Microsoft.ResourceGraph/resources (securityresources)",
    ],
    "azure_compute_patch": [
        "Microsoft.ResourceGraph/resources",
    ],
    "azure_backup": [
        "Microsoft.ResourceGraph/resources",
    ],
    "azure_container_integrity": [
        "Microsoft.ResourceGraph/resources",
    ],
}


def validate_catalog_matches_collectors() -> tuple[bool, list[str]]:
    from app.azure_evidence.collectors import COLLECTORS

    errors: list[str] = []
    for mod_name, mod in COLLECTORS:
        cname = getattr(mod, "COLLECTOR_NAME", None)
        if not cname:
            errors.append(f"module {mod_name} missing COLLECTOR_NAME")
            continue
        if cname not in COLLECTOR_AZURE_APIS:
            errors.append(f"COLLECTOR_AZURE_APIS missing key: {cname} (module {mod_name})")
    return (len(errors) == 0, errors)


def api_matrix_for_docs() -> dict:
    from app.azure_evidence.collectors import COLLECTORS

    by_collector = [
        {
            "collector": getattr(mod, "COLLECTOR_NAME", ""),
            "evidence_items": sorted({p[0] for p in (getattr(mod, "CONTROL_MAPPINGS", None) or [])}),
            "swift_controls": sorted({str(p[1]) for p in (getattr(mod, "CONTROL_MAPPINGS", None) or [])}),
            "azure_api_methods": COLLECTOR_AZURE_APIS.get(getattr(mod, "COLLECTOR_NAME", ""), []),
        }
        for _n, mod in COLLECTORS
    ]
    ok, err = validate_catalog_matches_collectors()
    return {
        "catalog_valid": ok,
        "catalog_errors": err,
        "by_collector": by_collector,
    }

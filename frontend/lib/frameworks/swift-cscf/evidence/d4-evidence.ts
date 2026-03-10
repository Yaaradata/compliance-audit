import type { FieldDef } from "@/components/domain/generic-intake-form";

export const D4_EVIDENCE_ITEM_ID = "D4";

export const D4_UPLOAD_GUIDANCE = [
  { id: "1", label: "Vulnerability scan report(s) covering ALL in-scope systems from A2 inventory" },
  { id: "2", label: "Scan tool name/version and confirmation scan profiles are <1 month old" },
  { id: "3", label: "Scan scope: servers, PCs, jump servers, network devices, virtualisation, HSM interfaces" },
  { id: "4", label: "Scan type details (authenticated/unauthenticated) and configuration per system type" },
  { id: "5", label: "Network scan evidence from within secure zone AND from adjacent zone" },
  { id: "6", label: "Per-vulnerability details: CVE ID, CVSS severity, affected system, description, remediation" },
  { id: "7", label: "Scan coverage validation (systems scanned vs A2 inventory count)" },
  { id: "8", label: "False positive identification and justification" },
];

export const D4_FIELDS: FieldDef[] = [
  {
    key: "last_scan_date",
    label: "Most recent scan date",
    type: "date",
  },
  {
    key: "scan_tool_name",
    label: "Vulnerability scan tool and version",
    type: "text",
    placeholder: "e.g. Qualys VMDR 10.x, Nessus Professional 10.7, OpenVAS 22.x",
  },
  {
    key: "scan_profile_age",
    label: "Scan profile / plugin age at time of scan",
    type: "select",
    options: [
      "Less than 1 month old (compliant)",
      "1–3 months old",
      "More than 3 months old",
      "Unknown / not verified",
    ],
  },
  {
    key: "scan_frequency",
    label: "Scan frequency",
    type: "select",
    options: [
      "Monthly or more frequent",
      "Quarterly",
      "Annually + after significant changes (minimum compliant)",
      "Annually only",
      "Ad-hoc / irregular",
    ],
  },
  {
    key: "scan_type",
    label: "Scan authentication type",
    type: "select",
    options: [
      "Authenticated (credentialed) scans for all systems",
      "Authenticated for most, unauthenticated for some",
      "Both authenticated and unauthenticated scans performed",
      "Unauthenticated (non-credentialed) only",
    ],
  },
  {
    key: "scan_origin_zones",
    label: "Network scan origin",
    type: "select",
    options: [
      "From within secure zone AND adjacent zone (both)",
      "From within secure zone only",
      "From adjacent zone only",
      "External scan only",
    ],
  },
  {
    key: "total_systems_scanned",
    label: "Total systems scanned",
    type: "text",
    placeholder: "e.g. 24 systems scanned",
  },
  {
    key: "a2_inventory_coverage",
    label: "Scan coverage vs A2 inventory",
    type: "select",
    options: [
      "All in-scope systems scanned (100% A2 coverage)",
      "Most systems scanned (>90% A2 coverage)",
      "Partial coverage (50–90% A2 coverage)",
      "Significant gaps (<50% A2 coverage)",
    ],
  },
  {
    key: "system_types_scanned",
    label: "System types included in scan scope",
    type: "textarea",
    rows: 3,
    placeholder: "Confirm each type scanned: SWIFT servers, operator PCs, jump servers, network devices (firewalls, routers, switches), virtualisation hosts, HSM interfaces. Note any exclusions.",
  },
  {
    key: "critical_vulnerabilities_found",
    label: "Critical vulnerabilities found (CVSS 9.0+)",
    type: "text",
    placeholder: "e.g. 2 critical vulnerabilities",
  },
  {
    key: "high_vulnerabilities_found",
    label: "High vulnerabilities found (CVSS 7.0–8.9)",
    type: "text",
    placeholder: "e.g. 8 high vulnerabilities",
  },
  {
    key: "medium_low_vulnerabilities_found",
    label: "Medium and low vulnerabilities found",
    type: "text",
    placeholder: "e.g. 15 medium, 23 low",
  },
  {
    key: "false_positives_identified",
    label: "False positives identified and validated",
    type: "text",
    placeholder: "e.g. 3 false positives — documented with justification",
  },
  {
    key: "scan_configuration_details",
    label: "Scan configuration details per system type",
    type: "textarea",
    rows: 3,
    placeholder: "Describe scan profiles used: OS checks, application checks, network service checks, database checks. Note any system-specific configurations.",
  },
  {
    key: "known_gaps",
    label: "Known gaps or scan limitations",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Systems excluded from scan (with reason), known scanner limitations, areas requiring manual assessment",
  },
];

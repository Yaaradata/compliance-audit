import type { FieldDef } from "@/components/domain/generic-intake-form";

export const E2_EVIDENCE_ITEM_ID = "E2";

export const E2_UPLOAD_GUIDANCE = [
  { id: "1", label: "SIEM/centralised logging platform configuration and architecture diagram" },
  { id: "2", label: "Log source inventory showing ALL in-scope systems: servers, operator PCs, network devices, SWIFT applications, HSM, virtualisation hosts" },
  { id: "3", label: "Log type configuration: authentication events, admin actions, system events, application events, network events" },
  { id: "4", label: "Log forwarding mechanism details (agent-based, syslog, API) per source" },
  { id: "5", label: "Evidence that log integrity is protected from enterprise administrator compromise" },
  { id: "6", label: "Retention configuration: application audit ≥12 months, OS admin on servers ≥12 months, operator PCs ≥31 days, firewall ≥6 months" },
  { id: "7", label: "Evidence that SIEM is separated from enterprise admin control (dedicated admin accounts/roles)" },
  { id: "8", label: "Dashboard or monitoring interface screenshots showing operational status" },
];

export const E2_FIELDS: FieldDef[] = [
  {
    key: "siem_product_version",
    label: "SIEM / Centralised Logging Product & Version",
    type: "text",
    placeholder: "e.g. Splunk Enterprise 9.1, IBM QRadar 7.5, Microsoft Sentinel, Elastic SIEM 8.x",
  },
  {
    key: "log_source_coverage",
    label: "Log Source Coverage Across In-Scope Systems",
    type: "select",
    options: [
      "All in-scope systems (servers, PCs, network devices, SWIFT apps, HSM, virtualisation)",
      "Most systems (>75%) — some sources pending",
      "Partial coverage (25-75%)",
      "Few systems sending logs (<25%)",
      "No centralised logging",
    ],
  },
  {
    key: "log_sources_detail",
    label: "Log Sources by System Type",
    type: "textarea",
    rows: 4,
    placeholder: "List each source type and count, e.g.:\n• SWIFT application servers: 3/3\n• Operator PCs: 8/8\n• Network devices (firewalls/switches): 4/4\n• HSM appliances: 2/2\n• Virtualisation hosts: 2/2",
  },
  {
    key: "log_types_captured",
    label: "Log Types Being Captured",
    type: "textarea",
    rows: 3,
    placeholder: "Confirm each type: authentication events, administrative actions, system events, application events, network events. Note any gaps.",
  },
  {
    key: "forwarding_mechanism",
    label: "Log Forwarding Mechanism",
    type: "select",
    options: [
      "Agent-based forwarders on all sources",
      "Syslog (UDP/TCP/TLS) from all sources",
      "API-based collection",
      "Mixed (agent + syslog + API)",
      "Local log collection only — no forwarding",
    ],
  },
  {
    key: "log_integrity_protection",
    label: "Log Integrity Protection from Enterprise Admins",
    type: "select",
    options: [
      "Immutable storage with cryptographic integrity verification",
      "Write-once storage — no enterprise admin deletion",
      "Role-separated access — enterprise admins cannot modify",
      "Partial protection — some logs modifiable",
      "No integrity protection — enterprise admins can alter logs",
    ],
  },
  {
    key: "retention_app_audit",
    label: "Retention — Application Audit Logs",
    type: "select",
    options: ["≥12 months", "6-11 months", "3-5 months", "<3 months", "Not configured"],
  },
  {
    key: "retention_os_admin_servers",
    label: "Retention — OS Admin Logs on Servers",
    type: "select",
    options: ["≥12 months", "6-11 months", "3-5 months", "<3 months", "Not configured"],
  },
  {
    key: "retention_operator_pc",
    label: "Retention — Operator PC Logs",
    type: "select",
    options: ["≥31 days", "14-30 days", "<14 days", "Not configured"],
  },
  {
    key: "retention_firewall",
    label: "Retention — Firewall / Network Device Logs",
    type: "select",
    options: ["≥6 months", "3-5 months", "1-2 months", "<1 month", "Not configured"],
  },
  {
    key: "siem_admin_separation",
    label: "SIEM Administrative Separation from Enterprise IT",
    type: "select",
    options: [
      "Fully separated — dedicated SIEM admin accounts, no enterprise admin access",
      "Logically separated — role-based controls limit enterprise admin access",
      "Partially separated — some shared admin accounts",
      "Not separated — enterprise admins have full SIEM access",
    ],
  },
  {
    key: "monitoring_dashboard_status",
    label: "Dashboard / Monitoring Interface Status",
    type: "select",
    options: [
      "Operational — real-time dashboards with health monitoring",
      "Operational — basic dashboards available",
      "Under development",
      "No dashboard or monitoring interface",
    ],
  },
  {
    key: "additional_notes",
    label: "Additional Notes or Known Gaps",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Describe any log source gaps, retention shortfalls, or planned improvements",
  },
];

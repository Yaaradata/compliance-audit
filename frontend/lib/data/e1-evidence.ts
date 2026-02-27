import type { FieldDef } from "@/components/domain/generic-intake-form";

export const E1_EVIDENCE_ITEM_ID = "E1";

export const E1_UPLOAD_GUIDANCE = [
  { id: "1", label: "Anti-malware/EPP/EDR product details and version deployed on every in-scope Windows system (dedicated operator PCs, general-purpose PCs, jump servers, management PCs, SWIFT component hosts)" },
  { id: "2", label: "Screenshots or reports showing on-access (real-time) scanning is enabled on all systems" },
  { id: "3", label: "Scheduled full-scan configuration (weekly for PCs, regular cadence for servers)" },
  { id: "4", label: "Signature/definition update configuration and evidence of last successful update date" },
  { id: "5", label: "Scan scope settings showing all file types included, with risk-assessed exclusion list if any" },
  { id: "6", label: "Prevent/quarantine mode configuration with alert-on-detection evidence" },
  { id: "7", label: "Alert forwarding configuration to SIEM/logging per control 6.4" },
  { id: "8", label: "Reports showing failed update or missed scan detection and follow-up" },
  { id: "9", label: "Evidence that files transferred to the SWIFT network are scanned before transfer" },
];

export const E1_FIELDS: FieldDef[] = [
  {
    key: "epp_edr_product",
    label: "Anti-Malware / EPP / EDR Product & Version",
    type: "text",
    placeholder: "e.g. CrowdStrike Falcon v6.58, Microsoft Defender for Endpoint, Symantec Endpoint Protection 14.3",
  },
  {
    key: "in_scope_system_coverage",
    label: "Coverage Across In-Scope Windows Systems",
    type: "select",
    options: [
      "All in-scope systems (dedicated PCs, general PCs, jump servers, mgmt PCs, component hosts)",
      "Most systems (>75%) — some pending deployment",
      "Partial coverage (25-75%)",
      "Few systems covered (<25%)",
      "Not deployed",
    ],
  },
  {
    key: "covered_system_types",
    label: "System Types Covered",
    type: "textarea",
    rows: 3,
    placeholder: "List each system type and count, e.g.:\n• Dedicated operator PCs: 4/4\n• General-purpose PCs: 6/6\n• Jump servers: 2/2\n• SWIFT component hosts: 3/3",
  },
  {
    key: "realtime_scanning_status",
    label: "On-Access (Real-Time) Scanning Status",
    type: "select",
    options: [
      "Enabled on all in-scope systems",
      "Enabled on most systems (>75%)",
      "Enabled on some systems (25-75%)",
      "Disabled or not configured",
    ],
  },
  {
    key: "full_scan_schedule",
    label: "On-Demand Full Scan Schedule",
    type: "select",
    options: [
      "Weekly for PCs + regular schedule for servers",
      "Weekly for PCs only — no server schedule",
      "Monthly or less frequent",
      "Ad-hoc / no schedule configured",
    ],
  },
  {
    key: "scan_scope_config",
    label: "Scan Scope & Exclusion Management",
    type: "select",
    options: [
      "All file types scanned — no exclusions",
      "All file types scanned — exclusions documented with risk assessment",
      "Exclusions present — not risk-assessed or undocumented",
      "Limited scan scope — not all file types included",
    ],
  },
  {
    key: "signature_update_frequency",
    label: "Signature / Definition Update Frequency",
    type: "select",
    options: [
      "Real-time (cloud-delivered)",
      "Multiple times daily",
      "Daily",
      "Weekly",
      "Manual / irregular",
      "Not configured",
    ],
  },
  {
    key: "last_signature_update_date",
    label: "Last Successful Signature Update Date",
    type: "date",
  },
  {
    key: "prevent_mode_config",
    label: "Prevention Mode Configuration",
    type: "select",
    options: [
      "Prevent mode — quarantine + alert on detection",
      "Detect-only mode — alert but no quarantine",
      "Mixed — prevent on some systems, detect on others",
      "Not configured",
    ],
  },
  {
    key: "alert_forwarding_to_siem",
    label: "Alert Forwarding to SIEM / Logging (per 6.4)",
    type: "select",
    options: [
      "All malware alerts forwarded to SIEM in real-time",
      "Most alerts forwarded — some gaps",
      "Alerts logged locally only — not forwarded",
      "No alert forwarding configured",
    ],
  },
  {
    key: "failed_update_missed_scan_detection",
    label: "Failed Update / Missed Scan Detection",
    type: "select",
    options: [
      "Automated alerts for failed updates and missed scans",
      "Manual review process for failures",
      "Partial detection — only one type monitored",
      "No detection mechanism",
    ],
  },
  {
    key: "swift_network_transfer_scanning",
    label: "File Scanning Before SWIFT Network Transfer",
    type: "select",
    options: [
      "All files scanned before transfer to SWIFT network",
      "Scanning configured but not enforced for all transfers",
      "No pre-transfer scanning configured",
      "Not applicable — no file transfers to SWIFT network",
    ],
  },
  {
    key: "additional_notes",
    label: "Additional Notes or Known Gaps",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Describe any deployment gaps, pending remediations, or compensating controls in place",
  },
];

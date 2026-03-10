import type { FieldDef } from "@/components/domain/generic-intake-form";

export const E4_EVIDENCE_ITEM_ID = "E4";

export const E4_UPLOAD_GUIDANCE = [
  { id: "1", label: "Integrity verification tool/method for ALL in-scope SWIFT components (connector, GUI, messaging interface, communication interface, Local RMA, SNL)" },
  { id: "2", label: "HSM firmware integrity verification evidence" },
  { id: "3", label: "Check frequency: at startup + daily integrity verification results" },
  { id: "4", label: "Baseline comparison results showing no unauthorized modifications" },
  { id: "5", label: "Download/deployment integrity evidence (source validation, checksum verification)" },
  { id: "6", label: "Alert configuration and analysis for integrity violations" },
  { id: "7", label: "Recent and historical integrity check results" },
  { id: "8", label: "Application whitelisting policy — only authorized SWIFT applications running" },
  { id: "9", label: "Software version verification against SWIFT-approved versions" },
  { id: "10", label: "Application configuration integrity vs approved baseline" },
];

export const E4_FIELDS: FieldDef[] = [
  {
    key: "integrity_tool_name",
    label: "Integrity Verification Tool / Method",
    type: "text",
    placeholder: "e.g. Tripwire Enterprise 9.x, OSSEC 3.7, AIDE, SWIFT product built-in integrity check",
  },
  {
    key: "swift_component_coverage",
    label: "SWIFT Components Covered by Integrity Checks",
    type: "textarea",
    rows: 4,
    placeholder: "List each component and verification status:\n• Connector: verified\n• GUI: verified\n• Messaging Interface: verified\n• Communication Interface: verified\n• Local RMA: verified\n• SNL: verified",
  },
  {
    key: "hsm_firmware_integrity",
    label: "HSM Firmware Integrity Verification",
    type: "select",
    options: [
      "Verified — firmware hash matches vendor-published value",
      "Verified — using HSM self-test/attestation feature",
      "Partially verified — not all HSMs checked",
      "Not verified",
      "Not applicable — no HSM in scope",
    ],
  },
  {
    key: "check_frequency",
    label: "Integrity Check Frequency",
    type: "select",
    options: [
      "At startup + daily (or more frequent)",
      "At startup + weekly",
      "Daily only (no startup check)",
      "Weekly or less frequent",
      "Ad-hoc / manual only",
      "Not configured",
    ],
  },
  {
    key: "baseline_comparison_status",
    label: "Baseline Comparison — Last Result",
    type: "select",
    options: [
      "All components match baseline — no unauthorized modifications",
      "Minor deviations — investigated and resolved",
      "Deviations detected — investigation in progress",
      "Deviations detected — not yet investigated",
      "Baseline not established",
    ],
  },
  {
    key: "last_integrity_check_date",
    label: "Last Integrity Check Date",
    type: "date",
  },
  {
    key: "download_deployment_integrity",
    label: "Download / Deployment Integrity Verification",
    type: "select",
    options: [
      "Source validated + checksum verified for all installations/updates",
      "Checksum verified but source not formally validated",
      "Source validated but no checksum verification",
      "No download/deployment integrity verification",
    ],
  },
  {
    key: "integrity_violation_alerting",
    label: "Integrity Violation Alert Configuration",
    type: "select",
    options: [
      "Automated alerts to SIEM + SOC on any integrity deviation",
      "Automated alerts to SIEM only",
      "Email alerts to system administrators",
      "Alerts generated but not monitored",
      "No alerting configured",
    ],
  },
  {
    key: "integrity_results_history",
    label: "Recent & Historical Integrity Check Results",
    type: "textarea",
    rows: 3,
    placeholder: "Summarise recent results, e.g.: Last 90 days — 90 daily checks completed, 0 unauthorized modifications detected, 2 planned changes matched change records.",
  },
  {
    key: "application_whitelisting_status",
    label: "Application Whitelisting Enforcement",
    type: "select",
    options: [
      "Enforced — only authorised SWIFT applications can execute",
      "Audit mode — unauthorised applications logged but not blocked",
      "Partially enforced — whitelisting on some systems only",
      "Not implemented",
    ],
  },
  {
    key: "swift_version_compliance",
    label: "Software Version Matches SWIFT-Approved Versions",
    type: "select",
    options: [
      "All components on current SWIFT-approved versions",
      "Most components current — upgrade planned for remainder",
      "Some components on older but supported versions",
      "Components on unsupported/unapproved versions",
    ],
  },
  {
    key: "config_integrity_vs_baseline",
    label: "Application Configuration Integrity vs Approved Baseline",
    type: "select",
    options: [
      "All configurations match approved baseline — no deviations",
      "Minor deviations documented and accepted",
      "Deviations present — not yet reviewed or accepted",
      "No approved configuration baseline exists",
    ],
  },
  {
    key: "whitelisting_tool",
    label: "Whitelisting / Application Control Tool",
    type: "text",
    required: false,
    placeholder: "e.g. AppLocker, Carbon Black App Control, Ivanti Application Control, CrowdStrike Falcon",
  },
  {
    key: "additional_notes",
    label: "Additional Notes or Known Gaps",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Describe any components not yet covered, pending remediations, or compensating controls",
  },
];

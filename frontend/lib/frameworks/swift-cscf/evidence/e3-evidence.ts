import type { FieldDef } from "@/components/domain/generic-intake-form";

export const E3_EVIDENCE_ITEM_ID = "E3";

export const E3_UPLOAD_GUIDANCE = [
  { id: "1", label: "List of detection/alert rules configured for SWIFT-relevant scenarios" },
  { id: "2", label: "Authentication anomaly rules (failed logins, brute force, account lockout)" },
  { id: "3", label: "Privilege escalation detection rules (unauthorized admin, sudo abuse)" },
  { id: "4", label: "SWIFT application alert rules (transaction anomalies, integrity failures)" },
  { id: "5", label: "Network anomaly rules (unexpected traffic, zone boundary violations)" },
  { id: "6", label: "Malware detection alert forwarding from AV/EDR to SIEM" },
  { id: "7", label: "Alert response procedures: triage, escalation, and resolution workflows" },
  { id: "8", label: "Alert testing evidence (fire drill, simulated attack, rule validation)" },
  { id: "9", label: "False positive management process and tuning records" },
  { id: "10", label: "Notification mechanism configuration (email, SMS, dashboard, ticketing)" },
];

export const E3_FIELDS: FieldDef[] = [
  {
    key: "total_swift_alert_rules",
    label: "Total SWIFT-Specific Detection / Alert Rules Configured",
    type: "text",
    placeholder: "e.g. 42 active rules across authentication, privilege, application, and network categories",
  },
  {
    key: "auth_anomaly_detection",
    label: "Authentication Anomaly Detection Rules",
    type: "select",
    options: [
      "Comprehensive — failed logins, brute force, lockout, impossible travel",
      "Standard — failed logins and brute force only",
      "Basic — single threshold on failed logins",
      "Not configured",
    ],
  },
  {
    key: "privilege_escalation_detection",
    label: "Privilege Escalation Detection Rules",
    type: "select",
    options: [
      "Comprehensive — unauthorized admin, sudo/UAC abuse, group membership changes",
      "Standard — sudo/UAC escalation alerts only",
      "Basic — limited privilege monitoring",
      "Not configured",
    ],
  },
  {
    key: "swift_application_alerts",
    label: "SWIFT Application Alert Rules",
    type: "select",
    options: [
      "Comprehensive — transaction anomalies, integrity failures, config changes, login events",
      "Standard — transaction anomalies and integrity failures",
      "Basic — limited application-level alerting",
      "Not configured",
    ],
  },
  {
    key: "network_anomaly_detection",
    label: "Network Anomaly Detection Rules",
    type: "select",
    options: [
      "Comprehensive — unexpected traffic, zone boundary violations, port scans, lateral movement",
      "Standard — zone boundary violations and unexpected traffic",
      "Basic — limited network monitoring rules",
      "Not configured",
    ],
  },
  {
    key: "malware_alert_forwarding",
    label: "Malware Alert Forwarding (AV/EDR to SIEM)",
    type: "select",
    options: [
      "All AV/EDR detections forwarded to SIEM in real-time",
      "Most detections forwarded — some sources not integrated",
      "Forwarded on schedule (not real-time)",
      "Not forwarded — alerts remain in AV/EDR console only",
    ],
  },
  {
    key: "alert_response_procedures",
    label: "Alert Response Procedures (Triage, Escalation, Resolution)",
    type: "select",
    options: [
      "Documented and tested — triage, escalation matrix, and resolution workflows in place",
      "Documented but not recently tested",
      "Informal procedures — not formally documented",
      "No response procedures defined",
    ],
  },
  {
    key: "alert_testing_evidence",
    label: "Alert Rule Testing & Validation",
    type: "select",
    options: [
      "Regular testing (quarterly or more) — fire drills, simulated attacks",
      "Annual testing performed",
      "Tested at initial deployment only",
      "Never tested",
    ],
  },
  {
    key: "last_alert_test_date",
    label: "Last Alert Test / Validation Date",
    type: "date",
  },
  {
    key: "false_positive_management",
    label: "False Positive Management & Tuning",
    type: "select",
    options: [
      "Active tuning process — regular FP review, documented suppression rationale",
      "Ad-hoc tuning — FPs addressed as reported",
      "No tuning — high FP rate acknowledged",
      "Not applicable — no alerts generating FPs",
    ],
  },
  {
    key: "notification_mechanisms",
    label: "Alert Notification Mechanisms",
    type: "textarea",
    rows: 3,
    placeholder: "List all configured channels, e.g.:\n• Email to SOC distribution list\n• SMS to on-call analyst\n• SIEM dashboard with real-time display\n• Ticketing system (ServiceNow/Jira) auto-creation",
  },
  {
    key: "alert_review_frequency",
    label: "Alert Review Frequency",
    type: "select",
    options: [
      "Real-time / continuous SOC monitoring",
      "Daily review of alert queue",
      "Weekly review",
      "Monthly or less frequent",
      "No regular review process",
    ],
  },
  {
    key: "additional_notes",
    label: "Additional Notes or Known Gaps",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Describe any rule coverage gaps, unmonitored scenarios, or planned improvements",
  },
];

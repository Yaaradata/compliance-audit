import type { FieldDef } from "@/components/domain/generic-intake-form";

export const D5_EVIDENCE_ITEM_ID = "D5";

export const D5_UPLOAD_GUIDANCE = [
  { id: "1", label: "Remediation tracking log for ALL vulnerability scan findings from D4 (CVE, system, CVSS, status)" },
  { id: "2", label: "Remediation actions per finding: patch applied, config change, compensating control, or risk acceptance" },
  { id: "3", label: "Timeline per finding: date identified, target remediation date, actual completion date" },
  { id: "4", label: "Risk-accepted items with formal approval, business justification, and scheduled review date" },
  { id: "5", label: "Summary metrics: total open, critical open, avg time to remediate" },
  { id: "6", label: "Remediation tracking log for ALL pen test findings from D6 (finding ID, severity, affected component)" },
  { id: "7", label: "Remediation actions with supporting evidence for each pen test finding" },
  { id: "8", label: "Retest results confirming successful remediation of pen test findings" },
  { id: "9", label: "Evidence that pen test findings feed back into the security update process" },
];

export const D5_FIELDS: FieldDef[] = [
  {
    key: "scan_total_findings_tracked",
    label: "Total vulnerability scan findings tracked from D4",
    type: "text",
    placeholder: "e.g. 48 findings from latest scan cycle",
  },
  {
    key: "scan_critical_open_count",
    label: "Critical scan findings still open (CVSS 9.0+)",
    type: "text",
    placeholder: "e.g. 0 of 2 critical findings remain open",
  },
  {
    key: "scan_high_open_count",
    label: "High scan findings still open (CVSS 7.0–8.9)",
    type: "text",
    placeholder: "e.g. 1 of 8 high findings remain open",
  },
  {
    key: "scan_critical_sla_status",
    label: "Critical findings SLA compliance (resolved within 1 month)",
    type: "select",
    options: [
      "All critical resolved within 1 month",
      "Most resolved within 1 month — few slightly overdue",
      "Some overdue beyond 1 month",
      "Significant overdue critical findings",
      "No critical findings identified",
    ],
  },
  {
    key: "scan_high_sla_status",
    label: "High findings SLA compliance (resolved within 3 months)",
    type: "select",
    options: [
      "All high resolved within 3 months",
      "Most resolved within 3 months — few slightly overdue",
      "Some overdue beyond 3 months",
      "Significant overdue high findings",
      "No high findings identified",
    ],
  },
  {
    key: "scan_avg_remediation_days",
    label: "Average time to remediate scan findings (days)",
    type: "text",
    placeholder: "e.g. Critical: 14 days avg, High: 42 days avg, Medium: 78 days avg",
  },
  {
    key: "scan_remediation_actions",
    label: "Remediation actions used for scan findings",
    type: "textarea",
    rows: 3,
    placeholder: "Describe actions: patches applied (count), configuration changes (count), compensating controls (count), risk acceptances (count). Include examples of each.",
  },
  {
    key: "scan_risk_accepted_items",
    label: "Risk-accepted scan findings (formal approval required)",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Per risk-accepted item: CVE/finding ID, affected system, business justification, approver name/role, approval date, scheduled review date",
  },
  {
    key: "remediation_owner_assignment",
    label: "Remediation owner assignment",
    type: "select",
    options: [
      "All findings have assigned owners with accountability",
      "Most findings have owners — some unassigned",
      "Owners assigned for critical/high only",
      "No formal owner assignment process",
    ],
  },
  {
    key: "pentest_total_findings_tracked",
    label: "Total pen test findings tracked from D6",
    type: "text",
    placeholder: "e.g. 12 findings from latest penetration test",
  },
  {
    key: "pentest_critical_high_status",
    label: "Pen test critical/high findings remediation status",
    type: "select",
    options: [
      "All critical/high findings remediated and retested",
      "All critical/high remediated — retest pending",
      "Some critical/high findings still in progress",
      "Critical/high findings not yet addressed",
      "No critical/high pen test findings",
    ],
  },
  {
    key: "pentest_remediation_details",
    label: "Pen test finding remediation details",
    type: "textarea",
    rows: 3,
    placeholder: "Per finding: finding ID, severity, affected component, remediation action taken, evidence of fix, remediation date",
  },
  {
    key: "pentest_retest_status",
    label: "Pen test retest status",
    type: "select",
    options: [
      "All remediated findings retested and confirmed fixed",
      "Retest completed for critical/high — others pending",
      "Retest partially completed",
      "Retest not yet performed",
    ],
  },
  {
    key: "pentest_retest_details",
    label: "Retest results and timeline",
    type: "textarea",
    rows: 3,
    placeholder: "Per retested finding: finding ID, original finding date, remediation date, retest date, retest result (pass/fail). Note any findings that failed retest.",
  },
  {
    key: "pentest_feedback_to_security_updates",
    label: "Pen test findings feeding back into security update process",
    type: "select",
    options: [
      "Formal process — all findings feed into patch/update cycle",
      "Ad-hoc — some findings trigger updates",
      "No formal feedback mechanism",
    ],
  },
  {
    key: "known_gaps",
    label: "Known gaps in remediation tracking",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Any gaps: untracked findings, missing owner assignments, overdue items without escalation, incomplete retest coverage",
  },
];

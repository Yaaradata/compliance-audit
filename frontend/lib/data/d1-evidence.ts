import type { FieldDef } from "@/components/domain/generic-intake-form";

export const D1_EVIDENCE_ITEM_ID = "D1";

export const D1_UPLOAD_GUIDANCE = [
  { id: "1", label: "Approved patch management policy document with version control" },
  { id: "2", label: "Vendor support lifecycle monitoring procedures and tracking" },
  { id: "3", label: "Risk assessment process for evaluating security updates" },
  { id: "4", label: "Deployment timelines by criticality (Critical ≤1mo, High ≤3mo)" },
  { id: "5", label: "Source/integrity validation procedures (checksum, legitimate source)" },
  { id: "6", label: "Pre-production testing requirements and procedures" },
  { id: "7", label: "Emergency/zero-day patching process with expedited timelines" },
  { id: "8", label: "Scope statement covering all in-scope components (servers, PCs, jump servers, network devices, HSM, virtualisation)" },
  { id: "9", label: "SWIFT mandatory update compliance procedures within vendor deadline" },
];

export const D1_FIELDS: FieldDef[] = [
  {
    key: "policy_version_date",
    label: "Policy version / approval date",
    type: "date",
    placeholder: "Date the current policy version was approved",
  },
  {
    key: "policy_owner",
    label: "Policy owner (role/name)",
    type: "text",
    placeholder: "e.g. Head of IT Security — John Smith",
  },
  {
    key: "vendor_lifecycle_monitoring",
    label: "Vendor support lifecycle monitoring approach",
    type: "select",
    options: [
      "Automated tracking for all software/hardware",
      "Manual tracking with scheduled reviews",
      "Partially tracked — some systems only",
      "No formal tracking in place",
    ],
  },
  {
    key: "swift_update_deadline_compliance",
    label: "SWIFT mandatory update compliance within vendor deadline",
    type: "select",
    options: [
      "Always applied within vendor deadline",
      "Usually applied within deadline (>90%)",
      "Sometimes delayed beyond deadline",
      "No formal process to track vendor deadlines",
    ],
  },
  {
    key: "risk_assessment_process",
    label: "Risk assessment process for security updates",
    type: "textarea",
    rows: 3,
    placeholder: "Describe how updates are assessed: vendor criticality rating, exposure level, mitigating controls, operational impact evaluation",
  },
  {
    key: "critical_patch_timeline",
    label: "Deployment timeline — Critical (CVSS 9.0+)",
    type: "select",
    options: [
      "Within 1 month (CSCF compliant)",
      "Within 2 months",
      "Within 3 months",
      "No defined timeline",
    ],
  },
  {
    key: "high_patch_timeline",
    label: "Deployment timeline — High (CVSS 7.0–8.9)",
    type: "select",
    options: [
      "Within 3 months (CSCF compliant)",
      "Within 6 months",
      "Longer than 6 months",
      "No defined timeline",
    ],
  },
  {
    key: "low_medium_patch_timeline",
    label: "Deployment timeline — Low/Medium severity",
    type: "text",
    placeholder: "e.g. Within 6 months, next maintenance window, risk-based",
  },
  {
    key: "source_integrity_validation",
    label: "Source and integrity validation method",
    type: "select",
    options: [
      "Legitimate source verified + checksum/signature validated",
      "Legitimate source verified only",
      "Checksum/signature validated only",
      "No formal validation process",
    ],
  },
  {
    key: "testing_before_production",
    label: "Pre-production testing requirement",
    type: "select",
    options: [
      "Mandatory testing in staging/test environment for all patches",
      "Mandatory for critical systems, optional for others",
      "Recommended but not enforced",
      "No testing requirement defined",
    ],
  },
  {
    key: "emergency_patching_process",
    label: "Emergency / zero-day patching process",
    type: "textarea",
    rows: 3,
    placeholder: "Describe expedited process: who authorises, shortened testing, accelerated deployment timeline, communication plan",
  },
  {
    key: "scope_coverage",
    label: "Policy scope — in-scope component types covered",
    type: "select",
    options: [
      "All in-scope types (servers, PCs, jump servers, network devices, HSM, virtualisation)",
      "Most types covered — some gaps",
      "Only servers and PCs covered",
      "Scope not clearly defined",
    ],
  },
  {
    key: "scope_component_details",
    label: "In-scope component types explicitly listed in policy",
    type: "textarea",
    rows: 3,
    placeholder: "List all component types covered: SWIFT servers, operator PCs, jump servers, firewalls/routers, HSMs, virtualisation hosts, dedicated PCs, etc.",
  },
  {
    key: "known_gaps",
    label: "Known gaps or deviations from policy requirements",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Describe any known gaps, planned improvements, or deviations from the documented policy",
  },
];

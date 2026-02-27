import type { FieldDef } from "@/components/domain/generic-intake-form";

export const D3_EVIDENCE_ITEM_ID = "D3";

export const D3_UPLOAD_GUIDANCE = [
  { id: "1", label: "12-month patch deployment log (patch ID, vendor severity, CVSS score)" },
  { id: "2", label: "Dates for each patch: vendor release date, testing date, production deployment date" },
  { id: "3", label: "Systems patched per deployment (matching A2 inventory hostnames)" },
  { id: "4", label: "Deployment method records (automated/manual per patch)" },
  { id: "5", label: "Post-deployment verification evidence (successful install confirmation)" },
  { id: "6", label: "Source validation evidence (legitimate source, integrity check/checksum)" },
  { id: "7", label: "Emergency patching records with expedited timelines" },
  { id: "8", label: "Failed deployment records with rollback and remediation details" },
];

export const D3_FIELDS: FieldDef[] = [
  {
    key: "reporting_period_start",
    label: "Reporting period start date",
    type: "date",
  },
  {
    key: "reporting_period_end",
    label: "Reporting period end date",
    type: "date",
  },
  {
    key: "total_patches_deployed",
    label: "Total patches deployed in period",
    type: "text",
    placeholder: "e.g. 87 patches deployed across all in-scope systems",
  },
  {
    key: "deployment_method",
    label: "Primary deployment method",
    type: "select",
    options: [
      "Fully automated (WSUS/SCCM/Ansible etc.)",
      "Mostly automated with some manual",
      "Mixed automated and manual",
      "Primarily manual deployment",
    ],
  },
  {
    key: "critical_patch_avg_deploy_days",
    label: "Average deployment time — Critical patches (CVSS 9.0+)",
    type: "text",
    placeholder: "e.g. 12 days from vendor release to production",
  },
  {
    key: "critical_patch_sla_compliance",
    label: "Critical patch SLA compliance (within 1 month)",
    type: "select",
    options: [
      "100% deployed within 1 month",
      "90–99% within 1 month",
      "75–89% within 1 month",
      "Below 75% within 1 month",
      "No critical patches in period",
    ],
  },
  {
    key: "high_patch_avg_deploy_days",
    label: "Average deployment time — High patches (CVSS 7.0–8.9)",
    type: "text",
    placeholder: "e.g. 45 days from vendor release to production",
  },
  {
    key: "high_patch_sla_compliance",
    label: "High patch SLA compliance (within 3 months)",
    type: "select",
    options: [
      "100% deployed within 3 months",
      "90–99% within 3 months",
      "75–89% within 3 months",
      "Below 75% within 3 months",
      "No high patches in period",
    ],
  },
  {
    key: "source_validation_method",
    label: "Source and integrity validation for deployed patches",
    type: "select",
    options: [
      "All patches verified — legitimate source + checksum/signature",
      "Source verified for all — checksum for most",
      "Source verified only — no integrity check",
      "No formal validation performed",
    ],
  },
  {
    key: "testing_evidence",
    label: "Pre-production testing records",
    type: "textarea",
    rows: 3,
    placeholder: "Describe testing approach: test environment used, test cases run, approval process before production deployment, any patches deployed without testing and reason",
  },
  {
    key: "post_deployment_verification",
    label: "Post-deployment verification approach",
    type: "select",
    options: [
      "Verified for all deployments (scan/report confirms install)",
      "Verified for most deployments (>90%)",
      "Spot-check verification only",
      "No formal post-deployment verification",
    ],
  },
  {
    key: "emergency_patching_records",
    label: "Emergency / zero-day patching records",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "For each emergency patch: patch ID/CVE, date identified, expedited timeline, deployment date, systems affected, any testing shortcuts taken",
  },
  {
    key: "failed_deployments",
    label: "Failed deployments and rollback records",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "For each failure: patch ID, affected systems, failure reason, rollback performed (Y/N), remediation action, final resolution date",
  },
  {
    key: "system_types_covered",
    label: "In-scope system types included in deployment records",
    type: "textarea",
    rows: 2,
    placeholder: "Confirm coverage: SWIFT servers, operator PCs, jump servers, network devices (firewalls/routers), HSMs, virtualisation hosts. Note any exclusions.",
  },
  {
    key: "known_gaps",
    label: "Known gaps or issues in deployment records",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Any gaps in records, missing months, systems not covered, or process improvements needed",
  },
];

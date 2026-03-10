import type { FieldDef } from "@/components/domain/generic-intake-form";

export const D2_EVIDENCE_ITEM_ID = "D2";

export const D2_UPLOAD_GUIDANCE = [
  { id: "1", label: "Patch status report per in-scope system (hostname/IP matching A2 inventory)" },
  { id: "2", label: "OS name, version, and active vendor support confirmation per system" },
  { id: "3", label: "Last patch date and current patch level per system" },
  { id: "4", label: "Outstanding patches with reasons (testing, compatibility, risk-accepted)" },
  { id: "5", label: "SWIFT application version and mandatory update installation status" },
  { id: "6", label: "Maintenance/licensing contract status for all in-scope systems" },
  { id: "7", label: "Summary: % fully patched, critical outstanding, vendor support expiry dates" },
];

export const D2_FIELDS: FieldDef[] = [
  {
    key: "report_date",
    label: "Patch status report date",
    type: "date",
    placeholder: "Date the patch status data was collected",
  },
  {
    key: "total_systems_in_scope",
    label: "Total in-scope systems (must match A2 inventory)",
    type: "text",
    placeholder: "e.g. 24 systems",
  },
  {
    key: "patch_assessment_tool",
    label: "Tool used for patch assessment",
    type: "text",
    placeholder: "e.g. WSUS, SCCM, Qualys, Nessus, manual review",
  },
  {
    key: "percent_fully_patched",
    label: "Percentage of systems fully patched",
    type: "select",
    options: [
      "100% fully patched",
      "90–99% fully patched",
      "75–89% fully patched",
      "50–74% fully patched",
      "Below 50% fully patched",
    ],
  },
  {
    key: "critical_patches_outstanding",
    label: "Critical patches outstanding (CVSS 9.0+)",
    type: "text",
    placeholder: "e.g. 0 critical patches outstanding across all systems",
  },
  {
    key: "high_patches_outstanding",
    label: "High patches outstanding (CVSS 7.0–8.9)",
    type: "text",
    placeholder: "e.g. 3 high patches pending testing",
  },
  {
    key: "outstanding_patch_reasons",
    label: "Reasons for outstanding patches",
    type: "textarea",
    rows: 3,
    placeholder: "For each outstanding patch: patch ID, affected system, reason (testing in progress, vendor compatibility issue, risk-accepted with approval ref)",
  },
  {
    key: "os_vendor_support_status",
    label: "OS/software vendor support status across systems",
    type: "select",
    options: [
      "All systems running actively supported OS/software",
      "Most supported — 1-2 systems approaching end-of-support",
      "Some systems on extended/end-of-support software",
      "Systems running unsupported/EOL software",
    ],
  },
  {
    key: "systems_approaching_eol",
    label: "Systems approaching or past end-of-support",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "List hostname, OS/software, support expiry date, and migration/mitigation plan",
  },
  {
    key: "swift_application_version",
    label: "SWIFT application version installed",
    type: "text",
    placeholder: "e.g. Alliance Lite2 v3.5.40, Alliance Access 7.6",
  },
  {
    key: "swift_mandatory_update_status",
    label: "SWIFT mandatory update installation status",
    type: "select",
    options: [
      "All mandatory updates applied within vendor deadline",
      "Mandatory updates applied — some slightly delayed",
      "Mandatory updates partially applied",
      "Mandatory updates not yet applied",
    ],
  },
  {
    key: "maintenance_contract_status",
    label: "Maintenance/licensing contract status",
    type: "select",
    options: [
      "All contracts current and active",
      "Most current — 1-2 renewals pending",
      "Some contracts expired or lapsed",
      "Contract status unknown/not tracked",
    ],
  },
  {
    key: "cscf_timeline_compliance",
    label: "CSCF patching timeline compliance (Critical <1mo, High <3mo)",
    type: "select",
    options: [
      "Fully compliant — all patches within CSCF timelines",
      "Mostly compliant — minor deviations with justification",
      "Partially compliant — some patches overdue",
      "Non-compliant — significant overdue patches",
    ],
  },
  {
    key: "patch_compliance_summary",
    label: "Overall patch compliance summary",
    type: "textarea",
    rows: 3,
    placeholder: "Summary: X of Y systems fully patched, Z critical outstanding, N approaching end-of-support. Include any compensating controls for gaps.",
  },
  {
    key: "known_gaps",
    label: "Known gaps or issues",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Any gaps in patch coverage, missing systems, or data quality issues",
  },
];

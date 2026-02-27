import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H5_EVIDENCE_ITEM_ID = "H5";

export const H5_UPLOAD_GUIDANCE = [
  { id: "1", label: "Training completion records for current year: employee name/ID, role, module, completion date, pass/fail" },
  { id: "2", label: "Completion rate statistics (% of required staff)" },
  { id: "3", label: "Non-completion escalation process documentation" },
  { id: "4", label: "Privileged user additional training completion tracking" },
  { id: "5", label: "Third-party/contractor training records (if SWIFT access granted)" },
  { id: "6", label: "Historical training records (2+ prior years) for trend analysis" },
];

export const H5_FIELDS: FieldDef[] = [
  {
    key: "reporting_period",
    label: "Training reporting period",
    type: "text",
    placeholder: "e.g. January 2025 – December 2025",
  },
  {
    key: "total_required_staff",
    label: "Total staff required to complete SWIFT security training",
    type: "text",
    placeholder: "e.g. 45 staff members",
  },
  {
    key: "overall_completion_rate",
    label: "Overall training completion rate",
    type: "select",
    options: [
      "100% — all required staff completed",
      "90-99% — near complete",
      "75-89% — most completed",
      "50-74% — majority completed",
      "<50% — significant non-completion",
    ],
  },
  {
    key: "tracking_details",
    label: "Training tracking details (per-employee records)",
    type: "textarea",
    placeholder: "Describe records maintained: employee name/ID, role (end user vs privileged admin), module(s) completed, completion date, pass/fail status — and where records are stored",
    rows: 3,
  },
  {
    key: "pass_fail_tracking",
    label: "Pass/fail assessment tracking",
    type: "select",
    options: [
      "All modules include assessments with pass/fail tracked",
      "Most modules have assessments — pass/fail tracked",
      "Completion tracked but no pass/fail assessment",
      "No formal tracking of assessment results",
    ],
  },
  {
    key: "privileged_user_completion",
    label: "Privileged/admin user additional training completion",
    type: "select",
    options: [
      "All privileged users completed additional training",
      "Most privileged users completed (>75%)",
      "Some privileged users completed (25-75%)",
      "No additional training tracked for privileged users",
      "Not applicable — no additional privileged user training defined",
    ],
  },
  {
    key: "non_completion_escalation",
    label: "Non-completion escalation process",
    type: "select",
    options: [
      "Automated reminders with management escalation and access restriction",
      "Automated reminders with management escalation",
      "Manual follow-up with non-completers",
      "No escalation process defined",
    ],
  },
  {
    key: "third_party_contractor_training",
    label: "Third-party/contractor training tracked (if SWIFT access granted)",
    type: "select",
    options: [
      "All third-party/contractor staff with SWIFT access trained and tracked",
      "Most tracked — some gaps",
      "Not tracked for third parties/contractors",
      "Not applicable — no third-party SWIFT access",
    ],
  },
  {
    key: "historical_records_available",
    label: "Historical training records available (2+ prior years)",
    type: "select",
    options: [
      "3+ years of historical records available for trend analysis",
      "2 years of historical records available",
      "1 year of historical records only",
      "No historical records available",
    ],
  },
  {
    key: "completion_trend",
    label: "Training completion trend over prior years",
    type: "textarea",
    placeholder: "e.g. 2023: 92% completion, 2024: 97% completion, 2025: 100% — improving trend driven by automated reminders",
    rows: 3,
  },
  {
    key: "known_gaps",
    label: "Known gaps in training completion or tracking",
    type: "textarea",
    required: false,
    placeholder: "Describe any non-completers, tracking deficiencies, missing contractor records, or planned improvements",
    rows: 3,
  },
];

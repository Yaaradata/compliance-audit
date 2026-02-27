import type { FieldDef } from "@/components/domain/generic-intake-form";

export const F3_EVIDENCE_ITEM_ID = "F3";

export const F3_UPLOAD_GUIDANCE = [
  { id: "1", label: "Security risk assessment report for each critical-activity third party" },
  { id: "2", label: "Evidence assessment was conducted at engagement start and reviewed regularly" },
  { id: "3", label: "Assessment scope covering outsourced activities and vendor security posture" },
  { id: "4", label: "Assessment content: security controls, certifications, gaps, risk rating, remediation/risk acceptance" },
  { id: "5", label: "Alignment with SWIFT OASRB (Outsourced Agent Security Requirements Baseline)" },
  { id: "6", label: "Assessor independence documentation" },
];

export const F3_FIELDS: FieldDef[] = [
  {
    key: "total_assessments_conducted",
    label: "Number of critical-activity third parties assessed",
    type: "text",
    placeholder: "e.g. 4 out of 5 critical-activity vendors assessed",
  },
  {
    key: "assessment_coverage",
    label: "Assessment coverage of critical-activity third parties",
    type: "select",
    options: [
      "All critical-activity third parties assessed",
      "Most assessed (>75%)",
      "Some assessed (25-75%)",
      "Few assessed (<25%)",
      "None assessed",
    ],
  },
  {
    key: "initial_assessment_timing",
    label: "Assessment conducted at engagement start",
    type: "select",
    options: [
      "All vendors assessed before or at engagement",
      "Most vendors assessed at engagement",
      "Assessments conducted post-engagement",
      "No initial assessments performed",
    ],
  },
  {
    key: "review_frequency",
    label: "Regular review frequency of assessments",
    type: "select",
    options: [
      "Annually",
      "Every 2 years",
      "Ad hoc / event-driven only",
      "No regular review schedule",
    ],
  },
  {
    key: "assessment_scope_details",
    label: "Scope of assessments (outsourced activities and security posture)",
    type: "textarea",
    placeholder: "Describe what each assessment covers: specific outsourced SWIFT activities, vendor security controls, infrastructure, personnel, incident response capabilities",
    rows: 4,
  },
  {
    key: "security_controls_reviewed",
    label: "Security controls and certifications evaluated per vendor",
    type: "textarea",
    placeholder: "List security controls reviewed, certifications held (SOC2, ISO 27001, etc.), gaps identified, and risk ratings assigned",
    rows: 4,
  },
  {
    key: "risk_rating_methodology",
    label: "Risk rating methodology used",
    type: "select",
    options: [
      "Quantitative scoring with defined risk levels",
      "Qualitative assessment (High/Medium/Low)",
      "Pass/Fail against defined criteria",
      "No formal risk rating applied",
    ],
  },
  {
    key: "remediation_tracking",
    label: "Gap remediation or risk acceptance documented",
    type: "select",
    options: [
      "All gaps have remediation plans or formal risk acceptance",
      "Most gaps tracked with remediation timelines",
      "Some gaps documented without clear remediation",
      "No remediation tracking",
    ],
  },
  {
    key: "oasrb_alignment",
    label: "Alignment with SWIFT OASRB requirements",
    type: "select",
    options: [
      "Fully aligned — all OASRB requirements covered",
      "Mostly aligned — minor gaps",
      "Partially aligned — significant gaps",
      "Not aligned or not assessed against OASRB",
    ],
  },
  {
    key: "assessor_independence",
    label: "Assessor independence",
    type: "select",
    options: [
      "Independent third-party assessor",
      "Internal team independent from vendor relationship",
      "Internal team with vendor relationship involvement",
      "Self-assessed by the vendor only",
    ],
  },
  {
    key: "latest_assessment_date",
    label: "Date of most recent assessment",
    type: "date",
  },
  {
    key: "next_review_date",
    label: "Next scheduled assessment review date",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known gaps or assessment deficiencies",
    type: "textarea",
    required: false,
    placeholder: "Describe any vendors not yet assessed, assessment scope limitations, or planned improvements",
    rows: 3,
  },
];

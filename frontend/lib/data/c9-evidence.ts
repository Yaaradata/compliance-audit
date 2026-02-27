import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C9_EVIDENCE_ITEM_ID = "C9";

export const C9_UPLOAD_GUIDANCE = [
  { id: "1", label: "Screening process documentation for ALL staff with operational/admin access (employees, agents, consultants, contractors)" },
  { id: "2", label: "Initial screening evidence: identity verification, qualifications, employment history, civil/criminal check, conflict of interest, financial credit" },
  { id: "3", label: "Periodic re-screening records (at least every 5 years): pending proceedings, conflict of interest re-validation" },
  { id: "4", label: "Screening records with date, type, result, and next due date" },
  { id: "5", label: "Catch-up plan for any unscreened staff" },
  { id: "6", label: "Compliance with local screening laws documented" },
];

export const C9_FIELDS: FieldDef[] = [
  {
    key: "screening_policy_date",
    label: "Screening policy approval / version date",
    type: "date",
  },
  {
    key: "screening_policy_owner",
    label: "Screening policy owner",
    type: "text",
    placeholder: "e.g. HR Director, Chief Compliance Officer",
  },
  {
    key: "personnel_scope",
    label: "Personnel scope covered by screening",
    type: "select",
    options: [
      "All categories (employees, agents, consultants, contractors)",
      "Employees and contractors only",
      "Employees only",
      "Incomplete scope",
    ],
  },
  {
    key: "initial_screening_checks",
    label: "Initial screening checks performed",
    type: "textarea",
    placeholder: "List checks: identity verification, qualifications, employment history, civil/criminal background, conflict of interest, financial/credit check. Note any checks not performed and why",
    rows: 4,
  },
  {
    key: "initial_screening_coverage",
    label: "Percentage of in-scope staff with completed initial screening",
    type: "select",
    options: ["100%", "90–99%", "75–89%", "50–74%", "Below 50%"],
  },
  {
    key: "rescreening_frequency",
    label: "Periodic re-screening frequency",
    type: "select",
    options: [
      "Every 3 years",
      "Every 5 years",
      "Upon role change only",
      "Not scheduled",
    ],
  },
  {
    key: "rescreening_checks",
    label: "Re-screening checks performed",
    type: "textarea",
    placeholder: "Describe re-screening checks: pending civil/criminal proceedings, conflict of interest re-validation, updated financial/credit check, etc.",
    rows: 3,
  },
  {
    key: "screening_record_completeness",
    label: "Screening record completeness (date, type, result, next due date)",
    type: "select",
    options: [
      "All fields documented for all staff",
      "Most fields documented",
      "Some fields incomplete",
      "Significant gaps",
    ],
  },
  {
    key: "total_screened_staff",
    label: "Total number of screened in-scope staff",
    type: "text",
    placeholder: "e.g. 45",
  },
  {
    key: "total_unscreened_staff",
    label: "Total number of unscreened in-scope staff (if any)",
    type: "text",
    placeholder: "e.g. 3 (pending new hires)",
  },
  {
    key: "catchup_plan",
    label: "Catch-up plan for unscreened staff",
    type: "textarea",
    required: false,
    placeholder: "Describe plan and timeline for completing screening of any unscreened staff. State 'Not applicable' if all staff are screened",
    rows: 3,
  },
  {
    key: "local_law_compliance",
    label: "Compliance with local screening laws documented",
    type: "select",
    options: [
      "Yes — fully documented with legal review",
      "Partially documented",
      "Not documented",
    ],
  },
  {
    key: "last_review_date",
    label: "Last screening records review date",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any screening gaps, overdue re-screenings, or planned improvements",
    rows: 3,
  },
];

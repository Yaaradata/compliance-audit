import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C5_EVIDENCE_ITEM_ID = "C5";

export const C5_UPLOAD_GUIDANCE = [
  { id: "1", label: "Access review reports with review date, scope, and reviewer name/authority" },
  { id: "2", label: "Review methodology (comparison of current access vs. approved access)" },
  { id: "3", label: "Findings documented: accounts to remove, roles to adjust, exceptions" },
  { id: "4", label: "Remediation actions taken with completion dates" },
  { id: "5", label: "Privileged account extra scrutiny evidence" },
  { id: "6", label: "Provider/third-party account review aligned with engagement" },
  { id: "7", label: "Emergency/break-glass account usage reviewed" },
  { id: "8", label: "Coverage across application, OS, and provider accounts" },
];

export const C5_FIELDS: FieldDef[] = [
  {
    key: "last_review_date",
    label: "Most recent access review date",
    type: "date",
  },
  {
    key: "review_frequency",
    label: "Access review frequency",
    type: "select",
    options: ["Quarterly", "Semi-annually", "Annually", "Ad hoc"],
  },
  {
    key: "review_scope",
    label: "Scope of access review (systems, account types, populations)",
    type: "textarea",
    placeholder: "Describe which systems, account types, and user populations were included in the review",
    rows: 3,
  },
  {
    key: "reviewer_name_authority",
    label: "Reviewer name and authority",
    type: "text",
    placeholder: "e.g. Jane Doe, IT Security Manager",
  },
  {
    key: "review_methodology",
    label: "Review methodology used",
    type: "textarea",
    placeholder: "Describe how current access was compared against approved access (e.g., export from IAM system vs. approved role matrix)",
    rows: 3,
  },
  {
    key: "findings_summary",
    label: "Findings: accounts to remove, roles to adjust, exceptions",
    type: "textarea",
    placeholder: "Summarise findings — number of accounts flagged for removal, roles needing adjustment, and any exceptions granted",
    rows: 3,
  },
  {
    key: "remediation_actions",
    label: "Remediation actions taken with completion dates",
    type: "textarea",
    placeholder: "List actions taken (account removals, role changes, etc.) with completion dates",
    rows: 3,
  },
  {
    key: "privileged_account_scrutiny",
    label: "Extra scrutiny applied to privileged accounts",
    type: "select",
    options: [
      "Yes — enhanced review with additional validation",
      "Standard review applied to all accounts equally",
      "Privileged accounts not separately reviewed",
    ],
  },
  {
    key: "provider_account_review",
    label: "Provider/third-party accounts reviewed and aligned with engagement",
    type: "select",
    options: [
      "Yes — all reviewed and aligned",
      "Partially reviewed",
      "Not reviewed",
      "No provider accounts in scope",
    ],
  },
  {
    key: "emergency_account_review",
    label: "Emergency/break-glass account usage reviewed",
    type: "select",
    options: [
      "Yes — usage reviewed and all uses justified",
      "Reviewed — some unjustified uses found",
      "Not reviewed",
      "No emergency accounts in scope",
    ],
  },
  {
    key: "account_type_coverage",
    label: "Account type coverage in review",
    type: "select",
    options: [
      "Application, OS, and provider accounts",
      "Application and OS only",
      "Application only",
      "Incomplete coverage",
    ],
  },
  {
    key: "next_review_date",
    label: "Next scheduled review date",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any gaps in review coverage, overdue actions, or planned improvements",
    rows: 3,
  },
];

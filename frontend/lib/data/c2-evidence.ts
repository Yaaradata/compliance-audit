import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C2_EVIDENCE_ITEM_ID = "C2";

export const C2_UPLOAD_GUIDANCE = [
  { id: "1", label: "Complete inventory of ALL privileged accounts per in-scope system (account name, system/hostname, account type)" },
  { id: "2", label: "OS-type specific accounts listed: Windows (Enterprise/Domain/Local Admins), Linux (root), Network (admin/root), HSM (admin), VM (super admin)" },
  { id: "3", label: "Business justification documented per account" },
  { id: "4", label: "Owner/assignee per account with built-in admin accounts marked as break-glass" },
  { id: "5", label: "Service accounts documented with minimal privilege justification" },
  { id: "6", label: "Third-party/vendor admin accounts flagged and tracked" },
  { id: "7", label: "Cross-reference with RBAC roles defined in C4" },
  { id: "8", label: "Evidence of quarterly/annual review (date, reviewer, actions taken)" },
  { id: "9", label: "Stale/orphan account identification and removal evidence" },
];

export const C2_FIELDS: FieldDef[] = [
  {
    key: "total_privileged_accounts",
    label: "Total privileged account count",
    type: "text",
    placeholder: "e.g. 42",
  },
  {
    key: "inventory_last_updated",
    label: "Date inventory was last updated",
    type: "date",
  },
  {
    key: "systems_covered",
    label: "Systems/hostnames included in the inventory",
    type: "textarea",
    placeholder: "List all in-scope systems with hostnames (SWIFT servers, VMs, network devices, HSM, etc.)",
    rows: 3,
  },
  {
    key: "os_account_coverage",
    label: "OS-type specific privileged account coverage",
    type: "select",
    options: [
      "All types covered (Windows, Linux, Network, HSM, VM)",
      "Most types covered",
      "Some types covered",
      "Not broken down by OS type",
    ],
  },
  {
    key: "account_justification_status",
    label: "Business justification documented per account",
    type: "select",
    options: [
      "All accounts have documented justification",
      "Most accounts justified",
      "Some accounts lack justification",
      "Not documented",
    ],
  },
  {
    key: "builtin_admin_handling",
    label: "Built-in/default admin accounts handling",
    type: "select",
    options: [
      "All marked as break-glass with restricted use",
      "Some marked as break-glass",
      "Not addressed",
    ],
  },
  {
    key: "service_account_privileges",
    label: "Service accounts documented with minimal privileges",
    type: "select",
    options: [
      "All documented with minimal privilege verification",
      "Most documented",
      "Some documented",
      "Not assessed",
    ],
  },
  {
    key: "third_party_accounts_flagged",
    label: "Third-party/vendor admin accounts identified and tracked",
    type: "select",
    options: [
      "Yes — all flagged with engagement details",
      "Partially identified",
      "Not identified",
      "No third-party accounts exist",
    ],
  },
  {
    key: "rbac_cross_reference",
    label: "Accounts cross-referenced with RBAC roles (C4)",
    type: "select",
    options: [
      "Fully cross-referenced",
      "Partially cross-referenced",
      "Not cross-referenced",
    ],
  },
  {
    key: "review_frequency",
    label: "Privileged account inventory review frequency",
    type: "select",
    options: ["Quarterly", "Semi-annually", "Annually", "Ad hoc", "Not scheduled"],
  },
  {
    key: "last_review_date",
    label: "Last review date",
    type: "date",
  },
  {
    key: "reviewer_name",
    label: "Reviewer name / authority",
    type: "text",
    placeholder: "e.g. John Smith, IT Security Manager",
  },
  {
    key: "stale_accounts_status",
    label: "Stale/orphan accounts identified and actions taken",
    type: "textarea",
    placeholder: "Describe stale/orphan accounts found, removal actions, and completion dates",
    rows: 3,
  },
  {
    key: "sod_verification",
    label: "Separation of duties verified across privileged accounts",
    type: "select",
    options: [
      "Verified — no conflicts",
      "Conflicts identified and mitigated",
      "Conflicts identified — unresolved",
      "Not verified",
    ],
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any inventory gaps, missing accounts, or planned improvements",
    rows: 3,
  },
];

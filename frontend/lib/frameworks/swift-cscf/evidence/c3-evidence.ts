import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C3_EVIDENCE_ITEM_ID = "C3";

export const C3_UPLOAD_GUIDANCE = [
  { id: "1", label: "Complete list of ALL user accounts across all in-scope SWIFT systems" },
  { id: "2", label: "Per account: account name, real name/employee ID, system/application, role assigned, access level" },
  { id: "3", label: "Coverage across OS, application, network device, virtualisation, and O2M accounts" },
  { id: "4", label: "Access justified by job function for each account" },
  { id: "5", label: "Account status (active/disabled/locked) and last login date per account" },
  { id: "6", label: "External/contractor accounts with engagement end dates" },
  { id: "7", label: "Service accounts with documented purpose" },
];

export const C3_FIELDS: FieldDef[] = [
  {
    key: "total_user_accounts",
    label: "Total user account count across all systems",
    type: "text",
    placeholder: "e.g. 128",
  },
  {
    key: "inventory_date",
    label: "Date the user access list was compiled",
    type: "date",
  },
  {
    key: "systems_covered",
    label: "All in-scope SWIFT systems/applications in the list",
    type: "textarea",
    placeholder: "List all systems: SWIFT messaging, communication interfaces, OS, network devices, VM platforms, O2M, etc.",
    rows: 3,
  },
  {
    key: "account_types_coverage",
    label: "Coverage of account types",
    type: "select",
    options: [
      "All types (OS, application, network, VM, O2M)",
      "Most types covered",
      "Some types covered",
      "Limited coverage",
    ],
  },
  {
    key: "account_detail_completeness",
    label: "Completeness of per-account details (name, employee ID, system, role, access level)",
    type: "select",
    options: [
      "All fields populated for all accounts",
      "Most fields populated",
      "Some fields incomplete",
      "Significant gaps",
    ],
  },
  {
    key: "access_justification_status",
    label: "Access justified by job function",
    type: "select",
    options: [
      "All accounts justified",
      "Most accounts justified (>90%)",
      "Some accounts lack justification",
      "Not documented",
    ],
  },
  {
    key: "account_status_tracking",
    label: "Account status tracked (active/disabled/locked)",
    type: "select",
    options: [
      "Yes — all accounts with current status",
      "Most accounts tracked",
      "Some accounts tracked",
      "Not tracked",
    ],
  },
  {
    key: "last_login_tracked",
    label: "Last login date recorded per account",
    type: "select",
    options: [
      "Yes — all accounts",
      "Most accounts",
      "Some accounts",
      "Not tracked",
    ],
  },
  {
    key: "external_contractor_accounts",
    label: "External/contractor accounts with engagement end dates",
    type: "textarea",
    placeholder: "List contractor/vendor accounts with engagement end dates, or state 'None' if no external accounts exist",
    rows: 3,
  },
  {
    key: "service_accounts_documented",
    label: "Service accounts with documented purpose",
    type: "textarea",
    placeholder: "List service accounts and their documented purpose, or state 'None' if no service accounts exist",
    rows: 3,
  },
  {
    key: "stale_disabled_count",
    label: "Count of stale/disabled accounts identified",
    type: "text",
    placeholder: "e.g. 5 stale, 3 disabled",
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any missing systems, incomplete records, or planned improvements",
    rows: 3,
  },
];

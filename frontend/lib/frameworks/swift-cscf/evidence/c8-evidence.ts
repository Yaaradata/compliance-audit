import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C8_EVIDENCE_ITEM_ID = "C8";

export const C8_UPLOAD_GUIDANCE = [
  { id: "1", label: "Password repository protection method documentation" },
  { id: "2", label: "Physical storage controls: sealed tamper-evident envelopes in safe, access logged" },
  { id: "3", label: "Logical storage controls: encrypted at rest, authenticated access, access logging per 6.4" },
  { id: "4", label: "Coverage of ALL account types: emergency, privileged, operator, app-to-app, local auth keys" },
  { id: "5", label: "Evidence that passwords are NOT stored in user manuals or operational documents" },
  { id: "6", label: "Evidence that passwords are NOT hardcoded in scripts" },
  { id: "7", label: "Emergency access process: password changed after every emergency use" },
  { id: "8", label: "Scope covers zone systems, SWIFT apps, network devices, HSM, O2M, and virtualisation platforms" },
];

export const C8_FIELDS: FieldDef[] = [
  {
    key: "storage_method",
    label: "Primary credential storage method",
    type: "select",
    options: [
      "Enterprise password vault (e.g., CyberArk, HashiCorp, Thycotic)",
      "Encrypted file or database",
      "Physical safe only",
      "Multiple methods (physical + logical)",
      "Other",
    ],
  },
  {
    key: "physical_storage_controls",
    label: "Physical storage controls for credentials",
    type: "textarea",
    placeholder: "Describe physical controls: sealed tamper-evident envelopes, safe location, access logging, dual-control access, etc. State 'Not applicable' if only logical storage is used",
    rows: 3,
  },
  {
    key: "logical_storage_controls",
    label: "Logical storage controls for credentials",
    type: "textarea",
    placeholder: "Describe logical controls: encryption at rest (algorithm/strength), authenticated access, access logging per 6.4, MFA for vault access, etc.",
    rows: 3,
  },
  {
    key: "account_type_coverage",
    label: "Account types covered (emergency, privileged, operator, app-to-app, local auth keys)",
    type: "select",
    options: [
      "All account types covered",
      "Most types covered",
      "Some types covered",
      "Limited coverage",
    ],
  },
  {
    key: "system_scope_coverage",
    label: "Systems in scope (zone systems, SWIFT apps, network devices, HSM, O2M, VM)",
    type: "select",
    options: [
      "All system types covered",
      "Most system types covered",
      "Some system types covered",
      "Limited coverage",
    ],
  },
  {
    key: "passwords_in_docs_check",
    label: "Verified passwords NOT in user manuals or operational documents",
    type: "select",
    options: [
      "Verified — none found",
      "Review in progress",
      "Not verified",
      "Issues identified and being remediated",
    ],
  },
  {
    key: "passwords_in_scripts_check",
    label: "Verified passwords NOT hardcoded in scripts",
    type: "select",
    options: [
      "Verified — automated scan clean",
      "Verified — manual review clean",
      "Review in progress",
      "Not verified",
      "Issues identified and being remediated",
    ],
  },
  {
    key: "emergency_access_procedure",
    label: "Emergency access: password changed after every use",
    type: "select",
    options: [
      "Documented and enforced — password rotated after each use",
      "Documented but not consistently enforced",
      "Not documented",
    ],
  },
  {
    key: "access_logging",
    label: "Access to credential storage is logged per control 6.4",
    type: "select",
    options: [
      "Yes — all access logged and reviewed",
      "Logged but not regularly reviewed",
      "Partially logged",
      "Not logged",
    ],
  },
  {
    key: "last_audit_date",
    label: "Last credential storage audit date",
    type: "date",
  },
  {
    key: "audit_findings",
    label: "Audit findings and remediation actions",
    type: "textarea",
    placeholder: "Describe audit findings, any non-compliance identified, and remediation actions with dates",
    rows: 3,
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any gaps in credential protection, systems not yet covered, or planned improvements",
    rows: 3,
  },
];

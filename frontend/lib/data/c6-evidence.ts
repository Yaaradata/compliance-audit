import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C6_EVIDENCE_ITEM_ID = "C6";

export const C6_UPLOAD_GUIDANCE = [
  { id: "1", label: "Documented JML (Joiner/Mover/Leaver) process/procedure" },
  { id: "2", label: "Joiner: account creation tied to approved role, approval workflow, provisioning timeline" },
  { id: "3", label: "Mover: access reviewed on role change, old access removed" },
  { id: "4", label: "Leaver: access promptly revoked across ALL systems, tokens recalled, shared passwords changed" },
  { id: "5", label: "Provider JML: third-party account lifecycle management" },
  { id: "6", label: "Timeline standards for provisioning and revocation" },
  { id: "7", label: "Sample execution evidence: tickets with dates, actions, and approvals" },
  { id: "8", label: "Escalation process for delayed revocations and token recall integration" },
];

export const C6_FIELDS: FieldDef[] = [
  {
    key: "process_document_date",
    label: "JML process document approval / version date",
    type: "date",
  },
  {
    key: "process_owner",
    label: "JML process owner",
    type: "text",
    placeholder: "e.g. HR Operations Manager, IT Access Management Lead",
  },
  {
    key: "joiner_approval_workflow",
    label: "Joiner: account creation tied to approved role with approval workflow",
    type: "select",
    options: [
      "Fully documented — role-based with formal approval",
      "Documented — approval required but not role-based",
      "Partially documented",
      "Not documented",
    ],
  },
  {
    key: "joiner_provisioning_timeline",
    label: "Joiner provisioning timeline standard",
    type: "text",
    placeholder: "e.g. Within 24 hours of manager approval",
  },
  {
    key: "mover_access_review",
    label: "Mover: access reviewed and old access removed on role change",
    type: "select",
    options: [
      "Automated review triggered on role change",
      "Manual review process documented and followed",
      "Partial process — not all systems covered",
      "Not documented",
    ],
  },
  {
    key: "leaver_revocation_scope",
    label: "Leaver: access revocation scope across systems",
    type: "select",
    options: [
      "All in-scope systems covered",
      "Most systems covered",
      "Some systems only",
      "Not defined",
    ],
  },
  {
    key: "leaver_revocation_timeline",
    label: "Leaver revocation timeline standard",
    type: "text",
    placeholder: "e.g. Same day for terminations, within 24 hours for resignations",
  },
  {
    key: "token_recall_integrated",
    label: "Token recall and shared password change in leaver process",
    type: "select",
    options: [
      "Fully integrated — tokens recalled and passwords changed",
      "Token recall only",
      "Password change only",
      "Not integrated",
    ],
  },
  {
    key: "provider_jml_process",
    label: "Provider/third-party JML process",
    type: "select",
    options: [
      "Documented and consistently applied",
      "Documented but inconsistently applied",
      "Not documented",
      "Not applicable — no third-party accounts",
    ],
  },
  {
    key: "execution_evidence",
    label: "Sample execution evidence (ticket IDs, dates, actions)",
    type: "textarea",
    placeholder: "Provide sample ticket references: e.g. INC-1234 (Joiner, 2025-01-15, provisioned within 4 hours), INC-1235 (Leaver, 2025-01-20, revoked same day)",
    rows: 4,
  },
  {
    key: "escalation_process",
    label: "Escalation process for delayed revocations",
    type: "select",
    options: [
      "Documented with defined escalation path and SLA",
      "Informal escalation process exists",
      "Not documented",
    ],
  },
  {
    key: "total_jml_events_last_quarter",
    label: "Total JML events processed in last quarter",
    type: "text",
    placeholder: "e.g. 12 joiners, 5 movers, 8 leavers",
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any process gaps, systems not covered, or planned improvements",
    rows: 3,
  },
];

import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C7_EVIDENCE_ITEM_ID = "C7";

export const C7_UPLOAD_GUIDANCE = [
  { id: "1", label: "Complete inventory of ALL tokens: connected (USB, smart cards), disconnected (TOTP, RSA, Digipass, 3-Skey), software tokens, PED devices/keys" },
  { id: "2", label: "Per token: token ID/serial, type, assigned person, assignment date, status" },
  { id: "3", label: "Controlled distribution process with approval evidence" },
  { id: "4", label: "Annual review of token assignments" },
  { id: "5", label: "Revocation process when access is no longer needed" },
  { id: "6", label: "Token supervision controls (e.g., not left plugged in unattended)" },
  { id: "7", label: "PED key management: safe storage, PIN changed on staff departure" },
  { id: "8", label: "Remote PED security measures" },
];

export const C7_FIELDS: FieldDef[] = [
  {
    key: "total_tokens",
    label: "Total tokens/certificates in inventory",
    type: "text",
    placeholder: "e.g. 35",
  },
  {
    key: "inventory_date",
    label: "Date inventory was last updated",
    type: "date",
  },
  {
    key: "connected_token_types",
    label: "Connected tokens (USB, smart cards) — types and counts",
    type: "textarea",
    placeholder: "e.g. 10x USB hardware tokens (YubiKey 5), 5x smart cards (Gemalto IDPrime)",
    rows: 2,
  },
  {
    key: "disconnected_token_types",
    label: "Disconnected tokens (TOTP, RSA, Digipass, 3-Skey, software) — types and counts",
    type: "textarea",
    placeholder: "e.g. 15x RSA SecurID, 5x Digipass, 8x software TOTP tokens",
    rows: 2,
  },
  {
    key: "token_detail_completeness",
    label: "Per-token detail completeness (ID/serial, type, assigned person, assignment date, status)",
    type: "select",
    options: [
      "All fields documented for all tokens",
      "Most fields documented",
      "Some fields incomplete",
      "Significant gaps",
    ],
  },
  {
    key: "distribution_approval",
    label: "Controlled distribution with approval process",
    type: "select",
    options: [
      "Formal approval required and documented for each distribution",
      "Informal approval process",
      "No approval process",
    ],
  },
  {
    key: "last_annual_review_date",
    label: "Last annual review date of token assignments",
    type: "date",
  },
  {
    key: "review_findings",
    label: "Review findings and actions taken",
    type: "textarea",
    placeholder: "Describe findings from last review: reassignments, revocations, discrepancies found, and corrective actions",
    rows: 3,
  },
  {
    key: "revocation_process",
    label: "Revocation process when access is no longer needed",
    type: "select",
    options: [
      "Documented and consistently enforced",
      "Documented but inconsistently applied",
      "Not documented",
    ],
  },
  {
    key: "token_supervision",
    label: "Token supervision controls (not left plugged in unattended)",
    type: "select",
    options: [
      "Controls enforced — policy and monitoring in place",
      "Guidelines exist but not actively enforced",
      "No controls",
    ],
  },
  {
    key: "ped_key_management",
    label: "PED key/device management (safe storage, PIN changed on departure)",
    type: "select",
    options: [
      "Fully managed — safe storage with PIN change on departure",
      "Partially managed",
      "Not managed",
      "Not applicable — no PED devices",
    ],
  },
  {
    key: "remote_ped_security",
    label: "Remote PED security measures",
    type: "select",
    options: [
      "Fully secured with documented controls",
      "Partially secured",
      "Not secured",
      "Not applicable — no remote PED",
    ],
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any missing tokens from inventory, unassigned tokens, or planned improvements",
    rows: 3,
  },
];

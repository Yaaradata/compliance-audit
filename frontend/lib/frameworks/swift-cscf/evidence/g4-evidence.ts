import type { FieldDef } from "@/components/domain/generic-intake-form";

export const G4_EVIDENCE_ITEM_ID = "G4";

export const G4_UPLOAD_GUIDANCE = [
  { id: "1", label: "Equipment disposal/reuse records with equipment identifier, type, and original function" },
  { id: "2", label: "Disposal dates and sanitisation method applied per item" },
  { id: "3", label: "Sanitisation verification evidence confirming data is unrecoverable" },
  { id: "4", label: "Certificate of destruction from third-party disposal vendors (if applicable)" },
  { id: "5", label: "Equipment types covered: servers, PCs, HSMs, tokens, removable media, backup tapes, network devices" },
  { id: "6", label: "Disposal process documented in policy" },
];

export const G4_FIELDS: FieldDef[] = [
  {
    key: "disposal_records_maintained",
    label: "Disposal/reuse records maintained with required details",
    type: "select",
    options: [
      "Full records: equipment ID, type, function, disposal date, method, verification",
      "Records maintained but missing some fields",
      "Partial records — inconsistent tracking",
      "No disposal records maintained",
    ],
  },
  {
    key: "equipment_types_covered",
    label: "Equipment types covered by disposal process",
    type: "textarea",
    placeholder: "List covered types: servers, operator PCs, HSMs, tokens/smart cards, removable media (USB drives), backup tapes, network devices — note any types not covered",
    rows: 3,
  },
  {
    key: "sanitisation_methods_used",
    label: "Data sanitisation methods used",
    type: "textarea",
    placeholder: "Describe methods per equipment type: secure deletion tools, overwriting (e.g. DoD 5220.22-M, NIST 800-88), cryptographic erasure, manufacturer reset, physical destruction (shredding, degaussing)",
    rows: 4,
  },
  {
    key: "sanitisation_verification",
    label: "Sanitisation verification — data confirmed unrecoverable",
    type: "select",
    options: [
      "Verified for all disposals — confirmation documented",
      "Verified for most disposals (>75%)",
      "Verified for some disposals",
      "No verification performed",
    ],
  },
  {
    key: "third_party_destruction",
    label: "Third-party destruction certificates obtained (if applicable)",
    type: "select",
    options: [
      "Certificates obtained for all third-party disposals",
      "Certificates obtained for most",
      "Certificates obtained for some",
      "No certificates — disposal handled internally",
      "Not applicable — no third-party disposal used",
    ],
  },
  {
    key: "disposal_policy_documented",
    label: "Equipment disposal process documented in policy",
    type: "select",
    options: [
      "Comprehensive policy covering all equipment types and sanitisation standards",
      "Policy exists but does not cover all equipment types",
      "General disposal guidance only — no detailed procedures",
      "No policy documented",
    ],
  },
  {
    key: "total_disposals_last_12mo",
    label: "Total equipment disposals/reuse in last 12 months",
    type: "text",
    placeholder: "e.g. 12 items disposed, 3 items securely repurposed",
  },
  {
    key: "disposal_breakdown",
    label: "Disposal breakdown by equipment type",
    type: "textarea",
    placeholder: "e.g. 4 servers (secure wipe + physical destruction), 5 PCs (NIST 800-88 overwrite), 2 network devices (manufacturer reset), 1 HSM (vendor destruction)",
    rows: 3,
  },
  {
    key: "latest_disposal_date",
    label: "Date of most recent disposal/reuse event",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known gaps in disposal process or records",
    type: "textarea",
    required: false,
    placeholder: "Describe any equipment types not covered, missing records, verification gaps, or planned improvements",
    rows: 3,
  },
];

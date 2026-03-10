import type { FieldDef } from "@/components/domain/generic-intake-form";

export const G1_EVIDENCE_ITEM_ID = "G1";

export const G1_UPLOAD_GUIDANCE = [
  { id: "1", label: "Removable equipment controls: PED, keys, smart cards, USB tokens, TOTP — supervised use or secure storage" },
  { id: "2", label: "Workplace security: operator PCs in secured area, transaction printers restricted access" },
  { id: "3", label: "Teleworking policy: personal equipment rules, VPN+MFA, mobile device protection" },
  { id: "4", label: "Server environment physical security: data centre/locked room, access cards/biometrics, rack-mount risk assessment" },
  { id: "5", label: "Video surveillance: movement detection, ≥3 month recording retention, no SWIFT reference labels" },
  { id: "6", label: "Equipment disposal: data sanitisation methods (secure deletion, overwriting, encryption, manufacturer reset)" },
];

export const G1_FIELDS: FieldDef[] = [
  {
    key: "removable_equipment_controls",
    label: "Removable equipment (PED, keys, smart cards, USB tokens, TOTP) protection",
    type: "select",
    options: [
      "All items supervised during use and stored securely when not in use",
      "Most items secured — some exceptions",
      "Partial controls in place",
      "No formal controls for removable equipment",
    ],
  },
  {
    key: "removable_equipment_details",
    label: "Removable equipment types and storage arrangements",
    type: "textarea",
    placeholder: "List each equipment type (PED, smart cards, USB tokens, TOTP devices, keys) and describe secure storage location and supervision procedures",
    rows: 3,
  },
  {
    key: "workplace_security",
    label: "Workplace physical security for operator PCs and printers",
    type: "select",
    options: [
      "Operator PCs in secured/restricted area, printers physically restricted",
      "Operator PCs in secured area, printers in shared space",
      "Operator PCs in general office area with some access controls",
      "No physical restrictions on operator workstations",
    ],
  },
  {
    key: "teleworking_policy",
    label: "Teleworking/remote worker policy in place",
    type: "select",
    options: [
      "Comprehensive policy: VPN+MFA, personal equipment rules, mobile device protection",
      "VPN+MFA required but limited personal equipment rules",
      "Basic remote access rules without comprehensive policy",
      "No teleworking policy",
      "Not applicable — no remote SWIFT access permitted",
    ],
  },
  {
    key: "remote_worker_controls",
    label: "Remote worker security controls in use",
    type: "textarea",
    placeholder: "Describe VPN configuration, MFA requirements for remote access, personal device restrictions, mobile device management, and screen lock/encryption requirements",
    rows: 3,
  },
  {
    key: "server_environment_security",
    label: "Server environment physical security level",
    type: "select",
    options: [
      "Dedicated data centre with access cards, biometrics, and physical barriers",
      "Locked server room with access card/key control",
      "Rack-mounted in shared space with documented risk assessment",
      "No dedicated secure environment for servers",
    ],
  },
  {
    key: "server_access_methods",
    label: "Server environment access control methods",
    type: "textarea",
    placeholder: "Describe access control methods: access cards, biometrics, PIN entry, key management; include rack-mount risk assessment if applicable",
    rows: 3,
  },
  {
    key: "video_surveillance_status",
    label: "Video surveillance for server environment",
    type: "select",
    options: [
      "Active with movement detection and ≥3 month recording retention",
      "Active recording without movement detection",
      "Live monitoring only — no recording",
      "No video surveillance",
    ],
  },
  {
    key: "swift_reference_labeling",
    label: "SWIFT reference labels absent from equipment/server areas",
    type: "select",
    options: [
      "Confirmed — no SWIFT reference labels visible on equipment or areas",
      "Some labels present — removal planned",
      "SWIFT reference labels visible on equipment/areas",
      "Not verified",
    ],
  },
  {
    key: "equipment_disposal_method",
    label: "Equipment disposal and data sanitisation process",
    type: "select",
    options: [
      "Formal process: secure deletion, overwriting, or manufacturer reset with verification",
      "Process exists but not consistently applied",
      "Ad hoc disposal — no formal process",
      "No disposal process documented",
    ],
  },
  {
    key: "disposal_sanitisation_details",
    label: "Data sanitisation methods used for disposal/reuse",
    type: "textarea",
    placeholder: "Describe specific methods: secure deletion tools, overwriting standards (e.g. NIST 800-88), full-disk encryption destruction, manufacturer reset — and how sanitisation is verified",
    rows: 3,
  },
  {
    key: "known_gaps",
    label: "Known physical security gaps or planned improvements",
    type: "textarea",
    required: false,
    placeholder: "Describe any physical security deficiencies, pending upgrades, or remediation plans",
    rows: 3,
  },
];

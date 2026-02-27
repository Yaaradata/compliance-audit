import type { FieldDef } from "@/components/domain/generic-intake-form";

export const G3_EVIDENCE_ITEM_ID = "G3";

export const G3_UPLOAD_GUIDANCE = [
  { id: "1", label: "Video surveillance system details: camera placement covering server environment entry/exit and rack areas" },
  { id: "2", label: "Movement detection configuration evidence" },
  { id: "3", label: "Recording mode confirmation (active recording, not just live monitoring)" },
  { id: "4", label: "Image retention evidence showing ≥3 months storage" },
  { id: "5", label: "Recording integrity measures (tamper-evident storage)" },
  { id: "6", label: "Legal compliance documentation for surveillance and retention" },
  { id: "7", label: "Sample footage screenshot or system dashboard showing operational status" },
];

export const G3_FIELDS: FieldDef[] = [
  {
    key: "camera_placement",
    label: "Camera placement and coverage areas",
    type: "textarea",
    placeholder: "Describe camera locations: entry/exit doors, server rack aisles, equipment storage areas, corridors leading to server environment — note any blind spots",
    rows: 3,
  },
  {
    key: "entry_exit_coverage",
    label: "Entry/exit point camera coverage",
    type: "select",
    options: [
      "All entry/exit points to server environment covered",
      "Most entry/exit points covered",
      "Some entry/exit points covered",
      "No camera coverage at entry/exit points",
    ],
  },
  {
    key: "rack_area_coverage",
    label: "Server rack area camera coverage",
    type: "select",
    options: [
      "All rack areas and aisles covered",
      "Most rack areas covered",
      "Limited rack area coverage",
      "No rack area coverage",
    ],
  },
  {
    key: "movement_detection",
    label: "Movement detection enabled",
    type: "select",
    options: [
      "Enabled on all cameras with alert triggers",
      "Enabled on all cameras without alerts",
      "Enabled on some cameras only",
      "Not enabled",
    ],
  },
  {
    key: "recording_mode",
    label: "Recording mode",
    type: "select",
    options: [
      "Continuous recording active",
      "Motion-triggered recording active",
      "Scheduled recording (business hours only)",
      "Live monitoring only — no recording",
    ],
  },
  {
    key: "retention_period",
    label: "Image/footage retention period",
    type: "select",
    options: [
      "≥6 months",
      "3-6 months",
      "1-3 months",
      "<1 month",
      "No retention — live only",
    ],
  },
  {
    key: "recording_integrity",
    label: "Recording integrity and tamper-evidence",
    type: "select",
    options: [
      "Tamper-evident storage with access controls and audit trail",
      "Access-controlled storage without tamper detection",
      "Standard storage — no integrity measures",
      "Not assessed",
    ],
  },
  {
    key: "legal_compliance_status",
    label: "Legal compliance for surveillance and data retention",
    type: "select",
    options: [
      "Fully compliant — legal review completed and documented",
      "Believed compliant — no formal legal review",
      "Compliance gaps identified",
      "Not assessed for legal compliance",
    ],
  },
  {
    key: "legal_compliance_details",
    label: "Legal compliance details",
    type: "textarea",
    placeholder: "Describe applicable laws (data protection, privacy, surveillance), signage/notice requirements met, retention period legal basis, any restrictions",
    rows: 3,
  },
  {
    key: "system_operational_status",
    label: "Current system operational status",
    type: "select",
    options: [
      "Fully operational — all cameras active and recording",
      "Mostly operational — minor issues (1-2 cameras offline)",
      "Degraded — significant cameras offline",
      "Not operational",
    ],
  },
  {
    key: "last_system_check_date",
    label: "Date of last system health check / maintenance",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known surveillance gaps or planned improvements",
    type: "textarea",
    required: false,
    placeholder: "Describe any coverage blind spots, retention shortfalls, equipment issues, or planned upgrades",
    rows: 3,
  },
];

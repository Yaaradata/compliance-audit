import type { FieldDef } from "@/components/domain/generic-intake-form";

export const G2_EVIDENCE_ITEM_ID = "G2";

export const G2_UPLOAD_GUIDANCE = [
  { id: "1", label: "Physical access logs for sensitive areas (data centre, server room, secured storage) covering 12 months" },
  { id: "2", label: "Data centre entry/exit records with timestamps, person identification, and access method" },
  { id: "3", label: "Secured storage area (safes, locked cabinets) access records" },
  { id: "4", label: "Log retention evidence showing ≥6 months retention in compliance with local law" },
  { id: "5", label: "Periodic review records showing anomalous access checks" },
  { id: "6", label: "Visitor access records with escort/supervision details" },
];

export const G2_FIELDS: FieldDef[] = [
  {
    key: "log_coverage_scope",
    label: "Physical access log coverage across sensitive areas",
    type: "select",
    options: [
      "All sensitive areas logged (data centre, server room, secured storage)",
      "Most areas logged — minor gaps",
      "Some areas logged — significant gaps",
      "Logging not in place for sensitive areas",
    ],
  },
  {
    key: "data_centre_logging",
    label: "Data centre/server room entry/exit logging details",
    type: "textarea",
    placeholder: "Describe what is captured per entry: timestamp, person name/ID, access method (card, biometric, key), entry vs exit, and any escort details",
    rows: 3,
  },
  {
    key: "secured_storage_logging",
    label: "Secured storage area (safes, locked cabinets) access logging",
    type: "select",
    options: [
      "All secured storage access logged with timestamps and person ID",
      "Most secured storage access logged",
      "Some logging — inconsistent coverage",
      "Not logged",
      "Not applicable — no separate secured storage",
    ],
  },
  {
    key: "server_room_logging",
    label: "Server room access logging",
    type: "select",
    options: [
      "Fully logged — electronic access control with timestamps",
      "Logged via manual sign-in sheet",
      "Partial logging — some entries missing",
      "Not separately logged",
    ],
  },
  {
    key: "log_retention_period",
    label: "Physical access log retention period",
    type: "select",
    options: [
      "≥12 months retained",
      "6-12 months retained",
      "3-6 months retained",
      "<3 months retained",
      "Retention period unknown",
    ],
  },
  {
    key: "local_law_compliance",
    label: "Log retention compliant with local law requirements",
    type: "select",
    options: [
      "Confirmed compliant — legal review performed",
      "Believed compliant — no formal legal review",
      "Non-compliant — retention below legal minimum",
      "Local law requirements not assessed",
    ],
  },
  {
    key: "audit_availability",
    label: "Logs available for audit and investigation purposes",
    type: "select",
    options: [
      "Immediately available — electronic system with search/export",
      "Available within 24 hours upon request",
      "Available but with delays (>24 hours)",
      "Not readily accessible",
    ],
  },
  {
    key: "anomalous_access_review",
    label: "Periodic review of logs for anomalous access patterns",
    type: "select",
    options: [
      "Weekly or more frequent reviews",
      "Monthly reviews",
      "Quarterly reviews",
      "Annual reviews only",
      "No periodic reviews conducted",
    ],
  },
  {
    key: "anomalous_access_findings",
    label: "Findings from anomalous access reviews (last 12 months)",
    type: "textarea",
    placeholder: "Summarise any anomalous access detected, investigations conducted, and outcomes (e.g. unauthorized attempts, after-hours access, unknown persons)",
    rows: 3,
  },
  {
    key: "visitor_access_records",
    label: "Visitor access records and escort procedures",
    type: "select",
    options: [
      "All visitors logged and escorted in sensitive areas",
      "Visitors logged but not always escorted",
      "Visitor log maintained — escort policy inconsistent",
      "No visitor access controls",
    ],
  },
  {
    key: "log_sample_period",
    label: "Sample log period provided for review",
    type: "text",
    placeholder: "e.g. January 2025 – December 2025",
  },
  {
    key: "known_gaps",
    label: "Known gaps in physical access logging",
    type: "textarea",
    required: false,
    placeholder: "Describe any areas without logging, retention shortfalls, or planned logging improvements",
    rows: 3,
  },
];

import type { FieldDef } from "@/components/domain/generic-intake-form";

export const E5_EVIDENCE_ITEM_ID = "E5";

export const E5_UPLOAD_GUIDANCE = [
  { id: "1", label: "Database integrity verification process for all SWIFT messaging databases (messaging interface DB, communication interface DB, connector DB, local SWIFT data DB)" },
  { id: "2", label: "Database access control evidence — admin accounts limited, per control C2 principles" },
  { id: "3", label: "Integrity check method: checksum/hash verification and transaction log integrity" },
  { id: "4", label: "Backup integrity evidence — verified and tested restoration" },
  { id: "5", label: "Audit trail configuration: all modifications logged with user, timestamp, and action" },
  { id: "6", label: "Encryption at rest configuration for SWIFT databases" },
  { id: "7", label: "Schema protection — unauthorized schema change detection and alerting" },
  { id: "8", label: "Reconciliation evidence: database records vs source transactions" },
];

export const E5_FIELDS: FieldDef[] = [
  {
    key: "db_platform",
    label: "Database Platform & Version",
    type: "text",
    placeholder: "e.g. Oracle 19c, Microsoft SQL Server 2019, Sybase ASE 16, PostgreSQL 15",
  },
  {
    key: "swift_databases_covered",
    label: "SWIFT Databases Covered by Integrity Checks",
    type: "textarea",
    rows: 3,
    placeholder: "List each database and status:\n• Messaging Interface DB: covered\n• Communication Interface DB: covered\n• Connector DB: covered\n• Local SWIFT Data DB: covered",
  },
  {
    key: "integrity_check_method",
    label: "Integrity Check Method",
    type: "select",
    options: [
      "Checksum/hash verification + transaction log integrity validation",
      "Checksum/hash verification only",
      "Transaction log integrity validation only",
      "Application-level consistency checks",
      "No integrity checks configured",
    ],
  },
  {
    key: "integrity_check_frequency",
    label: "Integrity Check Frequency",
    type: "select",
    options: [
      "Real-time (continuous transaction validation)",
      "Daily",
      "Weekly",
      "Monthly",
      "Ad-hoc / manual only",
      "Not configured",
    ],
  },
  {
    key: "db_access_control",
    label: "Database Admin Access Control",
    type: "select",
    options: [
      "Strictly limited — named accounts, least privilege, per C2 principles",
      "Limited — few admin accounts but shared credentials exist",
      "Moderate — several admin accounts, not all justified",
      "Weak — broad admin access, no formal restrictions",
    ],
  },
  {
    key: "audit_trail_config",
    label: "Audit Trail — Modification Logging",
    type: "select",
    options: [
      "All modifications logged with user, timestamp, and action (insert/update/delete)",
      "Most modifications logged — some gaps in coverage",
      "Only schema changes and admin actions logged",
      "Minimal or no audit trail configured",
    ],
  },
  {
    key: "encryption_at_rest",
    label: "Encryption at Rest",
    type: "select",
    options: [
      "TDE or full-disk encryption on all SWIFT databases",
      "Column/field-level encryption for sensitive data",
      "Encrypted storage (SAN/volume level)",
      "Partial encryption — not all databases covered",
      "No encryption at rest",
    ],
  },
  {
    key: "schema_protection",
    label: "Schema Change Detection & Protection",
    type: "select",
    options: [
      "Automated detection and alerting for unauthorized schema changes",
      "Periodic manual schema comparison against baseline",
      "Change-control process only — no automated detection",
      "No schema protection",
    ],
  },
  {
    key: "backup_integrity_status",
    label: "Backup Integrity — Verified & Tested",
    type: "select",
    options: [
      "Regular backup integrity verification + tested restoration (quarterly or more)",
      "Regular backup integrity verification — restoration not tested recently",
      "Backups taken — integrity not verified",
      "Backup process not established",
    ],
  },
  {
    key: "last_backup_test_date",
    label: "Last Backup Restoration Test Date",
    type: "date",
    required: false,
  },
  {
    key: "reconciliation_process",
    label: "Record Reconciliation (DB Records vs Source Transactions)",
    type: "select",
    options: [
      "Automated daily reconciliation with exception reporting",
      "Manual reconciliation performed regularly (weekly/monthly)",
      "Reconciliation performed ad-hoc on demand",
      "No reconciliation process",
    ],
  },
  {
    key: "reconciliation_detail",
    label: "Reconciliation Process Description",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Describe how database records are reconciled against source SWIFT transactions, exception handling, and frequency",
  },
  {
    key: "additional_notes",
    label: "Additional Notes or Known Gaps",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Describe any databases not covered, access control gaps, or planned improvements",
  },
];

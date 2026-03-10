/**
 * B3 Encryption Configuration — structured evidence prompts.
 * Evidence type: Config Export
 * Controls covered: 2.1(M), 2.4A(A), 2.5A(A), 2.6(M)
 */

export const B3_EVIDENCE_ITEM_ID = "B3";

export const B3_CONFIG_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "TLS/encryption config for each internal SWIFT-to-SWIFT component flow" },
  { id: "2", label: "Per-flow TLS version, cipher suite, certificate type (mutual/one-way)" },
  { id: "3", label: "LAU configuration if used (in combination with TLS)" },
  { id: "4", label: "Cross-environment flow encryption (on-prem to cloud)" },
  { id: "5", label: "External transmission encryption (TLS 1.2+ with strong ciphers)" },
  { id: "6", label: "Backup encryption configuration and key management" },
  { id: "7", label: "SAN/NAS and cloud storage-level encryption if applicable" },
  { id: "8", label: "Operator session transport-level encryption per session type" },
];

export const B3_FORM_KEYS = {
  internal_flow_summary: "internal_flow_summary",
  tls_version_per_flow: "tls_version_per_flow",
  lau_configuration: "lau_configuration",
  cross_environment_encryption: "cross_environment_encryption",
  backoffice_flow_protection: "backoffice_flow_protection",
  external_transmission_encryption: "external_transmission_encryption",
  backup_encryption: "backup_encryption",
  at_rest_encryption: "at_rest_encryption",
  key_management_approach: "key_management_approach",
  operator_session_transport: "operator_session_transport",
  unprotected_flows: "unprotected_flows",
  known_gaps: "known_gaps",
} as const;

export type B3FormKey = (typeof B3_FORM_KEYS)[keyof typeof B3_FORM_KEYS];

export const B3_FORM_LABELS: Record<B3FormKey, string> = {
  internal_flow_summary: "Internal SWIFT component flow encryption summary",
  tls_version_per_flow: "TLS version and cipher suite per flow type",
  lau_configuration: "LAU configuration details (if used)",
  cross_environment_encryption: "Cross-environment flow encryption (on-prem to cloud)",
  backoffice_flow_protection: "Back-office to secure zone flow protection per leg",
  external_transmission_encryption: "External transmission encryption config",
  backup_encryption: "Backup encryption method and key management",
  at_rest_encryption: "At-rest encryption for SWIFT data outside secure zone",
  key_management_approach: "Key management approach per flow",
  operator_session_transport: "Operator session transport-level encryption",
  unprotected_flows: "Unprotected/legacy flows with risk assessment",
  known_gaps: "Known gaps and remediation plan",
};

export const B3_FORM_PLACEHOLDERS: Partial<Record<B3FormKey, string>> = {
  internal_flow_summary: "List each internal flow (RMA↔messaging, GUI↔messaging, etc.) with encryption status",
  tls_version_per_flow: "Per-flow: TLS version, cipher suite, certificate type. One flow per line.",
  lau_configuration: "Describe LAU configuration if used in combination with TLS for any flow",
  cross_environment_encryption: "Describe encryption for flows between on-prem and cloud environments",
  backoffice_flow_protection: "Per-leg protection details: end-to-end (LAU, XML DSIG) or per-segment TLS",
  external_transmission_encryption: "TLS config for external transmissions including version and cipher",
  backup_encryption: "Encryption method for backups, replication, with key management approach",
  at_rest_encryption: "AES-256 or equivalent for SWIFT data stored outside secure zone",
  key_management_approach: "Key storage, rotation, and access control per encryption use case",
  operator_session_transport: "Per session type: operator→jump server, jump→app, browser→GUI, remote VPN",
  unprotected_flows: "List any unprotected/legacy flows with risk assessment and remediation plan",
  known_gaps: "Document gaps in encryption coverage and planned remediation",
};

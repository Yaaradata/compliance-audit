/**
 * B2 SWIFT Application Security Config — structured evidence prompts.
 * Evidence type: Config / Screenshots
 * Controls covered: 2.6(M), 2.10(M)
 */

export const B2_EVIDENCE_ITEM_ID = "B2";

export const B2_CONFIG_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "Encrypted session configuration for all operator connections (TLS version, SSH version)" },
  { id: "2", label: "Cipher suites configured (current accepted algorithms)" },
  { id: "3", label: "GUI HTTPS enforcement and certificate validation" },
  { id: "4", label: "Weak/deprecated protocols disabled (SSLv3, TLS 1.0/1.1, RC4, DES)" },
  { id: "5", label: "SWIFT application hardened per Alliance Security Guidance or vendor documentation" },
  { id: "6", label: "Unnecessary application components, adaptors, connectivity methods disabled" },
  { id: "7", label: "Credential/key protection for application-to-application flows" },
];

export const B2_FORM_KEYS = {
  tls_version_enforced: "tls_version_enforced",
  cipher_suites_configured: "cipher_suites_configured",
  session_timeout_value: "session_timeout_value",
  weak_protocols_disabled: "weak_protocols_disabled",
  weak_protocols_remaining: "weak_protocols_remaining",
  jump_server_encryption: "jump_server_encryption",
  swift_hardening_applied: "swift_hardening_applied",
  default_app_passwords_changed: "default_app_passwords_changed",
  unnecessary_components_disabled: "unnecessary_components_disabled",
  app_deviations_documented: "app_deviations_documented",
  known_gaps: "known_gaps",
} as const;

export type B2FormKey = (typeof B2_FORM_KEYS)[keyof typeof B2_FORM_KEYS];

export const B2_FORM_LABELS: Record<B2FormKey, string> = {
  tls_version_enforced: "TLS version enforced for operator sessions",
  cipher_suites_configured: "Cipher suites in use",
  session_timeout_value: "Application-level session timeout (minutes)",
  weak_protocols_disabled: "Weak/deprecated protocols disabled?",
  weak_protocols_remaining: "Remaining weak protocols (if partial)",
  jump_server_encryption: "Jump server to application encryption",
  swift_hardening_applied: "SWIFT app hardened per Alliance Security Guidance?",
  default_app_passwords_changed: "Default application passwords changed?",
  unnecessary_components_disabled: "Unnecessary components/adaptors disabled?",
  app_deviations_documented: "Application deviations from hardening guidance",
  known_gaps: "Known gaps and remediation plan",
};

export const B2_FORM_PLACEHOLDERS: Partial<Record<B2FormKey, string>> = {
  cipher_suites_configured: "List cipher suites configured (e.g. AES-256-GCM, ECDHE-RSA-AES256)",
  jump_server_encryption: "Describe encryption method for jump server to SWIFT application connection",
  weak_protocols_remaining: "List any weak protocols still enabled with justification and remediation timeline",
  app_deviations_documented: "Document deviations from Alliance Security Guidance with justification",
  known_gaps: "Document any gaps and planned remediation",
};

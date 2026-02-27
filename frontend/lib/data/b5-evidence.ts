/**
 * B5 Password Policy Configuration — structured evidence prompts.
 * Evidence type: Config / Screenshots
 * Controls covered: 4.1(M)
 */

export const B5_EVIDENCE_ITEM_ID = "B5";

export const B5_CONFIG_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "Password policy settings from AD Group Policy / application settings" },
  { id: "2", label: "Password length, complexity, expiration, history enforcement" },
  { id: "3", label: "Account lockout threshold, duration, and remedy configuration" },
  { id: "4", label: "Per-account-type policy settings (operator, admin, app-to-app)" },
  { id: "5", label: "LM hash prevention (NoLMHash registry) on Windows systems" },
];

export const B5_FORM_KEYS = {
  password_length_min: "password_length_min",
  complexity_enabled: "complexity_enabled",
  expiration_period: "expiration_period",
  history_enforced: "history_enforced",
  lockout_threshold: "lockout_threshold",
  pin_settings: "pin_settings",
  admin_policy_stricter: "admin_policy_stricter",
  app_to_app_accounts: "app_to_app_accounts",
  zone_local_auth: "zone_local_auth",
  nolmhash_enabled: "nolmhash_enabled",
  policy_review_date: "policy_review_date",
  known_gaps: "known_gaps",
} as const;

export type B5FormKey = (typeof B5_FORM_KEYS)[keyof typeof B5_FORM_KEYS];

export const B5_FORM_LABELS: Record<B5FormKey, string> = {
  password_length_min: "Minimum password length configured",
  complexity_enabled: "Password complexity requirements enabled?",
  expiration_period: "Password expiration period",
  history_enforced: "Password history / reuse prevention",
  lockout_threshold: "Account lockout threshold and duration",
  pin_settings: "PIN settings for tokens / mobile second factors",
  admin_policy_stricter: "Stricter policy for privileged/administrator accounts?",
  app_to_app_accounts: "Application-to-application account password policy",
  zone_local_auth: "Passwords for zone systems in zone-local auth only (not enterprise AD)?",
  nolmhash_enabled: "NoLMHash registry configured on Windows?",
  policy_review_date: "Last password policy review date",
  known_gaps: "Known gaps and remediation plan",
};

export const B5_FORM_PLACEHOLDERS: Partial<Record<B5FormKey, string>> = {
  password_length_min: "e.g. 15 characters (recommended to prevent LM hash on Windows)",
  expiration_period: "e.g. 90 days for operators, 60 days for admins",
  history_enforced: "e.g. 24 passwords remembered",
  lockout_threshold: "e.g. 5 failed attempts, 30 min lockout, manual unlock for admin",
  pin_settings: "Describe PIN complexity and length for token/mobile second factors",
  app_to_app_accounts: "Describe password policy for service/application-to-application accounts",
  known_gaps: "Document any gaps and planned remediation",
};

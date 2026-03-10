/**
 * B8 Operator Session Configuration — structured evidence prompts.
 * Evidence type: Config / Screenshots
 * Controls covered: 2.6(M)
 */

export const B8_EVIDENCE_ITEM_ID = "B8";

export const B8_CONFIG_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "Session timeout/inactivity settings per session type" },
  { id: "2", label: "OS-level screen lock configuration on operator PCs and jump servers" },
  { id: "3", label: "Re-authentication requirements after timeout" },
  { id: "4", label: "Session recording configuration for privileged accounts (if applicable)" },
  { id: "5", label: "Cross-reference: B8 = session behaviour; B2 = app security; B3 = transport encryption" },
];

export const B8_FORM_KEYS = {
  app_timeout_configured: "app_timeout_configured",
  app_timeout_value: "app_timeout_value",
  os_screen_lock: "os_screen_lock",
  os_lock_timeout: "os_lock_timeout",
  remote_session_timeout: "remote_session_timeout",
  remote_timeout_value: "remote_timeout_value",
  reauth_after_timeout: "reauth_after_timeout",
  session_recording: "session_recording",
  concurrent_session_restrictions: "concurrent_session_restrictions",
  known_gaps: "known_gaps",
} as const;

export type B8FormKey = (typeof B8_FORM_KEYS)[keyof typeof B8_FORM_KEYS];

export const B8_FORM_LABELS: Record<B8FormKey, string> = {
  app_timeout_configured: "Application-level timeout on SWIFT applications?",
  app_timeout_value: "Application timeout value (minutes)",
  os_screen_lock: "OS-level screen lock on operator PCs and jump servers?",
  os_lock_timeout: "OS screen lock timeout (minutes)",
  remote_session_timeout: "Remote session timeout configured?",
  remote_timeout_value: "Remote session timeout value (minutes)",
  reauth_after_timeout: "Re-authentication required after timeout?",
  session_recording: "Session recording for privileged accounts?",
  concurrent_session_restrictions: "Concurrent session restrictions configured?",
  known_gaps: "Known gaps and remediation plan",
};

export const B8_FORM_PLACEHOLDERS: Partial<Record<B8FormKey, string>> = {
  app_timeout_value: "Recommended ≤15 minutes",
  os_lock_timeout: "Recommended ≤15 minutes",
  remote_timeout_value: "Recommended ≤15 minutes",
  known_gaps: "Document gaps in session timeout coverage and planned remediation",
};

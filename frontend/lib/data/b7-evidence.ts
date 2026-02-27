/**
 * B7 MFA Configuration — structured evidence prompts.
 * Evidence type: Config / Screenshots
 * Controls covered: 4.2(M)
 */

export const B7_EVIDENCE_ITEM_ID = "B7";

export const B7_CONFIG_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "MFA configuration screenshots per access point" },
  { id: "2", label: "Second factor type per access point (TOTP, RSA SecurID, USB token, smart card, etc.)" },
  { id: "3", label: "MFA system credential storage configuration" },
  { id: "4", label: "Individual assignment of authentication factors confirmed" },
  { id: "5", label: "Cross-check: Access points must match C1 policy requirements" },
];

export const B7_FORM_KEYS = {
  os_admin_mfa: "os_admin_mfa",
  os_admin_mfa_method: "os_admin_mfa_method",
  end_user_mfa: "end_user_mfa",
  end_user_mfa_method: "end_user_mfa_method",
  remote_vpn_mfa: "remote_vpn_mfa",
  virtualisation_console_mfa: "virtualisation_console_mfa",
  hsm_mfa: "hsm_mfa",
  service_provider_mfa: "service_provider_mfa",
  separate_device_confirmed: "separate_device_confirmed",
  credentials_in_zone: "credentials_in_zone",
  individual_assignment: "individual_assignment",
  sso_mfa_status: "sso_mfa_status",
  known_gaps: "known_gaps",
} as const;

export type B7FormKey = (typeof B7_FORM_KEYS)[keyof typeof B7_FORM_KEYS];

export const B7_FORM_LABELS: Record<B7FormKey, string> = {
  os_admin_mfa: "MFA for OS administrators at zone boundary?",
  os_admin_mfa_method: "OS admin MFA method",
  end_user_mfa: "MFA for end users accessing SWIFT application?",
  end_user_mfa_method: "End user MFA method",
  remote_vpn_mfa: "MFA for remote VPN access?",
  virtualisation_console_mfa: "MFA for virtualisation/cloud management console?",
  hsm_mfa: "MFA for HSM access?",
  service_provider_mfa: "MFA for service provider access?",
  separate_device_confirmed: "Second factor on SEPARATE device from first factor?",
  credentials_in_zone: "MFA credentials stored within secure zone (not enterprise AD)?",
  individual_assignment: "Authentication factors individually assigned?",
  sso_mfa_status: "SSO with MFA: second factor still required?",
  known_gaps: "Known gaps and remediation plan",
};

export const B7_FORM_PLACEHOLDERS: Partial<Record<B7FormKey, string>> = {
  os_admin_mfa_method: "e.g. TOTP, RSA SecurID, Digipass, USB token, smart card",
  end_user_mfa_method: "e.g. TOTP app, RSA SecurID token, 3SKey Digital",
  known_gaps: "Document access points without MFA and planned remediation",
};

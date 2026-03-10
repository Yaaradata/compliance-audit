/**
 * B1 OS Hardening Configuration — structured evidence prompts.
 * Evidence type: Config / Screenshots
 * Controls covered: 1.2(M), 2.3(M)
 */

export const B1_EVIDENCE_ITEM_ID = "B1";

export const B1_CONFIG_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "Privileged account restriction settings (sudo config, UAC, admin group memberships)" },
  { id: "2", label: "Service account configuration (minimal privileges, no interactive login)" },
  { id: "3", label: "Unnecessary services, ports, and protocols status" },
  { id: "4", label: "Unnecessary software removal evidence" },
  { id: "5", label: "Screen saver / auto-lock configuration details" },
  { id: "6", label: "Default vulnerable configurations adjusted per baseline" },
  { id: "7", label: "One config export per SWIFT system type in A2 inventory" },
];

export const B1_FORM_KEYS = {
  hardening_baseline_name: "hardening_baseline_name",
  builtin_admin_status: "builtin_admin_status",
  individual_admin_confirmed: "individual_admin_confirmed",
  privilege_elevation_logging: "privilege_elevation_logging",
  password_storage_zone_local: "password_storage_zone_local",
  network_device_admin_access: "network_device_admin_access",
  default_passwords_changed: "default_passwords_changed",
  autolock_configured: "autolock_configured",
  usb_ports_restricted: "usb_ports_restricted",
  hardening_check_dates: "hardening_check_dates",
  deviations_documented: "deviations_documented",
  known_gaps: "known_gaps",
} as const;

export type B1FormKey = (typeof B1_FORM_KEYS)[keyof typeof B1_FORM_KEYS];

export const B1_FORM_LABELS: Record<B1FormKey, string> = {
  hardening_baseline_name: "Hardening baseline applied (CIS, DISA STIG, NIST, vendor)",
  builtin_admin_status: "Built-in administrator account status",
  individual_admin_confirmed: "Individual admin accounts with escalation (sudo) configured?",
  privilege_elevation_logging: "Privilege elevation logging enabled?",
  password_storage_zone_local: "Admin passwords stored in zone-local directory (not enterprise AD)?",
  network_device_admin_access: "Network device admin access method",
  default_passwords_changed: "Default passwords changed on all systems?",
  autolock_configured: "Auto-lock configured (≤15 min)?",
  usb_ports_restricted: "USB / physical ports restricted?",
  hardening_check_dates: "Last two hardening check dates",
  deviations_documented: "Deviations from baseline with justification",
  known_gaps: "Known gaps and remediation plan",
};

export const B1_FORM_PLACEHOLDERS: Partial<Record<B1FormKey, string>> = {
  hardening_baseline_name: "e.g. CIS Windows Server 2019 Benchmark v2.0, DISA STIG RHEL 8 v1r10",
  network_device_admin_access: "Describe admin access method for network devices (out-of-band, controlled in-band, etc.)",
  hardening_check_dates: "Provide dates of the last two hardening checks (at least twice per year required)",
  deviations_documented: "List each deviation with justification and compensating controls",
  known_gaps: "Document any gaps in hardening coverage and planned remediation timeline",
};

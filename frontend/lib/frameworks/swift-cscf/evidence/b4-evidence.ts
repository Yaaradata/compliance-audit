/**
 * B4 Virtualisation Platform Configuration — structured evidence prompts.
 * Evidence type: Config Export / Screenshots
 * Controls covered: 1.3(M)
 */

export const B4_EVIDENCE_ITEM_ID = "B4";

export const B4_CONFIG_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "Hypervisor/cloud platform security configuration" },
  { id: "2", label: "VM isolation configuration preventing lateral movement" },
  { id: "3", label: "Network flow filtering for SWIFT VMs" },
  { id: "4", label: "Privileged access restriction settings on platform" },
  { id: "5", label: "Security update status of hypervisor/platform" },
  { id: "6", label: "Container isolation configuration (if applicable)" },
  { id: "7", label: "Cross-check: VMs must match A2 inventory host/guest mapping" },
];

export const B4_FORM_KEYS = {
  platform_type: "platform_type",
  platform_location: "platform_location",
  vm_isolation_configured: "vm_isolation_configured",
  network_flow_filtering: "network_flow_filtering",
  privileged_access_restrictions: "privileged_access_restrictions",
  platform_password_policy: "platform_password_policy",
  security_update_status: "security_update_status",
  mfa_for_vm_access: "mfa_for_vm_access",
  physical_protection: "physical_protection",
  container_isolation: "container_isolation",
  third_party_hosted: "third_party_hosted",
  third_party_comfort: "third_party_comfort",
  known_gaps: "known_gaps",
} as const;

export type B4FormKey = (typeof B4_FORM_KEYS)[keyof typeof B4_FORM_KEYS];

export const B4_FORM_LABELS: Record<B4FormKey, string> = {
  platform_type: "Virtualisation/cloud platform type",
  platform_location: "Platform located in secure zone?",
  vm_isolation_configured: "VM isolation configured to prevent lateral movement?",
  network_flow_filtering: "Network flow filtering for SWIFT VMs",
  privileged_access_restrictions: "Privileged access restrictions on platform",
  platform_password_policy: "Platform admin login/password policy applied?",
  security_update_status: "Hypervisor/platform security update status",
  mfa_for_vm_access: "MFA for interactive VM access?",
  physical_protection: "Physical protection of underlying hardware",
  container_isolation: "Container isolation configuration (if applicable)",
  third_party_hosted: "Third-party hosted?",
  third_party_comfort: "Third-party comfort evidence",
  known_gaps: "Known gaps and remediation plan",
};

export const B4_FORM_PLACEHOLDERS: Partial<Record<B4FormKey, string>> = {
  platform_type: "e.g. VMware vSphere 8.0, Hyper-V 2022, AWS EC2, Azure VM",
  network_flow_filtering: "Describe how network flows to/from SWIFT VMs are filtered (external or hypervisor-level)",
  privileged_access_restrictions: "Describe restrictions on platform admin access and privilege controls",
  security_update_status: "Current patch level, last update date, update frequency",
  physical_protection: "Describe physical security for hardware hosting SWIFT VMs",
  container_isolation: "If containerised apps are present, describe isolation configuration",
  third_party_comfort: "Describe evidence of reasonable comfort from the hosting provider",
  known_gaps: "Document gaps and planned remediation",
};

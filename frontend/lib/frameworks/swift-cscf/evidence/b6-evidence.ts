/**
 * B6 Hardening Baseline Comparison — structured evidence prompts.
 * Evidence type: Scan Report / Check Results
 * Controls covered: 2.3(M), 2.10(M), 6.2(M)
 */

export const B6_EVIDENCE_ITEM_ID = "B6";

export const B6_UPLOAD_GUIDANCE: { id: string; label: string }[] = [
  { id: "1", label: "Baseline comparison scan results per system type" },
  { id: "2", label: "Compliance score or pass/fail per hardening rule" },
  { id: "3", label: "Deviation list with justification and compensating controls" },
  { id: "4", label: "SWIFT application settings compared to Alliance Security Guidance" },
  { id: "5", label: "Authorized software baseline with hashes/checksums" },
  { id: "6", label: "Software baseline change history showing authorized updates" },
];

export const B6_FORM_KEYS = {
  baseline_name_version: "baseline_name_version",
  scan_date: "scan_date",
  scan_frequency: "scan_frequency",
  system_types_covered: "system_types_covered",
  deviation_summary: "deviation_summary",
  remediation_plan: "remediation_plan",
  swift_app_comparison: "swift_app_comparison",
  app_deviations: "app_deviations",
  authorized_software_baseline: "authorized_software_baseline",
  software_baseline_version_controlled: "software_baseline_version_controlled",
  known_gaps: "known_gaps",
} as const;

export type B6FormKey = (typeof B6_FORM_KEYS)[keyof typeof B6_FORM_KEYS];

export const B6_FORM_LABELS: Record<B6FormKey, string> = {
  baseline_name_version: "Hardening baseline name and version",
  scan_date: "Last scan date",
  scan_frequency: "Scan frequency",
  system_types_covered: "System types covered in scan",
  deviation_summary: "Deviation summary with justifications",
  remediation_plan: "Remediation plan for high-risk deviations",
  swift_app_comparison: "SWIFT app settings compared to Alliance Security Guidance?",
  app_deviations: "Application-specific deviations documented",
  authorized_software_baseline: "Authorized software baseline established?",
  software_baseline_version_controlled: "Software baseline version-controlled?",
  known_gaps: "Known gaps and remediation plan",
};

export const B6_FORM_PLACEHOLDERS: Partial<Record<B6FormKey, string>> = {
  baseline_name_version: "e.g. CIS Windows Server 2019 v2.0, DISA STIG RHEL 8 v1r10",
  system_types_covered: "List all system types: servers, operator PCs, jump servers, network devices, virtualisation platform",
  deviation_summary: "List each deviation with description, justification, and compensating control",
  remediation_plan: "Describe remediation plan and timeline for high-risk deviations",
  app_deviations: "Document application-specific deviations from vendor guidance with justification",
  known_gaps: "Document any gaps in baseline coverage and planned remediation",
};

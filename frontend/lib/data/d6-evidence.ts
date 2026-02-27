import type { FieldDef } from "@/components/domain/generic-intake-form";

export const D6_EVIDENCE_ITEM_ID = "D6";

export const D6_UPLOAD_GUIDANCE = [
  { id: "1", label: "Penetration test report covering SWIFT secure zone and all entry points" },
  { id: "2", label: "Test scope: operator PCs, jump servers, dedicated PCs, zone boundary, SWIFT components, network devices, virtualisation" },
  { id: "3", label: "Test methodology (whitebox/greybox/blackbox) and attack origin (internal/external)" },
  { id: "4", label: "Evidence of tester independence from SWIFT infrastructure team" },
  { id: "5", label: "Findings with exploitation path, severity rating, and affected component" },
  { id: "6", label: "Remediation recommendations per finding" },
  { id: "7", label: "Compliance statement with SWIFT Customer Testing Policy (no central services tested)" },
  { id: "8", label: "Test frequency: within last 2 years, and after any significant changes" },
  { id: "9", label: "Safeguards taken to prevent operational impact during testing" },
];

export const D6_FIELDS: FieldDef[] = [
  {
    key: "test_date",
    label: "Penetration test date",
    type: "date",
  },
  {
    key: "testing_firm",
    label: "Testing firm / provider",
    type: "text",
    placeholder: "e.g. CrowdStrike Services, NCC Group, internal red team",
  },
  {
    key: "tester_independence",
    label: "Tester independence from SWIFT infrastructure team",
    type: "select",
    options: [
      "Fully independent — external firm with no SWIFT operational role",
      "Independent internal team — no overlap with SWIFT infra team",
      "Partially independent — some overlap with SWIFT operations",
      "Not independent — tested by SWIFT infrastructure team",
    ],
  },
  {
    key: "test_methodology",
    label: "Testing methodology",
    type: "select",
    options: [
      "Whitebox (full knowledge of architecture/configs)",
      "Greybox (partial knowledge — credentials/network maps)",
      "Blackbox (no prior knowledge)",
      "Combination of approaches",
    ],
  },
  {
    key: "attack_origin",
    label: "Attack origin / perspective",
    type: "select",
    options: [
      "Both internal and external (combination)",
      "Internal only (from within network)",
      "External only (from outside perimeter)",
    ],
  },
  {
    key: "test_environment",
    label: "Test environment",
    type: "select",
    options: [
      "Production environment with safeguards",
      "Replicated environment matching production",
      "Both production and replicated",
      "Non-production / lab environment only",
    ],
  },
  {
    key: "scope_coverage",
    label: "Scope — components tested",
    type: "textarea",
    rows: 3,
    placeholder: "List all tested: operator PCs, jump servers, dedicated PCs, SWIFT servers, zone boundary (firewalls/gateways), network devices, virtualisation hosts. Note any exclusions with reason.",
  },
  {
    key: "test_frequency_compliance",
    label: "Test frequency compliance (at least every 2 years + after changes)",
    type: "select",
    options: [
      "Within last 2 years AND tested after significant changes",
      "Within last 2 years — no significant changes occurred",
      "Within last 2 years — significant changes not yet retested",
      "More than 2 years since last test",
    ],
  },
  {
    key: "environment_version",
    label: "Environment / application version at time of test",
    type: "text",
    placeholder: "e.g. Alliance Access 7.6, Windows Server 2022, vSphere 8.0",
  },
  {
    key: "total_findings",
    label: "Total findings from pen test",
    type: "text",
    placeholder: "e.g. 12 findings total",
  },
  {
    key: "critical_findings_count",
    label: "Critical severity findings",
    type: "text",
    placeholder: "e.g. 1 critical finding",
  },
  {
    key: "high_findings_count",
    label: "High severity findings",
    type: "text",
    placeholder: "e.g. 3 high findings",
  },
  {
    key: "findings_exploitation_details",
    label: "Key findings with exploitation paths",
    type: "textarea",
    rows: 4,
    placeholder: "For critical/high findings: finding title, exploitation path used, severity, affected component, potential impact. Include recommendations per finding.",
  },
  {
    key: "swift_testing_policy_compliance",
    label: "SWIFT Customer Testing Policy compliance",
    type: "select",
    options: [
      "Fully compliant — no SWIFT central services tested",
      "Compliant — scope explicitly excluded central services",
      "Uncertain — scope may have included restricted services",
      "Non-compliant — central services were tested",
    ],
  },
  {
    key: "operational_safeguards",
    label: "Safeguards against operational impact",
    type: "textarea",
    rows: 3,
    placeholder: "Describe safeguards: testing windows agreed, rollback plans, monitoring during testing, escalation contacts, scope limitations to protect operations",
  },
  {
    key: "known_gaps",
    label: "Known gaps or test limitations",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Components excluded from scope, testing limitations (e.g. HSM not directly testable), time constraints, areas requiring follow-up testing",
  },
];

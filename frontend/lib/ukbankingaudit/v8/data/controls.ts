/**
 * v8 controls and test results. Tests come from a deterministic schedule plus the
 * explicit exceptions below, so every effectiveness figure traces to a record.
 * Existing control ids (AML-, WP-, CO-, VO-) keep their ids from the mock graph.
 */
import { V8_CONFIG } from "../config";
import type { ControlResult, ControlTest, RatedControl, SmfRef } from "../types";

type Row = readonly [id: string, name: string, frequency?: "quarterly"];

type CategoryRows = {
  categoryId: string;
  owner: string;
  smf?: SmfRef;
  critical: Row[];
  secondary: Row[];
};

const CATEGORIES: CategoryRows[] = [
  {
    categoryId: "fincrime",
    owner: "Head of Financial Crime Compliance",
    smf: "SMF17",
    critical: [
      ["AML-C001", "AML Scenario Coverage Review", "quarterly"],
      ["AML-C002", "AML Alert Disposition SLA Control"],
      ["AML-C003", "AML Investigation Documentation Standard"],
      ["AML-C004", "L3 Escalation & SAR Decision Control"],
      ["AML-C005", "SAR Filing Timeliness Control"],
      ["AML-C006", "AML QA Sample Review Control"],
      ["WP-C001", "Wire Dual-Approval Control"],
      ["WP-C002", "Wire Sanctions Screening Control"],
      ["WP-C003", "Wire Beneficiary Callback Control"],
      ["CO-C001", "CIP Identity Verification Control"],
      ["CO-C002", "Beneficial Owner Identification Control"],
      ["FC-C012", "Sanctions List Update Timeliness"],
      ["FC-C013", "PEP Screening at Onboarding"],
      ["FC-C014", "High-Risk Customer EDD Approval"],
      ["FC-C015", "Periodic KYC Refresh Scheduling"],
      ["FC-C016", "Transaction Monitoring Threshold Tuning", "quarterly"],
      ["FC-C017", "Authorised Push Payment Fraud Interdiction"],
      ["FC-C018", "Mule Account Detection and Exit"],
      ["FC-C019", "Correspondent Banking Due Diligence", "quarterly"],
      ["FC-C020", "DAML Decision Timeliness"],
    ],
    secondary: [
      ["FC-S001", "AML Staff Training Completion", "quarterly"],
      ["FC-S002", "Alert Tuning Change Approval", "quarterly"],
    ],
  },
  {
    categoryId: "cyber",
    owner: "Head of Information Security",
    smf: "SMF24",
    critical: [
      ["CY-C001", "Critical Vulnerability Patching"],
      ["CY-C002", "Perimeter Firewall Rule Review"],
      ["CY-C003", "Multi-Factor Authentication Enforcement"],
      ["CY-C004", "Privileged Access Review"],
      ["CY-C005", "Endpoint Detection and Response"],
      ["CY-C006", "Security Event Monitoring"],
      ["CY-C007", "Cyber Incident Response Playbook Test", "quarterly"],
      ["CY-C008", "Immutable Backup and Restore"],
      ["CY-C009", "Third-Party Security Assurance", "quarterly"],
      ["CY-C010", "Data Loss Prevention"],
    ],
    secondary: [
      ["CY-S001", "Phishing Awareness Campaign", "quarterly"],
      ["CY-S002", "Secure Configuration Baseline", "quarterly"],
    ],
  },
  {
    categoryId: "credit",
    owner: "Head of Credit Risk",
    smf: "SMF4",
    critical: [
      ["CR-C001", "Credit Approval Authority Limits"],
      ["CR-C002", "Arrears and Forbearance Monitoring"],
      ["CR-C003", "Counterparty Limit Monitoring"],
      ["CR-C004", "IFRS 9 Staging Review", "quarterly"],
      ["CR-C005", "Credit Model Validation", "quarterly"],
      ["CR-C006", "Sector Concentration Monitoring"],
    ],
    secondary: [["CR-S001", "Collateral Revaluation Sampling", "quarterly"]],
  },
  {
    categoryId: "market",
    owner: "Head of Market Risk",
    critical: [
      ["MK-C001", "Daily VaR Limit Monitoring"],
      ["MK-C002", "Independent Price Verification"],
      ["MK-C003", "Hedge Effectiveness Testing", "quarterly"],
      ["MK-C004", "IRRBB Stress Testing", "quarterly"],
      ["MK-C005", "FX Position Limit Monitoring"],
    ],
    secondary: [["MK-S001", "VaR Model Backtesting", "quarterly"]],
  },
  {
    categoryId: "liquidity",
    owner: "Group Treasurer",
    smf: "SMF2",
    critical: [
      ["LQ-C001", "Daily LCR Calculation and Review"],
      ["LQ-C002", "Contingency Funding Plan Test", "quarterly"],
      ["LQ-C003", "Intraday Liquidity Monitoring"],
      ["LQ-C004", "ILAAP Stress Scenario Review", "quarterly"],
      ["LQ-C005", "Regulatory Liquidity Return Reconciliation"],
    ],
    secondary: [["LQ-S001", "Depositor Concentration Reporting"]],
  },
  {
    categoryId: "conduct",
    owner: "Head of Conduct Risk",
    smf: "SMF16",
    critical: [
      ["CD-C001", "Consumer Duty Outcomes Monitoring"],
      ["CD-C002", "Fair Value Assessment Review"],
      ["CD-C003", "Complaints Root Cause Review"],
      ["CD-C004", "Vulnerable Customer Treatment QA"],
      ["CD-C005", "Financial Promotions Approval"],
      ["CD-C006", "Product Governance Approval", "quarterly"],
    ],
    secondary: [["CD-S001", "Sales Call Quality Sampling"]],
  },
  {
    categoryId: "climate",
    owner: "Head of Climate Risk",
    critical: [
      ["CL-C001", "Transition Risk Sector Classification", "quarterly"],
      ["CL-C002", "Flood-Risk Collateral Overlay", "quarterly"],
      ["CL-C003", "Climate Scenario Pathway Refresh", "quarterly"],
      ["CL-C004", "Climate Disclosure Sign-off", "quarterly"],
    ],
    secondary: [["CL-S001", "Financed Emissions Data Quality", "quarterly"]],
  },
  {
    categoryId: "opsres",
    owner: "Head of Operational Resilience",
    critical: [
      ["VO-C005", "4th-Party Disclosure & Inventory Control", "quarterly"],
      ["OR-C002", "Impact Tolerance Scenario Testing", "quarterly"],
      ["OR-C003", "Change Release Approval"],
      ["OR-C004", "Payments Failover Test", "quarterly"],
      ["OR-C005", "Major Incident Communications"],
      ["OR-C006", "Material Outsourcing Oversight"],
    ],
    secondary: [["OR-S001", "Business Continuity Plan Attestation", "quarterly"]],
  },
  {
    categoryId: "regulatory",
    owner: "Head of Regulatory Affairs",
    smf: "SMF16",
    critical: [
      ["RG-C001", "Regulatory Change Applicability Assessment"],
      ["RG-C002", "Regulatory Return Sign-off"],
      ["RG-C003", "Regulatory Action Tracking"],
      ["RG-C004", "SM&CR Statement of Responsibilities Upkeep", "quarterly"],
      ["RG-C005", "Regulator Correspondence Log"],
    ],
    secondary: [["RG-S001", "Policy Attestation Completion", "quarterly"]],
  },
];

/** Controls whose accountable SMF, on the SMF record, differs from their category's. */
const SMF_OVERRIDES: Record<string, SmfRef> = {
  "WP-C001": "SMF24",
  "WP-C003": "SMF24",
  "VO-C005": "SMF24",
};

export const CONTROLS: RatedControl[] = CATEGORIES.flatMap(({ categoryId, owner, smf, critical, secondary }) => {
  const build = (tier: RatedControl["tier"]) => ([id, name, frequency]: Row): RatedControl => {
    const accountable = SMF_OVERRIDES[id] ?? smf;
    return {
      id,
      name,
      categoryId,
      tier,
      testFrequency: frequency ?? "monthly",
      owner,
      ...(accountable ? { smf: accountable } : {}),
    };
  };
  return [...critical.map(build("critical")), ...secondary.map(build("secondary"))];
});

const TESTER = "2nd line Control Testing";
const PASS_REASON = "Sample passed. No exceptions.";

/** November tests fall before the reporting date. Earlier months test on the 12th. */
function testDate(period: string): string {
  return `${period}-${period === V8_CONFIG.currentPeriod ? "03" : "12"}`;
}

const QUARTERLY_PERIODS = new Set(["2026-06", "2026-09"]);

/** From this period onward the control tests at this result, until a later entry. */
const RESULT_CHANGES: Record<string, ReadonlyArray<readonly [string, ControlResult, string]>> = {
  "WP-C003": [["2026-09", "partially_effective", "6 of 30 sampled callbacks lacked a timestamp or recorded number."]],
  "AML-C003": [["2026-10", "partially_effective", "Investigation memos missing rationale on sampled L2 cases."]],
  "AML-C002": [["2026-11", "not_effective", "Disposition control under capacity stress."]],
  "CY-C001": [["2026-08", "not_effective", "Critical vulnerabilities open beyond the patching standard."]],
  "CY-S002": [["2026-09", "partially_effective", "Baseline drift on 4% of sampled servers."]],
  "CD-S001": [["2026-10", "partially_effective", "Call scoring backlog reduced the sample size."]],
  "OR-S001": [["2026-09", "partially_effective", "Two plans attested after the due date."]],
};

/** Green on the board with no artefact this cycle (see DOMAIN_EVIDENCE). */
const NO_EVIDENCE_FROM: Record<string, string> = {
  "CD-C001": "2026-10",
  "CD-C002": "2026-10",
  "WP-C002": "2026-10",
};

/** Quarterly tests that did not happen in September, so they are now overdue. */
const MISSED_TESTS = new Set(["MK-C004@2026-09", "CL-C003@2026-09"]);

function resultFor(controlId: string, period: string): { result: ControlResult; reason: string } {
  let current: { result: ControlResult; reason: string } = { result: "effective", reason: PASS_REASON };
  for (const [from, result, reason] of RESULT_CHANGES[controlId] ?? []) {
    if (period >= from) current = { result, reason };
  }
  return current;
}

export const CONTROL_TESTS: ControlTest[] = CONTROLS.flatMap((control) =>
  V8_CONFIG.periods
    .filter((period) => control.testFrequency === "monthly" || QUARTERLY_PERIODS.has(period))
    .filter((period) => !MISSED_TESTS.has(`${control.id}@${period}`))
    .map((period) => {
      const noEvidenceFrom = NO_EVIDENCE_FROM[control.id];
      const hasEvidence = !noEvidenceFrom || period < noEvidenceFrom;
      return {
        controlId: control.id,
        date: testDate(period),
        tester: TESTER,
        evidenceId: hasEvidence ? `EV-CT-${control.id}-${period}` : null,
        ...resultFor(control.id, period),
      };
    }),
);

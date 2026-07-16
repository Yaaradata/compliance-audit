/**
 * ─────────────────────────────────────────────────────────────────────────
 *  UK Banking Audit — v5 evidence layer  (SYNTHETIC DATA)
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything exported from THIS file is SYNTHETIC and deterministic:
 *  DOMAIN_EVIDENCE, DOMAIN_HISTORY, RISK_ACCEPTANCES, DOMAIN_ACCOUNTABILITY
 *  and CRSA_MECHANISM_TAGS are hand-seeded to make the "status without
 *  evidence" demo stable. They are NOT real customer or firm records.
 *
 *  Precedents (Pass 3, precedents.ts) are REAL and public and are NEVER
 *  synthesised. Do not mix the two.
 *
 *  The nine domains + CRSA data + firm-posture function are re-exported from
 *  ../riskDomainsV4 UNCHANGED. This file adds only the evidence/history/
 *  accountability overlay. riskDomainsV4.ts is not edited.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { RagStatus } from "../riskDomainTypes";
import { RISK_DOMAINS_V4, CRSA_DATA, computeFirmPostureV4 } from "../riskDomainsV4";
import type {
  Accountability,
  FailureMechanism,
  RiskAcceptance,
  StatusEvidence,
  StatusHistory,
} from "./types";

// Re-export the v4 domains unchanged so v5 consumers have a single import site.
export { RISK_DOMAINS_V4, CRSA_DATA, computeFirmPostureV4 };

/**
 * CRSA reference → failure mechanisms the control guards against.
 * Tagged by reading `objective` + `requirement` on each control in
 * CRSA_DATA.fincrime. Controls with no confident mapping are LEFT OUT
 * (an untagged control produces no precedent match — correct and honest).
 *
 * Tagged 6 / 12:
 *   AML.01.04.01  accountability-orphan          (board member for MLR oversight identified)
 *   AML.01.05.02  assertion-unevidenced, cdd-coverage-shortfall  (MLRO reports to senior mgmt)
 *   AML.01.06.01  periodic-review-absent         (risk assessments completed and ratified)
 *   AML.01.08.01  cdd-coverage-shortfall         (high-risk relationships identified)
 *   SCTN.01.01.01 sanctions-screening-misconfigured (client funds screening)
 *   ABC.01.01.01  periodic-review-absent         (financial crime risk assessment in place)
 * Untagged 6 / 12 (deliberately, no confident mechanism):
 *   AML.01.01.01, AML.01.02.01, AML.01.12.01, AML.01.13.01, FRD.01.01.01, FRD.01.06.01
 */
export const CRSA_MECHANISM_TAGS: Record<string, FailureMechanism[]> = {
  "AML.01.04.01": ["accountability-orphan"],
  "AML.01.05.02": ["assertion-unevidenced", "cdd-coverage-shortfall"],
  "AML.01.06.01": ["periodic-review-absent"],
  "AML.01.08.01": ["cdd-coverage-shortfall"],
  "SCTN.01.01.01": ["sanctions-screening-misconfigured"],
  "ABC.01.01.01": ["periodic-review-absent"],
};

/**
 * Seeded status evidence, one entry per domain.
 *   • fincrime / "Sanctions / PEP Screening" — GREEN, artefactId null, ARMED  (Starling shape, flagship)
 *   • conduct  / "Consumer Duty"             — GREEN, artefactId null, ARMED
 *   • climate, market, opsres                — cadenceSource "register" → UNARMED
 *   • credit, liquidity, regulatory, cyber   — evidenced within cadence, ARMED
 * → 2 unevidenced GREEN assertions, 3 unarmed domains.
 */
export const DOMAIN_EVIDENCE: StatusEvidence[] = [
  {
    domainId: "fincrime",
    subCategory: "Sanctions / PEP Screening",
    crsaRef: "SCTN.01.01.01",
    artefactId: null,
    artefactTs: null,
    expectedCadenceDays: 90,
    cadenceSource: "human-confirmed",
    sourceSystem: "SanctionsScreeningEngine",
  },
  {
    domainId: "conduct",
    subCategory: "Consumer Duty",
    artefactId: null,
    artefactTs: null,
    expectedCadenceDays: 365,
    cadenceSource: "human-confirmed",
    sourceSystem: "ConsumerDutyMI",
  },
  {
    domainId: "climate",
    artefactId: "EVID-CLIMATE-TCFD-2026",
    artefactTs: "2026-05-20T00:00:00.000Z",
    expectedCadenceDays: 365,
    cadenceSource: "register",
    sourceSystem: "ESGRegister",
    sha256: "c11ma7e0000000000000000000000000000000000000000000000000tcfd2026",
  },
  {
    domainId: "market",
    artefactId: "EVID-MARKET-VAR-2026",
    artefactTs: "2026-06-15T00:00:00.000Z",
    expectedCadenceDays: 90,
    cadenceSource: "register",
    sourceSystem: "MarketRiskRegister",
    sha256: "3a12ke70000000000000000000000000000000000000000000000000var02026",
  },
  {
    domainId: "opsres",
    artefactId: "EVID-OPSRES-ITT-2026",
    artefactTs: "2026-04-30T00:00:00.000Z",
    expectedCadenceDays: 180,
    cadenceSource: "register",
    sourceSystem: "OpResRegister",
    sha256: "0b57e50000000000000000000000000000000000000000000000000itt02026",
  },
  {
    domainId: "credit",
    artefactId: "EVID-CREDIT-VALIDATION-2026",
    artefactTs: "2026-06-05T00:00:00.000Z",
    expectedCadenceDays: 90,
    cadenceSource: "human-confirmed",
    sourceSystem: "CreditModelGov",
    sha256: "c2ed17c0de0000000000000000000000000000000000000000000val020260",
  },
  {
    domainId: "liquidity",
    artefactId: "EVID-LIQ-LCR-2026-06",
    artefactTs: "2026-06-28T00:00:00.000Z",
    expectedCadenceDays: 30,
    cadenceSource: "human-confirmed",
    sourceSystem: "TreasuryALM",
    sha256: "11901d17c0de00000000000000000000000000000000000000000lcr020266",
  },
  {
    domainId: "regulatory",
    artefactId: "EVID-REG-FINDINGS-2026-Q2",
    artefactTs: "2026-06-20T00:00:00.000Z",
    expectedCadenceDays: 90,
    cadenceSource: "human-confirmed",
    sourceSystem: "RegChangeRegister",
    sha256: "0e60000000000000000000000000000000000000000000000000reg02026q2",
  },
  {
    domainId: "cyber",
    artefactId: "EVID-CYBER-CLOSURE-2026-07",
    artefactTs: "2026-07-02T00:00:00.000Z",
    expectedCadenceDays: 30,
    cadenceSource: "human-confirmed",
    sourceSystem: "InfoSecClosurePack",
    sha256: "cbe70000000000000000000000000000000000000000000000000closure07",
    confirmedBy: "Head of InfoSec",
    confirmedAt: "2026-07-02T16:40:00.000Z",
  },
];

/** Twelve monthly review cycles, newest LAST. Shared by every domain history. */
const REVIEW_DATES: readonly string[] = [
  "2025-07-31", "2025-08-31", "2025-09-30", "2025-10-31", "2025-11-30", "2025-12-31",
  "2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30", "2026-05-31", "2026-06-30",
];

function buildHistory(domainId: string, statuses: readonly RagStatus[]): StatusHistory {
  if (statuses.length !== REVIEW_DATES.length) {
    throw new Error(
      `DOMAIN_HISTORY ${domainId}: expected ${REVIEW_DATES.length} statuses, got ${statuses.length}`,
    );
  }
  return {
    domainId,
    cycles: REVIEW_DATES.map((reviewDate, i) => ({ reviewDate, status: statuses[i] })),
  };
}

const G: RagStatus = "GREEN";
const A: RagStatus = "AMBER";
const R: RagStatus = "RED";

/**
 * 12-cycle status history per domain.
 * fincrime is AMBER for the last 7 consecutive cycles — that is what makes its
 * v4 "stable / +5" record legible as a seven-month-old unresolved amber.
 */
export const DOMAIN_HISTORY: StatusHistory[] = [
  buildHistory("credit", [G, G, G, G, G, G, G, G, G, G, G, G]),
  buildHistory("market", [G, G, G, G, G, G, G, G, G, G, G, G]),
  buildHistory("liquidity", [G, G, G, G, G, G, G, G, G, G, G, G]),
  buildHistory("conduct", [G, G, G, G, G, G, G, G, G, G, G, G]),
  buildHistory("climate", [G, G, G, G, G, G, G, G, G, G, G, G]),
  buildHistory("fincrime", [G, G, G, G, G, A, A, A, A, A, A, A]),
  buildHistory("opsres", [G, G, G, G, G, G, G, G, G, G, G, G]),
  buildHistory("cyber", [G, G, G, G, G, G, G, G, G, R, R, R]),
  buildHistory("regulatory", [G, G, G, G, G, G, G, G, G, G, G, G]),
];

/**
 * Open risk acceptance for fincrime. Approved for 90 days by the Banking
 * Proposition Board on 2024-09-12 and never re-approved. As of 2026-07-10 the
 * position has stood ≈ 666 days against 90 approved (see acceptanceElapsedDays).
 */
export const RISK_ACCEPTANCES: RiskAcceptance[] = [
  {
    id: "RA-FINCRIME-2024-001",
    domainId: "fincrime",
    committee: "Banking Proposition Board",
    acceptedAt: "2024-09-12",
    approvedDurationDays: 90,
    rationale:
      "Periodic KYC refresh backlog on high-risk relationships tolerated pending the core-banking migration and a dedicated remediation team.",
    linkedFindingRef: "IA-2024-AML-019",
  },
];

/** Whole days elapsed between an acceptance date and `asOf` (both ISO dates). Pure. */
export function acceptanceElapsedDays(acceptance: RiskAcceptance, asOf: string): number {
  const start = Date.parse(`${acceptance.acceptedAt}T00:00:00.000Z`);
  const end = Date.parse(asOf.length === 10 ? `${asOf}T00:00:00.000Z` : asOf);
  return Math.floor((end - start) / 86_400_000);
}

/**
 * Domain → accountable owner. Six of nine map to a UK SMF; three are left
 * UNOWNED on purpose — the Nationwide Final Notice records "no clear owner"
 * as a root cause, so an orphan is the point, not a data gap.
 */
export const DOMAIN_ACCOUNTABILITY: Record<string, Accountability> = {
  credit: {
    regime: "UK", smf: "SMF4", holder: "R. Adeyemi",
    prescribedResponsibility: "Overall management of the firm's risk controls (CRO).",
  },
  liquidity: {
    regime: "UK", smf: "SMF2", holder: "H. Kowalski",
    prescribedResponsibility: "Production and integrity of the firm's financial information (CFO).",
  },
  conduct: {
    regime: "UK", smf: "SMF16", holder: "P. Nwachukwu",
    prescribedResponsibility: "Compliance with the firm's obligations under the regulatory system.",
  },
  fincrime: {
    regime: "UK", smf: "SMF17", holder: "D. Fairweather",
    prescribedResponsibility: "AML/CTF systems and controls (MLR 2017 reg 21 MLRO).",
  },
  cyber: {
    regime: "UK", smf: "SMF24", holder: "L. Marchetti",
    prescribedResponsibility: "Internal operations and technology of the firm.",
  },
  regulatory: {
    regime: "UK", smf: "SMF16", holder: "P. Nwachukwu",
    prescribedResponsibility: "Oversight of regulatory change and horizon scanning.",
  },
  market: { regime: "UK", unowned: true },
  climate: { regime: "UK", unowned: true },
  opsres: { regime: "UK", unowned: true },
};

/**
 * US accountability regime — the SAME nine domains, re-expressed as owner + three-lines
 * + MRA reference rather than SMF + prescribed responsibility. The failure mechanism is
 * regulator-agnostic; only the attribution language changes with region. The three UK
 * orphans stay orphaned here too — "no clear owner" is the finding in either regime.
 */
export const DOMAIN_ACCOUNTABILITY_US: Record<string, Accountability> = {
  credit: { regime: "US", owner: "R. Delgado", threeLines: 2, mraRef: "MRA-2024-017" },
  liquidity: { regime: "US", owner: "S. Petrov", threeLines: 1, mraRef: null },
  conduct: { regime: "US", owner: "M. Okafor", threeLines: 2, mraRef: "MRA-2025-004" },
  fincrime: { regime: "US", owner: "T. Brennan", threeLines: 2, mraRef: "MRA-2023-118" },
  cyber: { regime: "US", owner: "K. Yamamoto", threeLines: 1, mraRef: "MRA-2025-061" },
  regulatory: { regime: "US", owner: "M. Okafor", threeLines: 2, mraRef: null },
  market: { regime: "US", unowned: true },
  climate: { regime: "US", unowned: true },
  opsres: { regime: "US", unowned: true },
};

/** Accountability for a domain in the given regime; a same-regime orphan if unmapped. */
export function getAccountability(domainId: string, jurisdiction: "UK" | "US"): Accountability {
  const table = jurisdiction === "US" ? DOMAIN_ACCOUNTABILITY_US : DOMAIN_ACCOUNTABILITY;
  return table[domainId] ?? { regime: jurisdiction, unowned: true };
}

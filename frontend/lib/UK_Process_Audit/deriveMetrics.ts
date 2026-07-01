import type {
  UkAuditControl,
  UkControlStatus,
  UkProcessAuditDomainId,
  UkRawControlRow,
  UkResidualRisk,
} from "./types";

/**
 * Audit-test metrics (population, sample, exceptions, compliance, residual risk) are NOT
 * in the source CSV. They are synthesised here deterministically from the control id so the
 * demo dashboard is stable across renders/builds while looking like a real testing cycle.
 */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 seeded PRNG — pure, deterministic. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

/** Domains with inherently higher inherent risk see more exceptions. */
const DOMAIN_RISK_WEIGHT: Record<UkProcessAuditDomainId, number> = {
  FC: 1.6,
  FRD: 1.5,
  COL: 1.3,
  PAY: 1.2,
  LEN: 1.1,
  ONB: 1.05,
  CMP: 1.0,
  DEP: 0.9,
};

const TESTERS = [
  "Internal Audit",
  "2LoD Assurance",
  "Co-source (KPMG)",
  "IA Data Analytics",
  "Financial Crime QA",
  "Conduct Assurance",
];

/** Rough "last tested" label derived from the control's testing frequency. */
function lastTestedLabel(frequency: string, rng: () => number): string {
  const f = frequency.toLowerCase();
  if (f.includes("continuous")) return "Live · 24 Jun 2026";
  if (f.includes("month")) {
    const months = ["Apr 2026", "May 2026", "Jun 2026"];
    return months[randInt(rng, 0, months.length - 1)];
  }
  if (f.includes("quarter")) return "Q1 FY26";
  if (f.includes("annual")) return "FY25 cycle";
  if (f.includes("event")) return "Programme to date";
  return "Q1 FY26";
}

function deriveStatus(compliance: number, violations: number): UkControlStatus {
  if (violations >= 1 || compliance < 90) return "deficient";
  if (compliance < 96) return "needs-attention";
  return "effective";
}

function deriveResidualRisk(compliance: number, violations: number): UkResidualRisk {
  if (violations >= 3 || compliance < 88) return "Critical";
  if (violations >= 2 || compliance < 92) return "High";
  if (violations >= 1 || compliance < 96.5) return "Medium";
  return "Low";
}

export function deriveControlMetrics(row: UkRawControlRow): UkAuditControl {
  const rng = makeRng(hashString(row.controlId));
  const weight = DOMAIN_RISK_WEIGHT[row.domainCode] ?? 1;

  // Manual + external controls carry more testing risk.
  const natureBump = row.automationLevel === "Manual" ? 1.4 : row.automationLevel === "Semi-automated" ? 1.1 : 0.8;
  const sourceBump = row.controlSource === "External" ? 1.15 : 1;

  const population = randInt(rng, 4, 260) * 100; // 400 – 26,000
  const sample = randInt(rng, 40, 120);

  const baseExceptions = rng() * 9 * weight * natureBump * sourceBump;
  const exceptions = Math.min(sample, Math.round(baseExceptions));
  const violations = exceptions >= 6 ? randInt(rng, 1, Math.max(1, Math.floor(exceptions / 4))) : 0;

  const compliance = Number(
    Math.max(80, Math.min(100, 100 - (exceptions / sample) * 100 - violations * 0.6)).toFixed(1),
  );

  const status = deriveStatus(compliance, violations);
  const residualRisk = deriveResidualRisk(compliance, violations);

  return {
    ...row,
    population,
    sample,
    exceptions,
    violations,
    compliance,
    status,
    residualRisk,
    lastTested: lastTestedLabel(row.testingFrequency, rng),
    tester: TESTERS[randInt(rng, 0, TESTERS.length - 1)],
  };
}

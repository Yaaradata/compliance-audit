/**
 * Ownership lens data — hand-seeded demo data, NOT real customer or firm records.
 * Precedents remain REAL and are never mixed with this.
 *
 * Extends DOMAIN_ACCOUNTABILITY (riskDomainsV6.ts) with a reasonable-steps trail
 * age per domain. SYSC 25/26: no prescribed responsibility may be unallocated.
 */
import { DOMAIN_ACCOUNTABILITY } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import type { Accountability } from "@/lib/ukbankingaudit/v6/types";

export type OwnershipTrail = {
  domainId: string;
  lastRecordedStep: string | null;
  stepType: "attestation" | "escalation" | "challenge" | "decision" | null;
  stepRef: string | null;
};

/** Matches the product's existing as-of date. */
export const AS_OF = "2026-07-23";

export const OWNERSHIP_TRAIL: OwnershipTrail[] = [
  { domainId: "credit", lastRecordedStep: "2026-06-18", stepType: "attestation", stepRef: "EV-RS-Q2-CRO-004" },
  { domainId: "liquidity", lastRecordedStep: "2026-05-29", stepType: "decision", stepRef: "EV-RS-Q2-CFO-002" },
  { domainId: "conduct", lastRecordedStep: "2026-04-02", stepType: "attestation", stepRef: "EV-RS-Q1-SMF16-007" },
  { domainId: "fincrime", lastRecordedStep: "2026-07-09", stepType: "escalation", stepRef: "EV-RS-Q2-MLRO-011" },
  { domainId: "cyber", lastRecordedStep: "2026-07-14", stepType: "escalation", stepRef: "EV-RS-Q2-SMF24-003" },
  { domainId: "regulatory", lastRecordedStep: "2026-01-16", stepType: "challenge", stepRef: "EV-RS-Q4-SMF16-001" },
  { domainId: "market", lastRecordedStep: null, stepType: null, stepRef: null },
  { domainId: "climate", lastRecordedStep: null, stepType: null, stepRef: null },
  { domainId: "opsres", lastRecordedStep: null, stepType: null, stepRef: null },
];

/** Appetite line — UK-regulatory, not firm preference. */
export const OWNERSHIP_APPETITE = {
  unallocatedDomains: 0,
  maxTrailAgeDays: 90,
};

export type OwnershipState = "OWNED_CURRENT" | "OWNED_STALE" | "UNALLOCATED";

export type OwnershipStateResult = {
  state: OwnershipState;
  smf: string | null;
  holder: string | null;
  prescribedResponsibility: string | null;
  trailAgeDays: number | null;
  stepRef: string | null;
  stepType: OwnershipTrail["stepType"];
};

/** Whole days between two ISO dates (YYYY-MM-DD). Pure. */
export function daysBetween(fromIso: string, toIso: string): number {
  const start = Date.parse(`${fromIso.slice(0, 10)}T00:00:00.000Z`);
  const end = Date.parse(`${toIso.slice(0, 10)}T00:00:00.000Z`);
  return Math.floor((end - start) / 86_400_000);
}

function isUnowned(acc: Accountability | undefined): boolean {
  return !acc || ("unowned" in acc && acc.unowned === true);
}

export function getOwnershipState(domainId: string): OwnershipStateResult {
  const acc = DOMAIN_ACCOUNTABILITY[domainId];
  const trail = OWNERSHIP_TRAIL.find((t) => t.domainId === domainId);

  if (isUnowned(acc)) {
    return {
      state: "UNALLOCATED",
      smf: null,
      holder: null,
      prescribedResponsibility: null,
      trailAgeDays: null,
      stepRef: trail?.stepRef ?? null,
      stepType: trail?.stepType ?? null,
    };
  }

  if (acc.regime !== "UK" || !("smf" in acc)) {
    return {
      state: "UNALLOCATED",
      smf: null,
      holder: null,
      prescribedResponsibility: null,
      trailAgeDays: null,
      stepRef: trail?.stepRef ?? null,
      stepType: trail?.stepType ?? null,
    };
  }

  const lastStep = trail?.lastRecordedStep ?? null;
  const trailAgeDays = lastStep === null ? null : daysBetween(lastStep, AS_OF);
  const stale =
    trailAgeDays !== null && trailAgeDays > OWNERSHIP_APPETITE.maxTrailAgeDays;

  return {
    state: stale ? "OWNED_STALE" : "OWNED_CURRENT",
    smf: acc.smf,
    holder: acc.holder,
    prescribedResponsibility: acc.prescribedResponsibility,
    trailAgeDays,
    stepRef: trail?.stepRef ?? null,
    stepType: trail?.stepType ?? null,
  };
}

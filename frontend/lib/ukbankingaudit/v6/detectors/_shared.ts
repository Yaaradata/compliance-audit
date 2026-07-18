/**
 * Shared, PURE utilities for the v6 board detectors.
 *
 * The evaluation clock is a FIXED constant, never Date.now(), so every detector
 * and runBoardDetectors() is deterministic across invocations (a hard acceptance
 * requirement). Bump EVALUATED_AT deliberately, never implicitly.
 */
import type { Accountability, FailureMechanism, Precedent, RiskDomainV4 } from "../types";
import { matchPrecedents } from "../precedentCorpus";
import { primaryPrecedent, rankPrecedents } from "../precedentRank";
import { DOMAIN_ACCOUNTABILITY, RISK_DOMAINS_V4 } from "../riskDomainsV6";

export const EVALUATED_AT = "2026-07-10T00:00:00.000Z";
export const NOW_MS = Date.parse(EVALUATED_AT);
export const DAY_MS = 86_400_000;

/** Trailing window we hold armed, evidence-producing controls to. */
export const COVERAGE_WINDOW_DAYS = 365;
/** Buffer after an expected date before an artefact is treated as overdue. */
export const GRACE_DAYS = 14;

export function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function findDomain(domainId: string): RiskDomainV4 | undefined {
  return RISK_DOMAINS_V4.find((d) => d.id === domainId);
}

export function domainName(domainId: string): string {
  return findDomain(domainId)?.name ?? domainId;
}

/** Status of a domain, or of one of its sub-categories when `subCategory` is given. */
export function statusOf(domainId: string, subCategory?: string): RiskDomainV4["status"] | undefined {
  const domain = findDomain(domainId);
  if (!domain) return undefined;
  if (!subCategory) return domain.status;
  return domain.subCategories.find((s) => s.name === subCategory)?.status;
}

/** Accountability record for a domain; a synthetic UK orphan if none is mapped. */
export function accountabilityFor(domainId: string): Accountability {
  return DOMAIN_ACCOUNTABILITY[domainId] ?? { regime: "UK", unowned: true };
}

/** Rank and cap precedents; derive primaryPrecedent for a signal payload. */
export function precedentFields(precedents: Precedent[]): {
  precedents: Precedent[];
  primaryPrecedent: Precedent | null;
} {
  const ranked = rankPrecedents(precedents);
  return { precedents: ranked, primaryPrecedent: primaryPrecedent(ranked) };
}

/** Mechanism tags used to find a domain-appropriate precedent for green-without-evidence. */
export function greenWithoutEvidencePrecedentTags(
  domainId: string,
  subCategory?: string,
): FailureMechanism[] {
  if (domainId === "fincrime" && subCategory?.includes("Sanctions")) {
    return ["sanctions-screening-misconfigured"];
  }
  if (domainId === "conduct") {
    return ["remediation-unevidenced", "closure-signed-unevidenced"];
  }
  return ["assertion-unevidenced"];
}

export function matchPrecedentsForDomain(
  tags: FailureMechanism[],
  jurisdiction: "UK" | "US",
  domainId: string,
): Precedent[] {
  return rankPrecedents(matchPrecedents(tags, jurisdiction, domainId));
}

const MONTHS: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

/**
 * Parse a loose deadline display string such as "RED UNTIL 18-JUL" into epoch ms,
 * anchored to the evaluation year. Returns null when no day-month token is found —
 * a deadline we cannot parse is one we must not claim to evaluate.
 */
export function parseDeadline(display: string | undefined): number | null {
  if (!display) return null;
  const m = /(\d{1,2})[-\s]([A-Za-z]{3})/.exec(display);
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTHS[m[2].toUpperCase()];
  if (month === undefined) return null;
  const year = new Date(NOW_MS).getUTCFullYear();
  return Date.UTC(year, month, day);
}

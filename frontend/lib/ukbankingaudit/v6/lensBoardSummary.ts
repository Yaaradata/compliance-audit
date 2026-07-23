/**
 * Board-level summaries for the three new lenses — hand-seeded demo inputs via
 * ownership / momentum / defensibility modules. NOT real firm records.
 * Precedents remain REAL and are never mixed with this.
 */
import { RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import { getOwnershipState } from "@/lib/ukbankingaudit/v6/ownershipData";
import {
  getDomainMomentum,
  MOMENTUM_APPETITE,
} from "@/lib/ukbankingaudit/v6/momentumData";
import {
  getDefensibility,
  getPackIntegrity,
  OBLIGATION_COVERAGE,
} from "@/lib/ukbankingaudit/v6/defensibilityData";

export type FirmLensPostureLines = {
  ownershipLine: string;
  momentumLine: string;
  defensibilityLine: string;
};

/** Ownership / momentum / defensibility one-liners under the firm GREEN banner. */
export function getFirmLensPostureLines(): FirmLensPostureLines {
  const domainIds = RISK_DOMAINS_V4.map((d) => d.id);

  let unallocated = 0;
  let stale = 0;
  for (const id of domainIds) {
    const own = getOwnershipState(id);
    if (own.state === "UNALLOCATED") unallocated += 1;
    else if (own.state === "OWNED_STALE") stale += 1;
  }

  let greenProjectedWithinRed = 0;
  for (const d of RISK_DOMAINS_V4) {
    if (d.status !== "GREEN") continue;
    const mom = getDomainMomentum(d.id);
    if (
      mom.state === "PROJECTED_BREACH_RED" &&
      mom.daysToBreach !== null &&
      mom.daysToBreach <= MOMENTUM_APPETITE.redHorizonDays
    ) {
      greenProjectedWithinRed += 1;
    }
  }

  const pack = getPackIntegrity();
  const unmappedObligations = OBLIGATION_COVERAGE.reduce(
    (sum, row) => sum + row.unmappedRefs.length,
    0,
  );

  return {
    ownershipLine:
      `${unallocated} of ${domainIds.length} domains have no named Senior Manager · ` +
      `${stale} more have no recorded step in 90 days.`,
    momentumLine:
      `${greenProjectedWithinRed} green domain${greenProjectedWithinRed === 1 ? "" : "s"} ` +
      `${greenProjectedWithinRed === 1 ? "is" : "are"} projected to breach risk appetite within ${MOMENTUM_APPETITE.redHorizonDays} days.`,
    defensibilityLine:
      `${pack.pct}% of this pack is within data cadence · ` +
      `${unmappedObligations} obligations map to no control.`,
  };
}

export type DefensibilityCheckCount = 0 | 1 | 2 | 3;

/** How many of the three defensibility checks are clean for a domain. */
export function countDefensibilityChecksPassed(domainId: string): DefensibilityCheckCount {
  const d = getDefensibility(domainId);
  let n = 0;
  if (d.obligationGaps === 0) n += 1;
  if (d.retrievabilityPct >= 95) n += 1;
  if (d.feedState === "FRESH") n += 1;
  return n as DefensibilityCheckCount;
}

/**
 * Cross-lens "fail" — strict enough that only the climate demo card fires:
 *   Ownership fail     = UNALLOCATED (orphan)
 *   Momentum fail      = ALREADY_BREACHED | PROJECTED_BREACH_RED
 *   Defensibility fail = INDEFENSIBLE
 * Soft states (OWNED_STALE, PROJECTED_BREACH_AMBER, AT_RISK) do not count.
 */
export function ownershipFailsCrossLens(domainId: string): boolean {
  return getOwnershipState(domainId).state === "UNALLOCATED";
}

export function momentumFailsCrossLens(domainId: string): boolean {
  const state = getDomainMomentum(domainId).state;
  return state === "ALREADY_BREACHED" || state === "PROJECTED_BREACH_RED";
}

export function defensibilityFailsCrossLens(domainId: string): boolean {
  return getDefensibility(domainId).state === "INDEFENSIBLE";
}

export function countCrossLensFails(domainId: string): number {
  let n = 0;
  if (ownershipFailsCrossLens(domainId)) n += 1;
  if (momentumFailsCrossLens(domainId)) n += 1;
  if (defensibilityFailsCrossLens(domainId)) n += 1;
  return n;
}

export type CrossLensFinding = {
  domainId: string;
  domainName: string;
  boardStatus: "GREEN";
  failCount: number;
  lines: string[];
};

/** GREEN board domains that fail two or more of the three new lenses. */
export function getCrossLensFindings(): CrossLensFinding[] {
  const findings: CrossLensFinding[] = [];
  for (const domain of RISK_DOMAINS_V4) {
    if (domain.status !== "GREEN") continue;
    const failCount = countCrossLensFails(domain.id);
    if (failCount < 2) continue;

    const own = getOwnershipState(domain.id);
    const mom = getDomainMomentum(domain.id);
    const def = getDefensibility(domain.id);

    const lines: string[] = [
      `${domain.name} reads GREEN on this pack.`,
    ];

    if (own.state === "UNALLOCATED") {
      lines.push("No Senior Manager is mapped to it.");
    } else if (own.state === "OWNED_STALE") {
      lines.push(
        `Last recorded reasonable steps entry is ${own.trailAgeDays} days old.`,
      );
    }

    if (
      (mom.state === "PROJECTED_BREACH_RED" || mom.state === "PROJECTED_BREACH_AMBER") &&
      mom.daysToBreach !== null
    ) {
      lines.push(
        `${mom.worstKri} is projected to breach appetite in ${mom.daysToBreach} days.`,
      );
    } else if (mom.state === "ALREADY_BREACHED") {
      lines.push(`${mom.worstKri} is already outside risk appetite.`);
    }

    const feedBit =
      def.feedState === "UNATTRIBUTED"
        ? "the data feed has no named source"
        : def.feedState === "STALE"
          ? `the data feed is ${def.feedAgeDays} days old against cadence`
          : null;
    if (def.obligationGaps > 0 && feedBit) {
      lines.push(
        `${def.obligationGaps} obligation${def.obligationGaps === 1 ? "" : "s"} map to no control and ${feedBit}.`,
      );
    } else if (def.obligationGaps > 0) {
      lines.push(
        `${def.obligationGaps} obligation${def.obligationGaps === 1 ? "" : "s"} map to no control.`,
      );
    } else if (feedBit) {
      lines.push(`The data feed: ${feedBit}.`);
    }

    findings.push({
      domainId: domain.id,
      domainName: domain.name,
      boardStatus: "GREEN",
      failCount,
      lines,
    });
  }
  return findings;
}

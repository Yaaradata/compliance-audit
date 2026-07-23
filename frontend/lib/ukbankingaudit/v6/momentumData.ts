/**
 * Momentum lens data — hand-seeded demo data, NOT real customer or firm records.
 * Precedents remain REAL and are never mixed with this.
 *
 * Twelve-period KRI history aligned to REVIEW_DATES. Last value MUST equal the
 * current KRI value on riskDomainsV4. Projection is deterministic least-squares
 * over the trailing three periods only — no ML (PRA SS1/23 model governance).
 */
import { RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/riskDomainsV4";
import { REVIEW_DATES } from "@/lib/ukbankingaudit/v6/riskDomainsV6";

export type KriHistory = {
  domainId: string;
  kriLabel: string;
  direction: "lower-is-better" | "higher-is-better";
  values: number[];
};

export const KRI_HISTORY: KriHistory[] = [
  // CREDIT
  {
    domainId: "credit",
    kriLabel: "NPL Ratio",
    direction: "lower-is-better",
    values: [0.9, 0.9, 1.0, 1.0, 1.0, 1.1, 1.1, 1.1, 1.1, 1.2, 1.2, 1.2],
  },
  {
    domainId: "credit",
    kriLabel: "Watchlist Names",
    direction: "lower-is-better",
    values: [19, 20, 21, 21, 22, 22, 23, 23, 22, 23, 23, 23],
  },

  // MARKET
  {
    domainId: "market",
    kriLabel: "VaR Utilisation",
    direction: "lower-is-better",
    values: [58, 60, 61, 63, 64, 66, 67, 68, 69, 70, 71, 72],
  },
  {
    domainId: "market",
    kriLabel: "Hedge Effectiveness",
    direction: "higher-is-better",
    values: [97, 97, 96, 97, 96, 96, 97, 96, 96, 96, 96, 96],
  },

  // LIQUIDITY
  {
    domainId: "liquidity",
    kriLabel: "LCR",
    direction: "higher-is-better",
    values: [155, 154, 152, 151, 149, 148, 147, 146, 145, 144, 143, 142],
  },
  {
    domainId: "liquidity",
    kriLabel: "NSFR",
    direction: "higher-is-better",
    values: [124, 123, 123, 122, 122, 121, 121, 120, 120, 119, 119, 118],
  },

  // CONDUCT
  {
    domainId: "conduct",
    kriLabel: "FOS Overturn Rate",
    direction: "lower-is-better",
    values: [9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12, 12],
  },
  {
    domainId: "conduct",
    kriLabel: "Complaints per 1k Customers",
    direction: "lower-is-better",
    values: [1.1, 1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 2.0, 2.6, 3.2],
  },

  // CLIMATE
  {
    domainId: "climate",
    kriLabel: "High-Carbon Sector Exposure",
    direction: "lower-is-better",
    values: [4.2, 4.3, 4.5, 4.6, 4.8, 4.9, 5.1, 5.2, 5.4, 5.6, 6.2, 6.8],
  },

  // FINCRIME
  {
    domainId: "fincrime",
    kriLabel: "KYC Periodic Review Backlog",
    direction: "lower-is-better",
    values: [1850, 2010, 2240, 2480, 2710, 2960, 3180, 3390, 3610, 3820, 4020, 4210],
  },
  {
    domainId: "fincrime",
    kriLabel: "High-Risk Reviews Overdue",
    direction: "lower-is-better",
    values: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  },
  {
    domainId: "fincrime",
    kriLabel: "TM Alerts Closed in SLA",
    direction: "higher-is-better",
    values: [97, 96, 96, 95, 94, 93, 92, 91, 90, 89, 87, 86],
  },
  {
    domainId: "fincrime",
    kriLabel: "EDD Completed on Time",
    direction: "higher-is-better",
    values: [99, 99, 98, 98, 97, 97, 96, 96, 95, 95, 94, 93],
  },
  {
    domainId: "fincrime",
    kriLabel: "Sanctions Screening Coverage",
    direction: "higher-is-better",
    values: [100, 100, 100, 100, 100, 99.99, 99.98, 99.97, 99.95, 99.93, 99.91, 99.9],
  },

  // OPSRES
  {
    domainId: "opsres",
    kriLabel: "IBS Within Tolerance",
    direction: "higher-is-better",
    values: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  },

  // CYBER
  {
    domainId: "cyber",
    kriLabel: "Critical Vulnerabilities Open",
    direction: "lower-is-better",
    values: [0, 0, 1, 0, 1, 2, 1, 2, 2, 3, 3, 3],
  },
  {
    domainId: "cyber",
    kriLabel: "Mean Time to Patch (Critical)",
    direction: "lower-is-better",
    values: [6, 7, 7, 8, 9, 10, 11, 13, 14, 16, 17, 18],
  },
  {
    domainId: "cyber",
    kriLabel: "MFA Coverage",
    direction: "higher-is-better",
    values: [99.95, 99.94, 99.93, 99.92, 99.9, 99.88, 99.86, 99.84, 99.82, 99.78, 99.74, 99.7],
  },

  // REGULATORY
  {
    domainId: "regulatory",
    kriLabel: "Open Regulatory Findings",
    direction: "lower-is-better",
    values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    domainId: "regulatory",
    kriLabel: "Overdue Reg Actions",
    direction: "lower-is-better",
    values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

/** Appetite — Part 1 is the existing KRI target; Part 2 is firm early-warning horizons. */
export const MOMENTUM_APPETITE = { redHorizonDays: 90, amberHorizonDays: 180 };

export type MomentumState =
  | "ALREADY_BREACHED"
  | "PROJECTED_BREACH_RED"
  | "PROJECTED_BREACH_AMBER"
  | "STABLE"
  | "IMPROVING"
  | "AT_TARGET_NO_HEADROOM";

export type KriMomentumResult = {
  state: MomentumState;
  slopePerMonth: number;
  daysToBreach: number | null;
  projectedValue: number | null;
  values: number[];
  direction: "lower-is-better" | "higher-is-better";
  target: number;
};

export type DomainMomentumResult = {
  state: MomentumState;
  worstKri: string;
  daysToBreach: number | null;
};

const DAYS_PER_MONTH = 365 / 12;

const STATE_RANK: Record<MomentumState, number> = {
  ALREADY_BREACHED: 6,
  PROJECTED_BREACH_RED: 5,
  PROJECTED_BREACH_AMBER: 4,
  AT_TARGET_NO_HEADROOM: 3,
  STABLE: 2,
  IMPROVING: 1,
};

/** Ordinary least-squares slope for y against x = 0..n-1. */
function olsSlope(ys: number[]): number {
  const n = ys.length;
  if (n < 2) return 0;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i += 1) {
    sumX += i;
    sumY += ys[i]!;
    sumXY += i * ys[i]!;
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function kriMeta(
  domainId: string,
  kriLabel: string,
): { target: number; status: "GREEN" | "AMBER" | "RED" } | null {
  const domain = RISK_DOMAINS_V4.find((d) => d.id === domainId);
  const kri = domain?.kris.find((k) => k.label === kriLabel);
  if (!kri) return null;
  return { target: kri.target, status: kri.status };
}

/** Outside appetite = board KRI already AMBER/RED (Sanctions 99.9% vs 100% stays GREEN). */
function isOutsideAppetite(status: "GREEN" | "AMBER" | "RED"): boolean {
  return status === "RED" || status === "AMBER";
}

function isImproving(
  slope: number,
  direction: "lower-is-better" | "higher-is-better",
): boolean {
  if (slope === 0) return false;
  return direction === "lower-is-better" ? slope < 0 : slope > 0;
}

function findHistory(domainId: string, kriLabel: string): KriHistory | undefined {
  return KRI_HISTORY.find((h) => h.domainId === domainId && h.kriLabel === kriLabel);
}

export function getKriMomentum(domainId: string, kriLabel: string): KriMomentumResult {
  const history = findHistory(domainId, kriLabel);
  if (!history) {
    throw new Error(`No KRI history for ${domainId} / ${kriLabel}`);
  }
  if (history.values.length !== REVIEW_DATES.length) {
    throw new Error(
      `KRI history ${domainId}/${kriLabel}: expected ${REVIEW_DATES.length} values, got ${history.values.length}`,
    );
  }

  const { values, direction } = history;
  const trailing = values.slice(-3);
  const slopePerMonth = olsSlope(trailing);
  const current = values[values.length - 1]!;
  const meta = kriMeta(domainId, kriLabel);
  if (meta === null) {
    throw new Error(`No KRI target for ${domainId} / ${kriLabel}`);
  }
  const { target, status } = meta;

  if (isOutsideAppetite(status)) {
    return {
      state: "ALREADY_BREACHED",
      slopePerMonth,
      daysToBreach: null,
      projectedValue: null,
      values: [...values],
      direction,
      target,
    };
  }

  if (target === 0 && current === 0) {
    return {
      state: "AT_TARGET_NO_HEADROOM",
      slopePerMonth,
      daysToBreach: null,
      projectedValue: null,
      values: [...values],
      direction,
      target,
    };
  }

  const movingTowardBreach =
    direction === "lower-is-better" ? slopePerMonth > 0 : slopePerMonth < 0;

  let daysToBreach: number | null = null;
  let projectedValue: number | null = null;
  let state: MomentumState = isImproving(slopePerMonth, direction) ? "IMPROVING" : "STABLE";

  if (movingTowardBreach) {
    const distance =
      direction === "lower-is-better" ? target - current : current - target;
    if (distance > 0 && Math.abs(slopePerMonth) > 0) {
      const monthsToBreach = distance / Math.abs(slopePerMonth);
      // Demo EWI horizons: climate ~77d / conduct ~95d use calendar-month scaling
      // of 365/12 against the trailing-three least-squares slope.
      daysToBreach = Math.round(monthsToBreach * DAYS_PER_MONTH);
      projectedValue = target;
      if (daysToBreach <= MOMENTUM_APPETITE.redHorizonDays) {
        state = "PROJECTED_BREACH_RED";
      } else if (daysToBreach <= MOMENTUM_APPETITE.amberHorizonDays) {
        state = "PROJECTED_BREACH_AMBER";
      } else {
        state = "STABLE";
      }
    }
  }

  return {
    state,
    slopePerMonth,
    daysToBreach,
    projectedValue,
    values: [...values],
    direction,
    target,
  };
}

export function getDomainMomentum(domainId: string): DomainMomentumResult {
  const histories = KRI_HISTORY.filter((h) => h.domainId === domainId);
  if (histories.length === 0) {
    throw new Error(`No KRI history for domain ${domainId}`);
  }

  let worst: DomainMomentumResult | null = null;
  for (const h of histories) {
    const m = getKriMomentum(domainId, h.kriLabel);
    const candidate: DomainMomentumResult = {
      state: m.state,
      worstKri: h.kriLabel,
      daysToBreach: m.daysToBreach,
    };
    if (!worst || STATE_RANK[candidate.state] > STATE_RANK[worst.state]) {
      worst = candidate;
    } else if (
      worst &&
      STATE_RANK[candidate.state] === STATE_RANK[worst.state] &&
      candidate.daysToBreach !== null &&
      (worst.daysToBreach === null || candidate.daysToBreach < worst.daysToBreach)
    ) {
      worst = candidate;
    }
  }
  return worst!;
}

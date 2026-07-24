/**
 * Defensibility lens data — hand-seeded demo data, NOT real customer or firm records.
 * Precedents remain REAL and are never mixed with this.
 *
 * Three checks (obligation coverage, evidence retrievability, feed integrity),
 * one question, one decision. All obligation refs are real FCA Handbook / PRA /
 * MLR / JMLSG citations.
 */
import { AS_OF, daysBetween } from "@/lib/ukbankingaudit/v6/ownershipData";

export type ObligationCoverage = {
  domainId: string;
  totalObligations: number;
  mappedToControl: number;
  /** Controls in scope for this domain (firm-wide sum = 180 against 312 obligations). */
  controlsInScope: number;
  unmappedRefs: string[];
};

export type EvidenceRetrievability = {
  domainId: string;
  artefactsRequired: number;
  artefactsExist: number;
  artefactsRetrievable: number;
  missingManifest: string[];
};

export type FeedIntegrity = {
  domainId: string;
  sourceSystem: string | null;
  lastRefresh: string;
  expectedCadenceDays: number;
};

export const OBLIGATION_COVERAGE: ObligationCoverage[] = [
  {
    domainId: "credit",
    totalObligations: 38,
    mappedToControl: 36,
    controlsInScope: 24,
    unmappedRefs: [
      "CONC 5.2A.4R creditworthiness assessment records",
      "MCOB 11.6.5R affordability evidence retention",
    ],
  },
  {
    domainId: "market",
    totalObligations: 22,
    mappedToControl: 22,
    controlsInScope: 14,
    unmappedRefs: [],
  },
  {
    domainId: "liquidity",
    totalObligations: 19,
    mappedToControl: 19,
    controlsInScope: 12,
    unmappedRefs: [],
  },
  {
    domainId: "conduct",
    totalObligations: 61,
    mappedToControl: 54,
    controlsInScope: 31,
    unmappedRefs: [
      "PRIN 2A.9.9R outcomes monitoring",
      "PRIN 2A.9.15R board report content",
      "PRIN 2A.6.2R fair value assessment refresh",
      "FG21/1 vulnerable customer outcome testing",
      "DISP 1.3.3R recurring root-cause remediation",
      "PRIN 2A.5.3R consumer understanding testing",
      "PRIN 2A.7.2R consumer support channel parity",
    ],
  },
  {
    domainId: "climate",
    totalObligations: 14,
    mappedToControl: 11,
    controlsInScope: 8,
    unmappedRefs: [
      "SS3/19 §3.7 scenario analysis embedding",
      "SS3/19 §4.2 climate risk appetite metrics",
      "SS3/19 §5.1 board-level climate MI",
    ],
  },
  {
    domainId: "fincrime",
    totalObligations: 87,
    mappedToControl: 82,
    controlsInScope: 46,
    unmappedRefs: [
      "MLR 2017 reg 18A proliferation financing risk assessment",
      "MLR 2017 reg 21(1)(b) independent audit function",
      "JMLSG Pt II 5.3 correspondent banking",
      "MLR 2017 reg 30A discrepancy reporting",
      "POCA s.330 nominated officer training records",
    ],
  },
  {
    domainId: "opsres",
    totalObligations: 33,
    mappedToControl: 31,
    controlsInScope: 19,
    unmappedRefs: [
      "PS16/24 critical third party register maintenance",
      "SS2/21 §7.4 sub-outsourcing chain mapping",
    ],
  },
  {
    domainId: "cyber",
    totalObligations: 26,
    mappedToControl: 26,
    controlsInScope: 17,
    unmappedRefs: [],
  },
  {
    domainId: "regulatory",
    totalObligations: 12,
    mappedToControl: 12,
    controlsInScope: 9,
    unmappedRefs: [],
  },
];

export const EVIDENCE_RETRIEVABILITY: EvidenceRetrievability[] = [
  {
    domainId: "credit",
    artefactsRequired: 36,
    artefactsExist: 36,
    artefactsRetrievable: 34,
    missingManifest: [
      "Q1 2026 IRB model monitoring pack — recorded, no retrievable link",
      "Feb 2026 watchlist committee minutes — location unknown",
    ],
  },
  {
    domainId: "market",
    artefactsRequired: 22,
    artefactsExist: 22,
    artefactsRetrievable: 22,
    missingManifest: [],
  },
  {
    domainId: "liquidity",
    artefactsRequired: 19,
    artefactsExist: 19,
    artefactsRetrievable: 19,
    missingManifest: [],
  },
  {
    domainId: "conduct",
    artefactsRequired: 54,
    artefactsExist: 48,
    artefactsRetrievable: 41,
    missingManifest: [
      "Consumer Duty annual board report evidence pack 2025/26 — not produced",
      "Vulnerable customer outcome testing Q4 2025 — not produced",
      "Fair value assessment refresh, 3 products — not produced",
      "Consumer understanding testing results — recorded, no retrievable link",
      "Complaints root-cause pack Q1 2026 — recorded, no retrievable link",
      "FOS case sample review Q1 2026 — recorded, no retrievable link",
    ],
  },
  {
    domainId: "climate",
    artefactsRequired: 11,
    artefactsExist: 11,
    artefactsRetrievable: 9,
    missingManifest: [
      "High-carbon sector mapping methodology — spreadsheet, no version control",
      "CBES scenario alignment working — recorded, no retrievable link",
    ],
  },
  {
    domainId: "fincrime",
    artefactsRequired: 82,
    artefactsExist: 79,
    artefactsRetrievable: 71,
    missingManifest: [
      "Sanctions screening cadence evidence, Apr–Jun 2026 — not produced",
      "MLRO annual report supporting population data — recorded, no retrievable link",
      "TM rule change approval, TM-R17 3 Mar 2026 — rationale field empty",
      "EDD file sample Q1 2026, 8 of 25 files — location unknown",
    ],
  },
  {
    domainId: "opsres",
    artefactsRequired: 31,
    artefactsExist: 31,
    artefactsRetrievable: 29,
    missingManifest: [
      "Severe-but-plausible scenario test results, Nov 2025 — recorded, no retrievable link",
      "Top-5 supplier exit plan test, 19 months old — superseded, current version not located",
    ],
  },
  {
    domainId: "cyber",
    artefactsRequired: 26,
    artefactsExist: 24,
    artefactsRetrievable: 24,
    missingManifest: [
      "Penetration test remediation closure evidence — not produced",
      "Critical CVE 14-Apr closure pack test artefact — signed, no test evidence attached",
    ],
  },
  {
    domainId: "regulatory",
    artefactsRequired: 12,
    artefactsExist: 12,
    artefactsRetrievable: 12,
    missingManifest: [],
  },
];

export const FEED_INTEGRITY: FeedIntegrity[] = [
  {
    domainId: "credit",
    sourceSystem: "Credit Risk System · IRB engine",
    lastRefresh: "2026-07-20",
    expectedCadenceDays: 7,
  },
  {
    domainId: "market",
    sourceSystem: "Market Risk · VaR engine",
    lastRefresh: "2026-07-22",
    expectedCadenceDays: 1,
  },
  {
    domainId: "liquidity",
    sourceSystem: "Treasury · PRA110 liquidity return",
    lastRefresh: "2026-07-22",
    expectedCadenceDays: 1,
  },
  {
    domainId: "conduct",
    sourceSystem: "Complaints MI · Consumer Duty dashboard",
    lastRefresh: "2026-06-12",
    expectedCadenceDays: 30,
  },
  {
    domainId: "climate",
    sourceSystem: null,
    lastRefresh: "2026-04-26",
    expectedCadenceDays: 90,
  },
  {
    domainId: "fincrime",
    sourceSystem: "Financial Crime Case Management System",
    lastRefresh: "2026-07-21",
    expectedCadenceDays: 1,
  },
  {
    domainId: "opsres",
    sourceSystem: "Op-Res · IBS dependency map",
    lastRefresh: "2026-07-11",
    expectedCadenceDays: 30,
  },
  {
    domainId: "cyber",
    sourceSystem: "Security Operations · vulnerability feed",
    lastRefresh: "2026-07-22",
    expectedCadenceDays: 1,
  },
  {
    domainId: "regulatory",
    sourceSystem: "Horizon scanning register",
    lastRefresh: "2026-06-06",
    expectedCadenceDays: 30,
  },
];

export const DEFENSIBILITY_APPETITE = {
  unmappedMaterialObligations: 0,
  unretrievableCriticalEvidence: 0,
  retrievabilityFloor: 95,
};

export type DefensibilityState = "DEFENSIBLE" | "AT_RISK" | "INDEFENSIBLE";
export type FeedState = "FRESH" | "STALE" | "UNATTRIBUTED";

export type DefensibilityResult = {
  state: DefensibilityState;
  obligationGaps: number;
  unmappedRefs: string[];
  mappedToControl: number;
  totalObligations: number;
  controlsInScope: number;
  retrievabilityPct: number;
  missingManifest: string[];
  feedState: FeedState;
  feedAgeDays: number;
  sourceSystem: string | null;
  lastRefresh: string;
  expectedCadenceDays: number;
};

function requireRow<T extends { domainId: string }>(rows: T[], domainId: string, label: string): T {
  const row = rows.find((r) => r.domainId === domainId);
  if (!row) throw new Error(`No ${label} row for domain ${domainId}`);
  return row;
}

function feedStateFor(feed: FeedIntegrity, ageDays: number): FeedState {
  if (feed.sourceSystem === null) return "UNATTRIBUTED";
  if (ageDays > feed.expectedCadenceDays) return "STALE";
  return "FRESH";
}

/**
 * Pack integrity counts a feed within cadence when its age is within the
 * expected window. Daily feeds (cadence 1) tolerate a one-day as-of lag so a
 * T-1 PRA return still reads current on the product as-of clock — yielding
 * 7/9 (78%) at AS_OF.
 */
function isWithinCadence(ageDays: number, expectedCadenceDays: number): boolean {
  const grace = expectedCadenceDays === 1 ? 1 : 0;
  return ageDays <= expectedCadenceDays + grace;
}

export function getDefensibility(domainId: string): DefensibilityResult {
  const coverage = requireRow(OBLIGATION_COVERAGE, domainId, "obligation coverage");
  const evidence = requireRow(EVIDENCE_RETRIEVABILITY, domainId, "evidence retrievability");
  const feed = requireRow(FEED_INTEGRITY, domainId, "feed integrity");

  const obligationGaps = coverage.unmappedRefs.length;
  const retrievabilityPct = Math.round(
    (evidence.artefactsRetrievable / evidence.artefactsRequired) * 100,
  );
  const feedAgeDays = daysBetween(feed.lastRefresh, AS_OF);
  const feedState = feedStateFor(feed, feedAgeDays);

  const indefensible =
    obligationGaps > 2 ||
    retrievabilityPct < 90 ||
    feedState === "UNATTRIBUTED";

  const clean =
    obligationGaps === DEFENSIBILITY_APPETITE.unmappedMaterialObligations &&
    retrievabilityPct >= DEFENSIBILITY_APPETITE.retrievabilityFloor &&
    feedState === "FRESH";

  let state: DefensibilityState;
  if (indefensible) state = "INDEFENSIBLE";
  else if (clean) state = "DEFENSIBLE";
  else state = "AT_RISK";

  return {
    state,
    obligationGaps,
    unmappedRefs: [...coverage.unmappedRefs],
    mappedToControl: coverage.mappedToControl,
    totalObligations: coverage.totalObligations,
    controlsInScope: coverage.controlsInScope,
    retrievabilityPct,
    missingManifest: [...evidence.missingManifest],
    feedState,
    feedAgeDays,
    sourceSystem: feed.sourceSystem,
    lastRefresh: feed.lastRefresh,
    expectedCadenceDays: feed.expectedCadenceDays,
  };
}

export function getPackIntegrity(): { withinCadence: number; total: number; pct: number } {
  const total = FEED_INTEGRITY.length;
  let withinCadence = 0;
  for (const feed of FEED_INTEGRITY) {
    const ageDays = daysBetween(feed.lastRefresh, AS_OF);
    if (isWithinCadence(ageDays, feed.expectedCadenceDays)) withinCadence += 1;
  }
  return {
    withinCadence,
    total,
    pct: Math.round((withinCadence / total) * 100),
  };
}

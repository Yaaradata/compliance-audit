/**
 * ─────────────────────────────────────────────────────────────────────────
 *  UK Banking Audit — v6 Exposure lens data  (SYNTHETIC DATA)
 * ─────────────────────────────────────────────────────────────────────────
 *  Client-concentration data answering the Exposure lens question: how many
 *  sanctions clients, how many sensitive PEPs, what is the risk-rating
 *  distribution, whom can be exited. ALL NUMBERS BELOW ARE SYNTHETIC and
 *  deterministic, seeded to cohere with the v6 domain-level KRIs (KYC
 *  refresh backlog 4,210 cases, high-risk reviews overdue 17%, from
 *  riskDomainsV4.ts). They are NOT real customer or firm records.
 *
 *  Only fincrime is specced (client-concentration data is not connected for
 *  any other domain). Fabricating numbers for the other eight domains would
 *  misrepresent data the firm does not hold — dataAvailable: false plus an
 *  honest caveat is the correct state for them.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type {
  DomainExposure,
  DomainExposureAvailable,
  DomainExposureUnavailable,
  ExposureCount,
  ExitCandidateCluster,
} from "./exposureTypes";

const AS_OF = "2026-07-10";
const NO_DATA_CAVEAT = "Client-level exposure data not connected for this domain.";

const FINCRIME_BOOK_SIZE = 2663;
const FINCRIME_HIGH_COUNT = 402;
const FINCRIME_MEDIUM_COUNT = 905;
const FINCRIME_LOW_COUNT = FINCRIME_BOOK_SIZE - FINCRIME_HIGH_COUNT - FINCRIME_MEDIUM_COUNT; // 1,356

const FINCRIME_APPETITE_PCT_HIGH = 15.0;
const FINCRIME_HIGH_PCT = 15.1; // Saurabh's example: 15.1 vs 15.0 appetite

const FINCRIME_COUNTS: ExposureCount[] = [
  {
    id: "sanctions-nexus-clients",
    label: "Sanctions-nexus clients",
    value: 42,
    appetite: 30,
    status: "OVER",
    unit: "clients",
    derivation: "RULE",
    sourceLabel: "Sanctions Screening Engine · nexus flag",
  },
  {
    id: "sensitive-peps",
    label: "Sensitive PEPs",
    value: 118,
    appetite: null,
    status: "INFO",
    unit: "clients",
    derivation: "RULE",
    sourceLabel: "KYC System · PEP register",
  },
  {
    id: "fincrime-material-events-12mo",
    label: "Financial-crime material events (12mo)",
    value: 7,
    appetite: 3,
    status: "OVER",
    unit: "events",
    derivation: "RULE",
    sourceLabel: "Financial Crime Case Management System",
  },
  {
    id: "tm-investigations-sar-conversion",
    label: "TM investigations → SAR conversion",
    value: 3.2,
    appetite: null,
    status: "INFO",
    unit: "%",
    derivation: "RULE",
    sourceLabel: "Transaction Monitoring · SAR conversion tracker",
  },
];

/** Ranked by contributionToBreachPct desc; contributions sum to 100. */
const FINCRIME_EXIT_CANDIDATES: ExitCandidateCluster[] = [
  {
    id: "trade-finance-mena",
    label: "Trade-finance / MENA corridor",
    highRiskWeightPct: 4.1,
    contributionToBreachPct: 27,
    clientCount: 109,
    note: "Correspondent exposure concentrated in higher-risk trade corridors.",
  },
  {
    id: "correspondent-banking",
    label: "Correspondent banking",
    highRiskWeightPct: 3.3,
    contributionToBreachPct: 22,
    clientCount: 88,
    note: "Nested correspondent relationships with limited beneficial-ownership visibility.",
  },
  {
    id: "cash-intensive-smes",
    label: "High-value cash-intensive SMEs",
    highRiskWeightPct: 2.8,
    contributionToBreachPct: 19,
    clientCount: 76,
    note: "Cash-intensive turnover profile elevates source-of-funds risk.",
  },
  {
    id: "complex-ownership-spv",
    label: "Complex ownership structures / offshore SPVs",
    highRiskWeightPct: 2.2,
    contributionToBreachPct: 15,
    clientCount: 60,
    note: "Layered ownership obscures ultimate beneficial owner.",
  },
  {
    id: "pep-adjacent-private-banking",
    label: "PEP-adjacent private banking relationships",
    highRiskWeightPct: 1.6,
    contributionToBreachPct: 11,
    clientCount: 44,
    note: "Elevated PEP-adjacency increases enhanced due diligence burden.",
  },
  {
    id: "legacy-pre-2022-kyc",
    label: "Legacy onboarding pre-2022 KYC standard",
    highRiskWeightPct: 1.0,
    contributionToBreachPct: 6,
    clientCount: 24,
    note: "Onboarded under a since-superseded CDD standard; refresh in the backlog.",
  },
];

const FINCRIME_EXPOSURE: DomainExposureAvailable = {
  domainId: "fincrime",
  distribution: {
    domainId: "fincrime",
    bands: [
      { band: "high", pctOfBook: FINCRIME_HIGH_PCT, clientCount: FINCRIME_HIGH_COUNT },
      { band: "medium", pctOfBook: 34.0, clientCount: FINCRIME_MEDIUM_COUNT },
      { band: "low", pctOfBook: 50.9, clientCount: FINCRIME_LOW_COUNT },
    ],
    appetitePctHigh: FINCRIME_APPETITE_PCT_HIGH,
    status: FINCRIME_HIGH_PCT > FINCRIME_APPETITE_PCT_HIGH ? "OVER" : "WITHIN",
    asOf: AS_OF,
  },
  counts: FINCRIME_COUNTS,
  exitCandidates: FINCRIME_EXIT_CANDIDATES,
  dataAvailable: true,
  dataCaveat: "",
};

/** Domains Saurabh did not spec: honest empty state, no fabricated numbers. */
const UNAVAILABLE_DOMAIN_IDS = [
  "credit",
  "market",
  "liquidity",
  "conduct",
  "climate",
  "opsres",
  "cyber",
  "regulatory",
] as const;

function emptyExposure(domainId: string): DomainExposureUnavailable {
  return {
    domainId,
    distribution: {
      domainId,
      bands: [],
      appetitePctHigh: 0,
      status: "WITHIN",
      asOf: AS_OF,
    },
    counts: [],
    exitCandidates: [],
    dataAvailable: false,
    dataCaveat: NO_DATA_CAVEAT,
  };
}

const DOMAIN_EXPOSURE: Record<string, DomainExposure> = {
  fincrime: FINCRIME_EXPOSURE,
  ...Object.fromEntries(UNAVAILABLE_DOMAIN_IDS.map((id) => [id, emptyExposure(id)])),
};

export function getDomainExposure(domainId: string): DomainExposure | null {
  return DOMAIN_EXPOSURE[domainId] ?? null;
}

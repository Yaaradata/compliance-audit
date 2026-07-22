/**
 * ─────────────────────────────────────────────────────────────────────────
 *  UK Banking Audit — v6 Exposure lens data  (SYNTHETIC DATA)
 * ─────────────────────────────────────────────────────────────────────────
 *  Client / concentration data for the Exposure lens. ALL NUMBERS BELOW ARE
 *  SYNTHETIC and deterministic, grounded in named UK regulatory metrics and
 *  carrying a real sourceLabel on every count. They are NOT real firm records.
 *
 *  Connected (dataAvailable: true): fincrime, credit, liquidity, conduct,
 *  opsres, market, climate.
 *  Honest preview only (dataAvailable: false): cyber, regulatory —
 *  cyber is a CISO attack-surface tool, not a CRO concentration lens;
 *  regulatory's second lens is Enforcement Read-Across on Coverage Map.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type {
  DomainExposure,
  DomainExposureAvailable,
  DomainExposureUnavailable,
  ExposureCount,
  ExitCandidateCluster,
  RiskBand,
} from "./exposureTypes";

const AS_OF = "2026-07-10";
const NO_DATA_CAVEAT = "Client-level exposure data not connected for this domain.";

function bands(
  domainId: string,
  rows: { band: RiskBand; pctOfBook: number; clientCount: number }[],
  appetitePctHigh: number,
) {
  const high = rows.find((r) => r.band === "high")!;
  return {
    domainId,
    bands: rows,
    appetitePctHigh,
    status: (high.pctOfBook > appetitePctHigh ? "OVER" : "WITHIN") as "OVER" | "WITHIN",
    asOf: AS_OF,
  };
}

function available(seed: {
  domainId: string;
  distribution: DomainExposureAvailable["distribution"];
  counts: ExposureCount[];
  exitCandidates: ExitCandidateCluster[];
  dataCaveat: string;
}): DomainExposureAvailable {
  return { ...seed, dataAvailable: true };
}

// ─── FINCRIME (existing) ───────────────────────────────────────────────────

const FINCRIME_BOOK_SIZE = 2663;
const FINCRIME_HIGH_COUNT = 402;
const FINCRIME_MEDIUM_COUNT = 905;
const FINCRIME_LOW_COUNT = FINCRIME_BOOK_SIZE - FINCRIME_HIGH_COUNT - FINCRIME_MEDIUM_COUNT;

const FINCRIME_APPETITE_PCT_HIGH = 15.0;
const FINCRIME_HIGH_PCT = 15.1;

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

const FINCRIME_EXPOSURE = available({
  domainId: "fincrime",
  distribution: bands(
    "fincrime",
    [
      { band: "high", pctOfBook: FINCRIME_HIGH_PCT, clientCount: FINCRIME_HIGH_COUNT },
      { band: "medium", pctOfBook: 34.0, clientCount: FINCRIME_MEDIUM_COUNT },
      { band: "low", pctOfBook: 50.9, clientCount: FINCRIME_LOW_COUNT },
    ],
    FINCRIME_APPETITE_PCT_HIGH,
  ),
  counts: FINCRIME_COUNTS,
  exitCandidates: FINCRIME_EXIT_CANDIDATES,
  dataCaveat: "",
});

// ─── CREDIT — PRA large-exposure / GCC ─────────────────────────────────────

const CREDIT_EXPOSURE = available({
  domainId: "credit",
  distribution: bands(
    "credit",
    [
      { band: "high", pctOfBook: 18.2, clientCount: 182 },
      { band: "medium", pctOfBook: 31.0, clientCount: 310 },
      { band: "low", pctOfBook: 50.8, clientCount: 508 },
    ],
    15.0,
  ),
  counts: [
    {
      id: "single-name-over-20-tier1",
      label: "Single-name exposures >20% Tier 1",
      value: 3,
      appetite: 0,
      status: "OVER",
      unit: "clients",
      derivation: "RULE",
      sourceLabel: "Credit Risk System · LE2",
    },
    {
      id: "gcc-near-limit",
      label: "Groups of connected clients near limit",
      value: 5,
      appetite: 3,
      status: "OVER",
      unit: "clients",
      derivation: "RULE",
      sourceLabel: "GCC register",
    },
    {
      id: "largest-single-name-pct-tier1",
      label: "Largest single-name exposure (% Tier 1)",
      value: 23,
      appetite: 25,
      status: "WITHIN",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "COREP LE2",
    },
    {
      id: "top-20-obligor-share",
      label: "Top-20 obligor share of book",
      value: 41,
      appetite: null,
      status: "INFO",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "Credit MI",
    },
  ],
  exitCandidates: [
    {
      id: "cre-regional-offices",
      label: "Commercial real estate — regional offices",
      highRiskWeightPct: 6.2,
      contributionToBreachPct: 31,
      clientCount: 48,
      note: "Cyclical collateral, abrupt value declines.",
    },
    {
      id: "leveraged-lending-sub-ig",
      label: "Leveraged lending / sub-investment grade",
      highRiskWeightPct: 4.4,
      contributionToBreachPct: 24,
      clientCount: 22,
      note: "Elevated default correlation.",
    },
    {
      id: "single-large-corporate-gcc",
      label: "Single large corporate group (GCC)",
      highRiskWeightPct: 3.9,
      contributionToBreachPct: 21,
      clientCount: 1,
      note: "Aggregated as one exposure vs Tier 1.",
    },
    {
      id: "uk-residential-btl",
      label: "UK residential BTL portfolio landlords",
      highRiskWeightPct: 2.6,
      contributionToBreachPct: 14,
      clientCount: 63,
      note: "Rate-sensitive concentrated cohort.",
    },
    {
      id: "trade-finance-importer-set",
      label: "Trade-finance to concentrated importer set",
      highRiskWeightPct: 1.9,
      contributionToBreachPct: 10,
      clientCount: 31,
      note: "Corridor and counterparty concentration.",
    },
  ],
  dataCaveat: "Grounded in PRA large-exposure limits; figures synthetic for demo.",
});

// ─── LIQUIDITY — ILAAP / LCR / NSFR ─────────────────────────────────────────

const LIQUIDITY_EXPOSURE = available({
  domainId: "liquidity",
  distribution: bands(
    "liquidity",
    [
      { band: "high", pctOfBook: 22.0, clientCount: 220 },
      { band: "medium", pctOfBook: 28.0, clientCount: 280 },
      { band: "low", pctOfBook: 50.0, clientCount: 500 },
    ],
    20.0,
  ),
  counts: [
    {
      id: "top-10-depositors",
      label: "Top-10 depositors >1% of liabilities",
      value: 8,
      appetite: 5,
      status: "OVER",
      unit: "clients",
      derivation: "RULE",
      sourceLabel: "Treasury · C67-equivalent",
    },
    {
      id: "lcr",
      label: "LCR",
      value: 142,
      appetite: 100,
      status: "WITHIN",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "PRA liquidity return",
    },
    {
      id: "nsfr",
      label: "NSFR",
      value: 118,
      appetite: 100,
      status: "WITHIN",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "PRA liquidity return",
    },
    {
      id: "maturity-cliff-30d",
      label: "30-day maturity cliff (% funding)",
      value: 14,
      appetite: 10,
      status: "OVER",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "maturity ladder",
    },
  ],
  exitCandidates: [
    {
      id: "single-corporate-depositor",
      label: "Single corporate depositor >3% liabilities",
      highRiskWeightPct: 4.0,
      contributionToBreachPct: 34,
      clientCount: 1,
      note: "One withdrawal moves the LCR.",
    },
    {
      id: "short-dated-wholesale",
      label: "Short-dated wholesale funding cluster",
      highRiskWeightPct: 3.1,
      contributionToBreachPct: 26,
      clientCount: 12,
      note: "Rollover risk under stress.",
    },
    {
      id: "non-operational-fi-deposits",
      label: "Non-operational FI deposits",
      highRiskWeightPct: 2.4,
      contributionToBreachPct: 21,
      clientCount: 9,
      note: "High LCR outflow weighting.",
    },
    {
      id: "brokered-deposit-channel",
      label: "Concentrated brokered-deposit channel",
      highRiskWeightPct: 1.3,
      contributionToBreachPct: 19,
      clientCount: 5,
      note: "Flighty in stress.",
    },
  ],
  dataCaveat: "Grounded in PRA ILAAP / LCR / NSFR; figures synthetic for demo.",
});

// ─── CONDUCT — Consumer Duty outcomes ──────────────────────────────────────
// Mirrors the Nationwide 'enhanced=4.9%' assertion-denominator pattern: a green
// Consumer Duty tile while vulnerable-customer outcomes sit at 47% vs 90%.

const CONDUCT_EXPOSURE = available({
  domainId: "conduct",
  distribution: bands(
    "conduct",
    [
      { band: "high", pctOfBook: 12.0, clientCount: 1200 },
      { band: "medium", pctOfBook: 23.0, clientCount: 2300 },
      { band: "low", pctOfBook: 65.0, clientCount: 6500 },
    ],
    5.0,
  ),
  counts: [
    {
      id: "segments-below-good-outcome",
      label: "Segments below good-outcome threshold",
      value: 4,
      appetite: 0,
      status: "OVER",
      unit: "segments",
      derivation: "RULE",
      sourceLabel: "Consumer Duty outcomes MI",
    },
    {
      id: "vulnerable-good-outcome-rate",
      label: "Vulnerable-customer good-outcome rate",
      value: 47,
      appetite: 90,
      status: "OVER",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "Vulnerability MI",
    },
    {
      id: "fair-value-outlier-products",
      label: "Fair-value outlier products",
      value: 3,
      appetite: 0,
      status: "OVER",
      unit: "products",
      derivation: "RULE",
      sourceLabel: "Fair-value register",
    },
    {
      id: "complaint-uphold-vulnerable",
      label: "Complaint uphold rate — vulnerable cohort",
      value: 38,
      appetite: null,
      status: "INFO",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "Complaints MI",
    },
  ],
  exitCandidates: [
    {
      id: "vulnerable-arrears-journeys",
      label: "Vulnerable customers — arrears journeys",
      highRiskWeightPct: 4.2,
      contributionToBreachPct: 35,
      clientCount: 1900,
      note: "Outcome 47% vs 90% target.",
    },
    {
      id: "older-digital-only",
      label: "Older customers — digital-only servicing",
      highRiskWeightPct: 2.9,
      contributionToBreachPct: 24,
      clientCount: 3400,
      note: "Channel exclusion risk.",
    },
    {
      id: "low-income-high-cost",
      label: "Low-income — high-cost products",
      highRiskWeightPct: 2.4,
      contributionToBreachPct: 21,
      clientCount: 2600,
      note: "Fair-value pressure.",
    },
    {
      id: "bereaved-account-transitions",
      label: "Recently bereaved — account transitions",
      highRiskWeightPct: 1.5,
      contributionToBreachPct: 20,
      clientCount: 480,
      note: "Sensitive-journey failures.",
    },
  ],
  dataCaveat: "Grounded in FCA Consumer Duty outcomes monitoring; figures synthetic for demo.",
});

// ─── OPSRES — SS1/21 · SS2/21 · PS16/24 CTP ─────────────────────────────────

const OPSRES_EXPOSURE = available({
  domainId: "opsres",
  distribution: bands(
    "opsres",
    [
      { band: "high", pctOfBook: 33.0, clientCount: 33 },
      { band: "medium", pctOfBook: 28.0, clientCount: 28 },
      { band: "low", pctOfBook: 39.0, clientCount: 39 },
    ],
    20.0,
  ),
  counts: [
    {
      id: "ibs-most-concentrated-provider",
      label: "IBS on the most-concentrated provider",
      value: 6,
      appetite: 3,
      status: "OVER",
      unit: "services",
      derivation: "RULE",
      sourceLabel: "IBS dependency map",
    },
    {
      id: "ctp-without-tested-exit",
      label: "Critical third parties without tested exit",
      value: 4,
      appetite: 0,
      status: "OVER",
      unit: "vendors",
      derivation: "RULE",
      sourceLabel: "Third-party register",
    },
    {
      id: "impact-tolerance-breaches-12mo",
      label: "Impact tolerances breached in test (12mo)",
      value: 2,
      appetite: 0,
      status: "OVER",
      unit: "events",
      derivation: "RULE",
      sourceLabel: "Scenario-test results",
    },
    {
      id: "ibs-single-cloud",
      label: "IBS mapped to single cloud provider",
      value: 6,
      appetite: null,
      status: "INFO",
      unit: "services",
      derivation: "RULE",
      sourceLabel: "TPRM",
    },
  ],
  exitCandidates: [
    {
      id: "single-cloud-6-ibs",
      label: "Single cloud provider underpinning 6 IBS",
      highRiskWeightPct: 5.0,
      contributionToBreachPct: 38,
      clientCount: 6,
      note: "One outage breaches multiple tolerances.",
    },
    {
      id: "core-banking-no-substitute",
      label: "Core-banking platform (no substitute)",
      highRiskWeightPct: 3.4,
      contributionToBreachPct: 27,
      clientCount: 1,
      note: "Substitutability gap.",
    },
    {
      id: "payments-processor-spof",
      label: "Payments processor single dependency",
      highRiskWeightPct: 2.2,
      contributionToBreachPct: 21,
      clientCount: 1,
      note: "Critical path SPOF.",
    },
    {
      id: "kyc-screening-saas",
      label: "KYC/screening SaaS single vendor",
      highRiskWeightPct: 1.4,
      contributionToBreachPct: 14,
      clientCount: 1,
      note: "Concentration in control tooling.",
    },
  ],
  dataCaveat: "Grounded in PRA SS1/21, SS2/21, PS16/24 Critical Third Parties; figures synthetic.",
});

// ─── MARKET — Pillar 2 / VaR / IRRBB ────────────────────────────────────────

const MARKET_EXPOSURE = available({
  domainId: "market",
  distribution: bands(
    "market",
    [
      { band: "high", pctOfBook: 16.0, clientCount: 16 },
      { band: "medium", pctOfBook: 30.0, clientCount: 30 },
      { band: "low", pctOfBook: 54.0, clientCount: 54 },
    ],
    10.0,
  ),
  counts: [
    {
      id: "desks-over-90-var",
      label: "Desks over 90% VaR limit",
      value: 2,
      appetite: 0,
      status: "OVER",
      unit: "desks",
      derivation: "RULE",
      sourceLabel: "VaR engine",
    },
    {
      id: "single-position-pct-var",
      label: "Single-position concentration (% of VaR)",
      value: 28,
      appetite: 25,
      status: "OVER",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "Risk MI",
    },
    {
      id: "irrbb-eve-sensitivity",
      label: "IRRBB EVE sensitivity (% capital)",
      value: 12,
      appetite: 15,
      status: "WITHIN",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "IRRBB return",
    },
    {
      id: "var-backtest-exceptions-12mo",
      label: "VaR back-test exceptions (12mo)",
      value: 3,
      appetite: 4,
      status: "WITHIN",
      unit: "events",
      derivation: "RULE",
      sourceLabel: "Back-testing",
    },
  ],
  exitCandidates: [
    {
      id: "rates-single-tenor",
      label: "Rates desk — single tenor bucket",
      highRiskWeightPct: 3.6,
      contributionToBreachPct: 40,
      clientCount: 1,
      note: "Concentrated duration risk.",
    },
    {
      id: "fx-options-vega",
      label: "FX options — concentrated vega",
      highRiskWeightPct: 2.4,
      contributionToBreachPct: 33,
      clientCount: 1,
      note: "Volatility exposure.",
    },
    {
      id: "credit-spread-single-name",
      label: "Credit-spread single-name cluster",
      highRiskWeightPct: 1.9,
      contributionToBreachPct: 27,
      clientCount: 1,
      note: "Issuer concentration.",
    },
  ],
  dataCaveat: "Grounded in PRA Pillar 2 market risk / IRRBB / FRTB; figures synthetic.",
});

// ─── CLIMATE — PRA SS3/19 · CBES (transition + physical risk; WITHIN on high band) ─

const CLIMATE_EXPOSURE = available({
  domainId: "climate",
  distribution: bands(
    "climate",
    [
      // Transition-risk weighting of the lending book
      { band: "high", pctOfBook: 6.8, clientCount: 68 }, // high-transition-risk sectors
      { band: "medium", pctOfBook: 22.0, clientCount: 220 }, // transition-sensitive
      { band: "low", pctOfBook: 71.2, clientCount: 712 }, // low-transition-risk / aligned
    ],
    8.0,
  ),
  counts: [
    {
      id: "high-transition-risk-sector-lending",
      label: "High-transition-risk sector lending (% of book)",
      value: 6.8,
      appetite: 8.0,
      status: "WITHIN",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "Credit Risk · sector classification",
    },
    {
      id: "climate-vulnerable-mortgage-collateral",
      label: "Climate-vulnerable mortgage collateral (% of book)",
      value: 4.2,
      appetite: 6.0,
      status: "WITHIN",
      unit: "%",
      derivation: "RULE",
      sourceLabel: "Mortgage book · flood/physical-risk overlay",
    },
    {
      id: "wholesale-cbes-transition-path",
      label: "Wholesale exposures under CBES transition path",
      value: 12,
      appetite: null,
      status: "INFO",
      unit: "counterparties",
      derivation: "RULE",
      sourceLabel: "Climate stress-test model (PRA CBES)",
    },
  ],
  exitCandidates: [
    {
      id: "oil-gas-upstream",
      label: "Oil & gas upstream lending",
      highRiskWeightPct: 2.8,
      contributionToBreachPct: 41,
      clientCount: 22,
      note: "Transition risk to loan book; stranded-collateral exposure.",
    },
    {
      id: "coal-adjacent-industrials",
      label: "Coal-adjacent industrials",
      highRiskWeightPct: 1.9,
      contributionToBreachPct: 28,
      clientCount: 14,
      note: "High transition-risk weighting under CBES scenarios.",
    },
    {
      id: "carbon-intensive-manufacturing",
      label: "Carbon-intensive manufacturing",
      highRiskWeightPct: 1.4,
      contributionToBreachPct: 21,
      clientCount: 30,
      note: "Transition-sensitive credit exposure.",
    },
    {
      id: "commercial-property-poor-epc",
      label: "Commercial property — poor EPC",
      highRiskWeightPct: 0.7,
      contributionToBreachPct: 10,
      clientCount: 11,
      note: "Physical + transition risk to collateral value.",
    },
  ],
  dataCaveat:
    "Grounded in PRA SS3/19 and the Climate Biennial Exploratory Scenario (CBES); figures synthetic for demo.",
});

// ─── UNAVAILABLE (honest preview only) ─────────────────────────────────────

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

const PREVIEW_ONLY_DOMAIN_IDS = ["cyber", "regulatory"] as const;

const DOMAIN_EXPOSURE: Record<string, DomainExposure> = {
  fincrime: FINCRIME_EXPOSURE,
  credit: CREDIT_EXPOSURE,
  liquidity: LIQUIDITY_EXPOSURE,
  conduct: CONDUCT_EXPOSURE,
  opsres: OPSRES_EXPOSURE,
  market: MARKET_EXPOSURE,
  climate: CLIMATE_EXPOSURE,
  ...Object.fromEntries(PREVIEW_ONLY_DOMAIN_IDS.map((id) => [id, emptyExposure(id)])),
};

export function getDomainExposure(domainId: string): DomainExposure | null {
  return DOMAIN_EXPOSURE[domainId] ?? null;
}

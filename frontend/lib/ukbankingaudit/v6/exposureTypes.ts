/**
 * v6 Exposure lens types — client-concentration data, additive to the v5
 * domain-level KRIs (KYC backlog 4,210, TM SLA 86%). Answers "how many
 * sanctions clients, how many sensitive PEPs, what is my risk-rating
 * distribution, whom can I exit."
 */

export type RiskBand = "high" | "medium" | "low";

export type ExposureDistribution = {
  domainId: string; // "fincrime" for now
  bands: { band: RiskBand; pctOfBook: number; clientCount: number }[];
  appetitePctHigh: number; // the STATED appetite line, e.g. 15.0
  status: "OVER" | "WITHIN"; // derived: high band pctOfBook vs appetitePctHigh
  asOf: string;
};

export type ExposureCount = {
  id: string;
  label: string; // "Sanctions-nexus clients"
  value: number;
  appetite: number | null; // the RAG line; null = informational only
  status: "OVER" | "WITHIN" | "INFO";
  unit: string; // "clients" | "%" | "events"
  derivation: "RULE"; // all counts are deterministic
  sourceLabel: string; // "KYC system · CRR module" — provenance, STATED
};

export type ExitCandidateCluster = {
  id: string;
  label: string; // "Trade-finance / MENA corridor"
  highRiskWeightPct: number; // this cluster's share of the high band
  contributionToBreachPct: number; // how much of the appetite breach it drives
  clientCount: number;
  note: string; // one clause, why it concentrates
};

/**
 * Discriminated on `dataAvailable` so the "no fabricated numbers for a domain
 * we don't hold data for" rule is a COMPILE-TIME guarantee, not a convention:
 * when dataAvailable is false, counts/exitCandidates can only ever be `[]`.
 */
export type DomainExposureAvailable = {
  domainId: string;
  distribution: ExposureDistribution;
  counts: ExposureCount[];
  exitCandidates: ExitCandidateCluster[];
  dataAvailable: true;
  dataCaveat: string;
};

export type DomainExposureUnavailable = {
  domainId: string;
  distribution: ExposureDistribution;
  counts: [];
  exitCandidates: [];
  dataAvailable: false; // false where we do not hold client data
  dataCaveat: string; // the honest note when dataAvailable is false
};

export type DomainExposure = DomainExposureAvailable | DomainExposureUnavailable;

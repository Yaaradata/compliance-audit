/**
 * UK Board v1 — enforcement precedents (real, posture-tagged).
 * Own copy for this product; facts transcribed from the reviewed corpus.
 * Metro Bank: penalty and exact date are UNRESOLVED — mechanism only, never the figure.
 */
import type { Precedent } from "./types";

export const PRECEDENTS: Record<string, Precedent> = {
  "uk-starling-2024": {
    id: "uk-starling-2024",
    respondent: "Starling Bank",
    regulator: "FCA",
    noticeDate: "27 September 2024",
    posture: "Settled, no admission",
    confidence: "probable",
    hook: "Breached a restriction it had applied for; screened against a fraction of the sanctions list",
    mechanism:
      "54,359 accounts were opened for 49,183 high- or higher-risk customers in breach of a requirement the firm had applied for. Sanctions screening ran against a fraction of the Consolidated List from 2017 and was reported as functioning.",
    penalty: "£28,959,426",
  },
  "uk-monzo-2025": {
    id: "uk-monzo-2025",
    respondent: "Monzo Bank",
    regulator: "FCA",
    noticeDate: "07 July 2025",
    posture: "Settled, no admission",
    confidence: "verified",
    hook: "Financial crime controls did not keep pace with rapid customer growth",
    mechanism:
      "Controls did not keep pace with rapid customer growth. Under a requirement preventing accounts for high-risk customers, the firm repeatedly breached it between August 2020 and June 2022.",
    penalty: "£21,091,300",
  },
  "uk-metro-2024": {
    id: "uk-metro-2024",
    respondent: "Metro Bank",
    regulator: "FCA",
    noticeDate: null,
    posture: "Settled, no admission · figures unverified",
    confidence: "unverified",
    hook: "Day-one transactions never reached transaction monitoring",
    mechanism:
      "A transaction monitoring scope gap: a category of transactions fell outside automated monitoring. Penalty and notice date are unconfirmed pending the primary Final Notice, so neither is shown.",
    penalty: null,
  },
};

export function getPrecedent(id: string): Precedent | undefined {
  return PRECEDENTS[id];
}

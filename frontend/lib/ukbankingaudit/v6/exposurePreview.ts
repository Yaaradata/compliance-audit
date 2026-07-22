/**
 * v6 Exposure lens PREVIEW specs for domains where client-level data is not
 * yet connected. TEXT only — no fabricated numbers. Describes what the lens
 * would measure so a viewer on Liquidity / Credit / etc. understands the gap
 * as "not yet wired" rather than "broken feature".
 *
 * Live data remains exclusive to Fraud & Financial Crime (exposureData.ts).
 */

export type ExposurePreview = {
  domainId: string;
  /** The Block-1 question this domain's exposure lens would answer. */
  concentrationQuestion: string;
  /** What the appetite line would be measured against. */
  appetiteBasis: string;
  /** Block-2 style count labels only — never values. */
  exampleCounts: string[];
  /** UK regime that makes this a real lens. */
  ukAnchor: string;
};

const PREVIEWS: Record<string, ExposurePreview> = {
  credit: {
    domainId: "credit",
    concentrationQuestion:
      "How concentrated is the book by single name, sector, and group of connected clients?",
    appetiteBasis: "PRA large-exposure limits, anchored to Tier 1 capital",
    exampleCounts: [
      "Single-name exposures >10% Tier 1",
      "Sector concentration",
      "Groups of connected clients near limit",
    ],
    ukAnchor: "PRA Large Exposures (CRR) · PS14/25",
  },
  conduct: {
    domainId: "conduct",
    concentrationQuestion:
      "Which customer segments — especially vulnerable — receive worse outcomes than the board report claims?",
    appetiteBasis: "Consumer Duty fair-value and good-outcome thresholds",
    exampleCounts: [
      "Segments below good-outcome threshold",
      "Vulnerable-customer outcome gap",
      "Fair-value outliers",
    ],
    ukAnchor: "FCA Consumer Duty (PRIN 12) · vulnerable-customer guidance",
  },
  liquidity: {
    domainId: "liquidity",
    concentrationQuestion:
      "How concentrated is funding by source, and where are the maturity cliffs?",
    appetiteBasis: "PRA ILAAP funding-concentration and survival-horizon limits",
    exampleCounts: [
      "Wholesale funding reliance",
      "Depositor concentration",
      "30-day maturity cliff",
    ],
    ukAnchor: "PRA ILAAP · LCR",
  },
  opsres: {
    domainId: "opsres",
    concentrationQuestion:
      "Which single third party, if it failed, breaches the most impact tolerances at once?",
    appetiteBasis: "Impact tolerance and third-party concentration appetite",
    exampleCounts: [
      "Important Business Services per provider",
      "Critical third-party dependencies",
      "Single points of failure",
    ],
    ukAnchor: "PRA SS1/21 · SS2/21 · PS16/24 Critical Third Parties",
  },
  market: {
    domainId: "market",
    concentrationQuestion:
      "How concentrated is market risk by desk and asset class against VaR and stress limits?",
    appetiteBasis: "Desk / asset-class VaR limits and PRA Pillar 2 capital add-ons",
    exampleCounts: [
      "Desk-level VaR utilisation",
      "Asset-class concentration",
      "Stress-scenario outliers",
    ],
    ukAnchor: "PRA Pillar 2 · market-risk VaR limits",
  },
  cyber: {
    domainId: "cyber",
    concentrationQuestion:
      "Where is attack-surface exposure concentrated — systems, vendors, internet-facing services?",
    appetiteBasis:
      "Board cyber appetite and critical-system exposure limits (CISO-owned; lower priority for this lens)",
    exampleCounts: [
      "Internet-facing critical systems",
      "Vendor concentration on critical stack",
      "Unpatched critical CVEs by surface",
    ],
    ukAnchor: "PRA SS1/21 · FCA SYSC cyber expectations · CISO tooling",
  },
  climate: {
    domainId: "climate",
    concentrationQuestion:
      "How concentrated is the book in high-carbon sectors against the transition appetite?",
    appetiteBasis: "Transition-risk sector appetite and financed-emissions thresholds",
    exampleCounts: [
      "High-carbon sector share of book",
      "Transition-pathway outliers",
      "Financed-emissions concentration",
    ],
    ukAnchor: "TCFD · PRA SS3/19 climate expectations",
  },
  regulatory: {
    domainId: "regulatory",
    concentrationQuestion:
      "Which open obligations and enforcement themes concentrate residual regulatory exposure?",
    appetiteBasis:
      "Enforcement read-across already live on Coverage Map — connect obligation inventory for a full exposure lens",
    exampleCounts: [
      "Open high-severity obligations",
      "Enforcement-theme concentration",
      "Unremediated skilled-person findings",
    ],
    ukAnchor: "Coverage Map · enforcement read-across (already live) · FCA / PRA notice corpus",
  },
};

export function getExposurePreview(domainId: string): ExposurePreview | null {
  return PREVIEWS[domainId] ?? null;
}

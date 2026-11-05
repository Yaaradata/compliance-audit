/**
 * ─────────────────────────────────────────────────────────────────────────
 *  UK Banking Audit — v6 Fraud lens data  (SYNTHETIC DATA)
 * ─────────────────────────────────────────────────────────────────────────
 *  Fraud is a peer of AML/sanctions in UK financial crime and, post-PSR
 *  (mandatory APP reimbursement since Oct 2024), a board number in its own
 *  right — it was missing entirely from the domain-level KRIs. ALL NUMBERS
 *  BELOW ARE SYNTHETIC and deterministic. They demonstrate the view; they
 *  are NOT real customer or firm records.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type FraudLossRow = {
  id: string;
  type: "internal" | "external" | "card" | "electronic" | "app";
  label: string;
  confirmedNetLossGBP: number; // "confirmed net fraud losses"
  volume: number;
  trendWoW: number; // +/- percent; up = worse
  appApportionmentGBP?: number; // for APP: firm's reimbursement share under PSR rules
};

/**
 * Geographic × product concentration of fraud exposure. Illustrative only —
 * client-configurable placeholder, not a real firm position.
 */
export type FraudGeographicConcentrationRow = {
  id: string;
  jurisdiction: string;
  productLine: string;
  exposureGBP: number;
  /** Share of the fraud portfolio concentrated in this cell. */
  concentrationPctOfPortfolio: number;
  /** Stated appetite for that cell's portfolio share. */
  appetitePct: number;
  appetiteRead: "OVER" | "WITHIN";
};

export type FraudPosture = {
  domainId: "fincrime";
  totalConfirmedNetLossGBP: number;
  appReimbursementExposureGBP: number; // PSR mandatory reimbursement exposure
  rows: FraudLossRow[];
  /**
   * Geographic concentration block — inherent-exposure framing; seeded for demo.
   * Placement on Operational Dashboard vs Client Risk View is an open question.
   */
  geographicConcentration: FraudGeographicConcentrationRow[];
  /** Honesty label for the geography block — matches “(source to confirm)” convention. */
  geographicConcentrationSourceLabel: string;
  asOf: string;
  /** Named source on the Operational Dashboard card face. */
  sourceLabel: string;
};

const ROWS: FraudLossRow[] = [
  {
    id: "external-scams",
    type: "external",
    label: "External fraud (scams)",
    confirmedNetLossGBP: 2_400_000,
    volume: 1_840,
    trendWoW: 12,
  },
  {
    id: "app",
    type: "app",
    label: "Authorised push payment (APP)",
    confirmedNetLossGBP: 1_100_000,
    volume: 920,
    trendWoW: 8,
    appApportionmentGBP: 560_000,
  },
  {
    id: "card",
    type: "card",
    label: "Card fraud",
    confirmedNetLossGBP: 780_000,
    volume: 6_200,
    trendWoW: -3,
  },
  {
    id: "electronic",
    type: "electronic",
    label: "Electronic fraud (account takeover)",
    confirmedNetLossGBP: 640_000,
    volume: 410,
    trendWoW: 21,
  },
  {
    id: "internal",
    type: "internal",
    label: "Internal fraud",
    confirmedNetLossGBP: 120_000,
    volume: 14,
    trendWoW: 0,
  },
];

const APP_ROW = ROWS.find((r) => r.type === "app");

/**
 * Saurabh worked example (Malaysia / cards) plus a few peer cells so the table
 * does not read as a single hard-coded case. All figures are placeholder —
 * not a real firm geography book.
 */
const GEOGRAPHIC_CONCENTRATION: FraudGeographicConcentrationRow[] = [
  {
    id: "malaysia-cards",
    jurisdiction: "Malaysia",
    productLine: "Cards",
    exposureGBP: 420_000,
    concentrationPctOfPortfolio: 18,
    appetitePct: 8,
    appetiteRead: "OVER",
  },
  {
    id: "nigeria-app",
    jurisdiction: "Nigeria",
    productLine: "APP",
    exposureGBP: 310_000,
    concentrationPctOfPortfolio: 12,
    appetitePct: 10,
    appetiteRead: "OVER",
  },
  {
    id: "uae-electronic",
    jurisdiction: "UAE",
    productLine: "Electronic",
    exposureGBP: 180_000,
    concentrationPctOfPortfolio: 6,
    appetitePct: 10,
    appetiteRead: "WITHIN",
  },
  {
    id: "philippines-cards",
    jurisdiction: "Philippines",
    productLine: "Cards",
    exposureGBP: 95_000,
    concentrationPctOfPortfolio: 4,
    appetitePct: 8,
    appetiteRead: "WITHIN",
  },
];

const FRAUD_POSTURE: FraudPosture = {
  domainId: "fincrime",
  totalConfirmedNetLossGBP: ROWS.reduce((sum, r) => sum + r.confirmedNetLossGBP, 0),
  appReimbursementExposureGBP: APP_ROW?.appApportionmentGBP ?? 0,
  rows: ROWS,
  geographicConcentration: GEOGRAPHIC_CONCENTRATION,
  geographicConcentrationSourceLabel:
    "Geographic concentration · client-configurable placeholder (source to confirm)",
  asOf: "2026-07-10",
  sourceLabel: "Fraud Operations / Finance (source to confirm)",
};

export function getFraudPosture(): FraudPosture {
  return FRAUD_POSTURE;
}

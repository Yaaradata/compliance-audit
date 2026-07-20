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

export type FraudPosture = {
  domainId: "fincrime";
  totalConfirmedNetLossGBP: number;
  appReimbursementExposureGBP: number; // PSR mandatory reimbursement exposure
  rows: FraudLossRow[];
  asOf: string;
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

const FRAUD_POSTURE: FraudPosture = {
  domainId: "fincrime",
  totalConfirmedNetLossGBP: ROWS.reduce((sum, r) => sum + r.confirmedNetLossGBP, 0),
  appReimbursementExposureGBP: APP_ROW?.appApportionmentGBP ?? 0,
  rows: ROWS,
  asOf: "2026-07-10",
};

export function getFraudPosture(): FraudPosture {
  return FRAUD_POSTURE;
}

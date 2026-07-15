import type { UkEnforcementPrecedent } from "./types";

/**
 * REAL public UK enforcement precedents only.
 * NEVER synthesise a precedent. admissionPosture is non-nullable.
 *
 * Sources are public FCA Final Notices / court judgments.
 */
export const UK_ENFORCEMENT_PRECEDENTS: readonly UkEnforcementPrecedent[] = [
  {
    id: "nationwide-fca-2025-12-11",
    firm: "Nationwide Building Society",
    regulator: "FCA",
    date: "2025-12-11",
    amountGbp: 44_078_500,
    admissionPosture: "settled-no-admission",
    summary:
      "CDD uplift reached 888,618 of ~18m customers (4.9%). 44,957 accounts never entered the risk-profiling tool. A £1m+ referral rule covered CHAPS, SWIFT and SEPA — not BACS; £27.36m of furlough fraud arrived by BACS.",
    sourceUrl: "https://www.fca.org.uk/",
    matchedDomainIds: ["ONB", "FC", "PAY"],
    matchedThemes: ["CDD coverage gap", "risk-profiling feed gap", "payment-rail blind spot"],
  },
  {
    id: "natwest-southwark-2021-12-13",
    firm: "NatWest",
    regulator: "Southwark Crown Court",
    date: "2021-12-13",
    amountGbp: 264_772_619.95,
    admissionPosture: "guilty-plea",
    summary:
      "A transaction-monitoring rule designed to flag suspicious activity was switched off because it produced too many alerts — leaving a designed control unarmed in production.",
    sourceUrl: "https://www.fca.org.uk/",
    matchedDomainIds: ["FC", "PAY"],
    matchedThemes: ["monitoring rule disabled", "alert volume override"],
  },
  {
    id: "hsbc-fca-2024-05-23",
    firm: "HSBC",
    regulator: "FCA",
    date: "2024-05-23",
    amountGbp: 6_280_100,
    admissionPosture: "settled-no-admission",
    summary:
      "s166 skilled-person review; ~£233m redress offered, ~£185m paid, ~£94m remediation spend — population behind redress claims required independent verification.",
    sourceUrl: "https://www.fca.org.uk/",
    matchedDomainIds: ["CMP", "COL"],
    matchedThemes: ["redress population", "skilled-person review"],
  },
  {
    id: "monzo-fca-2025-07-07",
    firm: "Monzo",
    regulator: "FCA",
    date: "2025-07-07",
    amountGbp: 21_091_300,
    admissionPosture: "settled-no-admission",
    summary:
      "VREQ in force Aug 2020 → Feb 2025. Prolonged restriction on growth while financial-crime controls were rebuilt — cadence and coverage of CDD/monitoring under sustained supervisory attention.",
    sourceUrl: "https://www.fca.org.uk/",
    matchedDomainIds: ["ONB", "FC"],
    matchedThemes: ["VREQ", "financial-crime control rebuild"],
  },
] as const;

/** Guard: drop any precedent missing admissionPosture before render. */
export function renderablePrecedents(
  rows: readonly UkEnforcementPrecedent[] = UK_ENFORCEMENT_PRECEDENTS,
): UkEnforcementPrecedent[] {
  return rows.filter((p) => p.admissionPosture != null && p.admissionPosture.length > 0);
}

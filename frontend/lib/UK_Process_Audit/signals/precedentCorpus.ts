import type { UkRawControlRow } from "../types";
import type { UkPrecedent } from "./types";

/**
 * Real, public UK enforcement actions — transcribed precisely.
 * Do not round. Do not add records. Do not embellish.
 */
export const UK_PRECEDENTS: UkPrecedent[] = [
  {
    id: "natwest-fowler-oldfield-2021-12-13",
    regulator: "CrownCourt",
    noticeDate: "2021-12-13",
    respondent: "National Westminster Bank Plc",
    penalty: 264772619.95,
    penaltyPreDiscount: 397156944.14,
    tribunalReducedTo: null,
    instrument: [
      "Money Laundering Regulations 2007 reg.8(1)",
      "reg.8(3)",
      "reg.14(1)",
      "reg.45",
    ],
    admissionPosture: "guilty-plea",
    failureMechanismTags: ["alert-suppression", "disposition-quality"],
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/natwest-fined-264.8million-anti-money-laundering-failures",
    confidence: "verified",
  },
  {
    id: "nationwide-2025-12-11",
    regulator: "FCA",
    noticeDate: "2025-12-11",
    respondent: "Nationwide Building Society",
    penalty: 44078500,
    penaltyPreDiscount: 62969297,
    tribunalReducedTo: null,
    instrument: ["PRIN 3", "SYSC 6.1.1R", "SYSC 6.3.1R"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: [
      "periodic-review-absent",
      "cdd-coverage-shortfall",
      "assertion-unevidenced",
      "tm-scope-gap",
      "procedure-defeats-duty",
      "risk-tolerated-past-expiry",
    ],
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-nationwide-44m-failings-financial-crime-controls",
    confidence: "verified",
  },
  {
    id: "monzo-2025-07-07",
    regulator: "FCA",
    noticeDate: "2025-07-07",
    respondent: "Monzo Bank Limited",
    penalty: 21091300,
    penaltyPreDiscount: 30130475,
    tribunalReducedTo: null,
    instrument: ["PRIN 3", "MLR 2017", "s.55L FSMA (VREQ breach)"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: ["restriction-breach", "post-lift-drift"],
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-monzo-21m-failings-financial-crime-controls",
    confidence: "verified",
  },
  {
    id: "barclays-stunt-2025-07-14",
    regulator: "FCA",
    noticeDate: "2025-07-14",
    respondent: "Barclays Bank PLC",
    penalty: 39314700,
    penaltyPreDiscount: 56163900,
    tribunalReducedTo: null,
    instrument: ["PRIN 3", "SYSC"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: ["periodic-review-absent"],
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-barclays-42-million-poor-handling-financial-crime-risks",
    confidence: "verified",
  },
  {
    // Barclays additionally made a voluntary payment of £6,281,757 to WealthTek
    // clients. Do not put it in `penalty`.
    id: "barclays-wealthtek-2025-07-14",
    regulator: "FCA",
    noticeDate: "2025-07-14",
    respondent: "Barclays Bank UK PLC",
    penalty: 3093600,
    penaltyPreDiscount: 4419500,
    tribunalReducedTo: null,
    instrument: ["PRIN 3", "CDD under MLR 2017"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: ["assertion-unevidenced"],
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-barclays-42-million-poor-handling-financial-crime-risks",
    confidence: "verified",
  },
  {
    // primary Final Notice not fetched in research
    id: "starling-2024-09-27",
    regulator: "FCA",
    noticeDate: "2024-09-27",
    respondent: "Starling Bank Limited",
    penalty: 28959426,
    penaltyPreDiscount: 40959426,
    tribunalReducedTo: null,
    instrument: ["PRIN 3", "s.55L FSMA (VREQ breach)"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: ["restriction-breach", "sanctions-screening-misconfigured"],
    sourceUrl: "",
    confidence: "probable",
  },
  {
    // DO NOT put this penalty on a client slide until the primary Final Notice has been fetched.
    // penalty and date UNRESOLVED in research.
    id: "metro-2024-11-01",
    regulator: "FCA",
    noticeDate: "2024-11-01",
    respondent: "Metro Bank plc",
    penalty: 16675200,
    penaltyPreDiscount: 23821700,
    tribunalReducedTo: null,
    instrument: ["PRIN 3", "MLR 2017 reg.8"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: ["tm-ingestion-gap"],
    sourceUrl: "",
    confidence: "unverified",
  },
  {
    // ~£233m redress offered, ~£185m paid, ~£94m remediation spend.
    id: "hsbc-collections-2024-05-23",
    regulator: "FCA",
    noticeDate: "2024-05-23",
    respondent: "HSBC UK Bank plc / HSBC Bank plc / M&S Financial Services plc",
    penalty: 6280100,
    penaltyPreDiscount: 8971600,
    tribunalReducedTo: null,
    instrument: ["PRIN 3", "PRIN 6", "CONC 7.2", "CONC 7.3", "MCOB 13.3"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: ["remediation-unevidenced", "redress-population-incomplete"],
    sourceUrl: "",
    confidence: "verified",
  },
  {
    // £99.9m redress to 232,849 customers; programme cost ~£105m.
    id: "tsb-financial-difficulty-2024-10-10",
    regulator: "FCA",
    noticeDate: "2024-10-10",
    respondent: "TSB Bank plc",
    penalty: 10910500,
    penaltyPreDiscount: 15586500,
    tribunalReducedTo: null,
    instrument: ["PRIN 3", "PRIN 6", "CONC 7.2", "CONC 7.3", "MCOB 13.3"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: ["redress-population-incomplete", "remediation-unevidenced"],
    sourceUrl: "",
    confidence: "verified",
  },
  {
    // joint FCA £29,750,000 + PRA £18,900,000.
    id: "tsb-it-migration-2022-12-18",
    regulator: "FCA",
    noticeDate: "2022-12-18",
    respondent: "TSB Bank plc",
    penalty: 48650000,
    penaltyPreDiscount: null,
    tribunalReducedTo: null,
    instrument: ["PRIN 2", "PRIN 3", "SYSC outsourcing"],
    admissionPosture: "settled-no-admission",
    failureMechanismTags: ["remediation-unevidenced"],
    sourceUrl: "",
    confidence: "probable",
  },
  {
    // THE COUNTER-CASE. Pre-deadline the only signal was an internal IT project RAG
    // status. No control, evidence or ledger data could have predicted it.
    // Decision Notice stage.
    id: "boi-cop-2026-02-19",
    regulator: "PSR",
    noticeDate: "2026-02-19",
    respondent: "Bank of Ireland (UK) plc",
    penalty: 3779300,
    penaltyPreDiscount: 5427600,
    tribunalReducedTo: null,
    instrument: ["PSR Specific Direction 17 (Confirmation of Payee)"],
    admissionPosture: "alleged",
    failureMechanismTags: [],
    sourceUrl: "",
    confidence: "probable",
  },
  {
    // six open Consumer Duty fair-value investigations. The FCA did not name the
    // firms. NEVER name them. Never render this as a finding.
    id: "fca-enforcement-watch-1-2026-01-28",
    regulator: "FCA",
    noticeDate: "2026-01-28",
    respondent: "Firms not named by the FCA",
    penalty: null,
    penaltyPreDiscount: null,
    tribunalReducedTo: null,
    instrument: [],
    admissionPosture: "open-investigation",
    failureMechanismTags: ["assertion-unevidenced"],
    sourceUrl: "",
    confidence: "probable",
  },
];

/** Runtime guard: every precedent must carry a non-null admissionPosture. */
export function assertPrecedentsHaveAdmissionPosture(
  rows: readonly UkPrecedent[] = UK_PRECEDENTS,
): void {
  for (const p of rows) {
    if (p.admissionPosture == null) {
      throw new Error(`UkPrecedent ${p.id}: admissionPosture is required`);
    }
  }
}

/**
 * Intersect control.failureMechanismTags with precedent.failureMechanismTags.
 * Returns [] when the control carries no tags. Never guess.
 */
export function matchPrecedents(control: UkRawControlRow): UkPrecedent[] {
  const tags = control.failureMechanismTags;
  if (!tags || tags.length === 0) return [];
  const tagSet = new Set(tags);
  return UK_PRECEDENTS.filter((p) =>
    p.failureMechanismTags.some((t) => tagSet.has(t)),
  );
}

function formatGbp(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * "£264,772,619.95" | "£44,078,500 (from £62,969,297)"
 * Where tribunalReducedTo is set, BOTH figures render.
 * Where penalty is null: "Restriction — no financial penalty".
 */
export function formatPenalty(p: UkPrecedent): string {
  if (p.penalty == null) {
    return "Restriction — no financial penalty";
  }

  if (p.tribunalReducedTo != null) {
    return `${formatGbp(p.tribunalReducedTo)} (from ${formatGbp(p.penalty)})`;
  }

  if (p.penaltyPreDiscount != null) {
    return `${formatGbp(p.penalty)} (from ${formatGbp(p.penaltyPreDiscount)})`;
  }

  return formatGbp(p.penalty);
}

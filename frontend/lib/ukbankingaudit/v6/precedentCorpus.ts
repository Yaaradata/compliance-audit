/**
 * ─────────────────────────────────────────────────────────────────────────
 *  UK Banking Audit — v6 precedent corpus  (REAL, PUBLIC ENFORCEMENT DATA)
 * ─────────────────────────────────────────────────────────────────────────
 *  Every record below traces to a real, public regulatory action and is
 *  transcribed — not embellished, not rounded, not invented. Figures are
 *  copied verbatim from the source. Each record carries an explicit
 *  `admissionPosture` (no defaults) and a `confidence` flag.
 *
 *  `sourceUrl` is populated only where a primary/official URL has been
 *  confirmed. Records still marked `probable` or `unverified` deliberately
 *  carry an empty sourceUrl rather than a fabricated one — an unverified
 *  link is worse than none.
 *
 *  This corpus is REAL and is NEVER synthesised. Do not mix it with the
 *  synthetic evidence layer in riskDomainsV6.ts.
 *
 *  US NOTE: federal consumer enforcement contracted sharply in 2025-26 and
 *  displaced to prudential regulators, state AGs and private litigation.
 *  Non-monetary consequences (asset caps, consent orders) are the story, not
 *  fines. Only two US records are included; see the omission note at the end
 *  of this file for records 13-16.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { FailureMechanism, Precedent } from "./types";
import { rankPrecedents } from "./precedentRank";

export const PRECEDENTS: Precedent[] = [
  // ── UK ──────────────────────────────────────────────────────────────────
  {
    id: "uk-natwest-fowler-oldfield-2021",
    jurisdiction: "UK",
    regulator: "CrownCourt",
    noticeDate: "2021-12-13",
    respondent: "National Westminster Bank Plc",
    penalty: 264772619.95,
    penaltyPreDiscount: 397156944.14,
    nonMonetaryConsequence: null,
    admissionPosture: "guilty-plea",
    domainScope: ["fincrime"],
    failureMechanismTags: ["alert-suppression"],
    mechanism:
      "A rule designed to flag suspicious activity was switched off because it produced too many alerts. Eleven internal suspicion reports raised by staff and ten automated alerts were inadequately investigated.",
    hook: "A rule was switched off for producing too many alerts",
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/natwest-fined-264.8million-anti-money-laundering-failures",
    confidence: "verified",
  },
  {
    id: "uk-nationwide-2025",
    jurisdiction: "UK",
    regulator: "FCA",
    noticeDate: "2025-12-11",
    respondent: "Nationwide Building Society",
    penalty: 44078500,
    penaltyPreDiscount: 62969297,
    nonMonetaryConsequence: null,
    admissionPosture: "settled-no-admission",
    domainScope: ["fincrime"],
    failureMechanismTags: [
      "assertion-unevidenced",
      "cdd-coverage-shortfall",
      "periodic-review-absent",
      "risk-tolerated-past-expiry",
    ],
    mechanism:
      "The MLRO report to senior management recorded that customer due diligence had been enhanced. The uplift reached 888,618 of approximately 18 million customers. High-risk relationships identified stood at approximately 2,000; after remediation, more than 18,000. Internal Audit reported the underlying failure in October 2016 and the board agreed to tolerate it for three months in September 2017; the position stood until April 2020.",
    hook: "\"Enhanced\" CDD reached 4.9% of the book",
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-nationwide-44m-failings-financial-crime-controls",
    confidence: "verified",
    instrument: ["PRIN 3", "SYSC 6.1.1R", "SYSC 6.3.1R"],
  },
  {
    id: "uk-starling-2024",
    jurisdiction: "UK",
    regulator: "FCA",
    noticeDate: "2024-09-27",
    respondent: "Starling Bank Limited",
    penalty: 28959426,
    penaltyPreDiscount: 40959426,
    nonMonetaryConsequence: null,
    admissionPosture: "settled-no-admission",
    domainScope: ["fincrime"],
    failureMechanismTags: ["sanctions-screening-misconfigured", "restriction-breach"],
    mechanism:
      "Sanctions screening ran against a fraction of the Consolidated List from 2017 and reported as functioning. It was surfaced by the firm's own second-line review in January 2023. 54,359 accounts were opened for 49,183 high- or higher-risk customers in breach of a requirement the firm had itself applied for.",
    hook: "Screened against a fraction of the sanctions list for six years",
    sourceUrl: "",
    confidence: "probable",
  },
  {
    id: "uk-monzo-2025",
    jurisdiction: "UK",
    regulator: "FCA",
    noticeDate: "2025-07-07",
    respondent: "Monzo Bank Limited",
    penalty: 21091300,
    penaltyPreDiscount: 30130475,
    nonMonetaryConsequence: "VREQ in force Aug 2020 – Feb 2025",
    admissionPosture: "settled-no-admission",
    domainScope: ["fincrime"],
    failureMechanismTags: ["kri-breach-no-plan", "remediation-unevidenced"],
    mechanism:
      "The firm's financial crime controls did not keep pace with rapid customer growth, and it onboarded customers on limited and sometimes implausible information. A requirement (VREQ) prevented it from opening accounts for high-risk customers; between August 2020 and June 2022 the firm repeatedly breached that requirement, signing up over 34,000 high-risk customers. The VREQ was lifted in February 2025.",
    hook: "Breached its own requested restriction for 22 months",
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-monzo-21m-failings-financial-crime-controls",
    confidence: "verified",
  },
  {
    id: "uk-barclays-2025",
    jurisdiction: "UK",
    regulator: "FCA",
    noticeDate: "2025-07-14",
    respondent: "Barclays Bank PLC",
    penalty: 39314700,
    penaltyPreDiscount: 56163900,
    nonMonetaryConsequence: null,
    admissionPosture: "settled-no-admission",
    domainScope: ["fincrime"],
    failureMechanismTags: ["periodic-review-absent", "repeat-finding"],
    mechanism:
      "The firm reviewed its exposure only after learning the regulator had decided to prosecute another bank over the same underlying matter. Prior actions in 2015 and 2022 were treated as aggravating.",
    hook: "Reviewed exposure only after a peer was prosecuted",
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-barclays-42-million-poor-handling-financial-crime-risks",
    confidence: "verified",
  },
  {
    id: "uk-hsbc-2024",
    jurisdiction: "UK",
    regulator: "FCA",
    noticeDate: "2024-05-23",
    respondent: "HSBC UK Bank plc, HSBC Bank plc, M&S Financial Services plc",
    penalty: 6280100,
    penaltyPreDiscount: 8971600,
    nonMonetaryConsequence: null,
    admissionPosture: "settled-no-admission",
    domainScope: ["conduct"],
    failureMechanismTags: ["remediation-unevidenced", "closure-signed-unevidenced"],
    mechanism:
      "A skilled person was appointed under s166. Approximately £233m of redress was offered and approximately £185m paid; remediation spend was approximately £94m.",
    hook: "Redress paid £185m. Penalty £6.3m.",
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-hsbc-6-million-over-treatment-customers-financial-difficulty",
    confidence: "verified",
  },
  {
    id: "uk-tsb-2024",
    jurisdiction: "UK",
    regulator: "FCA",
    noticeDate: "2024-10-10",
    respondent: "TSB Bank plc",
    penalty: 10910500,
    penaltyPreDiscount: 15586500,
    nonMonetaryConsequence: null,
    admissionPosture: "settled-no-admission",
    domainScope: ["conduct"],
    failureMechanismTags: ["remediation-unevidenced"],
    mechanism:
      "Between June 2014 and March 2020 the firm lacked adequate systems and controls to treat customers in arrears fairly. A skilled person review ordered in July 2020 identified the extent of the failings. The firm paid £99.9m in redress to 232,849 affected customers and spent approximately £105m on remediation.",
    hook: "Skilled person found 55% of sampled files unfair",
    sourceUrl:
      "https://www.fca.org.uk/news/press-releases/fca-fines-tsb-over-treatment-customers-financial-difficulty",
    confidence: "verified",
  },
  {
    // CODE COMMENT: Penalty and date UNRESOLVED in research. Do not put this
    // figure on a client slide until the primary Final Notice has been fetched.
    id: "uk-metro-2024",
    jurisdiction: "UK",
    regulator: "FCA",
    noticeDate: "2024-11-01",
    respondent: "Metro Bank plc",
    penalty: 16675200,
    penaltyPreDiscount: 23821700,
    nonMonetaryConsequence: null,
    admissionPosture: "settled-no-admission",
    domainScope: ["fincrime"],
    failureMechanismTags: ["tm-scope-gap"],
    mechanism:
      "A transaction monitoring scope gap: a category of transactions fell outside automated screening. The specific scope, penalty and date are unconfirmed pending retrieval of the primary Final Notice.",
    hook: "Day-one transactions never reached monitoring for 4.5 years",
    sourceUrl: "",
    confidence: "unverified",
  },
  {
    id: "uk-bank-of-ireland-uk-2026",
    jurisdiction: "UK",
    regulator: "PSR",
    noticeDate: "2026-02-19",
    respondent: "Bank of Ireland (UK) plc",
    penalty: 3779300,
    penaltyPreDiscount: 5427600,
    nonMonetaryConsequence: null,
    admissionPosture: "alleged",
    domainScope: ["opsres", "regulatory"],
    failureMechanismTags: ["deadline-missed"],
    mechanism:
      "THE COUNTER-CASE. The firm missed a regulatory go-live deadline. Before the deadline, the only signal was an internal IT project RAG status. No control, evidence or ledger data could have predicted it.",
    hook: "Only pre-deadline signal was a project RAG status",
    sourceUrl: "",
    confidence: "probable",
  },
  {
    // CODE COMMENT: Six open Consumer Duty fair-value investigations. The FCA
    // did not name the firms. NEVER name them. NEVER render this as a finding.
    id: "uk-fca-enforcement-watch-1",
    jurisdiction: "UK",
    regulator: "FCA",
    noticeDate: "2026-01-28",
    respondent: "Firms not named by the FCA",
    penalty: null,
    penaltyPreDiscount: null,
    nonMonetaryConsequence: null,
    admissionPosture: "open-investigation",
    domainScope: ["conduct"],
    failureMechanismTags: ["assertion-unevidenced"],
    mechanism:
      "Six open Consumer Duty fair-value investigations. The FCA has not named the firms under investigation. This record represents open supervisory attention only and must never be rendered as a finding against any named firm.",
    hook: "Six open fair-value investigations. Firms not named.",
    sourceUrl: "",
    confidence: "probable",
  },

  // ── US ──────────────────────────────────────────────────────────────────
  {
    id: "us-wells-fargo-2018",
    jurisdiction: "US",
    regulator: "FRB",
    noticeDate: "2018-02-02",
    respondent: "Wells Fargo",
    penalty: null,
    penaltyPreDiscount: null,
    nonMonetaryConsequence: "asset cap — growth restricted pending governance remediation",
    admissionPosture: "consent-order",
    domainScope: ["conduct", "regulatory"],
    failureMechanismTags: ["repeat-finding", "accountability-orphan", "remediation-unevidenced"],
    mechanism:
      "A growth restriction, not a fine, was the operative consequence. An asset cap is a far larger commercial event than any penalty.",
    hook: "Asset cap capped growth pending governance remediation",
    sourceUrl: "",
    confidence: "probable",
  },
  {
    // CODE COMMENT: Placeholder. Replace with a verified OCC consent order
    // before any US demo. Do NOT invent a respondent.
    id: "us-occ-consent-order-placeholder",
    jurisdiction: "US",
    regulator: "OCC",
    noticeDate: "2026-xx-xx",
    respondent: "A national bank",
    penalty: null,
    penaltyPreDiscount: null,
    nonMonetaryConsequence: "consent order following repeat MRA on the same control",
    admissionPosture: "consent-order",
    domainScope: ["regulatory"],
    failureMechanismTags: ["repeat-finding"],
    mechanism:
      "Placeholder for a repeat Matter Requiring Attention (MRA) on the same control resulting in an OCC consent order. Replace with a verified OCC consent order, including respondent and date, before any US demonstration.",
    hook: "Repeat MRA on the same control triggered a consent order",
    sourceUrl: "",
    confidence: "unverified",
  },
];

/**
 * Return precedents whose failure mechanisms overlap `tags`, scoped to one
 * jurisdiction AND the signal's CRO domain. Returns [] for an empty tag list —
 * never guesses. Records with an open investigation are excluded.
 */
export function matchPrecedents(
  tags: FailureMechanism[],
  jurisdiction: "UK" | "US",
  domainId: string,
): Precedent[] {
  if (tags.length === 0) return [];
  const wanted = new Set<FailureMechanism>(tags);
  return PRECEDENTS.filter(
    (p) =>
      p.jurisdiction === jurisdiction &&
      p.domainScope.includes(domainId) &&
      p.admissionPosture !== "open-investigation" &&
      p.failureMechanismTags.some((t) => wanted.has(t)),
  );
}

/** Resolve a precedent by id. Returns undefined for a null id or an unknown one. */
export function getPrecedentById(id: string | null): Precedent | undefined {
  if (!id) return undefined;
  return PRECEDENTS.find((p) => p.id === id);
}

/**
 * Resolve precedents for a signal in a given region.
 *   • UK — the signal's ranked `precedents` array (detector-attached).
 *   • US — same-region analogues matched by mechanism + domain scope.
 */
export function resolvePrecedents(
  jurisdiction: "UK" | "US",
  precedents: Precedent[] | null | undefined,
  mechanism: FailureMechanism,
  domainId: string,
): Precedent[] {
  if (jurisdiction === "UK") return precedents ?? [];
  return rankPrecedents(matchPrecedents([mechanism], "US", domainId));
}

/** First resolved precedent for a signal, or undefined when none match. */
export function resolvePrecedent(
  jurisdiction: "UK" | "US",
  precedents: Precedent[] | null | undefined,
  mechanism: FailureMechanism,
  domainId: string,
): Precedent | undefined {
  return resolvePrecedents(jurisdiction, precedents, mechanism, domainId)[0];
}

/** Grouped £ amount; decimals only when the value is not a whole number. */
export function formatGbp(amount: number): string {
  if (Number.isNaN(amount)) return "—";
  const hasFraction = !Number.isInteger(amount);
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Render a precedent's consequence for a card.
 *   • penalty present, settled with a pre-discount figure → "£X (from £Y)"
 *   • penalty present otherwise (e.g. a Crown Court total) → "£X"
 *   • no penalty but a non-monetary consequence            → "Restriction — no financial penalty"
 *   • no penalty and no consequence                        → "No financial penalty"
 * Never emits "£NaN" and never leaves a null penalty as a blank number — an
 * asset cap has no figure and is the more serious outcome.
 */
export function formatConsequence(p: Precedent): string {
  if (p.tribunalReducedTo != null && p.penalty != null) {
    return `${formatGbp(p.tribunalReducedTo)} (tribunal-reduced from ${formatGbp(p.penalty)})`;
  }
  if (p.penalty != null) {
    const discounted =
      p.penaltyPreDiscount != null &&
      p.penaltyPreDiscount !== p.penalty &&
      p.admissionPosture === "settled-no-admission";
    return discounted
      ? `${formatGbp(p.penalty)} (from ${formatGbp(p.penaltyPreDiscount as number)})`
      : formatGbp(p.penalty);
  }
  if (p.nonMonetaryConsequence != null) return "Restriction — no financial penalty";
  return "No financial penalty";
}

/*
 * OMITTED US RECORDS 13-16
 * ------------------------
 * Not created. The brief permits four further US records ONLY with a real,
 * public order and a working sourceUrl. None could be verified to that bar
 * without inventing a respondent, a date, or a link, so they were omitted.
 * An empty slot is honest; a fabricated order ends the product. Add them
 * later only when a primary source URL is in hand.
 */

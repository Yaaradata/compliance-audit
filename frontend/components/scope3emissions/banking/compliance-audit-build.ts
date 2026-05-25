import type {
  BankComplianceAuditPage,
  BankComplianceAuditSupplement,
  BankControlRegisterRow,
  BorrowerRow,
  ComplianceCounterpartyRow,
  ComplianceCounterpartyStatus,
  ComplianceDataQualityTier,
  ExecutiveKpis,
} from "./types";
import { buildComplianceAuditDrills } from "./compliance-audit-drills";

function formatT(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function sectorTone(sector: string): ComplianceCounterpartyRow["sectorTone"] {
  const s = sector.toLowerCase();
  if (s.includes("power") || s.includes("energy")) return "energy";
  if (s.includes("steel") || s.includes("metal")) return "metals";
  if (s.includes("cement")) return "cement";
  if (s.includes("chemical") || s.includes("petro")) return "chemicals";
  if (s.includes("real estate") || s.includes("construction") || s.includes("infra")) return "infra";
  if (s.includes("agri")) return "agri";
  return "default";
}

function dataQualityFromPcaf(pcafScore: number): { tier: ComplianceDataQualityTier; score: number } {
  const score = Math.max(0, Math.min(100, Math.round(100 - (pcafScore - 1) * 21)));
  if (pcafScore <= 2) return { tier: "High", score };
  if (pcafScore === 3) return { tier: "Med", score };
  if (pcafScore === 4) return { tier: "Low", score };
  return { tier: "None", score: 0 };
}

function counterpartyStatus(b: BorrowerRow): ComplianceCounterpartyStatus {
  if (!b.brsrDisclosed && (b.engagement === "Unengaged" || b.pcafScore >= 5)) return "Non-Disclosed";
  if (b.redFlags !== "none" && b.brsrDisclosed && b.pcafScore >= 3) return "Inconsistent";
  if (!b.brsrDisclosed || b.pcafScore >= 4) return "Partial Data";
  if (b.brsrDisclosed && b.pcafScore <= 3) return "Verified";
  return "Partial Data";
}

function financedLabel(b: BorrowerRow, status: ComplianceCounterpartyStatus): { label: string; tone: ComplianceCounterpartyRow["financedEmissionsTone"] } {
  if (status === "Non-Disclosed") {
    if (b.engagement === "Unengaged") return { label: "-- (Missing)", tone: "danger" };
    return { label: "-- (Overdue)", tone: "danger" };
  }
  if (status === "Inconsistent") return { label: `${formatT(b.attributedTCO2e)} (Inconsistent)`, tone: "danger" };
  if (status === "Partial Data" && b.pcafScore >= 4) return { label: formatT(b.attributedTCO2e), tone: "warn" };
  return { label: formatT(b.attributedTCO2e), tone: "default" };
}

function sourceLabel(b: BorrowerRow, status: ComplianceCounterpartyStatus): { source: string; tone: ComplianceCounterpartyRow["sourceTone"] } {
  if (status === "Non-Disclosed") {
    if (!b.brsrDisclosed && b.engagement === "Unengaged") return { source: "No Submission", tone: "danger" };
    return { source: "Overdue 42 days", tone: "danger" };
  }
  if (b.brsrDisclosed) return { source: "BRSR Report", tone: "default" };
  if (b.pcafScore <= 2) return { source: "CDP", tone: "default" };
  return { source: "Estimated", tone: "default" };
}

function displaySector(sector: string): string {
  if (sector.includes("Power")) return "Energy";
  if (sector.includes("Steel") || sector.includes("Metal")) return "Metals";
  if (sector.includes("MSME")) return "MSME";
  if (sector.includes("Real Estate") || sector.includes("Construction")) return "Infra";
  if (sector.includes("Chemical") || sector.includes("Petro")) return "Chemicals";
  if (sector.includes("Aviation")) return "Aviation";
  if (sector.includes("Shipping")) return "Shipping";
  if (sector.includes("Cement")) return "Cement";
  if (sector.includes("Automotive")) return "Auto";
  if (sector.includes("Agri")) return "Agri";
  return sector.split(" ")[0];
}

function borrowerToCounterparty(b: BorrowerRow): ComplianceCounterpartyRow {
  const status = counterpartyStatus(b);
  const { tier, score } = dataQualityFromPcaf(b.pcafScore);
  const fin = financedLabel(b, status);
  const src = sourceLabel(b, status);
  const flagged = status !== "Verified" || b.redFlags !== "none";

  return {
    id: b.id,
    name: b.name,
    sector: displaySector(b.sector),
    sectorTone: sectorTone(b.sector),
    loanExpCr: b.loanOutstandingINRCr,
    financedEmissionsLabel: fin.label,
    financedEmissionsTone: fin.tone,
    attributionPct: status === "Non-Disclosed" ? null : b.attributionFactorPct,
    dataQualityTier: status === "Non-Disclosed" ? "None" : tier,
    dataQualityScore: status === "Non-Disclosed" ? 0 : score,
    source: src.source,
    sourceTone: src.tone,
    status,
    flagged,
  };
}

const BRSR_CATEGORIES = [
  { id: "a", label: "A — Scope 1 GHG Emissions (PI 6a)", pct: 100, status: "met" as const, brsrPrinciple: "PI 6a", dataOwner: "Facilities" },
  { id: "b", label: "B — Scope 2 GHG Emissions (PI 6a)", pct: 100, status: "met" as const, brsrPrinciple: "PI 6a", dataOwner: "Facilities" },
  { id: "c", label: "C — Scope 3 GHG Emissions (PI 6b)", pct: 83, status: "partial" as const, brsrPrinciple: "PI 6b", dataOwner: "Climate Analytics" },
  { id: "d", label: "D — Financed Emissions (Cat 15) (PI 6c)", pct: 78, status: "partial" as const, brsrPrinciple: "PI 6c", dataOwner: "ESG Risk" },
  { id: "e", label: "E — Emissions Intensity (PI 6d)", pct: 100, status: "met" as const, brsrPrinciple: "PI 6d", dataOwner: "Climate Analytics" },
  { id: "f", label: "F — Climate Targets & Net Zero (PI 8)", pct: 20, status: "not_met" as const, brsrPrinciple: "PI 8", dataOwner: "Company Secretary" },
  { id: "g", label: "G — Transition Risk Disclosure (PI 9)", pct: 55, status: "partial" as const, brsrPrinciple: "PI 9", dataOwner: "CRO Office" },
  { id: "h", label: "H — Third-Party Assurance (PI 7)", pct: 100, status: "met" as const, brsrPrinciple: "PI 7", dataOwner: "Internal Audit" },
  { id: "i", label: "I — Sector-level Emissions Breakdown", pct: 92, status: "met" as const, brsrPrinciple: "PI 6c annex", dataOwner: "ESG Risk" },
  { id: "j", label: "J — MSME / Supply Chain Emissions", pct: 41, status: "not_met" as const, brsrPrinciple: "Value chain", dataOwner: "Credit Policy" },
];

const CONTROL_CHECKLIST = [
  { id: "chk-cat1", categoryLabel: "Cat 1", title: "Purchased Goods & Services — Supplier Engagement", description: "Spend-based method applied. 94% supplier data collected. Annual verification completed Feb 2025.", status: "Effective" as const, owner: "Procurement", lastTested: "2025-02-18", linkedControlId: "C-BAX-03" },
  { id: "chk-cat3", categoryLabel: "Cat 3", title: "Fuel & Energy-Related — Upstream", description: "T&D losses calculated using SERC data. Invoice-level verification in place.", status: "Effective" as const, owner: "Facilities", lastTested: "2025-03-22", linkedControlId: "C-BAX-03" },
  { id: "chk-cat6", categoryLabel: "Cat 6", title: "Business Travel — Air, Rail & Road", description: "Travel data partially reconciled. Missing 18% of branch travel data from regional offices. Review ongoing.", status: "Needs Review" as const, owner: "Administration", lastTested: "2025-04-28" },
  { id: "chk-cat7", categoryLabel: "Cat 7", title: "Employee Commuting", description: "Survey-based estimation across all 42 offices. Third-party verified. Response rate: 78%.", status: "Effective" as const, owner: "HR", lastTested: "2025-01-15" },
  { id: "chk-cat11", categoryLabel: "Cat 11", title: "Use of Sold Products (Loan-Financed Assets)", description: "Estimation model used for auto & home loans. Real data collection from top 50 borrowers missing.", status: "Needs Review" as const, owner: "Retail Risk", lastTested: "2025-03-05" },
  { id: "chk-cat15-pcaf", categoryLabel: "Cat 15", title: "Financed Emissions — PCAF Framework", description: "PCAF Standard applied. Attribution factor calculated per asset class. 83.4% portfolio covered.", status: "Effective" as const, owner: "ESG Risk", lastTested: "2025-03-31", linkedControlId: "C-BAX-02" },
  { id: "chk-cat15-esc", categoryLabel: "Cat 15", title: "Non-Disclosed Borrowers — Escalation Control", description: "No formal escalation SOP for borrowers refusing to disclose. 146 entities flagged with no resolution.", status: "Ineffective" as const, owner: "ESG Risk", lastTested: "2025-03-10", linkedControlId: "C-BAX-01" },
  { id: "chk-governance", categoryLabel: "Governance", title: "Climate Target Integration — Board Sign-Off", description: "No board-approved climate targets aligned to SBTi or RBI Climate Risk Guidelines. Action overdue 90 days.", status: "Ineffective" as const, owner: "Company Secretary", lastTested: "2025-02-14", linkedControlId: "C-BAX-05" },
  { id: "chk-data", categoryLabel: "Data", title: "Data Validation — Anomaly Detection Routines", description: "Automated outlier detection running weekly. 4 anomalies flagged and resolved in Q4 FY25.", status: "Effective" as const, owner: "Finance Control", lastTested: "2025-04-12", linkedControlId: "C-BAX-13" },
];

const AUDIT_LOG = [
  { id: "log-1", timestamp: "14 May 25 — 08:12", author: "Priya Sharma", role: "ESG Analyst", detail: "Updated financed emissions data for Energy sector — revised IndoSteel figure from 1,520,000 to 1,580,000 tCO₂e", tag: "Cat 15 — Data Update", tagTone: "blue" as const },
  { id: "log-2", timestamp: "13 May 25 — 16:44", author: "Rajesh Kumar", role: "Internal Audit", detail: "Flagged NCR Realty Developers for inconsistent Scope 3 reporting — data variance >35% vs prior submission", tag: "Exception — Counterparty Flag", tagTone: "orange" as const },
  { id: "log-3", timestamp: "12 May 25 — 11:20", author: "Meera Nair", role: "Compliance Head", detail: "Approved Q4 Scope 3 disclosure pack — submitted to BRSR reporting portal", tag: "BRSR — Approval", tagTone: "green" as const },
  { id: "log-4", timestamp: "10 May 25 — 09:05", author: "System", role: "Automated Control", detail: "Anomaly detected in Cat 6 business travel data — 3 branch offices missing Q4 expense reports", tag: "Alert — Data Anomaly", tagTone: "red" as const },
  { id: "log-5", timestamp: "08 May 25 — 14:33", author: "Vikram Singh", role: "EY Auditor", detail: "Third-party verification completed for Scope 1, 2 & Cat 15 financed emissions", tag: "External Audit — Verified", tagTone: "green" as const },
];

const EXCEPTIONS = [
  { id: "EX-041", issue: "No SBTi targets — Board approval pending", owner: "M. Nair", due: "Overdue 90d", status: "Critical" as const, linkedControlId: "C-BAX-05" },
  { id: "EX-038", issue: "146 counterparty non-disclosures unresolved", owner: "R. Kumar", due: "Overdue 45d", status: "High" as const, linkedControlId: "C-BAX-01", linkedFindingId: "F-03" },
  { id: "EX-039", issue: "Cat 6 branch travel data missing — 18%", owner: "P. Sharma", due: "Due 20 May", status: "In Progress" as const },
  { id: "EX-040", issue: "NCR Realty inconsistent data — under investigation", owner: "R. Kumar", due: "Due 22 May", status: "In Progress" as const, linkedControlId: "C-BAX-13" },
];

/** All in-scope Scope 3 categories — operational (1–8) + Cat 11 + Cat 15 (aligned to upstream inventory). */
const DATA_CONFIDENCE = [
  { id: "dc-cat1", shortLabel: "Cat 1", confidencePct: 78, barTone: "blue" as const, pcafWeightedScore: 3.1, categoryCode: "Cat 1 — Purchased goods & services" },
  { id: "dc-cat2", shortLabel: "Cat 2", confidencePct: 76, barTone: "blue" as const, pcafWeightedScore: 3.0, categoryCode: "Cat 2 — Capital goods" },
  { id: "dc-cat3", shortLabel: "Cat 3", confidencePct: 82, barTone: "blue" as const, pcafWeightedScore: 2.8, categoryCode: "Cat 3 — Fuel & energy related" },
  { id: "dc-cat4", shortLabel: "Cat 4", confidencePct: 71, barTone: "blue" as const, pcafWeightedScore: 3.2, categoryCode: "Cat 4 — Upstream transport" },
  { id: "dc-cat5", shortLabel: "Cat 5", confidencePct: 68, barTone: "orange" as const, pcafWeightedScore: 3.4, categoryCode: "Cat 5 — Waste generated" },
  { id: "dc-cat6", shortLabel: "Cat 6", confidencePct: 62, barTone: "orange" as const, pcafWeightedScore: 3.6, categoryCode: "Cat 6 — Business travel" },
  { id: "dc-cat7", shortLabel: "Cat 7", confidencePct: 75, barTone: "blue" as const, pcafWeightedScore: 3.0, categoryCode: "Cat 7 — Employee commuting" },
  { id: "dc-cat8", shortLabel: "Cat 8", confidencePct: 74, barTone: "blue" as const, pcafWeightedScore: 2.9, categoryCode: "Cat 8 — Upstream leased assets" },
  { id: "dc-cat11", shortLabel: "Cat 11", confidencePct: 58, barTone: "red" as const, pcafWeightedScore: 4.1, categoryCode: "Cat 11 — Use of sold products" },
  { id: "dc-cat15", shortLabel: "Cat 15", confidencePct: 85, barTone: "green" as const, pcafWeightedScore: 3.42, categoryCode: "Cat 15 — Financed emissions" },
];

export function buildBankComplianceAuditPage(
  borrowers: BorrowerRow[],
  executive: ExecutiveKpis,
  supplement: BankComplianceAuditSupplement,
  controls: BankControlRegisterRow[],
): BankComplianceAuditPage {
  const counterparties = borrowers.map(borrowerToCounterparty).sort((a, b) => {
    const av = parseInt(a.financedEmissionsLabel.replace(/[^\d]/g, ""), 10) || 0;
    const bv = parseInt(b.financedEmissionsLabel.replace(/[^\d]/g, ""), 10) || 0;
    return bv - av;
  });

  const verified = counterparties.filter((c) => c.status === "Verified").length;
  const partial = counterparties.filter((c) => c.status === "Partial Data" || c.status === "Inconsistent").length;
  const nonDisc = counterparties.filter((c) => c.status === "Non-Disclosed").length;
  const portfolioTotal = 1842;
  const scale = portfolioTotal / Math.max(borrowers.length, 1);

  const openFindingsCount = supplement.openFindings.filter((f) => f.status !== "Closed").length;
  const openAuditorQueriesCount = supplement.auditorQueries.filter((q) => q.status !== "Answered").length;

  const drills = buildComplianceAuditDrills(borrowers, controls);

  return {
    pageKpis: [
      {
        id: "brsr",
        label: "BRSR Core readiness",
        value: `${executive.brsrReadinessPct}%`,
        hint: "Overall disclosure coverage score",
        tone: executive.brsrReadinessPct >= 75 ? "positive" : "warn",
      },
      {
        id: "pcaf",
        label: "PCAF data coverage",
        value: `${executive.pcafCoveragePct}%`,
        hint: "Loan book with emissions data or approved proxy",
        tone: executive.pcafCoveragePct >= 60 ? "neutral" : "warn",
      },
      {
        id: "exceptions",
        label: "Open exceptions",
        value: String(EXCEPTIONS.length),
        hint: "Control & disclosure breaks requiring action",
        tone: "negative",
      },
      {
        id: "nonDisclosed",
        label: "Non-disclosed counterparties",
        value: String(Math.round(nonDisc * scale) || 146),
        hint: "Portfolio-wide (illustrative roll-up)",
        tone: "negative",
      },
      {
        id: "findings",
        label: "Open audit findings",
        value: String(openFindingsCount),
        hint: "From control tests & assurance",
        tone: openFindingsCount > 3 ? "warn" : "neutral",
      },
      {
        id: "assurance",
        label: "Assurance readiness",
        value: `${executive.brsrReadinessPct}%`,
        hint: "Aligned to BRSR Core limited assurance plan",
        tone: "neutral",
      },
    ],
    counterparties,
    counterpartySummary: {
      verified: Math.round(verified * scale) || 1284,
      partialEstimated: Math.round(partial * scale) || 412,
      nonDisclosed: Math.round(nonDisc * scale) || 146,
      total: portfolioTotal,
    },
    brsrOverallScore: 74,
    brsrStatusLabel: "Partially Compliant",
    brsrSummary:
      "Strong on Scope 1 & 2 disclosures. Key gaps in financed emissions (Cat 15), MSME supply chain coverage, and climate target linkage.",
    brsrCounts: { fullyMet: 4, partial: 3, notMet: 3 },
    brsrCategories: BRSR_CATEGORIES,
    brsrPriorityActions: [
      { id: "act-sbti", severity: "Critical", title: "Set SBTi-Aligned Targets (PI 8)", detail: "No net-zero targets submitted. Required for BRSR Core leadership indicator compliance by Q2 FY26.", owner: "M. Nair", targetDate: "2025-06-30" },
      { id: "act-coverage", severity: "High", title: "Expand Financed Emissions Coverage", detail: "146 counterparties have zero data. PCAF data collection needed for 100% coverage per BRSR Core.", owner: "R. Kumar", targetDate: "2025-07-31" },
      { id: "act-msme", severity: "Medium", title: "MSME Supply Chain Reporting", detail: "Only 41% of MSME borrowers have submitted emissions data. Engagement program required.", owner: "Credit Policy", targetDate: "2025-08-31" },
    ],
    controlChecklist: CONTROL_CHECKLIST,
    controlChecklistSummary: {
      effective: CONTROL_CHECKLIST.filter((c) => c.status === "Effective").length,
      needsReview: CONTROL_CHECKLIST.filter((c) => c.status === "Needs Review").length,
      ineffective: CONTROL_CHECKLIST.filter((c) => c.status === "Ineffective").length,
    },
    auditLog: AUDIT_LOG,
    exceptions: EXCEPTIONS,
    dataConfidence: DATA_CONFIDENCE,
    drills,
    openFindingsCount,
    openAuditorQueriesCount,
    pcafCoverageLadder: supplement.pcafCoverageLadder,
  };
}

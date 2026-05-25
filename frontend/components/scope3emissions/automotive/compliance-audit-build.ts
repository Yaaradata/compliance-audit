import type { SupplierNode } from "./types";
import type {
  AutoComplianceAuditPage,
  AutoComplianceAuditSupplement,
  ComplianceDataQualityTier,
  ComplianceSupplierRow,
  ComplianceSupplierStatus,
} from "./compliance-audit-types";
import { buildAutoComplianceAuditDrills } from "./compliance-audit-drills";

function formatT(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function componentTone(components: string[]): ComplianceSupplierRow["componentTone"] {
  const c = components.join(" ").toLowerCase();
  if (c.includes("battery")) return "battery";
  if (c.includes("chassis") || c.includes("steel") || c.includes("alumin")) return "metals";
  if (c.includes("electron") || c.includes("motor")) return "electronics";
  if (c.includes("logistic") || c.includes("freight")) return "logistics";
  if (c.includes("cathode") || c.includes("chemical")) return "chemicals";
  return "default";
}

function dataQualityFromSupplier(s: SupplierNode): { tier: ComplianceDataQualityTier; score: number } {
  if (s.compliance === "Compliant" && s.riskLevel === "Low") return { tier: "High", score: 88 };
  if (s.compliance === "Compliant") return { tier: "Med", score: 72 };
  if (s.compliance === "At risk") return { tier: "Low", score: 48 };
  return { tier: "None", score: 0 };
}

function supplierStatus(s: SupplierNode): ComplianceSupplierStatus {
  if (s.compliance === "Non-compliant") return "Non-Disclosed";
  if (s.compliance === "At risk" && s.riskLevel === "High") return "Inconsistent";
  if (s.compliance === "At risk") return "Partial Data";
  if (s.compliance === "Compliant") return "Verified";
  return "Partial Data";
}

function supplierToRow(s: SupplierNode): ComplianceSupplierRow {
  const status = supplierStatus(s);
  const { tier, score } = dataQualityFromSupplier(s);
  const spend = s.spendINRCr ?? Math.round(s.tCO2e / 420);
  let emissionsLabel = formatT(s.tCO2e);
  let emissionsTone: ComplianceSupplierRow["scope3EmissionsTone"] = "default";
  if (status === "Non-Disclosed") {
    emissionsLabel = s.compliance === "Non-compliant" ? "-- (Missing PCF)" : "-- (Overdue)";
    emissionsTone = "danger";
  } else if (status === "Inconsistent") {
    emissionsLabel = `${formatT(s.tCO2e)} (Inconsistent)`;
    emissionsTone = "danger";
  } else if (status === "Partial Data") {
    emissionsTone = "warn";
  }

  let source = "Supplier PCF";
  let sourceTone: ComplianceSupplierRow["sourceTone"] = "default";
  if (status === "Non-Disclosed") {
    source = s.compliance === "Non-compliant" ? "No submission" : "Overdue 38 days";
    sourceTone = "danger";
  } else if (!s.certifications?.length) {
    source = "Spend-based estimate";
  }

  const sharePct = status === "Non-Disclosed" ? null : Math.min(24, Math.round((s.tCO2e / 892_000) * 1000) / 10);

  return {
    id: s.id,
    name: s.name,
    component: s.components[0] ?? "Components",
    componentTone: componentTone(s.components),
    spendINRCr: spend,
    scope3EmissionsLabel: emissionsLabel,
    scope3EmissionsTone: emissionsTone,
    sharePct,
    dataQualityTier: status === "Non-Disclosed" ? "None" : tier,
    dataQualityScore: status === "Non-Disclosed" ? 0 : score,
    source,
    sourceTone,
    status,
    flagged: status !== "Verified" || s.riskLevel === "High",
  };
}

const BRSR_CATEGORIES = [
  { id: "a", label: "A — Scope 1 GHG emissions (PI 6a)", pct: 100, status: "met" as const, brsrPrinciple: "PI 6a", dataOwner: "Facilities" },
  { id: "b", label: "B — Scope 2 GHG emissions (PI 6a)", pct: 100, status: "met" as const, brsrPrinciple: "PI 6a", dataOwner: "Facilities" },
  { id: "c", label: "C — Scope 3 GHG emissions (PI 6b)", pct: 86, status: "partial" as const, brsrPrinciple: "PI 6b", dataOwner: "Sustainability" },
  { id: "d", label: "D — Product lifecycle / use phase (PI 6c)", pct: 72, status: "partial" as const, brsrPrinciple: "PI 6c", dataOwner: "Product Engineering" },
  { id: "e", label: "E — Emissions intensity (PI 6d)", pct: 100, status: "met" as const, brsrPrinciple: "PI 6d", dataOwner: "Finance" },
  { id: "f", label: "F — Climate targets & SBTi (PI 8)", pct: 68, status: "partial" as const, brsrPrinciple: "PI 8", dataOwner: "Sustainability" },
  { id: "g", label: "G — Value chain engagement (PI 9)", pct: 58, status: "partial" as const, brsrPrinciple: "PI 9", dataOwner: "Procurement" },
  { id: "h", label: "H — Third-party assurance (PI 7)", pct: 82, status: "partial" as const, brsrPrinciple: "PI 7", dataOwner: "Internal Audit" },
  { id: "i", label: "I — Supplier emissions breakdown", pct: 76, status: "partial" as const, brsrPrinciple: "PI 6b annex", dataOwner: "Procurement" },
  { id: "j", label: "J — Tier 2/3 supplier coverage", pct: 44, status: "not_met" as const, brsrPrinciple: "Value chain", dataOwner: "Procurement" },
];

const CONTROL_CHECKLIST = [
  { id: "chk-cat1", categoryLabel: "Cat 1", title: "Purchased goods — Tier 1 PCF programme", description: "58% Tier 1 with verified PCF; spend-based remainder reconciled Feb 2025.", status: "Effective" as const, owner: "Procurement", lastTested: "2025-02-18", linkedControlId: "C-BMM-01" },
  { id: "chk-cat4", categoryLabel: "Cat 4", title: "Inbound logistics — mode split control", description: "Air freight 5.6% of inbound; sea buffer programme in progress.", status: "Needs Review" as const, owner: "Logistics", lastTested: "2025-04-28" },
  { id: "chk-cat11", categoryLabel: "Cat 11", title: "Use-phase model — ICCT + sales split", description: "Fleet LCV telematics validation pending; grid factor refresh Q1 FY26.", status: "Needs Review" as const, owner: "Product Engineering", lastTested: "2025-03-05", linkedControlId: "C-BMM-11" },
  { id: "chk-cat12", categoryLabel: "Cat 12", title: "End-of-life — recycler certificates", description: "Recycler proxy by material stream; EU export trims separate assumption set.", status: "Effective" as const, owner: "Sustainability", lastTested: "2025-01-15" },
  { id: "chk-supplier", categoryLabel: "Cat 1", title: "Non-compliant supplier escalation", description: "Cathode Materials Ltd flagged — no formal SOP for procurement hold.", status: "Ineffective" as const, owner: "Procurement", lastTested: "2025-03-10", linkedControlId: "C-BMM-03" },
  { id: "chk-governance", categoryLabel: "Governance", title: "Inventory sign-off — management attestation", description: "CFO sign-off scheduled; Cat 11 sensitivity memo outstanding.", status: "Needs Review" as const, owner: "Company Secretary", lastTested: "2025-02-14" },
  { id: "chk-data", categoryLabel: "Data", title: "Anomaly detection — duplicate supplier guard", description: "Weekly job flags duplicate Cat 1 allocations; 2 resolved in Q4.", status: "Effective" as const, owner: "Finance Control", lastTested: "2025-04-12", linkedControlId: "C-BMM-13" },
];

const AUDIT_LOG = [
  { id: "log-1", timestamp: "14 May 25 — 08:12", author: "Priya Mehta", role: "Sustainability Analyst", detail: "Updated VoltCell PCF v3.2 — Nex EV pack emissions revised +2.1%", tag: "Cat 1 — Data Update", tagTone: "blue" as const },
  { id: "log-2", timestamp: "13 May 25 — 16:44", author: "Rajesh Kumar", role: "Internal Audit", detail: "Flagged Cathode Materials for missing PCF — procurement hold recommended", tag: "Exception — Supplier Flag", tagTone: "orange" as const },
  { id: "log-3", timestamp: "12 May 25 — 11:20", author: "Meera Nair", role: "Compliance Head", detail: "Approved FY25 Scope 3 workbook for BRSR Principle 6 draft", tag: "BRSR — Approval", tagTone: "green" as const },
  { id: "log-4", timestamp: "10 May 25 — 09:05", author: "System", role: "Automated Control", detail: "Cat 4 air freight share exceeded 6% threshold in Q3", tag: "Alert — Data Anomaly", tagTone: "red" as const },
  { id: "log-5", timestamp: "08 May 25 — 14:33", author: "EY Auditor", role: "External Assurance", detail: "Limited assurance procedures started on Cat 1 & Cat 11", tag: "External Audit — In progress", tagTone: "green" as const },
];

const EXCEPTIONS = [
  { id: "EX-041", issue: "Cathode Materials PCF — non-compliant", owner: "Procurement", due: "Overdue 38d", status: "Critical" as const, linkedControlId: "C-BMM-03", linkedFindingId: "F-03" },
  { id: "EX-038", issue: "Tier 1 PCF coverage below 75% target", owner: "Sustainability", due: "Due 30 Jun", status: "High" as const },
  { id: "EX-039", issue: "Cat 11 fleet telematics — validation pending", owner: "Product Eng.", due: "Due 20 May", status: "In Progress" as const },
  { id: "EX-040", issue: "Q3 inbound air freight spike", owner: "Logistics", due: "Due 22 May", status: "In Progress" as const, linkedControlId: "C-BMM-04" },
];

const DATA_CONFIDENCE = [
  { id: "dc-cat1", shortLabel: "Cat 1", confidencePct: 78, barTone: "blue" as const, pcfTierScore: 2.4, categoryCode: "Cat 1 — Purchased goods & services" },
  { id: "dc-cat4", shortLabel: "Cat 4", confidencePct: 71, barTone: "blue" as const, pcfTierScore: 2.8, categoryCode: "Cat 4 — Upstream transport" },
  { id: "dc-cat11", shortLabel: "Cat 11", confidencePct: 64, barTone: "orange" as const, pcfTierScore: 3.2, categoryCode: "Cat 11 — Use of sold products" },
  { id: "dc-cat12", shortLabel: "Cat 12", confidencePct: 58, barTone: "orange" as const, pcfTierScore: 3.4, categoryCode: "Cat 12 — End-of-life" },
  { id: "dc-cat2", shortLabel: "Cat 2", confidencePct: 70, barTone: "blue" as const, pcfTierScore: 3.0, categoryCode: "Cat 2 — Capital goods" },
  { id: "dc-cat5", shortLabel: "Cat 5", confidencePct: 62, barTone: "orange" as const, pcfTierScore: 3.5, categoryCode: "Cat 5 — Waste" },
  { id: "dc-cat6", shortLabel: "Cat 6", confidencePct: 82, barTone: "green" as const, pcfTierScore: 2.2, categoryCode: "Cat 6 — Business travel" },
  { id: "dc-cat7", shortLabel: "Cat 7", confidencePct: 54, barTone: "red" as const, pcfTierScore: 3.8, categoryCode: "Cat 7 — Employee commuting" },
  { id: "dc-cat9", shortLabel: "Cat 9", confidencePct: 68, barTone: "blue" as const, pcfTierScore: 3.1, categoryCode: "Cat 9 — Downstream transport" },
];

export function buildAutoComplianceAuditPage(
  suppliers: SupplierNode[],
  dataCompletenessPct: number,
  supplement: AutoComplianceAuditSupplement,
): AutoComplianceAuditPage {
  const rows = suppliers
    .filter((s) => s.tier <= 2)
    .map(supplierToRow)
    .sort((a, b) => {
      const av = parseInt(a.scope3EmissionsLabel.replace(/[^\d]/g, ""), 10) || 0;
      const bv = parseInt(b.scope3EmissionsLabel.replace(/[^\d]/g, ""), 10) || 0;
      return bv - av;
    });

  const verified = rows.filter((c) => c.status === "Verified").length;
  const partial = rows.filter((c) => c.status === "Partial Data" || c.status === "Inconsistent").length;
  const nonDisc = rows.filter((c) => c.status === "Non-Disclosed").length;
  const tier12Total = 24;

  const openFindingsCount = supplement.openFindings.filter((f) => f.status !== "Closed").length;
  const openAuditorQueriesCount = supplement.auditorQueries.filter((q) => q.status !== "Answered").length;
  const drills = buildAutoComplianceAuditDrills(suppliers.filter((s) => s.tier <= 2));

  return {
    pageKpis: [
      { id: "brsr", label: "BRSR readiness", value: "76%", hint: "Principle 6 disclosure coverage", tone: "warn" },
      { id: "pcf", label: "Tier 1 PCF coverage", value: "68%", hint: "Suppliers with valid PCF on file", tone: dataCompletenessPct >= 75 ? "positive" : "warn" },
      { id: "exceptions", label: "Open exceptions", value: String(EXCEPTIONS.length), hint: "Control & data breaks", tone: "negative" },
      { id: "nonDisclosed", label: "Suppliers without PCF", value: String(nonDisc), hint: "Tier 1–2 register", tone: "negative" },
      { id: "findings", label: "Open audit findings", value: String(openFindingsCount), hint: "Assurance & controls", tone: openFindingsCount > 3 ? "warn" : "neutral" },
      { id: "assurance", label: "Assurance readiness", value: `${dataCompletenessPct}%`, hint: "Data completeness index", tone: "neutral" },
    ],
    suppliers: rows,
    supplierSummary: {
      verified: Math.max(verified, 14),
      partialEstimated: Math.max(partial, 7),
      nonDisclosed: Math.max(nonDisc, 3),
      total: tier12Total,
    },
    brsrOverallScore: 76,
    brsrStatusLabel: "Partially compliant",
    brsrSummary: "Strong on Scope 1 & 2. Gaps in Tier 2/3 supplier coverage, Cat 11 assurance, and supplier SBTi engagement.",
    brsrCounts: { fullyMet: 3, partial: 5, notMet: 2 },
    brsrCategories: BRSR_CATEGORIES,
    brsrPriorityActions: [
      { id: "act-pcf", severity: "Critical", title: "Close Cathode Materials PCF gap", detail: "Blocks Wave 1 battery coverage — escalate to procurement hold.", owner: "Procurement", targetDate: "2025-06-30" },
      { id: "act-cat11", severity: "High", title: "Cat 11 limited assurance readiness", detail: "Fleet LCV telematics and grid factor documentation for auditor.", owner: "Product Eng.", targetDate: "2025-07-31" },
      { id: "act-tier2", severity: "Medium", title: "Tier 2/3 supplier programme", detail: "Only 44% coverage — engagement letters for FY26.", owner: "Procurement", targetDate: "2025-08-31" },
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
    pcfCoverageLadder: supplement.pcfCoverageLadder,
  };
}

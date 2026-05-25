import type { SupplierNode } from "./types";
import type {
  AuditLogDrill,
  BrsrActionDrill,
  BrsrCategoryDrill,
  ComplianceAuditDrills,
  ComplianceSupplierDrill,
  ControlChecklistDrill,
  DataConfidenceDrill,
  ExceptionDrill,
} from "./compliance-audit-types";

function formatT(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function pcfScoreFromSupplier(s: SupplierNode): number {
  if (s.compliance === "Compliant" && s.riskLevel === "Low") return 2;
  if (s.compliance === "Compliant") return 3;
  if (s.compliance === "At risk") return 4;
  return 5;
}

function buildSupplierDrill(s: SupplierNode): ComplianceSupplierDrill {
  const pcfScore = pcfScoreFromSupplier(s);
  const hasPcf = s.compliance === "Compliant";
  const prior = Math.round(s.tCO2e * 0.96);
  const variancePct = Math.round(((s.tCO2e - prior) / prior) * 1000) / 10;

  return {
    supplierId: s.id,
    contractType: `Tier ${s.tier} — ${s.components[0] ?? "Components"}`,
    validity: "FY25–26 frame agreement",
    esgRating: s.riskLevel === "Low" ? "B+" : s.riskLevel === "Medium" ? "BB" : "CCC",
    pcfScore,
    pcfMethod: pcfScore <= 2 ? "Cradle-to-gate PCF on file" : pcfScore <= 3 ? "Industry LCA proxy" : "Spend-based estimate",
    brsrDisclosed: hasPcf,
    sbtiCommitted: s.compliance === "Compliant" && s.riskLevel !== "High",
    engagement: s.compliance === "Non-compliant" ? "Escalation" : s.compliance === "At risk" ? "Active dialogue" : "Verified",
    redFlags: s.compliance === "Non-compliant" ? "Missing PCF" : s.riskLevel === "High" ? "High emissions intensity" : "None",
    attributedTCO2e: s.tCO2e,
    cradleToGateTCO2e: Math.round(s.tCO2e * 0.92),
    priorYearAttributed: prior,
    variancePct,
    ratingAgency: "Internal ESG scorecard",
    dataLineage: [
      { step: "Supplier submission", source: hasPcf ? "Supplier portal PCF" : "No file on record", owner: "Procurement", updated: hasPcf ? "2025-03-18" : "—", status: hasPcf ? "Verified" : "Missing" },
      { step: "Allocation to Cat 1", source: "ERP spend + BOM mapping", owner: "Sustainability", updated: "2025-03-31", status: "Verified" },
      { step: "Assurance sampling", source: hasPcf ? "Included in FY25 limited assurance" : "Excluded — gap", owner: "Internal Audit", updated: "2025-05-08", status: hasPcf ? "Verified" : "Missing" },
    ],
    evidenceArtifacts: [
      { name: `${s.name} — PCF / LCA`, status: hasPcf ? "Available" : "Missing", docType: "PCF" },
      { name: "ISO / IATF certificates", status: s.certifications?.length ? "Available" : "In Preparation", docType: "Certification" },
      { name: "Procurement spend reconciliation", status: "Available", docType: "Invoice sample" },
    ],
    auditNotes: [
      `${formatT(s.tCO2e)} tCO₂e allocated to Cat 1 for FY25.`,
      `Destination plant: ${s.plantDestination ?? "Multi-plant"}.`,
      s.compliance === "At risk" ? "At-risk supplier — watch air freight and PCF refresh." : "Within programme thresholds.",
    ],
    remediationSteps:
      s.compliance === "Non-compliant"
        ? ["Issue PCF request with 30-day deadline.", "Hold new POs until file received."]
        : s.compliance === "At risk"
          ? ["Refresh PCF to latest version.", "Validate recycled content claims."]
          : ["Maintain annual PCF cadence."],
    linkedControlIds: s.compliance === "Non-compliant" ? ["C-BMM-03"] : ["C-BMM-01"],
    assuranceStatus: hasPcf ? "In scope — verified trail" : "Out of scope — escalation required",
  };
}

const BRSR_DRILLS: ComplianceAuditDrills["brsrCategories"] = {
  c: {
    brsrPrinciple: "PI 6b",
    regulatoryRef: "SEBI LODR — BRSR",
    dataOwner: "Sustainability",
    completenessPct: 86,
    gaps: ["Tier 2/3 supplier coverage below target"],
    evidenceRequired: ["Scope 3 inventory workbook", "Category owner sign-off"],
    actions: ["Close Cat 11 assurance memo", "Refresh supplier engagement tracker"],
    linkedReports: ["BRSR Section C — Environmental"],
    assuranceNote: "Partially met — Cat 11 model under limited assurance.",
  },
};

const CONTROL_DRILLS: Record<string, ControlChecklistDrill> = {
  "chk-cat1": {
    controlObjective: "Ensure Tier 1 supplier PCFs are collected and validated annually.",
    testProcedure: "Sample 25 suppliers; verify PCF version, boundary, and ERP tie-out.",
    lastTested: "2025-02-18",
    tester: "Internal Audit",
    owner: "Procurement",
    frameworks: ["GHG Protocol", "ISO 14064-1"],
    findings: ["58% verified PCF coverage — below 75% FY26 target."],
    evidenceLinks: ["/evidence/supplier-pcf-register-fy25.xlsx"],
    remediationPlan: "Wave 2 PCF requests by Q2 FY26.",
    nextReview: "2025-08-30",
  },
};

const LOG_DRILLS: Record<string, AuditLogDrill> = {
  "log-2": {
    eventType: "Exception flag",
    systemRef: "SUP-REG-2025-014",
    beforeValue: "Compliant",
    afterValue: "Non-compliant",
    impactedEntities: ["Cathode Materials Ltd", "Cat 1 battery materials"],
    approver: "Head of Procurement",
    relatedControlIds: ["C-BMM-03"],
    followUpActions: ["Procurement hold on new cathode POs", "Alternate supplier RFQ"],
  },
};

const EXCEPTION_DRILLS: Record<string, ExceptionDrill> = {
  "EX-041": {
    rootCause: "Supplier failed to submit refreshed PCF by programme deadline.",
    impact: "Blocks Wave 1 battery material coverage in Cat 1.",
    remediationSteps: [
      { step: "Issue formal PCF request", owner: "Procurement", due: "2025-06-15", done: true },
      { step: "Evaluate alternate supplier", owner: "Sustainability", due: "2025-07-01", done: false },
    ],
    linkedSupplierIds: ["s8"],
    linkedControlIds: ["C-BMM-03"],
    escalationPath: "CSO + Procurement GM weekly review",
    boardVisibility: false,
  },
};

const CONFIDENCE_DRILLS: Record<string, DataConfidenceDrill> = {
  "dc-cat11": {
    categoryCode: "Cat 11 — Use of sold products",
    methodology: "ICCT India memo + WLTP-adjusted fuel/grid model",
    pcfScoreDistribution: [
      { score: 1, pct: 12 },
      { score: 2, pct: 28 },
      { score: 3, pct: 35 },
      { score: 4, pct: 20 },
      { score: 5, pct: 5 },
    ],
    primaryDataPct: 28,
    estimatedPct: 52,
    missingPct: 20,
    sourceSystems: ["Sales register", "ICCT model", "Grid EF registry"],
    lastRefresh: "2025-03-28",
    versionHistory: [{ version: "v2.4", date: "2025-03-28", change: "EV mix 32% restatement" }],
    anomalies: ["Fleet LCV km assumption pending telematics validation"],
  },
};

const ACTION_DRILLS: Record<string, BrsrActionDrill> = {
  "act-pcf": {
    severity: "Critical",
    owner: "Procurement",
    targetDate: "2025-06-30",
    regulatoryDriver: "BRSR Principle 6 — value chain disclosure",
    dependencies: ["Supplier legal review", "PCF assurance where available"],
    milestones: [
      { label: "Formal PCF request issued", date: "2025-05-01", status: "Done" },
      { label: "File received & validated", date: "2025-06-30", status: "Pending" },
    ],
    linkedExceptions: ["EX-041"],
  },
};

const PAGE_KPIS: ComplianceAuditDrills["pageKpis"] = {
  brsr: {
    summary: "BRSR Principle 6 coverage is partially complete with strong Scope 1 & 2 lines.",
    bullets: ["Cat 11 assurance in progress", "Tier 2/3 supplier gap remains", "Evidence pack 76% ready"],
  },
  pcf: {
    summary: "68% of Tier 1 emissions covered by verified or LCA-backed PCFs.",
    bullets: ["Target 75% by FY26 close", "Cathode Materials blocks battery sleeve", "Wave 2 requests issued"],
  },
};

export function buildAutoComplianceAuditDrills(suppliers: SupplierNode[]): ComplianceAuditDrills {
  const supplierDrills: Record<string, ComplianceSupplierDrill> = {};
  for (const s of suppliers.filter((x) => x.tier <= 2)) {
    supplierDrills[s.id] = buildSupplierDrill(s);
  }
  return {
    suppliers: supplierDrills,
    brsrCategories: BRSR_DRILLS,
    controlChecklist: CONTROL_DRILLS,
    auditLog: LOG_DRILLS,
    exceptions: EXCEPTION_DRILLS,
    dataConfidence: CONFIDENCE_DRILLS,
    brsrActions: ACTION_DRILLS,
    pageKpis: PAGE_KPIS,
  };
}

/**
 * Persona-specific drill-down datasets — CFO, CSO, Procurement GM, Data Quality.
 * Reconciled to FY25 inventory: 4.82 Mt Scope 3 · ₹5,720 Cr revenue · 312,400 units.
 */
import type {
  AutoPersonaId,
  CfoPnlCarbonLine,
  CsoAssuranceGap,
  DataQualityGap,
  ModelCarbonEconomics,
  PersonaInsight,
  ProcurementSupplierScorecard,
  SupplierDrillDetail,
} from "./types";
import { MOCK_SUPPLIERS } from "./mockData-suppliers";

const SCOPE3_MT = 4.82;
const REVENUE_CR = 5720;
const UNITS = 312_400;

export const MOCK_CFO_PNL_CARBON: CfoPnlCarbonLine[] = [
  { line: "Revenue (₹ Cr)", fy24: 5480, fy25: REVENUE_CR, carbonIntensity: null, note: "Audited turnover" },
  { line: "COGS — purchased goods (Cat 1)", fy24: 3180, fy25: 3340, carbonIntensity: 267, note: "892 kt ÷ spend proxy" },
  { line: "Inbound logistics (Cat 4)", fy24: 198, fy25: 204, carbonIntensity: 97, note: "Tonne-km actuals 81% coverage" },
  { line: "Use-phase liability (Cat 11)", fy24: null, fy25: null, carbonIntensity: 612, note: "Not in P&L — disclosure only" },
  { line: "Shadow carbon @ ₹920/t", fy24: 454, fy25: 443, carbonIntensity: null, note: "Internal carbon price for capex gate" },
  { line: "Decarb capex pipeline", fy24: 98, fy25: 128, carbonIntensity: null, note: "₹128 Cr climate-linked FY24 register" },
  { line: "Avoided cost (programmes delivered)", fy24: 18, fy25: 31, carbonIntensity: null, note: "Sea shift + PCF refresh" },
];

/** FY25 Scope 3 allocated to each model by production share (sums to 4,820 kt). */
const MODEL_SCOPE3_KT: Record<string, number> = {
  m1: 1060,
  m2: 1639,
  m3: 868,
  m4: 1253,
};

export const MOCK_MODEL_CARBON_ECONOMICS: ModelCarbonEconomics[] = [
  {
    modelId: "m1",
    name: "BMM Nex EV",
    units: 99_968,
    revenueINRCr: 1284,
    scope3Kt: MODEL_SCOPE3_KT.m1!,
    intensityPerVehicle: 31.2,
    cat1PerVehicle: 6.1,
    cat11PerVehicle: 22.4,
    marginAtRiskINRCr: 42,
    decarbLever: "Battery PCF + grid-mix sales region",
  },
  {
    modelId: "m2",
    name: "BMM Urban ICE",
    units: 118_712,
    revenueINRCr: 1944,
    scope3Kt: MODEL_SCOPE3_KT.m2!,
    intensityPerVehicle: 44.5,
    cat1PerVehicle: 5.8,
    cat11PerVehicle: 38.6,
    marginAtRiskINRCr: 86,
    decarbLever: "Use-phase km assumption + ICE mix",
  },
  {
    modelId: "m3",
    name: "BMM Cross Hybrid",
    units: 56_232,
    revenueINRCr: 1188,
    scope3Kt: MODEL_SCOPE3_KT.m3!,
    intensityPerVehicle: 35.3,
    cat1PerVehicle: 6.4,
    cat11PerVehicle: 28.2,
    marginAtRiskINRCr: 28,
    decarbLever: "PHEV real-world factor 1.08",
  },
  {
    modelId: "m4",
    name: "BMM Fleet LCV",
    units: 37_488,
    revenueINRCr: 1304,
    scope3Kt: MODEL_SCOPE3_KT.m4!,
    intensityPerVehicle: 60.0,
    cat1PerVehicle: 7.2,
    cat11PerVehicle: 52.1,
    marginAtRiskINRCr: 124,
    decarbLever: "Fleet duty cycle + diesel proxy",
  },
];

export const MOCK_PROCUREMENT_SCORECARDS: ProcurementSupplierScorecard[] = MOCK_SUPPLIERS.filter((s) => s.tier === 1)
  .map((s, i) => ({
    supplierId: s.id,
    name: s.name,
    spendINRCr: s.spendINRCr ?? Math.round(s.tCO2e / 380),
    emissionsKt: Math.round(s.tCO2e / 1000),
    intensityPerSpendCr: Math.round((s.tCO2e / (s.spendINRCr ?? Math.round(s.tCO2e / 380))) * 10) / 10,
    pcfStatus: (s.pcfStatus ?? (["Verified", "Received", "Requested", "Expired"] as const)[i % 4])!,
    sbtiStatus: (i % 3 === 0 ? "Committed" : i % 3 === 1 ? "Not committed" : "In validation") as ProcurementSupplierScorecard["sbtiStatus"],
    contractRenewal: s.contractRenewal ?? `2025-Q${(i % 4) + 1}`,
    dataTier: (s.compliance === "Compliant" ? "Tier A" : s.compliance === "At risk" ? "Tier B" : "Tier C") as ProcurementSupplierScorecard["dataTier"],
    alternateQualified: Boolean(s.alternateSupplier),
    engagementPriority: (s.compliance === "Non-compliant" ? "P0" : s.riskLevel === "High" ? "P1" : "P2") as ProcurementSupplierScorecard["engagementPriority"],
  }))
  .sort((a, b) => b.emissionsKt - a.emissionsKt);

export const MOCK_DATA_QUALITY_GAPS: DataQualityGap[] = [
  {
    id: "dq1",
    category: "Cat 11",
    field: "Lifetime km — fleet LCV",
    issue: "Proxy",
    owner: "Product Engineering",
    confidence: 60,
    recordsAffected: 4,
    remediation: "Telematics pilot on 2,400 fleet vehicles by Q2 FY26",
    dueDate: "2025-09-30",
  },
  {
    id: "dq2",
    category: "Cat 1",
    field: "Cathode Materials Ltd PCF",
    issue: "Expired PCF",
    owner: "Procurement",
    confidence: 62,
    recordsAffected: 12,
    remediation: "Resubmit ISO 14067 with FY24 production mix",
    dueDate: "2025-05-15",
  },
  {
    id: "dq3",
    category: "Cat 4",
    field: "Cross-plant transfer legs",
    issue: "Missing distance",
    owner: "Logistics",
    confidence: 58,
    recordsAffected: 3,
    remediation: "TMS integration — Pune↔Sanand lane",
    dueDate: "2025-06-30",
  },
  {
    id: "dq4",
    category: "Cat 12",
    field: "Recycler mass balance",
    issue: "Estimated split",
    owner: "Sustainability",
    confidence: 55,
    recordsAffected: 8,
    remediation: "Third-party recycler audit certificates",
    dueDate: "2025-08-31",
  },
  {
    id: "dq5",
    category: "Cat 7",
    field: "Commuting survey coverage",
    issue: "Low response rate",
    owner: "HR / Facilities",
    confidence: 52,
    recordsAffected: 3,
    remediation: "Mandatory survey — 85% headcount target",
    dueDate: "2025-07-15",
  },
  {
    id: "dq6",
    category: "Cat 1",
    field: "Tier-2 cathode allocation",
    issue: "Spend-based fallback",
    owner: "Procurement",
    confidence: 66,
    recordsAffected: 18,
    remediation: "Allocate VoltCell pack to cathode + refine mass balance",
    dueDate: "2025-10-31",
  },
];

export const MOCK_CSO_ASSURANCE_GAPS: CsoAssuranceGap[] = [
  {
    id: "ag1",
    area: "Cat 11 model",
    brsrRef: "Principle 6 — Essential",
    status: "Partial",
    materiality: "High",
    finding: "Sensitivity on lifetime km ±10% not disclosed in draft BRSR",
    owner: "Product Engineering",
  },
  {
    id: "ag2",
    area: "Cat 1 PCF coverage",
    brsrRef: "Section C — Value chain",
    status: "Gap",
    materiality: "High",
    finding: "68% Tier-1 spend with verified PCF vs 90% FY26 target",
    owner: "Procurement",
  },
  {
    id: "ag3",
    area: "Restatement governance",
    brsrRef: "Assurance",
    status: "Mapped",
    materiality: "Medium",
    finding: "FY24 restatement log complete; ICCT grid update documented",
    owner: "Sustainability",
  },
  {
    id: "ag4",
    area: "SBTi pathway",
    brsrRef: "Leadership — Climate",
    status: "Partial",
    materiality: "High",
    finding: "FY25 actual above SBTi glide path — 0.34 Mt gap to FY26 required trajectory",
    owner: "CSO office",
  },
];

export const MOCK_PERSONA_INSIGHTS: PersonaInsight[] = [
  {
    id: "pi-cfo-1",
    persona: "cfo",
    headline: "Shadow carbon exposure flat despite −2.3% emissions",
    body: `FY25 shadow cost ₹443 Cr (@₹920/t) vs ₹454 Cr FY24 — volume growth offset intensity gains. Fleet LCV carries ₹124 Cr margin-at-risk from Cat 11 proxy.`,
    impactINRCr: 124,
    drillView: "product_components",
  },
  {
    id: "pi-cfo-2",
    persona: "cfo",
    headline: "EV mix improves intensity 18% vs ICE on production phase",
    body: "Nex EV production-phase intensity 6.1 t/veh vs Urban ICE 5.8 t Cat-1 but 38.6 t use-phase — portfolio shift to 45% EV by FY27 unlocks ~₹180 Cr shadow reduction.",
    impactINRCr: 180,
    drillView: "overview",
  },
  {
    id: "pi-cso-1",
    persona: "cso",
    headline: "0.34 Mt gap to SBTi FY26 glide path",
    body: "FY25 absolute 4.82 Mt vs required 4.48 Mt on validated pathway. Cat 11 real-world factor and supplier PCF are largest levers.",
    impactTCO2e: 340_000,
    drillView: "emissions_tracking",
  },
  {
    id: "pi-cso-2",
    persona: "cso",
    headline: "Limited assurance blocked on Cat 11 sensitivity",
    body: "Auditor PBC item #6 open — ICCT memo approved but ±10% lifetime km stress test pending board pack.",
    drillView: "compliance_audit",
  },
  {
    id: "pi-proc-1",
    persona: "procurement_lead",
    headline: "₹1,158 Cr Tier-1 spend — top 3 = 58% of Cat 1 emissions",
    body: "VoltCell + ForgeAlloys + Precision Drivetrain = 1,046 kt. Cathode Materials Ltd Tier C — qualify alternate before Q2 renewal.",
    impactTCO2e: 186_000,
    drillView: "supply_chain",
  },
  {
    id: "pi-proc-2",
    persona: "procurement_lead",
    headline: "Air freight 5.6% of inbound logistics tCO₂e",
    body: "KR cell route air leg 12.8 kt — sea buffer at Chennai retires 100% of air share at 6-month payback (₹6 Cr capex delivered).",
    impactTCO2e: 12_800,
    drillView: "geography",
  },
  {
    id: "pi-proc-3",
    persona: "procurement_lead",
    headline: "Cat 1 data coverage 74% — PCF gap on cathode renewal",
    body: "Urban ICE SUV line intensity rising; 62% PCF declarations vs 100% target. Intensity ratio flags P0 engagement before Q2 PO renewals.",
    impactTCO2e: 186_000,
    drillView: "intensity_ratio",
  },
  {
    id: "pi-dq-1",
    persona: "compliance_officer",
    headline: "84% completeness — 6 open remediation items",
    body: "Cat 11 proxy confidence 60–64% drives overall score. Cat 1 strongest at 88% actual on Q4 ledger lines.",
    drillView: "compliance_audit",
  },
  {
    id: "pi-dq-2",
    persona: "sustainability_head",
    headline: "Ledger reconciles to category control totals ±0.4%",
    body: "48 emission records sum to 4.79 Mt vs 4.82 Mt inventory — variance in Cat 7 proxy rounding.",
    drillView: "emissions_tracking",
  },
];

/** Per-supplier drill payload for supply chain drawer. */
export const MOCK_SUPPLIER_DRILL: Record<string, SupplierDrillDetail> = Object.fromEntries(
  MOCK_SUPPLIERS.filter((s) => s.tier <= 2).map((s) => {
    const spend = s.spendINRCr ?? Math.round(s.tCO2e / 380);
    const detail: SupplierDrillDetail = {
      supplierId: s.id,
      spendINRCr: spend,
      emissionsSharePct: Math.round((s.tCO2e / 4_820_000) * 1000) / 10,
      pcfStatus: s.pcfStatus ?? "Requested",
      lastPcfDate: s.id === "s1" ? "2025-03-10" : s.id === "s8" ? "2024-08-12" : "2025-01-20",
      dataLineage: s.tier === 1 ? "Supplier-specific PCF → plant allocation" : "Spend-based EEIO → mass allocation",
      inboundModes: s.id === "s1" ? ["Sea 58%", "Air 42%"] : s.plantDestination === "Chennai" ? ["Sea 72%", "Road 28%"] : ["Road 64%", "Sea 36%"],
      capActions: s.capStatus === "Open" ? ["Corrective action plan due 2025-04-30", "Alternate RFQ in progress"] : [],
      linkedRecords: s.id === "s1" ? ["e01", "e12", "e25"] : s.id === "s8" ? ["e06", "e47"] : ["e02", "e10"],
      sbtiStatus: s.id === "s3" ? "Committed" : s.id === "s8" ? "Not committed" : "In validation",
    };
    return [s.id, detail];
  }),
);

export function personaInsightsFor(persona: AutoPersonaId): PersonaInsight[] {
  const map: Partial<Record<AutoPersonaId, AutoPersonaId[]>> = {
    cfo: ["cfo", "executive"],
    cso: ["cso", "sustainability_head"],
    procurement_lead: ["procurement_lead"],
    compliance_officer: ["compliance_officer", "external_auditor"],
    sustainability_head: ["sustainability_head", "cso"],
    executive: ["cfo", "cso", "executive"],
    plant_operations: ["plant_operations"],
    automotive_head: ["automotive_head", "cso"],
  };
  const keys = map[persona] ?? [persona];
  return MOCK_PERSONA_INSIGHTS.filter((p) => keys.includes(p.persona));
}

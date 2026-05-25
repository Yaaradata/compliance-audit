/** Intensity ratio mock data — aligned to BMM FY25 inventory (₹5,720 Cr revenue · 4.82 Mt Scope 3). */
export const INTENSITY_YEARS = ["FY21", "FY22", "FY23", "FY24", "FY25"] as const;

/** ₹ Crores — matches automotiveScope3MockData.company.revenueINRCr (FY25 = 5,720 Cr). */
export const INTENSITY_INCOME = {
  revenue: [4520, 4980, 5280, 5480, 5720],
  grossMargin: [22.4, 23.1, 24.8, 26.2, 28.6],
  ebitda: [380, 420, 480, 520, 620],
  procureSpend: [2980, 3120, 3280, 3410, 3580],
};

/** ktCO₂e and intensity metrics — FY25 total 4,820 kt */
export const INTENSITY_OUTCOME = {
  scope3Total: [5240, 5080, 4940, 4930, 4820],
  intensityRev: [1160, 1020, 935, 900, 843],
  intensityUnit: [16.8, 16.2, 15.8, 15.5, 15.4],
  carbonCost: [402, 408, 418, 428, 443],
};

export type IntensityTone = "teal" | "blue" | "amber" | "red" | "purple" | "slate" | "violet";

export const INTENSITY_TONE_HEX: Record<IntensityTone, string> = {
  teal: "#0d9488",
  blue: "#2563eb",
  amber: "#ea580c",
  red: "#dc2626",
  purple: "#7c3aed",
  slate: "#64748b",
  violet: "#818cf8",
};

export interface IntensityProductRow {
  id: string;
  name: string;
  model: string;
  units: number;
  emit: number;
  rev: number;
  procure: number;
  yoy: number;
  cat1: number;
  risk: "Low" | "Medium" | "High";
  tone: IntensityTone;
}

/** Four-model portfolio — units/revenue reconcile to FY25 company totals (312,400 units · ₹5,720 Cr). */
export const INTENSITY_PRODUCTS: IntensityProductRow[] = [
  { id: "m1", name: "BMM Nex EV", model: "Nex BEV", units: 99_968, emit: 31.2, rev: 1284, procure: 804, yoy: -12, cat1: 68, risk: "Low", tone: "teal" },
  { id: "m2", name: "BMM Urban ICE", model: "Urban", units: 118_712, emit: 44.5, rev: 1944, procure: 1217, yoy: -3, cat1: 42, risk: "High", tone: "red" },
  { id: "m3", name: "BMM Cross Hybrid", model: "Cross PHEV", units: 56_232, emit: 35.3, rev: 1188, procure: 744, yoy: -8, cat1: 58, risk: "Medium", tone: "amber" },
  { id: "m4", name: "BMM Fleet LCV", model: "LCV", units: 37_488, emit: 60.0, rev: 1304, procure: 815, yoy: -2, cat1: 44, risk: "Medium", tone: "amber" },
];

export type IntensityInvestCategory =
  | "Climate & Scope 3"
  | "Product & R&D"
  | "Manufacturing"
  | "Commercial & distribution"
  | "Corporate & compliance"
  | "IT & digital"
  | "M&A & partnerships";

export type IntensityInvestType = "CapEx" | "OpEx" | "R&D" | "M&A";

export type IntensityInvestStatus = "Active" | "Complete" | "Planned" | "On hold";

export interface IntensityInvestmentRow {
  id: string;
  name: string;
  category: IntensityInvestCategory;
  investType: IntensityInvestType;
  businessUnit: string;
  spend: number;
  saved: number;
  roi: number | null;
  status: IntensityInvestStatus;
  impact: string;
  tone: IntensityTone;
  climateLinked: boolean;
}

/** FY24 company investment register — climate programmes + full corporate portfolio (₹ Cr). */
export const INTENSITY_INVEST: IntensityInvestmentRow[] = [
  // Climate & Scope 3
  {
    id: "inv-climate-battery",
    name: "Battery supply chain",
    category: "Climate & Scope 3",
    investType: "CapEx",
    businessUnit: "Procurement · EV",
    spend: 42,
    saved: 18_600,
    roi: 3.2,
    status: "Active",
    impact: "High",
    tone: "teal",
    climateLinked: true,
  },
  {
    id: "inv-climate-steel",
    name: "Green steel programme",
    category: "Climate & Scope 3",
    investType: "CapEx",
    businessUnit: "Strategic sourcing",
    spend: 28,
    saved: 11_200,
    roi: 4.1,
    status: "Active",
    impact: "High",
    tone: "blue",
    climateLinked: true,
  },
  {
    id: "inv-climate-logistics",
    name: "Logistics modal shift",
    category: "Climate & Scope 3",
    investType: "CapEx",
    businessUnit: "Plant logistics",
    spend: 6,
    saved: 9_200,
    roi: 0.9,
    status: "Complete",
    impact: "High",
    tone: "teal",
    climateLinked: true,
  },
  {
    id: "inv-climate-alu",
    name: "Recycled aluminium",
    category: "Climate & Scope 3",
    investType: "CapEx",
    businessUnit: "BIW · Pune",
    spend: 18,
    saved: 7_400,
    roi: 2.7,
    status: "Active",
    impact: "Medium",
    tone: "amber",
    climateLinked: true,
  },
  {
    id: "inv-climate-sbti",
    name: "Supplier SBTi platform",
    category: "Climate & Scope 3",
    investType: "OpEx",
    businessUnit: "Sustainability",
    spend: 8,
    saved: 6_800,
    roi: 1.8,
    status: "Active",
    impact: "Medium",
    tone: "purple",
    climateLinked: true,
  },
  {
    id: "inv-climate-ppa",
    name: "Renewable energy PPAs",
    category: "Climate & Scope 3",
    investType: "CapEx",
    businessUnit: "Energy · Tier-1",
    spend: 12,
    saved: 4_100,
    roi: 5.4,
    status: "Planned",
    impact: "Medium",
    tone: "slate",
    climateLinked: true,
  },
  {
    id: "inv-climate-lca",
    name: "LCA data infra",
    category: "Climate & Scope 3",
    investType: "CapEx",
    businessUnit: "Sustainability · IT",
    spend: 14,
    saved: 2_400,
    roi: null,
    status: "Active",
    impact: "Enabler",
    tone: "violet",
    climateLinked: true,
  },
  // Product & R&D — saved = attributed Scope 3 footprint linked to programme (typically larger than sustainability abatement lines)
  {
    id: "inv-prod-nex",
    name: "Nex EV platform & cell capacity",
    category: "Product & R&D",
    investType: "CapEx",
    businessUnit: "EV division",
    spend: 145,
    saved: 52_000,
    roi: 2.4,
    status: "Active",
    impact: "Strategic",
    tone: "teal",
    climateLinked: false,
  },
  {
    id: "inv-prod-urban",
    name: "Urban ICE lifecycle extension",
    category: "Product & R&D",
    investType: "CapEx",
    businessUnit: "ICE portfolio",
    spend: 32,
    saved: 18_400,
    roi: 1.6,
    status: "Active",
    impact: "Medium",
    tone: "amber",
    climateLinked: false,
  },
  {
    id: "inv-prod-h2",
    name: "Hydrogen powertrain pilot",
    category: "Product & R&D",
    investType: "R&D",
    businessUnit: "Advanced engineering",
    spend: 18,
    saved: 6_200,
    roi: null,
    status: "Planned",
    impact: "R&D",
    tone: "violet",
    climateLinked: false,
  },
  {
    id: "inv-prod-software",
    name: "Connected vehicle & ADAS stack",
    category: "Product & R&D",
    investType: "R&D",
    businessUnit: "Digital cockpit",
    spend: 24,
    saved: 4_800,
    roi: 1.9,
    status: "Active",
    impact: "High",
    tone: "blue",
    climateLinked: false,
  },
  // Manufacturing
  {
    id: "inv-mfg-pune-biw",
    name: "Pune BIW line & robotics",
    category: "Manufacturing",
    investType: "CapEx",
    businessUnit: "Pune plant",
    spend: 58,
    saved: 11_200,
    roi: 2.1,
    status: "Active",
    impact: "High",
    tone: "blue",
    climateLinked: false,
  },
  {
    id: "inv-mfg-sanand-paint",
    name: "Sanand paint shop upgrade",
    category: "Manufacturing",
    investType: "CapEx",
    businessUnit: "Sanand plant",
    spend: 24,
    saved: 4_600,
    roi: 1.8,
    status: "Active",
    impact: "Medium",
    tone: "slate",
    climateLinked: false,
  },
  {
    id: "inv-mfg-chennai",
    name: "Chennai capacity debottleneck",
    category: "Manufacturing",
    investType: "CapEx",
    businessUnit: "Chennai plant",
    spend: 36,
    saved: 9_800,
    roi: 2.3,
    status: "Complete",
    impact: "High",
    tone: "teal",
    climateLinked: false,
  },
  {
    id: "inv-mfg-quality",
    name: "Plant quality & metrology systems",
    category: "Manufacturing",
    investType: "CapEx",
    businessUnit: "Operations excellence",
    spend: 10,
    saved: 2_400,
    roi: 1.4,
    status: "Active",
    impact: "Medium",
    tone: "slate",
    climateLinked: false,
  },
  // Commercial & distribution
  {
    id: "inv-com-dealer",
    name: "Dealer network expansion (India)",
    category: "Commercial & distribution",
    investType: "CapEx",
    businessUnit: "Sales & marketing",
    spend: 16,
    saved: 5_600,
    roi: 1.7,
    status: "Active",
    impact: "Medium",
    tone: "amber",
    climateLinked: false,
  },
  {
    id: "inv-com-brand",
    name: "Brand & model launch marketing",
    category: "Commercial & distribution",
    investType: "OpEx",
    businessUnit: "Marketing",
    spend: 18,
    saved: 3_200,
    roi: 1.5,
    status: "Active",
    impact: "Medium",
    tone: "purple",
    climateLinked: false,
  },
  {
    id: "inv-com-fleet",
    name: "Fleet LCV commercial division",
    category: "Commercial & distribution",
    investType: "CapEx",
    businessUnit: "Fleet & B2B",
    spend: 20,
    saved: 48_000,
    roi: 2.0,
    status: "Active",
    impact: "High",
    tone: "teal",
    climateLinked: false,
  },
  {
    id: "inv-com-warranty",
    name: "Warranty & service infrastructure",
    category: "Commercial & distribution",
    investType: "CapEx",
    businessUnit: "After-sales",
    spend: 14,
    saved: 4_100,
    roi: 1.3,
    status: "Active",
    impact: "Medium",
    tone: "slate",
    climateLinked: false,
  },
  // IT & digital
  {
    id: "inv-it-sap",
    name: "SAP S/4HANA & supply analytics",
    category: "IT & digital",
    investType: "CapEx",
    businessUnit: "IT · Supply chain",
    spend: 28,
    saved: 5_400,
    roi: 1.6,
    status: "Active",
    impact: "Enabler",
    tone: "violet",
    climateLinked: false,
  },
  {
    id: "inv-it-cyber",
    name: "Cybersecurity & plant OT",
    category: "IT & digital",
    investType: "OpEx",
    businessUnit: "IT security",
    spend: 8,
    saved: 1_200,
    roi: null,
    status: "Active",
    impact: "Compliance",
    tone: "red",
    climateLinked: false,
  },
  // M&A & partnerships
  {
    id: "inv-ma-logistics",
    name: "Logistics JV stake (Kattupalli hub)",
    category: "M&A & partnerships",
    investType: "M&A",
    businessUnit: "Corporate development",
    spend: 34,
    saved: 10_500,
    roi: 2.2,
    status: "Complete",
    impact: "High",
    tone: "blue",
    climateLinked: false,
  },
  // Corporate & compliance
  {
    id: "inv-corp-eu",
    name: "EU homologation & RDE compliance",
    category: "Corporate & compliance",
    investType: "CapEx",
    businessUnit: "Regulatory affairs",
    spend: 22,
    saved: 3_800,
    roi: null,
    status: "Active",
    impact: "Compliance",
    tone: "red",
    climateLinked: false,
  },
  {
    id: "inv-corp-skills",
    name: "Workforce skilling (EV transition)",
    category: "Corporate & compliance",
    investType: "OpEx",
    businessUnit: "HR · Manufacturing",
    spend: 10,
    saved: 5_200,
    roi: null,
    status: "Active",
    impact: "Medium",
    tone: "amber",
    climateLinked: false,
  },
  {
    id: "inv-corp-esg",
    name: "ESG reporting & assurance readiness",
    category: "Corporate & compliance",
    investType: "OpEx",
    businessUnit: "Finance · Sustainability",
    spend: 11,
    saved: 4_600,
    roi: null,
    status: "Active",
    impact: "Enabler",
    tone: "violet",
    climateLinked: false,
  },
];

export const INTENSITY_RETURNS = [
  { icon: "💰", title: "CBAM cost avoidance", val: "₹118 Cr/yr", tone: "blue" as IntensityTone, desc: "EU Carbon Border Adjustment avoided on steel imports via green steel sourcing at €65/t." },
  { icon: "📋", title: "Regulatory compliance", val: "0 penalties", tone: "teal" as IntensityTone, desc: "Full BRSR / CSRD scope 3 disclosure compliance — no regulatory fines in EU markets." },
  { icon: "🏆", title: "Customer retention premium", val: "+₹1,480 Cr", tone: "amber" as IntensityTone, desc: "OEM fleet customers requiring supplier scope 3 data — CDP checks secured 3 key renewals FY24." },
  { icon: "💳", title: "Green financing benefit", val: "−22 bps", tone: "purple" as IntensityTone, desc: "Sustainability-linked loan — 22 bps reduction on ₹2,400 Cr facility tied to intensity KPIs." },
  { icon: "♻️", title: "Circular economy savings", val: "₹258 Cr/yr", tone: "teal" as IntensityTone, desc: "Recycled aluminium saves cost vs. primary metal while cutting Category 1 by 8%." },
];

export const INTENSITY_EFFICIENCY = [
  { label: "Cat 1 data coverage", val: 74, target: 90, tone: "blue" as IntensityTone, inv: false, desc: "Suppliers with verified emission data" },
  { label: "Supplier SBTi coverage", val: 48, target: 75, tone: "teal" as IntensityTone, inv: false, desc: "Tier-1 spend with approved SBTi targets" },
  { label: "Recycled material share", val: 31, target: 50, tone: "amber" as IntensityTone, inv: false, desc: "Steel, aluminium, plastics — recycled blend" },
  { label: "Air freight share", val: 6, target: 2, tone: "red" as IntensityTone, inv: true, desc: "Inbound logistics by air (reduce to <2%)" },
  { label: "PCF declarations", val: 62, target: 100, tone: "purple" as IntensityTone, inv: false, desc: "Parts with ISO 14067 carbon footprint docs" },
  { label: "Green spend ratio", val: 29, target: 60, tone: "teal" as IntensityTone, inv: false, desc: "CapEx directed to low-carbon materials & logistics" },
];

export const totalCompanyInvestSpend = INTENSITY_INVEST.reduce((s, r) => s + r.spend, 0);
export const totalClimateInvestSpend = INTENSITY_INVEST.filter((r) => r.climateLinked).reduce((s, r) => s + r.spend, 0);
export const totalClimateSavedT = INTENSITY_INVEST.filter((r) => r.climateLinked).reduce((s, r) => s + r.saved, 0);
export const climateInvestSharePct = Math.round((totalClimateInvestSpend / totalCompanyInvestSpend) * 1000) / 10;
export const activeInvestCount = INTENSITY_INVEST.filter((r) => r.status === "Active").length;
export const totalInvestCount = INTENSITY_INVEST.length;

/** @deprecated Use totalCompanyInvestSpend */
export const totalInvestSpend = totalCompanyInvestSpend;
/** Climate programmes only — tCO₂e avoided (tonnes). */
export const totalInvestSaved = totalClimateSavedT;
/** ₹ per tCO₂e avoided — climate capex (₹ Cr) vs tonnes saved. */
export const abatementCostPerT =
  totalClimateSavedT > 0
    ? Math.round((totalClimateInvestSpend * 1_00_00_000) / totalClimateSavedT).toLocaleString("en-IN")
    : "—";

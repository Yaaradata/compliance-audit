import {
  INTENSITY_EFFICIENCY,
  INTENSITY_INCOME,
  INTENSITY_INVEST,
  INTENSITY_OUTCOME,
  INTENSITY_PRODUCTS,
  INTENSITY_RETURNS,
  INTENSITY_YEARS,
  type IntensityProductRow,
} from "./intensity-ratio-data";
import type {
  IntensityDrill,
  IntensityEfficiencyDrill,
  IntensityInvestDrill,
  IntensityLensDrill,
  IntensityMetricDrill,
  IntensityProductDrill,
  IntensityReturnDrill,
  IntensityTrendPoint,
} from "./intensity-ratio-types";

function yearsSeries(values: number[], unit?: string): IntensityTrendPoint[] {
  return INTENSITY_YEARS.map((year, i) => ({ year, value: values[i] ?? 0, unit }));
}

const PRODUCT_DRILLS: Record<string, Omit<IntensityProductDrill, "id">> = {
  m1: {
    powertrain: "BEV · 60 kWh NMC pack",
    plants: ["Pune (assembly)", "Chennai (battery module)"],
    narrative:
      "Nex EV is the portfolio decoupling anchor — Cat 1 intensity fell 12% YoY on supplier-specific PCF for cells and green aluminium closure panels. Use-phase still dominates lifecycle but production intensity is best-in-class for BMM.",
    emitTrend: yearsSeries([38.2, 36.8, 34.1, 32.4, 31.2], "tCO₂e/veh"),
    categorySplit: [
      { label: "Cat 1 — purchased goods", pct: 68, tPerUnit: 21.2 },
      { label: "Cat 4 — inbound logistics", pct: 8, tPerUnit: 2.5 },
      { label: "Cat 11 — use phase (allocated)", pct: 18, tPerUnit: 5.6 },
      { label: "Other upstream", pct: 6, tPerUnit: 1.9 },
    ],
    topSuppliers: [
      { name: "VoltCell Energy Systems", spendCr: 312, emissionsKt: 186, pcfStatus: "Verified", action: "Dual-source KR/CN cells FY26" },
      { name: "ForgeAlloys India", spendCr: 98, emissionsKt: 42, pcfStatus: "Verified" },
      { name: "GreenWrap Packaging", spendCr: 24, emissionsKt: 8, pcfStatus: "Estimated" },
    ],
    benchmarks: [
      { label: "vs segment BEV avg (India)", value: "−18% intensity", status: "ok" },
      { label: "PCF coverage (Tier-1 spend)", value: "91%", status: "ok" },
      { label: "SBTi supplier share", value: "78%", status: "ok" },
    ],
    levers: [
      "Expand recycled aluminium to 42% blend on body-in-white",
      "Retire remaining air freight on cell imports by Q3 FY26",
    ],
    risks: ["Cell chemistry shift (LFP pilot) may reset Cat 1 baseline in FY27"],
  },
  m3: {
    powertrain: "Strong hybrid · 1.5L + 1.8 kWh pack",
    plants: ["Pune"],
    narrative:
      "Cross hybrid bridges ICE volume with moderate electrification — intensity improvement driven by powertrain efficiency and Tier-1 steel PCF refresh, not structural platform change.",
    emitTrend: yearsSeries([42.1, 40.2, 38.0, 36.8, 35.3], "tCO₂e/veh"),
    categorySplit: [
      { label: "Cat 1", pct: 71, tPerUnit: 25.1 },
      { label: "Cat 4", pct: 9, tPerUnit: 3.2 },
      { label: "Cat 11", pct: 14, tPerUnit: 4.9 },
      { label: "Other", pct: 6, tPerUnit: 2.1 },
    ],
    topSuppliers: [
      { name: "Tata Steel Green", spendCr: 142, emissionsKt: 58, pcfStatus: "Verified" },
      { name: "Precision Drivetrain GmbH", spendCr: 88, emissionsKt: 34, pcfStatus: "In validation" },
    ],
    benchmarks: [
      { label: "vs ICE Urban", value: "−21% intensity", status: "ok" },
      { label: "Cat 1 data tier A", value: "68%", status: "warning" },
    ],
    levers: ["Qualify EU green steel for export trim variants"],
    risks: ["Export markets require CBAM steel certificates from Q4 FY25"],
  },
  m3h: {
    powertrain: "PHEV · 12 kWh pack",
    plants: ["Pune"],
    narrative: "PHEV variant carries lower absolute Cat 1 than full BEV on smaller pack but higher logistics intensity per ₹ Cr procure spend.",
    emitTrend: yearsSeries([34.8, 33.2, 31.5, 30.4, 29.6], "tCO₂e/veh"),
    categorySplit: [
      { label: "Cat 1", pct: 58, tPerUnit: 17.2 },
      { label: "Cat 4", pct: 11, tPerUnit: 3.3 },
      { label: "Cat 11", pct: 24, tPerUnit: 7.1 },
      { label: "Other", pct: 7, tPerUnit: 2.0 },
    ],
    topSuppliers: [
      { name: "VoltCell Energy Systems", spendCr: 48, emissionsKt: 22, pcfStatus: "Verified" },
      { name: "AutoPlast Systems", spendCr: 36, emissionsKt: 14, pcfStatus: "Requested" },
    ],
    benchmarks: [{ label: "Use-phase allocation sensitivity", value: "±8% at ±10% km", status: "warning" }],
    levers: ["Consolidate pack SKUs with Nex platform"],
    risks: ["Low volume → higher fixed logistics per unit"],
  },
  m4: {
    powertrain: "Diesel LCV · fleet",
    plants: ["Sanand", "Chennai"],
    narrative:
      "LCV line has highest absolute production intensity in portfolio — drivetrain and steel dominate. Fleet customers accept intensity if total cost of ownership improves; focus on modal shift for inbound parts.",
    emitTrend: yearsSeries([64.2, 62.8, 61.5, 60.8, 60.0], "tCO₂e/veh"),
    categorySplit: [
      { label: "Cat 1", pct: 44, tPerUnit: 26.4 },
      { label: "Cat 4", pct: 14, tPerUnit: 8.4 },
      { label: "Cat 11", pct: 35, tPerUnit: 21.0 },
      { label: "Other", pct: 7, tPerUnit: 4.2 },
    ],
    topSuppliers: [
      { name: "ForgeAlloys India", spendCr: 210, emissionsKt: 92, pcfStatus: "Verified" },
      { name: "Diesel Powertrain EU", spendCr: 124, emissionsKt: 48, pcfStatus: "Estimated", action: "RFQ low-carbon casting FY26" },
    ],
    benchmarks: [
      { label: "vs industry LCV avg", value: "+6% intensity", status: "warning" },
      { label: "Fleet customer CDP score", value: "B", status: "ok" },
    ],
    levers: ["Increase load factor on Chennai–Sanand inter-plant leg"],
    risks: ["Euro VII prep may add after-treatment mass (+3% Cat 1)"],
  },
  m2: {
    powertrain: "ICE · 1.2L petrol",
    plants: ["Pune", "Sanand"],
    narrative:
      "Urban ICE remains volume leader — intensity flat YoY as BEV mix within plant rises but absolute ICE production stays high. Cat 1 dominated by conventional steel and legacy supplier mix.",
    emitTrend: yearsSeries([48.2, 47.1, 46.2, 45.2, 44.5], "tCO₂e/veh"),
    categorySplit: [
      { label: "Cat 1", pct: 42, tPerUnit: 18.7 },
      { label: "Cat 4", pct: 7, tPerUnit: 3.1 },
      { label: "Cat 11", pct: 45, tPerUnit: 20.0 },
      { label: "Other", pct: 6, tPerUnit: 2.7 },
    ],
    topSuppliers: [
      { name: "Tata Steel Green", spendCr: 286, emissionsKt: 118, pcfStatus: "Verified" },
      { name: "Cathode Materials Ltd", spendCr: 92, emissionsKt: 48, pcfStatus: "Missing", action: "P0 — alternate RFQ open" },
      { name: "RubberTech Polymers", spendCr: 44, emissionsKt: 18, pcfStatus: "Estimated" },
    ],
    benchmarks: [
      { label: "Tier-2 data coverage", value: "41%", status: "gap" },
      { label: "Renewal risk (Q2)", value: "2 suppliers", status: "warning" },
    ],
    levers: ["Shift 15% body steel to green steel programme", "Mandate PCF on cathode sub-assembly renewals"],
    risks: ["Regulatory export markets may penalise ICE mix in fleet tenders"],
  },
  m2x: {
    powertrain: "ICE SUV · 1.5L turbo",
    plants: ["Pune"],
    narrative:
      "Urban SUV sub-line intensity increased 1% YoY — heavier trim and AWD options outweigh mild powertrain gains. Highest procurement watch-list for FY26 renewals.",
    emitTrend: yearsSeries([49.8, 50.2, 50.8, 51.0, 51.2], "tCO₂e/veh"),
    categorySplit: [
      { label: "Cat 1", pct: 38, tPerUnit: 19.5 },
      { label: "Cat 4", pct: 8, tPerUnit: 4.1 },
      { label: "Cat 11", pct: 48, tPerUnit: 24.6 },
      { label: "Other", pct: 6, tPerUnit: 3.0 },
    ],
    topSuppliers: [
      { name: "Cathode Materials Ltd", spendCr: 68, emissionsKt: 36, pcfStatus: "Missing", action: "Hold PO until PCF received" },
      { name: "LuxTrim Interiors", spendCr: 52, emissionsKt: 12, pcfStatus: "Requested" },
    ],
    benchmarks: [
      { label: "YoY intensity", value: "+1.0%", status: "gap" },
      { label: "PCF on renewals", value: "38%", status: "gap" },
    ],
    levers: ["Bundle SUV with PHEV platform suppliers where possible"],
    risks: ["Consumer mix shifting to AWD (+120 kg) without LCAs updated"],
  },
};

const EFFICIENCY_DRILLS: Record<string, IntensityEfficiencyDrill> = {
  "cat-1": {
    slug: "cat-1",
    narrative:
      "74% of Tier-1 spend has supplier-specific or third-party verified Cat 1 data; remainder uses India EEIO v2024 with plant allocation keys. Gap concentrated in fasteners and electronics.",
    fyTrend: yearsSeries([58, 62, 67, 71, 74], "%"),
    gapToTarget: 16,
    spendOrVolumeNote: "₹2,640 Cr Cat 1 spend · 186 Tier-1 SKUs",
    topGaps: [
      { item: "Cathode Materials Ltd — no ISO 14067", owner: "Procurement", due: "2025-06-30", status: "Overdue" },
      { item: "Electronics harness cluster — spend-based only", owner: "Sustainability", due: "2025-09-15", status: "On track" },
      { item: "Tier-2 casting — 41% coverage", owner: "Quality", due: "2025-12-31", status: "Planned" },
    ],
    linkedSuppliers: ["Cathode Materials Ltd", "AutoPlast Systems", "RubberTech Polymers"],
    controls: ["C-BMM-01 PCF programme", "Monthly spend reconciliation to ledger"],
  },
  sbti: {
    slug: "sbti",
    narrative: "48% of Tier-1 spend is with suppliers holding approved SBTi targets or commitments; target 75% by FY27.",
    fyTrend: yearsSeries([28, 34, 39, 44, 48], "%"),
    gapToTarget: 27,
    spendOrVolumeNote: "₹1,716 Cr spend under SBTi umbrella",
    topGaps: [
      { item: "VoltCell — commitment only, not validated", owner: "Procurement", due: "2025-08-01", status: "On track" },
      { item: "LuxTrim — not committed", owner: "Procurement", due: "2025-10-01", status: "At risk" },
    ],
    linkedSuppliers: ["VoltCell Energy Systems", "LuxTrim Interiors", "Diesel Powertrain EU"],
    controls: ["Supplier engagement calendar", "CDP supply chain module"],
  },
  recycled: {
    slug: "recycled",
    narrative: "Recycled content share weighted by mass — steel 24%, aluminium 38%, plastics 12%.",
    fyTrend: yearsSeries([22, 24, 27, 29, 31], "%"),
    gapToTarget: 19,
    spendOrVolumeNote: "Green steel programme + closed-loop aluminium",
    topGaps: [
      { item: "Plastics closed-loop — pilot only", owner: "R&D", due: "2026-03-31", status: "Planned" },
    ],
    controls: ["Mass-balance certificates", "Incoming QC tags"],
  },
  air: {
    slug: "air",
    narrative: "Air freight represents 6% of inbound logistics tCO₂e — KR cell route is primary driver (12.8 kt). Sea buffer programme targets <2%.",
    fyTrend: yearsSeries([11, 9, 8, 7, 6], "%"),
    gapToTarget: 4,
    spendOrVolumeNote: "42 kt total Cat 4 · 2.5 kt from air",
    topGaps: [
      { item: "KR→Chennai cells — 42% air share", owner: "Logistics", due: "2025-07-31", status: "Active" },
      { item: "TW electronics — expedited lane", owner: "Procurement", due: "2025-06-15", status: "Active" },
    ],
    linkedSuppliers: ["VoltCell Energy Systems"],
    controls: ["Modal shift KPI in procurement scorecard"],
  },
  pcf: {
    slug: "pcf",
    narrative: "62% of active part numbers have ISO 14067 or equivalent cradle-to-gate declarations on file.",
    fyTrend: yearsSeries([44, 50, 55, 59, 62], "%"),
    gapToTarget: 38,
    spendOrVolumeNote: "4,820 active SKUs · 2,988 with PCF",
    topGaps: [
      { item: "Urban ICE SUV renewals — 38% PCF", owner: "Procurement", due: "2025-05-31", status: "Critical" },
    ],
    linkedSuppliers: ["Cathode Materials Ltd", "AutoPlast Systems"],
    controls: ["Procurement hold SOP for missing PCF"],
  },
  green: {
    slug: "green",
    narrative: "29% of addressable procurement spend flows through qualified low-carbon programmes (green steel, recycled Al, renewable PPAs for suppliers).",
    fyTrend: yearsSeries([18, 21, 24, 27, 29], "%"),
    gapToTarget: 31,
    spendOrVolumeNote: "₹1,038 Cr green-tagged spend FY25",
    topGaps: [{ item: "LCV drivetrain — not yet in green steel scope", owner: "Procurement", due: "2025-11-30", status: "Planned" }],
    controls: ["Green spend tagging in ERP", "Quarterly CSO review"],
  },
};

function efficiencySlug(label: string): string {
  if (label.includes("Cat 1")) return "cat-1";
  if (label.includes("SBTi")) return "sbti";
  if (label.includes("Recycled")) return "recycled";
  if (label.includes("Air")) return "air";
  if (label.includes("PCF")) return "pcf";
  return "green";
}

function investNarrative(r: (typeof INTENSITY_INVEST)[number]): string {
  if (r.climateLinked) {
    if (r.name === "Battery supply chain") {
      return "Dual-source qualification and cell chemistry roadmap — ~18.6 kt CO₂e avoided in FY25; locks in further Cat 1/4 reductions through 2030 at current mix.";
    }
    if (r.name === "Green steel programme") {
      return "Contracted low-carbon steel from EU and domestic mills — feeds Pune and Sanand body shops.";
    }
    if (r.name === "Logistics modal shift") {
      return "Sea buffer inventory at Chennai retired 100% of KR air leg on cells within 6 months of go-live.";
    }
    return `${r.name} — FY24 climate programme under ${r.category}. ${r.saved > 0 ? `${r.saved.toLocaleString("en-IN")} tCO₂e avoided to date.` : "Assurance and data enabler for scope 3 disclosure."}`;
  }
  return `FY24 ${r.investType} — ${r.category}. ${r.businessUnit} owns delivery. ${r.roi != null ? `Target financial ROI ${r.roi}×.` : "Strategic / compliance spend — ROI tracked qualitatively."} Not in scope 3 abatement register unless tagged climate-linked.`;
}

function investMilestones(r: (typeof INTENSITY_INVEST)[number]) {
  if (r.name === "Battery supply chain") {
    return [
      { date: "2024-04", label: "KR alternate qualified", done: true },
      { date: "2025-01", label: "CN cathode low-carbon route", done: true },
      { date: "2025-09", label: "100% air retirement", done: false },
    ];
  }
  if (r.status === "Complete") {
    return [
      { date: "2024-03", label: "Board approval", done: true },
      { date: "2024-09", label: "Go-live", done: true },
      { date: "2025-03", label: "Benefits realisation review", done: true },
    ];
  }
  return [
    { date: "2024-06", label: "Phase 1 complete", done: true },
    { date: "2025-06", label: "Phase 2 rollout", done: false },
    { date: "2025-12", label: "FY25 gate review", done: false },
  ];
}

const INVEST_DRILLS: Record<string, IntensityInvestDrill> = Object.fromEntries(
  INTENSITY_INVEST.map((r) => [
    r.name,
    {
      name: r.name,
      owner: r.businessUnit,
      narrative: investNarrative(r),
      spendCr: r.spend,
      savedT: r.saved,
      roi: r.roi,
      status: r.status,
      milestones: investMilestones(r),
      categoryImpact: r.climateLinked
        ? [
            { cat: "Cat 1", sharePct: r.name.includes("Logistics") ? 15 : 72 },
            { cat: "Cat 4", sharePct: r.name.includes("Logistics") ? 78 : 12 },
            { cat: "Other", sharePct: 10 },
          ]
        : [],
      risks:
        r.roi != null && r.roi < 1
          ? ["ROI below 1× in year 1 — strategic mandate"]
          : r.status === "On hold"
            ? ["Funding gate — pending board"]
            : [],
    } satisfies IntensityInvestDrill,
  ]),
);

const METRIC_DRILLS: Record<string, IntensityMetricDrill> = {
  revenue: {
    id: "revenue",
    label: "Revenue FY25",
    narrative: "₹5,720 Cr audited turnover — volume + mix + ASP uplift. Revenue grew 4.4% YoY while Scope 3 fell 2.3%.",
    series: yearsSeries(INTENSITY_INCOME.revenue, "₹ Cr"),
    drivers: [
      { label: "Volume", impact: "+2.1% revenue", tone: "teal" },
      { label: "ASP / mix", impact: "+2.3% revenue", tone: "blue" },
      { label: "Export share", impact: "+18% on EU trims", tone: "amber" },
    ],
    benchmarks: ["BRSR turnover denominator per Ind AS 115"],
  },
  scope3: {
    id: "scope3",
    label: "Scope 3 absolute",
    narrative: "4.82 Mt FY25 — down 110 kt YoY. Cat 11 flat; Cat 1 −4.2% on green material programmes.",
    series: yearsSeries(INTENSITY_OUTCOME.scope3Total, "kt"),
    drivers: [
      { label: "Cat 1 purchased goods", impact: "−4.2%", tone: "teal" },
      { label: "Cat 4 logistics", impact: "−1.1%", tone: "teal" },
      { label: "Cat 11 use phase", impact: "+0.4%", tone: "amber" },
    ],
  },
  intensityRev: {
    id: "intensityRev",
    label: "Intensity / ₹ Cr revenue",
    narrative: "843 tCO₂e per ₹ Cr revenue — −6.3% YoY. Primary decoupling KPI for board and green loan covenant.",
    series: yearsSeries(INTENSITY_OUTCOME.intensityRev, "t/Cr"),
    drivers: [
      { label: "BEV mix", impact: "−3.8 pp intensity", tone: "teal" },
      { label: "Supplier PCF", impact: "−1.4 pp", tone: "blue" },
      { label: "Revenue scale", impact: "−1.1 pp", tone: "violet" },
    ],
    benchmarks: ["Green loan trigger: <820 t/Cr by FY26"],
  },
  decoupling: {
    id: "decoupling",
    label: "Intensity decoupling",
    narrative: "Structural decoupling since FY21 — revenue CAGR 6.2% vs Scope 3 CAGR −2.0%.",
    series: yearsSeries(
      INTENSITY_YEARS.map((_, i) =>
        Math.round((INTENSITY_OUTCOME.intensityRev[i]! / INTENSITY_OUTCOME.intensityRev[0]!) * 100),
      ),
      "index",
    ),
    drivers: [
      { label: "Powertrain mix", impact: "Largest lever", tone: "teal" },
      { label: "Material efficiency", impact: "Second", tone: "blue" },
      { label: "Logistics", impact: "Third", tone: "amber" },
    ],
  },
  procureSpend: {
    id: "procureSpend",
    label: "Procurement spend FY25",
    narrative: "₹3,580 Cr Tier-1 + inbound logistics — up 5.0% YoY while Cat 1 intensity fell 4.2% on green material programmes.",
    series: yearsSeries(INTENSITY_INCOME.procureSpend, "₹ Cr"),
    drivers: [
      { label: "Volume-linked BOM", impact: "+3.1% spend", tone: "amber" },
      { label: "Green steel premium", impact: "+1.4% spend", tone: "blue" },
      { label: "Air freight reduction", impact: "−0.8% spend", tone: "teal" },
    ],
    benchmarks: ["Tier-1 register reconciled monthly to GL"],
  },
  intensityUnit: {
    id: "intensityUnit",
    label: "Intensity / vehicle",
    narrative: "15.4 tCO₂e per unit produced — −0.6% YoY. BEV mix and supplier PCF are primary levers; ICE SUV sub-line offsets gains.",
    series: yearsSeries(INTENSITY_OUTCOME.intensityUnit, "t/veh"),
    drivers: [
      { label: "BEV production share", impact: "−1.2 t/veh", tone: "teal" },
      { label: "Supplier-specific PCF", impact: "−0.4 t/veh", tone: "blue" },
      { label: "ICE SUV mix", impact: "+0.6 t/veh", tone: "red" },
    ],
  },
  carbonCost: {
    id: "carbonCost",
    label: "Shadow carbon cost",
    narrative: "₹443 Cr embedded liability at ₹920/tCO₂e — used for capex prioritisation and green loan reporting.",
    series: yearsSeries(INTENSITY_OUTCOME.carbonCost, "₹ Cr"),
    drivers: [
      { label: "Absolute Scope 3", impact: "−2.3% YoY", tone: "teal" },
      { label: "Shadow price uplift", impact: "+3.5% YoY", tone: "amber" },
    ],
    benchmarks: ["Internal carbon price ₹920/t (FY25)"],
  },
};

const LENS_DRILLS: Record<string, IntensityLensDrill> = {
  bev: {
    title: "BEV mix is the primary lever",
    narrative: "BEV share of production rose from 8% (FY20) to 41% (FY24). Portfolio planning targets 52% by FY27.",
    evidence: [
      "Each +1 pp BEV shift reduces fleet production intensity ~0.9 tCO₂e/vehicle (internal LCA).",
      "Nex + Cross PHEV account for 62% of FY25 BEV/hybrid volume.",
    ],
    actions: [
      { owner: "Product planning", action: "Align powertrain roadmap to SBTi glide path", due: "2025-07-15" },
      { owner: "Procurement", action: "Lock cell capacity with verified PCF", due: "2025-06-30" },
    ],
  },
  cat1: {
    title: "Cat 1 spend cuts cost",
    narrative: "Category 1 intensity fell 34% vs FY20 baseline on programmes below — not a one-off commodity effect.",
    evidence: ["Green steel −11% vs primary", "Recycled Al −8% on BIW", "Cell supplier engagement −9%"],
    actions: [{ owner: "Procurement GM", action: "Renew cathode with alternate qualified source", due: "2025-06-30" }],
  },
  ice: {
    title: "ICE SUV is a rising liability",
    narrative: "Urban ICE SUV intensity +1% YoY with widening Tier-2 data gaps ahead of Q2 renewals.",
    evidence: ["PCF coverage 38% on SUV renewals", "Cathode Materials Ltd flagged non-compliant"],
    actions: [
      { owner: "Procurement", action: "PCF gate on all SUV PO releases", due: "2025-05-31" },
      { owner: "Sustainability", action: "Publish SUV-specific supplier brief", due: "2025-05-20" },
    ],
  },
};

export function buildProductDrill(row: IntensityProductRow): IntensityProductDrill {
  const base = PRODUCT_DRILLS[row.id];
  return {
    id: row.id,
    ...(base ?? {
      powertrain: "—",
      plants: ["Pune"],
      narrative: `${row.name} (${row.model}) — ${row.emit} tCO₂e/vehicle at ${(row.units / 1000).toFixed(0)}k units FY25.`,
      emitTrend: yearsSeries([row.emit + 4, row.emit + 2, row.emit + 1, row.emit, row.emit], "tCO₂e/veh"),
      categorySplit: [{ label: "Cat 1", pct: row.cat1, tPerUnit: (row.emit * row.cat1) / 100 }],
      topSuppliers: [],
      benchmarks: [],
      levers: [],
      risks: [],
    }),
  };
}

export function getIntensityDrill(drill: IntensityDrill): IntensityDrill {
  return drill;
}

export function drillForProduct(row: IntensityProductRow): IntensityDrill {
  return { kind: "product", title: `${row.name} (${row.model})`, drill: buildProductDrill(row) };
}

export function drillForEfficiency(label: string): IntensityDrill | null {
  const d = EFFICIENCY_DRILLS[efficiencySlug(label)];
  if (!d) return null;
  return { kind: "efficiency", title: label, drill: d };
}

export function drillForInvestment(name: string): IntensityDrill | null {
  const d = INVEST_DRILLS[name];
  if (!d) return null;
  return { kind: "investment", title: name, drill: d };
}

export function drillForReturn(title: string): IntensityDrill | null {
  const r = INTENSITY_RETURNS.find((x) => x.title === title);
  if (!r) return null;
  return {
    kind: "return",
    title: r.title,
    drill: {
      title: r.title,
      narrative: r.desc,
      quantifiedValue: r.val,
      assumptions: ["Shadow price ₹920/tCO₂e unless noted", "FY25 run-rate basis"],
      linkedProgrammes: INTENSITY_INVEST.filter((i) => i.impact === "High").map((i) => i.name).slice(0, 3),
    },
  };
}

export function drillForMetric(id: string): IntensityDrill | null {
  const d = METRIC_DRILLS[id];
  if (!d) return null;
  return { kind: "metric", title: d.label, drill: d };
}

export function drillForLens(title: string): IntensityDrill | null {
  const key = title.includes("BEV") ? "bev" : title.includes("Cat 1") ? "cat1" : "ice";
  const d = LENS_DRILLS[key];
  if (!d) return null;
  return { kind: "lens", title, drill: d };
}

export const INTENSITY_PRODUCTS_ENRICHED = INTENSITY_PRODUCTS.map((p) => ({
  ...p,
  drill: buildProductDrill(p),
}));

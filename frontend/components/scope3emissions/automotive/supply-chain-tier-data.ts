import type { AutomotiveScope3MockData, SupplierNode } from "./types";

export type SupplyChainTierId = 0 | 1 | 2 | 3;

export type TierTrend = "reducing" | "stable" | "increasing";

export interface CategoryKpiCard {
  id: string;
  catLabel: string;
  pct: number;
  title: string;
  barColor: string;
}

export interface TierEmissionRow {
  id: string;
  label: string;
  valuePerVehicle: number;
  barPct: number;
  trend: TierTrend;
}

export interface SupplyChainTierDetail {
  id: SupplyChainTierId;
  tabLabel: string;
  title: string;
  avgEmissions: string;
  supplierCount: string;
  ghgProtocol: string;
  dataSource: string;
  riskChips: string[];
  keyEntities: string[];
  emissionRows: TierEmissionRow[];
  calculationMethod: string;
}

const CATEGORY_COLORS: Record<number, string> = {
  1: "#3b82f6",
  4: "#10b981",
  9: "#8b5cf6",
  11: "#f87171",
  12: "#f97316",
};

export function buildCategoryKpiCards(data: AutomotiveScope3MockData): CategoryKpiCard[] {
  const cats = data.valueChainCategories;
  const pick = (ghg: number, short: string, title: string) => {
    const row = cats.find((c) => c.ghgCategory === ghg);
    return {
      id: `cat-${ghg}`,
      catLabel: `Cat ${ghg}`,
      pct: row?.pct ?? 0,
      title,
      barColor: CATEGORY_COLORS[ghg] ?? "#64748b",
    };
  };
  const othersPct = cats
    .filter((c) => ![1, 4, 9, 11, 12].includes(c.ghgCategory))
    .reduce((a, c) => a + c.pct, 0);
  return [
    pick(1, "Cat 1", "Purchased goods"),
    pick(4, "Cat 4", "Inbound logistics"),
    pick(9, "Cat 9", "Outbound logistics"),
    pick(11, "Cat 11", "Vehicle use phase"),
    pick(12, "Cat 12", "End-of-life"),
    {
      id: "cat-others",
      catLabel: "Others",
      pct: Math.round(othersPct * 10) / 10,
      title: "Cat 2,3,5,6,7…",
      barColor: "#64748b",
    },
  ];
}

function avgIntensity(suppliers: SupplierNode[]): number {
  if (!suppliers.length) return 0;
  return suppliers.reduce((a, s) => a + s.intensity, 0) / suppliers.length;
}

function tier1Breakdown(suppliers: SupplierNode[]): TierEmissionRow[] {
  const byComponent = new Map<string, number>();
  for (const s of suppliers) {
    for (const c of s.components) {
      byComponent.set(c, (byComponent.get(c) ?? 0) + s.tCO2e);
    }
  }
  const total = [...byComponent.values()].reduce((a, v) => a + v, 0) || 1;
  const rows = [...byComponent.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, tCO2e], i) => ({
      id: `t1-${i}`,
      label,
      valuePerVehicle: Math.round((tCO2e / 312_400) * 10) / 10,
      barPct: Math.round((tCO2e / total) * 100),
      trend: (i % 3 === 2 ? "stable" : "reducing") as TierTrend,
    }));
  return rows.length
    ? rows
    : [
        { id: "d1", label: "Battery pack supply", valuePerVehicle: 2.8, barPct: 42, trend: "reducing" },
        { id: "d2", label: "Drivetrain & power electronics", valuePerVehicle: 1.6, barPct: 24, trend: "reducing" },
        { id: "d3", label: "Body & chassis metals", valuePerVehicle: 1.2, barPct: 18, trend: "stable" },
        { id: "d4", label: "Interior & trim", valuePerVehicle: 0.9, barPct: 16, trend: "reducing" },
      ];
}

export function buildSupplyChainTiers(data: AutomotiveScope3MockData): SupplyChainTierDetail[] {
  const t1 = data.suppliers.filter((s) => s.tier === 1);
  const t2 = data.suppliers.filter((s) => s.tier === 2);
  const t3 = data.suppliers.filter((s) => s.tier === 3);
  const plants = data.company.plants.join(", ");

  return [
    {
      id: 0,
      tabLabel: "Tier 0",
      title: "OEM — Final Assembly",
      avgEmissions: "~4 tCO₂e / vehicle (direct)",
      supplierCount: `${t1.length} tier-1 in register · 500+ global`,
      ghgProtocol: "Scope 1 + 2 + 3 reporter",
      dataSource: "Internal MES / ERP systems",
      riskChips: ["Reporting Owner"],
      keyEntities: ["Final Assembly Plant", "Quality Control", "Vehicle Testing", "Dispatch & Logistics Hub"],
      calculationMethod: "Direct measurement",
      emissionRows: [
        { id: "o1", label: "Welding & stamping lines", valuePerVehicle: 1.2, barPct: 30, trend: "reducing" },
        { id: "o2", label: "Paint shop (VOC + energy)", valuePerVehicle: 1.8, barPct: 45, trend: "reducing" },
        { id: "o3", label: "General assembly", valuePerVehicle: 0.6, barPct: 15, trend: "stable" },
        { id: "o4", label: "Testing & QA", valuePerVehicle: 0.4, barPct: 10, trend: "reducing" },
      ],
    },
    {
      id: 1,
      tabLabel: "Tier 1",
      title: "Tier 1 — Direct suppliers",
      avgEmissions: `${avgIntensity(t1).toFixed(1)} tCO₂e intensity (supplier avg)`,
      supplierCount: `${t1.length} suppliers · ${formatKt(data.tierBreakdown.find((t) => t.tier === 1)?.tCO2e ?? 0)} tracked`,
      ghgProtocol: "Cat 1 purchased goods & PCF",
      dataSource: "Supplier PCF / spend-based",
      riskChips: t1.filter((s) => s.riskLevel === "High").length
        ? [`${t1.filter((s) => s.riskLevel === "High").length} high risk`]
        : ["Engagement wave active"],
      keyEntities: [...new Set(t1.flatMap((s) => s.components))].slice(0, 5),
      calculationMethod: "PCF primary + industry EFs",
      emissionRows: tier1Breakdown(t1),
    },
    {
      id: 2,
      tabLabel: "Tier 2",
      title: "Tier 2 — Sub-component suppliers",
      avgEmissions: `${avgIntensity(t2).toFixed(1)} tCO₂e intensity (supplier avg)`,
      supplierCount: `${t2.length} suppliers · ${formatKt(data.tierBreakdown.find((t) => t.tier === 2)?.tCO2e ?? 0)} tracked`,
      ghgProtocol: "Allocated Cat 1 — tier-2 mapping",
      dataSource: "Supplier surveys + proxies",
      riskChips: ["62% tier-2 coverage", "Proxy-heavy"],
      keyEntities: ["Cathode active material", "Cell housing", "Power electronics", "Steel forgings"],
      calculationMethod: "Hybrid PCF + spend proxy",
      emissionRows: [
        { id: "t2-1", label: "Battery materials (cathode/anode)", valuePerVehicle: 3.2, barPct: 38, trend: "reducing" },
        { id: "t2-2", label: "Semiconductor & PCB supply", valuePerVehicle: 1.4, barPct: 22, trend: "increasing" },
        { id: "t2-3", label: "Aluminium & specialty alloys", valuePerVehicle: 1.1, barPct: 18, trend: "stable" },
        { id: "t2-4", label: "Rubber & polymer compounds", valuePerVehicle: 0.8, barPct: 14, trend: "reducing" },
      ],
    },
    {
      id: 3,
      tabLabel: "Tier 3+",
      title: "Tier 3+ — Raw materials & mining",
      avgEmissions: `${avgIntensity(t3).toFixed(1)} tCO₂e intensity (supplier avg)`,
      supplierCount: `${t3.length} mapped · ${formatKt(data.tierBreakdown.find((t) => t.tier === 3)?.tCO2e ?? 0)} tracked`,
      ghgProtocol: "Upstream of tier-2 — LCA libraries",
      dataSource: "Industry databases (ecoinvent, GaBi)",
      riskChips: ["Deforestation risk", "Grid mix exposure"],
      keyEntities: ["Lithium extraction", "Nickel refining", "Rare-earth processing", "Synthetic rubber"],
      calculationMethod: "Industry average + regional grid",
      emissionRows: [
        { id: "t3-1", label: "Lithium & nickel refining", valuePerVehicle: 2.4, barPct: 40, trend: "stable" },
        { id: "t3-2", label: "Steel & aluminium smelting", valuePerVehicle: 1.5, barPct: 28, trend: "reducing" },
        { id: "t3-3", label: "Petrochemical feedstocks", valuePerVehicle: 0.9, barPct: 18, trend: "stable" },
        { id: "t3-4", label: "Logistics to tier-2 hub", valuePerVehicle: 0.5, barPct: 14, trend: "reducing" },
      ],
    },
  ];
}

function formatKt(tCO2e: number): string {
  if (tCO2e >= 1_000_000) return `${(tCO2e / 1_000_000).toFixed(2)} Mt`;
  return `${(tCO2e / 1_000).toFixed(0)} kt`;
}

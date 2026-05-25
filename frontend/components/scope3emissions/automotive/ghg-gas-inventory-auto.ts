import type {
  AutoGhgGasByCode,
  AutoGhgGasCode,
  GhgGasCategorySliceAuto,
  GhgGasInventoryAuto,
  GhgGasNarrativeInsightAuto,
  GhgGasSpeciesRollupAuto,
  GhgGasSupplierSliceAuto,
  GhgTrackingCategoryRowMock,
} from "./ghg-tracking-types";
import { MOCK_SUPPLIERS } from "./mockData-suppliers";

const GAS_ORDER: AutoGhgGasCode[] = ["CO2", "CH4", "N2O", "HFCS", "OTHER"];

function gasWeightsForCategory(category: string): AutoGhgGasByCode {
  const c = category.toLowerCase();
  if (c.includes("cat 11") || c.includes("use of sold")) return { CO2: 0.965, CH4: 0.012, N2O: 0.018, HFCS: 0.003, OTHER: 0.002 };
  if (c.includes("cat 4") || c.includes("cat 9") || c.includes("transport")) return { CO2: 0.862, CH4: 0.088, N2O: 0.028, HFCS: 0.017, OTHER: 0.005 };
  if (c.includes("cat 5") || c.includes("waste")) return { CO2: 0.78, CH4: 0.145, N2O: 0.045, HFCS: 0.02, OTHER: 0.01 };
  if (c.includes("cat 1") || c.includes("purchased")) return { CO2: 0.948, CH4: 0.025, N2O: 0.018, HFCS: 0.006, OTHER: 0.003 };
  if (c.includes("cat 12") || c.includes("end-of-life")) return { CO2: 0.9, CH4: 0.055, N2O: 0.03, HFCS: 0.008, OTHER: 0.007 };
  return { CO2: 0.942, CH4: 0.028, N2O: 0.022, HFCS: 0.005, OTHER: 0.003 };
}

function allocateGas(total: number, w: AutoGhgGasByCode): AutoGhgGasByCode {
  const parts = GAS_ORDER.map((g) => total * w[g]);
  const rounded = parts.map((p) => Math.round(p));
  const diff = Math.round(total) - rounded.reduce((a, b) => a + b, 0);
  rounded[0] = (rounded[0] ?? 0) + diff;
  return {
    CO2: rounded[0]!,
    CH4: rounded[1]!,
    N2O: rounded[2]!,
    HFCS: rounded[3]!,
    OTHER: rounded[4]!,
  };
}

const TOP_SUPPLIER_INPUT: { id: string; name: string; category: string; tCO2e: number }[] = [
  ...MOCK_SUPPLIERS.filter((s) => s.tier === 1)
    .sort((a, b) => b.tCO2e - a.tCO2e)
    .slice(0, 5)
    .map((s) => ({ id: s.id, name: s.name, category: "Cat 1", tCO2e: s.tCO2e })),
  {
    id: "cat4-inbound",
    name: "Inbound logistics (allocated)",
    category: "Cat 4",
    tCO2e: 72_000,
  },
];

const NARRATIVE_INSIGHTS: GhgGasNarrativeInsightAuto[] = [
  {
    id: "aghg-n1",
    headline: "Use phase (Cat 11) is CO₂-dominant with grid-mix sensitivity",
    body: "BEV and ICE use-phase models concentrate fossil CO₂ from fuel and electricity. Read together with Cat 11 assumptions and the EV mix insight in the AI queue.",
    gasCodes: ["CO2"],
    relatedCategoryNames: ["Cat 11: Use of sold products"],
    relatedInsightIds: ["if1", "if4"],
  },
  {
    id: "aghg-n2",
    headline: "Inbound logistics elevate CH₄ / N₂O in upstream transport",
    body: "Categories 4 and 9 apply combustion and cold-chain factors where short-lived forcers appear in the illustrative split — ties to air-freight spike narrative.",
    gasCodes: ["CH4", "N2O", "CO2"],
    relatedCategoryNames: ["Cat 4: Upstream transportation", "Cat 9: Downstream transportation"],
    relatedInsightIds: ["if3"],
  },
  {
    id: "aghg-n3",
    headline: "Purchased goods carry refrigerant / process HFCs in proxy tiers",
    body: "Where supplier PCFs are incomplete, blended product categories inflate HFCs and OTHER in the demo profile — consistent with Tier-1 PCF coverage gaps.",
    gasCodes: ["HFCS", "OTHER", "CO2"],
    relatedCategoryNames: ["Cat 1: Purchased goods & services"],
    relatedInsightIds: ["if2"],
  },
  {
    id: "aghg-n4",
    headline: "Waste and end-of-life routes lift CH₄ share",
    body: "Categories 5 and 12 apply landfill and treatment pathways where methane dominates the CO₂e stack in the species view.",
    gasCodes: ["CH4", "CO2"],
    relatedCategoryNames: ["Cat 5: Waste", "Cat 12: End-of-life"],
    relatedInsightIds: [],
  },
];

export function buildAutoGhgGasInventory(
  tracker: GhgTrackingCategoryRowMock[],
  executiveTotal: number,
): GhgGasInventoryAuto {
  const categorySlices: GhgGasCategorySliceAuto[] = tracker.map((r) => ({
    category: r.category,
    tCO2eByGas: allocateGas(r.scope3TCO2e, gasWeightsForCategory(r.category)),
  }));

  const speciesTotals: AutoGhgGasByCode = { CO2: 0, CH4: 0, N2O: 0, HFCS: 0, OTHER: 0 };
  for (const row of categorySlices) {
    for (const g of GAS_ORDER) speciesTotals[g] += row.tCO2eByGas[g];
  }

  const sliceTotal = tracker.reduce((a, r) => a + r.scope3TCO2e, 0);
  const invTotal = sliceTotal > 0 ? sliceTotal : executiveTotal;

  const speciesRollup: GhgGasSpeciesRollupAuto[] = [
    {
      code: "CO2",
      label: "Carbon dioxide (fossil & biogenic CO₂ reported as CO₂e)",
      formula: "CO₂",
      tCO2e: speciesTotals.CO2,
      pctOfScope3: (speciesTotals.CO2 / invTotal) * 100,
      ar5Note: "AR5 100-yr GWP = 1 by definition for CO₂.",
    },
    {
      code: "CH4",
      label: "Methane",
      formula: "CH₄",
      tCO2e: speciesTotals.CH4,
      pctOfScope3: (speciesTotals.CH4 / invTotal) * 100,
      ar5Note: "AR5 GWP₁₀₀ = 28 (non-fossil sources per inventory policy).",
    },
    {
      code: "N2O",
      label: "Nitrous oxide",
      formula: "N₂O",
      tCO2e: speciesTotals.N2O,
      pctOfScope3: (speciesTotals.N2O / invTotal) * 100,
      ar5Note: "AR5 GWP₁₀₀ = 265.",
    },
    {
      code: "HFCS",
      label: "Hydrofluorocarbons (HFC basket)",
      formula: "HFCs",
      tCO2e: speciesTotals.HFCS,
      pctOfScope3: (speciesTotals.HFCS / invTotal) * 100,
      ar5Note: "HFCs reported as CO₂e using AR5 GWPs per compound class.",
    },
    {
      code: "OTHER",
      label: "Other / unspecified (SF₆, PFCs, blended)",
      formula: "Other",
      tCO2e: speciesTotals.OTHER,
      pctOfScope3: (speciesTotals.OTHER / invTotal) * 100,
      ar5Note: "Residual basket for long-lived and blended sources in proxy models.",
    },
  ];

  const supplierSlices: GhgGasSupplierSliceAuto[] = TOP_SUPPLIER_INPUT.map((s) => ({
    supplierId: s.id,
    supplierName: s.name,
    category: s.category,
    tCO2eByGas: allocateGas(s.tCO2e, gasWeightsForCategory(s.category)),
  }));

  return {
    methodologyVersion: "GHG Protocol Corporate Value Chain — FY25 inventory close (mock)",
    gwpStandardLabel: "AR5 100-yr GWP (IPCC AR5)",
    boundaryNote:
      "Species splits are illustrative shares applied to category and supplier attributed tCO₂e for UX validation — not filing-grade inventory. They reconcile to the same category totals as the tracker and the executive Scope 3 headline.",
    executiveScope3TCO2e: executiveTotal,
    speciesRollup,
    categorySlices,
    supplierSlices,
    narrativeInsights: NARRATIVE_INSIGHTS,
  };
}

import type { GhgGasCode, GhgGasInventoryBlock, GhgGasNarrativeInsight, Scope3MockData } from "./types";

type GhgInventorySource = Pick<Scope3MockData, "scope3Categories" | "executive" | "suppliers">;

const GAS_ORDER: GhgGasCode[] = ["CO2", "CH4", "N2O", "HFCS", "OTHER"];

function gasWeightsForCategory(categoryId: number): Record<GhgGasCode, number> {
  if (categoryId === 4 || categoryId === 9) {
    return { CO2: 0.862, CH4: 0.088, N2O: 0.028, HFCS: 0.017, OTHER: 0.005 };
  }
  if (categoryId === 5) {
    return { CO2: 0.78, CH4: 0.145, N2O: 0.045, HFCS: 0.02, OTHER: 0.01 };
  }
  if (categoryId === 3) {
    return { CO2: 0.895, CH4: 0.055, N2O: 0.038, HFCS: 0.009, OTHER: 0.003 };
  }
  if (categoryId === 11) {
    return { CO2: 0.965, CH4: 0.012, N2O: 0.018, HFCS: 0.003, OTHER: 0.002 };
  }
  if (categoryId === 1 || categoryId === 2) {
    return { CO2: 0.948, CH4: 0.025, N2O: 0.018, HFCS: 0.006, OTHER: 0.003 };
  }
  return { CO2: 0.942, CH4: 0.028, N2O: 0.022, HFCS: 0.005, OTHER: 0.003 };
}

function allocateGas(total: number, w: Record<GhgGasCode, number>): Record<GhgGasCode, number> {
  const parts = GAS_ORDER.map((c) => total * w[c]);
  const rounded = parts.map((p) => Math.round(p));
  const diff = Math.round(total) - rounded.reduce((a, b) => a + b, 0);
  rounded[0] += diff;
  return {
    CO2: rounded[0]!,
    CH4: rounded[1]!,
    N2O: rounded[2]!,
    HFCS: rounded[3]!,
    OTHER: rounded[4]!,
  };
}

const NARRATIVE_INSIGHTS: GhgGasNarrativeInsight[] = [
  {
    id: "ghg-n1",
    headline: "Logistics and cold chain lift short-lived climate forcers",
    body: "Upstream and downstream transport (Categories 4 and 9) concentrate combustion CH₄ / N₂O and HFC leakage from temperature-controlled assets. This ties directly to the GLEC transport backlog and reefer consolidation signals in the AI queue.",
    gasCodes: ["CH4", "N2O", "HFCS"],
    relatedInsightIds: ["ai-2", "ai-4", "ai-8"],
    scope3CategoryIds: [4, 9],
  },
  {
    id: "ghg-n2",
    headline: "Waste routes explain elevated CH₄ in upstream Scope 3",
    body: "Category 5 applies landfill and biological treatment pathways where CH₄ dominates the CO₂e stack. Assurance should cross-read manifests in Submitted Evidences with the Category 5 control narrative.",
    gasCodes: ["CH4", "CO2"],
    relatedInsightIds: ["ai-6"],
    scope3CategoryIds: [5, 1],
  },
  {
    id: "ghg-n3",
    headline: "Use-phase inventory is CO₂-heavy with wide uncertainty",
    body: "Category 11 is almost entirely fossil CO₂ from energy in the use phase; the gas view should be read together with the Category 11 uncertainty insight — sensitivity drives disclosure, not a change in species mix.",
    gasCodes: ["CO2"],
    relatedInsightIds: ["ai-3"],
    scope3CategoryIds: [11],
  },
  {
    id: "ghg-n4",
    headline: "Business travel shows up as CO₂ with policy-driven anomalies",
    body: "Category 6 is aviation and surface travel — overwhelmingly CO₂ on AR5 100-yr GWP. The travel spike insight is a volume / class-mix story that remains coherent when decomposed by gas.",
    gasCodes: ["CO2"],
    relatedInsightIds: ["ai-5"],
    scope3CategoryIds: [6],
  },
];

/**
 * Builds a gas-by-species inventory that reconciles to each Scope 3 category line and the executive total,
 * then materialises top-supplier slices using the same company-level species shares (demo consistency).
 */
export function buildGhgGasInventory(data: GhgInventorySource): GhgGasInventoryBlock {
  const categorySlices = data.scope3Categories.map((c) => ({
    scope3CategoryId: c.id,
    tCO2eByGas: allocateGas(c.tCO2e, gasWeightsForCategory(c.id)),
  }));

  const speciesTotals: Record<GhgGasCode, number> = {
    CO2: 0,
    CH4: 0,
    N2O: 0,
    HFCS: 0,
    OTHER: 0,
  };
  for (const row of categorySlices) {
    for (const g of GAS_ORDER) {
      speciesTotals[g] += row.tCO2eByGas[g];
    }
  }

  const categoryGrandTotal = data.scope3Categories.reduce((a, c) => a + c.tCO2e, 0);
  /** Species splits are built from category rows; denominator matches that roll-up (may differ from headline executive KPI if the workbook is mid-reconciliation). */
  const invTotal = categoryGrandTotal > 0 ? categoryGrandTotal : data.executive.totalScope3TCO2e;
  const speciesRollup = [
    {
      code: "CO2" as const,
      label: "Carbon dioxide (fossil & biogenic CO₂ reported as CO₂e)",
      formula: "CO₂",
      tCO2e: speciesTotals.CO2,
      pctOfScope3: (speciesTotals.CO2 / invTotal) * 100,
      ar5Note: "AR5 100-yr GWP = 1 by definition for CO₂.",
    },
    {
      code: "CH4" as const,
      label: "Methane",
      formula: "CH₄",
      tCO2e: speciesTotals.CH4,
      pctOfScope3: (speciesTotals.CH4 / invTotal) * 100,
      ar5Note: "AR5 GWP₁₀₀ = 28 (non-fossil sources per inventory policy).",
    },
    {
      code: "N2O" as const,
      label: "Nitrous oxide",
      formula: "N₂O",
      tCO2e: speciesTotals.N2O,
      pctOfScope3: (speciesTotals.N2O / invTotal) * 100,
      ar5Note: "AR5 GWP₁₀₀ = 265.",
    },
    {
      code: "HFCS" as const,
      label: "HFC refrigerants (aggregated)",
      formula: "HFCs",
      tCO2e: speciesTotals.HFCS,
      pctOfScope3: (speciesTotals.HFCS / invTotal) * 100,
      ar5Note: "Blended HFC basket GWP from cold-chain asset register (illustrative).",
    },
    {
      code: "OTHER" as const,
      label: "PFCs, SF₆, NF₃ & unspecified high-GWP traces",
      formula: "Other",
      tCO2e: speciesTotals.OTHER,
      pctOfScope3: (speciesTotals.OTHER / invTotal) * 100,
      ar5Note: "Process and electronics supply-chain traces below materiality for separate disclosure.",
    },
  ];

  const supplierSlices = [...data.suppliers]
    .sort((a, b) => b.scope3ContributionTCO2e - a.scope3ContributionTCO2e || a.name.localeCompare(b.name))
    .slice(0, 10)
    .map((s) => {
      const w = allocateGas(s.scope3ContributionTCO2e, {
        CO2: speciesTotals.CO2 / invTotal,
        CH4: speciesTotals.CH4 / invTotal,
        N2O: speciesTotals.N2O / invTotal,
        HFCS: speciesTotals.HFCS / invTotal,
        OTHER: speciesTotals.OTHER / invTotal,
      });
      return { supplierId: s.id, tCO2eByGas: w };
    });

  return {
    gwpStandardLabel: "IPCC AR5 (100-year)",
    boundaryNote:
      "Species allocation is illustrative — proportional splits by Scope 3 category archetype (transport, waste, energy, use phase) until metered refrigerant logs and supplier gas-level disclosures are fully integrated.",
    speciesRollup,
    categorySlices,
    supplierSlices,
    narrativeInsights: NARRATIVE_INSIGHTS,
  };
}

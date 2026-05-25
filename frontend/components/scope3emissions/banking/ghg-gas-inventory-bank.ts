import type {
  BankGhgGasByCode,
  BankGhgGasCode,
  GhgGasBorrowerSliceBank,
  GhgGasInventoryBank,
  GhgGasNarrativeInsightBank,
  GhgGasSectorSliceBank,
  GhgGasSpeciesRollupBank,
  GhgTrackingSectorRowMock,
} from "./types";

const GAS_ORDER: BankGhgGasCode[] = ["CO2", "CH4", "N2O", "HFCS", "OTHER"];

/** Illustrative species shares by financed sector (CO₂e basis). */
function gasWeightsForBankSector(sector: string): BankGhgGasByCode {
  const s = sector.toLowerCase();
  if (s.includes("power")) return { CO2: 0.93, CH4: 0.025, N2O: 0.015, HFCS: 0.01, OTHER: 0.02 };
  if (s.includes("steel")) return { CO2: 0.91, CH4: 0.035, N2O: 0.02, HFCS: 0.008, OTHER: 0.027 };
  if (s.includes("aviation") || s.includes("shipping")) return { CO2: 0.965, CH4: 0.018, N2O: 0.012, HFCS: 0.002, OTHER: 0.003 };
  if (s.includes("cement")) return { CO2: 0.94, CH4: 0.02, N2O: 0.028, HFCS: 0.003, OTHER: 0.009 };
  if (s.includes("chemical")) return { CO2: 0.885, CH4: 0.055, N2O: 0.035, HFCS: 0.015, OTHER: 0.01 };
  if (s.includes("real estate") || s.includes("construction")) return { CO2: 0.9, CH4: 0.04, N2O: 0.025, HFCS: 0.02, OTHER: 0.015 };
  if (s.includes("automotive")) return { CO2: 0.92, CH4: 0.03, N2O: 0.022, HFCS: 0.018, OTHER: 0.01 };
  if (s.includes("agri")) return { CO2: 0.82, CH4: 0.1, N2O: 0.055, HFCS: 0.008, OTHER: 0.017 };
  if (s.includes("data center") || s.includes("it &")) return { CO2: 0.93, CH4: 0.012, N2O: 0.018, HFCS: 0.035, OTHER: 0.005 };
  if (s.includes("msme")) return { CO2: 0.88, CH4: 0.045, N2O: 0.03, HFCS: 0.025, OTHER: 0.02 };
  if (s.includes("textile")) return { CO2: 0.86, CH4: 0.055, N2O: 0.03, HFCS: 0.02, OTHER: 0.035 };
  return { CO2: 0.9, CH4: 0.04, N2O: 0.03, HFCS: 0.015, OTHER: 0.015 };
}

function allocateGasBank(total: number, w: BankGhgGasByCode): BankGhgGasByCode {
  const parts = GAS_ORDER.map((c) => total * w[c]);
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

const TOP_BORROWER_INPUT: { id: string; name: string; sector: string; attributedTCO2e: number }[] = [
  { id: "b2", name: "ReliPower Ltd", sector: "Power Generation", attributedTCO2e: 2200000 },
  { id: "b6", name: "Eastern Grid Power", sector: "Power Generation", attributedTCO2e: 1650000 },
  { id: "b1", name: "IndoSteel Corp", sector: "Steel & Metals", attributedTCO2e: 1580000 },
  { id: "b5", name: "ChemNova Petrochem", sector: "Chemicals & Petrochemicals", attributedTCO2e: 1020000 },
  { id: "b4", name: "SkyWings Airlines", sector: "Aviation", attributedTCO2e: 980000 },
  { id: "b3", name: "Konkan Cement Works", sector: "Cement", attributedTCO2e: 810000 },
  { id: "b17", name: "Listed OilCo Holdings", sector: "Chemicals & Petrochemicals", attributedTCO2e: 890000 },
  { id: "b19", name: "Highland Cement", sector: "Cement", attributedTCO2e: 640000 },
  { id: "b8", name: "NCR Realty Developers", sector: "Real Estate & Construction", attributedTCO2e: 540000 },
  { id: "b20", name: "MetroChem Specialties", sector: "Chemicals & Petrochemicals", attributedTCO2e: 560000 },
];

const NARRATIVE_INSIGHTS: GhgGasNarrativeInsightBank[] = [
  {
    id: "bghg-n1",
    headline: "Power & steel financed stacks are CO₂-dominant with CH₄ from coal value chains",
    body: "Thermal generation and BF-BOF steel carry very high fossil CO₂ on an attributed basis; residual CH₄ reflects mine-to-plant boundary choices in borrower inventories. Matches high WACI sectors in Sectors / Financed views — use PCAF Option 2/3 uplift programmes to narrow uncertainty.",
    gasCodes: ["CO2", "CH4"],
    relatedSectorNames: ["Power Generation", "Steel & Metals"],
    relatedInsightIds: ["ai1", "ai11"],
  },
  {
    id: "bghg-n2",
    headline: "Aviation & shipping remain CO₂-heavy with policy-linked N₂O sensitivity",
    body: "Jet-A1 and HFO combustion dominate; N₂O share is small but material for long-haul NOₓ chemistry in some factor sets. Aligns to transition technology narratives in Climate risk and NZBA pathway stress.",
    gasCodes: ["CO2", "N2O"],
    relatedSectorNames: ["Aviation", "Shipping"],
    relatedInsightIds: ["ai3", "ai7"],
  },
  {
    id: "bghg-n3",
    headline: "MSME & diversified sleeves elevate HFCs / “other” on proxy-heavy books",
    body: "Where revenue proxies dominate (MSME, parts of real estate), refrigerant and blended product categories inflate HFCs and OTHER in the illustrative split — consistent with weaker PCAF scores in those sleeves.",
    gasCodes: ["HFCS", "OTHER", "CO2"],
    relatedSectorNames: ["MSME Diversified", "Real Estate & Construction"],
    relatedInsightIds: ["ai2", "ai6"],
  },
  {
    id: "bghg-n4",
    headline: "Agribusiness shows higher short-lived forcer share in the demo profile",
    body: "Processing and logistics plus residue pathways lift CH₄ / N₂O relative to manufacturing sectors; use this view with physical risk overlays for district-level burn and flood bands.",
    gasCodes: ["CH4", "N2O", "CO2"],
    relatedSectorNames: ["Agribusiness"],
    relatedInsightIds: ["ai6"],
  },
];

/**
 * Builds a bank-sector GHG species inventory: sector slices sum to financed Category 15,
 * obligor slices mirror top attributed borrowers, narratives link to AI queue ids.
 */
export function buildBankGhgGasInventory(tracker: GhgTrackingSectorRowMock[]): GhgGasInventoryBank {
  const sectorSlices: GhgGasSectorSliceBank[] = tracker.map((r) => ({
    sector: r.sector,
    tCO2eByGas: allocateGasBank(r.scope3FinancedTCO2e, gasWeightsForBankSector(r.sector)),
  }));

  const speciesTotals: BankGhgGasByCode = { CO2: 0, CH4: 0, N2O: 0, HFCS: 0, OTHER: 0 };
  for (const row of sectorSlices) {
    for (const g of GAS_ORDER) {
      speciesTotals[g] += row.tCO2eByGas[g];
    }
  }

  const categoryGrandTotal = tracker.reduce((a, r) => a + r.scope3FinancedTCO2e, 0);
  const invTotal = categoryGrandTotal > 0 ? categoryGrandTotal : 417360000;
  const executiveFinancedScope3TCO2e = 417360000;

  const speciesRollup: GhgGasSpeciesRollupBank[] = [
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

  const borrowerSlices: GhgGasBorrowerSliceBank[] = TOP_BORROWER_INPUT.map((b) => ({
    borrowerId: b.id,
    borrowerName: b.name,
    sector: b.sector,
    tCO2eByGas: allocateGasBank(b.attributedTCO2e, gasWeightsForBankSector(b.sector)),
  }));

  return {
    methodologyVersion: "PCAF FI v2 — financed emissions (Category 15) FY24–25 mock close",
    gwpStandardLabel: "AR5 100-yr GWP (IPCC AR5)",
    boundaryNote:
      "Species splits are illustrative shares applied to sector and obligor attributed tCO₂e for UX validation — not filing-grade inventory. They reconcile to the same sector totals as Sectors / GHG sector tracker and the executive financed Scope 3 headline.",
    executiveFinancedScope3TCO2e,
    speciesRollup,
    sectorSlices,
    borrowerSlices,
    narrativeInsights: NARRATIVE_INSIGHTS,
  };
}

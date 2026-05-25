import type { GhgTrackingMockData, GhgTrackingSectorRowMock } from "./types";
import { buildBankGhgGasInventory } from "./ghg-gas-inventory-bank";

const _GHG_SECTOR_TRACKER: GhgTrackingSectorRowMock[] = [
  { sector: "Power Generation", scope3FinancedTCO2e: 159767821, exposureINRCr: 42800, pctOfTotalScope3: 38.3, yoyPct: 1.4, pathwayTag: "Off track" },
  { sector: "Steel & Metals", scope3FinancedTCO2e: 98548375, exposureINRCr: 31200, pctOfTotalScope3: 23.6, yoyPct: 0.9, pathwayTag: "Off track" },
  { sector: "Real Estate & Construction", scope3FinancedTCO2e: 24637094, exposureINRCr: 28600, pctOfTotalScope3: 5.9, yoyPct: 2.8, pathwayTag: "No data" },
  { sector: "Automotive", scope3FinancedTCO2e: 15120268, exposureINRCr: 19400, pctOfTotalScope3: 3.6, yoyPct: -1.2, pathwayTag: "On track" },
  { sector: "Chemicals & Petrochemicals", scope3FinancedTCO2e: 22052783, exposureINRCr: 16800, pctOfTotalScope3: 5.3, yoyPct: 0.4, pathwayTag: "Off track" },
  { sector: "Aviation", scope3FinancedTCO2e: 35318911, exposureINRCr: 8200, pctOfTotalScope3: 8.5, yoyPct: 3.1, pathwayTag: "Off track" },
  { sector: "Shipping", scope3FinancedTCO2e: 10854104, exposureINRCr: 5400, pctOfTotalScope3: 2.6, yoyPct: 0.1, pathwayTag: "No data" },
  { sector: "Agribusiness", scope3FinancedTCO2e: 8269794, exposureINRCr: 22400, pctOfTotalScope3: 2.0, yoyPct: -0.5, pathwayTag: "On track" },
  { sector: "Cement", scope3FinancedTCO2e: 22512216, exposureINRCr: 9800, pctOfTotalScope3: 5.4, yoyPct: -0.6, pathwayTag: "Off track" },
  { sector: "IT & Data Centers", scope3FinancedTCO2e: 6719207, exposureINRCr: 12600, pctOfTotalScope3: 1.6, yoyPct: -2.1, pathwayTag: "On track" },
  { sector: "MSME Diversified", scope3FinancedTCO2e: 7443225, exposureINRCr: 38200, pctOfTotalScope3: 1.8, yoyPct: 0.2, pathwayTag: "No data" },
  { sector: "Textile & Apparel", scope3FinancedTCO2e: 6116202, exposureINRCr: 14200, pctOfTotalScope3: 1.5, yoyPct: -1.0, pathwayTag: "On track" },
];

/**
 * FY24–25 GHG tracking slice — **aligned to `bankScope3MockData`**:
 * - `sectorTracker` / `sectorDetails` totals match `sectors[].attributedTCO2e` and sum to `executive.totalFinancedEmissionsTCO2e` (417.36 Mt).
 * - KPIs echo `executive` / `company` PCAF and WACI where labelled.
 * - `gasInventory` mirrors pharma GHG gases: species rollup + sector & obligor slices on the same totals.
 */
export const ghgTrackingMockData: GhgTrackingMockData = {
  kpis: [
    {
      id: "k1",
      label: "Total financed Scope 3 (Category 15)",
      value: "417.4 Mt",
      hint: "Same roll-up as Dashboard & Financed emissions — PCAF v2 boundary",
      trendPct: 2.1,
      tone: "negative",
    },
    {
      id: "k2",
      label: "Portfolio WACI (Scope 3 financed)",
      value: "673 tCO₂e / ₹ cr",
      hint: "Matches executive summary intensity (exposure-weighted)",
      trendPct: -0.8,
      tone: "positive",
    },
    {
      id: "k3",
      label: "PCAF weighted score",
      value: "3.42",
      hint: "Same as header chip & Controls — 1 = best data quality",
      trendPct: -3.2,
      tone: "positive",
    },
    {
      id: "k4",
      label: "PCAF data coverage (loan book)",
      value: "58.2%",
      hint: "Matches Financed / Executive — borrowers with emissions data or approved proxy",
      trendPct: 4.6,
      tone: "positive",
    },
    {
      id: "k5",
      label: "Sectors with verified / audited MRV",
      value: "4 / 12",
      hint: "On-track sectors with CDP / IE / metered file in FY24–25 mock close",
      trendPct: undefined,
      tone: "neutral",
    },
    {
      id: "k6",
      label: "NZBA intensity gap vs pathway",
      value: "6.2% p.a. reduction",
      hint: "Same narrative as executive NZBA gap — power, steel, aviation sleeves",
      trendPct: undefined,
      tone: "neutral",
    },
  ],
  sectorTracker: _GHG_SECTOR_TRACKER,
  sectorDetails: [
    {
      sector: "Power Generation",
      narrative:
        "Coal-heavy generation and merchant plants dominate financed emissions. PCAF Option 1 attribution uses borrower-reported Scope 1+2 with economic share for listed sleeves — **same 159.8 Mt total as Sectors & Financed views** (all instruments, not wholesale-only).",
      totalFinancedTCO2e: 159767821,
      topSources: [
        { label: "Coal / super-critical thermal", pct: 52, tCO2e: 83079267 },
        { label: "Gas CCGT", pct: 22, tCO2e: 35148921 },
        { label: "Renewables (grid-connected)", pct: 18, tCO2e: 28758208 },
        { label: "T&D losses & auxiliary", pct: 8, tCO2e: 12781426 },
      ],
      mrvStatus: "Mixed — 62% audited CDP on flagged relationships; remainder revenue proxy pending FY25 refresh.",
      nextActions: ["Tighten covenant reporting on plant load factors", "Roll out I-REC verification for top 10 borrowers", "Align EF vintage with RBI climate stress test cycle"],
    },
    {
      sector: "Steel & Metals",
      narrative: "BF-BOF routes drive intensity; electric arc share growing on subset of borrowers with verified capex plans.",
      totalFinancedTCO2e: 98548375,
      topSources: [
        { label: "BF-BOF integrated", pct: 61, tCO2e: 60114509 },
        { label: "Pellet & DRI", pct: 24, tCO2e: 23651610 },
        { label: "Downstream rolling", pct: 15, tCO2e: 14782256 },
      ],
      mrvStatus: "Strong for top 8 accounts; SME cluster still on spend-based proxy.",
      nextActions: ["Sectoral decarb engagement pack", "Link SLL KPIs to scrap-EAF share where feasible"],
    },
    {
      sector: "Aviation",
      narrative: "Attributed emissions reflect RPK-based factors for passenger carriers and fuel uplift for cargo.",
      totalFinancedTCO2e: 35318911,
      topSources: [
        { label: "Jet-A1 combustion (domestic)", pct: 72, tCO2e: 25429616 },
        { label: "SAF blend (verified)", pct: 8, tCO2e: 2825513 },
        { label: "Ground operations", pct: 20, tCO2e: 7063782 },
      ],
      mrvStatus: "DEFRA 2024 factors; SAF mass-balance letters for 3 carriers.",
      nextActions: ["Capture CORSIA phase-in for international routes", "Refresh intensity for fleet renewal tranche"],
    },
    {
      sector: "Cement",
      narrative: "Process emissions from clinker dominate; WHR and alternative fuels partially reflected where disclosed.",
      totalFinancedTCO2e: 22512216,
      topSources: [
        { label: "Clinker process CO₂", pct: 55, tCO2e: 12381719 },
        { label: "Fuel combustion", pct: 28, tCO2e: 6303420 },
        { label: "Electricity (grid)", pct: 17, tCO2e: 3827077 },
      ],
      mrvStatus: "Good for integrated plants; grinding-only units on proxy.",
      nextActions: ["Map WHR capex to PCAF Option 3 where operational", "IEA cement benchmark tie-out quarterly"],
    },
    {
      sector: "Chemicals & Petrochemicals",
      narrative: "Steam crackers and aromatics complexes carry highest intensity; specialty batch lower.",
      totalFinancedTCO2e: 22052783,
      topSources: [
        { label: "Olefin / steam cracking", pct: 44, tCO2e: 9703225 },
        { label: "Aromatics & derivatives", pct: 31, tCO2e: 6836363 },
        { label: "Specialty & agchem", pct: 25, tCO2e: 5513196 },
      ],
      mrvStatus: "Moderate — 48% primary energy balance data.",
      nextActions: ["Prioritise EF update for naphtha slate", "Cross-check with EU CBAM where exports exist"],
    },
    {
      sector: "Real Estate & Construction",
      narrative: "Built-environment factors by energy label and floor area; retail mortgage pool blended.",
      totalFinancedTCO2e: 24637094,
      topSources: [
        { label: "Operational energy (buildings)", pct: 46, tCO2e: 11333063 },
        { label: "Embodied carbon (construction phase)", pct: 34, tCO2e: 8376612 },
        { label: "Tenant / common area", pct: 20, tCO2e: 4927419 },
      ],
      mrvStatus: "Weak label coverage in Tier-2 cities — patchy BEE data.",
      nextActions: ["Mandate ECBC label upload for new sanctions", "Pilot satellite-based cooling degree-day proxy"],
    },
    {
      sector: "Automotive",
      narrative: "ICE fleet still majority; EV share rising on identified OEM and NBFC co-lends.",
      totalFinancedTCO2e: 15120268,
      topSources: [
        { label: "ICE passenger & LCV", pct: 68, tCO2e: 10281782 },
        { label: "EV (tailpipe zero, grid mix)", pct: 22, tCO2e: 3326459 },
        { label: "Commercial vehicle diesel", pct: 10, tCO2e: 1512027 },
      ],
      mrvStatus: "Telematics pilot on 12% of vehicle book.",
      nextActions: ["Expand OEM-specific emission curves", "Track grid emission factor regionalisation"],
    },
    {
      sector: "Agribusiness",
      narrative: "Low intensity per rupee; seasonal biomass burn risk flagged for select geographies.",
      totalFinancedTCO2e: 8269794,
      topSources: [
        { label: "Processing energy", pct: 42, tCO2e: 3473313 },
        { label: "Logistics cold chain", pct: 28, tCO2e: 2315542 },
        { label: "Fertiliser-linked (scope 3 ref.)", pct: 30, tCO2e: 2480938 },
      ],
      mrvStatus: "Revenue-based proxy uplift planned FY26.",
      nextActions: ["Add district-level residue burning hazard overlay"],
    },
    {
      sector: "IT & Data Centers",
      narrative: "PUE and grid carbon intensity drive footprint; renewable PPAs partially captured.",
      totalFinancedTCO2e: 6719207,
      topSources: [
        { label: "Grid electricity", pct: 58, tCO2e: 3897140 },
        { label: "Diesel backup", pct: 12, tCO2e: 806305 },
        { label: "Scope 3 IT hardware (ref.)", pct: 30, tCO2e: 2015762 },
      ],
      mrvStatus: "Good for hyperscale colo; mid-market on estimates.",
      nextActions: ["Require PUE disclosure in annual reviews", "Map RE procurement contracts to location"],
    },
    {
      sector: "MSME Diversified",
      narrative: "Sparse primary data — sectoral spend factors with PCAF score 4–5 concentration.",
      totalFinancedTCO2e: 7443225,
      topSources: [{ label: "Sector proxy blend", pct: 100, tCO2e: 7443225 }],
      mrvStatus: "Low — CGTMSE and PM SVANidhi largely proxy.",
      nextActions: ["Expand lightweight borrower survey", "Tier pricing incentive for metered disclosure"],
    },
    {
      sector: "Shipping",
      narrative: "AIS-linked activity and IMO factors; EU ETS exposure for EU-trade flagged.",
      totalFinancedTCO2e: 10854104,
      topSources: [
        { label: "HFO / MGO at sea", pct: 78, tCO2e: 8466201 },
        { label: "Port hotelling", pct: 14, tCO2e: 1519575 },
        { label: "LNG dual-fuel (early)", pct: 8, tCO2e: 868328 },
      ],
      mrvStatus: "Improving with charterparty fuel clauses.",
      nextActions: ["Ingest IMO DCS where available", "Link to EU ETS pass-through model"],
    },
    {
      sector: "Textile & Apparel",
      narrative: "Steam and coal boilers in processing; renewable steam purchase growing slowly.",
      totalFinancedTCO2e: 6116202,
      topSources: [
        { label: "Process steam / boilers", pct: 51, tCO2e: 3119263 },
        { label: "Grid electricity (spinning)", pct: 35, tCO2e: 2140671 },
        { label: "Dyeing chemistry (ref.)", pct: 14, tCO2e: 856268 },
      ],
      mrvStatus: "Moderate; cluster programmes add batch data.",
      nextActions: ["Benchmark against BEE PAT cycle where applicable"],
    },
  ],
  intensityTrend: [
    { fy: "FY21-22", scope3IntensityPerCr: 698, allScopesIntensityPerCr: 718, portfolioBenchmark: 682 },
    { fy: "FY22-23", scope3IntensityPerCr: 756, allScopesIntensityPerCr: 772, portfolioBenchmark: 731 },
    { fy: "FY23-24", scope3IntensityPerCr: 642, allScopesIntensityPerCr: 664, portfolioBenchmark: 628 },
    { fy: "FY24-25", scope3IntensityPerCr: 738, allScopesIntensityPerCr: 754, portfolioBenchmark: 718 },
    { fy: "FY25-26 (proj.)", scope3IntensityPerCr: 668, allScopesIntensityPerCr: 686, portfolioBenchmark: 652 },
  ],
  emissionFactorRegister: [
    { id: "ef1", sector: "Power Generation", source: "CEA grid EF — India FY24", factorKgCO2ePerUnit: 0.716, unit: "kWh", vintage: "2024.1", pcafOption: "Option 3 — factors", lastReviewed: "2025-08-12" },
    { id: "ef2", sector: "Steel & Metals", source: "Worldsteel avg BF-BOF India", factorKgCO2ePerUnit: 2.1, unit: "t crude steel", vintage: "2023.2", pcafOption: "Option 2 — physical", lastReviewed: "2025-06-01" },
    { id: "ef3", sector: "Aviation", source: "DEFRA air passenger / tonne-km", factorKgCO2ePerUnit: 0.145, unit: "pax-km short-haul", vintage: "2024.0", pcafOption: "Option 3 — factors", lastReviewed: "2025-09-20" },
    { id: "ef4", sector: "Cement", source: "IEA/WBCSD cement", factorKgCO2ePerUnit: 0.92, unit: "t cementitious", vintage: "2023.1", pcafOption: "Option 2 — physical", lastReviewed: "2025-05-18" },
    { id: "ef5", sector: "Chemicals & Petrochemicals", source: "EPA steam cracker proxy", factorKgCO2ePerUnit: 0.62, unit: "t ethylene eq.", vintage: "2022.4", pcafOption: "Option 3 — factors", lastReviewed: "2025-04-02" },
    { id: "ef6", sector: "Real Estate & Construction", source: "BEE ECBC operational + embodied split", factorKgCO2ePerUnit: 118, unit: "m²·yr (res)", vintage: "2024.3", pcafOption: "Option 3 — factors", lastReviewed: "2025-07-30" },
    { id: "ef7", sector: "Automotive", source: "Tailpipe + WTT ICE passenger", factorKgCO2ePerUnit: 192, unit: "km (avg fleet)", vintage: "2024.1", pcafOption: "Option 3 — factors", lastReviewed: "2025-08-05" },
    { id: "ef8", sector: "Agribusiness", source: "Spend-based EXIOBASE India", factorKgCO2ePerUnit: 0.34, unit: "₹'000 revenue", vintage: "2023.0", pcafOption: "Option 3 — factors", lastReviewed: "2025-03-11" },
    { id: "ef9", sector: "IT & Data Centers", source: "Grid + PUE-adjusted kWh", factorKgCO2ePerUnit: 0.68, unit: "kWh IT load", vintage: "2024.2", pcafOption: "Option 2 — physical", lastReviewed: "2025-09-01" },
    { id: "ef10", sector: "MSME Diversified", source: "EXIOBASE hybrid India", factorKgCO2ePerUnit: 0.28, unit: "₹'000 revenue", vintage: "2023.0", pcafOption: "Option 3 — factors", lastReviewed: "2025-02-14" },
    { id: "ef11", sector: "Shipping", source: "IMO 4th GHG study — HFO", factorKgCO2ePerUnit: 3.15, unit: "t fuel", vintage: "2024.0", pcafOption: "Option 2 — physical", lastReviewed: "2025-06-22" },
    { id: "ef12", sector: "Textile & Apparel", source: "Higg MSI proxy bundle", factorKgCO2ePerUnit: 8.4, unit: "kg fabric processed", vintage: "2022.1", pcafOption: "Option 3 — factors", lastReviewed: "2025-01-09" },
  ],
  gasInventory: buildBankGhgGasInventory(_GHG_SECTOR_TRACKER),
};

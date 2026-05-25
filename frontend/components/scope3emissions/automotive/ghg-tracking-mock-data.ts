import { SCOPE3_TOTAL_TCO2E } from "./mockData";
import { buildAutoGhgGasInventory } from "./ghg-gas-inventory-auto";
import type { AutoGhgTrackingMockData } from "./ghg-tracking-types";

const _CATEGORY_TRACKER = [
  { category: "Cat 11: Use of sold products", scope3TCO2e: 3_504_000, vehiclesProduced: 298_600, pctOfTotalScope3: 72.7, yoyPct: -1.2, pathwayTag: "Off track" },
  { category: "Cat 1: Purchased goods & services", scope3TCO2e: 892_000, vehiclesProduced: 312_400, pctOfTotalScope3: 18.5, yoyPct: -2.8, pathwayTag: "On track" },
  { category: "Cat 4: Upstream transportation", scope3TCO2e: 198_000, vehiclesProduced: 312_400, pctOfTotalScope3: 4.1, yoyPct: 0.6, pathwayTag: "At risk" },
  { category: "Cat 12: End-of-life", scope3TCO2e: 96_000, vehiclesProduced: 298_600, pctOfTotalScope3: 2.0, yoyPct: -0.4, pathwayTag: "On track" },
  { category: "Cat 9: Downstream transportation", scope3TCO2e: 48_000, vehiclesProduced: 298_600, pctOfTotalScope3: 1.0, yoyPct: 0.2, pathwayTag: "No data" },
  { category: "Cat 2: Capital goods", scope3TCO2e: 28_000, vehiclesProduced: 312_400, pctOfTotalScope3: 0.6, yoyPct: -1.0, pathwayTag: "On track" },
  { category: "Cat 5: Waste", scope3TCO2e: 42_000, vehiclesProduced: 312_400, pctOfTotalScope3: 0.9, yoyPct: 0.1, pathwayTag: "No data" },
  { category: "Cat 6: Business travel", scope3TCO2e: 8_000, vehiclesProduced: 0, pctOfTotalScope3: 0.2, yoyPct: 3.2, pathwayTag: "At risk" },
  { category: "Cat 7: Employee commuting", scope3TCO2e: 4_000, vehiclesProduced: 0, pctOfTotalScope3: 0.1, yoyPct: 0.0, pathwayTag: "No data" },
];

export const autoGhgTrackingMockData: AutoGhgTrackingMockData = {
  categoryTracker: _CATEGORY_TRACKER,
  categoryDetails: [
    {
      category: "Cat 11: Use of sold products",
      narrative:
        "Use-phase inventory applies WLTP-adjusted fuel and grid factors by model and sales region. EV share at 32% FY25 — largest absolute block and primary SBTi lever.",
      totalScope3TCO2e: 3_504_000,
      topSources: [
        { label: "ICE / hybrid combustion", pct: 58, tCO2e: 2_032_320 },
        { label: "BEV grid charging (India retail)", pct: 28, tCO2e: 981_120 },
        { label: "Fleet LCV high-km proxy", pct: 14, tCO2e: 490_560 },
      ],
      mrvStatus: "ICCT memo + sales split — limited assurance on fleet telematics.",
      nextActions: ["Refresh grid factor by state", "Expand fleet km validation for LCV", "Align with product carbon footprint sign-off"],
    },
    {
      category: "Cat 1: Purchased goods & services",
      narrative: "Cradle-to-gate supplier PCFs and spend-based factors for Tier 1–3; battery and steel dominate.",
      totalScope3TCO2e: 892_000,
      topSources: [
        { label: "Battery pack & cells", pct: 38, tCO2e: 338_960 },
        { label: "Steel & aluminium stampings", pct: 34, tCO2e: 303_280 },
        { label: "Electronics & trim", pct: 28, tCO2e: 249_760 },
      ],
      mrvStatus: "58% Tier 1 with verified PCF; remainder spend-based.",
      nextActions: ["Close Cathode Materials PCF gap", "ISCC mass-balance for aluminium pilot", "Wave 2 supplier SBTi letters"],
    },
    {
      category: "Cat 4: Upstream transportation",
      narrative: "Inbound logistics to Pune, Chennai, and Sanand — sea vs air mode split drives variance.",
      totalScope3TCO2e: 198_000,
      topSources: [
        { label: "Sea freight (cells & modules)", pct: 72, tCO2e: 142_560 },
        { label: "Road feeder & plant transfer", pct: 22, tCO2e: 43_560 },
        { label: "Air freight (expedite)", pct: 6, tCO2e: 11_880 },
      ],
      mrvStatus: "GLEC-aligned factors; air spike flagged Q3.",
      nextActions: ["Sea buffer stock for KR cells", "Mode shift KPI in procurement scorecard"],
    },
    {
      category: "Cat 12: End-of-life",
      narrative: "Recycler proxy by material stream; ELV regulations vary by export market.",
      totalScope3TCO2e: 96_000,
      topSources: [
        { label: "Steel recovery", pct: 45, tCO2e: 43_200 },
        { label: "Battery recycling (allocated)", pct: 35, tCO2e: 33_600 },
        { label: "Plastics & fluids", pct: 20, tCO2e: 19_200 },
      ],
      mrvStatus: "Estimated — recycler contracts under review.",
      nextActions: ["Map EU battery passport requirements", "Update ELV allocation for export trims"],
    },
    {
      category: "Cat 9: Downstream transportation",
      narrative: "Dealer and fleet delivery legs after plant gate.",
      totalScope3TCO2e: 48_000,
      topSources: [
        { label: "Road delivery to dealers", pct: 88, tCO2e: 42_240 },
        { label: "Regional hub transfers", pct: 12, tCO2e: 5_760 },
      ],
      mrvStatus: "Carrier invoices sampled — moderate coverage.",
      nextActions: ["Consolidate north India hub routing"],
    },
  ],
  intensityTrend: [
    { fy: "FY21-22", scope3IntensityPerVehicle: 16.8, scope3IntensityPerRevenueCr: 920, internalBenchmark: 17.2 },
    { fy: "FY22-23", scope3IntensityPerVehicle: 16.2, scope3IntensityPerRevenueCr: 898, internalBenchmark: 16.6 },
    { fy: "FY23-24", scope3IntensityPerVehicle: 15.6, scope3IntensityPerRevenueCr: 862, internalBenchmark: 16.0 },
    { fy: "FY24-25", scope3IntensityPerVehicle: 15.4, scope3IntensityPerRevenueCr: 843, internalBenchmark: 15.8 },
    { fy: "FY25-26 (proj.)", scope3IntensityPerVehicle: 14.6, scope3IntensityPerRevenueCr: 798, internalBenchmark: 15.0 },
  ],
  emissionFactorRegister: [
    { id: "aef1", category: "Cat 11", source: "ICCT India use-phase — WLTP + real-world uplift", factorKgCO2ePerUnit: 192, unit: "km (passenger)", vintage: "2025.1", dataTier: "Tier 2 — model", lastReviewed: "2025-01-12" },
    { id: "aef2", category: "Cat 11", source: "CEA grid EF — India FY24 (BEV)", factorKgCO2ePerUnit: 0.716, unit: "kWh", vintage: "2024.1", dataTier: "Tier 2 — grid", lastReviewed: "2025-03-28" },
    { id: "aef3", category: "Cat 1", source: "Supplier PCF — battery pack cradle-to-gate", factorKgCO2ePerUnit: 78, unit: "kWh capacity", vintage: "2024.3", dataTier: "Tier 1 — PCF", lastReviewed: "2025-02-14" },
    { id: "aef4", category: "Cat 1", source: "Worldsteel avg BF-BOF India", factorKgCO2ePerUnit: 2.1, unit: "t steel", vintage: "2023.2", dataTier: "Tier 3 — industry", lastReviewed: "2025-06-01" },
    { id: "aef5", category: "Cat 4", source: "GLEC Framework v3 — sea container", factorKgCO2ePerUnit: 0.012, unit: "t·km", vintage: "2024.0", dataTier: "Tier 2 — logistics", lastReviewed: "2025-08-05" },
    { id: "aef6", category: "Cat 4", source: "DEFRA air freight — long haul", factorKgCO2ePerUnit: 0.602, unit: "t·km", vintage: "2024.0", dataTier: "Tier 3 — factors", lastReviewed: "2025-09-20" },
    { id: "aef7", category: "Cat 5", source: "IPCC landfill CH₄ default", factorKgCO2ePerUnit: 0.58, unit: "t waste", vintage: "2019.1", dataTier: "Tier 3 — factors", lastReviewed: "2025-04-02" },
    { id: "aef8", category: "Cat 12", source: "Recycler proxy — ELV mix India", factorKgCO2ePerUnit: 42, unit: "vehicle", vintage: "2023.0", dataTier: "Tier 3 — proxy", lastReviewed: "2025-05-18" },
    { id: "aef9", category: "Cat 6", source: "DEFRA business travel air", factorKgCO2ePerUnit: 0.145, unit: "pax-km", vintage: "2024.0", dataTier: "Tier 2 — spend", lastReviewed: "2025-07-30" },
    { id: "aef10", category: "Cat 2", source: "Capital goods — machinery spend", factorKgCO2ePerUnit: 0.31, unit: "₹'000 capex", vintage: "2023.0", dataTier: "Tier 3 — spend", lastReviewed: "2025-03-11" },
  ],
  gasInventory: buildAutoGhgGasInventory(_CATEGORY_TRACKER, SCOPE3_TOTAL_TCO2E),
};

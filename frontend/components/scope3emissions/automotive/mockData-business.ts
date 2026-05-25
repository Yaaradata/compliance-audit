import type {
  Cat11AssumptionSet,
  CategoryOwner,
  FinancialKpis,
  InvestmentInitiative,
  MethodologyCategory,
  PlantScope3Slice,
  ReportingContext,
  RestatementLogRow,
  SupplierProgrammeRow,
  VarianceBridgePoint,
} from "./types";
import { MOCK_SUPPLIERS } from "./mockData-suppliers";

const SCOPE3_TOTAL_TCO2E = 4_820_000;

export const MOCK_REPORTING_CONTEXT: ReportingContext = {
  entity: "Bharat Mobility Motors Ltd (consolidated)",
  boundary: "Operational control — India plants + imported tier-1 PCF",
  methodology: "GHG Protocol Corporate Value Chain (Scope 3) · ISO 14064-1 aligned",
  baselineFY: "FY2020-21",
  inventoryClose: "2025-03-31",
  assuranceLevel: "Limited assurance — in progress (FY25)",
  dataVintage: "2025-04-02T06:00:00+05:30",
};

export const MOCK_FINANCIAL_KPIS: FinancialKpis = {
  intensityPerRevenueCr: Math.round((SCOPE3_TOTAL_TCO2E / 5720) * 10) / 10,
  intensityPerVehicleSold: Math.round((SCOPE3_TOTAL_TCO2E / 298_600) * 10) / 10,
  intensityPerVehicleProduced: Math.round((SCOPE3_TOTAL_TCO2E / 312_400) * 10) / 10,
  shadowCarbonExposureINRCr: Math.round((SCOPE3_TOTAL_TCO2E * 920) / 1_00_00_000) / 10,
  topCategoryCogsPct: 34.2,
  yoyVariancePct: -2.3,
};

export const MOCK_VARIANCE_BRIDGE: VarianceBridgePoint[] = [
  { label: "FY24 Scope 3", value: 4_930_000, type: "start" },
  { label: "Volume / mix", value: -42_000, type: "delta" },
  { label: "EV production share", value: -68_000, type: "delta" },
  { label: "Supplier PCF refresh", value: -28_000, type: "delta" },
  { label: "Logistics mode shift", value: -12_000, type: "delta" },
  { label: "Methodology / factors", value: 40_000, type: "delta" },
  { label: "FY25 Scope 3", value: SCOPE3_TOTAL_TCO2E, type: "end" },
];

export const MOCK_INVESTMENT_PIPELINE: InvestmentInitiative[] = [
  { id: "inv1", title: "EU cathode dual-source qualification", owner: "Procurement", impactTCO2e: 186_000, capexINRCr: 42, status: "In progress", paybackYears: 4 },
  { id: "inv2", title: "Recycled aluminium chassis pilot", owner: "Engineering", impactTCO2e: 42_000, capexINRCr: 18, status: "Planned", paybackYears: 6 },
  { id: "inv3", title: "Chennai port buffer — sea freight", owner: "Logistics", impactTCO2e: 12_800, capexINRCr: 6, status: "Delivered", paybackYears: 2 },
  { id: "inv4", title: "Use-phase telematics for fleet LCV", owner: "Product", impactTCO2e: 78_000, capexINRCr: 24, status: "In progress", paybackYears: 5 },
];

export const MOCK_METHODOLOGY: MethodologyCategory[] = [
  { ghgCategory: 1, label: "Purchased goods & services", owner: "Procurement", approach: "Supplier-specific PCF → spend-based fallback", dataQuality: "Estimated", coveragePct: 72 },
  { ghgCategory: 4, label: "Upstream transportation", owner: "Logistics", approach: "Tonne-km by mode · TMS actuals", dataQuality: "Actual", coveragePct: 81 },
  { ghgCategory: 11, label: "Use of sold products", owner: "Product / Engineering", approach: "Lifetime km · grid mix by sales region", dataQuality: "Proxy", coveragePct: 64 },
  { ghgCategory: 12, label: "End-of-life treatment", owner: "Sustainability", approach: "Recycler certificates + treatment splits", dataQuality: "Estimated", coveragePct: 58 },
];

export const MOCK_RESTATEMENTS: RestatementLogRow[] = [
  { id: "rs1", date: "2025-02-10", reason: "VoltCell PCF v3.2 — supplier-specific Cat 1", impactTCO2e: -18_400, categories: "Cat 1" },
  { id: "rs2", date: "2024-11-05", reason: "ICCT India grid factor update — Cat 11", impactTCO2e: 62_000, categories: "Cat 11" },
];

export const MOCK_CAT11: Cat11AssumptionSet[] = [
  { market: "India retail", lifetimeKm: 150_000, gridKgPerKwh: 0.82, fuelType: "Grid + petrol hybrid", realWorldFactor: 1.08, evChargingMixPct: 62, fleetSharePct: 12 },
  { market: "India fleet LCV", lifetimeKm: 220_000, gridKgPerKwh: 0.82, fuelType: "Diesel / CNG", realWorldFactor: 1.12, evChargingMixPct: 8, fleetSharePct: 88 },
  { market: "EU export", lifetimeKm: 180_000, gridKgPerKwh: 0.28, fuelType: "Grid EV", realWorldFactor: 1.05, evChargingMixPct: 94, fleetSharePct: 5 },
];

export const MOCK_SUPPLIER_PROGRAMME: SupplierProgrammeRow[] = MOCK_SUPPLIERS.filter((s) => s.tier === 1)
  .map((s, i) => ({
    supplierId: s.id,
    name: s.name,
    emissionsSharePct: Math.round((s.tCO2e / SCOPE3_TOTAL_TCO2E) * 1000) / 10,
    pcfStatus: (s.pcfStatus ?? (i % 4 === 0 ? "Verified" : i % 4 === 1 ? "Received" : i % 4 === 2 ? "Requested" : "Expired")) as SupplierProgrammeRow["pcfStatus"],
    sbtiCommitted: i % 3 !== 2,
    capStatus: (s.capStatus ?? (s.compliance === "Non-compliant" ? "Open" : "None")) as SupplierProgrammeRow["capStatus"],
    spendINRCr: s.spendINRCr ?? Math.round(s.tCO2e / 420),
    contractRenewal: s.contractRenewal ?? `2025-Q${(i % 4) + 1}`,
    wave: (i < 3 ? "Wave 1" : i < 6 ? "Wave 2" : "Wave 3") as SupplierProgrammeRow["wave"],
  }))
  .sort((a, b) => b.emissionsSharePct - a.emissionsSharePct);

export const MOCK_CATEGORY_OWNERS: CategoryOwner[] = [
  { ghgCategory: 1, label: "Purchased goods & services", owner: "Procurement", completenessPct: 86 },
  { ghgCategory: 4, label: "Upstream transportation", owner: "Logistics", completenessPct: 72 },
  { ghgCategory: 11, label: "Use of sold products", owner: "Product Engineering", completenessPct: 64 },
  { ghgCategory: 12, label: "End-of-life", owner: "Sustainability", completenessPct: 58 },
];

/** Production-phase allocation by plant (Cat 1 + inbound + plant ops) — sums to 1.172 Mt upstream production block. */
export const MOCK_PLANT_SLICES: PlantScope3Slice[] = [
  { plant: "Pune", inboundTCO2e: 128_000, outboundTCO2e: 15_000, productionAllocatedTCO2e: 436_000, intensityPerVehicle: 14.2 },
  { plant: "Chennai", inboundTCO2e: 164_000, outboundTCO2e: 19_000, productionAllocatedTCO2e: 515_000, intensityPerVehicle: 15.8 },
  { plant: "Sanand", inboundTCO2e: 72_000, outboundTCO2e: 9_000, productionAllocatedTCO2e: 221_000, intensityPerVehicle: 13.1 },
];

export const MOCK_SBTI = {
  nearTermStatus: "Validated — 1.5°C pathway",
  supplierEngagementTargetPct: 67,
  suppliersWithTargetsPct: 41,
  flagApplicable: false,
};

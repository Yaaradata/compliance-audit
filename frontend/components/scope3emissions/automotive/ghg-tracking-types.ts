/** GHG species tracking — mirrors banking GhgTracking structure for OEM Scope 3. */

export type AutoGhgGasCode = "CO2" | "CH4" | "N2O" | "HFCS" | "OTHER";

export type AutoGhgGasByCode = Record<AutoGhgGasCode, number>;

export interface GhgTrackingCategoryRowMock {
  category: string;
  scope3TCO2e: number;
  vehiclesProduced: number;
  pctOfTotalScope3: number;
  yoyPct: number;
  pathwayTag: string;
}

export interface GhgTrackingCategorySourceMock {
  label: string;
  pct: number;
  tCO2e: number;
}

export interface GhgTrackingCategoryDetailMock {
  category: string;
  narrative: string;
  totalScope3TCO2e: number;
  topSources: GhgTrackingCategorySourceMock[];
  mrvStatus: string;
  nextActions: string[];
}

export interface GhgIntensityTrendPointAuto {
  fy: string;
  scope3IntensityPerVehicle: number;
  scope3IntensityPerRevenueCr: number;
  internalBenchmark: number;
}

export interface GhgEmissionFactorRegisterRowAuto {
  id: string;
  category: string;
  source: string;
  factorKgCO2ePerUnit: number;
  unit: string;
  vintage: string;
  dataTier: string;
  lastReviewed: string;
}

export interface GhgGasSpeciesRollupAuto {
  code: AutoGhgGasCode;
  label: string;
  formula: string;
  tCO2e: number;
  pctOfScope3: number;
  ar5Note: string;
}

export interface GhgGasCategorySliceAuto {
  category: string;
  tCO2eByGas: AutoGhgGasByCode;
}

export interface GhgGasSupplierSliceAuto {
  supplierId: string;
  supplierName: string;
  category: string;
  tCO2eByGas: AutoGhgGasByCode;
}

export interface GhgGasNarrativeInsightAuto {
  id: string;
  headline: string;
  body: string;
  gasCodes: AutoGhgGasCode[];
  relatedCategoryNames: string[];
  relatedInsightIds: string[];
}

export interface GhgGasInventoryAuto {
  methodologyVersion: string;
  gwpStandardLabel: string;
  boundaryNote: string;
  executiveScope3TCO2e: number;
  speciesRollup: GhgGasSpeciesRollupAuto[];
  categorySlices: GhgGasCategorySliceAuto[];
  supplierSlices: GhgGasSupplierSliceAuto[];
  narrativeInsights: GhgGasNarrativeInsightAuto[];
}

export interface AutoGhgTrackingMockData {
  categoryTracker: GhgTrackingCategoryRowMock[];
  categoryDetails: GhgTrackingCategoryDetailMock[];
  intensityTrend: GhgIntensityTrendPointAuto[];
  emissionFactorRegister: GhgEmissionFactorRegisterRowAuto[];
  gasInventory: GhgGasInventoryAuto;
}

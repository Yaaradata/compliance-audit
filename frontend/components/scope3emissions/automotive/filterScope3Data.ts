import type {
  AutomotiveScope3MockData,
  CategoryTracking,
  ComponentEmission,
  EmissionRecord,
  FilteredScope3Data,
  GlobalFilters,
  LifecycleSlice,
  LogisticsRoute,
  OverviewKpis,
  SupplierNode,
  TrendPoint,
  ValueChainCategory,
  VehicleModelEmission,
} from "./types";

const PERIOD_SCALE: Record<string, number> = {
  "FY2024-25": 1,
  "FY2023-24": 1.048,
  "Q4 FY25": 0.27,
  "Q3 FY25": 0.24,
};

const MODEL_ID_BY_NAME: Record<string, string> = {
  "BMM Nex EV": "m1",
  "BMM Urban ICE": "m2",
  "BMM Cross Hybrid": "m3",
  "BMM Fleet LCV": "m4",
};

function scale(n: number, factor: number): number {
  return Math.round(n * factor);
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function modelFactor(data: AutomotiveScope3MockData, vehicleModel: string): number {
  if (vehicleModel === "All models") return 1;
  const m = data.vehicleModels.find((v) => v.name === vehicleModel);
  return m ? m.shareOfScope3Pct / 100 : 1;
}

function periodFactor(period: string): number {
  return PERIOD_SCALE[period] ?? 1;
}

function plantFactor(data: AutomotiveScope3MockData, plant: string): number {
  if (plant === "All plants") return 1;
  const slice = data.plantSlices.find((p) => p.plant === plant);
  if (!slice) return 1;
  const all = data.plantSlices.reduce((a, p) => a + p.productionAllocatedTCO2e, 0);
  return slice.productionAllocatedTCO2e / all;
}

function powertrainFactor(data: AutomotiveScope3MockData, powertrain: string): number {
  if (powertrain === "All powertrains") return 1;
  const share = data.vehicleModels
    .filter((v) => v.powertrain === powertrain)
    .reduce((a, v) => a + v.shareOfScope3Pct, 0);
  return share > 0 ? share / 100 : 0.25;
}

function matchesGeography(s: SupplierNode, geography: string): boolean {
  if (geography === "All regions") return true;
  return s.country === geography || s.geography === geography;
}

function recalcCategories(categories: ValueChainCategory[], total: number): ValueChainCategory[] {
  return categories.map((c) => ({
    ...c,
    tCO2e: scale(c.tCO2e, 1),
    pct: pct(c.tCO2e, total),
  }));
}

function recalcPctList<T extends { tCO2e: number; pct?: number }>(items: T[], total: number): T[] {
  return items.map((item) => ({ ...item, pct: pct(item.tCO2e, total) }));
}

/** Apply global filters and return a reconciled inventory slice for the UI. */
export function filterScope3Data(data: AutomotiveScope3MockData, filters: GlobalFilters): FilteredScope3Data {
  const pScale = periodFactor(filters.period);
  const mScale = modelFactor(data, filters.vehicleModel);
  const plScale = plantFactor(data, filters.plant);
  const ptScale = powertrainFactor(data, filters.powertrain);
  const combined = pScale * mScale * plScale * ptScale;

  let suppliers = data.suppliers.map((s) => ({
    ...s,
    tCO2e: scale(s.tCO2e, combined),
    emissionsTrend: s.emissionsTrend.map((t) => ({ ...t, tCO2e: scale(t.tCO2e, combined) })),
  }));

  if (filters.supplier !== "All suppliers") {
    suppliers = suppliers.filter((s) => s.name === filters.supplier);
  }
  if (filters.geography !== "All regions") {
    suppliers = suppliers.filter((s) => matchesGeography(s, filters.geography));
  }
  if (filters.vehicleModel !== "All models") {
    const mid = MODEL_ID_BY_NAME[filters.vehicleModel];
    if (mid) suppliers = suppliers.filter((s) => s.modelIds.includes(mid));
  }

  const baseTotal = scale(data.company.scope3TCO2e, combined);
  const total =
    filters.supplier !== "All suppliers" && suppliers.length === 1
      ? suppliers[0].tCO2e
      : filters.geography !== "All regions" && filters.supplier === "All suppliers"
        ? scale(
            data.suppliers.filter((s) => matchesGeography(s, filters.geography)).reduce((a, s) => a + s.tCO2e, 0),
            pScale * (filters.vehicleModel !== "All models" ? mScale : 1),
          )
        : baseTotal;

  let vehicles = data.vehicleModels.filter(
    (v) => filters.vehicleModel === "All models" || v.name === filters.vehicleModel,
  );
  if (filters.powertrain !== "All powertrains") {
    vehicles = vehicles.filter((v) => v.powertrain === filters.powertrain);
  }

  const components: ComponentEmission[] = data.components
    .filter((c) => filters.vehicleModel === "All models" || c.modelIds.some((id) => vehicles.some((v) => v.id === id)))
    .map((c) => ({ ...c, tCO2e: scale(c.tCO2e, combined) }));

  const records: EmissionRecord[] = data.emissionRecords
    .filter((r) => {
      if (filters.period !== "FY2024-25" && !r.period.includes(filters.period.replace("FY", "FY").slice(0, 6))) {
        if (filters.period.startsWith("Q") && !r.period.includes(filters.period.split(" ")[0]!)) return false;
      }
      if (filters.vehicleModel !== "All models" && r.vehicleModel && r.vehicleModel !== filters.vehicleModel) return false;
      if (filters.supplier !== "All suppliers" && r.supplierId) {
        const sup = data.suppliers.find((s) => s.name === filters.supplier);
        if (sup && r.supplierId !== sup.id) return false;
      }
      if (filters.geography !== "All regions" && r.geography && r.geography !== filters.geography) return false;
      return true;
    })
    .map((r) => ({ ...r, tCO2e: scale(r.tCO2e, pScale) }));

  const categories = recalcCategories(
    data.valueChainCategories.map((c) => ({ ...c, tCO2e: scale(c.tCO2e, combined) })),
    total,
  );

  const upstreamTotal = categories.filter((c) => c.stream === "Upstream").reduce((a, c) => a + c.tCO2e, 0);
  const downstreamTotal = categories.filter((c) => c.stream === "Downstream").reduce((a, c) => a + c.tCO2e, 0);

  const usePhase = categories.find((c) => c.ghgCategory === 11)?.tCO2e ?? 0;

  const lifecycle: LifecycleSlice[] = data.lifecycle.map((l) => ({
    ...l,
    iceTCO2e: scale(l.iceTCO2e, combined),
    evTCO2e: scale(l.evTCO2e, combined),
  }));

  const trend: TrendPoint[] =
    filters.vehicleModel !== "All models" && data.emissionsTrendByModel[filters.vehicleModel]
      ? data.emissionsTrendByModel[filters.vehicleModel]!.map((t) => ({ ...t, tCO2e: scale(t.tCO2e, pScale) }))
      : data.emissionsTrend.map((t) => ({ ...t, tCO2e: scale(t.tCO2e, pScale) }));

  const tierBreakdown = ([1, 2, 3] as const).map((tier) => ({
    tier,
    tCO2e: suppliers.filter((s) => s.tier === tier).reduce((a, s) => a + s.tCO2e, 0),
  }));

  const topSupplier = [...suppliers].sort((a, b) => b.tCO2e - a.tCO2e)[0];

  const overview: OverviewKpis = {
    totalScope3TCO2e: total,
    emissionsPerVehicleTCO2e:
      vehicles.length === 1
        ? vehicles[0]!.lifecycleTCO2e
        : Math.round((total / data.company.vehiclesProducedFY) * 10) / 10,
    usePhasePct: pct(usePhase, total),
    evSharePct: data.overview.evSharePct,
    yoyChangePct: data.overview.yoyChangePct,
    topSupplierContributionPct: topSupplier ? pct(topSupplier.tCO2e, total) : 0,
  };

  const categoryTracking: CategoryTracking[] = data.categoryTracking.map((c) => {
    const scaled = scale(c.tCO2e, combined);
    return {
      ...c,
      tCO2e: scaled,
      pct: pct(scaled, total),
      trend: c.trend.map((t) => ({ ...t, tCO2e: scale(t.tCO2e, pScale) })),
      monthlyTrend: c.monthlyTrend?.map((t) => ({ ...t, tCO2e: scale(t.tCO2e, pScale) })),
    };
  });

  const routes: LogisticsRoute[] = data.logisticsRoutes
    .filter((r) => {
      if (filters.plant !== "All plants" && r.plant !== filters.plant) return false;
      if (filters.geography !== "All regions" && !r.from.includes(filters.geography) && !r.to.includes(filters.geography))
        return false;
      if (filters.supplier !== "All suppliers" && r.supplierId) {
        const sup = data.suppliers.find((s) => s.name === filters.supplier);
        if (sup && r.supplierId !== sup.id) return false;
      }
      return true;
    })
    .map((r) => ({ ...r, tCO2e: scale(r.tCO2e, combined) }));

  const transportTotal = routes.reduce((a, r) => a + r.tCO2e, 0) || scale(data.transportModes.reduce((a, m) => a + m.tCO2e, 0), combined);
  const transportModes = data.transportModes.map((m) => ({
    ...m,
    tCO2e: scale(m.tCO2e, combined),
    pct: pct(scale(m.tCO2e, combined), transportTotal),
  }));

  return {
    ...data,
    company: { ...data.company, scope3TCO2e: total },
    overview,
    lifecycle,
    emissionsTrend: trend,
    topSuppliers: recalcPctList(
      [...suppliers]
        .sort((a, b) => b.tCO2e - a.tCO2e)
        .slice(0, 5)
        .map((s) => ({ id: s.id, name: s.name, tCO2e: s.tCO2e, pct: 0, kind: "supplier" as const })),
      total,
    ),
    topComponents: recalcPctList(
      [...components]
        .sort((a, b) => b.tCO2e - a.tCO2e)
        .slice(0, 5)
        .map((c) => ({ id: c.id, name: c.name, tCO2e: c.tCO2e, pct: 0, kind: "component" as const })),
      total,
    ),
    suppliers,
    tierBreakdown,
    valueChainCategories: categories,
    upstreamTotal,
    downstreamTotal,
    sankeyFlows: data.sankeyFlows.map((f) => ({ ...f, value: scale(f.value, combined) })),
    components: recalcPctList(components, total),
    vehicleModels: vehicles.map((v) => ({ ...v })),
    emissionRecords: records.length > 0 ? records : data.emissionRecords.slice(0, 8).map((r) => ({ ...r, tCO2e: scale(r.tCO2e, pScale) })),
    categoryTracking,
    logisticsRoutes: routes,
    transportModes,
    intensityPerVehicle: overview.emissionsPerVehicleTCO2e,
    intensityPerRevenueCr: Math.round((total / data.company.revenueINRCr) * 10) / 10,
    emissionDrivers: data.emissionDrivers.map((d) => {
      const cat = categories.find((c) => c.label.includes(d.name.split("(")[0]!.trim()) || d.name.includes(c.label.slice(0, 12)));
      return { ...d, pct: cat ? cat.pct : d.pct };
    }),
  };
}

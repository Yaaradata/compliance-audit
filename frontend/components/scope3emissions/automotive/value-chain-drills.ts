import type {
  ValueChainCategoryRow,
  ValueChainMockData,
  ValueChainModelAttribution,
  ValueChainSectorPoint,
  ValueChainSegmentRow,
  ValueChainSupplierRow,
} from "./value-chain-types";

function categoryDrill(c: ValueChainCategoryRow) {
  return {
    narrative: `${c.label} is calculated using a mix of supplier-specific PCFs and spend-based factors, reconciled to the FY25 inventory close.`,
    methodology: ["GHG Protocol Corporate Value Chain Standard", "ISO 14064-1 aligned boundary", "Mutually exclusive category allocation"],
    sites: [
      { name: "Pune plant", tco2e: Math.round(c.tco2e * 0.42), sharePct: 42, note: "Assembly + inbound" },
      { name: "Chennai plant", tco2e: Math.round(c.tco2e * 0.35), sharePct: 35 },
      { name: "Sanand plant", tco2e: Math.round(c.tco2e * 0.23), sharePct: 23 },
    ],
    dataLayer: [
      { label: "Primary data share", value: "38% supplier PCF / actuals", status: "warning" as const },
      { label: "EF registry", value: "IEA grid + DEFRA freight (2024)", status: "ok" as const },
      { label: "Assurance", value: "Limited assurance — in progress", status: "warning" as const },
    ],
    controls: ["Cat owner sign-off", "EF change log", "Duplicate supplier guard"],
    openFindings: c.flagLabel ? [c.flagLabel] : ["No open findings on mock line"],
  };
}

function supplierDrill(r: ValueChainSupplierRow) {
  return {
    vendorId: `VND-${r.supplier.slice(0, 3).toUpperCase()}`,
    contractId: `PO-FY25-${r.tco2e % 10000}`,
    spendFY: `₹${r.spendCr} Cr procurement spend FY25`,
    efSource: "Supplier PCF v3 or cradle-to-gate LCA where available",
    breakdown: [
      { label: r.supply, tco2e: Math.round(r.tco2e * 0.7), pct: 70 },
      { label: "Inbound logistics (allocated)", tco2e: Math.round(r.tco2e * 0.3), pct: 30 },
    ],
    submissionStatus: "PCF on file — FY25 refresh",
    reviewerNote: "Procurement validated against SRM master and invoice sample.",
  };
}

function segmentDrill(s: ValueChainSegmentRow) {
  return {
    bookShareNarrative: `${s.label} represents ${s.pctFleet}% of FY25 production volume; use-phase dominates lifecycle for this nameplate.`,
    topConcentrations: [
      { name: s.label, units: s.unitsProduced, tco2e: s.tco2e, note: "Production + allocated use phase" },
    ],
    methodologyNotes: ["WLTP adjusted with ICCT India real-world factor", "Grid mix by primary sales region"],
    limitsAndMitigants: ["Battery chemistry sensitivity", "Fleet vs retail km split documented"],
  };
}

function sectorDrill(p: ValueChainSectorPoint) {
  return {
    macroLink: `${p.sector} market drives grid intensity and utilisation assumptions for sold vehicles.`,
    policyHooks: ["BRSR Principle 6", "CAFE-equivalent efficiency narrative", "PLI EV incentives"],
    topModels: [{ name: "Representative trim", units: p.volumeUnits, intensity: p.intensityPerVehicle }],
    watchSignals: p.quadrant === "TR" ? ["High volume + high intensity — Cat 11 priority"] : ["Monitor — lower materiality"],
  };
}

function modelDrill(m: ValueChainModelAttribution) {
  return {
    attributionSteps: [
      { label: "Lifetime distance", detail: "ICCT India retail proxy", value: `${m.lifetimeKm.toLocaleString()} km` },
      { label: "Grid factor", detail: "Sales-weighted", value: `${m.gridKgPerKwh} kg/kWh` },
      { label: "Units sold FY25", detail: "OEM sales register", value: m.unitsSoldFY.toLocaleString() },
      { label: "Attributed use-phase", detail: "Per-vehicle × units", value: `${m.attributedTCO2e.toLocaleString()} tCO₂e` },
    ],
    evidencePack: [
      { doc: "ICCT India use-phase memo", dated: "2025-01-12", reliedUpon: "Cat 11 model" },
      { doc: "Sales by region extract", dated: "2025-03-28", reliedUpon: "Volume allocation" },
    ],
    dataGaps: m.dataQualityScore >= 3 ? [] : ["Telematics validation pending for fleet LCV"],
    engagementStatus: "Product sign-off scheduled Q2 FY26",
    nextReview: "2025-09-30",
  };
}

export function attachValueChainDrills(data: ValueChainMockData): ValueChainMockData {
  return {
    ...data,
    upstream: {
      ...data.upstream,
      categories: data.upstream.categories.map((c) => ({ ...c, drill: categoryDrill(c) })),
      suppliers: data.upstream.suppliers.map((s) => ({ ...s, drill: supplierDrill(s) })),
    },
    downstream: {
      ...data.downstream,
      segments: data.downstream.segments.map((s) => ({ ...s, drill: segmentDrill(s) })),
      sectorPoints: data.downstream.sectorPoints.map((p) => ({ ...p, drill: sectorDrill(p) })),
      models: data.downstream.models.map((m) => ({ ...m, drill: modelDrill(m) })),
    },
  };
}

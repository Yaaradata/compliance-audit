"use client";

import type { AutoNavViewId, AutomotiveScope3MockData, DataQualityTag } from "./types";
import { Scope3KpiStrip } from "../scope3-kpi";
import { autoKpiToneAt, formatTCO2e } from "./automotive-ui";

export interface PageKpi {
  label: string;
  value: string;
  sub?: string;
  quality?: DataQualityTag;
  confidence?: number;
}

export function PageKpiStrip({ kpis }: { kpis: PageKpi[] }) {
  return (
    <Scope3KpiStrip
      items={kpis.map((k, i) => ({
        label: k.label,
        value: k.value,
        sub: k.sub,
        tone: autoKpiToneAt(i),
        quality: k.quality,
        confidence: k.confidence,
      }))}
    />
  );
}

export function kpisForView(view: AutoNavViewId, data: AutomotiveScope3MockData): PageKpi[] {
  const { overview, financialKpis, dataCompletenessPct } = data;
  const base: PageKpi[] = [
    {
      label: "Total Scope 3",
      value: formatTCO2e(overview.totalScope3TCO2e, true),
      sub: "Filtered inventory",
      quality: "Estimated",
      confidence: 84,
    },
  ];

  switch (view) {
    case "overview":
      return [
        ...base,
        { label: "Per vehicle (produced)", value: `${overview.emissionsPerVehicleTCO2e} t`, sub: "Lifecycle avg", quality: "Proxy", confidence: 72 },
        { label: "Use phase share", value: `${overview.usePhasePct}%`, sub: "Cat 11 dominant", quality: "Proxy", confidence: 64 },
        { label: "YoY change", value: `${overview.yoyChangePct}%`, sub: "Improvement", quality: "Estimated", confidence: 80 },
        { label: "Top supplier", value: `${overview.topSupplierContributionPct}%`, sub: "Contribution", quality: "Actual", confidence: 91 },
      ];
    case "supply_chain":
      return [
        ...base,
        { label: "Tier-1 suppliers", value: String(data.suppliers.filter((s) => s.tier === 1).length), sub: "Active mapping" },
        { label: "Cat 1 share", value: `${data.categoryTracking.find((c) => c.ghgCategory === 1)?.pct ?? "—"}%`, sub: "Purchased goods" },
        { label: "Non-compliant", value: String(data.suppliers.filter((s) => s.compliance === "Non-compliant").length), sub: "Needs engagement" },
        { label: "PCF coverage", value: "62%", sub: "Parts with docs", quality: "Estimated", confidence: 70 },
      ];
    case "value_chain":
      return [
        ...base,
        { label: "Upstream", value: formatTCO2e(data.upstreamTotal, true), sub: "Categories 1–8" },
        { label: "Downstream", value: formatTCO2e(data.downstreamTotal, true), sub: "Categories 9–15" },
        { label: "Use phase share", value: `${data.overview.usePhasePct}%`, sub: "Cat 11 dominant" },
        { label: "Categories", value: String(data.valueChainCategories.length), sub: "Tracked" },
      ];
    case "product_components":
      return [
        ...base,
        { label: "Vehicle models", value: String(data.vehicleModels.length), sub: "In portfolio" },
        { label: "Components", value: String(data.components.length), sub: "Mapped BOM" },
        { label: "EV share", value: `${overview.evSharePct}%`, sub: "Production mix" },
        { label: "Avg intensity", value: `${overview.emissionsPerVehicleTCO2e} t`, sub: "Per vehicle" },
      ];
    case "geography":
      return [
        ...base,
        { label: "Countries", value: String(data.geography.length), sub: "Active markets" },
        { label: "Logistics routes", value: String(data.logisticsRoutes.length), sub: "Mapped lanes" },
        { label: "High risk markets", value: String(data.geography.filter((g) => g.regulatoryRisk === "High").length), sub: "Regulatory" },
        { label: "Grid intensity", value: `${data.geography[0]?.gridIntensityKgPerKwh ?? "—"} kg/kWh`, sub: "Weighted avg" },
      ];
    case "emissions_tracking":
      return [
        ...base,
        { label: "Ledger lines", value: String(data.emissionRecords.length), sub: "Granular register" },
        { label: "Intensity / ₹ Cr", value: `${data.intensityPerRevenueCr} t`, sub: "BRSR denominator", quality: "Actual", confidence: 88 },
        { label: "Primary data share", value: "38%", sub: "Cat 1 + logistics", quality: "Estimated", confidence: 75 },
        { label: "Categories tracked", value: String(data.categoryTracking.length), sub: "GHG Protocol" },
      ];
    case "intensity_ratio":
      return [
        ...base,
        { label: "Revenue FY24", value: "₹30.5k Cr", sub: "Reported" },
        { label: "Intensity / vehicle", value: "15.3 t", sub: "tCO₂e/unit" },
        { label: "Decarb invest", value: "₹325 Cr", sub: "Programmes" },
        { label: "Abatement cost", value: "₹17.7/t", sub: "Blended" },
      ];
    case "compliance_audit":
      return [
        ...base,
        { label: "Completeness", value: `${dataCompletenessPct}%`, sub: "Required fields" },
        { label: "BRSR gaps", value: String(data.brsrMapping.filter((r) => r.status === "Gap").length), sub: "Disclosure mapping" },
        { label: "Evidence docs", value: String(data.evidenceDocuments.length), sub: "Repository" },
        { label: "Pending approval", value: String(data.approvalWorkflow.filter((a) => a.stage !== "Approved").length), sub: "Workflow" },
      ];
    case "insights":
      return [
        ...base,
        { label: "Opportunities", value: String(data.opportunities.length), sub: "Prioritised list" },
        { label: "Top impact", value: formatTCO2e(data.opportunities[0]?.impactTCO2e ?? 0, true), sub: data.opportunities[0]?.title.slice(0, 28) ?? "" },
        { label: "AI insights", value: String(data.insightFeed.length), sub: "Active feed" },
        { label: "Pipeline capex", value: `₹${data.investmentPipeline.reduce((a, i) => a + i.capexINRCr, 0)} Cr`, sub: "Linked initiatives" },
      ];
    case "reports":
      return [
        ...base,
        { label: "Templates ready", value: String(data.reportTemplates.filter((t) => t.status === "Ready").length), sub: "Export packs" },
        { label: "Schedules", value: String(data.reportSchedules.length), sub: "Automated runs" },
        { label: "Assurance", value: data.reportingContext.assuranceLevel.split("—")[0]?.trim() ?? "—", sub: "FY25" },
        { label: "Fields selected", value: String(data.customReportFields.filter((f) => f.selected).length), sub: "Custom builder" },
      ];
    default:
      return base;
  }
}

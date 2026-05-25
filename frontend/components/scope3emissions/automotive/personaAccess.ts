import type { AutoNavViewId, AutoPersonaId } from "./types";

export const PERSONA_LABELS: Record<AutoPersonaId, string> = {
  sustainability_head: "Head of Sustainability",
  cso: "Chief Sustainability Officer (CSO)",
  cfo: "CFO / Finance Controller",
  procurement_lead: "Procurement GM",
  plant_operations: "Plant Operations Head",
  automotive_head: "Automotive BU / Industry Head",
  executive: "Executive / CXO",
  compliance_officer: "Compliance & BRSR Officer",
  external_auditor: "External Assurance Auditor",
};

const ALL_VIEWS: AutoNavViewId[] = [
  "overview",
  "supply_chain",
  "value_chain",
  "product_components",
  "geography",
  "emissions_tracking",
  "intensity_ratio",
  "compliance_audit",
  "insights",
  "reports",
];

export function visibleNavViews(persona: AutoPersonaId): AutoNavViewId[] {
  switch (persona) {
    case "sustainability_head":
    case "cso":
      return [...ALL_VIEWS];
    case "cfo":
      return ["overview", "value_chain", "intensity_ratio", "compliance_audit", "insights", "reports"];
    case "procurement_lead":
      return ["overview", "supply_chain", "value_chain", "product_components", "intensity_ratio", "geography", "insights"];
    case "plant_operations":
      return ["overview", "product_components", "geography", "emissions_tracking", "supply_chain"];
    case "automotive_head":
      return ["overview", "product_components", "value_chain", "intensity_ratio", "geography", "insights", "reports"];
    case "executive":
      return ["overview", "value_chain", "intensity_ratio", "insights", "reports"];
    case "compliance_officer":
      return ["overview", "emissions_tracking", "compliance_audit", "reports"];
    case "external_auditor":
      return ["overview", "emissions_tracking", "compliance_audit"];
    default:
      return ["overview"];
  }
}

export function defaultViewForPersona(persona: AutoPersonaId): AutoNavViewId {
  switch (persona) {
    case "cfo":
      return "overview";
    case "cso":
      return "compliance_audit";
    case "procurement_lead":
      return "supply_chain";
    case "automotive_head":
      return "product_components";
    case "compliance_officer":
    case "external_auditor":
      return "compliance_audit";
    case "plant_operations":
      return "geography";
    case "executive":
      return "overview";
    default:
      return "overview";
  }
}

export function personaScopeHint(persona: AutoPersonaId): string {
  switch (persona) {
    case "cso":
      return "Full inventory governance — methodology, SBTi pathway, Cat 11 assumptions, and assurance readiness.";
    case "cfo":
      return "Financial materiality — variance bridge, shadow carbon cost, intensity per ₹ Cr, and investment pipeline.";
    case "procurement_lead":
      return "Supply chain & intensity — Tier-1 scorecard, product-line carbon intensity, procurement KPIs, and inbound logistics.";
    case "plant_operations":
      return "Plant inbound/outbound logistics, route intensity, and production allocation by site.";
    case "automotive_head":
      return "Model portfolio lifecycle, powertrain mix, market use-phase assumptions, and competitive benchmarks.";
    case "executive":
      return "Board-ready lifecycle summary, decarbonisation pathway, and top risks/opportunities.";
    case "compliance_officer":
      return "BRSR mapping, evidence workflow, audit trail, and data quality completeness.";
    case "external_auditor":
      return "Read-only assurance — lineage, methodology register, evidence index, and PBC samples.";
    default:
      return "Full Scope 3 automotive workspace — GHG Protocol & BRSR aligned.";
  }
}

export function showCfoPanel(persona: AutoPersonaId): boolean {
  return persona === "cfo" || persona === "executive";
}

export function showCsoPanels(persona: AutoPersonaId): boolean {
  return persona === "cso" || persona === "sustainability_head";
}

export function showPlantPanel(persona: AutoPersonaId): boolean {
  return persona === "plant_operations" || persona === "automotive_head";
}

export function showPortfolioPanel(persona: AutoPersonaId): boolean {
  return persona === "automotive_head" || persona === "executive";
}

export function showProcurementPanel(persona: AutoPersonaId): boolean {
  return persona === "procurement_lead" || persona === "cso" || persona === "sustainability_head";
}

export function showDataQualityPanel(persona: AutoPersonaId): boolean {
  return persona === "compliance_officer" || persona === "external_auditor" || persona === "cso";
}

export function isExternalAuditor(persona: AutoPersonaId): boolean {
  return persona === "external_auditor";
}

/** Triage AI insight workflow (acknowledge / assign / dismiss). */
export function canTriageAiInsights(persona: AutoPersonaId): boolean {
  return persona !== "external_auditor" && persona !== "executive";
}

export type IntensityRatioTabId = "overview" | "products" | "investment" | "efficiency";

/** Tab order and labels for Intensity ratio — procurement leads with operational KPIs. */
export function intensityTabsForPersona(persona: AutoPersonaId): { id: IntensityRatioTabId; label: string }[] {
  if (persona === "procurement_lead") {
    return [
      { id: "efficiency", label: "Procurement KPIs" },
      { id: "products", label: "Product lines" },
      { id: "overview", label: "Sourcing lens" },
    ];
  }
  return [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Products" },
    { id: "investment", label: "Investments & ROI" },
    { id: "efficiency", label: "Efficiency" },
  ];
}

export function defaultIntensityTabForPersona(persona: AutoPersonaId): IntensityRatioTabId {
  return persona === "procurement_lead" ? "efficiency" : "overview";
}

export function isProcurementIntensityPersona(persona: AutoPersonaId): boolean {
  return persona === "procurement_lead";
}

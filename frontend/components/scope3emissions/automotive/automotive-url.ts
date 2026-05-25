import type { AutoNavViewId, AutoPersonaId } from "./types";

const NAV_IDS = new Set<AutoNavViewId>([
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
]);

const PERSONA_IDS = new Set<AutoPersonaId>([
  "sustainability_head",
  "cso",
  "cfo",
  "procurement_lead",
  "plant_operations",
  "automotive_head",
  "executive",
  "compliance_officer",
  "external_auditor",
]);

export function parseAutoNavViewId(raw: string | null): AutoNavViewId | null {
  if (!raw) return null;
  return NAV_IDS.has(raw as AutoNavViewId) ? (raw as AutoNavViewId) : null;
}

export function parseAutoPersonaId(raw: string | null): AutoPersonaId | null {
  if (!raw) return null;
  return PERSONA_IDS.has(raw as AutoPersonaId) ? (raw as AutoPersonaId) : null;
}

export function parseReportingYear(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 2020 && n <= 2035 ? n : null;
}

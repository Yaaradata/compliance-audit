import type { GhgGasCode, NavViewId, PersonaId } from "./types";

const NAV_IDS = new Set<NavViewId>([
  "executive",
  "suppliers",
  "categories",
  "ghg_gases",
  "controls_audit",
  "submitted_evidences",
  "ai_insights",
  "reports",
  "supplier_portal",
]);

const GHG_GAS_CODES = new Set<GhgGasCode>(["CO2", "CH4", "N2O", "HFCS", "OTHER"]);

const PERSONA_IDS = new Set<PersonaId>([
  "procurement_gm",
  "esg_manager",
  "supplier_contact",
  "third_party_auditor",
  "board_cxo",
]);

export function parseNavViewId(raw: string | null): NavViewId | null {
  if (!raw) return null;
  return NAV_IDS.has(raw as NavViewId) ? (raw as NavViewId) : null;
}

export function parseGhgGasCode(raw: string | null): GhgGasCode | null {
  if (!raw) return null;
  const u = raw.trim().toUpperCase();
  return GHG_GAS_CODES.has(u as GhgGasCode) ? (u as GhgGasCode) : null;
}

export function parsePersonaId(raw: string | null): PersonaId | null {
  if (!raw) return null;
  return PERSONA_IDS.has(raw as PersonaId) ? (raw as PersonaId) : null;
}

export function parsePositiveInt(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseReportingYear(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 2020 || n > 2035) return null;
  return n;
}

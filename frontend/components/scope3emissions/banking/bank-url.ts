import type { BankNavViewId, BankPersonaId, CarbonLensLeafId } from "./types";
import { ALL_CARBON_LENS_LEAVES, type CarbonLensGroupId } from "./carbonLensNav";

const NAV_IDS = new Set<BankNavViewId>([
  "executive",
  "carbon_lens",
  "financed_emissions",
  "green_finance",
  "climate_risk",
  "controls_audit",
  "ai_insights",
  "reports",
  "upstream_downstream",
  "sectors",
  "ghg_tracking",
  "submitted_data",
]);

const LENS_IDS = new Set<CarbonLensLeafId>(ALL_CARBON_LENS_LEAVES);

const GROUP_IDS = new Set<CarbonLensGroupId>(["financed", "own_ops", "green", "climate"]);

const PERSONA_IDS = new Set<BankPersonaId>([
  "cro",
  "esg_officer",
  "corporate_rm",
  "credit_risk_analyst",
  "treasury_pm",
  "compliance_officer",
  "board_member",
  "external_auditor",
  "green_finance_pm",
  "procurement_gm",
]);

export function parseBankNavViewId(raw: string | null): BankNavViewId | null {
  if (!raw) return null;
  return NAV_IDS.has(raw as BankNavViewId) ? (raw as BankNavViewId) : null;
}

export function parseBankPersonaId(raw: string | null): BankPersonaId | null {
  if (!raw) return null;
  return PERSONA_IDS.has(raw as BankPersonaId) ? (raw as BankPersonaId) : null;
}

export function parseCarbonLensLeafId(raw: string | null): CarbonLensLeafId | null {
  if (!raw) return null;
  return LENS_IDS.has(raw as CarbonLensLeafId) ? (raw as CarbonLensLeafId) : null;
}

export function parseCarbonLensGroupId(raw: string | null): CarbonLensGroupId | null {
  if (!raw) return null;
  return GROUP_IDS.has(raw as CarbonLensGroupId) ? (raw as CarbonLensGroupId) : null;
}

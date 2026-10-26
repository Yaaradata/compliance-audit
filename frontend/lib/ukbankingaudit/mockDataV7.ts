/**
 * UK Banking Audit v7 — v6 mock graph plus v7-only operational overlays.
 * Does not edit mockDataV2 (shared by v2–v6).
 */
import mockDataV6 from "@/lib/ukbankingaudit/mockDataV6";
import {
  ALERT_TIER_APPETITES,
  EDD_PAST_DUE_APPETITE,
  FC_TRAINING_POSTURE,
  NAME_SCREENING_SYSTEM_HEALTH,
  TM_SYSTEM_HEALTH,
  TXN_SCREENING_SYSTEM_HEALTH,
  buildAmlAlertTiersByWeek,
  buildSanctionsScreeningMetricsV7,
} from "@/lib/ukbankingaudit/v7/mlroOperationalData";
import { TM_INVESTIGATIONS_SAR_CONVERSION } from "@/lib/ukbankingaudit/v7/exposureData";

type PersonaDisplay = {
  label: string;
  smfDesignation: string;
};

/**
 * v7-only persona label overlay. Ids stay smf17 / mlroWorkspace (router keys).
 * v6 keeps "MLRO (SMF17)" via mockDataV6.
 */
const PERSONA_DISPLAY: Record<string, PersonaDisplay> = {
  smf17: {
    label: "Head of Financial Crime (SMF17)",
    smfDesignation: "SMF17",
  },
};

const personas = (mockDataV6.personas || []).map(
  (p: { id: string; label?: string; smfDesignation?: string | null }) => {
    const display = PERSONA_DISPLAY[p.id];
    if (!display) return p;
    return {
      ...p,
      label: display.label,
      smfDesignation: display.smfDesignation,
    };
  },
);

const navigationItems = (mockDataV6.navigationItems || []).map(
  (n: { id: string; label: string; screen: string; visibleForPersonas: string[] }) => {
    if (n.screen !== "mlroWorkspace") return n;
    return { ...n, label: "Financial Crime Workspace" };
  },
);

const amlAlertTiersByWeek = buildAmlAlertTiersByWeek(mockDataV6.amlAlertsByWeek);
const sanctionsScreeningMetrics = buildSanctionsScreeningMetricsV7(
  mockDataV6.sanctionsScreeningMetrics,
);

export default {
  ...mockDataV6,
  personas,
  navigationItems,
  /** v7-only: EDD past-due appetite / source for Operational Dashboard. */
  eddPastDueAppetite: EDD_PAST_DUE_APPETITE,
  /** v7-only: L1/L2/L3 split of amlAlertsByWeek (tier backlogs sum to openBacklog). */
  amlAlertTiersByWeek,
  alertTierAppetites: ALERT_TIER_APPETITES,
  /** Same object as Operational Dashboard / exposureData — one source. */
  tmInvestigationsSarConversion: TM_INVESTIGATIONS_SAR_CONVERSION,
  /** v7-only: OFSI breach / block / list-lag / hold-time overlay (does not mutate V2). */
  sanctionsScreeningMetrics,
  /** v7-only: TM / txn screening / name screening health (shared shape). */
  systemHealth: {
    tm: TM_SYSTEM_HEALTH,
    txnScreening: TXN_SCREENING_SYSTEM_HEALTH,
    nameScreening: NAME_SCREENING_SYSTEM_HEALTH,
  },
  /** v7-only: FC training — 98.4% from AP-MLRO-2025; overdue is LMS overlay. */
  fcTrainingPosture: FC_TRAINING_POSTURE,
};

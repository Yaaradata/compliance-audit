/**
 * UK Banking Audit v8 — v7 mock graph plus v8-only operational overlays.
 * Does not edit mockDataV2 (shared by v2–v6) or mockDataV7.
 */
import mockDataV7 from "@/lib/ukbankingaudit/mockDataV7";
import {
  ALERT_TIER_APPETITES,
  EDD_PAST_DUE_APPETITE,
  FC_TRAINING_POSTURE,
  NAME_SCREENING_SYSTEM_HEALTH,
  TM_SYSTEM_HEALTH,
  TXN_SCREENING_SYSTEM_HEALTH,
  buildAmlAlertTiersByWeek,
  buildSanctionsScreeningMetricsV8,
} from "@/lib/ukbankingaudit/v8/mlroOperationalData";
import { TM_INVESTIGATIONS_SAR_CONVERSION } from "@/lib/ukbankingaudit/v8/exposureData";

const amlAlertTiersByWeek = buildAmlAlertTiersByWeek(mockDataV7.amlAlertsByWeek);
const sanctionsScreeningMetrics = buildSanctionsScreeningMetricsV8(
  mockDataV7.sanctionsScreeningMetrics,
);

export default {
  ...mockDataV7,
  /** v8-only: EDD past-due appetite / source for Operational Dashboard. */
  eddPastDueAppetite: EDD_PAST_DUE_APPETITE,
  /** v8-only: L1/L2/L3 split of amlAlertsByWeek (tier backlogs sum to openBacklog). */
  amlAlertTiersByWeek,
  alertTierAppetites: ALERT_TIER_APPETITES,
  /** Same object as Operational Dashboard / exposureData — one source. */
  tmInvestigationsSarConversion: TM_INVESTIGATIONS_SAR_CONVERSION,
  /** v8-only: OFSI breach / block / list-lag / hold-time overlay (does not mutate V2). */
  sanctionsScreeningMetrics,
  /** v8-only: TM / txn screening / name screening health (shared shape). */
  systemHealth: {
    tm: TM_SYSTEM_HEALTH,
    txnScreening: TXN_SCREENING_SYSTEM_HEALTH,
    nameScreening: NAME_SCREENING_SYSTEM_HEALTH,
  },
  /** v8-only: FC training — 98.4% from AP-MLRO-2025; overdue is LMS overlay. */
  fcTrainingPosture: FC_TRAINING_POSTURE,
};

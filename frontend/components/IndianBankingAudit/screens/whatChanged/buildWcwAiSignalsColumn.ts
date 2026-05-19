import { getInsight, type AIInsight } from '../../dataModel';
import { classifyAiSignalTier } from '../executiveRiskPosture/v2/aiSignals/classifyAiSignalTier';
import { formatSignalsUpdatedLine } from '../executiveRiskPosture/v2/formatPostureDataAsOf';

/** CRO column display order (consequence, not confidence). */
export const WCW_CRO_COLUMN_IDS = [
  'AII-AI-019-MLRO',
  'AII-AI-003-CTR',
  'AII-AI-005-CKYCR',
] as const;

/** Full review queue for this screen (includes Tier 2 routed to detail zone). */
export const WCW_REVIEW_QUEUE_IDS = [
  'AII-AI-019-MLRO',
  'AII-AI-003-CTR',
  'AII-AI-005-CKYCR',
  'AII-AI-005-CASE502',
] as const;

export type WcwSignalBadgeType = 'ACCOUNTABILITY' | 'REGULATORY' | 'FRAUD' | 'ANOMALY';

export type WcwCroSignalView = {
  insight: AIInsight;
  tier: 1 | 2;
  badgeType: WcwSignalBadgeType;
  displayText: string;
  detailTooltip: string;
  implication: string;
  confidencePct: number;
};

const WCW_CRO_COPY: Record<
  (typeof WCW_CRO_COLUMN_IDS)[number],
  { displayText: string; badgeType: WcwSignalBadgeType; implication: string; tooltipExtra: string }
> = {
  'AII-AI-019-MLRO': {
    displayText: 'MLRO accountability score at 65 — STR clock attestation overdue',
    badgeType: 'ACCOUNTABILITY',
    implication:
      'If unresolved, MLRO accountability score may breach minimum threshold (60) within 14 days',
    tooltipExtra: 'AML-ALRT-2024-00502',
  },
  'AII-AI-003-CTR': {
    displayText: 'CTR submission at breach risk — FIU-IND acknowledgement not received for March cycle',
    badgeType: 'REGULATORY',
    implication: 'CTR submission window closes in 5 days — breach triggers RBI reporting obligation',
    tooltipExtra: 'RC-CTR',
  },
  'AII-AI-005-CKYCR': {
    displayText: 'KYC reporting delay — CKYCR acknowledgement 3 days late, STR SLA at risk',
    badgeType: 'REGULATORY',
    implication: 'STR SLA at risk for March cycle if CKYCR lag continues beyond 48 hours',
    tooltipExtra: 'EV-LOG-CKYCR-127',
  },
};

const TIER2_EVIDENCE_ID = 'AII-AI-005-CASE502';

function buildTooltip(ins: AIInsight, extraRef: string): string {
  const refs = [
    ins.ai_insight_id,
    ins.signal_id,
    extraRef,
    ...ins.cited_evidence_ids,
    ...ins.cited_source_record_ids.slice(0, 2),
  ].filter(Boolean);
  return `Original: ${ins.title}\n\nRefs: ${refs.join(' · ')}`;
}

function enrichCroSignal(ins: AIInsight): WcwCroSignalView | null {
  const copy = WCW_CRO_COPY[ins.ai_insight_id as (typeof WCW_CRO_COLUMN_IDS)[number]];
  if (!copy) return null;
  return {
    insight: ins,
    tier: 1,
    badgeType: copy.badgeType,
    displayText: copy.displayText,
    detailTooltip: buildTooltip(ins, copy.tooltipExtra),
    implication: copy.implication,
    confidencePct: Math.round(ins.confidence * 100),
  };
}

export function buildWcwCroColumnSignals(dismissedIds: ReadonlySet<string>): WcwCroSignalView[] {
  return WCW_CRO_COLUMN_IDS.map((id) => getInsight(id))
    .filter((ins): ins is AIInsight => ins != null)
    .map(enrichCroSignal)
    .filter((s): s is WcwCroSignalView => s != null)
    .filter((s) => !dismissedIds.has(s.insight.ai_insight_id));
}

export type WcwEvidenceQualityFlag = {
  insight: AIInsight;
  displayText: string;
  detailTooltip: string;
};

export function buildWcwEvidenceQualityFlags(): WcwEvidenceQualityFlag[] {
  const ins = getInsight(TIER2_EVIDENCE_ID);
  if (!ins || classifyAiSignalTier(ins) !== 2) return [];
  const confidencePct = Math.round(ins.confidence * 100);
  return [
    {
      insight: ins,
      displayText: `${ins.title} · ${confidencePct}%`,
      detailTooltip: buildTooltip(ins, 'EV-LOG-CASE-502'),
    },
  ];
}

export function buildWcwAiSignalsColumnMeta() {
  const strategicCount = WCW_CRO_COLUMN_IDS.length;
  const queueTier2Count = WCW_REVIEW_QUEUE_IDS.length - strategicCount;
  const totalQueue = WCW_REVIEW_QUEUE_IDS.length;
  return {
    countBadge: `${strategicCount} strategic · ${queueTier2Count} in queue`,
    totalQueue,
    signalsUpdatedLine: formatSignalsUpdatedLine(),
  };
}

export function wcwReviewQueueInsights(): AIInsight[] {
  return WCW_REVIEW_QUEUE_IDS.map((id) => getInsight(id)).filter((ins): ins is AIInsight => ins != null);
}

/** Resolve insights present in catalog for queue integrity. */
export function wcwSignalsCatalogCheck(): number {
  return wcwReviewQueueInsights().length;
}

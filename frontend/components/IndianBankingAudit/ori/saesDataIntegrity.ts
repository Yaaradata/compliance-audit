import { getInsight, issues, pendingAIInsights, seniorManagers, type AIInsight, type SeniorManager } from '../dataModel';

export const SAES_DATA_GAP_TOOLTIP =
  'SAES score below threshold with no open issues logged — possible under-reporting. Review accountability evidence.';

/** SAES < 70 with zero open accountable issues — under-reporting paradox (PASS 6.4). */
export function openAccountableIssueCount(smId: string): number {
  return issues.filter((i) => i.accountable_senior_manager_id === smId && !i.closed_at).length;
}

export function hasSaesDataGap(saes: number, openIssueCount: number): boolean {
  return saes < 70 && openIssueCount === 0;
}

export function seniorManagersWithSaesDataGap(): SeniorManager[] {
  return seniorManagers.filter((sm) => hasSaesDataGap(sm.saes, openAccountableIssueCount(sm.senior_manager_id)));
}

const SYNTHETIC_INSIGHT_PREFIX = 'SYN-SAES-GAP-';

/** Tier-2 queue items for SAES / open-issue inconsistency. */
export function buildSaesIntegritySyntheticInsights(): AIInsight[] {
  const now = new Date().toISOString();
  return seniorManagersWithSaesDataGap().map((sm) => ({
    ai_insight_id: `${SYNTHETIC_INSIGHT_PREFIX}${sm.senior_manager_id}`,
    signal_id: `SIG-SAES-GAP-${sm.senior_manager_id}`,
    signal_class: 'accountability_gap',
    title: `Data integrity flag: ${sm.name} SAES score inconsistent with open issue count — review recommended`,
    model_id: 'MDL-ORM-INTEGRITY-001',
    model_version: '1.0.0',
    confidence: 0.78,
    threshold: { alert: 0.6, review: 0.75, action: 0.85 },
    recommendation: `SAES at ${sm.saes} with zero open accountable issues for ${sm.name} — review attestation trail and issue linkage.`,
    risk_if_wrong: 'May indicate under-reported issues or stale accountability evidence.',
    cited_evidence_ids: [],
    cited_source_record_ids: [],
    linked_control_ids: sm.accountable_controls,
    linked_obligation_ids: [],
    linked_issue_ids: [],
    human_approval_status: 'pending',
    human_approval_reason: null,
    fired_at: now,
  }));
}

export function isSyntheticSaesInsight(id: string): boolean {
  return id.startsWith(SYNTHETIC_INSIGHT_PREFIX);
}

export function seniorManagerIdFromSyntheticInsight(insightId: string): string | null {
  if (!isSyntheticSaesInsight(insightId)) return null;
  return insightId.slice(SYNTHETIC_INSIGHT_PREFIX.length) || null;
}

/** Resolve insight from review queue (synthetic SAES flags + pending catalog). */
export function getReviewQueueInsight(insightId: string | null): AIInsight | undefined {
  if (!insightId) return undefined;
  return allReviewQueueInsights().find((i) => i.ai_insight_id === insightId) ?? getInsight(insightId) ?? undefined;
}

/** Pending mock insights plus synthetic tier-2 integrity flags. */
export function allReviewQueueInsights(): AIInsight[] {
  return [...buildSaesIntegritySyntheticInsights(), ...pendingAIInsights()];
}

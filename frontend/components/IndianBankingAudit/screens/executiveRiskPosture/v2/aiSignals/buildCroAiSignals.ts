import { pendingAIInsights, type AIInsight } from '../../../../dataModel';
import { allReviewQueueInsights } from '../../../../ori/saesDataIntegrity';
import { classifyAiSignalTier } from './classifyAiSignalTier';
import { resolveSignalDomainIds } from './resolveSignalDomains';
import { buildSignalDetailTooltip, rewriteAiSignalText, truncateSignalWords } from './rewriteAiSignalText';
import type { CroAiSignalView } from './types';

function signalBadgeLabel(ins: AIInsight): string {
  const t = ins.title.toLowerCase();
  if (/mule|fraud|upi|ring/.test(t)) return 'FRAUD';
  if (/ctr|str|fiu|clock|pmla|regulatory|ckycr|kyc reporting/.test(t)) return 'REGULATORY';
  if (/mlro|saes|accountability|attestation/.test(t)) return 'ACCOUNTABILITY';
  if (ins.signal_class === 'effectiveness_decay' || /ces|control/.test(t)) return 'CONTROL';
  if (ins.signal_class === 'cluster_rca' || /kfs|systemic/.test(t)) return 'CONTROL';
  return 'STRATEGIC';
}

function signalPriority(ins: AIInsight, tier: 1 | 2): number {
  let score = ins.confidence * 100;
  if (tier === 1) score += 50;
  if (ins.confidence >= ins.threshold.action) score += 20;
  if (/mule|str|ctr|mlro|11,118/.test(ins.title.toLowerCase())) score += 15;
  return score;
}

function enrichInsight(ins: AIInsight, opts?: { stripWords?: number }): CroAiSignalView {
  const tier = classifyAiSignalTier(ins);
  const rewritten = rewriteAiSignalText(ins);
  const cap = opts?.stripWords;
  return {
    insight: ins,
    tier,
    badgeLabel: signalBadgeLabel(ins),
    displayText: cap != null ? truncateSignalWords(rewritten, cap) : rewritten,
    detailTooltip: buildSignalDetailTooltip(ins, rewritten),
    domainIds: resolveSignalDomainIds(ins),
    priority: signalPriority(ins, tier),
  };
}

/** All tier-1 strategic signals (heatmap / legacy strip). */
export function buildAllTier1SummarySignals(): CroAiSignalView[] {
  return pendingAIInsights()
    .map((ins) => enrichInsight(ins))
    .filter((s) => s.tier === 1)
    .sort((a, b) => b.priority - a.priority);
}

/** Full pending review queue for AI Summary Wall — matches Review queue (N) link. */
export function buildAllReviewQueueSummarySignals(): CroAiSignalView[] {
  return allReviewQueueInsights()
    .map((ins) => enrichInsight(ins))
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.priority - a.priority;
    });
}

export function buildTier1CroStripSignals(dismissedIds: ReadonlySet<string>, maxVisible = 3): CroAiSignalView[] {
  return pendingAIInsights()
    .map((ins) => enrichInsight(ins, { stripWords: 12 }))
    .filter((s) => s.tier === 1 && !dismissedIds.has(s.insight.ai_insight_id))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxVisible);
}

/** All active tier-1 signals (not dismissed) for heatmap ✨ — not limited to strip cap. */
export function buildTier1DomainSignalMap(
  dismissedIds: ReadonlySet<string>,
  opts?: { stripWords?: number }
): Map<string, string> {
  const enrichOpts = opts?.stripWords != null ? { stripWords: opts.stripWords } : undefined;
  const map = new Map<string, string>();
  pendingAIInsights()
    .map((ins) => enrichInsight(ins, enrichOpts))
    .filter((s) => s.tier === 1 && !dismissedIds.has(s.insight.ai_insight_id))
    .sort((a, b) => b.priority - a.priority)
    .forEach((s) => {
      for (const domainId of s.domainIds) {
        if (!map.has(domainId)) map.set(domainId, s.displayText);
      }
    });
  return map;
}

export function pendingAiQueueCount(): number {
  return allReviewQueueInsights().length;
}

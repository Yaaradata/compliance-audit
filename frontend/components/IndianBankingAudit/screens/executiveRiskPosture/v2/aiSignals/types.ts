import type { AIInsight } from '../../../../dataModel';

export type AiSignalTier = 1 | 2;

export type CroAiSignalView = {
  insight: AIInsight;
  tier: AiSignalTier;
  badgeLabel: string;
  /** Max ~12 words for strip pill (risk implication — finding). */
  displayText: string;
  /** Original title + IDs for hover. */
  detailTooltip: string;
  domainIds: string[];
  priority: number;
};

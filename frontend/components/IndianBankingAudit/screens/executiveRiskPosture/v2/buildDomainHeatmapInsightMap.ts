import { buildRiskDetailViewModel } from '../../../drawer/riskDetail/buildRiskDetailViewModel';
import type { DomainHeatmapCell } from '../types';
import { buildTier1DomainSignalMap } from './aiSignals/buildCroAiSignals';

/** Per-domain AI insight line for heatmap tiles (tier-1 signal or risk flyout insight). */
export function buildDomainHeatmapInsightMap(
  domains: DomainHeatmapCell[],
  dismissedIds: ReadonlySet<string>
): Map<string, string> {
  const tier1ByDomain = buildTier1DomainSignalMap(dismissedIds);
  const insights = new Map<string, string>();

  for (const cell of domains) {
    const strategic = tier1ByDomain.get(cell.domainId);
    if (strategic) {
      insights.set(cell.domainId, strategic);
      continue;
    }

    if (cell.primaryRiskId) {
      const vm = buildRiskDetailViewModel(cell.primaryRiskId);
      if (vm?.aiInsight) {
        insights.set(cell.domainId, vm.aiInsight);
        continue;
      }
    }

    insights.set(
      cell.domainId,
      `Residual posture at RES ${cell.resScore} — monitor linked controls through next assessment cycle`
    );
  }

  return insights;
}

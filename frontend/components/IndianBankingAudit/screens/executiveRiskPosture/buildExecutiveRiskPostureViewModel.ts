import { buildAtRiskClockCount, buildDomainHeatmapCells } from './buildSharedPostureData';
import { buildClassicMetrics } from './buildClassicMetrics';
import { buildCompactMetrics } from './buildCompactMetrics';
import type { ExecutiveRiskPostureViewModel } from './types';

export function buildExecutiveRiskPostureViewModel(): ExecutiveRiskPostureViewModel {
  return {
    classicMetrics: buildClassicMetrics(),
    compactMetrics: buildCompactMetrics(),
    domains: buildDomainHeatmapCells(),
    atRiskClockCount: buildAtRiskClockCount(),
  };
}

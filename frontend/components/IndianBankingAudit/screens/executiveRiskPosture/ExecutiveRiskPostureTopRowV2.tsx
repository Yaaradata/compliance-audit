'use client';

import type { OpenDrawer, SetActiveScreen } from '../../types';
import { AiPredictiveSignalsPanel } from './AiPredictiveSignalsPanel';
import { MetricStripCompact } from './MetricStripCompact';
import type { CompactPostureMetric } from './types';

/**
 * v2 executive cockpit hero — KPI cards (left) beside AI signals (right).
 */
export function ExecutiveRiskPostureTopRowV2({
  metrics,
  openDrawer,
  setActiveScreen,
}: {
  metrics: CompactPostureMetric[];
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
      <MetricStripCompact metrics={metrics} />
      <AiPredictiveSignalsPanel openDrawer={openDrawer} setActiveScreen={setActiveScreen} />
    </div>
  );
}

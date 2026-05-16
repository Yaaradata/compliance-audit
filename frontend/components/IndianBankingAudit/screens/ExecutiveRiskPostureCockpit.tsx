'use client';

import { useMemo } from 'react';
import type { OpenDrawer, OrmCrossNavIntent, SetActiveScreen } from '../types';
import { buildExecutiveRiskPostureViewModel } from './executiveRiskPosture/buildExecutiveRiskPostureViewModel';
import { ExecutiveRiskPostureExtendedPanels } from './executiveRiskPosture/ExecutiveRiskPostureExtendedPanels';
import { MetricStrip } from './executiveRiskPosture/MetricStrip';
import { RiskDomainHeatmap } from './executiveRiskPosture/RiskDomainHeatmap';
import type { DomainHeatmapCell } from './executiveRiskPosture/types';

export function ExecutiveRiskPostureCockpit({
  openDrawer,
  setActiveScreen,
  goOrm,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
  goOrm: (intent: OrmCrossNavIntent) => void;
}) {
  const viewModel = useMemo(() => buildExecutiveRiskPostureViewModel(), []);

  const handleDomainSelect = (cell: DomainHeatmapCell) => {
    if (cell.primaryRiskId) {
      openDrawer('risk', cell.primaryRiskId, 'riskPosture');
    }
  };

  return (
    <div className="space-y-5">
      <MetricStrip metrics={viewModel.metrics} />

      <RiskDomainHeatmap
        domains={viewModel.domains}
        atRiskClockCount={viewModel.atRiskClockCount}
        onDomainSelect={handleDomainSelect}
      />

      <ExecutiveRiskPostureExtendedPanels openDrawer={openDrawer} setActiveScreen={setActiveScreen} goOrm={goOrm} />
    </div>
  );
}

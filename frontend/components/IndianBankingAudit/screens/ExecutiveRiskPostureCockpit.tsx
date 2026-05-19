'use client';

import { useMemo } from 'react';
import { useOriVersion } from '../ori/OriVersionProvider';
import type { OpenDrawer, OrmCrossNavIntent, SetActiveScreen } from '../types';
import { buildExecutiveRiskPostureViewModel } from './executiveRiskPosture/buildExecutiveRiskPostureViewModel';
import { ExecutiveRiskPostureExtendedPanels } from './executiveRiskPosture/ExecutiveRiskPostureExtendedPanels';
import { ExecutiveRiskPostureCockpitV2 } from './executiveRiskPosture/v2/ExecutiveRiskPostureCockpitV2';
import { MetricStripClassic } from './executiveRiskPosture/MetricStripClassic';
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
  const { version } = useOriVersion();
  const viewModel = useMemo(() => buildExecutiveRiskPostureViewModel(), []);

  if (version === 'v2') {
    return (
      <ExecutiveRiskPostureCockpitV2
        openDrawer={openDrawer}
        setActiveScreen={setActiveScreen}
        goOrm={goOrm}
      />
    );
  }

  const handleDomainSelect = (cell: DomainHeatmapCell) => {
    if (cell.primaryRiskId) {
      openDrawer('risk', cell.primaryRiskId, 'riskPosture');
    }
  };

  return (
    <div className="space-y-5">
      <MetricStripClassic metrics={viewModel.classicMetrics} />

      <RiskDomainHeatmap
        domains={viewModel.domains}
        atRiskClockCount={viewModel.atRiskClockCount}
        onDomainSelect={handleDomainSelect}
      />

      <ExecutiveRiskPostureExtendedPanels
        openDrawer={openDrawer}
        setActiveScreen={setActiveScreen}
        goOrm={goOrm}
      />
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import type { OpenDrawer, OrmCrossNavIntent, SetActiveScreen } from '../../../types';
import { buildExecutiveRiskPostureViewModel } from '../buildExecutiveRiskPostureViewModel';
import type { DomainHeatmapCell } from '../types';
import { AiSignalsStrip, useAiSignalsDismissed } from './AiSignalsStrip';
import { buildTier1DomainSignalMap } from './aiSignals/buildCroAiSignals';
import { buildDomainHeatmapInsightMap } from './buildDomainHeatmapInsightMap';
import { buildV2PrimaryKpiMetrics } from './buildV2BannerMetrics';
import { CockpitPageHeader } from './CockpitPageHeader';
import { COCKPIT, COCKPIT_SURFACE } from './cockpitTokens';
import { ABOVE_FOLD_LEFT_PCT, ABOVE_FOLD_RIGHT_PCT } from './constants';
import { ExecutiveRiskPostureScrollZone2 } from './ExecutiveRiskPostureScrollZone2';
import { KpiBannerStrip } from './KpiBannerStrip';
import { RiskDomainHeatmapCompact } from './RiskDomainHeatmapCompact';

/**
 * v2 Executive Risk Posture — single scroll page:
 * KPI + AI Summary Wall → detail panels → heatmap last.
 */
export function ExecutiveRiskPostureCockpitV2({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
  goOrm?: (intent: OrmCrossNavIntent) => void;
}) {
  const { dismissedIds } = useAiSignalsDismissed();
  const viewModel = useMemo(() => buildExecutiveRiskPostureViewModel(), []);
  const primaryKpis = useMemo(() => buildV2PrimaryKpiMetrics(viewModel.domains), [viewModel.domains]);
  const tier1SignalByDomain = useMemo(
    () => buildTier1DomainSignalMap(dismissedIds, { stripWords: 12 }),
    [dismissedIds]
  );
  const domainInsightByDomain = useMemo(
    () => buildDomainHeatmapInsightMap(viewModel.domains, dismissedIds),
    [viewModel.domains, dismissedIds]
  );
  const handleDomainSelect = (cell: DomainHeatmapCell) => {
    if (cell.primaryRiskId) {
      openDrawer('risk', cell.primaryRiskId, 'riskPosture');
    }
  };

  return (
    <div className="w-full pb-8" style={{ backgroundColor: COCKPIT.pageBg }}>
      <CockpitPageHeader />

      <div className={`mt-3 flex ${COCKPIT_SURFACE.pagePadX} gap-3`}>
        <div className="shrink-0 pr-2" style={{ width: `${ABOVE_FOLD_LEFT_PCT}%` }}>
          <KpiBannerStrip metrics={primaryKpis} />
        </div>
        <div className="min-w-0 shrink-0" style={{ width: `${ABOVE_FOLD_RIGHT_PCT}%` }}>
          <AiSignalsStrip openDrawer={openDrawer} setActiveScreen={setActiveScreen} />
        </div>
      </div>

      <ExecutiveRiskPostureScrollZone2 openDrawer={openDrawer} setActiveScreen={setActiveScreen} />

      <div className={`mt-3 pb-5 ${COCKPIT_SURFACE.pagePadX}`}>
        <RiskDomainHeatmapCompact
          domains={viewModel.domains}
          domainInsightByDomain={domainInsightByDomain}
          tier1SignalByDomain={tier1SignalByDomain}
          atRiskClockCount={viewModel.atRiskClockCount}
          onDomainSelect={handleDomainSelect}
        />
      </div>
    </div>
  );
}

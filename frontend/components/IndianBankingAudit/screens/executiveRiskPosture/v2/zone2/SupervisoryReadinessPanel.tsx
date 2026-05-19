'use client';

import { useMemo } from 'react';
import { COCKPIT, COCKPIT_SURFACE } from '../cockpitTokens';
import type { OpenDrawer, SetActiveScreen } from '../../../../types';
import type { SupervisoryLensRow } from './buildZone2PostureData';
import { buildSupervisoryBarPlotModel } from './supervisoryReadiness/buildSupervisoryBarPlotModel';
import { SupervisoryReadinessBarPlot } from './supervisoryReadiness/SupervisoryReadinessBarPlot';

/** Compact supervisory ARS bar plot — top-aligned with governance / watchlist row. */
export function SupervisoryReadinessPanel({
  lenses,
  openDrawer,
  setActiveScreen,
}: {
  lenses: SupervisoryLensRow[];
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const plotRows = useMemo(() => buildSupervisoryBarPlotModel(lenses), [lenses]);

  return (
    <div
      style={{ backgroundColor: COCKPIT.cardBg, borderColor: COCKPIT.cardBorder }}
      className={`flex h-full min-h-0 w-full flex-col ${COCKPIT_SURFACE.card} ${COCKPIT_SURFACE.cardPad}`}
    >
      <div className="mb-2.5 flex shrink-0 items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#111827]">Supervisory readiness</h3>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-indigo-600 hover:underline"
          onClick={() => setActiveScreen('inspectionReadiness')}
        >
          View inspection readiness →
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <SupervisoryReadinessBarPlot rows={plotRows} openDrawer={openDrawer} setActiveScreen={setActiveScreen} />
      </div>
    </div>
  );
}

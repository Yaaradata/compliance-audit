'use client';

import type { KRI } from '../../dataModel';
import type { DrillFromDrawer, OpenDrawer } from '../../types';
import { KriAiSummaryWall } from './KriAiSummaryWall';
import {
  KRI_DASHBOARD_GRID_CELL,
  KRI_DASHBOARD_GRID_CLASS,
  KRI_DASHBOARD_TITLE_CELL,
  KRI_DASHBOARD_WALL_CELL,
} from './kriMonitoringLayout';
import { KriMonitoringGrid } from './KriMonitoringGrid';
import { useKriThreeLayerHeight } from './useKriThreeLayerHeight';

/** Domain dashboard: KRI grid (left) + AI wall matched to first 3 tile layers (right). */
export function KriMonitoringDashboard({
  kris,
  openDrawer,
  drillFromDrawer,
}: {
  kris: KRI[];
  openDrawer: OpenDrawer;
  drillFromDrawer: DrillFromDrawer;
}) {
  const { gridRef, heightPx } = useKriThreeLayerHeight();

  return (
    <div className={KRI_DASHBOARD_GRID_CLASS}>
      <header className={KRI_DASHBOARD_TITLE_CELL}>
        <h2 className="text-base font-bold text-[#111827]">Domain KRI dashboard</h2>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          One tile per ORM domain · 12-week trend · threshold bands from latest observation
        </p>
      </header>

      <div className={KRI_DASHBOARD_GRID_CELL}>
        <KriMonitoringGrid
          ref={gridRef}
          kris={kris}
          openDrawer={openDrawer}
          drillFromDrawer={drillFromDrawer}
        />
      </div>

      <div className={KRI_DASHBOARD_WALL_CELL}>
        <KriAiSummaryWall kris={kris} openDrawer={openDrawer} heightPx={heightPx} />
      </div>
    </div>
  );
}

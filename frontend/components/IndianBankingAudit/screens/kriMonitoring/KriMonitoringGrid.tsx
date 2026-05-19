'use client';

import { forwardRef } from 'react';
import type { KRI } from '../../dataModel';
import { KriTile } from './KriTile';
import type { DrillFromDrawer, OpenDrawer } from '../../types';

/** 3-column KRI tile grid (title lives in parent layout for wall alignment). */
export const KriMonitoringGrid = forwardRef<
  HTMLDivElement,
  {
    kris: KRI[];
    openDrawer: OpenDrawer;
    drillFromDrawer: DrillFromDrawer;
  }
>(function KriMonitoringGrid({ kris, openDrawer, drillFromDrawer }, ref) {
  return (
    <div ref={ref} className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {kris.map((k) => (
        <KriTile
          key={k.kri_id}
          kri={k}
          onOpen={() => openDrawer('kri', k.kri_id, 'kriMonitoring')}
          onRiskClick={(riskId) => drillFromDrawer('risk', riskId)}
          onOwnerClick={(smId) => drillFromDrawer('seniorManager', smId)}
        />
      ))}
    </div>
  );
});

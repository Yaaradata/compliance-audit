'use client';

import { featuresForVersion } from '../ori/oriVersionConfig';
import { useOriVersion } from '../ori/OriVersionProvider';
import { KriMonitoringClassic } from './v1/KriMonitoringClassic';
import { KriMonitoringV2 } from './KriMonitoringV2';
import type { DrillFromDrawer, OpenDrawer } from '../types';

/** Routes to v1 classic cards or v2 domain dashboard + AI wall. */
export function KriMonitoring({
  openDrawer,
  drillFromDrawer,
}: {
  openDrawer: OpenDrawer;
  drillFromDrawer: DrillFromDrawer;
}) {
  const { version } = useOriVersion();
  if (!featuresForVersion(version).kriDashboardV2) {
    return <KriMonitoringClassic openDrawer={openDrawer} drillFromDrawer={drillFromDrawer} />;
  }
  return <KriMonitoringV2 openDrawer={openDrawer} drillFromDrawer={drillFromDrawer} />;
}

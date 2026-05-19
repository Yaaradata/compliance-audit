'use client';

import type { OpenDrawer, SetActiveScreen } from '../../../types';
import { COCKPIT, COCKPIT_SURFACE } from './cockpitTokens';
import { GovernanceHealthStrip } from './zone2/GovernanceHealthStrip';
import { IssueWatchlistPanel } from './zone2/IssueWatchlistPanel';
import { SupervisoryReadinessPanel } from './zone2/SupervisoryReadinessPanel';
import { useZone2PostureData } from './useZone2PostureData';

/** Mid-page panels — governance & issues left, scrollable supervisory right. */
export function ExecutiveRiskPostureScrollZone2({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const data = useZone2PostureData(setActiveScreen);

  return (
    <section
      aria-label="Executive posture detail"
      className={`${COCKPIT_SURFACE.pagePadX} ${COCKPIT_SURFACE.sectionPy}`}
      style={{ backgroundColor: COCKPIT.pageBg }}
    >
      <div className={`grid items-stretch ${COCKPIT_SURFACE.sectionGap} lg:grid-cols-[minmax(0,58%)_minmax(0,42%)]`}>
        <div className={`flex flex-col ${COCKPIT_SURFACE.sectionGap}`}>
          <GovernanceHealthStrip metrics={data.governanceMetrics} rtsContextLine={data.rtsContextLine} />
          <IssueWatchlistPanel
            topIssues={data.topIssues}
            resolveOwnerRole={data.resolveIssueOwner}
            openDrawer={openDrawer}
          />
        </div>

        <SupervisoryReadinessPanel
          lenses={data.supervisoryLenses}
          openDrawer={openDrawer}
          setActiveScreen={setActiveScreen}
        />
      </div>
    </section>
  );
}

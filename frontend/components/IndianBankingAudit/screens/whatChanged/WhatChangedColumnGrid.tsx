'use client';

import { ControlFailuresColumn } from './ControlFailuresColumn';
import { AiSignalsColumn } from './AiSignalsColumn';
import { NewIssuesColumn } from './NewIssuesColumn';
import { ReportingBreachesColumn } from './ReportingBreachesColumn';
import type { OpenDrawer, SetActiveScreen } from '../../types';

/** Zone 1 — four equal columns (KRI band changes data kept in hook for Pass 2 / zone 2). */
export function WhatChangedColumnGrid({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {

  return (
    <div className="wcw-column-grid">
      <NewIssuesColumn openDrawer={openDrawer} />
      <ControlFailuresColumn openDrawer={openDrawer} />
      <ReportingBreachesColumn />
      <AiSignalsColumn openDrawer={openDrawer} setActiveScreen={setActiveScreen} />
    </div>
  );
}

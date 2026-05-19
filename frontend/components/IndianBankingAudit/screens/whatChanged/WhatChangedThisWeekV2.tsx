'use client';

import { useEffect } from 'react';
import type { OpenDrawer, SetActiveScreen } from '../../types';
import './wcwLayout.css';
import { WhatChangedAiSummaryPanel } from './WhatChangedAiSummaryPanel';
import { WhatChangedColumnGrid } from './WhatChangedColumnGrid';
import { WhatChangedDetailZone } from './WhatChangedDetailZone';
import { WhatChangedPageHeader } from './WhatChangedPageHeader';
import { runWcwDataIntegrityChecks } from './wcwDataIntegrity';

/**
 * Pass 1–6 — two-scroll What Changed This Week (v2).
 * Zone 0: header · Zone 1: fold (AI summary + 4 columns) · Zone 2: one-down detail.
 */
export function WhatChangedThisWeekV2({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  useEffect(() => {
    runWcwDataIntegrityChecks();
  }, []);

  return (
    <div className="wcw-page-shell flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden bg-[#ECEEF2]">
      <WhatChangedPageHeader />

      <section
        id="wcw-zone1"
        className="wcw-scroll-zone-1 box-border flex w-full min-w-0 flex-col px-12 pb-6 pt-6"
      >
        <WhatChangedAiSummaryPanel />
        <WhatChangedColumnGrid openDrawer={openDrawer} setActiveScreen={setActiveScreen} />
      </section>

      <WhatChangedDetailZone openDrawer={openDrawer} />
    </div>
  );
}

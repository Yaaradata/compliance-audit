'use client';

import { useEffect, useState } from 'react';
import { getPostureDataRefreshAt } from '../../../dataModel';
import { POSTURE_DATA_REFRESH_CADENCE_MINUTES } from './constants';
import { formatPostureDataAsOfLine } from './formatPostureDataAsOf';

/** Page title + auto-refreshing data-as-of line for v2 posture cockpit. */
export function CockpitPageHeader() {
  const [asOfLine, setAsOfLine] = useState(() => formatPostureDataAsOfLine());

  useEffect(() => {
    const refresh = () => setAsOfLine(formatPostureDataAsOfLine(getPostureDataRefreshAt(POSTURE_DATA_REFRESH_CADENCE_MINUTES)));
    refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="shrink-0 px-8 pt-4">
      <h1 className="text-2xl font-bold text-[#111827]">Executive Risk Posture Cockpit</h1>
      <p className="mt-1 text-xs text-[#6B7280]" suppressHydrationWarning>
        {asOfLine}
      </p>
    </header>
  );
}

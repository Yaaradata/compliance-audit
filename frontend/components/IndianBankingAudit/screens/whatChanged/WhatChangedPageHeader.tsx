'use client';

import { formatWeekRangeLabel, getWeekRange } from './formatWeekRange';

/** Zone 0 — fixed page title block (breadcrumb lives in OriBreadcrumb above). */
export function WhatChangedPageHeader() {
  const { start, end } = getWeekRange();
  const weekLabel = formatWeekRangeLabel(start, end);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-[#E5E7EB] bg-white px-12 py-4">
      <h1 className="wcw-page-title">What Changed This Week</h1>
      <p className="wcw-page-subtitle">
        Week-on-week deltas across issues, controls, reporting, and AI signals · Week of {weekLabel}
      </p>
    </header>
  );
}

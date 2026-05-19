'use client';

import { useEffect, useState } from 'react';

function formatLastUpdated() {
  return new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Sticky sub-header for Scroll Zone 2. */
export function ScrollZone2StickyHeader() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdated(formatLastUpdated());
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-9 shrink-0 items-center justify-between gap-3 border-b border-[#F3F4F6] bg-white px-12 text-xs">
      <p className="truncate text-[#6B7280]">
        Executive Risk Posture Cockpit —{' '}
        <span suppressHydrationWarning>Last updated: {lastUpdated ?? '—'}</span>
      </p>
      <a href="#ori-scroll-zone-1" className="shrink-0 text-xs font-medium text-indigo-600 hover:underline">
        Back to top ↑
      </a>
    </header>
  );
}

'use client';

import React, { createContext, useContext } from 'react';

/** Populated while guided demo is active; screens read hints for scroll/filters. */
export type OriDemoUiHints = {
  step: number;
  scrollToKriId: string | null;
  /** Incident register: restrict to types + discovered on/after timestamp */
  incidentFilter: { incidentTypes: string[]; minDiscoveredTs: number } | null;
  forcedPacNoteId: string | null;
  /** After PAC detail mounts, scroll to blocking PAs panel */
  scrollPacBlocking: boolean;
  /** RCA workspace: ring / scroll target PA row */
  highlightPreventiveActionId: string | null;
};

const Ctx = createContext<OriDemoUiHints | null>(null);

export function OriDemoProvider({ value, children }: { value: OriDemoUiHints | null; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOriDemoHints(): OriDemoUiHints | null {
  return useContext(Ctx);
}

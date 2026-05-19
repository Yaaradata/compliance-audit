'use client';

import React, { createContext, useContext, useMemo, useRef } from 'react';
import type { ScreenCode } from '../AppShell';

type AcronymExpansionContextValue = {
  /** First acronym id claimed on this screen gets inline expansion; stable across re-renders. */
  claimFirstExpansion: (key: string) => boolean;
};

const AcronymExpansionContext = createContext<AcronymExpansionContextValue | null>(null);

/** Resets first-use acronym expansion when the active screen changes (PASS 6.6). */
export function AcronymExpansionProvider({
  screenKey,
  children,
}: {
  screenKey: ScreenCode | string;
  children: React.ReactNode;
}) {
  const firstIdRef = useRef<string | null>(null);

  const value = useMemo(() => {
    firstIdRef.current = null;
    return {
      claimFirstExpansion: (key: string) => {
        if (firstIdRef.current === null) {
          firstIdRef.current = key;
          return true;
        }
        return firstIdRef.current === key;
      },
    };
  }, [screenKey]);

  return <AcronymExpansionContext.Provider value={value}>{children}</AcronymExpansionContext.Provider>;
}

function useAcronymExpansion() {
  return useContext(AcronymExpansionContext);
}

export function AcronymLabel({
  id,
  short,
  expanded,
  tooltip,
  className = '',
}: {
  id: string;
  short: string;
  expanded: string;
  tooltip?: string;
  className?: string;
}) {
  const ctx = useAcronymExpansion();
  const displayRef = useRef<{ expand: boolean } | null>(null);

  if (displayRef.current === null) {
    displayRef.current = { expand: ctx ? ctx.claimFirstExpansion(id) : false };
  }

  const first = displayRef.current.expand;
  const label = first ? expanded : short;
  const title = tooltip ?? (first ? undefined : expanded);

  return (
    <abbr title={title} className={`cursor-help no-underline ${className}`.trim()}>
      {label}
    </abbr>
  );
}

/** Domain code with full name tooltip (always available). */
export function DomainCodeLabel({ code, fullName, className = '' }: { code: string; fullName: string; className?: string }) {
  return (
    <span title={fullName} className={className}>
      {code}
    </span>
  );
}

export const ACRONYM_TOOLTIPS = {
  res: 'Residual Exposure Score',
  ces: 'Control Effectiveness Score',
  ars: 'Audit Readiness Score',
  saes: 'Senior Accountability Evidence Score',
  aites: 'AI Trust & Evidence Score',
  rts: 'Reporting Timeliness Score',
  pac: 'Preventive Action Confirmation',
  orm: 'Operational Risk Management',
} as const;

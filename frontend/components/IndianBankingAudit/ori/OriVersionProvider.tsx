'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  buildOriRoutes,
  buildRegIntelRoutes,
  kpiVariantForVersion,
  type OriKpiVariant,
  type OriRoutes,
  type OriVersion,
} from './oriVersion';

type OriVersionContextValue = {
  version: OriVersion;
  routes: OriRoutes;
  regIntelRoutes: ReturnType<typeof buildRegIntelRoutes>;
  kpiVariant: OriKpiVariant;
};

const OriVersionContext = createContext<OriVersionContextValue | null>(null);

export function OriVersionProvider({ version, children }: { version: OriVersion; children: ReactNode }) {
  const value = useMemo(() => {
    const routes = buildOriRoutes(version);
    return {
      version,
      routes,
      regIntelRoutes: buildRegIntelRoutes(routes),
      kpiVariant: kpiVariantForVersion(version),
    };
  }, [version]);

  return <OriVersionContext.Provider value={value}>{children}</OriVersionContext.Provider>;
}

export function useOriVersion(): OriVersionContextValue {
  const ctx = useContext(OriVersionContext);
  if (!ctx) {
    throw new Error('useOriVersion must be used within OriVersionProvider');
  }
  return ctx;
}

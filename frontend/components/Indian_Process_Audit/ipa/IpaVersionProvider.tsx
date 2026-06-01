'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { IpaVersion } from './ipaVersion';

const IpaVersionContext = createContext<IpaVersion>('v3');

export function IpaVersionProvider({ version, children }: { version: IpaVersion; children: ReactNode }) {
  const value = useMemo(() => version, [version]);
  return <IpaVersionContext.Provider value={value}>{children}</IpaVersionContext.Provider>;
}

export function useIpaVersion(): IpaVersion {
  return useContext(IpaVersionContext);
}

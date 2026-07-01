"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { UkpaVersion } from "./ukpaVersion";

const UkpaVersionContext = createContext<UkpaVersion>("v1");

export function UkpaVersionProvider({
  version,
  children,
}: {
  version: UkpaVersion;
  children: ReactNode;
}) {
  const value = useMemo(() => version, [version]);
  return <UkpaVersionContext.Provider value={value}>{children}</UkpaVersionContext.Provider>;
}

export function useUkpaVersion(): UkpaVersion {
  return useContext(UkpaVersionContext);
}

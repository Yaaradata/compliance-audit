"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

type HomeDashboardRoleContextValue = {
  /**
   * When `user.role` is null but /dashboard probed per-cycle `/my-role` and found IT SME or L1/L2/L3,
   * this mirrors that role so layout, sidebar, and routing match globally-assigned users.
   */
  homeDerivedRole: UserRole | null;
  setHomeDerivedRole: (r: UserRole | null) => void;
};

const HomeDashboardRoleContext = createContext<HomeDashboardRoleContextValue | null>(null);

function HomeDashboardRoleProviderInner({ children }: { children: React.ReactNode }) {
  const [homeDerivedRole, setHomeDerivedRoleState] = useState<UserRole | null>(null);

  const setHomeDerivedRole = useCallback((r: UserRole | null) => {
    setHomeDerivedRoleState(r);
  }, []);

  const value = useMemo(
    () => ({ homeDerivedRole, setHomeDerivedRole }),
    [homeDerivedRole, setHomeDerivedRole]
  );

  return <HomeDashboardRoleContext.Provider value={value}>{children}</HomeDashboardRoleContext.Provider>;
}

/** Remounts derived-role state when the logged-in user changes (must sit under AuthProvider). */
export function HomeDashboardRoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <HomeDashboardRoleProviderInner key={user?.id ?? "none"}>{children}</HomeDashboardRoleProviderInner>;
}

export function useHomeDashboardRole(): HomeDashboardRoleContextValue {
  const ctx = useContext(HomeDashboardRoleContext);
  if (!ctx) {
    return { homeDerivedRole: null, setHomeDerivedRole: () => {} };
  }
  return ctx;
}

/** Global tenant role: JWT `user.role`, or `it_sme` when derived from cycle assignments on home. */
export function useGlobalRoleForRouting(userRole: UserRole | null | undefined): UserRole | null {
  const { homeDerivedRole } = useHomeDashboardRole();
  return userRole ?? homeDerivedRole ?? null;
}

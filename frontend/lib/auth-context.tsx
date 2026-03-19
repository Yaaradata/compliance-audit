"use client";

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { api } from "./api";
import type { User, UserRole, Tenant } from "./types";

const TOKEN_KEY = "swift_compliance_token";
const USER_KEY = "swift_compliance_user";
const CYCLE_KEY = "active_cycle_id";
const CYCLE_META_KEY = "active_cycle_meta";
const ARCHITECTURE_KEY = "active_architecture_id";

interface ActiveCycleMeta {
  label: string;
  cycle_year: number;
  display_id: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  selectedArchitectureId: string | null;
  activeCycleId: string | null;
  activeCycleMeta: ActiveCycleMeta | null;
}

function loadCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function loadActiveCycleId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CYCLE_KEY);
}

function loadArchitectureId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ARCHITECTURE_KEY);
}

function loadActiveCycleMeta(): ActiveCycleMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CYCLE_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getStoredTenants(): Tenant[] {
  return [];
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole | null, name?: string) => Promise<boolean>;
  signup: (email: string, password: string, role: UserRole | null, name: string, tenantId?: string) => Promise<boolean>;
  logout: () => void;
  setArchitecture: (architectureId: string) => void;
  setActiveCycleId: (id: string | null, meta?: ActiveCycleMeta) => void;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
  tenants: Tenant[];
  addTenant: (input: Omit<Tenant, "id" | "createdAt" | "bankAdmins"> & { initialUsers?: { email: string; name: string; password: string; role: string }[]; bankAdmins?: { email: string; name: string }[] }) => Promise<Tenant>;
  updateTenantAdmins: (tenantId: string, admins: { email: string; name: string }[]) => void;
  addTenantUser: (tenantId: string, user: { email: string; name: string; password: string; role: string }) => Promise<void>;
  loading: boolean;
  /** Effective role for the active cycle. undefined = still loading, null = loaded but no role, string = resolved role. */
  effectiveCycleRole: string | null | undefined;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    selectedArchitectureId: null,
    activeCycleId: null,
    activeCycleMeta: null,
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [effectiveCycleRole, setEffectiveCycleRole] = useState<string | null | undefined>(undefined);
  // Track the last cycle for which the role was successfully resolved to prevent
  // spurious "loading" resets when the user object refreshes (/auth/me) or when
  // setActiveCycleId is called with the same cycle ID.
  const lastResolvedCycleRef = useRef<string | null>(null);

  useEffect(() => {
    const cachedUser = loadCachedUser();
    const cycleId = loadActiveCycleId();
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    if (token && cachedUser) {
      const archId = loadArchitectureId();
      setState({ user: cachedUser, tenant: null, selectedArchitectureId: archId, activeCycleId: cycleId, activeCycleMeta: loadActiveCycleMeta() });
      api.get<{ id: string; email: string; name: string; role: UserRole | null; tenant_id: string | null }>("/auth/me")
        .then((u) => {
          const user: User = { id: u.id, email: u.email, name: u.name, role: u.role, tenantId: u.tenant_id };
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          setState((s) => ({ ...s, user }));
          // Restore architecture from active cycle if we have cycle but no saved architecture (e.g. return visit)
          if (cycleId && !archId) {
            api.get<{ architecture_type: string | null; label: string; cycle_year: number; display_id: string }>(`/assessments/${cycleId}`)
              .then((cycle) => {
                if (cycle.architecture_type) {
                  localStorage.setItem(ARCHITECTURE_KEY, cycle.architecture_type);
                  setState((s) => ({ ...s, selectedArchitectureId: cycle.architecture_type }));
                }
                if (cycle.label && cycle.display_id) {
                  const meta: ActiveCycleMeta = { label: cycle.label, cycle_year: cycle.cycle_year, display_id: cycle.display_id };
                  localStorage.setItem(CYCLE_META_KEY, JSON.stringify(meta));
                  setState((s) => ({ ...s, activeCycleMeta: meta }));
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          api.clearToken();
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(CYCLE_KEY);
          localStorage.removeItem(ARCHITECTURE_KEY);
          localStorage.removeItem(CYCLE_META_KEY);
          setState({ user: null, tenant: null, selectedArchitectureId: null, activeCycleId: null, activeCycleMeta: null });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole | null, _name?: string): Promise<boolean> => {
    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name: string; role: UserRole | null; tenant_id: string | null } }>("/auth/login", { email, password });
      api.setToken(res.token);
      const user: User = { id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role, tenantId: res.user.tenant_id };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, tenant: null, selectedArchitectureId: null, activeCycleId: loadActiveCycleId(), activeCycleMeta: loadActiveCycleMeta() });
      return true;
    } catch {
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, role: UserRole | null, name: string, tenantId?: string): Promise<boolean> => {
    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name: string; role: UserRole | null; tenant_id: string | null } }>("/auth/signup", { email, password, name, role, tenant_id: tenantId });
      api.setToken(res.token);
      const user: User = { id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role, tenantId: res.user.tenant_id };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, tenant: null, selectedArchitectureId: null, activeCycleId: null, activeCycleMeta: null });
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CYCLE_KEY);
    localStorage.removeItem(CYCLE_META_KEY);
    localStorage.removeItem(ARCHITECTURE_KEY);
    setState({ user: null, tenant: null, selectedArchitectureId: null, activeCycleId: null, activeCycleMeta: null });
  }, []);

  const setArchitecture = useCallback((architectureId: string) => {
    if (typeof window !== "undefined") localStorage.setItem(ARCHITECTURE_KEY, architectureId);
    setState((s) => ({ ...s, selectedArchitectureId: architectureId }));
  }, []);

  const setActiveCycleId = useCallback((id: string | null, meta?: ActiveCycleMeta) => {
    if (id) {
      localStorage.setItem(CYCLE_KEY, id);
      setState((prev) => {
        // Only clear the resolved role cache when switching to a DIFFERENT cycle.
        // If the same cycle ID is passed again (e.g. layout re-syncing metadata),
        // we must NOT reset effectiveCycleRole — that causes the stuck-loading bug.
        if (prev.activeCycleId !== id) {
          setEffectiveCycleRole(undefined);
          lastResolvedCycleRef.current = null;
        }
        if (meta) {
          localStorage.setItem(CYCLE_META_KEY, JSON.stringify(meta));
          return { ...prev, activeCycleId: id, activeCycleMeta: meta };
        }
        return { ...prev, activeCycleId: id };
      });
    } else {
      localStorage.removeItem(CYCLE_KEY);
      localStorage.removeItem(CYCLE_META_KEY);
      localStorage.removeItem(ARCHITECTURE_KEY);
      setEffectiveCycleRole(undefined);
      lastResolvedCycleRef.current = null;
      setState((s) => ({ ...s, activeCycleId: null, activeCycleMeta: null, selectedArchitectureId: null }));
    }
  }, []);

  useEffect(() => {
    if (!state.activeCycleId || !state.user) {
      setEffectiveCycleRole(undefined);
      lastResolvedCycleRef.current = null;
      return;
    }

    const cycleId = state.activeCycleId;

    // Only show the loading spinner when the cycle actually changed.
    // When /auth/me refreshes the user object (same cycle), keep the current
    // resolved role visible while we silently re-fetch in the background.
    if (lastResolvedCycleRef.current !== cycleId) {
      setEffectiveCycleRole(undefined);
    }

    let cancelled = false;
    api
      .get<{ role: string | null }>(`/assessments/${cycleId}/my-role`)
      .then((res) => {
        if (cancelled) return;
        const role = res.role ?? null;
        console.log("[auth] my-role resolved:", { cycleId, role });
        setEffectiveCycleRole(role);
        lastResolvedCycleRef.current = cycleId;
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[auth] my-role failed:", err);
        setEffectiveCycleRole(null);
        lastResolvedCycleRef.current = cycleId;
      });

    return () => { cancelled = true; };
  }, [state.activeCycleId, state.user]);

  const addTenant = useCallback(async (input: Omit<Tenant, "id" | "createdAt" | "bankAdmins"> & { initialUsers?: { email: string; name: string; password: string; role: string }[]; bankAdmins?: { email: string; name: string }[] }) => {
    const tenant = await api.post<Tenant>("/tenants", {
      name: input.name,
      slug: input.slug,
      details: input.details,
      initial_users: input.initialUsers?.map((u) => ({ email: u.email, name: u.name, password: u.password, role: u.role })),
      bank_admins: input.bankAdmins,
    });
    setTenants((prev) => [...prev, tenant]);
    return tenant;
  }, []);

  const updateTenantAdmins = useCallback((_tenantId: string, _admins: { email: string; name: string }[]) => {
    // Placeholder for real API call
  }, []);

  const addTenantUser = useCallback(async (tenantId: string, user: { email: string; name: string; password: string; role: string }) => {
    await api.post<{ id: string; email: string; name: string; role: string }>(`/tenants/${tenantId}/users`, user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      signup,
      logout,
      setArchitecture,
      setActiveCycleId,
      isAdmin: state.user?.role === "admin" || state.user?.role === "platform_admin",
      isPlatformAdmin: state.user?.role === "admin" || state.user?.role === "platform_admin" || (state.user != null && state.user.tenantId == null),
      tenants,
      addTenant,
      updateTenantAdmins,
      addTenantUser,
      loading,
      effectiveCycleRole,
    }),
    [state, login, signup, logout, setArchitecture, setActiveCycleId, tenants, addTenant, updateTenantAdmins, addTenantUser, loading, effectiveCycleRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

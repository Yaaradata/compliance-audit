"use client";

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from "react";
import { api } from "./api";
import type { User, UserRole, Tenant } from "./types";

const TOKEN_KEY = "swift_compliance_token";
const USER_KEY = "swift_compliance_user";
const CYCLE_KEY = "active_cycle_id";

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  selectedArchitectureId: string | null;
  activeCycleId: string | null;
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

export function getStoredTenants(): Tenant[] {
  return [];
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole, name?: string) => Promise<boolean>;
  signup: (email: string, password: string, role: UserRole, name: string, tenantId?: string) => Promise<boolean>;
  logout: () => void;
  setArchitecture: (architectureId: string) => void;
  setActiveCycleId: (id: string | null) => void;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
  tenants: Tenant[];
  addTenant: (input: Omit<Tenant, "id" | "createdAt" | "bankAdmins"> & { bankAdmins?: { email: string; name: string }[] }) => Promise<void>;
  updateTenantAdmins: (tenantId: string, admins: { email: string; name: string }[]) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    selectedArchitectureId: null,
    activeCycleId: null,
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedUser = loadCachedUser();
    const cycleId = loadActiveCycleId();
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    if (token && cachedUser) {
      setState({ user: cachedUser, tenant: null, selectedArchitectureId: null, activeCycleId: cycleId });
      api.get<{ id: string; email: string; name: string; role: UserRole; tenant_id: string | null }>("/auth/me")
        .then((u) => {
          const user: User = { id: u.id, email: u.email, name: u.name, role: u.role, tenantId: u.tenant_id };
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          setState((s) => ({ ...s, user }));
        })
        .catch(() => {
          api.clearToken();
          localStorage.removeItem(USER_KEY);
          setState({ user: null, tenant: null, selectedArchitectureId: null, activeCycleId: null });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole, _name?: string): Promise<boolean> => {
    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name: string; role: UserRole; tenant_id: string | null } }>("/auth/login", { email, password });
      api.setToken(res.token);
      const user: User = { id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role, tenantId: res.user.tenant_id };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, tenant: null, selectedArchitectureId: null, activeCycleId: loadActiveCycleId() });
      return true;
    } catch {
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, role: UserRole, name: string, tenantId?: string): Promise<boolean> => {
    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name: string; role: UserRole; tenant_id: string | null } }>("/auth/signup", { email, password, name, role, tenant_id: tenantId });
      api.setToken(res.token);
      const user: User = { id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role, tenantId: res.user.tenant_id };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, tenant: null, selectedArchitectureId: null, activeCycleId: null });
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CYCLE_KEY);
    setState({ user: null, tenant: null, selectedArchitectureId: null, activeCycleId: null });
  }, []);

  const setArchitecture = useCallback((architectureId: string) => {
    setState((s) => ({ ...s, selectedArchitectureId: architectureId }));
  }, []);

  const setActiveCycleId = useCallback((id: string | null) => {
    if (id) localStorage.setItem(CYCLE_KEY, id);
    else localStorage.removeItem(CYCLE_KEY);
    setState((s) => ({ ...s, activeCycleId: id }));
  }, []);

  const addTenant = useCallback(async (input: Omit<Tenant, "id" | "createdAt" | "bankAdmins"> & { bankAdmins?: { email: string; name: string }[] }) => {
    try {
      const tenant = await api.post<Tenant>("/tenants", {
        name: input.name,
        slug: input.slug,
        details: input.details,
        bank_admins: input.bankAdmins,
      });
      setTenants((prev) => [...prev, tenant]);
    } catch (e) {
      console.error("Failed to create tenant", e);
    }
  }, []);

  const updateTenantAdmins = useCallback((_tenantId: string, _admins: { email: string; name: string }[]) => {
    // Placeholder for real API call
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      signup,
      logout,
      setArchitecture,
      setActiveCycleId,
      isAdmin: state.user?.role === "admin",
      isPlatformAdmin: state.user?.role === "admin",
      tenants,
      addTenant,
      updateTenantAdmins,
      loading,
    }),
    [state, login, signup, logout, setArchitecture, setActiveCycleId, tenants, addTenant, updateTenantAdmins, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

"use client";

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from "react";
import type { User, UserRole, Tenant, Architecture } from "./types";

const STORAGE_KEY = "swift_compliance_mock_auth";
const TENANTS_KEY = "swift_compliance_mock_tenants";

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  selectedArchitectureId: string | null;
}

function loadState(): AuthState {
  if (typeof window === "undefined") return { user: null, tenant: null, selectedArchitectureId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, tenant: null, selectedArchitectureId: null };
    const data = JSON.parse(raw) as AuthState;
    return {
      user: data.user ?? null,
      tenant: data.tenant ?? null,
      selectedArchitectureId: data.selectedArchitectureId ?? null,
    };
  } catch {
    return { user: null, tenant: null, selectedArchitectureId: null };
  }
}

function saveState(state: AuthState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function getStoredTenants(): Tenant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TENANTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setStoredTenants(tenants: Tenant[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
  } catch {}
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole, name?: string) => boolean;
  signup: (email: string, password: string, role: UserRole, name: string, tenantId?: string) => boolean;
  logout: () => void;
  setArchitecture: (architectureId: string) => void;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
  tenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, "id" | "createdAt" | "bankAdmins"> & { bankAdmins?: { email: string; name: string }[] }) => void;
  updateTenantAdmins: (tenantId: string, admins: { email: string; name: string }[]) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadState);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    setTenants(getStoredTenants());
  }, []);

  const persist = useCallback((next: AuthState) => {
    setState(next);
    saveState(next);
  }, []);

  const login = useCallback(
    (email: string, _password: string, role: UserRole, name?: string): boolean => {
      const id = `u-${Date.now()}`;
      let allTenants = getStoredTenants();
      if (allTenants.length === 0 && role !== "admin") {
        const demo: Tenant = { id: "t-demo", name: "Demo Bank", slug: "demo-bank", details: "Demo tenant for testing", bankAdmins: [], createdAt: new Date().toISOString() };
        allTenants = [demo];
        setStoredTenants(allTenants);
        setTenants(allTenants);
      }
      const user: User = {
        id,
        email,
        name: name ?? email.split("@")[0],
        role,
        tenantId: role === "admin" ? null : "t-demo",
      };
      const tenant = role === "admin" ? null : allTenants.find((t) => t.id === "t-demo") ?? allTenants[0] ?? null;
      persist({
        user,
        tenant: tenant ?? null,
        selectedArchitectureId: state.selectedArchitectureId,
      });
      return true;
    },
    [persist, state.selectedArchitectureId]
  );

  const signup = useCallback(
    (email: string, _password: string, role: UserRole, name: string, tenantId?: string): boolean => {
      const id = `u-${Date.now()}`;
      const user: User = {
        id,
        email,
        name,
        role,
        tenantId: tenantId ?? (role === "admin" ? null : "t-demo"),
      };
      const allTenants = getStoredTenants();
      const tenant = role === "admin" ? null : allTenants.find((t) => t.id === (tenantId ?? "t-demo")) ?? allTenants[0] ?? null;
      persist({
        user,
        tenant: tenant ?? null,
        selectedArchitectureId: null,
      });
      return true;
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist({ user: null, tenant: null, selectedArchitectureId: null });
  }, [persist]);

  const setArchitecture = useCallback(
    (architectureId: string) => {
      setState((s) => {
        const next = { ...s, selectedArchitectureId: architectureId };
        saveState(next);
        return next;
      });
    },
    []
  );

  const addTenant = useCallback(
    (input: Omit<Tenant, "id" | "createdAt" | "bankAdmins"> & { bankAdmins?: { email: string; name: string }[] }) => {
      const id = `t-${Date.now()}`;
      const tenant: Tenant = {
        id,
        name: input.name,
        slug: input.slug,
        details: input.details,
        bankAdmins: (input.bankAdmins ?? []).map((a, i) => ({ id: `ba-${id}-${i}`, email: a.email, name: a.name })),
        createdAt: new Date().toISOString(),
      };
      const next = [...getStoredTenants(), tenant];
      setStoredTenants(next);
      setTenants(next);
    },
    []
  );

  const updateTenantAdmins = useCallback((tenantId: string, admins: { email: string; name: string }[]) => {
    const next = getStoredTenants().map((t) =>
      t.id === tenantId ? { ...t, bankAdmins: admins.map((a, i) => ({ id: `ba-${t.id}-${i}`, ...a })) } : t
    );
    setStoredTenants(next);
    setTenants(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      signup,
      logout,
      setArchitecture,
      isAdmin: state.user?.role === "admin",
      isPlatformAdmin: state.user?.role === "admin",
      tenants,
      addTenant,
      updateTenantAdmins,
    }),
    [state, login, signup, logout, setArchitecture, tenants, addTenant, updateTenantAdmins]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

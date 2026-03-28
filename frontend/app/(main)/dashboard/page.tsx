"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RoleHomeDashboard,
  ComplianceOfficerHomeDashboard,
  UserHomeDashboard,
} from "@/components/roles";
import { useAuth } from "@/lib/auth-context";
import { useHomeDashboardRole } from "@/lib/home-dashboard-role-context";
import { api } from "@/lib/api";
import type { AssessmentCycle, UserRole } from "@/lib/types";
import type { CycleDashboard, CycleInsight } from "@/components/roles/shared/compliance-types";
import { normalizeRoleForCycle, pickDerivedRoleFromCycleRoles, REVIEWER_HOME_ROLES } from "@/components/roles/shared/utils";

type ComplianceUser = {
  id: string;
  name: string;
};

type RoleAssignment = {
  user_id: string | null;
  assignment_type: string;
};

function DashboardLoadingSkeleton() {
  return (
    <div className="w-full space-y-5 pb-6 animate-pulse">
      <section className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="h-3 w-24 rounded bg-[var(--background)] mb-4" />
        <div className="h-8 w-72 rounded bg-[var(--background)] mb-3" />
        <div className="h-4 w-96 max-w-full rounded bg-[var(--background)]" />
      </section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="h-3 w-20 rounded bg-[var(--background)] mb-3" />
            <div className="h-8 w-14 rounded bg-[var(--background)] mb-2" />
            <div className="h-3 w-28 rounded bg-[var(--background)]" />
          </div>
        ))}
      </div>
      <section className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="h-4 w-36 rounded bg-[var(--background)] mb-4" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="h-28 rounded-xl bg-[var(--background)]" />
          <div className="h-28 rounded-xl bg-[var(--background)]" />
        </div>
      </section>
    </div>
  );
}

/**
 * Pre-cycle home: role-aware overview, stats, and quick actions.
 * New cycles: Compliance Officer dashboard modal; full list at /assessments/new (KPIs / modal link).
 * the per-cycle collection workspace when a cycle is active.
 */
export default function DashboardHomePage() {
  const { user, activeCycleId, activeCycleMeta, setActiveCycleId, loading: authLoading } = useAuth();
  const { setHomeDerivedRole } = useHomeDashboardRole();
  const [cycles, setCycles] = useState<AssessmentCycle[]>([]);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [insights, setInsights] = useState<CycleInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  /**
   * When JWT `user.role` is null, probe /my-role across cycles to derive IT SME or L1/L2/L3 (same as CO-style dashboards).
   * `undefined` = still probing; `null` = probed, no role; otherwise derived tenant role for home + routing.
   */
  const [derivedCycleRole, setDerivedCycleRole] = useState<UserRole | null | undefined>(undefined);
  /** After an optimistic cycle delete, skip the next insights reload so the UI does not flash loading. */
  const skipInsightsReloadRef = useRef(false);

  const handleCycleDeleted = useCallback(
    (cycleId: string) => {
      skipInsightsReloadRef.current = true;
      setCycles((prev) => prev.filter((c) => c.id !== cycleId));
      setInsights((prev) => prev.filter((i) => i.cycle.id !== cycleId));
      if (activeCycleId === cycleId) {
        setActiveCycleId(null);
      }
    },
    [activeCycleId, setActiveCycleId]
  );

  useEffect(() => {
    if (!user) {
      setHomeDerivedRole(null);
      return;
    }
    if (user.role === "it_sme" || user.role === "compliance_officer") {
      setHomeDerivedRole(null);
      return;
    }
    if (user.role === null) {
      if (derivedCycleRole === undefined) return;
      if (derivedCycleRole === "it_sme") setHomeDerivedRole("it_sme");
      else if (derivedCycleRole === "internal_reviewer_l1") setHomeDerivedRole("internal_reviewer_l1");
      else if (derivedCycleRole === "internal_reviewer_l2") setHomeDerivedRole("internal_reviewer_l2");
      else if (derivedCycleRole === "external_assessor") setHomeDerivedRole("external_assessor");
      else setHomeDerivedRole(null);
      return;
    }
    setHomeDerivedRole(null);
  }, [user, user?.role, derivedCycleRole, setHomeDerivedRole]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function loadCycles() {
      setCyclesLoading(true);
      try {
        const data = await api.get<AssessmentCycle[]>("/assessments");
        if (!cancelled) setCycles(data);
      } catch {
        if (!cancelled) setCycles([]);
      } finally {
        if (!cancelled) setCyclesLoading(false);
      }
    }
    void loadCycles();
    return () => {
      cancelled = true;
    };
  }, [user]);

  /**
   * Single effect with a fixed dependency tuple length [user, cycles, cyclesLoading, derivedCycleRole]
   * for probe + insights load (matches IT SME / reviewer derivation when global role is null).
   */
  useEffect(() => {
    if (!user) {
      setInsights([]);
      setInsightsLoading(false);
      setDerivedCycleRole(undefined);
      return;
    }

    if (user.role !== null) {
      if (derivedCycleRole !== null) setDerivedCycleRole(null);
    }

    if (user.role === null && cyclesLoading) {
      return;
    }

    if (user.role === null && cycles.length === 0) {
      setDerivedCycleRole(null);
      setInsights([]);
      setInsightsLoading(false);
      return;
    }

    if (user.role === null && cycles.length > 0 && derivedCycleRole === undefined) {
      let cancelled = false;
      async function probePerCycleRoles() {
        try {
          const roles = await Promise.all(
            cycles.map(async (c) => {
              try {
                const res = await api.get<{ role: string | null }>(`/assessments/${c.id}/my-role`);
                return normalizeRoleForCycle(res.role);
              } catch {
                return null;
              }
            })
          );
          if (cancelled) return;
          setDerivedCycleRole(pickDerivedRoleFromCycleRoles(roles));
        } catch {
          if (!cancelled) setDerivedCycleRole(null);
        }
      }
      void probePerCycleRoles();
      return () => {
        cancelled = true;
      };
    }

    // Only Compliance Officer home needs full cross-cycle insights (users + role assignments).
    const needsInsights = user.role === "compliance_officer";

    if (!needsInsights) {
      if (user.role === null && derivedCycleRole === undefined) {
        return;
      }
      setInsights([]);
      setInsightsLoading(false);
      return;
    }

    if (skipInsightsReloadRef.current) {
      skipInsightsReloadRef.current = false;
      return;
    }

    let cancelled = false;
    async function loadInsights() {
      setInsightsLoading(true);
      let usersById = new Map<string, string>();
      try {
        const users = await api.get<ComplianceUser[]>("/compliance/users");
        usersById = new Map(users.map((u) => [u.id, u.name]));
      } catch {
        usersById = new Map();
      }
      const rows = await Promise.all(
        cycles.map(async (cycle) => {
          try {
            const [dashboard, assignments] = await Promise.all([
              api.get<CycleDashboard>(`/assessments/${cycle.id}/dashboard`),
              api.get<RoleAssignment[]>(`/assessments/${cycle.id}/role-assignments`).catch(() => []),
            ]);
            const userIds = Array.from(
              new Set(assignments.filter((a) => a.assignment_type === "user" && a.user_id).map((a) => a.user_id as string))
            );
            const relatedUsers = userIds
              .map((id) => ({ id, name: usersById.get(id) ?? "Unknown" }))
              .sort((a, b) => a.name.localeCompare(b.name));
            return { cycle, dashboard, relatedUsers } satisfies CycleInsight;
          } catch {
            return { cycle, dashboard: null, relatedUsers: [] } satisfies CycleInsight;
          }
        })
      );
      if (!cancelled) {
        setInsights(rows);
        setInsightsLoading(false);
      }
    }
    void loadInsights();
    return () => {
      cancelled = true;
    };
  }, [user, cycles, cyclesLoading, derivedCycleRole]);

  const probingPerCycleRole =
    user?.role === null && !cyclesLoading && cycles.length > 0 && derivedCycleRole === undefined;
  const waitingForDerivedRole = user?.role === null && (cyclesLoading || derivedCycleRole === undefined);

  const effectiveRole = user?.role ?? derivedCycleRole;

  const loading = useMemo(
    () =>
      Boolean(
        authLoading ||
          cyclesLoading ||
          probingPerCycleRole ||
          (effectiveRole === "compliance_officer" && insightsLoading)
      ),
    [authLoading, cyclesLoading, probingPerCycleRole, insightsLoading, effectiveRole]
  );

  if (authLoading || !user) return <DashboardLoadingSkeleton />;

  // Prevent fallback-dashboard flash while per-cycle role is still resolving.
  if (probingPerCycleRole || waitingForDerivedRole) return <DashboardLoadingSkeleton />;

  if (effectiveRole === "compliance_officer") {
    return (
      <ComplianceOfficerHomeDashboard
        userName={user.name}
        insights={insights}
        loading={loading}
        onCycleDeleted={handleCycleDeleted}
      />
    );
  }

  if (
    effectiveRole === "it_sme" ||
    effectiveRole === "internal_reviewer_l1" ||
    effectiveRole === "internal_reviewer_l2" ||
    effectiveRole === "external_assessor"
  ) {
    return <UserHomeDashboard user={user} cycles={cycles} homeRole={effectiveRole} />;
  }

  return (
    <RoleHomeDashboard
      user={user}
      activeCycleId={activeCycleId}
      activeCycleMeta={activeCycleMeta}
      cycles={cycles}
      loading={loading}
    />
  );
}

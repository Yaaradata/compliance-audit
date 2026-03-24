"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleHomeDashboard, ComplianceOfficerHomeDashboard } from "@/components/roles";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { AssessmentCycle } from "@/lib/types";
import type { CycleDashboard, CycleInsight } from "@/components/roles/shared/compliance-types";

type ComplianceUser = {
  id: string;
  name: string;
};

type RoleAssignment = {
  user_id: string | null;
  assignment_type: string;
};

/**
 * Pre-cycle home: role-aware overview, stats, and quick actions.
 * Assessment cycles remain at /assessments/new; sidebar "Dashboard" still opens
 * the per-cycle collection workspace when a cycle is active.
 */
export default function DashboardHomePage() {
  const { user, activeCycleId, activeCycleMeta, loading: authLoading } = useAuth();
  const [cycles, setCycles] = useState<AssessmentCycle[]>([]);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [insights, setInsights] = useState<CycleInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

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

  useEffect(() => {
    if (!user || user.role !== "compliance_officer") {
      setInsights([]);
      setInsightsLoading(false);
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
  }, [user, cycles]);

  const loading = useMemo(
    () => authLoading || cyclesLoading || (user?.role === "compliance_officer" && insightsLoading),
    [authLoading, cyclesLoading, insightsLoading, user?.role]
  );

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: "var(--foreground-muted)" }}>
        Loading…
      </div>
    );
  }

  if (user.role === "compliance_officer") {
    return <ComplianceOfficerHomeDashboard userName={user.name} insights={insights} loading={loading} />;
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

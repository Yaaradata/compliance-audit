"use client";

import { useEffect, useMemo, useState } from "react";
import type { CycleInsight, CycleReviewStats, EvidenceReviewApiRow } from "@/components/roles/shared/compliance-types";
import {
  DeadlineLinksSection,
  ItExpertCycleInsightsSection,
  ItExpertVisualizationPanel,
  RoleDashboardHero,
  StatKpiArticleGrid,
} from "@/components/roles/shared";
import { daysTo, normalizeRoleForCycle, phaseLabel } from "@/components/roles/shared/utils";
import { api } from "@/lib/api";

export type { CycleInsight } from "@/components/roles/shared/compliance-types";

export function ItExpertHomeDashboard({
  userName,
  insights,
  loading,
}: {
  userName: string;
  insights: CycleInsight[];
  loading: boolean;
}) {
  const firstName = userName.split(/\s+/)[0] ?? "there";
  const [resolvedAssignedIds, setResolvedAssignedIds] = useState<Set<string> | null>(null);
  const [reviewStatsByCycle, setReviewStatsByCycle] = useState<Record<string, CycleReviewStats>>({});
  const [reviewStatsLoading, setReviewStatsLoading] = useState(false);
  const [visualCycleId, setVisualCycleId] = useState<string | null>(null);

  const assignedCycleIds = useMemo((): Set<string> | null => {
    if (insights.length === 0) return new Set();
    return resolvedAssignedIds;
  }, [insights.length, resolvedAssignedIds]);

  useEffect(() => {
    if (insights.length === 0) return;

    let cancelled = false;
    async function resolveAssignedCycles() {
      await Promise.resolve();
      if (cancelled) return;
      setResolvedAssignedIds(null);
      try {
        const rows = await Promise.all(
          insights.map(async (i) => {
            try {
              const res = await api.get<{ role: string | null }>(`/assessments/${i.cycle.id}/my-role`);
              return { cycleId: i.cycle.id, role: normalizeRoleForCycle(res.role) };
            } catch {
              return { cycleId: i.cycle.id, role: null };
            }
          })
        );
        if (cancelled) return;
        const ids = new Set(rows.filter((r) => r.role === "it_sme").map((r) => r.cycleId));
        setResolvedAssignedIds(ids);
      } catch {
        if (!cancelled) setResolvedAssignedIds(new Set());
      }
    }

    void resolveAssignedCycles();
    return () => {
      cancelled = true;
    };
  }, [insights]);

  const assignedInsights = useMemo(() => {
    if (insights.length === 0) return [];
    if (!assignedCycleIds) return insights;
    return insights.filter((i) => assignedCycleIds.has(i.cycle.id));
  }, [insights, assignedCycleIds]);

  const validVisualCycleId = useMemo(() => {
    if (!visualCycleId) return null;
    return assignedInsights.some((i) => i.cycle.id === visualCycleId) ? visualCycleId : null;
  }, [visualCycleId, assignedInsights]);

  useEffect(() => {
    if (!assignedCycleIds || assignedInsights.length === 0) {
      return;
    }
    let cancelled = false;
    async function loadReviewStats() {
      await Promise.resolve();
      if (cancelled) return;
      setReviewStatsLoading(true);
      const entries = await Promise.all(
        assignedInsights.map(async (row) => {
          try {
            const reviews = await api.getDirect<EvidenceReviewApiRow[]>(`/assessments/${row.cycle.id}/reviews`);
            const stats = reviews.reduce<CycleReviewStats>(
              (acc, r) => {
                const s = (r.status ?? "").toLowerCase();
                if (s === "approved") acc.approved += 1;
                else if (s === "returned" || s === "rejected") acc.rejected += 1;
                else if (s === "assigned" || s === "in_review" || s === "hold") acc.inReview += 1;
                return acc;
              },
              { inReview: 0, approved: 0, rejected: 0 }
            );
            return [row.cycle.id, stats] as const;
          } catch {
            return [row.cycle.id, { inReview: 0, approved: 0, rejected: 0 }] as const;
          }
        })
      );
      if (cancelled) return;
      setReviewStatsByCycle(Object.fromEntries(entries));
      setReviewStatsLoading(false);
    }

    void loadReviewStats();
    return () => {
      cancelled = true;
    };
  }, [assignedCycleIds, assignedInsights]);

  const effectiveReviewStats = useMemo(() => {
    if (!assignedCycleIds || assignedInsights.length === 0) return {} as Record<string, CycleReviewStats>;
    return reviewStatsByCycle;
  }, [assignedCycleIds, assignedInsights.length, reviewStatsByCycle]);

  const effectiveReviewStatsLoading = useMemo(() => {
    if (assignedInsights.length === 0 || !assignedCycleIds) return false;
    return reviewStatsLoading;
  }, [assignedInsights.length, assignedCycleIds, reviewStatsLoading]);

  const metrics = useMemo(() => {
    const assignedCycles = assignedInsights.length;
    const inProgressCycles = assignedInsights.filter((row) => {
      const phase = (row.cycle.phase ?? "").toLowerCase();
      return phase !== "submitted" && phase !== "archived";
    }).length;
    const assignedControls = assignedInsights.reduce((acc, row) => acc + (row.dashboard?.total_controls ?? 0), 0);
    const evidenceUploaded = assignedInsights.reduce((acc, row) => acc + (row.dashboard?.evidence_items ?? 0), 0);
    const aiEvaluatedInReview = Object.values(effectiveReviewStats).reduce((acc, s) => acc + s.inReview, 0);
    const inProgressPct = assignedCycles > 0 ? Math.round((inProgressCycles / assignedCycles) * 100) : 0;

    return {
      assignedCycles,
      inProgressCycles,
      inProgressPct,
      assignedControls,
      evidenceUploaded,
      aiEvaluatedInReview,
    };
  }, [assignedInsights, effectiveReviewStats]);

  const kpiLoading = loading || !assignedCycleIds;

  const kpiCards = useMemo(
    () => [
      {
        label: "Assigned Cycles",
        value: kpiLoading ? "—" : String(metrics.assignedCycles),
        sub: "Cycles assigned to this user",
        tone: "bg-[var(--primary-muted)] text-[var(--primary)]",
        meter: Math.min(100, metrics.assignedCycles * 20),
      },
      {
        label: "In Progress",
        value: kpiLoading ? "—" : String(metrics.inProgressCycles),
        sub: "Assigned cycles in active phase",
        tone: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
        meter: metrics.inProgressPct,
      },
      {
        label: "Evidence Uploaded",
        value: kpiLoading ? "—" : String(metrics.evidenceUploaded),
        sub: "Submissions uploaded by IT Expert",
        tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
        meter: Math.min(100, Math.round((metrics.evidenceUploaded / Math.max(1, metrics.assignedControls)) * 100)),
      },
      {
        label: "AI In Review",
        value: kpiLoading || effectiveReviewStatsLoading ? "—" : String(metrics.aiEvaluatedInReview),
        sub: "AI-evaluated items under review",
        tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
        meter: Math.min(100, metrics.aiEvaluatedInReview * 10),
      },
    ],
    [kpiLoading, metrics, effectiveReviewStatsLoading]
  );

  const cycleRows = useMemo(() => {
    return [...assignedInsights]
      .map((row) => {
        const stats = effectiveReviewStats[row.cycle.id] ?? { inReview: 0, approved: 0, rejected: 0 };
        const evidenceDone = row.dashboard?.evidence_items ?? 0;
        const evidenceTotal = row.dashboard?.total_evidence_items ?? 0;
        const evidencePct = evidenceTotal > 0 ? Math.round((evidenceDone / evidenceTotal) * 100) : 0;
        const dueIn = daysTo(row.cycle.target_submission_date ?? row.cycle.end_date);
        return {
          id: row.cycle.id,
          label: row.cycle.label,
          displayId: row.cycle.display_id,
          phase: phaseLabel(row.cycle.phase),
          assignedControls: row.dashboard?.total_controls ?? 0,
          evidenceDone,
          evidenceTotal,
          evidencePct,
          inReview: stats.inReview,
          approved: stats.approved,
          rejected: stats.rejected,
          dueLabel: dueIn === null ? "No deadline" : dueIn <= 0 ? "Due now" : `${dueIn} day(s) left`,
        };
      })
      .sort((a, b) => a.dueLabel.localeCompare(b.dueLabel));
  }, [assignedInsights, effectiveReviewStats]);

  const deadlineRows = useMemo(() => {
    return assignedInsights
      .map((row) => {
        const raw = row.cycle.target_submission_date ?? row.cycle.end_date;
        if (!raw) return null;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return null;
        const dueIn = daysTo(raw);
        return {
          id: row.cycle.id,
          label: row.cycle.label,
          displayId: row.cycle.display_id,
          phase: phaseLabel(row.cycle.phase),
          dueDateLabel: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
          dueIn,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort((a, b) => {
        const da = a.dueIn ?? Number.POSITIVE_INFINITY;
        const db = b.dueIn ?? Number.POSITIVE_INFINITY;
        return da - db;
      })
      .slice(0, 8);
  }, [assignedInsights]);

  const visualization = useMemo(() => {
    const source = validVisualCycleId
      ? assignedInsights.filter((i) => i.cycle.id === validVisualCycleId)
      : assignedInsights;
    const assignedControls = source.reduce((acc, row) => acc + (row.dashboard?.total_controls ?? 0), 0);
    const uploaded = source.reduce((acc, row) => acc + (row.dashboard?.evidence_items ?? 0), 0);
    const inReview = source.reduce((acc, row) => acc + (effectiveReviewStats[row.cycle.id]?.inReview ?? 0), 0);
    const approved = source.reduce((acc, row) => acc + (effectiveReviewStats[row.cycle.id]?.approved ?? 0), 0);
    const rejected = source.reduce((acc, row) => acc + (effectiveReviewStats[row.cycle.id]?.rejected ?? 0), 0);
    const awaitingUpload = Math.max(0, assignedControls - uploaded);
    const rows = [
      { label: "Uploaded", value: uploaded, color: "#06b6d4" },
      { label: "In Review", value: inReview, color: "#7c3aed" },
      { label: "Approved", value: approved, color: "#10b981" },
      { label: "Rejected", value: rejected, color: "#ef4444" },
      { label: "Awaiting Upload", value: awaitingUpload, color: "#f59e0b" },
    ];
    const total = rows.reduce((acc, r) => acc + r.value, 0);
    const top = [...rows].sort((a, b) => b.value - a.value)[0];
    return {
      rows,
      total,
      center: total > 0 ? Math.round((top.value / total) * 100) : 0,
      centerLabel: top.label,
      selectedLabel: validVisualCycleId
        ? (assignedInsights.find((i) => i.cycle.id === validVisualCycleId)?.cycle.display_id ?? "Selected cycle")
        : "All assigned cycles",
    };
  }, [validVisualCycleId, assignedInsights, effectiveReviewStats]);

  const cycleHref = (cycleId: string) => `/cycles/${cycleId}/dashboard`;

  return (
    <div className="w-full space-y-5 pb-6">
      <RoleDashboardHero
        eyebrow="IT Expert Command Center"
        greetingName={firstName}
        description="Track cycle assignment load and active execution status."
      />

      <StatKpiArticleGrid items={kpiCards} loading={kpiLoading} ariaLabel="IT Expert KPI cards" />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ItExpertCycleInsightsSection
          title="Cycle-wise IT Expert Insights"
          subtitle="Assigned cycles only"
          cycleRows={cycleRows}
          loading={loading}
          emptyMessage="No assigned cycles available for this IT Expert user yet."
          cycleDashboardHref={cycleHref}
        />

        <div
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <DeadlineLinksSection
            renderInCard={false}
            title="Test Cycle Deadlines"
            subtitle="Right-side view"
            rows={deadlineRows}
            loading={loading}
            emptyMessage="No cycle deadlines configured for assigned cycles."
            cycleDashboardHref={cycleHref}
          />
          <ItExpertVisualizationPanel
            visualization={visualization}
            visualCycleId={validVisualCycleId}
            onVisualCycleChange={setVisualCycleId}
            assignedInsights={assignedInsights}
          />
        </div>
      </section>
    </div>
  );
}

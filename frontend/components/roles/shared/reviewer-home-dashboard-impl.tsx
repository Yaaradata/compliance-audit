"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  CycleInsight,
  CycleReviewStats,
  DeadlineRow,
  EvidenceReviewApiRow,
  ReviewerQueueRow,
} from "@/components/roles/shared/compliance-types";
import {
  DashboardKpiGrid,
  DeadlinesCalendarModal,
  ReviewerCycleInsightsSection,
  ReviewerQueueOverviewPanel,
  ReviewerReviewDeadlinesPanel,
  RoleDashboardHero,
} from "@/components/roles/shared";
import {
  daysTo,
  monthEnd,
  monthStart,
  normalizeRoleForCycle,
  phaseLabel,
  reviewerTierExpectedRole,
  toDateKey,
  type ReviewerHomeTier,
} from "@/components/roles/shared/utils";
import { api } from "@/lib/api";

export type { CycleInsight } from "@/components/roles/shared/compliance-types";
export type { ReviewerHomeTier } from "@/components/roles/shared/utils";

const TIER_COPY: Record<
  ReviewerHomeTier,
  {
    eyebrow: string;
    description: string;
    queueTitle: string;
    queueSubtitle: string;
    emptyMsg: string;
  }
> = {
  l1: {
    eyebrow: "L1 Review Command Center",
    description:
      "You decide whether evidence is complete enough to move forward. Triage your queue by priority, clear returns, and keep submission dates in sight.",
    queueTitle: "Priority review queue",
    queueSubtitle: "Sorted by open work first, then soonest deadline. Each card opens your review workspace for that cycle.",
    emptyMsg: "No cycles are assigned to you for L1 completeness review yet. When a Compliance Officer adds you, they will appear here.",
  },
  l2: {
    eyebrow: "L2 Review Command Center",
    description:
      "You assess quality after L1. Focus on substantive decisions—approve, return for rework, or hold—before the cycle moves to approval or reporting.",
    queueTitle: "Priority review queue",
    queueSubtitle: "Sorted by items awaiting your decision, then by deadline. Jump into the review queue for any cycle.",
    emptyMsg: "No cycles are assigned to you for L2 quality review yet.",
  },
  l3: {
    eyebrow: "L3 External Assessment Command Center",
    description:
      "You perform the external assessment. This workspace is only your decisions and deadlines—no collection or upload work.",
    queueTitle: "Assessment queue by cycle",
    queueSubtitle: "Your L3 outcomes and deadlines per cycle. Open a cycle to complete assessments in the review queue.",
    emptyMsg: "No cycles are assigned for external assessment yet.",
  },
};

function tierLabel(tier: ReviewerHomeTier): string {
  if (tier === "l3") return "L3";
  return tier === "l1" ? "L1" : "L2";
}

export function ReviewerHomeDashboard({
  tier,
  userName,
  insights,
  loading,
}: {
  tier: ReviewerHomeTier;
  userName: string;
  insights: CycleInsight[];
  loading: boolean;
}) {
  const copy = TIER_COPY[tier];
  const expectedRole = reviewerTierExpectedRole(tier);
  const firstName = userName.split(/\s+/)[0] ?? "there";
  const [resolvedAssignedIds, setResolvedAssignedIds] = useState<Set<string> | null>(null);
  const [reviewStatsByCycle, setReviewStatsByCycle] = useState<Record<string, CycleReviewStats>>({});
  const [reviewStatsLoading, setReviewStatsLoading] = useState(false);
  const [visualCycleId, setVisualCycleId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => monthStart(new Date()));

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
        const ids = new Set(rows.filter((r) => r.role === expectedRole).map((r) => r.cycleId));
        setResolvedAssignedIds(ids);
      } catch {
        if (!cancelled) setResolvedAssignedIds(new Set());
      }
    }

    void resolveAssignedCycles();
    return () => {
      cancelled = true;
    };
  }, [insights, expectedRole]);

  const assignedInsights = useMemo(() => {
    if (insights.length === 0) return [];
    if (!assignedCycleIds) return insights;
    return insights.filter((i) => assignedCycleIds.has(i.cycle.id));
  }, [insights, assignedCycleIds]);

  const sortedAssignedInsights = useMemo(
    () =>
      [...assignedInsights].sort((a, b) => {
        const da = daysTo(a.cycle.target_submission_date ?? a.cycle.end_date) ?? Number.POSITIVE_INFINITY;
        const db = daysTo(b.cycle.target_submission_date ?? b.cycle.end_date) ?? Number.POSITIVE_INFINITY;
        return da - db;
      }),
    [assignedInsights]
  );

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

  const aggregate = useMemo(() => {
    const pending = Object.values(effectiveReviewStats).reduce((acc, s) => acc + s.inReview, 0);
    const approved = Object.values(effectiveReviewStats).reduce((acc, s) => acc + s.approved, 0);
    const returned = Object.values(effectiveReviewStats).reduce((acc, s) => acc + s.rejected, 0);
    const cyclesWithOpenQueue = assignedInsights.filter(
      (i) => (effectiveReviewStats[i.cycle.id]?.inReview ?? 0) > 0
    ).length;
    return { pending, approved, returned, cyclesWithOpenQueue };
  }, [assignedInsights, effectiveReviewStats]);

  const kpiLoading = loading || !assignedCycleIds;
  const statLoading = kpiLoading || effectiveReviewStatsLoading;

  const prioritySortedInsights = useMemo(() => {
    return [...assignedInsights].sort((a, b) => {
      const sa = effectiveReviewStats[a.cycle.id] ?? { inReview: 0, approved: 0, rejected: 0 };
      const sb = effectiveReviewStats[b.cycle.id] ?? { inReview: 0, approved: 0, rejected: 0 };
      if (sb.inReview !== sa.inReview) return sb.inReview - sa.inReview;
      const da = daysTo(a.cycle.target_submission_date ?? a.cycle.end_date) ?? 9999;
      const db = daysTo(b.cycle.target_submission_date ?? b.cycle.end_date) ?? 9999;
      return da - db;
    });
  }, [assignedInsights, effectiveReviewStats]);

  const cycleRows = useMemo((): ReviewerQueueRow[] => {
    return prioritySortedInsights.map((row) => {
      const stats = effectiveReviewStats[row.cycle.id] ?? { inReview: 0, approved: 0, rejected: 0 };
      const dueIn = daysTo(row.cycle.target_submission_date ?? row.cycle.end_date);
      return {
        id: row.cycle.id,
        label: row.cycle.label,
        displayId: row.cycle.display_id,
        phase: phaseLabel(row.cycle.phase),
        pending: stats.inReview,
        approved: stats.approved,
        returned: stats.rejected,
        dueLabel: dueIn === null ? "No deadline" : dueIn <= 0 ? "Due now" : `${dueIn} day(s) left`,
      };
    });
  }, [prioritySortedInsights, effectiveReviewStats]);

  const primaryReviewHref = useMemo(() => {
    const next = cycleRows.find((r) => r.pending > 0);
    if (next) return `/cycles/${next.id}/review`;
    if (cycleRows[0]) return `/cycles/${cycleRows[0].id}/review`;
    return "/assessments/new";
  }, [cycleRows]);

  const deadlineRows = useMemo(() => {
    return sortedAssignedInsights
      .map((r) => {
        const days = daysTo(r.cycle.target_submission_date ?? r.cycle.end_date);
        return { ...r, days };
      })
      .filter((r): r is DeadlineRow => r.days !== null)
      .slice(0, 8);
  }, [sortedAssignedInsights]);

  const urgentDeadlineCount = useMemo(
    () => deadlineRows.filter((d) => d.days <= 2).length,
    [deadlineRows]
  );

  const reviewerKpiCards = useMemo(
    () => {
      const assignedCount = assignedInsights.length;
      return [
        {
          label: "Awaiting your decision",
          value: aggregate.pending,
          sub: "Items in your queue at this tier",
          href: primaryReviewHref,
          aria: `${aggregate.pending} items awaiting your decision at ${tierLabel(tier)}`,
          tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
          meter: Math.min(100, aggregate.pending * 8),
        },
        {
          label: "Approved",
          value: aggregate.approved,
          sub: "Decisions completed",
          href: "/report",
          aria: `Open reporting. ${aggregate.approved} approved at this tier`,
          tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
          meter: Math.min(100, aggregate.approved * 5),
        },
        {
          label: "Returned",
          value: aggregate.returned,
          sub: "Sent back for rework",
          href: "/report",
          aria: `${aggregate.returned} items returned for rework`,
          tone: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
          meter: Math.min(100, aggregate.returned * 8),
        },
        {
          label: "Cycles with open queue",
          value: aggregate.cyclesWithOpenQueue,
          sub: `${urgentDeadlineCount} urgent`,
          href: "/assessments/new",
          aria: `${aggregate.cyclesWithOpenQueue} cycles with items awaiting review`,
          tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
          meter: assignedCount > 0 ? Math.round((aggregate.cyclesWithOpenQueue / Math.max(1, assignedCount)) * 100) : 0,
        },
      ];
    },
    [aggregate, primaryReviewHref, tier, assignedInsights.length, urgentDeadlineCount]
  );

  const calendarDeadlines = useMemo(() => {
    return sortedAssignedInsights
      .map((r) => {
        const raw = r.cycle.target_submission_date ?? r.cycle.end_date;
        if (!raw) return null;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return null;
        return {
          date: d,
          key: toDateKey(d),
          label: r.cycle.label,
          displayId: r.cycle.display_id,
          phase: phaseLabel(r.cycle.phase),
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [sortedAssignedInsights]);

  const calendarMonthLabel = calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const start = monthStart(calendarMonth);
  const end = monthEnd(calendarMonth);
  const startOffset = start.getDay();
  const daysInMonth = end.getDate();
  const deadlineMap = useMemo(() => {
    const map = new Map<string, { label: string; displayId: string; phase: string }[]>();
    calendarDeadlines.forEach((d) => {
      if (!map.has(d.key)) map.set(d.key, []);
      map.get(d.key)!.push({ label: d.label, displayId: d.displayId, phase: d.phase });
    });
    return map;
  }, [calendarDeadlines]);

  const reviewerQueueOverview = useMemo(() => {
    const source = visualCycleId
      ? sortedAssignedInsights.filter((r) => r.cycle.id === visualCycleId)
      : sortedAssignedInsights;
    let pending = 0;
    let approved = 0;
    let returned = 0;
    source.forEach((r) => {
      const s = effectiveReviewStats[r.cycle.id] ?? { inReview: 0, approved: 0, rejected: 0 };
      pending += s.inReview;
      approved += s.approved;
      returned += s.rejected;
    });
    const total = pending + approved + returned;
    const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
    const topBucket = [
      { label: "Pending", value: pct(pending) },
      { label: "Approved", value: pct(approved) },
      { label: "Returned", value: pct(returned) },
    ].sort((a, b) => b.value - a.value)[0];

    return {
      center: topBucket?.value ?? 0,
      centerLabel: topBucket?.label ?? "Pending",
      totalItems: total,
      rows: [
        { label: "Pending", value: pct(pending), count: pending, color: "#7c3aed" },
        { label: "Approved", value: pct(approved), count: approved, color: "#10b981" },
        { label: "Returned", value: pct(returned), count: returned, color: "#ef4444" },
      ],
    };
  }, [sortedAssignedInsights, visualCycleId, effectiveReviewStats]);

  const cycleReviewHref = (cycleId: string) => `/cycles/${cycleId}/review`;

  const cycleOptions = useMemo(
    () => sortedAssignedInsights.map((i) => ({ id: i.cycle.id, display_id: i.cycle.display_id })),
    [sortedAssignedInsights]
  );

  return (
    <div className="w-full space-y-5 pb-6">
      <RoleDashboardHero
        eyebrow={copy.eyebrow}
        greetingName={firstName}
        description={copy.description}
        primaryActions={[
          { href: primaryReviewHref, label: "Open review queue", gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" },
          { href: "/report", label: "Export report", gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" },
        ]}
      />

      <DashboardKpiGrid
        items={reviewerKpiCards}
        loading={statLoading}
        ariaLabel={`${tierLabel(tier)} reviewer KPI cards`}
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <ReviewerCycleInsightsSection
            title={copy.queueTitle}
            subtitle={copy.queueSubtitle}
            cycleRows={cycleRows}
            loading={loading}
            emptyMessage={copy.emptyMsg}
            cycleReviewHref={cycleReviewHref}
            tier={tier}
          />
        </div>

        <div className="space-y-5">
          <ReviewerReviewDeadlinesPanel
            deadlineRows={deadlineRows}
            loading={loading}
            onOpenCalendar={() => {
              const first = calendarDeadlines[0]?.date ?? new Date();
              setCalendarMonth(monthStart(first));
              setIsCalendarOpen(true);
            }}
          />

          <ReviewerQueueOverviewPanel
            data={reviewerQueueOverview}
            hasSelectedCycle={visualCycleId !== null}
            onShowAllCycles={() => setVisualCycleId(null)}
            visualCycleId={visualCycleId}
            onVisualCycleChange={setVisualCycleId}
            cycleOptions={cycleOptions}
            distributionCaption={`Breakdown for ${visualCycleId ? "selected cycle" : "all assigned cycles"}`}
          />
        </div>
      </section>

      <DeadlinesCalendarModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        calendarMonth={calendarMonth}
        onCalendarMonthChange={setCalendarMonth}
        startOffset={startOffset}
        daysInMonth={daysInMonth}
        calendarMonthLabel={calendarMonthLabel}
        deadlineMap={deadlineMap}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { dashboardPrimaryGradient } from "@/lib/dashboard-button-tokens";
import { DASHBOARD_MAX_WIDTH_CLASS, DASHBOARD_PAGE_BG_CLASS } from "@/lib/ui-layout";
import { useAuth } from "@/lib/auth-context";
import {
  ComplianceOverviewPanel,
  DashboardKpiGrid,
  DeadlinesCalendarModal,
  RoleDashboardHero,
  UpcomingDeadlinesPanel,
} from "@/components/roles/shared";
import type {
  ComplianceOverviewData,
  CycleDashboard,
  CycleInsight,
  DeadlineRow,
} from "@/components/roles/shared/compliance-types";
import type { ActiveCycleMeta } from "@/components/roles/shared/types";
import { daysTo, initials, monthEnd, monthStart, phaseLabel, toDateKey } from "@/components/roles/shared/utils";
import type { AssessmentCycle, User, UserRole } from "@/lib/types";

/**
 * Fallback when the user has no global JWT role and no per-cycle role was derived on /dashboard.
 * Uses the same surface + hero + KPI pattern as Compliance Officer (no dark gradient, no phase strip).
 */
export function RoleHomeDashboard({
  user,
  homeRole,
  activeCycleId,
  activeCycleMeta,
  cycles,
  loading,
}: {
  user: User;
  /** Same as /dashboard routing (`user.role` or derived); drives calendar & button palette. */
  homeRole: UserRole | null;
  activeCycleId: string | null;
  activeCycleMeta: ActiveCycleMeta | null;
  cycles: AssessmentCycle[];
  loading: boolean;
}) {
  const { setActiveCycleId } = useAuth();
  const firstName = user.name?.split(/\s+/)[0] ?? "there";
  const totalCycles = cycles.length;
  const inFlight = cycles.filter((c) => !["submitted", "archived"].includes((c.phase || "").toLowerCase())).length;

  const [dashByCycleId, setDashByCycleId] = useState<Record<string, CycleDashboard | null>>({});
  const [dashLoading, setDashLoading] = useState(false);
  const [visualCycleId, setVisualCycleId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => monthStart(new Date()));

  useEffect(() => {
    if (visualCycleId && !cycles.some((c) => c.id === visualCycleId)) {
      setVisualCycleId(null);
    }
  }, [cycles, visualCycleId]);

  useEffect(() => {
    if (cycles.length === 0) {
      setDashByCycleId({});
      return;
    }
    let cancelled = false;
    async function load() {
      setDashLoading(true);
      const entries = await Promise.all(
        cycles.map(async (c) => {
          try {
            const dash = await api.get<CycleDashboard>(`/assessments/${c.id}/dashboard`);
            return [c.id, dash] as const;
          } catch {
            return [c.id, null] as const;
          }
        })
      );
      if (!cancelled) {
        setDashByCycleId(Object.fromEntries(entries));
        setDashLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [cycles]);

  const sortedInsights = useMemo<CycleInsight[]>(
    () =>
      [...cycles]
        .sort((a, b) => {
          const da = daysTo(a.target_submission_date ?? a.end_date) ?? Number.POSITIVE_INFINITY;
          const db = daysTo(b.target_submission_date ?? b.end_date) ?? Number.POSITIVE_INFINITY;
          return da - db;
        })
        .map((c) => ({
          cycle: c,
          dashboard: dashByCycleId[c.id] ?? null,
          relatedUsers: [],
        })),
    [cycles, dashByCycleId]
  );

  const upcomingDeadlineRows = useMemo<DeadlineRow[]>(() => {
    const out: DeadlineRow[] = [];
    for (const row of sortedInsights) {
      const days = daysTo(row.cycle.target_submission_date ?? row.cycle.end_date);
      if (days === null) continue;
      out.push({ ...row, days });
      if (out.length >= 6) break;
    }
    return out;
  }, [sortedInsights]);

  const calendarDeadlines = useMemo(() => {
    return sortedInsights
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
          cycleId: r.cycle.id,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [sortedInsights]);

  const calendarMonthLabel = calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const calStart = monthStart(calendarMonth);
  const calEnd = monthEnd(calendarMonth);
  const startOffset = calStart.getDay();
  const daysInMonth = calEnd.getDate();
  const deadlineMap = useMemo(() => {
    const map = new Map<
      string,
      { label: string; displayId: string; phase: string; cycleId: string }[]
    >();
    calendarDeadlines.forEach((d) => {
      if (!map.has(d.key)) map.set(d.key, []);
      map.get(d.key)!.push({
        label: d.label,
        displayId: d.displayId,
        phase: d.phase,
        cycleId: d.cycleId,
      });
    });
    return map;
  }, [calendarDeadlines]);

  useEffect(() => {
    if (!isCalendarOpen || !activeCycleId) return;
    const hit = calendarDeadlines.find((x) => x.cycleId === activeCycleId);
    if (hit?.date) setCalendarMonth(monthStart(hit.date));
  }, [activeCycleId, isCalendarOpen, calendarDeadlines]);

  const complianceOverview = useMemo<ComplianceOverviewData>(() => {
    const sourceInsights = visualCycleId
      ? sortedInsights.filter((r) => r.cycle.id === visualCycleId)
      : sortedInsights;

    let evidenceSubmitted = 0;
    let evidenceNotSubmitted = 0;
    let reviewCompleted = 0;
    let inReview = 0;

    sourceInsights.forEach((r) => {
      const evidenceDone = r.dashboard?.evidence_items ?? 0;
      const evidenceTotal = r.dashboard?.total_evidence_items ?? 0;
      const realInReview = r.dashboard?.evidence_in_review ?? 0;
      const realReviewCompleted = Math.max(0, evidenceDone - realInReview);

      evidenceSubmitted += evidenceDone;
      evidenceNotSubmitted += Math.max(0, evidenceTotal - evidenceDone);
      reviewCompleted += realReviewCompleted;
      inReview += realInReview;
    });

    const total = evidenceSubmitted + evidenceNotSubmitted + reviewCompleted + inReview;
    const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

    const submittedPct = pct(evidenceSubmitted);
    const notSubmittedPct = pct(evidenceNotSubmitted);
    const reviewCompletedPct = pct(reviewCompleted);
    const inReviewPct = pct(inReview);

    const topBucket = [
      { label: "Evidence Submitted", value: submittedPct },
      { label: "Not Submitted", value: notSubmittedPct },
      { label: "Review Completed", value: reviewCompletedPct },
      { label: "In Review", value: inReviewPct },
    ].sort((a, b) => b.value - a.value)[0];

    const first = sourceInsights[0];

    return {
      center: topBucket?.value ?? 0,
      centerLabel: topBucket?.label ?? "Evidence Submitted",
      totalCycles: total,
      selectedCycle: first?.cycle ?? null,
      selectedCycleEvidencePct:
        first && (first.dashboard?.total_evidence_items ?? 0) > 0
          ? Math.round(
              ((first.dashboard?.evidence_items ?? 0) / (first.dashboard?.total_evidence_items ?? 0)) * 100
            )
          : 0,
      selectedCycleHealthPct: first?.dashboard?.overall_score ?? 0,
      selectedCycleCreatedOn: first?.cycle?.created_at
        ? new Date(first.cycle.created_at).toLocaleDateString()
        : "n/a",
      rows: [
        { label: "Evidence Submitted", value: submittedPct, count: evidenceSubmitted, color: "#14b8a6" },
        { label: "Not Submitted", value: notSubmittedPct, count: evidenceNotSubmitted, color: "#f59e0b" },
        { label: "Review Completed", value: reviewCompletedPct, count: reviewCompleted, color: "#10b981" },
        { label: "In Review", value: inReviewPct, count: inReview, color: "#3b82f6" },
      ],
    };
  }, [sortedInsights, visualCycleId]);

  const cycleScopeOptions = useMemo(
    () => cycles.map((c) => ({ id: c.id, display_id: c.display_id })),
    [cycles]
  );

  const panelLoading = loading || dashLoading;

  const calendarCycleSelectOptions = useMemo(
    () => cycles.map((c) => ({ id: c.id, label: c.label, display_id: c.display_id, cycle_year: c.cycle_year })),
    [cycles]
  );

  const handleCalendarCycleChange = useCallback(
    (id: string | null) => {
      if (id === null) {
        setActiveCycleId(null);
        return;
      }
      const c = cycles.find((x) => x.id === id);
      if (c) setActiveCycleId(id, { label: c.label, cycle_year: c.cycle_year, display_id: c.display_id });
    },
    [cycles, setActiveCycleId]
  );

  const kpiCards = [
    {
      label: "Assessment cycles",
      value: totalCycles,
      sub: "Visible to your tenant",
      href: "/dashboard",
      aria: `Open assessment cycles. ${totalCycles} cycles`,
      tone: "bg-[var(--primary-muted)] text-[var(--primary)]",
    },
    {
      label: "Active cycle",
      value: activeCycleMeta?.display_id ?? (activeCycleId ? "Selected" : "None"),
      sub: activeCycleId ? "Use header to switch" : "Pick a cycle after assignment",
      href: "/dashboard",
      aria: "Open cycles to select an active assessment",
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      label: "Phases in flight",
      value: inFlight,
      sub: "Excludes submitted / archived",
      href: "/dashboard",
      aria: `${inFlight} cycles in active phases`,
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      label: "Account",
      value: initials(user.name),
      sub: user.email ?? "",
      href: "/dashboard",
      aria: "Account",
      tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    },
  ];

  return (
    <div className={`${DASHBOARD_MAX_WIDTH_CLASS} ${DASHBOARD_PAGE_BG_CLASS} space-y-5 pb-6`}>
      <RoleDashboardHero
        eyebrow="Home"
        greetingName={firstName}
        description="Your tenant admin assigns a global role or adds you to cycles. Open assessment cycles to see work you can access."
        primaryActions={[
          {
            href: "/dashboard",
            label: "+ Assessment cycles",
            gradient: dashboardPrimaryGradient(homeRole),
          },
        ]}
      />

      <DashboardKpiGrid items={kpiCards} loading={loading} ariaLabel="Home dashboard KPI cards" />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border p-5 sm:p-6 xl:col-span-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            Next steps
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            When you are assigned as Evidence Collection or reviewer on a cycle, this page will show your role-specific command center
            (same layout as Compliance Officer). Until then, use assessment cycles to join a SWIFT CSCF assessment.
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="interactive-hero-action dashboard-btn-pill inline-flex items-center justify-center border-0 text-sm font-semibold text-white shadow-sm"
              style={{ background: dashboardPrimaryGradient(homeRole) }}
            >
              Go to assessment cycles
            </Link>
          </div>
        </div>

        <div className="space-y-5 xl:col-span-1">
          <UpcomingDeadlinesPanel
            deadlineRows={upcomingDeadlineRows}
            loading={panelLoading}
            role={homeRole}
            onOpenCalendar={(focusDate) => {
              const first = calendarDeadlines[0]?.date ?? new Date();
              const d = focusDate ?? first;
              setCalendarMonth(monthStart(d));
              setIsCalendarOpen(true);
            }}
          />
          <ComplianceOverviewPanel
            complianceOverview={complianceOverview}
            hasSelectedCycle={visualCycleId !== null}
            onShowAllCycles={() => setVisualCycleId(null)}
            visualCycleId={visualCycleId}
            onVisualCycleChange={cycleScopeOptions.length > 1 ? setVisualCycleId : undefined}
            cycleOptions={cycleScopeOptions.length > 1 ? cycleScopeOptions : undefined}
            role={homeRole}
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
        buttonRole={homeRole}
        activeCycleId={activeCycleId}
        cycleSelectOptions={calendarCycleSelectOptions}
        onSelectCycle={handleCalendarCycleChange}
      />
    </div>
  );
}

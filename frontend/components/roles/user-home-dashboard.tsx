"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { dashboardOutlineStyle, dashboardPrimaryGradient } from "@/lib/dashboard-button-tokens";
import type { AssessmentCycle, User, UserRole } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  ComplianceOverviewPanel,
  DeadlinesCalendarModal,
  RoleDashboardHero,
  StatKpiArticleGrid,
  UpcomingDeadlinesPanel,
} from "@/components/roles/shared";
import type {
  ComplianceOverviewData,
  CycleDashboard,
  CycleReviewStats,
  DeadlineRow,
  EvidenceReviewApiRow,
} from "@/components/roles/shared/compliance-types";
import {
  daysTo,
  monthEnd,
  monthStart,
  normalizeRoleForCycle,
  phaseLabel,
  toDateKey,
  cycleEntryPath,
  DUE_SOON_DEADLINE_DAYS,
  isCycleDeadlineDueSoon,
} from "@/components/roles/shared/utils";
import { DASHBOARD_MAX_WIDTH_CLASS, DASHBOARD_PAGE_BG_CLASS } from "@/lib/ui-layout";

const IconSearch = () => (
  <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

type CycleCardRow = {
  id: string;
  label: string;
  displayId: string;
  phase: string;
  dueLabel: string;
  role: string | null;
  href: string;
  dueIn: number | null;
  dashboard?: CycleDashboard | null;
  review?: CycleReviewStats | null;
};

function roleBadge(role: string | null) {
  if (role === "it_sme") return { label: "IT Expert", cls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" };
  if (role === "internal_reviewer_l1") return { label: "L1 Reviewer", cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" };
  if (role === "internal_reviewer_l2") return { label: "L2 Reviewer", cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" };
  if (role === "external_assessor") return { label: "L3 Assessor", cls: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" };
  return { label: "No access", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
}

function roleHref(cycleId: string, role: string | null, cycle: AssessmentCycle) {
  if (!role) return "/dashboard";
  if (role === "internal_reviewer_l1" || role === "internal_reviewer_l2" || role === "external_assessor") {
    return `/cycles/${cycleId}/review`;
  }
  return cycleEntryPath(cycle);
}

export function UserHomeDashboard({
  user,
  cycles,
  homeRole,
}: {
  user: User;
  cycles: AssessmentCycle[];
  /** Tenant home role from /dashboard (JWT or derived). Drives IT Expert vs reviewer visualization. */
  homeRole: UserRole | null;
}) {
  const { activeCycleId, setActiveCycleId } = useAuth();
  const firstName = user.name?.split(/\s+/)[0] ?? "there";
  const isReviewerRole = (role: string | null) =>
    role === "internal_reviewer_l1" || role === "internal_reviewer_l2" || role === "external_assessor";
  const [rolesByCycleId, setRolesByCycleId] = useState<Record<string, string | null>>({});
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [dashByCycleId, setDashByCycleId] = useState<Record<string, CycleDashboard | null>>({});
  const [reviewByCycleId, setReviewByCycleId] = useState<Record<string, CycleReviewStats | null>>({});
  const [loadingCards, setLoadingCards] = useState(false);
  const [visualCycleId, setVisualCycleId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => monthStart(new Date()));
  const [cycleQuery, setCycleQuery] = useState("");
  const [reviewerFilter, setReviewerFilter] = useState<"all" | "needs_action" | "due_soon" | "queue_clear">("all");
  const [sortMode, setSortMode] = useState<"urgency" | "queue" | "name">("urgency");

  useEffect(() => {
    if (homeRole === "it_sme" && sortMode === "queue") {
      setSortMode("urgency");
    }
  }, [homeRole, sortMode]);

  useEffect(() => {
    let cancelled = false;
    async function loadRoles() {
      setLoadingRoles(true);
      const entries = await Promise.all(
        cycles.map(async (c) => {
          try {
            const res = await api.get<{ role: string | null }>(`/assessments/${c.id}/my-role`);
            return [c.id, normalizeRoleForCycle(res.role)] as const;
          } catch {
            return [c.id, null] as const;
          }
        })
      );
      if (!cancelled) {
        setRolesByCycleId(Object.fromEntries(entries));
        setLoadingRoles(false);
      }
    }

    if (cycles.length) void loadRoles();
    else setRolesByCycleId({});

    return () => {
      cancelled = true;
    };
  }, [cycles]);

  useEffect(() => {
    const cycleIds = cycles.map((c) => c.id);
    if (cycleIds.length === 0) {
      setDashByCycleId({});
      setReviewByCycleId({});
      return;
    }

    const hasAnyRoleResolved = cycleIds.some((id) => Object.prototype.hasOwnProperty.call(rolesByCycleId, id));
    if (!hasAnyRoleResolved) return;

    let cancelled = false;
    async function loadCardData() {
      setLoadingCards(true);

      const relevant = cycles
        .map((c) => ({ cycle: c, role: rolesByCycleId[c.id] ?? null }))
        .filter((x) => Boolean(x.role));

      const dashEntries = await Promise.all(
        relevant.map(async ({ cycle }) => {
          try {
            const dash = await api.get<CycleDashboard>(`/assessments/${cycle.id}/dashboard`);
            return [cycle.id, dash] as const;
          } catch {
            return [cycle.id, null] as const;
          }
        })
      );

      const reviewEntries = await Promise.all(
        relevant.map(async ({ cycle, role }) => {
          if (!role) return [cycle.id, null] as const;
          if (!["it_sme", "internal_reviewer_l1", "internal_reviewer_l2", "external_assessor"].includes(role)) {
            return [cycle.id, null] as const;
          }
          try {
            const reviews = await api.getDirect<EvidenceReviewApiRow[]>(`/assessments/${cycle.id}/reviews`);
            const stats = (reviews ?? []).reduce<CycleReviewStats>(
              (acc, r) => {
                const s = (r.status ?? "").toLowerCase();
                if (s === "approved") acc.approved += 1;
                else if (s === "returned" || s === "rejected") acc.rejected += 1;
                else if (s === "assigned" || s === "in_review" || s === "hold") acc.inReview += 1;
                return acc;
              },
              { inReview: 0, approved: 0, rejected: 0 }
            );
            return [cycle.id, stats] as const;
          } catch {
            return [cycle.id, { inReview: 0, approved: 0, rejected: 0 }] as const;
          }
        })
      );

      if (cancelled) return;
      setDashByCycleId(Object.fromEntries(dashEntries));
      setReviewByCycleId(Object.fromEntries(reviewEntries));
      setLoadingCards(false);
    }

    void loadCardData();
    return () => {
      cancelled = true;
    };
  }, [cycles, rolesByCycleId]);

  const rows = useMemo<CycleCardRow[]>(
    () =>
      [...cycles]
        .map((c) => {
          const role = rolesByCycleId[c.id] ?? null;
          const dueIn = daysTo(c.target_submission_date ?? c.end_date);
          const dueLabel = dueIn === null ? "No deadline" : dueIn <= 0 ? "Due now" : `${dueIn} day(s) left`;
          return {
            id: c.id,
            label: c.label,
            displayId: c.display_id,
            phase: phaseLabel(c.phase),
            dueLabel,
            role,
            href: roleHref(c.id, role, c),
            dueIn,
            dashboard: role ? (dashByCycleId[c.id] ?? null) : undefined,
            review: role ? (reviewByCycleId[c.id] ?? null) : undefined,
          };
        })
        .sort((a, b) => {
          const aDue = a.dueIn ?? Number.POSITIVE_INFINITY;
          const bDue = b.dueIn ?? Number.POSITIVE_INFINITY;
          if (aDue !== bDue) return aDue - bDue;
          return a.label.localeCompare(b.label);
        }),
    [cycles, rolesByCycleId, dashByCycleId, reviewByCycleId]
  );

  const hasItSmeAssignment = useMemo(() => rows.some((r) => r.role === "it_sme"), [rows]);
  const hasReviewerAssignment = useMemo(
    () => rows.some((r) => isReviewerRole(r.role)),
    [rows]
  );
  const isMixedContributorHome = hasItSmeAssignment && hasReviewerAssignment;
  /** Full IT Expert chrome only when tenant role is IT and every assignment is IT — not when user is also a reviewer on other cycles. */
  const useItExpertExclusivePresentation = homeRole === "it_sme" && !hasReviewerAssignment;

  const inReviewKpiTotal = useMemo(() => {
    return rows.reduce((acc, r) => {
      if (!r.role) return acc;
      if (r.role === "it_sme") {
        return acc + (r.dashboard?.evidence_in_review ?? r.review?.inReview ?? 0);
      }
      if (isReviewerRole(r.role)) {
        return acc + (r.review?.inReview ?? 0);
      }
      return acc;
    }, 0);
  }, [rows]);

  const visibleRows = useMemo(() => {
    const query = cycleQuery.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      const pending = r.review?.inReview ?? 0;
      const matchesQuery =
        !query ||
        r.label.toLowerCase().includes(query) ||
        r.displayId.toLowerCase().includes(query) ||
        (r.role ?? "").toLowerCase().includes(query);
      if (!matchesQuery) return false;

      if (useItExpertExclusivePresentation) {
        if (!r.role) return false;
        return true;
      }

      if (reviewerFilter === "needs_action") return pending > 0;
      if (reviewerFilter === "due_soon") return isCycleDeadlineDueSoon(r.dueIn);
      if (reviewerFilter === "queue_clear") return pending === 0;
      return true;
    });
    const pendingUpload = (x: CycleCardRow) =>
      Math.max(0, (x.dashboard?.total_evidence_items ?? 0) - (x.dashboard?.evidence_items ?? 0));
    const mixedHomeQueueScore = (x: CycleCardRow) => {
      if (x.role === "it_sme") return pendingUpload(x);
      if (isReviewerRole(x.role)) return x.review?.inReview ?? 0;
      return 0;
    };

    return filtered.sort((a, b) => {
      if (sortMode === "name") return a.label.localeCompare(b.label);
      if (sortMode === "queue") {
        return mixedHomeQueueScore(b) - mixedHomeQueueScore(a);
      }
      const aDue = a.dueIn ?? Number.POSITIVE_INFINITY;
      const bDue = b.dueIn ?? Number.POSITIVE_INFINITY;
      if (aDue !== bDue) return aDue - bDue;
      return mixedHomeQueueScore(b) - mixedHomeQueueScore(a);
    });
  }, [rows, cycleQuery, reviewerFilter, sortMode, useItExpertExclusivePresentation]);

  const assignmentCount = rows.filter((r) => Boolean(r.role)).length;
  const accessible = assignmentCount;
  const inProgress = rows.filter((r) => r.role && !["submitted", "archived"].includes((r.phase || "").toLowerCase())).length;
  const evidenceUploaded = rows
    .filter((r) => r.role === "it_sme")
    .reduce((acc, r) => acc + (r.dashboard?.evidence_items ?? 0), 0);

  const upcomingDeadlineRows = useMemo<DeadlineRow[]>(() => {
    const out: DeadlineRow[] = [];
    for (const r of [...rows]
      .filter((row) => Boolean(row.role) && row.dueIn !== null)
      .sort((a, b) => (a.dueIn ?? 9999) - (b.dueIn ?? 9999))
      .slice(0, 6)) {
      const cycle = cycles.find((c) => c.id === r.id);
      if (!cycle) continue;
      out.push({
        cycle,
        dashboard: r.dashboard ?? null,
        relatedUsers: [],
        days: r.dueIn!,
      });
    }
    return out;
  }, [rows, cycles]);

  const calendarDeadlines = useMemo(() => {
    return rows
      .filter((r) => r.role)
      .map((r) => {
        const c = cycles.find((x) => x.id === r.id);
        if (!c) return null;
        const raw = c.target_submission_date ?? c.end_date;
        if (!raw) return null;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return null;
        return {
          date: d,
          key: toDateKey(d),
          label: c.label,
          displayId: c.display_id,
          phase: phaseLabel(c.phase),
          cycleId: c.id,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [rows, cycles]);

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
    const sourceRows = visualCycleId
      ? rows.filter((r) => r.id === visualCycleId && r.role)
      : rows.filter((r) => r.role);

    let evidenceSubmitted = 0;
    let evidenceNotSubmitted = 0;
    let reviewCompleted = 0;
    let inReview = 0;

    sourceRows.forEach((r) => {
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

    const first = sourceRows[0];
    const firstCycle = first ? cycles.find((c) => c.id === first.id) ?? null : null;

    return {
      center: topBucket?.value ?? 0,
      centerLabel: topBucket?.label ?? "Evidence Submitted",
      totalCycles: total,
      selectedCycle: firstCycle,
      selectedCycleEvidencePct:
        first && (first.dashboard?.total_evidence_items ?? 0) > 0
          ? Math.round(
              ((first.dashboard?.evidence_items ?? 0) / (first.dashboard?.total_evidence_items ?? 0)) * 100
            )
          : 0,
      selectedCycleHealthPct: first?.dashboard?.overall_score ?? 0,
      selectedCycleCreatedOn: firstCycle?.created_at ? new Date(firstCycle.created_at).toLocaleDateString() : "n/a",
      rows: [
        { label: "Evidence Submitted", value: submittedPct, count: evidenceSubmitted, color: "#2563eb" },
        { label: "Not Submitted", value: notSubmittedPct, count: evidenceNotSubmitted, color: "#ea580c" },
        { label: "Review Completed", value: reviewCompletedPct, count: reviewCompleted, color: "#10b981" },
        { label: "In Review", value: inReviewPct, count: inReview, color: "#38bdf8" },
      ],
    };
  }, [rows, visualCycleId, cycles]);

  const cycleScopeOptions = useMemo(
    () => rows.filter((r) => r.role).map((r) => ({ id: r.id, display_id: r.displayId })),
    [rows]
  );

  const loading = loadingRoles || loadingCards;

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

  const outline = dashboardOutlineStyle(homeRole);
  const primaryFill = dashboardPrimaryGradient(homeRole);

  const filterPillProps = (active: boolean): { className: string; style: CSSProperties } =>
    active
      ? {
          className:
            "inline-flex items-center justify-center border-0 text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dashboard-btn-pill-compact font-semibold interactive-filter-active",
          style: { background: primaryFill },
        }
      : {
          className:
            "inline-flex items-center justify-center border-2 bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dashboard-btn-pill-compact font-semibold interactive-filter-inactive",
          style: { borderColor: outline.border, color: outline.text },
        };

  const btnPrimaryCls =
    "interactive-hero-action dashboard-btn-pill inline-flex shrink-0 items-center justify-center border-0 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";
  const btnSecondaryCls =
    "interactive-outline-btn dashboard-btn-pill inline-flex items-center justify-center border-2 bg-white text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";

  const MiniKpi = ({ label, value, tone }: { label: string; value: string | number; tone: string }) => (
    <div className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );

  return (
    <div className={`${DASHBOARD_MAX_WIDTH_CLASS} ${DASHBOARD_PAGE_BG_CLASS} space-y-5 pb-6`}>
      <RoleDashboardHero
        eyebrow="Your Dashboard"
        greetingName={firstName}
        description={
          isMixedContributorHome
            ? "You have different roles on different cycles (for example IT Expert on some and reviewer on others). Open a cycle below for the workspace that matches your assignment."
            : useItExpertExclusivePresentation
              ? "Upload and track evidence by cycle. Open a cycle below to continue collection, or switch assessments anytime."
              : "Your work changes by cycle. Pick a cycle below to jump into the correct workspace for your assigned role."
        }
        primaryActions={
          useItExpertExclusivePresentation
            ? []
            : [
                {
                  href: "/dashboard",
                  label: "Switch / view cycles",
                  gradient: dashboardPrimaryGradient(homeRole),
                },
              ]
        }
      />

      <StatKpiArticleGrid
        items={[
          {
            label: "Assigned cycles",
            value: String(accessible),
            sub: isMixedContributorHome
              ? "Cycles where you have a role (IT Expert and/or reviewer)"
              : useItExpertExclusivePresentation
                ? "Cycles where you have a role"
                : "Cycles assigned to this user",
            tone: useItExpertExclusivePresentation
              ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200"
              : "bg-[var(--primary-muted)] text-[var(--primary)]",
          },
          {
            label: "In progress",
            value: String(inProgress),
            sub: "Active phases (not submitted)",
            tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
          },
          {
            label: "Evidence uploaded",
            value: String(evidenceUploaded),
            sub: isMixedContributorHome
              ? "Evidence items submitted on cycles where you are IT Expert"
              : useItExpertExclusivePresentation
                ? "Evidence items you have submitted"
                : "Submissions uploaded by IT Expert",
            tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
          },
          {
            label: "In review",
            value: String(inReviewKpiTotal),
            sub: isMixedContributorHome
              ? "Your submissions in review (IT cycles) + items awaiting your decision (reviewer cycles)"
              : useItExpertExclusivePresentation
                ? "Your submissions currently in review"
                : "Items in the review queue",
            tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
          },
        ]}
        loading={loading}
        ariaLabel="User dashboard KPIs"
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div
          className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm sm:p-5 xl:col-span-2"
        >
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h2 className="text-base font-semibold shrink-0" style={{ color: "var(--foreground)" }}>
                Cycle-wise insights
              </h2>
              {!useItExpertExclusivePresentation && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                    {visibleRows.length} visible
                    {assignmentCount > 0 ? ` · ${assignmentCount} assigned` : ""}
                  </span>
                  <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    {isMixedContributorHome
                      ? "IT Expert and reviewer cycles — filters apply to review queues"
                      : "Reviewer-focused cycle health view"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:max-w-none lg:flex-1">
              <div className="relative min-w-0 flex-1 sm:min-w-[200px] sm:max-w-sm">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  value={cycleQuery}
                  onChange={(e) => setCycleQuery(e.target.value)}
                  placeholder="Search cycle name or id"
                  className="interactive-select h-9 w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2691E]/40"
                />
              </div>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as "urgency" | "queue" | "name")}
                className="interactive-select h-9 w-full shrink-0 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2691E]/40 sm:w-auto"
              >
                <option value="urgency">Sort: Urgency</option>
                {homeRole !== "it_sme" && (
                  <option value="queue">{hasItSmeAssignment ? "Sort: Work backlog" : "Sort: Queue load"}</option>
                )}
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>
          {useItExpertExclusivePresentation && assignmentCount > visibleRows.length && (
            <div
              className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: "#bfdbfe", background: "#eff6ff", color: "#1e3a5f" }}
            >
              <span>
                {assignmentCount - visibleRows.length} assignment{assignmentCount - visibleRows.length === 1 ? "" : "s"} hidden by search. Clear the search field to see all cycles.
              </span>
              <button
                type="button"
                onClick={() => setCycleQuery("")}
                className={`${btnSecondaryCls} shrink-0`}
                style={{ borderColor: outline.border, color: outline.text }}
              >
                Clear search
              </button>
            </div>
          )}
          {!useItExpertExclusivePresentation && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewerFilter("all")}
                {...filterPillProps(reviewerFilter === "all")}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setReviewerFilter("needs_action")}
                {...filterPillProps(reviewerFilter === "needs_action")}
              >
                Needs action
              </button>
              <button
                type="button"
                onClick={() => {
                  setReviewerFilter("due_soon");
                  setSortMode("urgency");
                }}
                {...filterPillProps(reviewerFilter === "due_soon")}
                title={`Cycles with a submission deadline in the next ${DUE_SOON_DEADLINE_DAYS} days (or overdue). Soonest first.`}
              >
                Due soon
              </button>
              <button
                type="button"
                onClick={() => setReviewerFilter("queue_clear")}
                {...filterPillProps(reviewerFilter === "queue_clear")}
              >
                Queue clear
              </button>
            </div>
          )}

          <div className="mb-3 space-y-2">
            {!useItExpertExclusivePresentation && reviewerFilter === "due_soon" && (
              <p
                className="rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100"
              >
                <span className="font-semibold">Due soon</span> lists only cycles whose{" "}
                <span className="font-medium">target submission</span> or <span className="font-medium">end date</span> is within the next{" "}
                <span className="font-semibold tabular-nums">{DUE_SOON_DEADLINE_DAYS}</span> days (or already overdue). Cycles without a deadline date are hidden. Order uses{" "}
                <span className="font-medium">Sort: Urgency</span> (soonest deadline first).
              </p>
            )}
          </div>

          <div className="space-y-3">
          {visibleRows.map((r) => {
            const cycle = cycles.find((c) => c.id === r.id);
            const itExpertOpenHref = cycle ? cycleEntryPath(cycle) : `/cycles/${r.id}/dashboard`;
            const b = roleBadge(r.role);
            const disabled = !r.role;
            const dash = r.dashboard ?? null;
            const review = r.review ?? null;
            const evidenceDone = dash?.evidence_items ?? 0;
            const evidenceTotal = dash?.total_evidence_items ?? 0;
            const evidencePct = evidenceTotal > 0 ? Math.round((evidenceDone / evidenceTotal) * 100) : 0;
            const pending = review?.inReview ?? 0;
            const approved = review?.approved ?? 0;
            const returned = review?.rejected ?? 0;
            const reviewTotal = pending + approved + returned;
            const decided = approved + returned;
            const decidedPct = reviewTotal > 0 ? Math.round((decided / reviewTotal) * 100) : 0;
            const returnedPct = reviewTotal > 0 ? Math.round((returned / reviewTotal) * 100) : 0;
            const queueStateTone =
              pending > 0
                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
            const queueStateLabel = pending > 0 ? "Action needed" : "Queue clear";
            return (
              <div
                key={r.id}
                className={`relative rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  r.role === "it_sme" && !disabled ? "cursor-pointer" : ""
                }`}
                style={{
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {r.role === "it_sme" && !disabled && (
                  <Link
                    href={itExpertOpenHref}
                    className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D2691E]"
                    aria-label={`Open cycle ${r.label}`}
                  />
                )}
                <div className="relative z-0 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xl font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                        {r.label}
                      </p>
                      {!isReviewerRole(r.role) && r.role !== "it_sme" && (
                        <span className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold ${b.cls}`}>
                          {b.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--foreground-muted)" }}>
                      {r.displayId} · {r.phase} · {r.dueLabel}
                    </p>
                  </div>
                  {r.role === "it_sme" && (
                    <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:w-auto lg:max-w-[65%]">
                      {evidenceTotal > 0 && evidenceDone < evidenceTotal ? (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          Pending upload
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Uploads complete
                        </span>
                      )}
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {r.dueIn === null ? "No deadline" : r.dueIn <= 0 ? "Due now" : `${r.dueIn} day(s) left`}
                      </span>
                      <span className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold ${b.cls}`}>{b.label}</span>
                    </div>
                  )}
                  {isReviewerRole(r.role) && (
                    <div
                      className="w-full lg:ml-auto lg:w-fit rounded-xl border p-2.5 flex flex-wrap items-center justify-start gap-2 lg:justify-end"
                      style={{ borderColor: "#dbe3ee", background: "#f8fafc" }}
                    >
                      <Link
                        href={disabled ? "/dashboard" : r.href}
                        className={disabled ? `${btnSecondaryCls} opacity-70` : btnPrimaryCls}
                        style={
                          disabled
                            ? { borderColor: outline.border, color: outline.text }
                            : { background: primaryFill }
                        }
                      >
                        {disabled ? "Request access" : "Choose cycle"}
                      </Link>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${queueStateTone}`}>
                        {queueStateLabel}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {r.dueIn === null ? "No deadline" : r.dueIn <= 0 ? "Due now" : `${r.dueIn} day(s) left`}
                      </span>
                    </div>
                  )}
                </div>

                {r.role === "it_sme" && (
                  <div className="mt-3">
                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Evidence upload progress
                        </p>
                        <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                          {evidenceDone}/{evidenceTotal} ({evidencePct}%)
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-sky-100 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-sky-500"
                          style={{ width: `${Math.max(0, Math.min(100, evidencePct))}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                      <MiniKpi label="Assigned controls" value={dash?.total_controls ?? 0} tone="text-[var(--foreground)]" />
                      <MiniKpi label="Evidence uploaded" value={`${evidenceDone}/${evidenceTotal}`} tone="text-[var(--foreground)]" />
                      <MiniKpi label="In review" value={review?.inReview ?? 0} tone="text-violet-700 dark:text-violet-300" />
                      <MiniKpi label="Review succeeded" value={review?.approved ?? 0} tone="text-emerald-700 dark:text-emerald-300" />
                      <MiniKpi label="Reviewer rejected" value={review?.rejected ?? 0} tone="text-rose-700 dark:text-rose-300" />
                    </div>
                  </div>
                )}

                {isReviewerRole(r.role) && (
                  <div className="mt-3 border-t pt-3" style={{ borderColor: "#dbe3ee" }}>
                    <div className="mb-2 rounded-lg border px-3 py-2" style={{ borderColor: "#dbe3ee", background: "#f1f5f9" }}>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Decision Progress
                        </p>
                        <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                          {decidedPct}% complete
                        </p>
                      </div>
                      <div className="h-[5px] rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-[5px] rounded-full bg-violet-500"
                          style={{ width: `${Math.max(0, Math.min(100, decidedPct))}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px]" style={{ color: "var(--foreground-muted)" }}>
                        {decided} decided out of {reviewTotal} assigned for this cycle
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border px-3 py-2" style={{ borderColor: "#dbe3ee", background: "#f8fafc" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Awaiting your decision
                        </p>
                        <p className="mt-1 text-xl font-bold text-violet-700 dark:text-violet-300">{pending}</p>
                      </div>
                      <div className="rounded-lg border px-3 py-2" style={{ borderColor: "#dbe3ee", background: "#f8fafc" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Decisions (Approved / Returned)
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="rounded-md border px-2.5 py-2" style={{ borderColor: "#bbf7d0", background: "#ecfdf5" }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                              Approved
                            </p>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{approved}</p>
                          </div>
                          <div className="rounded-md border px-2.5 py-2" style={{ borderColor: "#fecaca", background: "#fff1f2" }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                              Returned
                            </p>
                            <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{returned}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border px-3 py-2" style={{ borderColor: "#dbe3ee", background: "#f8fafc" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Decision coverage
                        </p>
                        <p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-300">{decidedPct}%</p>
                      </div>
                      <div className="rounded-lg border px-3 py-2" style={{ borderColor: "#dbe3ee", background: "#f8fafc" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Return rate
                        </p>
                        <p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">{returnedPct}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && visibleRows.length === 0 && (
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              {useItExpertExclusivePresentation
                ? "No cycles match your search. Clear the search or try a different name or cycle id."
                : reviewerFilter === "due_soon"
                  ? `No cycles have a deadline in the next ${DUE_SOON_DEADLINE_DAYS} days (or overdue), or none match your search. Try “All” or “Needs action”.`
                  : "No cycles match the current filter or search. Try adjusting filters or clearing search."}
            </p>
          )}
          </div>
        </div>

        <div className="space-y-5 xl:col-span-1">
          <UpcomingDeadlinesPanel
            deadlineRows={upcomingDeadlineRows}
            loading={loading}
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


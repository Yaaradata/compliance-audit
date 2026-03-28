"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AssessmentCycle, User, UserRole } from "@/lib/types";
import { api } from "@/lib/api";
import { ReviewerQueueOverviewPanel, RoleDashboardHero, StatKpiArticleGrid } from "@/components/roles/shared";
import type {
  CycleDashboard,
  CycleReviewStats,
  EvidenceReviewApiRow,
  ReviewerQueueOverviewData,
} from "@/components/roles/shared/compliance-types";
import { daysTo, normalizeRoleForCycle, phaseLabel, cycleEntryPath } from "@/components/roles/shared/utils";

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
  if (!role) return "/assessments/new";
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
  const firstName = user.name?.split(/\s+/)[0] ?? "there";
  const isReviewerRole = (role: string | null) =>
    role === "internal_reviewer_l1" || role === "internal_reviewer_l2" || role === "external_assessor";
  const [rolesByCycleId, setRolesByCycleId] = useState<Record<string, string | null>>({});
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [dashByCycleId, setDashByCycleId] = useState<Record<string, CycleDashboard | null>>({});
  const [reviewByCycleId, setReviewByCycleId] = useState<Record<string, CycleReviewStats | null>>({});
  const [loadingCards, setLoadingCards] = useState(false);
  const [visualCycleId, setVisualCycleId] = useState<string | null>(null);
  const [cycleQuery, setCycleQuery] = useState("");
  const [reviewerFilter, setReviewerFilter] = useState<"all" | "needs_action" | "due_soon" | "queue_clear">("all");
  const [itExpertListFilter, setItExpertListFilter] = useState<"all" | "due_soon" | "needs_upload">("all");
  const [sortMode, setSortMode] = useState<"urgency" | "queue" | "name">("urgency");

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
  const reviewerRows = useMemo(
    () => rows.filter((r) => isReviewerRole(r.role)),
    [rows]
  );
  const itExpertRows = useMemo(() => rows.filter((r) => r.role === "it_sme"), [rows]);
  const showItExpertVisualization = homeRole === "it_sme";

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

      if (showItExpertVisualization) {
        // Home JWT may be IT Expert while other cycles use reviewer roles — list filters must not drop those rows.
        if (!r.role) return false;
        if (itExpertListFilter === "due_soon") return (r.dueIn ?? 999) <= 7;
        if (itExpertListFilter === "needs_upload") {
          if (r.role === "it_sme") {
            const done = r.dashboard?.evidence_items ?? 0;
            const total = r.dashboard?.total_evidence_items ?? 0;
            return total > 0 && done < total;
          }
          if (isReviewerRole(r.role)) {
            return (r.review?.inReview ?? 0) > 0;
          }
          return false;
        }
        return true;
      }

      if (reviewerFilter === "needs_action") return pending > 0;
      if (reviewerFilter === "due_soon") return (r.dueIn ?? 999) <= 7;
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
        if (showItExpertVisualization) return mixedHomeQueueScore(b) - mixedHomeQueueScore(a);
        return (b.review?.inReview ?? 0) - (a.review?.inReview ?? 0);
      }
      const aDue = a.dueIn ?? Number.POSITIVE_INFINITY;
      const bDue = b.dueIn ?? Number.POSITIVE_INFINITY;
      if (aDue !== bDue) return aDue - bDue;
      if (showItExpertVisualization) return mixedHomeQueueScore(b) - mixedHomeQueueScore(a);
      return (b.review?.inReview ?? 0) - (a.review?.inReview ?? 0);
    });
  }, [rows, cycleQuery, reviewerFilter, itExpertListFilter, sortMode, showItExpertVisualization]);

  const assignmentCount = rows.filter((r) => Boolean(r.role)).length;
  const accessible = assignmentCount;
  const inProgress = rows.filter((r) => r.role && !["submitted", "archived"].includes((r.phase || "").toLowerCase())).length;
  const evidenceUploaded = rows
    .filter((r) => r.role === "it_sme")
    .reduce((acc, r) => acc + (r.dashboard?.evidence_items ?? 0), 0);
  const aiInReview = rows
    .filter((r) => (showItExpertVisualization ? r.role === "it_sme" : Boolean(r.role)))
    .reduce((acc, r) => acc + (r.review?.inReview ?? 0), 0);

  const deadlineRows = useMemo(() => {
    return visibleRows
      .filter((r) => Boolean(r.role) && r.dueIn !== null)
      .sort((a, b) => (a.dueIn ?? 9999) - (b.dueIn ?? 9999))
      .slice(0, 6);
  }, [visibleRows]);

  const loading = loadingRoles || loadingCards;

  const roleLabel = (role: string | null) => {
    if (role === "internal_reviewer_l1") return "L1 Reviewer";
    if (role === "internal_reviewer_l2") return "L2 Reviewer";
    if (role === "external_assessor") return "L3 Assessor";
    return "Reviewer";
  };
  const baseControlClass =
    "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
  const activeFilterClass = `${baseControlClass} interactive-filter-active bg-slate-900 text-white border-slate-900`;
  const inactiveFilterClass = `${baseControlClass} interactive-filter-inactive bg-white text-slate-700 border-slate-300 hover:bg-slate-50`;
  const reviewerOverview = useMemo<ReviewerQueueOverviewData>(() => {
    const sourceRows = visualCycleId ? reviewerRows.filter((r) => r.id === visualCycleId) : reviewerRows;
    const totals = sourceRows.reduce(
      (acc, r) => {
        acc.inQueue += r.review?.inReview ?? 0;
        acc.approved += r.review?.approved ?? 0;
        acc.returned += r.review?.rejected ?? 0;
        return acc;
      },
      { inQueue: 0, approved: 0, returned: 0 }
    );
    const totalItems = totals.inQueue + totals.approved + totals.returned;
    const pct = (value: number) => (totalItems > 0 ? Math.round((value / totalItems) * 100) : 0);
    const inQueuePct = pct(totals.inQueue);
    const approvedPct = pct(totals.approved);
    const returnedPct = pct(totals.returned);
    const topBucket = [
      { label: "In Queue", value: inQueuePct },
      { label: "Approved", value: approvedPct },
      { label: "Returned", value: returnedPct },
    ].sort((a, b) => b.value - a.value)[0];
    return {
      center: topBucket?.value ?? 0,
      centerLabel: topBucket?.label ?? "In Queue",
      totalItems,
      rows: [
        { label: "In Queue", value: inQueuePct, count: totals.inQueue, color: "#7c3aed" },
        { label: "Approved", value: approvedPct, count: totals.approved, color: "#10b981" },
        { label: "Returned", value: returnedPct, count: totals.returned, color: "#ef4444" },
      ],
    };
  }, [reviewerRows, visualCycleId]);

  const itExpertOverview = useMemo<ReviewerQueueOverviewData>(() => {
    const sourceRows = visualCycleId ? itExpertRows.filter((r) => r.id === visualCycleId) : itExpertRows;
    const totals = sourceRows.reduce(
      (acc, r) => {
        const done = r.dashboard?.evidence_items ?? 0;
        const total = r.dashboard?.total_evidence_items ?? 0;
        acc.pendingUpload += Math.max(0, total - done);
        acc.inReview += r.review?.inReview ?? 0;
        acc.approved += r.review?.approved ?? 0;
        acc.returned += r.review?.rejected ?? 0;
        return acc;
      },
      { pendingUpload: 0, inReview: 0, approved: 0, returned: 0 }
    );
    const totalItems = totals.pendingUpload + totals.inReview + totals.approved + totals.returned;
    const pct = (value: number) => (totalItems > 0 ? Math.round((value / totalItems) * 100) : 0);
    const pu = pct(totals.pendingUpload);
    const ir = pct(totals.inReview);
    const ap = pct(totals.approved);
    const rt = pct(totals.returned);
    const topBucket = [
      { label: "Pending upload", value: pu },
      { label: "In review", value: ir },
      { label: "Approved", value: ap },
      { label: "Returned", value: rt },
    ].sort((a, b) => b.value - a.value)[0];
    return {
      center: topBucket?.value ?? 0,
      centerLabel: topBucket?.label ?? "Pending upload",
      totalItems,
      rows: [
        { label: "Pending upload", value: pu, count: totals.pendingUpload, color: "#f59e0b" },
        { label: "In review", value: ir, count: totals.inReview, color: "#7c3aed" },
        { label: "Approved", value: ap, count: totals.approved, color: "#10b981" },
        { label: "Returned", value: rt, count: totals.returned, color: "#ef4444" },
      ],
    };
  }, [itExpertRows, visualCycleId]);

  const btnPrimarySm =
    "interactive-btn-blue-filled inline-flex items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1";
  const btnSecondarySm =
    "interactive-btn-secondary-outline inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 disabled:opacity-60";

  const MiniKpi = ({ label, value, tone }: { label: string; value: string | number; tone: string }) => (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );

  return (
    <div className="w-full space-y-5 pb-6">
      <RoleDashboardHero
        eyebrow="Your Dashboard"
        greetingName={firstName}
        description={
          showItExpertVisualization
            ? "Upload and track evidence by cycle. Open a cycle below to continue collection, or switch assessments anytime."
            : "Your work changes by cycle. Pick a cycle below to jump into the correct workspace for your assigned role."
        }
        primaryActions={[
          {
            href: "/assessments/new",
            label: showItExpertVisualization ? "Assessment cycles" : "Switch / view cycles",
            gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          },
        ]}
      />

      <StatKpiArticleGrid
        items={[
          {
            label: "Assigned cycles",
            value: String(accessible),
            sub: showItExpertVisualization ? "Cycles where you have a role" : "Cycles assigned to this user",
            tone: "bg-[var(--primary-muted)] text-[var(--primary)]",
            meter: Math.min(100, accessible * 20),
          },
          {
            label: "In progress",
            value: String(inProgress),
            sub: "Active phases (not submitted)",
            tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
            meter: accessible ? Math.round((inProgress / Math.max(1, accessible)) * 100) : 0,
          },
          {
            label: "Evidence uploaded",
            value: String(evidenceUploaded),
            sub: showItExpertVisualization ? "Evidence items you have submitted" : "Submissions uploaded by IT Expert",
            tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
            meter: Math.min(100, evidenceUploaded * 6),
          },
          {
            label: "In review",
            value: String(aiInReview),
            sub: showItExpertVisualization ? "Your submissions currently in review" : "Items in the review queue",
            tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
            meter: Math.min(100, aiInReview * 10),
          },
        ]}
        loading={loading}
        ariaLabel="User dashboard KPIs"
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div
          className="rounded-2xl border p-4 sm:p-5 xl:col-span-2"
          style={{ borderColor: "#cbd5e1", background: "#ffffff" }}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Cycle-wise insights
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                {visibleRows.length} visible
                {assignmentCount > 0 ? ` · ${assignmentCount} assigned` : ""}
              </span>
              <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                {showItExpertVisualization
                  ? "Evidence, review work, and deadlines for each assignment"
                  : "Reviewer-focused cycle health view"}
              </span>
            </div>
          </div>
          {showItExpertVisualization && assignmentCount > visibleRows.length && (
            <div
              className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: "#bfdbfe", background: "#eff6ff", color: "#1e3a5f" }}
            >
              <span>
                {assignmentCount - visibleRows.length} assignment{assignmentCount - visibleRows.length === 1 ? "" : "s"} hidden by filters or search. Use{" "}
                <strong>All</strong> to see IT Expert and reviewer cycles together.
              </span>
              <button
                type="button"
                onClick={() => {
                  setItExpertListFilter("all");
                  setCycleQuery("");
                }}
                className={`${btnSecondarySm} shrink-0`}
              >
                Clear filters
              </button>
            </div>
          )}
          <div className="mb-3 flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#cfd8e3", background: "#ffffff" }}>
            <div className="flex flex-wrap items-center gap-2">
              {showItExpertVisualization ? (
                <>
                  <button
                    type="button"
                    onClick={() => setItExpertListFilter("all")}
                    className={itExpertListFilter === "all" ? activeFilterClass : inactiveFilterClass}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setItExpertListFilter("due_soon")}
                    className={itExpertListFilter === "due_soon" ? activeFilterClass : inactiveFilterClass}
                  >
                    Due soon
                  </button>
                  <button
                    type="button"
                    onClick={() => setItExpertListFilter("needs_upload")}
                    className={itExpertListFilter === "needs_upload" ? activeFilterClass : inactiveFilterClass}
                    title="IT cycles with evidence still to upload, or reviewer cycles with items in your queue"
                  >
                    Work backlog
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setReviewerFilter("all")}
                    className={reviewerFilter === "all" ? activeFilterClass : inactiveFilterClass}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewerFilter("needs_action")}
                    className={reviewerFilter === "needs_action" ? activeFilterClass : inactiveFilterClass}
                  >
                    Needs action
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewerFilter("due_soon")}
                    className={reviewerFilter === "due_soon" ? activeFilterClass : inactiveFilterClass}
                  >
                    Due soon
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewerFilter("queue_clear")}
                    className={reviewerFilter === "queue_clear" ? activeFilterClass : inactiveFilterClass}
                  >
                    Queue clear
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="search"
                value={cycleQuery}
                onChange={(e) => setCycleQuery(e.target.value)}
                placeholder="Search cycle name or id"
                className="interactive-select h-9 w-full min-w-[200px] rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:w-56"
              />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as "urgency" | "queue" | "name")}
                className="interactive-select h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <option value="urgency">Sort: Urgency</option>
                <option value="queue">{showItExpertVisualization ? "Sort: Work backlog" : "Sort: Queue load"}</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
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
                className="rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: "#cbd5e1",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
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
                      <Link href={itExpertOpenHref} className={`${btnPrimarySm} shrink-0`}>
                        Open cycle
                      </Link>
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
                        href={disabled ? "/assessments/new" : r.href}
                        className={disabled ? `${btnSecondarySm} opacity-70` : btnPrimarySm}
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
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-cyan-500"
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

                <div className="mt-3 border-t pt-3" style={{ borderColor: "#dbe3ee" }} />
              </div>
            );
          })}

          {!loading && visibleRows.length === 0 && (
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              No cycles match the current filter/search. Try clearing filters.
            </p>
          )}
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "#cbd5e1", background: "#f1f5f9" }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                {showItExpertVisualization ? "Upcoming deadlines" : "Cycle deadlines"}
              </h2>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                {showItExpertVisualization ? "Nearest due dates for your cycles" : "Quick links by due date"}
              </p>
            </div>
            <Link href="/assessments/new" className={`${btnSecondarySm} shrink-0`}>
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {deadlineRows.map((r) => (
              <Link
                key={r.id}
                href={r.href}
                className="interactive-card-link block rounded-lg border p-2.5 hover:-translate-y-0.5"
                style={{ borderColor: "#cbd5e1", background: "#ffffff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {r.label}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                      {r.displayId} · {r.phase}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      {r.dueLabel}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                      {roleBadge(r.role).label}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {!loading && deadlineRows.length === 0 && (
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                No deadlines configured for your assigned cycles.
              </p>
            )}
          </div>
          <div className="mt-4">
            {showItExpertVisualization ? (
              <ReviewerQueueOverviewPanel
                data={itExpertOverview}
                hasSelectedCycle={visualCycleId !== null}
                onShowAllCycles={() => setVisualCycleId(null)}
                title="Evidence overview"
                distributionCaption={`Evidence mix (${itExpertOverview.totalItems} items across your cycles)`}
                visualCycleId={visualCycleId}
                onVisualCycleChange={setVisualCycleId}
                cycleOptions={itExpertRows.map((r) => ({ id: r.id, display_id: r.displayId }))}
              />
            ) : (
              <ReviewerQueueOverviewPanel
                data={reviewerOverview}
                hasSelectedCycle={visualCycleId !== null}
                onShowAllCycles={() => setVisualCycleId(null)}
                title="Reviewer Queue Overview"
                distributionCaption={`Queue distribution (${reviewerOverview.totalItems} reviewer items)`}
                visualCycleId={visualCycleId}
                onVisualCycleChange={setVisualCycleId}
                cycleOptions={reviewerRows.map((r) => ({ id: r.id, display_id: r.displayId }))}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


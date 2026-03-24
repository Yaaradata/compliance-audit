"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import type { CycleInsight } from "@/components/roles/shared/compliance-types";
import { cycleEntryPath, daysTo, initials, PHASE_ORDER, phaseLabel, phaseStep } from "@/components/roles/shared/utils";

export type { CycleDashboard, CycleInsight } from "@/components/roles/shared/compliance-types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }) as ComponentType<{
  data: Record<string, unknown>[];
  layout: Record<string, unknown>;
  config?: { displayModeBar?: boolean; responsive?: boolean };
  style?: CSSProperties;
}>;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthEnd(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
export function ComplianceOfficerHomeDashboard({
  userName,
  insights,
  loading,
}: {
  userName: string;
  insights: CycleInsight[];
  loading: boolean;
}) {
  const cycles = useMemo(() => insights.map((i) => i.cycle), [insights]);
  const [visualCycleId, setVisualCycleId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const sortedInsights = useMemo(
    () =>
      [...insights].sort((a, b) => {
        const da = daysTo(a.cycle.target_submission_date ?? a.cycle.end_date) ?? Number.POSITIVE_INFINITY;
        const db = daysTo(b.cycle.target_submission_date ?? b.cycle.end_date) ?? Number.POSITIVE_INFINITY;
        return da - db;
      }),
    [insights]
  );

  const totals = useMemo(() => {
    return insights.reduce(
      (acc, item) => {
        acc.controls += item.dashboard?.total_controls ?? 0;
        acc.evidence += item.dashboard?.evidence_items ?? 0;
        acc.evidenceTotal += item.dashboard?.total_evidence_items ?? 0;
        acc.gaps += item.dashboard?.gaps_identified ?? 0;
        acc.scoreSum += item.dashboard?.overall_score ?? 0;
        acc.scoreCount += item.dashboard ? 1 : 0;
        return acc;
      },
      { controls: 0, evidence: 0, evidenceTotal: 0, gaps: 0, scoreSum: 0, scoreCount: 0 }
    );
  }, [insights]);

  const deadlineRows = useMemo(() => {
    return sortedInsights
      .map((r) => {
        const days = daysTo(r.cycle.target_submission_date ?? r.cycle.end_date);
        return { ...r, days };
      })
      .filter((r) => r.days !== null)
      .slice(0, 6);
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
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [sortedInsights]);

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => monthStart(new Date()));
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

  const complianceOverview = useMemo(() => {
    const sourceInsights = visualCycleId
      ? sortedInsights.filter((r) => r.cycle.id === visualCycleId)
      : sortedInsights;

    let evidenceSubmitted = 0;
    let evidenceNotSubmitted = 0;
    let gapsCurrently = 0;
    let inReview = 0;

    sourceInsights.forEach((r) => {
      const evidenceDone = r.dashboard?.evidence_items ?? 0;
      const evidenceTotal = r.dashboard?.total_evidence_items ?? 0;
      const totalControls = r.dashboard?.total_controls ?? 0;
      const compliantControls = Math.round((totalControls * (r.dashboard?.overall_score ?? 0)) / 100);
      const pendingControls = Math.max(0, totalControls - compliantControls);
      const estimatedInReview = Math.max(0, Math.min(pendingControls, Math.round(totalControls * 0.2)));

      evidenceSubmitted += evidenceDone;
      evidenceNotSubmitted += Math.max(0, evidenceTotal - evidenceDone);
      gapsCurrently += r.dashboard?.gaps_identified ?? 0;
      inReview += estimatedInReview;
    });

    const total = evidenceSubmitted + evidenceNotSubmitted + gapsCurrently + inReview;
    const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

    const submittedPct = pct(evidenceSubmitted);
    const notSubmittedPct = pct(evidenceNotSubmitted);
    const gapsPct = pct(gapsCurrently);
    const inReviewPct = pct(inReview);

    const topBucket = [
      { label: "Submitted", value: submittedPct },
      { label: "Not submitted", value: notSubmittedPct },
      { label: "Gaps", value: gapsPct },
      { label: "In Review", value: inReviewPct },
    ].sort((a, b) => b.value - a.value)[0];

    return {
      center: topBucket?.value ?? 0,
      centerLabel: topBucket?.label ?? "Submitted",
      totalCycles: total,
      selectedCycle: sourceInsights[0]?.cycle ?? null,
      selectedCycleEvidencePct:
        sourceInsights[0] && (sourceInsights[0].dashboard?.total_evidence_items ?? 0) > 0
          ? Math.round(
              ((sourceInsights[0].dashboard?.evidence_items ?? 0) /
                (sourceInsights[0].dashboard?.total_evidence_items ?? 0)) *
                100
            )
          : 0,
      selectedCycleHealthPct: sourceInsights[0]?.dashboard?.overall_score ?? 0,
      selectedCycleCreatedOn: sourceInsights[0]?.cycle?.created_at
        ? new Date(sourceInsights[0].cycle.created_at).toLocaleDateString()
        : "n/a",
      rows: [
        { label: "Evidence Submitted", value: submittedPct, count: evidenceSubmitted, color: "#14b8a6" },
        { label: "Evidence Not Submitted", value: notSubmittedPct, count: evidenceNotSubmitted, color: "#f59e0b" },
        { label: "Gaps Currently", value: gapsPct, count: gapsCurrently, color: "#ef4444" },
        { label: "In Review", value: inReviewPct, count: inReview, color: "#3b82f6" },
      ],
    };
  }, [sortedInsights, visualCycleId]);

  const avgScore = totals.scoreCount > 0 ? Math.round(totals.scoreSum / totals.scoreCount) : 0;
  const evidencePct = totals.evidenceTotal > 0 ? Math.round((totals.evidence / totals.evidenceTotal) * 100) : 0;
  const inFlight = cycles.filter((c) => !["submitted", "archived"].includes((c.phase || "").toLowerCase())).length;
  const urgentCycles = deadlineRows.filter((d) => (d.days ?? 99) <= 2).length;
  const firstName = userName.split(/\s+/)[0] ?? "there";
  const kpiCards = [
    {
      label: "Cycles",
      value: cycles.length,
      sub: "Total assessments",
      href: "/assessments/new",
      aria: `Open cycles list. ${cycles.length} cycles total`,
      tone: "bg-[var(--primary-muted)] text-[var(--primary)]",
      meter: Math.min(100, cycles.length * 12),
    },
    {
      label: "In Progress",
      value: inFlight,
      sub: `${urgentCycles} urgent`,
      href: "/assessments/new",
      aria: `Open in-progress cycle list. ${inFlight} active cycles and ${urgentCycles} urgent`,
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      meter: cycles.length > 0 ? Math.round((inFlight / cycles.length) * 100) : 0,
    },
    {
      label: "Avg Score",
      value: `${avgScore}%`,
      sub: "Compliance health",
      href: "/report",
      aria: `Open reporting. Average score is ${avgScore} percent`,
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      meter: avgScore,
    },
    {
      label: "Controls",
      value: totals.controls,
      sub: "Across cycles",
      href: "/assessments/new",
      aria: `Open cycle controls context. ${totals.controls} controls tracked`,
      tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
      meter: totals.controls > 0 ? Math.min(100, Math.round((totals.controls / 400) * 100)) : 0,
    },
    {
      label: "Evidence",
      value: totals.evidence,
      sub: `${evidencePct}% uploaded`,
      href: "/assessments/new",
      aria: `Open evidence coverage context. ${totals.evidence} evidence files, ${evidencePct} percent uploaded`,
      tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      meter: evidencePct,
    },
    {
      label: "Risk Gaps",
      value: totals.gaps,
      sub: "Needs attention",
      href: "/report",
      aria: `Open risk gaps report. ${totals.gaps} risk gaps`,
      tone: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
      meter: totals.gaps > 0 ? Math.min(100, Math.round((totals.gaps / 40) * 100)) : 0,
    },
  ];

  return (
    <div className="w-full space-y-5 pb-6">
      <section
        className="rounded-2xl border p-5 sm:p-6"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
              Compliance Officer Command Center
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--foreground)" }}>
              Good day, {firstName}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
              Monitor every cycle, every phase, and identify risks before they impact audit timelines.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/assessments/new"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
            >
              + New cycle
            </Link>
            <Link
              href="/report"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }}
            >
              Export report
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Compliance KPI cards">
        {kpiCards.slice(0, 4).map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            aria-label={kpi.aria}
            className="group rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                {kpi.label}
              </p>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${kpi.tone}`}>
                Live
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              {loading ? "—" : kpi.value}
            </p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{kpi.sub}</p>
            <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-1.5 rounded-full bg-[var(--primary)] transition-all"
                style={{ width: `${loading ? 20 : kpi.meter}%` }}
                aria-hidden
              />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border p-4 xl:col-span-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Cycle-wise performance</h2>
            <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>Status, progress, and direct navigation</span>
          </div>
          <div className="space-y-3">
            {sortedInsights.map((row) => {
              const c = row.cycle;
              const phaseIdx = phaseStep(c.phase);
              const completionPct = Math.round((phaseIdx / (PHASE_ORDER.length - 1)) * 100);
              const evidenceDone = row.dashboard?.evidence_items ?? 0;
              const evidenceTotal = row.dashboard?.total_evidence_items ?? 0;
              const controlsInReview = Math.max(0, Math.min(row.dashboard?.total_controls ?? 0, Math.round((row.dashboard?.total_controls ?? 0) * 0.2)));
              const controlsAtRisk = row.dashboard?.gaps_identified ?? 0;
              const days = daysTo(c.target_submission_date ?? c.end_date);
              const dueDateLabel = (c.target_submission_date ?? c.end_date)
                ? new Date(c.target_submission_date ?? c.end_date ?? "").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                : null;
              const dueLabel = days === null ? "No deadline" : days <= 0 ? "Due now" : `${days} days left`;
              const evidenceInReview = Math.min(evidenceDone, controlsInReview);
              const statusRows = row.dashboard?.control_scores ?? [];
              const l2Review = statusRows.filter((s) => (s.status ?? "").toLowerCase().includes("l2")).length;
              const l3Review = statusRows.filter((s) => (s.status ?? "").toLowerCase().includes("l3")).length;
              const l1Review = Math.max(0, evidenceInReview - l2Review - l3Review);
              const submissionScore = evidenceTotal > 0 ? Math.round((evidenceDone / evidenceTotal) * 100) : 0;
              const submissionScoreLabel = submissionScore < 25 ? "Critical — below 25%" : submissionScore < 50 ? "Needs attention" : submissionScore < 75 ? "Moderate" : "Healthy";
              const relatedUsers = row.relatedUsers.slice(0, 4);
              const remainingUsers = Math.max(0, row.relatedUsers.length - relatedUsers.length);
              const cycleInitials = initials(c.label || c.display_id || "CY");
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border p-0 overflow-hidden"
                  style={{
                    borderColor: "#eef0f4",
                    background: "#ffffff",
                    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  {/* Top header section */}
                  <div className="p-6 border-b" style={{ borderColor: "#eef0f4" }}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex items-start gap-3">
                        <div
                          className="h-11 w-11 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold uppercase tracking-wide"
                          style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
                          aria-hidden
                        >
                          {cycleInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[28px] font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                            {c.label}
                          </p>
                          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                            {c.display_id} · Year {c.cycle_year} · Created {c.created_at ? new Date(c.created_at).toLocaleDateString() : "n/a"}
                          </p>
                          <div className="mt-2" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 lg:self-center">
                        {row.relatedUsers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {relatedUsers.map((u, idx) => (
                                <span
                                  key={u.id}
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white ${
                                    idx % 4 === 0
                                      ? "bg-indigo-600"
                                      : idx % 4 === 1
                                        ? "bg-cyan-600"
                                        : idx % 4 === 2
                                          ? "bg-violet-600"
                                          : "bg-emerald-600"
                                  }`}
                                  style={{ marginLeft: idx === 0 ? 0 : -8, borderColor: "var(--surface)" }}
                                  title={u.name}
                                  aria-label={`${u.name} is assigned to ${c.label}`}
                                >
                                  {initials(u.name)}
                                </span>
                              ))}
                              {remainingUsers > 0 && (
                                <span
                                  className="ml-[-8px] inline-flex h-8 w-8 items-center justify-center rounded-full border-2 bg-slate-700 text-[10px] font-bold text-white"
                                  style={{ borderColor: "var(--surface)" }}
                                  title={`${remainingUsers} more users`}
                                  aria-label={`${remainingUsers} more users assigned to ${c.label}`}
                                >
                                  +{remainingUsers}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            days !== null && days <= 2 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {dueDateLabel ? `${dueLabel} · ${dueDateLabel}` : dueLabel}
                        </span>
                        <Link
                          href={cycleEntryPath(c)}
                          className="inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold text-white"
                          style={{ background: "#0f172a" }}
                        >
                          Open cycle
                        </Link>
                        <button
                          type="button"
                          onClick={() => setVisualCycleId(c.id)}
                          className="inline-flex items-center rounded-lg border px-3 py-2 text-xs font-semibold"
                          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                        >
                          View visuals
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: "var(--foreground-muted)" }}>
                      Phase: {phaseLabel(c.phase)} · Updated recently
                    </p>
                  </div>

                  {/* Middle metrics section */}
                  <div className="p-6 space-y-2">
                    <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Evidence Files
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="rounded-md px-3 py-2.5" style={{ background: "#f8f9fa" }}>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                              <span className="h-2 w-2 rounded-full" style={{ background: "#3b82f6" }} />
                              Total
                            </div>
                            <div className="text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{evidenceTotal}</div>
                          </div>
                          <div className="rounded-md px-3 py-2.5" style={{ background: "#f8f9fa" }}>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                              <span className="h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />
                              Uploaded
                            </div>
                            <div className="text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{evidenceDone}</div>
                          </div>
                          <div className="rounded-md px-3 py-2.5" style={{ background: "#f8f9fa" }}>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                              <span className="h-2 w-2 rounded-full" style={{ background: "#9333ea" }} />
                              AI Passed
                            </div>
                            <div className="text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{Math.max(0, evidenceDone - controlsAtRisk)}</div>
                          </div>
                          <div className="rounded-md px-3 py-2.5" style={{ background: "#f8f9fa" }}>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                              <span className="h-2 w-2 rounded-full" style={{ background: "#f59e0b" }} />
                              In Review
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                              <span className="rounded-md px-2 py-0.5" style={{ color: "#1d4ed8", background: "#dbeafe" }}>L1 : {l1Review}</span>
                              <span className="rounded-md px-2 py-0.5" style={{ color: "#6d28d9", background: "#ede9fe" }}>L2 : {l2Review}</span>
                              <span className="rounded-md px-2 py-0.5" style={{ color: "#b91c1c", background: "#fee2e2" }}>L3 : {l3Review}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex h-full flex-col">
                        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Evidence Submission Score
                        </p>
                        <div className="mt-2 h-full rounded-md border p-3" style={{ borderColor: "#eef0f4", background: "#ffffff" }}>
                          <p className="mt-0.5 text-[40px] font-bold leading-none" style={{ color: "var(--foreground)" }}>
                            {submissionScore}%
                          </p>
                          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{evidenceDone} of {evidenceTotal} submitted</p>
                          <div className="mt-2 h-2 rounded bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded bg-red-500" style={{ width: `${Math.max(0, Math.min(100, submissionScore))}%` }} />
                          </div>
                          <p className="mt-2 text-xs font-semibold text-red-600">{submissionScoreLabel}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom phase + CTA row */}
                  <div className="px-6 pb-6">
                    <div className="border-t pt-3 rounded-xl px-2 py-3" style={{ borderColor: "#eef0f4", background: "#ffffff" }}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--foreground-muted)" }}>
                          Cycle Progress
                        </p>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          <span className="font-bold">{completionPct}% complete</span>
                        </p>
                      </div>

                      <div className="relative pt-2">
                        <div className="absolute left-4 right-4 top-[18px] h-[3px] rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div
                          className="absolute left-4 top-[18px] h-[3px] rounded-full bg-emerald-500"
                          style={{ width: `calc((100% - 2rem) * ${Math.max(0, Math.min(100, completionPct)) / 100})` }}
                        />
                        <div className="grid grid-cols-4 relative">
                          {["setup", "collection", "review", "approval"].map((step, idx) => {
                            const isCompleted = idx < phaseIdx;
                            const isCurrent = idx === phaseIdx;
                            return (
                              <div key={step} className="flex flex-col items-center">
                                <span
                                  className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold ${
                                    isCompleted
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : isCurrent
                                        ? "bg-white border-emerald-500 text-emerald-600 animate-pulse"
                                        : "bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500"
                                  }`}
                                >
                                  {isCompleted ? "✓" : idx + 1}
                                </span>
                                <span
                                  className={`mt-2 text-[11px] font-semibold uppercase tracking-wide ${
                                    isCompleted || isCurrent ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400 dark:text-slate-500"
                                  }`}
                                >
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!loading && sortedInsights.length === 0 && (
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                No cycles available. Create your first assessment cycle to start tracking execution.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Upcoming deadlines</h3>
              <button
                type="button"
                onClick={() => {
                  const first = calendarDeadlines[0]?.date ?? new Date();
                  setCalendarMonth(monthStart(first));
                  setIsCalendarOpen(true);
                }}
                className="text-xs font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Calendar view
              </button>
            </div>
            <div className="space-y-2">
              {deadlineRows.map((row) => (
                <div key={row.cycle.id} className="rounded-lg border p-2.5" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{row.cycle.label}</p>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    {phaseLabel(row.cycle.phase)} · {row.days! <= 0 ? "Due today/overdue" : `${row.days} day(s) left`}
                  </p>
                </div>
              ))}
              {!loading && deadlineRows.length === 0 && (
                <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>No dated deadlines configured yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Compliance Overview
              </h3>
              <div className="flex items-center gap-3">
                {complianceOverview.selectedCycle && (
                  <button
                    type="button"
                    onClick={() => setVisualCycleId(null)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    Show all cycles
                  </button>
                )}
                <Link href="/report" className="text-xs font-medium hover:underline" style={{ color: "var(--primary)" }}>
                  Details
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="mx-auto h-40 w-40 shrink-0">
                <Plot
                  data={[
                    {
                      type: "pie",
                      values: complianceOverview.rows.map((r) => r.count),
                      labels: complianceOverview.rows.map((r) => r.label),
                      hole: 0.7,
                      sort: false,
                      direction: "clockwise",
                      textinfo: "none",
                      marker: { colors: complianceOverview.rows.map((r) => r.color) },
                      hovertemplate: "%{label}: %{value} cycles (%{percent})<extra></extra>",
                    },
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 0, r: 0, t: 0, b: 0 },
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    showlegend: false,
                    annotations: [
                      {
                        x: 0.5,
                        y: 0.56,
                        xref: "paper",
                        yref: "paper",
                        text: `<b>${complianceOverview.center}%</b>`,
                        showarrow: false,
                        font: { size: 24, color: "#0f172a" },
                      },
                      {
                        x: 0.5,
                        y: 0.42,
                        xref: "paper",
                        yref: "paper",
                        text: complianceOverview.centerLabel,
                        showarrow: false,
                        font: { size: 11, color: "#64748b" },
                      },
                    ],
                  }}
                  config={{ displayModeBar: false, responsive: true }}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                  Cycle Distribution ({complianceOverview.totalCycles} cycles)
                </p>
                {complianceOverview.rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: row.color }} />
                      <span style={{ color: "var(--foreground)" }}>{row.label}</span>
                    </div>
                    <span className="font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>
                      {row.value}% ({row.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {isCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Deadlines calendar">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close calendar"
            onClick={() => setIsCalendarOpen(false)}
          />
          <div
            className="relative w-full max-w-3xl rounded-2xl border p-4 sm:p-5 shadow-xl"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h4 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                Deadlines Calendar
              </h4>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Close
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCalendarMonth((prev) => addMonths(prev, -1))}
                className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Prev
              </button>
              <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {calendarMonthLabel}
              </div>
              <button
                type="button"
                onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              {WEEKDAY_LABELS.map((w) => (
                <div key={w} className="px-1 py-1 text-center">{w}</div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-16 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--background)" }} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const key = toDateKey(d);
                const marks = deadlineMap.get(key) ?? [];
                const hasDeadline = marks.length > 0;
                const today = toDateKey(new Date()) === key;
                return (
                  <div
                    key={key}
                    className={`h-16 rounded-md border p-1.5 ${hasDeadline ? "ring-1 ring-amber-400" : ""}`}
                    style={{ borderColor: "var(--border)", background: hasDeadline ? "color-mix(in srgb, var(--warning-bg) 40%, var(--surface) 60%)" : "var(--background)" }}
                    title={hasDeadline ? marks.map((m) => `${m.displayId} · ${m.label}`).join("\n") : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${today ? "text-blue-700" : ""}`} style={!today ? { color: "var(--foreground)" } : undefined}>
                        {day}
                      </span>
                      {hasDeadline && (
                        <span className="text-[10px] font-semibold rounded px-1 py-0.5 bg-amber-100 text-amber-700">
                          {marks.length}
                        </span>
                      )}
                    </div>
                    {hasDeadline && (
                      <div className="mt-1 truncate text-[10px] font-medium" style={{ color: "var(--foreground-muted)" }}>
                        {marks[0].displayId}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


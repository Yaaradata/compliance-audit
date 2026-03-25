"use client";

import { useMemo, useState } from "react";
import { NewAssessmentCycleModal } from "@/components/assessments/new-assessment-cycle-modal";
import {
  ComplianceOverviewPanel,
  CyclePerformanceSection,
  DashboardKpiGrid,
  DeadlinesCalendarModal,
  RoleDashboardHero,
  UpcomingDeadlinesPanel,
  type CycleInsight,
} from "@/components/roles/shared";
import { daysTo, monthEnd, monthStart, phaseLabel, toDateKey } from "@/components/roles/shared/utils";

export type { CycleDashboard, CycleInsight } from "@/components/roles/shared";

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
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);

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
      .filter((r): r is typeof r & { days: number } => r.days !== null)
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
  const urgentCycles = deadlineRows.filter((d) => d.days <= 2).length;
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
      <RoleDashboardHero
        eyebrow="Compliance Officer Command Center"
        greetingName={firstName}
        description="Monitor every cycle, every phase, and identify risks before they impact audit timelines."
        primaryActions={[
          {
            onClick: () => setIsNewCycleOpen(true),
            label: "+ New cycle",
            gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          },
          { href: "/report", label: "Export report", gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" },
        ]}
      />

      <DashboardKpiGrid items={kpiCards.slice(0, 4)} loading={loading} />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <CyclePerformanceSection
          sortedInsights={sortedInsights}
          loading={loading}
          onViewVisuals={setVisualCycleId}
        />

        <div className="space-y-5">
          <UpcomingDeadlinesPanel
            deadlineRows={deadlineRows}
            loading={loading}
            onOpenCalendar={() => {
              const first = calendarDeadlines[0]?.date ?? new Date();
              setCalendarMonth(monthStart(first));
              setIsCalendarOpen(true);
            }}
          />

          <ComplianceOverviewPanel
            complianceOverview={complianceOverview}
            hasSelectedCycle={visualCycleId !== null}
            onShowAllCycles={() => setVisualCycleId(null)}
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

      <NewAssessmentCycleModal
        open={isNewCycleOpen}
        onClose={() => setIsNewCycleOpen(false)}
      />
    </div>
  );
}

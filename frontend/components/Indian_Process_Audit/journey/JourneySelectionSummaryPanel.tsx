'use client';

import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  Sparkles,
  Table2,
  XCircle,
} from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Scope3KpiStrip } from '@/components/scope3emissions/scope3-kpi';
import { buildJourneyAiInsightsMemo, type JourneyAiInsightTone, type JourneyAiInsightsCopy } from './journeyAiInsights';
import { getJourneyKpiTones, type JourneyAuditPosture, type JourneySelectionSummary, type JourneySummaryFinding } from './journeySelectionSummary';

type Props = {
  summary: JourneySelectionSummary;
  onViewTable: () => void;
  snapshotEyebrow: string;
  headerIcon: LucideIcon;
  benchmarkVsLabel: string;
  aiCopy: JourneyAiInsightsCopy;
};

const POSTURE_STYLES: Record<
  JourneyAuditPosture,
  { badge: string; ring: string; accent: string }
> = {
  low: {
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    ring: 'ring-emerald-200/80',
    accent: 'from-emerald-500/10 to-white',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-900 ring-amber-200',
    ring: 'ring-amber-200/80',
    accent: 'from-amber-500/10 to-white',
  },
  high: {
    badge: 'bg-orange-100 text-orange-950 ring-orange-200',
    ring: 'ring-orange-200/80',
    accent: 'from-orange-500/10 to-white',
  },
  critical: {
    badge: 'bg-red-100 text-red-900 ring-red-200',
    ring: 'ring-red-200/80',
    accent: 'from-red-500/12 to-white',
  },
};

const FINDING_TONE: Record<
  JourneySummaryFinding['tone'],
  { icon: typeof AlertTriangle; box: string }
> = {
  critical: { icon: XCircle, box: 'bg-red-50/90 ring-red-100' },
  warning: { icon: AlertTriangle, box: 'bg-amber-50/90 ring-amber-100' },
  info: { icon: ShieldAlert, box: 'bg-sky-50/90 ring-sky-100' },
  success: { icon: CheckCircle2, box: 'bg-emerald-50/90 ring-emerald-100' },
};

const OUTCOME_COLORS: Record<string, string> = {
  Completed: '#10b981',
  Exception: '#0ea5e9',
  Critical: '#ef4444',
};

const AI_INSIGHT_TONE: Record<
  JourneyAiInsightTone,
  { border: string; label: string; dot: string }
> = {
  critical: { border: 'border-l-red-500', label: 'text-red-800', dot: 'bg-red-500' },
  warning: { border: 'border-l-amber-500', label: 'text-amber-900', dot: 'bg-amber-500' },
  info: { border: 'border-l-indigo-500', label: 'text-indigo-900', dot: 'bg-indigo-500' },
  success: { border: 'border-l-emerald-500', label: 'text-emerald-900', dot: 'bg-emerald-500' },
};

function OutcomePieChart({
  compliant,
  critical,
  exception,
  total,
}: {
  compliant: number;
  critical: number;
  exception: number;
  total: number;
}) {
  const slices = useMemo(() => {
    const rows = [
      { name: 'Completed', value: compliant, fill: OUTCOME_COLORS.Completed },
      { name: 'Exception', value: exception, fill: OUTCOME_COLORS.Exception },
      { name: 'Critical', value: critical, fill: OUTCOME_COLORS.Critical },
    ];
    return rows.filter((row) => row.value > 0);
  }, [compliant, critical, exception]);

  if (total <= 0) {
    return <p className="text-sm text-slate-500">No cases in selection.</p>;
  }

  if (slices.length === 0) {
    return <p className="text-sm text-slate-500">No classified outcomes in selection.</p>;
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={slices.length > 1 ? 2 : 0}
            stroke="#fff"
            strokeWidth={2}
          >
            {slices.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : Number(value ?? 0);
              const pct = total > 0 ? Math.round((num / total) * 1000) / 10 : 0;
              return [`${num} cases (${pct}%)`, String(name)];
            }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value: string) => {
              const row = slices.find((s) => s.name === value);
              const count = row?.value ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
              return (
                <span className="text-slate-700">
                  {value}{' '}
                  <span className="tabular-nums text-slate-500">
                    {count} ({pct}%)
                  </span>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="-mt-1 text-center text-[10px] font-medium text-slate-500">
        {total} case{total === 1 ? '' : 's'} in selection
      </p>
    </div>
  );
}

function JourneyAiInsightsPanel({
  summary,
  aiCopy,
}: {
  summary: JourneySelectionSummary;
  aiCopy: JourneyAiInsightsCopy;
}) {
  const memo = useMemo(() => buildJourneyAiInsightsMemo(summary, aiCopy), [summary, aiCopy]);

  return (
    <div className="flex h-full min-h-[240px] flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            <h3 className="text-sm font-semibold text-slate-900">AI Insights</h3>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500">For: {memo.audience}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-amber-800 ring-1 ring-amber-200/90">
          {memo.confidencePct}% confidence
        </span>
      </div>

      <p className="mt-3 text-xs font-semibold leading-snug text-slate-800">{memo.headline}</p>

      <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        {memo.blocks.map((block) => {
          const tone = AI_INSIGHT_TONE[block.tone];
          return (
            <article
              key={block.id}
              className={`rounded-lg border border-slate-200/90 border-l-[3px] bg-white/90 px-3 py-2.5 ${tone.border}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
                <p className={`text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>
                  {block.label}
                </p>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">{block.text}</p>
              {block.bullets && block.bullets.length > 0 ? (
                <ul className="mt-2 list-inside list-disc space-y-0.5 text-[10px] leading-snug text-slate-600">
                  {block.bullets.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function JourneySelectionSummaryPanel({
  summary,
  onViewTable,
  snapshotEyebrow,
  headerIcon: HeaderIcon,
  benchmarkVsLabel,
  aiCopy,
}: Props) {
  const style = POSTURE_STYLES[summary.posture];

  const kpiItems = useMemo(() => {
    const tones = getJourneyKpiTones(summary);
    const total = Math.max(1, summary.totalCases);
    const criticalPct = Math.round((summary.criticalCount / total) * 1000) / 10;
    const exceptionPct = Math.round((summary.exceptionCount / total) * 1000) / 10;

    return [
      {
        label: 'Compliance rate',
        value: `${summary.complianceRatePct}%`,
        sub: `${summary.compliantCount} of ${summary.totalCases} cases`,
        tone: tones.compliance,
        icon: CheckCircle2,
        barPct: summary.complianceRatePct,
      },
      {
        label: 'Stage findings',
        value: String(summary.withFindings),
        sub: `${summary.findingRatePct}% of selection`,
        tone: tones.findings,
        icon: ClipboardList,
        barPct: summary.findingRatePct,
      },
      {
        label: 'Critical',
        value: String(summary.criticalCount),
        sub: 'Rejected control',
        tone: tones.critical,
        icon: XCircle,
        barPct: criticalPct,
      },
      {
        label: 'Exception',
        value: String(summary.exceptionCount),
        sub: 'In review',
        tone: tones.exception,
        icon: AlertTriangle,
        barPct: exceptionPct,
      },
    ];
  }, [summary]);

  return (
    <section className={`overflow-hidden rounded-xl bg-white shadow-sm ring-1 ${style.ring}`}>
      <div className={`border-b border-slate-200/90 bg-gradient-to-br px-5 py-5 ${style.accent}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-700">
          {snapshotEyebrow}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight text-slate-900 sm:text-[1.65rem]">
              <HeaderIcon className="h-6 w-6 shrink-0 text-indigo-600 sm:h-7 sm:w-7" aria-hidden />
              {summary.heading}
            </h2>
            {summary.sliceMeta ? (
              <span className="max-w-[200px] truncate rounded-md bg-white/80 px-2 py-0.5 text-xs font-medium leading-none text-slate-600 ring-1 ring-slate-200/90 sm:max-w-xs">
                {summary.sliceMeta}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ring-1 sm:h-10 ${style.badge}`}
            >
              {summary.postureLabel}
            </span>
            <button
              type="button"
              onClick={onViewTable}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:h-10"
            >
              <Table2 className="h-4 w-4 shrink-0" aria-hidden />
              View journey matrix
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        <Scope3KpiStrip cols="grid-cols-2 lg:grid-cols-4" items={kpiItems} />

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-200/90 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900">Audit outcome mix</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">Case-level status in this selection</p>
            <div className="mt-4">
              <OutcomePieChart
                compliant={summary.compliantCount}
                critical={summary.criticalCount}
                exception={summary.exceptionCount}
                total={summary.totalCases}
              />
            </div>
            {summary.rateVsPortfolioPp != null && summary.mode !== 'portfolio' ? (
              <p className="mt-3 text-[11px] leading-snug text-slate-600">
                Portfolio benchmark finding rate:{' '}
                <span className="font-semibold tabular-nums text-slate-800">
                  {summary.portfolioFindingRatePct}%
                </span>
                {' · '}
                <span
                  className={
                    summary.rateVsPortfolioPp > 0
                      ? 'font-semibold text-amber-800'
                      : 'font-semibold text-emerald-800'
                  }
                >
                  {summary.rateVsPortfolioPp > 0 ? '+' : ''}
                  {summary.rateVsPortfolioPp} pp {benchmarkVsLabel}
                </span>
              </p>
            ) : null}
          </div>

          <div className="rounded-xl bg-gradient-to-br from-indigo-50/40 via-slate-50/80 to-white p-4 ring-1 ring-slate-200/90 lg:col-span-3">
            <JourneyAiInsightsPanel summary={summary} aiCopy={aiCopy} />
          </div>
        </div>

        {summary.findings.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Key points for this selection</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {summary.findings.map((item) => {
                const tone = FINDING_TONE[item.tone];
                const Icon = tone.icon;
                return (
                  <li key={item.id} className={`rounded-lg p-3 ring-1 ${tone.box}`}>
                    <div className="flex gap-2">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

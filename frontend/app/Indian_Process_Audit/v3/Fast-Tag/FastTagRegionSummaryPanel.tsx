'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Table2,
  XCircle,
} from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FastTagAiLogo } from '@/app/Indian_Process_Audit/_shared/FastTagAiLogo';
import { buildFastTagAiInsightsMemo, type FastTagAiInsightTone } from './fastTagAiInsights';
import { Scope3KpiStrip } from '@/components/scope3emissions/scope3-kpi';
import { getFastTagKpiTones } from './fastTagRegionSummary';
import type { FastTagAuditPosture, FastTagSelectionSummary } from './fastTagRegionSummary';
import type { FastTagOutcomeSlice } from './fastTagOutcomeDrill';
import FastTagStateClusterPanel from './FastTagStateClusterPanel';
import type { FastTagCaseForSummary } from './fastTagRegionSummary';

type Props = {
  summary: FastTagSelectionSummary;
  cases: FastTagCaseForSummary[];
  selectedRegionCode?: string;
  onSelectRegion?: (regionCode: string) => void;
  onViewTable: () => void;
  onOutcomeSelect?: (slice: FastTagOutcomeSlice) => void;
};

const POSTURE_STYLES: Record<
  FastTagAuditPosture,
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

const OUTCOME_COLORS: Record<string, string> = {
  Completed: '#10b981',
  Exception: '#0ea5e9',
  Critical: '#ef4444',
};

function OutcomePieChart({
  compliant,
  critical,
  exception,
  total,
  onSliceClick,
}: {
  compliant: number;
  critical: number;
  exception: number;
  total: number;
  onSliceClick?: (slice: FastTagOutcomeSlice) => void;
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

  const fireSliceClick = (name: string) => {
    if (!onSliceClick) return;
    const row = slices.find((s) => s.name === name);
    if (!row?.value) return;
    onSliceClick(name as FastTagOutcomeSlice);
  };

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
              <Cell
                key={entry.name}
                fill={entry.fill}
                style={{ cursor: onSliceClick ? 'pointer' : undefined }}
                onClick={() => fireSliceClick(entry.name)}
              />
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
            wrapperStyle={{ fontSize: 11, paddingTop: 8, cursor: onSliceClick ? 'pointer' : undefined }}
            onClick={(entry) => {
              if (entry?.value) fireSliceClick(String(entry.value));
            }}
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

const AI_INSIGHT_TONE: Record<
  FastTagAiInsightTone,
  { border: string; label: string; dot: string }
> = {
  critical: {
    border: 'border-l-red-500',
    label: 'text-red-800',
    dot: 'bg-red-500',
  },
  warning: {
    border: 'border-l-amber-500',
    label: 'text-amber-900',
    dot: 'bg-amber-500',
  },
  info: {
    border: 'border-l-indigo-500',
    label: 'text-indigo-900',
    dot: 'bg-indigo-500',
  },
  success: {
    border: 'border-l-emerald-500',
    label: 'text-emerald-900',
    dot: 'bg-emerald-500',
  },
};

function FastTagAiInsightsPanel({ summary }: { summary: FastTagSelectionSummary }) {
  const memo = useMemo(() => buildFastTagAiInsightsMemo(summary), [summary]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <FastTagAiLogo />
            <h3 className="text-sm font-semibold text-slate-900">AI Insights</h3>
          </div>
        </div>
        <span className="inline-flex w-fit shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-amber-800 ring-1 ring-amber-200/90">
          {memo.confidencePct}% confidence
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        {memo.blocks.map((block) => {
          const tone = AI_INSIGHT_TONE[block.tone];
          const bullets = block.bullets?.slice(0, 3) ?? [];
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
              <p className="mt-1.5 text-[11px] leading-snug text-slate-700">{block.text}</p>
              {bullets.length > 0 ? (
                <ul className="mt-2 space-y-0.5 text-[10px] leading-snug text-slate-500">
                  {bullets.map((line) => (
                    <li key={line}>· {line}</li>
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

export default function FastTagRegionSummaryPanel({
  summary,
  cases,
  selectedRegionCode = '',
  onSelectRegion,
  onViewTable,
  onOutcomeSelect,
}: Props) {
  const style = POSTURE_STYLES[summary.posture];

  const leftInsightStackRef = useRef<HTMLDivElement>(null);
  const [stateClusterMaxPx, setStateClusterMaxPx] = useState<number | null>(null);

  useEffect(() => {
    const el = leftInsightStackRef.current;
    if (!el) return;

    const syncHeight = () => {
      const isSideBySide = window.matchMedia('(min-width: 1024px)').matches;
      setStateClusterMaxPx(
        isSideBySide ? Math.round(el.getBoundingClientRect().height) : null,
      );
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    window.addEventListener('resize', syncHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncHeight);
    };
  }, [summary, cases]);

  const kpiItems = useMemo(() => {
    const tones = getFastTagKpiTones(summary);
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
      {/* Header */}
      <div className={`border-b border-slate-200/90 bg-gradient-to-br px-5 py-5 ${style.accent}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight text-slate-900 sm:text-[1.65rem]">
              <MapPin className="h-6 w-6 shrink-0 text-indigo-600 sm:h-7 sm:w-7" aria-hidden />
              {summary.heading}
            </h2>
            {summary.rtoCode ? (
              <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-xs font-semibold leading-none text-slate-600 ring-1 ring-slate-200/90">
                {summary.rtoCode}
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

        <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
          <div ref={leftInsightStackRef} className="flex flex-col gap-4 lg:col-span-4">
            <div className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-200/90">
              <h3 className="text-sm font-semibold text-slate-900">Audit outcome mix</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Case-level status in this selection
              </p>
              <div className="mt-4">
                <OutcomePieChart
                  compliant={summary.compliantCount}
                  critical={summary.criticalCount}
                  exception={summary.exceptionCount}
                  total={summary.totalCases}
                  onSliceClick={onOutcomeSelect}
                />
              </div>
              {summary.rateVsNationalPp != null && summary.mode !== 'national' ? (
                <p className="mt-3 text-[11px] leading-snug text-slate-600">
                  National benchmark finding rate:{' '}
                  <span className="font-semibold tabular-nums text-slate-800">
                    {summary.nationalFindingRatePct}%
                  </span>
                  {' · '}
                  <span
                    className={
                      summary.rateVsNationalPp > 0
                        ? 'font-semibold text-amber-800'
                        : 'font-semibold text-emerald-800'
                    }
                  >
                    {summary.rateVsNationalPp > 0 ? '+' : ''}
                    {summary.rateVsNationalPp} pp vs India
                  </span>
                </p>
              ) : null}
            </div>

            <div className="rounded-xl bg-gradient-to-br from-indigo-50/50 via-slate-50/90 to-white p-4 ring-1 ring-slate-200/90 sm:p-5">
              <FastTagAiInsightsPanel summary={summary} />
            </div>
          </div>

          <div
            className="flex min-h-0 flex-col lg:col-span-8"
            style={
              stateClusterMaxPx != null ? { maxHeight: stateClusterMaxPx } : undefined
            }
          >
            <div className="flex h-full min-h-0 flex-col rounded-xl bg-white p-4 ring-1 ring-slate-200/90 sm:p-5">
              <FastTagStateClusterPanel
                cases={cases}
                allIndianStates={summary.mode === 'national'}
                selectedRegionCode={selectedRegionCode}
                onSelectRegion={onSelectRegion}
                panelMaxHeightPx={stateClusterMaxPx}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// @ts-nocheck — presentation layer; data from @/lib/Indian_Process_Audit
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ComposedChart, Line,
} from 'recharts';
import {
  Shield, AlertTriangle, AlertCircle, CheckCircle2, XCircle,
  Activity, Users, Briefcase, CreditCard, AlertOctagon, Server,
  Database, DollarSign, UserCog, Search, Filter, Download, Clock,
  FileText, ChevronRight, ChevronDown, Building2, Eye, X, FileCheck2, ListChecks,
  UserCheck, Gavel, BadgeCheck, FolderSearch,
  Workflow, GitBranch, MinusCircle, Info, UserRound,
  CalendarClock, MapPin, Mail, Hash,
  Sparkles,
  Radio,
} from 'lucide-react';
import AuditCard, { AuditCardSkeleton } from '@/components/Indian_Process_Audit/AuditCard';
import { useIpaVersion } from '@/components/Indian_Process_Audit/ipa/IpaVersionProvider';
import FastTagAuditDashboard from '@/app/Indian_Process_Audit/v2/Fast-Tag/FastTagAuditDashboard';
import {
  FASTAG_CONTROL_COUNT,
  getFastTagDomainAuditCard,
  getFastTagProcessMappingRow,
} from '@/app/Indian_Process_Audit/v2/Fast-Tag/auditData';
import { buildFastTagEvidence } from '@/app/Indian_Process_Audit/v2/Fast-Tag/buildFastTagEvidence';
import { getProcessAuditData } from '@/lib/Indian_Process_Audit';
import type { AuditControl, EvidenceDrawerState, ProcessAuditTabId } from '@/lib/Indian_Process_Audit/types';

const D = getProcessAuditData();
const AI_ALERT_CARD_STYLES = {
  critical: {
    border: 'border-red-200 hover:border-red-300 hover:shadow-md',
    iconWrap: 'bg-red-600 text-white shadow-sm',
    pill: 'bg-red-600 text-white',
    pillText: 'CRITICAL',
  },
  high: {
    border: 'border-amber-200 hover:border-amber-300 hover:shadow-md',
    iconWrap: 'bg-amber-500 text-white shadow-sm',
    pill: 'bg-amber-500 text-white',
    pillText: 'HIGH',
  },
  medium: {
    border: 'border-sky-200 hover:border-sky-300 hover:shadow-md',
    iconWrap: 'bg-sky-600 text-white shadow-sm',
    pill: 'bg-sky-600 text-white',
    pillText: 'MEDIUM',
  },
  low: {
    border: 'border-emerald-200 hover:border-emerald-300 hover:shadow-md',
    iconWrap: 'bg-emerald-600 text-white shadow-sm',
    pill: 'bg-emerald-600 text-white',
    pillText: 'LOW',
  },
};

/** Summary counts row rendered at the bottom of the AI panel. */
const AI_SEVERITY_SUMMARY = [
  { key: 'Critical', label: 'Critical', cls: 'text-red-600' },
  { key: 'High',     label: 'High',     cls: 'text-amber-600' },
  { key: 'Medium',   label: 'Medium',   cls: 'text-sky-600' },
  { key: 'Low',      label: 'Monitor',  cls: 'text-emerald-600' },
];

/** Only from xl up: one fixed-height row; stacked layout below stays natural. */
const OVERVIEW_HERO_ROW_H_XL =
  'xl:h-[min(860px,calc(100dvh-4rem))] xl:max-h-[min(860px,calc(100dvh-4rem))]';

/**
 * AI shell: below the xl breakpoint, a self-contained scroll column; at xl+ it fills the hero row
 * (same as dark “AI Summary Wall” beside the 2×2).
 */
const AI_INTELLIGENCE_PANEL_H = [
  'box-border flex w-full min-w-0 flex-col overflow-hidden',
  'h-[min(860px,calc(100dvh-4rem))] max-h-[min(860px,calc(100dvh-4rem))] min-h-0',
  'xl:h-full xl:max-h-full',
].join(' ');

/**
 * Hero row: 8 + 4 columns on xl+ → main metrics ~⅔, AI rail ~⅓ (narrower, dark-layout parity).
 */
const OVERVIEW_HERO_OUTER = [
  'grid min-h-0 grid-cols-1 gap-3 sm:gap-4',
  'min-h-0',
  'xl:grid-cols-12 xl:items-stretch xl:overflow-hidden xl:gap-5 2xl:gap-6',
  OVERVIEW_HERO_ROW_H_XL,
].join(' ');
const OVERVIEW_METRICS_COL = 'h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden xl:col-span-8';
const OVERVIEW_AI_RAIL_COL = [
  'flex h-full min-h-0 w-full min-w-0 max-w-full flex-col items-stretch justify-start overflow-hidden',
  'xl:col-span-4',
].join(' ');

/**
 * Light overview hero — mirrors dark “Summary + AI wall”:
 * left 2×2 metrics (wide), right narrow scrollable AI rail, shared row height at xl+.
 */
const OverviewHeroRow = ({ summaryGrid, intelligencePanel }) => (
  <div className={OVERVIEW_HERO_OUTER}>
    <div className={OVERVIEW_METRICS_COL}>{summaryGrid}</div>
    <div className={OVERVIEW_AI_RAIL_COL}>{intelligencePanel}</div>
  </div>
);

// ============================================================================
// Overview — residual banner (top) + combined coverage/deficiency chart & tables,
// open findings, AI rail; domain/process mapping + findings drill chart below.
// ============================================================================

const FINDING_SEGMENT_COLORS = ['#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];
/** Remaining domains aggregated so donut + legend sum to the headline total. */
const OPEN_FINDINGS_OTHER_SLATE = '#94a3b8';

/**
 * Single donut slice: angles in radians, 0 = 3 o'clock, increasing = clockwise (Math.cos/sin).
 * Start path at outer edge; outer arc to end; line to inner; inner arc back.
 */
const donutSlicePath = (cx, cy, rOuter, rInner, t0, t1) => {
  const xo0 = cx + rOuter * Math.cos(t0);
  const yo0 = cy + rOuter * Math.sin(t0);
  const xo1 = cx + rOuter * Math.cos(t1);
  const yo1 = cy + rOuter * Math.sin(t1);
  const xi0 = cx + rInner * Math.cos(t0);
  const yi0 = cy + rInner * Math.sin(t0);
  const xi1 = cx + rInner * Math.cos(t1);
  const yi1 = cy + rInner * Math.sin(t1);
  const large = t1 - t0 > Math.PI ? 1 : 0;
  return [
    `M ${xo0} ${yo0}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${xo1} ${yo1}`,
    `L ${xi1} ${yi1}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${xi0} ${yi0}`,
    'Z',
  ].join(' ');
};

/** ViewBox for Open Findings donut — outer box scales via CSS; paths stay sharp. */
const OPEN_FINDINGS_DONUT_VB = 160;

/**
 * Proportions across `values` (same length as `colors`). Sizing is CSS-driven: use `className` for `w-*` / `h-*`.
 */
const OpenFindingsDonut = ({ values, colors, className = '' }) => {
  const total = values.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0) || 1;
  const s = OPEN_FINDINGS_DONUT_VB;
  const cx = s / 2;
  const cy = s / 2;
  const rO = s * 0.38;
  const rI = s * 0.22;
  const tau = 2 * Math.PI;
  const start = -Math.PI / 2;
  const { items: ringSlices } = values.reduce(
    (acc, raw, i) => {
      const v = Math.max(0, raw);
      if (v <= 0) return acc;
      const sweep = (v / total) * tau;
      const t0 = acc.angle;
      const t1 = acc.angle + sweep;
      acc.items.push({ i, t0, t1 });
      acc.angle = t1;
      return acc;
    },
    { angle: start, items: [] },
  );
  return (
    <svg
      className={className}
      viewBox={`0 0 ${s} ${s}`}
      role="img"
      aria-label="Share of all critical open findings by domain; slices sum to headline total"
    >
      {ringSlices.map(({ i, t0, t1 }) => (
        <path
          key={i}
          d={donutSlicePath(cx, cy, rO, rI, t0, t1)}
          fill={colors[i % colors.length]}
          stroke="white"
          strokeWidth="2"
          className="transition-opacity hover:opacity-90"
        />
      ))}
      <circle cx={cx} cy={cy} r={rI * 0.9} className="fill-white" />
    </svg>
  );
};

/**
 * One line per row: domain label with dot; equal-height row shells.
 * `rows[].key` must be unique (domain id or `open-findings-other-domains`).
 */
const OpenFindingsLegend = ({ rows, noTruncate = false }) => (
  <ul
    className="list-none flex min-h-0 w-full min-w-0 flex-1 flex-col justify-center gap-1 self-stretch overflow-y-auto overflow-x-hidden pl-2.5 sm:pl-3.5 sm:gap-1.5"
    aria-label="Critical open findings by domain"
  >
    {rows.map((row) => (
      <li
        key={row.key}
        className="flex w-full min-h-0 min-w-0 shrink-0 items-start gap-2 py-0.5"
      >
        <span
          className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: row.color }}
          aria-hidden
        />
        <p
          className={
            noTruncate
              ? 'min-w-0 flex-1 text-[10px] font-medium leading-snug break-words text-slate-800 sm:text-[11px]'
              : 'min-w-0 flex-1 truncate text-[11px] font-medium leading-snug text-slate-800 sm:text-xs'
          }
        >
          <span className="font-extrabold tabular-nums text-slate-900">{row.value}</span>
          {'\u2013'}
          <span className="font-medium text-slate-800">{row.name}</span>
        </p>
      </li>
    ))}
  </ul>
);

/**
 * One shell for all four 2×2 overview cards — same outer size (fills grid cell) and
 * the same border / padding as Audit Coverage.
 */
const OVERVIEW_CARD_UNIFIED =
  'flex h-full min-h-0 w-full min-w-0 flex-col justify-start overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-slate-200/50 sm:p-3.5';

/** Open Findings: auto height so inner copy + chart are never clipped by a flex min-height trap. */
const OPEN_FINDINGS_CARD_CLASS =
  'flex w-full min-w-0 flex-col justify-start overflow-visible rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-slate-200/50 sm:p-4';

/** Stacked control outcomes + deficiency % by domain in one chart; detail table by domain or by SOP process. */
const AuditCoverageCommandPanel = () => {
  const [view, setView] = useState('domain');
  const processRows = useMemo(
    () => [...D.ALL_PROCESS_ROWS].sort((a, b) => b.notMet - a.notMet || b.issues - a.issues).slice(0, 20),
    [],
  );
  const totalControls = D.AUDIT_TOTALS.controls;
  const aggDef = D.AUDIT_TOTALS.tested > 0 ? ((D.AUDIT_TOTALS.notMet / D.AUDIT_TOTALS.tested) * 100).toFixed(1) : '0';
  return (
    <div className={`${OVERVIEW_CARD_UNIFIED} min-h-[300px] sm:min-h-0`}>
      <div className="shrink-0">
        <h3 className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">Audit coverage & deficiency</h3>
        <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
          {totalControls} controls in scope · portfolio deficiency (tested){' '}
          <span className="font-semibold text-pink-600 tabular-nums">{aggDef}%</span>
        </p>
      </div>
      <div className="mt-2 h-[160px] w-full min-h-0 shrink-0 sm:h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={D.COVERAGE_COMPOSED_CHART_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} height={36} />
            <YAxis yAxisId="left" tick={{ fontSize: 9 }} width={28} allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} width={32} domain={[0, 100]} unit="%" />
            <Tooltip
              formatter={(value, name) => [value, name]}
              labelFormatter={(_, p) => p?.[0]?.payload?.fullName || ''}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="met" name="Met" stackId="cov" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar yAxisId="left" dataKey="review" name="Review" stackId="cov" fill="#0ea5e9" />
            <Bar yAxisId="left" dataKey="notMet" name="Not met" stackId="cov" fill="#ef4444" />
            <Bar yAxisId="left" dataKey="notTested" name="Not tested" stackId="cov" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="deficiency"
              name="Deficiency %"
              stroke="#db2777"
              strokeWidth={2}
              dot={{ r: 3, fill: '#db2777' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex shrink-0 gap-1 rounded-lg bg-slate-100 p-0.5">
        <button
          type="button"
          onClick={() => setView('domain')}
          className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold sm:text-xs ${
            view === 'domain' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600'
          }`}
        >
          By domain (controls)
        </button>
        <button
          type="button"
          onClick={() => setView('process')}
          className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold sm:text-xs ${
            view === 'process' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600'
          }`}
        >
          By process (SOP stage)
        </button>
      </div>
      <div className="mt-2 min-h-[190px] flex-1 overflow-auto rounded-lg ring-1 ring-slate-200/80">
        <table className="w-full min-w-[320px] border-collapse text-left text-[10px] sm:text-[11px]">
          <thead className="sticky top-0 z-[1] bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-500">
            {view === 'domain' ? (
              <tr>
                <th className="px-2 py-1.5">Domain</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Met</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Not met</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Review</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Not tested</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Defic. %</th>
              </tr>
            ) : (
              <tr>
                <th className="px-2 py-1.5">Process</th>
                <th className="px-2 py-1.5">Domain</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Met</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Not met</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Issues</th>
                <th className="px-2 py-1.5 text-right tabular-nums">Stage %</th>
              </tr>
            )}
          </thead>
          <tbody className="text-slate-800">
            {view === 'domain'
              ? D.DOMAIN_AUDIT_VIEW.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="max-w-[140px] truncate px-2 py-1 font-medium" title={d.domain}>
                      {d.domain}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums text-emerald-700">{d.met}</td>
                    <td className="px-2 py-1 text-right tabular-nums text-red-700">{d.notMet}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{d.review}</td>
                    <td className="px-2 py-1 text-right tabular-nums text-amber-800">{d.notTested}</td>
                    <td className="px-2 py-1 text-right tabular-nums font-semibold text-pink-600">
                      {d.tested > 0 ? ((d.notMet / d.tested) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))
              : processRows.map((r) => (
                  <tr key={r.key} className="border-t border-slate-100">
                    <td className="max-w-[120px] truncate px-2 py-1 font-medium" title={r.processName}>
                      {r.processName}
                    </td>
                    <td className="max-w-[100px] truncate px-2 py-1 text-slate-600" title={r.domainLabel}>
                      {r.domainLabel}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums text-emerald-700">{r.met}</td>
                    <td className="px-2 py-1 text-right tabular-nums text-red-700">{r.notMet}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{r.issues}</td>
                    <td className="px-2 py-1 text-right tabular-nums font-medium">{r.processCompliance}%</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Open findings: headline = sum of `violations` over **all** domains. Donut/legend
 * use the same total: top 4 + optional “all other domains” so counts always sum to
 * the headline (slice angles are shares of the full 124, not of 71 only).
 */
const OpenFindingsCard = () => {
  const headTotal = D.AUDIT_TOTALS.critical;
  const top4 = [...D.DOMAIN_AUDIT_VIEW]
    .sort((a, b) => b.violations - a.violations)
    .slice(0, 4);
  const top4Sum = top4.reduce((s, d) => s + d.violations, 0);
  const other = Math.max(0, headTotal - top4Sum);
  const values = other > 0 ? [...top4.map((d) => d.violations), other] : top4.map((d) => d.violations);
  const colorList =
    other > 0
      ? [...FINDING_SEGMENT_COLORS, OPEN_FINDINGS_OTHER_SLATE]
      : FINDING_SEGMENT_COLORS;
  const legendRows = [
    ...top4.map((d, i) => ({
      key: d.id,
      name: d.domain,
      value: d.violations,
      color: FINDING_SEGMENT_COLORS[i % FINDING_SEGMENT_COLORS.length],
    })),
    ...(other > 0
      ? [
          {
            key: 'open-findings-other-domains',
            name: 'All other domains',
            value: other,
            color: OPEN_FINDINGS_OTHER_SLATE,
          },
        ]
      : []),
  ];
  return (
    <div className={OPEN_FINDINGS_CARD_CLASS}>
      <div className="grid w-full min-w-0 grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(200px,42%)] sm:items-start sm:gap-6">
        {/* Left: headline + highlight critical areas */}
        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">Open Findings</h3>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
              <span className="text-2xl font-extrabold leading-none tabular-nums text-rose-500 sm:text-3xl">
                {headTotal}
              </span>
              <span className="text-xs font-semibold text-slate-500 sm:text-sm">open</span>
            </div>
          </div>
          <div className="space-y-2 rounded-lg bg-slate-50/90 px-3 py-3 ring-1 ring-slate-200/70">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold leading-tight text-slate-900 sm:text-[11px]">Highlight critical areas:</p>
              <p className="text-[10px] leading-relaxed text-rose-800 sm:text-[11px]">
                Re-KYC overdue (Customer) · STR timeliness (AML)
              </p>
              <p className="text-[10px] leading-relaxed text-rose-800 sm:text-[11px]">
                Underwriting policy (Credit) · CAB gating (IT Change)
              </p>
            </div>
          </div>
        </div>

        {/* Right: donut + legend */}
        <div className="flex w-full min-w-0 flex-col items-center justify-start border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div className="flex w-full max-w-[280px] items-center justify-center gap-4 sm:max-w-none">
            <div className="h-32 w-32 shrink-0 sm:h-[132px] sm:w-[132px]">
              <OpenFindingsDonut
                values={values}
                colors={colorList}
                className="h-full w-full max-h-full max-w-full drop-shadow-sm"
              />
            </div>
            <div className="min-w-0 flex-1">
              <OpenFindingsLegend noTruncate rows={legendRows} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Left column: combined coverage chart + tables; open findings below (AI rail unchanged). */
const InternalAuditSummaryGrid = () => (
  <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden sm:gap-3.5">
    <div className="min-h-[420px] min-w-0 flex-[1_1_62%] overflow-hidden">
      <AuditCoverageCommandPanel />
    </div>
    <div className="min-h-0 w-full shrink-0 py-0.5 sm:flex-[0_0_auto]">
      <OpenFindingsCard />
    </div>
  </div>
);

/** Severity → lucide icon inside the circular status disc on each finding card. */
const severityIcon = (tone) =>
  (tone === 'critical' ? AlertCircle
    : tone === 'high' ? AlertTriangle
    : tone === 'medium' ? Info
    : CheckCircle2);

/**
 * Light-theme AI Audit Intelligence — complete finding feed:
 *   pill (severity) · bold title (issue) · recommendation.
 * Ends with a severity summary bar (Critical / High / Medium / Monitor).
 */
const AiAuditIntelligenceCard = ({ onDrillDown }) => (
  <section
    className={`rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4 ${AI_INTELLIGENCE_PANEL_H}`}
  >
    {/* Header — aligns with 650px reference: ✨ text-2xl, title text-lg, subtitle text-xs, Live text-xs */}
    <div className="mb-3 shrink-0 sm:mb-4">
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="shrink-0 select-none text-2xl leading-none" aria-hidden>
            ✨
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight text-slate-900 sm:text-lg">AI Audit Intelligence</h3>
            <p className="mt-0.5 text-xs leading-snug text-slate-500">
              {D.AUDIT_CYCLE.cycle} · {D.AUDIT_CYCLE.status}
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/90">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
    </div>

    <div
      className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg bg-slate-50/60 px-1.5 py-0.5 pr-1 [scrollbar-gutter:stable] [scrollbar-width:thin] sm:space-y-2.5 sm:px-2 sm:pr-1.5"
      style={{ scrollbarColor: 'rgb(203 213 225) transparent' }}
    >
      {D.AI_AUDIT_INTEL.findings.map((item) => {
        const st = AI_ALERT_CARD_STYLES[item.tone] || AI_ALERT_CARD_STYLES.low;
        const StatusIcon = severityIcon(item.tone);

        return (
          <button
            key={item.id}
            type="button"
            title={item.fullSolution}
            onClick={() => onDrillDown(item.domainId)}
            className={`group w-full cursor-pointer rounded-xl border bg-white p-2.5 text-left shadow-sm transition-[border-color,box-shadow,background-color] hover:bg-slate-50/80 sm:p-3 ${st.border}`}
          >
            <div className="flex gap-2.5 sm:gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${st.iconWrap}`}
                aria-hidden
              >
                <StatusIcon className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${st.pill}`}
                  >
                    {st.pillText}
                  </span>
                  <ChevronRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600"
                    aria-hidden
                  />
                </div>

                <h4 className="mt-1 text-sm font-semibold leading-snug tracking-tight text-slate-900 sm:font-bold">
                  {item.title}
                </h4>

                <div className="mt-2 w-full min-w-0 rounded-lg border border-slate-200/80 bg-slate-50/95 px-2.5 py-2 sm:px-3 sm:py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Recommended</p>
                  <p className="mt-1.5 text-left text-sm font-normal leading-relaxed text-slate-800">{item.solution}</p>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>

    <div className="mt-3 shrink-0 border-t border-slate-200/90 pt-3 sm:mt-4 sm:pt-4">
      <div className="grid grid-cols-4 items-end gap-1.5 text-center sm:gap-2">
        {AI_SEVERITY_SUMMARY.map((s) => (
          <div key={s.key} className="min-w-0">
            <div className={`text-2xl font-bold tabular-nums leading-none ${s.cls}`}>
              {D.AI_AUDIT_INTEL.severityCounts[s.key] ?? 0}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:font-medium sm:uppercase sm:tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================================================
// Small UI helpers
// ============================================================================

const StatusBadge = ({ status }) => {
  const map = {
    effective:        { bg: 'bg-emerald-50', fg: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Effective' },
    'needs-attention':{ bg: 'bg-amber-50',   fg: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Needs attention' },
    deficient:        { bg: 'bg-red-50',     fg: 'text-red-700',     ring: 'ring-red-200',     label: 'Deficient' },
  };
  const s = map[status] || map.effective;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${s.bg} ${s.fg} ring-1 ${s.ring}`}>
      {s.label}
    </span>
  );
};

const SeverityPill = ({ sev }) => {
  const map = {
    Critical: 'bg-red-50 text-red-700 ring-red-200',
    High:     'bg-orange-50 text-orange-700 ring-orange-200',
    Medium:   'bg-amber-50 text-amber-700 ring-amber-200',
    Low:      'bg-slate-50 text-slate-600 ring-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ring-1 ${map[sev] || map.Medium}`}>
      {sev}
    </span>
  );
};

const ComplianceCell = ({ v }) => (
  <span className={`font-semibold ${v >= 95 ? 'text-emerald-700' : v >= 90 ? 'text-amber-700' : 'text-red-700'}`}>
    {v}%
  </span>
);

// ============================================================================
// OVERVIEW — small building blocks (risk pills, KPI tile, section header)
// ============================================================================

const RiskPill = ({ level, className = '' }) => {
  const tone = D.RESIDUAL_RISK_TONE[level] || D.RESIDUAL_RISK_TONE.Low;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.ring} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
      {level}
    </span>
  );
};

/** Relative intensity vs other domains (risk heatmap cells). */
const domainRiskHeatTone = (value, max) => {
  const r = max > 0 ? value / max : 0;
  if (r >= 0.55) return 'bg-red-100 text-red-900 ring-red-200';
  if (r >= 0.28) return 'bg-amber-100 text-amber-900 ring-amber-200';
  return 'bg-slate-50 text-slate-700 ring-slate-200';
};

/** Pass rate: lower = hotter (audit concern). */
const domainPassHeatTone = (pct) => {
  if (pct >= 95) return 'bg-emerald-50 text-emerald-900 ring-emerald-200';
  if (pct >= 90) return 'bg-amber-50 text-amber-900 ring-amber-200';
  return 'bg-red-50 text-red-900 ring-red-200';
};

/** Info (i) — `title` tooltip; use span, not <button> (forbidden inside the domain card <button>). */
const DomainMetricHint = ({ text, className = '' }) => (
  <span
    className={`z-10 inline-flex cursor-default items-center justify-center rounded-sm p-0 leading-none text-current opacity-70 hover:opacity-100 hover:bg-slate-900/5 ${className}`}
    title={text}
    aria-label={text}
    onClick={(e) => e.stopPropagation()}
    onPointerDown={(e) => e.stopPropagation()}
  >
    <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
  </span>
);

/**
 * One domain risk metric: label (centred) + value; (i) sits flush top-right of the label row
 * so it reads as part of the heading, not floating in empty space.
 */
const DomainMetricTile = ({ toneCls, hint, label, value }) => (
  <div className={`relative min-w-0 rounded-md ring-1 px-0.5 py-0.5 ${toneCls}`}>
    <div className="relative pr-4 pt-px">
      <div className="px-0.5 text-center text-[11px] font-semibold leading-snug tracking-tight">
        {label}
      </div>
      <DomainMetricHint text={hint} className="absolute right-0 top-px" />
    </div>
    <div className="px-0.5 pb-px pt-0.5 text-center text-sm font-bold tabular-nums leading-none">
      {value}
    </div>
  </div>
);

// ============================================================================
// OVERVIEW TAB — Internal Audit Command Center
// ============================================================================

/** Top-of-slide: compliance % and residual counts in one line (no chart). */
const ResidualRiskBanner = () => {
  const c = D.AI_AUDIT_INTEL.severityCounts;
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/50 sm:px-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-xs text-slate-700 sm:text-sm">
        <span>
          Overall compliance{' '}
          <strong className="text-lg tabular-nums text-emerald-600 sm:text-xl">{D.OVERALL_COMPLIANCE}%</strong>
        </span>
        <span className="text-slate-300" aria-hidden>
          |
        </span>
        <span className="tabular-nums">
          Critical <strong className="text-red-600">{c.Critical ?? 0}</strong>
        </span>
        <span className="tabular-nums">
          High <strong className="text-amber-600">{c.High ?? 0}</strong>
        </span>
        <span className="tabular-nums">
          Medium <strong className="text-sky-600">{c.Medium ?? 0}</strong>
        </span>
        <span className="tabular-nums">
          Low <strong className="text-emerald-600">{c.Low ?? 0}</strong>
        </span>
        <span className="w-full text-sm font-semibold text-slate-900 sm:ml-auto sm:w-auto">
          Posture: {D.RESIDUAL_RISK_OVERALL}
        </span>
      </div>
    </div>
  );
};

const DomainProcessMappingSection = ({ extraRows = [] }) => (
  <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
    <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">Domain &amp; process mapping</h3>
        <p className="mt-1 max-w-3xl text-xs text-slate-500">
          SOP stage counts, control inventory, average stage compliance vs domain-level control score.
        </p>
      </div>
    </div>
    <div className="overflow-x-auto p-4 sm:p-5">
      <table className="w-full min-w-[640px] border-collapse text-left text-xs sm:text-sm">
        <thead className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="py-2 pr-3">Domain</th>
            <th className="px-2 py-2 text-right tabular-nums">Processes</th>
            <th className="px-2 py-2 text-right tabular-nums">Controls</th>
            <th className="px-2 py-2 text-right tabular-nums">Process coverage %</th>
            <th className="px-2 py-2 text-right tabular-nums">Domain compliance %</th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {[...D.DOMAIN_PROCESS_MAPPING_ROWS, ...extraRows].map((r) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="max-w-[220px] truncate py-2 pr-3 font-medium" title={r.domain}>
                {r.domain}
              </td>
              <td className="px-2 py-2 text-right tabular-nums">{r.processes}</td>
              <td className="px-2 py-2 text-right tabular-nums">{r.controls}</td>
              <td className="px-2 py-2 text-right tabular-nums font-semibold text-indigo-700">{r.processCompliance}%</td>
              <td className="px-2 py-2 text-right tabular-nums font-semibold text-slate-900">{r.domainCompliance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const FindingsSummaryDrillSection = ({ onDrillDown }) => {
  const [pick, setPick] = useState(null);
  const detail = pick ? D.DOMAIN_AUDIT_VIEW.find((d) => d.id === pick) : null;
  const stageHotspots =
    pick && detail
      ? [...D.ALL_PROCESS_ROWS].filter((r) => r.domainId === pick).sort((a, b) => b.issues - a.issues).slice(0, 8)
      : [];

  return (
    <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Findings summary</h3>
        <p className="mt-1 text-xs text-slate-500">
          Double-click a bar to open the domain slice for discussion. Follow with “Open workspace” for full drill-down.
        </p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="h-[240px] w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={D.FINDINGS_SUMMARY_CHART_DATA}
              margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
              onDoubleClick={(state) => {
                const id = state?.activePayload?.[0]?.payload?.domainId;
                if (id) setPick(id);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} width={36} allowDecimals={false} />
              <Tooltip
                formatter={(v, name) => [v, name === 'totalIssues' ? 'Total issues (exc.+crit.)' : name]}
                labelFormatter={(_, p) => p?.[0]?.payload?.fullDomain || ''}
              />
              <Bar dataKey="totalIssues" name="totalIssues" radius={[4, 4, 0, 0]}>
                {D.FINDINGS_SUMMARY_CHART_DATA.map((entry, i) => (
                  <Cell key={entry.domainId} fill={i % 2 === 0 ? '#e11d48' : '#f43f5e'} className="cursor-pointer" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {pick && detail ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/90 p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Selected domain</p>
                <p className="font-semibold text-slate-900">{detail.domain}</p>
                <p className="mt-1 text-xs text-slate-600">
                  Critical findings <span className="font-bold text-red-700 tabular-nums">{detail.violations}</span>
                  {' · '}
                  Other exceptions{' '}
                  <span className="font-bold tabular-nums text-amber-800">{Math.max(0, detail.exceptions)}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setPick(null)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => onDrillDown(pick)}
                  className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Open workspace
                </button>
              </div>
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">Processes with most issues</p>
            <ul className="mt-1 space-y-1 text-xs text-slate-700">
              {stageHotspots.length === 0 ? (
                <li className="text-slate-500">No process-level issues in this slice.</li>
              ) : (
                stageHotspots.map((s) => (
                  <li key={s.key} className="flex flex-wrap justify-between gap-2 border-t border-slate-200/80 pt-1 first:border-0 first:pt-0">
                    <span className="min-w-0 font-medium">{s.processName}</span>
                    <span className="shrink-0 tabular-nums text-slate-600">
                      {s.issues} issues · {s.criticalIssues} critical-linked
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
};

const OverviewTab = ({ onDrillDown, isV2 = false }) => {
  const sortedDomains = useMemo(() => {
    const rows = isV2 ? [...D.DOMAIN_AUDIT_VIEW, getFastTagDomainAuditCard()] : D.DOMAIN_AUDIT_VIEW;
    return [...rows].sort(
      (a, b) => (b.violations * 10 + b.overdueRemediation) - (a.violations * 10 + a.overdueRemediation),
    );
  }, [isV2]);
  const mappingExtraRows = isV2 ? [getFastTagProcessMappingRow()] : [];
  const [cardsLoading, setCardsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setCardsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const cardSeverity = (residualRisk) => (
    residualRisk === 'Critical' ? 'Critical'
    : residualRisk === 'High' ? 'High'
    : residualRisk === 'Medium' ? 'Medium'
    : 'Low'
  );

  return (
    <div className="space-y-6">
      <ResidualRiskBanner />

      <OverviewHeroRow
        summaryGrid={<InternalAuditSummaryGrid />}
        intelligencePanel={<AiAuditIntelligenceCard onDrillDown={onDrillDown} />}
      />

      <DomainProcessMappingSection extraRows={mappingExtraRows} />

      {/* Audit domains — interactive cards with trends, AI focus hierarchy and drill-in expand */}
      <section className="bg-white ring-1 ring-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Audit domains</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Each card is a domain risk tile: shading compares this domain to the rest of the universe this cycle (darker = relatively worse). Click a card for the control library, SOP map, cases and evidence.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 shrink-0">
            {['Critical', 'High', 'Medium', 'Low'].map((l) => (
              <span key={l} className="inline-flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${D.RESIDUAL_RISK_TONE[l].dot}`} />
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {cardsLoading
              ? Array.from({ length: 9 }).map((_, idx) => <AuditCardSkeleton key={`audit-skeleton-${idx}`} />)
              : sortedDomains.map((d) => (
                <AuditCard
                  key={d.id}
                  onOpen={() => onDrillDown(d.id)}
                  domain={d.domain}
                  lead={d.owner}
                  severity={cardSeverity(d.residualRisk)}
                  tested={d.tested}
                  inScope={d.controls}
                  passRate={d.compliance}
                  critical={d.violations}
                  criticalDelta={d.criticalDelta}
                  overdue={d.overdueRemediation}
                  overdueDelta={d.overdueDelta}
                  aiContext={d.topIssue}
                  aiAction={d.action}
                />
              ))}
          </div>
        </div>
      </section>

    </div>
  );
};

// ============================================================================
// SOP / PROCESS-FLOW VIEW — auditor-friendly stage-by-stage breakdown.
// Shows exactly which stage of the SOP missed which control.
// ============================================================================

/** Health helper: aggregate controls attached to a stage */
const aggregateStage = (stage, controls) => {
  const mapped = (stage.controlIds || [])
    .map((cid) => controls.find((c) => c.id === cid))
    .filter(Boolean);

  const total      = mapped.length;
  const violations = mapped.reduce((s, c) => s + c.violations, 0);
  const exceptions = mapped.reduce((s, c) => s + c.exceptions, 0);
  const compliance = total ? Number((mapped.reduce((s, c) => s + c.compliance, 0) / total).toFixed(1)) : 100;

  let health = 'ok';
  if (violations > 0 || compliance < 90) health = 'critical';
  else if (exceptions > 0 || compliance < 95) health = 'attention';

  return { mapped, total, violations, exceptions, compliance, health };
};

const StageHealthPill = ({ health }) => {
  const map = {
    ok:        { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Clean' },
    attention: { cls: 'bg-amber-50 text-amber-700 ring-amber-200',       label: 'Attention' },
    critical:  { cls: 'bg-red-50 text-red-700 ring-red-200',             label: 'Miss' },
  };
  const s = map[health] || map.ok;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ring-1 ${s.cls}`}>
      {s.label}
    </span>
  );
};

const SopProcessView = ({
  sop,
  controls,
  onOpenEvidence,
  domainLabel,
  getAuditorFocusForControl = D.getAuditorFocusForControl,
}) => {
  const stageAgg = useMemo(
    () => sop.stages.map((s) => ({ ...s, ...aggregateStage(s, controls) })),
    [sop, controls]
  );
  const [expandedStageId, setExpandedStageId] = useState(null);

  const healthSoft = (h) => (h === 'critical' ? 'bg-red-50/60' : h === 'attention' ? 'bg-amber-50/60' : 'bg-emerald-50/60');

  const totalExceptions = stageAgg.reduce((s, st) => s + st.exceptions, 0);
  const totalViolations = stageAgg.reduce((s, st) => s + st.violations, 0);
  const missedStages    = stageAgg.filter((s) => s.health !== 'ok').length;

  const sopMetricCards = [
    {
      label: 'SOP stages',
      value: sop.stages.length,
      labelClass: 'text-slate-500',
      valueClass: 'text-slate-900',
      cardClass: 'bg-slate-50/80 ring-slate-200',
    },
    {
      label: 'Stages w/ miss',
      value: missedStages,
      labelClass: 'text-red-700',
      valueClass: 'text-red-700',
      cardClass: 'bg-red-50/50 ring-red-200',
    },
    {
      label: 'Failed cases',
      value: totalExceptions,
      labelClass: 'text-amber-800',
      valueClass: 'text-amber-700',
      cardClass: 'bg-amber-50/50 ring-amber-200',
    },
    {
      label: 'Critical failures',
      value: totalViolations,
      labelClass: 'text-red-700',
      valueClass: 'text-red-700',
      cardClass: 'bg-red-50/80 ring-red-200',
    },
  ];

  return (
    <div className="space-y-5">
      {/* SOP header */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-md bg-slate-900 text-white flex items-center justify-center">
            <Workflow className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{sop.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">{sop.purpose}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {sopMetricCards.map((m) => (
            <div
              key={m.label}
              className={`rounded-lg px-4 py-3 ring-1 ${m.cardClass}`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-wider ${m.labelClass}`}>
                {m.label}
              </div>
              <div className={`mt-1 text-2xl font-semibold tabular-nums leading-none ${m.valueClass}`}>
                {m.value.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage-by-stage summary table */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Stage-by-stage compliance map</h4>
            <p className="text-xs text-slate-500 mt-0.5">Every SOP stage and the misses at that step.</p>
          </div>
            <span className="text-[11px] text-slate-500">Click a stage row to expand details inline</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 font-semibold w-10">#</th>
                <th className="px-3 py-2.5 font-semibold">Stage</th>
                <th className="px-3 py-2.5 font-semibold">Accountable owner</th>
                <th className="px-3 py-2.5 font-semibold text-center">Pass rate</th>
                <th className="px-3 py-2.5 font-semibold text-center text-amber-700">Failed cases</th>
                <th className="px-3 py-2.5 font-semibold text-center text-red-700">Critical</th>
                <th className="px-3 py-2.5 font-semibold">Missed controls</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {stageAgg.map((st, idx) => {
                const missed = st.mapped.filter((c) => c.exceptions > 0 || c.violations > 0);
                const isOpen = expandedStageId === st.id;
                return (
                  <React.Fragment key={st.id}>
                    <tr
                      onClick={() => setExpandedStageId((id) => (id === st.id ? null : st.id))}
                      className={`border-b border-slate-100 cursor-pointer transition-colors ${isOpen ? 'bg-slate-100' : 'hover:bg-slate-50/70'}`}
                    >
                      <td className="px-4 py-2.5 text-xs text-slate-500 font-semibold align-top">{idx + 1}</td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-medium text-slate-900">{st.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 max-w-xs">{st.description}</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        {st.owner ? (
                          <div className="min-w-[160px]">
                            <div className="text-[11px] font-semibold text-slate-800 leading-tight">{st.owner.role}</div>
                            <div className="text-[10px] text-slate-500 leading-tight">{st.owner.team}</div>
                            <div className="text-[10px] text-slate-400 leading-tight mt-0.5 italic line-clamp-2 max-w-[200px]">{st.owner.submits}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center align-top"><ComplianceCell v={st.compliance} /></td>
                      <td className="px-3 py-2.5 text-center text-xs font-semibold text-amber-700 align-top">{st.exceptions}</td>
                      <td className="px-3 py-2.5 text-center text-xs font-semibold text-red-700 align-top">{st.violations}</td>
                      <td className="px-3 py-2.5 text-xs align-top">
                        {missed.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> None
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {missed.map((c) => (
                              <span key={c.id} className="text-slate-700">
                                <span className="font-mono text-[10px] font-semibold text-red-700">{c.id}</span>
                                <span className="text-slate-600"> — {c.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top"><StageHealthPill health={st.health} /></td>
                    </tr>
                    {isOpen && (
                      <tr className={`border-b border-slate-200 ${healthSoft(st.health)}`}>
                        <td colSpan={8} className="p-0 align-top">
                          <div className="px-4 sm:px-6 py-5 space-y-3">
                            {st.owner && (
                              <div className="bg-white ring-1 ring-slate-200 rounded-lg p-3 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                                  <UserRound className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 text-xs">
                                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Accountable submitter:</span>
                                  <span className="ml-2 font-semibold text-slate-900">{st.owner.role}</span>
                                  <span className="ml-2 text-slate-500">· {st.owner.team}</span>
                                  <div className="text-slate-600 mt-0.5">
                                    <span className="font-semibold text-slate-700">Submits: </span>{st.owner.submits}
                                  </div>
                                </div>
                              </div>
                            )}

                            {st.mapped.length === 0 ? (
                              <div className="text-sm text-slate-500 italic flex items-center gap-2 bg-white ring-1 ring-slate-200 px-3 py-2 rounded-lg">
                                <Info className="w-4 h-4" /> No controls mapped to this stage.
                              </div>
                            ) : (
                              st.mapped.map((c) => {
                                const hasMiss = c.exceptions > 0 || c.violations > 0;
                                const accent = c.violations > 0
                                  ? 'border-l-red-500'
                                  : c.exceptions > 0
                                  ? 'border-l-amber-500'
                                  : 'border-l-emerald-500';
                                return (
                                  <div
                                    key={c.id}
                                    className={`bg-white ring-1 ring-slate-200 rounded-lg border-l-4 ${accent} p-4`}
                                  >
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="font-mono text-xs font-semibold text-slate-700">{c.id}</span>
                                      <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                                      <StatusBadge status={c.status} />
                                      {hasMiss && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 ring-1 ring-red-200 rounded px-1.5 py-0.5">
                                          <AlertTriangle className="w-3 h-3 shrink-0" /> Miss at stage
                                        </span>
                                      )}
                                      <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                                        <Gavel className="w-3 h-3" /> {c.regulatory}
                                      </span>
                                    </div>

                                    <div className="mt-2 rounded-md bg-slate-50 ring-1 ring-slate-200 p-3">
                                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                        {hasMiss ? 'Why this is a miss' : 'Auditor note'}
                                      </div>
                                      <p className="text-[13px] text-slate-800 leading-relaxed">
                                        {getAuditorFocusForControl(c)}
                                      </p>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap text-[11px] text-slate-600">
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <span>Sampled <span className="font-semibold text-slate-800 tabular-nums">{c.population.toLocaleString('en-IN')}</span></span>
                                        <span className="text-emerald-700 font-semibold tabular-nums">{(c.population - c.exceptions).toLocaleString('en-IN')} passed</span>
                                        <span className="text-amber-700 font-semibold tabular-nums">{c.exceptions} failed</span>
                                        <span className="text-red-700 font-semibold tabular-nums">{c.violations} critical</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => onOpenEvidence(c, domainLabel)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white ring-1 ring-slate-300 hover:bg-slate-900 hover:text-white hover:ring-slate-900 rounded-md px-3 py-1.5 transition-colors"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> Evidence
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CASES — EVIDENCE TRAIL VIEW
// Shows every case flowing through the SOP with a stage-by-stage trail of:
//   - Who submitted the evidence at each stage (role + team + named officer)
//   - What was submitted (files, timestamps, source system)
//   - Which controls passed / failed / are pending at that stage
// This is how the auditor satisfies "all controls cleared across all submitters"
// ============================================================================

const statusChipMap = {
  accepted: { bg: 'bg-emerald-50', fg: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Evidence accepted',  icon: CheckCircle2 },
  rejected: { bg: 'bg-red-50',     fg: 'text-red-700',     ring: 'ring-red-200',     label: 'Failed — rejected', icon: XCircle },
  pending:  { bg: 'bg-amber-50',   fg: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Evidence pending',  icon: Clock },
  blocked:  { bg: 'bg-slate-50',   fg: 'text-slate-500',   ring: 'ring-slate-200',   label: 'Blocked — upstream',icon: MinusCircle },
};

const StageStatusChip = ({ status }) => {
  const s = statusChipMap[status] || statusChipMap.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${s.bg} ${s.fg} ring-1 ${s.ring}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
};

const Avatar = ({ name }) => {
  if (!name) return (
    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center ring-1 ring-slate-200">
      <UserRound className="w-3.5 h-3.5" />
    </div>
  );
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white text-[10px] font-semibold flex items-center justify-center ring-1 ring-slate-300">
      {initials}
    </div>
  );
};

/** Matrix audit outcome: Compliant | Exception (incl. pending / soft findings) | Critical */
const getJourneyAuditCategory = (kase) => {
  if (kase.overallStatus === 'failure') return 'critical';
  if (kase.overallStatus === 'pending') return 'exception';
  if (kase.journeyException) return 'exception';
  return 'compliant';
};

const getJourneyExceptionCellText = (kase, controlExceptionLabels) => {
  if (kase.journeyException) return kase.journeyException;
  if (kase.overallStatus === 'compliant') return '—';
  const fs = kase.trail.find((t) => t.status === 'rejected' || t.status === 'pending');
  if (!fs) return '—';
  const hint =
    (controlExceptionLabels && controlExceptionLabels[kase.failControlId]) ||
    D.CONTROL_EXCEPTION_LABEL[kase.failControlId] ||
    kase.failControlId ||
    'Deviation';
  if (fs.status === 'pending') return `Awaiting: ${hint}`;
  return hint;
};

/** One cell in the journey matrix — accepted/rejected cells open stage detail below */
const JourneyStageCell = ({ status, stageName, onSelect, isSelected }) => {
  const title = `${stageName} — ${status}`;
  const clickable = (status === 'accepted' || status === 'rejected') && onSelect;
  const selectRing = isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : 'ring-1';
  const hoverRing = clickable && !isSelected ? 'hover:ring-2 hover:ring-indigo-300' : '';

  const wrap = (cls, children) => {
    const className = `inline-flex h-8 w-8 items-center justify-center rounded-md ${selectRing} ${hoverRing} ${cls} ${clickable ? 'cursor-pointer' : ''}`;
    if (clickable) {
      return (
        <button
          type="button"
          title={`${title} — click for stage detail`}
          className={className}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          aria-pressed={isSelected}
        >
          {children}
        </button>
      );
    }
    return (
      <div title={title} className={className}>
        {children}
      </div>
    );
  };

  if (status === 'accepted') {
    return wrap('bg-emerald-50 ring-emerald-200', <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2.25} />);
  }
  if (status === 'rejected') {
    return wrap('bg-red-50 ring-red-200', <XCircle className="h-4 w-4 text-red-600" strokeWidth={2.25} />);
  }
  if (status === 'pending') {
    return (
      <div title={`${title} (in review)`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 ring-1 ring-sky-200">
        <span className="text-[11px] font-bold text-sky-700">R</span>
      </div>
    );
  }
  return (
    <div title={title} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 ring-1 ring-slate-200">
      <MinusCircle className="h-4 w-4 text-slate-400" strokeWidth={2} />
    </div>
  );
};

/** Single-stage evidence trail (matrix cell click) or one step in full case trail. */
const JourneyStageDetailBlock = ({ kase, item, idx, controlsById, domainLabel, onOpenEvidence, embedded = false }) => {
  const stageCtrlIds = item.stage.controlIds;
  const statusRingMap = {
    accepted: 'ring-emerald-200 bg-white',
    rejected: 'ring-red-300 bg-red-50/30',
    pending: 'ring-amber-300 bg-amber-50/30',
    blocked: 'ring-slate-200 bg-slate-50/60',
  };

  return (
    <div>
      {!embedded && (
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
          Stage detail · {item.stage.name} · {kase.id}
        </div>
      )}
      <div className={`rounded-lg ring-1 p-4 ${statusRingMap[item.status] || statusRingMap.blocked}`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900">Stage {idx + 1} · {item.stage.name}</span>
              <StageStatusChip status={item.status} />
            </div>
            <p className="text-[11px] text-slate-600 mt-1">{item.stage.description}</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-md ring-1 ring-slate-200 px-3 py-2">
            <Avatar name={item.submittedBy?.name} />
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {item.submittedBy?.name || 'Not yet submitted'}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {item.stage.owner.role} · {item.stage.owner.team}
              </div>
              {item.submittedBy && (
                <div className="text-[10px] text-slate-400 leading-tight font-mono mt-0.5">
                  {item.submittedBy.empId} · {item.submittedBy.location}
                </div>
              )}
              {item.submittedAt && (
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  <CalendarClock className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
                  {item.submittedAt}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Accountable to submit: </span>
          {item.stage.owner.submits}
        </div>
        {item.evidenceItems.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
              Evidence submitted ({item.evidenceItems.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {item.evidenceItems.map((ev, i) => (
                <div key={i} className="flex items-center justify-between bg-white ring-1 ring-slate-200 rounded px-2.5 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-800 font-medium truncate">{ev.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{ev.system}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] uppercase text-slate-500">{ev.type}</span>
                    <span className="text-[10px] text-slate-400">{ev.size}</span>
                    <Download className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {item.evidenceItems.length === 0 && item.status === 'blocked' && (
          <div className="mt-3 text-[11px] text-slate-500 bg-slate-100 rounded px-3 py-2">
            No evidence expected yet — this stage is blocked until the upstream stage is resolved.
          </div>
        )}
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
            Controls at this stage ({stageCtrlIds.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stageCtrlIds.map((cid) => {
              const ctrl = controlsById[cid];
              const result = item.controlResults[cid] || 'not-started';
              const colors = {
                pass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                fail: 'bg-red-50 text-red-700 ring-red-200',
                pending: 'bg-amber-50 text-amber-700 ring-amber-200',
                'not-started': 'bg-slate-50 text-slate-500 ring-slate-200',
              };
              const resultIcon = {
                pass: <CheckCircle2 className="w-3 h-3" />,
                fail: <XCircle className="w-3 h-3" />,
                pending: <Clock className="w-3 h-3" />,
                'not-started': <MinusCircle className="w-3 h-3" />,
              }[result];
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ctrl) onOpenEvidence(ctrl, domainLabel);
                  }}
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium ring-1 hover:shadow-sm transition ${colors[result]}`}
                  title={ctrl?.name}
                >
                  {resultIcon}
                  <span className="font-mono">{cid}</span>
                  <span className="hidden md:inline truncate max-w-[140px]">{ctrl?.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        {item.status === 'rejected' && (
          <div className="mt-3 bg-red-50 ring-1 ring-red-200 rounded p-2 text-[11px] text-red-800">
            <div className="font-semibold mb-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Auditor observation
            </div>
            Evidence did not satisfy control <span className="font-mono font-semibold">{kase.failControlId}</span>.
            Owner informed; corrective action required before stage can be re-submitted.
          </div>
        )}
        {item.status === 'accepted' && (
          <div className="mt-3 bg-emerald-50/80 ring-1 ring-emerald-200 rounded p-2 text-[11px] text-emerald-900">
            <div className="font-semibold mb-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Stage passed
            </div>
            All controls at this stage satisfied with accepted evidence.
          </div>
        )}
        {item.status === 'pending' && (
          <div className="mt-3 bg-amber-50 ring-1 ring-amber-200 rounded p-2 text-[11px] text-amber-800">
            <div className="font-semibold mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Awaiting submission
            </div>
            Accountable owner has not yet submitted required evidence for this stage. SLA breach trigger.
          </div>
        )}
        {item.status === 'blocked' && (
          <div className="mt-3 bg-slate-100 ring-1 ring-slate-200 rounded p-2 text-[11px] text-slate-600">
            <div className="font-semibold mb-0.5 flex items-center gap-1">
              <MinusCircle className="w-3 h-3" /> Blocked
            </div>
            Cannot begin until the upstream stage is resolved.
          </div>
        )}
      </div>
    </div>
  );
};

/** Full case trail — all SOP stages (issuance case column click). */
const JourneyFullCaseTrail = ({ kase, controlsById, domainLabel, onOpenEvidence }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
      Full submission trail · {kase.trail.length} stages · each submitted by the accountable role
    </div>
    <ol className="space-y-3 relative">
      {kase.trail.map((item, idx) => {
        const isLast = idx === kase.trail.length - 1;
        return (
          <li key={idx} className="relative pl-8">
            {!isLast && <div className="absolute left-[11px] top-7 bottom-[-12px] w-px bg-slate-200" />}
            <div
              className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ${
                item.status === 'accepted'
                  ? 'bg-emerald-500 text-white ring-emerald-100'
                  : item.status === 'rejected'
                    ? 'bg-red-500 text-white ring-red-100'
                    : item.status === 'pending'
                      ? 'bg-amber-500 text-white ring-amber-100'
                      : 'bg-slate-300 text-white ring-slate-100'
              }`}
            >
              {idx + 1}
            </div>
            <JourneyStageDetailBlock
              embedded
              kase={kase}
              item={item}
              idx={idx}
              controlsById={controlsById}
              domainLabel={domainLabel}
              onOpenEvidence={onOpenEvidence}
            />
          </li>
        );
      })}
    </ol>
    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
      <div className="text-[11px] text-slate-500">
        <UserCheck className="w-3 h-3 inline -mt-0.5 mr-1" />
        Auditor verdict:{' '}
        {kase.overallStatus === 'compliant'
          ? 'Case fully satisfies all controls across all submitters.'
          : kase.overallStatus === 'failure'
            ? 'Case contains control failure requiring remediation before closure.'
            : 'Case cannot be closed — evidence submission pending from accountable owner.'}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="text-[11px] font-medium text-slate-700 bg-white ring-1 ring-slate-300 hover:bg-slate-100 rounded-md px-2.5 py-1 inline-flex items-center gap-1"
        >
          <Download className="w-3 h-3" /> Download case pack
        </button>
        <button
          type="button"
          className="text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md px-2.5 py-1 inline-flex items-center gap-1"
        >
          <UserCheck className="w-3 h-3" /> Mark as reviewed
        </button>
      </div>
    </div>
  </div>
);

const JourneyAuditPill = ({ category }) => {
  const map = {
    compliant: { cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200', label: 'Compliant' },
    exception: { cls: 'bg-amber-50 text-amber-900 ring-amber-200',       label: 'Exception' },
    critical:  { cls: 'bg-red-50 text-red-800 ring-red-200',            label: 'Critical' },
  };
  const m = map[category] || map.compliant;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${m.cls}`}>
      {m.label}
    </span>
  );
};

const CasesView = ({
  domainId,
  sop,
  cases,
  entity,
  domainLabel,
  onOpenEvidence,
  controls,
  journeyTitle: journeyTitleProp,
  getStageHeader,
  controlExceptionLabels,
  hideJourneyHeader = false,
}) => {
  /** Panel below matrix: full case trail or single stage ({ caseId, view }). */
  const [casePanel, setCasePanel] = useState(null);
  const controlsById = Object.fromEntries(controls.map((c) => [c.id, c]));
  const journeyTitle = journeyTitleProp || D.JOURNEY_TITLE_BY_DOMAIN[domainId] || D.JOURNEY_TITLE_BY_DOMAIN.customer;
  const stageColSpan = 3 + (sop?.stages?.length || 0);

  const toggleFullCase = (caseId) => {
    setCasePanel((prev) =>
      prev?.caseId === caseId && prev.view === 'full' ? null : { caseId, view: 'full' },
    );
  };

  const toggleStageDetail = (caseId, stageIndex, status) => {
    if (status !== 'accepted' && status !== 'rejected') return;
    setCasePanel((prev) =>
      prev?.caseId === caseId && prev.view === 'stage' && prev.stageIndex === stageIndex
        ? null
        : { caseId, view: 'stage', stageIndex },
    );
  };

  return (
    <div className="space-y-4">

      {/* Journey matrix — stage-wise control compliance (same pattern for every domain) */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        {!hideJourneyHeader && (
          <div className="border-b border-slate-200 bg-slate-100/90 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" aria-hidden />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.06em] text-indigo-950 md:text-xs">
                {journeyTitle}
              </h3>
            </div>
            <p className="mt-1 pl-4 text-[11px] leading-relaxed text-slate-600">
              Each column is an SOP stage. <span className="font-semibold text-slate-700">Green</span> = passed, <span className="font-semibold text-red-700">Red</span> = failed, <span className="font-semibold text-sky-700">R</span> = in review / pending, <span className="font-semibold text-slate-500">Grey</span> = blocked. Click the <span className="font-semibold text-slate-700">{entity.singular}</span> for all stages; click a <span className="font-semibold text-slate-700">green or red</span> cell for one stage only.
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <th className="whitespace-nowrap px-3 py-2.5 pl-4">{entity.singular}</th>
                {sop.stages.map((st) => (
                  <th key={st.id} className="px-1 py-2.5 text-center font-semibold" title={st.name}>
                    {getStageHeader ? getStageHeader(st) : D.getJourneyStageHeader(domainId, st)}
                  </th>
                ))}
                <th className="min-w-[120px] px-2 py-2.5">Exception</th>
                <th className="whitespace-nowrap px-3 py-2.5 pr-4 text-center">Audit status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
          {cases.map((kase) => {
            const panelOpen = casePanel?.caseId === kase.id;
            const showFullTrail = panelOpen && casePanel.view === 'full';
            const showStagePanel =
              panelOpen &&
              casePanel.view === 'stage' &&
              (() => {
                const item = kase.trail[casePanel.stageIndex];
                return item && (item.status === 'accepted' || item.status === 'rejected');
              })();
            const openItem = showStagePanel ? kase.trail[casePanel.stageIndex] : null;
            const auditCat = getJourneyAuditCategory(kase);
            const excText = getJourneyExceptionCellText(kase, controlExceptionLabels);
            const excBadge = auditCat !== 'compliant' && excText !== '—';

            return (
              <React.Fragment key={kase.id}>
                <tr className="bg-white transition-colors hover:bg-slate-50/80">
                  <td className="max-w-[220px] px-3 py-2.5 pl-4 align-middle">
                    <button
                      type="button"
                      onClick={() => toggleFullCase(kase.id)}
                      className="flex w-full items-start gap-2 text-left rounded-md -m-1 p-1 hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      aria-expanded={showFullTrail}
                    >
                      <span className="mt-0.5 text-slate-400 shrink-0">
                        {panelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold leading-snug text-slate-900">{kase.subject}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-slate-500">{kase.id}</div>
                        <div className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{kase.segment}</div>
                      </div>
                    </button>
                  </td>
                  {kase.trail.map((t, stageIdx) => (
                    <td key={t.stage.id} className="px-1 py-2 text-center align-middle">
                      <JourneyStageCell
                        status={t.status}
                        stageName={t.stage.name}
                        isSelected={showStagePanel && casePanel.stageIndex === stageIdx}
                        onSelect={() => toggleStageDetail(kase.id, stageIdx, t.status)}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 align-middle">
                    {excBadge ? (
                      <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200">
                        {excText}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 pr-4 text-center align-middle">
                    <JourneyAuditPill category={auditCat} />
                  </td>
                </tr>

                {(showFullTrail || showStagePanel) && (
                  <tr className="bg-slate-50/90">
                    <td colSpan={stageColSpan} className="border-t border-slate-100 px-4 py-4">
                      {showFullTrail ? (
                        <JourneyFullCaseTrail
                          kase={kase}
                          controlsById={controlsById}
                          domainLabel={domainLabel}
                          onOpenEvidence={onOpenEvidence}
                        />
                      ) : (
                        <JourneyStageDetailBlock
                          kase={kase}
                          item={openItem}
                          idx={casePanel.stageIndex}
                          controlsById={controlsById}
                          domainLabel={domainLabel}
                          onOpenEvidence={onOpenEvidence}
                        />
                      )}
                      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCasePanel(null)}
                          className="text-[11px] font-medium text-slate-700 bg-white ring-1 ring-slate-300 hover:bg-slate-100 rounded-md px-2.5 py-1"
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {cases.length === 0 && (
            <tr>
              <td colSpan={stageColSpan} className="py-10 text-center text-sm text-slate-500">
                No cases configured for this domain yet.
              </td>
            </tr>
          )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DOMAIN TAB — lists ALL controls for the selected domain
// ============================================================================

/** Optional extra tabs (e.g. Fast-Tag Toll settlement). */
export type DomainWorkspaceExtraTab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
};

export function DomainAuditWorkspace({
  domainId,
  domainLabel,
  controls,
  sop,
  cases,
  entity,
  onOpenEvidence,
  buildEvidence: _buildEvidence,
  journeyTitle,
  getStageHeader,
  controlExceptionLabels,
  getAuditorFocusForControl,
  defaultView = 'sop',
  registerControlsFirst = false,
  extraTabs = [],
}: {
  domainId: string;
  domainLabel: string;
  controls: AuditControl[];
  sop: { name: string; purpose: string; stages: unknown[] } | undefined;
  cases: unknown[];
  entity: { singular: string; plural: string; entity: string };
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
  buildEvidence?: (control: AuditControl, domainLabel: string) => unknown;
  journeyTitle?: string;
  getStageHeader?: (stage: { id: string; name: string }) => string;
  controlExceptionLabels?: Record<string, string>;
  getAuditorFocusForControl?: (control: AuditControl) => string;
  defaultView?: string;
  registerControlsFirst?: boolean;
  extraTabs?: DomainWorkspaceExtraTab[];
}) {
  const [view, setView] = useState(defaultView);
  const [filter, setFilter] = useState('all'); // all | effective | needs-attention | deficient
  const [query, setQuery]   = useState('');

  const filtered = useMemo(() => {
    const rows = controls.filter((c) => {
      const matchStatus = filter === 'all' || c.status === filter;
      const q = query.trim().toLowerCase();
      const matchQ = !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.regulatory || '').toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
    if (registerControlsFirst) {
      return [...rows].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }
    return rows;
  }, [controls, filter, query, registerControlsFirst]);

  const totals = useMemo(
    () => ({
      count:       controls.length,
      effective:   controls.filter((c) => c.status === 'effective').length,
      needsAtt:    controls.filter((c) => c.status === 'needs-attention').length,
      deficient:   controls.filter((c) => c.status === 'deficient').length,
    }),
    [controls],
  );

  const workspaceTabs = useMemo(() => {
    const core = registerControlsFirst
      ? [
          { id: 'register', label: 'Control register', icon: ListChecks },
          { id: 'sop', label: 'Process flow', icon: Workflow },
          { id: 'cases', label: `${entity.plural} — Journey matrix`, icon: UserRound },
        ]
      : [
          { id: 'sop', label: 'Process flow', icon: Workflow },
          { id: 'cases', label: `${entity.plural} — Journey matrix`, icon: UserRound },
          { id: 'register', label: 'Control register', icon: ListChecks },
        ];
    const extra = (extraTabs || []).map((t) => ({ id: t.id, label: t.label, icon: t.icon }));
    return [...core, ...extra];
  }, [registerControlsFirst, entity.plural, extraTabs]);

  return (
    <div className="space-y-5">
      {/* View toggle: Process flow / Control register / Cases */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 p-1.5 inline-flex items-center gap-1 flex-wrap">
        {workspaceTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {extraTabs?.map(
        (tab) => view === tab.id && <React.Fragment key={tab.id}>{tab.content}</React.Fragment>,
      )}

      {/* ===== CASES — EVIDENCE TRAIL VIEW ===== */}
      {view === 'cases' && (
        sop
          ? (
            <CasesView
              domainId={domainId}
              sop={sop}
              cases={cases}
              entity={entity}
              domainLabel={domainLabel}
              onOpenEvidence={onOpenEvidence}
              controls={controls}
              journeyTitle={journeyTitle}
              getStageHeader={getStageHeader}
              controlExceptionLabels={controlExceptionLabels}
              hideJourneyHeader={registerControlsFirst}
            />
          )
          : (
            <div className="bg-white rounded-lg ring-1 ring-slate-200 p-10 text-center text-sm text-slate-500">
              <MinusCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              Case data is not defined for this domain yet.
            </div>
          )
      )}

      {/* ===== SOP / PROCESS-FLOW VIEW ===== */}
      {view === 'sop' && (
        sop
          ? (
            <SopProcessView
              sop={sop}
              controls={controls}
              onOpenEvidence={onOpenEvidence}
              domainLabel={domainLabel}
              getAuditorFocusForControl={getAuditorFocusForControl}
            />
          )
          : (
            <div className="bg-white rounded-lg ring-1 ring-slate-200 p-10 text-center text-sm text-slate-500">
              <MinusCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              SOP map is not defined for this domain yet.
            </div>
          )
      )}

      {/* ===== CONTROL REGISTER VIEW ===== */}
      {view === 'register' && (
      <>
      {!registerControlsFirst && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Control-level compliance</h3>
          <p className="text-xs text-slate-500 mb-4">Each bar is one control. Click the row below to see its evidence.</p>
          <div style={{ height: Math.max(280, controls.length * 34) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={controls} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[75, 100]} fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="id" fontSize={11} stroke="#64748b" width={60} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v}%`, 'Compliance']}
                  labelFormatter={(l) => controls.find((c) => c.id === l)?.name || l}
                />
                <Bar dataKey="compliance" radius={[0, 4, 4, 0]}>
                  {controls.map((p, i) => (
                    <Cell key={i} fill={p.compliance >= 95 ? '#10b981' : p.compliance >= 90 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Violations vs exceptions</h3>
          <p className="text-xs text-slate-500 mb-3">Per control in this domain</p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={controls} margin={{ top: 8, right: 8, left: -16, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="id" fontSize={10} stroke="#64748b" angle={-30} textAnchor="end" interval={0} height={48} />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="violations" stackId="a" fill="#ef4444" name="Violations" />
                <Bar dataKey="exceptions" stackId="a" fill="#f59e0b" name="Exceptions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}

      <div className="bg-white rounded-lg ring-1 ring-slate-200 p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-50 rounded-md px-3 py-1.5 text-sm w-80 ring-1 ring-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search control ID, name or regulation…"
            className="bg-transparent border-0 focus:outline-none text-slate-700 placeholder-slate-400 text-sm flex-1"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { k: 'all',              label: `All (${totals.count})`,             cls: 'bg-slate-900 text-white' },
            { k: 'effective',        label: `Effective (${totals.effective})`,   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
            { k: 'needs-attention',  label: `Needs attention (${totals.needsAtt})`, cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
            { k: 'deficient',        label: `Deficient (${totals.deficient})`,   cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
          ].map((b) => (
            <button key={b.k}
              onClick={() => setFilter(b.k)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filter === b.k ? b.cls : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> / {totals.count} controls
        </div>
      </div>

      <div className="bg-white rounded-lg ring-1 ring-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Control</th>
                <th className="px-3 py-3 font-semibold">Owner</th>
                <th className="px-3 py-3 font-semibold">Frequency</th>
                <th className="px-3 py-3 font-semibold text-right" title="Total cases that must satisfy this control this quarter">Cases in scope</th>
                <th className="px-3 py-3 font-semibold text-right text-emerald-700" title="Cases where control passed with accepted evidence">Passed</th>
                <th className="px-3 py-3 font-semibold text-center text-amber-700" title="Cases where control did not pass — needs remediation">Failed</th>
                <th className="px-3 py-3 font-semibold text-center text-red-700" title="Subset of failed cases that breach a regulation / policy">Critical</th>
                <th className="px-3 py-3 font-semibold text-center" title="% of in-scope cases that passed this control">Pass rate</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold text-right">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const passed = c.population - c.exceptions;
                return (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="font-mono text-[11px] text-slate-500">{c.id}</div>
                    <div className="font-medium text-slate-900 leading-snug">{c.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-start gap-1">
                      <Gavel className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{c.regulatory}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700 align-top">{c.owner}</td>
                  <td className="px-3 py-3 text-xs text-slate-700 align-top">{c.frequency}</td>
                  <td className="px-3 py-3 text-right text-xs text-slate-700 align-top">{c.population.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right text-xs font-semibold text-emerald-700 align-top">{passed.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-center text-xs font-semibold text-amber-700 align-top">{c.exceptions}</td>
                  <td className="px-3 py-3 text-center text-xs font-semibold text-red-700 align-top">{c.violations}</td>
                  <td className="px-3 py-3 text-center align-top"><ComplianceCell v={c.compliance} /></td>
                  <td className="px-3 py-3 align-top"><StatusBadge status={c.status} /></td>
                  <td className="px-3 py-3 text-right align-top">
                    <button
                      onClick={() => onOpenEvidence(c, domainLabel)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-900 hover:text-white hover:ring-slate-900 rounded-md px-2.5 py-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View evidence
                    </button>
                  </td>
                </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-sm text-slate-500">
                    No controls match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {registerControlsFirst && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Control-level compliance</h3>
          <p className="text-xs text-slate-500 mb-4">Summary chart — all controls listed above.</p>
          <div style={{ height: Math.max(280, controls.length * 34) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={controls} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[75, 100]} fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="id" fontSize={11} stroke="#64748b" width={60} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v}%`, 'Compliance']}
                  labelFormatter={(l) => controls.find((c) => c.id === l)?.name || l}
                />
                <Bar dataKey="compliance" radius={[0, 4, 4, 0]}>
                  {controls.map((p, i) => (
                    <Cell key={i} fill={p.compliance >= 95 ? '#10b981' : p.compliance >= 90 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Violations vs exceptions</h3>
          <p className="text-xs text-slate-500 mb-3">Per control in this domain</p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={controls} margin={{ top: 8, right: 8, left: -16, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="id" fontSize={10} stroke="#64748b" angle={-30} textAnchor="end" interval={0} height={48} />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="violations" stackId="a" fill="#ef4444" name="Violations" />
                <Bar dataKey="exceptions" stackId="a" fill="#f59e0b" name="Exceptions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}
      </>
      )}
    </div>
  );
};

const DomainTab = ({ domainId, onOpenEvidence }) => {
  const domain = D.DOMAINS.find((d) => d.id === domainId);
  return (
    <DomainAuditWorkspace
      domainId={domainId}
      domainLabel={domain.label}
      controls={D.CONTROLS_BY_DOMAIN[domainId] || []}
      sop={D.SOP_BY_DOMAIN[domainId]}
      cases={D.CASES_BY_DOMAIN[domainId] || []}
      entity={D.CASE_ENTITY[domainId] || { singular: 'Case', plural: 'Cases', entity: 'case' }}
      onOpenEvidence={onOpenEvidence}
      buildEvidence={D.buildEvidence}
    />
  );
};

// ============================================================================
// EVIDENCE DRAWER — opens only on demand
// ============================================================================

const EvidenceDrawer = ({ open, evidence, onClose }) => {
  if (!open || !evidence) return null;
  const {
    control: c, domainLabel, lastTested, tester, testingSteps, exceptionLog,
    sourceSystems, documents, auditorNote, mgmtResponse,
    stageSubmitters = [], sampleCaseTrails = [],
  } = evidence;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />

      <aside className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{domainLabel}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-[11px] text-slate-600">{c.id}</span>
                <StatusBadge status={c.status} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 leading-snug">{c.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.objective}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-50 rounded p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold" title="% of in-scope cases that passed this control">Pass rate</div>
              <div className="text-base font-semibold text-slate-900"><ComplianceCell v={c.compliance} /></div>
              <div className="text-[10px] text-slate-500 mt-0.5">across all cases</div>
            </div>
            <div className="bg-slate-50 rounded p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold" title="Total cases that had to satisfy this control">Cases in scope</div>
              <div className="text-base font-semibold text-slate-900">{c.population.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">this quarter</div>
            </div>
            <div className="bg-slate-50 rounded p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold" title="Cases where control passed with accepted evidence">Passed</div>
              <div className="text-base font-semibold text-emerald-700">{(c.population - c.exceptions).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">all evidence accepted</div>
            </div>
            <div className="bg-slate-50 rounded p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold" title="Cases needing remediation — of which critical failures breach regulation">Failed cases</div>
              <div className="text-base font-semibold text-amber-700">
                {c.exceptions} <span className="text-[10px] font-medium text-red-700">({c.violations} critical)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">need remediation</div>
            </div>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Control metadata */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Control metadata</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-500">Owner: </span><span className="font-medium text-slate-800">{c.owner}</span></div>
              <div><span className="text-slate-500">Frequency: </span><span className="font-medium text-slate-800">{c.frequency}</span></div>
              <div className="col-span-2"><span className="text-slate-500">Regulatory reference: </span><span className="font-medium text-slate-800">{c.regulatory}</span></div>
              <div><span className="text-slate-500">Last tested: </span><span className="font-medium text-slate-800">{lastTested}</span></div>
              <div><span className="text-slate-500">Tester: </span><span className="font-medium text-slate-800">{tester}</span></div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* Who is accountable to submit evidence (per SOP stage)       */}
          {/* ========================================================== */}
          {stageSubmitters.length > 0 && (
            <section>
              <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                <UserRound className="w-3.5 h-3.5" /> Accountable evidence submitters
              </h4>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                This control fires at {stageSubmitters.length} SOP stage{stageSubmitters.length > 1 ? 's' : ''}. At each stage the role below is accountable to submit the evidence. For a case to pass this control, <span className="font-semibold text-slate-700">every one</span> of these submitters must have provided accepted evidence.
              </p>
              <div className="space-y-2">
                {stageSubmitters.map(({ sopName, stage }, i) => (
                  <div key={i} className="rounded-md ring-1 ring-slate-200 p-3 bg-white">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{sopName}</div>
                        <div className="text-xs font-semibold text-slate-900 mt-0.5">Stage: {stage.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-900">{stage.owner.role}</div>
                        <div className="text-[11px] text-slate-500">{stage.owner.team}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1.5">
                      <span className="font-semibold text-slate-700">Submits: </span>{stage.owner.submits}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================== */}
          {/* Sample case trails — show a few actual cases + who submitted */}
          {/* ========================================================== */}
          {sampleCaseTrails.length > 0 && (
            <section>
              <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" /> Sample case evidence trails ({sampleCaseTrails.length})
              </h4>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Representative cases showing the stage where this control fired, the person who submitted evidence, and the result for this specific control on that case.
              </p>
              <div className="space-y-2">
                {sampleCaseTrails.map(({ kase, hit }, i) => {
                  const result = hit.controlResults[c.id] || 'not-started';
                  const resMap = {
                    pass:   { bg: 'bg-emerald-50', fg: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Passed',  icon: CheckCircle2 },
                    fail:   { bg: 'bg-red-50',     fg: 'text-red-700',     ring: 'ring-red-200',     label: 'Failed',  icon: XCircle },
                    pending:{ bg: 'bg-amber-50',   fg: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Pending', icon: Clock },
                    'not-started': { bg: 'bg-slate-50', fg: 'text-slate-500', ring: 'ring-slate-200', label: 'Not yet', icon: MinusCircle },
                  };
                  const r = resMap[result];
                  const ResIcon = r.icon;
                  return (
                    <div key={i} className={`rounded-md ring-1 p-3 ${r.ring} ${r.bg}`}>
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] text-slate-600">{kase.id}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-xs font-semibold text-slate-900">{kase.subject}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{kase.segment} · Opened {kase.opened}</div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            <span className="font-semibold">Fired at: </span>Stage — {hit.stage.name}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold ${r.fg} bg-white ring-1 ${r.ring}`}>
                          <ResIcon className="w-3 h-3" /> {r.label}
                        </span>
                      </div>

                      {/* Submitter */}
                      <div className="mt-2 flex items-center gap-2 bg-white rounded ring-1 ring-slate-200 px-2 py-1.5">
                        <Avatar name={hit.submittedBy?.name} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-slate-900 truncate">
                            {hit.submittedBy?.name || 'Not yet submitted'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {hit.stage.owner.role} · {hit.stage.owner.team}
                          </div>
                          {hit.submittedBy && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {hit.submittedBy.empId} · {hit.submittedAt || '—'}
                            </div>
                          )}
                        </div>
                        {hit.evidenceItems?.length > 0 && (
                          <div className="text-[10px] text-slate-500 text-right whitespace-nowrap">
                            <FileText className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                            {hit.evidenceItems.length} file{hit.evidenceItems.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Testing procedure */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" /> Testing procedure performed
            </h4>
            <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
              {testingSteps.map((s, i) => <li key={i} className="leading-relaxed">{s}</li>)}
            </ol>
          </section>

          {/* Exception log */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Exception log ({c.exceptions})
            </h4>
            <div className="rounded-md ring-1 ring-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2 font-semibold">Ref</th>
                    <th className="px-3 py-2 font-semibold">Detail</th>
                    <th className="px-3 py-2 font-semibold">Severity</th>
                    <th className="px-3 py-2 font-semibold">SLA</th>
                    <th className="px-3 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptionLog.map((e) => (
                    <tr key={e.ref} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{e.ref}</td>
                      <td className="px-3 py-2 text-slate-700">{e.detail}</td>
                      <td className="px-3 py-2"><SeverityPill sev={e.severity} /></td>
                      <td className="px-3 py-2">
                        <span className={e.sla === 'Breached' ? 'text-red-700 font-medium' : 'text-emerald-700 font-medium'}>{e.sla}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{e.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Source systems */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Source systems & data pulled
            </h4>
            <div className="space-y-1.5">
              {sourceSystems.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="text-slate-500"> — {s.record}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Documents */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <FolderSearch className="w-3.5 h-3.5" /> Workpapers & supporting documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documents.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-md ring-1 ring-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-xs text-slate-800 font-medium truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] uppercase text-slate-500">{d.type}</span>
                    <span className="text-[10px] text-slate-400">{d.size}</span>
                    <button className="text-slate-500 hover:text-slate-900"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Auditor note + management response */}
          <section className="grid grid-cols-1 gap-3">
            <div className="rounded-md ring-1 ring-slate-200 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Auditor conclusion</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{auditorNote}</p>
            </div>
            <div className="rounded-md ring-1 ring-slate-200 p-3 bg-slate-50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Management response</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{mgmtResponse}</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Evidence schema v1.0 · Locked workpaper · Reviewed by CAE
          </div>
          <div className="flex gap-2">
            <button className="text-xs text-slate-700 bg-white ring-1 ring-slate-300 hover:bg-slate-100 rounded-md px-3 py-1.5 inline-flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download pack
            </button>
            <button onClick={onClose} className="text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-md px-3 py-1.5">
              Close
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type ProcessAuditDashboardTab = ProcessAuditTabId | 'fast-tag';

/** v2-only sidebar entry — same shape as `ProcessAuditDomainDef` for unified nav rendering. */
const FAST_TAG_SIDEBAR_ITEM = {
  id: 'fast-tag' as const,
  label: 'Fast-Tag',
  icon: Radio,
  color: '#f97316',
};

export default function ProcessAuditDashboard() {
  const ipaVersion = useIpaVersion();
  const isV2 = ipaVersion === 'v2';
  const [activeTab, setActiveTab] = useState<ProcessAuditDashboardTab>('overview');
  const [drawer, setDrawer] = useState<EvidenceDrawerState>({ open: false, evidence: null });
  const [domainsRailOpen, setDomainsRailOpen] = useState(false);

  const sidebarDomains = isV2 ? [...D.DOMAINS, FAST_TAG_SIDEBAR_ITEM] : D.DOMAINS;

  const openEvidence = (control: AuditControl, domainLabel: string) =>
    setDrawer({
      open: true,
      evidence:
        domainLabel === 'Fast-Tag'
          ? buildFastTagEvidence(control, domainLabel)
          : D.buildEvidence(control, domainLabel),
    });
  const closeEvidence = () => setDrawer({ open: false, evidence: null });

  return (
    <div
      className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-slate-100"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif' }}
    >
      {/* Top bar */}
      <header className="z-30 shrink-0 bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Indian process audit</div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Banking process &amp; control intelligence · {ipaVersion.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <div className="text-xs font-medium">Audit Lead</div>
                <div className="text-[10px] text-slate-400">Q1 FY26 · Closing review</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold">AL</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        {/* Domains — fixed-height rail (viewport minus header); only nav scrolls if needed */}
        <aside
          onMouseEnter={() => setDomainsRailOpen(true)}
          onMouseLeave={() => setDomainsRailOpen(false)}
          className={`flex min-h-0 shrink-0 flex-col border-r border-slate-200 bg-white shadow-[1px_0_0_rgba(15,23,42,0.04)] transition-[width] duration-200 ease-out ${
            domainsRailOpen ? 'w-56' : 'w-14'
          }`}
          aria-label="Domains"
        >
          <div className="px-2 py-3 border-b border-slate-100 flex items-center min-h-[44px] justify-center overflow-hidden">
            {domainsRailOpen ? (
              <div className="w-full pl-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Domains</div>
              </div>
            ) : (
              <ListChecks className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
            )}
          </div>
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5 space-y-0.5">
            {sidebarDomains.map((d) => {
              const Icon = d.icon;
              const isActive = activeTab === d.id;
              const count =
                d.id === 'overview'
                  ? null
                  : d.id === 'fast-tag'
                    ? FASTAG_CONTROL_COUNT
                    : (D.CONTROLS_BY_DOMAIN[d.id as ProcessAuditTabId] || []).length;
              return (
                <button
                  key={d.id}
                  type="button"
                  title={d.label}
                  onClick={() => setActiveTab(d.id as ProcessAuditDashboardTab)}
                  className={`flex w-full items-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                    domainsRailOpen ? 'justify-start px-2' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : ''}`} style={!isActive ? { color: d.color } : undefined} />
                  {domainsRailOpen && (
                    <>
                      <span className="flex-1 text-left truncate text-[13px] leading-tight">{d.label}</span>
                      {count !== null && (
                        <span
                          className={`shrink-0 text-[10px] font-semibold tabular-nums rounded px-1.5 py-0.5 ${
                            isActive ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Body — sole vertical scroll region so header + domain rail stay fixed */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto">
          <div className="mx-auto max-w-[1600px] px-6 py-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {sidebarDomains.find((d) => d.id === activeTab)?.label}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  {activeTab === 'overview'
                    ? `Cross-domain compliance posture across ${D.TOTAL_CONTROLS} controls and 10 auditor domains`
                    : activeTab === 'fast-tag'
                      ? 'FASTag issuance & toll lifecycle audit · NETC / NPCI OV1T · control testing Q1 2026'
                      : `All controls in scope · regulatory references · evidence on demand`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                  <Download className="w-4 h-4" /> Export
                </button>
                <button className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800">
                  <Eye className="w-4 h-4" /> Auditor view
                </button>
              </div>
            </div>

            {activeTab === 'fast-tag' && isV2 ? (
              <FastTagAuditDashboard onOpenEvidence={openEvidence} />
            ) : activeTab === 'overview' ? (
              <OverviewTab onDrillDown={(id) => setActiveTab(id)} isV2={isV2} />
            ) : (
              <DomainTab domainId={activeTab as ProcessAuditTabId} onOpenEvidence={openEvidence} />
            )}
          </div>
        </main>
      </div>

      <EvidenceDrawer open={drawer.open} evidence={drawer.evidence} onClose={closeEvidence} />
    </div>
  );
}
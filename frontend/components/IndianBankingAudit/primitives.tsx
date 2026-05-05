'use client';

import React from 'react';
import {
  bandBar,
  bandBg,
  bandDot,
  bandRing,
  bandText,
  evidenceStatusBadge,
  hitlBadge,
  outcomeBadge,
  severityBadge,
  trendArrow,
  trendTone,
} from './theme';

// ---------- Sparkline ----------
export function Sparkline({
  series = [],
  band = 'neutral',
  width = 120,
  height = 30,
  fill = false,
  className = '',
}: {
  series?: number[];
  band?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
}) {
  if (!series.length) return <div style={{ height }} />;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stroke = bandRing(band);
  const fillColor =
    ({ red: '#fee2e2', amber: '#fef3c7', green: '#d1fae5', grey: '#f1f5f9', neutral: '#f1f5f9' } as Record<string, string>)[band] ||
    '#f1f5f9';
  const points = series
    .map((v, i) => {
      const x = (i / Math.max(1, series.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  const fillPath = `0,${height} ${points} ${width},${height}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block max-w-full overflow-visible ${className}`.trim()}
      style={{ width: '100%', height }}
    >
      {fill && <polygon points={fillPath} fill={fillColor} />}
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ---------- Score Ring ----------
export function ScoreRing({
  score,
  band = 'neutral',
  size = 80,
  thickness = 8,
  label,
  sublabel,
}: {
  score: number | null | undefined;
  band?: string;
  size?: number;
  thickness?: number;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const dashOffset = circ - (pct / 100) * circ;

  /** Inner “hole” of the ring — too small to stack score + caption without clipping the stroke */
  const innerHole = Math.max(0, size - 2 * thickness);
  const putLabelOutside = !!(label && innerHole < 38);

  const scoreClass =
    size < 48 ? `text-xs font-bold leading-none ${bandText(band)}` : size < 72 ? `text-sm font-bold leading-none ${bandText(band)}` : `text-base font-bold ${bandText(band)}`;
  const inlineLabelClass =
    size < 56 ? 'text-[8px] font-semibold uppercase leading-none tracking-wider text-slate-500' : 'text-[9px] font-semibold uppercase leading-none tracking-wider text-slate-500';

  return (
    <div className="inline-flex flex-shrink-0 flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={bandRing(band)}
            strokeWidth={thickness}
            strokeDasharray={circ}
            strokeDashoffset={score == null ? circ : dashOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0 px-0.5">
          <div className={`tabular-nums ${scoreClass}`}>{score == null ? '—' : Math.round(score)}</div>
          {label && !putLabelOutside && <div className={`mt-0.5 ${inlineLabelClass}`}>{label}</div>}
        </div>
      </div>
      {putLabelOutside && (
        <div className="mt-0.5 text-center leading-none">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
          {sublabel && <div className="mt-0.5 text-[10px] leading-snug text-slate-500">{sublabel}</div>}
        </div>
      )}
      {!putLabelOutside && sublabel && <div className="mt-1 text-[10px] text-slate-500">{sublabel}</div>}
    </div>
  );
}

// ---------- Status Badge ----------
export function StatusBadge({ tone = 'neutral', label, size = 'sm' }: { tone?: string; label: string; size?: 'xs' | 'sm' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${
        size === 'xs' ? 'text-[10px]' : 'text-xs'
      } font-medium ${bandBg(tone)}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${bandDot(tone)}`} />
      {label}
    </span>
  );
}

// ---------- Outcome Badge ----------
export function OutcomeBadge({ outcome, size = 'sm' }: { outcome: string; size?: 'xs' | 'sm' }) {
  const display: Record<string, string> = {
    Pass: 'Pass',
    Fail: 'Fail',
    DataGap: 'Data Gap',
    EvidenceGap: 'Evidence Gap',
    NeedsReview: 'Needs Review',
    NA: 'N/A',
  };
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 font-semibold tracking-wide ${outcomeBadge(outcome)} ${
        size === 'xs' ? 'text-[10px]' : 'text-xs'
      }`}
    >
      {display[outcome] || outcome}
    </span>
  );
}

export function EvidenceStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold ${evidenceStatusBadge(status)}`}>
      {status}
    </span>
  );
}

export function HITLBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold ${hitlBadge(status)}`}>
      HITL · {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider ${severityBadge(severity)}`}>
      {severity.toUpperCase()}
    </span>
  );
}

// ---------- Entity Type Badge ----------
const ENTITY_BADGE_CLASS: Record<string, string> = {
  risk: 'bg-rose-100 text-rose-800 border-rose-200',
  control: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  controlInstance: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  obligation: 'bg-purple-100 text-purple-800 border-purple-200',
  process: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  processExecution: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  stepExecution: 'bg-teal-100 text-teal-800 border-teal-200',
  evidence: 'bg-sky-100 text-sky-800 border-sky-200',
  sourceRecord: 'bg-blue-100 text-blue-800 border-blue-200',
  correlationRecord: 'bg-blue-50 text-blue-700 border-blue-200',
  exception: 'bg-rose-50 text-rose-700 border-rose-200',
  issue: 'bg-amber-100 text-amber-800 border-amber-200',
  remediationAction: 'bg-amber-50 text-amber-700 border-amber-200',
  seniorManager: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  decisionEvent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  attestationEvent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  aiInsight: 'bg-violet-100 text-violet-800 border-violet-200',
  auditPack: 'bg-slate-100 text-slate-800 border-slate-200',
  workpaper: 'bg-slate-50 text-slate-700 border-slate-200',
  testExecution: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reportingClock: 'bg-orange-100 text-orange-800 border-orange-200',
  reportingSubmission: 'bg-orange-50 text-orange-700 border-orange-200',
  sourceSystem: 'bg-slate-100 text-slate-700 border-slate-200',
};

const ENTITY_LABEL: Record<string, string> = {
  risk: 'RISK',
  control: 'CONTROL',
  controlInstance: 'CTRL INSTANCE',
  obligation: 'OBLIGATION',
  process: 'PROCESS',
  processExecution: 'PROCESS EXEC',
  stepExecution: 'STEP EXEC',
  evidence: 'EVIDENCE',
  sourceRecord: 'SOURCE RECORD',
  correlationRecord: 'CORRELATION',
  exception: 'EXCEPTION',
  issue: 'ISSUE',
  remediationAction: 'REMEDIATION',
  seniorManager: 'SENIOR MGR',
  decisionEvent: 'DECISION',
  attestationEvent: 'ATTESTATION',
  aiInsight: 'AI INSIGHT',
  auditPack: 'AUDIT PACK',
  workpaper: 'WORKPAPER',
  testExecution: 'TEST',
  reportingClock: 'CLOCK',
  reportingSubmission: 'SUBMISSION',
  sourceSystem: 'SOURCE SYS',
};

export function EntityTypeBadge({ type }: { type: string | null }) {
  const cls = ENTITY_BADGE_CLASS[type || ''] || 'bg-slate-100 text-slate-800 border-slate-200';
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider border ${cls}`}>
      {ENTITY_LABEL[type || ''] || type}
    </span>
  );
}

// ---------- CES Breakdown Card (Pass 4 §5 #3) ----------
export type CESComponent = { current: number | null; band?: string; series?: number[] };
export type CESBreakdown = {
  operating: CESComponent;
  catch: CESComponent;
  evidence: CESComponent;
};

export function CESBreakdownCard({ breakdown, ces, cesBand }: { breakdown: CESBreakdown; ces: number | null; cesBand: string }) {
  const dims = [
    { key: 'operating', label: 'Operating Rate', desc: 'Did the control fire when expected?', data: breakdown.operating },
    { key: 'catch', label: 'Catch Rate', desc: 'Did it catch what it was designed to catch?', data: breakdown.catch },
    { key: 'evidence', label: 'Evidence Completeness', desc: 'Is the evidence captured to standard?', data: breakdown.evidence },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Control Effectiveness Score</div>
          <div className="text-[10px] text-slate-400">0.40 × OperatingRate + 0.40 × CatchRate + 0.20 × EvidenceCompleteness</div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${bandText(cesBand)}`}>{ces == null ? '—' : ces.toFixed(1)}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">CES · {cesBand}</div>
        </div>
      </div>
      <div className="space-y-2">
        {dims.map((d) => (
          <div key={d.key} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
            <div className="mb-1.5 flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">{d.label}</div>
                <div className="text-[10px] text-slate-500">{d.desc}</div>
              </div>
              <div className={`text-lg font-bold ${bandText(d.data.band || 'neutral')}`}>
                {d.data.current == null ? '—' : d.data.current}
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full ${bandBar(d.data.band || 'neutral')}`}
                style={{ width: `${d.data.current ?? 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Stat / KV / Empty ----------
export function Stat({ k, v, sub, tone = 'slate' }: { k: string; v: React.ReactNode; sub?: string; tone?: string }) {
  const colors: Record<string, string> = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    rose: 'text-rose-700',
    indigo: 'text-indigo-700',
    violet: 'text-violet-700',
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{k}</div>
      <div className={`text-xl font-bold ${colors[tone] || 'text-slate-900'}`}>{v}</div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

export function KVRow({ k, v, tone, mono }: { k: string; v: React.ReactNode; tone?: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{k}</span>
      <span className={`text-right text-xs ${mono ? 'font-mono' : ''} ${tone ? bandText(tone) : 'text-slate-800'}`}>{v}</span>
    </div>
  );
}

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="text-sm font-medium text-slate-600">{message}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

// ---------- Section Card ----------
export function SectionCard({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

// ---------- Trend Arrow ----------
export function TrendArrow({ trend }: { trend: string }) {
  return <span className={`text-xs font-bold ${trendTone(trend)}`}>{trendArrow(trend)}</span>;
}

// ---------- Pill / Chip ----------
export function Chip({
  label,
  tone = 'slate',
  size = 'sm',
  onClick,
}: {
  label: React.ReactNode;
  tone?: string;
  size?: 'xs' | 'sm';
  onClick?: () => void;
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    violet: 'bg-violet-100 text-violet-800 border-violet-200',
    sky: 'bg-sky-100 text-sky-800 border-sky-200',
  };
  const sizes = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border ${tones[tone] || tones.slate} ${sizes} ${
        onClick ? 'hover:bg-opacity-80' : ''
      }`}
    >
      {label}
    </Tag>
  );
}

// ---------- Dimension Cell (compact bar in tables) ----------
export function DimCell({ value, band }: { value: number | null | undefined; band: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${bandBar(band)}`} style={{ width: `${value ?? 0}%` }} />
      </div>
      <div className={`w-9 text-right text-xs font-bold ${bandText(band)}`}>{value == null ? '—' : value}</div>
    </div>
  );
}

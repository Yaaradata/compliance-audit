'use client';

import React from 'react';
import { bandBar, bandBg, bandDot, bandText, trendArrow, trendTone } from './theme';

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
  if (!series.length) return <div className="h-[30px]" />;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stroke =
    ({ red: '#e11d48', amber: '#d97706', green: '#059669', neutral: '#64748b' } as Record<string, string>)[band] ||
    '#64748b';
  const fillColor =
    ({ red: '#fee2e2', amber: '#fef3c7', green: '#d1fae5', neutral: '#f1f5f9' } as Record<string, string>)[band] ||
    '#f1f5f9';
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * width;
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
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

const ENTITY_BADGE_CLASS: Record<string, string> = {
  risk: 'bg-rose-100 text-rose-800 border-rose-200',
  control: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  obligation: 'bg-purple-100 text-purple-800 border-purple-200',
  issue: 'bg-amber-100 text-amber-800 border-amber-200',
  evidence: 'bg-sky-100 text-sky-800 border-sky-200',
  smf: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  auditPack: 'bg-slate-100 text-slate-800 border-slate-200',
  aiInsight: 'bg-violet-100 text-violet-800 border-violet-200',
  process: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const ENTITY_LABEL: Record<string, string> = {
  risk: 'RISK',
  control: 'CONTROL',
  obligation: 'OBLIGATION',
  issue: 'ISSUE',
  evidence: 'EVIDENCE',
  smf: 'SMF',
  auditPack: 'AUDIT PACK',
  aiInsight: 'AI INSIGHT',
  process: 'PROCESS',
};

export function EntityTypeBadge({ type }: { type: string | null }) {
  const cls = ENTITY_BADGE_CLASS[type || ''] || 'bg-slate-100 text-slate-800 border-slate-200';
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider border ${cls}`}>
      {ENTITY_LABEL[type || ''] || type}
    </span>
  );
}

export type ThreeDimSignal = {
  operating: { current: number; band: string; trend: string; series: number[] };
  catch: { current: number; band: string; trend: string; series: number[] };
  evidence: { current: number; band: string; trend: string; series: number[] };
};

export function ThreeDimSignalBars({ threeDim }: { threeDim: ThreeDimSignal | null | undefined }) {
  if (!threeDim) return null;
  const td = threeDim;
  const dims = [
    { key: 'operating', label: 'Operating Rate', desc: 'Did the control fire when expected?', data: td.operating },
    { key: 'catch', label: 'Catch Rate', desc: 'Did it catch what it was designed to catch?', data: td.catch },
    { key: 'evidence', label: 'Evidence Completeness', desc: 'Is the evidence captured to standard?', data: td.evidence },
  ];
  return (
    <div className="space-y-3">
      {dims.map((d) => (
        <div key={d.key} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">{d.label}</div>
              <div className="text-xs text-slate-500">{d.desc}</div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${bandText(d.data.band)}`}>{d.data.current}</div>
              <div className={`text-xs ${trendTone(d.data.trend)}`}>
                {trendArrow(d.data.trend)} {d.data.trend.replace('_', ' ')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full ${bandBar(d.data.band)} transition-all`} style={{ width: `${d.data.current}%` }} />
            </div>
            <Sparkline series={d.data.series} band={d.data.band} width={100} height={26} fill />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Stat({ k, v, sub, tone = 'slate' }: { k: string; v: React.ReactNode; sub?: string; tone?: string }) {
  const colors: Record<string, string> = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    rose: 'text-rose-700',
  };
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{k}</div>
      <div className={`text-lg font-bold ${colors[tone] || 'text-slate-900'}`}>{v}</div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

export function KVRow({ k, v, tone }: { k: string; v: React.ReactNode; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{k}</span>
      <span className={`text-xs font-medium ${tone ? bandText(tone) : 'text-slate-800'}`}>{v}</span>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 text-center">
      <div className="mb-2 text-3xl">📭</div>
      <div className="text-sm text-slate-500">{message}</div>
    </div>
  );
}

export function DimCell({ dim }: { dim: { current: number; band: string } }) {
  return (
    <div className="col-span-2 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${bandBar(dim.band)}`} style={{ width: `${dim.current}%` }} />
      </div>
      <div className={`w-8 text-right text-xs font-bold ${bandText(dim.band)}`}>{dim.current}</div>
    </div>
  );
}

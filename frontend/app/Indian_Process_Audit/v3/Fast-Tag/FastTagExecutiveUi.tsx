'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { LIVE_TICKER_ITEMS, type ExecKpi, type ExecKpiTone } from './fastTagExecutiveData';

const ACCENT_TOP: Record<ExecKpi['accent'], string> = {
  blue: 'from-blue-500/80 to-transparent',
  green: 'from-emerald-500/80 to-transparent',
  red: 'from-red-500/80 to-transparent',
  amber: 'from-amber-500/80 to-transparent',
};

const BADGE_CLS: Record<ExecKpiTone, string> = {
  good: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  warn: 'bg-amber-50 text-amber-800 ring-amber-200/80',
  bad: 'bg-red-50 text-red-700 ring-red-200/80',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200/80',
};

const TREND_CLS: Record<ExecKpiTone, string> = {
  good: 'text-emerald-600',
  warn: 'text-amber-600',
  bad: 'text-red-600',
  neutral: 'text-slate-600',
};

const METRIC_CELL_BG: Record<ExecKpiTone, string> = {
  good: 'bg-emerald-50',
  warn: 'bg-amber-50',
  bad: 'bg-red-50',
  neutral: 'bg-slate-50/90',
};

const METRIC_CELL_RING: Record<ExecKpiTone, string> = {
  good: 'ring-emerald-100',
  warn: 'ring-amber-100',
  bad: 'ring-red-100',
  neutral: 'ring-slate-100',
};

const METRIC_VALUE_CLS: Record<ExecKpiTone, string> = {
  good: 'text-emerald-900',
  warn: 'text-amber-900',
  bad: 'text-red-900',
  neutral: 'text-slate-900',
};

export type ExecCardMetric = {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: ExecKpiTone;
  /** Column background; defaults to deltaTone or neutral */
  tone?: ExecKpiTone;
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = useMemo(() => data.map((v, i) => ({ i, v })), [data]);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = Math.max(0.01, (max - min) * 0.12);
  const gradId = `exec-spark-${color.replace('#', '')}`;

  return (
    <div className="mt-2 h-7 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height={28} minWidth={1}>
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Executive persona chip — avatar, name, and role only. */
export function ExecPersonaBanner({ persona, personaRole }: { persona: string; personaRole: string }) {
  const initials = persona
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-3 py-2.5 text-white shadow-sm ring-1 ring-slate-700/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold">
        {initials}
      </div>
      <div className="min-w-0 pr-1">
        <div className="text-sm font-semibold leading-tight">{persona}</div>
        <div className="text-[11px] leading-snug text-slate-400">{personaRole}</div>
      </div>
    </div>
  );
}

export function ExecKpiStrip({ kpis }: { kpis: ExecKpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md hover:ring-slate-300"
        >
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${ACCENT_TOP[k.accent]}`}
          />
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {k.label}
            </span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${BADGE_CLS[k.tone]}`}
            >
              {k.badge}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
            {k.value}
          </div>
          <p className={`mt-1 text-xs font-medium ${TREND_CLS[k.tone]}`}>
            {k.trend}
            {k.sub ? <span className="font-normal text-slate-500"> {k.sub}</span> : null}
          </p>
          <Sparkline data={k.spark} color={k.sparkColor} />
        </div>
      ))}
    </div>
  );
}

export function ExecCard({
  title,
  subtitle,
  tag,
  tagTone = 'neutral',
  icon,
  iconClassName,
  className = '',
  children,
  metrics,
}: {
  title: string;
  subtitle?: string;
  tag?: string;
  tagTone?: 'good' | 'warn' | 'bad' | 'neutral';
  icon: React.ReactNode;
  iconClassName?: string;
  className?: string;
  children: React.ReactNode;
  metrics?: ExecCardMetric[];
}) {
  const tagCls =
    tagTone === 'good'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
      : tagTone === 'bad'
        ? 'bg-red-50 text-red-700 ring-red-200/80'
        : tagTone === 'warn'
          ? 'bg-amber-50 text-amber-800 ring-amber-200/80'
          : 'bg-slate-100 text-slate-600 ring-slate-200/80';

  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName ?? 'bg-slate-100 text-slate-700'}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-slate-900">{title}</h4>
            {subtitle ? <p className="truncate text-[11px] text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {tag ? (
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${tagCls}`}>
            {tag}
          </span>
        ) : null}
      </div>
      {metrics && metrics.length > 0 ? (
        <div className="grid grid-cols-3 gap-px border-b border-slate-100 bg-slate-100">
          {metrics.map((m) => {
            const cellTone = m.tone ?? m.deltaTone ?? 'neutral';
            return (
              <div
                key={m.label}
                className={`flex min-h-[72px] flex-col items-center justify-center px-2 py-3 text-center ring-1 ring-inset ${METRIC_CELL_BG[cellTone]} ${METRIC_CELL_RING[cellTone]}`}
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  {m.label}
                </div>
                <div
                  className={`mt-1 text-lg font-bold leading-tight tabular-nums sm:text-xl ${METRIC_VALUE_CLS[cellTone]}`}
                >
                  {m.value}
                </div>
                {m.delta ? (
                  <div
                    className={`mt-1 max-w-full truncate text-[10px] font-semibold leading-snug ${TREND_CLS[m.deltaTone ?? cellTone]}`}
                  >
                    {m.delta}
                  </div>
                ) : (
                  <div className="mt-1 h-[14px]" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

const TICKER_DOT = { good: 'bg-emerald-500', warn: 'bg-amber-500', bad: 'bg-red-500' } as const;

export type LiveTickerItem = { label: string; value: string; tone: 'good' | 'warn' | 'bad' };

export function LiveTicker({ items = LIVE_TICKER_ITEMS }: { items?: LiveTickerItem[] }) {
  const doubled = [...items, ...items];

  return (
    <div className="fasttag-exec-ticker flex overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-700">
      <div className="flex shrink-0 items-center border-r border-slate-700 bg-blue-600/20 px-3 text-[9px] font-bold uppercase tracking-widest text-blue-300">
        Live
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden py-1.5">
        <div className="fasttag-exec-ticker-track flex w-max gap-0">
          {doubled.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="inline-flex items-center gap-2 border-r border-slate-700/80 px-5 font-mono text-[10px] text-slate-300"
            >
              <span className={`h-1 w-1 rounded-full ${TICKER_DOT[item.tone]}`} />
              {item.label}
              <span className="font-semibold text-white">{item.value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ExecTimeGrain, NewCustomerPeriodPoint, TollPeriodPoint } from './fastTagHobTimeSeries';
import type { IssuanceSegmentKey } from './fastTagExecutiveTypes';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    fontSize: 12,
    padding: '8px 12px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
  },
  labelStyle: { fontWeight: 600, color: '#0f172a', marginBottom: 4 },
  itemStyle: { fontSize: 11, padding: 0 },
};

const GRID_STROKE = '#e2e8f0';
const TICK = { fontSize: 11, fill: '#64748b' };

function niceMax(value: number, pad = 0.12): number {
  if (value <= 0) return 10;
  const v = value * (1 + pad);
  const mag = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / mag) * mag;
}

function niceMinMax(values: number[], floor = 0, pad = 0.15): [number, number] {
  const min = Math.min(...values, floor);
  const max = Math.max(...values, 1);
  const span = max - min || 1;
  return [Math.max(floor, min - span * pad), max + span * pad];
}

/** Recharts needs a sized parent; defers render until mount to avoid 0×0. */
export function ExecChartFrame({
  height = 232,
  empty,
  emptyMessage = 'No data for this selection',
  className = '',
  children,
}: {
  height?: number;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <div
      className={`relative w-full min-w-0 shrink-0 px-3 pb-3 pt-1 ${className}`}
      style={{ height }}
    >
      {!ready ? (
        <div className="absolute inset-3 animate-pulse rounded-lg bg-slate-100/90" aria-hidden />
      ) : empty ? (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 text-center text-xs text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function ExecAnalyticsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch [&>*]:min-h-0">
      {children}
    </div>
  );
}

export function ExecStackColumn({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`flex h-full min-h-0 flex-col gap-6 ${className}`.trim()}>{children}</div>;
}

type StackBarRow = {
  day?: string;
  label?: string;
  rechargeFail: number;
  balMismatch: number;
  refundDelay: number;
};

export function ExecFindingSurgeChart({
  data,
  onPeriodClick,
}: {
  data: StackBarRow[];
  onPeriodClick?: (row: StackBarRow) => void;
}) {
  const xKey = data[0]?.label != null ? 'label' : 'day';
  const empty = data.every((d) => d.rechargeFail + d.balMismatch + d.refundDelay === 0);
  const yMax = useMemo(() => {
    const tops = data.map((d) => d.rechargeFail + d.balMismatch + d.refundDelay);
    return niceMax(Math.max(...tops, 1));
  }, [data]);

  return (
    <ExecChartFrame empty={empty} emptyMessage="No findings in this region">
      <ResponsiveContainer width="100%" height="100%" debounce={32}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
          barCategoryGap="18%"
          onClick={(state) => {
            const payload = (
              state as { activePayload?: Array<{ payload?: StackBarRow }> } | undefined
            )?.activePayload?.[0]?.payload;
            if (payload && onPeriodClick) onPeriodClick(payload);
          }}
          style={onPeriodClick ? { cursor: 'pointer' } : undefined}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey={xKey} tick={TICK} axisLine={false} tickLine={false} dy={4} />
          <YAxis tick={TICK} axisLine={false} tickLine={false} width={36} domain={[0, yMax]} allowDecimals={false} />
          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="rechargeFail" name="Wallet / recharge" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} maxBarSize={48} />
          <Bar dataKey="balMismatch" name="Settlement" stackId="a" fill="#f59e0b" maxBarSize={48} />
          <Bar dataKey="refundDelay" name="KYC / identity" stackId="a" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ExecChartFrame>
  );
}

type DualRow = {
  day?: string;
  label?: string;
  resolutionMin: number;
  experienceIndex: number;
};

export function ExecExperienceDualChart({
  data,
  onPeriodClick,
  resolutionBaseline = 26,
}: {
  data: DualRow[];
  onPeriodClick?: (row: DualRow) => void;
  resolutionBaseline?: number;
}) {
  const xKey = data[0]?.label != null ? 'label' : 'day';
  const empty = data.length === 0;
  const [leftMin, leftMax] = useMemo(
    () => niceMinMax(data.map((d) => d.resolutionMin), 0, 0.2),
    [data],
  );
  const [rightMin, rightMax] = useMemo(
    () => niceMinMax(data.map((d) => d.experienceIndex), 0, 0.08),
    [data],
  );

  return (
    <ExecChartFrame empty={empty}>
      <ResponsiveContainer width="100%" height="100%" debounce={32}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 4 }}
          onClick={(state) => {
            const payload = (
              state as { activePayload?: Array<{ payload?: DualRow }> } | undefined
            )?.activePayload?.[0]?.payload;
            if (payload && onPeriodClick) onPeriodClick(payload);
          }}
          style={onPeriodClick ? { cursor: 'pointer' } : undefined}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey={xKey} tick={TICK} axisLine={false} tickLine={false} dy={4} />
          <ReferenceLine
            yAxisId="left"
            y={resolutionBaseline}
            stroke="#059669"
            strokeDasharray="4 4"
            label={{ value: `${resolutionBaseline}m target`, position: 'insideTopLeft', fontSize: 10, fill: '#059669' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ ...TICK, fill: '#d97706' }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[Math.floor(leftMin), Math.ceil(leftMax)]}
            tickFormatter={(v) => `${v}m`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ ...TICK, fill: '#dc2626' }}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[Math.floor(rightMin), Math.ceil(rightMax)]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              const n = String(name ?? '');
              return [n.includes('Resolution') ? `${v} min` : `${v}%`, n];
            }}
          />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} iconSize={8} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="resolutionMin"
            name="Avg Fix Time"
            stroke="#d97706"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="experienceIndex"
            name="Customer Experience Score"
            stroke="#dc2626"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ExecChartFrame>
  );
}

type TrendRow = { label: string; actual: number; target?: number };

export function ExecTrendLineChart({
  data,
  actualName = 'Actual',
  targetName = 'Target',
  valueFormatter = (v: number) => String(v),
  showTarget = true,
}: {
  data: TrendRow[];
  actualName?: string;
  targetName?: string;
  valueFormatter?: (v: number) => string;
  showTarget?: boolean;
}) {
  const empty = data.length === 0 || data.every((d) => d.actual === 0);
  const [yMin, yMax] = useMemo(() => {
    const vals = data.flatMap((d) => (showTarget && d.target != null ? [d.actual, d.target] : [d.actual]));
    return niceMinMax(vals, 0, 0.1);
  }, [data, showTarget]);

  return (
    <ExecChartFrame empty={empty} height={232}>
      <ResponsiveContainer width="100%" height="100%" debounce={32}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} dy={4} />
          <YAxis
            tick={TICK}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[yMin, yMax]}
            tickFormatter={(v) => valueFormatter(Number(v))}
          />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [valueFormatter(Number(v ?? 0)), '']} />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} iconSize={8} />
          <Line
            type="monotone"
            dataKey="actual"
            name={actualName}
            stroke="#059669"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
          {showTarget ? (
            <Line
              type="monotone"
              dataKey="target"
              name={targetName}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </ExecChartFrame>
  );
}

type SegmentSlice = {
  key: IssuanceSegmentKey;
  name: string;
  value: number;
  color: string;
  sharePct: number;
};

export function ExecSegmentMixChart({
  segments,
  totalCases,
  onSegmentClick,
}: {
  segments: SegmentSlice[];
  totalCases: number;
  onSegmentClick?: (segment: IssuanceSegmentKey) => void;
}) {
  const nonZero = segments.filter((s) => s.value > 0);
  const empty = totalCases === 0 || nonZero.length === 0;

  return (
    <div className="flex min-h-[300px] flex-1 flex-col gap-4 px-4 py-3 sm:flex-row sm:items-stretch">
      <div className="relative mx-auto h-[272px] w-[272px] max-w-full shrink-0 sm:h-[288px] sm:w-[288px]">
        <ExecChartFrame height={288} empty={empty} className="!p-0 !pb-0 !pt-0 !px-0">
          <ResponsiveContainer width="100%" height="100%" debounce={32}>
            <PieChart>
              <Pie
                data={nonZero}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
                style={onSegmentClick ? { cursor: 'pointer' } : undefined}
                onClick={(_, index) => {
                  const slice = nonZero[index];
                  if (slice?.key && onSegmentClick) onSegmentClick(slice.key);
                }}
              >
                {nonZero.map((s) => (
                  <Cell key={s.name} fill={s.color} style={onSegmentClick ? { cursor: 'pointer' } : undefined} />
                ))}
              </Pie>
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(v, name) => {
                  const n = String(name ?? '');
                  const pct = nonZero.find((s) => s.name === n)?.sharePct ?? 0;
                  return [`${Number(v ?? 0)} cases (${pct}%)`, n];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ExecChartFrame>
        {!empty ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-slate-900">{totalCases}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">cases</span>
          </div>
        ) : null}
      </div>
      <ul className="flex min-w-0 flex-1 flex-col justify-center divide-y divide-slate-100 sm:py-1">
        {segments.map((s) => (
          <li
            key={s.name}
            className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3.5 first:pt-2 last:pb-2 ${
              onSegmentClick ? 'cursor-pointer rounded-lg transition-colors hover:bg-slate-50' : ''
            }`}
            onClick={() => onSegmentClick?.(s.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSegmentClick?.(s.key);
              }
            }}
            role={onSegmentClick ? 'button' : undefined}
            tabIndex={onSegmentClick ? 0 : undefined}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="truncate text-sm font-medium text-slate-700">{s.name}</span>
            </div>
            <span className="text-right text-sm font-bold tabular-nums text-slate-900">{s.sharePct}%</span>
            <div className="col-span-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.sharePct}%`, backgroundColor: s.color }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const GRAIN_OPTIONS: { id: ExecTimeGrain; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
];

export function ExecTimeGrainToggle({
  grain,
  onChange,
}: {
  grain: ExecTimeGrain;
  onChange: (g: ExecTimeGrain) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">View</span>
      {GRAIN_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            grain === opt.id
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ExecTollDebitBarChart({
  data,
}: {
  data: TollPeriodPoint[];
}) {
  const empty = data.length === 0;
  const yMax = useMemo(() => niceMax(Math.max(...data.map((d) => Math.max(d.actual, d.target)), 0.01)), [data]);

  return (
    <ExecChartFrame empty={empty} height={248}>
      <ResponsiveContainer width="100%" height="100%" debounce={32}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} dy={4} />
          <YAxis
            tick={TICK}
            axisLine={false}
            tickLine={false}
            width={48}
            domain={[0, yMax]}
            tickFormatter={(v) => `₹${v}Cr`}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(v, name) => {
              const key = String(name ?? '');
              if (key === 'actual') return [`₹${Number(v ?? 0)}Cr`, 'Settlement'];
              if (key === 'target') return [`₹${Number(v ?? 0)}Cr`, 'Plan'];
              return [v, name];
            }}
          />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 4 }} iconSize={8} />
          <Bar dataKey="actual" name="Settlement" radius={[6, 6, 0, 0]} maxBarSize={42}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="target"
            name="Plan"
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3, fill: '#64748b', stroke: '#fff', strokeWidth: 1 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ExecChartFrame>
  );
}

function fmtCustomers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('en-IN');
}

export function ExecNewCustomerChart({ data }: { data: NewCustomerPeriodPoint[] }) {
  const empty = data.length === 0;
  const yMax = useMemo(
    () => niceMax(Math.max(...data.map((d) => Math.max(d.newCount, d.target, d.activated)), 1)),
    [data],
  );
  const [pctMin, pctMax] = useMemo(
    () => niceMinMax(data.map((d) => d.activationPct), 80),
    [data],
  );

  return (
    <ExecChartFrame empty={empty} height={248}>
      <ResponsiveContainer width="100%" height="100%" debounce={32}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="newCustArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} dy={4} />
          <YAxis
            yAxisId="count"
            tick={TICK}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[0, yMax]}
            tickFormatter={(v) => fmtCustomers(Number(v))}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            tick={TICK}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[pctMin, pctMax]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(v, name, item) => {
              const key = String(name ?? '');
              const p = item?.payload as NewCustomerPeriodPoint | undefined;
              if (key === 'newCount') return [fmtCustomers(Number(v ?? 0)), 'New customers'];
              if (key === 'activated') return [fmtCustomers(Number(v ?? 0)), 'Activated'];
              if (key === 'activationPct') return [`${Number(v ?? 0)}%`, 'Activation rate'];
              if (key === 'target') return [fmtCustomers(Number(v ?? 0)), 'Plan'];
              return [v, name];
            }}
            labelFormatter={(label, payload) => {
              const p = payload?.[0]?.payload as NewCustomerPeriodPoint | undefined;
              return p ? `${label} · ${p.digitalSharePct}% digital` : String(label);
            }}
          />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 4 }} iconSize={8} />
          <Area
            yAxisId="count"
            type="monotone"
            dataKey="newCount"
            name="New customers"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#newCustArea)"
            dot={{ r: 3, fill: '#7c3aed', stroke: '#fff', strokeWidth: 1 }}
          />
          <Bar
            yAxisId="count"
            dataKey="activated"
            name="Activated"
            fill="#059669"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            barSize={14}
          />
          <Line
            yAxisId="count"
            type="monotone"
            dataKey="target"
            name="Plan"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="activationPct"
            name="Activation rate"
            stroke="#d97706"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#d97706', stroke: '#fff', strokeWidth: 1 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ExecChartFrame>
  );
}

const HEAT_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const HEAT_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

function heatClass(intensity: number) {
  if (intensity >= 0.75) return 'bg-red-500';
  if (intensity >= 0.55) return 'bg-orange-400';
  if (intensity >= 0.38) return 'bg-amber-400';
  if (intensity >= 0.22) return 'bg-sky-400';
  return 'bg-slate-200';
}

export function ExecComplaintHeatmap({
  cells,
  peakLabel,
}: {
  cells: { day: string; hour: number; intensity: number }[];
  peakLabel?: string;
}) {
  const max = useMemo(() => Math.max(...cells.map((c) => c.intensity), 0.01), [cells]);
  const empty = cells.every((c) => c.intensity <= 0);

  return (
    <div className="flex min-h-[240px] flex-col justify-center px-4 py-4">
      {peakLabel ? (
        <p className="mb-3 text-[11px] font-medium text-slate-500">{peakLabel}</p>
      ) : null}
      {empty ? (
        <p className="text-center text-xs text-slate-500">No finding density for this filter</p>
      ) : (
        <>
          <div className="mb-1.5 grid grid-cols-[28px_repeat(12,1fr)] gap-1">
            <div />
            {HEAT_HOURS.map((h) => (
              <div key={h} className="text-center font-mono text-[9px] text-slate-400">
                {h}
              </div>
            ))}
          </div>
          {HEAT_DAYS.map((day) => (
            <div key={day} className="mb-1 grid grid-cols-[28px_repeat(12,1fr)] gap-1">
              <span className="flex items-center font-mono text-[10px] text-slate-500">{day}</span>
              {HEAT_HOURS.map((hour) => {
                const cell = cells.find((c) => c.day === day && c.hour === hour);
                const intensity = (cell?.intensity ?? 0) / max;
                return (
                  <div
                    key={`${day}-${hour}`}
                    title={`${day} ${String(hour).padStart(2, '0')}:00 — ${Math.round(intensity * 100)}% of peak`}
                    className={`aspect-[4/3] min-h-[18px] rounded-sm ring-1 ring-white/50 transition-transform hover:scale-110 ${heatClass(intensity)}`}
                  />
                );
              })}
            </div>
          ))}
          <div className="mt-3 flex items-center justify-end gap-2">
            <span className="text-[9px] text-slate-500">Low</span>
            <div className="flex gap-0.5">
              {['bg-slate-200', 'bg-sky-400', 'bg-amber-400', 'bg-orange-400', 'bg-red-500'].map((c) => (
                <div key={c} className={`h-2 w-4 rounded-sm ${c}`} />
              ))}
            </div>
            <span className="text-[9px] text-slate-500">High</span>
          </div>
        </>
      )}
    </div>
  );
}

export type FunnelRow = {
  step: string;
  stageId: string;
  count: number;
  pct: number;
  drop: string;
  highlight: boolean;
};

export function ExecIssuanceFunnel({
  rows,
  onStageClick,
}: {
  rows: FunnelRow[];
  onStageClick: (stageId: string) => void;
}) {
  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="space-y-2.5 px-4 py-4">
      {rows.map((row) => (
        <button
          key={row.stageId}
          type="button"
          onClick={() => onStageClick(row.stageId)}
          className="group grid w-full grid-cols-[minmax(72px,88px)_1fr_44px_40px] items-center gap-2 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-slate-50"
        >
          <span
            className={`truncate text-[11px] leading-tight ${row.highlight ? 'font-bold text-red-600' : 'font-medium text-slate-600'}`}
          >
            {row.highlight ? '▶ ' : ''}
            {row.step}
          </span>
          <div className="relative h-7 overflow-hidden rounded-md bg-slate-100">
            <div
              className={`flex h-full min-w-[2rem] items-center rounded-md px-2 text-[10px] font-semibold text-white transition-all duration-500 ${
                row.highlight ? 'bg-red-500' : row.pct >= 70 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(8, (row.count / maxCount) * 100)}%` }}
            >
              <span className="truncate tabular-nums">{row.count.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <span className="text-right font-mono text-[10px] tabular-nums text-slate-600">{row.pct}%</span>
          <span className={`text-right text-[9px] font-semibold tabular-nums ${row.drop ? 'text-red-600' : 'text-transparent'}`}>
            {row.drop || '—'}
          </span>
        </button>
      ))}
    </div>
  );
}

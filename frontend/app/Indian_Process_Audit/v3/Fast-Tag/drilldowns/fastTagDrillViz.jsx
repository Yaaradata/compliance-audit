'use client';

import { useId, useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const TIP = {
  contentStyle: { fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' },
  itemStyle: { fontSize: 11, color: '#475569' },
};

/** Bordered viz container — matches pf-cash-viz / pf-pnl-unit */
export function DrillVizFrame({ prefix, label, children, className = '' }) {
  return (
    <div className={`${prefix}-viz-frame ${className}`.trim()}>
      {label ? <div className={`${prefix}-label ${prefix}-viz-frame-label`}>{label}</div> : null}
      {children}
    </div>
  );
}

/** Single metric row + track bar (pf-pnl-bar-row pattern) */
export function DrillMetricBar({
  prefix,
  label,
  display,
  delta,
  deltaUp = true,
  pct,
  color,
  sub,
  trackHeight = 10,
}) {
  const deltaClass = deltaUp === false ? `${prefix}-down` : `${prefix}-up`;
  return (
    <div className={`${prefix}-metric-bar-row`}>
      <div className={`${prefix}-row`} style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 11, lineHeight: 1.35 }}>{label}</span>
        <span style={{ fontSize: 11 }}>
          {display ? (
            <span style={{ fontWeight: 700, color: color ?? 'inherit' }}>{display}</span>
          ) : null}
          {delta ? (
            <span className={deltaClass} style={{ marginLeft: display ? 6 : 0, fontSize: 10 }}>
              {delta}
            </span>
          ) : null}
        </span>
      </div>
      <div className={`${prefix}-track ${prefix}-viz-track`} style={{ height: trackHeight }}>
        <div className={`${prefix}-fill`} style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
      {sub ? <div className={`${prefix}-faint ${prefix}-viz-metric-sub`}>{sub}</div> : null}
    </div>
  );
}

/** Horizontal funnel lanes (performance exec-funnel style) */
export function DrillFunnelLanes({ prefix, stages, fmt, dropAfterIndex = 2 }) {
  const maxV = Math.max(...stages.map((s) => s.v), 1);
  return (
    <div className={`${prefix}-viz-funnel-lanes`}>
      {stages.map((f, i) => {
        const highlight = i === dropAfterIndex;
        const drop = i > 0 ? stages[i - 1].pct - f.pct : 0;
        const widthPct = Math.max(12, (f.v / maxV) * 100);
        const barTone = highlight ? 'is-drop' : f.pct >= 70 ? 'is-strong' : 'is-mid';
        return (
          <div key={f.stage} className={`${prefix}-viz-funnel-row`}>
            <span className={`${prefix}-viz-funnel-step${highlight ? ` ${prefix}-viz-funnel-step--drop` : ''}`}>
              {highlight ? '▶ ' : ''}
              {f.stage}
            </span>
            <div className={`${prefix}-viz-funnel-bar-wrap`}>
              <div
                className={`${prefix}-viz-funnel-bar ${prefix}-viz-funnel-bar--${barTone}`}
                style={{ width: `${widthPct}%` }}
              >
                <span>{fmt(f.v)}</span>
              </div>
            </div>
            <span className={`${prefix}-viz-funnel-pct`}>{f.pct}%</span>
            <span className={`${prefix}-viz-funnel-drop${drop > 0 ? ` ${prefix}-viz-funnel-drop--show` : ''}`}>
              {drop > 0 ? `−${drop}` : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Donut + legend (pf-ai-flow-donut pattern) */
export function DrillDonutMix({ prefix, slices, centerMain, centerSub = 'mix' }) {
  const uid = useId().replace(/:/g, '');
  const data = slices.map((s) => ({
    name: s.name,
    value: s.value,
    color: s.color,
    growth: s.growth,
  }));

  return (
    <div className={`${prefix}-viz-donut-mix`}>
      <div className={`${prefix}-viz-donut-ring`}>
        <ResponsiveContainer width="100%" height={168}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="78%"
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              {...TIP}
              formatter={(v, name, item) => {
                const row = item?.payload ?? item;
                const growth = row?.growth ?? '';
                return [`${v}%${growth ? ` · ${growth}` : ''}`, String(name ?? '')];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={`${prefix}-viz-donut-hole`}>
          <span className={`${prefix}-viz-donut-hole-val`}>{centerMain}</span>
          <span className={`${prefix}-faint`}>{centerSub}</span>
        </div>
      </div>
      <ul className={`${prefix}-viz-legend`}>
        {data.map((s) => (
          <li key={s.name} className={`${prefix}-viz-legend-item`}>
            <span className={`${prefix}-viz-swatch`} style={{ background: s.color }} aria-hidden />
            <span className={`${prefix}-viz-legend-name`}>{s.name}</span>
            <span className={`${prefix}-viz-legend-val`}>{s.value}%</span>
            {s.growth ? <span className={`${prefix}-up ${prefix}-viz-legend-growth`}>{s.growth}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Driver decomposition — horizontal bars in viz frame */
export function DrillDriverBars({ prefix, drivers, totalLabel }) {
  const max = Math.max(...drivers.map((d) => d.val), 1);
  return (
    <DrillVizFrame prefix={prefix} label="YoY volume contribution · % points">
      {drivers.map((d) => (
        <DrillMetricBar
          key={d.name}
          prefix={prefix}
          label={d.name}
          display={`+${d.val}%`}
          pct={(d.val / max) * 100}
          color={d.color}
          sub={d.note}
        />
      ))}
      {totalLabel ? (
        <div className={`${prefix}-faint ${prefix}-viz-foot`}>{totalLabel}</div>
      ) : null}
    </DrillVizFrame>
  );
}

function growthDriverShortName(name) {
  if (/new tag/i.test(name)) return 'New tags';
  if (/annual pass/i.test(name)) return 'Annual Pass';
  if (/usage depth/i.test(name)) return 'Usage depth';
  if (/dormant/i.test(name)) return 'Dormant recovery';
  if (/non-toll/i.test(name)) return 'Non-toll';
  return name;
}

/** YoY volume lift by driver — donut pie + legend */
export function DrillDriverVolumePie({ prefix, drivers }) {
  const total = useMemo(() => drivers.reduce((s, d) => s + d.val, 0), [drivers]);
  const data = useMemo(
    () =>
      [...drivers]
        .sort((a, b) => b.val - a.val)
        .map((d) => ({
          name: growthDriverShortName(d.name),
          value: d.val,
          color: d.color,
          sharePct: total > 0 ? Math.round((d.val / total) * 100) : 0,
          metricValue: d.metricValue ?? '—',
          metricYoy: d.metricYoy ?? '—',
          mom: d.mom ?? '',
        })),
    [drivers, total],
  );

  return (
    <div
      className={`${prefix}-viz-driver-pie`}
      role="img"
      aria-label={`YoY volume lift +${total.toFixed(1)} percent by driver`}
    >
      <div className={`${prefix}-viz-driver-pie-chart`}>
        <div className={`${prefix}-viz-donut-ring ${prefix}-viz-driver-pie-ring`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="86%"
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                {...TIP}
                formatter={(v, name, item) => {
                  const row = item?.payload ?? {};
                  const extra = row.metricValue ? ` · ${row.metricValue}` : '';
                  return [`+${v}% pts · ${row.sharePct ?? 0}% of lift${extra}`, String(name ?? '')];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className={`${prefix}-viz-donut-hole`}>
            <span className={`${prefix}-viz-donut-hole-val`}>+{total.toFixed(1)}%</span>
            <span className={`${prefix}-faint`}>YoY volume lift</span>
          </div>
        </div>
      </div>
      <div className={`${prefix}-viz-driver-pie-table-wrap`}>
        <table className={`${prefix}-viz-driver-pie-table`}>
          <thead>
            <tr>
              <th className={`${prefix}-viz-driver-pie-th-dot`} aria-hidden />
              <th className={`${prefix}-viz-driver-pie-th`}>Driver</th>
              <th className={`${prefix}-viz-driver-pie-th ${prefix}-viz-driver-pie-th-num`}>Current</th>
              <th className={`${prefix}-viz-driver-pie-th ${prefix}-viz-driver-pie-th-num`}>YoY</th>
              <th className={`${prefix}-viz-driver-pie-th ${prefix}-viz-driver-pie-th-num`}>Lift</th>
              <th className={`${prefix}-viz-driver-pie-th ${prefix}-viz-driver-pie-th-num`}>Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.name}>
                <td className={`${prefix}-viz-driver-pie-td-dot`}>
                  <span className={`${prefix}-viz-swatch`} style={{ background: s.color }} aria-hidden />
                </td>
                <td className={`${prefix}-viz-driver-pie-td-name`}>{s.name}</td>
                <td className={`${prefix}-viz-driver-pie-td-num`}>{s.metricValue}</td>
                <td className={`${prefix}-viz-driver-pie-td-num ${prefix}-viz-driver-pie-td-yoy`}>
                  {s.metricYoy}
                  {s.mom ? <span className={`${prefix}-faint ${prefix}-viz-legend-mom`}> · {s.mom}</span> : null}
                </td>
                <td className={`${prefix}-viz-driver-pie-td-num ${prefix}-viz-driver-pie-td-lift`}>+{s.value}%</td>
                <td className={`${prefix}-viz-driver-pie-td-num ${prefix}-faint`}>{s.sharePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Simple stacked bar — share of +20% YoY lift by driver */
export function DrillDriverStackBar({ prefix, drivers }) {
  const total = drivers.reduce((s, d) => s + d.val, 0);
  return (
    <div className={`${prefix}-viz-stack`}>
      <div
        className={`${prefix}-viz-stack-bar`}
        role="img"
        aria-label={`YoY volume lift +${total.toFixed(0)} percent by driver`}
      >
        {drivers.map((d) => {
          const isPass = /annual pass/i.test(d.name);
          const share = total > 0 ? (d.val / total) * 100 : 0;
          return (
            <div
              key={d.name}
              className={`${prefix}-viz-stack-seg${isPass ? ` ${prefix}-viz-stack-seg--pass` : ''}`}
              style={{ flex: d.val, background: d.color }}
              title={`${d.name}: +${d.val}% (${share.toFixed(0)}% of stack)`}
            >
              {share >= 10 ? <span className={`${prefix}-viz-stack-seg-label`}>+{d.val}%</span> : null}
            </div>
          );
        })}
      </div>
      <div className={`${prefix}-viz-stack-foot`}>
        <span className={`${prefix}-faint`}>Indexed YoY lift</span>
        <span className={`${prefix}-viz-stack-total`}>+{total.toFixed(0)}%</span>
      </div>
      <ul className={`${prefix}-viz-stack-legend`}>
        {drivers.map((d) => (
          <li key={d.name}>
            <span className={`${prefix}-viz-swatch`} style={{ background: d.color }} aria-hidden />
            <span className={`${prefix}-viz-legend-name`}>{d.name}</span>
            <span className={`${prefix}-viz-legend-val`}>+{d.val}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Onboarding stages as a detail table (Performance contrib-table pattern) */
export function DrillStageGrowthTable({ prefix, stages, badge }) {
  const growthClass = (g) => {
    const s = String(g ?? '');
    if (/^−|▼/.test(s)) return `${prefix}-viz-stage-tbl-delta--drop`;
    if (/^\+|↑/.test(s)) return `${prefix}-viz-stage-tbl-delta--up`;
    return '';
  };

  return (
    <div className={`${prefix}-viz-stage-table-wrap`}>
      {badge ? (
        <div className={`${prefix}-viz-stage-table-toolbar`}>
          <span className={`${prefix}-badge ${prefix}-viz-stage-badge`}>{badge}</span>
        </div>
      ) : null}
      <table className={`${prefix}-viz-stage-table`}>
        <thead>
          <tr>
            <th className={`${prefix}-th`}>#</th>
            <th className={`${prefix}-th`}>Stage</th>
            <th className={`${prefix}-th`}>What happens</th>
            <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Monthly cohort</th>
            <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Conversion</th>
            <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Step change</th>
            <th className={`${prefix}-th`}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((s, i) => {
            const cohort = s.cohort ?? s.display ?? '—';
            const conv = s.conv ?? (String(s.display ?? '').includes('%') ? s.display : '—');
            return (
              <tr
                key={s.stage}
                className={s.isBottleneck ? `${prefix}-viz-stage-tbl-row--bottleneck` : undefined}
              >
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>{i + 1}</td>
                <td className={`${prefix}-td`}>
                  <span className={`${prefix}-viz-stage-tbl-stage-cell`}>
                    <span className={`${prefix}-viz-swatch`} style={{ background: s.color }} aria-hidden />
                    <span className={`${prefix}-viz-stage-tbl-stage-name`}>{s.stage}</span>
                  </span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-detail`}>{s.desc ?? '—'}</td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>{cohort}</td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`} style={{ color: s.color, fontWeight: 600 }}>
                  {conv}
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>
                  <span className={`${prefix}-viz-stage-tbl-delta ${growthClass(s.growth)}`}>{s.growth ?? '—'}</span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-note`}>
                  {s.isBottleneck ? (
                    <span className={`${prefix}-badge ${prefix}-viz-stage-tbl-flag`}>Leak</span>
                  ) : null}
                  {s.note ? <span className={`${prefix}-faint`}>{s.note}</span> : !s.isBottleneck ? '—' : null}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className={`${prefix}-viz-stage-tbl-total`}>
            <td className={`${prefix}-td`} colSpan={3}>
              <strong>End-to-end</strong>
              <span className={`${prefix}-faint`}> · eligibility → activation</span>
            </td>
            <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>
              {stages[stages.length - 1]?.cohort ?? '—'}
            </td>
            <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>
              <strong>{stages[stages.length - 1]?.conv ?? '—'}</strong>
            </td>
            <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>
              <span className={`${prefix}-viz-stage-tbl-delta ${prefix}-viz-stage-tbl-delta--up`}>↑4 pts E2E</span>
            </td>
            <td className={`${prefix}-td ${prefix}-faint`}>CAC ₹142 / active (↓7%)</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function parsePct(s) {
  const n = parseFloat(String(s ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Issuance channels — growth table */
export function DrillChannelGrowthPanel({ prefix, channels }) {
  const sorted = [...channels].sort((a, b) => parsePct(b.yoy) - parsePct(a.yoy));
  const deltaClass = (v) => {
    const s = String(v ?? '');
    if (/^−/.test(s)) return `${prefix}-viz-stage-tbl-delta--drop`;
    if (/^\+|↑/.test(s)) return `${prefix}-viz-stage-tbl-delta--up`;
    return '';
  };

  return (
    <div className={`${prefix}-viz-channel-growth`}>
      <div className={`${prefix}-viz-stage-table-wrap`}>
        <table className={`${prefix}-viz-stage-table ${prefix}-viz-channel-table`}>
          <thead>
            <tr>
              <th className={`${prefix}-th ${prefix}-viz-channel-th-channel`}>Channel</th>
              <th className={`${prefix}-th ${prefix}-viz-channel-th-center`}>Tags / mo</th>
              <th className={`${prefix}-th ${prefix}-viz-channel-th-center`}>Share</th>
              <th className={`${prefix}-th ${prefix}-viz-channel-th-center`}>MoM</th>
              <th className={`${prefix}-th ${prefix}-viz-channel-th-center`}>YoY</th>
              <th className={`${prefix}-th ${prefix}-viz-channel-th-center`}>Δ share</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.ch} className={c.isFast ? `${prefix}-viz-channel-row--fast` : undefined}>
                <td className={`${prefix}-td ${prefix}-viz-channel-td-channel`}>
                  <span className={`${prefix}-viz-stage-tbl-stage-cell`}>
                    <span className={`${prefix}-viz-swatch`} style={{ background: c.color }} aria-hidden />
                    <span className={`${prefix}-viz-stage-tbl-stage-name`}>
                      {c.ch}
                      {c.note ? (
                        <span className={`${prefix}-faint ${prefix}-viz-channel-tbl-note`}> ({c.note})</span>
                      ) : null}
                    </span>
                  </span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-channel-td-center`}>{c.volume ?? '—'}</td>
                <td className={`${prefix}-td ${prefix}-viz-channel-td-center`} style={{ color: c.color }}>
                  {c.share}%
                </td>
                <td className={`${prefix}-td ${prefix}-viz-channel-td-center`}>
                  <span className={`${prefix}-viz-stage-tbl-delta ${deltaClass(c.mom)}`}>{c.mom ?? '—'}</span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-channel-td-center`}>
                  <span className={`${prefix}-viz-stage-tbl-delta ${deltaClass(c.yoy ?? c.d)}`}>
                    {c.yoy ?? c.d ?? '—'}
                  </span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-channel-td-center`}>
                  <span className={`${prefix}-viz-stage-tbl-delta ${deltaClass(c.shareChg)}`}>{c.shareChg ?? '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** §4 — data panel: benchmarks + YoY contribution chart + evidence table */
export function DrillGrowthDataExplain({
  prefix,
  drivers,
  benchmarks = [],
  volumeTrend = [],
  volumeTrendLabel = 'Monthly toll volume index',
  lyIndex = 87,
  cyIndex = 104,
}) {
  const sorted = useMemo(() => [...drivers].sort((a, b) => b.val - a.val), [drivers]);
  const totalPts = sorted.reduce((s, d) => s + d.val, 0);
  const chartRows = useMemo(
    () =>
      sorted.map((d) => ({
        name: growthDriverShortName(d.name),
        pts: d.val,
        label: `+${d.val}%`,
        color: d.color,
      })),
    [sorted],
  );
  const chartMax = Math.max(...chartRows.map((r) => r.pts), 1);

  const momClass = (mom) => {
    const s = String(mom ?? '');
    if (/^\+/.test(s)) return `${prefix}-viz-growth-data-mom-up`;
    if (/^−|-/.test(s)) return `${prefix}-viz-growth-data-mom-down`;
    return '';
  };

  return (
    <div className={`${prefix}-viz-growth-data`}>
      {benchmarks.length ? (
        <div className={`${prefix}-viz-growth-data-bench`}>
          {benchmarks.map((b) => (
            <div key={b.label} className={`${prefix}-viz-growth-data-bench-card`}>
              <span className={`${prefix}-label`}>{b.label}</span>
              <span className={`${prefix}-viz-growth-data-bench-val`} style={b.color ? { color: b.color } : undefined}>
                {b.value}
              </span>
              <span className={`${prefix}-viz-growth-data-bench-delta ${momClass(b.delta)}`}>{b.delta}</span>
              {b.note ? <span className={`${prefix}-faint`}>{b.note}</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className={`${prefix}-viz-growth-data-split`}>
        <DrillVizFrame prefix={prefix} label="YoY volume lift · % points by driver">
          <div className={`${prefix}-viz-growth-data-chart`}>
            <ResponsiveContainer width="100%" height={chartRows.length * 34 + 8}>
              <BarChart data={chartRows} layout="vertical" margin={{ top: 0, right: 44, left: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, chartMax + 1.5]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={108}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  {...TIP}
                  formatter={(v, _name, item) => {
                    const row = item?.payload ?? {};
                    const share = totalPts > 0 ? ((row.pts / totalPts) * 100).toFixed(0) : '0';
                    return [`+${v}% pts · ${share}% of +${totalPts.toFixed(0)}% stack`, 'YoY contribution'];
                  }}
                />
                <Bar dataKey="pts" radius={[0, 4, 4, 0]} barSize={16}>
                  {chartRows.map((r) => (
                    <Cell key={r.name} fill={r.color} />
                  ))}
                  <LabelList dataKey="label" position="right" style={{ fontSize: 9, fontWeight: 700, fill: '#059669' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`${prefix}-viz-growth-data-bridge`}>
            <span className={`${prefix}-faint`}>LY index</span>
            <span className={`${prefix}-viz-growth-data-bridge-val`}>{lyIndex}</span>
            <span className={`${prefix}-viz-growth-data-bridge-arrow`} aria-hidden>
              → +{totalPts.toFixed(1)} pts →
            </span>
            <span className={`${prefix}-viz-growth-data-bridge-val ${prefix}-viz-growth-data-bridge-val--cy`}>{cyIndex}</span>
            <span className={`${prefix}-faint`}>CY index (+{((cyIndex / lyIndex - 1) * 100).toFixed(0)}% YoY)</span>
          </div>
        </DrillVizFrame>

        <div className={`${prefix}-viz-growth-data-side`}>
          {volumeTrend.length ? (
            <DrillVizFrame prefix={prefix} label={volumeTrendLabel}>
              <DrillAreaSpark data={volumeTrend} color="#2563eb" labelMode="month" height={88} />
              <div className={`${prefix}-viz-growth-data-trend-foot`}>
                <span className={`${prefix}-faint`}>12-mo indexed toll volume</span>
                <span className={`${prefix}-up`}>
                  {volumeTrend[volumeTrend.length - 1]} vs {volumeTrend[0]} (+{volumeTrend[volumeTrend.length - 1] - volumeTrend[0]} pts)
                </span>
              </div>
            </DrillVizFrame>
          ) : null}

          <div className={`${prefix}-viz-growth-data-table-wrap`}>
            <table className={`${prefix}-viz-growth-data-table`}>
              <thead>
                <tr>
                  <th className={`${prefix}-th`}>Growth driver</th>
                  <th className={`${prefix}-th ${prefix}-viz-growth-data-th-num`}>Underlying metric</th>
                  <th className={`${prefix}-th ${prefix}-viz-growth-data-th-num`}>Current</th>
                  <th className={`${prefix}-th ${prefix}-viz-growth-data-th-num`}>YoY / MoM</th>
                  <th className={`${prefix}-th ${prefix}-viz-growth-data-th-num`}>YoY lift (pts)</th>
                  <th className={`${prefix}-th ${prefix}-viz-growth-data-th-num`}>% of stack</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d) => {
                  const share = totalPts > 0 ? ((d.val / totalPts) * 100).toFixed(0) : '0';
                  const isPass = /annual pass/i.test(d.name);
                  return (
                    <tr key={d.name} className={isPass ? `${prefix}-viz-growth-data-row--pass` : undefined}>
                      <td className={`${prefix}-td ${prefix}-viz-growth-data-line-cell`}>
                        <span className={`${prefix}-viz-growth-data-swatch`} style={{ background: d.color }} aria-hidden />
                        <span className={`${prefix}-viz-growth-data-line-text`}>
                          <span className={`${prefix}-viz-growth-data-line-name`}>{d.name}</span>
                          {d.note ? <span className={`${prefix}-faint ${prefix}-viz-growth-data-line-sub`}>{d.note}</span> : null}
                        </span>
                      </td>
                      <td className={`${prefix}-td ${prefix}-viz-growth-data-td-num`}>{d.metricLabel ?? '—'}</td>
                      <td className={`${prefix}-td ${prefix}-viz-growth-data-td-num`} style={{ fontWeight: 600 }}>
                        {d.metricValue ?? '—'}
                      </td>
                      <td className={`${prefix}-td ${prefix}-viz-growth-data-td-num ${momClass(d.metricYoy)}`}>
                        {d.metricYoy ?? '—'}
                        {d.mom ? <span className={`${prefix}-faint ${prefix}-viz-growth-data-mom-sub`}> · {d.mom}</span> : null}
                      </td>
                      <td className={`${prefix}-td ${prefix}-viz-growth-data-td-num`} style={{ color: d.color, fontWeight: 700 }}>
                        +{d.val}%
                      </td>
                      <td className={`${prefix}-td ${prefix}-viz-growth-data-td-num`}>{share}%</td>
                    </tr>
                  );
                })}
                <tr className={`${prefix}-viz-growth-data-total`}>
                  <td className={`${prefix}-td`} colSpan={4}>
                    <strong>Indexed YoY volume lift</strong>
                  </td>
                  <td className={`${prefix}-td ${prefix}-viz-growth-data-td-num`}>
                    <strong style={{ color: '#059669' }}>+{totalPts.toFixed(1)}%</strong>
                  </td>
                  <td className={`${prefix}-td ${prefix}-viz-growth-data-td-num`}>
                    <strong>100%</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function yoyPctFromSeries(values) {
  if (!values?.length) return 0;
  const first = values[0];
  const last = values[values.length - 1];
  if (!first) return 0;
  return Math.round(((last - first) / first) * 100);
}

const TXN_USAGE_SERIES = [
  { id: 'count', label: 'Number of transactions', dataKey: 'countL', color: '#059669', format: (v) => `${v}L / day` },
  { id: 'value', label: 'Total transaction value', dataKey: 'valueCr', color: '#0891b2', format: (v) => `₹${v}Cr / mo` },
  { id: 'perUser', label: 'Transactions per user', dataKey: 'perUser', color: '#6366f1', format: (v) => `${v} / active tag` },
];

/** §4 — transaction growth: area trends with axes, range stats, and 12-mo context */
export function DrillGrowthTransactionPanel({ prefix, monthly }) {
  const chartData = useMemo(() => monthly ?? [], [monthly]);
  const gradUid = useId().replace(/:/g, '');
  const seriesMeta = useMemo(
    () =>
      TXN_USAGE_SERIES.map((s) => {
        const values = chartData.map((d) => d[s.dataKey]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const pad = Math.max(0.5, (max - min) * 0.12);
        const first = values[0];
        const last = values[values.length - 1];
        const peak = Math.max(...values);
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        return {
          ...s,
          yoy: yoyPctFromSeries(values),
          first,
          last,
          peak,
          avg,
          domain: [Math.max(0, min - pad), max + pad],
        };
      }),
    [chartData],
  );

  const lastMonth = chartData[chartData.length - 1]?.month ?? 'Dec';

  return (
    <DrillVizFrame prefix={prefix}>
      <div className={`${prefix}-viz-txn-growth`}>
        {seriesMeta.map((s, idx) => {
          const showX = idx === seriesMeta.length - 1;
          const chartH = showX ? 108 : 96;
          return (
            <div key={s.id} className={`${prefix}-viz-txn-series`}>
              <div className={`${prefix}-viz-txn-series-meta`}>
                <span className={`${prefix}-viz-txn-series-label`}>{s.label}</span>
                <div className={`${prefix}-viz-txn-series-hero`}>
                  <span className={`${prefix}-viz-txn-series-now`} style={{ color: s.color }}>
                    {s.format(s.last)}
                  </span>
                  <span className={`${prefix}-up`}>+{s.yoy}% vs Jan</span>
                </div>
                <div className={`${prefix}-viz-txn-series-range`}>
                  <div className={`${prefix}-viz-txn-range-main`}>
                    <span>
                      Jan <strong>{s.format(s.first)}</strong>
                    </span>
                    <span className={`${prefix}-viz-txn-range-arrow`} aria-hidden>
                      →
                    </span>
                    <span>
                      {lastMonth} <strong>{s.format(s.last)}</strong>
                    </span>
                  </div>
                  <div className={`${prefix}-faint ${prefix}-viz-txn-range-sub`}>
                    Peak {s.format(s.peak)} · Avg {s.format(round1(s.avg))}
                  </div>
                </div>
              </div>
              <div className={`${prefix}-viz-txn-series-chart`}>
                <ResponsiveContainer width="100%" height={chartH}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 6, right: 8, left: 2, bottom: showX ? 14 : 4 }}
                  >
                    <defs>
                      <linearGradient id={`${gradUid}-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="month"
                      hide={!showX}
                      tick={{ fontSize: 8, fill: '#64748b', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      interval={1}
                    />
                    <YAxis
                      domain={s.domain}
                      width={40}
                      tick={{ fontSize: 8, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickCount={3}
                      tickFormatter={(v) => {
                        if (s.id === 'value') return `₹${v}`;
                        if (s.id === 'count') return `${v}L`;
                        return String(v);
                      }}
                    />
                    <Tooltip
                      {...TIP}
                      labelFormatter={(m) => `Month: ${m}`}
                      formatter={(v) => [s.format(Number(v)), s.label]}
                    />
                    <Area
                      type="monotone"
                      dataKey={s.dataKey}
                      stroke={s.color}
                      strokeWidth={2.5}
                      fill={`url(#${gradUid}-${s.id})`}
                      dot={{ r: 2, fill: s.color, stroke: '#fff', strokeWidth: 1 }}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </DrillVizFrame>
  );
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

const RETENTION_LINES = [
  { dataKey: 'activePct', name: 'Active share', color: '#059669', yAxisId: 'share' },
  { dataKey: 'repeatUsage', name: 'Repeat usage', color: '#0891b2', yAxisId: 'share' },
  { dataKey: 'dormancy', name: 'Dormancy rate', color: '#d97706', yAxisId: 'share', dashed: true },
  { dataKey: 'growthRate', name: 'Growth rate', color: '#7c3aed', yAxisId: 'growth' },
];

/** §5 — retention: multi-line sustainability trend */
export function DrillGrowthRetentionPanel({ prefix, monthly }) {
  const chartData = useMemo(() => monthly ?? [], [monthly]);
  const latest = chartData[chartData.length - 1];
  const first = chartData[0];
  const growthDomain = useMemo(() => {
    const vals = chartData.map((d) => d.growthRate).filter((v) => v != null);
    if (!vals.length) return [10, 24];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max(1, (max - min) * 0.15);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  return (
    <div className={`${prefix}-viz-retention`}>
      <DrillVizFrame prefix={prefix}>
        <div className={`${prefix}-viz-retention-line-chart`}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 40, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                yAxisId="share"
                domain={[14, 72]}
                tick={{ fontSize: 9, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={32}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                yAxisId="growth"
                orientation="right"
                domain={growthDomain}
                tick={{ fontSize: 9, fill: '#7c3aed', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v) => `+${v}%`}
              />
              <Tooltip
                {...TIP}
                labelFormatter={(m) => `Month: ${m}`}
                formatter={(v, name) => {
                  const label = String(name ?? '');
                  const n = Number(v);
                  if (label === 'Growth rate') return [`+${n}% indexed lift`, label];
                  return [`${n}%`, label];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
                iconSize={10}
                iconType="line"
              />
              {RETENTION_LINES.map((line) => (
                <Line
                  key={line.dataKey}
                  yAxisId={line.yAxisId}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={line.dataKey === 'growthRate' ? 3 : 2.25}
                  strokeDasharray={line.dashed ? '6 4' : undefined}
                  dot={{ r: 3, strokeWidth: 0, fill: line.color }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {latest && first ? (
          <div className={`${prefix}-viz-retention-latest`}>
            <span className={`${prefix}-faint`}>Jan → {latest.month ?? 'Dec'}</span>
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>
              Growth index +{first.growthRate}% → +{latest.growthRate}%
            </span>
            <span style={{ color: '#059669', fontWeight: 700 }}>
              Active {first.activePct}% → {latest.activePct}%
            </span>
            <span style={{ color: '#0891b2', fontWeight: 700 }}>
              Repeat {first.repeatUsage}% → {latest.repeatUsage}%
            </span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>
              Dormant {first.dormancy}% → {latest.dormancy}%
            </span>
          </div>
        ) : null}
      </DrillVizFrame>
    </div>
  );
}

const EXPLAIN_TONE = {
  context: 'context',
  driver: 'driver',
  risk: 'risk',
  opportunity: 'opportunity',
};

/** @deprecated — use DrillGrowthDataExplain for growth drill-down synthesis */
export function DrillGrowthExplainStory({ prefix, thesis, blocks }) {
  return (
    <div className={`${prefix}-viz-explain-story`}>
      <p className={`${prefix}-viz-explain-thesis`}>{thesis}</p>
      <ol className={`${prefix}-viz-explain-blocks`}>
        {blocks.map((b, i) => (
          <li
            key={b.id}
            className={`${prefix}-viz-explain-block ${prefix}-viz-explain-block--${EXPLAIN_TONE[b.tone] ?? 'driver'}`}
            style={b.color ? { ['--explain-accent']: b.color } : undefined}
          >
            <div className={`${prefix}-viz-explain-block-rail`}>
              <span className={`${prefix}-viz-explain-step`}>{i + 1}</span>
              {i < blocks.length - 1 ? <span className={`${prefix}-viz-explain-connector`} aria-hidden /> : null}
            </div>
            <div className={`${prefix}-viz-explain-block-body`}>
              <div className={`${prefix}-viz-explain-block-top`}>
                <span className={`${prefix}-viz-explain-phase`}>{b.phase}</span>
                {b.contribution ? (
                  <span className={`${prefix}-viz-explain-contrib`}>{b.contribution}</span>
                ) : null}
              </div>
              <h4 className={`${prefix}-viz-explain-title`}>{b.title}</h4>
              <p className={`${prefix}-viz-explain-text`}>{b.explain}</p>
              <div className={`${prefix}-viz-explain-proof`}>
                <span className={`${prefix}-viz-explain-proof-label`}>Evidence</span>
                <span className={`${prefix}-faint`}>{b.proof}</span>
              </div>
              {b.ref ? <span className={`${prefix}-viz-explain-ref`}>{b.ref}</span> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** §5 — prioritized growth plays with why / expected move / owner */
export function DrillGrowthExplainPlays({ prefix, plays }) {
  return (
    <div className={`${prefix}-viz-explain-plays`}>
      <ol className={`${prefix}-viz-explain-play-list`}>
        {plays.map((p) => (
          <li
            key={p.id}
            className={`${prefix}-viz-explain-play ${prefix}-viz-explain-play--${p.urgency ?? 'focus'}`}
          >
            <div className={`${prefix}-viz-explain-play-rank`}>{p.priority}</div>
            <div className={`${prefix}-viz-explain-play-body`}>
              <div className={`${prefix}-viz-explain-play-head`}>
                <h4 className={`${prefix}-viz-explain-play-title`}>{p.title}</h4>
                <span className={`${prefix}-viz-explain-play-impact`}>{p.impact}</span>
              </div>
              <div className={`${prefix}-viz-explain-play-grid`}>
                <div className={`${prefix}-viz-explain-play-cell`}>
                  <span className={`${prefix}-label`}>Why now</span>
                  <p>{p.why}</p>
                </div>
                <div className={`${prefix}-viz-explain-play-cell`}>
                  <span className={`${prefix}-label`}>Growth move</span>
                  <p>{p.growthMove}</p>
                </div>
              </div>
              <div className={`${prefix}-viz-explain-play-foot`}>
                <span className={`${prefix}-faint`}>{p.owner}</span>
                <span className={`${prefix}-viz-explain-ref`}>{p.ref}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Left-to-right stage flow with growth tracked at each step */
export function DrillStageGrowthFlow({ prefix, stages, heading, badge, stepAccent = '#0891b2' }) {
  return (
    <div className={`${prefix}-viz-stage-flow`}>
      {heading || badge ? (
        <div className={`${prefix}-viz-stage-flow-head`}>
          {heading ? <span className={`${prefix}-label`}>{heading}</span> : null}
          {badge ? <span className={`${prefix}-badge ${prefix}-viz-stage-badge`}>{badge}</span> : null}
        </div>
      ) : null}
      <div className={`${prefix}-viz-stage-flow-scroll`}>
        <div className={`${prefix}-viz-stage-flow-row`}>
          {stages.map((s, i) => {
            const isDrop = /^−|▼|▶/.test(String(s.growth ?? ''));
            return (
              <div key={s.stage} className={`${prefix}-viz-stage-flow-item`}>
                {i > 0 ? <span className={`${prefix}-viz-stage-flow-arrow`} aria-hidden>→</span> : null}
                <div
                  className={`${prefix}-viz-stage-flow-step${s.isBottleneck ? ` ${prefix}-viz-stage-flow-step--bottleneck` : ''}`}
                >
                  <span className={`${prefix}-viz-stage-flow-num`} style={{ background: stepAccent }}>
                    {i + 1}
                  </span>
                  <span className={`${prefix}-viz-stage-flow-stage`}>{s.stage}</span>
                  <span className={`${prefix}-viz-stage-flow-val`} style={{ color: s.color }}>
                    {s.display}
                  </span>
                  <span className={`${prefix}-faint ${prefix}-viz-stage-flow-period`}>{s.period}</span>
                  <span
                    className={`${prefix}-viz-stage-flow-growth${isDrop ? ` ${prefix}-viz-stage-flow-growth--drop` : ''}`}
                  >
                    {s.growth}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** §1 — YoY volume lift by driver (pie) */
export function DrillDriversPassCombo({ prefix, drivers }) {
  return <DrillDriverVolumePie prefix={prefix} drivers={drivers} />;
}

/** Annual pass — 2×2 stat tiles with bars */
export function DrillPassStatGrid({ prefix, metrics }) {
  return (
    <div className={`${prefix}-viz-pass-grid`}>
      {metrics.map((m) => (
        <div key={m.label} className={`${prefix}-viz-pass-tile`}>
          <div className={`${prefix}-viz-pass-val`} style={{ color: m.color }}>
            {m.display}
          </div>
          <DrillMetricBar
            prefix={prefix}
            label={m.label}
            display=""
            pct={Math.min(100, m.val)}
            color={m.color}
            sub={m.sub}
            trackHeight={8}
          />
        </div>
      ))}
    </div>
  );
}

/** Usage metrics — each bar scaled 0–100 for viz clarity */
export function DrillUsageGrid({ prefix, rows }) {
  const scaled = rows.map((r) => ({
    ...r,
    pct: Math.min(100, (r.val / (r.scale ?? r.val)) * 100),
  }));
  return (
    <DrillVizFrame prefix={prefix} label="Usage & monetization depth">
      <div className={`${prefix}-viz-usage-grid`}>
        {scaled.map((r) => (
          <DrillMetricBar
            key={r.label}
            prefix={prefix}
            label={r.label}
            display={r.display}
            delta={r.delta}
            pct={r.pct}
            color={r.color}
          />
        ))}
      </div>
    </DrillVizFrame>
  );
}

/** Segment + geo split panel */
export function DrillSegmentGeoPanel({ prefix, segments, geo }) {
  const segSlices = segments.map((s) => ({
    name: s.seg,
    value: s.share,
    color: s.color,
    growth: s.d,
  }));
  const leadSeg = segSlices[0];
  const centerMain = leadSeg ? `${leadSeg.value}%` : '—';
  const centerSub = leadSeg?.name?.split(' ')[0]?.toLowerCase() ?? 'mix';
  const geoRows = [...geo]
    .map((g) => ({
      name: g.st,
      growth: parseFloat(String(g.g).replace(/[^0-9.]/g, '')) || 0,
      label: g.g,
    }))
    .sort((a, b) => b.growth - a.growth);
  const geoMax = geoRows[0]?.growth ?? 1;

  return (
    <div className={`${prefix}-viz-split`}>
      <div className={`${prefix}-viz-split-col`}>
        <DrillDonutMix prefix={prefix} slices={segSlices} centerMain={centerMain} centerSub={centerSub} />
      </div>
      <div className={`${prefix}-viz-split-col`}>
        <DrillVizFrame prefix={prefix} label="Corridor growth · YoY">
          <div className={`${prefix}-viz-geo-chart`}>
            <ResponsiveContainer width="100%" height={geoRows.length * 32 + 4}>
              <BarChart data={geoRows} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, geoMax + 6]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={92}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="growth" fill="#059669" radius={[0, 4, 4, 0]} barSize={14}>
                  <LabelList dataKey="label" position="right" style={{ fontSize: 9, fill: '#059669', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DrillVizFrame>
      </div>
    </div>
  );
}

/** Refined area spark for in-panel use */
export function DrillAreaSpark({ data, color = '#2563eb', labelMode = 'month', height = 72 }) {
  const gradUid = useId().replace(/:/g, '');
  const tag = 'M';
  const chartData = useMemo(
    () => data.map((v, i) => ({ w: `${tag}${i + 1}`, v })),
    [data, tag],
  );
  const domain = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const pad = Math.max(0.5, (max - min) * 0.12);
    return [Math.max(0, min - pad), max + pad];
  }, [data]);

  return (
    <div className="drill-area-spark" style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`drill-spark-${gradUid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="w"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 600 }}
            height={14}
            padding={{ left: 0, right: 4 }}
          />
          <YAxis hide domain={domain} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#drill-spark-${gradUid})`}
            fillOpacity={0.6}
            dot={{ r: 2.5, fill: color, stroke: '#fff', strokeWidth: 1 }}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function issuesSevColor(sev) {
  if (sev === 'Critical') return '#dc2626';
  if (sev === 'High') return '#d97706';
  return '#059669';
}

function issuesChurnColor(churn) {
  if (churn === 'High') return '#dc2626';
  if (churn === 'Med') return '#d97706';
  return '#64748b';
}

/** §1 — issue impact ranked table */
export function DrillIssuesImpactTable({ prefix, rows }) {
  return (
    <div className={`${prefix}-viz-stage-table-wrap ${prefix}-viz-issues-impact`}>
      <table className={`${prefix}-viz-stage-table ${prefix}-viz-issues-table`}>
        <thead>
          <tr>
            <th className={`${prefix}-th`}>Issue type</th>
            <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Complaints</th>
            <th className={`${prefix}-th`}>Customers / tags</th>
            <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Spend at risk</th>
            <th className={`${prefix}-th ${prefix}-viz-issues-th-center`}>Happiness impact</th>
            <th className={`${prefix}-th ${prefix}-viz-issues-th-center`}>Severity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const churnCol = issuesChurnColor(r.churn);
            const sevCol = issuesSevColor(r.sev);
            return (
              <tr key={r.issue}>
                <td className={`${prefix}-td`}>
                  <span className={`${prefix}-viz-stage-tbl-stage-name`}>{r.issue}</span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>
                  {r.vol}{' '}
                  <span className={`${prefix}-up`} style={{ fontSize: 10 }}>
                    ↑{r.volD}
                  </span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-detail`}>{r.affected}</td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`} style={{ fontWeight: 700, color: '#dc2626' }}>
                  {r.risk}
                </td>
                <td className={`${prefix}-td ${prefix}-viz-issues-td-center`}>
                  <span
                    className={`${prefix}-viz-issues-chip`}
                    style={{ background: `${churnCol}1a`, color: churnCol, border: `1px solid ${churnCol}44` }}
                  >
                    {r.churn}
                  </span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-issues-td-center`}>
                  <span
                    className={`${prefix}-badge`}
                    style={{ color: sevCol, background: `${sevCol}1a`, border: `1px solid ${sevCol}55` }}
                  >
                    {r.sev}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** §2 — complaint mix donut + legend table */
export function DrillComplaintMixPie({ prefix, slices }) {
  const total = useMemo(() => slices.reduce((s, d) => s + d.pct, 0), [slices]);
  const data = useMemo(
    () =>
      [...slices]
        .sort((a, b) => b.pct - a.pct)
        .map((d) => ({
          name: d.cat,
          value: d.pct,
          color: d.color,
          volume: d.volume,
          delta: d.d,
        })),
    [slices],
  );

  return (
    <div
      className={`${prefix}-viz-driver-pie`}
      role="img"
      aria-label={`Complaint mix ${total} percent total`}
    >
      <div className={`${prefix}-viz-driver-pie-chart`}>
        <div className={`${prefix}-viz-donut-ring ${prefix}-viz-driver-pie-ring`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="86%"
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                {...TIP}
                formatter={(v, name, item) => {
                  const row = item?.payload ?? {};
                  return [`${v}% · ${row.volume ?? ''} cases`, String(name ?? '')];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className={`${prefix}-viz-donut-hole`}>
            <span className={`${prefix}-viz-donut-hole-val`}>{total}%</span>
            <span className={`${prefix}-faint`}>complaint mix</span>
          </div>
        </div>
      </div>
      <div className={`${prefix}-viz-driver-pie-table-wrap`}>
        <table className={`${prefix}-viz-driver-pie-table`}>
          <thead>
            <tr>
              <th className={`${prefix}-viz-driver-pie-th-dot`} aria-hidden />
              <th className={`${prefix}-viz-driver-pie-th`}>Category</th>
              <th className={`${prefix}-viz-driver-pie-th ${prefix}-viz-driver-pie-th-num`}>Volume</th>
              <th className={`${prefix}-viz-driver-pie-th ${prefix}-viz-driver-pie-th-num`}>Share</th>
              <th className={`${prefix}-viz-driver-pie-th ${prefix}-viz-driver-pie-th-num`}>WoW</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.name}>
                <td className={`${prefix}-viz-driver-pie-td-dot`}>
                  <span className={`${prefix}-viz-swatch`} style={{ background: s.color }} aria-hidden />
                </td>
                <td className={`${prefix}-viz-driver-pie-td-name`}>{s.name}</td>
                <td className={`${prefix}-viz-driver-pie-td-num`}>{s.volume}</td>
                <td className={`${prefix}-viz-driver-pie-td-num ${prefix}-viz-driver-pie-td-lift`}>{s.value}%</td>
                <td className={`${prefix}-viz-driver-pie-td-num ${s.delta?.startsWith('-') ? `${prefix}-down` : `${prefix}-up`}`}>
                  {s.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** §3 — customer / partner happiness gauges */
export function DrillHappinessGaugePanel({ prefix, metrics }) {
  return (
    <div className={`${prefix}-viz-happiness`}>
      <div className={`${prefix}-viz-happiness-grid`}>
        {metrics.map((m) => (
          <div key={m.label} className={`${prefix}-viz-happiness-tile`}>
            <div className={`${prefix}-row`} style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{m.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.display}</span>
            </div>
            <div className={`${prefix}-track ${prefix}-viz-track`} style={{ height: 8 }}>
              <div
                className={`${prefix}-fill`}
                style={{ width: `${Math.min(100, m.barPct)}%`, background: m.color }}
              />
            </div>
            <div className={`${prefix}-faint ${prefix}-viz-metric-sub`}>
              {m.sub}
              {m.target ? <span> · tgt {m.target}{String(m.display).includes('%') ? '%' : ''}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** §4 — partner scorecard table */
export function DrillPartnerScorecardPanel({ prefix, partners }) {
  return (
    <div className={`${prefix}-viz-stage-table-wrap ${prefix}-viz-partner-score`}>
      <table className={`${prefix}-viz-stage-table ${prefix}-viz-partner-table`}>
        <thead>
          <tr>
            <th className={`${prefix}-th`}>Partner</th>
            <th className={`${prefix}-th`}>Role</th>
            <th className={`${prefix}-th`} style={{ minWidth: 140 }}>
              Partner happiness
            </th>
            <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Error rate</th>
            <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Cases</th>
            <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Exposure</th>
            <th className={`${prefix}-th ${prefix}-viz-issues-th-center`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => {
            const col = p.sla >= 85 ? '#059669' : p.sla >= 70 ? '#d97706' : '#dc2626';
            const sevCol = issuesSevColor(p.sev);
            return (
              <tr key={p.name} className={p.sla < 70 ? `${prefix}-viz-partner-row--strain` : undefined}>
                <td className={`${prefix}-td`}>
                  <span className={`${prefix}-viz-stage-tbl-stage-name`}>{p.name}</span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-detail`}>{p.role}</td>
                <td className={`${prefix}-td`}>
                  <div className={`${prefix}-viz-partner-happy-row`}>
                    <div className={`${prefix}-track ${prefix}-viz-track`} style={{ flex: 1, height: 8 }}>
                      <div className={`${prefix}-fill`} style={{ width: `${p.sla}%`, background: col }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: col, minWidth: 32 }}>{p.sla}%</span>
                  </div>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>{p.err}</td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>{p.cases}</td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`} style={{ fontWeight: 700, color: '#dc2626' }}>
                  {p.exp}
                </td>
                <td className={`${prefix}-td ${prefix}-viz-issues-td-center`}>
                  <span
                    className={`${prefix}-badge`}
                    style={{ color: sevCol, background: `${sevCol}1a`, border: `1px solid ${sevCol}55` }}
                  >
                    {p.sev}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** §5 — churn / at-risk KPI tiles */
export function DrillChurnRiskPanel({ prefix, metrics, note }) {
  return (
    <div className={`${prefix}-viz-churn`}>
      <div className={`${prefix}-viz-churn-grid`}>
        {metrics.map((m) => (
          <div key={m.label} className={`${prefix}-viz-churn-tile`}>
            <span className={`${prefix}-label`}>{m.label}</span>
            <span className={`${prefix}-viz-churn-val`} style={{ color: m.color }}>
              {m.display}
            </span>
            <span className={`${prefix}-faint`}>{m.sub}</span>
          </div>
        ))}
      </div>
      {note ? <p className={`${prefix}-viz-churn-note`}>{note}</p> : null}
    </div>
  );
}

/** §6 — negative sentiment trend */
export function DrillSentimentTrendPanel({ prefix, points, tag }) {
  const gradUid = useId().replace(/:/g, '');
  const chartData = useMemo(() => points ?? [], [points]);
  const first = chartData[0];
  const last = chartData[chartData.length - 1];

  return (
    <div className={`${prefix}-viz-sentiment`}>
      <div className={`${prefix}-viz-sentiment-head`}>
        <span className={`${prefix}-faint`}>Negative mentions index</span>
        {tag ? <span className={`${prefix}-up`}>{tag}</span> : null}
      </div>
      <div className={`${prefix}-viz-sentiment-chart`}>
        <ResponsiveContainer width="100%" height={108}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 2, bottom: 4 }}>
            <defs>
              <linearGradient id={`sent-grad-${gradUid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={['dataMin - 8', 'dataMax + 8']} />
            <Tooltip
              {...TIP}
              formatter={(v) => [`${v} indexed mentions`, 'Mentions']}
            />
            <Area
              type="monotone"
              dataKey="mentions"
              stroke="#d97706"
              strokeWidth={2}
              fill={`url(#sent-grad-${gradUid})`}
              dot={{ r: 2.5, fill: '#d97706', stroke: '#fff', strokeWidth: 1 }}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {first && last ? (
        <div className={`${prefix}-viz-sentiment-foot`}>
          <span className={`${prefix}-faint`}>
            {first.label} {first.mentions} → {last.label} {last.mentions}
          </span>
          <span className={`${prefix}-faint`}>
            Reputation drag suppresses new tag acquisition — reach est. 1.8M
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** §7 — root cause bars + prioritized actions table */
export function DrillRootCauseActionsPanel({ prefix, rootCauses, actions }) {
  return (
    <div className={`${prefix}-viz-root-actions`}>
      <div className={`${prefix}-viz-root-actions-split`}>
        <div className={`${prefix}-viz-root-actions-col`}>
          <div className={`${prefix}-label ${prefix}-viz-root-actions-label`}>
            Where issues originate
          </div>
          {rootCauses.map((r) => (
            <DrillMetricBar
              key={r.cause}
              prefix={prefix}
              label={r.cause}
              display={`${r.share}%`}
              pct={r.share}
              color={r.color}
              trackHeight={8}
            />
          ))}
        </div>
        <div className={`${prefix}-viz-root-actions-col`}>
          <div className={`${prefix}-viz-stage-table-wrap`}>
            <table className={`${prefix}-viz-stage-table ${prefix}-viz-actions-table`}>
              <thead>
                <tr>
                  <th className={`${prefix}-th`}>Action</th>
                  <th className={`${prefix}-th`}>Owner</th>
                  <th className={`${prefix}-th`}>Impact</th>
                  <th className={`${prefix}-th ${prefix}-viz-issues-th-center`}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => {
                  const sevCol = issuesSevColor(a.sev);
                  return (
                    <tr key={a.act}>
                      <td className={`${prefix}-td`} style={{ fontWeight: 600, lineHeight: 1.35 }}>
                        {a.act}
                      </td>
                      <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-detail`}>{a.owner}</td>
                      <td className={`${prefix}-td`} style={{ color: '#059669', fontWeight: 600, fontSize: 10 }}>
                        {a.impact}
                      </td>
                      <td className={`${prefix}-td ${prefix}-viz-issues-td-center`}>
                        <span
                          className={`${prefix}-badge`}
                          style={{ color: sevCol, background: `${sevCol}1a`, border: `1px solid ${sevCol}55` }}
                        >
                          {a.sev}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

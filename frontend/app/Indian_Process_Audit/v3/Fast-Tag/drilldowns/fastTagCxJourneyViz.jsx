'use client';

import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DrillDonutMix, DrillMetricBar, DrillVizFrame } from './fastTagDrillViz';

const TIP = {
  contentStyle: { fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' },
  itemStyle: { fontSize: 11, color: '#475569' },
};

function sevColor(C, s) {
  if (s >= 65) return C.red;
  if (s >= 45) return C.amber;
  return C.green;
}

function sevBadgeColor(C, sev) {
  if (sev === 'Critical') return C.red;
  if (sev === 'High') return C.amber;
  return C.green;
}

/** Hotspot badges for stages ranked #1 / #2 by friction */
export function CxStageHotspotBadges({ prefix, stages }) {
  const hotspots = useMemo(
    () => [...stages].filter((s) => s.worst).sort((a, b) => a.worst - b.worst),
    [stages],
  );

  if (!hotspots.length) return null;

  return (
    <div className={`${prefix}-jx-stage-hotspots`}>
      {hotspots.map((s) => (
        <span key={s.id} className={`${prefix}-badge ${prefix}-jx-hotspot-badge`}>
          #{s.worst} · {s.short}
        </span>
      ))}
    </div>
  );
}

/** §2 — Stage friction: struggle index (bar) + contact share (line) in one chart */
export function CxStageFrictionChart({ prefix, C, stages }) {
  const rows = useMemo(
    () =>
      stages.map((s) => ({
        name: s.short,
        full: s.st,
        struggle: s.struggle,
        contacts: s.contacts,
        ces: s.ces,
        sent: s.sent,
        color: sevColor(C, s.struggle),
        worst: s.worst,
      })),
    [stages, C],
  );

  return (
    <DrillVizFrame prefix={prefix} label="Struggle index (bars) · contact share % (line)">
      <div className={`${prefix}-jx-combo-chart`}>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 8.5, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-28}
              textAnchor="end"
              height={52}
            />
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={28}
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 40]}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={28}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              {...TIP}
              formatter={(value, name, item) => {
                const row = item?.payload ?? {};
                if (name === 'struggle') return [`${value}/100 · CES ${row.ces}`, 'Struggle index'];
                if (name === 'contacts') return [`${value}% of contacts`, 'Contact share'];
                return [value, name];
              }}
              labelFormatter={(_l, payload) => payload?.[0]?.payload?.full ?? _l}
            />
            <Bar yAxisId="left" dataKey="struggle" radius={[4, 4, 0, 0]} barSize={28}>
              {rows.map((r) => (
                <Cell key={r.name} fill={r.color} />
              ))}
              <LabelList
                dataKey="struggle"
                position="top"
                style={{ fontSize: 9, fontWeight: 700, fill: '#475569' }}
              />
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="contacts"
              stroke={C.violet}
              strokeWidth={2}
              dot={{ r: 3, fill: C.violet, stroke: '#fff', strokeWidth: 1.5 }}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </DrillVizFrame>
  );
}

/** §1 — Top 5 customer struggles board (ranked rows inside one card) */
const RANK_THEMES = [
  { main: '#F04438', soft: 'rgba(240,68,56,0.1)' },
  { main: '#F79009', soft: 'rgba(247,144,9,0.12)' },
  { main: '#FDB022', soft: 'rgba(253,176,34,0.14)' },
  { main: '#2E90FA', soft: 'rgba(46,144,250,0.1)' },
  { main: '#12B76A', soft: 'rgba(18,183,106,0.1)' },
];

function formatBoardPeriodLabel(grain, caption) {
  const fmt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (grain === 'last24') return `Today, ${fmt}`;
  if (grain === 'weeks') return `Last 4 weeks · ${fmt}`;
  if (grain === 'month') return `This month · ${fmt}`;
  if (grain === 'quarter') return `This quarter · ${fmt}`;
  if (grain === 'year') return `FY to date · ${fmt}`;
  return caption;
}

function StruggleIcon({ kind, color }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'kyc') {
    return (
      <svg {...common} aria-hidden>
        <path d="M7 4h10v16H7z" />
        <path d="M10 9h4M10 13h4" />
        <path d="M9 17l6-6" stroke={color} />
        <path d="M15 17l-6-6" stroke={color} />
      </svg>
    );
  }
  if (kind === 'wallet') {
    return (
      <svg {...common} aria-hidden>
        <path d="M4 8h16v12H4z" />
        <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
        <circle cx="17" cy="14" r="1.2" fill={color} stroke="none" />
      </svg>
    );
  }
  if (kind === 'blacklist') {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M8 8l8 8" />
      </svg>
    );
  }
  if (kind === 'tag') {
    return (
      <svg {...common} aria-hidden>
        <path d="M4 12l8-8 8 8-8 8z" />
        <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <path d="M12 3v18" />
      <path d="M7 8h10M7 16h10" />
      <path d="M9 5l-2 3 2 3M15 5l2 3-2 3" />
    </svg>
  );
}

function contactSharePct(contactShare) {
  const match = contactShare?.match(/(\d+)%/);
  return match ? match[1] : '—';
}

export function CxStruggleRankCard({ prefix, rows, period = 'month', caption = 'this month' }) {
  const ranked = useMemo(
    () => [...rows].sort((a, b) => b.volume - a.volume).slice(0, 5),
    [rows],
  );
  const periodLabel = formatBoardPeriodLabel(period, caption);

  return (
    <section className={`${prefix}-top5-board`} aria-label="Top 5 customer struggles ranked by daily volume">
      <header className={`${prefix}-top5-board-head`}>
        <div className={`${prefix}-top5-board-head-left`}>
          <span className={`${prefix}-top5-board-icon`} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 18l4-8 4 5 4-9 4 12" />
            </svg>
          </span>
          <div>
            <h3 className={`${prefix}-top5-board-title`}>Top 5 Customer Struggles</h3>
            <p className={`${prefix}-top5-board-sub`}>
              Ranked by daily volume
              <span className={`${prefix}-top5-board-info`} title="Ranked by reported daily complaint volume across channels">
                i
              </span>
            </p>
          </div>
        </div>
        <span className={`${prefix}-top5-board-date`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          {periodLabel}
        </span>
      </header>

      <div className={`${prefix}-top5-board-rows`} role="list">
        {ranked.map((r, i) => {
          const rank = i + 1;
          const theme = RANK_THEMES[i] ?? RANK_THEMES[4];
          const trendPct = r.trend.replace(/^[+-]/, '');
          return (
            <article
              key={r.id}
              className={`${prefix}-top5-row`}
              role="listitem"
              title={`${r.pt} · ${r.cause}`}
            >
              <div className={`${prefix}-top5-rank`} style={{ background: theme.main }}>
                #{rank}
              </div>

              <div className={`${prefix}-top5-iconbox`} style={{ background: theme.soft }}>
                <StruggleIcon kind={r.icon} color={theme.main} />
              </div>

              <div className={`${prefix}-top5-desc`}>
                <div className={`${prefix}-top5-desc-head`}>
                  <div className={`${prefix}-top5-desc-title`}>{r.short}</div>
                  <div className={`${prefix}-top5-desc-meta`}>
                    <span className={`${prefix}-top5-stage-pill`} style={{ color: theme.main, background: theme.soft }}>
                      {r.stage}
                    </span>
                    <span className={`${prefix}-top5-meta-dot`} aria-hidden>
                      ·
                    </span>
                    <span>
                      CES <strong style={{ color: theme.main }}>{r.ces}</strong>
                    </span>
                  </div>
                </div>
                <p className={`${prefix}-top5-desc-quote`}>&ldquo;{r.quote}&rdquo;</p>
              </div>

              <div className={`${prefix}-top5-metric`}>
                <span className={`${prefix}-top5-metric-label`}>Daily volume</span>
                <div className={`${prefix}-top5-metric-val`} style={{ color: theme.main }}>
                  <strong>{r.volume.toLocaleString()}</strong>
                  <span>/day</span>
                </div>
              </div>

              <div className={`${prefix}-top5-metric`}>
                <span className={`${prefix}-top5-metric-label`}>Vs yesterday</span>
                <div className={`${prefix}-top5-trend`} style={{ color: theme.main }}>
                  <strong>
                    {r.trendUp ? '↑' : '↓'} {trendPct}
                  </strong>
                  <span className={`${prefix}-top5-trend-delta`}>({r.priorDelta.toLocaleString()})</span>
                </div>
              </div>

              <div className={`${prefix}-top5-metric`}>
                <span className={`${prefix}-top5-metric-label`}>Contact share</span>
                <div className={`${prefix}-top5-metric-val`} style={{ color: theme.main }}>
                  <strong>{contactSharePct(r.contactShare)}%</strong>
                  <span>of contacts</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/** §3a — Complaint ratio trend + per-stage breakdown */
export function CxComplaintRatioTrack({ prefix, C, data, stages }) {
  const stageRows = useMemo(() => {
    const byId = Object.fromEntries(stages.map((s) => [s.id, s]));
    return data.byStage.map((row) => ({
      ...row,
      label: byId[row.stageId]?.short ?? row.stageId,
      color: row.ratio >= 2.5 ? C.red : row.ratio >= 1.5 ? C.amber : C.green,
    }));
  }, [data.byStage, stages, C]);

  return (
    <DrillVizFrame prefix={prefix} label="Complaint ratio tracking">
      <div className={`${prefix}-jx-ratio-head`}>
        <div className={`${prefix}-jx-ratio-kpi`}>
          <span className={`${prefix}-label`}>Complaint ratio</span>
          <div className={`${prefix}-jx-ratio-current`} style={{ color: data.trendUp ? C.red : C.green }}>
            {data.current}%
            <span className={data.trendUp ? `${prefix}-up` : `${prefix}-down`}>{data.delta}</span>
          </div>
        </div>
        <div className={`${prefix}-jx-ratio-meta`}>
          <span>
            Target <strong>{data.target}%</strong>
          </span>
          <span className={`${prefix}-jx-ratio-meta-dot`} aria-hidden>
            ·
          </span>
          <span>
            Prior <strong>{data.prior}%</strong>
          </span>
        </div>
      </div>

      <div className={`${prefix}-jx-ratio-chart`}>
        <ResponsiveContainer width="100%" height={128}>
          <LineChart data={data.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 4]}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={28}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              {...TIP}
              formatter={(v, name) => [
                `${v}%`,
                name === 'ratio' ? 'Complaint ratio' : 'Resolved within SLA',
              ]}
            />
            <ReferenceLine
              y={data.target}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: `Target ${data.target}%`, position: 'insideTopRight', fontSize: 8, fill: '#94a3b8' }}
            />
            <Line
              type="monotone"
              dataKey="ratio"
              name="ratio"
              stroke={C.red}
              strokeWidth={2.5}
              dot={{ r: 3, fill: C.red, stroke: '#fff', strokeWidth: 1.5 }}
            />
            <Line
              type="monotone"
              dataKey="resolved"
              name="resolved"
              stroke={C.green}
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={{ r: 2.5, fill: C.green, stroke: '#fff', strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={`${prefix}-jx-ratio-legend`} aria-label="Chart legend">
        <span className={`${prefix}-jx-ratio-legend-item`}>
          <span className={`${prefix}-jx-ratio-legend-dot`} style={{ background: C.red }} aria-hidden />
          Complaint ratio
        </span>
        <span className={`${prefix}-jx-ratio-legend-item`}>
          <span className={`${prefix}-jx-ratio-legend-line`} style={{ borderColor: C.green }} aria-hidden />
          Resolved within SLA
        </span>
      </div>

      <div className={`${prefix}-label ${prefix}-jx-ratio-stage-label`}>Ratio by NETC stage</div>
      <div className={`${prefix}-jx-ratio-stage-grid`}>
        {stageRows.map((r) => (
          <DrillMetricBar
            key={r.stageId}
            prefix={prefix}
            label={r.label}
            display={`${r.ratio}%`}
            delta={r.trend}
            deltaUp={!r.trendUp}
            pct={Math.min(100, r.ratio * 22)}
            color={r.color}
            trackHeight={6}
          />
        ))}
      </div>
    </DrillVizFrame>
  );
}

/** §3b — Contact mix by stage (donut — distinct from struggle bars) */
export function CxContactMixDonut({ prefix, stages }) {
  const slices = useMemo(
    () =>
      stages.map((s) => ({
        name: s.short,
        value: s.contacts,
        color: s.contacts >= 30 ? '#dc2626' : s.contacts >= 20 ? '#d97706' : '#2563eb',
        growth: s.worst ? `#${s.worst}` : undefined,
      })),
    [stages],
  );
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <DrillDonutMix
      prefix={prefix}
      slices={slices}
      centerMain={`${total}%`}
      centerSub="contact share"
    />
  );
}

/** §3b — Channel drop-off (where journeys abandon — different axis from stage) */
export function CxChannelDropoff({ prefix, rows }) {
  return (
    <DrillVizFrame prefix={prefix} label="Abandonment rate by channel">
      {rows.map((c) => (
        <DrillMetricBar
          key={c.ch}
          prefix={prefix}
          label={c.ch}
          display={`${c.drop}%`}
          pct={Math.min(100, c.drop * 2.2)}
          color={c.color}
          sub={c.note}
          trackHeight={8}
        />
      ))}
    </DrillVizFrame>
  );
}

/** §4 — Business impact KPIs + owner-tagged P0 actions (no duplicate struggle table) */
export function CxImpactAndActions({ prefix, C, impact, actions, struggles }) {
  const struggleById = useMemo(
    () => Object.fromEntries(struggles.map((s) => [s.id, s])),
    [struggles],
  );

  return (
    <div className={`${prefix}-jx-impact-actions`}>
      <div className={`${prefix}-jx-impact-grid`}>
        {impact.map((m) => (
          <div key={m.label} className={`${prefix}-jx-impact-cell`}>
            <div className={`${prefix}-label`}>{m.label}</div>
            <div className={`${prefix}-jx-impact-val`} style={{ color: m.color }}>
              {m.v}
            </div>
            <div className={`${prefix}-faint`} style={{ fontSize: 9.5, marginTop: 2 }}>
              {m.d}
            </div>
          </div>
        ))}
      </div>

      <div className={`${prefix}-label ${prefix}-jx-actions-label`}>P0 actions · owner-tagged</div>
      <div className={`${prefix}-jx-action-cards`}>
        {actions.map((a) => {
          const linked = struggleById[a.struggleId];
          return (
            <div key={a.id} className={`${prefix}-jx-action-card`}>
              <div className={`${prefix}-jx-action-head`}>
                <span
                  className={`${prefix}-badge`}
                  style={{
                    color: sevBadgeColor(C, a.sev),
                    background: `${sevBadgeColor(C, a.sev)}14`,
                    border: `1px solid ${sevBadgeColor(C, a.sev)}40`,
                  }}
                >
                  P{a.priority} · {a.sev}
                </span>
                <span className={`${prefix}-jx-action-gain`}>{a.gain}</span>
              </div>
              <div className={`${prefix}-jx-action-title`}>{a.title}</div>
              {linked ? (
                <div className={`${prefix}-faint ${prefix}-jx-action-link`}>
                  Linked · {linked.affected} · {linked.trend}
                </div>
              ) : null}
              <p className={`${prefix}-jx-action-fix`}>{a.fix}</p>
              <div className={`${prefix}-jx-action-owner`}>{a.owner}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

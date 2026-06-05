import React, { useId, useMemo, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { FastTagAiLogo } from '@/app/Indian_Process_Audit/_shared/FastTagAiLogo';

/** Hero sparkline — area fill, stroke, and W/M labels per point (matches gateway board). */
export function HeroTrendAreaChart({
  data,
  color = '#2563eb',
  labelMode = 'month',
  trendLabels,
  height = 68,
}) {
  const gradUid = useId().replace(/:/g, '');
  const chartData = useMemo(
    () =>
      data.map((v, i) => {
        if (trendLabels?.[i] != null && trendLabels[i] !== '') {
          return { w: trendLabels[i], v };
        }
        if (trendLabels && trendLabels[i] === '') {
          return { w: '', v };
        }
        return { w: `M${i + 1}`, v };
      }),
    [data, labelMode, trendLabels],
  );
  const domain = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const pad = Math.max(0.5, (max - min) * 0.12);
    return [Math.max(0, min - pad), max + pad];
  }, [data]);

  return (
    <div className="drill-hero-trend-chart" style={{ height, minHeight: height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`drill-grad-${gradUid}`} x1="0" y1="0" x2="0" y2="1">
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
            height={16}
            padding={{ left: 0, right: 4 }}
          />
          <YAxis hide domain={domain} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#drill-grad-${gradUid})`}
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

/** Inline note under a chart — keeps visuals, adds scan-friendly context */
export function ChartHint({ prefix, children, className = '' }) {
  return (
    <div className={`${prefix}-chart-hint ${className}`.trim()}>
      <span aria-hidden>→</span>
      {children}
    </div>
  );
}

/** Section title row: short insight line + optional right meta */
export function InsightSectionHead({ prefix, n, insight, right, accent, className = '', style = undefined }) {
  const color = accent ?? undefined;
  return (
    <div
      className={`${prefix}-row ${className}`.trim()}
      style={{ marginBottom: 8, ...style }}
    >
      <div className={`${prefix}-sechead`} style={{ margin: 0, flex: 1, minWidth: 0 }}>
        <span
          className="n"
          style={
            color
              ? { background: `${color}1f`, color }
              : undefined
          }
        >
          {n}
        </span>
        {insight ? <h3 className={`${prefix}-insight`}>{insight}</h3> : null}
      </div>
      {right}
    </div>
  );
}

/** Year · Quarter · Month · Weeks · Last-24 — sits before Back to board. */
export function DrillPeriodFilter({ prefix, value, onChange, options }) {
  return (
    <div className={`${prefix}-period-filter`} role="group" aria-label="Time period">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`${prefix}-period-btn${value === opt.id ? ' active' : ''}`}
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Breadcrumb + optional period filter + back control on one line */
export function DrillCrumbBar({ prefix, children, color, onBack, periodFilter }) {
  return (
    <div className={`${prefix}-crumb-row`}>
      <div className={`${prefix}-label ${prefix}-crumb`} style={color ? { color } : undefined}>
        {children}
      </div>
      <div className={`${prefix}-crumb-actions`}>
        {periodFilter}
        <button type="button" className={`${prefix}-back`} onClick={onBack}>
          ‹ Back to board
        </button>
      </div>
    </div>
  );
}

export const DRILL_GAP = 10;
export const DRILL_PAD = '12px 14px';

const HERO_TOPIC_TONE_ORDER = { positive: 0, negative: 1, critical: 2 };

/** Positives → Negative(s) → Critical — fixed left-to-right order. */
export function sortHeroTopicPanels(panels) {
  if (!panels?.length) return [];
  return [...panels].sort(
    (a, b) => (HERO_TOPIC_TONE_ORDER[a.tone] ?? 9) - (HERO_TOPIC_TONE_ORDER[b.tone] ?? 9),
  );
}

/**
 * Performance-style hero: title, 6 KPIs, score + trend, topic popovers, AI insights.
 */
export function DrillHero({
  prefix,
  title,
  subtitle,
  icon,
  headlineKpis,
  score,
  scoreDelta,
  scoreUp = true,
  scoreLabel,
  trendChart,
  trendHint,
  topicPanels,
  aiInsights,
  aiConfidence = 'IA read-out · 87% confidence',
}) {
  const [activeTopic, setActiveTopic] = useState(null);
  const sortedTopicPanels = sortHeroTopicPanels(topicPanels);
  const activePanel = sortedTopicPanels.find((p) => p.id === activeTopic);
  const scoreDeltaClass = scoreUp ? `${prefix}-hero-score-delta ${prefix}-up` : `${prefix}-hero-score-delta ${prefix}-down`;

  return (
    <div className={`${prefix}-panel ${prefix}-hero-panel`}>
      <div className={`${prefix}-hero-layout`}>
        <div className={`${prefix}-hero-title`}>
          <span className={`${prefix}-hero-icon`} aria-hidden>
            {icon}
          </span>
          <div>
            <div className={`${prefix}-hero-title-text`}>{title}</div>
            <div className={`${prefix}-label`}>{subtitle}</div>
          </div>
        </div>

        <div className={`${prefix}-hero-kpis`}>
          {headlineKpis.map((k) => (
            <div className={`${prefix}-kpi ${prefix}-kpi--${k.tone}`} key={k.label}>
              <div className={`${prefix}-label ${prefix}-kpi-label`}>{k.label}</div>
              <div className={`${prefix}-kpi-value-row`}>
                <div className="v" style={{ color: k.color }}>
                  {k.v}
                </div>
                <div className={k.deltaUp === false ? `${prefix}-down` : `${prefix}-up`}>{k.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={`${prefix}-hero-score-zone`}>
          <div className={`${prefix}-hero-score-stack`}>
            <div className={`${prefix}-hero-score-main`}>
              <div className={`${prefix}-hero-score-val`}>{score}</div>
            </div>
            <div className={scoreDeltaClass}>
              {scoreUp ? '▲' : '▼'} {scoreDelta}
            </div>
            <div className={`${prefix}-faint ${prefix}-hero-score-label`}>{scoreLabel}</div>
          </div>
          <div className={`${prefix}-hero-chart-col`}>
            <div className={`${prefix}-hero-chart-block`}>{trendChart}</div>
            {trendHint ? (
              <div className={`${prefix}-hero-chart-hint-wrap`}>
                <ChartHint prefix={prefix} className={`${prefix}-hero-hint`}>
                  {trendHint}
                </ChartHint>
              </div>
            ) : null}
          </div>
          {sortedTopicPanels.length ? (
            <div className={`${prefix}-hero-topic-wrap`}>
              <div className={`${prefix}-hero-topic-btns`} role="group" aria-label="Signal topics">
                {sortedTopicPanels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    className={`${prefix}-hero-topic-btn ${prefix}-hero-topic-btn-${panel.tone}${
                      activeTopic === panel.id ? ' active' : ''
                    }`}
                    aria-pressed={activeTopic === panel.id}
                    aria-expanded={activeTopic === panel.id}
                    aria-controls={activeTopic === panel.id ? `${prefix}-hero-topic-popover` : undefined}
                    onClick={() => setActiveTopic((prev) => (prev === panel.id ? null : panel.id))}
                  >
                    {panel.buttonLabel}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {aiInsights?.length ? (
          <div className={`${prefix}-hero-ai`} aria-label="AI Insights">
            <div className={`${prefix}-hero-ai-head`}>
              <span className={`${prefix}-label ${prefix}-hero-ai-title inline-flex items-center gap-1.5`}>
                <FastTagAiLogo />
                AI Insights
              </span>
              <span className={`${prefix}-faint`}>{aiConfidence}</span>
            </div>
            <div className={`${prefix}-hero-ai-grid`}>
              {aiInsights.map((block) => (
                <div key={block.label} className={`${prefix}-hero-ai-card ${block.tone}`}>
                  <b>{block.label}</b>
                  <p className={`${prefix}-hero-ai-copy`}>{block.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {activePanel ? (
        <>
          <button
            type="button"
            className={`${prefix}-hero-topic-backdrop`}
            aria-label="Close topic panel"
            onClick={() => setActiveTopic(null)}
          />
          <div
            id={`${prefix}-hero-topic-popover`}
            className={`${prefix}-hero-topic-popover ${prefix}-hero-topic-popover-${activePanel.tone}`}
            role="dialog"
            aria-labelledby={`${prefix}-hero-topic-popover-title`}
          >
            <div className={`${prefix}-hero-topic-popover-head`}>
              <h4 id={`${prefix}-hero-topic-popover-title`} className={`${prefix}-hero-topic-popover-title`}>
                {activePanel.title}
              </h4>
              <button
                type="button"
                className={`${prefix}-hero-topic-popover-close`}
                aria-label="Close"
                onClick={() => setActiveTopic(null)}
              >
                ×
              </button>
            </div>
            <ul className={`${prefix}-hero-topic-popover-list`}>
              {activePanel.items.map((item) => (
                <li key={item.label}>
                  <span className={`${prefix}-hero-topic-popover-label`}>{item.label}</span>
                  <span className={`${prefix}-hero-topic-popover-detail`}>{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Metric rows with track bars — no KPI cards */
export function MetricBarRows({ prefix, rows, maxVal, valueKey = 'val', labelKey = 'label', subKey, colorKey = 'color' }) {
  const peak = maxVal ?? Math.max(...rows.map((r) => r[valueKey]));
  return (
    <div className={`${prefix}-metric-rows`}>
      {rows.map((r, i) => (
        <div key={i} className={`${prefix}-metric-row`}>
          <div className={`${prefix}-row`} style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 11.5 }}>{r[labelKey]}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: r[colorKey] }}>
              {r.display ?? r[valueKey]}
              {r.delta ? (
                <span className={`${prefix}-up`} style={{ fontSize: 10, marginLeft: 6, fontWeight: 600 }}>
                  {r.delta}
                </span>
              ) : null}
            </span>
          </div>
          {subKey && r[subKey] ? (
            <div className={`${prefix}-faint`} style={{ fontSize: 9.5, marginBottom: 4, lineHeight: 1.3 }}>
              {r[subKey]}
            </div>
          ) : null}
          <div className={`${prefix}-track`}>
            <div
              className={`${prefix}-fill`}
              style={{ width: `${(r[valueKey] / peak) * 100}%`, background: r[colorKey] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

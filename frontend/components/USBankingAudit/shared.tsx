// @ts-nocheck
'use client';
/* eslint-disable react/display-name */

import React, { useState } from 'react';

const cls = (...c) => c.filter(Boolean).join(' ');

const fmtPct = (n, d = 1) => `${n.toFixed(d)}%`;
const fmtNum = (n) => n?.toLocaleString?.('en-US') ?? n;
const shortDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const shortDateTime = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// Map effectiveness/coverage/severity → semantic palette key
const semanticBand = (key) => {
  const map = {
    high: 'red', medium: 'amber', low: 'green',
    red: 'red', amber: 'amber', green: 'green',
    effective: 'green', effective_with_obs: 'amber',
    needs_improvement: 'red', ineffective: 'red',
    fully_covered: 'green', thinly_covered: 'amber', uncovered: 'red',
    worsening: 'red', stable: 'amber', improving: 'green',
    pass: 'green', exception: 'red', override: 'amber', pending: 'slate'
  };
  return map[key] || 'slate';
};

const TONE = {
  red:    { fg: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-950/40',       ring: 'ring-rose-200 dark:ring-rose-900/60',       solid: 'bg-rose-500',    softText: 'text-rose-700 dark:text-rose-300',    border: 'border-rose-200 dark:border-rose-900/60' },
  amber:  { fg: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/40',     ring: 'ring-amber-200 dark:ring-amber-900/60',     solid: 'bg-amber-500',   softText: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-900/60' },
  green:  { fg: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', ring: 'ring-emerald-200 dark:ring-emerald-900/60', solid: 'bg-emerald-500', softText: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/60' },
  slate:  { fg: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-900',         ring: 'ring-slate-200 dark:ring-slate-800',        solid: 'bg-slate-400',   softText: 'text-slate-700 dark:text-slate-300',   border: 'border-slate-200 dark:border-slate-800' }
};

const PERSONAS = {
  cro:       { id: 'cro',       label: 'CRO / CAO',                     short: 'CRO',  initials: 'CR',  defaultScreen: 'risk_posture_cockpit' },
  risk_lead: { id: 'risk_lead', label: 'Risk / Compliance Leadership',  short: 'Risk', initials: 'RL',  defaultScreen: 'control_universe' },
  auditor:   { id: 'auditor',   label: 'Compliance / Audit Manager',    short: 'Audit',initials: 'AM',  defaultScreen: 'evidence_workbench' }
};

const SCREENS = {
  risk_posture_cockpit:   { label: 'Risk Posture',          persona: 'cro' },
  what_changed:           { label: 'What Changed',          persona: 'cro' },
  control_universe:       { label: 'Control Health',        persona: 'risk_lead' },
  obligation_coverage:    { label: 'Obligation Coverage',   persona: 'risk_lead' },
  issue_intelligence:     { label: 'Issue Intelligence',    persona: 'risk_lead' },
  evidence_workbench:     { label: 'Evidence Workbench',    persona: 'auditor' },
  reperformance_console:  { label: 'Reperformance',         persona: 'auditor' }
};

// ────────────────────────────────────────────────────────────────────────────
// ICONS — inline SVG, sized by Tailwind class on parent
// ────────────────────────────────────────────────────────────────────────────

const I = (path, opts = {}) => (props) => (
  <svg
    viewBox="0 0 24 24"
    fill={opts.fill || 'none'}
    stroke="currentColor"
    strokeWidth={opts.sw || 1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cls('shrink-0', props.className || 'w-4 h-4')}
  >
    {path}
  </svg>
);

const Icons = {
  Search:    I(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  Bell:      I(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></>),
  Sun:       I(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>),
  Moon:      I(<><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" /></>),
  ChevRight: I(<path d="m9 18 6-6-6-6" />),
  ChevLeft:  I(<path d="m15 18-6-6 6-6" />),
  ChevDown:  I(<path d="m6 9 6 6 6-6" />),
  Close:     I(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
  Sparkles:  I(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></>),
  Shield:    I(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />),
  Doc:       I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>),
  Beaker:    I(<><path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3" /></>),
  Network:   I(<><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8 7l8 10M16 7 8 17" /></>),
  AlertTri:  I(<><path d="M12 3 2 21h20L12 3z" /><path d="M12 9v5M12 18h.01" /></>),
  CheckCirc: I(<><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>),
  Layers:    I(<><path d="m12 2 9 5-9 5-9-5 9-5z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>),
  Calendar:  I(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  Hash:      I(<><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></>),
  Filter:    I(<path d="M3 5h18l-7 8v6l-4-2v-4z" />),
  Globe:     I(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>),
  Activity:  I(<path d="M3 12h4l3-9 4 18 3-9h4" />),
  Arrow:     I(<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>),
  TrendUp:   I(<><path d="m3 17 6-6 4 4 8-8" /><path d="M14 7h7v7" /></>),
  TrendDown: I(<><path d="m3 7 6 6 4-4 8 8" /><path d="M14 17h7v-7" /></>),
  Plus:      I(<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  Play:      I(<path d="M6 4l14 8-14 8z" />, { fill: 'currentColor' })
};

// ────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ────────────────────────────────────────────────────────────────────────────

const Card = ({ className, children, padded = true, ...rest }) => (
  <div className={cls(
    'rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    padded && 'p-4',
    className
  )} {...rest}>
    {children}
  </div>
);

const SectionTitle = ({ children, sub, action }) => (
  <div className="flex items-end justify-between mb-3">
    <div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{children}</h3>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

const Mono = ({ children, className }) => (
  <span className={cls('font-mono text-[11px] tracking-tight', className)}>{children}</span>
);

const StatusBadge = ({ status, children, size = 'sm' }) => {
  const tone = TONE[semanticBand(status)] || TONE.slate;
  return (
    <span className={cls(
      'inline-flex items-center gap-1.5 rounded-md font-medium border',
      size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
      tone.bg, tone.fg, tone.border
    )}>
      <span className={cls('w-1.5 h-1.5 rounded-full', tone.solid)} />
      {children || status}
    </span>
  );
};

const BandPill = ({ band, value, label }) => {
  const tone = TONE[semanticBand(band)] || TONE.slate;
  return (
    <div className={cls('inline-flex items-center gap-2 rounded-md border px-2.5 py-1', tone.bg, tone.border)}>
      <span className={cls('w-2 h-2 rounded-full', tone.solid)} />
      {label && <span className="text-[11px] text-slate-600 dark:text-slate-400">{label}</span>}
      {value !== undefined && <Mono className={tone.fg}>{value}</Mono>}
    </div>
  );
};

const HashBadge = ({ verified, hash }) => (
  <span className={cls(
    'inline-flex items-center gap-1 rounded px-1.5 py-0.5 border text-[10px]',
    verified
      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300'
      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
  )}>
    <Icons.Hash className="w-3 h-3" />
    <Mono>{hash ? hash.slice(0, 8) : 'verified'}</Mono>
  </span>
);

const TrendIndicator = ({ trend, value }) => {
  if (trend === 'worsening') return <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs"><Icons.TrendUp className="w-3.5 h-3.5" /> {value}</span>;
  if (trend === 'improving') return <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs"><Icons.TrendDown className="w-3.5 h-3.5" /> {value}</span>;
  return <span className="inline-flex items-center gap-1 text-slate-500 text-xs">— {value}</span>;
};

const Confidence = ({ value }) => {
  const pct = Math.round(value * 100);
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
      <span className="relative w-8 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 bg-slate-700 dark:bg-slate-300" style={{ width: `${pct}%` }} />
      </span>
      <Mono>{pct}%</Mono>
    </span>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SPARKLINE / MICRO-VIZ
// ────────────────────────────────────────────────────────────────────────────

const Sparkline = ({ data, height = 32, stroke, fill, className }) => {
  if (!data || data.length === 0) return null;
  const w = 100, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = data[data.length - 1], lx = w, ly = h - ((last - min) / range) * (h - 4) - 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cls('w-full', className)} style={{ height }}>
      {fill && <polygon points={`0,${h} ${points} ${w},${h}`} className={fill} />}
      <polyline points={points} fill="none" strokeWidth="1.5" className={stroke || 'stroke-slate-700 dark:stroke-slate-300'} vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="2" className={stroke?.replace('stroke-', 'fill-') || 'fill-slate-700 dark:fill-slate-300'} />
    </svg>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// AI INSIGHT CARD
// ────────────────────────────────────────────────────────────────────────────

const AIInsightCard = ({ insight, onAct, onDrillEntity, dense = false }) => {
  const [expanded, setExpanded] = useState(false);
  const tone = TONE[semanticBand(insight.severity)] || TONE.slate;
  return (
    <div className={cls(
      'rounded-md border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors',
      dense ? 'p-3' : 'p-3.5'
    )}>
      <div className="flex items-start gap-2 mb-1.5">
        <div className={cls('w-1 self-stretch rounded-full', tone.solid)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
            <Icons.Sparkles className="w-3 h-3" />
            <span>{insight.type.replace(/_/g, ' ')}</span>
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">{insight.title}</div>
        </div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
        {insight.summary}
      </p>
      <div className="flex items-center justify-between gap-2">
        <Confidence value={insight.confidence} />
        <button
          className="text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline-offset-2 hover:underline"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? 'Hide' : 'Explain'}
        </button>
      </div>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          {insight.counterfactual && (
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              <span className="text-slate-500">Counterfactual: </span>{insight.counterfactual}
            </div>
          )}
          <div className="text-[10px] text-slate-500 dark:text-slate-500 flex items-center gap-1.5 flex-wrap">
            <span>Source: {insight.modelId} v{insight.modelVersion}</span>
            <span>·</span>
            <span>{insight.sourceRecordIds?.length || 0} records</span>
          </div>
          {insight.relatedEntityIds?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {insight.relatedEntityIds.slice(0, 4).map(eid => (
                <button
                  key={eid}
                  onClick={() => onDrillEntity?.(eid)}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {eid}
                </button>
              ))}
            </div>
          )}
          {onAct && (
            <button
              onClick={() => onAct(insight)}
              className="mt-1 text-[11px] font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded px-2 py-1 hover:bg-slate-700 dark:hover:bg-slate-200"
            >
              Take action
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// METRIC CARD
// ────────────────────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, band, trend, sub, sparkData, onClick }) => {
  const tone = band ? TONE[semanticBand(band)] : TONE.slate;
  return (
    <button
      onClick={onClick}
      className={cls(
        'group text-left rounded-lg border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
        'hover:border-slate-300 dark:hover:border-slate-700 transition-colors w-full'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">{label}</div>
        {band && <span className={cls('w-1.5 h-1.5 rounded-full', tone.solid)} />}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">{value}</div>
        {trend && <TrendIndicator trend={trend} />}
      </div>
      {sub && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{sub}</div>}
      {sparkData && (
        <div className="mt-2.5">
          <Sparkline data={sparkData} height={28} stroke={tone.fg.replace('text-', 'stroke-')} />
        </div>
      )}
    </button>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// HEATMAP GRID  (Risk Domain × Week)
// ────────────────────────────────────────────────────────────────────────────

const heatColor = (v) => {
  // 0..100 → green..amber..red
  if (v >= 70) return 'bg-rose-500/80 dark:bg-rose-500/70';
  if (v >= 60) return 'bg-rose-400/70 dark:bg-rose-500/55';
  if (v >= 50) return 'bg-amber-400/70 dark:bg-amber-500/60';
  if (v >= 40) return 'bg-amber-300/60 dark:bg-amber-500/40';
  if (v >= 30) return 'bg-emerald-300/60 dark:bg-emerald-500/40';
  return 'bg-emerald-400/60 dark:bg-emerald-500/30';
};

const HeatmapGrid = ({ rows, weeks, onCellClick }) => {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid" style={{ gridTemplateColumns: `160px repeat(${weeks}, minmax(28px, 1fr))` }}>
          <div />
          {Array.from({ length: weeks }).map((_, i) => (
            <div key={i} className="text-[10px] text-slate-500 dark:text-slate-500 text-center pb-1.5 font-mono">
              W-{weeks - 1 - i}
            </div>
          ))}
          {rows.map(row => (
            <React.Fragment key={row.id}>
              <button
                onClick={() => onCellClick?.(row.id, null)}
                className="text-left pr-3 py-1 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 truncate"
              >
                {row.label}
              </button>
              {row.values.map((v, i) => (
                <button
                  key={i}
                  onClick={() => onCellClick?.(row.id, i)}
                  className={cls(
                    'h-7 m-px rounded-sm transition-all hover:ring-2 hover:ring-slate-400 dark:hover:ring-slate-500',
                    heatColor(v)
                  )}
                  title={`${row.label} W-${weeks - 1 - i}: ${v.toFixed(0)}`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// TREEMAP — process-grouped controls; tile color = effectiveness band
// ────────────────────────────────────────────────────────────────────────────

const Treemap = ({ groups, onTileClick }) => {
  return (
    <div className="space-y-2">
      {groups.map(group => {
        const totalWeight = group.tiles.reduce((s, t) => s + t.weight, 0);
        return (
          <div key={group.id}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{group.label}</div>
              <div className="text-[10px] text-slate-500">{group.tiles.length} controls</div>
            </div>
            <div className="flex gap-1 h-16">
              {group.tiles.map(t => {
                const tone = TONE[semanticBand(t.band)] || TONE.slate;
                return (
                  <button
                    key={t.id}
                    onClick={() => onTileClick?.(t.id)}
                    style={{ flexBasis: `${(t.weight / totalWeight) * 100}%` }}
                    className={cls(
                      'group relative rounded border overflow-hidden text-left',
                      tone.bg, tone.border, 'hover:ring-2 hover:ring-offset-0', tone.ring,
                      'transition-all'
                    )}
                  >
                    <div className="p-2 flex flex-col h-full justify-between">
                      <div className={cls('text-[10px] font-mono', tone.fg)}>{t.id}</div>
                      <div className="flex items-end justify-between">
                        <div className={cls('text-[10px] truncate', tone.softText)}>{t.label}</div>
                        <Mono className={cls('font-semibold', tone.fg)}>{t.score}</Mono>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// CLUSTER BUBBLE — root cause clusters
// ────────────────────────────────────────────────────────────────────────────

const ClusterBubble = ({ clusters, selectedId, onSelect }) => {
  const sizes = clusters.map(c => c.issueIds.length);
  const maxSize = Math.max(...sizes);
  return (
    <div className="flex flex-wrap gap-3 items-center justify-center py-4 min-h-[180px]">
      {clusters.map(c => {
        const size = 60 + (c.issueIds.length / maxSize) * 90;
        const tone = TONE[c.severitySkew === 'high_skew' ? 'red' : c.severitySkew === 'medium_skew' ? 'amber' : 'green'] || TONE.slate;
        const selected = selectedId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect?.(c.id)}
            style={{ width: size, height: size }}
            className={cls(
              'rounded-full border-2 flex flex-col items-center justify-center text-center transition-all',
              tone.bg, tone.border,
              selected ? cls('ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900', tone.ring) : 'hover:scale-105'
            )}
          >
            <div className={cls('text-2xl font-semibold tabular-nums', tone.fg)}>{c.issueIds.length}</div>
            <div className={cls('text-[10px] font-medium px-2 leading-tight', tone.softText)}>{c.name}</div>
          </button>
        );
      })}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ────────────────────────────────────────────────────────────────────────────


export {
  cls,
  fmtPct,
  fmtNum,
  shortDate,
  shortDateTime,
  semanticBand,
  heatColor,
  TONE,
  PERSONAS,
  SCREENS,
  Icons,
  Card,
  SectionTitle,
  Mono,
  StatusBadge,
  BandPill,
  HashBadge,
  TrendIndicator,
  Confidence,
  Sparkline,
  AIInsightCard,
  MetricCard,
  HeatmapGrid,
  Treemap,
  ClusterBubble
};

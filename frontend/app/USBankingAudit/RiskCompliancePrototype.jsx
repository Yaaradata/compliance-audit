// ============================================================================
// RiskCompliancePrototype.jsx
// AI-Driven Risk & Compliance Platform — Single-file React + Tailwind prototype
// Drop alongside mockData.js. Uses default Tailwind classes only. No chart libs.
// ============================================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import mockData from '@/lib/usbankingaudit/mockData';

// ────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────────────────────────────────

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

export default function App() {
  // ── Theme ───────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(true);
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  // ── Core App State ──────────────────────────────────────────────────────
  const [activePersona, setActivePersona] = useState('cro');
  const [activeScreen, setActiveScreen] = useState('risk_posture_cockpit');
  const [drillStack, setDrillStack] = useState([]);
  const [activePanel, setActivePanel] = useState('none'); // 'drill' | 'lineage' | 'none'
  const [timeAsOf, setTimeAsOf] = useState('2026-04-25');
  const [jurisdiction, setJurisdiction] = useState('us');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [workpaperItems, setWorkpaperItems] = useState([]);

  // ── Indexes ─────────────────────────────────────────────────────────────
  const idx = useMemo(() => {
    const risksById = new Map(mockData.risks.map(r => [r.id, r]));
    const controlsById = new Map(mockData.controls.map(c => [c.id, c]));
    const obligationsById = new Map(mockData.obligations.map(o => [o.id, o]));
    const issuesById = new Map(mockData.issues.map(i => [i.id, i]));
    const clustersById = new Map(mockData.rootCauseClusters.map(c => [c.id, c]));
    const processesById = new Map(mockData.processes.map(p => [p.id, p]));
    const evidenceById = new Map(mockData.evidence.map(e => [e.id, e]));
    const ciById = new Map(mockData.controlInstances.map(ci => [ci.id, ci]));
    const ciByControl = new Map();
    mockData.controlInstances.forEach(ci => {
      if (!ciByControl.has(ci.controlId)) ciByControl.set(ci.controlId, []);
      ciByControl.get(ci.controlId).push(ci);
    });
    const issuesByControl = new Map();
    mockData.issues.forEach(i => i.relatedControlIds.forEach(cid => {
      if (!issuesByControl.has(cid)) issuesByControl.set(cid, []);
      issuesByControl.get(cid).push(i);
    }));
    const insightsByEntity = new Map();
    mockData.aiInsights.forEach(ins => (ins.relatedEntityIds || []).forEach(eid => {
      if (!insightsByEntity.has(eid)) insightsByEntity.set(eid, []);
      insightsByEntity.get(eid).push(ins);
    }));
    return { risksById, controlsById, obligationsById, issuesById, clustersById, processesById, evidenceById, ciById, ciByControl, issuesByControl, insightsByEntity };
  }, []);

  // ── Drill helpers ───────────────────────────────────────────────────────
  const drillTo = useCallback((entityType, entityId, opts = {}) => {
    setDrillStack(prev => [...prev, { entityType, entityId, screenContext: opts.screenContext || activeScreen, asOfDate: timeAsOf, panelType: opts.panelType || 'drill_panel' }]);
    setActivePanel(opts.panelType === 'lineage_panel' ? 'lineage' : 'drill');
  }, [activeScreen, timeAsOf]);

  const popDrill = useCallback(() => {
    setDrillStack(prev => {
      const next = prev.slice(0, -1);
      if (next.length === 0) setActivePanel('none');
      return next;
    });
  }, []);

  const clearDrill = useCallback(() => {
    setDrillStack([]);
    setActivePanel('none');
  }, []);

  const gotoFrame = useCallback((idx) => {
    setDrillStack(prev => prev.slice(0, idx + 1));
  }, []);

  const drillByEntityId = useCallback((entityId) => {
    if (!entityId) return;
    if (entityId.startsWith('R-')) drillTo('risk', entityId);
    else if (entityId.startsWith('OBL-')) drillTo('obligation', entityId);
    else if (entityId.startsWith('ISS-')) drillTo('issue', entityId);
    else if (entityId.startsWith('CLUSTER-')) drillTo('cluster', entityId);
    else if (entityId.startsWith('PROC-')) drillTo('process', entityId);
    else if (entityId.startsWith('EV-')) drillTo('evidence', entityId, { panelType: 'lineage_panel' });
    else if (entityId.startsWith('CI-')) drillTo('control_instance', entityId);
    else drillTo('control', entityId);
  }, [drillTo]);

  // ── Persona switch ──────────────────────────────────────────────────────
  const switchPersona = useCallback((personaId) => {
    setActivePersona(personaId);
    setActiveScreen(PERSONAS[personaId].defaultScreen);
    // drill stack persists across persona switch (the magic of cross-persona handoff)
  }, []);

  const switchScreen = useCallback((screenId) => {
    setActiveScreen(screenId);
    clearDrill();
  }, [clearDrill]);

  // ── Wokpaper tray (Auditor) ─────────────────────────────────────────────
  const toggleWorkpaper = useCallback((id) => {
    setWorkpaperItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  // ── App context bag (props drilling — kept simple for prototype) ────────
  const ctx = {
    idx, drillTo, popDrill, clearDrill, gotoFrame, drillByEntityId,
    activePersona, activeScreen, drillStack, activePanel, timeAsOf, jurisdiction,
    setActivePanel, switchScreen, switchPersona, setTimeAsOf, setJurisdiction,
    searchQuery, setSearchQuery, filters, setFilters,
    workpaperItems, toggleWorkpaper,
    dark, setDark
  };

  return (
    <div className={cls(
      'min-h-screen font-sans antialiased',
      'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100'
    )}>
      <AppShell ctx={ctx} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// APP SHELL
// ────────────────────────────────────────────────────────────────────────────

function AppShell({ ctx }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar ctx={ctx} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar ctx={ctx} />
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 overflow-y-auto p-5">
            <ScreenRouter ctx={ctx} />
          </main>
          <AIInsightRail ctx={ctx} />
        </div>
        <ActionDock ctx={ctx} />
      </div>
      {ctx.activePanel === 'drill' && <DrillDownPanel ctx={ctx} />}
      {ctx.activePanel === 'lineage' && <LineagePanel ctx={ctx} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ────────────────────────────────────────────────────────────────────────────

function Sidebar({ ctx }) {
  const navItems = useMemo(() => Object.entries(SCREENS).filter(([_, s]) => s.persona === ctx.activePersona), [ctx.activePersona]);
  const screenIcons = {
    risk_posture_cockpit: Icons.Shield, what_changed: Icons.Activity,
    control_universe: Icons.Layers, obligation_coverage: Icons.Network, issue_intelligence: Icons.AlertTri,
    evidence_workbench: Icons.Doc, reperformance_console: Icons.Beaker
  };
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
            <Icons.Shield className="w-4 h-4 text-white dark:text-slate-900" />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-tight">Sentry</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">Risk &amp; Compliance</div>
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500 px-2 mb-1.5">{PERSONAS[ctx.activePersona].label}</div>
        <nav className="space-y-0.5">
          {navItems.map(([id, s]) => {
            const Icon = screenIcons[id];
            const active = ctx.activeScreen === id;
            return (
              <button
                key={id}
                onClick={() => ctx.switchScreen(id)}
                className={cls(
                  'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[13px] transition-colors',
                  active
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon className="w-4 h-4" />
                {s.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-3 pb-4">
        <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Demo data</div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            13 weeks · 35 controls · {fmtNum(mockData.controlInstances.length)} instances · {fmtNum(mockData.auditTrail.length)} audit events
          </div>
        </div>
      </div>
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TOP BAR
// ────────────────────────────────────────────────────────────────────────────

function TopBar({ ctx }) {
  return (
    <header className="h-14 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 flex items-center gap-4">
      {/* Persona switcher */}
      <PersonaSwitcher ctx={ctx} />

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

      {/* Drill stack breadcrumb */}
      <DrillBreadcrumb ctx={ctx} />

      <div className="ml-auto flex items-center gap-2">
        {/* Time scrubber */}
        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-400 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Icons.Calendar className="w-3.5 h-3.5" />
          <span className="font-mono">{ctx.timeAsOf}</span>
        </div>

        {/* Jurisdiction */}
        <select
          value={ctx.jurisdiction}
          onChange={(e) => ctx.setJurisdiction(e.target.value)}
          className="text-[12px] text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
        >
          <option value="us">🇺🇸 US</option>
          <option value="multi">Multi-jurisdiction</option>
        </select>

        {/* Search */}
        <div className="relative">
          <Icons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={ctx.searchQuery}
            onChange={(e) => ctx.setSearchQuery(e.target.value)}
            placeholder="Search risks, controls, obligations…"
            className="pl-8 pr-3 py-1.5 w-72 text-[12px] rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => ctx.setDark(d => !d)}
          className="p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          aria-label="Toggle theme"
          title={ctx.dark ? 'Switch to light' : 'Switch to dark'}
        >
          {ctx.dark ? <Icons.Sun className="w-3.5 h-3.5" /> : <Icons.Moon className="w-3.5 h-3.5" />}
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-medium flex items-center justify-center">
            {PERSONAS[ctx.activePersona].initials}
          </div>
        </div>
      </div>
    </header>
  );
}

function PersonaSwitcher({ ctx }) {
  const [open, setOpen] = useState(false);
  const persona = PERSONAS[ctx.activePersona];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Acting as</span>
        <span className="font-medium">{persona.label}</span>
        <Icons.ChevDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-72 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-20 overflow-hidden">
            {Object.values(PERSONAS).map(p => (
              <button
                key={p.id}
                onClick={() => { ctx.switchPersona(p.id); setOpen(false); }}
                className={cls(
                  'w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800',
                  ctx.activePersona === p.id && 'bg-slate-50 dark:bg-slate-800'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-medium text-slate-700 dark:text-slate-300">{p.initials}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{p.label}</div>
                  <div className="text-[11px] text-slate-500">Default screen: {SCREENS[p.defaultScreen].label}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DrillBreadcrumb({ ctx }) {
  if (ctx.drillStack.length === 0) {
    return <div className="text-[12px] text-slate-500 dark:text-slate-500">{SCREENS[ctx.activeScreen].label}</div>;
  }
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-400 min-w-0 overflow-hidden">
      <button onClick={ctx.clearDrill} className="hover:text-slate-900 dark:hover:text-slate-100">{SCREENS[ctx.activeScreen].label}</button>
      {ctx.drillStack.map((f, i) => (
        <React.Fragment key={i}>
          <Icons.ChevRight className="w-3 h-3 text-slate-400" />
          <button
            onClick={() => ctx.gotoFrame(i)}
            className="hover:text-slate-900 dark:hover:text-slate-100 truncate max-w-[180px]"
          >
            <Mono>{f.entityId}</Mono>
          </button>
        </React.Fragment>
      ))}
      <button
        onClick={ctx.clearDrill}
        className="ml-2 text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        clear
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// AI INSIGHT RAIL (right side, persona-tuned)
// ────────────────────────────────────────────────────────────────────────────

function AIInsightRail({ ctx }) {
  const insights = useMemo(() => {
    return mockData.aiInsights
      .filter(i => i.personaRelevance?.includes(ctx.activePersona))
      .sort((a, b) => {
        const sevOrder = { high: 0, medium: 1, low: 2 };
        return (sevOrder[a.severity] - sevOrder[b.severity]) || (b.confidence - a.confidence);
      })
      .slice(0, 8);
  }, [ctx.activePersona]);

  return (
    <aside className="w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center">
            <Icons.Sparkles className="w-3.5 h-3.5 text-white dark:text-slate-900" />
          </div>
          <div>
            <div className="text-[12px] font-semibold tracking-tight">AI Insights</div>
            <div className="text-[10px] text-slate-500">Tuned for {PERSONAS[ctx.activePersona].short}</div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900">{insights.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {insights.map(ins => (
          <AIInsightCard key={ins.id} insight={ins} onDrillEntity={ctx.drillByEntityId} dense />
        ))}
      </div>
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
        Models monitored. Last refresh: {shortDateTime(mockData.aiInsights[0].generatedAt)}
      </div>
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ACTION DOCK
// ────────────────────────────────────────────────────────────────────────────

function ActionDock({ ctx }) {
  const actions = useMemo(() => {
    if (ctx.activePersona === 'cro') {
      return [
        { tone: 'red',    label: 'AML appetite breached',          sub: 'RES 78 · 96% breach probability', screen: 'risk_posture_cockpit', drillId: 'R-FC-AML' },
        { tone: 'red',    label: '5 model re-validations past due', sub: 'Model Risk projected to breach',  screen: 'risk_posture_cockpit', drillId: 'R-MR-VAL' },
        { tone: 'amber',  label: 'Capacity cluster recommended',     sub: 'Surge playbook · 4/5 historical success', screen: 'issue_intelligence', drillId: 'CLUSTER-CAPACITY' }
      ];
    }
    if (ctx.activePersona === 'risk_lead') {
      return [
        { tone: 'red',   label: 'AML-C002 in Needs Improvement',  sub: 'CES 64 · Evidence completeness 58', screen: 'control_universe', drillId: 'AML-C002' },
        { tone: 'amber', label: 'Thinly covered: OBL-OCC-2023-17-005', sub: '1 weak control mapped', screen: 'obligation_coverage', drillId: 'OBL-OCC-2023-17-005' },
        { tone: 'amber', label: 'Capacity cluster: 5 issues',     sub: 'AML + Model Risk overlap', screen: 'issue_intelligence', drillId: 'CLUSTER-CAPACITY' }
      ];
    }
    return [
      { tone: 'amber', label: '14 wire callbacks missing fields',  sub: 'Pod B · Tue/Wed afternoons', screen: 'evidence_workbench', drillId: 'WP-C003' },
      { tone: 'amber', label: 'Reperform AML-C002 sample',          sub: 'Population test ready',     screen: 'reperformance_console', drillId: 'AML-C002' },
      { tone: 'green', label: 'Workpaper export ready',             sub: `${ctx.workpaperItems.length} items basket`, screen: 'evidence_workbench' }
    ];
  }, [ctx.activePersona, ctx.workpaperItems.length]);

  return (
    <div className="h-12 shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 flex items-center gap-3 overflow-x-auto">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 shrink-0">Action dock</span>
      {actions.map((a, i) => {
        const tone = TONE[a.tone];
        return (
          <button
            key={i}
            onClick={() => { if (a.screen) ctx.switchScreen(a.screen); if (a.drillId) setTimeout(() => ctx.drillByEntityId(a.drillId), 50); }}
            className={cls(
              'flex items-center gap-2 px-2.5 py-1.5 rounded border shrink-0 transition-colors',
              tone.bg, tone.border, 'hover:ring-1', tone.ring
            )}
          >
            <span className={cls('w-1.5 h-1.5 rounded-full', tone.solid)} />
            <span className={cls('text-[11px] font-medium', tone.softText)}>{a.label}</span>
            <span className="text-[10px] text-slate-500">· {a.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN ROUTER
// ────────────────────────────────────────────────────────────────────────────

function ScreenRouter({ ctx }) {
  switch (ctx.activeScreen) {
    case 'risk_posture_cockpit':  return <RiskPostureCockpit ctx={ctx} />;
    case 'what_changed':          return <WhatChangedView ctx={ctx} />;
    case 'control_universe':      return <ControlUniverse ctx={ctx} />;
    case 'obligation_coverage':   return <ObligationCoverageMap ctx={ctx} />;
    case 'issue_intelligence':    return <IssueIntelligence ctx={ctx} />;
    case 'evidence_workbench':    return <EvidenceWorkbench ctx={ctx} />;
    case 'reperformance_console': return <ReperformanceConsole ctx={ctx} />;
    default:                      return null;
  }
}

const ScreenHeader = ({ title, sub, action }) => (
  <div className="flex items-end justify-between mb-5">
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
      {sub && <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// 1. RISK POSTURE COCKPIT
// ────────────────────────────────────────────────────────────────────────────

function RiskPostureCockpit({ ctx }) {
  // Domain heatmap synth: avg exposure per domain across 13 weeks
  const heatmapRows = useMemo(() => {
    const domains = ['financial_crime', 'operational', 'model', 'compliance_conduct', 'third_party'];
    const labels = { financial_crime: 'Financial Crime', operational: 'Operational', model: 'Model Risk', compliance_conduct: 'Compliance & Conduct', third_party: 'Third Party' };
    return domains.map(d => {
      const drisks = mockData.risks.filter(r => r.domain === d);
      const avg = drisks.reduce((s, r) => s + r.exposureScore, 0) / Math.max(drisks.length, 1);
      const worsening = drisks.filter(r => r.trend === 'worsening').length / Math.max(drisks.length, 1);
      const values = [];
      for (let w = 12; w >= 0; w--) {
        const baseline = avg - (worsening * 18);
        const drift = worsening * (12 - w) * 1.6;
        const noise = Math.sin(w * 0.7 + drisks.length) * 3.5;
        values.push(Math.max(20, Math.min(95, baseline + drift + noise)));
      }
      return { id: d, label: labels[d], values };
    });
  }, []);

  // Enterprise RES = avg exposure across all risks (current vs 12 weeks ago)
  const resCurrent = useMemo(() => Math.round(mockData.risks.reduce((s, r) => s + r.exposureScore, 0) / mockData.risks.length), []);
  const resTrend = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => {
      const w = 12 - i;
      const worseningCount = mockData.risks.filter(r => r.trend === 'worsening').length;
      const drift = (worseningCount / mockData.risks.length) * (12 - w) * 1.4;
      return resCurrent - 7 + drift + Math.sin(w) * 1.5;
    });
  }, [resCurrent]);

  const topRisks = useMemo(() => [...mockData.risks].sort((a, b) => b.exposureScore - a.exposureScore).slice(0, 6), []);

  return (
    <div className="space-y-5">
      <ScreenHeader
        title="Risk Posture Cockpit"
        sub="Enterprise residual exposure across 5 domains · 13-week window"
        action={
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Last refresh</span>
            <Mono className="text-slate-700 dark:text-slate-300">{shortDateTime(mockData.aiInsights[0].generatedAt)}</Mono>
          </div>
        }
      />

      {/* Hero banner */}
      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-12 gap-0">
          <div className="col-span-4 p-6 border-r border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Enterprise Risk Exposure</div>
            <div className="flex items-baseline gap-3">
              <div className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">{resCurrent}</div>
              <BandPill band={resCurrent >= 70 ? 'red' : resCurrent >= 50 ? 'amber' : 'green'} value={resCurrent >= 70 ? 'Red' : resCurrent >= 50 ? 'Amber' : 'Green'} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-[12px]">
              <TrendIndicator trend="worsening" value="+6 this week" />
              <span className="text-slate-500">·</span>
              <span className="text-slate-500">vs 4-week avg 53</span>
            </div>
          </div>
          <div className="col-span-5 p-6 border-r border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">90-Day Trend (RES)</div>
            <Sparkline data={resTrend} height={64} stroke="stroke-rose-500" />
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
              <span>13 wks ago · 51</span>
              <span>Now · {resCurrent}</span>
            </div>
          </div>
          <div className="col-span-3 p-6 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Active alerts</div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-600 dark:text-slate-400">Appetite breaches</span>
              <span className={cls('font-medium', TONE.red.fg)}>3</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-600 dark:text-slate-400">High issues</span>
              <span className={cls('font-medium', TONE.red.fg)}>{mockData.issues.filter(i => i.severity === 'high').length}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-600 dark:text-slate-400">Insights this week</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{mockData.aiInsights.length}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Heatmap */}
      <Card>
        <SectionTitle sub="Hover for value · click a domain or cell to drill">Risk Domain Heatmap</SectionTitle>
        <HeatmapGrid
          rows={heatmapRows}
          weeks={13}
          onCellClick={(domainId) => {
            // Drill to first risk in that domain
            const r = mockData.risks.find(r => r.domain === domainId);
            if (r) ctx.drillTo('risk', r.id);
          }}
        />
        <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500">
          <span>Scale</span>
          {[20, 35, 50, 65, 80].map(v => (
            <div key={v} className="flex items-center gap-1">
              <span className={cls('w-3 h-3 rounded-sm', heatColor(v))} />
              <span>{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top risks + Appetite strip */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-8">
          <SectionTitle sub="Sorted by current exposure">Top Risks</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {topRisks.map(r => (
              <button
                key={r.id}
                onClick={() => ctx.drillTo('risk', r.id)}
                className="text-left p-3 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <Mono className="text-slate-500">{r.id}</Mono>
                  <StatusBadge status={r.residualRating}>{r.residualRating}</StatusBadge>
                </div>
                <div className="text-[12px] font-medium text-slate-900 dark:text-slate-100 leading-snug">{r.name}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-semibold tabular-nums">{r.exposureScore}</span>
                    <TrendIndicator trend={r.trend} />
                  </div>
                  <Icons.ChevRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-4">
          <SectionTitle sub="Defined tolerances">Appetite Strip</SectionTitle>
          <div className="space-y-2">
            {[
              { id: 'APP-FC-002', label: 'AML alert backlog',     value: '6.4%',  band: 'red'   },
              { id: 'APP-MR-001', label: 'Past-due re-validations', value: '5',     band: 'red'   },
              { id: 'APP-MR-002', label: 'Open high-sev MRM',      value: '17',    band: 'red'   },
              { id: 'APP-OP-002', label: 'Aged nostro recon',      value: '$140K', band: 'amber' },
              { id: 'APP-CC-001', label: 'Pricing exception ratio',value: '1.35',  band: 'amber' },
              { id: 'APP-OP-001', label: 'Wire op-loss / wire',    value: '0.02%', band: 'green' }
            ].map(m => {
              const tone = TONE[m.band];
              return (
                <div key={m.id} className="flex items-center justify-between gap-2 py-1.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cls('w-1.5 h-1.5 rounded-full shrink-0', tone.solid)} />
                    <span className="text-[12px] text-slate-700 dark:text-slate-300 truncate">{m.label}</span>
                  </div>
                  <Mono className={cls('shrink-0', tone.fg)}>{m.value}</Mono>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2. WHAT CHANGED THIS WEEK
// ────────────────────────────────────────────────────────────────────────────

function WhatChangedView({ ctx }) {
  const narrative = mockData.aiInsights.find(i => i.type === 'what_changed' && i.title.includes('2026-04-19')) || mockData.aiInsights.find(i => i.type === 'what_changed');
  const anomalies = mockData.aiInsights.filter(i => i.type === 'anomaly');
  const movers = [
    { id: 'R-FC-AML', label: 'AML Disposition Risk', from: 69, to: 78, trend: 'worsening', driver: 'Backlog crossed 5% appetite Tuesday' },
    { id: 'R-MR-VAL', label: 'Model Validation Risk', from: 64, to: 72, trend: 'worsening', driver: '5 re-validations past due' },
    { id: 'R-FC-OFAC', label: 'OFAC Sanctions Risk', from: 52, to: 52, trend: 'stable', driver: 'No screening hits this week' },
    { id: 'R-FC-FRAUD', label: 'Wire Fraud Risk',     from: 56, to: 58, trend: 'worsening', driver: 'Callback evidence gaps surfaced' }
  ];

  return (
    <div className="space-y-5">
      <ScreenHeader title="What Changed This Week" sub="AI-generated narrative grounded in source records" />

      {/* Narrative */}
      {narrative && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 mb-2">
              <Icons.Sparkles className="w-3 h-3" />
              <span>Weekly Narrative · {shortDate(narrative.generatedAt)}</span>
              <Confidence value={narrative.confidence} />
            </div>
            <h2 className="text-base font-semibold tracking-tight mb-2">{narrative.title}</h2>
            <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{narrative.summary}</p>
          </div>
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Source records</div>
            <div className="flex flex-wrap gap-1.5">
              {narrative.sourceRecordIds.map(id => (
                <button
                  key={id}
                  onClick={() => ctx.drillByEntityId(id)}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Top movers */}
      <Card>
        <SectionTitle sub="Largest week-over-week deltas">Top Movers</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {movers.map(m => {
            const delta = m.to - m.from;
            const tone = TONE[m.trend === 'worsening' ? 'red' : m.trend === 'improving' ? 'green' : 'slate'];
            return (
              <button
                key={m.id}
                onClick={() => ctx.drillTo('risk', m.id)}
                className="text-left p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <Mono className="text-slate-500">{m.id}</Mono>
                    <div className="text-[13px] font-medium mt-0.5">{m.label}</div>
                  </div>
                  <div className={cls('text-sm font-semibold', tone.fg)}>{delta > 0 ? '+' : ''}{delta}</div>
                </div>
                {/* mock delta bar */}
                <div className="relative h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <span className="absolute inset-y-0 left-0 bg-slate-300 dark:bg-slate-700" style={{ width: `${m.from}%` }} />
                  <span className={cls('absolute inset-y-0', tone.solid)} style={{ left: `${Math.min(m.from, m.to)}%`, width: `${Math.abs(m.to - m.from)}%` }} />
                </div>
                <div className="text-[11px] text-slate-500 mt-2">{m.driver}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Anomaly cards */}
      <div>
        <SectionTitle sub="Patterns flagged outside expected envelope">Anomalies Detected</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {anomalies.slice(0, 3).map(a => (
            <AIInsightCard key={a.id} insight={a} onDrillEntity={ctx.drillByEntityId} />
          ))}
        </div>
      </div>

      {/* Delta timeline */}
      <Card>
        <SectionTitle sub="Click an event to drill">Event Timeline · last 13 weeks</SectionTitle>
        <div className="space-y-1.5">
          {[
            { w: 11, label: 'AML alert backlog crossed 5% appetite', tone: 'red',   id: 'APP-FC-002' },
            { w: 8,  label: 'Past-due model re-validations crossed tolerance', tone: 'red', id: 'APP-MR-001' },
            { w: 6,  label: 'Open high-sev MRM findings reached 17', tone: 'red',   id: 'APP-MR-002' },
            { w: 7,  label: 'Aged nostro reconciling items entered amber', tone: 'amber', id: 'APP-OP-002' },
            { w: 5,  label: 'Pricing exception disparity entered amber', tone: 'amber', id: 'APP-CC-001' },
            { w: 4,  label: 'HMDA Q1 validation error rate above tolerance', tone: 'amber', id: 'ISS-2026-046' },
            { w: 0,  label: 'Capacity cluster identified across 5 issues', tone: 'red', id: 'CLUSTER-CAPACITY' }
          ].sort((a, b) => b.w - a.w).map((e, i) => {
            const tone = TONE[e.tone];
            return (
              <button
                key={i}
                onClick={() => ctx.drillByEntityId(e.id)}
                className="w-full grid grid-cols-12 items-center gap-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded px-2 -mx-2 transition-colors"
              >
                <div className="col-span-1 text-[10px] font-mono text-slate-500">W-{e.w}</div>
                <div className="col-span-1"><span className={cls('w-2 h-2 rounded-full inline-block', tone.solid)} /></div>
                <div className="col-span-9 text-[12px] text-slate-700 dark:text-slate-300 text-left truncate">{e.label}</div>
                <div className="col-span-1 text-right"><Mono className="text-slate-500">{e.id}</Mono></div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 3. CONTROL HEALTH UNIVERSE
// ────────────────────────────────────────────────────────────────────────────

function ControlUniverse({ ctx }) {
  const [processFilter, setProcessFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');

  const filteredControls = useMemo(() => {
    return mockData.controls.filter(c => {
      if (processFilter !== 'all' && c.processId !== processFilter) return false;
      if (bandFilter !== 'all' && c.effectivenessBand !== bandFilter) return false;
      return true;
    });
  }, [processFilter, bandFilter]);

  const treemapGroups = useMemo(() => {
    const byProcess = new Map();
    filteredControls.forEach(c => {
      if (!byProcess.has(c.processId)) byProcess.set(c.processId, []);
      byProcess.get(c.processId).push(c);
    });
    return Array.from(byProcess.entries()).map(([pid, ctrls]) => ({
      id: pid,
      label: idxFindProc(pid),
      tiles: ctrls.map(c => ({
        id: c.id,
        label: c.name,
        weight: 1 + (mockData.controlInstances.filter(ci => ci.controlId === c.id).length / 100),
        band: c.effectivenessBand,
        score: c.effectivenessScore
      }))
    }));
  }, [filteredControls]);

  const driftWatch = useMemo(() => mockData.controls.filter(c => c.effectivenessTrend === 'worsening').sort((a, b) => a.effectivenessScore - b.effectivenessScore).slice(0, 5), []);

  return (
    <div className="space-y-5">
      <ScreenHeader
        title="Control Health Universe"
        sub={`${filteredControls.length} of ${mockData.controls.length} controls visible`}
      />

      {/* Filter bar */}
      <Card padded={false}>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Icons.Filter className="w-3.5 h-3.5 text-slate-400" />
          <select value={processFilter} onChange={(e) => setProcessFilter(e.target.value)} className="text-[12px] bg-transparent border-none outline-none text-slate-700 dark:text-slate-300">
            <option value="all">All processes</option>
            {mockData.processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <select value={bandFilter} onChange={(e) => setBandFilter(e.target.value)} className="text-[12px] bg-transparent border-none outline-none text-slate-700 dark:text-slate-300">
            <option value="all">All effectiveness</option>
            <option value="effective">Effective</option>
            <option value="effective_with_obs">Effective with obs</option>
            <option value="needs_improvement">Needs improvement</option>
            <option value="ineffective">Ineffective</option>
          </select>
          <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
            {['effective', 'effective_with_obs', 'needs_improvement'].map(b => (
              <div key={b} className="flex items-center gap-1.5">
                <span className={cls('w-2 h-2 rounded-full', TONE[semanticBand(b)].solid)} />
                <span>{b.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-5">
        {/* Treemap */}
        <Card className="col-span-8">
          <SectionTitle sub="Grouped by process · sized by activity volume · colored by effectiveness band">Control Universe</SectionTitle>
          <Treemap groups={treemapGroups} onTileClick={(id) => ctx.drillTo('control', id)} />
        </Card>

        {/* Drift watch */}
        <Card className="col-span-4">
          <SectionTitle sub="Worsening trend">Drift Watch</SectionTitle>
          <div className="space-y-2">
            {driftWatch.map(c => {
              const tone = TONE[semanticBand(c.effectivenessBand)];
              return (
                <button
                  key={c.id}
                  onClick={() => ctx.drillTo('control', c.id)}
                  className="w-full text-left p-2.5 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Mono className="text-slate-500">{c.id}</Mono>
                    <div className="flex items-center gap-1.5">
                      <span className={cls('text-sm font-semibold tabular-nums', tone.fg)}>{c.effectivenessScore}</span>
                      <TrendIndicator trend="worsening" />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">{c.name}</div>
                  <div className="mt-1.5 grid grid-cols-3 gap-1 text-[10px]">
                    <div>
                      <div className="text-slate-500">Op rate</div>
                      <Mono>{c.cesDecomposition.operatingRate}%</Mono>
                    </div>
                    <div>
                      <div className="text-slate-500">Catch</div>
                      <Mono>{c.cesDecomposition.catchRate}%</Mono>
                    </div>
                    <div>
                      <div className="text-slate-500">Evidence</div>
                      <Mono className={c.cesDecomposition.evidenceCompleteness < 70 ? TONE.red.fg : ''}>{c.cesDecomposition.evidenceCompleteness}%</Mono>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Test calendar placeholder */}
      <Card>
        <SectionTitle sub="Upcoming reperformance & QA cycles">Test Calendar</SectionTitle>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }).map((_, m) => {
            const tests = m === 1 ? 4 : m === 4 ? 6 : m === 7 ? 3 : m === 10 ? 5 : (m % 3 === 0 ? 2 : 1);
            const tone = tests >= 5 ? TONE.amber : tests >= 3 ? TONE.slate : TONE.green;
            return (
              <div key={m} className={cls('rounded p-2 border', tone.bg, tone.border)}>
                <div className="text-[10px] text-slate-500 mb-1">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m]}</div>
                <div className={cls('text-base font-semibold tabular-nums', tone.fg)}>{tests}</div>
                <div className="text-[10px] text-slate-500">tests</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

const idxFindProc = (id) => mockData.processes.find(p => p.id === id)?.name || id;

// ────────────────────────────────────────────────────────────────────────────
// 4. OBLIGATION COVERAGE MAP
// ────────────────────────────────────────────────────────────────────────────

function ObligationCoverageMap({ ctx }) {
  const stats = useMemo(() => {
    const total = mockData.obligations.length;
    const fully = mockData.obligations.filter(o => o.coverageStatus === 'fully_covered').length;
    const thin = mockData.obligations.filter(o => o.coverageStatus === 'thinly_covered').length;
    const uncov = mockData.obligations.filter(o => o.coverageStatus === 'uncovered').length;
    return { total, fully, thin, uncov, fullyPct: (fully / total) * 100, thinPct: (thin / total) * 100, uncovPct: (uncov / total) * 100 };
  }, []);

  const thinObligations = useMemo(() => mockData.obligations.filter(o => o.coverageStatus === 'thinly_covered').sort((a, b) => a.coverageScore - b.coverageScore), []);

  return (
    <div className="space-y-5">
      <ScreenHeader title="Obligation Coverage Map" sub={`${mockData.obligations.length} obligations · ${mockData.regulations.length} regulations · ${mockData.controls.length} mapped controls`} />

      {/* Reg change banner */}
      <Card className={cls('border-l-4 !border-l-amber-500', TONE.amber.bg)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icons.AlertTri className={cls('w-4 h-4 mt-0.5', TONE.amber.fg)} />
            <div>
              <div className="text-[12px] font-semibold">Draft impact: hypothetical OCC TPRM enhancement</div>
              <div className="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5">
                Lineage trace: <Mono className="text-slate-700 dark:text-slate-300">OBL-OCC-2023-17-005</Mono> → 1 control (VO-C005) → 12 vendor relationships affected. Coverage gap exposed.
              </div>
            </div>
          </div>
          <button
            onClick={() => ctx.drillTo('obligation', 'OBL-OCC-2023-17-005')}
            className="text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:underline shrink-0 ml-3"
          >
            Open lineage →
          </button>
        </div>
      </Card>

      {/* Coverage health strip */}
      <Card>
        <SectionTitle sub="Aggregate coverage status">Coverage Health</SectionTitle>
        <div className="flex h-8 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800">
          <div style={{ width: `${stats.fullyPct}%` }} className="bg-emerald-500/80 flex items-center justify-center text-[11px] font-medium text-white">
            {stats.fully} fully
          </div>
          <div style={{ width: `${stats.thinPct}%` }} className="bg-amber-500/80 flex items-center justify-center text-[11px] font-medium text-white">
            {stats.thin} thin
          </div>
          {stats.uncov > 0 && (
            <div style={{ width: `${stats.uncovPct}%` }} className="bg-rose-500/80 flex items-center justify-center text-[11px] font-medium text-white">
              {stats.uncov} uncov
            </div>
          )}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-[11px]">
          <div className="flex items-center justify-between"><span className="text-slate-500">Fully covered</span><Mono className={TONE.green.fg}>{fmtPct(stats.fullyPct, 0)}</Mono></div>
          <div className="flex items-center justify-between"><span className="text-slate-500">Thinly covered</span><Mono className={TONE.amber.fg}>{fmtPct(stats.thinPct, 0)}</Mono></div>
          <div className="flex items-center justify-between"><span className="text-slate-500">Uncovered</span><Mono className={TONE.red.fg}>{fmtPct(stats.uncovPct, 0)}</Mono></div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-5">
        {/* Bipartite-ish list view */}
        <Card className="col-span-8">
          <SectionTitle sub="Each row maps obligation → mitigating controls">Obligation–Control Map</SectionTitle>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockData.obligations.slice(0, 12).map(o => {
              const tone = TONE[semanticBand(o.coverageStatus)];
              return (
                <div key={o.id} className="grid grid-cols-12 gap-3 py-2.5 items-center">
                  <button onClick={() => ctx.drillTo('obligation', o.id)} className="col-span-5 text-left">
                    <Mono className="text-slate-500">{o.id}</Mono>
                    <div className="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">{o.requirementText}</div>
                  </button>
                  <div className="col-span-1 text-center">
                    <Icons.Arrow className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 inline" />
                  </div>
                  <div className="col-span-5 flex flex-wrap gap-1">
                    {o.linkedControlIds.map(cid => {
                      const c = ctx.idx.controlsById.get(cid);
                      const ctone = TONE[semanticBand(c?.effectivenessBand)];
                      return (
                        <button
                          key={cid}
                          onClick={() => ctx.drillTo('control', cid)}
                          className={cls('text-[10px] font-mono px-1.5 py-0.5 rounded border', ctone.bg, ctone.border, ctone.fg, 'hover:ring-1', ctone.ring)}
                          title={c?.name}
                        >
                          {cid}
                        </button>
                      );
                    })}
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <BandPill band={o.coverageStatus} value={o.coverageScore} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Thinly covered panel */}
        <Card className="col-span-4">
          <SectionTitle sub="Single weak control or score < 70">Thinly Covered</SectionTitle>
          <div className="space-y-2">
            {thinObligations.map(o => (
              <button
                key={o.id}
                onClick={() => ctx.drillTo('obligation', o.id)}
                className={cls('w-full text-left p-2.5 rounded-md border', TONE.amber.bg, TONE.amber.border, 'hover:ring-1', TONE.amber.ring)}
              >
                <div className="flex items-center justify-between mb-1">
                  <Mono className={TONE.amber.fg}>{o.id}</Mono>
                  <Mono className={TONE.amber.fg}>{o.coverageScore}</Mono>
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">{o.requirementText}</div>
                <div className="mt-1.5 text-[10px] text-slate-500">
                  {o.linkedControlIds.length} control{o.linkedControlIds.length !== 1 && 's'} · {o.citation}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5. ISSUE INTELLIGENCE
// ────────────────────────────────────────────────────────────────────────────

function IssueIntelligence({ ctx }) {
  const [selectedClusterId, setSelectedClusterId] = useState('CLUSTER-CAPACITY');
  const cluster = ctx.idx.clustersById.get(selectedClusterId);
  const clusterIssues = useMemo(() => cluster ? cluster.issueIds.map(id => ctx.idx.issuesById.get(id)).filter(Boolean) : [], [cluster, ctx.idx]);

  const agingBuckets = useMemo(() => {
    const buckets = { '0-30': [], '31-60': [], '61-90': [], '90+': [] };
    mockData.issues.forEach(i => {
      if (i.daysOpen <= 30) buckets['0-30'].push(i);
      else if (i.daysOpen <= 60) buckets['31-60'].push(i);
      else if (i.daysOpen <= 90) buckets['61-90'].push(i);
      else buckets['90+'].push(i);
    });
    return buckets;
  }, []);

  return (
    <div className="space-y-5">
      <ScreenHeader title="Issue Intelligence" sub={`${mockData.issues.length} open issues · ${mockData.rootCauseClusters.length} clusters detected`} />

      <div className="grid grid-cols-12 gap-5">
        {/* Cluster bubbles */}
        <Card className="col-span-8">
          <SectionTitle sub="Sized by issue count · colored by severity skew">Root Cause Clusters</SectionTitle>
          <ClusterBubble clusters={mockData.rootCauseClusters} selectedId={selectedClusterId} onSelect={setSelectedClusterId} />
        </Card>

        {/* Aging strip */}
        <Card className="col-span-4">
          <SectionTitle sub="By days open">Aging</SectionTitle>
          <div className="space-y-2">
            {Object.entries(agingBuckets).map(([range, items]) => {
              const tone = range === '90+' ? TONE.red : range === '61-90' ? TONE.amber : range === '31-60' ? TONE.slate : TONE.green;
              const max = Math.max(...Object.values(agingBuckets).map(b => b.length));
              return (
                <div key={range}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{range} days</span>
                    <Mono className={tone.fg}>{items.length}</Mono>
                  </div>
                  <div className="h-2 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={cls('h-full', tone.solid)} style={{ width: `${(items.length / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Selected cluster detail */}
      {cluster && (
        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-7">
            <SectionTitle sub={cluster.description}>{cluster.name} · {clusterIssues.length} issues</SectionTitle>
            <div className="space-y-2">
              {clusterIssues.map(issue => {
                const tone = TONE[semanticBand(issue.severity)];
                return (
                  <button
                    key={issue.id}
                    onClick={() => ctx.drillTo('issue', issue.id)}
                    className="w-full text-left p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cls('w-1.5 h-1.5 rounded-full shrink-0', tone.solid)} />
                        <Mono className="text-slate-500">{issue.id}</Mono>
                        <span className="text-[12px] font-medium truncate">{issue.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">{issue.daysOpen}d open</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{issue.description}</div>
                    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                      {issue.relatedControlIds.map(cid => (
                        <span key={cid} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{cid}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="col-span-5">
            <SectionTitle
              sub={`Trend: ${cluster.trend} · severity skew: ${cluster.severitySkew.replace('_', ' ')}`}
              action={
                <button
                  onClick={() => alert(`Action created for ${cluster.name} cluster.\nRecommended playbook attached.`)}
                  className="text-[11px] font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded px-2.5 py-1 hover:bg-slate-700 dark:hover:bg-slate-200 inline-flex items-center gap-1"
                >
                  <Icons.Plus className="w-3 h-3" /> Create remediation
                </button>
              }
            >Recommended Remediation</SectionTitle>
            <div className="space-y-2">
              {cluster.recommendedActions.map((a, i) => (
                <div key={i} className="flex gap-2 p-2 rounded border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <div className="text-[12px] text-slate-700 dark:text-slate-300 leading-snug">{a}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Historical analog</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Past pattern match: <span className="font-medium">{cluster.id === 'CLUSTER-CAPACITY' ? '4 of 5' : '3 of 4'}</span> historical clusters resolved with this playbook. Estimated time to recovery: <span className="font-medium">{cluster.id === 'CLUSTER-CAPACITY' ? '9 weeks' : '6 weeks'}</span>.
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 6. EVIDENCE WORKBENCH
// ────────────────────────────────────────────────────────────────────────────

function EvidenceWorkbench({ ctx }) {
  const [focalControlId, setFocalControlId] = useState('AML-C002');
  const focal = ctx.idx.controlsById.get(focalControlId);
  const focalCIs = useMemo(() => (ctx.idx.ciByControl.get(focalControlId) || []).slice(-130), [focalControlId, ctx.idx]);

  // Grid: 13 weeks × 10 cells per week. Bucket the instances.
  const lattice = useMemo(() => {
    const buckets = Array.from({ length: 13 }, () => []);
    focalCIs.forEach(ci => {
      const days = (new Date('2026-04-25').getTime() - new Date(ci.timestamp).getTime()) / (24 * 60 * 60 * 1000);
      const week = Math.min(12, Math.max(0, Math.floor(days / 7)));
      buckets[week].push(ci);
    });
    return buckets.reverse(); // oldest first
  }, [focalCIs]);

  return (
    <div className="space-y-5">
      <ScreenHeader title="Evidence Workbench" sub="Population-first audit · grounded by hash-verified evidence" />

      {/* Search + control selector */}
      <Card padded={false}>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="flex-1 relative">
            <Icons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              placeholder='Try: "show all wire callbacks where evidence is incomplete in March"'
              className="pl-8 pr-3 py-1.5 w-full text-[12px] bg-transparent outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <select value={focalControlId} onChange={(e) => setFocalControlId(e.target.value)} className="text-[12px] bg-transparent border-none outline-none text-slate-700 dark:text-slate-300">
            {mockData.controls.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
          </select>
        </div>
      </Card>

      {/* Focal control summary */}
      {focal && (
        <Card className="!p-0 overflow-hidden">
          <div className="grid grid-cols-12">
            <div className="col-span-5 p-4 border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <Mono className="text-slate-500">{focal.id}</Mono>
                <StatusBadge status={focal.effectivenessBand}>{focal.effectivenessBand.replace(/_/g, ' ')}</StatusBadge>
              </div>
              <div className="text-[13px] font-semibold mb-1">{focal.name}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">{focal.description}</div>
            </div>
            <div className="col-span-3 p-4 border-r border-slate-200 dark:border-slate-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">CES Decomposition</div>
              {[
                { k: 'Operating rate', v: focal.cesDecomposition.operatingRate },
                { k: 'Catch rate', v: focal.cesDecomposition.catchRate },
                { k: 'Evidence completeness', v: focal.cesDecomposition.evidenceCompleteness }
              ].map(d => (
                <div key={d.k} className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400">{d.k}</span>
                  <Mono className={d.v < 70 ? TONE.red.fg : d.v < 85 ? TONE.amber.fg : TONE.green.fg}>{d.v}%</Mono>
                </div>
              ))}
            </div>
            <div className="col-span-4 p-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Population window</div>
              <div className="text-[24px] font-semibold tabular-nums">{focalCIs.length}</div>
              <div className="text-[11px] text-slate-500 mt-1">control instances · last 13 weeks</div>
              <div className="mt-2 flex gap-2">
                <span className="text-[10px] flex items-center gap-1"><span className={cls('w-1.5 h-1.5 rounded-full', TONE.green.solid)} /> {focalCIs.filter(ci => ci.status === 'pass').length} pass</span>
                <span className="text-[10px] flex items-center gap-1"><span className={cls('w-1.5 h-1.5 rounded-full', TONE.red.solid)} /> {focalCIs.filter(ci => ci.status === 'exception').length} except</span>
                <span className="text-[10px] flex items-center gap-1"><span className={cls('w-1.5 h-1.5 rounded-full', TONE.slate.solid)} /> {focalCIs.filter(ci => ci.evidenceIds.length === 0).length} no evid</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Evidence lattice */}
      <Card>
        <SectionTitle sub="Cell color = status · border = evidence completeness · click any cell to inspect lineage">Evidence Lattice — 13 weeks</SectionTitle>
        <div className="space-y-1">
          {lattice.map((bucket, wIdx) => (
            <div key={wIdx} className="flex items-center gap-2">
              <div className="w-12 text-[10px] font-mono text-slate-500 text-right shrink-0">W-{12 - wIdx}</div>
              <div className="flex-1 flex flex-wrap gap-0.5">
                {bucket.slice(0, 30).map(ci => {
                  const ev = ci.evidenceIds.length > 0 ? ctx.idx.evidenceById.get(ci.evidenceIds[0]) : null;
                  const tone = TONE[semanticBand(ci.status)];
                  const completeness = ev?.completenessScore ?? 0;
                  return (
                    <button
                      key={ci.id}
                      onClick={() => ctx.drillTo(ev ? 'evidence' : 'control_instance', ev?.id || ci.id, { panelType: ev ? 'lineage_panel' : 'drill_panel' })}
                      title={`${ci.id} · ${ci.status} · evidence ${completeness}%`}
                      className={cls(
                        'w-4 h-4 rounded-sm border-2 transition-transform hover:scale-125',
                        tone.solid,
                        completeness >= 85 ? 'border-transparent' : completeness >= 60 ? 'border-amber-300 dark:border-amber-600' : ev ? 'border-rose-400 dark:border-rose-600' : 'border-dashed border-slate-400'
                      )}
                    />
                  );
                })}
                {bucket.length > 30 && <span className="text-[10px] text-slate-500 self-center ml-1">+{bucket.length - 30}</span>}
              </div>
              <div className="w-20 text-[10px] text-slate-500 text-right shrink-0">{bucket.length} fires</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className={cls('w-3 h-3 rounded-sm', TONE.green.solid)} /> pass</span>
          <span className="flex items-center gap-1"><span className={cls('w-3 h-3 rounded-sm', TONE.red.solid)} /> exception</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border-2 border-amber-400" /> partial evidence</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border-2 border-dashed border-slate-400" /> no evidence</span>
        </div>
      </Card>

      {/* Workpaper tray */}
      <Card>
        <SectionTitle
          sub="Multi-select instances/evidence to assemble a regulator-ready workpaper"
          action={
            <button
              onClick={() => alert(`Exporting workpaper bundle with ${ctx.workpaperItems.length} items.\nIncludes provenance chain, hash verification, and audit trail extract.`)}
              className="text-[11px] font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded px-2.5 py-1 hover:bg-slate-700 disabled:opacity-50"
              disabled={ctx.workpaperItems.length === 0}
            >
              Export bundle ({ctx.workpaperItems.length})
            </button>
          }
        >Workpaper Tray</SectionTitle>
        {ctx.workpaperItems.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic">No items selected. Click an evidence cell, then "Add to workpaper" in the lineage panel.</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {ctx.workpaperItems.map(id => (
              <span key={id} className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {id}
                <button onClick={() => ctx.toggleWorkpaper(id)} className="hover:text-rose-500"><Icons.Close className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 7. REPERFORMANCE CONSOLE
// ────────────────────────────────────────────────────────────────────────────

function ReperformanceConsole({ ctx }) {
  const [testControlId, setTestControlId] = useState('AML-C002');
  const [testWindow, setTestWindow] = useState('13w');
  const [testRun, setTestRun] = useState(null);

  const control = ctx.idx.controlsById.get(testControlId);
  const candidates = useMemo(() => (ctx.idx.ciByControl.get(testControlId) || []).slice(-200), [testControlId, ctx.idx]);

  const runTest = () => {
    const sample = candidates;
    const exceptions = sample.filter(ci => ci.status === 'exception');
    const noEvidence = sample.filter(ci => ci.evidenceIds.length === 0);
    setTestRun({
      runId: `TEST-${Math.floor(Math.random() * 9999)}`,
      controlId: testControlId,
      sampleSize: sample.length,
      passes: sample.filter(ci => ci.status === 'pass').length,
      exceptions: exceptions.length,
      noEvidence: noEvidence.length,
      passRate: ((sample.filter(ci => ci.status === 'pass').length / sample.length) * 100).toFixed(1),
      runAt: new Date().toISOString(),
      sample
    });
  };

  return (
    <div className="space-y-5">
      <ScreenHeader title="Reperformance Console" sub="Run population-level tests against any control · grounded in run-time evidence" />

      <div className="grid grid-cols-12 gap-5">
        {/* Test definition */}
        <Card className="col-span-5">
          <SectionTitle>Test Definition</SectionTitle>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Control under test</label>
              <select value={testControlId} onChange={(e) => setTestControlId(e.target.value)} className="w-full px-2 py-1.5 text-[12px] rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none">
                {mockData.controls.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Population window</label>
              <div className="flex gap-1.5">
                {['4w', '8w', '13w'].map(w => (
                  <button key={w} onClick={() => setTestWindow(w)} className={cls('text-[11px] px-2.5 py-1 rounded border transition-colors', testWindow === w ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300')}>{w}</button>
                ))}
              </div>
            </div>
            {control && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Design summary</div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">{control.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={control.effectivenessBand}>CES {control.effectivenessScore}</StatusBadge>
                  <span className="text-[10px] text-slate-500">·</span>
                  <span className="text-[10px] text-slate-500">{candidates.length} instances available</span>
                </div>
              </div>
            )}
            <button
              onClick={runTest}
              className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-[12px] font-medium rounded px-3 py-2 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Icons.Play className="w-3 h-3" />
              Run reperformance test
            </button>
          </div>
        </Card>

        {/* Test result */}
        <Card className="col-span-7">
          <SectionTitle sub={testRun ? `Run ${testRun.runId} · ${shortDateTime(testRun.runAt)}` : 'No active test run'}>Result</SectionTitle>
          {testRun ? (
            <>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="rounded-md border border-slate-200 dark:border-slate-800 p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Sample</div>
                  <div className="text-xl font-semibold tabular-nums">{testRun.sampleSize}</div>
                </div>
                <div className={cls('rounded-md border p-2.5', TONE.green.bg, TONE.green.border)}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Passes</div>
                  <div className={cls('text-xl font-semibold tabular-nums', TONE.green.fg)}>{testRun.passes}</div>
                </div>
                <div className={cls('rounded-md border p-2.5', TONE.red.bg, TONE.red.border)}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Exceptions</div>
                  <div className={cls('text-xl font-semibold tabular-nums', TONE.red.fg)}>{testRun.exceptions}</div>
                </div>
                <div className={cls('rounded-md border p-2.5', TONE.amber.bg, TONE.amber.border)}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">No evidence</div>
                  <div className={cls('text-xl font-semibold tabular-nums', TONE.amber.fg)}>{testRun.noEvidence}</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Population grid (first 100)</div>
                <div className="flex flex-wrap gap-0.5 max-h-32 overflow-y-auto">
                  {testRun.sample.slice(0, 100).map(ci => {
                    const tone = TONE[semanticBand(ci.status)];
                    return (
                      <button
                        key={ci.id}
                        onClick={() => ctx.drillTo('control_instance', ci.id)}
                        title={`${ci.id} · ${ci.status}`}
                        className={cls('w-3 h-3 rounded-sm transition-transform hover:scale-150', tone.solid)}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Icons.Beaker className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <div className="text-[12px] text-slate-500">Define a test on the left and click "Run reperformance test"</div>
            </div>
          )}
        </Card>
      </div>

      {/* Test history */}
      <Card>
        <SectionTitle sub="Compare results across runs">Test History</SectionTitle>
        <div className="grid grid-cols-5 gap-2">
          {[
            { id: 'TEST-2026-Q1', label: 'Q1 reperformance', control: 'AML-C002', pass: 71, exc: 12, ev: 17 },
            { id: 'TEST-2025-Q4', label: 'Q4 reperformance', control: 'AML-C002', pass: 86, exc: 9,  ev: 5 },
            { id: 'TEST-2025-Q3', label: 'Q3 reperformance', control: 'AML-C002', pass: 89, exc: 8,  ev: 3 },
            { id: 'TEST-2025-Q2', label: 'Q2 reperformance', control: 'AML-C002', pass: 91, exc: 6,  ev: 3 },
            { id: 'TEST-2025-Q1', label: 'Q1 reperformance', control: 'AML-C002', pass: 92, exc: 5,  ev: 3 }
          ].map(t => (
            <div key={t.id} className="rounded-md border border-slate-200 dark:border-slate-800 p-3">
              <Mono className="text-slate-500">{t.id}</Mono>
              <div className="text-[11px] font-medium mt-0.5">{t.label}</div>
              <div className="mt-2 flex h-1.5 rounded overflow-hidden">
                <div className={TONE.green.solid} style={{ width: `${t.pass}%` }} />
                <div className={TONE.red.solid}   style={{ width: `${t.exc}%`  }} />
                <div className={TONE.amber.solid} style={{ width: `${t.ev}%`   }} />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                <Mono className={TONE.green.fg}>{t.pass}%</Mono>
                <span>pass</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// DRILL DOWN PANEL
// ────────────────────────────────────────────────────────────────────────────

function DrillDownPanel({ ctx }) {
  const frame = ctx.drillStack[ctx.drillStack.length - 1];
  if (!frame) return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/30 dark:bg-slate-950/60 pointer-events-auto" onClick={ctx.clearDrill} />
      <aside className="absolute top-0 right-0 bottom-0 w-[520px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-xl pointer-events-auto flex flex-col">
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center gap-2">
          <button onClick={ctx.popDrill} disabled={ctx.drillStack.length <= 1} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
            <Icons.ChevLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{frame.entityType.replace('_', ' ')}</div>
            <Mono className="text-slate-700 dark:text-slate-300">{frame.entityId}</Mono>
          </div>
          <button onClick={ctx.clearDrill} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <DrillContent frame={frame} ctx={ctx} />
        </div>
      </aside>
    </div>
  );
}

function DrillContent({ frame, ctx }) {
  if (frame.entityType === 'risk') {
    const r = ctx.idx.risksById.get(frame.entityId);
    if (!r) return null;
    const linkedControls = r.linkedControlIds.map(id => ctx.idx.controlsById.get(id)).filter(Boolean);
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{r.name}</h2>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{r.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Inherent</div>
            <div className="text-[12px] font-medium capitalize">{r.inherentRating}</div>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Residual</div>
            <div className="text-[12px] font-medium capitalize">{r.residualRating}</div>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Score</div>
            <div className="text-[12px] font-medium">{r.exposureScore}</div>
          </div>
        </div>
        <div>
          <SectionTitle sub={`${linkedControls.length} mapped`}>Mitigating controls</SectionTitle>
          <div className="space-y-1.5">
            {linkedControls.map(c => (
              <button key={c.id} onClick={() => ctx.drillTo('control', c.id)} className="w-full text-left p-2.5 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mono className="text-slate-500">{c.id}</Mono>
                    <span className="text-[12px] truncate">{c.name}</span>
                  </div>
                  <StatusBadge status={c.effectivenessBand}>{c.effectivenessScore}</StatusBadge>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (frame.entityType === 'control') {
    const c = ctx.idx.controlsById.get(frame.entityId);
    if (!c) return null;
    const proc = ctx.idx.processesById.get(c.processId);
    const recentInstances = (ctx.idx.ciByControl.get(c.id) || []).slice(-12);
    const issues = ctx.idx.issuesByControl.get(c.id) || [];
    const insights = ctx.idx.insightsByEntity.get(c.id) || [];
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{c.name}</h2>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{c.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Process</div>
            <button onClick={() => ctx.drillTo('process', c.processId)} className="text-[12px] font-medium hover:underline">{proc?.name}</button>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Effectiveness</div>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={c.effectivenessBand}>{c.effectivenessScore}</StatusBadge>
              <TrendIndicator trend={c.effectivenessTrend} />
            </div>
          </div>
        </div>

        <div className="rounded border border-slate-200 dark:border-slate-800 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">CES Decomposition</div>
          {[
            { k: 'Operating rate', v: c.cesDecomposition.operatingRate },
            { k: 'Catch rate', v: c.cesDecomposition.catchRate },
            { k: 'Evidence completeness', v: c.cesDecomposition.evidenceCompleteness }
          ].map(d => (
            <div key={d.k} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="text-slate-600 dark:text-slate-400">{d.k}</span>
                <Mono className={d.v < 70 ? TONE.red.fg : d.v < 85 ? TONE.amber.fg : TONE.green.fg}>{d.v}%</Mono>
              </div>
              <div className="h-1.5 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={cls('h-full', d.v < 70 ? TONE.red.solid : d.v < 85 ? TONE.amber.solid : TONE.green.solid)} style={{ width: `${d.v}%` }} />
              </div>
            </div>
          ))}
        </div>

        {issues.length > 0 && (
          <div>
            <SectionTitle sub={`${issues.length} open`}>Linked issues</SectionTitle>
            <div className="space-y-1.5">
              {issues.map(i => (
                <button key={i.id} onClick={() => ctx.drillTo('issue', i.id)} className="w-full text-left p-2 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cls('w-1.5 h-1.5 rounded-full', TONE[semanticBand(i.severity)].solid)} />
                      <Mono className="text-slate-500">{i.id}</Mono>
                      <span className="text-[11px] truncate">{i.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{i.daysOpen}d</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionTitle sub="Click an instance to inspect lineage">Recent instances</SectionTitle>
          <div className="grid grid-cols-6 gap-1">
            {recentInstances.map(ci => {
              const tone = TONE[semanticBand(ci.status)];
              return (
                <button
                  key={ci.id}
                  onClick={() => ctx.drillTo('control_instance', ci.id)}
                  title={`${ci.id} · ${shortDate(ci.timestamp)}`}
                  className={cls('h-8 rounded border-2 hover:scale-105 transition-transform', tone.solid, ci.evidenceIds.length > 0 ? 'border-transparent' : 'border-dashed border-slate-400')}
                />
              );
            })}
          </div>
        </div>

        {insights.length > 0 && (
          <div>
            <SectionTitle>AI insights for this control</SectionTitle>
            <div className="space-y-2">
              {insights.slice(0, 3).map(ins => <AIInsightCard key={ins.id} insight={ins} dense />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (frame.entityType === 'control_instance') {
    const ci = ctx.idx.ciById.get(frame.entityId);
    if (!ci) return null;
    const c = ctx.idx.controlsById.get(ci.controlId);
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Control fire event</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">{shortDateTime(ci.timestamp)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Status</div>
            <StatusBadge status={ci.status}>{ci.status}</StatusBadge>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Caught</div>
            <Mono>{ci.caughtWhatDesigned}</Mono>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Operator</div>
            <Mono>{ci.operatorId}</Mono>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Latency</div>
            <Mono>{ci.latencyMs}ms</Mono>
          </div>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-800 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Parent control</div>
          <button onClick={() => ctx.drillTo('control', c.id)} className="text-[12px] font-medium hover:underline">{c.id} — {c.name}</button>
        </div>
        {ci.evidenceIds.length > 0 ? (
          <div>
            <SectionTitle>Linked evidence</SectionTitle>
            {ci.evidenceIds.map(eid => {
              const ev = ctx.idx.evidenceById.get(eid);
              if (!ev) return null;
              return (
                <button key={eid} onClick={() => ctx.drillTo('evidence', eid, { panelType: 'lineage_panel' })} className="w-full text-left p-2.5 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-300">
                  <div className="flex items-center justify-between">
                    <Mono className="text-slate-500">{ev.id}</Mono>
                    <HashBadge verified={ev.hashVerified} hash={ev.hash} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-700 dark:text-slate-300">{ev.type} · {ev.sourceSystem}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Completeness</span>
                    <Mono className={ev.completenessScore < 70 ? TONE.red.fg : ev.completenessScore < 85 ? TONE.amber.fg : TONE.green.fg}>{ev.completenessScore}%</Mono>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={cls('rounded border p-3', TONE.amber.bg, TONE.amber.border)}>
            <div className={cls('text-[12px] font-medium', TONE.amber.softText)}>No evidence captured</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">This instance fired but no supporting evidence was attached. May indicate workflow gap.</div>
          </div>
        )}
      </div>
    );
  }

  if (frame.entityType === 'obligation') {
    const o = ctx.idx.obligationsById.get(frame.entityId);
    if (!o) return null;
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{o.citation}</h2>
          <p className="text-[12px] text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{o.requirementText}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Coverage</div>
            <BandPill band={o.coverageStatus} value={o.coverageScore} />
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Style</div>
            <div className="text-[12px] capitalize">{o.interpretiveStyle.replace(/_/g, ' ')}</div>
          </div>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-800 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Evidence expectation</div>
          <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{o.evidenceExpectation}</div>
        </div>
        <div>
          <SectionTitle sub={`${o.linkedControlIds.length} mapped`}>Mitigating controls</SectionTitle>
          <div className="space-y-1.5">
            {o.linkedControlIds.map(cid => {
              const c = ctx.idx.controlsById.get(cid);
              if (!c) return null;
              return (
                <button key={cid} onClick={() => ctx.drillTo('control', cid)} className="w-full text-left p-2.5 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mono className="text-slate-500">{c.id}</Mono>
                      <span className="text-[12px] truncate">{c.name}</span>
                    </div>
                    <StatusBadge status={c.effectivenessBand}>{c.effectivenessScore}</StatusBadge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (frame.entityType === 'issue') {
    const i = ctx.idx.issuesById.get(frame.entityId);
    if (!i) return null;
    const cluster = i.rootCauseClusterId ? ctx.idx.clustersById.get(i.rootCauseClusterId) : null;
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={i.severity}>{i.severity}</StatusBadge>
            <span className="text-[10px] text-slate-500">{i.daysOpen} days open</span>
          </div>
          <h2 className="text-base font-semibold tracking-tight">{i.title}</h2>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{i.description}</p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-800 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Root cause</div>
          <div className="text-[12px] text-slate-700 dark:text-slate-300 mb-2">{i.rootCause}</div>
          {cluster && (
            <button onClick={() => ctx.drillTo('cluster', cluster.id)} className={cls('text-[11px] inline-flex items-center gap-1 px-2 py-0.5 rounded border', TONE.slate.bg, TONE.slate.border)}>
              <Icons.Layers className="w-3 h-3" />
              <span>Cluster: {cluster.name}</span>
              <Mono>{cluster.issueIds.length}</Mono>
            </button>
          )}
        </div>
        <div>
          <SectionTitle>Linked controls</SectionTitle>
          <div className="space-y-1">
            {i.relatedControlIds.map(cid => {
              const c = ctx.idx.controlsById.get(cid);
              if (!c) return null;
              return (
                <button key={cid} onClick={() => ctx.drillTo('control', cid)} className="w-full text-left p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mono className="text-slate-500">{cid}</Mono>
                      <span className="text-[11px]">{c.name}</span>
                    </div>
                    <StatusBadge status={c.effectivenessBand}>{c.effectivenessScore}</StatusBadge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {i.relatedControlInstanceIds.length > 0 && (
          <div>
            <SectionTitle sub="Empirical evidence of this issue">Failing instances</SectionTitle>
            <div className="grid grid-cols-4 gap-1">
              {i.relatedControlInstanceIds.map(ciid => {
                const ci = ctx.idx.ciById.get(ciid);
                if (!ci) return null;
                return (
                  <button key={ciid} onClick={() => ctx.drillTo('control_instance', ciid)} className="text-left p-1.5 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-300">
                    <Mono className="text-[9px] text-slate-500">{ciid.slice(-7)}</Mono>
                    <div className="text-[10px] mt-0.5">{shortDate(ci.timestamp)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <button
          onClick={() => alert(`Remediation action created for ${i.id}.\nAssigned to ${i.ownerId}.\nTarget: ${i.targetCloseDate}`)}
          className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-[12px] font-medium rounded px-3 py-2 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <Icons.Plus className="w-3 h-3" />
          Create remediation action
        </button>
      </div>
    );
  }

  if (frame.entityType === 'cluster') {
    const cluster = ctx.idx.clustersById.get(frame.entityId);
    if (!cluster) return null;
    const issues = cluster.issueIds.map(id => ctx.idx.issuesById.get(id)).filter(Boolean);
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{cluster.name} cluster</h2>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{cluster.description}</p>
        </div>
        <div>
          <SectionTitle sub={`${issues.length} issues`}>Issues in cluster</SectionTitle>
          <div className="space-y-1.5">
            {issues.map(i => (
              <button key={i.id} onClick={() => ctx.drillTo('issue', i.id)} className="w-full text-left p-2 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cls('w-1.5 h-1.5 rounded-full', TONE[semanticBand(i.severity)].solid)} />
                    <Mono className="text-slate-500">{i.id}</Mono>
                    <span className="text-[11px] truncate">{i.title}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Recommended actions</SectionTitle>
          <ol className="space-y-1.5">
            {cluster.recommendedActions.map((a, i) => (
              <li key={i} className="flex gap-2 text-[12px] text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 font-mono">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  if (frame.entityType === 'process') {
    const p = ctx.idx.processesById.get(frame.entityId);
    if (!p) return null;
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{p.name}</h2>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{p.description}</p>
        </div>
        <div>
          <SectionTitle>Process flow</SectionTitle>
          <div className="space-y-1.5">
            {mockData.processSteps.filter(s => s.processId === p.id).sort((a, b) => a.stepOrder - b.stepOrder).map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded border border-slate-200 dark:border-slate-800">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono flex items-center justify-center">{s.stepOrder}</div>
                <div className="flex-1">
                  <div className="text-[11px] font-medium">{s.name}</div>
                  <div className="text-[10px] text-slate-500">{s.expectedActorRole} · {s.expectedSystem}</div>
                </div>
                <Mono className="text-slate-500">{s.stepType}</Mono>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Controls in this process</SectionTitle>
          <div className="space-y-1">
            {p.controlIds.map(cid => {
              const c = ctx.idx.controlsById.get(cid);
              if (!c) return null;
              return (
                <button key={cid} onClick={() => ctx.drillTo('control', cid)} className="w-full text-left p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mono className="text-slate-500">{c.id}</Mono>
                    <span className="text-[11px]">{c.name}</span>
                  </div>
                  <StatusBadge status={c.effectivenessBand}>{c.effectivenessScore}</StatusBadge>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return <div className="text-[12px] text-slate-500">No detail view for {frame.entityType}.</div>;
}

// ────────────────────────────────────────────────────────────────────────────
// LINEAGE PANEL — wider, shows full provenance chain
// ────────────────────────────────────────────────────────────────────────────

function LineagePanel({ ctx }) {
  const frame = ctx.drillStack[ctx.drillStack.length - 1];
  if (!frame || frame.entityType !== 'evidence') return null;
  const ev = ctx.idx.evidenceById.get(frame.entityId);
  if (!ev) return null;
  const ci = ev.controlInstanceIds[0] ? ctx.idx.ciById.get(ev.controlInstanceIds[0]) : null;
  const c = ci ? ctx.idx.controlsById.get(ci.controlId) : null;
  const obls = c ? c.obligationIds.map(oid => ctx.idx.obligationsById.get(oid)).filter(Boolean) : [];
  const inWorkpaper = ctx.workpaperItems.includes(ev.id);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 pointer-events-auto" onClick={ctx.clearDrill} />
      <aside className="absolute top-0 right-0 bottom-0 w-[640px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl pointer-events-auto flex flex-col">
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center gap-2">
          <button onClick={ctx.popDrill} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <Icons.ChevLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Lineage · evidence</div>
            <Mono className="text-slate-700 dark:text-slate-300">{ev.id}</Mono>
          </div>
          <button
            onClick={() => ctx.toggleWorkpaper(ev.id)}
            className={cls('text-[11px] font-medium px-2.5 py-1 rounded border', inWorkpaper ? cls(TONE.green.bg, TONE.green.border, TONE.green.softText) : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300')}
          >
            {inWorkpaper ? '✓ In workpaper' : '+ Add to workpaper'}
          </button>
          <button onClick={ctx.clearDrill} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Evidence detail */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Evidence</div>
              <HashBadge verified={ev.hashVerified} hash={ev.hash} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div><div className="text-slate-500">Type</div><Mono className="text-slate-800 dark:text-slate-200">{ev.type}</Mono></div>
              <div><div className="text-slate-500">Source</div><Mono className="text-slate-800 dark:text-slate-200">{ev.sourceSystem}</Mono></div>
              <div><div className="text-slate-500">Captured</div><Mono className="text-slate-800 dark:text-slate-200">{shortDateTime(ev.timestamp)}</Mono></div>
              <div><div className="text-slate-500">Method</div><Mono className="text-slate-800 dark:text-slate-200">{ev.collectionMethod}</Mono></div>
              <div><div className="text-slate-500">Completeness</div><Mono className={ev.completenessScore < 70 ? TONE.red.fg : ev.completenessScore < 85 ? TONE.amber.fg : TONE.green.fg}>{ev.completenessScore}%</Mono></div>
              <div><div className="text-slate-500">Retention</div><Mono>{ev.retentionClass}</Mono></div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Payload URI</div>
              <Mono className="text-[10px] text-slate-600 dark:text-slate-400 break-all">{ev.payloadUri}</Mono>
            </div>
          </Card>

          {/* Lineage chain */}
          <Card>
            <SectionTitle sub="Top-down provenance">Lineage Chain</SectionTitle>
            <div className="space-y-1.5">
              {obls.length > 0 && (
                <LineageNode label="Regulation" id={ctx.idx.obligationsById.get(obls[0].id)?.regulationId} hint={mockData.regulations.find(r => r.id === obls[0].regulationId)?.title} onClick={() => {}} />
              )}
              {obls.map((o, i) => (
                <LineageNode key={o.id} label="Obligation" id={o.id} hint={o.citation} onClick={() => ctx.drillTo('obligation', o.id)} indent={1} />
              ))}
              {c && <LineageNode label="Control" id={c.id} hint={c.name} onClick={() => ctx.drillTo('control', c.id)} indent={2} />}
              {ci && <LineageNode label="Instance" id={ci.id} hint={shortDateTime(ci.timestamp)} onClick={() => ctx.drillTo('control_instance', ci.id)} indent={3} />}
              <LineageNode label="Evidence" id={ev.id} hint={`${ev.completenessScore}% complete`} indent={4} terminal />
            </div>
          </Card>

          {/* Audit events related to this evidence */}
          <Card>
            <SectionTitle sub="From the platform's append-only ledger">Audit Trail</SectionTitle>
            <div className="space-y-1.5">
              {mockData.auditTrail.filter(e => e.entityId === ev.id || (ci && e.entityId === ci.id)).slice(0, 5).map(e => (
                <div key={e.id} className="flex items-start gap-2 text-[11px] py-1 border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                  <Mono className="text-slate-500 shrink-0 mt-0.5">{shortDate(e.timestamp)}</Mono>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{e.eventType}</div>
                    <div className="text-[10px] text-slate-500">{e.actorId} · {e.actorType}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </aside>
    </div>
  );
}

function LineageNode({ label, id, hint, onClick, indent = 0, terminal }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cls(
        'flex items-center gap-2 w-full text-left p-2 rounded transition-colors',
        onClick && 'hover:bg-slate-50 dark:hover:bg-slate-900'
      )}
      style={{ paddingLeft: `${indent * 16 + 8}px` }}
    >
      {indent > 0 && <span className="text-slate-300 dark:text-slate-700">└</span>}
      <div className={cls('w-1.5 h-1.5 rounded-full', terminal ? TONE.green.solid : 'bg-slate-400')} />
      <span className="text-[10px] uppercase tracking-wider text-slate-500 w-20 shrink-0">{label}</span>
      <Mono className="text-slate-700 dark:text-slate-300 shrink-0">{id}</Mono>
      {hint && <span className="text-[11px] text-slate-500 truncate">{hint}</span>}
    </button>
  );
}

'use client';

import { useMemo } from 'react';
import { ChevronRight, Flame, Target } from 'lucide-react';
import { FastTagAiLogo } from '@/app/Indian_Process_Audit/_shared/FastTagAiLogo';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';
import {
  COH_GATEWAY_TILES,
  COH_PULSE_LINES,
  COH_TILE_COMPACT_META,
  FASTAG_RISK_SPIKES,
  HOB_GATEWAY_TILES,
  HOB_TILE_COMPACT_META,
  ftRagPct,
  hobPulseLines,
  type ExecutivePulseItem,
  type FastTagGatewayHighlight,
  type FastTagGatewayTile,
  type FastTagGatewayTileId,
  type FastTagGatewayTileMeta,
  type FastTagRiskSpike,
} from './fastTagGatewayData';

const HIGHLIGHT_VALUE_CLS: Record<NonNullable<FastTagGatewayHighlight['tone']>, string> = {
  good: 'text-green-600',
  warn: 'text-amber-600',
  bad: 'text-red-600',
};

function GatewayTileHighlights({ highlights }: { highlights: FastTagGatewayHighlight[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {highlights.map((h) => (
        <div key={h.label} className="flex min-w-0 flex-col gap-px">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-500">
              {h.label}
            </span>
            <span
              className={`shrink-0 font-mono text-xs font-bold tabular-nums ${
                h.tone ? HIGHLIGHT_VALUE_CLS[h.tone] : 'text-slate-900'
              }`}
            >
              {h.value}
            </span>
          </div>
          {h.sub ? <p className="text-[9px] leading-snug text-slate-500">{h.sub}</p> : null}
        </div>
      ))}
    </div>
  );
}

function ExecutivePulseStrip({ items }: { items: ExecutivePulseItem[] }) {
  return (
    <div className="rounded-xl border border-slate-200 border-l-[3px] border-l-amber-400 bg-white p-3.5 shadow-sm sm:p-4">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <FastTagAiLogo />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Executive Pulse</span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {items.map((item, idx) => (
          <div
            key={item.q}
            className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2"
          >
            <div className="text-[13px] font-bold leading-snug text-violet-700">
              {idx + 1}. {item.q}
            </div>
            <p className="text-[13px] font-semibold leading-snug text-slate-600">{item.main}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniHalfGauge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const data = [{ name: label, value: clamped, fill: color }];

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <div className="relative h-[58px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={32}
            outerRadius={46}
            cx="50%"
            cy="100%"
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#E2E8F0' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div
          className="pointer-events-none absolute bottom-0.5 left-1/2 -translate-x-1/2 font-mono text-sm font-extrabold leading-none"
          style={{ color }}
        >
          {clamped}%
        </div>
      </div>
      <div className="min-h-[30px] w-full pt-0.5 text-center text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}

function GatewayTile({
  tile,
  metaMap,
  onOpen,
}: {
  tile: FastTagGatewayTile;
  metaMap: Record<FastTagGatewayTileId, FastTagGatewayTileMeta>;
  onOpen: () => void;
}) {
  const visualTone = tile.visualTone;
  const isHappinessTile = tile.id === 'operations_escalations';
  const TileIcon = tile.id === 'sales_issuance' ? Target : tile.id === 'ecosystem_partner' ? Flame : null;
  const m = metaMap[tile.id];

  const leftGaugeColor = ftRagPct(m.leftGauge.value, m.leftGauge.higherIsBetter ?? true);
  const rightGaugeColor = ftRagPct(m.rightGauge.value, m.rightGauge.higherIsBetter ?? true);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full min-w-0 flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 pb-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
          style={{ background: `${visualTone}18` }}
        >
          {TileIcon ? (
            <TileIcon className="h-[18px] w-[18px]" style={{ color: visualTone }} aria-hidden />
          ) : (
            <span className="text-base leading-none" style={{ color: visualTone }} aria-hidden>
              ♥
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold leading-snug text-slate-900">{tile.title}</div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {tile.subtitle}
          </div>
        </div>
        <ChevronRight
          className="mt-0.5 h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-600"
          aria-hidden
        />
      </div>

      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{m.micro}</div>

      <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-stretch">
        <div className="flex w-full shrink-0 flex-col sm:w-[46%] sm:max-w-[210px]">
          <div className="flex gap-2">
            <MiniHalfGauge label={m.leftGauge.label} value={m.leftGauge.value} color={leftGaugeColor} />
            <MiniHalfGauge
              label={m.rightGauge.label}
              value={Math.min(100, m.rightGauge.value)}
              color={rightGaugeColor}
            />
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-slate-100 pt-2.5">
            {[m.bottomLeft, m.bottomRight].map((b) => (
              <div key={b.label} className="min-w-0">
                <div className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-slate-400">
                  {b.label}
                </div>
                <div
                  className="mt-0.5 font-mono text-xs font-bold leading-tight text-slate-900"
                  style={b.valueColor ? { color: b.valueColor } : undefined}
                >
                  {b.value}
                </div>
                {b.sub ? <div className="mt-0.5 text-[9px] leading-tight text-slate-500">{b.sub}</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <GatewayTileHighlights highlights={tile.highlights} />
        </div>
      </div>

      <div
        className="mt-auto rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left"
        style={{ borderLeftWidth: 3, borderLeftColor: visualTone }}
      >
        <div className="mb-1.5 flex items-center gap-1.5">
          <FastTagAiLogo />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: visualTone }}
          >
            {isHappinessTile ? 'Happiness read-out' : 'Conversation AI'}
          </span>
        </div>
        <p className="m-0 line-clamp-4 text-xs leading-snug text-slate-600">{tile.aiInsight}</p>
      </div>
    </button>
  );
}

function severityTone(severity: FastTagRiskSpike['severity']) {
  if (severity === 'CRITICAL') return '#EF4444';
  if (severity === 'HIGH') return '#F59E0B';
  return '#06B6D4';
}

function RiskSpikeMonitor() {
  const severityMeta: Record<string, { badge: string; icon: string }> = {
    CRITICAL: { badge: '#EF4444', icon: '🔥' },
    HIGH: { badge: '#F59E0B', icon: '⚠️' },
    MEDIUM: { badge: '#06B6D4', icon: '•' },
  };

  return (
    <section className="flex w-full flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="m-0 flex items-center gap-2 text-lg font-bold text-slate-900">
          <FastTagAiLogo />
          AI Risk Spike Monitor
        </h2>
        <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
          Operational Alerts
        </span>
      </div>
      <p className="m-0 text-[11px] text-slate-500">
        Live detection of sudden sentiment, SLA, volume, and backlog shocks across voice, chat, social, and
        1033.
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {FASTAG_RISK_SPIKES.map((spike) => {
          const tone = severityTone(spike.severity);
          const sev = severityMeta[spike.severity] ?? severityMeta.MEDIUM;
          return (
            <div
              key={spike.id}
              className="flex min-h-[240px] min-w-[240px] flex-1 flex-col rounded-2xl border p-3.5 text-xs text-slate-600"
              style={{
                borderColor: `${tone}88`,
                background: `${tone}0c`,
                boxShadow: `0 10px 24px ${tone}22`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-bold leading-snug text-slate-900">{spike.title}</div>
                <span
                  className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    borderColor: `${sev.badge}66`,
                    background: `${sev.badge}22`,
                    color: sev.badge,
                  }}
                >
                  <span>{sev.icon}</span>
                  {spike.severity}
                </span>
              </div>

              <div className="mt-2.5 flex flex-col gap-1 text-[11px] text-slate-500">
                <div className="flex justify-between gap-2">
                  <span className="uppercase tracking-wide">Channel</span>
                  <span className="text-right text-slate-800">{spike.channelMix.join(', ')}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="uppercase tracking-wide">Top Intent</span>
                  <div className="text-right">
                    <div className="text-slate-800">{spike.topIntent}</div>
                    <div className="text-[10px]">{spike.topIntentSub}</div>
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="uppercase tracking-wide">Time</span>
                  <span className="text-slate-800">{spike.time}</span>
                </div>
              </div>

              <div className="mt-3.5 flex flex-1 flex-col justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                {spike.metrics.map((m) => (
                  <div key={`${spike.id}-${m.label}`} className="flex justify-between gap-2">
                    <span>{m.label}</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{m.value}</div>
                      {m.delta ? <div className="font-bold text-red-600">{m.delta}</div> : null}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-3 rounded-xl border p-3 text-xs leading-relaxed"
                style={{ borderColor: `${tone}55`, background: `${tone}14` }}
              >
                <FastTagAiLogo className="mr-1 inline text-sm align-middle" />
                {spike.aiAction}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const COH_TILE_NAV: Record<FastTagGatewayTileId, FastTagWorkspaceNavigate> = {
  sales_issuance: { view: 'cases', caseStage: 'wallet' },
  ecosystem_partner: { view: 'register', registerFilter: 'needs-attention' },
  operations_escalations: { view: 'cases' },
};

type FrontProps = {
  onNavigate: (req: FastTagWorkspaceNavigate) => void;
  timeRange?: string;
};

type HoBFrontProps = {
  onTileOpen: (tileId: FastTagGatewayTileId) => void;
  timeRange?: string;
};

export function FastTagHoBFrontPage({ onTileOpen, timeRange = 'q1' }: HoBFrontProps) {
  const pulse = useMemo(() => hobPulseLines(timeRange), [timeRange]);

  return (
    <div className="flex w-full flex-col gap-4">
      <ExecutivePulseStrip items={pulse} />
      <section className="grid items-stretch gap-3 xl:grid-cols-3">
        {HOB_GATEWAY_TILES.map((tile) => (
          <GatewayTile
            key={tile.id}
            tile={tile}
            metaMap={HOB_TILE_COMPACT_META}
            onOpen={() => onTileOpen(tile.id)}
          />
        ))}
      </section>
      <RiskSpikeMonitor />
    </div>
  );
}

export function FastTagCOHFrontPage({ onNavigate }: FrontProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <ExecutivePulseStrip items={COH_PULSE_LINES} />
      <section className="grid items-stretch gap-3 xl:grid-cols-3">
        {COH_GATEWAY_TILES.map((tile) => (
          <GatewayTile
            key={tile.id}
            tile={tile}
            metaMap={COH_TILE_COMPACT_META}
            onOpen={() => onNavigate(COH_TILE_NAV[tile.id])}
          />
        ))}
      </section>
    </div>
  );
}

'use client';

import { AcronymLabel, ACRONYM_TOOLTIPS } from '../../../../ori/AcronymExpansion';
import { oriCardHover, oriFocusRing } from '../../../../theme';
import type { ClassicPostureMetric } from '../../types';
import { COCKPIT, kpiAccentColor, kpiTrendVisual, kpiValueColor } from '../cockpitTokens';
import type { OrmCrossNavIntent } from '../../../../types';

const ORM_CARD_H = 88;

function DemotedKpiCard({ metric }: { metric: ClassicPostureMetric }) {
  const accent = kpiAccentColor(metric.status);
  const valueColor = kpiValueColor(metric.status);
  const trendVisual = kpiTrendVisual(metric.id, metric.trend, metric.status, []);
  const trendDisplay = trendVisual.arrow === '—' ? '→' : trendVisual.arrow;

  return (
    <div
      title={metric.labelTooltip ?? metric.tileTooltip}
      style={{ height: ORM_CARD_H, borderLeftColor: accent }}
      className="flex flex-col justify-between rounded-xl border-l-4 bg-white px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">{metric.label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold leading-none" style={{ color: valueColor }}>
          {metric.value}
        </span>
        <span className="text-base" style={{ color: trendVisual.textColor }} aria-hidden>
          {trendDisplay}
        </span>
      </div>
      <p className="line-clamp-2 text-[11px] leading-tight text-[#9CA3AF]">{metric.sub}</p>
    </div>
  );
}

export function OrmHeartbeatPanel({
  criticalIncidents7d,
  rcasAwaitingApproval,
  rcaApproverBreakdown,
  pacNotesPendingApproval,
  pacBlockerReasons,
  demotedMetrics = [],
  goOrm,
}: {
  criticalIncidents7d: number;
  rcasAwaitingApproval: number;
  rcaApproverBreakdown: string;
  pacNotesPendingApproval: number;
  pacBlockerReasons: string;
  demotedMetrics?: ClassicPostureMetric[];
  goOrm: (intent: OrmCrossNavIntent) => void;
}) {
  return (
    <div className="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <h3 className="text-sm font-semibold text-[#111827]">ORM heartbeat</h3>
      <p className="mb-4 text-xs text-[#6B7280]">Operational Risk Management pulse — incidents, RCAs, and PAC blockers</p>
      <div className="grid grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => goOrm({ target: 'incidentRegister', preset: 'critical_incidents_7d' })}
          style={{ height: ORM_CARD_H, borderLeftColor: COCKPIT.red.border }}
          className={`flex flex-col justify-between rounded-xl border-l-4 bg-white px-4 py-3 text-left shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${oriCardHover} ${oriFocusRing}`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">Critical incidents (7d)</span>
          <span className="text-2xl font-bold leading-none" style={{ color: COCKPIT.red.text }}>
            {criticalIncidents7d}
          </span>
          <span className="text-[11px] text-[#9CA3AF]">Severity critical · last 7 days</span>
        </button>
        <button
          type="button"
          onClick={() => goOrm({ target: 'rcaWorkspace', preset: 'awaiting_approval' })}
          style={{ height: ORM_CARD_H, borderLeftColor: COCKPIT.amber.border }}
          className={`flex flex-col justify-between rounded-xl border-l-4 bg-white px-4 py-3 text-left shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${oriCardHover} ${oriFocusRing}`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">RCAs awaiting approval</span>
          <span className="text-2xl font-bold leading-none" style={{ color: COCKPIT.amber.text }}>
            {rcasAwaitingApproval}
          </span>
          {rcaApproverBreakdown ? (
            <span className="line-clamp-2 text-[11px] leading-tight text-[#9CA3AF]">{rcaApproverBreakdown}</span>
          ) : (
            <span className="text-[11px] text-[#9CA3AF]">—</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => goOrm({ target: 'pacNoteApprovals', preset: 'blocked' })}
          style={{ height: ORM_CARD_H, borderLeftColor: COCKPIT.amber.border }}
          className={`flex flex-col justify-between rounded-xl border-l-4 bg-white px-4 py-3 text-left shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${oriCardHover} ${oriFocusRing}`}
        >
          <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.05em] text-[#6B7280]">
            <AcronymLabel id="pac-heartbeat" short="PAC Notes" expanded="PAC Notes (Preventive Action Confirmation)" tooltip={ACRONYM_TOOLTIPS.pac} />{' '}
            pending approval
          </span>
          <span className="text-2xl font-bold leading-none text-[#7C3AED]">{pacNotesPendingApproval}</span>
          <span className="line-clamp-2 text-[11px] leading-tight text-[#9CA3AF]">Blocked by: {pacBlockerReasons}</span>
        </button>
      </div>
      {demotedMetrics.length > 0 ? (
        <div className="mt-3.5 grid grid-cols-2 gap-3.5">
          {demotedMetrics.map((m) => (
            <DemotedKpiCard key={m.id} metric={m} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

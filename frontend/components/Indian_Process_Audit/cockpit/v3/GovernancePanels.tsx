'use client';

import { governance, issues, regDeadlines, supervisory } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { CockpitCard, HeatLegend, SectionTitle, TrendArrow } from './CockpitPrimitives';
import { DEADLINE_DOT, TONE_CLASS, TONE_HEX } from './cockpitTokens';
import { StatusPill } from '@/components/Indian_Process_Audit/journey/v3/StatusPill';
import type { RccCaseStatus } from '@/lib/Indian_Process_Audit/riskCommandCenter';

export function GovernanceHealthPanel() {
  return (
    <CockpitCard>
      <SectionTitle>Governance health</SectionTitle>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {governance.tiles.map((g) => (
          <div key={g.key} className="rounded-lg border border-slate-200 px-3 py-2.5">
            <div className="min-h-[28px] text-[11px] font-semibold text-slate-400">{g.label}</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold tabular-nums text-slate-900">{g.score}</span>
              <span className="text-emerald-600">
                <TrendArrow dir={g.trend} />
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">target {g.target}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs italic text-slate-500">{governance.note}</p>
    </CockpitCard>
  );
}

export function RegDeadlinesPanel() {
  return (
    <CockpitCard pad={false}>
      <div className="px-4 pb-2 pt-3.5">
        <SectionTitle right={<span className="text-[11.5px] text-slate-400">obligation register</span>}>
          Regulatory deadline tracker
        </SectionTitle>
      </div>
      {regDeadlines.map((d) => (
        <div
          key={d.ref}
          className="flex items-center gap-3 border-t border-slate-200 px-4 py-2.5"
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${DEADLINE_DOT[d.status]}`} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-slate-900">{d.name}</span>
            <span className="font-mono text-[11px] text-slate-400">{d.ref}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-xs tabular-nums text-slate-800">{d.due}</span>
            <span className={`text-[11px] font-bold tabular-nums ${TONE_CLASS[d.status === 'on-track' ? 'good' : d.status === 'degraded' ? 'bad' : 'warn']}`}>
              {d.daysLeft}d · {d.status}
            </span>
          </span>
          <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-bold text-slate-500">
            {d.owner}
          </span>
        </div>
      ))}
    </CockpitCard>
  );
}

export function SupervisoryPanel() {
  const ni = supervisory.nextInspection;
  return (
    <CockpitCard className="h-full">
      <SectionTitle
        right={
          <span className="text-[11.5px] font-semibold text-indigo-600">
            {ni.name} · {ni.date} · {ni.daysLeft}d
          </span>
        }
      >
        Supervisory readiness
      </SectionTitle>
      <div className="grid grid-cols-[1.4fr_3fr_auto] gap-x-3 pb-1 text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
        <span>Lens</span>
        <span>ARS (0–100)</span>
        <span className="text-right">Score</span>
      </div>
      {supervisory.lenses.map((l) => {
        const col = TONE_CLASS[l.status];
        return (
          <div
            key={l.lens}
            className="grid grid-cols-[1.4fr_3fr_auto] items-center gap-x-3 border-t border-slate-200 py-2.5"
          >
            <span className="text-[13px] font-semibold text-slate-800">{l.lens}</span>
            <span>
              {l.status === 'gap' ? (
                <span className="block h-2 rounded-full border border-dashed border-red-300 bg-red-50/50" />
              ) : (
                <span className="block h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${l.ars}%`, background: TONE_HEX[l.status] }}
                  />
                </span>
              )}
            </span>
            <span className={`text-right font-bold tabular-nums ${col}`}>
              {l.status === 'gap' ? (
                <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] text-red-700">GAP</span>
              ) : (
                l.ars
              )}
            </span>
          </div>
        );
      })}
      <div className="mt-3 flex flex-wrap gap-3.5 text-[11px] text-slate-500">
        <HeatLegend color="#16a34a" label="≥85" />
        <HeatLegend color="#d97706" label="70–84" />
        <HeatLegend color="#dc2626" label="<70" />
        <span className="text-slate-400">GAP · no packs</span>
      </div>
    </CockpitCard>
  );
}

/** Issue severity maps to StatusPill variants. */
const ISSUE_PILL: Record<string, RccCaseStatus> = {
  HIGH: 'Critical',
  MED: 'Exception',
  LOW: 'Completed',
};

export function IssueWatchlistPanel({ onDrill }: { onDrill: () => void }) {
  return (
    <CockpitCard pad={false} className="h-full">
      <div className="px-4 pb-2 pt-3.5">
        <SectionTitle right={<span className="text-[11.5px] text-slate-400">5 of 14 high/critical</span>}>
          Issue watchlist
        </SectionTitle>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3.5 px-4 pb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
        <span>Issue</span>
        <span>Owner</span>
        <span>Sev</span>
        <span className="text-right">Score</span>
        <span className="text-right">Age</span>
      </div>
      {issues.map((i) => {
        const scol =
          i.score >= 75 ? 'text-red-600' : i.score >= 65 ? 'text-amber-700' : 'text-emerald-600';
        const dot =
          i.score >= 75 ? 'bg-red-600' : i.score >= 65 ? 'bg-amber-500' : 'bg-emerald-500';
        return (
          <button
            key={i.id}
            type="button"
            onClick={onDrill}
            className="grid w-full grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-3.5 border-t border-slate-200 px-4 py-2.5 text-left hover:bg-slate-50"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-slate-900">{i.title}</span>
              <span className="font-mono text-[11px] text-slate-400">{i.id}</span>
            </span>
            <span className="text-[11.5px] text-slate-500">{i.role}</span>
            <StatusPill status={ISSUE_PILL[i.sev] ?? 'Exception'} small />
            <span className={`inline-flex items-center justify-end gap-1.5 text-sm font-bold tabular-nums ${scol}`}>
              {i.score}
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            </span>
            <span
              className={`text-right text-[11.5px] font-semibold tabular-nums ${i.overdue ? 'text-red-600' : 'text-slate-400'}`}
            >
              {i.age}d{i.overdue ? ' ⚑' : ''}
            </span>
          </button>
        );
      })}
    </CockpitCard>
  );
}

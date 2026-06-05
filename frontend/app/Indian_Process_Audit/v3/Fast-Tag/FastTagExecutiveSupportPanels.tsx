'use client';

import { useMemo } from 'react';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import { buildLinkedControls, buildSettlementStrip } from './fastTagExecutiveMetrics';
import type { ExecDrillState, FastTagExecutiveContext } from './fastTagExecutiveTypes';

export function FastTagCohLinkedControlsCompact({
  controls,
  onOpenDrill,
}: {
  controls: AuditControl[];
  onOpenDrill: (d: ExecDrillState) => void;
}) {
  const linked = controls.filter(
    (c) =>
      ['FT-03', 'FT-04', 'FT-06', 'FT-07', 'FT-11', 'FT-12'].includes(c.id) &&
      (c.status === 'deficient' || c.status === 'needs-attention'),
  );
  if (linked.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200">
      <span className="text-xs font-semibold text-slate-700">Controls to Watch</span>
      {linked.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onOpenDrill({ kind: 'control', controlId: c.id })}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
            c.status === 'deficient'
              ? 'bg-red-50 text-red-800 ring-red-200'
              : 'bg-amber-50 text-amber-900 ring-amber-200'
          }`}
        >
          {c.id} {c.compliance}%
        </button>
      ))}
    </div>
  );
}

export function FastTagSettlementStrip() {
  const settlement = buildSettlementStrip();
  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
        <span>
          <span className="font-semibold text-slate-800">Settlement:</span> {settlement.matchPct}% match
        </span>
        <span className="text-slate-300">|</span>
        <span>
          {settlement.openBreaks} plaza breaks · {settlement.openAmount}
        </span>
        <span className="text-slate-300">|</span>
        <span>{settlement.breachedTat} chargebacks past TAT</span>
      </div>
    </div>
  );
}

export function FastTagLinkedControlsPanel({
  persona,
  ctx,
  onOpenDrill,
}: {
  persona: 'coh' | 'hob';
  ctx: FastTagExecutiveContext;
  onOpenDrill: (d: ExecDrillState) => void;
}) {
  const { controls, onNavigate, regionCode, deficientOnly } = ctx;
  const linked = useMemo(
    () => buildLinkedControls(controls, persona, deficientOnly),
    [controls, persona, deficientOnly],
  );

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Linked audit controls</h4>
        <button
          type="button"
          onClick={() => onNavigate({ view: 'register', registerFilter: deficientOnly ? 'deficient' : 'all' })}
          className="text-[11px] font-semibold text-sky-700 hover:text-sky-900"
        >
          Open register →
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {linked.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpenDrill({ kind: 'control', controlId: c.id })}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition-colors hover:ring-slate-400 ${
              c.status === 'deficient'
                ? 'bg-red-50 text-red-800 ring-red-200'
                : c.status === 'needs-attention'
                  ? 'bg-amber-50 text-amber-900 ring-amber-200'
                  : 'bg-slate-50 text-slate-700 ring-slate-200'
            }`}
          >
            {c.id}
            <span className="font-normal opacity-80">{c.compliance}%</span>
          </button>
        ))}
      </div>
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import { buildLinkedControls, buildSettlementStrip } from './fastTagExecutiveMetrics';
import { ExecPersonaBanner } from './FastTagExecutiveUi';
import { FastTagExecKpiStrip } from './fastTagExecutiveKpiStrip';
import type { ExecKpi } from './fastTagExecutiveData';
import type { ExecDrillState, FastTagExecutiveContext } from './fastTagExecutiveTypes';
import FastTagExecutiveDrillDrawer from './FastTagExecutiveDrillDrawer';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
type Props = {
  persona: 'coh' | 'hob';
  personaName: string;
  personaRole: string;
  kpis: ExecKpi[];
  ctx: FastTagExecutiveContext;
  cases: FastTagCaseLike[];
  children: (api: { openDrill: (d: ExecDrillState) => void }) => React.ReactNode;
};

export default function FastTagExecutiveShell({
  persona,
  personaName,
  personaRole,
  kpis,
  ctx,
  cases,
  children,
}: Props) {
  const [drill, setDrill] = useState<ExecDrillState>(null);
  const { controls, onOpenEvidence, onNavigate, regionCode, deficientOnly } = ctx;

  const linked = useMemo(
    () => buildLinkedControls(controls, persona, deficientOnly),
    [controls, persona, deficientOnly],
  );
  const settlement = buildSettlementStrip();

  return (
    <div className="w-full space-y-4">
      <ExecPersonaBanner persona={personaName} personaRole={personaRole} />

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

      <FastTagExecKpiStrip kpis={kpis} />

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
              onClick={() => setDrill({ kind: 'control', controlId: c.id })}
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

      <section aria-label="Executive analytics" className="space-y-4">
        {children({ openDrill: setDrill })}
      </section>

      <FastTagExecutiveDrillDrawer
        drill={drill}
        controls={controls}
        cases={cases}
        regionCode={regionCode}
        persona={persona}
        onClose={() => setDrill(null)}
        onOpenDrill={setDrill}
        onOpenEvidence={onOpenEvidence}
        onNavigate={(req) => {
          setDrill(null);
          onNavigate(req);
        }}
      />
    </div>
  );
}

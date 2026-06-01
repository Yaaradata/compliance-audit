'use client';

import type { RccDomain } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { StatusPill } from './StatusPill';
import { getCasesAtStage, getStageByKey } from './journeyStageUtils';
import { pct } from './journeyCommandCenterStyles';

type Props = {
  domain: RccDomain;
  stageKey: string;
  onOpenCase: (caseId: string) => void;
  onClear: () => void;
};

export function JourneyStageDrillPanel({
  domain,
  stageKey,
  onOpenCase,
  onClear,
}: Props) {
  const stage = getStageByKey(domain, stageKey);
  if (!stage) return null;

  const cases = getCasesAtStage(domain, stageKey);
  const passRate = pct(stage.passed, stage.reached);

  return (
    <div
      className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-slate-50/80 p-4"
      role="region"
      aria-label={`Stage drill-down for ${stage.label}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900">{stage.label}</h4>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {domain.name} · {passRate}% pass rate at this stage
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
        >
          Clear selection
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            { k: 'reached' as const, l: 'Reached', c: 'text-slate-900' },
            { k: 'passed' as const, l: 'Passed', c: 'text-emerald-600' },
            { k: 'review' as const, l: 'In review', c: 'text-blue-600' },
            { k: 'failed' as const, l: 'Failed', c: 'text-red-600' },
          ] as const
        ).map((m) => (
          <div key={m.k} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
            <div className={`text-lg font-bold tabular-nums ${m.c}`}>
              {stage[m.k]}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {m.l}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-2 mt-4 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Cases at this stage
        </span>
        <span className="text-[11px] text-slate-400">
          {cases.length} in sample · click for evidence
        </span>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-xs text-slate-500">
          No open cases in the audit sample for this stage. Aggregate funnel shows{' '}
          <span className="font-semibold text-red-600">{stage.failed}</span> failed and{' '}
          <span className="font-semibold text-blue-600">{stage.review}</span> in review across the
          full population ({stage.reached} reached).
        </div>
      ) : (
        <div className="grid gap-2">
          {cases.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onOpenCase(c.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:bg-slate-50"
            >
              <StatusPill status={c.status} small />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-slate-900">{c.title}</span>
                <span className="block truncate text-[11.5px] text-slate-500">{c.exception}</span>
                {c.observation ? (
                  <span className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-400">
                    {c.observation}
                  </span>
                ) : null}
              </span>
              <span className="hidden shrink-0 flex-col items-end text-right sm:flex">
                <span className="text-[11px] font-semibold text-slate-600">{c.owner?.role ?? '—'}</span>
                <span className="text-[10.5px] text-slate-400">{c.evidence?.length ?? 0} evidence</span>
              </span>
              <span className="text-slate-400">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

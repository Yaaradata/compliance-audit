'use client';

import type { RccDomain } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { getCasesAtStage } from '@/components/Indian_Process_Audit/journey/v3/journeyStageUtils';
import { StatusPill } from '@/components/Indian_Process_Audit/journey/v3/StatusPill';

/** UK v2 action queue — same layout as Indian Process Audit v3. */
export function UkJourneyActionQueue({
  domain,
  selectedStage,
  stageLabel,
  onOpenCase,
}: {
  domain: RccDomain;
  selectedStage: string | null;
  stageLabel: string | null;
  onOpenCase: (caseId: string) => void;
}) {
  const actionable = domain.cases.filter((c) => c.status !== 'Completed');
  const queue = selectedStage ? getCasesAtStage(domain, selectedStage) : actionable;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700">
          {selectedStage ? `Cases at stage · ${stageLabel}` : 'Action queue'}
        </h3>
        <span className="text-[11px] text-slate-400">
          {queue.length} case{queue.length === 1 ? '' : 's'} · click to drill into evidence
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-400">
          No actionable cases{selectedStage ? ' at this stage' : ''}.
        </div>
      ) : (
        <div className="grid gap-2">
          {queue.map((c) => (
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
              </span>
              <span className="hidden shrink-0 flex-col items-end text-right sm:flex">
                <span className="text-[11px] font-semibold text-slate-600">{c.stageLabel}</span>
                <span className="text-[10.5px] text-slate-400">{c.owner?.role ?? '—'}</span>
              </span>
              <span className="hidden shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-500 md:inline">
                {c.evidence?.length ?? 0} ev
              </span>
              <span className="text-slate-400">›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

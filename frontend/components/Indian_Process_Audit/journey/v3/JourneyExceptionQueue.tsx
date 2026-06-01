'use client';

import type { RccCase, RccDomain } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { StatusPill } from './StatusPill';

type Props = {
  domain: RccDomain;
  selectedKey: string | null;
  onOpenCase: (caseId: string) => void;
};

export function JourneyExceptionQueue({ domain, selectedKey, onOpenCase }: Props) {
  const order: Record<string, number> = { Critical: 0, Exception: 1 };
  const rows = domain.cases
    .filter((c) => c.status !== 'Completed')
    .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

  return (
    <div className="flex min-h-[220px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="text-[13px] font-bold uppercase tracking-wide text-slate-900">
          Action queue
        </div>
        <div className="text-[11.5px] text-slate-400">
          {domain.completed} completed (not shown) · {rows.length} need attention
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows.map((c) => {
          const dim =
            Boolean(selectedKey) &&
            c.failedStage !== selectedKey &&
            c.journey[selectedKey!] !== 'review';
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onOpenCase(c.id)}
              className={`flex w-full items-center gap-3 border-b border-slate-200 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                dim ? 'opacity-40' : ''
              }`}
            >
              <span className="w-16 shrink-0">
                <StatusPill status={c.status} small />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-slate-900">
                  {c.title}
                </span>
                <span className="font-mono text-[11px] text-slate-400">{c.id}</span>
              </span>
              {c.failedStage ? (
                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {c.stageLabel || c.failedStage}
                </span>
              ) : null}
              <span className="w-[170px] shrink-0 truncate text-right text-xs text-slate-500">
                {c.exception}
              </span>
              <span className="shrink-0 text-slate-400">›</span>
            </button>
          );
        })}
        {rows.length === 0 ? (
          <div className="px-6 py-8 text-center text-[13px] text-slate-400">
            No open exceptions in this domain.
          </div>
        ) : null}
      </div>
    </div>
  );
}

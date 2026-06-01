'use client';

import type { DomainControlFailure } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { IntelCard } from './IntelCard';

export function ControlFailurePanel({ failures }: { failures: DomainControlFailure[] }) {
  const max = Math.max(1, ...failures.map((f) => f.failCount));
  return (
    <IntelCard
      title="Failing controls"
      hint={`${failures.length} control${failures.length === 1 ? '' : 's'}`}
    >
      {failures.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">No failed controls in sample.</p>
      ) : (
        <ul className="grid gap-2.5">
          {failures.map((f) => (
            <li key={f.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[12.5px] font-medium text-slate-800">
                  <span className="font-mono text-[11px] text-slate-400">{f.id}</span> {f.label}
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-red-600">
                  {f.failCount}×
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${(f.failCount / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </IntelCard>
  );
}

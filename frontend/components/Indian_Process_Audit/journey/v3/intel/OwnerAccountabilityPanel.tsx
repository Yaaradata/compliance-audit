'use client';

import type { DomainOwnerLoad } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { IntelCard } from './IntelCard';

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
}

export function OwnerAccountabilityPanel({ owners }: { owners: DomainOwnerLoad[] }) {
  return (
    <IntelCard
      title="Owner accountability"
      hint={`${owners.length} accountable line${owners.length === 1 ? '' : 's'}`}
    >
      {owners.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">No open owners in sample.</p>
      ) : (
        <ul className="grid gap-2.5">
          {owners.map((o) => (
            <li key={o.role} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                {initials(o.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-slate-800">
                  {o.role}
                </span>
                <span className="block truncate text-[11px] text-slate-400">{o.site}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {o.critical > 0 ? (
                  <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-red-600">
                    {o.critical} crit
                  </span>
                ) : null}
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-slate-600">
                  {o.open} open
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </IntelCard>
  );
}

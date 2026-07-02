'use client';

import type { DomainIntel } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { UkIntelCard } from './UkIntelCard';

export function UkEvidenceReadinessPanel({ evidence }: { evidence: DomainIntel['evidence'] }) {
  const { withEvidence, actionable, documents } = evidence;
  const readyPct = actionable ? Math.round((withEvidence / actionable) * 100) : 100;
  const gap = actionable - withEvidence;
  const tone = readyPct >= 80 ? 'text-emerald-600' : readyPct >= 50 ? 'text-amber-600' : 'text-red-600';
  const bar = readyPct >= 80 ? 'bg-emerald-500' : readyPct >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <UkIntelCard title="Evidence readiness" hint={`${documents} docs attached`}>
      <div className="grid gap-4">
        <div>
          <div className="flex items-end gap-2">
            <span className={`text-[34px] font-bold leading-none tabular-nums ${tone}`}>{readyPct}%</span>
            <span className="pb-1 text-xs text-slate-500">inspection-ready</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${bar}`} style={{ width: `${readyPct}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-slate-50 py-2">
            <div className="text-lg font-bold tabular-nums text-slate-900">{withEvidence}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">With evidence</div>
          </div>
          <div className="rounded-lg bg-slate-50 py-2">
            <div className={`text-lg font-bold tabular-nums ${gap > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {gap}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Evidence gap</div>
          </div>
        </div>
      </div>
    </UkIntelCard>
  );
}

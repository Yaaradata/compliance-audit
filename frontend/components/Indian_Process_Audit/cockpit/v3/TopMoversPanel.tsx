'use client';

import { topMovers } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { CockpitCard, SectionTitle } from './CockpitPrimitives';

function MoverRow({ name, from, to, delta, good }: { name: string; from: number; to: number; delta: number; good: boolean }) {
  const col = good ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-2">
      <span className="text-[13px] font-medium text-slate-800">{name}</span>
      <span className="flex items-center gap-2.5">
        <span className="text-xs tabular-nums text-slate-400">
          {from} → {to}
        </span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${col}`}>
          {good ? '+' : ''}
          {delta}
        </span>
      </span>
    </div>
  );
}

export function TopMoversPanel() {
  return (
    <CockpitCard className="h-full">
      <SectionTitle right={<span className="text-[11.5px] text-slate-400">vs last cycle</span>}>
        Top movers
      </SectionTitle>
      <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-red-600">Deteriorated</div>
      {topMovers.deteriorated.map((m) => (
        <MoverRow key={m.name} {...m} good={false} />
      ))}
      <div className="mb-0.5 mt-3.5 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
        Improved
      </div>
      {topMovers.improved.map((m) => (
        <MoverRow key={m.name} {...m} good />
      ))}
    </CockpitCard>
  );
}

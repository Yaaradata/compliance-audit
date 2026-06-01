'use client';

import { incidents } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { CockpitCard, SectionTitle } from './CockpitPrimitives';

export function IncidentsPanel() {
  const stats = [
    { l: 'Events YTD', v: incidents.ytdEvents, c: 'text-slate-900' },
    { l: 'Gross loss', v: incidents.grossLoss, c: 'text-red-600' },
    { l: 'Recovered', v: incidents.recovered, c: 'text-emerald-600' },
    { l: 'Net loss', v: incidents.netLoss, c: 'text-amber-700' },
    { l: 'Near-miss', v: incidents.nearMiss, c: 'text-blue-600' },
  ];

  return (
    <CockpitCard className="h-full">
      <SectionTitle right={<span className="text-[11.5px] text-slate-400">FY26 to date</span>}>
        Incidents &amp; operational losses
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.l} className="rounded-lg border border-slate-200 px-1.5 py-2 text-center">
            <div className={`text-base font-bold tabular-nums ${s.c}`}>{s.v}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="mb-2 mt-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        By category
      </div>
      <div className="grid gap-2">
        {incidents.categories.map((c) => (
          <div key={c.cat} className="flex items-center gap-2.5">
            <span className="w-[142px] shrink-0 text-xs text-slate-800">{c.cat}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-indigo-500/85"
                style={{ width: `${c.weight}%` }}
              />
            </span>
            <span className="w-7 text-right text-[11.5px] tabular-nums text-slate-400">{c.count}</span>
            <span className="w-14 text-right text-xs font-semibold tabular-nums text-slate-900">
              {c.amount}
            </span>
          </div>
        ))}
      </div>
    </CockpitCard>
  );
}

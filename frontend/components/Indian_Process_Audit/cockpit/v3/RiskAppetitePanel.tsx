'use client';

import { riskAppetite } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { CockpitCard, SectionTitle } from './CockpitPrimitives';
import { TONE_CLASS, TONE_HEX } from './cockpitTokens';

export function RiskAppetitePanel() {
  return (
    <CockpitCard className="h-full">
      <SectionTitle right={<span className="text-[11.5px] text-slate-400">board-approved tolerance</span>}>
        Risk appetite vs actual
      </SectionTitle>
      <div className="grid gap-3">
        {riskAppetite.map((r) => {
          const col = TONE_CLASS[r.status];
          const w = Math.min(r.pos, 100);
          return (
            <div key={r.metric}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold text-slate-800">{r.metric}</span>
                <span className="flex items-baseline gap-2">
                  <span className={`text-[15px] font-bold tabular-nums ${col}`}>{r.actual}</span>
                  <span className="text-[11.5px] text-slate-400">limit {r.limit}</span>
                </span>
              </div>
              <div className="relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${w}%`, background: TONE_HEX[r.status] }}
                />
                <div className="absolute left-[80%] top-[-2px] h-2.5 w-0.5 bg-slate-700/50" />
              </div>
              <div className={`mt-1 text-[11.5px] ${r.status === 'bad' ? 'text-red-600' : 'text-slate-500'}`}>
                {r.note}
              </div>
            </div>
          );
        })}
      </div>
    </CockpitCard>
  );
}

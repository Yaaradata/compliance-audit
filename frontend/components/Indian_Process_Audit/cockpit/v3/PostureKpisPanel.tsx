'use client';

import { postureKpis } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { CockpitCard, Sparkline, TrendArrow } from './CockpitPrimitives';
import { TONE_CLASS } from './cockpitTokens';

const SPARK_COLOR: Record<string, string> = {
  good: '#16a34a',
  warn: '#d97706',
  bad: '#dc2626',
  gap: '#94a3b8',
};

export function PostureKpisPanel() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {postureKpis.map((k) => {
        const col = TONE_CLASS[k.tone];
        const spark = SPARK_COLOR[k.tone] ?? '#64748b';
        return (
          <CockpitCard key={k.key} className="flex justify-between gap-2.5">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {k.label}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-[34px] font-bold leading-none tabular-nums ${col}`}>
                  {k.value}
                </span>
                <span className={col}>
                  <TrendArrow dir={k.trend} />
                </span>
              </div>
              <div className="mt-1.5 text-xs text-slate-500">{k.sub}</div>
              <div className={`mt-0.5 text-[11.5px] font-semibold ${col}`}>{k.appetite}</div>
            </div>
            <div className="self-center">
              <Sparkline data={k.spark} color={spark} />
            </div>
          </CockpitCard>
        );
      })}
    </div>
  );
}

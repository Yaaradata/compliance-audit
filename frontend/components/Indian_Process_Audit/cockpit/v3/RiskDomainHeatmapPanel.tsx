'use client';

import { clocksAtRisk, riskDomains } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { SectionTitle, TrendArrow } from './CockpitPrimitives';
import { TONE_BG, TONE_CLASS, TONE_HEX } from './cockpitTokens';

export function RiskDomainHeatmapPanel({ onDrill }: { onDrill: (linkId: string) => void }) {
  return (
    <section>
      <SectionTitle
        right={
          <span className="text-xs text-slate-500">
            9 risk domains · inherent · residual · trend · click to drill into failing controls
          </span>
        }
      >
        <span className="inline-flex flex-wrap items-center gap-2">
          Risk domain heatmap
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
            {clocksAtRisk} CLOCKS AT-RISK
          </span>
        </span>
      </SectionTitle>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {riskDomains.map((d) => {
          const border = TONE_HEX[d.status];
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onDrill(d.link)}
              className={`rounded-xl border p-3.5 text-left transition-colors hover:brightness-[0.98] ${TONE_BG[d.status]}`}
              style={{ borderColor: `${border}44` }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{d.name}</span>
                <span className="inline-flex shrink-0 items-center gap-1.5">
                  <span className={`text-[22px] font-bold tabular-nums ${TONE_CLASS[d.status]}`}>
                    {d.res}
                  </span>
                  <span className={TONE_CLASS[d.status]}>
                    <TrendArrow dir={d.trend} />
                  </span>
                  {d.aiFlag ? <span title="AI insight">✨</span> : null}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-snug text-slate-500">{d.note}</p>
              <p className="mt-2 text-[10.5px] tabular-nums text-slate-400">
                inherent {d.inherent} · residual {d.res} · →
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

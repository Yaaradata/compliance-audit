'use client';

import type { RccCase, RccDomain } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { JOURNEY_STEP } from './journeyCommandCenterStyles';

export function JourneyMiniStrip({
  domain,
  kase,
}: {
  domain: RccDomain;
  kase: RccCase;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {domain.stageKeys.map((key) => {
        const st = JOURNEY_STEP[kase.journey[key] ?? 'blocked'];
        return (
          <div key={key} className="w-[34px] text-center">
            <div
              className={`flex h-[22px] items-center justify-center rounded-md border text-xs font-bold ${st.box}`}
            >
              {st.char}
            </div>
            <div className={`mt-0.5 text-[9px] tracking-wide ${st.text}`}>{key}</div>
          </div>
        );
      })}
    </div>
  );
}

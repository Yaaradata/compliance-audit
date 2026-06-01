'use client';

import { aiWall } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { CockpitCard } from './CockpitPrimitives';
import { TAG_BORDER, TAG_CLASS } from './cockpitTokens';

export function AiSummaryWallPanel({ onDrill }: { onDrill: (linkId: string) => void }) {
  return (
    <CockpitCard pad={false} className="flex h-full min-h-[320px] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
        <div>
          <div className="text-sm font-bold text-slate-900">✨ AI Summary Wall</div>
          <div className="mt-0.5 text-[11.5px] text-slate-400">
            {aiWall.reviewQueue} in review queue · Updated {aiWall.updated}
          </div>
        </div>
        <span className="cursor-pointer text-xs font-semibold text-indigo-600">
          Review queue ({aiWall.reviewQueue}) →
        </span>
      </div>
      <div className="max-h-[286px] flex-1 overflow-y-auto p-3">
        <div className="grid gap-2.5">
          {aiWall.items.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onDrill(a.link)}
              className={`rounded-lg border border-slate-200 border-l-[3px] bg-white px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${TAG_BORDER[a.tag]}`}
            >
              <div className="flex justify-between gap-2">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide ${TAG_CLASS[a.tag]}`}
                >
                  {a.tag}
                </span>
                <span className="text-xs font-bold tabular-nums text-slate-500">
                  {a.confidence}%
                </span>
              </div>
              <div className="mt-1.5 text-[13px] font-semibold leading-snug text-slate-900">
                {a.title}
              </div>
              <div className="mt-1 text-xs leading-snug text-slate-500">
                <b className="text-slate-800">Recommendation:</b> {a.recommendation}
              </div>
            </button>
          ))}
        </div>
      </div>
    </CockpitCard>
  );
}

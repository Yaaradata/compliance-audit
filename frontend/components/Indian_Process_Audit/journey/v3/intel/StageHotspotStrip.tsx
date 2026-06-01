'use client';

import type { DomainHotspot } from '@/lib/Indian_Process_Audit/riskCommandCenter';

export function StageHotspotStrip({
  hotspots,
  selectedStage,
  onSelectStage,
}: {
  hotspots: DomainHotspot[];
  selectedStage: string | null;
  onSelectStage: (key: string) => void;
}) {
  if (hotspots.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
        No stage hotspots — every SOP stage is passing in this sample.
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        Stage hotspots
      </span>
      {hotspots.map((h) => {
        const active = selectedStage === h.stageKey;
        const tone = h.failed > 0 ? 'red' : 'blue';
        return (
          <button
            key={h.stageKey}
            type="button"
            onClick={() => onSelectStage(h.stageKey)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
              active
                ? 'border-slate-900 bg-slate-900 text-white'
                : tone === 'red'
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {h.stageLabel}
            <span className="tabular-nums opacity-80">
              {h.failed > 0 ? `${h.failed}✕` : `${h.review}◔`} · {h.passRate}%
            </span>
          </button>
        );
      })}
    </div>
  );
}

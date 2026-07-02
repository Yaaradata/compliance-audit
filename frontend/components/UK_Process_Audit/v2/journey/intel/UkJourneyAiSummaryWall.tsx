'use client';

import type { DomainAiInsight } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { TAG_BADGE, TAG_BORDER } from '@/components/Indian_Process_Audit/journey/v3/intel/insightTokens';

type Props = {
  insights: DomainAiInsight[];
  domainName: string;
  updated?: string;
  onOpenCase: (caseId: string) => void;
  className?: string;
};

/**
 * UK v2 AI Summary Wall — same scroll contract as Indian v3: bounded column beside
 * the funnel, inner list scrolls only when it overflows; scroll chains to the
 * page `<main>` region at the top/bottom edge (no overscroll-contain trap).
 */
export function UkJourneyAiSummaryWall({
  insights,
  domainName,
  updated = '06:45 BST',
  onOpenCase,
  className = '',
}: Props) {
  const queue = insights.filter((i) => i.severity !== 'info').length;

  return (
    <aside
      aria-label="AI Summary Wall"
      className={`flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 shadow-sm ${className}`}
    >
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <span className="text-amber-500" aria-hidden>
            ✨
          </span>
          AI Summary Wall
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {queue} insight{queue === 1 ? '' : 's'} for {domainName} · Updated {updated}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {insights.map((a) => {
          const clickable = Boolean(a.caseId);
          return (
            <button
              key={a.id}
              type="button"
              disabled={!clickable}
              onClick={() => a.caseId && onOpenCase(a.caseId)}
              className={`rounded-lg border border-slate-200 border-l-[3px] bg-white px-3 py-2.5 text-left transition-colors ${
                TAG_BORDER[a.tag]
              } ${clickable ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide ${TAG_BADGE[a.tag]}`}
                >
                  {a.tag}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold tabular-nums text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {a.confidence}%
                </span>
              </div>
              <div className="mt-1.5 text-[13px] font-semibold leading-snug text-slate-900">{a.title}</div>
              <div className="mt-1 text-[11.5px] leading-snug text-slate-500">
                <b className="text-slate-700">Recommendation:</b> {a.recommendation}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

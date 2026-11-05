"use client";

import type { TopLineTile } from "@/lib/ukbankingaudit/v8/croReportView";

const TONE: Record<TopLineTile["tone"], string> = {
  red: "border-l-red-500",
  amber: "border-l-amber-500",
  green: "border-l-emerald-500",
  neutral: "border-l-slate-300",
};

type Props = {
  tiles: TopLineTile[];
  onOpen: (tile: TopLineTile) => void;
};

/** What matters this period: five tiles, one figure each. A tile is one click target. */
export function TopLineSummary({ tiles, onOpen }: Props) {
  return (
    <section aria-label="Top line">
      <h2 className="mb-2 text-base font-bold text-slate-900">Top line</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            title={tile.detail}
            aria-label={`${tile.label}: ${tile.detail}`}
            onClick={() => onOpen(tile)}
            className={`flex h-full flex-col rounded-xl border border-l-4 border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:shadow-md ${TONE[tile.tone]}`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{tile.label}</span>
            <span className="mt-1 text-xl font-extrabold leading-tight tracking-tight text-slate-900">{tile.value}</span>
            <span className="mt-1 line-clamp-2 text-xs leading-snug text-slate-600">{tile.note}</span>
            {tile.reference ? (
              <span className="mt-auto pt-2 font-mono text-[10px] text-slate-400">{tile.reference}</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}

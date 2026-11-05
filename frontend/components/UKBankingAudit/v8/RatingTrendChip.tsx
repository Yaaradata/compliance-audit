"use client";

import type { TrendView } from "@/lib/ukbankingaudit/v8/boardView";

const TREND_STYLES: Record<TrendView["direction"], { arrow: string; className: string; word: string }> = {
  worse: { arrow: "▲", className: "bg-red-100 text-red-700", word: "Worse" },
  better: { arrow: "▼", className: "bg-emerald-100 text-emerald-700", word: "Better" },
  flat: { arrow: "▬", className: "bg-slate-200 text-slate-600", word: "No change" },
};

/** Arrow beside a RAG colour. With showText it also states the earlier colour. */
export function RatingTrendChip({ trend, showText = false }: { trend: TrendView; showText?: boolean }) {
  const style = TREND_STYLES[trend.direction];
  return (
    <span
      title={trend.tooltip}
      aria-label={`${style.word}. ${trend.tooltip}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${style.className}`}
    >
      <span aria-hidden="true">{style.arrow}</span>
      {showText ? <span className="font-semibold">{trend.chipText}</span> : null}
    </span>
  );
}

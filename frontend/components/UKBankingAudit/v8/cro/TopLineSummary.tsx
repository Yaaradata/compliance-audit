"use client";

import type { SummarySentence } from "@/lib/ukbankingaudit/v8/croReportView";

type Props = {
  sentences: SummarySentence[];
  onOpenEvidence: (ref: string) => void;
};

/** What matters this period, in plain sentences that cite the records behind them. */
export function TopLineSummary({ sentences, onOpenEvidence }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-2 text-base font-bold text-slate-900">Top line</h2>
      <ul className="space-y-1.5">
        {sentences.map((sentence) => (
          <li key={sentence.text} className="text-[13.5px] leading-relaxed text-slate-800">
            {sentence.text}
            {sentence.cites.map((ref) => (
              <button
                key={ref}
                type="button"
                onClick={() => onOpenEvidence(ref)}
                className="ml-1.5 font-mono text-[10px] text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
              >
                {ref}
              </button>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

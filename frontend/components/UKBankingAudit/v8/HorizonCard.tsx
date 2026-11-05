"use client";

import type { ReactNode } from "react";
import { canDisposition } from "@/lib/ukbankingaudit/v8/dispositions";
import { useBoardRole } from "./boardRoleContext";

const ACTION_CLASS =
  "rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50";

type Props = {
  kicker: string;
  title: string;
  source: string;
  sourceUrl?: string;
  date: string;
  summary: string;
  categoryLabel: string;
  owner?: string;
  /** Extra controls or facts, such as the relevance selector. */
  children?: ReactNode;
  onInvestigate: () => void;
  onAccept: () => void;
};

/** External item in Horizon Scanning: what happened, where it was reported, and our response. */
export function HorizonCard({
  kicker,
  title,
  source,
  sourceUrl,
  date,
  summary,
  categoryLabel,
  owner,
  children,
  onInvestigate,
  onAccept,
}: Props) {
  const role = useBoardRole();
  return (
    <article className="rounded-[10px] border border-slate-200 bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{kicker}</div>
      <h3 className="mt-0.5 text-[13px] font-bold leading-snug text-slate-900">{title}</h3>
      <p className="mt-0.5 text-[11px] text-slate-500">
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
          >
            {source}
          </a>
        ) : (
          source
        )}{" "}
        · {date}
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-slate-700">{summary}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
          {categoryLabel}
        </span>
        {owner ? <span className="text-[11px] text-slate-600">Owner: {owner}</span> : null}
      </div>
      {children}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <button type="button" className={ACTION_CLASS} onClick={onInvestigate}>
          Open investigation
        </button>
        {canDisposition(role) ? (
          <button type="button" className={ACTION_CLASS} onClick={onAccept}>
            Accept with reason
          </button>
        ) : null}
      </div>
    </article>
  );
}

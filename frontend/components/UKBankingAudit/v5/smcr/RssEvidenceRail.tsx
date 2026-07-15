"use client";

import type { RssEvidenceState } from "@/lib/ukbankingaudit/v5/smcrEvidence";

const RAIL_META: Record<
  RssEvidenceState,
  { title: string; className: string; style?: React.CSSProperties }
> = {
  filled: { title: "Evidence artefact within cadence", className: "bg-slate-700" },
  hollow: {
    title: "Score is an assertion — no evidence artefact",
    className: "border border-slate-400 bg-transparent",
  },
  hatched: {
    title: "Cadence unconfirmed — unarmed",
    className: "",
    style: {
      backgroundImage: "repeating-linear-gradient(45deg,#e2e8f0 0 2px,#f8fafc 2px 4px)",
    },
  },
};

/** One rail beneath an RSS component score — filled · hollow · hatched. */
export function RssEvidenceRail({ state }: { state: RssEvidenceState }) {
  const meta = RAIL_META[state];
  return (
    <div
      role="img"
      aria-label={meta.title}
      title={meta.title}
      className={`mt-1 box-border h-[3px] w-full rounded-full ${meta.className}`}
      style={meta.style}
    />
  );
}

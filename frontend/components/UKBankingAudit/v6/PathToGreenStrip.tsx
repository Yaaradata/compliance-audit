"use client";

import { getPathToGreen } from "@/lib/ukbankingaudit/v6/pathToGreen";

type Props = {
  entityRef: string;
};

const ESCALATION_LABEL: Record<string, string> = {
  none: "No escalation",
  "raised-to-committee": "Raised to committee",
  "raised-to-board": "Raised to board",
};

/**
 * ProvenanceBadge sits on a SEPARATE visual axis from RAG severity — violet
 * family, never red/amber/green, and never folded into the severity dot.
 *   source "system" → solid dot  (STATED, read from a system of record)
 *   source "email"  → hollow dot (INFERRED, parsed from unstructured text)
 */
function ProvenanceBadge({ source }: { source: "system" | "email" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700">
      {source === "system" ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" aria-hidden />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-violet-500 bg-transparent" aria-hidden />
      )}
      {source}
    </span>
  );
}

export function PathToGreenStrip({ entityRef }: Props) {
  const path = getPathToGreen(entityRef);

  if (!path) {
    return (
      <div className="mt-1.5 rounded-md border border-dashed border-slate-200 bg-slate-50 px-2.5 py-1.5">
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Path to Green</div>
        <p className="mt-0.5 text-[10.5px] italic text-slate-400">No path to green recorded.</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Path to Green</div>
      <div className="mt-0.5 text-[10.5px] text-slate-600">
        Owner {path.owner} · Target {path.targetDate ?? "—"} ·{" "}
        {ESCALATION_LABEL[path.escalation] ?? path.escalation}
        {path.lastUpdate ? ` · Updated ${path.lastUpdate.at}` : ""}
      </div>
      {path.lastUpdate ? (
        <div className="mt-1 flex items-start justify-between gap-2">
          <p className="text-[10.5px] italic leading-snug text-slate-700">&ldquo;{path.lastUpdate.text}&rdquo;</p>
          <ProvenanceBadge source={path.lastUpdate.source} />
        </div>
      ) : null}
    </div>
  );
}

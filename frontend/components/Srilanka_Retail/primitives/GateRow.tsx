import type { ReactNode } from "react";

export type GateTone = "ok" | "attention" | "neutral";

const TONE: Record<GateTone, { dot: string; text: string }> = {
  ok: { dot: "bg-emerald-400", text: "text-emerald-300" },
  attention: { dot: "bg-amber-400", text: "text-amber-300" },
  neutral: { dot: "bg-slate-500", text: "text-slate-300" },
};

/**
 * A labelled gate/check row with a status indicator and trailing content.
 * Shared across the QC panel (C2) and dispatch checks (C3). Red is never used
 * here — gating states resolve to green/amber/neutral only.
 */
export function GateRow({
  label,
  sublabel,
  tone = "neutral",
  statusLabel,
  trailing,
}: {
  label: string;
  sublabel?: string;
  tone?: GateTone;
  statusLabel?: string;
  trailing?: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${t.dot}`} aria-hidden />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-200">{label}</span>
          {sublabel ? <span className="text-xs text-slate-500">{sublabel}</span> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {statusLabel ? (
          <span className={`text-xs font-semibold uppercase tracking-wide ${t.text}`}>
            {statusLabel}
          </span>
        ) : null}
        {trailing}
      </div>
    </div>
  );
}

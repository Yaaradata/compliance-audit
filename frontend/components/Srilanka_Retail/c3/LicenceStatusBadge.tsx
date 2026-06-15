import type { LicenceStatus } from "@/lib/Srilanka_Retail/types";

/**
 * Licence status pill. VALID = green; EXPIRING / LAPSED = amber (attention).
 * Red is never used here — a lapsed licence is an attention state, not a
 * rupees-at-risk figure.
 */
const STYLE: Record<LicenceStatus, { cls: string; label: string }> = {
  VALID: { cls: "bg-emerald-950/60 text-emerald-300 border-emerald-900/70", label: "Valid" },
  EXPIRING: { cls: "bg-amber-950/60 text-amber-300 border-amber-800/70", label: "Expiring" },
  LAPSED: { cls: "bg-amber-900/50 text-amber-200 border-amber-700/80", label: "Lapsed" },
};

export function LicenceStatusBadge({ status }: { status: LicenceStatus }) {
  const s = STYLE[status];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

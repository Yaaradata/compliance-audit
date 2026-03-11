"use client";

import { cn } from "@/lib/utils";

function statusColor(pct: number, accent: string): { bg: string; border: string; color: string } {
  if (pct >= 90) return { bg: "#dcfce7", border: "#22c55e", color: "#166534" };
  if (pct >= 60) return { bg: "#fff7ed", border: "#f97316", color: "#9a3412" };
  if (pct > 0) return { bg: "#eff6ff", border: "#3b82f6", color: "#1e40af" };
  return { bg: "#f8fafc", border: "#e2e8f0", color: "#64748b" };
}

export function EvidenceItemBadge({
  id,
  name,
  completionPct = 0,
  accent,
  selected,
  onClick,
}: {
  id: string;
  name: string;
  completionPct?: number;
  accent: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const style = selected
    ? { background: accent, borderColor: accent, color: "#fff" }
    : statusColor(completionPct, accent);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-xs font-medium transition-colors duration-200",
        "cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary)]"
      )}
      style={style}
      aria-pressed={selected}
      aria-label={`Evidence item ${id}: ${name}. ${selected ? "Selected" : "Click to select"}`}
      title={name}
    >
      <span className="font-bold">{id}</span>
    </button>
  );
}

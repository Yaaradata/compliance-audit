"use client";

import { useMemo, useState } from "react";
import { ScoreRing } from "@/components/ui/score-ring";
import { ControlBadge } from "@/components/ui/control-badge";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DomainConfig } from "@/lib/types";

function RiskBadge({ pct }: { pct: number }) {
  const color = getStatusColor(pct);
  const label = getStatusLabel(pct);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: `${color}20`, color }}
      title={`Completion: ${pct}% — ${label}`}
    >
      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

export function CompactDomainHeader({
  config,
  completionPct,
  className,
}: {
  config: DomainConfig;
  completionPct: number;
  className?: string;
}) {
  const controlRefs = useMemo(() => {
    const seen = new Set<string>();
    const refs: { id: string; ma: string }[] = [];
    for (const item of config.evidenceItems) {
      for (const c of item.controls) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          refs.push({ id: c.id, ma: c.ma });
        }
      }
    }
    return refs;
  }, [config.evidenceItems]);

  const [showControls, setShowControls] = useState(false);

  return (
    <header
      className={cn("border-b border-[var(--border)] bg-[var(--background)]", className)}
      style={{ minHeight: "56px" }}
    >
      <div className="flex flex-col gap-2 py-3 px-1">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="shrink-0" title={`${completionPct}% complete`}>
            <ScoreRing pct={completionPct} size={44} stroke={4} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-[var(--foreground)] leading-tight truncate">
              Domain {config.id}: {config.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--foreground-muted)] flex-wrap">
              <span>{config.evidenceItems.length} evidence items</span>
              <span aria-hidden>·</span>
              <span>{config.allControls.length} controls</span>
              <RiskBadge pct={completionPct} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowControls((s) => !s)}
            className="shrink-0 text-[11px] font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 text-white"
            style={{ backgroundColor: config.color }}
            aria-expanded={showControls}
          >
            {showControls ? "Hide controls" : "Show controls"}
          </button>
        </div>
        {showControls && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[var(--border)]">
            {controlRefs.map((c) => (
              <ControlBadge key={c.id} id={c.id} ma={c.ma} />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

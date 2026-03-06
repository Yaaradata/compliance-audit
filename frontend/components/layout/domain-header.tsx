"use client";

import { useMemo } from "react";
import { ScoreRing } from "@/components/ui/score-ring";
import { ControlBadge } from "@/components/ui/control-badge";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import type { DomainConfig } from "@/lib/types";

function RiskBadge({ pct }: { pct: number }) {
  const color = getStatusColor(pct);
  const label = getStatusLabel(pct);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `${color}20`, color }}
      title={`Completion: ${pct}% — ${label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {label}
    </span>
  );
}

export function DomainHeader({ config, completionPct }: { config: DomainConfig; completionPct: number }) {
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

  return (
    <div
      className="rounded-2xl p-6 mb-6 border transition-shadow duration-200 hover:shadow-lg"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="flex items-center gap-6 flex-wrap">
        <div className="shrink-0" title={`${completionPct}% complete`}>
          <ScoreRing pct={completionPct} size={80} stroke={6} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              Domain {config.id}: {config.name}
            </h1>
            <RiskBadge pct={completionPct} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
            <span>{config.evidenceItems.length} evidence items</span>
            <span>·</span>
            <span>{config.allControls.length} controls</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        {controlRefs.map((c) => (
          <ControlBadge key={c.id} id={c.id} ma={c.ma} />
        ))}
      </div>
    </div>
  );
}

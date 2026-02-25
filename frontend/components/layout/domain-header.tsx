"use client";
import { useMemo } from "react";
import { ScoreRing } from "@/components/ui/score-ring";
import { ControlBadge } from "@/components/ui/control-badge";
import type { DomainConfig } from "@/lib/types";

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
    <div className="rounded-xl p-5 text-white mb-5" style={{ background: config.gradient }}>
      <div className="flex items-center gap-4">
        <ScoreRing pct={completionPct} size={64} stroke={5} />
        <div className="flex-1">
          <h1 className="text-lg font-bold">Domain {config.id}: {config.name}</h1>
          <p className="text-sm opacity-80 mt-1">{config.evidenceItems.length} evidence items · {config.allControls.length} controls</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {controlRefs.map((c) => (
          <ControlBadge key={c.id} id={c.id} ma={c.ma} />
        ))}
      </div>
    </div>
  );
}

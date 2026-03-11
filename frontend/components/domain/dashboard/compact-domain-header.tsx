"use client";

import { useMemo } from "react";
import { ScoreRing } from "@/components/ui/score-ring";
import { EvidenceItemBadge } from "@/components/ui/evidence-item-badge";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DomainConfig, EvidenceItem } from "@/lib/types";

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
  activeItem,
  onSelectItem,
  completionByItem = {},
  className,
}: {
  config: DomainConfig;
  completionPct: number;
  activeItem?: string;
  onSelectItem?: (id: string) => void;
  completionByItem?: Record<string, number>;
  className?: string;
}) {
  const itemsToShow: EvidenceItem[] = useMemo(() => {
    const hasSubGroups = config.subGroups && config.subGroups.length > 0;
    if (hasSubGroups) {
      return config.subGroups.flatMap((sg) =>
        sg.items
          .map((itemId) => config.evidenceItems.find((e) => e.id === itemId))
          .filter((e): e is EvidenceItem => e != null)
      );
    }
    return config.evidenceItems;
  }, [config.evidenceItems, config.subGroups]);

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
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[var(--border)]">
          {itemsToShow.map((item) => (
            <EvidenceItemBadge
              key={item.id}
              id={item.id}
              name={item.name}
              completionPct={completionByItem[item.id] ?? 0}
              accent={config.color}
              selected={activeItem === item.id}
              onClick={onSelectItem ? () => onSelectItem(item.id) : undefined}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

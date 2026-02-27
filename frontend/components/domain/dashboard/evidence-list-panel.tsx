"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { DomainConfig, EvidenceItem } from "@/lib/types";
import { PriorityBadge } from "@/components/ui/badge";

function statusChip(
  priority: string,
  completionPct?: number,
  accent?: string
): { label: string; className: string; style?: React.CSSProperties } {
  const pct = completionPct ?? 0;
  const accentBg = accent ? { backgroundColor: `${accent}18`, color: accent } as React.CSSProperties : undefined;
  if (pct >= 90) return { label: "Satisfied", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
  if (pct >= 60) return { label: "Partial", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" };
  if (pct > 0) return { label: "In progress", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400" };
  if (priority === "CRITICAL") return { label: "Critical", className: "bg-red-500/15 text-red-600 dark:text-red-400" };
  if (priority === "HIGH") return { label: "High", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" };
  return { label: "Missing", className: "bg-slate-500/15 text-slate-600 dark:text-slate-400", style: accentBg };
}

export function EvidenceListPanel({
  config,
  activeItem,
  onSelectItem,
  completionByItem = {},
  className,
}: {
  config: DomainConfig;
  activeItem: string;
  onSelectItem: (id: string) => void;
  completionByItem?: Record<string, number>;
  className?: string;
}) {
  const [filter, setFilter] = useState("");
  const hasSubGroups = config.subGroups && config.subGroups.length > 0;
  const itemsToShow: EvidenceItem[] = hasSubGroups
    ? config.subGroups.flatMap((sg) =>
        sg.items
          .map((itemId) => config.evidenceItems.find((e) => e.id === itemId))
          .filter((e): e is EvidenceItem => e != null)
      )
    : config.evidenceItems;

  const filtered = useMemo(() => {
    if (!filter.trim()) return itemsToShow;
    const q = filter.toLowerCase();
    return itemsToShow.filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }, [itemsToShow, filter]);

  const accent = config.color;

  return (
    <div
      className={cn("flex flex-col h-full min-h-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden", className)}
      style={{ ["--evidence-panel-accent" as string]: accent }}
    >
      <div className="shrink-0 p-3 border-b border-[var(--border)] pl-4 border-l-4 rounded-l-xl" style={{ borderLeftColor: accent }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-200" style={{ color: accent }}>
          Evidence items
        </h2>
        <input
          type="search"
          placeholder="Search items…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[var(--evidence-panel-accent)] transition-all duration-200"
          aria-label="Filter evidence items"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {hasSubGroups
          ? config.subGroups.map((sg) => {
              const groupItems = sg.items
                .map((id) => config.evidenceItems.find((e) => e.id === id))
                .filter((e): e is EvidenceItem => e != null)
                .filter((item) => filtered.some((f) => f.id === item.id));
              if (groupItems.length === 0) return null;
              return (
                <div key={sg.name} className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1.5 text-[var(--foreground-muted)]">
                    {sg.name}
                  </div>
                  {groupItems.map((item) => {
                    const active = activeItem === item.id;
                    const pct = completionByItem[item.id] ?? 0;
                    const chip = statusChip(item.priority, pct, accent);
                    const leftColor = active
                      ? accent
                      : pct >= 90
                        ? "var(--success)"
                        : pct >= 60
                          ? "var(--warning)"
                          : pct > 0
                            ? "var(--danger)"
                            : "var(--border)";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectItem(item.id)}
                        className={cn(
                          "w-full text-left rounded-lg border-2 transition-all duration-200 flex min-h-[56px] max-h-[64px] overflow-hidden",
                          "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--evidence-panel-accent)]",
                          active
                            ? "shadow-md"
                            : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--evidence-panel-accent)]/50 hover:bg-[var(--background)]"
                        )}
                        style={
                          active
                            ? { borderColor: accent, backgroundColor: `${accent}12` }
                            : undefined
                        }
                      >
                        <span className="w-1.5 shrink-0 rounded-l transition-colors duration-200" style={{ background: leftColor }} aria-hidden />
                        <div className="flex-1 p-2 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold shrink-0" style={{ color: accent }}>
                              {item.id}
                            </span>
                            <span className="text-xs font-medium truncate flex-1 text-[var(--foreground)]">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <PriorityBadge priority={item.priority} />
                            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", chip.className)} style={chip.style}>
                              {chip.label}
                            </span>
                            <span className="text-[10px] text-[var(--foreground-muted)]">{item.controlCount} ctrl</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })
          : filtered.map((item) => {
              const active = activeItem === item.id;
              const pct = completionByItem[item.id] ?? 0;
              const chip = statusChip(item.priority, pct, accent);
              const leftColor = active
                ? accent
                : pct >= 90
                  ? "var(--success)"
                  : pct >= 60
                    ? "var(--warning)"
                    : pct > 0
                      ? "var(--danger)"
                      : "var(--border)";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectItem(item.id)}
                  className={cn(
                    "w-full text-left rounded-lg border-2 transition-all duration-200 flex min-h-[56px] max-h-[64px] overflow-hidden mb-1.5",
                    "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--evidence-panel-accent)]",
                    active
                      ? "shadow-md"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--evidence-panel-accent)]/50 hover:bg-[var(--background)]"
                  )}
                  style={
                    active
                      ? { borderColor: accent, backgroundColor: `${accent}12` }
                      : undefined
                  }
                >
                  <span className="w-1.5 shrink-0 rounded-l transition-colors duration-200" style={{ background: leftColor }} aria-hidden />
                  <div className="flex-1 p-2 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold shrink-0" style={{ color: accent }}>
                        {item.id}
                      </span>
                      <span className="text-xs font-medium truncate flex-1 text-[var(--foreground)]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <PriorityBadge priority={item.priority} />
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", chip.className)} style={chip.style}>
                        {chip.label}
                      </span>
                      <span className="text-[10px] text-[var(--foreground-muted)]">{item.controlCount} ctrl</span>
                    </div>
                  </div>
                </button>
              );
            })}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import type { DomainConfig, EvidenceItem } from "@/lib/types";
import { PriorityBadge } from "@/components/ui/badge";

function statusChip(priority: string, completionPct?: number): { label: string; style: React.CSSProperties } {
  const pct = completionPct ?? 0;
  if (pct >= 90) return { label: "Satisfied", style: { background: "var(--success-bg)", color: "var(--success)" } };
  if (pct >= 60) return { label: "Partial", style: { background: "var(--warning-bg)", color: "var(--warning)" } };
  if (pct > 0) return { label: "In progress", style: { background: "var(--info-bg)", color: "var(--info)" } };
  if (priority === "CRITICAL") return { label: "Critical", style: { background: "var(--danger-bg)", color: "var(--danger)" } };
  if (priority === "HIGH") return { label: "High", style: { background: "var(--warning-bg)", color: "var(--warning)" } };
  return { label: "Missing", style: { background: "var(--primary-muted)", color: "var(--primary)" } };
}

export function DomainLeftRail({
  config,
  activeItem,
  onSelectItem,
  completionByItem = {},
}: {
  config: DomainConfig;
  activeItem: string;
  onSelectItem: (id: string) => void;
  completionByItem?: Record<string, number>;
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

  const renderItem = (item: EvidenceItem) => {
    const active = activeItem === item.id;
    const pct = completionByItem[item.id] ?? 0;
    const chip = statusChip(item.priority, pct);
    const leftBarColor = pct >= 90 ? "var(--success)" : pct >= 60 ? "var(--warning)" : pct > 0 ? "var(--danger)" : "var(--border)";

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelectItem(item.id)}
        className="w-full text-left rounded-xl border transition-all duration-200 group overflow-hidden"
        style={{
          background: active ? "var(--surface)" : "transparent",
          borderColor: active ? "var(--primary)" : "var(--border)",
          marginBottom: "var(--space-unit)",
          boxShadow: active ? "var(--shadow-md)" : "none",
        }}
      >
        <div className="flex min-h-0">
          <span
            className="w-1 shrink-0 transition-colors duration-200"
            style={{ background: leftBarColor }}
            aria-hidden
          />
          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold shrink-0" style={{ color: config.color }}>
                {item.id}
              </span>
              <span className="text-sm font-medium truncate flex-1" style={{ color: "var(--foreground)" }}>
                {item.name}
              </span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                style={chip.style}
              >
                {chip.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <PriorityBadge priority={item.priority} />
              <span className="text-[11px]" style={{ color: "var(--foreground-subtle)" }}>
                {item.controlCount} ctrl{item.controlCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-60 shrink-0 flex flex-col" style={{ gap: "var(--space-unit)" }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground-muted)" }}>
        Evidence items
      </div>
      <input
        type="search"
        placeholder="Search items…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="input w-full px-3 py-2 text-sm mb-1"
        aria-label="Filter evidence items"
      />
      {hasSubGroups ? (
        config.subGroups.map((sg) => {
          const groupItems = sg.items
            .map((id) => config.evidenceItems.find((e) => e.id === id))
            .filter((e): e is EvidenceItem => e != null)
            .filter((item) => filtered.some((f) => f.id === item.id));
          if (groupItems.length === 0) return null;
          return (
            <div key={sg.name}>
              <div className="text-[10px] font-bold uppercase tracking-wider px-2 mb-2" style={{ color: sg.color }}>
                {sg.name}
              </div>
              {groupItems.map(renderItem)}
            </div>
          );
        })
      ) : (
        filtered.map(renderItem)
      )}
    </div>
  );
}

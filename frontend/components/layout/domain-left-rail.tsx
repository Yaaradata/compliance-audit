"use client";
import type { DomainConfig, EvidenceItem } from "@/lib/types";
import { PriorityBadge } from "@/components/ui/badge";

export function DomainLeftRail({
  config, activeItem, onSelectItem,
}: {
  config: DomainConfig;
  activeItem: string;
  onSelectItem: (id: string) => void;
}) {
  return (
    <div className="w-56 shrink-0 space-y-3">
      {config.subGroups.map((sg) => (
        <div key={sg.name}>
          <div className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1" style={{ color: sg.color }}>
            {sg.name}
          </div>
          {sg.items.map((itemId) => {
            const item = config.evidenceItems.find((e) => e.id === itemId);
            if (!item) return null;
            const active = activeItem === itemId;
            return (
              <button key={itemId} onClick={() => onSelectItem(itemId)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors mb-0.5 ${active ? "bg-white shadow-sm border font-semibold" : "hover:bg-gray-50"}`}
                style={active ? { borderColor: config.color } : {}}>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[11px]" style={{ color: config.color }}>{item.id}</span>
                  <span className="truncate flex-1">{item.name}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <PriorityBadge priority={item.priority} />
                  <span className="text-[10px] text-gray-400">{item.controlCount} ctrl{item.controlCount > 1 ? "s" : ""}</span>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

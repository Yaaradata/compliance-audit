"use client";
import { useState } from "react";
import type { PerControlSufficiency } from "@/lib/types";
import { ControlBadge } from "@/components/ui/control-badge";

export function PerControlPanel({ items }: { items?: PerControlSufficiency[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!items?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between text-xs font-semibold text-gray-700">
        <span>Per-Control Requirements ({items.length})</span>
        <span className="text-gray-400 text-[10px]">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <div key={item.controlId} className="flex items-start gap-2 text-[11px]">
              <ControlBadge id={item.controlId} ma="M" />
              <span className="text-gray-600">{item.requirement}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

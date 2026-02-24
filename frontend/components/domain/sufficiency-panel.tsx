"use client";
import { useState } from "react";
import type { SufficiencyDimension } from "@/lib/types";

export function SufficiencyPanel({ dimensions, color }: { dimensions: SufficiencyDimension[]; color: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!dimensions.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-xs font-semibold text-gray-700 mb-2">Sufficiency Dimensions</div>
      <div className="space-y-1">
        {dimensions.map((d) => (
          <div key={d.dim} className="rounded border border-gray-100">
            <button onClick={() => setExpanded((p) => ({ ...p, [d.dim]: !p[d.dim] }))}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-gray-50 transition-colors">
              <span className="font-mono font-bold text-[10px]" style={{ color }}>{d.dim}</span>
              <span className="flex-1">{d.label}</span>
              <span className="text-gray-400 text-[10px]">{expanded[d.dim] ? "▲" : "▼"}</span>
            </button>
            {expanded[d.dim] && (
              <div className="px-2 pb-2 text-[11px] text-gray-500 border-t border-gray-50 pt-1.5" style={{ borderLeftWidth: 3, borderLeftColor: color }}>
                {d.why}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

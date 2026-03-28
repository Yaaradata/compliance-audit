"use client";
import { scoreColor, scoreBg } from "@/lib/utils";
import type { Control } from "@/lib/types";

export function ControlHeatmap({
  controls, onSelect, selected,
}: {
  controls: Control[];
  onSelect?: (c: Control) => void;
  selected?: Control | null;
}) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {controls.map((c) => (
        <button key={c.id} onClick={() => onSelect?.(c)} title={`${c.id} ${c.name}: ${c.score}%`}
          className="aspect-square rounded flex items-center justify-center text-[9px] font-semibold cursor-pointer transition-all hover:shadow-[var(--interactive-glow-subtle)] hover:brightness-105 hover:z-10"
          style={{
            background: scoreBg(c.score),
            border: selected?.id === c.id ? "2px solid #1e40af" : `2px solid ${scoreColor(c.score)}40`,
            color: scoreColor(c.score),
          }}>
          {c.id}
        </button>
      ))}
    </div>
  );
}

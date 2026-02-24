"use client";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getStatusColor, getStatusIcon } from "@/lib/utils";

export function DomainRightSidebar({ controls, controlScores }: { controls: string[]; controlScores: Record<string, number> }) {
  return (
    <div className="w-56 shrink-0 space-y-2">
      <div className="text-xs font-semibold text-gray-700 mb-2">Control Sufficiency</div>
      {controls.map((c) => {
        const score = controlScores[c] ?? 0;
        return (
          <div key={c} className="flex items-center gap-2 text-[11px]">
            <span className="font-mono font-semibold text-gray-500 w-8">{c}</span>
            <div className="flex-1"><ProgressBar pct={score} h={4} /></div>
            <span className="font-bold w-7 text-right" style={{ color: getStatusColor(score) }}>{score}%</span>
            <span className="w-3 text-center" style={{ color: getStatusColor(score) }}>{getStatusIcon(score)}</span>
          </div>
        );
      })}
    </div>
  );
}

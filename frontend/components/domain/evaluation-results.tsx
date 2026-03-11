"use client";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

export function EvaluationResults({ score }: { score: number }) {
  const color = getStatusColor(score);
  const label = getStatusLabel(score);
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: `${color}40`, background: `${color}08` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">Evaluation Result</span>
        <span className="text-sm font-bold" style={{ color }}>{score}% — {label}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

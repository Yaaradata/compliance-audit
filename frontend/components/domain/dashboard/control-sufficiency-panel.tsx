"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

function PassFailIcon({ pct }: { pct: number }) {
  const color = getStatusColor(pct);
  if (pct >= 90) return <span className="text-sm font-bold text-[var(--success)]" title="PASS" aria-hidden>✓</span>;
  if (pct >= 60) return <span className="text-sm font-bold text-[var(--warning)]" title="Partial" aria-hidden>⚠</span>;
  if (pct > 0) return <span className="text-sm font-bold text-[var(--danger)]" title="FAIL" aria-hidden>✗</span>;
  return <span className="text-sm text-[var(--foreground-subtle)]" title="Not started" aria-hidden>○</span>;
}

export function ControlSufficiencyPanel({
  controls,
  controlScores,
  className,
}: {
  controls: string[];
  controlScores: Record<string, number>;
  className?: string;
}) {
  const [sortWorstFirst, setSortWorstFirst] = useState(true);

  const sortedControls = useMemo(() => {
    const list = controls.map((id) => ({ id, score: controlScores[id] ?? 0 }));
    return [...list].sort((a, b) => (sortWorstFirst ? a.score - b.score : b.score - a.score));
  }, [controls, controlScores, sortWorstFirst]);

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden",
        className
      )}
    >
      <div className="shrink-0 flex items-center justify-between gap-2 p-3 border-b border-[var(--border)]">
        <span className="text-xs font-semibold text-[var(--foreground)]">Control Sufficiency</span>
        <button
          type="button"
          onClick={() => setSortWorstFirst((s) => !s)}
          className="text-[10px] font-medium px-2 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          title={sortWorstFirst ? "Sort by best first" : "Sort by worst first"}
          aria-pressed={sortWorstFirst}
        >
          {sortWorstFirst ? "Worst first" : "Best first"}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
        {sortedControls.map(({ id, score }) => {
          const color = getStatusColor(score);
          return (
            <div
              key={id}
              className="flex items-center gap-2"
              title={`${id}: ${score}% — ${getStatusLabel(score)}`}
            >
              <span className="font-mono text-[10px] font-semibold w-7 shrink-0 text-[var(--foreground-muted)]">
                {id}
              </span>
              <div className="flex-1 min-w-0 h-1.5 rounded-full overflow-hidden bg-[var(--border)]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${score}%`, backgroundColor: color }}
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${id} ${score}%`}
                />
              </div>
              <span className="text-[10px] font-bold w-8 text-right shrink-0 tabular-nums" style={{ color }}>
                {score}%
              </span>
              <PassFailIcon pct={score} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getStatusColor, getStatusIcon, getStatusLabel } from "@/lib/utils";

function PassFailIcon({ pct }: { pct: number }) {
  const color = getStatusColor(pct);
  if (pct >= 90) return <span className="text-sm font-bold" style={{ color }} title="PASS">✓</span>;
  if (pct >= 60) return <span className="text-sm font-bold" style={{ color }} title="Partial">⚠</span>;
  if (pct > 0) return <span className="text-sm font-bold" style={{ color }} title="FAIL">✗</span>;
  return <span className="text-sm" style={{ color: "var(--foreground-subtle)" }} title="Not started">○</span>;
}

export function DomainRightSidebar({
  controls,
  controlScores,
}: {
  controls: string[];
  controlScores: Record<string, number>;
}) {
  const [sortWorstFirst, setSortWorstFirst] = useState(true);

  const sortedControls = useMemo(() => {
    const list = controls.map((id) => ({ id, score: controlScores[id] ?? 0 }));
    return [...list].sort((a, b) => (sortWorstFirst ? a.score - b.score : b.score - a.score));
  }, [controls, controlScores, sortWorstFirst]);

  return (
    <div className="w-60 shrink-0 flex flex-col rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)", gap: "var(--space-unit)" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Control Sufficiency
        </span>
        <button
          type="button"
          onClick={() => setSortWorstFirst((s) => !s)}
          className="text-[11px] font-medium px-2 py-1 rounded transition-colors"
          style={{ color: "var(--primary)" }}
          title={sortWorstFirst ? "Sort by best first" : "Sort by worst first"}
        >
          {sortWorstFirst ? "Worst first" : "Best first"}
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {sortedControls.map(({ id, score }) => (
          <div
            key={id}
            className="flex items-center gap-2"
            title={`${id}: ${score}% — ${getStatusLabel(score)}`}
          >
            <span className="font-mono text-xs font-semibold w-8 shrink-0" style={{ color: "var(--foreground-muted)" }}>
              {id}
            </span>
            <div className="flex-1 min-w-0">
              <ProgressBar pct={score} h={8} />
            </div>
            <span className="text-xs font-bold w-8 text-right shrink-0" style={{ color: getStatusColor(score) }}>
              {score}%
            </span>
            <PassFailIcon pct={score} />
          </div>
        ))}
      </div>
    </div>
  );
}

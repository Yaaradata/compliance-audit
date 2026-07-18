"use client";

import { RAG_STYLES } from "./ragTokens";
import { PathToGreenStrip } from "./PathToGreenStrip";
import type { DomainKri, RagStatus } from "./types";

export function KriBar({ label, value, target, unit, status }: DomainKri) {
  const band = status === "RED" ? "red" : status === "AMBER" ? "amber" : "green";
  const rag = RAG_STYLES[band];
  const pct =
    unit === "%" ? value : Math.min((value / (target * 2 || 1)) * 100, 100);
  const valueLabel =
    unit === "%"
      ? `${value}%`
      : typeof value === "number"
        ? value.toLocaleString()
        : value;
  const targetLabel =
    unit === "%" ? `≥ ${target}%` : `< ${target?.toLocaleString?.() ?? target}`;

  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span className="font-medium">{label}</span>
        <span>
          <span className={`font-bold ${rag.text}`}>{valueLabel}</span>
          <span className="ml-1.5 text-slate-400">target {targetLabel}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-md bg-slate-100">
        <div
          className={`h-full rounded-md ${rag.badge}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      {status === "RED" || status === "AMBER" ? <PathToGreenStrip entityRef={label} /> : null}
    </div>
  );
}

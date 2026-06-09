"use client";

import { RAG_STYLES } from "./ragTokens";
import type { RagStatus } from "./types";

export function RagBadge({ status }: { status: RagStatus }) {
  const band = status === "RED" ? "red" : status === "AMBER" ? "amber" : "green";
  const rag = RAG_STYLES[band];
  return (
    <span
      className={`shrink-0 rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${rag.badge} ${rag.badgeText}`}
    >
      {status}
    </span>
  );
}

export function FirmPostureBanner({
  status,
  narrative,
}: {
  status: RagStatus;
  narrative: string;
}) {
  const band = status === "RED" ? "red" : status === "AMBER" ? "amber" : "green";
  const rag = RAG_STYLES[band];
  return (
    <div className={`rounded-xl border-[1.5px] p-5 ${rag.bg} ${rag.border}`}>
      <div className="mb-2.5 flex items-center gap-3">
        <span className={`h-3.5 w-3.5 rounded-full ${rag.dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-widest ${rag.text}`}>
          Firm Risk Posture
        </span>
        <span className={`text-2xl font-extrabold tracking-tight ${rag.text}`}>{status}</span>
      </div>
      <p className="max-w-4xl text-sm leading-relaxed text-slate-700">{narrative}</p>
    </div>
  );
}

export function RagCountPills({ counts }: { counts: Record<RagStatus, number> }) {
  const pills: { key: RagStatus; hint: string }[] = [
    { key: "GREEN", hint: "within appetite" },
    { key: "AMBER", hint: "monitor closely" },
    { key: "RED", hint: "action required" },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {pills.map(({ key, hint }) => {
        const band = key === "RED" ? "red" : key === "AMBER" ? "amber" : "green";
        const rag = RAG_STYLES[band];
        return (
          <div
            key={key}
            className={`flex items-center gap-2 rounded-lg border px-4 py-1.5 ${rag.bg}`}
            style={{ borderColor: `${band === "green" ? "#16a34a" : band === "amber" ? "#d97706" : "#dc2626"}22` }}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${rag.dot}`} />
            <span className={`text-sm font-semibold ${rag.text}`}>{counts[key]}</span>
            <span className="text-xs text-slate-500">— {hint}</span>
          </div>
        );
      })}
    </div>
  );
}

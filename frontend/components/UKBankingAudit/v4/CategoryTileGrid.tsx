"use client";

import { useEffect, useMemo, useRef } from "react";
import { DomainDrillPanel } from "./DomainDrillPanel";
import { RagBadge } from "./FirmPostureSummary";
import { RAG_STYLES } from "./ragTokens";
import { TrendMarker } from "./TrendMarker";
import type { RiskDomainV4 } from "./types";

type Props = {
  domains: RiskDomainV4[];
  expandedId: string | null;
  onToggle: (id: string) => void;
};

const SORT_RANK = { AMBER: 0, RED: 1, GREEN: 2 };

/** Nine-domain category grid with amber-first ordering and inline drill (v4 mockup). */
export function CategoryTileGrid({ domains, expandedId, onToggle }: Props) {
  const drillRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () =>
      [...domains].sort(
        (a, b) =>
          (SORT_RANK[a.status] ?? 2) - (SORT_RANK[b.status] ?? 2) ||
          a.name.localeCompare(b.name),
      ),
    [domains],
  );

  useEffect(() => {
    if (expandedId && drillRef.current) {
      drillRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [expandedId]);

  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-slate-900">Categories</h2>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((domain) => {
          const band = domain.status === "RED" ? "red" : domain.status === "AMBER" ? "amber" : "green";
          const rag = RAG_STYLES[band];
          const expanded = expandedId === domain.id;

          return (
            <div key={domain.id} className={expanded ? "col-span-full" : undefined}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onToggle(domain.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(domain.id);
                  }
                }}
                className={`flex cursor-pointer flex-col border-[1.5px] px-3 py-2.5 transition-all ${rag.bg} ${rag.border} ${
                  expanded
                    ? "rounded-t-[10px] rounded-b-none shadow-[0_0_0_2px] shadow-current/20"
                    : "rounded-[10px] hover:shadow-md"
                }`}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <span className="text-[13px] font-bold leading-tight text-slate-900">{domain.name}</span>
                  <RagBadge status={domain.status} />
                </div>
                <p className="mb-1.5 line-clamp-3 text-[11.5px] leading-snug text-slate-600">{domain.summary}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-slate-400">W/W</span>
                  <div className="flex items-center gap-1.5">
                    {domain.deadline ? (
                      <span className="rounded-xl border border-dashed border-red-300 bg-red-50 px-1.5 py-px text-[9px] font-semibold text-red-600">
                        ⏱ {domain.deadline}
                      </span>
                    ) : null}
                    <TrendMarker trend={domain.trend} delta={domain.delta} />
                  </div>
                </div>
              </div>

              {expanded ? (
                <div ref={drillRef}>
                  <DomainDrillPanel domain={domain} onClose={() => onToggle(domain.id)} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { buildCategoryTiles, type CategoryTileView, type TilePathView } from "@/lib/ukbankingaudit/v8/boardView";
import { DomainDrillPanel } from "./DomainDrillPanel";
import { RagBadge } from "./FirmPostureSummary";
import { RAG_STYLES } from "./ragTokens";
import { RatingTrendChip } from "./RatingTrendChip";
import type { RagStatus, RiskDomainV4 } from "./types";

type Props = {
  domains: RiskDomainV4[];
  expandedId: string | null;
  onToggle: (id: string) => void;
};

const SORT_RANK: Record<CategoryTileView["colour"], number> = { amber: 0, red: 1, green: 2 };

const SECOND_LINE: Record<TilePathView["secondLine"], { icon: string; className: string; label: string }> = {
  accepted: { icon: "✓", className: "bg-emerald-100 text-emerald-700", label: "2nd line accepted" },
  challenged: { icon: "!", className: "bg-orange-100 text-orange-700", label: "2nd line challenged" },
  pending: { icon: "…", className: "bg-slate-200 text-slate-600", label: "2nd line review pending" },
};

function PathToGreenChip({ path }: { path: TilePathView | null }) {
  if (!path) {
    return (
      <span className="mt-2 inline-flex self-start rounded border border-red-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-red-700">
        No path to green
      </span>
    );
  }
  const verdict = SECOND_LINE[path.secondLine];
  return (
    <span className="mt-2 inline-flex items-center gap-1.5 self-start rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
      <span>
        Path to green: {path.targetLabel} · {path.owner}
      </span>
      <span
        title={verdict.label}
        aria-label={verdict.label}
        className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${verdict.className}`}
      >
        {verdict.icon}
      </span>
    </span>
  );
}

/** Nine-domain category grid. Every colour, count and sentence comes from the rating engine. */
export function CategoryTileGrid({ domains, expandedId, onToggle }: Props) {
  const drillRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => {
    const domainById = new Map(domains.map((domain) => [domain.id, domain]));
    return buildCategoryTiles()
      .flatMap((tile) => {
        const domain = domainById.get(tile.categoryId);
        return domain ? [{ tile, domain }] : [];
      })
      .sort(
        (a, b) =>
          SORT_RANK[a.tile.colour] - SORT_RANK[b.tile.colour] || a.tile.label.localeCompare(b.tile.label),
      );
  }, [domains]);

  useEffect(() => {
    if (expandedId && drillRef.current) {
      drillRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [expandedId]);

  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-slate-900">Categories</h2>
      <div
        className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 ${
          expandedId ? "" : "sm:auto-rows-fr"
        }`}
      >
        {sorted.map(({ tile, domain }) => {
          const rag = RAG_STYLES[tile.colour];
          const expanded = expandedId === tile.categoryId;
          const status = tile.colour.toUpperCase() as RagStatus;

          return (
            <div key={tile.categoryId} className={expanded ? "col-span-full" : "h-full"}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onToggle(tile.categoryId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(tile.categoryId);
                  }
                }}
                className={`flex cursor-pointer flex-col border-[1.5px] px-3 py-2.5 transition-all ${rag.bg} ${rag.border} ${
                  expanded
                    ? "rounded-t-[10px] rounded-b-none shadow-[0_0_0_2px] shadow-current/20"
                    : "h-full rounded-[10px] hover:shadow-md"
                }`}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <span className="text-[13px] font-bold leading-tight text-slate-900">{tile.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <RagBadge status={status} />
                    <RatingTrendChip trend={tile.trend} />
                  </span>
                </div>
                <p className="mb-2 text-[11.5px] leading-snug text-slate-700">{tile.why}</p>
                <dl className="mt-auto space-y-0.5 border-t border-slate-900/10 pt-1.5 text-[10.5px] text-slate-600">
                  <div className="flex justify-between gap-2">
                    <dt>RAMs</dt>
                    <dd className="font-semibold text-slate-800">
                      {tile.ramRed} red · {tile.ramAmber} amber
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Critical controls</dt>
                    <dd className="font-semibold text-slate-800">{tile.criticalPct}% effective</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Sev-1/2</dt>
                    <dd className="font-semibold text-slate-800">{tile.sevOneTwo}</dd>
                  </div>
                </dl>
                {tile.colour !== "green" ? <PathToGreenChip path={tile.path} /> : null}
              </div>

              {expanded ? (
                <div ref={drillRef}>
                  <DomainDrillPanel
                    domain={{ ...domain, name: tile.label, status }}
                    onClose={() => onToggle(tile.categoryId)}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

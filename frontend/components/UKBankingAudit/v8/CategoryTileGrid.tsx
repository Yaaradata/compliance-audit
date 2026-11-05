"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { buildCategoryTiles, type CategoryTileView, type TilePathView } from "@/lib/ukbankingaudit/v8/boardView";
import { DomainDrillPanel } from "./DomainDrillPanel";
import { PathToGreenDrawer, type PathTarget } from "./PathToGreenDrawer";
import { RagBadge } from "./FirmPostureSummary";
import { RAG_STYLES } from "./ragTokens";
import { RatingTrendChip } from "./RatingTrendChip";
import { PreviousAndNow, RatingTrend } from "./TrendCharts";
import type { RagStatus, RiskDomainV4 } from "./types";
import { useRiskState } from "./useRiskStore";

type Props = {
  domains: RiskDomainV4[];
  expandedId: string | null;
  onToggle: (id: string) => void;
};

const SORT_RANK: Record<CategoryTileView["colour"], number> = { red: 0, amber: 1, green: 2 };

const SECOND_LINE: Record<TilePathView["secondLine"], { icon: string; className: string; label: string }> = {
  accepted: { icon: "✓", className: "bg-emerald-100 text-emerald-700", label: "2nd line accepted" },
  challenged: { icon: "!", className: "bg-orange-100 text-orange-700", label: "2nd line challenged" },
  pending: { icon: "…", className: "bg-slate-200 text-slate-600", label: "2nd line review pending" },
};

const COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Splits tiles into full rows of at most `size`, so no row ends in an empty gap. */
function evenRows<T>(items: T[], size: number): T[][] {
  const rowCount = Math.ceil(items.length / size);
  const rows: T[][] = [];
  let start = 0;
  for (let row = 0; row < rowCount; row += 1) {
    const length = Math.ceil((items.length - start) / (rowCount - row));
    rows.push(items.slice(start, start + length));
    start += length;
  }
  return rows;
}

function PathToGreenChip({ path, onOpen }: { path: TilePathView | null; onOpen: (path: TilePathView) => void }) {
  if (!path) {
    return (
      <span className="inline-flex self-start rounded border border-red-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-red-700">
        No path to green
      </span>
    );
  }
  const verdict = SECOND_LINE[path.secondLine];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen(path);
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 self-start rounded border border-slate-200 bg-white px-1.5 py-0.5 text-left text-[10px] font-semibold text-slate-700 hover:border-slate-400"
    >
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
    </button>
  );
}

function TileHeader({ tile }: { tile: CategoryTileView }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[13px] font-bold leading-tight text-slate-900">{tile.label}</span>
      <span className="flex shrink-0 items-center gap-1">
        <RagBadge status={tile.colour.toUpperCase() as RagStatus} />
        <RatingTrendChip trend={tile.trend} />
      </span>
    </div>
  );
}

/** A green tile needs little: its name, its line, one row of numbers. */
function GreenTileBody({ tile }: { tile: CategoryTileView }) {
  return (
    <>
      <div className="mt-auto">
        <RatingTrend points={tile.history} />
      </div>
      <PreviousAndNow points={tile.history} />
      <p className="whitespace-nowrap text-[10.5px] text-slate-500">
        Controls <span className="font-semibold text-slate-900">{tile.criticalPct}%</span> · Sev-1/2{" "}
        <span className="font-semibold text-slate-900">{tile.sevOneTwo}</span>
      </p>
    </>
  );
}

/** A red or amber tile leads with how many metrics are out, its line, then why and the plan. */
function FlaggedTileBody({ tile }: { tile: CategoryTileView }) {
  const out = tile.ramRed + tile.ramAmber;
  return (
    <>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4">
        <div>
          <div className="text-2xl font-extrabold leading-none tracking-tight text-slate-900">{out}</div>
          <div className="mt-1 text-[10.5px] leading-tight text-slate-600">
            metrics out
            <br />
            {tile.ramRed} red · {tile.ramAmber} amber
          </div>
        </div>
        <RatingTrend points={tile.history} heightClass="h-12" />
      </div>
      <PreviousAndNow points={tile.history} />
      <p className="text-[11.5px] leading-snug text-slate-700">{tile.why}</p>
    </>
  );
}

/** Nine-domain category grid. Every colour, count and sentence comes from the rating engine. */
export function CategoryTileGrid({ domains, expandedId, onToggle }: Props) {
  const drillRef = useRef<HTMLDivElement>(null);
  const { data } = useRiskState();
  const [pathTarget, setPathTarget] = useState<PathTarget | null>(null);

  const sorted = useMemo(() => {
    const domainById = new Map(domains.map((domain) => [domain.id, domain]));
    return buildCategoryTiles(data.config.currentPeriod, data)
      .flatMap((tile) => {
        const domain = domainById.get(tile.categoryId);
        return domain ? [{ tile, domain }] : [];
      })
      .sort(
        (a, b) =>
          SORT_RANK[a.tile.colour] - SORT_RANK[b.tile.colour] || a.tile.label.localeCompare(b.tile.label),
      );
  }, [domains, data]);

  useEffect(() => {
    if (expandedId && drillRef.current) {
      drillRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [expandedId]);

  const rows = [
    ...evenRows(sorted.filter(({ tile }) => tile.colour !== "green"), 3),
    ...evenRows(sorted.filter(({ tile }) => tile.colour === "green"), 4),
  ];

  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-slate-900">Categories</h2>
      <div className="space-y-2.5">
        {rows.map((row) => {
          const open = row.find(({ tile }) => tile.categoryId === expandedId);
          return (
            <Fragment key={row[0].tile.categoryId}>
              <div className={`grid grid-cols-1 gap-2.5 ${COLUMNS[row.length]}`}>
                {row.map(({ tile }) => {
                  const rag = RAG_STYLES[tile.colour];
                  const green = tile.colour === "green";
                  const expanded = expandedId === tile.categoryId;
                  return (
                    <div
                      key={tile.categoryId}
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onClick={() => onToggle(tile.categoryId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onToggle(tile.categoryId);
                        }
                      }}
                      className={`flex cursor-pointer flex-col gap-1.5 rounded-[10px] border px-3 py-2.5 transition-shadow hover:shadow-md ${
                        green ? "border-slate-200 bg-white" : `${rag.bg} ${rag.border}`
                      } ${expanded ? "ring-2 ring-indigo-400" : ""}`}
                    >
                      <TileHeader tile={tile} />
                      {green ? <GreenTileBody tile={tile} /> : <FlaggedTileBody tile={tile} />}
                      {green ? null : (
                        <PathToGreenChip
                          path={tile.path}
                          onOpen={(path) =>
                            setPathTarget({
                              targetType: path.targetType,
                              targetId: path.targetId,
                              label: `${tile.label}: ${path.targetId}`,
                              owner: path.owner,
                            })
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {open ? (
                <div ref={drillRef}>
                  <DomainDrillPanel
                    domain={{
                      ...open.domain,
                      name: open.tile.label,
                      status: open.tile.colour.toUpperCase() as RagStatus,
                    }}
                    onClose={() => onToggle(open.tile.categoryId)}
                  />
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
      {pathTarget ? <PathToGreenDrawer target={pathTarget} onClose={() => setPathTarget(null)} /> : null}
    </div>
  );
}

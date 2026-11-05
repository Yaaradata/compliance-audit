"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { buildCategoryTiles, type CategoryTileView, type TilePathView } from "@/lib/ukbankingaudit/v8/boardView";
import { DomainDrillPanel } from "./DomainDrillPanel";
import { PathToGreenDrawer, type PathTarget } from "./PathToGreenDrawer";
import { RagBadge } from "./FirmPostureSummary";
import { RAG_STYLES } from "./ragTokens";
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

/** Every row shares one 4-column grid, so tile edges line up from row to row. */
const GRID = "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4";
/** A red or amber tile takes half a row, or all of it when it is alone. */
const FLAGGED_SPAN = { half: "sm:col-span-2", full: "sm:col-span-2 lg:col-span-4" };
/** The summary tile fills whatever a last green row leaves empty. */
const SUMMARY_SPAN: Record<number, string> = {
  1: "lg:col-span-1",
  2: "sm:col-span-2 lg:col-span-2",
  3: "lg:col-span-3",
};

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let start = 0; start < items.length; start += size) rows.push(items.slice(start, start + size));
  return rows;
}

/** Fills the end of the last green row with what those tiles add up to. */
function WithinAppetiteTile({ tiles, total, span }: { tiles: CategoryTileView[]; total: number; span: number }) {
  const improved = tiles.filter((tile) => tile.trend.direction === "better");
  return (
    <div className={`flex flex-col justify-center rounded-[10px] bg-slate-50 px-3 py-2.5 ${SUMMARY_SPAN[span]}`}>
      <div className="text-2xl font-extrabold leading-none tracking-tight text-slate-900">
        {tiles.length} of {total}
      </div>
      <p className="mt-1 text-[11.5px] leading-snug text-slate-600">categories within appetite</p>
      {improved.length > 0 ? (
        <p className="mt-1 text-[10.5px] leading-snug text-slate-500">
          Improved since {improved[0].trend.prevPeriodLabel}: {improved.map((tile) => tile.label).join(", ")}
        </p>
      ) : null}
    </div>
  );
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
      {tile.colour === "green" ? (
        <span className="sr-only">Green</span>
      ) : (
        <RagBadge status={tile.colour.toUpperCase() as RagStatus} />
      )}
    </div>
  );
}

/** The trend line already shows a steady rating, so words appear only when it moved. */
function RatingMove({ tile }: { tile: CategoryTileView }) {
  return tile.trend.direction === "flat" ? null : <PreviousAndNow points={tile.history} />;
}

/**
 * A green tile needs little: its name, its line, one row of numbers. The space under
 * the name is kept on every tile, so all the trend lines sit at the same height.
 */
function GreenTileBody({ tile }: { tile: CategoryTileView }) {
  return (
    <>
      <div className="min-h-4">
        <RatingMove tile={tile} />
      </div>
      <RatingTrend points={tile.history} />
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
      <RatingMove tile={tile} />
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

  const flaggedRows = chunk(sorted.filter(({ tile }) => tile.colour !== "green"), 2);
  const greens = sorted.filter(({ tile }) => tile.colour === "green");
  const greenRows = chunk(greens, 4);
  const rows = [...flaggedRows, ...greenRows];
  const emptyCells = (4 - (greens.length % 4)) % 4;

  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-slate-900">Categories</h2>
      <div className="space-y-2.5">
        {rows.map((row) => {
          const open = row.find(({ tile }) => tile.categoryId === expandedId);
          return (
            <Fragment key={row[0].tile.categoryId}>
              <div className={GRID}>
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
                        green
                          ? "border-slate-200 bg-white"
                          : `${rag.bg} ${rag.border} ${row.length === 1 ? FLAGGED_SPAN.full : FLAGGED_SPAN.half}`
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
                {emptyCells > 0 && row === greenRows.at(-1) ? (
                  <WithinAppetiteTile tiles={greens.map(({ tile }) => tile)} total={sorted.length} span={emptyCells} />
                ) : null}
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

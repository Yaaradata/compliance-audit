"use client";

import type { ReactNode } from "react";

export type StatTileSize = "lg" | "sm" | "xs" | "tight";
export type StatTileDeltaTone = "rose" | "emerald" | "slate" | "amber";

export type StatTileProps = {
  label: string;
  value: ReactNode;
  /** Beside the number (lg/sm/tight) or under the label (xs compact row). */
  delta?: ReactNode;
  deltaTone?: StatTileDeltaTone;
  /** When set, draws the standard appetite bar (fill + tick + OVER/WITHIN). */
  appetite?: {
    value: number;
    appetite: number;
    /** Optional caption override; defaults to `appetite {n}`. */
    caption?: string;
    /** When true, breach is value < appetite (e.g. training completion vs target). */
    higherIsBetter?: boolean;
  };
  /**
   * lg = text-2xl (primary headline);
   * sm = text-lg (secondary);
   * xs = compact Zone-C row — label left, value right, text-base;
   * tight = two-line Training stack — value+unit with sub-label; appetite on line 2.
   */
  size?: StatTileSize;
  className?: string;
};

const DELTA_TONE: Record<StatTileDeltaTone, string> = {
  rose: "text-rose-700",
  emerald: "text-emerald-700",
  slate: "text-slate-500",
  amber: "text-amber-700",
};

const VALUE_SIZE: Record<StatTileSize, string> = {
  lg: "text-2xl",
  sm: "text-lg",
  xs: "text-base",
  tight: "text-base",
};

/**
 * One number with its label (sentence case), optional delta,
 * optional appetite bar. Labels are never uppercase — parent card headers carry context.
 */
export function StatTile({
  label,
  value,
  delta,
  deltaTone = "slate",
  appetite,
  size = "lg",
  className = "",
}: StatTileProps) {
  const over =
    appetite != null
      ? appetite.higherIsBetter
        ? appetite.value < appetite.appetite
        : appetite.value > appetite.appetite
      : false;
  const scale =
    appetite != null ? Math.max(appetite.value, appetite.appetite, 0.01) * 1.3 : 1;
  const fillPct =
    appetite != null ? Math.min(100, (appetite.value / scale) * 100) : 0;
  const tickPct =
    appetite != null ? Math.min(100, (appetite.appetite / scale) * 100) : 0;

  const pad =
    size === "tight"
      ? "px-2.5 py-1.5"
      : size === "xs"
        ? "px-2.5 py-2"
        : size === "sm"
          ? "p-2.5"
          : "p-3";

  const breachLabel = appetite?.higherIsBetter
    ? over
      ? "UNDER"
      : "WITHIN"
    : over
      ? "OVER"
      : "WITHIN";

  const appetiteBar =
    appetite != null ? (
      <>
        <div className="relative mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={
              over ? "h-full rounded-full bg-rose-400" : "h-full rounded-full bg-slate-400"
            }
            style={{ width: `${fillPct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-slate-900"
            style={{ left: `${tickPct}%` }}
          />
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="text-[9px] text-slate-400">
            {appetite.caption ?? `appetite ${appetite.appetite}`}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              over ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {breachLabel}
          </span>
        </div>
      </>
    ) : null;

  // Training Zone-C: two lines — value+unit with sub-label; appetite on line 2.
  if (size === "tight") {
    return (
      <div
        className={`min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white ${pad} ${className}`}
        title={label}
        aria-label={label}
      >
        <div className="flex min-w-0 items-baseline justify-between gap-2">
          <div
            className={`shrink-0 font-bold tabular-nums leading-none text-slate-900 ${VALUE_SIZE.tight}`}
          >
            {value}
          </div>
          {delta != null ? (
            <span
              className={`min-w-0 text-right text-[10px] font-medium leading-snug ${DELTA_TONE[deltaTone]}`}
            >
              {delta}
            </span>
          ) : null}
        </div>
        {appetiteBar}
      </div>
    );
  }

  // Zone-C compact: horizontal row — no giant stacked numbers, no wasted tile height.
  if (size === "xs") {
    return (
      <div
        className={`min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white ${pad} ${className}`}
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-[10px] font-medium text-slate-500"
              title={label}
            >
              {label}
            </div>
            {delta != null ? (
              <div
                className={`mt-0.5 truncate text-[10px] font-medium leading-snug ${DELTA_TONE[deltaTone]}`}
                title={typeof delta === "string" ? delta : undefined}
              >
                {delta}
              </div>
            ) : null}
          </div>
          <div
            className={`shrink-0 font-bold tabular-nums leading-none text-slate-900 ${VALUE_SIZE.xs}`}
          >
            {value}
          </div>
        </div>
        {appetiteBar}
      </div>
    );
  }

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white ${pad} ${className}`}
    >
      <div className="text-[11px] font-medium leading-snug text-slate-500" title={label}>
        {label}
      </div>
      <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <div
          className={`min-w-0 font-bold tabular-nums text-slate-900 ${VALUE_SIZE[size]}`}
        >
          {value}
        </div>
        {delta != null ? (
          <span
            className={`min-w-0 break-words text-[10px] font-medium leading-snug ${DELTA_TONE[deltaTone]}`}
          >
            {delta}
          </span>
        ) : null}
      </div>
      {appetiteBar}
    </div>
  );
}

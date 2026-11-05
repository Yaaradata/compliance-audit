"use client";

import { useId } from "react";
import type { RatingPoint, TrendPoint } from "@/lib/ukbankingaudit/v8/boardView";
import type { RatingColour } from "@/lib/ukbankingaudit/v8/types";

export type Tone = RatingColour | "neutral";

const TONE_HEX: Record<Tone, string> = {
  red: "#dc2626",
  amber: "#d97706",
  green: "#059669",
  neutral: "#475569",
};

const RATING_LEVEL: Record<RatingColour, number> = { green: 0, amber: 1, red: 2 };

type XY = { x: number; y: number };

/** A smooth curve that never overshoots its points, so a flat run stays flat (monotone cubic). */
function smoothPath(points: XY[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const slopes = points.slice(1).map((p, i) => (p.y - points[i].y) / (p.x - points[i].x));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === points.length - 1) return slopes[i - 1];
    return slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  });
  return points.reduce((path, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const third = (p.x - prev.x) / 3;
    return `${path} C ${prev.x + third} ${prev.y + tangents[i - 1] * third}, ${p.x - third} ${p.y - tangents[i] * third}, ${p.x} ${p.y}`;
  }, "");
}

/**
 * Shaded trend line ending in a dot on the current month. Up always means more of
 * the thing plotted. Hover a month for its value; only the first and last are labelled.
 */
function AreaTrend({
  labels,
  levels,
  hover,
  tone,
  low,
  high,
  heightClass,
  summary,
}: {
  labels: string[];
  levels: number[];
  hover: string[];
  tone: Tone;
  low: number;
  high: number;
  heightClass: string;
  summary: string;
}) {
  const gradientId = useId();
  const colour = TONE_HEX[tone];
  const points = levels.map((level, i) => ({
    x: levels.length < 2 ? 50 : (i / (levels.length - 1)) * 96 + 1,
    y: 90 - ((level - low) / Math.max(high - low, 1)) * 76,
  }));
  const line = smoothPath(points);
  const last = points.at(-1);
  if (!last) return null;
  const area = `${line} L ${last.x} 100 L ${points[0].x} 100 Z`;
  return (
    <div role="img" aria-label={summary}>
      <div className={`relative ${heightClass}`}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colour} stopOpacity="0.32" />
              <stop offset="100%" stopColor={colour} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke={colour} strokeWidth="2.25" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
          style={{ left: `${last.x}%`, top: `${last.y}%`, backgroundColor: colour }}
        />
        <div className="absolute inset-0 flex">
          {hover.map((text, i) => (
            <span key={labels[i]} className="group/point relative h-full flex-1">
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white group-hover/point:block">
                {text}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="mt-0.5 flex justify-between text-[9.5px] text-slate-400" aria-hidden="true">
        <span>{labels[0]}</span>
        <span className="font-semibold text-slate-600">{labels.at(-1)}</span>
      </div>
    </div>
  );
}

/** A rating by month as a line: higher is worse, so a rise or a bump shows at a glance. */
export function RatingTrend({ points, heightClass = "h-8" }: { points: RatingPoint[]; heightClass?: string }) {
  const hover = points.map((p) => `${p.label}: ${p.colour.toUpperCase()}`);
  return (
    <AreaTrend
      labels={points.map((p) => p.label)}
      levels={points.map((p) => RATING_LEVEL[p.colour])}
      hover={hover}
      tone={points.at(-1)?.colour ?? "neutral"}
      low={0}
      high={2}
      heightClass={heightClass}
      summary={`Rating by month. ${hover.join(", ")}`}
    />
  );
}

/** One figure by month. */
export function FigureTrend({
  points,
  tone,
  suffix = "",
  low,
  high,
}: {
  points: TrendPoint[];
  tone: Tone;
  suffix?: string;
  low?: number;
  high?: number;
}) {
  const values = points.map((p) => p.value);
  const hover = points.map((p) => `${p.label}: ${p.value}${suffix}`);
  return (
    <AreaTrend
      labels={points.map((p) => p.label)}
      levels={values}
      hover={hover}
      tone={tone}
      low={low ?? Math.min(...values)}
      high={high ?? Math.max(...values)}
      heightClass="h-16"
      summary={hover.join(", ")}
    />
  );
}

/** "Oct AMBER → Nov GREEN". Quiet when nothing moved, bold when something did. */
export function PreviousAndNow({ points }: { points: RatingPoint[] }) {
  const [previous, now] = points.slice(-2);
  if (!previous || !now) return null;
  const moved = previous.colour !== now.colour;
  return (
    <p className={`text-[10.5px] ${moved ? "font-bold text-slate-900" : "text-slate-500"}`}>
      {previous.label} {previous.colour.toUpperCase()} <span aria-hidden="true">→</span>
      <span className="sr-only">then</span> {now.label} {now.colour.toUpperCase()}
    </p>
  );
}

/** Half-circle gauge for one percentage. */
export function Gauge({ pct, label, tone }: { pct: number | null; label: string; tone: Tone }) {
  const value = pct ?? 0;
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className="relative h-11 w-[4.75rem]">
        <svg className="h-full w-full" viewBox="0 0 100 58" aria-hidden="true">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="11" strokeLinecap="round" />
          {pct !== null && value > 0 ? (
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke={TONE_HEX[tone]}
              strokeWidth="11"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${value} 100`}
            />
          ) : null}
        </svg>
        <span className="absolute inset-x-0 bottom-0 text-[13px] font-extrabold leading-none text-slate-900">
          {pct === null ? "None" : `${value}%`}
        </span>
      </div>
      <span className="mt-1 text-[9.5px] font-medium uppercase leading-tight tracking-wide text-slate-500">{label}</span>
    </div>
  );
}

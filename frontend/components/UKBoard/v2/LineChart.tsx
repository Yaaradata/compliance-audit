"use client";

/**
 * UK Board v2 — fixed-height line chart. Coordinates use percentages for x and pixels for y, so
 * 11px labels never scale or truncate. Colours come from boardChartTheme.ts: the first series is
 * the measure (blue), the second the comparison (teal). Amber trigger and appetite limit are dashed
 * amber and red lines labelled at the right end, with light zones from trigger to limit and beyond.
 * `gap` shades where the first series runs above the second ("Capacity gap"). The last point is
 * filled in the measure's status colour and carries its value. Horizontal gridlines only.
 */
import type { SeriesPoint } from "@/lib/ukboard/v1/types";
import type { MeasureStatus } from "@/lib/ukboard/v2/boardStore";
import { CHART, STATUS_INK } from "./boardChartTheme";

const MONTHS: Record<string, string> = {
  January: "Jan", February: "Feb", March: "Mar", April: "Apr", May: "May", June: "Jun",
  July: "Jul", August: "Aug", September: "Sep", October: "Oct", November: "Nov", December: "Dec",
};

export function shortLabel(l: string): string {
  const q = /^(Q[1-4]) (\d{2})(\d{2})$/.exec(l);
  if (q) return `${q[1]} ${q[3]}`;
  return MONTHS[l] ?? l;
}

export interface ChartSeries {
  name: string;
  points: SeriesPoint[];
  dashed?: boolean;
}

export type ThresholdTone = "amber" | "red";
export interface ChartThreshold {
  value: number;
  label: string;
  tone?: ThresholdTone;
}

const SERIES_INK = [CHART.measure, CHART.comparison];

export default function LineChart({
  series,
  height = 160,
  threshold,
  thresholds,
  suffix = "",
  axes = true,
  title,
  directLabels,
  gap,
  status,
}: {
  series: ChartSeries[];
  height?: number;
  threshold?: { value: number; label: string };
  thresholds?: ChartThreshold[];
  suffix?: string;
  axes?: boolean;
  title: string;
  /** Name each series at its last point instead of a legend. */
  directLabels?: boolean;
  /** Shade where the first series runs above the second. */
  gap?: boolean;
  /** Status of the measure, for the last-point dot. */
  status?: MeasureStatus;
}) {
  const lines: ChartThreshold[] = [...(threshold ? [{ ...threshold, tone: "amber" as const }] : []), ...(thresholds ?? [])];
  const all = series.flatMap((s) => s.points.map((p) => p.value)).concat(lines.map((t) => t.value));
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const top = 10;
  const bottom = axes ? 20 : 6;
  const y = (v: number) => Math.round((top + (1 - (v - lo) / (hi - lo || 1)) * (height - top - bottom)) * 10) / 10;
  const n = series[0].points.length;
  const x0 = axes ? 9 : 2;
  const x1 = directLabels || lines.length ? 84 : 96;
  const xp = (i: number) => x0 + (i / Math.max(n - 1, 1)) * (x1 - x0);
  const x = (i: number) => `${xp(i)}%`;
  const desc = series.map((s) => `${s.name}: ${s.points.map((p) => `${p.label} ${p.value}${suffix}`).join(", ")}`).join("; ");
  const amber = lines.find((t) => (t.tone ?? "amber") === "amber");
  const limit = lines.find((t) => t.tone === "red");
  // Zones: light amber from trigger to limit, light red beyond the limit (towards the worse side).
  const worseUp = amber && limit ? limit.value >= amber.value : true;
  const edge = worseUp ? top : height - bottom;
  const band = (a: number, b: number) => ({ y: Math.min(a, b), h: Math.abs(b - a) });
  const gridValues = [0.25, 0.5, 0.75].map((f) => lo + (hi - lo) * f);
  const last = series[0].points[n - 1];
  // Gap polygon in a 0–100 x space so it scales with the svg width.
  const gapPath =
    gap && series[1]
      ? `M ${series[0].points.map((p, i) => `${xp(i)} ${y(p.value)}`).join(" L ")} L ${[...series[1].points].map((p, i) => ({ p, i })).reverse().map(({ p, i }) => `${xp(i)} ${y(p.value)}`).join(" L ")} Z`
      : null;
  return (
    <figure className="w-full">
      <svg className="w-full overflow-visible" height={height} role="img" aria-label={`${title}. ${desc}`}>
        {gridValues.map((v) => (
          <line key={v} x1={`${x0}%`} x2={`${x1}%`} y1={y(v)} y2={y(v)} stroke={CHART.grid} />
        ))}
        {amber && limit ? (
          <>
            <rect x={`${x0}%`} width={`${x1 - x0}%`} {...band(y(amber.value), y(limit.value))} fill={CHART.amber} opacity={CHART.zoneOpacity} />
            <rect x={`${x0}%`} width={`${x1 - x0}%`} {...band(y(limit.value), edge)} fill={CHART.limit} opacity={CHART.zoneOpacity} />
          </>
        ) : null}
        {gapPath ? (
          <svg x={0} y={0} width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" overflow="visible">
            <path d={gapPath} fill={CHART.gapFill} opacity={CHART.gapOpacity} />
          </svg>
        ) : null}
        {gapPath ? (
          <text x={`${(xp(n - 2) + xp(n - 1)) / 2}%`} y={(y(series[0].points[n - 2].value) + y(series[1].points[n - 2].value)) / 2 + 4} fontSize={11} textAnchor="middle" fill="#B45309">
            Capacity gap
          </text>
        ) : null}
        {lines.map((t) => {
          const ink = (t.tone ?? "amber") === "amber" ? CHART.amber : CHART.limit;
          return (
            <g key={`${t.label}-${t.value}`}>
              <line x1={`${x0}%`} x2={`${x1}%`} y1={y(t.value)} y2={y(t.value)} stroke={ink} strokeWidth={1.5} strokeDasharray="5 4" />
              <text x={`${x1 + 1}%`} y={y(t.value) + 4} fontSize={11} fontWeight={600} fill={ink}>
                {t.label}
              </text>
            </g>
          );
        })}
        {series.map((s, si) =>
          s.points.slice(1).map((p, i) => (
            <line key={`${si}-${i}`} x1={x(i)} x2={x(i + 1)} y1={y(s.points[i].value)} y2={y(p.value)} stroke={SERIES_INK[si]} strokeWidth={CHART.lineWidth} strokeDasharray={s.dashed ? "5 3" : undefined} />
          )),
        )}
        {series.map((s, si) => s.points.slice(0, -1).map((p, i) => <circle key={`${si}-p${i}`} cx={x(i)} cy={y(p.value)} r={2.5} fill={SERIES_INK[si]} />))}
        {series.map((s, si) => {
          const p = s.points[s.points.length - 1];
          const fill = si === 0 && status ? STATUS_INK[status] : SERIES_INK[si];
          return <circle key={`${si}-last`} cx={x(s.points.length - 1)} cy={y(p.value)} r={4} fill={fill} stroke="white" strokeWidth={1.5} />;
        })}
        {status && !directLabels ? (
          <text x={x(n - 1)} y={y(last.value) - 8} fontSize={11} fontWeight={600} textAnchor="end" fill={STATUS_INK[status]}>
            {last.value}
            {suffix}
          </text>
        ) : null}
        {directLabels
          ? series.map((s, si) => (
              <text key={`lbl-${s.name}`} x={`${x1 + 1.5}%`} y={y(s.points[s.points.length - 1].value) + 4} fontSize={11} fontWeight={600} fill={SERIES_INK[si]}>
                {s.name}
              </text>
            ))
          : null}
        {axes ? (
          <>
            <text x="0" y={y(hi) + 4} fontSize={11} fill={CHART.axis}>
              {hi}
              {suffix}
            </text>
            <text x="0" y={y(lo) + 4} fontSize={11} fill={CHART.axis}>
              {lo}
              {suffix}
            </text>
            {series[0].points.map((p, i) => (
              <text key={p.label} x={x(i)} y={height - 4} fontSize={11} fill={CHART.axis} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>
                {shortLabel(p.label)}
              </text>
            ))}
          </>
        ) : null}
      </svg>
    </figure>
  );
}

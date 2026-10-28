"use client";

/**
 * UK Board v2 — fixed-height line chart (160px drawer, 64px panel). Coordinates use
 * percentages for x and pixels for y, so 11px labels never scale or truncate.
 * At most 2 series; threshold as a dashed line with an 11px label.
 */
import type { SeriesPoint } from "@/lib/ukboard/v1/types";

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

export default function LineChart({
  series,
  height = 160,
  threshold,
  suffix = "",
  axes = true,
  title,
}: {
  series: ChartSeries[];
  height?: number;
  threshold?: { value: number; label: string };
  suffix?: string;
  axes?: boolean;
  title: string;
}) {
  const all = series.flatMap((s) => s.points.map((p) => p.value)).concat(threshold ? [threshold.value] : []);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const top = 8;
  const bottom = axes ? 20 : 6;
  const y = (v: number) => top + (1 - (v - lo) / (hi - lo || 1)) * (height - top - bottom);
  const n = series[0].points.length;
  const x0 = axes ? 9 : 2;
  const x1 = 98;
  const x = (i: number) => `${x0 + (i / Math.max(n - 1, 1)) * (x1 - x0)}%`;
  const desc = series.map((s) => `${s.name}: ${s.points.map((p) => `${p.label} ${p.value}${suffix}`).join(", ")}`).join("; ");
  return (
    <figure className="w-full">
      <svg width="100%" height={height} role="img" aria-label={`${title}. ${desc}`}>
        {threshold ? (
          <>
            <line x1={`${x0}%`} x2={`${x1}%`} y1={y(threshold.value)} y2={y(threshold.value)} stroke="var(--ukb-amber-solid)" strokeDasharray="4 3" />
            <text x={`${x1}%`} y={y(threshold.value) - 4} fontSize={11} textAnchor="end" fill="var(--ukb-amber)">
              {threshold.label}
            </text>
          </>
        ) : null}
        {series.map((s, si) =>
          s.points.slice(1).map((p, i) => (
            <line
              key={`${si}-${i}`}
              x1={x(i)}
              x2={x(i + 1)}
              y1={y(s.points[i].value)}
              y2={y(p.value)}
              stroke={si === 0 ? "var(--ukb-text)" : "var(--ukb-accent)"}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "5 3" : undefined}
            />
          )),
        )}
        {series.map((s, si) =>
          s.points.map((p, i) => <circle key={`${si}-p${i}`} cx={x(i)} cy={y(p.value)} r={2.5} fill={si === 0 ? "var(--ukb-text)" : "var(--ukb-accent)"} />),
        )}
        {axes ? (
          <>
            <text x="0" y={y(hi) + 4} fontSize={11} fill="var(--ukb-subtle)">
              {hi}
              {suffix}
            </text>
            <text x="0" y={y(lo) + 4} fontSize={11} fill="var(--ukb-subtle)">
              {lo}
              {suffix}
            </text>
            {series[0].points.map((p, i) => (
              <text key={p.label} x={x(i)} y={height - 4} fontSize={11} fill="var(--ukb-subtle)" textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>
                {shortLabel(p.label)}
              </text>
            ))}
          </>
        ) : null}
      </svg>
      {series.length > 1 || axes ? (
        <figcaption className="mt-1 flex flex-wrap gap-3 text-[11px] text-[var(--ukb-subtle)]">
          {series.map((s, si) => (
            <span key={s.name} className="inline-flex items-center gap-1">
              <span
                className={`inline-block h-0 w-4 border-t-2 ${s.dashed ? "border-dashed" : ""}`}
                style={{ borderColor: si === 0 ? "var(--ukb-text)" : "var(--ukb-accent)" }}
                aria-hidden
              />
              {s.name}
            </span>
          ))}
        </figcaption>
      ) : null}
    </figure>
  );
}

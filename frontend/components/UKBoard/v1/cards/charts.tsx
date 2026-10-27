"use client";

/**
 * UK Board v1 — plain-SVG charts (no chart library). Unique SVG IDs via useId (TK-4).
 * HeadroomGauge compact: actual against the amber and red bands only (V-7).
 * Full: adds the projection marker, labelled "projection".
 */
import { useId } from "react";
import type { SeriesPoint } from "@/lib/ukboard/v1/types";

export function HeadroomGauge({
  actual,
  amber,
  red,
  max,
  unit,
  mode,
  projection,
  operatingLimit,
}: {
  actual: number;
  amber: number;
  red: number;
  max: number;
  unit: string;
  mode: "compact" | "full";
  projection?: { value: number; label: string };
  operatingLimit?: number;
}) {
  const id = useId();
  const w = 320;
  const h = mode === "full" ? 64 : 30;
  const x = (v: number) => (v / max) * w;
  const label = `Actual ${actual}${unit} against amber ${amber}${unit} and red ${red}${unit}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-md" role="img" aria-labelledby={`${id}-t`}>
      <title id={`${id}-t`}>{label}</title>
      <rect x={0} y={8} width={w} height={10} rx={2} fill="var(--ukb-surface-2)" stroke="var(--ukb-track)" />
      <rect x={x(amber)} y={8} width={x(red) - x(amber)} height={10} fill="var(--ukb-amber-bg)" stroke="var(--ukb-amber)" />
      <rect x={x(red)} y={8} width={w - x(red)} height={10} fill="var(--ukb-red-bg)" stroke="var(--ukb-red)" />
      <line x1={x(actual)} x2={x(actual)} y1={3} y2={23} stroke="var(--ukb-text)" strokeWidth={2.5} />
      {mode === "full" ? (
        <>
          {operatingLimit !== undefined ? (
            <line x1={x(operatingLimit)} x2={x(operatingLimit)} y1={6} y2={20} stroke="var(--ukb-muted)" strokeDasharray="2 2" />
          ) : null}
          {projection ? (
            <>
              <line x1={x(projection.value)} x2={x(projection.value)} y1={3} y2={23} stroke="var(--ukb-accent)" strokeWidth={2} strokeDasharray="3 2" />
              <text x={Math.min(x(projection.value), w - 90)} y={36} fontSize={9} fill="var(--ukb-accent)">
                projection: {projection.label}
              </text>
            </>
          ) : null}
          <text x={0} y={52} fontSize={9} fill="var(--ukb-muted)">
            0{unit}
          </text>
          <text x={x(amber) - 6} y={52} fontSize={9} fill="var(--ukb-amber)">
            amber {amber}
          </text>
          <text x={x(red) + 2} y={52} fontSize={9} fill="var(--ukb-red)">
            red {red}
          </text>
          <text x={w - 34} y={62} fontSize={9} fill="var(--ukb-muted)">
            cap. {max}
          </text>
        </>
      ) : null}
    </svg>
  );
}

/** Line series with optional threshold line and markers. Real points only (VR-006). */
export function SeriesChart({
  series,
  threshold,
  thresholdLabel,
  height = 120,
  valueSuffix = "",
  secondSeries,
}: {
  series: { name: string; points: SeriesPoint[] };
  secondSeries?: { name: string; points: SeriesPoint[] };
  threshold?: number;
  thresholdLabel?: string;
  height?: number;
  valueSuffix?: string;
}) {
  const id = useId();
  const w = 420;
  const pad = { l: 34, r: 10, t: 10, b: 22 };
  const all = [...series.points, ...(secondSeries?.points ?? [])].map((p) => p.value).concat(threshold ?? []);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const span = hi - lo || 1;
  const y = (v: number) => pad.t + (1 - (v - lo) / span) * (height - pad.t - pad.b);
  const n = series.points.length;
  const x = (i: number) => pad.l + (i / Math.max(n - 1, 1)) * (w - pad.l - pad.r);
  const path = (pts: SeriesPoint[]) => pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full" role="img" aria-labelledby={`${id}-t`}>
      <title id={`${id}-t`}>
        {series.name}: {series.points.map((p) => `${p.label} ${p.value}${valueSuffix}`).join(", ")}
        {secondSeries ? `; ${secondSeries.name}: ${secondSeries.points.map((p) => `${p.label} ${p.value}`).join(", ")}` : ""}
      </title>
      {threshold !== undefined ? (
        <>
          <line x1={pad.l} x2={w - pad.r} y1={y(threshold)} y2={y(threshold)} stroke="var(--ukb-amber)" strokeDasharray="4 3" />
          <text x={w - pad.r} y={y(threshold) - 3} fontSize={9} textAnchor="end" fill="var(--ukb-amber)">
            {thresholdLabel}
          </text>
        </>
      ) : null}
      <path d={path(series.points)} fill="none" stroke="var(--ukb-text)" strokeWidth={2} />
      {series.points.map((p, i) => (
        <circle key={p.label} cx={x(i)} cy={y(p.value)} r={2.5} fill="var(--ukb-text)" />
      ))}
      {secondSeries ? (
        <>
          <path d={path(secondSeries.points)} fill="none" stroke="var(--ukb-accent)" strokeWidth={2} strokeDasharray="5 3" />
          {secondSeries.points.map((p, i) => (
            <rect key={p.label} x={x(i) - 2.5} y={y(p.value) - 2.5} width={5} height={5} fill="var(--ukb-accent)" />
          ))}
        </>
      ) : null}
      {series.points.map((p, i) => (
        <text key={`l-${p.label}`} x={x(i)} y={height - 6} fontSize={9} textAnchor="middle" fill="var(--ukb-muted)">
          {p.label}
        </text>
      ))}
      <text x={2} y={y(hi) + 3} fontSize={9} fill="var(--ukb-muted)">
        {hi}
        {valueSuffix}
      </text>
      <text x={2} y={y(lo) + 3} fontSize={9} fill="var(--ukb-muted)">
        {lo}
        {valueSuffix}
      </text>
    </svg>
  );
}

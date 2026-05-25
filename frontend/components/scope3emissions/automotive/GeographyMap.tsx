"use client";

import { useMemo } from "react";
import type { AutomotiveScope3MockData, LogisticsRoute, TransportMode } from "./types";
import { autoTable, autoTableShell, autoTd, autoTh, formatTCO2e } from "./automotive-ui";

function modeTone(mode: TransportMode): { color: string; label: string } {
  switch (mode) {
    case "Air":
      return { color: "var(--danger)", label: "Air" };
    case "Sea":
      return { color: "var(--primary)", label: "Sea" };
    case "Road":
      return { color: "var(--warning)", label: "Road" };
  }
}

const ISO_POS: Record<string, { x: number; y: number }> = {
  IN: { x: 340, y: 160 },
  CN: { x: 420, y: 130 },
  KR: { x: 460, y: 120 },
  DE: { x: 280, y: 95 },
  AU: { x: 480, y: 220 },
  IT: { x: 290, y: 115 },
  TW: { x: 445, y: 145 },
  BE: { x: 275, y: 100 },
  MY: { x: 400, y: 185 },
  JP: { x: 470, y: 125 },
  FR: { x: 268, y: 108 },
};

const PLANT_POS: Record<string, { x: number; y: number }> = {
  Pune: { x: 338, y: 158 },
  Chennai: { x: 345, y: 168 },
  Sanand: { x: 332, y: 152 },
};

export function GeographyChoropleth({ geography }: { geography: AutomotiveScope3MockData["geography"] }) {
  const max = Math.max(...geography.map((g) => g.tCO2e), 1);

  return (
    <svg viewBox="0 0 560 280" className="h-full w-full" role="img" aria-label="Geographic emissions choropleth">
      <rect width="560" height="280" fill="var(--muted)" fillOpacity={0.25} rx={12} />
      <text x="280" y="24" textAnchor="middle" fontSize="11" fill="var(--foreground-muted)">
        Emissions intensity by country (bubble size)
      </text>
      {geography.map((g) => {
        const pos = ISO_POS[g.iso] ?? { x: 280, y: 140 };
        const r = 10 + (g.tCO2e / max) * 28;
        const opacity = 0.35 + (g.tCO2e / max) * 0.55;
        return (
          <g key={g.iso}>
            <circle cx={pos.x} cy={pos.y} r={r} fill="var(--primary)" fillOpacity={opacity} stroke="var(--border)" />
            <text x={pos.x} y={pos.y + r + 12} textAnchor="middle" fontSize="9" fill="var(--foreground-muted)">
              {g.iso}
            </text>
          </g>
        );
      })}
      {Object.entries(PLANT_POS).map(([name, pos]) => (
        <g key={name}>
          <rect x={pos.x - 4} y={pos.y - 4} width={8} height={8} fill="var(--warning)" rx={1} />
          <text x={pos.x + 10} y={pos.y + 4} fontSize="8" fill="var(--foreground)">
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function LogisticsRouteAnalysisTable({ routes }: { routes: LogisticsRoute[] }) {
  const sorted = useMemo(() => [...routes].sort((a, b) => b.tCO2e - a.tCO2e), [routes]);
  const total = useMemo(() => sorted.reduce((a, r) => a + r.tCO2e, 0), [sorted]);

  return (
    <div
      className={`${autoTableShell} flex flex-col overflow-hidden`}
      role="region"
      aria-label="Logistics route analysis"
    >
      <div className="max-h-[min(280px,36vh)] overflow-auto overscroll-contain">
        <table className={autoTable}>
          <thead className="sticky top-0 z-10 shadow-[0_1px_0_var(--border)]">
            <tr>
              <th className={`${autoTh} bg-[var(--card)]`}>Origin</th>
              <th className={`${autoTh} bg-[var(--card)]`}>Destination</th>
              <th className={`${autoTh} bg-[var(--card)]`}>Plant</th>
              <th className={`${autoTh} bg-[var(--card)]`}>Mode</th>
              <th className={`${autoTh} bg-[var(--card)]`}>Distance</th>
              <th className={`${autoTh} bg-[var(--card)] text-right`}>Emissions</th>
              <th className={`${autoTh} bg-[var(--card)] text-right`}>Share</th>
            </tr>
          </thead>
          <tbody>
          {sorted.map((r) => {
            const tone = modeTone(r.mode);
            const share = total > 0 ? ((r.tCO2e / total) * 100).toFixed(1) : "0";
            return (
              <tr key={r.id}>
                <td className={autoTd}>{r.from}</td>
                <td className={autoTd}>{r.to}</td>
                <td className={autoTd}>{r.plant}</td>
                <td className={autoTd}>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ color: tone.color, backgroundColor: `color-mix(in srgb, ${tone.color} 12%, transparent)` }}
                  >
                    <span
                      className="inline-block h-0.5 w-3 rounded-full"
                      style={{
                        backgroundColor: tone.color,
                        borderTop: r.mode === "Air" ? `1px dashed ${tone.color}` : undefined,
                      }}
                      aria-hidden
                    />
                    {tone.label}
                  </span>
                </td>
                <td className={`${autoTd} tabular-nums`}>{r.distanceKm.toLocaleString("en-IN")} km</td>
                <td className={`${autoTd} text-right font-semibold tabular-nums`} style={{ color: tone.color }}>
                  {formatTCO2e(r.tCO2e, true)}
                </td>
                <td className={`${autoTd} text-right tabular-nums text-[var(--foreground-muted)]`}>{share}%</td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--muted)]/25 px-3 py-2.5 text-sm font-semibold">
        <span>Total ({sorted.length} lanes)</span>
        <span className="tabular-nums">
          {formatTCO2e(total, true)}
          <span className="ml-2 font-normal text-[var(--foreground-muted)]">100%</span>
        </span>
      </div>
    </div>
  );
}

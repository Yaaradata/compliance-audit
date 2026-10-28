"use client";

/**
 * UK Board v2 — appetite dial: where we operate against the appetite set.
 * 8px neutral track; amber and red zones from the thresholds; actual = 2px solid tick;
 * projection = hollow tick. `direction` flips the zones for lower-is-worse metrics.
 */
import type { Dial, Direction } from "@/lib/ukboard/v2/board";

const pct = (d: Dial, v: number) => `${Math.min(100, Math.max(0, ((v - d.min) / (d.max - d.min)) * 100))}%`;
const span = (d: Dial, a: number, b: number) => `${Math.max(0, ((Math.min(a, b) - d.min) / (d.max - d.min)) * 100)}%`;
const width = (d: Dial, a: number, b: number) => `${(Math.abs(b - a) / (d.max - d.min)) * 100}%`;

export default function AppetiteDial({
  dial,
  direction,
  labels = false,
  className = "",
}: {
  dial: Dial;
  direction: Direction;
  labels?: boolean;
  className?: string;
}) {
  const { min, max, amber, red, actual, projection } = dial;
  const zones: { from: number; to: number; cls: string }[] = [];
  if (direction === "higherIsWorse") {
    if (amber !== undefined && red !== undefined) zones.push({ from: amber, to: red, cls: "bg-[#fcd34d]" });
    if (red !== undefined) zones.push({ from: red, to: max, cls: "bg-[#fca5a5]" });
  } else {
    if (red !== undefined) zones.push({ from: min, to: red, cls: "bg-[#fca5a5]" });
    if (amber !== undefined && red !== undefined) zones.push({ from: red, to: amber, cls: "bg-[#fcd34d]" });
  }
  const label = `Now ${actual}${dial.unit}${amber !== undefined ? `, amber ${amber}${dial.unit}` : ""}${red !== undefined ? `, red ${red}${dial.unit}` : ""}${
    projection !== undefined ? ", projection reaches amber" : ""
  }`;
  return (
    <div className={`w-full ${className}`} role="img" aria-label={label} title={label}>
      <div className="relative h-3.5">
        <div className="absolute inset-x-0 top-[3px] h-2 rounded-full bg-[#f1f5f9]" />
        {zones.map((z, i) => (
          <div key={i} className={`absolute top-[3px] h-2 ${z.cls}`} style={{ left: span(dial, z.from, z.to), width: width(dial, z.from, z.to) }} />
        ))}
        {projection !== undefined ? (
          <div className="absolute top-0 h-3.5 w-[6px] -translate-x-1/2 rounded-sm border-2 border-[#0f172a] bg-[#ffffff]" style={{ left: pct(dial, projection) }} />
        ) : null}
        <div className="absolute top-0 h-3.5 w-[2px] -translate-x-1/2 bg-[#0f172a]" style={{ left: pct(dial, actual) }} />
      </div>
      {labels ? (
        <div className="mt-1 flex justify-between text-[11px] text-[#64748b]">
          <span>
            now <span className="font-semibold tabular-nums text-[#0f172a]">{actual}{dial.unit}</span>
          </span>
          {red !== undefined ? (
            <span>
              red <span className="font-semibold tabular-nums">{red}{dial.unit}</span>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

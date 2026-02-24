"use client";
import { scoreColor } from "@/lib/utils";

export function ProgressBar({ pct, h = 8, className }: { pct: number; h?: number; className?: string }) {
  return (
    <div className={className} style={{ background: "#e5e7eb", borderRadius: h / 2, height: h, width: "100%", overflow: "hidden" }}>
      <div
        style={{ background: scoreColor(pct), height: "100%", width: `${pct}%`, borderRadius: h / 2, transition: "width 0.5s" }}
      />
    </div>
  );
}

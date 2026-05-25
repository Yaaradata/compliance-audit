"use client";

import type { ReportingContext } from "./types";

export function ReportingContextStrip({ ctx }: { ctx: ReportingContext }) {
  const items = [
    { label: "Entity", value: ctx.entity },
    { label: "Boundary", value: ctx.boundary },
    { label: "Methodology", value: ctx.methodology },
    { label: "Baseline", value: ctx.baselineFY },
    { label: "Close", value: ctx.inventoryClose },
    { label: "Assurance", value: ctx.assuranceLevel },
    { label: "As of", value: new Date(ctx.dataVintage).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) },
  ];

  return (
    <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">{item.label}</p>
          <p className="mt-0.5 truncate text-xs font-medium text-[var(--foreground)]" title={item.value}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { GlobalFilters, ReportingContext } from "./types";
import { ReportingContextStrip } from "./ReportingContextStrip";
import {
  GlobalFiltersBar,
  activeFilterChips,
  countActiveFilters,
  defaultGlobalFilters,
} from "./GlobalFiltersBar";
import { autoBtnSecondary } from "./automotive-ui";

export function InventoryScopeToolbar({
  reportingContext,
  accountingNote,
  filters,
  options,
  onChange,
}: {
  reportingContext: ReportingContext;
  accountingNote: string;
  filters: GlobalFilters;
  options: Parameters<typeof GlobalFiltersBar>[0]["options"];
  onChange: (next: GlobalFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const chips = activeFilterChips(filters);

  return (
    <div className="mb-0">
      <div
        className={[
          "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-gradient-to-r from-[var(--card)] via-[color-mix(in_srgb,var(--primary)_4%,var(--card))] to-[color-mix(in_srgb,#0d9488_5%,var(--card))] px-3 py-2.5 shadow-sm",
          "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]",
        ].join(" ")}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
          <span className="text-xs font-semibold text-[var(--foreground)]">Inventory scope</span>
          {!open ? (
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground-muted)]">
                {filters.period}
              </span>
              {chips.length === 0 ? (
                <span className="text-[10px] text-[var(--foreground-subtle)]">Default filters</span>
              ) : (
                chips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setOpen(true)}
                    className="max-w-[140px] truncate rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/8 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)] hover:bg-[var(--primary)]/15"
                    title={`${c.label}: ${c.value}`}
                  >
                    {c.label}: {c.value}
                  </button>
                ))
              )}
              {activeCount > 0 ? (
                <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-[10px] text-[var(--foreground-muted)]">Adjust reporting boundary and slice</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {activeCount > 0 ? (
            <button
              type="button"
              className={autoBtnSecondary}
              onClick={() => onChange(defaultGlobalFilters)}
              aria-label="Reset filters"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden />
              Reset
            </button>
          ) : null}
          <button
            type="button"
            className={autoBtnSecondary}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? (
              <>
                Hide
                <ChevronUp className="ml-1 h-3.5 w-3.5" aria-hidden />
              </>
            ) : (
              <>
                Filters
                <ChevronDown className="ml-1 h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-2 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-3">
          <ReportingContextStrip ctx={reportingContext} />
          <GlobalFiltersBar filters={filters} options={options} onChange={onChange} />
          <p className="text-[11px] leading-relaxed text-[var(--foreground-subtle)]">{accountingNote}</p>
        </div>
      ) : null}
    </div>
  );
}

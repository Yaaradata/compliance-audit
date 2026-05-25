"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import type { Scope3CategoryRow, Scope3MockData, StreamKind, SupplierRow } from "./types";
import { Scope3DrilldownDrawer, scope3InputClass, scope3ToolbarSurface } from "./scope3-ui";

export function CategoriesView({
  data,
  initialCategoryId,
  onClearInitialCategory,
  onSelectSupplierByName,
}: {
  data: Scope3MockData;
  initialCategoryId: number | null;
  onClearInitialCategory: () => void;
  onSelectSupplierByName: (name: string) => void;
}) {
  const [stream, setStream] = useState<"All" | StreamKind>("All");
  const [categorySearch, setCategorySearch] = useState("");
  const [detailsCategory, setDetailsCategory] = useState<Scope3CategoryRow | null>(null);
  const [allocationDrill, setAllocationDrill] = useState<Scope3CategoryRow | null>(null);

  useEffect(() => {
    if (initialCategoryId == null) return;
    const row = data.scope3Categories.find((x) => x.id === initialCategoryId);
    if (row) {
      startTransition(() => {
        setDetailsCategory(row);
      });
    }
  }, [initialCategoryId, data.scope3Categories]);

  const categories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    return data.scope3Categories.filter((c) => {
      if (stream !== "All" && c.stream !== stream) return false;
      if (q) {
        const hay = `${c.id} ${c.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.scope3Categories, stream, categorySearch]);

  const scorecardSuppliers = useMemo(() => {
    if (!detailsCategory) return [];
    return suppliersForCategory(data.suppliers, detailsCategory.id);
  }, [data.suppliers, detailsCategory]);

  function closeDetails() {
    setDetailsCategory(null);
    onClearInitialCategory();
  }

  function toggleDetails(c: Scope3CategoryRow) {
    const open = detailsCategory?.id === c.id;
    if (open) {
      closeDetails();
      return;
    }
    setDetailsCategory(c);
    onClearInitialCategory();
  }

  return (
    <div className="space-y-8">
      <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${scope3ToolbarSurface}`}>
        <div className="min-w-0 flex-1">
          <label htmlFor="scope3-cat-search" className="text-xs font-medium text-[var(--foreground-muted)]">
            Search categories
          </label>
          <input
            id="scope3-cat-search"
            type="search"
            placeholder="Name or category number…"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className={`mt-1 sm:max-w-md ${scope3InputClass}`}
            aria-label="Filter categories"
          />
        </div>
        <div className="flex shrink-0 gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-1 text-sm shadow-inner">
          {(["All", "Upstream", "Downstream"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                (k === "All" && stream === "All") || k === stream
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--surface)]"
              }`}
              onClick={() => setStream(k === "All" ? "All" : k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          All categories
        </p>
        <h2 className="mt-1 text-sm font-semibold text-[var(--foreground)]">
          Open <span className="font-semibold text-[var(--primary)]">All Details</span> for supplier scorecards, methodology
          &amp; BRSR
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.length === 0 ? (
            <div className="col-span-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] px-4 py-12 text-center text-sm text-[var(--foreground-muted)] shadow-[var(--shadow)]">
              No categories match the current stream filter or search. Clear the search or switch upstream / downstream.
            </div>
          ) : (
            categories.map((c) => {
              const drawerOpen = detailsCategory?.id === c.id;
              return (
                <article
                  key={c.id}
                  className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] transition-shadow duration-200 hover:shadow-lg dark:ring-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[var(--primary)]">
                        Cat {c.id} · {c.stream}
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-[var(--foreground)]">{c.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 tabular-nums">
                          {(c.tCO2e / 1000).toFixed(1)} ktCO₂e
                        </span>
                        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5">{c.pctOfTotal}% of total</span>
                        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5">{c.dataQuality}</span>
                        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5">
                          YoY {c.yoyPct >= 0 ? "+" : ""}
                          {c.yoyPct}%
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                        {c.supplierCount} contributing entities · Top:{" "}
                        <button
                          type="button"
                          className="font-medium text-[var(--primary)] hover:underline"
                          onClick={() => onSelectSupplierByName(c.topSupplier)}
                        >
                          {c.topSupplier}
                        </button>
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] ${
                        drawerOpen
                          ? "border-[var(--primary)]/40 bg-[var(--primary-muted)]/25 text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] hover:bg-[var(--primary-muted)]/25 hover:border-[var(--primary)]/30"
                      }`}
                      aria-expanded={drawerOpen}
                      aria-controls="category-details-drawer"
                      onClick={() => toggleDetails(c)}
                    >
                      {drawerOpen ? "Close details" : "All Details"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      <Scope3DrilldownDrawer
        open={detailsCategory != null}
        onClose={closeDetails}
        size="lg"
        title={detailsCategory ? `Cat ${detailsCategory.id} · ${detailsCategory.name}` : ""}
        subtitle={
          detailsCategory
            ? `Supplier scorecards (${scorecardSuppliers.length} linked) · ${detailsCategory.stream}`
            : undefined
        }
      >
        {detailsCategory ? (
          <CategoryDetailsBody
            category={detailsCategory}
            suppliers={scorecardSuppliers}
            onOpenSupplier={onSelectSupplierByName}
            onAllocation={() => setAllocationDrill(detailsCategory)}
          />
        ) : null}
      </Scope3DrilldownDrawer>

      <Scope3DrilldownDrawer
        open={allocationDrill != null}
        onClose={() => setAllocationDrill(null)}
        title={allocationDrill ? `Cat ${allocationDrill.id} — allocation drill` : ""}
        subtitle={allocationDrill?.name}
      >
        {allocationDrill ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--foreground-muted)]">{allocationDrill.methodologyNote}</p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--foreground-muted)]">
                  <th className="py-2 pr-2">Line</th>
                  <th className="py-2 text-right">Share</th>
                  <th className="py-2 text-right">tCO₂e</th>
                </tr>
              </thead>
              <tbody>
                {sampleCategoryAllocation(allocationDrill).map((row) => (
                  <tr key={row.line} className="border-b border-[var(--border)]/80">
                    <td className="py-2 pr-2 text-[var(--foreground-muted)]">{row.line}</td>
                    <td className="py-2 text-right tabular-nums text-[var(--foreground-muted)]">{row.pct}%</td>
                    <td className="py-2 text-right tabular-nums">{Math.round(row.tCO2e).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[var(--foreground-muted)]">
              Illustrative split for demos — ties to category total {(allocationDrill.tCO2e / 1000).toFixed(1)} kt.
            </p>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function suppliersForCategory(suppliers: SupplierRow[], categoryId: number): SupplierRow[] {
  return [...suppliers]
    .filter((s) => s.primaryCategories.includes(categoryId))
    .sort((a, b) => b.scope3ContributionTCO2e - a.scope3ContributionTCO2e || a.name.localeCompare(b.name));
}

function CategoryDetailsBody({
  category,
  suppliers,
  onOpenSupplier,
  onAllocation,
}: {
  category: Scope3CategoryRow;
  suppliers: SupplierRow[];
  onOpenSupplier: (name: string) => void;
  onAllocation: () => void;
}) {
  const linkedTonnesSum = useMemo(
    () => suppliers.reduce((a, x) => a + x.scope3ContributionTCO2e, 0),
    [suppliers],
  );

  return (
    <div id="category-details-drawer" className="space-y-8 pb-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Supplier scorecards
        </p>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Same card layout as All categories — attributed Scope 3, data quality, and governance signals for suppliers linked
          to this GHG category.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {suppliers.length === 0 ? (
            <div className="col-span-full rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
              No suppliers are tagged for this category in the demo set — use the top contributor link on the category card
              or enrich supplier master data.
            </div>
          ) : (
            suppliers.map((s) => (
              <SupplierScorecardTile
                key={s.id}
                supplier={s}
                shareAmongLinkedPct={
                  linkedTonnesSum > 0 ? (s.scope3ContributionTCO2e / linkedTonnesSum) * 100 : 0
                }
                onOpenSupplier={onOpenSupplier}
              />
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Methodology &amp; BRSR
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--foreground-muted)]">
          <span className="font-semibold text-[var(--foreground)]">Methodology: </span>
          {category.methodologyNote}
        </p>
        <p className="mt-2 text-xs leading-relaxed">
          <span className="font-semibold">Emission factors: </span>
          {category.emissionFactorSummary}
        </p>
        <div className="mt-2 text-xs">
          <span className="font-semibold">Data sources: </span>
          {category.dataSources.join(" · ")}
        </div>
        <div className="mt-2 text-xs">
          <span className="font-semibold">Control gaps: </span>
          {category.controlGaps.join(" · ")}
        </div>
        <p className="mt-2 text-xs">
          <span className="font-semibold">BRSR: </span>
          {category.brsrMapping}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            onClick={onAllocation}
          >
            Allocation &amp; factor lines
          </button>
        </div>
      </div>
    </div>
  );
}

function SupplierScorecardTile({
  supplier,
  shareAmongLinkedPct,
  onOpenSupplier,
}: {
  supplier: SupplierRow;
  shareAmongLinkedPct: number;
  onOpenSupplier: (name: string) => void;
}) {
  const ev = supplier.scope3Evaluation;

  return (
    <article className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
      <div className="p-4">
        <div className="text-xs font-semibold text-[var(--primary)]">
          {supplier.segment} · {supplier.risk} risk
        </div>
        <h3 className="mt-1 text-sm font-semibold text-[var(--foreground)]">{supplier.name}</h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 tabular-nums">
            {(supplier.scope3ContributionTCO2e / 1000).toFixed(1)} ktCO₂e
          </span>
          <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 tabular-nums">{shareAmongLinkedPct.toFixed(1)}% of linked</span>
          <span className="rounded-md bg-[var(--muted)] px-2 py-0.5">{supplier.dataQuality}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-[var(--muted)] px-2 py-0.5">Index {ev.compositeIndex}</span>
          <span className="rounded-md bg-[var(--muted)] px-2 py-0.5">ESG {supplier.esgScore}</span>
          <span className="rounded-md bg-[var(--muted)] px-2 py-0.5">
            {supplier.scope3Required} · {supplier.procurementPriority}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-[var(--foreground-muted)]">
          <span className="font-medium text-[var(--foreground)]">Line: </span>
          {supplier.productPurchased}
        </p>
        <p className="mt-2 text-xs text-[var(--foreground-muted)]">
          {supplier.submissionStatus} · assessed {supplier.lastAssessed}
        </p>
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
          onClick={() => onOpenSupplier(supplier.name)}
        >
          Open supplier record →
        </button>
      </div>
    </article>
  );
}

function sampleCategoryAllocation(c: Scope3CategoryRow) {
  const total = c.tCO2e;
  const splits = [
    { line: "Tier-1 supplier-specific", pct: 38 },
    { line: "Tier-2 allocated", pct: 27 },
    { line: "Secondary factors / proxies", pct: 22 },
    { line: "Spend-based residual", pct: 13 },
  ];
  return splits.map((s) => ({ ...s, tCO2e: (total * s.pct) / 100 }));
}

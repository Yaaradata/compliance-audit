"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AutoPersonaId, AutomotiveScope3MockData } from "./types";
import type { AutoGhgGasCode, AutoGhgTrackingMockData } from "./ghg-tracking-types";
import { autoGhgTrackingMockData } from "./ghg-tracking-mock-data";
import {
  Scope3DrilldownDrawer,
  Scope3Panel,
  Scope3SectionLabel,
  scope3SelectClass,
} from "../Pharma/scope3-ui";
import { Scope3KpiStrip, autoKpiToneAt } from "../scope3-kpi";
import { AutoChartBox, AutoResponsiveChart, autoPage, autoTable, autoTableShell, autoTd, autoTh } from "./automotive-ui";

export function EmissionsTrackingView({
  data,
  ghg = autoGhgTrackingMockData,
  persona = "sustainability_head",
  canOpenAiInsights = true,
  onSelectCategory,
  onOpenSupplier,
  onOpenAiInsight,
}: {
  data: AutomotiveScope3MockData;
  ghg?: AutoGhgTrackingMockData;
  persona?: AutoPersonaId;
  canOpenAiInsights?: boolean;
  onSelectCategory?: (category: string) => void;
  onOpenSupplier?: (supplierId: string) => void;
  onOpenAiInsight?: (insightId: string) => void;
}) {
  return (
    <EmissionsTrackingViewLoaded
      ghg={ghg}
      data={data}
      persona={persona}
      canOpenAiInsights={canOpenAiInsights}
      onSelectCategory={onSelectCategory ?? (() => {})}
      onOpenSupplier={onOpenSupplier ?? (() => {})}
      onOpenAiInsight={onOpenAiInsight ?? (() => {})}
    />
  );
}

const GAS_ORDER: AutoGhgGasCode[] = ["CO2", "CH4", "N2O", "HFCS", "OTHER"];

const GAS_STACK_COLORS: Record<AutoGhgGasCode, string> = {
  CO2: "#64748b",
  CH4: "#ea580c",
  N2O: "#7c3aed",
  HFCS: "#0891b2",
  OTHER: "#94a3b8",
};

function fmt(n: number, d = 0): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: d }).format(n);
}

function fmtTCO2e(n: number): string {
  return `${Math.round(n).toLocaleString("en-IN")} tCO₂e`;
}

function gasLabel(code: AutoGhgGasCode): string {
  if (code === "CO2") return "CO₂";
  if (code === "CH4") return "CH₄";
  if (code === "N2O") return "N₂O";
  if (code === "HFCS") return "HFCs";
  return "Other";
}

function GasSpeciesKpiRow({
  species,
  onDrill,
}: {
  species: { code: AutoGhgGasCode; formula: string; tCO2e: number; pctOfScope3: number }[];
  onDrill: (code: AutoGhgGasCode) => void;
}) {
  return (
    <Scope3KpiStrip
      items={species.map((s, i) => ({
        label: s.formula,
        value: fmtTCO2e(s.tCO2e),
        sub: `${s.pctOfScope3.toFixed(2)}% of Scope 3 (tracker) · Drill down →`,
        accentColor: GAS_STACK_COLORS[s.code],
        tone: autoKpiToneAt(i),
        onClick: () => onDrill(s.code),
      }))}
    />
  );
}

export function EmissionsTrackingViewLoaded({
  ghg,
  data,
  persona,
  canOpenAiInsights,
  onSelectCategory,
  onOpenSupplier,
  onOpenAiInsight,
}: {
  ghg: AutoGhgTrackingMockData;
  data: AutomotiveScope3MockData;
  persona: AutoPersonaId;
  canOpenAiInsights: boolean;
  onSelectCategory: (category: string) => void;
  onOpenSupplier: (supplierId: string) => void;
  onOpenAiInsight: (insightId: string) => void;
}) {
  const board = persona === "executive";
  const inv = ghg.gasInventory;
  const [selectedCategory, setSelectedCategory] = useState(() => ghg.categoryTracker[0]?.category ?? "");
  const [gasDrill, setGasDrill] = useState<AutoGhgGasCode | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const categoryRollupFromTracker = useMemo(
    () => ghg.categoryTracker.reduce((a, r) => a + r.scope3TCO2e, 0),
    [ghg.categoryTracker],
  );
  const headlineGap = Math.round(categoryRollupFromTracker) !== Math.round(inv.executiveScope3TCO2e);

  const insightById = useMemo(() => {
    const m = new Map<string, (typeof data.insightFeed)[0]>();
    for (const i of data.insightFeed) m.set(i.id, i);
    return m;
  }, [data.insightFeed]);

  const speciesMeta = useMemo(() => {
    const m = new Map<AutoGhgGasCode, (typeof inv.speciesRollup)[0]>();
    for (const s of inv.speciesRollup) m.set(s.code, s);
    return m;
  }, [inv.speciesRollup]);

  const drillSpecies = gasDrill ? speciesMeta.get(gasDrill) : undefined;

  const chartRows = useMemo(() => {
    const top = [...inv.categorySlices]
      .map((s) => {
        const total = GAS_ORDER.reduce((a, g) => a + s.tCO2eByGas[g], 0);
        return {
          key: s.category,
          label: s.category.length > 22 ? `${s.category.slice(0, 20)}…` : s.category,
          fullName: s.category,
          CO2: s.tCO2eByGas.CO2,
          CH4: s.tCO2eByGas.CH4,
          N2O: s.tCO2eByGas.N2O,
          HFCS: s.tCO2eByGas.HFCS,
          OTHER: s.tCO2eByGas.OTHER,
          total,
        };
      })
      .sort((a, b) => b.total - a.total || a.fullName.localeCompare(b.fullName))
      .slice(0, 10);
    return top;
  }, [inv.categorySlices]);

  /** Aggregated gas mix across the same top-10 categories as `chartRows` (for pie). */
  const topTenGasMixPie = useMemo(() => {
    const totals: Record<AutoGhgGasCode, number> = { CO2: 0, CH4: 0, N2O: 0, HFCS: 0, OTHER: 0 };
    for (const row of chartRows) {
      for (const g of GAS_ORDER) totals[g] += row[g];
    }
    return GAS_ORDER.map((code) => ({
      code,
      name: gasLabel(code),
      value: totals[code],
      fill: GAS_STACK_COLORS[code],
    })).filter((d) => d.value > 0);
  }, [chartRows]);

  const categoryRowsForGas = useMemo(() => {
    if (!gasDrill) return [];
    return [...inv.categorySlices]
      .map((row) => ({
        category: row.category,
        t: row.tCO2eByGas[gasDrill] ?? 0,
      }))
      .filter((r) => r.t > 0)
      .sort((a, b) => b.t - a.t || a.category.localeCompare(b.category));
  }, [gasDrill, inv.categorySlices]);

  const supplierRowsForGas = useMemo(() => {
    if (!gasDrill) return [];
    return [...inv.supplierSlices]
      .map((row) => ({
        supplierId: row.supplierId,
        name: row.supplierName,
        category: row.category,
        t: row.tCO2eByGas[gasDrill] ?? 0,
      }))
      .filter((r) => r.t > 0)
      .sort((a, b) => b.t - a.t || a.name.localeCompare(b.name));
  }, [gasDrill, inv.supplierSlices]);

  const narrativesForGas = useMemo(() => {
    if (!gasDrill) return [];
    return inv.narrativeInsights.filter((n) => n.gasCodes.includes(gasDrill));
  }, [gasDrill, inv.narrativeInsights]);

  const trackerChart = useMemo(
    () =>
      [...ghg.categoryTracker]
        .sort((a, b) => b.scope3TCO2e - a.scope3TCO2e)
        .map((r) => ({
          ...r,
          categoryShort: r.category.length > 22 ? `${r.category.slice(0, 20)}…` : r.category,
          kt: Math.round((r.scope3TCO2e / 1_000_000) * 100) / 100,
        })),
    [ghg.categoryTracker],
  );

  const detail = useMemo(() => ghg.categoryDetails.find((d) => d.category === selectedCategory) ?? null, [ghg.categoryDetails, selectedCategory]);

  const intensityYDomain = useMemo((): [number, number] => {
    const vals: number[] = [];
    for (const p of ghg.intensityTrend) {
      vals.push(p.scope3IntensityPerVehicle, p.scope3IntensityPerRevenueCr, p.internalBenchmark);
    }
    if (!vals.length) return [0, 800];
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = Math.max(16, (hi - lo) * 0.12);
    return [Math.floor(lo - pad), Math.ceil(hi + pad)];
  }, [ghg.intensityTrend]);

  const speciesOrdered = useMemo(
    () => GAS_ORDER.map((code) => speciesMeta.get(code)).filter((s): s is NonNullable<typeof s> => s != null),
    [speciesMeta],
  );

  return (
    <div className={autoPage}>
      <GasSpeciesKpiRow species={speciesOrdered} onDrill={setGasDrill} />

      {headlineGap ? (
        <p className="rounded-md border border-[var(--warning)]/40 bg-[var(--warning-bg)]/30 p-3 text-xs leading-relaxed text-[var(--foreground)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.06]">
          <span className="font-semibold">Reconciliation note: </span>
          Category tracker roll-up is {fmtTCO2e(categoryRollupFromTracker)} while the executive Scope 3 headline is{" "}
          {fmtTCO2e(inv.executiveScope3TCO2e)}. The gas view is anchored to category slices so the pie mix and species totals stay internally consistent.
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel
            title="Category-wise Scope 3 Scope 3 inventory"
            description="Scope 3 by GHG Protocol category — kt CO₂e (single colour). Totals align with the gas-mix pie (top ten categories combined)."
          />
          <AutoChartBox heightClass="h-[min(420px,52vh)] min-h-[280px]">
<BarChart data={trackerChart} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                <XAxis type="number" tickFormatter={(v) => fmt(v)} stroke="var(--foreground-muted)" fontSize={11} />
                <YAxis type="category" dataKey="categoryShort" width={148} tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" />
                <Tooltip formatter={(v) => [`${fmt(Number(v), 1)} kt`, "Scope 3"]} />
                <Bar dataKey="kt" name="kt CO₂e" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
</AutoChartBox>
        </Scope3Panel>

        <Scope3Panel className="!p-4">
          <Scope3SectionLabel
            title="Top categories — gas species mix (pie)"
            description="Slices sum illustrative CO₂, CH₄, N₂O, HFCs, and other CO₂e across the same top ten categories by attributed emissions (combined book slice)."
          />
          <div className="mt-4 flex h-[min(420px,52vh)] w-full min-h-[280px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm ring-1 ring-slate-900/[0.04] sm:p-4 dark:ring-white/[0.06]">
            {chartsReady && topTenGasMixPie.length > 0 ? (
              <AutoResponsiveChart minHeight={280}>
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={topTenGasMixPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="78%"
                    innerRadius="42%"
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      percent != null && percent >= 0.04 ? `${String(name)} ${(percent * 100).toFixed(0)}%` : ""
                    }
                  >
                    {topTenGasMixPie.map((entry) => (
                      <Cell key={entry.code} fill={entry.fill} stroke="var(--card)" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => {
                      if (value == null) return ["—", "tCO₂e"];
                      const v = typeof value === "number" ? value : Number(value);
                      const n = Number.isFinite(v) ? v : 0;
                      return [fmtTCO2e(n), "tCO₂e"];
                    }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="bottom" height={28} />
                </PieChart>
              </AutoResponsiveChart>
            ) : (
              <div className="flex h-full min-h-[280px] flex-1 items-center justify-center text-sm text-[var(--foreground-muted)]">Preparing chart…</div>
            )}
          </div>
        </Scope3Panel>
      </section>

      <section>
        <Scope3Panel className="!p-0">
          <div className="border-b border-[var(--border)] px-4 py-4 sm:px-5">
            <Scope3SectionLabel
              className="!mb-0"
              title="Emission factor register"
              description="Approved factors for Scope 3 inventory modelling — version, Data tier option, and last QA date."
            />
          </div>
          <div className={autoTableShell}>
            <table className={`min-w-[880px] ${autoTable}`}>
              <thead>
                <tr>
                  {["ID", "Category", "Source", "Factor (kg CO₂e)", "Unit", "Vintage", "Data tier", "Last reviewed"].map((h) => (
                    <th key={h} className={autoTh}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ghg.emissionFactorRegister.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--muted)]/30">
                    <td className={`${autoTd} font-mono text-xs`}>{r.id}</td>
                    <td className={`${autoTd} font-medium`}>{r.category}</td>
                    <td className={`max-w-[280px] ${autoTd} text-[var(--foreground-muted)]`}>{r.source}</td>
                    <td className={`${autoTd} font-mono text-xs`}>{r.factorKgCO2ePerUnit}</td>
                    <td className={`${autoTd} text-xs`}>{r.unit}</td>
                    <td className={`${autoTd} font-mono text-xs`}>{r.vintage}</td>
                    <td className={`${autoTd} text-xs`}>{r.dataTier}</td>
                    <td className={`${autoTd} font-mono text-xs`}>{r.lastReviewed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Scope3Panel>
      </section>

      {!board ? (
        <section>
          <Scope3SectionLabel
            title="Top suppliers — same species profile (tCO₂e)"
            description="Illustrative gas allocation on attributed Scope 3 inventory for the heaviest suppliers; open a row to jump into the Categorys company drill-down."
          />
          <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--muted)]/30 text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Supplier</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  {GAS_ORDER.map((g) => (
                    <th key={g} className="px-3 py-2 font-semibold tabular-nums">
                      {gasLabel(g)}
                    </th>
                  ))}
                  <th className="px-3 py-2 font-semibold tabular-nums">Total (check)</th>
                  <th className="px-3 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {inv.supplierSlices.map((row) => {
                  const sum = GAS_ORDER.reduce((a, g) => a + (row.tCO2eByGas[g] ?? 0), 0);
                  return (
                    <tr key={row.supplierId} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-3 py-2 font-medium text-[var(--foreground)]">{row.supplierName}</td>
                      <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{row.category}</td>
                      {GAS_ORDER.map((g) => (
                        <td key={g} className="px-3 py-2 tabular-nums text-[var(--foreground-muted)]">
                          {fmtTCO2e(row.tCO2eByGas[g] ?? 0)}
                        </td>
                      ))}
                      <td className="px-3 py-2 tabular-nums text-[var(--foreground)]">{fmtTCO2e(sum)}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="text-xs font-semibold text-[var(--primary)] hover:underline"
                          onClick={() => onOpenSupplier(row.supplierId)}
                        >
                          Supplier record
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-4 text-sm leading-relaxed text-[var(--foreground-muted)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]">
          Detailed supplier gas allocation is hidden in the Executive lens — use Categorys or Scope 3 for board-ready views.
        </p>
      )}

      <section>
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel
            title="Category detail panel"
            description="Drivers, MRV posture, and next actions for disclosure and engagement."
            action={
              <label className="flex min-w-[200px] flex-col gap-1 text-xs text-[var(--foreground-muted)]">
                Category
                <select className={scope3SelectClass} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {ghg.categoryTracker.map((s) => (
                    <option key={s.category} value={s.category}>
                      {s.category}
                    </option>
                  ))}
                </select>
              </label>
            }
          />
          {detail ? (
            <div className="mt-4 space-y-4 text-sm text-[var(--foreground-muted)]">
              <p className="leading-relaxed text-[var(--foreground)]">{detail.narrative}</p>
              <div>
                <div className="text-[11px] font-bold uppercase text-[var(--foreground-muted)]">Total Scope 3</div>
                <div className="font-mono text-lg font-semibold text-[var(--foreground)]">{fmt(detail.totalScope3TCO2e)} tCO₂e</div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-[var(--foreground-muted)]">Top emission sources (attributed)</div>
                <ul className="mt-2 space-y-2">
                  {detail.topSources.map((t) => (
                    <li key={t.label} className="flex flex-wrap justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                      <span className="text-[var(--foreground)]">{t.label}</span>
                      <span className="font-mono text-xs text-[var(--foreground)]">
                        {t.pct}% · {fmt(t.tCO2e)} t
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                <div className="text-[11px] font-bold uppercase text-[var(--foreground-muted)]">MRV status</div>
                <p className="mt-2 text-sm">{detail.mrvStatus}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-[var(--foreground-muted)]">Next actions</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {detail.nextActions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-[var(--foreground-muted)]">No detail block for this category in mock data.</p>
          )}
        </Scope3Panel>
      </section>

      <section>
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel
            title="GHG / Scope 3 intensity trend" description="Scope 3 intensity per vehicle sold vs per ₹ cr revenue and internal benchmark corridor."
          />
          <AutoChartBox heightClass="h-72">
<LineChart data={ghg.intensityTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                <XAxis dataKey="fy" tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" angle={-12} textAnchor="end" height={56} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="var(--foreground-muted)"
                  tickFormatter={(v) => fmt(Number(v))}
                  domain={intensityYDomain}
                />
                <Tooltip formatter={(v) => [fmt(Number(v)), ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="linear" dataKey="scope3IntensityPerVehicle" name="tCO₂e / vehicle sold" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                <Line
                  type="linear"
                  dataKey="scope3IntensityPerRevenueCr"
                  name="tCO₂e / ₹ cr revenue"
                  stroke="var(--foreground-muted)"
                  strokeDasharray="5 4"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="linear"
                  dataKey="internalBenchmark"
                  name="Internal benchmark"
                  stroke="var(--success)"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
</AutoChartBox>
        </Scope3Panel>
      </section>

      <Scope3DrilldownDrawer
        open={gasDrill != null}
        onClose={() => setGasDrill(null)}
        size="lg"
        title={drillSpecies ? `${drillSpecies.formula} — ${drillSpecies.label}` : ""}
        subtitle={drillSpecies ? `${fmtTCO2e(drillSpecies.tCO2e)} · ${drillSpecies.pctOfScope3.toFixed(2)}% of Scope 3 (tracker)` : undefined}
        footer={
          gasDrill ? (
            <p className="text-xs text-[var(--foreground-muted)]">
              <span className="font-semibold text-[var(--foreground)]">GWP note: </span>
              {speciesMeta.get(gasDrill)?.ar5Note}
            </p>
          ) : null
        }
      >
        {gasDrill && drillSpecies ? (
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Where this gas sits in Scope 3 categories</h3>
              <ol className="mt-3 space-y-2">
                {categoryRowsForGas.slice(0, 12).map((r) => (
                  <li key={r.category}>
                    <button
                      type="button"
                      className="flex w-full flex-wrap items-baseline justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2 text-left hover:bg-[var(--muted)]/40"
                      onClick={() => {
                        onSelectCategory(r.category);
                        setSelectedCategory(r.category);
                        setGasDrill(null);
                      }}
                    >
                      <span className="font-medium text-[var(--foreground)]">{r.category}</span>
                      <span className="tabular-nums text-[var(--foreground-muted)]">{fmtTCO2e(r.t)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>

            {!board && supplierRowsForGas.length > 0 ? (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Top suppliers for this species</h3>
                <ul className="mt-3 space-y-2">
                  {supplierRowsForGas.map((r) => (
                    <li key={r.supplierId}>
                      <button
                        type="button"
                        className="flex w-full items-baseline justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-left hover:bg-[var(--muted)]/25"
                        onClick={() => {
                          onOpenSupplier(r.supplierId);
                          setGasDrill(null);
                        }}
                      >
                        <span className="text-[var(--foreground)]">{r.name}</span>
                        <span className="tabular-nums text-[var(--foreground-muted)]">{fmtTCO2e(r.t)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Linked narratives & AI queue</h3>
              {narrativesForGas.length === 0 ? (
                <p className="mt-2 text-xs text-[var(--foreground-muted)]">No cross-linked narratives reference this species in isolation — try CO₂ for portfolio-wide drivers.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {narrativesForGas.map((n) => (
                    <li key={n.id} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/15 p-3">
                      <div className="font-medium text-[var(--foreground)]">{n.headline}</div>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">{n.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {n.relatedInsightIds.map((rid) => {
                          const ins = insightById.get(rid);
                          return (
                            <button
                              key={rid}
                              type="button"
                              disabled={!canOpenAiInsights}
                              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-medium hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-45"
                              onClick={() => {
                                if (!canOpenAiInsights) return;
                                onOpenAiInsight(rid);
                                setGasDrill(null);
                              }}
                            >
                              {ins ? `AI: ${ins.headline.slice(0, 40)}…` : rid}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

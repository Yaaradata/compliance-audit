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
import { Link2 } from "lucide-react";
import type { BankGhgGasCode, BankPersonaId, BankScope3MockData, GhgTrackingMockData } from "./types";
import { isBoardPersona } from "./personaAccess";
import {
  Scope3DrilldownDrawer,
  Scope3Panel,
  Scope3SectionLabel,
  scope3SelectClass,
} from "../Pharma/scope3-ui";
import { Scope3KpiStrip, autoKpiToneAt } from "../scope3-kpi";
import { BankChartBox, bankPage, bankTable, bankTableShell, bankTd, bankTh } from "./banking-ui";

const GAS_ORDER: BankGhgGasCode[] = ["CO2", "CH4", "N2O", "HFCS", "OTHER"];

const GAS_STACK_COLORS: Record<BankGhgGasCode, string> = {
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

function gasLabel(code: BankGhgGasCode): string {
  if (code === "CO2") return "CO₂";
  if (code === "CH4") return "CH₄";
  if (code === "N2O") return "N₂O";
  if (code === "HFCS") return "HFCs";
  return "Other";
}

export function GhgTrackingView({
  ghg,
  data,
  persona,
  canOpenAiInsights,
  onSelectSector,
  onOpenBorrower,
  onOpenAiInsight,
}: {
  ghg: GhgTrackingMockData;
  data: BankScope3MockData;
  persona: BankPersonaId;
  canOpenAiInsights: boolean;
  onSelectSector: (sector: string) => void;
  onOpenBorrower: (borrowerId: string) => void;
  onOpenAiInsight: (insightId: string) => void;
}) {
  const board = isBoardPersona(persona);
  const inv = ghg.gasInventory;
  const [selectedSector, setSelectedSector] = useState(() => ghg.sectorTracker[0]?.sector ?? "");
  const [gasDrill, setGasDrill] = useState<BankGhgGasCode | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const sectorRollupFromTracker = useMemo(
    () => ghg.sectorTracker.reduce((a, r) => a + r.scope3FinancedTCO2e, 0),
    [ghg.sectorTracker],
  );
  const headlineGap = Math.round(sectorRollupFromTracker) !== Math.round(inv.executiveFinancedScope3TCO2e);

  const insightById = useMemo(() => {
    const m = new Map<string, (typeof data.aiInsights)[0]>();
    for (const i of data.aiInsights) m.set(i.id, i);
    return m;
  }, [data.aiInsights]);

  const speciesMeta = useMemo(() => {
    const m = new Map<BankGhgGasCode, (typeof inv.speciesRollup)[0]>();
    for (const s of inv.speciesRollup) m.set(s.code, s);
    return m;
  }, [inv.speciesRollup]);

  const drillSpecies = gasDrill ? speciesMeta.get(gasDrill) : undefined;

  const chartRows = useMemo(() => {
    const top = [...inv.sectorSlices]
      .map((s) => {
        const total = GAS_ORDER.reduce((a, g) => a + s.tCO2eByGas[g], 0);
        return {
          key: s.sector,
          label: s.sector.length > 22 ? `${s.sector.slice(0, 20)}…` : s.sector,
          fullName: s.sector,
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
  }, [inv.sectorSlices]);

  /** Aggregated gas mix across the same top-10 sectors as `chartRows` (for pie). */
  const topTenGasMixPie = useMemo(() => {
    const totals: Record<BankGhgGasCode, number> = { CO2: 0, CH4: 0, N2O: 0, HFCS: 0, OTHER: 0 };
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
    return [...inv.sectorSlices]
      .map((row) => ({
        sector: row.sector,
        t: row.tCO2eByGas[gasDrill] ?? 0,
      }))
      .filter((r) => r.t > 0)
      .sort((a, b) => b.t - a.t || a.sector.localeCompare(b.sector));
  }, [gasDrill, inv.sectorSlices]);

  const borrowerRowsForGas = useMemo(() => {
    if (!gasDrill) return [];
    return [...inv.borrowerSlices]
      .map((row) => ({
        borrowerId: row.borrowerId,
        name: row.borrowerName,
        sector: row.sector,
        t: row.tCO2eByGas[gasDrill] ?? 0,
      }))
      .filter((r) => r.t > 0)
      .sort((a, b) => b.t - a.t || a.name.localeCompare(b.name));
  }, [gasDrill, inv.borrowerSlices]);

  const narrativesForGas = useMemo(() => {
    if (!gasDrill) return [];
    return inv.narrativeInsights.filter((n) => n.gasCodes.includes(gasDrill));
  }, [gasDrill, inv.narrativeInsights]);

  const trackerChart = useMemo(
    () =>
      [...ghg.sectorTracker]
        .sort((a, b) => b.scope3FinancedTCO2e - a.scope3FinancedTCO2e)
        .map((r) => ({
          ...r,
          sectorShort: r.sector.length > 22 ? `${r.sector.slice(0, 20)}…` : r.sector,
          mt: Math.round((r.scope3FinancedTCO2e / 1_000_000) * 100) / 100,
        })),
    [ghg.sectorTracker],
  );

  const detail = useMemo(() => ghg.sectorDetails.find((d) => d.sector === selectedSector) ?? null, [ghg.sectorDetails, selectedSector]);

  const intensityYDomain = useMemo((): [number, number] => {
    const vals: number[] = [];
    for (const p of ghg.intensityTrend) {
      vals.push(p.scope3IntensityPerCr, p.allScopesIntensityPerCr, p.portfolioBenchmark);
    }
    if (!vals.length) return [0, 800];
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = Math.max(16, (hi - lo) * 0.12);
    return [Math.floor(lo - pad), Math.ceil(hi + pad)];
  }, [ghg.intensityTrend]);

  return (
    <div className={`${bankPage} space-y-8`}>
      {headlineGap ? (
        <p className="rounded-md border border-[var(--warning)]/40 bg-[var(--warning-bg)]/30 p-3 text-xs leading-relaxed text-[var(--foreground)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.06]">
          <span className="font-semibold">Reconciliation note: </span>
          Sector tracker roll-up is {fmtTCO2e(sectorRollupFromTracker)} while the executive financed Scope 3 headline is{" "}
          {fmtTCO2e(inv.executiveFinancedScope3TCO2e)}. The gas view is anchored to sector slices so the pie mix and species totals stay internally consistent.
        </p>
      ) : null}

      <Scope3KpiStrip
        items={inv.speciesRollup.map((s, i) => ({
          label: s.formula,
          value: fmtTCO2e(s.tCO2e),
          sub: `${s.pctOfScope3.toFixed(2)}% of financed Scope 3 (tracker) · Drill down →`,
          accentColor: GAS_STACK_COLORS[s.code],
          tone: autoKpiToneAt(i),
          onClick: () => setGasDrill(s.code),
        }))}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel
            title="Sector-wise Scope 3 financed emissions"
            description="Attributed Category 15 — Mt CO₂e by sector (single colour). Totals align with the gas-mix pie (top ten sectors combined)."
          />
          <BankChartBox heightClass="h-[min(420px,52vh)] min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trackerChart} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                <XAxis type="number" tickFormatter={(v) => fmt(v)} stroke="var(--foreground-muted)" fontSize={11} />
                <YAxis type="category" dataKey="sectorShort" width={118} tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" />
                <Tooltip formatter={(v) => [`${fmt(Number(v), 2)} Mt`, "Financed Scope 3"]} />
                <Bar dataKey="mt" name="Mt CO₂e" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </BankChartBox>
        </Scope3Panel>

        <Scope3Panel className="!p-4">
          <Scope3SectionLabel
            title="Top financed sectors — gas species mix (pie)"
            description="Slices sum illustrative CO₂, CH₄, N₂O, HFCs, and other CO₂e across the same top ten sectors by attributed emissions (combined book slice)."
          />
          <div className="mt-4 flex h-[min(420px,52vh)] w-full min-h-[280px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm ring-1 ring-slate-900/[0.04] sm:p-4 dark:ring-white/[0.06]">
            {chartsReady && topTenGasMixPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
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
              </ResponsiveContainer>
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
              description="Approved factors for financed emissions modelling — version, PCAF option, and last QA date."
            />
          </div>
          <div className={bankTableShell}>
            <table className={`min-w-[880px] ${bankTable}`}>
              <thead>
                <tr>
                  {["ID", "Sector", "Source", "Factor (kg CO₂e)", "Unit", "Vintage", "PCAF", "Last reviewed"].map((h) => (
                    <th key={h} className={bankTh}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ghg.emissionFactorRegister.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--muted)]/30">
                    <td className={`${bankTd} font-mono text-xs`}>{r.id}</td>
                    <td className={`${bankTd} font-medium`}>{r.sector}</td>
                    <td className={`max-w-[280px] ${bankTd} text-[var(--foreground-muted)]`}>{r.source}</td>
                    <td className={`${bankTd} font-mono text-xs`}>{r.factorKgCO2ePerUnit}</td>
                    <td className={`${bankTd} text-xs`}>{r.unit}</td>
                    <td className={`${bankTd} font-mono text-xs`}>{r.vintage}</td>
                    <td className={`${bankTd} text-xs`}>{r.pcafOption}</td>
                    <td className={`${bankTd} font-mono text-xs`}>{r.lastReviewed}</td>
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
            title="Top obligors — same species profile (tCO₂e)"
            description="Illustrative gas allocation on attributed financed emissions for the heaviest obligors; open a row to jump into the Sectors company drill-down."
          />
          <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--muted)]/30 text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Obligor</th>
                  <th className="px-3 py-2 font-semibold">Sector</th>
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
                {inv.borrowerSlices.map((row) => {
                  const sum = GAS_ORDER.reduce((a, g) => a + (row.tCO2eByGas[g] ?? 0), 0);
                  return (
                    <tr key={row.borrowerId} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-3 py-2 font-medium text-[var(--foreground)]">{row.borrowerName}</td>
                      <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{row.sector}</td>
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
                          onClick={() => onOpenBorrower(row.borrowerId)}
                        >
                          Borrower record
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
          Detailed obligor gas allocation is hidden in the Board lens — use Sectors or Financed emissions for board-ready views.
        </p>
      )}

      <section>
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel
            title="Sector detail panel"
            description="Drivers, MRV posture, and next actions for disclosure and engagement."
            action={
              <label className="flex min-w-[200px] flex-col gap-1 text-xs text-[var(--foreground-muted)]">
                Sector
                <select className={scope3SelectClass} value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
                  {ghg.sectorTracker.map((s) => (
                    <option key={s.sector} value={s.sector}>
                      {s.sector}
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
                <div className="text-[11px] font-bold uppercase text-[var(--foreground-muted)]">Total financed Scope 3</div>
                <div className="font-mono text-lg font-semibold text-[var(--foreground)]">{fmt(detail.totalFinancedTCO2e)} tCO₂e</div>
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
            <p className="mt-6 text-sm text-[var(--foreground-muted)]">No detail block for this sector in mock data.</p>
          )}
        </Scope3Panel>
      </section>

      <section>
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel
            title="GHG / Scope 3 intensity trend"
            description="Financed Scope 3 intensity vs all-scope intensity (₹ cr exposure basis) and internal portfolio benchmark corridor."
          />
          <BankChartBox heightClass="h-72">
            <ResponsiveContainer width="100%" height="100%">
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
                <Line type="linear" dataKey="scope3IntensityPerCr" name="Scope 3 financed / ₹ cr" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                <Line
                  type="linear"
                  dataKey="allScopesIntensityPerCr"
                  name="All scopes (financed proxy) / ₹ cr"
                  stroke="var(--foreground-muted)"
                  strokeDasharray="5 4"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="linear"
                  dataKey="portfolioBenchmark"
                  name="Internal benchmark"
                  stroke="var(--success)"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </BankChartBox>
        </Scope3Panel>
      </section>

      <Scope3DrilldownDrawer
        open={gasDrill != null}
        onClose={() => setGasDrill(null)}
        size="lg"
        title={drillSpecies ? `${drillSpecies.formula} — ${drillSpecies.label}` : ""}
        subtitle={drillSpecies ? `${fmtTCO2e(drillSpecies.tCO2e)} · ${drillSpecies.pctOfScope3.toFixed(2)}% of financed Scope 3 (tracker)` : undefined}
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
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Where this gas sits in financed sectors</h3>
              <ol className="mt-3 space-y-2">
                {categoryRowsForGas.slice(0, 12).map((r) => (
                  <li key={r.sector}>
                    <button
                      type="button"
                      className="flex w-full flex-wrap items-baseline justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2 text-left hover:bg-[var(--muted)]/40"
                      onClick={() => {
                        onSelectSector(r.sector);
                        setSelectedSector(r.sector);
                        setGasDrill(null);
                      }}
                    >
                      <span className="font-medium text-[var(--foreground)]">{r.sector}</span>
                      <span className="tabular-nums text-[var(--foreground-muted)]">{fmtTCO2e(r.t)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>

            {!board && borrowerRowsForGas.length > 0 ? (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Top obligors for this species</h3>
                <ul className="mt-3 space-y-2">
                  {borrowerRowsForGas.map((r) => (
                    <li key={r.borrowerId}>
                      <button
                        type="button"
                        className="flex w-full items-baseline justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-left hover:bg-[var(--muted)]/25"
                        onClick={() => {
                          onOpenBorrower(r.borrowerId);
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
                              {ins ? `AI: ${ins.title.slice(0, 40)}…` : rid}
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

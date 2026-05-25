"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Link2, Microscope } from "lucide-react";
import type { GhgGasCode, GhgGasSpeciesRollup, PersonaId, Scope3MockData } from "./types";
import { isBoardHighLevel } from "./personaAccess";
import { Scope3KpiStrip, autoKpiToneAt } from "../scope3-kpi";
import { Scope3DrilldownDrawer, Scope3SectionLabel } from "./scope3-ui";

const GAS_ORDER: GhgGasCode[] = ["CO2", "CH4", "N2O", "HFCS", "OTHER"];

const GAS_STACK_COLORS: Record<GhgGasCode, string> = {
  CO2: "#64748b",
  CH4: "#ea580c",
  N2O: "#7c3aed",
  HFCS: "#0891b2",
  OTHER: "#94a3b8",
};

function fmtTCO2e(n: number): string {
  return `${Math.round(n).toLocaleString("en-IN")} tCO₂e`;
}

function gasLabel(code: GhgGasCode): string {
  if (code === "CO2") return "CO₂";
  if (code === "CH4") return "CH₄";
  if (code === "N2O") return "N₂O";
  if (code === "HFCS") return "HFCs";
  return "Other";
}

export function GHGGasesView({
  data,
  persona,
  canOpenAiInsights,
  onSelectCategory,
  onOpenSupplier,
  onOpenAiInsight,
}: {
  data: Scope3MockData;
  persona: PersonaId;
  canOpenAiInsights: boolean;
  onSelectCategory: (categoryId: number) => void;
  onOpenSupplier: (supplierId: string) => void;
  onOpenAiInsight: (insightId: string) => void;
}) {
  const board = isBoardHighLevel(persona);
  const inv = data.ghgGasInventory;
  const categoryRollup = useMemo(
    () => data.scope3Categories.reduce((a, c) => a + c.tCO2e, 0),
    [data.scope3Categories],
  );
  const headlineGap =
    Math.round(categoryRollup) !== Math.round(data.executive.totalScope3TCO2e);
  const [gasDrill, setGasDrill] = useState<GhgGasCode | null>(null);
  const [narrativeOpenId, setNarrativeOpenId] = useState<string | null>(null);

  const categoryNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of data.scope3Categories) m.set(c.id, c.name);
    return m;
  }, [data.scope3Categories]);

  const supplierNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of data.suppliers) m.set(s.id, s.name);
    return m;
  }, [data.suppliers]);

  const insightById = useMemo(() => {
    const m = new Map<string, (typeof data.aiInsights)[0]>();
    for (const i of data.aiInsights) m.set(i.id, i);
    for (const i of data.procurementGmInsights) m.set(i.id, i);
    return m;
  }, [data]);

  const chartRows = useMemo(() => {
    const top = [...data.scope3Categories]
      .sort((a, b) => b.tCO2e - a.tCO2e || a.id - b.id)
      .slice(0, 10);
    return top.map((c) => {
      const slice = inv.categorySlices.find((s) => s.scope3CategoryId === c.id);
      const g = slice?.tCO2eByGas ?? { CO2: 0, CH4: 0, N2O: 0, HFCS: 0, OTHER: 0 };
      return {
        key: String(c.id),
        label: `Cat ${c.id}`,
        fullName: c.name,
        categoryId: c.id,
        CO2: g.CO2,
        CH4: g.CH4,
        N2O: g.N2O,
        HFCS: g.HFCS,
        OTHER: g.OTHER,
        total: c.tCO2e,
      };
    });
  }, [data.scope3Categories, inv]);

  const expandedNarrativeId =
    narrativeOpenId != null && inv.narrativeInsights.some((n) => n.id === narrativeOpenId) ? narrativeOpenId : null;

  const speciesMeta = useMemo(() => {
    const m = new Map<GhgGasCode, GhgGasSpeciesRollup>();
    for (const s of inv.speciesRollup) m.set(s.code, s);
    return m;
  }, [inv.speciesRollup]);

  const drillSpecies = gasDrill ? speciesMeta.get(gasDrill) : undefined;

  const categoryRowsForGas = useMemo(() => {
    if (!gasDrill) return [];
    return [...inv.categorySlices]
      .map((row) => ({
        categoryId: row.scope3CategoryId,
        name: categoryNameById.get(row.scope3CategoryId) ?? `Category ${row.scope3CategoryId}`,
        t: row.tCO2eByGas[gasDrill] ?? 0,
      }))
      .filter((r) => r.t > 0)
      .sort((a, b) => b.t - a.t || a.categoryId - b.categoryId);
  }, [gasDrill, inv.categorySlices, categoryNameById]);

  const supplierRowsForGas = useMemo(() => {
    if (!gasDrill) return [];
    return [...inv.supplierSlices]
      .map((row) => ({
        supplierId: row.supplierId,
        name: supplierNameById.get(row.supplierId) ?? row.supplierId,
        t: row.tCO2eByGas[gasDrill] ?? 0,
      }))
      .filter((r) => r.t > 0)
      .sort((a, b) => b.t - a.t || a.name.localeCompare(b.name));
  }, [gasDrill, inv.supplierSlices, supplierNameById]);

  const narrativesForGas = useMemo(() => {
    if (!gasDrill) return [];
    return inv.narrativeInsights.filter((n) => n.gasCodes.includes(gasDrill));
  }, [gasDrill, inv.narrativeInsights]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--primary-muted)]/15 p-4 text-sm leading-relaxed text-[var(--foreground-muted)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.06]">
        <p>
          <span className="font-semibold text-[var(--foreground)]">Inventory bridge — </span>
          {data.inventoryMeta.methodologyVersion} · GWP set: <span className="font-medium text-[var(--foreground)]">{inv.gwpStandardLabel}</span>.
          Species splits roll up to the same Scope 3 category totals as the Category explorer; supplier rows reuse the company species profile for the top ten value-chain contributors (demo consistency).
        </p>
        <p className="mt-2 text-xs">{inv.boundaryNote}</p>
        {headlineGap ? (
          <p className="mt-2 rounded-md border border-[var(--warning)]/40 bg-[var(--warning-bg)]/30 p-2 text-xs text-[var(--foreground)]">
            <span className="font-semibold">Reconciliation note: </span>
            Category worksheet roll-up is {fmtTCO2e(categoryRollup)} while the executive headline Scope 3 KPI is{" "}
            {fmtTCO2e(data.executive.totalScope3TCO2e)}. This gas view is anchored to category lines so stacked bars and species totals stay internally consistent.
          </p>
        ) : null}
      </div>

      <Scope3KpiStrip
        items={inv.speciesRollup.map((s, i) => ({
          label: s.formula,
          value: fmtTCO2e(s.tCO2e),
          sub: `${s.pctOfScope3.toFixed(2)}% of Scope 3 · Drill down →`,
          accentColor: GAS_STACK_COLORS[s.code],
          tone: autoKpiToneAt(i),
          onClick: () => setGasDrill(s.code),
        }))}
      />

      <div>
        <Scope3SectionLabel
          title="Top categories — stacked species (tCO₂e)"
          description="Each bar is the same category total as elsewhere in this workspace; colour segments show how much of that category is expressed as each gas species on a CO₂e basis."
        />
        <div className="mt-4 h-[min(420px,52vh)] w-full min-h-[280px] rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)] ring-1 ring-slate-900/[0.04] sm:p-4 dark:ring-white/[0.06]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }} stackOffset="none">
              <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-[11px]" stroke="var(--foreground-muted)" />
              <YAxis
                type="category"
                dataKey="label"
                width={72}
                tick={{ fontSize: 11 }}
                stroke="var(--foreground-muted)"
                tickFormatter={(v) => String(v)}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const row = payload[0]?.payload as (typeof chartRows)[0];
                  return (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
                      <div className="font-semibold text-[var(--foreground)]">{row.fullName}</div>
                      <div className="mt-1 text-[var(--foreground-muted)]">Cat {row.categoryId}</div>
                      <div className="mt-2 space-y-1 tabular-nums text-[var(--foreground)]">
                        {GAS_ORDER.map((g) => (
                          <div key={g} className="flex justify-between gap-6">
                            <span style={{ color: GAS_STACK_COLORS[g] }}>{gasLabel(g)}</span>
                            <span>{fmtTCO2e(row[g])}</span>
                          </div>
                        ))}
                        <div className="mt-1 flex justify-between border-t border-[var(--border)] pt-1 font-semibold">
                          <span>Total</span>
                          <span>{fmtTCO2e(row.total)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {GAS_ORDER.map((g) => (
                <Bar key={g} dataKey={g} name={gasLabel(g)} stackId="gases" fill={GAS_STACK_COLORS[g]} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <Scope3SectionLabel
          title="Cross-linked insights"
          description="Each narrative stitches together gas drivers, Scope 3 categories, and the AI triage queue — jump to categories, suppliers, or (where your persona allows) the exact insight card."
        />
        <ul className="mt-4 space-y-3">
          {inv.narrativeInsights.map((n) => {
            const open = expandedNarrativeId === n.id;
            return (
              <li key={n.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
                <div className="flex items-start gap-3 p-4">
                  <Microscope className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      className="w-full text-left transition-colors hover:opacity-90"
                      onClick={() => setNarrativeOpenId(open ? null : n.id)}
                    >
                      <div className="text-sm font-semibold text-[var(--foreground)]">{n.headline}</div>
                      {!open ? (
                        <p className="mt-2 text-xs text-[var(--foreground-muted)]">{`${n.body.slice(0, 140)}…`}</p>
                      ) : null}
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {n.gasCodes.map((g) => (
                        <button
                          key={g}
                          type="button"
                          className="rounded-full border border-[var(--border)] bg-[var(--muted)]/30 px-2 py-0.5 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--primary-muted)]/40"
                          onClick={() => setGasDrill(g)}
                        >
                          {gasLabel(g)}
                        </button>
                      ))}
                      {n.scope3CategoryIds.map((cid) => (
                        <span key={cid} className="rounded-full bg-[var(--muted)]/40 px-2 py-0.5 text-[11px] text-[var(--foreground-muted)]">
                          Cat {cid}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold text-[var(--primary)] hover:bg-[var(--muted)]/40"
                    onClick={() => setNarrativeOpenId(open ? null : n.id)}
                  >
                    {open ? "Hide" : "Expand"}
                  </button>
                </div>
                {open ? (
                  <div className="border-t border-[var(--border)] bg-[var(--muted)]/15 px-4 py-4">
                    <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">{n.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {n.scope3CategoryIds.map((cid) => (
                        <button
                          key={cid}
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
                          onClick={() => onSelectCategory(cid)}
                        >
                          Open category {cid}
                          <ArrowRight className="h-3 w-3" aria-hidden />
                        </button>
                      ))}
                      {n.relatedInsightIds.map((rid) => {
                        const ins = insightById.get(rid);
                        return (
                          <button
                            key={rid}
                            type="button"
                            disabled={!canOpenAiInsights}
                            title={!canOpenAiInsights ? "AI insights are not enabled for this persona" : ins?.title ?? rid}
                            className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-45"
                            onClick={() => canOpenAiInsights && onOpenAiInsight(rid)}
                          >
                            <Link2 className="h-3 w-3" aria-hidden />
                            {ins ? ins.title.slice(0, 48) + (ins.title.length > 48 ? "…" : "") : rid}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {!board ? (
        <div>
          <Scope3SectionLabel
            title="Top suppliers — same species profile (tCO₂e)"
            description="Demonstrates how the company-level gas mix propagates to the heaviest value-chain contributors; open a row to jump into supplier governance."
          />
          <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--muted)]/30 text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Supplier</th>
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
                  const name = supplierNameById.get(row.supplierId) ?? row.supplierId;
                  const sum = GAS_ORDER.reduce((a, g) => a + (row.tCO2eByGas[g] ?? 0), 0);
                  return (
                    <tr key={row.supplierId} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-3 py-2 font-medium text-[var(--foreground)]">{name}</td>
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
        </div>
      ) : (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-4 text-sm leading-relaxed text-[var(--foreground-muted)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]">
          Detailed supplier gas allocation is hidden in the Board / CXO lens — use Categories or Reports for board-ready exports.
        </p>
      )}

      <Scope3DrilldownDrawer
        open={gasDrill != null}
        onClose={() => setGasDrill(null)}
        size="lg"
        title={drillSpecies ? `${drillSpecies.formula} — ${drillSpecies.label}` : ""}
        subtitle={drillSpecies ? `${fmtTCO2e(drillSpecies.tCO2e)} · ${drillSpecies.pctOfScope3.toFixed(2)}% of Scope 3` : undefined}
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
                  <li key={r.categoryId}>
                    <button
                      type="button"
                      className="flex w-full flex-wrap items-baseline justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2 text-left hover:bg-[var(--muted)]/40"
                      onClick={() => {
                        onSelectCategory(r.categoryId);
                        setGasDrill(null);
                      }}
                    >
                      <span className="font-medium text-[var(--foreground)]">
                        Cat {r.categoryId} — {r.name}
                      </span>
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

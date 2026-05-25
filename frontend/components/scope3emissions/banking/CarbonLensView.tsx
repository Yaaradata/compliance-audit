"use client";

import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BankPersonaId, BankScope3MockData, CarbonLensLeafId, CarbonLensLineItem } from "./types";
import { Scope3KpiStrip, autoKpiToneAt } from "../scope3-kpi";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import { CARBON_LENS_NAV, groupForCarbonLensLeaf } from "./carbonLensNav";
import { buildAssetClassDrill } from "./carbon-lens-drills";
import { CarbonLensDrillBody, type CarbonLensDrill } from "./CarbonLensDrillBody";
import { bankBackButton } from "./banking-ui";

const CL_DRILL_BTN =
  "whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-semibold text-[var(--primary)] hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2";

function pcafColor(score: number): string {
  if (score <= 2.5) return "var(--success)";
  if (score <= 3.5) return "var(--warning)";
  return "var(--danger)";
}

function riskColor(r?: CarbonLensLineItem["risk"]): string {
  if (r === "High") return "var(--danger)";
  if (r === "Medium") return "var(--warning)";
  return "var(--success)";
}

export function CarbonLensView({
  data,
  persona,
  leaf,
  allowedLeaves,
  onOpenFullFinanced,
  onBack,
}: {
  data: BankScope3MockData;
  persona: BankPersonaId;
  leaf: CarbonLensLeafId;
  allowedLeaves: CarbonLensLeafId[];
  onOpenFullFinanced?: () => void;
  onBack?: () => void;
}) {
  const [drill, setDrill] = useState<CarbonLensDrill | null>(null);

  const openLineDrill = (row: CarbonLensLineItem) => {
    setDrill({ kind: "line", title: row.label, subtitle: row.sublabel, item: row });
  };
  /** Honour the tile the user chose; persona filtering applies to portfolio rows, not navigation. */
  const effectiveLeaf = leaf;

  const group = groupForCarbonLensLeaf(effectiveLeaf);
  const intro = data.carbonLens.portfolioIntro;

  const barFromAssets = useMemo(() => {
    const ids = data.carbonLens.financed.portfolio_overview.assetClassIds;
    return data.financedAssetClasses
      .filter((a) => ids.includes(a.id))
      .map((a) => ({
        name: a.name.length > 22 ? `${a.name.slice(0, 20)}…` : a.name,
        mt: a.attributedTCO2e / 1_000_000,
        score: a.pcafScore,
        id: a.id,
      }));
  }, [data.financedAssetClasses, data.carbonLens.financed.portfolio_overview.assetClassIds]);

  const slice = useMemo(() => {
    if (effectiveLeaf in data.carbonLens.financed) {
      return { kind: "financed" as const, data: data.carbonLens.financed[effectiveLeaf as keyof typeof data.carbonLens.financed] };
    }
    if (effectiveLeaf in data.carbonLens.ownOperations) {
      return { kind: "own" as const, data: data.carbonLens.ownOperations[effectiveLeaf as keyof typeof data.carbonLens.ownOperations] };
    }
    if (effectiveLeaf in data.carbonLens.green) {
      return { kind: "green" as const, data: data.carbonLens.green[effectiveLeaf as keyof typeof data.carbonLens.green] };
    }
    return { kind: "climate" as const, data: data.carbonLens.climate[effectiveLeaf as keyof typeof data.carbonLens.climate] };
  }, [data.carbonLens, effectiveLeaf]);

  const breadcrumb = CARBON_LENS_NAV.find((g) => g.children.some((c) => c.id === effectiveLeaf))?.label ?? "Carbon Lens";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-6">
        <div className="min-w-0 flex-1">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className={`${bankBackButton} mb-3`}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Back to tiles
            </button>
          ) : null}
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Carbon Lens</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {breadcrumb} · <span className="font-medium text-[var(--foreground)]">{slice.data.title}</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] lg:text-[1.65rem]">{slice.data.title}</h1>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[var(--foreground-muted)]">{slice.data.narrative}</p>
        </div>
        {onOpenFullFinanced && group === "financed" ? (
          <button
            type="button"
            onClick={onOpenFullFinanced}
            className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/50"
          >
            Open legacy financed explorer
          </button>
        ) : null}
      </div>

      {effectiveLeaf === "portfolio_overview" ? (
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel title="Executive context" description={intro} />
          <div className="mt-4 h-[300px] w-full min-w-0 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barFromAssets} margin={{ left: 4, right: 8, top: 8, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70} tick={{ fontSize: 9 }} stroke="var(--foreground-muted)" />
                <YAxis tickFormatter={(v) => `${v}`} stroke="var(--foreground-muted)" fontSize={11} label={{ value: "Mt CO₂e", angle: -90, position: "insideLeft", fill: "var(--foreground-muted)", fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${typeof v === "number" ? v.toFixed(2) : v} Mt`, "Attributed"]} />
                              <Bar
                  dataKey="mt"
                  name="Attributed"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(bar) => {
                    const point = (bar as { payload?: { id?: string } })?.payload;
                    if (!point?.id) return;
                    const ac = data.financedAssetClasses.find((a) => a.id === point.id);
                    if (!ac) return;
                    setDrill({
                      kind: "asset",
                      title: ac.name,
                      drill: buildAssetClassDrill(ac),
                    });
                  }}
                >
                  {barFromAssets.map((e, i) => (
                    <Cell key={i} fill={pcafColor(e.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-[var(--foreground-subtle)]">Bar colour = PCAF quality band. Click a bar for asset-class drill-down.</p>
        </Scope3Panel>
      ) : null}

      {"methodology" in slice.data && slice.kind === "financed" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Scope3Panel className="!p-4 lg:col-span-2">
            <Scope3SectionLabel title="Methodology & PCAF" description={slice.data.methodology} />
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              <strong className="text-[var(--foreground)]">PCAF band:</strong> {slice.data.pcafBand}
            </p>
          </Scope3Panel>
          <Scope3Panel className="!p-4">
            <Scope3SectionLabel title="Persona" description="Access is scoped by persona — sub-views appear as tiles under each Carbon Lens pillar." />
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">Active persona: {persona}</p>
          </Scope3Panel>
        </div>
      ) : null}

      {slice.kind === "own" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Scope3Panel className="!p-4">
            <Scope3SectionLabel title="GHG Protocol mapping" description={slice.data.scope3CategoryLabel} />
            <dl className="mt-3 space-y-2 text-sm text-[var(--foreground-muted)]">
              <div className="flex justify-between gap-2">
                <dt>Methodology</dt>
                <dd className="max-w-[65%] text-right text-[var(--foreground)]">{slice.data.methodology}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Data quality</dt>
                <dd className="text-[var(--foreground)]">{slice.data.dataQuality}</dd>
              </div>
              {slice.data.spendOrActivityINRCr != null ? (
                <div className="flex justify-between gap-2">
                  <dt>Spend / activity</dt>
                  <dd className="font-mono text-[var(--foreground)]">₹{slice.data.spendOrActivityINRCr.toLocaleString("en-IN")} cr</dd>
                </div>
              ) : null}
            </dl>
          </Scope3Panel>
          <Scope3Panel className="!p-4">
            <Scope3SectionLabel title="Operational notes" />
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">{slice.data.notes}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-[var(--foreground-muted)]">tCO₂e</dt>
                <dd className="font-mono font-semibold text-[var(--foreground)]">{slice.data.tCO2e.toLocaleString("en-IN")}</dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-muted)]">% non-financed Scope 3</dt>
                <dd className="font-mono font-semibold text-[var(--foreground)]">{slice.data.pctOfScope12And3NonFinanced}%</dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-muted)]">YoY</dt>
                <dd className={`font-mono font-semibold ${slice.data.yoyPct <= 0 ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>
                  {slice.data.yoyPct > 0 ? "+" : ""}
                  {slice.data.yoyPct}%
                </dd>
              </div>
            </dl>
          </Scope3Panel>
        </div>
      ) : null}

      {"complianceNote" in slice.data ? (
        <Scope3Panel className="border-l-4 border-l-[var(--primary)] !p-4">
          <div className="text-xs font-semibold text-[var(--foreground)]">Compliance & disclosure</div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{slice.data.complianceNote}</p>
        </Scope3Panel>
      ) : null}

      {"regulatoryRef" in slice.data ? (
        <Scope3Panel className="!p-4">
          <div className="text-xs font-semibold text-[var(--foreground)]">Regulatory reference</div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{slice.data.regulatoryRef}</p>
        </Scope3Panel>
      ) : null}

      <section>
        <Scope3SectionLabel title="Key metrics" description="Snapshot KPIs for this Carbon Lens slice (mock FY24–25)." />
        <div className="mt-4">
          <Scope3KpiStrip
            cols="sm:grid-cols-2 xl:grid-cols-4"
            items={slice.data.kpis.map((k, i) => ({
              label: k.label,
              value: k.value,
              sub: k.hint,
              tone: autoKpiToneAt(i),
            }))}
          />
        </div>
      </section>

      <section>
        <Scope3SectionLabel title="Drill-down register" description="Click a row for evidence, drivers, and recommended actions." />
        <Scope3Panel className="overflow-x-auto !p-0">
          <table className="min-w-[880px] w-full border-collapse text-sm">
            <thead className="bg-[var(--muted)]/50 text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Item</th>
                <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Metric 1</th>
                <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Metric 2</th>
                <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Metric 3</th>
                <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Risk</th>
                <th className="border-b border-[var(--border)] px-3 py-2 font-semibold text-right">Drill-down</th>
              </tr>
            </thead>
            <tbody>
              {slice.data.lineItems.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--muted)]/40"
                  onClick={() => openLineDrill(row)}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-[var(--foreground)]">{row.label}</div>
                    {row.sublabel ? <div className="text-[11px] text-[var(--foreground-muted)]">{row.sublabel}</div> : null}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--foreground)]">{row.metric1}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--foreground-muted)]">{row.metric2 ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--foreground-muted)]">{row.metric3 ?? "—"}</td>
                  <td className="px-3 py-2">
                    {row.risk ? (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ color: riskColor(row.risk), background: "var(--muted)" }}>
                        {row.risk}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className={CL_DRILL_BTN}
                      onClick={(e) => {
                        e.stopPropagation();
                        openLineDrill(row);
                      }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scope3Panel>
      </section>

      {slice.kind === "financed" && effectiveLeaf !== "portfolio_overview" ? (
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel title="Linked asset-class roll-up" description="Cross-check with master PCAF inventory." />
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground-muted)]">
            {data.financedAssetClasses
              .filter((a) => slice.data.assetClassIds.includes(a.id))
              .map((a) => (
                <li key={a.id}>
                  <strong className="text-[var(--foreground)]">{a.name}</strong> — ₹{a.outstandingINRCr.toLocaleString("en-IN")} cr outstanding · {(a.attributedTCO2e / 1e6).toFixed(2)} Mt · PCAF {a.pcafScore}
                </li>
              ))}
          </ul>
        </Scope3Panel>
      ) : null}

      {effectiveLeaf === "climate_stress_testing" ? (
        <Scope3Panel className="!p-4">
          <Scope3SectionLabel title="Linked scenarios (bank-wide)" description="Same figures as Climate Risk module — RBI-style narrative." />
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {data.scenarioRows.map((s) => (
              <div key={s.scenario} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
                <div className="font-semibold text-[var(--foreground)]">{s.scenario}</div>
                <div className="mt-2 text-[var(--foreground-muted)]">
                  Loan-at-risk ₹{s.loanAtRiskINRCr.toLocaleString("en-IN")} cr · NPA +{s.npaDeltaPct}% · CET1 {s.cet1ImpactBps} bps
                </div>
              </div>
            ))}
          </div>
        </Scope3Panel>
      ) : null}

      <Scope3DrilldownDrawer
        open={drill != null}
        title={drill?.title ?? ""}
        subtitle={drill?.kind === "line" ? drill.subtitle : drill?.kind === "asset" ? "Asset-class PCAF sleeve" : undefined}
        onClose={() => setDrill(null)}
        size="lg"
        footer={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white">
              Add to engagement plan
            </button>
            <button type="button" className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">
              Export line evidence
            </button>
          </div>
        }
      >
        {drill ? <CarbonLensDrillBody drill={drill} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

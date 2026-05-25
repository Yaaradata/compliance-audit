"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel, scope3SelectClass } from "../Pharma/scope3-ui";
import { ValueChainDrillBody, type VcDrill } from "./ValueChainDrillBody";
import { ValueChainHero } from "./ValueChainHero";
import {
  AutoChartBox,
  autoCallout,
  autoPage,
  autoSegmentGroup,
  autoSegmentTabButtonProps,
  autoTable,
  autoTableShell,
  autoTd,
  autoTh,
} from "./automotive-ui";
import type { AutomotiveScope3MockData } from "./types";
import type { ValueChainMockData, ValueChainSectorPoint } from "./value-chain-types";
import { valueChainMockData } from "./value-chain-mock-data";

const VC_DRILL_BTN =
  "whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-semibold text-[var(--primary)] hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]";

function fmtIN(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function dqBadgeClass(score: number): string {
  if (score <= 2) return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200";
  if (score <= 3) return "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200";
  return "bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200";
}

function dqChartFill(score: number): string {
  if (score <= 2) return "var(--success)";
  if (score <= 3) return "var(--warning)";
  return "var(--danger)";
}

function moneyToneBorder(tone: "green" | "amber" | "red"): string {
  if (tone === "green") return "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20";
  if (tone === "amber") return "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20";
  return "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20";
}

function moneyToneText(tone: "green" | "amber" | "red"): string {
  if (tone === "green") return "text-emerald-800 dark:text-emerald-200";
  if (tone === "amber") return "text-amber-800 dark:text-amber-200";
  return "text-rose-800 dark:text-rose-200";
}

function quadrantLabel(
  q: ValueChainSectorPoint["quadrant"],
  labels: { key: ValueChainSectorPoint["quadrant"]; title: string; subtitle: string }[],
): string {
  const row = labels.find((l) => l.key === q);
  return row ? `${row.title} — ${row.subtitle}` : q;
}

const VC_VIZ_CARD =
  "flex min-h-0 min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05] sm:p-4";

const VC_SECTION_PAD = "px-5 py-5 sm:px-6";
const VC_HEADER_PAD = "px-5 py-4 sm:px-6";

type ValueChainSection = "overview" | "upstream" | "downstream" | "trend";

const VALUE_CHAIN_SECTIONS: { id: ValueChainSection; label: string; sub: string }[] = [
  { id: "overview", label: "Overview", sub: "Upstream vs downstream mix" },
  { id: "upstream", label: "Upstream", sub: "Supply chain & Cat 1–8" },
  { id: "downstream", label: "Downstream", sub: "Use phase & fleet" },
  { id: "trend", label: "Upstream/Downstream Trend", sub: "FY trajectory" },
];

function ValueChainViewLoaded({ legalName, valueChain: vc }: { legalName: string; valueChain: ValueChainMockData }) {
  const [section, setSection] = useState<ValueChainSection>("overview");
  const [selectedModel, setSelectedModel] = useState(() => vc.downstream.models[0]?.id ?? "");
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [vcDrill, setVcDrill] = useState<VcDrill | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const model = vc.downstream.models.find((b) => b.id === selectedModel) ?? vc.downstream.models[0];

  const trendChartData = useMemo(
    () =>
      vc.trend.points.map((p) => ({
        fy: p.fy,
        downstreamActual: p.downstreamActual,
        downstreamTarget: p.downstreamTarget,
        upstreamActual: p.upstreamActual,
        upstreamTarget: p.upstreamTarget,
      })),
    [vc.trend.points],
  );

  const sectorsSorted = useMemo(
    () => [...vc.downstream.sectorPoints].sort((a, b) => b.volumeUnits - a.volumeUnits),
    [vc.downstream.sectorPoints],
  );

  const upstreamCategoryChart = useMemo(
    () =>
      vc.upstream.categories.map((c) => ({
        label: c.label.replace(/^Cat \d+: /, ""),
        tco2e: c.tco2e,
      })),
    [vc.upstream.categories],
  );

  const scope3SharePie = useMemo(
    () => [
      { name: `Upstream (${vc.hero.upstreamPctScope3}%)`, value: vc.hero.upstreamPctScope3, fill: "var(--primary)" },
      { name: `Downstream (${vc.hero.downstreamPctScope3}%)`, value: vc.hero.downstreamPctScope3, fill: "var(--danger)" },
    ],
    [vc.hero.downstreamPctScope3, vc.hero.upstreamPctScope3],
  );

  const insideOutsideMass = useMemo(
    () => [
      { key: "in", name: "Upstream (supply chain)", t: vc.hero.upstreamTCO2e },
      { key: "out", name: "Downstream (use phase)", t: vc.hero.downstreamTCO2e },
    ],
    [vc.hero.upstreamTCO2e, vc.hero.downstreamTCO2e],
  );

  const moneyFlowStackRow = useMemo(() => {
    const row: Record<string, string | number> = { name: "FY25 production" };
    for (const s of vc.downstream.segments) row[s.id] = s.unitsProduced;
    return [row];
  }, [vc.downstream.segments]);

  const sleeveExposureRow = useMemo(
    () => [
      {
        name: "Powertrain mix",
        green: vc.downstream.evGrowing.tco2e, brown: vc.downstream.iceDominant.tco2e, neutral: vc.downstream.hybridBridge.tco2e,
      },
    ],
    [vc.downstream.evGrowing.tco2e, vc.downstream.iceDominant.tco2e, vc.downstream.hybridBridge.tco2e],
  );

  return (
    <div className={`${autoPage} mx-auto w-full max-w-[1280px]`}>
      <div className={`${autoSegmentGroup} w-full max-w-none`} role="tablist" aria-label="Value chain sections">
        {VALUE_CHAIN_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={section === s.id}
            title={s.sub}
            onClick={() => setSection(s.id)}
            {...autoSegmentTabButtonProps(section === s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "overview" ? (
        <section id="vc-overview">
          <Scope3Panel className="!p-0 overflow-hidden">
            <ValueChainHero legalName={legalName} hero={vc.hero} />
            {chartsReady ? (
              <div className={`grid items-stretch gap-6 border-t border-[var(--border)] bg-[var(--muted)]/20 sm:grid-cols-2 ${VC_SECTION_PAD}`}>
                <div className={VC_VIZ_CARD}>
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Scope 3 mix (share)</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
                    Upstream vs downstream as % of total OEM-reported Scope 3 (mock).
                  </p>
                  <div className="mt-3 min-h-[220px] flex-1">
                    <AutoChartBox heightClass="h-[220px] min-h-[200px]">
<PieChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                          <Pie
                            data={scope3SharePie}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="46%"
                            innerRadius="52%"
                            outerRadius="72%"
                            paddingAngle={2}
                            label={false}
                          >
                            {scope3SharePie.map((e) => (
                              <Cell key={e.name} fill={e.fill} stroke="var(--card)" strokeWidth={1} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => {
                              if (value == null) return ["—", "%"];
                              const v = typeof value === "number" ? value : Number(value);
                              return [`${Number.isFinite(v) ? v.toFixed(1) : "—"}%`, "Share"];
                            }}
                            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
                          />
                          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} height={36} />
                        </PieChart>
</AutoChartBox>
                  </div>
                </div>
                <div className={VC_VIZ_CARD}>
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Mass balance (tCO₂e)</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
                    Absolute footprint — downstream use phase dominates upstream supply chain in this OEM inventory.
                  </p>
                  <div className="mt-3 min-h-[220px] flex-1">
                    <AutoChartBox heightClass="h-[220px] min-h-[200px]">
<BarChart data={insideOutsideMass} layout="vertical" margin={{ top: 8, right: 20, left: 4, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" tickFormatter={(v) => fmtIN(Number(v))} />
                          <YAxis type="category" dataKey="name" width={132} tick={{ fontSize: 11 }} stroke="var(--foreground-muted)" />
                          <Tooltip
                            formatter={(v) => [`${fmtIN(Number(v))} tCO₂e`, ""]}
                            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
                          />
                          <Bar dataKey="t" name="tCO₂e" radius={[0, 4, 4, 0]}>
                            {insideOutsideMass.map((row) => (
                              <Cell key={row.key} fill={row.key === "in" ? "var(--primary)" : "var(--danger)"} />
                            ))}
                          </Bar>
                        </BarChart>
</AutoChartBox>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`border-t border-[var(--border)] py-10 text-center text-sm text-[var(--foreground-muted)] ${VC_SECTION_PAD}`}>
                Loading charts…
              </div>
            )}
            <div className={`${autoCallout} !rounded-none !border-x-0 !border-b-0 ${VC_SECTION_PAD}`}>
              <p className="text-sm font-medium text-[var(--foreground)]">{vc.hero.tagline}</p>
            </div>
          </Scope3Panel>
        </section>
      ) : null}

      {section === "upstream" ? (
            <section id="vc-upstream" className="min-w-0">
              <Scope3Panel className="!p-0 min-h-0 min-w-0">
                <div className={`border-b border-[var(--border)] ${VC_HEADER_PAD}`}>
                  <Scope3SectionLabel
                    className="!mb-0"
                    title={vc.upstream.headerTitle}
                    description={`${vc.upstream.sublabel} · ${vc.upstream.pctScope3}% of Scope 3 · ${fmtIN(vc.upstream.totalTCO2e)} tCO₂e attributed in this mock.`}
                  />
                </div>
                <div className={`space-y-6 ${VC_SECTION_PAD}`}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Category breakdown</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
                      Horizontal bars = tCO₂e by Scope 3 category cluster (bank operations). Table lists full labels and flags.
                    </p>
                    {chartsReady ? (
                      <div className={`${VC_VIZ_CARD} mt-3`}>
                        <AutoChartBox heightClass="h-[min(300px,42vh)] min-h-[240px]">
<BarChart data={upstreamCategoryChart} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" tickFormatter={(v) => fmtIN(Number(v))} />
                              <YAxis type="category" dataKey="label" width={168} tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" />
                              <Tooltip
                                formatter={(v) => [`${fmtIN(Number(v))} tCO₂e`, ""]}
                                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
                              />
                              <Bar dataKey="tco2e" name="tCO₂e" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                            </BarChart>
</AutoChartBox>
                      </div>
                    ) : null}
                    <div className={autoTableShell + " mt-4"}>
                      <table className={autoTable}>
                        <thead>
                          <tr>
                            <th className={autoTh}>Category</th>
                            <th className={`${autoTh} text-right`}>tCO₂e</th>
                            <th className={autoTh}>Note</th>
                            <th className={`${autoTh} text-right`}>Drill-down</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vc.upstream.categories.map((c) => (
                            <tr key={c.id} className="last:border-b-0">
                              <td className={autoTd}>{c.label}</td>
                              <td className={`${autoTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(c.tco2e)}</td>
                              <td className={`${autoTd} text-xs text-[var(--foreground-muted)]`}>
                                {c.flagLabel ? (
                                  <span className="font-medium text-amber-800 dark:text-amber-200">{c.flagLabel}</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className={`${autoTd} text-right`}>
                                {c.drill ? (
                                  <button
                                    type="button"
                                    className={VC_DRILL_BTN}
                                    onClick={() => {
                                      const drill = c.drill;
                                      if (!drill) return;
                                      setVcDrill({ kind: "category", title: c.label, drill });
                                    }}
                                  >
                                    Open
                                  </button>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Suppliers (illustrative)</h3>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">{vc.upstream.supplierNote}</p>
                    <div className={autoTableShell + " mt-2"}>
                      <table className={`min-w-[640px] ${autoTable}`}>
                        <thead>
                          <tr>
                            <th className={autoTh}>Supplier</th>
                            <th className={autoTh}>Supply</th>
                            <th className={`${autoTh} text-right`}>Spend ₹ Cr</th>
                            <th className={`${autoTh} text-right`}>tCO₂e</th>
                            <th className={autoTh}>Scope / cat.</th>
                            <th className={`${autoTh} text-right`}>Drill-down</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vc.upstream.suppliers.map((r) => (
                            <tr key={r.supplier + r.supply} className="last:border-b-0">
                              <td className={`${autoTd} font-medium`}>{r.supplier}</td>
                              <td className={`${autoTd} text-xs text-[var(--foreground-muted)]`}>{r.supply}</td>
                              <td className={`${autoTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(r.spendCr)}</td>
                              <td className={`${autoTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(r.tco2e)}</td>
                              <td className={`${autoTd} text-xs`}>{r.category}</td>
                              <td className={`${autoTd} text-right`}>
                                {r.drill ? (
                                  <button
                                    type="button"
                                    className={VC_DRILL_BTN}
                                    onClick={() => {
                                      const drill = r.drill;
                                      if (!drill) return;
                                      setVcDrill({ kind: "supplier", title: `${r.supplier} — ${r.supply}`, drill });
                                    }}
                                  >
                                    Open
                                  </button>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Supply-chain decarbonisation signals</h3>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-[var(--foreground-muted)]">
                        {vc.upstream.decarbSignals.map((g) => (
                          <li key={g.label}>
                            <span className="font-semibold text-[var(--foreground)]">{g.label}</span> — {g.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">{vc.upstream.supplierTargetProgress.label}</h3>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-[width] dark:bg-emerald-400"
                          style={{ width: `${Math.min(100, vc.upstream.supplierTargetProgress.pctAchieved)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-[var(--foreground-muted)]">{vc.upstream.supplierTargetProgress.pctAchieved}% of internal milestones met (demo).</p>
                    </div>
                  </div>
                </div>
              </Scope3Panel>
            </section>
      ) : null}

      {section === "downstream" ? (
            <section id="vc-downstream" className="min-w-0">
              <Scope3Panel className="!p-0 min-h-0 min-w-0">
                <div className={`border-b border-[var(--border)] ${VC_HEADER_PAD}`}>
                  {true ? (
                    <Scope3SectionLabel
                      className="!mb-0"
                      title={vc.downstream.headerTitle}
                      description={`${vc.downstream.sublabel} · ${vc.downstream.pctScope3}% of Scope 3 · ${fmtIN(vc.downstream.totalTCO2e)} tCO₂e in this mock.`}
                    />
                  ) : (
                    <Scope3SectionLabel
                      className="!mb-0"
                      title="Use-phase emissions — board snapshot"
                      description="Category 15 overview: how green, brown, and neutral sleeves contribute to the use-phase footprint (illustrative)."
                    />
                  )}
                </div>

                <div className={`space-y-6 ${VC_SECTION_PAD}`}>
                  {true ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Production volume by vehicle line</h3>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Stacked bar = FY25 units produced by model line (colour = data-quality score). Table lists tCO₂e and % fleet.
                      </p>
                      {chartsReady ? (
                      <div className={`${VC_VIZ_CARD} mt-3`}>
                        <AutoChartBox heightClass="h-[120px] min-h-[100px]">
<BarChart data={moneyFlowStackRow} layout="vertical" margin={{ left: 108, right: 8, top: 8, bottom: 40 }}>
                              <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" tickFormatter={(v) => fmtIN(Number(v))} />
                              <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" />
                              <Tooltip
                                formatter={(v, name) => [`${fmtIN(Number(v))} units`, String(name)]}
                                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
                              />
                              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                              {vc.downstream.segments.map((s) => (
                                <Bar key={s.id} dataKey={s.id} name={s.label} stackId="book" fill={dqChartFill(s.dataQualityScore)} />
                              ))}
                            </BarChart>
</AutoChartBox>
                      </div>
                    ) : null}
                    <div className={autoTableShell + " mt-4"}>
                        <table className={`min-w-[720px] ${autoTable}`}>
                          <thead>
                            <tr>
                              <th className={autoTh}>Segment</th>
                              <th className={`${autoTh} text-right`}>Units produced</th>
                              <th className={`${autoTh} text-right`}>tCO₂e</th>
                              <th className={`${autoTh} text-right`}>% fleet</th>
                              <th className={`${autoTh} text-center`}>DQ</th>
                              <th className={`${autoTh} text-right`}>Drill-down</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vc.downstream.segments.map((s) => (
                              <tr key={s.id} className="last:border-b-0">
                                <td className={`${autoTd} font-medium`}>{s.label}</td>
                                <td className={`${autoTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(s.unitsProduced)}</td>
                                <td className={`${autoTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(s.tco2e)}</td>
                                <td className={`${autoTd} text-right tabular-nums`}>{s.pctFleet}%</td>
                                <td className={`${autoTd} text-center`}>
                                  <span className={`inline-block min-w-[2rem] rounded-md px-2 py-0.5 text-xs font-bold ${dqBadgeClass(s.dataQualityScore)}`}>
                                    {s.dataQualityScore}
                                  </span>
                                </td>
                                <td className={`${autoTd} text-right`}>
                                  {s.drill ? (
                                    <button
                                      type="button"
                                      className={VC_DRILL_BTN}
                                      onClick={() => {
                                        const drill = s.drill;
                                        if (!drill) return;
                                        setVcDrill({ kind: "segment", title: s.label, drill });
                                      }}
                                    >
                                      Open
                                    </button>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}

                  {true ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Market lens (volume × intensity)</h3>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Bubble chart: X = ₹ Cr exposure, Y = tCO₂e per ₹ Cr, size ≈ model count. Colour follows mock quadrant coding; keys below match the sector table.
                      </p>
                      {chartsReady ? (
                        <div className={`${VC_VIZ_CARD} mt-3`}>
                          <AutoChartBox heightClass="h-[min(360px,44vh)] min-h-[280px]">
<ScatterChart margin={{ top: 16, right: 20, bottom: 28, left: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                                <XAxis
                                  type="number"
                                  dataKey="volumeUnits"
                                  name="Volume"
                                  tick={{ fontSize: 10 }}
                                  stroke="var(--foreground-muted)"
                                  label={{ value: "Volume (units)", position: "bottom", offset: 12, fill: "var(--foreground-muted)", fontSize: 11 }}
                                />
                                <YAxis
                                  type="number"
                                  dataKey="intensityPerVehicle"
                                  name="Intensity"
                                  tick={{ fontSize: 10 }}
                                  stroke="var(--foreground-muted)"
                                  label={{ value: "Intensity (tCO₂e / vehicle)", angle: -90, position: "insideLeft", fill: "var(--foreground-muted)", fontSize: 11 }}
                                />
                                <ZAxis type="number" dataKey="models" range={[56, 220]} />
                                <Tooltip
                                  cursor={{ strokeDasharray: "3 3" }}
                                  formatter={(value, name) => [fmtIN(Number(value)), String(name)]}
                                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
                                  labelFormatter={(_, payload) => {
                                    const p = payload?.[0]?.payload as (typeof vc.downstream.sectorPoints)[0] | undefined;
                                    return p?.sector ?? "";
                                  }}
                                />
                                <Scatter
                                  name="Sectors"
                                  data={vc.downstream.sectorPoints}
                                  fill="var(--primary)"
                                  shape={(props: { cx?: number; cy?: number; payload?: (typeof vc.downstream.sectorPoints)[0] }) => {
                                    const { cx = 0, cy = 0, payload } = props;
                                    const r = 10 + Math.min(22, Math.cbrt(payload?.models ?? 1) * 3.2);
                                    return (
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r={r}
                                        fill={payload?.fill ?? "var(--primary)"}
                                        stroke="var(--card)"
                                        strokeWidth={1}
                                        opacity={0.9}
                                        onMouseEnter={() => payload?.sector && setHoveredSector(payload.sector)}
                                        onMouseLeave={() => setHoveredSector(null)}
                                        style={{ cursor: "pointer" }}
                                      />
                                    );
                                  }}
                                />
                              </ScatterChart>
</AutoChartBox>
                        </div>
                      ) : null}
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {vc.downstream.quadrantLabels.map((q) => (
                          <div key={q.key} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-[11px] leading-snug text-[var(--foreground-muted)]">
                            <span className="font-mono font-bold text-[var(--foreground)]">{q.key}</span>
                            <span className="mx-1.5 text-[var(--border-strong)]">·</span>
                            <span className="font-semibold text-[var(--foreground)]">{q.title}</span>
                            <span className="mt-0.5 block text-[var(--foreground-muted)]">{q.subtitle}</span>
                          </div>
                        ))}
                      </div>
                      {hoveredSector ? (
                        <p className="mt-2 text-xs font-medium text-[var(--foreground)]">
                          Selected: <span className="text-[var(--primary)]">{hoveredSector}</span>
                        </p>
                      ) : null}
                      <div className={autoTableShell + " mt-3"}>
                        <table className={`min-w-[800px] ${autoTable}`}>
                          <thead>
                            <tr>
                              <th className={autoTh}>Sector</th>
                              <th className={`${autoTh} text-right`}>Units produced</th>
                              <th className={`${autoTh} text-right`}>tCO₂e / vehicle</th>
                              <th className={`${autoTh} text-right`}>Models</th>
                              <th className={autoTh}>Quadrant read</th>
                              <th className={`${autoTh} text-right`}>Drill-down</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sectorsSorted.map((row) => (
                              <tr key={row.sector} className="last:border-b-0">
                                <td className={`${autoTd} font-medium`}>{row.sector}</td>
                                <td className={`${autoTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(row.volumeUnits)}</td>
                                <td className={`${autoTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(row.intensityPerVehicle)}</td>
                                <td className={`${autoTd} text-right tabular-nums`}>{fmtIN(row.models)}</td>
                                <td className={`${autoTd} max-w-[220px] text-xs text-[var(--foreground-muted)]`}>
                                  {quadrantLabel(row.quadrant, vc.downstream.quadrantLabels)}
                                </td>
                                <td className={`${autoTd} text-right`}>
                                  {row.drill ? (
                                    <button
                                      type="button"
                                      className={VC_DRILL_BTN}
                                      onClick={() => {
                                        const drill = row.drill;
                                        if (!drill) return;
                                        setVcDrill({ kind: "sector", title: `${row.sector} sector lens`, drill });
                                      }}
                                    >
                                      Open
                                    </button>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}

                  {model ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">{vc.downstream.attributionBoxTitle}</h3>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">{vc.downstream.attributionIntro}</p>
                      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]" htmlFor="vc-model-select">
                        Example vehicle line
                      </label>
                      <select
                        id="vc-model-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className={`${scope3SelectClass} mt-1.5 w-full sm:max-w-xl`}
                      >
                        {vc.downstream.models.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                          <dt className="text-xs text-[var(--foreground-muted)]">Use-phase inventory (Cat 11)</dt>
                          <dd className="mt-1 font-mono font-semibold tabular-nums">{fmtIN(model.usePhaseTCO2e)} tCO₂e/yr</dd>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                          <dt className="text-xs text-[var(--foreground-muted)]">Units sold FY25</dt>
                          <dd className="mt-1 font-mono font-semibold tabular-nums">{fmtIN(model.unitsSoldFY)}</dd>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                          <dt className="text-xs text-[var(--foreground-muted)]">Lifetime distance</dt>
                          <dd className="mt-1 font-mono font-semibold tabular-nums">{fmtIN(model.lifetimeKm)} km</dd>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                          <dt className="text-xs text-[var(--foreground-muted)]">Grid factor (kg/kWh)</dt>
                          <dd className="mt-1 font-mono font-semibold tabular-nums">{model.gridKgPerKwh}</dd>
                        </div>
                      </dl>
                      <div className="mt-4 rounded-lg border border-[var(--primary)]/25 bg-[var(--primary-muted)]/15 p-3 text-sm">
                        <p>
                          <span className="font-semibold text-[var(--foreground)]">Attributed use-phase emissions: </span>
                          <span className="font-mono font-bold tabular-nums text-[var(--foreground)]">{fmtIN(model.attributedTCO2e)} tCO₂e</span>
                        </p>
                        <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                          DQ score <span className="font-mono font-semibold text-[var(--foreground)]">{model.dataQualityScore}</span> ({model.dataQualityLabel}).
                          Disclosure tie-in: BRSR Principle 6 and product carbon footprint narrative for {vc.hero.companyTicker}.
                        </p>
                        {model.drill ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className={VC_DRILL_BTN}
                              onClick={() => {
                                const drill = model.drill;
                                if (!drill) return;
                                setVcDrill({ kind: "model", title: model.name, drill });
                              }}
                            >
                              Full use-phase drill-down
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {true ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">ICE · BEV · hybrid lifecycle split</h3>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Lifecycle split by powertrain — complements the cards below.
                      </p>
                      {chartsReady ? (
                        <div className={`${VC_VIZ_CARD} mt-3`}>
                          <AutoChartBox heightClass="h-[96px] min-h-[80px]">
<BarChart data={sleeveExposureRow} layout="vertical" margin={{ left: 100, right: 12, top: 8, bottom: 36 }}>
                                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" tickFormatter={(v) => fmtIN(Number(v))} />
                                <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" />
                                <Tooltip formatter={(v) => [`${fmtIN(Number(v))} tCO₂e`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                                <Bar dataKey="green" name="BEV" stackId="s" fill="var(--success)" />
                                <Bar dataKey="brown" name="ICE" stackId="s" fill="var(--danger)" />
                                <Bar dataKey="neutral" name="Hybrid" stackId="s" fill="var(--foreground-muted)" radius={[0, 4, 4, 0]} />
                              </BarChart>
</AutoChartBox>
                        </div>
                      ) : null}
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {[vc.downstream.evGrowing, vc.downstream.iceDominant, vc.downstream.hybridBridge].map((card) => (
                          <div
                            key={card.title}
                            className={`rounded-xl border p-4 ${moneyToneBorder(card.statusTone)}`}
                          >
                            <div className={`text-xs font-bold uppercase tracking-wide ${moneyToneText(card.statusTone)}`}>{card.title}</div>
                            <p className="mt-2 text-xl font-bold tabular-nums text-[var(--foreground)]">{fmtIN(card.tco2e)} tCO₂e</p>
                            <p className="text-xs text-[var(--foreground-muted)]">{card.pctFleet}% of fleet</p>
                            {true ? (
                              <p className="mt-2 text-xs leading-relaxed text-[var(--foreground-muted)]">{card.narrative.join(" · ")}</p>
                            ) : null}
                            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                              {card.intensityLabel}
                            </p>
                            <p className={`mt-2 text-xs font-bold ${moneyToneText(card.statusTone)}`}>{card.statusLabel}</p>
                          </div>
                        ))}
                      </div>
                      {true ? (
                        <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">{vc.downstream.netPositionLine}</p>
                      ) : (
                        <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                          SBTi alignment depends on EV mix, supplier PCFs, and use-phase assumptions moving together — numbers above are demo-only.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </Scope3Panel>
            </section>
      ) : null}

      {section === "trend" ? (
        <section id="vc-trend">
          <Scope3Panel className="!p-4">
            <Scope3SectionLabel
              title="Upstream vs downstream trend"
              description="Downstream = use-phase glide path vs SBTi-style target. Upstream = supply-chain trajectory vs supplier PCF programme (illustrative FY22–FY27)."
            />
            <div className={`${VC_VIZ_CARD} mt-4`}>
              <AutoChartBox heightClass="h-[min(360px,50vh)] min-h-[260px]">
                {chartsReady ? (
                    <ComposedChart data={trendChartData} margin={{ top: 12, right: 16, left: 8, bottom: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                      <XAxis
                        dataKey="fy"
                        tick={{ fontSize: 10 }}
                        stroke="var(--foreground-muted)"
                        interval={0}
                        angle={-14}
                        textAnchor="end"
                        height={52}
                      />
                      <YAxis
                        yAxisId="L"
                        width={52}
                        tick={{ fontSize: 10 }}
                        stroke="var(--foreground-muted)"
                        tickFormatter={(v) => fmtIN(Number(v))}
                        label={{ value: "Downstream tCO₂e", angle: -90, position: "insideLeft", fill: "var(--foreground-muted)", fontSize: 10 }}
                      />
                      <YAxis
                        yAxisId="R"
                        orientation="right"
                        width={48}
                        tick={{ fontSize: 10 }}
                        stroke="var(--foreground-muted)"
                        tickFormatter={(v) => fmtIN(Number(v))}
                        domain={[0, 20000]}
                        label={{ value: "Upstream tCO₂e", angle: 90, position: "insideRight", fill: "var(--foreground-muted)", fontSize: 10 }}
                      />
                      <Tooltip formatter={(v) => fmtIN(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line yAxisId="L" type="monotone" dataKey="downstreamActual" name="Downstream actual" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line yAxisId="L" type="monotone" dataKey="downstreamTarget" name="Downstream target path" stroke="var(--success)" strokeDasharray="5 4" dot={false} strokeWidth={2} />
                      <Line yAxisId="R" type="monotone" dataKey="upstreamActual" name="Upstream actual" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
                      <Line yAxisId="R" type="monotone" dataKey="upstreamTarget" name="Upstream target path" stroke="var(--primary)" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                    </ComposedChart>
                ) : (
                  <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-[var(--foreground-muted)]">Preparing chart…</div>
                )}
              </AutoChartBox>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-[var(--foreground-muted)]">
              {vc.trend.annotations.map((a) => (
                <li key={`${a.fy}-${a.text}`}>
                  <span className="font-mono text-[var(--foreground)]">{a.fy}</span> · {a.tone === "up" ? "▲ " : "▼ "}
                  {a.text}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              {vc.trend.gapLabel}: {fmtIN(vc.trend.gapTCO2e)} tCO₂e
            </p>
            {vc.trend.footerLines.map((line) => (
              <p key={line} className="mt-2 text-sm text-[var(--foreground-muted)]">
                {line}
              </p>
            ))}
          </Scope3Panel>
        </section>
      ) : null}

      <Scope3DrilldownDrawer
        open={vcDrill != null}
        title={vcDrill?.title ?? "Detail"}
        subtitle="Illustrative value-chain drill-down for BMM (demo dataset — not audited)."
        onClose={() => setVcDrill(null)}
        size="lg"
      >
        {vcDrill ? <ValueChainDrillBody drill={vcDrill} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

export function ValueChainView({
  data,
  legalName,
}: {
  data?: AutomotiveScope3MockData;
  legalName?: string;
}) {
  const name = legalName ?? data?.company.legalName ?? "Bharat Mobility Motors Ltd";
  return <ValueChainViewLoaded legalName={name} valueChain={valueChainMockData} />;
}

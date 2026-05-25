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
import type { BankPersonaId, UpstreamDownstreamMockData, UpstreamDownstreamScatterPointMock } from "./types";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel, scope3SelectClass } from "../Pharma/scope3-ui";
import { UpstreamDownstreamDrillBody, type UdDrill } from "./UpstreamDownstreamDrillBody";
import { UpstreamDownstreamHero } from "./UpstreamDownstreamHero";
import {
  BankChartBox,
  bankCallout,
  bankPage,
  bankTable,
  bankTableShell,
  bankTd,
  bankTh,
} from "./banking-ui";

const UD_DRILL_BTN =
  "whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-semibold text-[var(--primary)] hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]";

type Mask = {
  hero: boolean;
  upstream: boolean;
  downstreamA: boolean;
  downstreamB: boolean;
  downstreamC: boolean;
  downstreamD: boolean;
  trend: boolean;
  compact3D: boolean;
};

function maskForPersona(p: BankPersonaId): Mask {
  switch (p) {
    case "cro":
      return {
        hero: true,
        upstream: false,
        downstreamA: false,
        downstreamB: false,
        downstreamC: false,
        downstreamD: false,
        trend: true,
        compact3D: false,
      };
    case "esg_officer":
      return {
        hero: true,
        upstream: true,
        downstreamA: true,
        downstreamB: true,
        downstreamC: true,
        downstreamD: true,
        trend: true,
        compact3D: false,
      };
    case "corporate_rm":
      return {
        hero: true,
        upstream: false,
        downstreamA: false,
        downstreamB: false,
        downstreamC: false,
        downstreamD: true,
        trend: false,
        compact3D: false,
      };
    case "credit_risk_analyst":
      return {
        hero: true,
        upstream: false,
        downstreamA: false,
        downstreamB: true,
        downstreamC: true,
        downstreamD: false,
        trend: false,
        compact3D: false,
      };
    case "board_member":
      return {
        hero: true,
        upstream: false,
        downstreamA: false,
        downstreamB: false,
        downstreamC: false,
        downstreamD: true,
        trend: false,
        compact3D: true,
      };
    case "procurement_gm":
      return {
        hero: true,
        upstream: true,
        downstreamA: true,
        downstreamB: true,
        downstreamC: false,
        downstreamD: true,
        trend: true,
        compact3D: false,
      };
    default:
      return {
        hero: true,
        upstream: true,
        downstreamA: true,
        downstreamB: true,
        downstreamC: true,
        downstreamD: true,
        trend: true,
        compact3D: false,
      };
  }
}

function fmtIN(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function pcafBadgeClass(score: number): string {
  if (score <= 2) return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200";
  if (score <= 3) return "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200";
  return "bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200";
}

function pcafChartFill(score: number): string {
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
  q: UpstreamDownstreamScatterPointMock["quadrant"],
  labels: { key: UpstreamDownstreamScatterPointMock["quadrant"]; title: string; subtitle: string }[],
): string {
  const row = labels.find((l) => l.key === q);
  return row ? `${row.title} — ${row.subtitle}` : q;
}

const UD_VIZ_CARD =
  "flex min-h-0 min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05] sm:p-4";

const UD_SECTION_PAD = "px-5 py-5 sm:px-6";
const UD_HEADER_PAD = "px-5 py-4 sm:px-6";

export function UpstreamDownstreamView({
  legalName,
  upstreamDownstream: ud,
  activePersona,
}: {
  legalName: string;
  upstreamDownstream: UpstreamDownstreamMockData;
  activePersona: BankPersonaId;
}) {
  const m = useMemo(() => maskForPersona(activePersona), [activePersona]);
  const downstreamAny = m.downstreamA || m.downstreamB || m.downstreamC || m.downstreamD;
  const [selectedBorrower, setSelectedBorrower] = useState(() => ud.downstream.pcafBorrowers[0]?.id ?? "");
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [udDrill, setUdDrill] = useState<UdDrill | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const borrower = ud.downstream.pcafBorrowers.find((b) => b.id === selectedBorrower) ?? ud.downstream.pcafBorrowers[0];
  const bankTicker = ud.hero.bankTicker;

  const trendChartData = useMemo(
    () =>
      ud.trend.points.map((p) => ({
        fy: p.fy,
        outsideActual: p.outsideActual,
        outsideTarget: p.outsideTarget,
        insideActual: p.insideActual,
        insideTarget: p.insideTarget,
      })),
    [ud.trend.points],
  );

  const sectorsSorted = useMemo(
    () => [...ud.downstream.scatterPoints].sort((a, b) => b.exposureCr - a.exposureCr),
    [ud.downstream.scatterPoints],
  );

  const upstreamCategoryChart = useMemo(
    () =>
      ud.upstream.categories.map((c) => ({
        label: c.label.replace(/^Cat \d+: /, ""),
        tco2e: c.tco2e,
      })),
    [ud.upstream.categories],
  );

  const scope3SharePie = useMemo(
    () => [
      { name: `Upstream (${ud.hero.upstreamPctScope3}%)`, value: ud.hero.upstreamPctScope3, fill: "var(--primary)" },
      { name: `Downstream (${ud.hero.downstreamPctScope3}%)`, value: ud.hero.downstreamPctScope3, fill: "var(--danger)" },
    ],
    [ud.hero.downstreamPctScope3, ud.hero.upstreamPctScope3],
  );

  const insideOutsideMass = useMemo(
    () => [
      { key: "in", name: "Inside (ops)", t: ud.hero.insideTCO2e },
      { key: "out", name: "Outside (financed)", t: ud.hero.outsideTCO2e },
    ],
    [ud.hero.insideTCO2e, ud.hero.outsideTCO2e],
  );

  const moneyFlowStackRow = useMemo(() => {
    const row: Record<string, string | number> = { name: "Total exposure" };
    for (const s of ud.downstream.moneyFlowSegments) row[s.id] = s.exposureCr;
    return [row];
  }, [ud.downstream.moneyFlowSegments]);

  const sleeveExposureRow = useMemo(
    () => [
      {
        name: "Book sleeves",
        green: ud.downstream.greenMoney.exposureCr,
        brown: ud.downstream.brownMoney.exposureCr,
        neutral: ud.downstream.neutralMoney.exposureCr,
      },
    ],
    [ud.downstream.greenMoney.exposureCr, ud.downstream.brownMoney.exposureCr, ud.downstream.neutralMoney.exposureCr],
  );

  return (
    <div className={`${bankPage} mx-auto w-full max-w-[1280px]`}>
      {m.hero ? (
        <section id="ud-overview">
          <Scope3Panel className="!p-0 overflow-hidden">
            <UpstreamDownstreamHero legalName={legalName} bankTicker={bankTicker} hero={ud.hero} />
            {chartsReady ? (
              <div className={`grid items-stretch gap-6 border-t border-[var(--border)] bg-[var(--muted)]/20 sm:grid-cols-2 ${UD_SECTION_PAD}`}>
                <div className={UD_VIZ_CARD}>
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Scope 3 mix (share)</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
                    Upstream vs downstream as % of total bank-reported Scope 3 (mock).
                  </p>
                  <div className="mt-3 min-h-[220px] flex-1">
                    <BankChartBox heightClass="h-[220px] min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
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
                      </ResponsiveContainer>
                    </BankChartBox>
                  </div>
                </div>
                <div className={UD_VIZ_CARD}>
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Mass balance (tCO₂e)</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
                    Absolute footprint — financed (outside) dominates operational Scope 3 (inside) in this illustration.
                  </p>
                  <div className="mt-3 min-h-[220px] flex-1">
                    <BankChartBox heightClass="h-[220px] min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
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
                      </ResponsiveContainer>
                    </BankChartBox>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`border-t border-[var(--border)] py-10 text-center text-sm text-[var(--foreground-muted)] ${UD_SECTION_PAD}`}>
                Loading charts…
              </div>
            )}
            <div className={`${bankCallout} !rounded-none !border-x-0 !border-b-0 ${UD_SECTION_PAD}`}>
              <p className="text-sm font-medium text-[var(--foreground)]">{ud.hero.tagline}</p>
            </div>
          </Scope3Panel>
        </section>
      ) : null}

      {(m.upstream || downstreamAny) && (
        <div className="flex min-w-0 flex-col gap-6 xl:gap-8">
          {m.upstream ? (
            <section id="ud-upstream" className="min-w-0">
              <Scope3Panel className="!p-0 min-h-0 min-w-0">
                <div className={`border-b border-[var(--border)] ${UD_HEADER_PAD}`}>
                  <Scope3SectionLabel
                    className="!mb-0"
                    title={ud.upstream.headerTitle}
                    description={`${ud.upstream.sublabel} · ${ud.upstream.pctScope3}% of Scope 3 · ${fmtIN(ud.upstream.totalTCO2e)} tCO₂e attributed in this mock.`}
                  />
                </div>
                <div className={`space-y-6 ${UD_SECTION_PAD}`}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Category breakdown</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
                      Horizontal bars = tCO₂e by Scope 3 category cluster (bank operations). Table lists full labels and flags.
                    </p>
                    {chartsReady ? (
                      <div className={`${UD_VIZ_CARD} mt-3`}>
                        <BankChartBox heightClass="h-[min(300px,42vh)] min-h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
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
                          </ResponsiveContainer>
                        </BankChartBox>
                      </div>
                    ) : null}
                    <div className={bankTableShell + " mt-4"}>
                      <table className={bankTable}>
                        <thead>
                          <tr>
                            <th className={bankTh}>Category</th>
                            <th className={`${bankTh} text-right`}>tCO₂e</th>
                            <th className={bankTh}>Note</th>
                            <th className={`${bankTh} text-right`}>Drill-down</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ud.upstream.categories.map((c) => (
                            <tr key={c.id} className="last:border-b-0">
                              <td className={bankTd}>{c.label}</td>
                              <td className={`${bankTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(c.tco2e)}</td>
                              <td className={`${bankTd} text-xs text-[var(--foreground-muted)]`}>
                                {c.flagLabel ? (
                                  <span className="font-medium text-amber-800 dark:text-amber-200">{c.flagLabel}</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className={`${bankTd} text-right`}>
                                {c.drill ? (
                                  <button
                                    type="button"
                                    className={UD_DRILL_BTN}
                                    onClick={() => {
                                      const drill = c.drill;
                                      if (!drill) return;
                                      setUdDrill({ kind: "category", title: c.label, drill });
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
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">{ud.upstream.supplierHoverSuffix}</p>
                    <div className={bankTableShell + " mt-2"}>
                      <table className={`min-w-[640px] ${bankTable}`}>
                        <thead>
                          <tr>
                            <th className={bankTh}>Supplier</th>
                            <th className={bankTh}>Supply</th>
                            <th className={`${bankTh} text-right`}>Spend ₹ Cr</th>
                            <th className={`${bankTh} text-right`}>tCO₂e</th>
                            <th className={bankTh}>Scope / cat.</th>
                            <th className={`${bankTh} text-right`}>Drill-down</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ud.upstream.suppliers.map((r) => (
                            <tr key={r.supplier + r.supply} className="last:border-b-0">
                              <td className={`${bankTd} font-medium`}>{r.supplier}</td>
                              <td className={`${bankTd} text-xs text-[var(--foreground-muted)]`}>{r.supply}</td>
                              <td className={`${bankTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(r.spendCr)}</td>
                              <td className={`${bankTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(r.tco2e)}</td>
                              <td className={`${bankTd} text-xs`}>{r.category}</td>
                              <td className={`${bankTd} text-right`}>
                                {r.drill ? (
                                  <button
                                    type="button"
                                    className={UD_DRILL_BTN}
                                    onClick={() => {
                                      const drill = r.drill;
                                      if (!drill) return;
                                      setUdDrill({ kind: "supplier", title: `${r.supplier} — ${r.supply}`, drill });
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
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Green procurement signals</h3>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-[var(--foreground-muted)]">
                        {ud.upstream.greenProcurement.map((g) => (
                          <li key={g.label}>
                            <span className="font-semibold text-[var(--foreground)]">{g.value}</span> — {g.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">{ud.upstream.upstreamNetZero.label}</h3>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-[width] dark:bg-emerald-400"
                          style={{ width: `${Math.min(100, ud.upstream.upstreamNetZero.pctAchieved)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-[var(--foreground-muted)]">{ud.upstream.upstreamNetZero.pctAchieved}% of internal milestones met (demo).</p>
                    </div>
                  </div>
                </div>
              </Scope3Panel>
            </section>
          ) : null}

          {downstreamAny ? (
            <section id="ud-downstream" className="min-w-0">
              <Scope3Panel className="!p-0 min-h-0 min-w-0">
                <div className={`border-b border-[var(--border)] ${UD_HEADER_PAD}`}>
                  {m.downstreamA || m.downstreamB || m.downstreamC ? (
                    <Scope3SectionLabel
                      className="!mb-0"
                      title={ud.downstream.headerTitle}
                      description={`${ud.downstream.sublabel} · ${ud.downstream.pctScope3}% of Scope 3 · ${fmtIN(ud.downstream.totalTCO2e)} tCO₂e in this mock.`}
                    />
                  ) : (
                    <Scope3SectionLabel
                      className="!mb-0"
                      title="Financed emissions — board snapshot"
                      description="Category 15 overview: how green, brown, and neutral sleeves contribute to the financed footprint (illustrative)."
                    />
                  )}
                </div>

                <div className={`space-y-6 ${UD_SECTION_PAD}`}>
                  {m.downstreamA ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Exposure by asset class</h3>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Stacked bar = ₹ Cr exposure by segment (colour = indicative PCAF data-quality score). Table below lists tCO₂e and % book.
                      </p>
                      {chartsReady ? (
                      <div className={`${UD_VIZ_CARD} mt-3`}>
                        <BankChartBox heightClass="h-[120px] min-h-[100px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={moneyFlowStackRow} layout="vertical" margin={{ left: 108, right: 8, top: 8, bottom: 40 }}>
                              <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" tickFormatter={(v) => fmtIN(Number(v))} />
                              <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" />
                              <Tooltip
                                formatter={(v, name) => [`₹ ${fmtIN(Number(v))} Cr`, String(name)]}
                                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
                              />
                              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                              {ud.downstream.moneyFlowSegments.map((s) => (
                                <Bar key={s.id} dataKey={s.id} name={s.label} stackId="book" fill={pcafChartFill(s.pcafScore)} />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </BankChartBox>
                      </div>
                    ) : null}
                    <div className={bankTableShell + " mt-4"}>
                        <table className={`min-w-[720px] ${bankTable}`}>
                          <thead>
                            <tr>
                              <th className={bankTh}>Segment</th>
                              <th className={`${bankTh} text-right`}>Exposure ₹ Cr</th>
                              <th className={`${bankTh} text-right`}>tCO₂e</th>
                              <th className={`${bankTh} text-right`}>% book</th>
                              <th className={`${bankTh} text-center`}>PCAF</th>
                              <th className={`${bankTh} text-right`}>Drill-down</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ud.downstream.moneyFlowSegments.map((s) => (
                              <tr key={s.id} className="last:border-b-0">
                                <td className={`${bankTd} font-medium`}>{s.label}</td>
                                <td className={`${bankTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(s.exposureCr)}</td>
                                <td className={`${bankTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(s.tco2e)}</td>
                                <td className={`${bankTd} text-right tabular-nums`}>{s.pctBook}%</td>
                                <td className={`${bankTd} text-center`}>
                                  <span className={`inline-block min-w-[2rem] rounded-md px-2 py-0.5 text-xs font-bold ${pcafBadgeClass(s.pcafScore)}`}>
                                    {s.pcafScore}
                                  </span>
                                </td>
                                <td className={`${bankTd} text-right`}>
                                  {s.drill ? (
                                    <button
                                      type="button"
                                      className={UD_DRILL_BTN}
                                      onClick={() => {
                                        const drill = s.drill;
                                        if (!drill) return;
                                        setUdDrill({ kind: "segment", title: s.label, drill });
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

                  {m.downstreamB ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Sector lens (exposure × intensity)</h3>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Bubble chart: X = ₹ Cr exposure, Y = tCO₂e per ₹ Cr, size ≈ borrower count. Colour follows mock quadrant coding; keys below match the sector table.
                      </p>
                      {chartsReady ? (
                        <div className={`${UD_VIZ_CARD} mt-3`}>
                          <BankChartBox heightClass="h-[min(360px,44vh)] min-h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart margin={{ top: 16, right: 20, bottom: 28, left: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                                <XAxis
                                  type="number"
                                  dataKey="exposureCr"
                                  name="Exposure"
                                  tick={{ fontSize: 10 }}
                                  stroke="var(--foreground-muted)"
                                  label={{ value: "Exposure (₹ Cr)", position: "bottom", offset: 12, fill: "var(--foreground-muted)", fontSize: 11 }}
                                />
                                <YAxis
                                  type="number"
                                  dataKey="intensityPerCr"
                                  name="Intensity"
                                  tick={{ fontSize: 10 }}
                                  stroke="var(--foreground-muted)"
                                  label={{ value: "Intensity (tCO₂e / ₹ Cr)", angle: -90, position: "insideLeft", fill: "var(--foreground-muted)", fontSize: 11 }}
                                />
                                <ZAxis type="number" dataKey="borrowers" range={[56, 220]} />
                                <Tooltip
                                  cursor={{ strokeDasharray: "3 3" }}
                                  formatter={(value, name) => [fmtIN(Number(value)), String(name)]}
                                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
                                  labelFormatter={(_, payload) => {
                                    const p = payload?.[0]?.payload as (typeof ud.downstream.scatterPoints)[0] | undefined;
                                    return p?.sector ?? "";
                                  }}
                                />
                                <Scatter
                                  name="Sectors"
                                  data={ud.downstream.scatterPoints}
                                  fill="var(--primary)"
                                  shape={(props: { cx?: number; cy?: number; payload?: (typeof ud.downstream.scatterPoints)[0] }) => {
                                    const { cx = 0, cy = 0, payload } = props;
                                    const r = 10 + Math.min(22, Math.cbrt(payload?.borrowers ?? 1) * 3.2);
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
                            </ResponsiveContainer>
                          </BankChartBox>
                        </div>
                      ) : null}
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {ud.downstream.quadrantLabels.map((q) => (
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
                      <div className={bankTableShell + " mt-3"}>
                        <table className={`min-w-[800px] ${bankTable}`}>
                          <thead>
                            <tr>
                              <th className={bankTh}>Sector</th>
                              <th className={`${bankTh} text-right`}>Exposure ₹ Cr</th>
                              <th className={`${bankTh} text-right`}>tCO₂e / ₹ Cr</th>
                              <th className={`${bankTh} text-right`}>Borrowers</th>
                              <th className={bankTh}>Quadrant read</th>
                              <th className={`${bankTh} text-right`}>Drill-down</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sectorsSorted.map((row) => (
                              <tr key={row.sector} className="last:border-b-0">
                                <td className={`${bankTd} font-medium`}>{row.sector}</td>
                                <td className={`${bankTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(row.exposureCr)}</td>
                                <td className={`${bankTd} text-right font-mono text-sm tabular-nums`}>{fmtIN(row.intensityPerCr)}</td>
                                <td className={`${bankTd} text-right tabular-nums`}>{fmtIN(row.borrowers)}</td>
                                <td className={`${bankTd} max-w-[220px] text-xs text-[var(--foreground-muted)]`}>
                                  {quadrantLabel(row.quadrant, ud.downstream.quadrantLabels)}
                                </td>
                                <td className={`${bankTd} text-right`}>
                                  {row.drill ? (
                                    <button
                                      type="button"
                                      className={UD_DRILL_BTN}
                                      onClick={() => {
                                        const drill = row.drill;
                                        if (!drill) return;
                                        setUdDrill({ kind: "sector", title: `${row.sector} sector lens`, drill });
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

                  {m.downstreamC && borrower ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">{ud.downstream.pcafBoxTitle}</h3>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">{ud.downstream.pcafFormulaIntro}</p>
                      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]" htmlFor="ud-borrower-select">
                        Example borrower
                      </label>
                      <select
                        id="ud-borrower-select"
                        value={selectedBorrower}
                        onChange={(e) => setSelectedBorrower(e.target.value)}
                        className={`${scope3SelectClass} mt-1.5 w-full sm:max-w-xl`}
                      >
                        {ud.downstream.pcafBorrowers.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                          <dt className="text-xs text-[var(--foreground-muted)]">Borrower Scope 1+2 (reported)</dt>
                          <dd className="mt-1 font-mono font-semibold tabular-nums">{fmtIN(borrower.borrowerScope12TCO2e)} tCO₂e/yr</dd>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                          <dt className="text-xs text-[var(--foreground-muted)]">Loan outstanding</dt>
                          <dd className="mt-1 font-mono font-semibold tabular-nums">₹ {fmtIN(borrower.loanOutstandingCr)} Cr</dd>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                          <dt className="text-xs text-[var(--foreground-muted)]">Enterprise value (debt + mcap)</dt>
                          <dd className="mt-1 font-mono font-semibold tabular-nums">₹ {fmtIN(borrower.totalDebtPlusMarketCapCr)} Cr</dd>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                          <dt className="text-xs text-[var(--foreground-muted)]">Attribution share</dt>
                          <dd className="mt-1 font-mono font-semibold tabular-nums">{borrower.attributionPct}%</dd>
                        </div>
                      </dl>
                      <div className="mt-4 rounded-lg border border-[var(--primary)]/25 bg-[var(--primary-muted)]/15 p-3 text-sm">
                        <p>
                          <span className="font-semibold text-[var(--foreground)]">Attributed financed emissions: </span>
                          <span className="font-mono font-bold tabular-nums text-[var(--foreground)]">{fmtIN(borrower.attributedTCO2e)} tCO₂e</span>
                        </p>
                        <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                          PCAF score <span className="font-mono font-semibold text-[var(--foreground)]">{borrower.pcafScore}</span> ({borrower.pcafLabel}).
                          Disclosure tie-in: PCAF annual template and BRSR Section A for {bankTicker}.
                        </p>
                        {borrower.drill ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className={UD_DRILL_BTN}
                              onClick={() => {
                                const drill = borrower.drill;
                                if (!drill) return;
                                setUdDrill({ kind: "borrower", title: borrower.name, drill });
                              }}
                            >
                              Full PCAF drill-down
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {m.downstreamD ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">Green · brown · neutral sleeves</h3>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Stacked exposure (₹ Cr) across classification sleeves — complements the cards below.
                      </p>
                      {chartsReady ? (
                        <div className={`${UD_VIZ_CARD} mt-3`}>
                          <BankChartBox heightClass="h-[96px] min-h-[80px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={sleeveExposureRow} layout="vertical" margin={{ left: 100, right: 12, top: 8, bottom: 36 }}>
                                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" tickFormatter={(v) => fmtIN(Number(v))} />
                                <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 10 }} stroke="var(--foreground-muted)" />
                                <Tooltip formatter={(v) => [`₹ ${fmtIN(Number(v))} Cr`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                                <Bar dataKey="green" name="Green" stackId="s" fill="var(--success)" />
                                <Bar dataKey="brown" name="Brown" stackId="s" fill="var(--danger)" />
                                <Bar dataKey="neutral" name="Neutral" stackId="s" fill="var(--foreground-muted)" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </BankChartBox>
                        </div>
                      ) : null}
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {[ud.downstream.greenMoney, ud.downstream.brownMoney, ud.downstream.neutralMoney].map((card) => (
                          <div
                            key={card.title}
                            className={`rounded-xl border p-4 ${moneyToneBorder(card.statusTone)}`}
                          >
                            <div className={`text-xs font-bold uppercase tracking-wide ${moneyToneText(card.statusTone)}`}>{card.title}</div>
                            <p className="mt-2 text-xl font-bold tabular-nums text-[var(--foreground)]">₹{fmtIN(card.exposureCr)} Cr</p>
                            <p className="text-xs text-[var(--foreground-muted)]">{card.pctBook}% of book</p>
                            {!m.compact3D ? (
                              <p className="mt-2 text-xs leading-relaxed text-[var(--foreground-muted)]">{card.narrative.join(" · ")}</p>
                            ) : null}
                            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                              {card.tco2eLabel}: {fmtIN(card.tco2e)} tCO₂e
                            </p>
                            <p className="mt-1 text-xs text-[var(--foreground-muted)]">{card.targetLabel}</p>
                            <p className={`mt-2 text-xs font-bold ${moneyToneText(card.statusTone)}`}>{card.statusLabel}</p>
                          </div>
                        ))}
                      </div>
                      {!m.compact3D ? (
                        <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">{ud.downstream.netPositionLine}</p>
                      ) : (
                        <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                          NZBA alignment depends on shrinking high-carbon financed exposure while scaling verified green flows — numbers above are demo-only.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </Scope3Panel>
            </section>
          ) : null}
        </div>
      )}

      {m.trend ? (
        <section id="ud-trend">
          <Scope3Panel className="!p-4">
            <Scope3SectionLabel
              title="Inside vs outside trend"
              description="Outside = financed (Category 15) trajectory vs NZBA-style glide path. Inside = bank operational Scope 3 vs internal net-zero path (illustrative FY22–FY31)."
            />
            <div className={`${UD_VIZ_CARD} mt-4`}>
              <BankChartBox heightClass="h-[min(360px,50vh)] min-h-[260px]">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
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
                        label={{ value: "Outside tCO₂e", angle: -90, position: "insideLeft", fill: "var(--foreground-muted)", fontSize: 10 }}
                      />
                      <YAxis
                        yAxisId="R"
                        orientation="right"
                        width={48}
                        tick={{ fontSize: 10 }}
                        stroke="var(--foreground-muted)"
                        tickFormatter={(v) => fmtIN(Number(v))}
                        domain={[0, 20000]}
                        label={{ value: "Inside tCO₂e", angle: 90, position: "insideRight", fill: "var(--foreground-muted)", fontSize: 10 }}
                      />
                      <Tooltip formatter={(v) => fmtIN(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line yAxisId="L" type="monotone" dataKey="outsideActual" name="Outside actual" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line yAxisId="L" type="monotone" dataKey="outsideTarget" name="NZBA target path" stroke="var(--success)" strokeDasharray="5 4" dot={false} strokeWidth={2} />
                      <Line yAxisId="R" type="monotone" dataKey="insideActual" name="Inside actual" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
                      <Line yAxisId="R" type="monotone" dataKey="insideTarget" name="Inside net-zero path" stroke="var(--primary)" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-[var(--foreground-muted)]">Preparing chart…</div>
                )}
              </BankChartBox>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-[var(--foreground-muted)]">
              {ud.trend.annotations.map((a) => (
                <li key={`${a.fy}-${a.text}`}>
                  <span className="font-mono text-[var(--foreground)]">{a.fy}</span> · {a.tone === "up" ? "▲ " : "▼ "}
                  {a.text}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              {ud.trend.gapLabel}: {fmtIN(ud.trend.gapTCO2e)} tCO₂e
            </p>
            {ud.trend.footerLines.map((line) => (
              <p key={line} className="mt-2 text-sm text-[var(--foreground-muted)]">
                {line}
              </p>
            ))}
          </Scope3Panel>
        </section>
      ) : null}

      <Scope3DrilldownDrawer
        open={udDrill != null}
        title={udDrill?.title ?? "Detail"}
        subtitle="Illustrative upstream / downstream inventory drill-down for BABL (demo dataset — not audited)."
        onClose={() => setUdDrill(null)}
        size="lg"
      >
        {udDrill ? <UpstreamDownstreamDrillBody drill={udDrill} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

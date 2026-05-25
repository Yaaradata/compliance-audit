"use client";

import { Children, startTransition, useEffect, useMemo, useState } from "react";
import { Cloud, Database, FileCheck2, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import type { ExecutiveQuickNav, NavViewId, PersonaId, Scope3MockData } from "./types";
import { isBoardHighLevel, visibleNavViews } from "./personaAccess";
import { useScope3Toast } from "./scope3-feedback";
import { Scope3KpiStrip } from "../scope3-kpi";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel } from "./scope3-ui";
import { ExecutiveKpiDeepDrill } from "./executive-kpi-drill";

function qualityColorTier(tier: string): string {
  if (tier === "Primary") return "var(--success)";
  if (tier === "Secondary") return "var(--warning)";
  if (tier === "Spend-Based") return "var(--danger)";
  return "var(--foreground-subtle)";
}

function formatInt(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

type ExecKpiId = "total" | "primary" | "brsr" | "verified";

type ExecDrill =
  | { kind: "kpi"; id: ExecKpiId }
  | { kind: "regulatory"; code: string }
  | { kind: "exportConsignment"; id: string }
  | { kind: "sbti" }
  | { kind: "trend" }
  | { kind: "alert"; alertId: string };

export function ExecutiveSummaryView({
  data,
  persona,
  onSelectCategory,
  onQuickNav,
}: {
  data: Scope3MockData;
  persona: PersonaId;
  onSelectCategory: (id: number) => void;
  onQuickNav: (nav: ExecutiveQuickNav) => void;
}) {
  const { pushToast } = useScope3Toast();
  const { company, executive, regulatory, trend, scope3Categories, complianceAlerts, exportConsignmentQueue } = data;
  const barData = [...scope3Categories]
    .sort((a, b) => b.tCO2e - a.tCO2e)
    .map((c) => ({
      label: `Cat ${c.id}`,
      name: c.name.length > 28 ? `${c.name.slice(0, 26)}…` : c.name,
      tCO2e: c.tCO2e / 1000,
      full: c,
    }));

  const trendChart = trend.map((t) => ({
    year: String(t.year),
    "Scope 1": t.scope1 / 1000,
    "Scope 2": t.scope2 / 1000,
    "Scope 3": t.scope3 / 1000,
    "SBTi trajectory": t.sbtiTarget / 1000,
  }));

  const board = isBoardHighLevel(persona);
  const [chartsReady, setChartsReady] = useState(false);
  const [execDrill, setExecDrill] = useState<ExecDrill | null>(null);
  useEffect(() => {
    startTransition(() => {
      setChartsReady(true);
    });
  }, []);

  const allowed = useMemo(() => new Set(visibleNavViews(persona)), [persona]);

  const latestTrend = trend[trend.length - 1];
  const sbtiGapKt = latestTrend != null ? (latestTrend.scope3 - latestTrend.sbtiTarget) / 1000 : 0;

  function canNavigateForAlert(target: (typeof complianceAlerts)[0]["target"], row: (typeof complianceAlerts)[0]): boolean {
    switch (target) {
      case "category":
        return row.categoryId != null && allowed.has("categories");
      case "supplier":
        return Boolean(row.supplierName) && allowed.has("suppliers");
      case "ai":
        return allowed.has("ai_insights");
      case "reports":
        return allowed.has("reports");
      case "controls":
        return allowed.has("controls_audit");
      default:
        return false;
    }
  }

  function runAlertAction(row: (typeof complianceAlerts)[0]) {
    switch (row.target) {
      case "category":
        if (row.categoryId != null) onQuickNav({ kind: "category", categoryId: row.categoryId });
        return;
      case "supplier":
        if (row.supplierName) onQuickNav({ kind: "supplier", supplierName: row.supplierName });
        return;
      case "ai":
        onQuickNav({ kind: "view", view: "ai_insights" });
        return;
      case "reports":
        onQuickNav({ kind: "view", view: "reports" });
        return;
      case "controls":
        onQuickNav({ kind: "view", view: "controls_audit" });
        return;
      default:
        return;
    }
  }

  async function copyExecutiveSnapshot() {
    const snapshot = {
      generatedAt: new Date().toISOString(),
      company: company.shortName,
      inventoryClose: company.lastInventoryClose,
      executiveKpis: executive,
      openAlerts: complianceAlerts.length,
      exportConsignmentsOpen: exportConsignmentQueue.filter((r) => r.status !== "Complete").length,
    };
    const text = JSON.stringify(snapshot, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      pushToast("Executive KPI snapshot copied to clipboard (JSON).", "success");
    } catch {
      pushToast(`Copy blocked — raw snapshot: ${text.slice(0, 200)}…`, "warning");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Key metrics
        </p>
        <Scope3KpiStrip
          cols="sm:grid-cols-2 xl:grid-cols-4"
          items={[
            {
              label: "Total Scope 3",
              value: `${formatInt(executive.totalScope3TCO2e / 1000)} ktCO₂e`,
              sub: `Year-on-year ${executive.yoyScope3Pct >= 0 ? "+" : ""}${executive.yoyScope3Pct}%`,
              tone: "teal",
              icon: Cloud,
              onClick: () => setExecDrill({ kind: "kpi", id: "total" }),
            },
            {
              label: "Primary data coverage",
              value: `${executive.primaryDataCoveragePct}%`,
              sub: "Share of inventory mass using primary-tier data",
              tone: "emerald",
              icon: Database,
              onClick: () => setExecDrill({ kind: "kpi", id: "primary" }),
            },
            {
              label: "BRSR readiness",
              value: `${executive.brsrReadinessPct}%`,
              sub: "Assurance readiness (modelled score)",
              tone: "blue",
              icon: FileCheck2,
              onClick: () => setExecDrill({ kind: "kpi", id: "brsr" }),
            },
            {
              label: "Verified suppliers",
              value: `${executive.verifiedSuppliers} / ${executive.totalSuppliers}`,
              sub: "ESG data verified or desk-checked",
              tone: "violet",
              icon: Users,
              onClick: () => setExecDrill({ kind: "kpi", id: "verified" }),
            },
          ]}
        />
      </div>

      <Scope3Panel>
        <Scope3SectionLabel
          title="What needs attention first"
          description="Each card links to the right screen for your persona (suppliers, categories, AI, reports, or Risk & Compliance)."
          action={
            !board ? (
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)]"
                onClick={() => void copyExecutiveSnapshot()}
              >
                Copy KPI snapshot
              </button>
            ) : undefined
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          {complianceAlerts.map((a) => (
            <div
              key={a.id}
              className={`flex min-h-[140px] flex-col justify-between rounded-xl border p-4 ${
                a.severity === "critical"
                  ? "border-[var(--danger)] bg-[var(--danger-bg)]/35"
                  : a.severity === "warning"
                    ? "border-[var(--warning)] bg-[var(--warning-bg)]/30"
                    : "border-[var(--border)] bg-[var(--muted)]/25"
              }`}
            >
              <div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    a.severity === "critical"
                      ? "bg-[var(--danger)] text-white"
                      : a.severity === "warning"
                        ? "bg-[var(--warning)] text-white"
                        : "bg-[var(--border-strong)] text-[var(--foreground-muted)]"
                  }`}
                >
                  {a.severity}
                </span>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-[var(--foreground)]">{a.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">{a.detail}</p>
                {a.due ? <p className="mt-2 text-[11px] text-[var(--foreground-subtle)]">Due {a.due}</p> : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                  onClick={() => setExecDrill({ kind: "alert", alertId: a.id })}
                >
                  Brief
                </button>
                {canNavigateForAlert(a.target, a) ? (
                  <button
                    type="button"
                    className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
                    onClick={() => runAlertAction(a)}
                  >
                    {a.actionLabel}
                  </button>
                ) : (
                  <span className="text-[11px] text-[var(--foreground-subtle)]">
                    {board ? "In board pack" : "Unavailable for this role"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Scope3Panel>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Emissions & reporting context
        </p>
        <div className="grid gap-6 xl:grid-cols-12">
          <Scope3Panel className="xl:col-span-7">
            <Scope3SectionLabel
              title="Scope 3 by category"
              description="Larger bars = more emissions (ktCO₂e). Colour = data quality. Click a bar to open the category explorer."
            />
            <div className="h-[400px] w-full min-w-0 sm:h-[440px]">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 8, right: 12, left: 44, bottom: 36 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "var(--foreground-muted)" }}
                      label={{
                        value: "Emissions (ktCO₂e)",
                        position: "insideBottom",
                        offset: -22,
                        fill: "var(--foreground-muted)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={48}
                      tick={{ fontSize: 11, fill: "var(--foreground-muted)" }}
                      label={{
                        value: "Category",
                        angle: -90,
                        position: "left",
                        offset: 4,
                        fill: "var(--foreground-muted)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const row = payload[0].payload.full as (typeof scope3Categories)[0];
                        return (
                          <div className="max-w-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs shadow-lg">
                            <div className="font-semibold text-[var(--foreground)]">
                              {row.id}. {row.name}
                            </div>
                            <div className="mt-1 text-[var(--foreground-muted)]">
                              {(row.tCO2e / 1000).toFixed(1)} ktCO₂e · {row.dataQuality} · {row.pctOfTotal}% of total
                            </div>
                            {row.id === 1 ? (
                              <div className="mt-2 text-[var(--warning)]">Largest category — focus supplier PCFs here.</div>
                            ) : null}
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="tCO2e"
                      radius={[0, 4, 4, 0]}
                      cursor="pointer"
                      onClick={(d) => {
                        const row = (d as { payload?: { full?: { id: number } } }).payload?.full;
                        if (row) onSelectCategory(row.id);
                      }}
                    >
                      {barData.map((entry) => (
                        <Cell key={entry.full.id} fill={qualityColorTier(entry.full.dataQuality)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl bg-[var(--muted)]/40 text-sm text-[var(--foreground-muted)]">
                  Loading chart…
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--foreground-muted)]">
              <LegendSwatch color="var(--success)" label="Primary data" />
              <LegendSwatch color="var(--warning)" label="Secondary" />
              <LegendSwatch color="var(--danger)" label="Spend-based" />
              <LegendSwatch color="var(--foreground-subtle)" label="Not assessed" />
            </div>
          </Scope3Panel>

          <div className="flex flex-col gap-4 xl:col-span-5">
            <Scope3Panel className="flex-1">
            <Scope3SectionLabel
              title="Regulatory deadlines"
              description="What is due next across BRSR, SEBI, MoEFCC / EPR, DGFT pilot filings, CDP, and SBTi."
              action={
              regulatory[0] ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                  onClick={() => setExecDrill({ kind: "regulatory", code: regulatory[0].code })}
                >
                  Open first filing detail
                </button>
              ) : null
            }
            />
              <ul className="max-h-[min(320px,50vh)] space-y-2 overflow-y-auto pr-1">
                {regulatory.map((r) => (
                  <li
                    key={r.code}
                    className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--foreground)]">{r.label}</div>
                      <div className="text-[11px] text-[var(--foreground-muted)]">Due {r.deadline}</div>
                      <p className="mt-1 text-xs leading-snug text-[var(--foreground-muted)]">{r.nextAction}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusButton status={r.status} />
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                        onClick={() => setExecDrill({ kind: "regulatory", code: r.code })}
                      >
                        Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Scope3Panel>

            <Scope3Panel>
              <Scope3SectionLabel
                title="SBTi check (latest year)"
                description="Inventory vs. your near-term trajectory allowance (illustrative)."
                action={
                  <button
                    type="button"
                    className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                    onClick={() => setExecDrill({ kind: "sbti" })}
                  >
                    Multi-year table
                  </button>
                }
              />
              {latestTrend ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-[var(--muted)]/35 px-3 py-2">
                    <div className="text-[11px] text-[var(--foreground-muted)]">FY {latestTrend.year} Scope 3</div>
                    <div className="mt-0.5 text-lg font-bold tabular-nums text-[var(--foreground)]">
                      {(latestTrend.scope3 / 1000).toFixed(1)}
                      <span className="text-xs font-normal text-[var(--foreground-muted)]"> kt</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[var(--muted)]/35 px-3 py-2">
                    <div className="text-[11px] text-[var(--foreground-muted)]">SBTi budget</div>
                    <div className="mt-0.5 text-lg font-bold tabular-nums text-[var(--foreground)]">
                      {(latestTrend.sbtiTarget / 1000).toFixed(1)}
                      <span className="text-xs font-normal text-[var(--foreground-muted)]"> kt</span>
                    </div>
                  </div>
                  <div
                    className={`col-span-2 rounded-lg border px-3 py-2 ${
                      sbtiGapKt > 0 ? "border-[var(--warning)] bg-[var(--warning-bg)]/25" : "border-[var(--success)] bg-[var(--success-bg)]/25"
                    }`}
                  >
                    <div className="text-[11px] font-medium text-[var(--foreground-muted)]">Gap (inventory − trajectory)</div>
                    <div
                      className={`text-xl font-bold tabular-nums ${sbtiGapKt > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}
                    >
                      {sbtiGapKt >= 0 ? "+" : ""}
                      {sbtiGapKt.toFixed(1)} ktCO₂e
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--foreground-muted)]">
                      {sbtiGapKt > 0
                        ? "Above trajectory — prioritise suppliers and logistics programmes."
                        : "On or under trajectory — keep verification discipline."}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--foreground-muted)]">No trend data.</p>
              )}
            </Scope3Panel>
          </div>
        </div>
      </div>

      {!board && (
        <Scope3Panel>
          <Scope3SectionLabel
            title="India export consignment queue"
            description="Embedded emissions and evidence for nominated India clearances (DGFT / CBIC pilot). Complete rows before filing deadlines."
            action={
              <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]">
                {exportConsignmentQueue.filter((r) => r.status !== "Complete").length} open · {exportConsignmentQueue.length}{" "}
                total
              </span>
            }
          />
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <div className="max-h-[min(280px,45vh)] overflow-auto">
              <table className="min-w-[640px] w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-[var(--muted)] text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)] shadow-sm">
                  <tr>
                    <th className="px-3 py-2.5">Batch</th>
                    <th className="px-3 py-2.5">Product</th>
                    <th className="px-3 py-2.5">HS (ITC-HS)</th>
                    <th className="px-3 py-2.5">Destination</th>
                    <th className="px-3 py-2.5 text-right">tCO₂e</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {exportConsignmentQueue.map((r, idx) => (
                    <tr
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      className={`cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--primary-muted)]/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${idx % 2 === 1 ? "bg-[var(--muted)]/20" : "bg-[var(--card)]"}`}
                      onClick={() => setExecDrill({ kind: "exportConsignment", id: r.id })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExecDrill({ kind: "exportConsignment", id: r.id });
                        }
                      }}
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.batchRef}</td>
                      <td className="max-w-[140px] truncate px-3 py-2" title={r.product}>
                        {r.product}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs">{r.cnCode}</td>
                      <td className="px-3 py-2 text-xs">{r.destination}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-xs">
                        {r.embeddedEmissionsTCO2e != null ? r.embeddedEmissionsTCO2e.toFixed(1) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            r.status === "Complete"
                              ? "bg-[var(--success-bg)] text-[var(--success)]"
                              : r.status === "Evidence pending"
                                ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                                : "bg-[var(--danger-bg)] text-[var(--danger)]"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-[var(--foreground-muted)]">{r.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {allowed.has("reports") ? (
            <div className="mt-4 text-right">
              <button
                type="button"
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
                onClick={() => onQuickNav({ kind: "view", view: "reports" })}
              >
                Open export consignment workbook in Reports →
              </button>
            </div>
          ) : null}
        </Scope3Panel>
      )}

      {!board && (
        <Scope3Panel>
          <Scope3SectionLabel
            title="Five-year trend"
            description="Scope 1–3 totals vs. SBTi trajectory (ktCO₂e), five fiscal years. Use this to explain volatility and direction of travel to leadership."
            action={
              <button
                type="button"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                onClick={() => setExecDrill({ kind: "trend" })}
              >
                Year table
              </button>
            }
          />
          <div className="h-[280px] w-full min-w-0 sm:h-[300px]">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChart} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                      background: "var(--surface)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Scope 1" stroke="#64748b" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="Scope 2" stroke="#0284c7" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="Scope 3" stroke="#1f4e79" strokeWidth={2} dot />
                  <Line
                    type="monotone"
                    dataKey="SBTi trajectory"
                    stroke="#16a34a"
                    strokeDasharray="5 3"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-[var(--muted)]/40 text-sm text-[var(--foreground-muted)]">
                Loading chart…
              </div>
            )}
          </div>
        </Scope3Panel>
      )}
      <Scope3DrilldownDrawer
        open={execDrill != null}
        onClose={() => setExecDrill(null)}
        size={execDrill?.kind === "kpi" ? "lg" : "md"}
        title={execDrill ? execDrillTitle(execDrill) : ""}
        subtitle={execDrill ? execDrillSubtitle(execDrill, data) : undefined}
      >
        {execDrill ? (
          <ExecutiveDrillBody
            drill={execDrill}
            data={data}
            sbtiGapKt={sbtiGapKt}
            onQuickNav={onQuickNav}
            allowed={allowed}
            onSelectCategory={onSelectCategory}
            onClose={() => setExecDrill(null)}
          />
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function execDrillTitle(d: ExecDrill): string {
  switch (d.kind) {
    case "kpi": {
      const labels: Record<ExecKpiId, string> = {
        total: "Total Scope 3 — inventory bridge & top drivers",
        primary: "Primary data coverage — tier roll-up & assurance",
        brsr: "BRSR readiness — dimension scorecard",
        verified: "Verified suppliers — submission funnel & top emitters",
      };
      return labels[d.id];
    }
    case "regulatory":
      return "Regulatory deadline detail";
    case "exportConsignment":
      return "Export consignment batch";
    case "sbti":
      return "SBTi vs inventory (multi-year)";
    case "trend":
      return "Consolidated inventory trend";
    case "alert":
      return "Compliance alert brief";
  }
}

function execDrillSubtitle(d: ExecDrill, data: Scope3MockData): string | undefined {
  switch (d.kind) {
    case "kpi": {
      const ex = data.executive;
      const co = data.company;
      switch (d.id) {
        case "total":
          return `${formatInt(ex.totalScope3TCO2e / 1000)} ktCO₂e · YoY ${ex.yoyScope3Pct >= 0 ? "+" : ""}${ex.yoyScope3Pct}% · Inventory close ${co.lastInventoryClose}`;
        case "primary":
          return `${ex.primaryDataCoveragePct}% mass-weighted primary-tier · ${data.inventoryMeta.reportingYearLabel}`;
        case "brsr":
          return `${ex.brsrReadinessPct}% modelled readiness · assurance dimensions below`;
        case "verified":
          return `${ex.verifiedSuppliers} verified / ${ex.totalSuppliers} in scope · desk review & portal submissions`;
        default:
          return undefined;
      }
    }
    case "regulatory":
      return data.regulatory.find((x) => x.code === d.code)?.label;
    case "exportConsignment": {
      const row = data.exportConsignmentQueue.find((x) => x.id === d.id);
      return row ? `${row.batchRef} · ${row.product}` : undefined;
    }
    case "alert":
      return data.complianceAlerts.find((x) => x.id === d.alertId)?.title;
    default:
      return undefined;
  }
}

function ExecutiveDrillBody({
  drill,
  data,
  sbtiGapKt,
  onQuickNav,
  allowed,
  onSelectCategory,
  onClose,
}: {
  drill: ExecDrill;
  data: Scope3MockData;
  sbtiGapKt: number;
  onQuickNav: (nav: ExecutiveQuickNav) => void;
  allowed: Set<NavViewId>;
  onSelectCategory: (id: number) => void;
  onClose: () => void;
}) {
  if (drill.kind === "kpi") {
    return (
      <ExecutiveKpiDeepDrill
        id={drill.id}
        data={data}
        allowed={allowed}
        onQuickNav={onQuickNav}
        onSelectCategory={onSelectCategory}
        onClose={onClose}
      />
    );
  }

  if (drill.kind === "regulatory") {
    const r = data.regulatory.find((x) => x.code === drill.code);
    if (!r) return <p className="text-sm text-[var(--foreground-muted)]">Filing not found.</p>;
    return (
      <div className="space-y-4">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Code</dt>
            <dd className="font-mono text-xs">{r.code}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Due</dt>
            <dd>{r.deadline}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Status</dt>
            <dd>{r.status}</dd>
          </div>
        </dl>
        <p className="text-sm text-[var(--foreground-muted)]">{r.nextAction}</p>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">RACI</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground-muted)]">
            <li>Accountable: CFO office · Responsible: ESG reporting lead</li>
            <li>Consulted: Legal, Trade compliance (DGFT / CBIC pilot), Procurement</li>
            <li>Informed: Board risk committee</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Evidence checklist</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground-muted)]">
            <li>Signed management representation letter</li>
            <li>Third-party assurance mapping (if applicable)</li>
            <li>Version-locked methodology memo + EF registry extract</li>
          </ul>
        </div>
        <DrillActions>
          {allowed.has("controls_audit") ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium hover:bg-[var(--muted)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "controls_audit" });
                onClose();
              }}
            >
              Risk & Compliance
            </button>
          ) : null}
          {allowed.has("reports") ? (
            <button
              type="button"
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "reports" });
                onClose();
              }}
            >
              Reports center
            </button>
          ) : null}
        </DrillActions>
      </div>
    );
  }

  if (drill.kind === "exportConsignment") {
    const row = data.exportConsignmentQueue.find((x) => x.id === drill.id);
    if (!row) return <p className="text-sm text-[var(--foreground-muted)]">Batch not found.</p>;
    return (
      <div className="space-y-4">
        <dl className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <dt className="text-xs text-[var(--foreground-muted)]">Batch</dt>
              <dd className="font-mono text-xs">{row.batchRef}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--foreground-muted)]">HS (ITC-HS)</dt>
              <dd className="font-mono text-xs">{row.cnCode}</dd>
            </div>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Destination</dt>
            <dd>{row.destination}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Embedded tCO₂e</dt>
            <dd className="tabular-nums">
              {row.embeddedEmissionsTCO2e != null ? row.embeddedEmissionsTCO2e.toFixed(1) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Due</dt>
            <dd>{row.due}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Status</dt>
            <dd>{row.status}</dd>
          </div>
        </dl>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Attestation trail</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-[var(--foreground-muted)]">
            <li>Plant-level emissions statement uploaded (PDF + XML stub)</li>
            <li>Customs broker confirms HS / ICEGATE mapping</li>
            <li>Finance attaches invoice linkage for mass balance</li>
          </ol>
        </div>
        <DrillActions>
          {allowed.has("reports") ? (
            <button
              type="button"
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "reports" });
                onClose();
              }}
            >
              Export consignment workbook in Reports
            </button>
          ) : null}
        </DrillActions>
      </div>
    );
  }

  if (drill.kind === "sbti") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--foreground-muted)]">
          Latest-year gap (inventory minus trajectory):{" "}
          <span className="font-semibold tabular-nums text-[var(--foreground)]">
            {sbtiGapKt >= 0 ? "+" : ""}
            {sbtiGapKt.toFixed(1)} ktCO₂e
          </span>
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--foreground-muted)]">
              <th className="py-2 pr-2">Year</th>
              <th className="py-2 pr-2 text-right">Scope 3 (kt)</th>
              <th className="py-2 text-right">Trajectory (kt)</th>
            </tr>
          </thead>
          <tbody>
            {data.trend.map((t) => (
              <tr key={t.year} className="border-b border-[var(--border)]/80">
                <td className="py-2 pr-2">{t.year}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{(t.scope3 / 1000).toFixed(1)}</td>
                <td className="py-2 text-right tabular-nums">{(t.sbtiTarget / 1000).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (drill.kind === "trend") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--foreground-muted)]">All values in ktCO₂e (thousands of tonnes).</p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--foreground-muted)]">
              <th className="py-2 pr-1">Year</th>
              <th className="py-2 pr-1 text-right">S1</th>
              <th className="py-2 pr-1 text-right">S2</th>
              <th className="py-2 pr-1 text-right">S3</th>
              <th className="py-2 text-right">SBTi</th>
            </tr>
          </thead>
          <tbody>
            {data.trend.map((t) => (
              <tr key={t.year} className="border-b border-[var(--border)]/80">
                <td className="py-2 pr-1">{t.year}</td>
                <td className="py-2 pr-1 text-right tabular-nums">{(t.scope1 / 1000).toFixed(1)}</td>
                <td className="py-2 pr-1 text-right tabular-nums">{(t.scope2 / 1000).toFixed(1)}</td>
                <td className="py-2 pr-1 text-right tabular-nums">{(t.scope3 / 1000).toFixed(1)}</td>
                <td className="py-2 text-right tabular-nums">{(t.sbtiTarget / 1000).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (drill.kind === "alert") {
    const a = data.complianceAlerts.find((x) => x.id === drill.alertId);
    if (!a) return <p className="text-sm text-[var(--foreground-muted)]">Alert not found.</p>;
    return (
      <div className="space-y-4">
        <p className="text-xs uppercase text-[var(--foreground-muted)]">Severity: {a.severity}</p>
        <p className="text-sm text-[var(--foreground)]">{a.detail}</p>
        {a.due ? <p className="text-xs text-[var(--foreground-muted)]">Due {a.due}</p> : null}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Resolution log</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground-muted)]">
            <li>Auto-tagged from supplier submission + export consignment queue</li>
            <li>Owner pinged in workflow (Slack / email stub)</li>
          </ul>
        </div>
        <DrillActions>
          {a.target === "category" && a.categoryId != null && allowed.has("categories") ? (
            <button
              type="button"
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
              onClick={() => {
                onQuickNav({ kind: "category", categoryId: a.categoryId! });
                onClose();
              }}
            >
              Open category {a.categoryId}
            </button>
          ) : null}
          {a.target === "supplier" && a.supplierName && allowed.has("suppliers") ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium hover:bg-[var(--muted)]"
              onClick={() => {
                onQuickNav({ kind: "supplier", supplierName: a.supplierName! });
                onClose();
              }}
            >
              Open supplier
            </button>
          ) : null}
          {a.target === "ai" && allowed.has("ai_insights") ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium hover:bg-[var(--muted)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "ai_insights" });
                onClose();
              }}
            >
              AI insights
            </button>
          ) : null}
        </DrillActions>
      </div>
    );
  }

  return null;
}

function DrillActions({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">{items}</div>;
}

function StatusButton({ status }: { status: string }) {
  const styles =
    status === "On Track"
      ? "border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]"
      : status === "At Risk"
        ? "border-[var(--warning)] bg-[var(--warning-bg)] text-[var(--warning)]"
        : "border-[var(--danger)] bg-[var(--danger-bg)] text-[var(--danger)]";
  return (
    <span
      role="status"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-lg border px-3 py-1.5 text-center text-xs font-semibold shadow-sm ${styles}`}
    >
      {status}
    </span>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BankPersonaId, BankScope3MockData, BorrowerRow, SectorEmissionRow } from "./types";
import { filterBorrowersForPersona } from "./personaAccess";
import { Scope3KpiStrip } from "../scope3-kpi";
import {
  Scope3DrilldownDrawer,
  Scope3Panel,
  Scope3SectionLabel,
  scope3InputClass,
  scope3SelectClass,
  scope3ToolbarSurface,
} from "../Pharma/scope3-ui";
import {
  bankPage,
  bankSegmentTabButtonProps,
  bankBtnPrimary,
  bankTable,
  bankTableShell,
  bankTd,
  bankTh,
} from "./banking-ui";

function fmtCr(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function fmtT(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function fmtMt(n: number): string {
  return (n / 1_000_000).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

type PathwayFilter = "all" | SectorEmissionRow["pathwayStatus"];
type SectorKpiDrillId = "book" | "exposure" | "attributed" | "alignment";

function pathwayStyle(status: SectorEmissionRow["pathwayStatus"]): string {
  if (status === "On Track") return "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/30 dark:text-emerald-200";
  if (status === "Off Track") return "bg-red-500/15 text-red-800 ring-1 ring-red-500/30 dark:text-red-200";
  return "bg-slate-500/15 text-slate-700 ring-1 ring-slate-500/25 dark:text-slate-300";
}

function pcafBadge(score: number): string {
  if (score <= 2) return "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200";
  if (score <= 3) return "bg-amber-500/20 text-amber-900 dark:text-amber-100";
  return "bg-red-500/20 text-red-900 dark:text-red-100";
}

function aiSeverityClass(sev: "Critical" | "High" | "Medium" | "Low"): string {
  if (sev === "Critical") return "bg-red-600/20 text-red-900 ring-1 ring-red-500/35 dark:text-red-100";
  if (sev === "High") return "bg-orange-500/20 text-orange-950 ring-1 ring-orange-500/30 dark:text-orange-100";
  if (sev === "Medium") return "bg-amber-500/15 text-amber-950 ring-1 ring-amber-500/25 dark:text-amber-100";
  return "bg-slate-500/15 text-slate-800 ring-1 ring-slate-500/25 dark:text-slate-200";
}

function magnitudePill(m: "High" | "Medium" | "Low"): string {
  if (m === "High") return "bg-red-500/15 text-red-800 dark:text-red-200";
  if (m === "Medium") return "bg-amber-500/15 text-amber-900 dark:text-amber-100";
  return "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}

function riskBar(label: string, value: number) {
  const pct = Math.min(100, (value / 10) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function barColorForPathway(s: SectorEmissionRow["pathwayStatus"]): string {
  if (s === "On Track") return "var(--success)";
  if (s === "Off Track") return "var(--danger)";
  return "var(--foreground-muted)";
}

function kpiDrillTitle(id: SectorKpiDrillId): string {
  switch (id) {
    case "book":
      return "Sectors in financed book — coverage & concentration";
    case "exposure":
      return "Financed exposure — sector concentration (₹ Cr)";
    case "attributed":
      return "Attributed financed emissions — MtCO₂e bridge";
    case "alignment":
      return "Pathway & WACI alignment vs IEA benchmarks";
    default:
      return "Sector KPI detail";
  }
}

type SectorAttributedBarRow = {
  label: string;
  full: string;
  mt: number;
  pathway: SectorEmissionRow["pathwayStatus"];
  selected: boolean;
};

function AttributedSectorsOverviewBarChart({
  rows,
  chartsReady,
  title,
  description,
  onPickSector,
  legendMode,
}: {
  rows: SectorAttributedBarRow[];
  chartsReady: boolean;
  title: string;
  description: string;
  onPickSector: (sectorFullName: string) => void;
  legendMode: "all" | "drill";
}) {
  const legend: ReactNode =
    legendMode === "drill" ? (
      <>
        <span className="font-medium text-[var(--success)]">On track</span>
        {" · "}
        <span className="font-medium text-[var(--danger)]">Off track</span>
        {" · "}
        <span className="font-medium text-[var(--foreground-muted)]">No pathway data</span>
        {" · "}
        <span className="font-medium text-[var(--primary)]">Selected sector</span>
      </>
    ) : (
      <>
        <span className="font-medium text-[var(--success)]">On track</span>
        {" · "}
        <span className="font-medium text-[var(--danger)]">Off track</span>
        {" · "}
        <span className="font-medium text-[var(--foreground-muted)]">No pathway data</span>
        {" · "}
        <span className="font-medium text-[var(--primary)]">Click a bar</span> to open sector detail
      </>
    );

  return (
    <Scope3Panel className="!p-4">
      <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--foreground-muted)]">{description}</p>
      <div className="mt-4 h-[min(320px,38vh)] w-full min-h-[200px] min-w-0">
        {chartsReady && rows.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--foreground-muted)" }}
                tickFormatter={(v) => `${Number(v).toFixed(1)} Mt`}
                label={{
                  value: "Attributed financed emissions (MtCO₂e)",
                  position: "insideBottom",
                  offset: -4,
                  fill: "var(--foreground-muted)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <YAxis type="category" dataKey="label" width={132} tick={{ fontSize: 10, fill: "var(--foreground-muted)" }} />
              <RTooltip
                cursor={{ fill: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const row = payload[0].payload as SectorAttributedBarRow;
                  return (
                    <div className="max-w-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs shadow-lg">
                      <div className="font-semibold text-[var(--foreground)]">{row.full}</div>
                      <div className="mt-1 text-[var(--foreground-muted)]">
                        {row.mt.toFixed(2)} MtCO₂e · {row.pathway}
                        {row.selected ? " · Selected" : ""}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="mt"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(item) => {
                  const p = (item as { payload?: { full?: string } }).payload;
                  if (p?.full) onPickSector(p.full);
                }}
              >
                {rows.map((entry, i) => (
                  <Cell
                    key={`${entry.full}-${i}`}
                    fill={entry.selected ? "var(--primary)" : barColorForPathway(entry.pathway)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 text-sm text-[var(--foreground-muted)]">
            {rows.length === 0 ? "No sectors match this filter." : "Preparing chart…"}
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] text-[var(--foreground-muted)]">Legend: {legend}</p>
    </Scope3Panel>
  );
}

export function SectorsExplorerView({
  data,
  persona,
  selectedSector,
  selectedBorrowerId,
  onSelectSector,
  onSelectBorrower,
}: {
  data: BankScope3MockData;
  persona: BankPersonaId;
  selectedSector: string | null;
  selectedBorrowerId: string | null;
  onSelectSector: (sector: string | null) => void;
  onSelectBorrower: (id: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"exposure" | "attributed" | "intensity" | "pcaf">("attributed");
  const [pathwayFilter, setPathwayFilter] = useState<PathwayFilter>("all");
  const [kpiDrill, setKpiDrill] = useState<SectorKpiDrillId | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const borrowers = useMemo(() => filterBorrowersForPersona(persona, data.borrowers), [data.borrowers, persona]);

  const sectorRows = useMemo(() => {
    const allowed = new Set(borrowers.map((b) => b.sector));
    return [...data.sectors].filter((s) => allowed.has(s.sector)).sort((a, b) => b.attributedTCO2e - a.attributedTCO2e);
  }, [data.sectors, borrowers]);

  const filteredSectors = useMemo(() => {
    if (pathwayFilter === "all") return sectorRows;
    return sectorRows.filter((s) => s.pathwayStatus === pathwayFilter);
  }, [sectorRows, pathwayFilter]);

  const activeSector = useMemo(() => data.sectors.find((s) => s.sector === selectedSector) ?? null, [data.sectors, selectedSector]);

  const sectorBorrowers = useMemo(() => {
    if (!selectedSector) return [];
    return borrowers
      .filter((b) => b.sector === selectedSector)
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.facilityType.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortKey === "exposure") return b.loanOutstandingINRCr - a.loanOutstandingINRCr;
        if (sortKey === "attributed") return b.attributedTCO2e - a.attributedTCO2e;
        if (sortKey === "intensity") return b.emissionIntensity - a.emissionIntensity;
        return a.pcafScore - b.pcafScore;
      });
  }, [borrowers, selectedSector, search, sortKey]);

  const drawerBorrower = useMemo(
    () => (selectedBorrowerId ? borrowers.find((b) => b.id === selectedBorrowerId) ?? null : null),
    [borrowers, selectedBorrowerId],
  );

  const totals = useMemo(() => {
    const exp = sectorRows.reduce((s, x) => s + x.exposureINRCr, 0);
    const att = sectorRows.reduce((s, x) => s + x.attributedTCO2e, 0);
    const onTrack = sectorRows.filter((x) => x.pathwayStatus === "On Track").length;
    const offTrack = sectorRows.filter((x) => x.pathwayStatus === "Off Track").length;
    const noData = sectorRows.filter((x) => x.pathwayStatus === "No Data").length;
    return { sectors: sectorRows.length, exposure: exp, attributed: att, onTrack, offTrack, noData };
  }, [sectorRows]);

  const borrowersForSectorStats = useMemo(() => {
    if (!selectedSector) return [];
    return borrowers.filter((b) => b.sector === selectedSector);
  }, [borrowers, selectedSector]);

  const sectorDrillAnalytics = useMemo(() => {
    if (!selectedSector) return null;
    const scenario = data.sectorScenarioMatrix.find((s) => s.sector === selectedSector) ?? null;
    const climate = data.climateRisks.filter((r) => r.sectors.includes(selectedSector));
    const green = data.greenFinance.greenLoanRows.filter((g) => g.sector === selectedSector);
    const borrowerNames = new Set(borrowersForSectorStats.map((b) => b.name));
    const insights = data.aiInsights.filter(
      (i) => i.linkedEntity === selectedSector || borrowerNames.has(i.linkedEntity),
    );
    const list = borrowersForSectorStats;
    const n = list.length;
    if (n === 0) {
      return {
        scenario,
        climate,
        green,
        insights,
        borrowerCount: 0,
        avgPcaf: null as number | null,
        sbtiPct: null as number | null,
        brsrPct: null as number | null,
        redFlagCount: 0,
        engagementCounts: {} as Record<string, number>,
        facilityCounts: {} as Record<string, number>,
        avgAttributionPct: null as number | null,
        totalLoanINRCr: 0,
        topByAttributed: [] as BorrowerRow[],
      };
    }
    const avgPcaf = list.reduce((s, b) => s + b.pcafScore, 0) / n;
    const sbtiPct = (list.filter((b) => b.sbtiCommitted).length / n) * 100;
    const brsrPct = (list.filter((b) => b.brsrDisclosed).length / n) * 100;
    const redFlagCount = list.filter((b) => b.redFlags !== "none").length;
    const engagementCounts = list.reduce<Record<string, number>>((acc, b) => {
      acc[b.engagement] = (acc[b.engagement] ?? 0) + 1;
      return acc;
    }, {});
    const facilityCounts = list.reduce<Record<string, number>>((acc, b) => {
      acc[b.facilityType] = (acc[b.facilityType] ?? 0) + 1;
      return acc;
    }, {});
    const avgAttributionPct = list.reduce((s, b) => s + b.attributionFactorPct, 0) / n;
    const totalLoanINRCr = list.reduce((s, b) => s + b.loanOutstandingINRCr, 0);
    const topByAttributed = [...list].sort((a, b) => b.attributedTCO2e - a.attributedTCO2e).slice(0, 5);
    return {
      scenario,
      climate,
      green,
      insights,
      borrowerCount: n,
      avgPcaf,
      sbtiPct,
      brsrPct,
      redFlagCount,
      engagementCounts,
      facilityCounts,
      avgAttributionPct,
      totalLoanINRCr,
      topByAttributed,
    };
  }, [selectedSector, data.climateRisks, data.sectorScenarioMatrix, data.greenFinance.greenLoanRows, data.aiInsights, borrowersForSectorStats]);

  const sectorPortfolioWeight = useMemo(() => {
    if (!activeSector || totals.exposure <= 0) return null;
    return {
      exposurePct: (activeSector.exposureINRCr / totals.exposure) * 100,
      attributedPct: totals.attributed > 0 ? (activeSector.attributedTCO2e / totals.attributed) * 100 : 0,
    };
  }, [activeSector, totals]);

  const barChartData = useMemo(
    () =>
      [...filteredSectors]
        .sort((a, b) => b.attributedTCO2e - a.attributedTCO2e)
        .map((s) => ({
          label: s.sector.length > 22 ? `${s.sector.slice(0, 20)}…` : s.sector,
          full: s.sector,
          mt: s.attributedTCO2e / 1_000_000,
          pathway: s.pathwayStatus,
          selected: selectedSector != null && s.sector === selectedSector,
        })) satisfies SectorAttributedBarRow[],
    [filteredSectors, selectedSector],
  );

  const insightForSector = (s: SectorEmissionRow) => {
    const gap = s.waciTCO2ePerCr - s.ieaBenchmarkWaci;
    if (gap > 400) return "Intensity materially above IEA NZ benchmark — prioritise transition finance and data upgrades.";
    if (gap > 150) return "Above benchmark — engagement and PCAF ladder climb recommended.";
    if (gap < -50) return "Below benchmark — verify attribution boundary and avoid complacency on physical risk.";
    return "Near benchmark — maintain coverage and monitor pathway execution.";
  };

  const insightForBorrower = (b: BorrowerRow) => {
    if (b.redFlags !== "none") return `Red flag: ${b.redFlags.replace(/-/g, " ")} — align covenants with transition milestones.`;
    if (b.pcafScore >= 4) return "PCAF score 4–5 — improve primary data (metered energy, audited CDP) before next disclosure cycle.";
    if (b.sbtiCommitted) return "SBTi-aligned borrower — leverage for green co-lending and NZBA evidence.";
    return "Stable profile — routine monitoring; tie engagement to sector NZ pathway.";
  };

  const pathwayFilters: { id: PathwayFilter; label: string }[] = [
    { id: "all", label: "All sectors" },
    { id: "On Track", label: "On track" },
    { id: "Off Track", label: "Off track" },
    { id: "No Data", label: "No pathway data" },
  ];

  return (
    <div className={bankPage}>
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Key metrics</p>
        <Scope3KpiStrip
          cols="sm:grid-cols-2 xl:grid-cols-4"
          items={[
            {
              label: "Sectors in book",
              value: String(totals.sectors),
              sub: "Distinct industry segments with financed exposure in your persona view.",
              tone: "teal",
              onClick: () => setKpiDrill("book"),
            },
            {
              label: "Financed exposure",
              value: `₹${fmtCr(totals.exposure)} cr`,
              sub: "Aggregate outstanding across visible sectors (NZBA / PCAF boundary illustrative).",
              tone: "blue",
              onClick: () => setKpiDrill("exposure"),
            },
            {
              label: "Attributed emissions",
              value: `${fmtMt(totals.attributed)} Mt`,
              sub: "Sum of sector attributed financed emissions — reconciles to executive & GHG views.",
              tone: "amber",
              onClick: () => setKpiDrill("attributed"),
            },
            {
              label: "Pathway posture",
              value: `${totals.onTrack} / ${totals.offTrack} / ${totals.noData}`,
              sub: "On track · Off track · No pathway data (NZBA-style monitoring).",
              tone: "emerald",
              onClick: () => setKpiDrill("alignment"),
            },
          ]}
        />
      </div>

      <div className={`${scope3ToolbarSurface} flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Filters</div>
          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">Refine the sector list below; KPI cards above stay on the full book.</p>
        </div>
        <div
          className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-1 shadow-sm ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]"
          role="group"
          aria-label="Pathway filters"
        >
          {pathwayFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              {...bankSegmentTabButtonProps(pathwayFilter === f.id)}
              onClick={() => {
                setPathwayFilter(f.id);
                onSelectBorrower(null);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!selectedSector ? (
        <div className="space-y-6">
          <AttributedSectorsOverviewBarChart
            rows={barChartData}
            chartsReady={chartsReady}
            title="All sectors — attributed financed emissions"
            description="Persona-filtered book; respects pathway filters below. Bar length is MtCO₂e attributed to each sector — click a bar or a sector tile to drill in."
            onPickSector={(name) => {
              onSelectSector(name);
              onSelectBorrower(null);
            }}
            legendMode="all"
          />
          <Scope3Panel>
            <Scope3SectionLabel
              title="Sectors covered"
              description="Overview chart above; tiles match the same filter — open a sector for portfolio context, company table, and sector-specific signals."
            />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSectors.map((s) => {
              const waciGap = s.waciTCO2ePerCr - s.ieaBenchmarkWaci;
              return (
                <button
                  key={s.sector}
                  type="button"
                  onClick={() => {
                    onSelectSector(s.sector);
                    onSelectBorrower(null);
                  }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-sm ring-1 ring-slate-900/[0.04] transition hover:border-[var(--primary)]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] dark:ring-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="truncate text-base font-bold text-[var(--foreground)]">{s.sector}</div>
                      <span
                        className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${pathwayStyle(s.pathwayStatus)}`}
                      >
                        {s.pathwayStatus}
                      </span>
                    </div>
                    <div className="shrink-0 text-right text-[10px] text-[var(--foreground-muted)]">{s.borrowers} borrowers</div>
                  </div>
                  <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/35 p-3 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--foreground-muted)]">
                      Bank investment (financed exposure)
                    </div>
                    <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <div className="font-mono text-lg font-bold tabular-nums text-[var(--foreground)]">₹{fmtCr(s.exposureINRCr)} cr</div>
                      <div className="text-[11px] font-medium text-[var(--foreground-muted)]">
                        {totals.exposure > 0 ? `${((s.exposureINRCr / totals.exposure) * 100).toFixed(1)}% of portfolio book` : "—"}
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] leading-snug text-[var(--foreground-muted)]">
                      Outstanding / on-balance financed book attributed to this sector (PCAF boundary — illustrative).
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-[var(--foreground-muted)]">Attributed</div>
                      <div className="font-mono font-semibold text-[var(--foreground)]">{fmtT(s.attributedTCO2e)} t</div>
                    </div>
                    <div>
                      <div className="text-[var(--foreground-muted)]">WACI</div>
                      <div className="font-mono text-[var(--foreground)]">{fmtT(s.waciTCO2ePerCr)}/cr</div>
                    </div>
                    <div>
                      <div className="text-[var(--foreground-muted)]">vs IEA</div>
                      <div className={`font-mono font-semibold ${waciGap > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>
                        {waciGap > 0 ? "+" : ""}
                        {fmtT(waciGap)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[11px] leading-snug text-[var(--foreground-muted)]">{insightForSector(s)}</p>
                  <p className="mt-3 text-[11px] font-semibold text-[var(--primary)]">Open companies →</p>
                </button>
              );
            })}
          </div>
        </Scope3Panel>
        </div>
      ) : (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onSelectSector(null);
                onSelectBorrower(null);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              ← All sectors
            </button>
            <div className="text-sm text-[var(--foreground-muted)]">
              Sectors / <span className="font-semibold text-[var(--foreground)]">{selectedSector}</span>
            </div>
          </div>

          {activeSector ? (
            <div className="space-y-6">
              <AttributedSectorsOverviewBarChart
                rows={barChartData}
                chartsReady={chartsReady}
                title="Portfolio context — attributed MtCO₂e"
                description="Current sector is highlighted. Pathway colours match the list view legend — click a bar to switch sector."
                onPickSector={(name) => {
                  onSelectSector(name);
                  onSelectBorrower(null);
                }}
                legendMode="drill"
              />

              <div className="grid gap-4 lg:grid-cols-3">
                <Scope3Panel className="!p-4 lg:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">{activeSector.sector}</h3>
                  <span
                    className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${pathwayStyle(activeSector.pathwayStatus)}`}
                  >
                    {activeSector.pathwayStatus}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">{insightForSector(activeSector)}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">
                      Bank investment (financed exposure)
                    </div>
                    <div className="mt-1 font-mono text-xl font-bold text-[var(--foreground)]">₹{fmtCr(activeSector.exposureINRCr)} cr</div>
                    <p className="mt-1 text-[10px] text-[var(--foreground-muted)]">
                      {sectorPortfolioWeight != null && totals.exposure > 0
                        ? `${sectorPortfolioWeight.exposurePct.toFixed(1)}% of visible portfolio book (₹${fmtCr(totals.exposure)} cr total).`
                        : "Outstanding financed book in this sector — PCAF boundary illustrative."}
                    </p>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">Attributed emissions</div>
                    <div className="mt-1 font-mono text-xl font-bold text-[var(--foreground)]">{fmtT(activeSector.attributedTCO2e)} tCO₂e</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">WACI (tCO₂e/₹cr)</div>
                    <div className="mt-1 font-mono text-lg text-[var(--foreground)]">{fmtT(activeSector.waciTCO2ePerCr)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">IEA benchmark WACI</div>
                    <div className="mt-1 font-mono text-lg text-[var(--foreground)]">{fmtT(activeSector.ieaBenchmarkWaci)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">BRSR reported</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--foreground)]">{activeSector.brsrReported ? "Yes" : "No / partial"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">Transition plans (count)</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--foreground)]">{activeSector.transitionPlansCount}</div>
                  </div>
                </div>
              </Scope3Panel>
              <Scope3Panel className="!p-4">
                <div className="text-xs font-semibold uppercase text-[var(--foreground-muted)]">Risk profile</div>
                <div className="mt-4 space-y-4">
                  {riskBar("Physical", activeSector.physicalRisk1to10)}
                  {riskBar("Transition", activeSector.transitionRisk1to10)}
                </div>
                <div className="mt-6 h-28 w-full min-w-0">
                  <div className="mb-1 text-[10px] font-semibold uppercase text-[var(--foreground-muted)]">Attributed trend (Mt, illustrative)</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activeSector.sparkTrend.map((v, i) => ({ i: `P${i + 1}`, vMt: v / 1000 }))}
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <Line type="monotone" dataKey="vMt" stroke="var(--foreground-muted)" strokeWidth={2} dot />
                      <RTooltip formatter={(value) => [`${Number(value).toFixed(2)} Mt`, "Attributed"]} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Scope3Panel>
            </div>

            {sectorDrillAnalytics && activeSector ? (
              <div className="space-y-4">
                <Scope3SectionLabel title="Relevant data for this sector" />
                <Scope3Panel className="!p-4">
                  <h4 className="text-sm font-bold text-[var(--foreground)]">Book & data quality snapshot</h4>
                  <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                    Rolled up from obligors visible to your persona, plus climate register, green finance, and AI signals linked to this sector or its borrowers.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                      <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Share of portfolio exposure</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">
                        {sectorPortfolioWeight != null ? `${sectorPortfolioWeight.exposurePct.toFixed(1)}%` : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                      <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Share of attributed emissions</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">
                        {sectorPortfolioWeight != null ? `${sectorPortfolioWeight.attributedPct.toFixed(1)}%` : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                      <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Obligors (persona book)</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{sectorDrillAnalytics.borrowerCount}</div>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                      <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Outstanding (sum, ₹ cr)</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{fmtCr(sectorDrillAnalytics.totalLoanINRCr)}</div>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                      <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Avg PCAF score</div>
                      <div className="mt-1 flex items-center gap-2">
                        {sectorDrillAnalytics.avgPcaf != null ? (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${pcafBadge(sectorDrillAnalytics.avgPcaf)}`}>
                            {sectorDrillAnalytics.avgPcaf.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--foreground-muted)]">—</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                      <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">SBTi committed</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">
                        {sectorDrillAnalytics.sbtiPct != null ? `${sectorDrillAnalytics.sbtiPct.toFixed(0)}%` : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                      <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">BRSR disclosed</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">
                        {sectorDrillAnalytics.brsrPct != null ? `${sectorDrillAnalytics.brsrPct.toFixed(0)}%` : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3">
                      <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Red-flag borrowers</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{sectorDrillAnalytics.redFlagCount}</div>
                    </div>
                    {sectorDrillAnalytics.avgAttributionPct != null ? (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-3 sm:col-span-2 lg:col-span-4">
                        <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Avg attribution factor</div>
                        <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{sectorDrillAnalytics.avgAttributionPct.toFixed(1)}%</div>
                      </div>
                    ) : null}
                  </div>
                </Scope3Panel>

                <div className="grid gap-4 lg:grid-cols-2">
                  {sectorDrillAnalytics.scenario ? (
                    <Scope3Panel className="!p-4">
                      <h4 className="text-sm font-bold text-[var(--foreground)]">Scenario heat (NZBA / RBI matrix)</h4>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">Illustrative sector scores under net-zero, announced pledges, and adverse stress paths.</p>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                          <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Net zero</div>
                          <div className="mt-1 font-mono text-xl font-bold text-[var(--foreground)]">{sectorDrillAnalytics.scenario.netZero}</div>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                          <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">STEPS</div>
                          <div className="mt-1 font-mono text-xl font-bold text-[var(--foreground)]">{sectorDrillAnalytics.scenario.steps}</div>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                          <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">RBI adverse</div>
                          <div className="mt-1 font-mono text-xl font-bold text-[var(--foreground)]">{sectorDrillAnalytics.scenario.rbiAdverse}</div>
                        </div>
                      </div>
                    </Scope3Panel>
                  ) : (
                    <Scope3Panel className="!p-4">
                      <h4 className="text-sm font-bold text-[var(--foreground)]">Scenario heat</h4>
                      <p className="mt-2 text-xs text-[var(--foreground-muted)]">No matrix row is defined for this sector in the mock dataset.</p>
                    </Scope3Panel>
                  )}

                  <Scope3Panel className="!p-4">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Engagement mix</h4>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">Count of obligors by engagement stage in this sector slice.</p>
                    <div className="mt-4 space-y-3">
                      {sectorDrillAnalytics.borrowerCount === 0 ? (
                        <p className="text-sm text-[var(--foreground-muted)]">No obligors in this sector for your persona — switch persona or sector.</p>
                      ) : (
                        Object.entries(sectorDrillAnalytics.engagementCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([label, count]) => {
                            const pct = (count / sectorDrillAnalytics.borrowerCount) * 100;
                            return (
                              <div key={label} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-semibold text-[var(--foreground-muted)]">
                                  <span className="text-[var(--foreground)]">{label}</span>
                                  <span>
                                    {count} ({pct.toFixed(0)}%)
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </Scope3Panel>
                </div>

                {sectorDrillAnalytics.borrowerCount > 0 ? (
                  <Scope3Panel className="!p-4">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Facility type mix</h4>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">How facilities are distributed across obligors in this sector.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(sectorDrillAnalytics.facilityCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([ft, c]) => (
                          <span
                            key={ft}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                          >
                            <span>{ft}</span>
                            <span className="font-mono text-[var(--foreground-muted)]">{c}</span>
                          </span>
                        ))}
                    </div>
                  </Scope3Panel>
                ) : null}

                {sectorDrillAnalytics.borrowerCount > 0 && sectorDrillAnalytics.topByAttributed.length > 0 ? (
                  <Scope3Panel className="!p-4">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Top obligors by attributed emissions</h4>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">Click a name to open the same borrower drawer as the table below.</p>
                    <div className={`mt-3 ${bankTableShell}`}>
                      <table className={bankTable}>
                        <thead>
                          <tr>
                            <th className={bankTh}>Company</th>
                            <th className={bankTh}>Attributed tCO₂e</th>
                            <th className={bankTh}>PCAF</th>
                            <th className={bankTh}>Engagement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectorDrillAnalytics.topByAttributed.map((b) => (
                            <tr key={b.id} className="cursor-pointer hover:bg-[var(--muted)]/40" onClick={() => onSelectBorrower(b.id)}>
                              <td className={bankTd}>
                                <span className="font-medium text-[var(--foreground)]">{b.name}</span>
                              </td>
                              <td className={`${bankTd} font-mono text-xs`}>{fmtT(b.attributedTCO2e)}</td>
                              <td className={bankTd}>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pcafBadge(b.pcafScore)}`}>{b.pcafScore}</span>
                              </td>
                              <td className={`${bankTd} text-xs text-[var(--foreground-muted)]`}>{b.engagement}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Scope3Panel>
                ) : null}

                {sectorDrillAnalytics.climate.length > 0 ? (
                  <Scope3Panel className="!p-4">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Climate risk register (tagged to this sector)</h4>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">Rows from the bank-wide register where this sector appears in the exposure tags.</p>
                    <div className={`mt-3 ${bankTableShell}`}>
                      <table className={bankTable}>
                        <thead>
                          <tr>
                            <th className={bankTh}>Risk</th>
                            <th className={bankTh}>Magnitude</th>
                            <th className={bankTh}>Horizon</th>
                            <th className={bankTh}>Exposure ₹ cr</th>
                            <th className={bankTh}>Mitigation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectorDrillAnalytics.climate.map((r) => (
                            <tr key={r.id}>
                              <td className={bankTd}>
                                <div className="font-medium text-[var(--foreground)]">{r.riskType}</div>
                                <div className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">
                                  RBI/TCFD disclosed: {r.rbiTcfdDisclosure ? "Yes" : "No"} · AR: {r.disclosedInAnnualReport ? "Yes" : "No"}
                                </div>
                              </td>
                              <td className={bankTd}>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${magnitudePill(r.magnitude)}`}>{r.magnitude}</span>
                              </td>
                              <td className={`${bankTd} text-xs`}>{r.horizon}</td>
                              <td className={`${bankTd} font-mono text-xs`}>{fmtCr(r.exposureINRCr)}</td>
                              <td className={`${bankTd} text-xs text-[var(--foreground-muted)]`}>{r.mitigation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Scope3Panel>
                ) : null}

                {sectorDrillAnalytics.green.length > 0 ? (
                  <Scope3Panel className="!p-4">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Green finance in this sector</h4>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">Verified and in-review green lines mapped to the same sector label.</p>
                    <div className={`mt-3 ${bankTableShell}`}>
                      <table className={bankTable}>
                        <thead>
                          <tr>
                            <th className={bankTh}>Borrower</th>
                            <th className={bankTh}>Type</th>
                            <th className={bankTh}>Amount ₹ cr</th>
                            <th className={bankTh}>Verification</th>
                            <th className={bankTh}>UoP align %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectorDrillAnalytics.green.map((g) => (
                            <tr key={g.id}>
                              <td className={`${bankTd} font-medium`}>{g.borrower}</td>
                              <td className={`${bankTd} text-xs`}>{g.greenType}</td>
                              <td className={`${bankTd} font-mono text-xs`}>{fmtCr(g.amountINRCr)}</td>
                              <td className={`${bankTd} text-xs`}>{g.verification}</td>
                              <td className={`${bankTd} font-mono text-xs`}>{g.uopAlignmentPct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Scope3Panel>
                ) : null}

                {sectorDrillAnalytics.insights.length > 0 ? (
                  <Scope3Panel className="!p-4">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">AI signals for this sector</h4>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">Insights whose linked entity is this sector or an obligor in the table below.</p>
                    <ul className="mt-4 space-y-3">
                      {sectorDrillAnalytics.insights.map((ins) => (
                        <li key={ins.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${aiSeverityClass(ins.severity)}`}>{ins.severity}</span>
                                <span className="font-semibold text-[var(--foreground)]">{ins.title}</span>
                              </div>
                              <p className="mt-1 text-xs text-[var(--foreground-muted)]">{ins.detail}</p>
                              <p className="mt-2 text-xs font-medium text-[var(--foreground)]">Suggested: {ins.recommendedAction}</p>
                            </div>
                            <div className="shrink-0 text-right text-[10px] text-[var(--foreground-muted)]">
                              {ins.confidencePct}% conf.
                              <div className="mt-1 font-medium text-[var(--foreground)]">{ins.linkedEntity}</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Scope3Panel>
                ) : null}
              </div>
            ) : null}

            </div>
          ) : null}

          <Scope3Panel className="!p-0">
            <div className={`flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between ${scope3ToolbarSurface}`}>
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">Companies in {selectedSector}</div>
                <div className="text-xs text-[var(--foreground-muted)]">Loan value, PCAF attribution, intensity, engagement — click a row for deep drill-down.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="search"
                  placeholder="Search company or facility…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${scope3InputClass} min-w-[200px]`}
                />
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} className={scope3SelectClass}>
                  <option value="attributed">Sort: Attributed tCO₂e</option>
                  <option value="exposure">Sort: Outstanding</option>
                  <option value="intensity">Sort: Intensity</option>
                  <option value="pcaf">Sort: PCAF score</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full border-collapse text-sm">
                <thead className="bg-[var(--muted)]/50 text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
                  <tr>
                    <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Company</th>
                    <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Facility</th>
                    <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Outstanding ₹ cr</th>
                    <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Attributed tCO₂e</th>
                    <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Intensity</th>
                    <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">PCAF</th>
                    <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">ESG</th>
                    <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorBorrowers.map((b) => {
                    const share = activeSector && activeSector.attributedTCO2e > 0 ? (b.attributedTCO2e / activeSector.attributedTCO2e) * 100 : 0;
                    return (
                      <tr
                        key={b.id}
                        className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--muted)]/40"
                        onClick={() => onSelectBorrower(b.id)}
                      >
                        <td className="px-3 py-2">
                          <div className="font-medium text-[var(--foreground)]">{b.name}</div>
                          <div className="text-[11px] text-[var(--foreground-muted)]">{share.toFixed(1)}% of sector attributed</div>
                        </td>
                        <td className="px-3 py-2 text-[var(--foreground-muted)]">{b.facilityType}</td>
                        <td className="px-3 py-2 font-mono text-xs">{fmtCr(b.loanOutstandingINRCr)}</td>
                        <td className="px-3 py-2 font-mono text-xs">{fmtT(b.attributedTCO2e)}</td>
                        <td className="px-3 py-2 font-mono text-xs">{b.emissionIntensity}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pcafBadge(b.pcafScore)}`}>{b.pcafScore}</span>
                        </td>
                        <td className="px-3 py-2 text-xs font-semibold">{b.esgRating}</td>
                        <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{b.engagement}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {sectorBorrowers.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--foreground-muted)]">No companies match this filter for your persona.</div>
            ) : null}
          </Scope3Panel>
        </section>
      )}

      <Scope3DrilldownDrawer
        open={kpiDrill != null}
        title={kpiDrill ? kpiDrillTitle(kpiDrill) : ""}
        subtitle={kpiDrill ? `${data.company.shortName} · persona slice` : undefined}
        onClose={() => setKpiDrill(null)}
        size="lg"
        footer={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={bankBtnPrimary} onClick={() => setKpiDrill(null)}>
              Close
            </button>
          </div>
        }
      >
        {kpiDrill === "book" ? (
          <SectorKpiDrillBook sectorRows={sectorRows} onPickSector={(name) => { setKpiDrill(null); onSelectSector(name); onSelectBorrower(null); }} />
        ) : null}
        {kpiDrill === "exposure" ? <SectorKpiDrillExposure sectorRows={sectorRows} /> : null}
        {kpiDrill === "attributed" ? <SectorKpiDrillAttributed sectorRows={sectorRows} total={totals.attributed} /> : null}
        {kpiDrill === "alignment" ? <SectorKpiDrillAlignment sectorRows={sectorRows} /> : null}
      </Scope3DrilldownDrawer>

      <Scope3DrilldownDrawer
        open={drawerBorrower != null}
        title={drawerBorrower?.name ?? ""}
        subtitle={drawerBorrower ? `${drawerBorrower.sector} · ${drawerBorrower.facilityType}` : undefined}
        onClose={() => onSelectBorrower(null)}
        size="lg"
        footer={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white"
              onClick={() => onSelectBorrower(null)}
            >
              Close
            </button>
            <button type="button" className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">
              Add to engagement pack
            </button>
          </div>
        }
      >
        {drawerBorrower ? (
          <div className="space-y-6 text-sm text-[var(--foreground-muted)]">
            <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-xs leading-relaxed text-[var(--foreground)]">
              {insightForBorrower(drawerBorrower)}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Loan outstanding</div>
                <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">₹{fmtCr(drawerBorrower.loanOutstandingINRCr)} cr</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Attributed tCO₂e</div>
                <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{fmtT(drawerBorrower.attributedTCO2e)}</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Borrower Scope 1+2</div>
                <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{fmtT(drawerBorrower.scope12TCO2e)}</div>
              </div>
              {drawerBorrower.scope3TCO2e != null ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Scope 3 (ref.)</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{fmtT(drawerBorrower.scope3TCO2e)}</div>
                </div>
              ) : null}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Emission intensity</div>
                <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{drawerBorrower.emissionIntensity} tCO₂e/₹cr</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Attribution factor</div>
                <div className="mt-1 font-mono text-lg font-semibold text-[var(--foreground)]">{drawerBorrower.attributionFactorPct}%</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">PCAF data quality</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${pcafBadge(drawerBorrower.pcafScore)}`}>Score {drawerBorrower.pcafScore}</span>
                  <span className="text-xs">{drawerBorrower.ratingAgency}</span>
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">ESG rating</div>
                <div className="mt-1 text-lg font-bold text-[var(--foreground)]">{drawerBorrower.esgRating}</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Maturity</div>
                <div className="mt-1 text-[var(--foreground)]">{drawerBorrower.maturity}</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:col-span-2">
                <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Engagement & disclosure</div>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="flex justify-between gap-2">
                    <dt>Engagement stage</dt>
                    <dd className="font-medium text-[var(--foreground)]">{drawerBorrower.engagement}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>SBTi committed</dt>
                    <dd className="font-medium text-[var(--foreground)]">{drawerBorrower.sbtiCommitted ? "Yes" : "No"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>BRSR disclosed</dt>
                    <dd className="font-medium text-[var(--foreground)]">{drawerBorrower.brsrDisclosed ? "Yes" : "No"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Red flags</dt>
                    <dd className="font-medium text-[var(--foreground)]">{drawerBorrower.redFlags}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Treasury sleeve</dt>
                    <dd className="font-medium text-[var(--foreground)]">{drawerBorrower.treasuryRelevant ? "Yes" : "No"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>RM focus sector</dt>
                    <dd className="font-medium text-[var(--foreground)]">{drawerBorrower.rmFocusSector}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function SectorKpiDrillBook({
  sectorRows,
  onPickSector,
}: {
  sectorRows: SectorEmissionRow[];
  onPickSector: (name: string) => void;
}) {
  const top = useMemo(() => [...sectorRows].sort((a, b) => b.attributedTCO2e - a.attributedTCO2e).slice(0, 8), [sectorRows]);
  const hhi = useMemo(() => {
    const t = sectorRows.reduce((s, x) => s + x.exposureINRCr, 0);
    if (t <= 0) return 0;
    const sumSq = sectorRows.reduce((s, x) => s + (x.exposureINRCr / t) ** 2, 0);
    return sumSq * 10000;
  }, [sectorRows]);
  return (
    <div className="space-y-6 text-sm">
      <p className="leading-relaxed text-[var(--foreground-muted)]">
        Banks manage climate risk by <span className="font-medium text-[var(--foreground)]">industry segment</span>: each row below is a financed sector slice with borrower count and
        attributed emissions. HHI (Herfindahl) on exposure is a simple concentration read — higher = fewer sectors dominate the book.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
          <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Sectors</div>
          <div className="mt-1 text-xl font-bold tabular-nums text-[var(--foreground)]">{sectorRows.length}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
          <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Borrowers (sum)</div>
          <div className="mt-1 text-xl font-bold tabular-nums text-[var(--foreground)]">{sectorRows.reduce((s, x) => s + x.borrowers, 0)}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
          <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Exposure HHI ×10⁴</div>
          <div className="mt-1 text-xl font-bold tabular-nums text-[var(--foreground)]">{hhi.toFixed(0)}</div>
        </div>
      </div>
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Top sectors by attributed emissions</h3>
        <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2.5">Sector</th>
                <th className="px-3 py-2.5 text-right">Borrowers</th>
                <th className="px-3 py-2.5 text-right">Mt</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {top.map((s) => (
                <tr key={s.sector} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-medium text-[var(--foreground)]">{s.sector}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{s.borrowers}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{(s.attributedTCO2e / 1_000_000).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="text-xs font-semibold text-[var(--primary)] hover:underline" onClick={() => onPickSector(s.sector)}>
                      Open sector
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SectorKpiDrillExposure({ sectorRows }: { sectorRows: SectorEmissionRow[] }) {
  const total = sectorRows.reduce((s, x) => s + x.exposureINRCr, 0);
  const rows = useMemo(() => [...sectorRows].sort((a, b) => b.exposureINRCr - a.exposureINRCr).slice(0, 10), [sectorRows]);
  return (
    <div className="space-y-6 text-sm">
      <p className="leading-relaxed text-[var(--foreground-muted)]">
        Exposure concentration drives <span className="font-medium text-[var(--foreground)]">transition risk capital</span> and engagement capacity. The table ranks sectors by
        outstanding ₹ Cr in this persona slice.
      </p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
        <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Total financed exposure</div>
        <div className="mt-1 font-mono text-2xl font-bold text-[var(--foreground)]">₹{fmtCr(total)} cr</div>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            <tr>
              <th className="px-3 py-2.5">Sector</th>
              <th className="px-3 py-2.5 text-right">₹ Cr</th>
              <th className="px-3 py-2.5 text-right">% book</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.sector} className="border-t border-[var(--border)]">
                <td className="px-3 py-2 font-medium text-[var(--foreground)]">{s.sector}</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">{fmtCr(s.exposureINRCr)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{total > 0 ? ((s.exposureINRCr / total) * 100).toFixed(1) : "0.0"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectorKpiDrillAttributed({ sectorRows, total }: { sectorRows: SectorEmissionRow[]; total: number }) {
  const rows = useMemo(() => [...sectorRows].sort((a, b) => b.attributedTCO2e - a.attributedTCO2e), [sectorRows]);
  return (
    <div className="space-y-6 text-sm">
      <p className="leading-relaxed text-[var(--foreground-muted)]">
        Attributed financed emissions roll up from <span className="font-medium text-[var(--foreground)]">PCAF-style attribution</span> at borrower level. Percentages are mass share
        within this sector table (illustrative).
      </p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
        <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Portfolio attributed total</div>
        <div className="mt-1 font-mono text-2xl font-bold text-[var(--foreground)]">{fmtMt(total)} MtCO₂e</div>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            <tr>
              <th className="px-3 py-2.5">Sector</th>
              <th className="px-3 py-2.5 text-right">Mt</th>
              <th className="px-3 py-2.5 text-right">% of total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.sector} className="border-t border-[var(--border)]">
                <td className="px-3 py-2 font-medium text-[var(--foreground)]">{s.sector}</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">{(s.attributedTCO2e / 1_000_000).toFixed(2)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{total > 0 ? ((s.attributedTCO2e / total) * 100).toFixed(1) : "0.0"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectorKpiDrillAlignment({ sectorRows }: { sectorRows: SectorEmissionRow[] }) {
  const counts = useMemo(() => {
    const on = sectorRows.filter((s) => s.pathwayStatus === "On Track").length;
    const off = sectorRows.filter((s) => s.pathwayStatus === "Off Track").length;
    const nd = sectorRows.filter((s) => s.pathwayStatus === "No Data").length;
    return { on, off, nd };
  }, [sectorRows]);
  const offList = useMemo(
    () =>
      sectorRows
        .filter((s) => s.pathwayStatus === "Off Track")
        .sort((a, b) => {
          const ga = a.waciTCO2ePerCr - a.ieaBenchmarkWaci;
          const gb = b.waciTCO2ePerCr - b.ieaBenchmarkWaci;
          return gb - ga;
        }),
    [sectorRows],
  );
  return (
    <div className="space-y-6 text-sm">
      <p className="leading-relaxed text-[var(--foreground-muted)]">
        NZBA-style <span className="font-medium text-[var(--foreground)]">pathway labels</span> pair with WACI gaps vs IEA sector benchmarks. Off-track sectors typically need stronger
        transition finance, data upgrades, or covenant KPIs.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
          <div className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-200">On track</div>
          <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">{counts.on}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-red-500/10 p-3 ring-1 ring-red-500/20">
          <div className="text-[10px] font-bold uppercase text-red-800 dark:text-red-200">Off track</div>
          <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">{counts.off}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-3">
          <div className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">No pathway data</div>
          <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">{counts.nd}</div>
        </div>
      </div>
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Off-track sectors (WACI gap vs IEA)</h3>
        <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2.5">Sector</th>
                <th className="px-3 py-2.5 text-right">WACI gap</th>
              </tr>
            </thead>
            <tbody>
              {offList.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-3 py-4 text-center text-[var(--foreground-muted)]">
                    No off-track sectors in this slice.
                  </td>
                </tr>
              ) : (
                offList.map((s) => {
                  const gap = s.waciTCO2ePerCr - s.ieaBenchmarkWaci;
                  return (
                    <tr key={s.sector} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2 font-medium text-[var(--foreground)]">{s.sector}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-[var(--warning)]">+{fmtT(gap)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Building2, Leaf, Percent, ShieldCheck } from "lucide-react";
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
import type { BankPersonaId, BankScope3MockData } from "./types";
import { isBoardPersona } from "./personaAccess";
import { Scope3KpiStrip } from "../scope3-kpi";
import { Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import { BankChartBox, bankCallout, bankPage } from "./banking-ui";

function formatCr(n: number): string {
  return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)} cr`;
}

function formatMt(n: number): string {
  return `${(n / 1_000_000).toFixed(2)} Mt`;
}

function pcafBandColor(score: number): string {
  if (score <= 2) return "var(--success)";
  if (score <= 3) return "var(--warning)";
  return "var(--danger)";
}

function riskBlend(p: number, t: number): "High" | "Medium" | "Low" {
  const s = (p + t) / 2;
  if (s >= 7) return "High";
  if (s >= 5) return "Medium";
  return "Low";
}

export function ExecutiveSummaryView({
  data,
  persona,
  onSelectSector,
}: {
  data: BankScope3MockData;
  persona: BankPersonaId;
  onSelectSector: (sector: string) => void;
}) {
  const board = isBoardPersona(persona);
  const { company, executive, financedAssetClasses, sectors, regulatory, nzbaTrend } = data;
  const [expandedReg, setExpandedReg] = useState<string | null>(null);

  const barData = useMemo(
    () =>
      financedAssetClasses.map((a) => ({
        name: a.name.length > 26 ? `${a.name.slice(0, 24)}…` : a.name,
        tCO2eMt: a.attributedTCO2e / 1_000_000,
        pct: a.pctOfScope3,
        score: a.pcafScore,
        full: a,
      })),
    [financedAssetClasses],
  );

  const lineData = useMemo(
    () =>
      nzbaTrend.map((r) => ({
        fy: r.fyLabel,
        actual: r.actualTCO2e / 1_000_000,
        nzba: r.nzbaTargetTCO2e / 1_000_000,
        iea: r.ieaNetZeroTCO2e / 1_000_000,
        current: r.isCurrent,
      })),
    [nzbaTrend],
  );

  const kpis = [
    {
      label: "Total financed emissions",
      value: formatMt(executive.totalFinancedEmissionsTCO2e),
      sub: "Category 15 · attributed",
      trend: executive.financedYoyPct,
      bench: "NZBA pathway",
      goodTrendDown: true,
    },
    {
      label: "PCAF coverage",
      value: `${executive.pcafCoveragePct.toFixed(1)}%`,
      sub: "Loan book with emissions data",
      trend: executive.coverageYoyPct,
      bench: "Target 65%",
      goodTrendDown: false,
    },
    {
      label: "Green finance",
      value: `₹${formatCr(executive.greenFinanceINRCr).replace(" cr", "")} cr`,
      sub: "Verified green & transition finance",
      trend: executive.greenFinanceYoyPct,
      bench: "Growth vs plan",
      goodTrendDown: false,
    },
    {
      label: "BRSR readiness",
      value: `${executive.brsrReadinessPct}%`,
      sub: executive.brsrCoreAssuranceFlag ? "Core assurance on" : "Core assurance off",
      trend: 2.1,
      bench: "Target 80%",
      goodTrendDown: false,
    },
    {
      label: "Regulatory gaps",
      value: String(executive.activeRegulatoryGaps),
      sub: "Open gap items",
      trend: -1,
      bench: "Zero overdue",
      goodTrendDown: true,
    },
  ];

  return (
    <div className={bankPage}>
      <Scope3KpiStrip
        items={[
          {
            label: kpis[0]!.label,
            value: kpis[0]!.value,
            sub: `${kpis[0]!.sub} · Bench: ${kpis[0]!.bench}`,
            tone: "teal",
            icon: Building2,
            delta: kpis[0]!.trend,
            deltaInvert: kpis[0]!.goodTrendDown,
          },
          {
            label: kpis[1]!.label,
            value: kpis[1]!.value,
            sub: `${kpis[1]!.sub} · Bench: ${kpis[1]!.bench}`,
            tone: "blue",
            icon: Percent,
            delta: kpis[1]!.trend,
            deltaInvert: kpis[1]!.goodTrendDown,
          },
          {
            label: kpis[2]!.label,
            value: kpis[2]!.value,
            sub: `${kpis[2]!.sub} · Bench: ${kpis[2]!.bench}`,
            tone: "emerald",
            icon: Leaf,
            delta: kpis[2]!.trend,
            deltaInvert: kpis[2]!.goodTrendDown,
          },
          {
            label: kpis[3]!.label,
            value: kpis[3]!.value,
            sub: `${kpis[3]!.sub} · Bench: ${kpis[3]!.bench}`,
            tone: "violet",
            icon: ShieldCheck,
            delta: kpis[3]!.trend,
            deltaInvert: kpis[3]!.goodTrendDown,
          },
          {
            label: kpis[4]!.label,
            value: kpis[4]!.value,
            sub: `${kpis[4]!.sub} · Bench: ${kpis[4]!.bench}`,
            tone: "amber",
            icon: AlertTriangle,
            delta: kpis[4]!.trend,
            deltaInvert: kpis[4]!.goodTrendDown,
          },
        ]}
      />

      <section>
        <Scope3SectionLabel
          title="Financed emissions by asset class (Category 15)"
          description="Horizontal composition of attributed tCO₂e — bar colour reflects PCAF data quality band."
        />
        <Scope3Panel className="min-h-[300px]">
          <div className={bankCallout}>
            Category 15 represents <strong>{company.category15PctOfScope3}%</strong> of total bank Scope 3 emissions (FY24–25 mock close).
          </div>
          <div className="mt-4">
            <BankChartBox heightClass="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={barData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                  <XAxis type="number" tickFormatter={(v) => `${v}`} stroke="var(--foreground-muted)" fontSize={11} label={{ value: "Mt CO₂e", position: "insideBottom", offset: -4, fill: "var(--foreground-muted)", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={150} stroke="var(--foreground-muted)" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const v = typeof value === "number" ? value : Number(value);
                      const n = Number.isFinite(v) ? v : 0;
                      const row = item?.payload?.full as (typeof barData)[0]["full"] | undefined;
                      const suffix = row ? ` · ${row.name}` : "";
                      return [`${n.toFixed(2)} Mt${suffix}`, "Attributed"];
                    }}
                  />
                  <Bar dataKey="tCO2eMt" radius={[0, 6, 6, 0]} name="Attributed (Mt)">
                    {barData.map((e, i) => (
                      <Cell key={i} fill={pcafBandColor(e.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </BankChartBox>
          </div>
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={() => "Colour = PCAF quality band (1–2 green, 3 amber, 4–5 red)"} />
        </Scope3Panel>
      </section>

      <section>
        <Scope3SectionLabel
          title="Sectoral climate risk heat map"
          description="Twelve corporate lending sectors — combined physical and transition risk drives card tint."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sectors.map((s) => {
            const band = riskBlend(s.physicalRisk1to10, s.transitionRisk1to10);
            const bg =
              band === "High"
                ? "bg-red-500/10 border-red-500/30"
                : band === "Medium"
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30";
            return (
              <button
                key={s.sector}
                type="button"
                disabled={board}
                onClick={() => !board && onSelectSector(s.sector)}
                className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${board ? "" : "hover:border-[var(--primary)]/25 hover:shadow-md"} ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] ${bg} ${board ? "cursor-default opacity-90" : "cursor-pointer"}`}
              >
                <div className="text-sm font-semibold text-[var(--foreground)]">{s.sector}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--foreground-muted)]">
                  <div>Exposure</div>
                  <div className="text-right font-mono text-[var(--foreground)]">₹{formatCr(s.exposureINRCr).replace(" cr", "")} cr</div>
                  <div>Attributed</div>
                  <div className="text-right font-mono text-[var(--foreground)]">{formatMt(s.attributedTCO2e)}</div>
                  <div>Physical / Trans.</div>
                  <div className="text-right font-mono text-[var(--foreground)]">
                    {s.physicalRisk1to10} / {s.transitionRisk1to10}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                    {s.pathwayStatus}
                  </span>
                  <span className="text-[10px] text-[var(--foreground-subtle)]">{band} risk</span>
                </div>
                {!board ? <div className="mt-2 text-[10px] text-[var(--primary)]">Click → borrower breakdown</div> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <Scope3SectionLabel title="Regulatory compliance tracker" description="Nine frameworks — expand a pill for completeness and owner." />
        <div className="flex flex-wrap gap-2">
          {regulatory.map((r) => {
            const active = expandedReg === r.framework;
            const badge =
              r.status === "Compliant"
                ? "bg-emerald-600/15 text-emerald-800 dark:text-emerald-200"
                : r.status === "In Progress"
                  ? "bg-sky-600/15 text-sky-900 dark:text-sky-100"
                  : r.status === "Gap Identified"
                    ? "bg-amber-600/15 text-amber-900 dark:text-amber-100"
                    : "bg-red-600/15 text-red-900 dark:text-red-100";
            return (
              <div key={r.framework} className="min-w-[200px] flex-1">
                <button
                  type="button"
                  onClick={() => setExpandedReg(active ? null : r.framework)}
                  className={`flex w-full flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-left text-xs shadow-sm transition hover:border-[var(--primary)]/40`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--foreground)]">{r.framework}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}>{r.status}</span>
                  </div>
                  <div className="text-[10px] text-[var(--foreground-muted)]">Due {r.deadline}</div>
                </button>
                {active ? (
                  <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--foreground-muted)]">
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Completeness:</span> {r.completenessPct}%
                    </div>
                    <div className="mt-1">{r.nextAction}</div>
                    <div className="mt-1 font-mono text-[10px]">Owner: {r.ownerPersona}</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <Scope3SectionLabel
          title="Portfolio emissions vs NZBA pathway"
          description="FY22–23 through FY30–31 — actual financed emissions vs NZBA target and IEA Net Zero scenario (illustrative)."
        />
        <Scope3Panel className="min-h-[300px]">
          <BankChartBox heightClass="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                <XAxis dataKey="fy" stroke="var(--foreground-muted)" fontSize={11} />
                <YAxis stroke="var(--foreground-muted)" fontSize={11} tickFormatter={(v) => `${v}`} />
                <Tooltip formatter={(v) => {
                  const n = typeof v === "number" ? v : Number(v);
                  const x = Number.isFinite(n) ? n : 0;
                  return [`${x.toFixed(2)} Mt`, ""];
                }} />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual financed (Mt)" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="nzba" name="NZBA target (Mt)" stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="iea" name="IEA NZE (Mt)" stroke="var(--success)" strokeDasharray="2 6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </BankChartBox>
          <p className="mt-3 text-xs text-[var(--foreground-muted)]">
            At current trajectory, the bank exceeds the NZBA 2030 target by approximately{" "}
            <strong>{formatMt(executive.nzbaGapTCO2e2030)}</strong> — requiring about{" "}
            <strong>{executive.annualReductionNeededPct}%</strong> annual reduction in attributed financed emissions (mock).
          </p>
        </Scope3Panel>
      </section>
    </div>
  );
}

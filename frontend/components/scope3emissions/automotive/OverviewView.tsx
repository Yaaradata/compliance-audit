"use client";

import { useMemo, useState } from "react";
import { Car, Cloud, Factory, TrendingDown, Zap } from "lucide-react";
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
import type { AutomotiveScope3MockData, GlobalFilters } from "./types";
import { Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import {
  AUTO_CHART_COLORS,
  AutoChartBox,
  AutoInsightCard,
  AutoKpiCard,
  AutoKpiGrid,
  AutoRankRow,
  autoKpiToneAt,
  autoPage,
  autoSegmentGroup,
  autoSegmentTabButtonProps,
  formatTCO2e,
} from "./automotive-ui";

export function OverviewView({
  data,
  filters,
  onNavigate,
}: {
  data: AutomotiveScope3MockData;
  filters?: GlobalFilters;
  onNavigate?: (view: string) => void;
}) {
  const [powertrain, setPowertrain] = useState<"ICE" | "EV">("ICE");
  const { overview, lifecycle, emissionsTrend, topSuppliers, topComponents, quickInsights } = data;
  const compareOn = filters?.comparePeriod?.includes("vs") ?? false;
  const trendCompare = useMemo(
    () =>
      compareOn
        ? emissionsTrend.map((p) => ({
            ...p,
            prior: Math.round(p.tCO2e * 1.048),
          }))
        : emissionsTrend,
    [emissionsTrend, compareOn],
  );

  const lifecycleChart = useMemo(
    () =>
      lifecycle.map((l) => ({
        phase: l.phase,
        tCO2e: powertrain === "ICE" ? l.iceTCO2e : l.evTCO2e,
      })),
    [lifecycle, powertrain],
  );

  const kpis = [
    { label: "Total Scope 3", value: formatTCO2e(overview.totalScope3TCO2e, true), sub: "tCO₂e · FY25 inventory", tone: autoKpiToneAt(0), icon: Cloud },
    { label: "Emissions / vehicle", value: `${overview.emissionsPerVehicleTCO2e} t`, sub: "Lifecycle average", tone: autoKpiToneAt(1), icon: Car },
    { label: "Use phase share", value: `${overview.usePhasePct}%`, sub: "Of lifecycle total", tone: autoKpiToneAt(2), icon: Zap },
    {
      label: "YoY change",
      value: `${Math.abs(overview.yoyChangePct)}%`,
      sub: "vs FY24 baseline",
      tone: autoKpiToneAt(3),
      icon: TrendingDown,
      delta: overview.yoyChangePct,
      deltaInvert: true,
    },
    { label: "Top supplier share", value: `${overview.topSupplierContributionPct}%`, sub: "VoltCell Energy Systems", tone: autoKpiToneAt(4), icon: Factory },
  ] as const;

  return (
    <div className={autoPage}>
      <AutoKpiGrid cols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <AutoKpiCard
            key={k.label}
            variant="hero"
            label={k.label}
            value={k.value}
            sub={k.sub}
            tone={k.tone}
            icon={k.icon}
            {...("delta" in k ? { delta: k.delta, deltaInvert: k.deltaInvert } : {})}
          />
        ))}
      </AutoKpiGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Scope3Panel className="!overflow-hidden">
          <Scope3SectionLabel
            title="Lifecycle breakdown"
            description="Production · use phase · end-of-life — toggle ICE vs EV."
            action={<PowertrainToggle powertrain={powertrain} onChange={setPowertrain} />}
          />
          <AutoChartBox>
<BarChart data={lifecycleChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="phase" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatTCO2e(Number(v)), "tCO₂e"]} />
                <Bar
                  dataKey="tCO2e"
                  radius={[6, 6, 0, 0]}
                  className="cursor-pointer"
                  onClick={(entry) => {
                    const phase = (entry as { phase?: string }).phase;
                    if (phase === "Production") onNavigate?.("supply_chain");
                    else if (phase === "Use phase") onNavigate?.("emissions_tracking");
                    else onNavigate?.("value_chain");
                  }}
                >
                  {lifecycleChart.map((_, i) => (
                    <Cell key={i} fill={AUTO_CHART_COLORS[i % AUTO_CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
</AutoChartBox>
        </Scope3Panel>

        <Scope3Panel className="!overflow-hidden">
          <Scope3SectionLabel
            title="Emissions trend"
            description={compareOn ? "FY25 vs FY24 compare mode." : "Monthly Scope 3 — FY25."}
          />
          <AutoChartBox>
<LineChart data={trendCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatTCO2e(Number(v)), "tCO₂e"]} />
                {compareOn ? <Legend /> : null}
                <Line type="monotone" dataKey="tCO2e" name="FY25" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                {compareOn ? (
                  <Line type="monotone" dataKey="prior" name="FY24" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
                ) : null}
              </LineChart>
</AutoChartBox>
        </Scope3Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Scope3Panel>
            <Scope3SectionLabel title="Top suppliers" />
            <ul className="space-y-1">
              {topSuppliers.map((s, i) => (
                <AutoRankRow
                  key={s.id}
                  rank={i + 1}
                  label={s.name}
                  value={formatTCO2e(s.tCO2e, true)}
                  barPct={Math.min(s.pct * 4, 100)}
                  tone={autoKpiToneAt(i)}
                  onClick={() => onNavigate?.("supply_chain")}
                />
              ))}
            </ul>
          </Scope3Panel>

          <Scope3Panel>
            <Scope3SectionLabel title="Top components" />
            <AutoChartBox heightClass="h-[220px]">
              <PieChart>
                <Pie data={topComponents} dataKey="tCO2e" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72}>
                  {topComponents.map((_, i) => (
                    <Cell key={i} fill={AUTO_CHART_COLORS[i % AUTO_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatTCO2e(Number(v), true)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </AutoChartBox>
          </Scope3Panel>
        </div>

        <Scope3Panel>
          <Scope3SectionLabel title="Quick insights" />
          <ul className="space-y-3">
            {quickInsights.map((q, i) => (
              <li key={q.id}>
                <AutoInsightCard tone={q.severity === "critical" ? "rose" : q.severity === "warning" ? "amber" : "emerald"}>
                  {q.text}
                </AutoInsightCard>
              </li>
            ))}
          </ul>
        </Scope3Panel>
      </div>
    </div>
  );
}

function PowertrainToggle({
  powertrain,
  onChange,
}: {
  powertrain: "ICE" | "EV";
  onChange: (p: "ICE" | "EV") => void;
}) {
  return (
    <div className={`${autoSegmentGroup} w-auto max-w-none`}>
      {(["ICE", "EV"] as const).map((p) => (
        <button
          key={p}
          type="button"
          {...autoSegmentTabButtonProps(powertrain === p)}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AutoChartBox } from "./automotive-ui";
import { INTENSITY_TONE_HEX } from "./intensity-ratio-data";
import type { IntensityInvestmentAiDossier, IntensityTrendPoint } from "./intensity-ratio-types";

export function IntensitySeriesLineChart({
  data,
  dataKey = "value",
  name,
  color = "#2563eb",
  heightClass = "h-[200px]",
  yLabel,
}: {
  data: IntensityTrendPoint[];
  dataKey?: string;
  name: string;
  color?: string;
  heightClass?: string;
  yLabel?: string;
}) {
  if (!data.length) return null;
  const chartData = data.map((d) => ({ year: d.year, value: d.value }));

  return (
    <AutoChartBox heightClass={heightClass} minChartHeight={140}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} width={44} label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 9 } : undefined} />
        <Tooltip
          formatter={(v) => [Number(v).toLocaleString("en-IN"), name]}
          labelFormatter={(l) => String(l)}
        />
        <Line type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </AutoChartBox>
  );
}

export function IntensityRiskBarChart({
  dimensions,
}: {
  dimensions: IntensityInvestmentAiDossier["riskAnalysis"]["dimensions"];
}) {
  if (!dimensions.length) return null;
  const data = dimensions.map((d) => ({ name: d.label, score: d.score }));

  return (
    <AutoChartBox heightClass="h-[220px]" minChartHeight={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
        <Tooltip formatter={(v) => [`${Number(v)}/100`, "Risk score"]} />
        <Bar dataKey="score" name="Score" fill="#2563eb" radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </AutoChartBox>
  );
}

export function IntensityCostCutBarChart({
  ideas,
}: {
  ideas: IntensityInvestmentAiDossier["costCutIdeas"];
}) {
  const data = ideas
    .filter((c) => c.annualSavingCr != null || c.annualSavingT != null)
    .map((c) => ({
      name: c.title.length > 28 ? `${c.title.slice(0, 26)}…` : c.title,
      savingCr: c.annualSavingCr ?? 0,
      savingKt: c.annualSavingT ? c.annualSavingT / 1000 : 0,
    }));
  if (!data.length) return null;

  return (
    <AutoChartBox heightClass="h-[240px]" minChartHeight={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-28} textAnchor="end" height={56} interval={0} />
        <YAxis yAxisId="cr" tick={{ fontSize: 10 }} width={40} />
        <YAxis yAxisId="kt" orientation="right" tick={{ fontSize: 10 }} width={36} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        <Bar yAxisId="cr" dataKey="savingCr" name="₹ Cr/yr" fill="#0d9488" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="kt" dataKey="savingKt" name="ktCO₂e/yr" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </AutoChartBox>
  );
}

export function IntensityCategoryBarChart({
  items,
}: {
  items: { label: string; pct: number; tPerUnit: number }[];
}) {
  if (!items.length) return null;
  const colors = ["#2563eb", "#0d9488", "#ea580c", "#7c3aed", "#64748b"];

  return (
    <AutoChartBox heightClass="h-[200px]" minChartHeight={140}>
      <BarChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} />
        <YAxis tick={{ fontSize: 10 }} unit="%" />
        <Tooltip
          formatter={(v, _n, item) => {
            const row = item?.payload as { tPerUnit?: number } | undefined;
            return [`${Number(v)}%${row?.tPerUnit != null ? ` · ${row.tPerUnit} t/veh` : ""}`, "Share"];
          }}
        />
        <Bar dataKey="pct" name="Share %" radius={[4, 4, 0, 0]}>
          {items.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </AutoChartBox>
  );
}

export function IntensitySupplierSpendBarChart({
  suppliers,
}: {
  suppliers: { name: string; spendCr: number; emissionsKt: number }[];
}) {
  if (!suppliers.length) return null;
  const data = suppliers.map((s) => ({
    name: s.name.length > 20 ? `${s.name.slice(0, 18)}…` : s.name,
    spendCr: s.spendCr,
    emissionsKt: s.emissionsKt,
  }));

  return (
    <AutoChartBox heightClass="h-[220px]" minChartHeight={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 9 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        <Bar dataKey="spendCr" name="Spend ₹Cr" fill={INTENSITY_TONE_HEX.blue} radius={[0, 4, 4, 0]} maxBarSize={14} />
        <Bar dataKey="emissionsKt" name="Emissions kt" fill={INTENSITY_TONE_HEX.teal} radius={[0, 4, 4, 0]} maxBarSize={14} />
      </BarChart>
    </AutoChartBox>
  );
}

export function IntensityCategoryImpactBar({
  items,
}: {
  items: { cat: string; sharePct: number }[];
}) {
  if (!items.length) return null;

  return (
    <AutoChartBox heightClass="h-[160px]" minChartHeight={120}>
      <BarChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="cat" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} unit="%" />
        <Tooltip formatter={(v) => [`${Number(v)}%`, "Impact share"]} />
        <Bar dataKey="sharePct" name="Share" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </AutoChartBox>
  );
}

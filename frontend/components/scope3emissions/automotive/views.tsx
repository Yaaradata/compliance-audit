"use client";

import { useMemo, useState } from "react";
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
import type { AutomotiveScope3MockData } from "./types";
import { LogisticsRouteAnalysisTable } from "./GeographyMap";
import { WorldGeographyMap } from "./WorldGeographyMap";
import { ExportModal } from "./BusinessPanels";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import {
  AUTO_CHART_COLORS,
  AutoChartBox,
  autoBtnPrimary,
  autoBtnSecondary,
  autoCallout,
  autoPage,
  autoTable,
  autoTableShell,
  autoTd,
  autoTh,
  autoTrInteractive,
  formatTCO2e,
  riskColor,
  statusBadgeClass,
} from "./automotive-ui";

const COLORS = AUTO_CHART_COLORS;

function targetProgressPct(t: { unit: string; targetValue: number; actualValue: number }): number {
  if (t.unit === "tCO2e" || t.unit === "intensity") {
    return Math.min((t.targetValue / t.actualValue) * 100, 100);
  }
  return Math.min((t.actualValue / t.targetValue) * 100, 100);
}

export function GeographyView({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <div className={autoPage}>
      <Scope3Panel>
        <Scope3SectionLabel
          title="World emissions map"
          description="Country shading and bubbles = attributed Scope 3 · orange squares = BMM plants (Pune, Chennai, Sanand)."
        />
        <WorldGeographyMap geography={data.geography} plants={data.company.plants} />
      </Scope3Panel>

      <Scope3Panel>
        <Scope3SectionLabel
          title="Route analysis"
          description="Inbound and inter-plant logistics lanes — sorted by attributed Cat 4 tCO₂e."
        />
        <LogisticsRouteAnalysisTable routes={data.logisticsRoutes} />
      </Scope3Panel>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <Scope3Panel className="flex min-h-[min(420px,52vh)] flex-col">
          <Scope3SectionLabel
            title="Transport emissions by mode"
            description="Cat 4 upstream/downstream logistics — share of mapped lane emissions."
          />
          <div className="min-h-0 flex-1">
            <AutoChartBox heightClass="h-full min-h-[280px]" minChartHeight={200}>
              <BarChart data={data.transportModes}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mode" />
              <YAxis tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatTCO2e(Number(v), true)} />
              <Bar dataKey="tCO2e" radius={[6, 6, 0, 0]}>
                {data.transportModes.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
              </BarChart>
            </AutoChartBox>
          </div>
        </Scope3Panel>
        <Scope3Panel className="flex min-h-[min(420px,52vh)] flex-col">
          <Scope3SectionLabel title="Geographic emissions" description="Country risk + grid intensity overlay." />
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {data.geography.map((g) => (
              <li key={g.iso} className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                <span className="w-8 font-mono text-xs">{g.iso}</span>
                <span className="min-w-[100px] flex-1">{g.country}</span>
                <span className="font-semibold tabular-nums">{formatTCO2e(g.tCO2e, true)}</span>
                <span className="text-[10px] text-[var(--foreground-muted)]">{g.gridIntensityKgPerKwh} kg/kWh</span>
                <span className="text-xs" style={{ color: riskColor(g.regulatoryRisk) }}>
                  {g.regulatoryRisk}
                </span>
              </li>
            ))}
          </ul>
        </Scope3Panel>
      </div>
      <Scope3Panel>
        <Scope3SectionLabel title="Logistics routes" description="Inbound and inter-plant movements (filtered)." />
        <div className={autoTableShell}>
          <table className={autoTable}>
            <thead>
              <tr>
                <th className={autoTh}>From</th>
                <th className={autoTh}>To</th>
                <th className={autoTh}>Mode</th>
                <th className={autoTh}>Distance</th>
                <th className={autoTh}>tCO₂e</th>
              </tr>
            </thead>
            <tbody>
              {data.logisticsRoutes.map((r) => (
                <tr key={r.id}>
                  <td className={autoTd}>{r.from}</td>
                  <td className={autoTd}>{r.to}</td>
                  <td className={autoTd}>{r.mode}</td>
                  <td className={autoTd}>{r.distanceKm.toLocaleString()} km</td>
                  <td className={`${autoTd} font-semibold tabular-nums`}>{formatTCO2e(r.tCO2e, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Scope3Panel>
    </div>
  );
}

export function TargetsView({ data }: { data: AutomotiveScope3MockData }) {
  const [supplierPct, setSupplierPct] = useState(0);
  const [efficiencyPct, setEfficiencyPct] = useState(5);
  const [evPct, setEvPct] = useState(32);
  const projected = useMemo(() => {
    const base = data.overview.totalScope3TCO2e;
    return Math.round(base * (1 - supplierPct / 100 * 0.08 - efficiencyPct / 100 * 0.04 - (evPct - 32) / 100 * 0.12));
  }, [data.overview.totalScope3TCO2e, supplierPct, efficiencyPct, evPct]);

  return (
    <div className={autoPage}>
      <div className="grid gap-4 md:grid-cols-2">
        {data.targets.map((t) => (
          <Scope3Panel key={t.id} className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{t.name}</p>
              <span className={statusBadgeClass(t.status)}>{t.status}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${targetProgressPct(t)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              Due {t.dueFY} · Actual {t.actualValue} / Target {t.targetValue} {t.unitLabel}
            </p>
          </Scope3Panel>
        ))}
      </div>
      <Scope3Panel>
        <Scope3SectionLabel title="Reduction pathway" />
        <AutoChartBox>
<LineChart data={data.pathwayTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="fy" />
              <YAxis tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => formatTCO2e(Number(v), true)} />
              <Legend />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--primary)" strokeWidth={2} />
              <Line type="monotone" dataKey="required" name="Required" stroke="var(--warning)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="sbti" name="SBTi" stroke="var(--success)" strokeDasharray="2 6" />
            </LineChart>
</AutoChartBox>
      </Scope3Panel>
      <Scope3Panel>
        <Scope3SectionLabel title="Scenario modelling" description="Adjust levers to preview FY30 footprint." />
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm">
            Supplier switch (%)
            <input type="range" min={0} max={100} value={supplierPct} onChange={(e) => setSupplierPct(Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <label className="text-sm">
            Process efficiency (%)
            <input type="range" min={0} max={30} value={efficiencyPct} onChange={(e) => setEfficiencyPct(Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <label className="text-sm">
            EV production mix (%)
            <input type="range" min={10} max={60} value={evPct} onChange={(e) => setEvPct(Number(e.target.value))} className="mt-2 w-full" />
          </label>
        </div>
        <p className="mt-4 text-sm">
          Projected Scope 3: <strong>{formatTCO2e(projected, true)}</strong>
        </p>
      </Scope3Panel>
      <Scope3Panel>
        <Scope3SectionLabel title="Top 10 reduction opportunities" />
        <ol className="space-y-2 text-sm">
          {data.opportunities.map((o, i) => (
            <li key={o.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2">
              <span>
                {i + 1}. {o.title}
                {o.owner ? <span className="ml-2 text-xs text-[var(--foreground-muted)]">({o.owner})</span> : null}
              </span>
              <span className="shrink-0 text-right text-sm">
                <span className="font-semibold text-[var(--success)]">−{formatTCO2e(o.impactTCO2e, true)}</span>
                {o.capexINRCr != null ? (
                  <span className="block text-xs text-[var(--foreground-muted)]">Capex ₹{o.capexINRCr} Cr</span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </Scope3Panel>
      <Scope3Panel>
        <Scope3SectionLabel title="Alerts" />
        <ul className="space-y-2">
          {data.alerts.map((a) => (
            <li key={a.id} className={autoCallout} style={{ borderLeft: `3px solid ${riskColor(a.severity)}` }}>
              {a.message}
            </li>
          ))}
        </ul>
      </Scope3Panel>
    </div>
  );
}


export function ReportsView({ data }: { data: AutomotiveScope3MockData }) {
  const [selected, setSelected] = useState(data.reportTemplates[0]?.id ?? "");
  const [fields, setFields] = useState(data.customReportFields);
  const [dateFrom, setDateFrom] = useState("2024-04-01");
  const [dateTo, setDateTo] = useState("2025-03-31");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportLabel, setExportLabel] = useState("");
  const template = data.reportTemplates.find((t) => t.id === selected);
  const toggleField = (id: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)));
  };
  const queueExport = (label: string) => {
    setExportLabel(label);
    setExportOpen(true);
  };
  return (
    <div className={autoPage}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Scope3Panel className="lg:col-span-1">
          <Scope3SectionLabel title="Report templates" />
          <ul className="space-y-2">
            {data.reportTemplates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${selected === t.id ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"}`}
                  onClick={() => setSelected(t.id)}
                >
                  <span className="font-semibold">{t.name}</span>
                  <span className={`ml-2 ${statusBadgeClass(t.status)}`}>{t.status}</span>
                </button>
              </li>
            ))}
          </ul>
        </Scope3Panel>
        <Scope3Panel className="lg:col-span-2">
          <Scope3SectionLabel title="Preview" description={template?.description} />
          <ReportPreviewPanel template={template} company={data.company.legalName} />
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--foreground-muted)]">From</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-[var(--border)] px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--foreground-muted)]">To</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-[var(--border)] px-2 py-1.5" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={autoBtnPrimary} onClick={() => queueExport(`${template?.name ?? "Report"} — PDF`)}>
              Export PDF
            </button>
            <button type="button" className={autoBtnSecondary} onClick={() => queueExport(`${template?.name ?? "Report"} — Excel`)}>
              Export Excel
            </button>
            <button type="button" className={autoBtnSecondary} onClick={() => queueExport("Auditor PBC zip")}>
              PBC zip
            </button>
          </div>
        </Scope3Panel>
      </div>
      <Scope3Panel>
        <Scope3SectionLabel title="Scheduled reports" />
        <div className={autoTableShell}>
          <table className={autoTable}>
            <thead>
              <tr>
                <th className={autoTh}>Template</th>
                <th className={autoTh}>Cadence</th>
                <th className={autoTh}>Next run</th>
                <th className={autoTh}>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {data.reportSchedules.map((s) => {
                const tpl = data.reportTemplates.find((t) => t.id === s.templateId);
                return (
                  <tr key={s.id}>
                    <td className={autoTd}>{tpl?.name ?? s.templateId}</td>
                    <td className={autoTd}>{s.cadence}</td>
                    <td className={autoTd}>{s.nextRun}</td>
                    <td className={autoTd}>{s.delivery}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Scope3Panel>
      <Scope3Panel>
        <Scope3SectionLabel title="Custom report builder" description="Toggle sections for ad-hoc exports." />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((f) => (
            <label
              key={f.id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${f.selected ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"}`}
            >
              <input type="checkbox" checked={f.selected} onChange={() => toggleField(f.id)} className="accent-[var(--primary)]" />
              <span>
                <span className="block font-medium">{f.label}</span>
                <span className="text-[10px] text-[var(--foreground-muted)]">{f.group}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--foreground-muted)]">
          {fields.filter((f) => f.selected).length} of {fields.length} sections selected
        </p>
      </Scope3Panel>
      <ExportModal open={exportOpen} title={exportLabel} onClose={() => setExportOpen(false)} />
    </div>
  );
}

function ReportPreviewPanel({
  template,
  company,
}: {
  template?: AutomotiveScope3MockData["reportTemplates"][0];
  company: string;
}) {
  if (!template) return null;
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 p-6 text-sm">
      <p className="text-lg font-bold">{template.name}</p>
      <p className="mt-2 text-[var(--foreground-muted)]">{company} · {template.description}</p>
      <p className="mt-4 text-xs text-[var(--foreground-subtle)]">Formats: {template.format.join(", ")}</p>
    </div>
  );
}


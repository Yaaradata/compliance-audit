"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AutomotiveScope3MockData } from "./types";
import { Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import {
  AutoChartBox,
  AutoKpiCard,
  AutoKpiGrid,
  autoBtnPrimary,
  autoKpiToneAt,
  autoTable,
  autoTableShell,
  autoTd,
  autoTh,
  formatTCO2e,
  statusBadgeClass,
} from "./automotive-ui";

export function CfoFinancialPanel({ data }: { data: AutomotiveScope3MockData }) {
  const f = data.financialKpis;
  const cards = [
    { label: "Intensity / ₹ Cr revenue", value: `${f.intensityPerRevenueCr} t` },
    { label: "Intensity / vehicle sold", value: `${f.intensityPerVehicleSold} t` },
    { label: "Intensity / vehicle produced", value: `${f.intensityPerVehicleProduced} t` },
    { label: "Shadow carbon exposure", value: `₹${f.shadowCarbonExposureINRCr} Cr` },
    { label: "Top category in COGS", value: `${f.topCategoryCogsPct}%`, sub: "Cat 1 purchased goods" },
  ];

  return (
    <Scope3Panel>
      <Scope3SectionLabel title="CFO financial lens" description="Materiality, variance, and capital-linked decarbonisation." />
      <AutoKpiGrid cols="sm:grid-cols-2 lg:grid-cols-5" className="mb-4">
        {cards.map((c, i) => (
          <AutoKpiCard key={c.label} label={c.label} value={c.value} sub={"sub" in c ? c.sub : undefined} tone={autoKpiToneAt(i)} />
        ))}
      </AutoKpiGrid>
      <VarianceBridgeChart data={data} />
      <div className="mt-6">
        <Scope3SectionLabel title="P&L ↔ carbon bridge" description="FY24 vs FY25 — financial lines with carbon intensity where applicable." />
        <PnlCarbonTable rows={data.cfoPnlCarbon} />
      </div>
      <div className="mt-6">
        <Scope3SectionLabel title="Model carbon economics" description="Revenue, margin-at-risk, and decarb levers by vehicle line." />
        <ModelCarbonTable rows={data.modelCarbonEconomics} />
      </div>
      <div className="mt-6">
        <Scope3SectionLabel title="Investment pipeline" description="Initiatives with capex and tCO₂e impact." />
        <InvestmentTable rows={data.investmentPipeline} />
      </div>
    </Scope3Panel>
  );
}

function PnlCarbonTable({ rows }: { rows: AutomotiveScope3MockData["cfoPnlCarbon"] }) {
  return (
    <div className={autoTableShell}>
      <table className={autoTable}>
        <thead>
          <tr>
            <th className={autoTh}>Line</th>
            <th className={autoTh}>FY24 ₹ Cr</th>
            <th className={autoTh}>FY25 ₹ Cr</th>
            <th className={autoTh}>t / ₹ Cr</th>
            <th className={autoTh}>Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.line}>
              <td className={autoTd}>{r.line}</td>
              <td className={`${autoTd} tabular-nums`}>{r.fy24 == null ? "—" : r.fy24.toLocaleString("en-IN")}</td>
              <td className={`${autoTd} tabular-nums`}>{r.fy25 == null ? "—" : r.fy25.toLocaleString("en-IN")}</td>
              <td className={`${autoTd} tabular-nums`}>{r.carbonIntensity == null ? "—" : r.carbonIntensity}</td>
              <td className={`${autoTd} text-xs text-[var(--foreground-muted)]`}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModelCarbonTable({ rows }: { rows: AutomotiveScope3MockData["modelCarbonEconomics"] }) {
  return (
    <div className={autoTableShell}>
      <table className={autoTable}>
        <thead>
          <tr>
            <th className={autoTh}>Model</th>
            <th className={autoTh}>Units</th>
            <th className={autoTh}>Revenue</th>
            <th className={autoTh}>Scope 3</th>
            <th className={autoTh}>t/veh</th>
            <th className={autoTh}>Cat 1</th>
            <th className={autoTh}>Cat 11</th>
            <th className={autoTh}>Margin risk</th>
            <th className={autoTh}>Lever</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.modelId}>
              <td className={autoTd}>{r.name}</td>
              <td className={`${autoTd} tabular-nums`}>{r.units.toLocaleString("en-IN")}</td>
              <td className={`${autoTd} tabular-nums`}>₹{r.revenueINRCr} Cr</td>
              <td className={`${autoTd} tabular-nums`}>{r.scope3Kt.toLocaleString("en-IN")} kt</td>
              <td className={`${autoTd} tabular-nums`}>{r.intensityPerVehicle}</td>
              <td className={`${autoTd} tabular-nums`}>{r.cat1PerVehicle}</td>
              <td className={`${autoTd} tabular-nums`}>{r.cat11PerVehicle}</td>
              <td className={`${autoTd} tabular-nums text-[var(--warning)]`}>₹{r.marginAtRiskINRCr} Cr</td>
              <td className={`${autoTd} text-xs`}>{r.decarbLever}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VarianceBridgeChart({ data }: { data: AutomotiveScope3MockData }) {
  const chartData = data.varianceBridge.map((p) => ({
    label: p.label,
    value: p.type === "delta" ? p.value : p.value,
    fill: p.type === "start" || p.type === "end" ? "var(--primary)" : p.value < 0 ? "var(--success)" : "var(--warning)",
  }));

  return (
    <>
      <Scope3SectionLabel title="YoY variance bridge" description="FY24 → FY25 total Scope 3 walk." />
      <AutoChartBox heightClass="h-[240px]">
<BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`} />
            <Tooltip formatter={(v) => formatTCO2e(Number(v), true)} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((e, i) => (
                <Cell key={i} fill={e.fill} />
              ))}
            </Bar>
          </BarChart>
</AutoChartBox>
    </>
  );
}

function InvestmentTable({ rows }: { rows: AutomotiveScope3MockData["investmentPipeline"] }) {
  return (
    <div className={autoTableShell}>
      <table className={autoTable}>
        <thead>
          <tr>
            <th className={autoTh}>Initiative</th>
            <th className={autoTh}>Owner</th>
            <th className={autoTh}>tCO₂e</th>
            <th className={autoTh}>Capex ₹ Cr</th>
            <th className={autoTh}>Payback</th>
            <th className={autoTh}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={autoTd}>{r.title}</td>
              <td className={autoTd}>{r.owner}</td>
              <td className={autoTd}>−{formatTCO2e(r.impactTCO2e, true)}</td>
              <td className={autoTd}>₹{r.capexINRCr}</td>
              <td className={autoTd}>{r.paybackYears} yr</td>
              <td className={autoTd}>
                <span className={statusBadgeClass(r.status)}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MethodologyGovernancePanel({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Methodology & boundaries" description="Category ownership, approaches, and restatements." />
      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              <th className={autoTh}>Category</th>
              <th className={autoTh}>Owner</th>
              <th className={autoTh}>Approach</th>
              <th className={autoTh}>Quality</th>
              <th className={autoTh}>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {data.methodologyRegister.map((m) => (
              <tr key={m.ghgCategory}>
                <td className={autoTd}>{m.label}</td>
                <td className={autoTd}>{m.owner}</td>
                <td className={autoTd}>{m.approach}</td>
                <td className={autoTd}>{m.dataQuality}</td>
                <td className={autoTd}>{m.coveragePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase text-[var(--foreground-muted)]">Restatement log</p>
        <ul className="space-y-2 text-sm">
          {data.restatementLog.map((r) => (
            <li key={r.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2">
              <span>{r.date} — {r.reason}</span>
              <span className="font-semibold tabular-nums">
                {r.impactTCO2e > 0 ? "+" : ""}
                {formatTCO2e(r.impactTCO2e, true)} · {r.categories}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Scope3Panel>
  );
}

export function Cat11AssumptionsPanel({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Cat 11 use-phase assumptions" description="Market-specific lifetime, grid, and fleet parameters (auditable)." />
      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              <th className={autoTh}>Market</th>
              <th className={autoTh}>Lifetime km</th>
              <th className={autoTh}>Grid kg/kWh</th>
              <th className={autoTh}>Fuel / charging</th>
              <th className={autoTh}>RW factor</th>
              <th className={autoTh}>Fleet %</th>
            </tr>
          </thead>
          <tbody>
            {data.cat11Assumptions.map((a) => (
              <tr key={a.market}>
                <td className={autoTd}>{a.market}</td>
                <td className={autoTd}>{a.lifetimeKm.toLocaleString()}</td>
                <td className={autoTd}>{a.gridKgPerKwh}</td>
                <td className={autoTd}>{a.fuelType} · EV charge {a.evChargingMixPct}%</td>
                <td className={autoTd}>{a.realWorldFactor}</td>
                <td className={autoTd}>{a.fleetSharePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Scope3Panel>
  );
}

export function SbtiCockpitPanel({ data }: { data: AutomotiveScope3MockData }) {
  const s = data.sbtiStatus;
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="SBTi cockpit" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] p-4 text-center">
          <p className="text-xs text-[var(--foreground-muted)]">Near-term</p>
          <p className="mt-2 text-sm font-semibold">{s.nearTermStatus}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-4 text-center">
          <p className="text-xs text-[var(--foreground-muted)]">Supplier engagement</p>
          <p className="mt-2 text-2xl font-bold">{s.supplierEngagementTargetPct}%</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-4 text-center">
          <p className="text-xs text-[var(--foreground-muted)]">Suppliers with targets</p>
          <p className="mt-2 text-2xl font-bold">{s.suppliersWithTargetsPct}%</p>
        </div>
      </div>
      {s.flagApplicable ? <p className="mt-2 text-xs text-[var(--warning)]">FLAG sector criteria apply.</p> : null}
    </Scope3Panel>
  );
}

export function ProcurementScorecardPanel({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Tier-1 procurement scorecard" description="Spend-weighted emissions, PCF status, and engagement priority." />
      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              <th className={autoTh}>Supplier</th>
              <th className={autoTh}>Spend</th>
              <th className={autoTh}>Emissions</th>
              <th className={autoTh}>t / ₹ Cr</th>
              <th className={autoTh}>PCF</th>
              <th className={autoTh}>SBTi</th>
              <th className={autoTh}>Data tier</th>
              <th className={autoTh}>Priority</th>
              <th className={autoTh}>Alternate</th>
            </tr>
          </thead>
          <tbody>
            {data.procurementScorecards.map((r) => (
              <tr key={r.supplierId}>
                <td className={autoTd}>{r.name}</td>
                <td className={`${autoTd} tabular-nums`}>₹{r.spendINRCr} Cr</td>
                <td className={`${autoTd} tabular-nums`}>{r.emissionsKt} kt</td>
                <td className={`${autoTd} tabular-nums`}>{r.intensityPerSpendCr}</td>
                <td className={autoTd}>
                  <span className={statusBadgeClass(r.pcfStatus)}>{r.pcfStatus}</span>
                </td>
                <td className={autoTd}>{r.sbtiStatus}</td>
                <td className={autoTd}>{r.dataTier}</td>
                <td className={autoTd}>
                  <span className={statusBadgeClass(r.engagementPriority === "P0" ? "Non-compliant" : r.engagementPriority === "P1" ? "At risk" : "Compliant")}>
                    {r.engagementPriority}
                  </span>
                </td>
                <td className={autoTd}>{r.alternateQualified ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Scope3Panel>
  );
}

export function DataQualityRemediationPanel({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Data quality remediation register" description={`${data.dataCompletenessPct}% completeness — open gaps blocking assurance.`} />
      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              <th className={autoTh}>Category</th>
              <th className={autoTh}>Field</th>
              <th className={autoTh}>Issue</th>
              <th className={autoTh}>Owner</th>
              <th className={autoTh}>Confidence</th>
              <th className={autoTh}>Records</th>
              <th className={autoTh}>Due</th>
            </tr>
          </thead>
          <tbody>
            {data.dataQualityGaps.map((g) => (
              <tr key={g.id}>
                <td className={autoTd}>{g.category}</td>
                <td className={autoTd}>{g.field}</td>
                <td className={autoTd}>{g.issue}</td>
                <td className={autoTd}>{g.owner}</td>
                <td className={`${autoTd} tabular-nums`}>{g.confidence}%</td>
                <td className={`${autoTd} tabular-nums`}>{g.recordsAffected}</td>
                <td className={autoTd}>{g.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {data.dataQualityGaps.map((g) => (
          <li key={`${g.id}-rem`} className="rounded-lg border border-[var(--border)] px-3 py-2">
            <span className="font-medium">{g.field}</span> — {g.remediation}
          </li>
        ))}
      </ul>
    </Scope3Panel>
  );
}

export function CsoAssuranceGapsPanel({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="CSO assurance readiness" description="BRSR mapping gaps and material findings before limited assurance." />
      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              <th className={autoTh}>Area</th>
              <th className={autoTh}>BRSR ref</th>
              <th className={autoTh}>Status</th>
              <th className={autoTh}>Materiality</th>
              <th className={autoTh}>Finding</th>
              <th className={autoTh}>Owner</th>
            </tr>
          </thead>
          <tbody>
            {data.csoAssuranceGaps.map((g) => (
              <tr key={g.id}>
                <td className={autoTd}>{g.area}</td>
                <td className={autoTd}>{g.brsrRef}</td>
                <td className={autoTd}>
                  <span className={statusBadgeClass(g.status === "Mapped" ? "Compliant" : g.status === "Partial" ? "At risk" : "Non-compliant")}>
                    {g.status}
                  </span>
                </td>
                <td className={autoTd}>{g.materiality}</td>
                <td className={`${autoTd} text-xs`}>{g.finding}</td>
                <td className={autoTd}>{g.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Scope3Panel>
  );
}

export function SupplierProgrammePanel({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Supplier engagement programme" description="PCF collection waves, SBTi flags, and CAP status." />
      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              <th className={autoTh}>Supplier</th>
              <th className={autoTh}>Emissions %</th>
              <th className={autoTh}>Spend ₹ Cr</th>
              <th className={autoTh}>PCF</th>
              <th className={autoTh}>SBTi</th>
              <th className={autoTh}>CAP</th>
              <th className={autoTh}>Wave</th>
              <th className={autoTh}>Renewal</th>
            </tr>
          </thead>
          <tbody>
            {data.supplierProgramme.map((r) => (
              <tr key={r.supplierId}>
                <td className={autoTd}>{r.name}</td>
                <td className={autoTd}>{r.emissionsSharePct}%</td>
                <td className={autoTd}>₹{r.spendINRCr}</td>
                <td className={autoTd}>
                  <span className={statusBadgeClass(r.pcfStatus)}>{r.pcfStatus}</span>
                </td>
                <td className={autoTd}>{r.sbtiCommitted ? "Yes" : "No"}</td>
                <td className={autoTd}>{r.capStatus}</td>
                <td className={autoTd}>{r.wave}</td>
                <td className={autoTd}>{r.contractRenewal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Scope3Panel>
  );
}

export function PlantCockpitPanel({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Plant operations cockpit" description="Inbound Cat 4, outbound Cat 9, and production allocation." />
      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              <th className={autoTh}>Plant</th>
              <th className={autoTh}>Inbound</th>
              <th className={autoTh}>Outbound</th>
              <th className={autoTh}>Production alloc.</th>
              <th className={autoTh}>t / vehicle</th>
            </tr>
          </thead>
          <tbody>
            {data.plantSlices.map((p) => (
              <tr key={p.plant}>
                <td className={autoTd}>{p.plant}</td>
                <td className={autoTd}>{formatTCO2e(p.inboundTCO2e, true)}</td>
                <td className={autoTd}>{formatTCO2e(p.outboundTCO2e, true)}</td>
                <td className={autoTd}>{formatTCO2e(p.productionAllocatedTCO2e, true)}</td>
                <td className={autoTd}>{p.intensityPerVehicle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Scope3Panel>
  );
}

export function ModelPortfolioMatrix({ data }: { data: AutomotiveScope3MockData }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Model portfolio matrix" description="Lifecycle tCO₂e by model × phase (OEM view)." />
      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              <th className={autoTh}>Model</th>
              <th className={autoTh}>Powertrain</th>
              <th className={autoTh}>Production</th>
              <th className={autoTh}>Use phase</th>
              <th className={autoTh}>EOL</th>
              <th className={autoTh}>Lifecycle</th>
              <th className={autoTh}>Units</th>
            </tr>
          </thead>
          <tbody>
            {data.vehicleModels.map((m) => (
              <tr key={m.id}>
                <td className={autoTd}>{m.name}</td>
                <td className={autoTd}>{m.powertrain}</td>
                <td className={autoTd}>{formatTCO2e(m.productionTCO2e, true)}</td>
                <td className={autoTd}>{formatTCO2e(m.usePhaseTCO2e, true)}</td>
                <td className={autoTd}>{formatTCO2e(m.eolTCO2e, true)}</td>
                <td className={autoTd}>{formatTCO2e(m.lifecycleTCO2e, true)}</td>
                <td className={autoTd}>{m.unitsProduced.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Scope3Panel>
  );
}

export function ExportModal({
  open,
  title,
  onClose,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <p className="font-semibold">{title}</p>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Mock export queued — in production this generates PDF/Excel/PBC zip from the filtered inventory snapshot.
        </p>
        <button type="button" className={`mt-4 px-4 py-2 text-sm ${autoBtnPrimary}`} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
import { ChevronRight, Lightbulb } from "lucide-react";
import type { AutomotiveScope3MockData, ComponentEmission, VehiclePowertrain } from "./types";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import {
  AUTO_CHART_COLORS,
  AutoChartBox,
  AutoKpiCard,
  AutoKpiGrid,
  autoCallout,
  autoKpiToneAt,
  autoPage,
  autoSegmentGroup,
  autoSegmentTabButtonProps,
  autoTable,
  autoTableShell,
  autoTd,
  autoTh,
  autoTrInteractive,
  formatTCO2e,
} from "./automotive-ui";

const CHART_COLORS = ["#0d9488", "#2563eb", "#7c3aed", "#ea580c", "#dc2626", "#ca8a04", "#0891b2"];
const PHASE_COLORS = { production: "#2563eb", use: "#ea580c", eol: "#64748b" };

type TabId = "overview" | "components" | "models" | "ice_ev";

function powertrainPillClass(p: VehiclePowertrain): string {
  const base = "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase";
  if (p === "EV") return `${base} bg-emerald-500/15 text-emerald-400`;
  if (p === "Hybrid") return `${base} bg-violet-500/15 text-violet-400`;
  return `${base} bg-orange-500/15 text-orange-400`;
}

function shortModelName(name: string): string {
  return name.replace(/^BMM\s+/, "");
}

export function ProductComponentsView({ data }: { data: AutomotiveScope3MockData }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [selected, setSelected] = useState<ComponentEmission | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const componentTotal = data.components.reduce((a, c) => a + c.tCO2e, 0);
    const withAlt = data.components.filter((c) => c.lowCarbonAlternative).length;
    const totalUnits = data.vehicleModels.reduce((a, m) => a + m.unitsProduced, 0);
    const weightedLifecycle =
      data.vehicleModels.reduce((a, m) => a + m.lifecycleTCO2e * m.unitsProduced, 0) / totalUnits;
    const productionPhase = data.lifecycle.find((l) => l.phase === "Production");
    const iceProd = productionPhase?.iceTCO2e ?? 0;
    const evProd = productionPhase?.evTCO2e ?? 0;
    const evSavingsPct = iceProd > 0 ? Math.round((1 - evProd / iceProd) * 100) : 0;
    return { componentTotal, withAlt, weightedLifecycle, evSavingsPct };
  }, [data]);

  const modelStackData = useMemo(
    () =>
      data.vehicleModels.map((m) => ({
        id: m.id,
        name: shortModelName(m.name),
        fullName: m.name,
        powertrain: m.powertrain,
        Production: m.productionTCO2e,
        "Use phase": m.usePhaseTCO2e,
        EoL: m.eolTCO2e,
        lifecycle: m.lifecycleTCO2e,
        units: m.unitsProduced,
        share: m.shareOfScope3Pct,
      })),
    [data.vehicleModels],
  );

  const iceEvData = useMemo(
    () =>
      data.lifecycle.map((l) => ({
        phase: l.phase === "Use phase" ? "Use" : l.phase === "End-of-life" ? "EoL" : l.phase,
        ICE: Math.round(l.iceTCO2e / 1000),
        EV: Math.round(l.evTCO2e / 1000),
      })),
    [data.lifecycle],
  );

  const productInsights = useMemo(
    () => data.quickInsights.filter((q) => /battery|component|model|EV|use phase|production/i.test(q.text)),
    [data.quickInsights],
  );

  const selectedModel = selectedModelId ? data.vehicleModels.find((m) => m.id === selectedModelId) : null;

  return (
    <div className={autoPage}>
      <div className={autoSegmentGroup}>
        {(
          [
            ["overview", "Overview"],
            ["components", "Components"],
            ["models", "Vehicle models"],
            ["ice_ev", "ICE vs EV"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" {...autoSegmentTabButtonProps(tab === id)} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <AutoKpiGrid cols="sm:grid-cols-2 lg:grid-cols-4">
        <MiniKpi index={0} label="Component-tracked" value={formatTCO2e(stats.componentTotal, true)} hint="Cat 1 production allocation" />
        <MiniKpi index={1} label="Avg lifecycle" value={`${stats.weightedLifecycle.toFixed(1)} t`} hint="Per vehicle · FY25 weighted" />
        <MiniKpi index={2} label="Decarb options" value={String(stats.withAlt)} hint="Components with low-carbon path" />
        <MiniKpi index={3} label="EV production Δ" value={`−${stats.evSavingsPct}%`} hint="vs ICE · production phase" tone="positive" />
      </AutoKpiGrid>

      {tab === "overview" && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Scope3Panel>
              <Scope3SectionLabel title="Component share" description="Share of tracked production-phase hotspots." />
              <AutoChartBox heightClass="h-[300px]">
<PieChart>
                    <Pie
                      data={data.components}
                      dataKey="tCO2e"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={2}
                      onClick={(_, i) => setSelected(data.components[i])}
                    >
                      {data.components.map((_, i) => (
                        <Cell key={data.components[i].id} fill={CHART_COLORS[i % CHART_COLORS.length]} cursor="pointer" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatTCO2e(Number(v), true)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
</AutoChartBox>
            </Scope3Panel>
            <Scope3Panel>
              <Scope3SectionLabel title="Lifecycle by model" description="tCO₂e per vehicle · stacked by phase." />
              <AutoChartBox heightClass="h-[300px]">
<BarChart data={modelStackData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit=" t" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Production" stackId="a" fill={PHASE_COLORS.production} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Use phase" stackId="a" fill={PHASE_COLORS.use} />
                    <Bar dataKey="EoL" stackId="a" fill={PHASE_COLORS.eol} radius={[4, 4, 0, 0]} />
                  </BarChart>
</AutoChartBox>
            </Scope3Panel>
          </div>

          <Scope3Panel>
            <Scope3SectionLabel title="Component register" description="Click a row for material, supplier, and model linkage." />
            <ComponentRegisterTable
              components={data.components}
              models={data.vehicleModels}
              onSelect={setSelected}
            />
          </Scope3Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Scope3Panel>
              <Scope3SectionLabel title="Portfolio intensity" description="Lifecycle tCO₂e/vehicle vs FY25 volume." />
              <AutoChartBox heightClass="h-[280px]">
<ScatterChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" dataKey="units" name="Units" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="number" dataKey="lifecycle" name="Lifecycle" tick={{ fontSize: 10 }} unit=" t" />
                    <ZAxis type="number" dataKey="share" range={[80, 400]} name="Scope 3 %" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(v, name) => [name === "share" ? `${v}%` : v, name === "lifecycle" ? "tCO₂e/veh" : name]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                    />
                    <Scatter
                      data={modelStackData}
                      fill="var(--primary)"
                      onClick={(p) => setSelectedModelId((p as { id?: string }).id ?? null)}
                    />
                  </ScatterChart>
</AutoChartBox>
            </Scope3Panel>
            <Scope3Panel>
              <Scope3SectionLabel title="Product insights" />
              <ul className="space-y-2">
                {(productInsights.length ? productInsights : data.quickInsights).slice(0, 4).map((q) => (
                  <li key={q.id} className={autoCallout + " flex gap-2"}>
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
                    <span className="text-sm">{q.text}</span>
                  </li>
                ))}
              </ul>
            </Scope3Panel>
          </div>

          <ComponentModelMatrix components={data.components} models={data.vehicleModels} onSelectComponent={setSelected} />
        </>
      )}

      {tab === "components" && (
        <>
          <div className="grid gap-6 lg:grid-cols-5">
            <Scope3Panel className="lg:col-span-3">
              <Scope3SectionLabel title="Emissions by component" description="Horizontal bars · click to drill down." />
              <AutoChartBox heightClass="h-[360px]">
<BarChart layout="vertical" data={[...data.components].sort((a, b) => b.tCO2e - a.tCO2e)} margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatTCO2e(Number(v), true)} />
                    <Bar
                      dataKey="tCO2e"
                      fill="var(--primary)"
                      radius={[0, 6, 6, 0]}
                      onClick={(entry) => {
                        const name = (entry as { name?: string }).name;
                        const c = data.components.find((x) => x.name === name);
                        if (c) setSelected(c);
                      }}
                    />
                  </BarChart>
</AutoChartBox>
            </Scope3Panel>
            <Scope3Panel className="lg:col-span-2">
              <Scope3SectionLabel title="Hotspot ranking" />
              <ol className="space-y-2">
                {data.components.map((c, i) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm transition hover:bg-[var(--muted)]/40"
                      onClick={() => setSelected(c)}
                    >
                      <span className="w-6 font-mono text-xs text-[var(--foreground-subtle)]">#{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums">{c.pct}%</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--foreground-muted)]" aria-hidden />
                    </button>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(c.pct * 2.2, 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            </Scope3Panel>
          </div>
          <Scope3Panel>
            <Scope3SectionLabel title="Full register" />
            <ComponentRegisterTable components={data.components} models={data.vehicleModels} onSelect={setSelected} />
          </Scope3Panel>
        </>
      )}

      {tab === "models" && (
        <>
          <Scope3Panel>
            <Scope3SectionLabel title="Lifecycle comparison" description="Per-vehicle tCO₂e by phase — click scatter point for detail." />
            <VehicleModelsTable
              data={data.vehicleModels}
              onSelect={(m) => setSelectedModelId(m.id)}
              selectedId={selectedModelId}
            />
          </Scope3Panel>
          <div className="grid gap-6 lg:grid-cols-2">
            <Scope3Panel>
              <Scope3SectionLabel title="Production vs use phase" />
              <AutoChartBox>
<BarChart data={modelStackData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Production" fill={PHASE_COLORS.production} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Use phase" fill={PHASE_COLORS.use} radius={[4, 4, 0, 0]} />
                  </BarChart>
</AutoChartBox>
            </Scope3Panel>
            <Scope3Panel>
              <Scope3SectionLabel title="Scope 3 portfolio share" />
              <AutoChartBox>
<BarChart data={modelStackData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="share" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
</AutoChartBox>
            </Scope3Panel>
          </div>
        </>
      )}

      {tab === "ice_ev" && (
        <>
          <Scope3Panel>
            <Scope3SectionLabel
              title="Lifecycle ICE vs EV"
              description="Portfolio-level tCO₂e (thousands) by phase — production, use, and end-of-life."
            />
            <AutoChartBox heightClass="h-[320px]">
<BarChart data={iceEvData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="phase" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: "kt CO₂e", angle: -90, position: "insideLeft", fontSize: 10 }} />
                  <Tooltip formatter={(v) => `${v} kt`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ICE" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="EV" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
</AutoChartBox>
          </Scope3Panel>
          <div className="grid gap-4 md:grid-cols-3">
            {data.lifecycle.map((l) => {
              const savings = l.iceTCO2e > 0 ? Math.round((1 - l.evTCO2e / l.iceTCO2e) * 100) : 0;
              return (
                <Scope3Panel key={l.phase}>
                  <p className="text-xs font-semibold uppercase text-[var(--foreground-muted)]">{l.phase}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase text-orange-500">ICE</p>
                      <p className="text-lg font-bold tabular-nums">{formatTCO2e(l.iceTCO2e, true)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-emerald-500">EV</p>
                      <p className="text-lg font-bold tabular-nums">{formatTCO2e(l.evTCO2e, true)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                    EV avoids <strong className="text-emerald-400">{savings}%</strong> vs ICE portfolio proxy
                  </p>
                </Scope3Panel>
              );
            })}
          </div>
          <Scope3Panel>
            <Scope3SectionLabel title="Model-level intensity" description="Where use-phase dominates vs production." />
            <VehicleModelsTable data={data.vehicleModels} onSelect={(m) => setSelectedModelId(m.id)} selectedId={selectedModelId} />
          </Scope3Panel>
        </>
      )}

      <Scope3DrilldownDrawer
        open={!!selected}
        title={selected?.name ?? ""}
        subtitle="Component hotspot · materials & supply chain"
        onClose={() => setSelected(null)}
        size="md"
      >
        {selected ? <ComponentDrillBody component={selected} models={data.vehicleModels} /> : null}
      </Scope3DrilldownDrawer>

      <Scope3DrilldownDrawer
        open={!!selectedModel}
        title={selectedModel?.name ?? ""}
        subtitle="Vehicle lifecycle profile"
        onClose={() => setSelectedModelId(null)}
        size="md"
      >
        {selectedModel ? <ModelDrillBody model={selectedModel} components={data.components} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function MiniKpi({
  label,
  value,
  hint,
  tone = "neutral",
  index = 0,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "positive";
  index?: number;
}) {
  return (
    <AutoKpiCard
      label={label}
      value={value}
      sub={hint}
      tone={tone === "positive" ? "emerald" : autoKpiToneAt(index)}
    />
  );
}

function ComponentRegisterTable({
  components,
  models,
  onSelect,
}: {
  components: ComponentEmission[];
  models: AutomotiveScope3MockData["vehicleModels"];
  onSelect: (c: ComponentEmission) => void;
}) {
  const modelName = (id: string) => models.find((m) => m.id === id)?.name ?? id;
  return (
    <div className={autoTableShell}>
      <table className={autoTable}>
        <thead>
          <tr>
            <th className={autoTh}>Component</th>
            <th className={autoTh}>Emissions</th>
            <th className={autoTh}>Share</th>
            <th className={autoTh}>Top supplier</th>
            <th className={autoTh}>Models</th>
          </tr>
        </thead>
        <tbody>
          {components.map((c) => (
            <tr key={c.id} className={autoTrInteractive} onClick={() => onSelect(c)}>
              <td className={autoTd}>
                <span className="font-medium">{c.name}</span>
                {c.lowCarbonAlternative ? (
                  <span className="ml-2 text-[10px] text-emerald-500">decarb path</span>
                ) : null}
              </td>
              <td className={`${autoTd} tabular-nums`}>{formatTCO2e(c.tCO2e, true)}</td>
              <td className={autoTd}>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(c.pct * 2, 100)}%` }} />
                  </div>
                  <span className="text-xs tabular-nums">{c.pct}%</span>
                </div>
              </td>
              <td className={`${autoTd} text-xs`}>
                {c.topSuppliers[0]?.name ?? "—"}
                {c.topSuppliers[0] ? <span className="text-[var(--foreground-muted)]"> · {c.topSuppliers[0].pct}%</span> : null}
              </td>
              <td className={`${autoTd} text-xs text-[var(--foreground-muted)]`}>
                {c.modelIds.map((id) => shortModelName(modelName(id))).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComponentModelMatrix({
  components,
  models,
  onSelectComponent,
}: {
  components: ComponentEmission[];
  models: AutomotiveScope3MockData["vehicleModels"];
  onSelectComponent: (c: ComponentEmission) => void;
}) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Component × model matrix" description="Filled cells = component used on platform." />
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border-b border-[var(--border)] px-2 py-2 text-left font-semibold text-[var(--foreground-muted)]">
                Component
              </th>
              {models.map((m) => (
                <th
                  key={m.id}
                  className="border-b border-[var(--border)] px-2 py-2 text-center font-semibold text-[var(--foreground-muted)]"
                >
                  {shortModelName(m.name)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c.id} className="hover:bg-[var(--muted)]/30">
                <td className="border-b border-[var(--border)] px-2 py-2">
                  <button type="button" className="font-medium text-left hover:text-[var(--primary)]" onClick={() => onSelectComponent(c)}>
                    {c.name}
                  </button>
                </td>
                {models.map((m) => (
                  <td key={m.id} className="border-b border-[var(--border)] px-2 py-2 text-center">
                    {c.modelIds.includes(m.id) ? (
                      <span
                        className="inline-block h-3 w-3 rounded-sm bg-[var(--primary)]"
                        title={`${c.pct}% of component pool`}
                        aria-label={`Used on ${m.name}`}
                      />
                    ) : (
                      <span className="text-[var(--foreground-subtle)]">·</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Scope3Panel>
  );
}

function ComponentDrillBody({
  component,
  models,
}: {
  component: ComponentEmission;
  models: AutomotiveScope3MockData["vehicleModels"];
}) {
  const linked = models.filter((m) => component.modelIds.includes(m.id));
  return (
    <div className="space-y-5 text-sm">
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
        <div>
          <p className="text-[var(--foreground-muted)]">Emissions</p>
          <p className="text-lg font-bold tabular-nums">{formatTCO2e(component.tCO2e, true)}</p>
        </div>
        <div>
          <p className="text-[var(--foreground-muted)]">Portfolio share</p>
          <p className="text-lg font-bold tabular-nums">{component.pct}%</p>
        </div>
      </div>
      <section>
        <p className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">Material composition</p>
        <ul className="mt-2 space-y-2">
          {component.materials.map((m) => (
            <li key={m.material}>
              <div className="flex justify-between text-xs">
                <span>{m.material}</span>
                <span className="font-semibold tabular-nums">{m.pct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${m.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <p className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">Top suppliers</p>
        <ul className="mt-2 space-y-1">
          {component.topSuppliers.map((s) => (
            <li key={s.name} className="flex justify-between rounded-md border border-[var(--border)] px-3 py-2 text-xs">
              <span>{s.name}</span>
              <span className="font-semibold">{s.pct}% of component</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <p className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">Vehicle platforms</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {linked.map((m) => (
            <span key={m.id} className={powertrainPillClass(m.powertrain)}>
              {shortModelName(m.name)}
            </span>
          ))}
        </div>
      </section>
      {component.lowCarbonAlternative ? (
        <p className={autoCallout}>
          <strong className="text-[var(--foreground)]">Low-carbon path:</strong> {component.lowCarbonAlternative}
        </p>
      ) : null}
    </div>
  );
}

function ModelDrillBody({
  model,
  components,
}: {
  model: AutomotiveScope3MockData["vehicleModels"][number];
  components: ComponentEmission[];
}) {
  const linked = components.filter((c) => c.modelIds.includes(model.id));
  const useShare = Math.round((model.usePhaseTCO2e / model.lifecycleTCO2e) * 100);
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={powertrainPillClass(model.powertrain)}>{model.powertrain}</span>
        <span className="text-xs text-[var(--foreground-muted)]">{model.unitsProduced.toLocaleString()} units · FY25</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {(
          [
            ["Production", model.productionTCO2e, PHASE_COLORS.production],
            ["Use phase", model.usePhaseTCO2e, PHASE_COLORS.use],
            ["EoL", model.eolTCO2e, PHASE_COLORS.eol],
          ] as const
        ).map(([label, val, color]) => (
          <div key={label} className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-[var(--foreground-muted)]">{label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums" style={{ color }}>
              {val} t
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--foreground-muted)]">
        Lifecycle <strong>{model.lifecycleTCO2e} tCO₂e/vehicle</strong> · {useShare}% from use phase ·{" "}
        <strong>{model.shareOfScope3Pct}%</strong> of enterprise Scope 3
      </p>
      <section>
        <p className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)]">Key components on platform</p>
        <ul className="mt-2 space-y-1">
          {linked.map((c) => (
            <li key={c.id} className="flex justify-between rounded-md border border-[var(--border)] px-3 py-2 text-xs">
              <span>{c.name}</span>
              <span className="text-[var(--foreground-muted)]">{formatTCO2e(c.tCO2e, true)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function VehicleModelsTable({
  data,
  onSelect,
  selectedId,
}: {
  data: AutomotiveScope3MockData["vehicleModels"];
  onSelect?: (m: AutomotiveScope3MockData["vehicleModels"][number]) => void;
  selectedId?: string | null;
}) {
  const maxLifecycle = Math.max(...data.map((m) => m.lifecycleTCO2e));
  return (
    <div className={autoTableShell}>
      <table className={autoTable}>
        <thead>
          <tr>
            <th className={autoTh}>Model</th>
            <th className={autoTh}>Powertrain</th>
            <th className={autoTh}>Production</th>
            <th className={autoTh}>Use phase</th>
            <th className={autoTh}>EoL</th>
            <th className={autoTh}>Lifecycle</th>
            <th className={autoTh}>Units</th>
            <th className={autoTh}>Scope 3 %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr
              key={m.id}
              className={onSelect ? autoTrInteractive : undefined}
              onClick={onSelect ? () => onSelect(m) : undefined}
              data-selected={selectedId === m.id ? true : undefined}
              style={selectedId === m.id ? { background: "var(--muted)" } : undefined}
            >
              <td className={autoTd}>
                <span className="font-medium">{m.name}</span>
              </td>
              <td className={autoTd}>
                <span className={powertrainPillClass(m.powertrain)}>{m.powertrain}</span>
              </td>
              <td className={`${autoTd} tabular-nums`}>{m.productionTCO2e} t</td>
              <td className={`${autoTd} tabular-nums`}>{m.usePhaseTCO2e} t</td>
              <td className={`${autoTd} tabular-nums`}>{m.eolTCO2e} t</td>
              <td className={autoTd}>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 min-w-[72px] flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${(m.lifecycleTCO2e / maxLifecycle) * 100}%` }}
                    />
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">{m.lifecycleTCO2e} t</span>
                </div>
              </td>
              <td className={`${autoTd} tabular-nums text-xs`}>{m.unitsProduced.toLocaleString()}</td>
              <td className={`${autoTd} tabular-nums`}>{m.shareOfScope3Pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

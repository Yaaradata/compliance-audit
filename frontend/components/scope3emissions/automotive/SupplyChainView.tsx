"use client";

import { useMemo, useState } from "react";
import { Cog, Factory, Hammer, Zap } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SupplierProgrammePanel } from "./BusinessPanels";
import {
  AutoChartBox,
  autoPage,
  autoSegmentGroup,
  autoSegmentTabButtonProps,
  autoTable,
  autoTableShell,
  autoTd,
  autoTh,
  autoTrInteractive,
  AutoKpiCard,
  AutoKpiGrid,
  autoKpiToneAt,
  formatTCO2e,
  riskColor,
  statusBadgeClass,
} from "./automotive-ui";
import {
  buildCategoryKpiCards,
  buildSupplyChainTiers,
  type CategoryKpiCard,
  type SupplyChainTierDetail,
  type SupplyChainTierId,
  type TierTrend,
} from "./supply-chain-tier-data";
import type { AutomotiveScope3MockData, SupplierDrillDetail, SupplierNode } from "./types";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";

const TIER_ICONS = {
  0: Factory,
  1: Cog,
  2: Zap,
  3: Hammer,
} as const;

function trendLabel(trend: TierTrend): { text: string; className: string } {
  if (trend === "reducing") return { text: "↓ Reducing", className: "text-emerald-400" };
  if (trend === "increasing") return { text: "↑ Rising", className: "text-amber-400" };
  return { text: "→ Stable", className: "text-[var(--foreground-muted)]" };
}

export type SupplyChainSubView = "tiers" | "register";

export function SupplyChainTabSwitcher({
  value,
  onChange,
}: {
  value: SupplyChainSubView;
  onChange: (tab: SupplyChainSubView) => void;
}) {
  return (
    <div className={`${autoSegmentGroup} w-auto max-w-none shrink-0`} role="tablist" aria-label="Supply chain view">
      {(
        [
          ["tiers", "Tier map"],
          ["register", "Supplier register"],
        ] as const
      ).map(([id, label]) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            {...autoSegmentTabButtonProps(active)}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function SupplyChainView({
  data,
  viewTab,
}: {
  data: AutomotiveScope3MockData;
  viewTab: SupplyChainSubView;
}) {
  const [tierId, setTierId] = useState<SupplyChainTierId>(0);
  const [selected, setSelected] = useState<SupplierNode | null>(null);
  const [whatIf, setWhatIf] = useState<string | null>(null);

  const categoryCards = useMemo(() => buildCategoryKpiCards(data), [data]);
  const tiers = useMemo(() => buildSupplyChainTiers(data), [data]);
  const activeTier = tiers.find((t) => t.id === tierId) ?? tiers[0]!;

  const whatIfImpact = useMemo(() => {
    if (!whatIf) return { tCO2e: 0, costPct: 0 };
    const s = data.suppliers.find((x) => x.id === whatIf);
    return s
      ? { tCO2e: Math.round(s.tCO2e * 0.22), costPct: s.compliance === "Non-compliant" ? 8 : 4 }
      : { tCO2e: 0, costPct: 0 };
  }, [whatIf, data.suppliers]);

  const tierSuppliers = useMemo(() => {
    if (tierId === 0) return data.suppliers.filter((s) => s.tier === 1).slice(0, 6);
    return data.suppliers.filter((s) => s.tier === tierId);
  }, [data.suppliers, tierId]);

  return (
    <div className={autoPage}>
      <CategoryKpiRow cards={categoryCards} />

      {viewTab === "tiers" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <TierTabCard key={tier.id} tier={tier} active={tierId === tier.id} onSelect={() => setTierId(tier.id)} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TierDetailPanel tier={activeTier} plants={data.company.plants.join(" · ")} />
            <EmissionBreakdownPanel tier={activeTier} />
          </div>

          {tierId > 0 ? (
            <Scope3Panel>
              <Scope3SectionLabel
                title={`${activeTier.tabLabel} suppliers`}
                description="Click a supplier for PCF status, trend, and compliance drill-down."
              />
              <SupplierMiniTable suppliers={tierSuppliers} onSelect={setSelected} />
            </Scope3Panel>
          ) : null}
        </>
      ) : (
        <>
          <SupplierProgrammePanel data={data} />

          <Scope3Panel>
            <Scope3SectionLabel
              title="What-if modelling"
              description="Replace a supplier and preview projected emission impact."
            />
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-semibold text-[var(--foreground-muted)]">Replace supplier</span>
                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  value={whatIf ?? ""}
                  onChange={(e) => setWhatIf(e.target.value || null)}
                >
                  <option value="">Select…</option>
                  {data.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              {whatIf ? (
                <p className="text-sm text-[var(--foreground-muted)]">
                  Projected reduction:{" "}
                  <strong className="text-[var(--success)]">−{formatTCO2e(whatIfImpact.tCO2e, true)}</strong>
                  {" · "}Est. cost impact: <strong>+{whatIfImpact.costPct}%</strong> spend
                </p>
              ) : null}
            </div>
          </Scope3Panel>

          <Scope3Panel>
            <Scope3SectionLabel title="Risk heatmap" description="High emissions + low compliance = critical quadrant." />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {data.supplierRiskHeatmap.slice(0, 12).map((h) => (
                <div
                  key={h.supplierId}
                  className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs"
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor:
                      h.quadrant === "Critical"
                        ? "var(--danger)"
                        : h.quadrant === "Engage"
                          ? "var(--warning)"
                          : h.quadrant === "Leader"
                            ? "var(--success)"
                            : "var(--primary)",
                  }}
                >
                  <div className="font-semibold">{h.name}</div>
                  <div className="mt-1 text-[var(--foreground-muted)]">
                    {h.quadrant} · #{h.emissionsRank}
                  </div>
                </div>
              ))}
            </div>
          </Scope3Panel>

          <Scope3Panel>
            <Scope3SectionLabel title="Supplier ranking" description="Click a row for drilldown." />
            <SupplierMiniTable suppliers={data.suppliers} onSelect={setSelected} full />
          </Scope3Panel>
        </>
      )}

      <Scope3DrilldownDrawer
        open={!!selected}
        title={selected?.name ?? ""}
        subtitle={selected ? `Tier ${selected.tier} · ${selected.geography}` : ""}
        onClose={() => setSelected(null)}
      >
        {selected ? <SupplierDrillBody supplier={selected} drill={data.supplierDrillById[selected.id]} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function CategoryKpiRow({ cards }: { cards: CategoryKpiCard[] }) {
  return (
    <AutoKpiGrid cols="sm:grid-cols-3 lg:grid-cols-6" className="mb-6">
      {cards.map((c, i) => (
        <AutoKpiCard
          key={c.id}
          variant="hero"
          label={c.catLabel}
          value={`${c.pct}%`}
          sub={c.title}
          tone={autoKpiToneAt(i)}
          barPct={Math.min(c.pct * 2.2, 100)}
          barColor={c.barColor}
          accentColor={c.barColor}
        />
      ))}
    </AutoKpiGrid>
  );
}

function TierTabCard({
  tier,
  active,
  onSelect,
}: {
  tier: SupplyChainTierDetail;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = TIER_ICONS[tier.id];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-center transition",
        active
          ? "border-transparent bg-gradient-to-br from-[var(--primary)]/15 to-teal-500/10 shadow-md ring-2 ring-[var(--primary)]/35"
          : "border-[var(--border)] bg-[var(--card)] hover:border-teal-500/40 hover:bg-[var(--muted)]/30 hover:shadow-sm",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-11 w-11 items-center justify-center rounded-lg",
          active ? "bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-sm" : "bg-[var(--muted)] text-[var(--foreground-muted)]",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-sm font-semibold text-[var(--foreground)]">{tier.tabLabel}</span>
    </button>
  );
}

function TierDetailPanel({ tier, plants }: { tier: SupplyChainTierDetail; plants: string }) {
  const Icon = TIER_ICONS[tier.id];
  return (
    <Scope3Panel className="!p-0 overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--muted)]/20 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--primary)]">{tier.tabLabel}</p>
            <h3 className="mt-1 text-xl font-bold text-[var(--foreground)]">{tier.title}</h3>
            {tier.id === 0 ? <p className="mt-1 text-xs text-[var(--foreground-muted)]">Plants: {plants}</p> : null}
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {(
          [
            ["Avg. emissions", tier.avgEmissions],
            ["Supplier count", tier.supplierCount],
            ["GHG protocol", tier.ghgProtocol],
            ["Data source", tier.dataSource],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">{label}</p>
            <p className="mt-1 text-sm font-medium leading-snug text-[var(--foreground)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Risk level</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tier.riskChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)]"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Key entities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tier.keyEntities.map((entity) => (
            <span
              key={entity}
              className="inline-flex rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]"
            >
              {entity}
            </span>
          ))}
        </div>
      </div>
    </Scope3Panel>
  );
}

function EmissionBreakdownPanel({ tier }: { tier: SupplyChainTierDetail }) {
  return (
    <Scope3Panel>
      <Scope3SectionLabel title="Emission breakdown" description="Per vehicle — category detail" />
      <ul className="mt-2 space-y-4">
        {tier.emissionRows.map((row) => {
          const trend = trendLabel(row.trend);
          return (
            <li key={row.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-[var(--foreground)]">{row.label}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${trend.className}`}>{trend.text}</span>
                  <span className="tabular-nums font-semibold text-[var(--foreground)]">{row.valuePerVehicle} tCO₂e/veh</span>
                </div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${row.barPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Calculation method</p>
        <p className="mt-1 text-sm font-semibold text-[var(--primary)]">{tier.calculationMethod}</p>
      </div>
    </Scope3Panel>
  );
}

function SupplierMiniTable({
  suppliers,
  onSelect,
  full = false,
}: {
  suppliers: SupplierNode[];
  onSelect: (s: SupplierNode) => void;
  full?: boolean;
}) {
  const rows = full ? suppliers : suppliers.slice(0, 8);
  return (
    <div className={autoTableShell}>
      <table className={autoTable}>
        <thead>
          <tr>
            <th className={autoTh}>Supplier</th>
            <th className={autoTh}>Tier</th>
            <th className={autoTh}>Emissions</th>
            <th className={autoTh}>Intensity</th>
            <th className={autoTh}>Compliance</th>
            <th className={autoTh}>Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className={autoTrInteractive} onClick={() => onSelect(s)}>
              <td className={autoTd}>{s.name}</td>
              <td className={autoTd}>Tier {s.tier}</td>
              <td className={`${autoTd} tabular-nums`}>{formatTCO2e(s.tCO2e, true)}</td>
              <td className={`${autoTd} tabular-nums`}>{s.intensity}</td>
              <td className={autoTd}>
                <span className={statusBadgeClass(s.compliance)}>{s.compliance}</span>
              </td>
              <td className={autoTd}>
                <span style={{ color: riskColor(s.riskLevel) }}>{s.riskScore.toFixed(1)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SupplierDrillBody({ supplier, drill }: { supplier: SupplierNode; drill?: SupplierDrillDetail }) {
  const spend = supplier.spendINRCr ?? drill?.spendINRCr;
  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <p>
          <strong>Emissions:</strong> {formatTCO2e(supplier.tCO2e, true)}
          {drill ? ` (${drill.emissionsSharePct}% of inventory)` : null}
        </p>
        {spend ? (
          <p>
            <strong>Spend:</strong> ₹{spend} Cr FY25
          </p>
        ) : null}
        <p>
          <strong>PCF:</strong> {supplier.pcfStatus ?? drill?.pcfStatus ?? "—"}
          {drill?.lastPcfDate ? ` · last ${drill.lastPcfDate}` : null}
        </p>
        <p>
          <strong>SBTi:</strong> {drill?.sbtiStatus ?? "—"}
        </p>
      </div>
      {drill ? (
        <p className="text-xs text-[var(--foreground-muted)]">
          <strong>Lineage:</strong> {drill.dataLineage}
        </p>
      ) : null}
      {drill?.inboundModes?.length ? (
        <p>
          <strong>Inbound:</strong> {drill.inboundModes.join(" · ")}
        </p>
      ) : null}
      <p>
        <strong>Components:</strong> {supplier.components.join(", ")}
      </p>
      <p>
        <strong>Certifications:</strong>{" "}
        {supplier.certifications.length ? supplier.certifications.join(", ") : "None on file"}
      </p>
      <p>
        <strong>Risk score:</strong> {supplier.riskScore} ({supplier.riskLevel})
      </p>
      <p>
        <strong>Plant destination:</strong> {supplier.plantDestination ?? "—"}
      </p>
      {supplier.alternateSupplier ? (
        <p>
          <strong>Alternate:</strong> {supplier.alternateSupplier}
        </p>
      ) : null}
      {drill?.capActions?.length ? (
        <div>
          <strong className="mb-1 block">CAP actions</strong>
          <ul className="list-inside list-disc text-xs">
            {drill.capActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {drill?.linkedRecords?.length ? (
        <p className="text-xs">
          <strong>Ledger records:</strong> {drill.linkedRecords.join(", ")}
        </p>
      ) : null}
      <div>
        <strong className="mb-2 block">Emissions trend</strong>
        <AutoChartBox heightClass="h-[160px]">
<LineChart data={supplier.emissionsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatTCO2e(Number(v), true)} />
              <Line type="monotone" dataKey="tCO2e" stroke="var(--primary)" strokeWidth={2} />
            </LineChart>
</AutoChartBox>
      </div>
    </div>
  );
}

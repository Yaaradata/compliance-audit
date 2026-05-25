"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  Building2,
  Car,
  CloudSun,
  Factory,
  HardHat,
  Home,
  Landmark,
  LayoutGrid,
  Leaf,
  LineChart,
  Link2,
  Package,
  PiggyBank,
  Plane,
  ScrollText,
  Server,
  Ship,
  ShoppingCart,
  Sprout,
  Store,
  Waves,
  Zap,
} from "lucide-react";
import type { CarbonLensLeafId } from "./types";
import { CARBON_LENS_NAV, type CarbonLensGroupId } from "./carbonLensNav";
import { bankBackButton, bankPageTight } from "./banking-ui";
import { Scope3SectionLabel } from "../Pharma/scope3-ui";

const GROUP_META: Record<
  CarbonLensGroupId,
  { label: string; shortLabel: string; description: string; icon: LucideIcon }
> = {
  financed: {
    label: "Financed emissions",
    shortLabel: "Financed",
    description: "Category 15 — loans, investments, and trade book (PCAF).",
    icon: Building2,
  },
  own_ops: {
    label: "Own operations",
    shortLabel: "Own ops",
    description: "Non-financed Scope 3 — travel, commuting, procurement, DCs, waste & capex.",
    icon: Factory,
  },
  green: {
    label: "Green finance",
    shortLabel: "Green",
    description: "Green loans, bonds, deposits, and sustainability-linked structures.",
    icon: Leaf,
  },
  climate: {
    label: "Climate risk",
    shortLabel: "Climate",
    description: "Physical & transition risk and stress testing.",
    icon: CloudSun,
  },
};

const LEAF_ICONS: Record<CarbonLensLeafId, LucideIcon> = {
  portfolio_overview: LayoutGrid,
  corporate_loans: Landmark,
  project_finance: HardHat,
  retail_loans: Home,
  msme_loans: Store,
  trade_finance: Ship,
  investment_portfolio: LineChart,
  business_travel: Plane,
  employee_commuting: Car,
  purchased_goods_services: ShoppingCart,
  it_data_centers: Server,
  waste_capital_goods: Package,
  carbon_green_loans: Sprout,
  carbon_green_bonds: ScrollText,
  carbon_green_deposits: PiggyBank,
  carbon_sustainability_linked_loans: Link2,
  physical_risk: Waves,
  transition_risk: Zap,
  climate_stress_testing: Activity,
};

export function CarbonLensMainHub({
  allowedLeaves,
  onSelectGroup,
}: {
  allowedLeaves: CarbonLensLeafId[];
  onSelectGroup: (id: CarbonLensGroupId) => void;
}) {
  const allow = new Set(allowedLeaves);

  return (
    <div className={bankPageTight}>
      <p className="max-w-2xl text-sm leading-relaxed text-[var(--foreground-muted)]">
        Choose a portfolio lens. Sub-areas open as tiles on the next screen — four pillars: financed emissions, own operations, green finance, and climate risk.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {CARBON_LENS_NAV.map((g) => {
          const accessibleCount = g.children.filter((c) => allow.has(c.id)).length;
          const meta = GROUP_META[g.id];
          const Icon = meta.icon;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectGroup(g.id)}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-left shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] transition hover:border-[var(--primary)]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] dark:ring-white/[0.06]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/12 text-[var(--primary)] transition group-hover:bg-[var(--primary)]/20">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <div className="text-lg font-bold tracking-tight text-[var(--foreground)]">{meta.label}</div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">{meta.description}</p>
                <p className="mt-4 text-xs font-semibold text-[var(--primary)]">Open icon grid →</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CarbonLensSubHub({
  groupId,
  allowedLeaves,
  onSelectLeaf,
  onBack,
}: {
  groupId: CarbonLensGroupId;
  allowedLeaves: CarbonLensLeafId[];
  onSelectLeaf: (id: CarbonLensLeafId) => void;
  onBack: () => void;
}) {
  const group = CARBON_LENS_NAV.find((g) => g.id === groupId);
  const allow = new Set(allowedLeaves);
  const meta = GROUP_META[groupId];
  const GroupIcon = meta.icon;
  /** All tiles in the pillar — persona RBAC may still filter data inside each leaf. */
  const tiles = group?.children ?? [];

  return (
    <div className={bankPageTight}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className={bankBackButton}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All lenses
        </button>
      </div>
      <div className="flex flex-wrap items-start gap-4 border-b border-[var(--border)] pb-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/12 text-[var(--primary)]">
          <GroupIcon className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Carbon Lens</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)]">{meta.label}</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--foreground-muted)]">{meta.description}</p>
        </div>
      </div>

      <Scope3SectionLabel title="Choose a view" description="Each tile opens the detailed analytics and drill-down register for that slice." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tiles.map((c) => {
          const Icon = LEAF_ICONS[c.id] ?? LayoutGrid;
          const inScope = allow.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectLeaf(c.id)}
              className={
                "flex flex-col items-center gap-3 rounded-2xl border bg-[var(--card)] px-4 py-8 text-center shadow-sm ring-1 transition hover:border-[var(--primary)]/45 hover:bg-[var(--muted)]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] dark:ring-white/[0.06] " +
                (inScope
                  ? "border-[var(--border)] ring-slate-900/[0.04]"
                  : "border-dashed border-[var(--border)] opacity-90 ring-slate-900/[0.02]")
              }
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Icon className="h-8 w-8" aria-hidden />
              </span>
              <span className="text-sm font-semibold leading-snug text-[var(--foreground)]">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

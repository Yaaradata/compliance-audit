"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { filterScope3Data } from "./filterScope3Data";
import { defaultGlobalFilters } from "./GlobalFiltersBar";
import { InventoryScopeToolbar } from "./InventoryScopeToolbar";
import type { GlobalFilters } from "./types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Car,
  FileText,
  LayoutDashboard,
  MapPin,
  PanelLeft,
  PanelLeftClose,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Gauge,
  Truck,
  Wrench,
} from "lucide-react";
import type { AutoNavViewId, AutoPersonaId } from "./types";
import { automotiveScope3MockData } from "./mockData";
import {
  PERSONA_LABELS,
  defaultViewForPersona,
  personaScopeHint,
  showCfoPanel,
  showCsoPanels,
  showDataQualityPanel,
  showPlantPanel,
  showPortfolioPanel,
  showProcurementPanel,
  visibleNavViews,
} from "./personaAccess";
import {
  Cat11AssumptionsPanel,
  CfoFinancialPanel,
  DataQualityRemediationPanel,
  ModelPortfolioMatrix,
  PlantCockpitPanel,
  ProcurementScorecardPanel,
  SbtiCockpitPanel,
} from "./BusinessPanels";
import { autoSegmentTabStyle } from "./automotive-ui";
import { parseAutoNavViewId, parseAutoPersonaId } from "./automotive-url";
import { OverviewView } from "./OverviewView";
import { SupplyChainTabSwitcher, SupplyChainView, type SupplyChainSubView } from "./SupplyChainView";
import { ValueChainView } from "./ValueChainView";
import { EmissionsTrackingView } from "./EmissionsTrackingView";
import { ComplianceAuditView } from "./ComplianceAuditView";
import {
  defaultIntensityTabForPersona,
  intensityTabsForPersona,
  IntensityRatioTabSwitcher,
  IntensityRatioView,
  type IntensityRatioTab,
} from "./IntensityRatioView";
import { ProductComponentsView } from "./ProductComponentsView";
import { AIInsightsView } from "./AIInsightsView";
import { GeographyView, ReportsView } from "./views";
import {
  SCOPE3_MAX_WIDTH,
  Scope3DashboardSkeleton,
  Scope3Panel,
  Scope3ViewHeader,
  scope3IconButtonClass,
  scope3SelectClass,
} from "../Pharma/scope3-ui";

const NAV_META: Record<AutoNavViewId, { label: string; icon: typeof LayoutDashboard; badgeKey?: "ai" | "controls" }> = {
  overview: { label: "Overview", icon: LayoutDashboard },
  supply_chain: { label: "Supply chain", icon: Truck },
  value_chain: { label: "Upstream/Downstream", icon: Route },
  product_components: { label: "Products & components", icon: Wrench },
  geography: { label: "Geography & logistics", icon: MapPin },
  emissions_tracking: { label: "GHG tracking", icon: Car },
  intensity_ratio: { label: "Finance View", icon: Gauge },
  compliance_audit: { label: "Compliance & audit", icon: ShieldCheck, badgeKey: "controls" },
  insights: { label: "AI insights", icon: Sparkles, badgeKey: "ai" },
  reports: { label: "Reports", icon: FileText },
};

const VIEW_COPY: Record<AutoNavViewId, { eyebrow: string; title: string; subtitle: string }> = {
  overview: {
    eyebrow: "Lifecycle",
    title: "Overview dashboard",
    subtitle: "Total Scope 3, lifecycle breakdown, trends, and top contributors across production, use phase, and end-of-life.",
  },
  supply_chain: {
    eyebrow: "Tier 1–3",
    title: "Supply chain intelligence",
    subtitle: "GHG category split, tier 0–3+ map, per-vehicle emission breakdown, and supplier register with what-if modelling.",
  },
  value_chain: {
    eyebrow: "GHG Protocol",
    title: "Value chain emissions",
    subtitle: "Overview, upstream supply chain, downstream use phase, and FY trend — one section at a time.",
  },
  product_components: {
    eyebrow: "Product carbon",
    title: "Product & component insights",
    subtitle: "Component share, model lifecycle stacks, supplier linkage matrix, ICE vs EV comparison, and decarbonisation drill-downs.",
  },
  geography: {
    eyebrow: "Logistics",
    title: "Geography & logistics",
    subtitle: "Country-level emissions, transport mode breakdown, and regulatory risk overlay.",
  },
  emissions_tracking: {
    eyebrow: "GHG species",
    title: "GHG tracking",
    subtitle: "Gas species rollup, category-wise Scope 3 chart, emission factor register, supplier species table, and intensity trend.",
  },
  intensity_ratio: {
    eyebrow: "Procurement & finance",
    title: "Finance View",
    subtitle: "Product-line intensity, decoupling trends, FY24 investment register (all programmes), and procurement efficiency KPIs.",
  },
  compliance_audit: {
    eyebrow: "BRSR",
    title: "Compliance & audit",
    subtitle: "BRSR framework mapping, audit trail, data completeness, and accuracy by category.",
  },
  insights: {
    eyebrow: "AI",
    title: "AI insights",
    subtitle: "Prioritised model-generated signals — severity, category, workflow, and abatement potential for FY25 Scope 3.",
  },
  reports: {
    eyebrow: "Export",
    title: "Reports & export",
    subtitle: "BRSR Scope 3 disclosure, executive summary, and supplier engagement packs — preview and export.",
  },
};

const SIDEBAR_ORDER: AutoNavViewId[] = [
  "overview",
  "supply_chain",
  "value_chain",
  "product_components",
  "geography",
  "emissions_tracking",
  "intensity_ratio",
  "compliance_audit",
  "insights",
  "reports",
];

/** Operational views where plant / model / supplier / geography filters apply. */
const INVENTORY_SCOPE_VIEWS: readonly AutoNavViewId[] = [
  "overview",
  "product_components",
  "geography",
  "emissions_tracking",
];

function viewUsesInventoryScope(view: AutoNavViewId): boolean {
  return INVENTORY_SCOPE_VIEWS.includes(view);
}

export default function AutomotiveScope3Dashboard() {
  return (
    <Suspense fallback={<Scope3DashboardSkeleton />}>
      <AutomotiveScope3DashboardLoaded />
    </Suspense>
  );
}

function AutomotiveScope3DashboardLoaded() {
  const data = automotiveScope3MockData;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [persona, setPersona] = useState<AutoPersonaId>("sustainability_head");
  const [view, setView] = useState<AutoNavViewId>(() => defaultViewForPersona("sustainability_head"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());
  const [showPersonaHint, setShowPersonaHint] = useState(false);
  const [filters, setFilters] = useState<GlobalFilters>(defaultGlobalFilters);
  const [supplyChainTab, setSupplyChainTab] = useState<SupplyChainSubView>("tiers");
  const [intensityTab, setIntensityTab] = useState<IntensityRatioTab>(() => defaultIntensityTabForPersona("sustainability_head"));
  const [highlightInsightId, setHighlightInsightId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filteredData = useMemo(() => filterScope3Data(data, filters), [data, filters]);

  const scheduleNav = useCallback((fn: () => void) => startTransition(fn), []);

  const urlHydratedRef = useRef(false);

  useLayoutEffect(() => {
    if (urlHydratedRef.current) return;
    urlHydratedRef.current = true;
    startTransition(() => {
      const p = parseAutoPersonaId(searchParams.get("persona"));
      if (p) setPersona(p);
      const allowed = visibleNavViews(p ?? persona);
      const v = parseAutoNavViewId(searchParams.get("view"));
      if (v && allowed.includes(v)) setView(v);
      else if (p) setView(defaultViewForPersona(p));
      if (searchParams.get("nav") === "collapsed") setSidebarOpen(false);
    });
  }, [searchParams, persona]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("persona", persona);
    params.set("view", view);
    if (!sidebarOpen) params.set("nav", "collapsed");
    const next = params.toString();
    if (next === searchParams.toString()) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [persona, view, sidebarOpen, pathname, router, searchParams]);

  const allowed = useMemo(() => visibleNavViews(persona), [persona]);

  useEffect(() => {
    if (allowed.includes(view)) return;
    scheduleNav(() => setView(defaultViewForPersona(persona)));
  }, [allowed, persona, view, scheduleNav]);

  useEffect(() => {
    const allowedTabs = intensityTabsForPersona(persona).map((t) => t.id);
    const fallback = defaultIntensityTabForPersona(persona);
    setIntensityTab((current) => (allowedTabs.includes(current) ? current : fallback));
  }, [persona]);

  const navItems = useMemo(() => SIDEBAR_ORDER.filter((id) => allowed.includes(id)), [allowed]);
  const openInsights = data.insightFeed.length;
  const openControls = data.alerts.filter((a) => a.severity === "critical").length;

  const renderView = () => {
    const d = viewUsesInventoryScope(view) ? filteredData : data;
    switch (view) {
      case "overview":
        return (
          <OverviewView
            data={d}
            filters={filters}
            onNavigate={(v) => scheduleNav(() => setView(v as AutoNavViewId))}
          />
        );
      case "supply_chain":
        return <SupplyChainView data={d} viewTab={supplyChainTab} />;
      case "value_chain":
        return <ValueChainView data={d} legalName={d.company.legalName} />;
      case "product_components":
        return <ProductComponentsView data={d} />;
      case "geography":
        return <GeographyView data={d} />;
      case "emissions_tracking":
        return (
          <EmissionsTrackingView
            data={d}
            persona={persona}
            canOpenAiInsights={visibleNavViews(persona).includes("insights")}
            onSelectCategory={() => scheduleNav(() => setView("value_chain"))}
            onOpenSupplier={() => scheduleNav(() => setView("supply_chain"))}
            onOpenAiInsight={(insightId) => {
              setHighlightInsightId(insightId);
              scheduleNav(() => setView("insights"));
            }}
          />
        );
      case "intensity_ratio":
        return (
          <IntensityRatioView
            tab={intensityTab}
            persona={persona}
            data={d}
            onOpenSupplyChain={() => scheduleNav(() => setView("supply_chain"))}
          />
        );
      case "compliance_audit":
        return <ComplianceAuditView data={d} persona={persona} />;
      case "insights":
        return (
          <AIInsightsView
            data={data}
            persona={persona}
            highlightInsightId={highlightInsightId}
            onConsumedHighlightInsight={() => setHighlightInsightId(null)}
          />
        );
      case "reports":
        return <ReportsView data={d} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <a
        href="#auto-scope3-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--primary)] focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>
      <div
        className={`relative sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-[width] duration-200 ${
          sidebarOpen ? "w-[288px]" : "w-14"
        }`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <aside className="flex min-h-0 flex-1 flex-col overflow-hidden text-[var(--sidebar-text)]" aria-label="Automotive Scope 3 navigation">
          <div className={`flex min-h-0 flex-1 flex-col ${sidebarOpen ? "min-w-[288px]" : "w-14"}`}>
            <div
              className={`flex shrink-0 items-start gap-2 border-b border-[var(--sidebar-border)] py-3 sm:py-4 ${
                sidebarOpen ? "justify-between px-3 sm:px-4" : "justify-center px-2"
              }`}
            >
              {sidebarOpen ? (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-text-muted)]">BRSR · GHG Protocol</div>
                    <div className="mt-1 text-sm font-semibold leading-snug">Scope 3 · Automotive</div>
                    <div className="mt-1 text-[10px] text-[var(--sidebar-text-muted)]">Lifecycle & supply chain intelligence</div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-2 text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)]"
                    aria-label="Collapse navigation"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <PanelLeftClose className="h-4 w-4" aria-hidden />
                  </button>
                </>
              ) : (
                <button type="button" className="rounded-lg p-2 hover:bg-[var(--sidebar-hover)]" aria-label="Expand navigation" onClick={() => setSidebarOpen(true)}>
                  <PanelLeft className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
            <nav className={`flex-1 overflow-y-auto py-3 ${sidebarOpen ? "space-y-1 px-2" : "space-y-1.5 px-1.5"}`}>
              {navItems.map((id) => {
                const meta = NAV_META[id];
                const Icon = meta.icon;
                const active = view === id;
                const badge =
                  meta.badgeKey === "controls" ? openControls : meta.badgeKey === "ai" ? openInsights : 0;
                return (
                  <button
                    key={id}
                    type="button"
                    title={meta.label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => scheduleNav(() => setView(id))}
                    className={`relative flex w-full items-center rounded-xl text-left text-sm transition-all ${
                      sidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-2.5"
                    } ${active ? "font-semibold text-white shadow-md" : "text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)]"}`}
                    style={active ? autoSegmentTabStyle(true) : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {sidebarOpen ? (
                      <>
                        <span className="flex-1 font-medium">{meta.label}</span>
                        {badge > 0 ? (
                          <span className="rounded-full bg-[var(--danger)] px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
                        ) : null}
                      </>
                    ) : badge > 0 ? (
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--danger)]" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[var(--dashboard-canvas)]">
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{data.company.legalName}</div>
            <div className="truncate text-[10px] text-[var(--foreground-muted)]">
              {data.company.brsrTier} · {data.company.reportingFY}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100 md:block">
              Mock · {data.company.lastInventoryClose}
            </div>
            <label htmlFor="auto-s3-persona" className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
              <span className="hidden sm:inline">Persona</span>
              <select
                id="auto-s3-persona"
                className={`${scope3SelectClass} max-w-[220px]`}
                value={persona}
                onChange={(e) => {
                  const p = e.target.value as AutoPersonaId;
                  scheduleNav(() => {
                    setPersona(p);
                    setView(defaultViewForPersona(p));
                  });
                  setShowPersonaHint(true);
                }}
              >
                {(Object.keys(PERSONA_LABELS) as AutoPersonaId[]).map((p) => (
                  <option key={p} value={p}>
                    {PERSONA_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className={scope3IconButtonClass} aria-label="Refresh" onClick={() => setLastUpdated(new Date().toISOString())}>
              <RefreshCw className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" className={`${scope3IconButtonClass} relative`} aria-label="Notifications">
              <Bell className="h-4 w-4" aria-hidden />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
            </button>
          </div>
        </header>

        {showPersonaHint ? (
          <div className="border-b border-[var(--border)] bg-[var(--muted)]/50 px-4 py-2 text-xs text-[var(--foreground-muted)] sm:px-6">
            <p>
              <span className="font-semibold text-[var(--foreground)]">{PERSONA_LABELS[persona]}</span> — {personaScopeHint(persona)}
            </p>
          </div>
        ) : null}

        <main id="auto-scope3-main" className="auto-scope3-dashboard flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8" tabIndex={-1}>
          <div className={`mx-auto ${SCOPE3_MAX_WIDTH}`}>
            <div
              className={
                view === "supply_chain"
                  ? "mb-6 sm:mb-8"
                  : "mb-6 flex flex-col gap-3 sm:mb-8"
              }
            >
              <Scope3ViewHeader
                className={view !== "supply_chain" ? "!border-b-0 !pb-0" : ""}
                eyebrow={VIEW_COPY[view].eyebrow}
                title={VIEW_COPY[view].title}
                subtitle={VIEW_COPY[view].subtitle}
                aside={
                  view === "supply_chain" ? (
                    <SupplyChainTabSwitcher value={supplyChainTab} onChange={setSupplyChainTab} />
                  ) : undefined
                }
              />
              {view === "intensity_ratio" ? (
                <IntensityRatioTabSwitcher value={intensityTab} onChange={setIntensityTab} persona={persona} />
              ) : null}
              {viewUsesInventoryScope(view) ? (
                <InventoryScopeToolbar
                  reportingContext={data.reportingContext}
                  accountingNote={filteredData.accountingNote}
                  filters={filters}
                  options={data.globalFilterOptions}
                  onChange={setFilters}
                />
              ) : null}
            </div>
            {showCfoPanel(persona) && view === "overview" ? <CfoFinancialPanel data={filteredData} /> : null}
            {showDataQualityPanel(persona) && view === "compliance_audit" ? <DataQualityRemediationPanel data={data} /> : null}
            {showPlantPanel(persona) && (view === "geography" || view === "overview") ? <PlantCockpitPanel data={filteredData} /> : null}
            {showPortfolioPanel(persona) && view === "product_components" ? <ModelPortfolioMatrix data={filteredData} /> : null}
            <Scope3Panel className="auto-scope3-content-panel min-h-[50vh] !p-4 sm:!p-6 lg:!p-8">{renderView()}</Scope3Panel>
            {showCsoPanels(persona) && view === "emissions_tracking" ? (
              <div className="mt-6 space-y-6">
                <SbtiCockpitPanel data={filteredData} />
                <Cat11AssumptionsPanel data={filteredData} />
              </div>
            ) : null}
            {showProcurementPanel(persona) && view === "supply_chain" ? (
              <div className="mt-6">
                <ProcurementScorecardPanel data={data} />
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
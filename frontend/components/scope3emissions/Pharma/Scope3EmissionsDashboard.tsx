"use client";

import { Suspense, startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  FileStack,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCircle,
} from "lucide-react";
import type { EsgDataRequest, ExecutiveQuickNav, NavViewId, PersonaId, SupplierRow } from "./types";
import {
  defaultViewForPersona,
  PERSONA_LABELS,
  personaScopeHint,
  visibleNavViews,
} from "./personaAccess";
import { ExecutiveSummaryView } from "./ExecutiveSummaryView";
import { SuppliersView } from "./SuppliersView";
import { CategoriesView } from "./CategoriesView";
import { ControlsAuditView } from "./ControlsAuditView";
import { AIInsightsView } from "./AIInsightsView";
import { ReportingView } from "./ReportingView";
import { SubmittedEvidencesView } from "./SubmittedEvidencesView";
import { SupplierPortalView } from "./SupplierPortalView";
import { GHGGasesView } from "./GHGGasesView";
import {
  SCOPE3_CONTENT_PANEL_CLASS,
  SCOPE3_MAX_WIDTH,
  SCOPE3_SIDEBAR_COLLAPSED,
  SCOPE3_SIDEBAR_EXPANDED,
  SCOPE3_SIDEBAR_MIN_W,
  Scope3DashboardSkeleton,
  Scope3Panel,
  Scope3SidebarBrand,
  Scope3SidebarNavButton,
  Scope3ViewHeader,
  scope3IconButtonClass,
  scope3SelectClass,
} from "./scope3-ui";
import { Scope3ToastProvider } from "./scope3-feedback";
import { useScope3Inventory } from "./scope3-data";
import {
  parseNavViewId,
  parsePersonaId,
  parsePositiveInt,
  parseReportingYear,
} from "./scope3-url";

const VIEW_COPY: Partial<
  Record<
    NavViewId,
    {
      eyebrow: string;
      title: string;
      subtitle: string;
    }
  >
> = {
  suppliers: {
    eyebrow: "Value chain",
    title: "Suppliers & buyers",
    subtitle:
      "Upstream suppliers and downstream buyers carry most Scope 3 mass — this view ties each actor to categories so the footprint stays complete across the chain.",
  },
  categories: {
    eyebrow: "GHG Protocol",
    title: "Category explorer",
    subtitle:
      "All fifteen Scope 3 categories in one inventory — the structured way to account for the full indirect footprint. Filter upstream vs downstream, search, and expand a card for methodology and BRSR mapping.",
  },
  ghg_gases: {
    eyebrow: "GHG inventory",
    title: "GHG gases — species view",
    subtitle:
      "Company Scope 3 totals decomposed by gas species (CO₂e basis) with the same category lines as elsewhere. Drill from any gas into categories, suppliers, and AI narratives that reference the same evidence trail.",
  },
  controls_audit: {
    eyebrow: "Risk & compliance",
    title: "Controls, assurance & compliance readiness",
    subtitle:
      "GHG Protocol Scope 3 inventory: internal controls over calculations and disclosures, assurance readiness by dimension, lineage from supplier evidence to reported tCO₂e, and third-party audit outputs.",
  },
  submitted_evidences: {
    eyebrow: "Evidence index",
    title: "Submitted Evidences",
    subtitle:
      "Registered supplier and internal packages (PCFs, logistics data, boundary memos, EF locks, assurance PBC) with category and control linkage — what was actually presented to support Scope 3 calculations and disclosures.",
  },
  ai_insights: {
    eyebrow: "Signals",
    title: "AI insights",
    subtitle: "Prioritised findings with severity, confidence, and suggested owners. Use filters to focus the queue.",
  },
  reports: {
    eyebrow: "Disclosures",
    title: "Reporting & exports",
    subtitle: "BRSR, CDP, India export consignment packs, and SBTi outputs — readiness, preview, and export actions.",
  },
  supplier_portal: {
    eyebrow: "Supplier",
    title: "Your tasks & submissions",
    subtitle: "Self-service view for supplier contacts: open tasks, due dates, and recent submission outcomes.",
  },
};

const NAV_META: Record<
  NavViewId,
  { label: string; icon: typeof LayoutDashboard; badgeKey?: "ai" | "controls" | "alerts" | "evidence" }
> = {
  executive: { label: "Dashboard", icon: LayoutDashboard, badgeKey: "alerts" },
  suppliers: { label: "Suppliers & buyers", icon: Truck },
  categories: { label: "Categories", icon: Leaf },
  ghg_gases: { label: "GHG Gases", icon: FlaskConical },
  controls_audit: { label: "Risk & Compliance", icon: ShieldCheck, badgeKey: "controls" },
  submitted_evidences: { label: "Submitted Evidences", icon: FileStack, badgeKey: "evidence" },
  ai_insights: { label: "AI insights", icon: Sparkles, badgeKey: "ai" },
  reports: { label: "Reports", icon: FileText },
  supplier_portal: { label: "My portal", icon: UserCircle },
};

function findSupplierIdByName(suppliers: SupplierRow[], name: string): string | null {
  const exact = suppliers.find((s) => s.name === name);
  if (exact) return exact.id;
  const partial = suppliers.find((s) => name.includes(s.name) || s.name.includes(name));
  return partial?.id ?? null;
}

/** Stable id for user-created ESG requests (deterministic from supplier, fields, and sequence index). */
function deterministicEsgRequestId(draft: { supplierId: string; requestedFields: string[] }, sequenceIndex: number): string {
  const key = `${draft.supplierId}|${[...draft.requestedFields].sort().join("|")}|${sequenceIndex}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 33 + key.charCodeAt(i)) >>> 0;
  }
  return `esg-req-d-${h.toString(16).padStart(8, "0")}`;
}

export default function Scope3EmissionsDashboard() {
  return (
    <Scope3ToastProvider>
      <Suspense fallback={<Scope3DashboardSkeleton />}>
        <Scope3EmissionsDashboardLoaded />
      </Suspense>
    </Scope3ToastProvider>
  );
}

function Scope3EmissionsDashboardLoaded() {
  const { data, status, reload } = useScope3Inventory();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [persona, setPersona] = useState<PersonaId>("esg_manager");
  const [view, setView] = useState<NavViewId>(() => defaultViewForPersona("esg_manager"));
  const [initialSupplierId, setInitialSupplierId] = useState<string | null>(null);
  const [initialBuyerId, setInitialBuyerId] = useState<string | null>(null);
  const [initialCategoryId, setInitialCategoryId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPersonaHint, setShowPersonaHint] = useState(false);
  const [reportingYear, setReportingYear] = useState(2025);
  const [extraEsgRequests, setExtraEsgRequests] = useState<EsgDataRequest[]>([]);
  const [initialAiInsightHighlight, setInitialAiInsightHighlight] = useState<string | null>(null);

  const clearAiInsightHighlight = useCallback(() => {
    setInitialAiInsightHighlight(null);
  }, []);

  const urlHydratedRef = useRef(false);

  const inventory = useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      pendingEsgRequests: [...data.pendingEsgRequests, ...extraEsgRequests],
    };
  }, [data, extraEsgRequests]);

  useLayoutEffect(() => {
    if (!data || urlHydratedRef.current) return;
    urlHydratedRef.current = true;
    startTransition(() => {
      const p = parsePersonaId(searchParams.get("persona"));
      if (p) setPersona(p);
      const v = parseNavViewId(searchParams.get("view") === "buyers" ? "suppliers" : searchParams.get("view"));
      if (v) setView(v);
      const sid = searchParams.get("supplier");
      if (sid && data.suppliers.some((s) => s.id === sid)) setInitialSupplierId(sid);
      const bid = searchParams.get("buyer");
      if (bid && data.buyers.some((b) => b.id === bid)) setInitialBuyerId(bid);
      const cat = parsePositiveInt(searchParams.get("category"));
      if (cat != null && data.scope3Categories.some((c) => c.id === cat)) setInitialCategoryId(cat);
      const fy = parseReportingYear(searchParams.get("fy"));
      if (fy != null) setReportingYear(fy);
      if (searchParams.get("nav") === "collapsed") setSidebarOpen(false);
      const ins = searchParams.get("insight");
      if (ins) {
        const pool = [...data.aiInsights, ...data.procurementGmInsights];
        if (pool.some((i) => i.id === ins)) setInitialAiInsightHighlight(ins);
      }
    });
  }, [data, searchParams]);

  useEffect(() => {
    if (!data || !urlHydratedRef.current) return;
    const params = new URLSearchParams();
    params.set("persona", persona);
    params.set("view", view);
    if (initialSupplierId) params.set("supplier", initialSupplierId);
    if (initialBuyerId) params.set("buyer", initialBuyerId);
    if (initialCategoryId != null) params.set("category", String(initialCategoryId));
    if (reportingYear !== 2025) params.set("fy", String(reportingYear));
    if (!sidebarOpen) params.set("nav", "collapsed");
    if (initialAiInsightHighlight) params.set("insight", initialAiInsightHighlight);
    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [
    data,
    view,
    persona,
    initialSupplierId,
    initialBuyerId,
    initialCategoryId,
    reportingYear,
    sidebarOpen,
    initialAiInsightHighlight,
    pathname,
    router,
    searchParams,
  ]);

  useEffect(() => {
    if (!data) return;
    startTransition(() => {
      setLastUpdated(new Date().toISOString());
    });
  }, [data]);

  const deficientControls = useMemo(
    () => (data?.controls ?? []).filter((c) => c.status === "Deficient").length,
    [data],
  );

  const openInsights = useMemo(
    () => (data?.aiInsights ?? []).filter((i) => i.workflow === "Open" || i.workflow === "Assigned").length,
    [data],
  );

  const urgentAlertCount = useMemo(
    () => (data?.complianceAlerts ?? []).filter((a) => a.severity === "critical" || a.severity === "warning").length,
    [data],
  );

  const pendingEvidenceReviews = useMemo(
    () =>
      (data?.submittedEvidences ?? []).filter(
        (e) => e.reviewState === "Under review" || e.reviewState === "Clarification requested",
      ).length,
    [data],
  );

  const allowed = useMemo(() => visibleNavViews(persona), [persona]);

  useEffect(() => {
    if (allowed.includes(view)) return;
    startTransition(() => {
      setView(defaultViewForPersona(persona));
    });
  }, [allowed, persona, view]);

  if (status !== "ready" || !inventory) {
    return <Scope3DashboardSkeleton />;
  }

  const inv = inventory;

  function goCategory(id: number) {
    setInitialCategoryId(id);
    setInitialSupplierId(null);
    setInitialBuyerId(null);
    if (allowed.includes("categories")) setView("categories");
  }

  function goSupplierName(name: string) {
    const id = findSupplierIdByName(inv.suppliers, name);
    setInitialCategoryId(null);
    setInitialBuyerId(null);
    setInitialSupplierId(id);
    if (allowed.includes("suppliers")) setView("suppliers");
  }

  function handleQuickNav(nav: ExecutiveQuickNav) {
    if (nav.kind === "category") {
      goCategory(nav.categoryId);
      return;
    }
    if (nav.kind === "supplier") {
      goSupplierName(nav.supplierName);
      return;
    }
    if (nav.kind === "view" && allowed.includes(nav.view)) {
      setView(nav.view);
    }
  }

  return (
    <div className="flex min-h-screen">
      <a
        href="#scope3-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--primary)] focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>
      {/* Icon rail when collapsed; hover expands labels. Pointer leaving this column collapses to icons-only. */}
      <div
        className={`relative sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-[width] duration-200 ${
          sidebarOpen ? SCOPE3_SIDEBAR_EXPANDED : SCOPE3_SIDEBAR_COLLAPSED
        }`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <aside className="flex min-h-0 flex-1 flex-col overflow-hidden text-[var(--sidebar-text)]" aria-label="Scope 3 pharma navigation">
          <div className={`flex min-h-0 flex-1 flex-col ${sidebarOpen ? SCOPE3_SIDEBAR_MIN_W : SCOPE3_SIDEBAR_COLLAPSED}`}>
            <Scope3SidebarBrand
              sidebarOpen={sidebarOpen}
              kicker="BRSR · GHG Protocol"
              title="Scope 3 · Pharma"
              tag="Value chain & supplier intelligence"
              onCollapse={() => setSidebarOpen(false)}
              onExpand={() => setSidebarOpen(true)}
            />
            <nav className={`flex-1 overflow-y-auto py-3 ${sidebarOpen ? "space-y-1 px-2" : "space-y-1.5 px-1.5"}`} aria-label="Primary">
              {allowed.map((id) => {
                const meta = NAV_META[id];
                const badge =
                  meta.badgeKey === "controls"
                    ? deficientControls
                    : meta.badgeKey === "ai"
                      ? openInsights
                      : meta.badgeKey === "alerts"
                        ? urgentAlertCount
                        : meta.badgeKey === "evidence"
                          ? pendingEvidenceReviews
                          : 0;
                return (
                  <Scope3SidebarNavButton
                    key={id}
                    active={view === id}
                    sidebarOpen={sidebarOpen}
                    label={meta.label}
                    icon={meta.icon}
                    badge={badge}
                    onClick={() => setView(id)}
                  />
                );
              })}
            </nav>
          </div>
        </aside>
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[var(--dashboard-canvas)]">
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{inv.company.legalName}</div>
            <div className="truncate text-[10px] text-[var(--foreground-muted)]">
              {inv.company.brsrListed ? "BRSR listed" : "Scope 3"} · FY{reportingYear} inventory
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100 md:block">
              Mock · {inv.company.lastInventoryClose ?? `FY${reportingYear}`}
            </div>
            <label className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
              <span className="hidden sm:inline">Inventory year</span>
              <select
                aria-label="Reporting year"
                className={`${scope3SelectClass} max-w-[120px]`}
                value={reportingYear}
                onChange={(e) => setReportingYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    FY{y}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="pharma-s3-persona" className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
              <span className="hidden sm:inline">Persona</span>
              <select
                id="pharma-s3-persona"
                className={`${scope3SelectClass} max-w-[220px]`}
                value={persona}
                onChange={(e) => {
                  const p = e.target.value as PersonaId;
                  setPersona(p);
                  setView(defaultViewForPersona(p));
                  setInitialSupplierId(null);
                  setInitialBuyerId(null);
                  setInitialCategoryId(null);
                  setInitialAiInsightHighlight(null);
                  setShowPersonaHint(true);
                }}
              >
                {(Object.keys(PERSONA_LABELS) as PersonaId[]).map((p) => (
                  <option key={p} value={p}>
                    {PERSONA_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className={scope3IconButtonClass} aria-label="Reload inventory" onClick={() => reload()}>
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

        <main id="scope3-main" className="auto-scope3-dashboard flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8" tabIndex={-1}>
          <div className={`mx-auto ${SCOPE3_MAX_WIDTH}`}>
            {VIEW_COPY[view] ? (
              <div className="mb-8">
                <Scope3ViewHeader
                  eyebrow={VIEW_COPY[view]!.eyebrow}
                  title={VIEW_COPY[view]!.title}
                  subtitle={VIEW_COPY[view]!.subtitle}
                />
              </div>
            ) : null}
            {view === "executive" ? (
              <ExecutiveSummaryView
                data={inv}
                persona={persona}
                onSelectCategory={goCategory}
                onQuickNav={handleQuickNav}
              />
            ) : (
              <Scope3Panel className={SCOPE3_CONTENT_PANEL_CLASS}>
                {view === "suppliers" && (
                  <SuppliersView
                    data={inv}
                    persona={persona}
                    initialSupplierId={initialSupplierId}
                    initialBuyerId={initialBuyerId}
                    onClearInitialSupplier={() => setInitialSupplierId(null)}
                    onClearInitialBuyer={() => setInitialBuyerId(null)}
                    onSelectCategory={goCategory}
                    onCreateEsgRequest={(draft) =>
                      setExtraEsgRequests((prev) => {
                        const seq = prev.length;
                        const id = deterministicEsgRequestId(
                          { supplierId: draft.supplierId, requestedFields: draft.requestedFields as string[] },
                          seq,
                        );
                        return [
                          ...prev,
                          {
                            ...draft,
                            id,
                            createdAt: "2026-01-16",
                          },
                        ];
                      })
                    }
                  />
                )}
                {view === "categories" && (
                  <CategoriesView
                    data={inv}
                    initialCategoryId={initialCategoryId}
                    onClearInitialCategory={() => setInitialCategoryId(null)}
                    onSelectSupplierByName={goSupplierName}
                  />
                )}
                {view === "ghg_gases" && (
                  <GHGGasesView
                    data={inv}
                    persona={persona}
                    canOpenAiInsights={allowed.includes("ai_insights")}
                    onSelectCategory={(id) => goCategory(id)}
                    onOpenSupplier={(id) => {
                      setInitialBuyerId(null);
                      setInitialCategoryId(null);
                      setInitialSupplierId(id);
                      if (allowed.includes("suppliers")) setView("suppliers");
                    }}
                    onOpenAiInsight={(insightId) => {
                      if (!allowed.includes("ai_insights")) return;
                      setInitialAiInsightHighlight(insightId);
                      setView("ai_insights");
                    }}
                  />
                )}
                {view === "controls_audit" && <ControlsAuditView data={inv} persona={persona} />}
                {view === "submitted_evidences" && (
                  <SubmittedEvidencesView
                    data={inv}
                    persona={persona}
                    onOpenSupplier={(id) => {
                      setInitialBuyerId(null);
                      setInitialCategoryId(null);
                      setInitialSupplierId(id);
                      if (allowed.includes("suppliers")) setView("suppliers");
                    }}
                    onOpenCategory={(id) => goCategory(id)}
                    onOpenGovernance={() => {
                      if (allowed.includes("controls_audit")) setView("controls_audit");
                    }}
                  />
                )}
                {view === "ai_insights" && (
                  <AIInsightsView
                    data={inv}
                    persona={persona}
                    highlightInsightId={initialAiInsightHighlight}
                    onConsumedHighlightInsight={clearAiInsightHighlight}
                  />
                )}
                {view === "reports" && <ReportingView data={inv} persona={persona} />}
                {view === "supplier_portal" && <SupplierPortalView data={inv} />}
              </Scope3Panel>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

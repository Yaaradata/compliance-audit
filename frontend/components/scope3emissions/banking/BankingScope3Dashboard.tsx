"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Aperture,
  ArrowLeftRight,
  Bell,
  Building2,
  CloudSun,
  FileStack,
  FileText,
  LayoutDashboard,
  Leaf,
  PieChart,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { BankNavViewId, BankPersonaId, CarbonLensLeafId } from "./types";
import { bankScope3MockData } from "./mockData";
import {
  PERSONA_LABELS,
  carbonLensLeavesForPersona,
  defaultViewForPersona,
  filterBorrowersForPersona,
  isExternalAuditor,
  personaScopeHint,
  visibleNavViews,
} from "./personaAccess";
import { BankingScope3ErrorBoundary } from "./BankingScope3ErrorBoundary";
import { parseBankNavViewId, parseBankPersonaId, parseCarbonLensGroupId, parseCarbonLensLeafId } from "./bank-url";
import { ALL_CARBON_LENS_LEAVES, CARBON_LENS_NAV, groupForCarbonLensLeaf, type CarbonLensGroupId } from "./carbonLensNav";
import { CarbonLensMainHub, CarbonLensSubHub } from "./CarbonLensHub";
import { ExecutiveSummaryView } from "./ExecutiveSummaryView";
import { FinancedEmissionsView } from "./FinancedEmissionsView";
import { GreenFinanceView } from "./GreenFinanceView";
import { ClimateRiskView } from "./ClimateRiskView";
import { ControlsAuditView } from "./ControlsAuditView";
import { AIInsightsView } from "./AIInsightsView";
import { ReportingView } from "./ReportingView";
import { CarbonLensView } from "./CarbonLensView";
import { UpstreamDownstreamView } from "./UpstreamDownstreamView";
import { SectorsExplorerView } from "./SectorsExplorerView";
import { GhgTrackingView } from "./GhgTrackingView";
import { SubmittedDataView } from "./SubmittedDataView";
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
} from "../Pharma/scope3-ui";
import { BRSR_BANK_SIDEBAR, BRSR_BANK_VIEW_COPY } from "./brsr-principle-banking";

const NAV_META: Record<BankNavViewId, { label: string; icon: typeof LayoutDashboard; badgeKey?: "ai" | "controls" | "evidence" }> = {
  executive: { label: "Dashboard", icon: LayoutDashboard },
  carbon_lens: { label: "Carbon Lens", icon: Aperture },
  upstream_downstream: { label: "Upstream / Downstream", icon: ArrowLeftRight },
  sectors: { label: "Sectors", icon: PieChart },
  ghg_tracking: { label: "GHG Tracking", icon: Activity },
  financed_emissions: { label: "Financed emissions", icon: Building2 },
  green_finance: { label: "Green finance", icon: Leaf },
  climate_risk: { label: "Climate risk", icon: CloudSun },
  submitted_data: { label: "Submitted Data", icon: FileStack, badgeKey: "evidence" },
  controls_audit: { label: "Compliance & Audit", icon: ShieldCheck, badgeKey: "controls" },
  ai_insights: { label: "AI Insights", icon: Sparkles, badgeKey: "ai" },
  reports: { label: "Reports", icon: FileText },
};

/** Shown as Carbon Lens pillars + in-page tiles — hide duplicate top-level nav when Carbon Lens is available. */
const VIEWS_REDUNDANT_WITH_CARBON_LENS: BankNavViewId[] = ["financed_emissions", "green_finance", "climate_risk"];

type BankSidebarNavId = Exclude<BankNavViewId, "carbon_lens">;

/** Sidebar order (Carbon Lens is rendered as its own block between upstream and controls). */
const SIDEBAR_BEFORE_CARBON_LENS: BankSidebarNavId[] = ["executive", "sectors", "ghg_tracking", "upstream_downstream"];
const SIDEBAR_AFTER_CARBON_LENS: BankSidebarNavId[] = ["submitted_data", "controls_audit", "ai_insights", "reports"];

export default function BankingScope3Dashboard() {
  return (
    <Suspense fallback={<Scope3DashboardSkeleton />}>
      <BankingScope3ErrorBoundary>
        <BankingScope3DashboardLoaded />
      </BankingScope3ErrorBoundary>
    </Suspense>
  );
}

function BankingScope3DashboardLoaded() {
  const data = bankScope3MockData;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [persona, setPersona] = useState<BankPersonaId>("esg_officer");
  const [view, setView] = useState<BankNavViewId>(() => defaultViewForPersona("esg_officer"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());
  const [initialSector, setInitialSector] = useState<string | null>(null);
  const [carbonLensGroup, setCarbonLensGroup] = useState<CarbonLensGroupId | null>(null);
  const [carbonLensLeaf, setCarbonLensLeaf] = useState<CarbonLensLeafId | null>(null);
  const [sectorsSector, setSectorsSector] = useState<string | null>(null);
  const [sectorsBorrowerId, setSectorsBorrowerId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPersonaHint, setShowPersonaHint] = useState(false);

  const srViewAnnouncement = useMemo(() => {
    const label = NAV_META[view]?.label ?? String(view);
    return `${label} — content updated`;
  }, [view]);

  const scheduleNav = useCallback((fn: () => void) => {
    startTransition(fn);
  }, []);

  const urlHydratedRef = useRef(false);

  useLayoutEffect(() => {
    if (urlHydratedRef.current) return;
    urlHydratedRef.current = true;
    startTransition(() => {
      const personaFromUrl = parseBankPersonaId(searchParams.get("persona"));
      const p: BankPersonaId = personaFromUrl ?? "esg_officer";
      if (personaFromUrl) setPersona(personaFromUrl);
      const allowedViews = visibleNavViews(p);
      const v = parseBankNavViewId(searchParams.get("view"));
      if (v && allowedViews.includes(v)) {
        setView(v);
      } else if (personaFromUrl) {
        setView(defaultViewForPersona(personaFromUrl));
      }
      const leaves = carbonLensLeavesForPersona(p);
      const l = parseCarbonLensLeafId(searchParams.get("lens"));
      const g = parseCarbonLensGroupId(searchParams.get("group"));
      if (l && leaves.includes(l)) {
        setCarbonLensLeaf(l);
        setCarbonLensGroup(groupForCarbonLensLeaf(l));
      } else if (g && CARBON_LENS_NAV.some((gr) => gr.id === g && gr.children.some((c) => leaves.includes(c.id)))) {
        setCarbonLensGroup(g);
        setCarbonLensLeaf(null);
      } else {
        setCarbonLensGroup(null);
        setCarbonLensLeaf(null);
      }
      if (v === "sectors") {
        const bor = searchParams.get("borrower");
        const sec = searchParams.get("sector");
        const visB = filterBorrowersForPersona(p, data.borrowers);
        if (bor && visB.some((b) => b.id === bor)) {
          setSectorsBorrowerId(bor);
          setSectorsSector(visB.find((b) => b.id === bor)!.sector);
        } else if (sec && data.sectors.some((s) => s.sector === sec) && visB.some((b) => b.sector === sec)) {
          setSectorsSector(sec);
          setSectorsBorrowerId(null);
        } else {
          setSectorsSector(null);
          setSectorsBorrowerId(null);
        }
      } else {
        setSectorsSector(null);
        setSectorsBorrowerId(null);
      }
      if (searchParams.get("nav") === "collapsed") setSidebarOpen(false);
    });
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("persona", persona);
    params.set("view", view);
    if (view === "carbon_lens") {
      if (carbonLensLeaf) {
        params.set("lens", carbonLensLeaf);
        params.set("group", groupForCarbonLensLeaf(carbonLensLeaf));
      } else if (carbonLensGroup) {
        params.set("group", carbonLensGroup);
      }
    }
    if (view === "sectors") {
      if (sectorsSector) params.set("sector", sectorsSector);
      if (sectorsBorrowerId) params.set("borrower", sectorsBorrowerId);
    }
    if (!sidebarOpen) params.set("nav", "collapsed");
    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [persona, view, carbonLensLeaf, carbonLensGroup, sectorsSector, sectorsBorrowerId, sidebarOpen, pathname, router, searchParams]);

  const allowed = useMemo(() => visibleNavViews(persona), [persona]);
  const allowedCarbonLeaves = useMemo(() => carbonLensLeavesForPersona(persona), [persona]);

  const sidebarNavPlan = useMemo(() => {
    const strip = allowed
      .filter((id) => id !== "carbon_lens")
      .filter((id) => !(allowed.includes("carbon_lens") && VIEWS_REDUNDANT_WITH_CARBON_LENS.includes(id)));
    const before = SIDEBAR_BEFORE_CARBON_LENS.filter((id) => strip.includes(id));
    const after = SIDEBAR_AFTER_CARBON_LENS.filter((id) => strip.includes(id));
    const tail = strip
      .filter((id) => !before.includes(id) && !after.includes(id))
      .sort((a, b) => a.localeCompare(b));
    return { before, after, tail, showCarbonLens: allowed.includes("carbon_lens") };
  }, [allowed]);

  useEffect(() => {
    startTransition(() => {
      if (carbonLensLeaf != null && !ALL_CARBON_LENS_LEAVES.includes(carbonLensLeaf)) {
        setCarbonLensLeaf(null);
      }
    });
  }, [carbonLensLeaf]);

  useEffect(() => {
    if (view === "carbon_lens") return;
    startTransition(() => {
      setCarbonLensGroup(null);
      setCarbonLensLeaf(null);
    });
  }, [view]);

  useEffect(() => {
    if (view === "sectors") return;
    startTransition(() => {
      setSectorsSector(null);
      setSectorsBorrowerId(null);
    });
  }, [view]);

  useEffect(() => {
    if (allowed.includes(view)) return;
    startTransition(() => {
      setView(defaultViewForPersona(persona));
    });
  }, [allowed, persona, view]);

  const deficientControls = useMemo(() => data.controls.filter((c) => c.status === "Deficient").length, [data.controls]);
  const openInsights = data.aiInsights.length;
  const openEvidence = useMemo(
    () =>
      data.submittedData.records.filter(
        (e) => e.reviewState === "Under review" || e.reviewState === "Clarification requested",
      ).length,
    [data.submittedData.records],
  );

  return (
    <div className="flex min-h-screen">
      <a
        href="#bank-scope3-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--primary)] focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>
      <div
        className={`relative sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-[width] duration-200 ${
          sidebarOpen ? SCOPE3_SIDEBAR_EXPANDED : SCOPE3_SIDEBAR_COLLAPSED
        }`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <aside className="flex min-h-0 flex-1 flex-col overflow-hidden text-[var(--sidebar-text)]" aria-label="Scope 3 banking navigation">
          <div className={`flex min-h-0 flex-1 flex-col ${sidebarOpen ? SCOPE3_SIDEBAR_MIN_W : SCOPE3_SIDEBAR_COLLAPSED}`}>
            <Scope3SidebarBrand
              sidebarOpen={sidebarOpen}
              kicker={BRSR_BANK_SIDEBAR.kicker}
              title={BRSR_BANK_SIDEBAR.title}
              tag={BRSR_BANK_SIDEBAR.tag}
              onCollapse={() => setSidebarOpen(false)}
              onExpand={() => setSidebarOpen(true)}
            />
            <nav className={`flex-1 overflow-y-auto py-3 ${sidebarOpen ? "space-y-1 px-2" : "space-y-1.5 px-1.5"}`} aria-label="Primary">
              {sidebarNavPlan.before.map((id) => {
                const meta = NAV_META[id];
                const badge =
                  meta.badgeKey === "controls"
                    ? deficientControls
                    : meta.badgeKey === "ai"
                      ? openInsights
                      : meta.badgeKey === "evidence"
                        ? openEvidence
                        : 0;
                return (
                  <Scope3SidebarNavButton
                    key={id}
                    active={view === id}
                    sidebarOpen={sidebarOpen}
                    label={meta.label}
                    icon={meta.icon}
                    badge={badge}
                    onClick={() => scheduleNav(() => setView(id))}
                  />
                );
              })}
              {sidebarNavPlan.showCarbonLens ? (
                <Scope3SidebarNavButton
                  active={view === "carbon_lens"}
                  sidebarOpen={sidebarOpen}
                  label="Carbon Lens"
                  icon={Aperture}
                  onClick={() =>
                    scheduleNav(() => {
                      setView("carbon_lens");
                      setCarbonLensGroup(null);
                      setCarbonLensLeaf(null);
                    })
                  }
                />
              ) : null}
              {sidebarNavPlan.after.map((id) => {
                const meta = NAV_META[id];
                const badge =
                  meta.badgeKey === "controls"
                    ? deficientControls
                    : meta.badgeKey === "ai"
                      ? openInsights
                      : meta.badgeKey === "evidence"
                        ? openEvidence
                        : 0;
                return (
                  <Scope3SidebarNavButton
                    key={id}
                    active={view === id}
                    sidebarOpen={sidebarOpen}
                    label={meta.label}
                    icon={meta.icon}
                    badge={badge}
                    onClick={() => scheduleNav(() => setView(id))}
                  />
                );
              })}
              {sidebarNavPlan.tail.map((id) => {
                const meta = NAV_META[id];
                const badge =
                  meta.badgeKey === "controls"
                    ? deficientControls
                    : meta.badgeKey === "ai"
                      ? openInsights
                      : meta.badgeKey === "evidence"
                        ? openEvidence
                        : 0;
                return (
                  <Scope3SidebarNavButton
                    key={id}
                    active={view === id}
                    sidebarOpen={sidebarOpen}
                    label={meta.label}
                    icon={meta.icon}
                    badge={badge}
                    onClick={() => scheduleNav(() => setView(id))}
                  />
                );
              })}
            </nav>
          </div>
        </aside>
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[var(--dashboard-canvas)]">
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {srViewAnnouncement}
          </p>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{data.company.legalName}</div>
            <div className="truncate text-[10px] text-[var(--foreground-muted)]">
              {data.company.brsrTier} · FY25 inventory
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100 md:block">
              Mock · {data.company.lastInventoryClose}
            </div>
            <label htmlFor="bank-s3-persona" className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
              <span className="hidden sm:inline">Persona</span>
              <select
                id="bank-s3-persona"
                className={`${scope3SelectClass} max-w-[220px]`}
                value={persona}
                onChange={(e) => {
                  const p = e.target.value as BankPersonaId;
                  scheduleNav(() => {
                    setPersona(p);
                    setView(defaultViewForPersona(p));
                    setInitialSector(null);
                    setCarbonLensGroup(null);
                    setCarbonLensLeaf(null);
                    setSectorsSector(null);
                    setSectorsBorrowerId(null);
                  });
                  setShowPersonaHint(true);
                }}
              >
                {(Object.keys(PERSONA_LABELS) as BankPersonaId[]).map((p) => (
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

        <main
          id="bank-scope3-main"
          className={`auto-scope3-dashboard flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${isPending ? "opacity-80 transition-opacity" : ""}`}
          tabIndex={-1}
          aria-busy={isPending}
        >
          <div className={`mx-auto ${SCOPE3_MAX_WIDTH}`}>
            {BRSR_BANK_VIEW_COPY[view] ? (
              <div className="mb-6 sm:mb-8">
                <Scope3ViewHeader
                  eyebrow={BRSR_BANK_VIEW_COPY[view].eyebrow}
                  title={BRSR_BANK_VIEW_COPY[view].title}
                  subtitle={BRSR_BANK_VIEW_COPY[view].subtitle}
                />
              </div>
            ) : null}

            {view === "executive" ? (
              <ExecutiveSummaryView
                data={data}
                persona={persona}
                onSelectSector={(_sector) => {
                  scheduleNav(() => {
                    if (allowed.includes("carbon_lens") && allowedCarbonLeaves.includes("corporate_loans")) {
                      setCarbonLensLeaf("corporate_loans");
                      setCarbonLensGroup(groupForCarbonLensLeaf("corporate_loans"));
                      setView("carbon_lens");
                      return;
                    }
                    if (!allowed.includes("financed_emissions")) return;
                    setInitialSector(_sector);
                    setView("financed_emissions");
                  });
                }}
              />
            ) : view === "carbon_lens" ? (
              <Scope3Panel className={SCOPE3_CONTENT_PANEL_CLASS}>
                {carbonLensLeaf != null ? (
                  <CarbonLensView
                    data={data}
                    persona={persona}
                    leaf={carbonLensLeaf}
                    allowedLeaves={allowedCarbonLeaves}
                    onOpenFullFinanced={allowed.includes("financed_emissions") ? () => scheduleNav(() => setView("financed_emissions")) : undefined}
                    onBack={() => {
                      setCarbonLensLeaf(null);
                    }}
                  />
                ) : carbonLensGroup != null ? (
                  <CarbonLensSubHub
                    groupId={carbonLensGroup}
                    allowedLeaves={allowedCarbonLeaves}
                    onSelectLeaf={(id) => setCarbonLensLeaf(id)}
                    onBack={() => setCarbonLensGroup(null)}
                  />
                ) : (
                  <CarbonLensMainHub
                    allowedLeaves={allowedCarbonLeaves}
                    onSelectGroup={(id) => {
                      setCarbonLensGroup(id);
                      setCarbonLensLeaf(null);
                    }}
                  />
                )}
              </Scope3Panel>
            ) : view === "sectors" ? (
              <Scope3Panel className={SCOPE3_CONTENT_PANEL_CLASS}>
                <SectorsExplorerView
                  data={data}
                  persona={persona}
                  selectedSector={sectorsSector}
                  selectedBorrowerId={sectorsBorrowerId}
                  onSelectSector={setSectorsSector}
                  onSelectBorrower={setSectorsBorrowerId}
                />
              </Scope3Panel>
            ) : view === "ghg_tracking" ? (
              <Scope3Panel className={SCOPE3_CONTENT_PANEL_CLASS}>
                <GhgTrackingView
                  ghg={data.ghgTracking}
                  data={data}
                  persona={persona}
                  canOpenAiInsights={allowed.includes("ai_insights")}
                  onSelectSector={(sector) =>
                    scheduleNav(() => {
                      setSectorsBorrowerId(null);
                      setSectorsSector(sector);
                      setView("sectors");
                    })
                  }
                  onOpenBorrower={(id) => {
                    const b = data.borrowers.find((x) => x.id === id);
                    scheduleNav(() => {
                      setSectorsSector(b?.sector ?? null);
                      setSectorsBorrowerId(id);
                      setView("sectors");
                    });
                  }}
                  onOpenAiInsight={() => {
                    scheduleNav(() => setView("ai_insights"));
                  }}
                />
              </Scope3Panel>
            ) : view === "upstream_downstream" ? (
              <div className={`overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] ${SCOPE3_CONTENT_PANEL_CLASS}`}>
                <UpstreamDownstreamView legalName={data.company.legalName} upstreamDownstream={data.upstreamDownstream} activePersona={persona} />
              </div>
            ) : (
              <Scope3Panel className={SCOPE3_CONTENT_PANEL_CLASS}>
                {view === "financed_emissions" && (
                  <FinancedEmissionsView
                    data={data}
                    persona={persona}
                    initialSector={initialSector}
                    onClearInitialSector={() => setInitialSector(null)}
                    readOnly={isExternalAuditor(persona)}
                  />
                )}
                {view === "green_finance" && <GreenFinanceView data={data} />}
                {view === "climate_risk" && <ClimateRiskView data={data} />}
                {view === "submitted_data" && (
                  <SubmittedDataView
                    data={data}
                    persona={persona}
                    onOpenBorrower={(id) => {
                      const b = data.borrowers.find((x) => x.id === id);
                      scheduleNav(() => {
                        setSectorsSector(b?.sector ?? null);
                        setSectorsBorrowerId(id);
                        setView("sectors");
                      });
                    }}
                    onOpenUpstreamDownstream={() => {
                      scheduleNav(() => setView("upstream_downstream"));
                    }}
                  />
                )}
                {view === "controls_audit" && <ControlsAuditView data={data} persona={persona} />}
                {view === "ai_insights" && <AIInsightsView data={data} persona={persona} />}
                {view === "reports" && <ReportingView data={data} persona={persona} />}
              </Scope3Panel>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

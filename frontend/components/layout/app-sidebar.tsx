"use client";

/**
 * Enterprise SWIFT compliance sidebar.
 *
 * Structure: <aside> → [Sticky header] [Collapse toggle] [Scrollable: primary nav | domains]
 * Tailwind: width transition 200ms, rounded-xl nav items, focus-visible:ring-2 for a11y.
 * Interactions: 200ms ease on hover/active/focus; collapse toggle toggles icon-only mode.
 * Responsive: fixed widths (260px expanded / 56px collapsed); scrollable body; no breakpoints (layout is app-controlled).
 * Accessibility: role="navigation", aria-label, aria-current="page", aria-expanded on toggle, focus-visible rings.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useGlobalRoleForRouting } from "@/lib/home-dashboard-role-context";
import { getArchitecture, getDomainsForArchitecture } from "@/lib/frameworks/swift-cscf";
import { useCycleIdFromPath } from "@/lib/hooks/use-cycle-id";
import { getNavForRole } from "@/lib/data/roles";
import { useSidebar } from "@/lib/sidebar-context";
import { api } from "@/lib/api";
import { SidebarHeader } from "@/components/layout/sidebar-header";
import { SidebarDomainRow } from "@/components/layout/sidebar-domain-row";
import { NavIcon } from "@/components/layout/sidebar-nav-icons";

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 56;
const TRANSITION_MS = 200;

interface DomainScore {
  id: string;
  name: string;
  completed: number;
  total: number;
  score: number;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { open, toggle, setOpen } = useSidebar();
  const { user, selectedArchitectureId, activeCycleId, effectiveCycleRole } = useAuth();
  const globalRole = useGlobalRoleForRouting(user?.role);
  const cycleIdFromPath = useCycleIdFromPath();
  const cycleId = cycleIdFromPath ?? activeCycleId;
  const hasCycleInPath = Boolean(cycleIdFromPath && pathname?.startsWith("/cycles/"));
  const [searchQuery, setSearchQuery] = useState("");
  const role = cycleId && effectiveCycleRole !== undefined ? (effectiveCycleRole ?? globalRole) : globalRole;
  const navItems = getNavForRole(role)
    ?.filter(
      (item) =>
        item.href.startsWith("/dashboard") ||
        item.href.startsWith("/evidence") ||
        item.href.startsWith("/aws") ||
        item.href.startsWith("/users-groups") ||
        item.href.startsWith("/review") ||
        item.href.startsWith("/approval") ||
        item.href.startsWith("/report")
    )
    .filter((item) => {
      if (role !== "compliance_officer") return true;
      return (
        !item.href.startsWith("/review") &&
        !item.href.startsWith("/approval") &&
        !item.href.startsWith("/report")
      );
    });
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const staticDomains = getDomainsForArchitecture(arch?.domainIds);

  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);

  const fetchDomainScores = useCallback(() => {
    if (!cycleId) {
      setDomainScores([]);
      return;
    }
    api
      .get<{ domain_scores: DomainScore[] }>(`/assessments/${cycleId}/dashboard`)
      .then((data) => setDomainScores(data.domain_scores ?? []))
      .catch(() => setDomainScores([]));
  }, [cycleId]);

  useEffect(() => {
    fetchDomainScores();
  }, [fetchDomainScores, pathname]);

  // Refetch when evidence is submitted so sidebar percentages update immediately
  useEffect(() => {
    const onRefresh = () => fetchDomainScores();
    window.addEventListener("dashboard-refresh", onRefresh);
    return () => window.removeEventListener("dashboard-refresh", onRefresh);
  }, [fetchDomainScores]);

  const scoreByDomainId = useMemo(() => {
    const map = new Map<string, number>();
    domainScores.forEach((s) => {
      const key = (s.id ?? "").toString().trim().toUpperCase();
      if (key) map.set(key, Number(s.score));
    });
    return map;
  }, [domainScores]);
  const visibleDomainIds = useMemo(
    () => new Set(domainScores.map((s) => (s.id ?? "").toString().trim().toUpperCase()).filter(Boolean)),
    [domainScores]
  );

  const base = cycleId ? `/cycles/${cycleId}` : "";
  const q = searchQuery.trim().toLowerCase();
  const navItemsFiltered = q
    ? navItems.filter((item) => item.label.toLowerCase().includes(q))
    : navItems;
  const navHref = (item: { href: string }) => {
    if (!base) return item.href;
    if (item.href === "/aws") return "/aws";
    if (item.href === "/dashboard") return hasCycleInPath ? `${base}/dashboard` : "/dashboard";
    if (item.href.startsWith("/evidence")) return item.href.replace("/evidence", `${base}/evidence`);
    if (item.href.startsWith("/review")) return `${base}/review`;
    if (item.href.startsWith("/approval")) return `${base}/approval`;
    if (item.href.startsWith("/report")) return `${base}/report`;
    return item.href;
  };
  const isCycleSetupRoute =
    pathname?.includes("/team-setup") ||
    pathname?.includes("/role-evidence-setup") ||
    pathname?.includes("/control-scoping");
  const isMainPageRoute =
    pathname === "/dashboard" ||
    pathname?.endsWith("/dashboard") ||
    pathname?.startsWith("/assessments/new");
  const shouldShowDomains =
    staticDomains.length > 0 &&
    hasCycleInPath &&
    role &&
    !["internal_reviewer_l1", "internal_reviewer_l2", "external_assessor"].includes(role) &&
    !isCycleSetupRoute &&
    !isMainPageRoute;

  const sidebarWidth = open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  const [hoverEnabled, setHoverEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setHoverEnabled(mq.matches);
    const handler = () => setHoverEnabled(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (hoverEnabled) setOpen(true, false);
  }, [hoverEnabled, setOpen]);

  const handleMouseLeave = useCallback(() => {
    if (hoverEnabled) setOpen(false, true);
  }, [hoverEnabled, setOpen]);

  return (
    <aside
      className={`
        flex flex-col shrink-0 overflow-hidden border-r rounded-r-xl
        max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:w-64! max-md:transition-transform max-md:duration-200 max-md:ease-out
        md:fixed md:inset-y-0 md:left-0 md:z-20 md:rounded-r-xl
        ${!open ? "max-md:-translate-x-full" : "max-md:translate-x-0"}
      `}
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
        transition: `width ${TRANSITION_MS}ms ease-out`,
      }}
      role="navigation"
      aria-label="Main navigation"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Sticky header: circular logo + collapse (expanded) or logo + search icon (collapsed) */}
      <header className="sticky top-0 z-10 shrink-0" style={{ background: "var(--sidebar-bg)" }}>
        <SidebarHeader open={open} onSearchClick={toggle} />
      </header>

      {/* Search bar — expanded only */}
      {open && (
        <div className="shrink-0 px-3 pt-2 pb-1">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 w-full"
            style={{ background: "var(--sidebar-hover)" }}
          >
            <svg className="w-4 h-4 shrink-0" style={{ color: "var(--sidebar-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:opacity-70"
              style={{ color: "var(--sidebar-text)" }}
              aria-label="Search"
            />
          </div>
        </div>
      )}

      {/* Scrollable: nav + domains */}
      <div className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
        {/* Primary nav — icon + label (expanded), icon only (collapsed) */}
        <nav className="p-3 flex flex-col gap-0.5" aria-label="Primary">
          {navItemsFiltered.map((item) => {
            const href = navHref(item);
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard" || pathname?.endsWith("/dashboard")
                : pathname?.startsWith(href);
            return (
              <Link
                key={item.href}
                href={href || item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 hover:bg-(--sidebar-hover) focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--sidebar-active-text) min-w-0 ${!open ? "justify-center" : ""}`}
                style={{
                  color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text-muted)",
                  backgroundColor: isActive ? "var(--sidebar-active-bg)" : "transparent",
                }}
                title={!open ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <span style={{ color: "inherit" }}>
                  <NavIcon href={item.href} className={open ? "w-5 h-5" : "w-5 h-5"} />
                </span>
                {open && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Control applicability is NOT in the sidebar — it is only part of the cycle creation flow.
            Compliance officer reaches it via: Create cycle → Team setup → Select architecture → Control scoping. */}

        {/* Domains: smart rows — hidden for L1/L2/L3 reviewers (evidence is read-only for them) */}
        {shouldShowDomains && (() => {
          const sourceDomains =
            role === "it_sme" && cycleId
              ? staticDomains.filter((d) => visibleDomainIds.has((d.id ?? "").toString().trim().toUpperCase()))
              : staticDomains;
          const domainsFiltered = q
            ? sourceDomains.filter((d) => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
            : sourceDomains;
          return (
          <>
            <div className="px-3 pt-4 pb-2 shrink-0">
              {open && (
                <div
                  className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2"
                  style={{ color: "var(--sidebar-text-muted)" }}
                >
                  Domains
                </div>
              )}
            </div>
            <nav className="px-2 pb-4 flex flex-col gap-0.5" aria-label="Evidence domains">
              {domainsFiltered.map((d) => {
                const href = `/cycles/${cycleId}/domains/${d.id}`;
                const isActive = pathname?.includes(`/domains/${d.id}`);
                const domainKey = (d.id ?? "").toString().trim().toUpperCase();
                const completionPct = domainKey ? scoreByDomainId.get(domainKey) : undefined;

                return (
                  <SidebarDomainRow
                    key={d.id}
                    domainId={d.id}
                    domainName={d.name}
                    domainColor={d.color}
                    domainAccent={d.accent}
                    href={href}
                    isActive={isActive}
                    isOpen={open}
                    completionPct={completionPct}
                  />
                );
              })}
            </nav>
          </>
          );
        })()}
      </div>
    </aside>
  );
}

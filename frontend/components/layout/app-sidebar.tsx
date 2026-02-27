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

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { getDomainsForArchitecture } from "@/lib/data/domains";
import { useCycleIdFromPath } from "@/lib/hooks/use-cycle-id";
import { NAV_BY_ROLE } from "@/lib/data/roles";
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
  const { open, toggle } = useSidebar();
  const { user, selectedArchitectureId, activeCycleId } = useAuth();
  const cycleIdFromPath = useCycleIdFromPath();
  const cycleId = cycleIdFromPath ?? activeCycleId;
  const [searchQuery, setSearchQuery] = useState("");
  const role = user?.role ?? "compliance_officer";
  const navItems = NAV_BY_ROLE[role].filter(
    (item) =>
      item.href.startsWith("/dashboard") ||
      item.href.startsWith("/evidence") ||
      item.href.startsWith("/review") ||
      item.href.startsWith("/approval") ||
      item.href.startsWith("/report")
  );
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const staticDomains = getDomainsForArchitecture(arch?.domainIds);

  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);

  useEffect(() => {
    if (!cycleId) {
      setDomainScores([]);
      return;
    }
    api
      .get<{ domain_scores: DomainScore[] }>(`/assessments/${cycleId}/dashboard`)
      .then((data) => setDomainScores(data.domain_scores ?? []))
      .catch(() => setDomainScores([]));
  }, [cycleId]);

  const scoreByDomainId = useMemo(() => {
    const map = new Map<string, number>();
    domainScores.forEach((s) => map.set(s.id, s.score));
    return map;
  }, [domainScores]);

  const base = cycleId ? `/cycles/${cycleId}` : "";
  const q = searchQuery.trim().toLowerCase();
  const navItemsFiltered = q
    ? navItems.filter((item) => item.label.toLowerCase().includes(q))
    : navItems;
  const navHref = (item: { href: string }) => {
    if (!base) return item.href;
    if (item.href === "/dashboard") return `${base}/dashboard`;
    if (item.href.startsWith("/evidence")) return item.href.replace("/evidence", `${base}/evidence`);
    if (item.href.startsWith("/review")) return `${base}/review`;
    if (item.href.startsWith("/approval")) return `${base}/approval`;
    if (item.href.startsWith("/report")) return `${base}/report`;
    if (item.href.startsWith("/evidence-model")) return `${base}/evidence-model`;
    return item.href;
  };

  return (
    <aside
      className="flex flex-col shrink-0 overflow-hidden border-r rounded-r-xl"
      style={{
        width: open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
        minWidth: open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
        transition: `width ${TRANSITION_MS}ms ease-out`,
      }}
      role="navigation"
      aria-label="Main navigation"
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
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
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 hover:bg-[var(--sidebar-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sidebar-active-text)] min-w-0 ${!open ? "justify-center" : ""}`}
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

        {/* Domains: smart rows */}
        {staticDomains.length > 0 && cycleId && (() => {
          const domainsFiltered = q
            ? staticDomains.filter((d) => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
            : staticDomains;
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
                const completionPct = scoreByDomainId.get(d.id);
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGlobalRoleForRouting } from "@/lib/home-dashboard-role-context";
import { getArchitecture } from "@/lib/frameworks/swift-cscf";
import { getRoleLabel } from "@/lib/data/roles";
import { useSidebar } from "@/lib/sidebar-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell, type NotificationItem } from "@/components/notifications/notification-bell";
import { api } from "@/lib/api";

function getBreadcrumb(pathname: string | null): { label: string; href?: string }[] {
  if (!pathname) return [{ label: "Dashboard" }];
  const parts = pathname.split("/").filter(Boolean);
  if (pathname === "/dashboard" || pathname === "/") return [{ label: "Dashboard" }];
  if (parts[0] === "cycles" && parts[1]) {
    const base = `/cycles/${parts[1]}`;
    const segs: { label: string; href?: string }[] = [{ label: "Cycle", href: `${base}/dashboard` }];
    if (parts[2] === "dashboard") segs.push({ label: "Dashboard" });
    else if (parts[2] === "review") segs.push({ label: "Review Queue" });
    else if (parts[2] === "approval") segs.push({ label: "Approval" });
    else if (parts[2] === "report") segs.push({ label: "Report" });
    else if (parts[2] === "team-setup") segs.push({ label: "Team setup" });
    else if (parts[2] === "domains" && parts[3]) {
      segs.push({ label: "Domains", href: `${base}/domains` });
      segs.push({ label: `Domain ${parts[3]}`, href: `${base}/domains/${parts[3]}` });
      if (parts[4] === "items" && parts[5]) segs.push({ label: parts[5] });
    }
    return segs;
  }
  if (parts[0] === "admin") return [{ label: "Admin" }];
  return [{ label: "Dashboard" }];
}

export function AppHeader({ showSidebarToggle = true }: { showSidebarToggle?: boolean }) {
  const pathname = usePathname();
  const { user, logout, selectedArchitectureId, activeCycleId, activeCycleMeta, effectiveCycleRole } = useAuth();
  const globalRole = useGlobalRoleForRouting(user?.role);
  const { toggle: toggleSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const initials = user?.name?.split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const breadcrumb = getBreadcrumb(pathname);
  const roleForLabel = (
    activeCycleId ? (effectiveCycleRole ?? globalRole) : globalRole
  ) as Parameters<typeof getRoleLabel>[0];
  const roleLabel = getRoleLabel(roleForLabel);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    api.get<{ count: number }>("/notifications/unread-count").then((r) => setNotificationCount(r.count)).catch(() => setNotificationCount(0));
  }, [pathname]);

  useEffect(() => {
    if (!notificationOpen) return;
    setNotificationLoading(true);
    api
      .get<NotificationItem[]>("/notifications?unread_only=false")
      .then((data) => setNotificationList(Array.isArray(data) ? data : []))
      .catch(() => setNotificationList([]))
      .finally(() => setNotificationLoading(false));
  }, [notificationOpen]);

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      {/* Left: Menu (mobile) + Project name + Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3 overflow-hidden">
        {showSidebarToggle && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {activeCycleId && (
          <span className="text-sm font-semibold text-[var(--foreground)] truncate" title={`Cycle ID: ${activeCycleId}`}>
            {activeCycleMeta ? (
              <>{activeCycleMeta.display_id} — {activeCycleMeta.label} ({activeCycleMeta.cycle_year})</>
            ) : (
              <>Cycle: {activeCycleId.slice(0, 8)}…</>
            )}
          </span>
        )}
        {arch && (
          <span className="text-xs text-[var(--foreground-muted)] truncate hidden sm:inline">
            {arch.id} · {arch.subtitle}
          </span>
        )}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[var(--foreground-subtle)]">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-[var(--foreground)] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--foreground)] font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Top-right profile section */}
      <div className="flex shrink-0 items-center justify-end gap-3">
        <ThemeToggle />
        {user && (
          <>
            {activeCycleId && (
              <Link
                href="/dashboard"
                className="text-xs font-medium px-2.5 py-1 rounded-md border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              >
                Back to role dashboard
              </Link>
            )}
            <Link
              href="/assessments/new"
              className="text-xs font-medium px-2.5 py-1 rounded-md border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
            >
              Switch cycle
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs font-medium px-2.5 py-1 rounded-md border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
            >
              Log out
            </button>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setNotificationOpen((o) => !o)}
                className="relative h-9 w-9 rounded-full border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors inline-flex items-center justify-center"
                aria-label={notificationCount > 0 ? `${notificationCount} unread notifications` : "Notifications"}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden onClick={() => setNotificationOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50 py-1">
                    <div className="px-3 py-2 border-b border-[var(--border)] text-sm font-semibold text-[var(--foreground)]">Notifications</div>
                    {notificationLoading ? (
                      <p className="px-3 py-4 text-xs text-[var(--foreground-muted)]">Loading…</p>
                    ) : notificationList.length === 0 ? (
                      <p className="px-3 py-4 text-xs text-[var(--foreground-muted)]">No notifications</p>
                    ) : (
                      <ul className="divide-y divide-[var(--border)]">
                        {notificationList.slice(0, 8).map((n) => (
                          <li key={n.id} className="px-3 py-2">
                            <p className="text-xs font-medium text-[var(--foreground)]">{n.title ?? n.action}</p>
                            {n.body && <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5 line-clamp-2">{n.body}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="relative" ref={profileRef}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="h-9 w-9 rounded-full inline-flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                  style={{ background: "var(--primary)" }}
                  title={user.email}
                  aria-label="Open profile menu"
                >
                  {initials}
                </button>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{roleLabel}</p>
                </div>
              </div>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50 p-1">
                  <Link
                    href="/assessments/new"
                    className="block rounded-lg px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--background)]"
                    onClick={() => setProfileOpen(false)}
                  >
                    Switch cycle
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="block w-full text-left rounded-lg px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--background)]"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

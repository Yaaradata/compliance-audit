"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { ROLE_LABELS } from "@/lib/data/roles";
import { useSidebar } from "@/lib/sidebar-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout, selectedArchitectureId, activeCycleId, activeCycleMeta } = useAuth();
  const { toggle: toggleSidebar } = useSidebar();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const initials = user?.name?.split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      {/* Left: Menu (mobile) + Project name + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-wrap">
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

      {/* Right: Role, User, Switch cycle, Log out, Theme */}
      <div className="flex items-center gap-4 flex-wrap">
        <ThemeToggle />
        {user && (
          <>
            <span className="text-xs text-[var(--foreground-muted)]">{ROLE_LABELS[user.role]}</span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold bg-[var(--primary)] shrink-0"
              title={user.email}
            >
              {initials}
            </div>
            <Link
              href="/assessments/new"
              className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:underline transition-colors"
            >
              Switch cycle
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:underline transition-colors"
            >
              Log out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

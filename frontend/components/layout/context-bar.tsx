"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { ROLE_LABELS } from "@/lib/data/roles";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * In-dashboard context bar: cycle, architecture, role, theme, switch cycle, log out.
 * Renders inside the main content area; compact and aligned upward with clear visual hierarchy.
 */
export function ContextBar() {
  const { user, logout, selectedArchitectureId, activeCycleId, activeCycleMeta } = useAuth();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const initials = user?.name?.split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 mb-1 border-b border-[var(--border)] min-h-0">
      <div className="flex items-center gap-1.5 min-w-0 flex-wrap text-xs text-[var(--foreground)]">
        {activeCycleId && (
          <span className="truncate" title={`Cycle ID: ${activeCycleId}`}>
            {activeCycleMeta ? (
              <>{activeCycleMeta.display_id} — {activeCycleMeta.label} ({activeCycleMeta.cycle_year})</>
            ) : (
              <>Cycle: {activeCycleId.slice(0, 8)}…</>
            )}
          </span>
        )}
        {activeCycleId && arch && <span className="text-[var(--foreground-subtle)]">·</span>}
        {arch && (
          <span className="truncate text-[var(--foreground-muted)]">
            {arch.id} — {arch.subtitle}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <ThemeToggle />
        {user && (
          <>
            <span className="text-xs text-[var(--foreground-muted)]">{ROLE_LABELS[user.role]}</span>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-medium shrink-0 bg-[var(--foreground-muted)]"
              title={user.email}
            >
              {initials}
            </div>
            <Link href="/assessments/new" className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:underline">
              Switch cycle
            </Link>
            <button type="button" onClick={() => logout()} className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:underline">
              Log out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

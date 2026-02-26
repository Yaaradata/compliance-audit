"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { ROLE_LABELS } from "@/lib/data/roles";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AppHeader() {
  const { user, logout, selectedArchitectureId, activeCycleId, activeCycleMeta } = useAuth();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const initials = user?.name?.split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <header className="px-5 py-2.5 flex justify-between items-center" style={{ background: "var(--header-bg)" }}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[11px] px-2.5 py-1 rounded-md truncate" style={{ color: "var(--header-text-muted)", background: "rgba(255,255,255,0.1)" }}>SWIFT Compliance Platform</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <ThemeToggle />
        {activeCycleId && (
          <span className="text-[11px] font-medium" style={{ color: "var(--header-text-muted)" }} title={`Cycle ID: ${activeCycleId}`}>
            {activeCycleMeta ? (
              <>{activeCycleMeta.display_id} — {activeCycleMeta.label} ({activeCycleMeta.cycle_year})</>
            ) : (
              <>Cycle: {activeCycleId.slice(0, 8)}…</>
            )}
          </span>
        )}
        {arch && <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ color: "var(--header-text-muted)", background: "rgba(255,255,255,0.1)" }}>{arch.id} — {arch.subtitle}</span>}
        {user && (
          <>
            <span className="text-[11px]" style={{ color: "var(--header-text)" }}>{ROLE_LABELS[user.role]}</span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold" style={{ background: "var(--primary)" }} title={user.email}>{initials}</div>
            <Link href="/assessments/new" className="text-[11px] hover:underline transition-opacity" style={{ color: "var(--header-text-muted)" }}>Switch cycle</Link>
            <button type="button" onClick={() => logout()} className="text-[11px] hover:underline transition-opacity" style={{ color: "var(--header-text-muted)" }}>Log out</button>
          </>
        )}
      </div>
    </header>
  );
}

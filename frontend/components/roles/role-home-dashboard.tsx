"use client";

import Link from "next/link";
import { DashboardKpiGrid, RoleDashboardHero } from "@/components/roles/shared";
import { initials } from "@/components/roles/shared/utils";
import type { AssessmentCycle, User } from "@/lib/types";
import type { ActiveCycleMeta } from "@/components/roles/shared/types";

/**
 * Fallback when the user has no global JWT role and no per-cycle role was derived on /dashboard.
 * Uses the same surface + hero + KPI pattern as Compliance Officer (no dark gradient, no phase strip).
 */
export function RoleHomeDashboard({
  user,
  activeCycleId,
  activeCycleMeta,
  cycles,
  loading,
}: {
  user: User;
  activeCycleId: string | null;
  activeCycleMeta: ActiveCycleMeta | null;
  cycles: AssessmentCycle[];
  loading: boolean;
}) {
  const firstName = user.name?.split(/\s+/)[0] ?? "there";
  const totalCycles = cycles.length;
  const inFlight = cycles.filter((c) => !["submitted", "archived"].includes((c.phase || "").toLowerCase())).length;

  const kpiCards = [
    {
      label: "Assessment cycles",
      value: totalCycles,
      sub: "Visible to your tenant",
      href: "/assessments/new",
      aria: `Open assessment cycles. ${totalCycles} cycles`,
      tone: "bg-[var(--primary-muted)] text-[var(--primary)]",
      meter: Math.min(100, totalCycles * 12),
    },
    {
      label: "Active cycle",
      value: activeCycleMeta?.display_id ?? (activeCycleId ? "Selected" : "None"),
      sub: activeCycleId ? "Use header to switch" : "Pick a cycle after assignment",
      href: "/assessments/new",
      aria: "Open cycles to select an active assessment",
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      meter: activeCycleId ? 80 : 0,
    },
    {
      label: "Phases in flight",
      value: inFlight,
      sub: "Excludes submitted / archived",
      href: "/assessments/new",
      aria: `${inFlight} cycles in active phases`,
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      meter: totalCycles > 0 ? Math.round((inFlight / totalCycles) * 100) : 0,
    },
    {
      label: "Account",
      value: initials(user.name),
      sub: user.email ?? "",
      href: "/assessments/new",
      aria: "Account",
      tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
      meter: 40,
    },
  ];

  return (
    <div className="w-full max-w-6xl space-y-5 pb-6">
      <RoleDashboardHero
        eyebrow="Home"
        greetingName={firstName}
        description="Your tenant admin assigns a global role or adds you to cycles. Open assessment cycles to see work you can access."
        primaryActions={[
          { href: "/assessments/new", label: "+ Assessment cycles", gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" },
        ]}
      />

      <DashboardKpiGrid items={kpiCards} loading={loading} ariaLabel="Home dashboard KPI cards" />

      <section className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          Next steps
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          When you are assigned as IT Expert or reviewer on a cycle, this page will show your role-specific command center
          (same layout as Compliance Officer). Until then, use assessment cycles to join a SWIFT CSCF assessment.
        </p>
        <div className="mt-4">
          <Link
            href="/assessments/new"
            className="interactive-solid-primary inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white"
          >
            Go to assessment cycles
          </Link>
        </div>
      </section>
    </div>
  );
}

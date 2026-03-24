"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getRoleLabel, ROLE_DESCRIPTIONS } from "@/lib/data/roles";
import type { AssessmentCycle, User, UserRole } from "@/lib/types";
import { quickActionsForRole, roleHighlights } from "@/components/roles/shared/role-config";
import type { ActiveCycleMeta } from "@/components/roles/shared/types";
import { cycleEntryPath, greetingHour, initials, PHASE_ORDER, phaseColor, phaseLabel } from "@/components/roles/shared/utils";

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

  const role = user?.role;
  const roleLabel = getRoleLabel(role);
  const highlights = roleHighlights(role);
  const quickActions = useMemo(() => quickActionsForRole(role, activeCycleId), [role, activeCycleId]);

  const phaseCounts = useMemo(() => {
    const m = new Map<string, number>();
    cycles.forEach((c) => {
      const p = (c.phase || "collection").toLowerCase();
      m.set(p, (m.get(p) ?? 0) + 1);
    });
    return m;
  }, [cycles]);

  const activeCycleSummary = useMemo(() => {
    if (!activeCycleId) return null;
    const fromList = cycles.find((c) => c.id === activeCycleId);
    if (fromList) return fromList;
    if (activeCycleMeta) {
      return {
        id: activeCycleId,
        label: activeCycleMeta.label,
        cycle_year: activeCycleMeta.cycle_year,
        phase: "collection",
        architecture_type: null as string | null,
        display_id: activeCycleMeta.display_id,
        created_at: "",
      } satisfies AssessmentCycle;
    }
    return null;
  }, [activeCycleId, activeCycleMeta, cycles]);

  const firstName = user.name?.split(/\s+/)[0] ?? "there";
  const totalCycles = cycles.length;
  const inFlight = cycles.filter((c) => !["submitted", "archived"].includes((c.phase || "").toLowerCase())).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8 pb-8">
      {/* Hero — inspired by reference dashboards: gradient, KPIs, responsive stack */}
      <section
        className="relative overflow-hidden rounded-2xl border border-white/10 px-5 py-6 sm:px-8 sm:py-8 text-white shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-8"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #1f4e79 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 sm:h-56 sm:w-56" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-sky-400/10" />
        <div className="relative z-[1] min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-200/90">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {greetingHour()}, {firstName}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-sky-100/90">
            {role ? ROLE_DESCRIPTIONS[role as UserRole] ?? roleLabel : "You are not assigned a global role yet."}{" "}
            {activeCycleSummary ? (
              <>
                Active cycle:{" "}
                <span className="font-semibold text-white">{activeCycleSummary.label}</span>
                <span className="ml-1 font-mono text-xs text-sky-200/80">({activeCycleSummary.display_id})</span>
              </>
            ) : (
              <>Start from assessment cycles when you are ready to work in a SWIFT CSCF assessment.</>
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/assessments/new"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:bg-sky-50"
            >
              {totalCycles ? "Manage assessment cycles" : "Create your first cycle"}
            </Link>
            {activeCycleId && (
              <Link
                href={`/cycles/${activeCycleId}/dashboard`}
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Open collection dashboard
              </Link>
            )}
          </div>
        </div>
        <div className="relative z-[1] mt-6 grid w-full max-w-md grid-cols-3 gap-2 sm:mt-0 sm:max-w-xs sm:flex sm:flex-col sm:gap-2">
          {[
            { value: totalCycles, label: "Cycles" },
            { value: inFlight, label: "In progress" },
            { value: roleLabel.split(" ").slice(0, 2).join(" "), label: "Your role", small: true },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm sm:text-left"
            >
              <div className={`font-bold text-white ${k.small ? "text-xs leading-snug sm:text-sm" : "text-xl sm:text-2xl"}`}>
                {k.value}
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">{k.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats — responsive grid */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: "◆",
            label: "Assessment cycles",
            value: loading ? "—" : String(totalCycles),
            sub: "Visible to your tenant",
            tint: "bg-[var(--primary-muted)] text-[var(--primary)]",
          },
          {
            icon: "◎",
            label: "Active cycle",
            value: activeCycleMeta?.display_id ?? (activeCycleId ? "Selected" : "None"),
            sub: activeCycleSummary?.label ?? "Pick a cycle to unlock domain nav",
            tint: "bg-[var(--info-bg)] text-[var(--info)]",
          },
          {
            icon: "▣",
            label: "Phases in flight",
            value: loading ? "—" : String(inFlight),
            sub: "Excludes submitted / archived",
            tint: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
          },
          {
            icon: "◇",
            label: "Account",
            value: initials(user.name),
            sub: user.email,
            tint: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-start gap-3 rounded-2xl border p-4 transition-shadow hover:shadow-md"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${s.tint}`}>{s.icon}</div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                {s.label}
              </p>
              <p className="truncate text-lg font-bold" style={{ color: "var(--foreground)" }}>
                {s.value}
              </p>
              <p className="text-xs leading-snug" style={{ color: "var(--foreground-muted)" }}>
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Phase strip + highlights */}
        <div className="lg:col-span-2 space-y-6">
          <section
            className="rounded-2xl border p-5 sm:p-6"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Phase overview
              </h2>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                Where your cycles sit across the SWIFT workflow
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PHASE_ORDER.map((p) => {
                const count = phaseCounts.get(p) ?? 0;
                return (
                  <span
                    key={p}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${phaseColor(p)} ${count === 0 ? "opacity-55" : ""}`}
                  >
                    {phaseLabel(p)} · {count}
                  </span>
                );
              })}
            </div>
            {totalCycles === 0 && !loading && (
              <p className="mt-4 text-sm" style={{ color: "var(--foreground-muted)" }}>
                No cycles yet — create one to see collection, review, and approval activity here.
              </p>
            )}
          </section>

          <section
            className="rounded-2xl border p-5 sm:p-6"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              {highlights.title}
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
              {highlights.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          {/* Recent cycles */}
          <section
            className="rounded-2xl border p-5 sm:p-6"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Recent cycles
              </h2>
              <Link href="/assessments/new" className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>
                View all
              </Link>
            </div>
            {loading ? (
              <p className="mt-4 text-sm" style={{ color: "var(--foreground-muted)" }}>
                Loading cycles…
              </p>
            ) : cycles.length === 0 ? (
              <div
                className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center"
                style={{ borderColor: "var(--border)" }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  No assessment cycles yet
                </p>
                <p className="mt-1 max-w-sm text-xs" style={{ color: "var(--foreground-muted)" }}>
                  Create a cycle to run SWIFT CSCF collection, reviews, and approvals in one place.
                </p>
                <Link
                  href="/assessments/new"
                  className="mt-4 inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  + New assessment cycle
                </Link>
              </div>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cycles.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={cycleEntryPath(c)}
                      className="block rounded-xl border p-4 transition hover:border-[var(--primary)] hover:shadow-md"
                      style={{ borderColor: "var(--border)", background: "var(--background)" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold" style={{ color: "var(--foreground)" }}>
                            {c.label}
                          </p>
                          <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--foreground-muted)" }}>
                            {c.display_id}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ${phaseColor(c.phase)}`}>
                          {c.phase}
                        </span>
                      </div>
                      <p className="mt-2 text-xs" style={{ color: "var(--foreground-muted)" }}>
                        Year {c.cycle_year}
                        {c.created_at ? ` · Created ${new Date(c.created_at).toLocaleDateString()}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Quick actions + activity-style tips */}
        <div className="space-y-6">
          <section
            className="rounded-2xl border p-5 sm:p-6"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Quick actions
            </h2>
            <ul className="mt-4 space-y-2">
              {quickActions.map((a) => (
                <li key={a.href + a.label}>
                  <Link
                    href={a.href}
                    className={`block rounded-xl border px-3 py-3 text-sm transition hover:shadow-md ${
                      a.primary ? "border-[var(--primary)] bg-[var(--primary-muted)]/50 font-semibold" : ""
                    }`}
                    style={
                      a.primary
                        ? undefined
                        : { borderColor: "var(--border)", color: "var(--foreground)" }
                    }
                  >
                    <span className="block" style={{ color: "var(--foreground)" }}>
                      {a.label}
                    </span>
                    <span className="mt-0.5 block text-xs font-normal" style={{ color: "var(--foreground-muted)" }}>
                      {a.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="rounded-2xl border p-5 sm:p-6"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Tips
            </h2>
            <ul className="mt-3 space-y-3 text-sm" style={{ color: "var(--foreground-muted)" }}>
              <li className="flex gap-2">
                <span className="text-lg leading-none" aria-hidden>
                  →
                </span>
                <span>Use <strong style={{ color: "var(--foreground)" }}>Assessment cycles</strong> before diving into domain work.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg leading-none" aria-hidden>
                  →
                </span>
                <span>Sidebar <strong style={{ color: "var(--foreground)" }}>Dashboard</strong> opens the collection workspace when a cycle is active.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg leading-none" aria-hidden>
                  →
                </span>
                <span>This home view stays available at <strong style={{ color: "var(--foreground)" }}>/dashboard</strong> anytime.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

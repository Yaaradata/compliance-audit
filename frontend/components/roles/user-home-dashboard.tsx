"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AssessmentCycle, User } from "@/lib/types";
import { api } from "@/lib/api";
import { RoleDashboardHero, StatKpiArticleGrid } from "@/components/roles/shared";
import type { CycleDashboard, CycleReviewStats, EvidenceReviewApiRow } from "@/components/roles/shared/compliance-types";
import { daysTo, normalizeRoleForCycle, phaseLabel, cycleEntryPath } from "@/components/roles/shared/utils";

type CycleCardRow = {
  id: string;
  label: string;
  displayId: string;
  phase: string;
  dueLabel: string;
  role: string | null;
  href: string;
  dueIn: number | null;
  dashboard?: CycleDashboard | null;
  review?: CycleReviewStats | null;
};

function roleBadge(role: string | null) {
  if (role === "it_sme") return { label: "IT Expert", cls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" };
  if (role === "internal_reviewer_l1") return { label: "L1 Reviewer", cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" };
  if (role === "internal_reviewer_l2") return { label: "L2 Reviewer", cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" };
  if (role === "external_assessor") return { label: "L3 Assessor", cls: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" };
  return { label: "No access", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
}

function roleHref(cycleId: string, role: string | null, cycle: AssessmentCycle) {
  if (!role) return "/assessments/new";
  if (role === "internal_reviewer_l1" || role === "internal_reviewer_l2" || role === "external_assessor") {
    return `/cycles/${cycleId}/review`;
  }
  return cycleEntryPath(cycle);
}

export function UserHomeDashboard({ user, cycles }: { user: User; cycles: AssessmentCycle[] }) {
  const firstName = user.name?.split(/\s+/)[0] ?? "there";
  const [rolesByCycleId, setRolesByCycleId] = useState<Record<string, string | null>>({});
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [dashByCycleId, setDashByCycleId] = useState<Record<string, CycleDashboard | null>>({});
  const [reviewByCycleId, setReviewByCycleId] = useState<Record<string, CycleReviewStats | null>>({});
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadRoles() {
      setLoadingRoles(true);
      const entries = await Promise.all(
        cycles.map(async (c) => {
          try {
            const res = await api.get<{ role: string | null }>(`/assessments/${c.id}/my-role`);
            return [c.id, normalizeRoleForCycle(res.role)] as const;
          } catch {
            return [c.id, null] as const;
          }
        })
      );
      if (!cancelled) {
        setRolesByCycleId(Object.fromEntries(entries));
        setLoadingRoles(false);
      }
    }

    if (cycles.length) void loadRoles();
    else setRolesByCycleId({});

    return () => {
      cancelled = true;
    };
  }, [cycles]);

  useEffect(() => {
    const cycleIds = cycles.map((c) => c.id);
    if (cycleIds.length === 0) {
      setDashByCycleId({});
      setReviewByCycleId({});
      return;
    }

    const hasAnyRoleResolved = cycleIds.some((id) => Object.prototype.hasOwnProperty.call(rolesByCycleId, id));
    if (!hasAnyRoleResolved) return;

    let cancelled = false;
    async function loadCardData() {
      setLoadingCards(true);

      const relevant = cycles
        .map((c) => ({ cycle: c, role: rolesByCycleId[c.id] ?? null }))
        .filter((x) => Boolean(x.role));

      const dashEntries = await Promise.all(
        relevant.map(async ({ cycle }) => {
          try {
            const dash = await api.get<CycleDashboard>(`/assessments/${cycle.id}/dashboard`);
            return [cycle.id, dash] as const;
          } catch {
            return [cycle.id, null] as const;
          }
        })
      );

      const reviewEntries = await Promise.all(
        relevant.map(async ({ cycle, role }) => {
          if (!role) return [cycle.id, null] as const;
          if (!["it_sme", "internal_reviewer_l1", "internal_reviewer_l2", "external_assessor"].includes(role)) {
            return [cycle.id, null] as const;
          }
          try {
            const reviews = await api.getDirect<EvidenceReviewApiRow[]>(`/assessments/${cycle.id}/reviews`);
            const stats = (reviews ?? []).reduce<CycleReviewStats>(
              (acc, r) => {
                const s = (r.status ?? "").toLowerCase();
                if (s === "approved") acc.approved += 1;
                else if (s === "returned" || s === "rejected") acc.rejected += 1;
                else if (s === "assigned" || s === "in_review" || s === "hold") acc.inReview += 1;
                return acc;
              },
              { inReview: 0, approved: 0, rejected: 0 }
            );
            return [cycle.id, stats] as const;
          } catch {
            return [cycle.id, { inReview: 0, approved: 0, rejected: 0 }] as const;
          }
        })
      );

      if (cancelled) return;
      setDashByCycleId(Object.fromEntries(dashEntries));
      setReviewByCycleId(Object.fromEntries(reviewEntries));
      setLoadingCards(false);
    }

    void loadCardData();
    return () => {
      cancelled = true;
    };
  }, [cycles, rolesByCycleId]);

  const rows = useMemo<CycleCardRow[]>(
    () =>
      [...cycles]
        .map((c) => {
          const role = rolesByCycleId[c.id] ?? null;
          const dueIn = daysTo(c.target_submission_date ?? c.end_date);
          const dueLabel = dueIn === null ? "No deadline" : dueIn <= 0 ? "Due now" : `${dueIn} day(s) left`;
          return {
            id: c.id,
            label: c.label,
            displayId: c.display_id,
            phase: phaseLabel(c.phase),
            dueLabel,
            role,
            href: roleHref(c.id, role, c),
            dueIn,
            dashboard: role ? (dashByCycleId[c.id] ?? null) : undefined,
            review: role ? (reviewByCycleId[c.id] ?? null) : undefined,
          };
        })
        .sort((a, b) => a.dueLabel.localeCompare(b.dueLabel)),
    [cycles, rolesByCycleId, dashByCycleId, reviewByCycleId]
  );

  const accessible = rows.filter((r) => Boolean(r.role)).length;
  const inProgress = rows.filter((r) => r.role && !["submitted", "archived"].includes((r.phase || "").toLowerCase())).length;
  const evidenceUploaded = rows
    .filter((r) => r.role === "it_sme")
    .reduce((acc, r) => acc + (r.dashboard?.evidence_items ?? 0), 0);
  const aiInReview = rows
    .filter((r) => Boolean(r.role))
    .reduce((acc, r) => acc + (r.review?.inReview ?? 0), 0);

  const deadlineRows = useMemo(() => {
    return rows
      .filter((r) => Boolean(r.role) && r.dueIn !== null)
      .sort((a, b) => (a.dueIn ?? 9999) - (b.dueIn ?? 9999))
      .slice(0, 6);
  }, [rows]);

  const loading = loadingRoles || loadingCards;

  const isReviewerRole = (role: string | null) =>
    role === "internal_reviewer_l1" || role === "internal_reviewer_l2" || role === "external_assessor";

  const MiniKpi = ({ label, value, tone }: { label: string; value: string | number; tone: string }) => (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );

  return (
    <div className="w-full space-y-5 pb-6">
      <RoleDashboardHero
        eyebrow="Your Dashboard"
        greetingName={firstName}
        description="Your work changes by cycle. Pick a cycle below to jump into the correct workspace for your assigned role."
        primaryActions={[
          {
            href: "/assessments/new",
            label: "Switch / view cycles",
            gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          },
        ]}
      />

      <StatKpiArticleGrid
        items={[
          {
            label: "Assigned cycles",
            value: accessible,
            sub: "Cycles assigned to this user",
            tone: "bg-[var(--primary-muted)] text-[var(--primary)]",
            meter: Math.min(100, accessible * 20),
          },
          {
            label: "In progress",
            value: inProgress,
            sub: "Assigned cycles in active phase",
            tone: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
            meter: accessible ? Math.round((inProgress / Math.max(1, accessible)) * 100) : 0,
          },
          {
            label: "Evidence uploaded",
            value: evidenceUploaded,
            sub: "Submissions uploaded by IT Expert",
            tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
            meter: Math.min(100, evidenceUploaded * 6),
          },
          {
            label: "AI in review",
            value: aiInReview,
            sub: "AI-evaluated items under review",
            tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
            meter: Math.min(100, aiInReview * 10),
          },
        ]}
        loading={loading}
        ariaLabel="User dashboard KPIs"
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div
          className="rounded-2xl border p-4 sm:p-5 xl:col-span-2"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Cycle-wise insights
            </h2>
            <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              Role shown at top of each cycle card
            </span>
          </div>

          <div className="space-y-3">
          {rows.map((r) => {
            const b = roleBadge(r.role);
            const disabled = !r.role;
            const dash = r.dashboard ?? null;
            const review = r.review ?? null;
            const evidenceDone = dash?.evidence_items ?? 0;
            const evidenceTotal = dash?.total_evidence_items ?? 0;
            const evidencePct = evidenceTotal > 0 ? Math.round((evidenceDone / evidenceTotal) * 100) : 0;
            return (
              <div
                key={r.id}
                className="rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--background)",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                      {r.label}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                      {r.displayId} · {r.phase} · {r.dueLabel}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold ${b.cls}`}>
                    {b.label}
                  </span>
                </div>

                {r.role === "it_sme" && (
                  <div className="mt-3">
                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                          Evidence upload progress
                        </p>
                        <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                          {evidenceDone}/{evidenceTotal} ({evidencePct}%)
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-cyan-500"
                          style={{ width: `${Math.max(0, Math.min(100, evidencePct))}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                      <MiniKpi label="Assigned controls" value={dash?.total_controls ?? 0} tone="text-[var(--foreground)]" />
                      <MiniKpi label="Evidence uploaded" value={`${evidenceDone}/${evidenceTotal}`} tone="text-[var(--foreground)]" />
                      <MiniKpi label="AI evaluated in review" value={review?.inReview ?? 0} tone="text-violet-700 dark:text-violet-300" />
                      <MiniKpi label="Review succeeded" value={review?.approved ?? 0} tone="text-emerald-700 dark:text-emerald-300" />
                      <MiniKpi label="Reviewer rejected" value={review?.rejected ?? 0} tone="text-rose-700 dark:text-rose-300" />
                    </div>
                  </div>
                )}

                {isReviewerRole(r.role) && (
                  <div className="mt-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <MiniKpi label="Awaiting your decision" value={review?.inReview ?? 0} tone="text-violet-700 dark:text-violet-300" />
                      <MiniKpi label="Approved" value={review?.approved ?? 0} tone="text-emerald-700 dark:text-emerald-300" />
                      <MiniKpi label="Returned" value={review?.rejected ?? 0} tone="text-rose-700 dark:text-rose-300" />
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <Link
                    href={disabled ? "/assessments/new" : r.href}
                    className="text-xs font-medium hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    {disabled ? "Request access / contact Compliance Officer →" : "Open workspace →"}
                  </Link>
                </div>
              </div>
            );
          })}

          {!loading && rows.length === 0 && (
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              No cycles available yet.
            </p>
          )}
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Test cycle deadlines
              </h2>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                Right-side view
              </p>
            </div>
            <Link
              href="/assessments/new"
              className="shrink-0 text-xs font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {deadlineRows.map((r) => (
              <Link
                key={r.id}
                href={r.href}
                className="block rounded-lg border p-2.5 transition hover:border-[var(--primary)] hover:shadow-sm"
                style={{ borderColor: "var(--border)", background: "var(--background)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {r.label}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                      {r.displayId} · {r.phase}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      {r.dueLabel}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                      {roleBadge(r.role).label}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {!loading && deadlineRows.length === 0 && (
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                No deadlines configured for your assigned cycles.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


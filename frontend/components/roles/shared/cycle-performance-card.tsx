"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { dashboardOutlineStyle, dashboardPrimaryGradient } from "@/lib/dashboard-button-tokens";
import type { CycleInsight } from "@/components/roles/shared/compliance-types";
import { cycleEntryPath, daysTo, initials, PHASE_ORDER, phaseLabel, phaseStep } from "@/components/roles/shared/utils";

type CyclePerformanceCardProps = {
  row: CycleInsight;
  onViewVisuals: (cycleId: string) => void;
  onDeleted?: (cycleId: string) => void;
};

export function CyclePerformanceCard({ row, onViewVisuals, onDeleted }: CyclePerformanceCardProps) {
  const coOutline = dashboardOutlineStyle("compliance_officer");
  const coPrimary = dashboardPrimaryGradient("compliance_officer");
  const c = row.cycle;
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const phaseIdx = phaseStep(c.phase);
  const completionPct = Math.round((phaseIdx / (PHASE_ORDER.length - 1)) * 100);
  const evidenceDone = row.dashboard?.evidence_items ?? 0;
  const evidenceTotal = row.dashboard?.total_evidence_items ?? 0;
  const controlsAtRisk = row.dashboard?.gaps_identified ?? 0;
  const days = daysTo(c.target_submission_date ?? c.end_date);
  const dueDateLabel = (c.target_submission_date ?? c.end_date)
    ? new Date(c.target_submission_date ?? c.end_date ?? "").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const dueLabel = days === null ? "No deadline" : days <= 0 ? "Due now" : `${days} days left`;
  const statusRows = row.dashboard?.control_scores ?? [];
  const controlsInReview = Math.max(
    0,
    Math.min(row.dashboard?.total_controls ?? 0, Math.round((row.dashboard?.total_controls ?? 0) * 0.2))
  );
  const evidenceInReview = Math.min(evidenceDone, controlsInReview);
  const l2Review = statusRows.filter((s) => (s.status ?? "").toLowerCase().includes("l2")).length;
  const l3Review = statusRows.filter((s) => (s.status ?? "").toLowerCase().includes("l3")).length;
  const l1Review = Math.max(0, evidenceInReview - l2Review - l3Review);
  const submissionScore = evidenceTotal > 0 ? Math.round((evidenceDone / evidenceTotal) * 100) : 0;
  const submissionScoreLabel =
    submissionScore < 25
      ? "Critical — below 25%"
      : submissionScore < 50
        ? "Needs attention"
        : submissionScore < 75
          ? "Moderate"
          : "Healthy";
  const relatedUsers = row.relatedUsers.slice(0, 4);
  const remainingUsers = Math.max(0, row.relatedUsers.length - relatedUsers.length);
  const cycleInitials = initials(c.label || c.display_id || "CY");

  useEffect(() => {
    if (!deleteDialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setDeleteDialogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteDialogOpen, deleting]);

  const openDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
  };

  const executeDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.del(`/assessments/${c.id}`);
      setDeleteDialogOpen(false);
      onDeleted?.(c.id);
    } catch {
      // keep dialog open so the user can cancel or retry
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <div
      className="rounded-2xl border p-0 overflow-hidden"
      style={{
        borderColor: "#eef0f4",
        background: "#ffffff",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div className="p-6 border-b" style={{ borderColor: "#eef0f4" }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex items-start gap-3">
            <div
              className="h-11 w-11 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold uppercase tracking-wide"
              style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
              aria-hidden
            >
              {cycleInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[28px] font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                {c.label}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                {c.display_id} · Year {c.cycle_year} · Created{" "}
                {c.created_at ? new Date(c.created_at).toLocaleDateString() : "n/a"}
              </p>
              <div className="mt-2" />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:self-center">
            {row.relatedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {relatedUsers.map((u, idx) => (
                    <span
                      key={u.id}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white ${
                        idx % 4 === 0
                          ? "bg-indigo-600"
                          : idx % 4 === 1
                            ? "bg-cyan-600"
                            : idx % 4 === 2
                              ? "bg-violet-600"
                              : "bg-emerald-600"
                      }`}
                      style={{ marginLeft: idx === 0 ? 0 : -8, borderColor: "var(--surface)" }}
                      title={u.name}
                      aria-label={`${u.name} is assigned to ${c.label}`}
                    >
                      {initials(u.name)}
                    </span>
                  ))}
                  {remainingUsers > 0 && (
                    <span
                      className="ml-[-8px] inline-flex h-8 w-8 items-center justify-center rounded-full border-2 bg-slate-700 text-[10px] font-bold text-white"
                      style={{ borderColor: "var(--surface)" }}
                      title={`${remainingUsers} more users`}
                      aria-label={`${remainingUsers} more users assigned to ${c.label}`}
                    >
                      +{remainingUsers}
                    </span>
                  )}
                </div>
              </div>
            )}
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                days !== null && days <= 2 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {dueDateLabel ? `${dueLabel} · ${dueDateLabel}` : dueLabel}
            </span>
            <button
              type="button"
              onClick={() => onViewVisuals(c.id)}
              className="interactive-outline-btn inline-flex items-center dashboard-btn-pill border-2 bg-white px-4 text-sm font-semibold"
              style={{ borderColor: coOutline.border, color: coOutline.text }}
            >
              View visuals
            </button>
            <Link
              href={cycleEntryPath(c)}
              className="interactive-hero-action inline-flex items-center dashboard-btn-pill border-0 px-4 text-sm font-semibold text-white shadow-sm"
              style={{ background: coPrimary }}
            >
              Open cycle
            </Link>
            <button
              type="button"
              onClick={openDeleteDialog}
              disabled={deleting}
              className="interactive-danger-btn inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-300 p-0 text-red-600 disabled:opacity-60"
              style={{ borderColor: deleting ? "#fecaca" : "#fca5a5" }}
              aria-label={`Delete cycle ${c.label}`}
              title={deleting ? "Deleting..." : "Delete cycle"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--foreground-muted)" }}>
          Phase: {phaseLabel(c.phase)} · Updated recently
        </p>
      </div>

      <div className="p-6 space-y-2">
        <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Evidence Files
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-md px-3 py-2.5" style={{ background: "#f8f9fa" }}>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: "#3b82f6" }} />
                  Total
                </div>
                <div className="text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{evidenceTotal}</div>
              </div>
              <div className="rounded-md px-3 py-2.5" style={{ background: "#f8f9fa" }}>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />
                  Uploaded
                </div>
                <div className="text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{evidenceDone}</div>
              </div>
              <div className="rounded-md px-3 py-2.5" style={{ background: "#f8f9fa" }}>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: "#9333ea" }} />
                  AI Passed
                </div>
                <div className="text-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
                  {Math.max(0, evidenceDone - controlsAtRisk)}
                </div>
              </div>
              <div className="rounded-md px-3 py-2.5" style={{ background: "#f8f9fa" }}>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: "#f59e0b" }} />
                  In Review
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                  <span className="rounded-md px-2 py-0.5" style={{ color: "#1d4ed8", background: "#dbeafe" }}>
                    L1 : {l1Review}
                  </span>
                  <span className="rounded-md px-2 py-0.5" style={{ color: "#6d28d9", background: "#ede9fe" }}>
                    L2 : {l2Review}
                  </span>
                  <span className="rounded-md px-2 py-0.5" style={{ color: "#b91c1c", background: "#fee2e2" }}>
                    L3 : {l3Review}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Evidence Submission Score
            </p>
            <div className="mt-2 h-full rounded-md border p-3" style={{ borderColor: "#eef0f4", background: "#ffffff" }}>
              <p className="mt-0.5 text-[40px] font-bold leading-none" style={{ color: "var(--foreground)" }}>
                {submissionScore}%
              </p>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                {evidenceDone} of {evidenceTotal} submitted
              </p>
              <div className="mt-2 h-2 rounded bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded bg-red-500" style={{ width: `${Math.max(0, Math.min(100, submissionScore))}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-red-600">{submissionScoreLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="border-t pt-3 rounded-xl px-2 py-3" style={{ borderColor: "#eef0f4", background: "#ffffff" }}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--foreground-muted)" }}>
              Cycle Progress
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              <span className="font-bold">{completionPct}% complete</span>
            </p>
          </div>

          <div className="relative pt-2">
            <div className="absolute left-4 right-4 top-[18px] h-[3px] rounded-full bg-slate-200 dark:bg-slate-700" />
            <div
              className="absolute left-4 top-[18px] h-[3px] rounded-full bg-emerald-500"
              style={{ width: `calc((100% - 2rem) * ${Math.max(0, Math.min(100, completionPct)) / 100})` }}
            />
            <div className="grid grid-cols-4 relative">
              {["setup", "collection", "review", "approval"].map((step, idx) => {
                const isCompleted = idx < phaseIdx;
                const isCurrent = idx === phaseIdx;
                return (
                  <div key={step} className="flex flex-col items-center">
                    <span
                      className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : isCurrent
                            ? "bg-white border-emerald-500 text-emerald-600 animate-pulse"
                            : "bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500"
                      }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </span>
                    <span
                      className={`mt-2 text-[11px] font-semibold uppercase tracking-wide ${
                        isCompleted || isCurrent ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

    {deleteDialogOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-cycle-dialog-title"
        aria-describedby="delete-cycle-dialog-desc"
      >
        <div
          role="presentation"
          className="absolute inset-0 bg-black/40"
          onClick={deleting ? undefined : closeDeleteDialog}
          aria-hidden
        />
        <div
          className="relative w-full max-w-md rounded-2xl border p-5 shadow-xl"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <h2 id="delete-cycle-dialog-title" className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Delete assessment cycle?
          </h2>
          <p id="delete-cycle-dialog-desc" className="mt-3 text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            This will permanently delete this assessment cycle and all related data—including evidence, reviews, and progress.
            This action cannot be undone.
          </p>
          <div
            className="mt-4 rounded-lg border px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>
              {c.label}
            </p>
            <p className="mt-0.5 text-xs font-mono" style={{ color: "var(--foreground-muted)" }}>
              {c.display_id}
              {c.cycle_year != null ? ` · Year ${c.cycle_year}` : ""}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeDeleteDialog}
              disabled={deleting}
              className="interactive-outline-btn dashboard-btn-pill inline-flex items-center justify-center border-2 bg-white text-sm font-semibold disabled:opacity-60"
              style={{ borderColor: coOutline.border, color: coOutline.text }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeDelete}
              disabled={deleting}
              className="dashboard-btn-pill inline-flex items-center justify-center border border-red-600 bg-red-600 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete cycle"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

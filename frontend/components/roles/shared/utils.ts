import type { AssessmentCycle } from "@/lib/types";

export const PHASE_ORDER = ["setup", "collection", "review", "approval", "reporting", "submitted", "archived"] as const;

export function phaseLabel(phase: string): string {
  const map: Record<string, string> = {
    setup: "Setup",
    collection: "Collection",
    review: "Review",
    approval: "Approval",
    reporting: "Reporting",
    submitted: "Submitted",
    archived: "Archived",
  };
  return map[phase] ?? phase;
}

export function phaseColor(phase: string): string {
  const colors: Record<string, string> = {
    setup: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
    collection: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
    review: "bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-200",
    approval: "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
    reporting: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200",
    submitted: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
    archived: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  };
  return colors[phase] ?? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
}

export function initials(name: string | undefined): string {
  return (
    name
      ?.split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?"
  );
}

export function greetingHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function cycleEntryPath(c: AssessmentCycle): string {
  if (c.phase === "setup" || !c.architecture_type) return `/cycles/${c.id}/role-evidence-setup`;
  return `/cycles/${c.id}/dashboard`;
}

export function daysTo(dateLike?: string | null): number | null {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}

export function phaseStep(phase: string): number {
  const idx = PHASE_ORDER.findIndex((p) => p === phase);
  return idx >= 0 ? idx : 1;
}

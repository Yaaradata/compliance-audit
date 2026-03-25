"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { AssessmentCycle } from "@/lib/types";

type AssessmentCyclesModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AssessmentCyclesModal({ open, onClose }: AssessmentCyclesModalProps) {
  const router = useRouter();
  const { activeCycleId, setActiveCycleId, setArchitecture } = useAuth();
  const [cycles, setCycles] = useState<AssessmentCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .get<AssessmentCycle[]>("/assessments")
      .then((data) => setCycles(data))
      .catch(() => setCycles([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleOpenCycle = (cycle: AssessmentCycle) => {
    setActiveCycleId(cycle.id, {
      label: cycle.label,
      cycle_year: cycle.cycle_year,
      display_id: cycle.display_id,
    });
    if (cycle.architecture_type) {
      setArchitecture(cycle.architecture_type);
    }
    onClose();
    if (cycle.phase === "setup" || !cycle.architecture_type) {
      router.push(`/cycles/${cycle.id}/role-evidence-setup`);
      return;
    }
    router.push(`/cycles/${cycle.id}/dashboard`);
  };

  const handleDeleteCycle = async (cycle: AssessmentCycle) => {
    if (!confirm(`Delete "${cycle.label}"? This will permanently remove all evidence, submissions, reviews, and other data in this cycle.`)) {
      return;
    }
    setDeletingId(cycle.id);
    try {
      await api.del(`/assessments/${cycle.id}`);
      setCycles((prev) => prev.filter((c) => c.id !== cycle.id));
      if (cycle.id === activeCycleId) setActiveCycleId(null);
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const phaseBadge = (phase: string) => {
    const colors: Record<string, string> = {
      setup: "bg-yellow-100 text-yellow-800",
      collection: "bg-blue-100 text-blue-800",
      review: "bg-purple-100 text-purple-800",
      approval: "bg-orange-100 text-orange-800",
      reporting: "bg-cyan-100 text-cyan-800",
      submitted: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-600",
    };
    return colors[phase] || "bg-gray-100 text-gray-600";
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assessment-cycles-title"
    >
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close dialog" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl rounded-2xl border p-5 shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="assessment-cycles-title" className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Assessment cycles
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--foreground-muted)" }}>
            Loading cycles...
          </p>
        ) : cycles.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--foreground-muted)" }}>
            No assessment cycles found.
          </p>
        ) : (
          <div className="space-y-3">
            {cycles.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border p-4"
                style={{ borderColor: "var(--border)", background: "var(--background)" }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                        {c.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">{c.display_id}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                      Year: {c.cycle_year} · Created: {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${phaseBadge(c.phase)}`}>{c.phase}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenCycle(c)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCycle(c)}
                      disabled={deletingId === c.id}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === c.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

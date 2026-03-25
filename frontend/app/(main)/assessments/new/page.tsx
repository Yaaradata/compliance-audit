"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { NewAssessmentCycleForm } from "@/components/assessments/new-assessment-cycle-form";
import type { AssessmentCycle } from "@/lib/types";

export default function AssessmentsPage() {
  const router = useRouter();
  const { user, activeCycleId, setActiveCycleId, setArchitecture } = useAuth();
  const [cycles, setCycles] = useState<AssessmentCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .get<AssessmentCycle[]>("/assessments")
      .then((cyclesData) => {
        setCycles(cyclesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleDeleteCycle = async (e: React.MouseEvent, cycle: AssessmentCycle) => {
    e.stopPropagation();
    if (!confirm(`Delete "${cycle.label}"? This will permanently remove all evidence, submissions, reviews, and other data in this cycle.`))
      return;
    setDeletingId(cycle.id);
    try {
      await api.del(`/assessments/${cycle.id}`);
      setCycles((prev) => prev.filter((c) => c.id !== cycle.id));
      if (cycle.id === activeCycleId) setActiveCycleId(null);
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 404) {
        setCycles((prev) => prev.filter((c) => c.id !== cycle.id));
        if (cycle.id === activeCycleId) setActiveCycleId(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenCycle = (cycle: AssessmentCycle) => {
    setActiveCycleId(cycle.id, {
      label: cycle.label,
      cycle_year: cycle.cycle_year,
      display_id: cycle.display_id,
    });
    if (cycle.architecture_type) {
      setArchitecture(cycle.architecture_type);
    }

    if (cycle.phase === "setup" || !cycle.architecture_type) {
      router.push(`/cycles/${cycle.id}/role-evidence-setup`);
      return;
    }
    router.push(`/cycles/${cycle.id}/dashboard`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading assessment cycles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Your Assessment Cycles</h1>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to dashboard
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-6">Create or resume a SWIFT CSCF compliance assessment</p>

        {cycles.length > 0 && (
          <div className="space-y-3 mb-6">
            {cycles.map((c) => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenCycle(c)}
                onKeyDown={(e) => e.key === "Enter" && handleOpenCycle(c)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{c.label}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono"
                        title="Cycle ID — used for all evidence and evaluations"
                      >
                        {c.display_id}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Year: {c.cycle_year} · Created: {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.architecture_type && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{c.architecture_type}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${phaseBadge(c.phase)}`}>{c.phase}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCycle(c);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {c.phase === "setup" || !c.architecture_type ? "Set up" : "Collection"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCycle(e, c)}
                      disabled={deletingId === c.id}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                      title="Delete this cycle and all its evidence and data"
                    >
                      {deletingId === c.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all"
          >
            + Create New Assessment Cycle
          </button>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">New Assessment Cycle</h2>
            <NewAssessmentCycleForm
              showFooterCancel
              onCancel={() => {
                setShowForm(false);
              }}
              onSuccess={(cycle) => {
                router.push(`/cycles/${cycle.id}/role-evidence-setup`);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

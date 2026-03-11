"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/ui/loading-state";

interface ApiReview {
  id: string;
  status: string;
  level: string;
}

interface ApprovalSummary {
  gates?: { gate_type: string; status: string; ready?: boolean }[];
}

function normalizeLevel(level: string): string {
  return ({ l1_completeness: "L1", l2_quality: "L2", l3_assessment: "L3" } as Record<string, string>)[level] || level;
}

export function L3AssessorDashboard({ cycleId }: { cycleId: string }) {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [approvalSummary, setApprovalSummary] = useState<ApprovalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cycleId) {
      setReviews([]);
      setApprovalSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.getDirect<ApiReview[]>(`/assessments/${cycleId}/reviews?level=L3`),
      api.get<ApprovalSummary>(`/assessments/${cycleId}/approval/summary`).catch(() => null),
    ])
      .then(([revs, summary]) => {
        setReviews(revs);
        setApprovalSummary(summary ?? null);
      })
      .catch(() => {
        setReviews([]);
        setApprovalSummary(null);
      })
      .finally(() => setLoading(false));
  }, [cycleId]);

  const counts = useMemo(() => {
    const l3 = reviews.filter((r) => normalizeLevel(r.level) === "L3");
    return {
      total: l3.length,
      pending: l3.filter((r) => !["approved", "returned", "hold", "escalated"].includes(r.status)).length,
      approved: l3.filter((r) => r.status === "approved" || r.status === "escalated").length,
      returned: l3.filter((r) => r.status === "returned").length,
    };
  }, [reviews]);

  const pendingGates = useMemo(() => {
    const gates = approvalSummary?.gates ?? [];
    return gates.filter((g) => g.status !== "approved");
  }, [approvalSummary]);

  if (loading) return <LoadingState message="Loading L3 queue…" />;

  return (
    <div>
      <div className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>L3 Review & Approval</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800">{counts.total}</div>
          <div className="text-xs text-slate-500">Assigned</div>
        </div>
        <div className="card rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-600">{counts.pending}</div>
          <div className="text-xs text-slate-500">Pending</div>
        </div>
        <div className="card rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-600">{counts.approved}</div>
          <div className="text-xs text-slate-500">Approved</div>
        </div>
        <div className="card rounded-xl p-4">
          <div className="text-2xl font-bold text-rose-600">{counts.returned}</div>
          <div className="text-xs text-slate-500">Returned</div>
        </div>
      </div>
      {pendingGates.length > 0 && (
        <div className="card rounded-xl p-4 mb-6">
          <div className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>Approval gates pending</div>
          <p className="text-xs text-slate-600 mb-3">
            {pendingGates.length} gate(s) awaiting approval before final attestation.
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/cycles/${cycleId}/review?level=L3`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
        >
          Open L3 Review
        </Link>
        <Link
          href={`/cycles/${cycleId}/approval`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-100 text-violet-800 hover:bg-violet-200 transition-colors"
        >
          Approval Gates
        </Link>
      </div>
    </div>
  );
}

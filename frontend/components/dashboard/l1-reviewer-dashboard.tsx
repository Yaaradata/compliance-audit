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

function normalizeLevel(level: string): string {
  return ({ l1_completeness: "L1", l2_quality: "L2", l3_assessment: "L3" } as Record<string, string>)[level] || level;
}

export function L1ReviewerDashboard({ cycleId }: { cycleId: string }) {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cycleId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getDirect<ApiReview[]>(`/assessments/${cycleId}/reviews?level=L1`)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [cycleId]);

  const counts = useMemo(() => {
    const l1 = reviews.filter((r) => normalizeLevel(r.level) === "L1");
    return {
      total: l1.length,
      pending: l1.filter((r) => !["approved", "returned", "hold", "escalated"].includes(r.status)).length,
      approved: l1.filter((r) => r.status === "approved").length,
      returned: l1.filter((r) => r.status === "returned").length,
    };
  }, [reviews]);

  if (loading) return <LoadingState message="Loading L1 queue…" />;

  return (
    <div>
      <div className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>L1 Review Queue</div>
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
      <Link
        href={`/cycles/${cycleId}/review?level=L1`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
      >
        Open L1 Review
      </Link>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EvidenceViewer } from "@/components/review/evidence-viewer";

interface ApiReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  level: string;
  status: string;
  decision: string | null;
  assigned_at: string;
  completed_at: string | null;
  evidence_item_id: string | null;
  submission_status: string | null;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "assigned", label: "My Queue" },
  { key: "approved", label: "Approved" },
  { key: "returned", label: "Returned" },
] as const;

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  L1: { bg: "bg-blue-100", text: "text-blue-700" },
  L2: { bg: "bg-purple-100", text: "text-purple-700" },
  L3: { bg: "bg-orange-100", text: "text-orange-700" },
};

function domainFrom(itemId: string | null) {
  return itemId ? itemId.charAt(0) : "?";
}

export default function CycleReviewPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const { user } = useAuth();
  const userRole = user?.role || "compliance_officer";

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!cycleId) return;
    setLoading(true);
    try {
      const data = await api.get<ApiReview[]>(`/assessments/${cycleId}/reviews`);
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const metrics = useMemo(() => {
    const assigned = reviews.filter((r) => r.status === "assigned").length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const returned = reviews.filter((r) => r.status === "returned").length;
    const total = reviews.length;
    return { assigned, approved, returned, total };
  }, [reviews]);

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    if (filter === "assigned") {
      return reviews.filter((r) => r.status === "assigned" && r.reviewer_id === user?.id);
    }
    return reviews.filter((r) => r.status === filter);
  }, [filter, reviews, user?.id]);

  const grouped = useMemo(() => {
    const map = new Map<string, ApiReview[]>();
    for (const r of filtered) {
      const domain = domainFrom(r.evidence_item_id);
      if (!map.has(domain)) map.set(domain, []);
      map.get(domain)!.push(r);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleAction = async (decision: "approve" | "return") => {
    if (!selectedReviewId) return;
    try {
      await api.put(`/reviews/${selectedReviewId}`, { decision });
      setSelectedReviewId(null);
      fetchReviews();
    } catch { /* ignore */ }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] gap-0">
      {/* Left: Review queue */}
      <div className="w-[380px] min-w-[320px] border-r border-gray-200 flex flex-col bg-white">
        {/* Metrics */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Review Queue</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", value: metrics.total, color: "text-gray-700", bg: "bg-gray-100" },
              { label: "Queue", value: metrics.assigned, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "Approved", value: metrics.approved, color: "text-green-700", bg: "bg-green-50" },
              { label: "Returned", value: metrics.returned, color: "text-red-700", bg: "bg-red-50" },
            ].map((m) => (
              <div key={m.label} className={`rounded-lg p-2 text-center ${m.bg}`}>
                <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
                <div className={`text-[10px] font-medium ${m.color}`}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-gray-100">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filter === t.key
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Review list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-sm text-gray-400">Loading…</div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-gray-400">No reviews found.</p>
              <p className="text-xs text-gray-300 mt-1">Reviews appear once evidence is submitted for review.</p>
            </div>
          ) : (
            grouped.map(([domain, items]) => (
              <div key={domain}>
                <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Domain {domain}
                  </span>
                </div>
                {items.map((r) => {
                  const lc = LEVEL_COLORS[r.level] || LEVEL_COLORS.L1;
                  const isSelected = selectedReviewId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReviewId(r.id)}
                      className={`w-full text-left px-4 py-2.5 border-b border-gray-50 transition-colors ${
                        isSelected ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-800">
                          {r.evidence_item_id || r.submission_id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${lc.bg} ${lc.text}`}>
                            {r.level}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              r.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : r.status === "returned"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(r.assigned_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Evidence viewer */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedReviewId ? (
          <EvidenceViewer
            reviewId={selectedReviewId}
            userRole={userRole}
            onAction={(decision) => handleAction(decision)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-3 text-gray-300">📋</div>
              <p className="text-sm text-gray-400 font-medium">Select a review from the queue</p>
              <p className="text-xs text-gray-300 mt-1">Evidence details will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

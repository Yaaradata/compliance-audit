"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { InlineEvidenceDetail } from "@/components/review/evidence-viewer";

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

const LEVEL_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  L1: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-300" },
  L2: { bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-300" },
  L3: { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-300" },
};

const LEVEL_LABELS: Record<string, string> = {
  L1: "Completeness",
  L2: "Quality",
  L3: "Assessment",
};

function normalizeLevel(level: string): string {
  return ({ l1_completeness: "L1", l2_quality: "L2", l3_assessment: "L3" } as Record<string, string>)[level] || level;
}

function domainFrom(itemId: string | null) {
  return itemId ? itemId.charAt(0) : "?";
}

function ReviewCard({
  review,
  expanded,
  onToggle,
  userRole,
  onAction,
}: {
  review: ApiReview;
  expanded: boolean;
  onToggle: () => void;
  userRole: string;
  onAction: (decision: "approve" | "return", comment?: string, checklistResults?: Record<string, { checked: boolean; note?: string | null }>) => void;
}) {
  const displayLevel = normalizeLevel(review.level);
  const lc = LEVEL_COLORS[displayLevel] || LEVEL_COLORS.L1;
  const statusBg = review.status === "approved"
    ? "bg-green-100 text-green-700"
    : review.status === "returned"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className={`rounded-xl border-2 transition-all ${expanded ? "border-blue-300 shadow-md" : "border-gray-200 hover:border-gray-300 shadow-sm"} bg-white`}>
      <button type="button" onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">{review.evidence_item_id || review.submission_id.slice(0, 8)}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${lc.bg} ${lc.text}`}>
              {displayLevel} {LEVEL_LABELS[displayLevel]}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBg}`}>
              {review.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">
              {new Date(review.assigned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {/* Mini pipeline */}
        <div className="flex items-center gap-1 mt-2">
          {(["L1", "L2", "L3"] as const).map((level, i) => {
            const isCurrent = displayLevel === level;
            const isDone = (["L1", "L2", "L3"].indexOf(displayLevel) > i) || (isCurrent && review.status === "approved");
            return (
              <div key={level} className="flex items-center gap-0.5">
                {i > 0 && <span className="text-gray-300 text-[9px] mx-0.5">→</span>}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${isDone ? "bg-green-100 text-green-700" : isCurrent ? `${lc.bg} ${lc.text} ring-1 ${lc.ring}` : "bg-gray-100 text-gray-400"}`}>
                  {isDone ? "✓" : isCurrent ? "●" : "○"} {level}
                </span>
              </div>
            );
          })}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-2">
          <InlineEvidenceDetail
            reviewId={review.id}
            userRole={userRole}
            onAction={onAction}
          />
        </div>
      )}
    </div>
  );
}

export default function CycleReviewPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const { user } = useAuth();
  const userRole = user?.role || "compliance_officer";

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const metrics = useMemo(() => {
    const assigned = reviews.filter((r) => r.status === "assigned").length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const returned = reviews.filter((r) => r.status === "returned").length;
    return { assigned, approved, returned, total: reviews.length };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = reviews;
    if (filter === "assigned") {
      list = list.filter((r) => r.status === "assigned" && r.reviewer_id === user?.id);
    } else if (filter !== "all") {
      list = list.filter((r) => r.status === filter);
    }
    if (levelFilter !== "all") {
      list = list.filter((r) => normalizeLevel(r.level) === levelFilter);
    }
    return list;
  }, [filter, levelFilter, reviews, user?.id]);

  const grouped = useMemo(() => {
    const map = new Map<string, ApiReview[]>();
    for (const r of filtered) {
      const domain = domainFrom(r.evidence_item_id);
      if (!map.has(domain)) map.set(domain, []);
      map.get(domain)!.push(r);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleAction = async (
    reviewId: string,
    decision: "approve" | "return",
    _comment?: string,
    checklistResults?: Record<string, { checked: boolean; note?: string | null }>,
  ) => {
    try {
      const res = await api.put<{ review: ApiReview; next_review_id: string | null }>(
        `/reviews/${reviewId}`,
        { decision, checklist_results: checklistResults ?? null }
      );
      if (res?.next_review_id) {
        setLevelFilter("all");
        setFilter("all");
      }
      await fetchReviews();
      if (res?.next_review_id) {
        setExpandedId(res.next_review_id);
      } else {
        setExpandedId(null);
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50/50">
      <div className="max-w-5xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900 mb-4">Review Queue</h1>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Total", value: metrics.total, color: "text-gray-700", bg: "bg-white border-gray-200" },
              { label: "In Queue", value: metrics.assigned, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
              { label: "Approved", value: metrics.approved, color: "text-green-700", bg: "bg-green-50 border-green-200" },
              { label: "Returned", value: metrics.returned, color: "text-red-700", bg: "bg-red-50 border-red-200" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border p-3 text-center ${m.bg}`}>
                <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                <div className={`text-[11px] font-medium ${m.color}`}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1">
              {STATUS_TABS.map((t) => (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === t.key ? "bg-blue-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex gap-1">
              {["all", "L1", "L2", "L3"].map((lv) => (
                <button key={lv} onClick={() => setLevelFilter(lv)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    levelFilter === lv
                      ? lv === "all" ? "bg-gray-700 text-white" : `${LEVEL_COLORS[lv]?.bg} ${LEVEL_COLORS[lv]?.text} ring-1 ${LEVEL_COLORS[lv]?.ring}`
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {lv === "all" ? "All levels" : `${lv} ${LEVEL_LABELS[lv]}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">Loading reviews…</div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">No reviews found.</p>
            <p className="text-xs text-gray-300 mt-1">Reviews appear once evidence is submitted for review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([domain, items]) => (
              <div key={domain}>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Domain {domain}</h2>
                <div className="space-y-3">
                  {items.map((r) => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      expanded={expandedId === r.id}
                      onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      userRole={userRole}
                      onAction={(decision, comment, checklistResults) => handleAction(r.id, decision, comment, checklistResults)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

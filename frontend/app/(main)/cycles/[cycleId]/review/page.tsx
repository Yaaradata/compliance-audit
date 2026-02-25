"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ReviewTable } from "@/components/review/review-table";
import { ReviewPreview } from "@/components/review/review-preview";
import { ProgressBar } from "@/components/ui/progress-bar";
import { scoreColor, statusLabelMap } from "@/lib/utils";
import type { ReviewItem, Control } from "@/lib/types";

interface ApiReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  level: string;
  status: string;
  decision: string | null;
  assigned_at: string;
}

interface ApiControl {
  id: string;
  name: string;
  control_type: string;
  objective: number;
  architecture_applicability: string[];
}

function toReviewItem(r: ApiReview, idx: number): ReviewItem {
  return {
    id: idx + 1,
    title: `Review ${r.level} — ${r.submission_id.slice(0, 8)}`,
    domain: "",
    controls: [],
    submitter: r.reviewer_id.slice(0, 8),
    date: new Date(r.assigned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    status: r.status as ReviewItem["status"],
    impact: r.level === "l1" ? "HIGH" : "CRITICAL",
  };
}

function toControl(c: ApiControl): Control {
  return {
    id: c.id,
    name: c.name,
    type: c.control_type as "M" | "A",
    objective: c.objective,
    score: 0,
    evidenceCount: 0,
    status: "partial",
  };
}

const OBJECTIVES = [
  { name: "Secure Your Environment", num: 1 },
  { name: "Know & Limit Access", num: 2 },
  { name: "Detect & Respond", num: 3 },
];

export default function CycleReviewPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiControl[]>("/ref/controls")
      .then((data) => setControls(data.map(toControl)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cycleId) { setReviews([]); setLoading(false); return; }
    setLoading(true);
    api.get<ApiReview[]>(`/assessments/${cycleId}/reviews`)
      .then((data) => setReviews(data.map(toReviewItem)))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [cycleId]);

  const metrics = useMemo(() => {
    const pending = reviews.filter((r) => r.status === "pending").length;
    const inReview = reviews.filter((r) => r.status === "in_review").length;
    const returned = reviews.filter((r) => r.status === "returned").length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    return [
      { label: "My Queue", count: pending, color: "#2563eb", bg: "#eff6ff" },
      { label: "In Review", count: inReview, color: "#d97706", bg: "#fffbeb" },
      { label: "Returned", count: returned, color: "#dc2626", bg: "#fef2f2" },
      { label: "Approved", count: approved, color: "#059669", bg: "#ecfdf5" },
    ];
  }, [reviews]);

  const objectiveGroups = useMemo(
    () => OBJECTIVES.map((o) => ({ ...o, controls: controls.filter((c) => c.objective === o.num) })),
    [controls]
  );

  const filtered = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((i) => i.status === filter)),
    [filter, reviews]
  );

  return (
    <div className="grid grid-cols-[1fr_260px] gap-5">
      <div>
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg p-3 text-center cursor-pointer border" style={{ background: m.bg, borderColor: `${m.color}20` }}>
              <div className="text-xl font-bold" style={{ color: m.color }}>{m.count}</div>
              <div className="text-[11px] font-medium" style={{ color: m.color }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mb-3">
          {["all", "pending", "in_review", "returned", "approved"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md border text-[11px] font-medium transition-colors ${filter === f ? "bg-blue-800 text-white border-blue-800" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
              {f === "all" ? "All" : statusLabelMap[f] || f}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading reviews…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No reviews yet. Reviews will appear once evidence is submitted and assigned for review.</div>
        ) : (
          <ReviewTable items={filtered} selected={selectedItem} onSelect={setSelectedItem} />
        )}
        {selectedItem && <ReviewPreview item={selectedItem} />}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2.5">Control Sufficiency</div>
        {objectiveGroups.map((g) => {
          const avg = g.controls.length > 0 ? Math.round(g.controls.reduce((a, c) => a + c.score, 0) / g.controls.length) : 0;
          return (
            <div key={g.num} className="bg-white rounded-lg border border-gray-200 p-2.5 mb-2">
              <div className="flex justify-between items-center mb-1.5">
                <div className="text-[11px] font-semibold text-gray-700">{g.name}</div>
                <span className="text-xs font-bold" style={{ color: scoreColor(avg) }}>{avg}%</span>
              </div>
              {g.controls.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 py-0.5 text-[10px]">
                  <span className="font-semibold text-gray-500 w-7">{c.id}</span>
                  <div className="flex-1"><ProgressBar pct={c.score} h={4} /></div>
                  <span className="font-bold w-7 text-right" style={{ color: scoreColor(c.score) }}>{c.score}%</span>
                  {c.score < 60 && <span className="text-red-500 text-xs">⚠</span>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { REVIEW_ITEMS } from "@/lib/data/review-items";
import { CONTROLS } from "@/lib/data/controls";
import { ReviewTable } from "@/components/review/review-table";
import { ReviewPreview } from "@/components/review/review-preview";
import { ProgressBar } from "@/components/ui/progress-bar";
import { scoreColor, statusLabelMap } from "@/lib/utils";
import type { ReviewItem } from "@/lib/types";

const METRICS = [
  { label: "My Queue", count: 3, color: "#2563eb", bg: "#eff6ff" },
  { label: "Unassigned", count: 2, color: "#d97706", bg: "#fffbeb" },
  { label: "Overdue", count: 1, color: "#dc2626", bg: "#fef2f2" },
  { label: "Completed Today", count: 4, color: "#059669", bg: "#ecfdf5" },
];

const OBJECTIVES = [
  { name: "Secure Your Environment", num: 1, controls: CONTROLS.filter((c) => c.objective === 1) },
  { name: "Know & Limit Access", num: 2, controls: CONTROLS.filter((c) => c.objective === 2) },
  { name: "Detect & Respond", num: 3, controls: CONTROLS.filter((c) => c.objective === 3) },
];

export default function ReviewPage() {
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? REVIEW_ITEMS : REVIEW_ITEMS.filter((i) => i.status === filter)),
    [filter]
  );

  return (
    <div className="grid grid-cols-[1fr_260px] gap-5">
      <div>
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {METRICS.map((m) => (
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
        <ReviewTable items={filtered} selected={selectedItem} onSelect={setSelectedItem} />
        {selectedItem && <ReviewPreview item={selectedItem} />}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2.5">Control Sufficiency</div>
        {OBJECTIVES.map((g) => {
          const avg = Math.round(g.controls.reduce((a, c) => a + c.score, 0) / g.controls.length);
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

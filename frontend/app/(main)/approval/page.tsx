"use client";

import { CONTROLS } from "@/lib/data/controls";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { scoreColor, statusColorMap, statusLabelMap } from "@/lib/utils";

const CHECKLIST = [
  { label: "All mandatory controls reviewed", done: true },
  { label: "All evidence approved", done: true },
  { label: "All gaps documented", done: true },
  { label: "IR plan is current", done: false },
  { label: "Assessment report complete", done: false },
];

const OBJ_METRICS = [
  { label: "Secure Environment", count: "14/17", score: 86 },
  { label: "Know & Limit Access", count: "5/6", score: 87 },
  { label: "Detect & Respond", count: "6/9", score: 75 },
];

export default function ApprovalPage() {
  const mandatoryControls = CONTROLS.filter((c) => c.type === "M");
  const mandatoryApproved = mandatoryControls.filter((c) => c.score >= 90).length;
  const overallScore = Math.round(mandatoryControls.reduce((a, c) => a + c.score, 0) / mandatoryControls.length);
  const gaps = CONTROLS.filter((c) => c.score < 60);
  const checksComplete = CHECKLIST.filter((c) => c.done).length;

  return (
    <div>
      <div className="rounded-xl p-5 mb-5 text-white"
        style={{ background: `linear-gradient(135deg, ${overallScore >= 80 ? "#059669" : "#d97706"} 0%, ${overallScore >= 80 ? "#047857" : "#b45309"} 100%)` }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm opacity-80">Overall Compliance Score</div>
            <div className="text-4xl font-bold">{overallScore}%</div>
            <div className="text-xs opacity-80">Mandatory: {mandatoryApproved}/{mandatoryControls.length} approved</div>
          </div>
          <div className="flex gap-4">
            {OBJ_METRICS.map((o) => (
              <div key={o.label} className="bg-white/15 rounded-lg p-3 text-center min-w-[110px]">
                <div className="text-lg font-bold">{o.count}</div>
                <div className="text-[10px] opacity-80 mb-1">{o.label}</div>
                <div className="bg-white/20 rounded h-1"><div className="bg-white h-full rounded" style={{ width: `${o.score}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_300px] gap-5">
        <div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="px-3.5 py-2.5 bg-gray-50 border-b border-gray-200 text-sm font-semibold">Control Compliance Matrix</div>
            <div className="max-h-[300px] overflow-y-auto">
              {CONTROLS.map((c) => (
                <div key={c.id} className="flex items-center px-3.5 py-1.5 border-b border-gray-100 gap-2 text-[11px]">
                  <span className="font-semibold text-gray-700 w-8">{c.id}</span>
                  <Badge text={c.type} color={c.type === "M" ? "#7c3aed" : "#6b7280"} bg={c.type === "M" ? "#ede9fe" : "#f3f4f6"} />
                  <span className="flex-1 text-gray-700">{c.name}</span>
                  <div className="w-14"><ProgressBar pct={c.score} h={5} /></div>
                  <span className="w-8 text-right font-bold" style={{ color: scoreColor(c.score) }}>{c.score}%</span>
                  <Badge text={statusLabelMap[c.status] || c.status} color={statusColorMap[c.status] || "#6b7280"} bg={`${statusColorMap[c.status] || "#6b7280"}18`} />
                </div>
              ))}
            </div>
          </div>
          {gaps.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-3.5">
              <div className="text-sm font-semibold text-red-800 mb-2.5">⚠ Open Gaps ({gaps.length})</div>
              {gaps.map((g) => (
                <div key={g.id} className="bg-white rounded-lg p-2.5 mb-2 border border-red-200">
                  <div className="flex justify-between items-center">
                    <div><Badge text={g.id} color="#dc2626" bg="#fee2e2" /> <span className="text-xs font-medium ml-1.5">{g.name}</span></div>
                    <span className="text-xs font-bold text-red-600">{g.score}%</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button className="px-2.5 py-1 rounded border border-red-500 text-red-600 text-[10px]">Add Remediation Plan</button>
                    <button className="px-2.5 py-1 rounded border border-amber-500 text-amber-600 text-[10px]">Accept Risk</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-3.5 mb-3">
            <div className="text-sm font-semibold text-gray-700 mb-2.5">Sign-Off Checklist</div>
            {CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-100 text-xs">
                <span className={`w-[18px] h-[18px] rounded flex items-center justify-center text-xs font-bold ${item.done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {item.done ? "✓" : "○"}
                </span>
                <span className={item.done ? "text-gray-700" : "text-gray-400"}>{item.label}</span>
              </div>
            ))}
            <div className="mt-3 p-2 bg-gray-100 rounded-md text-[11px] text-gray-500 text-center">
              {checksComplete}/{CHECKLIST.length} prerequisites met
            </div>
          </div>
          <button disabled className="w-full py-3.5 rounded-xl bg-gray-400 text-white font-bold text-sm cursor-not-allowed opacity-70">
            🔒 Sign & Attest (MFA Required)
          </button>
          <div className="text-[10px] text-gray-400 text-center mt-1.5">Complete all prerequisites to enable attestation</div>
        </div>
      </div>
    </div>
  );
}

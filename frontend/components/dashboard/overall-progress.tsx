"use client";

interface OverallProgressProps {
  overallPct?: number;
  mandatoryApproved?: number;
  mandatoryTotal?: number;
  completedItems?: number;
  totalItems?: number;
  gaps?: number;
}

export function OverallProgress({
  overallPct = 0,
  mandatoryApproved = 0,
  mandatoryTotal = 0,
  completedItems = 0,
  totalItems = 0,
  gaps = 0,
}: OverallProgressProps) {
  return (
    <div className="rounded-xl p-5 mb-5 text-white" style={{ background: "linear-gradient(135deg, #0c2340 0%, #1a5276 100%)" }}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="text-sm opacity-80">Overall Evidence Collection</div>
          <div className="text-3xl font-bold">{overallPct}%</div>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold">{mandatoryApproved}/{mandatoryTotal}</div>
            <div className="opacity-70 text-xs">Mandatory Controls</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{completedItems}/{totalItems}</div>
            <div className="opacity-70 text-xs">Evidence Items</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{gaps}</div>
            <div className="opacity-70 text-xs">Gaps Identified</div>
          </div>
        </div>
      </div>
      <div className="bg-white/20 rounded-md h-2.5 overflow-hidden">
        <div className="bg-emerald-400 h-full rounded-md transition-all" style={{ width: `${overallPct}%` }} />
      </div>
    </div>
  );
}

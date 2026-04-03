"use client";

const STAGES = [
  { num: 1, label: "Canonical Evidence Model", desc: "PDF to structured evidence catalog" },
  { num: 2, label: "Sufficiency Matrix", desc: "Evidence-control scoring criteria" },
  { num: 3, label: "Evaluation Questions", desc: "Form questions for evidence collection" },
  { num: 4, label: "Finalize", desc: "Create schema & seed data" },
];

type StepState = "locked" | "running" | "review" | "ready" | "completed";

interface Props {
  /** Backend pipeline.current_stage (optional; reserved for future emphasis). */
  currentStage?: number;
  /** Highest stage (1–4) user may open — from confirmed pipeline_stage_outputs. */
  maxNavStage: number;
  status: string;
  onStageClick?: (stage: number) => void;
}

/**
 * Navigation is driven by `maxNavStage` (DB truth), not only `status` strings,
 * so stages stay reachable after `failed` / `finalizing` when prior stages were confirmed.
 */
function stageState(stageNum: number, maxNavStage: number, status: string): StepState {
  if (status === "finalized") {
    return "completed";
  }

  if (stageNum > maxNavStage) {
    return "locked";
  }

  if (status.includes(`stage_${stageNum}_running`)) {
    return "running";
  }

  if (status.includes(`stage_${stageNum}_review`)) {
    return "review";
  }

  if (stageNum === 4) {
    return maxNavStage >= 4 ? "ready" : "locked";
  }

  if (stageNum < maxNavStage) {
    return "completed";
  }

  return "ready";
}

export function StageStepper({ maxNavStage, status, onStageClick }: Props) {
  const safeMax = Math.min(4, Math.max(1, maxNavStage || 1));

  return (
    <div className="flex items-center gap-1 w-full">
      {STAGES.map((s, i) => {
        const state = stageState(s.num, safeMax, status);
        const isActive = state === "review" || state === "running";
        const isDone = state === "completed";
        const isReady = state === "ready";

        return (
          <div key={s.num} className="flex items-center flex-1 min-w-0">
            <button
              type="button"
              onClick={() => onStageClick?.(s.num)}
              disabled={state === "locked"}
              className={`
                flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-left transition-all
                ${isActive ? "bg-blue-50 ring-1 ring-blue-300" : ""}
                ${isDone ? "bg-emerald-50" : ""}
                ${isReady ? "hover:bg-slate-50 cursor-pointer" : ""}
                ${state === "locked" ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${isDone ? "bg-emerald-500 text-white" : ""}
                  ${isActive ? "bg-blue-600 text-white" : ""}
                  ${isReady ? "bg-slate-200 text-slate-600" : ""}
                  ${state === "locked" ? "bg-slate-100 text-slate-400" : ""}
                  ${state === "running" ? "animate-pulse" : ""}
                `}
              >
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.num
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>
                  {s.label}
                </div>
                <div className="text-[10px] truncate" style={{ color: "var(--foreground-muted)" }}>
                  {state === "running" ? "Processing..." : state === "review" ? "In review" : s.desc}
                </div>
              </div>
            </button>
            {i < STAGES.length - 1 && (
              <div className={`w-6 h-px mx-0.5 shrink-0 ${isDone ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

/**
 * Approval Journey — static lifecycle (no backend).
 * Horizontal flow: Domain A → B → … → H → Final attestation.
 * PLC-style: large circles, thick connector line with arrows, labels below.
 */

import { DOMAINS } from "@/lib/data/approval-ideology";

export type TimelineStepState = "completed" | "in_progress" | "pending";

export interface ApprovalJourneyStep {
  id: string;
  label: string;
  shortLabel: string;
  state: TimelineStepState;
  domainId?: string;
}

/** Static journey steps: Domain A–H + Final attestation. Fully hardcoded states. */
function buildLifecycleSteps(): ApprovalJourneyStep[] {
  const domainSteps: ApprovalJourneyStep[] = DOMAINS.map((d, index) => {
    let state: TimelineStepState = "pending";
    if (index < 2) state = "completed";
    else if (index === 2) state = "in_progress";
    return {
      id: `domain-${d.id}`,
      domainId: d.id,
      label: `Domain ${d.id} — ${d.name}`,
      shortLabel: `Domain ${d.id}`,
      state,
    };
  });
  return [
    ...domainSteps,
    {
      id: "final-attestation",
      label: "Final attestation",
      shortLabel: "Final attestation",
      state: "pending",
    },
  ];
}

const LIFECYCLE_STEPS = buildLifecycleSteps();

function ConnectorSegment({ green }: { green: boolean }) {
  const bg = green ? "bg-emerald-600 dark:bg-emerald-500" : "bg-slate-200 dark:bg-slate-600";
  const arrowColor = green ? "#059669" : "rgb(203 213 225)";
  return (
    <div className="flex items-center flex-1 min-w-[16px] max-w-[40px] shrink-0" aria-hidden>
      <div className={`h-[3px] flex-1 rounded-full ${bg}`} />
      <span
        className="shrink-0 w-0 h-0 ml-px border-y-[5px] border-l-[8px] border-y-transparent"
        style={{ borderLeftColor: arrowColor }}
      />
    </div>
  );
}

function StageCircle({ step }: { step: ApprovalJourneyStep }) {
  const isCompleted = step.state === "completed";
  const isInProgress = step.state === "in_progress";

  const borderColor = isCompleted
    ? "border-emerald-600 dark:border-emerald-500"
    : isInProgress
      ? "border-blue-600 dark:border-blue-500"
      : "border-slate-300 dark:border-slate-600";

  const bgColor = isCompleted
    ? "bg-emerald-50 dark:bg-emerald-950/50"
    : isInProgress
      ? "bg-blue-50 dark:bg-blue-950/50"
      : "bg-white dark:bg-slate-800/80";

  const dotColor = isCompleted ? "bg-emerald-600" : isInProgress ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600";
  const lineColor = isCompleted ? "bg-emerald-600" : isInProgress ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600";
  const textColor = isCompleted
    ? "text-emerald-800 dark:text-emerald-300"
    : isInProgress
      ? "text-blue-800 dark:text-blue-300"
      : "text-slate-500 dark:text-slate-400";

  const content =
    step.domainId != null ? (
      <span className={`font-bold text-lg select-none ${textColor}`}>{step.domainId}</span>
    ) : (
      <svg
        className={`w-6 h-6 ${isCompleted ? "text-emerald-600" : isInProgress ? "text-blue-600" : "text-slate-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 0110.618 3.04A12.02 12.02 0 0123 12c0 2.37-.73 4.57-2.07 6.57A11.975 11.975 0 0112 22z" />
      </svg>
    );

  return (
    <div className="flex flex-col items-center shrink-0">
      <div
        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center border-[4px] shadow-md ${borderColor} ${bgColor}`}
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      >
        {content}
      </div>
      <div className={`w-0.5 h-4 mt-0.5 rounded-full ${lineColor}`} />
      <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${dotColor}`} />
      <p className={`mt-1.5 text-[10px] font-medium text-center leading-tight max-w-[80px] ${textColor}`}>
        {step.shortLabel}
      </p>
    </div>
  );
}

export function ApprovalJourneyTimeline() {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow)]">
      <header className="px-5 py-4 border-b border-[var(--border)] bg-[var(--background)]/50">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Approval Journey</h2>
        <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
          Lifecycle by domain (A–H) → Final attestation · Static view
        </p>
      </header>
      <div className="p-6 overflow-x-auto">
        <div className="flex items-center justify-center min-w-max gap-0">
          {LIFECYCLE_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center gap-0">
              {index > 0 && (
                <ConnectorSegment green={LIFECYCLE_STEPS[index - 1].state === "completed"} />
              )}
              <StageCircle step={step} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

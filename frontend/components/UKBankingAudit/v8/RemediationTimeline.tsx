"use client";

import type { RemediationPlan, RemediationStep } from "./types";

const STEP_STYLES: Record<
  RemediationStep["status"],
  { bg: string; border: string; text: string; icon: string; bar: string }
> = {
  Complete: { bg: "bg-emerald-100", border: "border-emerald-600", text: "text-emerald-700", icon: "✓", bar: "bg-emerald-600" },
  "In Progress": { bg: "bg-amber-100", border: "border-amber-600", text: "text-amber-700", icon: "◐", bar: "bg-amber-600" },
  Delayed: { bg: "bg-red-50", border: "border-red-600", text: "text-red-600", icon: "⏱", bar: "bg-red-600" },
  "Not Started": { bg: "bg-slate-100", border: "border-slate-400", text: "text-slate-500", icon: "○", bar: "bg-slate-400" },
};

function TimelineStep({ step, isLast }: { step: RemediationStep; isLast: boolean }) {
  const sc = STEP_STYLES[step.status];
  return (
    <div className="flex gap-4">
      <div className="flex min-w-8 flex-col items-center">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[13px] font-bold ${sc.bg} ${sc.border} ${sc.text}`}
        >
          {sc.icon}
        </div>
        {!isLast ? <div className="min-h-10 w-0.5 flex-1 bg-slate-200" /> : null}
      </div>
      <div className={`flex-1 ${isLast ? "" : "pb-5"}`}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13.5px] font-semibold text-slate-900">{step.title}</span>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded border px-2 py-0.5 text-[10.5px] font-semibold ${sc.bg} ${sc.border} ${sc.text}`}
            >
              {step.status}
            </span>
            <span className="text-[11px] text-slate-400">{step.target}</span>
          </div>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.desc}</p>
        {step.progress !== undefined ? (
          <div className="mt-2">
            <div className="mb-0.5 flex justify-between text-[11px] text-slate-500">
              <span>Progress</span>
              <span>{step.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-md bg-slate-100">
              <div
                className={`h-full rounded-md transition-all duration-700 ${sc.bar}`}
                style={{ width: `${step.progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type Props = {
  domainName: string;
  plan: RemediationPlan;
};

/** Remediation programme timeline (v4 mockup). */
export function RemediationTimeline({ domainName, plan }: Props) {
  return (
    <div className="uk-v4-slide-down-mid mb-4 rounded-[10px] border border-slate-200 bg-stone-50 p-4">
      <div className="text-[11.5px] text-slate-400">
        Enterprise Risk Profile › {domainName} ›{" "}
        <span className="font-semibold text-slate-600">Remediation</span>
      </div>
      <h4 className="mt-2 text-[15px] font-bold text-slate-900">{plan.title}</h4>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-500">Forecast: {plan.forecast}</span>
        <div className="max-w-[200px] flex-1">
          <div className="mb-0.5 flex justify-between text-[11px] text-slate-500">
            <span>Completion</span>
            <span className="font-bold text-slate-700">{plan.completion}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-md bg-slate-200">
            <div
              className="h-full rounded-md bg-violet-600 transition-all duration-1000"
              style={{ width: `${plan.completion}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        {plan.steps.map((step, i) => (
          <TimelineStep key={step.title} step={step} isLast={i === plan.steps.length - 1} />
        ))}
      </div>
    </div>
  );
}

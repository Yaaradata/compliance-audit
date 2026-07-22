"use client";

import { useId, useState } from "react";
import {
  getPathToGreen,
  type PathToGreen,
  type PathToGreenStep,
} from "@/lib/ukbankingaudit/v6/pathToGreen";

type Props = {
  entityRef: string;
  /** When true, start expanded. Default: collapsed until the user opens it. */
  defaultOpen?: boolean;
};

const ESCALATION_LABEL: Record<string, string> = {
  none: "No escalation",
  "raised-to-committee": "Raised to committee",
  "raised-to-board": "Raised to board",
};

const RAG_LABEL: Record<"red" | "amber", string> = {
  red: "RED",
  amber: "AMBER",
};

const RAG_TEXT: Record<"red" | "amber", string> = {
  red: "text-rose-700",
  amber: "text-amber-700",
};

const RAG_FILL: Record<"red" | "amber", string> = {
  red: "bg-rose-500",
  amber: "bg-amber-500",
};

/**
 * ProvenanceBadge sits on a SEPARATE visual axis from RAG severity — violet
 * family, never red/amber/green, and never folded into the severity dot.
 */
function ProvenanceBadge({ source }: { source: "system" | "email" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700">
      {source === "system" ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" aria-hidden />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-violet-500 bg-transparent" aria-hidden />
      )}
      {source}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M4.47 5.97a.75.75 0 0 1 1.06 0L8 8.44l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

/** Hand-rolled RAG→green progress track — no chart library. */
function ProgressTrack({
  progressPct,
  currentRag,
}: {
  progressPct: number;
  currentRag: "red" | "amber";
}) {
  const fill = Math.min(100, Math.max(0, progressPct));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
        <span className={RAG_TEXT[currentRag]}>{RAG_LABEL[currentRag]}</span>
        <span className="text-emerald-700">GREEN</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${RAG_FILL[currentRag]}`}
          style={{ width: `${fill}%` }}
          role="progressbar"
          aria-valuenow={fill}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${fill}% to green`}
        />
        <span
          className="absolute top-1/2 right-0 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
          title="Target · GREEN"
          aria-hidden
        />
      </div>
      <div className="mt-1 text-[10px] font-semibold tabular-nums text-slate-600">
        {fill}% to target
      </div>
    </div>
  );
}

function StepPip({ state }: { state: PathToGreenStep["state"] }) {
  switch (state) {
    case "done":
      return (
        <span
          className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500"
          aria-label="done"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
        </span>
      );
    case "in-progress":
      return (
        <span
          className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-400"
          aria-label="in progress"
        />
      );
    case "blocked":
      return (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-rose-600 bg-rose-50 text-[10px] font-black leading-none text-rose-700 shadow-sm ring-2 ring-rose-200"
          aria-label="blocked"
        >
          ✕
        </span>
      );
    case "not-started":
      return (
        <span
          className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-300 bg-white"
          aria-label="not started"
        />
      );
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

/** Horizontal milestone pips; labels wrap to two lines instead of mid-word truncate. */
function StepTracker({ steps }: { steps: PathToGreenStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="relative pt-1">
      <div
        className="absolute top-[0.7rem] right-[10%] left-[10%] h-px bg-slate-300"
        aria-hidden
      />
      <ol className="relative m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-2 p-0">
        {steps.map((step) => {
          const due = step.dueDate ? `Due ${step.dueDate}` : "No due date";
          const blocked = step.state === "blocked";
          return (
            <li
              key={step.label}
              className="flex min-w-0 flex-col items-center gap-1.5"
              title={`${step.label} · ${step.state} · ${due}`}
            >
              <StepPip state={step.state} />
              <span
                className={`w-full text-center text-[9px] leading-snug ${
                  blocked
                    ? "font-bold text-rose-700"
                    : "font-medium text-slate-500"
                }`}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {blocked ? `Blocked · ${step.label}` : step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Structured metadata grid — no one long wrapping line. */
function DetailGrid({ path }: { path: PathToGreen }) {
  const rows: { label: string; value: string }[] = [
    { label: "Owner", value: path.owner },
    { label: "Started", value: path.startDate },
    { label: "Target", value: path.targetDate ?? "—" },
    { label: "Escalation", value: ESCALATION_LABEL[path.escalation] ?? path.escalation },
  ];
  if (path.lastUpdate) {
    rows.push({ label: "Updated", value: path.lastUpdate.at });
  }

  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="min-w-0">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            {row.label}
          </dt>
          <dd className="truncate text-[10.5px] font-medium text-slate-600" title={row.value}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function CollapsedSummary({ path }: { path: PathToGreen }) {
  const blocked = path.steps.some((s) => s.state === "blocked");
  const inFlight = path.steps.filter((s) => s.state === "in-progress" || s.state === "done").length;

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
        Path to Green
      </span>
      <span className={`text-[10px] font-bold tabular-nums ${RAG_TEXT[path.currentRag]}`}>
        {path.progressPct}%
      </span>
      <span className="text-[10px] text-slate-400">·</span>
      <span className={`text-[9px] font-bold uppercase ${RAG_TEXT[path.currentRag]}`}>
        {RAG_LABEL[path.currentRag]}
      </span>
      <span className="text-[10px] text-slate-400">→</span>
      <span className="text-[9px] font-bold uppercase text-emerald-700">Green</span>
      <span className="text-[10px] text-slate-400">·</span>
      <span className="text-[10px] text-slate-500">
        {inFlight}/{path.steps.length} steps
      </span>
      {blocked ? (
        <span className="rounded border border-rose-300 bg-rose-50 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-rose-700">
          Blocked
        </span>
      ) : null}
    </div>
  );
}

function ExpandedBody({ path }: { path: PathToGreen }) {
  return (
    <div className="space-y-3 border-t border-slate-200 px-2.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Progress
        </span>
        {path.lastUpdate ? <ProvenanceBadge source={path.lastUpdate.source} /> : null}
      </div>

      <ProgressTrack progressPct={path.progressPct} currentRag={path.currentRag} />
      <StepTracker steps={path.steps} />
      <DetailGrid path={path} />

      {path.lastUpdate ? (
        <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2">
          <p className="text-[10.5px] italic leading-snug text-slate-700">
            &ldquo;{path.lastUpdate.text}&rdquo;
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Path-to-Green strip — collapsed by default; expands on click.
 * Answers: how far to green, is it moving, what's blocking it.
 */
export function PathToGreenStrip({ entityRef, defaultOpen = false }: Props) {
  const path = getPathToGreen(entityRef);
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  if (!path) {
    return (
      <div className="mt-1.5 rounded-md border border-dashed border-slate-200 bg-slate-50 px-2.5 py-1.5">
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Path to Green
        </div>
        <p className="mt-0.5 text-[10.5px] italic text-slate-400">
          No remediation plan yet — not owned.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-slate-100/80"
      >
        <CollapsedSummary path={path} />
        <Chevron open={open} />
      </button>

      {open ? (
        <div id={panelId}>
          <ExpandedBody path={path} />
        </div>
      ) : null}
    </div>
  );
}

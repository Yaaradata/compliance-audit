"use client";

import { useId, useState } from "react";
import {
  getPathToGreen,
  isRiskAcceptGap,
  type PathToGreen,
  type PathToGreenAction,
} from "@/lib/ukbankingaudit/v7/pathToGreen";

type Props = {
  entityRef: string;
  /** When true, start expanded. Default: collapsed until the user opens it. */
  defaultOpen?: boolean;
  /** When true, body stays expanded and the header is not a toggle. */
  alwaysOpen?: boolean;
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

const ACTION_STATUS_LABEL: Record<PathToGreenAction["status"], string> = {
  done: "Done",
  "in-progress": "In progress",
  blocked: "Blocked",
  "not-started": "Not started",
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

function CombinedEffect({ path }: { path: PathToGreen }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        Combined expected effect vs appetite
      </div>
      <p className="mt-1 text-[11px] font-medium leading-snug text-slate-800">
        {path.combinedExpectedEffect}
      </p>
      <p className="mt-1 text-[10.5px] leading-snug text-slate-500">
        Against: {path.appetiteLine}
      </p>
    </div>
  );
}

function ActionList({ actions }: { actions: PathToGreenAction[] }) {
  if (actions.length === 0) return null;
  return (
    <ol className="m-0 list-none space-y-2 p-0">
      {actions.map((action, idx) => {
        const blocked = action.status === "blocked";
        return (
          <li
            key={action.id}
            className={`rounded-md border px-2.5 py-2 ${
              blocked ? "border-rose-300 bg-rose-50/50" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
              <span className="text-[11px] font-semibold text-slate-900">
                {idx + 1}. {action.description}
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wide ${
                  blocked ? "text-rose-700" : "text-slate-500"
                }`}
              >
                {ACTION_STATUS_LABEL[action.status]}
              </span>
            </div>
            <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Owner
                </dt>
                <dd className="truncate text-[10.5px] font-medium text-slate-600" title={action.owner}>
                  {action.owner}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Target
                </dt>
                <dd className="text-[10.5px] font-medium text-slate-600">
                  {action.targetDate ?? "—"}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Expected effect
                </dt>
                <dd className="text-[10.5px] font-medium text-slate-600">{action.expectedEffect}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ol>
  );
}

function AcceptanceRecord({ path }: { path: PathToGreen }) {
  const ra = path.riskAccept;
  if (!ra) return null;

  if (isRiskAcceptGap(path)) {
    return (
      <div className="rounded-md border border-rose-300 bg-rose-50 px-2.5 py-2.5">
        <div className="text-[9px] font-bold uppercase tracking-wider text-rose-800">
          Unresolved gap · risk-accept without named accepter
        </div>
        <p className="mt-1 text-[11px] font-medium leading-snug text-rose-900">
          An unattributed acceptance is not an accepted risk. Name the individual and SMF before
          this can stand as a board decision — the Nationwide &ldquo;no clear owner&rdquo; shape a
          s.166 reviewer opens with.
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-rose-700/80">
              Accepted by
            </dt>
            <dd className="text-[10.5px] font-semibold text-rose-800">Missing</dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-rose-700/80">
              Dated
            </dt>
            <dd className="text-[10.5px] font-medium text-rose-800">{ra.acceptedDate ?? "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-rose-700/80">
              Stated rationale
            </dt>
            <dd className="text-[10.5px] font-medium text-rose-900">{ra.rationale ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-rose-700/80">
              Review date
            </dt>
            <dd className="text-[10.5px] font-medium text-rose-800">{ra.reviewDate ?? "—"}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-300 bg-white px-2.5 py-2.5">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
        Risk acceptance record
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div>
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Accepted by
          </dt>
          <dd className="text-[11px] font-semibold text-slate-900">{ra.acceptedBy}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Accepted date
          </dt>
          <dd className="text-[11px] font-medium text-slate-700">{ra.acceptedDate}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Rationale
          </dt>
          <dd className="text-[11px] leading-snug text-slate-700">{ra.rationale}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Review date
          </dt>
          <dd className="text-[11px] font-medium text-slate-700">{ra.reviewDate}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Escalation
          </dt>
          <dd className="text-[11px] font-medium text-slate-700">
            {ESCALATION_LABEL[path.escalation] ?? path.escalation}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function CollapsedSummary({ path }: { path: PathToGreen }) {
  if (path.disposition === "risk-accept") {
    const gap = isRiskAcceptGap(path);
    return (
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
          Path to Green
        </span>
        <span className="text-[10px] text-slate-400">·</span>
        <span
          className={`text-[9px] font-bold uppercase tracking-wide ${
            gap ? "text-rose-700" : "text-slate-700"
          }`}
        >
          {gap ? "Risk-accept gap" : "Risk accepted"}
        </span>
        {!gap && path.riskAccept?.acceptedBy ? (
          <>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="truncate text-[10px] text-slate-600">{path.riskAccept.acceptedBy}</span>
          </>
        ) : null}
      </div>
    );
  }

  const blocked = path.actions.some((s) => s.status === "blocked");
  const inFlight = path.actions.filter(
    (s) => s.status === "in-progress" || s.status === "done",
  ).length;

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
        {inFlight}/{path.actions.length} actions
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
  if (path.disposition === "risk-accept") {
    return (
      <div className="space-y-3 border-t border-slate-200 px-2.5 py-2.5">
        <CombinedEffect path={path} />
        <AcceptanceRecord path={path} />
        {path.lastUpdate ? (
          <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Last update
              </span>
              <ProvenanceBadge source={path.lastUpdate.source} />
            </div>
            <p className="text-[10.5px] italic leading-snug text-slate-700">
              &ldquo;{path.lastUpdate.text}&rdquo;
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-slate-200 px-2.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Progress
        </span>
        {path.lastUpdate ? <ProvenanceBadge source={path.lastUpdate.source} /> : null}
      </div>

      <ProgressTrack progressPct={path.progressPct} currentRag={path.currentRag} />
      <CombinedEffect path={path} />
      <div>
        <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Concurrent actions ({path.actions.length})
        </div>
        <ActionList actions={path.actions} />
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Owner</dt>
          <dd className="truncate text-[10.5px] font-medium text-slate-600" title={path.owner}>
            {path.owner}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Started
          </dt>
          <dd className="text-[10.5px] font-medium text-slate-600">{path.startDate}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Plan target
          </dt>
          <dd className="text-[10.5px] font-medium text-slate-600">{path.targetDate ?? "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Escalation
          </dt>
          <dd className="text-[10.5px] font-medium text-slate-600">
            {ESCALATION_LABEL[path.escalation] ?? path.escalation}
          </dd>
        </div>
      </dl>

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
 * Remediate: all concurrent actions + combined effect vs appetite.
 * Risk-accept: acceptance record, or unresolved gap if accepter missing.
 * Pass `alwaysOpen` to keep the plan visible with no close control.
 */
export function PathToGreenStrip({
  entityRef,
  defaultOpen = false,
  alwaysOpen = false,
}: Props) {
  const path = getPathToGreen(entityRef);
  const [open, setOpen] = useState(defaultOpen || alwaysOpen);
  const panelId = useId();
  const isOpen = alwaysOpen || open;

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
      {alwaysOpen ? (
        <div className="flex w-full items-center gap-2 px-2.5 py-2 text-left">
          <CollapsedSummary path={path} />
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-slate-100/80"
        >
          <CollapsedSummary path={path} />
          <Chevron open={isOpen} />
        </button>
      )}

      {isOpen ? (
        <div id={panelId}>
          <ExpandedBody path={path} />
        </div>
      ) : null}
    </div>
  );
}

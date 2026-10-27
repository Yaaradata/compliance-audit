"use client";

/**
 * UK Board v1 — primitives CMP-1 to CMP-9 (layout, card shell, status token, delta,
 * practice label, back, integrity badge). Status and pass/fail differ by glyph and word,
 * never by colour alone. Unverified has its own token: grey outline, word, broken-link glyph.
 */
import type { ReactNode } from "react";
import { AlertTriangle, ArrowLeft, Check, CircleDashed, CircleSlash, OctagonAlert, Star, Unlink, X } from "lucide-react";
import { getPrecedent } from "@/lib/ukboard/v1/precedents";
import { CHECK_ORDER, failedChecks, integrityPasses } from "@/lib/ukboard/v1/selectors";
import type { IntegritySnapshot, Status } from "@/lib/ukboard/v1/types";
import { useBoard } from "./state/boardStore";
import { ui } from "./theme";

/* CMP-1 */
export function BoardLayoutGrid({
  band,
  rows,
}: {
  band?: ReactNode;
  rows: { key: string; left?: ReactNode; rightStack?: ReactNode[]; full?: ReactNode }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {band}
      {rows.map((r) =>
        r.full ? (
          <div key={r.key}>{r.full}</div>
        ) : (
          <div key={r.key} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">{r.left}</div>
            <div className="flex flex-col gap-4">{r.rightStack}</div>
          </div>
        ),
      )}
    </div>
  );
}

/* CMP-5 */
const STATUS_META: Record<Status, { word: string; cls: string; Icon: typeof Check }> = {
  within_appetite: { word: "Within appetite", cls: "bg-[var(--ukb-green-bg)] text-[var(--ukb-green)]", Icon: Check },
  amber: { word: "Amber", cls: "bg-[var(--ukb-amber-bg)] text-[var(--ukb-amber)]", Icon: AlertTriangle },
  red: { word: "Red", cls: "bg-[var(--ukb-red-bg)] text-[var(--ukb-red)]", Icon: OctagonAlert },
  unverified: {
    word: "Unverified",
    cls: "border border-[var(--ukb-grey)] bg-transparent text-[var(--ukb-grey)]",
    Icon: Unlink,
  },
  not_assessed: { word: "Not assessed", cls: "border border-dashed border-[var(--ukb-grey)] text-[var(--ukb-grey)]", Icon: CircleDashed },
};

export function StatusToken({ status, label, reason }: { status: Status; label?: string; reason?: string }) {
  const m = STATUS_META[status];
  const word = status === "not_assessed" && reason ? `Not assessed: ${reason}` : (label ?? m.word);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      <m.Icon className="h-3 w-3" aria-hidden />
      {word}
    </span>
  );
}

/* CMP-6 */
export function DeltaValue({
  value,
  denominator,
  delta,
  size = "md",
}: {
  value: string;
  denominator: string;
  delta?: string;
  size?: "md" | "lg" | "xl";
}) {
  const vcls = size === "xl" ? "text-3xl sm:text-4xl" : size === "lg" ? "text-2xl" : "text-base";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`${vcls} font-bold tabular-nums text-[var(--ukb-text)]`}>{value}</span>
      <span className="text-sm text-[var(--ukb-muted)]">{denominator}</span>
      {delta ? <span className="text-xs font-medium tabular-nums text-[var(--ukb-subtle)]">{delta}</span> : null}
    </span>
  );
}

/* CMP-7 */
const PRACTICE_TEXT = {
  practice_not_rule: { short: "firm practice", full: "Firm practice, not a regulatory rule" },
  illustrative: { short: "illustrative", full: "Illustrative data for a fictional firm" },
  unverified_clock: { short: "clock unverified", full: "Clock value not yet checked against the rule text" },
  fictional: { short: "fictional", full: "Fictional person" },
} as const;

export function PracticeLabel({ kind }: { kind: keyof typeof PRACTICE_TEXT }) {
  const t = PRACTICE_TEXT[kind];
  return (
    <span
      title={t.full}
      className="ml-1 inline-block rounded border border-[var(--ukb-border)] px-1 align-middle text-[10px] font-medium uppercase tracking-wide text-[var(--ukb-subtle)]"
    >
      {t.short}
    </span>
  );
}

/* CMP-3 */
export function SectionHeader({ title, spineSegment, subtitle }: { title: string; spineSegment: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h3 className="text-sm font-bold text-[var(--ukb-text)]">{title}</h3>
      <p className="text-[11px] uppercase tracking-wide text-[var(--ukb-subtle)]">Spine: {spineSegment}</p>
      {subtitle ? <p className="mt-1 text-xs text-[var(--ukb-muted)]">{subtitle}</p> : null}
    </div>
  );
}

const SCREEN_NAMES = {
  board: "Board Risk View",
  restrictions: "Restrictions and reportability",
  escalation: "Escalation health",
} as const;

/* CMP-8 */
export function BackToOrigin() {
  const { state, dispatch } = useBoard();
  const name = SCREEN_NAMES[state.origin?.screen ?? "board"];
  return (
    <button type="button" onClick={() => dispatch({ type: "BACK" })} className={`${ui.link} ${ui.focus} inline-flex items-center gap-1 text-sm`}>
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to {name}
    </button>
  );
}

/* CMP-2 */
export function CardShell({
  id,
  title,
  status,
  statusLabel,
  notAssessedReason,
  isNew,
  integration,
  highlight,
  children,
  className = "",
}: {
  id: string;
  title: string;
  status?: Status;
  statusLabel?: string;
  notAssessedReason?: string;
  isNew?: boolean;
  integration?: { feed: string };
  highlight?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={`${ui.card} p-4 ${highlight ? "ring-2 ring-[var(--ukb-focus)]" : ""} ${className}`}
    >
      <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold leading-snug text-[var(--ukb-text)]">
          {title}
          {integration ? <IntegrationStar feed={integration.feed} /> : null}
        </h2>
        <div className="flex items-center gap-1.5">
          {isNew ? <span className="text-[10px] font-semibold uppercase text-[var(--ukb-subtle)]">New since last BRC</span> : null}
          {status ? <StatusToken status={status} label={statusLabel} reason={notAssessedReason} /> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function IntegrationStar({ feed }: { feed: string }) {
  const caveat = `Needs the society's ${feed} access`;
  return (
    <span tabIndex={0} title={caveat} aria-label={caveat} className={`inline-flex text-[var(--ukb-subtle)] ${ui.focus} rounded`}>
      <Star className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

/* CMP-9: four dots in fixed order owner · feed · attestation · mapping. */
export function IntegrityBadge({
  badgeRef,
  snapshot,
  onOpenEvidence,
  extraLine,
}: {
  badgeRef: string;
  snapshot: IntegritySnapshot;
  onOpenEvidence?: () => void;
  extraLine?: string;
}) {
  const { state, dispatch } = useBoard();
  const expanded = state.expandedBadges.includes(badgeRef);
  const allPass = integrityPasses(snapshot);
  const failed = failedChecks(snapshot);
  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => dispatch({ type: "TOGGLE_BADGE", ref: badgeRef })}
        aria-expanded={expanded}
        className={`inline-flex items-center gap-1 rounded px-1 py-0.5 ${ui.focus}`}
        aria-label={`Chain integrity: ${allPass ? "all 4 checks pass" : `${failed.length} of 4 checks fail`}. Data as at ${snapshot.asOf}`}
      >
        {CHECK_ORDER.map((k) => {
          const c = snapshot[k];
          return (
            <span
              key={k}
              title={`${c.label}: ${c.pass ? "pass" : "fail"}`}
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                c.pass ? "bg-[var(--ukb-surface-2)] text-[var(--ukb-muted)]" : "border border-[var(--ukb-grey)] text-[var(--ukb-grey)]"
              }`}
            >
              {c.pass ? <Check className="h-2.5 w-2.5" aria-hidden /> : <X className="h-2.5 w-2.5" aria-hidden />}
            </span>
          );
        })}
        <span className="ml-1 text-[var(--ukb-subtle)]">
          {allPass ? "owner · feed · attestation · mapping" : failed.map((f) => f.label).join(" · ")} · as at {snapshot.asOf}
        </span>
      </button>
      {expanded ? (
        <div className="mt-1 space-y-1 rounded-md bg-[var(--ukb-surface-2)] p-2 text-[var(--ukb-muted)]">
          {CHECK_ORDER.map((k) => (
            <p key={k} className="flex gap-1">
              {snapshot[k].pass ? <Check className="mt-0.5 h-3 w-3 shrink-0" aria-hidden /> : <CircleSlash className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />}
              <span>
                <span className="font-semibold">{snapshot[k].label}:</span> {snapshot[k].evidence}
              </span>
            </p>
          ))}
          {extraLine ? <p className="font-medium">{extraLine}</p> : null}
          {onOpenEvidence ? (
            <button type="button" onClick={onOpenEvidence} className={`${ui.link} ${ui.focus}`}>
              Open evidence
            </button>
          ) : null}
        </div>
      ) : !allPass ? (
        <p className="mt-0.5 text-[var(--ukb-muted)]">{failed[0].evidence}</p>
      ) : null}
    </div>
  );
}

/** Precedent line (real, posture-tagged). Metro shows mechanism only. */
export function PrecedentLine({ id, onOpen }: { id: string; onOpen?: () => void }) {
  const p = getPrecedent(id);
  if (!p) return null;
  const text = `${p.respondent} (${p.regulator}${p.noticeDate ? `, ${p.noticeDate}` : ""}): ${p.hook}`;
  return (
    <p className="text-xs text-[var(--ukb-muted)]">
      <span className="font-semibold">Precedent · </span>
      {onOpen ? (
        <button type="button" onClick={onOpen} className={`${ui.link} ${ui.focus} text-left`}>
          {text}
        </button>
      ) : (
        text
      )}{" "}
      <span className="text-[var(--ukb-subtle)]">[{p.posture}]</span>
    </p>
  );
}

export function RuleLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-[var(--ukb-muted)]">
      <span className="font-semibold">Rule · </span>
      {children}
    </p>
  );
}

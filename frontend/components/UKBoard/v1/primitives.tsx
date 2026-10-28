"use client";

/**
 * UK Board v1 — primitives CMP-1 to CMP-9 (layout, card shell, status token, delta,
 * practice label, back, integrity badge). Status and pass/fail differ by glyph and word,
 * never by colour alone. Unverified has its own token: grey outline, word, broken-link glyph.
 * Card faces stay minimal: title, status, one number, one line. Explanations sit in Details.
 */
import { createContext, useContext, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, Check, ChevronDown, ChevronRight, CircleDashed, OctagonAlert, Star, Unlink, X } from "lucide-react";
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
    <div className="flex flex-col gap-5">
      {band}
      {rows.map((r) =>
        r.full ? (
          <div key={r.key}>{r.full}</div>
        ) : (
          <div key={r.key} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="flex flex-col lg:col-span-2 [&>section]:flex-1">{r.left}</div>
            <div className="flex flex-col gap-5 [&>section]:flex-1">{r.rightStack}</div>
          </div>
        ),
      )}
    </div>
  );
}

/** Page title + one-line subtitle, as on the other UK dashboards. */
export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-1">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--ukb-text)]">{title}</h1>
      <p className="mt-1 text-sm text-[var(--ukb-muted)]">{subtitle}</p>
    </div>
  );
}

/* CMP-5 */
/** Colour per status. Unverified and not assessed use neutral greys only (never RAG). */
export const TONE: Record<Status, { edge: string; tint: string; line: string; pill: string; number: string }> = {
  within_appetite: {
    edge: "border-l-[var(--ukb-green-solid)]",
    tint: "bg-[var(--ukb-green-tint)]",
    line: "border-[var(--ukb-green-line)]",
    pill: "bg-[var(--ukb-green-solid)] text-white",
    number: "text-[var(--ukb-text)]",
  },
  amber: {
    edge: "border-l-[var(--ukb-amber-solid)]",
    tint: "bg-[var(--ukb-amber-tint)]",
    line: "border-[var(--ukb-amber-line)]",
    pill: "bg-[var(--ukb-amber-solid)] text-white",
    number: "text-[var(--ukb-amber)]",
  },
  red: {
    edge: "border-l-[var(--ukb-red-solid)]",
    tint: "bg-[var(--ukb-red-tint)]",
    line: "border-[var(--ukb-red-line)]",
    pill: "bg-[var(--ukb-red-solid)] text-white",
    number: "text-[var(--ukb-red)]",
  },
  unverified: {
    edge: "border-l-[var(--ukb-grey-line)]",
    tint: "bg-[var(--ukb-grey-tint)]",
    line: "border-dashed border-[var(--ukb-grey-line)]",
    pill: "border border-[var(--ukb-grey)] bg-[var(--ukb-surface)] text-[var(--ukb-grey)]",
    number: "text-[var(--ukb-grey)]",
  },
  not_assessed: {
    edge: "border-l-[var(--ukb-track)]",
    tint: "bg-[var(--ukb-surface)]",
    line: "border-dashed border-[var(--ukb-track)]",
    pill: "border border-dashed border-[var(--ukb-grey)] bg-[var(--ukb-surface)] text-[var(--ukb-grey)]",
    number: "text-[var(--ukb-text)]",
  },
};

const STATUS_META: Record<Status, { word: string; Icon: typeof Check }> = {
  within_appetite: { word: "Within appetite", Icon: Check },
  amber: { word: "Amber", Icon: AlertTriangle },
  red: { word: "Red", Icon: OctagonAlert },
  unverified: { word: "Unverified", Icon: Unlink },
  not_assessed: { word: "Not assessed", Icon: CircleDashed },
};

export function StatusToken({ status, label, reason }: { status: Status; label?: string; reason?: string }) {
  const m = STATUS_META[status];
  const word = status === "not_assessed" && reason ? `Not assessed: ${reason}` : (label ?? m.word);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONE[status].pill}`}>
      <m.Icon className="h-3 w-3" aria-hidden />
      {word}
    </span>
  );
}

/** Tile tint and border by status. Unverified stays neutral grey with a dashed edge. */
export const TILE_TINT: Record<Status, string> = {
  within_appetite: `${TONE.within_appetite.tint} ${TONE.within_appetite.line}`,
  amber: `${TONE.amber.tint} ${TONE.amber.line}`,
  red: `${TONE.red.tint} ${TONE.red.line}`,
  unverified: `${TONE.unverified.tint} ${TONE.unverified.line}`,
  not_assessed: `${TONE.not_assessed.tint} ${TONE.not_assessed.line}`,
};

/** Card status, so large numbers inside take the status colour. */
const ToneContext = createContext<Status | undefined>(undefined);

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
  const tone = useContext(ToneContext);
  const vcls = size === "xl" ? "text-4xl" : size === "lg" ? "text-2xl" : "text-sm";
  const colour = size !== "md" && tone ? TONE[tone].number : "text-[var(--ukb-text)]";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`${vcls} font-bold tabular-nums tracking-tight ${colour}`}>{value}</span>
      <span className={`${size === "md" ? "text-xs" : "text-sm"} text-[var(--ukb-muted)]`}>{denominator}</span>
      {delta ? <span className="text-xs font-semibold tabular-nums text-[var(--ukb-subtle)]">{delta}</span> : null}
    </span>
  );
}

/* CMP-7 */
const PRACTICE_TEXT = {
  practice_not_rule: { short: "practice", full: "Firm practice, not a regulatory rule" },
  illustrative: { short: "illustrative", full: "Illustrative data for a fictional firm" },
  unverified_clock: { short: "clock unverified", full: "Clock value not yet checked against the rule text" },
  fictional: { short: "fictional", full: "Fictional person" },
} as const;

export function PracticeLabel({ kind }: { kind: keyof typeof PRACTICE_TEXT }) {
  const t = PRACTICE_TEXT[kind];
  return (
    <span
      title={t.full}
      className="ml-1 inline-block rounded border border-[var(--ukb-border)] px-1 align-middle text-[9px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]"
    >
      {t.short}
    </span>
  );
}

/* CMP-3 */
export function SectionHeader({ title, spineSegment, subtitle }: { title: string; spineSegment: string; subtitle?: string }) {
  return (
    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-sm font-bold text-[var(--ukb-text)]">{title}</h3>
      <p className="text-[10px] uppercase tracking-wide text-[var(--ukb-subtle)]">{spineSegment}</p>
      {subtitle ? <p className="w-full text-xs text-[var(--ukb-muted)]">{subtitle}</p> : null}
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

/** Disclosure for everything that is not the face: rule line, owner, precedent, caveats. */
export function Details({ children, label = "Details" }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded text-xs font-semibold text-[var(--ukb-subtle)] hover:text-[var(--ukb-text)] ${ui.focus}`}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
        {label}
      </button>
      {open ? <div className="mt-2 space-y-1.5 border-l-2 border-[var(--ukb-border)] pl-3">{children}</div> : null}
    </div>
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
  footer,
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
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={`${ui.card} flex flex-col p-5 shadow-sm ${status ? `border-l-4 ${TONE[status].edge}` : ""} ${
        highlight ? "ring-2 ring-[var(--ukb-focus)]" : ""
      } ${className}`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-[15px] font-bold leading-snug text-[var(--ukb-text)]">
          {title}
          {integration ? <IntegrationStar feed={integration.feed} /> : null}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">
          {isNew ? <span className="text-[10px] font-semibold uppercase text-[var(--ukb-subtle)]">New</span> : null}
          {status ? <StatusToken status={status} label={statusLabel} reason={notAssessedReason} /> : null}
        </div>
      </header>
      <ToneContext.Provider value={status}>
        <div className="flex-1">{children}</div>
      </ToneContext.Provider>
      {footer ? <div className="mt-4 border-t border-[var(--ukb-border)] pt-3">{footer}</div> : null}
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
  owner,
  compact,
}: {
  badgeRef: string;
  snapshot: IntegritySnapshot;
  onOpenEvidence?: () => void;
  /** Owner role shown beside the badge (trust threshold: role on the face). */
  owner?: string;
  /** Dots only (rows); the summary stays in the accessible name and tooltip. */
  compact?: boolean;
}) {
  const { state, dispatch } = useBoard();
  const expanded = state.expandedBadges.includes(badgeRef);
  const allPass = integrityPasses(snapshot);
  const failed = failedChecks(snapshot);
  const summary = allPass ? "Verified" : failed.map((f) => f.label).join(" · ");
  return (
    <div className="text-[11px]">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <button
          type="button"
          onClick={() => dispatch({ type: "TOGGLE_BADGE", ref: badgeRef })}
          aria-expanded={expanded}
          className={`inline-flex items-center gap-1.5 rounded px-0.5 ${ui.focus}`}
          aria-label={`Chain integrity, owner, feed, attestation, mapping: ${allPass ? "all 4 checks pass" : `${failed.length} of 4 checks fail`}. As at ${snapshot.asOf}`}
        >
          <span className="inline-flex gap-0.5">
            {CHECK_ORDER.map((k) => {
              const c = snapshot[k];
              return (
                <span
                  key={k}
                  title={`${c.label}: ${c.pass ? "pass" : "fail"}`}
                  className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                    c.pass ? "bg-[var(--ukb-surface-2)] text-[var(--ukb-muted)]" : "border border-[var(--ukb-grey)] text-[var(--ukb-grey)]"
                  }`}
                >
                  {c.pass ? <Check className="h-2 w-2" aria-hidden /> : <X className="h-2 w-2" aria-hidden />}
                </span>
              );
            })}
          </span>
          {compact ? null : <span className={allPass ? "text-[var(--ukb-subtle)]" : "font-semibold text-[var(--ukb-grey)]"}>{summary}</span>}
        </button>
        {compact ? null : <span className="text-[var(--ukb-subtle)]">· as at {snapshot.asOf}</span>}
        {owner ? <span className="text-[var(--ukb-subtle)]">· {owner}</span> : null}
      </div>
      {expanded ? (
        <div className="mt-2 space-y-1 rounded-md bg-[var(--ukb-surface-2)] p-2 text-[var(--ukb-muted)]">
          {CHECK_ORDER.map((k) => (
            <p key={k} className="flex gap-1">
              {snapshot[k].pass ? <Check className="mt-0.5 h-3 w-3 shrink-0" aria-hidden /> : <X className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />}
              <span>
                <span className="font-semibold">{snapshot[k].label}:</span> {snapshot[k].evidence}
              </span>
            </p>
          ))}
          {onOpenEvidence ? (
            <button type="button" onClick={onOpenEvidence} className={`${ui.link} ${ui.focus}`}>
              Open evidence
            </button>
          ) : null}
        </div>
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
      <span className="font-semibold text-[var(--ukb-text)]">Precedent · </span>
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

/** Compact precedent chip for faces: name, date and posture only. */
export function PrecedentChip({ id }: { id: string }) {
  const p = getPrecedent(id);
  if (!p) return null;
  return (
    <span title={`${p.hook}. ${p.posture}`} className="inline-flex items-center gap-1 rounded-md border border-[var(--ukb-border)] px-1.5 py-0.5 text-[10px] text-[var(--ukb-muted)]">
      <span className="font-semibold text-[var(--ukb-text)]">{p.respondent}</span>
      {p.noticeDate ? <span>{p.noticeDate}</span> : null}
      <span className="uppercase tracking-wide text-[var(--ukb-subtle)]">{p.posture}</span>
    </span>
  );
}

export function RuleLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-[var(--ukb-muted)]">
      <span className="font-semibold text-[var(--ukb-text)]">Rule · </span>
      {children}
    </p>
  );
}

/** "So what" as a labelled callout, so the decision reads apart from the figures. */
export function SoWhat({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-[var(--ukb-brand)]/25 bg-[var(--ukb-brand-soft)] px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ukb-accent)]">So what</p>
      <p className="mt-0.5 text-sm leading-snug text-[var(--ukb-text)]">{children}</p>
    </div>
  );
}

/* Stat boxes: every figure sits in a labelled cell (label · value · sub-line). */
export interface StatItem {
  label: string;
  value: string;
  sub?: string;
  /** Colours the value and the cell edge. Omit for neutral. */
  status?: Status;
  onClick?: () => void;
}

export function StatGrid({ items, cols = 4 }: { items: StatItem[]; cols?: 2 | 3 | 4 }) {
  const grid = cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4";
  return (
    <div className={`grid grid-cols-1 gap-2.5 ${grid}`}>
      {items.map((it) => {
        const tone = it.status ? TONE[it.status] : undefined;
        const body = (
          <>
            <span className="block text-[10px] font-bold uppercase tracking-wide text-[var(--ukb-subtle)]">{it.label}</span>
            <span className={`mt-1 block text-xl font-bold leading-tight tabular-nums ${tone ? tone.number : "text-[var(--ukb-text)]"}`}>{it.value}</span>
            {it.sub ? <span className="mt-0.5 block text-[11px] leading-snug text-[var(--ukb-muted)]">{it.sub}</span> : null}
          </>
        );
        const cls = `block h-full w-full rounded-lg border border-[var(--ukb-border)] bg-[var(--ukb-surface)] px-3 py-2.5 text-left ${
          tone ? `border-l-4 ${tone.edge}` : ""
        }`;
        return it.onClick ? (
          <button key={it.label} type="button" onClick={it.onClick} className={`${cls} hover:bg-[var(--ukb-surface-2)] ${ui.focus}`}>
            {body}
          </button>
        ) : (
          <div key={it.label} className={cls}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

/** Footer: checks and owner on one line, then the actions (a draft opens full width below). */
export function CardFooter({ meta, actions }: { meta: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="min-w-0">{meta}</div>
      {actions}
    </div>
  );
}

export function MutedLine({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs leading-snug text-[var(--ukb-muted)]">{children}</p>;
}

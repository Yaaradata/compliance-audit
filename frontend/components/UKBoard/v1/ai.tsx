"use client";

/**
 * UK Board v1 — AI and gate components (CMP-28 to CMP-34).
 * AI drafts and challenges; a named human gates every draft (Accept · Edit and accept · Reject);
 * every gate writes an audit entry. There is no file, notify or submit control anywhere.
 */
import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { DRAFTS, PEOPLE } from "@/lib/ukboard/v1/data";
import type { ActionVerb } from "@/lib/ukboard/v1/types";
import { useBoard } from "./state/boardStore";
import { ui } from "./theme";

const VERB_LABEL: Record<ActionVerb, string> = {
  prepare: "Prepare",
  propose: "Propose",
  draft: "Draft",
  send_to_owner: "Send to owner",
};

const REJECT_REASONS = ["Not supported by the evidence", "Wrong owner", "Superseded by another draft"];

/* CMP-29 */
export function AiMarker({ reason, label = "AI draft" }: { reason: string; label?: string }) {
  return (
    <p className="flex items-start gap-1.5 text-xs">
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--ukb-ai)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--ukb-ai-text)]">
        <Sparkles className="h-3 w-3 text-[var(--ukb-ai)]" aria-hidden />
        {label}
      </span>
      <span className="text-[var(--ukb-muted)]">{reason}</span>
    </p>
  );
}

/* CMP-30 */
export function DraftActionCard({
  draftId,
  canGate = true,
  lockedLabel = "Preview only: the CRO operates this gate",
}: {
  draftId: string;
  canGate?: boolean;
  lockedLabel?: string;
}) {
  const { state, dispatch } = useBoard();
  const draft = DRAFTS[draftId];
  const ds = state.session.drafts[draftId];
  const [optionId, setOptionId] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(ds?.text ?? "");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const groupId = useId();
  if (!draft || !ds) return null;

  const chairHeld = draft.gateHolder === "brc_chair";
  const operable = canGate && !chairHeld;
  const needsOption = !!draft.options && !optionId;
  const by = ds.byPersonId ? PEOPLE[ds.byPersonId] : undefined;
  const sendable = draft.effect === "send" || draft.effect === "case_prepared";
  const lastAudit = [...state.session.audit].reverse().find((a) => a.objectRef === draft.unitId && a.action === "send_to_owner");

  return (
    <div className="rounded-lg border border-[var(--ukb-border)] bg-[var(--ukb-surface-2)] p-3 text-left">
      <p className="text-xs font-bold text-[var(--ukb-text)]">
        {VERB_LABEL[draft.verb]} · {draft.title.replace(/^(Propose|Prepare|Draft|Send to owner):?\s*/i, "")}
      </p>
      <div className="mt-1">
        <AiMarker reason={draft.reason} label={ds.status === "ai_draft" ? "AI draft" : "AI draft · gated"} />
      </div>

      {ds.status === "ai_draft" ? (
        <>
          {editing ? (
            <textarea
              aria-label="Edit draft text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className={`mt-2 w-full rounded-md border border-[var(--ukb-track)] bg-[var(--ukb-surface)] p-2 text-xs text-[var(--ukb-text)] ${ui.focus}`}
            />
          ) : (
            <p className="mt-2 line-clamp-3 text-xs text-[var(--ukb-muted)]" title={ds.text}>
              {ds.text}
            </p>
          )}
          {draft.options ? (
            <fieldset className="mt-2">
              <legend className="text-[11px] font-semibold text-[var(--ukb-muted)]">Options (no default; {draft.options.length} only)</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {draft.options.map((o) => (
                  <label key={o.id} className="inline-flex items-center gap-1 text-xs text-[var(--ukb-text)]">
                    <input
                      type="radio"
                      name={groupId}
                      value={o.id}
                      checked={optionId === o.id}
                      disabled={!operable}
                      onChange={() => setOptionId(o.id)}
                      className={ui.focus}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          {operable ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {editing ? (
                <button
                  type="button"
                  className={`${ui.primaryButton} ${ui.focus}`}
                  disabled={needsOption}
                  onClick={() => dispatch({ type: "GATE_EDIT_ACCEPT", draftId, text, optionId })}
                >
                  Accept edited text
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`${ui.primaryButton} ${ui.focus}`}
                    disabled={needsOption}
                    onClick={() => dispatch({ type: "GATE_ACCEPT", draftId, optionId })}
                  >
                    Accept
                  </button>
                  <button type="button" className={`${ui.button} ${ui.focus}`} onClick={() => setEditing(true)}>
                    Edit and accept
                  </button>
                </>
              )}
              {rejecting ? (
                <span className="inline-flex flex-wrap items-center gap-1">
                  <select
                    aria-label="Reason code"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={`rounded-md border border-[var(--ukb-track)] bg-[var(--ukb-surface)] px-1 py-1 text-xs text-[var(--ukb-text)] ${ui.focus}`}
                  >
                    <option value="">Reason code…</option>
                    {REJECT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={`${ui.button} ${ui.focus}`}
                    disabled={!reason}
                    onClick={() => dispatch({ type: "GATE_REJECT", draftId, reasonCode: reason })}
                  >
                    Reject with reason
                  </button>
                </span>
              ) : (
                <button type="button" className={`${ui.button} ${ui.focus}`} onClick={() => setRejecting(true)}>
                  Reject
                </button>
              )}
              {needsOption ? <span className="text-[11px] text-[var(--ukb-subtle)]">Choose an option first</span> : null}
            </div>
          ) : (
            <p className="mt-2 text-[11px] font-semibold text-[var(--ukb-subtle)]">
              {chairHeld ? "For the BRC chair to decide" : lockedLabel}
            </p>
          )}
        </>
      ) : null}

      {ds.status === "accepted" || ds.status === "sent_to_owner" ? (
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-[var(--ukb-muted)]">
            Accepted by {by?.name} on {ds.on} · v{ds.version}
            {ds.chosenOptionId ? ` · option: ${draft.options?.find((o) => o.id === ds.chosenOptionId)?.label}` : ""}
          </p>
          {!sendable || ds.status === "sent_to_owner" ? (
            <p className="font-semibold text-[var(--ukb-text)]">{draft.faceAfter}</p>
          ) : null}
          {sendable && ds.status === "accepted" ? (
            <button type="button" className={`${ui.button} ${ui.focus}`} onClick={() => dispatch({ type: "SEND_TO_OWNER", draftId })}>
              Send to owner: {draft.targetRole}
            </button>
          ) : null}
          {ds.status === "sent_to_owner" ? (
            <p className="text-[var(--ukb-subtle)]" title={lastAudit ? `Audit entry ${lastAudit.entryId}` : undefined}>
              Sent to {draft.targetRole} · audit entry recorded
            </p>
          ) : null}
        </div>
      ) : null}

      {ds.status === "rejected" ? (
        <p className="mt-2 text-xs text-[var(--ukb-muted)]">
          Rejected by {by?.name} on {ds.on} · reason: {ds.rejectReason}
        </p>
      ) : null}
    </div>
  );
}

/** Face line for a gated draft ("accepted by…" only on faces, DS7-2). */
export function GatedFaceLine({ draftIds }: { draftIds: string[] }) {
  const { state } = useBoard();
  const lines = draftIds
    .map((id) => ({ d: DRAFTS[id], s: state.session.drafts[id] }))
    .filter(({ d, s }) => d && s && (s.status === "sent_to_owner" || (s.status === "accepted" && d.effect !== "send" && d.effect !== "case_prepared")));
  if (!lines.length) return null;
  return (
    <div className="space-y-0.5">
      {lines.map(({ d, s }) => (
        <p key={d.draftId} className="text-xs font-semibold text-[var(--ukb-text)]">
          {d.faceAfter} <span className="font-normal text-[var(--ukb-subtle)]">· accepted by {PEOPLE[s.byPersonId ?? "cro"].name} on {s.on}</span>
        </p>
      ))}
    </div>
  );
}

/* CMP-31 */
export function AuditTrailInline({ objectRefs }: { objectRefs: string[] }) {
  const { state } = useBoard();
  const [open, setOpen] = useState(false);
  const entries = state.session.audit.filter((a) => objectRefs.includes(a.objectRef));
  return (
    <div className="text-xs">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={`inline-flex items-center gap-1 font-semibold text-[var(--ukb-text)] ${ui.focus} rounded`}>
        {open ? <ChevronDown className="h-3.5 w-3.5" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
        Audit trail ({entries.length} {entries.length === 1 ? "entry" : "entries"})
      </button>
      {open ? (
        entries.length ? (
          <ul className="mt-1 space-y-0.5 text-[var(--ukb-muted)]">
            {entries.map((a) => (
              <li key={a.entryId} title={`Entry ${a.entryId} · object ${a.objectRef}`}>
                {a.ts} · {a.actorName} ({a.actorRole}) · {a.action} · {a.objectLabel}
                {a.version ? ` · v${a.version}` : ""}
                {a.reasonCode ? ` · ${a.reasonCode}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[var(--ukb-subtle)]">No entries yet</p>
        )
      ) : null}
    </div>
  );
}

/* CMP-33 */
export function CanTellCannotTell({ canTell, cannotTell }: { canTell?: string; cannotTell?: string }) {
  return (
    <div className="space-y-1 text-xs text-[var(--ukb-muted)]">
      {canTell ? (
        <p>
          <span className="font-semibold">Can tell:</span> {canTell}
        </p>
      ) : null}
      <p>
        <span className="font-semibold">Cannot tell:</span> {cannotTell ?? "Anything recorded only outside the structured registers."}
      </p>
      <p className="rounded border border-dashed border-[var(--ukb-track)] px-2 py-1 text-[var(--ukb-subtle)]">
        Extension: committee minutes (next module). Not part of this view.
      </p>
    </div>
  );
}

/* CMP-34 */
export function ProcessGapBlock({ gapType, text, owner, draftId, canGate = true }: { gapType: string; text: string; owner: string; draftId: string; canGate?: boolean }) {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--ukb-border)] p-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">Process gap · {gapType}</p>
        <p className="mt-1 text-xs text-[var(--ukb-text)]">{text}</p>
        <p className="mt-1 text-xs text-[var(--ukb-muted)]">Receiving owner: {owner}</p>
      </div>
      <DraftActionCard draftId={draftId} canGate={canGate} />
    </div>
  );
}

/* CMP-28 */
export interface BandSection {
  text: string;
  onClick?: () => void;
}

export function AiExecutiveBand({
  critical,
  due,
  steady,
  aiLine,
}: {
  critical: BandSection;
  due: BandSection;
  steady: BandSection;
  aiLine: string;
}) {
  const cell = (label: string, s: BandSection, tone: string): ReactNode => (
    <div className={`h-full min-w-0 rounded-lg border-l-4 bg-[var(--ukb-surface)] px-3 py-1.5 ${tone}`} title={s.text}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ukb-subtle)]">{label}</p>
      {s.onClick ? (
        <button type="button" onClick={s.onClick} className={`${ui.focus} block w-full rounded text-left text-[13px] font-semibold leading-snug text-[var(--ukb-text)] hover:underline`}>
          {s.text}
        </button>
      ) : (
        <p className="text-[13px] font-semibold leading-snug text-[var(--ukb-text)]">{s.text}</p>
      )}
    </div>
  );
  return (
    <div role="region" aria-label="AI executive summary" className="grid grid-cols-1 gap-2 rounded-xl border border-[var(--ukb-ai)]/40 bg-[var(--ukb-ai-bg)] px-3 py-2.5 shadow-sm md:grid-cols-[auto_1fr_1fr_1fr] md:items-stretch">
      <span className="inline-flex items-center gap-1 self-center text-[11px] font-semibold text-[var(--ukb-ai-text)]" title={aiLine}>
        <Sparkles className="h-4 w-4 text-[var(--ukb-ai)]" aria-hidden />
        AI summary
      </span>
      {cell("What's critical", critical, "border-l-[var(--ukb-red-solid)]")}
      {cell("What's due before the BRC", due, "border-l-[var(--ukb-amber-solid)]")}
      {cell("What's holding steady", steady, "border-l-[var(--ukb-green-solid)]")}
      <p className="text-[10px] text-[var(--ukb-subtle)] md:col-span-4">{aiLine}</p>
    </div>
  );
}

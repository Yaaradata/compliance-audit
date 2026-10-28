"use client";

/**
 * UK Board v2 — UI kit copied from the v7 visual recipes (see STYLE_NOTES.md).
 * Tinted status cards, solid pills, coloured left rails, sparklines, indigo brand.
 * Unconfirmed is neutral grey with a dashed border, the word and a broken-link icon.
 */
import { useState, type ReactNode } from "react";
import { Sparkles, Unlink } from "lucide-react";
import { DRAFTS } from "@/lib/ukboard/v1/data";
import type { Status } from "@/lib/ukboard/v1/types";
import { plain } from "@/lib/ukboard/v2/boardTabs";
import { useStore } from "./store";
import { useDrawer } from "./drawerContext";
import type { DrawerKey } from "./drawerKeys";

export type Tone = "red" | "amber" | "green" | "grey";

export const TONE: Record<Tone, { bg: string; border: string; text: string; pill: string; dot: string; rail: string; stroke: string; fill: string }> = {
  red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-600", pill: "bg-red-600 text-white", dot: "bg-red-500", rail: "border-l-red-500", stroke: "#e11d48", fill: "#fee2e2" },
  amber: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", pill: "bg-amber-500 text-white", dot: "bg-amber-500", rail: "border-l-amber-500", stroke: "#d97706", fill: "#fef3c7" },
  green: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-600", pill: "bg-emerald-600 text-white", dot: "bg-emerald-500", rail: "border-l-emerald-500", stroke: "#059669", fill: "#d1fae5" },
  grey: { bg: "bg-slate-50", border: "border-dashed border-slate-300", text: "text-slate-600", pill: "border border-slate-400 bg-white text-slate-600", dot: "bg-slate-400", rail: "border-l-slate-400", stroke: "#64748b", fill: "#f1f5f9" },
};

export function toneOf(s: Status | "projected" | "room_to_grow" | "hold" | "fix_first" | "unverified"): Tone {
  if (s === "red" || s === "fix_first") return "red";
  if (s === "amber" || s === "projected" || s === "hold") return "amber";
  if (s === "within_appetite" || s === "room_to_grow") return "green";
  return "grey";
}

export const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
export const btn = `inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`;
export const btnPrimary = `inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`;

export function Pill({ tone, label, outline }: { tone: Tone; label: string; outline?: boolean }) {
  const cls = tone === "grey" ? TONE.grey.pill : outline ? `border ${TONE[tone].border} bg-white ${TONE[tone].text}` : TONE[tone].pill;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cls}`}>
      {tone === "grey" ? <Unlink className="h-3 w-3" aria-hidden /> : null}
      {label}
    </span>
  );
}

export function Panel({ title, right, children, className = "", id }: { title?: string; right?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`flex flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ${className}`}>
      {title ? (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {right}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`text-[11px] font-bold uppercase tracking-wider text-slate-500 ${className}`}>{children}</span>;
}

/** Whole surface opens the drawer. */
export function Opener({ drawer, label, children, className = "" }: { drawer: DrawerKey; label: string; children: ReactNode; className?: string }) {
  const { open } = useDrawer();
  return (
    <button type="button" aria-label={label} onClick={(e) => open(drawer, e.currentTarget)} className={`block w-full text-left ${focus} ${className}`}>
      {children}
    </button>
  );
}

export function Sparkline({ values, tone, height = 28 }: { values: number[]; tone: Tone; height?: number }) {
  const w = 100;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pts = values.map((v, i) => `${(i / Math.max(values.length - 1, 1)) * w},${height - 2 - ((v - lo) / (hi - lo || 1)) * (height - 4)}`);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="h-7 w-24" aria-hidden>
      <polygon points={`0,${height} ${pts.join(" ")} ${w},${height}`} fill={TONE[tone].fill} />
      <polyline points={pts.join(" ")} fill="none" stroke={TONE[tone].stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function AiTag({ label = "AI agent" }: { label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
      <Sparkles className="h-3 w-3 text-violet-500" aria-hidden />
      {label}
    </span>
  );
}

export function RuleTag() {
  return <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">Rule check</span>;
}

/** v7 "Path to green" footer, computed from the linked drafts in the session. */
export function PathToGreen({ draftIds, from }: { draftIds: string[]; from: "AMBER" | "RED" }) {
  const { state } = useStore();
  if (!draftIds.length) return null;
  const done = draftIds.filter((id) => state.session.drafts[id] && state.session.drafts[id].status !== "ai_draft").length;
  const pct = Math.round((done / draftIds.length) * 100);
  return (
    <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px]">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Path to green</span>
      <span className={`font-bold tabular-nums ${from === "RED" ? "text-red-700" : "text-amber-700"}`}>{pct}%</span>
      <span className="text-slate-400">·</span>
      <span className={`text-[9px] font-bold uppercase ${from === "RED" ? "text-red-600" : "text-amber-700"}`}>{from}</span>
      <span className="text-slate-400">→</span>
      <span className="text-[9px] font-bold uppercase text-emerald-700">Green</span>
      <span className="text-slate-400">·</span>
      <span className="text-slate-500">
        {done}/{draftIds.length} actions
      </span>
    </div>
  );
}

/** v7 change-list row. */
export function ChangeRow({ text, tag, tone, standing, drawer }: { text: string; tag: string; tone: Tone; standing?: string; drawer: DrawerKey }) {
  return (
    <Opener drawer={drawer} label={text} className="rounded-r-lg">
      <div className={`rounded-r-lg border-l-[3px] bg-stone-50/80 py-2.5 pl-3.5 pr-3 hover:bg-stone-100 ${TONE[tone].rail}`}>
        <div className="flex items-start justify-between gap-3">
          <span className="flex-1 text-[13px] leading-snug text-slate-700">{text}</span>
          <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${TONE[tone].bg} ${TONE[tone].text}`}>{tag}</span>
        </div>
        {standing ? <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{standing}</p> : null}
      </div>
    </Opener>
  );
}

/** Human-gated draft (copied from the v1 draft card): Approve · Edit · Reject. CRO only. */
export function DraftCard({ draftId, title, reason }: { draftId: string; title?: string; reason?: string }) {
  const { state, dispatch } = useStore();
  const d = DRAFTS[draftId];
  const ds = state.session.drafts[draftId];
  const [opt, setOpt] = useState<string | undefined>();
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(plain(ds?.text ?? ""));
  const [rejecting, setRejecting] = useState(false);
  if (!d || !ds) return null;
  const canGate = state.persona === "cro" && d.gateHolder === "cro";
  const needsOpt = !!d.options && !opt;
  const sendable = d.effect === "send" || d.effect === "case_prepared";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-slate-900">{title ?? plain(d.title)}</p>
        <AiTag />
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{reason ?? plain(d.reason)}</p>
      {ds.status === "ai_draft" ? (
        <>
          {edit ? (
            <textarea aria-label="Edit draft" rows={3} value={text} onChange={(e) => setText(e.target.value)} className={`mt-2 w-full rounded-md border border-slate-300 p-2 text-xs ${focus}`} />
          ) : (
            <p className="mt-2 line-clamp-3 text-xs text-slate-600" title={plain(ds.text)}>
              {plain(ds.text)}
            </p>
          )}
          {d.options ? (
            <div className="mt-2 flex flex-wrap gap-3">
              {d.options.map((o) => (
                <label key={o.id} className="inline-flex items-center gap-1 text-xs text-slate-700">
                  <input type="radio" name={`opt-${draftId}`} checked={opt === o.id} disabled={!canGate} onChange={() => setOpt(o.id)} />
                  {o.label}
                </label>
              ))}
            </div>
          ) : null}
          {canGate ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" disabled={needsOpt} className={btnPrimary} onClick={() => dispatch({ type: "ACCEPT", draftId, optionId: opt, text: edit ? text : undefined })}>
                {edit ? "Approve edited" : "Approve"}
              </button>
              {!edit ? (
                <button type="button" className={btn} onClick={() => setEdit(true)}>
                  Edit
                </button>
              ) : null}
              {rejecting ? (
                <button type="button" className={btn} onClick={() => dispatch({ type: "REJECT", draftId, reason: "Not supported by the evidence" })}>
                  Confirm reject
                </button>
              ) : (
                <button type="button" className={btn} onClick={() => setRejecting(true)}>
                  Reject
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[11px] font-semibold text-slate-400">{d.gateHolder === "brc_chair" ? "For the Risk Committee Chair" : "With CRO for approval"}</p>
          )}
        </>
      ) : (
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-slate-600">
            {ds.status === "rejected" ? "Rejected" : "Approved"} by {ds.byPersonId === "chair" ? "Graham Pryce" : "Eleanor Hartley"} on {ds.on} · v{ds.version}
          </p>
          {ds.status !== "rejected" && (!sendable || ds.status === "sent_to_owner") ? <p className="font-semibold text-slate-900">{plain(d.faceAfter)}</p> : null}
          {sendable && ds.status === "accepted" && state.persona === "cro" ? (
            <button type="button" className={btn} onClick={() => dispatch({ type: "SEND", draftId })}>
              Send to owner: {plain(d.targetRole)}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function AuditList({ refs }: { refs: string[] }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const rows = state.session.audit.filter((a) => refs.includes(a.objectRef) && a.action !== "draft.created");
  return (
    <div className="text-xs">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`font-semibold text-slate-700 ${focus} rounded`}>
        {open ? "▾" : "▸"} History ({rows.length})
      </button>
      {open ? (
        rows.length ? (
          <ul className="mt-1 divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.entryId} className="py-1 text-slate-600">
                {r.ts} · {r.actorName} ({r.actorRole}) · {plain(r.action)} · {plain(r.objectLabel)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-slate-400">No entries yet</p>
        )
      ) : null}
    </div>
  );
}

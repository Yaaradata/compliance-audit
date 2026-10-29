"use client";

/**
 * UK Board v2 — risk appetite components (Top · Emerging · Obligatory).
 * StrategyStrip · RollupChip · ExceptionTree · TensionList ·
 * AttestationButton.
 * Measure visuals live in visuals.tsx. Nothing here changes a live limit or notifies a regulator:
 * escalation drafts a note to the named decider.
 */
import { useState } from "react";
import { X } from "lucide-react";
import {
  l2Visible,
  l3Visible,
  measure,
  MEASURES,
  OBJ_WORD,
  OBJECTIVE_LIST,
  objectiveStatus,
  rollupOf,
  TENSION_LIST,
  type Measure,
  type ObjId,
  type ObjStatus,
  type TensionState,
} from "@/lib/ukboard/v2/boardStore";
import { useDrawer } from "./drawerContext";
import { AttestPill, Card, StatusPill } from "./present";
import { useStore } from "./store";
import { btn, focus, Pill, type Tone } from "./ui";

/* ── Objective filter ────────────────────────────────────────────────── */

const OBJ_TONE: Record<ObjStatus, Tone> = { on_track: "green", at_risk: "amber", off_track: "red" };

/** Measures linked to the active strategy filter (all 12 when no filter is set). */
export function useFilteredMeasures(): Measure[] {
  const { state } = useStore();
  const f = state.filter as ObjId | null;
  return f ? MEASURES.filter((m) => m.objectives.includes(f)) : MEASURES;
}

/** Four objectives with status pills, no numbers. Clicking filters the tab to linked measures. */
export function StrategyStrip() {
  const { state, dispatch } = useStore();
  const f = state.filter;
  return (
    <section className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2" aria-label="Strategic objectives">
      {OBJECTIVE_LIST.map((o) => {
        const st = objectiveStatus(o.id);
        const on = f === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => dispatch({ type: "SET_FILTER", objective: on ? null : o.id })}
            className={`flex min-h-8 items-center gap-2 rounded-md border px-2.5 py-1 text-[13px] ${on ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"} ${f && !on ? "opacity-60" : ""} ${focus}`}
          >
            <b className="font-semibold text-slate-500">{o.id}</b>
            <span className="text-slate-800">{o.short}</span>
            <Pill tone={OBJ_TONE[st]} label={OBJ_WORD[st]} />
          </button>
        );
      })}
      {f ? (
        <button type="button" onClick={() => dispatch({ type: "SET_FILTER", objective: null })} className={`ml-auto inline-flex items-center gap-1 rounded border border-indigo-300 bg-white px-2 py-0.5 text-xs font-semibold text-indigo-700 ${focus}`}>
          Filtered: {f} <X className="h-3 w-3" aria-label="Clear filter" />
        </button>
      ) : null}
    </section>
  );
}

/* ── RollupChip ──────────────────────────────────────────────────────── */

/** "n of m below off track": Level 2 metrics and Level 3 controls under one board measure. */
export function RollupChip({ m }: { m: Measure }) {
  const r = rollupOf(m);
  return (
    <span className={`whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] tabular-nums ${r.offTrack ? "border-slate-300 font-semibold text-slate-800" : "border-slate-200 text-slate-500"}`}>
      {r.offTrack} of {r.below} below off track
    </span>
  );
}

/* ── ExceptionTree ───────────────────────────────────────────────────── */

/**
 * Level 2 metrics and Level 3 controls under a board measure, filtered by persona (§2.2): Board and
 * Chair see Level 2 rows not within appetite and Level 3 reds; the CRO can show every Level 2 row.
 */
export function ExceptionTree({ m }: { m: Measure }) {
  const { state } = useStore();
  const cro = state.persona === "cro";
  const [all, setAll] = useState(false);
  const exceptions = l2Visible(m, "board");
  const rows = cro && all ? m.l2 : exceptions;
  const hidden = m.l2.length - exceptions.length;
  const reds = l3Visible(m);
  return (
    <div className="text-[13px]">
      <p className={`border-t border-slate-100 py-1.5 text-xs ${m.linkage.result === "gap" ? "font-semibold text-slate-800" : "text-slate-500"}`}>
        {m.linkage.result === "gap" ? `Linkage gap found ${m.linkage.tested}` : `Linkage tested ${m.linkage.tested}: linked`}
        {m.linkage.note ? ` · ${m.linkage.note}` : ""}
      </p>
      <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Level 2 metrics</p>
      {rows.map((x) => (
        <div key={x.name} className={`grid min-h-8 grid-cols-[minmax(0,1fr)_auto_minmax(72px,auto)_auto] items-center gap-3 border-t border-slate-100 py-1 ${x.status === "red" ? "border-l-[3px] border-l-red-500 pl-2" : x.status === "amber" ? "border-l-[3px] border-l-amber-500 pl-2" : "border-l-[3px] border-l-transparent pl-2"}`}>
          <span className="text-slate-800">{x.name}</span>
          <b className="text-right font-semibold tabular-nums text-slate-900">{x.value}</b>
          <span className="text-xs text-slate-500">{x.threshold}</span>
          <StatusPill status={x.status} />
        </div>
      ))}
      {hidden > 0 ? (
        <p className="flex min-h-8 items-center justify-between gap-3 border-t border-slate-100 py-1 text-xs text-slate-500">
          <span>{cro && all ? `${hidden} within appetite shown` : `${hidden} of ${m.l2.length} Level 2 metrics within appetite are hidden`}</span>
          {cro ? (
            <button type="button" onClick={() => setAll((v) => !v)} className={`rounded font-semibold text-indigo-700 hover:underline ${focus}`}>
              {all ? "Hide within" : "Show all"}
            </button>
          ) : null}
        </p>
      ) : null}
      <p className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Level 3 controls</p>
      <p className="border-t border-slate-100 py-1 text-xs text-slate-500">
        {m.l3.count} tested · {reds.length} red
      </p>
      {reds.map((c) => (
        <div key={c.name} className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-l-[3px] border-t border-l-red-500 border-t-slate-100 py-1 pl-2">
          <span className="text-slate-800">{c.name}</span>
          <span className="text-xs text-slate-500">
            Control owner: {c.owner} · tested {c.lastTested}
          </span>
          <StatusPill status="red" />
        </div>
      ))}
    </div>
  );
}

/* ── TensionList ─────────────────────────────────────────────────────── */

const TENSION: Record<TensionState, [Tone, string]> = { not_agreed: ["amber", "Not agreed"], agreed: ["green", "Agreed"], floor: ["red", "Regulatory floor"] };

/** Where two board aims pull against each other. */
export function TensionList({ title = "Tensions" }: { title?: string }) {
  const { open } = useDrawer();
  const linked = new Set(useFilteredMeasures().map((m) => m.id));
  const rows = TENSION_LIST.filter((t) => linked.has(t.measureId));
  return (
    <Card title={title} right={<span className="text-xs text-slate-500">{rows.filter((t) => t.state === "not_agreed").length} not agreed</span>}>
      {rows.map((t) => (
        <button key={t.id} type="button" onClick={(e) => open(`metric:${t.measureId}`, e.currentTarget)} className={`flex min-h-9 w-full items-center justify-between gap-3 border-t border-slate-100 py-1 text-left text-[13px] hover:bg-slate-50 ${focus}`}>
          <span className="min-w-0 leading-snug text-slate-800">
            {t.a} <span className="text-slate-400">vs</span> {t.b}
            <span className="block text-xs text-slate-500">{t.note}</span>
          </span>
          <Pill tone={TENSION[t.state][0]} outline={t.state !== "floor"} label={TENSION[t.state][1]} />
        </button>
      ))}
    </Card>
  );
}

/* ── AttestationButton ───────────────────────────────────────────────── */

/** Attestation state with the risk owner's reasonable-steps record; the CRO records a due attestation. */
export function AttestationButton({ measureId }: { measureId: string }) {
  const { state, dispatch } = useStore();
  const m = measure(measureId);
  const done = state.session.attested.includes(m.id);
  const a = done ? "attested" : m.attest.state;
  return (
    <span className="inline-flex items-center gap-2">
      <AttestPill a={a} />
      {!done && m.attest.date ? <span className="text-xs text-slate-500">{a === "due" ? `due ${m.attest.date}` : m.attest.date}</span> : null}
      {a === "due" && state.persona === "cro" ? (
        <button type="button" onClick={() => dispatch({ type: "ATTEST", measureId: m.id })} className={btn}>
          Record attestation
        </button>
      ) : null}
    </span>
  );
}

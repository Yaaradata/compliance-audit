"use client";

/**
 * UK Board v2 — risk appetite components (Top · Emerging · Obligatory).
 * StrategyStrip · TierMap · RollupChip · ExceptionTree · TensionList ·
 * ReportableTable · LineOfSightTable · AttestationButton.
 * Measure visuals live in visuals.tsx. Nothing here changes a live limit or notifies a regulator:
 * escalation drafts a note to the named decider.
 */
import { useState } from "react";
import { X } from "lucide-react";
import {
  l2Visible,
  l3Visible,
  LINE_OF_SIGHT,
  measure,
  measuresByTier,
  MEASURES,
  OBJ_WORD,
  OBJECTIVE_LIST,
  objectiveStatus,
  REPORTABLE_EVENTS,
  rollupOf,
  TENSION_LIST,
  TIER_INFO,
  type Measure,
  type ObjId,
  type ObjStatus,
  type TensionState,
  type Tier,
} from "@/lib/ukboard/v2/boardStore";
import { useDrawer } from "./drawerContext";
import { AttestPill, Card, StatusPill, Table, useFigures } from "./present";
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

/* ── TierMap ─────────────────────────────────────────────────────────── */

const TIER_SPAN: Record<Tier, string> = { top: "xl:col-span-5", emerging: "xl:col-span-3", obligatory: "xl:col-span-4" };

/** The 12 board measures in three tier columns; dims measures outside the strategy filter. */
export function TierMap() {
  const { open } = useDrawer();
  const linked = new Set(useFilteredMeasures().map((m) => m.id));
  useFigures(MEASURES.map((m) => `m:${m.id}`));
  return (
    <div className="grid gap-3 xl:grid-cols-12">
      {measuresByTier().map((g) => (
        <Card key={g.tier} title={TIER_INFO[g.tier].label} right={<span className="text-xs text-slate-500">{TIER_INFO[g.tier].meaning}</span>} className={TIER_SPAN[g.tier]}>
          {g.rows.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={(e) => open(`metric:${m.id}`, e.currentTarget)}
              className={`flex min-h-10 w-full items-center gap-2.5 border-t border-slate-100 py-1 text-left text-[13px] hover:bg-slate-50 ${linked.has(m.id) ? "" : "opacity-40"} ${focus}`}
            >
              <span className={`min-w-0 flex-1 leading-snug ${m.status === "within" ? "text-slate-600" : "font-semibold text-slate-900"}`}>{m.name}</span>
              <span className="whitespace-nowrap tabular-nums text-slate-900">{m.short ?? m.value}</span>
              <StatusPill status={m.status} />
            </button>
          ))}
        </Card>
      ))}
    </div>
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

/* ── ReportableTable ─────────────────────────────────────────────────── */

/** Reportable · Not reportable · Read-across. "Escalate for decision" drafts a note; it never notifies. */
export function ReportableTable() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const canEscalate = state.persona !== "board";
  return (
    <Table
      title="Reportable events"
      right={<span className="text-xs text-slate-500">Decider decides; nothing is sent from here</span>}
      cols="grid-cols-[minmax(140px,1.4fr)_56px_104px_minmax(120px,1.2fr)_80px_minmax(110px,1fr)_80px_140px]"
      head={["Event", "Found", "Classification", "Rule", "Clock", "Decider", "Read-across", ""]}
      rows={REPORTABLE_EVENTS.map((e) => {
        const done = state.session.escalated.includes(e.id);
        return {
          key: e.id,
          rail: e.breached ? "red" : undefined,
          cells: [
            <button key="e" type="button" onClick={(ev) => open(`metric:${e.measureId}`, ev.currentTarget)} className={`text-left font-semibold text-slate-900 hover:underline ${focus}`}>
              {e.event}
            </button>,
            <span key="f" className="tabular-nums">{e.found}</span>,
            <Pill key="c" tone={e.classification === "Reportable" ? "red" : "grey"} outline label={e.classification} />,
            <span key="r" className="text-xs text-slate-600">{e.rule}</span>,
            <span key="k" className="text-xs">{e.clock}</span>,
            <span key="d" className="text-xs text-slate-600">
              {e.decider} · {e.forum}
            </span>,
            <span key="x" className="text-xs">{e.readAcross}</span>,
            canEscalate ? (
              <button key="b" type="button" disabled={done} onClick={() => dispatch({ type: "ESCALATE_EVENT", eventId: e.id, decider: e.decider })} className={btn}>
                {done ? "Note drafted" : "Escalate for decision"}
              </button>
            ) : (
              <span key="b" />
            ),
          ],
        };
      })}
    />
  );
}

/* ── LineOfSightTable ────────────────────────────────────────────────── */

const SIGHT_HEAD = ["Risk owner", "Control owner", "Board measure"];

/** Line of sight from each customer journey to a named owner and a board measure. */
export function LineOfSightTable() {
  const rows = Object.entries(LINE_OF_SIGHT);
  const gaps = rows.filter(([, v]) => v.includes(false)).length;
  return (
    <Table
      title="Line of sight"
      right={<span className="text-xs text-slate-500">{gaps} of {rows.length} journeys with a gap</span>}
      cols="grid-cols-[minmax(180px,1.6fr)_repeat(3,minmax(100px,1fr))]"
      head={["Journey", ...SIGHT_HEAD]}
      rows={rows.map(([journey, v]) => ({
        key: journey,
        rail: v[0] ? undefined : "amber",
        cells: [
          <b key="j" className="font-semibold text-slate-900">{journey}</b>,
          ...v.map((ok, i) => (ok ? <span key={i} className="text-xs text-slate-600">Named</span> : <Pill key={i} tone="amber" outline label="Gap" />)),
        ],
      }))}
    />
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

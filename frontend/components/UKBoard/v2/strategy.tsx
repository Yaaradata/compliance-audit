"use client";

/**
 * UK Board v2 — Board member Strategy & appetite (§5.2) and Decisions (§5.7).
 * Strategy: the cascade from objective to risk appetite statement to board measure, tensions,
 * policy linkage and the band-design line. Decisions: board calls as master–detail with the stance
 * control, options, second-order effects and questions ✦, then the decision log.
 * Measure visuals render through MeasureVisual (visualKind); Decisions has none.
 */
import { Fragment, useState } from "react";
import {
  bandMedians,
  BOARD_CALLS,
  FIG,
  fmt,
  measure,
  MEASURES,
  OBJ_WORD,
  OBJECTIVE_LIST,
  PANEL_SOURCES,
  objectiveStatus,
  policiesTracked,
  POLICIES,
  thresholdCells,
  type Measure,
  type ObjId,
} from "@/lib/ukboard/v2/boardStore";
import { TensionList, useFilteredMeasures } from "./appetite";
import { MeasureVisual, OptionCompare, StanceLine, StatusHistory, type CompareOption } from "./visuals";
import { useDrawer } from "./drawerContext";
import { Card, LineItem, SourceLine, StatusPill, useFigures } from "./present";
import { useStore } from "./store";
import { AiTag, btn, focus, Pill } from "./ui";

/* ── Strategy & appetite ─────────────────────────────────────────────── */

const GROWTH: Partial<Record<ObjId, string>> = {
  O1: `${fmt.gbpBn(FIG.mortgages.lentBn)} of ${fmt.gbpBn(FIG.mortgages.planBn)} plan`,
  O2: `+${fmt.gbpBn(FIG.savings.balancesBn)} vs +${fmt.gbpBn(FIG.savings.planBn)} plan`,
};
/** 52px rows; the measure visual sits in one column so the eye scans down one line. */
const ROW = "grid min-h-[52px] grid-cols-[minmax(170px,2fr)_258px_64px_64px_64px_minmax(120px,1fr)_112px] items-center gap-3 px-4 py-1 text-[13px] leading-snug";

/** Objective → risk appetite statement → board measure; grouped by primary objective. */
function Cascade() {
  const { open } = useDrawer();
  const { state } = useStore();
  const shown = useFilteredMeasures();
  const groups = OBJECTIVE_LIST.filter((o) => !state.filter || o.id === state.filter).map((o) => ({
    o,
    rows: state.filter ? shown : MEASURES.filter((m) => m.objectives[0] === o.id),
  }));
  useFigures(["f:mortgage-growth", "f:savings-growth", ...shown.map((m) => `m:${m.id}`)]);
  return (
    <Card title="Strategy to risk appetite" flush right={<span className="text-xs text-slate-500">Objective · Risk appetite statement · Board measures (Level 1)</span>}>
      <div data-chart="measure-visuals">
        <div className={`${ROW} !min-h-7 border-t border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>
          <span>Board measure · Risk appetite statement</span>
          <span>Position</span>
          <span>Amber trigger</span>
          <span>Appetite limit</span>
          <span>Type</span>
          <span>Stance</span>
          <span className="text-right">Status</span>
        </div>
        {groups.map(({ o, rows }) => (
          <Fragment key={o.id}>
            <div className="flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 bg-slate-50 px-4 py-1.5 text-[13px]">
              <b className="font-semibold text-slate-500">{o.id}</b>
              <b className="font-semibold text-slate-900">{o.name}</b>
              {GROWTH[o.id] ? <span className="tabular-nums text-slate-600">{GROWTH[o.id]}</span> : null}
              <span className="ml-auto">
                <Pill tone={objectiveStatus(o.id) === "off_track" ? "red" : objectiveStatus(o.id) === "at_risk" ? "amber" : "green"} label={OBJ_WORD[objectiveStatus(o.id)]} />
              </span>
            </div>
            {rows.map((m) => (
              <CascadeRow key={m.id} m={m} onOpen={(el) => open(`metric:${m.id}`, el)} />
            ))}
          </Fragment>
        ))}
      </div>
    </Card>
  );
}

function CascadeRow({ m, onOpen }: { m: Measure; onOpen: (el: HTMLElement) => void }) {
  const t = thresholdCells(m);
  const rail = m.status === "red" ? "border-l-red-500" : m.status === "amber" ? "border-l-amber-500" : "border-l-transparent";
  const muted = m.status === "within";
  return (
    <button type="button" onClick={(e) => onOpen(e.currentTarget)} className={`block w-full border-l-[3px] border-t border-t-slate-100 text-left hover:bg-slate-50 ${rail} ${focus}`}>
      <span className={`${ROW} !pl-[13px]`}>
        <span className="min-w-0">
          <span className={muted ? "text-slate-600" : "font-semibold text-slate-900"}>{m.name}</span>
          <span className="block text-xs text-slate-500">{m.statement}</span>
        </span>
        <MeasureVisual m={m} width={160} />
        <span className="text-xs tabular-nums">{t.amber}</span>
        <span className="text-xs tabular-nums">{t.limit}</span>
        <span className="text-xs">{m.type === "leading" ? "Leading" : "Lagging"}</span>
        <StanceLine m={m} short />
        <span className="justify-self-end">
          <StatusPill status={m.status} />
        </span>
      </span>
    </button>
  );
}

function PolicyLinkage() {
  return (
    <Card title="Policy linkage" right={<span className="text-xs tabular-nums text-slate-500">{`${policiesTracked()} of ${POLICIES.total} policies linked to a board measure`}</span>}>
      {POLICIES.untracked.map((p) => (
        <LineItem key={p} text={p} right={<Pill tone="grey" label="Untracked" />} />
      ))}
    </Card>
  );
}

function BandDesign() {
  const b = bandMedians();
  const pct = (x: number) => `${Math.round(x * 1000) / 10}%`;
  return (
    <Card title="Band design">
      <LineItem text="Top risks" detail={`median band ${pct(b.top)} of the appetite limit`} />
      <LineItem text="Emerging risks" detail={`median band ${pct(b.emerging)}, wider while evidence builds`} />
      <LineItem text="Obligatory risks · Level 0" detail="zero appetite, no band" />
    </Card>
  );
}

/* ── Decisions ───────────────────────────────────────────────────────── */

/** One board call: stance, options side by side, questions ✦ and the invitation. Shown in the 720px decision panel. */
export function CallDetail({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const call = BOARD_CALLS.find((c) => c.id === id) ?? BOARD_CALLS[0];
  const m = measure(call.measureId);
  const invited = state.session.invited.includes(m.owner);
  const SUB = "text-[11px] font-semibold uppercase tracking-wide text-slate-500";
  return (
    <>
      <section className="border-b border-slate-100 py-3 text-xs text-slate-500">
        Decider: {call.decider} · due {call.due} · Risk owner: {m.owner} ·{" "}
        <button type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`rounded font-semibold text-indigo-700 hover:underline ${focus}`}>
          {m.name} ›
        </button>
      </section>
      <section className="border-b border-slate-100 py-3">
        <p className={`pb-2 ${SUB}`}>Stance</p>
        <StanceLine m={m} />
      </section>
      <section className="border-b border-slate-100 py-3">
        <p className={`pb-2 ${SUB}`}>Options</p>
        <OptionCompare rows={["Growth", "Risk", "Cost", "Time", "Second-order effect"]} options={compareOptions(call)} />
      </section>
      <section className="border-b border-slate-100 py-3">
        <p className={`flex items-center justify-between pb-1 ${SUB}`}>
          Questions to ask <AiTag label="Drafted" />
        </p>
        {call.questions.slice(0, 3).map((q) => (
          <LineItem key={q} text={q} />
        ))}
      </section>
      <section className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3">
        <button type="button" disabled={invited} onClick={() => dispatch({ type: "INVITE_OWNER", role: m.owner })} className={btn}>
          {invited ? `${m.owner} invited to present` : "Invite risk owner to present"}
        </button>
        <span className="text-xs text-slate-500">Adds the item to the committee agenda</span>
      </section>
      <div className="py-3">
        <SourceLine src={PANEL_SOURCES.CALL} bare />
      </div>
    </>
  );
}

/** Second-order effects belong to the option named before the arrow ("Loosen → …"). */
function compareOptions(call: (typeof BOARD_CALLS)[number]): CompareOption[] {
  return call.options.map((o) => {
    const effects = call.effects.filter((e) => o.option.toLowerCase().includes(e.split(" → ")[0].toLowerCase())).map((e) => e.split(" → ")[1]);
    return {
      name: o.option,
      recommended: "recommended" in o && !!o.recommended,
      current: /^Hold\b/.test(o.option),
      ai: "ai" in o && !!o.ai,
      cells: [o.growth, o.risk, o.cost, o.time, effects.join("; ")],
    };
  });
}

/** Status by quarter for all 12 (earlier quarters hatched where the store has no record). */
function History() {
  const [shown, setShown] = useState(false);
  useFigures(shown ? ["f:status-history"] : []);
  return (
    <Card
      title="Status history"
      className="h-full"
      right={
        <button type="button" aria-expanded={shown} onClick={() => setShown((v) => !v)} className={`rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
          {shown ? "Hide" : "Show"} ›
        </button>
      }
    >
      {shown ? (
        <div data-chart="status-history">
          <StatusHistory />
        </div>
      ) : (
        <p className="border-t border-slate-100 py-2 text-xs text-slate-500">Status of the 12 by quarter, where the register has a record. Collapsed by default.</p>
      )}
    </Card>
  );
}

export const STRATEGY_SECTIONS = {
  S_CASCADE: Cascade,
  S_HISTORY: History,
  S_TENSIONS: () => <TensionList />,
  S_POLICY: PolicyLinkage,
  S_BANDS: BandDesign,
};

"use client";

/**
 * UK Board v2 — Board member Strategy & appetite (§5.2) and Decisions (§5.7).
 * Strategy: the cascade from objective to risk appetite statement to board measure, tensions,
 * policy linkage and the band-design line. Decisions: board calls as master–detail with the stance
 * control, options, second-order effects and questions ✦, then the decision log.
 * Measure visuals render through MeasureVisual (visualKind); Decisions has none.
 */
import { Fragment } from "react";
import {
  bandMedians,
  BOARD_CALLS,
  FIG,
  fmt,
  measure,
  MEASURES,
  OBJ_WORD,
  OBJECTIVE_LIST,
  objectiveStatus,
  policiesTracked,
  POLICIES,
  thresholdCells,
  type Measure,
  type ObjId,
} from "@/lib/ukboard/v2/boardStore";
import { TensionList, useFilteredMeasures } from "./appetite";
import { MeasureVisual, StanceLine, StatusHistory } from "./visuals";
import { useDrawer } from "./drawerContext";
import { Card, LineItem, StatusPill, Table, useFigures } from "./present";
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

function BoardCallsPanel() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const call = BOARD_CALLS.find((c) => c.id === state.call) ?? BOARD_CALLS[0];
  const m = measure(call.measureId);
  const invited = state.session.invited.includes(m.owner);
  useFigures([`call:${call.id}`]);
  return (
    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-4 xl:grid-cols-12">
      <div className="xl:col-span-4">
        <Card title="Board calls" right={<span className="text-xs text-slate-500">{BOARD_CALLS.length} calls</span>}>
          {BOARD_CALLS.map((c) => {
            const on = c.id === call.id;
            const st = measure(c.measureId).status;
            return (
              <button key={c.id} type="button" aria-pressed={on} onClick={() => dispatch({ type: "SELECT_CALL", id: c.id })} className={`block w-full text-left ${on ? "bg-indigo-50" : "hover:bg-slate-50"} ${focus}`}>
                <span className={`flex min-h-12 items-center justify-between gap-3 border-l-[3px] border-t border-t-slate-100 py-1.5 pl-2.5 pr-1 text-[13px] ${st === "red" ? "border-l-red-500" : st === "amber" ? "border-l-amber-500" : "border-l-transparent"}`}>
                  <span className="min-w-0 leading-snug">
                    <b className="font-semibold text-slate-900">{c.verb}</b> <span className="text-slate-800">{c.title}</span>
                    <span className="block text-xs text-slate-500">
                      {c.decider} · {c.due}
                    </span>
                  </span>
                  <span className="text-indigo-700">›</span>
                </span>
              </button>
            );
          })}
        </Card>
      </div>
      <div className="flex min-w-0 flex-col gap-4 xl:col-span-8">
        <Card
          title={`${call.verb} ${call.title}`}
          right={
            <button type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
              {m.name} ›
            </button>
          }
        >
          <p className="border-t border-slate-100 py-2 text-xs text-slate-500">
            Decider: {call.decider} · due {call.due} · Risk owner: {m.owner}
          </p>
          <div className="border-t border-slate-100 py-2.5">
            <StanceLine m={m} />
          </div>
        </Card>
        <Table
          title="Options"
          cols="grid-cols-[minmax(180px,1.4fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_96px]"
          head={["Option", "Growth", "Risk", "Cost", "Time"]}
          rows={call.options.map((o) => ({
            key: o.option,
            cells: [
              <span key="o" className="flex flex-wrap items-center gap-1.5">
                <b className="font-semibold text-slate-900">{o.option}</b>
                {"recommended" in o && o.recommended ? <Pill tone="green" outline label="Recommended" /> : null}
                {"ai" in o && o.ai ? <AiTag label="Proposed" /> : null}
              </span>,
              <span key="g" className="text-xs">{o.growth}</span>,
              <span key="r" className="text-xs">{o.risk}</span>,
              <span key="c" className="text-xs">{o.cost}</span>,
              <span key="t" className="text-xs">{o.time}</span>,
            ],
          }))}
        />
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <Card title="Second-order effects">
            {call.effects.slice(0, 3).map((e) => (
              <LineItem key={e} text={e} />
            ))}
          </Card>
          <Card title="Questions to ask" right={<AiTag label="Drafted" />}>
            {call.questions.slice(0, 3).map((q) => (
              <LineItem key={q} text={q} />
            ))}
          </Card>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" disabled={invited} onClick={() => dispatch({ type: "INVITE_OWNER", role: m.owner })} className={btn}>
            {invited ? `${m.owner} invited to present` : "Invite risk owner to present"}
          </button>
          <span className="text-xs text-slate-500">Adds the item to the committee agenda</span>
        </div>
      </div>
    </div>
  );
}

/** Status by quarter for all 12 (earlier quarters hatched where the store has no record). */
function History() {
  useFigures(["f:status-history"]);
  return (
    <Card title="Status history" className="h-full">
      <div data-chart="status-history">
        <StatusHistory />
      </div>
    </Card>
  );
}

export const STRATEGY_SECTIONS = {
  S_CASCADE: Cascade,
  S_HISTORY: History,
  S_TENSIONS: () => <TensionList />,
  S_POLICY: PolicyLinkage,
  S_BANDS: BandDesign,
  D_CALLS: BoardCallsPanel,
};

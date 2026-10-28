"use client";

/**
 * UK Board v2 — Board member Overview (§5.1): posture, the three risk tiers, board calls, reportable
 * events, tensions, accountability and what changed since the last board. At most 300 words; the
 * BandDial in the tier map is the only chart. Figures come from lib/ukboard/v2/boardStore.ts.
 */
import {
  attestationThisMonth,
  BOARD_CALLS,
  journeysWithoutOwner,
  newMeasures,
  REPORTABLE_EVENTS,
  rollupTotals,
  SINCE_LAST_BOARD,
  SMF_CERT,
  statusChanges,
  TENSION_LIST,
} from "@/lib/ukboard/v2/boardStore";
import { TierMap, useFilteredMeasures } from "./appetite";
import { useDrawer } from "./drawerContext";
import { Card, LineItem, LinkMore, PostureStrip, rowRail, StatList, useFigures } from "./present";
import { useStore } from "./store";
import { AiTag, focus, Pill } from "./ui";

const POSTURE_SENTENCE = "Mortgages can grow; savings outrun crime checks.";

function useGo() {
  const { dispatch } = useStore();
  return (tab: string) => dispatch({ type: "SET_TAB", tab });
}

function OverviewPosture() {
  const r = rollupTotals();
  const changes = statusChanges().length;
  const added = newMeasures().length;
  useFigures(["f:rollup", "f:changes"]);
  return (
    <PostureStrip
      sentence={POSTURE_SENTENCE}
      detail={[`${r.below} metrics and controls below · ${r.offTrack} off track · ${r.unconfirmed} unconfirmed`, `${changes} status changes · ${added} new`]}
    />
  );
}

function BoardCalls() {
  const go = useGo();
  const { dispatch } = useStore();
  useFigures(BOARD_CALLS.map((c) => `call:${c.id}`));
  return (
    <Card title="Board calls" right={<LinkMore onClick={() => go("decisions")} label="Decisions" />}>
      {BOARD_CALLS.map((c) => (
        <LineItem key={c.id} text={`${c.verb} ${c.title}`} detail={`${c.decider} · ${c.due}`} onClick={() => dispatch({ type: "SELECT_CALL", id: c.id })} right={<span className="text-indigo-700">›</span>} />
      ))}
    </Card>
  );
}

function Reportable() {
  const go = useGo();
  return (
    <Card title="Reportable events" right={<LinkMore onClick={() => go("obligatory")} label="Obligatory" />}>
      {REPORTABLE_EVENTS.map((e) => (
        <LineItem key={e.id} rail={e.breached ? "red" : undefined} text={e.event} detail={`${e.decider} · ${e.clock}`} right={<Pill tone="red" outline label={e.classification} />} />
      ))}
    </Card>
  );
}

function Tensions() {
  const go = useGo();
  const linked = new Set(useFilteredMeasures().map((m) => m.id));
  const rows = TENSION_LIST.filter((t) => t.state !== "agreed" && linked.has(t.measureId));
  return (
    <Card title="Tensions" right={<LinkMore onClick={() => go("strategy")} label="Strategy" />}>
      {rows.map((t) => (
        <LineItem key={t.id} text={`${t.a} vs ${t.b}`} right={<Pill tone={t.state === "floor" ? "red" : "amber"} outline={t.state !== "floor"} label={t.state === "floor" ? "Regulatory floor" : "Not agreed"} />} />
      ))}
      {rows.length === 0 ? <p className="border-t border-slate-100 py-2 text-xs text-slate-500">None open for this objective</p> : null}
    </Card>
  );
}

function Accountability() {
  const go = useGo();
  const a = attestationThisMonth();
  const j = journeysWithoutOwner();
  return (
    <StatList
      title="Accountability"
      right={<LinkMore onClick={() => go("accountability")} label="Accountability" />}
      figures={["f:attest-month", "f:journeys", "f:smf-cert"]}
      rows={[
        { label: "Attestation", value: `${a.attested} of ${a.total}`, rail: "amber" },
        { label: "Journeys without risk owner", value: `${j.n} of ${j.of}`, rail: "red" },
        { label: "Next SMF certification", value: SMF_CERT.next },
      ]}
    />
  );
}

function SinceLastBoard() {
  const { open } = useDrawer();
  return (
    <Card title="Since last board">
      {SINCE_LAST_BOARD.map((e) => (
        <button key={e.text} type="button" onClick={(ev) => open(e.drawer, ev.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
          <span className={`grid min-h-9 grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${rowRail(e.rail === "grey" ? undefined : e.rail)}`}>
            <b className="font-semibold tabular-nums text-slate-900">{e.date}</b>
            <span className="text-slate-800">{e.text}</span>
            {e.ai ? <AiTag /> : <span />}
          </span>
        </button>
      ))}
    </Card>
  );
}

export const OVERVIEW_SECTIONS = {
  O_POSTURE: OverviewPosture,
  O_TIERS: TierMap,
  O_CALLS: BoardCalls,
  O_REPORTABLE: Reportable,
  O_TENSIONS: Tensions,
  O_ACCOUNT: Accountability,
  O_SINCE: SinceLastBoard,
};

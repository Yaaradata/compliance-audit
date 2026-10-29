"use client";

/**
 * UK Board v2 — Board member Overview (§4.1): one page the board can act on.
 * Strategy scorecard (4 objectives) → appetite position (status strip, roll-up, changes) → the three
 * risk tiers as text rows (off track first, greens as a count) → board calls and regulator exposure
 * (route matrix) → tensions and since last board. At most 300 words. Visuals: ProgressPace ×2,
 * StatusPips ×1, StatusStrip ×1, RouteMatrix ×1. Figures come from lib/ukboard/v2/boardStore.ts.
 */
import {
  attestationThisMonth,
  BOARD_CALLS,
  FIG,
  fmt,
  measure,
  measuresByTier,
  MEASURES,
  newMeasures,
  OBJ_WORD,
  OBJECTIVE_LIST,
  objectiveStatus,
  pipsOf,
  rollupTotals,
  SINCE_LAST_BOARD,
  STATUS_ORDER,
  STATUS_WORD,
  statusChanges,
  TENSION_LIST,
  TIER_INFO,
  type Measure,
  type ObjId,
  type Tier,
} from "@/lib/ukboard/v2/boardStore";
import { useFilteredMeasures } from "./appetite";
import { useDrawer } from "./drawerContext";
import { Card, LineItem, LinkMore, rowRail, StatusPill, useFigures } from "./present";
import { useStore } from "./store";
import { AiTag, focus, Pill } from "./ui";
import { EventRouteMatrix, ProgressPace, StatusPips, StatusStrip } from "./visuals";

const POSTURE_SENTENCE = "Mortgages can grow; savings outrun crime checks.";

/** Row names of at most six words (full names stay in the drawer). */
const SHORT_NAME: Record<string, string> = {
  "u-secfind": "Critical findings over 30 days",
  "u-detect": "Attack detection time",
  "u-restriction": "Restriction breaches",
  "u-screening": "Screening coverage",
  "u-notify": "Regulatory notifications",
};
/** Tension pairs in a few words (the full pair is on Strategy & appetite). */
const TENSION_SHORT: Record<string, string> = {
  T1: "Savings growth vs alert queue",
  T2: "Fast onboarding vs pre-transaction checks",
  T3: "First-time buyers vs high-LTV limit",
  T4: "Change freeze vs critical patching",
};
/** Two- or three-word names for the scorecard's driver line. */
const DRIVER_NAME: Record<string, string> = {
  "u-lcr": "Liquidity coverage",
  "u-capacity": "Alert queue age",
  "u-restriction": "Restriction breaches",
  "u-cd": "Consumer Duty",
};

function useGo() {
  const { dispatch } = useStore();
  return (tab: string) => dispatch({ type: "SET_TAB", tab });
}

/* ── Strategy scorecard ──────────────────────────────────────────────── */

const OBJ_TONE = { on_track: "green", at_risk: "amber", off_track: "red" } as const;

/** The worst linked measure, which drives the objective's status. */
const driverOf = (id: ObjId) => [...MEASURES.filter((m) => m.objectives.includes(id))].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))[0];

function ObjectiveVisual({ id }: { id: ObjId }) {
  const linked = MEASURES.filter((m) => m.objectives.includes(id));
  if (id === "O1") return <ProgressPace actual={FIG.mortgages.lentBn} target={FIG.mortgages.planBn} pace={FIG.mortgages.pace} text={`${fmt.gbpBn(FIG.mortgages.lentBn)} of ${fmt.gbpBn(FIG.mortgages.planBn)} · plan pace ${fmt.pct(FIG.mortgages.pace * 100)}`} />;
  if (id === "O2") return <ProgressPace actual={FIG.savings.balancesBn} target={FIG.savings.planBn} text={`+${fmt.gbpBn(FIG.savings.balancesBn)} vs +${fmt.gbpBn(FIG.savings.planBn)} plan · controls not keeping pace`} />;
  if (id === "O4") {
    const p = pipsOf(measure("u-cd"));
    return <StatusPips items={p.items} display={`${p.label} outcomes`} />;
  }
  const counts = (["red", "unconfirmed"] as const).map((s) => [s, linked.filter((m) => m.status === s).length] as const).filter(([, n]) => n);
  return <p className="text-[13px] font-semibold tabular-nums text-slate-900">{counts.map(([s, n]) => `${n} ${STATUS_WORD[s].toLowerCase()}`).join(" · ")}</p>;
}

function Scorecard() {
  const { state, dispatch } = useStore();
  useFigures(["f:mortgage-growth", "f:savings-growth", "f:cd-outcomes"]);
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Strategy scorecard">
      {OBJECTIVE_LIST.map((o) => {
        const st = objectiveStatus(o.id);
        const d = driverOf(o.id);
        const on = state.filter === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => dispatch({ type: "SET_FILTER", objective: on ? null : o.id })}
            className={`flex h-full flex-col gap-2.5 rounded-lg border bg-white px-4 py-3 text-left hover:shadow-sm ${on ? "border-indigo-400 ring-1 ring-indigo-200" : "border-slate-200"} ${state.filter && !on ? "opacity-60" : ""} ${focus}`}
          >
            <span className="flex items-start justify-between gap-2">
              <span className="text-[13px] font-semibold leading-snug text-slate-900">
                <span className="text-slate-500">{o.id}</span> {o.short}
              </span>
              <Pill tone={OBJ_TONE[st]} label={OBJ_WORD[st]} />
            </span>
            <span className="flex-1">
              <ObjectiveVisual id={o.id} />
            </span>
            <span className="text-xs text-slate-500">
              Driver: {DRIVER_NAME[d.id] ?? d.name} ({STATUS_WORD[d.status].toLowerCase()})
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Appetite position ───────────────────────────────────────────────── */

/** The only tinted block: status of all 12, the roll-up below them, and what changed. */
function AppetitePosition() {
  const r = rollupTotals();
  const a = attestationThisMonth();
  useFigures(["f:posture", "f:rollup", "f:changes", "f:attest-month"]);
  return (
    <section data-tinted="posture" className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5">
      <Pill tone="amber" label="Amber" />
      <span className="text-[13px] text-slate-800">{POSTURE_SENTENCE}</span>
      <StatusStrip />
      <span className="basis-full text-xs tabular-nums text-slate-700 xl:basis-auto">
        {`${r.below} below · ${r.offTrack} off track · ${r.unconfirmed} unconfirmed`} · {`${statusChanges().length} changes · ${newMeasures().length} new`}
      </span>
      <span className="rounded border border-amber-200 bg-white px-1.5 py-0.5 text-[11px] tabular-nums text-slate-700">
        <b className="text-slate-900">{`${a.attested} of ${a.total}`}</b> attested
      </span>
    </section>
  );
}

/* ── Tier columns ────────────────────────────────────────────────────── */

function TierRow({ m }: { m: Measure }) {
  const { open } = useDrawer();
  const rail = m.status === "red" ? "red" : m.status === "amber" ? "amber" : undefined;
  return (
    <button type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
      <span className={`grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-slate-100 py-1.5 text-[13px] leading-snug ${rowRail(rail)}`}>
        <span className="min-w-0">
          <span className="block font-semibold text-slate-900">{SHORT_NAME[m.id] ?? m.name}</span>
          <span className="block text-xs text-slate-500">
            <b className="font-semibold tabular-nums text-slate-900">{m.short ?? m.value}</b>
            {m.tier === "obligatory" ? null : ` · ${m.comparator}`}
          </span>
        </span>
        <StatusPill status={m.status} />
      </span>
    </button>
  );
}

function TierColumn({ tier }: { tier: Tier }) {
  const go = useGo();
  const linked = new Set(useFilteredMeasures().map((m) => m.id));
  const rows = (measuresByTier().find((g) => g.tier === tier)?.rows ?? []).filter((m) => linked.has(m.id));
  // Obligatory shows all four; the other tiers show what is off track and count the rest.
  const shown = tier === "obligatory" ? rows : rows.filter((m) => m.status !== "within");
  const within = rows.length - shown.length;
  useFigures(shown.map((m) => `m:${m.id}`));
  return (
    <Card title={TIER_INFO[tier].label} right={tier === "obligatory" ? <span className="text-xs text-slate-500">Zero appetite</span> : undefined} className="h-full">
      {shown.map((m) => (
        <TierRow key={m.id} m={m} />
      ))}
      {within ? (
        <button type="button" onClick={() => go("strategy")} className={`flex min-h-9 w-full items-center border-t border-slate-100 text-left text-[13px] text-slate-600 hover:bg-slate-50 ${focus}`}>
          {within} within <span className="ml-1 font-semibold text-indigo-700">›</span>
        </button>
      ) : null}
      {rows.length === 0 ? <p className="border-t border-slate-100 py-2 text-xs text-slate-500">None linked to this objective</p> : null}
    </Card>
  );
}

/* ── Calls, exposure, tensions, since last board ─────────────────────── */

function BoardCalls() {
  const go = useGo();
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  // Only the Board member has a Decisions tab; Chair and CRO open the linked measure instead.
  const board = state.persona === "board";
  useFigures(BOARD_CALLS.map((c) => `call:${c.id}`));
  return (
    <Card title="Board calls" right={board ? <LinkMore onClick={() => go("decisions")} label="Decisions" /> : undefined} className="h-full">
      {BOARD_CALLS.map((c) => (
        <LineItem key={c.id} text={`${c.verb} ${c.title}`} detail={c.decider === "Board" ? c.due : `Chair · ${c.due}`} onClick={(el) => (board ? dispatch({ type: "SELECT_CALL", id: c.id }) : open(`metric:${c.measureId}`, el))} right={<span className="text-indigo-700">›</span>} />
      ))}
    </Card>
  );
}

function RegulatorExposure() {
  const go = useGo();
  useFigures(["f:routes"]);
  return (
    <Card title="Regulator exposure" right={<LinkMore onClick={() => go("obligatory")} label="Obligatory" />} className="h-full">
      <EventRouteMatrix compact />
    </Card>
  );
}

function Tensions() {
  const go = useGo();
  const linked = new Set(useFilteredMeasures().map((m) => m.id));
  const all = TENSION_LIST.filter((t) => linked.has(t.measureId));
  const rows = all.filter((t) => t.state !== "agreed");
  const agreed = all.length - rows.length;
  const pill = { not_agreed: ["amber", "Not agreed"], agreed: ["green", "Agreed"], floor: ["red", "Regulatory floor"] } as const;
  return (
    <Card title="Tensions" className="h-full">
      {rows.map((t) => (
        <LineItem key={t.id} text={TENSION_SHORT[t.id] ?? `${t.a} vs ${t.b}`} right={<Pill tone={pill[t.state][0]} label={pill[t.state][1]} />} />
      ))}
      {agreed ? (
        <button type="button" onClick={() => go("strategy")} className={`flex min-h-9 w-full items-center border-t border-slate-100 text-left text-[13px] text-slate-600 hover:bg-slate-50 ${focus}`}>
          {agreed} agreed <span className="ml-1 font-semibold text-indigo-700">›</span>
        </button>
      ) : null}
      {all.length === 0 ? <p className="border-t border-slate-100 py-2 text-xs text-slate-500">None for this objective</p> : null}
    </Card>
  );
}

function SinceLastBoard() {
  const { open } = useDrawer();
  return (
    <Card title="Since last board" className="h-full">
      {SINCE_LAST_BOARD.map((e) => (
        <button key={e.text} type="button" onClick={(ev) => open(e.drawer, ev.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
          <span className={`grid min-h-9 grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${rowRail(e.rail === "grey" ? undefined : e.rail)}`}>
            <b className="font-semibold tabular-nums text-slate-900">{e.date}</b>
            <span className="text-slate-800">{e.text}</span>
            {e.ai ? <AiTag label="AI" /> : <span />}
          </span>
        </button>
      ))}
    </Card>
  );
}

export const OVERVIEW_SECTIONS = {
  O_SCORECARD: Scorecard,
  O_POSTURE: AppetitePosition,
  O_TOP: () => <TierColumn tier="top" />,
  O_EMERGING: () => <TierColumn tier="emerging" />,
  O_OBLIGATORY: () => <TierColumn tier="obligatory" />,
  O_CALLS: BoardCalls,
  O_EXPOSURE: RegulatorExposure,
  O_TENSIONS: Tensions,
  O_SINCE: SinceLastBoard,
};

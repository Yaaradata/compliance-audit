"use client";

/**
 * UK Board v2 — Board member Overview: a one-screen summary at 1440×900 with no scrolling.
 * Objective cards (mini visual + one value line) → Outside appetite beside Board decisions and
 * Tell the regulator? → Since last board beside Ownership. The headline bar above and the page
 * sources line below come from the shell. Figures come from lib/ukboard/v2/boardStore.ts.
 */
import {
  BOARD_CALLS,
  FIG,
  fmt,
  issuesFound,
  journeysWithoutOwner,
  MORTGAGE_YTD,
  mortgagePlanAt,
  MEASURES,
  OBJ_WORD,
  OBJECTIVE_LIST,
  objectiveStatus,
  ownerRows,
  REPORTABLE_EVENTS,
  SINCE_LAST_BOARD,
  STATUS_WORD,
  thresholdCells,
  type Measure,
  type MeasureStatus,
  type ObjId,
} from "@/lib/ukboard/v2/boardStore";
import { ROUTES } from "@/lib/ukboard/v1/data";
import { useFilteredMeasures } from "./appetite";
import { useDrawer } from "./drawerContext";
import { CAPACITY } from "@/lib/ukboard/v1/data";
import { CHART } from "./boardChartTheme";
import { Card, rowRail, StatusPill, useFigures } from "./present";
import { useStore } from "./store";
import { AiTag, focus, Pill } from "./ui";
import { CELL } from "./visuals";

/** Row labels of at most four words on this page (full names stay in the drawer). */
const SHORT_NAME: Record<string, string> = {
  "u-lcr": "Liquidity coverage",
  "u-capacity": "Alert queue age",
  "u-secfind": "Critical security findings",
  "u-detect": "Attack detection time",
  "u-restriction": "Restriction breaches",
  "u-screening": "Screening coverage",
  "u-cd": "Consumer Duty",
  "u-notify": "Notifications on time",
};
/** Values short enough for one line. */
const SHORT_VALUE: Record<string, string> = { "u-cd": "2 of 4 amber", "u-notify": "2 open", "u-screening": "—", "u-detect": "12 min" };
/** The appetite limit in a word or two (the full comparator is in the tooltip). */
const limitText = (m: Measure) => {
  const t = thresholdCells(m);
  return t.limit === "—" ? "" : /^[\d<>≤≥£.]/.test(t.limit) ? `limit ${t.limit}` : t.limit;
};
/** Board call labels of at most four words. */
const CALL_SHORT: Record<string, string> = { D1: "Savings growth vs checks", D2: "First-time-buyer high-LTV", D3: "Item removed from pack" };
function useGo() {
  const { dispatch } = useStore();
  return (tab: string) => dispatch({ type: "SET_TAB", tab });
}

/* ── Strategy scorecard ──────────────────────────────────────────────── */

const OBJ_TONE = { on_track: "green", at_risk: "amber", off_track: "red" } as const;

/** Mini line chart, 160×40, no axes, labels at the line ends; optional amber gap between two lines. */
function MiniLines({ series, gap, label }: { series: { values: number[]; colour: string; dashed?: boolean; end: string }[]; gap?: boolean; label: string }) {
  const W = 160;
  const H = 40;
  const PW = 92; // plot width; the rest carries the end labels
  const all = series.flatMap((x) => x.values);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const r1 = (v: number) => Math.round(v * 10) / 10;
  const n = series[0].values.length;
  const x = (i: number) => r1(2 + (i / (n - 1)) * (PW - 4));
  const y = (v: number) => r1(H - 4 - ((v - lo) / (hi - lo || 1)) * (H - 10));
  const path = (vs: number[]) => vs.map((v, i) => `${i ? "L" : "M"} ${x(i)} ${y(v)}`).join(" ");
  const area = gap && series[1] ? `${path(series[0].values)} L ${[...series[1].values].map((v, i) => ({ v, i })).reverse().map(({ v, i }) => `${x(i)} ${y(v)}`).join(" L ")} Z` : null;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="shrink-0 overflow-visible">
      {area ? <path d={area} fill={CHART.gapFill} opacity={CHART.gapOpacity} /> : null}
      {series.map((sr) => (
        <path key={sr.end} d={path(sr.values)} fill="none" stroke={sr.colour} strokeWidth={CHART.lineWidth} strokeDasharray={sr.dashed ? "4 3" : undefined} />
      ))}
      {series.map((sr) => {
        const yy = y(sr.values[n - 1]);
        const top = series.every((o) => y(o.values[n - 1]) >= yy);
        return (
          <text key={`l-${sr.end}`} x={PW + 4} y={top ? Math.max(9, Math.min(yy, H - 14) - 2) : Math.min(H - 1, Math.max(yy, 14) + 10)} fontSize={10} fontWeight={600} fill={sr.colour}>
            {sr.end}
          </text>
        );
      })}
    </svg>
  );
}

const O3_ORDER = ["red", "amber", "projected", "unconfirmed", "within"] as const;
const OUTCOME_SHORT: Record<string, string> = { "Products & services": "Products", "Price & value": "Price", "Consumer understanding": "Understanding", "Consumer support": "Support" };

/** The mini visual and one value line for each objective. */
function ObjectiveBody({ id }: { id: ObjId }) {
  if (id === "O1") {
    const plan = MORTGAGE_YTD.map((_, i) => mortgagePlanAt(i + 1));
    const planNow = plan[plan.length - 1];
    return (
      <>
        <MiniLines
          label={`Cumulative lending Jan to Sep: ${fmt.gbpBn(FIG.mortgages.lentBn)} against plan pace ${fmt.gbpBn(planNow)}`}
          series={[
            { values: MORTGAGE_YTD, colour: CHART.measure, end: fmt.gbpBn(FIG.mortgages.lentBn) },
            { values: plan, colour: CHART.comparison, dashed: true, end: `Plan ${fmt.gbpBn(planNow)}` },
          ]}
        />
        <span className="text-xs tabular-nums text-slate-600">{`${fmt.gbpBn(FIG.mortgages.lentBn)} of ${fmt.gbpBn(FIG.mortgages.planBn)} · ${fmt.gbpBn(planNow - FIG.mortgages.lentBn)} behind pace`}</span>
      </>
    );
  }
  if (id === "O2") {
    const idx = (a: number[]) => a.map((v) => Math.round((v / a[0]) * 1000) / 10);
    const m = idx(CAPACITY.membersM);
    const h = idx(CAPACITY.handlers);
    const pct = (a: number[]) => `+${Math.round(a[a.length - 1] - 100)}%`;
    return (
      <>
        <MiniLines
          gap
          label={`Members and qualified handlers since ${CAPACITY.quarters[0]}, indexed`}
          series={[
            { values: m, colour: CHART.measure, end: `Members ${pct(m)}` },
            { values: h, colour: CHART.comparison, end: `Handlers ${pct(h)}` },
          ]}
        />
        <span className="text-xs tabular-nums text-slate-600">{`+${fmt.gbpBn(FIG.savings.balancesBn)} vs +${fmt.gbpBn(FIG.savings.planBn)} plan · checks not keeping pace`}</span>
      </>
    );
  }
  if (id === "O3") {
    const linked = MEASURES.filter((x) => x.objectives.includes("O3")).sort((a, b) => O3_ORDER.indexOf(a.status) - O3_ORDER.indexOf(b.status) || a.num - b.num);
    const word = { red: "red", amber: "amber", projected: "heading", unconfirmed: "unconfirmed", within: "within" } as const;
    const counts = O3_ORDER.map((st) => [st, linked.filter((x) => x.status === st).length] as const).filter(([, n]) => n);
    return (
      <>
        <span className="flex h-10 items-center gap-1" role="img" aria-label={linked.map((x) => `${x.name}: ${STATUS_WORD[x.status]}`).join("; ")}>
          {linked.map((x) => (
            <span key={x.id} title={x.name} className={`h-5 flex-1 rounded-[2px] ${CELL[x.status]}`} />
          ))}
        </span>
        <span className="text-xs tabular-nums text-slate-600">{counts.map(([st, n]) => `${n} ${word[st]}`).join(" · ")}</span>
      </>
    );
  }
  const o = FIG.outcomes;
  return (
    <>
      <span className="flex h-10 items-start justify-between gap-1 pt-1" role="img" aria-label={o.map((x) => `${x.name}: ${x.status}`).join("; ")}>
        {o.map((x) => (
          <span key={x.name} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={x.name}>
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-bold ${x.status === "amber" ? "border-[#B45309] bg-[#FEF3C7] text-[#B45309]" : "border-[#15803D] bg-[#DCFCE7] text-[#15803D]"}`}>{x.status === "amber" ? "!" : "✓"}</span>
            <span className="truncate text-[10px] text-slate-500">{OUTCOME_SHORT[x.name] ?? x.name}</span>
          </span>
        ))}
      </span>
      <span className="text-xs tabular-nums text-slate-600">{`${o.filter((x) => x.status === "amber").length} of ${o.length} outcomes amber`}</span>
    </>
  );
}

function Scorecard() {
  const { state, dispatch } = useStore();
  useFigures(["f:mortgage-growth", "f:savings-growth", "f:cd-outcomes"]);
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Strategy scorecard">
      {OBJECTIVE_LIST.map((o) => {
        const st = objectiveStatus(o.id);
        const on = state.filter === o.id;
        return (
          <div key={o.id} className={`flex h-24 flex-col justify-between rounded-lg border bg-white p-3 ${on ? "border-indigo-400 ring-1 ring-indigo-200" : "border-slate-200"} ${state.filter && !on ? "opacity-60" : ""}`}>
            <span className="flex items-center justify-between gap-2">
              <button type="button" aria-pressed={on} onClick={() => dispatch({ type: "SET_FILTER", objective: on ? null : o.id })} className={`flex items-center gap-1.5 rounded text-left text-[13px] font-semibold leading-tight text-slate-900 hover:underline ${focus}`}>
                {o.short}
              </button>
              <Pill tone={OBJ_TONE[st]} label={OBJ_WORD[st]} />
            </span>
            <ObjectiveBody id={o.id} />
          </div>
        );
      })}
    </div>
  );
}

/** Rows share the card's height, so stacked cards end level with no empty space. */
const FILL = "[&>button]:flex [&>button]:flex-1 [&>button>span]:w-full";

/* ── Outside appetite ────────────────────────────────────────────────── */

const ORDER: MeasureStatus[] = ["red", "amber", "projected", "unconfirmed"];
const TIER_TAG = { top: "Top", emerging: "Emerging", obligatory: "Level 0" } as const;

function OutsideAppetite() {
  const { open } = useDrawer();
  const go = useGo();
  const linked = useFilteredMeasures();
  const rows = linked.filter((m) => m.status !== "within").sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || a.num - b.num);
  const within = linked.length - rows.length;
  useFigures(rows.map((m) => `m:${m.id}`));
  return (
    <Card title="Outside appetite">
      {rows.map((m) => (
        <button key={m.id} type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`} title={m.name}>
          <span className={`grid min-h-8 grid-cols-[64px_minmax(0,1fr)_auto_minmax(0,96px)_auto] items-center gap-x-3 border-t border-slate-100 text-[13px] leading-tight ${rowRail(m.status === "red" ? "red" : m.status === "amber" ? "amber" : undefined)}`}>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{TIER_TAG[m.tier]}</span>
            <span className="truncate font-semibold text-slate-900">{SHORT_NAME[m.id] ?? m.name}</span>
            <b className="whitespace-nowrap font-semibold tabular-nums text-slate-900">{SHORT_VALUE[m.id] ?? m.short ?? m.value}</b>
            <span className="truncate text-xs text-slate-500">{limitText(m)}</span>
            <StatusPill status={m.status} />
          </span>
        </button>
      ))}
      {within ? (
        <button type="button" onClick={() => go("appetite")} className={`flex min-h-8 w-full items-center border-t border-slate-100 text-left text-[13px] font-semibold text-indigo-700 hover:bg-slate-50 ${focus}`}>
          {within} within appetite ›
        </button>
      ) : null}
      {rows.length === 0 ? <p className="border-t border-slate-100 py-2 text-xs text-slate-500">None outside appetite for this objective</p> : null}
    </Card>
  );
}

/* ── Board decisions, telling the regulator ──────────────────────────── */

const VERB_TONE = { Tighten: "amber", Loosen: "green", Restore: "grey" } as const;

function BoardDecisions() {
  const { open } = useDrawer();
  useFigures(BOARD_CALLS.map((c) => `call:${c.id}`));
  return (
    <Card title="Board decisions" className={FILL}>
      {BOARD_CALLS.map((c) => {
        const verb = c.verb.split(" ")[0].replace("?", "") as keyof typeof VERB_TONE;
        return (
          <button key={c.id} type="button" onClick={(e) => open(`call:${c.id}`, e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`} title={`${c.verb} ${c.title}`}>
            <span className="grid min-h-8 grid-cols-[76px_minmax(0,1fr)_auto_52px] items-center gap-x-3 border-t border-slate-100 text-[13px] leading-tight">
              <span>
                <Pill tone={VERB_TONE[verb] ?? "grey"} label={verb} />
              </span>
              <span className="truncate font-semibold text-slate-900">{CALL_SHORT[c.id] ?? c.title}</span>
              <span className="text-xs text-slate-500">{c.decider === "Board" ? "Board" : "Chair"}</span>
              <b className="text-right text-xs font-semibold tabular-nums text-slate-900">{c.due}</b>
            </span>
          </button>
        );
      })}
    </Card>
  );
}

const ROUTE_LABEL: [RegExp, string][] = [
  [/^FCA/, "FCA"],
  [/^PRA/, "PRA"],
  [/Suspicious/, "SAR"],
  [/Conduct rule/, "Conduct"],
];

function TellRegulator() {
  const { open } = useDrawer();
  const go = useGo();
  useFigures(["f:routes"]);
  return (
    <Card
      title="Tell the regulator?"
      className={FILL}
      right={
        <button type="button" onClick={() => go("obligatory")} className={`rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
          View all ›
        </button>
      }
    >
      {REPORTABLE_EVENTS.map((e) => {
        const rs = ROUTES.filter((r) => r.eventId === e.id);
        const decided = rs.filter((r) => r.status === "decided").length;
        return (
          <button key={e.id} type="button" onClick={(ev) => open(`event:${e.id}`, ev.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`} title={e.event}>
            <span className={`grid min-h-8 grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 border-t border-slate-100 text-[13px] leading-tight ${rowRail(e.breached ? "red" : undefined)}`}>
              <span className="truncate font-semibold text-slate-900">{e.event.split(",")[0]}</span>
              <span className="whitespace-nowrap text-xs text-slate-600" aria-label={rs.map((r) => `${r.name}: ${r.status}`).join("; ")}>
                {rs.map((r) => `${ROUTE_LABEL.find(([re]) => re.test(r.name))?.[1] ?? r.name} ${r.status === "decided" ? "●" : "◐"}`).join("  ")}
              </span>
              <b className="whitespace-nowrap text-xs font-semibold tabular-nums text-slate-900">{`${decided} of ${rs.length} decided`}</b>
              <span className="whitespace-nowrap text-xs text-slate-500">{e.decider}</span>
            </span>
          </button>
        );
      })}
    </Card>
  );
}

/* ── Since last board, ownership ─────────────────────────────────────── */

function SinceLastBoard() {
  const { open } = useDrawer();
  return (
    <Card title="Since last board" className={FILL}>
      {SINCE_LAST_BOARD.map((e) => (
        <button key={e.text} type="button" onClick={(ev) => open(e.drawer, ev.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
          <span className={`grid min-h-8 grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 text-[13px] leading-tight ${rowRail(e.rail === "grey" ? undefined : e.rail)}`}>
            <b className="font-semibold tabular-nums text-slate-900">{e.date}</b>
            <span className="text-slate-800">{e.text}</span>
            {e.ai ? <AiTag label="AI" /> : <span />}
          </span>
        </button>
      ))}
    </Card>
  );
}

function Ownership() {
  const go = useGo();
  const owners = ownerRows([], {});
  const notAttested = owners.filter((o) => o.attest !== "attested" && o.attest !== "none").length;
  const j = journeysWithoutOwner();
  const first = issuesFound().firstPct;
  useFigures(["f:attest-month", "f:journeys", "f:issues-first"]);
  const rows: { label: string; value: string; tone?: "amber" }[] = [
    { label: "Owners not attested this month", value: `${notAttested} of ${owners.length}`, tone: notAttested ? "amber" : undefined },
    { label: "Journeys without a risk owner", value: `${j.n} of ${j.of}`, tone: j.n ? "amber" : undefined },
    { label: "Issues found by first line", value: `${first}%` },
  ];
  return (
    <Card title="Ownership" className={FILL}>
      {rows.map((r) => (
        <button key={r.label} type="button" onClick={() => go("accountability")} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
          <span className={`grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 text-[13px] leading-tight ${rowRail(r.tone)}`}>
            <span className="text-slate-800">{r.label}</span>
            <b className="font-semibold tabular-nums text-slate-900">{r.value}</b>
          </span>
        </button>
      ))}
    </Card>
  );
}

/** Chair's Committee tab: the three calls with the decider and date. */
function BoardCalls() {
  const { open } = useDrawer();
  useFigures(BOARD_CALLS.map((c) => `call:${c.id}`));
  return (
    <Card title="Board calls">
      {BOARD_CALLS.map((c) => (
        <button key={c.id} type="button" onClick={(e) => open(`call:${c.id}`, e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`} title={`${c.verb} ${c.title}`}>
          <span className="grid min-h-9 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-slate-100 text-[13px] leading-tight">
            <span className="truncate font-semibold text-slate-900">{CALL_SHORT[c.id] ?? c.title}</span>
            <span className="whitespace-nowrap text-xs tabular-nums text-slate-500">{c.decider === "Board" ? `Board · ${c.due}` : `Chair · ${c.due}`}</span>
          </span>
        </button>
      ))}
    </Card>
  );
}

export const OVERVIEW_SECTIONS = {
  O_SCORECARD: Scorecard,
  O_OUTSIDE: OutsideAppetite,
  O_DECISIONS: BoardDecisions,
  O_TELL: TellRegulator,
  O_OWNERSHIP: Ownership,
  O_CALLS: BoardCalls,
  O_SINCE: SinceLastBoard,
};

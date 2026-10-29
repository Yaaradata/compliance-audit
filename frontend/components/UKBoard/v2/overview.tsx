"use client";

/**
 * UK Board v2 — Board member Overview: a one-screen summary at 1440×900 with no scrolling.
 * Objective cards (mini visual + one value line) → one-line posture strip → Top risks, Obligatory
 * and Emerging rows on one line each, with board calls → regulator exposure and since last board.
 * Sources sit in each card's ⓘ tooltip. The posture strip and board calls here are Board-only
 * versions; the Chair's Committee tab keeps its own. Figures come from lib/ukboard/v2/boardStore.ts.
 */
import {
  attestationThisMonth,
  BOARD_CALLS,
  FIG,
  fmt,
  MORTGAGE_YTD,
  mortgagePlanAt,
  measuresByTier,
  MEASURES,
  newMeasures,
  OBJ_WORD,
  OBJECTIVE_LIST,
  objectiveStatus,
  rollupTotals,
  SINCE_LAST_BOARD,
  STATUS_ORDER,
  STATUS_WORD,
  statusChanges,
  TENSION_LIST,
  thresholdCells,
  TIER_INFO,
  type Measure,
  type ObjId,
  type Tier,
} from "@/lib/ukboard/v2/boardStore";
import { useFilteredMeasures } from "./appetite";
import { useDrawer } from "./drawerContext";
import { CAPACITY } from "@/lib/ukboard/v1/data";
import { CHART } from "./boardChartTheme";
import { Card, InfoTip, LineItem, rowRail, SectionSource, StatusPill, useFigures } from "./present";
import { useStore } from "./store";
import { AiTag, focus, Pill } from "./ui";
import { EventRouteMatrix, StatusStrip } from "./visuals";

const POSTURE_SENTENCE = "Mortgages can grow; savings outrun crime checks.";

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
const CALL_SHORT: Record<string, string> = { D1: "Savings growth vs checks", D2: "High-LTV limit", D3: "Removed pack item" };
/** Tension pairs in a few words (the full pair is on Strategy & appetite). */
const TENSION_SHORT: Record<string, string> = {
  T1: "Savings growth vs alert queue",
  T2: "Fast onboarding vs pre-transaction checks",
  T3: "First-time buyers vs high-LTV limit",
  T4: "Change freeze vs critical patching",
};

function useGo() {
  const { dispatch } = useStore();
  return (tab: string) => dispatch({ type: "SET_TAB", tab });
}

/* ── Strategy scorecard ──────────────────────────────────────────────── */

const OBJ_TONE = { on_track: "green", at_risk: "amber", off_track: "red" } as const;

/** The worst linked measure, which drives the objective's status. */
const driverOf = (id: ObjId) => [...MEASURES.filter((m) => m.objectives.includes(id))].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))[0];

/** Mini line chart, 160×40, no axes, labels at the line ends; optional amber gap between two lines. */
function MiniLines({ series, gap, label }: { series: { values: number[]; colour: string; dashed?: boolean; end: string; above?: boolean }[]; gap?: boolean; label: string }) {
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
        <path key={sr.end} d={path(sr.values)} fill="none" stroke={sr.colour} strokeWidth={1.75} strokeDasharray={sr.dashed ? "4 3" : undefined} />
      ))}
      {series.map((sr) => {
        const yy = y(sr.values[n - 1]);
        return (
          <text key={`l-${sr.end}`} x={PW + 4} y={Math.min(H - 1, Math.max(8, yy + (sr.above ? -3 : 9)))} fontSize={10} fontWeight={600} fill={sr.colour}>
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
            { values: plan, colour: CHART.comparison, dashed: true, end: `Plan ${fmt.gbpBn(planNow)}`, above: true },
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
            { values: m, colour: CHART.measure, end: `Members ${pct(m)}`, above: true },
            { values: h, colour: CHART.comparison, end: `Handlers ${pct(h)}` },
          ]}
        />
        <span className="text-xs tabular-nums text-slate-600">{`+${fmt.gbpBn(FIG.savings.balancesBn)} vs +${fmt.gbpBn(FIG.savings.planBn)} plan · checks not keeping pace`}</span>
      </>
    );
  }
  if (id === "O3") {
    const linked = MEASURES.filter((x) => x.objectives.includes("O3")).sort((a, b) => O3_ORDER.indexOf(a.status) - O3_ORDER.indexOf(b.status) || a.num - b.num);
    const cell = { red: "bg-red-500", amber: "bg-amber-500", projected: "border-2 border-amber-500 bg-white", unconfirmed: "border border-dashed border-slate-400 bg-white", within: "bg-emerald-500" } as const;
    const word = { red: "red", amber: "amber", projected: "heading", unconfirmed: "unconfirmed", within: "within" } as const;
    const counts = O3_ORDER.map((st) => [st, linked.filter((x) => x.status === st).length] as const).filter(([, n]) => n);
    return (
      <>
        <span className="flex h-10 items-center gap-1" role="img" aria-label={linked.map((x) => `${x.name}: ${STATUS_WORD[x.status]}`).join("; ")}>
          {linked.map((x) => (
            <span key={x.id} title={x.name} className={`h-5 flex-1 rounded-sm ${cell[x.status]}`} />
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
            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${x.status === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}>{x.status === "amber" ? "" : "✓"}</span>
            <span className="truncate text-[10px] text-slate-500">{OUTCOME_SHORT[x.name] ?? x.name}</span>
          </span>
        ))}
      </span>
      <span className="text-xs tabular-nums text-slate-600">{`${o.filter((x) => x.status === "amber").length} of ${o.length} outcomes amber`}</span>
    </>
  );
}

const OBJ_SOURCE = { O1: { ids: ["LEN"] }, O2: { ids: ["SAV", "FCR"] }, O3: { ids: ["RAS"] }, O4: { ids: ["CUS"] } } as const;

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
          <div key={o.id} className={`flex h-24 flex-col justify-between rounded-lg border bg-white p-3 ${on ? "border-indigo-400 ring-1 ring-indigo-200" : "border-slate-200"} ${state.filter && !on ? "opacity-60" : ""}`}>
            <span className="flex items-center justify-between gap-2">
              <button type="button" aria-pressed={on} onClick={() => dispatch({ type: "SET_FILTER", objective: on ? null : o.id })} className={`flex items-center gap-1.5 rounded text-left text-[13px] font-semibold leading-tight text-slate-900 hover:underline ${focus}`}>
                {o.short}
              </button>
              <span className="flex items-center gap-1.5">
                <InfoTip src={{ ids: [...OBJ_SOURCE[o.id].ids] }} />
                <span title={`Driver: ${d.name} (${STATUS_WORD[d.status].toLowerCase()})`}>
                  <Pill tone={OBJ_TONE[st]} label={OBJ_WORD[st]} />
                </span>
              </span>
            </span>
            <ObjectiveBody id={o.id} />
          </div>
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
      <span className="basis-full">
        <SectionSource />
      </span>
    </section>
  );
}

/** Board Overview: the posture strip on one line; the source and projection note sit in the ⓘ. */
function PostureLine() {
  const r = rollupTotals();
  const a = attestationThisMonth();
  useFigures(["f:posture", "f:rollup", "f:attest-month"]);
  return (
    <section data-tinted="posture" className="flex flex-nowrap items-center gap-4 overflow-hidden whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
      <Pill tone="amber" label="Amber" />
      <span className="text-[13px] text-slate-800">{POSTURE_SENTENCE}</span>
      <StatusStrip />
      <span className="text-xs tabular-nums text-slate-700">{`${r.below} below · ${r.offTrack} off track`}</span>
      <span className="rounded border border-amber-200 bg-white px-1.5 py-0.5 text-[11px] tabular-nums text-slate-700">
        <b className="text-slate-900">{`${a.attested} of ${a.total}`}</b> attested
      </span>
      <span className="ml-auto">
        <PostureTip />
      </span>
    </section>
  );
}
function PostureTip() {
  return <InfoTip src={{ ids: ["RAS"], note: "heading for amber is a projection: 6-month trend" }} />;
}

/* ── Tier columns ────────────────────────────────────────────────────── */

function TierRow({ m }: { m: Measure }) {
  const { open } = useDrawer();
  const rail = m.status === "red" ? "red" : m.status === "amber" ? "amber" : undefined;
  const value = SHORT_VALUE[m.id] ?? m.short ?? m.value;
  return (
    <button type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`} title={m.name}>
      <span className={`grid min-h-9 grid-cols-[minmax(0,1fr)_auto_minmax(0,auto)_auto] items-center gap-x-2 border-t border-slate-100 text-[13px] leading-tight ${rowRail(rail)}`}>
        <span className="truncate font-semibold text-slate-900">{SHORT_NAME[m.id] ?? m.name}</span>
        <b className="whitespace-nowrap font-semibold tabular-nums text-slate-900">{value}</b>
        <span className="max-w-[96px] truncate text-xs text-slate-500" title={m.comparator}>
          {limitText(m)}
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
    <Card title={tier === "obligatory" ? "Obligatory · Level 0" : TIER_INFO[tier].label} >
      {shown.map((m) => (
        <TierRow key={m.id} m={m} />
      ))}
      {within ? (
        <button type="button" onClick={() => go("appetite")} className={`flex min-h-9 w-full items-center border-t border-slate-100 text-left text-[13px] text-slate-600 hover:bg-slate-50 ${focus}`}>
          {within} within <span className="ml-1 font-semibold text-indigo-700">›</span>
        </button>
      ) : null}
      {rows.length === 0 ? <p className="border-t border-slate-100 py-2 text-xs text-slate-500">None linked to this objective</p> : null}
    </Card>
  );
}

/* ── Calls, exposure, tensions, since last board ─────────────────────── */

function BoardCalls() {
  const { open } = useDrawer();
  useFigures(BOARD_CALLS.map((c) => `call:${c.id}`));
  return (
    <Card title="Board calls" right={<span className="text-xs text-slate-500">Open a call for options and effects</span>} className="h-full">
      {BOARD_CALLS.map((c) => (
        <LineItem key={c.id} text={`${c.verb} ${c.title}`} detail={c.decider === "Board" ? c.due : `Chair · ${c.due}`} onClick={(el) => open(`call:${c.id}`, el)} right={<span className="text-indigo-700">›</span>} />
      ))}
    </Card>
  );
}

/** Board Overview: three calls, one line each; the call opens the decision panel. */
function BoardCallsLine() {
  const { open } = useDrawer();
  useFigures(BOARD_CALLS.map((c) => `call:${c.id}`));
  return (
    <Card title="Board calls">
      {BOARD_CALLS.map((c) => (
        <button key={c.id} type="button" onClick={(e) => open(`call:${c.id}`, e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`} title={`${c.verb} ${c.title}`}>
          <span className="grid min-h-9 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 border-t border-slate-100 text-[13px] leading-tight">
            <span className="truncate font-semibold text-slate-900">{CALL_SHORT[c.id] ?? c.title}</span>
            <b className="whitespace-nowrap text-xs font-semibold tabular-nums text-slate-900">{c.due}</b>
          </span>
        </button>
      ))}
    </Card>
  );
}

function RegulatorExposure() {
  useFigures(["f:routes"]);
  return (
    <Card title="Regulator exposure">
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
        <button type="button" onClick={() => go("appetite")} className={`flex min-h-9 w-full items-center border-t border-slate-100 text-left text-[13px] text-slate-600 hover:bg-slate-50 ${focus}`}>
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
    <Card title="Since last board">
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
  O_CALLS_B: BoardCallsLine,
  O_POSTURE_B: PostureLine,
  O_EXPOSURE: RegulatorExposure,
  O_TENSIONS: Tensions,
  O_SINCE: SinceLastBoard,
};

"use client";

/**
 * UK Board v2 — Board member Top risks and Emerging risks.
 * Top risks: the six top-tier board measures, credit quality, liquidity and
 * capital, cyber exercises, the alert-queue capacity chart (the only line chart on the tab) and the
 * financial crime Level 2 metrics. Emerging risks: measures #7 and #8, the
 * detection-time chart with amber trigger and appetite limit lines, attack signals ✦, the
 * not-yet-measured register and the regulatory horizon.
 * Every figure comes from lib/ukboard/v2/boardStore.ts. Nothing here changes a limit or notifies
 * anyone: "Propose a measure" only drafts a proposal to the named owner (local state).
 */
import { useState } from "react";
import { CAPACITY } from "@/lib/ukboard/v1/data";
import {
  ATTACK_SIGNALS,
  CYBER_EXERCISES,
  DETECTION_SERIES,
  EMERGING_UNMEASURED,
  FIG,
  fmt,
  historyOf,
  l2Visible,
  measure,
  SMF_CERT,
  thresholdCells,
  timeToThreshold,
  type Measure,
  type MeasureStatus,
  type Tier,
} from "@/lib/ukboard/v2/boardStore";
import { RollupChip, useFilteredMeasures } from "./appetite";
import { useDrawer } from "./drawerContext";
import LineChart from "./LineChart";
import { Card, ChartCard, DeltaMark, rowRail, StatRow, StatusPill, Table, useFigures } from "./present";
import { Sparkline } from "./visuals";
import { useStore } from "./store";
import { AiTag, btn, focus, Pill, type Tone } from "./ui";

/* ── Seed data (new, risks tab only) ─────────────────────────────────── */

/** Regulatory horizon items beyond the incident rules and SMF certification (already in the store). */
const HORIZON_EXTRA: { date: string; text: string; tag: string }[] = [{ date: "Jul 2027", text: "Consumer Duty annual board report", tag: "FCA" }];

/* ── Shared helpers ──────────────────────────────────────────────────── */

const railOf = (s: MeasureStatus): Tone | undefined => (s === "red" ? "red" : s === "amber" ? "amber" : undefined);
const TYPE_WORD = { leading: "Leading", lagging: "Lagging" } as const;
const useTier = (tier: Tier) => useFilteredMeasures().filter((m) => m.tier === tier).sort((a, b) => a.num - b.num);

function MeasureName({ m }: { m: Measure }) {
  return <b className={m.status === "within" ? "font-normal text-slate-600" : "font-semibold text-slate-900"}>{m.name}</b>;
}

/* ── Top risks ───────────────────────────────────────────────────────── */

function TopRiskCard({ m }: { m: Measure }) {
  const { state } = useStore();
  const { open } = useDrawer();
  const h = historyOf(m.id);
  const rows = l2Visible(m, state.persona).slice(0, 3);
  const hidden = m.l2.length - l2Visible(m, state.persona).length;
  const rail = m.status === "red" ? "border-l-[3px] border-l-red-500" : m.status === "amber" ? "border-l-[3px] border-l-amber-500" : "";
  return (
    <section className={`flex h-full flex-col rounded-lg border border-slate-200 bg-white px-4 pb-3 pt-3 ${rail}`}>
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold leading-snug text-slate-900">{m.name}</h2>
        <StatusPill status={m.status} />
      </div>
      <p className="text-xs text-slate-500">Risk owner: {m.owner}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <b className="text-2xl font-semibold leading-7 tabular-nums text-slate-900">{m.short ?? m.value}</b>
        {h ? <Sparkline values={h.values} amber={m.amber} label={`${m.name}, last ${h.span}`} /> : <span className="text-xs text-slate-400">History from Q3 2026</span>}
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <DeltaMark d={m.delta} /> vs Q2
        </span>
      </div>
      <p className="mt-1.5 truncate text-xs text-slate-500" title={m.statement}>
        {m.statement}
      </p>
      <div className="mt-2 flex-1">
        {rows.map((x) => (
          <StatRow key={x.name} label={x.name} value={x.value} comparator={x.threshold} rail={railOf(x.status)} />
        ))}
        {hidden > 0 ? <p className="border-t border-slate-100 py-1.5 text-xs text-slate-500">{`${hidden} Level 2 within appetite`}</p> : null}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <RollupChip m={m} />
        <button type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
          Open ›
        </button>
      </div>
    </section>
  );
}

/** The six top risks as equal-height cards in a 3 × 2 grid. */
function TopRiskCards() {
  const rows = useTier("top");
  useFigures(rows.map((m) => `m:${m.id}`));
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" data-chart="sparklines">
      {rows.map((m) => (
        <TopRiskCard key={m.id} m={m} />
      ))}
    </div>
  );
}

/** Last and next exercise on one short line (a mini timeline inside the cyber card). */
function ExerciseLine({ last, next }: { last: { label: string; value: string; note: string }; next: { label: string; value: string; note: string } }) {
  return (
    <div className="border-t border-slate-100 pt-2.5" role="img" aria-label={`${last.label} ${last.value}; ${next.label} ${next.value}`}>
      <div className="relative mx-2 h-px bg-slate-300">
        <span className="absolute -top-1 left-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-slate-900" />
        <span className="absolute -top-1 right-0 h-2.5 w-2.5 translate-x-1/2 rounded-full border border-slate-900 bg-white" />
      </div>
      <div className="mt-2 flex justify-between text-xs leading-tight">
        <span>
          <b className="block font-semibold text-slate-900">{last.value}</b>
          <span className="text-slate-500">Last red team · {last.note}</span>
        </span>
        <span className="text-right">
          <b className="block font-semibold text-slate-900">{next.value}</b>
          <span className="text-slate-500">Next · {next.note}</span>
        </span>
      </div>
    </div>
  );
}

function CyberExercises() {
  const { open } = useDrawer();
  useFigures(["f:cyber-exercises"]);
  return (
    <Card title="Cyber: red team and blue team" className="h-full">
      {CYBER_EXERCISES.filter((x) => !/exercise$/i.test(x.label)).map((x) => (
        <StatRow key={x.label} label={x.label} value={x.value} comparator={x.note} onClick={(el) => open("metric:u-secfind", el)} />
      ))}
      <ExerciseLine last={CYBER_EXERCISES[0]} next={CYBER_EXERCISES[2]} />
    </Card>
  );
}

function CapacityChart() {
  const c = FIG.capacity;
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  const members = base(CAPACITY.membersM);
  const handlers = base(CAPACITY.handlers);
  useFigures(["f:capacity-chart", "f:capacity-restore"]);
  return (
    <ChartCard id="capacity" title="Alert-queue capacity" right={<span className="text-xs text-slate-500">{`Indexed to ${CAPACITY.quarters[0]}`}</span>}>
      <LineChart
        title="Members and qualified handlers, indexed"
        height={180}
        directLabels
        series={[
          { name: "Members", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: members[i] })) },
          { name: "Handlers", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: handlers[i] })), dashed: true },
        ]}
      />
      <StatRow label="Handlers to restore the ratio" value={`+${c.restoreNeeded}`} comparator={`about ${fmt.gbpM(c.restoreCostM)} a year · ${c.handlers} today`} />
    </ChartCard>
  );
}

/* ── Emerging risks ──────────────────────────────────────────────────── */

function EmergingTable() {
  const { open } = useDrawer();
  const rows = useTier("emerging");
  useFigures(rows.map((m) => `m:${m.id}`));
  return (
    <Table
      title="Emerging risks"
      right={<span className="text-xs text-slate-500">Forward-looking, wider ranges</span>}
      cols="grid-cols-[minmax(150px,1.7fr)_minmax(84px,0.8fr)_64px_64px_minmax(100px,0.9fr)_64px_minmax(96px,0.9fr)_minmax(96px,1fr)_112px]"
      head={["Board measure", "Value", "Amber trigger", "Appetite limit", "To threshold", "Type", "Stance", "Risk owner", "Status"]}
      rightCols={[2, 3, 8]}
      rows={rows.map((m) => {
        const t = thresholdCells(m);
        return {
          key: m.id,
          rail: railOf(m.status),
          onClick: (el: HTMLElement) => open(`metric:${m.id}`, el),
          cells: [
            <span key="n" className="flex flex-wrap items-center gap-1.5">
              <MeasureName m={m} />
              {m.isNew ? <Pill tone="grey" outline label="New" /> : null}
            </span>,
            <span key="v" className="tabular-nums text-slate-900">{m.short ?? m.value}</span>,
            <span key="a" className="text-xs">{t.amber}</span>,
            <span key="l" className="text-xs">{t.limit}</span>,
            <span key="t" className="text-xs">{timeToThreshold(m)}</span>,
            <span key="y" className="text-xs">{TYPE_WORD[m.type]}</span>,
            <span key="st" className="text-xs">{m.stance === "new" ? "New · appetite to set" : m.stance === "hold" ? "Hold" : m.stance === "tighten" ? "Tighten" : "Loosen"}</span>,
            <span key="o" className="text-xs text-slate-500">{m.owner}</span>,
            <StatusPill key="s" status={m.status} />,
          ],
        };
      })}
    />
  );
}

function DetectionChart() {
  const m = measure("u-detect");
  const u = m.unit ?? "";
  useFigures(["f:detection-series"]);
  return (
    <ChartCard id="detection" title="Time to detect a coordinated automated attack" right={<span className="text-xs text-slate-500">Monthly median</span>}>
      <LineChart
        title="Median detection time, minutes"
        height={180}
        suffix={u}
        series={[{ name: "Median detection time", points: DETECTION_SERIES }]}
        thresholds={[
          { value: m.amber!, label: `Amber trigger ${m.amber}${u}`, tone: "amber" },
          { value: m.limit!, label: `Appetite limit ${m.limit}${u}`, tone: "red" },
        ]}
      />
    </ChartCard>
  );
}

function AttackSignals() {
  const { open } = useDrawer();
  useFigures(["f:attack-signals"]);
  return (
    <Card title="Attack signals" right={<AiTag label="Prepared by AI agent" />}>
      {ATTACK_SIGNALS.map((s) => (
        <StatRow key={s.label} label={s.label} value={s.value} comparator={s.note} onClick={(el) => open("metric:u-detect", el)} />
      ))}
    </Card>
  );
}

function NotYetMeasured() {
  const [drafted, setDrafted] = useState<string[]>([]);
  useFigures(["f:unmeasured"]);
  return (
    <Card title="Not yet measured" right={<span className="text-xs text-slate-500">{`${EMERGING_UNMEASURED.length} risks in the register without a board measure`}</span>}>
      {EMERGING_UNMEASURED.map((e) => {
        const done = drafted.includes(e.name);
        return (
          <div key={e.name} className={`flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-slate-100 py-1.5 text-[13px] leading-snug ${rowRail()}`}>
            <span className="min-w-0">
              <span className="text-slate-800">{e.name}</span>
              <span className="block text-xs text-slate-500">{`${e.why} · Risk owner: ${e.owner}`}</span>
            </span>
            {done ? (
              <span className="text-xs font-semibold text-slate-700" role="status">{`Proposal drafted for ${e.owner}`}</span>
            ) : (
              <button type="button" onClick={() => setDrafted((d) => [...d, e.name])} className={btn}>
                Propose a measure
              </button>
            )}
          </div>
        );
      })}
    </Card>
  );
}

function RegulatoryHorizon() {
  const { open } = useDrawer();
  useFigures(["f:horizon", "f:smf-cert"]);
  const items = [
    { date: SMF_CERT.next, text: "Next SMF certification", detail: `${SMF_CERT.evidence} of ${SMF_CERT.smfs} senior managers with evidence`, tag: "FCA · PRA", drawer: undefined as string | undefined },
    { date: FIG.dates.incidentRules, text: "Incident and third-party reporting rules", detail: undefined as string | undefined, tag: "FCA · PRA", drawer: "horizon" },
    ...HORIZON_EXTRA.map((h) => ({ ...h, detail: undefined as string | undefined, drawer: undefined as string | undefined })),
  ];
  return (
    <Card title="Regulatory horizon">
      {items.map((e) => {
        const row = (
          <span className={`grid min-h-9 grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${rowRail()}`}>
            <b className="whitespace-nowrap font-semibold tabular-nums text-slate-900">{e.date}</b>
            <span className="min-w-0 text-slate-800">
              {e.text}
              {e.detail ? <span className="block text-xs text-slate-500">{e.detail}</span> : null}
            </span>
            <span className="whitespace-nowrap rounded border border-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">{e.tag}</span>
          </span>
        );
        return e.drawer ? (
          <button key={e.text} type="button" onClick={(ev) => open(e.drawer!, ev.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
            {row}
          </button>
        ) : (
          <div key={e.text}>{row}</div>
        );
      })}
    </Card>
  );
}

export const RISK_SECTIONS = {
  R_CARDS: TopRiskCards,
  R_CYBER: CyberExercises,
  R_CAPACITY: CapacityChart,
  E_TABLE: EmergingTable,
  E_DETECTION: DetectionChart,
  E_SIGNALS: AttackSignals,
  E_UNMEASURED: NotYetMeasured,
  E_HORIZON: RegulatoryHorizon,
};

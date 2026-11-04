"use client";

/**
 * UK Board v2 — AI agents tab: tiles, findings, autonomy, roster, fixed rules and the tuning lab.
 * Agents prepare, draft, test and propose to an owner. They never decide, file, contact a
 * regulator or change a live limit. Chart budget for this tab: tuning bars only.
 */
import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { ACTIVITY, AGENTS, agentName, AUTONOMY_LABEL, AUTONOMY_ORDER, FINDINGS, FIXED_RULES, MODEL_OVERSIGHT, QUEUE, TUNING, type Autonomy } from "@/lib/ukboard/v2/agentsData";
import { agentFigures, ATTACK_SIGNALS, fmt, measure } from "@/lib/ukboard/v2/boardStore";
import { useDrawer } from "./drawerContext";
import { Card, EventList, FlowPill, KpiTile, StatRow, Table, useFigures, SectionSource } from "./present";
import { useStore } from "./store";
import { AutonomyLadder, TradeoffPlot } from "./visuals";
import { AiTag, btn, btnPrimary, focus, Pill } from "./ui";

/* ── Seed: Detection model (#7) scenario ─────────────────────────────── */

const signal = (label: string) => ATTACK_SIGNALS.find((s) => s.label === label)!;
const leadingNumber = (v: string) => Number(v.replace(/[^\d.]/g, ""));

/**
 * Seed for the second tuning-lab scenario: current detection rules vs the challenger model on the
 * parallel cohort, for board measure #7 (time to detect a coordinated automated attack).
 * Values come from ATTACK_SIGNALS and the u-detect measure; nothing is typed in twice.
 * - current: median detection time today (measure actual, minutes), false alerts as the baseline;
 * - challenger: median from "Challenger model median" (seconds), false-alert change from
 *   "Challenger false alerts" (per cent, parallel cohort);
 * - the time bars run to the appetite limit; the false-alert bars run to the challenger's level.
 * Proposing sends the challenger to the risk owner only. Nothing goes live without a named approver.
 */
export const DETECT_TRIAL = (() => {
  const m = measure("u-detect");
  const median = signal("Tested rule set median (backtest)");
  const falseAlerts = signal("Tested rule set false alerts (backtest)");
  const extraPct = leadingNumber(falseAlerts.value);
  return {
    measureId: m.id,
    num: m.num,
    owner: m.owner,
    cohort: falseAlerts.note,
    limitSec: (m.limit ?? 0) * 60,
    amberSec: (m.amber ?? 0) * 60,
    extraPct,
    options: [
      { id: "current", label: "Current rules", medianSec: (m.actual ?? 0) * 60, medianText: m.value, falseIndex: 100, falseText: "Baseline" },
      { id: "challenger", label: "Tested rule set (backtest)", medianSec: leadingNumber(median.value), medianText: median.value, falseIndex: 100 + extraPct, falseText: falseAlerts.value },
    ],
    recommended: "challenger",
  };
})();

/** Detection backtest as a trade-off: false alerts (right is worse) vs median time to detect (up is better). */
export function DetectionTradeoff() {
  const t = DETECT_TRIAL;
  const toMin = (sec: number) => Math.round((sec / 60) * 100) / 100;
  return (
    <TradeoffPlot
      points={t.options.map((o) => ({ id: o.id, label: o.label.replace(" (backtest)", ""), x: o.falseIndex - 100, y: toMin(o.medianSec), recommended: o.id === t.recommended, current: o.id === "current" }))}
      xMax={Math.max(10, t.extraPct * 1.5)}
      yMax={toMin(t.amberSec)}
      invertY
      xLabel="Extra false alerts, %"
      yLabel="Median detection"
      fmtX={(v) => (v ? `+${v}%` : "baseline")}
      fmtY={(v) => (v >= 1 ? `${v} min` : `${Math.round(v * 60)} sec`)}
    />
  );
}

/* ── Tiles and findings ──────────────────────────────────────────────── */

function AgentTiles() {
  const { state } = useStore();
  const a = agentFigures(QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft").length);
  useFigures(["f:agents"]);
  const tiles: [string, string, string][] = [
    ["Agents", fmt.n(a.agents), "on the roster"],
    ["Checks this week", fmt.n(a.checksThisWeek), "all agents"],
    ["Findings", fmt.n(a.findings), "this quarter"],
    ["Drafts with CRO", fmt.n(a.drafts), "waiting for a person"],
    ["Without approval", fmt.n(a.withoutApproval), "actions this quarter"],
    ["Pack preparation", `${a.packHours} h`, `was ${a.packHoursWas} h`],
  ];
  return (
    <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3 xl:grid-cols-6">
      {tiles.map(([l, v, c]) => (
        <KpiTile key={l} label={l} value={v} comparator={c} pill={<AiTag label="" />} />
      ))}
      <div className="col-span-full">
        <SectionSource />
      </div>
    </div>
  );
}

function AgentFindings() {
  const { open } = useDrawer();
  return (
    <Table
      title="Agent findings"
      right={<AiTag label="AI agent findings" />}
      cols="grid-cols-[minmax(220px,1.8fr)_minmax(140px,1fr)_72px_minmax(140px,1fr)]"
      head={["Finding", "Agent", "Date", "With"]}
      rows={FINDINGS.map((f) => ({
        key: f.finding,
        rail: f.tone === "red" ? "red" : f.tone === "amber" ? "amber" : undefined,
        onClick: (el) => open(f.drawer, el),
        cells: [
          f.finding,
          <AiTag key="a" label={agentName(f.agentId)} />,
          <span key="d" className="tabular-nums">
            {f.flagged === "this quarter" ? "Q3" : f.flagged}
          </span>,
          <span key="w" className="text-xs text-slate-500">
            {f.status}
          </span>,
        ],
      }))}
    />
  );
}

/* ── Autonomy, roster and rules ──────────────────────────────────────── */

function AgentAutonomy() {
  const { state, dispatch } = useStore();
  const chair = state.persona === "chair";
  const agents = AGENTS.map((a) => ({ id: a.id, name: a.name, level: state.session.autonomy[a.id] ?? a.autonomy }));
  return (
    <Card title="Agent autonomy" right={<span className="text-xs text-slate-500">{chair ? "Changes are drafted for committee" : "Set by Risk Committee"}</span>} className="h-full">
      <div className="border-t border-slate-100 pt-2.5">
        <AutonomyLadder
          agents={agents}
          renderChip={
            chair
              ? (a) => {
                  const proposed = state.session.autonomyProposals[a.id];
                  return (
                    <span className="block rounded border border-violet-200 bg-violet-50 px-1.5 py-1 text-[11px] font-semibold leading-snug text-violet-800">
                      ✦ {a.name}
                      <select
                        aria-label={`Change level for ${a.name}`}
                        value={proposed ?? ""}
                        onChange={(e) => dispatch({ type: "PROPOSE_AUTONOMY", agentId: a.id, level: e.target.value as Autonomy })}
                        className={`mt-1 block w-full rounded border border-violet-200 bg-white px-1 py-0.5 text-[11px] font-normal text-slate-700 ${focus}`}
                      >
                        <option value="" disabled>
                          {proposed ? `Proposed: ${AUTONOMY_LABEL[proposed]}` : "Change level"}
                        </option>
                        {AUTONOMY_ORDER.filter((lv) => lv !== a.level).map((lv) => (
                          <option key={lv} value={lv}>
                            Propose {AUTONOMY_LABEL[lv]}
                          </option>
                        ))}
                      </select>
                      {proposed ? <span className="mt-0.5 block font-normal text-violet-700">{`Drafted: ${AUTONOMY_LABEL[proposed]}`}</span> : null}
                    </span>
                  );
                }
              : undefined
          }
        />
      </div>
    </Card>
  );
}

const STATUS_FLOW: Record<string, [string, "green" | "amber" | "grey"]> = { running: ["Running", "green"], waiting: ["Waiting", "amber"], paused: ["Paused", "grey"] };

function AgentRoster() {
  const { open } = useDrawer();
  return (
    <Table
      title="Agent roster"
      right={<AiTag label={`${fmt.n(AGENTS.length)} agents`} />}
      cols="grid-cols-[minmax(150px,1fr)_minmax(180px,1.4fr)_minmax(150px,1fr)_96px]"
      head={["Agent", "Purpose", "Owner", "Status"]}
      rightCols={[3]}
      rows={AGENTS.map((a) => ({
        key: a.id,
        onClick: (el) => open(`agent:${a.id}`, el),
        cells: [
          <b key="n" className="font-semibold text-slate-900">
            {a.name}
          </b>,
          <span key="d" className="text-slate-700">
            {a.does}
          </span>,
          <span key="o" className="text-xs text-slate-500">
            {a.accountable}
          </span>,
          <Pill key="s" tone={STATUS_FLOW[a.status][1]} label={STATUS_FLOW[a.status][0]} />,
        ],
      }))}
    />
  );
}

function Rules() {
  return (
    <Card title="Agent rules" right={<AiTag />}>
      {FIXED_RULES.map((r) => (
        <span key={r} className="flex min-h-9 items-center gap-2 border-t border-slate-100 pl-[13px] text-[13px] text-slate-700">
          <Lock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          {r}
        </span>
      ))}
      <StatRow label="Models past validation" value={MODEL_OVERSIGHT.pastValidation.split(" models")[0]} comparator={`reviewed ${MODEL_OVERSIGHT.lastReview}`} />
    </Card>
  );
}

function Activity() {
  return <EventList title="Agent activity" right={<AiTag />} items={ACTIVITY.map((e) => ({ date: e.date.replace(" 2026", ""), text: `${agentName(e.agentId)}: ${e.line}`, tag: e.type.charAt(0) + e.type.slice(1).toLowerCase() }))} />;
}

/* ── Tuning lab: two scenarios ───────────────────────────────────────── */

type Scenario = "alerts" | "detect";
const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: "alerts", label: "Alert tuning" },
  { id: "detect", label: `Detection model (#${DETECT_TRIAL.num})` },
];

/** One option: a single headline number, an optional bar to the total, and short supporting lines. */
function OptionCard({ title, tag, value, unit, share, details, selected, onSelect }: { title: string; tag?: ReactNode; value: string; unit: string; share?: number; details: string[]; selected: boolean; onSelect?: () => void }) {
  const body = (
    <>
      <span className="flex min-h-5 flex-wrap items-center justify-between gap-1 text-xs font-semibold text-slate-900">
        {title}
        {tag}
      </span>
      <span className="mt-2 block text-2xl font-bold leading-none tabular-nums text-slate-900">
        {value} <span className="text-xs font-medium text-slate-500">{unit}</span>
      </span>
      {share !== undefined ? (
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <span className={`block h-full rounded-full ${selected ? "bg-indigo-600" : "bg-slate-400"}`} style={{ width: `${share * 100}%` }} />
        </span>
      ) : null}
      <span className="mt-2 block space-y-0.5 text-xs text-slate-600">
        {details.map((d) => (
          <span key={d} className="block">
            {d}
          </span>
        ))}
      </span>
    </>
  );
  const frame = `flex w-full flex-col justify-start rounded-lg border p-3 text-left ${selected ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500" : "border-slate-200 bg-white"}`;
  if (!onSelect) return <div className={frame}>{body}</div>;
  return (
    <button type="button" aria-pressed={selected} onClick={onSelect} className={`${frame} hover:border-indigo-300 ${focus}`}>
      {body}
    </button>
  );
}

function AlertScenario({ cro }: { cro: boolean }) {
  const { state, dispatch } = useStore();
  const [pick, setPick] = useState(TUNING.recommended);
  const proposed = state.session.tuningProposal;
  const chosen = proposed ?? (cro ? pick : null);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <p className="text-xs text-slate-500">{TUNING.proposal}</p>
        {cro ? (
          proposed ? (
            <FlowPill w="proposed" />
          ) : (
            <button type="button" onClick={() => dispatch({ type: "PROPOSE_TUNING", optionId: pick })} className={btnPrimary}>
              Propose option {pick}
            </button>
          )
        ) : null}
      </div>
      <div className="grid gap-2 pt-1 sm:grid-cols-3">
        {TUNING.options.map((o) => (
          <OptionCard
            key={o.id}
            title={`${o.id} · ${o.label}`}
            tag={o.id === TUNING.recommended ? <AiTag label="Recommended" /> : undefined}
            value={fmt.n(o.caught)}
            unit={`of ${fmt.n(TUNING.breaches)} caught`}
            share={o.caught / TUNING.breaches}
            details={[`+${fmt.n(o.extraAlerts)} alerts a month`, ...(o.capacity === "—" ? [] : [o.capacity])]}
            selected={chosen === o.id}
            onSelect={cro && !proposed ? () => setPick(o.id) : undefined}
          />
        ))}
      </div>
      <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
        {TUNING.test} · {proposed ? `Option ${proposed} with the Risk Committee` : "Proposals go to the Risk Committee"}
      </p>
    </>
  );
}

function DetectScenario({ cro, sent, onSend }: { cro: boolean; sent: boolean; onSend: () => void }) {
  const t = DETECT_TRIAL;
  const { open } = useDrawer();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <p className="text-xs text-slate-500">
          Backtest on {t.cohort} · risk owner {t.owner}
        </p>
        {cro ? (
          sent ? (
            <FlowPill w="proposed" />
          ) : (
            <button type="button" onClick={onSend} className={btnPrimary}>
              Propose to {t.owner}
            </button>
          )
        ) : null}
      </div>
      <div className="grid gap-2 pt-1 sm:grid-cols-2">
        {t.options.map((o) => (
          <OptionCard
            key={o.id}
            title={o.label}
            tag={o.id === t.recommended ? <AiTag label="Tested" /> : undefined}
            value={o.medianText}
            unit="median detection"
            details={[`${o.falseText} false alerts`]}
            selected={o.id === t.recommended}
          />
        ))}
      </div>
      <p className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
        <span>{sent ? `Proposal with ${t.owner} · nothing changes until a named approver signs off` : "Propose sends the tested rule set to the risk owner only; rules in use do not change"}</span>
        <button type="button" onClick={(e) => open(`metric:${t.measureId}`, e.currentTarget)} className={btn}>
          Open measure #{t.num}
        </button>
      </p>
    </>
  );
}

function TuningLab() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Scenario>("alerts");
  const detectSent = state.session.proposals.includes("tuning:u-detect");
  useFigures(["f:tuning"]);
  const cro = state.persona === "cro";
  return (
    <Card title="Tuning lab" right={<AiTag label="AI agent test" />} className="h-full">
      <div role="tablist" aria-label="Tuning scenario" className="mb-2 mt-0.5 flex w-fit overflow-hidden rounded-lg border border-slate-300">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={tab === s.id}
            onClick={() => setTab(s.id)}
            className={`border-l border-slate-300 px-3 py-1.5 text-xs font-semibold first:border-l-0 ${tab === s.id ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"} ${focus}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tab === "alerts" ? <AlertScenario cro={cro} /> : <DetectScenario cro={cro} sent={detectSent} onSend={() => dispatch({ type: "PROPOSE_TO_OWNER", item: "tuning:u-detect", owner: DETECT_TRIAL.owner })} />}</div>
    </Card>
  );
}

export const AGENT_SECTIONS = {
  A_TILES: AgentTiles,
  A_FINDINGS: AgentFindings,
  A_AUTONOMY: AgentAutonomy,
  A_ROSTER: AgentRoster,
  A_RULES: Rules,
  A_TUNING: TuningLab,
  A_ACTIVITY: Activity,
};

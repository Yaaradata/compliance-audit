"use client";

/**
 * UK Board v2 — AI agents tab: tiles, findings, autonomy, roster, fixed rules and the tuning lab.
 * Agents prepare, draft, test and propose to an owner. They never decide, file, contact a
 * regulator or change a live limit. Chart budget for this tab: tuning bars only.
 */
import { useState } from "react";
import { Lock } from "lucide-react";
import { ACTIVITY, AGENTS, agentName, AUTONOMY_LABEL, AUTONOMY_ORDER, FINDINGS, FIXED_RULES, MODEL_OVERSIGHT, QUEUE, TUNING, type Autonomy } from "@/lib/ukboard/v2/agentsData";
import { agentFigures, ATTACK_SIGNALS, fmt, measure } from "@/lib/ukboard/v2/boardStore";
import { useDrawer } from "./drawerContext";
import { BarRows, Card, ChartCard, Chip, EventList, FlowPill, KpiTile, StatRow, Table, useFigures } from "./present";
import { useStore } from "./store";
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
const DETECT_TRIAL = (() => {
  const m = measure("u-detect");
  const median = signal("Challenger model median");
  const falseAlerts = signal("Challenger false alerts");
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
      { id: "challenger", label: "Challenger model", medianSec: leadingNumber(median.value), medianText: median.value, falseIndex: 100 + extraPct, falseText: falseAlerts.value },
    ],
    recommended: "challenger",
  };
})();

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
  return (
    <Card title="Agent autonomy" right={<span className="text-xs text-slate-500">{chair ? "Changes go to committee" : "Set by Risk Committee"}</span>}>
      {AGENTS.map((a) => (
        <span key={a.id} className="flex min-h-9 items-center justify-between gap-2 border-t border-slate-100 pl-[13px] text-[13px]">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="text-violet-500" aria-hidden>
              ✦
            </span>
            {a.name}
          </span>
          {chair ? (
            <select aria-label={`${a.name} autonomy`} value={state.session.autonomy[a.id]} onChange={(e) => dispatch({ type: "SET_AUTONOMY", agentId: a.id, level: e.target.value as Autonomy })} className={`rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800 ${focus}`}>
              {AUTONOMY_ORDER.map((lv) => (
                <option key={lv} value={lv}>
                  {AUTONOMY_LABEL[lv]}
                </option>
              ))}
              <option value="act" disabled>
                Act (locked)
              </option>
            </select>
          ) : (
            <Chip>{AUTONOMY_LABEL[state.session.autonomy[a.id] ?? a.autonomy]}</Chip>
          )}
        </span>
      ))}
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
    <Card title="Rules agents cannot break" right={<AiTag />}>
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

function AlertScenario({ cro }: { cro: boolean }) {
  const { state, dispatch } = useStore();
  const [pick, setPick] = useState(TUNING.recommended);
  const proposed = state.session.tuningProposal;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <p className="text-xs text-slate-500">
          {TUNING.proposal} · breaches caught of {fmt.n(TUNING.breaches)} · extra alerts a month
        </p>
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
      {TUNING.options.map((o) => (
        <button key={o.id} type="button" disabled={!cro || !!proposed} aria-pressed={pick === o.id} onClick={() => setPick(o.id)} className={`block w-full text-left ${cro && pick === o.id ? "bg-slate-50" : ""} ${focus}`}>
          <BarRows max={TUNING.breaches} rows={[{ label: `${o.id} · ${o.label}`, value: o.caught, display: `${fmt.n(o.caught)} · +${fmt.n(o.extraAlerts)}`, tag: o.id === TUNING.recommended ? <AiTag label="Recommended" /> : undefined }]} />
        </button>
      ))}
      <p className="border-t border-slate-100 pt-2 text-xs text-slate-500">
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
          Current rules vs challenger model · {t.cohort} · risk owner {t.owner}
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
      <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Median time to detect · scale to the appetite limit</p>
      <BarRows
        max={t.limitSec}
        rows={t.options.map((o) => ({ label: o.label, value: o.medianSec, display: o.medianText, tag: o.id === t.recommended ? <AiTag label="Challenger" /> : undefined }))}
      />
      <p className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">False alerts vs current rules</p>
      <BarRows max={Math.max(...t.options.map((o) => o.falseIndex))} rows={t.options.map((o) => ({ label: o.label, value: o.falseIndex, display: o.falseText }))} />
      <p className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
        <span>{sent ? `Proposal with ${t.owner} · nothing changes until a named approver signs off` : "Propose sends the challenger to the risk owner only; live rules do not change"}</span>
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
    <ChartCard id="tuning" title="Tuning lab" right={<AiTag label="AI agent test" />}>
      <div role="tablist" aria-label="Tuning scenario" className="mb-2 inline-flex overflow-hidden rounded-lg border border-slate-300">
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
    </ChartCard>
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

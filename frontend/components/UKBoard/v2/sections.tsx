"use client";

/**
 * UK Board v2 — every section for the three personas, built only from the component library
 * (present.tsx). Figures come from lib/ukboard/v2/boardStore.ts; each figure has one home per
 * persona. Board member reads, challenges, notes and requests deep dives; the Chair records and
 * governs; the CRO prepares, proposes, sends to owner and approves.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { CAPACITY, DRAFTS, EVENTS, PACK_ITEMS, RESTRICTION, ROUTES } from "@/lib/ukboard/v1/data";
import { ACTIVITY, AGENTS, agentName, AUTONOMY_LABEL, AUTONOMY_ORDER, FINDINGS, FIXED_RULES, MODEL_OVERSIGHT, QUEUE, TUNING, type Autonomy } from "@/lib/ukboard/v2/agentsData";
import { CULTURE, D1_OPTIONS, D2_BOARD_ASKS, D3_OPTIONS, DUE_FOR_REVIEW, ISSUES_FOUND, JOURNEYS, REGULATOR_RELATIONSHIP, SIGNOFF_HISTORY, SIGNOFF_MONTHS, TENSIONS, type SignOffMark } from "@/lib/ukboard/v2/boardMemberData";
import {
  agentFigures,
  APPETITE_STATEMENTS,
  attestationRecord,
  attestationThisMonth,
  consumerDuty,
  EMERGING_UNMEASURED,
  ENFORCEMENT_THEMES,
  FIG,
  fmt,
  issuesFound,
  journeysWithoutOwner,
  measure,
  MEASURES,
  mortgageHeadroomM,
  mortgagePlanPct,
  ownerRows,
  rateErrorPct,
  roleOf,
  routesDecided,
  SINCE_LAST_BOARD,
  statusChanges,
  stillUnresolved,
} from "@/lib/ukboard/v2/boardStore";
import { DECISION_HISTORY, EVENT_PLAIN, FRANCHISES, plain, ROUTE_PLAIN } from "@/lib/ukboard/v2/boardTabs";
import type { SectionId } from "@/lib/ukboard/v2/personaViews";
import { useDrawer } from "./drawerContext";
import LineChart from "./LineChart";
import { BarRows, Card, OWNER_SHORT, ChartCard, Chip, EventList, FlowPill, KpiTile, LimitPill, LineItem, LinkMore, MeasureTable, OwnerTable, PostureStrip, StatList, StatRow, StatusPill, Table, useCollapse, useFigures, VerdictPill, type Workflow } from "./present";
import { OVERVIEW_SECTIONS } from "./overview";
import { AGENT_SECTIONS } from "./agents";
import { OBLIGATORY_SECTIONS } from "./obligatory";
import { PERSONA_SECTIONS } from "./personaTabs";
import { RISK_SECTIONS } from "./risks";
import { STRATEGY_SECTIONS } from "./strategy";
import { useStore } from "./store";
import { AiTag, btn, btnPrimary, focus, Pill } from "./ui";

export function useGo() {
  const { dispatch } = useStore();
  return (tab: string) => dispatch({ type: "SET_TAB", tab });
}

const POSTURE_SENTENCE = "Mortgages can grow; savings outrun crime checks.";
const draftTargets = () => Object.fromEntries(Object.values(DRAFTS).map((d) => [d.draftId, d.targetRole]));
function useOpenDrafts() {
  const { state } = useStore();
  return Object.keys(state.session.drafts).filter((id) => state.session.drafts[id].status === "ai_draft");
}
const routeDecided = (r: (typeof ROUTES)[number]) => r.status === "decided";

/* ══ Shared sections ════════════════════════════════════════════════════ */

function Posture() {
  return <PostureStrip sentence={POSTURE_SENTENCE} />;
}

function Escalation() {
  const { open } = useDrawer();
  const e = FIG.escalation;
  return (
    <StatList
      title="Escalation"
      rail="amber"
      figures={["f:escalation"]}
      rows={[
        { label: "Median time to committee", value: `${e.medianMonths} months`, comparator: `${e.issues} serious issues`, onClick: (el) => open("badnews", el) },
        { label: "Not escalated after 12 months", value: String(e.notEscalated), comparator: "issues" },
        { label: "Customer checks overdue", value: fmt.n(e.overdueChecks), comparator: `target ${fmt.n(e.overdueTarget)}` },
        { label: "Actions closed, no effect", value: String(e.actionsClosed), comparator: `${e.downgraded} downgraded` },
      ]}
    />
  );
}

function StillOpen({ title = "Still open" }: { title?: string }) {
  const { open } = useDrawer();
  return (
    <StatList
      title={title}
      figures={["f:still-open"]}
      rows={stillUnresolved().map((u) => {
        const [a, b, ...rest] = u.duration.split(" ");
        return { label: u.text, value: `${a} ${b}`, comparator: rest.join(" "), rail: "amber" as const, onClick: (el: HTMLElement) => open(u.drawer, el) };
      })}
    />
  );
}

function Tradeoffs() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const tr = FIG.tradeoff;
  const returned = state.session.returned.includes("d-t26-redecide");
  const action =
    state.persona === "cro" ? (
      <button type="button" onClick={(e) => open("franchise:O2", e.currentTarget)} className={btn}>
        Propose Tighten · Hold · Loosen
      </button>
    ) : state.persona === "chair" ? (
      <button type="button" disabled={returned} onClick={() => dispatch({ type: "RETURN_TO_CRO", draftId: "d-t26-redecide" })} className={btn}>
        {returned ? "Returned to CRO" : "Return to CRO"}
      </button>
    ) : (
      <FlowPill w="overdue" />
    );
  return (
    <StatList
      title="Agreed tensions"
      right={action}
      figures={["f:tradeoff"]}
      rows={[
        { label: "Onboarding uplift", value: `+${tr.uplift} pts`, comparator: `limit +${tr.upliftLimit}`, rail: "red", right: <LimitPill l="broken" /> },
        { label: "High-risk acceptance", value: fmt.pct(tr.acceptance, 1), comparator: `limit ${fmt.pct(tr.acceptanceLimit, 1)}`, rail: "red", right: <LimitPill l="broken" /> },
        { label: "Onboarding fraud losses", value: `${tr.fraudBp} bp`, comparator: `limit ${tr.fraudLimitBp} bp`, right: <LimitPill l="within" /> },
        { label: "Checks before transacting", value: "Floor", comparator: `${tr.overdueDays} days overdue`, rail: "red", right: <LimitPill l="floor" /> },
      ]}
    />
  );
}

function CapacityChart({ withStats }: { withStats?: boolean }) {
  const c = FIG.capacity;
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  useFigures(withStats ? ["f:capacity"] : []);
  return (
    <ChartCard id="capacity" title="Growth vs capacity">
      <LineChart
        title="Members and qualified handlers, indexed"
        height={180}
        series={[
          { name: "Members", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.membersM)[i] })) },
          { name: "Handlers", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.handlers)[i] })), dashed: true },
        ]}
      />
      {withStats ? (
        <>
          <StatRow label="Members per handler" value={fmt.n(c.perHandler)} comparator={`was ${fmt.n(c.perHandlerWas)}`} />
          <StatRow label="Alerts cleared in target" value={fmt.share(c.cleared, c.alerts)} comparator={fmt.nOfM(c.cleared, c.alerts)} />
          <StatRow label="Handlers to restore ratio" value={`+${c.restoreNeeded}`} comparator={`about ${fmt.gbpM(c.restoreCostM)} a year`} />
        </>
      ) : null}
    </ChartCard>
  );
}

function OwnersTable() {
  const openIds = useOpenDrafts();
  return <OwnerTable rows={ownerRows(openIds, draftTargets())} />;
}

const MARK: Record<SignOffMark, { cls: string; word: string }> = {
  on_time: { cls: "bg-slate-400", word: "On time" },
  late: { cls: "bg-amber-500", word: "Late" },
  missing: { cls: "border border-dashed border-slate-400 bg-white", word: "Missing" },
  early: { cls: "bg-red-500", word: "Before data check" },
};

function AttestationHeatmap() {
  const r = attestationRecord();
  useFigures(["f:attest-record"]);
  return (
    <ChartCard id="attestation-heatmap" title="Attestation record" right={<Chip>{`${r.onTime} of ${r.cells} owner-months on time`}</Chip>}>
      <div className="grid grid-cols-[170px_repeat(12,minmax(0,1fr))] items-center gap-1 pt-1 text-[11px] text-slate-500">
        <span />
        {SIGNOFF_MONTHS.map((m) => (
          <span key={m} className="text-center">
            {m}
          </span>
        ))}
        {SIGNOFF_HISTORY.map((o) => (
          <div key={o.role} className="contents">
            <span className="flex h-7 items-center text-xs text-slate-800">{o.role}</span>
            {o.marks.map((mk, i) => (
              <span key={i} title={`${SIGNOFF_MONTHS[i]}: ${MARK[mk].word}`} className={`mx-auto h-5 w-full max-w-7 rounded ${MARK[mk].cls}`} />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-xs text-slate-600">
        {(Object.keys(MARK) as SignOffMark[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${MARK[k].cls}`} />
            {MARK[k].word}
          </span>
        ))}
      </p>
    </ChartCard>
  );
}

function AttestationMonth() {
  const a = attestationThisMonth();
  return (
    <StatList
      title="Attestation this month"
      figures={["f:attest-month"]}
      rows={[
        { label: "Attested", value: `${a.attested} of ${a.total}`, comparator: "board measures" },
        { label: "Due", value: String(a.due), comparator: "attestation pending", rail: "amber" },
        { label: "Unconfirmed", value: String(a.unconfirmed), comparator: "before data check", right: <Pill tone="grey" label="Unconfirmed" /> },
      ]}
    />
  );
}

function EnforcementThemes() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const done = state.session.drafts["d-t232-readacross"]?.status !== "ai_draft";
  return (
    <Card
      title="Enforcement themes"
      right={
        state.persona === "cro" ? (
          <button type="button" disabled={done} onClick={() => dispatch({ type: "ACCEPT", draftId: "d-t232-readacross" })} className={btn}>
            {done ? "Read-across recorded" : "Record read-across"}
          </button>
        ) : undefined
      }
    >
      {ENFORCEMENT_THEMES.map((t) => (
        <LineItem key={t.theme} text={t.theme} detail={t.source} onClick={(el) => open(`metric:${t.measureId}`, el)} right={<Chip>{measure(t.measureId).name}</Chip>} />
      ))}
    </Card>
  );
}

function Horizon() {
  return (
    <EventList
      title="Regulatory horizon"
      items={[
        { date: "18 Mar 27", text: "Incident and third-party reporting rules", tag: "FCA · PRA", drawer: "horizon" },
        { date: "Jul 27", text: "Consumer Duty annual board report", tag: "FCA" },
      ]}
    />
  );
}

const ROUTE_LABEL: Record<string, string> = { product: "New savings pot", migration: "Group migration", override: "Branch override" };

function RestrictionCard() {
  const { open } = useDrawer();
  const r = FIG.restriction;
  useFigures(["m:u-restriction", "f:restriction"]);
  return (
    <Card title="Restriction" rail="red" right={<StatusPill status="red" />}>
      <StatRow label="Accounts in breach" value={fmt.nOfM(r.breaches, r.tested)} comparator="appetite 0" onClick={(el) => open("restriction", el)} />
      <StatRow label="Customers affected" value={String(r.customers)} comparator={`${r.exited} previously exited`} />
      <StatRow label="Openings not checked" value={fmt.n(r.untested)} comparator="partner channel" />
      <div data-chart="restriction-routes" className="pt-1">
        <BarRows max={r.breaches} rows={RESTRICTION.byRoute.map((b) => ({ label: ROUTE_LABEL[b.lane] ?? b.route, value: b.accounts }))} />
      </div>
    </Card>
  );
}

const shortDate = (s: string) => {
  const [d, m] = s.split(" ");
  return `${Number(d)} ${m.slice(0, 3)}`;
};

/** Reporting decisions: event · route · clock · decider · status. CRO gets the Send case action. */
function ReportingTable() {
  const { state, dispatch } = useStore();
  const cro = state.persona === "cro";
  const r = routesDecided();
  useFigures(["f:routes"]);
  const eventShort = (id: string) => (id === "e-117" ? "Mortgage rate error" : EVENT_PLAIN[id]);
  const clock = (x: (typeof ROUTES)[number]) => (x.isSar ? "As soon as practicable" : x.clockHours === 24 ? "Immediate" : "Reporting period");
  const status = (x: (typeof ROUTES)[number]): ReactNode => (routeDecided(x) ? <FlowPill w="decided" /> : x.status === "not_engaged" ? <span className="text-xs text-slate-500">Not started</span> : <FlowPill w="due" />);
  const awareness = EVENTS.find((e) => e.awarenessGap);
  const rows = ROUTES.map((x) => {
    const cs = x.caseDraftId ? state.session.drafts[x.caseDraftId] : undefined;
    const decider = routeDecided(x) ? `${roleOf(x.history[0].deciderPersonId)} · ${shortDate(x.history[0].decidedOn)}` : x.proposedDeciderRole;
    const cells: ReactNode[] = [eventShort(x.eventId), ROUTE_PLAIN[x.routeId], clock(x), decider, status(x)];
    if (cro)
      cells.push(
        cs && cs.status === "ai_draft" ? (
          <button
            key="a"
            type="button"
            className={btn}
            onClick={() => {
              dispatch({ type: "ACCEPT", draftId: x.caseDraftId! });
              dispatch({ type: "SEND", draftId: x.caseDraftId! });
            }}
          >
            Send case
          </button>
        ) : (
          <span key="a" className="text-xs text-slate-400">
            —
          </span>
        ),
      );
    return { key: x.routeId, rail: !routeDecided(x) && x.clockHours === 24 ? ("red" as const) : undefined, cells };
  });
  if (cro && awareness?.awarenessGap) rows.push({ key: "gap", rail: undefined, cells: ["Awareness date", `Records ${awareness.awarenessGap.gapDays} days earlier`, "", "", "", ""] });
  return (
    <Table
      title="Reporting decisions"
      right={<Chip>{`${r.decided} of ${r.total} routes decided`}</Chip>}
      cols={cro ? "grid-cols-[minmax(130px,1fr)_minmax(110px,0.9fr)_minmax(110px,0.9fr)_minmax(150px,1.1fr)_84px_96px]" : "grid-cols-[minmax(130px,1fr)_minmax(110px,0.9fr)_minmax(120px,0.9fr)_minmax(150px,1.1fr)_84px]"}
      head={cro ? ["Event", "Route", "Clock", "Decider", "Status", "Action"] : ["Event", "Route", "Clock", "Decider", "Status"]}
      rightCols={cro ? [4, 5] : [4]}
      rows={rows}
    />
  );
}

function AgentAutonomy() {
  const { state, dispatch } = useStore();
  const chair = state.persona === "chair";
  return (
    <Card title="Agent autonomy" right={<span className="text-xs text-slate-500">{chair ? "Changes go to committee" : "Set by Risk Committee"}</span>}>
      {AGENTS.map((a) => (
        <span key={a.id} className="flex min-h-9 items-center justify-between gap-2 border-t border-slate-100 pl-[13px] text-[13px]">
          <span className="text-slate-700">{a.name}</span>
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
            <Chip>{AUTONOMY_LABEL[state.session.autonomy[a.id]]}</Chip>
          )}
        </span>
      ))}
    </Card>
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

const statusFlow: Record<string, [string, "green" | "amber" | "grey"]> = { running: ["Running", "green"], waiting: ["Waiting", "amber"], paused: ["Paused", "grey"] };

function AgentRoster() {
  const { open } = useDrawer();
  return (
    <Table
      title="Agent roster"
      right={<AiTag label={`${AGENTS.length} agents`} />}
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
            {a.does.split(" ").slice(0, 6).join(" ")}
          </span>,
          <span key="o" className="text-xs text-slate-500">
            {a.accountable}
          </span>,
          <Pill key="s" tone={statusFlow[a.status][1]} label={statusFlow[a.status][0]} />,
        ],
      }))}
    />
  );
}

function TuningLab() {
  const { state, dispatch } = useStore();
  const [pick, setPick] = useState(TUNING.recommended);
  useFigures(["f:tuning"]);
  const cro = state.persona === "cro";
  return (
    <ChartCard
      id="tuning"
      title="Tuning lab"
      right={
        cro ? (
          state.session.tuningProposal ? (
            <FlowPill w="proposed" />
          ) : (
            <button type="button" onClick={() => dispatch({ type: "PROPOSE_TUNING", optionId: pick })} className={btnPrimary}>
              Propose option {pick}
            </button>
          )
        ) : (
          <AiTag label="AI agent test" />
        )
      }
    >
      <p className="pb-1 text-xs text-slate-500">Breaches caught of {TUNING.breaches} · extra alerts a month</p>
      {TUNING.options.map((o) => (
        <button key={o.id} type="button" disabled={!cro} aria-pressed={pick === o.id} onClick={() => setPick(o.id)} className={`block w-full text-left ${cro && pick === o.id ? "bg-slate-50" : ""} ${focus}`}>
          <BarRows wide max={TUNING.breaches} rows={[{ label: `${o.id} · ${o.label}`, value: o.caught, display: `${o.caught} · +${fmt.n(o.extraAlerts)}`, tag: o.id === TUNING.recommended ? <AiTag label="Recommended" /> : undefined }]} />
        </button>
      ))}
      <p className="border-t border-slate-100 pt-2 text-xs text-slate-500">Nothing takes effect without a named approver.</p>
    </ChartCard>
  );
}

function Activity() {
  return <EventList title="Agent activity" right={<AiTag />} items={ACTIVITY.map((e) => ({ date: e.date.replace(" 2026", ""), text: e.line, tag: e.type.charAt(0) + e.type.slice(1).toLowerCase() }))} />;
}

function DecisionLog() {
  const flow = (i: number): Workflow => (DECISION_HISTORY[i].tone === "green" ? "decided" : "overdue");
  return (
    <Table
      title="Decision log"
      cols="grid-cols-[96px_minmax(140px,0.8fr)_minmax(220px,2fr)_80px_100px]"
      head={["Date", "Forum", "Decision", "Stance", "Status"]}
      rightCols={[4]}
      rows={DECISION_HISTORY.map((h, i) => ({
        key: h.decision,
        rail: flow(i) === "overdue" ? "amber" : undefined,
        cells: [
          <b key="d" className="font-semibold tabular-nums text-slate-900">
            {h.date.replace(/^0/, "").replace(/ 2026$/, "")}
          </b>,
          h.forum,
          h.decision,
          <span key="t" className="text-xs">
            {h.stance}
          </span>,
          <FlowPill key="s" w={flow(i)} />,
        ],
      }))}
    />
  );
}

/* ══ Board member ═══════════════════════════════════════════════════════ */

function BusinessTiles() {
  const { open } = useDrawer();
  useFigures(["f:mortgage-growth", "f:savings-growth", "f:wholesale"]);
  const v = Object.fromEntries(FRANCHISES.map((f) => [f.id, f.verdict]));
  const nUnconf = MEASURES.filter((m) => m.objectiveId === "O4" && m.status === "unconfirmed").length;
  const tiles = [
    { id: "O1", label: "Mortgages", value: fmt.gbpBn(FIG.mortgages.lentBn), comparator: `plan ${fmt.gbpBn(FIG.mortgages.planBn)} · £${mortgageHeadroomM()}m headroom` },
    { id: "O2", label: "Savings", value: `+${fmt.gbpBn(FIG.savings.balancesBn)}`, comparator: `plan +${fmt.gbpBn(FIG.savings.planBn)} · ${FIG.savings.limitsBroken}/${FIG.savings.limits} limits broken` },
    { id: "O3", label: "Funding", value: `${FIG.liquidity.wholesale}%`, comparator: `wholesale, ceiling ${FIG.liquidity.wholesaleCeiling}%` },
    { id: "O4", label: "Member protection", value: `${nUnconf} unconfirmed`, comparator: `re-check by ${FIG.dates.brc}` },
  ];
  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((t) => (
        <KpiTile key={t.id} label={t.label} value={t.value} comparator={t.comparator} pill={<VerdictPill v={v[t.id]} />} rail={v[t.id] === "fix_first" ? "red" : v[t.id] === "hold" ? "amber" : undefined} onClick={(el) => open(`franchise:${t.id}`, el)} />
      ))}
    </div>
  );
}

function Exceptions() {
  const go = useGo();
  return <MeasureTable title="Appetite exceptions" variant="exceptions" onWithin={() => go("strategy")} />;
}

const DECISIONS = [
  { n: 1, title: "Savings growth vs checks", decider: "Board", due: FIG.dates.campaign, ask: `Restore crime-check capacity or pace savings growth before ${FIG.dates.campaign}.`, rail: "amber" as const },
  { n: 2, title: "Restriction breach reporting", decider: "Compliance", due: "Now", ask: "Confirm each reporting route is decided by its named decider now.", rail: "red" as const },
  { n: 3, title: "Removed pack item", decider: "Chair", due: FIG.dates.brc, ask: "Decide how the dropped vulnerable-customer item returns to the board.", rail: "amber" as const },
];

let pendingDecision = 1;

function DecisionsRequired() {
  const go = useGo();
  return (
    <Card title="Decisions required">
      {DECISIONS.map((d) => (
        <LineItem
          key={d.n}
          rail={d.rail}
          text={d.title}
          detail={`${d.decider} · ${d.due}`}
          onClick={() => {
            pendingDecision = d.n;
            go("decisions");
          }}
          right={<span className="text-indigo-700">›</span>}
        />
      ))}
    </Card>
  );
}

function KeyDates() {
  return (
    <EventList
      title="Key dates"
      items={[
        { date: FIG.dates.restrictionSignOff, text: "Restriction attestation", rail: "red" },
        { date: FIG.dates.campaign, text: "Savings campaign", rail: "amber" },
        { date: FIG.dates.brc, text: "Committee meeting" },
      ]}
    />
  );
}

function SinceLastBoard() {
  const n = statusChanges().length;
  return <EventList title="Since last board" right={<Chip>{`${n} status changes`}</Chip>} items={SINCE_LAST_BOARD.slice(0, 4).map((e) => ({ ...e, tag: undefined }))} />;
}

function Assurance() {
  const go = useGo();
  const a = attestationThisMonth();
  const j = journeysWithoutOwner();
  return (
    <StatList
      title="Assurance"
      right={<LinkMore onClick={() => go("accountability")} label="Accountability" />}
      figures={["f:attest-month", "f:journeys", "f:agent-unapproved"]}
      rows={[
        { label: "Attested this month", value: `${a.attested} of ${a.total}` },
        { label: "Journeys without owner", value: `${j.n} of ${j.of}`, rail: "red" },
        { label: "Unapproved AI actions", value: "0" },
      ]}
    />
  );
}

function StrategyTable() {
  const { open } = useDrawer();
  useFigures(["f:mortgage-growth", "f:savings-growth"]);
  const plan: Record<string, string> = {
    O1: `${fmt.gbpBn(FIG.mortgages.lentBn)} of ${fmt.gbpBn(FIG.mortgages.planBn)} · ${mortgagePlanPct()}%`,
    O2: `+${fmt.gbpBn(FIG.savings.balancesBn)} vs +${fmt.gbpBn(FIG.savings.planBn)}`,
    O3: "Funded within ceiling",
    O4: "—",
  };
  const headroom: Record<string, string> = { O1: `£${mortgageHeadroomM()}m to limit`, O2: `${FIG.savings.limitsBroken} of ${FIG.savings.limits} broken`, O3: "Narrowing", O4: "Unconfirmed" };
  const dot = (s: string) => (s === "red" ? "bg-red-500" : s === "amber" || s === "projected" ? "bg-amber-500" : s === "unconfirmed" ? "border border-dashed border-slate-500" : "bg-emerald-500");
  return (
    <Table
      title="Strategy to appetite"
      cols="grid-cols-[minmax(110px,0.9fr)_minmax(120px,1fr)_minmax(160px,1.6fr)_minmax(150px,1.3fr)_minmax(100px,0.9fr)_116px]"
      head={["Business line", "Plan", "Appetite statement", "Measures", "Headroom", "Verdict"]}
      rightCols={[5]}
      rows={FRANCHISES.map((f) => ({
        key: f.id,
        rail: f.verdict === "fix_first" ? "red" : f.verdict === "hold" ? "amber" : undefined,
        onClick: (el) => open(`franchise:${f.id}`, el),
        cells: [
          <b key="n" className="font-semibold text-slate-900">
            {f.name}
          </b>,
          <span key="p" className="tabular-nums">
            {plan[f.id]}
          </span>,
          <span key="a" className="text-slate-700">
            {APPETITE_STATEMENTS[f.id]}
          </span>,
          <span key="l" className="flex items-center gap-1" title={MEASURES.filter((m) => m.objectiveId === f.id).map((m) => m.name).join(", ")}>
            {MEASURES.filter((m) => m.objectiveId === f.id).map((m) => (
              <span key={m.id} aria-label={`${m.name}: ${m.status}`} className={`h-2.5 w-2.5 rounded-full ${dot(m.status)}`} />
            ))}
            <span className="ml-1 text-xs text-slate-500">{MEASURES.filter((m) => m.objectiveId === f.id).length}</span>
          </span>,
          <span key="h" className="text-slate-700">
            {headroom[f.id]}
          </span>,
          <VerdictPill key="v" v={f.verdict} />,
        ],
      }))}
    />
  );
}

function CreditQuality() {
  const c = FIG.credit;
  return (
    <StatList
      title="Credit quality"
      figures={["f:credit"]}
      rows={[
        { label: "Above 4.5× income", value: fmt.pct(c.above45, 1), comparator: `limit ${c.above45Limit}%` },
        { label: "Arrears 3 months+", value: fmt.pct(c.arrears, 2), comparator: `appetite ${fmt.pct(c.arrearsAppetite, 1)}` },
        { label: "Cost of risk", value: `${c.costOfRiskBps} bps`, comparator: `Q2 ${c.costOfRiskQ2Bps} bps` },
        { label: "Mortgage book", value: fmt.gbpBn(FIG.mortgages.bookBn) },
      ]}
    />
  );
}

function PolicyTensions() {
  const { open } = useDrawer();
  return (
    <Card title="Policy tensions" right={<AiTag label="AI agent found" />}>
      {TENSIONS.map((t) => (
        <LineItem
          key={t.a}
          rail={t.tone === "red" ? "red" : t.tone === "amber" ? "amber" : undefined}
          text={`${t.a} vs ${t.b}`}
          onClick={(el) => open(t.drawer, el)}
          right={t.status === "Regulatory floor, not tradeable" ? <LimitPill l="floor" /> : <span className="whitespace-nowrap text-xs text-slate-500">{t.status === "Not agreed" ? "Not agreed" : "Agreed"}</span>}
        />
      ))}
    </Card>
  );
}

function NotMeasured() {
  return (
    <Card title="Not yet measured">
      {EMERGING_UNMEASURED.map((e) => (
        <LineItem key={e.name} text={e.name} detail={e.owner ? OWNER_SHORT[e.owner] ?? e.owner : "No owner"} right={<Pill tone="grey" label="Unconfirmed" />} />
      ))}
    </Card>
  );
}

function ConsumerDuty() {
  const cd = consumerDuty();
  useFigures(["m:u-cd"]);
  const key = (name: string, k: string) =>
    name === "Consumer understanding" ? `letters ${fmt.pct(FIG.letters.pct)} · target ${fmt.pct(FIG.letters.target)}` : name === "Consumer support" ? `call wait ${FIG.callWait.value} · target ${FIG.callWait.target}` : k.toLowerCase();
  return (
    <Card title="Consumer Duty" right={<Chip>{`${cd.inTol} of ${cd.total} measures in tolerance`}</Chip>}>
      <div className="grid grid-cols-1 items-start gap-4 pb-1 sm:grid-cols-2 xl:grid-cols-4">
        {FIG.outcomes.map((o) => (
          <KpiTile key={o.name} label={o.name} value={`${o.inTolerance} of ${o.measures}`} comparator={key(o.name, o.key)} pill={<StatusPill status={o.status === "amber" ? "amber" : "within"} />} rail={o.status === "amber" ? "amber" : undefined} />
        ))}
      </div>
    </Card>
  );
}

function Complaints() {
  const c = FIG.complaints;
  const n = c.perThousand.length - 1;
  useFigures(["f:complaints"]);
  return (
    <ChartCard id="complaints" title="Complaints" right={<span className="text-xs text-slate-500">{c.basis}</span>}>
      <LineChart title={`Complaints ${c.basis}`} height={140} series={[{ name: c.basis, points: c.quarters.map((q, i) => ({ label: q, value: c.perThousand[i] })) }]} />
      <StatRow label="This quarter" value={String(c.perThousand[n])} comparator={`Q2 ${c.perThousand[n - 1]}`} rail="amber" />
      <StatRow label="Ombudsman upholds" value={fmt.pct(c.uphold)} comparator={`Q2 ${fmt.pct(c.upholdQ2)}`} rail="amber" />
    </ChartCard>
  );
}

function Themes() {
  const t = FIG.complaints.themes;
  return (
    <ChartCard id="themes" title="Complaint themes" right={<span className="text-xs text-slate-500">share this quarter</span>}>
      <BarRows max={Math.max(...t.map((x) => x.share))} rows={t.map((x) => ({ label: x.theme, value: x.share, display: fmt.pct(x.share) }))} />
    </ChartCard>
  );
}

function Vulnerable() {
  const { open } = useDrawer();
  const v = FIG.vuln;
  return (
    <StatList
      title="Vulnerable customers"
      rail="amber"
      figures={["f:vuln"]}
      rows={[
        { label: `Exceptions ${v.basis.replace(" contacts", "")}`, value: String(v.series[v.series.length - 1]), comparator: `amber ${v.amber} · red ${v.red}`, onClick: (el) => open("removed", el) },
        { label: "At amber", value: `${v.quartersAmber} quarters`, comparator: "removed from pack" },
        { label: "Previous quarter", value: String(v.series[v.series.length - 2]), comparator: v.labels[v.labels.length - 2] },
      ]}
    />
  );
}

function Redress() {
  const { open } = useDrawer();
  const r = FIG.rateError;
  return (
    <StatList
      title="Mortgage-rate redress"
      figures={["f:redress"]}
      rows={[
        { label: "Customers contacted", value: `${rateErrorPct()}%`, comparator: fmt.nOfM(r.contacted, r.customers), onClick: (el) => open("event:e-117", el) },
        { label: "Still to contact", value: fmt.n(r.customers - r.contacted), comparator: "customers" },
        { label: "Redress estimate", value: fmt.gbpK(r.redressK), comparator: `by ${r.due}` },
      ]}
    />
  );
}

function Signals() {
  const f = FINDINGS.find((x) => x.agentId === "signals")!;
  return (
    <Card title="Customer signals" right={<AiTag label="Customer Signals" />}>
      <LineItem rail="amber" text={f.finding.replace(" mention 'account frozen'", "")} detail="'account frozen'" />
      <LineItem text="Linked to" detail="restriction block" />
      <LineItem text="Accountable" detail="Chief Customer Officer" />
    </Card>
  );
}

const CHALLENGES: Record<number, string[]> = {
  1: ["Restoring capacity finishes after the campaign starts. Then what?", "Why no resourcing decision since August?", "What would pacing growth cost in members?"],
  2: ["When did we first know about the savings pot?", "Who decides each reporting route, and by when?", "Why are partner-channel openings still unchecked?"],
  3: ["Who removed this item, and on what authority?", "Why no action while it stayed amber?", "What stops an item being dropped silently?"],
};

function DecisionPanel() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const [sel, setSel] = useState(pendingDecision);
  useEffect(() => {
    pendingDecision = 1;
  }, []);
  const d = DECISIONS.find((x) => x.n === sel)!;
  const r = routesDecided();
  const topic = `Decision ${d.n}: ${d.title}`;
  const asked = state.session.deepDives.includes(topic);
  const saved = (q: string) => state.session.notes.some((x) => x.from === `Decision ${d.n}` && x.text === q);
  useFigures(d.n === 1 ? ["f:d1-options"] : d.n === 2 ? ["f:routes"] : ["f:d3-options"]);
  return (
    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-4 xl:grid-cols-12">
      <div className="flex flex-col gap-4 xl:col-span-4">
        <Card title="Decisions">
          {DECISIONS.map((x) => (
            <button key={x.n} type="button" aria-pressed={sel === x.n} onClick={() => setSel(x.n)} className={`block w-full text-left ${focus} ${sel === x.n ? "bg-slate-50" : "hover:bg-slate-50"}`}>
              <span className={`flex min-h-11 items-center justify-between gap-2 border-l-[3px] border-t border-t-slate-100 py-1 pl-2.5 text-[13px] ${x.rail === "red" ? "border-l-red-500" : "border-l-amber-500"}`}>
                <span>
                  <span className={sel === x.n ? "font-semibold text-slate-900" : "text-slate-800"}>{x.title}</span>
                  <span className="block text-xs text-slate-500">
                    {x.decider} · {x.due}
                  </span>
                </span>
                <span className="text-indigo-700">›</span>
              </span>
            </button>
          ))}
        </Card>
        <Card title="Overdue reviews">
          {DUE_FOR_REVIEW.map((x) => (
            <LineItem key={x.item} rail="red" text={x.item} onClick={(el) => open(x.drawer, el)} right={<FlowPill w="overdue" />} />
          ))}
        </Card>
      </div>
      <Card title={d.title} rail={d.rail} className="xl:col-span-8" right={<span className="text-xs text-slate-500">{`${d.decider} · ${d.due}`}</span>}>
        <p className="border-t border-slate-100 py-2 text-[13px] font-semibold text-slate-900">{d.ask}</p>
        {d.n === 1 ? (
          <Table
            title="Options"
            cols="grid-cols-[minmax(130px,0.9fr)_minmax(170px,1.3fr)_minmax(120px,0.9fr)_minmax(150px,1fr)_84px]"
            head={["Option", "Growth", "Risk", "Cost", "To green"]}
            rightCols={[4]}
            rows={D1_OPTIONS.map((o) => ({
              key: o.option,
              cells: [
                <span key="o" className="font-semibold text-slate-900">
                  {o.option}
                  {o.recommended ? (
                    <span className="ml-1.5 align-middle">
                      <AiTag label="Recommended" />
                    </span>
                  ) : null}
                </span>,
                o.growth,
                o.risk,
                o.cost,
                <b key="t" className="font-semibold">
                  {o.toGreen}
                </b>,
              ],
            }))}
          />
        ) : d.n === 3 ? (
          <Table
            title="Options"
            cols="grid-cols-[minmax(160px,1fr)_minmax(220px,1.6fr)]"
            head={["Option", "Impact"]}
            rows={D3_OPTIONS.map((o, i) => ({
              key: o.option,
              cells: [
                <span key="o" className="font-semibold text-slate-900">
                  {o.option}
                  {i === 0 ? (
                    <span className="ml-1.5 align-middle">
                      <AiTag label="Recommended" />
                    </span>
                  ) : null}
                </span>,
                o.impact,
              ],
            }))}
          />
        ) : (
          <>
            <StatRow label="Reporting routes decided" value={`${r.decided} of ${r.total}`} comparator="Head of Compliance decides" rail="red" />
            {D2_BOARD_ASKS.filter((x) => !/\d/.test(x)).map((x) => (
              <LineItem key={x} text={x} />
            ))}
          </>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-sm font-semibold text-slate-900">Questions to ask</span>
          <AiTag label="AI agent drafted" />
        </div>
        {CHALLENGES[d.n].map((q) => (
          <LineItem
            key={q}
            text={q}
            right={
              <button type="button" disabled={saved(q)} onClick={() => dispatch({ type: "SAVE_NOTE", text: q, from: `Decision ${d.n}` })} className={btn}>
                {saved(q) ? "In my notes" : "Add to notes"}
              </button>
            }
          />
        ))}
        <div className="mt-2 flex gap-2 border-t border-slate-100 pt-2.5">
          <button type="button" onClick={(e) => open(`decision:${d.n}`, e.currentTarget)} className={btn}>
            Open detail
          </button>
          <button type="button" disabled={asked} onClick={() => dispatch({ type: "REQUEST_DEEP_DIVE", topic })} className={btn}>
            {asked ? "Deep dive requested" : "Request a deep dive"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function RegulatorRelationship() {
  return <StatList title="Regulator relationship" rows={REGULATOR_RELATIONSHIP.map((r) => ({ label: r.label, value: r.value, rail: r.tone === "red" || r.tone === "amber" ? r.tone : undefined }))} />;
}

function Sanctions() {
  const s = FIG.sanctions;
  const m = measure("u-screening");
  return (
    <StatList
      title="Sanctions screening"
      right={<StatusPill status={m.status} />}
      figures={["m:u-screening"]}
      rows={[
        { label: "List coverage", value: m.l2[1].value, comparator: `${s.rules} rules · ${fmt.n(s.entries)} entries` },
        { label: "Alerts", value: "None", comparator: `${s.weeksNoAlerts} weeks · ${s.expectedPerWeek} a week expected` },
        { label: "Attestation", value: "Unconfirmed", comparator: "Head of Financial Crime" },
      ]}
    />
  );
}

function FoundIssues() {
  const f = issuesFound();
  const SHADE = ["bg-slate-700", "bg-slate-500", "bg-slate-400", "bg-slate-300"];
  useFigures(["f:found"]);
  return (
    <ChartCard id="found" title="Who found issues" right={<Chip>{`n = ${f.total}`}</Chip>}>
      <div className="mb-1 mt-1 flex h-4 overflow-hidden rounded-full">
        {ISSUES_FOUND.by.map((b, i) => (
          <span key={b.line} className={SHADE[i]} style={{ width: `${(b.n / f.total) * 100}%` }} title={`${b.line}: ${b.n}`} />
        ))}
      </div>
      {ISSUES_FOUND.by.map((b, i) => (
        <StatRow key={b.line} label={b.line} value={String(b.n)} comparator={i === 0 ? `${f.firstPct}% · aim: most` : `of ${f.total}`} right={<span className={`h-2.5 w-2.5 rounded-sm ${SHADE[i]}`} />} />
      ))}
    </ChartCard>
  );
}

function Journeys() {
  const j = journeysWithoutOwner();
  useFigures(["f:journeys"]);
  return (
    <Table
      title="Line of sight"
      right={<Chip>{`${j.n} of ${j.of} without risk owner`}</Chip>}
      cols="grid-cols-[minmax(170px,1.1fr)_minmax(150px,1fr)_minmax(170px,1fr)_120px_110px]"
      head={["Journey", "Risk owner", "Control owner", "Aligned", "Complaints"]}
      rightCols={[4]}
      rows={JOURNEYS.map((x) => ({
        key: x.journey,
        rail: x.aligned ? undefined : "red",
        cells: [
          <b key="j" className="font-semibold text-slate-900">
            {x.journey}
          </b>,
          x.riskOwner ?? "Not named",
          x.controlOwner,
          x.aligned ? (
            <span key="a" className="text-xs text-slate-500">
              Aligned
            </span>
          ) : (
            <Pill key="a" tone="red" label="Mismatch" />
          ),
          <b key="c" className="font-semibold">
            {x.complaints}
          </b>,
        ],
      }))}
    />
  );
}

function DataTrust() {
  const { open } = useDrawer();
  const tm = measure("u-screening");
  const ibs = measure("u-secfind");
  return (
    <StatList
      title="Data trust"
      figures={["m:u-screening", "f:service"]}
      rows={[
        { label: "Monitoring coverage", value: tm.l2[0].value, comparator: tm.l2[0].threshold, right: <Pill tone="grey" label="Unconfirmed" />, onClick: (el) => open("metric:u-screening", el) },
        { label: "Monitoring attestation", value: "Early", comparator: "before data check" },
        { label: "Service disruption", value: ibs.l2[2].value, comparator: ibs.l2[2].threshold, onClick: (el) => open("metric:u-secfind", el) },
      ]}
    />
  );
}

function RemovedOrExtended() {
  const { open } = useDrawer();
  return (
    <Card title="Removed or extended">
      <LineItem rail="red" text="Vulnerable-customer item" detail="removed 14 Oct" onClick={(el) => open("removed", el)} right={<Pill tone="red" label="Removed" />} />
      <LineItem rail="amber" text="Backlog deadline" detail={`extended ${FIG.escalation.extensions}× · limit ${FIG.escalation.extensionLimit}`} onClick={(el) => open("badnews", el)} right={<FlowPill w="overdue" />} />
    </Card>
  );
}

function SpeakUp() {
  return (
    <Card title="Speak-up">
      <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        {CULTURE.map((c) => (
          <StatRow key={c.label} label={c.label} value={c.value} comparator={c.against} />
        ))}
      </div>
    </Card>
  );
}

function AgentTiles() {
  const { state } = useStore();
  const a = agentFigures(QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft").length);
  useFigures(["f:agents"]);
  const tiles: [string, string, string][] = [
    ["Agents", String(a.agents), "on the roster"],
    ["Checks this week", String(a.checksThisWeek), "all agents"],
    ["Findings", String(a.findings), "this quarter"],
    ["Drafts with CRO", String(a.drafts), "waiting for a person"],
    ["Without approval", String(a.withoutApproval), "actions this quarter"],
    ["Pack preparation", `${a.packHours} h`, `was ${a.packHoursWas} h`],
  ];
  return (
    <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3 xl:grid-cols-6">
      {tiles.map(([l, v, c]) => (
        <KpiTile key={l} label={l} value={v} comparator={c} pill={<span className="text-violet-500">✦</span>} />
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
          <span key="a" className="text-violet-700">
            ✦ {agentName(f.agentId)}
          </span>,
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

/* ══ Chair ══════════════════════════════════════════════════════════════ */

function ChairAgenda() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const [opt, setOpt] = useState<string | null>(null);
  const rec = state.session.drafts["d-t234-options"];
  const q = measure("u-capacity");
  useFigures(["m:u-capacity", "m:u-restriction"]);
  return (
    <Card title="Agenda items" right={<Chip>{`Board Risk Committee · ${FIG.dates.brc}`}</Chip>}>
      <div className="border-l-[3px] border-t border-l-amber-500 border-t-slate-100 py-2 pl-2.5">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={(e) => open("decision:3", e.currentTarget)} className={`text-left text-[13px] font-semibold text-slate-900 ${focus}`}>
            Issue removed from board pack
          </button>
          <FlowPill w={rec.status === "ai_draft" ? "due" : "decided"} />
        </div>
        <p className="text-xs text-slate-500">Your decision · amber {FIG.vuln.quartersAmber} quarters, then dropped</p>
        {rec.status === "ai_draft" ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            {DRAFTS["d-t234-options"].options!.map((o) => (
              <label key={o.id} className="flex items-center gap-1.5 text-xs text-slate-700">
                <input type="radio" name="chair-d3" checked={opt === o.id} onChange={() => setOpt(o.id)} />
                {o.label}
              </label>
            ))}
            <button type="button" disabled={!opt} onClick={() => opt && dispatch({ type: "CHAIR_RECORD", draftId: "d-t234-options", optionId: opt })} className={btnPrimary}>
              Record decision
            </button>
          </div>
        ) : (
          <p className="mt-1 text-xs font-semibold text-slate-900">Recorded by Risk Committee Chair: {DRAFTS["d-t234-options"].options?.find((o) => o.id === rec.chosenOptionId)?.label}</p>
        )}
      </div>
      <StatRow label="Savings growth vs crime checks" value={q.value} comparator={`${q.comparator} · for noting`} rail="amber" onClick={(el) => open("decision:1", el)} />
      <StatRow label="Restriction breach: reportable" value={fmt.nOfM(FIG.restriction.breaches, FIG.restriction.tested)} comparator="for noting" rail="red" onClick={(el) => open("decision:2", el)} />
    </Card>
  );
}

function PackIntegrity() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const latest = state.session.manifestVersions[state.session.manifestVersions.length - 1];
  const restored = latest.itemIds.includes("pi-vuln");
  const asked = state.session.notes.some((n) => n.from === "Chair request");
  return (
    <Card
      title="Pack integrity"
      right={
        <button type="button" disabled={asked || restored} onClick={() => dispatch({ type: "SAVE_NOTE", text: "Restore vulnerable-customer exceptions to the 15 Dec agenda", from: "Chair request" })} className={btnPrimary}>
          {asked ? "Restore requested" : restored ? "Restored" : "Restore to agenda"}
        </button>
      }
    >
      <LineItem rail="red" text="Vulnerable-customer exceptions" detail="removed 14 Oct, no reason" onClick={(el) => open("removed", el)} right={<Pill tone="red" label="Removed" />} />
      <LineItem rail="amber" text={`${FIG.escalation.downgraded} issues downgraded`} detail="measure unchanged" onClick={(el) => open("badnews", el)} right={<Pill tone="amber" label="Downgraded" />} />
    </Card>
  );
}

function WaitingForCro() {
  const { state } = useStore();
  const waiting = QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft");
  return (
    <Card title="Waiting on CRO" right={<Chip>{String(waiting.length)}</Chip>}>
      {waiting.length ? waiting.map((q) => <LineItem key={q.draftId} text={q.title} right={<FlowPill w="draft" />} />) : <LineItem text="Nothing waiting" />}
    </Card>
  );
}

/* ══ CRO ════════════════════════════════════════════════════════════════ */

type QRow = { type: "Approve" | "Prepare" | "Send case" | "Chase"; item: string; due: string; rank: number; owner: string; action: ReactNode };

function WorkQueue() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const openIds = useOpenDrafts();
  const rows: QRow[] = [];
  for (const r of ROUTES) {
    if (r.caseDraftId && state.session.drafts[r.caseDraftId]?.status === "ai_draft") {
      const id = r.caseDraftId;
      rows.push({
        type: "Send case",
        item: `${r.eventId === "e-117" ? "Mortgage rate error" : EVENT_PLAIN[r.eventId]}: ${ROUTE_PLAIN[r.routeId]}`,
        due: r.clockHours === 24 ? "Immediate" : "Reporting period",
        rank: r.clockHours === 24 ? 0 : 6,
        owner: "Head of Compliance",
        action: (
          <button
            type="button"
            className={btn}
            onClick={() => {
              dispatch({ type: "ACCEPT", draftId: id });
              dispatch({ type: "SEND", draftId: id });
            }}
          >
            Send case
          </button>
        ),
      });
    }
  }
  const prep = (item: string, due: string, rank: number, owner: string, key: string) =>
    rows.push({
      type: "Prepare",
      item,
      due,
      rank,
      owner,
      action: (
        <button type="button" className={btn} onClick={(e) => open(key, e.currentTarget)}>
          Prepare
        </button>
      ),
    });
  prep("Restriction attestation evidence", FIG.dates.restrictionSignOff, 1, "Head of Financial Crime", "decision:2");
  prep("Decision 1 paper: restore or pace", FIG.dates.campaign, 2, "Board", "decision:1");
  prep("Decision 3 paper: dropped pack item", FIG.dates.brc, 4, "Risk Committee Chair", "decision:3");
  for (const q of QUEUE) {
    if (state.session.drafts[q.draftId]?.status !== "ai_draft") continue;
    rows.push({
      type: "Approve",
      item: q.title,
      due: `Before ${FIG.dates.brc}`,
      rank: 3,
      owner: agentName(q.agentId),
      action: (
        <span className="flex gap-1">
          <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "ACCEPT", draftId: q.draftId })}>
            Approve
          </button>
          <button type="button" className={btn} onClick={(e) => open(`queue:${q.draftId}`, e.currentTarget)}>
            Edit
          </button>
          <button type="button" className={btn} onClick={() => dispatch({ type: "REJECT", draftId: q.draftId, reason: "Not supported by the evidence" })}>
            Reject
          </button>
        </span>
      ),
    });
  }
  for (const o of ownerRows(openIds, draftTargets())) {
    if (!o.actions) continue;
    rows.push({
      type: "Chase",
      item: `${o.actions} ${o.actions === 1 ? "action" : "actions"} open`,
      due: `Before ${FIG.dates.brc}`,
      rank: 5,
      owner: o.role,
      action: (
        <button type="button" className={btn} onClick={(e) => open(`owner:${o.role}`, e.currentTarget)}>
          Send to owner
        </button>
      ),
    });
  }
  rows.sort((a, b) => a.rank - b.rank);
  return (
    <Table
      title="Work queue"
      right={<Chip>{String(rows.length)}</Chip>}
      cols="grid-cols-[84px_minmax(200px,1.6fr)_104px_minmax(140px,1fr)_212px]"
      head={["Type", "Item", "Due", "Owner", "Action"]}
      rightCols={[4]}
      rows={rows.map((r, i) => ({
        key: `${r.item}-${i}`,
        rail: r.due === "Immediate" ? "red" : undefined,
        cells: [
          <span key="t" className="text-xs font-semibold text-slate-600">
            {r.type}
          </span>,
          r.item,
          <span key="d" className={r.due === "Immediate" ? "font-semibold text-red-600" : "tabular-nums"}>
            {r.due}
          </span>,
          <span key="o" className="text-xs text-slate-500">
            {r.owner}
          </span>,
          r.action,
        ],
      }))}
    />
  );
}

function Deadlines() {
  return (
    <EventList
      title="Deadlines"
      items={[
        { date: FIG.dates.restrictionSignOff, text: "Restriction attestation", rail: "red" },
        { date: FIG.dates.campaign, text: "Savings campaign starts", rail: "amber" },
        { date: FIG.dates.brc, text: "Board Risk Committee" },
        { date: "18 Mar 27", text: "Incident-reporting rules start" },
      ]}
    />
  );
}

function ClocksDue() {
  const due = ROUTES.filter((r) => !routeDecided(r) && r.clockHours === 24);
  return (
    <Card title="Reporting clocks due" right={<Chip>{String(due.length)}</Chip>}>
      {due.map((r) => (
        <LineItem key={r.routeId} rail="red" text={`${r.eventId === "e-117" ? "Rate error" : "Restriction"}: ${ROUTE_PLAIN[r.routeId]}`} detail="immediate" right={<FlowPill w="due" />} />
      ))}
    </Card>
  );
}

function PackChecklist() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const latest = state.session.manifestVersions[state.session.manifestVersions.length - 1];
  const restore = state.session.drafts["d-t235-restore"];
  const ordered = [...PACK_ITEMS].sort((a, b) => Number(!!b.removal) - Number(!!a.removal));
  const [shown, more] = useCollapse(ordered, 8);
  return (
    <Card title="Pack checklist" right={<Chip>{`${latest.itemIds.length} of ${PACK_ITEMS.length} items · v${latest.version} ${latest.state}`}</Chip>}>
      <div>
        {shown.map((i) => {
          const inPack = latest.itemIds.includes(i.itemId);
          return (
            <LineItem
              key={i.itemId}
              rail={inPack ? undefined : "red"}
              text={plain(i.label)}
              right={
                !inPack && restore.status === "ai_draft" ? (
                  <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "ACCEPT", draftId: "d-t235-restore" })}>
                    Propose restore
                  </button>
                ) : (
                  <span className={`text-xs ${inPack ? "text-slate-500" : "font-semibold text-red-600"}`}>{inPack ? "In pack" : "Removed"}</span>
                )
              }
            />
          );
        })}
        {more}
      </div>
      <p className="pb-1 pt-3 text-sm font-semibold text-slate-900">Decision papers</p>
      {DECISIONS.map((d) => (
        <LineItem
          key={d.n}
          rail={d.rail}
          text={d.title}
          detail={`${d.decider} · ${d.due}`}
          right={
            <button type="button" className={btn} onClick={(e) => open(`decision:${d.n}`, e.currentTarget)}>
              Prepare paper
            </button>
          }
        />
      ))}
    </Card>
  );
}

/* ══ Registry ═══════════════════════════════════════════════════════════ */

const SECTIONS: Record<string, () => ReactNode> = {
  POSTURE: Posture,
  ESCALATION: Escalation,
  STILL_OPEN: () => <StillOpen />,
  UNCHANGED: () => <StillOpen title="Not changed" />,
  TRADEOFFS: Tradeoffs,
  CAPACITY: () => <CapacityChart />,
  CAPACITY_STATS: () => <CapacityChart withStats />,
  OWNERS: OwnersTable,
  HEATMAP: AttestationHeatmap,
  ATTEST_MONTH: AttestationMonth,
  ENFORCEMENT: EnforcementThemes,
  HORIZON: Horizon,
  RESTRICTION: RestrictionCard,
  REPORTING: ReportingTable,
  AUTONOMY: AgentAutonomy,
  RULES: Rules,
  ROSTER: AgentRoster,
  TUNING: TuningLab,
  ACTIVITY: Activity,
  DECISION_LOG: DecisionLog,
  EXCEPTIONS: Exceptions,
  MEASURES_FULL: () => <MeasureTable title="Board measures" variant="full" />,
  B_TILES: BusinessTiles,
  B_DECISIONS_REQ: DecisionsRequired,
  B_KEY_DATES: KeyDates,
  B_SINCE: SinceLastBoard,
  B_ASSURANCE: Assurance,
  B_STRATEGY: StrategyTable,
  B_CREDIT: CreditQuality,
  B_TENSIONS: PolicyTensions,
  B_NOT_MEASURED: NotMeasured,
  B_DUTY: ConsumerDuty,
  B_COMPLAINTS: Complaints,
  B_THEMES: Themes,
  B_VULN: Vulnerable,
  B_REDRESS: Redress,
  B_SIGNALS: Signals,
  B_DECISION_PANEL: DecisionPanel,
  B_REG_REL: RegulatorRelationship,
  B_SANCTIONS: Sanctions,
  B_FOUND: FoundIssues,
  B_JOURNEYS: Journeys,
  B_DATA_TRUST: DataTrust,
  B_REMOVED: RemovedOrExtended,
  B_SPEAKUP: SpeakUp,
  B_AGENT_TILES: AgentTiles,
  B_FINDINGS: AgentFindings,
  C_AGENDA: ChairAgenda,
  C_PACK: PackIntegrity,
  C_WAITING: WaitingForCro,
  R_QUEUE: WorkQueue,
  R_DEADLINES: Deadlines,
  R_CLOCKS_DUE: ClocksDue,
  R_PACK: PackChecklist,
  ...OVERVIEW_SECTIONS,
  ...STRATEGY_SECTIONS,
  ...RISK_SECTIONS,
  ...OBLIGATORY_SECTIONS,
  ...AGENT_SECTIONS,
  ...PERSONA_SECTIONS,
};

export function renderSection(id: SectionId): ReactNode {
  const C = SECTIONS[id];
  return C ? <C /> : null;
}

export const SECTION_IDS = Object.keys(SECTIONS);

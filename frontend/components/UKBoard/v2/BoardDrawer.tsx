"use client";

/**
 * UK Board v2 — DetailDrawer.
 * Board measure (metric:<id>): header (name · risk owner · status · attestation) → risk appetite
 * statement → measure visual with value, amber trigger, appetite limit and time to threshold → stance
 * (Tighten · Hold · Loosen) → Level 2 metrics and Level 3 controls (exception tree, with linkage) →
 * one trend chart → Evidence (collapsed) → History (collapsed).
 * Every other drawer: header → Position (stat list + at most one trend chart) → Level 2 metrics →
 * Level 3 controls → Attestation → Options · Evidence (collapsed) → History.
 * Roles only; no firm names. CRO drafts are not shown to the board member or the chair.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { ASSURANCE_VERDICTS, CAPACITY, CONTRIBUTORS, DRAFTS, EVENTS, HORIZON, KRI_DETAIL, RESTRICTION, ROUTES, SERIES, TENSION_PAIR, TM_RUNS, UNITS } from "@/lib/ukboard/v1/data";
import { CHECK_ORDER } from "@/lib/ukboard/v1/selectors";
import { AGENTS, QUEUE, TUNING } from "@/lib/ukboard/v2/agentsData";
import {
  APPETITE_STATEMENTS,
  attestationOf,
  DETECTION_SERIES,
  FIG,
  fmt,
  measure,
  MEASURES,
  mortgageHeadroomM,
  ownerRows,
  roleOf,
  thresholdCells,
  timeToThreshold,
  type Measure,
} from "@/lib/ukboard/v2/boardStore";
import { EVENT_PLAIN, FRANCHISES, plain, ROUTE_PLAIN } from "@/lib/ukboard/v2/boardTabs";
import LineChart from "./LineChart";
import { AttestationButton, ExceptionTree } from "./appetite";
import { MeasureVisual, StanceLine } from "./visuals";
import { AttestPill, DeltaMark, StatRow, StatusPill, VerdictPill } from "./present";
import { useStore } from "./store";
import { AuditList, btnPrimary, DraftCard, focus } from "./ui";
import type { DrawerKey } from "./drawerKeys";

const CHECK_NAME = { owner: "Risk owner", feed: "Data check", attestation: "Attestation", mapping: "Linked to policy" } as const;

type Row = { label: string; value: string; comparator?: string };
interface Chart {
  title: string;
  points: { label: string; value: number }[];
  threshold?: { value: number; label: string };
  suffix?: string;
}
interface Content {
  title: string;
  ownerRole?: string;
  pill?: ReactNode;
  position: Row[];
  chart?: Chart;
  drivers?: Row[];
  controls?: { control: string; owner: string; tested: string; result: string }[];
  attestation?: { date: string; state: ReturnType<typeof attestationOf> };
  body?: ReactNode;
  drafts: string[];
  actions?: ReactNode;
  evidenceUnitId?: string;
  refs: string[];
}

function Section({ title, open: init, children }: { title: string; open?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!!init);
  return (
    <section className="border-b border-slate-100 py-3">
      <h3>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`flex w-full items-center gap-1.5 rounded text-left text-sm font-semibold text-slate-900 ${focus}`}>
          {open ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
          {title}
        </button>
      </h3>
      {open ? <div className="mt-2">{children}</div> : null}
    </section>
  );
}

const CONTROL_OF: Record<string, string> = { "u-screening": "Same-day account monitoring", "u-sanctions": "Sanctions screening rule set", "u-restriction": "Onboarding restriction flag" };

function controlsFor(m: Measure) {
  const c = ASSURANCE_VERDICTS.find((x) => x.control === CONTROL_OF[m.id]);
  return c ? [{ control: c.control, owner: m.owner, tested: c.latestTest.replace(/, \d+ \w+ 2026$/, "").replace("Not tested in", "Untested"), result: c.verdict }] : undefined;
}

function attestationFor(id: string) {
  const ev = UNITS[id]?.integrity.attestation.evidence ?? "";
  const date = /(\d{2} \w+ 2026)/.exec(ev)?.[1];
  return { date: date ? date.replace(/^0/, "").replace(/ (\w{3})\w* 2026/, " $1") : "Not recorded", state: attestationOf(id) };
}

function driversFor(id: string): Row[] | undefined {
  const pr = UNITS[id]?.principalRiskId;
  const list = pr ? CONTRIBUTORS[pr] : undefined;
  return list?.slice(0, 4).map((c) => ({ label: plain(c.name), value: c.value.split(" ")[0], comparator: c.value.split(" ").slice(1).join(" ") }));
}

function trendFor(id: string): Chart | undefined {
  const m = MEASURES.find((x) => x.id === id);
  if (id === "u-capacity") return { title: "Alert queue age (days)", points: CAPACITY.queueAge, threshold: { value: CAPACITY.queueAmber, label: `amber ${CAPACITY.queueAmber}` } };
  if (id === "u-detect") return { title: `${m?.name ?? id} · 6 months`, points: DETECTION_SERIES, threshold: m?.amber !== undefined ? { value: m.amber, label: `amber ${m.amber}${m.unit ?? ""}` } : undefined };
  if (id === "u-screening") return { title: "Records reaching monitoring by run", points: TM_RUNS.map((r) => ({ label: r.runDate.split(" ")[1], value: Number(r.pct.replace(/[^\d.]/g, "")) })), suffix: "%" };
  const s = SERIES[id];
  if (!s) return undefined;
  return { title: `${m?.name ?? plain(UNITS[id]?.title ?? id)} · 6 quarters`, points: s.slice(-6), threshold: m?.amber !== undefined ? { value: m.amber, label: `amber ${m.amber}${m.unit ?? ""}` } : undefined };
}

function positionFor(m: Measure): Row[] {
  const t = thresholdCells(m);
  return [
    { label: "Value", value: m.short ?? m.value },
    { label: "Amber trigger", value: t.amber },
    { label: "Appetite limit", value: t.limit },
    { label: "Time to threshold", value: timeToThreshold(m) },
  ];
}

function content(key: DrawerKey, persona: string, session: ReturnType<typeof useStore>["state"]["session"]): Content | null {
  if (key.startsWith("metric:")) {
    // Board measures render MetricBody; this covers other units opened as metric:<id>.
    const id = key.slice(7);
    const u = UNITS[id];
    if (!u) return null;
    return {
      title: plain(u.title),
      ownerRole: plain(u.ownerRole),
      position: [{ label: "Position", value: plain(u.stateSentence) }],
      chart: trendFor(id),
      drivers: driversFor(id),
      attestation: attestationFor(id),
      drafts: u.draftIds,
      evidenceUnitId: id,
      refs: [id],
    };
  }
  if (key.startsWith("franchise:")) {
    const f = FRANCHISES.find((x) => `franchise:${x.id}` === key)!;
    const ms = MEASURES.filter((x) => x.objectiveId === f.id);
    const main = f.id === "O1" ? "u-hltv" : f.id === "O2" ? "u-capacity" : f.id === "O3" ? "u-lcr" : undefined;
    const headroom: Record<string, string> = { O1: `£${mortgageHeadroomM()}m to limit`, O2: `${FIG.savings.limitsBroken} of ${FIG.savings.limits} limits broken`, O3: "Narrowing", O4: "Not confirmed" };
    return {
      title: f.name,
      ownerRole: "Business line",
      pill: <VerdictPill v={f.verdict} />,
      position: [{ label: "Appetite statement", value: APPETITE_STATEMENTS[f.id] }, { label: "Headroom", value: headroom[f.id] }, ...ms.map((x) => ({ label: x.name, value: x.short ?? x.value, comparator: x.comparator }))].slice(0, 6),
      chart: main ? trendFor(main) : undefined,
      drivers: f.id === "O2" ? TENSION_PAIR.bounds.map((b) => ({ label: b.bound, value: b.actual, comparator: `vs ${b.agreed}` })) : undefined,
      drafts: f.id === "O1" ? ["d-t21-appetite", "d-t21-para"] : f.id === "O2" ? ["d-t26-redecide", "d-t26-floor"] : f.id === "O3" ? ["d-t24-owner", "d-t212-promo"] : [],
      evidenceUnitId: main,
      refs: ms.map((x) => x.id),
    };
  }
  switch (key) {
    case "decision:1": {
      const q = measure("u-capacity");
      return {
        title: "Savings growth vs crime checks",
        ownerRole: "Board · decision",
        pill: <StatusPill status={q.status} />,
        position: [
          { label: "Alert queue age", value: q.value, comparator: q.comparator },
          { label: "Members per handler", value: fmt.n(FIG.capacity.perHandler), comparator: `was ${fmt.n(FIG.capacity.perHandlerWas)}` },
          { label: "Alerts cleared in target", value: fmt.share(FIG.capacity.cleared, FIG.capacity.alerts) },
          { label: "Savings campaign", value: FIG.dates.campaign },
        ],
        chart: trendFor("u-capacity"),
        drafts: ["d-t25-choice", "d-t25-paper", "d-pg4"],
        evidenceUnitId: "u-capacity",
        refs: ["u-capacity"],
      };
    }
    case "decision:2":
    case "restriction":
      return {
        title: key === "restriction" ? "Restriction" : "Restriction breach: reportable",
        ownerRole: "Head of Financial Crime",
        pill: <StatusPill status="red" />,
        position: [
          { label: "Accounts in breach", value: fmt.nOfM(FIG.restriction.breaches, FIG.restriction.tested), comparator: "appetite 0" },
          { label: "Customers affected", value: String(FIG.restriction.customers), comparator: `${FIG.restriction.exited} previously exited` },
          { label: "Openings not checked", value: fmt.n(FIG.restriction.untested) },
          { label: "Attestation due", value: FIG.dates.restrictionSignOff },
        ],
        chart: { title: "Accounts in breach by run", points: FIG.restriction.runs },
        drivers: RESTRICTION.byRoute.map((b) => ({ label: plain(b.route), value: String(b.accounts), comparator: "accounts" })),
        controls: controlsFor(measure("u-restriction")),
        attestation: attestationFor("u-restriction"),
        drafts: ["d-case-r03-sup153", "d-case-r03-fr7", "d-t227-contain", "d-pg1-coverage", "d-t228-summary"],
        evidenceUnitId: "u-restriction",
        refs: ["u-restriction", "rt-r03-sup153", "rt-r03-fr7"],
      };
    case "decision:3":
    case "removed":
      return {
        title: "Issue removed from board pack",
        ownerRole: "Risk Committee Chair · decision",
        pill: <StatusPill status="amber" />,
        position: [
          { label: "Vulnerable exceptions", value: String(FIG.vuln.series[FIG.vuln.series.length - 1]), comparator: `amber ${FIG.vuln.amber} · red ${FIG.vuln.red}` },
          { label: "At amber", value: `${FIG.vuln.quartersAmber} quarters` },
          { label: "Removed at", value: "Executive Risk Committee", comparator: "14 Oct" },
          { label: "Reason recorded", value: "None" },
        ],
        chart: trendFor("u-vuln"),
        body: (
          <div>
            {session.manifestVersions.map((v) => (
              <StatRow key={v.version} label={`Board pack v${v.version} · ${v.state}`} value={v.itemIds.includes("pi-vuln") ? "Present" : "Absent"} comparator={v.createdOn.replace(" 2026", "")} />
            ))}
          </div>
        ),
        drafts: ["d-t234-options", "d-t235-restore", "d-pg5"],
        evidenceUnitId: "u-vuln",
        refs: ["u-vuln", "m-brc-q3-2026"],
      };
    case "badnews":
      return {
        title: "Escalation",
        ownerRole: "Chief Risk Officer",
        pill: <StatusPill status="amber" />,
        position: [
          { label: "Median time to committee", value: `${FIG.escalation.medianMonths} months`, comparator: `${FIG.escalation.issues} issues` },
          { label: "Not escalated after 12 months", value: String(FIG.escalation.notEscalated) },
          { label: "Customer checks overdue", value: fmt.n(FIG.escalation.overdueChecks), comparator: `target ${fmt.n(FIG.escalation.overdueTarget)}` },
          { label: "Deadline extensions", value: String(FIG.escalation.extensions), comparator: `limit ${FIG.escalation.extensionLimit}` },
        ],
        chart: { title: "Customer-check backlog", points: KRI_DETAIL.backlogSeries.points },
        drivers: FIG.escalation.unescalated.map((x) => ({ label: x.unit, value: `${x.months} months`, comparator: "not escalated" })),
        drafts: ["d-t236-agenda", "d-t237-review", "d-t238-reopen"],
        evidenceUnitId: "u-kri-latency",
        refs: ["u-kri-backlog", "u-kri-latency", "u-kri-effect"],
      };
    case "horizon":
      return {
        title: "Regulatory horizon",
        ownerRole: "Chief Risk Officer",
        position: [
          { label: "Emerging risks", value: String(HORIZON.emergingRisks) },
          { label: "Within 12 months", value: String(HORIZON.withinTwelveMonths) },
          { label: "Incident-reporting rules", value: FIG.dates.incidentRules, comparator: `${HORIZON.daysToIncidentRules} days` },
          { label: "Trial incidents classified", value: `${HORIZON.trialClassified.classified} of ${HORIZON.trialClassified.total}` },
        ],
        drafts: ["d-t213-metric"],
        evidenceUnitId: "u-horizon",
        refs: ["u-horizon"],
      };
    case "tuning":
      return { title: "Tuning lab", ownerRole: "Head of Financial Crime", position: TUNING.options.map((o) => ({ label: `${o.id} · ${o.label}`, value: `${o.caught} of ${TUNING.breaches}`, comparator: `+${fmt.n(o.extraAlerts)} alerts` })), drafts: [], refs: ["agent:tuning"] };
    case "notes":
      return { title: "My notes", ownerRole: "Board member", position: [], body: <NotesBody />, drafts: [], refs: ["notes"] };
  }
  if (key.startsWith("event:")) {
    const id = key.slice(6);
    const e = EVENTS.find((x) => x.eventId === id)!;
    return {
      title: id === "e-117" ? "Mortgage rate error" : EVENT_PLAIN[id],
      ownerRole: "Head of Compliance · decider",
      position: [
        { label: "Day", value: String(e.dayN), comparator: "from logged awareness" },
        ...ROUTES.filter((r) => r.eventId === id).map((r) => ({ label: ROUTE_PLAIN[r.routeId], value: r.status === "decided" ? "Decided" : r.status === "not_engaged" ? "Not started" : "Due", comparator: r.status === "decided" ? roleOf(r.history[0].deciderPersonId) : r.proposedDeciderRole })),
      ],
      drafts: id === "e-117" ? ["d-case-117-fr7", "d-case-117-sup1511", ...(persona === "cro" ? ["d-t230-prompt"] : [])] : ["d-case-r03-sup153", "d-case-r03-fr7"],
      evidenceUnitId: "u-restriction",
      refs: ROUTES.filter((r) => r.eventId === id).map((r) => r.routeId),
    };
  }
  if (key.startsWith("owner:")) {
    const role = key.slice(6);
    const open = Object.keys(session.drafts).filter((d) => session.drafts[d].status === "ai_draft");
    const o = ownerRows(open, Object.fromEntries(Object.values(DRAFTS).map((d) => [d.draftId, d.targetRole]))).find((x) => x.role === role);
    if (!o) return null;
    const worst = o.measures.find((m) => m.status !== "within") ?? o.measures[0];
    return {
      title: role,
      ownerRole: "Risk owner",
      pill: o.status === "none" ? undefined : <StatusPill status={o.status} />,
      position: o.measures.length ? o.measures.map((m) => ({ label: m.name, value: m.short ?? m.value, comparator: m.comparator })) : [{ label: "Board measures", value: "None held" }],
      chart: worst ? trendFor(worst.id) : undefined,
      drivers: [
        { label: "Off track", value: String(o.offTrack), comparator: `of ${o.measures.length}` },
        { label: "Actions open", value: String(o.actions) },
      ],
      attestation: worst ? attestationFor(worst.id) : undefined,
      drafts: [],
      actions: <ReasonableSteps role={role} />,
      refs: o.measures.map((m) => m.id),
    };
  }
  if (key.startsWith("agent:")) {
    const a = AGENTS.find((x) => `agent:${x.id}` === key);
    if (!a) return null;
    return {
      title: a.name,
      ownerRole: a.accountable,
      position: [
        { label: "Purpose", value: a.does },
        { label: "Checks this week", value: String(a.checksThisWeek) },
        { label: "Latest finding", value: a.finding },
        { label: "Autonomy", value: session.autonomy[a.id] },
      ],
      drafts: a.draftIds,
      refs: [`agent:${a.id}`, ...a.draftIds.map((d) => DRAFTS[d].unitId)],
    };
  }
  if (key.startsWith("queue:")) {
    const q = QUEUE.find((x) => `queue:${x.draftId}` === key);
    if (!q) return null;
    return { title: q.title, ownerRole: "Chief Risk Officer", position: [{ label: "Reason", value: q.reason }], drafts: [q.draftId], refs: [DRAFTS[q.draftId].unitId] };
  }
  if (key === "unmapped") {
    return { title: "Plan item with no appetite statement", ownerRole: "Chief Risk Officer", position: [{ label: FIG.unmapped.launch, value: FIG.unmapped.when, comparator: `${fmt.n(FIG.unmapped.accounts)} accounts` }, { label: "Appetite statement", value: "Missing" }], drafts: ["d-t23-ras"], evidenceUnitId: "u-unmapped", refs: ["u-unmapped"] };
  }
  return null;
}

function EvidenceRows({ unitId }: { unitId?: string }) {
  const ev = unitId ? UNITS[unitId] : undefined;
  if (!ev) return <p className="text-xs text-slate-500">No evidence record linked to this measure yet.</p>;
  return (
    <>
      {CHECK_ORDER.map((k) => (
        <StatRow key={k} label={CHECK_NAME[k]} value={ev.integrity[k].pass ? "Pass" : "Unconfirmed"} comparator={plain(ev.integrity[k].evidence)} />
      ))}
    </>
  );
}

function TrendChart({ chart }: { chart: Chart }) {
  return (
    <div data-chart="drawer-trend">
      <LineChart title={chart.title} height={140} series={[{ name: chart.title, points: chart.points }]} threshold={chart.threshold} suffix={chart.suffix} />
    </div>
  );
}

const SUB = "text-[11px] font-semibold uppercase tracking-wide text-slate-500";

/** Board measure drawer body: statement → measure visual → stance → exception tree → trend → evidence → history. */
function MetricBody({ m }: { m: Measure }) {
  const chart = trendFor(m.id);
  return (
    <>
      <section className="border-b border-slate-100 py-3">
        <p className={SUB}>Risk appetite statement</p>
        <p className="mt-1 text-sm text-slate-900">{m.statement}</p>
      </section>
      <section className="border-b border-slate-100 py-3">
        <div className="flex flex-wrap items-center gap-3 pb-2" data-chart="measure-visual">
          <MeasureVisual m={m} />
          <DeltaMark d={m.delta} />
        </div>
        <div className="min-w-0">
          {/* The visual prints the value; the rows carry the thresholds only. */}
          {positionFor(m)
            .filter((r) => r.label !== "Value")
            .map((r) => (
              <StatRow key={r.label} label={r.label} value={r.value} comparator={r.comparator} />
            ))}
        </div>
      </section>
      <section className="border-b border-slate-100 py-3">
        <p className={`pb-2 ${SUB}`}>Appetite stance</p>
        <StanceLine m={m} />
      </section>
      <section className="border-b border-slate-100 py-3">
        <ExceptionTree m={m} />
      </section>
      {chart ? (
        <section className="border-b border-slate-100 py-3">
          <TrendChart chart={chart} />
        </section>
      ) : null}
      <Section title="Evidence">
        <EvidenceRows unitId={m.id} />
      </Section>
      <Section title="History">
        <AuditList refs={[m.id, `metric:${m.id}`]} />
      </Section>
    </>
  );
}

function NotesBody() {
  const { state, dispatch } = useStore();
  const [text, setText] = useState("");
  const dives = state.session.deepDives;
  return (
    <div className="space-y-2">
      {state.session.notes.length ? state.session.notes.map((n) => <StatRow key={n.id} label={n.text} value="" comparator={n.from} />) : <p className="text-xs text-slate-500">No notes yet.</p>}
      {dives.map((d) => (
        <StatRow key={d} label={d} value="" comparator="deep dive with the CRO" rail="amber" />
      ))}
      <textarea aria-label="Note for the meeting" value={text} onChange={(e) => setText(e.target.value)} rows={3} className={`w-full rounded-md border border-slate-300 p-2 text-xs ${focus}`} placeholder="Note for the meeting" />
      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => {
          dispatch({ type: "SAVE_NOTE", text, from: "Note for the meeting" });
          setText("");
        }}
        className={btnPrimary}
      >
        Save note
      </button>
    </div>
  );
}

function ReasonableSteps({ role }: { role: string }) {
  const { state, dispatch } = useStore();
  const done = state.session.notes.some((n) => n.from === `Reasonable steps · ${role}`);
  return (
    <button type="button" disabled={done} onClick={() => dispatch({ type: "SAVE_NOTE", text: `Reasonable steps reviewed for ${role}`, from: `Reasonable steps · ${role}` })} className={btnPrimary}>
      {done ? "Reasonable steps recorded" : "Record reasonable steps"}
    </button>
  );
}

function GenericBody({ c, drafts }: { c: Content; drafts: string[] }) {
  return (
    <>
      {c.position.length || c.chart || c.body ? (
        <Section title="Position" open>
          {c.position.map((r) => (
            <StatRow key={r.label} label={r.label} value={r.value} comparator={r.comparator} />
          ))}
          {c.chart ? (
            <div className="mt-2">
              <TrendChart chart={c.chart} />
            </div>
          ) : null}
          {c.body}
        </Section>
      ) : null}
      {c.drivers?.length ? (
        <Section title="Level 2 metrics" open>
          {c.drivers.map((r) => (
            <StatRow key={r.label} label={r.label} value={r.value} comparator={r.comparator} />
          ))}
        </Section>
      ) : null}
      {c.controls?.length ? (
        <Section title="Level 3 controls" open>
          {c.controls.map((x) => (
            <StatRow key={x.control} label={x.control} value={x.tested} comparator={`${x.owner} · ${x.result}`} />
          ))}
        </Section>
      ) : null}
      {c.attestation ? (
        <Section title="Attestation" open>
          <StatRow label="Last attestation" value={c.attestation.date} right={<AttestPill a={c.attestation.state} />} />
        </Section>
      ) : null}
      {c.drafts.length || c.actions ? (
        <Section title="Options">
          {c.actions}
          {drafts.length ? drafts.map((id) => <DraftCard key={id} draftId={id} />) : c.drafts.length ? <p className="text-xs text-slate-500">With the CRO · proposal pending</p> : null}
        </Section>
      ) : null}
      {c.evidenceUnitId && UNITS[c.evidenceUnitId] ? (
        <Section title="Evidence">
          <EvidenceRows unitId={c.evidenceUnitId} />
        </Section>
      ) : null}
      <div className="py-3">
        <AuditList refs={c.refs} />
      </div>
    </>
  );
}

export default function BoardDrawer({ drawerKey, onClose }: { drawerKey: DrawerKey; onClose: () => void }) {
  const { state } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const m = drawerKey.startsWith("metric:") ? MEASURES.find((x) => x.id === drawerKey.slice(7)) : undefined;
  const c = m ? null : content(drawerKey, state.persona, state.session);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !ref.current) return;
      const f = [...ref.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea")].filter((x) => !x.hasAttribute("disabled"));
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, drawerKey]);

  if (!m && !c) return null;
  const drafts = c ? c.drafts.filter((id) => DRAFTS[id] && (state.persona === "cro" ? DRAFTS[id].gateHolder === "cro" : state.persona === "chair" ? DRAFTS[id].gateHolder === "brc_chair" : false)) : [];
  const title = m ? m.name : c!.title;
  const ownerRole = m ? `Risk owner: ${m.owner}` : c!.ownerRole;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close detail" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-slate-900/30" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="ukb2-drawer-title" className="relative flex h-full w-full max-w-[560px] flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="ukb2-drawer-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            {ownerRole ? <p className="mt-0.5 text-xs text-slate-500">{ownerRole}</p> : null}
            {m ? (
              <div className="mt-1.5">
                <AttestationButton measureId={m.id} />
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {m ? <StatusPill status={m.status} /> : c!.pill}
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={`rounded-lg border border-slate-300 p-1.5 hover:bg-slate-50 ${focus}`}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {m ? <MetricBody m={m} /> : c ? <GenericBody c={c} drafts={drafts} /> : null}
        </div>
      </div>
    </div>
  );
}

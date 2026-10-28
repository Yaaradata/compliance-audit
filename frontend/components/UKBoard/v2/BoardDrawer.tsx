"use client";

/**
 * UK Board v2 — right-hand detail drawer (600px). Sections in fixed order: Position ·
 * Why it matters · Options · Evidence · Precedent · History. First two open. Esc and ×
 * close; focus is trapped and returned. Plain words on the face; rule and control codes
 * appear only under Evidence. CRO drafts and the awareness date are not rendered for the
 * board member; CRO drafts are not rendered for the chair.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { CAPACITY, DRAFTS, EVENTS, HORIZON, RESTRICTION, ROUTES, SERIES, TENSION_PAIR, TM_COHORTS, TM_RUNS, UNITS } from "@/lib/ukboard/v1/data";
import { getPrecedent } from "@/lib/ukboard/v1/precedents";
import { CHECK_ORDER } from "@/lib/ukboard/v1/selectors";
import { METRICS, objectiveMetrics } from "@/lib/ukboard/v2/board";
import { AGENTS, QUEUE, TUNING } from "@/lib/ukboard/v2/agentsData";
import { appetiteUsedPct, FIG, fmt, measure, mortgageHeadroomM, reportingEvents } from "@/lib/ukboard/v2/boardStore";
import { ENFORCEMENT_LESSONS, EVENT_PLAIN, FRANCHISES, owners, plain, RESTRICTION_ROUTES, ROUTE_PLAIN, type Persona } from "@/lib/ukboard/v2/boardTabs";
import AppetiteDial from "./AppetiteDial";
import LineChart from "./LineChart";
import { useStore } from "./store";
import { AuditList, btnPrimary, DraftCard, focus, Pill, toneOf } from "./ui";
import type { DrawerKey } from "./drawerKeys";

const CHECK_NAME = { owner: "Owner", feed: "Data check", attestation: "Sign-off", mapping: "Linked to policy" } as const;

interface Content {
  title: string;
  pill?: ReactNode;
  position: ReactNode;
  why: string[];
  drafts: string[];
  evidenceUnitId?: string;
  extraEvidence?: ReactNode;
  precedentIds: string[];
  refs: string[];
  actions?: ReactNode;
}

function Section({ title, open: init, children }: { title: string; open?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!!init);
  return (
    <section className="border-b border-slate-100 py-3">
      <h3>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`flex w-full items-center gap-1.5 text-left text-[13px] font-bold text-slate-900 ${focus} rounded`}>
          {open ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
          {title}
        </button>
      </h3>
      {open ? <div className="mt-2 space-y-2">{children}</div> : null}
    </section>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-3 px-3 py-1.5">
          <dt className="text-slate-500">{k}</dt>
          <dd className="text-right font-semibold tabular-nums text-slate-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const meta = (id: string) => METRICS.find((m) => m.unitId === id);

function Dial({ unitId }: { unitId: string }) {
  const m = meta(unitId);
  if (!m) return null;
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2">
      <div className="flex items-baseline justify-between text-xs">
        <b className="text-slate-900">{m.name}</b>
        <span className="tabular-nums text-slate-500">
          <b className="text-slate-900">{m.value}</b> {m.denominator}
        </span>
      </div>
      {m.dial ? <AppetiteDial dial={m.dial} direction={m.direction} labels className="mt-1.5" /> : null}
      {m.projectionText ? <p className="mt-1 text-[11px] text-slate-500">Projection: {m.projectionText} · early warning, not a prediction</p> : null}
    </div>
  );
}

function capacityCharts() {
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  return (
    <>
      <LineChart
        title="Members against handlers (index)"
        series={[
          { name: "Members (1.45m → 1.90m)", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.membersM)[i] })) },
          { name: "Handlers (58 → 63)", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.handlers)[i] })), dashed: true },
        ]}
      />
      <LineChart title="Alert queue age" series={[{ name: "Queue age (days)", points: CAPACITY.queueAge }]} threshold={{ value: 14, label: "amber 14 days" }} suffix="d" />
      <Rows
        rows={[
          ["Alerts cleared within target", `${CAPACITY.slaCleared.value} (${CAPACITY.slaCleared.denominator})`],
          ["Next savings campaign", `${CAPACITY.campaignDate} (6 weeks)`],
          ["Resourcing decision recorded", "None"],
        ]}
      />
    </>
  );
}

function Routes({ eventId, showGap }: { eventId: string; showGap: boolean }) {
  const e = EVENTS.find((x) => x.eventId === eventId)!;
  return (
    <>
      <Rows rows={ROUTES.filter((r) => r.eventId === eventId).map((r) => [ROUTE_PLAIN[r.routeId], r.status === "decided" ? `Decided ${r.history[0].decidedOn}` : r.isSar ? (r.status === "not_engaged" ? "Closed" : "Open") : "Decision pending"] as [string, ReactNode])} />
      <p className="text-[11px] text-slate-500">Day {e.dayN} from the logged awareness date ({e.loggedAwareness}). Clock values to be checked against the rule text.</p>
      {showGap && e.awarenessGap ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-700">
          <b>Awareness date check (CRO only):</b> earlier linked records on {e.awarenessGap.signals[0].date} and {e.awarenessGap.signals[1].date}, {e.awarenessGap.gapDays} days before the logged date. The deciding senior manager decides whether it stands.
        </div>
      ) : null}
    </>
  );
}

function content(key: DrawerKey, persona: Persona, session: ReturnType<typeof useStore>["state"]["session"]): Content | null {
  const cro = persona === "cro";
  if (key.startsWith("metric:")) {
    const id = key.slice(7);
    const u = UNITS[id];
    if (!u) return null;
    const s = SERIES[id];
    return {
      title: meta(id)?.name ?? plain(u.title),
      position: (
        <>
          <Dial unitId={id} />
          {id === "u-capacity" ? capacityCharts() : null}
          {id === "u-tm" ? (
            <>
              <LineChart title="Records checked by run" series={[{ name: "Share checked (%)", points: TM_RUNS.map((r) => ({ label: r.runDate.split(" ")[1], value: Number(r.pct.replace("%", "")) })) }]} suffix="%" />
              <Rows rows={TM_COHORTS.map((c) => [c.cohort, `${c.pct} of ${c.records.toLocaleString("en-GB")}`] as [string, ReactNode])} />
            </>
          ) : null}
          {s && id !== "u-capacity" ? <LineChart title={plain(u.title)} series={[{ name: meta(id)?.name ?? "Measure", points: s }]} /> : null}
        </>
      ),
      why: WHY[id] ?? [plain(u.ruleLine.split(". ")[0]) + "."],
      drafts: u.draftIds,
      evidenceUnitId: id,
      precedentIds: u.precedentIds,
      refs: [id],
    };
  }
  if (key.startsWith("franchise:")) {
    const f = FRANCHISES.find((x) => `franchise:${x.id}` === key)!;
    return {
      title: f.name,
      pill: <Pill tone={toneOf(f.verdict)} label={f.verdict.replace(/_/g, " ")} />,
      position: (
        <>
          {objectiveMetrics(f.id).map((m) => (
            <Dial key={m.unitId} unitId={m.unitId} />
          ))}
          {f.id === "O2" ? <Rows rows={[...TENSION_PAIR.bounds.map((b) => [b.bound, `${b.actual} vs ${b.agreed}`] as [string, ReactNode]), ["Checks before transacting", "Broken · regulatory floor"]]} /> : null}
        </>
      ),
      why: [f.line, `${f.big} · ${f.trend}`],
      drafts: f.id === "O1" ? ["d-t21-appetite", "d-t21-para"] : f.id === "O2" ? ["d-t26-redecide", "d-t26-floor"] : f.id === "O3" ? ["d-t24-owner", "d-t212-promo"] : [],
      evidenceUnitId: f.id === "O1" ? "u-hltv" : f.id === "O2" ? "u-tension" : f.id === "O3" ? "u-nsfr" : "u-o4",
      precedentIds: [],
      refs: objectiveMetrics(f.id).map((m) => m.unitId),
    };
  }
  switch (key) {
    case "decision:1":
      return { title: "Savings growth vs crime checks", position: capacityCharts(), why: [`Members grew ${FIG.savings.membersGrowthPct}%; qualified handlers grew ${HANDLER_GROWTH_PCT}%.`, "Queue above amber since August.", "Only two choices: restore capacity or pace growth."], drafts: ["d-t25-choice", "d-t25-paper", "d-pg4"], evidenceUnitId: "u-capacity", precedentIds: ["uk-starling-2024", "uk-monzo-2025"], refs: ["u-capacity"] };
    case "decision:2":
    case "restriction":
      return {
        title: key === "restriction" ? "Restriction health" : "Restriction breach: report or not?",
        position: (
          <>
            <Rows
              rows={[
                ["Accounts in breach", `${fmt.nOfM(FIG.restriction.breaches, FIG.restriction.tested)} checked`],
                ["Customers", `${FIG.restriction.customers}, including ${FIG.restriction.exited} previously exited`],
                ["Not yet checked", `${fmt.n(FIG.restriction.untested)} partner-channel openings`],
                ...RESTRICTION_ROUTES.map((r) => [r.label, `${r.accounts} accounts`] as [string, ReactNode]),
                ["Clauses supported", `${FIG.restriction.clauses - FIG.restriction.clausesUnsupported} of ${FIG.restriction.clauses}`],
                ["Sign-off due", FIG.dates.restrictionSignOff],
              ]}
            />
            <p className="text-xs text-slate-600">
              The block fired {fmt.n(FIG.restriction.blockFired)} times, but the full check found {FIG.restriction.breaches} breaches.
            </p>
            <Routes eventId="e-r03" showGap={false} />
          </>
        ),
        why: ["The full customer check, not the block, shows the breach.", "The Head of Compliance decides each reporting route.", "Nothing is sent to a regulator by the product."],
        drafts: ["d-case-r03-sup153", "d-case-r03-fr7", "d-t227-contain", "d-pg1-coverage", "d-t228-summary"],
        evidenceUnitId: "u-restriction",
        extraEvidence: <EvidenceCodes />,
        precedentIds: ["uk-starling-2024", "uk-monzo-2025"],
        refs: ["u-restriction", "rt-r03-sup153", "rt-r03-fr7"],
      };
    case "decision:3":
    case "removed":
      return {
        title: "Issue removed from the board pack",
        position: (
          <>
            <LineChart title={`Vulnerable-customer exceptions ${FIG.vuln.basis}`} series={[{ name: FIG.vuln.basis, points: SERIES["u-vuln"] }]} threshold={{ value: FIG.vuln.amber, label: `amber at ${FIG.vuln.amber} · red ${FIG.vuln.red}` }} />
            <Rows
              rows={[
                ...session.manifestVersions.map((v) => [`Board pack v${v.version} (${v.state}) · ${v.createdOn}`, v.itemIds.includes("pi-vuln") ? "Item present" : "Item absent"] as [string, ReactNode]),
                ["Removed at", "Executive Risk Committee, 14 Oct 2026"],
                ["Approver · reason", "None recorded"],
              ]}
            />
          </>
        ),
        why: [`Amber for ${FIG.vuln.quartersAmber} quarters, past the 2-quarter rule (firm practice).`, "No action, decision or escalation recorded.", "Proves nothing was recorded, not that nothing was discussed."],
        drafts: ["d-t234-options", "d-t235-restore", "d-pg5"],
        evidenceUnitId: "u-vuln",
        precedentIds: [],
        refs: ["u-vuln", "m-brc-q3-2026"],
      };
    case "badnews":
      return {
        title: "Is bad news reaching us?",
        position: (
          <Rows
            rows={[
              ["Issue to Risk Committee (median)", `${FIG.escalation.medianMonths} months, ${FIG.escalation.issues} serious issues`],
              ["Not escalated after 12 months", String(FIG.escalation.notEscalated)],
              ["Customer checks overdue", `${fmt.n(FIG.escalation.overdueChecks)} vs ${fmt.n(FIG.escalation.overdueTarget)} target`],
              ["Actions closed, measure unchanged", `${FIG.escalation.actionsClosed} · ${FIG.escalation.downgraded} issues downgraded`],
              ["Customer-check backlog to clear", `${FIG.escalation.backlogMonths} months vs ${FIG.escalation.backlogCommitted} committed`],
              ["Deadline extensions", `${FIG.escalation.extensions} vs a limit of ${FIG.escalation.extensionLimit}`],
              ["Qualifying items in the pack", `${session.manifestVersions[session.manifestVersions.length - 1].itemIds.length} of ${FIG.pack.items}`],
            ]}
          />
        ),
        why: ["Serious issues take a median 4.6 months to reach us.", "Closed actions have not moved the overdue checks."],
        drafts: ["d-t236-agenda", "d-t237-review", "d-t238-reopen"],
        evidenceUnitId: "u-kri-latency",
        precedentIds: [],
        refs: ["u-kri-backlog", "u-kri-latency", "u-kri-effect"],
      };
    case "horizon":
      return {
        title: "What is coming?",
        position: <Rows rows={[["Emerging risks", String(HORIZON.emergingRisks)], ["Within 12 months", String(HORIZON.withinTwelveMonths)], ["Not yet measured", "AI impersonation fraud"], ["New incident-reporting rules", `18 Mar 2027 (${HORIZON.daysToIncidentRules} days)`], ["Incidents classified in a trial", `${HORIZON.trialClassified.classified} of ${HORIZON.trialClassified.total}`]]} />,
        why: ["1 of the 2 near-term risks has no measure or owner."],
        drafts: ["d-t213-metric"],
        evidenceUnitId: "u-horizon",
        precedentIds: [],
        refs: ["u-horizon"],
      };
    case "tuning":
      return { title: "Tuning lab", position: <Rows rows={TUNING.options.map((o) => [`${o.id} · ${o.label}`, `${o.caught} of 97 · +${o.extraAlerts.toLocaleString("en-GB")} alerts`] as [string, ReactNode])} />, why: ["The savings pot sits outside the restriction block."], drafts: [], precedentIds: [], refs: ["agent:tuning"] };
    case "notes":
      return { title: "My meeting notes", position: <NotesBody />, why: [], drafts: [], precedentIds: [], refs: ["notes"] };
  }
  if (key.startsWith("event:")) {
    const id = key.slice(6);
    return {
      title: EVENT_PLAIN[id],
      position: <Routes eventId={id} showGap={cro} />,
      why: id === "e-117" ? [`${fmt.n(FIG.rateError.customers)} customers moved to the reversion rate without notice.`, `${eventRoutes(id).decided} of ${eventRoutes(id).routes} reporting routes has a recorded decision.`] : ["No reporting route decided yet; clocks are immediate."],
      drafts: id === "e-117" ? ["d-case-117-fr7", "d-case-117-sup1511", ...(cro ? ["d-t230-prompt"] : [])] : ["d-case-r03-sup153", "d-case-r03-fr7"],
      evidenceUnitId: "u-restriction",
      extraEvidence: <EvidenceCodes />,
      precedentIds: [],
      refs: ROUTES.filter((r) => r.eventId === id).map((r) => r.routeId),
    };
  }
  if (key.startsWith("owner:")) {
    const role = key.slice(6);
    const o = owners(Object.fromEntries(Object.values(DRAFTS).map((d) => [d.draftId, d.targetRole]))).find((x) => x.role === role);
    if (!o) return null;
    return {
      title: role,
      position: (
        <>
          {o.measures.map((m) => (
            <Dial key={m.unitId} unitId={m.unitId} />
          ))}
          <Rows rows={[["Last sign-off", o.lastSignOff], ["Open actions routed here", String(o.draftIds.length)]]} />
        </>
      ),
      why: [`Owns ${o.measures.length} board measures; ${o.offTrack} off track.`],
      drafts: o.draftIds,
      precedentIds: [],
      refs: o.measures.map((m) => m.unitId),
      actions: <ReasonableSteps role={role} />,
    };
  }
  if (key.startsWith("agent:")) {
    const a = AGENTS.find((x) => `agent:${x.id}` === key);
    if (!a) return null;
    return {
      title: a.name,
      position: <Rows rows={[["Does", a.does], ["This week", `${a.checksThisWeek} checks`], ["Latest finding", a.finding], ["Accountable", a.accountable], ["Autonomy", session.autonomy[a.id]]]} />,
      why: ["Agents watch, draft, test and propose; a named person decides."],
      drafts: a.draftIds,
      precedentIds: [],
      refs: [`agent:${a.id}`, ...a.draftIds.map((d) => DRAFTS[d].unitId)],
    };
  }
  if (key.startsWith("queue:")) {
    const q = QUEUE.find((x) => `queue:${x.draftId}` === key);
    if (!q) return null;
    return { title: q.title, position: <p className="text-xs text-slate-600">{q.reason}</p>, why: [], drafts: [q.draftId], precedentIds: [], refs: [DRAFTS[q.draftId].unitId] };
  }
  if (key.startsWith("lesson:")) {
    const id = key.slice(7);
    const l = ENFORCEMENT_LESSONS.find((x) => x.id === id)!;
    return { title: getPrecedent(id)?.respondent ?? id, position: <Dial unitId={l.unitId} />, why: [`${l.what} → ${l.touches}.`], drafts: [], precedentIds: [id], refs: [l.unitId] };
  }
  if (key === "unmapped") {
    return { title: "Plan item with no appetite statement", position: <Rows rows={[[FIG.unmapped.launch, `${FIG.unmapped.when} · ${fmt.n(FIG.unmapped.accounts)} accounts`], ["Appetite statement", "Missing"], ["Financial-crime measure", "Missing"]]} />, why: ["A plan item uses appetite with no board limit."], drafts: ["d-t23-ras"], evidenceUnitId: "u-unmapped", precedentIds: [], refs: ["u-unmapped"] };
  }
  return null;
}

const eventRoutes = (id: string) => reportingEvents().find((e) => e.id === id)!;
const HANDLER_GROWTH_PCT = Math.round((CAPACITY.handlers[CAPACITY.handlers.length - 1] / CAPACITY.handlers[0] - 1) * 100);

const WHY: Record<string, string[]> = {
  "u-restriction": [
    `The full check found ${FIG.restriction.breaches} accounts in breach of ${fmt.n(FIG.restriction.tested)}.`,
    `${RESTRICTION_ROUTES[0].accounts} came through the new savings pot, outside the block.`,
    `${fmt.n(FIG.restriction.untested)} partner-channel openings are not yet checked.`,
  ],
  "u-tm": [`Only ${fmt.pct(FIG.monitoring.coverage, 1)} of payment records reached monitoring.`, "Same-day accounts were not monitored at all.", "Signed off before the data run finished."],
  "u-sanctions": [`${FIG.sanctions.rules} rules cover ${fmt.n(FIG.sanctions.entries)} list entries.`, `No alerts in ${FIG.sanctions.weeksNoAlerts} weeks against ${FIG.sanctions.expectedPerWeek} a week expected.`],
  "u-capacity": [`Queue ${measure("u-capacity").value} against ${measure("u-capacity").comparator}, since August.`, `Members per handler rose from ${fmt.n(FIG.capacity.perHandlerWas)} to ${fmt.n(FIG.capacity.perHandler)}.`],
  "u-lcr": ["Reaches amber in about 9 weeks; the Risk Committee is in 7."],
  "u-nsfr": ["Fell from 10 to 2 points above amber in one quarter."],
  "u-hltv": [`${appetiteUsedPct()}% of high-LTV appetite used; £${mortgageHeadroomM()}m headroom to the limit on ${fmt.gbpBn(FIG.mortgages.planBn)}.`],
};

function EvidenceCodes() {
  return (
    <ul className="space-y-0.5 text-[11px] text-slate-500">
      {ROUTES.filter((r) => !r.isSar).map((r) => (
        <li key={r.routeId}>
          {r.name}: {r.ruleText}
        </li>
      ))}
      <li>Restriction reference: {RESTRICTION.ref}</li>
    </ul>
  );
}

function NotesBody() {
  const { state, dispatch } = useStore();
  const [text, setText] = useState("");
  return (
    <div className="space-y-2">
      {state.session.notes.length ? (
        <ul className="space-y-1">
          {state.session.notes.map((n) => (
            <li key={n.id} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700">
              <b className="text-slate-500">{n.from}:</b> {n.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">No notes yet.</p>
      )}
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

export default function BoardDrawer({ drawerKey, onClose }: { drawerKey: DrawerKey; onClose: () => void }) {
  const { state } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const c = content(drawerKey, state.persona, state.session);

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

  if (!c) return null;
  // Persona scoping: CRO drafts are not rendered for the board member or the chair.
  const drafts = c.drafts.filter((id) => DRAFTS[id] && (state.persona === "cro" ? DRAFTS[id].gateHolder === "cro" : state.persona === "chair" ? DRAFTS[id].gateHolder === "brc_chair" : false));
  const ev = c.evidenceUnitId ? UNITS[c.evidenceUnitId] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close detail" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-slate-900/30" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="ukb2-drawer-title" className="relative flex h-full w-full max-w-[600px] flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="ukb2-drawer-title" className="text-base font-bold text-slate-900">
              {c.title}
            </h2>
            {ev ? <p className="mt-0.5 text-xs text-slate-500">Owner: {plain(ev.ownerRole)}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {c.pill}
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={`rounded-lg border border-slate-300 p-1.5 hover:bg-slate-50 ${focus}`}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <Section title="Position" open>
            {c.position}
          </Section>
          {c.why.length ? (
            <Section title="Why it matters" open>
              <ul className="list-disc space-y-1 pl-4 text-[13px] text-slate-800">
                {c.why.map((w) => (
                  <li key={w}>{plain(w)}</li>
                ))}
              </ul>
            </Section>
          ) : null}
          {c.drafts.length || c.actions ? (
            <Section title="Options">
              {c.actions}
              {drafts.length ? drafts.map((id) => <DraftCard key={id} draftId={id} />) : c.drafts.length ? <p className="text-xs text-slate-500">With CRO · proposal pending</p> : null}
            </Section>
          ) : null}
          {ev ? (
            <Section title="Evidence">
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {CHECK_ORDER.map((k) => (
                  <div key={k} className="flex items-start gap-2 px-3 py-1.5 text-xs">
                    <Pill tone={ev.integrity[k].pass ? "green" : "grey"} outline label={ev.integrity[k].pass ? "Pass" : "Unconfirmed"} />
                    <span className="text-slate-600">
                      <b className="text-slate-900">{CHECK_NAME[k]}:</b> {ev.integrity[k].evidence}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                References: {ev.spine.filter((s) => s.ref).map((s) => `${s.label} (${s.ref})`).join(" · ") || "none"} · as at {ev.integrity.asOf}
              </p>
              {c.extraEvidence}
            </Section>
          ) : null}
          {c.precedentIds.length ? (
            <Section title="Precedent">
              {c.precedentIds.map((id) => {
                const p = getPrecedent(id);
                return p ? (
                  <p key={id} className="text-xs text-slate-700">
                    <b>{p.respondent}</b> ({p.regulator}{p.noticeDate ? `, ${p.noticeDate}` : ""}) · {p.posture}: {p.hook}
                  </p>
                ) : null;
              })}
            </Section>
          ) : null}
          <div className="py-3">
            <AuditList refs={c.refs} />
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

/**
 * UK Board v2 — Board member Obligatory · Level 0 and Accountability tabs.
 * Obligatory: zero-appetite banner, the obligatory board measures with attestation,
 * reportable events, the restriction breach with its route bar, screening Level 2 rows and the
 * linkage gap, Consumer Duty outcomes, vulnerable customers, redress and enforcement themes.
 * Chart budget: measure visuals and the restriction route bar only.
 * Accountability: risk owners with SMF certification evidence, line of sight, the attestation
 * heatmap, a lines-of-defence stacked bar, culture and items removed or extended.
 * Chart budget: the heatmap and the lines-of-defence bar only.
 * Figures come from lib/ukboard/v2/boardStore.ts; nothing here notifies a regulator or changes a limit.
 */
import { DRAFTS, RESTRICTION } from "@/lib/ukboard/v1/data";
import { CULTURE, ISSUES_FOUND, SIGNOFF_HISTORY, SIGNOFF_MONTHS, type SignOffMark } from "@/lib/ukboard/v2/boardMemberData";
import {
  attestationRecord,
  consumerDuty,
  ENFORCEMENT_THEMES,
  FIG,
  fmt,
  issuesFound,
  measure,
  MEASURES,
  OWNER_ROLES,
  ownerRows,
  rateErrorPct,
  SMF_CERT,
} from "@/lib/ukboard/v2/boardStore";
import { AttestationButton, ExceptionTree, LineOfSightTable } from "./appetite";
import { useDrawer } from "./drawerContext";
import { AttestPill, BarRows, Card, ChartCard, Chip, FlowPill, LineItem, StatRow, StatusPill, Table, useFigures } from "./present";
import { useStore } from "./store";
import { btn, focus, Pill } from "./ui";
import { EventRouteMatrix, MeasureVisual, ProgressPace, Sparkline, StatusPips } from "./visuals";

/* ── Seed constants (new on this tab) ────────────────────────────────── */

/** Plain labels for the restriction breach routes (RESTRICTION.byRoute lanes). */
const ROUTE_LABEL: Record<string, string> = { product: "New savings pot", migration: "Group migration", manual: "Manual override at branch" };
/** First month of the attestation record for owners added after the record began. */
const RECORD_STARTS = "Record starts Oct 2026";
/** Lines-of-defence labels for ISSUES_FOUND.by (internal audit is the third line and reports to the audit chair). */
const LINE_LABEL: Record<string, string> = {
  "First line": "First line · business",
  "Second line": "Second line · risk and compliance",
  "Internal audit": "Third line · internal audit → audit chair",
  Regulator: "Regulator · outside the lines",
};

const OBLIGATORY = () => MEASURES.filter((m) => m.tier === "obligatory").sort((a, b) => a.num - b.num);

/* ══ Obligatory · Level 0 ═══════════════════════════════════════════════ */

/** The four zero-appetite measures, each in its own form (§3), with attestation and risk owner. */
function ZeroAppetiteCards() {
  const { open } = useDrawer();
  const rows = OBLIGATORY();
  useFigures(rows.map((m) => `m:${m.id}`));
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-chart="measure-visuals">
      {rows.map((m) => (
        <section key={m.id} className={`flex h-full flex-col gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 ${m.status === "red" ? "border-l-[3px] border-l-red-500" : m.status === "amber" ? "border-l-[3px] border-l-amber-500" : ""}`}>
          <div className="flex items-start justify-between gap-2">
            <button type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`rounded text-left text-sm font-semibold leading-snug text-slate-900 hover:underline ${focus}`}>
              {m.name}
            </button>
            <StatusPill status={m.status} />
          </div>
          <div className="flex-1">
            <MeasureVisual m={m} width={120} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
            <span>Risk owner: {m.owner}</span>
            <AttestationButton measureId={m.id} />
          </div>
        </section>
      ))}
    </div>
  );
}

/** Reportable events × routes, with the decider and read-across per event. Escalation drafts a note only. */
function ReportableMatrix() {
  const { state, dispatch } = useStore();
  const canEscalate = state.persona !== "board";
  useFigures(["f:routes"]);
  return (
    <Card title="Reportable events" right={<span className="text-xs text-slate-500">Decider decides; nothing is sent from here</span>}>
      <EventRouteMatrix
        detail={(e) => (
          <>
            {`${e.classification} · found ${e.found} · ${e.decider} · read-across ${e.readAcross.toLowerCase()}`}
            {canEscalate ? (
              <button
                type="button"
                disabled={state.session.escalated.includes(e.id)}
                onClick={() => dispatch({ type: "ESCALATE_EVENT", eventId: e.id, decider: e.decider })}
                className={`${btn} mt-1 block`}
              >
                {state.session.escalated.includes(e.id) ? "Note drafted" : "Escalate for decision"}
              </button>
            ) : null}
          </>
        )}
      />
    </Card>
  );
}

function RestrictionBreach() {
  const { open } = useDrawer();
  const r = FIG.restriction;
  const m = measure("u-restriction");
  useFigures(["f:restriction"]);
  return (
    <Card title="Restriction breach" rail="red" right={<StatusPill status={m.status} />}>
      <StatRow label="Accounts tested" value={fmt.nOfM(r.tested, RESTRICTION.inScope)} comparator="in scope" onClick={(el) => open("restriction", el)} />
      <StatRow label="Customers affected" value={fmt.n(r.customers)} comparator={`${r.exited} previously exited`} />
      <StatRow label="Openings not checked" value={fmt.n(r.untested)} comparator="partner channel" rail="red" />
      <StatRow label="Clauses not supported" value={fmt.nOfM(r.clausesUnsupported, r.clauses)} comparator={`attestation ${FIG.dates.restrictionSignOff}`} />
      <p className="pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Accounts in breach by route</p>
      <div data-chart="restriction-routes" className="pt-1">
        <BarRows max={Math.max(...RESTRICTION.byRoute.map((b) => b.accounts))} rows={[...RESTRICTION.byRoute].sort((a, b) => b.accounts - a.accounts).map((b) => ({ label: ROUTE_LABEL[b.lane] ?? b.route, value: b.accounts, display: fmt.n(b.accounts) }))} />
      </div>
    </Card>
  );
}

function Screening() {
  const m = measure("u-screening");
  const s = FIG.sanctions;
  useFigures(["f:screening-l2"]);
  return (
    <Card title="Monitoring and sanctions screening" right={<StatusPill status={m.status} />}>
      <ExceptionTree m={m} />
      <StatRow label="Sanctions alerts" value="None" comparator={`${s.weeksNoAlerts} weeks · ${s.expectedPerWeek} a week expected`} />
      <StatRow label="Attestation" value="Unconfirmed" comparator={`Risk owner: ${m.owner}`} />
    </Card>
  );
}

function DutyOutcomes() {
  const cd = consumerDuty();
  useFigures(["f:cd-outcomes"]);
  const key = (name: string, k: string) =>
    name === "Consumer understanding" ? `letters ${fmt.pct(FIG.letters.pct)} · target ${fmt.pct(FIG.letters.target)}` : name === "Consumer support" ? `call wait ${FIG.callWait.value} · target ${FIG.callWait.target}` : k.toLowerCase();
  return (
    <Card title="Consumer Duty outcomes" right={<Chip>{`${cd.inTol} of ${cd.total} measures in tolerance`}</Chip>}>
      <div className="grid grid-cols-1 gap-4 pb-1 sm:grid-cols-2 xl:grid-cols-4">
        {FIG.outcomes.map((o) => (
          <div key={o.name} className={`flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2.5 ${o.status === "amber" ? "border-l-[3px] border-l-amber-500" : ""}`}>
            <span className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">{o.name}</span>
              <StatusPill status={o.status === "amber" ? "amber" : "within"} />
            </span>
            <StatusPips items={Array.from({ length: o.measures }, (_, i) => ({ label: `Measure ${i + 1}`, status: i < o.inTolerance ? "within" : "amber" }))} display={`${fmt.nOfM(o.inTolerance, o.measures)} in tolerance`} />
            <span className="text-xs text-slate-500">{key(o.name, o.key)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function VulnerableCustomers() {
  const { open } = useDrawer();
  const v = FIG.vuln;
  return (
    <Card title="Vulnerable customers" rail="amber" className="h-full">
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 py-2.5" data-chart="vuln-sparkline">
        <b className="text-2xl font-semibold leading-7 tabular-nums text-slate-900">{v.series[v.series.length - 1]}</b>
        <Sparkline values={v.series} amber={v.amber} label={`Exceptions ${v.basis}, ${v.labels[0]} to ${v.labels[v.labels.length - 1]}`} />
        <span className="text-xs text-slate-500">{`exceptions ${v.basis.replace(" contacts", "")} · amber ${v.amber} · red ${v.red}`}</span>
      </div>
      <StatRow label="Past amber" value={`${v.quartersAmber} quarters`} comparator="removed from pack" onClick={(el) => open("removed", el)} />
    </Card>
  );
}

function RateRedress() {
  const { open } = useDrawer();
  const r = FIG.rateError;
  return (
    <Card title="Mortgage-rate redress" className="h-full">
      <button type="button" onClick={(e) => open("event:e-117", e.currentTarget)} className={`block w-full border-t border-slate-100 py-2.5 text-left ${focus}`}>
        <ProgressPace actual={r.contacted} target={r.customers} text={`${fmt.nOfM(r.contacted, r.customers)} customers contacted · ${fmt.pct(rateErrorPct())}`} width={220} />
      </button>
      <StatRow label="Still to contact" value={fmt.n(r.customers - r.contacted)} comparator="customers" />
      <StatRow label="Redress estimate" value={fmt.gbpK(r.redressK)} comparator={`by ${r.due}`} />
    </Card>
  );
}

function Enforcement() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const done = state.session.drafts["d-t232-readacross"]?.status !== "ai_draft";
  return (
    <Card
      className="h-full"
      title="Enforcement themes"
      right={
        state.persona === "cro" ? (
          <button type="button" disabled={done} onClick={() => dispatch({ type: "ACCEPT", draftId: "d-t232-readacross" })} className={btn}>
            {done ? "Read-across recorded" : "Record read-across"}
          </button>
        ) : (
          <span className="text-xs text-slate-500">Read-across to our board measures</span>
        )
      }
    >
      {ENFORCEMENT_THEMES.map((t) => (
        <LineItem key={t.theme} text={t.theme} detail={t.source} onClick={(el) => open(`metric:${t.measureId}`, el)} right={<Chip>{measure(t.measureId).name}</Chip>} />
      ))}
    </Card>
  );
}

/* ══ Accountability ═════════════════════════════════════════════════════ */

const draftTargets = () => Object.fromEntries(Object.values(DRAFTS).map((d) => [d.draftId, d.targetRole]));

function OwnersWithEvidence() {
  const { state } = useStore();
  const { open } = useDrawer();
  const openIds = Object.keys(state.session.drafts).filter((id) => state.session.drafts[id].status === "ai_draft");
  const rows = ownerRows(openIds, draftTargets());
  useFigures(["f:owners", "f:smf-cert"]);
  return (
    <Table
      title="Risk owners"
      right={<Chip>{`${fmt.nOfM(SMF_CERT.evidence, SMF_CERT.smfs)} SMFs with certification evidence · next certification ${SMF_CERT.next}`}</Chip>}
      cols="grid-cols-[minmax(180px,1.6fr)_88px_80px_96px_minmax(140px,1fr)_130px]"
      head={["Risk owner", "Board measures", "Off track", "Actions open", "Attestation this month", "Status"]}
      rightCols={[1, 2, 3, 5]}
      rows={rows.map((o) => ({
        key: o.role,
        rail: o.status === "red" ? "red" : o.status === "amber" ? "amber" : undefined,
        onClick: (el) => open(`owner:${o.role}`, el),
        cells: [
          <b key="r" className="font-semibold text-slate-900">
            {o.role}
          </b>,
          <b key="m" className="font-semibold">
            {o.measures.length}
          </b>,
          <b key="o" className="font-semibold">
            {o.offTrack}
          </b>,
          <b key="a" className="font-semibold">
            {o.actions}
          </b>,
          <AttestPill key="t" a={o.attest} />,
          o.status === "none" ? (
            <span key="s" className="text-xs text-slate-400">
              No board measure
            </span>
          ) : (
            <StatusPill key="s" status={o.status} />
          ),
        ],
      }))}
    />
  );
}

const MARK: Record<SignOffMark, { cls: string; word: string }> = {
  on_time: { cls: "bg-slate-400", word: "On time" },
  late: { cls: "bg-amber-500", word: "Late" },
  missing: { cls: "border border-dashed border-slate-400 bg-white", word: "Missing" },
  early: { cls: "bg-red-500", word: "Before data check" },
};

function AttestationRecord() {
  const r = attestationRecord();
  const withHistory = new Set(SIGNOFF_HISTORY.map((o) => o.role));
  const newOwners = OWNER_ROLES.map((o) => o.role).filter((role) => !withHistory.has(role));
  useFigures(["f:attest-record"]);
  return (
    <ChartCard id="attestation-heatmap" title="Attestation record" right={<Chip>{`${fmt.nOfM(r.onTime, r.cells)} owner-months on time`}</Chip>}>
      <div className="grid grid-cols-[190px_repeat(12,minmax(0,1fr))] items-center gap-1 pt-1 text-[11px] text-slate-500">
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
        {newOwners.map((role) => (
          <div key={role} className="contents">
            <span className="flex h-7 items-center text-xs text-slate-800">{role}</span>
            <span className="col-span-12 flex h-5 items-center rounded border border-slate-100 px-2 text-xs text-slate-400">{RECORD_STARTS}</span>
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

function LinesOfDefence() {
  const f = issuesFound();
  const SHADE = ["bg-slate-700", "bg-slate-500", "bg-slate-400", "bg-slate-300"];
  useFigures(["f:found"]);
  return (
    <ChartCard id="lines-of-defence" title="Who found the issues" right={<Chip>{`${fmt.n(f.total)} issues`}</Chip>}>
      <div className="mb-1 mt-1 flex h-4 overflow-hidden rounded-full" role="img" aria-label={ISSUES_FOUND.by.map((b) => `${LINE_LABEL[b.line] ?? b.line}: ${b.n}`).join(", ")}>
        {ISSUES_FOUND.by.map((b, i) => (
          <span key={b.line} className={SHADE[i]} style={{ width: `${(b.n / f.total) * 100}%` }} title={`${LINE_LABEL[b.line] ?? b.line}: ${b.n}`} />
        ))}
      </div>
      {ISSUES_FOUND.by.map((b, i) => (
        <StatRow
          key={b.line}
          label={LINE_LABEL[b.line] ?? b.line}
          value={fmt.n(b.n)}
          comparator={i === 0 ? `${fmt.share(b.n, f.total)} · aim: most` : fmt.share(b.n, f.total)}
          right={<span className={`h-2.5 w-2.5 rounded-sm ${SHADE[i]}`} />}
        />
      ))}
    </ChartCard>
  );
}

function Culture() {
  useFigures(["f:culture"]);
  return (
    <Card title="Culture and speak-up">
      {CULTURE.map((c) => (
        <StatRow key={c.label} label={c.label} value={c.value} comparator={c.against} rail={c.tone === "amber" ? "amber" : undefined} />
      ))}
    </Card>
  );
}

function RemovedExtended() {
  const { open } = useDrawer();
  const e = FIG.escalation;
  return (
    <Card title="Removed or extended" right={<span className="text-xs text-slate-500">Items taken off the pack or given more time</span>}>
      <LineItem rail="red" text="Vulnerable-customer item" detail="removed 14 Oct" onClick={(el) => open("removed", el)} right={<Pill tone="red" label="Removed" />} />
      <LineItem rail="amber" text="Backlog deadline" detail={`extended ${e.extensions}× · limit ${e.extensionLimit}`} onClick={(el) => open("badnews", el)} right={<FlowPill w="overdue" />} />
    </Card>
  );
}

export const OBLIGATORY_SECTIONS = {
  OB_CARDS: ZeroAppetiteCards,
  OB_REPORTABLE: ReportableMatrix,
  OB_RESTRICTION: RestrictionBreach,
  OB_SCREENING: Screening,
  OB_DUTY: DutyOutcomes,
  OB_VULN: VulnerableCustomers,
  OB_REDRESS: RateRedress,
  OB_ENFORCEMENT: Enforcement,
  AC_OWNERS: OwnersWithEvidence,
  AC_SIGHT: () => <LineOfSightTable />,
  AC_HEATMAP: AttestationRecord,
  AC_DEFENCE: LinesOfDefence,
  AC_CULTURE: Culture,
  AC_REMOVED: RemovedExtended,
};

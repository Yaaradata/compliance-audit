"use client";

/**
 * UK Board v2 — the right-hand detail drawer (replaces the drill pages).
 * Sections in fixed order: Position · Why it matters · Options · Evidence · Precedent · Audit trail.
 * The first two open. Esc and × close; focus is trapped while open and returned to the opener.
 * Rule codes are allowed here, never on the page face. CRO drafts and the awareness gap are
 * not rendered for the BRC chair.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import {
  CAPACITY,
  CONSTRAINT_LADDER,
  DRAFTS,
  EVENTS,
  HORIZON,
  KRI_DETAIL,
  PACK_ITEMS,
  PEOPLE,
  RESTRICTION,
  ROUTES,
  SCREENING,
  SERIES,
  TENSION_PAIR,
  THRESHOLDS,
  TM_ATTESTATIONS,
  TM_COHORTS,
  TM_RUNS,
  UNITS,
  WAIVER,
} from "@/lib/ukboard/v1/data";
import { CHECK_ORDER, routesDecided } from "@/lib/ukboard/v1/selectors";
import type { IntegritySnapshot } from "@/lib/ukboard/v1/types";
import { METRICS, OBJECTIVES, objectiveMetrics, onTrack, VERDICT_LABEL, verdict, type DrawerKey, type MetricMeta } from "@/lib/ukboard/v2/board";
import { AuditTrailInline, DraftActionCard } from "../v1/ai";
import { PrecedentLine } from "../v1/primitives";
import { useBoard } from "../v1/state/boardStore";
import { ui } from "../v1/theme";
import AppetiteDial from "./AppetiteDial";
import LineChart from "./LineChart";
import { Pill } from "./sections";
import { routeFace } from "../v1/screens/RestrictionsReportabilityScreen";

const CHECK_NAME = { owner: "Owner", feed: "Data feed", attestation: "Signed off", mapping: "Mapped to policy" } as const;

interface DrawerContent {
  title: string;
  status?: ReactNode;
  position: ReactNode;
  why: string[];
  drafts: string[];
  evidenceUnitId?: string;
  extraEvidence?: ReactNode;
  precedentIds: string[];
  auditRefs: string[];
}

/* ── Building blocks ─────────────────────────────────────────────────── */

function Section({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section className="border-b border-[var(--ukb-border)] py-3">
      <h3>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`flex w-full items-center gap-1.5 text-left text-[13px] font-semibold text-[var(--ukb-text)] ${ui.focus} rounded`}>
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
    <dl className="divide-y divide-[var(--ukb-border)] rounded-md border border-[var(--ukb-border)] text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-3 px-2.5 py-1.5">
          <dt className="text-[var(--ukb-muted)]">{k}</dt>
          <dd className="text-right font-semibold tabular-nums text-[var(--ukb-text)]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function MetricDialRow({ m }: { m: MetricMeta }) {
  return (
    <div className="rounded-md border border-[var(--ukb-border)] px-2.5 py-2">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-[var(--ukb-text)]">{m.name}</span>
        <span className="tabular-nums text-[var(--ukb-muted)]">
          <span className="font-semibold text-[var(--ukb-text)]">{m.value}</span> {m.denominator}
        </span>
      </div>
      {m.dial ? <AppetiteDial dial={m.dial} direction={m.direction} labels className="mt-1.5" /> : null}
      {m.projectionText ? <p className="mt-1 text-[11px] text-[var(--ukb-subtle)]">Projection: {m.projectionText} · early warning, not a prediction</p> : null}
    </div>
  );
}

const meta = (unitId: string) => METRICS.find((m) => m.unitId === unitId);

function seriesChart(unitId: string, title: string) {
  const t = THRESHOLDS[unitId];
  const s = SERIES[unitId];
  if (!s) return null;
  return <LineChart title={title} series={[{ name: title, points: s }]} threshold={t ? { value: t.amber, label: `amber ${t.amber}` } : undefined} />;
}

function capacityCharts() {
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  const mi = base(CAPACITY.membersM);
  const hi = base(CAPACITY.handlers);
  return (
    <>
      <LineChart
        title="Growth against capacity (index, Q2 2025 = 100)"
        series={[
          { name: "Members (1.45m → 1.90m)", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: mi[i] })) },
          { name: "Qualified handlers (58 → 63)", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: hi[i] })), dashed: true },
        ]}
      />
      <LineChart title="Alert queue median age" series={[{ name: "Queue median age (days)", points: CAPACITY.queueAge }]} threshold={{ value: CAPACITY.queueAmber, label: "amber 14 days" }} suffix="d" />
      <Rows
        rows={[
          ["Members per qualified handler", "25,000 → 30,160"],
          ["Alerts cleared within SLA", `${CAPACITY.slaCleared.value} (${CAPACITY.slaCleared.denominator})`],
          ["Next savings campaign", `${CAPACITY.campaignDate} (in ${CAPACITY.campaignWeeks} weeks)`],
          ["Resourcing decision recorded", "None"],
        ]}
      />
    </>
  );
}

function RoutesTable({ eventIds }: { eventIds: string[] }) {
  const { state } = useBoard();
  return (
    <div className="space-y-2">
      {EVENTS.filter((e) => eventIds.includes(e.eventId)).map((e) => {
        const { decided, total } = routesDecided(e.eventId, ROUTES);
        return (
          <div key={e.eventId} className="rounded-md border border-[var(--ukb-border)]">
            <p className="flex justify-between gap-2 border-b border-[var(--ukb-border)] bg-[var(--ukb-surface-2)] px-2.5 py-1.5 text-xs">
              <span className="font-semibold text-[var(--ukb-text)]">{e.title}</span>
              <span className="whitespace-nowrap text-[var(--ukb-muted)]">
                Day {e.dayN} · {decided} of {total} decided
              </span>
            </p>
            {ROUTES.filter((r) => r.eventId === e.eventId).map((r) => (
              <p key={r.routeId} className="flex justify-between gap-2 px-2.5 py-1.5 text-xs">
                <span className="text-[var(--ukb-text)]">{r.name}</span>
                <span className="text-right text-[var(--ukb-muted)]">{routeFace(r, state.session.drafts)}</span>
              </p>
            ))}
          </div>
        );
      })}
      <p className="text-[11px] text-[var(--ukb-subtle)]">Clocks run from the logged awareness date; clock values unverified. 24-hour triage target is firm practice.</p>
    </div>
  );
}

function ClauseList() {
  const r = RESTRICTION;
  return (
    <div className="divide-y divide-[var(--ukb-border)] rounded-md border border-[var(--ukb-border)]">
      {r.clauses.map((c) => (
        <p key={c.clauseId} className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs">
          <span className="text-[var(--ukb-text)]">
            <span className="font-semibold">{c.ref}</span> {c.text}
          </span>
          <Pill state={c.verdict === "supported" ? "within_appetite" : "red"} label={c.verdict === "supported" ? "Supported" : "Not supported"} outline />
        </p>
      ))}
    </div>
  );
}

function AwarenessGap() {
  const e = EVENTS.find((x) => x.awarenessGap)!;
  const g = e.awarenessGap!;
  return (
    <div className="rounded-md border border-dashed border-[var(--ukb-track)] p-2.5 text-xs">
      <p className="font-semibold text-[var(--ukb-text)]">Awareness date check (CRO and deciding SMF only)</p>
      <ul className="mt-1 space-y-0.5 text-[var(--ukb-muted)]">
        {g.signals.map((s) => (
          <li key={s.ref}>
            {s.date} · {s.label} ({s.ref})
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[var(--ukb-muted)]">{g.gapDays} days from the first linked record. The deciding SMF decides whether the date stands.</p>
    </div>
  );
}

/* ── Content per drawer key ──────────────────────────────────────────── */

function contentFor(key: DrawerKey, viewer: "cro" | "brc_chair_preview"): DrawerContent | null {
  if (key.startsWith("metric:")) {
    const unitId = key.slice(7);
    const u = UNITS[unitId];
    const m = meta(unitId);
    if (!u) return null;
    const position: ReactNode = (
      <>
        {m ? <MetricDialRow m={m} /> : null}
        {unitId === "u-capacity" ? capacityCharts() : null}
        {unitId === "u-tm" ? (
          <>
            <LineChart title="Records reconciled by run" series={[{ name: "Share reconciled (%)", points: TM_RUNS.map((r) => ({ label: r.runDate.split(" ").slice(1, 2)[0], value: Number(r.pct.replace("%", "")) })) }]} suffix="%" />
            <Rows rows={TM_COHORTS.map((c) => [c.cohort, `${c.pct} (${c.reconciled.toLocaleString("en-GB")} of ${c.records.toLocaleString("en-GB")})`] as [string, ReactNode])} />
            <Rows rows={TM_ATTESTATIONS.map((a) => [a.cycle, a.gap] as [string, ReactNode])} />
          </>
        ) : null}
        {unitId === "u-sanctions" ? (
          <Rows
            rows={[
              ["List", SCREENING.list],
              ["Rule coverage", `${SCREENING.coverage} (${SCREENING.ruleRecords} of ${SCREENING.listEntries.toLocaleString("en-GB")})`],
              ["Alerts in 3 weeks", `${SCREENING.alertsLast3Weeks} against ${SCREENING.expectedPerWeek} a week expected`],
              ["Customer screening coverage", "92% (a different measure)"],
            ]}
          />
        ) : null}
        {unitId === "u-restriction" ? restrictionPosition() : null}
        {unitId !== "u-capacity" && unitId !== "u-tm" ? seriesChart(unitId, u.title) : null}
      </>
    );
    return {
      title: m?.name ?? u.title,
      status: m ? <Pill state={u.rawStatus === "not_assessed" ? "not_assessed" : statusOf(m)} label={labelOf(m)} /> : undefined,
      position,
      why: whyFor(unitId),
      drafts: u.draftIds,
      evidenceUnitId: unitId,
      precedentIds: u.precedentIds,
      auditRefs: [unitId],
    };
  }

  if (key.startsWith("objective:")) {
    const o = OBJECTIVES.find((x) => `objective:${x.id}` === key)!;
    const ms = objectiveMetrics(o.id);
    const byId: Record<string, Omit<DrawerContent, "title" | "position">> = {
      O1: { why: ["High-LTV lending uses 88% of appetite; £96m headroom on the £4.0bn plan.", "Straight-line projection reaches amber in Q2 2027 at plan volumes.", "High-LTV appetite binds before capital or leverage."], drafts: ["d-t21-appetite", "d-t21-para"], evidenceUnitId: "u-hltv", precedentIds: [], auditRefs: ["u-hltv"] },
      O2: { why: ["Agreed onboarding trade-off: 2 of 3 limits broken; review 27 days overdue.", "Customers transacting before checks is a regulatory floor, not a trade-off.", "The restriction test found 112 accounts in breach."], drafts: ["d-t26-redecide", "d-t26-floor"], evidenceUnitId: "u-tension", precedentIds: ["uk-monzo-2025"], auditRefs: ["u-tension"] },
      O3: { why: ["NSFR fell from 10 to 2 points above amber in one quarter.", "LCR reaches amber in about 9 weeks; ALCO needs 6 weeks.", "Wholesale funding 34% against a 40% ceiling (statutory cap 50%)."], drafts: ["d-t212-promo", "d-t24-owner"], evidenceUnitId: "u-nsfr", precedentIds: [], auditRefs: ["u-nsfr", "u-lcr"] },
      O4: { why: ["Monitoring coverage and sanctions list cover cannot be verified.", "A figure on an incomplete feed cannot be shown as within appetite."], drafts: [], evidenceUnitId: "u-o4", precedentIds: ["uk-metro-2024"], auditRefs: ["u-tm", "u-sanctions"] },
    };
    const position = (
      <>
        <p className="text-xs text-[var(--ukb-muted)]">
          Verdict: <span className="font-semibold text-[var(--ukb-text)]">{VERDICT_LABEL[verdict(o)]}</span> · computed from the linked measures
        </p>
        {ms.map((m) => (
          <MetricDialRow key={m.unitId} m={m} />
        ))}
        {o.id === "O1" ? (
          <>
            {seriesChart("u-hltv", "High-LTV share of new lending (%)")}
            <Rows rows={CONSTRAINT_LADDER.map((c) => [c.name, c.projectedBind] as [string, ReactNode])} />
            <p className="text-[11px] text-[var(--ukb-subtle)]">{WAIVER.text}</p>
          </>
        ) : null}
        {o.id === "O2" ? (
          <Rows
            rows={[
              ...TENSION_PAIR.bounds.map((b) => [b.bound, `${b.actual} vs ${b.agreed}`] as [string, ReactNode]),
              ["Pre-CDD transacting", "Floor breach"],
              ["Review due", TENSION_PAIR.reviewDue],
            ]}
          />
        ) : null}
        {o.id === "O3" ? <p className="text-[11px] text-[var(--ukb-subtle)]">Statutory funding cap 50% (building society).</p> : null}
      </>
    );
    return { title: o.name, status: <Pill state={verdict(o) === "fix_first" ? "red" : verdict(o) === "hold" ? "amber" : verdict(o) === "unverified" ? "unverified" : "within_appetite"} label={VERDICT_LABEL[verdict(o)]} outline />, position, ...byId[o.id] };
  }

  switch (key) {
    case "decision:1":
    case "panel:F2":
      return {
        title: key === "decision:1" ? "Savings growth vs crime checks" : "Growth vs capacity",
        status: <Pill state="amber" label="Amber" />,
        position: capacityCharts(),
        why: ["Members grew 31%; qualified handlers grew 9%.", "Queue age has been above the 14-day amber since August.", "Only two options: restore capacity or pace growth."],
        drafts: ["d-t25-paper", "d-pg4"],
        evidenceUnitId: "u-capacity",
        precedentIds: ["uk-starling-2024", "uk-monzo-2025"],
        auditRefs: ["u-capacity"],
      };
    case "decision:2":
      return {
        title: "Restriction breach: report or not?",
        status: <Pill state="red" label="Red" />,
        position: (
          <>
            {restrictionPosition()}
            <RoutesTable eventIds={["e-r03"]} />
          </>
        ),
        why: ["The population test, not the flag, shows 112 accounts in breach.", "Head of Compliance decides each route; the product prepares the case.", "Nothing is filed or notified by the product."],
        drafts: ["d-case-r03-sup153", "d-case-r03-fr7", "d-t227-contain", "d-pg1-coverage"],
        evidenceUnitId: "u-restriction",
        precedentIds: ["uk-starling-2024", "uk-monzo-2025"],
        auditRefs: ["u-restriction", "rt-r03-sup153", "rt-r03-fr7"],
      };
    case "decision:3":
      return {
        title: "Issue dropped from board pack",
        status: <Pill state="amber" label="Amber" />,
        position: (
          <>
            <LineChart title="Vulnerable-customer exceptions per 10,000 contacts" series={[{ name: "Exceptions per 10,000", points: SERIES["u-vuln"] }]} threshold={{ value: 14, label: "amber 14 · red 18" }} />
            <ManifestTable itemId="pi-vuln" />
            <Rows rows={[["Removed at", "ERC, 14 October 2026"], ["Approver", "None recorded"], ["Reason", "No reason recorded"], ["Red projected", "Q1 2027 (early warning, not a prediction)"]]} />
          </>
        ),
        why: ["Amber for 3 quarters, past the 2-quarter rule (firm practice).", "No action, decision or escalation is recorded.", "This proves nothing recorded, not that nothing was discussed."],
        drafts: viewer === "brc_chair_preview" ? ["d-t234-options"] : ["d-t235-restore", "d-pg5", "d-t234-options"],
        evidenceUnitId: "u-vuln",
        precedentIds: [],
        auditRefs: ["u-vuln", "m-brc-q3-2026"],
      };
    case "panel:F1":
      return {
        title: "Is bad news reaching us?",
        status: <Pill state="amber" label="Amber" />,
        position: (
          <>
            <Rows
              rows={[
                ["Median from high severity to BRC", `${KRI_DETAIL.latency.median} (n = ${KRI_DETAIL.latency.n})`],
                ["Material items unescalated after 12 months", "3"],
                ["Overdue CDD reviews", "26,900 vs 10,000 target"],
                ["CDD actions closed this quarter", "42 · 2 issues downgraded"],
                ["CDD refresh clearance", "31 months vs 12 committed"],
                ["Finding extensions", "3 vs a limit of 2"],
                ["Qualifying items in the pack", "12 of 13 (v2 locked)"],
              ]}
            />
            <FeedList />
            <p className="text-[11px] text-[var(--ukb-subtle)]">{KRI_DETAIL.latency.selfIdentification}.</p>
          </>
        ),
        why: ["Bad news takes a median 4.6 months to reach the BRC.", "Closed actions have not moved the overdue CDD figure.", "One qualifying item left the pack with no reason recorded."],
        drafts: ["d-t236-agenda", "d-t237-review", "d-t238-reopen", "d-pg5"],
        evidenceUnitId: "u-kri-latency",
        precedentIds: [],
        auditRefs: ["u-kri-backlog", "u-kri-latency", "u-kri-effect", "u-vuln"],
      };
    case "panel:F3":
      return {
        title: "Reporting clocks",
        status: <Pill state="amber" label="Pending" />,
        position: (
          <>
            <RoutesTable eventIds={["e-r03", "e-117"]} />
            <p className="text-xs font-semibold text-[var(--ukb-text)]">Q3 2026 attestation due in {RESTRICTION.attestationDaysLeft} days ({RESTRICTION.attestationDue})</p>
            <ClauseList />
            {viewer === "cro" ? <AwarenessGap /> : null}
          </>
        ),
        why: ["Every engaged route needs a named SMF decision.", "1 of 7 routes has a recorded decision.", "Attestation evidence supports 3 of 4 clauses."],
        drafts: ["d-case-r03-sup153", "d-case-r03-fr7", "d-case-117-fr7", "d-case-117-sup1511", "d-t228-summary", "d-t228-facts", ...(viewer === "cro" ? ["d-t230-prompt"] : [])],
        evidenceUnitId: "u-restriction",
        extraEvidence: (
          <ul className="space-y-0.5 text-[11px] text-[var(--ukb-muted)]">
            {ROUTES.filter((r) => !r.isSar).map((r) => (
              <li key={r.routeId}>
                {r.name}: {r.ruleText}
              </li>
            ))}
          </ul>
        ),
        precedentIds: ["uk-starling-2024"],
        auditRefs: ROUTES.map((r) => r.routeId).concat("u-restriction"),
      };
    case "panel:F4":
      return {
        title: "What is coming?",
        status: <Pill state="not_assessed" label="1 not measured" />,
        position: (
          <Rows
            rows={[
              ["Emerging risks in the register", String(HORIZON.emergingRisks)],
              ["Expected within 12 months", String(HORIZON.withinTwelveMonths)],
              ["With no metric", "AI-enabled impersonation fraud"],
              ["New incident reporting rules", `${HORIZON.incidentRulesDate} (${HORIZON.daysToIncidentRules} days)`],
              ["Incidents classified in a trial run", `${HORIZON.trialClassified.classified} of ${HORIZON.trialClassified.total}`],
              ["Disclosure figures under hold review", String(HORIZON.disclosureHold)],
            ]}
          />
        ),
        why: ["1 of the 2 risks due within 12 months has no metric.", "The principal-risk owner decides the metric and owner."],
        drafts: ["d-t213-metric"],
        evidenceUnitId: "u-horizon",
        precedentIds: [],
        auditRefs: ["u-horizon"],
      };
    case "unmapped":
      return {
        title: "Plan item with no appetite statement",
        status: <Pill state="not_assessed" label="Not mapped" />,
        position: <Rows rows={UNITS["u-unmapped"].spine.map((s) => [s.segment, s.missing ? "Missing" : s.label] as [string, ReactNode])} />,
        why: ["Business current account launch (Q1 2027) has no RAS line.", "It has no financial crime metric either."],
        drafts: ["d-t23-ras"],
        evidenceUnitId: "u-unmapped",
        precedentIds: [],
        auditRefs: ["u-unmapped"],
      };
    case "greens":
      return {
        title: "Within appetite",
        status: <Pill state="within_appetite" label="Within" />,
        position: (
          <>
            {onTrack().map((m) => (
              <MetricDialRow key={m.unitId} m={m} />
            ))}
            <p className="text-[11px] text-[var(--ukb-subtle)]">12 of 34 Level 1 metrics are board headlines (firm practice). Critical vulnerabilities past SLA (2 of 146) moved to the cyber detail when NSFR was promoted.</p>
          </>
        ),
        why: [],
        drafts: [],
        precedentIds: [],
        auditRefs: [],
      };
    default:
      return null;
  }
}

function restrictionPosition() {
  const r = RESTRICTION;
  return (
    <>
      <Rows
        rows={[
          ["Accounts in breach", `${r.breachesAccounts} of ${r.tested.toLocaleString("en-GB")} tested (+41 vs previous run)`],
          ["Customers", `${r.breachesCustomers} (incl. ${r.previouslyExited} previously exited)`],
          ["Tested", `${r.tested.toLocaleString("en-GB")} of ${r.inScope.toLocaleString("en-GB")} openings in scope`],
          ["Untested", "24,000 partner-channel openings (not compliant)"],
          ...r.byRoute.map((b) => [b.route, `${b.accounts} accounts`] as [string, ReactNode]),
          ["Months since a zero-breach month", String(r.monthsSinceZero)],
        ]}
      />
      <p className="rounded-md border border-dashed border-[var(--ukb-track)] px-2.5 py-1.5 text-xs text-[var(--ukb-muted)]">
        Contrast, not status: flag fired 1,208 times, 100% blocked. A flag firing is not evidence of adherence.
      </p>
    </>
  );
}

function ManifestTable({ itemId }: { itemId: string }) {
  const { state } = useBoard();
  return (
    <Rows
      rows={state.session.manifestVersions.map((v) => [`v${v.version} ${v.state} · ${v.createdOn}`, v.itemIds.includes(itemId) ? `Present (${v.itemIds.length} items)` : `Absent (${v.itemIds.length} items)`] as [string, ReactNode])}
    />
  );
}

function FeedList() {
  const { state } = useBoard();
  const latest = state.session.manifestVersions[state.session.manifestVersions.length - 1];
  return (
    <div className="max-h-48 divide-y divide-[var(--ukb-border)] overflow-y-auto rounded-md border border-[var(--ukb-border)]">
      {[...PACK_ITEMS].sort((a, b) => Number(!!b.removal) - Number(!!a.removal)).map((i) => (
        <p key={i.itemId} className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs">
          <span className="text-[var(--ukb-text)]">{i.label}</span>
          {latest.itemIds.includes(i.itemId) ? <Pill state="within_appetite" label="In pack" outline /> : <Pill state="red" label="Removed" />}
        </p>
      ))}
    </div>
  );
}

function statusOf(m: MetricMeta) {
  const s = UNITS[m.unitId].integrity;
  const fails = CHECK_ORDER.some((k) => !s[k].pass);
  return fails ? "unverified" : UNITS[m.unitId].rawStatus === "not_assessed" ? "not_assessed" : UNITS[m.unitId].rawStatus;
}

function labelOf(m: MetricMeta) {
  const s = statusOf(m);
  return s === "within_appetite" ? (m.projectionText ? `Within · ${m.projectionText}` : "Within") : s === "unverified" ? "Unverified" : s === "red" ? "Red" : s === "amber" ? "Amber" : "Not assessed";
}

const WHY: Record<string, string[]> = {
  "u-restriction": ["The population test found 112 accounts in breach of 9,400 tested.", "97 came through the new savings pot, outside the flag's scope.", "24,000 partner-channel openings were not tested."],
  "u-tm": ["Only 94.0% of payment records reached monitoring.", "Same-day accounts were not monitored at all.", "Signed off before the data run finished."],
  "u-sanctions": ["39 rule records cover 3,088 list entries.", "0 alerts in 3 weeks against 42 a week expected."],
  "u-capacity": ["Queue age 19 days against amber 14, since August.", "Members per handler rose from 25,000 to 30,160."],
  "u-lcr": ["LCR reaches amber in about 9 weeks.", "The BRC is in 7 weeks; ALCO needs 6 to act."],
  "u-nsfr": ["NSFR moved from 10 to 2 points above amber in a quarter.", "Promoted to the board headlines this cycle."],
  "u-hltv": ["88% of high-LTV appetite used.", "Amber by Q2 2027 on the straight-line projection."],
};

function whyFor(unitId: string): string[] {
  return WHY[unitId] ?? [UNITS[unitId].ruleLine.split(". ")[0] + "."];
}

/* ── Drawer frame ────────────────────────────────────────────────────── */

export default function BoardDrawer({ drawerKey, onClose }: { drawerKey: DrawerKey; onClose: () => void }) {
  const { state } = useBoard();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const content = contentFor(drawerKey, state.viewer);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = [...panelRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.hasAttribute("disabled"));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, drawerKey]);

  if (!content) return null;
  const chair = state.viewer === "brc_chair_preview";
  const drafts = content.drafts.filter((id) => !chair || DRAFTS[id]?.gateHolder === "brc_chair");
  const ev = content.evidenceUnitId ? UNITS[content.evidenceUnitId] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close detail" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="drawer-title" className="relative flex h-full w-full max-w-[600px] flex-col bg-[var(--ukb-surface)] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--ukb-border)] px-5 py-4">
          <div>
            <h2 id="drawer-title" className="text-base font-semibold text-[var(--ukb-text)]">
              {content.title}
            </h2>
            {ev ? <p className="mt-0.5 text-xs text-[var(--ukb-subtle)]">Owner: {ev.ownerRole} · evidence as at {ev.integrity.asOf}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {content.status}
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={`${ui.button} ${ui.focus} px-2`}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <Section title="Position" defaultOpen>
            {content.position}
          </Section>
          {content.why.length ? (
            <Section title="Why it matters" defaultOpen>
              <ul className="list-disc space-y-1 pl-4 text-[13px] text-[var(--ukb-text)]">
                {content.why.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Section>
          ) : null}
          <Section title="Options">
            {drafts.length ? (
              drafts.map((id) => <DraftActionCard key={id} draftId={id} canGate={state.viewer === "cro"} />)
            ) : chair && content.drafts.length ? (
              <p className="text-xs text-[var(--ukb-subtle)]">With CRO · proposal pending</p>
            ) : (
              <p className="text-xs text-[var(--ukb-subtle)]">No options for this item.</p>
            )}
          </Section>
          {ev ? (
            <Section title="Evidence">
              <EvidenceChecks snapshot={ev.integrity} />
              <p className="text-[11px] text-[var(--ukb-subtle)]">
                References: {ev.spine.filter((s) => s.ref).map((s) => `${s.label} (${s.ref})`).join(" · ") || "none"}
              </p>
              {content.extraEvidence}
            </Section>
          ) : null}
          {content.precedentIds.length ? (
            <Section title="Precedent">
              {content.precedentIds.map((id) => (
                <PrecedentLine key={id} id={id} />
              ))}
            </Section>
          ) : null}
          {content.auditRefs.length ? (
            <div className="py-3">
              <AuditTrailInline objectRefs={content.auditRefs} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EvidenceChecks({ snapshot }: { snapshot: IntegritySnapshot }) {
  return (
    <div className="divide-y divide-[var(--ukb-border)] rounded-md border border-[var(--ukb-border)]">
      {CHECK_ORDER.map((k) => {
        const c = snapshot[k];
        return (
          <div key={k} className="flex items-start gap-2 px-2.5 py-1.5 text-xs">
            <Pill state={c.pass ? "within_appetite" : "unverified"} label={c.pass ? "Pass" : "Fail"} outline />
            <span>
              <span className="font-semibold text-[var(--ukb-text)]">{CHECK_NAME[k]}:</span> <span className="text-[var(--ukb-muted)]">{k === "attestation" && !c.pass ? "Signed off before the data run finished. " : ""}{c.evidence}</span>
            </span>
          </div>
        );
      })}
      <p className="px-2.5 py-1.5 text-[11px] text-[var(--ukb-subtle)]">As at {snapshot.asOf} · {PEOPLE.cro.name} reviewing</p>
    </div>
  );
}

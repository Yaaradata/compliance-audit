"use client";

/**
 * UK Board v1 — scoped drill pages (CMP-41e), one per kind, each addressed by its own ID:
 * clause (DG-6 population / DG-7 attestation), route (DG-8), manifest (DG-9), kri (DG-10).
 * Shared frame: state sentence, expanded badge, Back, drafts with gate, inline audit trail,
 * can tell / cannot tell. No further drill layer.
 */
import type { ReactNode } from "react";
import {
  EVENTS,
  KRI_DETAIL,
  KRI_TILES,
  MANIFEST_ID,
  PACK_ITEMS,
  PEOPLE,
  PROCESS_GAP_PG1,
  RESTRICTION,
  ROUTES,
  UNITS,
  VULN_HISTORY,
} from "@/lib/ukboard/v1/data";
import { isVisible, routesDecided } from "@/lib/ukboard/v1/selectors";
import type { ViewState } from "@/lib/ukboard/v1/types";
import { AuditTrailInline, CanTellCannotTell, DraftActionCard, ProcessGapBlock } from "../ai";
import { SeriesChart } from "../cards/charts";
import { BackToOrigin, DeltaValue, IntegrityBadge, PracticeLabel, PrecedentLine, RuleLine, SectionHeader, StatusToken } from "../primitives";
import { useBoard } from "../state/boardStore";
import { ui } from "../theme";
import { routeFace } from "./RestrictionsReportabilityScreen";
import { unitStatus, useNav } from "./shared";

type DrillView = Extract<ViewState, { screen: "drill" }>;

function Frame({ kicker, headline, status, badge, children }: { kicker: string; headline: string; status?: ReactNode; badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <BackToOrigin />
      <div className={`${ui.card} p-5 shadow-sm`}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">{kicker}</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-snug text-[var(--ukb-text)]">{headline}</h1>
          {status}
        </div>
        {badge ? <div className="mt-2">{badge}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Block({ title, spine, children }: { title: string; spine: string; children: ReactNode }) {
  return (
    <section className={`${ui.card} space-y-3 p-5 shadow-sm`}>
      <SectionHeader title={title} spineSegment={spine} />
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-[220px_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="font-semibold text-[var(--ukb-text)]">{k}</dt>
          <dd className="text-[var(--ukb-muted)]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function NotAvailable() {
  return (
    <div className="space-y-3">
      <BackToOrigin />
      <p className={`${ui.card} p-4 text-sm`}>Evidence not available for this period.</p>
    </div>
  );
}

/* DG-6 population funnel */
function PopulationDrill() {
  const nav = useNav();
  const u = UNITS["u-restriction"];
  const r = RESTRICTION;
  const funnel = [
    { label: "In scope (account openings)", value: r.inScope },
    { label: "Tested", value: r.tested },
    { label: `In breach: ${r.breachesAccounts} accounts, ${r.breachesCustomers} customers`, value: r.breachesAccounts },
  ];
  return (
    <Frame
      kicker="Restriction clause evidence · population test"
      headline={u.stateSentence}
      status={<StatusToken status={unitStatus(u.unitId)} label="Red · breach" />}
      badge={<IntegrityBadge badgeRef="dg6" snapshot={u.integrity} />}
    >
      <Block title="Population funnel" spine="Obligation (restriction) → control → evidence">
        <div className="space-y-1">
          {funnel.map((f) => (
            <div key={f.label} className="text-xs">
              <div className="flex justify-between text-[var(--ukb-muted)]">
                <span>{f.label}</span>
                <span className="tabular-nums">{f.value.toLocaleString("en-GB")}</span>
              </div>
              <div className="h-2 rounded bg-[var(--ukb-surface-2)]" aria-hidden>
                <div className="h-2 rounded bg-[var(--ukb-grey)]" style={{ width: `${Math.max((f.value / r.inScope) * 100, 0.6)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--ukb-muted)]">
          Untested: {r.untested.map((x) => `${x.count.toLocaleString("en-GB")} ${x.route.toLowerCase()}`).join(" · ")}. Shown as untested, never as compliant.
        </p>
      </Block>
      <Block title="Breaches by route" spine="Control → evidence">
        <Rows
          rows={[
            ...r.byRoute.filter((b) => b.lane !== "manual").map((b) => [b.route, `${b.accounts} accounts`] as [string, ReactNode]),
            ["Manual-route lane (separate)", r.byRoute.filter((b) => b.lane === "manual").map((b) => `${b.route}: ${b.accounts} accounts`).join(" · ")],
            ["Previously exited customers", `${r.previouslyExited} of the ${r.breachesCustomers} customers (a subset, not a route)`],
          ]}
        />
        <Rows
          rows={[
            ["Test definition", r.testDefinition],
            ["Latest run", `${r.runDate}: ${r.breachesAccounts} of ${r.tested.toLocaleString("en-GB")}`],
            ["Previous run", `${r.previousRun.runDate}: ${r.previousRun.breachesAccounts} of ${r.previousRun.tested.toLocaleString("en-GB")}`],
            ["Months since last zero-breach month", `${r.monthsSinceZero} [illustrative]`],
            ["Restriction reference", r.ref],
            ["Clause owner", `${PEOPLE[r.clauseOwnerPersonId].name} [fictional], ${PEOPLE[r.clauseOwnerPersonId].role}`],
          ]}
        />
        <p className="rounded-md border border-dashed border-[var(--ukb-track)] px-2 py-1 text-xs text-[var(--ukb-muted)]">
          <span className="font-semibold">Contrast, not status: </span>
          {r.flagContrast}
        </p>
        <p className="text-xs text-[var(--ukb-muted)]">Counts only. Account records stay in the Head of Financial Crime&apos;s restricted view.</p>
        <PrecedentLine id="uk-starling-2024" />
      </Block>
      <Block title="Process gap" spine="Control → owner">
        <ProcessGapBlock gapType={PROCESS_GAP_PG1.gapType} text={PROCESS_GAP_PG1.text} owner={PROCESS_GAP_PG1.receivingOwner} draftId={PROCESS_GAP_PG1.draftId} canGate={nav.canGate} />
      </Block>
      <Block title="Drafts and audit trail" spine="Escalation">
        <DraftActionCard draftId="d-t227-contain" canGate={nav.canGate} />
        <AuditTrailInline objectRefs={[u.unitId]} />
      </Block>
      <Block title="Can tell / cannot tell" spine="Honesty line">
        <CanTellCannotTell canTell={u.canTell} cannotTell={u.cannotTell} />
      </Block>
    </Frame>
  );
}

/* DG-7 clause-by-clause verdict list */
function AttestationDrill() {
  const nav = useNav();
  const r = RESTRICTION;
  const verdict = { supported: ["within_appetite", "Supported"], partly: ["amber", "Partly supported"], not_supported: ["red", "Not supported"] } as const;
  return (
    <Frame
      kicker="Attestation evidence"
      headline={`Q3 2026 attestation due in ${r.attestationDaysLeft} days (${r.attestationDue}). 1 of 4 clauses not supported by the evidence.`}
      status={<StatusToken status="red" label="1 of 4 not supported" />}
    >
      <Block title={`${r.ref}: ${r.name} · ${r.attestationPeriod}`} spine="Evidence → attestation">
        <div className="space-y-2">
          {r.clauses.map((c) => (
            <div key={c.clauseId} className="rounded-md border border-[var(--ukb-border)] p-2 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="font-semibold text-[var(--ukb-text)]">
                  {c.ref} · {c.text}
                </span>
                <StatusToken status={verdict[c.verdict][0]} label={verdict[c.verdict][1]} />
              </div>
              <p className="mt-1 text-[var(--ukb-muted)]">
                Test runs present: {c.runsPresent} of {c.monthsInPeriod} months · {c.evidence}
              </p>
            </div>
          ))}
        </div>
      </Block>
      <Block title="Prior attestations" spine="Attestation">
        <Rows rows={r.priorAttestations.map((p) => [p.period, `Signed ${p.signedOn} by ${p.signerRole} · ${p.status}`] as [string, ReactNode])} />
      </Block>
      <Block title="Drafts and audit trail" spine="Escalation">
        <DraftActionCard draftId="d-t228-summary" canGate={nav.canGate} />
        <DraftActionCard draftId="d-t228-facts" canGate={nav.canGate} />
        <AuditTrailInline objectRefs={["u-restriction"]} />
      </Block>
      <Block title="Can tell / cannot tell" spine="Honesty line">
        <CanTellCannotTell canTell="What the structured evidence supports for the period." cannotTell="Which sentence of the draft attestation is unsupported: the product does not read or write attestation wording." />
      </Block>
    </Frame>
  );
}

/* DG-8 route case (CMP-24) with the T2-30 block for the CRO only (CMP-25) */
function RouteDrill({ eventId, routeId }: { eventId: string; routeId: string }) {
  const { state } = useBoard();
  const nav = useNav();
  const event = EVENTS.find((e) => e.eventId === eventId);
  const route = ROUTES.find((r) => r.routeId === routeId && r.eventId === eventId);
  if (!event || !route) return <NotAvailable />;
  const siblings = ROUTES.filter((r) => r.eventId === eventId);
  const { decided, total } = routesDecided(eventId, ROUTES);
  const showGap = event.awarenessGap && isVisible("cro_and_deciding_smf", state.viewer);
  return (
    <Frame
      kicker={`Reportability case · ${event.title}`}
      headline={`${route.name}: ${routeFace(route, state.session.drafts)}`}
      status={<StatusToken status={route.status === "decided" ? "within_appetite" : "not_assessed"} label={route.status === "decided" ? "Decision recorded" : "Decision pending"} />}
    >
      <Block title="Event and sibling routes" spine="Escalation / reportability decision">
        <Rows
          rows={[
            ["Event", `${event.title} (${event.ref})`],
            ["Logged awareness", `${event.loggedAwareness} · day ${event.dayN} · keyed by ${event.keyedBy}`],
            ["Routes decided", `${decided} of ${total}`],
            ["Sibling routes", siblings.map((s) => `${s.name}: ${routeFace(s, state.session.drafts)}`).join(" · ")],
          ]}
        />
        {!route.isSar ? (
          <ul className="list-disc pl-4 text-xs text-[var(--ukb-muted)]">
            {event.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}
      </Block>
      {route.isSar ? (
        <Block title="Suspicious activity report question" spine="Reportability">
          <p className="text-xs text-[var(--ukb-muted)]">
            {route.status === "not_engaged" ? "SAR question closed." : "SAR question open."} Content stays with the Head of Financial Crime and is not shown above that role.
          </p>
        </Block>
      ) : (
        <>
          <Block title="Rule and clock" spine="Reportability decision">
            <Rows
              rows={[
                ["Rule text (in force on the event date)", route.ruleText],
                [
                  "Clock",
                  <span key="c">
                    {route.clock} <PracticeLabel kind="unverified_clock" />
                  </span>,
                ],
                [
                  "Elapsed",
                  <span key="e">
                    Day {event.dayN} from the logged awareness date, against the 24-hour triage target <PracticeLabel kind="practice_not_rule" />
                  </span>,
                ],
                ["Proposed decider", route.proposedDeciderRole],
              ]}
            />
          </Block>
          <Block title="Options with rationale (no default answer)" spine="Reportability decision">
            <ul className="list-disc pl-4 text-xs text-[var(--ukb-muted)]">
              {route.options.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <p className="text-xs text-[var(--ukb-muted)]">Dissent field: read-only for the CRO. The deciding SMF records the decision, rationale and any dissent.</p>
          </Block>
          <Block title="Decision history (append-only)" spine="Reportability decision">
            {route.history.length ? (
              route.history.map((h) => (
                <p key={h.decisionId} className="text-xs text-[var(--ukb-muted)]">
                  Decided by {PEOPLE[h.deciderPersonId].name} [fictional], {PEOPLE[h.deciderPersonId].role}, on {h.decidedOn} · {h.decision} · rationale: {h.rationale} · dissent: {h.dissent}
                </p>
              ))
            ) : (
              <p className="text-xs text-[var(--ukb-muted)]">No decision recorded.</p>
            )}
          </Block>
        </>
      )}
      {showGap && event.awarenessGap ? (
        <Block title="Did a structured signal exist before the awareness date we logged?" spine="Reportability (clock integrity)">
          <ol className="space-y-0.5 text-xs text-[var(--ukb-muted)]">
            {event.awarenessGap.signals.map((s) => (
              <li key={s.ref}>
                {s.date} · {s.label} ({s.ref})
              </li>
            ))}
          </ol>
          <RuleLine>
            Gap from the first structured signal: {event.awarenessGap.gapDays} days. The deciding SMF decides whether the date stands; the product never re-dates.
          </RuleLine>
          <DraftActionCard draftId={event.awarenessGap.promptDraftId} canGate={nav.canGate} />
        </Block>
      ) : null}
      <Block title="Drafts and audit trail" spine="Escalation">
        {route.caseDraftId ? <DraftActionCard draftId={route.caseDraftId} canGate={nav.canGate} /> : <p className="text-xs text-[var(--ukb-muted)]">No drafts for this item.</p>}
        <AuditTrailInline objectRefs={[route.routeId]} />
      </Block>
      <Block title="Can tell / cannot tell" spine="Honesty line">
        <CanTellCannotTell
          canTell="That a logged event has an engaged route with no recorded decision."
          cannotTell="Whether the route is actually engaged: that is the deciding SMF's legal judgement."
        />
      </Block>
    </Frame>
  );
}

/* DG-9 pack manifest version diff */
function ManifestDrill({ manifestId, itemId }: { manifestId: string; itemId: string }) {
  const { state } = useBoard();
  const item = PACK_ITEMS.find((i) => i.itemId === itemId);
  if (manifestId !== MANIFEST_ID || !item) return <NotAvailable />;
  const versions = state.session.manifestVersions;
  const isVuln = item.itemId === "pi-vuln";
  return (
    <Frame
      kicker="Pack manifest · Q3 2026 BRC pack"
      headline={item.removal ? `${item.label}: removed at ${item.removal.atForum} on ${item.removal.on} with no reason recorded` : `${item.label}: in the pack`}
      status={<StatusToken status={isVuln ? "amber" : "within_appetite"} label={item.removal ? "Removed with no reason recorded" : "In the pack"} />}
    >
      <Block title="Manifest version diff" spine="Escalation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[var(--ukb-subtle)]">
                <th className="py-1 pr-3">Version</th>
                <th className="py-1 pr-3">State</th>
                <th className="py-1 pr-3">Created</th>
                <th className="py-1 pr-3">Items</th>
                <th className="py-1 pr-3">This item</th>
              </tr>
            </thead>
            <tbody className="text-[var(--ukb-muted)]">
              {versions.map((v) => (
                <tr key={v.version} className="border-t border-[var(--ukb-border)]">
                  <td className="py-1 pr-3">v{v.version}</td>
                  <td className="py-1 pr-3">{v.state}</td>
                  <td className="py-1 pr-3">
                    {v.createdOn} · {v.createdBy}
                  </td>
                  <td className="py-1 pr-3">
                    {v.itemIds.length} · {v.note}
                  </td>
                  <td className="py-1 pr-3 font-semibold">{v.itemIds.includes(item.itemId) ? "Present" : "Absent"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Rows
          rows={[
            ["Routing rule met", item.routingRule],
            ["Override", item.removal ? `Approver: ${item.removal.approver ?? "none recorded"} · reason: ${item.removal.reason ?? "no reason recorded"}` : "None"],
            ...(isVuln
              ? ([
                  ["Status history", VULN_HISTORY],
                  ["Decision-register search (window)", "No entries found"],
                ] as [string, ReactNode][])
              : []),
          ]}
        />
        <p className="text-xs text-[var(--ukb-muted)]">Nothing can be removed from this view. Every removal needs a named approver and a reason code.</p>
      </Block>
      {isVuln ? (
        <>
          <Block title="Process gap" spine="Escalation">
            <ProcessGapBlock gapType="Governance-process gap" text="The pack build allows removals with no logged approver or reason." owner="Company secretary and CRO office" draftId="d-pg5" />
          </Block>
          <Block title="For the chair, and CRO preview actions" spine="Escalation">
            <DraftActionCard draftId="d-t234-options" canGate={false} />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">CRO preview action</p>
            <DraftActionCard draftId="d-t235-restore" canGate />
            <AuditTrailInline objectRefs={["u-vuln", MANIFEST_ID]} />
          </Block>
          <Block title="Can tell / cannot tell" spine="Honesty line">
            <CanTellCannotTell canTell={UNITS["u-vuln"].canTell} cannotTell={UNITS["u-vuln"].cannotTell} />
          </Block>
        </>
      ) : (
        <Block title="Audit trail" spine="Escalation">
          <AuditTrailInline objectRefs={[MANIFEST_ID]} />
        </Block>
      )}
    </Frame>
  );
}

/* DG-10 governance KRI bodies */
function KriDrill({ unitId }: { unitId: string }) {
  const tile = KRI_TILES.find((t) => t.unitId === unitId);
  const u = UNITS[unitId];
  if (!tile || !u) return <NotAvailable />;
  const d = KRI_DETAIL;
  return (
    <Frame kicker="Governance KRI" headline={u.stateSentence} status={<StatusToken status={unitStatus(unitId)} />} badge={<IntegrityBadge badgeRef={`dg10-${unitId}`} snapshot={u.integrity} />}>
      {tile.variant === "backlog" ? (
        <Block title="Backlog against committed clearance" spine="Escalation">
          <SeriesChart series={{ name: d.backlogSeries.label, points: d.backlogSeries.points }} />
          <p className="text-xs text-[var(--ukb-muted)]">Series: {d.backlogSeries.label}</p>
          <Rows
            rows={[
              ["Projected clearance", "31 months at the current clearance rate, against 12 committed (assumes the current rate)"],
              ["Commitment", d.backlogSeries.committed],
              ["Manifest search", d.backlogSeries.manifestSearch],
            ]}
          />
        </Block>
      ) : null}
      {tile.variant === "latency" ? (
        <Block title="Escalation latency" spine="Escalation">
          <DeltaValue value={d.latency.median} denominator={`median, n = ${d.latency.n} (minimum n ${d.latency.minN})`} />
          <PracticeLabel kind="practice_not_rule" />
          <p className="text-xs text-[var(--ukb-muted)]">{d.latency.windowNote}</p>
          <Rows rows={d.latency.unescalated.map((x) => [x.unit, `${x.months} months unescalated`] as [string, ReactNode])} />
          <p className="text-xs text-[var(--ukb-muted)]">{d.latency.selfIdentification}</p>
          <p className="text-xs text-[var(--ukb-muted)]">{d.latency.challengeThenBreach}</p>
        </Block>
      ) : null}
      {tile.variant === "effectiveness" ? (
        <Block title="Actions against their metric" spine="Escalation → metric">
          <p className="text-xs text-[var(--ukb-muted)]">Series: {d.effectiveness.seriesLabel}</p>
          <Rows rows={d.effectiveness.pairs.map((p) => [p.action, p.metric] as [string, ReactNode])} />
          <p className="text-xs text-[var(--ukb-muted)]">{d.effectiveness.unlinkedShare}</p>
        </Block>
      ) : null}
      <Block title="Drafts and audit trail" spine="Escalation">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">CRO preview action</p>
        <DraftActionCard draftId={tile.draftId} canGate />
        <AuditTrailInline objectRefs={[unitId]} />
      </Block>
      <Block title="Can tell / cannot tell" spine="Honesty line">
        <CanTellCannotTell canTell="What the structured issue, finding and action records show." cannotTell="Closure notes are not judged." />
      </Block>
    </Frame>
  );
}

export default function ScopedDrillScreen({ view }: { view: DrillView }) {
  switch (view.kind) {
    case "clause":
      if (view.restrictionId !== RESTRICTION.restrictionId) return <NotAvailable />;
      return view.focus === "population" ? <PopulationDrill /> : <AttestationDrill />;
    case "route":
      return <RouteDrill eventId={view.eventId} routeId={view.routeId} />;
    case "manifest":
      return <ManifestDrill manifestId={view.manifestId} itemId={view.itemId} />;
    case "kri":
      return <KriDrill unitId={view.unitId} />;
    default:
      return <NotAvailable />;
  }
}


"use client";

/**
 * UK Board v1 — S3 Restrictions and reportability (beat 3).
 * The status comes from the population test, never from the flag (HF-3). The product prepares
 * a case per route with no default answer; a named SMF decides (HF-4). Nothing is filed or notified.
 * The awareness-gap block is unmounted for the BRC chair (HF-9).
 */
import { DRAFTS, EVENTS, PEOPLE, RESTRICTION, ROUTES, UNITS } from "@/lib/ukboard/v1/data";
import { isVisible, routesDecided } from "@/lib/ukboard/v1/selectors";
import type { ReportRoute } from "@/lib/ukboard/v1/types";
import { AiExecutiveBand } from "../ai";
import { BoardLayoutGrid, CardShell, DeltaValue, IntegrityBadge, PracticeLabel, PrecedentLine, RuleLine, StatusToken } from "../primitives";
import { useBoard } from "../state/boardStore";
import { ui } from "../theme";
import { ActionList, SoWhat, unitStatus, useNav } from "./shared";

const VERDICT = {
  supported: { status: "within_appetite" as const, label: "Supported" },
  partly: { status: "amber" as const, label: "Partly supported" },
  not_supported: { status: "red" as const, label: "Not supported" },
};

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* Z1 population test (CMP-21) */
function PopulationTestCard() {
  const nav = useNav();
  const u = UNITS["u-restriction"];
  const r = RESTRICTION;
  const manual = r.byRoute.filter((b) => b.lane === "manual");
  return (
    <CardShell id="s3-z1" title={u.title} status={unitStatus(u.unitId)} statusLabel="Red · breach" integration={u.integration} highlight={nav.highlightRef === u.unitId}>
      <button
        type="button"
        onClick={() => nav.drill({ screen: "drill", kind: "clause", restrictionId: r.restrictionId, focus: "population" }, u.unitId)}
        className={`block rounded text-left ${ui.focus}`}
      >
        <p className="text-base font-bold text-[var(--ukb-text)]">
          No: {r.breachesAccounts} accounts for {r.breachesCustomers} customers in breach, in {r.tested.toLocaleString("en-GB")} tested in the latest monthly run.
        </p>
      </button>
      <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
        <DeltaValue value={`${r.breachesAccounts} of ${r.tested.toLocaleString("en-GB")}`} denominator="tested in breach" delta={`+${r.breachesAccounts - r.previousRun.breachesAccounts} vs previous run`} size="lg" />
        <DeltaValue value={`${r.tested.toLocaleString("en-GB")} of ${r.inScope.toLocaleString("en-GB")}`} denominator="in scope tested (account openings)" />
      </div>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">
        {r.untested[0].count.toLocaleString("en-GB")} {r.untested[0].route.toLowerCase()} untested, shown as untested, not compliant. Months since the last zero-breach month: {r.monthsSinceZero}{" "}
        <PracticeLabel kind="illustrative" />
      </p>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">
        Breach routes: {r.byRoute.filter((b) => b.lane !== "manual").map((b) => `${b.route} ${b.accounts}`).join(" · ")}
      </p>
      <p className="text-xs text-[var(--ukb-muted)]">Manual-route lane: {manual.map((b) => `${b.route} ${b.accounts}`).join(" · ")}</p>
      <p className="mt-2 rounded-md border border-dashed border-[var(--ukb-track)] px-2 py-1 text-xs text-[var(--ukb-muted)]">
        <span className="font-semibold">Contrast, not status: </span>
        {r.flagContrast}
      </p>
      <div className="mt-1">
        <IntegrityBadge badgeRef="s3-z1" snapshot={u.integrity} />
      </div>
      <SoWhat>Contain today, and fix test coverage for the partner channel.</SoWhat>
      <div className="mt-2 space-y-1">
        <RuleLine>{u.ruleLine}</RuleLine>
        <p className="text-xs text-[var(--ukb-muted)]">Owner: {u.ownerRole} (containment) · test run {r.runDate}</p>
        <PrecedentLine id="uk-starling-2024" />
        <p className="text-xs text-[var(--ukb-muted)]">
          Ledger entry already open: logged 26 October 2026 by CRO office{" "}
          <button type="button" onClick={() => scrollTo("s3-z3")} className={`${ui.link} ${ui.focus}`}>
            see the ledger
          </button>
        </p>
      </div>
      <ActionList draftIds={u.draftIds} canGate={nav.canGate} />
    </CardShell>
  );
}

/* Z2 attestation evidence (CMP-22) */
function ClauseEvidenceList() {
  const nav = useNav();
  const r = RESTRICTION;
  const notSupported = r.clauses.filter((c) => c.verdict !== "supported").length;
  return (
    <CardShell id="s3-z2" title="Does the attestation we are about to give match the test?" status="red" statusLabel={`${notSupported} of ${r.clauses.length} clauses not supported`}>
      <button
        type="button"
        onClick={() => nav.drill({ screen: "drill", kind: "clause", restrictionId: r.restrictionId, focus: "attestation" }, "s3-z2")}
        className={`block rounded text-left ${ui.focus}`}
      >
        <p className="text-sm font-bold text-[var(--ukb-text)]">
          Q3 2026 attestation due in {r.attestationDaysLeft} days ({r.attestationDue}). {notSupported} of {r.clauses.length} clauses not supported by the evidence.
        </p>
      </button>
      <ul className="mt-2 space-y-1">
        {r.clauses.map((c) => (
          <li key={c.clauseId} className="flex items-start justify-between gap-2 text-xs">
            <span className="text-[var(--ukb-muted)]">{c.text}</span>
            <StatusToken status={VERDICT[c.verdict].status} label={VERDICT[c.verdict].label} />
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">Test runs present: 3 of 3 months in the period</p>
      <SoWhat>The attesting SMF needs the evidence summary before signing.</SoWhat>
      <div className="mt-2">
        <RuleLine>For Q3 2026 the test runs and milestones support 3 of 4 clauses; one is not supported because the test found breaches.</RuleLine>
        <p className="mt-1 text-xs text-[var(--ukb-muted)]">Owner: attesting SMF (Head of Financial Crime). The SMF writes and signs; the product never drafts a compliance claim.</p>
      </div>
      <ActionList draftIds={["d-t228-summary", "d-t228-facts"]} canGate={nav.canGate} />
    </CardShell>
  );
}

export function routeFace(route: ReportRoute, drafts: Record<string, { status: string }>): string {
  if (route.isSar) return route.status === "not_engaged" ? "SAR question closed" : "SAR question open";
  if (route.status === "decided") {
    const d = route.history[route.history.length - 1];
    return `Decided by ${PEOPLE[d.deciderPersonId].name} on ${d.decidedOn}`;
  }
  if (route.caseDraftId && drafts[route.caseDraftId]?.status === "sent_to_owner") return DRAFTS[route.caseDraftId].faceAfter;
  if (route.caseDraftId && drafts[route.caseDraftId]?.status === "accepted") return "Case prepared · not yet sent";
  return route.status === "not_assessed" ? "Not assessed · case not prepared" : "Decision pending · case not prepared";
}

/* Z3 reportability ledger (CMP-23), boxed; route rows on the face (V-9) */
function ReportabilityLedger() {
  const nav = useNav();
  const { state } = useBoard();
  return (
    <CardShell id="s3-z3" title="What may be reportable, on which clock, and who is deciding?">
      <div className="max-h-[300px] overflow-y-auto rounded-lg border border-[var(--ukb-border)]" role="list" aria-label="Reportability ledger">
        {EVENTS.map((e) => {
          const { decided, total } = routesDecided(e.eventId, ROUTES);
          return (
            <div key={e.eventId}>
              <div className="sticky top-0 z-[1] border-b border-[var(--ukb-border)] bg-[var(--ukb-surface-2)] px-3 py-1.5">
                <p className="text-xs font-bold text-[var(--ukb-text)]">{e.title}</p>
                <p className="text-[11px] text-[var(--ukb-muted)]">
                  Logged awareness {e.loggedAwareness} · day {e.dayN} · {decided} of {total} routes decided
                </p>
                {e.awarenessGap && isVisible("cro_and_deciding_smf", state.viewer) ? (
                  <p className="mt-0.5 text-[11px] text-[var(--ukb-muted)]">
                    <span className="font-semibold">Awareness date check: </span>A linked issue was raised 21 August and a control test failed 02 September, {e.awarenessGap.gapDays} days before the logged
                    awareness date. The deciding SMF decides whether the date stands.
                  </p>
                ) : null}
              </div>
              {ROUTES.filter((r) => r.eventId === e.eventId).map((r) => (
                <button
                  key={r.routeId}
                  type="button"
                  role="listitem"
                  onClick={() => nav.drill({ screen: "drill", kind: "route", eventId: e.eventId, routeId: r.routeId }, r.routeId)}
                  className={`flex min-h-[52px] w-full flex-col gap-0.5 border-b border-[var(--ukb-border)] px-3 py-1.5 text-left text-xs hover:bg-[var(--ukb-surface-2)] sm:flex-row sm:items-center sm:justify-between ${ui.focus} ${
                    nav.highlightRef === r.routeId ? "bg-[var(--ukb-highlight)]" : ""
                  }`}
                >
                  <span className="font-semibold text-[var(--ukb-text)]">{r.name}</span>
                  <span className="text-[var(--ukb-muted)]">
                    {r.isSar ? "" : `Clock: ${r.clock} · day ${e.dayN}`}
                    {!r.isSar && r.clockHours === 24 && r.status !== "decided" ? (
                      <>
                        {" · 24-hour triage target passed"}
                        <PracticeLabel kind="practice_not_rule" />
                      </>
                    ) : null}
                    {r.isSar ? null : <PracticeLabel kind="unverified_clock" />}
                  </span>
                  <span className="font-semibold text-[var(--ukb-text)]">{routeFace(r, state.session.drafts)}</span>
                </button>
              ))}
            </div>
          );
        })}
        {state.session.ledgerDrafts.map((l) => (
          <div key={l.draftId} className="border-b border-[var(--ukb-border)] bg-[var(--ukb-surface-2)] px-3 py-1.5">
            <p className="text-xs font-bold text-[var(--ukb-text)]">{l.label}</p>
            <p className="text-[11px] text-[var(--ukb-muted)]">Opened {l.on} by CRO office · case not prepared</p>
          </div>
        ))}
      </div>
      <SoWhat>Every engaged route needs a named SMF decision; the product prepares the case.</SoWhat>
      <div className="mt-2">
        <RuleLine>
          Event 2 may engage 4 routes; 1 has a recorded decision. Clocks run from the logged awareness date. Clock values unverified.
        </RuleLine>
        <p className="mt-1 text-xs text-[var(--ukb-muted)]">Engagement is the deciding SMF&apos;s legal judgement. The product never files or notifies.</p>
      </div>
    </CardShell>
  );
}

export default function RestrictionsReportabilityScreen() {
  const r = RESTRICTION;
  return (
    <BoardLayoutGrid
      band={
        <AiExecutiveBand
          critical={{
            text: `Restriction on new high-risk customers breached: ${r.breachesAccounts} of ${r.tested.toLocaleString("en-GB")} tested; ${r.untested[0].count.toLocaleString("en-GB")} partner-channel openings untested`,
            onClick: () => scrollTo("s3-z1"),
          }}
          due={{ text: `Q3 2026 attestation due in ${r.attestationDaysLeft} days`, onClick: () => scrollTo("s3-z2") }}
          steady={{ text: "3 of 4 clauses supported by the evidence", onClick: () => scrollTo("s3-z2") }}
          aiLine="Summarised from the population test run and the clause evidence for Q3 2026. It adds no figures of its own."
        />
      }
      rows={[
        { key: "r1", left: <PopulationTestCard />, rightStack: [<ClauseEvidenceList key="z2" />] },
        { key: "r2", full: <ReportabilityLedger /> },
      ]}
    />
  );
}

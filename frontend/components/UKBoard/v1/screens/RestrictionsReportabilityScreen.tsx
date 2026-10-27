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
import {
  BoardLayoutGrid,
  CardShell,
  DeltaValue,
  Details,
  IntegrityBadge,
  MutedLine,
  PageTitle,
  PracticeLabel,
  PrecedentLine,
  RuleLine,
  SoWhat,
  StatusToken,
} from "../primitives";
import { useBoard } from "../state/boardStore";
import { ui } from "../theme";
import { ActionList, unitStatus, useNav } from "./shared";

const VERDICT = {
  supported: { status: "within_appetite" as const, label: "Supported" },
  partly: { status: "amber" as const, label: "Partly" },
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
  const open = () => nav.drill({ screen: "drill", kind: "clause", restrictionId: r.restrictionId, focus: "population" }, u.unitId);
  return (
    <CardShell
      id="s3-z1"
      title={u.title}
      status={unitStatus(u.unitId)}
      statusLabel="Breach"
      integration={u.integration}
      highlight={nav.highlightRef === u.unitId}
      footer={
        <div className="flex flex-col gap-3">
          <IntegrityBadge badgeRef="s3-z1" snapshot={u.integrity} owner="Head of Financial Crime" />
          <ActionList draftIds={u.draftIds} canGate={nav.canGate} />
        </div>
      }
    >
      <button type="button" onClick={open} className={`block rounded text-left ${ui.focus}`}>
        <DeltaValue value={`${r.breachesAccounts} of ${r.tested.toLocaleString("en-GB")}`} denominator="tested accounts in breach" delta={`+${r.breachesAccounts - r.previousRun.breachesAccounts} vs previous run`} size="xl" />
      </button>
      <MutedLine>
        {r.breachesCustomers} customers · {r.tested.toLocaleString("en-GB")} of {r.inScope.toLocaleString("en-GB")} openings in scope tested · {r.untested[0].count.toLocaleString("en-GB")} partner-channel
        openings untested
      </MutedLine>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {r.byRoute.map((b) => (
          <div key={b.route} className="rounded-lg bg-[var(--ukb-surface-2)] px-3 py-2">
            <p className="text-lg font-bold tabular-nums text-[var(--ukb-text)]">{b.accounts}</p>
            <p className="text-[11px] leading-snug text-[var(--ukb-muted)]">
              {b.route}
              {b.lane === "manual" ? " (manual lane)" : ""}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 rounded-md border border-dashed border-[var(--ukb-track)] px-3 py-1.5 text-xs text-[var(--ukb-muted)]">
        <span className="font-semibold text-[var(--ukb-text)]">Contrast, not status:</span> flag fired 1,208 times, 100% blocked. A flag firing is not evidence of adherence.
      </p>
      <SoWhat>Contain today, and fix test coverage for the partner channel.</SoWhat>
      <Details>
        <RuleLine>{u.ruleLine}</RuleLine>
        <MutedLine>
          Latest run {r.runDate}. Months since the last zero-breach month: {r.monthsSinceZero} <PracticeLabel kind="illustrative" />. Ledger entry already open, logged 26 October 2026.
        </MutedLine>
        <PrecedentLine id="uk-starling-2024" />
      </Details>
    </CardShell>
  );
}

/* Z2 attestation evidence (CMP-22) */
function ClauseEvidenceList() {
  const nav = useNav();
  const r = RESTRICTION;
  const notSupported = r.clauses.filter((c) => c.verdict !== "supported").length;
  return (
    <CardShell
      id="s3-z2"
      title="Does the attestation we are about to give match the test?"
      footer={<ActionList draftIds={["d-t228-summary", "d-t228-facts"]} canGate={nav.canGate} />}
    >
      <button
        type="button"
        onClick={() => nav.drill({ screen: "drill", kind: "clause", restrictionId: r.restrictionId, focus: "attestation" }, "s3-z2")}
        className={`block rounded text-left ${ui.focus}`}
      >
        <DeltaValue value={`${notSupported} of ${r.clauses.length}`} denominator="clauses not supported" size="lg" />
      </button>
      <MutedLine>Q3 2026 attestation due in {r.attestationDaysLeft} days ({r.attestationDue})</MutedLine>
      <ul className="mt-3 divide-y divide-[var(--ukb-border)] rounded-lg border border-[var(--ukb-border)]">
        {r.clauses.map((c) => (
          <li key={c.clauseId} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
            <span className="text-[var(--ukb-text)]" title={c.text}>
              {c.ref}
            </span>
            <StatusToken status={VERDICT[c.verdict].status} label={VERDICT[c.verdict].label} />
          </li>
        ))}
      </ul>
      <SoWhat>The attesting SMF needs the evidence summary before signing.</SoWhat>
      <Details>
        <RuleLine>For Q3 2026 the test runs support 3 of 4 clauses; one is not supported because the test found breaches.</RuleLine>
        <MutedLine>Test runs present for 3 of 3 months. The SMF writes and signs; the product never drafts a compliance claim.</MutedLine>
      </Details>
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
      <div className="hidden grid-cols-[1fr_200px_1fr] gap-3 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)] md:grid">
        <span>Route</span>
        <span>Clock</span>
        <span>Decision</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto rounded-lg border border-[var(--ukb-border)]" role="list" aria-label="Reportability ledger">
        {EVENTS.map((e) => {
          const { decided, total } = routesDecided(e.eventId, ROUTES);
          return (
            <div key={e.eventId}>
              <div className="sticky top-0 z-[1] flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ukb-border)] bg-[var(--ukb-surface-2)] px-3 py-2">
                <p className="text-xs font-bold text-[var(--ukb-text)]">{e.title}</p>
                <p className="text-[11px] text-[var(--ukb-muted)]">
                  Day {e.dayN} · {decided} of {total} routes decided
                </p>
                {e.awarenessGap && isVisible("cro_and_deciding_smf", state.viewer) ? (
                  <p className="w-full text-[11px] text-[var(--ukb-muted)]">
                    Awareness date check: earlier linked records {e.awarenessGap.gapDays} days before the logged date. The deciding SMF decides whether it stands.
                  </p>
                ) : null}
              </div>
              {ROUTES.filter((r) => r.eventId === e.eventId).map((r) => (
                <button
                  key={r.routeId}
                  type="button"
                  role="listitem"
                  onClick={() => nav.drill({ screen: "drill", kind: "route", eventId: e.eventId, routeId: r.routeId }, r.routeId)}
                  className={`grid w-full grid-cols-1 gap-1 border-b border-[var(--ukb-border)] px-3 py-2.5 text-left text-xs last:border-b-0 hover:bg-[var(--ukb-surface-2)] md:grid-cols-[1fr_200px_1fr] md:items-center md:gap-3 ${ui.focus} ${
                    nav.highlightRef === r.routeId ? "bg-[var(--ukb-highlight)]" : ""
                  }`}
                >
                  <span className="font-semibold text-[var(--ukb-text)]">{r.name}</span>
                  <span className="text-[var(--ukb-muted)]">
                    {r.isSar ? "—" : r.clock}
                    {!r.isSar && r.clockHours === 24 && r.status !== "decided" ? " · past 24-hour triage" : ""}
                  </span>
                  <span className="font-semibold text-[var(--ukb-text)]">{routeFace(r, state.session.drafts)}</span>
                </button>
              ))}
            </div>
          );
        })}
        {state.session.ledgerDrafts.map((l) => (
          <div key={l.draftId} className="border-b border-[var(--ukb-border)] bg-[var(--ukb-surface-2)] px-3 py-2 last:border-b-0">
            <p className="text-xs font-bold text-[var(--ukb-text)]">{l.label}</p>
            <p className="text-[11px] text-[var(--ukb-muted)]">Opened {l.on} by CRO office · case not prepared</p>
          </div>
        ))}
      </div>
      <SoWhat>Every engaged route needs a named SMF decision; the product prepares the case.</SoWhat>
      <Details>
        <RuleLine>Clocks run from the logged awareness date. Clock values are unverified; the 24-hour triage target is firm practice.</RuleLine>
        <MutedLine>Engagement is the deciding SMF&apos;s legal judgement. The product never files or notifies.</MutedLine>
      </Details>
    </CardShell>
  );
}

export default function RestrictionsReportabilityScreen() {
  const r = RESTRICTION;
  return (
    <BoardLayoutGrid
      band={
        <>
          <PageTitle title="Restrictions and reportability" subtitle="Is the restriction obeyed across the whole population, and who is deciding what may be reportable." />
          <AiExecutiveBand
            critical={{
              text: `Restriction breached: ${r.breachesAccounts} of ${r.tested.toLocaleString("en-GB")} tested; ${r.untested[0].count.toLocaleString("en-GB")} openings untested`,
              onClick: () => scrollTo("s3-z1"),
            }}
            due={{ text: `Q3 2026 attestation due in ${r.attestationDaysLeft} days`, onClick: () => scrollTo("s3-z2") }}
            steady={{ text: "3 of 4 clauses supported by the evidence", onClick: () => scrollTo("s3-z2") }}
            aiLine="Summarised from the population test run and the clause evidence for Q3 2026. It adds no figures of its own."
          />
        </>
      }
      rows={[
        { key: "r1", left: <PopulationTestCard />, rightStack: [<ClauseEvidenceList key="z2" />] },
        { key: "r2", full: <ReportabilityLedger /> },
      ]}
    />
  );
}

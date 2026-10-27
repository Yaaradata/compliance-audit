"use client";

/**
 * UK Board v1 — S4 Escalation health, seen as the BRC chair (beat 4).
 * The removed item is the persistent amber (TC-10). Items cannot be removed from the face.
 * CRO actions appear only in the separate "CRO preview actions" strip (9C-OD-4).
 * No awareness-gap content and no individual SMF trails here (HF-9, HF-10).
 */
import { EVENTS, KRI_TILES, MANIFEST_ID, PACK_ITEMS, ROUTES, SERIES, UNITS, VULN_HISTORY } from "@/lib/ukboard/v1/data";
import { projectedCrossing } from "@/lib/ukboard/v1/selectors";
import type { KriTile } from "@/lib/ukboard/v1/types";
import { AiExecutiveBand, DraftActionCard, GatedFaceLine } from "../ai";
import { BoardLayoutGrid, CardShell, DeltaValue, IntegrityBadge, PracticeLabel, RuleLine } from "../primitives";
import { agendaProposalCount, useBoard } from "../state/boardStore";
import { ui } from "../theme";
import { SoWhat, unitStatus, useNav } from "./shared";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function useLatestManifest() {
  const { state } = useBoard();
  const versions = state.session.manifestVersions;
  return versions[versions.length - 1];
}

/* Z1 headline: T2-34 with the T2-35 state inline */
function EscalationHeadline() {
  const nav = useNav();
  const u = UNITS["u-vuln"];
  const redIn = projectedCrossing(SERIES["u-vuln"], 18);
  return (
    <CardShell id="s4-z1" title={u.title} status={unitStatus(u.unitId)} statusLabel="Amber · persistent" highlight={nav.highlightRef === u.unitId}>
      <button
        type="button"
        onClick={() => nav.drill({ screen: "drill", kind: "manifest", manifestId: MANIFEST_ID, itemId: "pi-vuln" }, u.unitId)}
        className={`block rounded text-left ${ui.focus}`}
      >
        <p className="text-base font-bold text-[var(--ukb-text)]">{u.stateSentence}</p>
      </button>
      <p className="mt-1 text-sm text-[var(--ukb-muted)]">{VULN_HISTORY}, with no action, decision or escalation recorded.</p>
      <div className="mt-1">
        <DeltaValue value="3 quarters" denominator="at amber against a persistence rule of 2" />
        <PracticeLabel kind="practice_not_rule" />
      </div>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">Red projected in {redIn ?? "—"} (2 quarters) · early warning, not a prediction.</p>
      <div className="mt-1">
        <IntegrityBadge badgeRef="s4-z1" snapshot={u.integrity} />
      </div>
      <SoWhat>Put it on the December agenda and decide remediation, a time-limited waiver or a recalibration review.</SoWhat>
      <div className="mt-2 space-y-1">
        <RuleLine>{u.ruleLine}</RuleLine>
        <p className="text-xs text-[var(--ukb-muted)]">Decides: BRC chair · proves nothing recorded, not that nothing was discussed</p>
      </div>
      <div className="mt-3">
        <DraftActionCard draftId="d-t234-options" canGate={false} />
      </div>
      <GatedFaceLine draftIds={["d-t235-restore"]} />
    </CardShell>
  );
}

/* Z2 exception feed + override log (CMP-26), boxed; removed item pinned first */
function ExceptionFeed() {
  const nav = useNav();
  const latest = useLatestManifest();
  const ordered = [...PACK_ITEMS].sort((a, b) => Number(!!b.removal) - Number(!!a.removal));
  const inPack = latest.itemIds.length;
  return (
    <CardShell id="s4-z2" title="What qualified for this BRC?">
      <p className="text-sm text-[var(--ukb-text)]">
        {PACK_ITEMS.length} items qualify under your routing rules; {inPack} in the pack (v{latest.version}, {latest.state});{" "}
        {PACK_ITEMS.length - inPack
          ? `${PACK_ITEMS.length - inPack} removed at ERC with no reason recorded`
          : `1 removed at ERC with no reason recorded, restored in draft v${latest.version}`}
        .
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">Exception feed and override log</p>
      <div className="max-h-[236px] overflow-y-auto rounded-lg border border-[var(--ukb-border)]" role="list" aria-label="Exception feed">
        {ordered.map((i) => {
          const removedNow = !latest.itemIds.includes(i.itemId);
          return (
            <button
              key={i.itemId}
              type="button"
              role="listitem"
              onClick={() => nav.drill({ screen: "drill", kind: "manifest", manifestId: MANIFEST_ID, itemId: i.itemId }, i.itemId)}
              className={`flex min-h-[56px] w-full flex-col gap-0.5 border-b border-[var(--ukb-border)] px-3 py-1.5 text-left text-xs last:border-b-0 hover:bg-[var(--ukb-surface-2)] ${ui.focus} ${
                nav.highlightRef === i.itemId ? "bg-[var(--ukb-highlight)]" : ""
              }`}
            >
              <span className="font-semibold text-[var(--ukb-text)]">{i.label}</span>
              <span className="text-[var(--ukb-subtle)]">Routing rule: {i.routingRule}</span>
              {i.removal ? (
                <span className="text-[var(--ukb-muted)]">
                  {removedNow ? "Removed" : "Was removed"} at {i.removal.atForum} on {i.removal.on} · approver: {i.removal.approver ?? "none recorded"} · reason: {i.removal.reason ?? "no reason recorded"}
                  {removedNow ? "" : ` · restored in draft v${latest.version}`}
                </span>
              ) : (
                <span className="text-[var(--ukb-muted)]">In the pack</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2">
        <RuleLine>Items are placed by the firm&apos;s routing rules and cannot be removed without a named approver and a reason code.</RuleLine>
        <PracticeLabel kind="practice_not_rule" />
      </div>
    </CardShell>
  );
}

/* Z3 governance KRI tiles (CMP-27) */
function GovernanceKriTile({ tile }: { tile: KriTile }) {
  const nav = useNav();
  const u = UNITS[tile.unitId];
  return (
    <CardShell id={`s4-${tile.unitId}`} title={tile.title} status={unitStatus(u.unitId)} statusLabel={tile.variant === "effectiveness" ? "Closed without effect" : tile.variant === "backlog" ? "Overdue, extended" : "Above latency threshold"} highlight={nav.highlightRef === u.unitId}>
      <button type="button" onClick={() => nav.drill({ screen: "drill", kind: "kri", unitId: tile.unitId }, tile.unitId)} className={`block rounded text-left ${ui.focus}`}>
        <p className="text-lg font-bold text-[var(--ukb-text)]">{tile.primary}</p>
      </button>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">{tile.secondary}</p>
      <div className="mt-1">
        <IntegrityBadge badgeRef={`s4-${tile.unitId}`} snapshot={u.integrity} />
      </div>
      <div className="mt-2">
        <RuleLine>{tile.ruleLine}</RuleLine>
      </div>
      <GatedFaceLine draftIds={[tile.draftId]} />
      <p className="mt-2 text-[11px] text-[var(--ukb-subtle)]">Proposal for the chair is in the CRO preview actions strip below.</p>
    </CardShell>
  );
}

/* Separate labelled strip for CRO actions on the chair preview (9C-OD-4) */
function CroPreviewStrip() {
  return (
    <section aria-label="CRO preview actions" className="rounded-xl border border-dashed border-[var(--ukb-track)] p-4">
      <h2 className="text-sm font-bold text-[var(--ukb-text)]">CRO preview actions</h2>
      <p className="mb-2 text-xs text-[var(--ukb-muted)]">Actions for the CRO as pack owner while previewing. They are not part of the chair&apos;s view; the chair decides.</p>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {["d-t235-restore", "d-pg5", "d-t236-agenda", "d-t237-review", "d-t238-reopen"].map((id) => (
          <DraftActionCard key={id} draftId={id} canGate />
        ))}
      </div>
    </section>
  );
}

export default function EscalationHealthScreen() {
  const { state } = useBoard();
  const latest = useLatestManifest();
  const proposals = agendaProposalCount(state);
  const decided = ROUTES.filter((r) => r.status === "decided").length;
  const events = EVENTS.length + state.session.ledgerDrafts.length;
  return (
    <div className="space-y-4">
      <BoardLayoutGrid
        band={
          <AiExecutiveBand
            critical={{
              text: latest.itemIds.length < PACK_ITEMS.length ? "1 qualifying item removed at ERC with no reason recorded" : "Removed item restored in draft; awaiting CRO pack approval",
              onClick: () => scrollTo("s4-z1"),
            }}
            due={{ text: `December agenda items proposed: ${proposals}`, onClick: () => scrollTo("s4-u-kri-backlog") }}
            steady={{ text: `${latest.itemIds.length} of ${PACK_ITEMS.length} qualifying items in the pack (v${latest.version}, ${latest.state})`, onClick: () => scrollTo("s4-z2") }}
            aiLine="Summarised from the BRC exception feed, the override log and the governance KRIs for this cycle. It adds no figures of its own."
          />
        }
        rows={[
          { key: "r1", left: <EscalationHeadline />, rightStack: [<ExceptionFeed key="z2" />] },
          {
            key: "r2",
            full: (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {KRI_TILES.map((t) => (
                  <GovernanceKriTile key={t.unitId} tile={t} />
                ))}
              </div>
            ),
          },
        ]}
      />
      <CroPreviewStrip />
      <footer className="text-xs text-[var(--ukb-muted)]">
        Reportability: {events} events; {decided} of {ROUTES.length} routes decided (counts only; detail on Restrictions and reportability).
      </footer>
    </div>
  );
}

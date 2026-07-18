import { CRSA_MECHANISM_TAGS } from "./riskDomainsV6";
import { DOMAIN_ACCOUNTABILITY } from "./riskDomainsV6";
import type { SmcrTrailEvent } from "./smcrPrecedentAwareness";

export type StandingAwarenessGap = {
  id: string;
  kind: "issue" | "finding";
  title: string;
  daysOpen: number;
  attestationCyclesSpanned: number;
  evidenceRef: string;
  precedentNote?: string;
};

/** v6 demo standing duration — Nationwide-shaped gap without editing mockDataV2. */
const STANDING_DAYS_OVERRIDE: Record<string, number> = {
  "ISS-2026-009": 214,
};

export function attestationCycleDays(smf: {
  lastAttestationDate: string;
  nextAttestationDue: string;
}): number {
  const last = Date.parse(`${smf.lastAttestationDate}T00:00:00.000Z`);
  const next = Date.parse(`${smf.nextAttestationDue}T00:00:00.000Z`);
  const diff = next - last;
  if (!Number.isFinite(diff) || diff <= 0) return 90;
  return Math.round(diff / 86_400_000);
}

function trailReferencesId(trail: SmcrTrailEvent[], id: string): boolean {
  const needle = id.toLowerCase();
  return trail.some(
    (t) =>
      t.label.toLowerCase().includes(needle) ||
      (t.evidenceId != null && t.evidenceId.toLowerCase().includes(needle)),
  );
}

function crsaRefForSmf(smfFunction: string): string[] {
  if (smfFunction === "SMF4") return Object.keys(CRSA_MECHANISM_TAGS);
  const domains = Object.entries(DOMAIN_ACCOUNTABILITY)
    .filter(([, acc]) => "smf" in acc && acc.smf === smfFunction)
    .map(([id]) => id);
  if (domains.includes("fincrime")) {
    return Object.keys(CRSA_MECHANISM_TAGS);
  }
  return [];
}

export function standingAwarenessGaps(input: {
  smfId: string;
  smfFunction: string;
  lastAttestationDate: string;
  nextAttestationDue: string;
  trail: SmcrTrailEvent[];
  issues: Array<{
    id: string;
    title?: string;
    accountableSMFId?: string;
    daysOpen?: number;
    raisedDate?: string;
    status?: string;
  }>;
  findings: Array<{
    id: string;
    title?: string;
    racmRef?: string;
    discoveredDate?: string;
    firstLineRemediationStatus?: string;
  }>;
  asOf?: string;
}): StandingAwarenessGap[] {
  const cycleDays = attestationCycleDays({
    lastAttestationDate: input.lastAttestationDate,
    nextAttestationDue: input.nextAttestationDue,
  });
  const asOf = input.asOf ?? "2026-04-30";
  const asOfMs = Date.parse(`${asOf}T00:00:00.000Z`);
  const ownedCrsas = new Set(crsaRefForSmf(input.smfFunction));
  const gaps: StandingAwarenessGap[] = [];

  for (const issue of input.issues) {
    if (issue.accountableSMFId !== input.smfId) continue;
    if (issue.status === "closed") continue;
    const daysOpen = STANDING_DAYS_OVERRIDE[issue.id] ?? issue.daysOpen ?? 0;
    if (daysOpen <= cycleDays) continue;
    if (trailReferencesId(input.trail, issue.id)) continue;

    gaps.push({
      id: issue.id,
      kind: "issue",
      title: issue.title ?? issue.id,
      daysOpen,
      attestationCyclesSpanned: Math.max(1, Math.floor(daysOpen / cycleDays)),
      evidenceRef: issue.id,
      precedentNote:
        issue.id === "ISS-2026-009"
          ? "Nationwide — Internal Audit reported the failure on 19 October 2016; the Banking Proposition Board agreed in September 2017 to tolerate it for three months; the position stood until April 2020."
          : undefined,
    });
  }

  for (const finding of input.findings) {
    if (!finding.racmRef || !ownedCrsas.has(finding.racmRef)) continue;
    if (finding.firstLineRemediationStatus === "closed") continue;
    const discovered = finding.discoveredDate
      ? Date.parse(`${finding.discoveredDate}T00:00:00.000Z`)
      : asOfMs;
    const daysOpen = Math.max(0, Math.floor((asOfMs - discovered) / 86_400_000));
    if (daysOpen <= cycleDays) continue;
    if (trailReferencesId(input.trail, finding.id)) continue;

    gaps.push({
      id: finding.id,
      kind: "finding",
      title: finding.title ?? finding.id,
      daysOpen,
      attestationCyclesSpanned: Math.max(1, Math.floor(daysOpen / cycleDays)),
      evidenceRef: finding.id,
    });
  }

  return gaps.sort((a, b) => b.daysOpen - a.daysOpen);
}

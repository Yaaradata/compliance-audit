/**
 * v5 "What Changed" rows — evidence-bound, with NO confidence percentage.
 *
 * v4 shipped `confidence: 91` — a literal a developer typed. Under SM&CR the CRO
 * (SMF4) is personally accountable for what is laid before the Board Risk Committee,
 * and a confidence number with no derivation is the first thing a skilled person
 * challenges. So the number is gone. In its place every row carries HOW it was
 * derived (RULE vs LLM), the BASIS, the detection version, a REQUIRED evidenceRef,
 * and when it was evaluated.
 *
 * SYNTHETIC demo data, deterministic. Precedents remain the only real corpus.
 */
import type { RagStatus } from "../riskDomainTypes";
import {
  DOMAIN_EVIDENCE,
  DOMAIN_HISTORY,
  RISK_ACCEPTANCES,
  RISK_DOMAINS_V4,
  acceptanceElapsedDays,
} from "./riskDomainsV5";

export type ChangeRowV5 = {
  id: string;
  text: string;
  domainId: string;
  domainName: string;
  status: RagStatus;
  derivation: "RULE" | "LLM";
  basis: string;
  detectionVersion: string;
  evidenceRef: string; // REQUIRED — a change with no evidence does not ship
  evaluatedAt: string;
};

const EVALUATED_AT = "2026-07-10T00:00:00.000Z";

const STATUS_RANK: Record<RagStatus, number> = { GREEN: 0, AMBER: 1, RED: 2 };

const ROWS: ChangeRowV5[] = [
  {
    id: "cyber-closure",
    text: "Cyber remediation closure pack signed by Head of InfoSec and CTO ahead of the 18-Jul target.",
    domainId: "cyber",
    domainName: "Cyber & Information Security",
    status: "RED",
    derivation: "RULE",
    basis: "Closure artefact timestamp compared against the step target date",
    detectionVersion: "closure-check@1.0.0",
    evidenceRef: "EVID-CYBER-CLOSURE-2026-07",
    evaluatedAt: EVALUATED_AT,
  },
  {
    id: "fincrime-kyc-backlog",
    text: "KYC refresh backlog on high-risk relationships rose 4,210 → 4,380 against an appetite of <1,000.",
    domainId: "fincrime",
    domainName: "Fraud & Financial Crime",
    status: "AMBER",
    derivation: "RULE",
    basis: "KRI threshold comparison, KRI-FC-0417, 2026-07-01",
    detectionVersion: "kri-threshold@1.0.0",
    evidenceRef: "KRI-FC-0417",
    evaluatedAt: EVALUATED_AT,
  },
  {
    id: "fincrime-cdd-enhanced",
    text: "The MLRO report characterises CDD coverage on the migrated book as \u201Cenhanced\u201D.",
    domainId: "fincrime",
    domainName: "Fraud & Financial Crime",
    status: "AMBER",
    derivation: "LLM",
    basis: "Characterisation extracted from the MLRO Q2 report narrative; not a measured coverage figure",
    detectionVersion: "llm-extract@1.0.0",
    evidenceRef: "ATT-MLRO-2026-Q2",
    evaluatedAt: EVALUATED_AT,
  },
  {
    id: "credit-validation",
    text: "Credit risk models annual validation completed and logged within the 90-day cadence.",
    domainId: "credit",
    domainName: "Credit Risk",
    status: "GREEN",
    derivation: "RULE",
    basis: "Evidence artefact logged against the model-governance cadence",
    detectionVersion: "evidence-logged@1.0.0",
    evidenceRef: "EVID-CREDIT-VALIDATION-2026",
    evaluatedAt: EVALUATED_AT,
  },
  {
    id: "liquidity-lcr",
    text: "LCR reported at 148% against the 100% regulatory minimum on the June return.",
    domainId: "liquidity",
    domainName: "Liquidity & Funding",
    status: "GREEN",
    derivation: "RULE",
    basis: "KRI threshold comparison, LCR June regulatory return",
    detectionVersion: "kri-threshold@1.0.0",
    evidenceRef: "EVID-LIQ-LCR-2026-06",
    evaluatedAt: EVALUATED_AT,
  },
  {
    id: "regulatory-findings",
    text: "Q2 regulatory findings register refreshed with no new high-severity items.",
    domainId: "regulatory",
    domainName: "Regulatory & Compliance",
    status: "GREEN",
    derivation: "RULE",
    basis: "Evidence artefact logged within the 90-day cadence",
    detectionVersion: "evidence-logged@1.0.0",
    evidenceRef: "EVID-REG-FINDINGS-2026-Q2",
    evaluatedAt: EVALUATED_AT,
  },
];

/** RED first, then AMBER, then GREEN; stable within a band (original authoring order). */
export const WHAT_CHANGED_V5: ChangeRowV5[] = ROWS.map((row, i) => ({ row, i }))
  .sort((a, b) => STATUS_RANK[b.row.status] - STATUS_RANK[a.row.status] || a.i - b.i)
  .map(({ row }) => row);

/**
 * "What has NOT changed" — the mirror. Every fine in the research happened in the
 * stillness: Nationwide tolerated a known finding from Sep 2017 to Apr 2020, and a
 * "what changed" panel would have been empty on every board cycle in between.
 */
export type StillnessRowV5 = {
  id: string;
  kind: "standing-status" | "tolerance-expiry";
  text: string;
  domainId: string;
  domainName: string;
  status: RagStatus;
  durationDays: number;
};

const DAY_MS = 86_400_000;
const STILLNESS_THRESHOLD_CYCLES = 3; // > 2 cycles

function daysBetween(fromIsoDate: string, toIso: string): number {
  const from = Date.parse(fromIsoDate.length === 10 ? `${fromIsoDate}T00:00:00.000Z` : fromIsoDate);
  const to = Date.parse(toIso.length === 10 ? `${toIso}T00:00:00.000Z` : toIso);
  return Math.floor((to - from) / DAY_MS);
}

/** "8 days ago", "14 months ago", or an explicit no-artefact statement. */
function evidenceAge(domainId: string, asOf: string): string {
  const evidence = DOMAIN_EVIDENCE.find((e) => e.domainId === domainId);
  if (!evidence || !evidence.artefactTs) return "no evidence artefact on record";
  const days = daysBetween(evidence.artefactTs, asOf);
  if (days < 31) return `last evidence ${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30.44);
  return `last evidence ${months} month${months === 1 ? "" : "s"} ago`;
}

/** Trailing run of the newest status. Cycles are ordered oldest-first, newest LAST. */
function trailingRun(cycles: { reviewDate: string; status: RagStatus }[]): {
  status: RagStatus;
  length: number;
  startDate: string;
} {
  const last = cycles[cycles.length - 1];
  let length = 0;
  for (let i = cycles.length - 1; i >= 0; i--) {
    if (cycles[i].status !== last.status) break;
    length++;
  }
  return { status: last.status, length, startDate: cycles[cycles.length - length].reviewDate };
}

export function buildStillnessRows(asOf: string = EVALUATED_AT): StillnessRowV5[] {
  const rows: StillnessRowV5[] = [];

  for (const history of DOMAIN_HISTORY) {
    const run = trailingRun(history.cycles);
    if (run.status === "GREEN" || run.length < STILLNESS_THRESHOLD_CYCLES) continue;
    const domain = RISK_DOMAINS_V4.find((d) => d.id === history.domainId);
    if (!domain) continue;
    const remediationNote = domain.remediation
      ? "Remediation is in flight."
      : "No remediation step targets it.";
    rows.push({
      id: `standing-${history.domainId}`,
      kind: "standing-status",
      text: `${domain.name} — ${run.status} for ${run.length} cycles. ${capitalise(evidenceAge(history.domainId, asOf))}. ${remediationNote}`,
      domainId: history.domainId,
      domainName: domain.name,
      status: run.status,
      durationDays: daysBetween(run.startDate, asOf),
    });
  }

  for (const acceptance of RISK_ACCEPTANCES) {
    const elapsed = acceptanceElapsedDays(acceptance, asOf.slice(0, 10));
    if (elapsed <= acceptance.approvedDurationDays) continue;
    const domain = RISK_DOMAINS_V4.find((d) => d.id === acceptance.domainId);
    rows.push({
      id: `tolerance-${acceptance.id}`,
      kind: "tolerance-expiry",
      text: `${acceptance.committee} approved this risk for ${acceptance.approvedDurationDays} days. That was ${elapsed} days ago.`,
      domainId: acceptance.domainId,
      domainName: domain?.name ?? acceptance.domainId,
      status: domain?.status ?? "AMBER",
      durationDays: elapsed,
    });
  }

  // Oldest stillness at the top — sort by duration descending, id ascending as tie-break.
  return rows.sort((a, b) => b.durationDays - a.durationDays || a.id.localeCompare(b.id));
}

function capitalise(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

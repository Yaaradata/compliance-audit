/**
 * v6 board detectors — public entry point.
 *
 * runBoardDetectors runs every pure detector, dedupes overlapping emissions,
 * then returns a deterministically ordered list.
 */
import type { BoardSignal } from "../types";
import { rankPrecedents } from "../precedentRank";
import { detectAccountabilityOrphan } from "./accountabilityOrphan";
import { detectCrsaPrecedentMatch } from "./crsaPrecedentMatch";
import { detectDeadlineWithoutEvidence } from "./deadlineWithoutEvidence";
import { detectGreenWithoutEvidence } from "./greenWithoutEvidence";
import { detectKriBreachNoPlan } from "./kriBreachNoPlan";
import { detectSignedNotEvidenced } from "./signedNotEvidenced";
import { detectStandingStatus } from "./standingStatus";
import { detectToleranceExpiry } from "./toleranceExpiry";

export {
  detectAccountabilityOrphan,
  detectCrsaPrecedentMatch,
  detectDeadlineWithoutEvidence,
  detectGreenWithoutEvidence,
  detectKriBreachNoPlan,
  detectSignedNotEvidenced,
  detectStandingStatus,
  detectToleranceExpiry,
};

const SEVERITY_RANK: Record<BoardSignal["severity"], number> = { S1: 0, S2: 1, S3: 2 };

/** Dedupe key: one emission per CRSA ref, per green-without-evidence target, or per domain+mechanism. */
function dedupeKey(signal: BoardSignal): string {
  if (signal.detectionVersion.startsWith("crsa-precedent-match") && signal.crsaRef) {
    return `crsa:${signal.crsaRef}`;
  }
  if (signal.detectionVersion.startsWith("green-without-evidence")) {
    const sub = signal.subCategory ?? "domain";
    return `green:${signal.domainId}:${sub}`;
  }
  return `other:${signal.domainId}:${signal.mechanism}`;
}

/** Merge a group into ONE signal — strongest severity wins, precedents merged and capped. */
function mergeGroup(group: BoardSignal[]): BoardSignal {
  const sorted = [...group].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.id.localeCompare(b.id),
  );
  const base = sorted[0];
  const mergedPrecedents = rankPrecedents(group.flatMap((s) => s.precedents));
  const mergedClaims = group.flatMap((s) => s.claims ?? []);
  const mergedEvidenceRefs = [...new Set(group.flatMap((s) => s.evidenceRefs))];
  const mergedMissing = [...new Set(group.flatMap((s) => s.missingEvidence))];

  return {
    ...base,
    evidenceRefs: mergedEvidenceRefs,
    missingEvidence: mergedMissing.length > 0 ? mergedMissing : base.missingEvidence,
    precedents: mergedPrecedents,
    primaryPrecedent: mergedPrecedents[0] ?? null,
    claims: mergedClaims.length > 0 ? mergedClaims : base.claims,
  };
}

function dedupeSignals(signals: BoardSignal[]): BoardSignal[] {
  const buckets = new Map<string, BoardSignal[]>();
  for (const s of signals) {
    const key = dedupeKey(s);
    const list = buckets.get(key) ?? [];
    list.push(s);
    buckets.set(key, list);
  }
  return [...buckets.values()].map(mergeGroup);
}

export function runBoardDetectors(jurisdiction: "UK" | "US"): BoardSignal[] {
  const raw: BoardSignal[] = [
    ...detectGreenWithoutEvidence(),
    ...detectStandingStatus(),
    ...detectToleranceExpiry(),
    ...detectCrsaPrecedentMatch(jurisdiction),
    ...detectSignedNotEvidenced(),
    ...detectKriBreachNoPlan(),
    ...detectAccountabilityOrphan(),
    ...detectDeadlineWithoutEvidence(),
  ];

  const signals = dedupeSignals(raw);

  return signals.sort((a, b) => {
    const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (bySeverity !== 0) return bySeverity;
    const byTime = b.evaluatedAt.localeCompare(a.evaluatedAt);
    if (byTime !== 0) return byTime;
    return a.id.localeCompare(b.id);
  });
}

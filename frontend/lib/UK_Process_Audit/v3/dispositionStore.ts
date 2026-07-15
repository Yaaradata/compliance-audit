/**
 * Append-only disposition store for UKPA v3 signals.
 * Read-only for Internal Audit is enforced here — not only in the UI.
 *
 * Every disposition writes { actorId, reason, ts }. actorId is non-nullable.
 * No system actor may disposition.
 */
import type { UkSignal, UkSignalAction, UkSignalStatus } from "@/lib/UK_Process_Audit/signals";
import { canDisposition, type UkpaV3Persona } from "./persona";

export type UkDispositionStatus = Extract<
  UkSignalStatus,
  "ACCEPTED_EXCEPTION" | "CONFIRMED_ISSUE"
>;

export type UkSignalDisposition = {
  signalId: string;
  status: UkDispositionStatus;
  /** Non-nullable named human — never "system". */
  actorId: string;
  reason: string;
  /** ISO timestamp of the disposition write. */
  ts: string;
  /** ISO date — required when status === ACCEPTED_EXCEPTION */
  expiry: string | null;
};

export class DispositionForbiddenError extends Error {
  readonly code = "DISPOSITION_FORBIDDEN" as const;
  constructor(message = "Internal Audit cannot disposition second-line signals.") {
    super(message);
    this.name = "DispositionForbiddenError";
  }
}

export class DispositionValidationError extends Error {
  readonly code = "DISPOSITION_VALIDATION" as const;
  constructor(message: string) {
    super(message);
    this.name = "DispositionValidationError";
  }
}

const SYSTEM_ACTOR_IDS = new Set([
  "system",
  "SYSTEM",
  "sys",
  "automated",
  "bot",
  "machine",
  "detector",
]);

/** Runtime assert: actorId present and not a system identity. */
export function assertHumanActorId(actorId: string): asserts actorId is string {
  const trimmed = actorId.trim();
  if (!trimmed) {
    throw new DispositionValidationError("actorId is required and non-nullable.");
  }
  if (SYSTEM_ACTOR_IDS.has(trimmed.toLowerCase()) || SYSTEM_ACTOR_IDS.has(trimmed)) {
    throw new DispositionValidationError(
      `No system actor may disposition (actorId=${trimmed}).`,
    );
  }
}

/** Seed so the inbox shows all three status bands on first load. */
export const SEED_DISPOSITIONS: readonly UkSignalDisposition[] = [
  {
    signalId: "silence-DEP-05",
    status: "ACCEPTED_EXCEPTION",
    reason: "Remediation pack in flight; temporary acceptance pending July re-test.",
    expiry: "2026-07-31",
    actorId: "actor:a-whitfield",
    ts: "2026-06-28T09:00:00.000Z",
  },
  {
    signalId: "closure-REC-08",
    status: "CONFIRMED_ISSUE",
    reason: "Promoted to exception register — closure lacks evidence artefact.",
    expiry: null,
    actorId: "actor:a-whitfield",
    ts: "2026-06-29T11:30:00.000Z",
  },
];

export type ApplyDispositionInput = {
  signalId: string;
  status: UkDispositionStatus;
  reason: string;
  expiry: string | null;
  actorId: string;
  persona: UkpaV3Persona;
  /** Mechanism gate — Accept forbidden when procedure-defeats-duty */
  mechanism?: string;
};

/**
 * Validate and build a disposition record.
 * Writes { actorId, reason, ts }. Throws if persona/actor/reason invalid.
 */
export function applyDisposition(input: ApplyDispositionInput): UkSignalDisposition {
  if (!canDisposition(input.persona)) {
    throw new DispositionForbiddenError();
  }
  assertHumanActorId(input.actorId);
  if (!input.reason.trim()) {
    throw new DispositionValidationError("Reason is required.");
  }
  if (input.status === "ACCEPTED_EXCEPTION") {
    if (input.mechanism === "procedure-defeats-duty") {
      throw new DispositionValidationError(
        "Accept is unavailable when mechanism is procedure-defeats-duty.",
      );
    }
    if (!input.expiry?.trim()) {
      throw new DispositionValidationError("Expiry is required for Accept.");
    }
  }

  const record: UkSignalDisposition = {
    signalId: input.signalId,
    status: input.status,
    actorId: input.actorId.trim(),
    reason: input.reason.trim(),
    ts: new Date().toISOString(),
    expiry: input.status === "ACCEPTED_EXCEPTION" ? input.expiry!.trim() : null,
  };

  // Structural guarantee for reviewers at 2am.
  if (record.actorId == null || record.reason == null || record.ts == null) {
    throw new DispositionValidationError("Disposition must write { actorId, reason, ts }.");
  }

  return record;
}

/** Merge detector output with disposition overlays (latest disposition wins). */
export function mergeSignalDispositions(
  signals: UkSignal[],
  dispositions: readonly UkSignalDisposition[],
): UkSignal[] {
  const byId = new Map<string, UkSignalDisposition>();
  for (const d of dispositions) {
    byId.set(d.signalId, d);
  }
  return signals.map((s) => {
    const d = byId.get(s.id);
    if (!d) return s;
    return { ...s, status: d.status };
  });
}

/** Actions permitted for this persona — disposition acts stripped for Internal Audit. */
export function allowedHumanActions(
  persona: UkpaV3Persona,
  humanActions: readonly UkSignalAction[],
): UkSignalAction[] {
  if (canDisposition(persona)) return [...humanActions];
  return humanActions.filter(
    (a) => a === "OPEN_EVIDENCE" || a === "OPEN_INVESTIGATION",
  );
}

export function dispositionForSignal(
  dispositions: readonly UkSignalDisposition[],
  signalId: string,
): UkSignalDisposition | undefined {
  for (let i = dispositions.length - 1; i >= 0; i--) {
    const d = dispositions[i];
    if (d?.signalId === signalId) return d;
  }
  return undefined;
}

const SEVERITY_RANK: Record<UkSignal["severity"], number> = { S1: 0, S2: 1, S3: 2 };

/** Sort: severity ascending (S1 first), then evaluatedAt descending. */
export function sortInboxSignals(signals: UkSignal[]): UkSignal[] {
  return [...signals].sort((a, b) => {
    const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (sev !== 0) return sev;
    if (a.evaluatedAt !== b.evaluatedAt) return a.evaluatedAt < b.evaluatedAt ? 1 : -1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export type SignalsInboxBuckets = {
  detected: UkSignal[];
  accepted: UkSignal[];
  confirmed: UkSignal[];
};

export function bucketSignalsForInbox(signals: UkSignal[]): SignalsInboxBuckets {
  const detected: UkSignal[] = [];
  const accepted: UkSignal[] = [];
  const confirmed: UkSignal[] = [];
  for (const s of signals) {
    switch (s.status) {
      case "DETECTED_SIGNAL":
        detected.push(s);
        break;
      case "ACCEPTED_EXCEPTION":
        accepted.push(s);
        break;
      case "CONFIRMED_ISSUE":
        confirmed.push(s);
        break;
      default: {
        const _exhaustive: never = s.status;
        return _exhaustive;
      }
    }
  }
  return {
    detected: sortInboxSignals(detected),
    accepted: sortInboxSignals(accepted),
    confirmed: sortInboxSignals(confirmed),
  };
}

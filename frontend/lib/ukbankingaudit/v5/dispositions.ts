/**
 * v5 disposition layer — WHO may act on a board signal, and WHAT a valid action is.
 *
 * Role enforcement lives HERE, at the data layer, not in the UI. The Internal Audit
 * (third line) role can read everything and disposition NOTHING: if the Head of
 * Internal Audit could accept or override a second-line signal, its assurance over
 * this pack would be compromised. The UI disables controls, but even a UI that
 * forgot to would be refused here.
 *
 * Every disposition and acknowledgement writes { actorId, reason, ts }. `actorId` is non-nullable and no
 * SYSTEM actor may disposition or acknowledge — a decision must attach to a named human. Audit
 * entries are append-only: there is no edit and no delete in this module by design.
 */

export type BoardRole = "second-line" | "internal-audit";

export type DispositionKind = "accept" | "reject" | "escalate" | "override";

export type AuditEntry = {
  id: string;
  ts: string;
  actorId: string;
  role: BoardRole;
  kind: DispositionKind;
  signalId: string;
  reason: string;
  expiry?: string;
  target?: string;
};

export type DispositionInput = {
  role: BoardRole;
  actorId: string;
  kind: DispositionKind;
  signalId: string;
  reason: string;
  expiry?: string;
  target?: string;
};

export type DispositionResult =
  | { ok: true; entry: AuditEntry }
  | { ok: false; error: string };

/** Only the second line may disposition. The third line assures; it does not operate. */
export function canDisposition(role: BoardRole): boolean {
  return role === "second-line";
}

/** Reserved non-human actor ids. A system actor may never disposition. */
const SYSTEM_ACTOR_IDS = new Set(["system", "svc", "service", "automation", "bot", "cron"]);

export function isSystemActor(actorId: string): boolean {
  const normalised = actorId.trim().toLowerCase();
  return SYSTEM_ACTOR_IDS.has(normalised) || normalised.startsWith("svc-") || normalised.startsWith("svc_");
}

/** Field requirements per action, enforced regardless of what the UI submits. */
export function missingFields(input: DispositionInput): string[] {
  const missing: string[] = [];
  if (!input.actorId.trim()) missing.push("actorId");
  if (input.kind === "escalate") {
    if (!input.target?.trim()) missing.push("target");
  } else if (!input.reason.trim()) {
    missing.push("reason");
  }
  if (input.kind === "accept" && !input.expiry?.trim()) missing.push("expiry");
  return missing;
}

export type AcknowledgementEntry = {
  id: string;
  ts: string;
  actorId: string;
  reason: string;
  precedentId: string;
};

export type AcknowledgementInput = {
  role: BoardRole;
  actorId: string;
  reason: string;
  precedentId: string;
};

export type AcknowledgementResult =
  | { ok: true; entry: AcknowledgementEntry }
  | { ok: false; error: string };

/** Only the second line may acknowledge. The third line assures; it does not operate. */
export function canAcknowledge(role: BoardRole): boolean {
  return role === "second-line";
}

export function missingAcknowledgementFields(input: AcknowledgementInput): string[] {
  const missing: string[] = [];
  if (!input.actorId.trim()) missing.push("actorId");
  if (!input.reason.trim()) missing.push("reason");
  if (!input.precedentId.trim()) missing.push("precedentId");
  return missing;
}

/**
 * Validate and record an acknowledgement. Pure: returns the entry to append.
 * Every acknowledgement writes { actorId, reason, ts } with a non-nullable actorId.
 */
export function recordAcknowledgement(input: AcknowledgementInput): AcknowledgementResult {
  if (!canAcknowledge(input.role)) {
    return {
      ok: false,
      error: "Internal Audit is read-only. Third line assures controls it does not operate.",
    };
  }

  const missing = missingAcknowledgementFields(input);
  if (missing.length > 0) {
    return { ok: false, error: `Required before this action can fire: ${missing.join(", ")}.` };
  }

  if (isSystemActor(input.actorId)) {
    return {
      ok: false,
      error: "An acknowledgement must attach to a named human actor, never a system actor.",
    };
  }

  const entry: AcknowledgementEntry = {
    id: `${input.precedentId}:ack:${Date.now()}`,
    ts: new Date().toISOString(),
    actorId: input.actorId.trim(),
    reason: input.reason.trim(),
    precedentId: input.precedentId.trim(),
  };

  return { ok: true, entry };
}

/**
 * Validate and record a disposition. Pure: it returns the entry to append, it does
 * not hold state. The caller owns the append-only log.
 */
export function recordDisposition(input: DispositionInput): DispositionResult {
  if (!canDisposition(input.role)) {
    return {
      ok: false,
      error: "Internal Audit is read-only. Third line assures controls it does not operate.",
    };
  }

  const missing = missingFields(input);
  if (missing.length > 0) {
    return { ok: false, error: `Required before this action can fire: ${missing.join(", ")}.` };
  }

  if (isSystemActor(input.actorId)) {
    return { ok: false, error: "A disposition must attach to a named human actor, never a system actor." };
  }

  const entry: AuditEntry = {
    id: `${input.signalId}:${input.kind}:${Date.now()}`,
    ts: new Date().toISOString(),
    actorId: input.actorId.trim(),
    role: input.role,
    kind: input.kind,
    signalId: input.signalId,
    reason: input.reason.trim() || (input.kind === "escalate" ? `Escalated to ${input.target?.trim()}` : ""),
    expiry: input.expiry?.trim() || undefined,
    target: input.target?.trim() || undefined,
  };

  return { ok: true, entry };
}

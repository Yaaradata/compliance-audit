/**
 * Sanctioned card copy — the only path from detector → face text.
 *
 * A developer cannot type "has breached" into a card: UkSignal.signalObserved /
 * soWhat are branded {@link SanctionedCopy} values produced only here.
 */
export type Predicate =
  | "SIGNAL_FIRED"
  | "EVIDENCE_GAP_OBSERVED"
  | "PRECEDENT_MATCHED"
  | "HUMAN_REVIEW_REQUIRED";

declare const sanctionedCopyBrand: unique symbol;

/** Opaque string — assignable only via {@link renderCardCopy}. */
export type SanctionedCopy = string & { readonly [sanctionedCopyBrand]: true };

function sanction(text: string): SanctionedCopy {
  return text as SanctionedCopy;
}

/**
 * Structured slots only — no free-prose field.
 * Templates interpolate these; they never accept a raw headline.
 */
export type CopySlots = {
  controlId?: string;
  missedPeriods?: number;
  claimTerms?: string;
  coveragePct?: string;
  remediationId?: string;
  closedBy?: string;
  isLeaver?: boolean;
  isSynthetic?: boolean;
  respondent?: string;
  penaltyLabel?: string;
  noticeDate?: string;
  evidenceAgeLabel?: string;
};

export type CardCopy = {
  predicate: Predicate;
  signalObserved: SanctionedCopy;
  soWhat: SanctionedCopy;
};

type Template = {
  signalObserved: (s: CopySlots) => string;
  soWhat: (s: CopySlots) => string;
};

const TEMPLATES: Record<Predicate, Template> = {
  SIGNAL_FIRED: {
    signalObserved: () => "No evidence artefact in the expected testing window",
    soWhat: (s) =>
      `${s.controlId ?? "Control"} was due for testing and no evidence pack was filed for ${s.missedPeriods ?? 0} period(s).`,
  },
  EVIDENCE_GAP_OBSERVED: {
    signalObserved: (s) => {
      if (s.remediationId) {
        return `Remediation ${s.remediationId} closed with no evidence artefacts`;
      }
      if (s.claimTerms) {
        return `Completeness claim (${s.claimTerms}) without full population coverage`;
      }
      return "Evidence gap observed against the expected artefact set";
    },
    soWhat: (s) => {
      if (s.remediationId && s.isLeaver) {
        return `${s.remediationId} was closed by ${s.closedBy ?? "a named closer"} (leaver) with no evidence on file — the closure cannot be re-performed.`;
      }
      if (s.remediationId) {
        return `${s.remediationId} is marked closed but the evidence store holds no supporting artefacts.`;
      }
      if (s.isSynthetic) {
        return `Management asserted completeness; measured coverage is ${s.coveragePct ?? "below 100%"} of the stated population (synthetic seed).`;
      }
      if (s.claimTerms) {
        return `A completeness claim (${s.claimTerms}) is on file while coverage is ${s.coveragePct ?? "incomplete"}.`;
      }
      return "An expected evidence artefact is absent from the store for this window.";
    },
  },
  PRECEDENT_MATCHED: {
    signalObserved: (s) =>
      `Precedent mechanism overlap with ${s.respondent ?? "named respondent"}`,
    soWhat: (s) =>
      `Public notice: ${s.respondent ?? "respondent"} · ${s.penaltyLabel ?? "penalty"} · ${s.noticeDate ?? "date"} for the mechanism ${s.controlId ?? "control"} asserts it prevents. Last evidence: ${s.evidenceAgeLabel ?? "n/a"} ago.`,
  },
  HUMAN_REVIEW_REQUIRED: {
    signalObserved: () => "Human review required before disposition",
    soWhat: (s) =>
      `${s.controlId ?? "Control"} requires a named second-line actor to disposition — machine output alone is not sufficient.`,
  },
};

/**
 * Sole factory for card face copy. Detectors and UI must call this —
 * they must not assemble headlines from free strings.
 */
export function renderCardCopy(predicate: Predicate, slots: CopySlots = {}): CardCopy {
  const t = TEMPLATES[predicate];
  return {
    predicate,
    signalObserved: sanction(t.signalObserved(slots)),
    soWhat: sanction(t.soWhat(slots)),
  };
}

/** Narrow a string to SanctionedCopy only when it equals a rendered template line. */
export function isSanctionedCopy(value: string, copy: CardCopy): value is SanctionedCopy {
  return value === copy.signalObserved || value === copy.soWhat;
}

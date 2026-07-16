/**
 * Compile-time contracts for UKPA signals.
 * These fail `tsc --noEmit` — not a runtime review — when violated.
 */
import type {
  UkAuditTrailActor,
  UkPrecedent,
  UkRemediationItem,
  UkRuleConfigChange,
  UkSignalDispositionActor,
} from "./contracts.types";

/** Mirrors ClaimLineProps — artefactRef must stay required (no default, not optional). */
type ClaimLineProps = {
  children: unknown;
  derivation: "RULE" | "LLM";
  artefactRef: string;
  onOpenEvidence: (ref: string) => void;
};

type Expect<T extends true> = T;
type IsNotNullable<T> = null extends T ? false : undefined extends T ? false : true;
type HasScoreKey<T> = "score" extends keyof T ? true : false;

/** Required key: omitting it must not remain assignable to the full type. */
type KeyIsRequired<T, K extends keyof T> = Omit<T, K> extends T ? false : true;

/** UkPrecedent.admissionPosture is required (not optional) and not nullable. */
type _admissionPostureRequired = Expect<IsNotNullable<UkPrecedent["admissionPosture"]>>;
type _admissionPostureNotOptional = Expect<KeyIsRequired<UkPrecedent, "admissionPosture">>;

/** ClaimLineProps.artefactRef is required — no default, not optional. */
type _artefactRefRequired = Expect<KeyIsRequired<ClaimLineProps, "artefactRef">>;
type _artefactRefIsString = Expect<
  ClaimLineProps["artefactRef"] extends string
    ? string extends ClaimLineProps["artefactRef"]
      ? true
      : false
    : false
>;

/**
 * No `score` on actor / trail types.
 * Approvers and closers are actors in an audit trail — never rated subjects.
 */
type _noScoreOnTrailActor = Expect<HasScoreKey<UkAuditTrailActor> extends true ? false : true>;
type _noScoreOnRuleChange = Expect<HasScoreKey<UkRuleConfigChange> extends true ? false : true>;
type _noScoreOnRemediation = Expect<HasScoreKey<UkRemediationItem> extends true ? false : true>;
type _noScoreOnDispositionActor = Expect<
  HasScoreKey<UkSignalDispositionActor> extends true ? false : true
>;

export type UkpaSignalContracts = {
  admissionPosture: _admissionPostureRequired & _admissionPostureNotOptional;
  artefactRef: _artefactRefRequired & _artefactRefIsString;
  noScore: _noScoreOnTrailActor &
    _noScoreOnRuleChange &
    _noScoreOnRemediation &
    _noScoreOnDispositionActor;
};

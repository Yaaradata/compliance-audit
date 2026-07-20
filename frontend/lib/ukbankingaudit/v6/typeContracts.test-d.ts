/**
 * COMPILE-TIME contract tests. These are checked by `tsc` (not the node test runner);
 * this file has no runtime and the `.test-d.ts` suffix keeps it out of `*.test.ts`.
 * If any contract below is violated the type-check fails — the point is that these
 * invariants cannot regress silently.
 */
import type { ClaimLineProps } from "@/components/UKBankingAudit/v6/ClaimLine";
import type { AcknowledgementEntry, AuditEntry } from "./dispositions";
import type { Accountability, BoardSignal, BoardSignalTitle, Precedent } from "./types";
import type { DomainExposure, ExposureCount } from "./exposureTypes";
import type { PathToGreen } from "./pathToGreen";
import type { FraudLossRow } from "./fraudData";

type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type IsNullable<T> = null extends T ? true : undefined extends T ? true : false;
type IsOptionalKey<T, K extends keyof T> = object extends Pick<T, K> ? true : false;

// Precedent.admissionPosture is not nullable and has no default (never optional/undefined).
export type _PostureNotNullable = Expect<Equal<IsNullable<Precedent["admissionPosture"]>, false>>;
export type _PostureRequired = Expect<Equal<IsOptionalKey<Precedent, "admissionPosture">, false>>;

// ClaimLineProps.evidenceRef is required.
export type _EvidenceRefRequired = Expect<Equal<IsOptionalKey<ClaimLineProps, "evidenceRef">, false>>;
export type _EvidenceRefNotNullable = Expect<Equal<IsNullable<ClaimLineProps["evidenceRef"]>, false>>;

// No `score` field exists on any actor (Accountability) variant.
export type _NoScoreField = Expect<Equal<Extract<Accountability, { score: unknown }>, never>>;

// A disposition's actorId is non-nullable.
export type _ActorIdRequired = Expect<Equal<IsOptionalKey<AuditEntry, "actorId">, false>>;
export type _ActorIdNotNullable = Expect<Equal<IsNullable<AuditEntry["actorId"]>, false>>;

// An acknowledgement's actorId is non-nullable.
export type _AckActorIdRequired = Expect<Equal<IsOptionalKey<AcknowledgementEntry, "actorId">, false>>;
export type _AckActorIdNotNullable = Expect<Equal<IsNullable<AcknowledgementEntry["actorId"]>, false>>;

// BoardSignal.title is one of the eight detector literals, not a free string.
export type _TitleIsLiteral = Expect<Equal<BoardSignal["title"], BoardSignalTitle>>;

// Precedent.domainScope is required and non-empty at the type level.
export type _DomainScopeRequired = Expect<Equal<IsOptionalKey<Precedent, "domainScope">, false>>;

// ExposureCount.sourceLabel is required and non-nullable — provenance is mandatory.
export type _SourceLabelRequired = Expect<Equal<IsOptionalKey<ExposureCount, "sourceLabel">, false>>;
export type _SourceLabelNotNullable = Expect<Equal<IsNullable<ExposureCount["sourceLabel"]>, false>>;

// A DomainExposure with dataAvailable:false can only ever carry empty counts/exitCandidates.
type UnavailableExposure = Extract<DomainExposure, { dataAvailable: false }>;
export type _UnavailableCountsEmpty = Expect<Equal<UnavailableExposure["counts"], []>>;
export type _UnavailableExitCandidatesEmpty = Expect<Equal<UnavailableExposure["exitCandidates"], []>>;

// PathToGreen.lastUpdate.source is only "system" | "email" — no third provenance value.
type PathToGreenSource = NonNullable<PathToGreen["lastUpdate"]>["source"];
export type _PathToGreenSourceUnion = Expect<Equal<PathToGreenSource, "system" | "email">>;

// FraudLossRow aggregates by type only — no field identifies an individual customer.
export type _NoCustomerIdOnFraudRow = Expect<
  Equal<Extract<FraudLossRow, { customerId: unknown } | { customerName: unknown } | { individual: unknown }>, never>
>;

import type { RagStatus, CrsaControl, RiskDomainV4 } from "../riskDomainTypes";

// Re-export the shared domain types so v6 detectors can import them from a single module.
export type { RagStatus, CrsaControl, RiskDomainV4, DomainKri } from "../riskDomainTypes";

export type FailureMechanism =
  | "assertion-unevidenced" | "periodic-review-absent" | "cdd-coverage-shortfall"
  | "sanctions-screening-misconfigured" | "tm-scope-gap" | "alert-suppression"
  | "remediation-unevidenced" | "closure-signed-unevidenced"
  | "risk-tolerated-past-expiry" | "kri-breach-no-plan"
  | "accountability-orphan" | "repeat-finding" | "deadline-missed"
  | "restriction-breach";

/** Fixed detector titles — compile-time union, never free prose from mechanism tags. */
export const BOARD_SIGNAL_TITLES = [
  "Green Without Evidence",
  "Standing Status",
  "Tolerance Expiry",
  "Precedent Match",
  "Signed, Not Evidenced",
  "Breach Without a Plan",
  "Accountability Orphan",
  "Deadline Without Evidence",
  "Enforcement Notice",
  "Industry Event",
  "Emerging Risk",
] as const;

export type BoardSignalTitle = (typeof BOARD_SIGNAL_TITLES)[number];

/** Lower rank = stronger posture. A criminal conviction is contestable by nobody. */
export const POSTURE_RANK: Record<Precedent["admissionPosture"], number> = {
  "criminal-conviction": 0,
  "guilty-plea": 1,
  admitted: 2,
  "consent-order": 3,
  "settled-no-admission": 4,
  "tribunal-varied": 5,
  "undertaking-only": 6,
  alleged: 7,
  "open-investigation": 8,
};

export type StatusEvidence = {
  domainId: RiskDomainV4["id"]; subCategory?: string; crsaRef?: CrsaControl["ref"];
  artefactId: string | null;      // null === the status is an ASSERTION, not a fact
  artefactTs: string | null;
  expectedCadenceDays: number | null;
  cadenceSource: "register" | "policy-extracted" | "human-confirmed";
  sourceSystem?: string; sha256?: string;
  confirmedBy?: string;
  confirmedAt?: string;
};
// A domain is ARMED only when cadenceSource === "human-confirmed".
// An unarmed domain must NEVER produce a "green without evidence" signal.

export type StatusHistory = {
  domainId: RiskDomainV4["id"];
  cycles: { reviewDate: string; status: RagStatus }[];   // 12 entries, newest LAST
};

export type RiskAcceptance = {
  id: string; domainId: RiskDomainV4["id"]; committee: string;
  acceptedAt: string; approvedDurationDays: number;
  rationale: string; linkedFindingRef: string;
};

export type Accountability =
  | { regime: "UK"; smf: "SMF1"|"SMF2"|"SMF4"|"SMF16"|"SMF17"|"SMF24"; holder: string; prescribedResponsibility: string }
  | { regime: "US"; owner: string; threeLines: 1|2|3; mraRef: string | null }
  | { regime: "UK"|"US"; unowned: true };

export type Precedent = {
  id: string; jurisdiction: "UK" | "US";
  regulator: "FCA"|"PRA"|"PSR"|"CrownCourt"|"OCC"|"FRB"|"FDIC"|"FinCEN"|"CFPB"|"DOJ"|"StateAG";
  noticeDate: string; respondent: string;
  penalty: number | null; penaltyPreDiscount: number | null;
  nonMonetaryConsequence: string | null;   // "asset cap" | "growth restriction" | "VREQ" | "consent order"
  admissionPosture:                        // REQUIRED. No default. No optional.
    | "admitted" | "settled-no-admission" | "alleged" | "criminal-conviction"
    | "guilty-plea" | "consent-order" | "undertaking-only" | "open-investigation"
    | "tribunal-varied";
  domainScope: RiskDomainV4["id"][];       // REQUIRED — which CRO domains this notice is ABOUT
  failureMechanismTags: FailureMechanism[];
  mechanism: string;                       // one paragraph, paraphrased from the notice
  hook: string;                            // REQUIRED. One clause, max 10 words — the finding at a glance.
  sourceUrl: string; confidence: "verified" | "probable" | "unverified";
  /** Regulatory instruments named in the notice, when transcribed. */
  instrument?: string[];
  /** Tribunal-reduced figure when admissionPosture is tribunal-varied. */
  tribunalReducedTo?: number | null;
};

export type Derivation = "RULE" | "LLM";

// A single evidence-bound claim inside a signal. Used by the CRSA precedent-match
// detector, which carries one LLM claim (mechanism extracted from a notice) and one
// RULE claim (matched deterministically against a CRSA ref) on the same signal.
export type BoardClaim = {
  derivation: Derivation;
  text: string;
  evidenceRef: string;
};

export type BoardSignal = {
  id: string;
  title: BoardSignalTitle;
  mechanism: FailureMechanism;
  severity: "S1" | "S2" | "S3";
  status: "DETECTED_SIGNAL" | "ACCEPTED_EXCEPTION" | "CONFIRMED_ISSUE";
  domainId: RiskDomainV4["id"]; domainName: string;
  subCategory?: string;
  crsaRef?: CrsaControl["ref"];
  signalObserved: string;      // one clause
  soWhat: string;              // one sentence a CRO reads aloud to the board
  primaryMetric: { value: string | number; label: string };
  expected: string;            // rendered as a literal column
  observed: string;            // rendered as a literal column
  evidenceRefs: string[];      // MAY be empty — that is the finding
  missingEvidence: string[];   // MUST be non-empty when evidenceRefs is empty
  precedents: Precedent[];     // ordered strongest first, capped at 3 after dedupe
  primaryPrecedent: Precedent | null; // precedents[0] ?? null
  derivation: Derivation;
  confidence: { level: "high"|"medium"|"low"; basis: string };   // NEVER a bare number
  detectionVersion: string;    // "green-without-evidence@1.0.0"
  evaluatedAt: string;
  accountability: Accountability;
  alternativeExplanation: string;   // hand-authored per detector. NEVER generated.
  trigger: string;                  // the predicate, in readable form
  claims?: BoardClaim[];            // present only on split (LLM + RULE) signals
};

// ─── v8 risk model: appetite, controls, incidents, paths to green, horizon ───

/** Month key, for example "2026-11". */
export type Period = string;
export type RatingColour = "green" | "amber" | "red";
export type SmfRef = "SMF2" | "SMF4" | "SMF5" | "SMF16" | "SMF17" | "SMF24";
export type CommitteeName = "Board Risk Committee" | "Executive Risk Committee";

/** Risk appetite metric. `limit` is the amber threshold, `tolerance` the red one. */
export type RAM = {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  limit: number;
  tolerance: number;
  direction: "higherIsWorse" | "lowerIsWorse";
  zeroTolerance: boolean;
  /** First-line risk owner. */
  owner: string;
  /** Accountable SMF. Absent where the domain has no allocated SMF. */
  smf?: SmfRef;
};

export type RAMValue = { ramId: string; period: Period; value: number };

export type ControlResult = "effective" | "partially_effective" | "not_effective";

export type RatedControl = {
  id: string;
  name: string;
  categoryId: string;
  tier: "critical" | "secondary";
  testFrequency: "monthly" | "quarterly";
  owner: string;
  smf?: SmfRef;
};

export type ControlTest = {
  controlId: string;
  date: string;
  result: ControlResult;
  tester: string;
  /** null means the test has no evidence artefact this cycle. */
  evidenceId: string | null;
  reason: string;
};

export type Incident = {
  id: string;
  date: string;
  title: string;
  /** Client label, mapped to `level` by config severityLabels. */
  severity: string;
  level: 1 | 2 | 3;
  categoryId: string;
  impact: string;
  owner: string;
  status: "open" | "closed";
};

export type IncidentControlLink = {
  incidentId: string;
  controlId: string;
  controlWorked: "worked" | "failed" | "partial";
};

export type RatingDriver = { type: "ram" | "control" | "incident"; id: string; label: string };

export type RatingSnapshot = {
  /** Category id, or "firm". */
  entity: string;
  period: Period;
  colour: RatingColour;
  drivers: RatingDriver[];
};

/**
 * Governed path to green for one red or amber item. Named Record because
 * pathToGreen.ts already exports the older PathToGreen remediation plan shape.
 */
export type PathToGreenRecord = {
  id: string;
  targetType: "ram" | "control" | "incident";
  targetId: string;
  cause: string;
  actions: string[];
  owner: string;
  targetDate: string;
  horizon: "1m" | "3m" | "6m" | "12m";
  secondLineVerdict: "pending" | "accepted" | "challenged";
  secondLineReviewer: string | null;
  secondLineComment: string | null;
  committee: CommitteeName;
  committeeDecision: "pending" | "accepted" | "sent_back" | "bring_forward";
  decisionDate: string | null;
};

export type HorizonItem = {
  id: string;
  type: "regulatory" | "industry" | "emerging";
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  summary: string;
  relevance: "not_assessed" | "yes" | "no";
  categoryId: string;
  owner?: string;
};

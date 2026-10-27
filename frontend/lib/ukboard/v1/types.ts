/**
 * UK Board v1 — Board Risk View types (Stage 5 entities, trimmed to what the screens render).
 * Separate product: nothing here is shared with UK Banking Audit.
 */

/** Face statuses. `unverified` is its own structural state, never a RAG colour. */
export type Status = "within_appetite" | "amber" | "red" | "unverified" | "not_assessed";
export type Rag = "within_appetite" | "amber" | "red";

export type Viewer = "cro" | "brc_chair_preview";

/** Closed verb set (HF-8). Button labels derive from this union only. */
export type ActionVerb = "prepare" | "propose" | "draft" | "send_to_owner";

export type VisibilityScope = "all_board" | "cro_and_deciding_smf";

export type PrincipalRiskId =
  | "credit"
  | "liquidity"
  | "capital"
  | "fincrime"
  | "opsres"
  | "conduct"
  | "cyber"
  | "climate"
  | "regulatory";

export type ZoneId = "Z1" | "Z2" | "Z5";

/** In-variant routing (Stage 8 RT-1 to RT-8). Drills are addressed by the item's own ID. */
export type ViewState =
  | { screen: "board" }
  | { screen: "restrictions" }
  | { screen: "escalation" }
  | { screen: "risk"; principalRiskId: PrincipalRiskId; focusUnitId: string }
  | { screen: "drill"; kind: "clause"; restrictionId: string; focus: "population" | "attestation" }
  | { screen: "drill"; kind: "route"; eventId: string; routeId: string }
  | { screen: "drill"; kind: "manifest"; manifestId: string; itemId: string }
  | { screen: "drill"; kind: "kri"; unitId: string };

export type Layer1Screen = "board" | "restrictions" | "escalation";

export interface Origin {
  screen: Layer1Screen;
  highlightRef: string;
}

export interface Person {
  personId: string;
  name: string;
  role: string;
  roleShort: string;
}

export interface SpineRef {
  segment: string;
  label: string;
  ref?: string;
  missing?: boolean;
}

export interface Check {
  pass: boolean;
  /** Plain label for the dot (accessible name). */
  label: string;
  /** Evidence text shown when expanded. */
  evidence: string;
}

/** E-50: four checks in fixed order owner · feed · attestation · mapping. */
export interface IntegritySnapshot {
  owner: Check;
  feed: Check;
  attestation: Check;
  mapping: Check;
  asOf: string;
}

export interface Position {
  value: string;
  denominator: string;
  delta?: string;
}

export interface Unit {
  unitId: string;
  /** T2-n. Never rendered on a face (X-5). */
  cardId: string;
  principalRiskId: PrincipalRiskId;
  title: string;
  stateSentence: string;
  /** Status from the threshold position, before integrity. Integrity is applied by selectors. */
  rawStatus: Rag | "not_assessed";
  notAssessedReason?: string;
  integrity: IntegritySnapshot;
  position?: Position;
  ownerRole: string;
  ownerPersonId?: string;
  spine: SpineRef[];
  ruleLine: string;
  canTell?: string;
  cannotTell?: string;
  precedentIds: string[];
  draftIds: string[];
  /** V-11: set when fed by a bank system rather than the product's own registers. */
  integration?: { feed: string };
  visibility: VisibilityScope;
  newSinceLastBrc?: boolean;
}

export type DraftEffect =
  | "decision_proposed"
  | "send"
  | "caveat"
  | "ledger_draft"
  | "case_prepared"
  | "manifest_restore"
  | "promotion"
  | "chair_proposal";

export interface DraftOption {
  id: string;
  label: string;
}

/** E-51 DraftAction. */
export interface DraftAction {
  draftId: string;
  unitId: string;
  verb: ActionVerb;
  /** Plain title, e.g. "Propose: restore capacity". */
  title: string;
  /** AI one-line reason (rule 2). */
  reason: string;
  body: string;
  targetRole: string;
  /** Fixed option set (Stage 5 DraftAction.options[]); no default selected. */
  options?: DraftOption[];
  effect: DraftEffect;
  /** Who operates the gate. Chair-held gates are shown disabled in the CRO preview. */
  gateHolder: "cro" | "brc_chair";
  /** Face text after acceptance. */
  faceAfter: string;
  deepLink?: "smf16_workspace" | "smf17_workspace";
  /** Ledger group label when `effect` is "ledger_draft". */
  ledgerLabel?: string;
}

export type DraftStatus = "ai_draft" | "accepted" | "rejected" | "sent_to_owner";

export interface DraftState {
  status: DraftStatus;
  version: number;
  text: string;
  chosenOptionId?: string;
  byPersonId?: string;
  on?: string;
  rejectReason?: string;
}

/** E-53 AuditLogEntry (append-only). */
export interface AuditEntry {
  entryId: string;
  ts: string;
  actorName: string;
  actorRole: string;
  action: string;
  objectLabel: string;
  objectRef: string;
  version?: number;
  reasonCode?: string;
}

/* ── Strategy strip ─────────────────────────────────────────────────── */

export interface ObjectiveTile {
  objectiveId: string;
  objective: string;
  unitId: string;
  inlineState: string;
  floorRow?: string;
  statutoryLine?: string;
  tooltip: string[];
  drill: { principalRiskId: PrincipalRiskId; focusUnitId: string };
  actionDraftId?: string;
}

/* ── Scorecard ──────────────────────────────────────────────────────── */

export interface ScorecardRow {
  unitId: string;
  name: string;
  domainLabel: string;
  shownAbove?: ZoneId;
  marker?: string;
  /** Row 1 links to S3 rather than S2. */
  linkTo?: "restrictions";
}

/* ── Restrictions and reportability ─────────────────────────────────── */

export interface RouteBreakdown {
  route: string;
  accounts: number;
  lane: "product" | "migration" | "manual";
}

export interface Restriction {
  restrictionId: string;
  ref: string;
  name: string;
  clauseOwnerRole: string;
  clauseOwnerPersonId: string;
  inScope: number;
  tested: number;
  untested: { route: string; count: number }[];
  breachesAccounts: number;
  breachesCustomers: number;
  previouslyExited: number;
  byRoute: RouteBreakdown[];
  monthsSinceZero: number;
  runDate: string;
  previousRun: { runDate: string; tested: number; breachesAccounts: number };
  testDefinition: string;
  flagContrast: string;
  attestationDue: string;
  attestationDaysLeft: number;
  attestationPeriod: string;
  clauses: Clause[];
  priorAttestations: { period: string; signedOn: string; signerRole: string; status: string }[];
}

export interface Clause {
  clauseId: string;
  ref: string;
  text: string;
  verdict: "supported" | "partly" | "not_supported";
  runsPresent: number;
  monthsInPeriod: number;
  evidence: string;
}

export type RouteDecisionStatus = "undecided" | "not_assessed" | "decided" | "not_engaged";

export interface RouteDecision {
  decisionId: string;
  deciderPersonId: string;
  decidedOn: string;
  decision: string;
  rationale: string;
  dissent: string;
}

export interface ReportRoute {
  routeId: string;
  eventId: string;
  /** Plain name with reference in brackets, e.g. "FCA notification (SUP 15.3)". */
  name: string;
  clock: string;
  clockHours?: number;
  isSar?: boolean;
  status: RouteDecisionStatus;
  proposedDeciderRole: string;
  ruleText: string;
  options: string[];
  history: RouteDecision[];
  caseDraftId?: string;
}

export interface ReportableEvent {
  eventId: string;
  ref: string;
  title: string;
  loggedAwareness: string;
  dayN: number;
  facts: string[];
  keyedBy: string;
  awarenessGap?: {
    signals: { date: string; label: string; ref: string }[];
    gapDays: number;
    promptDraftId: string;
  };
}

/* ── Escalation health ──────────────────────────────────────────────── */

export interface PackItem {
  itemId: string;
  label: string;
  routingRule: string;
  /** Present in manifest version numbers. */
  inVersions: number[];
  removal?: { atForum: string; on: string; approver: string | null; reason: string | null };
}

export interface ManifestVersion {
  version: number;
  state: "draft" | "locked" | "circulated";
  createdOn: string;
  createdBy: string;
  itemIds: string[];
  note: string;
}

export interface KriTile {
  unitId: string;
  variant: "backlog" | "latency" | "effectiveness";
  title: string;
  primary: string;
  secondary: string;
  ruleLine: string;
  draftId: string;
}

export interface Precedent {
  id: string;
  respondent: string;
  regulator: string;
  /** DD Month YYYY, or null when the date is unresolved. */
  noticeDate: string | null;
  /** Posture tag shown on every precedent line. */
  posture: string;
  confidence: "verified" | "probable" | "unverified";
  hook: string;
  mechanism: string;
  /** Penalty text; null when it must not be shown (unresolved figures). */
  penalty: string | null;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

/**
 * UK Board v1 — Board Risk View seed data (single data module).
 *
 * PROVISIONAL: Stage 9A/9B mock data is pending. Figures fixed in Stages 5–7 are used as
 * written; every other figure is a provisional [illustrative] placeholder, listed in
 * TIEOUT.md. Swap this module for 9A/9B without component changes.
 *
 * Firm: Fernbridge Building Society — fictional. All people are fictional.
 */
import type {
  AuditEntry,
  Check,
  DraftAction,
  IntegritySnapshot,
  KriTile,
  ManifestVersion,
  ObjectiveTile,
  PackItem,
  Person,
  PrincipalRiskId,
  ReportableEvent,
  ReportRoute,
  Restriction,
  ScorecardRow,
  SeriesPoint,
  Unit,
} from "./types";

/* ── ST-1 config ────────────────────────────────────────────────────── */

export const FIRM = {
  name: "Fernbridge Building Society",
  firmType: "building_society" as const,
  totalAssets: "£22.4bn",
  demoToday: "27 October 2026",
  periodLabel: "Q3 2026 (as at 30 September 2026) vs Q2 2026",
  comparisonLabel: "vs Q2 2026",
  evidenceDate: "Evidence runs to 26 October 2026",
  lastErc: "14 October 2026",
  /** Stage 6 "mid-December 2026"; date provisional (7 weeks from demo day, T2-4). */
  nextBrc: "15 December 2026",
  headlineCap: 12,
  level1Count: 34,
};

/* ── People (all fictional) ─────────────────────────────────────────── */

export const PEOPLE: Record<string, Person> = {
  cro: { personId: "cro", name: "Eleanor Hartley", role: "Chief Risk Officer (SMF4)", roleShort: "CRO" },
  chair: { personId: "chair", name: "Graham Pryce", role: "BRC chair (SMF10)", roleShort: "BRC chair" },
  smf16: { personId: "smf16", name: "Helen Ward", role: "Head of Compliance (SMF16)", roleShort: "Head of Compliance" },
  smf17: { personId: "smf17", name: "Tom Ashby", role: "Head of Financial Crime (SMF17)", roleShort: "Head of Financial Crime" },
  cfo: { personId: "cfo", name: "Peter Haines", role: "Chief Financial Officer (SMF2)", roleShort: "CFO" },
  cco: { personId: "cco", name: "Ruth Calder", role: "Chief Credit Officer", roleShort: "Chief Credit Officer" },
  treasurer: { personId: "treasurer", name: "Imogen Shaw", role: "Treasurer", roleShort: "Treasurer" },
  feedOwner: { personId: "feedOwner", name: "Martin Lowe", role: "Head of Payments Operations (feed owner)", roleShort: "Feed owner" },
  coo: { personId: "coo", name: "Sarah Quinn", role: "Chief Operating Officer", roleShort: "COO" },
  cto: { personId: "cto", name: "Owen Price", role: "Chief Technology Officer", roleShort: "CTO" },
  cosec: { personId: "cosec", name: "Clare Dunmore", role: "Company Secretary", roleShort: "Company secretary" },
  conduct: { personId: "conduct", name: "Aisha Rahman", role: "Head of Customer Outcomes", roleShort: "Customer outcomes owner" },
  savingsOwner: { personId: "savingsOwner", name: "James Ferrier", role: "Savings product owner", roleShort: "Savings product owner" },
  ai: { personId: "ai", name: "AI drafting service", role: "AI · drafts only", roleShort: "AI" },
};

/* ── Principal risks (board-layer keys; "capital" is board-layer only, S5-OD-1) ── */

export const PRINCIPAL_RISKS: Record<PrincipalRiskId, { name: string; accountablePersonId: string }> = {
  credit: { name: "Credit risk", accountablePersonId: "cco" },
  liquidity: { name: "Liquidity and funding risk", accountablePersonId: "cfo" },
  capital: { name: "Capital", accountablePersonId: "cfo" },
  fincrime: { name: "Financial crime", accountablePersonId: "smf17" },
  opsres: { name: "Operational resilience", accountablePersonId: "coo" },
  conduct: { name: "Conduct and Consumer Duty", accountablePersonId: "smf16" },
  cyber: { name: "Cyber", accountablePersonId: "cto" },
  climate: { name: "Climate (PRA prudential, SS3/19)", accountablePersonId: "cro" },
  regulatory: { name: "Regulatory", accountablePersonId: "smf16" },
};

/* ── Integrity helpers ──────────────────────────────────────────────── */

const ok = (label: string, evidence: string): Check => ({ pass: true, label, evidence });
const fail = (label: string, evidence: string): Check => ({ pass: false, label, evidence });

function passing(owner: string, feed: string, attested: string, mapped = "Mapped to RAS statement and control"): IntegritySnapshot {
  return {
    owner: ok("Owner", owner),
    feed: ok("Feed reconciled", feed),
    attestation: ok("Attested", attested),
    mapping: ok("Mapped", mapped),
    asOf: "30 September 2026",
  };
}

/* ── ST-7 units ─────────────────────────────────────────────────────── */

export const UNITS: Record<string, Unit> = {
  "u-hltv": {
    unitId: "u-hltv",
    cardId: "T2-1",
    principalRiskId: "credit",
    title: "How much appetite are we using to grow, and can we defend it?",
    stateSentence:
      "88% of high-LTV appetite used: £96m headroom on a £4.0bn new-lending plan",
    rawStatus: "within_appetite",
    integrity: passing(
      "Chief Credit Officer; accountable SMF named",
      "Lending feed reconciled 100% · run 30 September 2026",
      "Attested by Chief Credit Officer against run 30 September 2026",
    ),
    position: { value: "17.6%", denominator: "of 20% appetite", delta: "+0.3 pts vs Q2 2026" },
    ownerRole: "Chief Credit Officer",
    ownerPersonId: "cco",
    spine: [
      { segment: "Strategic objective", label: "Owner-occupied mortgage growth" },
      { segment: "RAS statement", label: "High-LTV (over 90%) lending kept below 20% of new lending" },
      { segment: "Level 1 metric", label: "High-LTV share of new lending", ref: "CR-L1-03" },
      { segment: "Thresholds", label: "Capacity 24% · red 20% · amber 18.5% · operating limit 18%" },
      { segment: "Accountable owner", label: "Chief Credit Officer" },
    ],
    ruleLine:
      "High-LTV share 17.6% against appetite 20%. A straight-line projection over 6 quarters at plan volumes reaches amber in Q2 2027. Early warning, not a prediction.",
    precedentIds: [],
    draftIds: ["d-t21-appetite", "d-t21-para"],
    visibility: "all_board",
  },
  "u-capacity": {
    unitId: "u-capacity",
    cardId: "T2-5",
    principalRiskId: "fincrime",
    title: "Is growth outrunning financial crime control capacity?",
    stateSentence:
      "Members +31%, qualified handlers +9%. Queue age 19 days against amber 14, since August.",
    rawStatus: "amber",
    integrity: passing(
      "Head of Financial Crime",
      "HR capacity and case-management feeds reconciled · run 26 October 2026",
      "Attested by Head of Financial Crime against run 26 October 2026",
    ),
    position: { value: "19 days", denominator: "against amber 14", delta: "+7 days vs Q2 2026" },
    ownerRole: "Head of Financial Crime",
    ownerPersonId: "smf17",
    spine: [
      { segment: "Strategic objective", label: "Savings and digital member onboarding" },
      { segment: "RAS statement", label: "No growth beyond financial crime control capacity" },
      { segment: "Level 1 metric", label: "Alert queue median age", ref: "FC-L1-07" },
      { segment: "Control capacity", label: "Qualified financial crime handlers" },
      { segment: "Accountable owner", label: "Head of Financial Crime" },
    ],
    ruleLine:
      "Members grew 31% and qualified handlers 9%, so members per handler rose from 25,000 to 30,160. Queue median age has been above the 14-day amber since August.",
    canTell: "That growth and capacity diverged, and that no resourcing action, decision or escalation is recorded.",
    cannotTell: "Whether resourcing was discussed outside the decision register. Growth is not claimed as the cause.",
    precedentIds: ["uk-starling-2024", "uk-monzo-2025"],
    draftIds: ["d-t25-choice", "d-t25-paper", "d-pg4"],
    integration: { feed: "HR capacity and alert queue" },
    visibility: "all_board",
  },
  "u-tm": {
    unitId: "u-tm",
    cardId: "T2-14",
    principalRiskId: "fincrime",
    title: "Can I defend this figure?",
    stateSentence: "Unverified: transaction monitoring coverage.",
    rawStatus: "within_appetite",
    integrity: {
      owner: ok("Owner", "Feed owner and Head of Financial Crime named"),
      feed: fail("Feed reconciled", "Feed: 94.0% reconciled (2,256,000 of 2,400,000), run 26 October 2026"),
      attestation: fail(
        "Attestation precedes a completed run",
        "Attested 'no exceptions' for 3 months while completeness fell; the month 2 signature came 3 hours before the run finished",
      ),
      mapping: ok("Mapped", "Mapped to RAS statement and monitoring control"),
      asOf: "26 October 2026",
    },
    position: { value: "94.0%", denominator: "2,256,000 of 2,400,000 records reconciled", delta: "−3.1 pts vs previous run" },
    ownerRole: "Feed owner; Head of Financial Crime",
    ownerPersonId: "feedOwner",
    spine: [
      { segment: "Level 1 metric", label: "Transaction monitoring coverage", ref: "FC-L1-02" },
      { segment: "Control", label: "Transaction monitoring" },
      { segment: "Evidence / feed", label: "Payments to monitoring feed", ref: "TM-04" },
      { segment: "Accountable owner", label: "Head of Payments Operations" },
      { segment: "Attestation", label: "Monthly feed attestation" },
    ],
    ruleLine:
      "Only 94.0% of payment records reached transaction monitoring in the 26 October run, and same-day accounts none. A figure built on an incomplete feed cannot be shown as within appetite.",
    canTell: "That records were not monitored, by cohort and run.",
    cannotTell: "Whether suspicious activity was missed. Attestation commentary quality is not judged.",
    precedentIds: ["uk-metro-2024"],
    draftIds: ["d-t214-caveat", "d-t214-remed", "d-t217-challenge", "d-t214-triage", "d-t232-readacross"],
    integration: { feed: "transaction monitoring reconciliation" },
    visibility: "all_board",
  },
  "u-sanctions": {
    unitId: "u-sanctions",
    cardId: "T2-15",
    principalRiskId: "fincrime",
    title: "Does sanctions screening cover the whole list?",
    stateSentence: "Unverified: sanctions list rule coverage.",
    rawStatus: "within_appetite",
    integrity: {
      owner: ok("Owner", "Head of Financial Crime"),
      feed: fail(
        "Feed reconciled",
        "39 of 3,088 list entries covered; 0 alerts in 3 weeks against 42 expected a week",
      ),
      attestation: ok("Attested", "Attested by screening owner, 30 September 2026"),
      mapping: ok("Mapped", "Mapped to RAS statement and screening control"),
      asOf: "26 October 2026",
    },
    position: { value: "1.3%", denominator: "39 of 3,088 list entries covered by active rules", delta: "no change vs Q2 2026" },
    ownerRole: "Head of Financial Crime",
    ownerPersonId: "smf17",
    spine: [
      { segment: "Level 1 metric", label: "Sanctions list rule coverage", ref: "FC-L1-04" },
      { segment: "Control", label: "Individual sanctions screening" },
      { segment: "Evidence / feed", label: "Screening rule records against the Consolidated List", ref: "SC-02" },
      { segment: "Accountable owner", label: "Head of Financial Crime" },
    ],
    ruleLine:
      "39 active rule records against 3,088 list entries is 1.3% list rule coverage, and screening has produced 0 alerts for 3 weeks against an expected 42 a week.",
    canTell: "That the rule set covers 39 of 3,088 entries and that the control has gone quiet.",
    cannotTell: "Whether any sanctioned party transacted. Customer screening coverage is a different measure.",
    precedentIds: ["uk-starling-2024"],
    draftIds: ["d-t215-sanctions"],
    integration: { feed: "sanctions screening reconciliation" },
    visibility: "all_board",
  },
  "u-restriction": {
    unitId: "u-restriction",
    cardId: "T2-27",
    principalRiskId: "regulatory",
    title: "Is the restriction on new high-risk customers obeyed across the whole population?",
    stateSentence:
      "No: 112 accounts for 104 customers in breach, in 9,400 tested in the latest monthly run.",
    rawStatus: "red",
    integrity: {
      owner: ok("Owner", "Head of Financial Crime (clause owner)"),
      feed: ok("Feed reconciled", "Population test run 25 October 2026 (September population)"),
      attestation: ok("Attested", "Q3 2026 attestation pending, due 08 November 2026"),
      mapping: ok("Mapped", "4 of 4 clauses have an executable test; partner channel shown as untested"),
      asOf: "25 October 2026",
    },
    position: { value: "112 accounts", denominator: "in breach of 9,400 tested", delta: "+41 vs previous run" },
    ownerRole: "Head of Financial Crime",
    ownerPersonId: "smf17",
    spine: [
      { segment: "RAS statement", label: "No appetite for breaching regulatory restrictions" },
      { segment: "Policy obligation", label: "Restriction on new high-risk customers", ref: "VREQ R-03" },
      { segment: "Control", label: "Onboarding restriction flag, plus independent population test" },
      { segment: "Evidence", label: "Monthly population test run" },
      { segment: "Accountable owner", label: "Head of Financial Crime" },
      { segment: "Attestation", label: "Q3 2026 restriction attestation" },
      { segment: "Reportability", label: "Ledger event logged 26 October 2026" },
    ],
    ruleLine:
      "The test checked the whole in-scope population against the restriction and found 112 accounts in breach. Untested openings are shown as untested, not compliant.",
    canTell: "That breaches came through the savings pot, the group migration and a logged manual route.",
    cannotTell: "Workarounds recorded only in service notes. No adherence is claimed for the 24,000 untested openings.",
    precedentIds: ["uk-starling-2024", "uk-monzo-2025"],
    draftIds: ["d-t227-contain", "d-pg1-coverage"],
    integration: { feed: "account-opening population" },
    visibility: "all_board",
  },
  "u-lcr": {
    unitId: "u-lcr",
    cardId: "T2-4",
    principalRiskId: "liquidity",
    title: "What will cross amber before the next forum?",
    stateSentence: "LCR 162% against amber 150%; amber projected in about 9 weeks.",
    rawStatus: "within_appetite",
    integrity: passing("Treasurer; CFO accountable", "Treasury feed reconciled · run 30 September 2026", "Attested by Treasurer, 01 October 2026"),
    position: { value: "162%", denominator: "against amber 150% (12-month average)", delta: "−6 pts vs Q2 2026" },
    ownerRole: "Treasurer",
    ownerPersonId: "treasurer",
    spine: [
      { segment: "RAS statement", label: "Survive a severe liquidity stress without central bank support" },
      { segment: "Level 1 metric", label: "LCR (12-month average)", ref: "LQ-L1-01" },
      { segment: "Thresholds", label: "Red 130% · amber 150%" },
      { segment: "Accountable owner", label: "CFO; Treasurer" },
    ],
    ruleLine: "LCR reaches amber in about 9 weeks. The BRC is in 7 weeks and ALCO needs 6 weeks to act.",
    precedentIds: [],
    draftIds: ["d-t24-owner"],
    visibility: "all_board",
  },
  "u-wholesale": {
    unitId: "u-wholesale",
    cardId: "T2-8",
    principalRiskId: "liquidity",
    title: "How close are we to the building society funding limit?",
    stateSentence: "Wholesale funding 34% against an internal ceiling of 40%.",
    rawStatus: "within_appetite",
    integrity: passing("CFO", "Funding feed reconciled · run 30 September 2026", "Attested by Treasurer, 01 October 2026"),
    position: { value: "34%", denominator: "against internal ceiling 40% (statutory cap 50%)", delta: "+1 pt vs Q2 2026" },
    ownerRole: "CFO",
    ownerPersonId: "cfo",
    spine: [
      { segment: "Strategic objective", label: "Resilient funding base" },
      { segment: "RAS statement", label: "Wholesale funding well inside the statutory funding limit" },
      { segment: "Level 1 metric", label: "Wholesale funding share", ref: "LQ-L1-04" },
      { segment: "Accountable owner", label: "CFO" },
    ],
    ruleLine: "Wholesale funding 34% against an internal ceiling of 40%; the post-integration plan projects 39% in Q3 2027. Early warning, not a prediction.",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  "u-cet1": {
    unitId: "u-cet1",
    cardId: "K-7",
    principalRiskId: "capital",
    title: "Is capital inside its internal limit?",
    stateSentence: "CET1 16.8% against an internal limit of 13.5%.",
    rawStatus: "within_appetite",
    integrity: passing("CFO", "Capital feed reconciled · run 30 September 2026", "Attested by CFO, 02 October 2026"),
    position: { value: "16.8%", denominator: "against internal limit 13.5%", delta: "−0.2 pts vs Q2 2026" },
    ownerRole: "CFO",
    ownerPersonId: "cfo",
    spine: [
      { segment: "RAS statement", label: "Hold capital above the internal limit through a severe stress" },
      { segment: "Level 1 metric", label: "CET1 ratio", ref: "CA-L1-01" },
      { segment: "Accountable owner", label: "CFO" },
    ],
    ruleLine: "CET1 16.8% is 3.3 points above the 13.5% internal limit.",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  "u-ibs": {
    unitId: "u-ibs",
    cardId: "T2-9",
    principalRiskId: "opsres",
    title: "How much impact tolerance have important business services used?",
    stateSentence: "Worst service at 58% of its impact tolerance.",
    rawStatus: "within_appetite",
    integrity: passing("COO", "Incident feed reconciled · run 30 September 2026", "Attested by COO, 03 October 2026"),
    position: { value: "58%", denominator: "of impact tolerance (worst of 9 services)", delta: "+4 pts vs Q2 2026" },
    ownerRole: "COO",
    ownerPersonId: "coo",
    spine: [
      { segment: "RAS statement", label: "Stay within impact tolerance for every important business service" },
      { segment: "Level 1 metric", label: "Impact tolerance used", ref: "OR-L1-01" },
      { segment: "Accountable owner", label: "COO" },
    ],
    ruleLine: "The worst disruption this year used 58% of the online savings service's impact tolerance; the amber is 75% (firm practice).",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  "u-cd": {
    unitId: "u-cd",
    cardId: "T2-42",
    principalRiskId: "conduct",
    title: "Are Consumer Duty outcomes within tolerance?",
    stateSentence: "4 of 4 outcome measures within tolerance.",
    rawStatus: "within_appetite",
    integrity: passing("Head of Compliance; customer outcomes owner", "Outcomes feed reconciled · run 30 September 2026", "Attested by customer outcomes owner, 03 October 2026"),
    position: { value: "4 of 4", denominator: "outcome measures within tolerance", delta: "no change vs Q2 2026" },
    ownerRole: "Head of Compliance",
    ownerPersonId: "smf16",
    spine: [
      { segment: "RAS statement", label: "Deliver good outcomes for members (PRIN 2A)" },
      { segment: "Level 1 metric", label: "Consumer Duty outcomes within tolerance", ref: "CD-L1-01" },
      { segment: "Accountable owner", label: "Head of Compliance" },
    ],
    ruleLine:
      "All 4 outcome measures are inside tolerance. The Level 1 status reads the four outcome measures; Level 2 indicators are shown as contributors (firm practice).",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  "u-cyber": {
    unitId: "u-cyber",
    cardId: "K-cyber",
    principalRiskId: "cyber",
    title: "Are critical vulnerabilities closed on time?",
    stateSentence: "2 of 146 critical vulnerabilities past SLA.",
    rawStatus: "within_appetite",
    integrity: passing("CTO", "Vulnerability feed reconciled · run 30 September 2026", "Attested by CTO, 02 October 2026"),
    position: { value: "2 of 146", denominator: "critical vulnerabilities past SLA (appetite: no more than 5)", delta: "−1 vs Q2 2026" },
    ownerRole: "CTO",
    ownerPersonId: "cto",
    spine: [
      { segment: "RAS statement", label: "Critical vulnerabilities closed within SLA" },
      { segment: "Level 1 metric", label: "Critical vulnerabilities past SLA", ref: "CY-L1-02" },
      { segment: "Accountable owner", label: "CTO" },
    ],
    ruleLine: "2 critical vulnerabilities are past SLA against an appetite of no more than 5.",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  "u-climate": {
    unitId: "u-climate",
    cardId: "T2-11",
    principalRiskId: "climate",
    title: "How much new lending sits on low-EPC collateral?",
    stateSentence: "7.4% of new lending on EPC E–G collateral against appetite 10%.",
    rawStatus: "within_appetite",
    integrity: passing("CRO", "Collateral EPC feed reconciled · run 30 September 2026 (EPC known for 91% of new lending)", "Attested by Chief Credit Officer, 02 October 2026"),
    position: { value: "7.4%", denominator: "of new lending, against appetite 10%", delta: "+0.2 pts vs Q2 2026" },
    ownerRole: "CRO",
    ownerPersonId: "cro",
    spine: [
      { segment: "RAS statement", label: "Manage physical and transition risk in the mortgage book (SS3/19)" },
      { segment: "Level 1 metric", label: "Share of new lending on EPC E–G collateral", ref: "CL-L1-01" },
      { segment: "Accountable owner", label: "CRO" },
    ],
    ruleLine: "7.4% of new lending is on EPC E–G collateral against an appetite of 10%; EPC is known for 91% of new lending, which is the denominator caveat.",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  /* Strip units (not headline rows) */
  "u-tension": {
    unitId: "u-tension",
    cardId: "T2-6",
    principalRiskId: "fincrime",
    title: "Is the agreed onboarding trade-off inside its terms?",
    stateSentence: "Agreed onboarding trade-off outside its terms: 2 of 3 bounds exceeded · review 27 days overdue",
    rawStatus: "amber",
    integrity: passing(
      "Savings product owner (pair owner)",
      "Onboarding feed reconciled · run 26 October 2026",
      "Pair keyed by CRO office, 14 April 2026",
    ),
    position: { value: "2 of 3", denominator: "bounds exceeded", delta: "+1 vs Q2 2026" },
    ownerRole: "Savings product owner",
    ownerPersonId: "savingsOwner",
    spine: [
      { segment: "Strategic objective", label: "Savings and digital member onboarding" },
      { segment: "RAS statement", label: "Board-agreed onboarding trade-off" },
      { segment: "Level 1 pair", label: "Onboarding conversion against high-risk acceptance" },
      { segment: "Floor", label: "Pre-CDD transacting: regulatory floor, not a trade-off" },
    ],
    ruleLine: "Conversion is 6.2 points up against a +5 cap and high-risk acceptance is 1.1% against 0.8%. The pair's review date passed 27 days ago.",
    canTell: "That the pair is outside the bounds the board agreed, from the keyed register.",
    cannotTell: "Whether the trade-off was re-discussed outside the register. Bounds are only as good as the keying.",
    precedentIds: ["uk-monzo-2025"],
    draftIds: ["d-t26-redecide", "d-t26-floor"],
    visibility: "all_board",
  },
  "u-o4": {
    unitId: "u-o4",
    cardId: "O4",
    principalRiskId: "fincrime",
    title: "Member and society safety as we grow",
    stateSentence: "2 coverage figures unverified: see Defensibility and the scorecard",
    rawStatus: "within_appetite",
    integrity: {
      owner: ok("Owner", "Head of Financial Crime"),
      feed: fail("Feed reconciled", "2 feeds below reconciliation tolerance: transaction monitoring and sanctions screening"),
      attestation: fail("Attestation precedes a completed run", "Transaction monitoring attestation preceded a completed run"),
      mapping: ok("Mapped", "Mapped"),
      asOf: "26 October 2026",
    },
    ownerRole: "Head of Financial Crime",
    ownerPersonId: "smf17",
    spine: [{ segment: "Strategic objective", label: "Member and society safety as we grow" }],
    ruleLine: "Any failed integrity check sets the status to Unverified.",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  "u-o1": {
    unitId: "u-o1",
    cardId: "O1",
    principalRiskId: "credit",
    title: "Owner-occupied mortgage growth",
    stateSentence: "Position shown in the headline above",
    rawStatus: "within_appetite",
    integrity: passing("Chief Credit Officer", "Lending feed reconciled · run 30 September 2026", "Attested 30 September 2026"),
    ownerRole: "Chief Credit Officer",
    ownerPersonId: "cco",
    spine: [{ segment: "Strategic objective", label: "Owner-occupied mortgage growth" }],
    ruleLine: "Headroom £96m of £4.0bn plan; amber projected Q2 2027. Early warning, not a prediction.",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  "u-o3": {
    unitId: "u-o3",
    cardId: "O3",
    principalRiskId: "liquidity",
    title: "Resilient funding base",
    stateSentence: "Statutory cap 50% (building society)",
    rawStatus: "within_appetite",
    integrity: passing("CFO", "Funding feed reconciled · run 30 September 2026", "Attested 01 October 2026"),
    ownerRole: "CFO",
    ownerPersonId: "cfo",
    spine: [{ segment: "Strategic objective", label: "Resilient funding base" }],
    ruleLine: "Wholesale funding value is shown in the scorecard.",
    precedentIds: [],
    draftIds: [],
    visibility: "all_board",
  },
  "u-unmapped": {
    unitId: "u-unmapped",
    cardId: "T2-3",
    principalRiskId: "fincrime",
    title: "Which plan initiatives consume appetite with no RAS link?",
    stateSentence: "1 plan initiative has no appetite statement: business current account launch, Q1 2027",
    rawStatus: "not_assessed",
    notAssessedReason: "no appetite statement",
    integrity: {
      owner: ok("Owner", "Initiative sponsor: CFO"),
      feed: ok("Feed reconciled", "Plan register keyed"),
      attestation: ok("Attested", "n/a"),
      mapping: fail("Mapped", "No RAS line and no financial crime metric for the business current account launch"),
      asOf: "30 September 2026",
    },
    ownerRole: "CFO",
    ownerPersonId: "cfo",
    spine: [
      { segment: "Plan initiative", label: "Business current account launch (Q1 2027 plan: 18,000 accounts)" },
      { segment: "RAS statement", label: "None", missing: true },
      { segment: "Level 1 metric", label: "None", missing: true },
      { segment: "Accountable owner", label: "CFO (sponsor)" },
    ],
    ruleLine: "The plan initiative consumes appetite but maps to no RAS statement and no financial crime metric.",
    precedentIds: [],
    draftIds: ["d-t23-ras"],
    visibility: "all_board",
  },
  "u-horizon": {
    unitId: "u-horizon",
    cardId: "T2-13",
    principalRiskId: "fincrime",
    title: "Which emerging risks have no measure?",
    stateSentence: "7 emerging risks; 2 within 12 months; 1 (AI-enabled impersonation fraud) has no linked metric.",
    rawStatus: "not_assessed",
    notAssessedReason: "no linked metric",
    integrity: {
      owner: ok("Owner", "Head of Financial Crime (principal-risk owner)"),
      feed: ok("Feed reconciled", "Emerging risk register keyed"),
      attestation: ok("Attested", "n/a"),
      mapping: fail("Mapped", "AI-enabled impersonation fraud maps to financial crime but has no Level 1 metric"),
      asOf: "30 September 2026",
    },
    ownerRole: "Head of Financial Crime",
    ownerPersonId: "smf17",
    spine: [
      { segment: "Emerging risk", label: "AI-enabled impersonation fraud (within 12 months)" },
      { segment: "Principal risk", label: "Financial crime" },
      { segment: "Level 1 metric", label: "None", missing: true },
      { segment: "Accountable owner", label: "Head of Financial Crime" },
    ],
    ruleLine: "1 of the 2 emerging risks expected within 12 months has no linked metric.",
    cannotTell: "Emerging risks that are not in the register.",
    precedentIds: [],
    draftIds: ["d-t213-metric"],
    visibility: "all_board",
  },
  "u-nsfr": {
    unitId: "u-nsfr",
    cardId: "T2-12",
    principalRiskId: "liquidity",
    title: "Which Level 1 metric should join the board view?",
    stateSentence: "Proposed for the board view: NSFR",
    rawStatus: "within_appetite",
    integrity: passing("Treasurer", "Treasury feed reconciled · run 30 September 2026", "Attested by Treasurer, 01 October 2026"),
    position: { value: "117%", denominator: "against amber 115%", delta: "−8 pts vs Q2 2026" },
    ownerRole: "Treasurer",
    ownerPersonId: "treasurer",
    spine: [
      { segment: "Level 1 metric", label: "NSFR (not a headline)", ref: "LQ-L1-02" },
      { segment: "Accountable owner", label: "CFO; Treasurer" },
    ],
    ruleLine:
      "NSFR is not a headline but moved from 10 points to 2 points above amber in one quarter, which meets the promotion rule (firm practice).",
    precedentIds: [],
    draftIds: ["d-t212-promo"],
    visibility: "all_board",
  },
  /* S4 units */
  "u-vuln": {
    unitId: "u-vuln",
    cardId: "T2-34",
    principalRiskId: "conduct",
    title: "Is bad news reaching the BRC?",
    stateSentence:
      "1 item qualified for this BRC but was removed at ERC on 14 October 2026 with no reason recorded: vulnerable-customer exceptions, amber for 3 quarters.",
    rawStatus: "amber",
    integrity: passing(
      "Customer outcomes owner",
      "Contact-centre feed reconciled · run 30 September 2026",
      "Attested by customer outcomes owner, 03 October 2026",
      "Decision register and pack manifest keyed by CRO office",
    ),
    position: { value: "16.9", denominator: "per 10,000 contacts (amber 14, red 18)", delta: "+1.1 vs Q2 2026" },
    ownerRole: "BRC chair (decides)",
    ownerPersonId: "conduct",
    spine: [
      { segment: "Level 2 indicator", label: "Vulnerable-customer exceptions per 10,000 contacts", ref: "CD-L2-05" },
      { segment: "Thresholds", label: "Amber 14 · red 18" },
      { segment: "Escalation", label: "BRC routing rule: persistent amber (2 quarters, firm practice)" },
    ],
    ruleLine:
      "Amber for 3 consecutive quarters, past the firm's 2-quarter persistence rule (firm practice), with no linked action, decision or BRC escalation recorded. It also meets a BRC routing rule but is absent from the pack.",
    canTell: "That the item qualified, that it left the pack, and that no action, decision or escalation is recorded.",
    cannotTell: "Whether it was discussed. This proves nothing recorded, not that nothing was discussed.",
    precedentIds: [],
    draftIds: ["d-t234-options", "d-t235-restore", "d-pg5"],
    visibility: "all_board",
  },
  "u-kri-backlog": {
    unitId: "u-kri-backlog",
    cardId: "T2-36",
    principalRiskId: "fincrime",
    title: "Which known weaknesses are overdue and never reached the BRC?",
    stateSentence:
      "CDD refresh finding extended 3 times over 19 months; never in a BRC pack; projected to clear in 31 months against a committed 12.",
    rawStatus: "red",
    integrity: passing("Head of Financial Crime; Head of Internal Audit", "Findings register keyed", "Attested 30 September 2026"),
    position: { value: "31 months", denominator: "to clear against 12 committed", delta: "+4 months vs Q2 2026" },
    ownerRole: "Finding owner; Head of Internal Audit",
    ownerPersonId: "smf17",
    spine: [
      { segment: "Finding", label: "High-rated finding: CDD refresh", ref: "IA-2025-014" },
      { segment: "Escalation", label: "Never in a BRC pack" },
    ],
    ruleLine: "At the current clearance rate the backlog clears in 31 months against the committed 12.",
    precedentIds: [],
    draftIds: ["d-t236-agenda"],
    visibility: "all_board",
  },
  "u-kri-latency": {
    unitId: "u-kri-latency",
    cardId: "T2-37",
    principalRiskId: "regulatory",
    title: "How long does bad news take to reach us?",
    stateSentence:
      "Median 4.6 months from first logged high severity to the BRC (n = 23); 3 material items unescalated after 12 months.",
    rawStatus: "amber",
    integrity: passing("BRC chair", "Issue log 96% complete", "n/a"),
    position: { value: "4.6 months", denominator: "median, n = 23 high-severity issues", delta: "+0.8 months vs Q2 2026" },
    ownerRole: "BRC chair",
    ownerPersonId: "chair",
    spine: [{ segment: "Escalation", label: "Issue log to BRC agenda" }],
    ruleLine: "Measured from the first logged high severity, so it may understate the true time.",
    precedentIds: [],
    draftIds: ["d-t237-review"],
    visibility: "all_board",
  },
  "u-kri-effect": {
    unitId: "u-kri-effect",
    cardId: "T2-38",
    principalRiskId: "fincrime",
    title: "Which closed actions have not moved their metric?",
    stateSentence:
      "42 CDD remediation actions closed this quarter; overdue CDD reviews still 26,900 against a target of 10,000; 2 issues downgraded with no metric movement.",
    rawStatus: "red",
    integrity: passing("Head of Financial Crime; Head of Internal Audit", "Action log keyed; 88% of actions linked to a metric", "Attested 30 September 2026"),
    position: { value: "26,900", denominator: "overdue CDD reviews against a 10,000 target", delta: "−400 vs Q2 2026" },
    ownerRole: "Owner; Head of Internal Audit",
    ownerPersonId: "smf17",
    spine: [
      { segment: "Action", label: "42 CDD remediation actions closed" },
      { segment: "Level 2 metric", label: "Overdue CDD reviews", ref: "FC-L2-11" },
    ],
    ruleLine: "The linked metric is still outside its band after the declared recovery time.",
    precedentIds: [],
    draftIds: ["d-t238-reopen"],
    visibility: "all_board",
  },
};

/* ── S1 strategy strip ──────────────────────────────────────────────── */

export const OBJECTIVES: ObjectiveTile[] = [
  {
    objectiveId: "O1",
    objective: "Owner-occupied mortgage growth",
    unitId: "u-o1",
    inlineState: "Position shown in the headline above",
    tooltip: [
      "Headroom £96m of £4.0bn plan",
      "Amber projected Q2 2027 · early warning, not a prediction",
      "First-time-buyer appetite 31% used for 3 quarters; plan at 72% (£1.44bn of £2.0bn)",
    ],
    drill: { principalRiskId: "credit", focusUnitId: "u-hltv" },
  },
  {
    objectiveId: "O2",
    objective: "Savings and digital member onboarding",
    unitId: "u-tension",
    inlineState: "Agreed onboarding trade-off outside its terms: 2 of 3 bounds exceeded · review 27 days overdue",
    floorRow: "Pre-CDD transacting: regulatory floor, not a trade-off → breach path",
    tooltip: ["Financial crime capacity is the binding item (see Growth against capacity)"],
    drill: { principalRiskId: "fincrime", focusUnitId: "u-tension" },
  },
  {
    objectiveId: "O3",
    objective: "Resilient funding base",
    unitId: "u-o3",
    inlineState: "Within the internal funding ceiling",
    statutoryLine: "Statutory cap 50% (building society)",
    tooltip: ["Wholesale funding 34% against an internal ceiling of 40%", "Projected 39% in Q3 2027 · early warning, not a prediction"],
    drill: { principalRiskId: "liquidity", focusUnitId: "u-wholesale" },
  },
  {
    objectiveId: "O4",
    objective: "Member and society safety as we grow",
    unitId: "u-o4",
    inlineState: "2 coverage figures unverified: see Defensibility and the scorecard",
    tooltip: ["Feed: transaction monitoring 94.0% reconciled; sanctions list rule coverage 1.3%"],
    drill: { principalRiskId: "fincrime", focusUnitId: "u-tm" },
  },
];

/* ── S1 RAS scorecard (12 headlines; seed order = spec order) ───────── */

export const SCORECARD: ScorecardRow[] = [
  { unitId: "u-restriction", name: "Restriction on new high-risk customers: population test", domainLabel: "Regulatory", linkTo: "restrictions" },
  { unitId: "u-tm", name: "Transaction monitoring coverage", domainLabel: "Financial crime", shownAbove: "Z5" },
  { unitId: "u-sanctions", name: "Sanctions list rule coverage", domainLabel: "Financial crime" },
  { unitId: "u-capacity", name: "Alert queue median age", domainLabel: "Financial crime", shownAbove: "Z2" },
  { unitId: "u-lcr", name: "LCR (12-month average)", domainLabel: "Liquidity", marker: "Amber in about 9 weeks · BRC in 7 weeks · ALCO needs 6 weeks" },
  { unitId: "u-hltv", name: "High-LTV share of new lending", domainLabel: "Credit", shownAbove: "Z1", marker: "Amber projected Q2 2027" },
  { unitId: "u-wholesale", name: "Wholesale funding share", domainLabel: "Liquidity (statutory)" },
  { unitId: "u-cet1", name: "CET1 against internal limit", domainLabel: "Capital" },
  { unitId: "u-ibs", name: "Important business services: impact tolerance used", domainLabel: "Operational resilience" },
  { unitId: "u-cd", name: "Consumer Duty outcomes within tolerance", domainLabel: "Conduct" },
  { unitId: "u-cyber", name: "Critical vulnerabilities past SLA", domainLabel: "Cyber" },
  { unitId: "u-climate", name: "Share of new lending on EPC E–G collateral", domainLabel: "Climate (PRA, SS3/19)" },
];

/** Rotation-out candidate when NSFR is promoted, keeping the cap at 12 (S6-OD-3; provisional). */
export const PROMOTION = {
  unitId: "u-nsfr",
  rotateOutUnitId: "u-cyber",
  rotateOutNote: "Critical vulnerabilities past SLA would move to the cyber drill",
};

/* ── Thresholds, series and projections (S2 section a) ──────────────── */

export interface ThresholdSet {
  unit: string;
  capacity?: number;
  red: number;
  amber: number;
  operatingLimit?: number;
  higherIsWorse: boolean;
  rationale: string;
  calibration: string;
}

export const THRESHOLDS: Record<string, ThresholdSet> = {
  "u-hltv": {
    unit: "%",
    capacity: 24,
    red: 20,
    amber: 18.5,
    operatingLimit: 18,
    higherIsWorse: true,
    rationale:
      "Amber set 1.5 points inside appetite: the lead time to slow high-LTV approvals is about 2 quarters and the series moves about 0.3 points a quarter.",
    calibration: "Calibration version 3, approved by the BRC on 11 March 2026",
  },
  "u-lcr": {
    unit: "%",
    red: 130,
    amber: 150,
    higherIsWorse: false,
    rationale: "Amber set 20 points above red to give ALCO its 6-week lead time at the observed run-off rate.",
    calibration: "Calibration version 2, approved by ALCO on 09 January 2026",
  },
  "u-capacity": {
    unit: "days",
    red: 21,
    amber: 14,
    higherIsWorse: true,
    rationale: "Amber at 14 days follows the firm's alert SLA; red at 21 days is where SAR timeliness is exposed.",
    calibration: "Calibration version 1, approved by the ERC on 12 February 2026",
  },
  "u-wholesale": {
    unit: "%",
    capacity: 50,
    red: 40,
    amber: 37,
    higherIsWorse: true,
    rationale: "Internal ceiling 40% sits 10 points inside the statutory cap of 50%.",
    calibration: "Calibration version 2, approved by the board on 11 March 2026",
  },
  "u-cet1": {
    unit: "%",
    red: 13.5,
    amber: 14.5,
    higherIsWorse: false,
    rationale: "Internal limit 13.5% is the ICAAP stressed low point plus a management buffer.",
    calibration: "ICAAP 2026, approved by the board on 22 April 2026",
  },
  "u-nsfr": {
    unit: "%",
    red: 105,
    amber: 115,
    higherIsWorse: false,
    rationale: "Amber 15 points above the 100% minimum plus buffer.",
    calibration: "Calibration version 2, approved by ALCO on 09 January 2026",
  },
};

export const SERIES: Record<string, SeriesPoint[]> = {
  "u-hltv": [
    { label: "Q2 2025", value: 16.1 },
    { label: "Q3 2025", value: 16.4 },
    { label: "Q4 2025", value: 16.7 },
    { label: "Q1 2026", value: 17.0 },
    { label: "Q2 2026", value: 17.3 },
    { label: "Q3 2026", value: 17.6 },
  ],
  "u-lcr": [
    { label: "Q2 2025", value: 181 },
    { label: "Q3 2025", value: 178 },
    { label: "Q4 2025", value: 174 },
    { label: "Q1 2026", value: 171 },
    { label: "Q2 2026", value: 168 },
    { label: "Q3 2026", value: 162 },
  ],
  "u-vuln": [
    { label: "Q4 2025", value: 13.9 },
    { label: "Q1 2026", value: 14.2 },
    { label: "Q2 2026", value: 15.8 },
    { label: "Q3 2026", value: 16.9 },
  ],
};

/** Binding-constraint ladder (K-4) at plan volumes; provisional beyond the high-LTV line. */
export const CONSTRAINT_LADDER = [
  { name: "High-LTV appetite", projectedBind: "Amber Q2 2027 · binds first" },
  { name: "NSFR", projectedBind: "2 points above amber; depends on the funding mix" },
  { name: "LCR", projectedBind: "Amber in about 9 weeks on current run-off (see liquidity)" },
  { name: "CET1 internal limit", projectedBind: "Not reached within the 3-year plan" },
  { name: "Leverage", projectedBind: "Not reached within the 3-year plan" },
];

export const PLAN_VERSIONS = [
  "Corporate plan 2026–2028, version 4 (stamped 18 September 2026) — used for the projection",
  "Corporate plan 2026–2028, version 3 (stamped 12 March 2026)",
];

export const WAIVER = {
  title: "Temporary high-LTV limit",
  text: "Temporary 25% limit from 06 April 2026 for 6 months; expired 06 October 2026. The register still reads 25%, 3 weeks after expiry: register not yet updated.",
  keyedBy: "Company secretary",
  decisionRef: "BRC-2026-03",
};

/* ── DG-2 capacity series ───────────────────────────────────────────── */

export const CAPACITY = {
  quarters: ["Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026"],
  membersM: [1.45, 1.52, 1.6, 1.7, 1.79, 1.9],
  handlers: [58, 58, 59, 60, 62, 63],
  queueAge: [
    { label: "April", value: 9 },
    { label: "May", value: 10 },
    { label: "June", value: 12 },
    { label: "July", value: 13 },
    { label: "August", value: 16 },
    { label: "September", value: 19 },
  ],
  queueAmber: 14,
  membersPerHandler: { from: 25000, to: 30160 },
  slaCleared: { value: "81%", denominator: "31,600 of 39,000 alerts due in September", delta: "−7 pts vs Q2 2026" },
  campaignDate: "08 December 2026",
  campaignWeeks: 6,
  decisionSearch: "Resourcing action or decision recorded in the window: none",
};

/* ── DG-3 lineage (T2-14 / T2-17) ───────────────────────────────────── */

export const TM_RUNS = [
  { runId: "RUN-TM04-0826", runDate: "26 August 2026", completed: "26 August 2026 23:40", source: 2210000, reconciled: 2207790, pct: "99.9%" },
  { runId: "RUN-TM04-0926", runDate: "26 September 2026", completed: "27 September 2026 00:10", source: 2310000, reconciled: 2243010, pct: "97.1%" },
  { runId: "RUN-TM04-1026", runDate: "26 October 2026", completed: "26 October 2026 23:55", source: 2400000, reconciled: 2256000, pct: "94.0%" },
];

/** TC-3: cohorts sum exactly to the 26 October run. */
export const TM_COHORTS = [
  { cohort: "Same-day accounts", records: 143323, reconciled: 0, pct: "0%" },
  { cohort: "All other cohorts", records: 2256677, reconciled: 2256000, pct: "99.97%" },
];

export const TM_ATTESTATIONS = [
  { cycle: "August 2026", signed: "27 August 2026 09:10", runCompleted: "26 August 2026 23:40", statement: "Reconciled, no exceptions", gap: "Signed after the run; run below tolerance" },
  { cycle: "September 2026", signed: "26 September 2026 21:10", runCompleted: "27 September 2026 00:10", statement: "Reconciled, no exceptions", gap: "Signed 3 hours before the run finished" },
  { cycle: "October 2026", signed: "27 October 2026 08:30", runCompleted: "26 October 2026 23:55", statement: "Reconciled, no exceptions", gap: "Signed after the run; run below tolerance" },
];

export const TM_RULED_OUT = [
  "Cut-off rule applied: ruled out",
  "Grace window applied: ruled out",
  "Timing lag: ruled out (the same-day cohort is absent in all 3 runs)",
  "Value restatement: ruled out",
];

export const TM_READ_ACROSS = {
  line: "3 feeds share the batch design",
  feeds: ["Faster Payments to monitoring", "Card payments to monitoring", "Standing orders to monitoring"],
};

export const TM_TOLERANCE = "Reconciliation tolerance 99.95% (firm practice)";

/* ── T2-15 screening denominator, T2-23 assurance verdict ───────────── */

export const SCREENING = {
  list: "UK Consolidated List (OFSI)",
  listEntries: 3088,
  ruleRecords: 39,
  coverage: "1.3%",
  alertsLast3Weeks: 0,
  expectedPerWeek: 42,
  asAt: "26 October 2026",
  customerScreeningCoverage: "92% of members screened (customer screening coverage, a different measure)",
};

export const ASSURANCE_VERDICTS = [
  { control: "Same-day account monitoring", rating: "Effective (RCSA, Q2 2026)", latestTest: "Failed, 02 October 2026", verdict: "Rated effective after a failed test" },
  { control: "Sanctions screening rule set", rating: "Effective (RCSA, Q2 2026)", latestTest: "Not tested in 14 months", verdict: "Rating not supported by a current test" },
  { control: "Onboarding restriction flag", rating: "Effective (RCSA, Q2 2026)", latestTest: "Passed, 15 September 2026", verdict: "Rating matches the latest test" },
];

/* ── DG-4 tension pair (T2-6) ───────────────────────────────────────── */

export const TENSION_PAIR = {
  pair: "Savings onboarding: conversion against high-risk acceptance",
  bounds: [
    { bound: "Onboarding conversion uplift", agreed: "+5 points cap", actual: "+6.2 points", exceeded: true },
    { bound: "High-risk acceptance rate", agreed: "0.8% maximum", actual: "1.1%", exceeded: true },
    { bound: "Onboarding fraud losses", agreed: "1.5 bp maximum", actual: "0.9 bp", exceeded: false },
  ],
  floor: "Pre-CDD transacting: regulatory floor, not a trade-off",
  reviewDue: "30 September 2026 (27 days overdue)",
  keyedBy: "CRO office",
  keyedOn: "14 April 2026",
  sourceDecisionRef: "BRC-2026-02",
};

/* ── Indicators / contributors per principal risk (S2 section c) ────── */

export const CONTRIBUTORS: Partial<Record<PrincipalRiskId, { name: string; status: "within_appetite" | "amber" | "red"; value: string }[]>> = {
  credit: [
    { name: "High-LTV approvals pipeline (leading)", status: "amber", value: "19.4% of applications in pipeline" },
    { name: "3m+ arrears", status: "within_appetite", value: "0.42% of accounts (6,100 of 1,452,000)" },
    { name: "Interest-only maturities next 12 months", status: "within_appetite", value: "2,800 of 61,000 interest-only accounts" },
  ],
  fincrime: [
    { name: "Alert queue median age", status: "amber", value: "19 days against amber 14" },
    { name: "Overdue CDD reviews", status: "red", value: "26,900 against a 10,000 target" },
    { name: "Alerts cleared within SLA", status: "amber", value: "81% (31,600 of 39,000)" },
    { name: "Enhanced due diligence reviews within target", status: "within_appetite", value: "92% (1,380 of 1,500)" },
  ],
  liquidity: [
    { name: "Retail deposit outflows (leading)", status: "amber", value: "1.8% a month against 1.5% band" },
    { name: "NSFR", status: "within_appetite", value: "117% against amber 115%" },
  ],
  conduct: [
    { name: "Vulnerable-customer exceptions per 10,000 contacts", status: "amber", value: "16.9 (amber 14, red 18)" },
    { name: "Complaints upheld at FOS", status: "within_appetite", value: "31% (118 of 381)" },
  ],
  opsres: [{ name: "Online savings service: worst disruption", status: "within_appetite", value: "58% of impact tolerance" }],
  capital: [{ name: "Leverage ratio", status: "within_appetite", value: "5.9% against internal limit 4.25%" }],
  cyber: [{ name: "Phishing simulation click rate", status: "within_appetite", value: "3.1% (310 of 10,000 staff tests)" }],
  climate: [{ name: "High flood-risk share of new lending", status: "within_appetite", value: "2.1% of new lending" }],
  regulatory: [
    { name: "Board objects with no accountable SMF", status: "amber", value: "3 of 214 (including clause R-05.2 of the s166 remediation)" },
    { name: "Restriction clauses with an executable test", status: "amber", value: "14 of 15 mapped" },
    { name: "Zero-tolerance statements with a proxy", status: "amber", value: "5 of 7 (reputational harm and market abuse do not)" },
  ],
};

/** S2 section f domain detail lines, by principal risk; Fraud-filtered lines carry `fraud: true`. */
export const DOMAIN_DETAIL: Partial<Record<PrincipalRiskId, { label: string; text: string; fraud?: boolean }[]>> = {
  fincrime: [
    { label: "Receiving-side APP fraud exposure", text: "Inbound APP scam receipts 3.4 per 10,000 accounts against amber 4.0 (own series, Q3 2026)", fraud: true },
    { label: "Onboarding fraud losses", text: "0.9 bp of balances against 1.5 bp bound", fraud: true },
    { label: "AI and ML models in model risk appetite", text: "2 of 9 financial crime models past validation date (SS1/23)" },
    { label: "Cohort activity up, alerts down", text: "1 cohort flagged; detail stays in the Head of Financial Crime's restricted view (count only)" },
  ],
  opsres: [{ label: "Impact tolerance headroom", text: "9 important business services mapped; dependency map 94% complete (denominator)" }],
  climate: [{ label: "Collateral and pathway", text: "EPC known for 91% of new lending; pathway target on track for 2030 (SS3/19, CBES)" }],
  conduct: [{ label: "Consumer Duty outcomes", text: "4 of 4 outcomes within tolerance; 5 of 5 evidence elements present; cohort minimum enforced" }],
  liquidity: [{ label: "Pre-circulation consistency", text: "LCR value matches across the ALCO and BRC manifests" }],
};

/* ── S1 horizon line (T2-13, T2-31, T2-26) ──────────────────────────── */

export const HORIZON = {
  emergingRisks: 7,
  withinTwelveMonths: 2,
  unmapped: "AI-enabled impersonation fraud",
  incidentRulesDate: "18 March 2027",
  daysToIncidentRules: 142,
  trialClassified: { classified: 9, total: 31 },
  disclosureHold: 1,
};

/* ── S3 restriction (T2-27 / T2-28), TC-5 resolved ──────────────────── */

export const RESTRICTION: Restriction = {
  restrictionId: "r-03",
  ref: "VREQ R-03",
  name: "Restriction on new high-risk customers",
  clauseOwnerRole: "Head of Financial Crime",
  clauseOwnerPersonId: "smf17",
  inScope: 33400,
  tested: 9400,
  untested: [{ route: "Partner-channel openings", count: 24000 }],
  breachesAccounts: 112,
  breachesCustomers: 104,
  previouslyExited: 3,
  byRoute: [
    { route: "New savings pot (outside the flag's scope)", accounts: 97, lane: "product" },
    { route: "Group migration of 01 August 2026", accounts: 9, lane: "migration" },
    { route: "Manual override at branch", accounts: 6, lane: "manual" },
  ],
  monthsSinceZero: 4,
  runDate: "25 October 2026 (September population)",
  previousRun: { runDate: "24 September 2026 (August population)", tested: 9050, breachesAccounts: 71 },
  testDefinition:
    "Any account opened in the month for a customer rated high-risk at the event date, on any product, channel, migration or manual route. Unit: account openings.",
  flagContrast: "Flag dashboard, same month: fired 1,208 times, 100% blocked. A flag firing is not evidence of adherence.",
  attestationDue: "08 November 2026",
  attestationDaysLeft: 12,
  attestationPeriod: "Q3 2026 (01 July to 30 September 2026)",
  clauses: [
    {
      clauseId: "r-03-1",
      ref: "R-03.1",
      text: "No new accounts or products for customers rated high-risk",
      verdict: "not_supported",
      runsPresent: 3,
      monthsInPeriod: 3,
      evidence: "Breaches found in July (38), August (71) and September (112); 24,000 partner-channel openings untested",
    },
    {
      clauseId: "r-03-2",
      ref: "R-03.2",
      text: "Restriction flag in place on every onboarding system named in the requirement",
      verdict: "supported",
      runsPresent: 3,
      monthsInPeriod: 3,
      evidence: "Flag active on 3 of 3 named systems; the savings pot is a new route not named in the requirement",
    },
    {
      clauseId: "r-03-3",
      ref: "R-03.3",
      text: "Independent population test run and retained each month",
      verdict: "supported",
      runsPresent: 3,
      monthsInPeriod: 3,
      evidence: "Test runs present for July, August and September",
    },
    {
      clauseId: "r-03-4",
      ref: "R-03.4",
      text: "Quarterly attestation by the accountable SMF",
      verdict: "supported",
      runsPresent: 3,
      monthsInPeriod: 3,
      evidence: "Q1 and Q2 2026 attestations signed on time",
    },
  ],
  priorAttestations: [
    { period: "Q2 2026", signedOn: "06 August 2026", signerRole: "Head of Financial Crime", status: "Signed; breaches from June not disclosed" },
    { period: "Q1 2026", signedOn: "07 May 2026", signerRole: "Head of Financial Crime", status: "Signed; zero breaches in the period" },
  ],
};

export const PROCESS_GAP_PG1 = {
  gapType: "Product-launch control gap",
  text: "97 of 112 breaching accounts opened via the new savings pot, a route outside the restriction flag's scope; 24,000 partner-channel openings untested.",
  receivingOwner: "Savings product owner and CTO; Head of Financial Crime for containment",
  draftId: "d-pg1-coverage",
};

/* ── S3 reportability ledger (TC-6, TC-7) ───────────────────────────── */

export const EVENTS: ReportableEvent[] = [
  {
    eventId: "e-r03",
    ref: "E-2026-121",
    title: "Restriction on new high-risk customers breached",
    loggedAwareness: "26 October 2026",
    dayN: 1,
    facts: [
      "112 accounts for 104 customers in breach, in 9,400 tested (run 25 October 2026)",
      "97 via the savings pot; 9 via the group migration; 6 via a manual override",
      "24,000 partner-channel openings untested",
      "Customer records stay in the Head of Financial Crime's restricted view",
    ],
    keyedBy: "CRO office, 26 October 2026",
  },
  {
    eventId: "e-117",
    ref: "E-2026-117",
    title: "Mortgage reversion-rate error affecting 2,300 customers",
    loggedAwareness: "14 October 2026",
    dayN: 13,
    facts: [
      "A data error moved 2,300 fixed-rate mortgage customers to the reversion rate without notice",
      "A disciplinary outcome has been logged",
    ],
    keyedBy: "CRO office, 14 October 2026",
    awarenessGap: {
      signals: [
        { date: "21 August 2026", label: "Linked issue 'duplicate collections' raised (Level 2)", ref: "I-8812" },
        { date: "02 September 2026", label: "Control test failed", ref: "DD-03" },
        { date: "14 October 2026", label: "Logged awareness date", ref: "E-2026-117" },
      ],
      gapDays: 54,
      promptDraftId: "d-t230-prompt",
    },
  },
];

const OPTIONS_STANDARD = [
  "Reportable: the firm makes the notification",
  "Not reportable: record rationale and a re-evaluation date",
  "More facts needed: set a decision date",
];

export const ROUTES: ReportRoute[] = [
  {
    routeId: "rt-r03-sup153",
    eventId: "e-r03",
    name: "FCA notification (SUP 15.3)",
    clock: "Immediately",
    clockHours: 24,
    status: "undecided",
    proposedDeciderRole: "Head of Compliance",
    ruleText: "SUP 15.3: notify the FCA immediately of matters that could have a significant adverse effect (text in force on 26 October 2026).",
    options: OPTIONS_STANDARD,
    history: [],
    caseDraftId: "d-case-r03-sup153",
  },
  {
    routeId: "rt-r03-fr7",
    eventId: "e-r03",
    name: "PRA notification (Fundamental Rule 7)",
    clock: "Immediately",
    clockHours: 24,
    status: "undecided",
    proposedDeciderRole: "Head of Compliance",
    ruleText: "PRA Fundamental Rule 7: deal with regulators openly and disclose anything of which the PRA would reasonably expect notice.",
    options: OPTIONS_STANDARD,
    history: [],
    caseDraftId: "d-case-r03-fr7",
  },
  {
    routeId: "rt-r03-sar",
    eventId: "e-r03",
    name: "Suspicious activity report question",
    clock: "As soon as practicable",
    isSar: true,
    status: "undecided",
    proposedDeciderRole: "Head of Financial Crime",
    ruleText: "SAR question open. Content stays with the Head of Financial Crime.",
    options: [],
    history: [],
  },
  {
    routeId: "rt-117-sup153",
    eventId: "e-117",
    name: "FCA notification (SUP 15.3)",
    clock: "Immediately",
    clockHours: 24,
    status: "decided",
    proposedDeciderRole: "Head of Compliance",
    ruleText: "SUP 15.3: notify the FCA immediately of matters that could have a significant adverse effect.",
    options: OPTIONS_STANDARD,
    history: [
      {
        decisionId: "rd-117-1",
        deciderPersonId: "smf16",
        decidedOn: "23 October 2026",
        decision: "Reportable: the firm makes the notification",
        rationale: "2,300 customers moved to the reversion rate without notice is a matter the FCA would reasonably expect notice of.",
        dissent: "None",
      },
    ],
  },
  {
    routeId: "rt-117-fr7",
    eventId: "e-117",
    name: "PRA notification (Fundamental Rule 7)",
    clock: "Immediately",
    clockHours: 24,
    status: "not_assessed",
    proposedDeciderRole: "Head of Compliance",
    ruleText: "PRA Fundamental Rule 7 applies because the society is dual-regulated.",
    options: OPTIONS_STANDARD,
    history: [],
    caseDraftId: "d-case-117-fr7",
  },
  {
    routeId: "rt-117-sup1511",
    eventId: "e-117",
    name: "Conduct rule breach notification (SUP 15.11)",
    clock: "Within the reporting period",
    status: "not_assessed",
    proposedDeciderRole: "Head of Compliance",
    ruleText: "SUP 15.11: notify conduct rule breaches that led to disciplinary action; a disciplinary outcome is logged.",
    options: OPTIONS_STANDARD,
    history: [],
    caseDraftId: "d-case-117-sup1511",
  },
  {
    routeId: "rt-117-sar",
    eventId: "e-117",
    name: "Suspicious activity report question",
    clock: "As soon as practicable",
    isSar: true,
    status: "not_engaged",
    proposedDeciderRole: "Head of Financial Crime",
    ruleText: "SAR question closed: not engaged.",
    options: [],
    history: [],
  },
];

/* ── S4 escalation health (TC-10: the persistent amber is the removed item) ── */

export const PACK_ITEMS: PackItem[] = [
  {
    itemId: "pi-vuln",
    label: "Vulnerable-customer exceptions: amber for 3 quarters",
    routingRule: "Persistent amber: 2 quarters at Level 2 (firm practice)",
    inVersions: [1],
    removal: { atForum: "ERC", on: "14 October 2026", approver: null, reason: null },
  },
  { itemId: "pi-restriction", label: "Restriction on new high-risk customers: population test red", routingRule: "Level 1 red", inVersions: [1, 2] },
  { itemId: "pi-tm", label: "Transaction monitoring coverage unverified", routingRule: "Headline unverified", inVersions: [1, 2] },
  { itemId: "pi-sanctions", label: "Sanctions list rule coverage unverified", routingRule: "Headline unverified", inVersions: [1, 2] },
  { itemId: "pi-queue", label: "Alert queue median age amber", routingRule: "Level 1 amber", inVersions: [1, 2] },
  { itemId: "pi-lcr", label: "LCR early warning before the next BRC", routingRule: "Projected amber before the next forum", inVersions: [1, 2] },
  { itemId: "pi-hltv", label: "High-LTV share: amber projected Q2 2027", routingRule: "Projected amber within 4 quarters", inVersions: [1, 2] },
  { itemId: "pi-nsfr", label: "NSFR proposed for the board view", routingRule: "Promotion rule met (firm practice)", inVersions: [1, 2] },
  { itemId: "pi-cdd", label: "CDD refresh finding overdue and extended", routingRule: "Overdue high-rated finding", inVersions: [1, 2] },
  { itemId: "pi-cdd-effect", label: "Closed CDD actions with no metric movement", routingRule: "Closed without effect", inVersions: [1, 2] },
  { itemId: "pi-117", label: "Mortgage reversion-rate error logged", routingRule: "Reportable event logged", inVersions: [1, 2] },
  { itemId: "pi-tension", label: "Savings onboarding trade-off outside its terms", routingRule: "Agreed trade-off outside terms", inVersions: [1, 2] },
  { itemId: "pi-latency", label: "Escalation latency above threshold", routingRule: "Governance KRI above threshold", inVersions: [1, 2] },
];

export const MANIFEST_ID = "m-brc-q3-2026";

export const MANIFEST_VERSIONS: ManifestVersion[] = [
  {
    version: 1,
    state: "draft",
    createdOn: "07 October 2026",
    createdBy: "CRO office",
    itemIds: PACK_ITEMS.map((i) => i.itemId),
    note: "Draft built from the routing rules: 13 items qualify",
  },
  {
    version: 2,
    state: "locked",
    createdOn: "15 October 2026",
    createdBy: "CRO office",
    itemIds: PACK_ITEMS.filter((i) => i.inVersions.includes(2)).map((i) => i.itemId),
    note: "Locked after the ERC of 14 October 2026: 12 items",
  },
];

export const VULN_HISTORY = "14.2 → 15.8 → 16.9 per 10,000 contacts (amber 14, red 18)";

export const KRI_TILES: KriTile[] = [
  {
    unitId: "u-kri-backlog",
    variant: "backlog",
    title: "Which known weaknesses are overdue and never reached the BRC?",
    primary: "31 months to clear against 12 committed",
    secondary: "CDD refresh finding extended 3 times over 19 months (limit 2); never in a BRC pack",
    ruleLine: "At the current clearance rate the backlog clears in 31 months against the committed 12.",
    draftId: "d-t236-agenda",
  },
  {
    unitId: "u-kri-latency",
    variant: "latency",
    title: "How long does bad news take to reach us?",
    primary: "Median 4.6 months (n = 23)",
    secondary: "From first logged high severity to the BRC; 3 material items unescalated after 12 months",
    ruleLine: "Measured from the first logged high severity, so it may understate the true time.",
    draftId: "d-t237-review",
  },
  {
    unitId: "u-kri-effect",
    variant: "effectiveness",
    title: "Which closed actions have not moved their metric?",
    primary: "26,900 overdue CDD reviews against a 10,000 target",
    secondary: "42 CDD remediation actions closed this quarter; 2 issues downgraded with no metric movement",
    ruleLine: "The linked metric is still outside its band after the declared recovery time.",
    draftId: "d-t238-reopen",
  },
];

/** DG-10 bodies (TC-9: two distinct CDD series). */
export const KRI_DETAIL = {
  backlogSeries: {
    label: "CDD refresh backlog (total customers)",
    points: [
      { label: "Q4 2025", value: 44000 },
      { label: "Q1 2026", value: 43100 },
      { label: "Q2 2026", value: 41800 },
      { label: "Q3 2026", value: 41000 },
    ],
    committed: "Committed clearance: 12 months from March 2025 (extended 3 times; limit 2)",
    manifestSearch: "BRC pack manifests searched since March 2025: finding absent from all 6",
  },
  latency: {
    n: 23,
    minN: 10,
    median: "4.6 months",
    windowNote: "Window: high-severity issues first logged 01 January to 30 September 2026 (n = 23); the self-identification ratio counts all 24 high-severity issues logged in 2026 to date, including 1 logged in October",
    unescalated: [
      { unit: "Mortgage operations", months: 14 },
      { unit: "Payments operations", months: 13 },
      { unit: "Savings product", months: 12 },
    ],
    selfIdentification: "Self-identification ratio: 15 of 24 high-severity issues found by the first or second line (63%)",
    challengeThenBreach: "1 second-line challenge closed, then breached within 6 months",
  },
  effectiveness: {
    seriesLabel: "Overdue CDD reviews",
    pairs: [
      { action: "42 CDD remediation actions closed in Q3 2026", metric: "Overdue CDD reviews 27,300 → 26,900 (target 10,000)" },
      { action: "Issue I-7710 downgraded high → medium", metric: "No movement in the linked metric" },
      { action: "Issue I-7745 downgraded high → medium", metric: "No movement in the linked metric" },
      { action: "1 action reassigned twice", metric: "No closure evidence" },
    ],
    unlinkedShare: "12% of closed actions have no linked metric",
  },
};

/* ── ST-10 drafts (E-51). Verbs are the closed set only. ────────────── */

export const DRAFTS: Record<string, DraftAction> = {
  "d-t21-appetite": {
    draftId: "d-t21-appetite",
    unitId: "u-hltv",
    verb: "propose",
    title: "Propose an appetite recommendation",
    reason: "Drafted from the appetite statement, the Q3 position and the stamped plan version only. It sets out three options; the board decides.",
    body: "At plan volumes high-LTV lending reaches amber in Q2 2027 (early warning, not a prediction). The BRC is asked to choose one of three options set out below.",
    targetRole: "BRC",
    options: [
      { id: "rephase", label: "Re-phase high-LTV lending" },
      { id: "change", label: "Change appetite, with rationale" },
      { id: "confirm", label: "Confirm deliberate use of headroom" },
    ],
    effect: "decision_proposed",
    gateHolder: "cro",
    faceAfter: "Proposed to the BRC on 27 October 2026 · decision pending",
  },
  "d-t21-para": {
    draftId: "d-t21-para",
    unitId: "u-hltv",
    verb: "prepare",
    title: "Prepare a BRC paragraph",
    reason: "Drafted from the Q3 position and the threshold cascade. It adds no figures of its own.",
    body: "High-LTV lending is 17.6% of new lending against an appetite of 20% (88% used; £96m headroom on a £4.0bn plan). A straight-line projection reaches amber in Q2 2027 at plan volumes; this is an early warning, not a prediction. CFO accepted-by line required for capital figures.",
    targetRole: "CRO office (pack build)",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Paragraph in the pack draft",
  },
  "d-t25-choice": {
    draftId: "d-t25-choice",
    unitId: "u-capacity",
    verb: "propose",
    title: "Propose: restore capacity or pace growth",
    reason: "Proposed because queue age is past amber and no resourcing action or decision is recorded. Only two options exist.",
    body: "Queue median age is 19 days against an amber of 14 and the next savings campaign starts on 08 December 2026. The CEO and board are asked to restore financial crime capacity or pace growth. There is no third option.",
    targetRole: "CEO and board",
    options: [
      { id: "restore", label: "Restore capacity" },
      { id: "pace", label: "Pace growth (re-phase the campaign)" },
    ],
    effect: "decision_proposed",
    gateHolder: "cro",
    faceAfter: "Proposed to CEO and board on 27 October 2026 · decision pending",
  },
  "d-t25-paper": {
    draftId: "d-t25-paper",
    unitId: "u-capacity",
    verb: "prepare",
    title: "Prepare a resourcing paper for the Head of Financial Crime",
    reason: "Prepared for the 'Restore capacity' option from the capacity and queue series only.",
    body: "Members per qualified handler rose from 25,000 to 30,160. Restoring the Q2 2025 ratio at 1.90m members needs about 76 qualified handlers against 63 today. The paper sets out the gap; the Head of Financial Crime proposes the plan.",
    targetRole: "Head of Financial Crime",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to Head of Financial Crime",
  },
  "d-pg4": {
    draftId: "d-pg4",
    unitId: "u-capacity",
    verb: "propose",
    title: "Propose a capacity check in campaign approval",
    reason: "Proposed because campaigns are approved without a control-capacity check.",
    body: "Add a financial crime capacity check to the campaign approval step, so every growth campaign states the queue age and handler ratio it will run at.",
    targetRole: "CEO and ExCo",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to CEO and ExCo",
  },
  "d-t26-redecide": {
    draftId: "d-t26-redecide",
    unitId: "u-tension",
    verb: "propose",
    title: "Propose a BRC re-decision on the onboarding trade-off",
    reason: "Drafted from the keyed register fields only: 2 of 3 bounds exceeded and the review is overdue.",
    body: "The agreed trade-off is outside its own terms. The BRC is asked to re-set the bounds, restore the guardrail, or end the trade-off. Pre-CDD transacting is a regulatory floor and is not part of this choice.",
    targetRole: "BRC",
    options: [
      { id: "reset", label: "Re-set the bounds" },
      { id: "restore", label: "Restore the guardrail" },
      { id: "end", label: "End the trade-off" },
    ],
    effect: "decision_proposed",
    gateHolder: "cro",
    faceAfter: "Proposed to the BRC on 27 October 2026 · decision pending",
  },
  "d-t26-floor": {
    draftId: "d-t26-floor",
    unitId: "u-tension",
    verb: "draft",
    title: "Draft a ledger entry for the pre-CDD transacting floor",
    reason: "Drafted because a regulatory floor is a breach path, never a trade-off.",
    body: "Open a draft reportability ledger entry for pre-CDD transacting. The deciding SMF decides whether any route is engaged.",
    targetRole: "Head of Compliance",
    effect: "ledger_draft",
    gateHolder: "cro",
    faceAfter: "Draft ledger entry opened · case not prepared",
    ledgerLabel: "Draft entry: pre-CDD transacting floor breach",
  },
  "d-t214-caveat": {
    draftId: "d-t214-caveat",
    unitId: "u-tm",
    verb: "prepare",
    title: "Prepare caveat text",
    reason: "Drafted from the reconciliation counts only. It says records were not monitored, not that suspicious activity was missed.",
    body: "Transaction monitoring coverage is unverified for Q3 2026. In the 26 October 2026 run, 94.0% of payment records (2,256,000 of 2,400,000) reached monitoring; same-day accounts were not monitored. This means records were not monitored; it does not mean suspicious activity was missed.",
    targetRole: "BRC pack",
    effect: "caveat",
    gateHolder: "cro",
    faceAfter: "In pack with caveat",
  },
  "d-t214-remed": {
    draftId: "d-t214-remed",
    unitId: "u-tm",
    verb: "propose",
    title: "Propose remediation to the feed owner, COO and CTO",
    reason: "Proposed because a cohort is excluded from the monitoring feed in all 3 runs.",
    body: "Process gap (data-feed design): same-day accounts are absent from the monitoring feed. Ask: fix the feed, re-run against the same-day cohort (143,323 records in the 26 October run), then re-attest against the named run.",
    targetRole: "Feed owner, COO and CTO",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to feed owner, COO and CTO",
  },
  "d-t217-challenge": {
    draftId: "d-t217-challenge",
    unitId: "u-tm",
    verb: "propose",
    title: "Propose a re-attestation challenge",
    reason: "Proposed because the September attestation was signed 3 hours before its run completed.",
    body: "Process gap (workflow sequencing): the attestation workflow allows signing before evidence exists. Ask: re-attest against a named, completed run, and block signature until the referenced run is complete.",
    targetRole: "Feed owner and second line",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Attestation precedes a completed run · challenge sent",
  },
  "d-t214-triage": {
    draftId: "d-t214-triage",
    unitId: "u-tm",
    verb: "draft",
    title: "Open a draft triage entry in the ledger",
    reason: "Drafted so the deciding SMF can consider whether the feed shortfall engages any route.",
    body: "Draft triage entry: transaction monitoring feed shortfall, same-day accounts unmonitored since August 2026.",
    targetRole: "Head of Compliance",
    effect: "ledger_draft",
    gateHolder: "cro",
    faceAfter: "Draft ledger entry opened · case not prepared",
    ledgerLabel: "Draft entry: transaction monitoring feed shortfall (same-day accounts unmonitored)",
  },
  "d-t232-readacross": {
    draftId: "d-t232-readacross",
    unitId: "u-tm",
    verb: "propose",
    title: "Propose a read-across test on 3 feeds",
    reason: "Proposed because 3 feeds share the batch design of the failing feed.",
    body: "Run the cohort reconciliation on the Faster Payments, card payments and standing orders feeds. Did our read-across test the population?",
    targetRole: "Second line and Head of Financial Crime",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to second line and Head of Financial Crime",
  },
  "d-t215-sanctions": {
    draftId: "d-t215-sanctions",
    unitId: "u-sanctions",
    verb: "propose",
    title: "Propose a list-coverage remediation",
    reason: "Proposed because 39 rule records cover 3,088 list entries and the control has gone quiet.",
    body: "Ask the screening owner to load rules for the full Consolidated List and confirm the expected alert rate. The product observes configuration; it never changes a rule.",
    targetRole: "Head of Financial Crime",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to Head of Financial Crime",
  },
  "d-t212-promo": {
    draftId: "d-t212-promo",
    unitId: "u-nsfr",
    verb: "propose",
    title: "Propose NSFR for the board view",
    reason: "Drafted from the NSFR series; the CRO decides whether it joins the board view.",
    body: "NSFR moved from 10 points to 2 points above amber in one quarter. Proposed: promote NSFR and move 'Critical vulnerabilities past SLA' to the cyber drill, keeping the cap at 12 (firm practice).",
    targetRole: "CRO (headline set)",
    effect: "promotion",
    gateHolder: "cro",
    faceAfter: "Promoted by Eleanor Hartley on 27 October 2026",
  },
  "d-t24-owner": {
    draftId: "d-t24-owner",
    unitId: "u-lcr",
    verb: "prepare",
    title: "Prepare an owner note and an early ERC flag",
    reason: "Prepared because amber is about 9 weeks away, the BRC is in 7 and ALCO needs 6 to act.",
    body: "LCR is 162% against amber 150% and is projected to reach amber in about 9 weeks (early warning, not a prediction). Proposed: an owner action now and an early ERC flag.",
    targetRole: "Treasurer, CFO and ALCO",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to Treasurer, CFO and ALCO",
  },
  "d-t213-metric": {
    draftId: "d-t213-metric",
    unitId: "u-horizon",
    verb: "propose",
    title: "Propose a metric and owner for AI-enabled impersonation fraud",
    reason: "Proposed because an in-horizon risk has no metric or owner; the principal-risk owner decides.",
    body: "AI-enabled impersonation fraud is expected within 12 months and maps to financial crime with no Level 1 metric. Proposed: a metric and a named owner, or a BRC horizon note.",
    targetRole: "Head of Financial Crime",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to Head of Financial Crime",
  },
  "d-t23-ras": {
    draftId: "d-t23-ras",
    unitId: "u-unmapped",
    verb: "propose",
    title: "Propose the missing RAS line for the business current account",
    reason: "Proposed because a plan initiative consumes appetite with no RAS link.",
    body: "Process gap (planning to appetite): the business current account launch (Q1 2027, 18,000 accounts) has no RAS line and no financial crime metric. The CRO proposes; the CFO co-signs.",
    targetRole: "CFO",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to CFO",
  },
  "d-t227-contain": {
    draftId: "d-t227-contain",
    unitId: "u-restriction",
    verb: "propose",
    title: "Propose containment to the Head of Financial Crime",
    reason: "Lists counts only. Account records stay in the Head of Financial Crime's restricted view.",
    body: "Contain today: restrict or exit the 112 accounts found (104 customers). Counts only; the Head of Financial Crime confirms the records.",
    targetRole: "Head of Financial Crime",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to Head of Financial Crime",
  },
  "d-pg1-coverage": {
    draftId: "d-pg1-coverage",
    unitId: "u-restriction",
    verb: "propose",
    title: "Propose a test-coverage fix",
    reason: "Proposed because a new product route launched without extending the restriction control or its test.",
    body: "Process gap (product launch): the flag's scope does not include the savings pot, and the partner channel is untested. Ask: extend the flag and the population test to both routes, by a date the owner proposes.",
    targetRole: "Savings product owner and CTO",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to savings product owner and CTO",
  },
  "d-t228-summary": {
    draftId: "d-t228-summary",
    unitId: "u-restriction",
    verb: "prepare",
    title: "Prepare an evidence summary per clause",
    reason: "Evidence summary prepared clause by clause. It does not write or judge the attestation wording.",
    body: "R-03.1 not supported (breaches in July, August and September). R-03.2, R-03.3 and R-03.4 supported. The attesting SMF writes and signs the attestation.",
    targetRole: "Head of Financial Crime (attesting SMF)",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Evidence summary sent to Head of Financial Crime",
  },
  "d-t228-facts": {
    draftId: "d-t228-facts",
    unitId: "u-restriction",
    verb: "propose",
    title: "Propose the facts to disclose",
    reason: "Facts listed from the test runs for the period; the SMF decides what the attestation says.",
    body: "Facts for the period: breaches found in each of the 3 months; 24,000 partner-channel openings untested; the Q2 2026 attestation was signed while June breaches existed.",
    targetRole: "Head of Financial Crime (attesting SMF)",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Facts sent to Head of Financial Crime",
  },
  "d-case-r03-sup153": caseDraft("d-case-r03-sup153", "rt-r03-sup153", "FCA notification (SUP 15.3)"),
  "d-case-r03-fr7": caseDraft("d-case-r03-fr7", "rt-r03-fr7", "PRA notification (Fundamental Rule 7)"),
  "d-case-117-fr7": caseDraft("d-case-117-fr7", "rt-117-fr7", "PRA notification (Fundamental Rule 7)"),
  "d-case-117-sup1511": caseDraft("d-case-117-sup1511", "rt-117-sup1511", "Conduct rule breach notification (SUP 15.11)"),
  "d-t230-prompt": {
    draftId: "d-t230-prompt",
    unitId: "rt-117-sup153",
    verb: "send_to_owner",
    title: "Send to owner: prompt to re-test the awareness date",
    reason: "Prompted because structured records on the same control predate the logged awareness date by 54 days. The product never re-dates.",
    body: "Earlier linked records: issue raised 21 August 2026; control test failed 02 September 2026; logged awareness 14 October 2026. The deciding SMF decides whether the logged date stands.",
    targetRole: "Head of Compliance (deciding SMF)",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Prompt sent to deciding SMF",
  },
  "d-t234-options": {
    draftId: "d-t234-options",
    unitId: "u-vuln",
    verb: "propose",
    title: "Propose a December agenda item",
    reason: "Three options drafted for the chair: remediation with an owner, a time-limited waiver, or a recalibration review.",
    body: "Put vulnerable-customer exceptions on the December agenda and decide one of three options.",
    targetRole: "BRC chair",
    options: [
      { id: "remediate", label: "Remediation with an owner" },
      { id: "waiver", label: "Time-limited waiver" },
      { id: "recalibrate", label: "Recalibration review" },
    ],
    effect: "chair_proposal",
    gateHolder: "brc_chair",
    faceAfter: "Agenda item decided by the BRC chair",
  },
  "d-t235-restore": {
    draftId: "d-t235-restore",
    unitId: "u-vuln",
    verb: "propose",
    title: "Propose restoring the item to the pack",
    reason: "Proposed because the item meets a BRC routing rule and left the pack with no approver or reason recorded.",
    body: "Restore 'Vulnerable-customer exceptions: amber for 3 quarters' to the Q3 2026 BRC pack as a new draft manifest version.",
    targetRole: "CRO (pack approval)",
    effect: "manifest_restore",
    gateHolder: "cro",
    faceAfter: "Item restored · awaiting CRO pack approval",
  },
  "d-pg5": {
    draftId: "d-pg5",
    unitId: "u-vuln",
    verb: "propose",
    title: "Propose an approver and reason on every removal",
    reason: "Proposed because the pack build allows removals with no logged approver or reason.",
    body: "Process gap (governance): require a named approver and a reason code on every removal from a BRC manifest.",
    targetRole: "Company secretary and CRO office",
    effect: "send",
    gateHolder: "cro",
    faceAfter: "Sent to company secretary and CRO office",
  },
  "d-t236-agenda": {
    draftId: "d-t236-agenda",
    unitId: "u-kri-backlog",
    verb: "propose",
    title: "Propose an agenda item and an owner review",
    reason: "Proposed because the finding has been extended 3 times against a limit of 2 and has never reached a BRC pack.",
    body: "Agenda item: CDD refresh finding, 31 months to clear against 12 committed. Owner review with the Head of Internal Audit.",
    targetRole: "BRC chair",
    effect: "chair_proposal",
    gateHolder: "cro",
    faceAfter: "Proposed to the BRC chair",
  },
  "d-t237-review": {
    draftId: "d-t237-review",
    unitId: "u-kri-latency",
    verb: "propose",
    title: "Propose a governance review of the escalation route",
    reason: "Proposed because the median escalation time is 4.6 months (n = 23) and 3 material items are unescalated after 12 months.",
    body: "Review the escalation route, starting with the slowest: mortgage operations, payments operations and the savings product.",
    targetRole: "BRC chair",
    effect: "chair_proposal",
    gateHolder: "cro",
    faceAfter: "Proposed to the BRC chair",
  },
  "d-t238-reopen": {
    draftId: "d-t238-reopen",
    unitId: "u-kri-effect",
    verb: "prepare",
    title: "Prepare a re-open request",
    reason: "Prepared because 42 actions closed while overdue CDD reviews stayed at 26,900 against 10,000.",
    body: "Re-open the closed CDD remediation actions and reinstate severity on the 2 downgraded issues, for the owner and the Head of Internal Audit.",
    targetRole: "Owner and Head of Internal Audit",
    effect: "chair_proposal",
    gateHolder: "cro",
    faceAfter: "Proposed to the BRC chair",
  },
};

function caseDraft(draftId: string, routeId: string, routeName: string): DraftAction {
  return {
    draftId,
    unitId: routeId,
    verb: "prepare",
    title: `Prepare the case: ${routeName}`,
    reason: "Prepared per route with the rule text in force on the event date. It proposes who decides, not what to decide.",
    body: "Facts, rule text by in-force date and the options with their rationale. No default answer is proposed. Proposed decider: Head of Compliance.",
    targetRole: "Head of Compliance",
    effect: "case_prepared",
    gateHolder: "cro",
    faceAfter: "Case prepared · sent to Head of Compliance · decision pending",
  };
}

/* ── Seeded audit trail (E-53): draft.created for every seeded draft ── */

export function seedAudit(): AuditEntry[] {
  const drafts: AuditEntry[] = Object.values(DRAFTS).map((d, i) => ({
    entryId: `ae-seed-${i + 1}`,
    ts: "27 October 2026 06:00",
    actorName: PEOPLE.ai.name,
    actorRole: PEOPLE.ai.role,
    action: "draft.created",
    objectLabel: d.title,
    objectRef: d.unitId,
    version: 1,
  }));
  return [
    {
      entryId: "ae-seed-rd-117",
      ts: "23 October 2026 16:20",
      actorName: PEOPLE.smf16.name,
      actorRole: PEOPLE.smf16.role,
      action: "route_decision.recorded",
      objectLabel: "FCA notification (SUP 15.3) for the mortgage reversion-rate error",
      objectRef: "rt-117-sup153",
      version: 1,
    },
    ...drafts,
  ];
}

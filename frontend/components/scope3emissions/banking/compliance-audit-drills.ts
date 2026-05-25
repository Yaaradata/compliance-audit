import type {
  BankControlRegisterRow,
  BorrowerRow,
  BrsrActionDrill,
  BrsrCategoryDrill,
  ComplianceAuditDrills,
  ComplianceCounterpartyDrill,
  ControlChecklistDrill,
  DataConfidenceDrill,
  ExceptionDrill,
  AuditLogDrill,
} from "./types";

const PCAF_OPTION: Record<number, string> = {
  1: "Option 1 — Reported emissions & attribution",
  2: "Option 2 — Verified Scope 1+2 + physical activity",
  3: "Option 3 — Sector / EEIO proxy",
  4: "Option 4 — Economic intensity proxy",
  5: "Option 5 — Revenue-based estimate",
};

function formatT(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function buildCounterpartyDrill(b: BorrowerRow, controls: BankControlRegisterRow[]): ComplianceCounterpartyDrill {
  const linkedControlIds = controls
    .filter((c) => c.linkedBorrowerIds?.includes(b.id))
    .map((c) => c.controlId);
  const prior = Math.round(b.attributedTCO2e * (b.redFlags === "none" ? 0.94 : 1.38));
  const variancePct = Math.round(((b.attributedTCO2e - prior) / prior) * 1000) / 10;

  const lineageBase = [
    {
      step: "Source ingestion",
      source: b.brsrDisclosed ? "BRSR XBRL / annual report extract" : "No borrower submission",
      owner: "ESG Risk — Data Ops",
      updated: b.brsrDisclosed ? "2025-03-18" : "—",
      status: b.brsrDisclosed ? ("Verified" as const) : ("Missing" as const),
    },
    {
      step: "PCAF attribution",
      source: `${PCAF_OPTION[b.pcafScore] ?? "Proxy"}`,
      owner: "Climate Analytics",
      updated: "2025-03-31",
      status: b.pcafScore <= 2 ? ("Verified" as const) : b.pcafScore <= 3 ? ("Estimated" as const) : ("Flagged" as const),
    },
    {
      step: "Credit exposure tie-out",
      source: `Core banking — ${b.facilityType}`,
      owner: "Finance Control",
      updated: "2025-04-02",
      status: "Verified" as const,
    },
    {
      step: "Assurance sampling",
      source: b.brsrDisclosed ? "Included in FY25 limited assurance scope" : "Excluded — data gap",
      owner: "Internal Audit",
      updated: "2025-05-08",
      status: b.brsrDisclosed ? ("Verified" as const) : ("Missing" as const),
    },
  ];

  const assuranceStatus =
    !b.brsrDisclosed && b.pcafScore >= 4
      ? "Out of assurance scope — escalation required"
      : b.redFlags !== "none"
        ? "In scope with exception flag"
        : "In scope — verified trail";

  const remediation: string[] = [];
  if (!b.brsrDisclosed) remediation.push("Issue annual climate questionnaire + 30-day disclosure covenant review.");
  if (b.engagement === "Unengaged" || b.engagement === "First Contact")
    remediation.push(`RM engagement: move from "${b.engagement}" to Active Dialogue by next credit review.`);
  if (b.pcafScore >= 4) remediation.push("Upgrade PCAF ladder — collect primary activity data or audited Scope 1+2.");
  if (b.redFlags !== "none") remediation.push(`Address red flag: ${b.redFlags.replace(/-/g, " ")}.`);
  if (remediation.length === 0) remediation.push("No remediation — maintain annual refresh cadence.");

  return {
    borrowerId: b.id,
    facilityType: b.facilityType,
    maturity: b.maturity,
    esgRating: b.esgRating,
    pcafScore: b.pcafScore,
    pcafOption: PCAF_OPTION[b.pcafScore] ?? "Proxy",
    brsrDisclosed: b.brsrDisclosed,
    sbtiCommitted: b.sbtiCommitted,
    engagement: b.engagement,
    redFlags: b.redFlags === "none" ? "None" : b.redFlags,
    attributedTCO2e: b.attributedTCO2e,
    scope12TCO2e: b.scope12TCO2e,
    priorYearAttributed: prior,
    variancePct,
    ratingAgency: b.ratingAgency,
    dataLineage: lineageBase,
    evidenceArtifacts: [
      {
        name: "Borrower climate questionnaire FY25",
        status: b.brsrDisclosed ? "Available" : "Missing",
        docType: "Primary data",
      },
      {
        name: "Attribution workbook row",
        status: "Available",
        docType: "Calculation",
      },
      {
        name: "BRSR Principle 6 extract",
        status: b.brsrDisclosed ? "Available" : "Missing",
        docType: "Disclosure",
      },
      {
        name: "Third-party verification letter",
        status: b.pcafScore <= 2 ? "Available" : "In Preparation",
        docType: "Assurance",
      },
    ],
    auditNotes: [
      `Attributed financed emissions: ${formatT(b.attributedTCO2e)} tCO₂e at ${b.attributionFactorPct}% attribution factor.`,
      b.scope3TCO2e != null
        ? `Borrower-reported Scope 3 (where available): ${formatT(b.scope3TCO2e)} tCO₂e.`
        : "Scope 3 not disclosed by counterparty — bank uses PCAF proxy path.",
      variancePct > 20 || variancePct < -20
        ? `YoY variance ${variancePct}% — ${variancePct > 0 ? "investigate spike" : "confirm restatement memo"}.`
        : "YoY variance within tolerance for assurance sampling.",
    ],
    remediationSteps: remediation,
    linkedControlIds: linkedControlIds.length ? linkedControlIds : ["C-BAX-01", "C-BAX-11"],
    assuranceStatus,
  };
}

export const STATIC_BRSR_CATEGORY_DRILLS: Record<string, BrsrCategoryDrill> = {
  a: {
    brsrPrinciple: "Principle 6 — Essential Indicator 6a",
    regulatoryRef: "SEBI LODR — BRSR Core",
    dataOwner: "Head — Facilities",
    completenessPct: 100,
    gaps: [],
    evidenceRequired: ["Scope 1 inventory", "DEFRA / India EF registry lock", "Internal verification sign-off"],
    actions: ["Maintain quarterly stationary combustion refresh"],
    linkedReports: ["BRSR Section A — Environmental"],
    assuranceNote: "Limited assurance completed for FY24; FY25 walkthrough scheduled Jun 2026.",
  },
  c: {
    brsrPrinciple: "Principle 6 — Essential Indicator 6b",
    regulatoryRef: "SEBI LODR — BRSR Core",
    dataOwner: "Climate Analytics",
    completenessPct: 83,
    gaps: ["Cat 11 sold products proxy coverage", "Trade finance commodity path not fully mapped"],
    evidenceRequired: ["Scope 3 inventory boundary memo", "Category-level calculation sheets"],
    actions: ["Close Cat 11 top-50 borrower primary data gap", "Publish Cat 3 T&D reconciliation"],
    linkedReports: ["BRSR Section A — Environmental", "CDP FS — C6"],
    assuranceNote: "Auditor requested supplementary memo on operational vs financed boundary.",
  },
  d: {
    brsrPrinciple: "Principle 6 — Essential Indicator 6c (Financed emissions)",
    regulatoryRef: "SEBI BRSR Core · PCAF FI Standard v2",
    dataOwner: "ESG Risk",
    completenessPct: 78,
    gaps: ["146 non-disclosed counterparties", "SME sleeve Score 4–5 concentration"],
    evidenceRequired: ["PCAF attribution workbook", "Borrower coverage ladder", "YoY reconciliation memo"],
    actions: ["Execute non-disclosure escalation SOP", "Raise MSME survey response above 60%"],
    linkedReports: ["BRSR Core KPI Assurance Pack", "PCAF Annual Disclosure"],
    assuranceNote: "PBC item — financed emissions KPI tie-out pending boundary memo sign-off.",
  },
  f: {
    brsrPrinciple: "Principle 8 — Leadership (Climate targets)",
    regulatoryRef: "SEBI BRSR Core Leadership · SBTi FI",
    dataOwner: "Company Secretary",
    completenessPct: 20,
    gaps: ["No board-approved net-zero target", "NZBA sector file incomplete"],
    evidenceRequired: ["Board resolution", "SBTi submission pack", "NZBA progress tables"],
    actions: ["Board paper for SBTi-aligned targets — EX-041", "Align with RBI climate risk guidelines"],
    linkedReports: ["NZBA Annual Progress Report"],
    assuranceNote: "Critical gap — leadership indicator not met for FY25 filing window.",
  },
  j: {
    brsrPrinciple: "MSME / supply chain (portfolio narrative)",
    regulatoryRef: "BRSR Core — value chain emphasis",
    dataOwner: "Credit Policy — MSME",
    completenessPct: 41,
    gaps: ["59% MSME borrowers without emissions data", "CGTMSE segment unmapped"],
    evidenceRequired: ["MSME engagement log", "Proxy methodology memo"],
    actions: ["Launch MSME climate lite questionnaire", "Link to CGTMSE renewal triggers"],
    linkedReports: ["BRSR Section A — Environmental"],
    assuranceNote: "Partial — EEIO proxy applied; auditor sampling focused on top 20 MSME exposures.",
  },
};

export const STATIC_CONTROL_DRILLS: Record<string, ControlChecklistDrill> = {
  "chk-cat6": {
    controlObjective: "Ensure completeness of Cat 6 business travel emissions for branch network.",
    testProcedure: "Sample 25 branches — reconcile travel expense feeds to expense management system.",
    lastTested: "2025-04-28",
    tester: "Internal Audit — Travel & Expense",
    owner: "Head — Administration",
    frameworks: ["GHG Protocol", "BRSR"],
    findings: ["18% of regional offices missing Q4 expense uploads", "Class-of-service uplift not applied on 3 samples"],
    evidenceLinks: ["/evidence/cat6-travel-reconciliation-q4.xlsx"],
    remediationPlan: "EX-039 — branch data chase by 20 May; automate API pull from expense system.",
    nextReview: "2025-06-15",
  },
  "chk-cat15-esc": {
    controlObjective: "Escalate borrowers refusing climate disclosure per credit policy.",
    testProcedure: "Review 146 non-disclosed entities — confirm escalation ticket and RM owner.",
    lastTested: "2025-03-10",
    tester: "Compliance Monitoring",
    owner: "Head — ESG Risk",
    frameworks: ["PCAF", "RBI Climate Risk", "BRSR Core"],
    findings: ["No formal SOP documented", "146 entities without resolution >45 days"],
    evidenceLinks: ["/evidence/non-disclosure-register-fy25.csv"],
    remediationPlan: "Draft escalation SOP — board Risk Committee paper; tie to covenant library.",
    nextReview: "2025-05-30",
  },
  "chk-governance": {
    controlObjective: "Board-approved climate targets aligned to SBTi / RBI expectations.",
    testProcedure: "Inspect board minutes and published targets for FY25.",
    lastTested: "2025-02-14",
    tester: "External assurance partner",
    owner: "Company Secretary",
    frameworks: ["TCFD", "SBTi FI", "SEBI LODR"],
    findings: ["No approved net-zero target", "NZBA narrative exists but not board-signed"],
    evidenceLinks: ["/evidence/board-climate-target-gap-memo.pdf"],
    remediationPlan: "EX-041 — target setting paper overdue 90 days.",
    nextReview: "2025-06-30",
  },
};

export const STATIC_LOG_DRILLS: Record<string, AuditLogDrill> = {
  "log-1": {
    eventType: "Data correction",
    systemRef: "FIN-EMIS-2025-ENERGY-042",
    beforeValue: "1,520,000 tCO₂e",
    afterValue: "1,580,000 tCO₂e",
    impactedEntities: ["IndoSteel Corp", "Energy sector roll-up"],
    approver: "Climate Analytics Lead",
    relatedControlIds: ["C-BAX-13", "C-BAX-02"],
    followUpActions: ["YoY memo footnote", "Notify external auditor of immaterial restatement"],
  },
  "log-2": {
    eventType: "Exception flag",
    systemRef: "EXC-CP-2025-0088",
    beforeValue: "Verified",
    afterValue: "Inconsistent",
    impactedEntities: ["NCR Realty Developers"],
    approver: "Rajesh Kumar — Internal Audit",
    relatedControlIds: ["C-BAX-13"],
    followUpActions: ["EX-040 investigation", "Request restated BRSR extract"],
  },
  "log-4": {
    eventType: "Automated anomaly",
    systemRef: "CTRL-ANOM-CAT6-9912",
    impactedEntities: ["3 branch offices — West region"],
    relatedControlIds: ["chk-cat6"],
    followUpActions: ["EX-039 branch chase", "Disable auto-publish until reconciled"],
  },
};

export const STATIC_EXCEPTION_DRILLS: Record<string, ExceptionDrill> = {
  "EX-041": {
    rootCause: "Board paper for SBTi-aligned targets not scheduled after Risk Committee deferral in Q3.",
    impact: "BRSR Core leadership indicator PI 8 not met; NZBA credibility risk with signatory reviewers.",
    remediationSteps: [
      { step: "Finalize target options paper", owner: "M. Nair", due: "2025-05-20", done: true },
      { step: "Board Risk Committee approval", owner: "Company Secretary", due: "2025-05-28", done: false },
      { step: "SBTi FI submission upload", owner: "ESG Risk", due: "2025-06-15", done: false },
    ],
    linkedBorrowerIds: [],
    linkedControlIds: ["chk-governance", "C-BAX-05"],
    escalationPath: "CRO → Board Risk Committee → Board",
    boardVisibility: true,
  },
  "EX-038": {
    rootCause: "No escalation SOP for non-disclosure; RM incentives not aligned to climate data collection.",
    impact: "146 counterparties at PCAF Score 5 / missing — BRSR Cat 15 coverage stuck at 78%.",
    remediationSteps: [
      { step: "Publish escalation SOP v1", owner: "R. Kumar", due: "2025-05-18", done: false },
      { step: "RM outreach wave 1 — top 50 exposures", owner: "Credit Policy", due: "2025-06-01", done: false },
      { step: "Covenant template update", owner: "Legal", due: "2025-06-30", done: false },
    ],
    linkedBorrowerIds: ["b13", "b22", "b7", "b2"],
    linkedControlIds: ["chk-cat15-esc", "C-BAX-01"],
    escalationPath: "ESG Risk → CRO → Board Risk Committee",
    boardVisibility: true,
  },
};

export const STATIC_CONFIDENCE_DRILLS: Record<string, DataConfidenceDrill> = {
  "dc-cat15": {
    categoryCode: "Cat 15",
    methodology: "PCAF Financial Institutions Standard v2 — attributed share of borrower Scope 1+2",
    pcafScoreDistribution: [
      { score: 1, pct: 8 },
      { score: 2, pct: 14 },
      { score: 3, pct: 28 },
      { score: 4, pct: 33 },
      { score: 5, pct: 17 },
    ],
    primaryDataPct: 42,
    estimatedPct: 38,
    missingPct: 20,
    sourceSystems: ["Borrower BRSR feed", "CDP API", "Attribution engine", "Core banking exposure"],
    lastRefresh: "2025-03-31",
    versionHistory: [
      { version: "vFY25.3", date: "2025-03-31", change: "Q4 borrower refresh + power sector restatement" },
      { version: "vFY25.2", date: "2024-12-15", change: "PCAF Option mapping workshop outcomes" },
      { version: "vFY25.1", date: "2024-09-01", change: "Initial FY25 boundary lock" },
    ],
    anomalies: ["4 YoY spikes >25% flagged in Q4 — 3 resolved, 1 open (NCR Realty)."],
  },
  "dc-cat6": {
    categoryCode: "Cat 6",
    methodology: "Distance-based business travel — class-of-service uplift per policy v2025.03",
    pcafScoreDistribution: [
      { score: 1, pct: 12 },
      { score: 2, pct: 22 },
      { score: 3, pct: 35 },
      { score: 4, pct: 24 },
      { score: 5, pct: 7 },
    ],
    primaryDataPct: 34,
    estimatedPct: 48,
    missingPct: 18,
    sourceSystems: ["Expense management", "Travel desk API", "Manual branch uploads"],
    lastRefresh: "2025-04-10",
    versionHistory: [
      { version: "vFY25.2", date: "2025-04-10", change: "Regional office gap identified — 18% missing Q4" },
      { version: "vFY25.1", date: "2025-01-08", change: "Airline emission factor update (DEFRA Q3)" },
    ],
    anomalies: ["EX-039 — branch travel reconciliation in progress."],
  },
};

export const STATIC_BRSR_ACTION_DRILLS: Record<string, BrsrActionDrill> = {
  "act-sbti": {
    severity: "Critical",
    owner: "Meera Nair — Compliance",
    targetDate: "2025-06-30",
    regulatoryDriver: "BRSR Core Leadership PI 8 · SBTi FI validation",
    dependencies: ["Board approval", "NZBA sector file", "External advisor opinion"],
    milestones: [
      { label: "Options paper", date: "2025-05-20", status: "Done" },
      { label: "Board sign-off", date: "2025-05-28", status: "Overdue" },
      { label: "SBTi submission", date: "2025-06-15", status: "Pending" },
    ],
    linkedExceptions: ["EX-041"],
  },
  "act-coverage": {
    severity: "High",
    owner: "Rajesh Kumar — Internal Audit",
    targetDate: "2025-07-31",
    regulatoryDriver: "BRSR Core PI 6c — 100% financed emissions coverage target",
    dependencies: ["Escalation SOP", "RM engagement wave", "PCAF ladder uplift plan"],
    milestones: [
      { label: "SOP published", date: "2025-05-18", status: "Pending" },
      { label: "Top-50 outreach complete", date: "2025-06-30", status: "Pending" },
    ],
    linkedExceptions: ["EX-038"],
  },
};

export function buildComplianceAuditDrills(
  borrowers: BorrowerRow[],
  controls: BankControlRegisterRow[],
): ComplianceAuditDrills {
  const counterparties: Record<string, ComplianceCounterpartyDrill> = {};
  for (const b of borrowers) {
    counterparties[b.id] = buildCounterpartyDrill(b, controls);
  }

  const brsrCategories: Record<string, BrsrCategoryDrill> = { ...STATIC_BRSR_CATEGORY_DRILLS };
  for (const id of ["b", "e", "g", "h", "i"]) {
    if (!brsrCategories[id]) {
      brsrCategories[id] = {
        brsrPrinciple: `BRSR category ${id.toUpperCase()}`,
        regulatoryRef: "SEBI LODR — BRSR Core",
        dataOwner: "Compliance",
        completenessPct: id === "b" || id === "e" || id === "h" || id === "i" ? 100 : 55,
        gaps: id === "g" ? ["Transition risk narrative incomplete for foreign branches"] : [],
        evidenceRequired: ["Supporting workbook", "Data owner attestation"],
        actions: ["Maintain quarterly refresh"],
        linkedReports: ["BRSR Section A — Environmental"],
        assuranceNote: "Met — included in FY25 assurance scope.",
      };
    }
  }

  const controlChecklist: Record<string, ControlChecklistDrill> = { ...STATIC_CONTROL_DRILLS };
  for (const id of ["chk-cat1", "chk-cat3", "chk-cat7", "chk-cat11", "chk-cat15-pcaf", "chk-data"]) {
    if (!controlChecklist[id]) {
      controlChecklist[id] = {
        controlObjective: "Scope 3 control operating effectively per annual test plan.",
        testProcedure: "Walkthrough + sample of 25 items; reperformance of key calculations.",
        lastTested: "2025-03-31",
        tester: "Internal Audit",
        owner: "ESG Risk",
        frameworks: ["GHG Protocol", "PCAF", "BRSR"],
        findings: ["No material exceptions noted in last test cycle."],
        evidenceLinks: ["/evidence/control-test-workpaper.pdf"],
        remediationPlan: "Continue quarterly monitoring.",
        nextReview: "2025-09-30",
      };
    }
  }

  const auditLog: Record<string, AuditLogDrill> = { ...STATIC_LOG_DRILLS };
  for (const id of ["log-3", "log-5"]) {
    if (!auditLog[id]) {
      auditLog[id] = {
        eventType: id === "log-3" ? "Disclosure approval" : "External verification",
        systemRef: `AUDIT-${id.toUpperCase()}`,
        impactedEntities: ["Portfolio-wide"],
        relatedControlIds: ["C-BAX-07", "C-BAX-08"],
        followUpActions: ["Archive in assurance PBC index"],
      };
    }
  }

  const dataConfidence: Record<string, DataConfidenceDrill> = { ...STATIC_CONFIDENCE_DRILLS };
  for (const id of ["dc-cat1", "dc-cat2", "dc-cat3", "dc-cat4", "dc-cat5", "dc-cat6", "dc-cat7", "dc-cat8", "dc-cat11"]) {
    if (!dataConfidence[id]) {
      dataConfidence[id] = {
        categoryCode: id.replace("dc-", "").toUpperCase(),
        methodology: "GHG Protocol Scope 3 — spend-based or activity-based per category guidance.",
        pcafScoreDistribution: [
          { score: 2, pct: 30 },
          { score: 3, pct: 40 },
          { score: 4, pct: 22 },
          { score: 5, pct: 8 },
        ],
        primaryDataPct: 40,
        estimatedPct: 45,
        missingPct: 15,
        sourceSystems: ["ERP", "Facilities", "HR survey"],
        lastRefresh: "2025-03-31",
        versionHistory: [{ version: "vFY25.1", date: "2025-03-31", change: "Annual inventory lock" }],
        anomalies: [],
      };
    }
  }

  const brsrActions: Record<string, BrsrActionDrill> = { ...STATIC_BRSR_ACTION_DRILLS };
  if (!brsrActions["act-msme"]) {
    brsrActions["act-msme"] = {
      severity: "Medium",
      owner: "Credit Policy — MSME",
      targetDate: "2025-08-31",
      regulatoryDriver: "BRSR value chain / MSME narrative",
      dependencies: ["Lite questionnaire", "RM training"],
      milestones: [
        { label: "Pilot 200 MSME accounts", date: "2025-06-30", status: "Pending" },
        { label: "41% → 60% coverage", date: "2025-08-31", status: "Pending" },
      ],
      linkedExceptions: [],
    };
  }

  return {
    counterparties,
    brsrCategories,
    controlChecklist,
    auditLog,
    exceptions: STATIC_EXCEPTION_DRILLS,
    dataConfidence,
    brsrActions,
    pageKpis: {
      brsr: {
        summary: "BRSR Core readiness at 74/100 — strong Scope 1 & 2, gaps in targets and MSME chain.",
        bullets: [
          "4 categories fully met · 3 partial · 3 not met",
          "Leadership PI 8 (targets) critical gap — board paper overdue",
          "Assurance partner sampling Cat 15 in Jun 2026",
        ],
      },
      pcaf: {
        summary: "58.2% loan-book coverage with weighted PCAF score 3.42 (1 = best).",
        bullets: [
          "Score 4–5 sleeves: SME, trade finance, vehicle loans",
          "Target: 65% coverage by FY26 Q2 per NZBA engagement plan",
          "Monthly ladder review — control C-BAX-11",
        ],
      },
      exceptions: {
        summary: "4 open exceptions — 2 overdue (targets, non-disclosure).",
        bullets: ["EX-041 Critical — SBTi targets", "EX-038 High — 146 non-disclosures", "2 in progress — travel & NCR Realty"],
      },
      assurance: {
        summary: "Overall assurance readiness 73% — verification pillar weakest at 58%.",
        bullets: [
          "Boundary memo unsigned — blocks PBC scoping",
          "External auditor fieldwork starts Jul 2026",
          "5 open findings · 2 auditor queries pending evidence",
        ],
      },
    },
  };
}

// @ts-nocheck — adapter layer: maps the UK Process Audit data into the exact
// `ProcessAuditSnapshot` contract consumed by the ported Indian dashboard
// components. Public UK contracts live in `@/lib/UK_Process_Audit`.
/**
 * UK Process Audit — v2 data adapter.
 *
 * The v2 dashboard reuses the *exact* Indian Process Audit (v3) presentation
 * components. Those components read a single `ProcessAuditSnapshot` object
 * (`D.*`). This module builds that snapshot from the UK data layer
 * (`getUkProcessAuditData()`), so every screen is driven by UK banking
 * controls, SOPs, journeys and evidence — with full data consistency.
 *
 * The derived-aggregate logic (domain audit view, process rows, coverage &
 * findings charts, AI intelligence feed, totals) mirrors the Indian
 * `assembleSnapshot` so the ported UI renders identically.
 */
import { getUkProcessAuditData } from "@/lib/UK_Process_Audit";

// ---------------------------------------------------------------------------
// Control mapping — UK control row -> Indian `AuditControl` schema
// ---------------------------------------------------------------------------

function mapControl(uk) {
  return {
    id: uk.controlId,
    // Concise control title (the SOP step) keeps tables aligned like Indian v3;
    // the full control mechanism moves to `objective` (shown once, in the drawer).
    name: uk.sopStep,
    objective: uk.controlDescription,
    regulatory: uk.primaryObligation,
    owner: uk.controlOwnerRole,
    frequency: uk.testingFrequency,
    population: uk.population,
    sample: uk.sample,
    exceptions: uk.exceptions,
    violations: uk.violations,
    compliance: uk.compliance,
    status: uk.status === "not-tested" ? "needs-attention" : uk.status,
    lastTested: uk.lastTested,
    tester: uk.tester,
  };
}

/**
 * Turn a verbose UK risk statement into a crisp, activity-led stage description
 * that reads like Indian Process Audit v3 (e.g. "Capture application form and
 * customer consent.") instead of the long "Failure to … could result in …"
 * sentence. Isolated to v2 so shared UK data is untouched.
 */
function crispStageDescription(raw) {
  const text = String(raw || "").replace(/\s+/g, " ").trim();
  if (!text) return "";

  // "Failure to <aim> could result in <impact>" -> the <aim>, as an action.
  const m = text.match(/^Failure to\s+(.+?)\s+could result in\s+/i);
  let out = m ? m[1].trim() : text;

  out = out.charAt(0).toUpperCase() + out.slice(1);

  // Clip at a word boundary so the whole activity reads on one short line.
  const MAX = 72;
  if (out.length > MAX) {
    const cut = out.slice(0, MAX);
    const i = cut.lastIndexOf(" ");
    out = (i > 40 ? cut.slice(0, i) : cut).trim();
  }
  return out.replace(/[.;,]+$/, "") + ".";
}

const RESIDUAL_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };

/** Highest-residual-risk control in a domain (drives the AI-focus line). */
function pickWorstControl(controls) {
  return [...controls].sort(
    (a, b) =>
      (RESIDUAL_RANK[b.residualRisk] || 0) - (RESIDUAL_RANK[a.residualRisk] || 0) ||
      b.violations - a.violations ||
      b.exceptions - a.exceptions,
  )[0];
}

/**
 * Crisp, UK-relevant AI-focus pair (problem + action), phrased like Indian
 * Process Audit v3 — a short finding with a count and a concrete next step —
 * instead of the raw "Failure to … could result in …" risk statement.
 */
function crispCardIntel(worst) {
  if (!worst) {
    return {
      topIssue: "No material exceptions this cycle.",
      action: "Maintain BAU testing cadence across the domain.",
    };
  }
  const cid = worst.controlId;
  const n = worst.violations > 0 ? worst.violations : worst.exceptions;
  const cases = `${n} case${n === 1 ? "" : "s"}`;
  const step = (worst.sopStep || "").toLowerCase();

  const rules = [
    [/sar|suspicious|nominated officer|disclosure to nca/, `SARs filed outside the statutory window on ${cases}`, "Submit outstanding SARs to the NCA and brief the MLRO."],
    [/sanction|interdiction|watchlist/, `Sanctions & PEP screening misses on ${cases}`, `Clear the ${cid} true-match backlog; freeze funds and notify OFSI.`],
    [/pep|adverse.?media/, `PEP / adverse-media screening gaps on ${cases}`, "Re-screen relationships and evidence dispositions."],
    [/transaction.?monitor|\balert\b/, `Monitoring alerts breaching SLA on ${cases}`, `Clear the ${cid} alert backlog and evidence escalations.`],
    [/policy|framework|governance|\bmlro\b/, `AML policy & control-framework gaps on ${cases}`, "Refresh policies and confirm MLRO approval on file."],
    [/risk assessment|\bbwra\b|profil|risk.?rat/, `Financial-crime risk-assessment gaps on ${cases}`, "Update the risk assessment and re-tier customers."],
    [/ubo|beneficial|ownership/, `UBO ownership unverified on ${cases}`, "Obtain UBO evidence for >25% owners and update records."],
    [/edd|enhanced|source of|high.?risk/, `EDD incomplete on ${cases}`, "Complete EDD and source-of-funds; obtain approver sign-off."],
    [/identity|\bcdd\b|\bkyc\b|verif/, `CDD / identity verification gaps on ${cases}`, "Re-verify identities and complete CDD before activation."],
    [/afford|creditworth|underwrit/, `Underwriting / affordability breaches on ${cases}`, "Validate affordability to policy; log approved deviations."],
    [/collateral|valuation|security/, `Collateral valuation gaps on ${cases}`, "Obtain independent valuations and perfect security."],
    [/overdraft|limit management|\blimit\b|exposure/, `Overdraft / limit-management control gaps on ${cases}`, "Re-check limit approvals and evidence utilisation reviews."],
    [/forbearance|arrears|vulnerab|difficulty/, `Forbearance & vulnerability-handling gaps on ${cases}`, "Apply forbearance policy; evidence affordability & vulnerability."],
    [/impair|provision|\bifrs\b|\becl\b/, `Impairment / IFRS 9 provisioning gaps on ${cases}`, "Recalculate ECL provisions and reconcile to the general ledger."],
    [/write.?off|charge.?off|debt sale|recover/, `Write-off & recovery control gaps on ${cases}`, "Evidence write-off approvals and reconcile recoveries."],
    [/complaint|final response|\bfos\b|\bdisp\b/, `DISP final-response deadlines breached on ${cases}`, "Clear the complaint backlog; evidence root-cause and redress."],
    [/remediation|past.?business|thematic|redress/, `Mass-remediation scoping gaps on ${cases}`, "Confirm the population and re-run redress with attestation."],
    [/confirmation of payee|\bcop\b/, `Confirmation of Payee mismatches on ${cases}`, "Action CoP warnings before release and retain evidence."],
    [/reconcil|nostro|settlement|suspense|clearing/, `Reconciliation breaks aged beyond tolerance on ${cases}`, `Clear the ${cid} breaks and evidence sign-off.`],
    [/safeguard|segregat|e.?money|client money/, `Client-money safeguarding shortfalls on ${cases}`, "Reconcile safeguarding accounts and confirm segregation."],
    [/authentication|\bsca\b|fraud|scam|mule|reimburs/, `Fraud / APP-scam controls failing on ${cases}`, "Apply PSR reimbursement rules and evidence outcomes."],
    [/dormant|\bscv\b|depositor|fscs/, `Depositor-protection / SCV data gaps on ${cases}`, "Correct the SCV file and confirm FSCS eligibility."],
    [/mandate|standing data|maintenance|servicing/, `Account-servicing / mandate control gaps on ${cases}`, "Re-verify mandates and evidence standing-data changes."],
    [/report|return|\bmi\b|rep-|rep0/, `Regulatory reporting errors on ${cases}`, "Correct returns and reconcile to source systems."],
    [/consent|disclos|terms|consumer|communication/, `Consumer Duty disclosure gaps on ${cases}`, "Re-issue compliant disclosures and evidence delivery."],
    [/offboard|exit|closure|retention|record/, `Exit / records-retention gaps on ${cases}`, "Complete exit checks and retain records to policy."],
    [/eligibil|complete|intake|capture|application|\bdata\b/, `Application data & eligibility gaps on ${cases}`, "Re-capture missing data and re-run eligibility checks."],
  ];

  for (const [re, topIssue, action] of rules) {
    if (re.test(step)) return { topIssue: `${topIssue} (${cid})`, action };
  }

  return {
    topIssue: `Control failures at "${worst.sopStep}" on ${cases} (${cid})`,
    action: `Escalate ${cid}; expand the sample and open a finding.`,
  };
}

let cachedSnapshot = null;

export function getUkProcessAuditDataV2() {
  if (cachedSnapshot) return cachedSnapshot;

  const snap = getUkProcessAuditData();

  const DOMAINS = snap.domains; // includes { id: 'overview', ... } first
  const DOMAIN_IDS = DOMAINS.filter((d) => d.id !== "overview").map((d) => d.id);

  const CONTROLS_BY_DOMAIN = {};
  for (const id of DOMAIN_IDS) {
    CONTROLS_BY_DOMAIN[id] = (snap.controlsByDomain[id] || []).map(mapControl);
  }

  // Rewrite every SOP stage description into a crisp, Indian-v3-style activity
  // line (keeps the full risk statement out of the dense stage table).
  const SOP_BY_DOMAIN = Object.fromEntries(
    Object.entries(snap.sopByDomain).map(([domainId, sop]) => [
      domainId,
      {
        ...sop,
        stages: (sop.stages || []).map((stage) => ({
          ...stage,
          description: crispStageDescription(stage.description),
        })),
      },
    ]),
  );
  const CASES_BY_DOMAIN = snap.casesByDomain;
  const CASE_ENTITY = snap.entityByDomain;
  const JOURNEY_TITLE_BY_DOMAIN = snap.journeyTitleByDomain;
  const CONTROL_EXCEPTION_LABEL = snap.controlExceptionLabelById;
  const STAGE_SHORT_LABEL = {};

  const DOMAIN_AUDIT_META = {};
  for (const card of snap.domainCards) {
    // Crisp, UK-relevant AI-focus phrasing (Indian v3 style) derived from the
    // domain's worst control — overrides the verbose shared card text.
    const worst = pickWorstControl(snap.controlsByDomain[card.id] || []);
    const intel = crispCardIntel(worst);
    DOMAIN_AUDIT_META[card.id] = {
      owner: card.owner,
      topIssue: intel.topIssue,
      action: intel.action,
    };
  }

  const getJourneyStageHeader = (domainId, stage) =>
    (stage && stage.header) ||
    (stage && stage.name
      ? stage.name.split(/\s+/).slice(0, 2).join(" ").slice(0, 12)
      : "");

  const getAuditorFocusForControl = (c) => {
    if (c.exceptions === 0 && c.violations === 0) {
      return `No failing cases in the current test window for ${c.id}. Design and evidence trail support an effective rating; continue monitoring per audit plan.`;
    }
    return `${c.exceptions} case(s) failed ${c.id}${c.violations ? `, ${c.violations} classified critical` : ""}. Open the Evidence pack for the sampled reference IDs and management response.`;
  };

  // -------------------------------------------------------------------------
  // Header-level aggregates (mirrors Indian assembleSnapshot)
  // -------------------------------------------------------------------------

  const DOMAIN_SUMMARY = DOMAINS.filter((d) => d.id !== "overview").map((d) => {
    const ctrls = CONTROLS_BY_DOMAIN[d.id] || [];
    const avg = ctrls.length ? ctrls.reduce((s, c) => s + c.compliance, 0) / ctrls.length : 0;
    return {
      id: d.id,
      domain: d.label,
      color: d.color,
      controls: ctrls.length,
      compliance: Number(avg.toFixed(1)),
      violations: ctrls.reduce((s, c) => s + c.violations, 0),
      exceptions: ctrls.reduce((s, c) => s + c.exceptions, 0),
    };
  });

  const TOTAL_CONTROLS = DOMAIN_SUMMARY.reduce((s, d) => s + d.controls, 0);
  const TOTAL_VIOLATIONS = DOMAIN_SUMMARY.reduce((s, d) => s + d.violations, 0);
  const TOTAL_EXCEPTIONS = DOMAIN_SUMMARY.reduce((s, d) => s + d.exceptions, 0);
  const OVERALL_COMPLIANCE = (
    DOMAIN_SUMMARY.reduce((s, d) => s + d.compliance, 0) / DOMAIN_SUMMARY.length
  ).toFixed(1);

  const AUDIT_CYCLE = {
    cycle: "Q1 FY 2026 Internal Audit",
    periodLabel: "01 Apr – 30 Jun 2026",
    lastRefresh: "01 Jul 2026, 09:12 BST",
    status: "Fieldwork in progress",
    reportDue: "18 Jul 2026",
  };

  const _hash = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const DOMAIN_CASE_SUMMARY = Object.fromEntries(
    Object.entries(CASES_BY_DOMAIN).map(([domainId, cases]) => {
      const clean = cases.filter((k) => k.overallStatus === "compliant").length;
      const failed = cases.filter((k) => k.overallStatus === "failure").length;
      const pending = cases.filter((k) => k.overallStatus === "pending").length;
      return [domainId, { total: cases.length, clean, failed, pending }];
    }),
  );

  const _scoredDomains = DOMAIN_SUMMARY.map((d) => {
    const ctrls = CONTROLS_BY_DOMAIN[d.id] || [];
    const caseStats = DOMAIN_CASE_SUMMARY[d.id] || { total: 0, clean: 0, failed: 0, pending: 0 };
    const tested = ctrls.filter((c) => Number(c.sample) > 0).length;
    const notTested = Math.max(0, ctrls.length - tested);
    const notMet = ctrls.filter((c) => c.status === "deficient" || c.violations >= 2).length;
    const review = ctrls.filter((c) => c.status === "needs-attention" && !(c.violations >= 2)).length;
    const met = Math.max(0, tested - notMet - review);
    const evidenceGaps = d.violations * 2 + ctrls.filter((c) => c.status === "needs-attention").length;
    const overdueRemediation = caseStats.failed + caseStats.pending;
    const repeatFindings = Math.max(0, Math.floor(d.violations / 2) + (_hash(d.id + "r") % 3));
    const severityScore = d.violations * 10 + overdueRemediation * 2 + evidenceGaps + repeatFindings * 3;
    return {
      ...d,
      tested,
      notTested,
      met,
      notMet,
      review,
      caseTotal: caseStats.total,
      caseClean: caseStats.clean,
      caseFailed: caseStats.failed,
      casePending: caseStats.pending,
      criticalDelta: caseStats.failed - caseStats.pending,
      overdueDelta: caseStats.pending - caseStats.clean,
      evidenceGaps,
      overdueRemediation,
      repeatFindings,
      severityScore,
      ...(DOMAIN_AUDIT_META[d.id] || { owner: "Audit Lead", topIssue: "—", action: "—" }),
    };
  });

  const _residualRankCutoffs = (n) => ({
    critical: Math.max(1, Math.floor(n * 0.3)),
    high: Math.max(1, Math.floor(n * 0.3)),
    medium: Math.max(1, Math.floor(n * 0.2)),
  });

  const _residualRiskById = (() => {
    const cuts = _residualRankCutoffs(_scoredDomains.length);
    const ranked = [..._scoredDomains].sort((a, b) => b.severityScore - a.severityScore);
    const map = new Map();
    ranked.forEach((d, i) => {
      const label =
        i < cuts.critical
          ? "Critical"
          : i < cuts.critical + cuts.high
            ? "High"
            : i < cuts.critical + cuts.high + cuts.medium
              ? "Medium"
              : "Low";
      map.set(d.id, label);
    });
    return map;
  })();

  const DOMAIN_AUDIT_VIEW = _scoredDomains.map((d) => ({
    ...d,
    residualRisk: _residualRiskById.get(d.id) || "Low",
  }));

  const stageMappedControls = (stage, controls) =>
    (stage.controlIds || []).map((cid) => controls.find((c) => c.id === cid)).filter(Boolean);

  const splitControlOutcomes = (mapped) => {
    let met = 0;
    let notMet = 0;
    let review = 0;
    for (const c of mapped) {
      if (c.status === "deficient" || c.violations >= 2) notMet += 1;
      else if (c.status === "needs-attention") review += 1;
      else met += 1;
    }
    return { met, notMet, review, total: mapped.length };
  };

  const ALL_PROCESS_ROWS = (() => {
    const rows = [];
    for (const domainId of Object.keys(SOP_BY_DOMAIN)) {
      const sop = SOP_BY_DOMAIN[domainId];
      const controls = CONTROLS_BY_DOMAIN[domainId] || [];
      const domainLabel = DOMAIN_SUMMARY.find((x) => x.id === domainId)?.domain || domainId;
      for (const stage of sop.stages || []) {
        const mapped = stageMappedControls(stage, controls);
        const { met, notMet, review, total } = splitControlOutcomes(mapped);
        const tested = Math.max(1, total);
        const deficiency = Number(((notMet / tested) * 100).toFixed(1));
        const issues = mapped.reduce((s, c) => s + c.exceptions + c.violations, 0);
        const criticalIssues = mapped.reduce((s, c) => s + c.violations, 0);
        const processCompliance = total
          ? Number((mapped.reduce((s, c) => s + c.compliance, 0) / total).toFixed(1))
          : 100;
        rows.push({
          key: `${domainId}-${stage.id}`,
          domainId,
          domainLabel,
          processName: stage.name,
          sopName: sop.name,
          met,
          notMet,
          review,
          total,
          deficiency,
          issues,
          criticalIssues,
          processCompliance,
        });
      }
    }
    return rows;
  })();

  const DOMAIN_PROCESS_MAPPING_ROWS = DOMAIN_SUMMARY.map((d) => {
    const sop = SOP_BY_DOMAIN[d.id];
    const controls = CONTROLS_BY_DOMAIN[d.id] || [];
    const stages = sop?.stages || [];
    let sumStageComp = 0;
    for (const st of stages) {
      const mapped = stageMappedControls(st, controls);
      const comp = mapped.length ? mapped.reduce((s, c) => s + c.compliance, 0) / mapped.length : 100;
      sumStageComp += comp;
    }
    const processCompliance = stages.length ? Number((sumStageComp / stages.length).toFixed(1)) : 100;
    return {
      id: d.id,
      domain: d.domain,
      processes: stages.length,
      controls: d.controls,
      processCompliance,
      domainCompliance: d.compliance,
    };
  });

  const COVERAGE_COMPOSED_CHART_DATA = DOMAIN_AUDIT_VIEW.map((d) => ({
    name: d.domain.split(/[\/&]/)[0].trim().slice(0, 11),
    met: d.met,
    review: d.review,
    notMet: d.notMet,
    notTested: d.notTested,
    deficiency: d.tested > 0 ? Number(((d.notMet / d.tested) * 100).toFixed(1)) : 0,
    fullName: d.domain,
    domainId: d.id,
  }));

  const FINDINGS_SUMMARY_CHART_DATA = DOMAIN_AUDIT_VIEW.map((d) => ({
    name: d.domain.split(/[\/&]/)[0].trim().slice(0, 12),
    totalIssues: d.violations + d.exceptions,
    criticalFindings: d.violations,
    domainId: d.id,
    fullDomain: d.domain,
  }));

  const MAX_ISSUE_PROCESS_ROW = ALL_PROCESS_ROWS.reduce(
    (best, r) => (r.issues > (best?.issues ?? -1) ? r : best),
    null,
  );

  const TOP_CRITICAL_PROCESS_NAMES = [...ALL_PROCESS_ROWS]
    .sort((a, b) => b.criticalIssues - a.criticalIssues || b.issues - a.issues)
    .slice(0, 4)
    .map((r) => `${r.processName} (${r.domainLabel.split(/[\/&]/)[0].trim()})`);

  const AUDIT_TOTALS = DOMAIN_AUDIT_VIEW.reduce(
    (a, d) => ({
      controls: a.controls + d.controls,
      tested: a.tested + d.tested,
      notTested: a.notTested + d.notTested,
      met: a.met + d.met,
      review: a.review + d.review,
      notMet: a.notMet + d.notMet,
      critical: a.critical + d.violations,
      evidenceGaps: a.evidenceGaps + d.evidenceGaps,
      overdue: a.overdue + d.overdueRemediation,
      repeat: a.repeat + d.repeatFindings,
      exceptions: a.exceptions + d.exceptions,
    }),
    { controls: 0, tested: 0, notTested: 0, met: 0, review: 0, notMet: 0, critical: 0, evidenceGaps: 0, overdue: 0, repeat: 0, exceptions: 0 },
  );

  const EVIDENCE_MISSING_COUNT = DOMAIN_SUMMARY.reduce(
    (n, d) => n + (CONTROLS_BY_DOMAIN[d.id] || []).filter((c) => c.status === "deficient").length,
    0,
  );

  const RESIDUAL_RISK_OVERALL = DOMAIN_AUDIT_VIEW.some((d) => d.residualRisk === "Critical")
    ? "Critical"
    : DOMAIN_AUDIT_VIEW.some((d) => d.residualRisk === "High")
      ? "High"
      : DOMAIN_AUDIT_VIEW.some((d) => d.residualRisk === "Medium")
        ? "Medium"
        : "Low";

  const RESIDUAL_RISK_TONE = {
    Critical: { text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200", dot: "bg-red-500" },
    High: { text: "text-orange-700", bg: "bg-orange-50", ring: "ring-orange-200", dot: "bg-orange-500" },
    Medium: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
    Low: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  };

  const toOneLineSolution = (raw, maxLen = 118) => {
    const t = String(raw || "").replace(/\s+/g, " ").trim();
    if (!t) return "—";
    if (t.length <= maxLen) return t;
    const cut = t.slice(0, maxLen);
    const i = cut.lastIndexOf(" ");
    return `${(i > 32 ? cut.slice(0, i) : cut).trim()}…`;
  };

  const SEVERITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const severityToTone = (sev) =>
    sev === "Critical" ? "critical" : sev === "High" ? "high" : sev === "Medium" ? "medium" : "low";

  const AI_AUDIT_INTEL = (() => {
    const ranked = [...DOMAIN_AUDIT_VIEW].sort((a, b) => {
      const s = SEVERITY_RANK[a.residualRisk] - SEVERITY_RANK[b.residualRisk];
      return s !== 0
        ? s
        : b.violations * 10 + b.overdueRemediation - (a.violations * 10 + a.overdueRemediation);
    });
    const findings = ranked.map((d) => {
      const severity = d.residualRisk;
      return {
        id: d.id,
        domainId: d.id,
        severity,
        tone: severityToTone(severity),
        title: d.topIssue,
        solution: toOneLineSolution(d.action, 150),
        fullSolution: d.action,
      };
    });
    const severityCounts = findings.reduce(
      (acc, f) => ({ ...acc, [f.severity]: (acc[f.severity] || 0) + 1 }),
      { Critical: 0, High: 0, Medium: 0, Low: 0 },
    );
    return { findings, severityCounts };
  })();

  // -------------------------------------------------------------------------
  // Evidence pack — identical structure for every control (UK context)
  // -------------------------------------------------------------------------

  const findStagesForControl = (ctrlId) => {
    const results = [];
    Object.entries(SOP_BY_DOMAIN).forEach(([domainId, sop]) => {
      sop.stages.forEach((stage) => {
        if (stage.controlIds.includes(ctrlId)) {
          results.push({ domainId, sopName: sop.name, stage });
        }
      });
    });
    return results;
  };

  const findCasesForControl = (ctrlId) => {
    const out = [];
    Object.entries(CASES_BY_DOMAIN).forEach(([, kases]) => {
      kases.forEach((k) => {
        const hit = k.trail.find((t) => t.stage.controlIds.includes(ctrlId));
        if (hit) out.push({ kase: k, hit });
      });
    });
    const order = { failure: 0, pending: 1, compliant: 2 };
    out.sort((a, b) => order[a.kase.overallStatus] - order[b.kase.overallStatus]);
    return out.slice(0, 4);
  };

  const buildEvidence = (ctrl, domainLabel) => ({
    control: ctrl,
    domainLabel,
    stageSubmitters: findStagesForControl(ctrl.id),
    sampleCaseTrails: findCasesForControl(ctrl.id),
    lastTested: ctrl.lastTested || "12 Jun 2026",
    tester: ctrl.tester || "A. Whitfield (IA — Senior Manager)",
    testingSteps: [
      `Identified the ${ctrl.population.toLocaleString("en-GB")} in-scope cases required to satisfy this control during the Q1 FY26 window (01 Apr – 30 Jun 2026). Every case — not a sample — must carry evidence on file for this control.`,
      `For each case, traced the SOP stage where this control fires and identified the accountable role responsible for submitting evidence at that stage.`,
      `Reconciled evidence submissions against source systems (Core Banking, LOS/CRM, IAM/AD, payment rails and SIEM) for all cases; flagged cases where evidence was missing, rejected or late.`,
      `Categorised each flagged case as Failed (control did not pass) or Critical Failure (additionally breaches a specific FCA / PRA / regulatory line). Discussed root cause with each accountable owner.`,
    ],
    exceptionLog: [
      { ref: `${ctrl.id}-EX-001`, detail: `Sampled record missing approver sign-off`, severity: ctrl.violations > 0 ? "Critical" : "Medium", owner: ctrl.owner, sla: "Breached", action: "Raised to management for remediation" },
      { ref: `${ctrl.id}-EX-002`, detail: `System entry dated prior to supporting document`, severity: "High", owner: ctrl.owner, sla: "Breached", action: "Corrective entry booked" },
      { ref: `${ctrl.id}-EX-003`, detail: `Override applied but justification field blank`, severity: "Medium", owner: ctrl.owner, sla: "Within SLA", action: "Documentation updated" },
      { ref: `${ctrl.id}-EX-004`, detail: `Periodic review not on file for sampled account`, severity: "Medium", owner: ctrl.owner, sla: "Breached", action: "Review recompleted; added to tracker" },
    ].slice(0, Math.max(1, Math.min(ctrl.exceptions, 4))),
    sourceSystems: [
      { name: "Core Banking — Temenos / FIS", record: `${ctrl.population.toLocaleString("en-GB")} in-scope cases reconciled` },
      { name: "LOS / CRM", record: "Workflow logs and approver timestamps extracted for every case" },
      { name: "IAM / Active Directory", record: "Evidence submitter (role + staff ID) attributed for every case" },
      { name: "SIEM (Splunk)", record: "Event logs reconciled end-to-end for every case" },
    ],
    documents: [
      { name: `${ctrl.id}_Control_Design_v2.pdf`, type: "PDF", size: "312 KB" },
      { name: `${ctrl.id}_Sample_Workpaper.xlsx`, type: "XLSX", size: "1.4 MB" },
      { name: `${ctrl.id}_Exception_Log.csv`, type: "CSV", size: "84 KB" },
      { name: `${ctrl.id}_Management_Signoff.pdf`, type: "PDF", size: "228 KB" },
    ],
    auditorNote:
      ctrl.status === "deficient"
        ? `Control is assessed as DEFICIENT. ${ctrl.exceptions} exceptions observed (${ctrl.violations} critical). Root cause lies in process adherence and system workflow gaps. Recommended to be remediated within 30 days with verification testing.`
        : ctrl.status === "needs-attention"
          ? `Control is OPERATING BUT WITH DEVIATIONS. ${ctrl.exceptions} exceptions (${ctrl.violations} critical). Management has acknowledged; remediation plan targeted within the current quarter.`
          : `Control is OPERATING EFFECTIVELY. Exceptions (${ctrl.exceptions}) within acceptable threshold; no systemic weakness identified.`,
    mgmtResponse:
      ctrl.status === "deficient"
        ? `Accepted. Control owner to deliver corrective action plan within 15 days; re-testing in next audit cycle.`
        : ctrl.status === "needs-attention"
          ? `Accepted with partial agreement. Additional monitoring added to the QRR pack; target closure by quarter-end.`
          : `Noted. Will continue existing monitoring cadence.`,
  });

  cachedSnapshot = {
    DOMAINS,
    CONTROLS_BY_DOMAIN,
    SOP_BY_DOMAIN,
    CASES_BY_DOMAIN,
    CASE_ENTITY,
    JOURNEY_TITLE_BY_DOMAIN,
    STAGE_SHORT_LABEL,
    getJourneyStageHeader,
    CONTROL_EXCEPTION_LABEL,
    getAuditorFocusForControl,
    buildEvidence,
    DOMAIN_SUMMARY,
    TOTAL_CONTROLS,
    TOTAL_VIOLATIONS,
    TOTAL_EXCEPTIONS,
    OVERALL_COMPLIANCE,
    AUDIT_CYCLE,
    DOMAIN_AUDIT_META,
    DOMAIN_AUDIT_VIEW,
    DOMAIN_PROCESS_MAPPING_ROWS,
    ALL_PROCESS_ROWS,
    COVERAGE_COMPOSED_CHART_DATA,
    FINDINGS_SUMMARY_CHART_DATA,
    MAX_ISSUE_PROCESS_ROW,
    TOP_CRITICAL_PROCESS_NAMES,
    AUDIT_TOTALS,
    EVIDENCE_MISSING_COUNT,
    RESIDUAL_RISK_OVERALL,
    RESIDUAL_RISK_TONE,
    AI_AUDIT_INTEL,
  };
  return cachedSnapshot;
}

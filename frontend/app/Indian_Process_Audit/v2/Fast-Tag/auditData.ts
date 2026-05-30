import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import { FASTAG_DOMAIN_META } from './fastTagAuditContent';
import { finalizeFastTagControl, type FastTagControlSeed } from './fastTagMetrics';
import {
  buildFastTagCaseJourney,
  type FastTagSop,
} from './fastTagCaseBuilder';
import { buildFastTagCasePool } from './fastTagCasePool';
import { INDIA_STATE_NAME_TO_RTO } from './indiaStateRto';

export const FASTAG_DOMAIN_ID = 'fasttag';

export const FASTAG_ENTITY = {
  singular: 'Issuance case',
  plural: 'Issuance cases',
  entity: 'FASTag issuance',
};

export const FASTAG_JOURNEY_TITLE =
  'FASTAG ISSUANCE JOURNEY — STAGE-WISE CONTROL COMPLIANCE';

/** National scope heading in summary panel (was “All India”). */
export const FASTAG_INDIA_SCOPE_HEADING = 'India';

/** Map control to select portfolio-wide scope (was “All India”). */
export const FASTAG_OVERALL_SCOPE_BUTTON = 'Overall';

export const FASTAG_STAGE_SHORT: Record<string, string> = {
  intake: 'Eligibility',
  identity: 'OTP',
  kyc: 'KYC',
  ovt: 'Mapper',
  wallet: 'Wallet',
  issue: 'Issuance',
  fitment: 'Fitment',
  activate: 'Activation',
};

/** RTO state codes on VRN (subject line) → region label for journey filters / map tooltips. */
export const FASTAG_REGION_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(INDIA_STATE_NAME_TO_RTO).map(([name, code]) => [code, name]),
);

/** Parse RTO region code from case subject (e.g. "VRN MH12AB1234 …" → "MH"). */
export function getFastTagCaseRegion(kase: { subject?: string }): string | null {
  const m = kase.subject?.match(/VRN\s+([A-Z]{2})\d/i);
  return m ? m[1].toUpperCase() : null;
}

/** Table display — strip optional trailing state label from legacy subjects. */
export function getFastTagCaseDisplaySubject(subject?: string): string {
  if (!subject) return '';
  return subject.replace(/\s+\([^)]+\)\s*$/, '').trim();
}

type FastTagCaseRegionLike = {
  subject?: string;
  trail?: { status: string }[];
};

/** All issuance cases per RTO code (for region map volume). */
export function getFastTagRegionCaseCounts(cases: FastTagCaseRegionLike[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const kase of cases) {
    const code = getFastTagCaseRegion(kase);
    if (code) counts[code] = (counts[code] ?? 0) + 1;
  }
  return counts;
}

/** Failed issuance cases per RTO code (for map tooltips / drill-down context). */
export function getFastTagRegionFailedCounts(
  cases: FastTagCaseRegionLike[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const kase of cases) {
    const code = getFastTagCaseRegion(kase);
    if (!code) continue;
    if (kase.trail?.some((t) => t.status === 'rejected' || t.status === 'pending')) {
      counts[code] = (counts[code] ?? 0) + 1;
    }
  }
  return counts;
}

export function getFastTagRegionFilterOptions(
  cases: { subject?: string }[],
): { id: string; label: string }[] {
  const codes = new Set<string>();
  for (const kase of cases) {
    const code = getFastTagCaseRegion(kase);
    if (code) codes.add(code);
  }
  return [...codes]
    .sort((a, b) => (FASTAG_REGION_LABEL[a] ?? a).localeCompare(FASTAG_REGION_LABEL[b] ?? b))
    .map((code) => ({
      id: code,
      label: FASTAG_REGION_LABEL[code] ? `${FASTAG_REGION_LABEL[code]} (${code})` : code,
    }));
}

export const FASTAG_CONTROL_EXCEPTION_LABEL: Record<string, string> = {
  'FT-01': 'OV1T / mapper gap',
  'FT-02': 'VRN / blacklist',
  'FT-03': 'OTP / Aadhaar',
  'FT-04': 'CKYCR / PAN',
  'FT-05': 'Class / axle',
  'FT-06': 'Wallet load',
  'FT-07': 'Payment rail',
  'FT-08': 'EPC / issuance',
  'FT-09': 'Fitment QA',
  'FT-10': 'NETC activation',
  'FT-11': 'Settlement break',
  'FT-12': 'Dispute SLA',
};

const CONTROL_SEEDS: FastTagControlSeed[] = [
  {
    id: 'FT-01',
    name: 'NPCI OV1T & NETC mapper reconciliation',
    objective:
      'Every VRN is checked against OV1T before mapper update; duplicate / active tag on vehicle is blocked.',
    regulatory: 'NPCI FASTag Procedural Guidelines, NETC Operating Procedure',
    owner: 'FASTag Operations',
    frequency: 'Continuous',
    population: 18420,
    sample: 200,
    exceptions: 11,
    violations: 3,
  },
  {
    id: 'FT-02',
    name: 'VRN validation & blacklist enforcement',
    objective: 'VRN format, RC linkage, and issuer blacklist are validated before tag reservation.',
    regulatory: 'MoRTH VAHAN integration norms, Internal SOP-FT-002',
    owner: 'Channel Operations',
    frequency: 'Continuous',
    population: 18420,
    sample: 180,
    exceptions: 6,
    violations: 1,
  },
  {
    id: 'FT-03',
    name: 'Mobile OTP & Aadhaar-linked identity',
    objective: 'OTP verified on registered mobile; Aadhaar / VID linkage where mandated for KYC tier.',
    regulatory: 'RBI KYC Master Direction, UIDAI Aadhaar Act',
    owner: 'Digital Channels',
    frequency: 'Continuous',
    population: 18420,
    sample: 200,
    exceptions: 8,
    violations: 2,
  },
  {
    id: 'FT-04',
    name: 'CKYCR / PAN / address verification',
    objective: 'KYC pack complete in CKYCR; PAN verified; address proof within policy.',
    regulatory: 'RBI KYC Master Direction, PMLA Rules',
    owner: 'KYC Operations',
    frequency: 'Continuous',
    population: 18420,
    sample: 200,
    exceptions: 14,
    violations: 4,
  },
  {
    id: 'FT-05',
    name: 'Vehicle class & axle-count eligibility',
    objective: 'Tag class matches registered vehicle category; commercial axle rules applied.',
    regulatory: 'NHAI Fee Rules, NPCI tag-class matrix',
    owner: 'FASTag Operations',
    frequency: 'Continuous',
    population: 18420,
    sample: 150,
    exceptions: 5,
    violations: 1,
  },
  {
    id: 'FT-06',
    name: 'Wallet minimum balance & load reconciliation',
    objective: 'Minimum balance enforced; wallet credit reconciled to payment gateway within T+1.',
    regulatory: 'RBI PPI Guidelines, Internal SOP-FT-006',
    owner: 'Payments',
    frequency: 'Daily',
    population: 16240,
    sample: 180,
    exceptions: 9,
    violations: 2,
  },
  {
    id: 'FT-07',
    name: 'Payment channel controls (UPI / NEFT / RTGS / net banking)',
    objective: 'Load transactions authenticated; failed debits reversed; channel limits enforced.',
    regulatory: 'RBI Payment System Guidelines, UPI Procedural Guidelines',
    owner: 'Payments',
    frequency: 'Continuous',
    population: 16240,
    sample: 200,
    exceptions: 7,
    violations: 2,
  },
  {
    id: 'FT-08',
    name: 'Tag issuance & EPC mapping',
    objective: 'Unique EPC generated; tag ID mapped to wallet and VRN before dispatch.',
    regulatory: 'NPCI FASTag Technical Spec, ISO 18000-6C',
    owner: 'Tag Lifecycle',
    frequency: 'Continuous',
    population: 17800,
    sample: 160,
    exceptions: 4,
    violations: 1,
  },
  {
    id: 'FT-09',
    name: 'Tag fitment proof & RFID QA',
    objective: 'Fitment photograph / installer attestation on file; RFID read test within 48h.',
    regulatory: 'Issuer fitment policy, NHAI installation guidelines',
    owner: 'Field Operations',
    frequency: 'Daily',
    population: 17800,
    sample: 140,
    exceptions: 12,
    violations: 3,
  },
  {
    id: 'FT-10',
    name: 'NETC activation & blacklist sync',
    objective: 'Tag activated on NETC only after fitment; deactivation / hotlist sync within SLA.',
    regulatory: 'NETC Operating Procedure, NPCI exception handling',
    owner: 'NETC Operations',
    frequency: 'Continuous',
    population: 17800,
    sample: 180,
    exceptions: 6,
    violations: 2,
  },
  {
    id: 'FT-11',
    name: 'Toll settlement & chargeback',
    objective: 'Toll debits reconciled to plaza files; chargebacks resolved within network TAT.',
    regulatory: 'NPCI settlement cycle, RBI Harmonisation of TAT',
    owner: 'Reconciliation',
    frequency: 'Daily',
    population: 4200000,
    sample: 220,
    exceptions: 18,
    violations: 5,
    status: 'deficient',
    compliance: 91.2,
  },
  {
    id: 'FT-12',
    name: 'Customer dispute & exception handling',
    objective: 'Wrong debits / double charges logged; refund or reversal within committed SLA.',
    regulatory: 'RBI Ombudsman Scheme, Internal SOP-FT-012',
    owner: 'Customer Care',
    frequency: 'Continuous',
    population: 2840,
    sample: 120,
    exceptions: 8,
    violations: 2,
  },
];

export const FASTAG_CONTROLS: AuditControl[] = CONTROL_SEEDS.map(finalizeFastTagControl);

export const FASTAG_SOP: FastTagSop = {
  name: 'FASTag Issuance & Toll Lifecycle SOP',
  purpose:
    'End-to-end issuer process — every FASTag issuance must clear eligibility, identity, KYC, OV1T, wallet load, issuance, fitment, and NETC activation before toll use · Post-activation toll settlement and disputes in scope for FT-11 / FT-12.',
  stages: [
    {
      id: 'intake',
      name: 'Eligibility',
      description: 'Vehicle type, issuer policy, and customer consent captured.',
      controlIds: ['FT-02', 'FT-05'],
      owner: {
        role: 'Branch / Digital Agent',
        team: 'Retail & Digital Channels',
        submits: 'Consent artefact, vehicle class selection, policy acknowledgement',
      },
    },
    {
      id: 'identity',
      name: 'OTP',
      description: 'Registered mobile verified; session bound to customer.',
      controlIds: ['FT-03'],
      owner: {
        role: 'OTP Gateway',
        team: 'Digital Channels',
        submits: 'OTP success log, device fingerprint, session ID',
      },
    },
    {
      id: 'kyc',
      name: 'KYC',
      description: 'PAN, CKYCR pull, address proof within RBI KYC norms.',
      controlIds: ['FT-04'],
      owner: {
        role: 'KYC Analyst',
        team: 'KYC Operations',
        submits: 'CKYCR record, PAN verification, address proof pack',
      },
    },
    {
      id: 'ovt',
      name: 'Mapper',
      description: 'NPCI OV1T check; NETC mapper updated or conflict escalated.',
      controlIds: ['FT-01', 'FT-02'],
      owner: {
        role: 'NETC Ops Officer',
        team: 'FASTag Operations',
        submits: 'OV1T response XML, mapper status, conflict ticket (if any)',
      },
    },
    {
      id: 'wallet',
      name: 'Wallet',
      description: 'Minimum balance loaded via approved payment rail.',
      controlIds: ['FT-06', 'FT-07'],
      owner: {
        role: 'Payments Officer',
        team: 'Payments',
        submits: 'Payment confirmation, gateway recon, wallet ledger entry',
      },
    },
    {
      id: 'issue',
      name: 'Issuance',
      description: 'EPC generated; tag ID linked to wallet and VRN.',
      controlIds: ['FT-08'],
      owner: {
        role: 'Tag Lifecycle System',
        team: 'Tag Lifecycle',
        submits: 'Tag ID, EPC mapping, dispatch manifest',
      },
    },
    {
      id: 'fitment',
      name: 'Fitment',
      description: 'Installer attestation; RFID read test recorded.',
      controlIds: ['FT-09'],
      owner: {
        role: 'Field Installer',
        team: 'Field Operations',
        submits: 'Fitment photo, installer ID, RFID read log',
      },
    },
    {
      id: 'activate',
      name: 'Activation',
      description: 'Tag activated on NETC; settlement profile live; disputes logged.',
      controlIds: ['FT-10', 'FT-11', 'FT-12'],
      owner: {
        role: 'NETC Activation Desk',
        team: 'NETC Operations',
        submits: 'Activation ACK, plaza test debit (if sampled), dispute register link',
      },
    },
  ],
};

const CASE_POOL = buildFastTagCasePool();

export const FASTAG_CASES = CASE_POOL.map((c) =>
  buildFastTagCaseJourney(c, FASTAG_SOP, FASTAG_CONTROLS),
);

export function getFastTagStageHeader(stage: { id: string; name: string }) {
  return FASTAG_STAGE_SHORT[stage.id] || stage.name.split(/\s+/).slice(0, 2).join(' ').slice(0, 12);
}

function summarizeCases() {
  const clean = FASTAG_CASES.filter((k) => k.overallStatus === 'compliant').length;
  const failed = FASTAG_CASES.filter((k) => k.overallStatus === 'failure').length;
  const pending = FASTAG_CASES.filter((k) => k.overallStatus === 'pending').length;
  return { total: FASTAG_CASES.length, clean, failed, pending };
}

/** Overview audit card (v2) — same shape as DOMAIN_AUDIT_VIEW rows. */
export function getFastTagDomainAuditCard() {
  const caseStats = summarizeCases();
  const avgCompliance = Number(
    (FASTAG_CONTROLS.reduce((s, c) => s + c.compliance, 0) / FASTAG_CONTROLS.length).toFixed(1),
  );
  const violations = FASTAG_CONTROLS.reduce((s, c) => s + c.violations, 0);
  const exceptions = FASTAG_CONTROLS.reduce((s, c) => s + c.exceptions, 0);
  const tested = FASTAG_CONTROLS.filter((c) => c.sample > 0).length;
  const notMet = FASTAG_CONTROLS.filter((c) => c.status === 'deficient' || c.violations >= 2).length;
  const review = FASTAG_CONTROLS.filter(
    (c) => c.status === 'needs-attention' && !(c.violations >= 2),
  ).length;
  const met = Math.max(0, tested - notMet - review);
  const overdueRemediation = caseStats.failed + caseStats.pending;
  const evidenceGaps = violations * 2 + review;
  const severityScore = violations * 10 + overdueRemediation * 2 + evidenceGaps + 4;

  const residualRisk =
    severityScore > 80 ? 'Critical' : severityScore > 55 ? 'High' : severityScore > 35 ? 'Medium' : 'Low';

  return {
    id: 'fast-tag' as const,
    domain: 'Fast-Tag',
    color: '#f97316',
    controls: FASTAG_CONTROLS.length,
    compliance: avgCompliance,
    violations,
    exceptions,
    tested,
    notTested: Math.max(0, FASTAG_CONTROLS.length - tested),
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
    repeatFindings: 2,
    severityScore,
    residualRisk,
    owner: FASTAG_DOMAIN_META.owner,
    topIssue: FASTAG_DOMAIN_META.topIssue,
    action: FASTAG_DOMAIN_META.action,
  };
}

export function getFastTagProcessMappingRow() {
  const stages = FASTAG_SOP.stages;
  let sumStageComp = 0;
  for (const st of stages) {
    const mapped = st.controlIds
      .map((cid) => FASTAG_CONTROLS.find((c) => c.id === cid))
      .filter(Boolean) as AuditControl[];
    const comp = mapped.length
      ? mapped.reduce((s, c) => s + c.compliance, 0) / mapped.length
      : 100;
    sumStageComp += comp;
  }
  const processCompliance = stages.length
    ? Number((sumStageComp / stages.length).toFixed(1))
    : 100;
  const domainCompliance = Number(
    (FASTAG_CONTROLS.reduce((s, c) => s + c.compliance, 0) / FASTAG_CONTROLS.length).toFixed(1),
  );
  return {
    id: 'fast-tag' as const,
    domain: 'Fast-Tag',
    processes: stages.length,
    controls: FASTAG_CONTROLS.length,
    processCompliance,
    domainCompliance,
  };
}

/** Map each control to Overview-style severity (for the residual strip). */
function classifyFastTagControlSeverity(
  c: AuditControl,
): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (c.status === 'deficient' || c.violations >= 3) return 'Critical';
  if (c.violations >= 2 || (c.status === 'needs-attention' && c.compliance < 93)) return 'High';
  if (c.status === 'needs-attention') return 'Medium';
  return 'Low';
}

export function getFastTagSeverityCounts() {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const c of FASTAG_CONTROLS) {
    counts[classifyFastTagControlSeverity(c)] += 1;
  }
  return counts;
}

/** Same shape as Overview `ResidualRiskBanner` — domain compliance + control severity counts. */
export function getFastTagOverviewStrip() {
  const card = getFastTagDomainAuditCard();
  return {
    compliance: card.compliance,
    severityCounts: getFastTagSeverityCounts(),
    posture: card.residualRisk,
  };
}

export function getFastTagAuditBundle() {
  return {
    domainId: FASTAG_DOMAIN_ID,
    domainLabel: 'Fast-Tag',
    controls: FASTAG_CONTROLS,
    sop: FASTAG_SOP,
    cases: FASTAG_CASES,
    entity: FASTAG_ENTITY,
    journeyTitle: FASTAG_JOURNEY_TITLE,
    getStageHeader: getFastTagStageHeader,
    controlExceptionLabels: FASTAG_CONTROL_EXCEPTION_LABEL,
  };
}

export const FASTAG_CONTROL_COUNT = FASTAG_CONTROLS.length;

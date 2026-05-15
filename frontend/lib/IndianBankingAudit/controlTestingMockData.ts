/**
 * Control Testing Workbench — mock control universe (ORI Pass 8).
 *
 * Source of truth for `linked_controls` / `linked_control_ces` referenced inside
 * `regIntelMockData.ts`. Adding / renaming a control here without keeping
 * `linked_controls` in step will produce orphan obligations in Obligation Coverage.
 */

export type ControlDomain =
  | 'AML / KYC'
  | 'AML / STR'
  | 'Cyber / IT Risk'
  | 'Digital Lending'
  | 'Payments / UPI'
  | 'Forex / LRS'
  | 'Regulatory Framework'
  | 'Internal Audit';

export type ControlFrequency =
  | 'transactional'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'annual';

export type ControlTestStatus =
  | 'effective'
  | 'partial'
  | 'ineffective'
  | 'in_testing'
  | 'overdue';

export type ControlTestRunResult = 'pass' | 'pass_with_exception' | 'fail';

export interface ControlTestRun {
  id: string;
  test_date: string;
  tester: string;
  tester_role: string;
  sample_size: number;
  exceptions: number;
  evidence_count: number;
  result: ControlTestRunResult;
  narrative: string;
}

export interface ControlPreventiveAction {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  due_date: string;
  owner: string;
}

export interface ControlRecord {
  id: string;
  name: string;
  design_statement: string;
  domain: ControlDomain;
  /** 1LoD — control owner (operations) */
  owner_1lod: string;
  owner_1lod_role: string;
  /** 2LoD — independent control tester (ORM) */
  tester_2lod: string;
  tester_2lod_role: string;
  frequency: ControlFrequency;
  /** Sample size for the most recent test run. */
  sample_size_latest: number;
  /** Control Effectiveness Score (0–100). */
  ces_current: number;
  /** Internal target. Below = remediation. */
  ces_target: number;
  /** 12-period CES trend (oldest → latest). */
  ces_history: number[];
  last_tested_at: string;
  next_due_at: string;
  status: ControlTestStatus;
  exceptions_ytd: number;
  evidence_freshness_days: number;
  test_runs: ControlTestRun[];
  preventive_actions: ControlPreventiveAction[];
  /** Free-text narrative shown on the detail panel. */
  testing_narrative: string;
}

export interface ControlKpiSummary {
  total_controls: number;
  avg_ces: number;
  below_target: number;
  in_testing: number;
  overdue: number;
  exceptions_ytd: number;
  obligations_linked: number;
}

/** Names reused from regIntelMockData reviewers / SMs so the universe feels coherent. */
const TESTER = {
  sophie: { name: 'Sophie Williams', role: 'Senior Control Tester · ORM' },
  marcus: { name: 'Marcus L.', role: 'Control Tester · ORM' },
  priya: { name: 'Priya Patel', role: 'Head of Financial Crime Compliance' },
  rahul: { name: 'Rahul Mehta', role: 'MLRO and Principal Officer' },
  vikram: { name: 'Vikram Nair', role: 'Chief Information Security Officer' },
  anjali: { name: 'Anjali Sharma', role: 'Head of Payments' },
  sandeep: { name: 'Sandeep Rao', role: 'Chief Risk Officer' },
};

const OWNER = {
  amlOps: { name: 'Suresh Iyer', role: 'AML Operations Lead' },
  kycOps: { name: 'Meera Joshi', role: 'KYC Operations Lead' },
  socLead: { name: 'Karthik Ram', role: 'SOC Lead' },
  cyberOps: { name: 'Divya Menon', role: 'Cyber Operations Lead' },
  paymentsOps: { name: 'Aakash Verma', role: 'Payments Operations Lead' },
  forexOps: { name: 'Neha Kapoor', role: 'Forex Operations Lead' },
  lendingOps: { name: 'Arun Pillai', role: 'Lending Operations Lead' },
  audit: { name: 'Sunil Bhatia', role: 'Internal Audit Lead' },
};

function statusFor(ces: number, target: number, lastTested: string): ControlTestStatus {
  const days = Math.floor((Date.now() - new Date(lastTested + 'T12:00:00').getTime()) / 86400000);
  if (days > 180) return 'overdue';
  if (ces >= target + 6) return 'effective';
  if (ces >= target - 4) return 'partial';
  return 'ineffective';
}

interface CtrlSeed {
  id: string;
  name: string;
  design_statement: string;
  domain: ControlDomain;
  owner: { name: string; role: string };
  tester: { name: string; role: string };
  frequency: ControlFrequency;
  sample_size_latest: number;
  ces_current: number;
  ces_target: number;
  ces_history: number[];
  last_tested_at: string;
  next_due_at: string;
  exceptions_ytd: number;
  evidence_freshness_days: number;
  testing_narrative: string;
  test_runs: Array<{
    test_date: string;
    tester: keyof typeof TESTER;
    sample_size: number;
    exceptions: number;
    evidence_count: number;
    result: ControlTestRunResult;
    narrative: string;
  }>;
  preventive_actions: ControlPreventiveAction[];
}

const SEED: CtrlSeed[] = [
  {
    id: 'AML-C001',
    name: 'Customer profile periodic-KYC refresh cycle',
    design_statement:
      'KYC Ops shall run a periodic-KYC refresh job that flags customer records due for KYC update within the rolling 12-month window and creates intimation events in the customer comms engine. The control evidences itself via a daily refresh-job log and a monthly reconciliation against core banking.',
    domain: 'AML / KYC',
    owner: OWNER.kycOps,
    tester: TESTER.sophie,
    frequency: 'monthly',
    sample_size_latest: 60,
    ces_current: 83,
    ces_target: 80,
    ces_history: [76, 77, 78, 79, 79, 80, 81, 81, 82, 82, 83, 83],
    last_tested_at: '2026-04-22',
    next_due_at: '2026-05-22',
    exceptions_ytd: 4,
    evidence_freshness_days: 23,
    testing_narrative:
      'Monthly walkthrough of the periodic-KYC refresh job for 60 sampled customers spread across low / medium / high-risk segments. All four exceptions in FY26 are timing breaks (intimation generated within 24h of the SLA deadline) — none are missed refreshes. Control is operating within tolerance; CES sits at 83 / target 80.',
    test_runs: [
      {
        test_date: '2026-04-22',
        tester: 'sophie',
        sample_size: 60,
        exceptions: 1,
        evidence_count: 60,
        result: 'pass_with_exception',
        narrative:
          '1 of 60 sampled customers had intimation generated 6 hours after the SLA midpoint. Root cause: comms-engine queue backlog. PA-2026-014 covers the queue scaling.',
      },
      {
        test_date: '2026-03-24',
        tester: 'sophie',
        sample_size: 60,
        exceptions: 0,
        evidence_count: 60,
        result: 'pass',
        narrative: 'Clean run. Periodic-KYC refresh executed for all sampled customers within SLA.',
      },
      {
        test_date: '2026-02-25',
        tester: 'marcus',
        sample_size: 50,
        exceptions: 1,
        evidence_count: 50,
        result: 'pass_with_exception',
        narrative:
          '1 of 50 sampled records: customer profile last-updated date missing in the refresh job log. Evidence reconstructed via core banking timestamp.',
      },
      {
        test_date: '2026-01-23',
        tester: 'sophie',
        sample_size: 50,
        exceptions: 1,
        evidence_count: 50,
        result: 'pass_with_exception',
        narrative:
          '1 of 50: intimation channel fallback path triggered (SMS unavailable → email). Within design tolerance.',
      },
      {
        test_date: '2025-12-22',
        tester: 'sophie',
        sample_size: 50,
        exceptions: 1,
        evidence_count: 50,
        result: 'pass_with_exception',
        narrative: 'Year-end timing exception: one record processed on T+1 due to bank holiday batch window.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2026-014',
        title: 'Scale comms-engine queue for peak periodic-KYC windows',
        status: 'in_progress',
        due_date: '2026-06-15',
        owner: 'Meera Joshi',
      },
    ],
  },
  {
    id: 'AML-C002',
    name: 'STR investigation lifecycle and FINgate submission',
    design_statement:
      'AML Ops shall close each STR investigation within 7 working days of suspicion confirmation, attach the structured narrative dataset, and submit via FINgate 2.0. MLRO reviews a sample of 25 STR files monthly and signs the FINgate batch.',
    domain: 'AML / STR',
    owner: OWNER.amlOps,
    tester: TESTER.priya,
    frequency: 'monthly',
    sample_size_latest: 25,
    ces_current: 78,
    ces_target: 80,
    ces_history: [80, 79, 79, 78, 78, 78, 77, 77, 78, 78, 78, 78],
    last_tested_at: '2026-04-30',
    next_due_at: '2026-05-31',
    exceptions_ytd: 6,
    evidence_freshness_days: 15,
    testing_narrative:
      'Monthly MLRO walkthrough on a sample of 25 STR files. Investigator capacity has been the chronic constraint — 6 of 25 sampled files closed on day 8–9 against the 7-day rule. CES at 78 against 80 internal target; PA-2026-008 covers analyst headcount and PA-2026-022 covers narrative-template automation.',
    test_runs: [
      {
        test_date: '2026-04-30',
        tester: 'priya',
        sample_size: 25,
        exceptions: 2,
        evidence_count: 25,
        result: 'pass_with_exception',
        narrative:
          '2 of 25 STRs closed on day 8. Both had counterparty enrichment delays. No missing-narrative or missing-dataset exceptions.',
      },
      {
        test_date: '2026-03-31',
        tester: 'priya',
        sample_size: 25,
        exceptions: 2,
        evidence_count: 25,
        result: 'pass_with_exception',
        narrative: '2 of 25 closed on day 8. Investigator backlog. FINgate submission ack received for all 25.',
      },
      {
        test_date: '2026-02-28',
        tester: 'marcus',
        sample_size: 25,
        exceptions: 1,
        evidence_count: 25,
        result: 'pass_with_exception',
        narrative: '1 of 25 closed on day 8. Otherwise clean run.',
      },
      {
        test_date: '2026-01-31',
        tester: 'priya',
        sample_size: 25,
        exceptions: 1,
        evidence_count: 25,
        result: 'pass_with_exception',
        narrative: '1 of 25 closed on day 9 — investigator on sick leave. Narrative dataset complete.',
      },
      {
        test_date: '2025-12-31',
        tester: 'priya',
        sample_size: 25,
        exceptions: 0,
        evidence_count: 25,
        result: 'pass',
        narrative: 'Clean year-end run. All 25 STRs closed within 7-day rule with full dataset.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2026-008',
        title: 'Add 2 STR analyst seats to clear backlog',
        status: 'in_progress',
        due_date: '2026-07-31',
        owner: 'Suresh Iyer',
      },
      {
        id: 'PA-2026-022',
        title: 'STR narrative-template automation (NLP-assisted draft)',
        status: 'open',
        due_date: '2026-09-30',
        owner: 'Suresh Iyer',
      },
    ],
  },
  {
    id: 'AML-C004',
    name: 'KYC advance intimation pipeline (3 intimations including 1 by letter)',
    design_statement:
      'For every customer whose periodic KYC update is due, the comms engine shall issue 3 advance intimations including at least 1 by physical letter. Each intimation event must be persisted in the audit trail store with timestamp and channel.',
    domain: 'AML / KYC',
    owner: OWNER.kycOps,
    tester: TESTER.marcus,
    frequency: 'monthly',
    sample_size_latest: 75,
    ces_current: 71,
    ces_target: 78,
    ces_history: [62, 64, 65, 66, 67, 68, 68, 69, 70, 70, 71, 71],
    last_tested_at: '2026-04-29',
    next_due_at: '2026-05-29',
    exceptions_ytd: 9,
    evidence_freshness_days: 16,
    testing_narrative:
      'Below internal target. Letter pipeline is the constraint — vendor turnaround for printed letters runs 5–6 working days vs the 2-day SLA, and ~12% of sampled customers received only 2 of the 3 required intimations. PA-2026-021 (vendor uplift) was raised by the ORM-CCO review and is the primary remediation. Until letter pipeline lands, AML-C004 remains at amber.',
    test_runs: [
      {
        test_date: '2026-04-29',
        tester: 'marcus',
        sample_size: 75,
        exceptions: 9,
        evidence_count: 75,
        result: 'pass_with_exception',
        narrative:
          '9 of 75: only 2 of the 3 advance intimations completed within the SLA. Letter pipeline lag.',
      },
      {
        test_date: '2026-03-30',
        tester: 'marcus',
        sample_size: 75,
        exceptions: 9,
        evidence_count: 75,
        result: 'pass_with_exception',
        narrative: '9 of 75 missed the third (letter) intimation by 1–3 working days.',
      },
      {
        test_date: '2026-02-26',
        tester: 'sophie',
        sample_size: 60,
        exceptions: 8,
        evidence_count: 60,
        result: 'pass_with_exception',
        narrative: '8 of 60: only 2/3 intimations within SLA. Same vendor root cause.',
      },
      {
        test_date: '2026-01-28',
        tester: 'marcus',
        sample_size: 60,
        exceptions: 9,
        evidence_count: 60,
        result: 'pass_with_exception',
        narrative: '9 of 60: 2/3 intimations within SLA.',
      },
      {
        test_date: '2025-12-29',
        tester: 'marcus',
        sample_size: 50,
        exceptions: 8,
        evidence_count: 50,
        result: 'fail',
        narrative:
          'CES failed target threshold: 8 of 50 sampled customers received fewer than 3 intimations within window. Issue escalated to BRMC.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2026-021',
        title: 'Vendor uplift — printed-letter pipeline SLA from 5d to 2d',
        status: 'in_progress',
        due_date: '2026-06-30',
        owner: 'Meera Joshi',
      },
      {
        id: 'PA-2026-027',
        title: 'Add fallback letter-print partner for resilience',
        status: 'open',
        due_date: '2026-08-31',
        owner: 'Meera Joshi',
      },
    ],
  },
  {
    id: 'AML-C006',
    name: 'KYC policy library remapping to 2025 MD paragraph anchors',
    design_statement:
      'Every internal KYC SOP, audit checklist, and policy artefact shall reference the appropriate paragraph anchor in the 2025 sectoral KYC Master Direction. The mapping table is reviewed quarterly by the ORM secretariat.',
    domain: 'Regulatory Framework',
    owner: OWNER.audit,
    tester: TESTER.sophie,
    frequency: 'quarterly',
    sample_size_latest: 40,
    ces_current: 68,
    ces_target: 75,
    ces_history: [55, 58, 60, 60, 62, 62, 64, 65, 65, 67, 67, 68],
    last_tested_at: '2026-03-31',
    next_due_at: '2026-06-30',
    exceptions_ytd: 7,
    evidence_freshness_days: 45,
    testing_narrative:
      'Largest remediation pipeline of any control in scope. The November 2025 MD consolidation replaced ~3500 instruments with 238 MDs; remapping ~40 internal SOPs to the new anchors is ~62% complete by document count. PA-2026-001 holds the dependency list.',
    test_runs: [
      {
        test_date: '2026-03-31',
        tester: 'sophie',
        sample_size: 40,
        exceptions: 7,
        evidence_count: 33,
        result: 'pass_with_exception',
        narrative: '7 of 40 SOP artefacts still reference 2016 KYC MD paragraph numbers. Remediation in flight.',
      },
      {
        test_date: '2025-12-31',
        tester: 'sophie',
        sample_size: 40,
        exceptions: 9,
        evidence_count: 31,
        result: 'pass_with_exception',
        narrative: '9 of 40 unmigrated. Mapping table v1 published on 5-Dec-2025.',
      },
      {
        test_date: '2025-09-30',
        tester: 'sophie',
        sample_size: 30,
        exceptions: 12,
        evidence_count: 18,
        result: 'fail',
        narrative: 'Baseline run prior to MD consolidation. 12 of 30 artefacts already cited withdrawn circulars.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2026-001',
        title: 'Policy-library remapping to 2025 MD anchors (40 SOPs)',
        status: 'in_progress',
        due_date: '2026-08-31',
        owner: 'Sunil Bhatia',
      },
    ],
  },
  {
    id: 'AML-C007',
    name: 'KYC intimation audit-trail recording (system-of-record)',
    design_statement:
      'Each customer-facing intimation or reminder issued by the comms engine shall persist a system-of-record entry containing customer ID, channel, timestamp, content hash, and delivery acknowledgement. The audit-trail store is reconciled monthly against the comms-engine emission log.',
    domain: 'AML / KYC',
    owner: OWNER.kycOps,
    tester: TESTER.priya,
    frequency: 'monthly',
    sample_size_latest: 100,
    ces_current: 84,
    ces_target: 80,
    ces_history: [78, 79, 80, 80, 81, 82, 82, 83, 83, 84, 84, 84],
    last_tested_at: '2026-04-30',
    next_due_at: '2026-05-30',
    exceptions_ytd: 2,
    evidence_freshness_days: 15,
    testing_narrative:
      'Strong control. Monthly reconciliation of 100 sampled audit-trail entries against comms-engine emissions has been clean since the Q4 2025 platform upgrade. CES 84, above the 80 target.',
    test_runs: [
      {
        test_date: '2026-04-30',
        tester: 'priya',
        sample_size: 100,
        exceptions: 0,
        evidence_count: 100,
        result: 'pass',
        narrative: 'Clean run. All 100 audit-trail entries reconciled to source emissions with content hash match.',
      },
      {
        test_date: '2026-03-31',
        tester: 'priya',
        sample_size: 100,
        exceptions: 1,
        evidence_count: 100,
        result: 'pass_with_exception',
        narrative: '1 of 100: ack timestamp drift > 5 minutes vs NTP. NTP fix landed mid-month.',
      },
      {
        test_date: '2026-02-28',
        tester: 'sophie',
        sample_size: 100,
        exceptions: 0,
        evidence_count: 100,
        result: 'pass',
        narrative: 'Clean run.',
      },
      {
        test_date: '2026-01-31',
        tester: 'priya',
        sample_size: 100,
        exceptions: 1,
        evidence_count: 100,
        result: 'pass_with_exception',
        narrative: '1 of 100: content hash mismatch on edge-case template. Patched.',
      },
      {
        test_date: '2025-12-31',
        tester: 'priya',
        sample_size: 80,
        exceptions: 0,
        evidence_count: 80,
        result: 'pass',
        narrative: 'Clean year-end run.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'AML-C012',
    name: 'V-CIP liveness check — non-mandatory gesture configuration',
    design_statement:
      'The V-CIP onboarding flow shall not gate liveness verification on specific facial gestures. Liveness check shall accept the approved alternative biometric signal set per the 2025 KYC MD.',
    domain: 'AML / KYC',
    owner: OWNER.kycOps,
    tester: TESTER.marcus,
    frequency: 'monthly',
    sample_size_latest: 40,
    ces_current: 86,
    ces_target: 80,
    ces_history: [78, 80, 81, 82, 83, 84, 84, 85, 85, 85, 86, 86],
    last_tested_at: '2026-04-15',
    next_due_at: '2026-05-15',
    exceptions_ytd: 1,
    evidence_freshness_days: 30,
    testing_narrative:
      'V-CIP config audit shows blink-gesture flag disabled across all 3 onboarding paths. CES 86 / target 80. One minor exception was a UAT path retaining the legacy gesture flag — patched in Sprint 26.04.',
    test_runs: [
      {
        test_date: '2026-04-15',
        tester: 'marcus',
        sample_size: 40,
        exceptions: 0,
        evidence_count: 40,
        result: 'pass',
        narrative: 'All 40 V-CIP sessions used the alternative biometric path. Gesture flag disabled.',
      },
      {
        test_date: '2026-03-18',
        tester: 'marcus',
        sample_size: 40,
        exceptions: 0,
        evidence_count: 40,
        result: 'pass',
        narrative: 'Clean run.',
      },
      {
        test_date: '2026-02-17',
        tester: 'sophie',
        sample_size: 40,
        exceptions: 1,
        evidence_count: 40,
        result: 'pass_with_exception',
        narrative: '1 of 40: UAT environment retained legacy gesture flag. Patched in Sprint 26.04.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'AML-C015',
    name: 'Designated Director & Principal Officer registration with FIU-IND',
    design_statement:
      'The Designated Director and Principal Officer roles shall be registered with FIU-IND. Any change in incumbency, role title, or contact details shall be intimated to FIU-IND within 7 calendar days.',
    domain: 'AML / STR',
    owner: OWNER.amlOps,
    tester: TESTER.rahul,
    frequency: 'quarterly',
    sample_size_latest: 1,
    ces_current: 89,
    ces_target: 85,
    ces_history: [86, 86, 87, 87, 87, 88, 88, 88, 89, 89, 89, 89],
    last_tested_at: '2026-03-31',
    next_due_at: '2026-06-30',
    exceptions_ytd: 0,
    evidence_freshness_days: 45,
    testing_narrative:
      'Quarterly attestation that the FIU-IND record matches the Board-approved DD/PO incumbents. No exceptions in the trailing 4 quarters. CES 89, well above the 85 target.',
    test_runs: [
      {
        test_date: '2026-03-31',
        tester: 'rahul',
        sample_size: 1,
        exceptions: 0,
        evidence_count: 1,
        result: 'pass',
        narrative: 'FIU-IND portal record reconciles to Board-approved DD/PO. No intimation required this quarter.',
      },
      {
        test_date: '2025-12-31',
        tester: 'rahul',
        sample_size: 1,
        exceptions: 0,
        evidence_count: 1,
        result: 'pass',
        narrative: 'No DD/PO change during Q4.',
      },
      {
        test_date: '2025-09-30',
        tester: 'rahul',
        sample_size: 1,
        exceptions: 0,
        evidence_count: 1,
        result: 'pass',
        narrative: 'New PO appointed 5-Aug-2025; intimation filed with FIU-IND on 7-Aug-2025 (D+2). Within rule.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'AML-C020',
    name: 'AML records retention — 5-year regulatory hold',
    design_statement:
      'All KYC, transaction, and STR records shall be held in the retention store for at least 5 years from the date of last transaction or end of business relationship. Quarterly retention audit verifies non-deletion against the legal hold.',
    domain: 'AML / STR',
    owner: OWNER.amlOps,
    tester: TESTER.priya,
    frequency: 'quarterly',
    sample_size_latest: 50,
    ces_current: 75,
    ces_target: 82,
    ces_history: [80, 79, 78, 77, 76, 76, 75, 75, 75, 75, 75, 75],
    last_tested_at: '2026-03-31',
    next_due_at: '2026-06-30',
    exceptions_ytd: 4,
    evidence_freshness_days: 45,
    testing_narrative:
      'Retention store is migrating from on-prem to a hybrid cloud store; legal-hold flag propagation has a known gap until cut-over completes Sep-2026. PA-2024-204 tracks the migration. CES at 75 against 82 target.',
    test_runs: [
      {
        test_date: '2026-03-31',
        tester: 'priya',
        sample_size: 50,
        exceptions: 4,
        evidence_count: 50,
        result: 'pass_with_exception',
        narrative:
          '4 of 50 retention store entries did not propagate the legal-hold flag during the cloud-shard write. No data loss; flag corrected manually.',
      },
      {
        test_date: '2025-12-31',
        tester: 'priya',
        sample_size: 50,
        exceptions: 5,
        evidence_count: 50,
        result: 'pass_with_exception',
        narrative: '5 of 50: legal-hold flag missing on cloud shard. Compensating manual flag.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2024-204',
        title: 'Migrate AML retention store from on-prem to hybrid cloud (cut-over Sep 2026)',
        status: 'in_progress',
        due_date: '2026-09-30',
        owner: 'Suresh Iyer',
      },
    ],
  },
  {
    id: 'AUD-C003',
    name: 'Internal audit script version-control against current Master Directions',
    design_statement:
      'Concurrent and internal audit test scripts shall be version-controlled and tagged to the current applicable Master Direction paragraph anchors. Each script revision shall be peer-reviewed by a second audit lead.',
    domain: 'Internal Audit',
    owner: OWNER.audit,
    tester: TESTER.sandeep,
    frequency: 'quarterly',
    sample_size_latest: 30,
    ces_current: 72,
    ces_target: 78,
    ces_history: [68, 69, 69, 70, 70, 71, 71, 72, 72, 72, 72, 72],
    last_tested_at: '2026-03-31',
    next_due_at: '2026-06-30',
    exceptions_ytd: 5,
    evidence_freshness_days: 45,
    testing_narrative:
      'Audit script library still mid-migration after the November 2025 MD consolidation. 5 of 30 scripts retain pre-2025 MD references in test step rationale.',
    test_runs: [
      {
        test_date: '2026-03-31',
        tester: 'sandeep',
        sample_size: 30,
        exceptions: 5,
        evidence_count: 30,
        result: 'pass_with_exception',
        narrative: '5 of 30 audit scripts still cite 2016 KYC MD anchors. Tagged for Q2 sprint.',
      },
      {
        test_date: '2025-12-31',
        tester: 'sandeep',
        sample_size: 30,
        exceptions: 7,
        evidence_count: 30,
        result: 'pass_with_exception',
        narrative: '7 of 30 scripts pre-2025 MD. Baseline post-consolidation.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2026-009',
        title: 'Re-anchor audit script library to 2025 MD paragraphs',
        status: 'in_progress',
        due_date: '2026-07-31',
        owner: 'Sunil Bhatia',
      },
    ],
  },
  {
    id: 'LEN-C012',
    name: 'Key Fact Statement (KFS) presented at offer stage',
    design_statement:
      'For every digital-lending loan offer presented to a borrower, the front-end shall display the KFS in the prescribed RBI format before contract execution. KFS rendering is logged and reconciled daily.',
    domain: 'Digital Lending',
    owner: OWNER.lendingOps,
    tester: TESTER.marcus,
    frequency: 'daily',
    sample_size_latest: 100,
    ces_current: 85,
    ces_target: 80,
    ces_history: [78, 79, 80, 81, 82, 83, 83, 84, 84, 84, 85, 85],
    last_tested_at: '2026-05-12',
    next_due_at: '2026-05-13',
    exceptions_ytd: 3,
    evidence_freshness_days: 3,
    testing_narrative:
      'KFS-at-offer rendering log is reconciled daily by 2LoD with a 100-loan sample. CES 85, comfortably above target after the Q1 2026 platform uplift (PA-2025-152 closed).',
    test_runs: [
      {
        test_date: '2026-05-12',
        tester: 'marcus',
        sample_size: 100,
        exceptions: 0,
        evidence_count: 100,
        result: 'pass',
        narrative: 'Clean run. All 100 sampled loan offers showed KFS before contract execution.',
      },
      {
        test_date: '2026-05-11',
        tester: 'marcus',
        sample_size: 100,
        exceptions: 0,
        evidence_count: 100,
        result: 'pass',
        narrative: 'Clean run.',
      },
      {
        test_date: '2026-05-10',
        tester: 'sophie',
        sample_size: 100,
        exceptions: 1,
        evidence_count: 100,
        result: 'pass_with_exception',
        narrative: '1 of 100: KFS rendered after a 1.2s delay (over 1s SLA). UX team notified.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'LEN-C014',
    name: 'Multi-lender LSP comparison view neutrality (Para 6 DLG 2025)',
    design_statement:
      'On any LSP-operated multi-lender loan-comparison screen, all matched RE offers including unmatched lender names shall be displayed without dark patterns or LSP product promotion, with RE name, sanctioned amount, tenor, APR, monthly repayment, penal charges, and KFS link.',
    domain: 'Digital Lending',
    owner: OWNER.lendingOps,
    tester: TESTER.priya,
    frequency: 'monthly',
    sample_size_latest: 30,
    ces_current: 88,
    ces_target: 80,
    ces_history: [80, 82, 83, 84, 85, 85, 86, 86, 87, 87, 88, 88],
    last_tested_at: '2026-04-28',
    next_due_at: '2026-05-28',
    exceptions_ytd: 1,
    evidence_freshness_days: 17,
    testing_narrative:
      'Monthly screenshot-based testing across all 5 LSP partners. 30 comparison views sampled. CES 88, well above target. One amber: one LSP partner inadvertently bolded a single RE name in the early-April rollout — fixed within 48 hours.',
    test_runs: [
      {
        test_date: '2026-04-28',
        tester: 'priya',
        sample_size: 30,
        exceptions: 0,
        evidence_count: 30,
        result: 'pass',
        narrative: 'All 30 comparison views neutral; all required fields displayed.',
      },
      {
        test_date: '2026-03-28',
        tester: 'priya',
        sample_size: 30,
        exceptions: 1,
        evidence_count: 30,
        result: 'pass_with_exception',
        narrative: 'LSP partner LP-03 bolded one RE name post-config-rollout. Fixed in 48h.',
      },
      {
        test_date: '2026-02-28',
        tester: 'marcus',
        sample_size: 30,
        exceptions: 0,
        evidence_count: 30,
        result: 'pass',
        narrative: 'Clean run.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'LEN-C017',
    name: 'DLA reporting to RBI on CIMS portal with CCO certification',
    design_statement:
      'Every Digital Lending App engaged by the bank shall be reported to RBI via the CIMS portal. The Chief Compliance Officer shall certify that the data submitted is correct and that each DLA complies with applicable regulations.',
    domain: 'Digital Lending',
    owner: OWNER.lendingOps,
    tester: TESTER.priya,
    frequency: 'quarterly',
    sample_size_latest: 12,
    ces_current: 90,
    ces_target: 85,
    ces_history: [85, 86, 86, 87, 87, 88, 88, 89, 89, 90, 90, 90],
    last_tested_at: '2026-03-31',
    next_due_at: '2026-06-30',
    exceptions_ytd: 0,
    evidence_freshness_days: 45,
    testing_narrative:
      'Quarterly CIMS attestation completed by CCO. 12 in-scope DLAs reconciled to the CIMS submission. Zero exceptions trailing 4 quarters. CES 90.',
    test_runs: [
      {
        test_date: '2026-03-31',
        tester: 'priya',
        sample_size: 12,
        exceptions: 0,
        evidence_count: 12,
        result: 'pass',
        narrative: 'All 12 DLAs reported. CCO certification signed and submitted via CIMS.',
      },
      {
        test_date: '2025-12-31',
        tester: 'priya',
        sample_size: 11,
        exceptions: 0,
        evidence_count: 11,
        result: 'pass',
        narrative: 'All 11 DLAs reported. CCO certification signed.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'CYB-C014',
    name: 'SIEM → CERT-In 6-hour cyber incident notification',
    design_statement:
      'On any SIEM alert that meets the CERT-In Annexure I incident definition, an automated case shall open and CERT-In notification shall be filed within 6 hours of the originating alert timestamp.',
    domain: 'Cyber / IT Risk',
    owner: OWNER.socLead,
    tester: TESTER.vikram,
    frequency: 'monthly',
    sample_size_latest: 12,
    ces_current: 84,
    ces_target: 80,
    ces_history: [76, 77, 78, 79, 80, 81, 82, 83, 83, 83, 84, 84],
    last_tested_at: '2026-04-25',
    next_due_at: '2026-05-25',
    exceptions_ytd: 1,
    evidence_freshness_days: 20,
    testing_narrative:
      'Monthly testing samples up to 12 CERT-In-reportable incidents. Median notification time has been < 3h since the playbook automation landed in Q4 2025.',
    test_runs: [
      {
        test_date: '2026-04-25',
        tester: 'vikram',
        sample_size: 12,
        exceptions: 0,
        evidence_count: 12,
        result: 'pass',
        narrative: 'All 12 incidents notified to CERT-In within 6h. Median notification time 2h 47m.',
      },
      {
        test_date: '2026-03-26',
        tester: 'vikram',
        sample_size: 10,
        exceptions: 0,
        evidence_count: 10,
        result: 'pass',
        narrative: 'Clean run.',
      },
      {
        test_date: '2026-02-25',
        tester: 'vikram',
        sample_size: 11,
        exceptions: 1,
        evidence_count: 11,
        result: 'pass_with_exception',
        narrative:
          '1 of 11: 5h 52m notification — close to threshold. Driven by analyst PTO. PA-2026-018 raised.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2026-018',
        title: 'SOC on-call rotation: ensure two analysts always reachable',
        status: 'closed',
        due_date: '2026-04-15',
        owner: 'Karthik Ram',
      },
    ],
  },
  {
    id: 'CYB-C022',
    name: 'ICT system logs — 180-day rolling retention within India',
    design_statement:
      'Logs from all in-scope ICT systems shall be retained for at least 180 rolling days and stored within Indian jurisdiction. The retention store and replication topology are evidenced quarterly.',
    domain: 'Cyber / IT Risk',
    owner: OWNER.cyberOps,
    tester: TESTER.vikram,
    frequency: 'quarterly',
    sample_size_latest: 25,
    ces_current: 73,
    ces_target: 82,
    ces_history: [70, 70, 71, 71, 72, 72, 72, 72, 73, 73, 73, 73],
    last_tested_at: '2026-03-31',
    next_due_at: '2026-06-30',
    exceptions_ytd: 8,
    evidence_freshness_days: 45,
    testing_narrative:
      'Below internal target. The EU primary datacentre decommissioning is the open dependency — 8 of 25 sampled log sources still hot in the EU region until the in-India primary cut-over closes (Q3 2026).',
    test_runs: [
      {
        test_date: '2026-03-31',
        tester: 'vikram',
        sample_size: 25,
        exceptions: 8,
        evidence_count: 25,
        result: 'pass_with_exception',
        narrative: '8 of 25 ICT log sources still resident in the EU primary DC during cut-over.',
      },
      {
        test_date: '2025-12-31',
        tester: 'vikram',
        sample_size: 25,
        exceptions: 9,
        evidence_count: 25,
        result: 'pass_with_exception',
        narrative: '9 of 25 in EU region. Migration tracked in PA-2025-088.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2025-088',
        title: 'Decommission EU primary log DC; cut-over to in-India primary',
        status: 'in_progress',
        due_date: '2026-09-30',
        owner: 'Divya Menon',
      },
    ],
  },
  {
    id: 'CYB-C031',
    name: 'ICT clock synchronisation to NIC / NPL NTP servers',
    design_statement:
      'All in-scope ICT systems shall synchronise their clocks to NIC or NPL NTP servers or to NTP servers traceable to them. NTP drift is monitored continuously with alerting at > 5s drift.',
    domain: 'Cyber / IT Risk',
    owner: OWNER.cyberOps,
    tester: TESTER.vikram,
    frequency: 'monthly',
    sample_size_latest: 60,
    ces_current: 87,
    ces_target: 80,
    ces_history: [80, 81, 82, 82, 83, 84, 84, 85, 85, 86, 86, 87],
    last_tested_at: '2026-04-30',
    next_due_at: '2026-05-30',
    exceptions_ytd: 2,
    evidence_freshness_days: 15,
    testing_narrative:
      'Monthly NTP drift sampling across 60 systems. CES 87 / target 80. Both YTD exceptions were < 5.5s drift incidents auto-corrected within seconds.',
    test_runs: [
      {
        test_date: '2026-04-30',
        tester: 'vikram',
        sample_size: 60,
        exceptions: 0,
        evidence_count: 60,
        result: 'pass',
        narrative: 'All 60 systems within 1s of NIC/NPL reference.',
      },
      {
        test_date: '2026-03-31',
        tester: 'vikram',
        sample_size: 60,
        exceptions: 1,
        evidence_count: 60,
        result: 'pass_with_exception',
        narrative: '1 of 60: 5.3s drift on a legacy archive node. Auto-recovered.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'CYB-C040',
    name: 'CERT-In Point of Contact designation + intimation',
    design_statement:
      'The bank shall have a designated PoC registered with CERT-In. Any change in PoC details (name, role, contact) shall be intimated to CERT-In via the prescribed channel within 7 calendar days.',
    domain: 'Cyber / IT Risk',
    owner: OWNER.cyberOps,
    tester: TESTER.vikram,
    frequency: 'quarterly',
    sample_size_latest: 1,
    ces_current: 70,
    ces_target: 80,
    ces_history: [72, 72, 71, 71, 71, 70, 70, 70, 70, 70, 70, 70],
    last_tested_at: '2026-03-15',
    next_due_at: '2026-06-15',
    exceptions_ytd: 1,
    evidence_freshness_days: 61,
    testing_narrative:
      'Recent CISO change triggered the re-registration cycle. CERT-In PoC change intimation is in flight; pending CERT-In ack. Below the 80 target until ack lands.',
    test_runs: [
      {
        test_date: '2026-03-15',
        tester: 'vikram',
        sample_size: 1,
        exceptions: 1,
        evidence_count: 1,
        result: 'pass_with_exception',
        narrative:
          'PoC registered details list outgoing CISO; intimation submitted on 28-Feb-2026 — CERT-In ack pending.',
      },
      {
        test_date: '2025-12-15',
        tester: 'vikram',
        sample_size: 1,
        exceptions: 0,
        evidence_count: 1,
        result: 'pass',
        narrative: 'PoC details current. No change during quarter.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2026-025',
        title: 'Close CERT-In PoC re-registration cycle (await ack)',
        status: 'in_progress',
        due_date: '2026-06-01',
        owner: 'Divya Menon',
      },
    ],
  },
  {
    id: 'CYB-C050',
    name: 'ISO 27001 ISMS for SEBI-regulated arm (Qualified RE)',
    design_statement:
      'The depository-participant and RTA business shall operate an ISO 27001-certified Information Security Management System. Surveillance audits and risk-treatment plans shall be evidenced.',
    domain: 'Cyber / IT Risk',
    owner: OWNER.cyberOps,
    tester: TESTER.vikram,
    frequency: 'semi_annual',
    sample_size_latest: 1,
    ces_current: 88,
    ces_target: 80,
    ces_history: [82, 82, 83, 84, 85, 85, 86, 86, 87, 87, 88, 88],
    last_tested_at: '2026-02-15',
    next_due_at: '2026-08-15',
    exceptions_ytd: 0,
    evidence_freshness_days: 90,
    testing_narrative:
      'ISO 27001 surveillance audit completed Feb 2026 with no major non-conformities. CES 88 / target 80. SEBI CSCRF Annex I obligation fully covered by this control.',
    test_runs: [
      {
        test_date: '2026-02-15',
        tester: 'vikram',
        sample_size: 1,
        exceptions: 0,
        evidence_count: 1,
        result: 'pass',
        narrative: 'ISO 27001 surveillance audit closed with zero major non-conformities.',
      },
      {
        test_date: '2025-08-15',
        tester: 'vikram',
        sample_size: 1,
        exceptions: 0,
        evidence_count: 1,
        result: 'pass',
        narrative: 'Initial certification audit completed. Certificate valid.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'PAY-C008',
    name: 'UPI Balance / List-Account API rate limit enforcement',
    design_statement:
      'The UPI switch shall enforce hard rate limits of 50 Balance enquiry and 25 List Account API calls per user per day per app. Background balance polling shall be disabled.',
    domain: 'Payments / UPI',
    owner: OWNER.paymentsOps,
    tester: TESTER.anjali,
    frequency: 'daily',
    sample_size_latest: 250,
    ces_current: 86,
    ces_target: 80,
    ces_history: [80, 81, 82, 83, 84, 84, 85, 85, 85, 86, 86, 86],
    last_tested_at: '2026-05-13',
    next_due_at: '2026-05-14',
    exceptions_ytd: 4,
    evidence_freshness_days: 2,
    testing_narrative:
      'Daily reconciliation of API call counters across UPI traffic. CES 86 / target 80. Background polling disabled across all 4 UPI apps.',
    test_runs: [
      {
        test_date: '2026-05-13',
        tester: 'anjali',
        sample_size: 250,
        exceptions: 0,
        evidence_count: 250,
        result: 'pass',
        narrative: 'Clean run. All 250 sampled users within rate limit envelope.',
      },
      {
        test_date: '2026-05-12',
        tester: 'anjali',
        sample_size: 250,
        exceptions: 0,
        evidence_count: 250,
        result: 'pass',
        narrative: 'Clean run.',
      },
      {
        test_date: '2026-05-11',
        tester: 'anjali',
        sample_size: 250,
        exceptions: 1,
        evidence_count: 250,
        result: 'pass_with_exception',
        narrative:
          '1 of 250: edge case at limit boundary (50th call queued vs accepted). Behaviour matches NPCI clarification.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'PAY-C014',
    name: 'Autopay (e-mandate) execution window enforcement',
    design_statement:
      'Autopay debit requests shall be presented to NPCI only within the designated execution windows. Outside-window submissions shall be blocked at the switch with structured exception logging.',
    domain: 'Payments / UPI',
    owner: OWNER.paymentsOps,
    tester: TESTER.anjali,
    frequency: 'weekly',
    sample_size_latest: 100,
    ces_current: 82,
    ces_target: 80,
    ces_history: [76, 77, 78, 79, 79, 80, 80, 81, 81, 82, 82, 82],
    last_tested_at: '2026-05-09',
    next_due_at: '2026-05-16',
    exceptions_ytd: 2,
    evidence_freshness_days: 6,
    testing_narrative:
      'Weekly sampling of 100 autopay debit attempts. Switch enforcement is healthy; 2 YTD exceptions were edge cases at window-boundary clock skew, now resolved by NTP control (CYB-C031).',
    test_runs: [
      {
        test_date: '2026-05-09',
        tester: 'anjali',
        sample_size: 100,
        exceptions: 0,
        evidence_count: 100,
        result: 'pass',
        narrative: 'Clean run.',
      },
      {
        test_date: '2026-05-02',
        tester: 'anjali',
        sample_size: 100,
        exceptions: 0,
        evidence_count: 100,
        result: 'pass',
        narrative: 'Clean run.',
      },
    ],
    preventive_actions: [],
  },
  {
    id: 'FOR-C009',
    name: 'LRS Daily R-Return — submission via XBRL by T+1 18:00 IST',
    design_statement:
      'Authorised Dealer banks shall submit the Daily R-Return for LRS outward remittances via the XBRL portal by 18:00 IST on T+1 working day. Reconciliation breaks against core banking shall be cleared within 2 working days.',
    domain: 'Forex / LRS',
    owner: OWNER.forexOps,
    tester: TESTER.anjali,
    frequency: 'daily',
    sample_size_latest: 1,
    ces_current: 74,
    ces_target: 82,
    ces_history: [80, 79, 78, 77, 76, 76, 75, 75, 74, 74, 74, 74],
    last_tested_at: '2026-05-13',
    next_due_at: '2026-05-14',
    exceptions_ytd: 7,
    evidence_freshness_days: 2,
    testing_narrative:
      'Daily R-Return submission cycle. Below target. Most YTD exceptions are timing — submission cleared between 18:00 and 18:45 IST due to core-banking late-batch settlement. The June 2026 format change (new purpose-code sub-level + beneficiary KYC ref) is the next dependency — REG-ALERT-2026-0072 is the open Reg Intel item.',
    test_runs: [
      {
        test_date: '2026-05-13',
        tester: 'anjali',
        sample_size: 1,
        exceptions: 0,
        evidence_count: 1,
        result: 'pass',
        narrative: 'R-Return submitted at 17:48 IST.',
      },
      {
        test_date: '2026-05-12',
        tester: 'anjali',
        sample_size: 1,
        exceptions: 1,
        evidence_count: 1,
        result: 'pass_with_exception',
        narrative: 'Submission at 18:32 IST due to late core-banking batch. Within 1-day extension SLA.',
      },
      {
        test_date: '2026-05-11',
        tester: 'anjali',
        sample_size: 1,
        exceptions: 0,
        evidence_count: 1,
        result: 'pass',
        narrative: 'Submission at 17:52 IST.',
      },
    ],
    preventive_actions: [
      {
        id: 'PA-2026-030',
        title: 'Capture new purpose-code sub-level + beneficiary KYC ref in R-Return',
        status: 'open',
        due_date: '2026-06-01',
        owner: 'Neha Kapoor',
      },
    ],
  },
];

function expand(seed: CtrlSeed): ControlRecord {
  const runs: ControlTestRun[] = seed.test_runs.map((r, i) => {
    const tester = TESTER[r.tester];
    return {
      id: `${seed.id}-TR-${i + 1}`,
      test_date: r.test_date,
      tester: tester.name,
      tester_role: tester.role,
      sample_size: r.sample_size,
      exceptions: r.exceptions,
      evidence_count: r.evidence_count,
      result: r.result,
      narrative: r.narrative,
    };
  });
  return {
    id: seed.id,
    name: seed.name,
    design_statement: seed.design_statement,
    domain: seed.domain,
    owner_1lod: seed.owner.name,
    owner_1lod_role: seed.owner.role,
    tester_2lod: seed.tester.name,
    tester_2lod_role: seed.tester.role,
    frequency: seed.frequency,
    sample_size_latest: seed.sample_size_latest,
    ces_current: seed.ces_current,
    ces_target: seed.ces_target,
    ces_history: seed.ces_history,
    last_tested_at: seed.last_tested_at,
    next_due_at: seed.next_due_at,
    status: statusFor(seed.ces_current, seed.ces_target, seed.last_tested_at),
    exceptions_ytd: seed.exceptions_ytd,
    evidence_freshness_days: seed.evidence_freshness_days,
    test_runs: runs,
    preventive_actions: seed.preventive_actions,
    testing_narrative: seed.testing_narrative,
  };
}

export const controlRecords: ControlRecord[] = SEED.map(expand);

export function getControlById(id: string): ControlRecord | undefined {
  return controlRecords.find((c) => c.id === id);
}

export const CONTROL_DOMAIN_PILL_ORDER: ControlDomain[] = [
  'AML / KYC',
  'AML / STR',
  'Cyber / IT Risk',
  'Digital Lending',
  'Payments / UPI',
  'Forex / LRS',
  'Regulatory Framework',
  'Internal Audit',
];

/** Friendly labels for ControlFrequency. */
export const CONTROL_FREQUENCY_LABEL: Record<ControlFrequency, string> = {
  transactional: 'Transactional',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-annual',
  annual: 'Annual',
};

export const CONTROL_STATUS_LABEL: Record<ControlTestStatus, string> = {
  effective: 'Effective',
  partial: 'Partial',
  ineffective: 'Ineffective',
  in_testing: 'In testing',
  overdue: 'Overdue',
};

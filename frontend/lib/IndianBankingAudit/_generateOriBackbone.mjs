/**
 * One-off generator: writes UTF-8 JS fragment for ORI mock backbone (rcsaCycles … pacNotes).
 * Run: node _generateOriBackbone.mjs
 */
import fs from 'fs';
import { fileURLToPath } from 'url';
const risks = ['R-FC-001', 'R-CD-001', 'R-CO-001', 'R-OP-001', 'R-TC-001', 'R-CR-001', 'R-TP-001', 'R-FR-001', 'R-MR-001'];
const procByTheme = {
  retail_liabilities: 'PROC-KYC-001',
  digital_lending: 'PROC-LND-001',
  treasury: 'PROC-VND-001',
  trade_finance: 'PROC-VND-001',
  cards_payments: 'PROC-UPI-001',
  it_operations: 'PROC-ITO-001',
  branch_banking: 'PROC-KYC-001',
  financial_crime: 'PROC-AML-001',
  wealth: 'PROC-KYC-001',
  corporate: 'PROC-LND-001',
};
const ctrlPool = {
  PROC_KYC: ['CTRL-KYC-001', 'CTRL-KYC-002', 'CTRL-KYC-003'],
  PROC_LND: ['CTRL-LND-001', 'CTRL-LND-002'],
  PROC_AML: ['CTRL-AML-002', 'CTRL-AML-003'],
  PROC_ITO: ['CTRL-ITO-001'],
  PROC_UPI: ['CTRL-UPI-001'],
  PROC_VND: ['CTRL-VND-001', 'CTRL-VND-002'],
};
const cesMap = {
  'CTRL-KYC-001': 95.6,
  'CTRL-KYC-002': 97.0,
  'CTRL-KYC-003': 82.2,
  'CTRL-LND-001': 92.4,
  'CTRL-LND-002': 89.51,
  'CTRL-AML-002': 69.6,
  'CTRL-AML-003': 88.2,
  'CTRL-ITO-001': 88.8,
  'CTRL-UPI-001': null,
  'CTRL-VND-001': 73.4,
  'CTRL-VND-002': 71.2,
};

const businessUnitByTheme = {
  retail_liabilities: 'Retail Banking',
  digital_lending: 'Digital Lending',
  treasury: 'Treasury',
  trade_finance: 'Trade Finance',
  cards_payments: 'Cards & Payments',
  it_operations: 'IT Operations',
  branch_banking: 'Branch Banking',
  financial_crime: 'Financial Crime',
  wealth: 'Wealth Management',
  corporate: 'Corporate Banking',
};

const cycles = [
  { id: 'RC-FY26-H1-RL', name: 'Retail Liabilities', theme: 'retail_liabilities', status: 'not_started' },
  { id: 'RC-FY26-H1-DL', name: 'Digital Lending', theme: 'digital_lending', status: 'in_progress' },
  { id: 'RC-FY26-H1-TR', name: 'Treasury', theme: 'treasury', status: 'in_progress' },
  { id: 'RC-FY26-H1-TF', name: 'Trade Finance', theme: 'trade_finance', status: 'in_progress' },
  { id: 'RC-FY26-H1-CP', name: 'Cards & Payments', theme: 'cards_payments', status: 'in_progress' },
  { id: 'RC-FY26-H1-IT', name: 'IT Operations', theme: 'it_operations', status: 'spoc_review' },
  { id: 'RC-FY26-H1-BB', name: 'Branch Banking', theme: 'branch_banking', status: 'spoc_review' },
  { id: 'RC-FY26-H1-FC', name: 'Financial Crime Operations', theme: 'financial_crime', status: 'hod_approval' },
  { id: 'RC-FY26-H1-WM', name: 'Wealth Management', theme: 'wealth', status: 'signed_off' },
  { id: 'RC-FY26-H1-CB', name: 'Corporate Banking', theme: 'corporate', status: 'locked' },
];

/** Target SPOC sign-off dates (some before demo “today” for overdue attestations). */
const targetSignoffByIdx = ['2026-03-20', '2026-04-28', '2026-08-15', '2026-08-20', '2026-07-10', '2026-04-15', '2026-06-01', '2026-05-28', '2026-04-30', '2026-09-15'];
const cadenceByIdx = ['half_yearly', 'quarterly', 'annual', 'half_yearly', 'quarterly', 'monthly', 'quarterly', 'annual', 'half_yearly', 'annual'];

const rcsaCycles = cycles.map((c, idx) => ({
  rcsa_cycle_id: c.id,
  cycle_name: c.name,
  fiscal_period_label: 'FY26-H1',
  period_start: '2026-04-01',
  period_end: '2026-09-30',
  status: c.status,
  linked_process_id: procByTheme[c.theme],
  owner_senior_manager_id: 'SM-CCO-001',
  business_unit: businessUnitByTheme[c.theme],
  refresh_cadence: cadenceByIdx[idx % cadenceByIdx.length],
  target_signoff_at: targetSignoffByIdx[idx % targetSignoffByIdx.length],
}));

function controlsForProcess(pid) {
  if (pid === 'PROC-KYC-001') return ctrlPool.PROC_KYC;
  if (pid === 'PROC-LND-001') return ctrlPool.PROC_LND;
  if (pid === 'PROC-AML-001') return ctrlPool.PROC_AML;
  if (pid === 'PROC-ITO-001') return ctrlPool.PROC_ITO;
  if (pid === 'PROC-UPI-001') return ctrlPool.PROC_UPI;
  return ctrlPool.PROC_VND;
}

function avgCes(ctrlIds) {
  const nums = ctrlIds.map((id) => cesMap[id]).filter((x) => x != null);
  if (!nums.length) return 70;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

let cellN = 0;
const rcsaCells = [];
const trends = [];
for (let i = 0; i < 24; i++) trends.push('stable');
for (let i = 0; i < 10; i++) trends.push('deteriorating');
for (let i = 0; i < 6; i++) trends.push('improving');

const todayTs = new Date('2026-05-11T12:00:00Z').getTime();

for (const cy of cycles) {
  const cyIdx = cycles.indexOf(cy);
  const targetTs = new Date(targetSignoffByIdx[cyIdx % targetSignoffByIdx.length] + 'T00:00:00Z').getTime();
  const signoffPast = targetTs < todayTs;
  const pid = procByTheme[cy.theme];
  const pool = controlsForProcess(pid);
  const cellsThisCycle = cy.status === 'not_started' ? 2 : cy.status === 'locked' ? 5 : 4;
  for (let j = 0; j < cellsThisCycle; j++) {
    cellN++;
    const rk = risks[(cellN + j) % risks.length];
    const nCtrl = 1 + (cellN % 3);
    const ctrlIds = [];
    for (let k = 0; k < nCtrl; k++) ctrlIds.push(pool[(cellN + k) % pool.length]);
    const lk = 2 + (cellN % 4);
    const im = 2 + ((cellN * 3) % 4);
    const score = lk * im;
    let inh = 'low';
    if (score >= 12) inh = 'high';
    else if (score >= 8) inh = 'medium';
    const ac = avgCes(ctrlIds);
    const eff = Math.min(95, Math.max(45, Math.round(ac + (cellN % 5) - 2)));
    const inhNum = inh === 'high' ? 3 : inh === 'medium' ? 2 : 1;
    const residualScore = Math.round(inhNum * 100 * (1 - eff / 100));
    let res = 'low';
    if (residualScore >= 55) res = 'high';
    else if (residualScore >= 35) res = 'medium';
    const trend = trends[(cellN - 1) % trends.length];
    const refreshDay = 28 - ((cellN + j) % 20);
    const lastRef = `2026-04-${String(refreshDay).padStart(2, '0')}`;
    const attest =
      signoffPast && cellN % 2 === 0 ? null : signoffPast && cellN % 2 === 1 ? '2026-05-08T14:30:00Z' : cy.status === 'signed_off' ? '2026-04-22T11:00:00Z' : null;
    rcsaCells.push({
      rcsa_cell_id: `RCELL-FY26-${String(cellN).padStart(3, '0')}`,
      rcsa_cycle_id: cy.id,
      risk_id: rk,
      process_id: pid,
      control_ids: ctrlIds,
      inherent_likelihood: lk,
      inherent_impact: im,
      inherent_rating: inh,
      control_effectiveness_score: eff,
      residual_rating: res,
      residual_trend: trend,
      spoc_attested_at: attest,
      last_refreshed: lastRef,
    });
  }
}

const inc = [];
const d0 = new Date('2026-05-11T12:00:00Z');
function disc(daysAgo) {
  const d = new Date(d0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

inc.push({
  incident_id: 'INC-2026-ORI-001',
  incident_type: 'operational_loss',
  severity: 'high',
  discovered_date: disc(12),
  gross_loss_inr: 13500000,
  recovery_inr: 2000000,
  status: 'rca_in_progress',
  linked_risk_ids: ['R-OP-001'],
  linked_control_ids: ['CTRL-AML-002'],
  accountable_senior_manager_id: 'SM-OPS-001',
  title: 'BPO EOD batch posting error — duplicate NEFT credits',
});
inc.push({
  incident_id: 'INC-2026-ORI-002',
  incident_type: 'operational_loss',
  severity: 'high',
  discovered_date: disc(25),
  gross_loss_inr: 4200000,
  recovery_inr: 800000,
  status: 'rca_in_progress',
  linked_risk_ids: ['R-FC-001'],
  linked_control_ids: ['CTRL-AML-002', 'CTRL-AML-003'],
  accountable_senior_manager_id: 'SM-MLRO-001',
  title: 'STR clock stress — PMLA workflow backlog near 7 working days',
});
inc.push({
  incident_id: 'INC-2026-ORI-003',
  incident_type: 'operational_loss',
  severity: 'high',
  discovered_date: disc(40),
  gross_loss_inr: 2800000,
  recovery_inr: 0,
  status: 'under_investigation',
  linked_risk_ids: ['R-CD-001'],
  linked_control_ids: ['CTRL-LND-002'],
  accountable_senior_manager_id: 'SM-BH-RETAIL-001',
  title: 'DSA channel cooling-off bypass cluster — remediation in flight',
});
for (let i = 0; i < 3; i++) {
  inc.push({
    incident_id: `INC-2026-ORI-00${4 + i}`,
    incident_type: 'operational_loss',
    severity: 'medium',
    discovered_date: disc(15 + i * 7),
    gross_loss_inr: 350000 + i * 50000,
    recovery_inr: 50000,
    status: i === 0 ? 'reported' : i === 1 ? 'rca_in_progress' : 'contained',
    linked_risk_ids: ['R-CO-001'],
    linked_control_ids: ['CTRL-KYC-003'],
    accountable_senior_manager_id: 'SM-CCO-001',
    title: `Retail ops variance — KYC evidence lag cohort ${i + 1}`,
  });
}
for (let i = 0; i < 3; i++) {
  inc.push({
    incident_id: `INC-2026-ORI-00${7 + i}`,
    incident_type: 'near_miss',
    severity: 'medium',
    discovered_date: disc(5 + i * 3),
    gross_loss_inr: null,
    recovery_inr: null,
    status: 'closed_no_loss',
    linked_risk_ids: ['R-TC-001'],
    linked_control_ids: ['CTRL-ITO-001'],
    accountable_senior_manager_id: 'SM-CISO-001',
    title: `Near miss — SOC detected anomalous IAM change pre-CERT-In window ${i + 1}`,
  });
}
inc.push({
  incident_id: 'INC-2026-ORI-010',
  incident_type: 'fraud',
  fraud_origin: 'internal',
  severity: 'high',
  discovered_date: disc(60),
  gross_loss_inr: 1850000,
  recovery_inr: 400000,
  status: 'rca_in_progress',
  linked_risk_ids: ['R-FR-001'],
  linked_control_ids: ['CTRL-UPI-001'],
  accountable_senior_manager_id: 'SM-FCC-001',
  title: 'Internal collusion — branch Teller override limits on prepaid instruments',
});
inc.push({
  incident_id: 'INC-2026-ORI-011',
  incident_type: 'fraud',
  fraud_origin: 'external',
  severity: 'high',
  discovered_date: disc(33),
  gross_loss_inr: 9500000,
  recovery_inr: 1200000,
  status: 'law_enforcement_notified',
  linked_risk_ids: ['R-FR-001', 'R-FC-001'],
  linked_control_ids: ['CTRL-AML-002'],
  accountable_senior_manager_id: 'SM-FCC-001',
  title: 'External mule network — UPI rapid funnel-out linked to AML typology',
});
inc.push({
  incident_id: 'INC-2026-ORI-012',
  incident_type: 'conduct',
  conduct_subtype: 'mis_selling',
  severity: 'medium',
  discovered_date: disc(20),
  gross_loss_inr: 120000,
  recovery_inr: 0,
  status: 'customer_redress_in_progress',
  linked_risk_ids: ['R-CD-001'],
  linked_control_ids: ['CTRL-LND-002', 'CTRL-LND-001'],
  accountable_senior_manager_id: 'SM-BH-RETAIL-001',
  title: 'Wealth RM mis-selling — APR disclosure gap vs RBI MD on Digital Lending KFS discipline',
});
inc.push({
  incident_id: 'INC-2026-ORI-013',
  incident_type: 'cyber',
  severity: 'high',
  discovered_date: disc(8),
  gross_loss_inr: 450000,
  recovery_inr: 0,
  status: 'rca_in_progress',
  linked_risk_ids: ['R-TC-001'],
  linked_control_ids: ['CTRL-ITO-001'],
  accountable_senior_manager_id: 'SM-CISO-001',
  title: 'Ransomware attempt on DR site - CERT-In six-hour notification met; RBI CSITE materiality assessment ongoing per ITGRCA',
});
inc.push({
  incident_id: 'INC-2026-ORI-014',
  incident_type: 'cyber',
  severity: 'medium',
  discovered_date: disc(18),
  gross_loss_inr: 80000,
  recovery_inr: 0,
  status: 'contained',
  linked_risk_ids: ['R-TC-001', 'R-MR-001'],
  linked_control_ids: ['CTRL-ITO-001'],
  accountable_senior_manager_id: 'SM-CISO-001',
  title: 'API key leakage in non-prod - exposure window bridged to production-like data class',
});
inc.push({
  incident_id: 'INC-2026-ORI-015',
  incident_type: 'regulatory_breach',
  severity: 'high',
  discovered_date: disc(44),
  gross_loss_inr: 500000,
  recovery_inr: 0,
  status: 'reported',
  linked_risk_ids: ['R-FC-001'],
  linked_control_ids: ['CTRL-AML-003'],
  accountable_senior_manager_id: 'SM-MLRO-001',
  title: 'CTR filing delay vs FIU-IND monthly cut-off — regulatory reporting breach logged',
});

const noRca = new Set(['INC-2026-ORI-004', 'INC-2026-ORI-007', 'INC-2026-ORI-008', 'INC-2026-ORI-009', 'INC-2026-ORI-015']);
const rcas = [];
let rcaN = 0;
for (const it of inc) {
  if (noRca.has(it.incident_id)) continue;
  rcaN++;
  const st = rcaN <= 6 ? 'approved' : rcaN <= 9 ? 'under_review' : 'draft';
  const steps = [
    { step_order: 1, statement: 'Why was loss material? — EOD NEFT batch at CPC Mumbai ran twice after BPM handoff; CBS T+1 reconciliation not completed before MD&CEO dashboard ORMC pack.' },
    { step_order: 2, statement: 'Why did reconciliation miss? — SPOC on leave; HOD approval for temporary dual-key not recorded in MOM; RBI operational resilience guidance on critical role backup not fully operationalised.' },
    { step_order: 3, statement: 'Why dual-key gap tolerated? — Vendor release window overlapped KYC annual freeze; IT change calendar conflict with PMLA reporting week.' },
    { step_order: 4, statement: 'Why calendar conflict unmanaged? — ORMC risk agenda did not include cross-functional change freeze map for financial crime operations.' },
    { step_order: 5, statement: 'Root systemic cause — RCSA linkage from retail liabilities cycle to change management not signed off; control effectiveness assumed green without branch sampling.' },
  ];
  if (it.incident_type === 'fraud') {
    steps[0].statement = 'Why fraud succeeded? — KYC refresh queue backlog; BPO queue prioritised commercial onboarding over retail mule typology alerts per MLRO-PO directive.';
    steps[1].statement = 'Why backlog? — PMLA Rule 9 retention pulls consumed analyst capacity during FIU-IND FINnet 2.0 schema upgrade weekend.';
  }
  if (it.incident_type === 'cyber') {
    steps[0].statement = 'Why CERT-In timeline at risk? — SIEM parser lag on new log source; ITGRCA control CTRL-ITO-001 evidence hash mismatch until CISO war-room invoked.';
    steps[1].statement = 'Why parser lag? — TPSP patch deployed without VMO fourth-party test evidence; RBI outsourcing master direction materiality criteria referenced in ORMC action.';
  }
  const rcaStarted = it.discovered_date + 'T08:30:00Z';
  let rcaCompleted = null;
  if (st === 'approved') {
    const d = new Date(rcaStarted);
    d.setUTCDate(d.getUTCDate() + 3 + (rcaN % 6));
    rcaCompleted = d.toISOString();
  }
  rcas.push({
    rca_id: `RCA-2026-ORI-${String(rcaN).padStart(2, '0')}`,
    incident_id: it.incident_id,
    status: st,
    five_whys_steps: steps.slice(0, 3 + (rcaN % 3)),
    opened_at: it.discovered_date + 'T09:00:00Z',
    rca_started_at: rcaStarted,
    rca_completed_at: rcaCompleted,
    owner_senior_manager_id: it.accountable_senior_manager_id,
  });
}

function baselDefault(incidentType) {
  const m = {
    operational_loss: 'execution_delivery_process_management',
    fraud: 'internal_fraud',
    near_miss: 'business_disruption_system_failures',
    cyber: 'business_disruption_system_failures',
    conduct: 'clients_products_business_practices',
    regulatory_breach: 'clients_products_business_practices',
  };
  return m[incidentType] || 'execution_delivery_process_management';
}

const incidentExtraById = {
  'INC-2026-ORI-001': {
    business_unit: 'Operations / CPC',
    basel_event_type: 'execution_delivery_process_management',
    basel_event_subtype: 'Payment / settlement processing error',
    description:
      'Duplicate NEFT batch posting at CPC Mumbai after BPO EOD handoff; CBS reconciliation window missed before ORMC pack. Duplicate credits identified on T+1 recon; customer debits frozen pending reversal.',
    occurred_date: '2026-04-28',
    reported_date: '2026-04-29',
    detection_source: 'Core banking EOD reconciliation',
    rbi_reportable: true,
    fmr_filed: true,
    fmr_filed_date: '2026-05-01',
    cert_in_filed_at: null,
    csite_filed_at: null,
  },
  'INC-2026-ORI-002': {
    business_unit: 'Financial Crime',
    basel_event_type: 'clients_products_business_practices',
    basel_event_subtype: 'Regulatory reporting timeliness',
    description: 'STR workflow backlog approaching seven working days under PMLA operational discipline; MLRO war-room invoked.',
    occurred_date: '2026-04-10',
    reported_date: '2026-04-16',
    detection_source: 'AML case ageing dashboard',
    rbi_reportable: true,
    fmr_filed: false,
    fmr_filed_date: null,
    cert_in_filed_at: null,
    csite_filed_at: null,
  },
  'INC-2026-ORI-011': {
    business_unit: 'Payments / FCC',
    basel_event_type: 'external_fraud',
    basel_event_subtype: 'Third-party mule typology',
    description: 'Rapid funnel-out via UPI mule accounts linked to external typology; coordinated with LE and FIU-IND channels.',
    occurred_date: '2026-04-05',
    reported_date: '2026-04-08',
    detection_source: 'AML typology + UPI velocity rules',
    rbi_reportable: true,
    fmr_filed: true,
    fmr_filed_date: '2026-04-12',
    cert_in_filed_at: null,
    csite_filed_at: null,
  },
  'INC-2026-ORI-013': {
    business_unit: 'IT Operations / Cyber',
    basel_event_type: 'business_disruption_system_failures',
    basel_event_subtype: 'Cyber incident — DR drill boundary',
    description: 'Ransomware attempt contained at DR site; CERT-In six-hour notification met; CSITE materiality assessment per RBI ITGRCA.',
    occurred_date: '2026-05-02',
    reported_date: '2026-05-03',
    detection_source: 'SOC SIEM + DR monitoring',
    rbi_reportable: true,
    fmr_filed: true,
    fmr_filed_date: '2026-05-03',
    cert_in_filed_at: '2026-05-03T05:12:00Z',
    csite_filed_at: '2026-05-04T10:00:00Z',
  },
};

for (const it of inc) {
  const ex = incidentExtraById[it.incident_id] || {};
  const bu =
    ex.business_unit ||
    (it.incident_type === 'near_miss' ? 'IT Operations' : it.incident_type === 'cyber' ? 'IT Operations' : 'Enterprise');
  const desc =
    ex.description ||
    `${it.title}. Logged under ORM incident taxonomy for FY26-H1; accountable SM notified per internal escalation matrix.`;
  Object.assign(it, {
    business_unit: bu,
    basel_event_type: ex.basel_event_type || baselDefault(it.incident_type),
    basel_event_subtype: ex.basel_event_subtype || null,
    description: desc,
    occurred_date: ex.occurred_date || it.discovered_date,
    reported_date: ex.reported_date || it.discovered_date,
    detection_source: ex.detection_source || 'Control / monitoring',
    rbi_reportable: ex.rbi_reportable != null ? ex.rbi_reportable : it.severity === 'high',
    fmr_filed: ex.fmr_filed != null ? ex.fmr_filed : false,
    fmr_filed_date: ex.fmr_filed_date || null,
    cert_in_filed_at: ex.cert_in_filed_at != null ? ex.cert_in_filed_at : null,
    csite_filed_at: ex.csite_filed_at != null ? ex.csite_filed_at : null,
  });
}

for (const r of rcas) {
  const row = inc.find((x) => x.incident_id === r.incident_id);
  if (row) row.linked_rca_id = r.rca_id;
}

const pacts = [];
const rcaIds = rcas.map((r) => r.rca_id);
let pi = 0;
function addPa(rcaId, title, status, targetDate, flag, closureEvs) {
  pi++;
  pacts.push({
    preventive_action_id: `PA-2026-ORI-${String(pi).padStart(2, '0')}`,
    rca_id: rcaId,
    title,
    status,
    target_date: targetDate,
    owner_senior_manager_id: 'SM-CCO-001',
    closure_evidence_ids: closureEvs || [],
    linked_pac_note_block_flag: flag,
  });
}
// 6 overdue open 30%
for (let i = 0; i < 6; i++) addPa(rcaIds[i % rcaIds.length], `Overdue PAC ${i + 1} — tighten ${i % 2 ? 'BPM' : 'SOP'} control points`, 'open', '2026-03-15', i < 4, []);
// 8 open not overdue
for (let i = 0; i < 8; i++) addPa(rcaIds[(i + 3) % rcaIds.length], `Open PAC ${i + 1} — branch training and HOD attestation pack`, 'open', '2026-07-30', false, []);
// 4 in_progress
for (let i = 0; i < 4; i++) addPa(rcaIds[(i + 1) % rcaIds.length], `In progress PAC ${i + 1} — ITSM change template update`, 'in_progress', '2026-06-15', i === 0, []);
// 2 closed 10%
addPa(rcaIds[0], 'Closed PAC — FIU STR XML sample retest', 'closed', '2026-04-01', false, ['EV-DOC-STR-501', 'EV-LOG-FIU-ACK-501']);
addPa(rcaIds[1], 'Closed PAC — KFS sequence guard deployed', 'closed', '2026-04-10', false, ['EV-SIGN-KFS-881', 'EV-LOG-LOS-EVT-884-KFS']);

const lossEvents = [
  { loss_event_id: 'LEV-2026-001', event_date: '2026-02-14', gross_loss_inr: 12500000, recovery_inr: 1800000, business_line: 'retail_banking', basel_event_type: 'internal_fraud', linked_risk_id: 'R-FR-001', linked_control_ids: ['CTRL-UPI-001'], accountable_senior_manager_id: 'SM-FCC-001' },
  { loss_event_id: 'LEV-2026-002', event_date: '2026-01-22', gross_loss_inr: 4200000, recovery_inr: 900000, business_line: 'retail_banking', basel_event_type: 'internal_fraud', linked_risk_id: 'R-OP-001', linked_control_ids: ['CTRL-AML-002'], accountable_senior_manager_id: 'SM-OPS-001' },
  { loss_event_id: 'LEV-2026-003', event_date: '2025-11-03', gross_loss_inr: 850000, recovery_inr: 0, business_line: 'commercial_banking', basel_event_type: 'internal_fraud', linked_risk_id: 'R-TP-001', linked_control_ids: ['CTRL-VND-001'], accountable_senior_manager_id: 'SM-CIO-001' },
  { loss_event_id: 'LEV-2026-004', event_date: '2026-03-08', gross_loss_inr: 15200000, recovery_inr: 2500000, business_line: 'retail_banking', basel_event_type: 'external_fraud', linked_risk_id: 'R-FR-001', linked_control_ids: ['CTRL-AML-002'], accountable_senior_manager_id: 'SM-FCC-001' },
  { loss_event_id: 'LEV-2026-005', event_date: '2025-12-19', gross_loss_inr: 2200000, recovery_inr: 400000, business_line: 'payment_settlement', basel_event_type: 'external_fraud', linked_risk_id: 'R-FC-001', linked_control_ids: ['CTRL-AML-003'], accountable_senior_manager_id: 'SM-MLRO-001' },
  { loss_event_id: 'LEV-2026-006', event_date: '2026-04-02', gross_loss_inr: 650000, recovery_inr: 150000, business_line: 'commercial_banking', basel_event_type: 'employment_practices_workplace_safety', linked_risk_id: 'R-OP-001', linked_control_ids: [], accountable_senior_manager_id: 'SM-OPS-001' },
  { loss_event_id: 'LEV-2026-007', event_date: '2026-02-28', gross_loss_inr: 1800000, recovery_inr: 0, business_line: 'retail_banking', basel_event_type: 'clients_products_business_practices', linked_risk_id: 'R-CD-001', linked_control_ids: ['CTRL-LND-002'], accountable_senior_manager_id: 'SM-BH-RETAIL-001' },
  { loss_event_id: 'LEV-2026-008', event_date: '2025-10-11', gross_loss_inr: 450000, recovery_inr: 0, business_line: 'commercial_banking', basel_event_type: 'clients_products_business_practices', linked_risk_id: 'R-CR-001', linked_control_ids: ['CTRL-LND-001'], accountable_senior_manager_id: 'SM-BH-RETAIL-001' },
  { loss_event_id: 'LEV-2026-009', event_date: '2026-01-05', gross_loss_inr: 3200000, recovery_inr: 1100000, business_line: 'agency_services', basel_event_type: 'damage_to_physical_assets', linked_risk_id: 'R-OP-001', linked_control_ids: [], accountable_senior_manager_id: 'SM-OPS-001' },
  { loss_event_id: 'LEV-2026-010', event_date: '2026-04-18', gross_loss_inr: 5600000, recovery_inr: 800000, business_line: 'corporate_finance', basel_event_type: 'business_disruption_system_failures', linked_risk_id: 'R-TC-001', linked_control_ids: ['CTRL-ITO-001'], accountable_senior_manager_id: 'SM-CISO-001' },
  { loss_event_id: 'LEV-2026-011', event_date: '2025-09-27', gross_loss_inr: 780000, recovery_inr: 200000, business_line: 'retail_banking', basel_event_type: 'execution_delivery_process_management', linked_risk_id: 'R-CO-001', linked_control_ids: ['CTRL-KYC-003'], accountable_senior_manager_id: 'SM-CCO-001' },
  { loss_event_id: 'LEV-2026-012', event_date: '2026-03-30', gross_loss_inr: 1250000, recovery_inr: 0, business_line: 'payment_settlement', basel_event_type: 'execution_delivery_process_management', linked_risk_id: 'R-OP-001', linked_control_ids: ['CTRL-AML-002'], accountable_senior_manager_id: 'SM-OPS-001' },
];

const pacNotes = [
  {
    pac_note_id: 'PACN-2026-001',
    document_type: 'sop',
    business_unit: 'Retail Banking',
    status: 'pending_orm_review',
    blocking_preventive_action_ids: ['PA-2026-ORI-01', 'PA-2026-ORI-02'],
    referenced_rca_ids: [],
    comments: [{ at: '2026-05-02T10:00:00Z', author_role: 'ORM', text: 'ORM review pending — link to RCSA Retail Liabilities cycle RC-FY26-H1-RL.' }],
  },
  {
    pac_note_id: 'PACN-2026-002',
    document_type: 'process_note',
    business_unit: 'Financial Crime',
    status: 'pending_orm_review',
    blocking_preventive_action_ids: [],
    referenced_rca_ids: ['RCA-2026-ORI-01'],
    comments: [{ at: '2026-05-04T11:30:00Z', author_role: 'MLRO-PO', text: 'PMLA STR workflow capacity note; no hard regulatory code invented — references existing PMLA s.12 STR timeline discipline.' }],
  },
  {
    pac_note_id: 'PACN-2026-003',
    document_type: 'product_program',
    business_unit: 'Digital Lending',
    status: 'pending_orm_review',
    blocking_preventive_action_ids: ['PA-2026-ORI-07'],
    referenced_rca_ids: ['RCA-2026-ORI-03'],
    comments: [{ at: '2026-05-05T09:15:00Z', author_role: 'Head-ORM', text: 'Condition: complete LOS sequence guard retest before DLA scale-up per RBI MD on Digital Lending KFS discipline.' }],
  },
  {
    pac_note_id: 'PACN-2026-004',
    document_type: 'new_product_approval',
    business_unit: 'Payments',
    status: 'conditional_approval',
    blocking_preventive_action_ids: [],
    referenced_rca_ids: [],
    comments: [
      { at: '2026-04-28T14:00:00Z', author_role: 'ORM', text: 'Conditional approval: NPCI UPI limit pilot only after FCC sign-off on mule typology rules.' },
      { at: '2026-04-29T16:00:00Z', author_role: 'CRO', text: 'Condition accepted — ORMC MOM to capture decision.' },
    ],
  },
  {
    pac_note_id: 'PACN-2026-005',
    document_type: 'sop',
    business_unit: 'IT Operations',
    status: 'conditional_approval',
    blocking_preventive_action_ids: [],
    referenced_rca_ids: ['RCA-2026-ORI-09'],
    comments: [{ at: '2026-05-01T08:00:00Z', author_role: 'CISO', text: 'Condition: DR drill evidence pack for CERT-In six-hour runbook attached to CTRL-ITO-001 test population.' }],
  },
  {
    pac_note_id: 'PACN-2026-006',
    document_type: 'process_note',
    business_unit: 'Corporate Banking',
    status: 'approved',
    blocking_preventive_action_ids: [],
    referenced_rca_ids: ['RCA-2026-ORI-02', 'RCA-2026-ORI-04'],
    comments: [{ at: '2026-04-20T12:00:00Z', author_role: 'ORM', text: 'Approved with linkage to supervisory readiness pack evidence indices.' }],
  },
  {
    pac_note_id: 'PACN-2026-007',
    document_type: 'sop',
    business_unit: 'Treasury',
    status: 'approved',
    blocking_preventive_action_ids: [],
    referenced_rca_ids: ['RCA-2026-ORI-05'],
    comments: [{ at: '2026-04-25T17:45:00Z', author_role: 'ORM', text: 'TPSP fourth-party disclosure PAC closed-loop referenced in RCA-2026-ORI-05.' }],
  },
  {
    pac_note_id: 'PACN-2026-008',
    document_type: 'product_program',
    business_unit: 'Wealth',
    status: 'rejected',
    blocking_preventive_action_ids: [],
    referenced_rca_ids: ['RCA-2026-ORI-08'],
    comments: [
      { at: '2026-05-06T13:00:00Z', author_role: 'ORM', text: 'Rejected: customer-facing APR script still references deprecated fee slab; re-submit after CCO attestation.' },
      { at: '2026-05-06T13:30:00Z', author_role: 'CCO', text: 'Acknowledged — will align to current RBI MD on Digital Lending disclosures.' },
    ],
  },
];

function block(name, obj) {
  const lines = JSON.stringify(obj, null, 2).split('\n');
  lines[0] = `  ${name}: ${lines[0]}`;
  for (let i = 1; i < lines.length; i++) lines[i] = `  ${lines[i]}`;
  return lines.join('\n');
}
const frag = [
  block('rcsaCycles', rcsaCycles),
  block('rcsaCells', rcsaCells),
  block('incidents', inc),
  block('rcas', rcas),
  block('preventiveActions', pacts),
  block('lossEvents', lossEvents),
  block('pacNotes', pacNotes),
].join(',\n\n');
const outPath = fileURLToPath(new URL('./_oriFragment.txt', import.meta.url));
fs.writeFileSync(outPath, frag + '\n', { encoding: 'utf8' });
console.log('Wrote _oriFragment.txt');

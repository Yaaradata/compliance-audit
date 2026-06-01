/**
 * Enterprise cockpit layer (CRO / MD&CEO landing).
 * Process journeys in auditData.ts are the drill-down target.
 */
import { domains } from './auditData';

export const postureKpis = [
  {
    key: 'res',
    label: 'RES · Residual risk',
    value: '72',
    tone: 'warn' as const,
    trend: 'down' as const,
    sub: 'Enterprise mean · 9 risk domains',
    appetite: 'Appetite ≤ 70 · 2 pts over',
    spark: [70, 74, 79, 83, 80, 76, 71, 68, 74, 72],
  },
  {
    key: 'ces',
    label: 'CES · Control effectiveness',
    value: '84.9',
    tone: 'good' as const,
    trend: 'down' as const,
    sub: 'Active controls · weighted mean',
    appetite: 'Target ≥ 85 · marginal',
    spark: [88, 89, 90, 88, 87, 86, 86, 85, 85, 84.9],
  },
  {
    key: 'kri',
    label: 'KRI breach rate',
    value: '78%',
    tone: 'bad' as const,
    trend: 'flat' as const,
    sub: '7 of 9 active KRIs at / above amber',
    appetite: 'Appetite ≤ 40% · breached',
    spark: [40, 45, 55, 60, 72, 80, 78, 76, 79, 78],
  },
  {
    key: 'ars',
    label: 'Inspection readiness · ARS',
    value: '76',
    tone: 'warn' as const,
    trend: 'down' as const,
    sub: '5 packs active · weighted ARS',
    appetite: 'Target ≥ 85 · 9 pts short',
    spark: [80, 82, 81, 79, 78, 77, 79, 78, 77, 76],
  },
];

export const aiWall = {
  reviewQueue: 5,
  updated: '05:15 IST',
  items: [
    {
      id: 'AI-001',
      tag: 'REGULATORY' as const,
      confidence: 94,
      title: 'KYC reporting breach risk — CKYCR submission delay detected',
      recommendation:
        'Engage CERSAI for ack-batch latency improvement; mark CKYCR as degraded source-system.',
      link: 'customer-kyc',
    },
    {
      id: 'AI-002',
      tag: 'REGULATORY' as const,
      confidence: 86,
      title: 'CTR deadline at risk — FIU-IND acknowledgement not received for March cycle',
      recommendation: 'Open issue against ack-archival automation; tie to OBL-FIU-CTR-001.',
      link: 'transactions',
    },
    {
      id: 'AI-003',
      tag: 'FRAUD' as const,
      confidence: 81,
      title: 'Organised fraud network detected — UPI mule ring, 7 nodes (Wave 2)',
      recommendation: 'Freeze linked accounts; raise STR cluster; brief Board Fraud Committee.',
      link: 'aml',
    },
    {
      id: 'AI-004',
      tag: 'CONDUCT' as const,
      confidence: 88,
      title: 'KFS issued post-acceptance — 11,118 lending instances affected',
      recommendation: 'Customer remediation plan; validate loan-origination gating control CL-09.',
      link: 'credit-loans',
    },
    {
      id: 'AI-005',
      tag: 'CYBER' as const,
      confidence: 79,
      title: 'Privileged access not revoked on exit — 8-day exposure window',
      recommendation: 'Automate JML de-provisioning trigger; review IAM control OP-08.',
      link: 'ops-3p',
    },
  ],
};

export const riskAppetite = [
  {
    metric: 'Net NPA ratio',
    actual: '3.8%',
    limit: '≤ 4.0%',
    status: 'warn' as const,
    pos: 86,
    note: 'Within appetite, trending up',
  },
  {
    metric: 'CRAR (capital adequacy)',
    actual: '15.2%',
    limit: '≥ 13.0%',
    status: 'good' as const,
    pos: 72,
    note: 'Comfortable headroom',
  },
  {
    metric: 'Op-risk loss / gross income',
    actual: '2.1%',
    limit: '≤ 2.0%',
    status: 'bad' as const,
    pos: 105,
    note: 'Breached — escalate to RMCB',
  },
  {
    metric: 'High / Critical open issues',
    actual: '14',
    limit: '≤ 10',
    status: 'bad' as const,
    pos: 100,
    note: 'Breached — 4 over tolerance',
  },
  {
    metric: 'STR filing timeliness',
    actual: '92%',
    limit: '≥ 98%',
    status: 'warn' as const,
    pos: 78,
    note: '6 pts below tolerance',
  },
  {
    metric: 'Top-20 borrower concentration',
    actual: '18%',
    limit: '≤ 20%',
    status: 'good' as const,
    pos: 64,
    note: 'Within appetite',
  },
];

export const topMovers = {
  deteriorated: [
    { name: 'Financial Crime / AML', from: 70, to: 58, delta: -12 },
    { name: 'Conduct Risk', from: 76, to: 67, delta: -9 },
    { name: 'Operational Risk', from: 75, to: 70, delta: -5 },
  ],
  improved: [
    { name: 'Credit Risk', from: 78, to: 81, delta: 3 },
    { name: 'Model Risk / AI Gov.', from: 77, to: 79, delta: 2 },
  ],
};

export const governance = {
  tiles: [
    { key: 'rts', label: 'RTS · Reporting timeliness', score: '75%', trend: 'up' as const, target: '≥ 90%' },
    { key: 'saes', label: 'SAES · Self-assessment effectiveness', score: '78', trend: 'up' as const, target: '≥ 80' },
    { key: 'aites', label: 'AITES · Audit issue timeliness', score: '83', trend: 'up' as const, target: '≥ 85' },
  ],
  note: 'RTS at 75% — 3 submissions tracking below completion threshold for next 14-day window.',
};

export const supervisory = {
  nextInspection: { name: 'RBI AFI 2026', date: '14 Jul 2026', daysLeft: 73 },
  lenses: [
    { lens: 'RBI AFI', ars: 73, status: 'warn' as const },
    { lens: 'RBS / SPARC', ars: null, status: 'gap' as const },
    { lens: 'PMLA / FIU Evidence', ars: 68, status: 'bad' as const },
    { lens: 'ITGRCA / CSITE / CERT-In', ars: null, status: 'gap' as const },
    { lens: 'Concurrent Audit', ars: 86, status: 'good' as const },
    { lens: 'Statutory Audit', ars: 76, status: 'warn' as const },
    { lens: 'Board / Audit Committee Pack', ars: 78, status: 'warn' as const },
  ],
};

export const regDeadlines = [
  {
    name: 'CTR filing — FIU-IND (Mar cycle ack)',
    ref: 'OBL-FIU-CTR-001',
    due: '15 May 2026',
    daysLeft: 13,
    status: 'at-risk' as const,
    owner: 'MLRO-PO',
  },
  {
    name: 'CKYCR batch upload — CERSAI',
    ref: 'OBL-CKYCR-014',
    due: 'Daily · next 03 May',
    daysLeft: 1,
    status: 'degraded' as const,
    owner: 'CIO',
  },
  {
    name: 'STR filing — open suspicious alerts',
    ref: 'OBL-FIU-STR-007',
    due: 'Rolling 7-day',
    daysLeft: 3,
    status: 'at-risk' as const,
    owner: 'MLRO',
  },
  {
    name: 'RBS / SPARC risk data submission',
    ref: 'OBL-RBI-RBS-002',
    due: '31 May 2026',
    daysLeft: 29,
    status: 'on-track' as const,
    owner: 'CRO',
  },
  {
    name: 'Basel III Pillar 3 disclosure',
    ref: 'OBL-RBI-P3-009',
    due: '30 Jun 2026',
    daysLeft: 59,
    status: 'on-track' as const,
    owner: 'CFO',
  },
];

export const issues = [
  {
    id: 'ISS-2026-027',
    title: 'Fourth-party non-disclosure — outsourcing control breach',
    owner: 'Chief Information Officer',
    role: 'CIO',
    sev: 'HIGH' as const,
    score: 81,
    age: 41,
    overdue: true,
  },
  {
    id: 'ISS-2026-031',
    title: 'CKYCR submission delay — CERSAI ack latency',
    owner: 'Chief Information Officer',
    role: 'CIO',
    sev: 'HIGH' as const,
    score: 79,
    age: 15,
    overdue: false,
  },
  {
    id: 'ISS-2026-009',
    title: 'AML STR window at risk — BPO floor',
    owner: 'MLRO / Prevention Officer',
    role: 'MLRO-PO',
    sev: 'HIGH' as const,
    score: 72,
    age: 22,
    overdue: false,
  },
  {
    id: 'ISS-2026-085',
    title: 'KFS issued post-acceptance — 11,118 lending instances affected',
    owner: 'Chief Information Officer',
    role: 'CIO',
    sev: 'HIGH' as const,
    score: 64,
    age: 9,
    overdue: false,
  },
  {
    id: 'ISS-2026-052',
    title: 'Nostro break aging beyond 30 days',
    owner: 'Chief Financial Officer',
    role: 'CFO',
    sev: 'MED' as const,
    score: 58,
    age: 33,
    overdue: true,
  },
];

export const incidents = {
  ytdEvents: 37,
  grossLoss: '₹14.2 Cr',
  recovered: '₹5.1 Cr',
  netLoss: '₹9.1 Cr',
  nearMiss: 12,
  categories: [
    { cat: 'External fraud', count: 11, amount: '₹3.1 Cr', weight: 100 },
    { cat: 'Internal fraud', count: 8, amount: '₹6.4 Cr', weight: 92 },
    { cat: 'Process failure', count: 9, amount: '₹2.0 Cr', weight: 64 },
    { cat: 'Vendor / outsourcing', count: 6, amount: '₹0.7 Cr', weight: 40 },
    { cat: 'Cyber / IT', count: 3, amount: '₹1.0 Cr', weight: 28 },
  ],
};

export const riskDomains = [
  {
    id: 'credit',
    name: 'Credit Risk',
    res: 81,
    inherent: 88,
    trend: 'flat' as const,
    status: 'good' as const,
    aiFlag: false,
    link: 'credit-loans',
    note: 'RES stable at 81 for 3 consecutive assessments — consider triggering reassessment to avoid score staleness.',
  },
  {
    id: 'operational',
    name: 'Operational Risk',
    res: 70,
    inherent: 82,
    trend: 'down' as const,
    status: 'warn' as const,
    aiFlag: false,
    link: 'transactions',
    note: 'KRI KRI-OP-001 trending amber (0.092) — validate threshold calibration against current sanction cohort.',
  },
  {
    id: 'compliance',
    name: 'Compliance Risk',
    res: 74,
    inherent: 80,
    trend: 'flat' as const,
    status: 'warn' as const,
    aiFlag: true,
    link: 'customer-kyc',
    note: 'KYC reporting breach risk — CKYCR submission delay detected.',
  },
  {
    id: 'conduct',
    name: 'Conduct Risk',
    res: 67,
    inherent: 79,
    trend: 'down' as const,
    status: 'bad' as const,
    aiFlag: false,
    link: 'customer-kyc',
    note: 'Residual score has declined 17 points over 2 cycles — review control effectiveness for 6 linked controls.',
  },
  {
    id: 'techcyber',
    name: 'Technology / Cyber Risk',
    res: 78,
    inherent: 85,
    trend: 'flat' as const,
    status: 'warn' as const,
    aiFlag: false,
    link: 'infra-cyber',
    note: 'RES stable at 78 for 3 consecutive assessments — consider triggering reassessment to avoid score staleness.',
  },
  {
    id: 'fincrime',
    name: 'Financial Crime / AML',
    res: 58,
    inherent: 84,
    trend: 'down' as const,
    status: 'bad' as const,
    aiFlag: true,
    link: 'aml',
    note: 'KYC reporting breach + STR timeliness — sharpest enterprise deterioration this cycle.',
  },
  {
    id: 'thirdparty',
    name: 'Third Party / Outsourcing',
    res: 76,
    inherent: 83,
    trend: 'flat' as const,
    status: 'warn' as const,
    aiFlag: false,
    link: 'ops-3p',
    note: 'RES stable at 76 for 3 consecutive assessments — consider triggering reassessment to avoid score staleness.',
  },
  {
    id: 'fraud',
    name: 'Fraud Risk',
    res: 64,
    inherent: 86,
    trend: 'flat' as const,
    status: 'bad' as const,
    aiFlag: true,
    link: 'aml',
    note: 'Organised fraud network detected — UPI mule ring, 7 nodes (Wave 2).',
  },
  {
    id: 'model',
    name: 'Model Risk / AI Governance',
    res: 79,
    inherent: 80,
    trend: 'flat' as const,
    status: 'warn' as const,
    aiFlag: false,
    link: 'data-gov',
    note: 'RES stable at 79 for 3 consecutive assessments — consider triggering reassessment to avoid score staleness.',
  },
];

export const clocksAtRisk = 2;

export const domainById = Object.fromEntries(domains.map((d) => [d.id, d]));

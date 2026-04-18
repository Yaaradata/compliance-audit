import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, TrendingUp, TrendingDown,
  Activity, Users, Briefcase, CreditCard, AlertOctagon, Lock, Server,
  Database, DollarSign, UserCog, Search, Filter, Download, Bell, Clock,
  FileText, ChevronRight, Building2, Eye
} from 'lucide-react';

// ============================================================================
// SAMPLE DATA — all 10 control domains
// ============================================================================

const DOMAINS = [
  { id: 'overview',     label: 'Overview',           icon: Activity,      color: '#0f766e' },
  { id: 'customer',     label: 'Customer Lifecycle', icon: Users,         color: '#1d4ed8' },
  { id: 'loan',         label: 'Loans',              icon: Briefcase,     color: '#7c3aed' },
  { id: 'transaction',  label: 'Transactions',       icon: CreditCard,    color: '#0891b2' },
  { id: 'risk',         label: 'Risk & Fraud',       icon: AlertOctagon,  color: '#dc2626' },
  { id: 'access',       label: 'Access & Identity',  icon: Lock,          color: '#d97706' },
  { id: 'itchange',     label: 'IT & Change',        icon: Server,        color: '#059669' },
  { id: 'infra',        label: 'Infrastructure',     icon: Shield,        color: '#475569' },
  { id: 'data',         label: 'Data Governance',    icon: Database,      color: '#be185d' },
  { id: 'finance',      label: 'Financial',          icon: DollarSign,    color: '#15803d' },
  { id: 'ops',          label: 'Operational',        icon: UserCog,       color: '#6d28d9' },
];

// Domain-level compliance summary
const DOMAIN_SUMMARY = [
  { domain: 'Customer Lifecycle',   processes: 5, compliance: 94.2, violations: 12, exceptions: 38, trend: +1.3 },
  { domain: 'Loans',                processes: 7, compliance: 89.7, violations: 24, exceptions: 71, trend: -0.8 },
  { domain: 'Transactions',         processes: 6, compliance: 97.1, violations:  6, exceptions: 19, trend: +0.4 },
  { domain: 'Risk & Fraud',         processes: 6, compliance: 91.5, violations: 18, exceptions: 44, trend: +2.1 },
  { domain: 'Access & Identity',    processes: 7, compliance: 86.3, violations: 41, exceptions: 62, trend: -1.5 },
  { domain: 'IT & Change',          processes: 6, compliance: 92.8, violations: 11, exceptions: 28, trend: +0.7 },
  { domain: 'Infrastructure',       processes: 6, compliance: 95.4, violations:  7, exceptions: 15, trend: +0.9 },
  { domain: 'Data Governance',      processes: 5, compliance: 88.9, violations: 16, exceptions: 33, trend: -0.3 },
  { domain: 'Financial',            processes: 5, compliance: 96.7, violations:  4, exceptions: 11, trend: +0.5 },
  { domain: 'Operational',          processes: 4, compliance: 90.2, violations:  9, exceptions: 22, trend: +0.2 },
];

// Sample Loan Onboarding customers — this drives the Customer Journey view
const LOAN_CUSTOMERS = [
  { id: 'CUST-0001', name: 'Ravi Kumar',      date: '2026-03-15', kyc: 'pass', docs: 'pass', score: 720, eligibility: 'pass',  approval: 'pass', exception: '-',    sanction: 'pass', disb: 'pass', status: 'compliant',   note: 'All controls passed' },
  { id: 'CUST-0002', name: 'Usha Rao',        date: '2026-03-16', kyc: 'fail', docs: 'pass', score: 740, eligibility: 'pass',  approval: 'pass', exception: '-',    sanction: 'pass', disb: 'pass', status: 'critical',    note: 'KYC not verified before approval' },
  { id: 'CUST-0003', name: 'Sridhar Menon',   date: '2026-03-16', kyc: 'pass', docs: 'pass', score: 620, eligibility: 'fail',  approval: 'pass', exception: 'AVP-Credit',     sanction: 'pass', disb: 'pass', status: 'exception', note: 'Credit score below threshold, AVP override recorded' },
  { id: 'CUST-0004', name: 'Sowmya Iyer',     date: '2026-03-17', kyc: 'pass', docs: 'fail', score: 710, eligibility: 'pass',  approval: 'pass', exception: 'Branch Mgr',     sanction: 'pass', disb: 'pass', status: 'exception', note: 'Income doc missing, BM override recorded' },
  { id: 'CUST-0005', name: 'Karthik Subram.', date: '2026-03-17', kyc: 'pass', docs: 'pass', score: 780, eligibility: 'pass',  approval: 'pass', exception: '-',    sanction: 'pass', disb: 'pass', status: 'compliant',   note: 'Straight-through, all controls passed' },
  { id: 'CUST-0006', name: 'Subashini N',     date: '2026-03-18', kyc: 'pass', docs: 'fail', score: 690, eligibility: 'pass',  approval: 'pass', exception: '-',    sanction: 'pass', disb: 'pass', status: 'critical',    note: 'Missing docs, no override approval recorded' },
  { id: 'CUST-0007', name: 'Murali Krishna',  date: '2026-03-18', kyc: 'pass', docs: 'pass', score: 580, eligibility: 'fail',  approval: 'rej',  exception: '-',    sanction: '-',    disb: '-',    status: 'compliant',   note: 'Properly rejected — policy-compliant rejection' },
  { id: 'CUST-0008', name: 'Anurag Joshi',    date: '2026-03-19', kyc: 'pass', docs: 'pass', score: 755, eligibility: 'pass',  approval: 'pass', exception: '-',    sanction: 'pass', disb: 'pass', status: 'compliant',   note: 'All controls passed' },
  { id: 'CUST-0009', name: 'Gaurav Shah',     date: '2026-03-19', kyc: 'pass', docs: 'pass', score: 640, eligibility: 'fail',  approval: 'pass', exception: 'missing',        sanction: 'pass', disb: 'pass', status: 'critical',    note: 'Exception raised but no documented approver' },
  { id: 'CUST-0010', name: 'Priya Nair',      date: '2026-03-20', kyc: 'pass', docs: 'pass', score: 730, eligibility: 'pass',  approval: 'pass', exception: '-',    sanction: 'pass', disb: 'fail', status: 'critical',    note: 'Disbursement record missing post-approval' },
];

// Control compliance time series (last 30 days, sampled weekly)
const TREND_30D = [
  { week: 'W-4', compliance: 90.1, violations: 72, exceptions: 180 },
  { week: 'W-3', compliance: 91.4, violations: 65, exceptions: 192 },
  { week: 'W-2', compliance: 92.3, violations: 58, exceptions: 205 },
  { week: 'W-1', compliance: 92.6, violations: 54, exceptions: 211 },
  { week: 'W-0', compliance: 93.1, violations: 48, exceptions: 218 },
];

// Control-level compliance per domain (detailed drill-down)
const DOMAIN_PROCESSES = {
  customer: [
    { process: 'CASA Onboarding',      compliance: 95.4, vol: 3420, violations: 4, exceptions: 12 },
    { process: 'Loan Onboarding',      compliance: 91.8, vol: 1880, violations: 5, exceptions: 18 },
    { process: 'KYC / Re-KYC',         compliance: 93.1, vol: 2150, violations: 2, exceptions:  6 },
    { process: 'Risk Profiling',       compliance: 96.7, vol: 3420, violations: 1, exceptions:  1 },
    { process: 'Customer Offboarding', compliance: 94.0, vol:  240, violations: 0, exceptions:  1 },
  ],
  loan: [
    { process: 'Loan Application Intake',         compliance: 94.2, vol: 1880, violations: 2, exceptions:  8 },
    { process: 'Eligibility & Credit Assessment', compliance: 88.6, vol: 1880, violations: 6, exceptions: 22 },
    { process: 'Loan Approval Authority',         compliance: 90.1, vol: 1420, violations: 4, exceptions: 15 },
    { process: 'Loan Disbursement',               compliance: 92.7, vol: 1380, violations: 3, exceptions:  9 },
    { process: 'Repayment & EMI Processing',      compliance: 87.4, vol: 8200, violations: 5, exceptions: 11 },
    { process: 'Exception / Override',            compliance: 85.9, vol:  240, violations: 2, exceptions:  6 },
    { process: 'Loan Closure',                    compliance: 93.8, vol:  620, violations: 2, exceptions:  0 },
  ],
  transaction: [
    { process: 'Fund Transfer Authorization', compliance: 97.8, vol: 142000, violations: 2, exceptions:  4 },
    { process: 'Limit & Threshold',           compliance: 98.4, vol: 142000, violations: 1, exceptions:  2 },
    { process: 'Cash Handling',               compliance: 96.1, vol:  18400, violations: 1, exceptions:  3 },
    { process: 'Cheque Processing',           compliance: 95.3, vol:  28400, violations: 1, exceptions:  5 },
    { process: 'Payment Reversal',            compliance: 97.0, vol:    840, violations: 0, exceptions:  3 },
    { process: 'Failed Transaction Handling', compliance: 98.2, vol:   2140, violations: 1, exceptions:  2 },
  ],
  risk: [
    { process: 'AML Monitoring',                      compliance: 92.4, vol: 8420, violations: 4, exceptions: 11 },
    { process: 'Suspicious Transaction Reporting',    compliance: 89.7, vol:  142, violations: 3, exceptions:  8 },
    { process: 'Sanctions Screening',                 compliance: 95.8, vol:142000, violations: 1, exceptions:  2 },
    { process: 'Fraud Detection & Escalation',        compliance: 90.1, vol: 3620, violations: 5, exceptions: 14 },
    { process: 'Regulatory Reporting',                compliance: 93.2, vol:  280, violations: 2, exceptions:  5 },
    { process: 'Exception Approval',                  compliance: 87.6, vol:  420, violations: 3, exceptions:  4 },
  ],
  access: [
    { process: 'User Access Provisioning',    compliance: 88.3, vol: 1420, violations: 8,  exceptions: 14 },
    { process: 'User Access De-provisioning', compliance: 82.1, vol:  620, violations: 12, exceptions: 11 },
    { process: 'Privileged Access',           compliance: 90.4, vol:  280, violations: 5,  exceptions:  8 },
    { process: 'Role-Based Access (RBAC)',    compliance: 85.7, vol: 4200, violations: 7,  exceptions: 12 },
    { process: 'Segregation of Duties',       compliance: 83.2, vol: 4200, violations: 6,  exceptions: 11 },
    { process: 'MFA Enforcement',             compliance: 91.8, vol: 4200, violations: 2,  exceptions:  4 },
    { process: 'Dormant Account',             compliance: 86.5, vol:  840, violations: 1,  exceptions:  2 },
  ],
  itchange: [
    { process: 'Change Management',    compliance: 93.4, vol: 420, violations: 3, exceptions:  9 },
    { process: 'Release Approval',     compliance: 94.1, vol: 280, violations: 2, exceptions:  5 },
    { process: 'Code Review',          compliance: 90.2, vol:2400, violations: 3, exceptions:  7 },
    { process: 'Deployment',           compliance: 92.8, vol: 840, violations: 1, exceptions:  3 },
    { process: 'Incident Management',  compliance: 94.5, vol: 220, violations: 1, exceptions:  2 },
    { process: 'Patch & Vulnerability',compliance: 91.3, vol: 620, violations: 1, exceptions:  2 },
  ],
  infra: [
    { process: 'Server Access',         compliance: 94.2, vol: 2400, violations: 2, exceptions:  4 },
    { process: 'Network Access',        compliance: 96.1, vol:  840, violations: 1, exceptions:  3 },
    { process: 'Firewall Rule',         compliance: 95.4, vol:  620, violations: 1, exceptions:  2 },
    { process: 'Cloud Resource Access', compliance: 93.7, vol: 1420, violations: 2, exceptions:  4 },
    { process: 'Backup & Restore',      compliance: 97.8, vol:  420, violations: 0, exceptions:  1 },
    { process: 'Disaster Recovery',     compliance: 95.2, vol:   12, violations: 1, exceptions:  1 },
  ],
  data: [
    { process: 'Data Access',         compliance: 87.4, vol: 3420, violations: 6, exceptions: 12 },
    { process: 'Data Classification', compliance: 89.1, vol: 8400, violations: 3, exceptions:  6 },
    { process: 'Data Encryption',     compliance: 94.2, vol: 1240, violations: 2, exceptions:  4 },
    { process: 'Data Retention',      compliance: 86.8, vol:  420, violations: 3, exceptions:  6 },
    { process: 'PII Protection',      compliance: 88.7, vol: 5620, violations: 2, exceptions:  5 },
  ],
  finance: [
    { process: 'General Ledger',        compliance: 97.8, vol: 8420, violations: 1, exceptions:  3 },
    { process: 'Reconciliation',        compliance: 95.4, vol:  420, violations: 1, exceptions:  3 },
    { process: 'Revenue Recognition',   compliance: 98.2, vol:   42, violations: 0, exceptions:  1 },
    { process: 'Expense Approval',      compliance: 96.1, vol: 1420, violations: 1, exceptions:  2 },
    { process: 'Vendor Payment',        compliance: 96.7, vol:  840, violations: 1, exceptions:  2 },
  ],
  ops: [
    { process: 'Vendor Onboarding',            compliance: 91.2, vol:  42, violations: 2, exceptions:  4 },
    { process: 'Third-Party Risk',             compliance: 88.7, vol: 142, violations: 3, exceptions:  6 },
    { process: 'Employee Access Mapping',      compliance: 92.4, vol: 840, violations: 2, exceptions:  7 },
    { process: 'HR Joiner-Mover-Leaver',       compliance: 89.3, vol: 420, violations: 2, exceptions:  5 },
  ],
};

// Recent exceptions / alerts (global feed)
const RECENT_ALERTS = [
  { id: 'EX-24091', ts: '09:42', domain: 'Loans',            severity: 'critical', process: 'Loan Disbursement',       msg: 'Disbursement record missing post-approval (CUST-0010)' },
  { id: 'EX-24090', ts: '09:28', domain: 'Customer',         severity: 'critical', process: 'Loan Onboarding',         msg: 'KYC unverified before approval (CUST-0002)' },
  { id: 'EX-24089', ts: '09:14', domain: 'Access',           severity: 'high',     process: 'De-provisioning',         msg: 'Leaver access not revoked within T+1 (5 users)' },
  { id: 'EX-24088', ts: '08:57', domain: 'Loans',            severity: 'medium',   process: 'Credit Assessment',       msg: 'Score below threshold, override approved by AVP (CUST-0003)' },
  { id: 'EX-24087', ts: '08:41', domain: 'Risk',             severity: 'high',     process: 'AML Monitoring',          msg: 'L1 review SLA breach on 7 alerts' },
  { id: 'EX-24086', ts: '08:22', domain: 'Data',             severity: 'medium',   process: 'PII Protection',          msg: 'DLP alert: bulk PII export by user RJ-0442' },
  { id: 'EX-24085', ts: '07:58', domain: 'Access',           severity: 'high',     process: 'SoD',                     msg: 'SoD conflict detected: maker-checker overlap in Corp Loans' },
  { id: 'EX-24084', ts: '07:32', domain: 'Transactions',     severity: 'medium',   process: 'Cash Handling',           msg: 'CTR reporting delay — 2 transactions past T+1' },
];

// KPI top-line
const KPI = {
  processes: 57,
  transactions: 188420,
  compliance: 93.1,
  criticalViolations: 18,
  pendingExceptions: 44,
  complianceDelta: +0.5,
};

// Overall compliance status donut
const STATUS_BREAKDOWN = [
  { name: 'Compliant',          value: 1756, color: '#10b981' },
  { name: 'Approved Exception', value:  218, color: '#f59e0b' },
  { name: 'Critical Violation', value:   48, color: '#ef4444' },
  { name: 'Under Review',       value:   62, color: '#64748b' },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const StatusIcon = ({ v }) => {
  if (v === 'pass') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (v === 'fail') return <XCircle       className="w-4 h-4 text-red-600" />;
  if (v === 'rej')  return <XCircle       className="w-4 h-4 text-slate-400" />;
  if (v === 'missing') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  if (v === '-')   return <span className="text-slate-300 text-xs">—</span>;
  return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
};

const StatusBadge = ({ status }) => {
  const map = {
    compliant: { bg: 'bg-emerald-50', fg: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Compliant' },
    exception: { bg: 'bg-amber-50',   fg: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Approved Exception' },
    critical:  { bg: 'bg-red-50',     fg: 'text-red-700',     ring: 'ring-red-200',     label: 'Critical Violation' },
  };
  const s = map[status] || map.compliant;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${s.bg} ${s.fg} ring-1 ${s.ring}`}>
      {s.label}
    </span>
  );
};

const SeverityDot = ({ sev }) => {
  const colors = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-slate-400' };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[sev]}`} />;
};
// ============================================================================
// KPI STRIP
// ============================================================================

const KpiStrip = () => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
    <div className="bg-white rounded-lg p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Processes Monitored</span>
        <Activity className="w-4 h-4 text-slate-400" />
      </div>
      <div className="text-2xl font-semibold text-slate-900">{KPI.processes}</div>
      <div className="text-xs text-slate-500 mt-1">across 10 domains</div>
    </div>

    <div className="bg-white rounded-lg p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Transactions (24h)</span>
        <TrendingUp className="w-4 h-4 text-slate-400" />
      </div>
      <div className="text-2xl font-semibold text-slate-900">{KPI.transactions.toLocaleString('en-IN')}</div>
      <div className="text-xs text-slate-500 mt-1">audited end-to-end</div>
    </div>

    <div className="bg-emerald-50 rounded-lg p-4 ring-1 ring-emerald-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">Overall Compliance</span>
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-emerald-900">{KPI.compliance}%</div>
        <span className="text-xs font-medium text-emerald-700">+{KPI.complianceDelta}% WoW</span>
      </div>
      <div className="text-xs text-emerald-700/80 mt-1">target: 95%</div>
    </div>

    <div className="bg-red-50 rounded-lg p-4 ring-1 ring-red-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wider text-red-700 font-semibold">Critical Violations</span>
        <AlertOctagon className="w-4 h-4 text-red-600" />
      </div>
      <div className="text-2xl font-semibold text-red-900">{KPI.criticalViolations}</div>
      <div className="text-xs text-red-700/80 mt-1">require immediate action</div>
    </div>

    <div className="bg-amber-50 rounded-lg p-4 ring-1 ring-amber-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold">Pending Exceptions</span>
        <Clock className="w-4 h-4 text-amber-600" />
      </div>
      <div className="text-2xl font-semibold text-amber-900">{KPI.pendingExceptions}</div>
      <div className="text-xs text-amber-700/80 mt-1">awaiting approver</div>
    </div>
  </div>
);

// ============================================================================
// OVERVIEW TAB
// ============================================================================

const OverviewTab = () => (
  <div className="space-y-6">
    {/* Row 1: trend + status breakdown */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-lg ring-1 ring-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Compliance & violations — last 5 weeks</h3>
            <p className="text-xs text-slate-500 mt-0.5">Cross-domain rollup</p>
          </div>
          <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded ring-1 ring-emerald-200">+3 pts MoM</span>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_30D} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="gCmp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" fontSize={11} stroke="#64748b" />
              <YAxis yAxisId="l" domain={[85, 100]} fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="r" orientation="right" fontSize={11} stroke="#64748b" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area yAxisId="l" type="monotone" dataKey="compliance" stroke="#10b981" fill="url(#gCmp)" strokeWidth={2} name="Compliance %" />
              <Line yAxisId="r" type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Violations" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Transaction disposition</h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-3">Current audit snapshot</p>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={STATUS_BREAKDOWN}
                cx="50%" cy="50%"
                innerRadius={48} outerRadius={78}
                paddingAngle={2} dataKey="value"
              >
                {STATUS_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 mt-2">
          {STATUS_BREAKDOWN.map((s) => (
            <div key={s.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-slate-700">{s.name}</span>
              </span>
              <span className="font-medium text-slate-900">{s.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Row 2: domain compliance bar chart */}
    <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Compliance by control domain</h3>
          <p className="text-xs text-slate-500 mt-0.5">Hover for details — 57 processes rolled up</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-slate-600">Target</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-700 font-medium">≥95% green</span>
          <span className="text-amber-700 font-medium">90-95% amber</span>
          <span className="text-red-700 font-medium">&lt;90% red</span>
        </div>
      </div>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DOMAIN_SUMMARY} margin={{ top: 8, right: 8, left: -10, bottom: 56 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="domain" fontSize={10} stroke="#64748b" angle={-28} textAnchor="end" interval={0} height={60} />
            <YAxis domain={[80, 100]} fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v, n) => n === 'compliance' ? [`${v}%`, 'Compliance'] : v} />
            <Bar dataKey="compliance" radius={[4, 4, 0, 0]}>
              {DOMAIN_SUMMARY.map((d, i) => (
                <Cell key={i} fill={d.compliance >= 95 ? '#10b981' : d.compliance >= 90 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Row 3: domain cards + alerts */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 bg-white rounded-lg ring-1 ring-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Domain rollup</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="pb-2 font-semibold">Domain</th>
                <th className="pb-2 font-semibold text-center">Processes</th>
                <th className="pb-2 font-semibold text-center">Compliance</th>
                <th className="pb-2 font-semibold text-center">Violations</th>
                <th className="pb-2 font-semibold text-center">Exceptions</th>
                <th className="pb-2 font-semibold text-center">WoW</th>
              </tr>
            </thead>
            <tbody>
              {DOMAIN_SUMMARY.map((d) => (
                <tr key={d.domain} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 text-slate-800">{d.domain}</td>
                  <td className="py-2 text-center text-slate-600">{d.processes}</td>
                  <td className="py-2 text-center">
                    <span className={`font-medium ${d.compliance >= 95 ? 'text-emerald-700' : d.compliance >= 90 ? 'text-amber-700' : 'text-red-700'}`}>
                      {d.compliance}%
                    </span>
                  </td>
                  <td className="py-2 text-center text-red-700 font-medium">{d.violations}</td>
                  <td className="py-2 text-center text-amber-700 font-medium">{d.exceptions}</td>
                  <td className="py-2 text-center">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${d.trend >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {d.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(d.trend)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-lg ring-1 ring-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Live alert feed</h3>
          <span className="text-xs text-slate-500">Today</span>
        </div>
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {RECENT_ALERTS.map((a) => (
            <div key={a.id} className="flex gap-3 p-2.5 rounded-md hover:bg-slate-50 border border-slate-100">
              <div className="pt-1"><SeverityDot sev={a.severity} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                  <span className="font-mono">{a.id}</span>
                  <span>·</span>
                  <span>{a.ts}</span>
                  <span>·</span>
                  <span className="text-slate-700 font-medium">{a.domain}</span>
                </div>
                <div className="text-xs text-slate-800 leading-relaxed">{a.msg}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{a.process}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// CUSTOMER JOURNEY TAB (loan onboarding detail view)
// ============================================================================

const LoanJourneyTable = ({ rows }) => {
  const stages = [
    { key: 'kyc',         label: 'KYC' },
    { key: 'docs',        label: 'Docs' },
    { key: 'score',       label: 'Score' },
    { key: 'eligibility', label: 'Eligibility' },
    { key: 'approval',    label: 'Approval' },
    { key: 'exception',   label: 'Exception' },
    { key: 'sanction',    label: 'Sanction' },
    { key: 'disb',        label: 'Disburse' },
  ];

  const stageValue = (r, k) => {
    if (k === 'score') return <span className={`text-xs font-semibold ${r.score >= 700 ? 'text-emerald-700' : r.score >= 650 ? 'text-amber-700' : 'text-red-700'}`}>{r.score}</span>;
    if (k === 'exception') {
      if (r.exception === '-') return <span className="text-slate-300 text-xs">—</span>;
      if (r.exception === 'missing') return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700"><AlertTriangle className="w-3 h-3" />missing</span>;
      return <span className="text-[11px] font-medium text-amber-700">{r.exception}</span>;
    }
    return <StatusIcon v={r[k]} />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50">
            <th className="px-3 py-2 font-semibold">Customer</th>
            <th className="px-2 py-2 font-semibold">Applied</th>
            {stages.map((s) => (
              <th key={s.key} className="px-2 py-2 font-semibold text-center">{s.label}</th>
            ))}
            <th className="px-3 py-2 font-semibold">Status</th>
            <th className="px-3 py-2 font-semibold">Audit note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/70">
              <td className="px-3 py-2.5">
                <div className="font-medium text-slate-900">{r.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{r.id}</div>
              </td>
              <td className="px-2 py-2.5 text-xs text-slate-600">{r.date}</td>
              {stages.map((s) => (
                <td key={s.key} className="px-2 py-2.5 text-center">{stageValue(r, s.key)}</td>
              ))}
              <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
              <td className="px-3 py-2.5 text-xs text-slate-600 max-w-xs">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// DOMAIN TAB (reusable for all 9 non-overview domains)
// ============================================================================

const DomainTab = ({ domainId, loanCustomers = LOAN_CUSTOMERS }) => {
  const domain = DOMAINS.find((d) => d.id === domainId);
  const processes = DOMAIN_PROCESSES[domainId] || [];

  const totals = useMemo(() => ({
    compliance: processes.length ? (processes.reduce((s, p) => s + p.compliance, 0) / processes.length).toFixed(1) : 0,
    vol:        processes.reduce((s, p) => s + p.vol, 0),
    violations: processes.reduce((s, p) => s + p.violations, 0),
    exceptions: processes.reduce((s, p) => s + p.exceptions, 0),
  }), [processes]);

  const [selectedProcess, setSelectedProcess] = useState(processes[0]?.process);

  return (
    <div className="space-y-6">
      {/* Domain header strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-4 ring-1 ring-slate-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Domain compliance</div>
          <div className="text-2xl font-semibold text-slate-900">{totals.compliance}%</div>
        </div>
        <div className="bg-white rounded-lg p-4 ring-1 ring-slate-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Volume (24h)</div>
          <div className="text-2xl font-semibold text-slate-900">{totals.vol.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 ring-1 ring-red-200">
          <div className="text-[11px] uppercase tracking-wider text-red-700 font-semibold mb-1">Critical violations</div>
          <div className="text-2xl font-semibold text-red-900">{totals.violations}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 ring-1 ring-amber-200">
          <div className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold mb-1">Approved exceptions</div>
          <div className="text-2xl font-semibold text-amber-900">{totals.exceptions}</div>
        </div>
      </div>

      {/* Process compliance chart */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Process compliance — {domain.label}</h3>
        <p className="text-xs text-slate-500 mb-4">Click a bar to inspect the process below</p>
        <div style={{ height: Math.max(240, processes.length * 44) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processes} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[80, 100]} fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="process" fontSize={11} stroke="#64748b" width={200} tick={{ textAnchor: 'end' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, 'Compliance']} />
              <Bar dataKey="compliance" radius={[0, 4, 4, 0]} onClick={(d) => setSelectedProcess(d.process)}>
                {processes.map((p, i) => (
                  <Cell key={i}
                        fill={p.compliance >= 95 ? '#10b981' : p.compliance >= 90 ? '#f59e0b' : '#ef4444'}
                        style={{ cursor: 'pointer', opacity: p.process === selectedProcess ? 1 : 0.75 }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Process detail table + exception split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Process-level detail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="pb-2 font-semibold">Process</th>
                  <th className="pb-2 font-semibold text-right">Volume</th>
                  <th className="pb-2 font-semibold text-center">Compliance</th>
                  <th className="pb-2 font-semibold text-center">Violations</th>
                  <th className="pb-2 font-semibold text-center">Exceptions</th>
                  <th className="pb-2 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p) => (
                  <tr key={p.process}
                      className={`border-b border-slate-100 cursor-pointer ${p.process === selectedProcess ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                      onClick={() => setSelectedProcess(p.process)}>
                    <td className="py-2 text-slate-800 font-medium">{p.process}</td>
                    <td className="py-2 text-right text-slate-600">{p.vol.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-center">
                      <span className={`font-semibold ${p.compliance >= 95 ? 'text-emerald-700' : p.compliance >= 90 ? 'text-amber-700' : 'text-red-700'}`}>
                        {p.compliance}%
                      </span>
                    </td>
                    <td className="py-2 text-center text-red-700 font-medium">{p.violations}</td>
                    <td className="py-2 text-center text-amber-700 font-medium">{p.exceptions}</td>
                    <td className="py-2 text-center">
                      <button className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Violations vs exceptions</h3>
          <p className="text-xs text-slate-500 mb-3">Per process in this domain</p>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processes} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="process" fontSize={9} stroke="#64748b" angle={-32} textAnchor="end" interval={0} height={56} />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="violations" stackId="a" fill="#ef4444" name="Violations" radius={[0, 0, 0, 0]} />
                <Bar dataKey="exceptions" stackId="a" fill="#f59e0b" name="Exceptions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer journey (only for Customer Lifecycle + Loan domains) */}
      {(domainId === 'customer' || domainId === 'loan') && (
        <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Customer journey — Loan onboarding</h3>
              <p className="text-xs text-slate-500 mt-0.5">Transaction-level audit: each customer&apos;s pass/fail per control stage</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />pass</span>
              <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-red-600" />fail</span>
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" />exception</span>
            </div>
          </div>
          <LoanJourneyTable rows={loanCustomers} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function BankingAuditDashboard({ initialLoanCustomers }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const loanCustomers = initialLoanCustomers?.length ? initialLoanCustomers : LOAN_CUSTOMERS;

  return (
    <div className="min-h-screen bg-slate-100" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif' }}>

      {/* Top bar */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Fluid Intelligence</div>
              <div className="text-[11px] text-slate-400 leading-tight">Banking Audit & Control Intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-md px-3 py-1.5 text-sm w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer, transaction, process..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-0 focus:outline-none text-slate-200 placeholder-slate-500 text-sm flex-1"
              />
            </div>
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-semibold">8</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <div className="text-xs font-medium">Audit Lead</div>
                <div className="text-[10px] text-slate-400">17 Apr 2026 · Q1 close review</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold">AL</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {DOMAINS.map((d) => {
              const Icon = d.icon;
              const isActive = activeTab === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveTab(d.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  style={isActive ? { borderColor: d.color, color: d.color } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Body */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">

        {/* Title strip */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {DOMAINS.find((d) => d.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {activeTab === 'overview'
                ? 'Cross-domain compliance posture · Transaction-level audit rollup across 57 processes'
                : `Process stages, control evidence, and transaction-level compliance for ${DOMAINS.find((d) => d.id === activeTab)?.label.toLowerCase()} controls`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 bg-white ring-1 ring-slate-200 rounded-md hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 bg-white ring-1 ring-slate-200 rounded-md hover:bg-slate-50">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-slate-900 rounded-md hover:bg-slate-800">
              <Eye className="w-4 h-4" /> Auditor view
            </button>
          </div>
        </div>

        <KpiStrip />

        {/* Tab content */}
        {activeTab === 'overview' ? <OverviewTab /> : <DomainTab domainId={activeTab} loanCustomers={loanCustomers} />}

        {/* Footer */}
        <div className="mt-10 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span><FileText className="w-3.5 h-3.5 inline mr-1" /> 57 processes · 377 control stages · 220 datasets mapped</span>
          </div>
          <div>Last refresh: 17 Apr 2026, 10:04 IST · next run in 56 min</div>
        </div>

      </main>
    </div>
  );
}

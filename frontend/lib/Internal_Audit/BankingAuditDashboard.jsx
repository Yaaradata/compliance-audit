'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts';
import {
  Shield, AlertTriangle, AlertCircle, CheckCircle2, XCircle,
  Activity, Users, Briefcase, CreditCard, AlertOctagon, Lock, Server,
  Database, DollarSign, UserCog, Search, Filter, Download, Clock,
  FileText, ChevronRight, ChevronDown, Building2, Eye, X, FileCheck2, ListChecks,
  UserCheck, Gavel, BadgeCheck, FolderSearch,
  Workflow, GitBranch, MinusCircle, Info, UserRound,
  CalendarClock, MapPin, Mail, Hash,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// DOMAIN CATALOG — 10 control domains (auditor view)
// ============================================================================

const DOMAINS = [
  { id: 'overview',    label: 'Overview',              icon: Activity,     color: '#0f766e' },
  { id: 'customer',    label: 'Customer / KYC',        icon: Users,        color: '#1d4ed8' },
  { id: 'loan',        label: 'Credit & Loans',        icon: Briefcase,    color: '#7c3aed' },
  { id: 'transaction', label: 'Transactions & Payments', icon: CreditCard, color: '#0891b2' },
  { id: 'risk',        label: 'AML, Risk & Fraud',     icon: AlertOctagon, color: '#dc2626' },
  { id: 'access',      label: 'Access & Identity',     icon: Lock,         color: '#d97706' },
  { id: 'itchange',    label: 'IT Change Mgmt',        icon: Server,       color: '#059669' },
  { id: 'infra',       label: 'Infrastructure & Cyber',icon: Shield,       color: '#475569' },
  { id: 'data',        label: 'Data Governance',       icon: Database,     color: '#be185d' },
  { id: 'finance',     label: 'Financial Reporting',   icon: DollarSign,   color: '#15803d' },
  { id: 'ops',         label: 'Operations & 3rd Party',icon: UserCog,      color: '#6d28d9' },
];

// ============================================================================
// CONTROLS LIBRARY — proper auditor-grade banking controls
// Each control has identical schema so the UI / evidence stays consistent.
// ============================================================================

/**
 * Control schema:
 *  id:           Unique control ID
 *  name:         Control title
 *  objective:    What the control is designed to achieve
 *  regulatory:   Regulatory / framework references
 *  owner:        Business / IT owner
 *  frequency:    Continuous / Daily / Monthly / Quarterly / Annual
 *  population:   Total transactions / records in scope (24h)
 *  sample:       Records tested by audit
 *  exceptions:   Number of exceptions observed
 *  violations:   Critical breaches (subset of exceptions)
 *  compliance:   % compliance score
 *  status:       effective | needs-attention | deficient
 *  lastTested:   Last audit test date
 *  tester:       Audit team member
 */

const CUSTOMER_CONTROLS = [
  { id: 'CL-01', name: 'Customer Identification Program (CIP)', objective: 'Verify PAN / Aadhaar / Passport at onboarding before any account activity.', regulatory: 'RBI KYC Master Direction 2016, PMLA 2002', owner: 'Branch Operations', frequency: 'Continuous', population: 3420, sample: 120, exceptions: 4, violations: 1, compliance: 96.7, status: 'effective' },
  { id: 'CL-02', name: 'Customer Due Diligence (CDD) — risk categorization', objective: 'All customers classified Low / Medium / High risk at onboarding.', regulatory: 'RBI KYC MD §8, FATF Recommendation 10', owner: 'AML Compliance', frequency: 'Continuous', population: 3420, sample: 120, exceptions: 7, violations: 2, compliance: 94.2, status: 'effective' },
  { id: 'CL-03', name: 'Enhanced Due Diligence (EDD) for PEP / High-Risk', objective: 'Approved EDD evidence on file before activating high-risk relationships.', regulatory: 'RBI KYC MD §11, FATF R-12', owner: 'AML Compliance', frequency: 'Continuous', population: 184, sample: 60, exceptions: 6, violations: 2, compliance: 90.0, status: 'needs-attention' },
  { id: 'CL-04', name: 'Periodic Re-KYC per risk category', objective: 'Low: 10y, Medium: 8y, High: 2y — re-KYC completed before due date.', regulatory: 'RBI KYC MD §38', owner: 'Branch Operations', frequency: 'Monthly', population: 2150, sample: 100, exceptions: 11, violations: 3, compliance: 89.0, status: 'needs-attention' },
  { id: 'CL-05', name: 'Beneficial Ownership identification (>25%)', objective: 'UBO identified and verified for all non-individual customers.', regulatory: 'RBI KYC MD §43, Companies Act §90', owner: 'Corporate Onboarding', frequency: 'Continuous', population: 412, sample: 80, exceptions: 5, violations: 1, compliance: 93.8, status: 'effective' },
  { id: 'CL-06', name: 'Sanctions / PEP / Adverse media screening', objective: '100% of new customers screened against OFAC / UN / RBI sanctions lists.', regulatory: 'UAPA 1967, RBI UNSCR Guidelines', owner: 'AML Compliance', frequency: 'Continuous', population: 3420, sample: 150, exceptions: 2, violations: 0, compliance: 98.7, status: 'effective' },
  { id: 'CL-07', name: 'Customer risk profile refresh on trigger', objective: 'Risk profile re-assessed on adverse news / large value / cross-border trigger.', regulatory: 'RBI KYC MD §38(e)', owner: 'AML Compliance', frequency: 'Continuous', population: 520, sample: 80, exceptions: 8, violations: 2, compliance: 90.0, status: 'needs-attention' },
  { id: 'CL-08', name: 'Dormant account reactivation KYC', objective: 'Fresh KYC obtained before dormant account reactivation.', regulatory: 'RBI DBOD Circular on dormant accounts', owner: 'Branch Operations', frequency: 'Continuous', population: 240, sample: 60, exceptions: 3, violations: 1, compliance: 95.0, status: 'effective' },
  { id: 'CL-09', name: 'Customer offboarding & closure control', objective: 'Closure approval, outstanding dues cleared, systems revoked within T+2.', regulatory: 'RBI Grievance Redressal; internal SOP-CUS-012', owner: 'Branch Operations', frequency: 'Continuous', population: 140, sample: 40, exceptions: 1, violations: 0, compliance: 97.5, status: 'effective' },
];

const LOAN_CONTROLS = [
  { id: 'LN-01', name: 'Loan application intake completeness', objective: 'All mandatory fields & KYC captured in LOS before underwriting.', regulatory: 'Internal Credit Policy §4', owner: 'Credit Ops', frequency: 'Continuous', population: 1880, sample: 120, exceptions: 8, violations: 2, compliance: 93.3, status: 'effective' },
  { id: 'LN-02', name: 'Bureau pull authorization & scoring', objective: 'CIBIL / Experian pull only with customer consent; score logged.', regulatory: 'CIC (Regulation) Act 2005', owner: 'Credit Ops', frequency: 'Continuous', population: 1880, sample: 100, exceptions: 3, violations: 1, compliance: 97.0, status: 'effective' },
  { id: 'LN-03', name: 'Underwriting per approved policy matrix', objective: 'Decisioning respects DSR / FOIR / LTV thresholds per product.', regulatory: 'Internal Credit Policy §6, RBI PSL norms', owner: 'Credit Underwriting', frequency: 'Continuous', population: 1880, sample: 120, exceptions: 14, violations: 4, compliance: 88.3, status: 'needs-attention' },
  { id: 'LN-04', name: 'Delegation of Authority (DOA) compliance', objective: 'Sanction only by officer within DOA limit; all overrides approved.', regulatory: 'Board Approved DOA Matrix', owner: 'Credit Risk', frequency: 'Continuous', population: 1420, sample: 80, exceptions: 9, violations: 3, compliance: 88.8, status: 'needs-attention' },
  { id: 'LN-05', name: 'Collateral valuation & legal perfection', objective: 'Two independent valuations + legal clearance prior to disbursement (secured loans).', regulatory: 'RBI Prudential Norms', owner: 'Credit Ops', frequency: 'Continuous', population: 820, sample: 80, exceptions: 6, violations: 2, compliance: 92.5, status: 'effective' },
  { id: 'LN-06', name: 'Sanction letter issuance & acceptance', objective: 'Signed sanction letter on file before disbursement.', regulatory: 'Internal SOP-LN-009', owner: 'Credit Ops', frequency: 'Continuous', population: 1420, sample: 80, exceptions: 2, violations: 0, compliance: 97.5, status: 'effective' },
  { id: 'LN-07', name: 'Disbursement control (acct validation / end-use)', objective: 'Penny drop / end-use declaration completed prior to release.', regulatory: 'Internal Credit Policy §8', owner: 'Disbursement Team', frequency: 'Continuous', population: 1380, sample: 80, exceptions: 4, violations: 1, compliance: 95.0, status: 'effective' },
  { id: 'LN-08', name: 'Post-disbursement monitoring (PDM)', objective: 'PDM visit / end-use verification within stipulated days.', regulatory: 'RBI Monitoring Guidelines', owner: 'Credit Monitoring', frequency: 'Monthly', population: 620, sample: 80, exceptions: 11, violations: 3, compliance: 86.3, status: 'needs-attention' },
  { id: 'LN-09', name: 'NPA classification per IRAC', objective: 'Accounts classified SMA-0/1/2 & NPA correctly basis days past due.', regulatory: 'RBI Master Circular IRAC', owner: 'Credit Risk', frequency: 'Monthly', population: 8200, sample: 150, exceptions: 7, violations: 2, compliance: 95.3, status: 'effective' },
  { id: 'LN-10', name: 'Provisioning per RBI guidelines', objective: 'Standard / Sub-standard / Doubtful provisioning %s correctly applied.', regulatory: 'RBI Master Circular Provisioning', owner: 'Finance', frequency: 'Monthly', population: 8200, sample: 120, exceptions: 3, violations: 1, compliance: 97.5, status: 'effective' },
  { id: 'LN-11', name: 'Restructuring approvals', objective: 'Restructuring only with board-committee approval & disclosed per RBI.', regulatory: 'RBI Resolution Framework 2.0', owner: 'Credit Committee', frequency: 'Monthly', population: 46, sample: 46, exceptions: 2, violations: 1, compliance: 95.7, status: 'effective' },
  { id: 'LN-12', name: 'Write-off authorization matrix', objective: 'Write-offs approved by competent authority & disclosed.', regulatory: 'Board Policy; RBI MD on Prudential Norms', owner: 'Credit Committee', frequency: 'Monthly', population: 22, sample: 22, exceptions: 1, violations: 0, compliance: 95.5, status: 'effective' },
];

const TX_CONTROLS = [
  { id: 'TX-01', name: 'Maker-Checker on high-value transactions', objective: 'All ≥ ₹10L transactions require dual control (maker & checker).', regulatory: 'RBI Cyber Security MD, Internal SOP-OPS-003', owner: 'Operations', frequency: 'Continuous', population: 14200, sample: 200, exceptions: 4, violations: 1, compliance: 98.0, status: 'effective' },
  { id: 'TX-02', name: 'Transaction limit enforcement', objective: 'Per-product / per-channel daily and per-txn limits enforced.', regulatory: 'RBI Payment System Guidelines', owner: 'Channels', frequency: 'Continuous', population: 142000, sample: 300, exceptions: 3, violations: 1, compliance: 99.0, status: 'effective' },
  { id: 'TX-03', name: 'Beneficiary validation (NEFT / RTGS / IMPS)', objective: 'Cooling period & confirmation for newly added beneficiaries.', regulatory: 'RBI NEFT/RTGS Operating Guidelines', owner: 'Channels', frequency: 'Continuous', population: 28400, sample: 150, exceptions: 4, violations: 1, compliance: 97.3, status: 'effective' },
  { id: 'TX-04', name: 'Cheque processing & PDC control', objective: 'PDC custody, CTS truncation, return processing within T+1.', regulatory: 'RBI Cheque Truncation Guidelines', owner: 'Clearing', frequency: 'Daily', population: 28400, sample: 120, exceptions: 5, violations: 1, compliance: 95.8, status: 'effective' },
  { id: 'TX-05', name: 'Cash handling & CTR filing (>₹10L)', objective: 'All cash transactions > ₹10L reported to FIU-IND within 15 days.', regulatory: 'PMLA Rules, FIU-IND CTR Format', owner: 'AML Compliance', frequency: 'Daily', population: 18400, sample: 180, exceptions: 6, violations: 2, compliance: 96.7, status: 'effective' },
  { id: 'TX-06', name: 'Forex / LRS limit monitoring', objective: 'Outward remittance within USD 250k LRS annual limit per individual.', regulatory: 'FEMA 1999, RBI LRS Master Direction', owner: 'Treasury', frequency: 'Daily', population: 640, sample: 80, exceptions: 2, violations: 1, compliance: 97.5, status: 'effective' },
  { id: 'TX-07', name: 'Payment reversal authorization', objective: 'Reversals only with documented reason + approver.', regulatory: 'Internal SOP-OPS-011', owner: 'Operations', frequency: 'Continuous', population: 840, sample: 80, exceptions: 3, violations: 1, compliance: 96.3, status: 'effective' },
  { id: 'TX-08', name: 'Failed transaction reconciliation', objective: 'Failed debits reversed within T+1 per TAT norms.', regulatory: 'RBI Harmonisation of TAT 2019', owner: 'Reconciliation', frequency: 'Daily', population: 2140, sample: 100, exceptions: 4, violations: 1, compliance: 96.0, status: 'effective' },
  { id: 'TX-09', name: 'Intraday liquidity monitoring', objective: 'RTGS / CCIL position monitored intraday; breaches escalated.', regulatory: 'BCBS 248', owner: 'Treasury', frequency: 'Continuous', population: 240, sample: 60, exceptions: 2, violations: 0, compliance: 96.7, status: 'effective' },
];

const RISK_CONTROLS = [
  { id: 'RK-01', name: 'Transaction monitoring scenarios (AML)', objective: 'Rule library tuned; alerts reviewed L1/L2 within SLA.', regulatory: 'RBI AML MD, FATF R-20', owner: 'AML Compliance', frequency: 'Continuous', population: 8420, sample: 200, exceptions: 14, violations: 4, compliance: 91.0, status: 'needs-attention' },
  { id: 'RK-02', name: 'Suspicious Transaction Reports (STR)', objective: 'STR filed to FIU-IND within 7 working days of conclusion of suspicion.', regulatory: 'PMLA Rule 3', owner: 'AML Compliance', frequency: 'Daily', population: 142, sample: 60, exceptions: 6, violations: 2, compliance: 90.0, status: 'needs-attention' },
  { id: 'RK-03', name: 'Cash Transaction Reports (CTR) to FIU', objective: 'All qualifying cash txns reported by 15th of next month.', regulatory: 'PMLA Rule 3', owner: 'AML Compliance', frequency: 'Monthly', population: 4200, sample: 120, exceptions: 3, violations: 1, compliance: 97.5, status: 'effective' },
  { id: 'RK-04', name: 'Sanctions screening (OFAC / UN / RBI)', objective: 'Real-time screening of txns & beneficiaries; true hits blocked.', regulatory: 'UNSCR 1267, UAPA 1967', owner: 'AML Compliance', frequency: 'Continuous', population: 142000, sample: 200, exceptions: 2, violations: 0, compliance: 99.0, status: 'effective' },
  { id: 'RK-05', name: 'Fraud case management (FRM)', objective: 'Fraud cases classified, RCA within 30 days, reported to RBI.', regulatory: 'RBI Fraud Reporting MD', owner: 'Fraud Control Unit', frequency: 'Continuous', population: 3620, sample: 140, exceptions: 9, violations: 3, compliance: 93.6, status: 'effective' },
  { id: 'RK-06', name: 'Chargeback & dispute resolution', objective: 'Disputes resolved within network / TAT (Visa / MC / UPI).', regulatory: 'RBI Harmonisation of TAT', owner: 'Cards Ops', frequency: 'Daily', population: 1820, sample: 100, exceptions: 5, violations: 1, compliance: 95.0, status: 'effective' },
  { id: 'RK-07', name: 'Whistleblower & internal fraud investigation', objective: 'Whistleblower channel operative; independent investigation.', regulatory: 'SEBI LODR, Whistleblower Policy', owner: 'Vigilance', frequency: 'Continuous', population: 24, sample: 24, exceptions: 1, violations: 0, compliance: 95.8, status: 'effective' },
];

const ACCESS_CONTROLS = [
  { id: 'AC-01', name: 'User access provisioning with manager approval', objective: 'All new access requests require line manager + app owner approval.', regulatory: 'ISO 27001 A.9.2, RBI Cyber Security MD', owner: 'IAM Team', frequency: 'Continuous', population: 1420, sample: 120, exceptions: 14, violations: 4, compliance: 88.3, status: 'needs-attention' },
  { id: 'AC-02', name: 'Timely de-provisioning on exit', objective: 'Sensitive access revoked T+0; all access within T+1 of exit.', regulatory: 'ISO 27001 A.9.2.6', owner: 'IAM Team', frequency: 'Continuous', population: 620, sample: 80, exceptions: 16, violations: 5, compliance: 80.0, status: 'deficient' },
  { id: 'AC-03', name: 'Privileged Access Management (PAM)', objective: 'All privileged IDs vaulted; sessions recorded & reviewed weekly.', regulatory: 'RBI Cyber Security MD §G', owner: 'IT Security', frequency: 'Continuous', population: 280, sample: 80, exceptions: 8, violations: 2, compliance: 90.0, status: 'needs-attention' },
  { id: 'AC-04', name: 'Role-Based Access Control (RBAC)', objective: 'Access granted only via defined roles; least-privilege.', regulatory: 'ISO 27001 A.9.1.1', owner: 'IAM Team', frequency: 'Continuous', population: 4200, sample: 160, exceptions: 12, violations: 3, compliance: 92.5, status: 'effective' },
  { id: 'AC-05', name: 'Segregation of Duties (SoD) — maker ≠ checker', objective: 'No single user holds conflicting maker & checker roles in core banking.', regulatory: 'COBIT APO13, SOX ICoFR', owner: 'IAM + Risk', frequency: 'Continuous', population: 4200, sample: 160, exceptions: 11, violations: 3, compliance: 93.1, status: 'effective' },
  { id: 'AC-06', name: 'MFA enforcement on critical apps', objective: 'MFA enforced on core banking, PAM, email, remote access.', regulatory: 'RBI Cyber Security MD §H', owner: 'IT Security', frequency: 'Continuous', population: 4200, sample: 200, exceptions: 4, violations: 1, compliance: 98.0, status: 'effective' },
  { id: 'AC-07', name: 'Quarterly User Access Review (UAR)', objective: 'Business owners certify user access list quarterly.', regulatory: 'SOX, ISO 27001 A.9.2.5', owner: 'Application Owners', frequency: 'Quarterly', population: 4200, sample: 4200, exceptions: 18, violations: 4, compliance: 89.2, status: 'needs-attention' },
  { id: 'AC-08', name: 'Dormant account / ID lockout', objective: 'IDs inactive > 90 days automatically locked.', regulatory: 'ISO 27001 A.9.2.5', owner: 'IAM Team', frequency: 'Continuous', population: 840, sample: 80, exceptions: 3, violations: 1, compliance: 96.3, status: 'effective' },
  { id: 'AC-09', name: 'Shared / generic account usage', objective: 'Generic IDs prohibited except approved service accounts; rotated credentials.', regulatory: 'ISO 27001 A.9.2.4', owner: 'IT Security', frequency: 'Continuous', population: 142, sample: 80, exceptions: 6, violations: 1, compliance: 92.5, status: 'effective' },
];

const CHANGE_CONTROLS = [
  { id: 'CM-01', name: 'CAB approval for production changes', objective: 'All standard / normal changes approved by CAB with RFC.', regulatory: 'ITIL Change Mgmt, RBI Cyber MD', owner: 'Change Mgmt Office', frequency: 'Weekly', population: 420, sample: 80, exceptions: 7, violations: 2, compliance: 91.3, status: 'needs-attention' },
  { id: 'CM-02', name: 'Code review & peer sign-off', objective: 'Pull requests require ≥1 peer approval + lint / SAST pass.', regulatory: 'Secure SDLC Policy', owner: 'Engineering', frequency: 'Continuous', population: 2400, sample: 160, exceptions: 9, violations: 2, compliance: 94.4, status: 'effective' },
  { id: 'CM-03', name: 'Segregation of dev / test / prod', objective: 'Developers have no direct write access to production.', regulatory: 'ISO 27001 A.12.1.4, SOX', owner: 'DevOps', frequency: 'Continuous', population: 420, sample: 80, exceptions: 4, violations: 1, compliance: 95.0, status: 'effective' },
  { id: 'CM-04', name: 'Release approval & deployment window', objective: 'Production release only during approved window with rollback plan.', regulatory: 'ITIL Release Mgmt', owner: 'DevOps', frequency: 'Weekly', population: 280, sample: 80, exceptions: 5, violations: 1, compliance: 93.8, status: 'effective' },
  { id: 'CM-05', name: 'Rollback plan & post-impl review', objective: 'Every change has documented rollback; PIR within 5 days.', regulatory: 'ITIL Change Mgmt', owner: 'DevOps', frequency: 'Weekly', population: 280, sample: 80, exceptions: 6, violations: 1, compliance: 92.5, status: 'effective' },
  { id: 'CM-06', name: 'Emergency change post-facto approval', objective: 'Emergency changes reviewed & ratified by CAB within 48h.', regulatory: 'ITIL Change Mgmt', owner: 'Change Mgmt Office', frequency: 'Continuous', population: 42, sample: 42, exceptions: 4, violations: 1, compliance: 90.5, status: 'needs-attention' },
  { id: 'CM-07', name: 'Incident management & P1 RCA', objective: 'All P1 incidents closed with RCA within 7 days.', regulatory: 'ITIL Incident Mgmt', owner: 'IT Operations', frequency: 'Continuous', population: 220, sample: 80, exceptions: 3, violations: 1, compliance: 96.3, status: 'effective' },
  { id: 'CM-08', name: 'Patch management SLA', objective: 'Critical patches applied ≤ 14 days; High ≤ 30 days.', regulatory: 'RBI Cyber MD, ISO 27001 A.12.6', owner: 'IT Security', frequency: 'Monthly', population: 620, sample: 120, exceptions: 9, violations: 2, compliance: 92.5, status: 'effective' },
];

const INFRA_CONTROLS = [
  { id: 'IN-01', name: 'Firewall rule review (quarterly)', objective: 'All firewall rules reviewed / justified / stale rules removed.', regulatory: 'PCI-DSS 1.1.7, ISO 27001 A.13.1', owner: 'Network Security', frequency: 'Quarterly', population: 2400, sample: 200, exceptions: 9, violations: 2, compliance: 95.5, status: 'effective' },
  { id: 'IN-02', name: 'Server OS hardening baseline', objective: 'All servers built from CIS-hardened image; drift monitored.', regulatory: 'CIS Benchmark, ISO 27001 A.12.5', owner: 'IT Ops', frequency: 'Continuous', population: 840, sample: 120, exceptions: 6, violations: 1, compliance: 95.0, status: 'effective' },
  { id: 'IN-03', name: 'Network segmentation (card / core)', objective: 'PCI zones isolated from corporate & internet-facing networks.', regulatory: 'PCI-DSS 1.3', owner: 'Network Security', frequency: 'Continuous', population: 120, sample: 120, exceptions: 2, violations: 0, compliance: 98.3, status: 'effective' },
  { id: 'IN-04', name: 'Cloud IAM least privilege', objective: 'Cloud accounts follow least-privilege; no wildcard admin roles.', regulatory: 'CIS Cloud Benchmarks, RBI Cloud Guidance', owner: 'Cloud Security', frequency: 'Continuous', population: 1420, sample: 160, exceptions: 11, violations: 3, compliance: 93.1, status: 'effective' },
  { id: 'IN-05', name: 'Backup completeness & restore testing', objective: 'Daily backups complete; half-yearly restore test successful.', regulatory: 'RBI BCP-DR Guidance, ISO 27001 A.12.3', owner: 'IT Ops', frequency: 'Daily', population: 420, sample: 120, exceptions: 3, violations: 0, compliance: 97.5, status: 'effective' },
  { id: 'IN-06', name: 'DR drill (half-yearly)', objective: 'RTO / RPO validated via DR drill; report to Board IT Committee.', regulatory: 'RBI BCP-DR Guidance', owner: 'IT Ops', frequency: 'Half-yearly', population: 12, sample: 12, exceptions: 1, violations: 0, compliance: 91.7, status: 'needs-attention' },
  { id: 'IN-07', name: 'Vulnerability scan cadence', objective: 'Internal / external VA monthly; findings tracked to closure.', regulatory: 'RBI Cyber MD §C, PCI-DSS 11.2', owner: 'IT Security', frequency: 'Monthly', population: 840, sample: 160, exceptions: 8, violations: 2, compliance: 94.0, status: 'effective' },
  { id: 'IN-08', name: 'Penetration test remediation', objective: 'PT findings (Critical/High) remediated within SLA.', regulatory: 'RBI Cyber MD §C, PCI-DSS 11.3', owner: 'IT Security', frequency: 'Half-yearly', population: 96, sample: 96, exceptions: 5, violations: 1, compliance: 94.8, status: 'effective' },
];

const DATA_CONTROLS = [
  { id: 'DT-01', name: 'Data classification policy', objective: 'All data assets classified Public / Internal / Confidential / Restricted.', regulatory: 'DPDP Act 2023, ISO 27001 A.8.2', owner: 'Data Office', frequency: 'Annual', population: 3420, sample: 200, exceptions: 18, violations: 4, compliance: 91.0, status: 'needs-attention' },
  { id: 'DT-02', name: 'PII masking in non-prod', objective: 'Production PII masked / tokenised before use in lower environments.', regulatory: 'DPDP Act 2023 §8', owner: 'Data Office', frequency: 'Continuous', population: 1240, sample: 120, exceptions: 9, violations: 2, compliance: 92.5, status: 'effective' },
  { id: 'DT-03', name: 'Data retention per regulatory norms', objective: 'Records retained min 5y (PMLA) / 8y (RBI); purged thereafter.', regulatory: 'PMLA §12, DPDP Act §8(7)', owner: 'Records Mgmt', frequency: 'Monthly', population: 420, sample: 80, exceptions: 7, violations: 2, compliance: 91.3, status: 'needs-attention' },
  { id: 'DT-04', name: 'DLP policy enforcement', objective: 'Endpoint / email / web DLP enabled; incidents triaged.', regulatory: 'ISO 27001 A.13.2, RBI Cyber MD', owner: 'IT Security', frequency: 'Continuous', population: 5620, sample: 200, exceptions: 12, violations: 3, compliance: 94.0, status: 'effective' },
  { id: 'DT-05', name: 'Encryption at-rest & in-transit', objective: 'AES-256 for storage / TDE for DB; TLS 1.2+ for all flows.', regulatory: 'PCI-DSS 3 & 4, ISO A.10.1', owner: 'IT Security', frequency: 'Continuous', population: 1240, sample: 160, exceptions: 4, violations: 1, compliance: 97.5, status: 'effective' },
  { id: 'DT-06', name: 'Customer consent & purpose limitation', objective: 'Processing only for consented purpose; consent refresh captured.', regulatory: 'DPDP Act 2023 §6', owner: 'DPO', frequency: 'Continuous', population: 3420, sample: 120, exceptions: 11, violations: 2, compliance: 90.8, status: 'needs-attention' },
  { id: 'DT-07', name: 'Right to erasure / correction', objective: 'DPDP data principal requests closed within 30 days.', regulatory: 'DPDP Act 2023 §12', owner: 'DPO', frequency: 'Continuous', population: 84, sample: 84, exceptions: 3, violations: 1, compliance: 96.4, status: 'effective' },
  { id: 'DT-08', name: 'Cross-border data transfer control', objective: 'Transfers only to notified geographies; contractual safeguards.', regulatory: 'DPDP Act 2023 §16', owner: 'DPO', frequency: 'Continuous', population: 62, sample: 62, exceptions: 2, violations: 0, compliance: 96.8, status: 'effective' },
];

const FIN_CONTROLS = [
  { id: 'FN-01', name: 'General Ledger reconciliation', objective: 'Sub-ledgers reconciled to GL daily; breaks aged & cleared.', regulatory: 'SOX ICoFR, Ind AS', owner: 'Finance', frequency: 'Daily', population: 8420, sample: 200, exceptions: 5, violations: 1, compliance: 97.5, status: 'effective' },
  { id: 'FN-02', name: 'Nostro / Vostro reconciliation', objective: 'Daily reconciliation with correspondents; breaks > 30d escalated.', regulatory: 'RBI Nostro Guidelines', owner: 'Treasury Ops', frequency: 'Daily', population: 420, sample: 120, exceptions: 4, violations: 1, compliance: 96.7, status: 'effective' },
  { id: 'FN-03', name: 'Inter-branch / intra-office adjustments', objective: 'IBA entries cleared within 30 days; aged entries reported.', regulatory: 'RBI Master Circular', owner: 'Finance', frequency: 'Monthly', population: 240, sample: 80, exceptions: 3, violations: 1, compliance: 96.3, status: 'effective' },
  { id: 'FN-04', name: 'Suspense account aging', objective: 'No item > 90 days without justification / approval.', regulatory: 'Internal Accounting Policy', owner: 'Finance', frequency: 'Monthly', population: 180, sample: 80, exceptions: 4, violations: 1, compliance: 95.0, status: 'effective' },
  { id: 'FN-05', name: 'Revenue recognition / interest accrual', objective: 'Interest accrued daily; NPA interest reversed per IRAC.', regulatory: 'Ind AS 115, RBI IRAC', owner: 'Finance', frequency: 'Daily', population: 42, sample: 42, exceptions: 1, violations: 0, compliance: 97.6, status: 'effective' },
  { id: 'FN-06', name: 'Expense approval DOA', objective: 'Expense approved within DOA; out-of-policy flagged.', regulatory: 'Board Policy', owner: 'Finance', frequency: 'Continuous', population: 1420, sample: 120, exceptions: 5, violations: 1, compliance: 95.8, status: 'effective' },
  { id: 'FN-07', name: 'Vendor payment controls', objective: 'Payments only to verified bank accounts; PO matched 3-way.', regulatory: 'SOX ICoFR', owner: 'Accounts Payable', frequency: 'Continuous', population: 840, sample: 120, exceptions: 4, violations: 1, compliance: 96.7, status: 'effective' },
  { id: 'FN-08', name: 'Journal entry review', objective: 'Manual JEs reviewed and approved; round-sum & unusual JEs flagged.', regulatory: 'SOX ICoFR', owner: 'Finance', frequency: 'Monthly', population: 620, sample: 120, exceptions: 6, violations: 1, compliance: 95.0, status: 'effective' },
];

const OPS_CONTROLS = [
  { id: 'OP-01', name: 'Vendor onboarding due diligence', objective: 'Financial / legal / infosec due diligence before contracting.', regulatory: 'RBI Outsourcing Guidelines', owner: 'Procurement', frequency: 'Continuous', population: 42, sample: 42, exceptions: 3, violations: 1, compliance: 92.9, status: 'needs-attention' },
  { id: 'OP-02', name: 'Third-party risk assessment (TPRM)', objective: 'Annual TPRM with risk score; remediation tracked.', regulatory: 'RBI IT Outsourcing MD 2023', owner: 'TPRM Team', frequency: 'Annual', population: 142, sample: 142, exceptions: 9, violations: 2, compliance: 93.7, status: 'effective' },
  { id: 'OP-03', name: 'RBI Outsourcing compliance', objective: 'Material outsourcing reported to RBI; MSA clauses intact.', regulatory: 'RBI Outsourcing Guidelines 2006 + 2023', owner: 'Compliance', frequency: 'Continuous', population: 28, sample: 28, exceptions: 1, violations: 0, compliance: 96.4, status: 'effective' },
  { id: 'OP-04', name: 'Business Continuity Plan (BCP) testing', objective: 'BCP tabletop / live test half-yearly; report to Board.', regulatory: 'RBI BCP-DR Guidance', owner: 'BCM', frequency: 'Half-yearly', population: 12, sample: 12, exceptions: 1, violations: 0, compliance: 91.7, status: 'needs-attention' },
  { id: 'OP-05', name: 'HR Joiner-Mover-Leaver', objective: 'JML events trigger access / asset / attestation workflows.', regulatory: 'ISO 27001 A.7, SOX', owner: 'HR + IAM', frequency: 'Continuous', population: 420, sample: 100, exceptions: 7, violations: 2, compliance: 93.0, status: 'effective' },
  { id: 'OP-06', name: 'Employee background verification (BGV)', objective: 'BGV completed before DOJ; periodic refresh for sensitive roles.', regulatory: 'Internal HR Policy, RBI Fit-and-Proper', owner: 'HR', frequency: 'Continuous', population: 420, sample: 80, exceptions: 4, violations: 1, compliance: 95.0, status: 'effective' },
];

const CONTROLS_BY_DOMAIN = {
  customer:    CUSTOMER_CONTROLS,
  loan:        LOAN_CONTROLS,
  transaction: TX_CONTROLS,
  risk:        RISK_CONTROLS,
  access:      ACCESS_CONTROLS,
  itchange:    CHANGE_CONTROLS,
  infra:       INFRA_CONTROLS,
  data:        DATA_CONTROLS,
  finance:     FIN_CONTROLS,
  ops:         OPS_CONTROLS,
};

// ============================================================================
// SOP MAP — every domain has its end-to-end process broken into ordered stages.
// Each stage references the control IDs that apply at that step so the auditor
// can instantly see WHICH control missed at WHICH stage.
// ============================================================================

const SOP_BY_DOMAIN = {
  customer: {
    name: 'Customer Onboarding & Lifecycle SOP',
    purpose: 'End-to-end retail / corporate customer onboarding — every customer must clear every stage.',
    stages: [
      { id: 'app',      name: 'Application',            description: 'Capture application form and customer consent.',              controlIds: ['CL-01'],                 owner: { role: 'Relationship Manager',     team: 'Branch Sales — Retail',    submits: 'Application form, signed consent, customer photograph, declaration' } },
      { id: 'kyc',      name: 'KYC Verification',       description: 'PAN / Aadhaar / passport validation; CIP execution.',         controlIds: ['CL-01', 'CL-02'],        owner: { role: 'KYC Officer',              team: 'Branch Operations',        submits: 'PAN verification (NSDL), Aadhaar-OTP log, OVD scan, KYC checklist' } },
      { id: 'risk',     name: 'Risk Rating & EDD',      description: 'Low/Med/High risk rating; EDD for PEP & high risk.',          controlIds: ['CL-02', 'CL-03'],        owner: { role: 'Compliance Analyst',       team: 'AML Compliance',           submits: 'Risk rating worksheet, EDD pack, approver sign-off email' } },
      { id: 'screen',   name: 'Sanctions / PEP Screen', description: 'Screen against OFAC / UN / RBI & adverse media.',             controlIds: ['CL-06'],                 owner: { role: 'AML Analyst',              team: 'AML Compliance',           submits: 'World-Check / LexisNexis screening export, disposition note' } },
      { id: 'ubo',      name: 'UBO Identification',     description: 'Beneficial owner > 25% identified & verified (non-individual).',controlIds: ['CL-05'],               owner: { role: 'Corp. Onboarding Officer', team: 'Wholesale Operations',     submits: 'UBO declaration, shareholding pattern, MoA/AoA extract' } },
      { id: 'activate', name: 'Account Activation',     description: 'CBS go-live only when upstream checks passed.',               controlIds: ['CL-01'],                 owner: { role: 'Operations Officer',       team: 'Central Onboarding',       submits: 'CBS activation ticket, welcome kit dispatch log' } },
      { id: 'review',   name: 'Periodic Review',        description: 'Re-KYC / trigger-based refresh per risk category.',           controlIds: ['CL-04', 'CL-07'],        owner: { role: 'KYC Officer',              team: 'Branch Operations',        submits: 'Re-KYC form, updated OVD, RM attestation' } },
      { id: 'dormant',  name: 'Dormant / Reactivation', description: 'Dormant handling and fresh KYC on reactivation.',             controlIds: ['CL-08'],                 owner: { role: 'Branch Manager',           team: 'Branch Operations',        submits: 'Dormant reactivation request, branch BM approval' } },
      { id: 'closure',  name: 'Closure / Offboarding',  description: 'Closure approval, dues cleared, systems revoked.',            controlIds: ['CL-09'],                 owner: { role: 'Branch Manager',           team: 'Branch Operations',        submits: 'Closure request, settlement voucher, NoDue' } },
    ],
  },
  loan: {
    name: 'Credit Underwriting & Disbursement SOP',
    purpose: 'From loan application intake to closure / write-off — every loan must clear every stage.',
    stages: [
      { id: 'app',        name: 'Application Intake',    description: 'LOS capture of application & mandatory KYC.',            controlIds: ['LN-01'],  owner: { role: 'Relationship Manager',   team: 'Retail Assets',        submits: 'LOS application, income proof, mandatory KYC checklist' } },
      { id: 'bureau',     name: 'Bureau Pull',           description: 'CIBIL / Experian pull with customer consent.',           controlIds: ['LN-02'],  owner: { role: 'Credit Ops Officer',     team: 'Credit Ops',           submits: 'Consent PDF, bureau report, score disposition' } },
      { id: 'uw',         name: 'Underwriting',          description: 'FOIR / DSR / LTV / policy matrix decisioning.',          controlIds: ['LN-03'],  owner: { role: 'Credit Underwriter',     team: 'Credit Underwriting',  submits: 'UW worksheet, policy deviation note, scorecard' } },
      { id: 'doa',        name: 'Approval (DOA)',        description: 'Officer approves within delegated authority.',           controlIds: ['LN-04'],  owner: { role: 'Credit Manager (DOA)',   team: 'Credit Risk',          submits: 'Approval email, DOA ref, committee minutes (if applicable)' } },
      { id: 'collateral', name: 'Collateral Perfection', description: 'Valuation + legal clearance (secured loans).',           controlIds: ['LN-05'],  owner: { role: 'Technical & Legal Cell', team: 'Credit Ops',           submits: 'Two valuations, legal clearance certificate, charge creation' } },
      { id: 'sanction',   name: 'Sanction Letter',       description: 'Signed sanction letter on file.',                        controlIds: ['LN-06'],  owner: { role: 'Credit Ops Officer',     team: 'Credit Ops',           submits: 'Signed sanction letter, acceptance' } },
      { id: 'disb',       name: 'Disbursement',          description: 'Penny-drop account validation & end-use declaration.',   controlIds: ['LN-07'],  owner: { role: 'Disbursement Officer',   team: 'Disbursement Team',    submits: 'Penny drop result, end-use declaration, disbursal advice' } },
      { id: 'pdm',        name: 'Post-Disb Monitoring',  description: 'PDM visit / end-use verification.',                      controlIds: ['LN-08'],  owner: { role: 'Credit Monitoring Offr', team: 'Credit Monitoring',    submits: 'PDM visit report, photographs, end-use proof' } },
      { id: 'irac',       name: 'NPA Classification',    description: 'SMA 0/1/2 & NPA per RBI IRAC with provisioning.',        controlIds: ['LN-09', 'LN-10'], owner: { role: 'Credit Risk Analyst', team: 'Credit Risk',       submits: 'IRAC classification run, provisioning JE, exception note' } },
      { id: 'restr',      name: 'Restructuring',         description: 'Committee-approved restructuring & disclosure.',         controlIds: ['LN-11'], owner: { role: 'Credit Committee Secr.', team: 'Credit Committee',     submits: 'Committee minutes, revised schedule, RBI disclosure' } },
      { id: 'writeoff',   name: 'Write-off / Closure',   description: 'Write-off per DOA; closure & NoDue.',                    controlIds: ['LN-12'], owner: { role: 'Finance Controller',     team: 'Finance',              submits: 'Write-off approval, NoDue certificate, JE' } },
    ],
  },
  transaction: {
    name: 'Transaction & Payments Processing SOP',
    purpose: 'Channel-agnostic transaction flow — every transaction must clear every stage.',
    stages: [
      { id: 'init',    name: 'Initiation',              description: 'Customer / teller initiates txn; beneficiary captured.', controlIds: ['TX-03', 'TX-06'], owner: { role: 'Teller / Channel App', team: 'Retail Branch / Digital', submits: 'Txn request, beneficiary info, OTP/2FA log' } },
      { id: 'auth',    name: 'Authentication',          description: 'Maker authenticated; session integrity verified.',      controlIds: ['TX-01'],          owner: { role: 'Maker Officer',        team: 'Branch Operations',       submits: 'Maker ID, auth log, biometric / token proof' } },
      { id: 'limit',   name: 'Limit & Policy Check',    description: 'Daily / per-txn / LRS / FX limit validation.',          controlIds: ['TX-02', 'TX-06'], owner: { role: 'Core Banking Engine',  team: 'Automated Control',       submits: 'Policy engine output (pass/hit log), breach alert (if any)' } },
      { id: 'author',  name: 'Authorization',           description: 'Checker reviews & authorises high-value txns.',         controlIds: ['TX-01'],          owner: { role: 'Checker Officer',      team: 'Branch Operations',       submits: 'Checker ID, authoriser dual-control log' } },
      { id: 'process', name: 'Cheque / Cash Processing',description: 'CTS truncation, cash custody, CTR triggers.',           controlIds: ['TX-04', 'TX-05'], owner: { role: 'Clearing & Cash Offr', team: 'Clearing House',          submits: 'CTS image, cash register, CTR extract' } },
      { id: 'settle',  name: 'Settlement',              description: 'Intraday liquidity & RTGS / CCIL position.',            controlIds: ['TX-09'],          owner: { role: 'Treasury Ops Officer', team: 'Treasury Operations',     submits: 'RTGS acknowledgement, settlement MIS' } },
      { id: 'reverse', name: 'Reversal',                description: 'Reversal with documented reason & approver.',           controlIds: ['TX-07'],          owner: { role: 'Operations Manager',   team: 'Central Operations',      submits: 'Reversal request, approver email, CBS voucher' } },
      { id: 'recon',   name: 'Reconciliation',          description: 'Failed-txn reversal within T+1 TAT.',                   controlIds: ['TX-08'],          owner: { role: 'Reconciliation Offr',  team: 'Reconciliation',          submits: 'Recon report, break register, exception aging' } },
    ],
  },
  risk: {
    name: 'AML / Risk & Fraud Management SOP',
    purpose: 'Transaction monitoring, investigation, and regulatory reporting — every alert must clear every stage.',
    stages: [
      { id: 'monitor', name: 'Txn Monitoring',      description: 'Rule library detects alerts against customer behaviour.',   controlIds: ['RK-01'], owner: { role: 'AML Rule Engine',      team: 'AML Technology',    submits: 'Alert extract, rule version, scenario hit log' } },
      { id: 'screen',  name: 'Sanctions Screening', description: 'Real-time screening of txns / beneficiaries.',              controlIds: ['RK-04'], owner: { role: 'Screening Engine',     team: 'AML Technology',    submits: 'Screening hits, disposition ID' } },
      { id: 'l1',      name: 'L1 Review',           description: 'L1 analyst dispositions alert within SLA.',                 controlIds: ['RK-01'], owner: { role: 'L1 Analyst',           team: 'AML Ops',           submits: 'Alert disposition note, linked txns, L1 recommendation' } },
      { id: 'l2',      name: 'L2 Investigation',    description: 'Deep-dive investigation for escalated alerts.',             controlIds: ['RK-05'], owner: { role: 'L2 Investigator',      team: 'AML Investigations',submits: 'Investigation memo, evidence bundle, RCA' } },
      { id: 'str',     name: 'STR Filing (FIU)',    description: 'STR filed within 7 working days of suspicion.',             controlIds: ['RK-02'], owner: { role: 'Principal Officer',    team: 'AML Compliance',    submits: 'STR XML, FIU acknowledgement, internal signoff' } },
      { id: 'ctr',     name: 'CTR Filing (FIU)',    description: 'Monthly CTR to FIU-IND by 15th.',                           controlIds: ['RK-03'], owner: { role: 'Principal Officer',    team: 'AML Compliance',    submits: 'CTR file, FIU acknowledgement' } },
      { id: 'dispute', name: 'Dispute / Chargeback',description: 'Resolve within Visa / MC / UPI TAT.',                       controlIds: ['RK-06'], owner: { role: 'Cards Ops Officer',    team: 'Cards Operations',  submits: 'Dispute register, scheme communication, refund JE' } },
      { id: 'whistle', name: 'Whistleblower',       description: 'Independent intake & investigation channel.',               controlIds: ['RK-07'], owner: { role: 'Vigilance Officer',    team: 'Vigilance',         submits: 'Intake form, investigation report, committee sign-off' } },
    ],
  },
  access: {
    name: 'User Access Lifecycle SOP',
    purpose: 'Joiner-Mover-Leaver — every access request must clear every stage.',
    stages: [
      { id: 'request', name: 'Request',          description: 'Access request raised in IAM portal.',             controlIds: ['AC-01'],         owner: { role: 'Requesting Employee', team: 'Business Unit',    submits: 'IAM request form, business justification' } },
      { id: 'approve', name: 'Approval',         description: 'Line-manager & app-owner approval.',               controlIds: ['AC-01'],         owner: { role: 'Line Manager + App Owner', team: 'Business + App', submits: 'Approver chain, email trail, role fitment note' } },
      { id: 'prov',    name: 'Provisioning',     description: 'Role granted via RBAC; least-privilege.',          controlIds: ['AC-01','AC-04'], owner: { role: 'IAM Administrator',   team: 'IAM Operations',   submits: 'Provision ticket, role grant screenshot, AD log' } },
      { id: 'mfa',     name: 'MFA Enforcement',  description: 'MFA factor activated before first login.',         controlIds: ['AC-06'],         owner: { role: 'IAM Administrator',   team: 'IAM Operations',   submits: 'MFA enrolment log, first-login attestation' } },
      { id: 'pam',     name: 'PAM / Shared IDs', description: 'Privileged & generic IDs vaulted with recording.', controlIds: ['AC-03','AC-09'], owner: { role: 'PAM Administrator',   team: 'Infra Security',   submits: 'PAM vault entry, session recording reference' } },
      { id: 'sod',     name: 'SoD Validation',   description: 'Maker-checker / SoD conflicts flagged.',           controlIds: ['AC-05'],         owner: { role: 'GRC Analyst',         team: 'Risk & Governance',submits: 'SoD run report, conflict remediation note' } },
      { id: 'uar',     name: 'Periodic UAR',     description: 'Quarterly user access review.',                    controlIds: ['AC-07'],         owner: { role: 'Application Owner',   team: 'App Business Owner',submits: 'UAR certification, delta list, exception memo' } },
      { id: 'dormant', name: 'Dormant Lockout',  description: 'Auto-lock after 90 days of inactivity.',           controlIds: ['AC-08'],         owner: { role: 'IAM Automation',      team: 'IAM Operations',   submits: 'Dormant scan output, lockout evidence' } },
      { id: 'deprov',  name: 'De-provisioning',  description: 'Sensitive T+0, rest T+1 on exit.',                 controlIds: ['AC-02'],         owner: { role: 'HR + IAM',            team: 'HR Ops + IAM',     submits: 'Exit ticket, revoke evidence, asset return form' } },
    ],
  },
  itchange: {
    name: 'IT Change & Release Management SOP',
    purpose: 'RFC → production release — every change must clear every stage.',
    stages: [
      { id: 'rfc',    name: 'RFC Raised',          description: 'Change request with business justification.', controlIds: ['CM-01'],         owner: { role: 'Change Requester',         team: 'Engineering',      submits: 'RFC form, business case, risk & rollback note' } },
      { id: 'code',   name: 'Code Review',         description: 'Peer approval + lint/SAST gates.',            controlIds: ['CM-02'],         owner: { role: 'Peer Reviewer',            team: 'Engineering',      submits: 'PR approval, lint/SAST report, unit-test coverage' } },
      { id: 'env',    name: 'Env Segregation',     description: 'Developers cannot write to production.',      controlIds: ['CM-03'],         owner: { role: 'DevOps Engineer',          team: 'DevOps',           submits: 'Env access attestation, prod-write denial log' } },
      { id: 'cab',    name: 'CAB Approval',        description: 'Change Advisory Board endorsement.',          controlIds: ['CM-01','CM-04'], owner: { role: 'CAB Chair',                team: 'Change Mgmt Office', submits: 'CAB minutes, impact assessment, approval register' } },
      { id: 'deploy', name: 'Deployment',          description: 'Release within approved window.',             controlIds: ['CM-04'],         owner: { role: 'Release Engineer',         team: 'DevOps',           submits: 'Release pipeline logs, smoke-test output' } },
      { id: 'pir',    name: 'Rollback & PIR',      description: 'Documented rollback + post-impl review.',     controlIds: ['CM-05'],         owner: { role: 'Release Engineer',         team: 'DevOps',           submits: 'Rollback plan, PIR document, lessons learned' } },
      { id: 'emg',    name: 'Emergency Change',    description: 'Ratified by CAB within 48 hours.',            controlIds: ['CM-06'],         owner: { role: 'Incident Commander',       team: 'IT Operations',    submits: 'Emergency change register, post-facto CAB ratification' } },
      { id: 'inc',    name: 'Incident / RCA',      description: 'P1 RCA closed within 7 days.',                controlIds: ['CM-07'],         owner: { role: 'Problem Manager',          team: 'IT Operations',    submits: 'RCA document, corrective action plan' } },
      { id: 'patch',  name: 'Patch Management',    description: 'Critical ≤14d, High ≤30d.',                   controlIds: ['CM-08'],         owner: { role: 'Patch Engineer',           team: 'IT Security',      submits: 'Patch SLA MIS, missed-patch register' } },
    ],
  },
  infra: {
    name: 'Infrastructure & Cyber Operations SOP',
    purpose: 'Hardening, segmentation, monitoring, backup and recoverability — every infra job must clear every stage.',
    stages: [
      { id: 'baseline',name: 'OS / Baseline',        description: 'Servers built from CIS-hardened images.',     controlIds: ['IN-02'], owner: { role: 'Infra Build Engineer', team: 'IT Operations',   submits: 'Hardening checklist, CIS scan output' } },
      { id: 'segment', name: 'Network Segmentation', description: 'PCI / Card zone isolated from corporate.',    controlIds: ['IN-03'], owner: { role: 'Network Engineer',     team: 'Network Security', submits: 'Segmentation diagram, VLAN/ACL attestation' } },
      { id: 'fw',      name: 'Firewall Rules',       description: 'Quarterly rule review & stale-rule cleanup.', controlIds: ['IN-01'], owner: { role: 'Firewall Admin',       team: 'Network Security', submits: 'Rule review register, justified-rule log' } },
      { id: 'cloud',   name: 'Cloud IAM',            description: 'Least-privilege in cloud accounts.',          controlIds: ['IN-04'], owner: { role: 'Cloud Security Engr.', team: 'Cloud Security',   submits: 'IAM policy export, wildcard-role finding' } },
      { id: 'vuln',    name: 'Vulnerability Scan',   description: 'Monthly VA with finding closure.',            controlIds: ['IN-07'], owner: { role: 'VA Analyst',           team: 'IT Security',      submits: 'Nessus / Qualys scan, closure tracker' } },
      { id: 'pt',      name: 'Penetration Test',     description: 'PT with remediation SLA tracking.',           controlIds: ['IN-08'], owner: { role: 'Red-Team Lead',        team: 'IT Security',      submits: 'PT report, remediation register' } },
      { id: 'backup',  name: 'Backup',               description: 'Daily backup, weekly offsite, log review.',   controlIds: ['IN-05'], owner: { role: 'Backup Administrator', team: 'IT Operations',    submits: 'Backup success log, offsite shipment receipt' } },
      { id: 'dr',      name: 'DR Drill',             description: 'Half-yearly RTO / RPO validation.',           controlIds: ['IN-06'], owner: { role: 'BCM / DR Officer',     team: 'BCM',              submits: 'DR drill plan, RTO / RPO report, Board note' } },
    ],
  },
  data: {
    name: 'Data Governance & Protection SOP',
    purpose: 'Data lifecycle — every data task must clear every stage (DPDP Act + RBI).',
    stages: [
      { id: 'classify',name: 'Classification',       description: 'Tag Public / Internal / Confidential / Restricted.', controlIds: ['DT-01'], owner: { role: 'Data Steward',         team: 'Data Office',       submits: 'Classification register entry, sign-off' } },
      { id: 'consent', name: 'Consent Capture',      description: 'Purpose-specific consent under DPDP.',               controlIds: ['DT-06'], owner: { role: 'Digital Channels Team',team: 'Digital Channels',  submits: 'Consent artifact, timestamp, purpose IDs' } },
      { id: 'process', name: 'Processing',           description: 'Processing limited to consented purpose.',           controlIds: ['DT-06'], owner: { role: 'Business Data Owner',  team: 'Business Unit',     submits: 'Purpose-usage log, processing register' } },
      { id: 'mask',    name: 'Masking (Non-Prod)',   description: 'Production PII masked in lower environments.',       controlIds: ['DT-02'], owner: { role: 'Data Engineer',        team: 'Data Platform',     submits: 'Masking job log, sample masked record' } },
      { id: 'encrypt', name: 'Encryption',           description: 'AES-256 at rest, TLS 1.2+ in transit.',              controlIds: ['DT-05'], owner: { role: 'Security Architect',   team: 'IT Security',       submits: 'Encryption config, KMS key metadata' } },
      { id: 'dlp',     name: 'DLP',                  description: 'Endpoint / email / web DLP enforcement.',            controlIds: ['DT-04'], owner: { role: 'DLP Analyst',          team: 'IT Security',       submits: 'DLP incident tracker, closed-ticket list' } },
      { id: 'retain',  name: 'Retention',            description: 'Retained min 5y (PMLA) / 8y (RBI).',                 controlIds: ['DT-03'], owner: { role: 'Records Manager',      team: 'Records Management',submits: 'Retention schedule, purge run report' } },
      { id: 'erasure', name: 'Right to Erasure',     description: 'Close DPDP principal requests ≤ 30d.',               controlIds: ['DT-07'], owner: { role: 'Data Protection Offr', team: 'DPO Office',        submits: 'DPDP request register, closure evidence' } },
      { id: 'xborder', name: 'Cross-Border Transfer',description: 'Notified geographies + contractual safeguards.',     controlIds: ['DT-08'], owner: { role: 'Data Protection Offr', team: 'DPO Office',        submits: 'Cross-border transfer register, contracts' } },
    ],
  },
  finance: {
    name: 'Financial Reporting & ICoFR SOP',
    purpose: 'Transaction capture through financial close — every close batch must clear every stage.',
    stages: [
      { id: 'capture', name: 'Txn Capture',          description: 'Source system posts to sub-ledger.',              controlIds: ['FN-01'], owner: { role: 'Source System',        team: 'Automated Control',   submits: 'Sub-ledger extract, posting audit trail' } },
      { id: 'je',      name: 'Journal Entry',        description: 'Manual JE review & approval.',                    controlIds: ['FN-08'], owner: { role: 'Finance Analyst',      team: 'Finance',             submits: 'JE detail, reviewer approval' } },
      { id: 'accrual', name: 'Interest Accrual',     description: 'Daily accrual; reversal on NPA per IRAC.',        controlIds: ['FN-05'], owner: { role: 'Finance Analyst',      team: 'Finance',             submits: 'Accrual run, NPA reversal file' } },
      { id: 'gl',      name: 'GL Reconciliation',    description: 'Sub-ledger to GL daily reconciliation.',          controlIds: ['FN-01'], owner: { role: 'Recon Analyst',        team: 'Finance',             submits: 'GL recon workings, break register' } },
      { id: 'nostro',  name: 'Nostro Reconciliation',description: 'Daily correspondent bank recon.',                 controlIds: ['FN-02'], owner: { role: 'Treasury Ops Officer', team: 'Treasury Operations', submits: 'Nostro recon, break aging' } },
      { id: 'iba',     name: 'IBA Adjustment',       description: 'Inter-branch entries cleared ≤ 30d.',             controlIds: ['FN-03'], owner: { role: 'Branch Accountant',    team: 'Finance',             submits: 'IBA register, aging, clearance journal' } },
      { id: 'susp',    name: 'Suspense Aging',       description: 'No item > 90 days without justification.',        controlIds: ['FN-04'], owner: { role: 'Finance Analyst',      team: 'Finance',             submits: 'Suspense aging, justification notes' } },
      { id: 'expense', name: 'Expense Approval',     description: 'DOA-bound expense approvals.',                    controlIds: ['FN-06'], owner: { role: 'Expense Approver',     team: 'Finance',             submits: 'Expense requisition, DOA ref, approval' } },
      { id: 'vendor',  name: 'Vendor Payment',       description: 'Payment to verified accounts; 3-way match.',      controlIds: ['FN-07'], owner: { role: 'Accounts Payable',     team: 'Finance',             submits: 'PO, GRN, invoice, 3-way match, payment advice' } },
    ],
  },
  ops: {
    name: 'Operations & Third-Party SOP',
    purpose: 'Vendor lifecycle, BCP and HR JML — every ops case must clear every stage.',
    stages: [
      { id: 'onboard', name: 'Vendor Onboarding',    description: 'Intake, KYC, sanctions screening of vendor.', controlIds: ['OP-01'],          owner: { role: 'Procurement Officer',   team: 'Procurement',       submits: 'Vendor intake form, KYC docs, screening result' } },
      { id: 'dd',      name: 'Due Diligence',        description: 'Financial, legal, infosec assessment.',       controlIds: ['OP-01','OP-02'],  owner: { role: 'TPRM Analyst',          team: 'TPRM',              submits: 'DD report, financial health score, security posture' } },
      { id: 'contract',name: 'Contracting',          description: 'MSA, SLA, RBI outsourcing clauses.',          controlIds: ['OP-03'],          owner: { role: 'Legal Counsel',         team: 'Legal',             submits: 'MSA, SLA schedule, RBI clauses attestation' } },
      { id: 'tprm',    name: 'TPRM Monitoring',      description: 'Annual TPRM with scoring.',                   controlIds: ['OP-02'],          owner: { role: 'TPRM Analyst',          team: 'TPRM',              submits: 'Annual TPRM score, remediation plan' } },
      { id: 'bcp',     name: 'BCP Testing',          description: 'Half-yearly tabletop / live test.',           controlIds: ['OP-04'],          owner: { role: 'BCM Officer',           team: 'BCM',               submits: 'BCP drill plan, test evidence, gap closure' } },
      { id: 'joiner',  name: 'HR — Joiner',          description: 'Onboarding: BGV, letter, access, asset.',     controlIds: ['OP-05','OP-06'],  owner: { role: 'HR Business Partner',   team: 'HR Operations',     submits: 'BGV report, appointment letter, asset handover' } },
      { id: 'mover',   name: 'HR — Mover',           description: 'Role change: access re-certified.',           controlIds: ['OP-05'],          owner: { role: 'HR Business Partner',   team: 'HR Operations',     submits: 'Transfer memo, access re-cert evidence' } },
      { id: 'leaver',  name: 'HR — Leaver',          description: 'Clearance, access revoke, asset return.',     controlIds: ['OP-05'],          owner: { role: 'HR Business Partner',   team: 'HR Operations',     submits: 'Clearance form, access revoke, asset return' } },
    ],
  },
};

// ============================================================================
// CASE MODEL — every domain has a set of actual cases flowing through the SOP.
// Each case walks through every stage and must satisfy every control at that
// stage. Auditor reviews the full stage-by-stage submission trail per case.
// ============================================================================

const CASE_ENTITY = {
  customer:    { singular: 'Customer',        plural: 'Customers',        entity: 'customer onboarding' },
  loan:        { singular: 'Loan Application',plural: 'Loan Applications',entity: 'loan application' },
  transaction: { singular: 'Transaction',     plural: 'Transactions',     entity: 'transaction' },
  risk:        { singular: 'AML Alert',       plural: 'AML Alerts',       entity: 'alert' },
  access:      { singular: 'Access Request',  plural: 'Access Requests',  entity: 'access request' },
  itchange:    { singular: 'Change Request',  plural: 'Change Requests',  entity: 'change request' },
  infra:       { singular: 'Infra Ticket',    plural: 'Infra Tickets',    entity: 'infra job' },
  data:        { singular: 'Data Task',       plural: 'Data Tasks',       entity: 'data task' },
  finance:     { singular: 'Close Batch',     plural: 'Close Batches',    entity: 'close batch' },
  ops:         { singular: 'Ops Case',        plural: 'Ops Cases',        entity: 'ops case' },
};

/** Table header (all caps) — one journey matrix per domain */
const JOURNEY_TITLE_BY_DOMAIN = {
  customer:    'CUSTOMER JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  loan:        'LOAN APPLICATION JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  transaction: 'TRANSACTION JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  risk:        'AML ALERT JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  access:      'ACCESS REQUEST JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  itchange:    'CHANGE REQUEST JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  infra:       'INFRASTRUCTURE JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  data:        'DATA GOVERNANCE JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  finance:     'FINANCIAL CLOSE JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
  ops:         'OPERATIONS & THIRD-PARTY JOURNEY — STAGE-WISE CONTROL COMPLIANCE',
};

/** Short column headers for the journey matrix (must align with SOP stage `id`) */
const STAGE_SHORT_LABEL = {
  customer: {
    app: 'App', kyc: 'KYC', risk: 'Risk', screen: 'AML', ubo: 'UBO', activate: 'Activate', review: 'Re-KYC', dormant: 'Dormant', closure: 'Close',
  },
  loan: {
    app: 'App', bureau: 'Bureau', uw: 'UW', doa: 'DOA', collateral: 'Collat.', sanction: 'Sanct.', disb: 'Disb.', pdm: 'PDM', irac: 'IRAC', restr: 'Restr.', writeoff: 'W/off',
  },
  transaction: {
    init: 'Init', auth: 'Auth', limit: 'Limits', author: 'Authz', process: 'Process', settle: 'Settle', reverse: 'Reverse', recon: 'Recon',
  },
  risk: {
    monitor: 'Monitor', screen: 'Screen', l1: 'L1', l2: 'L2', str: 'STR', ctr: 'CTR', dispute: 'Dispute', whistle: 'Whistle',
  },
  access: {
    request: 'Request', approve: 'Approve', prov: 'Prov.', mfa: 'MFA', pam: 'PAM', sod: 'SoD', uar: 'UAR', dormant: 'Dormant', deprov: 'Deprov.',
  },
  itchange: {
    rfc: 'RFC', code: 'Code', env: 'Env', cab: 'CAB', deploy: 'Deploy', pir: 'PIR', emg: 'Emerg.', inc: 'Incident', patch: 'Patch',
  },
  infra: {
    baseline: 'Baseline', segment: 'Segment', fw: 'FW', cloud: 'Cloud', vuln: 'VA', pt: 'PT', backup: 'Backup', dr: 'DR',
  },
  data: {
    classify: 'Class.', consent: 'Consent', process: 'Process', mask: 'Mask', encrypt: 'Encrypt', dlp: 'DLP', retain: 'Retain', erasure: 'Erase', xborder: 'X-Border',
  },
  finance: {
    capture: 'Capture', je: 'JE', accrual: 'Accrual', gl: 'GL', nostro: 'Nostro', iba: 'IBA', susp: 'Susp.', expense: 'Expense', vendor: 'Vendor',
  },
  ops: {
    onboard: 'Onboard', dd: 'DD', contract: 'Contract', tprm: 'TPRM', bcp: 'BCP', joiner: 'Joiner', mover: 'Mover', leaver: 'Leaver',
  },
};

const getJourneyStageHeader = (domainId, stage) =>
  (STAGE_SHORT_LABEL[domainId] && STAGE_SHORT_LABEL[domainId][stage.id]) || stage.name.split(/\s+/).slice(0, 2).join(' ').slice(0, 12);

/** Human-readable exception text for the matrix “Exception” column */
const CONTROL_EXCEPTION_LABEL = {
  'CL-01': 'CIP / ID gap', 'CL-02': 'CDD pack gap', 'CL-03': 'EDD incomplete', 'CL-04': 'Re-KYC overdue', 'CL-05': 'UBO not verified',
  'CL-06': 'Screening hit', 'CL-07': 'Risk refresh gap', 'CL-08': 'Dormant KYC gap', 'CL-09': 'Closure pack gap',
  'LN-01': 'Intake incomplete', 'LN-02': 'Bureau / consent gap', 'LN-03': 'UW policy breach', 'LN-04': 'DOA breach', 'LN-05': 'Collateral gap',
  'LN-06': 'Sanction letter gap', 'LN-07': 'Disbursal control gap', 'LN-08': 'PDM gap', 'LN-09': 'IRAC misclass', 'LN-10': 'Provisioning gap',
  'LN-11': 'Restructure approval', 'LN-12': 'Write-off authority',
  'TX-01': 'Maker-checker gap', 'TX-02': 'Limit breach', 'TX-03': 'Beneficiary gap', 'TX-04': 'Cheque / CTS gap', 'TX-05': 'CTR / cash gap',
  'TX-06': 'LRS / FX breach', 'TX-07': 'Reversal authority', 'TX-08': 'Recon / TAT gap', 'TX-09': 'Liquidity breach',
  'RK-01': 'TM / SLA gap', 'RK-02': 'STR timeliness', 'RK-03': 'CTR filing', 'RK-04': 'Sanctions gap', 'RK-05': 'Investigation gap',
  'RK-06': 'Dispute TAT', 'RK-07': 'Whistleblower process',
  'AC-01': 'Approval chain gap', 'AC-02': 'Deprov delay', 'AC-03': 'PAM gap', 'AC-04': 'RBAC gap', 'AC-05': 'SoD conflict',
  'AC-06': 'MFA gap', 'AC-07': 'UAR gap', 'AC-08': 'Dormant ID gap', 'AC-09': 'Shared ID gap',
  'CM-01': 'CAB / RFC gap', 'CM-02': 'Code review gap', 'CM-03': 'Segregation breach', 'CM-04': 'Release window', 'CM-05': 'PIR / rollback',
  'CM-06': 'Emergency ratification', 'CM-07': 'RCA SLA', 'CM-08': 'Patch SLA',
  'IN-01': 'FW rule review', 'IN-02': 'Hardening drift', 'IN-03': 'Segmentation', 'IN-04': 'Cloud IAM', 'IN-05': 'Backup gap',
  'IN-06': 'DR drill', 'IN-07': 'VA findings', 'IN-08': 'PT remediation',
  'DT-01': 'Classification', 'DT-02': 'Masking gap', 'DT-03': 'Retention', 'DT-04': 'DLP incident', 'DT-05': 'Encryption',
  'DT-06': 'Consent / purpose', 'DT-07': 'Erasure SLA', 'DT-08': 'Cross-border',
  'FN-01': 'GL recon gap', 'FN-02': 'Nostro break', 'FN-03': 'IBA aging', 'FN-04': 'Suspense >90d', 'FN-05': 'Accrual / IRAC',
  'FN-06': 'Expense DOA', 'FN-07': 'Vendor 3-way', 'FN-08': 'Manual JE',
  'OP-01': 'Vendor DD gap', 'OP-02': 'TPRM score', 'OP-03': 'Outsourcing clause', 'OP-04': 'BCP test', 'OP-05': 'JML gap', 'OP-06': 'BGV gap',
};

/**
 * Per-control auditor findings. Each entry explains, in plain language, the
 * *exact* reason this control is flagged — what was missing, where it broke,
 * and why it is a miss against the regulatory / policy requirement. Keep each
 * entry short (2-3 sentences) so the auditor can read it inline.
 */
const AUDITOR_FINDINGS = {
  // ---------- Customer Lifecycle ----------
  'CL-01': '4 accounts in the sample were activated in CBS before the PAN-NSDL verification response was archived on the CIF; 1 critical — CIF 4412876 transacted ₹2.1 L within 48 h of activation without PAN on record. Breach of RBI KYC MD §3 (CIP completion pre-activation).',
  'CL-02': '7 customers were defaulted to Low risk without the CDD questionnaire being run in the onboarding engine; 2 critical cases had NRI / cross-border exposure that warranted Medium or High. RM override note captured but Compliance concurrence missing.',
  'CL-03': 'EDD packs for 6 PEP / high-risk relationships were closed on RM narrative alone — no adverse-media screenshot and no independent Compliance sign-off on file. 2 critical cases relate to PEPs active in the last financial year.',
  'CL-04': '11 periodic re-KYCs were past due date; 3 critical are high-risk customers where the 2-year refresh is > 180 days overdue. Trigger letters were issued but no second reminder and no de-risking proposal raised to the Principal Officer.',
  'CL-05': '5 non-individual onboardings lack a UBO declaration or have > 25% ownership traced only to another unlisted entity with no look-through. 1 critical: beneficial ownership chain broken at L2 — requires fresh UBO disclosure before any further transaction.',
  'CL-06': '2 sanctions screening runs used a superseded list version; both were later cleared manually but the cleared screenshot is not retained in the workflow, so the audit trail is broken. No critical hits, but control evidence is unreliable.',
  'CL-07': '8 customer risk profiles were not refreshed after a defined trigger (adverse news / large value / cross-border). 2 critical customers continued to transact above threshold without the refreshed rating feeding into transaction monitoring.',
  'CL-08': '3 dormant account reactivations were processed without the fresh KYC documents specified in the RBI dormant-accounts circular. 1 critical case was reactivated on T+3 without Branch Manager written approval.',
  'CL-09': '1 closure completed on T+3 against the T+2 internal SLA — dues were cleared but system revocation lagged. Minor deviation with no customer-impact.',

  // ---------- Loans ----------
  'LN-01': '8 LOS applications were pushed to underwriting with mandatory KYC or income-proof fields blank; 2 critical applications had PAN entirely missing. Underwriting proceeded because the LOS soft-stop was overridden — override log exists but without approver name.',
  'LN-02': '3 bureau pulls ran without a signed customer consent retained in LOS; 1 critical pull was on a co-applicant whose consent page was never collected. CIC Act 2005 requires consent evidence for every pull.',
  'LN-03': '14 loans breached the policy matrix (FOIR / DSR / LTV) but were sanctioned with a verbal waiver; 4 critical deals lack a Board Risk Committee minute reference. LOS worksheet version did not match the locked credit policy v3.2 effective 01-Feb-2026.',
  'LN-04': '9 sanctions exceeded the sanctioning officer\'s DOA limit with no escalation to the next authority; 3 critical sanctions exceeded limit by > 25%. Required approver email / committee minute is absent.',
  'LN-05': '6 secured-loan disbursements went out with only a single valuation report; 2 critical cases also lack the legal clearance certificate on charge creation. RBI Prudential norms require two independent valuations above the product threshold.',
  'LN-06': '2 disbursements released before the signed sanction-letter acceptance was uploaded. No critical, but internal SOP-LN-009 is breached.',
  'LN-07': '4 disbursals released without penny-drop account validation; 1 critical disbursal went to an account that later failed penny-drop on the post-facto run — end-use cannot be tracked to the stated beneficiary.',
  'LN-08': '11 post-disbursement monitoring visits are overdue beyond the stipulated window; 3 critical cases (LTV > 80%, ticket > ₹1 Cr) have had no visit at all. End-use verification evidence is missing.',
  'LN-09': '7 accounts were mis-classified under IRAC — days-past-due counter did not flip SMA-1 / SMA-2 correctly on month-end; 2 critical slippages should have been NPA in the prior period.',
  'LN-10': '3 accounts have provisioning % applied incorrectly (Standard vs. Sub-standard); 1 critical case is under-provisioned by ₹18 L. Requires correcting JE and disclosure in next close.',
  'LN-11': '2 restructuring cases processed without the full Credit Committee minute set on file; 1 critical case also missing the RBI Resolution Framework 2.0 disclosure entry.',
  'LN-12': '1 write-off was approved at a level just at the edge of DOA; the approver\'s delegation was active but documented via email instead of the approval register. Minor procedural gap, no financial impact.',

  // ---------- Transactions ----------
  'TX-01': '4 high-value transactions (≥ ₹10 L) posted without the checker step; 1 critical branch txn posted under maker credentials only. Dual-control log should be mandatory per RBI Cyber Security MD.',
  'TX-02': '3 limit breaches processed without an explicit policy override; 1 critical LRS breach was not routed to Treasury concurrence before release.',
  'TX-03': '4 NEFT / RTGS / IMPS transfers to newly added beneficiaries went through without the cooling period; 1 critical IMPS of ₹2.5 L dispatched within the cool-off. RBI NEFT/RTGS operating guidelines require the hold.',
  'TX-04': '5 cheque / CTS processing deviations — truncation image quality rejected by clearing member and the return was re-presented outside T+1; 1 critical cheque is still unresolved after 3 working days.',
  'TX-05': '6 cash transactions > ₹10 L did not make the CTR filing within the 15-day FIU window; 2 critical filings are past 30 days. PMLA Rule 3 breach that must be disclosed in the next FIU summary.',
  'TX-06': '2 LRS outward remittances breached the USD 250k annual limit at customer level; 1 critical case aggregated across branches and was not captured by the single-customer view in the Treasury system.',
  'TX-07': '3 payment reversals processed without a documented reason in the reversal register; 1 critical reversal was ₹47 L and lacks an approver email entirely.',
  'TX-08': '4 failed-transaction reversals missed the T+1 TAT set by the RBI Harmonisation-of-TAT circular; 1 critical is > T+5 with no customer credit yet — exposes the bank to compensation liability.',
  'TX-09': '2 intraday liquidity / CCIL position breaches were observed; both self-corrected within the hour but no exception note was raised to the Treasurer.',

  // ---------- Risk / AML ----------
  'RK-01': '14 AML alerts breached the L1/L2 review SLA (more than 48 h / 7 days respectively); 4 critical alerts on the same customer were effectively auto-closed without analyst narrative. Rule version captured but scenario-hit log not archived.',
  'RK-02': '6 STR filings were filed with FIU-IND beyond the 7-working-day window; 2 critical filings crossed 14 days. PMLA Rule 3 breach; Principal Officer sign-off exists but with no explanation for the delay.',
  'RK-03': '3 monthly CTR submissions slipped past the 15th; 1 critical submission was on the 22nd with no FIU pre-intimation.',
  'RK-04': '2 sanctions-screening deviations: rule set was on the prior list version for ~40 minutes after the UN update. No true hit found, but the risk of a missed hit during that window cannot be ruled out without a replay.',
  'RK-05': '9 fraud cases exceeded the 30-day RCA SLA; 3 critical cases are > 60 days without closure. RBI Fraud Reporting MD expects timely RCA with corrective action.',
  'RK-06': '5 chargebacks / disputes resolved beyond the Visa / MC / UPI TAT; 1 critical UPI dispute auto-debited the merchant while still in investigation.',
  'RK-07': '1 whistleblower intake was investigated beyond policy TAT; Committee sign-off captured but on the follow-up, not the original intake. No concealment but the timeline evidence is weak.',

  // ---------- Access ----------
  'AC-01': '14 access requests were provisioned without the full approver chain (line manager + application owner); 4 critical grants had only a verbal / chat approval. ISO 27001 A.9.2 and RBI Cyber MD require documented two-party approval.',
  'AC-02': '16 access profiles were still active 48–72 h after the HR exit date (Core + LOS); 5 critical where treasury / SWIFT roles remained enabled. Batch deprovisioning failed silently on Sundays and the IAM ticket queue was not monitored.',
  'AC-03': '8 privileged IDs are not vaulted in PAM; 2 critical are long-standing DBA accounts with shared credentials. Session recording does not exist for these IDs.',
  'AC-04': '12 user accounts hold permissions outside the approved role template; 3 critical users accumulated rights through mover workflow but nothing was revoked from the prior role (role creep).',
  'AC-05': '11 user accounts have conflicting maker + checker roles in core banking; 3 critical users executed both steps on the same transaction in the sample window.',
  'AC-06': '4 critical applications have users active without MFA enrolled; 1 critical includes a treasury power-user. RBI Cyber Security MD §H requires MFA on these apps.',
  'AC-07': '18 applications missed the quarterly UAR certification; 4 critical applications cover core banking and payments. Delta list & exception memo are also absent.',
  'AC-08': '3 user IDs dormant > 90 days were not auto-locked; 1 critical is an ex-contractor ID that logged in once during the sample window.',
  'AC-09': '6 shared / generic account usages outside the approved service-account list; 1 critical generic ID performed a privileged action on month-end close.',

  // ---------- IT Change ----------
  'CM-01': '7 production changes were deployed without CAB approval; 2 critical core-banking changes bypassed the CAB entirely. ITIL Change Mgmt & RBI Cyber MD require prior CAB endorsement.',
  'CM-02': '9 merged pull requests went to production without a second-peer approval or with lint/SAST gates disabled; 2 critical PRs touched the payments service.',
  'CM-03': '4 developers retained write access to production accounts through the mover workflow; 1 critical developer pushed a hotfix directly in prod without a formal change ticket.',
  'CM-04': '5 releases were pushed outside the approved change window; 1 critical release bypassed the rollback-plan attachment requirement.',
  'CM-05': '6 changes lack a documented rollback plan or a post-implementation review within 5 days; 1 critical change caused a downstream incident that is linked to the missing PIR.',
  'CM-06': '4 emergency changes were not ratified by CAB within 48 h; 1 critical emergency was never formally ratified.',
  'CM-07': '3 P1 incidents missed the 7-day RCA closure; 1 critical P1 relates to the customer portal and still lacks a corrective-action plan.',
  'CM-08': '9 critical / high patches breached the SLA window (≤ 14 d critical, ≤ 30 d high); 2 critical patches on internet-facing components are > 45 days open.',

  // ---------- Infra & Cyber ----------
  'IN-01': '9 firewall rules were flagged as stale or over-permissive in the quarterly review; 2 critical rules expose management interfaces with no business justification.',
  'IN-02': '6 servers failed the CIS hardening baseline scan; 1 critical server is in the payments zone and drifts on logging + auditd configuration.',
  'IN-03': '2 network segmentation observations — card zone had temporary ACL bypasses open longer than intended. No successful traffic observed but the controls are design-weak.',
  'IN-04': '11 cloud IAM findings: wildcard actions / unscoped roles in production; 3 critical roles include iam:* on the payments account.',
  'IN-05': '3 daily backup runs had partial failures (not fully rerun); restore test was completed but these days are not covered by a verified backup.',
  'IN-06': '1 half-yearly DR drill result has not yet been presented to the Board IT Committee — the drill happened, but the board note is pending. Minor reporting gap.',
  'IN-07': '8 vulnerability-scan findings breached closure SLA; 2 critical findings on perimeter assets are > 60 days open.',
  'IN-08': '5 penetration-test findings remain open; 1 critical (high severity) finding on authentication workflow is past the remediation SLA.',

  // ---------- Data ----------
  'DT-01': '18 data assets remain unclassified against Public / Internal / Confidential / Restricted; 4 critical assets sit in the analytics lake and include PII.',
  'DT-02': '9 non-prod environments had live PII because the masking job failed silently over the last two refresh cycles; 2 critical environments were accessible to vendor staff.',
  'DT-03': '7 retention rules were breached — records purged before 5-year PMLA minimum; 2 critical cases involve KYC artefacts required for an open investigation.',
  'DT-04': '12 DLP incidents were closed without investigator notes; 3 critical incidents (large outbound data pushes) lack a root-cause conclusion.',
  'DT-05': '4 systems have weakened TLS ciphers or unencrypted-at-rest volumes; 1 critical issue is on a card-tokenization service.',
  'DT-06': '11 customer consent captures did not bind to a specific purpose ID (DPDP §6); 2 critical cases later saw the data reused for marketing without fresh consent.',
  'DT-07': '3 DPDP right-to-erasure / correction requests missed the 30-day closure; 1 critical request is past 60 days with no interim update to the data principal.',
  'DT-08': '2 cross-border data transfers lack the DPDP-required notified-geography attestation on the transfer register; no live incident but the control evidence is incomplete.',

  // ---------- Finance ----------
  'FN-01': '5 GL recon breaks are open across sub-ledgers; 1 critical break is > 30 days on the card-settlement ledger. Daily recon evidence is available but break clearance lags.',
  'FN-02': '4 nostro reconciliation breaks are > 30 days old; 1 critical break is with a correspondent bank and remains unexplained in the register.',
  'FN-03': '3 IBA entries are aged past the 30-day clearance SLA; 1 critical entry is > 90 days and was not disclosed in the monthly suspense report.',
  'FN-04': '4 suspense-account items are > 90 days without justification / approval; 1 critical item is a large deposit not yet matched to a customer account.',
  'FN-05': '1 interest-accrual reversal was processed late on an NPA account — captured in the next day\'s run instead of same-day. Minor, no material impact.',
  'FN-06': '5 expense approvals were outside the DOA matrix; 1 critical expense was approved by a person whose DOA had lapsed.',
  'FN-07': '4 vendor payments were released without a full 3-way match (PO / GRN / Invoice); 1 critical payment was to an account not present in the verified-bank list.',
  'FN-08': '6 manual journal entries lack documented review + approval; 1 critical JE is a round-sum entry that should have been flagged for additional scrutiny.',

  // ---------- Ops & Third-Party ----------
  'OP-01': '3 vendor onboarding packs were submitted without the current UBO declaration (Finacle vendor refs V0S-2281, V0S-2294, V0S-2312). 1 critical: sanctions re-screen for "SpaceOrb Analytics Pvt Ltd" used a stale World-Check export dated 04-Mar instead of the 01-Apr bulletin — clear status cannot be relied on for go-live. Re-run screening on the live list and attach to workflow before MSA execution.',
  'OP-02': '9 vendors are overdue on their annual TPRM score refresh; 2 critical vendors are material outsourcing where the prior risk score was also Amber.',
  'OP-03': '1 outsourcing arrangement is missing the updated RBI outsourcing clause set (post-2023 MD). Contract amendment is drafted but not yet executed.',
  'OP-04': '1 half-yearly BCP drill is delayed; the drill plan and scenario are approved but the test date has slipped by 40 days.',
  'OP-05': '7 JML events missed the full workflow — joiner BGV, mover re-certification or leaver asset return; 2 critical are leavers with assets unreturned and access still partially active.',
  'OP-06': '4 BGV exceptions: BGV closed after DOJ / with pending items; 1 critical BGV is on a sensitive-role employee where the external verification came back mismatched and was not escalated.',
};

const getAuditorFocusForControl = (c) => {
  if (AUDITOR_FINDINGS[c.id]) return AUDITOR_FINDINGS[c.id];
  if (c.exceptions === 0 && c.violations === 0) {
    return `No failing cases in the current test window for ${c.id}. Design and evidence trail support an effective rating; continue monitoring per audit plan.`;
  }
  return `${c.exceptions} case(s) failed ${c.id}${c.violations ? `, ${c.violations} classified critical` : ''}. Open the Evidence pack for the sampled ticket IDs and management response.`;
};

const OFFICER_POOL = [
  { name: 'Priya Nair',        empId: 'EMP-4812', location: 'Anna Nagar Br, CHE' },
  { name: 'Arjun Menon',       empId: 'EMP-5123', location: 'Bandra Br, MUM' },
  { name: 'Saranya R.',        empId: 'EMP-3945', location: 'Gachibowli Br, HYD' },
  { name: 'Vinod Kumar',       empId: 'EMP-6701', location: 'CP Br, DEL' },
  { name: 'Meera Das',         empId: 'EMP-2890', location: 'Kolkata HQ' },
  { name: 'Ankur Shah',        empId: 'EMP-5567', location: 'Indiranagar Br, BLR' },
  { name: 'Harshita Agarwal',  empId: 'EMP-6120', location: 'Mumbai HQ' },
  { name: 'Rohan Iyer',        empId: 'EMP-7214', location: 'Corporate Office, MUM' },
  { name: 'Kavya Reddy',       empId: 'EMP-4430', location: 'Jubilee Hills Br, HYD' },
  { name: 'Naveen Patel',      empId: 'EMP-5801', location: 'Ahmedabad HQ' },
  { name: 'Shreya Bhatt',      empId: 'EMP-3322', location: 'Noida Ops, NCR' },
  { name: 'Karthik Ramesh',    empId: 'EMP-4598', location: 'Chennai Ops, CHE' },
  { name: 'Nabila Khan',       empId: 'EMP-5012', location: 'Mumbai HQ' },
  { name: 'Pawan Joshi',       empId: 'EMP-6344', location: 'Pune Tech Hub' },
  { name: 'Deepa Raman',       empId: 'EMP-2890', location: 'Bengaluru Tech' },
];

/** Deterministic pseudo-random hash so the same case always gets the same trail */
const stableHash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = ((h * 31) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/** Pick an officer deterministically for a (case, stage) pair */
const pickOfficer = (caseId, stageId) => OFFICER_POOL[stableHash(caseId + ':' + stageId) % OFFICER_POOL.length];

/** Per-case definition — each case explicitly states if & where it fails so the
 *  auditor's trail is auditable rather than random. scenario:
 *    - 'clean'        : all stages accepted
 *    - 'rejected'     : failStage marked rejected (critical failure)
 *    - 'pending'      : failStage is pending evidence submission
 */
const CASE_POOL = {
  customer: [
    { id: 'CUST-2026-04-1001', subject: 'Ravi Kumar',         segment: 'Individual — Savings',  opened: '14 Apr 2026', scenario: 'clean' },
    { id: 'CUST-2026-04-1002', subject: 'Usha Rao',           segment: 'NRI — Savings',         opened: '14 Apr 2026', scenario: 'rejected', failStageId: 'kyc',    failControlId: 'CL-01' },
    { id: 'CUST-2026-04-1003', subject: 'Sridhar Menon',      segment: 'HNI — Private Banking', opened: '14 Apr 2026', scenario: 'rejected', failStageId: 'risk',   failControlId: 'CL-03' },
    { id: 'CUST-2026-04-1004', subject: 'Sowmya Iyer',        segment: 'Individual — Salary',   opened: '15 Apr 2026', scenario: 'pending',  failStageId: 'kyc',    failControlId: 'CL-01' },
    { id: 'CUST-2026-04-1005', subject: 'Priya Nair',         segment: 'Startup (PMSE)',        opened: '15 Apr 2026', scenario: 'clean', journeyException: 'Low score' },
    { id: 'CUST-2026-04-1006', subject: 'Karthik Subramanian',segment: 'Individual',            opened: '16 Apr 2026', scenario: 'clean' },
    { id: 'CUST-2026-04-1007', subject: 'Aarav Nagpal (LLP)', segment: 'Corporate LLP',         opened: '16 Apr 2026', scenario: 'rejected', failStageId: 'ubo',    failControlId: 'CL-05' },
    { id: 'CUST-2026-04-1008', subject: 'Nabin Dey',          segment: 'PEP (High Risk)',       opened: '17 Apr 2026', scenario: 'rejected', failStageId: 'risk',   failControlId: 'CL-03' },
  ],
  loan: [
    { id: 'LN-2026-04-5001', subject: 'Home Loan — R. Krishnan',     segment: '₹48 L / 20y',   opened: '12 Apr 2026', scenario: 'clean' },
    { id: 'LN-2026-04-5002', subject: 'Personal Loan — S. Mehta',    segment: '₹5 L / 3y',     opened: '12 Apr 2026', scenario: 'rejected', failStageId: 'uw',    failControlId: 'LN-03' },
    { id: 'LN-2026-04-5003', subject: 'Home Loan — P. Varma',        segment: '₹82 L / 25y',   opened: '13 Apr 2026', scenario: 'clean', journeyException: 'Covenant waiver — documented' },
    { id: 'LN-2026-04-5004', subject: 'Vehicle Loan — T. Sharma',    segment: '₹14 L / 5y',    opened: '13 Apr 2026', scenario: 'pending',  failStageId: 'bureau',failControlId: 'LN-02' },
    { id: 'LN-2026-04-5005', subject: 'MSME Loan — Vikram Traders',  segment: '₹1.2 Cr / 7y',  opened: '14 Apr 2026', scenario: 'rejected', failStageId: 'doa',   failControlId: 'LN-04' },
    { id: 'LN-2026-04-5006', subject: 'Gold Loan — N. Lakshmi',      segment: '₹2.4 L / 1y',   opened: '14 Apr 2026', scenario: 'clean' },
    { id: 'LN-2026-04-5007', subject: 'Home Loan — A. Fernandes',    segment: '₹60 L / 20y',   opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'collateral', failControlId: 'LN-05' },
    { id: 'LN-2026-04-5008', subject: 'Business Loan — Star Food Co',segment: '₹3.5 Cr / 6y',  opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'pdm',   failControlId: 'LN-08' },
  ],
  transaction: [
    { id: 'TX-20260417-091234', subject: 'RTGS ₹28,40,000 — Corp Payment', segment: 'RTGS — Corporate',  opened: '17 Apr 2026 09:12', scenario: 'clean' },
    { id: 'TX-20260417-091302', subject: 'NEFT ₹2,45,000 — Vendor',        segment: 'NEFT',              opened: '17 Apr 2026 09:13', scenario: 'rejected', failStageId: 'author', failControlId: 'TX-01' },
    { id: 'TX-20260417-091441', subject: 'IMPS ₹48,000 — P2P',             segment: 'IMPS',              opened: '17 Apr 2026 09:14', scenario: 'clean' },
    { id: 'TX-20260417-093012', subject: 'LRS ₹16,20,000 — USD remittance',segment: 'LRS',               opened: '17 Apr 2026 09:30', scenario: 'rejected', failStageId: 'limit',  failControlId: 'TX-06' },
    { id: 'TX-20260417-104552', subject: 'Cash deposit ₹11,00,000',        segment: 'Cash',              opened: '17 Apr 2026 10:45', scenario: 'pending',  failStageId: 'process',failControlId: 'TX-05' },
    { id: 'TX-20260417-121032', subject: 'Cheque clearing ₹4,20,000',      segment: 'CTS',               opened: '17 Apr 2026 12:10', scenario: 'clean' },
  ],
  risk: [
    { id: 'AL-20260417-7112', subject: 'Structuring alert — A/c ****4411', segment: 'AML',     opened: '17 Apr 2026', scenario: 'clean' },
    { id: 'AL-20260417-7113', subject: 'Rapid mvmt — A/c ****2088',        segment: 'AML',     opened: '17 Apr 2026', scenario: 'rejected', failStageId: 'l1',  failControlId: 'RK-01' },
    { id: 'AL-20260417-7114', subject: 'Sanctions hit — Beneficiary',       segment: 'Sanctions',opened: '17 Apr 2026', scenario: 'clean' },
    { id: 'AL-20260417-7115', subject: 'Unusual foreign inward — A/c ****7721', segment: 'AML', opened: '17 Apr 2026', scenario: 'rejected', failStageId: 'str', failControlId: 'RK-02' },
    { id: 'AL-20260417-7116', subject: 'Chargeback dispute — Visa',        segment: 'Disputes', opened: '17 Apr 2026', scenario: 'clean' },
    { id: 'AL-20260417-7117', subject: 'Fraud case — Vishing Mumbai',      segment: 'Fraud',    opened: '17 Apr 2026', scenario: 'pending',  failStageId: 'l2',  failControlId: 'RK-05' },
  ],
  access: [
    { id: 'IAM-2026-3301', subject: 'New joiner — Finacle access',   segment: 'Joiner',     opened: '14 Apr 2026', scenario: 'clean' },
    { id: 'IAM-2026-3302', subject: 'Role change — AVP Credit',      segment: 'Mover',      opened: '14 Apr 2026', scenario: 'rejected', failStageId: 'sod',     failControlId: 'AC-05' },
    { id: 'IAM-2026-3303', subject: 'PAM vault — DB Admin',          segment: 'Privileged', opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'pam',     failControlId: 'AC-03' },
    { id: 'IAM-2026-3304', subject: 'Leaver — Branch Operations',    segment: 'Leaver',     opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'deprov',  failControlId: 'AC-02' },
    { id: 'IAM-2026-3305', subject: 'Contract renewal — Vendor ID',  segment: 'Mover',      opened: '16 Apr 2026', scenario: 'clean' },
    { id: 'IAM-2026-3306', subject: 'MFA enrolment — Trade Fin user',segment: 'Joiner',     opened: '16 Apr 2026', scenario: 'pending',  failStageId: 'mfa',     failControlId: 'AC-06' },
  ],
  itchange: [
    { id: 'CHG-20260415-2101', subject: 'CBS interest-rate patch',   segment: 'Normal',     opened: '15 Apr 2026', scenario: 'clean' },
    { id: 'CHG-20260415-2102', subject: 'UPI gateway upgrade',       segment: 'Normal',     opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'cab',   failControlId: 'CM-01' },
    { id: 'CHG-20260415-2103', subject: 'Prod config hotfix',        segment: 'Emergency',  opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'emg',   failControlId: 'CM-06' },
    { id: 'CHG-20260416-2104', subject: 'Critical OS patch',         segment: 'Normal',     opened: '16 Apr 2026', scenario: 'pending',  failStageId: 'patch', failControlId: 'CM-08' },
    { id: 'CHG-20260416-2105', subject: 'Disaster recovery fix',     segment: 'Normal',     opened: '16 Apr 2026', scenario: 'clean' },
  ],
  infra: [
    { id: 'INF-20260414-8801', subject: 'Firewall rule review — Q1', segment: 'Periodic',   opened: '14 Apr 2026', scenario: 'rejected', failStageId: 'fw',       failControlId: 'IN-01' },
    { id: 'INF-20260414-8802', subject: 'New Linux server build',    segment: 'Build',      opened: '14 Apr 2026', scenario: 'clean' },
    { id: 'INF-20260415-8803', subject: 'Cloud IAM audit — AWS',     segment: 'Periodic',   opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'cloud',    failControlId: 'IN-04' },
    { id: 'INF-20260415-8804', subject: 'Monthly VA scan',           segment: 'Periodic',   opened: '15 Apr 2026', scenario: 'pending',  failStageId: 'vuln',     failControlId: 'IN-07' },
    { id: 'INF-20260416-8805', subject: 'DR drill — Core Banking',   segment: 'Drill',      opened: '16 Apr 2026', scenario: 'clean' },
    { id: 'INF-20260416-8806', subject: 'Backup failure investigation',segment: 'Incident', opened: '16 Apr 2026', scenario: 'rejected', failStageId: 'backup',   failControlId: 'IN-05' },
  ],
  data: [
    { id: 'DPR-2026-04-601', subject: 'DPDP erasure — Cust ****3381', segment: 'DPDP request',  opened: '14 Apr 2026', scenario: 'clean' },
    { id: 'DPR-2026-04-602', subject: 'Masking job — QA refresh',     segment: 'Masking',       opened: '14 Apr 2026', scenario: 'rejected', failStageId: 'mask',     failControlId: 'DT-02' },
    { id: 'DPR-2026-04-603', subject: 'DLP incident — bulk export',   segment: 'DLP Incident',  opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'dlp',      failControlId: 'DT-04' },
    { id: 'DPR-2026-04-604', subject: 'Classification — new dataset', segment: 'Classification',opened: '15 Apr 2026', scenario: 'pending',  failStageId: 'classify', failControlId: 'DT-01' },
    { id: 'DPR-2026-04-605', subject: 'Cross-border transfer — SG',   segment: 'Xborder',       opened: '16 Apr 2026', scenario: 'clean' },
    { id: 'DPR-2026-04-606', subject: 'Retention purge — 2018 data',  segment: 'Retention',     opened: '16 Apr 2026', scenario: 'rejected', failStageId: 'retain',   failControlId: 'DT-03' },
  ],
  finance: [
    { id: 'FIN-2026-03-B1', subject: 'Mar 2026 month-end close',      segment: 'Close',       opened: '31 Mar 2026', scenario: 'clean' },
    { id: 'FIN-2026-04-B1', subject: 'Apr 2026 Wk-2 GL close',        segment: 'Close',       opened: '11 Apr 2026', scenario: 'rejected', failStageId: 'gl',     failControlId: 'FN-01' },
    { id: 'FIN-2026-04-B2', subject: 'Apr 2026 Nostro close',         segment: 'Close',       opened: '12 Apr 2026', scenario: 'rejected', failStageId: 'nostro', failControlId: 'FN-02' },
    { id: 'FIN-2026-04-B3', subject: 'Apr 2026 Suspense review',      segment: 'Periodic',    opened: '14 Apr 2026', scenario: 'pending',  failStageId: 'susp',   failControlId: 'FN-04' },
    { id: 'FIN-2026-04-B4', subject: 'Vendor payment run — Wk-16',    segment: 'AP Run',      opened: '15 Apr 2026', scenario: 'clean' },
  ],
  ops: [
    { id: 'OPS-2026-04-V101', subject: 'Vendor — Infosys Ltd (IT)',   segment: 'Onboarding',  opened: '10 Apr 2026', scenario: 'rejected', failStageId: 'dd',      failControlId: 'OP-02' },
    { id: 'OPS-2026-04-V102', subject: 'Vendor — TCS BCP Testing',    segment: 'BCP',         opened: '11 Apr 2026', scenario: 'clean' },
    { id: 'OPS-2026-04-H201', subject: 'HR Joiner — N. Kumar',        segment: 'Joiner',      opened: '14 Apr 2026', scenario: 'clean' },
    { id: 'OPS-2026-04-H202', subject: 'HR Mover — S. Banerjee',      segment: 'Mover',       opened: '14 Apr 2026', scenario: 'pending',  failStageId: 'mover',   failControlId: 'OP-05' },
    { id: 'OPS-2026-04-H203', subject: 'HR Leaver — K. Das',          segment: 'Leaver',      opened: '15 Apr 2026', scenario: 'rejected', failStageId: 'leaver',  failControlId: 'OP-05' },
  ],
};

/** Stage evidence template — generic filenames based on stage name & case id. */
const buildStageEvidence = (caseId, stage) => {
  const base = stage.name.replace(/[^A-Za-z0-9]+/g, '_');
  const rnd = stableHash(caseId + stage.id);
  const items = [
    { name: `${base}_Attestation_${caseId}.pdf`,        type: 'PDF',  size: `${220 + (rnd % 200)} KB`, system: 'Workflow System' },
    { name: `${base}_SupportingDoc_${caseId}.pdf`,      type: 'PDF',  size: `${340 + (rnd % 500)} KB`, system: 'Document Vault' },
    { name: `${base}_SystemLog_${caseId}.json`,         type: 'JSON', size: `${80 + (rnd % 120)} KB`, system: 'SIEM (Splunk)' },
    { name: `${base}_Workpaper_${caseId}.xlsx`,         type: 'XLSX', size: `${620 + (rnd % 900)} KB`, system: 'Audit Vault' },
  ];
  return items.slice(0, 2 + (rnd % 3)); // 2–4 items per stage
};

/** Compute the full stage-by-stage journey for a single case. */
const buildCaseJourney = (caseRec, sop, controls) => {
  const controlsById = Object.fromEntries(controls.map((c) => [c.id, c]));
  const failStageIdx = caseRec.scenario === 'clean' ? -1 : sop.stages.findIndex((s) => s.id === caseRec.failStageId);

  const trail = sop.stages.map((stage, idx) => {
    const officer = pickOfficer(caseRec.id, stage.id);

    let status = 'accepted';
    let submittedAt = null;
    let evidenceItems = [];
    let controlResults = {};

    const stageControls = stage.controlIds.map((cid) => controlsById[cid]).filter(Boolean);

    if (caseRec.scenario === 'clean' || failStageIdx < 0) {
      status = 'accepted';
    } else if (idx < failStageIdx) {
      status = 'accepted';
    } else if (idx === failStageIdx) {
      status = caseRec.scenario === 'pending' ? 'pending' : 'rejected';
    } else {
      status = 'blocked';
    }

    if (status === 'accepted' || status === 'rejected') {
      evidenceItems = buildStageEvidence(caseRec.id, stage);
      submittedAt = `${caseRec.opened} · ${9 + (idx % 6)}:${String(10 + (stableHash(caseRec.id + stage.id) % 49)).padStart(2, '0')}`;
    } else if (status === 'pending') {
      evidenceItems = buildStageEvidence(caseRec.id, stage).slice(0, 1);
      submittedAt = null;
    }

    stageControls.forEach((c) => {
      if (status === 'accepted') controlResults[c.id] = 'pass';
      else if (status === 'rejected' && c.id === caseRec.failControlId) controlResults[c.id] = 'fail';
      else if (status === 'rejected') controlResults[c.id] = 'pass';
      else if (status === 'pending') controlResults[c.id] = c.id === caseRec.failControlId ? 'pending' : 'pass';
      else controlResults[c.id] = 'not-started';
    });

    return {
      stage,
      status,
      submittedBy: status === 'pending' || status === 'blocked' ? null : { ...officer, role: stage.owner.role, team: stage.owner.team },
      submittedAt,
      evidenceItems,
      controlResults,
    };
  });

  const overallStatus =
    caseRec.scenario === 'clean'    ? 'compliant' :
    caseRec.scenario === 'rejected' ? 'failure'   : 'pending';

  return { ...caseRec, trail, overallStatus };
};

const CASES_BY_DOMAIN = Object.fromEntries(
  Object.keys(CASE_POOL).map((domainId) => [
    domainId,
    (CASE_POOL[domainId] || []).map((c) => buildCaseJourney(c, SOP_BY_DOMAIN[domainId], CONTROLS_BY_DOMAIN[domainId])),
  ])
);

// ============================================================================
// Consistent evidence generator — every control exposes the SAME structure
// ============================================================================

/**
 * Each control exposes identical evidence blocks:
 *  - Testing procedure (how audit validated)
 *  - Population & sample coverage
 *  - Exception log (sample records flagged)
 *  - Source systems / data pipelines
 *  - Documents on file
 *  - Auditor note
 *  - Management response
 */
/** Find every SOP stage (across all domains) that references this control, so
 *  the auditor can see the full list of accountable evidence submitters. */
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

/** For a control, pick up to 4 representative sample cases across all domains
 *  where that control actually fires so the drawer can display a real trail. */
const findCasesForControl = (ctrlId) => {
  const out = [];
  Object.entries(CASES_BY_DOMAIN).forEach(([, kases]) => {
    kases.forEach((k) => {
      const hit = k.trail.find((t) => t.stage.controlIds.includes(ctrlId));
      if (hit) out.push({ kase: k, hit });
    });
  });
  // Prefer a mix: show some failures first, then clean, then pending
  const order = { failure: 0, pending: 1, compliant: 2 };
  out.sort((a, b) => (order[a.kase.overallStatus] - order[b.kase.overallStatus]));
  return out.slice(0, 4);
};

const buildEvidence = (ctrl, domainLabel) => ({
  control:       ctrl,
  domainLabel,
  stageSubmitters: findStagesForControl(ctrl.id),
  sampleCaseTrails: findCasesForControl(ctrl.id),
  lastTested:    '14 Apr 2026',
  tester:        'R. Banerjee (IA — Sr. Manager)',
  testingSteps: [
    `Identified the ${ctrl.population.toLocaleString('en-IN')} in-scope cases that were required to satisfy this control during 01-Jan to 31-Mar 2026. Every case — not a sample — must have evidence on file for this control.`,
    `For each case, traced the stage in the SOP where this control fires and identified the accountable role responsible for submitting evidence at that stage.`,
    `Reconciled evidence submissions against source systems (CBS, LOS, CRM, IAM, SIEM) for all cases; flagged cases where evidence was missing, rejected or late.`,
    `Categorised each flagged case as Failed (control did not pass) or Critical Failure (additionally breaches a specific regulatory / policy line). Discussed root cause with each accountable owner.`,
  ],
  exceptionLog: [
    { ref: `${ctrl.id}-EX-001`, detail: `Sampled record missing approver sign-off`, severity: ctrl.violations > 0 ? 'Critical' : 'Medium', owner: ctrl.owner, sla: 'Breached', action: 'Raised to management for remediation' },
    { ref: `${ctrl.id}-EX-002`, detail: `System entry dated prior to supporting document`, severity: 'High', owner: ctrl.owner, sla: 'Breached', action: 'Corrective entry booked' },
    { ref: `${ctrl.id}-EX-003`, detail: `Override applied but justification field blank`, severity: 'Medium', owner: ctrl.owner, sla: 'Within', action: 'Documentation updated' },
    { ref: `${ctrl.id}-EX-004`, detail: `Periodic review not on file for sampled account`, severity: 'Medium', owner: ctrl.owner, sla: 'Breached', action: 'Review recompleted; added to tracker' },
  ].slice(0, Math.max(1, Math.min(ctrl.exceptions, 4))),
  sourceSystems: [
    { name: 'Core Banking — Finacle', record: `${ctrl.population.toLocaleString('en-IN')} in-scope cases reconciled` },
    { name: 'LOS / CRM', record: 'Workflow logs and approver timestamps extracted for every case' },
    { name: 'IAM / AD', record: 'Evidence submitter (role + empId) attributed for every case' },
    { name: 'SIEM (Splunk)', record: 'Event logs reconciled end-to-end for every case' },
  ],
  documents: [
    { name: `${ctrl.id}_Control_Design_v2.pdf`, type: 'PDF',  size: '312 KB' },
    { name: `${ctrl.id}_Sample_Workpaper.xlsx`, type: 'XLSX', size: '1.4 MB' },
    { name: `${ctrl.id}_Exception_Log.csv`,      type: 'CSV',  size: '84 KB' },
    { name: `${ctrl.id}_Management_Signoff.pdf`, type: 'PDF',  size: '228 KB' },
  ],
  auditorNote:
    ctrl.status === 'deficient'
      ? `Control is assessed as DEFICIENT. ${ctrl.exceptions} exceptions observed (${ctrl.violations} critical). Root-cause lies in process adherence and system workflow gaps. Recommended to be remediated within 30 days with verification testing.`
      : ctrl.status === 'needs-attention'
      ? `Control is OPERATING BUT WITH DEVIATIONS. ${ctrl.exceptions} exceptions (${ctrl.violations} critical). Management has acknowledged; remediation plan targeted within current quarter.`
      : `Control is OPERATING EFFECTIVELY. Exceptions (${ctrl.exceptions}) within acceptable threshold; no systemic weakness identified.`,
  mgmtResponse:
    ctrl.status === 'deficient'
      ? `Accepted. Control owner to deliver corrective action plan within 15 days; re-testing in next audit cycle.`
      : ctrl.status === 'needs-attention'
      ? `Accepted with partial agreement. Additional monitoring added to QRR pack; target closure by quarter-end.`
      : `Noted. Will continue existing monitoring cadence.`,
});

// ============================================================================
// Header-level aggregates
// ============================================================================

const DOMAIN_SUMMARY = DOMAINS.filter((d) => d.id !== 'overview').map((d) => {
  const ctrls = CONTROLS_BY_DOMAIN[d.id] || [];
  const avg = ctrls.length ? ctrls.reduce((s, c) => s + c.compliance, 0) / ctrls.length : 0;
  return {
    id:         d.id,
    domain:     d.label,
    color:      d.color,
    controls:   ctrls.length,
    compliance: Number(avg.toFixed(1)),
    violations: ctrls.reduce((s, c) => s + c.violations, 0),
    exceptions: ctrls.reduce((s, c) => s + c.exceptions, 0),
  };
});

const TOTAL_CONTROLS    = DOMAIN_SUMMARY.reduce((s, d) => s + d.controls, 0);
const TOTAL_VIOLATIONS  = DOMAIN_SUMMARY.reduce((s, d) => s + d.violations, 0);
const TOTAL_EXCEPTIONS  = DOMAIN_SUMMARY.reduce((s, d) => s + d.exceptions, 0);
const OVERALL_COMPLIANCE = (DOMAIN_SUMMARY.reduce((s, d) => s + d.compliance, 0) / DOMAIN_SUMMARY.length).toFixed(1);

// ============================================================================
// AUDIT-GRADE OVERVIEW DATA
// Everything below is derived from CONTROLS_BY_DOMAIN so the whole Overview
// stays consistent with the rest of the dashboard. No magic numbers except
// small, deliberate ones for accepted-exception / rejected-by-audit buckets.
// ============================================================================

const AUDIT_CYCLE = {
  cycle:        'Q1 FY 2026 Internal Audit',
  periodLabel:  '01 Jan – 31 Mar 2026',
  lastRefresh:  '24 Apr 2026, 10:04 IST',
  status:       'Fieldwork in progress',
  reportDue:    '30 Apr 2026',
};

/** Per-domain audit ownership + plain-English top issue / next action. */
const DOMAIN_AUDIT_META = {
  customer:    { owner: 'Retail Banking Audit Lead',  topIssue: 'Periodic Re-KYC overdue for high-risk customers',     action: 'Re-certify high-risk Re-KYC list by 28 Apr' },
  loan:        { owner: 'Credit Audit Lead',          topIssue: 'Underwriting policy deviations on 14 sanctions',        action: 'Validate FOIR / LTV waivers against Board Risk minutes' },
  transaction: { owner: 'Payments Audit Lead',        topIssue: 'CTR filings overdue beyond 30 days',                    action: 'Pre-intimate FIU and submit the overdue CTRs' },
  risk:        { owner: 'AML Audit Lead',             topIssue: 'STR filings breaching 7-day PMLA window',               action: 'Request remediation plan + TAT dashboard from AML' },
  access:      { owner: 'IAM Audit Lead',             topIssue: 'Leaver access not revoked within T+1 (16 profiles)',    action: 'Immediate privileged & leaver access re-certification' },
  itchange:    { owner: 'Tech Audit Lead',            topIssue: '7 production changes bypassed CAB approval',            action: 'Enforce CAB gate and re-validate the 7 releases' },
  infra:       { owner: 'Cyber Audit Lead',           topIssue: '9 firewall rules stale / over-permissive',              action: 'Close stale rules and record owner justification' },
  data:        { owner: 'Data Audit Lead',            topIssue: 'PII in non-prod from silent masking failures',          action: 'Revoke vendor access and re-run masking with attestation' },
  finance:     { owner: 'Finance Audit Lead',         topIssue: 'Suspense items > 90 days without justification',        action: 'CFO disposition memo required before quarterly close' },
  ops:         { owner: 'TPRM Audit Lead',            topIssue: 'Vendor UBO / sanctions gaps on 3 onboarding packs',     action: 'Re-screen vendors on the live list before MSA execution' },
};

const _hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

/**
 * Enriched per-domain audit view (heatmap, KPIs, AI).
 * Residual risk is assigned by RANK (deterministic severity score across domains),
 * guaranteeing a demo-grade spread of 3 Critical · 3 High · 2 Medium · 2 Low
 * instead of clipping everything into a single bucket.
 */
const _scoredDomains = DOMAIN_SUMMARY.map((d) => {
  const ctrls = CONTROLS_BY_DOMAIN[d.id] || [];
  const notTested = _hash(d.id) % 3;
  const tested    = Math.max(0, ctrls.length - notTested);
  const notMet    = ctrls.filter((c) => c.status === 'deficient' || c.violations >= 2).length;
  const review    = ctrls.filter((c) => c.status === 'needs-attention' && !(c.violations >= 2)).length;
  const met       = Math.max(0, tested - notMet - review);
  const evidenceGaps       = d.violations * 2 + ctrls.filter((c) => c.status === 'needs-attention').length;
  const overdueRemediation = Math.max(0, Math.round(d.violations * 0.9 + d.exceptions * 0.08));
  const repeatFindings     = Math.max(0, Math.floor(d.violations / 2) + (_hash(d.id + 'r') % 3));
  const severityScore      = d.violations * 10 + overdueRemediation * 2 + evidenceGaps + repeatFindings * 3;
  return {
    ...d,
    tested, notTested, met, notMet, review,
    evidenceGaps, overdueRemediation, repeatFindings, severityScore,
    ...(DOMAIN_AUDIT_META[d.id] || { owner: 'Audit Lead', topIssue: '—', action: '—' }),
  };
});

const _residualRankCutoffs = (n) => ({
  critical: Math.max(1, Math.floor(n * 0.3)),
  high:     Math.max(1, Math.floor(n * 0.3)),
  medium:   Math.max(1, Math.floor(n * 0.2)),
});

const _residualRiskById = (() => {
  const cuts = _residualRankCutoffs(_scoredDomains.length);
  const ranked = [..._scoredDomains].sort((a, b) => b.severityScore - a.severityScore);
  const map = new Map();
  ranked.forEach((d, i) => {
    const label =
      i < cuts.critical ? 'Critical'
      : i < cuts.critical + cuts.high ? 'High'
      : i < cuts.critical + cuts.high + cuts.medium ? 'Medium'
      : 'Low';
    map.set(d.id, label);
  });
  return map;
})();

const DOMAIN_AUDIT_VIEW = _scoredDomains.map((d) => ({
  ...d,
  residualRisk: _residualRiskById.get(d.id) || 'Low',
}));

const AUDIT_TOTALS = DOMAIN_AUDIT_VIEW.reduce((a, d) => ({
  controls:     a.controls + d.controls,
  tested:       a.tested + d.tested,
  notTested:    a.notTested + d.notTested,
  met:          a.met + d.met,
  review:       a.review + d.review,
  notMet:       a.notMet + d.notMet,
  critical:     a.critical + d.violations,
  evidenceGaps: a.evidenceGaps + d.evidenceGaps,
  overdue:      a.overdue + d.overdueRemediation,
  repeat:       a.repeat + d.repeatFindings,
  exceptions:   a.exceptions + d.exceptions,
}), { controls: 0, tested: 0, notTested: 0, met: 0, review: 0, notMet: 0, critical: 0, evidenceGaps: 0, overdue: 0, repeat: 0, exceptions: 0 });

/** Controls with deficient evidence / design status (maps to “Evidence missing” KPI). */
const EVIDENCE_MISSING_COUNT = DOMAIN_SUMMARY.reduce(
  (n, d) => n + (CONTROLS_BY_DOMAIN[d.id] || []).filter((c) => c.status === 'deficient').length,
  0
);

const RESIDUAL_RISK_OVERALL =
  DOMAIN_AUDIT_VIEW.some((d) => d.residualRisk === 'Critical') ? 'Critical'
  : DOMAIN_AUDIT_VIEW.some((d) => d.residualRisk === 'High') ? 'High'
  : DOMAIN_AUDIT_VIEW.some((d) => d.residualRisk === 'Medium') ? 'Medium'
  : 'Low';

const RESIDUAL_RISK_TONE = {
  Critical: { text: 'text-red-700',     bg: 'bg-red-50',     ring: 'ring-red-200',     dot: 'bg-red-500' },
  High:     { text: 'text-orange-700',  bg: 'bg-orange-50',  ring: 'ring-orange-200',  dot: 'bg-orange-500' },
  Medium:   { text: 'text-amber-700',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   dot: 'bg-amber-500' },
  Low:      { text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
};

/** Single-line display for AI actions (full text in `title` on hover). */
const toOneLineSolution = (raw, maxLen = 118) => {
  const t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!t) return '—';
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const i = cut.lastIndexOf(' ');
  return `${(i > 32 ? cut.slice(0, i) : cut).trim()}…`;
};

/**
 * AI Audit Intelligence — full finding feed (Critical · High · Medium · Low) derived from
 * DOMAIN_AUDIT_VIEW so auditors see the complete picture, not only critical items.
 * Each entry: severity pill, title, recommendation; click drills to the domain.
 */
const SEVERITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const severityToTone = (sev) =>
  (sev === 'Critical' ? 'critical'
    : sev === 'High' ? 'high'
    : sev === 'Medium' ? 'medium'
    : 'low');

const AI_AUDIT_INTEL = (() => {
  const ranked = [...DOMAIN_AUDIT_VIEW].sort((a, b) => {
    const s = SEVERITY_RANK[a.residualRisk] - SEVERITY_RANK[b.residualRisk];
    return s !== 0
      ? s
      : (b.violations * 10 + b.overdueRemediation) - (a.violations * 10 + a.overdueRemediation);
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
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );

  return { findings, severityCounts };
})();

/** Light-theme alert tokens — severity pill + border. */
const AI_ALERT_CARD_STYLES = {
  critical: {
    border: 'border-red-200 hover:border-red-300 hover:shadow-md',
    iconWrap: 'bg-red-600 text-white shadow-sm',
    pill: 'bg-red-600 text-white',
    pillText: 'CRITICAL',
  },
  high: {
    border: 'border-amber-200 hover:border-amber-300 hover:shadow-md',
    iconWrap: 'bg-amber-500 text-white shadow-sm',
    pill: 'bg-amber-500 text-white',
    pillText: 'HIGH',
  },
  medium: {
    border: 'border-sky-200 hover:border-sky-300 hover:shadow-md',
    iconWrap: 'bg-sky-600 text-white shadow-sm',
    pill: 'bg-sky-600 text-white',
    pillText: 'MEDIUM',
  },
  low: {
    border: 'border-emerald-200 hover:border-emerald-300 hover:shadow-md',
    iconWrap: 'bg-emerald-600 text-white shadow-sm',
    pill: 'bg-emerald-600 text-white',
    pillText: 'LOW',
  },
};

/** Summary counts row rendered at the bottom of the AI panel. */
const AI_SEVERITY_SUMMARY = [
  { key: 'Critical', label: 'Critical', cls: 'text-red-600' },
  { key: 'High',     label: 'High',     cls: 'text-amber-600' },
  { key: 'Medium',   label: 'Medium',   cls: 'text-sky-600' },
  { key: 'Low',      label: 'Monitor',  cls: 'text-emerald-600' },
];

/** Only from xl up: one fixed-height row; stacked layout below stays natural. */
const OVERVIEW_HERO_ROW_H_XL =
  'xl:h-[min(650px,calc(100dvh-6rem))] xl:max-h-[min(650px,calc(100dvh-6rem))]';

/**
 * AI shell: below the xl breakpoint, a self-contained scroll column; at xl+ it fills the hero row
 * (same as dark “AI Summary Wall” beside the 2×2).
 */
const AI_INTELLIGENCE_PANEL_H = [
  'box-border flex w-full min-w-0 flex-col overflow-hidden',
  'h-[min(650px,calc(100dvh-6rem))] max-h-[min(650px,calc(100dvh-6rem))] min-h-0',
  'xl:h-full xl:max-h-full',
].join(' ');

/**
 * Hero row: 8 + 4 columns on xl+ → main metrics ~⅔, AI rail ~⅓ (narrower, dark-layout parity).
 */
const OVERVIEW_HERO_OUTER = [
  'grid min-h-0 grid-cols-1 gap-3 sm:gap-4',
  'min-h-0',
  'xl:grid-cols-12 xl:items-stretch xl:overflow-hidden xl:gap-5 2xl:gap-6',
  OVERVIEW_HERO_ROW_H_XL,
].join(' ');
const OVERVIEW_METRICS_COL = 'h-full min-h-0 min-w-0 overflow-hidden xl:col-span-8';
const OVERVIEW_AI_RAIL_COL = [
  'flex h-full min-h-0 w-full min-w-0 max-w-full flex-col items-stretch justify-start overflow-hidden',
  'xl:col-span-4',
].join(' ');

/**
 * Light overview hero — mirrors dark “Summary + AI wall”:
 * left 2×2 metrics (wide), right narrow scrollable AI rail, shared row height at xl+.
 */
const OverviewHeroRow = ({ summaryGrid, intelligencePanel }) => (
  <div className={OVERVIEW_HERO_OUTER}>
    <div className={OVERVIEW_METRICS_COL}>{summaryGrid}</div>
    <div className={OVERVIEW_AI_RAIL_COL}>{intelligencePanel}</div>
  </div>
);

// ============================================================================
// Overview — 4 Internal-Audit command-centre cards (2×2 grid)
//   1. Audit Coverage       — controls in scope split by test outcome
//   2. Deficiency Rate      — % failing + per-group bars
//   3. Open Findings        — critical-rated opens + top-4 domain mix
//   4. Residual Risk        — risk mix + strongest / weakest domains
// ============================================================================

const FINDING_SEGMENT_COLORS = ['#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];
/** Remaining domains aggregated so donut + legend sum to the headline total. */
const OPEN_FINDINGS_OTHER_SLATE = '#94a3b8';

/**
 * Single donut slice: angles in radians, 0 = 3 o'clock, increasing = clockwise (Math.cos/sin).
 * Start path at outer edge; outer arc to end; line to inner; inner arc back.
 */
const donutSlicePath = (cx, cy, rOuter, rInner, t0, t1) => {
  const xo0 = cx + rOuter * Math.cos(t0);
  const yo0 = cy + rOuter * Math.sin(t0);
  const xo1 = cx + rOuter * Math.cos(t1);
  const yo1 = cy + rOuter * Math.sin(t1);
  const xi0 = cx + rInner * Math.cos(t0);
  const yi0 = cy + rInner * Math.sin(t0);
  const xi1 = cx + rInner * Math.cos(t1);
  const yi1 = cy + rInner * Math.sin(t1);
  const large = t1 - t0 > Math.PI ? 1 : 0;
  return [
    `M ${xo0} ${yo0}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${xo1} ${yo1}`,
    `L ${xi1} ${yi1}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${xi0} ${yi0}`,
    'Z',
  ].join(' ');
};

/** ViewBox for Open Findings donut — outer box scales via CSS; paths stay sharp. */
const OPEN_FINDINGS_DONUT_VB = 160;

/**
 * Proportions across `values` (same length as `colors`). Sizing is CSS-driven: use `className` for `w-*` / `h-*`.
 */
const OpenFindingsDonut = ({ values, colors, className = '' }) => {
  const total = values.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0) || 1;
  const s = OPEN_FINDINGS_DONUT_VB;
  const cx = s / 2;
  const cy = s / 2;
  const rO = s * 0.38;
  const rI = s * 0.22;
  const tau = 2 * Math.PI;
  const start = -Math.PI / 2;
  const { items: ringSlices } = values.reduce(
    (acc, raw, i) => {
      const v = Math.max(0, raw);
      if (v <= 0) return acc;
      const sweep = (v / total) * tau;
      const t0 = acc.angle;
      const t1 = acc.angle + sweep;
      acc.items.push({ i, t0, t1 });
      acc.angle = t1;
      return acc;
    },
    { angle: start, items: [] },
  );
  return (
    <svg
      className={className}
      viewBox={`0 0 ${s} ${s}`}
      role="img"
      aria-label="Share of all critical open findings by domain; slices sum to headline total"
    >
      {ringSlices.map(({ i, t0, t1 }) => (
        <path
          key={i}
          d={donutSlicePath(cx, cy, rO, rI, t0, t1)}
          fill={colors[i % colors.length]}
          stroke="white"
          strokeWidth="2"
          className="transition-opacity hover:opacity-90"
        />
      ))}
      <circle cx={cx} cy={cy} r={rI * 0.9} className="fill-white" />
    </svg>
  );
};

/**
 * One line per row: `24 - Access & Identity` with dot; equal-height row shells.
 * `rows[].key` must be unique (domain id or `open-findings-other-domains`).
 */
const OpenFindingsLegend = ({ rows }) => (
  <ul
    className="list-none flex min-h-0 w-full min-w-0 flex-1 flex-col justify-center gap-1 self-stretch overflow-hidden pl-2.5 sm:pl-3.5 sm:gap-1.5"
    aria-label="Critical open findings by domain"
  >
    {rows.map((row) => (
      <li
        key={row.key}
        className="flex w-full min-h-0 min-w-0 shrink-0 items-center gap-2 py-0.5"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: row.color }}
          aria-hidden
        />
        <p
          className="min-w-0 flex-1 truncate text-[11px] font-medium leading-snug text-slate-800 sm:text-xs"
          title={`${row.value} — ${row.name}`}
        >
          <span className="font-extrabold tabular-nums text-slate-900">{row.value}</span>
          <span className="px-1.5 text-slate-300" aria-hidden>
            –
          </span>
          <span className="font-medium text-slate-800">{row.name}</span>
        </p>
      </li>
    ))}
  </ul>
);

const RESIDUAL_ROW_STYLE = {
  Critical: { bar: 'bg-red-500',     txt: 'text-red-600' },
  High:     { bar: 'bg-amber-500',   txt: 'text-amber-600' },
  Medium:   { bar: 'bg-sky-500',     txt: 'text-sky-600' },
  Low:      { bar: 'bg-emerald-500', txt: 'text-emerald-600' },
};

/**
 * One shell for all four 2×2 overview cards — same outer size (fills grid cell) and
 * the same border / padding as Audit Coverage.
 */
const OVERVIEW_CARD_UNIFIED =
  'flex h-full min-h-0 w-full min-w-0 flex-col justify-start overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-slate-200/50 sm:p-3.5';

/** Card 1 — control universe split by test outcome (mirrors “Total interactions”). */
const AuditCoverageCard = () => {
  const total = AUDIT_TOTALS.controls;
  const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);
  const segments = [
    { label: 'Met',        value: AUDIT_TOTALS.met,       dot: 'bg-emerald-500', pctCls: 'text-emerald-600' },
    { label: 'Review',     value: AUDIT_TOTALS.review,    dot: 'bg-sky-500',     pctCls: 'text-sky-600' },
    { label: 'Not Met',    value: AUDIT_TOTALS.notMet,    dot: 'bg-red-500',     pctCls: 'text-red-600' },
    { label: 'Not Tested', value: AUDIT_TOTALS.notTested, dot: 'bg-amber-500',   pctCls: 'text-amber-600' },
  ];
  return (
    <div className={OVERVIEW_CARD_UNIFIED}>
      <div className="shrink-0">
        <h3 className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">Audit Coverage</h3>
        <div className="mt-0.5 text-2xl font-extrabold leading-none tabular-nums text-indigo-600 sm:text-3xl">
          {total}
        </div>
        <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-[10px]">
          Control Segmentation
        </p>
      </div>
      <div className="mt-1.5 flex min-h-0 flex-1 flex-col justify-center">
        <div className="grid grid-cols-2 content-center gap-1.5 sm:gap-2">
          {segments.map((it) => (
            <div
              key={it.label}
              className="flex flex-col gap-1.5 rounded-lg bg-slate-50/90 px-2.5 py-2 ring-1 ring-slate-200/80 sm:gap-2 sm:px-2.5 sm:py-2"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 sm:text-xs">
                <span className={`h-2 w-2 shrink-0 rounded-full ${it.dot}`} />
                <span className="min-w-0 leading-tight">{it.label}</span>
              </div>
              <div className="flex items-baseline justify-between gap-1.5">
                <span className="text-lg font-extrabold leading-none tabular-nums text-slate-900 sm:text-xl">
                  {it.value}
                </span>
                <span className={`shrink-0 text-xs font-bold tabular-nums sm:text-sm ${it.pctCls}`}>
                  {pct(it.value)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Card 2 — deficiency rate + per-group bars (mirrors “FCI Rate”). */
const FindingRateCard = () => {
  const rate = AUDIT_TOTALS.tested > 0 ? (AUDIT_TOTALS.notMet / AUDIT_TOTALS.tested) * 100 : 0;
  const groups = [
    { id: 'customer',    label: 'KYC',    color: '#10b981' },
    { id: 'transaction', label: 'Pymts',  color: '#0ea5e9' },
    { id: 'risk',        label: 'AML',    color: '#f59e0b' },
    { id: 'access',      label: 'Access', color: '#ef4444' },
  ].map((g) => {
    const d = DOMAIN_AUDIT_VIEW.find((x) => x.id === g.id);
    const r = d && d.tested > 0 ? (d.notMet / d.tested) * 100 : 0;
    return { ...g, rate: r };
  });
  const max = Math.max(...groups.map((g) => g.rate), 1);
  return (
    <div className={OVERVIEW_CARD_UNIFIED}>
      <div className="shrink-0">
        <h3 className="text-sm font-bold leading-tight text-slate-900 sm:text-base">Deficiency Rate</h3>
        <div className="mt-0.5 text-3xl font-extrabold leading-[1.1] tabular-nums text-pink-500 sm:text-4xl">
          {rate.toFixed(1)}%
        </div>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-xs">
          Controls failing vs. tested
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-xs">
          Rate by domain group
        </p>
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col justify-center sm:mt-2.5">
        <div className="flex h-32 items-end justify-between gap-2 sm:h-40 sm:gap-3 sm:px-0.5">
          {groups.map((g) => {
            const hPct = max > 0 ? (g.rate / max) * 100 : 0;
            return (
              <div key={g.id} className="flex min-w-0 flex-1 flex-col items-stretch">
                <div
                  className="mb-1 min-h-4 text-center text-[11px] font-bold tabular-nums leading-tight sm:text-sm"
                  style={{ color: g.color }}
                >
                  {g.rate.toFixed(1)}%
                </div>
                <div className="relative mx-auto h-20 w-full max-w-14 overflow-hidden rounded-t bg-slate-100/90 ring-1 ring-slate-200/70 sm:h-28 sm:max-w-16">
                  <div
                    className="absolute bottom-0 left-0 right-0 w-full rounded-t transition-all"
                    style={{
                      height: hPct > 0 ? `${hPct}%` : 0,
                      minHeight: g.rate > 0 && hPct > 0 ? 4 : 0,
                      backgroundColor: g.color,
                    }}
                  />
                </div>
                <div
                  className="mt-1.5 min-h-5 text-center text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500 sm:text-[11px]"
                >
                  {g.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Open findings: headline = sum of `violations` over **all** domains. Donut/legend
 * use the same total: top 4 + optional “all other domains” so counts always sum to
 * the headline (slice angles are shares of the full 124, not of 71 only).
 */
const OpenFindingsCard = () => {
  const headTotal = AUDIT_TOTALS.critical;
  const top4 = [...DOMAIN_AUDIT_VIEW]
    .sort((a, b) => b.violations - a.violations)
    .slice(0, 4);
  const top4Sum = top4.reduce((s, d) => s + d.violations, 0);
  const other = Math.max(0, headTotal - top4Sum);
  const values = other > 0 ? [...top4.map((d) => d.violations), other] : top4.map((d) => d.violations);
  const colorList =
    other > 0
      ? [...FINDING_SEGMENT_COLORS, OPEN_FINDINGS_OTHER_SLATE]
      : FINDING_SEGMENT_COLORS;
  const legendRows = [
    ...top4.map((d, i) => ({
      key: d.id,
      name: d.domain,
      value: d.violations,
      color: FINDING_SEGMENT_COLORS[i % FINDING_SEGMENT_COLORS.length],
    })),
    ...(other > 0
      ? [
          {
            key: 'open-findings-other-domains',
            name: 'All other domains',
            value: other,
            color: OPEN_FINDINGS_OTHER_SLATE,
          },
        ]
      : []),
  ];
  return (
    <div className={OVERVIEW_CARD_UNIFIED}>
      <div className="shrink-0">
        <h3 className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">Open Findings</h3>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-extrabold leading-none tabular-nums text-rose-500 sm:text-3xl">
            {headTotal}
          </span>
          <span className="text-xs font-semibold text-slate-500 sm:text-sm">open</span>
        </div>
        <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-[10px]">
          Critical-rated across the audit universe
        </p>
      </div>

      <div className="mt-1.5 flex min-h-0 w-full flex-1 flex-col justify-center">
        <div
          className="flex min-h-0 w-full min-w-0 flex-1 items-stretch justify-between gap-3.5 sm:gap-4"
          title="Donut shows how the headline count splits across top domains; grey is the remainder."
        >
          <div className="flex h-28 w-28 shrink-0 self-center sm:h-32 sm:w-32">
            <OpenFindingsDonut
              values={values}
              colors={colorList}
              className="h-full w-full max-h-full max-w-full drop-shadow-sm"
            />
          </div>
          <OpenFindingsLegend rows={legendRows} />
        </div>
      </div>
    </div>
  );
};

/** Card 4 — residual risk mix (severity counts with bars). */
const ResidualRiskCard = () => {
  const counts = AI_AUDIT_INTEL.severityCounts;
  const total = Math.max(1, Object.values(counts).reduce((s, v) => s + v, 0));
  return (
    <div className={OVERVIEW_CARD_UNIFIED}>
      <div className="shrink-0">
        <h3 className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">Residual Risk</h3>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-extrabold leading-none tabular-nums text-emerald-600 sm:text-3xl">
            {OVERALL_COMPLIANCE}%
          </span>
          <span className="text-xs font-semibold text-slate-500 sm:text-sm">compliance</span>
        </div>
        <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-[10px]">
          Overall residual: {RESIDUAL_RISK_OVERALL}
        </p>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-[10px]">
          Residual risk mix
        </p>
      </div>
      <div className="mt-1.5 flex min-h-0 flex-1 flex-col justify-center space-y-1.5 sm:space-y-2">
        {['Critical', 'High', 'Medium', 'Low'].map((sev) => {
          const c = counts[sev] || 0;
          const rowPct = (c / total) * 100;
          const st = RESIDUAL_ROW_STYLE[sev];
          return (
            <div key={sev} className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2.5">
              <div className="flex items-center justify-between gap-1.5 sm:w-24 sm:shrink-0 sm:justify-start">
                <span className={`text-xs font-bold sm:text-sm ${st.txt}`}>{sev}</span>
                <span className="text-xs font-bold tabular-nums text-slate-600 sm:hidden">{c}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/50 sm:h-3">
                  <div
                    className={`h-full rounded-r ${st.bar}`}
                    style={{ width: `${c > 0 ? Math.max(8, rowPct) : 0}%` }}
                  />
                </div>
              </div>
              <span className="hidden w-12 shrink-0 text-right text-sm font-bold tabular-nums text-slate-600 sm:inline">
                {c}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** 2×2 grid: equal row heights, cells stretch; cards fill each cell. */
const InternalAuditSummaryGrid = () => (
  <div
    className="grid h-full min-h-0 w-full min-w-0 auto-rows-auto grid-cols-1 content-start gap-3 sm:grid-cols-2 sm:grid-rows-2 sm:gap-3.5 sm:[align-content:stretch] sm:[grid-template-rows:minmax(0,1fr)_minmax(0,1fr)]"
  >
    <div className="flex h-full min-h-0 min-w-0 items-stretch">
      <AuditCoverageCard />
    </div>
    <div className="flex h-full min-h-0 min-w-0 items-stretch">
      <FindingRateCard />
    </div>
    <div className="flex h-full min-h-0 min-w-0 items-stretch">
      <OpenFindingsCard />
    </div>
    <div className="flex h-full min-h-0 min-w-0 items-stretch">
      <ResidualRiskCard />
    </div>
  </div>
);

/** Severity → lucide icon inside the circular status disc on each finding card. */
const severityIcon = (tone) =>
  (tone === 'critical' ? AlertCircle
    : tone === 'high' ? AlertTriangle
    : tone === 'medium' ? Info
    : CheckCircle2);

/**
 * Light-theme AI Audit Intelligence — complete finding feed:
 *   pill (severity) · bold title (issue) · recommendation.
 * Ends with a severity summary bar (Critical / High / Medium / Monitor).
 */
const AiAuditIntelligenceCard = ({ onDrillDown }) => (
  <section
    className={`rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4 ${AI_INTELLIGENCE_PANEL_H}`}
  >
    {/* Header — aligns with 650px reference: ✨ text-2xl, title text-lg, subtitle text-xs, Live text-xs */}
    <div className="mb-3 shrink-0 sm:mb-4">
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="shrink-0 select-none text-2xl leading-none" aria-hidden>
            ✨
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight text-slate-900 sm:text-lg">AI Audit Intelligence</h3>
            <p className="mt-0.5 text-xs leading-snug text-slate-500">
              {AUDIT_CYCLE.cycle} · {AUDIT_CYCLE.status}
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/90">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
    </div>

    <div
      className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg bg-slate-50/60 px-1.5 py-0.5 pr-1 [scrollbar-gutter:stable] [scrollbar-width:thin] sm:space-y-2.5 sm:px-2 sm:pr-1.5"
      style={{ scrollbarColor: 'rgb(203 213 225) transparent' }}
    >
      {AI_AUDIT_INTEL.findings.map((item) => {
        const st = AI_ALERT_CARD_STYLES[item.tone] || AI_ALERT_CARD_STYLES.low;
        const StatusIcon = severityIcon(item.tone);

        return (
          <button
            key={item.id}
            type="button"
            title={item.fullSolution}
            onClick={() => onDrillDown(item.domainId)}
            className={`group w-full cursor-pointer rounded-xl border bg-white p-2.5 text-left shadow-sm transition-[border-color,box-shadow,background-color] hover:bg-slate-50/80 sm:p-3 ${st.border}`}
          >
            <div className="flex gap-2.5 sm:gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${st.iconWrap}`}
                aria-hidden
              >
                <StatusIcon className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${st.pill}`}
                  >
                    {st.pillText}
                  </span>
                  <ChevronRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600"
                    aria-hidden
                  />
                </div>

                <h4 className="mt-1 text-sm font-semibold leading-snug tracking-tight text-slate-900 sm:font-bold">
                  {item.title}
                </h4>

                <div className="mt-2 w-full min-w-0 rounded-lg border border-slate-200/80 bg-slate-50/95 px-2.5 py-2 sm:px-3 sm:py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Recommended</p>
                  <p className="mt-1.5 text-left text-sm font-normal leading-relaxed text-slate-800">{item.solution}</p>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>

    <div className="mt-3 shrink-0 border-t border-slate-200/90 pt-3 sm:mt-4 sm:pt-4">
      <div className="grid grid-cols-4 items-end gap-1.5 text-center sm:gap-2">
        {AI_SEVERITY_SUMMARY.map((s) => (
          <div key={s.key} className="min-w-0">
            <div className={`text-2xl font-bold tabular-nums leading-none ${s.cls}`}>
              {AI_AUDIT_INTEL.severityCounts[s.key] ?? 0}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:font-medium sm:uppercase sm:tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================================================
// Small UI helpers
// ============================================================================

const StatusBadge = ({ status }) => {
  const map = {
    effective:        { bg: 'bg-emerald-50', fg: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Effective' },
    'needs-attention':{ bg: 'bg-amber-50',   fg: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Needs attention' },
    deficient:        { bg: 'bg-red-50',     fg: 'text-red-700',     ring: 'ring-red-200',     label: 'Deficient' },
  };
  const s = map[status] || map.effective;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${s.bg} ${s.fg} ring-1 ${s.ring}`}>
      {s.label}
    </span>
  );
};

const SeverityPill = ({ sev }) => {
  const map = {
    Critical: 'bg-red-50 text-red-700 ring-red-200',
    High:     'bg-orange-50 text-orange-700 ring-orange-200',
    Medium:   'bg-amber-50 text-amber-700 ring-amber-200',
    Low:      'bg-slate-50 text-slate-600 ring-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ring-1 ${map[sev] || map.Medium}`}>
      {sev}
    </span>
  );
};

const ComplianceCell = ({ v }) => (
  <span className={`font-semibold ${v >= 95 ? 'text-emerald-700' : v >= 90 ? 'text-amber-700' : 'text-red-700'}`}>
    {v}%
  </span>
);

// ============================================================================
// OVERVIEW — small building blocks (risk pills, KPI tile, section header)
// ============================================================================

const RiskPill = ({ level, className = '' }) => {
  const tone = RESIDUAL_RISK_TONE[level] || RESIDUAL_RISK_TONE.Low;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.ring} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
      {level}
    </span>
  );
};

/** Relative intensity vs other domains (risk heatmap cells). */
const domainRiskHeatTone = (value, max) => {
  const r = max > 0 ? value / max : 0;
  if (r >= 0.55) return 'bg-red-100 text-red-900 ring-red-200';
  if (r >= 0.28) return 'bg-amber-100 text-amber-900 ring-amber-200';
  return 'bg-slate-50 text-slate-700 ring-slate-200';
};

/** Pass rate: lower = hotter (audit concern). */
const domainPassHeatTone = (pct) => {
  if (pct >= 95) return 'bg-emerald-50 text-emerald-900 ring-emerald-200';
  if (pct >= 90) return 'bg-amber-50 text-amber-900 ring-amber-200';
  return 'bg-red-50 text-red-900 ring-red-200';
};

/** Info (i) — `title` tooltip; use span, not <button> (forbidden inside the domain card <button>). */
const DomainMetricHint = ({ text, className = '' }) => (
  <span
    className={`z-10 inline-flex cursor-default items-center justify-center rounded-sm p-0 leading-none text-current opacity-70 hover:opacity-100 hover:bg-slate-900/5 ${className}`}
    title={text}
    aria-label={text}
    onClick={(e) => e.stopPropagation()}
    onPointerDown={(e) => e.stopPropagation()}
  >
    <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
  </span>
);

/**
 * One domain risk metric: label (centred) + value; (i) sits flush top-right of the label row
 * so it reads as part of the heading, not floating in empty space.
 */
const DomainMetricTile = ({ toneCls, hint, label, value }) => (
  <div className={`relative min-w-0 rounded-md ring-1 px-0.5 py-0.5 ${toneCls}`}>
    <div className="relative pr-4 pt-px">
      <div className="px-0.5 text-center text-[11px] font-semibold leading-snug tracking-tight">
        {label}
      </div>
      <DomainMetricHint text={hint} className="absolute right-0 top-px" />
    </div>
    <div className="px-0.5 pb-px pt-0.5 text-center text-sm font-bold tabular-nums leading-none">
      {value}
    </div>
  </div>
);

// ============================================================================
// OVERVIEW TAB — Internal Audit Command Center
// ============================================================================

const OverviewTab = ({ onDrillDown }) => {
  const sortedDomains = useMemo(
    () => [...DOMAIN_AUDIT_VIEW].sort(
      (a, b) => (b.violations * 10 + b.overdueRemediation) - (a.violations * 10 + a.overdueRemediation)
    ),
    []
  );
  const heatMax = useMemo(
    () => ({
      violations: Math.max(1, ...sortedDomains.map((d) => d.violations)),
      evidenceGaps: Math.max(1, ...sortedDomains.map((d) => d.evidenceGaps)),
      overdue: Math.max(1, ...sortedDomains.map((d) => d.overdueRemediation)),
      repeat: Math.max(1, ...sortedDomains.map((d) => d.repeatFindings)),
    }),
    [sortedDomains]
  );
  return (
    <div className="space-y-6">
      <OverviewHeroRow
        summaryGrid={<InternalAuditSummaryGrid />}
        intelligencePanel={<AiAuditIntelligenceCard onDrillDown={onDrillDown} />}
      />

      {/* Audit domains — domain risk heatmap baked into each card (single surface, no duplicate table) */}
      <section className="bg-white ring-1 ring-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Audit domains</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Each card is a domain risk tile: shading compares this domain to the rest of the universe this cycle (darker = relatively worse). Click a card for the control library, SOP map, cases and evidence.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 shrink-0">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Residual risk</span>
            {['Critical', 'High', 'Medium', 'Low'].map((l) => (
              <span key={l} className="inline-flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${RESIDUAL_RISK_TONE[l].dot}`} />
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sortedDomains.map((d) => {
              const Icon = DOMAINS.find((x) => x.id === d.id)?.icon || Shield;
              const riskTone = RESIDUAL_RISK_TONE[d.residualRisk] || RESIDUAL_RISK_TONE.Low;
              const passCls = domainPassHeatTone(d.compliance);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onDrillDown(d.id)}
                  className={`rounded-lg ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-md transition-all text-left overflow-hidden bg-white border-t-4 ${
                    d.residualRisk === 'Critical' ? 'border-t-red-500'
                    : d.residualRisk === 'High' ? 'border-t-orange-500'
                    : d.residualRisk === 'Medium' ? 'border-t-amber-500'
                    : 'border-t-emerald-500'
                  } group`}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-black/5"
                        style={{ background: d.color + '22', color: d.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 leading-snug truncate">{d.domain}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate" title={d.owner}>{d.owner}</div>
                          </div>
                          <RiskPill level={d.residualRisk} className="shrink-0" />
                        </div>
                        <div className="mt-1.5 text-[10px] text-slate-500 leading-tight">
                          <span className="text-slate-700 font-medium">{d.controls}</span> in scope ·{' '}
                          <span className="text-slate-700 font-medium">{d.tested}/{d.controls}</span> tested
                          {d.notTested > 0 ? (
                            <span className="text-amber-800 font-semibold"> · {d.notTested} not tested</span>
                          ) : null}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0 mt-1" />
                    </div>

                    {/* Domain risk metrics — compact tile; (i) aligned to label row, larger type */}
                    <div className="mt-2 grid grid-cols-5 gap-0.5">
                      <DomainMetricTile
                        toneCls={passCls}
                        hint="% of in-scope cases that passed every control tested here. Tile colour vs other domains shows relative strength."
                        label="Pass rate"
                        value={`${d.compliance}%`}
                      />
                      <DomainMetricTile
                        toneCls={domainRiskHeatTone(d.violations, heatMax.violations)}
                        hint="Open findings rated critical: regulatory or policy breach still unresolved in this domain."
                        label="Critical"
                        value={d.violations}
                      />
                      <DomainMetricTile
                        toneCls={domainRiskHeatTone(d.evidenceGaps, heatMax.evidenceGaps)}
                        hint="Audit evidence gaps: missing or incomplete proof — conclusion on hold until the pack is complete or you record a limitation."
                        label="gaps"
                        value={d.evidenceGaps}
                      />
                      <DomainMetricTile
                        toneCls={domainRiskHeatTone(d.overdueRemediation, heatMax.overdue)}
                        hint="Remediation or management responses past the agreed due date (SLA breach)."
                        label="Overdue"
                        value={d.overdueRemediation}
                      />
                      <DomainMetricTile
                        toneCls={domainRiskHeatTone(d.repeatFindings, heatMax.repeat)}
                        hint="Findings that match or closely mirror a prior-cycle issue — check whether last remediation actually held."
                        label="Repeat"
                        value={d.repeatFindings}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-slate-600">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider">Conclusions</span>
                      <span className="text-emerald-800 font-semibold tabular-nums">{d.met} met</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-red-800 font-semibold tabular-nums">{d.notMet} not met</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-amber-800 font-semibold tabular-nums">{d.review} review</span>
                    </div>

                    <div className={`mt-2 rounded-md px-2.5 py-2 ${riskTone.bg} ring-1 ${riskTone.ring}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Sparkles className={`w-3 h-3 ${riskTone.text}`} />
                        <span className={`text-[9px] font-semibold uppercase tracking-wider ${riskTone.text}`}>AI focus</span>
                      </div>
                      <p className="text-[10px] text-slate-700 leading-snug">
                        {d.topIssue} <span className="text-slate-400">—</span>{' '}
                        <span className="font-medium text-slate-800">{d.action}</span>
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// SOP / PROCESS-FLOW VIEW — auditor-friendly stage-by-stage breakdown.
// Shows exactly which stage of the SOP missed which control.
// ============================================================================

/** Health helper: aggregate controls attached to a stage */
const aggregateStage = (stage, controls) => {
  const mapped = (stage.controlIds || [])
    .map((cid) => controls.find((c) => c.id === cid))
    .filter(Boolean);

  const total      = mapped.length;
  const violations = mapped.reduce((s, c) => s + c.violations, 0);
  const exceptions = mapped.reduce((s, c) => s + c.exceptions, 0);
  const compliance = total ? Number((mapped.reduce((s, c) => s + c.compliance, 0) / total).toFixed(1)) : 100;

  let health = 'ok';
  if (violations > 0 || compliance < 90) health = 'critical';
  else if (exceptions > 0 || compliance < 95) health = 'attention';

  return { mapped, total, violations, exceptions, compliance, health };
};

const StageHealthPill = ({ health }) => {
  const map = {
    ok:        { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Clean' },
    attention: { cls: 'bg-amber-50 text-amber-700 ring-amber-200',       label: 'Attention' },
    critical:  { cls: 'bg-red-50 text-red-700 ring-red-200',             label: 'Miss' },
  };
  const s = map[health] || map.ok;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ring-1 ${s.cls}`}>
      {s.label}
    </span>
  );
};

const SopProcessView = ({ sop, controls, onOpenEvidence, domainLabel }) => {
  const stageAgg = useMemo(
    () => sop.stages.map((s) => ({ ...s, ...aggregateStage(s, controls) })),
    [sop, controls]
  );
  const [expandedStageId, setExpandedStageId] = useState(null);

  const healthSoft = (h) => (h === 'critical' ? 'bg-red-50/60' : h === 'attention' ? 'bg-amber-50/60' : 'bg-emerald-50/60');

  const totalExceptions = stageAgg.reduce((s, st) => s + st.exceptions, 0);
  const totalViolations = stageAgg.reduce((s, st) => s + st.violations, 0);
  const missedStages    = stageAgg.filter((s) => s.health !== 'ok').length;

  return (
    <div className="space-y-5">
      {/* SOP header */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{sop.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">{sop.purpose}</p>
            </div>
          </div>
          <div className="flex gap-5 text-right text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">SOP stages</div>
              <div className="text-lg font-semibold text-slate-900">{sop.stages.length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-red-700 font-semibold">Stages w/ miss</div>
              <div className="text-lg font-semibold text-red-700">{missedStages}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Failed cases</div>
              <div className="text-lg font-semibold text-amber-700">{totalExceptions}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-red-700 font-semibold">Critical failures</div>
              <div className="text-lg font-semibold text-red-700">{totalViolations}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage-by-stage summary table */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Stage-by-stage compliance map</h4>
            <p className="text-xs text-slate-500 mt-0.5">Every SOP stage, its mapped controls, and the misses at that step.</p>
          </div>
            <span className="text-[11px] text-slate-500">Click a stage row to expand details inline</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 font-semibold w-10">#</th>
                <th className="px-3 py-2.5 font-semibold">Stage</th>
                <th className="px-3 py-2.5 font-semibold">Accountable owner</th>
                <th className="px-3 py-2.5 font-semibold">Mapped controls</th>
                <th className="px-3 py-2.5 font-semibold text-center">Pass rate</th>
                <th className="px-3 py-2.5 font-semibold text-center text-amber-700">Failed cases</th>
                <th className="px-3 py-2.5 font-semibold text-center text-red-700">Critical</th>
                <th className="px-3 py-2.5 font-semibold">Missed controls</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {stageAgg.map((st, idx) => {
                const missed = st.mapped.filter((c) => c.exceptions > 0 || c.violations > 0);
                const isOpen = expandedStageId === st.id;
                return (
                  <React.Fragment key={st.id}>
                    <tr
                      onClick={() => setExpandedStageId((id) => (id === st.id ? null : st.id))}
                      className={`border-b border-slate-100 cursor-pointer transition-colors ${isOpen ? 'bg-slate-100' : 'hover:bg-slate-50/70'}`}
                    >
                      <td className="px-4 py-2.5 text-xs text-slate-500 font-semibold align-top">{idx + 1}</td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-medium text-slate-900">{st.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 max-w-xs">{st.description}</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        {st.owner ? (
                          <div className="min-w-[160px]">
                            <div className="text-[11px] font-semibold text-slate-800 leading-tight">{st.owner.role}</div>
                            <div className="text-[10px] text-slate-500 leading-tight">{st.owner.team}</div>
                            <div className="text-[10px] text-slate-400 leading-tight mt-0.5 italic line-clamp-2 max-w-[200px]">{st.owner.submits}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="flex flex-wrap gap-1">
                          {st.mapped.map((c) => (
                            <span key={c.id}
                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${
                                    c.violations > 0 ? 'bg-red-50 text-red-700 ring-red-200'
                                    : c.exceptions > 0 ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                  }`}>
                              {c.id}
                            </span>
                          ))}
                          {st.total === 0 && <span className="text-[11px] text-slate-400">—</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center align-top"><ComplianceCell v={st.compliance} /></td>
                      <td className="px-3 py-2.5 text-center text-xs font-semibold text-amber-700 align-top">{st.exceptions}</td>
                      <td className="px-3 py-2.5 text-center text-xs font-semibold text-red-700 align-top">{st.violations}</td>
                      <td className="px-3 py-2.5 text-xs align-top">
                        {missed.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> None
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {missed.map((c) => (
                              <span key={c.id} className="text-slate-700">
                                <span className="font-mono text-[10px] font-semibold text-red-700">{c.id}</span>
                                <span className="text-slate-600"> — {c.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top"><StageHealthPill health={st.health} /></td>
                    </tr>
                    {isOpen && (
                      <tr className={`border-b border-slate-200 ${healthSoft(st.health)}`}>
                        <td colSpan={9} className="p-0 align-top">
                          <div className="px-4 sm:px-6 py-5 space-y-3">
                            {st.owner && (
                              <div className="bg-white ring-1 ring-slate-200 rounded-lg p-3 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                                  <UserRound className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 text-xs">
                                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Accountable submitter:</span>
                                  <span className="ml-2 font-semibold text-slate-900">{st.owner.role}</span>
                                  <span className="ml-2 text-slate-500">· {st.owner.team}</span>
                                  <div className="text-slate-600 mt-0.5">
                                    <span className="font-semibold text-slate-700">Submits: </span>{st.owner.submits}
                                  </div>
                                </div>
                              </div>
                            )}

                            {st.mapped.length === 0 ? (
                              <div className="text-sm text-slate-500 italic flex items-center gap-2 bg-white ring-1 ring-slate-200 px-3 py-2 rounded-lg">
                                <Info className="w-4 h-4" /> No controls mapped to this stage.
                              </div>
                            ) : (
                              st.mapped.map((c) => {
                                const hasMiss = c.exceptions > 0 || c.violations > 0;
                                const accent = c.violations > 0
                                  ? 'border-l-red-500'
                                  : c.exceptions > 0
                                  ? 'border-l-amber-500'
                                  : 'border-l-emerald-500';
                                return (
                                  <div
                                    key={c.id}
                                    className={`bg-white ring-1 ring-slate-200 rounded-lg border-l-4 ${accent} p-4`}
                                  >
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="font-mono text-xs font-semibold text-slate-700">{c.id}</span>
                                      <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                                      <StatusBadge status={c.status} />
                                      {hasMiss && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 ring-1 ring-red-200 rounded px-1.5 py-0.5">
                                          <AlertTriangle className="w-3 h-3 shrink-0" /> Miss at stage
                                        </span>
                                      )}
                                      <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                                        <Gavel className="w-3 h-3" /> {c.regulatory}
                                      </span>
                                    </div>

                                    <div className="mt-2 rounded-md bg-slate-50 ring-1 ring-slate-200 p-3">
                                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                        {hasMiss ? 'Why this is a miss' : 'Auditor note'}
                                      </div>
                                      <p className="text-[13px] text-slate-800 leading-relaxed">
                                        {getAuditorFocusForControl(c)}
                                      </p>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap text-[11px] text-slate-600">
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <span>Sampled <span className="font-semibold text-slate-800 tabular-nums">{c.population.toLocaleString('en-IN')}</span></span>
                                        <span className="text-emerald-700 font-semibold tabular-nums">{(c.population - c.exceptions).toLocaleString('en-IN')} passed</span>
                                        <span className="text-amber-700 font-semibold tabular-nums">{c.exceptions} failed</span>
                                        <span className="text-red-700 font-semibold tabular-nums">{c.violations} critical</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => onOpenEvidence(c, domainLabel)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white ring-1 ring-slate-300 hover:bg-slate-900 hover:text-white hover:ring-slate-900 rounded-md px-3 py-1.5 transition-colors"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> Evidence
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CASES — EVIDENCE TRAIL VIEW
// Shows every case flowing through the SOP with a stage-by-stage trail of:
//   - Who submitted the evidence at each stage (role + team + named officer)
//   - What was submitted (files, timestamps, source system)
//   - Which controls passed / failed / are pending at that stage
// This is how the auditor satisfies "all controls cleared across all submitters"
// ============================================================================

const statusChipMap = {
  accepted: { bg: 'bg-emerald-50', fg: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Evidence accepted',  icon: CheckCircle2 },
  rejected: { bg: 'bg-red-50',     fg: 'text-red-700',     ring: 'ring-red-200',     label: 'Failed — rejected', icon: XCircle },
  pending:  { bg: 'bg-amber-50',   fg: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Evidence pending',  icon: Clock },
  blocked:  { bg: 'bg-slate-50',   fg: 'text-slate-500',   ring: 'ring-slate-200',   label: 'Blocked — upstream',icon: MinusCircle },
};

const StageStatusChip = ({ status }) => {
  const s = statusChipMap[status] || statusChipMap.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${s.bg} ${s.fg} ring-1 ${s.ring}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
};

const Avatar = ({ name }) => {
  if (!name) return (
    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center ring-1 ring-slate-200">
      <UserRound className="w-3.5 h-3.5" />
    </div>
  );
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white text-[10px] font-semibold flex items-center justify-center ring-1 ring-slate-300">
      {initials}
    </div>
  );
};

/** Matrix audit outcome: Compliant | Exception (incl. pending / soft findings) | Critical */
const getJourneyAuditCategory = (kase) => {
  if (kase.overallStatus === 'failure') return 'critical';
  if (kase.overallStatus === 'pending') return 'exception';
  if (kase.journeyException) return 'exception';
  return 'compliant';
};

const getJourneyExceptionCellText = (kase) => {
  if (kase.journeyException) return kase.journeyException;
  if (kase.overallStatus === 'compliant') return '—';
  const fs = kase.trail.find((t) => t.status === 'rejected' || t.status === 'pending');
  if (!fs) return '—';
  const hint = CONTROL_EXCEPTION_LABEL[kase.failControlId] || kase.failControlId || 'Deviation';
  if (fs.status === 'pending') return `Awaiting: ${hint}`;
  return hint;
};

/** One cell in the journey matrix — matches dashboard reference styling */
const JourneyStageCell = ({ status, stageName }) => {
  const title = `${stageName} — ${status}`;
  if (status === 'accepted') {
    return (
      <div title={title} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 ring-1 ring-emerald-200">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2.25} />
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div title={title} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-50 ring-1 ring-red-200">
        <XCircle className="h-4 w-4 text-red-600" strokeWidth={2.25} />
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div title={`${title} (in review)`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 ring-1 ring-sky-200">
        <span className="text-[11px] font-bold text-sky-700">R</span>
      </div>
    );
  }
  return (
    <div title={title} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 ring-1 ring-slate-200">
      <MinusCircle className="h-4 w-4 text-slate-400" strokeWidth={2} />
    </div>
  );
};

const JourneyAuditPill = ({ category }) => {
  const map = {
    compliant: { cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200', label: 'Compliant' },
    exception: { cls: 'bg-amber-50 text-amber-900 ring-amber-200',       label: 'Exception' },
    critical:  { cls: 'bg-red-50 text-red-800 ring-red-200',            label: 'Critical' },
  };
  const m = map[category] || map.compliant;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${m.cls}`}>
      {m.label}
    </span>
  );
};

const CasesView = ({ domainId, sop, cases, entity, domainLabel, onOpenEvidence, controls }) => {
  const [expanded, setExpanded] = useState({});
  const controlsById = Object.fromEntries(controls.map((c) => [c.id, c]));
  const journeyTitle = JOURNEY_TITLE_BY_DOMAIN[domainId] || JOURNEY_TITLE_BY_DOMAIN.customer;
  const stageColSpan = 3 + (sop?.stages?.length || 0);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-4">

      {/* Journey matrix — stage-wise control compliance (same pattern for every domain) */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 bg-slate-100/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" aria-hidden />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.06em] text-indigo-950 md:text-xs">
              {journeyTitle}
            </h3>
          </div>
          <p className="mt-1 pl-4 text-[11px] leading-relaxed text-slate-600">
            Each column is an SOP stage. <span className="font-semibold text-slate-700">Green</span> = passed, <span className="font-semibold text-red-700">Red</span> = failed, <span className="font-semibold text-sky-700">R</span> = in review / pending, <span className="font-semibold text-slate-500">Grey</span> = blocked. Click a row to expand the full evidence trail (who submitted what).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <th className="whitespace-nowrap px-3 py-2.5 pl-4">{entity.singular}</th>
                {sop.stages.map((st) => (
                  <th key={st.id} className="px-1 py-2.5 text-center font-semibold" title={st.name}>
                    {getJourneyStageHeader(domainId, st)}
                  </th>
                ))}
                <th className="min-w-[120px] px-2 py-2.5">Exception</th>
                <th className="whitespace-nowrap px-3 py-2.5 pr-4 text-center">Audit status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
          {cases.map((kase) => {
            const isOpen = !!expanded[kase.id];
            const auditCat = getJourneyAuditCategory(kase);
            const excText = getJourneyExceptionCellText(kase);
            const excBadge = auditCat !== 'compliant' && excText !== '—';

            return (
              <React.Fragment key={kase.id}>
                <tr
                  onClick={() => toggle(kase.id)}
                  className="cursor-pointer bg-white transition-colors hover:bg-slate-50/80"
                >
                  <td className="max-w-[220px] px-3 py-2.5 pl-4 align-middle">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-slate-400">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold leading-snug text-slate-900">{kase.subject}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-slate-500">{kase.id}</div>
                        <div className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{kase.segment}</div>
                      </div>
                    </div>
                  </td>
                  {kase.trail.map((t) => (
                    <td key={t.stage.id} className="px-1 py-2 text-center align-middle">
                      <JourneyStageCell status={t.status} stageName={t.stage.name} />
                    </td>
                  ))}
                  <td className="px-2 py-2 align-middle">
                    {excBadge ? (
                      <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200">
                        {excText}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 pr-4 text-center align-middle">
                    <JourneyAuditPill category={auditCat} />
                  </td>
                </tr>

                {/* Expanded stage-by-stage trail */}
                {isOpen && (
                  <tr className="bg-slate-50/90">
                    <td colSpan={stageColSpan} className="border-t border-slate-100 px-4 py-4">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
                      Full submission trail · {kase.trail.length} stages · each submitted by the accountable role
                    </div>

                    <ol className="space-y-3 relative">
                      {kase.trail.map((item, idx) => {
                        const isLast = idx === kase.trail.length - 1;
                        const stageCtrlIds = item.stage.controlIds;
                        const statusRingMap = {
                          accepted: 'ring-emerald-200 bg-white',
                          rejected: 'ring-red-300 bg-red-50/30',
                          pending:  'ring-amber-300 bg-amber-50/30',
                          blocked:  'ring-slate-200 bg-slate-50/60',
                        };

                        return (
                          <li key={idx} className="relative pl-8">
                            {/* Timeline spine */}
                            {!isLast && <div className="absolute left-[11px] top-7 bottom-[-12px] w-px bg-slate-200" />}
                            {/* Stage index bubble */}
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ${
                              item.status === 'accepted' ? 'bg-emerald-500 text-white ring-emerald-100' :
                              item.status === 'rejected' ? 'bg-red-500 text-white ring-red-100' :
                              item.status === 'pending'  ? 'bg-amber-500 text-white ring-amber-100' :
                                                            'bg-slate-300 text-white ring-slate-100'
                            }`}>
                              {idx + 1}
                            </div>

                            <div className={`rounded-lg ring-1 p-4 ${statusRingMap[item.status]}`}>
                              {/* Stage header */}
                              <div className="flex items-start justify-between flex-wrap gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-slate-900">Stage {idx + 1} · {item.stage.name}</span>
                                    <StageStatusChip status={item.status} />
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-1">{item.stage.description}</p>
                                </div>

                                {/* Submitter */}
                                <div className="flex items-center gap-2 bg-white rounded-md ring-1 ring-slate-200 px-3 py-2">
                                  <Avatar name={item.submittedBy?.name} />
                                  <div className="text-right">
                                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                                      {item.submittedBy?.name || 'Not yet submitted'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-tight">
                                      {item.stage.owner.role} · {item.stage.owner.team}
                                    </div>
                                    {item.submittedBy && (
                                      <div className="text-[10px] text-slate-400 leading-tight font-mono mt-0.5">
                                        {item.submittedBy.empId} · {item.submittedBy.location}
                                      </div>
                                    )}
                                    {item.submittedAt && (
                                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        <CalendarClock className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
                                        {item.submittedAt}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* What should be submitted */}
                              <div className="mt-3 text-[11px] text-slate-500">
                                <span className="font-semibold text-slate-600">Accountable to submit: </span>
                                {item.stage.owner.submits}
                              </div>

                              {/* Evidence items */}
                              {item.evidenceItems.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                                    Evidence submitted ({item.evidenceItems.length})
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                    {item.evidenceItems.map((ev, i) => (
                                      <div key={i} className="flex items-center justify-between bg-white ring-1 ring-slate-200 rounded px-2.5 py-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                          <div className="min-w-0">
                                            <div className="text-[11px] text-slate-800 font-medium truncate">{ev.name}</div>
                                            <div className="text-[10px] text-slate-500 truncate">{ev.system}</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <span className="text-[10px] uppercase text-slate-500">{ev.type}</span>
                                          <span className="text-[10px] text-slate-400">{ev.size}</span>
                                          <Download className="w-3 h-3 text-slate-400" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {item.evidenceItems.length === 0 && (
                                <div className="mt-3 text-[11px] text-slate-500 bg-slate-100 rounded px-3 py-2">
                                  No evidence expected yet — this stage is blocked until the upstream stage is resolved.
                                </div>
                              )}

                              {/* Controls fired at this stage */}
                              <div className="mt-3">
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                                  Controls at this stage ({stageCtrlIds.length})
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {stageCtrlIds.map((cid) => {
                                    const ctrl = controlsById[cid];
                                    const result = item.controlResults[cid] || 'not-started';
                                    const colors = {
                                      pass:         'bg-emerald-50 text-emerald-700 ring-emerald-200',
                                      fail:         'bg-red-50 text-red-700 ring-red-200',
                                      pending:      'bg-amber-50 text-amber-700 ring-amber-200',
                                      'not-started':'bg-slate-50 text-slate-500 ring-slate-200',
                                    };
                                    const resultIcon = {
                                      pass: <CheckCircle2 className="w-3 h-3" />,
                                      fail: <XCircle className="w-3 h-3" />,
                                      pending: <Clock className="w-3 h-3" />,
                                      'not-started': <MinusCircle className="w-3 h-3" />,
                                    }[result];
                                    return (
                                      <button
                                        key={cid}
                                        onClick={(e) => { e.stopPropagation(); if (ctrl) onOpenEvidence(ctrl, domainLabel); }}
                                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium ring-1 hover:shadow-sm transition ${colors[result]}`}
                                        title={ctrl?.name}
                                      >
                                        {resultIcon}
                                        <span className="font-mono">{cid}</span>
                                        <span className="hidden md:inline truncate max-w-[140px]">{ctrl?.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Auditor note on rejection / pending */}
                              {item.status === 'rejected' && (
                                <div className="mt-3 bg-red-50 ring-1 ring-red-200 rounded p-2 text-[11px] text-red-800">
                                  <div className="font-semibold mb-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Auditor observation</div>
                                  Evidence did not satisfy control <span className="font-mono font-semibold">{kase.failControlId}</span>. Owner informed; corrective action required before stage can be re-submitted.
                                </div>
                              )}
                              {item.status === 'pending' && (
                                <div className="mt-3 bg-amber-50 ring-1 ring-amber-200 rounded p-2 text-[11px] text-amber-800">
                                  <div className="font-semibold mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Awaiting submission</div>
                                  Accountable owner has not yet submitted required evidence for this stage. SLA breach trigger.
                                </div>
                              )}
                              {item.status === 'blocked' && (
                                <div className="mt-3 bg-slate-100 ring-1 ring-slate-200 rounded p-2 text-[11px] text-slate-600">
                                  <div className="font-semibold mb-0.5 flex items-center gap-1"><MinusCircle className="w-3 h-3" /> Blocked</div>
                                  Cannot begin until the upstream stage is resolved.
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>

                    {/* Auditor footer */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[11px] text-slate-500">
                        <UserCheck className="w-3 h-3 inline -mt-0.5 mr-1" />
                        Auditor verdict: {kase.overallStatus === 'compliant' ? 'Case fully satisfies all controls across all submitters.' : kase.overallStatus === 'failure' ? 'Case contains control failure requiring remediation before closure.' : 'Case cannot be closed — evidence submission pending from accountable owner.'}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-[11px] font-medium text-slate-700 bg-white ring-1 ring-slate-300 hover:bg-slate-100 rounded-md px-2.5 py-1 inline-flex items-center gap-1">
                          <Download className="w-3 h-3" /> Download case pack
                        </button>
                        <button className="text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md px-2.5 py-1 inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Mark as reviewed
                        </button>
                      </div>
                    </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {cases.length === 0 && (
            <tr>
              <td colSpan={stageColSpan} className="py-10 text-center text-sm text-slate-500">
                No cases configured for this domain yet.
              </td>
            </tr>
          )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DOMAIN TAB — lists ALL controls for the selected domain
// ============================================================================

const DomainTab = ({ domainId, onOpenEvidence }) => {
  const domain = DOMAINS.find((d) => d.id === domainId);
  const controls = CONTROLS_BY_DOMAIN[domainId] || [];
  const sop = SOP_BY_DOMAIN[domainId];
  const cases = CASES_BY_DOMAIN[domainId] || [];
  const entity = CASE_ENTITY[domainId] || { singular: 'Case', plural: 'Cases', entity: 'case' };
  const [view, setView] = useState('sop'); // 'sop' | 'register' | 'cases'
  const [filter, setFilter] = useState('all'); // all | effective | needs-attention | deficient
  const [query, setQuery]   = useState('');

  const filtered = useMemo(() => {
    return controls.filter((c) => {
      const matchStatus = filter === 'all' || c.status === filter;
      const q = query.trim().toLowerCase();
      const matchQ = !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.regulatory || '').toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [controls, filter, query]);

  const totals = useMemo(
    () => ({
      count:       controls.length,
      effective:   controls.filter((c) => c.status === 'effective').length,
      needsAtt:    controls.filter((c) => c.status === 'needs-attention').length,
      deficient:   controls.filter((c) => c.status === 'deficient').length,
    }),
    [controls],
  );

  return (
    <div className="space-y-5">
      {/* View toggle: Process flow / Control register / Cases */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 p-1.5 inline-flex items-center gap-1">
        <button
          onClick={() => setView('sop')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
            view === 'sop' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Workflow className="w-4 h-4" /> Process flow
        </button>
        <button
          onClick={() => setView('cases')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
            view === 'cases' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserRound className="w-4 h-4" /> {entity.plural} — Journey matrix
        </button>
        <button
          onClick={() => setView('register')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
            view === 'register' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ListChecks className="w-4 h-4" /> Control register
        </button>
      </div>

      {/* ===== CASES — EVIDENCE TRAIL VIEW ===== */}
      {view === 'cases' && (
        sop
          ? <CasesView domainId={domainId} sop={sop} cases={cases} entity={entity} domainLabel={domain.label} onOpenEvidence={onOpenEvidence} controls={controls} />
          : (
            <div className="bg-white rounded-lg ring-1 ring-slate-200 p-10 text-center text-sm text-slate-500">
              <MinusCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              Case data is not defined for this domain yet.
            </div>
          )
      )}

      {/* ===== SOP / PROCESS-FLOW VIEW ===== */}
      {view === 'sop' && (
        sop
          ? <SopProcessView sop={sop} controls={controls} onOpenEvidence={onOpenEvidence} domainLabel={domain.label} />
          : (
            <div className="bg-white rounded-lg ring-1 ring-slate-200 p-10 text-center text-sm text-slate-500">
              <MinusCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              SOP map is not defined for this domain yet.
            </div>
          )
      )}

      {/* ===== CONTROL REGISTER VIEW ===== */}
      {view === 'register' && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Control-level compliance</h3>
          <p className="text-xs text-slate-500 mb-4">Each bar is one control. Click the row below to see its evidence.</p>
          <div style={{ height: Math.max(280, controls.length * 34) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={controls} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[75, 100]} fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="id" fontSize={11} stroke="#64748b" width={60} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v}%`, 'Compliance']}
                  labelFormatter={(l) => controls.find((c) => c.id === l)?.name || l}
                />
                <Bar dataKey="compliance" radius={[0, 4, 4, 0]}>
                  {controls.map((p, i) => (
                    <Cell key={i} fill={p.compliance >= 95 ? '#10b981' : p.compliance >= 90 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg ring-1 ring-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Violations vs exceptions</h3>
          <p className="text-xs text-slate-500 mb-3">Per control in this domain</p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={controls} margin={{ top: 8, right: 8, left: -16, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="id" fontSize={10} stroke="#64748b" angle={-30} textAnchor="end" interval={0} height={48} />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="violations" stackId="a" fill="#ef4444" name="Violations" />
                <Bar dataKey="exceptions" stackId="a" fill="#f59e0b" name="Exceptions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-50 rounded-md px-3 py-1.5 text-sm w-80 ring-1 ring-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search control ID, name or regulation…"
            className="bg-transparent border-0 focus:outline-none text-slate-700 placeholder-slate-400 text-sm flex-1"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { k: 'all',              label: `All (${totals.count})`,             cls: 'bg-slate-900 text-white' },
            { k: 'effective',        label: `Effective (${totals.effective})`,   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
            { k: 'needs-attention',  label: `Needs attention (${totals.needsAtt})`, cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
            { k: 'deficient',        label: `Deficient (${totals.deficient})`,   cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
          ].map((b) => (
            <button key={b.k}
              onClick={() => setFilter(b.k)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filter === b.k ? b.cls : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> / {totals.count} controls
        </div>
      </div>

      {/* FULL CONTROLS TABLE — every control shown, evidence behind a button */}
      <div className="bg-white rounded-lg ring-1 ring-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Control</th>
                <th className="px-3 py-3 font-semibold">Owner</th>
                <th className="px-3 py-3 font-semibold">Frequency</th>
                <th className="px-3 py-3 font-semibold text-right" title="Total cases that must satisfy this control this quarter">Cases in scope</th>
                <th className="px-3 py-3 font-semibold text-right text-emerald-700" title="Cases where control passed with accepted evidence">Passed</th>
                <th className="px-3 py-3 font-semibold text-center text-amber-700" title="Cases where control did not pass — needs remediation">Failed</th>
                <th className="px-3 py-3 font-semibold text-center text-red-700" title="Subset of failed cases that breach a regulation / policy">Critical</th>
                <th className="px-3 py-3 font-semibold text-center" title="% of in-scope cases that passed this control">Pass rate</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold text-right">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const passed = c.population - c.exceptions;
                return (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="font-mono text-[11px] text-slate-500">{c.id}</div>
                    <div className="font-medium text-slate-900 leading-snug">{c.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-start gap-1">
                      <Gavel className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{c.regulatory}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700 align-top">{c.owner}</td>
                  <td className="px-3 py-3 text-xs text-slate-700 align-top">{c.frequency}</td>
                  <td className="px-3 py-3 text-right text-xs text-slate-700 align-top">{c.population.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right text-xs font-semibold text-emerald-700 align-top">{passed.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-center text-xs font-semibold text-amber-700 align-top">{c.exceptions}</td>
                  <td className="px-3 py-3 text-center text-xs font-semibold text-red-700 align-top">{c.violations}</td>
                  <td className="px-3 py-3 text-center align-top"><ComplianceCell v={c.compliance} /></td>
                  <td className="px-3 py-3 align-top"><StatusBadge status={c.status} /></td>
                  <td className="px-3 py-3 text-right align-top">
                    <button
                      onClick={() => onOpenEvidence(c, domain.label)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-900 hover:text-white hover:ring-slate-900 rounded-md px-2.5 py-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View evidence
                    </button>
                  </td>
                </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-sm text-slate-500">
                    No controls match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

// ============================================================================
// EVIDENCE DRAWER — opens only on demand
// ============================================================================

const EvidenceDrawer = ({ open, evidence, onClose }) => {
  if (!open || !evidence) return null;
  const {
    control: c, domainLabel, lastTested, tester, testingSteps, exceptionLog,
    sourceSystems, documents, auditorNote, mgmtResponse,
    stageSubmitters = [], sampleCaseTrails = [],
  } = evidence;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />

      <aside className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{domainLabel}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-[11px] text-slate-600">{c.id}</span>
                <StatusBadge status={c.status} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 leading-snug">{c.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.objective}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-50 rounded p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold" title="% of in-scope cases that passed this control">Pass rate</div>
              <div className="text-base font-semibold text-slate-900"><ComplianceCell v={c.compliance} /></div>
              <div className="text-[10px] text-slate-500 mt-0.5">across all cases</div>
            </div>
            <div className="bg-slate-50 rounded p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold" title="Total cases that had to satisfy this control">Cases in scope</div>
              <div className="text-base font-semibold text-slate-900">{c.population.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">this quarter</div>
            </div>
            <div className="bg-slate-50 rounded p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold" title="Cases where control passed with accepted evidence">Passed</div>
              <div className="text-base font-semibold text-emerald-700">{(c.population - c.exceptions).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">all evidence accepted</div>
            </div>
            <div className="bg-slate-50 rounded p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold" title="Cases needing remediation — of which critical failures breach regulation">Failed cases</div>
              <div className="text-base font-semibold text-amber-700">
                {c.exceptions} <span className="text-[10px] font-medium text-red-700">({c.violations} critical)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">need remediation</div>
            </div>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Control metadata */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Control metadata</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-500">Owner: </span><span className="font-medium text-slate-800">{c.owner}</span></div>
              <div><span className="text-slate-500">Frequency: </span><span className="font-medium text-slate-800">{c.frequency}</span></div>
              <div className="col-span-2"><span className="text-slate-500">Regulatory reference: </span><span className="font-medium text-slate-800">{c.regulatory}</span></div>
              <div><span className="text-slate-500">Last tested: </span><span className="font-medium text-slate-800">{lastTested}</span></div>
              <div><span className="text-slate-500">Tester: </span><span className="font-medium text-slate-800">{tester}</span></div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* Who is accountable to submit evidence (per SOP stage)       */}
          {/* ========================================================== */}
          {stageSubmitters.length > 0 && (
            <section>
              <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                <UserRound className="w-3.5 h-3.5" /> Accountable evidence submitters
              </h4>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                This control fires at {stageSubmitters.length} SOP stage{stageSubmitters.length > 1 ? 's' : ''}. At each stage the role below is accountable to submit the evidence. For a case to pass this control, <span className="font-semibold text-slate-700">every one</span> of these submitters must have provided accepted evidence.
              </p>
              <div className="space-y-2">
                {stageSubmitters.map(({ sopName, stage }, i) => (
                  <div key={i} className="rounded-md ring-1 ring-slate-200 p-3 bg-white">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{sopName}</div>
                        <div className="text-xs font-semibold text-slate-900 mt-0.5">Stage: {stage.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-900">{stage.owner.role}</div>
                        <div className="text-[11px] text-slate-500">{stage.owner.team}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1.5">
                      <span className="font-semibold text-slate-700">Submits: </span>{stage.owner.submits}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================== */}
          {/* Sample case trails — show a few actual cases + who submitted */}
          {/* ========================================================== */}
          {sampleCaseTrails.length > 0 && (
            <section>
              <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" /> Sample case evidence trails ({sampleCaseTrails.length})
              </h4>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Representative cases showing the stage where this control fired, the person who submitted evidence, and the result for this specific control on that case.
              </p>
              <div className="space-y-2">
                {sampleCaseTrails.map(({ kase, hit }, i) => {
                  const result = hit.controlResults[c.id] || 'not-started';
                  const resMap = {
                    pass:   { bg: 'bg-emerald-50', fg: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Passed',  icon: CheckCircle2 },
                    fail:   { bg: 'bg-red-50',     fg: 'text-red-700',     ring: 'ring-red-200',     label: 'Failed',  icon: XCircle },
                    pending:{ bg: 'bg-amber-50',   fg: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Pending', icon: Clock },
                    'not-started': { bg: 'bg-slate-50', fg: 'text-slate-500', ring: 'ring-slate-200', label: 'Not yet', icon: MinusCircle },
                  };
                  const r = resMap[result];
                  const ResIcon = r.icon;
                  return (
                    <div key={i} className={`rounded-md ring-1 p-3 ${r.ring} ${r.bg}`}>
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] text-slate-600">{kase.id}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-xs font-semibold text-slate-900">{kase.subject}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{kase.segment} · Opened {kase.opened}</div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            <span className="font-semibold">Fired at: </span>Stage — {hit.stage.name}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold ${r.fg} bg-white ring-1 ${r.ring}`}>
                          <ResIcon className="w-3 h-3" /> {r.label}
                        </span>
                      </div>

                      {/* Submitter */}
                      <div className="mt-2 flex items-center gap-2 bg-white rounded ring-1 ring-slate-200 px-2 py-1.5">
                        <Avatar name={hit.submittedBy?.name} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-slate-900 truncate">
                            {hit.submittedBy?.name || 'Not yet submitted'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {hit.stage.owner.role} · {hit.stage.owner.team}
                          </div>
                          {hit.submittedBy && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {hit.submittedBy.empId} · {hit.submittedAt || '—'}
                            </div>
                          )}
                        </div>
                        {hit.evidenceItems?.length > 0 && (
                          <div className="text-[10px] text-slate-500 text-right whitespace-nowrap">
                            <FileText className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                            {hit.evidenceItems.length} file{hit.evidenceItems.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Testing procedure */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" /> Testing procedure performed
            </h4>
            <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
              {testingSteps.map((s, i) => <li key={i} className="leading-relaxed">{s}</li>)}
            </ol>
          </section>

          {/* Exception log */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Exception log ({c.exceptions})
            </h4>
            <div className="rounded-md ring-1 ring-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2 font-semibold">Ref</th>
                    <th className="px-3 py-2 font-semibold">Detail</th>
                    <th className="px-3 py-2 font-semibold">Severity</th>
                    <th className="px-3 py-2 font-semibold">SLA</th>
                    <th className="px-3 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptionLog.map((e) => (
                    <tr key={e.ref} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{e.ref}</td>
                      <td className="px-3 py-2 text-slate-700">{e.detail}</td>
                      <td className="px-3 py-2"><SeverityPill sev={e.severity} /></td>
                      <td className="px-3 py-2">
                        <span className={e.sla === 'Breached' ? 'text-red-700 font-medium' : 'text-emerald-700 font-medium'}>{e.sla}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{e.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Source systems */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Source systems & data pulled
            </h4>
            <div className="space-y-1.5">
              {sourceSystems.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="text-slate-500"> — {s.record}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Documents */}
          <section>
            <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <FolderSearch className="w-3.5 h-3.5" /> Workpapers & supporting documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documents.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-md ring-1 ring-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-xs text-slate-800 font-medium truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] uppercase text-slate-500">{d.type}</span>
                    <span className="text-[10px] text-slate-400">{d.size}</span>
                    <button className="text-slate-500 hover:text-slate-900"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Auditor note + management response */}
          <section className="grid grid-cols-1 gap-3">
            <div className="rounded-md ring-1 ring-slate-200 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Auditor conclusion</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{auditorNote}</p>
            </div>
            <div className="rounded-md ring-1 ring-slate-200 p-3 bg-slate-50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Management response</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{mgmtResponse}</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Evidence schema v1.0 · Locked workpaper · Reviewed by CAE
          </div>
          <div className="flex gap-2">
            <button className="text-xs text-slate-700 bg-white ring-1 ring-slate-300 hover:bg-slate-100 rounded-md px-3 py-1.5 inline-flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download pack
            </button>
            <button onClick={onClose} className="text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-md px-3 py-1.5">
              Close
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BankingAuditDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [drawer, setDrawer] = useState({ open: false, evidence: null });
  const [domainsRailOpen, setDomainsRailOpen] = useState(false);

  const openEvidence = (control, domainLabel) =>
    setDrawer({ open: true, evidence: buildEvidence(control, domainLabel) });
  const closeEvidence = () => setDrawer({ open: false, evidence: null });

  return (
    <div
      className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-slate-100"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif' }}
    >
      {/* Top bar */}
      <header className="z-30 shrink-0 bg-slate-900 text-white">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Internal audit</div>
              <div className="text-[11px] text-slate-400 leading-tight">Banking Internal Audit · Control Intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <div className="text-xs font-medium">Audit Lead</div>
                <div className="text-[10px] text-slate-400">Q1 FY26 · Closing review</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold">AL</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        {/* Domains — fixed-height rail (viewport minus header); only nav scrolls if needed */}
        <aside
          onMouseEnter={() => setDomainsRailOpen(true)}
          onMouseLeave={() => setDomainsRailOpen(false)}
          className={`flex min-h-0 shrink-0 flex-col border-r border-slate-200 bg-white shadow-[1px_0_0_rgba(15,23,42,0.04)] transition-[width] duration-200 ease-out ${
            domainsRailOpen ? 'w-56' : 'w-14'
          }`}
          aria-label="Domains"
        >
          <div className="px-2 py-3 border-b border-slate-100 flex items-center min-h-[44px] justify-center overflow-hidden">
            {domainsRailOpen ? (
              <div className="w-full pl-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Domains</div>
              </div>
            ) : (
              <ListChecks className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
            )}
          </div>
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5 space-y-0.5">
            {DOMAINS.map((d) => {
              const Icon = d.icon;
              const isActive = activeTab === d.id;
              const count = d.id === 'overview' ? null : (CONTROLS_BY_DOMAIN[d.id] || []).length;
              return (
                <button
                  key={d.id}
                  type="button"
                  title={d.label}
                  onClick={() => setActiveTab(d.id)}
                  className={`flex w-full items-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                    domainsRailOpen ? 'justify-start px-2' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : ''}`} style={!isActive ? { color: d.color } : undefined} />
                  {domainsRailOpen && (
                    <>
                      <span className="flex-1 text-left truncate text-[13px] leading-tight">{d.label}</span>
                      {count !== null && (
                        <span
                          className={`shrink-0 text-[10px] font-semibold tabular-nums rounded px-1.5 py-0.5 ${
                            isActive ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Body — sole vertical scroll region so header + domain rail stay fixed */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto">
          <div className="mx-auto max-w-[1600px] px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {DOMAINS.find((d) => d.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {activeTab === 'overview'
                    ? `Cross-domain compliance posture across ${TOTAL_CONTROLS} controls and 10 auditor domains`
                    : `All controls in scope · regulatory references · evidence on demand`}
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

            {activeTab === 'overview'
              ? <OverviewTab onDrillDown={(id) => setActiveTab(id)} />
              : <DomainTab domainId={activeTab} onOpenEvidence={openEvidence} />}
          </div>
        </main>
      </div>

      <EvidenceDrawer open={drawer.open} evidence={drawer.evidence} onClose={closeEvidence} />
    </div>
  );
}

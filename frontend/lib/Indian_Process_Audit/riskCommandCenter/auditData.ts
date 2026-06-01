// Mock data for the V3 journey command center (CXO / CRO view).
// Aggregated stage funnels + actionable cases only — no per-entity flood.

import type { RccCase, RccDomain, RccJourneyStepStatus, RccStage } from './types';

type StageDef = [string, string, number?, number?];
// ---------------------------------------------------------------------------
// DESIGN NOTE: This data is intentionally *aggregated*. We never ship a row
// per entity (that is the data-flood the redesign removes). Each domain ships:
//   - headline counts (the only source of truth for the KPI ribbon)
//   - a stage funnel (drives the hero plot)
//   - a SHORT list of only the actionable cases (Critical / Exception / Review)
//     for drill-down. "Completed" cases are counted, never enumerated.
// ---------------------------------------------------------------------------

export const meta = {
  product: 'Indian process audit',
  subtitle: 'RCSA · control testing · incidents & RCA · KRI · regulatory readiness',
  title: 'Executive Risk Posture Cockpit',
  period: 'Q1 FY26 · Closing review',
  asOf: '2 May 2026, 05:15 IST',
  personas: ['CRO / MD&CEO', 'CFO', 'CCO / MLRO', 'CISO'],
  user: 'Chief Risk Officer',
  initials: 'CR',
};

// Build a consistent stage funnel from compact defs.
// Only "passed" cases flow into the next stage, so the funnel narrows naturally.
// defs: [key, label, failed, review]
function buildStages(total: number, defs: ReadonlyArray<readonly unknown[]>): RccStage[] {
  let reached = total;
  return defs.map((def) => {
    const [key, label, failed = 0, review = 0] = def as StageDef;
    const passed = reached - failed - review;
    const stage: RccStage = { key, label, reached, passed, failed, review };
    reached = passed;
    return stage;
  });
}

// Derive a matrix-style journey for a single case from its failed/review stage.
function journey(
  keys: string[],
  { fail, review }: { fail?: string; review?: string } = {},
): Record<string, RccJourneyStepStatus> {
  const out: Record<string, RccJourneyStepStatus> = {};
  let stopped = false;
  for (const k of keys) {
    if (stopped) {
      out[k] = "blocked";
    } else if (k === fail) {
      out[k] = "fail";
      stopped = true;
    } else if (k === review) {
      out[k] = "review";
      stopped = true;
    } else {
      out[k] = "pass";
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// DOMAINS
// ---------------------------------------------------------------------------

const customerKyc = (() => {
  const defs = [
    ["APP", "Application", 0, 0],
    ["KYC", "KYC verification", 1, 1],
    ["RISK", "Risk grading", 1, 0],
    ["AML", "AML screening", 0, 0],
    ["UBO", "UBO / beneficial owner", 0, 0],
    ["ACTIVATE", "Account activation", 0, 0],
    ["REKYC", "Periodic re-KYC", 0, 0],
    ["DORMANT", "Dormancy review", 0, 0],
    ["CLOSE", "Account closure", 0, 0],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "customer-kyc",
    name: "Customer / KYC",
    short: "Customers",
    entity: "Customer",
    total: 120,
    completed: 115,
    critical: 2,
    exception: 2,
    review: 1,
    stages: buildStages(120, defs),
    stageKeys: keys,
    cases: [
      {
        id: "CUST-2026-04-1002",
        title: "Usha Rao",
        subtitle: "NRI — Savings",
        status: "Critical",
        exception: "CIP / ID gap",
        failedStage: "KYC",
        stageLabel: "KYC verification",
        purpose: "Identity proofing & CIP completeness for NRI onboarding.",
        accountable: "PAN, passport, OVD set, FATCA/CRS self-certification",
        journey: journey(keys, { fail: "KYC" }),
        owner: { name: "Meera Nair", role: "KYC Analyst · Retail Ops", emp: "EMP-4471", site: "Onboarding Hub, BLR", time: "08 Apr 2026 · 14:12" },
        controls: [
          { id: "CK-01", label: "Customer identification (CIP)", status: "fail" },
          { id: "CK-02", label: "OVD validation", status: "pass" },
        ],
        evidence: [
          { name: "KYC_CIP_Form_CUST-2026-04-1002.pdf", source: "Workflow System", kind: "PDF", size: "212 KB" },
          { name: "OVD_Bundle_CUST-2026-04-1002.pdf", source: "Document Vault", kind: "PDF", size: "1.1 MB" },
          { name: "Screening_Log_CUST-2026-04-1002.json", source: "SIEM (Splunk)", kind: "JSON", size: "96 KB" },
        ],
        observation: "FATCA/CRS self-certification missing; passport copy expired. Control CK-01 not satisfied — onboarding cannot proceed.",
      },
      {
        id: "CUST-2026-04-1003",
        title: "Sridhar Menon",
        subtitle: "HNI — Private Banking",
        status: "Critical",
        exception: "EDD incomplete",
        failedStage: "RISK",
        stageLabel: "Risk grading",
        purpose: "Risk categorisation & enhanced due diligence for high-value client.",
        accountable: "Risk score sheet, source-of-funds, EDD memo",
        journey: journey(keys, { fail: "RISK" }),
        owner: { name: "Anil Kapoor", role: "Risk Officer · Private Bank", emp: "EMP-2218", site: "Corporate Office, MUM", time: "09 Apr 2026 · 11:40" },
        controls: [
          { id: "CK-04", label: "Risk categorisation", status: "pass" },
          { id: "CK-05", label: "Enhanced due diligence", status: "fail" },
        ],
        evidence: [
          { name: "EDD_Memo_CUST-2026-04-1003.pdf", source: "Workflow System", kind: "PDF", size: "404 KB" },
          { name: "SoF_Workpaper_CUST-2026-04-1003.xlsx", source: "Audit Vault", kind: "XLSX", size: "788 KB" },
        ],
        observation: "Source-of-funds corroboration absent for HNI tier. EDD memo unsigned by approver — control CK-05 failed.",
      },
      {
        id: "CUST-2026-04-1004",
        title: "Sowmya Iyer",
        subtitle: "Individual — Salary",
        status: "Exception",
        exception: "Awaiting: CIP / ID gap",
        failedStage: "KYC",
        stageLabel: "KYC verification",
        purpose: "Pending document upload — under review with relationship desk.",
        journey: journey(keys, { review: "KYC" }),
        owner: { name: "Relationship Desk", role: "Branch Ops · Salary", emp: "EMP-5590", site: "Branch 0412, CHN", time: "10 Apr 2026 · 09:05" },
        evidence: [{ name: "Pending_Doc_Request_CUST-2026-04-1004.pdf", source: "Workflow System", kind: "PDF", size: "64 KB" }],
        observation: "Awaiting customer re-upload of address proof. SLA breach risk in 2 days.",
      },
      {
        id: "CUST-2026-04-1005",
        title: "Priya Nair",
        subtitle: "Startup (PMSE)",
        status: "Exception",
        exception: "Low score",
        failedStage: null,
        purpose: "Passed all stages; flagged for low behavioural risk score.",
        journey: journey(keys, {}),
        observation: "All controls satisfied. Flagged for periodic monitoring due to thin file.",
      },
    ],
  };
})();

const creditLoans = (() => {
  const defs = [
    ["APP", "Application", 0, 0],
    ["BUREAU", "Bureau pull", 0, 1],
    ["UW", "Underwriting", 1, 0],
    ["DOA", "Delegated authority", 1, 0],
    ["COLLAT", "Collateral", 0, 0],
    ["SANCT", "Sanction", 0, 0],
    ["DISB", "Disbursal", 0, 0],
    ["PDM", "Post-disb. monitoring", 0, 0],
    ["IRAC", "IRAC / NPA", 0, 0],
    ["RESTR", "Restructure", 0, 0],
    ["WOFF", "Write-off", 0, 0],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "credit-loans",
    name: "Credit & Loans",
    short: "Loan applications",
    entity: "Loan Application",
    total: 86,
    completed: 82,
    critical: 2,
    exception: 1,
    review: 1,
    stages: buildStages(86, defs),
    stageKeys: keys,
    cases: [
      {
        id: "LN-2026-04-5002",
        title: "Personal Loan — S. Mehta",
        subtitle: "₹5 L / 3y",
        status: "Critical",
        exception: "UW policy breach",
        failedStage: "UW",
        stageLabel: "Underwriting",
        purpose: "Credit assessment against board-approved underwriting policy.",
        accountable: "Income proof, FOIR sheet, policy-deviation note",
        journey: journey(keys, { fail: "UW" }),
        owner: { name: "Rakesh Gupta", role: "Credit Underwriter", emp: "EMP-3301", site: "Retail Credit, DEL", time: "11 Apr 2026 · 16:20" },
        controls: [
          { id: "CL-02", label: "FOIR within policy", status: "fail" },
          { id: "CL-03", label: "Income verification", status: "pass" },
        ],
        evidence: [
          { name: "UW_Sheet_LN-2026-04-5002.xlsx", source: "Audit Vault", kind: "XLSX", size: "512 KB" },
          { name: "Income_Proof_LN-2026-04-5002.pdf", source: "Document Vault", kind: "PDF", size: "330 KB" },
        ],
        observation: "FOIR exceeds policy ceiling with no approved deviation. Control CL-02 failed — sanction blocked.",
      },
      {
        id: "LN-2026-04-5005",
        title: "MSME Loan — Vikram Traders",
        subtitle: "₹1.2 Cr / 7y",
        status: "Critical",
        exception: "DOA breach",
        failedStage: "DOA",
        stageLabel: "Delegated authority",
        purpose: "Approval within delegated lending authority matrix.",
        accountable: "DOA matrix, approver chain, sanction note",
        journey: journey(keys, { fail: "DOA" }),
        owner: { name: "Sunita Rao", role: "Branch Credit Manager", emp: "EMP-2890", site: "MSME Cell, PUN", time: "11 Apr 2026 · 10:02" },
        controls: [{ id: "CL-06", label: "Approval within DOA limits", status: "fail" }],
        evidence: [
          { name: "Sanction_Note_LN-2026-04-5005.pdf", source: "Workflow System", kind: "PDF", size: "276 KB" },
          { name: "DOA_Matrix_Snapshot.pdf", source: "Document Vault", kind: "PDF", size: "188 KB" },
        ],
        observation: "₹1.2 Cr sanctioned one tier above approver's delegated limit. Control CL-06 failed — requires ratification.",
      },
      {
        id: "LN-2026-04-5004",
        title: "Vehicle Loan — T. Sharma",
        subtitle: "₹14 L / 5y",
        status: "Exception",
        exception: "Awaiting: Bureau / consent gap",
        failedStage: "BUREAU",
        stageLabel: "Bureau pull",
        purpose: "Credit bureau enquiry pending customer consent capture.",
        journey: journey(keys, { review: "BUREAU" }),
        owner: { name: "Auto Loan Desk", role: "Sales Ops", emp: "EMP-6612", site: "Branch 0890, HYD", time: "12 Apr 2026 · 13:30" },
        observation: "Bureau consent artefact missing; pull held pending re-capture.",
      },
      {
        id: "LN-2026-04-5003",
        title: "Home Loan — P. Varma",
        subtitle: "₹82 L / 25y",
        status: "Exception",
        exception: "Covenant waiver — documented",
        failedStage: null,
        purpose: "Passed all stages; covenant waiver granted and documented.",
        journey: journey(keys, {}),
        observation: "Waiver approved by committee with minutes on file. No control failure.",
      },
    ],
  };
})();

const transactions = (() => {
  const defs = [
    ["INIT", "Initiation", 0, 0],
    ["AUTH", "Authentication", 0, 0],
    ["LIMITS", "Limit check", 1, 0],
    ["AUTHZ", "Authorization", 1, 0],
    ["PROCESS", "Processing", 0, 1],
    ["SETTLE", "Settlement", 0, 0],
    ["REVERSE", "Reversal", 0, 0],
    ["RECON", "Reconciliation", 0, 0],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "transactions",
    name: "Transactions & Payments",
    short: "Transactions",
    entity: "Transaction",
    total: 142,
    completed: 139,
    critical: 2,
    exception: 0,
    review: 1,
    stages: buildStages(142, defs),
    stageKeys: keys,
    cases: [
      {
        id: "TX-20260417-091302",
        title: "NEFT ₹2,45,000 — Vendor",
        subtitle: "NEFT",
        status: "Critical",
        exception: "Maker-checker gap",
        failedStage: "AUTHZ",
        stageLabel: "Authorization",
        purpose: "Dual-control authorization of outbound vendor payment.",
        accountable: "Maker-checker log, authorizer ID, payment instruction",
        journey: journey(keys, { fail: "AUTHZ" }),
        owner: { name: "Payments Ops", role: "Maker · Outbound", emp: "EMP-7740", site: "Payments Hub, MUM", time: "17 Apr 2026 · 09:13" },
        controls: [{ id: "TP-04", label: "Maker-checker segregation", status: "fail" }],
        evidence: [
          { name: "MakerChecker_Log_TX-091302.json", source: "SIEM (Splunk)", kind: "JSON", size: "142 KB" },
          { name: "Payment_Instruction_TX-091302.pdf", source: "Workflow System", kind: "PDF", size: "98 KB" },
        ],
        observation: "Same user initiated and authorized the payment. Segregation-of-duties control TP-04 failed.",
      },
      {
        id: "TX-20260417-093012",
        title: "LRS ₹16,20,000 — USD remittance",
        subtitle: "LRS",
        status: "Critical",
        exception: "LRS / FX breach",
        failedStage: "LIMITS",
        stageLabel: "Limit check",
        purpose: "LRS annual limit & FX documentation verification.",
        accountable: "LRS declaration, A2 form, limit utilisation",
        journey: journey(keys, { fail: "LIMITS" }),
        owner: { name: "Trade & FX Desk", role: "FX Officer", emp: "EMP-5102", site: "Treasury, MUM", time: "17 Apr 2026 · 09:30" },
        controls: [{ id: "TP-02", label: "LRS limit utilisation", status: "fail" }],
        evidence: [
          { name: "A2_Form_TX-093012.pdf", source: "Document Vault", kind: "PDF", size: "220 KB" },
          { name: "LRS_Limit_Workpaper_TX-093012.xlsx", source: "Audit Vault", kind: "XLSX", size: "640 KB" },
        ],
        observation: "Cumulative LRS exceeds USD 250k FY limit; no RBI approval on file. Control TP-02 failed.",
      },
      {
        id: "TX-20260417-104552",
        title: "Cash deposit ₹11,00,000",
        subtitle: "Cash",
        status: "Exception",
        exception: "Awaiting: CTR / cash gap",
        failedStage: "PROCESS",
        stageLabel: "Processing",
        purpose: "Cash Transaction Report generation pending threshold review.",
        journey: journey(keys, { review: "PROCESS" }),
        owner: { name: "Branch Cash Desk", role: "Teller Ops", emp: "EMP-8821", site: "Branch 0231, AHM", time: "17 Apr 2026 · 10:46" },
        observation: "CTR not yet generated for >₹10L cash. Held pending FIU threshold confirmation.",
      },
    ],
  };
})();

const aml = (() => {
  const defs = [
    ["MONITOR", "Transaction monitoring", 0, 0],
    ["SCREEN", "Sanctions screening", 0, 0],
    ["L1", "L1 review", 1, 0],
    ["L2", "L2 review", 0, 1],
    ["STR", "STR filing", 1, 0],
    ["CTR", "CTR filing", 0, 0],
    ["DISPUTE", "Dispute handling", 0, 0],
    ["WHISTLE", "Whistle-blower", 0, 0],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "aml",
    name: "AML, Risk & Fraud",
    short: "AML alerts",
    entity: "AML Alert",
    total: 64,
    completed: 60,
    critical: 2,
    exception: 1,
    review: 1,
    stages: buildStages(64, defs),
    stageKeys: keys,
    cases: [
      {
        id: "AL-20260417-7113",
        title: "Rapid mvmt — A/c ****2088",
        subtitle: "AML",
        status: "Critical",
        exception: "TM / SLA gap",
        failedStage: "L1",
        stageLabel: "L1 review",
        purpose: "First-line disposition of monitoring alert within SLA.",
        accountable: "Alert narrative, disposition note, SLA clock",
        journey: journey(keys, { fail: "L1" }),
        owner: { name: "FIU Analyst", role: "L1 Investigator", emp: "EMP-9012", site: "FCC, BLR", time: "17 Apr 2026 · 11:13" },
        controls: [{ id: "AM-03", label: "Alert disposed within SLA", status: "fail" }],
        evidence: [
          { name: "Alert_Narrative_AL-7113.pdf", source: "Workflow System", kind: "PDF", size: "180 KB" },
          { name: "TM_Alert_Log_AL-7113.json", source: "SIEM (Splunk)", kind: "JSON", size: "210 KB" },
        ],
        observation: "Alert open 9 days beyond 5-day SLA without escalation. Control AM-03 failed.",
      },
      {
        id: "AL-20260417-7115",
        title: "Unusual foreign inward — A/c ****7721",
        subtitle: "AML",
        status: "Critical",
        exception: "STR timeliness",
        failedStage: "STR",
        stageLabel: "STR filing",
        purpose: "Suspicious Transaction Report filed to FIU-IND within statutory window.",
        accountable: "STR draft, FIU acknowledgement, filing timestamp",
        journey: journey(keys, { fail: "STR" }),
        owner: { name: "Principal Officer", role: "AML Compliance", emp: "EMP-1100", site: "FCC, MUM", time: "17 Apr 2026 · 11:15" },
        controls: [{ id: "AM-05", label: "STR filed within 7 days", status: "fail" }],
        evidence: [
          { name: "STR_Draft_AL-7115.pdf", source: "Document Vault", kind: "PDF", size: "260 KB" },
          { name: "STR_Workpaper_AL-7115.xlsx", source: "Audit Vault", kind: "XLSX", size: "512 KB" },
        ],
        observation: "STR filed 11 days after detection vs 7-day statutory limit. Control AM-05 failed — reg-reportable.",
      },
      {
        id: "AL-20260417-7117",
        title: "Fraud case — Vishing Mumbai",
        subtitle: "Fraud",
        status: "Exception",
        exception: "Awaiting: Investigation gap",
        failedStage: "L2",
        stageLabel: "L2 review",
        purpose: "Second-line fraud investigation pending evidence collation.",
        journey: journey(keys, { review: "L2" }),
        owner: { name: "Fraud Risk", role: "L2 Investigator", emp: "EMP-3344", site: "FCC, MUM", time: "17 Apr 2026 · 11:17" },
        observation: "Awaiting CCTV and call-log evidence before disposition.",
      },
    ],
  };
})();

const itChange = (() => {
  const defs = [
    ["RFC", "Change request", 0, 0],
    ["CODE", "Code review", 0, 0],
    ["ENV", "Environment check", 0, 0],
    ["CAB", "CAB approval", 1, 0],
    ["DEPLOY", "Deployment", 0, 0],
    ["PIR", "Post-impl. review", 0, 0],
    ["EMERG", "Emergency handling", 1, 0],
    ["INCIDENT", "Incident linkage", 0, 0],
    ["PATCH", "Patch SLA", 0, 1],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "it-change",
    name: "IT Change Mgmt",
    short: "Change requests",
    entity: "Change Request",
    total: 58,
    completed: 55,
    critical: 2,
    exception: 0,
    review: 1,
    stages: buildStages(58, defs),
    stageKeys: keys,
    cases: [
      {
        id: "CHG-20260415-2102",
        title: "UPI gateway upgrade",
        subtitle: "Normal",
        status: "Critical",
        exception: "CAB / RFC gap",
        failedStage: "CAB",
        stageLabel: "CAB approval",
        purpose: "Change Advisory Board sign-off before production deployment.",
        accountable: "CAB minutes, RFC ticket, rollback plan",
        journey: journey(keys, { fail: "CAB" }),
        owner: { name: "Release Manager", role: "Change Mgmt · DevOps", emp: "EMP-6701", site: "Tech Centre, BLR", time: "15 Apr 2026 · 18:40" },
        controls: [{ id: "IT-04", label: "CAB approval obtained", status: "fail" }],
        evidence: [
          { name: "RFC_Ticket_CHG-2102.pdf", source: "Workflow System", kind: "PDF", size: "120 KB" },
          { name: "Deploy_Log_CHG-2102.json", source: "SIEM (Splunk)", kind: "JSON", size: "340 KB" },
        ],
        observation: "Deployed to production without CAB record. Control IT-04 failed — requires retrospective review.",
      },
      {
        id: "CHG-20260415-2103",
        title: "Prod config hotfix",
        subtitle: "Emergency",
        status: "Critical",
        exception: "Emergency ratification",
        failedStage: "EMERG",
        stageLabel: "Emergency handling",
        purpose: "Post-event ratification of emergency change.",
        accountable: "Emergency change form, ratification approval",
        journey: journey(keys, { fail: "EMERG" }),
        owner: { name: "On-call SRE", role: "Site Reliability", emp: "EMP-7755", site: "Tech Centre, HYD", time: "15 Apr 2026 · 22:05" },
        controls: [{ id: "IT-07", label: "Emergency change ratified", status: "fail" }],
        evidence: [{ name: "Emergency_Change_CHG-2103.pdf", source: "Workflow System", kind: "PDF", size: "96 KB" }],
        observation: "Emergency hotfix not ratified within 48h. Control IT-07 failed.",
      },
      {
        id: "CHG-20260416-2104",
        title: "Critical OS patch",
        subtitle: "Normal",
        status: "Exception",
        exception: "Awaiting: Patch SLA",
        failedStage: "PATCH",
        stageLabel: "Patch SLA",
        purpose: "Patch deployment pending against vulnerability SLA.",
        journey: journey(keys, { review: "PATCH" }),
        owner: { name: "Infra Patching", role: "Platform Ops", emp: "EMP-4490", site: "Tech Centre, BLR", time: "16 Apr 2026 · 09:30" },
        observation: "Patch scheduled but not yet applied; SLA breach risk in 1 day.",
      },
    ],
  };
})();

const infraCyber = (() => {
  const defs = [
    ["BASELINE", "Hardening baseline", 0, 0],
    ["SEGMENT", "Network segmentation", 0, 0],
    ["FW", "Firewall review", 1, 0],
    ["CLOUD", "Cloud security", 1, 0],
    ["VA", "Vulnerability assess.", 0, 1],
    ["PT", "Penetration test", 0, 0],
    ["BACKUP", "Backup integrity", 1, 0],
    ["DR", "DR drill", 0, 0],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "infra-cyber",
    name: "Infrastructure & Cyber",
    short: "Infra tickets",
    entity: "Infra Ticket",
    total: 73,
    completed: 69,
    critical: 3,
    exception: 0,
    review: 1,
    stages: buildStages(73, defs),
    stageKeys: keys,
    cases: [
      {
        id: "INF-20260414-8801",
        title: "Firewall rule review — Q1",
        subtitle: "Periodic",
        status: "Critical",
        exception: "FW rule review",
        failedStage: "FW",
        stageLabel: "Firewall review",
        purpose: "Quarterly recertification of firewall rule base.",
        accountable: "Rule review sheet, owner sign-off, stale-rule list",
        journey: journey(keys, { fail: "FW" }),
        owner: { name: "Network Security", role: "Firewall Admin", emp: "EMP-2201", site: "SOC, BLR", time: "14 Apr 2026 · 17:00" },
        controls: [{ id: "IC-03", label: "Rule base recertified", status: "fail" }],
        evidence: [
          { name: "FW_Rule_Review_INF-8801.xlsx", source: "Audit Vault", kind: "XLSX", size: "820 KB" },
          { name: "FW_Config_Snapshot_INF-8801.json", source: "SIEM (Splunk)", kind: "JSON", size: "1.4 MB" },
        ],
        observation: "27 stale permit-any rules un-reviewed past due date. Control IC-03 failed.",
      },
      {
        id: "INF-20260415-8803",
        title: "Cloud IAM audit — AWS",
        subtitle: "Periodic",
        status: "Critical",
        exception: "Cloud IAM",
        failedStage: "CLOUD",
        stageLabel: "Cloud security",
        purpose: "Least-privilege review of cloud IAM roles.",
        accountable: "IAM access report, privileged-role list",
        journey: journey(keys, { fail: "CLOUD" }),
        owner: { name: "Cloud Security", role: "Cloud Engineer", emp: "EMP-5567", site: "SOC, HYD", time: "15 Apr 2026 · 12:15" },
        controls: [{ id: "IC-05", label: "Least-privilege enforced", status: "fail" }],
        evidence: [{ name: "IAM_Access_Report_INF-8803.xlsx", source: "Audit Vault", kind: "XLSX", size: "640 KB" }],
        observation: "Two dormant admin roles with standing keys. Control IC-05 failed.",
      },
      {
        id: "INF-20260416-8806",
        title: "Backup failure investigation",
        subtitle: "Incident",
        status: "Critical",
        exception: "Backup gap",
        failedStage: "BACKUP",
        stageLabel: "Backup integrity",
        purpose: "Verification of backup completion & restore test.",
        accountable: "Backup job log, restore test evidence",
        journey: journey(keys, { fail: "BACKUP" }),
        owner: { name: "Storage Ops", role: "Backup Admin", emp: "EMP-6690", site: "DC, CHN", time: "16 Apr 2026 · 08:50" },
        controls: [{ id: "IC-07", label: "Successful backup verified", status: "fail" }],
        evidence: [{ name: "Backup_Job_Log_INF-8806.json", source: "SIEM (Splunk)", kind: "JSON", size: "510 KB" }],
        observation: "Core banking backup failed 3 consecutive nights; no restore test. Control IC-07 failed.",
      },
      {
        id: "INF-20260415-8804",
        title: "Monthly VA scan",
        subtitle: "Periodic",
        status: "Exception",
        exception: "Awaiting: VA findings",
        failedStage: "VA",
        stageLabel: "Vulnerability assess.",
        purpose: "Vulnerability scan findings pending triage.",
        journey: journey(keys, { review: "VA" }),
        owner: { name: "VA Team", role: "Security Analyst", emp: "EMP-3312", site: "SOC, BLR", time: "15 Apr 2026 · 10:20" },
        observation: "Scan complete; high findings awaiting risk acceptance / remediation.",
      },
    ],
  };
})();

const dataGov = (() => {
  const defs = [
    ["CLASS", "Classification", 0, 1],
    ["CONSENT", "Consent", 0, 0],
    ["PROCESS", "Processing", 0, 0],
    ["MASK", "Masking", 1, 0],
    ["ENCRYPT", "Encryption", 0, 0],
    ["DLP", "DLP", 1, 0],
    ["RETAIN", "Retention", 1, 0],
    ["ERASE", "Erasure", 0, 0],
    ["XBORDER", "Cross-border", 0, 0],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "data-gov",
    name: "Data Governance",
    short: "Data tasks",
    entity: "Data Task",
    total: 91,
    completed: 87,
    critical: 3,
    exception: 0,
    review: 1,
    stages: buildStages(91, defs),
    stageKeys: keys,
    cases: [
      {
        id: "DPR-2026-04-602",
        title: "Masking job — QA refresh",
        subtitle: "Masking",
        status: "Critical",
        exception: "Masking gap",
        failedStage: "MASK",
        stageLabel: "Masking",
        purpose: "PII masking before non-prod data refresh.",
        accountable: "Masking config, sample validation, sign-off",
        journey: journey(keys, { fail: "MASK" }),
        owner: { name: "Data Platform", role: "Data Engineer", emp: "EMP-7012", site: "Data Office, BLR", time: "12 Apr 2026 · 15:40" },
        controls: [{ id: "DG-04", label: "PII masked in non-prod", status: "fail" }],
        evidence: [{ name: "Masking_Config_DPR-602.json", source: "SIEM (Splunk)", kind: "JSON", size: "88 KB" }],
        observation: "Account numbers copied unmasked to QA. Control DG-04 failed — DPDP exposure.",
      },
      {
        id: "DPR-2026-04-603",
        title: "DLP incident — bulk export",
        subtitle: "DLP Incident",
        status: "Critical",
        exception: "DLP incident",
        failedStage: "DLP",
        stageLabel: "DLP",
        purpose: "Data-loss-prevention control on bulk export.",
        accountable: "DLP alert, blocked-action log, incident record",
        journey: journey(keys, { fail: "DLP" }),
        owner: { name: "Data Security", role: "DLP Analyst", emp: "EMP-4423", site: "SOC, MUM", time: "13 Apr 2026 · 11:25" },
        controls: [{ id: "DG-06", label: "Bulk export blocked", status: "fail" }],
        evidence: [{ name: "DLP_Alert_Log_DPR-603.json", source: "SIEM (Splunk)", kind: "JSON", size: "420 KB" }],
        observation: "12k customer records exported to personal drive; DLP in monitor-only mode. Control DG-06 failed.",
      },
      {
        id: "DPR-2026-04-606",
        title: "Retention purge — 2018 data",
        subtitle: "Retention",
        status: "Critical",
        exception: "Retention",
        failedStage: "RETAIN",
        stageLabel: "Retention",
        purpose: "Purge of records beyond retention schedule.",
        accountable: "Retention policy, purge log, legal-hold check",
        journey: journey(keys, { fail: "RETAIN" }),
        owner: { name: "Records Mgmt", role: "Data Steward", emp: "EMP-5580", site: "Data Office, DEL", time: "14 Apr 2026 · 09:10" },
        controls: [{ id: "DG-07", label: "Retention schedule enforced", status: "fail" }],
        evidence: [{ name: "Purge_Log_DPR-606.xlsx", source: "Audit Vault", kind: "XLSX", size: "260 KB" }],
        observation: "2018 records retained beyond 7-year schedule without legal hold. Control DG-07 failed.",
      },
      {
        id: "DPR-2026-04-604",
        title: "Classification — new dataset",
        subtitle: "Classification",
        status: "Exception",
        exception: "Awaiting: Classification",
        failedStage: "CLASS",
        stageLabel: "Classification",
        purpose: "Data classification pending steward review.",
        journey: journey(keys, { review: "CLASS" }),
        owner: { name: "Data Governance", role: "Data Steward", emp: "EMP-6634", site: "Data Office, BLR", time: "14 Apr 2026 · 14:00" },
        observation: "New dataset onboarded; sensitivity label pending steward confirmation.",
      },
    ],
  };
})();

const finReporting = (() => {
  const defs = [
    ["CAPTURE", "Capture", 0, 0],
    ["JE", "Journal entry", 0, 0],
    ["ACCRUAL", "Accrual", 0, 0],
    ["GL", "GL reconciliation", 1, 0],
    ["NOSTRO", "Nostro reconciliation", 1, 0],
    ["IBA", "Inter-branch", 0, 0],
    ["SUSP", "Suspense", 0, 1],
    ["EXPENSE", "Expense", 0, 0],
    ["VENDOR", "Vendor payment", 0, 0],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "fin-reporting",
    name: "Financial Reporting",
    short: "Close batches",
    entity: "Close Batch",
    total: 48,
    completed: 45,
    critical: 2,
    exception: 0,
    review: 1,
    stages: buildStages(48, defs),
    stageKeys: keys,
    cases: [
      {
        id: "FIN-2026-04-B1",
        title: "Apr 2026 Wk-2 GL close",
        subtitle: "Close",
        status: "Critical",
        exception: "GL recon gap",
        failedStage: "GL",
        stageLabel: "GL reconciliation",
        purpose: "General-ledger reconciliation before sub-ledger lock.",
        accountable: "Recon statement, break analysis, sign-off",
        journey: journey(keys, { fail: "GL" }),
        owner: { name: "Finance Ops", role: "GL Accountant", emp: "EMP-3398", site: "Finance SSC, CHN", time: "15 Apr 2026 · 19:20" },
        controls: [{ id: "FR-04", label: "GL reconciled & signed", status: "fail" }],
        evidence: [{ name: "GL_Recon_FIN-04-B1.xlsx", source: "Audit Vault", kind: "XLSX", size: "1.1 MB" }],
        observation: "Unexplained break of ₹38L in suspense; recon unsigned. Control FR-04 failed — blocks close.",
      },
      {
        id: "FIN-2026-04-B2",
        title: "Apr 2026 Nostro close",
        subtitle: "Close",
        status: "Critical",
        exception: "Nostro break",
        failedStage: "NOSTRO",
        stageLabel: "Nostro reconciliation",
        purpose: "Nostro account reconciliation against correspondent statements.",
        accountable: "Nostro recon, aged-break report",
        journey: journey(keys, { fail: "NOSTRO" }),
        owner: { name: "Treasury Ops", role: "Nostro Analyst", emp: "EMP-2207", site: "Treasury, MUM", time: "16 Apr 2026 · 08:30" },
        controls: [{ id: "FR-05", label: "Nostro breaks cleared", status: "fail" }],
        evidence: [{ name: "Nostro_Recon_FIN-04-B2.xlsx", source: "Audit Vault", kind: "XLSX", size: "920 KB" }],
        observation: "Aged nostro break >30 days uncleared. Control FR-05 failed.",
      },
      {
        id: "FIN-2026-04-B3",
        title: "Apr 2026 Suspense review",
        subtitle: "Periodic",
        status: "Exception",
        exception: "Awaiting: Suspense >90d",
        failedStage: "SUSP",
        stageLabel: "Suspense",
        purpose: "Review of aged suspense items pending clearance.",
        journey: journey(keys, { review: "SUSP" }),
        owner: { name: "Finance Ops", role: "Suspense Analyst", emp: "EMP-4418", site: "Finance SSC, CHN", time: "16 Apr 2026 · 10:00" },
        observation: "Items aged >90 days under review for write-back / clearance.",
      },
    ],
  };
})();

const ops3p = (() => {
  const defs = [
    ["ONBOARD", "Onboarding", 0, 0],
    ["DD", "Due diligence", 1, 0],
    ["CONTRACT", "Contracting", 0, 0],
    ["TPRM", "TPRM scoring", 0, 0],
    ["BCP", "BCP testing", 0, 0],
    ["JOINER", "Joiner", 0, 0],
    ["MOVER", "Mover", 0, 1],
    ["LEAVER", "Leaver", 1, 0],
  ];
  const keys = defs.map((d) => String(d[0]));
  return {
    id: "ops-3p",
    name: "Operations & 3rd Party",
    short: "Ops cases",
    entity: "Ops Case",
    total: 39,
    completed: 36,
    critical: 2,
    exception: 0,
    review: 1,
    stages: buildStages(39, defs),
    stageKeys: keys,
    cases: [
      {
        id: "OPS-2026-04-V101",
        title: "Vendor — Infosys Ltd (IT)",
        subtitle: "Onboarding",
        status: "Critical",
        exception: "TPRM score",
        failedStage: "DD",
        stageLabel: "Due Diligence",
        purpose: "Financial, legal, infosec assessment.",
        accountable: "DD report, financial health score, security posture",
        journey: journey(keys, { fail: "DD" }),
        owner: { name: "Rohan Iyer", role: "TPRM Analyst · TPRM", emp: "EMP-7214", site: "Corporate Office, MUM", time: "10 Apr 2026 · 10:27" },
        controls: [
          { id: "OP-01", label: "Vendor onboarding due diligence", status: "pass" },
          { id: "OP-02", label: "Third-party risk assessment", status: "fail" },
        ],
        evidence: [
          { name: "Due_Diligence_Attestation_OPS-2026-04-V101.pdf", source: "Workflow System", kind: "PDF", size: "337 KB" },
          { name: "Due_Diligence_SupportingDoc_OPS-2026-04-V101.pdf", source: "Document Vault", kind: "PDF", size: "457 KB" },
          { name: "Due_Diligence_SystemLog_OPS-2026-04-V101.json", source: "SIEM (Splunk)", kind: "JSON", size: "157 KB" },
          { name: "Due_Diligence_Workpaper_OPS-2026-04-V101.xlsx", source: "Audit Vault", kind: "XLSX", size: "937 KB" },
        ],
        observation: "Evidence did not satisfy control OP-02. Owner informed; corrective action required before stage can be re-submitted.",
      },
      {
        id: "OPS-2026-04-H203",
        title: "HR Leaver — K. Das",
        subtitle: "Leaver",
        status: "Critical",
        exception: "JML gap",
        failedStage: "LEAVER",
        stageLabel: "Leaver",
        purpose: "Joiner-mover-leaver access revocation on exit.",
        accountable: "Revocation checklist, access-removal evidence",
        journey: journey(keys, { fail: "LEAVER" }),
        owner: { name: "IT Access Mgmt", role: "IAM Analyst", emp: "EMP-5503", site: "Tech Centre, BLR", time: "16 Apr 2026 · 17:45" },
        controls: [{ id: "OP-08", label: "Access revoked on exit", status: "fail" }],
        evidence: [{ name: "Access_Revocation_OPS-H203.json", source: "SIEM (Splunk)", kind: "JSON", size: "190 KB" }],
        observation: "Active credentials 8 days post-exit. Control OP-08 failed — privileged-access risk.",
      },
      {
        id: "OPS-2026-04-H202",
        title: "HR Mover — S. Banerjee",
        subtitle: "Mover",
        status: "Exception",
        exception: "Awaiting: JML gap",
        failedStage: "MOVER",
        stageLabel: "Mover",
        purpose: "Role-change access re-certification pending manager sign-off.",
        journey: journey(keys, { review: "MOVER" }),
        owner: { name: "IT Access Mgmt", role: "IAM Analyst", emp: "EMP-5503", site: "Tech Centre, BLR", time: "16 Apr 2026 · 14:10" },
        observation: "Old-role entitlements pending removal; manager attestation awaited.",
      },
    ],
  };
})();

export const domains = [
  customerKyc,
  creditLoans,
  transactions,
  aml,
  itChange,
  infraCyber,
  dataGov,
  finReporting,
  ops3p,
] as RccDomain[];

// Portfolio rollup — the single source of truth for the KPI ribbon.
const portfolioBase = domains.reduce(
  (acc, d) => {
    acc.total += d.total;
    acc.completed += d.completed;
    acc.critical += d.critical;
    acc.exception += d.exception;
    acc.review += d.review;
    return acc;
  },
  { total: 0, completed: 0, critical: 0, exception: 0, review: 0 },
);

export const portfolio = {
  ...portfolioBase,
  compliancePct: Math.round((portfolioBase.completed / portfolioBase.total) * 100),
  domainCount: domains.length,
};

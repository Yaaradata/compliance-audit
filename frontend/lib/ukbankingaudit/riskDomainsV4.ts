import type {
  CrsaControl,
  RagStatus,
  RiskDomainV4,
  WhatChangedRowV4,
} from "@/lib/ukbankingaudit/riskDomainTypes";

export const CRSA_DATA: Record<string, CrsaControl[]> = {
  fincrime: [
    { ref: "AML.01.01.01", objective: "5th AML Directive changes", requirement: "Understanding of relevant changes to Firm", status: "GREEN" },
    { ref: "AML.01.02.01", objective: "Money Laundering Regulations 2017", requirement: "MLR requirements implemented", status: "GREEN" },
    { ref: "AML.01.04.01", objective: "Board member oversight", requirement: "Board member for MLR oversight identified", status: "GREEN" },
    { ref: "AML.01.05.02", objective: "MLRO / NO Reporting", requirement: "MLRO prepares reports for senior management", status: "RED" },
    { ref: "AML.01.06.01", objective: "AML/CTF Risk Assessments", requirement: "Risk assessments completed and ratified", status: "AMBER" },
    { ref: "AML.01.08.01", objective: "High Risk Relationships", requirement: "High-risk relationships identified", status: "AMBER" },
    { ref: "AML.01.12.01", objective: "AML Training", requirement: "Staff training identified and monitored", status: "GREEN" },
    { ref: "AML.01.13.01", objective: "Data Retention", requirement: "Retention periods documented", status: "RED" },
    { ref: "FRD.01.01.01", objective: "Fraud training", requirement: "Mandatory financial crime training completed", status: "GREEN" },
    { ref: "FRD.01.06.01", objective: "Fraud investigation", requirement: "Fraud First Responders appointed", status: "GREEN" },
    { ref: "SCTN.01.01.01", objective: "Sanctions screening", requirement: "Processes for handling client funds screening", status: "GREEN" },
    { ref: "ABC.01.01.01", objective: "Bribery risk assessment", requirement: "Financial crime risk assessment in place", status: "GREEN" },
  ],
};

export const RISK_DOMAINS_V4: RiskDomainV4[] = [
  {
    id: "credit",
    name: "Credit Risk",
    status: "GREEN",
    trend: "stable",
    delta: 0,
    summary: "Credit portfolio within risk appetite. Watchlist stable at 23 names; no new defaults in period.",
    subCategories: [
      { name: "Portfolio Quality", status: "GREEN", desc: "NPL ratio 1.2% vs appetite 2.5%. No sector concentration breach." },
      { name: "Counterparty Exposure", status: "GREEN", desc: "Top-10 counterparty utilisation at 68% of limits. No single-name breach." },
      { name: "Credit Risk Models", status: "GREEN", desc: "All models within validation thresholds. Annual review complete." },
    ],
    kris: [
      { label: "NPL Ratio", value: 1.2, target: 2.5, unit: "%", status: "GREEN" },
      { label: "Watchlist Names", value: 23, target: 50, unit: "count", status: "GREEN" },
    ],
    changes: [{ text: "Credit risk models annual validation completed — all within thresholds.", confidence: 91 }],
  },
  {
    id: "market",
    name: "Market Risk",
    status: "GREEN",
    trend: "stable",
    delta: 0,
    summary: "VaR utilisation within limits. FX hedging programme performing as expected; monitoring rate sensitivity.",
    subCategories: [
      { name: "Interest Rate Risk", status: "GREEN", desc: "Duration gap within appetite. NII sensitivity -£2.1m per 25bps, within limit." },
      { name: "FX Risk", status: "GREEN", desc: "Net open position £14m vs limit £50m. Hedge effectiveness 96%." },
      { name: "Equity / Valuation", status: "GREEN", desc: "Mark-to-market reserves stable. No material fair-value disputes." },
    ],
    kris: [
      { label: "VaR Utilisation", value: 72, target: 100, unit: "%", status: "GREEN" },
      { label: "Hedge Effectiveness", value: 96, target: 90, unit: "%", status: "GREEN" },
    ],
    changes: [{ text: "FX hedging programme renewed — effectiveness stable at 96%.", confidence: 87 }],
  },
  {
    id: "liquidity",
    name: "Liquidity & Funding",
    status: "GREEN",
    trend: "down",
    delta: -2,
    summary: "LCR improving at 142%. Wholesale funding maturity profile well-spread; no cliff risk.",
    subCategories: [
      { name: "LCR / NSFR", status: "GREEN", desc: "LCR 142% (appetite >110%). NSFR 118%. Both buffers comfortable." },
      { name: "Funding Concentration", status: "GREEN", desc: "Top-5 depositor concentration 18%. No single-source dependency." },
      { name: "Intraday Liquidity", status: "GREEN", desc: "Peak intraday usage £1.8bn vs throughput capacity £4.2bn." },
    ],
    kris: [
      { label: "LCR", value: 142, target: 110, unit: "%", status: "GREEN" },
      { label: "NSFR", value: 118, target: 100, unit: "%", status: "GREEN" },
    ],
    changes: [{ text: "LCR improved from 135% to 142% following Q1 HQLA optimisation.", confidence: 82 }],
  },
  {
    id: "conduct",
    name: "Conduct & Reputation",
    status: "GREEN",
    trend: "stable",
    delta: -1,
    summary: "Consumer Duty fair-value evidence current across the product set; no SMCR conduct breaches in the period.",
    subCategories: [
      { name: "Consumer Duty", status: "GREEN", desc: "Fair-value assessments current. No outcome gaps flagged in quarterly MI." },
      { name: "SMCR Compliance", status: "GREEN", desc: "All SMF / Cert holders attested. No conduct breaches logged." },
      { name: "Complaints & Redress", status: "GREEN", desc: "Complaints volumes down 8% QoQ. FOS overturn rate 12% (target <15%)." },
    ],
    kris: [
      { label: "FOS Overturn Rate", value: 12, target: 15, unit: "%", status: "GREEN" },
      { label: "Complaints per 1k Customers", value: 3.2, target: 5, unit: "count", status: "GREEN" },
    ],
    changes: [{ text: "Consumer Duty fair-value evidence refreshed across all product lines.", confidence: 88 }],
  },
  {
    id: "climate",
    name: "Climate / ESG",
    status: "GREEN",
    trend: "stable",
    delta: 0,
    summary: "TCFD disclosures on track. Financed emissions baseline established; no portfolio alignment breach.",
    subCategories: [
      { name: "TCFD / Disclosure", status: "GREEN", desc: "Annual TCFD report on track for July publication. Scenario analysis refreshed." },
      { name: "Financed Emissions", status: "GREEN", desc: "Baseline established. High-carbon sector exposure 6.8% of book — within 8% limit." },
      { name: "Physical Risk", status: "GREEN", desc: "Flood-zone exposure mapped. No material concentration in high-risk postcodes." },
    ],
    kris: [{ label: "High-Carbon Sector Exposure", value: 6.8, target: 8, unit: "%", status: "GREEN" }],
    changes: [{ text: "Financed emissions baseline methodology agreed with Board ESG Committee.", confidence: 79 }],
  },
  {
    id: "fincrime",
    name: "Fraud & Financial Crime",
    status: "AMBER",
    trend: "up",
    delta: 5,
    summary: "AML evidence completeness on MLRO Reporting / FIU Reporting requirements degraded since week 8; AML-C002 disposition control under capacity stress.",
    subCategories: [
      { name: "Customer Due Diligence (KYC)", status: "AMBER", desc: "Periodic KYC refresh backlog on high-risk customers: 4,210 cases vs appetite <1,000." },
      { name: "Transaction Monitoring", status: "AMBER", desc: "Alert closure within SLA at 86% vs target ≥95%. L1/L2 disposition team under capacity stress." },
      { name: "Sanctions / PEP Screening", status: "GREEN", desc: "Screening coverage 99.9%. No false-negative incidents. Systems performing within parameters." },
      { name: "SAR / Regulatory Reporting", status: "GREEN", desc: "All SARs filed within statutory deadlines. FIU engagement positive." },
      { name: "Customer Risk Rating", status: "GREEN", desc: "CRR model recalibrated Q1. No material misclassification surfaced by 2nd line." },
    ],
    kris: [
      { label: "KYC Periodic Review Backlog", value: 4210, target: 1000, unit: "cases", status: "RED" },
      { label: "High-Risk Reviews Overdue", value: 17, target: 5, unit: "%", status: "RED" },
      { label: "TM Alerts Closed in SLA", value: 86, target: 95, unit: "%", status: "AMBER" },
      { label: "EDD Completed on Time", value: 93, target: 98, unit: "%", status: "AMBER" },
      { label: "Sanctions Screening Coverage", value: 99.9, target: 100, unit: "%", status: "GREEN" },
    ],
    changes: [
      { text: "AML evidence completeness on MLRO Reporting (AML.01.05.02) collapsed from 93% to 58% — capacity stress in the L1/L2 disposition team is the root cause.", confidence: 88 },
      { text: "KYC periodic review backlog grew by 620 cases following core-banking migration cutover delays.", confidence: 92 },
      { text: "Coverage Gap Panel surfaced AML.01.13.01 (Data Retention) as the only requirement covered by a single weak control — supplemental control under design.", confidence: 79 },
    ],
    remediation: {
      title: "KYC Refresh Remediation Programme",
      forecast: "Amber → Green by Q4 2026",
      completion: 58,
      steps: [
        { title: "Root cause analysis & scope agreed", status: "Complete", desc: "Backlog quantified and validated by 2nd line.", target: "Q1 2026", progress: 100 },
        { title: "Dedicated review team established", status: "Complete", desc: "40 FTE trained, tooling provisioned.", target: "Q1 2026", progress: 100 },
        { title: "Clear high-risk customer backlog", status: "In Progress", desc: "2,610 of 4,210 cases cleared. On trajectory for Q3 target.", target: "Q3 2026", progress: 62 },
        { title: "Remediate medium / low-risk backlog", status: "Delayed", desc: "To commence after high-risk cases complete.", target: "Q4 2026", progress: 0 },
        { title: "Embed enhanced controls into BAU & close", status: "Not Started", desc: "Automate triggers and report to Board.", target: "Q4 2026" },
      ],
    },
    crsa: "fincrime",
  },
  {
    id: "opsres",
    name: "Operational Resilience",
    status: "GREEN",
    trend: "stable",
    delta: 0,
    summary: "All important business services mapped. Impact tolerances tested; no breaches in the quarter.",
    subCategories: [
      { name: "IBS Mapping", status: "GREEN", desc: "14 important business services mapped to resources and third parties." },
      { name: "Impact Tolerance Testing", status: "GREEN", desc: "Scenario tests complete. All services within tolerance. Next test cycle H2." },
      { name: "Third-Party Resilience", status: "GREEN", desc: "Critical supplier dependency register current. Exit plans for top-5 reviewed." },
    ],
    kris: [{ label: "IBS Within Tolerance", value: 100, target: 100, unit: "%", status: "GREEN" }],
    changes: [{ text: "Impact tolerance scenario testing cycle completed — all 14 important business services within stated tolerances.", confidence: 90 }],
  },
  {
    id: "cyber",
    name: "Cyber & Op Resilience",
    status: "RED",
    trend: "stable",
    delta: 0,
    summary: "Vulnerability remediation in flight following 14-Apr disclosure; closure pack signed by Head of InfoSec and CTO.",
    deadline: "RED UNTIL 18-JUL",
    subCategories: [
      { name: "Vulnerability Management", status: "RED", desc: "Critical CVE disclosed 14-Apr. Remediation in flight — closure pack signed by Head of InfoSec and CTO. Target: 18-Jul." },
      { name: "Cyber Threat Intelligence", status: "AMBER", desc: "Elevated threat level for financial sector. SOC monitoring enhanced; no successful intrusion." },
      { name: "Identity & Access Mgmt", status: "GREEN", desc: "Privileged access reviews current. MFA coverage 99.7% across production estate." },
      { name: "Business Continuity", status: "GREEN", desc: "DR test successful. RTO/RPO within targets for all Tier-1 applications." },
    ],
    kris: [
      { label: "Critical Vulnerabilities Open", value: 3, target: 0, unit: "count", status: "RED" },
      { label: "Mean Time to Patch (Critical)", value: 18, target: 7, unit: "days", status: "RED" },
      { label: "MFA Coverage", value: 99.7, target: 99.5, unit: "%", status: "GREEN" },
    ],
    changes: [
      { text: "Cyber risk reset to red following the 14-Apr vulnerability disclosure; remediation closure pack signed by Head of InfoSec and CTO, target 18-Jul.", confidence: 95 },
      { text: "SOC enhanced monitoring activated in response to elevated sector threat intelligence.", confidence: 84 },
    ],
    remediation: {
      title: "Critical Vulnerability Remediation",
      forecast: "Red → Green by 18-Jul 2026",
      completion: 35,
      steps: [
        { title: "Vulnerability disclosed & triaged", status: "Complete", desc: "CVE categorised as Critical. Incident response team activated.", target: "14-Apr", progress: 100 },
        { title: "Containment measures deployed", status: "Complete", desc: "WAF rules and network segmentation applied. Attack surface reduced.", target: "18-Apr", progress: 100 },
        { title: "Patch development & testing", status: "In Progress", desc: "Vendor patch received. Internal testing across staging environments.", target: "30-Jun", progress: 55 },
        { title: "Production rollout", status: "Not Started", desc: "Phased deployment across production estate with rollback plan.", target: "10-Jul" },
        { title: "Post-incident review & closure", status: "Not Started", desc: "Lessons learned, control gap analysis, Board report.", target: "18-Jul" },
      ],
    },
  },
  {
    id: "regulatory",
    name: "Regulatory",
    status: "GREEN",
    trend: "stable",
    delta: 0,
    summary: "No live regulatory findings; one PRA SS2/21 amendment under applicability assessment.",
    subCategories: [
      { name: "Regulatory Findings", status: "GREEN", desc: "Zero open regulatory findings. Last closed: FCA Skilled Person review (Feb 2026)." },
      { name: "Regulatory Change", status: "GREEN", desc: "PRA SS2/21 amendment applicability assessment in flight — owner SMF16, target 30-May." },
      { name: "Licence & Permissions", status: "GREEN", desc: "All permissions current. No pending applications or variations." },
    ],
    kris: [
      { label: "Open Regulatory Findings", value: 0, target: 0, unit: "count", status: "GREEN" },
      { label: "Overdue Reg Actions", value: 0, target: 0, unit: "count", status: "GREEN" },
    ],
    changes: [
      { text: "PRA SS2/21 amendment applicability assessment in flight — assessment owner is SMF16; target completion 30-May.", confidence: 82 },
    ],
  },
];

const STATUS_RANK: Record<RagStatus, number> = { RED: 3, AMBER: 2, GREEN: 1 };

export function computeFirmPostureV4(domains: RiskDomainV4[]) {
  const counts = { GREEN: 0, AMBER: 0, RED: 0 };
  for (const d of domains) counts[d.status] += 1;
  const firmStatus = domains.reduce<RagStatus>(
    (worst, d) => (STATUS_RANK[d.status] > STATUS_RANK[worst] ? d.status : worst),
    "GREEN",
  );
  const redNames = domains.filter((d) => d.status === "RED").map((d) => d.name);
  const amberNames = domains.filter((d) => d.status === "AMBER").map((d) => d.name);
  const narrative = `${firmStatus} — ${redNames.join(", ") || "No"} red; ${amberNames.join(", ") || "No"} amber; remaining domains in green.`;
  return { firmStatus, counts, narrative };
}

export function buildWhatChangedRowsV4(domains: RiskDomainV4[]): WhatChangedRowV4[] {
  return domains
    .flatMap((d) =>
      d.changes.map((c, i) => ({
        id: `${d.id}-${i}`,
        text: c.text,
        confidence: c.confidence,
        domainId: d.id,
        domainName: d.name,
        status: d.status,
      })),
    )
    .sort(
      (a, b) =>
        STATUS_RANK[b.status] - STATUS_RANK[a.status] || b.confidence - a.confidence,
    )
    .slice(0, 8);
}

export function getDomainNarrative(domain: RiskDomainV4): string {
  if (domain.id === "fincrime") {
    return "Primary driver of amber: a backlog of periodic KYC refreshes on high-risk customers built up following the 2025 core-banking migration. Sanctions and reporting controls remain green; the exposure is concentrated in CDD currency. A board-approved remediation programme is in flight.";
  }
  return `${domain.name} remains ${domain.status.toLowerCase()} with all key indicators within stated risk appetite. No escalation actions required at this time.`;
}

export const FIRM_POSTURE_V4 = computeFirmPostureV4(RISK_DOMAINS_V4);
export const WHAT_CHANGED_V4 = buildWhatChangedRowsV4(RISK_DOMAINS_V4);

/** @deprecated use CRSA_DATA */
export const CRSA_FINCRIME = CRSA_DATA.fincrime;

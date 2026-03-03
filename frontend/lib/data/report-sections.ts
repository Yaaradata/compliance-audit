import { ReportSection } from "../types";

export const REPORT_SECTIONS: ReportSection[] = [
  { key: "executive_summary", name: "Executive Summary", status: "draft", ai: true },
  { key: "scope_methodology", name: "Scope & Methodology", status: "draft", ai: true },
  { key: "domain_A", name: "Domain A — Network & Architecture", status: "draft", ai: true },
  { key: "domain_B", name: "Domain B — System Hardening & Config", status: "draft", ai: true },
  { key: "domain_C", name: "Domain C — Access Management", status: "draft", ai: true },
  { key: "domain_D", name: "Domain D — Vulnerability & Patch Mgmt", status: "draft", ai: true },
  { key: "domain_E", name: "Domain E — Monitoring & Detection", status: "draft", ai: true },
  { key: "domain_F", name: "Domain F — Third-Party & Outsourcing", status: "draft", ai: true },
  { key: "domain_G", name: "Domain G — Physical Security", status: "draft", ai: true },
  { key: "domain_H", name: "Domain H — Policies & Governance", status: "draft", ai: true },
  { key: "gap_analysis", name: "Gap Analysis", status: "draft", ai: true },
  { key: "attestation", name: "Final Attestation", status: "draft", ai: true },
  { key: "evidence_index", name: "Evidence Index", status: "draft", ai: true },
  { key: "glossary", name: "Glossary", status: "draft", ai: false },
];

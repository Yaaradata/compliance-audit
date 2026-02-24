import { DomainConfig, EvidenceItem, SubGroup } from "../types";

const item = (id: string, order: number, name: string, priority: "CRITICAL"|"HIGH"|"HIGH*"|"MEDIUM", type: string, controls: {id:string;name:string;ma:"M"|"A"|"M+A"}[], description: string, reductionNote: string, flags?: Partial<EvidenceItem>): EvidenceItem => ({
  id, order, name, priority, type, controls, controlCount: controls[0]?.id === "All" ? 32 : controls.length,
  description, inputs: [], sufficiency: [], reductionNote, ...flags,
});

export const DOMAIN_A_ITEMS: EvidenceItem[] = [
  item("A5",1,"Architecture Type Declaration","CRITICAL","Form/Text",[{id:"All",name:"All 32 Controls (Scoping)",ma:"M+A"}],"Foundational scoping document.","Determines applicability of every control."),
  item("A1",2,"Network Architecture Diagram","CRITICAL","Diagram + Text",[{id:"1.1",name:"SWIFT Environment Protection",ma:"M"},{id:"1.4",name:"Restriction of Internet Access",ma:"M"},{id:"1.5",name:"Customer Environment Protection",ma:"M"},{id:"2.1",name:"Internal Data Flow Security",ma:"M"},{id:"2.4A",name:"Back Office Data Flow Security",ma:"A"},{id:"2.5A",name:"External Transmission Data Protection",ma:"A"}],"Highest-reuse diagram. Single upload satisfies 6 controls.","83% reduction — collected 6× without platform."),
  item("A2",3,"SWIFT Component Inventory","CRITICAL","Spreadsheet",[{id:"1.1",name:"SWIFT Environment Protection",ma:"M"},{id:"1.3",name:"Virtualisation/Cloud Protection",ma:"A"},{id:"1.5",name:"Customer Environment Protection",ma:"M"},{id:"2.4A",name:"Back Office Data Flow Security",ma:"A"},{id:"2.8",name:"Outsourced Critical Activity Protection",ma:"M"}],"Complete hardware/software list within SWIFT secure zone.","Single inventory satisfies 5 control areas."),
  item("A4",4,"Firewall Rule Sets","CRITICAL","Config Export",[{id:"1.1",name:"SWIFT Environment Protection",ma:"M"},{id:"1.4",name:"Restriction of Internet Access",ma:"M"},{id:"1.5",name:"Customer Environment Protection",ma:"M"}],"Firewall rule exports for every secure zone boundary.","Single export satisfies 3 mandatory controls."),
  item("A3",5,"Data Flow Diagrams","HIGH","Diagram + Matrix",[{id:"2.1",name:"Internal Data Flow Security",ma:"M"},{id:"2.4A",name:"Back Office Data Flow Security",ma:"A"},{id:"2.5A",name:"External Transmission Data Protection",ma:"A"}],"All data flows between SWIFT, back-office, and external systems.","One diagram covers 3 data flow controls. 67% reduction."),
  item("A6",6,"Secure Zone Design Rationale","HIGH","Document + Form",[{id:"1.1",name:"SWIFT Environment Protection",ma:"M"},{id:"1.5",name:"Customer Environment Protection",ma:"M"}],"Zone boundary placement and segmentation rationale.","Single rationale covers both 1.1 and 1.5. 50% reduction."),
];

export const DOMAIN_B_ITEMS: EvidenceItem[] = [
  item("B1",1,"OS Hardening Configuration","CRITICAL","Config/Screenshots",[{id:"1.2",name:"OS Privileged Account Control",ma:"M"},{id:"2.3",name:"System Hardening",ma:"M"}],"Per-system OS hardening evidence.","50% reduction — serves both 1.2 and 2.3.",{perSystem:true}),
  item("B2",2,"SWIFT Application Security Config","CRITICAL","Config/SG Checklist",[{id:"2.6",name:"Operator Session Confidentiality",ma:"M"},{id:"2.10",name:"Application Hardening",ma:"M"}],"SWIFT application-level settings.","Single config set covers 2.6 and 2.10. 50% reduction."),
  item("B7",3,"MFA Configuration Evidence","CRITICAL","Config Screenshots",[{id:"4.2",name:"Multi-Factor Authentication",ma:"M"}],"Per-access-point MFA evidence.","Control-specific for 4.2.",{perAccessPoint:true}),
  item("B3",4,"Encryption Configuration","HIGH","Config Exports",[{id:"2.1",name:"Internal Data Flow Security",ma:"M"},{id:"2.4A",name:"Back Office Data Flow Security",ma:"A"},{id:"2.5A",name:"External Transmission Data Protection",ma:"A"},{id:"2.6",name:"Operator Session Confidentiality",ma:"M"}],"Highest-reuse in Domain B. 75% reduction.","One encryption config satisfies 4 data security controls."),
  item("B6",5,"Hardening Baseline Comparison","HIGH","Scan Report",[{id:"2.3",name:"System Hardening",ma:"M"},{id:"2.10",name:"Application Hardening",ma:"M"},{id:"6.2",name:"Software Integrity",ma:"M"}],"Formal CIS/SWIFT SG baseline comparison.","67% reduction — covers 3 hardening & integrity controls."),
  item("B5",6,"Password Policy Configuration","HIGH","Policy + Config",[{id:"4.1",name:"Password Policy",ma:"M"}],"Password policy settings across all SWIFT systems.","Control-specific for 4.1."),
  item("B8",7,"Operator Session Security Config","HIGH","Config Exports",[{id:"2.6",name:"Operator Session Confidentiality",ma:"M"}],"Detailed session management evidence.","Supplements B2 for session controls."),
  item("B4",8,"Virtualisation/Cloud Platform Config","HIGH*","Config Exports",[{id:"1.3",name:"Virtualisation/Cloud Protection",ma:"A"}],"Conditional — only if virtualised SWIFT components exist.","Advisory control 1.3.",{conditional:true}),
];

export const DOMAIN_C_ITEMS: EvidenceItem[] = [
  item("C1",1,"Access Control Policy","CRITICAL","Policy Document",[{id:"1.2",name:"OS Privileged Account Control",ma:"M"},{id:"1.3",name:"Virtualisation/Cloud Protection",ma:"A"},{id:"2.6",name:"Operator Session Confidentiality",ma:"M"},{id:"4.2",name:"Multi-Factor Authentication",ma:"M"},{id:"5.1",name:"Logical Access Control",ma:"M"}],"Highest-reuse policy. 80% reduction.","Covers 5 controls across 3 principles."),
  item("C2",2,"Privileged Account Inventory","CRITICAL","Spreadsheet/PAM",[{id:"1.2",name:"OS Privileged Account Control",ma:"M"},{id:"5.1",name:"Logical Access Control",ma:"M"}],"All privileged accounts across SWIFT systems.","50% reduction — serves both 1.2 and 5.1."),
  item("C3",3,"User Access List","HIGH","System Export",[{id:"5.1",name:"Logical Access Control",ma:"M"}],"All user accounts with role assignments.","Control-specific for 5.1."),
  item("C4",4,"RBAC Role Definitions","HIGH","Config/Matrix",[{id:"5.1",name:"Logical Access Control",ma:"M"}],"Formal role definitions with SoD matrix.","Control-specific for 5.1."),
  item("C5",5,"Quarterly Access Review Records","HIGH","Review Docs",[{id:"5.1",name:"Logical Access Control",ma:"M"}],"4 quarterly reviews with management sign-off.","Control-specific for 5.1.",{perQuarter:true}),
  item("C6",6,"Joiner/Mover/Leaver Process","MEDIUM","Process Doc + Logs",[{id:"5.1",name:"Logical Access Control",ma:"M"}],"JML process with execution evidence.","Control-specific for 5.1."),
  item("C7",7,"Token/Certificate Inventory","HIGH","Inventory/PKI",[{id:"5.2",name:"Token Management",ma:"M"}],"All tokens and certificates with lifecycle procedures.","Control-specific for 5.2."),
  item("C8",8,"Credential Storage Evidence","HIGH","Config/Vault",[{id:"5.4",name:"Password Repository Protection",ma:"M"}],"Secure credential storage evidence.","Control-specific for 5.4."),
  item("C9",9,"Personnel Vetting Records","MEDIUM","HR Documentation",[{id:"5.3A",name:"Personnel Vetting Process",ma:"A"}],"Screening and vetting records.","Advisory control 5.3A.",{isAdvisory:true}),
];

export const DOMAIN_D_ITEMS: EvidenceItem[] = [
  item("D1",1,"Patch Management Policy","HIGH","Policy Document",[{id:"2.2",name:"Security Updates",ma:"M"}],"Patch policy covering SWIFT systems.","Control-specific for 2.2."),
  item("D2",2,"Current Patch Levels","CRITICAL","Scan/WSUS Report",[{id:"2.2",name:"Security Updates",ma:"M"}],"Current patch status for all SWIFT systems.","Control-specific for 2.2.",{perSystem:true}),
  item("D3",3,"Patch Deployment Records (12mo)","HIGH","Deployment Logs",[{id:"2.2",name:"Security Updates",ma:"M"}],"12-month patch deployment history.","Control-specific for 2.2.",{hasTimeline:true}),
  item("D4",4,"Vulnerability Scan Reports","CRITICAL","Scanner Output",[{id:"2.7",name:"Vulnerability Scanning",ma:"M"}],"Vulnerability scan results for all SWIFT systems.","Control-specific for 2.7."),
  item("D5",5,"Vulnerability Remediation Tracking","HIGH","Tracking Log",[{id:"2.7",name:"Vulnerability Scanning",ma:"M"},{id:"7.3A",name:"Penetration Testing",ma:"A"}],"Remediation tracker for scans and pen tests.","50% reduction — covers 2.7 and 7.3A."),
  item("D6",6,"Penetration Test Reports","HIGH","Pen Test Report",[{id:"7.3A",name:"Penetration Testing",ma:"A"}],"Annual pen test covering SWIFT infrastructure.","Advisory control 7.3A.",{isAdvisory:true}),
];

export const DOMAIN_E_ITEMS: EvidenceItem[] = [
  item("E1",1,"Anti-Malware Config & Updates","CRITICAL","Config/Console Export",[{id:"6.1",name:"Malware Protection",ma:"M"}],"AV config for all SWIFT Windows systems.","Control-specific for 6.1.",{perSystem:true}),
  item("E4",2,"Software Integrity Verification","HIGH","Integrity/FIM Reports",[{id:"6.2",name:"Software Integrity",ma:"M"},{id:"2.10",name:"Application Hardening",ma:"M"}],"SWIFT software integrity checks.","50% reduction — serves 6.2 and 2.10."),
  item("E5",3,"Database Integrity Evidence","HIGH","Integrity/Audit Logs",[{id:"6.3",name:"Database Integrity",ma:"M"}],"Database integrity controls for SWIFT DBs.","Control-specific for 6.3.",{conditional:true}),
  item("E2",4,"SIEM/Logging Configuration","CRITICAL","SIEM Config Export",[{id:"6.4",name:"Logging and Monitoring",ma:"M"}],"SIEM config, log architecture, retention.","Control-specific for 6.4."),
  item("E3",5,"Alert Rules & Escalation","HIGH","Documentation",[{id:"6.4",name:"Logging and Monitoring",ma:"M"},{id:"6.5A",name:"Intrusion Detection",ma:"A"}],"Alert rules, escalation, response procedures.","50% reduction — covers 6.4 and 6.5A."),
  item("E7",6,"Admin Activity Monitoring Logs","HIGH","Log Extracts/SIEM",[{id:"1.2",name:"OS Privileged Account Control",ma:"M"},{id:"5.4",name:"Password Repository Protection",ma:"M"},{id:"6.4",name:"Logging and Monitoring",ma:"M"}],"Admin/privileged activity monitoring.","67% reduction — serves 3 mandatory controls."),
  item("E6",7,"IDS/IPS Configuration","MEDIUM","Config Export",[{id:"6.5A",name:"Intrusion Detection",ma:"A"}],"IDS/IPS config for SWIFT segments.","Advisory control 6.5A.",{isAdvisory:true}),
];

export const DOMAIN_F_ITEMS: EvidenceItem[] = [
  item("F1",1,"Third-Party Vendor Inventory","CRITICAL","Spreadsheet",[{id:"2.8",name:"Outsourced Critical Activity Protection",ma:"M"}],"All third parties with SWIFT access.","Foundation for all Domain F evidence."),
  item("F2",2,"Third-Party SLA/NDA Agreements","HIGH","Contract Excerpts",[{id:"2.8",name:"Outsourced Critical Activity Protection",ma:"M"}],"SLA and NDA per vendor.","Per-vendor contractual evidence."),
  item("F3",3,"Third-Party Security Assessments","HIGH","Assessment Reports",[{id:"2.8",name:"Outsourced Critical Activity Protection",ma:"M"}],"Risk assessments per vendor.","Per-vendor risk assessment evidence."),
  item("F4",4,"Third-Party Ongoing Monitoring","HIGH","SOC Reports/Audits",[{id:"2.8",name:"Outsourced Critical Activity Protection",ma:"M"}],"SOC reports, certification tracking, incident history.","Per-vendor ongoing monitoring evidence."),
];

export const DOMAIN_G_ITEMS: EvidenceItem[] = [
  item("G1",1,"Physical Access Controls","HIGH","Access System Config",[{id:"3.1",name:"Physical Security",ma:"M"}],"Physical access controls for SWIFT equipment areas.","Per-zone evidence.",{perZone:true}),
  item("G2",2,"Physical Access Logs (12mo)","HIGH","Access Logs",[{id:"3.1",name:"Physical Security",ma:"M"}],"12-month physical access logs.","Per-zone time-series evidence.",{perZone:true}),
  item("G3",3,"Video Surveillance Evidence","MEDIUM","Surveillance Config",[{id:"3.1",name:"Physical Security",ma:"M"}],"Camera placement, recording, retention.","Per-zone environmental monitoring.",{perZone:true}),
  item("G4",4,"Equipment Disposal Evidence","MEDIUM","Disposal Records",[{id:"3.1",name:"Physical Security",ma:"M"}],"Secure disposal/sanitization procedures.","Equipment lifecycle evidence."),
];

export const DOMAIN_H_ITEMS: EvidenceItem[] = [
  item("H1",1,"Cyber Incident Response Plan","CRITICAL","IR Plan/Runbook",[{id:"7.1",name:"Cyber Incident Response Planning",ma:"M"}],"IR plan with SWIFT-specific scenarios.","Foundation for IR evidence."),
  item("H2",2,"IR Exercise Records","HIGH","Exercise Records",[{id:"7.1",name:"Cyber Incident Response Planning",ma:"M"}],"Tabletop/functional exercise records.","Validates H1 plan effectiveness."),
  item("H3",3,"SWIFT ISAC Participation","MEDIUM","Registration/Alerts",[{id:"7.1",name:"Cyber Incident Response Planning",ma:"M"}],"ISAC registration and alert acknowledgments.","Information sharing compliance."),
  item("H4",4,"Security Training Program","HIGH","Program Document",[{id:"7.2",name:"Security Training & Awareness",ma:"M"}],"SWIFT security awareness training program.","Foundation for training evidence."),
  item("H5",5,"Training Completion Records","HIGH","LMS Export",[{id:"7.2",name:"Security Training & Awareness",ma:"M"}],"Training completions for all SWIFT personnel.","Execution evidence for H4."),
  item("H6",6,"Transaction Control Procedures","HIGH","Process Docs",[{id:"2.9",name:"Transaction Business Controls",ma:"M"}],"Transaction verification, dual auth, reconciliation.","Business control procedures."),
  item("H7",7,"Transaction Monitoring Config","HIGH","System Config",[{id:"2.9",name:"Transaction Business Controls",ma:"M"}],"Monitoring rules, thresholds, alert samples.","Technical implementation of H6."),
  item("H8",8,"RMA Management Procedures","MEDIUM","Process Doc/Records",[{id:"2.11A",name:"RMA Business Controls",ma:"A"}],"RMA due diligence and annual review.","Advisory control 2.11A.",{isAdvisory:true}),
  item("H9",9,"Risk Assessment & Register","MEDIUM","Risk Docs/Register",[{id:"7.4A",name:"Scenario Risk Assessment",ma:"A"}],"SWIFT risk assessment and risk register.","Advisory control 7.4A.",{isAdvisory:true}),
];

export const ALL_EVIDENCE_ITEMS: EvidenceItem[] = [
  ...DOMAIN_A_ITEMS, ...DOMAIN_B_ITEMS, ...DOMAIN_C_ITEMS, ...DOMAIN_D_ITEMS,
  ...DOMAIN_E_ITEMS, ...DOMAIN_F_ITEMS, ...DOMAIN_G_ITEMS, ...DOMAIN_H_ITEMS,
];

const SUB_GROUPS_A: SubGroup[] = [
  { name: "Scoping & Architecture", color: "#0F4C75", items: ["A5","A1","A2"] },
  { name: "Zone Protection", color: "#1B6FA0", items: ["A4","A6"] },
  { name: "Data Flows", color: "#3498db", items: ["A3"] },
];
const SUB_GROUPS_B: SubGroup[] = [
  { name: "Hardening & Baselines", color: "#4f46e5", items: ["B1","B2","B6"] },
  { name: "Encryption & Sessions", color: "#0e7490", items: ["B3","B8"] },
  { name: "Credential Protection", color: "#b45309", items: ["B5","B7"] },
  { name: "Platform (Conditional)", color: "#64748b", items: ["B4"] },
];
const SUB_GROUPS_C: SubGroup[] = [
  { name: "Access Policy", color: "#7c3aed", items: ["C1"] },
  { name: "Identity & Access Lifecycle", color: "#0369a1", items: ["C2","C3","C4","C5","C6"] },
  { name: "Token & Credential Security", color: "#0f766e", items: ["C7","C8"] },
  { name: "Personnel Security", color: "#9333ea", items: ["C9"] },
];
const SUB_GROUPS_D: SubGroup[] = [
  { name: "Patch Management", color: "#0369a1", items: ["D1","D2","D3"] },
  { name: "Vulnerability Management", color: "#b45309", items: ["D4","D5"] },
  { name: "Penetration Testing", color: "#7c3aed", items: ["D6"] },
];
const SUB_GROUPS_E: SubGroup[] = [
  { name: "Malware & Integrity", color: "#059669", items: ["E1","E4","E5"] },
  { name: "Monitoring & Logging", color: "#0369a1", items: ["E2","E3","E7"] },
  { name: "Intrusion Detection", color: "#7c3aed", items: ["E6"] },
];
const SUB_GROUPS_F: SubGroup[] = [
  { name: "Vendor Management", color: "#1565C0", items: ["F1","F2","F3","F4"] },
];
const SUB_GROUPS_G: SubGroup[] = [
  { name: "Access Security", color: "#be123c", items: ["G1","G2"] },
  { name: "Environment & Lifecycle", color: "#7c3aed", items: ["G3","G4"] },
];
const SUB_GROUPS_H: SubGroup[] = [
  { name: "Incident Response", color: "#0891b2", items: ["H1","H2","H3"] },
  { name: "Security Training", color: "#7c3aed", items: ["H4","H5"] },
  { name: "Transaction Controls", color: "#059669", items: ["H6","H7"] },
  { name: "Business Governance", color: "#64748b", items: ["H8","H9"] },
];

export const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  A: { id:"A", name:"Network & Architecture", color:"#0F4C75", gradient:"linear-gradient(135deg,#0F4C75,#1B6FA0)", accentColor:"#BBE1FA", evidenceItems: DOMAIN_A_ITEMS, allControls:["1.1","1.3","1.4","1.5","2.1","2.4A","2.5A"], subGroups: SUB_GROUPS_A, weights:{} },
  B: { id:"B", name:"System Hardening & Config", color:"#1B5E20", gradient:"linear-gradient(135deg,#1B5E20,#388E3C)", accentColor:"#C8E6C9", evidenceItems: DOMAIN_B_ITEMS, allControls:["1.2","1.3","2.1","2.3","2.4A","2.5A","2.6","2.10","4.1","4.2","6.2"], subGroups: SUB_GROUPS_B, weights:{} },
  C: { id:"C", name:"Access Management", color:"#E65100", gradient:"linear-gradient(135deg,#E65100,#FB8C00)", accentColor:"#FFE0B2", evidenceItems: DOMAIN_C_ITEMS, allControls:["1.2","1.3","2.6","4.2","5.1","5.2","5.3A","5.4"], subGroups: SUB_GROUPS_C, weights:{} },
  D: { id:"D", name:"Vulnerability & Patch Mgmt", color:"#B71C1C", gradient:"linear-gradient(135deg,#B71C1C,#E53935)", accentColor:"#FFCDD2", evidenceItems: DOMAIN_D_ITEMS, allControls:["2.2","2.7","7.3A"], subGroups: SUB_GROUPS_D, weights:{} },
  E: { id:"E", name:"Monitoring & Detection", color:"#4A148C", gradient:"linear-gradient(135deg,#4A148C,#7B1FA2)", accentColor:"#E1BEE7", evidenceItems: DOMAIN_E_ITEMS, allControls:["1.2","2.10","5.4","6.1","6.2","6.3","6.4","6.5A"], subGroups: SUB_GROUPS_E, weights:{} },
  F: { id:"F", name:"Third-Party & Outsourcing", color:"#1565C0", gradient:"linear-gradient(135deg,#1565C0,#1E88E5)", accentColor:"#BBDEFB", evidenceItems: DOMAIN_F_ITEMS, allControls:["2.8"], subGroups: SUB_GROUPS_F, weights:{} },
  G: { id:"G", name:"Physical Security", color:"#F57F17", gradient:"linear-gradient(135deg,#F57F17,#FFB300)", accentColor:"#FFF9C4", evidenceItems: DOMAIN_G_ITEMS, allControls:["3.1"], subGroups: SUB_GROUPS_G, weights:{} },
  H: { id:"H", name:"Policies & Governance", color:"#BF360C", gradient:"linear-gradient(135deg,#BF360C,#E64A19)", accentColor:"#FFCCBC", evidenceItems: DOMAIN_H_ITEMS, allControls:["2.9","2.11A","7.1","7.2","7.4A"], subGroups: SUB_GROUPS_H, weights:{} },
};

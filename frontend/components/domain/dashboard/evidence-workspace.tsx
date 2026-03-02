"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ControlBadge } from "@/components/ui/control-badge";
import { PriorityBadge } from "@/components/ui/badge";
import { CompactDropzone } from "@/components/domain/compact-dropzone";
import { PerControlEvidence } from "@/components/domain/per-control-evidence";
import { EvidenceCriteriaSections } from "@/components/domain/evidence-criteria-sections";
import { SufficiencyPanel } from "@/components/domain/sufficiency-panel";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";
import { EvaluationResults } from "@/components/domain/evaluation-results";
import { cn } from "@/lib/utils";

import { A1IntakeForm } from "@/components/domain/a1-intake-form";
import { A1_DIAGRAM_DERIVED_CHECKS, A1_EVIDENCE_ITEM_ID } from "@/lib/data/a1-evidence";
import { A5_EVIDENCE_ITEM_ID, A5_FORM_KEYS } from "@/lib/data/a5-criteria";
import { A5IntakeForm } from "@/components/domain/a5-intake-form";
import { A2IntakeForm } from "@/components/domain/a2-intake-form";
import { A2_EVIDENCE_ITEM_ID, A2_DIAGRAM_CROSS_CHECKS } from "@/lib/data/a2-evidence";
import { A3IntakeForm } from "@/components/domain/a3-intake-form";
import { A3_EVIDENCE_ITEM_ID, A3_DIAGRAM_CHECKS } from "@/lib/data/a3-evidence";
import { A4IntakeForm } from "@/components/domain/a4-intake-form";
import { A4_EVIDENCE_ITEM_ID, A4_UPLOAD_GUIDANCE } from "@/lib/data/a4-evidence";
import { A6IntakeForm } from "@/components/domain/a6-intake-form";
import { A6_EVIDENCE_ITEM_ID, A6_DOCUMENT_GUIDANCE } from "@/lib/data/a6-evidence";

import { B1IntakeForm } from "@/components/domain/b1-intake-form";
import { B1_EVIDENCE_ITEM_ID, B1_CONFIG_CHECKS } from "@/lib/data/b1-evidence";
import { B2IntakeForm } from "@/components/domain/b2-intake-form";
import { B2_EVIDENCE_ITEM_ID, B2_CONFIG_CHECKS } from "@/lib/data/b2-evidence";
import { B3IntakeForm } from "@/components/domain/b3-intake-form";
import { B3_EVIDENCE_ITEM_ID, B3_CONFIG_CHECKS } from "@/lib/data/b3-evidence";
import { B4IntakeForm } from "@/components/domain/b4-intake-form";
import { B4_EVIDENCE_ITEM_ID, B4_CONFIG_CHECKS } from "@/lib/data/b4-evidence";
import { B5IntakeForm } from "@/components/domain/b5-intake-form";
import { B5_EVIDENCE_ITEM_ID, B5_CONFIG_CHECKS } from "@/lib/data/b5-evidence";
import { B6IntakeForm } from "@/components/domain/b6-intake-form";
import { B6_EVIDENCE_ITEM_ID, B6_UPLOAD_GUIDANCE } from "@/lib/data/b6-evidence";
import { B7IntakeForm } from "@/components/domain/b7-intake-form";
import { B7_EVIDENCE_ITEM_ID, B7_CONFIG_CHECKS } from "@/lib/data/b7-evidence";
import { B8IntakeForm } from "@/components/domain/b8-intake-form";
import { B8_EVIDENCE_ITEM_ID, B8_CONFIG_CHECKS } from "@/lib/data/b8-evidence";

import { GenericIntakeForm } from "@/components/domain/generic-intake-form";
import type { FieldDef } from "@/components/domain/generic-intake-form";
import { C1_EVIDENCE_ITEM_ID, C1_UPLOAD_GUIDANCE, C1_FIELDS } from "@/lib/data/c1-evidence";
import { C2_EVIDENCE_ITEM_ID, C2_UPLOAD_GUIDANCE, C2_FIELDS } from "@/lib/data/c2-evidence";
import { C3_EVIDENCE_ITEM_ID, C3_UPLOAD_GUIDANCE, C3_FIELDS } from "@/lib/data/c3-evidence";
import { C4_EVIDENCE_ITEM_ID, C4_UPLOAD_GUIDANCE, C4_FIELDS } from "@/lib/data/c4-evidence";
import { C5_EVIDENCE_ITEM_ID, C5_UPLOAD_GUIDANCE, C5_FIELDS } from "@/lib/data/c5-evidence";
import { C6_EVIDENCE_ITEM_ID, C6_UPLOAD_GUIDANCE, C6_FIELDS } from "@/lib/data/c6-evidence";
import { C7_EVIDENCE_ITEM_ID, C7_UPLOAD_GUIDANCE, C7_FIELDS } from "@/lib/data/c7-evidence";
import { C8_EVIDENCE_ITEM_ID, C8_UPLOAD_GUIDANCE, C8_FIELDS } from "@/lib/data/c8-evidence";
import { C9_EVIDENCE_ITEM_ID, C9_UPLOAD_GUIDANCE, C9_FIELDS } from "@/lib/data/c9-evidence";
import { D1_EVIDENCE_ITEM_ID, D1_UPLOAD_GUIDANCE, D1_FIELDS } from "@/lib/data/d1-evidence";
import { D2_EVIDENCE_ITEM_ID, D2_UPLOAD_GUIDANCE, D2_FIELDS } from "@/lib/data/d2-evidence";
import { D3_EVIDENCE_ITEM_ID, D3_UPLOAD_GUIDANCE, D3_FIELDS } from "@/lib/data/d3-evidence";
import { D4_EVIDENCE_ITEM_ID, D4_UPLOAD_GUIDANCE, D4_FIELDS } from "@/lib/data/d4-evidence";
import { D5_EVIDENCE_ITEM_ID, D5_UPLOAD_GUIDANCE, D5_FIELDS } from "@/lib/data/d5-evidence";
import { D6_EVIDENCE_ITEM_ID, D6_UPLOAD_GUIDANCE, D6_FIELDS } from "@/lib/data/d6-evidence";
import { E1_EVIDENCE_ITEM_ID, E1_UPLOAD_GUIDANCE, E1_FIELDS } from "@/lib/data/e1-evidence";
import { E2_EVIDENCE_ITEM_ID, E2_UPLOAD_GUIDANCE, E2_FIELDS } from "@/lib/data/e2-evidence";
import { E3_EVIDENCE_ITEM_ID, E3_UPLOAD_GUIDANCE, E3_FIELDS } from "@/lib/data/e3-evidence";
import { E4_EVIDENCE_ITEM_ID, E4_UPLOAD_GUIDANCE, E4_FIELDS } from "@/lib/data/e4-evidence";
import { E5_EVIDENCE_ITEM_ID, E5_UPLOAD_GUIDANCE, E5_FIELDS } from "@/lib/data/e5-evidence";
import { E6_EVIDENCE_ITEM_ID, E6_UPLOAD_GUIDANCE, E6_FIELDS } from "@/lib/data/e6-evidence";
import { E7_EVIDENCE_ITEM_ID, E7_UPLOAD_GUIDANCE, E7_FIELDS } from "@/lib/data/e7-evidence";
import { F1_EVIDENCE_ITEM_ID, F1_UPLOAD_GUIDANCE, F1_FIELDS } from "@/lib/data/f1-evidence";
import { F2_EVIDENCE_ITEM_ID, F2_UPLOAD_GUIDANCE, F2_FIELDS } from "@/lib/data/f2-evidence";
import { F3_EVIDENCE_ITEM_ID, F3_UPLOAD_GUIDANCE, F3_FIELDS } from "@/lib/data/f3-evidence";
import { F4_EVIDENCE_ITEM_ID, F4_UPLOAD_GUIDANCE, F4_FIELDS } from "@/lib/data/f4-evidence";
import { G1_EVIDENCE_ITEM_ID, G1_UPLOAD_GUIDANCE, G1_FIELDS } from "@/lib/data/g1-evidence";
import { G2_EVIDENCE_ITEM_ID, G2_UPLOAD_GUIDANCE, G2_FIELDS } from "@/lib/data/g2-evidence";
import { G3_EVIDENCE_ITEM_ID, G3_UPLOAD_GUIDANCE, G3_FIELDS } from "@/lib/data/g3-evidence";
import { G4_EVIDENCE_ITEM_ID, G4_UPLOAD_GUIDANCE, G4_FIELDS } from "@/lib/data/g4-evidence";
import { H1_EVIDENCE_ITEM_ID, H1_UPLOAD_GUIDANCE, H1_FIELDS } from "@/lib/data/h1-evidence";
import { H2_EVIDENCE_ITEM_ID, H2_UPLOAD_GUIDANCE, H2_FIELDS } from "@/lib/data/h2-evidence";
import { H3_EVIDENCE_ITEM_ID, H3_UPLOAD_GUIDANCE, H3_FIELDS } from "@/lib/data/h3-evidence";
import { H4_EVIDENCE_ITEM_ID, H4_UPLOAD_GUIDANCE, H4_FIELDS } from "@/lib/data/h4-evidence";
import { H5_EVIDENCE_ITEM_ID, H5_UPLOAD_GUIDANCE, H5_FIELDS } from "@/lib/data/h5-evidence";
import { H6_EVIDENCE_ITEM_ID, H6_UPLOAD_GUIDANCE, H6_FIELDS } from "@/lib/data/h6-evidence";
import { H7_EVIDENCE_ITEM_ID, H7_UPLOAD_GUIDANCE, H7_FIELDS } from "@/lib/data/h7-evidence";
import { H8_EVIDENCE_ITEM_ID, H8_UPLOAD_GUIDANCE, H8_FIELDS } from "@/lib/data/h8-evidence";
import { H9_EVIDENCE_ITEM_ID, H9_UPLOAD_GUIDANCE, H9_FIELDS } from "@/lib/data/h9-evidence";

import { getArchitecture, getArchitectureDiagramUrl } from "@/lib/data/architectures";

interface GenericEvidenceDef {
  uploadTitle: string;
  uploadDesc: string;
  uploadLabel: string;
  guidanceTitle: string;
  guidance: { id: string; label: string }[];
  formTitle: string;
  formDesc: string;
  fields: FieldDef[];
}

const GENERIC_EVIDENCE_MAP: Record<string, GenericEvidenceDef> = {
  [C1_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload access control policy", uploadDesc: "Upload the organization's access control policy covering SWIFT infrastructure.", uploadLabel: "Drop policy document or click to upload", guidanceTitle: "AI will verify from uploaded policy", guidance: C1_UPLOAD_GUIDANCE, formTitle: "Policy confirmations", formDesc: "Confirm key policy elements.", fields: C1_FIELDS },
  [C2_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload privileged account inventory", uploadDesc: "Upload spreadsheet/PAM export of all privileged accounts across SWIFT systems.", uploadLabel: "Drop inventory spreadsheet or click to upload", guidanceTitle: "AI will verify from uploaded inventory", guidance: C2_UPLOAD_GUIDANCE, formTitle: "Inventory confirmations", formDesc: "Confirm inventory completeness and review status.", fields: C2_FIELDS },
  [C3_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload user access list", uploadDesc: "Upload system export of all user accounts with role assignments.", uploadLabel: "Drop user access export or click to upload", guidanceTitle: "AI will verify from uploaded list", guidance: C3_UPLOAD_GUIDANCE, formTitle: "Access list confirmations", formDesc: "Confirm alignment with RBAC and account hygiene.", fields: C3_FIELDS },
  [C4_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload RBAC role definitions", uploadDesc: "Upload role definition matrix showing permissions and separation of duties.", uploadLabel: "Drop role matrix or click to upload", guidanceTitle: "AI will verify from uploaded matrix", guidance: C4_UPLOAD_GUIDANCE, formTitle: "RBAC confirmations", formDesc: "Confirm role enforcement and separation of duties.", fields: C4_FIELDS },
  [C5_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload quarterly access review records", uploadDesc: "Upload review records, findings, and management sign-offs for the past 12 months.", uploadLabel: "Drop review records or click to upload", guidanceTitle: "AI will verify from uploaded records", guidance: C5_UPLOAD_GUIDANCE, formTitle: "Review confirmations", formDesc: "Confirm review frequency and remediation.", fields: C5_FIELDS },
  [C6_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload JML process documentation & logs", uploadDesc: "Upload documented JML process and sample execution evidence.", uploadLabel: "Drop JML docs/logs or click to upload", guidanceTitle: "AI will verify from uploaded docs", guidance: C6_UPLOAD_GUIDANCE, formTitle: "JML process confirmations", formDesc: "Confirm process execution and coverage.", fields: C6_FIELDS },
  [C7_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload token/certificate inventory", uploadDesc: "Upload inventory of hardware/software tokens and certificates with lifecycle records.", uploadLabel: "Drop inventory or click to upload", guidanceTitle: "AI will verify from uploaded inventory", guidance: C7_UPLOAD_GUIDANCE, formTitle: "Token management confirmations", formDesc: "Confirm lifecycle management status.", fields: C7_FIELDS },
  [C8_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload credential storage evidence", uploadDesc: "Upload vault configuration, encryption settings, and access log evidence.", uploadLabel: "Drop config/vault evidence or click to upload", guidanceTitle: "AI will verify from uploaded evidence", guidance: C8_UPLOAD_GUIDANCE, formTitle: "Credential storage confirmations", formDesc: "Confirm secure storage and access controls.", fields: C8_FIELDS },
  [C9_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload personnel vetting records", uploadDesc: "Upload screening policy and background check evidence for SWIFT operators.", uploadLabel: "Drop HR documentation or click to upload", guidanceTitle: "AI will verify from uploaded records", guidance: C9_UPLOAD_GUIDANCE, formTitle: "Vetting confirmations", formDesc: "Confirm screening coverage and process.", fields: C9_FIELDS },
  [D1_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload patch management policy", uploadDesc: "Upload the documented patch management policy for SWIFT systems.", uploadLabel: "Drop policy document or click to upload", guidanceTitle: "AI will verify from uploaded policy", guidance: D1_UPLOAD_GUIDANCE, formTitle: "Patch policy confirmations", formDesc: "Confirm key policy elements.", fields: D1_FIELDS },
  [D2_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload current patch level reports", uploadDesc: "Upload scan/WSUS reports showing current patch status for all SWIFT systems.", uploadLabel: "Drop scan reports or click to upload", guidanceTitle: "AI will verify from uploaded reports", guidance: D2_UPLOAD_GUIDANCE, formTitle: "Patch level confirmations", formDesc: "Confirm scan coverage and findings.", fields: D2_FIELDS },
  [D3_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload patch deployment records (12 months)", uploadDesc: "Upload deployment logs showing patching cadence over the past 12 months.", uploadLabel: "Drop deployment logs or click to upload", guidanceTitle: "AI will verify from uploaded logs", guidance: D3_UPLOAD_GUIDANCE, formTitle: "Deployment record confirmations", formDesc: "Confirm patching cadence and coverage.", fields: D3_FIELDS },
  [D4_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload vulnerability scan reports", uploadDesc: "Upload vulnerability scanner output for all SWIFT systems from the most recent quarter.", uploadLabel: "Drop scanner output or click to upload", guidanceTitle: "AI will verify from uploaded reports", guidance: D4_UPLOAD_GUIDANCE, formTitle: "Scan report confirmations", formDesc: "Confirm scan scope and findings.", fields: D4_FIELDS },
  [D5_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload vulnerability remediation tracking", uploadDesc: "Upload the tracking log for all identified vulnerabilities with resolution status.", uploadLabel: "Drop tracking log or click to upload", guidanceTitle: "AI will verify from uploaded log", guidance: D5_UPLOAD_GUIDANCE, formTitle: "Remediation tracking confirmations", formDesc: "Confirm tracking completeness and timeliness.", fields: D5_FIELDS },
  [D6_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload penetration test reports", uploadDesc: "Upload pen test reports covering SWIFT infrastructure scope.", uploadLabel: "Drop pen test reports or click to upload", guidanceTitle: "AI will verify from uploaded reports", guidance: D6_UPLOAD_GUIDANCE, formTitle: "Pen test confirmations", formDesc: "Confirm scope, methodology, and findings.", fields: D6_FIELDS },
  [E1_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload anti-malware config & update evidence", uploadDesc: "Upload AV console exports showing product, definitions, scan schedules for each SWIFT system.", uploadLabel: "Drop AV config exports or click to upload", guidanceTitle: "AI will verify from uploaded configs", guidance: E1_UPLOAD_GUIDANCE, formTitle: "Anti-malware confirmations", formDesc: "Confirm coverage and configuration.", fields: E1_FIELDS },
  [E2_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload SIEM/logging configuration", uploadDesc: "Upload SIEM config showing log sources, event types, retention, and integrity settings.", uploadLabel: "Drop SIEM config or click to upload", guidanceTitle: "AI will verify from uploaded config", guidance: E2_UPLOAD_GUIDANCE, formTitle: "Logging confirmations", formDesc: "Confirm log coverage and retention.", fields: E2_FIELDS },
  [E3_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload alert rules & escalation docs", uploadDesc: "Upload alert rule definitions, escalation matrix, and response procedures.", uploadLabel: "Drop alert docs or click to upload", guidanceTitle: "AI will verify from uploaded docs", guidance: E3_UPLOAD_GUIDANCE, formTitle: "Alert & escalation confirmations", formDesc: "Confirm alert coverage and response readiness.", fields: E3_FIELDS },
  [E4_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload software integrity verification reports", uploadDesc: "Upload FIM/integrity check reports, baselines, and authorized software lists.", uploadLabel: "Drop integrity reports or click to upload", guidanceTitle: "AI will verify from uploaded reports", guidance: E4_UPLOAD_GUIDANCE, formTitle: "Integrity verification confirmations", formDesc: "Confirm integrity checking and change detection.", fields: E4_FIELDS },
  [E5_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload database integrity evidence", uploadDesc: "Upload database audit logs, integrity verification, and access control evidence.", uploadLabel: "Drop DB integrity evidence or click to upload", guidanceTitle: "AI will verify from uploaded evidence", guidance: E5_UPLOAD_GUIDANCE, formTitle: "Database integrity confirmations", formDesc: "Confirm integrity controls and access restrictions.", fields: E5_FIELDS },
  [E6_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload IDS/IPS configuration", uploadDesc: "Upload IDS/IPS configuration for SWIFT network segments.", uploadLabel: "Drop IDS/IPS config or click to upload", guidanceTitle: "AI will verify from uploaded config", guidance: E6_UPLOAD_GUIDANCE, formTitle: "IDS/IPS confirmations", formDesc: "Confirm deployment and integration.", fields: E6_FIELDS },
  [E7_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload admin activity monitoring logs", uploadDesc: "Upload log extracts/SIEM reports showing admin activity monitoring.", uploadLabel: "Drop admin logs or click to upload", guidanceTitle: "AI will verify from uploaded logs", guidance: E7_UPLOAD_GUIDANCE, formTitle: "Admin monitoring confirmations", formDesc: "Confirm monitoring coverage.", fields: E7_FIELDS },
  [F1_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload third-party vendor inventory", uploadDesc: "Upload complete inventory of all third parties with SWIFT access.", uploadLabel: "Drop vendor inventory or click to upload", guidanceTitle: "AI will verify from uploaded inventory", guidance: F1_UPLOAD_GUIDANCE, formTitle: "Vendor inventory confirmations", formDesc: "Confirm vendor identification and classification.", fields: F1_FIELDS },
  [F2_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload SLA/NDA agreements", uploadDesc: "Upload SLA and NDA excerpts for each third party managing SWIFT components.", uploadLabel: "Drop contract excerpts or click to upload", guidanceTitle: "AI will verify from uploaded agreements", guidance: F2_UPLOAD_GUIDANCE, formTitle: "Agreement confirmations", formDesc: "Confirm SLA/NDA coverage.", fields: F2_FIELDS },
  [F3_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload third-party security assessments", uploadDesc: "Upload risk assessments and certification evidence for each vendor.", uploadLabel: "Drop assessment reports or click to upload", guidanceTitle: "AI will verify from uploaded assessments", guidance: F3_UPLOAD_GUIDANCE, formTitle: "Assessment confirmations", formDesc: "Confirm assessment coverage and currency.", fields: F3_FIELDS },
  [F4_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload ongoing monitoring evidence", uploadDesc: "Upload current SOC reports, audit findings, and certification renewals.", uploadLabel: "Drop SOC reports/audits or click to upload", guidanceTitle: "AI will verify from uploaded reports", guidance: F4_UPLOAD_GUIDANCE, formTitle: "Monitoring confirmations", formDesc: "Confirm ongoing vendor monitoring.", fields: F4_FIELDS },
  [G1_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload physical access control evidence", uploadDesc: "Upload access control system config, authorized personnel lists, and visitor logs.", uploadLabel: "Drop access control evidence or click to upload", guidanceTitle: "AI will verify from uploaded evidence", guidance: G1_UPLOAD_GUIDANCE, formTitle: "Physical access confirmations", formDesc: "Confirm access controls and review status.", fields: G1_FIELDS },
  [G2_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload physical access logs (12 months)", uploadDesc: "Upload physical access logs covering at least 12 months for SWIFT equipment areas.", uploadLabel: "Drop access logs or click to upload", guidanceTitle: "AI will verify from uploaded logs", guidance: G2_UPLOAD_GUIDANCE, formTitle: "Access log confirmations", formDesc: "Confirm log retention and coverage.", fields: G2_FIELDS },
  [G3_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload video surveillance evidence", uploadDesc: "Upload surveillance system config and camera placement documentation.", uploadLabel: "Drop surveillance evidence or click to upload", guidanceTitle: "AI will verify from uploaded evidence", guidance: G3_UPLOAD_GUIDANCE, formTitle: "Surveillance confirmations", formDesc: "Confirm camera coverage and retention.", fields: G3_FIELDS },
  [G4_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload equipment disposal evidence", uploadDesc: "Upload disposal/sanitization records and destruction certificates.", uploadLabel: "Drop disposal records or click to upload", guidanceTitle: "AI will verify from uploaded records", guidance: G4_UPLOAD_GUIDANCE, formTitle: "Disposal confirmations", formDesc: "Confirm disposal process and certification.", fields: G4_FIELDS },
  [H1_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload cyber incident response plan", uploadDesc: "Upload the IR plan/runbook covering SWIFT-specific scenarios.", uploadLabel: "Drop IR plan or click to upload", guidanceTitle: "AI will verify from uploaded plan", guidance: H1_UPLOAD_GUIDANCE, formTitle: "IR plan confirmations", formDesc: "Confirm plan coverage and currency.", fields: H1_FIELDS },
  [H2_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload IR exercise records", uploadDesc: "Upload exercise records including scenarios, findings, and improvements.", uploadLabel: "Drop exercise records or click to upload", guidanceTitle: "AI will verify from uploaded records", guidance: H2_UPLOAD_GUIDANCE, formTitle: "Exercise confirmations", formDesc: "Confirm exercise coverage and follow-up.", fields: H2_FIELDS },
  [H3_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload SWIFT ISAC participation evidence", uploadDesc: "Upload registration confirmation, alert receipts, and action records.", uploadLabel: "Drop ISAC evidence or click to upload", guidanceTitle: "AI will verify from uploaded evidence", guidance: H3_UPLOAD_GUIDANCE, formTitle: "ISAC participation confirmations", formDesc: "Confirm active participation.", fields: H3_FIELDS },
  [H4_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload security training program", uploadDesc: "Upload training program document with curriculum and schedules.", uploadLabel: "Drop training program or click to upload", guidanceTitle: "AI will verify from uploaded program", guidance: H4_UPLOAD_GUIDANCE, formTitle: "Training program confirmations", formDesc: "Confirm program scope and content.", fields: H4_FIELDS },
  [H5_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload training completion records", uploadDesc: "Upload LMS export showing completion records for all SWIFT personnel.", uploadLabel: "Drop completion records or click to upload", guidanceTitle: "AI will verify from uploaded records", guidance: H5_UPLOAD_GUIDANCE, formTitle: "Completion confirmations", formDesc: "Confirm completion rates and follow-up.", fields: H5_FIELDS },
  [H6_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload transaction control procedures", uploadDesc: "Upload documented transaction verification, dual auth, and reconciliation procedures.", uploadLabel: "Drop procedure docs or click to upload", guidanceTitle: "AI will verify from uploaded docs", guidance: H6_UPLOAD_GUIDANCE, formTitle: "Transaction control confirmations", formDesc: "Confirm control coverage.", fields: H6_FIELDS },
  [H7_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload transaction monitoring config", uploadDesc: "Upload monitoring rules, threshold definitions, and reconciliation records.", uploadLabel: "Drop monitoring config or click to upload", guidanceTitle: "AI will verify from uploaded config", guidance: H7_UPLOAD_GUIDANCE, formTitle: "Monitoring config confirmations", formDesc: "Confirm rule configuration and execution.", fields: H7_FIELDS },
  [H8_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload RMA management procedures", uploadDesc: "Upload RMA management docs, due diligence records, and authorization list.", uploadLabel: "Drop RMA docs or click to upload", guidanceTitle: "AI will verify from uploaded docs", guidance: H8_UPLOAD_GUIDANCE, formTitle: "RMA management confirmations", formDesc: "Confirm procedures and review status.", fields: H8_FIELDS },
  [H9_EVIDENCE_ITEM_ID]: { uploadTitle: "Upload risk assessment & register", uploadDesc: "Upload risk assessment methodology, risk register, and treatment decisions.", uploadLabel: "Drop risk docs or click to upload", guidanceTitle: "AI will verify from uploaded docs", guidance: H9_UPLOAD_GUIDANCE, formTitle: "Risk assessment confirmations", formDesc: "Confirm methodology and management acceptance.", fields: H9_FIELDS },
};
import type { EvidenceItem, DomainConfig, AiCriterionResult } from "@/lib/types";
import type { AiEvaluationResult as AiEvalResultType } from "@/lib/types";
import type { EvaluationEditsMap } from "@/components/domain/ai-evaluation-result";

const ALL_32_CONTROL_ID = "All";

function getControlStatusColor(
  controlId: string,
  sufficiencyResults: AiCriterionResult[] | null | undefined,
  criteriaResults: AiCriterionResult[] | null | undefined,
): "white" | "green" | "orange" | "red" {
  const prefix = `${controlId}_`;
  const relevant = [
    ...(sufficiencyResults ?? []).filter((r) => r.id.startsWith(prefix) || r.id === controlId),
    ...(criteriaResults ?? []).filter((r) => r.id.startsWith(prefix) || r.id === controlId),
  ];
  if (relevant.length === 0) return "white";
  const met = relevant.filter((r) => r.met).length;
  const ratio = met / relevant.length;
  if (ratio >= 1) return "green";
  if (ratio >= 0.5) return "orange";
  return "red";
}

/* ---------- shared sub-components ---------- */

interface CommonFormProps {
  formData: Record<string, string>;
  onFormChange: (key: string, value: string) => void;
  onFormBlur?: () => void;
  submissionId: string | null;
  onUploadComplete: () => void;
  onEnsureSubmission: (itemId: string) => Promise<string | null>;
  itemId: string;
}
  
function GuidanceList({ id, title, items }: { id: string; title: string; items: { id: string; label: string }[] }) {
  return (
    <section className="rounded-xl border border-(--border) bg-background p-4" aria-labelledby={id}>
      <h2 id={id} className="text-xs font-semibold text-foreground mb-2">{title}</h2>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="text-[11px] text-(--foreground-muted)">
            <span className="font-semibold text-foreground mr-1">{item.id}.</span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function UploadSection({ id, title, description, label, submissionId, onUploadComplete, onEnsureSubmission, itemId }: {
  id: string; title: string; description?: string; label: string;
  submissionId: string | null; onUploadComplete: () => void; onEnsureSubmission: (itemId: string) => Promise<string | null>; itemId: string;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-xs font-semibold text-foreground mb-1.5">{title}</h2>
      {description && <p className="text-[11px] text-(--foreground-muted) mb-2">{description}</p>}
      <CompactDropzone
        submissionId={submissionId}
        label={label}
        onUploadComplete={onUploadComplete}
        onEnsureSubmission={() => onEnsureSubmission(itemId)}
        className="max-h-[220px]"
      />
    </section>
  );
}

function FormSection({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-(--border) bg-background p-4" aria-labelledby={id}>
      <h2 id={id} className="text-xs font-semibold text-foreground mb-1">{title}</h2>
      {description && <p className="text-[11px] text-(--foreground-muted) mb-4">{description}</p>}
      {children}
    </section>
  );
}

/* ---------- A5 architecture preview ---------- */

function A5ArchitecturePreview({ formData }: { formData: Record<string, string> }) {
  const archType = formData[A5_FORM_KEYS.architecture_type];
  const diagramFile = formData[A5_FORM_KEYS.selected_diagram];
  const arch = archType ? getArchitecture(archType) : null;
  if (!archType && !diagramFile) return null;
  return (
    <div className="rounded-lg border border-(--border) bg-background p-3">
      <div className="text-[11px] font-semibold text-foreground mb-2">Architecture Evidence (from cycle selection)</div>
      <div className="flex items-start gap-3">
        {archType && (
          <div className="shrink-0">
            <div className="text-[10px] text-(--foreground-muted)">Declared type</div>
            <div className="text-sm font-bold text-foreground">{arch?.name ?? archType}</div>
          </div>
        )}
        {diagramFile && (
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-(--foreground-muted) mb-1">Selected diagram</div>
            <div className="rounded border border-(--border) overflow-hidden bg-(--surface) max-w-[280px]">
              <img src={getArchitectureDiagramUrl(diagramFile)} alt="Architecture diagram" className="w-full h-auto max-h-40 object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Two-column layout helper: text left, uploads right ---------- */

function TwoColumnEvidence({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">{left}</div>
      <div className="space-y-4">{right}</div>
    </div>
  );
}

/* ---------- Per-item Common Evidence content components ---------- */

function A1CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="a1-form" title="Required text evidence (for items not reliably inferred from diagram)"
          description="Provide explicit confirmations and justifications below. These answers are sent to AI together with the uploaded diagram during evaluation.">
          <A1IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="a1-upload" title="Upload network architecture diagram"
            description="Upload the latest architecture diagram (PDF/image) showing zone boundaries, firewall placement, system locations, and flow direction."
            label="Drop A1 diagram files or click to upload" submissionId={p.submissionId}
            onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="a1-diagram-checks" title="AI will verify these directly from the uploaded diagram" items={A1_DIAGRAM_DERIVED_CHECKS} />
        </>
      }
    />
  );
}

function A5CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="a5-form" title="Architecture Declaration Form"
          description="Complete the details below. Architecture type and diagram are pre-filled from your cycle selection.">
          <A5IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} architectureFromCycle={!!p.formData[A5_FORM_KEYS.architecture_type]} />
        </FormSection>
      }
      right={
        <>
          {p.formData[A5_FORM_KEYS.architecture_type] && (
            <section aria-labelledby="a5-arch-preview"><h2 id="a5-arch-preview" className="sr-only">Architecture selection</h2><A5ArchitecturePreview formData={p.formData} /></section>
          )}
          <UploadSection id="a5-upload" title="Evidence upload"
            description="Upload evidence files that apply to all controls for this evidence item (e.g. architecture documentation, decision rationale)."
            label="Drop files or click to upload" submissionId={p.submissionId}
            onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
        </>
      }
    />
  );
}

function A2CommonEvidenceContent(p: CommonFormProps & {
  a2Rows?: Record<string, string>[]; onA2RowChange?: (i: number, k: string, v: string) => void;
  onA2AddRow?: () => void; onA2RemoveRow?: (i: number) => void;
}) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="a2-form" title="SWIFT Component Inventory">
          <A2IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur}
            rows={p.a2Rows ?? [{}]} onRowChange={p.onA2RowChange ?? (() => {})}
            onAddRow={p.onA2AddRow ?? (() => {})} onRemoveRow={p.onA2RemoveRow ?? (() => {})} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="a2-upload" title="Upload supporting documents" label="Drop spreadsheet/CSV or supporting files"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="a2-diagram-checks" title="AI cross-checks against A1 diagram" items={A2_DIAGRAM_CROSS_CHECKS} />
        </>
      }
    />
  );
}

function A3CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="a3-form" title="Required text evidence">
          <A3IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="a3-upload" title="Upload data flow diagrams" label="Drop A3 data flow diagrams or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="a3-diagram-checks" title="AI will verify from uploaded diagrams" items={A3_DIAGRAM_CHECKS} />
        </>
      }
    />
  );
}

function A4CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="a4-form" title="Firewall rule confirmations">
          <A4IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="a4-upload" title="Upload firewall config exports" label="Drop firewall rule set exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="a4-upload-guidance" title="Uploaded exports should include" items={A4_UPLOAD_GUIDANCE} />
        </>
      }
    />
  );
}

function A6CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="a6-form" title="Design rationale details">
          <A6IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="a6-upload" title="Upload design rationale document" label="Drop zone design rationale document or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="a6-document-guidance" title="Document should cover" items={A6_DOCUMENT_GUIDANCE} />
        </>
      }
    />
  );
}

/* ---------- B-domain Common Evidence content components ---------- */

function B1CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="b1-form" title="OS hardening confirmations"
          description="Confirm settings that may not be fully visible in config exports.">
          <B1IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="b1-upload" title="Upload OS hardening config / screenshots"
            description="Upload per-system config exports (sudo config, UAC, Group Policy) and screenshots for each SWIFT system type."
            label="Drop OS config exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="b1-config-checks" title="AI will verify from uploaded configs" items={B1_CONFIG_CHECKS} />
        </>
      }
    />
  );
}

function B2CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="b2-form" title="Application security confirmations"
          description="Provide details about session encryption, hardening, and component status.">
          <B2IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="b2-upload" title="Upload SWIFT application security config / screenshots"
            description="Upload application security configuration exports, TLS settings, and session configuration screenshots."
            label="Drop SWIFT app config exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="b2-config-checks" title="AI will verify from uploaded configs" items={B2_CONFIG_CHECKS} />
        </>
      }
    />
  );
}

function B3CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="b3-form" title="Encryption configuration details"
          description="Provide per-flow encryption details, key management approach, and any unprotected flow justifications.">
          <B3IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="b3-upload" title="Upload encryption configuration exports"
            description="Upload TLS/encryption config exports for internal flows, back-office flows, external transmissions, and operator sessions."
            label="Drop encryption config exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="b3-config-checks" title="AI will verify from uploaded configs" items={B3_CONFIG_CHECKS} />
        </>
      }
    />
  );
}

function B4CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="b4-form" title="Virtualisation platform confirmations"
          description="Confirm platform security settings and controls.">
          <B4IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="b4-upload" title="Upload virtualisation platform config / screenshots"
            description="Upload hypervisor/cloud platform security configuration, VM isolation settings, and access restriction evidence."
            label="Drop platform config exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="b4-config-checks" title="AI will verify from uploaded configs" items={B4_CONFIG_CHECKS} />
        </>
      }
    />
  );
}

function B5CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="b5-form" title="Password policy confirmations"
          description="Confirm password policy settings per account type.">
          <B5IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="b5-upload" title="Upload password policy config / screenshots"
            description="Upload AD Group Policy exports, application password settings, and account lockout configuration evidence."
            label="Drop password policy config or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="b5-config-checks" title="AI will verify from uploaded configs" items={B5_CONFIG_CHECKS} />
        </>
      }
    />
  );
}

function B6CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="b6-form" title="Baseline comparison details"
          description="Confirm scan details, system coverage, and deviation status.">
          <B6IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="b6-upload" title="Upload hardening baseline scan reports"
            description="Upload baseline comparison scan results, compliance scores, and authorized software baseline."
            label="Drop scan reports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="b6-upload-guidance" title="Uploaded reports should include" items={B6_UPLOAD_GUIDANCE} />
        </>
      }
    />
  );
}

function B7CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="b7-form" title="MFA configuration per access point"
          description="Confirm MFA status for each required access point.">
          <B7IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="b7-upload" title="Upload MFA configuration / screenshots"
            description="Upload MFA configuration screenshots for each access point: OS admin, end user, VPN, virtualisation console, HSM."
            label="Drop MFA config screenshots or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="b7-config-checks" title="AI will verify from uploaded evidence" items={B7_CONFIG_CHECKS} />
        </>
      }
    />
  );
}

function B8CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id="b8-form" title="Session timeout confirmations"
          description="Confirm timeout and re-authentication settings per session type.">
          <B8IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id="b8-upload" title="Upload session configuration / screenshots"
            description="Upload session timeout settings, screen lock config, and re-authentication requirements for all session types."
            label="Drop session config screenshots or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id="b8-config-checks" title="AI will verify from uploaded configs" items={B8_CONFIG_CHECKS} />
        </>
      }
    />
  );
}

/* ---------- Generic C–H content ---------- */

function GenericCommonEvidenceContent({ def, ...p }: CommonFormProps & { def: GenericEvidenceDef }) {
  return (
    <TwoColumnEvidence
      left={
        <FormSection id={`${p.itemId.toLowerCase()}-form`} title={def.formTitle} description={def.formDesc}>
          <GenericIntakeForm fields={def.fields} formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </FormSection>
      }
      right={
        <>
          <UploadSection id={`${p.itemId.toLowerCase()}-upload`} title={def.uploadTitle}
            description={def.uploadDesc} label={def.uploadLabel}
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} />
          <GuidanceList id={`${p.itemId.toLowerCase()}-guidance`} title={def.guidanceTitle} items={def.guidance} />
        </>
      }
    />
  );
}

/* ---------- Main workspace ---------- */

export function EvidenceWorkspace({
  cycleId,
  domainId,
  config,
  currentItem,
  currentSubmissionId,
  selectedControlId,
  setSelectedControlId,
  evaluated,
  aiEvaluationLoading,
  aiEvaluationResult,
  completionPctByItem,
  getItemCompletion,
  onEnsureSubmission,
  onUploadComplete,
  onEvaluateEvidence,
  onSubmitForReview,
  submitForReviewLoading,
  submissionStatus,
  aiEvaluationError,
  evaluationState,
  itemFormData,
  onItemFormChange,
  onItemFormBlur,
  a2Rows,
  onA2RowChange,
  onA2AddRow,
  onA2RemoveRow,
  onEvaluationEdit,
  evaluationEdits,
}: {
  cycleId: string | null;
  domainId: string;
  config: DomainConfig;
  currentItem: EvidenceItem | null;
  currentSubmissionId: string | null;
  selectedControlId: string | null;
  setSelectedControlId: (id: string | null) => void;
  evaluated: boolean;
  aiEvaluationLoading: boolean;
  aiEvaluationResult: AiEvalResultType | null;
  completionPctByItem: Record<string, number>;
  getItemCompletion: (itemId: string) => number;
  onEnsureSubmission: (itemId: string) => Promise<string | null>;
  onUploadComplete: () => void;
  onEvaluateEvidence: () => void;
  onSubmitForReview?: () => void;
  submitForReviewLoading?: boolean;
  submissionStatus?: string;
  aiEvaluationError?: string | null;
  evaluationState: "idle" | "loading" | "done";
  itemFormData: Record<string, string>;
  onItemFormChange: (key: string, value: string) => void;
  onItemFormBlur: () => void;
  a2Rows?: Record<string, string>[];
  onA2RowChange?: (index: number, key: string, value: string) => void;
  onA2AddRow?: () => void;
  onA2RemoveRow?: (index: number) => void;
  onEvaluationEdit?: (updated: AiEvalResultType, edits: EvaluationEditsMap) => void;
  evaluationEdits?: EvaluationEditsMap;
}) {
  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--foreground-muted) text-sm">
        Select an evidence item from the list
      </div>
    );
  }

  const commonProps: CommonFormProps = {
    formData: itemFormData,
    onFormChange: onItemFormChange,
    onFormBlur: onItemFormBlur,
    submissionId: currentSubmissionId,
    onUploadComplete,
    onEnsureSubmission,
    itemId: currentItem.id,
  };

  const renderCommonEvidence = () => {
    switch (currentItem.id) {
      case A5_EVIDENCE_ITEM_ID: return <A5CommonEvidenceContent {...commonProps} />;
      case A1_EVIDENCE_ITEM_ID: return <A1CommonEvidenceContent {...commonProps} />;
      case A2_EVIDENCE_ITEM_ID: return <A2CommonEvidenceContent {...commonProps} a2Rows={a2Rows} onA2RowChange={onA2RowChange} onA2AddRow={onA2AddRow} onA2RemoveRow={onA2RemoveRow} />;
      case A3_EVIDENCE_ITEM_ID: return <A3CommonEvidenceContent {...commonProps} />;
      case A4_EVIDENCE_ITEM_ID: return <A4CommonEvidenceContent {...commonProps} />;
      case A6_EVIDENCE_ITEM_ID: return <A6CommonEvidenceContent {...commonProps} />;
      case B1_EVIDENCE_ITEM_ID: return <B1CommonEvidenceContent {...commonProps} />;
      case B2_EVIDENCE_ITEM_ID: return <B2CommonEvidenceContent {...commonProps} />;
      case B3_EVIDENCE_ITEM_ID: return <B3CommonEvidenceContent {...commonProps} />;
      case B4_EVIDENCE_ITEM_ID: return <B4CommonEvidenceContent {...commonProps} />;
      case B5_EVIDENCE_ITEM_ID: return <B5CommonEvidenceContent {...commonProps} />;
      case B6_EVIDENCE_ITEM_ID: return <B6CommonEvidenceContent {...commonProps} />;
      case B7_EVIDENCE_ITEM_ID: return <B7CommonEvidenceContent {...commonProps} />;
      case B8_EVIDENCE_ITEM_ID: return <B8CommonEvidenceContent {...commonProps} />;
      default: {
        const genericDef = GENERIC_EVIDENCE_MAP[currentItem.id];
        if (genericDef) return <GenericCommonEvidenceContent def={genericDef} {...commonProps} />;
        return (
          <>
            <p className="text-[11px] text-(--foreground-muted) mb-2">
              Upload evidence files that apply to all controls for this evidence item.
            </p>
            <CompactDropzone
              submissionId={currentSubmissionId}
              label="Drop files or click to upload"
              onUploadComplete={onUploadComplete}
              onEnsureSubmission={() => onEnsureSubmission(currentItem.id)}
              className="max-h-[200px]"
            />
          </>
        );
      }
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-(--surface) border border-(--border) rounded-xl overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-2 p-3 border-b border-(--border)">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-bold shrink-0" style={{ color: config.color }}>
            {currentItem.id}
          </span>
          <span className="text-sm font-semibold truncate text-foreground">{currentItem.name}</span>
          <PriorityBadge priority={currentItem.priority} />
        </div>
      </div>

      <Tabs defaultValue="common" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-3 pt-2 pb-1">
          <TabsList>
            <TabsTrigger value="common">Common Evidence</TabsTrigger>
            <TabsTrigger value="control">Per-Control</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="common" className="px-3 pb-3 overflow-y-auto">
          {renderCommonEvidence()}
          <div className="mt-6 pt-4 border-t border-(--border)">
            <button
              type="button"
              onClick={onEvaluateEvidence}
              disabled={aiEvaluationLoading}
              className="w-full py-2.5 text-sm font-semibold rounded-lg text-white transition-all duration-150 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--primary) disabled:opacity-60 disabled:pointer-events-none"
              style={{ background: config.color }}
            >
              {aiEvaluationLoading ? "Evaluating…" : `Evaluate Evidence for ${currentItem.id}`}
            </button>
            {aiEvaluationError && (
              <p className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                {aiEvaluationError}
              </p>
            )}
            {aiEvaluationResult && submissionStatus !== "submitted" && submissionStatus !== "approved" && onSubmitForReview && (
              <button
                type="button"
                onClick={onSubmitForReview}
                disabled={submitForReviewLoading}
                className="w-full mt-3 py-2.5 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitForReviewLoading ? "Submitting…" : `Submit ${currentItem.id} for Review`}
              </button>
            )}
            {(submissionStatus === "submitted" || submissionStatus === "in_review_L2" || submissionStatus === "in_review_L3") && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm text-center font-medium">
                Submitted for review
              </div>
            )}
            {submissionStatus === "approved" && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm text-center font-medium">
                Evidence approved
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="control" className="px-3 pb-3 overflow-y-auto">
          <p className="text-[11px] text-(--foreground-muted) mb-2">{currentItem.description}</p>
          {currentItem.id === A5_EVIDENCE_ITEM_ID ? (
            <>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedControlId(selectedControlId === ALL_32_CONTROL_ID ? null : ALL_32_CONTROL_ID)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors",
                    selectedControlId === ALL_32_CONTROL_ID
                      ? "border-(--primary) bg-(--primary-muted) text-(--primary)"
                      : "border-(--border) bg-background text-foreground hover:border-(--primary)/50"
                  )}
                >
                  <span className="font-mono">All 32</span>
                  <span className="opacity-80">controls (scoping)</span>
                </button>
              </div>
              {itemFormData?.architecture_type && <A5ArchitecturePreview formData={itemFormData} />}
            </>
          ) : (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {currentItem.controls.map((c) => (
                <ControlBadge
                  key={c.id}
                  id={c.id}
                  ma={c.ma}
                  onClick={() => setSelectedControlId(selectedControlId === c.id ? null : c.id)}
                  selected={selectedControlId === c.id}
                  statusColor={getControlStatusColor(c.id, aiEvaluationResult?.sufficiency_results, aiEvaluationResult?.criteria)}
                />
              ))}
            </div>
          )}
          {currentItem.reductionNote && (
            <div className="text-[11px] font-medium rounded-lg px-2.5 py-1.5 mb-3 bg-(--success-bg) text-(--success)">
              {currentItem.reductionNote}
            </div>
          )}
          <EvidenceCriteriaSections evidenceDescription={currentItem.description} />
          <PerControlEvidence
            evidenceItemId={currentItem.id}
            matrix={currentItem.matrix ?? []}
            submissionId={currentSubmissionId}
            evaluationState={evaluationState}
            sufficiencyResults={aiEvaluationResult?.sufficiency_results ?? null}
            criteriaResults={aiEvaluationResult?.criteria ?? null}
            onUploadComplete={onUploadComplete}
            onEnsureSubmission={() => onEnsureSubmission(currentItem.id)}
            selectedControlId={selectedControlId}
            onSelectControl={setSelectedControlId}
            showCommonEvidence={false}
          />
          {currentItem.sufficiency.length > 0 && (
            <SufficiencyPanel dimensions={currentItem.sufficiency} color={config.color} />
          )}
        </TabsContent>

        <TabsContent value="evaluation" className="px-3 pb-3 overflow-y-auto">
          <AiEvaluationResult
            result={aiEvaluationResult}
            loading={aiEvaluationLoading}
            placeholder={!aiEvaluationLoading && !aiEvaluationResult}
            editable={!!aiEvaluationResult && submissionStatus !== "approved"}
            onEdit={onEvaluationEdit}
            evaluationEdits={evaluationEdits}
          />
          {evaluated && (
            <EvaluationResults
              score={completionPctByItem[currentItem.id] ?? getItemCompletion(currentItem.id)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import Link from "next/link";
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

import { getArchitecture, getArchitectureDiagramUrl } from "@/lib/data/architectures";
import type { EvidenceItem, DomainConfig } from "@/lib/types";
import type { AiEvaluationResult as AiEvalResultType, AiCriterionResult } from "@/lib/types";

const ALL_32_CONTROL_ID = "All";

/* ---------- shared sub-components ---------- */

interface CommonFormProps {
  formData: Record<string, string>;
  onFormChange: (key: string, value: string) => void;
  onFormBlur?: () => void;
  submissionId: string | null;
  onUploadComplete: () => void;
  onEnsureSubmission: (itemId: string) => Promise<string | null>;
  itemId: string;
  criteriaResults?: AiCriterionResult[] | null;
  accentColor?: string;
}

function GuidanceList({ id, title, items }: { id: string; title: string; items: { id: string; label: string }[] }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4" aria-labelledby={id}>
      <h2 id={id} className="text-xs font-semibold text-[var(--foreground)] mb-2">{title}</h2>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="text-[11px] text-[var(--foreground-muted)]">
            <span className="font-semibold text-[var(--foreground)] mr-1">{item.id}.</span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Requirements list that turns green when each item is satisfied (from AI evaluation). */
function RequirementsListWithStatus({
  id,
  title,
  items,
  criteriaResults = null,
  accentColor,
}: {
  id: string;
  title: string;
  items: { id: string; label: string }[];
  criteriaResults?: AiCriterionResult[] | null;
  accentColor?: string;
}) {
  const metByKey = new Map<string, boolean>();
  const descriptionByKey = new Map<string, string | null>();
  if (criteriaResults?.length) {
    criteriaResults.forEach((c) => {
      metByKey.set(c.id, c.met);
      if (c.description) descriptionByKey.set(c.id, c.description);
    });
  }
  const metCount = items.filter((it) => metByKey.get(it.id) === true).length;
  const total = items.length;
  const hasEvaluation = criteriaResults != null && criteriaResults.length > 0;

  return (
    <section
      className="rounded-xl border-2 border-[var(--border)] bg-[var(--background)] p-4 transition-colors duration-300"
      style={{ borderColor: hasEvaluation && metCount === total ? "var(--success)" : undefined }}
      aria-labelledby={id}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 id={id} className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor ?? "var(--foreground)" }}>
          {title}
        </h2>
        {hasEvaluation && (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              metCount === total ? "bg-[var(--success)]/20 text-[var(--success)]" : "bg-[var(--warning)]/20 text-[var(--warning)]"
            )}
          >
            {metCount}/{total} met
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const met = metByKey.get(item.id);
          const description = descriptionByKey.get(item.id);
          const satisfied = met === true;
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-200",
                satisfied ? "bg-[var(--success)]/15 border border-[var(--success)]/40" : "bg-[var(--surface)] border border-[var(--border)]"
              )}
            >
              <span
                className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  satisfied ? "bg-[var(--success)] text-white" : "bg-[var(--border)] text-[var(--foreground-muted)]"
                )}
                aria-hidden
              >
                {satisfied ? "✓" : item.id}
              </span>
              <div className="min-w-0 flex-1">
                <span className={cn("text-[11px]", satisfied ? "text-[var(--success)] font-medium" : "text-[var(--foreground-muted)]")}>
                  {item.label}
                </span>
                {!satisfied && description && (
                  <p className="text-[10px] text-[var(--foreground-subtle)] mt-0.5 italic">{description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function UploadSection({ id, title, description, label, submissionId, onUploadComplete, onEnsureSubmission, itemId, accentColor }: {
  id: string; title: string; description?: string; label: string;
  submissionId: string | null; onUploadComplete: () => void; onEnsureSubmission: (itemId: string) => Promise<string | null>; itemId: string;
  accentColor?: string;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-xs font-semibold text-[var(--foreground)] mb-1.5">{title}</h2>
      {description && <p className="text-[11px] text-[var(--foreground-muted)] mb-2">{description}</p>}
      <CompactDropzone
        submissionId={submissionId}
        label={label}
        onUploadComplete={onUploadComplete}
        onEnsureSubmission={() => onEnsureSubmission(itemId)}
        className="max-h-[220px]"
        accentColor={accentColor}
      />
    </section>
  );
}

function FormSection({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4" aria-labelledby={id}>
      <h2 id={id} className="text-xs font-semibold text-[var(--foreground)] mb-1">{title}</h2>
      {description && <p className="text-[11px] text-[var(--foreground-muted)] mb-4">{description}</p>}
      {children}
    </section>
  );
}

/** Two-column layout: left = upload + guidance, right = form. Stacks on small screens. */
function TwoColumnEvidenceLayout({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <div className="space-y-4">{left}</div>
      <div className="lg:min-w-0">{right}</div>
    </div>
  );
}

/** Card wrapper for a logical section (e.g. "Upload & verification" vs "Text evidence"). */
function SectionCard({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor?: string }) {
  return (
    <div className="rounded-xl border-2 border-[var(--border)] bg-[var(--background)] p-4 transition-colors duration-200" style={accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 4 } : undefined}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: accentColor ?? "var(--foreground-muted)" }}>{title}</h3>
      {children}
    </div>
  );
}

/* ---------- A5 architecture preview ---------- */

function A5ArchitecturePreview({ formData }: { formData: Record<string, string> }) {
  const archType = formData[A5_FORM_KEYS.architecture_type];
  const diagramFile = formData[A5_FORM_KEYS.selected_diagram];
  const arch = archType ? getArchitecture(archType) : null;
  if (!archType && !diagramFile) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="text-[11px] font-semibold text-[var(--foreground)] mb-2">Architecture Evidence (from cycle selection)</div>
      <div className="flex items-start gap-3">
        {archType && (
          <div className="shrink-0">
            <div className="text-[10px] text-[var(--foreground-muted)]">Declared type</div>
            <div className="text-sm font-bold text-[var(--foreground)]">{arch?.name ?? archType}</div>
          </div>
        )}
        {diagramFile && (
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-[var(--foreground-muted)] mb-1">Selected diagram</div>
            <div className="rounded border border-[var(--border)] overflow-hidden bg-[var(--surface)] max-w-[280px]">
              <img src={getArchitectureDiagramUrl(diagramFile)} alt="Architecture diagram" className="w-full h-auto max-h-40 object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Per-item Common Evidence content components ---------- */

function A1CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <>
          <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
            <UploadSection id="a1-upload" title="Upload network architecture diagram"
              description="Upload the latest architecture diagram (PDF/image) showing zone boundaries, firewall placement, system locations, and flow direction."
              label="Drop A1 diagram files or click to upload" submissionId={p.submissionId}
              onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <RequirementsListWithStatus id="a1-diagram-checks" title="Requirements Needed" items={A1_DIAGRAM_DERIVED_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
            </div>
          </SectionCard>
        </>
      }
      right={
        <SectionCard title="Required text evidence" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">
            Provide explicit confirmations and justifications below. These answers are sent to AI together with the uploaded diagram during evaluation.
          </p>
          <A1IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} accentColor={p.accentColor} />
        </SectionCard>
      }
    />
  );
}

function A5CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <>
          {p.formData[A5_FORM_KEYS.architecture_type] && (
            <SectionCard title="Architecture selection" accentColor={p.accentColor}>
              <A5ArchitecturePreview formData={p.formData} />
            </SectionCard>
          )}
          <SectionCard title="Evidence upload" accentColor={p.accentColor}>
            <UploadSection id="a5-upload" title="Upload evidence files"
              description="Upload evidence files that apply to all controls (e.g. architecture documentation, decision rationale)."
              label="Drop files or click to upload" submissionId={p.submissionId}
              onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          </SectionCard>
        </>
      }
      right={
        <SectionCard title="Architecture Declaration Form" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Complete the details below. Architecture type and diagram are pre-filled from your cycle selection.</p>
          <A5IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} architectureFromCycle={!!p.formData[A5_FORM_KEYS.architecture_type]} />
        </SectionCard>
      }
    />
  );
}

function A2CommonEvidenceContent(p: CommonFormProps & {
  a2Rows?: Record<string, string>[]; onA2RowChange?: (i: number, k: string, v: string) => void;
  onA2AddRow?: () => void; onA2RemoveRow?: (i: number) => void;
}) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="a2-upload" title="Upload supporting documents" label="Drop spreadsheet/CSV or supporting files"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="a2-diagram-checks" title="Requirements Needed" items={A2_DIAGRAM_CROSS_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="SWIFT Component Inventory" accentColor={p.accentColor}>
          <A2IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur}
            rows={p.a2Rows} onRowChange={p.onA2RowChange} onAddRow={p.onA2AddRow} onRemoveRow={p.onA2RemoveRow} />
        </SectionCard>
      }
    />
  );
}

function A3CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="a3-upload" title="Upload data flow diagrams" label="Drop A3 data flow diagrams or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="a3-diagram-checks" title="Requirements Needed" items={A3_DIAGRAM_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Required text evidence" accentColor={p.accentColor}>
          <A3IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function A4CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="a4-upload" title="Upload firewall config exports" label="Drop firewall rule set exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="a4-upload-guidance" title="Requirements Needed" items={A4_UPLOAD_GUIDANCE} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Firewall rule confirmations" accentColor={p.accentColor}>
          <A4IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function A6CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="a6-upload" title="Upload design rationale document" label="Drop zone design rationale document or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="a6-document-guidance" title="Requirements Needed" items={A6_DOCUMENT_GUIDANCE} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Design rationale details" accentColor={p.accentColor}>
          <A6IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

/* ---------- B-domain Common Evidence content components ---------- */

function B1CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="b1-upload" title="Upload OS hardening config / screenshots"
            description="Upload per-system config exports (sudo config, UAC, Group Policy) and screenshots for each SWIFT system type."
            label="Drop OS config exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="b1-config-checks" title="Requirements Needed" items={B1_CONFIG_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="OS hardening confirmations" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Confirm settings that may not be fully visible in config exports.</p>
          <B1IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function B2CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="b2-upload" title="Upload SWIFT application security config / screenshots"
            description="Upload application security configuration exports, TLS settings, and session configuration screenshots."
            label="Drop SWIFT app config exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="b2-config-checks" title="Requirements Needed" items={B2_CONFIG_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Application security confirmations" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Provide details about session encryption, hardening, and component status.</p>
          <B2IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function B3CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="b3-upload" title="Upload encryption configuration exports"
            description="Upload TLS/encryption config exports for internal flows, back-office flows, external transmissions, and operator sessions."
            label="Drop encryption config exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="b3-config-checks" title="Requirements Needed" items={B3_CONFIG_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Encryption configuration details" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Provide per-flow encryption details, key management approach, and any unprotected flow justifications.</p>
          <B3IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function B4CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="b4-upload" title="Upload virtualisation platform config / screenshots"
            description="Upload hypervisor/cloud platform security configuration, VM isolation settings, and access restriction evidence."
            label="Drop platform config exports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="b4-config-checks" title="Requirements Needed" items={B4_CONFIG_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Virtualisation platform confirmations" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Confirm platform security settings and controls.</p>
          <B4IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function B5CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="b5-upload" title="Upload password policy config / screenshots"
            description="Upload AD Group Policy exports, application password settings, and account lockout configuration evidence."
            label="Drop password policy config or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="b5-config-checks" title="Requirements Needed" items={B5_CONFIG_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Password policy confirmations" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Confirm password policy settings per account type.</p>
          <B5IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function B6CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="b6-upload" title="Upload hardening baseline scan reports"
            description="Upload baseline comparison scan results, compliance scores, and authorized software baseline."
            label="Drop scan reports or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="b6-upload-guidance" title="Requirements Needed" items={B6_UPLOAD_GUIDANCE} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Baseline comparison details" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Confirm scan details, system coverage, and deviation status.</p>
          <B6IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function B7CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="b7-upload" title="Upload MFA configuration / screenshots"
            description="Upload MFA configuration screenshots for each access point: OS admin, end user, VPN, virtualisation console, HSM."
            label="Drop MFA config screenshots or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="b7-config-checks" title="Requirements Needed" items={B7_CONFIG_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="MFA configuration per access point" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Confirm MFA status for each required access point.</p>
          <B7IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
      }
    />
  );
}

function B8CommonEvidenceContent(p: CommonFormProps) {
  return (
    <TwoColumnEvidenceLayout
      left={
        <SectionCard title="Upload & AI verification" accentColor={p.accentColor}>
          <UploadSection id="b8-upload" title="Upload session configuration / screenshots"
            description="Upload session timeout settings, screen lock config, and re-authentication requirements for all session types."
            label="Drop session config screenshots or click to upload"
            submissionId={p.submissionId} onUploadComplete={p.onUploadComplete} onEnsureSubmission={p.onEnsureSubmission} itemId={p.itemId} accentColor={p.accentColor} />
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <RequirementsListWithStatus id="b8-config-checks" title="Requirements Needed" items={B8_CONFIG_CHECKS} criteriaResults={p.criteriaResults} accentColor={p.accentColor} />
          </div>
        </SectionCard>
      }
      right={
        <SectionCard title="Session timeout confirmations" accentColor={p.accentColor}>
          <p className="text-[11px] text-[var(--foreground-muted)] mb-4">Confirm timeout and re-authentication settings per session type.</p>
          <B8IntakeForm formData={p.formData} onChange={p.onFormChange} onBlur={p.onFormBlur} />
        </SectionCard>
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
  evaluationState,
  itemFormData,
  onItemFormChange,
  onItemFormBlur,
  a2Rows,
  onA2RowChange,
  onA2AddRow,
  onA2RemoveRow,
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
  evaluationState: "idle" | "loading" | "done";
  itemFormData: Record<string, string>;
  onItemFormChange: (key: string, value: string) => void;
  onItemFormBlur: () => void;
  a2Rows?: Record<string, string>[];
  onA2RowChange?: (index: number, key: string, value: string) => void;
  onA2AddRow?: () => void;
  onA2RemoveRow?: (index: number) => void;
}) {
  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] text-sm">
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
    criteriaResults: aiEvaluationResult?.criteria ?? null,
    accentColor: config.color,
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
      default:
        return (
          <>
            <p className="text-[11px] text-[var(--foreground-muted)] mb-2">
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
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-2 p-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-bold shrink-0" style={{ color: config.color }}>
            {currentItem.id}
          </span>
          <span className="text-sm font-semibold truncate text-[var(--foreground)]">{currentItem.name}</span>
          <PriorityBadge priority={currentItem.priority} />
        </div>
        {cycleId && (
          <Link
            href={`/cycles/${cycleId}/domains/${domainId}/items/${currentItem.id}`}
            className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]"
            style={{ backgroundColor: config.color }}
          >
            Open Full Intake →
          </Link>
        )}
      </div>

      <Tabs defaultValue="common" accentColor={config.color} className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-3 pt-2 pb-1 flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="common">Common Evidence</TabsTrigger>
            <TabsTrigger value="control">Per-Control</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="common" className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
          <div className="shrink-0 mx-3 mt-2 mb-1 flex items-center gap-3 rounded-xl border-2 border-[var(--border)] px-4 py-2.5 bg-[var(--surface)]" style={{ borderLeftColor: config.color, borderLeftWidth: 4 }}>
            {aiEvaluationResult?.criteria?.length ? (
              <>
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  Requirements: {aiEvaluationResult.criteria.filter((c) => c.met).length}/{aiEvaluationResult.criteria.length} met
                </span>
                {aiEvaluationResult.overall_met ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--success)]/20 text-[var(--success)]">All met</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">In progress</span>
                )}
              </>
            ) : (
              <span className="text-xs text-[var(--foreground-muted)]">Run evaluation to see requirement status</span>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">{renderCommonEvidence()}</div>
          <div className="shrink-0 py-3 px-3 border-t border-[var(--border)] bg-[var(--surface)]">
            <button
              type="button"
              onClick={onEvaluateEvidence}
              className="w-full py-2.5 text-sm font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] shadow-md"
              style={{ backgroundColor: config.color }}
            >
              Evaluate evidence for {currentItem.id}
            </button>
          </div>
        </TabsContent>

        <TabsContent value="control" className="px-3 pb-3 overflow-y-auto">
          <p className="text-[11px] text-[var(--foreground-muted)] mb-2">{currentItem.description}</p>
          {currentItem.id === A5_EVIDENCE_ITEM_ID ? (
            <>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedControlId(selectedControlId === ALL_32_CONTROL_ID ? null : ALL_32_CONTROL_ID)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors",
                    selectedControlId === ALL_32_CONTROL_ID
                      ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
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
                />
              ))}
            </div>
          )}
          {currentItem.reductionNote && (
            <div className="text-[11px] font-medium rounded-lg px-2.5 py-1.5 mb-3 bg-[var(--success-bg)] text-[var(--success)]">
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
          />
          {evaluated && (
            <EvaluationResults
              score={completionPctByItem[currentItem.id] ?? getItemCompletion(currentItem.id)}
            />
          )}
          <button
            type="button"
            onClick={onEvaluateEvidence}
            className="mt-4 w-full py-2.5 text-sm font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] shadow-md"
            style={{ backgroundColor: config.color }}
          >
            Evaluate evidence for {currentItem.id}
          </button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

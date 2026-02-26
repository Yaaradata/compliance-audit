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
import type { EvidenceItem, DomainConfig } from "@/lib/types";
import type { AiEvaluationResult as AiEvalResultType } from "@/lib/types";

const TAB_IDS = ["common", "control", "evaluation"] as const;

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
}) {
  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] text-sm">
        Select an evidence item from the list
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Compact item title bar */}
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
            className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[var(--primary-muted)] text-[var(--primary)] hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Open Full Intake →
          </Link>
        )}
      </div>

      <Tabs defaultValue="common" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-3 pt-2 pb-1">
          <TabsList>
            <TabsTrigger value="common">Common Evidence</TabsTrigger>
            <TabsTrigger value="control">Per-Control</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="common" className="px-3 pb-3">
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
        </TabsContent>

        <TabsContent value="control" className="px-3 pb-3 overflow-y-auto">
          <p className="text-[11px] text-[var(--foreground-muted)] mb-2">{currentItem.description}</p>
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
          {currentItem.reductionNote && (
            <div className="text-[11px] font-medium rounded-lg px-2.5 py-1.5 mb-3 bg-[var(--success-bg)] text-[var(--success)]">
              {currentItem.reductionNote}
            </div>
          )}
          <EvidenceCriteriaSections evidenceDescription={currentItem.description} />
          <PerControlEvidence
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
            className="mt-4 w-full py-2.5 text-sm font-semibold rounded-lg text-white transition-all duration-150 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]"
            style={{ background: config.color }}
          >
            Evaluate Evidence for {currentItem.id}
          </button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { CompactDomainHeader } from "./compact-domain-header";
import { EvidenceListPanel } from "./evidence-list-panel";
import { EvidenceWorkspace } from "./evidence-workspace";
import { cn } from "@/lib/utils";
import type { DomainConfig, EvidenceItem } from "@/lib/types";
import type { AiEvaluationResult as AiEvalResultType } from "@/lib/types";

type EvaluationState = "idle" | "loading" | "done";

export interface DomainWorkspaceLayoutProps {
  /** Backend schema_name (e.g. swift_2025, swift_2026, soc2) to load the correct framework UI. */
  schemaName?: string | null;
  cycleId: string | null;
  domainId: string;
  config: DomainConfig;
  activeItem: string;
  onSelectItem: (id: string) => void;
  selectedControlId: string | null;
  onSelectControl: (id: string | null) => void;
  completionByItem: Record<string, number>;
  overallCompletion: number;
  controlScores: Record<string, number>;
  submissionMap: Record<string, string>;
  currentItem: EvidenceItem | null;
  evaluated: boolean;
  aiEvaluationLoading: boolean;
  aiEvaluationResult: AiEvalResultType | null;
  completionPctByItem: Record<string, number>;
  getItemCompletion: (itemId: string) => number;
  ensureSubmission: (itemId: string) => Promise<string | null>;
  fetchControlScores: () => void;
  onEvaluateEvidence: () => void;
  onSubmitForReview?: () => void;
  submitForReviewLoading?: boolean;
  submissionStatus?: string;
  aiEvaluationError?: string | null;
  itemFormData: Record<string, string>;
  onItemFormChange: (key: string, value: string) => void;
  onItemFormBlur: () => void;
  a2Rows?: Record<string, string>[];
  onA2RowChange?: (index: number, key: string, value: string) => void;
  onA2AddRow?: () => void;
  onA2RemoveRow?: (index: number) => void;
  onEvaluationEdit?: (updated: AiEvalResultType, edits: import("@/components/domain/ai-evaluation-result").EvaluationEditsMap) => void;
  evaluationEdits?: import("@/components/domain/ai-evaluation-result").EvaluationEditsMap;
}

export function DomainWorkspaceLayout({
  schemaName,
  cycleId,
  domainId,
  config,
  activeItem,
  onSelectItem,
  selectedControlId,
  onSelectControl,
  completionByItem,
  overallCompletion,
  controlScores,
  submissionMap,
  currentItem,
  evaluated,
  aiEvaluationLoading,
  aiEvaluationResult,
  completionPctByItem,
  getItemCompletion,
  ensureSubmission,
  fetchControlScores,
  onEvaluateEvidence,
  onSubmitForReview,
  submitForReviewLoading,
  submissionStatus,
  aiEvaluationError,
  itemFormData,
  onItemFormChange,
  onItemFormBlur,
  a2Rows,
  onA2RowChange,
  onA2AddRow,
  onA2RemoveRow,
  onEvaluationEdit,
  evaluationEdits,
}: DomainWorkspaceLayoutProps) {
  const evaluationState: EvaluationState = !evaluated ? "idle" : aiEvaluationLoading ? "loading" : "done";
  const currentSubmissionId = currentItem ? submissionMap[currentItem.id] ?? null : null;

  return (
    <div className="h-full min-h-0 flex flex-col">
      <CompactDomainHeader config={config} completionPct={overallCompletion} className="shrink-0" />

      <div className="md:hidden shrink-0 p-2 border-b border-(--border)">
        <label htmlFor="evidence-select-mobile" className="sr-only">
          Select evidence item
        </label>
        <select
          id="evidence-select-mobile"
          value={activeItem}
          onChange={(e) => onSelectItem(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--surface) text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
          aria-label="Select evidence item"
        >
          {config.evidenceItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.id} — {item.name}
            </option>
          ))}
        </select>
      </div>

      <div
        className={cn(
          "flex-1 min-h-0 grid gap-4 overflow-hidden",
          "grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]",
          "grid-rows-[minmax(0,1fr)]"
        )}
      >
        <div className="hidden md:flex flex-col min-h-0 md:min-w-[220px] lg:min-w-[280px] overflow-hidden">
          <EvidenceListPanel
            config={config}
            activeItem={activeItem}
            onSelectItem={onSelectItem}
            completionByItem={completionByItem}
            className="h-full"
          />
        </div>

        <div className="min-h-0 min-w-0 flex flex-col overflow-hidden">
          <EvidenceWorkspace
            schemaName={schemaName}
            cycleId={cycleId}
            domainId={domainId}
            config={config}
            currentItem={currentItem}
            currentSubmissionId={currentSubmissionId}
            selectedControlId={selectedControlId}
            setSelectedControlId={onSelectControl}
            evaluated={evaluated}
            aiEvaluationLoading={aiEvaluationLoading}
            aiEvaluationResult={aiEvaluationResult}
            completionPctByItem={completionPctByItem}
            getItemCompletion={getItemCompletion}
            onEnsureSubmission={ensureSubmission}
            onUploadComplete={fetchControlScores}
            onEvaluateEvidence={onEvaluateEvidence}
            onSubmitForReview={onSubmitForReview}
            submitForReviewLoading={submitForReviewLoading}
            submissionStatus={submissionStatus}
            aiEvaluationError={aiEvaluationError}
            evaluationState={evaluationState}
            itemFormData={itemFormData}
            onItemFormChange={onItemFormChange}
            onItemFormBlur={onItemFormBlur}
            a2Rows={a2Rows}
            onA2RowChange={onA2RowChange}
            onA2AddRow={onA2AddRow}
            onA2RemoveRow={onA2RemoveRow}
            onEvaluationEdit={onEvaluationEdit}
            evaluationEdits={evaluationEdits}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Shared types for the framework registry.
 * Used so each framework (SWIFT CSCF, SOC 2) can provide components that satisfy the same contract.
 */

import type { DomainConfig, EvidenceItem } from "@/lib/types";
import type { AiEvaluationResult as AiEvalResultType } from "@/lib/types";
import type { EvaluationEditsMap } from "@/components/domain/ai-evaluation-result";

/** Schema name from backend: swift_2025, swift_2026, soc2, etc. */
export type SchemaName = string;

/** Props passed to the domain evidence workspace by DomainWorkspaceLayout. */
export interface EvidenceWorkspaceProps {
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
  notesRefreshTrigger?: number;
  onNoteAdded?: () => void;
}

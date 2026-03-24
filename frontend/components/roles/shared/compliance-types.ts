import type { AssessmentCycle } from "@/lib/types";

export type CycleDashboard = {
  overall_score: number;
  mandatory_controls: number;
  total_controls: number;
  evidence_items: number;
  total_evidence_items: number;
  gaps_identified: number;
  gaps: { control_id: string; name: string; score: number }[];
  control_scores?: { status?: string | null }[];
};

export type CycleInsight = {
  cycle: AssessmentCycle;
  dashboard: CycleDashboard | null;
  relatedUsers: { id: string; name: string }[];
};

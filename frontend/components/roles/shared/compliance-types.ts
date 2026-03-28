import type { AssessmentCycle } from "@/lib/types";

export type RoleDashboardKpiCard = {
  label: string;
  value: string | number;
  sub: string;
  href: string;
  aria: string;
  tone: string;
};

export type ComplianceOverviewRow = {
  label: string;
  value: number;
  count: number;
  color: string;
};

export type ComplianceOverviewData = {
  center: number;
  centerLabel: string;
  totalCycles: number;
  selectedCycle: AssessmentCycle | null;
  selectedCycleEvidencePct: number;
  selectedCycleHealthPct: number;
  selectedCycleCreatedOn: string;
  rows: ComplianceOverviewRow[];
};

export type CalendarDeadlineMark = {
  label: string;
  displayId: string;
  phase: string;
  /** Which assessment cycle this deadline belongs to (for filtering when an active cycle is selected). */
  cycleId: string;
};

export type CycleDashboard = {
  overall_score: number;
  mandatory_controls: number;
  total_controls: number;
  evidence_items: number;
  /** Submissions awaiting review (submitted + in_review pipeline). */
  evidence_in_review?: number;
  review_pending_l1?: number;
  review_pending_l2?: number;
  review_pending_l3?: number;
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

/** Compliance officer upcoming-deadlines list (days until due). */
export type DeadlineRow = CycleInsight & { days: number };

export type CycleReviewStats = {
  inReview: number;
  approved: number;
  rejected: number;
};

export type EvidenceReviewApiRow = {
  status: string;
};

export type StatKpiArticle = {
  label: string;
  value: string | number;
  sub: string;
  tone: string;
};

export type ItExpertCycleRow = {
  id: string;
  label: string;
  displayId: string;
  phase: string;
  assignedControls: number;
  evidenceDone: number;
  evidenceTotal: number;
  evidencePct: number;
  inReview: number;
  approved: number;
  rejected: number;
  dueLabel: string;
};

export type ItExpertDeadlineLinkRow = {
  id: string;
  label: string;
  displayId: string;
  phase: string;
  dueDateLabel: string;
  dueIn: number | null;
};

export type ItExpertVizRow = {
  label: string;
  value: number;
  color: string;
};

export type ItExpertVisualization = {
  rows: ItExpertVizRow[];
  total: number;
  center: number;
  centerLabel: string;
  selectedLabel: string;
};

/** Per-cycle row for L1/L2/L3 home dashboards (review queue). */
export type ReviewerQueueRow = {
  id: string;
  label: string;
  displayId: string;
  phase: string;
  pending: number;
  approved: number;
  returned: number;
  dueLabel: string;
};

/** Right-column donut for reviewer home (mirrors ComplianceOverviewData shape for the chart rows). */
export type ReviewerQueueOverviewRow = {
  label: string;
  value: number;
  count: number;
  color: string;
};

export type ReviewerQueueOverviewData = {
  center: number;
  centerLabel: string;
  totalItems: number;
  rows: ReviewerQueueOverviewRow[];
};

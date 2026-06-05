import type { AuditControl } from '@/lib/Indian_Process_Audit/types';

/** Deep-link from HoB / COH into the audit workspace. */
export type FastTagWorkspaceNavigate = {
  view: 'sop' | 'register' | 'cases' | 'toll' | 'hob' | 'coh';
  registerFilter?: 'all' | 'effective' | 'needs-attention' | 'deficient';
  caseRegion?: string | null;
  caseStage?: string | null;
  controlId?: string;
  tollPlazaBreakId?: string;
};

export type HobKpiDrillId = 'toll-volume' | 'new-customers' | 'activation-rate' | 'retail-mix';

export type CohKpiDrillId = 'experience-index' | 'open-findings' | 'resolution' | 'clean-completion';

export type IssuanceSegmentKey = 'fleet' | 'retail' | 'logistics' | 'govt';

export type ExecDrillState =
  | { kind: 'decision'; id: string }
  | { kind: 'risk'; id: string }
  | { kind: 'plaza'; breakId: string }
  | { kind: 'control'; controlId: string }
  | { kind: 'kpi'; kpiId: HobKpiDrillId }
  | { kind: 'coh-kpi'; kpiId: CohKpiDrillId }
  | { kind: 'coh-attention'; id: string }
  | { kind: 'attention-list'; variant: 'risk' | 'coh-attention' }
  | { kind: 'segment-mix'; segment: IssuanceSegmentKey }
  | null;

export type ExecAttentionItem = {
  num: string;
  title: string;
  desc: string;
  value: string;
  tone: 'bad' | 'warn' | 'info';
  action: string;
  id: string;
  navigate: FastTagWorkspaceNavigate;
};

export type FastTagExecutiveContext = {
  controls: AuditControl[];
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
  onNavigate: (req: FastTagWorkspaceNavigate) => void;
  regionCode: string | null;
  setRegionCode: (code: string | null) => void;
  deficientOnly: boolean;
  setDeficientOnly: (v: boolean) => void;
};

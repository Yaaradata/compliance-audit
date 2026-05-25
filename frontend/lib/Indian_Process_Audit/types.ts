import type { LucideIcon } from 'lucide-react';

/** Auditor domain tab ids (excludes overview). */
export type ProcessAuditDomainId =
  | 'customer'
  | 'loan'
  | 'transaction'
  | 'risk'
  | 'itchange'
  | 'infra'
  | 'data'
  | 'finance'
  | 'ops';

export type ProcessAuditTabId = 'overview' | ProcessAuditDomainId;

export type ControlStatus = 'effective' | 'needs-attention' | 'deficient';

/** Banking control row — shared schema across domain libraries. */
export interface AuditControl {
  id: string;
  name: string;
  objective: string;
  regulatory: string;
  owner: string;
  frequency: string;
  population: number;
  sample: number;
  exceptions: number;
  violations: number;
  compliance: number;
  status: ControlStatus;
  lastTested?: string;
  tester?: string;
}

export interface ProcessAuditDomainDef {
  id: ProcessAuditTabId;
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface EvidenceDocument {
  name: string;
  type: string;
  size: string;
  system?: string;
}

export interface EvidenceException {
  ref: string;
  detail: string;
  severity: string;
  owner: string;
  sla: string;
  action: string;
}

export interface EvidenceSourceSystem {
  name: string;
  record: string;
}

export interface StageSubmitterRef {
  domainId: string;
  sopName: string;
  stage: { id: string; name: string; controlIds: string[]; owner: { role: string; team: string; submits: string } };
}

export interface CaseTrailRef {
  kase: {
    id: string;
    subject: string;
    overallStatus: string;
    trail: Array<{ stage: { name: string; controlIds: string[] }; status: string }>;
  };
  hit: { stage: { name: string; controlIds: string[] }; status: string };
}

/** Payload for the evidence workpaper drawer. */
export interface EvidenceBundle {
  control: AuditControl;
  domainLabel: string;
  stageSubmitters?: StageSubmitterRef[];
  sampleCaseTrails?: CaseTrailRef[];
  lastTested: string;
  tester: string;
  testingSteps: string[];
  exceptionLog: EvidenceException[];
  sourceSystems: EvidenceSourceSystem[];
  documents: EvidenceDocument[];
  auditorNote: string;
  mgmtResponse: string;
}

export interface EvidenceDrawerState {
  open: boolean;
  evidence: EvidenceBundle | null;
}

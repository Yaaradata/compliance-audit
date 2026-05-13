export type DrawerEntityType =
  | 'incident'
  | 'risk'
  | 'control'
  | 'controlInstance'
  | 'obligation'
  | 'regulation'
  | 'process'
  | 'processExecution'
  | 'stepExecution'
  | 'evidence'
  | 'sourceRecord'
  | 'correlationRecord'
  | 'exception'
  | 'issue'
  | 'remediationAction'
  | 'seniorManager'
  | 'decisionEvent'
  | 'attestationEvent'
  | 'aiInsight'
  | 'auditPack'
  | 'workpaper'
  | 'testExecution'
  | 'reportingClock'
  | 'reportingSubmission'
  | 'sourceSystem'
  | 'kri'
  | 'rca'
  | 'preventiveAction';

/** Deep-link preset when routing from posture heartbeat tiles. */
export type OrmCrossNavIntent =
  | { target: 'incidentRegister'; preset: 'critical_incidents_7d' }
  | { target: 'rcaWorkspace'; preset: 'awaiting_approval' }
  | { target: 'pacNoteApprovals'; preset: 'blocked' };

export type DrillCrumb = {
  type: DrawerEntityType;
  id: string;
  label: string;
};

export type DrawerState = {
  isOpen: boolean;
  entityType: DrawerEntityType | null;
  entityId: string | null;
  sourceScreen: string | null;
  drillPath: DrillCrumb[];
};

export const initialDrawer = (): DrawerState => ({
  isOpen: false,
  entityType: null,
  entityId: null,
  sourceScreen: null,
  drillPath: [],
});

export type OpenDrawer = (entityType: DrawerEntityType, entityId: string, sourceScreen: string) => void;
export type DrillFromDrawer = (entityType: DrawerEntityType, entityId: string) => void;
export type SetActiveScreen = (screen: string) => void;

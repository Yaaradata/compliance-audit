export type DrawerEntityType =
  | 'risk'
  | 'control'
  | 'controlInstance'
  | 'obligation'
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
  | 'sourceSystem';

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

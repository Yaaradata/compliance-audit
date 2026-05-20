import type { PersonaCode, ScreenCode } from '../AppShell';

/**
 * Version-specific ORI behaviour.
 * v1 — classic prototype (original KRI cards, sidebar AI queue, separate control drill-down).
 * v2 — latest (merged control universe, workflow store, unified control testing, evidence repository).
 */

export type OriVersionFeatures = {
  /** Persist PAC / evidence / test-run mutations in localStorage. */
  workflowStore: boolean;
  /** Inline master–detail on Control Universe (no separate drill-down screen). */
  controlUniverseInlineDetail: boolean;
  /** Redirect controlDrillDown route → controlUniverse. */
  mergeControlDrillDown: boolean;
  /** KRI: domain grid + AI summary wall with height sync. */
  kriDashboardV2: boolean;
  /** Evidence workbench: versions, access trail, upload. */
  evidenceRepositoryV2: boolean;
  /** Control testing: ControlTestingScreen (population testing uses same UI). */
  controlTestingV2: boolean;
  /** PAC approvals: persistent comment thread and revision rounds. */
  pacWorkflowV2: boolean;
  /** Top bar: Run guided demo button. */
  guidedDemoButton: boolean;
};

export const ORI_VERSION_FEATURES: Record<'v1' | 'v2', OriVersionFeatures> = {
  v1: {
    workflowStore: false,
    controlUniverseInlineDetail: false,
    mergeControlDrillDown: false,
    kriDashboardV2: false,
    evidenceRepositoryV2: false,
    controlTestingV2: false,
    pacWorkflowV2: false,
    guidedDemoButton: true,
  },
  v2: {
    workflowStore: true,
    controlUniverseInlineDetail: true,
    mergeControlDrillDown: true,
    kriDashboardV2: true,
    evidenceRepositoryV2: true,
    controlTestingV2: true,
    pacWorkflowV2: true,
    guidedDemoButton: false,
  },
};

/** Screens hidden from sidebar (still routable via deep link / demo). */
export function sidebarHiddenScreensForVersion(version: 'v1' | 'v2'): ReadonlySet<ScreenCode> {
  if (version === 'v1') {
    return new Set<ScreenCode>(['whatChanged']);
  }
  return new Set<ScreenCode>(['whatChanged', 'aiInsights', 'controlDrillDown']);
}

/** ORI nav section layout — controlDrillDown only listed in v1. */
export function navSectionsForVersion(version: 'v1' | 'v2'): { id: string; label: string; codes: ScreenCode[] }[] {
  const riskControl: ScreenCode[] =
    version === 'v1'
      ? [
          'rcsaWorkspace',
          'riskRegister',
          'kriMonitoring',
          'obligationCoverage',
          'controlUniverse',
          'controlDrillDown',
          'sourceLineage',
          'processHealth',
        ]
      : ['rcsaWorkspace', 'riskRegister', 'kriMonitoring', 'obligationCoverage', 'controlUniverse', 'sourceLineage', 'processHealth'];

  return [
    { id: 'posture', label: 'Posture', codes: ['riskPosture'] },
    { id: 'riskControl', label: 'Risk & Control Workspace', codes: riskControl },
    { id: 'incidents', label: 'Incidents, RCA & KRI', codes: ['incidentRegister', 'rcaWorkspace', 'issueBoard', 'accountability', 'lossData'] },
    {
      id: 'regulatory',
      label: 'Regulatory & Inspection',
      codes: [
        'regulatoryIntelligence',
        'populationTesting',
        'evidenceWorkbench',
        'pacNoteApprovals',
        'workpaperAuditPackBuilder',
        'inspectionReadiness',
        'aiInsights',
      ],
    },
  ];
}

export function controlUniverseSubtitleForVersion(version: 'v1' | 'v2'): string {
  return version === 'v1'
    ? 'RCM-style control browser — CES, obligations, and population testability.'
    : '';
}

export function normalizeScreenForVersion(screen: ScreenCode, version: 'v1' | 'v2'): ScreenCode {
  if (version === 'v2' && screen === 'controlDrillDown') return 'controlUniverse';
  return screen;
}

export function featuresForVersion(version: 'v1' | 'v2'): OriVersionFeatures {
  return ORI_VERSION_FEATURES[version];
}

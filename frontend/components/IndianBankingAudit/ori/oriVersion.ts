/** Supported Indian Banking Audit (ORI) app versions. */
export type OriVersion = 'v1' | 'v2';

/** Labels for version `<select>` controls (matches UK Banking Audit pattern). */
export const ORI_VERSION_SELECT_LABELS: Record<OriVersion, string> = {
  v2: 'v2 — latest',
  v1: 'v1',
};

/** Latest shipped ORI version — used for defaults and redirects. */
export const LATEST_ORI_VERSION: OriVersion = 'v2';

export const ORI_BASE_PATHS: Record<OriVersion, string> = {
  v1: '/IndianBankingAudit/v1',
  v2: '/IndianBankingAudit/v2',
};

export const DEFAULT_ORI_VERSION: OriVersion = LATEST_ORI_VERSION;

export function getOriBasePath(version: OriVersion): string {
  return ORI_BASE_PATHS[version];
}

export type OriRoutes = {
  home: string;
  regulatoryIntelligence: string;
  obligationCoverage: string;
  controlTesting: string;
  issuesBoard: string;
  issuesBoardPa: string;
  evidenceWorkbench: string;
  inspectionReadiness: string;
  rcsaWorkspace: string;
  obligationCoverageForObligation: (obligationId: string) => string;
  obligationCoverageForInstrument: (instrumentRef: string) => string;
  controlTestingForControl: (controlId: string) => string;
};

export function buildOriRoutes(version: OriVersion): OriRoutes {
  const base = getOriBasePath(version);
  return {
    home: base,
    regulatoryIntelligence: `${base}/regulatory-intelligence`,
    obligationCoverage: `${base}/obligation-coverage`,
    controlTesting: `${base}/control-testing`,
    issuesBoard: `${base}/issues-board`,
    issuesBoardPa: `${base}/issues-board?filter=pa`,
    evidenceWorkbench: `${base}/evidence-workbench`,
    inspectionReadiness: `${base}/inspection-readiness`,
    rcsaWorkspace: `${base}/rcsa-workspace`,
    obligationCoverageForObligation: (obligationId: string) =>
      `${base}/obligation-coverage?obligation=${encodeURIComponent(obligationId)}`,
    obligationCoverageForInstrument: (instrumentRef: string) =>
      `${base}/obligation-coverage?instrument=${encodeURIComponent(instrumentRef)}`,
    controlTestingForControl: (controlId: string) =>
      `${base}/control-testing?control=${encodeURIComponent(controlId)}`,
  };
}

export function buildRegIntelRoutes(routes: OriRoutes) {
  return {
    issuesBoard: routes.issuesBoard,
    issuesBoardPa: routes.issuesBoardPa,
    controlTesting: routes.controlTesting,
    evidenceWorkbench: routes.evidenceWorkbench,
    inspectionReadiness: routes.inspectionReadiness,
    rcsaWorkspace: routes.rcsaWorkspace,
    obligationCoverage: routes.obligationCoverageForObligation,
    obligationCoverageForInstrument: routes.obligationCoverageForInstrument,
  };
}

/** KPI presentation on the Executive Risk Posture Cockpit. */
export type OriKpiVariant = 'classic' | 'compact';

export function kpiVariantForVersion(version: OriVersion): OriKpiVariant {
  return version === 'v1' ? 'classic' : 'compact';
}

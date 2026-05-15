/** Base path for all ORI (Indian Banking Audit) app routes. */
export const ORI_BASE_PATH = '/IndianBankingAudit' as const;

/** Canonical ORI routes — filesystem lives under `app/IndianBankingAudit/`. */
export const ORI_ROUTES = {
  home: ORI_BASE_PATH,
  regulatoryIntelligence: `${ORI_BASE_PATH}/regulatory-intelligence`,
  obligationCoverage: `${ORI_BASE_PATH}/obligation-coverage`,
  controlTesting: `${ORI_BASE_PATH}/control-testing`,
  issuesBoard: `${ORI_BASE_PATH}/issues-board`,
  issuesBoardPa: `${ORI_BASE_PATH}/issues-board?filter=pa`,
  evidenceWorkbench: `${ORI_BASE_PATH}/evidence-workbench`,
  inspectionReadiness: `${ORI_BASE_PATH}/inspection-readiness`,
  rcsaWorkspace: `${ORI_BASE_PATH}/rcsa-workspace`,
  obligationCoverageForObligation: (obligationId: string) =>
    `${ORI_BASE_PATH}/obligation-coverage?obligation=${encodeURIComponent(obligationId)}`,
  obligationCoverageForInstrument: (instrumentRef: string) =>
    `${ORI_BASE_PATH}/obligation-coverage?instrument=${encodeURIComponent(instrumentRef)}`,
  controlTestingForControl: (controlId: string) =>
    `${ORI_BASE_PATH}/control-testing?control=${encodeURIComponent(controlId)}`,
} as const;

/** @deprecated Use `ORI_ROUTES.regulatoryIntelligence` */
export const ORI_REG_INTEL_INBOX_HREF = ORI_ROUTES.regulatoryIntelligence;

/** Cross-navigation targets from Regulatory Intelligence Inbox. */
export const REG_INTEL_ROUTES = {
  issuesBoard: ORI_ROUTES.issuesBoard,
  issuesBoardPa: ORI_ROUTES.issuesBoardPa,
  controlTesting: ORI_ROUTES.controlTesting,
  evidenceWorkbench: ORI_ROUTES.evidenceWorkbench,
  inspectionReadiness: ORI_ROUTES.inspectionReadiness,
  rcsaWorkspace: ORI_ROUTES.rcsaWorkspace,
  obligationCoverage: ORI_ROUTES.obligationCoverageForObligation,
  obligationCoverageForInstrument: ORI_ROUTES.obligationCoverageForInstrument,
} as const;

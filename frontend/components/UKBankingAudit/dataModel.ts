/**
 * UK Banking Audit (Pass 7.x) — re-exports v2 mock graph for modular code / tests.
 * Main UI lives in `UKBankingControlTrace.tsx` (self-contained v2 shell).
 */
import mockControlTraceData from '@/lib/ukbankingaudit/mockDataV2';

export const {
  personas,
  navigationItems,
  croCategories,
  risks,
  controls,
  obligations,
  processes,
  processSteps,
  smfHolders,
  actors,
  kris,
  riskAppetiteMetrics,
  consumerOutcomes,
  importantBusinessServices,
  coverageGaps,
  controlInstances,
  evidenceRecords,
  exceptions,
  issues,
  remediationActions,
  tests,
  workpapers,
  auditPacks,
  aiInsights,
  auditTrailEvents,
  metrics,
  riskAreas,
  controlObjectives,
  groupSetRequirements,
  crsaAttestationCycles,
  crsaAttestationLines,
  horizonScanItems,
  findingsLedger,
  firmLevelRAG,
  whatChangedThisWeek,
  amlAlertsByWeek,
  sarFilingsByWeek,
  eddPipelineItems,
  sanctionsScreeningMetrics,
  capacityVsDemandSeries,
} = mockControlTraceData;

/** Legacy v1 name — v2 uses CRO five-category taxonomy (`croCategories`). */
export const riskDomains = croCategories;

export const findById = <T extends { id: string }>(arr: T[] | undefined, id: string | null | undefined): T | null =>
  (arr || []).find((x) => x.id === id) || null;

export const getRisk = (id: string) => findById(risks, id);
export const getControl = (id: string) => findById(controls, id);
export const getObligation = (id: string) => findById(obligations, id);
export const getIssue = (id: string) => findById(issues, id);
export const getEvidence = (id: string) => findById(evidenceRecords, id);
export const getSMF = (id: string) => findById(smfHolders, id);
export const getActor = (id: string) => findById(actors, id);
export const getProcessStep = (id: string) => findById(processSteps, id);
export const getProcess = (id: string) => findById(processes, id);
export const getKRI = (id: string) => findById(kris, id);
export const getAppetite = (id: string) => findById(riskAppetiteMetrics, id);
export const getControlInstance = (id: string) => findById(controlInstances, id);
export const getException = (id: string) => findById(exceptions, id);
export const getRemediation = (id: string) => findById(remediationActions, id);
export const getTest = (id: string) => findById(tests, id);
export const getWorkpaper = (id: string) => findById(workpapers, id);
export const getAuditPack = (id: string) => findById(auditPacks, id);
export const getInsight = (id: string) => findById(aiInsights, id);
export const getCoverageGap = (id: string) => findById(coverageGaps, id);
export const getRiskArea = (id: string) => findById(riskAreas, id);
export const getControlObjective = (id: string) => findById(controlObjectives, id);
export const getGSR = (id: string) => findById(groupSetRequirements, id);
export const getCRSACycle = (id: string) => findById(crsaAttestationCycles, id);
export const getAttestationLine = (id: string) => findById(crsaAttestationLines, id);
export const getCROCategory = (id: string) => findById(croCategories, id);

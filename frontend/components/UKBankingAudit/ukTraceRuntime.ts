// @ts-nocheck
import { getUkAuditUi } from '@/components/UKBankingAudit/v3';

export let personas, navigationItems, croCategories, risks, controls, obligations,
  processes, processSteps, smfHolders, actors, kris, riskAppetiteMetrics,
  consumerOutcomes, importantBusinessServices, coverageGaps,
  controlInstances, evidenceRecords, exceptions, issues, remediationActions,
  tests, workpapers, auditPacks, aiInsights, auditTrailEvents, metrics,
  riskAreas, controlObjectives, groupSetRequirements,
  crsaAttestationCycles, crsaAttestationLines,
  firmLevelRAG, whatChangedThisWeek,
  horizonScanItems, findingsLedger,
  amlAlertsByWeek, sarFilingsByWeek, eddPipelineItems,
  sanctionsScreeningMetrics, capacityVsDemandSeries;

export let activeUkUi = getUkAuditUi('v2');

export function bindUkTraceMock(mock, variant = 'v2') {
  personas = mock.personas;
  navigationItems = mock.navigationItems;
  croCategories = mock.croCategories;
  risks = mock.risks;
  controls = mock.controls;
  obligations = mock.obligations;
  processes = mock.processes;
  processSteps = mock.processSteps;
  smfHolders = mock.smfHolders;
  actors = mock.actors;
  kris = mock.kris;
  riskAppetiteMetrics = mock.riskAppetiteMetrics;
  consumerOutcomes = mock.consumerOutcomes;
  importantBusinessServices = mock.importantBusinessServices;
  coverageGaps = mock.coverageGaps;
  controlInstances = mock.controlInstances;
  evidenceRecords = mock.evidenceRecords;
  exceptions = mock.exceptions;
  issues = mock.issues;
  remediationActions = mock.remediationActions;
  tests = mock.tests;
  workpapers = mock.workpapers;
  auditPacks = mock.auditPacks;
  aiInsights = mock.aiInsights;
  auditTrailEvents = mock.auditTrailEvents;
  metrics = mock.metrics;
  riskAreas = mock.riskAreas;
  controlObjectives = mock.controlObjectives;
  groupSetRequirements = mock.groupSetRequirements;
  crsaAttestationCycles = mock.crsaAttestationCycles;
  crsaAttestationLines = mock.crsaAttestationLines;
  firmLevelRAG = mock.firmLevelRAG;
  whatChangedThisWeek = mock.whatChangedThisWeek;
  horizonScanItems = mock.horizonScanItems;
  findingsLedger = mock.findingsLedger;
  amlAlertsByWeek = mock.amlAlertsByWeek;
  sarFilingsByWeek = mock.sarFilingsByWeek;
  eddPipelineItems = mock.eddPipelineItems;
  sanctionsScreeningMetrics = mock.sanctionsScreeningMetrics;
  capacityVsDemandSeries = mock.capacityVsDemandSeries;
  activeUkUi = getUkAuditUi(variant === 'v4' || variant === 'v5' ? 'v3' : variant);
}

export const findById = (arr, id) => (arr || []).find(x => x.id === id) || null;
export const getRisk = (id) => findById(risks, id);
export const getControl = (id) => findById(controls, id);
export const getObligation = (id) => findById(obligations, id);
export const getIssue = (id) => findById(issues, id);
export const getEvidence = (id) => findById(evidenceRecords, id);
export const getSMF = (id) => findById(smfHolders, id);
export const getActor = (id) => findById(actors, id);
export const getProcessStep = (id) => findById(processSteps, id);
export const getProcess = (id) => findById(processes, id);
export const getKRI = (id) => findById(kris, id);
export const getAppetite = (id) => findById(riskAppetiteMetrics, id);
export const getControlInstance = (id) => findById(controlInstances, id);
export const getException = (id) => findById(exceptions, id);
export const getRemediation = (id) => findById(remediationActions, id);
export const getTest = (id) => findById(tests, id);
export const getWorkpaper = (id) => findById(workpapers, id);
export const getAuditPack = (id) => findById(auditPacks, id);
export const getInsight = (id) => findById(aiInsights, id);
export const getCoverageGap = (id) => findById(coverageGaps, id);
// Pass 7.0 — CRSA entity getters
export const getRiskArea = (id) => findById(riskAreas, id);
export const getControlObjective = (id) => findById(controlObjectives, id);
export const getGSR = (id) => findById(groupSetRequirements, id);
export const getCRSACycle = (id) => findById(crsaAttestationCycles, id);
export const getAttestationLine = (id) => findById(crsaAttestationLines, id);

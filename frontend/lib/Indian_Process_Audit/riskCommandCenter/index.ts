import type { ProcessAuditDomainId } from '@/lib/Indian_Process_Audit/types';
import { domains, portfolio } from './auditData';
import { IPA_TO_RCC_DOMAIN_ID } from './domainMap';
import type { RccDomain, RccPortfolioRollup } from './types';

export { domains, portfolio, meta } from './auditData';
export {
  aiWall,
  clocksAtRisk,
  domainById,
  governance,
  incidents,
  issues,
  postureKpis,
  regDeadlines,
  riskAppetite,
  riskDomains,
  supervisory,
  topMovers,
} from './cockpitData';
export {
  getIpaIdFromRccDomainId,
  IPA_TO_RCC_DOMAIN_ID,
  RCC_JOURNEY_DOMAIN_IDS,
} from './domainMap';
export { buildDomainIntel } from './domainIntel';
export type {
  DomainAiInsight,
  DomainControlFailure,
  DomainFlaggedCase,
  DomainHotspot,
  DomainIntel,
  DomainOwnerLoad,
} from './domainIntel';
export type {
  AiInsightTag,
  CockpitDrillNav,
  CockpitMeta,
  CockpitTone,
  CockpitTrend,
  DeadlineStatus,
  IssueSeverity,
  RccCase,
  RccCaseStatus,
  RccDomain,
  RccEvidenceItem,
  RccJourneyStepStatus,
  RccPortfolioRollup,
  RccStage,
  RiskDomainTile,
} from './types';

const byRccId = new Map(domains.map((d) => [d.id, d]));

export function getRiskCommandCenterDomain(
  ipaDomainId: ProcessAuditDomainId,
): RccDomain | undefined {
  const rccId = IPA_TO_RCC_DOMAIN_ID[ipaDomainId];
  return byRccId.get(rccId);
}

export function getRiskCommandCenterPortfolio(): RccPortfolioRollup {
  return portfolio as RccPortfolioRollup;
}

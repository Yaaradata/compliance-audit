/** Journey stage outcome for a single case (mini-journey strip). */
export type RccJourneyStepStatus = 'pass' | 'fail' | 'review' | 'blocked';

export type RccCaseStatus = 'Critical' | 'Exception' | 'Completed';

export interface RccControlCheck {
  id: string;
  label: string;
  status: 'pass' | 'fail';
}

export interface RccEvidenceItem {
  name: string;
  source: string;
  kind: string;
  size: string;
}

export interface RccCaseOwner {
  name: string;
  role: string;
  emp: string;
  site: string;
  time: string;
}

export interface RccCase {
  id: string;
  title: string;
  subtitle: string;
  status: RccCaseStatus;
  exception: string;
  failedStage: string | null;
  stageLabel?: string;
  purpose?: string;
  accountable?: string;
  journey: Record<string, RccJourneyStepStatus>;
  owner?: RccCaseOwner;
  controls?: RccControlCheck[];
  evidence?: RccEvidenceItem[];
  observation?: string;
}

export interface RccStage {
  key: string;
  label: string;
  reached: number;
  passed: number;
  failed: number;
  review: number;
}

export interface RccDomain {
  id: string;
  name: string;
  short: string;
  entity: string;
  total: number;
  completed: number;
  critical: number;
  exception: number;
  review: number;
  stages: RccStage[];
  stageKeys: string[];
  cases: RccCase[];
}

export interface RccPortfolioRollup {
  total: number;
  completed: number;
  critical: number;
  exception: number;
  review: number;
  compliancePct: number;
  domainCount: number;
}

export type CockpitTone = 'good' | 'warn' | 'bad' | 'gap';
export type CockpitTrend = 'up' | 'down' | 'flat';
export type AiInsightTag = 'REGULATORY' | 'FRAUD' | 'CONDUCT' | 'CYBER' | 'CREDIT';
export type DeadlineStatus = 'on-track' | 'at-risk' | 'degraded' | 'overdue';
export type IssueSeverity = 'HIGH' | 'MED' | 'LOW';

export interface CockpitMeta {
  product: string;
  subtitle: string;
  title: string;
  period: string;
  asOf: string;
  personas: string[];
  user: string;
  initials: string;
}

export interface PostureKpi {
  key: string;
  label: string;
  value: string;
  tone: CockpitTone;
  trend: CockpitTrend;
  sub: string;
  appetite: string;
  spark: number[];
}

export interface AiWallItem {
  id: string;
  tag: AiInsightTag;
  confidence: number;
  title: string;
  recommendation: string;
  link: string;
}

export interface RiskAppetiteRow {
  metric: string;
  actual: string;
  limit: string;
  status: CockpitTone;
  pos: number;
  note: string;
}

export interface RiskDomainTile {
  id: string;
  name: string;
  res: number;
  inherent: number;
  trend: CockpitTrend;
  status: CockpitTone;
  aiFlag: boolean;
  link: string;
  note: string;
}

export type CockpitDrillNav =
  | { view: 'domain'; domainId: string; stageKey: string | null }
  | { view: 'case'; domainId: string; caseId: string }
  | null;

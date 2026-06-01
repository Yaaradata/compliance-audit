/**
 * Domain intelligence — derives CRO/CXO-grade signals from a single domain's
 * aggregated funnel + actionable cases. Pure functions, no UI. Components read
 * the assembled `DomainIntel` instead of re-deriving from raw cases.
 */
import { aiWall, riskDomains } from './cockpitData';
import type {
  AiInsightTag,
  RccCase,
  RccDomain,
  RiskDomainTile,
} from './types';

export interface DomainHotspot {
  stageKey: string;
  stageLabel: string;
  failed: number;
  review: number;
  reached: number;
  passRate: number;
}

export interface DomainControlFailure {
  id: string;
  label: string;
  failCount: number;
  caseIds: string[];
}

export interface DomainOwnerLoad {
  role: string;
  name: string;
  site: string;
  open: number;
  critical: number;
}

export interface DomainFlaggedCase {
  id: string;
  title: string;
  note: string;
}

export interface DomainAiInsight {
  id: string;
  tag: AiInsightTag;
  confidence: number;
  title: string;
  recommendation: string;
  caseId: string | null;
  severity: 'critical' | 'exception' | 'info';
}

export interface DomainIntel {
  residual: RiskDomainTile | null;
  hotspots: DomainHotspot[];
  topHotspot: DomainHotspot | null;
  controlFailures: DomainControlFailure[];
  ownerLoads: DomainOwnerLoad[];
  evidence: { withEvidence: number; actionable: number; documents: number };
  regulatoryExposure: DomainFlaggedCase[];
  slaAtRisk: DomainFlaggedCase[];
  aiInsights: DomainAiInsight[];
  cleanCount: number;
  actionableCount: number;
}

const DOMAIN_TAG: Record<string, AiInsightTag> = {
  'customer-kyc': 'REGULATORY',
  'credit-loans': 'CREDIT',
  transactions: 'REGULATORY',
  aml: 'FRAUD',
  'it-change': 'CYBER',
  'infra-cyber': 'CYBER',
  'data-gov': 'CONDUCT',
  'fin-reporting': 'REGULATORY',
  'ops-3p': 'CONDUCT',
};

const REG_PATTERN = /statutory|reg-reportable|RBI|FIU|DPDP|FATCA|CRS|FEMA|LRS|CTR|STR|CKYCR|IRAC|Basel/i;
const SLA_PATTERN = /SLA|breach risk|days?\b|overdue|beyond|window|pending/i;

/** Deterministic confidence so re-renders are stable (no Math.random). */
function confFromId(id: string, base = 78, span = 18): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return base + (h % span);
}

function buildHotspots(domain: RccDomain): DomainHotspot[] {
  return domain.stages
    .filter((s) => s.failed > 0 || s.review > 0)
    .map((s) => ({
      stageKey: s.key,
      stageLabel: s.label,
      failed: s.failed,
      review: s.review,
      reached: s.reached,
      passRate: s.reached ? Math.round((s.passed / s.reached) * 100) : 100,
    }))
    .sort((a, b) => b.failed - a.failed || b.review - a.review);
}

function buildControlFailures(cases: RccCase[]): DomainControlFailure[] {
  const map = new Map<string, DomainControlFailure>();
  for (const kase of cases) {
    for (const ctl of kase.controls ?? []) {
      if (ctl.status !== 'fail') continue;
      const existing = map.get(ctl.id);
      if (existing) {
        existing.failCount += 1;
        existing.caseIds.push(kase.id);
      } else {
        map.set(ctl.id, { id: ctl.id, label: ctl.label, failCount: 1, caseIds: [kase.id] });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.failCount - a.failCount);
}

function buildOwnerLoads(cases: RccCase[]): DomainOwnerLoad[] {
  const map = new Map<string, DomainOwnerLoad>();
  for (const kase of cases) {
    if (!kase.owner) continue;
    const key = kase.owner.role;
    const existing = map.get(key);
    const isCritical = kase.status === 'Critical' ? 1 : 0;
    if (existing) {
      existing.open += 1;
      existing.critical += isCritical;
    } else {
      map.set(key, {
        role: kase.owner.role,
        name: kase.owner.name,
        site: kase.owner.site,
        open: 1,
        critical: isCritical,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.critical - a.critical || b.open - a.open);
}

function buildAiInsights(domain: RccDomain, actionable: RccCase[]): DomainAiInsight[] {
  const tag = DOMAIN_TAG[domain.id] ?? 'REGULATORY';

  const curated: DomainAiInsight[] = aiWall.items
    .filter((a) => a.link === domain.id)
    .map((a) => ({
      id: a.id,
      tag: a.tag,
      confidence: a.confidence,
      title: a.title,
      recommendation: a.recommendation,
      caseId: null,
      severity: 'critical',
    }));

  const synthesized: DomainAiInsight[] = actionable
    .filter((c) => c.status === 'Critical')
    .map((c) => {
      const failedControl = (c.controls ?? []).find((ctl) => ctl.status === 'fail');
      return {
        id: `AID-${c.id}`,
        tag,
        confidence: confFromId(c.id),
        title: `${c.title} — ${c.exception}`,
        recommendation:
          c.observation ??
          (failedControl
            ? `Remediate control ${failedControl.id} (${failedControl.label}) before sign-off.`
            : 'Escalate to domain head for root-cause closure.'),
        caseId: c.id,
        severity: 'critical',
      };
    });

  const combined = [...curated, ...synthesized];
  if (combined.length === 0) {
    return [
      {
        id: `AID-clean-${domain.id}`,
        tag,
        confidence: 92,
        title: `${domain.name} sample is clean this cycle`,
        recommendation:
          'No stage-level control failures. Maintain sampling cadence and retain benchmarks for the next committee read-out.',
        caseId: null,
        severity: 'info',
      },
    ];
  }
  return combined.sort((a, b) => b.confidence - a.confidence);
}

export function buildDomainIntel(domain: RccDomain): DomainIntel {
  const actionable = domain.cases.filter((c) => c.status !== 'Completed');
  const hotspots = buildHotspots(domain);

  const regulatoryExposure: DomainFlaggedCase[] = actionable
    .filter((c) => REG_PATTERN.test(`${c.observation ?? ''} ${c.exception}`))
    .map((c) => ({ id: c.id, title: c.title, note: c.observation ?? c.exception }));

  const slaAtRisk: DomainFlaggedCase[] = actionable
    .filter(
      (c) =>
        (c.status === 'Exception' || c.status === 'Critical') &&
        SLA_PATTERN.test(`${c.observation ?? ''} ${c.exception}`),
    )
    .map((c) => ({ id: c.id, title: c.title, note: c.observation ?? c.exception }));

  const withEvidence = actionable.filter((c) => (c.evidence?.length ?? 0) > 0).length;
  const documents = actionable.reduce((sum, c) => sum + (c.evidence?.length ?? 0), 0);

  return {
    residual: riskDomains.find((d) => d.link === domain.id) ?? null,
    hotspots,
    topHotspot: hotspots[0] ?? null,
    controlFailures: buildControlFailures(actionable),
    ownerLoads: buildOwnerLoads(actionable),
    evidence: { withEvidence, actionable: actionable.length, documents },
    regulatoryExposure,
    slaAtRisk,
    aiInsights: buildAiInsights(domain, actionable),
    cleanCount: domain.completed,
    actionableCount: actionable.length,
  };
}

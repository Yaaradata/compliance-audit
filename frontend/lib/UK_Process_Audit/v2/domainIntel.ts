/**
 * UK Process Audit v2 — domain intelligence derived ONLY from UK `RccDomain`
 * data. No Indian curated AI-wall items; every insight maps 1:1 to a unique
 * critical case so keys and on-screen rows never duplicate.
 */
import type {
  AiInsightTag,
  RccCase,
  RccDomain,
} from '@/lib/Indian_Process_Audit/riskCommandCenter/types';
import type {
  DomainAiInsight,
  DomainControlFailure,
  DomainFlaggedCase,
  DomainHotspot,
  DomainIntel,
  DomainOwnerLoad,
} from '@/lib/Indian_Process_Audit/riskCommandCenter/domainIntel';

export type { DomainIntel, DomainAiInsight };

const UK_DOMAIN_TAG: Record<string, AiInsightTag> = {
  ONB: 'REGULATORY',
  DEP: 'CONDUCT',
  PAY: 'REGULATORY',
  LEN: 'CREDIT',
  COL: 'CONDUCT',
  FC: 'FRAUD',
  FRD: 'FRAUD',
  CMP: 'CONDUCT',
};

const UK_REG_PATTERN =
  /reg-reportable|statutory|MLR|FCA|PRA|SAMLA|POCA|DISP|PSR|OFSI|HM Treasury|Pay\.UK/i;
const SLA_PATTERN = /SLA|breach risk|days?\b|overdue|beyond|window|pending|within SLA/i;

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/** Panel note — same contract as Indian v3 (`observation` with `exception` fallback). */
function panelNote(c: RccCase): string {
  return c.observation ?? c.exception;
}

function confFromId(id: string, base = 78, span = 18): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return base + (h % span);
}

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) map.set(row.id, row);
  return [...map.values()];
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
        if (!existing.caseIds.includes(kase.id)) {
          existing.failCount += 1;
          existing.caseIds.push(kase.id);
        }
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
  const tag = UK_DOMAIN_TAG[domain.id] ?? 'REGULATORY';

  const seen = new Set<string>();
  const insights: DomainAiInsight[] = [];

  for (const c of actionable) {
    if (c.status !== 'Critical') continue;
    if (seen.has(c.id)) continue;
    seen.add(c.id);

    const failedControl = (c.controls ?? []).find((ctl) => ctl.status === 'fail');
    insights.push({
      id: `AID-${domain.id}-${c.id}`,
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
    });
  }

  if (insights.length === 0) {
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

  return insights.sort((a, b) => b.confidence - a.confidence);
}

export function buildUkDomainIntel(domain: RccDomain): DomainIntel {
  const actionable = uniqueById(domain.cases.filter((c) => c.status !== 'Completed'));
  const hotspots = buildHotspots(domain);

  const regulatoryExposure = uniqueById(
    actionable
      .filter((c) => UK_REG_PATTERN.test(`${c.observation ?? ''} ${c.exception}`))
      .map((c) => ({ id: c.id, title: c.title, note: panelNote(c) })),
  );

  const slaAtRisk = uniqueById(
    actionable
      .filter(
        (c) =>
          (c.status === 'Exception' || c.status === 'Critical') &&
          SLA_PATTERN.test(`${c.observation ?? ''} ${c.exception}`),
      )
      .map((c) => ({ id: c.id, title: c.title, note: panelNote(c) })),
  );

  const withEvidence = actionable.filter((c) => (c.evidence?.length ?? 0) > 0).length;
  const documents = actionable.reduce((sum, c) => sum + (c.evidence?.length ?? 0), 0);

  return {
    residual: null,
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

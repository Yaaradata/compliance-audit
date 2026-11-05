/**
 * Adapters that let Horizon Scanning items and enforcement queue notices use the
 * same investigation drawer and disposition log as detected board signals.
 */
import { categoryLabel, V8_CONFIG } from "./config";
import type { EnforcementNoticeItem } from "./enforcementCoverage";
import { getAccountability } from "./riskDomainsV8";
import { precedentsSinceAttestation } from "./smcrPrecedentAwareness";
import type { BoardSignal, HorizonItem, Precedent } from "./types";

type SignalFields = {
  id: string;
  title: BoardSignal["title"];
  domainId: string;
  observed: string;
  soWhat: string;
  metricValue: string | number;
  metricLabel: string;
  precedent: Precedent | null;
  trigger: string;
};

function externalSignal(fields: SignalFields): BoardSignal {
  const precedents = fields.precedent ? [fields.precedent] : [];
  return {
    id: fields.id,
    title: fields.title,
    mechanism: "periodic-review-absent",
    severity: "S3",
    status: "DETECTED_SIGNAL",
    domainId: fields.domainId,
    domainName: categoryLabel(fields.domainId),
    signalObserved: fields.observed,
    soWhat: fields.soWhat,
    primaryMetric: { value: fields.metricValue, label: fields.metricLabel },
    expected: "A recorded view on whether this applies to the firm",
    observed: "No applicability assessment on record",
    evidenceRefs: [],
    missingEvidence: ["Applicability assessment for this firm"],
    precedents,
    primaryPrecedent: fields.precedent,
    derivation: "RULE",
    confidence: { level: "high", basis: "Published external item; applicability not yet assessed by the firm" },
    detectionVersion: "horizon-scan@1.0.0",
    evaluatedAt: `${V8_CONFIG.asOf}T00:00:00.000Z`,
    accountability: getAccountability(fields.domainId, "UK"),
    alternativeExplanation: "The item may not apply to this firm once assessed. That decision has not been recorded.",
    trigger: fields.trigger,
  };
}

const ITEM_TITLE: Record<"industry" | "emerging", BoardSignal["title"]> = {
  industry: "Industry Event",
  emerging: "Emerging Risk",
};

export function horizonItemToSignal(item: HorizonItem): BoardSignal {
  const type = item.type === "emerging" ? "emerging" : "industry";
  return externalSignal({
    id: item.id,
    title: ITEM_TITLE[type],
    domainId: item.categoryId,
    observed: item.title,
    soWhat: item.summary,
    metricValue: item.source,
    metricLabel: "source",
    precedent: null,
    trigger: `External ${type === "industry" ? "industry event" : "emerging risk"} added to the horizon scan`,
  });
}

export function precedentToSignal(precedent: Precedent): BoardSignal {
  return externalSignal({
    id: `read-across-${precedent.id}`,
    title: "Enforcement Notice",
    domainId: precedent.domainScope[0] ?? "regulatory",
    observed: `${precedent.regulator} notice to ${precedent.respondent}`,
    soWhat: precedent.hook,
    metricValue: precedent.noticeDate,
    metricLabel: "notice date",
    precedent,
    trigger: "Notice published since an SMF's last attestation and touching controls they own",
  });
}

type ReadAcrossHolder = {
  id: string;
  smfFunction: string;
  lastAttestationDate: string;
  accountableControlIds: string[];
};

/**
 * Enforcement read-across from Reasonable Steps, so both screens show one population.
 * Notices already in the applicability queue are left out, and unverified ones never appear.
 */
export function readAcrossPrecedents(holders: ReadAcrossHolder[], queuedIds: ReadonlySet<string>): Precedent[] {
  const seen = new Map<string, Precedent>();
  for (const holder of holders) {
    const rows = precedentsSinceAttestation({
      smfId: holder.id,
      smfFunction: holder.smfFunction,
      lastAttestationDate: holder.lastAttestationDate,
      accountableControlIds: holder.accountableControlIds,
    });
    for (const { precedent } of rows) {
      if (precedent.confidence === "unverified" || queuedIds.has(precedent.id)) continue;
      seen.set(precedent.id, precedent);
    }
  }
  return [...seen.values()].sort((a, b) => b.noticeDate.localeCompare(a.noticeDate));
}

export function noticeToSignal(notice: EnforcementNoticeItem): BoardSignal {
  return externalSignal({
    id: `queue-${notice.id}`,
    title: "Enforcement Notice",
    domainId: notice.precedent.domainScope[0] ?? "regulatory",
    observed: `${notice.regulatorBody} notice to ${notice.precedent.respondent}`,
    soWhat: notice.precedent.hook,
    metricValue: `${notice.ageDays}d`,
    metricLabel: "not assessed",
    precedent: notice.precedent,
    trigger: "Published notice reaches controls the firm owns and has no applicability assessment",
  });
}

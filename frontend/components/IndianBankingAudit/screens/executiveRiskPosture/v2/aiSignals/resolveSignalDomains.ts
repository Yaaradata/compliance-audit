import type { AIInsight } from '../../../../dataModel';
import { getControl, getRisk, risks } from '../../../../dataModel';

/** Map an insight to ORM domain codes for heatmap ✨ indicators. */
export function resolveSignalDomainIds(ins: AIInsight): string[] {
  const domains = new Set<string>();

  for (const ctrlId of ins.linked_control_ids) {
    const ctrl = getControl(ctrlId);
    for (const riskId of ctrl?.linked_risks ?? []) {
      const risk = getRisk(riskId);
      if (risk?.domain_id) domains.add(risk.domain_id);
    }
  }

  const t = ins.title.toLowerCase();
  if (/aml|str|pmla|fiu|ctr|mlro|fcc/.test(t)) domains.add('R-FC');
  if (/upi|mule|fraud/.test(t)) domains.add('R-FR');
  if (/kyc|ckycr|ckycr|rekyc|cohort/.test(t)) domains.add('R-CO');
  if (/kfs|lending|dsa|dl-app|conduct/.test(t)) domains.add('R-CD');
  if (/vendor|outsourc|fourth-party|tpsp/.test(t)) domains.add('R-TP');
  if (/cyber|cert-in|ito/.test(t)) domains.add('R-TC');

  if (!domains.size) {
    const anyRisk = risks.find((r) => ins.linked_control_ids.some((c) => getControl(c)?.linked_risks.includes(r.risk_id)));
    if (anyRisk?.domain_id) domains.add(anyRisk.domain_id);
  }

  return [...domains];
}

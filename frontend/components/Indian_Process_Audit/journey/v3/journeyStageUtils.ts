import type { RccCase, RccDomain, RccStage } from '@/lib/Indian_Process_Audit/riskCommandCenter';

/** Actionable cases tied to a funnel stage (fail, review, or failedStage match). */
export function getCasesAtStage(domain: RccDomain, stageKey: string): RccCase[] {
  return domain.cases.filter((c) => {
    if (c.status === 'Completed') return false;
    const step = c.journey[stageKey];
    return c.failedStage === stageKey || step === 'fail' || step === 'review';
  });
}

export function getStageByKey(domain: RccDomain, stageKey: string): RccStage | undefined {
  return domain.stages.find((s) => s.key === stageKey);
}

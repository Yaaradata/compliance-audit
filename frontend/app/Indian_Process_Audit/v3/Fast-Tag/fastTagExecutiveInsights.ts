import { buildFastTagAiInsightsMemo } from './fastTagAiInsights';
import { buildFastTagSelectionSummary } from './fastTagRegionSummary';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import type { FastTagSop } from './fastTagCaseBuilder';
import type { FastTagAiInsightsMemo } from './fastTagAiInsights';

export function buildPersonaAiMemo({
  persona,
  cases,
  allCases,
  sop,
  regionCode,
  getStageHeader,
}: {
  persona: 'coh' | 'hob';
  cases: FastTagCaseLike[];
  allCases: FastTagCaseLike[];
  sop: FastTagSop;
  regionCode: string | null;
  getStageHeader: (stage: { id: string; name: string }) => string;
}): FastTagAiInsightsMemo {
  const summary = buildFastTagSelectionSummary({
    cases,
    allCases,
    sop,
    regionCode: regionCode ?? '',
    stageFilter: persona === 'coh' ? 'wallet' : null,
    viewAllIndia: !regionCode,
    getStageHeader,
  });
  const memo = buildFastTagAiInsightsMemo(summary);
  if (persona === 'coh') {
    return {
      ...memo,
      blocks: memo.blocks.map((b) =>
        b.id === 'action'
          ? {
              ...b,
              text: b.text.includes('wallet')
                ? b.text
                : `${b.text} Prioritise wallet-stage and FT-11 plaza breaks for CX recovery.`,
            }
          : b,
      ),
    };
  }
  return {
    ...memo,
    blocks: memo.blocks.map((b) =>
      b.id === 'action'
        ? {
            ...b,
            text: b.text.includes('CRO')
              ? b.text
              : `${b.text} Align renewal briefs with fleet-channel pending cases.`,
          }
        : b,
    ),
  };
}

'use client';

import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import type { FastTagExecutiveContext } from './fastTagExecutiveTypes';
import type { FastTagSop } from './fastTagCaseBuilder';
import FastTagCOHExecutiveLayout from './FastTagCOHExecutiveLayout';

type Props = {
  ctx: FastTagExecutiveContext;
  cases: FastTagCaseLike[];
  allCases: FastTagCaseLike[];
  controls: AuditControl[];
  sop: FastTagSop;
  getStageHeader: (stage: { id: string; name: string }) => string;
};

export default function FastTagCOHView({
  ctx,
  cases,
  allCases,
  controls,
  sop,
  getStageHeader,
}: Props) {
  return (
    <FastTagCOHExecutiveLayout
      ctx={ctx}
      cases={cases}
      allCases={allCases}
      controls={controls}
      sop={sop}
      getStageHeader={getStageHeader}
    />
  );
}

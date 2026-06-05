'use client';

import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import type { FastTagExecutiveContext } from './fastTagExecutiveTypes';
import type { FastTagSop } from './fastTagCaseBuilder';
import type { FastTagGatewayTileId } from './fastTagGatewayData';
import FastTagHoBExecutiveLayout from './FastTagHoBExecutiveLayout';

type Props = {
  ctx: FastTagExecutiveContext;
  cases: FastTagCaseLike[];
  allCases: FastTagCaseLike[];
  controls: AuditControl[];
  sop: FastTagSop;
  getStageHeader: (stage: { id: string; name: string }) => string;
  onGatewayDrill?: (tileId: FastTagGatewayTileId) => void;
};

export default function FastTagHoBView({
  ctx,
  cases,
  allCases,
  controls,
  sop,
  getStageHeader,
  onGatewayDrill,
}: Props) {
  return (
    <FastTagHoBExecutiveLayout
      ctx={ctx}
      cases={cases}
      allCases={allCases}
      controls={controls}
      sop={sop}
      getStageHeader={getStageHeader}
      onGatewayDrill={onGatewayDrill}
    />
  );
}

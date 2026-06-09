'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import type { FastTagGatewayTileId } from './fastTagGatewayData';
import { COH_GATEWAY_TILES } from './fastTagGatewayData';

type DrillProps = {
  onBack?: () => void;
  cases?: FastTagCaseLike[];
};

const FastagCXJourneyDrilldown = dynamic(
  () => import('./drilldowns/FastagCXJourneyDrilldown'),
  { ssr: false },
) as ComponentType<DrillProps>;

const COH_DRILL_BY_TILE: Partial<Record<FastTagGatewayTileId, ComponentType<DrillProps>>> = {
  sales_issuance: FastagCXJourneyDrilldown,
};

type Props = {
  drillId: FastTagGatewayTileId;
  onBack: () => void;
  cases?: FastTagCaseLike[];
  immersive?: boolean;
};

export default function FastTagCOHGatewayDrill({
  drillId,
  onBack,
  cases = [],
  immersive = false,
}: Props) {
  const Drill = COH_DRILL_BY_TILE[drillId];
  const title = COH_GATEWAY_TILES.find((t) => t.id === drillId)?.title;

  if (!Drill) return null;

  const shellClass = immersive
    ? 'min-h-0 w-full bg-slate-50'
    : 'overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200';
  const bodyClass = immersive
    ? 'w-full bg-slate-50'
    : 'max-h-[min(78vh,960px)] overflow-y-auto overscroll-contain bg-slate-50';

  return (
    <div className={shellClass}>
      {title ? <p className="sr-only">{title}</p> : null}
      <div className={bodyClass}>
        <Drill onBack={onBack} cases={cases} />
      </div>
    </div>
  );
}

export function isCohGatewayDrillAvailable(tileId: FastTagGatewayTileId): boolean {
  return tileId in COH_DRILL_BY_TILE;
}

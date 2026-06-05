'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import type { FastTagGatewayTileId } from './fastTagGatewayData';
import { HOB_GATEWAY_TILES } from './fastTagGatewayData';

type DrillProps = {
  onBack?: () => void;
  cases?: FastTagCaseLike[];
};

const FastagPerformanceDrilldown = dynamic(
  () => import('./drilldowns/FastagPerformanceDrilldown'),
  { ssr: false },
) as ComponentType<DrillProps>;

const FastagGrowthDrilldown = dynamic(
  () => import('./drilldowns/FastagGrowthDrilldown'),
  { ssr: false },
);

const FastagIssuesDrilldown = dynamic(
  () => import('./drilldowns/FastagIssuesDrilldown'),
  { ssr: false },
);

const DRILL_BY_TILE: Record<FastTagGatewayTileId, ComponentType<DrillProps>> = {
  sales_issuance: FastagPerformanceDrilldown,
  ecosystem_partner: FastagGrowthDrilldown,
  operations_escalations: FastagIssuesDrilldown,
};

type Props = {
  drillId: FastTagGatewayTileId;
  onBack: () => void;
  cases?: FastTagCaseLike[];
  /** Full-page layout — no inner scroll box (uses main workspace scroll). */
  immersive?: boolean;
};

export default function FastTagHoBGatewayDrill({
  drillId,
  onBack,
  cases = [],
  immersive = false,
}: Props) {
  const Drill = DRILL_BY_TILE[drillId];
  const title = HOB_GATEWAY_TILES.find((t) => t.id === drillId)?.title;

  const shellClass = immersive
    ? 'min-h-0 w-full bg-slate-50'
    : 'overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200';
  const bodyClass = immersive
    ? 'w-full bg-slate-50'
    : 'max-h-[min(78vh,960px)] overflow-y-auto overscroll-contain bg-slate-50';

  return (
    <div className={shellClass}>
      {title ? (
        <p className="sr-only">{title}</p>
      ) : null}
      <div className={bodyClass}>
        <Drill onBack={onBack} cases={cases} />
      </div>
    </div>
  );
}

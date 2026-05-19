'use client';

import type { KRI } from '../../dataModel';
import { arrowSymbol, formatKriValue } from './kriCardLogic';
import type { KriTileModel } from './buildKriTileModel';
import { KRI_C } from './kriMonitoringTokens';
import { KriSparkline } from './KriSparkline';
import { KRI_TILE_METRIC_ROW_MIN_H_PX, KRI_TILE_SPARK_HEIGHT_PX } from './kriTileLayout';

type TrendTok = (typeof KRI_C)[keyof typeof KRI_C];

/** Value + thresholds (left) · 12w sparkline fills right pane. */
export function KriTileMetricBlock({
  model,
  kri,
  bandFg,
  trendTok,
}: {
  model: KriTileModel;
  kri: KRI;
  bandFg: string;
  trendTok: TrendTok;
}) {
  return (
    <div
      className="flex w-full min-w-0 px-3 pb-2 pt-0.5"
      style={{ minHeight: KRI_TILE_METRIC_ROW_MIN_H_PX }}
    >
      <div className="flex max-w-[48%] shrink-0 flex-col justify-center py-1 pr-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold leading-none" style={{ color: bandFg }}>
            {model.valueDisplay}
          </span>
          <span className="text-[10px] font-medium text-[#9CA3AF]">{model.unitLabel}</span>
          <span className="ml-1 text-sm font-bold leading-none" style={{ color: trendTok.fg }} aria-hidden>
            {arrowSymbol(model.trend)}
          </span>
        </div>

        <div className="mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0 text-[9px] leading-tight text-[#9CA3AF]">
          <span>
            amber{' '}
            <strong className="font-bold" style={{ color: KRI_C.amber.fg }}>
              {formatKriValue(model.thresholds.amber, kri.unit)}
            </strong>
          </span>
          <span className="text-[#D1D5DB]">·</span>
          <span>
            red{' '}
            <strong className="font-bold" style={{ color: KRI_C.red.fg }}>
              {formatKriValue(model.thresholds.red, kri.unit)}
            </strong>
          </span>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 items-stretch self-stretch border-l border-[#E8EAED] pl-2 pr-0.5">
        <KriSparkline
          data={model.spark}
          thresholds={model.thresholds}
          band={model.band}
          height={KRI_TILE_SPARK_HEIGHT_PX}
          className="h-full w-full min-w-0"
        />
      </div>
    </div>
  );
}


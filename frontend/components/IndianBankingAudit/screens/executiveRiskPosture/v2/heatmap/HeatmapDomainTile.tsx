'use client';

import { trendArrow } from '../../../../theme';
import type { DomainHeatmapCell } from '../../types';
import { HEATMAP_TONE, heatmapScoreTone } from '../cockpitTokens';
import { HEATMAP_TILE } from './heatmapTileTokens';

export function HeatmapDomainTile({
  cell,
  insightText,
  hasStrategicSignal,
  onSelect,
}: {
  cell: DomainHeatmapCell;
  insightText: string;
  hasStrategicSignal: boolean;
  onSelect: (cell: DomainHeatmapCell) => void;
}) {
  const tone = heatmapScoreTone(cell.resScore);
  const palette = HEATMAP_TONE[tone];
  const tooltip = `${cell.title} · RES ${cell.resScore} · ${insightText}`;

  return (
    <button
      type="button"
      title={tooltip}
      onClick={() => onSelect(cell)}
      style={{
        borderColor: palette.border,
        backgroundColor: palette.bg,
      }}
      className={`flex w-full flex-col overflow-hidden border text-left transition hover:shadow-md ${HEATMAP_TILE.radius} ${HEATMAP_TILE.pad}`}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-1"
        style={{ minHeight: HEATMAP_TILE.headerMinH }}
      >
        <span
          className={`min-w-0 flex-1 truncate font-semibold leading-tight text-[#111827] ${HEATMAP_TILE.titleSize}`}
        >
          {cell.title}
        </span>
        <span
          className={`flex shrink-0 items-center gap-0.5 font-mono font-bold leading-none ${HEATMAP_TILE.scoreSize}`}
          style={{ color: palette.text }}
        >
          {cell.resScore}
          <span className="text-[9px] font-normal text-[#9CA3AF]" aria-hidden>
            {trendArrow(cell.trend)}
          </span>
          {hasStrategicSignal ? (
            <span className="text-[10px] text-[#F59E0B]" aria-label="Active strategic AI signal">
              ✨
            </span>
          ) : null}
        </span>
      </div>

      <p className={`mt-1 shrink-0 leading-[1.25] text-[#4B5563] line-clamp-2 ${HEATMAP_TILE.insightSize}`}>
        {insightText}
      </p>
    </button>
  );
}

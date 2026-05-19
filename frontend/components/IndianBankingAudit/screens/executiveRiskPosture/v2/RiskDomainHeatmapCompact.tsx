'use client';

import type { DomainHeatmapCell } from '../types';
import { HeatmapDomainTile, HEATMAP_TILE } from './heatmap';

/** Full-width 3×3 heatmap — compact tiles, content-sized (no fixed empty height). */
export function RiskDomainHeatmapCompact({
  domains,
  domainInsightByDomain,
  tier1SignalByDomain = new Map(),
  atRiskClockCount = 0,
  onDomainSelect,
}: {
  domains: DomainHeatmapCell[];
  domainInsightByDomain: Map<string, string>;
  tier1SignalByDomain?: Map<string, string>;
  atRiskClockCount?: number;
  onDomainSelect: (cell: DomainHeatmapCell) => void;
}) {
  return (
    <section aria-label="Risk domain heatmap" className="shrink-0">
      <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-[#111827]">Risk Domain Heatmap</h2>
            {atRiskClockCount > 0 ? (
              <span className="rounded-full border border-[#D97706] bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#D97706]">
                {atRiskClockCount} clock{atRiskClockCount !== 1 ? 's' : ''} at-risk
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] text-[#6B7280]">
            9 risk domains · inherent · residual · trend · RES — click any domain to drill into failing controls
          </p>
        </div>
      </header>

      <div className={`grid grid-cols-3 ${HEATMAP_TILE.gridGap}`}>
        {domains.map((cell) => (
          <HeatmapDomainTile
            key={cell.domainId}
            cell={cell}
            insightText={domainInsightByDomain.get(cell.domainId) ?? ''}
            hasStrategicSignal={tier1SignalByDomain.has(cell.domainId)}
            onSelect={onDomainSelect}
          />
        ))}
      </div>
    </section>
  );
}

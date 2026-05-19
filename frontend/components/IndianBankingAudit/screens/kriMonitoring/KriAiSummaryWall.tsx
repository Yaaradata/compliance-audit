'use client';

import { useMemo } from 'react';
import type { KRI } from '../../dataModel';
import type { OpenDrawer } from '../../types';
import { buildKriAiSummary } from './buildKriAiSummary';
import { KriAiSummaryPointCard } from './KriAiSummaryPointCard';

/** Height matches first 3 KRI layers; points list scrolls inside. */
export function KriAiSummaryWall({
  kris,
  openDrawer,
  heightPx,
}: {
  kris: KRI[];
  openDrawer: OpenDrawer;
  heightPx?: number;
}) {
  const vm = useMemo(() => buildKriAiSummary(kris), [kris]);

  return (
    <aside
      aria-label="AI Summary Wall"
      style={heightPx ? { height: heightPx } : undefined}
      className="flex min-h-[280px] shrink-0 flex-col overflow-hidden rounded-lg border border-[#DDE1E8] bg-[#F6F7F9] shadow-sm xl:min-h-0"
    >
      <header className="shrink-0 border-b border-[#DDE1E8] px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
          <span className="text-[#F59E0B]" aria-hidden>
            ✨
          </span>
          AI Summary Wall
        </h2>
        <p className="mt-0.5 text-[10px] text-[#6B7280]">
          {vm.queueCount} in review queue · Updated {vm.updatedTime} IST
        </p>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3 [scrollbar-width:thin]"
        role="region"
        aria-label="AI summary points"
      >
        {vm.points.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#9CA3AF]">All KRIs within green band.</p>
        ) : (
          vm.points.map((point) => (
            <KriAiSummaryPointCard
              key={point.id}
              point={point}
              onOpen={() => openDrawer('kri', point.code, 'kriMonitoring')}
            />
          ))
        )}
      </div>
    </aside>
  );
}

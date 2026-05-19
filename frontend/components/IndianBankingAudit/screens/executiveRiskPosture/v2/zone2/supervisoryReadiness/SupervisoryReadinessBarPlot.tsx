'use client';

import { oriFocusRing } from '../../../../../theme';
import type { OpenDrawer, SetActiveScreen } from '../../../../../types';
import type { SupervisoryBarPlotRow } from './buildSupervisoryBarPlotModel';

const PLOT_ROW_H = 34;
const GRID_COLS = 'minmax(0,42%) 1fr 2.75rem';

export function SupervisoryReadinessBarPlot({
  rows,
  openDrawer,
  setActiveScreen,
}: {
  rows: SupervisoryBarPlotRow[];
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="mb-2 grid shrink-0 gap-x-2 gap-y-0 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]"
        style={{ gridTemplateColumns: GRID_COLS }}
        aria-hidden
      >
        <span>Lens</span>
        <span className="text-center">ARS (0–100)</span>
        <span className="text-right">Score</span>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col justify-between gap-0.5">
        {rows.map((row) => (
          <BarPlotRow
            key={row.lensId}
            row={row}
            onActivate={() => {
              if (row.hasGap) {
                setActiveScreen('inspectionReadiness');
                return;
              }
              if (row.primaryPackId) {
                openDrawer('auditPack', row.primaryPackId, 'riskPosture');
              }
            }}
          />
        ))}
      </ul>

      <PlotLegend />
    </div>
  );
}

function BarPlotRow({ row, onActivate }: { row: SupervisoryBarPlotRow; onActivate: () => void }) {
  const barWidth = row.hasGap ? 0 : Math.min(100, row.score ?? 0);

  return (
    <li>
      <button
        type="button"
        title={row.tooltip}
        onClick={onActivate}
        className={`grid w-full items-center gap-x-2 rounded-md px-1 py-1 text-left transition hover:bg-[#EFF1F4] ${oriFocusRing}`}
        style={{ gridTemplateColumns: GRID_COLS, minHeight: PLOT_ROW_H }}
      >
        <span className="truncate text-[13px] font-semibold leading-snug text-[#111827]" title={row.shortLabel}>
          {row.shortLabel}
        </span>

        <div className="relative h-3 overflow-hidden rounded-sm bg-[#DDE1E8]" aria-hidden>
          {row.hasGap ? (
            <div className="h-full w-full rounded-sm border border-dashed border-[#FCA5A5] bg-[#FEF2F2]" />
          ) : (
            <div
              className="absolute inset-y-0 left-0 rounded-sm"
              style={{ width: `${barWidth}%`, backgroundColor: row.barColor }}
            />
          )}
        </div>

        <span className="text-right">
          {row.hasGap ? (
            <span className="inline-block rounded border border-[#FECACA] bg-[#FEF2F2] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#DC2626]">
              GAP
            </span>
          ) : (
            <span className="font-mono text-[13px] font-bold tabular-nums" style={{ color: row.scoreColor }}>
              {row.score}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

function PlotLegend() {
  return (
    <div className="mt-2 flex shrink-0 flex-wrap gap-x-3 gap-y-1 border-t border-[#DDE1E8] pt-2 text-[10px] text-[#6B7280]">
      <LegendSwatch color="#22C55E" label="≥85" />
      <LegendSwatch color="#F59E0B" label="70–84" />
      <LegendSwatch color="#EF4444" label={'<70'} />
      <span className="text-[#DC2626]">GAP · no packs</span>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block h-2 w-3.5 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

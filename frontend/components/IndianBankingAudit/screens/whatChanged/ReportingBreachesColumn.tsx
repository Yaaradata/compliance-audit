'use client';

import { buildReportingBreachesColumnData, type MetricBreachRow } from './buildReportingBreachesColumn';
import { WCW_COLUMN_WEEK_DELTAS } from './buildWcwColumnWeekDeltas';
import { WcwColumnEmpty } from './WcwColumnEmpty';
import { WhatChangedColumn } from './WhatChangedColumn';

function formatRatio(value: number): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

function DeltaArrow({ direction }: { direction: MetricBreachRow['deltaDirection'] }) {
  if (direction === 'down') {
    return <span className="text-sm font-bold text-[#DC2626]" aria-label="Worse than prior period">↓</span>;
  }
  if (direction === 'up') {
    return <span className="text-sm font-bold text-[#16A34A]" aria-label="Better than prior period">↑</span>;
  }
  return <span className="text-sm font-bold text-[#9CA3AF]" aria-hidden>—</span>;
}

function MetricBreachRowView({ row }: { row: MetricBreachRow }) {
  const valueClass = row.breached ? 'text-[#DC2626]' : 'text-[#111827]';

  return (
    <div className="min-h-[52px] border-b border-[#F3F4F6] py-2.5 last:border-b-0">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[13px] font-medium text-[#111827]">{row.metricName}</span>
        <span className="shrink-0 rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">
          {row.scopeLabel}
        </span>
      </div>
      <div className="mt-1 flex min-w-0 items-baseline justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className={`text-sm font-bold tabular-nums ${valueClass}`}>{formatRatio(row.value)}</span>
          <span className="text-[11px] text-[#9CA3AF]">threshold: {formatRatio(row.threshold)}</span>
        </div>
        <DeltaArrow direction={row.deltaDirection} />
      </div>
      {row.breached ? (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className="h-full rounded-full bg-[#DC2626]"
            style={{ width: `${row.progressPct}%` }}
            role="progressbar"
            aria-valuenow={row.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Pass 4 — reporting clocks + deduplicated metric threshold breaches. */
export function ReportingBreachesColumn() {
  const { clockChips, metricRows, countBadge, clockCount, metricCount } = buildReportingBreachesColumnData();

  return (
    <WhatChangedColumn
      label="Reporting Breaches"
      countBadge={countBadge}
      weekDelta={WCW_COLUMN_WEEK_DELTAS.reportingBreaches}
      accent="reporting"
    >
      {clockCount === 0 && metricCount === 0 ? (
        <WcwColumnEmpty message="No reporting breaches this week — clocks and metrics within threshold" />
      ) : (
        <>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
              Reporting clocks at-risk
            </h3>
            <div className="mt-2 flex flex-col gap-2">
              {clockChips.map((chip) => (
                <div
                  key={chip.clock.clock_id}
                  className={`inline-flex h-9 w-full items-center rounded-full border px-4 text-xs font-semibold ${chip.chipClass}`}
                >
                  <span className="truncate">{chip.label}</span>
                </div>
              ))}
            </div>
          </div>

          {metricCount > 0 ? (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                Metric threshold breaches
              </h3>
              <div className="mt-2 min-w-0">
                {metricRows.map((row) => (
                  <MetricBreachRowView key={row.observationId} row={row} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </WhatChangedColumn>
  );
}

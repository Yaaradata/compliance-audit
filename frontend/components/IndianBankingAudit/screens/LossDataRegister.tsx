'use client';

import React, { useMemo } from 'react';
import { lossEvents, type LossEvent } from '../dataModel';
import { formatInrLossDisplay } from '../inrFormat';
import { EmptyState, SectionCard, Stat } from '../primitives';
import type { OpenDrawer } from '../types';

const FY_START = '2025-04-01';
const FY_END = '2026-03-31';

const BASEL_EVENT_TYPES = [
  'internal_fraud',
  'external_fraud',
  'employment_practices_workplace_safety',
  'clients_products_business_practices',
  'damage_to_physical_assets',
  'business_disruption_system_failures',
  'execution_delivery_process_management',
] as const;

const BASEL_LABEL: Record<string, string> = {
  internal_fraud: 'Internal fraud',
  external_fraud: 'External fraud',
  employment_practices_workplace_safety: 'Employment / workplace',
  clients_products_business_practices: 'Clients / products / conduct',
  damage_to_physical_assets: 'Physical assets',
  business_disruption_system_failures: 'Disruption / systems',
  execution_delivery_process_management: 'Execution / delivery',
};

/** Okabeâ€“Itoâ€“inspired palette (no pure redâ€“green pairing). */
const BASEL_COLOR: Record<string, string> = {
  internal_fraud: '#0072B2',
  external_fraud: '#E69F00',
  employment_practices_workplace_safety: '#009E73',
  clients_products_business_practices: '#CC79A7',
  damage_to_physical_assets: '#56B4E9',
  business_disruption_system_failures: '#D55E00',
  execution_delivery_process_management: '#F0E442',
};

function isFy26Event(d: string): boolean {
  return d >= FY_START && d <= FY_END;
}

function recoveryTotal(ev: LossEvent): number {
  return (ev.direct_recovery_inr ?? 0) + (ev.insurance_recovery_inr ?? 0);
}

export function LossDataRegister({ openDrawer }: { openDrawer: OpenDrawer }) {
  const fyRows = useMemo(() => lossEvents.filter((e) => isFy26Event(e.event_date)), []);

  const kpis = useMemo(() => {
    let gross = 0;
    let net = 0;
    let rec = 0;
    for (const e of fyRows) {
      gross += e.gross_loss_inr;
      net += e.net_loss_inr;
      rec += recoveryTotal(e);
    }
    return { gross, net, rec, count: fyRows.length };
  }, [fyRows]);

  const byBasel = useMemo(() => {
    const m = new Map<string, { gross: number; net: number; rec: number; count: number }>();
    for (const t of BASEL_EVENT_TYPES) m.set(t, { gross: 0, net: 0, rec: 0, count: 0 });
    for (const e of fyRows) {
      const row = m.get(e.basel_event_type) || { gross: 0, net: 0, rec: 0, count: 0 };
      row.gross += e.gross_loss_inr;
      row.net += e.net_loss_inr;
      row.rec += recoveryTotal(e);
      row.count += 1;
      m.set(e.basel_event_type, row);
    }
    return m;
  }, [fyRows]);

  const totalGrossBasel = useMemo(() => {
    let s = 0;
    for (const t of BASEL_EVENT_TYPES) s += byBasel.get(t)?.gross ?? 0;
    return s;
  }, [byBasel]);

  const tableRows = useMemo(
    () => [...fyRows].sort((a, b) => (a.event_date < b.event_date ? 1 : -1)),
    [fyRows],
  );

  const barSegments = useMemo(
    () =>
      BASEL_EVENT_TYPES.map((et) => ({
        et,
        gross: byBasel.get(et)?.gross ?? 0,
        stats: byBasel.get(et)!,
      })).filter((s) => s.gross > 0),
    [byBasel]
  );

  return (
    <div className="space-y-6">
      <div className="text-xs text-slate-600">
        FY26 loss view (Indian FY Â· {FY_START} to {FY_END}). Amounts use INR lakh / crore display.
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat k="Gross loss YTD" v={formatInrLossDisplay(kpis.gross)} sub="FY26 Â· loss events" tone="rose" />
        <Stat k="Net loss YTD" v={formatInrLossDisplay(kpis.net)} sub="After recoveries" tone="amber" />
        <Stat k="Recovery YTD" v={formatInrLossDisplay(kpis.rec)} sub="Direct + insurance" tone="emerald" />
        <Stat k="Loss events YTD" v={kpis.count} sub="FY26 register rows" tone="slate" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Basel event type Â· gross loss share</div>
        <p className="mb-4 text-[11px] leading-relaxed text-slate-600">
          Segment width follows gross loss. <span className="font-medium text-slate-700">Labels inside the bar are % of total gross.</span>{' '}
          <span className="font-medium text-slate-700">Gross amounts (INR)</span> are in the cards under the bar â€” hover a segment for full figures.
        </p>

        <div
          className="flex h-11 w-full overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200"
          role="img"
          aria-label="Basel event type stacked bar by gross loss share"
        >
          {totalGrossBasel <= 0 ? (
            <div className="flex flex-1 items-center justify-center text-xs text-slate-500">No gross loss recorded in FY26</div>
          ) : (
            barSegments.map(({ et, gross, stats }) => {
              const label = BASEL_LABEL[et] || et;
              const tip = `${label} Â· ${stats.count} events Â· Gross ${formatInrLossDisplay(stats.gross)} (${((100 * gross) / totalGrossBasel).toFixed(1)}% of total) Â· Net ${formatInrLossDisplay(stats.net)} Â· Recovery ${formatInrLossDisplay(stats.rec)}`;
              const share = (100 * gross) / totalGrossBasel;
              const showPctInBar = share >= 6;
              const barLabel = `${share.toFixed(1)}%`;
              return (
                <div
                  key={et}
                  style={{ flex: `${gross} 1 0%` }}
                  className="group relative min-w-[3px] border-r border-white/60 last:border-r-0"
                  title={tip}
                  aria-label={tip}
                >
                  <div className="h-full w-full transition-opacity group-hover:opacity-90" style={{ backgroundColor: BASEL_COLOR[et] || '#64748b' }} />
                  {showPctInBar ? (
                    <span
                      className={`pointer-events-none absolute inset-0 flex items-center justify-center px-0.5 text-center font-bold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] ${
                        share < 10 ? 'text-[9px]' : 'text-[10px]'
                      } ${
                        et === 'execution_delivery_process_management' || et === 'damage_to_physical_assets'
                          ? 'text-slate-900'
                          : 'text-white'
                      }`}
                    >
                      {barLabel}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-3 text-[10px] font-medium uppercase tracking-wide text-slate-500">Gross by Basel category (INR)</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {BASEL_EVENT_TYPES.map((et) => {
            const gross = byBasel.get(et)?.gross ?? 0;
            const stats = byBasel.get(et)!;
            const share = totalGrossBasel > 0 ? (100 * gross) / totalGrossBasel : 0;
            return (
              <div
                key={et}
                className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5 shadow-sm"
              >
                <div
                  className="mt-0.5 h-4 w-4 shrink-0 rounded-sm ring-1 ring-black/10"
                  style={{ backgroundColor: BASEL_COLOR[et] || '#64748b' }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-snug text-slate-900">{BASEL_LABEL[et]}</div>
                  <div className="mt-1 font-mono text-[13px] font-bold tabular-nums text-slate-900">{formatInrLossDisplay(gross)}</div>
                  <div className="mt-0.5 text-xs text-slate-600">
                    <span className="tabular-nums">{share.toFixed(1)}%</span>
                    <span className="text-slate-500"> of total gross</span>
                    <span className="text-slate-500">
                      {' '}
                      Â· {stats.count} event{stats.count === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SectionCard
        title={`Loss events (${tableRows.length})`}
        subtitle="FY26 Â· newest first Â· row opens linked incident"
      >
        {!tableRows.length ? (
          <EmptyState message="No loss events recorded in FY26." />
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-2">ID</th>
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Type</th>
                <th className="py-2 pr-2">Subtype</th>
                <th className="py-2 pr-2">Unit</th>
                <th className="py-2 pr-2 text-right">Gross</th>
                <th className="py-2 pr-2 text-right">Recovery</th>
                <th className="py-2 pr-2 text-right">Net</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2">Linked incident</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((ev) => (
                <tr
                  key={ev.loss_event_id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  onClick={() => {
                    if (ev.linked_incident_id) openDrawer('incident', ev.linked_incident_id, 'lossData');
                  }}
                >
                  <td className="py-2 pr-2 font-mono text-[11px] text-slate-700">{ev.loss_event_id}</td>
                  <td className="py-2 pr-2 text-slate-700">{ev.event_date}</td>
                  <td className="py-2 pr-2 text-slate-800">{ev.loss_event_type.replace(/_/g, ' ')}</td>
                  <td className="py-2 pr-2 text-slate-600">{(ev.loss_event_subtype || 'â€”').replace(/_/g, ' ')}</td>
                  <td className="py-2 pr-2 text-slate-700">{ev.business_unit}</td>
                  <td className="py-2 pr-2 text-right font-medium text-slate-900">{formatInrLossDisplay(ev.gross_loss_inr)}</td>
                  <td className="py-2 pr-2 text-right text-slate-700">{formatInrLossDisplay(recoveryTotal(ev))}</td>
                  <td className="py-2 pr-2 text-right text-slate-800">{formatInrLossDisplay(ev.net_loss_inr)}</td>
                  <td className="py-2 pr-2 text-slate-600">{ev.status.replace(/_/g, ' ')}</td>
                  <td className="py-2 font-mono text-[11px] text-indigo-700">{ev.linked_incident_id || 'â€”'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </SectionCard>
    </div>
  );
}

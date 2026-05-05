'use client';

import React from 'react';
import {
  aggregateDCQS,
  correlationRecords,
  sourceRecords,
  sourceSystemHealth,
  sourceSystems,
} from '../dataModel';
import { Chip, SectionCard, Stat, StatusBadge } from '../primitives';
import type { OpenDrawer } from '../types';

const fmtTs = (iso: string | null) => (iso ? iso.slice(0, 19).replace('T', ' ') + 'Z' : '—');

export function SourceLineagePage({ openDrawer }: { openDrawer: OpenDrawer }) {
  const dcqs = aggregateDCQS();
  const orphanCount = correlationRecords.filter((c) => c.correlation_status === 'orphan').length;
  const lateArriving = correlationRecords.filter((c) => c.correlation_status === 'late_arriving').length;
  const reversal = correlationRecords.filter((c) => c.correlation_status === 'timestamp_reversal').length;

  return (
    <div className="space-y-5">
      {/* Health summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat k="DCQS" v={`${dcqs}%`} sub="data correlation quality" tone={dcqs >= 90 ? 'emerald' : dcqs >= 75 ? 'amber' : 'rose'} />
        <Stat k="Orphans" v={orphanCount} sub="unmatched source records" tone={orphanCount > 0 ? 'rose' : 'emerald'} />
        <Stat k="Late arriving" v={lateArriving} sub="ack arrived after SLA" tone="amber" />
        <Stat k="Timestamp reversal" v={reversal} sub="LOS / clock-drift evidence" tone={reversal > 0 ? 'rose' : 'emerald'} />
      </div>

      {/* Source system health table */}
      <SectionCard title={`Source systems (${sourceSystems.length})`} subtitle="Wave-1 ingestion health · click any system for detail">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-1.5 text-left">System</th>
                <th className="px-2 py-1.5 text-left">Vendor / mode</th>
                <th className="px-2 py-1.5 text-left">Status</th>
                <th className="px-2 py-1.5 text-right">Lag (ms)</th>
                <th className="px-2 py-1.5 text-right">Error rate</th>
                <th className="px-2 py-1.5 text-right">Orphans</th>
                <th className="px-2 py-1.5 text-left">Schema</th>
                <th className="px-2 py-1.5 text-left">Last ingest</th>
              </tr>
            </thead>
            <tbody>
              {sourceSystems.map((s) => {
                const h = sourceSystemHealth.find((x) => x.source_system_id === s.source_system_id);
                const tone = s.status === 'healthy' ? 'green' : s.status === 'degraded' ? 'amber' : 'red';
                return (
                  <tr
                    key={s.source_system_id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => openDrawer('sourceSystem', s.source_system_id, 'sourceLineage')}
                  >
                    <td className="px-2 py-2">
                      <div className="font-mono text-[10px] text-slate-600">{s.source_system_id}</div>
                      <div className="text-[11px] font-semibold text-slate-900">{s.system_type}</div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-[11px] text-slate-700">{s.vendor}</div>
                      <div className="text-[10px] text-slate-500">{s.integration_mode}</div>
                    </td>
                    <td className="px-2 py-2"><StatusBadge tone={tone} label={s.status} size="xs" /></td>
                    <td className="px-2 py-2 text-right text-[10px] text-slate-700">{h?.ingestion_lag_ms ?? '—'}</td>
                    <td className="px-2 py-2 text-right text-[10px] text-slate-700">{h ? `${(h.error_rate * 100).toFixed(2)}%` : '—'}</td>
                    <td className="px-2 py-2 text-right text-[10px] text-slate-700">{h?.orphan_count ?? '—'}</td>
                    <td className="px-2 py-2 font-mono text-[10px] text-slate-600">{h?.schema_version_current || '—'}</td>
                    <td className="px-2 py-2 text-[10px] text-slate-500">{fmtTs(h?.last_successful_ingest_ts || null)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Correlation queue */}
      <SectionCard title={`Correlation queue (${correlationRecords.length})`} subtitle="Match status · primary key · cardinality">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {correlationRecords.map((c) => (
            <button
              key={c.correlation_id}
              type="button"
              onClick={() => openDrawer('correlationRecord', c.correlation_id, 'sourceLineage')}
              className="block w-full rounded border border-slate-200 bg-white p-2.5 text-left hover:border-blue-300"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-600">{c.correlation_id}</span>
                <Chip
                  label={c.correlation_status}
                  tone={
                    c.correlation_status === 'matched'
                      ? 'emerald'
                      : c.correlation_status === 'orphan'
                        ? 'violet'
                        : c.correlation_status === 'timestamp_reversal'
                          ? 'rose'
                          : 'amber'
                  }
                  size="xs"
                />
              </div>
              <div className="text-[11px] text-slate-700">{c.explanation}</div>
              <div className="mt-1 text-[10px] text-slate-500">
                {c.primary_key_used} · {(c.match_confidence * 100).toFixed(0)}% conf · {c.expected_cardinality} → {c.actual_cardinality}
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Recent source records */}
      <SectionCard title={`Recent source records (${sourceRecords.length})`} subtitle="Hash-verified payload + primary key">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-1.5 text-left">SR ID</th>
                <th className="px-2 py-1.5 text-left">System</th>
                <th className="px-2 py-1.5 text-left">PK</th>
                <th className="px-2 py-1.5 text-left">Validation</th>
                <th className="px-2 py-1.5 text-left">Correlation</th>
                <th className="px-2 py-1.5 text-left">Event ts</th>
              </tr>
            </thead>
            <tbody>
              {sourceRecords.slice(0, 20).map((sr) => (
                <tr
                  key={sr.source_record_id}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  onClick={() => openDrawer('sourceRecord', sr.source_record_id, 'sourceLineage')}
                >
                  <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">{sr.source_record_id}</td>
                  <td className="px-2 py-1.5 font-mono text-[10px] text-slate-600">{sr.source_system_id}</td>
                  <td className="px-2 py-1.5 font-mono text-[10px] text-slate-600">{sr.source_primary_key}</td>
                  <td className="px-2 py-1.5">
                    <Chip label={sr.validation_status} tone={sr.validation_status === 'valid' ? 'emerald' : 'amber'} size="xs" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Chip
                      label={sr.correlation_status}
                      tone={
                        sr.correlation_status === 'matched' ? 'emerald' : sr.correlation_status === 'orphan' ? 'violet' : 'amber'
                      }
                      size="xs"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-[10px] text-slate-500">{fmtTs(sr.event_timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { aggregateEIFS, evidenceRecords, getSourceRecord, getSourceSystem, sourceSystems } from '../dataModel';
import { Chip, EvidenceStatusBadge, SectionCard, Stat } from '../primitives';
import type { OpenDrawer } from '../types';

const STATUSES = ['all', 'Complete', 'Partial', 'Missing', 'Late', 'InvalidHash', 'Orphaned', 'BpoPending'];

export function EvidenceWorkbench({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activeSystem, setActiveSystem] = useState<string>('all');

  const eifs = aggregateEIFS();

  const filtered = useMemo(
    () =>
      evidenceRecords.filter((e) => {
        if (activeStatus !== 'all' && e.evidence_status !== activeStatus) return false;
        if (activeSystem !== 'all' && e.source_system_id !== activeSystem) return false;
        return true;
      }),
    [activeStatus, activeSystem]
  );

  // status counts
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    evidenceRecords.forEach((e) => {
      c[e.evidence_status] = (c[e.evidence_status] || 0) + 1;
    });
    return c;
  }, []);

  // regulator-readiness pcts
  const readyPct = (key: 'rbi_afi' | 'pmla_rule9' | 'fiu_finnet' | 'statutory' | 'concurrent') => {
    if (!evidenceRecords.length) return 0;
    return Math.round(
      (evidenceRecords.filter((e) => e.regulator_ready_flags[key]).length / evidenceRecords.length) * 100
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Stat k="EIFS" v={`${eifs}%`} sub="freshness × hash" tone={eifs >= 85 ? 'emerald' : eifs >= 70 ? 'amber' : 'rose'} />
        <Stat k="RBI AFI ready" v={`${readyPct('rbi_afi')}%`} sub="of evidence universe" tone="emerald" />
        <Stat k="PMLA Rule 9 ready" v={`${readyPct('pmla_rule9')}%`} sub="10y retention" tone="emerald" />
        <Stat k="FIU FINnet ready" v={`${readyPct('fiu_finnet')}%`} sub="STR/CTR ack chain" tone="emerald" />
        <Stat k="Statutory ready" v={`${readyPct('statutory')}%`} sub="audit committee" tone="emerald" />
        <Stat k="Concurrent ready" v={`${readyPct('concurrent')}%`} sub="ICR cycles" tone="emerald" />
      </div>

      {/* Status strip */}
      <SectionCard title="Evidence status strip">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const c = s === 'all' ? evidenceRecords.length : counts[s] || 0;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setActiveStatus(s)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${activeStatus === s ? 'border-sky-400 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {s}
                <span className="rounded bg-white/60 px-1 text-[10px]">{c}</span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* System filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Source system:</span>
        <button
          type="button"
          onClick={() => setActiveSystem('all')}
          className={`rounded px-2 py-0.5 text-[10px] font-medium ${activeSystem === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          all
        </button>
        {sourceSystems.map((s) => (
          <button
            key={s.source_system_id}
            type="button"
            onClick={() => setActiveSystem(s.source_system_id)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${activeSystem === s.source_system_id ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {s.system_type}
          </button>
        ))}
      </div>

      {/* Evidence table */}
      <SectionCard title={`Evidence records (${filtered.length})`} subtitle="Click any row → D-01 source lineage drawer">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-1.5 text-left">Evidence ID</th>
                <th className="px-2 py-1.5 text-left">Type</th>
                <th className="px-2 py-1.5 text-left">Source system</th>
                <th className="px-2 py-1.5 text-left">Source record</th>
                <th className="px-2 py-1.5 text-left">Status</th>
                <th className="px-2 py-1.5 text-right">Score</th>
                <th className="px-2 py-1.5 text-right">Freshness</th>
                <th className="px-2 py-1.5 text-left">Hash</th>
                <th className="px-2 py-1.5 text-left">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const sys = getSourceSystem(ev.source_system_id);
                const sr = ev.source_record_id ? getSourceRecord(ev.source_record_id) : null;
                return (
                  <tr
                    key={ev.evidence_id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => openDrawer('evidence', ev.evidence_id, 'evidenceWorkbench')}
                  >
                    <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">{ev.evidence_id}</td>
                    <td className="px-2 py-1.5"><Chip label={ev.evidence_type} tone="sky" size="xs" /></td>
                    <td className="px-2 py-1.5 font-mono text-[10px] text-slate-600">{sys?.system_type || ev.source_system_id}</td>
                    <td className="px-2 py-1.5 font-mono text-[10px] text-slate-600">{sr?.source_record_id || '—'}</td>
                    <td className="px-2 py-1.5"><EvidenceStatusBadge status={ev.evidence_status} /></td>
                    <td className="px-2 py-1.5 text-right text-[10px] font-bold text-slate-700">{ev.evidence_completeness_score}</td>
                    <td className="px-2 py-1.5 text-right text-[10px] text-slate-600">{ev.freshness_days ?? '—'}d</td>
                    <td className="px-2 py-1.5 font-mono text-[10px] text-slate-500 max-w-[120px] truncate">{ev.payload_hash || '—'}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex gap-0.5 text-[9px]">
                        {Object.entries(ev.regulator_ready_flags).map(([k, v]) => (
                          <span key={k} className={`rounded px-1 ${v ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {k.split('_')[0].toUpperCase().slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

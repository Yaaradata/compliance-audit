'use client';

import React, { useMemo, useState } from 'react';
import {
  controlInstancesForControl,
  getControl,
  getException,
  rootCauseClusters,
  testExecutions,
} from '../dataModel';
import { Chip, EmptyState, KVRow, OutcomeBadge, SectionCard, SeverityBadge, Stat, StatusBadge } from '../primitives';
import type { OpenDrawer, SetActiveScreen } from '../types';

const fmtTs = (iso: string | null) => (iso ? iso.slice(0, 10) : '—');

export function PopulationTesting({
  selectedTestId,
  setSelectedTestId,
  openDrawer,
  setActiveScreen,
}: {
  selectedTestId: string;
  setSelectedTestId: (id: string) => void;
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const test = testExecutions.find((t) => t.test_id === selectedTestId) || testExecutions[0];
  const ctrl = test ? getControl(test.control_id) : null;
  const instances = ctrl ? controlInstancesForControl(ctrl.control_id) : [];

  // Cluster exceptions by root cause cluster
  const clusters = useMemo(() => {
    const map = new Map<string, { label: string; severity: string; cis: typeof instances; exceptionIds: string[] }>();
    instances.forEach((ci) => {
      if (!ci.exception_id) return;
      const ex = getException(ci.exception_id);
      const clusterId = ex?.root_cause_cluster_id || 'UNCLUSTERED';
      const cluster = rootCauseClusters.find((rc) => rc.cluster_id === clusterId);
      if (!map.has(clusterId)) {
        map.set(clusterId, { label: cluster?.label || 'Uncategorised exceptions', severity: cluster?.cluster_severity || 'medium', cis: [], exceptionIds: [] });
      }
      const cur = map.get(clusterId)!;
      cur.cis.push(ci);
      if (ex) cur.exceptionIds.push(ex.exception_id);
    });
    return Array.from(map.entries());
  }, [instances]);

  const [filterCluster, setFilterCluster] = useState<string | null>(null);
  const filteredCIs = filterCluster
    ? instances.filter((ci) => {
        if (!ci.exception_id) return false;
        const ex = getException(ci.exception_id);
        return ex?.root_cause_cluster_id === filterCluster;
      })
    : instances;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Test runner panel */}
      <div className="lg:col-span-3">
        <SectionCard title="Test runner" subtitle="Population reperformance · ToD / ToO / Sample / Retest">
          <KVRow k="Control" v={
            <select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
            >
              {testExecutions.map((t) => (
                <option key={t.test_id} value={t.test_id}>{t.test_id}</option>
              ))}
            </select>
          } />
          {test && (
            <>
              <KVRow k="Test type" v={test.test_type} />
              <KVRow k="Result" v={<StatusBadge tone={test.result === 'Failed' ? 'red' : test.result === 'pending' ? 'amber' : 'green'} label={test.result} size="xs" />} />
              <KVRow k="Rerunnable" v={test.rerunnable_flag ? 'yes' : 'no'} />
              <KVRow k="As-of" v={fmtTs(test.as_of_date)} />
              <div className="mt-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Population query</div>
                <pre className="mt-1 max-h-32 overflow-auto rounded bg-slate-50 p-2 font-mono text-[9px] text-slate-700">{test.population_query_ref}</pre>
              </div>
            </>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="rounded-md bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Re-run</button>
            <button type="button" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Save query</button>
          </div>
        </SectionCard>

        <div className="mt-4">
          <SectionCard title="Suggest population predicate" subtitle="AI Tier-3 (HITL gated)">
            <p className="text-[11px] text-slate-700">
              Based on training cases, this population query can be tightened to {' '}
              <code className="rounded bg-slate-100 px-1 font-mono text-[10px]">channel = &apos;DSA-Newgen&apos;</code> if you want to focus on the
              cluster identified by AI-013.
            </p>
            <div className="mt-2 flex items-center justify-end gap-2">
              <button type="button" className="rounded border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">Apply</button>
              <button type="button" className="rounded px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-100">Dismiss</button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-5 space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat k="Population" v={test?.population_size ?? '—'} />
          <Stat k="Tested" v={test?.tested_count ?? '—'} />
          <Stat k="Exceptions" v={test?.exception_count ?? '—'} tone={test?.exception_count ? 'rose' : 'emerald'} />
          <Stat k="Data gaps" v={test?.data_gap_count ?? '—'} tone="amber" />
          <Stat k="Evidence gaps" v={test?.evidence_gap_count ?? '—'} tone="violet" />
          <Stat k="Result" v={test?.result || '—'} tone={test?.result === 'Failed' ? 'rose' : 'emerald'} />
        </div>

        <SectionCard title={`Population grid (${filteredCIs.length})`} subtitle={ctrl ? `for ${ctrl.control_id}` : ''}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-2 py-1.5 text-left">CI</th>
                  <th className="px-2 py-1.5 text-left">Subject</th>
                  <th className="px-2 py-1.5 text-left">Outcome</th>
                  <th className="px-2 py-1.5 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredCIs.slice(0, 15).map((ci) => (
                  <tr
                    key={ci.control_instance_id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => openDrawer('controlInstance', ci.control_instance_id, 'populationTesting')}
                  >
                    <td className="px-2 py-1.5 font-mono text-[10px] text-slate-600">{ci.control_instance_id}</td>
                    <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">{ci.subject_id}</td>
                    <td className="px-2 py-1.5"><OutcomeBadge outcome={ci.outcome} size="xs" /></td>
                    <td className="px-2 py-1.5 text-[10px] text-slate-600 line-clamp-2">{ci.fail_reason || ci.evidence_gap_reason || ci.data_gap_reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <button
          type="button"
          onClick={() => setActiveScreen('workpaperAuditPackBuilder')}
          className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Open in Workpaper Builder →
        </button>
      </div>

      {/* Exception cluster panel */}
      <div className="lg:col-span-4">
        <SectionCard title={`Exception clusters (${clusters.length})`} subtitle="Click cluster to filter the grid">
          <div className="space-y-2">
            {clusters.map(([cid, c]) => {
              const isActive = cid === filterCluster;
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => setFilterCluster(isActive ? null : cid)}
                  className={`block w-full rounded-lg border p-2.5 text-left transition ${isActive ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'}`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <Chip label={cid} tone="violet" size="xs" />
                    <SeverityBadge severity={c.severity} />
                  </div>
                  <div className="text-xs font-semibold text-slate-900">{c.label}</div>
                  <div className="mt-1 text-[10px] text-slate-500">{c.cis.length} exception{c.cis.length === 1 ? '' : 's'}</div>
                </button>
              );
            })}
            {!clusters.length && <EmptyState message="No clustered exceptions" />}
          </div>
        </SectionCard>

        <div className="mt-4">
          <SectionCard title="Test history">
            <div className="space-y-1">
              {testExecutions.map((t) => {
                const isCurrent = t.test_id === test?.test_id;
                return (
                  <button
                    key={t.test_id}
                    type="button"
                    onClick={() => setSelectedTestId(t.test_id)}
                    className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-left text-xs ${isCurrent ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <span className="font-mono text-[10px]">{t.test_id}</span>
                    <Chip label={t.result} tone={t.result === 'Failed' ? 'rose' : t.result === 'pending' ? 'amber' : 'emerald'} size="xs" />
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import {
  aggregatePVDS,
  controlInstances,
  getProcess,
  getProcessExecution,
  processExecutions,
  processSteps,
  processes,
  stepExecutionsForExecution,
} from '../dataModel';
import { bandFromScore } from '../theme';
import { Chip, EmptyState, EntityTypeBadge, KVRow, OutcomeBadge, ScoreRing, SectionCard, Stat, StatusBadge } from '../primitives';
import type { OpenDrawer } from '../types';

export function ProcessHealth({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(processes[0]?.process_id || null);
  const [selectedExecId, setSelectedExecId] = useState<string | null>(null);

  const proc = selectedProcessId ? getProcess(selectedProcessId) : null;
  const procExecs = useMemo(
    () => processExecutions.filter((pe) => pe.process_id === selectedProcessId),
    [selectedProcessId]
  );
  const exec = selectedExecId ? getProcessExecution(selectedExecId) : null;
  const steps = useMemo(() => (proc ? processSteps.filter((s) => s.process_id === proc.process_id).sort((a, b) => a.step_order - b.step_order) : []), [proc]);
  const stepExecs = exec ? stepExecutionsForExecution(exec.process_execution_id) : [];

  const aggPVDS = aggregatePVDS();

  // Variant signature distribution
  const variants = useMemo(() => {
    if (!selectedProcessId) return [] as { sig: string; count: number; documented: boolean }[];
    const map = new Map<string, number>();
    procExecs.forEach((pe) => map.set(pe.variant_signature, (map.get(pe.variant_signature) || 0) + 1));
    const documentedSig = proc?.documented_variant_signature || '';
    return Array.from(map.entries())
      .map(([sig, count]) => ({ sig, count, documented: sig === documentedSig }))
      .sort((a, b) => b.count - a.count);
  }, [procExecs, proc, selectedProcessId]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat k="Processes mined" v={processes.length} />
        <Stat k="Executions in window" v={processExecutions.length} />
        <Stat k="Avg PVDS" v={`${aggPVDS}%`} sub="Process Variant Drift" tone={aggPVDS >= 80 ? 'emerald' : aggPVDS >= 60 ? 'amber' : 'rose'} />
        <Stat k="Control instances" v={controlInstances.length} tone="indigo" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Process selector */}
        <div className="lg:col-span-3">
          <SectionCard title={`Processes (${processes.length})`}>
            <div className="space-y-1.5">
              {processes.map((p) => {
                const active = selectedProcessId === p.process_id;
                return (
                  <button
                    key={p.process_id}
                    type="button"
                    onClick={() => {
                      setSelectedProcessId(p.process_id);
                      setSelectedExecId(null);
                    }}
                    className={`w-full rounded-md border px-2.5 py-2 text-left ${active ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-700">{p.process_id}</span>
                      <Chip label={p.status} tone={p.status === 'active' ? 'emerald' : 'amber'} size="xs" />
                    </div>
                    <div className="mt-0.5 text-[11px] font-medium text-slate-700">{p.name}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">PVDS {p.pvds ?? '—'}</div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Process detail + variants */}
        <div className="lg:col-span-9 space-y-4">
          {proc ? (
            <>
              <SectionCard
                title={proc.name}
                subtitle={`${proc.process_id} · owner ${proc.owner_role}`}
                actions={<ScoreRing score={proc.pvds} band={bandFromScore(proc.pvds)} size={64} thickness={8} label="PVDS" />}
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <KVRow k="Documented variant" v={<span className="font-mono">{proc.documented_variant_signature}</span>} />
                  <KVRow k="Linked obligations" v={proc.linked_obligation_ids.length} />
                  <KVRow k="Regulatory anchors" v={proc.regulatory_anchor_ids.length} />
                </div>
              </SectionCard>

              {/* Variant distribution swim */}
              <SectionCard title={`Variant signatures (${variants.length})`} subtitle="Documented variant compared with mined variants">
                <div className="space-y-2">
                  {variants.map((v) => {
                    const pct = Math.round((v.count / Math.max(1, procExecs.length)) * 100);
                    return (
                      <div key={v.sig} className="rounded-md border border-slate-200 bg-slate-50/50 p-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-700">{v.sig}</span>
                            {v.documented && <Chip label="documented" tone="emerald" size="xs" />}
                            {!v.documented && <Chip label="mined drift" tone="amber" size="xs" />}
                          </div>
                          <span className="font-bold text-slate-700">{v.count} ({pct}%)</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div className={`h-full ${v.documented ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {!variants.length && <EmptyState message="No executions for this process" />}
                </div>
              </SectionCard>

              {/* Documented step ladder */}
              <SectionCard title={`Documented step ladder (${steps.length})`} subtitle="Expected actor and systems per step">
                <div className="space-y-1.5">
                  {steps.map((s) => (
                    <div key={s.step_id} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs">
                      <span className="w-6 text-center font-mono text-[10px] font-bold text-indigo-700">#{s.step_order}</span>
                      <span className="flex-1 font-medium text-slate-800">{s.name}</span>
                      <Chip label={s.expected_actor_role} tone="slate" size="xs" />
                      <span className="text-[10px] text-slate-500">SLA {s.slas?.latency_hours ?? '—'}h</span>
                      <span className="font-mono text-[10px] text-slate-400">{s.expected_systems.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Executions */}
              <SectionCard title={`Process executions (${procExecs.length})`} subtitle="Pick one to inspect step-execution drift">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-2 py-1.5 text-left">Execution</th>
                        <th className="px-2 py-1.5 text-left">Anchor key</th>
                        <th className="px-2 py-1.5 text-left">Variant sig</th>
                        <th className="px-2 py-1.5 text-right">CIs</th>
                        <th className="px-2 py-1.5 text-right">Evidence%</th>
                        <th className="px-2 py-1.5 text-left">Started</th>
                        <th className="px-2 py-1.5 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {procExecs.map((pe) => (
                        <tr
                          key={pe.process_execution_id}
                          className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${selectedExecId === pe.process_execution_id ? 'bg-indigo-50/40' : ''}`}
                          onClick={() => setSelectedExecId(pe.process_execution_id)}
                        >
                          <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">{pe.process_execution_id}</td>
                          <td className="px-2 py-1.5 font-mono text-[10px] text-slate-600">{pe.anchor_key_value}</td>
                          <td className="px-2 py-1.5 font-mono text-[10px] text-slate-500">{pe.variant_signature}</td>
                          <td className="px-2 py-1.5 text-right text-[10px] text-slate-700">{pe.control_instance_count}</td>
                          <td className="px-2 py-1.5 text-right text-[10px] font-bold text-slate-700">{pe.evidence_completeness}%</td>
                          <td className="px-2 py-1.5 text-[10px] text-slate-500">{new Date(pe.started_at).toLocaleDateString()}</td>
                          <td className="px-2 py-1.5"><StatusBadge tone={pe.status === 'in_progress' ? 'amber' : 'green'} label={pe.status} size="xs" /></td>
                        </tr>
                      ))}
                      {!procExecs.length && (
                        <tr><td colSpan={7} className="py-4 text-center text-xs text-slate-400">No executions</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* Step execution timeline for selected exec */}
              {exec && (
                <SectionCard
                  title={`Step executions · ${exec.process_execution_id}`}
                  subtitle="Drift markers: skipped step, manual override, BPO/vendor handoff"
                  actions={
                    <button
                      type="button"
                      onClick={() => openDrawer('processExecution', exec.process_execution_id, 'processHealth')}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      open full detail →
                    </button>
                  }
                >
                  <ol className="space-y-2">
                    {stepExecs.map((se, idx) => {
                      const ps = processSteps.find((p) => p.step_id === se.step_id);
                      const cis = controlInstances.filter((ci) => ci.step_execution_id === se.step_execution_id);
                      return (
                        <li key={se.step_execution_id} className="rounded-md border border-slate-200 bg-white p-2.5">
                          <div className="flex items-start justify-between text-xs">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">{idx + 1}</span>
                              <div>
                                <div className="font-semibold text-slate-800">{ps?.name || se.step_id}</div>
                                <div className="mt-0.5 text-[10px] text-slate-500">
                                  actor: {se.actual_actor_type} · system: {se.actual_system}
                                </div>
                                {se.deviation_note && <div className="mt-0.5 text-[10px] text-rose-700">deviation: {se.deviation_note}</div>}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {se.skipped_step_flag && <Chip label="skipped" tone="rose" size="xs" />}
                              {se.manual_override_flag && <Chip label="manual override" tone="amber" size="xs" />}
                              {se.bpo_or_vendor_flag && <Chip label="BPO/vendor" tone="violet" size="xs" />}
                            </div>
                          </div>
                          {cis.length > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500">control instances</span>
                              {cis.map((ci) => (
                                <button
                                  key={ci.control_instance_id}
                                  type="button"
                                  onClick={() => openDrawer('controlInstance', ci.control_instance_id, 'processHealth')}
                                  className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] hover:bg-slate-100"
                                >
                                  <EntityTypeBadge type="controlInstance" />
                                  <span className="font-mono">{ci.control_instance_id}</span>
                                  <OutcomeBadge outcome={ci.outcome} size="xs" />
                                </button>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                    {!stepExecs.length && <EmptyState message="No step executions for this run" />}
                  </ol>
                </SectionCard>
              )}
            </>
          ) : (
            <EmptyState message="Select a process" />
          )}
        </div>
      </div>
    </div>
  );
}

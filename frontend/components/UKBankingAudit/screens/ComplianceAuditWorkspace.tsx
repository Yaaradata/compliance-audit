'use client';

import React, { useMemo } from 'react';
import { auditPacks, controls, tests, workpapers } from '../dataModel';
import { getControl } from '../dataModel';
import { StatusBadge } from '../primitives';
import { bandBg } from '../theme';

export function ComplianceAuditWorkspace({
  setActiveScreen,
  setSelectedTestId,
  setSelectedPackId,
}: {
  setActiveScreen: (s: string) => void;
  setSelectedTestId: (id: string) => void;
  setSelectedPackId: (id: string) => void;
}) {
  const testabilityBuckets = useMemo(
    () => ({
      population: controls.filter((c) => c.judgementDependence === 'none'),
      hybrid: controls.filter((c) => c.judgementDependence === 'partial'),
      sample_only: controls.filter((c) => c.judgementDependence === 'full'),
    }),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Compliance Officer / Audit Manager Workspace</h2>
        <p className="text-xs text-slate-500">
          2LoD Compliance · {tests.length} tests · {workpapers.length} workpapers · {auditPacks.length} audit packs
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">Test Pipeline</h3>
              <span className="text-[10px] text-slate-500">{tests.length} active</span>
            </div>
            <div className="divide-y divide-slate-100">
              {tests.map((t) => {
                const c = getControl(t.controlId);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTestId(t.id);
                      setActiveScreen('populationTesting');
                    }}
                    className="grid w-full grid-cols-12 items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="col-span-4">
                      <div className="text-sm font-semibold text-slate-900">{t.id}</div>
                      <div className="truncate text-xs text-slate-600">{c?.title}</div>
                    </div>
                    <div className="col-span-2 text-xs">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                          t.method === 'population'
                            ? 'bg-emerald-100 text-emerald-800'
                            : String(t.method).startsWith('sample')
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {String(t.method).replace('_', ' ')}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs text-slate-700">N={t.populationSize}</div>
                    <div className="col-span-2 text-xs">
                      {t.exceptionCount > 0 ? (
                        <span className="font-semibold text-rose-600">{t.exceptionCount} exceptions</span>
                      ) : (
                        <span className="font-semibold text-emerald-600">No exceptions</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <StatusBadge
                        tone={t.status === 'done' ? 'green' : t.status === 'in_progress' ? 'amber' : 'neutral'}
                        label={t.status.replace('_', ' ')}
                        size="xs"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">Workpapers in Progress</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {workpapers.map((w) => (
                <div key={w.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                  <div className="col-span-5">
                    <div className="text-sm font-semibold text-slate-900">{w.id}</div>
                    <div className="line-clamp-1 text-xs text-slate-600">{w.generatedSummary}</div>
                  </div>
                  <div className="col-span-2 text-xs text-slate-600">{w.controlId}</div>
                  <div className="col-span-2 text-xs">
                    {w.aiAssistanceLineage && (
                      <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                        AI · {w.aiAssistanceLineage.humanEditsCount} edits
                      </span>
                    )}
                  </div>
                  <div className="col-span-3 text-right">
                    <StatusBadge
                      tone={
                        (w.status as string) === 'signed_off' || (w.status as string) === 'archived'
                          ? 'green'
                          : (w.status as string) === 'draft'
                            ? 'amber'
                            : 'neutral'
                      }
                      label={w.status.replace('_', ' ')}
                      size="xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">Audit Packs in Progress</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {auditPacks.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPackId(p.id);
                    setActiveScreen('auditPackBuilder');
                  }}
                  className="w-full px-5 py-3 text-left hover:bg-slate-50"
                >
                  <div className="line-clamp-1 text-xs font-semibold text-slate-900">{p.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{p.scopeType.replace(/_/g, ' ')}</span>
                    <StatusBadge
                      tone={(p.readinessStatus as string) === 'ready_to_send' ? 'green' : 'amber'}
                      label={p.readinessStatus.replace('_', ' ')}
                      size="xs"
                    />
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{p.composition.totalEntities.toLocaleString()} entities</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Population Testability</h3>
            <div className="space-y-2">
              {(
                [
                  { key: 'population', label: '100% Population', tone: 'green', data: testabilityBuckets.population },
                  { key: 'hybrid', label: 'Hybrid', tone: 'amber', data: testabilityBuckets.hybrid },
                  { key: 'sample_only', label: 'Sample Only', tone: 'neutral', data: testabilityBuckets.sample_only },
                ] as const
              ).map((b) => (
                <div key={b.key} className={`rounded border p-2 ${bandBg(b.tone)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{b.label}</span>
                    <span className="text-sm font-bold">{b.data.length}</span>
                  </div>
                  <div className="mt-0.5 text-[10px]">{b.data.map((c) => c.id).join(', ') || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

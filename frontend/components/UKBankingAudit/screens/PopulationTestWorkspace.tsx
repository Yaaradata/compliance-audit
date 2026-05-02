'use client';

import React from 'react';
import { getActor, getControl, getControlInstance, getTest, getWorkpaper } from '../dataModel';
import { EntityTypeBadge, EmptyState, Stat, StatusBadge } from '../primitives';

type OpenDrawer = (entityType: string, entityId: string, sourceScreen: string) => void;

export function PopulationTestWorkspace({
  selectedTestId,
  openDrawer,
  setActiveScreen,
  setSelectedPackId,
}: {
  selectedTestId: string;
  openDrawer: OpenDrawer;
  setActiveScreen: (s: string) => void;
  setSelectedPackId: (id: string) => void;
}) {
  const test = getTest(selectedTestId);
  if (!test) return <EmptyState message="Select a test from the Compliance Workspace." />;
  const control = getControl(test.controlId);
  const workpaper = test.workpaperId ? getWorkpaper(test.workpaperId) : null;
  const tester = getActor(test.testerId);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <EntityTypeBadge type="control" />
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">Test {test.id}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{control?.title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Window {test.testWindowStart} → {test.testWindowEnd} · Tester {tester?.name} ({tester?.role}) · {test.testerFunction}
            </p>
          </div>
          <StatusBadge tone={test.status === 'done' ? 'green' : 'amber'} label={test.status.replace('_', ' ').toUpperCase()} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-4 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Population Scoping</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Stat k="Population" v={test.populationSize.toLocaleString()} />
                <Stat k="Excluded" v={test.excludedCount} sub={test.excludedReason || '—'} />
                <Stat k="Eligible" v={test.eligibleCount.toLocaleString()} tone="emerald" />
                <Stat k="Tested" v={test.testedCount.toLocaleString()} tone={test.testedCount === test.eligibleCount ? 'emerald' : 'amber'} />
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Population Query</div>
                <div className="font-mono text-xs text-slate-700">{test.populationQueryRef}</div>
                <div className="mt-1 break-all font-mono text-[10px] text-slate-500">hash {test.populationQueryHash}</div>
              </div>
              {test.samplingRationale && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">Sampling Rationale</div>
                  <div className="text-xs text-amber-900">{test.samplingRationale}</div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">Testability Classification</h3>
            <div
              className={`rounded-lg border-2 p-3 ${test.method === 'population' ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-bold uppercase">{String(test.method).replace('_', ' ')}</span>
                <span className="text-[10px] font-medium">{control?.judgementDependence} judgement</span>
              </div>
              <div className="text-xs text-slate-700">
                {test.method === 'population'
                  ? `100% population reperformance — ${test.populationSize.toLocaleString()} cases tested.`
                  : `Risk-based sample of ${test.testedCount} from ${test.populationSize.toLocaleString()} eligible.`}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Results Summary</h3>
              <StatusBadge
                tone={
                  (test.result as string) === 'pass'
                    ? 'green'
                    : (test.result as string) === 'qualified' || (test.result as string) === 'pass_with_observations'
                      ? 'amber'
                      : 'red'
                }
                label={test.result.replace(/_/g, ' ').toUpperCase()}
              />
            </div>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                <div className="text-2xl font-bold text-emerald-700">{(test.testedCount - test.exceptionCount).toLocaleString()}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Passed</div>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center">
                <div className="text-2xl font-bold text-rose-700">{test.exceptionCount}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">Exceptions</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-2xl font-bold text-slate-700">{((test.exceptionCount / test.testedCount) * 100).toFixed(1)}%</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Exception Rate</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="mb-1 text-xs font-semibold text-slate-700">Exception breakdown</div>
              {test.exceptionDetails.map((e, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-44 text-xs text-slate-600">{e.type.replace(/_/g, ' ')}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-rose-400"
                      style={{ width: `${test.exceptionCount ? (e.count / test.exceptionCount) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-xs font-bold">{e.count}</div>
                </div>
              ))}
            </div>
          </div>

          {test.exceptionInstanceIds.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="text-sm font-semibold">Exception Cases ({test.exceptionInstanceIds.length})</h3>
              </div>
              <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                {test.exceptionInstanceIds.slice(0, 12).map((ciId) => {
                  const ci = getControlInstance(ciId);
                  if (!ci) return null;
                  const evMissing = ci.evidenceIds.length === 0;
                  return (
                    <button
                      key={ciId}
                      type="button"
                      onClick={() => openDrawer('evidence', evMissing ? ciId : ci.evidenceIds[0], 'populationTesting')}
                      className="grid w-full grid-cols-12 items-center gap-2 px-5 py-2 text-left text-xs hover:bg-slate-50"
                    >
                      <div className="col-span-3 font-mono text-slate-700">{ci.id}</div>
                      <div className="col-span-3 text-slate-600">{ci.caseOrTransactionId}</div>
                      <div className="col-span-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            evMissing ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {evMissing ? 'evidence missing' : 'evidence incomplete'}
                        </span>
                      </div>
                      <div className="col-span-2 text-slate-500">{getActor(ci.operatorId)?.name || '—'}</div>
                      <div className="col-span-1 text-right text-indigo-600">drill →</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {workpaper && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Workpaper · {workpaper.id}</h3>
                  <p className="text-[10px] text-slate-500">
                    {workpaper.aiAssistanceLineage
                      ? `AI-drafted · ${workpaper.aiAssistanceLineage.humanEditsCount} human edits · owned by ${workpaper.aiAssistanceLineage.finalHumanOwner}`
                      : 'Manual'}
                  </p>
                </div>
                <StatusBadge tone={workpaper.status === 'draft' ? 'amber' : 'green'} label={workpaper.status.replace('_', ' ')} size="xs" />
              </div>
              <div className="mb-3 text-xs leading-relaxed text-slate-700">{workpaper.findings}</div>
              <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Conclusion</div>
                <div className="text-xs text-slate-800">{workpaper.conclusion}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackId('AP-S165-FCC-001');
                    setActiveScreen('auditPackBuilder');
                  }}
                  className="flex-1 rounded-md bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Add to Audit Pack →
                </button>
                <button type="button" className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium hover:bg-slate-50">
                  Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { auditPacks, getAuditPack } from '../dataModel';
import { EntityTypeBadge, EmptyState, KVRow, StatusBadge } from '../primitives';

type OpenDrawer = (entityType: string, entityId: string, sourceScreen: string) => void;

export function AuditPackBuilder({
  selectedPackId,
  setSelectedPackId,
  openDrawer,
}: {
  selectedPackId: string;
  setSelectedPackId: (id: string) => void;
  openDrawer: OpenDrawer;
}) {
  const pack = getAuditPack(selectedPackId);
  if (!pack) return <EmptyState message="Select an audit pack." />;

  const compositionRows = [
    { key: 'controls', label: 'Controls', entityType: 'control' as const, data: pack.composition.controls },
    { key: 'obligations', label: 'Obligations', entityType: 'obligation' as const, data: pack.composition.obligations },
    { key: 'evidence', label: 'Evidence', entityType: 'evidence' as const, data: pack.composition.evidence },
    { key: 'issues', label: 'Issues', entityType: 'issue' as const, data: pack.composition.issues },
    { key: 'workpapers', label: 'Workpapers', entityType: null, data: pack.composition.workpapers },
    { key: 'smfRecords', label: 'SMF Records', entityType: 'smf' as const, data: pack.composition.smfRecords },
    { key: 'kriObservations', label: 'KRI Observations', entityType: null, data: pack.composition.kriObservations },
    { key: 'appetiteObservations', label: 'Appetite Observations', entityType: null, data: pack.composition.appetiteObservations },
  ];

  const stages = ['drafting', 'internal_review', 'legal_review', 'ready_to_send', 'sent'] as const;
  const stageIdx = stages.indexOf(pack.readinessStatus as (typeof stages)[number]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Pack:</span>
        {auditPacks.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPackId(p.id)}
            className={`rounded px-3 py-1.5 text-xs ${selectedPackId === p.id ? 'bg-indigo-100 font-medium text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {p.id}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <EntityTypeBadge type="auditPack" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{pack.scopeType.replace(/_/g, ' ')}</span>
              <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-purple-700">{pack.targetAudience}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{pack.title}</h2>
            <div className="mt-1 text-xs text-slate-500">
              Window {pack.timeWindowStart} → {pack.timeWindowEnd} · As-of {pack.asOfStateDate} · State hash{' '}
              <span className="font-mono">{pack.asOfStateHash.slice(0, 16)}…</span>
            </div>
          </div>
          <StatusBadge
            tone={(pack.readinessStatus as string) === 'ready_to_send' || (pack.readinessStatus as string) === 'sent' ? 'green' : 'amber'}
            label={pack.readinessStatus.replace('_', ' ').toUpperCase()}
          />
        </div>

        <div className="mt-5 flex items-center gap-1">
          {stages.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex flex-1 flex-col items-center ${i <= stageIdx ? '' : 'opacity-40'}`}>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                    i < stageIdx ? 'bg-emerald-500 text-white' : i === stageIdx ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {i < stageIdx ? '✓' : i + 1}
                </div>
                <div className="mt-1 text-[10px] font-medium text-slate-600">{s.replace('_', ' ')}</div>
              </div>
              {i < stages.length - 1 && <div className={`h-0.5 flex-1 ${i < stageIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">Pack Composition</h3>
              <span className="text-xs font-bold text-slate-700">{pack.composition.totalEntities.toLocaleString()} entities</span>
            </div>
            <div className="divide-y divide-slate-100">
              {compositionRows.map((row) => {
                const sample = 'sampleIds' in row.data ? row.data.sampleIds ?? [] : [];
                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => row.entityType && sample[0] && openDrawer(row.entityType, sample[0], 'auditPackBuilder')}
                    disabled={!row.entityType || !sample[0]}
                    className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{row.label}</div>
                      {sample.length > 0 && (
                        <div className="mt-0.5 text-[10px] text-slate-500">
                          e.g. {sample.slice(0, 2).join(', ')}
                          {sample.length > 2 ? `… +${sample.length - 2}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{row.data.count.toLocaleString()}</span>
                      {row.entityType && sample[0] && <span className="text-[10px] text-indigo-600">→</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Chain-of-Custody Manifest</h3>
            <div className="space-y-2 text-xs">
              <KVRow k="Evidence count" v={pack.chainOfCustodyManifest.evidenceCount.toLocaleString()} />
              <KVRow
                k="All hashes verified"
                v={pack.chainOfCustodyManifest.allHashesVerified ? '✓ Yes' : '✗ No'}
                tone={pack.chainOfCustodyManifest.allHashesVerified ? 'green' : 'red'}
              />
              <KVRow
                k="Manifest signed"
                v={pack.chainOfCustodyManifest.manifestSigned ? '✓ Yes' : 'Pending'}
                tone={pack.chainOfCustodyManifest.manifestSigned ? 'green' : 'amber'}
              />
              <KVRow
                k="Manifest TS"
                v={new Date(pack.chainOfCustodyManifest.manifestTs).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-7">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <h3 className="text-sm font-semibold">Generated Narrative</h3>
                <p className="text-[10px] text-slate-500">
                  AI-drafted with per-paragraph citations · model {pack.narrativeLineage.model} v{pack.narrativeLineage.modelVersion}
                </p>
              </div>
              <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-800">
                AI · {pack.narrativeLineage.perParagraphCitationCount} CITATIONS
              </span>
            </div>
            <div className="whitespace-pre-line p-5 text-xs leading-relaxed text-slate-700">{pack.generatedNarrative}</div>
            {pack.narrativeLineage.inputsNotSeen.length > 0 && (
              <div className="mx-5 mb-5 rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800">Inputs Not Seen by AI</div>
                <ul className="space-y-0.5 text-xs text-amber-900">
                  {pack.narrativeLineage.inputsNotSeen.map((x, i) => (
                    <li key={i}>· {x}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" className="flex-1 rounded-md bg-slate-900 py-2.5 text-xs font-medium text-white hover:bg-slate-800">
              Route to Internal Review →
            </button>
            <button type="button" className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium hover:bg-slate-50">
              Export PDF + XLSX + Manifest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

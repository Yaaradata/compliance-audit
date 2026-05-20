'use client';

import React, { useMemo, useState } from 'react';
import { aggregateEIFS, evidenceRecords, getSourceRecord, getSourceSystem, sourceSystems } from '../dataModel';
import { Chip, EvidenceStatusBadge, SectionCard, Stat } from '../primitives';
import { oriWorkflowStore, useOriWorkflow } from '../ori/oriWorkflowStore';
import type { OpenDrawer } from '../types';

const STATUSES = ['all', 'Complete', 'Partial', 'Missing', 'Late', 'InvalidHash', 'Orphaned', 'BpoPending'];

const ACCESSOR_ROLE = 'VP-ORM (Control Tester)';

function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso.slice(0, 16).replace('T', ' ');
  }
}

function daysUntil(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.round((t - Date.now()) / 86400000);
}

function retentionTone(days: number): { bg: string; text: string; label: string } {
  if (days <= 90) return { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', label: 'Expiring' };
  if (days <= 365) return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Watch' };
  return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Retained' };
}

function bytes(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

/** v2 — centralized repository with versions, access trail, upload. */
export function EvidenceWorkbenchV2({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activeSystem, setActiveSystem] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Subscribe to overlay so uploads / access logs re-render the table.
  const workflow = useOriWorkflow();

  const eifs = aggregateEIFS();

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return evidenceRecords.filter((e) => {
      if (activeStatus !== 'all' && e.evidence_status !== activeStatus) return false;
      if (activeSystem !== 'all' && e.source_system_id !== activeSystem) return false;
      if (q) {
        const sys = getSourceSystem(e.source_system_id);
        const hay = [e.evidence_id, e.evidence_type, e.source_record_id || '', sys?.system_type || ''].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeStatus, activeSystem, searchTerm]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    evidenceRecords.forEach((e) => {
      c[e.evidence_status] = (c[e.evidence_status] || 0) + 1;
    });
    return c;
  }, []);

  const readyPct = (key: 'rbi_afi' | 'pmla_rule9' | 'fiu_finnet' | 'statutory' | 'concurrent') => {
    if (!evidenceRecords.length) return 0;
    return Math.round(
      (evidenceRecords.filter((e) => e.regulator_ready_flags[key]).length / evidenceRecords.length) * 100,
    );
  };

  // Aggregate stats from the persisted overlay (real repository feel).
  const repoStats = useMemo(() => {
    const overlays = Object.values(workflow.evidence);
    const totalVersions = overlays.reduce((s, o) => s + o.versions.length, 0);
    const totalSizeKb = overlays.reduce(
      (s, o) => s + o.versions.reduce((vs, v) => vs + v.size_kb, 0),
      0,
    );
    const accessEvents = overlays.reduce((s, o) => s + o.access_trail.length, 0);
    const expiring = overlays.filter((o) => daysUntil(o.retention_until) <= 90).length;
    return { totalVersions, totalSizeKb, accessEvents, expiring };
  }, [workflow.evidence]);

  function handleToggleExpand(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
    oriWorkflowStore.recordEvidenceAccess(id, 'view', ACCESSOR_ROLE);
  }

  function handleUpload(id: string) {
    const newVersion = oriWorkflowStore.uploadEvidenceVersion(id, {
      uploadedByRole: ACCESSOR_ROLE,
      sizeKb: 256 + Math.floor(Math.random() * 1800),
      source: 'manual_upload',
      note: 'Refreshed evidence pack — manual upload from workbench.',
    });
    setExpandedId(id);
    window.alert(`Uploaded version v${newVersion.version} (hash ${newVersion.hash}) to ${id}.`);
  }

  function handleDownload(id: string) {
    oriWorkflowStore.recordEvidenceAccess(id, 'download', ACCESSOR_ROLE);
  }

  function handleVerify(id: string) {
    oriWorkflowStore.recordEvidenceAccess(id, 'verify', ACCESSOR_ROLE);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Stat
          k="EIFS"
          v={`${eifs}%`}
          sub="freshness × hash"
          tone={eifs >= 85 ? 'emerald' : eifs >= 70 ? 'amber' : 'rose'}
        />
        <Stat k="RBI AFI ready" v={`${readyPct('rbi_afi')}%`} sub="of evidence universe" tone="emerald" />
        <Stat k="PMLA Rule 9 ready" v={`${readyPct('pmla_rule9')}%`} sub="10y retention" tone="emerald" />
        <Stat k="FIU FINnet ready" v={`${readyPct('fiu_finnet')}%`} sub="STR/CTR ack chain" tone="emerald" />
        <Stat k="Statutory ready" v={`${readyPct('statutory')}%`} sub="audit committee" tone="emerald" />
        <Stat k="Concurrent ready" v={`${readyPct('concurrent')}%`} sub="ICR cycles" tone="emerald" />
      </div>

      {/* Centralized repository summary */}
      <SectionCard
        title="Centralized evidence repository"
        subtitle="Versions, access trail and retention from the workflow store"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat k="Records" v={evidenceRecords.length} sub="across source systems" tone="indigo" />
          <Stat k="Versions" v={repoStats.totalVersions} sub="all-time" tone="slate" />
          <Stat
            k="Repo size"
            v={repoStats.totalSizeKb >= 1024 ? `${(repoStats.totalSizeKb / 1024).toFixed(1)} MB` : `${repoStats.totalSizeKb} KB`}
            sub="approx"
            tone="slate"
          />
          <Stat
            k="Expiring ≤90d"
            v={repoStats.expiring}
            sub="retention watch"
            tone={repoStats.expiring === 0 ? 'emerald' : 'amber'}
          />
        </div>
      </SectionCard>

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

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
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
        <div className="ml-auto flex items-center gap-2">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search evidence ID, type, system…"
            className="h-8 w-64 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
          />
        </div>
      </div>

      {/* Evidence table with version history + access trail */}
      <SectionCard
        title={`Evidence records (${filtered.length})`}
        subtitle="Click ▸ to expand version history and access trail. Use Upload / Download / Verify on each row."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-6 px-1 py-1.5" aria-label="expand" />
                <th className="px-2 py-1.5 text-left">Evidence ID</th>
                <th className="px-2 py-1.5 text-left">Type</th>
                <th className="px-2 py-1.5 text-left">Source system</th>
                <th className="px-2 py-1.5 text-left">Status</th>
                <th className="px-2 py-1.5 text-right">Score</th>
                <th className="px-2 py-1.5 text-right">Freshness</th>
                <th className="px-2 py-1.5 text-left">Versions</th>
                <th className="px-2 py-1.5 text-left">Retention</th>
                <th className="px-2 py-1.5 text-left">Readiness</th>
                <th className="px-2 py-1.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const sys = getSourceSystem(ev.source_system_id);
                const sr = ev.source_record_id ? getSourceRecord(ev.source_record_id) : null;
                const overlay = workflow.evidence[ev.evidence_id];
                const versions = overlay?.versions ?? [];
                const trail = overlay?.access_trail ?? [];
                const retentionDays = overlay ? daysUntil(overlay.retention_until) : 365;
                const retTone = retentionTone(retentionDays);
                const isOpen = expandedId === ev.evidence_id;
                return (
                  <React.Fragment key={ev.evidence_id}>
                    <tr className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-1 py-1.5 text-center align-top">
                        <button
                          type="button"
                          aria-label={isOpen ? 'Collapse row' : 'Expand row'}
                          onClick={() => handleToggleExpand(ev.evidence_id)}
                          className="rounded text-[10px] text-slate-500 hover:text-indigo-700"
                        >
                          {isOpen ? '▾' : '▸'}
                        </button>
                      </td>
                      <td
                        className="px-2 py-1.5 align-top font-mono text-[10px] text-slate-700"
                        onClick={() => openDrawer('evidence', ev.evidence_id, 'evidenceWorkbench')}
                      >
                        {ev.evidence_id}
                      </td>
                      <td className="px-2 py-1.5 align-top">
                        <Chip label={ev.evidence_type} tone="sky" size="xs" />
                      </td>
                      <td className="px-2 py-1.5 align-top font-mono text-[10px] text-slate-600">
                        {sys?.system_type || ev.source_system_id}
                      </td>
                      <td className="px-2 py-1.5 align-top">
                        <EvidenceStatusBadge status={ev.evidence_status} />
                      </td>
                      <td className="px-2 py-1.5 text-right align-top text-[10px] font-bold text-slate-700">
                        {ev.evidence_completeness_score}
                      </td>
                      <td className="px-2 py-1.5 text-right align-top text-[10px] text-slate-600">
                        {ev.freshness_days ?? '—'}d
                      </td>
                      <td className="px-2 py-1.5 align-top text-[10px] text-slate-700">
                        <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px]">
                          v{versions[versions.length - 1]?.version ?? 1}
                        </span>
                        <span className="ml-1 text-slate-500">({versions.length} total)</span>
                      </td>
                      <td className="px-2 py-1.5 align-top">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold ${retTone.bg} ${retTone.text}`}
                          title={`Retention until ${overlay?.retention_until ?? 'n/a'}`}
                        >
                          <span className="h-1 w-1 rounded-full bg-current" aria-hidden />
                          {retTone.label} · {retentionDays}d
                        </span>
                      </td>
                      <td className="px-2 py-1.5 align-top">
                        <div className="flex gap-0.5 text-[9px]">
                          {Object.entries(ev.regulator_ready_flags).map(([k, v]) => (
                            <span
                              key={k}
                              className={`rounded px-1 ${v ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                            >
                              {k.split('_')[0].toUpperCase().slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 align-top">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpload(ev.evidence_id)}
                            className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800 hover:bg-indigo-100"
                            title="Upload a new version"
                          >
                            Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(ev.evidence_id)}
                            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                            title="Log a download in the access trail"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerify(ev.evidence_id)}
                            className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100"
                            title="Mark verification in the access trail"
                          >
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr className="border-t border-slate-100 bg-slate-50/60">
                        <td colSpan={11} className="px-3 py-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Version history ({versions.length})
                              </h4>
                              <ol className="mt-2 space-y-2">
                                {versions
                                  .slice()
                                  .reverse()
                                  .map((v) => (
                                    <li
                                      key={`${ev.evidence_id}-v${v.version}`}
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px]"
                                    >
                                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <span className="font-mono font-semibold text-slate-900">v{v.version}</span>
                                        <span className="font-mono text-[10px] text-slate-500">{v.hash}</span>
                                      </div>
                                      <div className="mt-0.5 text-[10px] text-slate-500">
                                        {formatDateTime(v.uploaded_at)} · {v.uploaded_by_role} · {bytes(v.size_kb)} · {v.source}
                                      </div>
                                      {v.note ? <p className="mt-1 text-slate-700">{v.note}</p> : null}
                                    </li>
                                  ))}
                                {!versions.length ? (
                                  <li className="rounded border border-dashed border-slate-300 px-3 py-2 text-[11px] text-slate-500">
                                    No versions captured yet — click Upload to ingest one.
                                  </li>
                                ) : null}
                              </ol>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Access trail ({trail.length})
                              </h4>
                              <ol className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                                {trail
                                  .slice()
                                  .reverse()
                                  .map((a, i) => (
                                    <li
                                      key={`${ev.evidence_id}-acc-${i}`}
                                      className="flex items-baseline justify-between gap-2 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[11px]"
                                    >
                                      <span>
                                        <span
                                          className={`mr-1.5 rounded px-1 text-[9px] font-bold uppercase tracking-wider ${
                                            a.action === 'upload'
                                              ? 'bg-indigo-100 text-indigo-700'
                                              : a.action === 'download'
                                                ? 'bg-slate-200 text-slate-700'
                                                : a.action === 'verify'
                                                  ? 'bg-emerald-100 text-emerald-700'
                                                  : 'bg-amber-100 text-amber-800'
                                          }`}
                                        >
                                          {a.action}
                                        </span>
                                        <span className="text-slate-700">{a.by_role}</span>
                                      </span>
                                      <span className="font-mono text-[10px] text-slate-500">{formatDateTime(a.at)}</span>
                                    </li>
                                  ))}
                                {!trail.length ? (
                                  <li className="rounded border border-dashed border-slate-300 px-2.5 py-1.5 text-[11px] text-slate-500">
                                    No access events yet.
                                  </li>
                                ) : null}
                              </ol>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                                <span>
                                  Retention class: <strong className="text-slate-700">{ev.retention_class}</strong>
                                </span>
                                {overlay ? (
                                  <span>
                                    Retain until <strong className="text-slate-700">{formatDateShort(overlay.retention_until)}</strong>
                                  </span>
                                ) : null}
                                {sr ? (
                                  <span>
                                    Source record <strong className="text-slate-700">{sr.source_record_id}</strong>
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
              {!filtered.length ? (
                <tr>
                  <td colSpan={11} className="px-2 py-6 text-center text-xs text-slate-500">
                    No evidence records match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { aiInsightsForControl, controls, controlInstancesForControl, issuesForControl, processes } from '../../dataModel';
import { Chip, DimCell, OutcomeBadge, SectionCard, StatusBadge } from '../../primitives';
import { bandText } from '../../theme';
import type { OpenDrawer, SetActiveScreen } from '../../types';

const TYPES = ['ALL', 'preventive', 'detective'];
const NATURES = ['ALL', 'automated', 'hybrid', 'manual'];

export function ControlUniverseClassic({ openDrawer, setActiveScreen }: { openDrawer: OpenDrawer; setActiveScreen: SetActiveScreen }) {
  const [activeType, setActiveType] = useState<string>('ALL');
  const [activeNature, setActiveNature] = useState<string>('ALL');
  const [activeProcess, setActiveProcess] = useState<string>('ALL');
  const [populationOnly, setPopulationOnly] = useState(false);

  const filtered = useMemo(() => {
    return controls.filter((c) => {
      if (activeType !== 'ALL' && c.type !== activeType) return false;
      if (activeNature !== 'ALL' && c.nature !== activeNature) return false;
      if (activeProcess !== 'ALL' && c.process_id !== activeProcess) return false;
      if (populationOnly && !c.population_testable_flag) return false;
      return true;
    });
  }, [activeType, activeNature, activeProcess, populationOnly]);

  const dist = useMemo(() => {
    const d = { green: 0, amber: 0, red: 0, grey: 0 };
    filtered.forEach((c) => {
      const b = (c.ces_band as keyof typeof d) || 'grey';
      d[b] = (d[b] || 0) + 1;
    });
    return d;
  }, [filtered]);

  return (
    <div className="space-y-5">
      {/* Distribution */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <DistTile label="Total" value={filtered.length} band="neutral" />
        <DistTile label="Green CES" value={dist.green} band="green" />
        <DistTile label="Amber CES" value={dist.amber} band="amber" />
        <DistTile label="Red CES" value={dist.red} band="red" />
        <DistTile label="Insufficient data" value={dist.grey} band="grey" />
      </div>

      {/* Filter rail */}
      <SectionCard title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <FilterGroup label="Type" options={TYPES} value={activeType} onChange={setActiveType} />
          <FilterGroup label="Nature" options={NATURES} value={activeNature} onChange={setActiveNature} />
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Process</label>
            <select
              value={activeProcess}
              onChange={(e) => setActiveProcess(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs"
            >
              <option value="ALL">All processes</option>
              {processes.map((p) => (
                <option key={p.process_id} value={p.process_id}>
                  {p.process_id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Testability</label>
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs">
              <input type="checkbox" checked={populationOnly} onChange={(e) => setPopulationOnly(e.target.checked)} />
              Population-testable only
            </label>
          </div>
        </div>
      </SectionCard>

      {/* Control table */}
      <SectionCard title={`Controls (${filtered.length})`} subtitle="Sortable RCM browser ΓÇö click any row for drill-down">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-2 text-left">Control</th>
                <th className="px-2 py-2 text-left">Process</th>
                <th className="px-2 py-2 text-left">Type ┬╖ Nature</th>
                <th className="px-2 py-2 text-left">CES</th>
                <th className="px-2 py-2 text-left w-32">OperatingRate</th>
                <th className="px-2 py-2 text-left w-32">CatchRate</th>
                <th className="px-2 py-2 text-left w-32">EvidenceCompl.</th>
                <th className="px-2 py-2 text-left">Outcome split</th>
                <th className="px-2 py-2 text-left">AI / Issues</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const insights = aiInsightsForControl(c.control_id);
                const openIssues = issuesForControl(c.control_id);
                const instances = controlInstancesForControl(c.control_id);
                const pass = instances.filter((i) => i.outcome === 'Pass').length;
                const fail = instances.filter((i) => i.outcome === 'Fail').length;
                const evGap = instances.filter((i) => i.outcome === 'EvidenceGap').length;
                const dGap = instances.filter((i) => i.outcome === 'DataGap').length;
                return (
                  <tr
                    key={c.control_id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => openDrawer('control', c.control_id, 'controlUniverse')}
                  >
                    <td className="px-2 py-2">
                      <div className="font-mono text-[10px] text-slate-600">{c.control_id}</div>
                      <div className="line-clamp-2 text-[11px] font-medium text-slate-900">{c.title}</div>
                    </td>
                    <td className="px-2 py-2 font-mono text-[10px] text-slate-600">{c.process_id}</td>
                    <td className="px-2 py-2 text-[10px] text-slate-700">
                      {c.type} ┬╖ {c.nature}
                    </td>
                    <td className="px-2 py-2">
                      <StatusBadge tone={c.ces_band} label={c.ces == null ? 'ΓÇö' : c.ces.toFixed(0)} size="xs" />
                    </td>
                    <td className="px-2 py-2"><DimCell value={c.ces_breakdown.operating_rate} band={cesCompBand(c.ces_breakdown.operating_rate)} /></td>
                    <td className="px-2 py-2"><DimCell value={c.ces_breakdown.catch_rate} band={cesCompBand(c.ces_breakdown.catch_rate)} /></td>
                    <td className="px-2 py-2"><DimCell value={c.ces_breakdown.evidence_completeness} band={cesCompBand(c.ces_breakdown.evidence_completeness)} /></td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        {pass > 0 && <OutcomeBadge outcome="Pass" size="xs" />}
                        {fail > 0 && <OutcomeBadge outcome="Fail" size="xs" />}
                        {evGap > 0 && <OutcomeBadge outcome="EvidenceGap" size="xs" />}
                        {dGap > 0 && <OutcomeBadge outcome="DataGap" size="xs" />}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-500">{instances.length} CIs</div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        {insights.length > 0 && <Chip label={`AI ${insights.length}`} tone="violet" size="xs" />}
                        {openIssues.length > 0 && <Chip label={`Iss ${openIssues.length}`} tone="amber" size="xs" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={9} className="px-2 py-6 text-center text-xs text-slate-500">
                    No controls under the current filters ΓÇö relax filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setActiveScreen('populationTesting')}
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          Run population test on selection ΓåÆ
        </button>
      </div>
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${value === o ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function DistTile({ label, value, band }: { label: string; value: number; band: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-2xl font-bold ${bandText(band)}`}>{value}</div>
    </div>
  );
}

const cesCompBand = (v: number | null) => {
  if (v == null) return 'grey';
  if (v >= 80) return 'green';
  if (v >= 60) return 'amber';
  return 'red';
};

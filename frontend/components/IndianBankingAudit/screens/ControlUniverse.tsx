'use client';

import { useEffect, useMemo, useState } from 'react';
import { controls, processes } from '../dataModel';
import type { OpenDrawer } from '../types';
import { ControlDetailPanel } from './ControlDrillDown';
import { FIELD_LABEL, SELECT_CLASS } from './controlUniverse/controlUniverseLayout';
import { ControlUniverseTable } from './controlUniverse/ControlUniverseTable';

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All types' },
  { value: 'preventive', label: 'Preventive' },
  { value: 'detective', label: 'Detective' },
] as const;

const NATURE_OPTIONS = [
  { value: 'ALL', label: 'All natures' },
  { value: 'automated', label: 'Automated' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'manual', label: 'Manual' },
] as const;

export function ControlUniverse({
  openDrawer,
  selectedControlId,
  setSelectedControlId,
}: {
  openDrawer: OpenDrawer;
  selectedControlId: string | null;
  setSelectedControlId: (id: string | null) => void;
}) {
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

  useEffect(() => {
    if (!selectedControlId) return;
    if (!filtered.some((c) => c.control_id === selectedControlId)) {
      setSelectedControlId(null);
    }
  }, [filtered, selectedControlId, setSelectedControlId]);

  const detailOpen = Boolean(
    selectedControlId && filtered.some((c) => c.control_id === selectedControlId),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="shrink-0 pr-2">
            <span className={FIELD_LABEL}>Total</span>
            <p className="text-2xl font-bold tabular-nums leading-none text-slate-900">{filtered.length}</p>
          </div>

          <div className="min-w-[9rem] flex-1 sm:max-w-[11rem]">
            <label className={FIELD_LABEL} htmlFor="control-universe-type">
              Type
            </label>
            <select
              id="control-universe-type"
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className={SELECT_CLASS}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[9rem] flex-1 sm:max-w-[11rem]">
            <label className={FIELD_LABEL} htmlFor="control-universe-nature">
              Nature
            </label>
            <select
              id="control-universe-nature"
              value={activeNature}
              onChange={(e) => setActiveNature(e.target.value)}
              className={SELECT_CLASS}
            >
              {NATURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[10rem] flex-[1.2] sm:max-w-[14rem]">
            <label className={FIELD_LABEL} htmlFor="control-universe-process">
              Process
            </label>
            <select
              id="control-universe-process"
              value={activeProcess}
              onChange={(e) => setActiveProcess(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="ALL">All processes</option>
              {processes.map((p) => (
                <option key={p.process_id} value={p.process_id}>
                  {p.process_id}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[11rem] shrink-0 pb-0.5">
            <span className={FIELD_LABEL}>Testability</span>
            <label className="flex h-[30px] cursor-pointer items-center gap-2 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={populationOnly}
                onChange={(e) => setPopulationOnly(e.target.checked)}
                className="rounded border-slate-300"
              />
              Population-testable only
            </label>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 gap-3 overflow-hidden">
        <div
          className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-[width] duration-200 ${
            detailOpen ? 'w-[min(100%,22rem)] shrink-0 lg:w-[38%] lg:max-w-md' : 'min-w-0 flex-1'
          }`}
        >
          <div className="shrink-0 border-b border-slate-100 px-3 py-2">
            <div className="text-xs font-semibold text-slate-800">Controls ({filtered.length})</div>
            <p className="text-[10px] text-slate-500">
              {detailOpen
                ? 'Click another row or ← List to return to full table'
                : 'Click a row for CES breakdown and population'}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <ControlUniverseTable
              controls={filtered}
              detailOpen={detailOpen}
              selectedControlId={selectedControlId}
              onSelectControl={setSelectedControlId}
            />
          </div>
        </div>

        {detailOpen && selectedControlId ? (
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 lg:p-4">
            <ControlDetailPanel
              key={selectedControlId}
              selectedControlId={selectedControlId}
              openDrawer={openDrawer}
              sourceScreen="controlUniverse"
              onClose={() => setSelectedControlId(null)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

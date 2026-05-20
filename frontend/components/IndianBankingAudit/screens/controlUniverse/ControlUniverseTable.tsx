'use client';

import type { Control } from '../../dataModel';
import { aiInsightsForControl, controlInstancesForControl, issuesForControl } from '../../dataModel';
import { Chip, OutcomeBadge, StatusBadge } from '../../primitives';
import { ControlScorePill } from './ControlScorePill';
import { SCORE_COL_CLASS, TABLE_CELL, TABLE_HEAD } from './controlUniverseLayout';

export function ControlUniverseTable({
  controls: rows,
  detailOpen,
  selectedControlId,
  onSelectControl,
}: {
  controls: Control[];
  detailOpen: boolean;
  selectedControlId: string | null;
  onSelectControl: (id: string) => void;
}) {
  const colSpan = detailOpen ? 3 : 9;

  return (
    <table className="w-full border-collapse text-xs">
      <thead className="sticky top-0 z-[1] bg-slate-50">
        <tr>
          <th className={TABLE_HEAD}>Control</th>
          {!detailOpen && <th className={TABLE_HEAD}>Process</th>}
          {!detailOpen && <th className={TABLE_HEAD}>Type · Nature</th>}
          <th className={`${TABLE_HEAD} ${SCORE_COL_CLASS}`}>CES</th>
          {!detailOpen && (
            <>
              <th className={`${TABLE_HEAD} ${SCORE_COL_CLASS}`}>Operating</th>
              <th className={`${TABLE_HEAD} ${SCORE_COL_CLASS}`}>Catch</th>
              <th className={`${TABLE_HEAD} ${SCORE_COL_CLASS}`}>Evidence</th>
              <th className={TABLE_HEAD}>Outcomes</th>
            </>
          )}
          <th className={TABLE_HEAD}>{detailOpen ? 'CI' : 'AI / Issues'}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <ControlUniverseRow
            key={c.control_id}
            control={c}
            detailOpen={detailOpen}
            selected={c.control_id === selectedControlId}
            onSelect={() => onSelectControl(c.control_id)}
          />
        ))}
        {!rows.length && (
          <tr>
            <td colSpan={colSpan} className="px-2 py-6 text-center text-xs text-slate-500">
              No controls match filters
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function ControlUniverseRow({
  control: c,
  detailOpen,
  selected,
  onSelect,
}: {
  control: Control;
  detailOpen: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const insights = aiInsightsForControl(c.control_id);
  const openIssues = issuesForControl(c.control_id);
  const instances = controlInstancesForControl(c.control_id);
  const pass = instances.filter((i) => i.outcome === 'Pass').length;
  const fail = instances.filter((i) => i.outcome === 'Fail').length;
  const evGap = instances.filter((i) => i.outcome === 'EvidenceGap').length;
  const dGap = instances.filter((i) => i.outcome === 'DataGap').length;
  const { operating_rate, catch_rate, evidence_completeness } = c.ces_breakdown;

  return (
    <tr
      className={`cursor-pointer border-t border-slate-100 ${
        selected ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-200' : 'hover:bg-slate-50'
      }`}
      onClick={onSelect}
    >
      <td className={TABLE_CELL}>
        <div className="font-mono text-[10px] leading-snug text-slate-600">{c.control_id}</div>
        <div className="break-words text-[11px] font-medium leading-snug text-slate-900">{c.title}</div>
      </td>

      {!detailOpen && (
        <td className={`${TABLE_CELL} font-mono text-[10px] text-slate-600`}>{c.process_id}</td>
      )}

      {!detailOpen && (
        <td className={`${TABLE_CELL} text-[10px] text-slate-700`}>
          {c.type} · {c.nature}
        </td>
      )}

      <td className={TABLE_CELL}>
        <StatusBadge tone={c.ces_band} label={c.ces == null ? '—' : c.ces.toFixed(0)} size="xs" />
      </td>

      {!detailOpen && (
        <>
          <td className={TABLE_CELL}>
            <ControlScorePill value={operating_rate} />
          </td>
          <td className={TABLE_CELL}>
            <ControlScorePill value={catch_rate} />
          </td>
          <td className={TABLE_CELL}>
            <ControlScorePill value={evidence_completeness} />
          </td>
          <td className={TABLE_CELL}>
            <div className="flex flex-wrap items-center gap-1">
              {pass > 0 && <OutcomeBadge outcome="Pass" size="xs" />}
              {fail > 0 && <OutcomeBadge outcome="Fail" size="xs" />}
              {evGap > 0 && <OutcomeBadge outcome="EvidenceGap" size="xs" />}
              {dGap > 0 && <OutcomeBadge outcome="DataGap" size="xs" />}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">{instances.length} CIs</div>
          </td>
        </>
      )}

      <td className={TABLE_CELL}>
        {detailOpen ? (
          <span className="text-[10px] tabular-nums text-slate-600">{instances.length}</span>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            {insights.length > 0 && <Chip label={`AI ${insights.length}`} tone="violet" size="xs" />}
            {openIssues.length > 0 && <Chip label={`Iss ${openIssues.length}`} tone="amber" size="xs" />}
          </div>
        )}
      </td>
    </tr>
  );
}

'use client';

import type { ControlInstance } from '../../dataModel';
import { OutcomeBadge, SectionCard } from '../../primitives';
import {
  DETAIL_CELL,
  DETAIL_TABLE_HEAD,
  POPULATION_COL,
  POPULATION_TABLE_MIN_W,
} from './controlDetailLayout';

const fmtTs = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 19).replace('T', ' ') + 'Z' : '—';

function instanceReason(ci: ControlInstance): string {
  return ci.fail_reason || ci.evidence_gap_reason || ci.data_gap_reason || '—';
}

export function ControlPopulationGrid({
  instances,
  onOpenInstance,
}: {
  instances: ControlInstance[];
  onOpenInstance: (controlInstanceId: string) => void;
}) {
  return (
    <SectionCard
      title={`Population grid (${instances.length} ControlInstances)`}
      subtitle="Click any row → D-01 source lineage drawer"
    >
      <div className="-mx-1 overflow-x-auto">
        <table className={`w-full table-fixed border-collapse text-xs ${POPULATION_TABLE_MIN_W}`}>
          <colgroup>
            <col className={POPULATION_COL.ci} />
            <col className={POPULATION_COL.subject} />
            <col className={POPULATION_COL.outcome} />
            <col className={POPULATION_COL.fired} />
            <col className={POPULATION_COL.latency} />
            <col className={POPULATION_COL.reason} />
          </colgroup>
          <thead>
            <tr>
              <th className={DETAIL_TABLE_HEAD}>CI</th>
              <th className={DETAIL_TABLE_HEAD}>Subject</th>
              <th className={DETAIL_TABLE_HEAD}>Outcome</th>
              <th className={DETAIL_TABLE_HEAD}>Fired</th>
              <th className={`${DETAIL_TABLE_HEAD} text-right`}>Latency</th>
              <th className={DETAIL_TABLE_HEAD}>Reason</th>
            </tr>
          </thead>
          <tbody>
            {instances.map((ci) => (
              <tr
                key={ci.control_instance_id}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                onClick={() => onOpenInstance(ci.control_instance_id)}
              >
                <td className={`${DETAIL_CELL} font-mono text-[10px] leading-snug text-slate-600`}>
                  {ci.control_instance_id}
                </td>
                <td className={`${DETAIL_CELL} font-mono text-[10px] leading-snug text-slate-700`}>
                  {ci.subject_id}
                </td>
                <td className={DETAIL_CELL}>
                  <OutcomeBadge outcome={ci.outcome} size="xs" />
                </td>
                <td className={`${DETAIL_CELL} whitespace-nowrap text-[10px] text-slate-600`}>
                  {fmtTs(ci.fire_ts)}
                </td>
                <td className={`${DETAIL_CELL} text-right whitespace-nowrap text-[10px] tabular-nums text-slate-600`}>
                  {ci.latency_ms != null ? `${(ci.latency_ms / 1000).toFixed(1)}s` : '—'}
                </td>
                <td className={`${DETAIL_CELL} text-[11px] leading-relaxed text-slate-700`}>
                  <span className="block break-words">{instanceReason(ci)}</span>
                </td>
              </tr>
            ))}
            {!instances.length && (
              <tr>
                <td colSpan={6} className="px-2.5 py-6 text-center text-xs text-slate-500">
                  No control instances in window
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

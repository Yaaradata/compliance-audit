'use client';

import { ChevronRight, FileText, X } from 'lucide-react';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import { buildCohAttention, buildCohDecisions, buildHobRisks } from './fastTagExecutiveMetrics';
import { buildCohKpiDrill } from './fastTagCohKpiDrill';
import type { ExecAttentionItem, ExecDrillState, FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';
import { buildHoBKpiDrill } from './fastTagHobKpiDrill';
import FastTagHoBKpiDrillPanel from './FastTagHoBKpiDrillPanel';
import type { FastTagSop } from './fastTagCaseBuilder';
import { getPlazaBreakDrill } from './tollSettlementDrills';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import { buildControlDrillContent } from './fastTagControlDrill';
import FastTagControlDrillPanel from './FastTagControlDrillPanel';
import FastTagAttentionDrillPanel from './FastTagAttentionDrillPanel';
import FastTagAttentionListDrillPanel from './FastTagAttentionListDrillPanel';
import {
  EXEC_AI_PRIORITIES_COH_SUBTITLE,
  EXEC_AI_PRIORITIES_HOB_SUBTITLE,
  EXEC_AI_PRIORITIES_TITLE,
  EXEC_AI_PRIORITY_DETAIL_FALLBACK,
} from './fastTagExecutiveAiLabels';
import { buildSegmentDrill } from './fastTagSegmentDrill';
import FastTagSegmentMixDrillPanel from './FastTagSegmentMixDrillPanel';

type Props = {
  drill: ExecDrillState;
  controls: AuditControl[];
  cases: FastTagCaseLike[];
  regionCode: string | null;
  persona: 'coh' | 'hob';
  sop?: FastTagSop;
  onClose: () => void;
  onOpenDrill: (d: ExecDrillState) => void;
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
  onNavigate: (req: FastTagWorkspaceNavigate) => void;
};

export default function FastTagExecutiveDrillDrawer({
  drill,
  controls,
  cases,
  regionCode,
  persona,
  sop,
  onClose,
  onOpenDrill,
  onOpenEvidence,
  onNavigate,
}: Props) {
  if (!drill) return null;

  const control =
    drill.kind === 'control' ? controls.find((c) => c.id === drill.controlId) : undefined;
  const decisions = buildCohDecisions(controls);
  const risks = buildHobRisks(controls, cases, regionCode);

  let title = 'Detail';
  let body: React.ReactNode = null;

  if (drill.kind === 'decision') {
    const d = decisions.find((x) => x.id === drill.id);
    title = d?.title ?? 'Decision';
    body = d ? (
      <div className="space-y-4 text-sm text-slate-700">
        <p>{d.desc}</p>
        <p>
          <span className="font-semibold text-slate-900">Linked control:</span> {d.controlId}
        </p>
        <p>
          <span className="font-semibold text-emerald-700">Est. impact:</span> {d.impact}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const c = controls.find((x) => x.id === d.controlId);
              if (c) onOpenEvidence(c, 'Fast-Tag');
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <FileText className="h-3.5 w-3.5" /> Open evidence
          </button>
          <button
            type="button"
            onClick={() => onNavigate(d.navigate)}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Go to workspace <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    ) : null;
  } else if (drill.kind === 'segment-mix') {
    const detail = buildSegmentDrill(drill.segment, cases, regionCode);
    title = detail.label;
    body = <FastTagSegmentMixDrillPanel content={detail} onNavigate={onNavigate} />;
  } else if (drill.kind === 'attention-list') {
    const isCoh = drill.variant === 'coh-attention';
    const items: ExecAttentionItem[] = isCoh
      ? buildCohAttention(controls, cases, regionCode)
      : (risks as ExecAttentionItem[]);
    title = EXEC_AI_PRIORITIES_TITLE;
    body = (
      <FastTagAttentionListDrillPanel
        items={items}
        drillKind={drill.variant}
        subtitle={isCoh ? EXEC_AI_PRIORITIES_COH_SUBTITLE : EXEC_AI_PRIORITIES_HOB_SUBTITLE}
        onOpenDrill={onOpenDrill}
      />
    );
  } else if (drill.kind === 'risk') {
    const r = risks.find((x) => x.id === drill.id);
    title = r?.title ?? EXEC_AI_PRIORITY_DETAIL_FALLBACK;
    body = r ? (
      <FastTagAttentionDrillPanel
        item={r}
        personaLabel="Head of Business"
        onNavigate={onNavigate}
      />
    ) : null;
  } else if (drill.kind === 'plaza') {
    const plaza = getPlazaBreakDrill(drill.breakId);
    title = plaza?.plazaName ?? 'Plaza break';
    body = plaza ? (
      <div className="space-y-3 text-sm text-slate-700">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-950 ring-1 ring-amber-200">{plaza.mismatchReason}</p>
        <p>
          Variance <span className="font-semibold">₹{plaza.varianceInr.toLocaleString('en-IN')}</span> · {plaza.status} ·{' '}
          {plaza.ageDays}d
        </p>
        <ul className="list-disc space-y-1 pl-4 text-xs">
          {plaza.auditInsights.slice(0, 3).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            onNavigate({ view: 'toll', tollPlazaBreakId: drill.breakId, controlId: 'FT-11' })
          }
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Open toll settlement <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    ) : null;
  } else if (drill.kind === 'kpi' && sop) {
    const detail = buildHoBKpiDrill(drill.kpiId, cases, controls, sop, regionCode);
    title = detail?.title ?? 'KPI detail';
    body = detail ? <FastTagHoBKpiDrillPanel content={detail} onNavigate={onNavigate} /> : null;
  } else if (drill.kind === 'coh-kpi') {
    const detail = buildCohKpiDrill(drill.kpiId, cases, controls, regionCode);
    title = detail?.title ?? 'KPI detail';
    body = detail ? <FastTagHoBKpiDrillPanel content={detail} onNavigate={onNavigate} /> : null;
  } else if (drill.kind === 'coh-attention') {
    const item = buildCohAttention(controls, cases, regionCode).find((x) => x.id === drill.id);
    title = item?.title ?? EXEC_AI_PRIORITY_DETAIL_FALLBACK;
    body = item ? (
      <FastTagAttentionDrillPanel
        item={item}
        personaLabel="Head of CX"
        onNavigate={onNavigate}
      />
    ) : null;
  } else if (drill.kind === 'control' && control) {
    const detail = buildControlDrillContent(control, cases, regionCode);
    title = `${control.id} · ${control.name}`;
    body = (
      <FastTagControlDrillPanel
        content={detail}
        control={control}
        onOpenEvidence={onOpenEvidence}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-slate-900/30"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">{body}</div>
        <div className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-500">
          {persona === 'coh' ? 'Head of CX' : 'Head of Business'} · Fast-Tag Q1 2026
        </div>
      </aside>
    </>
  );
}

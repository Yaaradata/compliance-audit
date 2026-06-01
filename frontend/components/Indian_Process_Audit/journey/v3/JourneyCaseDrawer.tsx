'use client';

import type { RccCase, RccDomain } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { JourneyMiniStrip } from './JourneyMiniStrip';
import { JourneyStageDrillPanel } from './JourneyStageDrillPanel';
import { StatusPill } from './StatusPill';
import { STATUS_STYLES } from './journeyCommandCenterStyles';

export type JourneyDrawerState =
  | { type: 'stage'; stageKey: string }
  | { type: 'case'; caseId: string; from?: 'stage' | 'queue' }
  | null;

function EvidenceCard({ item }: { item: NonNullable<RccCase['evidence']>[number] }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-sm text-slate-500">
        ▤
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-xs text-slate-900">{item.name}</div>
        <div className="text-[11px] text-slate-400">{item.source}</div>
      </div>
      <div className="shrink-0 text-right text-[11px] text-slate-400">
        <div>{item.kind}</div>
        <div className="tabular-nums">{item.size}</div>
      </div>
    </div>
  );
}

function CaseDetail({
  domain,
  kase,
  showBack,
  onBack,
}: {
  domain: RccDomain;
  kase: RccCase;
  showBack?: boolean;
  onBack?: () => void;
}) {
  const critical = kase.status === 'Critical';
  return (
    <div>
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-2.5 cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-blue-600 hover:underline"
        >
          ‹ Back to stage
        </button>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[17px] font-bold text-slate-900">{kase.title}</div>
          <div className="mt-0.5 font-mono text-xs text-slate-400">
            {kase.id} · {kase.subtitle}
          </div>
        </div>
        <StatusPill status={kase.status} />
      </div>

      <div
        className={`mt-3.5 rounded-lg border p-3 ${
          critical && kase.failedStage
            ? 'border-red-100 bg-red-50/80'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className={`text-xs font-bold ${critical ? 'text-red-700' : 'text-amber-800'}`}>
          {kase.failedStage ? `Stage · ${kase.stageLabel}` : 'All stages passed'}
          {kase.status === 'Critical' && ' — Failed / rejected'}
          {kase.status === 'Exception' && kase.failedStage && ' — Awaiting evidence'}
        </div>
        {kase.purpose ? <p className="mt-1 text-xs leading-snug text-slate-500">{kase.purpose}</p> : null}
      </div>

      <div className="mt-3.5">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Journey
        </div>
        <JourneyMiniStrip domain={domain} kase={kase} />
      </div>

      {kase.owner ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[13px] font-bold text-white">
            {kase.owner.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-slate-900">{kase.owner.name}</div>
            <div className="text-xs text-slate-500">{kase.owner.role}</div>
            <div className="mt-0.5 font-mono text-[11px] text-slate-400">
              {kase.owner.emp} · {kase.owner.site} · {kase.owner.time}
            </div>
          </div>
        </div>
      ) : null}

      {kase.accountable ? (
        <p className="mt-3.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">Accountable to submit: </span>
          {kase.accountable}
        </p>
      ) : null}

      {kase.evidence && kase.evidence.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Evidence submitted ({kase.evidence.length})
          </div>
          <div className="grid gap-2">
            {kase.evidence.map((e) => (
              <EvidenceCard key={e.name} item={e} />
            ))}
          </div>
        </div>
      ) : null}

      {kase.controls && kase.controls.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Controls at this stage ({kase.controls.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {kase.controls.map((ct) => {
              const ok = ct.status === 'pass';
              const st = ok ? STATUS_STYLES.Completed : STATUS_STYLES.Critical;
              return (
                <span
                  key={ct.id}
                  className={`rounded-md border px-2 py-1 text-[11.5px] font-semibold ${st.fg} ${st.bg} ${st.border}`}
                >
                  {ok ? '✓' : '✕'} {ct.id} {ct.label}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {kase.observation ? (
        <div
          className={`mt-4 rounded-lg border p-3 ${
            critical ? 'border-red-100 bg-red-50/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className={`mb-1 text-xs font-bold ${critical ? 'text-red-700' : 'text-amber-800'}`}>
            ⚠ Auditor observation
          </div>
          <p className="text-xs leading-relaxed text-slate-800">{kase.observation}</p>
        </div>
      ) : null}
    </div>
  );
}

export function JourneyCaseDrawer({
  domain,
  state,
  onClose,
  onOpenCase,
  onBackToStage,
  layerClass = 'z-50',
}: {
  domain: RccDomain;
  state: JourneyDrawerState;
  onClose: () => void;
  onOpenCase: (caseId: string) => void;
  onBackToStage: () => void;
  /** Raise when stacking above another drawer (e.g. cockpit domain panel). */
  layerClass?: string;
}) {
  if (!state) return null;

  const kase = state.type === 'case' ? domain.cases.find((x) => x.id === state.caseId) : undefined;

  return (
    <div className={`fixed inset-0 ${layerClass}`}>
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-[min(460px,92vw)] flex-col overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="mt-1">
          {state.type === 'stage' ? (
            <JourneyStageDrillPanel
              domain={domain}
              stageKey={state.stageKey}
              onOpenCase={onOpenCase}
              onClear={onClose}
            />
          ) : null}
          {state.type === 'case' && kase ? (
            <CaseDetail
              domain={domain}
              kase={kase}
              showBack={state.from === 'stage'}
              onBack={onBackToStage}
            />
          ) : null}
        </div>
      </aside>
    </div>
  );
}

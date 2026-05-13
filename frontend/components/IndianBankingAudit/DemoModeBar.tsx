'use client';

import React from 'react';
import { DEMO_STEP_COUNT, DEMO_STEPS } from './demoGuidedStory';
import { oriFocusRing } from './theme';

export function DemoModeBar({
  step,
  onBack,
  onNext,
  onExit,
  onReplay,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
  onReplay: () => void;
}) {
  const def = DEMO_STEPS[step - 1];
  const isFirst = step <= 1;
  const isLast = step >= DEMO_STEP_COUNT;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] flex h-14 items-center border-t border-slate-200 bg-slate-900 px-4 text-white shadow-[0_-4px_20px_rgba(15,23,42,0.12)]"
      role="region"
      aria-label="Guided demo controls"
    >
      <div className="flex w-full min-w-0 items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-indigo-200">Step {step} of {DEMO_STEP_COUNT}</div>
          {def?.aiSubtitle ? (
            <div className="truncate text-[10px] italic text-indigo-100/85">{def.aiSubtitle}</div>
          ) : null}
          <p className="truncate text-xs font-medium leading-snug text-white">{def?.description ?? ''}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst}
            className={`rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 ${oriFocusRing}`}
          >
            ← Back
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onReplay}
              className={`rounded-md border border-indigo-300 bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 ${oriFocusRing}`}
            >
              Replay
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className={`rounded-md border border-white bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 ${oriFocusRing}`}
            >
              Next →
            </button>
          )}
          <button
            type="button"
            onClick={onExit}
            className={`rounded-md border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 ${oriFocusRing}`}
          >
            Exit demo
          </button>
        </div>
      </div>
    </div>
  );
}

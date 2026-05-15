'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { RegAlertRecord } from '@/lib/IndianBankingAudit/regIntelMockData';

const STAGE_ORDER = ['acknowledge', 'assess', 'assign', 'implement', 'certify'] as const;

export function RegIntelWorkflowStepper({ alert, accentHex }: { alert: RegAlertRecord; accentHex: string }) {
  const closed = alert.stage === 'closed';
  const current = closed ? 6 : Math.min(Math.max(alert.stage_index, 1), 5);

  const activeKey = closed ? 'closed' : STAGE_ORDER[Math.min(Math.max(current - 1, 0), STAGE_ORDER.length - 1)];
  const phaseLabel =
    activeKey === 'acknowledge'
      ? 'Acknowledge'
      : activeKey === 'assess'
        ? 'Assess'
        : activeKey === 'assign'
          ? 'Assign'
          : activeKey === 'implement'
            ? 'Implement'
            : 'Certify';
  const stepperAria = closed
    ? 'Regulatory workflow: all five stages complete; alert certified closed.'
    : `Step ${current} of 5 — ${phaseLabel}`;

  return (
    <div className="mt-5 w-full" role="group" aria-label={stepperAria}>
      <div className="flex w-full items-start">
        {STAGE_ORDER.map((stageKey, i) => {
          const stepNum = i + 1;
          const completed = stepNum < current;
          const active = !closed && stepNum === current;

          return (
            <React.Fragment key={stageKey}>
              {i > 0 ? (
                <div className="mx-0.5 mt-[15px] flex min-h-[2px] min-w-[8px] flex-1 items-center" aria-hidden>
                  {i < current ? (
                    <div
                      className="h-[2px] w-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${accentHex}, ${accentHex}66)`,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full border-t-2"
                      style={{
                        borderColor: '#D1D5DB',
                        borderStyle: i === current ? 'dotted' : 'dashed',
                      }}
                    />
                  )}
                </div>
              ) : null}
              <div className="flex min-w-[56px] flex-1 flex-col items-center">
                <div
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    active ? 'ori-reg-intel-stepper-pulse-soft text-white' : ''
                  }`}
                  style={
                    completed || active
                      ? {
                          backgroundColor: accentHex,
                          borderColor: accentHex,
                          color: '#fff',
                          ['--ori-stepper-ring' as string]: accentHex,
                        }
                      : {
                          backgroundColor: '#fff',
                          borderColor: '#D1D5DB',
                          color: '#9CA3AF',
                        }
                  }
                >
                  {completed ? (
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden />
                  ) : (
                    <span>{stepNum}</span>
                  )}
                </div>
                <span
                  className={`mt-1.5 text-center text-[10px] capitalize leading-tight ${
                    active ? 'font-bold' : completed ? 'font-normal' : 'font-normal text-slate-400'
                  }`}
                  style={{ color: completed || active ? accentHex : undefined }}
                >
                  {stageKey}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { AlertTriangle, Clock, History, Megaphone } from 'lucide-react';

export type RegIntelCountdownVariant = 'effective' | 'consultation' | 'passed' | 'peer' | 'none';

export interface RegIntelCountdownChipProps {
  variant: RegIntelCountdownVariant;
  /** For effective / consultation: days remaining; for passed: non-positive effective offset. */
  days: number | null;
  className?: string;
}

const base =
  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-1.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-md';

const iconClass = 'h-3 w-3 shrink-0';

export function RegIntelCountdownChip({ variant, days, className = '' }: RegIntelCountdownChipProps) {
  if (variant === 'none') {
    return (
      <span
        className={`${base} min-h-[28px] min-w-[5.5rem] border-slate-200 bg-slate-50 ${className}`}
        aria-hidden
      />
    );
  }

  if (variant === 'peer') {
    return (
      <span
        className={`${base} border-[#FCD34D] bg-[#FEF3C7] text-[#92400E] ${className}`}
        role="status"
      >
        <AlertTriangle className={iconClass} strokeWidth={2} aria-hidden />
        Awaiting self-assessment
      </span>
    );
  }

  if (variant === 'consultation') {
    return (
      <span
        className={`${base} border-[#93C5FD] bg-[#DBEAFE] text-[#1E40AF] ${className}`}
        role="status"
      >
        <Megaphone className={iconClass} strokeWidth={2} aria-hidden />
        {days != null ? `${days}d to consultation close` : 'Consultation open'}
      </span>
    );
  }

  if (variant === 'passed' || (variant === 'effective' && days != null && days <= 0)) {
    return (
      <span
        className={`${base} border-[#D1D5DB] bg-[#F3F4F6] text-[#4B5563] ${className}`}
        role="status"
      >
        <History className={iconClass} strokeWidth={2} aria-hidden />
        Effective passed
      </span>
    );
  }

  if (variant === 'effective' && days != null && days > 0) {
    let tone = 'border-[#86EFAC] bg-[#DCFCE7] text-[#166534]';
    if (days <= 7) tone = 'border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]';
    else if (days <= 21) tone = 'border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]';

    return (
      <span className={`${base} ${tone} ${className}`} role="status">
        <Clock className={iconClass} strokeWidth={2} aria-hidden />
        {days}d to effective
      </span>
    );
  }

  return (
    <span className={`${base} border-slate-200 bg-slate-50 text-slate-600 ${className}`} role="status">
      <Clock className={iconClass} strokeWidth={2} aria-hidden />
      No schedule
    </span>
  );
}

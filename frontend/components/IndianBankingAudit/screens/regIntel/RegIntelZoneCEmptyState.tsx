'use client';

import React from 'react';

/** Reusable empty state (illustration + copy). Desktop inbox uses full-width list until selection; mount where needed. */
export function RegIntelZoneCEmptyState() {
  return (
    <div
      className="flex min-h-[min(360px,55vh)] w-full flex-1 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      role="region"
      aria-label="No alert selected"
    >
      <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0" aria-hidden>
        <rect x="22" y="14" width="68" height="86" rx="6" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
        <path d="M34 32h44M34 44h36M34 56h40" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="72" cy="70" r="18" fill="none" stroke="#94A3B8" strokeWidth="2.5" />
        <line x1="85" y1="83" x2="98" y2="96" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <h2 className="mt-6 text-[16px] font-medium leading-snug text-[#475569]">Select a regulatory alert</h2>
      <p className="mt-2 max-w-[320px] text-center text-[14px] leading-relaxed text-[#64748B]">
        Choose an alert from the inbox to review AI-extracted obligations, coverage gaps, and the CCO workflow.
      </p>
    </div>
  );
}

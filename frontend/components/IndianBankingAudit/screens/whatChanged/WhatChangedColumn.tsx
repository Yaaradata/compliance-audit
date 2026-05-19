'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { WcwWeekDeltaSpec } from './buildWcwColumnWeekDeltas';
import { WcwWeekDeltaBadge } from './WcwWeekDeltaBadge';

export type WcwColumnAccent = 'issues' | 'controls' | 'reporting' | 'ai';

const ACCENT_BORDER: Record<WcwColumnAccent, string> = {
  issues: '#DC2626',
  controls: '#7C3AED',
  reporting: '#D97706',
  ai: '#0EA5E9',
};

const BADGE_STYLES: Record<WcwColumnAccent, { bg: string; text: string; border: string }> = {
  issues: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
  controls: { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' },
  reporting: { bg: '#FFEDD5', text: '#9A3412', border: '#FED7AA' },
  ai: { bg: '#E0F2FE', text: '#075985', border: '#BAE6FD' },
};

export function WhatChangedColumn({
  label,
  countBadge,
  weekDelta,
  accent,
  children,
  footer,
}: {
  label: string;
  countBadge: string;
  weekDelta?: WcwWeekDeltaSpec;
  accent: WcwColumnAccent;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const badge = BADGE_STYLES[accent];
  const cardStyle = {
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    borderLeftColor: ACCENT_BORDER[accent],
  } as CSSProperties;

  return (
    <article className="wcw-column-card" style={cardStyle}>
      <div className="wcw-column-header-strip">
        <div className="min-w-0 flex-1">
          <span className="wcw-column-header-label">{label}</span>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className="wcw-column-header-badge"
              style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
            >
              {countBadge}
            </span>
            {weekDelta ? <WcwWeekDeltaBadge delta={weekDelta} /> : null}
          </div>
        </div>
      </div>
      <div className="wcw-column-body">{children}</div>
      {footer ? <div className="mt-3 shrink-0">{footer}</div> : null}
    </article>
  );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { AuditCardProps, AuditSeverity } from './AuditCard.types';
import './AuditCard.css';

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 5.3L4.1 7.4L8 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const severityColor = (severity: AuditSeverity) => {
  switch (severity) {
    case 'Critical':
      return '#E24B4A';
    case 'High':
      return '#EF9F27';
    case 'Medium':
      return '#85B7EB';
    default:
      return '#97C459';
  }
};

export default function AuditCard({
  onOpen,
  domain,
  lead,
  severity,
  inScope,
  tested,
  passRate,
  critical,
  overdue,
  aiContext,
  aiAction,
}: AuditCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const coverage = useMemo(() => {
    if (inScope <= 0) return 0;
    return Math.min(100, Math.round((tested / inScope) * 100));
  }, [tested, inScope]);

  const fullyTested = inScope > 0 && tested >= inScope && coverage === 100;
  const gapCount = Math.max(0, inScope - tested);
  const isInteractive = Boolean(onOpen);
  const onCardKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (!onOpen) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <article
      role="region"
      aria-label={`${domain} audit card`}
      tabIndex={isInteractive ? 0 : -1}
      onClick={onOpen}
      onKeyDown={onCardKeyDown}
      className={`audit-card audit-card--${severity.toLowerCase()} ${isInteractive ? 'audit-card--interactive' : ''}`}
      style={{ ['--severity-color' as string]: severityColor(severity) }}
    >
      <div className="audit-card__zone">
        <div className="audit-card__header">
          <div className="audit-card__header-main">
            <div className="audit-card__title">{domain}</div>
            <div className="audit-card__lead">{lead}</div>
          </div>
          <span className="audit-card__severity-pill">{severity}</span>
        </div>
      </div>

      <div className="audit-card__zone audit-card__zone--coverage">
        {fullyTested ? (
          <div className="audit-card__fully-tested">
            <CheckIcon />
            Fully tested
          </div>
        ) : (
          <>
            <div className="audit-card__coverage-row">
              <span>{inScope} in scope</span>
              <span>{tested}/{inScope} tested</span>
            </div>
            <div className="audit-card__coverage-track" role="progressbar" aria-label={`${domain} coverage`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={coverage}>
              <div className="audit-card__coverage-fill" style={{ width: `${mounted ? coverage : 0}%` }} />
            </div>
            {gapCount > 0 ? <span className="audit-card__gap-pill">{gapCount} not tested</span> : null}
          </>
        )}
      </div>

      <div className="audit-card__zone audit-card__zone--metrics">
        <div className="audit-card__metric">
          <div className="audit-card__metric-label">PASS RATE</div>
          <div className="audit-card__metric-value">
            {passRate.toFixed(1)}%
          </div>
        </div>
        <div className="audit-card__metric">
          <div className="audit-card__metric-label">CRITICAL</div>
          <div className="audit-card__metric-value">
            {critical === 0 ? 'None' : critical}
          </div>
        </div>
        <div className="audit-card__metric">
          <div className="audit-card__metric-label">OVERDUE</div>
          <div className="audit-card__metric-value">
            {overdue === 0 ? 'None' : overdue}
          </div>
        </div>
      </div>

      <div className="audit-card__zone">
        <div className="audit-card__ai">
          <div className="audit-card__ai-label">AI FOCUS</div>
          <p className="audit-card__ai-text">{aiContext}</p>
          <p className="audit-card__ai-action">{aiAction}</p>
        </div>
      </div>
    </article>
  );
}

export function AuditCardSkeleton() {
  return (
    <div className="audit-card-skeleton" aria-hidden="true">
      <div className="audit-card-skeleton__inner">
        <div className="audit-card-skeleton__line audit-card-skeleton__line--md" />
        <div className="audit-card-skeleton__line audit-card-skeleton__line--sm" style={{ marginTop: 6 }} />
        <div className="audit-card-skeleton__line audit-card-skeleton__line--bar" style={{ marginTop: 12, height: 2 }} />
        <div className="audit-card-skeleton__grid">
          <div className="audit-card-skeleton__tile">
            <div className="audit-card-skeleton__line audit-card-skeleton__line--sm" />
            <div className="audit-card-skeleton__line audit-card-skeleton__line--md" style={{ marginTop: 8 }} />
          </div>
          <div className="audit-card-skeleton__tile">
            <div className="audit-card-skeleton__line audit-card-skeleton__line--sm" />
            <div className="audit-card-skeleton__line audit-card-skeleton__line--md" style={{ marginTop: 8 }} />
          </div>
          <div className="audit-card-skeleton__tile">
            <div className="audit-card-skeleton__line audit-card-skeleton__line--sm" />
            <div className="audit-card-skeleton__line audit-card-skeleton__line--md" style={{ marginTop: 8 }} />
          </div>
        </div>
        <div className="audit-card-skeleton__line audit-card-skeleton__line--lg" style={{ marginTop: 14, height: 48 }} />
        <div className="audit-card-skeleton__footer">
          <div className="audit-card-skeleton__line audit-card-skeleton__line--md" />
          <div className="audit-card-skeleton__line audit-card-skeleton__line--sm" />
        </div>
      </div>
    </div>
  );
}

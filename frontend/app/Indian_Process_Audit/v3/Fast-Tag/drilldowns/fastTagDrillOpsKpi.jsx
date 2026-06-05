import React from 'react';

export function heroKpiDeltaTone(delta) {
  if (!delta) return 'flat';
  if (/tgt|proxy|vs/i.test(delta) && !/\+|▲|↑/.test(delta)) return 'flat';
  if (/▼|↓|−|-\s*\d|flat|0%/i.test(delta)) return 'down';
  if (/▲|↑|\+/.test(delta)) return 'up';
  return 'flat';
}

function kpiBadgeForTone(tone) {
  if (tone === 'up') return 'Growing';
  if (tone === 'down') return 'Pressure';
  return 'Stable';
}

function kpiCompareLabel(delta) {
  if (/yoy/i.test(delta)) return 'vs last year';
  if (/quarter|qoq/i.test(delta)) return 'vs last quarter';
  if (/mom|mo\b/i.test(delta)) return 'vs last month';
  if (/week|wow/i.test(delta)) return 'vs last week';
  if (/24h|prior 24/i.test(delta)) return 'vs prior 24h';
  if (/tgt|target/i.test(delta)) return 'vs target';
  return 'vs prior period';
}

function KpiIcon({ label, color }) {
  const stroke = color ?? '#2563eb';
  if (/toll|gtv|throughput/i.test(label)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 10h18v8H3z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 10V7h4v3M13 10V6h4v4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="7" cy="18" r="1.5" fill={stroke} />
        <circle cx="17" cy="18" r="1.5" fill={stroke} />
        <path d="M10 14h6" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (/revenue|rev|net/i.test(label)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 18V6M4 18h16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 14l3-4 3 2 4-6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (/tag|active/i.test(label)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 10V6a2 2 0 012-2h5l7 7-7 7H6a2 2 0 01-2-2v-4" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.2" fill={stroke} />
      </svg>
    );
  }
  if (/transaction|txn|daily/i.test(label)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 16V8M9 16V5M13 16v-6M17 16v-9" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (/customer|happy|recommend/i.test(label)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 20s-6.5-4.2-8.5-8.2C1.8 8.4 4.2 5 7.6 5c1.8 0 3.1.9 4.4 2.1C13.3 5.9 14.6 5 16.4 5 19.8 5 22.2 8.4 20.5 11.8 18.5 15.8 12 20 12 20z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (/partner/i.test(label)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="8" cy="9" r="2.5" stroke={stroke} strokeWidth="1.6" />
        <circle cx="16" cy="9" r="2.5" stroke={stroke} strokeWidth="1.6" />
        <path d="M4 18c0-2.2 1.8-4 4-4M20 18c0-2.2-1.8-4-4-4M10 18c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (/complaint|unhappy|open/i.test(label)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 8v5M12 16.5h.01" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="8.5" stroke={stroke} strokeWidth="1.6" />
      </svg>
    );
  }
  if (/pass|growth|index|volume|new tag/i.test(label)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 16l4-5 4 3 5-7 3 4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="3" stroke={stroke} strokeWidth="1.6" />
      <path d="M9 12h6M12 9v6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DrillOpsKpiCard({
  prefix,
  title,
  fullLabel,
  value,
  delta,
  deltaTone,
  tone,
  color,
}) {
  const badge = kpiBadgeForTone(deltaTone);
  const compare = kpiCompareLabel(delta);
  const arrow = deltaTone === 'up' ? '↑' : deltaTone === 'down' ? '↓' : '→';

  return (
    <div className={`${prefix}-ops-kpi ${prefix}-ops-kpi--${tone}`}>
      <span className={`${prefix}-ops-kpi-accent`} aria-hidden />
      <div className={`${prefix}-ops-kpi-head`}>
        <span className={`${prefix}-ops-kpi-title`} title={fullLabel ?? title}>
          {title}
        </span>
        <span className={`${prefix}-ops-kpi-badge ${prefix}-ops-kpi-badge--${deltaTone}`}>
          <span className={`${prefix}-ops-kpi-badge-dot`} aria-hidden />
          {badge}
        </span>
      </div>
      <div className={`${prefix}-ops-kpi-body`}>
        <span className={`${prefix}-ops-kpi-icon-wrap`} style={{ color, borderColor: `${color}22` }}>
          <KpiIcon label={fullLabel ?? title} color={color} />
        </span>
        <div className={`${prefix}-ops-kpi-data`}>
          <span className={`${prefix}-ops-kpi-value`} style={{ color }}>
            {value}
          </span>
          <div className={`${prefix}-ops-kpi-foot`}>
            <span className={`${prefix}-ops-kpi-delta ${prefix}-ops-kpi-delta--${deltaTone}`}>
              {arrow} {delta}
            </span>
            <span className={`${prefix}-ops-kpi-sep`} aria-hidden>
              |
            </span>
            <span className={`${prefix}-ops-kpi-compare`}>{compare}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DrillOpsKpiGrid({ prefix, kpis, shortLabel = (l) => l }) {
  return (
    <div className={`${prefix}-hero-kpis`}>
      {kpis.map((k) => {
        const deltaTone = heroKpiDeltaTone(k.d);
        return (
          <DrillOpsKpiCard
            key={k.label}
            prefix={prefix}
            title={shortLabel(k.label)}
            fullLabel={k.label}
            value={k.v}
            delta={k.d}
            deltaTone={deltaTone}
            tone={k.tone}
            color={k.color}
          />
        );
      })}
    </div>
  );
}

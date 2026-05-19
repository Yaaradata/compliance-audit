export type Band = 'red' | 'amber' | 'green' | 'grey' | 'neutral';
export type Trend = 'improving' | 'stable' | 'deteriorating' | 'rapidly_deteriorating';

export const bandFromScore = (score: number | null | undefined, thresholds?: { green?: number; amber?: number }): Band => {
  if (score == null || Number.isNaN(score)) return 'grey';
  const green = thresholds?.green ?? 80;
  const amber = thresholds?.amber ?? 60;
  if (score >= green) return 'green';
  if (score >= amber) return 'amber';
  return 'red';
};

export const bandBg = (band: string) =>
  ({
    red: 'bg-rose-50 border-rose-300 text-rose-900',
    amber: 'bg-amber-50 border-amber-300 text-amber-900',
    green: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    grey: 'bg-slate-100 border-slate-300 text-slate-700',
    neutral: 'bg-slate-50 border-slate-300 text-slate-700',
  }[band] || 'bg-slate-50 border-slate-300 text-slate-700');

export const bandDot = (band: string) =>
  ({
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
    grey: 'bg-slate-400',
    neutral: 'bg-slate-400',
  }[band] || 'bg-slate-400');

export const bandText = (band: string) =>
  ({
    red: 'text-rose-700',
    amber: 'text-amber-700',
    green: 'text-emerald-700',
    grey: 'text-slate-600',
    neutral: 'text-slate-600',
  }[band] || 'text-slate-600');

export const bandBar = (band: string) =>
  ({
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
    grey: 'bg-slate-400',
    neutral: 'bg-slate-400',
  }[band] || 'bg-slate-400');

export const bandRing = (band: string) =>
  ({
    red: '#e11d48',
    amber: '#d97706',
    green: '#059669',
    grey: '#94a3b8',
    neutral: '#64748b',
  }[band] || '#64748b');

export const trendArrow = (trend: string) =>
  ({
    improving: '↑',
    stable: '→',
    deteriorating: '↓',
    rapidly_deteriorating: '↓',
  }[trend] || '→');

export const trendTone = (trend: string) =>
  ({
    improving: 'text-emerald-600',
    stable: 'text-slate-500',
    deteriorating: 'text-amber-600',
    rapidly_deteriorating: 'text-rose-600',
  }[trend] || 'text-slate-500');

export const severityBadge = (s: string) =>
  ({
    critical: 'bg-red-50 text-red-600 border border-red-200',
    high: 'bg-red-50 text-red-600 border border-red-200',
    medium: 'bg-amber-50 text-amber-600 border border-amber-200',
    low: 'bg-green-50 text-green-600 border border-green-200',
  }[s] || 'bg-slate-100 text-slate-700 border border-slate-300');

// Five-label outcome distinction per Pass 4 §5.2
export const outcomeBadge = (outcome: string) =>
  ({
    Pass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    Fail: 'bg-rose-100 text-rose-800 border border-rose-300',
    DataGap: 'bg-slate-200 text-slate-700 border border-slate-400',
    EvidenceGap: 'bg-violet-100 text-violet-800 border border-violet-300',
    NeedsReview: 'bg-sky-100 text-sky-800 border border-sky-300',
    NA: 'bg-slate-100 text-slate-600 border border-slate-200',
  }[outcome] || 'bg-slate-100 text-slate-600 border border-slate-200');

export const evidenceStatusBadge = (status: string) =>
  ({
    Complete: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    Partial: 'bg-amber-100 text-amber-800 border border-amber-300',
    Missing: 'bg-rose-100 text-rose-800 border border-rose-300',
    Late: 'bg-amber-100 text-amber-800 border border-amber-300',
    InvalidHash: 'bg-rose-100 text-rose-800 border border-rose-300',
    Orphaned: 'bg-violet-100 text-violet-800 border border-violet-300',
    BpoPending: 'bg-sky-100 text-sky-800 border border-sky-300',
    NotApplicable: 'bg-slate-100 text-slate-600 border border-slate-200',
  }[status] || 'bg-slate-100 text-slate-600 border border-slate-200');

export const correlationStatusBadge = (status: string) =>
  ({
    matched: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    matched_with_warning: 'bg-amber-100 text-amber-800 border border-amber-300',
    late_arriving: 'bg-amber-100 text-amber-800 border border-amber-300',
    needs_review: 'bg-sky-100 text-sky-800 border border-sky-300',
    timestamp_reversal: 'bg-rose-100 text-rose-800 border border-rose-300',
    schema_mismatch: 'bg-rose-100 text-rose-800 border border-rose-300',
    orphan: 'bg-violet-100 text-violet-800 border border-violet-300',
  }[status] || 'bg-slate-100 text-slate-600 border border-slate-200');

export const hitlBadge = (status: string) =>
  ({
    pending: 'bg-amber-100 text-amber-800 border border-amber-300',
    accepted: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    rejected: 'bg-rose-100 text-rose-800 border border-rose-300',
    escalated: 'bg-violet-100 text-violet-800 border border-violet-300',
    overridden: 'bg-sky-100 text-sky-800 border border-sky-300',
  }[status] || 'bg-slate-100 text-slate-600 border border-slate-200');

// Persona theme colours — three primary personas per UI Pass 1
export const personaAccent = (code: string) =>
  ({
    cro: 'from-indigo-600 to-indigo-800',
    compliance: 'from-violet-600 to-violet-800',
    audit: 'from-emerald-600 to-emerald-800',
  }[code] || 'from-slate-600 to-slate-800');

/** WCAG-friendly focus ring for ORI interactive controls */
export const oriFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2';

/** Clickable card / tile hover (shadow + border) */
export const oriCardHover =
  'transition-[box-shadow,border-color] duration-150 ease-out border border-slate-200 hover:border-indigo-200 hover:shadow-md';

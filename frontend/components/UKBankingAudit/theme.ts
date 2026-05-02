export type Band = 'red' | 'amber' | 'green' | 'neutral';
export type Trend = 'improving' | 'stable' | 'worsening' | 'rapidly_worsening';

export const bandBg = (band: string) =>
  ({
    red: 'bg-rose-50 border-rose-300 text-rose-900',
    amber: 'bg-amber-50 border-amber-300 text-amber-900',
    green: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    neutral: 'bg-slate-50 border-slate-300 text-slate-700',
  }[band] || 'bg-slate-50 border-slate-300 text-slate-700');

export const bandDot = (band: string) =>
  ({
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
    neutral: 'bg-slate-400',
  }[band] || 'bg-slate-400');

export const bandText = (band: string) =>
  ({
    red: 'text-rose-700',
    amber: 'text-amber-700',
    green: 'text-emerald-700',
    neutral: 'text-slate-600',
  }[band] || 'text-slate-600');

export const bandBar = (band: string) =>
  ({
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
    neutral: 'bg-slate-400',
  }[band] || 'bg-slate-400');

export const trendArrow = (trend: string) =>
  ({
    improving: '↘',
    stable: '→',
    worsening: '↗',
    rapidly_worsening: '⇗',
  }[trend] || '→');

export const trendTone = (trend: string) =>
  ({
    improving: 'text-emerald-600',
    stable: 'text-slate-500',
    worsening: 'text-amber-600',
    rapidly_worsening: 'text-rose-600',
  }[trend] || 'text-slate-500');

export const severityBadge = (s: string) =>
  ({
    critical: 'bg-rose-100 text-rose-800 border border-rose-300',
    high: 'bg-rose-100 text-rose-800 border border-rose-300',
    medium: 'bg-amber-100 text-amber-800 border border-amber-300',
    low: 'bg-slate-100 text-slate-700 border border-slate-300',
  }[s] || 'bg-slate-100 text-slate-700 border border-slate-300');

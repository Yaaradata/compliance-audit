import type { WcwSignalBadgeType } from './buildWcwAiSignalsColumn';

export const SIGNAL_BADGE_STYLES: Record<
  WcwSignalBadgeType,
  { border: string; tint: string; badgeBg: string; badgeText: string; escalateBg: string; escalateText: string; escalateBorder: string }
> = {
  ACCOUNTABILITY: {
    border: '#7C3AED',
    tint: 'rgba(124, 58, 237, 0.04)',
    badgeBg: '#EDE9FE',
    badgeText: '#5B21B6',
    escalateBg: 'rgba(124, 58, 237, 0.12)',
    escalateText: '#7C3AED',
    escalateBorder: 'rgba(124, 58, 237, 0.3)',
  },
  REGULATORY: {
    border: '#D97706',
    tint: 'rgba(217, 119, 6, 0.04)',
    badgeBg: '#FFEDD5',
    badgeText: '#9A3412',
    escalateBg: 'rgba(217, 119, 6, 0.12)',
    escalateText: '#D97706',
    escalateBorder: 'rgba(217, 119, 6, 0.3)',
  },
  FRAUD: {
    border: '#DC2626',
    tint: 'rgba(220, 38, 38, 0.04)',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B',
    escalateBg: 'rgba(220, 38, 38, 0.12)',
    escalateText: '#DC2626',
    escalateBorder: 'rgba(220, 38, 38, 0.3)',
  },
  ANOMALY: {
    border: '#0EA5E9',
    tint: 'rgba(14, 165, 233, 0.04)',
    badgeBg: '#E0F2FE',
    badgeText: '#075985',
    escalateBg: 'rgba(14, 165, 233, 0.12)',
    escalateText: '#0EA5E9',
    escalateBorder: 'rgba(14, 165, 233, 0.3)',
  },
};

export type KriBand = 'red' | 'amber' | 'green';

export const KRI_C = {
  red: { fg: '#DC2626', bg: '#FEF2F2', border: '#FECACA', solid: '#EF4444', glow: 'rgba(239,68,68,0.10)' },
  amber: { fg: '#D97706', bg: '#FFFBEB', border: '#FDE68A', solid: '#F59E0B', glow: 'rgba(245,158,11,0.10)' },
  green: { fg: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', solid: '#22C55E', glow: 'rgba(34,197,94,0.10)' },
  gray: { fg: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', solid: '#9CA3AF', glow: 'rgba(156,163,175,0.10)' },
} as const;

export const KRI_BAND_TOKEN: Record<KriBand, (typeof KRI_C)[KriBand]> = {
  red: KRI_C.red,
  amber: KRI_C.amber,
  green: KRI_C.green,
};

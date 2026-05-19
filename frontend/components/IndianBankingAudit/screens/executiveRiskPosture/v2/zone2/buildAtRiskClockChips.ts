import { reportingClocks, type ReportingClock } from '../../../../dataModel';

/** Demo days-to-deadline for at-risk regulatory clocks (PASS 4). */
const AT_RISK_CLOCK_DAYS: Record<string, number> = {
  'RC-CTR': 5,
  'RC-STR-7BD': 9,
};

function clockChipTone(daysRemaining: number): 'rose' | 'amber' | 'emerald' {
  if (daysRemaining <= 7) return 'rose';
  if (daysRemaining <= 14) return 'amber';
  return 'emerald';
}

const CHIP_BORDER: Record<'rose' | 'amber' | 'emerald', string> = {
  rose: 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]',
  amber: 'border-[#D97706] bg-[#FFFBEB] text-[#D97706]',
  emerald: 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]',
};

function formatDeadlineRule(spec: string): string {
  const map: Record<string, string> = {
    monthly_15th: 'By 15th of next month',
    rolling_7BD: '≤ 7 working days',
    rolling_6h: '≤ 6 hours',
    rolling_14d: '≤ 14 days',
    daily: 'Daily',
    quarterly: 'Quarterly',
    monthly: 'Monthly',
  };
  return map[spec] ?? spec.replace(/_/g, ' ');
}

function clockShortName(clockId: string): string {
  if (clockId === 'RC-CTR') return 'CTR';
  if (clockId === 'RC-STR-7BD') return 'STR';
  return clockId;
}

export type AtRiskClockChip = {
  clock: ReportingClock;
  daysRemaining: number;
  tone: 'rose' | 'amber' | 'emerald';
  chipClass: string;
  label: string;
};

/** At-risk reporting clocks for ticker + zone-2 chips. */
export function buildAtRiskClockChips(): AtRiskClockChip[] {
  return reportingClocks
    .filter((c) => c.current_status === 'at_risk')
    .map((clock) => {
      const daysRemaining = AT_RISK_CLOCK_DAYS[clock.clock_id] ?? 10;
      const tone = clockChipTone(daysRemaining);
      const shortName = clockShortName(clock.clock_id);
      return {
        clock,
        daysRemaining,
        tone,
        chipClass: CHIP_BORDER[tone],
        label: `${shortName} · ${formatDeadlineRule(clock.deadline_spec)} · ${daysRemaining}d remaining`,
      };
    });
}

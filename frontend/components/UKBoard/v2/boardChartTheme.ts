/**
 * UK Board v2 — chart palette. One place for every chart colour so the meaning is the same on every
 * tab: blue is the measure (demand), teal the comparison (capacity, plan, target), amber and red the
 * trigger and the limit, status colours only where a point or bar carries a status.
 */
import type { MeasureStatus } from "@/lib/ukboard/v2/boardStore";

export const CHART = {
  measure: "#1E40AF",
  comparison: "#0F766E",
  gapFill: "#FCD34D",
  gapOpacity: 0.35,
  amber: "#D97706",
  limit: "#B91C1C",
  zoneOpacity: 0.08,
  grid: "#E2E8F0",
  axis: "#64748B",
  tick: "#475569",
  zoneGrey: "#E2E8F0",
  zoneGreyDark: "#CBD5E1",
  lineWidth: 2,
  sparkWidth: 1.5,
} as const;

export const STATUS_INK: Record<MeasureStatus, string> = {
  within: "#15803D",
  projected: "#B45309",
  amber: "#B45309",
  red: "#B91C1C",
  unconfirmed: "#475569",
};

/** Categorical order, used the same way everywhere (never status colours on categories). */
export const CATEGORICAL = ["#4F46E5", "#0D9488", "#0EA5E9", "#64748B"] as const;
export const categorical = (i: number) => CATEGORICAL[i % CATEGORICAL.length];

export const TRADEOFF = { current: "#64748B", recommended: "#4F46E5", other: "#0D9488", zone: "#16A34A", zoneOpacity: 0.1 } as const;

export const TIMELINE = { regulatory: "#4F46E5", board: "#0D9488", today: "#2563EB" } as const;

/** Attestation heatmap cells. */
export const HEAT = { onTime: "#BBF7D0", late: "#FDE68A", early: "#FECACA" } as const;

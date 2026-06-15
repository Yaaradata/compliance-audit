/**
 * Display formatting for Keystone. Presentation only — no domain derivation
 * lives here (those are in derivations.ts). All numbers render with grouping so
 * rupee columns can align under tabular-nums.
 */
import type { Money, Range } from "./types";

const RUPEE = "Rs";

/** Compact rupee figure: Rs 64.8bn, Rs 3.2M, Rs 0. */
export function formatRupeesCompact(money: Money): string {
  return `${RUPEE} ${compact(money.amount)}`;
}

/** Compact rupee from a raw amount. */
export function formatAmountCompact(amount: number): string {
  return `${RUPEE} ${compact(amount)}`;
}

/** Full grouped rupee figure: Rs 3,200,000. */
export function formatRupeesFull(money: Money): string {
  return `${RUPEE} ${group(money.amount)}`;
}

/** Compact rupee band: Rs 160M – Rs 650M. */
export function formatRupeeRange(range: Range): string {
  return `${RUPEE} ${compact(range.low)} – ${RUPEE} ${compact(range.high)}`;
}

/** Plain numeric range with grouping: 2,000,000 – 2,400,000. */
export function formatNumberRange(range: Range): string {
  return `${group(range.low)} – ${group(range.high)}`;
}

/** Grouped integer: 11,900. */
export function formatNumber(n: number): string {
  return group(n);
}

function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return trim(n / 1_000_000_000) + "bn";
  if (abs >= 1_000_000) return trim(n / 1_000_000) + "M";
  if (abs >= 1_000) return trim(n / 1_000) + "K";
  return group(n);
}

function trim(n: number): string {
  return Number(n.toFixed(1)).toString();
}

function group(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

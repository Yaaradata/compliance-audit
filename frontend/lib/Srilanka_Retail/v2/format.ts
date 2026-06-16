export {
  formatAmountCompact,
  formatNumber,
  formatNumberRange,
  formatRupeesCompact,
  formatRupeesFull,
  formatRupeeRange,
} from "../format";

/** Alias used by risk-matrix KRIs seeded as pre-formatted strings. */
export function fmtRs(amt: number | null | undefined): string {
  if (amt == null) return "—";
  const abs = Math.abs(amt);
  if (abs >= 1e9) return `Rs ${(amt / 1e9).toFixed(2).replace(/\.00$/, "")}bn`;
  if (abs >= 1e6) return `Rs ${(amt / 1e6).toFixed(amt % 1e6 ? 1 : 0)}M`;
  return `Rs ${amt.toLocaleString("en-US")}`;
}

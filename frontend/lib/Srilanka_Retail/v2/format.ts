/**
 * Display formatting for the Lion Brewery V2 platform.
 * Every rupee figure routes through formatLKR / formatLKRCompact.
 */

/** Full grouped rupee figure: "Rs 5,410,000,000". */
export function formatLKR(amount: number): string {
  return `Rs ${new Intl.NumberFormat("en-US").format(Math.round(amount))}`;
}

/** Compact rupee figure: "Rs 5.41 bn", "Rs 2.34 M", "Rs 0.9 M". */
export function formatLKRCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) return `Rs ${trim(amount / 1_000_000_000)} bn`;
  if (abs >= 1_000_000) return `Rs ${trim(amount / 1_000_000)} M`;
  if (abs >= 1_000) return `Rs ${trim(amount / 1_000)} K`;
  return `Rs ${new Intl.NumberFormat("en-US").format(amount)}`;
}

/** Grouped integer: "76,800". */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Signed integer with grouping: "-1,200" / "+129". */
export function formatSigned(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("en-US").format(n)}`;
}

/** Percentage from a 0–1 fraction: "99.7%". */
export function formatPct(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Short date "12 Jun 2026" from ISO. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Date + time "12 Jun 09:42" from ISO. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} ${d.toLocaleTimeString(
    "en-GB",
    { hour: "2-digit", minute: "2-digit", hour12: false },
  )}`;
}

function trim(n: number): string {
  return Number(n.toFixed(2)).toString();
}

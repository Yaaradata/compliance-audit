export function fmtRs(amt: number | null | undefined): string {
  if (amt == null) return "—";
  if (Math.abs(amt) >= 1e9) return `Rs ${(amt / 1e9).toFixed(2).replace(/\.00$/, "")}bn`;
  if (Math.abs(amt) >= 1e6) return `Rs ${(amt / 1e6).toFixed(amt % 1e6 ? 1 : 0)}M`;
  return `Rs ${amt.toLocaleString("en-US")}`;
}

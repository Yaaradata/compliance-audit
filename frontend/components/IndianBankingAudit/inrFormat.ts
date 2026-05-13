/** Display INR for loss / incident amounts (Indian grouping / L / Cr). */

const LAKH = 100000;
const CRORE = 10000000;

export function formatInrLossDisplay(inr: number | null | undefined): string {
  if (inr == null || Number.isNaN(inr)) return '—';
  const n = Math.round(Math.abs(inr));
  if (n >= CRORE) {
    return `₹${(n / CRORE).toFixed(2)} Cr`;
  }
  if (n >= LAKH) {
    return `₹${(n / LAKH).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

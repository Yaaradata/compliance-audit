/** Relative age for issue cards — no ISO dates in UI. */
export function formatRelativeAgeFromDays(days: number): string {
  if (days < 0) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 90) {
    const weeks = Math.floor(days / 7);
    return weeks <= 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  const months = Math.floor(days / 30);
  return months <= 1 ? '1 month ago' : `${months} months ago`;
}

export function formatRelativeAgeFromIso(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`).getTime();
  if (Number.isNaN(t)) return '—';
  const days = Math.max(0, Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000)));
  return formatRelativeAgeFromDays(days);
}

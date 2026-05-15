import type { SyncSourceState, SyncSourceStatus } from '@/lib/IndianBankingAudit/regIntelMockData';

/**
 * V2 Pass 5 — relative time labels for sync strip.
 */
export function formatRelativeTime(iso: string, nowMs: number = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const sec = Math.max(0, Math.floor((nowMs - t) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatLastFullSyncIst(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

export function maxSyncedIso(rows: Pick<SyncSourceState, 'last_synced_at'>[]): string {
  if (!rows.length) return new Date().toISOString();
  return rows.reduce((best, r) => {
    const t = new Date(r.last_synced_at).getTime();
    const b = new Date(best).getTime();
    return Number.isNaN(t) ? best : t >= b ? r.last_synced_at : best;
  }, rows[0].last_synced_at);
}

/** Dot colour rules: &lt;2h fresh, else stale up to multi-day; `error` from row only; `syncing` when global run. */
export function effectiveSyncDisplay(s: SyncSourceState, isGlobalSyncing: boolean): SyncSourceStatus {
  if (isGlobalSyncing) return 'syncing';
  if (s.status === 'error') return 'error';
  const ms = Date.now() - new Date(s.last_synced_at).getTime();
  if (Number.isNaN(ms) || ms < 0) return 'fresh';
  const hours = ms / 3600000;
  if (hours < 2) return 'fresh';
  return 'stale';
}

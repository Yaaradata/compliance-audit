import type { RegAlertRecord } from '@/lib/IndianBankingAudit/regIntelMockData';

/** Stripe / chrome colour for a regulator row (V2 Pass 3). Peer signals use `PEER` regardless of `source`. */
export type RegIntelStripeSource = RegAlertRecord['source'] | 'PEER';

export function getSourceColor(source: RegIntelStripeSource): string {
  switch (source) {
    case 'RBI':
      return '#1F4E79';
    case 'FIU-IND':
      return '#7B2D8B';
    case 'CERT-IN':
      return '#C0392B';
    case 'MOF':
      return '#2C7A2C';
    case 'SEBI':
      return '#E8700A';
    case 'NPCI':
      return '#006FB4';
    case 'IBA':
      return '#5D5D5D';
    case 'PEER':
      return '#B7580A';
    default:
      return '#64748b';
  }
}

export function getAlertStripeColor(alert: RegAlertRecord): string {
  return alert.is_peer_signal ? getSourceColor('PEER') : getSourceColor(alert.source);
}

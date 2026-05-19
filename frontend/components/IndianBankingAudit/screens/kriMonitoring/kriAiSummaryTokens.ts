/** Domain → wall category badge (cockpit AI Summary Wall pattern). */
export function kriDomainCategory(riskCode: string, domain: string): string {
  const code = riskCode.toUpperCase();
  if (code.includes('FC')) return 'AML';
  if (code.includes('FR')) return 'FRAUD';
  if (code.includes('CD') || code.includes('CO')) return 'REGULATORY';
  if (code.includes('TC')) return 'CYBER';
  if (code.includes('OP')) return 'OPERATIONAL';
  if (code.includes('CR')) return 'CREDIT';
  if (code.includes('TP')) return 'THIRD PARTY';
  if (code.includes('MR')) return 'MODEL RISK';
  if (domain.toLowerCase().includes('fraud')) return 'FRAUD';
  if (domain.toLowerCase().includes('cyber')) return 'CYBER';
  return 'REGULATORY';
}

export function kriCategoryBadgeStyles(category: string): { badgeClass: string; borderClass: string } {
  const c = category.toUpperCase();
  if (c === 'FRAUD' || c === 'AML') {
    return { badgeClass: 'bg-red-100 text-red-800', borderClass: 'border-l-red-500' };
  }
  if (c === 'REGULATORY' || c === 'CONDUCT') {
    return { badgeClass: 'bg-amber-100 text-amber-800', borderClass: 'border-l-amber-500' };
  }
  if (c === 'CYBER' || c === 'MODEL RISK') {
    return { badgeClass: 'bg-violet-100 text-violet-800', borderClass: 'border-l-violet-500' };
  }
  if (c === 'OPERATIONAL' || c === 'CREDIT' || c === 'THIRD PARTY') {
    return { badgeClass: 'bg-slate-100 text-slate-800', borderClass: 'border-l-slate-500' };
  }
  return { badgeClass: 'bg-violet-100 text-violet-800', borderClass: 'border-l-violet-500' };
}

export function kriConfidencePct(band: 'red' | 'amber' | 'green', trend: 'up' | 'down' | 'flat'): number {
  if (band === 'red') return trend === 'up' ? 94 : 91;
  if (band === 'amber') return trend === 'up' ? 86 : 82;
  return 76;
}

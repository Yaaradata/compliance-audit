import type { ProcessAuditDomainId } from '@/lib/Indian_Process_Audit/types';

/** Maps IPA domain tab ids to risk-command-center dataset ids. */
export const IPA_TO_RCC_DOMAIN_ID: Record<ProcessAuditDomainId, string> = {
  customer: 'customer-kyc',
  loan: 'credit-loans',
  transaction: 'transactions',
  risk: 'aml',
  itchange: 'it-change',
  infra: 'infra-cyber',
  data: 'data-gov',
  finance: 'fin-reporting',
  ops: 'ops-3p',
};

export const RCC_JOURNEY_DOMAIN_IDS = Object.keys(IPA_TO_RCC_DOMAIN_ID) as ProcessAuditDomainId[];

const rccToIpa = new Map(
  Object.entries(IPA_TO_RCC_DOMAIN_ID).map(([ipa, rcc]) => [rcc, ipa as ProcessAuditDomainId]),
);

export function getIpaIdFromRccDomainId(rccId: string): ProcessAuditDomainId | undefined {
  return rccToIpa.get(rccId);
}

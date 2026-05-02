/**
 * UK Banking Audit prototype uses Pass 4.1 demo data from `MockDatav1.txt`.
 * Source of truth in repo: `frontend/app/UKBankingAudit/MockDatav1.txt`
 * Bundled module (truncated tail repaired + metrics/coverage gaps added): `@/lib/ukbankingaudit/mockDataV1`
 */
import UKBankingControlTrace from '@/components/UKBankingAudit/UKBankingControlTrace';

export default function UKBankingAuditPage() {
  return <UKBankingControlTrace />;
}
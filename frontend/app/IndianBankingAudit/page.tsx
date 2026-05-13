/**
 * IndianBankingAudit — AI-driven Risk · Compliance · Audit prototype
 *
 * Sources:
 *  - Mock data: `@/lib/IndianBankingAudit/mockIndianBankingAuditData.js`
 *  - Component architecture: `@/components/IndianBankingAudit/*`
 *  - UX blueprint: `ref-docs/Indian Banking/UIPass4 - UX Blueprint.md`
 *
 * Research hand-off (not routed): `IndianBankingAuditStandalone.jsx` (bundled UI) +
 * `IndianBankingAuditPrototype.data.js` (mock mirror of `lib/IndianBankingAudit/mockIndianBankingAuditData.js`).
 *
 * Scope: Wave-1 MVP (KYC · AML · Digital Lending) for a mid-sized
 * Indian private sector bank. India-only RBI / PMLA / FIU-IND grounding.
 */
import IndianBankingAuditApp from '@/components/IndianBankingAudit/IndianBankingAuditApp';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indian Banking Audit',
};

export default function IndianBankingAuditPage() {
  return <IndianBankingAuditApp />;
}

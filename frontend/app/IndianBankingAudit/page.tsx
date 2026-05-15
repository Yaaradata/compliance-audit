/**
 * Route: `/IndianBankingAudit`
 *
 * UI: `@/components/IndianBankingAudit/IndianBankingAuditApp`
 * Deep links: `?screen=<ScreenCode>` and optional `?persona=cro|compliance|audit`
 * (parsed in `IndianBankingAuditClient` — e.g. `?screen=regulatoryIntelligence`).
 *
 * Nested ORI routes (same segment): `/IndianBankingAudit/regulatory-intelligence`,
 * `/IndianBankingAudit/obligation-coverage`, `/IndianBankingAudit/control-testing`, etc.
 * See `ORI_ROUTES` in `screens/regIntel/regIntelPaths.ts`.
 */
import IndianBankingAuditApp from '@/components/IndianBankingAudit/IndianBankingAuditApp';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import IndianBankingAuditClient from './IndianBankingAuditClient';

export const metadata: Metadata = {
  title: 'Indian Banking Audit',
};

export default function IndianBankingAuditPage() {
  return (
    <Suspense fallback={<IndianBankingAuditApp />}>
      <IndianBankingAuditClient />
    </Suspense>
  );
}

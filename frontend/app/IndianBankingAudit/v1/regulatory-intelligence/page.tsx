'use client';

import IndianBankingAuditApp from '@/components/IndianBankingAudit/IndianBankingAuditApp';

/** ORI Regulatory Intelligence Inbox — compliance persona, Reg Intelligence screen. */
export default function RegulatoryIntelligencePage() {
  return <IndianBankingAuditApp initialPersona="compliance" initialScreen="regulatoryIntelligence" />;
}

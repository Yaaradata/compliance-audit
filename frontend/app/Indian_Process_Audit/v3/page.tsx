/**
 * Route: `/Indian_Process_Audit/v3`
 *
 * UI: `@/components/Indian_Process_Audit/ProcessAuditDashboard`
 * Data: `@/lib/Indian_Process_Audit` via `getProcessAuditData()`
 * V3 is the default (latest) version — Fast-Tag and journey UX live under `v3/Fast-Tag/`.
 */
import ProcessAuditDashboard from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indian Process Audit',
};

export default function IndianProcessAuditV3Page() {
  return <ProcessAuditDashboard />;
}

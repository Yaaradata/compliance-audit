/**
 * Route: `/Indian_Process_Audit/v2`
 *
 * UI: `@/components/Indian_Process_Audit/ProcessAuditDashboard`
 * Data: `@/lib/Indian_Process_Audit` via `getProcessAuditData()`
 * V2 is frozen for comparison; use `/Indian_Process_Audit/v3` for new work.
 */
import ProcessAuditDashboard from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indian Process Audit',
};

export default function IndianProcessAuditV2Page() {
  return <ProcessAuditDashboard />;
}

/**
 * Route: `/Indian_Process_Audit/v1`
 *
 * UI: `@/components/Indian_Process_Audit/ProcessAuditDashboard`
 * Data: `@/lib/Indian_Process_Audit` via `getProcessAuditData()`
 * V1 and V2 share the same dashboard for now; iterate on V2 only.
 */
import ProcessAuditDashboard from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indian Process Audit',
};

export default function IndianProcessAuditV1Page() {
  return <ProcessAuditDashboard />;
}

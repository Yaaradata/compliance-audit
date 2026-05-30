/**
 * Route: `/Indian_Process_Audit/v1`
 *
 * UI: `@/components/Indian_Process_Audit/ProcessAuditDashboard`
 * Data: `@/lib/Indian_Process_Audit` via `getProcessAuditData()`
 * Shares ProcessAuditDashboard with V2; V1 keeps classic Process flow KPIs and Journey matrix.
 * V2-only features (slice heatmap journey, Fast-Tag tab, hero KPIs) are gated by IpaVersionProvider.
 */
import ProcessAuditDashboard from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indian Process Audit',
};

export default function IndianProcessAuditV1Page() {
  return <ProcessAuditDashboard />;
}

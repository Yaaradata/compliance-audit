import { redirect } from 'next/navigation';

/** Legacy route — use `/Indian_Process_Audit` (defaults to v2). */
export default function InternalAuditLegacyRedirect() {
  redirect('/Indian_Process_Audit/v2');
}

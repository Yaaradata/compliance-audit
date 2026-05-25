import { ProcessAuditAppLayout, processAuditAppMetadata } from '../_shared/ProcessAuditAppLayout';

export const metadata = processAuditAppMetadata;

export default function IndianProcessAuditV1Layout({ children }: { children: React.ReactNode }) {
  return <ProcessAuditAppLayout version="v1">{children}</ProcessAuditAppLayout>;
}

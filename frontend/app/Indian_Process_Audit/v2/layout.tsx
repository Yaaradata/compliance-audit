import { ProcessAuditAppLayout, processAuditAppMetadata } from '../_shared/ProcessAuditAppLayout';

export const metadata = processAuditAppMetadata;

export default function IndianProcessAuditV2Layout({ children }: { children: React.ReactNode }) {
  return <ProcessAuditAppLayout version="v2">{children}</ProcessAuditAppLayout>;
}

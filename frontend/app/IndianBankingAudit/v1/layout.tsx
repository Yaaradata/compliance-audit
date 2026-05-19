import { OriAppLayout, oriAppMetadata } from '../_shared/OriAppLayout';

export const metadata = oriAppMetadata;

export default function IndianBankingAuditV1Layout({ children }: { children: React.ReactNode }) {
  return <OriAppLayout version="v1">{children}</OriAppLayout>;
}

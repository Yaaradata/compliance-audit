import { OriAppLayout, oriAppMetadata } from '../_shared/OriAppLayout';

export const metadata = oriAppMetadata;

export default function IndianBankingAuditV2Layout({ children }: { children: React.ReactNode }) {
  return <OriAppLayout version="v2">{children}</OriAppLayout>;
}

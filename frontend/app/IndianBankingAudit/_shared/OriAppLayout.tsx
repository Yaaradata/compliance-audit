import type { Metadata } from 'next';
import { OriVersionProvider } from '@/components/IndianBankingAudit/ori/OriVersionProvider';
import type { OriVersion } from '@/components/IndianBankingAudit/ori/oriVersion';

export const oriAppMetadata: Metadata = {
  title: {
    template: '%s | Indian Banking Audit',
    default: 'Indian Banking Audit',
  },
  description: 'ORI — Operational Risk Intelligence for Indian private-sector banking',
};

export function OriAppLayout({ version, children }: { version: OriVersion; children: React.ReactNode }) {
  return <OriVersionProvider version={version}>{children}</OriVersionProvider>;
}

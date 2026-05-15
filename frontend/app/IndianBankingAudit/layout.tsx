import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Indian Banking Audit',
    default: 'Indian Banking Audit',
  },
  description: 'ORI — Operational Risk Intelligence for Indian private-sector banking',
};

export default function IndianBankingAuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}

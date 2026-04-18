'use client';

import Dashboard from './BankingAuditDashboard (1).jsx';

export type LoanCustomer = {
  id: string;
  name: string;
  date: string;
  kyc: 'pass' | 'fail';
  docs: 'pass' | 'fail';
  score: number;
  eligibility: 'pass' | 'fail';
  approval: 'pass' | 'rej';
  exception: string;
  sanction: 'pass' | '-';
  disb: 'pass' | 'fail' | '-';
  status: 'compliant' | 'critical' | 'exception';
  note: string;
};

type Props = {
  initialLoanCustomers: LoanCustomer[];
};

export default function BankingAuditDashboard(props: Props) {
  return <Dashboard {...props} />;
}

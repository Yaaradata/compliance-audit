import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import BankingAuditDashboard, { type LoanCustomer } from './BankingAuditDashboard';

type RawTransactionRow = {
  'Customer ID'?: string;
  'Customer Name'?: string;
  'Application Date'?: string;
  'KYC Status'?: string;
  'Document Status'?: string;
  'Credit Score'?: number;
  Eligibility?: string;
  Approval?: string;
  'Exception Raised'?: string;
  'Exception Approver'?: string | null;
  Sanction?: string;
  Disbursement?: string;
  'Overall Status'?: string;
  'Audit Note'?: string;
};

function mapStatusToPassFail(value?: string): 'pass' | 'fail' {
  return value?.toLowerCase() === 'verified' || value?.toLowerCase() === 'complete' ? 'pass' : 'fail';
}

function mapToDashboardRows(rows: RawTransactionRow[]): LoanCustomer[] {
  return rows.map((row): LoanCustomer => ({
    id: row['Customer ID'] ?? '-',
    name: row['Customer Name'] ?? '-',
    date: row['Application Date'] ?? '-',
    kyc: mapStatusToPassFail(row['KYC Status']),
    docs: mapStatusToPassFail(row['Document Status']),
    score: Number(row['Credit Score'] ?? 0),
    eligibility: row.Eligibility?.toLowerCase() === 'pass' ? 'pass' : 'fail',
    approval: row.Approval?.toLowerCase() === 'approved' ? 'pass' : 'rej',
    exception:
      row['Exception Raised']?.toLowerCase() === 'yes'
        ? row['Exception Approver'] || 'missing'
        : '-',
    sanction: row.Sanction?.toLowerCase() === 'yes' ? 'pass' : '-',
    disb:
      row.Disbursement?.toLowerCase() === 'yes'
        ? 'pass'
        : row.Disbursement?.toLowerCase() === 'no'
          ? 'fail'
          : '-',
    status:
      row['Overall Status'] === 'Critical Violation'
        ? 'critical'
        : row['Overall Status'] === 'Approved Exception'
          ? 'exception'
          : 'compliant',
    note: row['Audit Note'] ?? '',
  }));
}

function loadExcelRows() {
  const workbookPath = path.join(
    process.cwd(),
    'app',
    'Internal_Audit',
    'Banking_Audit_Process_Controls.xlsx',
  );

  if (!fs.existsSync(workbookPath)) {
    return [];
  }

  const workbookBuffer = fs.readFileSync(workbookPath);
  const workbook = XLSX.read(workbookBuffer, { type: 'buffer' });
  const txSheet = workbook.Sheets['4. Sample Transactions'];

  if (!txSheet) {
    return [];
  }

  const txRows = XLSX.utils.sheet_to_json<RawTransactionRow>(txSheet, { defval: null });
  return mapToDashboardRows(txRows);
}

export default function InternalAuditPage() {
  const initialLoanCustomers = loadExcelRows();
  return <BankingAuditDashboard initialLoanCustomers={initialLoanCustomers} />;
}

export type AuditSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface AuditCardProps {
  onOpen?: () => void;
  domain: string;
  lead: string;
  severity: AuditSeverity;
  inScope: number;
  tested: number;
  passRate: number;
  critical: number;
  criticalDelta: number;
  overdue: number;
  overdueDelta: number;
  aiContext: string;
  aiAction: string;
}

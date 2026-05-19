import type { AIInsight } from '../../../../dataModel';
import type { AiSignalTier } from './types';

/** Tier 2 — evidence gaps, ingestion lag, disposition mismatches (one-down queue). */
function isOperationalEvidenceSignal(ins: AIInsight): boolean {
  const t = ins.title;
  if (ins.signal_class !== 'evidence_quality') return false;
  if (/partial|disposition narrative|not linked to alert/i.test(t)) return true;
  if (/marked late/i.test(t) && !/ckycr|kyc reporting|submission delay/i.test(t)) return true;
  return false;
}

/**
 * PASS 3 — strategic vs operational tiering for CRO cockpit strip.
 * Tier 1: regulatory breach, fraud network, systemic control failure, accountability gap.
 */
export function classifyAiSignalTier(ins: AIInsight): AiSignalTier {
  if (isOperationalEvidenceSignal(ins)) return 2;

  const t = ins.title.toLowerCase();
  const cls = ins.signal_class;

  if (cls === 'accountability_gap') return 1;
  if (cls === 'drift') return 2;

  if (cls === 'anomaly') {
    if (/mule|fraud|ring|upi/.test(t)) return 1;
    if (/kfs|11,118|cluster|violation/.test(t)) return 1;
  }

  if (cls === 'coverage_gap') {
    if (/ctr|str|clock|fiu|mra|at-risk|reporting/.test(t)) return 1;
    if (/ckycr|kyc|cohort delay|re_kyc/.test(t)) return 1;
  }

  if (cls === 'effectiveness_decay') return 1;
  if (cls === 'cluster_rca') return 1;

  if (cls === 'evidence_quality' && /ckycr|kyc reporting|submission/.test(t)) return 1;

  return 2;
}

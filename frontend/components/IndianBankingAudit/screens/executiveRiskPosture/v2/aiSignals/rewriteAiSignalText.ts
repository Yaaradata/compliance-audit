import type { AIInsight } from '../../../../dataModel';

const OBJECT_ID_PATTERNS: RegExp[] = [
  /\bEV-LOG-[A-Z0-9-]+\b/gi,
  /\bEV-[A-Z]+-[A-Z0-9-]+\b/gi,
  /\bAML-ALRT-\d{4}-\d+\b/gi,
  /\bSR-[A-Z0-9-]+(?:-[A-Z0-9]+)*\b/gi,
  /\bCTRL-[A-Z0-9-]+\b/gi,
  /\bDL-APP-\d{4}-\d+\b/gi,
  /\bVEND-\d{4}-\d+\b/gi,
  /\bUCIC-\d{4}-\d+\b/gi,
  /\bCASE-\d{4}-\d+-\d+\b/gi,
  /\bAI-\d{3}\b/gi,
];

/** Curated CRO-facing rewrites (PASS 3 examples + peers). */
const CURATED_REWRITES: Record<string, string> = {
  'AII-AI-005-CKYCR': 'KYC reporting breach risk — CKYCR submission delay detected',
  'AII-AI-001-AML505': 'Organised fraud network detected — UPI mule ring, 7 nodes (Wave 2)',
  'AII-AI-003-CTR': 'CTR deadline at risk — FIU-IND acknowledgement not received for March cycle',
  'AII-AI-005-CASE502': 'Evidence linkage gap — disposition narrative not tied to alert',
  'AII-AI-002-AML-STEP04': 'STR SLA breach risk — L1 disposition backlog exceeding 7 days',
  'AII-AI-018-AML002': 'Systemic AML control decay — BPO capacity driving effectiveness drop',
  'AII-AI-016-DBT': 'KYC appetite breach risk — DBT cohort missing re-KYC schedule',
  'AII-AI-013-DL884': 'Fair lending breach risk — KFS issued after borrower acceptance',
  'AII-AI-010-DSA': 'Systemic conduct failure — mass KFS timing breach on DSA channel',
  'AII-AI-009-VND205': 'Outsourcing breach risk — undisclosed fourth-party on material vendor',
  'AII-AI-019-MLRO': 'Executive accountability gap — MLRO attestation overdue on STR clock',
  'AII-AI-018-LND002': 'Control effectiveness masked — headline CES diverges from operating rate',
};

function stripObjectIds(text: string): string {
  let out = text;
  for (const re of OBJECT_ID_PATTERNS) {
    out = out.replace(re, '').replace(/\s{2,}/g, ' ').trim();
  }
  return out.replace(/\s+—\s+—/g, ' — ').replace(/^\s*—\s*/, '').trim();
}

function heuristicRewrite(title: string): string {
  const t = stripObjectIds(title);
  const lower = t.toLowerCase();

  if (/mule|upi.*ring|fraud network/.test(lower)) {
    return 'Organised fraud network detected — UPI mule activity flagged';
  }
  if (/ckycr|ckycr ack|ingestion lag/.test(lower)) {
    return 'KYC reporting breach risk — CKYCR submission delay detected';
  }
  if (/ctr.*at-risk|fiu.*ack|ctr clock/.test(lower)) {
    return 'CTR deadline at risk — regulatory acknowledgement delayed';
  }
  if (/str|7bd|sla/.test(lower) && /disposition|l1|aml/.test(lower)) {
    return 'STR SLA breach risk — alert disposition backlog building';
  }
  if (/mlro|saes|attestation/.test(lower)) {
    return 'Executive accountability gap — senior attestation overdue';
  }
  if (/kfs.*violation|borrower_acceptance|kfs_issued/.test(lower)) {
    return 'Fair lending breach risk — disclosure timing violation cluster';
  }
  if (/fourth-party|vendor|outsourc/.test(lower)) {
    return 'Outsourcing breach risk — vendor disclosure gap detected';
  }
  if (/ces dropped|effectiveness decay|operatingrate/.test(lower)) {
    return 'Systemic control failure — material effectiveness decay detected';
  }
  if (/partial|disposition narrative/.test(lower)) {
    return 'Evidence quality gap — case disposition incompletely documented';
  }

  const parts = t.split(/[—–-]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]} — ${parts.slice(1).join(', ')}`;
  }
  return t;
}

export function rewriteAiSignalText(ins: AIInsight): string {
  const curated = CURATED_REWRITES[ins.ai_insight_id];
  const raw = curated ?? heuristicRewrite(ins.title);
  return stripObjectIds(raw);
}

const MAX_STRIP_WORDS = 12;

export function truncateSignalWords(text: string, maxWords = MAX_STRIP_WORDS): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(' ')}…`;
}

export function buildSignalDetailTooltip(ins: AIInsight, rewritten: string): string {
  const ids = [
    ins.ai_insight_id,
    ins.signal_id,
    ...ins.cited_evidence_ids,
    ...ins.cited_source_record_ids.slice(0, 3),
  ].filter(Boolean);
  return `${rewritten}\n\nOriginal: ${ins.title}\n\nRefs: ${ids.join(' · ')}`;
}

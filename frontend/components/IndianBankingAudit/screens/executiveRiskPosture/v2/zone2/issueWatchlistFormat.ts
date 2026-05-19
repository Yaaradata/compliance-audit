import type { Issue } from '../../../../dataModel';

const CURATED_TITLES: Record<string, string> = {
  'ISS-2026-027': 'Fourth-party non-disclosure — outsourcing control breach',
  'ISS-2026-009': 'AML STR window at risk — BPO floor SLA breach',
  'ISS-2026-085': 'KFS issued post-acceptance — 11,118 lending instances affected',
  'ISS-2026-103': 'CTR deadline at risk — FIU acknowledgement delay',
  'ISS-2026-061': 'CKYCR cohort delay — DBT accounts missing re-KYC schedule',
};

const STRIP_ID_PATTERNS = [
  /\bVEND-\d{4}-\d+\b/gi,
  /\bOBL-[A-Z0-9-]+(?:-[A-Z0-9]+)*\b/gi,
  /\bAML-ALRT-\d{4}-\d+\b/gi,
  /\bCTRL-[A-Z0-9-]+(?:-[A-Z0-9]+)*\b/gi,
  /\bEV-[A-Z0-9-]+(?:-[A-Z0-9]+)*\b/gi,
  /\bSR-[A-Z0-9-]+(?:-[A-Z0-9]+)*\b/gi,
  /\bDL-APP-\d{4}-\d+\b/gi,
  /\bUCIC-\d{4}-\d+\b/gi,
];

function stripIdsFromTitle(title: string): string {
  let out = title;
  for (const re of STRIP_ID_PATTERNS) {
    out = out.replace(re, '').replace(/\s{2,}/g, ' ').trim();
  }
  return out.replace(/\s+—\s+—/g, ' — ').replace(/^\s*—\s*/, '').trim();
}

function heuristicTitle(title: string): string {
  const t = stripIdsFromTitle(title).toLowerCase();
  if (/fourth-party|non-disclosure|outsourc/.test(t)) {
    return 'Fourth-party non-disclosure — outsourcing control breach';
  }
  if (/aml|str|sla|bpo/.test(t)) {
    return 'AML STR window at risk — BPO floor SLA breach';
  }
  if (/kfs|acceptance|lending|dsa/.test(t)) {
    return 'KFS issued post-acceptance — lending instances affected';
  }
  if (/ctr|fiu/.test(t)) {
    return 'CTR deadline at risk — FIU acknowledgement delay';
  }
  return stripIdsFromTitle(title);
}

export function formatIssueDisplayTitle(issue: Issue): string {
  return CURATED_TITLES[issue.issue_id] ?? heuristicTitle(issue.title);
}

export function truncateWords(text: string, maxWords = 8): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(' ')}…`;
}

export type OwnerDisplay = {
  title: string;
  code: string;
};

const ROLE_EXPANSIONS: Record<string, string> = {
  CIO: 'Chief Information Officer',
  CCO: 'Chief Compliance Officer',
  CRO: 'Chief Risk Officer',
  CISO: 'Chief Information Security Officer',
  'MLRO-PO': 'MLRO / Prevention Officer',
  'MLRO — Principal Officer': 'MLRO / Prevention Officer',
  'Head-of-FCC': 'Head of Financial Crime Compliance',
  'Head of Financial Crime Compliance': 'Head of Financial Crime Compliance',
  'Operations-Head': 'Head of Operations',
  'Business-Head': 'Business Head — Retail',
  HIA: 'Head of Internal Audit',
  'MD&CEO': 'Managing Director & CEO',
};

export function expandOwnerRole(role: string): OwnerDisplay {
  const trimmed = role.trim();
  const title = ROLE_EXPANSIONS[trimmed] ?? trimmed.replace(/-/g, ' ');
  const code =
    trimmed.length <= 12 && !trimmed.includes(' ')
      ? trimmed
      : trimmed.split(/\s+/)[0]?.slice(0, 8) ?? trimmed;
  return { title, code };
}

export function issueMetaBadges(issue: Issue): string[] {
  const badges: string[] = [issue.issue_id];
  if (issue.rbi_mra_flag) badges.push('RBI MRA');
  if (issue.section_47a_exposure_flag === 'candidate' || issue.section_47a_exposure_flag === 'confirmed') {
    badges.push('s.47A');
  }
  badges.push(`${issue.ageing_days}d`);
  return badges;
}

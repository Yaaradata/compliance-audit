/**
 * v8 horizon items. Regulatory items reuse the existing horizon scan and precedent
 * corpus. Unverified precedents never appear here. Industry events and emerging
 * risks below are real and public, each with its source and date.
 */
import mockDataV8 from "../../mockDataV8";
import { PRECEDENTS } from "../precedentCorpus";
import type { HorizonItem } from "../types";

type HorizonScanRow = {
  id: string;
  regulatorBody: string;
  citation: string;
  title: string;
  publishedDate: string;
  summary: string;
  impactedCROCategoryIds?: string[];
};

/** Mock graph CRO categories mapped to v8 Level-1 ids. */
const CRO_CATEGORY_TO_LEVEL_1: Record<string, string> = {
  cyber_op_resilience: "opsres",
  fraud_financial_crime: "fincrime",
  conduct: "conduct",
  regulatory: "regulatory",
  financial: "credit",
};

const scanRows = (mockDataV8 as unknown as { horizonScanItems?: HorizonScanRow[] }).horizonScanItems ?? [];

const REGULATORY_CHANGE: HorizonItem[] = scanRows.map((row) => ({
  id: row.id,
  type: "regulatory",
  title: row.title,
  source: `${row.regulatorBody} ${row.citation}`,
  sourceUrl: "",
  date: row.publishedDate,
  summary: row.summary,
  relevance: "not_assessed",
  categoryId: CRO_CATEGORY_TO_LEVEL_1[row.impactedCROCategoryIds?.[0] ?? ""] ?? "regulatory",
}));

const PRECEDENT_SIGNALS: HorizonItem[] = PRECEDENTS.filter(
  (p) => p.jurisdiction === "UK" && p.confidence !== "unverified",
).map((p) => ({
  id: `HZ-${p.id}`,
  type: "regulatory",
  title: p.respondent,
  source: p.regulator,
  sourceUrl: p.sourceUrl,
  date: p.noticeDate,
  summary: p.hook,
  relevance: "not_assessed",
  categoryId: p.domainScope[0] ?? "regulatory",
}));

const INDUSTRY_EVENTS: HorizonItem[] = [
  {
    id: "HZ-IND-001",
    type: "industry",
    title: "Google Cloud London region outage disrupts banks",
    source: "Reuters, 21 Oct 2026",
    sourceUrl: "https://finance.yahoo.com/technology/articles/europes-financial-regulators-query-google-154104572.html",
    date: "2026-10-20",
    summary:
      "A power event at a third-party facility took europe-west2 down for several hours; Revolut, Lloyds and HSBC were reported affected, and the EBA and FCA engaged Google.",
    relevance: "not_assessed",
    categoryId: "opsres",
  },
  {
    id: "HZ-IND-002",
    type: "industry",
    title: "Lloyds Banking Group app defect exposes transaction data",
    source: "The Register, 27 Mar 2026",
    sourceUrl: "https://www.theregister.com/2026/03/27/lloyds_app_glitch_turned_transactions/",
    date: "2026-03-12",
    summary:
      "An overnight IT change let up to 447,936 Lloyds, Halifax and Bank of Scotland customers see other customers' transaction lists; the Treasury Committee sought answers.",
    relevance: "not_assessed",
    categoryId: "cyber",
  },
];

const EMERGING_RISKS: HorizonItem[] = [
  {
    id: "HZ-EMG-001",
    type: "emerging",
    title: "Post-quantum cryptography migration",
    source: "NCSC, Mar 2025",
    sourceUrl: "https://www.ncsc.gov.uk/guidance/pqc-migration-timelines",
    date: "2025-03-20",
    summary: "NCSC milestones: discovery and a migration plan by 2028, priority migration by 2031, full migration by 2035.",
    relevance: "not_assessed",
    categoryId: "cyber",
    owner: "Head of Information Security",
  },
  {
    id: "HZ-EMG-002",
    type: "emerging",
    title: "AI deepfake impersonation in investment scams",
    source: "Cyber Daily, 10 Jun 2026",
    sourceUrl: "https://www.cyberdaily.au/digital-transformation/13727-bank-of-england-warns-of-ai-deepfake-scams-featuring-nigel-farage-and-its-governor",
    date: "2026-06-10",
    summary: "The Bank of England warned that fake adverts impersonating central banks are on the rise, including AI deepfakes of its Governor.",
    relevance: "not_assessed",
    categoryId: "fincrime",
    owner: "Head of Financial Crime Compliance",
  },
];

export const HORIZON_ITEMS: HorizonItem[] = [
  ...REGULATORY_CHANGE,
  ...PRECEDENT_SIGNALS,
  ...INDUSTRY_EVENTS,
  ...EMERGING_RISKS,
];

import type { LucideIcon } from 'lucide-react';
import {
  AlertOctagon,
  Briefcase,
  CreditCard,
  Database,
  DollarSign,
  Server,
  Shield,
  UserCog,
  Users,
} from 'lucide-react';
import type { ProcessAuditDomainId } from '@/lib/Indian_Process_Audit/types';
import type { JourneyAiInsightsCopy } from './journeyAiInsights';
import type { JourneySummaryCopy } from './journeySelectionSummary';
import {
  getLoanProductSlice,
  sliceFromSegment,
  type JourneyCaseLike,
} from './journeySliceData';

export type JourneyDomainConfig = {
  domainId: ProcessAuditDomainId;
  headerIcon: LucideIcon;
  heatmapColumns: number;
  sliceRailTitle: string;
  sliceRailHint: string;
  sliceMetaLabel: string;
  portfolioLabel: string;
  snapshotEyebrow: string;
  benchmarkVsLabel: string;
  emptyMatrixTitle: string;
  resolveSlice: (kase: JourneyCaseLike) => string;
  getSliceLabel: (id: string) => string;
  summaryCopy: JourneySummaryCopy;
  aiCopy: JourneyAiInsightsCopy;
  filterPrompts: {
    initial: string;
    noSlice: string;
    hasSlice: string;
  };
};

function heatmapCols(stageCount: number): number {
  if (stageCount <= 6) return 3;
  if (stageCount <= 9) return 3;
  return 4;
}

function aiCopyTemplate(input: {
  audience: string;
  portfolioHeadline: string;
  sliceReadout: (heading: string) => string;
  sliceStageReadout: (heading: string, stage: string) => string;
  portfolioScope: string;
  operationsLead: string;
  packName: string;
  cleanTail?: string;
}): JourneyAiInsightsCopy {
  return {
    audience: input.audience,
    portfolioHeadline: input.portfolioHeadline,
    sliceHeadline: input.sliceReadout,
    sliceStageHeadline: input.sliceStageReadout,
    emptySelectionAction:
      'Expand the slice filter or heatmap selection to include cases before issuing a management response.',
    cleanPortfolioAction: `No immediate remediation — maintain sampling cadence and retain portfolio benchmarks on the ${input.packName}.`,
    stageFocusAction: (stage, controlHint) =>
      `Direct ${input.operationsLead} to replay evidence and sign-off at ${stage} within five business days; brief risk leadership if closure slips.${controlHint}`,
    criticalAction: (count) =>
      `Escalate to CRO / domain head: ${count} critical rejection${count === 1 ? '' : 's'} require root-cause closure before the audit pack is signed off.`,
    exceptionAction: (count) =>
      `${input.operationsLead} to clear ${count} in-review exception${count === 1 ? '' : 's'} and confirm evidence on the top lifecycle hotspot before the next committee read-out.`,
    hotspotAction: (stage, count) =>
      `Prioritize walkthrough at ${stage} with process owner and 2LoD — ${count} case${count === 1 ? '' : 's'} drive most of the finding rate in this slice.`,
    defaultAction: `Maintain weekly heatmap review with accountable owners until finding rate trends below the portfolio benchmark.${input.cleanTail ?? ''}`,
    portfolioScopeNoun: input.portfolioScope,
    benchmarkBulletLabel: 'Finding rate matches portfolio benchmark',
  };
}

function summaryCopyTemplate(input: {
  portfolioHeading: string;
  emptySelection: string;
  cleanPortfolio: string;
  cleanSlice: (heading: string, n: number) => string;
  compliantDetail: string;
}): JourneySummaryCopy {
  return {
    portfolioHeading: input.portfolioHeading,
    emptySelectionInsight: input.emptySelection,
    cleanPortfolioInsight: input.cleanPortfolio,
    cleanSliceInsight: input.cleanSlice,
    vsBenchmarkTitle: 'Vs portfolio sample',
    compliantDetail: input.compliantDetail,
  };
}

const DOMAIN_CONFIGS: Record<ProcessAuditDomainId, JourneyDomainConfig> = {
  customer: {
    domainId: 'customer',
    headerIcon: Users,
    heatmapColumns: 3,
    sliceRailTitle: 'Customer segment',
    sliceRailHint: 'Pick a segment (from case profile) to slice the portfolio',
    sliceMetaLabel: 'Customer segment',
    portfolioLabel: 'All segments',
    snapshotEyebrow: 'Onboarding audit snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'Customers — Journey matrix',
    resolveSlice: sliceFromSegment,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All segments',
      emptySelection:
        'No customer onboarding cases match the current segment and heatmap selection.',
      cleanPortfolio:
        'Q1 portfolio shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean onboarding sample — all ${n} customer${n === 1 ? '' : 's'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 onboarding sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · CCO · Head of Retail Banking · KYC Operations Lead',
      portfolioHeadline: 'Customer / KYC portfolio — management read-out',
      sliceReadout: (h) => `${h} — segment onboarding read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 customer / KYC onboarding portfolio',
      operationsLead: 'the KYC operations lead',
      packName: 'monthly KYC pack',
    }),
    filterPrompts: {
      initial:
        'Click All segments or pick a customer segment and a stage in the heatmap to open the onboarding summary.',
      noSlice: 'Pick a segment, click Show All on the heatmap, or All segments for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this segment, or Show All for the full segment summary.',
    },
  },

  loan: {
    domainId: 'loan',
    headerIcon: Briefcase,
    heatmapColumns: 4,
    sliceRailTitle: 'Loan product',
    sliceRailHint: 'Slice by product type (from application subject)',
    sliceMetaLabel: 'Loan product',
    portfolioLabel: 'All products',
    snapshotEyebrow: 'Credit audit snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'Loan applications — Journey matrix',
    resolveSlice: getLoanProductSlice,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All products',
      emptySelection:
        'No loan applications match the current product and heatmap selection.',
      cleanPortfolio:
        'Q1 credit sample shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean underwriting sample — all ${n} application${n === 1 ? '' : 's'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 credit sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · Chief Credit Officer · Head of Underwriting · Credit Risk',
      portfolioHeadline: 'Credit & loans portfolio — management read-out',
      sliceReadout: (h) => `${h} — product credit read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 retail and MSME loan application portfolio',
      operationsLead: 'the credit operations lead',
      packName: 'monthly credit audit pack',
    }),
    filterPrompts: {
      initial:
        'Click All products or pick a loan product and a stage in the heatmap to open the credit summary.',
      noSlice: 'Pick a product, click Show All on the heatmap, or All products for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this product, or Show All for the full product summary.',
    },
  },

  transaction: {
    domainId: 'transaction',
    headerIcon: CreditCard,
    heatmapColumns: 4,
    sliceRailTitle: 'Payment channel',
    sliceRailHint: 'Slice by channel (RTGS, NEFT, IMPS, LRS, etc.)',
    sliceMetaLabel: 'Channel',
    portfolioLabel: 'All channels',
    snapshotEyebrow: 'Payments audit snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'Transactions — Journey matrix',
    resolveSlice: sliceFromSegment,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All channels',
      emptySelection:
        'No transactions match the current channel and heatmap selection.',
      cleanPortfolio:
        'Q1 payments sample shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean payments sample — all ${n} transaction${n === 1 ? '' : 's'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 payments sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · Head of Operations · Treasury · Payments Operations Lead',
      portfolioHeadline: 'Transactions & payments — management read-out',
      sliceReadout: (h) => `${h} — channel payments read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 transaction and payments portfolio',
      operationsLead: 'the payments operations lead',
      packName: 'monthly payments control pack',
    }),
    filterPrompts: {
      initial:
        'Click All channels or pick a payment channel and a stage in the heatmap to open the payments summary.',
      noSlice: 'Pick a channel, click Show All on the heatmap, or All channels for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this channel, or Show All for the full channel summary.',
    },
  },

  risk: {
    domainId: 'risk',
    headerIcon: AlertOctagon,
    heatmapColumns: 4,
    sliceRailTitle: 'Alert type',
    sliceRailHint: 'Slice by AML, sanctions, fraud, disputes, etc.',
    sliceMetaLabel: 'Alert type',
    portfolioLabel: 'All alert types',
    snapshotEyebrow: 'AML / fraud audit snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'AML alerts — Journey matrix',
    resolveSlice: sliceFromSegment,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All alert types',
      emptySelection: 'No alerts match the current type and heatmap selection.',
      cleanPortfolio:
        'Q1 alert sample shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean alert disposition sample — all ${n} alert${n === 1 ? '' : 's'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 alert sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · CCO · MLRO · Head of Financial Crime Compliance',
      portfolioHeadline: 'AML, risk & fraud — management read-out',
      sliceReadout: (h) => `${h} — alert-type read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 AML and fraud alert portfolio',
      operationsLead: 'the MLRO / FCC operations lead',
      packName: 'monthly FCC pack',
    }),
    filterPrompts: {
      initial:
        'Click All alert types or pick a type and a stage in the heatmap to open the FCC summary.',
      noSlice:
        'Pick an alert type, click Show All on the heatmap, or All alert types for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this alert type, or Show All for the full type summary.',
    },
  },

  itchange: {
    domainId: 'itchange',
    headerIcon: Server,
    heatmapColumns: 4,
    sliceRailTitle: 'Change class',
    sliceRailHint: 'Slice by Normal vs Emergency change',
    sliceMetaLabel: 'Change class',
    portfolioLabel: 'All change classes',
    snapshotEyebrow: 'IT change audit snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'Change requests — Journey matrix',
    resolveSlice: sliceFromSegment,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All change classes',
      emptySelection: 'No change requests match the current class and heatmap selection.',
      cleanPortfolio:
        'Q1 change sample shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean change sample — all ${n} request${n === 1 ? '' : 's'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 IT change sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · CIO · CISO · Head of IT Change Management',
      portfolioHeadline: 'IT change management — management read-out',
      sliceReadout: (h) => `${h} — change-class read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 IT change request portfolio',
      operationsLead: 'the change manager',
      packName: 'monthly IT change pack',
    }),
    filterPrompts: {
      initial:
        'Click All change classes or pick a class and a stage in the heatmap to open the change summary.',
      noSlice:
        'Pick a change class, click Show All on the heatmap, or All change classes for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this class, or Show All for the full class summary.',
    },
  },

  infra: {
    domainId: 'infra',
    headerIcon: Shield,
    heatmapColumns: 4,
    sliceRailTitle: 'Work type',
    sliceRailHint: 'Slice by periodic review, build, drill, incident, etc.',
    sliceMetaLabel: 'Work type',
    portfolioLabel: 'All work types',
    snapshotEyebrow: 'Infrastructure audit snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'Infrastructure tickets — Journey matrix',
    resolveSlice: sliceFromSegment,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All work types',
      emptySelection: 'No infra tickets match the current work type and heatmap selection.',
      cleanPortfolio:
        'Q1 cyber / infra sample shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean infra sample — all ${n} ticket${n === 1 ? '' : 's'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 infrastructure sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · CISO · CIO · Head of Infrastructure & Cyber',
      portfolioHeadline: 'Infrastructure & cyber — management read-out',
      sliceReadout: (h) => `${h} — work-type read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 infrastructure and cyber control portfolio',
      operationsLead: 'the infrastructure security lead',
      packName: 'monthly cyber assurance pack',
    }),
    filterPrompts: {
      initial:
        'Click All work types or pick a work type and a stage in the heatmap to open the infra summary.',
      noSlice:
        'Pick a work type, click Show All on the heatmap, or All work types for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this work type, or Show All for the full type summary.',
    },
  },

  data: {
    domainId: 'data',
    headerIcon: Database,
    heatmapColumns: 4,
    sliceRailTitle: 'Data workstream',
    sliceRailHint: 'Slice by DPDP, masking, DLP, retention, etc.',
    sliceMetaLabel: 'Workstream',
    portfolioLabel: 'All workstreams',
    snapshotEyebrow: 'Data governance snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'Data tasks — Journey matrix',
    resolveSlice: sliceFromSegment,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All workstreams',
      emptySelection: 'No data tasks match the current workstream and heatmap selection.',
      cleanPortfolio:
        'Q1 data governance sample shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean data sample — all ${n} task${n === 1 ? '' : 's'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 data governance sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · DPO · CISO · Head of Data Governance',
      portfolioHeadline: 'Data governance — management read-out',
      sliceReadout: (h) => `${h} — workstream read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 data governance task portfolio',
      operationsLead: 'the data protection office lead',
      packName: 'monthly DPDP / data pack',
    }),
    filterPrompts: {
      initial:
        'Click All workstreams or pick a workstream and a stage in the heatmap to open the data summary.',
      noSlice:
        'Pick a workstream, click Show All on the heatmap, or All workstreams for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this workstream, or Show All for the full workstream summary.',
    },
  },

  finance: {
    domainId: 'finance',
    headerIcon: DollarSign,
    heatmapColumns: 4,
    sliceRailTitle: 'Close activity',
    sliceRailHint: 'Slice by month-end close, nostro, suspense, AP run, etc.',
    sliceMetaLabel: 'Activity',
    portfolioLabel: 'All activities',
    snapshotEyebrow: 'Financial close snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'Close batches — Journey matrix',
    resolveSlice: sliceFromSegment,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All activities',
      emptySelection: 'No close batches match the current activity and heatmap selection.',
      cleanPortfolio:
        'Q1 financial close sample shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean close sample — all ${n} batch${n === 1 ? '' : 'es'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 financial close sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · CFO · Controller · Head of Financial Reporting',
      portfolioHeadline: 'Financial reporting — management read-out',
      sliceReadout: (h) => `${h} — close-activity read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 financial close and reporting portfolio',
      operationsLead: 'the financial reporting lead',
      packName: 'monthly close certification pack',
    }),
    filterPrompts: {
      initial:
        'Click All activities or pick a close activity and a stage in the heatmap to open the finance summary.',
      noSlice:
        'Pick an activity, click Show All on the heatmap, or All activities for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this activity, or Show All for the full activity summary.',
    },
  },

  ops: {
    domainId: 'ops',
    headerIcon: UserCog,
    heatmapColumns: 3,
    sliceRailTitle: 'Ops case type',
    sliceRailHint: 'Slice by vendor onboarding, BCP, HR joiner / mover / leaver',
    sliceMetaLabel: 'Case type',
    portfolioLabel: 'All case types',
    snapshotEyebrow: 'Operations audit snapshot',
    benchmarkVsLabel: 'vs portfolio',
    emptyMatrixTitle: 'Operations cases — Journey matrix',
    resolveSlice: sliceFromSegment,
    getSliceLabel: (id) => id,
    summaryCopy: summaryCopyTemplate({
      portfolioHeading: 'All case types',
      emptySelection: 'No ops cases match the current case type and heatmap selection.',
      cleanPortfolio:
        'Q1 operations sample shows no stage-level exceptions or in-review items in this selection.',
      cleanSlice: (heading, n) =>
        `${heading} has a clean operations sample — all ${n} case${n === 1 ? '' : 's'} passed every lifecycle stage.`,
      compliantDetail: 'All lifecycle stages passed in the Q1 operations sample.',
    }),
    aiCopy: aiCopyTemplate({
      audience: 'CRO · Head of Operations · HR · Third-Party Risk',
      portfolioHeadline: 'Operations & third party — management read-out',
      sliceReadout: (h) => `${h} — case-type read-out`,
      sliceStageReadout: (h, s) => `${h} · ${s} focus`,
      portfolioScope: 'the Q1 operations and third-party portfolio',
      operationsLead: 'the operations / TPRM lead',
      packName: 'monthly ops assurance pack',
    }),
    filterPrompts: {
      initial:
        'Click All case types or pick a case type and a stage in the heatmap to open the operations summary.',
      noSlice:
        'Pick a case type, click Show All on the heatmap, or All case types for the portfolio summary.',
      hasSlice:
        'Click a stage in the heatmap to focus this case type, or Show All for the full type summary.',
    },
  },
};

export const JOURNEY_MATRIX_DOMAIN_IDS = Object.keys(DOMAIN_CONFIGS) as ProcessAuditDomainId[];

export function getJourneyDomainConfig(
  domainId: string,
): JourneyDomainConfig | undefined {
  return DOMAIN_CONFIGS[domainId as ProcessAuditDomainId];
}

export function journeyHeatmapColumnsForStageCount(
  domainId: ProcessAuditDomainId,
  stageCount: number,
): number {
  const cfg = DOMAIN_CONFIGS[domainId];
  return cfg?.heatmapColumns ?? heatmapCols(stageCount);
}

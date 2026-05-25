import type { IntensityTone } from "./intensity-ratio-data";

export type IntensityDrillKind = "product" | "efficiency" | "investment" | "return" | "metric" | "lens";

export type IntensityAiSeverity = "Critical" | "High" | "Medium" | "Low";

export interface IntensityInvestmentAiDossier {
  insightId: string;
  linkedProgramme?: string;
  severity: IntensityAiSeverity;
  category: string;
  confidencePct: number;
  headline: string;
  riskAnalysis: {
    overallRisk: string;
    compositeIndex: number;
    dimensions: { label: string; score: number; note: string }[];
    flags: string[];
  };
  costCutIdeas: {
    title: string;
    annualSavingCr?: number;
    annualSavingT?: number;
    effort: string;
    detail: string;
  }[];
  purchasingStrategies: string[];
  contractLevers: string[];
  recommendedActions: string[];
  modelTrace: string[];
}

export interface IntensityTrendPoint {
  year: string;
  value: number;
  unit?: string;
}

export interface IntensityProductDrill {
  id: string;
  powertrain: string;
  plants: string[];
  narrative: string;
  emitTrend: IntensityTrendPoint[];
  categorySplit: { label: string; pct: number; tPerUnit: number }[];
  topSuppliers: {
    name: string;
    spendCr: number;
    emissionsKt: number;
    pcfStatus: string;
    action?: string;
  }[];
  benchmarks: { label: string; value: string; status: "ok" | "warning" | "gap" }[];
  levers: string[];
  risks: string[];
}

export interface IntensityEfficiencyDrill {
  slug: string;
  narrative: string;
  fyTrend: IntensityTrendPoint[];
  gapToTarget: number;
  spendOrVolumeNote: string;
  topGaps: { item: string; owner: string; due: string; status: string }[];
  linkedSuppliers?: string[];
  controls: string[];
}

export interface IntensityInvestDrill {
  name: string;
  owner: string;
  narrative: string;
  spendCr: number;
  savedT: number;
  roi: number | null;
  status: string;
  milestones: { date: string; label: string; done: boolean }[];
  categoryImpact: { cat: string; sharePct: number }[];
  risks: string[];
}

export interface IntensityReturnDrill {
  title: string;
  narrative: string;
  quantifiedValue: string;
  assumptions: string[];
  linkedProgrammes: string[];
}

export interface IntensityMetricDrill {
  id: string;
  label: string;
  narrative: string;
  series: IntensityTrendPoint[];
  drivers: { label: string; impact: string; tone: IntensityTone }[];
  benchmarks?: string[];
}

export interface IntensityLensDrill {
  title: string;
  narrative: string;
  evidence: string[];
  actions: { owner: string; action: string; due: string }[];
}

export type IntensityDrill =
  | { kind: "product"; title: string; drill: IntensityProductDrill }
  | { kind: "efficiency"; title: string; drill: IntensityEfficiencyDrill }
  | { kind: "investment"; title: string; drill: IntensityInvestDrill }
  | { kind: "return"; title: string; drill: IntensityReturnDrill }
  | { kind: "metric"; title: string; drill: IntensityMetricDrill }
  | { kind: "lens"; title: string; drill: IntensityLensDrill };

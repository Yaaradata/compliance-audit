export type RagStatus = "GREEN" | "AMBER" | "RED";
export type TrendDir = "up" | "down" | "stable";
export type KriUnit = "%" | "count" | "days" | "cases";

export type SubCategory = {
  name: string;
  status: RagStatus;
  desc: string;
};

export type DomainKri = {
  label: string;
  value: number;
  target: number;
  unit: KriUnit;
  status: RagStatus;
};

export type DomainChange = {
  text: string;
  confidence: number;
};

export type RemediationStep = {
  title: string;
  status: "Complete" | "In Progress" | "Delayed" | "Not Started";
  desc: string;
  target: string;
  progress?: number;
};

export type RemediationPlan = {
  title: string;
  forecast: string;
  completion: number;
  steps: RemediationStep[];
};

export type CrsaControl = {
  ref: string;
  objective: string;
  requirement: string;
  status: RagStatus;
};

export type RiskDomainV4 = {
  id: string;
  name: string;
  status: RagStatus;
  trend: TrendDir;
  delta: number;
  summary: string;
  deadline?: string;
  subCategories: SubCategory[];
  kris: DomainKri[];
  changes: DomainChange[];
  remediation?: RemediationPlan;
  /** CRSA area key into CRSA_DATA */
  crsa?: string;
};

export type WhatChangedRowV4 = {
  id: string;
  text: string;
  confidence: number;
  domainId: string;
  domainName: string;
  status: RagStatus;
};

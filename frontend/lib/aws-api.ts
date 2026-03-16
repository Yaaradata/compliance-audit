/**
 * AWS Evidence API — all calls use /api/v1/aws/... (via main api client).
 */

import { api } from "@/lib/api";

const PREFIX = "/aws";

export interface AwsRun {
  run_id: string;
  collector_name: string;
  cloud_provider: string;
  execution_time: string | null;
  in_time?: string | null;
  ended_at: string | null;
  status: string;
  trigger_type: string | null;
  evidence_count: number;
}

export interface AwsEvidenceRow {
  evidence_id: string;
  item_code: string;
  control_id: string;
  evidence_type: string;
  source_system: string;
  collected_at: string | null;
}

export interface AwsControl {
  control_id: string;
  control_name: string | null;
  item_code?: string | null;
  mandatory_flag?: string | null;
}

export interface AwsControlDetail {
  control_id: string;
  control_name: string | null;
  required_evidence_items: { item_code: string; evidence_item_name: string | null }[];
  collected_evidence: AwsEvidenceRow[];
  aws_calls: {
    aws_apis: string[];
    by_evidence_item: { item_code: string; evidence_item_name: string; apis: string[] }[];
  };
}

export interface RunDetail {
  run_id: string;
  collector_name: string;
  execution_time: string | null;
  in_time?: string | null;
  ended_at: string | null;
  status: string;
  trigger_type: string | null;
  evidence_count: number;
  aws_calls: { collector: string; apis: string[] }[];
}

export function getRuns(limit = 50): Promise<AwsRun[]> {
  return api.get<AwsRun[]>(`${PREFIX}/runs?limit=${limit}`).then((r) => (Array.isArray(r) ? r : []));
}

export function getRunDetail(runId: string): Promise<RunDetail> {
  return api.get<RunDetail>(`${PREFIX}/runs/${runId}`);
}

export function fetchAwsEvidence(): Promise<{ run_id: string; status: string }> {
  return api.postDirect<{ run_id: string; status: string }>(`/${PREFIX}/runs/collect`, {}, 120_000);
}

export function getEvidence(limit = 1000): Promise<AwsEvidenceRow[]> {
  return api.get<AwsEvidenceRow[]>(`${PREFIX}/evidence?limit=${limit}`).then((r) => (Array.isArray(r) ? r : []));
}

export function getEvidenceContent(evidenceId: string): Promise<unknown> {
  return api.get<unknown>(`${PREFIX}/evidence/${evidenceId}/content`);
}

export function getControls(): Promise<AwsControl[]> {
  return api.get<AwsControl[]>(`${PREFIX}/controls`).then((r) => (Array.isArray(r) ? r : []));
}

export function getControl(controlId: string): Promise<AwsControlDetail> {
  return api.get<AwsControlDetail>(`${PREFIX}/control/${controlId}`);
}

export function getControlsCoverage(): Promise<{ control_ids_with_evidence: string[] }> {
  return api.get<{ control_ids_with_evidence: string[] }>(`${PREFIX}/controls/coverage`).catch(() => ({ control_ids_with_evidence: [] }));
}

export function submitManualEvidence(body: {
  control_id: string;
  item_code: string;
  content: Record<string, unknown>;
  evidence_type?: string;
  source_system?: string;
}): Promise<{ evidence_id: string; control_id: string; item_code: string }> {
  return api.post<{ evidence_id: string; control_id: string; item_code: string }>(`${PREFIX}/evidence`, body);
}

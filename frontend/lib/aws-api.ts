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
  run_id?: string;
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

export interface AwsEvidenceByRun {
  run_id: string;
  execution_time: string | null;
  ended_at: string | null;
  status: string;
  trigger_type: string | null;
  evidence_count: number;
  evidence: AwsEvidenceRow[];
}

export interface AwsControlDetail {
  control_id: string;
  control_name: string | null;
  /** When requested with item_code filter, only this item is returned. */
  item_code?: string | null;
  required_evidence_items: { item_code: string; evidence_item_name: string | null }[];
  /** Evidence grouped by collector run (Run 1, Run 2, …). Use this for control → run → evidence hierarchy. */
  evidence_by_run: AwsEvidenceByRun[];
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
  error_message?: string | null;
}

export function getRuns(limit = 50): Promise<AwsRun[]> {
  return api.get<AwsRun[]>(`${PREFIX}/runs?limit=${limit}`).then((r) => (Array.isArray(r) ? r : []));
}

export function getRunDetail(runId: string): Promise<RunDetail> {
  return api.get<RunDetail>(`${PREFIX}/runs/${runId}`);
}

export function deleteRun(runId: string): Promise<{ run_id: string; deleted_evidence: number }> {
  return api.del<{ run_id: string; deleted_evidence: number }>(`${PREFIX}/runs/${runId}`);
}

export function fetchAwsEvidence(): Promise<{ run_id: string; status: string }> {
  // Use proxy so the request goes through Next.js → backend (no direct browser → backend).
  return api.postViaProxy<{ run_id: string; status: string }>(`${PREFIX}/runs/collect`, {}, 120_000);
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

export function getControl(controlId: string, itemCode?: string | null): Promise<AwsControlDetail> {
  const qs = itemCode?.trim() ? `?item_code=${encodeURIComponent(itemCode.trim())}` : "";
  return api.get<AwsControlDetail>(`${PREFIX}/control/${controlId}${qs}`);
}

export function getControlsCoverage(): Promise<{ control_ids_with_evidence: string[] }> {
  return api.get<{ control_ids_with_evidence: string[] }>(`${PREFIX}/controls/coverage`).catch(() => ({ control_ids_with_evidence: [] }));
}

/** (control_id, control_name, item_code) for each evidence item that has evidence. Use for sidebar so clicking A2 shows only A2. */
export interface AwsControlItemWithEvidence {
  control_id: string;
  control_name: string | null;
  item_code: string;
}

export function getControlsCoverageItems(): Promise<AwsControlItemWithEvidence[]> {
  return api.get<AwsControlItemWithEvidence[]>(`${PREFIX}/controls/coverage/items`).then((r) => (Array.isArray(r) ? r : []));
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

export interface AwsCredentialsConfig {
  has_config: boolean;
  aws_region: string;
  aws_account_id: string | null;
  connection_type?: string;
  is_active?: boolean;
  connected_at?: string | null;
  role_arn?: string | null;
}

export interface AwsConnectSetup {
  external_id: string;
  platform_account_id?: string | null;
  trust_policy_template: string;
}

export function getAwsConnectSetup(): Promise<AwsConnectSetup> {
  return api.get<AwsConnectSetup>(`${PREFIX}/connect/setup`);
}

/** Connect using Role ARN + Region only. Backend uses configured External ID (e.g. Swift-Audit). */
export function saveAwsConnect(body: {
  role_arn: string;
  region?: string;
}): Promise<{ ok: boolean; message?: string }> {
  return api.post<{ ok: boolean; message?: string }>(`${PREFIX}/connect`, {
    role_arn: body.role_arn.trim(),
    region: (body.region || "us-east-1").trim() || "us-east-1",
  });
}

export interface DeleteAwsConnectResult {
  ok: boolean;
  message?: string;
  deleted_evidence?: number;
  deleted_runs?: number;
}

/** Disconnect AWS account and delete all evidence and collector runs for this tenant. Cannot be undone. */
export function deleteAwsConnect(): Promise<DeleteAwsConnectResult> {
  return api.del<DeleteAwsConnectResult>(`${PREFIX}/connect`);
}

export function getAwsCredentials(): Promise<AwsCredentialsConfig> {
  return api.get<AwsCredentialsConfig>(`${PREFIX}/credentials`).then((r) => ({
    has_config: r?.has_config ?? false,
    aws_region: r?.aws_region ?? "us-east-1",
    aws_account_id: r?.aws_account_id ?? null,
    connection_type: r?.connection_type,
    is_active: r?.is_active ?? true,
    connected_at: r?.connected_at ?? null,
  }));
}

/** Enter the system with only Account ID and Region (no credentials). */
export function saveAwsContext(body: {
  aws_account_id: string;
  aws_region?: string;
}): Promise<{ ok: boolean; message?: string }> {
  return api.post<{ ok: boolean; message?: string }>(`${PREFIX}/context`, {
    aws_account_id: (body.aws_account_id || "").trim(),
    aws_region: (body.aws_region || "us-east-1").trim() || "us-east-1",
  });
}

export function saveAwsCredentials(body: {
  access_key_id: string;
  secret_access_key: string;
  aws_region?: string;
  aws_account_id?: string | null;
}): Promise<{ ok: boolean; message?: string }> {
  return api.post<{ ok: boolean; message?: string }>(`${PREFIX}/credentials`, body);
}

export interface AwsCredentialsTestResult {
  ok: boolean;
  account_id?: string;
  user_id?: string;
  arn?: string;
}

export function testAwsCredentials(): Promise<AwsCredentialsTestResult> {
  return api.post<AwsCredentialsTestResult>(`${PREFIX}/credentials/test`, {});
}

// ——— AWS SSO (OAuth2) device flow ———

export interface OAuthStartResult {
  verification_uri: string;
  verification_uri_complete: string;
  user_code: string;
  device_code: string;
  expires_in: number;
  interval: number;
}

export function startAwsOAuth(body: { sso_start_url: string; sso_region?: string }): Promise<OAuthStartResult> {
  return api.post<OAuthStartResult>(`${PREFIX}/auth/oauth/start`, {
    sso_start_url: body.sso_start_url.trim(),
    sso_region: (body.sso_region || "us-east-1").trim() || "us-east-1",
  });
}

export interface OAuthPollResult {
  ok: boolean;
  account_id?: string;
  account_name?: string;
  role_name?: string;
}

export function pollAwsOAuth(body: { device_code: string }): Promise<OAuthPollResult> {
  return api.post<OAuthPollResult>(`${PREFIX}/auth/oauth/poll`, { device_code: body.device_code });
}

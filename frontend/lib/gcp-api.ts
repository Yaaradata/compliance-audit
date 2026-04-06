/**
 * GCP Evidence API — /api/v1/cloud/gcp/... (project + ADC from backend env).
 */

import { api } from "@/lib/api";
import { CLOUD_EVIDENCE_API } from "@/lib/cloud-evidence-api-paths";
import type { CloudCollectorRun, CloudEvidenceRow } from "@/lib/cloud-evidence-types";

const PREFIX = CLOUD_EVIDENCE_API.gcp;

/** Matches backend `GET /gcp/evidence` upper bound so the UI can load full runs after collect. */
export const GCP_EVIDENCE_LIST_MAX = 5000;

const scopeQuery = (cycleId: string | null | undefined): string => {
  const id = (cycleId || "").trim();
  return id ? `?cycle_id=${encodeURIComponent(id)}` : "";
};

export type GcpRun = CloudCollectorRun;

export type GcpEvidenceRow = CloudEvidenceRow;

export interface GcpConfigResponse {
  configured: boolean;
  /** When true, user may open GCP dashboard / evidence; not gated by strict team-email IAM binding. */
  dashboard_unlocked?: boolean;
  project_id: string | null;
  connection_mode?: "oauth" | "adc";
  oauth_enabled?: boolean;
  google_user_email?: string | null;
  /** True when project id was saved for this cycle (OAuth flow may still need Google sign-in). */
  project_saved?: boolean;
  /** Team member email used for IAM policy check (direct user: binding). */
  access_verification_email?: string | null;
  iam_access_verified?: boolean | null;
  iam_access_detail?: string | null;
  iam_check_complete?: boolean;
  connect_api_test_passed?: boolean;
}

export function getGcpConfig(cycleId?: string | null): Promise<GcpConfigResponse> {
  const qs = scopeQuery(cycleId);
  return api.get<GcpConfigResponse>(`${PREFIX}/config${qs}`);
}

export function saveGcpProjectContext(
  cycleId: string | null | undefined,
  gcp_project_id: string,
  access_verification_email: string
): Promise<{
  ok: boolean;
  message?: string;
  iam_access_verified?: boolean;
  iam_access_detail?: string;
  iam_roles?: string[];
}> {
  return api.post(
    `${PREFIX}/context${scopeQuery(cycleId)}`,
    { gcp_project_id, access_verification_email }
  );
}

export function startGcpOAuth(cycleId?: string | null): Promise<{ authorization_url: string }> {
  return api.post<{ authorization_url: string }>(`${PREFIX}/auth/oauth/start${scopeQuery(cycleId)}`, {});
}

export function disconnectGcpOAuth(cycleId?: string | null): Promise<{ ok: boolean }> {
  return api.post<{ ok: boolean }>(`${PREFIX}/auth/oauth/disconnect${scopeQuery(cycleId)}`, {});
}

export function testGcpCredentials(cycleId?: string | null): Promise<{ ok: boolean; project_id?: string; message?: string }> {
  return api.post<{ ok: boolean; project_id?: string; message?: string }>(
    `${PREFIX}/credentials/test${scopeQuery(cycleId)}`,
    {}
  );
}

export function fetchGcpEvidence(cycleId?: string | null): Promise<{ run_id: string; status: string; project_id?: string }> {
  return api.postViaProxy<{ run_id: string; status: string; project_id?: string }>(
    `${PREFIX}/runs/collect${scopeQuery(cycleId)}`,
    {},
    120_000
  );
}

export function getGcpRuns(limit = 50, cycleId?: string | null): Promise<GcpRun[]> {
  const qs = scopeQuery(cycleId);
  const url = `${PREFIX}/runs?limit=${limit}${qs ? `&${qs.slice(1)}` : ""}`;
  return api.get<GcpRun[]>(url).then((r) => (Array.isArray(r) ? r : []));
}

export function getGcpEvidence(limit = 2000, cycleId?: string | null, runId?: string | null): Promise<GcpEvidenceRow[]> {
  const qs = scopeQuery(cycleId);
  const runQ = runId ? `&run_id=${encodeURIComponent(runId)}` : "";
  const url = `${PREFIX}/evidence?limit=${limit}${runQ}${qs ? `&${qs.slice(1)}` : ""}`;
  return api.get<GcpEvidenceRow[]>(url).then((r) => (Array.isArray(r) ? r : []));
}

export function getGcpEvidenceContent(evidenceId: string, cycleId?: string | null): Promise<unknown> {
  return api.get<unknown>(`${PREFIX}/evidence/${evidenceId}/content${scopeQuery(cycleId)}`);
}

export function deleteAllGcpEvidence(
  cycleId?: string | null
): Promise<{ deleted_evidence: number; deleted_runs: number; connect_config_cleared?: boolean }> {
  return api.del<{ deleted_evidence: number; deleted_runs: number; connect_config_cleared?: boolean }>(
    `${PREFIX}/evidence${scopeQuery(cycleId)}`
  );
}

export function getGcpControlsCoverage(cycleId?: string | null): Promise<{ control_ids_with_evidence: string[] }> {
  return api
    .get<{ control_ids_with_evidence: string[] }>(`${PREFIX}/controls/coverage${scopeQuery(cycleId)}`)
    .catch(() => ({ control_ids_with_evidence: [] }));
}

export interface GcpRunDetail {
  run_id: string;
  collector_name: string;
  cloud_provider?: string;
  execution_time: string | null;
  in_time?: string | null;
  ended_at: string | null;
  status: string;
  trigger_type: string | null;
  evidence_count: number;
  gcp_apis?: { collector: string; apis: string[] }[];
  error_message?: string | null;
}

export function getGcpRunDetail(runId: string, cycleId?: string | null): Promise<GcpRunDetail> {
  return api.get<GcpRunDetail>(`${PREFIX}/runs/${runId}${scopeQuery(cycleId)}`);
}

export interface GcpCollectorApiMatrix {
  by_collector: Array<{
    collector: string;
    gcp_api_methods: string[];
  }>;
}

export function getGcpCollectorApiMatrix(cycleId?: string | null): Promise<GcpCollectorApiMatrix> {
  return api.get<GcpCollectorApiMatrix>(`${PREFIX}/collectors/api-matrix${scopeQuery(cycleId)}`);
}

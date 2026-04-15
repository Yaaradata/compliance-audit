/**
 * Azure Evidence API — /api/v1/cloud/azure/... (subscription + Resource Graph collectors).
 */

import { api } from "@/lib/api";
import { CLOUD_EVIDENCE_API } from "@/lib/cloud-evidence-api-paths";
import type { CloudCollectorRun, CloudEvidenceRow } from "@/lib/cloud-evidence-types";

const PREFIX = CLOUD_EVIDENCE_API.azure;

export const AZURE_EVIDENCE_LIST_MAX = 5000;

const scopeQuery = (cycleId: string | null | undefined): string => {
  const id = (cycleId || "").trim();
  return id ? `?cycle_id=${encodeURIComponent(id)}` : "";
};

export type AzureRun = CloudCollectorRun;

export type AzureEvidenceRow = CloudEvidenceRow;

export interface AzureConfigResponse {
  configured: boolean;
  dashboard_unlocked?: boolean;
  azure_subscription_id: string | null;
  azure_tenant_id: string | null;
  service_principal_saved?: boolean;
  env_service_principal_available?: boolean;
  /** Server has AZURE_OAUTH_* for Sign in with Microsoft. */
  azure_oauth_env_configured?: boolean;
  /** This cycle has a stored OAuth refresh token. */
  entra_oauth_connected?: boolean;
  entra_signin_username?: string | null;
  connect_api_test_passed?: boolean;
}

export function getAzureConfig(cycleId?: string | null): Promise<AzureConfigResponse> {
  const qs = scopeQuery(cycleId);
  return api.get<AzureConfigResponse>(`${PREFIX}/config${qs}`);
}

export function saveAzureContext(
  cycleId: string | null | undefined,
  body: {
    azure_subscription_id: string;
    azure_tenant_id: string;
    azure_client_id?: string | null;
    client_secret?: string | null;
  }
): Promise<{ ok: boolean; message?: string }> {
  return api.post(`${PREFIX}/context${scopeQuery(cycleId)}`, body);
}

export function testAzureCredentials(
  cycleId?: string | null
): Promise<{ ok: boolean; subscription_id?: string; message?: string; directory_tenant_id?: string }> {
  return api.post<{ ok: boolean; subscription_id?: string; message?: string; directory_tenant_id?: string }>(
    `${PREFIX}/credentials/test${scopeQuery(cycleId)}`,
    {}
  );
}

export function startAzureOAuth(cycleId?: string | null): Promise<{ authorization_url: string }> {
  return api.post<{ authorization_url: string }>(`${PREFIX}/auth/oauth/start${scopeQuery(cycleId)}`, {});
}

export function disconnectAzureOAuth(cycleId?: string | null): Promise<{ ok: boolean; message?: string }> {
  return api.post<{ ok: boolean; message?: string }>(`${PREFIX}/auth/oauth/disconnect${scopeQuery(cycleId)}`, {});
}

export function fetchAzureEvidence(cycleId?: string | null): Promise<{ run_id: string; status: string; subscription_id?: string }> {
  return api.postViaProxy<{ run_id: string; status: string; subscription_id?: string }>(
    `${PREFIX}/runs/collect${scopeQuery(cycleId)}`,
    {},
    120_000
  );
}

export function getAzureRuns(limit = 50, cycleId?: string | null): Promise<AzureRun[]> {
  const qs = scopeQuery(cycleId);
  const url = `${PREFIX}/runs?limit=${limit}${qs ? `&${qs.slice(1)}` : ""}`;
  return api.get<AzureRun[]>(url).then((r) => (Array.isArray(r) ? r : []));
}

export function getAzureEvidence(limit = 2000, cycleId?: string | null, runId?: string | null): Promise<AzureEvidenceRow[]> {
  const qs = scopeQuery(cycleId);
  const runQ = runId ? `&run_id=${encodeURIComponent(runId)}` : "";
  const url = `${PREFIX}/evidence?limit=${limit}${runQ}${qs ? `&${qs.slice(1)}` : ""}`;
  return api.get<AzureEvidenceRow[]>(url).then((r) => (Array.isArray(r) ? r : []));
}

export function getAzureEvidenceContent(evidenceId: string, cycleId?: string | null): Promise<unknown> {
  return api.get<unknown>(`${PREFIX}/evidence/${evidenceId}/content${scopeQuery(cycleId)}`);
}

export function deleteAllAzureEvidence(
  cycleId?: string | null
): Promise<{ deleted_evidence: number; deleted_runs: number; connect_config_cleared?: boolean }> {
  return api.del<{ deleted_evidence: number; deleted_runs: number; connect_config_cleared?: boolean }>(
    `${PREFIX}/evidence${scopeQuery(cycleId)}`
  );
}

export function getAzureControlsCoverage(cycleId?: string | null): Promise<{ control_ids_with_evidence: string[] }> {
  return api
    .get<{ control_ids_with_evidence: string[] }>(`${PREFIX}/controls/coverage${scopeQuery(cycleId)}`)
    .catch(() => ({ control_ids_with_evidence: [] }));
}

export interface AzureRunDetail {
  run_id: string;
  collector_name: string;
  cloud_provider?: string;
  execution_time: string | null;
  in_time?: string | null;
  ended_at: string | null;
  status: string;
  trigger_type: string | null;
  evidence_count: number;
  error_message?: string | null;
}

export function getAzureRunDetail(runId: string, cycleId?: string | null): Promise<AzureRunDetail> {
  return api.get<AzureRunDetail>(`${PREFIX}/runs/${runId}${scopeQuery(cycleId)}`);
}

export interface AzureCollectorApiMatrix {
  by_collector: Array<{
    collector: string;
    azure_api_methods: string[];
  }>;
}

export function getAzureCollectorApiMatrix(cycleId?: string | null): Promise<AzureCollectorApiMatrix> {
  return api.get<AzureCollectorApiMatrix>(`${PREFIX}/collectors/api-matrix${scopeQuery(cycleId)}`);
}

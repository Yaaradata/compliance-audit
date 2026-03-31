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
  project_id: string | null;
}

export function getGcpConfig(cycleId?: string | null): Promise<GcpConfigResponse> {
  const qs = scopeQuery(cycleId);
  return api.get<GcpConfigResponse>(`${PREFIX}/config${qs}`);
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
): Promise<{ deleted_evidence: number; deleted_runs: number }> {
  return api.del<{ deleted_evidence: number; deleted_runs: number }>(
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

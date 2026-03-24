/**
 * Artifact Registry API client — wraps /api/v1/artifact-registry/* endpoints.
 */

import { api } from "@/lib/api";
import type {
  ArtifactOut,
  ArtifactControlLinkOut,
  CrossCheckOut,
  AuditTrailOut,
  ReuseCandidateOut,
} from "@/lib/types";

const PREFIX = "/artifact-registry";

export async function getReuseCandidates(
  evidenceItemId: string,
  cycleId: string,
  frameworkSchema: string,
  cscfVersion: string
): Promise<ReuseCandidateOut[]> {
  return api.get<ReuseCandidateOut[]>(
    `${PREFIX}/reuse/candidates/${encodeURIComponent(evidenceItemId)}?cycle_id=${encodeURIComponent(cycleId)}&framework_schema=${encodeURIComponent(frameworkSchema)}&cscf_version=${encodeURIComponent(cscfVersion)}`
  );
}

export async function executeReuse(
  sourceArtifactId: string,
  targetCycleId: string,
  reconfirmationNote?: string
): Promise<ArtifactOut> {
  return api.post<ArtifactOut>(`${PREFIX}/reuse`, {
    source_artifact_id: sourceArtifactId,
    target_cycle_id: targetCycleId,
    reconfirmation_note: reconfirmationNote ?? null,
  });
}

export async function searchArtifacts(opts: {
  cycleId?: string;
  evidenceItemId?: string;
  q?: string;
}): Promise<ArtifactOut[]> {
  const params = new URLSearchParams();
  if (opts.cycleId) params.set("cycle_id", opts.cycleId);
  if (opts.evidenceItemId) params.set("evidence_item_id", opts.evidenceItemId);
  if (opts.q) params.set("q", opts.q);
  return api.get<ArtifactOut[]>(`${PREFIX}/search?${params.toString()}`);
}

export async function getArtifactForSubmission(
  cycleId: string,
  evidenceItemId: string
): Promise<ArtifactOut | null> {
  const results = await searchArtifacts({ cycleId, evidenceItemId });
  return results.length > 0 ? results[0] : null;
}

export async function getControlLinks(
  artifactId: string
): Promise<ArtifactControlLinkOut[]> {
  return api.get<ArtifactControlLinkOut[]>(
    `${PREFIX}/artifacts/${encodeURIComponent(artifactId)}/control-links`
  );
}

export async function getArtifactCrossChecks(
  artifactId: string
): Promise<CrossCheckOut[]> {
  return api.get<CrossCheckOut[]>(
    `${PREFIX}/artifacts/${encodeURIComponent(artifactId)}/cross-checks`
  );
}

export async function getCycleCrossChecks(
  cycleId: string
): Promise<CrossCheckOut[]> {
  return api.get<CrossCheckOut[]>(
    `${PREFIX}/cycles/${encodeURIComponent(cycleId)}/cross-checks`
  );
}

export async function getAuditTrail(
  artifactId: string
): Promise<AuditTrailOut[]> {
  return api.get<AuditTrailOut[]>(
    `${PREFIX}/artifacts/${encodeURIComponent(artifactId)}/audit-trail`
  );
}

export async function getVersions(
  artifactId: string
): Promise<ArtifactOut[]> {
  return api.get<ArtifactOut[]>(
    `${PREFIX}/artifacts/${encodeURIComponent(artifactId)}/versions`
  );
}

export async function getCycleReadiness(
  cycleId: string
): Promise<{ cycle_id: string; total_control_links: number; sufficient_links: number; readiness_pct: number }> {
  return api.get(
    `${PREFIX}/cycles/${encodeURIComponent(cycleId)}/readiness`
  );
}

export async function updateArtifactFormData(
  artifactId: string,
  formDataJson: Record<string, unknown>
): Promise<ArtifactOut> {
  return api.patch<ArtifactOut>(
    `${PREFIX}/artifacts/${encodeURIComponent(artifactId)}/form-data`,
    { form_data_json: formDataJson }
  );
}

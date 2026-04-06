/**
 * HTTP segments for SWIFT collector evidence APIs (under Next.js `/api/v1`).
 * AWS and GCP are separate subtrees — no shared `/runs` root between providers.
 */
export const CLOUD_EVIDENCE_API = {
  aws: "/cloud/aws",
  gcp: "/cloud/gcp",
  azure: "/cloud/azure",
} as const;

export type CloudEvidenceProvider = keyof typeof CLOUD_EVIDENCE_API;

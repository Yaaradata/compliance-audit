/**
 * Framework registry: maps backend schema_name to framework-specific components.
 * Add a new framework by creating its folder under components/frameworks/<framework>/
 * and registering here. This is the only file that needs to be touched when adding
 * a new framework, to avoid merge conflicts with other framework code.
 */

import type { ComponentType } from "react";
import type { SchemaName } from "./types";
import type { EvidenceWorkspaceProps } from "./types";

type EvidenceWorkspaceComponent = ComponentType<EvidenceWorkspaceProps>;

const evidenceWorkspaceBySchema = new Map<SchemaName, () => Promise<{ default: EvidenceWorkspaceComponent }>>();

/** Register an evidence workspace for a schema. Called by framework index files. */
export function registerEvidenceWorkspace(
  schemaName: SchemaName,
  loader: () => Promise<{ default: EvidenceWorkspaceComponent }>
): void {
  evidenceWorkspaceBySchema.set(schemaName, loader);
}

/** Get the evidence workspace component for a schema. Returns a lazy component that resolves to the framework implementation. */
export function getEvidenceWorkspaceLoader(
  schemaName: SchemaName | null | undefined
): () => Promise<{ default: EvidenceWorkspaceComponent }> {
  const normalized = normalizeSchema(schemaName);
  const loader = evidenceWorkspaceBySchema.get(normalized);
  if (loader) return loader;
  // Default: SWIFT when schema unknown or missing
  const swift = evidenceWorkspaceBySchema.get("swift_2025") ?? evidenceWorkspaceBySchema.get("swift_2026");
  if (swift) return swift;
  return evidenceWorkspaceBySchema.get("soc2")!;
}

function normalizeSchema(schema: SchemaName | null | undefined): SchemaName {
  if (schema == null || schema === "") return "swift_2025";
  return String(schema).toLowerCase().trim();
}

// ----- Registration: each framework registers itself (no cross-import of the other's files) -----

registerEvidenceWorkspace("swift_2025", () =>
  import("@/components/frameworks/swift-cscf/components/domain/dashboard/evidence-workspace").then((m) => ({ default: m.EvidenceWorkspace }))
);
registerEvidenceWorkspace("swift_2026", () =>
  import("@/components/frameworks/swift-cscf/components/domain/dashboard/evidence-workspace").then((m) => ({ default: m.EvidenceWorkspace }))
);

registerEvidenceWorkspace("soc2", () =>
  import("@/components/frameworks/soc2/components/domain/dashboard/evidence-workspace").then((m) => ({ default: m.EvidenceWorkspace }))
);

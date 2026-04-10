import type { Architecture, CycleSchemaName } from "@/lib/types";
import { ARCHITECTURES_V2025 } from "./architectures.v2025";

/**
 * Architecture **metadata** (names, descriptions, components): `architectures.v2025.ts`.
 * Mandatory/advisory **counts** and **domain scope** for a cycle come from the API:
 * `GET /assessments/{cycleId}/architecture-catalog-counts` (framework `controls` table; schema from cycle).
 */

export const ARCHITECTURES: Architecture[] = ARCHITECTURES_V2025;

function cscfVersionForSchema(schemaName: CycleSchemaName | string | null | undefined): string {
  return String(schemaName ?? "").trim().toLowerCase() === "swift_2026" ? "2026" : "2025";
}

/**
 * All architectures for UI shells; `cscfVersion` reflects cycle schema only (no static control matrices).
 */
export function getArchitecturesForSchema(
  schemaName: CycleSchemaName | string | null | undefined
): Architecture[] {
  const v = cscfVersionForSchema(schemaName);
  return ARCHITECTURES.map((a) => ({ ...a, cscfVersion: v }));
}

/**
 * Lookup one architecture; pass `schema_name` from the cycle so `cscfVersion` matches 2025 vs 2026.
 */
export function getArchitecture(
  id: string,
  schemaName?: CycleSchemaName | string | null
): Architecture | undefined {
  const base = ARCHITECTURES.find((a) => a.id === id);
  if (!base) return undefined;
  return { ...base, cscfVersion: cscfVersionForSchema(schemaName) };
}

/**
 * Diagram/image references intentionally removed.
 * Keep these exports as no-op placeholders so existing imports do not break.
 */
export const ARCHITECTURE_DIAGRAMS: Record<string, string[]> = {};

export function getDiagramFolder(_version?: string | null): "" {
  return "";
}

export async function getArchitectureDiagramUrlAsync(
  _diagramFilename: string,
  _version?: string | null
): Promise<string | null> {
  return null;
}

/** Returns a public URL for the diagram image, or `null` when assets are unavailable (do not pass `""` to `<img src>`). */
export function getArchitectureDiagramUrl(_diagramFilename: string, _version?: string | null): string | null {
  return null;
}

export function getArchitectureDiagramPath(
  _architectureId: string,
  _extension?: "png" | "jpg" | "svg" | "webp",
  _version?: string | null
): string {
  return "";
}

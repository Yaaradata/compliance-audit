import type { Architecture, ArchitectureId, CycleSchemaName } from "@/lib/types";
import { ARCHITECTURES_V2025 } from "./architectures.v2025";
import { CSCF_V2026_CONTROLS } from "./architectures.v2026";

/**
 * Compatibility layer:
 * - v2025 source of truth: `architectures.v2025.ts`
 * - v2026 source of truth: `architectures.v2026.ts`
 */

function isSwift2026Schema(schemaName: CycleSchemaName | string | null | undefined): boolean {
  return String(schemaName ?? "").trim().toLowerCase() === "swift_2026";
}

export { CSCF_V2026_CONTROLS };
export const ARCHITECTURES: Architecture[] = ARCHITECTURES_V2025;

/**
 * Return architecture definitions with control lists and domains for the given cycle schema.
 * Use `swift_2026` for CSCF v2026 table; otherwise v2025 defaults from `ARCHITECTURES`.
 */
export function getArchitecturesForSchema(
  schemaName: CycleSchemaName | string | null | undefined
): Architecture[] {
  if (!isSwift2026Schema(schemaName)) {
    return ARCHITECTURES;
  }
  return ARCHITECTURES.map((a) => {
    const v = CSCF_V2026_CONTROLS[a.id as ArchitectureId];
    if (!v) return { ...a, cscfVersion: "2026" };
    return {
      ...a,
      mandatoryControls: v.mandatoryControls,
      advisoryControls: v.advisoryControls,
      domainIds: v.domainIds,
      cscfVersion: "2026",
    };
  });
}

/**
 * Lookup one architecture. Pass `schemaName` from the assessment cycle (`schema_name`) so v2026
 * control counts match the official matrix; omit for legacy v2025-only behaviour.
 */
export function getArchitecture(
  id: string,
  schemaName?: CycleSchemaName | string | null
): Architecture | undefined {
  const base = ARCHITECTURES.find((a) => a.id === id);
  if (!base) return undefined;
  if (!isSwift2026Schema(schemaName)) {
    return base;
  }
  const v = CSCF_V2026_CONTROLS[id as ArchitectureId];
  if (!v) {
    return { ...base, cscfVersion: "2026" };
  }
  return {
    ...base,
    mandatoryControls: v.mandatoryControls,
    advisoryControls: v.advisoryControls,
    domainIds: v.domainIds,
    cscfVersion: "2026",
  };
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
): Promise<string> {
  return "";
}

export function getArchitectureDiagramUrl(_diagramFilename: string, _version?: string | null): string {
  return "";
}

export function getArchitectureDiagramPath(
  _architectureId: string,
  _extension?: "png" | "jpg" | "svg" | "webp",
  _version?: string | null
): string {
  return "";
}
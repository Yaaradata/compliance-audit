import { ARCHITECTURE_VARIANTS_V2025, type ArchitectureVariant } from "./architecture-variants.v2025";
import { ARCHITECTURE_VARIANTS_V2026 } from "./architecture-variants.v2026";

/**
 * Compatibility export (defaults to v2025).
 * Use `getArchitectureVariantsForSchema` where schema-aware behavior is needed.
 */
export const ARCHITECTURE_VARIANTS: Record<string, ArchitectureVariant[]> = ARCHITECTURE_VARIANTS_V2025;

export function getArchitectureVariantsForSchema(
  schemaName: string | null | undefined
): Record<string, ArchitectureVariant[]> {
  return String(schemaName ?? "").trim().toLowerCase() === "swift_2026"
    ? ARCHITECTURE_VARIANTS_V2026
    : ARCHITECTURE_VARIANTS_V2025;
}

export { ARCHITECTURE_VARIANTS_V2025, ARCHITECTURE_VARIANTS_V2026, type ArchitectureVariant };

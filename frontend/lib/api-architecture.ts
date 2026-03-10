import { api } from "@/lib/api";
import { getArchitecture } from "@/lib/frameworks/swift-cscf";

export interface ArchitectureTypeFromApi {
  id: string;
  name: string;
  subtitle: string;
  description: string;
}

/**
 * Fetch architecture type metadata from the backend (single source of truth).
 * Falls back to static getArchitecture() when the API is unavailable or returns 404.
 */
export async function getArchitectureTypeFromApi(id: string | null | undefined): Promise<ArchitectureTypeFromApi | null> {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  if (!trimmed) return null;
  try {
    const data = await api.get<ArchitectureTypeFromApi>(`/ref/architecture-types/${encodeURIComponent(trimmed)}`);
    return data;
  } catch {
    const fallback = getArchitecture(trimmed);
    if (!fallback) return null;
    return {
      id: fallback.id,
      name: fallback.name,
      subtitle: fallback.subtitle,
      description: fallback.description,
    };
  }
}

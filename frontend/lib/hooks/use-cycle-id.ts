"use client";

import { usePathname } from "next/navigation";

/**
 * Extracts the cycle ID from the current path when under /cycles/[cycleId]/...
 * Use this so all cycle-scoped pages and the sidebar use the same cycle from the URL.
 */
export function useCycleIdFromPath(): string | null {
  const pathname = usePathname();
  if (!pathname || typeof pathname !== "string") return null;
  const match = pathname.match(/^\/cycles\/([^/]+)/);
  return match ? match[1] : null;
}

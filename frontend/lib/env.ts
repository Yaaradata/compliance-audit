/**
 * Central config for backend API URL.
 * Used by next.config.ts (rewrites) and lib/api.ts (direct/long-running requests).
 * Set NEXT_PUBLIC_BACKEND_URL in .env (e.g. http://127.0.0.1:8000).
 */

const DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:8000";
const API_PATH = "/api/v1";

function getBackendOrigin(): string {
  const raw =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!raw || typeof raw !== "string") return DEFAULT_BACKEND_ORIGIN;
  return raw.replace(/\/+$/, "");
}

/**
 * Full backend API base URL (origin + /api/v1).
 * Use for rewrites destination and for direct fetch (e.g. postDirect, export).
 */
export function getBackendUrl(): string {
  return `${getBackendOrigin()}${API_PATH}`;
}

export { getBackendOrigin, API_PATH, DEFAULT_BACKEND_ORIGIN };

import { getBackendUrl } from "./env";

/** Relative API path; requests go through Next.js rewrite to backend. */
const BASE_URL = "/api/v1";

/** Full backend API URL for direct calls (long timeouts, bypass proxy). */
function getBackendDirectUrl(): string {
  return getBackendUrl();
}

const TOKEN_KEY = "swift_compliance_token";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const msg = err.detail || "Request failed";
      const status = res.status;
      const error = new Error(status === 404 ? `${msg} (${status})` : msg) as Error & { status?: number; path?: string };
      error.status = status;
      error.path = path;
      throw error;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  /**
   * GET the backend directly (bypassing Next.js rewrite proxy) with a long
   * timeout. Use for slow endpoints that hit the proxy timeout (e.g. list reviews).
   */
  async getDirect<T>(path: string, timeoutMs = 60_000): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${getBackendDirectUrl()}${path}`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const msg = err.detail || "Request failed";
      const status = res.status;
      const error = new Error(status === 404 ? `${msg} (${status})` : msg) as Error & { status?: number; path?: string };
      error.status = status;
      error.path = path;
      throw error;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  /**
   * Call the backend directly (bypassing Next.js rewrite proxy) with a long
   * timeout. Use for slow operations like AI evaluation that exceed the proxy's
   * default ~30 s timeout.
   */
  async postDirect<T>(path: string, body?: unknown, timeoutMs = 180_000): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${getBackendDirectUrl()}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const msg = err.detail || "Request failed";
      const status = res.status;
      const error = new Error(status === 404 ? `${msg} (${status})` : msg) as Error & { status?: number; path?: string; response?: { data?: unknown; status?: number } };
      error.status = status;
      error.path = path;
      error.response = { data: err, status };
      throw error;
    }

    return res.json();
  }

  async upload<T>(path: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const msg = err.detail || "Upload failed";
      const status = res.status;
      const error = new Error(status === 404 ? `${msg} (${status})` : msg) as Error & { status?: number; path?: string };
      error.status = status;
      error.path = path;
      throw error;
    }

    return res.json();
  }

  get<T>(path: string) { return this.request<T>("GET", path); }
  post<T>(path: string, body?: unknown) { return this.request<T>("POST", path, body); }
  put<T>(path: string, body?: unknown) { return this.request<T>("PUT", path, body); }
  patch<T>(path: string, body?: unknown) { return this.request<T>("PATCH", path, body); }
  del<T>(path: string) { return this.request<T>("DELETE", path); }

  /** Fetch a file as Blob (e.g. for evidence attachments). Uses same auth as request(). */
  async getBlob(path: string): Promise<Blob> {
    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { method: "GET", headers });

    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error(res.statusText || "Request failed");
    return res.blob();
  }
}

export const api = new ApiClient();

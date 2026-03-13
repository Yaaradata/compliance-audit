/** Format FastAPI validation error detail (string or array of {loc, msg}) for display. */
function formatApiErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e: { loc?: unknown[]; msg?: string }) => `${(e.loc || []).join(".")}: ${e.msg || ""}`)
      .join("; ");
  }
  return "Request failed";
}

/** Relative API path; requests go through Next.js rewrite to backend. */
const BASE_URL = "/api/v1";

/** Full backend API URL for direct calls (long timeouts). From .env NEXT_PUBLIC_BACKEND_URL. */
function getBackendApiUrl(): string {
  const origin = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) || "";
  const trimmed = origin.replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL is required. Add it to frontend/.env (e.g. NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000)"
    );
  }
  return `${trimmed}/api/v1`;
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
      const msg = formatApiErrorDetail(err.detail);
      const status = res.status;
      const error = new Error(status === 404 ? `${msg} (${status})` : msg) as Error & { status?: number; path?: string; detail?: unknown };
      error.status = status;
      error.path = path;
      error.detail = err.detail;
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

    const res = await fetch(`${getBackendApiUrl()}${path}`, {
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
      const msg = formatApiErrorDetail(err.detail);
      const status = res.status;
      const error = new Error(status === 404 ? `${msg} (${status})` : msg) as Error & { status?: number; path?: string; detail?: unknown };
      error.status = status;
      error.path = path;
      error.detail = err.detail;
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

    const res = await fetch(`${getBackendApiUrl()}${path}`, {
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
      const msg = formatApiErrorDetail(err.detail);
      const status = res.status;
      const error = new Error(status === 404 ? `${msg} (${status})` : msg) as Error & { status?: number; path?: string; detail?: unknown; response?: { data?: unknown; status?: number } };
      error.status = status;
      error.path = path;
      error.detail = err.detail;
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
      const msg = formatApiErrorDetail(err.detail);
      const status = res.status;
      const error = new Error(status === 404 ? `${msg} (${status})` : msg) as Error & { status?: number; path?: string; detail?: unknown };
      error.status = status;
      error.path = path;
      error.detail = err.detail;
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

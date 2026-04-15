"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2, Trash2, Cloud, AlertCircle, ChevronRight } from "lucide-react";
import {
  AwsPageHeader,
  awsButtonSecondaryClass,
  awsButtonPrimaryClass,
} from "@/components/aws/aws-page-header";
import { useAuth } from "@/lib/auth-context";
import {
  getAzureConfig,
  saveAzureContext,
  testAzureCredentials,
  deleteAllAzureEvidence,
  disconnectAzureOAuth,
  type AzureConfigResponse,
} from "@/lib/azure-api";

function formatUnlocked(c: AzureConfigResponse | null): boolean {
  if (!c) return false;
  return Boolean(typeof c.dashboard_unlocked === "boolean" ? c.dashboard_unlocked : c.configured);
}

export default function AzureConnectPage() {
  const router = useRouter();
  const { activeCycleId } = useAuth();
  const [config, setConfig] = useState<AzureConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  /** True while save-then-navigate to Microsoft sign-in page is in progress. */
  const [saveAndOauthBusy, setSaveAndOauthBusy] = useState(false);
  const [disconnectingOauth, setDisconnectingOauth] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    azure_subscription_id: "",
    azure_tenant_id: "",
  });

  const load = useCallback((opts?: { silent?: boolean }): Promise<void> => {
    if (!opts?.silent) setLoading(true);
    return getAzureConfig(activeCycleId)
      .then((c) => {
        setConfig(c);
        setForm({
          azure_subscription_id: c.azure_subscription_id ?? "",
          azure_tenant_id: c.azure_tenant_id ?? "",
        });
      })
      .catch(() => setConfig(null))
      .finally(() => {
        if (!opts?.silent) setLoading(false);
      });
  }, [activeCycleId]);

  const redirectIfAzureReady = useCallback(
    async (cycleId: string | null | undefined) => {
      const id = (cycleId || "").trim();
      if (!id) return;
      try {
        const c = await getAzureConfig(id);
        if (formatUnlocked(c)) router.push("/azure/dashboard");
      } catch {
        /* ignore */
      }
    },
    [router]
  );

  useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const st = p.get("azure_oauth");
    if (st === "success") {
      setMessage({
        type: "success",
        text: "Microsoft sign-in completed. If verification succeeded, you can open the dashboard.",
      });
      void load().then(() => redirectIfAzureReady(activeCycleId));
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (st === "error") {
      const msg = p.get("message");
      setMessage({
        type: "error",
        text: msg ? decodeURIComponent(msg.replace(/\+/g, " ")) : "Microsoft sign-in did not complete.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [load, redirectIfAzureReady, activeCycleId]);

  /** Save subscription + tenant, then open the dedicated Microsoft sign-in page (step 2). */
  const onSaveAndSignInMicrosoft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCycleId) return;
    setMessage(null);
    const sub = form.azure_subscription_id.trim();
    const tid = form.azure_tenant_id.trim();
    if (!sub || !tid) {
      setMessage({ type: "error", text: "Subscription ID and Microsoft Entra tenant ID are required." });
      return;
    }
    setSaveAndOauthBusy(true);
    saveAzureContext(activeCycleId, { azure_subscription_id: sub, azure_tenant_id: tid })
      .then(() => router.push("/azure/sign-in"))
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Save or sign-in failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setSaveAndOauthBusy(false));
  };

  const onDisconnectMicrosoft = () => {
    if (!activeCycleId) return;
    if (!confirm("Disconnect Microsoft sign-in for this cycle? You will need to sign in again to use delegated access.")) return;
    setMessage(null);
    setDisconnectingOauth(true);
    disconnectAzureOAuth(activeCycleId)
      .then(() => {
        setMessage({ type: "success", text: "Microsoft sign-in disconnected." });
        load();
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Disconnect failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setDisconnectingOauth(false));
  };

  const onDisconnect = () => {
    if (
      !confirm(
        "This will disconnect Azure for this cycle and permanently delete all Azure evidence and collector run data. This cannot be undone. Continue?"
      )
    )
      return;
    setMessage(null);
    setDisconnecting(true);
    deleteAllAzureEvidence(activeCycleId)
      .then((res) => {
        setMessage({
          type: "success",
          text: `Removed ${res.deleted_evidence ?? 0} evidence row(s) and ${res.deleted_runs ?? 0} run(s). Azure connection cleared for this cycle.`,
        });
        load();
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Failed to disconnect.";
        setMessage({ type: "error", text });
      })
      .finally(() => setDisconnecting(false));
  };

  const onTestConnection = () => {
    if (!activeCycleId) return;
    setMessage(null);
    setTesting(true);
    testAzureCredentials(activeCycleId)
      .then((res) => {
        setMessage({
          type: "success",
          text: res.message || `Connection OK. Subscription: ${res.subscription_id ?? "—"}`,
        });
        void load({ silent: true }).then(() => redirectIfAzureReady(activeCycleId));
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Connection failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setTesting(false));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCycleId) return;
    setMessage(null);
    const sub = form.azure_subscription_id.trim();
    const tid = form.azure_tenant_id.trim();
    if (!sub || !tid) {
      setMessage({ type: "error", text: "Subscription ID and Microsoft Entra tenant ID are required." });
      return;
    }

    setSaving(true);
    saveAzureContext(activeCycleId, {
      azure_subscription_id: sub,
      azure_tenant_id: tid,
    })
      .then((res) => {
        const base = res.message || "Azure scope saved.";
        setMessage({
          type: "success",
          text: oauthEnv
            ? `${base} Continue to step 2 (Microsoft sign-in page) when ready—you will return to the dashboard when OAuth completes.`
            : `${base} Run Test connection, then collect evidence from the dashboard.`,
        });
        load();
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Save failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <>
        <AwsPageHeader
          title="Connect"
          subtitle="One platform Entra integration—you enter your subscription and tenant, then sign in or use server credentials."
        />
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-16">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "var(--muted)", color: "var(--primary)" }}
          >
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Checking connection…
          </p>
        </div>
      </>
    );
  }

  const unlocked = formatUnlocked(config);
  const oauthEnv = Boolean(config?.azure_oauth_env_configured);
  const serverSpReady = Boolean(
    config?.env_service_principal_available || config?.service_principal_saved || oauthEnv
  );
  const scopeSavedOnServer = Boolean(
    (config?.azure_subscription_id || "").trim() && (config?.azure_tenant_id || "").trim()
  );
  const scopeFormMatchesSaved =
    scopeSavedOnServer &&
    form.azure_subscription_id.trim() === (config?.azure_subscription_id || "").trim() &&
    form.azure_tenant_id.trim() === (config?.azure_tenant_id || "").trim();
  if (unlocked && config) {
    return (
      <>
        <AwsPageHeader
          title="Connect"
          subtitle="Your subscription and tenant are saved; collection uses the platform app plus your scope (and your sign-in or API identity)."
        />
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div
            className="card rounded-xl border p-6 flex flex-col gap-5"
            style={{ borderColor: "var(--success)", background: "var(--success-bg, rgba(34,197,94,0.06))" }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-8 w-8 shrink-0" style={{ color: "var(--success)" }} />
                <div>
                  <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                    Azure ready for evidence collection
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Subscription:{" "}
                    <strong style={{ color: "var(--foreground)" }}>{config.azure_subscription_id ?? "—"}</strong>
                    {" · "}
                    Tenant: <strong style={{ color: "var(--foreground)" }}>{config.azure_tenant_id ?? "—"}</strong>
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--foreground-muted)" }}>
                    {config.entra_signin_username
                      ? `Signed in as ${config.entra_signin_username} (delegated access).`
                      : config.env_service_principal_available
                        ? "API server is using AZURE_CLIENT_ID and AZURE_CLIENT_SECRET (tenant from this page if AZURE_TENANT_ID is not set on the server)."
                        : config.service_principal_saved
                          ? "Using app credentials stored for this cycle from an earlier setup."
                          : "Using managed identity or DefaultAzureCredential on the API server."}
                  </p>
                  <p className="text-xs mt-2 opacity-90" style={{ color: "var(--foreground-muted)" }}>
                    All customers use the same platform Microsoft integration on this server; the subscription and tenant above are{" "}
                    <strong>your</strong> scope for this cycle.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {oauthEnv && config.entra_oauth_connected && (
                  <button
                    type="button"
                    disabled={disconnectingOauth}
                    onClick={onDisconnectMicrosoft}
                    className={awsButtonSecondaryClass}
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                  >
                    {disconnectingOauth ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {disconnectingOauth ? "Disconnecting…" : "Disconnect Microsoft sign-in"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={testing}
                  onClick={onTestConnection}
                  className={awsButtonSecondaryClass}
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {testing ? "Testing…" : "Test connection"}
                </button>
                <button
                  type="button"
                  disabled={disconnecting}
                  onClick={onDisconnect}
                  className={awsButtonSecondaryClass}
                  style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "transparent" }}
                  title="Disconnect and delete all Azure evidence data for this cycle"
                >
                  {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {disconnecting ? "Disconnecting…" : "Disconnect & delete evidence"}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/azure/dashboard" className={awsButtonPrimaryClass}>
                Open dashboard
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {message && (
            <div
              className="rounded-lg border px-4 py-3 text-sm"
              style={{
                borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
                background: message.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
                color: message.type === "success" ? "var(--success)" : "var(--danger)",
              }}
            >
              {message.text}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <AwsPageHeader
        title="Connect"
        subtitle={
          oauthEnv
            ? "Step 1 — this page: optional subscription and tenant. Step 2 — Microsoft sign-in page: complete OAuth; subscription and tenant are detected, then you return to the dashboard."
            : "Enter your subscription and tenant, then run Test connection."
        }
      />
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {!activeCycleId && (
          <div
            className="rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}
          >
            Select an assessment cycle first. Azure connection is maintained per cycle.
          </div>
        )}
        {config && !serverSpReady && (
          <div
            className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--border)",
              background: "var(--muted)",
              color: "var(--foreground)",
            }}
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
            <div className="min-w-0 space-y-1">
              <p className="font-medium" style={{ color: "var(--foreground)" }}>
                API server authentication
              </p>
              <p className="text-xs sm:text-sm" style={{ color: "var(--foreground-muted)" }}>
                {oauthEnv ? (
                  <>
                    Sign in uses the platform’s <strong>one</strong> Entra app (<code className="font-mono text-[11px] sm:text-xs">AZURE_OAUTH_*</code> on
                    the API). After Microsoft login, the API lists subscriptions your account can access and saves the first enabled
                    one (or the subscription you saved manually before sign-in). Customers do not paste app secrets into this UI.
                  </>
                ) : (
                  <>
                    Set <code className="font-mono text-[11px] sm:text-xs">AZURE_CLIENT_ID</code> and{" "}
                    <code className="font-mono text-[11px] sm:text-xs">AZURE_CLIENT_SECRET</code> on the API (e.g.{" "}
                    <code className="font-mono text-[11px] sm:text-xs">backend/.env</code>), or configure{" "}
                    <code className="font-mono text-[11px] sm:text-xs">AZURE_OAUTH_*</code> for Microsoft sign-in.{" "}
                    <code className="font-mono text-[11px] sm:text-xs">AZURE_TENANT_ID</code> is optional if it matches the
                    tenant below. Grant the calling identity <strong>Reader</strong> on the subscription. Managed identity works
                    when the API runs in Azure.
                  </>
                )}
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section className="card rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <Cloud className="w-5 h-5" style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {oauthEnv ? "Step 1 · Optional subscription & tenant" : "Your Azure scope (subscription + tenant)"}
              </h2>
            </div>
            <form onSubmit={onSubmit} className="space-y-5 pt-4">
              {oauthEnv && (
                <p className="text-xs rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}>
                  <strong>Step 2</strong> is the{" "}
                  <Link href="/azure/sign-in" className="underline font-medium" style={{ color: "var(--primary)" }}>
                    Microsoft sign-in page
                  </Link>
                  . Skip this block to let OAuth discover subscription and tenant. Use these fields to lock a <strong>specific</strong>{" "}
                  subscription (save before step 2) or for <strong>service principal / Test connection</strong> without OAuth.
                </p>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
                  Subscription ID (GUID)
                </label>
                <input
                  type="text"
                  value={form.azure_subscription_id}
                  onChange={(e) => setForm((f) => ({ ...f, azure_subscription_id: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm font-mono"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
                  Microsoft Entra tenant ID (directory GUID)
                </label>
                <input
                  type="text"
                  value={form.azure_tenant_id}
                  onChange={(e) => setForm((f) => ({ ...f, azure_tenant_id: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm font-mono"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  autoComplete="off"
                />
              </div>
              {message && (
                <div
                  className="rounded-lg border px-4 py-3 text-sm"
                  style={{
                    borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
                    background: message.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
                    color: message.type === "success" ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {message.text}
                </div>
              )}
              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saveAndOauthBusy || saving || !activeCycleId}
                  className={`w-full ${oauthEnv ? awsButtonSecondaryClass : awsButtonPrimaryClass}`}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {oauthEnv
                    ? saving
                      ? "Saving…"
                      : "Save scope (service principal / lock subscription before sign-in)"
                    : saving
                      ? "Saving…"
                      : "Save scope"}
                </button>
                {oauthEnv && (
                  <button
                    type="button"
                    disabled={saveAndOauthBusy || saving || !activeCycleId}
                    onClick={onSaveAndSignInMicrosoft}
                    className={`w-full ${awsButtonSecondaryClass}`}
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                  >
                    {saveAndOauthBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {saveAndOauthBusy ? "Saving…" : "Save these IDs, then go to Microsoft sign-in (step 2)"}
                  </button>
                )}
              </div>
              {oauthEnv && scopeSavedOnServer && !scopeFormMatchesSaved && (
                <p className="text-xs" style={{ color: "var(--warning)" }}>
                  The form differs from what is saved on the server. Click <strong>Save scope</strong> if you want these IDs used on{" "}
                  <strong>step 2</strong> (Microsoft sign-in), or go to step 2 without saving to keep the server’s current subscription.
                </p>
              )}
              {oauthEnv && config?.entra_oauth_connected && (
                <div className="flex flex-col gap-2 rounded-lg border p-4" style={{ borderColor: "var(--success)", background: "var(--success-bg, rgba(34,197,94,0.06))" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                    Microsoft sign-in connected
                  </p>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    {config.entra_signin_username
                      ? `Signed in as ${config.entra_signin_username}.`
                      : "Delegated tokens are stored for this cycle."}
                  </p>
                  <button
                    type="button"
                    disabled={disconnectingOauth}
                    onClick={onDisconnectMicrosoft}
                    className={`w-full ${awsButtonSecondaryClass}`}
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                  >
                    {disconnectingOauth ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {disconnectingOauth ? "Disconnecting…" : "Disconnect Microsoft sign-in"}
                  </button>
                </div>
              )}
              {activeCycleId && form.azure_subscription_id.trim() && form.azure_tenant_id.trim() && (
                <button
                  type="button"
                  disabled={testing}
                  onClick={onTestConnection}
                  className={`w-full ${awsButtonSecondaryClass}`}
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {testing ? "Testing…" : oauthEnv ? "3 · Test connection (if not already verified)" : "Test connection (Resource Graph)"}
                </button>
              )}
            </form>
          </section>

          <section className="card rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              How this works
            </h2>
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm" style={{ color: "var(--foreground-muted)" }}>
              <li>
                The product uses <strong>one</strong> platform integration on the API. With OAuth, open the{" "}
                <strong>Microsoft sign-in</strong> page (step 2) to complete authorization; or enter <strong>Subscription</strong> and{" "}
                <strong>Tenant</strong> IDs for a service principal.
              </li>
              {oauthEnv ? (
                <>
                  <li>
                    Operators register one Entra app (<code className="font-mono">AZURE_OAUTH_*</code>): redirect URI must point to the
                    API callback, plus delegated <strong>Azure Service Management → user_impersonation</strong> and{" "}
                    <code className="font-mono">offline_access</code>. Single-tenant apps can set{" "}
                    <code className="font-mono">AZURE_OAUTH_LOGIN_TENANT</code> on the API only if the app is single-tenant and sign-in fails.
                  </li>
                  <li>
                    After Microsoft redirects back you land on the <strong>dashboard</strong>. If it stays locked, run{" "}
                    <strong>Test connection</strong> on this page. The API can instead use <code className="font-mono">AZURE_CLIENT_ID</code>{" "}
                    / secret or managed identity.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>Alternatively</strong> to OAuth: set <code className="font-mono">AZURE_OAUTH_*</code> on the API for Sign
                    in with Microsoft, or use <code className="font-mono">AZURE_CLIENT_ID</code> /{" "}
                    <code className="font-mono">AZURE_CLIENT_SECRET</code> / managed identity—grant <strong>Reader</strong> on the
                    subscription.
                  </li>
                  <li>
                    <strong>Save scope</strong>, then <strong>Test connection</strong>. Open the <strong>Dashboard</strong> to
                    collect evidence.
                  </li>
                </>
              )}
            </ol>
          </section>

          {oauthEnv && !config?.entra_oauth_connected && (
            <section
              className="card rounded-xl border p-6 md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--primary)", background: "var(--surface)" }}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--primary)" }}>
                  Step 2 of 2
                </p>
                <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                  Microsoft sign-in (OAuth)
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: "var(--foreground-muted)" }}>
                  Continue on the next page to sign in at Microsoft. Your subscription and tenant are detected automatically unless you
                  saved specific IDs above. You need an account with access to the target subscription (e.g. Reader).
                </p>
              </div>
              {activeCycleId ? (
                <Link
                  href="/azure/sign-in"
                  className={`inline-flex shrink-0 items-center justify-center gap-2 min-h-[44px] px-6 ${awsButtonPrimaryClass}`}
                >
                  Continue to Microsoft sign-in
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span
                  className="inline-flex shrink-0 items-center justify-center min-h-[44px] px-6 rounded-lg text-sm font-medium opacity-50"
                  style={{ border: "1px solid var(--border)", color: "var(--foreground-muted)" }}
                >
                  Select a cycle to continue
                </span>
              )}
            </section>
          )}

          {!oauthEnv && (
            <section
              className="card rounded-xl border p-5 md:col-span-2 text-xs sm:text-sm"
              style={{ borderColor: "var(--border)", background: "var(--muted)" }}
            >
              <p style={{ color: "var(--foreground-muted)" }}>
                <strong style={{ color: "var(--foreground)" }}>Delegated Microsoft sign-in:</strong> when the API has{" "}
                <code className="font-mono text-[11px] sm:text-xs">AZURE_OAUTH_*</code> configured, use{" "}
                <Link href="/azure/sign-in" className="underline font-medium" style={{ color: "var(--primary)" }}>
                  Microsoft sign-in
                </Link>{" "}
                after saving scope here. If OAuth is not enabled, that page explains what to set on the server.
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

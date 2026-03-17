"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, KeyRound, Loader2 } from "lucide-react";
import {
  getAwsCredentials,
  saveAwsCredentials,
  testAwsCredentials,
  startAwsOAuth,
  pollAwsOAuth,
  type AwsCredentialsConfig,
} from "@/lib/aws-api";

const REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
];

function formatConnectedAt(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { dateStyle: "medium" }) + " at " + d.toLocaleTimeString(undefined, { timeStyle: "short" });
}

export default function AwsConnectPage() {
  const [config, setConfig] = useState<AwsCredentialsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    access_key_id: "",
    secret_access_key: "",
    aws_region: "us-east-1",
    aws_account_id: "",
  });
  const [oauthForm, setOauthForm] = useState({ sso_start_url: "", sso_region: "us-east-1" });
  const [oauthState, setOauthState] = useState<{
    verification_uri_complete: string;
    user_code: string;
    device_code: string;
    interval: number;
  } | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setMessage(null);
    getAwsCredentials()
      .then(setConfig)
      .catch(() => setConfig({ has_config: false, aws_region: "us-east-1", aws_account_id: null }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (config) {
      setForm((f) => ({
        ...f,
        aws_region: config.aws_region || "us-east-1",
        aws_account_id: config.aws_account_id || "",
      }));
    }
  }, [config?.aws_region, config?.aws_account_id]);

  const onTestConnection = () => {
    if (!config?.has_config) {
      setMessage({ type: "error", text: "Save credentials first, then test connection." });
      return;
    }
    setMessage(null);
    setTesting(true);
    testAwsCredentials()
      .then((res) => {
        setMessage({
          type: "success",
          text: `Connection OK. Account: ${res.account_id ?? "—"}${res.user_id ? ` · User ID: ${res.user_id}` : ""}`,
        });
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Connection failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setTesting(false));
  };

  const onOAuthStart = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const url = oauthForm.sso_start_url.trim();
    if (!url) {
      setMessage({ type: "error", text: "Enter your AWS IAM Identity Center start URL (e.g. https://my-company.awsapps.com/start)." });
      return;
    }
    setOauthLoading(true);
    startAwsOAuth({ sso_start_url: url, sso_region: oauthForm.sso_region || "us-east-1" })
      .then((res) => {
        setOauthState({
          verification_uri_complete: res.verification_uri_complete,
          user_code: res.user_code,
          device_code: res.device_code,
          interval: Math.max(res.interval || 5, 2),
        });
        setMessage({ type: "success", text: "Open the link below and enter the code. This page will connect automatically once you sign in." });
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Failed to start sign-in.";
        setMessage({ type: "error", text });
      })
      .finally(() => setOauthLoading(false));
  };

  useEffect(() => {
    if (!oauthState) return;
    const poll = () => {
      pollAwsOAuth({ device_code: oauthState.device_code })
        .then((res) => {
          if (res.ok) {
            setOauthState(null);
            setMessage({ type: "success", text: `Connected as ${res.account_name || res.account_id || ""} (${res.role_name || ""}).` });
            load();
          }
        })
        .catch((err: Error & { detail?: unknown }) => {
          const text = typeof err.detail === "string" ? err.detail : err.message || "";
          if (text.includes("AuthorizationPendingException") || text.includes("Waiting for you")) return;
          setOauthState(null);
          setMessage({ type: "error", text: text || "Sign-in failed or expired." });
        });
    };
    pollTimerRef.current = setInterval(poll, oauthState.interval * 1000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [oauthState, load]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!form.access_key_id.trim() || !form.secret_access_key.trim()) {
      setMessage({ type: "error", text: "Access Key ID and Secret Access Key are required." });
      return;
    }
    setSaving(true);
    saveAwsCredentials({
      access_key_id: form.access_key_id.trim(),
      secret_access_key: form.secret_access_key,
      aws_region: form.aws_region || "us-east-1",
      aws_account_id: form.aws_account_id.trim() || undefined,
    })
      .then((res) => {
        setMessage({ type: "success", text: res.message || "Connected. You can now use the Dashboard to collect evidence." });
        setForm((f) => ({ ...f, secret_access_key: "" }));
        load();
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Failed to save credentials.";
        setMessage({ type: "error", text });
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Connect AWS account</div>
        <div className="card rounded-xl p-8 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>Loading…</div>
      </div>
    );
  }

  // Already connected: show success state and links to Dashboard / Evidence / Controls
  if (config?.has_config) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div
          className="rounded-xl border p-6 flex flex-col gap-4"
          style={{ borderColor: "var(--success)", background: "var(--success-muted, rgba(34,197,94,0.06))" }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-8 w-8 shrink-0" style={{ color: "var(--success)" }} />
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Connected to AWS</h2>
              <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                Your AWS account is linked. Region: <strong style={{ color: "var(--foreground)" }}>{config.aws_region}</strong>
                {config.aws_account_id && (
                  <> · Account: <strong style={{ color: "var(--foreground)" }}>{config.aws_account_id}</strong></>
                )}
              </p>
              {config.connected_at && (
                <p className="text-xs mt-2" style={{ color: "var(--foreground-muted)" }}>
                  Connected {formatConnectedAt(config.connected_at)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/aws/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Go to Dashboard
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href="/aws/evidence"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            >
              Evidence
            </Link>
            <Link
              href="/aws/controls"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            >
              Controls
            </Link>
            <Link
              href="/aws/credentials"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
              style={{ color: "var(--foreground-muted)" }}
            >
              <KeyRound className="h-4 w-4" />
              Edit credentials
            </Link>
          </div>
        </div>
        {message && (
          <div
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
              background: message.type === "success" ? "var(--success-muted, rgba(34,197,94,0.08))" : "var(--danger-muted, rgba(239,68,68,0.08))",
              color: message.type === "success" ? "var(--success)" : "var(--danger)",
            }}
          >
            {message.text}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={testing}
            onClick={onTestConnection}
            className="rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-60"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            {testing ? "Testing…" : "Test connection"}
          </button>
        </div>
      </div>
    );
  }

  // Not connected: show SSO (preferred) and access key form
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>Connect your AWS account</h1>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Sign in with AWS IAM Identity Center (SSO) or use access keys. Credentials are stored encrypted and used only for evidence collection.
        </p>
      </header>

      {/* SSO device flow */}
      <div className="card rounded-xl p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Sign in with AWS (SSO)</h2>
        {!oauthState ? (
          <form onSubmit={onOAuthStart} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
                IAM Identity Center start URL
              </label>
              <input
                type="url"
                value={oauthForm.sso_start_url}
                onChange={(e) => setOauthForm((f) => ({ ...f, sso_start_url: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                placeholder="https://my-company.awsapps.com/start"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
                SSO region
              </label>
              <select
                value={oauthForm.sso_region}
                onChange={(e) => setOauthForm((f) => ({ ...f, sso_region: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={oauthLoading}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
              style={{ background: "var(--primary)" }}
            >
              {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {oauthLoading ? "Starting…" : "Start sign-in"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Open this link and enter the code below:
            </p>
            <a
              href={oauthState.verification_uri_complete}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              Open AWS sign-in <ExternalLink className="h-4 w-4" />
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>Code:</span>
              <code className="rounded bg-[var(--surface)] px-3 py-1.5 text-lg font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                {oauthState.user_code}
              </code>
            </div>
            <p className="text-xs flex items-center gap-2" style={{ color: "var(--foreground-muted)" }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Waiting for you to complete sign-in…
            </p>
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Or use access keys:</p>

      <form onSubmit={onSubmit} className="card rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
            Access Key ID
          </label>
          <input
            type="text"
            value={form.access_key_id}
            onChange={(e) => setForm((f) => ({ ...f, access_key_id: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            placeholder="AKIA..."
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
            Secret Access Key
          </label>
          <input
            type="password"
            value={form.secret_access_key}
            onChange={(e) => setForm((f) => ({ ...f, secret_access_key: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
            AWS Region
          </label>
          <select
            value={form.aws_region}
            onChange={(e) => setForm((f) => ({ ...f, aws_region: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
            AWS Account ID <span className="opacity-70">(optional)</span>
          </label>
          <input
            type="text"
            value={form.aws_account_id}
            onChange={(e) => setForm((f) => ({ ...f, aws_account_id: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            placeholder="123456789012"
          />
        </div>
        {message && (
          <div
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
              background: message.type === "success" ? "var(--success-muted, rgba(34,197,94,0.08))" : "var(--danger-muted, rgba(239,68,68,0.08))",
              color: message.type === "success" ? "var(--success)" : "var(--danger)",
            }}
          >
            {message.text}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
            style={{ background: "var(--primary)" }}
          >
            {saving ? "Connecting…" : "Connect AWS account"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAwsCredentials, saveAwsCredentials, testAwsCredentials, type AwsCredentialsConfig } from "@/lib/aws-api";

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

export default function AwsCredentialsPage() {
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
        setMessage({ type: "success", text: res.message || "Credentials saved. You can now fetch AWS evidence from the Dashboard." });
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
        <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AWS credentials</div>
        <div className="card rounded-xl p-8 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <div className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>AWS credentials</div>
        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          Enter your AWS Access Key and Secret to collect evidence from your account. Credentials are encrypted and used only for evidence collection.
        </p>
      </header>

      {config?.has_config && (
        <div className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--success)", background: "var(--success-muted, rgba(34,197,94,0.08))", color: "var(--foreground)" }}>
          <strong>Credentials are configured.</strong> Region: {config.aws_region}
          {config.aws_account_id && ` · Account: ${config.aws_account_id}`}
          {" "}
          <Link href="/aws/dashboard" className="underline" style={{ color: "var(--primary)" }}>Go to Dashboard</Link> to fetch evidence.
        </div>
      )}

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
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60"
            style={{ background: "var(--primary)" }}
          >
            {saving ? "Saving…" : "Save credentials"}
          </button>
          <button
            type="button"
            disabled={testing || !config?.has_config}
            onClick={onTestConnection}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-60"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            {testing ? "Testing…" : "Test connection"}
          </button>
          <Link
            href="/aws"
            className="text-sm font-medium"
            style={{ color: "var(--foreground-muted)" }}
          >
            Back to Connect
          </Link>
          <Link
            href="/aws/dashboard"
            className="text-sm font-medium"
            style={{ color: "var(--primary)" }}
          >
            Dashboard
          </Link>
        </div>
      </form>
    </div>
  );
}

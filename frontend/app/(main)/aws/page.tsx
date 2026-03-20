"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Loader2, Trash2, Cloud, Shield, MapPin } from "lucide-react";
import { AwsPageHeader, awsButtonSecondaryClass, awsButtonPrimaryClass } from "@/components/aws/aws-page-header";
import { useAuth } from "@/lib/auth-context";
import {
  getAwsCredentialsForCycle,
  saveAwsConnect,
  deleteAwsConnect,
  testAwsCredentials,
  markAwsConnectionForCycle,
  clearAwsConnectionCycleMarker,
  type AwsCredentialsConfig,
} from "@/lib/aws-api";
import { AWS_REGIONS } from "@/lib/aws-regions";

function formatConnectedAt(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { dateStyle: "medium" }) + " at " + d.toLocaleTimeString(undefined, { timeStyle: "short" });
}

export default function AwsConnectPage() {
  const { activeCycleId } = useAuth();
  const [config, setConfig] = useState<AwsCredentialsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    role_arn: "",
    region: "us-east-1",
  });

  const load = useCallback(() => {
    setLoading(true);
    setMessage(null);
    getAwsCredentialsForCycle(activeCycleId)
      .then(setConfig)
      .catch(() => setConfig({ has_config: false, aws_region: "us-east-1", aws_account_id: null }))
      .finally(() => setLoading(false));
  }, [activeCycleId]);

  useEffect(() => {
    load();
  }, [load]);

  const onDisconnect = () => {
    if (!config?.has_config) return;
    if (!confirm("This will disconnect your AWS account and permanently delete all evidence and collector run data for this tenant. This cannot be undone. Continue?")) return;
    setMessage(null);
    setDisconnecting(true);
    deleteAwsConnect()
      .then((res) => {
        clearAwsConnectionCycleMarker();
        setMessage({
          type: "success",
          text: res.message || "Disconnected. All evidence data has been deleted.",
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
    if (!config?.has_config) return;
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
    const roleArn = form.role_arn.trim();
    if (!roleArn) {
      setMessage({ type: "error", text: "Role ARN is required." });
      return;
    }
    setSaving(true);
    saveAwsConnect({
      role_arn: roleArn,
      region: form.region || "us-east-1",
    })
      .then((res) => {
        markAwsConnectionForCycle(activeCycleId);
        setMessage({ type: "success", text: res.message || "Validated and connected." });
        load();
        if (typeof window !== "undefined") window.dispatchEvent(new Event("aws-connection-changed"));
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Validation failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <>
        <AwsPageHeader title="Connect" subtitle="Connect your AWS account to collect evidence for SWIFT controls." />
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--muted)", color: "var(--primary)" }}>
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Checking connection…</p>
          <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>Loading…</p>
        </div>
      </>
    );
  }

  if (config?.has_config) {
    return (
      <>
        <AwsPageHeader title="Connect" subtitle="Your AWS account connection status and quick links." />
        <div className="w-full max-w-4xl mx-auto space-y-6">
        <div
          className="card rounded-xl border p-6 flex flex-col gap-5"
          style={{ borderColor: "var(--success)", background: "var(--success-bg, rgba(34,197,94,0.06))" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-8 w-8 shrink-0" style={{ color: "var(--success)" }} />
              <div>
                <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Connected to AWS</h2>
                <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                  {config.connection_type === "assume_role" && config.role_arn ? (
                    <>Role: <strong style={{ color: "var(--foreground)" }}>{config.role_arn}</strong></>
                  ) : (
                    <>Account: <strong style={{ color: "var(--foreground)" }}>{config.aws_account_id}</strong></>
                  )}
                  {" · "}
                  Region: <strong style={{ color: "var(--foreground)" }}>{config.aws_region}</strong>
                </p>
                {config.connected_at && (
                  <p className="text-xs mt-2" style={{ color: "var(--foreground-muted)" }}>
                    Connected {formatConnectedAt(config.connected_at)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
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
                title="Disconnect and delete all evidence data"
              >
                {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {disconnecting ? "Disconnecting…" : "Disconnect & delete all evidence"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/aws/dashboard" className={awsButtonPrimaryClass}>
              Go to Dashboard
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href="/aws/evidence"
              className={awsButtonSecondaryClass}
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            >
              Evidence
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
        subtitle="Enter your IAM Role ARN and region. We validate with AssumeRole and run read-only audits. Your role must trust this platform and use the configured External ID (e.g. Swift-Audit)."
      />
      <div className="w-full max-w-4xl mx-auto space-y-6">
      {!activeCycleId && (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}>
          Select an assessment cycle first. AWS connection is maintained per cycle.
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="card rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
            <Shield className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Connection details</h2>
          </div>
          <form onSubmit={onSubmit} className="space-y-5 pt-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground-muted)" }}>
                Role ARN
              </label>
              <input
                type="text"
                value={form.role_arn}
                onChange={(e) => setForm((f) => ({ ...f, role_arn: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2.5 text-sm font-mono"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                placeholder="arn:aws:iam::123456789012:role/AuditPlatformReadOnlyRole"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--foreground-muted)" }}>
                <MapPin className="w-3.5 h-3.5" />
                AWS Region
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              >
                {AWS_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
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
            <div className="pt-1">
              <button
                type="submit"
                disabled={saving}
                className={`w-full ${awsButtonPrimaryClass}`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Validating…" : "Validate & Connect"}
              </button>
            </div>
          </form>
        </section>

        <section className="card rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>How to set up the IAM role</h2>
          <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm" style={{ color: "var(--foreground-muted)" }}>
            <li>In your AWS account, go to <strong>IAM → Roles → Create role</strong>.</li>
            <li>Create a role for this platform (for example, <code className="font-mono">AuditPlatformReadOnlyRole</code>).</li>
            <li>Set the trust relationship to allow the platform&apos;s AWS account and External ID configured with the product.</li>
            <li>Attach a read-only policy (e.g. <code className="font-mono">ReadOnlyAccess</code> or a custom, least-privilege policy).</li>
            <li>Copy the <strong>Role ARN</strong> and paste it into the form on the left, then choose the AWS region and connect.</li>
          </ol>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            After connecting, you&apos;ll be able to fetch AWS evidence and review evidence from the Dashboard.
          </p>
        </section>
      </div>
      </div>
    </>
  );
}

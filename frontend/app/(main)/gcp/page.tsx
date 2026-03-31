"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Loader2, Trash2, Cloud } from "lucide-react";
import {
  AwsPageHeader,
  awsButtonSecondaryClass,
  awsButtonPrimaryClass,
} from "@/components/aws/aws-page-header";
import { useAuth } from "@/lib/auth-context";
import { getGcpConfig, testGcpCredentials, deleteAllGcpEvidence } from "@/lib/gcp-api";

export default function GcpConnectPage() {
  const { activeCycleId } = useAuth();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    setMessage(null);
    getGcpConfig(activeCycleId)
      .then((c) => {
        setConfigured(c.configured);
        setProjectId(c.project_id);
      })
      .catch(() => {
        setConfigured(false);
        setProjectId(null);
      });
  }, [activeCycleId]);

  useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, [load]);

  const onTestConnection = () => {
    if (!configured) return;
    setMessage(null);
    setTesting(true);
    testGcpCredentials(activeCycleId)
      .then((res) => {
        setMessage({
          type: "success",
          text: res.message || (res.ok ? "Connection OK — can read project IAM with current backend credentials." : "Failed"),
        });
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Connection failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setTesting(false));
  };

  const onDeleteAll = () => {
    if (!activeCycleId) return;
    if (
      !confirm(
        "Delete all GCP evidence and collector runs for this assessment cycle? This cannot be undone."
      )
    )
      return;
    setMessage(null);
    setDeleting(true);
    deleteAllGcpEvidence(activeCycleId)
      .then((res) => {
        setMessage({
          type: "success",
          text: `Deleted ${res.deleted_evidence} evidence row(s) and ${res.deleted_runs} run(s).`,
        });
        if (typeof window !== "undefined") window.dispatchEvent(new Event("gcp-collection-completed"));
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Delete failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setDeleting(false));
  };

  if (configured === null) {
    return (
      <>
        <AwsPageHeader
          title="Connect"
          subtitle="Link Google Cloud evidence collection to this assessment cycle. The backend uses Application Default Credentials and GCP_EVIDENCE_PROJECT_ID."
        />
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-16">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "var(--muted)", color: "var(--primary)" }}
          >
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Checking configuration…
          </p>
        </div>
      </>
    );
  }

  if (configured) {
    return (
      <>
        <AwsPageHeader title="Connect" subtitle="Google Cloud target project and backend credential status." />
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
                    GCP evidence configured
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Project:{" "}
                    <strong className="font-mono" style={{ color: "var(--foreground)" }}>
                      {projectId}
                    </strong>
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--foreground-muted)" }}>
                    Credentials are not stored in the browser. Set <code className="text-xs">GOOGLE_APPLICATION_CREDENTIALS</code> or
                    workload identity on the API host.
                  </p>
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
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/gcp/dashboard" className={awsButtonPrimaryClass}>
                Go to Dashboard
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Link
                href="/gcp/evidence"
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
          <section
            className="card rounded-xl border p-5"
            style={{ borderColor: "var(--border)" }}
            aria-label="Danger zone"
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--danger)" }}>
              Reset cycle data
            </h2>
            <p className="text-xs mb-3" style={{ color: "var(--foreground-muted)" }}>
              Remove all GCP evidence rows and collector runs for this assessment cycle only (same tenant scope as AWS).
            </p>
            <button
              type="button"
              disabled={deleting || !activeCycleId}
              onClick={onDeleteAll}
              className={awsButtonSecondaryClass}
              style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "transparent" }}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? "Deleting…" : "Delete all GCP evidence for this cycle"}
            </button>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <AwsPageHeader
        title="Connect"
        subtitle="The backend must have GCP_EVIDENCE_PROJECT_ID set and valid Application Default Credentials. No secrets are entered in this app."
      />
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {!activeCycleId && (
          <div
            className="rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}
          >
            Select an assessment cycle first. Evidence is scoped per cycle.
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section className="card rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <Cloud className="w-5 h-5" style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Configuration required
              </h2>
            </div>
            <p className="pt-4 text-sm" style={{ color: "var(--foreground-muted)" }}>
              Set <code className="text-xs font-mono">GCP_EVIDENCE_PROJECT_ID</code> in <code className="text-xs">backend/.env</code> and
              restart the API. Ensure the runtime service account (or ADC user) can call the collector APIs for that project.
            </p>
            {message && (
              <div
                className="mt-4 rounded-lg border px-4 py-3 text-sm"
                style={{
                  borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
                  background: message.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
                  color: message.type === "success" ? "var(--success)" : "var(--danger)",
                }}
              >
                {message.text}
              </div>
            )}
          </section>
          <section className="card rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              How it works
            </h2>
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm" style={{ color: "var(--foreground-muted)" }}>
              <li>
                Configure the backend with a Google Cloud project ID and credentials (service account JSON or gcloud ADC).
              </li>
              <li>Grant the identity read-only roles needed for Security Command Center, Compute, IAM, Logging, and other APIs.</li>
              <li>Open <strong>Dashboard</strong> and run <strong>Fetch GCP evidence</strong> after configuration shows as connected.</li>
            </ol>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              See your deployment guide for IAM roles and enabled APIs.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
